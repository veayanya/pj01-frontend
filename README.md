# InstaSave (Frontend) — Proyek Magang Perangkat Lunak Web

Frontend web application **InstaSave** yang dibuat oleh **Eva** untuk proyek magang perangkat lunak web. Aplikasi ini digunakan untuk mengunduh dan menyimpan berbagai konten publik Instagram (Reels, Posts, Carousels, dan Foto Profil) secara mudah dan cepat.

- **Frontend Tech Stack**: Vue 3 + Vite, HTML5, Vanilla CSS
- **Deployment**: Vercel ([Repository Frontend](https://github.com/veayanya/pj01-frontend))
- **Developer**: Eva

## 🚀 Jalankan Lokal

```bash
npm install
npm run dev
```

Server pengembangan lokal akan aktif di `http://localhost:5173`.

## 🌐 Integrasi & Deployment ke Vercel

Frontend ini terhubung ke backend **InstaSave** di Render.

| Environment Variable | Deskripsi |
|---|---|
| `VITE_API_BASE` | URL backend Render (contoh: `https://pj01-backend-apgn.onrender.com`) |
| `VITE_API_KEY` | Key autentikasi API (opsional / disesuaikan dengan backend) |

## 📁 Struktur Proyek Frontend

- `index.html` — Template utama HTML
- `src/main.js` — File entry point Vue 3
- `src/App.vue` — Komponen utama UI, logika, dan stylesheet
- `src/api.js` — Utility komunikasi API (membaca env `VITE_API_BASE`)
- `vercel.json` & `vite.config.js` — Konfigurasi build & routing deployment Vercel

---
© 2026 InstaSave · Dibuat oleh Eva
