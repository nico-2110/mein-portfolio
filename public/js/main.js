// ── Custom Cursor ──────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

if (cursor && follower) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  const links = document.querySelectorAll('a, button, .video-card, .filter-btn, .service-card');
  links.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// ── Navigation Scroll ─────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile Menu ───────────────────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

menuBtn?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu?.classList.toggle('open', menuOpen);
  const spans = menuBtn.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(4px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-4px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
    menuOpen = false;
    const spans = menuBtn?.querySelectorAll('span');
    if (spans) { spans[0].style.transform = ''; spans[1].style.transform = ''; }
  });
});

// ── Scroll Reveal ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-card').forEach((el, i) => {
  if (el.classList.contains('reveal-card')) {
    el.style.transitionDelay = (i % 4) * 0.1 + 's';
  }
  revealObserver.observe(el);
});

// ── Counter Animation ─────────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

// ── Load Featured Videos (Home Page) ─────────────────────────────────────
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid) {
  fetch('/api/videos')
    .then(r => r.json())
    .then(videos => {
      const featured = videos.filter(v => v.featured).slice(0, 3);
      const toShow = featured.length > 0 ? featured : videos.slice(0, 3);
      if (toShow.length === 0) {
        featuredGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:40px">Noch keine Projekte vorhanden.</p>';
        return;
      }
      featuredGrid.innerHTML = '';
      toShow.forEach((video, i) => {
        const card = createVideoCard(video, i);
        featuredGrid.appendChild(card);
        setTimeout(() => card.classList.add('visible'), i * 150);
      });
    })
    .catch(() => {
      featuredGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:40px">Fehler beim Laden der Videos.</p>';
    });
}

// ── Video Card Factory ────────────────────────────────────────────────────
function createVideoCard(video, i = 0) {
  const card = document.createElement('div');
  card.className = 'video-card reveal-card';
  card.style.transitionDelay = (i * 0.1) + 's';
  card.dataset.category = video.category;
  card.dataset.id = video.id;

  const thumbSrc = video.thumbnail ? `/uploads/${video.thumbnail}` : null;
  const thumbHtml = thumbSrc
    ? `<img class="video-card-thumb" src="${thumbSrc}" alt="${video.title}" loading="lazy">`
    : `<div class="video-card-no-thumb">▶</div>`;

  card.innerHTML = `
    ${thumbHtml}
    <div class="video-card-overlay">
      <div class="video-card-play">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <div class="video-card-category">${video.category || 'Video'}</div>
      <h3 class="video-card-title">${video.title}</h3>
      <div class="video-card-meta">${video.client ? video.client + ' · ' : ''}${video.year || ''}</div>
    </div>
  `;

  card.addEventListener('click', () => openLightbox(video));
  return card;
}

// ── Lightbox ──────────────────────────────────────────────────────────────
function openLightbox(video) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  document.getElementById('lightboxTitle').textContent = video.title;
  document.getElementById('lightboxCategory').textContent = video.category || 'Video';
  document.getElementById('lightboxYear').textContent = video.year || '';
  document.getElementById('lightboxDesc').textContent = video.description || '';
  const clientWrap = document.getElementById('lightboxClientWrap');
  const clientEl = document.getElementById('lightboxClient');
  if (video.client) {
    clientEl.textContent = video.client;
    clientWrap.style.display = '';
  } else {
    clientWrap.style.display = 'none';
  }
  const vid = document.getElementById('lightboxVideo');
  vid.src = `/uploads/${video.filename}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  const vid = document.getElementById('lightboxVideo');
  if (vid) { vid.pause(); vid.src = ''; }
}

document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
document.getElementById('lightboxOverlay')?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
