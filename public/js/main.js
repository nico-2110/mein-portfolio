// ── Language System ───────────────────────────────────────────────────────
const savedLang = localStorage.getItem('lang') || 'en';
setLang(savedLang, false);

function setLang(lang, save = true) {
  document.body.classList.remove('lang-en', 'lang-de');
  document.body.classList.add('lang-' + lang);
  if (save) localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setLang === lang);
  });
}
document.querySelectorAll('[data-set-lang]').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.setLang));
});

// ── Particle Network (the "Lamellen" effect) ──────────────────────────────
const canvas = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const ACCENT = '#bdee63';
  const COUNT = Math.min(Math.floor(W * H / 14000), 80);
  let particles = [];
  let mouse = { x: W / 2, y: H / 2 };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.baseOpacity = this.opacity;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      // React to mouse
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        this.opacity = Math.min(this.baseOpacity + 0.4, 0.7);
        this.x -= dx * 0.002;
        this.y -= dy * 0.002;
      } else {
        this.opacity += (this.baseOpacity - this.opacity) * 0.05;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(189,238,99,${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    const MAX_DIST = 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(189,238,99,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < Math.min(Math.floor(W * H / 14000), 80); i++) {
      particles.push(new Particle());
    }
  }, { passive: true });
}

// ── Custom Cursor ─────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

if (cursor && follower) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  }, { passive: true });

  document.querySelectorAll('a, button, .video-card, .filter-btn, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  (function animCursor() {
    fx += (mx - fx) * 0.1;
    fy += (my - fy) * 0.1;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animCursor);
  })();
}

// ── Nav Scroll ────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile Menu ───────────────────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

menuBtn?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu?.classList.toggle('open', menuOpen);
  const spans = menuBtn.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(3.25px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-3.25px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
    menuOpen = false;
    menuBtn?.querySelectorAll('span').forEach(s => s.style.transform = '');
  });
});

// ── Scroll Reveal ─────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.04) + 's';
  revealObs.observe(el);
});

// ── Counter Animation ─────────────────────────────────────────────────────
function animCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const dur = 1800;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const statsEl = document.querySelector('.stats');
if (statsEl) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-count').forEach(animCounter);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 }).observe(statsEl);
}

// ── Featured Videos (Home) ────────────────────────────────────────────────
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid) {
  fetch('/api/videos')
    .then(r => r.json())
    .then(videos => {
      const featured = videos.filter(v => v.featured).slice(0, 3);
      const toShow = featured.length ? featured : videos.slice(0, 3);
      if (!toShow.length) {
        featuredGrid.innerHTML = '<p style="color:var(--text-2);text-align:center;grid-column:1/-1;padding:60px">No projects yet — upload your first video in the admin panel.</p>';
        return;
      }
      featuredGrid.innerHTML = '';
      toShow.forEach((v, i) => {
        const card = buildVideoCard(v, i);
        featuredGrid.appendChild(card);
        setTimeout(() => revealObs.observe(card), 50);
      });
    })
    .catch(() => {
      featuredGrid.innerHTML = '<p style="color:var(--text-2);text-align:center;grid-column:1/-1;padding:60px">Could not load videos.</p>';
    });
}

// ── Video Card ────────────────────────────────────────────────────────────
function buildVideoCard(video, i = 0) {
  const card = document.createElement('div');
  card.className = 'video-card reveal';
  card.style.transitionDelay = (i * 0.08) + 's';
  card.dataset.category = video.category || '';

  const thumbHtml = video.thumbnail
    ? `<img class="video-card-thumb" src="/uploads/${video.thumbnail}" alt="${video.title}" loading="lazy">`
    : `<div class="video-card-no-thumb">▶</div>`;

  card.innerHTML = `
    ${thumbHtml}
    <div class="video-card-overlay">
      <div class="video-card-play">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div class="video-card-cat">${video.category || 'Video'}</div>
      <h3 class="video-card-title">${video.title}</h3>
      <div class="video-card-meta">${video.client ? video.client + ' · ' : ''}${video.year || ''}</div>
    </div>
  `;
  card.addEventListener('click', () => openLightbox(video));
  return card;
}

// ── Lightbox ──────────────────────────────────────────────────────────────
function openLightbox(video) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lightboxTitle').textContent = video.title;
  document.getElementById('lightboxCategory').textContent = video.category || 'Video';
  document.getElementById('lightboxYear').textContent = video.year || '';
  document.getElementById('lightboxDesc').textContent = video.description || '';
  const cw = document.getElementById('lightboxClientWrap');
  const cl = document.getElementById('lightboxClient');
  if (video.client) { cl.textContent = video.client; cw.style.display = ''; }
  else { cw.style.display = 'none'; }
  const vid = document.getElementById('lightboxVideo');
  vid.src = `/uploads/${video.filename}`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  const vid = document.getElementById('lightboxVideo');
  if (vid) { vid.pause(); vid.src = ''; }
}

document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
document.getElementById('lightboxOverlay')?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
