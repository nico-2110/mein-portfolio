// ── Work Page: Load & Filter Videos ─────────────────────────────────────
const workGrid = document.getElementById('workGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
let allVideos = [];

async function loadVideos() {
  try {
    const res = await fetch('/api/videos');
    allVideos = await res.json();
    renderVideos('all');
    if (allVideos.length === 0) {
      document.getElementById('noVideos').style.display = '';
      workGrid.innerHTML = '';
    }
  } catch {
    workGrid.innerHTML = '<div class="loading-state"><p>Fehler beim Laden der Videos.</p></div>';
  }
}

function renderVideos(filter) {
  workGrid.innerHTML = '';
  const filtered = filter === 'all' ? allVideos : allVideos.filter(v => v.category === filter);

  if (filtered.length === 0) {
    workGrid.innerHTML = '<div class="loading-state"><p style="color:var(--text-muted)">Keine Videos in dieser Kategorie.</p></div>';
    return;
  }

  filtered.forEach((video, i) => {
    const card = createVideoCard(video, i);
    workGrid.appendChild(card);
    setTimeout(() => {
      revealObserver.observe(card);
    }, 10);
  });
}

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderVideos(btn.dataset.filter);
  });
});

// Init
loadVideos();
