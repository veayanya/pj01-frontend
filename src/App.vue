<template>
<div class="app-shell">

  <!-- NAVBAR -->
  <header class="navbar">
    <a class="brand" href="#">
      <div class="brand-icon">⚡</div>
      <span>parth-dl</span>
      <span class="brand-ver" v-if="serverVersion">v{{ serverVersion }}</span>
    </a>
    <nav>
      <a href="https://konversin.vercel.app/" target="_blank" rel="noopener">Konversin</a>
      <a href="https://github.com/veayanya/pj01-frontend" target="_blank" rel="noopener">GitHub</a>
      <a href="https://pypi.org/project/parth-dl/" target="_blank" rel="noopener">PyPI</a>
      <a href="https://github.com/veayanya/pj01-backend/tree/main/docs" target="_blank" rel="noopener">Dokumentasi</a>
    </nav>
  </header>

  <!-- HERO -->
  <section class="hero">

    <!-- Status badge -->
    <div class="badge live-only">
      <span class="badge-dot"></span>
      Server terhubung · Menyimpan ke <code style="font-size:11px;color:var(--violet);background:none">{{ downloadDir }}</code>
    </div>
    <div class="badge badge-offline landing-only">
      <span class="badge-dot"></span>
      Mode landing — jalankan <code style="font-size:11px;color:var(--violet);background:none">parth-dl serve</code> untuk mengaktifkan fitur unduh
    </div>

    <h1>Instagram<br><span class="grad">Pengunduh Video.</span></h1>
    <p class="subtitle">
      Unduh Reel, Video Postingan, Video Carousel, dan IGTV Instagram publik langsung dari browser.
      Ringan, tanpa dependensi tambahan, berbasis Python.
    </p>

    <!-- ====== LIVE MODE: Download form ====== -->
    <div class="live-only">
      <div class="download-card">
        <label for="url-input">Instagram URL</label>
        <div class="input-row">
          <input
            id="url-input"
            v-model="urlInput"
            type="url"
            placeholder="https://www.instagram.com/reel/..."
            autocomplete="off"
            :disabled="submitting"
            @keydown.enter.prevent="submit"
          />
          <select v-model="quality" :disabled="submitting">
            <option value="best">Kualitas terbaik</option>
            <option value="worst">File terkecil</option>
          </select>
          <button class="btn-submit" :disabled="submitting" @click="submit">
            <span v-if="submitting" class="spinner"></span>
            <span v-else>Unduh</span>
          </button>
        </div>
        <div class="input-meta">
          <span>🔒 Hanya konten publik, tanpa login</span>
          <button v-if="urlInput || jobs.length" class="btn-clear" @click="clearInput">Bersihkan</button>
        </div>
      </div>

      <!-- JOB QUEUE -->
      <div class="queue">
        <div class="job-card" v-for="job in jobs" :key="job.id">
          <img
            v-if="job.thumbnail"
            class="job-thumb"
            :src="job.thumbnail"
            alt=""
            referrerpolicy="no-referrer"
            @error="job.thumbnail = null"
          />
          <div v-else class="job-thumb" style="background:#e8e6f2;display:grid;place-items:center;color:#b8b4cc;font-size:22px">⚡</div>

          <div class="job-body">
            <p class="job-title">{{ job.title || job.url }}</p>
            <p class="job-detail" v-if="job.uploader">
              @{{ job.uploader }}<span v-if="job.type"> · {{ job.type }}</span><span v-if="job.itemCount > 1"> · {{ job.itemCount }} item</span>
            </p>
            <p class="job-meta">
              <span :class="{ 'job-err': job.state === 'error' }">{{ job.statusText }}</span>
            </p>

            <!-- Progress bar -->
            <div class="bar" v-if="job.state !== 'error' && job.state !== 'cancelled'">
              <div
                class="bar-fill"
                :class="{ indeterminate: job.percent < 0 }"
                :style="{ width: job.percent >= 0 ? job.percent + '%' : '' }"
              ></div>
            </div>

            <!-- Downloaded files -->
            <ul class="files" v-if="job.files && job.files.length">
              <li v-for="f in job.files" :key="f.path">
                <span class="file-name">{{ f.name }}<span v-if="f.existing" style="color:var(--ink-soft);font-weight:400"> (sudah ada)</span></span>
                <code class="file-path">{{ f.path }}</code>
                <a :href="f.url" target="_blank" rel="noopener">⬇ Unduh salinan</a>
              </li>
            </ul>

            <!-- Action buttons -->
            <div class="job-actions" v-if="job.canCancel || job.canRetry">
              <button v-if="job.canCancel" class="btn-action danger" @click="cancelJob(job)">Batalkan</button>
              <button v-if="job.canRetry" class="btn-action" @click="retryJob(job)">Coba lagi</button>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /live-only -->

    <!-- ====== LANDING MODE: Install prompt ====== -->
    <div class="landing-only">
      <!-- URL input (always usable, submit waits for server) -->
      <div class="download-card" style="margin-bottom:20px">
        <label for="url-input-landing">Tempel Link Instagram</label>
        <div class="input-row">
          <input
            id="url-input-landing"
            v-model="urlInput"
            type="url"
            placeholder="https://www.instagram.com/reel/..."
            autocomplete="off"
          />
          <button class="btn-submit" @click="showLandingHint = true">
            Unduh
          </button>
        </div>
        <div class="input-meta">
          <span>🔒 Hanya konten publik, tanpa login</span>
        </div>
        <div v-if="showLandingHint" class="landing-hint">
          ⚠️ Server belum terhubung. Jalankan <code>parth-dl serve</code> lalu muat ulang halaman ini, link yang kamu tempel akan langsung diproses.
        </div>
      </div>

      <div class="install-box">
        <code>pip install parth-dl</code>
        <button class="btn-copy" @click="copyInstall">{{ copyLabel }}</button>
      </div>
      <p style="color:var(--ink-soft);font-size:13px;margin:0 auto 8px;max-width:500px">
        Setelah terinstal, jalankan <code style="background:rgba(23,22,42,.06);padding:2px 7px;border-radius:6px;font-size:12px">parth-dl serve</code>
        lalu buka halaman ini kembali untuk mulai mengunduh.
      </p>
    </div>

    <div class="supported">
      <span>Didukung:</span>
      <span class="chip">Reel</span>
      <span class="chip">Video Postingan</span>
      <span class="chip">Video Carousel</span>
      <span class="chip">IGTV</span>
    </div>
  </section>

  <!-- HOW TO USE (always visible) -->
  <section class="section">
    <div class="section-heading">
      <span class="eyebrow">CARA PAKAI</span>
      <h2>Unduh dalam 3 langkah</h2>
    </div>
    <div class="steps">
      <article>
        <div class="step-number">01</div>
        <h3>Instal & Jalankan</h3>
        <p>Instal lewat pip lalu jalankan <code style="font-size:12px">parth-dl serve</code>. Server lokal akan aktif di port 8003.</p>
      </article>
      <article>
        <div class="step-number">02</div>
        <h3>Tempel URL</h3>
        <p>Salin link Instagram yang ingin diunduh lalu tempel ke kolom di atas dan pilih kualitas yang diinginkan.</p>
      </article>
      <article>
        <div class="step-number">03</div>
        <h3>File Tersimpan</h3>
        <p>File langsung tersimpan ke folder <code style="font-size:12px">downloads/</code> lokal. Klik "Unduh salinan" untuk simpan lewat browser.</p>
      </article>
    </div>
  </section>

  <!-- INFO SECTION (landing only) -->
  <div class="info-section landing-only">
    <div>
      <span class="eyebrow">INFO</span>
      <h2>Hanya untuk konten publik.</h2>
    </div>
    <p>
      parth-dl bekerja <strong>tanpa login, cookies, atau token</strong> Instagram.
      Alat ini hanya bisa mengunduh konten dari akun yang <strong>tidak di-private</strong>.
      Gunakan sesuai ketentuan Instagram dan hanya untuk konten yang memang boleh diunduh.
    </p>
  </div>

  <!-- FOOTER -->
  <footer>
    <span>© 2026 InstaSave</span>
    <span>Dibuat oleh <strong>Eva</strong></span>
  </footer>

</div><!-- /app-shell -->
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiFetch, apiPost, apiUrl } from './api'

// ── State ──────────────────────────────────────────────
const urlInput      = ref('')
const quality       = ref('best')
const submitting    = ref(false)
const serverVersion = ref('')
const downloadDir   = ref('./downloads')
const copyLabel     = ref('Salin')
const showLandingHint = ref(false)
const jobs          = ref([]) // [{id, url, title, uploader, type, itemCount, thumbnail, state, percent, statusText, files, canCancel, canRetry}]

// Track polling timers
const pollTimers = new Map()

// ── Helpers ────────────────────────────────────────────
function isActive(state) {
  return state === 'queued' || state === 'running'
}

// ── Job helpers ────────────────────────────────────────
function makeJob(snapshot) {
  return reactive({
    id: snapshot.id || null,
    url: snapshot.url || '',
    quality: snapshot.quality || quality.value,
    title: snapshot.url || 'Mempersiapkan…',
    uploader: null,
    type: null,
    itemCount: 0,
    thumbnail: null,
    state: snapshot.state || 'queued',
    percent: -1,
    statusText: snapshot.message || 'Mempersiapkan…',
    files: [],
    canCancel: false,
    canRetry: false,
  })
}

function applyInfo(job, info) {
  if (!info) return
  if (info.title) job.title = info.title
  if (info.uploader) job.uploader = info.uploader
  if (info.type) job.type = info.type
  if (info.thumbnail) job.thumbnail = info.thumbnail
  const itemCount = info.item_count ?? (info.entries || []).length
  if (itemCount) job.itemCount = itemCount
}

function applySnapshot(job, snap) {
  if (snap.id) job.id = snap.id
  if (snap.url) job.url = snap.url
  if (snap.quality) job.quality = snap.quality
  applyInfo(job, snap.media)

  job.state = snap.state

  if (snap.state === 'queued') {
    job.percent = -1
    job.statusText = snap.queue_position
      ? `Antri · posisi ${snap.queue_position}`
      : 'Antri…'
  } else if (snap.state === 'running') {
    job.percent = snap.percent >= 0 ? snap.percent : -1
    job.statusText = (snap.message || 'Mengunduh')
      + (snap.percent >= 0 ? ` · ${snap.percent}%` : '')
  } else if (snap.state === 'done') {
    job.percent = 100
    job.statusText = snap.message || '✓ Selesai'
    job.files = (snap.files || []).map(f => ({ ...f, url: apiUrl(f.url) }))
  } else if (snap.state === 'cancelled') {
    job.statusText = snap.message || 'Dibatalkan'
  } else if (snap.state === 'error') {
    job.statusText = snap.error || 'Unduh gagal'
    job.percent = -1
  } else {
    job.statusText = snap.message || 'Mempersiapkan…'
  }

  job.canCancel = !!job.id && isActive(snap.state)
  job.canRetry  = !!job.id && (snap.state === 'error' || snap.state === 'cancelled')
}

function startPoll(job) {
  if (pollTimers.has(job.id)) return
  const tick = () => {
    apiFetch('api/jobs/' + job.id)
      .then(snap => {
        applySnapshot(job, snap)
        if (isActive(snap.state)) {
          pollTimers.set(job.id, setTimeout(tick, 400))
        } else {
          pollTimers.delete(job.id)
        }
      })
      .catch(err => {
        job.state = 'error'
        job.statusText = err.message || 'Gagal memperbarui status'
        pollTimers.delete(job.id)
      })
  }
  pollTimers.set(job.id, setTimeout(tick, 400))
}

// ── Actions ────────────────────────────────────────────
async function submit() {
  const url = urlInput.value.trim()
  if (!url) return

  submitting.value = true
  urlInput.value = ''
  jobs.value = [] // Bersihkan hasil download sebelumnya tiap kali submit link baru

  const job = makeJob({ url, state: 'queued', message: 'Mengambil metadata…' })
  jobs.value.unshift(job)

  try {
    const info = await apiPost('api/info', { url })
    applyInfo(job, info)

    const result = await apiPost('api/download', { url, quality: quality.value })
    job.id = result.job_id

    const snap = await apiFetch('api/jobs/' + result.job_id)
    applySnapshot(job, snap)
    if (isActive(snap.state)) startPoll(job)

  } catch (err) {
    job.state = 'error'
    job.statusText = err.message || 'Unduh gagal'
    job.canRetry = true
  } finally {
    submitting.value = false
  }
}

async function cancelJob(job) {
  try {
    const snap = await apiPost(`api/jobs/${job.id}/cancel`, {})
    applySnapshot(job, snap)
  } catch (err) {
    job.statusText = err.message
  }
}

async function retryJob(job) {
  try {
    const result = await apiPost(`api/jobs/${job.id}/retry`, {})
    const newJobSnap = await apiFetch('api/jobs/' + result.job_id)
    // Replace old card with fresh one
    const idx = jobs.value.indexOf(job)
    const newJob = makeJob(newJobSnap)
    applySnapshot(newJob, newJobSnap)
    if (idx >= 0) jobs.value.splice(idx, 1, newJob)
    else jobs.value.unshift(newJob)
    if (isActive(newJobSnap.state)) startPoll(newJob)
  } catch (err) {
    job.statusText = err.message
  }
}

function clearInput() {
  urlInput.value = ''
  jobs.value = [] // Bersihkan kolom input dan kartu status download
}

async function copyInstall() {
  try {
    await navigator.clipboard.writeText('pip install parth-dl')
    copyLabel.value = '✓ Disalin'
    setTimeout(() => { copyLabel.value = 'Salin' }, 1600)
  } catch {}
}

// ── On mount: probe server ─────────────────────────────
onMounted(async () => {
  const root = document.documentElement
  try {
    const info = await apiFetch('api/health')
    root.dataset.mode = 'live'
    if (info.version) serverVersion.value = info.version
    if (info.download_dir) downloadDir.value = info.download_dir

    // Restore existing jobs
    const data = await apiFetch('api/jobs').catch(() => ({ jobs: [] }))
    ;(data.jobs || []).forEach(snap => {
      const job = makeJob(snap)
      applySnapshot(job, snap)
      jobs.value.push(job)
      if (isActive(snap.state)) startPoll(job)
    })

  } catch {
    root.dataset.mode = 'landing'
  }
})
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

:root {
  --ink: #17162a;
  --ink-soft: #5b5972;
  --paper: #ffffff;
  --cloud: #faf8ff;
  --pink: #ff3d77;
  --coral: #ff9257;
  --yellow: #ffc845;
  --violet: #6c5dd3;
  --green: #2fbd76;
  --line: rgba(23, 22, 42, .10);
  --line-strong: rgba(23, 22, 42, .18);
  --danger: #e0295b;

  font-family: Inter, system-ui, sans-serif;
  color: var(--ink);
  background: var(--cloud);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; background: var(--cloud); }
button, input, select { font: inherit; cursor: pointer; }
input { cursor: text; }

/* ─── APP SHELL ─── */
.app-shell { min-height: 100vh; overflow-x: hidden; }

/* ─── NAVBAR ─── */
.navbar {
  height: 80px;
  max-width: 1100px;
  margin: auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex; gap: 10px; align-items: center;
  color: var(--ink); text-decoration: none;
  font-family: Sora, sans-serif; font-weight: 800; font-size: 15px;
}

.brand-icon {
  width: 36px; height: 36px; border-radius: 11px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, var(--pink), var(--violet));
  color: #fff; font-family: Sora, sans-serif; font-size: 12px; font-weight: 700;
}

.brand-ver {
  font-size: 11px; font-weight: 500; color: var(--ink-soft);
  background: rgba(23,22,42,.07); border-radius: 999px;
  padding: 2px 8px; margin-left: 4px;
}

nav { display: flex; gap: 6px; align-items: center; }

nav a {
  color: var(--ink-soft); text-decoration: none;
  font-size: 13px; font-weight: 500;
  padding: 8px 14px; border-radius: 999px;
  transition: background .15s, color .15s;
}
nav a:hover { color: var(--ink); background: rgba(23,22,42,.06); }

/* ─── HERO ─── */
.hero {
  position: relative;
  width: min(900px, calc(100% - 32px));
  margin: auto;
  padding: 60px 0 90px;
  text-align: center;
  isolation: isolate;
}

.hero::before {
  content: ''; position: absolute; z-index: -1; border-radius: 50%;
  filter: blur(1px);
  width: 340px; height: 340px;
  top: -80px; left: -140px;
  background: var(--yellow); opacity: .50;
}
.hero::after {
  content: ''; position: absolute; z-index: -1; border-radius: 50%;
  width: 260px; height: 260px;
  bottom: 30px; right: -110px;
  background: var(--violet); opacity: .16;
}

.badge {
  display: inline-flex; align-items: center;
  border: 1px solid var(--line); background: var(--paper);
  color: var(--ink-soft); border-radius: 999px;
  padding: 7px 14px; font-size: 12px; font-weight: 600; gap: 6px;
}

.badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 3px rgba(47,189,118,.25);
}

.badge-offline .badge-dot { background: var(--ink-soft); box-shadow: none; }

h1 {
  margin: 24px 0 16px;
  font-family: Sora, sans-serif; font-weight: 800;
  font-size: clamp(40px, 7vw, 72px); line-height: 1.03; letter-spacing: -2px;
}

h1 .grad {
  background: linear-gradient(100deg, var(--pink), var(--coral));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.subtitle {
  max-width: 560px; margin: 0 auto 36px;
  color: var(--ink-soft); line-height: 1.75; font-size: 16px;
}

/* ─── INSTALL CARD (landing) ─── */
.install-box {
  display: flex; align-items: center; gap: 10px;
  background: var(--paper); border: 1px solid rgba(108,93,211,.25);
  border-radius: 14px; padding: 12px 18px; max-width: 420px; margin: 0 auto 24px;
}
.install-box code {
  flex: 1; font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 14px; color: var(--violet); background: none; border: 0;
}
.btn-copy {
  flex: none; border: 1px solid var(--line); background: var(--cloud);
  color: var(--ink-soft); border-radius: 8px; padding: 6px 14px;
  font-size: 12px; font-weight: 600; transition: .15s;
}
.btn-copy:hover { background: var(--ink); color: #fff; border-color: var(--ink); }

/* ─── DOWNLOAD CARD ─── */
.download-card {
  text-align: left; padding: 24px;
  border: 1px solid var(--line); border-radius: 24px;
  background: var(--paper);
  box-shadow: 0 30px 60px -20px var(--line-strong);
}

.download-card label {
  display: block; margin-bottom: 10px;
  font-size: 13px; font-weight: 700; color: var(--ink);
}

.input-row { display: flex; gap: 10px; }

.input-row input {
  min-width: 0; flex: 1; height: 52px;
  border: 1.5px solid var(--line); border-radius: 14px;
  outline: none; padding: 0 16px; color: var(--ink); background: var(--cloud);
  transition: border-color .15s, box-shadow .15s;
}
.input-row input:focus {
  border-color: var(--pink);
  box-shadow: 0 0 0 4px rgba(255,61,119,.11);
}

.input-row select {
  height: 52px; border: 1.5px solid var(--line); border-radius: 14px;
  background: var(--cloud); color: var(--ink); padding: 0 12px;
  outline: none; min-width: 130px;
  transition: border-color .15s;
}
.input-row select:focus { border-color: var(--pink); }

.btn-submit {
  height: 52px; border: 0; border-radius: 14px; padding: 0 26px;
  color: #fff; font-weight: 700;
  background: linear-gradient(120deg, var(--pink), var(--coral));
  transition: transform .2s, opacity .2s; white-space: nowrap;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); }
.btn-submit:disabled { opacity: .6; cursor: wait; }

.input-meta {
  margin-top: 11px; display: flex; justify-content: space-between;
  color: #9694a6; font-size: 11px; align-items: center;
}
.btn-clear {
  border: 0; background: transparent; color: var(--ink-soft);
  font-size: 12px; font-weight: 600; padding: 2px 0;
}
.btn-clear:hover { color: var(--danger); }

/* ─── LANDING HINT ─── */
.landing-hint {
  margin-top: 12px; padding: 12px 14px; border-radius: 12px;
  background: #fff8e6; border: 1px solid #ffc845;
  color: #7a5a00; font-size: 12px; font-weight: 500; line-height: 1.6;
  text-align: left;
}
.landing-hint code {
  background: rgba(0,0,0,.06); border-radius: 5px;
  padding: 1px 6px; font-size: 11px;
}

/* ─── MESSAGES ─── */
.message { margin: 12px 0 0; font-size: 13px; font-weight: 500; }
.error { color: var(--danger); }

/* ─── JOB QUEUE ─── */
.queue { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }

.job-card {
  border: 1px solid var(--line); border-radius: 18px;
  background: var(--cloud); padding: 16px; display: flex; gap: 14px;
}

.job-thumb {
  width: 64px; height: 64px; border-radius: 10px; object-fit: cover;
  flex: none; background: #e8e6f2; border: 1px solid var(--line); display: block;
}

.job-body { flex: 1; min-width: 0; }

.job-title {
  font-size: 14px; font-weight: 600; margin: 0 0 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink);
}
.job-detail { font-size: 12px; color: var(--ink-soft); margin: 0 0 3px; }
.job-meta { font-size: 12px; color: var(--ink-soft); margin: 0; }
.job-err { color: var(--danger); }

/* progress bar */
.bar {
  height: 5px; border-radius: 999px;
  background: rgba(23,22,42,.08); overflow: hidden; margin-top: 9px;
}
.bar-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--pink), var(--violet));
  transition: width .25s;
}
.bar-fill.indeterminate {
  width: 35% !important;
  animation: slide 1.1s ease-in-out infinite;
}
@keyframes slide { 0% { margin-left:-35%; } 100% { margin-left:100%; } }

/* files list */
.files { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.files li { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; font-size: 12px; }
.files .file-name { color: var(--ink); font-weight: 600; }
.files .file-path { color: var(--ink-soft); font-family: ui-monospace, Menlo, monospace; font-size: 11px; overflow-wrap: anywhere; }
.files a { color: var(--violet); font-weight: 600; text-decoration: none; }
.files a:hover { color: var(--pink); }

/* job action buttons */
.job-actions { display: flex; gap: 6px; margin-top: 8px; }
.btn-action {
  border-radius: 999px; border: 1px solid var(--line);
  padding: 5px 12px; font-size: 11px; font-weight: 700;
  background: var(--paper); color: var(--ink-soft); transition: .15s;
}
.btn-action:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
.btn-action.danger { background: var(--danger); color: #fff; border-color: var(--danger); }
.btn-action.danger:hover { opacity: .85; }

/* ─── PILLS / CHIPS ─── */
.supported { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 22px; color: #a29fb3; font-size: 11px; align-items: center; }
.chip { display: inline-flex; align-items: center; border: 1px solid var(--line); background: var(--paper); color: var(--ink-soft); border-radius: 999px; padding: 5px 12px; font-size: 11px; font-weight: 600; }

/* ─── STEPS SECTION ─── */
.section { width: min(1050px, calc(100% - 32px)); margin: auto; padding: 50px 0 80px; }
.section-heading { text-align: center; margin-bottom: 36px; }
.eyebrow { color: var(--pink); font-size: 12px; font-weight: 700; display: block; }
h2 { margin: 8px 0 0; font-family: Sora, sans-serif; font-weight: 800; font-size: clamp(26px, 4vw, 40px); letter-spacing: -1px; }

.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.steps article {
  padding: 24px; min-height: 180px;
  border: 1px solid var(--line); border-radius: 20px; background: var(--paper);
}
.steps article:nth-child(2) { background: #fff7ec; border-color: #ffe3ba; }
.steps article:nth-child(3) { background: #fdeef3; border-color: #fad0dd; }
.step-number { color: var(--pink); font-family: Sora, sans-serif; font-size: 13px; font-weight: 800; }
.steps h3 { margin: 30px 0 7px; font-family: Sora, sans-serif; font-size: 17px; }
.steps p { margin: 0; color: var(--ink-soft); line-height: 1.6; font-size: 13px; }

/* ─── INFO BOX (landing) ─── */
.info-section {
  width: min(1050px, calc(100% - 32px)); margin: 0 auto 80px;
  padding: 34px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
  align-items: center; border-radius: 24px;
  background: linear-gradient(120deg, #efe9ff, #fdeef1);
}
.info-section p { margin: 0; color: var(--ink); line-height: 1.8; font-size: 14px; }
.info-section strong { color: var(--pink); }

/* ─── FOOTER ─── */
footer {
  max-width: 1100px; margin: auto; padding: 22px 24px 36px;
  display: flex; justify-content: space-between; align-items: center;
  color: #9694a6; font-size: 12px;
  border-top: 1px solid var(--line);
}
footer a { color: var(--ink-soft); text-decoration: none; font-weight: 600; }
footer a:hover { color: var(--pink); }
footer strong { color: var(--ink); }

/* ─── SPINNER ─── */
.spinner {
  width: 16px; height: 16px; display: inline-block;
  border: 2px solid rgba(255,255,255,.4); border-top-color: white;
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── RESPONSIVE ─── */
@media (max-width: 700px) {
  .navbar { height: 64px; }
  nav a { padding: 7px 10px; font-size: 12px; }
  .hero { padding-top: 48px; }
  h1 { letter-spacing: -1px; }
  .input-row { flex-direction: column; }
  .input-row button, .input-row select { width: 100%; }
  .steps, .info-section { grid-template-columns: 1fr; }
  .info-section { gap: 22px; }
  footer { flex-direction: column; gap: 8px; text-align: center; }
}

/* ─── MODE SWITCHING ─── */
[data-mode="loading"] .live-only,
[data-mode="loading"] .landing-only { display: none !important; }
[data-mode="live"] .landing-only { display: none !important; }
[data-mode="landing"] .live-only { display: none !important; }
</style>
