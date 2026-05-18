// ── Language System ───────────────────────────────────────────────────────
const savedLang = localStorage.getItem('lang') || 'en';
setLang(savedLang, false);

function setLang(lang, save = true) {
  document.body.classList.remove('lang-en', 'lang-de');
  document.body.classList.add('lang-' + lang);
  if (save) localStorage.setItem('lang', lang);

  document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setLang === lang);
  });
}

document.querySelectorAll('[data-set-lang]').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.setLang));
});

// ── Custom Cursor ─────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;

if (cursor && follower) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  const hoverEls = document.querySelectorAll('a, button, .video-card, .filter-btn, .service-card, .lang-btn, .mobile-lang-btn');
  hoverEls.forEach(el => {
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
    spans[0].style.transform = 'translateY(3.5px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-3.5px) rotate(-45deg)';
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
  el.style.transitionDelay = (i * 0.05) + 's';
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

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-count').forEach(animCounter);
    }
  });
}, { threshold: 0.5 }).observe(document.querySelector('.stats') || document.createElement('div'));

// ── Featured Videos (Home) ────────────────────────────────────────────────
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid) {
  fetch('/api/videos')
    .then(r => r.json())
    .then(videos => {
      const featured = videos.filter(v => v.featured).slice(0, 3);
      const toShow = featured.length ? featured : videos.slice(0, 3);
      if (!toShow.length) {
        featuredGrid.innerHTML = '<p style="color:var(--text-2);text-align:center;grid-column:1/-1;padding:40px">No projects yet.</p>';
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
      featuredGrid.innerHTML = '<p style="color:var(--text-2);text-align:center;grid-column:1/-1;padding:40px">Could not load videos.</p>';
    });
}

// ── Video Card Builder ────────────────────────────────────────────────────
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
