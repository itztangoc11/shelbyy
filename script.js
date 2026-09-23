// ===== LOADING SCREEN =====
(function() {
  const wrap   = document.getElementById('loaderWrap');
  const bar    = document.getElementById('loaderBar');
  const pct    = document.getElementById('loaderPct');
  const lParts = document.getElementById('loaderParticles');

  // Safety check — agar koi element null ho toh silently skip
  if (!wrap || !bar || !pct) return;

  document.body.classList.add('loading');
  document.documentElement.classList.add('loading');

  function hideLoader() {
    wrap.classList.add('hide');
    document.body.classList.remove('loading');
    document.documentElement.classList.remove('loading');
    setTimeout(() => { if (wrap.parentNode) wrap.remove(); }, 700);
  }

  // Hard timeout — 4 seconds mein force hide, chahe kuch bhi ho
  const hardTimeout = setTimeout(hideLoader, 4000);

  // Spawn loader particles (only on non-mobile for performance)
  if (lParts && !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    const lpColors = ['#e84393','#7c3aed','#f472b6','#a855f7','#f59e0b'];
    function spawnLP() {
      if (!lParts) return;
      const p = document.createElement('div');
      p.className = 'lp';
      const size = Math.random() * 4 + 2;
      const color = lpColors[Math.floor(Math.random() * lpColors.length)];
      p.style.cssText = `
        width:${size}px;height:${size}px;
        background:${color};
        left:${Math.random()*100}%;
        bottom:-10px;
        animation-duration:${Math.random()*8+5}s;
        animation-delay:${Math.random()*2}s;
        box-shadow:0 0 ${size*2}px ${color};
      `;
      lParts.appendChild(p);
      setTimeout(() => p.remove(), 10000);
    }
    const lpInterval = setInterval(spawnLP, 600);
    for (let i = 0; i < 5; i++) spawnLP();
    setTimeout(() => clearInterval(lpInterval), 4000);
  }

  // Progress animation using requestAnimationFrame (works on mobile, no throttle issues)
  const messages = [
    'Loading premium content...',
    'Preparing 4K videos...',
    'Almost ready...',
    'Welcome!'
  ];
  const subEl = wrap.querySelector('.loader-sub');
  let progress = 0;
  let lastTime = null;

  function animateProgress(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;
    lastTime = timestamp;

    // ~100% in 2.5 seconds
    const speed = elapsed * 0.04;
    const increment = progress < 30 ? speed * 2.5 : progress < 70 ? speed * 1.2 : progress < 90 ? speed * 0.8 : speed * 3;
    progress = Math.min(progress + increment, 100);

    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';

    if (subEl) {
      if (progress >= 25 && progress < 30)  subEl.textContent = messages[1];
      if (progress >= 65 && progress < 70)  subEl.textContent = messages[2];
      if (progress >= 95)                   subEl.textContent = messages[3];
    }

    if (progress < 100) {
      requestAnimationFrame(animateProgress);
    } else {
      clearTimeout(hardTimeout);
      setTimeout(hideLoader, 400);
    }
  }

  requestAnimationFrame(animateProgress);
})();

// ===== HEADER SCROLL =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== SCROLL PROGRESS BAR =====
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

// ===== AURORA BACKGROUND =====
const aurora = document.createElement('div');
aurora.className = 'aurora';
aurora.innerHTML = '<div class="aurora-blob"></div><div class="aurora-blob"></div><div class="aurora-blob"></div>';
document.body.prepend(aurora);

// ===== CURSOR GLOW =====
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursorGlow.style.opacity = '1'; });

// ===== FLOATING TELEGRAM BADGE =====
const badge = document.createElement('a');
badge.href = 'https://t.me/Saymyn_ame';
badge.target = '_blank';
badge.className = 'floating-badge';
badge.innerHTML = '<i class="fa-brands fa-telegram"></i>';
badge.title = 'DM on Telegram';
document.body.appendChild(badge);

// ===== SECTION DIVIDERS =====
document.querySelectorAll('section').forEach(sec => {
  const div = document.createElement('div');
  div.className = 'section-divider';
  sec.after(div);
});

// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menuToggle');
const mobileNav  = document.getElementById('mobileNav');
menuToggle.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  const icon = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});
mobileNav.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    const icon = menuToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-xmark');
  });
});

// ===== PARTICLES =====
const particlesContainer = document.getElementById('particles');
const colors = ['#e84393', '#7c3aed', '#f472b6', '#a855f7'];

function createParticle() {
  // Limit max particles in DOM to prevent memory overload
  if (particlesContainer.childElementCount > 30) return;
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 5 + 2;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const duration = Math.random() * 12 + 8;
  const delay = Math.random() * 5;
  p.style.cssText = `
    width:${size}px;height:${size}px;
    background:${color};left:${left}%;bottom:-10px;
    animation-duration:${duration}s;animation-delay:${delay}s;
    opacity:0;box-shadow:0 0 ${size*2}px ${color};
  `;
  particlesContainer.appendChild(p);
  setTimeout(() => p.remove(), (duration + delay) * 1000);
}
setInterval(createParticle, 800);
for (let i = 0; i < 12; i++) createParticle();

// ===== GLITCH EFFECT ON HERO TITLE =====
const gradientTexts = document.querySelectorAll('.gradient-text');
gradientTexts.forEach(el => {
  el.classList.add('glitch');
  el.setAttribute('data-text', el.textContent);
});

// ===== TYPEWRITER on hero-sub =====
const heroSub = document.querySelector('.hero-sub');
if (heroSub) {
  const originalText = heroSub.textContent.trim();
  heroSub.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  heroSub.appendChild(cursor);
  let i = 0;
  const typeSpeed = 28;
  function typeChar() {
    if (i < originalText.length) {
      heroSub.insertBefore(document.createTextNode(originalText[i]), cursor);
      i++;
      setTimeout(typeChar, typeSpeed);
    }
  }
  setTimeout(typeChar, 900);
}

// ===== CARD SHINE ELEMENT =====
document.querySelectorAll('.cat-card, .pcard').forEach(card => {
  const shine = document.createElement('div');
  shine.className = 'shine';
  card.appendChild(shine);
});

// ===== 3D TILT on why-cards =====
document.querySelectorAll('.why-card, .testi-card, .contact-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;
    card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== 3D TILT on cat-cards =====
document.querySelectorAll('.cat-card, .pcard').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
    card.style.transform = `translateY(-8px) rotateX(${-y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== COUNTER ANIMATION on hero stats =====
function animateCount(el, target, suffix = '') {
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 25);
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(num => {
        const text = num.textContent.trim();
        if (text === '500+')  animateCount(num, 500, '+');
        if (text === '24/7')  { /* leave as is */ }
        if (text === '100%')  animateCount(num, 100, '%');
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(
  '.why-card, .cat-card, .pcard, .testi-card, .contact-card, .section-head, .hero-stats, .pb-content'
);
revealEls.forEach(el => el.classList.add('reveal'));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// ===== SMOOTH ACTIVE NAV =====
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) link.style.color = 'var(--primary)';
  });
}, { passive: true });

// ===== RIPPLE on buttons =====
document.querySelectorAll('.btn-primary, .btn-card, .btn-contact, .btn-header, .btn-ghost').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,0.25);
      border-radius:50%;
      transform:scale(0);
      animation:rippleAnim 0.55s linear;
      pointer-events:none;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Inject ripple keyframe dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes rippleAnim { to { transform:scale(2.5); opacity:0; } }`;
document.head.appendChild(rippleStyle);

// ===== MAGNETIC EFFECT on CTA buttons =====
document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) * 0.25;
    const dy = (e.clientY - rect.top  - rect.height / 2) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ===== SHOOTING STARS =====
function createShootingStar() {
  const star = document.createElement('div');
  star.className = 'shooting-star';
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * window.innerHeight * 0.5;
  const angle = 30 + Math.random() * 20;
  const distance = 300 + Math.random() * 400;
  const tx = Math.cos((angle * Math.PI) / 180) * distance;
  const ty = Math.sin((angle * Math.PI) / 180) * distance;
  star.style.cssText = `
    left:${startX}px; top:${startY}px;
    --angle:${angle}deg; --tx:${tx}px; --ty:${ty}px;
    animation-duration:${0.6 + Math.random() * 0.6}s;
    box-shadow: 0 0 4px #fff, 0 0 8px rgba(232,67,147,0.6);
  `;
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 1200);
}
setInterval(createShootingStar, 5000);

// ===== MARQUEE TICKER =====
const marqueeItems = [
  { icon: 'fa-solid fa-fire-flame-curved', text: '1,14,000+ Videos' },
  { icon: 'fa-solid fa-gem',               text: 'Cheapest Price Ever' },
  { icon: 'fa-solid fa-shield-halved',     text: 'Trusted Since 3 Years' },
  { icon: 'fa-solid fa-bolt',              text: 'Instant Delivery' },
  { icon: 'fa-brands fa-telegram',         text: '24/7 Telegram Support' },
  { icon: 'fa-solid fa-4k',                text: '4K Quality Content' },
  { icon: 'fa-solid fa-star',              text: '500+ Happy Customers' },
  { icon: 'fa-solid fa-lock',              text: '100% Trusted Seller' },
];
function buildMarquee() {
  const wrap = document.createElement('div');
  wrap.className = 'marquee-wrap';
  const track = document.createElement('div');
  track.className = 'marquee-track';
  // duplicate for seamless loop
  [...marqueeItems, ...marqueeItems].forEach(item => {
    const el = document.createElement('span');
    el.className = 'marquee-item';
    el.innerHTML = `<i class="${item.icon}"></i>${item.text}<span class="marquee-dot"></span>`;
    track.appendChild(el);
  });
  wrap.appendChild(track);
  // Insert after hero section
  const hero = document.querySelector('.hero');
  if (hero) hero.after(wrap);
}
buildMarquee();

// ===== ORBITING ICONS around hero visual =====
const orbitData = [
  { icon: 'fa-solid fa-film',    deg: 0,   r: '170px', dur: '10s' },
  { icon: 'fa-solid fa-star',    deg: 90,  r: '170px', dur: '10s' },
  { icon: 'fa-solid fa-bolt',    deg: 180, r: '170px', dur: '10s' },
  { icon: 'fa-brands fa-telegram', deg: 270, r: '170px', dur: '10s' },
];
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  orbitData.forEach(({ icon, deg, r, dur }) => {
    const el = document.createElement('div');
    el.className = 'orbit-icon';
    el.innerHTML = `<i class="${icon}"></i>`;
    el.style.cssText = `--start-deg:${deg}deg; --radius:${r}; animation-duration:${dur};`;
    heroVisual.appendChild(el);
  });
}

// ===== TOAST NOTIFICATIONS =====
const toastMessages = [
  { icon: 'fa-solid fa-fire-flame-curved', msg: 'New order received just now!' },
  { icon: 'fa-solid fa-star',              msg: 'Someone just left a 5-star review!' },
  { icon: 'fa-brands fa-telegram',         msg: '3 people DM\'d on Telegram today!' },
  { icon: 'fa-solid fa-bolt',              msg: 'Mega Pack claimed by a buyer!' },
];
let toastIdx = 0;
function showToast() {
  const data = toastMessages[toastIdx % toastMessages.length];
  toastIdx++;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="${data.icon}"></i><span>${data.msg}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}
setTimeout(() => {
  showToast();
  setInterval(showToast, 7000);
}, 4000);

// ===== HERO SPOTLIGHT on mousemove =====
const heroSection = document.querySelector('.hero');
if (heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    heroSection.style.setProperty('--spotlight-x', (e.clientX - rect.left) + 'px');
    heroSection.style.setProperty('--spotlight-y', (e.clientY - rect.top) + 'px');
  });
}

// ===== PARTICLE BURST on button click =====
document.querySelectorAll('.btn-primary, .btn-card, .cpb-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    for (let i = 0; i < 12; i++) {
      const burst = document.createElement('div');
      const angle = (i / 12) * 360;
      const dist  = 60 + Math.random() * 40;
      const size  = 4 + Math.random() * 4;
      const color = ['#e84393','#7c3aed','#f472b6','#f59e0b'][Math.floor(Math.random()*4)];
      burst.style.cssText = `
        position:fixed;
        left:${e.clientX}px; top:${e.clientY}px;
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:${color};
        pointer-events:none;
        z-index:9999;
        transform:translate(-50%,-50%);
        animation: burstAnim 0.6s ease forwards;
        --bx:${Math.cos(angle * Math.PI/180) * dist}px;
        --by:${Math.sin(angle * Math.PI/180) * dist}px;
        box-shadow: 0 0 ${size*2}px ${color};
      `;
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
    }
  });
});

// Inject burst keyframe
const burstStyle = document.createElement('style');
burstStyle.textContent = `@keyframes burstAnim { to { transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by))); opacity:0; } }`;
document.head.appendChild(burstStyle);

// ===== LAST SOLD BADGES on cat-cards =====
(function() {
  const cards = document.querySelectorAll('.cat-card, .pcard');
  cards.forEach(card => {
    const mins = Math.floor(Math.random() * 55) + 2;
    const badge = document.createElement('div');
    badge.className = 'last-sold-badge';
    badge.innerHTML = `<i class="fa-solid fa-circle"></i> Last sold ${mins} min ago`;
    const btn = card.querySelector('.btn-card');
    if (btn) btn.insertAdjacentElement('afterend', badge);
    else card.appendChild(badge);
    setInterval(() => {
      const newMins = Math.floor(Math.random() * 55) + 2;
      badge.innerHTML = `<i class="fa-solid fa-circle"></i> Last sold ${newMins} min ago`;
    }, 60000);
  });
})();

// ===== EXIT INTENT POPUP =====
(function() {
  // Don't show again in same session if already seen
  if (sessionStorage.getItem('exitShown')) return;

  // Build popup HTML
  const overlay = document.createElement('div');
  overlay.className = 'exit-overlay';
  overlay.innerHTML = `
    <div class="exit-popup">
      <button class="exit-close" id="exitClose"><i class="fa-solid fa-xmark"></i></button>
      <span class="exit-popup-icon">
        <i class="fa-solid fa-gem" style="background:linear-gradient(135deg,#f59e0b,#e84393);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;"></i>
      </span>
      <h2>Wait! Don't <span class="gradient-text">Miss This</span></h2>
      <p>You're leaving without grabbing the best deal in the market. Mega Pack   1,14,000+ videos at an unbeatable price. Only for today!</p>
      <div class="exit-discount-box">
        <div class="old-price">Original Price: ?10,900 / $392</div>
        <div class="new-price">?4,399 <span style="font-size:1.1rem;opacity:0.8;">/ $109</span></div>
        <div class="save-tag">You save ?6,501   Cheapest in the market!</div>
      </div>
      <a href="https://t.me/Saymyn_ame" target="_blank" class="btn-primary">
        <i class="fa-brands fa-telegram"></i> Claim Deal on Telegram
      </a>
      <button class="exit-skip" id="exitSkip">No thanks, I'll pay full price later</button>
    </div>
  `;
  document.body.appendChild(overlay);

  function showExitPopup() {
    if (sessionStorage.getItem('exitShown')) return;
    overlay.classList.add('active');
    sessionStorage.setItem('exitShown', '1');
  }

  function closeExitPopup() {
    overlay.classList.remove('active');
  }

  // Trigger on mouse leaving to top of page
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 10) showExitPopup();
  });

  // Close buttons
  document.getElementById('exitClose').addEventListener('click', closeExitPopup);
  document.getElementById('exitSkip').addEventListener('click', closeExitPopup);

  // Close on overlay click outside popup
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeExitPopup();
  });

  // Also trigger on mobile with back button / visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sessionStorage.setItem('exitShown', '1');
    }
  });
})();

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});

// ===== SCREENSHOT & COPY PROTECTION =====
(function() {
  // Warning toast helper
  function showProtectToast(msg) {
    let t = document.querySelector('.protect-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'protect-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${msg}`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  // Disable right click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showProtectToast('Content is protected. Right click disabled.');
  });

  // Disable text selection via keyboard (Ctrl+A, Ctrl+C, Ctrl+U, Ctrl+S, F12)
  document.addEventListener('keydown', (e) => {
    const blocked = (
      (e.ctrlKey && ['a','c','u','s','p'].includes(e.key.toLowerCase())) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()))
    );
    if (blocked) {
      e.preventDefault();
      showProtectToast('Content is protected. This action is disabled.');
    }
  });

  // Disable drag
  document.addEventListener('dragstart', (e) => e.preventDefault());

  // Disable print
  window.addEventListener('beforeprint', (e) => {
    e.preventDefault();
    showProtectToast('Printing is disabled on this site.');
  });

  // DevTools open detection (basic) — skip on mobile/touch devices to avoid false positives
  let devOpen = false;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window);
  if (!isMobile) {
    const devCheck = setInterval(() => {
      const threshold = 200;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        if (!devOpen) {
          devOpen = true;
          showProtectToast('DevTools detected. Content is protected.');
        }
      } else {
        devOpen = false;
      }
    }, 2000);
  }
})();

// ===== CARD SLIDESHOW (auto-sliding) =====
(function () {
  const INTERVAL = 3000;

  function initSlideshow(wrap) {
    const slides = Array.from(wrap.querySelectorAll('.pslide'));
    if (slides.length <= 1) return;
    const dotsWrap = wrap.querySelector('.pslide-dots');
    if (!dotsWrap) return;

    slides.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'pslide-dot' + (i === 0 ? ' active' : '');
      dotsWrap.appendChild(d);
    });

    let current = 0;
    let timer = null;

    function goTo(idx) {
      slides[current].classList.remove('pslide-active');
      dotsWrap.querySelectorAll('.pslide-dot')[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('pslide-active');
      dotsWrap.querySelectorAll('.pslide-dot')[current].classList.add('active');
    }

    function startAuto() { timer = setInterval(() => goTo(current + 1), INTERVAL); }
    function stopAuto()  { clearInterval(timer); }

    startAuto();
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);

    wrap._ssGoTo      = goTo;
    wrap._ssGetCurrent = function() { return current; };
    wrap._ssGetSlides  = function() { return slides; };
  }

  function initAll() {
    document.querySelectorAll('.pcard-slideshow').forEach(function(wrap) {
      if (wrap.dataset.ssInit) return;
      wrap.dataset.ssInit = '1';
      initSlideshow(wrap);
    });
  }

  initAll();
  setTimeout(initAll, 1000);
})();

// ===== LIGHTBOX =====
(function () {
  const overlay  = document.getElementById('lightboxOverlay');
  const content  = document.getElementById('lightboxContent');
  const caption  = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  const hint = document.createElement('div');
  hint.className = 'lightbox-hint';
  hint.textContent = 'Tap anywhere to close';
  overlay.appendChild(hint);

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lb-arrow lb-arrow-prev';
  prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  overlay.appendChild(prevBtn);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lb-arrow lb-arrow-next';
  nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  overlay.appendChild(nextBtn);

  const lbDotsWrap = document.createElement('div');
  lbDotsWrap.className = 'lb-dots';
  overlay.appendChild(lbDotsWrap);

  let lbImages  = [];
  let lbCurrent = 0;
  let lbSlides  = [];

  function buildLightboxSlides() {
    content.innerHTML  = '';
    lbDotsWrap.innerHTML = '';
    lbSlides = [];

    lbImages.forEach(function(src, i) {
      const slide = document.createElement('div');
      slide.className = 'lb-slide' + (i === 0 ? ' lb-active' : '');
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      slide.appendChild(img);
      content.appendChild(slide);
      lbSlides.push(slide);

      const dot = document.createElement('span');
      dot.className = 'lb-dot' + (i === 0 ? ' active' : '');
      (function(idx) { dot.addEventListener('click', function() { lbGoTo(idx); }); })(i);
      lbDotsWrap.appendChild(dot);
    });

    const multi = lbImages.length > 1;
    prevBtn.style.display    = multi ? '' : 'none';
    nextBtn.style.display    = multi ? '' : 'none';
    lbDotsWrap.style.display = multi ? '' : 'none';
  }

  function lbGoTo(idx) {
    if (!lbSlides.length) return;
    lbSlides[lbCurrent].classList.remove('lb-active');
    lbDotsWrap.querySelectorAll('.lb-dot')[lbCurrent].classList.remove('active');
    lbCurrent = (idx + lbSlides.length) % lbSlides.length;
    lbSlides[lbCurrent].classList.add('lb-active');
    lbDotsWrap.querySelectorAll('.lb-dot')[lbCurrent].classList.add('active');
  }

  function openLightbox(imgWrap) {
    if (imgWrap.classList.contains('pcard-slideshow')) {
      lbImages  = Array.from(imgWrap.querySelectorAll('.pslide img')).map(function(img) { return img.src; });
      lbCurrent = imgWrap._ssGetCurrent ? imgWrap._ssGetCurrent() : 0;
    } else {
      const img = imgWrap.querySelector('img');
      lbImages  = img ? [img.src] : [];
      lbCurrent = 0;
    }

    buildLightboxSlides();

    if (lbCurrent > 0) {
      lbSlides[0].classList.remove('lb-active');
      lbDotsWrap.querySelectorAll('.lb-dot')[0].classList.remove('active');
      lbSlides[lbCurrent].classList.add('lb-active');
      lbDotsWrap.querySelectorAll('.lb-dot')[lbCurrent].classList.add('active');
    }

    var card  = imgWrap.closest('.pcard');
    var title = card ? card.querySelector('.pcard-title') : null;
    caption.textContent = title ? title.textContent.trim() : '';

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  prevBtn.addEventListener('click', function(e) { e.stopPropagation(); lbGoTo(lbCurrent - 1); });
  nextBtn.addEventListener('click', function(e) { e.stopPropagation(); lbGoTo(lbCurrent + 1); });
  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeLightbox(); });

  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lbGoTo(lbCurrent - 1);
    if (e.key === 'ArrowRight')  lbGoTo(lbCurrent + 1);
  });

  var touchStartX = 0;
  overlay.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) lbGoTo(lbCurrent + (dx < 0 ? 1 : -1));
  });

  function initLightbox() {
    document.querySelectorAll('.pcard .pcard-img-wrap').forEach(function(wrap) {
      if (wrap.dataset.lightboxBound) return;
      wrap.dataset.lightboxBound = '1';
      wrap.addEventListener('click', function() { openLightbox(wrap); });
    });
  }

  initLightbox();
  setTimeout(initLightbox, 1500);
})();
// ===== VIDEO TIER SELECTOR =====
(function () {
  const tierLists = document.querySelectorAll('.vid-tier-list');
  tierLists.forEach(function (list) {
    const btnId = list.id.replace('vidTier', 'vidBtn');
    const btn = document.getElementById(btnId);
    const items = list.querySelectorAll('.vid-tier-item');

    items.forEach(function (item) {
      item.addEventListener('click', function () {
        items.forEach(function (i) { i.classList.remove('vid-tier-selected'); });
        item.classList.add('vid-tier-selected');

        const vids = item.dataset.vids;
        const inr  = item.dataset.inr;
        const usd  = item.dataset.usd;
        const name = btn.dataset.name;

        btn.textContent = '';
        const icon = document.createElement('i');
        icon.className = 'fa-brands fa-telegram';
        btn.appendChild(icon);
        btn.appendChild(document.createTextNode(' Buy Now   ' + vids + ' Videos ?' + inr));
        btn.href = 'payment.html?name=' + name + '&vids=' + vids + '&inr=?' + inr + '&usd=$' + usd;
      });
    });
  });
})();


// ===== CATEGORY URL SLUGS =====
(function () {
  function toSlug(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
  }

  function initCardSlugs() {
    document.querySelectorAll('.pcard').forEach(function(card) {
      var titleEl = card.querySelector('.pcard-title');
      if (!titleEl) return;
      var slug = toSlug(titleEl.textContent.trim());
      if (!slug) return;
      card.id = slug;
      card.dataset.slug = slug;
    });
  }

  // Only update URL after user has scrolled at least once
  var userHasScrolled = false;
  window.addEventListener('scroll', function() { userHasScrolled = true; }, { passive: true, once: true });

  function bindHashUpdates() {
    document.querySelectorAll('.pcard').forEach(function(card) {
      var slug = card.dataset.slug;
      if (!slug) return;

      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && userHasScrolled) {
            history.replaceState(null, '', '#' + slug);
          }
        });
      }, { threshold: 0.5 });
      io.observe(card);

      // Click on image/title → copy link
      var imgWrap = card.querySelector('.pcard-img-wrap');
      var titleEl = card.querySelector('.pcard-title');
      [imgWrap, titleEl].forEach(function(el) {
        if (!el) return;
        el.style.cursor = 'pointer';
        el.addEventListener('click', function() {
          history.pushState(null, '', '#' + slug);
          var url = window.location.origin + window.location.pathname + '#' + slug;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(function() { showSlugToast(url); }).catch(function() { showSlugToast(url); });
          } else { showSlugToast(url); }
        });
      });
    });
  }

  var slugToastEl = null, slugToastTimer = null;
  function showSlugToast(url) {
    if (!slugToastEl) {
      slugToastEl = document.createElement('div');
      slugToastEl.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:#0d0d24;border:1px solid rgba(240,70,154,0.4);color:#f0f0f8;padding:10px 18px;border-radius:12px;font-size:12px;font-family:Inter,sans-serif;font-weight:600;display:flex;align-items:center;gap:8px;z-index:99999;opacity:0;transition:all .3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);white-space:nowrap;max-width:90vw;overflow:hidden;text-overflow:ellipsis';
      document.body.appendChild(slugToastEl);
    }
    slugToastEl.innerHTML = '<i class="fa-solid fa-link" style="color:#f0469a;flex-shrink:0"></i> Link copied! <span style="color:#9090c0;font-size:11px;margin-left:4px">' + url + '</span>';
    slugToastEl.style.opacity = '1';
    slugToastEl.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(slugToastTimer);
    slugToastTimer = setTimeout(function() {
      slugToastEl.style.opacity = '0';
      slugToastEl.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
  }

  // On page load — if URL has a hash, scroll to that card
  function handleInitialHash() {
    var hash = window.location.hash.replace('#', '');
    if (!hash) return;
    var target = document.getElementById(hash);
    if (!target) return;
    setTimeout(function() {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      target.style.boxShadow = '0 0 0 3px rgba(240,70,154,0.6), 0 16px 48px rgba(240,70,154,0.25)';
      target.style.borderColor = '#f0469a';
      setTimeout(function() { target.style.boxShadow = ''; target.style.borderColor = ''; }, 2500);
    }, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initCardSlugs(); bindHashUpdates(); handleInitialHash(); });
  } else {
    setTimeout(function() { initCardSlugs(); bindHashUpdates(); handleInitialHash(); }, 500);
  }
})();


// ===== CATEGORY DETAIL PAGE LINKS =====
// Rewrites every "Order Now" btn-card to go to category.html?slug=...
// instead of directly to payment.html
(function () {
  function toSlug(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
  }

  function updateCardLinks() {
    document.querySelectorAll('.pcard').forEach(function (card) {
      var titleEl = card.querySelector('.pcard-title');
      if (!titleEl) return;
      var slug = toSlug(titleEl.textContent.trim());
      if (!slug) return;

      // Update all .btn-card links inside this card
      card.querySelectorAll('a.btn-card').forEach(function (btn) {
        // Skip gold/special cards that go to telegram directly
        var href = btn.getAttribute('href') || '';
        if (href.startsWith('https://t.me')) return;
        btn.href = 'category.html?slug=' + encodeURIComponent(slug);
      });

      // Also make the entire card image clickable → category page
      var imgWrap = card.querySelector('.pcard-img-wrap');
      if (imgWrap && !imgWrap.dataset.catLinked) {
        imgWrap.dataset.catLinked = '1';
        imgWrap.style.cursor = 'pointer';
        imgWrap.addEventListener('click', function (e) {
          // Don't fire if user clicked a lightbox trigger etc.
          window.location.href = 'category.html?slug=' + encodeURIComponent(slug);
        });
      }
    });
  }

  // Run after DOM ready + after dynamic cards render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateCardLinks();
      setTimeout(updateCardLinks, 1200); // catch dynamically rendered cards
    });
  } else {
    updateCardLinks();
    setTimeout(updateCardLinks, 1200);
  }
})();
