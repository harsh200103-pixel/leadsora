/* =========================================================
   ISAI LEADS — Premium White / Light Luxury Theme main.js
   By ISAI Tech Solutions — Interactive Engine & Animation System
   ========================================================= */

// ── Spotlight cursor ──────────────────────────────────────────
// Uses clientX/Y (viewport-relative) + position:fixed → stays correct during scroll
const spotlight = document.getElementById('spotlight');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let spotX = mouseX, spotY = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;   // clientX = viewport-relative, immune to scroll
  mouseY = e.clientY;
}, { passive: true });

function animateSpotlight() {
  spotX += (mouseX - spotX) * 0.1;
  spotY += (mouseY - spotY) * 0.1;
  if (spotlight) {
    spotlight.style.left = spotX + 'px';
    spotlight.style.top  = spotY + 'px';
  }
  requestAnimationFrame(animateSpotlight);
}
animateSpotlight();

// ── Magnetic buttons ──────────────────────────────────────────
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ── Navbar scroll ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile menu ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', true);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// ── CINEMATIC BACKGROUND CANVAS (WHITE LUXURY THEME) ─────────
// Rendered permanently under everything.
// ═══════════════════════════════════════════════════════════════
const cinematicCanvas = document.getElementById('cinematic-canvas');
if (cinematicCanvas) {
  const cCtx = cinematicCanvas.getContext('2d');

  function resizeCinematic() {
    cinematicCanvas.width  = cinematicCanvas.offsetWidth;
    cinematicCanvas.height = cinematicCanvas.offsetHeight;
  }
  resizeCinematic();
  window.addEventListener('resize', resizeCinematic);

  // --- Light ray system ---
  const NUM_RAYS = 7;
  const rays = Array.from({ length: NUM_RAYS }, (_, i) => ({
    x: (cinematicCanvas.width / (NUM_RAYS - 1)) * i,
    width: 80 + Math.random() * 160,
    speed: 0.15 + Math.random() * 0.25,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.025 + Math.random() * 0.035,
  }));

  // --- Floating orbs ---
  const NUM_ORBS = 6;
  const orbs = Array.from({ length: NUM_ORBS }, (_, idx) => ({
    x: Math.random() * 1440,
    y: Math.random() * 900,
    r: 120 + Math.random() * 220,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.12,
    alpha: 0.02 + Math.random() * 0.03,
    color: idx % 2 === 0 ? '0, 174, 239' : '0, 212, 255' // Electric Blue & Cyan
  }));

  // --- Grid lines ---
  const GRID_SIZE = 80;

  let cinematicT = 0;
  let videoEnded = false;  // becomes true when video finishes

  function drawCinematic() {
    const W = cinematicCanvas.width;
    const H = cinematicCanvas.height;
    cinematicT += 0.004;

    // Pure White luxury surface background
    cCtx.fillStyle = '#FFFFFF';
    cCtx.fillRect(0, 0, W, H);

    // Subtle perspective grid (ISAI Navy lines)
    cCtx.save();
    const gridAlpha = videoEnded ? 0.05 : 0.03;
    cCtx.strokeStyle = `rgba(0, 14, 57, ${gridAlpha})`;
    cCtx.lineWidth = 0.5;
    // Vertical grid lines
    for (let x = 0; x <= W; x += GRID_SIZE) {
      cCtx.beginPath();
      cCtx.moveTo(x, 0);
      cCtx.lineTo(x, H);
      cCtx.stroke();
    }
    // Horizontal grid lines
    for (let y = 0; y <= H; y += GRID_SIZE) {
      cCtx.beginPath();
      cCtx.moveTo(0, y);
      cCtx.lineTo(W, y);
      cCtx.stroke();
    }
    cCtx.restore();

    // Floating glow orbs (Electric Blue & Cyan)
    orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < -orb.r) orb.x = W + orb.r;
      if (orb.x > W + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r) orb.y = H + orb.r;
      if (orb.y > H + orb.r) orb.y = -orb.r;

      const displayAlpha = videoEnded ? orb.alpha * 2.2 : orb.alpha;
      const grad = cCtx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0, `rgba(${orb.color}, ${displayAlpha})`);
      grad.addColorStop(1, 'transparent');
      cCtx.beginPath();
      cCtx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      cCtx.fillStyle = grad;
      cCtx.fill();
    });

    // Sweeping light rays from top (Electric Cyan)
    rays.forEach((ray, i) => {
      const cx = ray.x + Math.sin(cinematicT * ray.speed + ray.phase) * 200;
      const rayAlpha = videoEnded ? ray.alpha * 2.5 : ray.alpha;
      const grad = cCtx.createLinearGradient(cx - ray.width / 2, 0, cx + ray.width / 2, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(0, 174, 239, ${rayAlpha})`);
      grad.addColorStop(1, 'transparent');

      cCtx.save();
      cCtx.fillStyle = grad;
      cCtx.beginPath();
      cCtx.moveTo(cx - 10, 0);
      cCtx.lineTo(cx + 10, 0);
      cCtx.lineTo(cx + ray.width, H);
      cCtx.lineTo(cx - ray.width, H);
      cCtx.closePath();
      cCtx.fill();
      cCtx.restore();
    });

    // Soft Alabaster vignette (frames edges gently)
    const vignette = cCtx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(240, 244, 250, 0.55)');
    cCtx.fillStyle = vignette;
    cCtx.fillRect(0, 0, W, H);

    requestAnimationFrame(drawCinematic);
  }
  drawCinematic();

  // ── Video plays once → fade out ───────────────────────────────
  const heroVideo    = document.getElementById('hero-video');
  const videoOverlay = document.querySelector('.hero-video-overlay');

  if (heroVideo) {
    heroVideo.addEventListener('ended', () => {
      heroVideo.classList.add('fading');
      if (videoOverlay) {
        videoOverlay.style.transition = 'opacity 1.8s ease-out';
        videoOverlay.style.opacity = '0';
      }
      setTimeout(() => {
        videoEnded = true;
        heroVideo.style.display = 'none';
        if (videoOverlay) videoOverlay.style.display = 'none';
      }, 1900);
    });

    heroVideo.addEventListener('error', () => {
      heroVideo.style.display = 'none';
      if (videoOverlay) videoOverlay.style.display = 'none';
      videoEnded = true;
    });
  }
}

// ── Hero 3D wireframe sphere (Navy & Electric Blue) ───────────
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const SPHERE = { r: Math.min(window.innerWidth, window.innerHeight) * 0.28, lats: 14, lons: 14 };
  let angleY = 0, angleX = 0.25;
  let targetAngleX = angleX;

  document.addEventListener('mousemove', e => {
    const ny = (e.clientY / window.innerHeight - 0.5);
    targetAngleX = 0.25 + ny * 0.3;
  });

  function project(x, y, z, fov, cx, cy) {
    const scale = fov / (fov + z);
    return { x: cx + x * scale, y: cy + y * scale, a: Math.max(0, (z + SPHERE.r) / (2 * SPHERE.r)) };
  }

  function drawSphere() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const fov = 500;
    const R = SPHERE.r;

    angleX += (targetAngleX - angleX) * 0.02;
    angleY += 0.003;

    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

    function rotate(x, y, z) {
      let x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
      let y2 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      return { x: x1, y: y2, z: z2 };
    }

    // Draw latitude lines (ISAI Navy)
    for (let i = 0; i <= SPHERE.lats; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / SPHERE.lats;
      const ry = Math.sin(lat) * R;
      const rx = Math.cos(lat) * R;
      ctx.beginPath();
      let first = true;
      for (let j = 0; j <= 64; j++) {
        const lon = (2 * Math.PI * j) / 64;
        const x3 = rx * Math.cos(lon);
        const z3 = rx * Math.sin(lon);
        const pt = rotate(x3, ry, z3);
        const p  = project(pt.x, pt.y, pt.z, fov, cx, cy);
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(0, 14, 57, 0.08)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Draw longitude lines (Electric Blue)
    for (let j = 0; j < SPHERE.lons; j++) {
      const lon = (2 * Math.PI * j) / SPHERE.lons;
      ctx.beginPath();
      let first = true;
      for (let i = 0; i <= 64; i++) {
        const lat = -Math.PI / 2 + (Math.PI * i) / 64;
        const ry = Math.sin(lat) * R;
        const rx = Math.cos(lat) * R;
        const x3 = rx * Math.cos(lon);
        const z3 = rx * Math.sin(lon);
        const pt = rotate(x3, ry, z3);
        const p  = project(pt.x, pt.y, pt.z, fov, cx, cy);
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(0, 174, 239, 0.12)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Draw vertex dots (Navy & Cyan nodes)
    for (let i = 0; i <= SPHERE.lats; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / SPHERE.lats;
      const ry = Math.sin(lat) * R;
      const rx = Math.cos(lat) * R;
      for (let j = 0; j < SPHERE.lons; j++) {
        const lon = (2 * Math.PI * j) / SPHERE.lons;
        const x3 = rx * Math.cos(lon);
        const z3 = rx * Math.sin(lon);
        const pt = rotate(x3, ry, z3);
        const p  = project(pt.x, pt.y, pt.z, fov, cx, cy);
        const alpha = 0.15 + 0.3 * p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = j % 2 === 0 ? `rgba(0, 14, 57, ${alpha})` : `rgba(0, 174, 239, ${alpha})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(drawSphere);
  }
  drawSphere();
}

// ── Floating particles (Electric Cyan bubbles) ────────────────
(function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = 8 + Math.random() * 12;
    const delay = Math.random() * -20;
    p.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      left:${x}%; top:${y}%;
      border-radius:50%;
      background:rgba(0, 174, 239, ${0.12 + Math.random() * 0.18});
      box-shadow:0 0 6px rgba(0, 212, 255, 0.2);
      animation: floatP ${dur}s ${delay}s ease-in-out infinite alternate;
      pointer-events:none;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatP {
      from { transform: translateY(0) translateX(0); }
      to   { transform: translateY(-${25 + Math.random()*35}px) translateX(${(Math.random()-0.5)*25}px); }
    }
  `;
  document.head.appendChild(style);
})();

// ── Parallax hero ─────────────────────────────────────────────
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroContent) heroContent.style.transform = `translateY(${y * 0.22}px)`;
}, { passive: true });

// ── Intersection Observer — fade-up + dividers + counters ─────
const fadeEls = document.querySelectorAll('.fade-up');
const dividerLines = document.querySelectorAll('.divider-line');
const counters = document.querySelectorAll('.stat-number');
const connectorLine = document.getElementById('connector-line');

const io = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      io.unobserve(el.target);
    }
  });
}, { threshold: 0.15 });

fadeEls.forEach(el => io.observe(el));

const dividerIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('drawn'); dividerIO.unobserve(e.target); }
  });
}, { threshold: 0.5 });

dividerLines.forEach(l => dividerIO.observe(l));

// ── Counter animation ─────────────────────────────────────────
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    counterIO.unobserve(el);

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(ease * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });

counters.forEach(c => counterIO.observe(c));

// ── Connector line trigger ─────────────────────────────────────
if (connectorLine) {
  const connIO = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      connectorLine.classList.add('animate');
      connIO.disconnect();
    }
  }, { threshold: 0.3 });
  connIO.observe(connectorLine);
}

// ── Active nav link on scroll ─────────────────────────────────
const sections = document.querySelectorAll('section[id], .trust-bar');
const navLinks = document.querySelectorAll('.nav-link');

const navIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navIO.observe(s));

// ── Contact form ──────────────────────────────────────────────
const form    = document.getElementById('contact-form');
const submit  = document.getElementById('form-submit');
const success = document.getElementById('form-success');

if (form && submit && success) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btnText   = submit.querySelector('.btn-text');
    const btnLoader = submit.querySelector('.btn-loader');
    submit.disabled = true;
    if (btnText) btnText.style.display   = 'none';
    if (btnLoader) btnLoader.style.display = 'block';

    setTimeout(() => {
      submit.disabled = false;
      if (btnText) btnText.style.display   = 'block';
      if (btnLoader) btnLoader.style.display = 'none';
      success.style.display   = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }, 1800);
  });
}

// ── Smooth anchor scroll ──────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Active nav style (Electric Blue for White Theme) ──────────
(function addNavStyle() {
  const s = document.createElement('style');
  s.textContent = `.nav-link.active { color: #00AEEF !important; font-weight: 700 !important; }`;
  document.head.appendChild(s);
})();
