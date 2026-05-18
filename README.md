# 🎬 Video Editor Portfolio

Eine professionelle Portfolio-Website für Videoeditoren mit Admin-Panel.

---

## 🚀 Schnellstart

### 1. Node.js installieren
→ https://nodejs.org (Version 18+ empfohlen)

### 2. Abhängigkeiten installieren
```bash
cd portfolio
npm install
```

### 3. Umgebungsvariablen einrichten
```bash
cp .env.example .env
```
Öffne `.env` und ändere:
- `ADMIN_PASSWORD` → dein gewünschtes Passwort
- `JWT_SECRET` → ein langer zufälliger String

### 4. Server starten
```bash
npm start
```

Die Website ist jetzt erreichbar unter:
- **Portfolio:** http://localhost:3000
- **Admin-Panel:** http://localhost:3000/admin-panel

---

## 📁 Struktur

```
portfolio/
├── server.js          # Backend (Node.js/Express)
├── package.json       # Dependencies
├── .env               # Konfiguration (nicht in Git!)
├── data/
│   ├── videos.json    # Video-Metadaten
│   └── messages.json  # Kontaktnachrichten
├── uploads/           # Hochgeladene Videos & Thumbnails
├── public/            # Frontend
│   ├── index.html     # Startseite
│   ├── work.html      # Portfolio-Seite
│   ├── contact.html   # Kontaktseite
│   ├── css/style.css  # Design
│   └── js/            # JavaScript
└── admin/             # Admin-Panel
    └── index.html
```

---

## ✏️ Anpassen

### Name & Infos ändern
Suche in allen HTML-Dateien nach `YOURNAME` und `YOUR` und ersetze es mit deinem Namen.

In `contact.html`:
- `deine@email.com` → deine echte E-Mail
- `Berlin, Deutschland` → dein Standort
- Social-Media-Links anpassen

### Statistiken anpassen (index.html)
```html
<span class="stat-number" data-count="50">  ← Zahl ändern
```

### Farben ändern (style.css)
```css
--accent: #e8c97a;   ← Hauptfarbe (Gold)
--bg: #080808;       ← Hintergrundfarbe
```

---

## 🎬 Videos hochladen

1. Gehe zu http://localhost:3000/admin-panel
2. Passwort eingeben (aus `.env`)
3. **Upload**: Video per Drag & Drop oder Klick hochladen
4. Titel, Kategorie, Kunde, Jahr eingeben
5. Optional: Als "Featured" markieren (erscheint auf Startseite)
6. "Veröffentlichen" anschalten → Video erscheint live

---

## 🌐 Deployment (Online stellen)

### Option A: Railway (empfohlen, kostenlos)
1. https://railway.app → Konto erstellen
2. "New Project" → "Deploy from GitHub"
3. Repository hochladen, `.env` Variablen setzen
4. Custom Domain unter Settings hinzufügen

### Option B: Render
1. https://render.com → Konto erstellen
2. "New Web Service" → GitHub verbinden
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables aus `.env` eintragen

### Option C: VPS / Eigener Server
```bash
# PM2 für dauerhaften Betrieb installieren
npm install -g pm2
pm2 start server.js --name portfolio
pm2 save
pm2 startup
```

### Domain verknüpfen
Bei Railway/Render gibt es unter "Settings" einen Bereich für Custom Domains.
Dort deinen A-Record oder CNAME auf den Anbieter zeigen lassen.

---

## 📧 E-Mail-Benachrichtigungen (optional)

In `.env` SMTP-Einstellungen eintragen:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine@gmail.com
SMTP_PASS=dein-app-passwort
CONTACT_RECEIVER=deine@email.com
```

→ Dann `server.js` anpassen und `nodemailer` aktivieren.

---

## 🔒 Sicherheitshinweise

- Setze ein starkes `ADMIN_PASSWORD` (min. 12 Zeichen)
- Generiere einen langen `JWT_SECRET` (z.B. mit `openssl rand -hex 32`)
- Pushe niemals deine `.env`-Datei auf GitHub (steht bereits in `.gitignore`)

---

Viel Erfolg mit deinem Portfolio! 🚀
