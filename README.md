# Shelby Seller Shop

This project runs as a Cloudflare Worker with the existing HTML, CSS, and browser JavaScript served through Cloudflare Workers Static Assets. The Worker keeps the backend logic server-side and exposes the application API under `/api/`.

## Local setup

Install the Wrangler CLI dependencies:

```powershell
npm.cmd install
```

Create a local `.dev.vars` file for `wrangler dev`. Do not commit it:

```dotenv
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-long-unique-password
ADMIN_SESSION_SECRET=at-least-32-random-characters
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project","client_email":"...","private_key":"..."}
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_MEDIA_BUCKET=media
```

Run locally with:

```powershell
npx.cmd wrangler dev
```

## Cloudflare variables and secrets

In **Workers & Pages**, open the Worker, then **Settings -> Variables and Secrets**. Add these bindings for the production environment:

Secrets:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `SUPABASE_SERVICE_ROLE_KEY`

Plain variables:

- `SUPABASE_URL`
- `SUPABASE_MEDIA_BUCKET` (normally `media`)

Set the five secret bindings with the dashboard secret option or Wrangler:

```powershell
npx.cmd wrangler secret put ADMIN_USERNAME
npx.cmd wrangler secret put ADMIN_PASSWORD
npx.cmd wrangler secret put ADMIN_SESSION_SECRET
npx.cmd wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
npx.cmd wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

For the two non-secret variables, add them in the dashboard or in an environment-specific Wrangler configuration. Never put populated values in `wrangler.toml`, `.env.example`, or browser code.

## Deploy

Authenticate Wrangler and deploy the Worker plus static assets:

```powershell
npx.cmd wrangler login
npx.cmd wrangler deploy
```

The committed configuration uses `src/worker.js` as the Worker entry point and the project root as the static asset directory.

## API routes

The frontend uses these Worker routes:

- `/api/admin-auth` - login, session validation, and logout
- `/api/admin-api` - protected products, orders, visitors, and payment settings operations
- `/api/admin-upload` - protected Supabase media upload
- `/api/admin-media` - protected payment screenshot delivery
- `/api/create-order` - order creation and Firebase Storage screenshot upload
- `/api/public-media` - public linked Firebase media lookup
- `/api/public-payment-settings` - public payment settings
- `/api/track-visitor` - visitor tracking

Firebase service-account access and the Supabase service-role key are used only inside the Worker. The browser receives neither credential.