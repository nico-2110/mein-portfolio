// ── State ──────────────────────────────────────────────────────────────────
let token = localStorage.getItem('admin_token') || null;
let editingId = null;
let featuredToggle = false;
let publishedToggle = true;
let editFeaturedVal = false;
let editPublishedVal = false;

// ── Init ───────────────────────────────────────────────────────────────────
if (token) showDashboard();

// ── Login ──────────────────────────────────────────────────────────────────
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('loginPw').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

async function login() {
  const pw = document.getElementById('loginPw').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falsches Passwort');
    token = data.token;
    localStorage.setItem('admin_token', token);
    showDashboard();
  } catch (err) {
    errEl.textContent = err.message;
  }
}

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboardScreen').style.display = 'flex';
  loadVideos();
  loadMessages();
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  token = null;
  localStorage.removeItem('admin_token');
  location.reload();
});

// ── Navigation ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page' + capitalize(item.dataset.page)).classList.add('active');
    if (item.dataset.page === 'videos') loadVideos();
    if (item.dataset.page === 'messages') loadMessages();
  });
});

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ── Toggle ─────────────────────────────────────────────────────────────────
function setupToggle(id, initialVal, onChange) {
  const el = document.getElementById(id);
  el.classList.toggle('on', initialVal);
  el.addEventListener('click', () => {
    const now = el.classList.toggle('on');
    onChange(now);
  });
  return el;
}

setupToggle('toggleFeatured', false, v => { featuredToggle = v; });
setupToggle('togglePublished', true, v => { publishedToggle = v; });
setupToggle('editToggleFeatured', false, v => { editFeaturedVal = v; });
setupToggle('editTogglePublished', false, v => { editPublishedVal = v; });

// ── Upload ─────────────────────────────────────────────────────────────────
const uploadArea = document.getElementById('uploadArea');
const videoFileInput = document.getElementById('videoFile');
let selectedFile = null;

uploadArea.addEventListener('click', () => videoFileInput.click());
videoFileInput.addEventListener('change', () => {
  if (videoFileInput.files[0]) selectFile(videoFileInput.files[0]);
});

uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('video/')) selectFile(file);
});

function selectFile(file) {
  selectedFile = file;
  uploadArea.innerHTML = `
    <div class="upload-icon">✅</div>
    <h3>${file.name}</h3>
    <p>${(file.size / 1024 / 1024).toFixed(1)} MB</p>
    <p class="file-hint">Klicke um ein anderes Video zu wählen</p>
  `;
}

document.getElementById('uploadBtn').addEventListener('click', uploadVideo);

async function uploadVideo() {
  const title = document.getElementById('upTitle').value.trim();
  if (!selectedFile) { toast('Bitte erst ein Video auswählen', 'error'); return; }
  if (!title) { toast('Bitte einen Titel eingeben', 'error'); return; }

  const formData = new FormData();
  formData.append('video', selectedFile);
  formData.append('title', title);
  formData.append('category', document.getElementById('upCategory').value);
  formData.append('client', document.getElementById('upClient').value);
  formData.append('year', document.getElementById('upYear').value);
  formData.append('description', document.getElementById('upDesc').value);
  formData.append('featured', featuredToggle);
  formData.append('published', publishedToggle);

  const progressWrap = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  progressWrap.style.display = 'block';

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', e => {
    if (e.lengthComputable) {
      const pct = Math.round(e.loaded / e.total * 100);
      progressFill.style.width = pct + '%';
      progressText.textContent = `Wird hochgeladen… ${pct}%`;
    }
  });

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      toast('Video erfolgreich hochgeladen! ✅', 'success');
      progressWrap.style.display = 'none';
      progressFill.style.width = '0';
      resetUploadForm();
    } else {
      toast('Fehler beim Upload', 'error');
      progressWrap.style.display = 'none';
    }
  });

  xhr.addEventListener('error', () => {
    toast('Netzwerkfehler', 'error');
    progressWrap.style.display = 'none';
  });

  xhr.open('POST', '/api/admin/videos');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send(formData);
}

function resetUploadForm() {
  selectedFile = null;
  videoFileInput.value = '';
  uploadArea.innerHTML = `
    <div class="upload-icon">🎬</div>
    <h3>Ziehe dein Video hierher</h3>
    <p>oder klicke zum Auswählen</p>
    <p class="file-hint">MP4, MOV, AVI, WEBM — max. 500 MB</p>
    <input type="file" id="videoFile" accept="video/*" style="display:none">
  `;
  document.getElementById('videoFile').addEventListener('change', () => {
    if (document.getElementById('videoFile').files[0]) selectFile(document.getElementById('videoFile').files[0]);
  });
  document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('videoFile').click());
  document.getElementById('upTitle').value = '';
  document.getElementById('upDesc').value = '';
  document.getElementById('upClient').value = '';
}

// ── Load Videos ────────────────────────────────────────────────────────────
async function loadVideos() {
  const wrap = document.getElementById('videoListWrap');
  wrap.innerHTML = '<div style="color:var(--text-muted);padding:20px">Lädt…</div>';
  try {
    const res = await fetch('/api/admin/videos', { headers: { Authorization: 'Bearer ' + token } });
    if (res.status === 401) { localStorage.removeItem('admin_token'); location.reload(); return; }
    const videos = await res.json();
    if (!videos.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="emoji">🎬</div><p>Noch keine Videos. Lade dein erstes hoch!</p></div>';
      return;
    }
    wrap.innerHTML = '';
    videos.forEach(v => wrap.appendChild(renderVideoItem(v)));
  } catch {
    wrap.innerHTML = '<div style="color:var(--red);padding:20px">Fehler beim Laden</div>';
  }
}

function renderVideoItem(v) {
  const el = document.createElement('div');
  el.className = 'video-item';
  el.id = 'videoItem-' + v.id;

  const thumbHtml = v.thumbnail
    ? `<img src="/uploads/${v.thumbnail}" alt="">`
    : '▶';

  el.innerHTML = `
    <div class="video-thumb">${v.thumbnail ? `<img src="/uploads/${v.thumbnail}" alt="">` : '▶'}</div>
    <div class="video-info">
      <div class="video-title">${v.title}</div>
      <div class="video-meta">${v.category} · ${v.year}${v.client ? ' · ' + v.client : ''}</div>
      <div class="video-badges">
        <span class="badge ${v.published ? 'badge-published' : 'badge-draft'}">${v.published ? 'Veröffentlicht' : 'Entwurf'}</span>
        ${v.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
      </div>
    </div>
    <div class="video-actions">
      <label class="thumb-upload-btn" title="Thumbnail hochladen">
        🖼 Thumb
        <input type="file" accept="image/*" style="display:none" onchange="uploadThumb('${v.id}', this)">
      </label>
      <button class="btn btn-sm btn-secondary" onclick="openEdit('${v.id}')">Bearbeiten</button>
      <button class="btn btn-sm ${v.published ? 'btn-secondary' : 'btn-success'}" onclick="togglePublish('${v.id}', ${!v.published})">
        ${v.published ? 'Verbergen' : 'Veröffentlichen'}
      </button>
      <button class="btn btn-sm btn-danger" onclick="deleteVideo('${v.id}')">Löschen</button>
    </div>
  `;
  return el;
}

async function uploadThumb(id, input) {
  const file = input.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('thumbnail', file);
  try {
    const res = await fetch(`/api/admin/videos/${id}/thumbnail`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: fd
    });
    if (res.ok) { toast('Thumbnail gespeichert ✅', 'success'); loadVideos(); }
    else toast('Fehler beim Thumbnail', 'error');
  } catch { toast('Fehler', 'error'); }
}

async function togglePublish(id, publish) {
  await fetch(`/api/admin/videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ published: publish })
  });
  toast(publish ? 'Veröffentlicht ✅' : 'Als Entwurf gespeichert', 'success');
  loadVideos();
}

async function deleteVideo(id) {
  if (!confirm('Video wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
  await fetch(`/api/admin/videos/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  toast('Video gelöscht', 'success');
  loadVideos();
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
let allVideosCache = [];

async function openEdit(id) {
  try {
    const res = await fetch('/api/admin/videos', { headers: { Authorization: 'Bearer ' + token } });
    const videos = await res.json();
    const v = videos.find(v => v.id === id);
    if (!v) return;
    editingId = id;
    document.getElementById('editTitle').value = v.title;
    document.getElementById('editCategory').value = v.category;
    document.getElementById('editClient').value = v.client || '';
    document.getElementById('editYear').value = v.year || '';
    document.getElementById('editDesc').value = v.description || '';
    editFeaturedVal = v.featured;
    editPublishedVal = v.published;
    document.getElementById('editToggleFeatured').classList.toggle('on', v.featured);
    document.getElementById('editTogglePublished').classList.toggle('on', v.published);
    document.getElementById('editModal').classList.add('open');
  } catch { toast('Fehler', 'error'); }
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
document.getElementById('editModal').addEventListener('click', e => { if (e.target === document.getElementById('editModal')) closeModal(); });

function closeModal() { document.getElementById('editModal').classList.remove('open'); editingId = null; }

document.getElementById('saveEditBtn').addEventListener('click', async () => {
  if (!editingId) return;
  const body = {
    title: document.getElementById('editTitle').value,
    category: document.getElementById('editCategory').value,
    client: document.getElementById('editClient').value,
    year: document.getElementById('editYear').value,
    description: document.getElementById('editDesc').value,
    featured: editFeaturedVal,
    published: editPublishedVal
  };
  await fetch(`/api/admin/videos/${editingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  toast('Änderungen gespeichert ✅', 'success');
  closeModal();
  loadVideos();
});

// ── Messages ───────────────────────────────────────────────────────────────
async function loadMessages() {
  const wrap = document.getElementById('messagesWrap');
  try {
    const res = await fetch('/api/admin/messages', { headers: { Authorization: 'Bearer ' + token } });
    const msgs = await res.json();
    const unread = msgs.filter(m => !m.read).length;
    const badge = document.getElementById('msgBadge');
    if (unread > 0) { badge.style.display = 'inline'; badge.textContent = unread; }
    else badge.style.display = 'none';

    if (!msgs.length) {
      wrap.innerHTML = '<div class="empty-state"><div class="emoji">📭</div><p>Noch keine Nachrichten.</p></div>';
      return;
    }
    wrap.innerHTML = '';
    msgs.forEach(m => {
      const el = document.createElement('div');
      el.className = 'message-item' + (m.read ? '' : ' unread');
      el.innerHTML = `
        <div class="msg-header">
          <div>
            <div class="msg-name">${m.name}</div>
            <div class="msg-email">${m.email}</div>
          </div>
          <div class="msg-date">${new Date(m.date).toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        </div>
        ${m.project ? `<span class="msg-project">${m.project}</span>` : ''}
        <div class="msg-text">${m.message}</div>
        <div class="msg-actions">
          <a href="mailto:${m.email}?subject=Re: Portfolio Anfrage" class="btn btn-sm btn-accent">Antworten</a>
          ${!m.read ? `<button class="btn btn-sm btn-secondary" onclick="markRead('${m.id}')">Als gelesen markieren</button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="deleteMsg('${m.id}')">Löschen</button>
        </div>
      `;
      wrap.appendChild(el);
    });
  } catch { wrap.innerHTML = '<div style="color:var(--red);padding:20px">Fehler</div>'; }
}

async function markRead(id) {
  await fetch(`/api/admin/messages/${id}/read`, { method: 'PUT', headers: { Authorization: 'Bearer ' + token } });
  loadMessages();
}

async function deleteMsg(id) {
  if (!confirm('Nachricht löschen?')) return;
  await fetch(`/api/admin/messages/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  toast('Nachricht gelöscht', 'success');
  loadMessages();
}

// ── Toast ──────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
