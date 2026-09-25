# parth-dl (frontend)

UI parth-dl, sekarang sebagai proyek Vue 3 + Vite (bukan lagi satu file HTML
dengan Vue via CDN) — komponen di `src/App.vue`, entry di `src/main.js`.
Fungsinya sama persis dengan UI bawaan yang disajikan backend saat
`parth-dl serve`, hanya strukturnya jadi proyek Vue biasa supaya Vercel bisa
mendeteksinya sebagai framework Vite/Vue dan build otomatis.

## Jalankan lokal

```bash
npm install
npm run dev
```

Default (tanpa `.env`) UI ini memanggil API dengan path relatif — cocok
kalau kamu proxy `/api` ke backend lokal, atau untuk development UI saja.
Untuk memanggil backend Render dari dev server lokal, salin `.env.example`
ke `.env` dan isi `VITE_API_BASE` + `VITE_API_KEY`.

## Deploy ke Vercel (dipasangkan dengan backend di Render)

Karena frontend (Vercel) dan backend (Render) beda origin, isi dua
Environment Variables ini di project Vercel (Project Settings →
Environment Variables), bukan lewat file:

| Env var | Isi |
|---|---|
| `VITE_API_BASE` | URL backend Render kamu, tanpa trailing slash, mis. `https://parth-dl-backend-xxxx.onrender.com` |
| `VITE_API_KEY` | Harus sama persis dengan `PARTH_DL_API_KEY` di backend |

Nilai ini di-*bake* ke dalam bundle JS saat build (`npm run build`), jadi
tetap terlihat siapa pun yang buka DevTools/lihat source — anggap sebagai
penghalang orang iseng, bukan autentikasi kuat.

### Langkah deploy

1. Deploy dulu `backend/` ke Render (lihat README backend), catat URL-nya
   dan `PARTH_DL_API_KEY` yang kamu set.
2. Push folder `frontend/` ini sebagai repo GitHub sendiri.
3. Di Vercel: **Add New → Project → Import** repo ini. Vercel akan
   mendeteksi framework **Vite** otomatis (build command `npm run build`,
   output `dist` — sudah dikunci lewat `vercel.json` juga).
4. Sebelum/atau setelah deploy pertama, isi `VITE_API_BASE` dan
   `VITE_API_KEY` di Environment Variables project, lalu **Redeploy**
   (env var Vite hanya kepakai saat build, bukan runtime).
5. Setelah frontend live, catat domainnya (`https://xxx.vercel.app`), lalu
   set env `PARTH_DL_CORS_ORIGIN` di Render ke domain itu persis (termasuk
   `https://`), dan redeploy backend supaya CORS-nya aktif untuk domain
   tersebut.

## Struktur

- `index.html` — entry HTML Vite (cuma shell, mount point `#app`)
- `src/main.js` — bootstrap Vue app
- `src/App.vue` — seluruh UI (template, logic, style) dalam satu SFC
- `src/api.js` — helper `apiFetch`/`apiPost`/`apiUrl`, baca `VITE_API_BASE` & `VITE_API_KEY`
- `public/cli.gif` — demo GIF (aset statis, disalin apa adanya oleh Vite)
- `vercel.json`, `vite.config.js`, `.env.example` — konfigurasi build & deploy

Publish asli project ini: https://github.com/parthmax2/parth-dl
