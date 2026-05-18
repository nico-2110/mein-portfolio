// ── Projects Page JS ──────────────────────────────────────────
const grid = document.getElementById('projectsGrid');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
let allVideos = [];
let activeFilter = 'all';
let searchTerm = '';

async function loadProjects() {
  try {
    const res = await fetch('/api/videos');
    allVideos = await res.json();
    renderProjects();
  } catch {
    grid.innerHTML = '<div class="loading-state"><p>Could not load projects.</p></div>';
  }
}

function renderProjects() {
  grid.innerHTML = '';
  const filtered = allVideos.filter(v => {
    const matchCat = activeFilter === 'all' || v.category === activeFilter;
    const matchSearch = !searchTerm || v.title.toLowerCase().includes(searchTerm) || (v.description || '').toLowerCase().includes(searchTerm) || (v.category || '').toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });

  if (!filtered.length) {
    noResults.style.display = '';
    return;
  }
  noResults.style.display = 'none';

  filtered.forEach((v, i) => {
    const card = buildCard(v, i);
    grid.appendChild(card);
    setTimeout(() => revealObs.observe(card), 20);
  });
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderProjects();
  });
});

// Search
searchInput?.addEventListener('input', e => {
  searchTerm = e.target.value.toLowerCase().trim();
  renderProjects();
});

// Init
loadProjects();
