# Panduan Deployment ke Vercel & Konfigurasi Pengiriman Email Dokumen Project

Panduan lengkap untuk mendeploy aplikasi **Monitoring PMO Relokasi Fiber Optic** ke **Vercel** lengkap dengan dukungan Serverless Function untuk pengiriman email dokumen proyek (Pengajuan Material, Pengajuan BOQ Labour, dan Pengajuan Material & BOQ Labour).

---

## 1. Arsitektur Deployment di Vercel

Aplikasi ini telah dikonfigurasi dengan struktur siap-deploy (*Zero-Config Vercel Support*):
- **Frontend SPA**: React 19 + TypeScript + Vite + Tailwind CSS (di-build ke direktori `dist`).
- **Serverless API**: `api/send-email.ts` berjalan di Vercel Serverless Function (Node.js runtime) untuk menangani pengiriman email via SMTP (Nodemailer) maupun mode simulasi cerdas.
- **Vercel Routing**: `vercel.json` telah dikonfigurasi dengan rewrite rule untuk mendukung routing SPA dan API endpoint `/api/*`.

---

## 2. Langkah-Langkah Deployment ke Vercel

### Langkah 1: Push Repositori ke GitHub / GitLab / Bitbucket
Pastikan seluruh file proyek telah di-commit ke repositori Git Anda:
```bash
git add .
git commit -m "feat: tambahkan fitur pengiriman email dokumen dan konfigurasi vercel"
git push origin main
```

### Langkah 2: Hubungkan ke Vercel Dashboard
1. Buka [https://vercel.com](https://vercel.com) dan login ke akun Vercel Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repositori Git proyek Anda lalu klik **"Import"**.

### Langkah 3: Konfigurasi Project Settings di Vercel
Vercel akan otomatis mendeteksi konfigurasi melalui `vercel.json`:
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (Default)
- **Build Command**: `vite build` atau `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

---

## 3. Konfigurasi Environment Variables di Vercel

Pada menu **Settings > Environment Variables** di Vercel dashboard, tambahkan variabel berikut:

| Nama Variabel | Wajib / Opsional | Contoh Nilai | Keterangan |
|---|---|---|---|
| `GEMINI_API_KEY` | Opsional | `AIzaSy...` | API Key untuk fitur AI Studio / Gemini |
| `APP_URL` | Direkomendasikan | `https://nama-proyek.vercel.app` | URL domain Vercel publik Anda |
| `VITE_APP_URL` | Direkomendasikan | `https://nama-proyek.vercel.app` | URL aplikasi untuk client frontend |
| `SMTP_HOST` | Diperlukan utk Kirim Riil | `smtp.gmail.com` | Host SMTP Server (Gmail / Outlook / Link Net) |
| `SMTP_PORT` | Diperlukan utk Kirim Riil | `587` | Port SMTP (587 untuk TLS atau 465 untuk SSL) |
| `SMTP_SECURE` | Opsional | `false` | `true` untuk port 465, `false` untuk port 587 |
| `SMTP_USER` | Diperlukan utk Kirim Riil | `chaerulloh28@gmail.com` | Alamat email akun pengirim SMTP |
| `SMTP_PASS` | Diperlukan utk Kirim Riil | `abcd efgh ijkl mnop` | **App Password** Gmail (bukan password biasa) |
| `SMTP_FROM` | Opsional | `PMO Relokasi FO <chaerulloh28@gmail.com>` | Nama & alamat pengirim yang tampil di email |

> **Tips Gmail App Password**:
> Jika menggunakan Gmail:
> 1. Aktifkan **2-Step Verification** di Google Account Anda.
> 2. Buka menu **Security > App Passwords**.
> 3. Buat App Password baru dengan nama `PMO System`.
> 4. Salin 16 digit password tersebut ke variabel `SMTP_PASS`.

---

## 4. Fitur Pengiriman Email Dokumen Project

Aplikasi menyediakan modal interaktif **"Kirim Dokumen Project via Email"** yang dapat diakses langsung dari:
1. **Sheet 5: Document Project Hub** (tombol *Kirim via Email* di header proyek terpilih).
2. **Manajer Berkas Dokumen** (tombol *Kirim via Email* di samping tab kategori pengajuan).
3. **Detail Drawer Proyek** (pada panel *Sheet 5: Document Project*).

### 3 Pilihan Kategori Pengiriman:
1. **Hanya Pengajuan Material**:
   - Melampirkan/menghubungkan berkas perizinan, Surat Dinas, Rekomtek, APD Relokasi, KMZ, dan Form CE Material.
   - Subjek email otomatis: `[Pengajuan Material] - {DSB-ID} ({Project ID}) - {Segment Relokasi}`.
2. **Hanya Pengajuan BOQ Labour**:
   - Melampirkan berkas teknis, Surat Dinas, Rekomtek, BA Survey Bersama/Internal, APD, dan Form BOQ Labour.
   - Subjek email otomatis: `[Pengajuan BOQ Labour] - {DSB-ID} ({Project ID}) - {Segment Relokasi}`.
3. **Pengajuan Material & BOQ Labour (Lengkap)**:
   - Paket pengajuan lengkap mencakup Material Requisition sekaligus BOQ Labour (11 Dokumen).
   - Subjek email otomatis: `[Pengajuan Material & BOQ Labour] - {DSB-ID} ({Project ID}) - {Segment Relokasi}`.

### Dukungan Tembusan (CC ke Berbagai Alamat Email):
- Mendukung banyak alamat email sekaligus (dipisahkan koma atau tombol Enter).
- Terdapat tombol chip saran kontak cepat:
  - `pic.govrel@linknet.co.id`
  - `waspang.dsb@linknet.co.id`
  - `procurement.relokasi@linknet.co.id`
  - `planning.fiber@linknet.co.id`
  - `vendor.operasional@mitra.com`
  - `pmo.relokasi@linknet.co.id`

### 3 Opsi Pengiriman Fleksibel:
1. **Kirim via Serverless API / SMTP**:
   - Mengirim secara langsung melalui endpoint Vercel `/api/send-email`.
   - Menggunakan transport SMTP riil saat kredensial SMTP telah diisi di Vercel.
2. **Buka di Mail App / Outlook**:
   - Membuka aplikasi email lokal (Outlook / Thunderbird / Apple Mail) dengan format `mailto:` lengkap beserta `To`, `CC`, subjek, dan draft tubuh pesan resmi.
3. **Buka di Gmail Web**:
   - Membuka satu klik tab baru di Google Chrome untuk compose langsung di Gmail Web.

---

## 5. Menjalankan & Menguji Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Jalankan build production lokal untuk menguji
npm run build
npm run preview
```
Aplikasi dapat diakses di `http://localhost:3000`.
