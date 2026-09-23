const encoder = new TextEncoder();
const tokenCache = new Map();
const PRODUCT_FIELDS = ['id', 'title', 'badge', 'badgeIcon', 'priceINR', 'priceUSD', 'creators', 'features', 'platforms', 'order', 'images'];
const ORDER_METHODS = new Set(['UPI', 'BTC Bitcoin', 'USDT BEP-20', 'Binance Gift Card', 'PayPal', 'USDT TRC-20']);

function json(status, value, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}

function noContent(headers = {}) {
  return new Response(null, { status: 204, headers });
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function utf8Base64Url(value) {
  return base64Url(encoder.encode(value));
}

function decodeBase64(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function parseCookie(request, name) {
  const cookies = request.headers.get('Cookie') || '';
  const entry = cookies.split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
}

function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || new URL(origin).host === new URL(request.url).host;
}

function envValue(env, name) {
  return typeof env[name] === 'string' ? env[name] : '';
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

async function timingSafeEqual(left, right) {
  const a = encoder.encode(String(left));
  const b = encoder.encode(String(right));
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

async function createSession(env) {
  const secret = envValue(env, 'ADMIN_SESSION_SECRET');
  if (secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');
  const payload = utf8Base64Url(JSON.stringify({ role: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 }));
  return `${payload}.${await hmac(secret, payload)}`;
}

async function isAdmin(request, env) {
  const token = parseCookie(request, 'shelby_admin_session');
  const secret = envValue(env, 'ADMIN_SESSION_SECRET');
  if (!token || !secret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !(await timingSafeEqual(signature, await hmac(secret, payload)))) return false;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(decodeBase64(payload)));
    return decoded.role === 'admin' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function sessionCookie(token, maxAge = 28800) {
  return `shelby_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function serviceAccount(env) {
  const raw = envValue(env, 'FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Firebase service account is not configured');
  const account = JSON.parse(raw);
  if (!account.project_id || !account.client_email || !account.private_key) throw new Error('Invalid Firebase service account');
  return account;
}

async function firebaseAccessToken(env) {
  const account = serviceAccount(env);
  const cached = tokenCache.get(account.client_email);
  if (cached && cached.expiresAt > Date.now() + 60000) return cached.value;
  const header = utf8Base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claim = utf8Base64Url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/devstorage.read_write',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const pem = account.private_key.replace(/\\n/g, '\n').replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const key = await crypto.subtle.importKey('pkcs8', decodeBase64(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = base64Url(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(`${header}.${claim}`))));
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${signature}`,
  });
  if (!response.ok) throw new Error('Unable to authenticate with Firebase');
  const result = await response.json();
  tokenCache.set(account.client_email, { value: result.access_token, expiresAt: Date.now() + (result.expires_in || 3600) * 1000 });
  return result.access_token;
}

async function firebaseRequest(env, path, options = {}) {
  const account = serviceAccount(env);
  const token = await firebaseAccessToken(env);
  const url = `https://${account.project_id}-default-rtdb.firebaseio.com/${path}.json?access_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Firebase request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

function firebaseBucket(account) {
  return account.storage_bucket || `${account.project_id}.firebasestorage.app`;
}

async function firebaseUpload(env, path, bytes, contentType) {
  const account = serviceAccount(env);
  const token = await firebaseAccessToken(env);
  const url = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(firebaseBucket(account))}/o?uploadType=media&name=${encodeURIComponent(path)}`;
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType }, body: bytes });
  if (!response.ok) throw new Error(`Firebase Storage upload failed (${response.status})`);
}

async function firebaseDownload(env, path) {
  const account = serviceAccount(env);
  const token = await firebaseAccessToken(env);
  return fetch(`https://storage.googleapis.com/download/storage/v1/b/${encodeURIComponent(firebaseBucket(account))}/o/${encodeURIComponent(path)}?alt=media`, { headers: { Authorization: `Bearer ${token}` } });
}

function supabaseConfig(env) {
  const url = envValue(env, 'SUPABASE_URL').replace(/\/$/, '');
  const key = envValue(env, 'SUPABASE_SERVICE_ROLE_KEY');
  const bucket = envValue(env, 'SUPABASE_MEDIA_BUCKET') || 'media';
  if (!url || !key) throw new Error('Supabase storage is not configured');
  return { url, key, bucket };
}

async function supabaseUpload(env, path, bytes, contentType) {
  const { url, key, bucket } = supabaseConfig(env);
  const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': contentType, 'x-upsert': 'false' },
    body: bytes,
  });
  if (!response.ok) throw new Error('Supabase upload failed');
  return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

async function readJson(request) {
  try { return await request.json(); } catch { throw new Error('Invalid JSON request body'); }
}

async function handleAdminAuth(request, env) {
  if (!sameOrigin(request)) return json(403, { error: 'Invalid request origin' });
  if (request.method === 'GET') return json(200, { authenticated: await isAdmin(request, env) });
  if (request.method === 'DELETE') return noContent({ 'Set-Cookie': sessionCookie('', 0) });
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const { username = '', password = '' } = await readJson(request);
    const valid = Boolean(envValue(env, 'ADMIN_USERNAME') && envValue(env, 'ADMIN_PASSWORD'))
      && await timingSafeEqual(username, envValue(env, 'ADMIN_USERNAME'))
      && await timingSafeEqual(password, envValue(env, 'ADMIN_PASSWORD'));
    if (!valid) return json(401, { error: 'Invalid credentials' });
    return json(200, { authenticated: true }, { 'Set-Cookie': sessionCookie(await createSession(env)) });
  } catch (error) {
    return json(400, { error: error.message === 'Invalid JSON request body' ? error.message : 'Invalid request' });
  }
}

async function handleAdminApi(request, env) {
  if (!(await isAdmin(request, env))) return json(401, { error: 'Authentication required' });
  if (request.method !== 'POST' || !sameOrigin(request)) return json(403, { error: 'Forbidden' });
  try {
    const { action, path, value, key } = await readJson(request);
    if (action === 'read' && (new Set(['visitors', 'orders', 'products', 'settings/payment'])).has(path)) {
      const data = await firebaseRequest(env, path);
      if (path === 'orders' && data) {
        for (const order of Object.values(data)) {
          if (order.screenshotPath) order.screenshotUrl = `/api/admin-media?path=${encodeURIComponent(order.screenshotPath)}`;
          delete order.screenshotPath;
        }
      }
      return json(200, { data: data || null });
    }
    if (action === 'read' && /^products\/[A-Za-z0-9_-]+$/.test(path)) return json(200, { data: await firebaseRequest(env, path) });
    if (action === 'save-product' && value && /^[A-Za-z0-9_-]+$/.test(value.id)) {
      const product = Object.fromEntries(PRODUCT_FIELDS.filter(field => field in value).map(field => [field, value[field]]));
      await firebaseRequest(env, `products/${value.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
      return json(200, { ok: true });
    }
    if (action === 'delete-product' && /^[A-Za-z0-9_-]+$/.test(key)) {
      await firebaseRequest(env, `products/${key}`, { method: 'DELETE' });
      return json(200, { ok: true });
    }
    if (action === 'save-payment-settings' && value && typeof value === 'object') {
      await firebaseRequest(env, 'settings/payment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
      return json(200, { ok: true });
    }
    return json(400, { error: 'Unsupported operation' });
  } catch {
    return json(500, { error: 'Request failed' });
  }
}

async function handleAdminUpload(request, env) {
  if (!(await isAdmin(request, env))) return json(401, { error: 'Authentication required' });
  if (request.method !== 'POST' || !sameOrigin(request)) return json(403, { error: 'Forbidden' });
  const type = request.headers.get('Content-Type') || '';
  const name = request.headers.get('x-file-name') || '';
  if (!/^image\/(jpeg|png|webp|gif)$|^video\/(mp4|webm|quicktime)$/i.test(type) || !/^[\w.-]{1,180}$/.test(name)) return json(400, { error: 'Unsupported file' });
  const content = await request.arrayBuffer();
  if (!content.byteLength || content.byteLength > 50 * 1024 * 1024) return json(400, { error: 'File must be between 1 byte and 50 MB' });
  try {
    const path = `uploads/${Date.now()}-${crypto.randomUUID()}-${name}`;
    return json(200, { url: await supabaseUpload(env, path, content, type) });
  } catch { return json(500, { error: 'Upload failed' }); }
}

async function handleCreateOrder(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const { package: packageName, amount, amountINR, amountUSD, method, screenshot } = await readJson(request);
    if (![packageName, amount, amountINR, amountUSD].every(value => typeof value === 'string' && value.length > 0 && value.length < 200) || !ORDER_METHODS.has(method)) return json(400, { error: 'Invalid order data' });
    let screenshotPath = null;
    if (typeof screenshot === 'string' && screenshot.startsWith('data:image/')) {
      const match = screenshot.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return json(400, { error: 'Invalid screenshot' });
      const bytes = decodeBase64(match[2]);
      if (bytes.byteLength > 8 * 1024 * 1024) return json(400, { error: 'Screenshot exceeds 8 MB' });
      screenshotPath = `payment_screenshots/${Date.now()}-${crypto.randomUUID()}.${match[1].split('/')[1]}`;
      await firebaseUpload(env, screenshotPath, bytes, match[1]);
    }
    const order = { package: packageName, amount, amountINR, amountUSD, method, screenshotPath, status: 'pending', timestamp: Date.now(), date: new Date().toISOString() };
    await firebaseRequest(env, 'orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
    return json(201, { ok: true });
  } catch { return json(500, { error: 'Unable to create order' }); }
}

async function handlePublicMedia(request, env) {
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(key)) return json(400, { error: 'Invalid media key' });
  try {
    const products = await firebaseRequest(env, 'products') || {};
    const linked = Object.values(products).some(product => String(product.images || '').split(',').map(value => value.trim()).includes(`db://${key}`));
    if (!linked) return json(404, { error: 'Media not found' });
    const media = await firebaseRequest(env, `uploads/${key}/data`);
    return media ? json(200, { data: media }, { 'Cache-Control': 'public, max-age=3600' }) : json(404, { error: 'Media not found' });
  } catch { return json(500, { error: 'Unable to load media' }); }
}

async function handlePublicPaymentSettings(request, env) {
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });
  try { return json(200, { data: (await firebaseRequest(env, 'settings/payment')) || {} }, { 'Cache-Control': 'public, max-age=60' }); }
  catch { return json(500, { error: 'Unable to load settings' }); }
}

async function handleTrackVisitor(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const { page, device } = await readJson(request);
    if (!['index', 'payment'].includes(page) || !['Mobile', 'Desktop'].includes(device)) return json(400, { error: 'Invalid visitor data' });
    await firebaseRequest(env, 'visitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page, device, timestamp: Date.now(), date: new Date().toISOString().slice(0, 10) }) });
    return json(201, { ok: true });
  } catch { return json(500, { error: 'Unable to record visit' }); }
}

async function handleAdminMedia(request, env) {
  if (!(await isAdmin(request, env))) return json(401, { error: 'Authentication required' });
  if (request.method !== 'GET') return json(405, { error: 'Method not allowed' });
  const path = new URL(request.url).searchParams.get('path') || '';
  if (!/^payment_screenshots\/[A-Za-z0-9_.-]+$/.test(path)) return json(400, { error: 'Invalid media path' });
  const response = await firebaseDownload(env, path);
  if (!response.ok) return json(404, { error: 'Media not found' });
  return new Response(response.body, { status: 200, headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream', 'Cache-Control': 'private, max-age=0' } });
}

const routes = {
  '/api/admin-auth': handleAdminAuth,
  '/api/admin-api': handleAdminApi,
  '/api/admin-upload': handleAdminUpload,
  '/api/create-order': handleCreateOrder,
  '/api/public-media': handlePublicMedia,
  '/api/public-payment-settings': handlePublicPaymentSettings,
  '/api/track-visitor': handleTrackVisitor,
  '/api/admin-media': handleAdminMedia,
};

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/';
    const handler = routes[path];
    if (handler) return handler(request, env);
    return env.ASSETS.fetch(request);
  },
};
