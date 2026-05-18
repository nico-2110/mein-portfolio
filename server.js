require('dotenv').config();
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ─── Directories ──────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

[UPLOADS_DIR, DATA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(VIDEOS_FILE)) fs.writeFileSync(VIDEOS_FILE, JSON.stringify([]));
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/admin-panel', express.static(path.join(__dirname, 'admin')));

// ─── Multer Config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|avi|webm|mkv|m4v/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Nur Videodateien erlaubt'));
  }
});

const thumbnailUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const unique = 'thumb-' + Date.now() + path.extname(file.originalname);
      cb(null, unique);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpg|jpeg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Nur Bildformate erlaubt'));
  }
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
const readVideos = () => JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
const writeVideos = (data) => fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2));
const readMessages = () => JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
const writeMessages = (data) => fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));

// ─── Auth Middleware ───────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Nicht autorisiert' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token ungültig' });
  }
};

// ─── Routes: Public ────────────────────────────────────────────────────────────

// Get all published videos
app.get('/api/videos', (req, res) => {
  const videos = readVideos().filter(v => v.published);
  res.json(videos);
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, message, project } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle Felder ausfüllen' });
  }
  const messages = readMessages();
  const newMsg = {
    id: Date.now().toString(),
    name, email, message, project,
    date: new Date().toISOString(),
    read: false
  };
  messages.push(newMsg);
  writeMessages(messages);
  res.json({ success: true, message: 'Nachricht gesendet!' });
});

// ─── Routes: Admin Auth ────────────────────────────────────────────────────────

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Falsches Passwort' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// ─── Routes: Admin Videos ─────────────────────────────────────────────────────

// Get all videos (including unpublished)
app.get('/api/admin/videos', authMiddleware, (req, res) => {
  res.json(readVideos());
});

// Upload new video
app.post('/api/admin/videos', authMiddleware, upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Keine Videodatei' });
  const { title, description, category, client, year, featured } = req.body;
  const videos = readVideos();
  const newVideo = {
    id: Date.now().toString(),
    title: title || 'Untitled',
    description: description || '',
    category: category || 'Other',
    client: client || '',
    year: year || new Date().getFullYear().toString(),
    featured: featured === 'true',
    published: false,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    thumbnail: null,
    order: videos.length,
    createdAt: new Date().toISOString()
  };
  videos.push(newVideo);
  writeVideos(videos);
  res.json(newVideo);
});

// Upload thumbnail for video
app.post('/api/admin/videos/:id/thumbnail', authMiddleware, thumbnailUpload.single('thumbnail'), (req, res) => {
  const videos = readVideos();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video nicht gefunden' });
  if (!req.file) return res.status(400).json({ error: 'Kein Bild' });

  // Delete old thumbnail
  if (videos[idx].thumbnail) {
    const oldPath = path.join(UPLOADS_DIR, videos[idx].thumbnail);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  videos[idx].thumbnail = req.file.filename;
  writeVideos(videos);
  res.json({ thumbnail: req.file.filename });
});

// Update video metadata
app.put('/api/admin/videos/:id', authMiddleware, (req, res) => {
  const videos = readVideos();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video nicht gefunden' });
  const { title, description, category, client, year, featured, published, order } = req.body;
  videos[idx] = {
    ...videos[idx],
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(category !== undefined && { category }),
    ...(client !== undefined && { client }),
    ...(year !== undefined && { year }),
    ...(featured !== undefined && { featured }),
    ...(published !== undefined && { published }),
    ...(order !== undefined && { order }),
    updatedAt: new Date().toISOString()
  };
  writeVideos(videos);
  res.json(videos[idx]);
});

// Delete video
app.delete('/api/admin/videos/:id', authMiddleware, (req, res) => {
  const videos = readVideos();
  const idx = videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video nicht gefunden' });

  const video = videos[idx];
  const videoPath = path.join(UPLOADS_DIR, video.filename);
  if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
  if (video.thumbnail) {
    const thumbPath = path.join(UPLOADS_DIR, video.thumbnail);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }
  videos.splice(idx, 1);
  writeVideos(videos);
  res.json({ success: true });
});

// ─── Admin Messages ────────────────────────────────────────────────────────────
app.get('/api/admin/messages', authMiddleware, (req, res) => {
  res.json(readMessages().reverse());
});

app.put('/api/admin/messages/:id/read', authMiddleware, (req, res) => {
  const messages = readMessages();
  const idx = messages.findIndex(m => m.id === req.params.id);
  if (idx !== -1) messages[idx].read = true;
  writeMessages(messages);
  res.json({ success: true });
});

app.delete('/api/admin/messages/:id', authMiddleware, (req, res) => {
  let messages = readMessages();
  messages = messages.filter(m => m.id !== req.params.id);
  writeMessages(messages);
  res.json({ success: true });
});

// ─── SPA Fallback ──────────────────────────────────────────────────────────────
app.get('/work', (req, res) => res.sendFile(path.join(__dirname, 'public', 'work.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/admin-panel', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'index.html')));

// ─── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎬 Portfolio läuft auf http://localhost:${PORT}`);
  console.log(`🔧 Admin-Panel: http://localhost:${PORT}/admin-panel`);
  console.log(`\nAdmin-Passwort aus .env: ${ADMIN_PASSWORD}\n`);
});
