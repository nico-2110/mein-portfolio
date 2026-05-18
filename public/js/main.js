// ══════════════════════════════════════════════════════════════
// NICO PORTFOLIO — main.js
// ══════════════════════════════════════════════════════════════

// ── Language ──────────────────────────────────────────────────
const savedLang = localStorage.getItem('lang') || 'en';
applyLang(savedLang, false);

function applyLang(lang, save = true) {
  document.body.classList.remove('lang-en', 'lang-de');
  document.body.classList.add('lang-' + lang);
  if (save) localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-set-lang]').forEach(b => {
    b.classList.toggle('active', b.dataset.setLang === lang);
  });
}
document.querySelectorAll('[data-set-lang]').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.setLang));
});

// ── Preloader ─────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
if (preloader) {
  const letters = ['pl0','pl1','pl2','pl3'];
  letters.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('visible');
    }, 200 + i * 120);
  });
  setTimeout(() => {
    const curtain = document.getElementById('preloaderCurtain');
    if (curtain) curtain.style.transform = 'scaleY(1)';
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.transition = 'opacity .3s';
      setTimeout(() => preloader.style.display = 'none', 320);
    }, 700);
  }, 1400);
}

// ── Scroll Progress ───────────────────────────────────────────
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const h = document.documentElement;
  const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

// ── Nav Scroll ────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Mobile Menu ───────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;
menuBtn?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu?.classList.toggle('open', menuOpen);
  const spans = menuBtn.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(3px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-3px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => {
  mobileMenu?.classList.remove('open');
  menuOpen = false;
  menuBtn?.querySelectorAll('span').forEach(s => s.style.transform = '');
}));

// ── Custom Cursor ─────────────────────────────────────────────
const cursorEl = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let cx = 0, cy = 0, rx = 0, ry = 0;

if (cursorEl && cursorRing) {
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursorEl.style.left = cx + 'px';
    cursorEl.style.top = cy + 'px';
  }, { passive: true });

  (function animRing() {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .project-card, .filter-tab, .stat-box').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ── Page Transitions ──────────────────────────────────────────
const pt = document.getElementById('pageTransition');
document.querySelectorAll('[data-transition]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    if (href === window.location.pathname) return;
    e.preventDefault();
    if (!pt) { window.location.href = href; return; }
    pt.classList.add('entering');
    setTimeout(() => { window.location.href = href; }, 500);
  });
});
// Reveal on page load
window.addEventListener('pageshow', () => {
  if (pt) {
    pt.classList.add('leaving');
    setTimeout(() => pt.classList.remove('entering', 'leaving'), 600);
  }
});

// ── Scroll Reveal ─────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.04) + 's';
  revealObs.observe(el);
});

// ── Counter Animation ─────────────────────────────────────────
function runCounter(el) {
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

// Animate counters when stats come into view
document.querySelectorAll('.stats-row, .hero-stats').forEach(section => {
  if (!section) return;
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-count').forEach(runCounter);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 }).observe(section);
});

// Also run hero stats immediately (they're above fold)
setTimeout(() => {
  document.querySelectorAll('.hero-stats .stat-count').forEach(runCounter);
}, 1600);

// ── Hero Canvas Particles ─────────────────────────────────────
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let W = heroCanvas.width = window.innerWidth;
  let H = heroCanvas.height = window.innerHeight;
  let mx = W / 2, my = H / 2;
  const N = Math.min(Math.floor((W * H) / 16000), 70);
  let pts = [];

  class Pt {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r = Math.random() * 1.5 + .5;
      this.a = Math.random() * .4 + .08;
      this.ba = this.a;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      const dx = mx - this.x, dy = my - this.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      this.a = d < 140 ? Math.min(this.ba + .35, .7) : this.ba + (this.a - this.ba) * .95;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,135,255,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < N; i++) pts.push(new Pt());

  function connectPts() {
    const MAX = 130;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(79,135,255,${(1 - d / MAX) * .12})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.update(); p.draw(); });
    connectPts();
    requestAnimationFrame(frame);
  }
  frame();

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('resize', () => {
    W = heroCanvas.width = window.innerWidth;
    H = heroCanvas.height = window.innerHeight;
    pts = []; for (let i = 0; i < N; i++) pts.push(new Pt());
  }, { passive: true });
}

// ── Featured Videos (Home) ────────────────────────────────────
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid) {
  fetch('/api/videos')
    .then(r => r.json())
    .then(videos => {
      const featured = videos.filter(v => v.featured).slice(0, 3);
      const show = featured.length ? featured : videos.slice(0, 3);
      if (!show.length) {
        featuredGrid.innerHTML = '<p style="color:var(--text-2);text-align:center;grid-column:1/-1;padding:60px;font-size:.9rem">No projects yet. Upload your first in the admin panel.</p>';
        return;
      }
      featuredGrid.innerHTML = '';
      show.forEach((v, i) => {
        const card = buildCard(v, i);
        featuredGrid.appendChild(card);
        setTimeout(() => revealObs.observe(card), 50);
      });
    })
    .catch(() => {
      featuredGrid.innerHTML = '<p style="color:var(--text-2);text-align:center;grid-column:1/-1;padding:60px">Could not load projects.</p>';
    });
}

// ── Project Card Builder ──────────────────────────────────────
function buildCard(video, i = 0) {
  const card = document.createElement('div');
  card.className = 'project-card reveal';
  card.style.transitionDelay = (i * 0.07) + 's';
  card.dataset.category = video.category || '';
  card.dataset.title = (video.title || '').toLowerCase();

  const hasThumb = !!video.thumbnail;
  const hasVideo = !!video.filename;

  card.innerHTML = `
    <div class="project-card-media">
      ${hasThumb ? `<img class="project-card-thumb" src="/uploads/${video.thumbnail}" alt="${video.title}" loading="lazy">` : `<div class="project-card-no-media">▶</div>`}
      ${hasVideo ? `<video class="project-card-video" src="/uploads/${video.filename}" muted loop playsinline preload="none"></video>` : ''}
      <div class="project-card-overlay">
        <div class="project-card-play">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="project-card-cat">${video.category || 'Project'}</div>
        <h3 class="project-card-title">${video.title}</h3>
        <div class="project-card-meta">${video.client ? video.client + ' · ' : ''}${video.year || ''}</div>
      </div>
    </div>
    <div class="project-card-body">
      <div class="project-card-tags">
        ${video.category ? `<span class="project-card-tag">${video.category}</span>` : ''}
        ${video.year ? `<span class="project-card-tag">${video.year}</span>` : ''}
        ${video.client ? `<span class="project-card-tag">${video.client}</span>` : ''}
      </div>
    </div>
  `;

  // Hover video preview
  const vid = card.querySelector('.project-card-video');
  if (vid) {
    card.addEventListener('mouseenter', () => { vid.load(); vid.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
  }

  card.addEventListener('click', () => openLightbox(video));
  return card;
}

// ── Lightbox ──────────────────────────────────────────────────
function openLightbox(video) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lbCat').textContent = video.category || 'Project';
  document.getElementById('lbTitle').textContent = video.title;
  document.getElementById('lbDesc').textContent = video.description || '';
  const cw = document.getElementById('lbClientWrap');
  const cl = document.getElementById('lbClient');
  if (video.client) { cl.textContent = video.client; cw.style.display = ''; }
  else { cw.style.display = 'none'; }
  document.getElementById('lightboxVideo').src = `/uploads/${video.filename}`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  const v = document.getElementById('lightboxVideo');
  if (v) { v.pause(); v.src = ''; }
}

document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
document.getElementById('lightboxBg')?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
