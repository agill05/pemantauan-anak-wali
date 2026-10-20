<div align="center">

<img src="assets/img/logo-sekolah.png" alt="Logo Aplikasi Pemantauan Anak Wali" width="110">

# 🏫 Aplikasi Pemantauan Anak Wali

**Antarmuka (UI/UX) untuk memantau presensi, kebiasaan, hafalan, akademik, dan pembinaan siswa SMP.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📖 Tentang Proyek

**Aplikasi Pemantauan Anak Wali** adalah aplikasi web (PWA) untuk membantu sekolah memantau perkembangan siswa dalam satu tempat. Guru wali dan mentor mencatat presensi, kebiasaan harian, hafalan, nilai, serta catatan pembinaan. Siswa mengisi kebiasaan dan jurnal hariannya sendiri. Orang tua dapat melihat perkembangan anak lewat tautan khusus tanpa perlu membuat akun.

> ⚠️ **Repositori ini hanya berisi frontend (UI/UX).**
> Backend, database, dan logika server **sengaja tidak disertakan**. Anda perlu membangun backend sendiri sesuai kebutuhan sekolah Anda. Kontrak komunikasi antara frontend dan backend dijelaskan di bagian [Kontrak API Backend](#-kontrak-api-backend).

## ✨ Fitur Utama

### Pemantauan
- **Presensi kehadiran** harian per kelas, termasuk presensi mentor. Presensi yang diisi saat offline disimpan lokal dan dikirim otomatis begitu koneksi kembali.
- **7 Kebiasaan Hebat**: Bangun Pagi, Beribadah, Berolahraga, Makan Sehat dan Bergizi, Gemar Belajar, Bermasyarakat, dan Tidur Cepat. Daftar kebiasaan dapat dikonfigurasi dari backend.
- **Jurnal harian** siswa, lengkap dengan catatan dari guru.
- **Keagamaan**: pencatatan hafalan Surah (114 surah beserta juz), bacaan Iqro 1–6, dan hafalan doa harian.
- **Akademik dan prestasi**: nilai per mata pelajaran, input massal, serta catatan prestasi siswa.

### Pembinaan dan Kedisiplinan
- **Catatan pembinaan** dengan notifikasi dan penanda "sudah ditangani".
- **Tata tertib**: pencatatan pelanggaran, master data aturan, pemanggilan orang tua, pratinjau, dan laporan rekap.

### Laporan dan Arsip
- **Dashboard** ringkasan per kelas, menu cepat, dan agenda pembinaan mendatang, dilengkapi grafik.
- **Laporan** rekap yang dapat diekspor ke **PDF**.
- **Arsip semester** untuk menyimpan dan membuka kembali data semester lama, dengan ekspor CSV.

### Manajemen (Admin)
- Kelola **kelas, guru, siswa**, akun kepala sekolah, semester, dan pengaturan aplikasi.
- **Impor massal** data siswa dan guru dari file CSV.
- **Kartu akun** siswa dengan QR code.
- **Reset password** dan penghapusan data massal dengan konfirmasi.

### Teknis
- **Multi-peran**: `admin`, `guru` (dengan peran wali dan/atau mentor), `kepsek`, `siswa`, dan `ortu`. Menu menyesuaikan peran yang login.
- **Magic link untuk orang tua**: tautan sementara berlaku 15 menit, tanpa kata sandi.
- **PWA**: dapat dipasang ke layar utama, memakai *service worker*, dan menampilkan banner saat offline.
- **Pembaruan senyap**: sesi diperbarui otomatis dan notifikasi dicek berkala.
- **Aksesibilitas**: dukungan navigasi keyboard (`a11y-nav.js`).
- **Maskot interaktif** untuk membuat tampilan lebih ramah bagi siswa.
- **Responsif**: tampil nyaman di ponsel, tablet, dan desktop.

## 👥 Peran Pengguna

| Peran | Akses |
|---|---|
| **Admin** | Seluruh fitur pemantauan, laporan, arsip, dan Master Data |
| **Guru** | Presensi, kebiasaan, jurnal, keagamaan, akademik, pembinaan, tata tertib, data siswa, laporan |
| **Kepala Sekolah** | Seperti guru, ditambah akun khusus kepala sekolah |
| **Siswa** | Mengisi kebiasaan dan jurnal sendiri, melihat keagamaan, akademik, tata tertib, dan arsip semester |
| **Orang Tua** | Melihat profil anak lewat magic link |

## 🗂️ Struktur Proyek

```
.
├── index.html               # Seluruh tampilan (login, dashboard, dan semua view)
├── manifest.json            # Konfigurasi PWA
├── sw.js                    # Service worker
├── package.json             # Skrip build dan dependensi Tailwind
├── tailwind.config.js       # Konfigurasi tema Tailwind
├── vercel.json              # Konfigurasi deploy dan header cache
├── src/
│   └── tailwind.css         # Sumber Tailwind
├── scripts/
│   └── build.js             # Menyalin file ke folder dist saat build
├── css/
│   ├── style.css            # Gaya kustom
│   └── maskot.css           # Gaya maskot
├── assets/img/              # Logo, latar, dan ikon PWA
└── js/
    ├── config.js            # URL API dan data master (surah, iqro, doa, kebiasaan)
    ├── state.js             # State aplikasi global
    ├── api.js               # Pemanggil API, retry, sinkronisasi offline
    ├── ui.js                # Komponen UI bersama
    ├── pdf.js               # Ekspor PDF
    ├── install.js           # Ajakan pasang PWA
    ├── maskot.js            # Logika maskot
    ├── a11y-nav.js          # Aksesibilitas navigasi
    ├── main.js              # Titik masuk aplikasi
    └── modules/
        ├── auth.js          ├── absensi.js       ├── kebiasaan.js
        ├── jurnal.js        ├── keagamaan.js     ├── akademik.js
        ├── pembinaan.js     ├── tatib.js         ├── tatib-laporan.js
        ├── dashboard.js     ├── laporan.js       ├── siswa.js
        ├── grup-siswa.js    ├── kartu.js         ├── admin.js
        ├── arsip.js         ├── bulk.js          └── magiclink.js
```

## 🚀 Memulai

### Prasyarat
- [Node.js](https://nodejs.org/) (untuk membangun CSS Tailwind)
- Backend yang sudah Anda siapkan (lihat bagian berikutnya)

### Langkah-langkah

1. *Clone* repositori dan pasang dependensi.

   ```bash
   git clone https://github.com/gemorca/<nama-repo>.git
   cd <nama-repo>
   npm install
   ```

2. Arahkan aplikasi ke backend Anda. Buka `js/config.js` lalu ganti nilai `API_URL`.

   ```js
   const API_URL = "https://alamat-backend-anda.example/endpoint";
   ```

3. Bangun CSS Tailwind. Berkas `css/tailwind.css` tidak disertakan di repositori, jadi langkah ini wajib.

   ```bash
   npm run build:css
   ```

4. Jalankan dengan server statis apa saja.

   ```bash
   npx serve .
   ```

   Lalu buka alamat yang ditampilkan di terminal.

**Mode pengembangan:** jalankan `npm run watch:css` di terminal terpisah agar CSS dibangun ulang otomatis saat Anda mengubah kelas Tailwind.

## 🔌 Kontrak API Backend

Frontend berkomunikasi dengan **satu endpoint** lewat `POST`. Format ini cocok untuk backend seperti Google Apps Script, Node.js, maupun serverless function.

**Permintaan**

```
POST {API_URL}
Content-Type: text/plain;charset=utf-8
```

```json
{
  "action": "namaAksi",
  "token": "token-sesi-atau-null",
  "payload": { },
  "request_id": "uuid-unik-per-permintaan"
}
```

**Respons**

```json
{ "status": "success", "data": { } }
```

```json
{ "status": "error", "message": "Pesan untuk pengguna", "code": "KODE_OPSIONAL" }
```

Kode galat yang dikenali frontend: `DATE_LOCKED` dan `DATE_FUTURE` (presensi pada tanggal yang sudah terkunci atau belum tiba).

**Respons yang wajib ada**

| Aksi | Keterangan |
|---|---|
| `login` | Menerima `{ role, username, password }`. Mengembalikan `{ status, token, user }` |
| `refreshToken` | Mengembalikan `{ status, token, user }` baru. Dipanggil tiap 10 menit |
| `getBootstrapData` | Mengembalikan `data.initial` berisi `kelas`, `guru`, `siswa`, dan `pengaturan` |
| `getVersi` | Penanda versi data agar frontend tahu kapan perlu memuat ulang |

Objek `user` memakai bidang seperti `id`, `nama`, `username`, `role`, `foto`, `nip` atau `nisn`, serta penanda `is_wali` dan `is_mentor` untuk guru.

**Daftar aksi yang dipanggil frontend**

| Kelompok | Aksi |
|---|---|
| Sesi | `login`, `validateSession`, `refreshToken`, `changePassword`, `updateSelfProfile`, `hapusFotoProfil`, `getMagicLinkData`, `generateMagicLink` |
| Data induk | `getBootstrapData`, `getVersi`, `getDashboardData`, `saveKelas`, `deleteKelas`, `saveGuru`, `deleteGuru`, `saveSiswa`, `deleteSiswa`, `importSiswaBatch`, `importGuruBatch`, `cariSiswaSekolah`, `ambilSiswa`, `setMentorBatch`, `getDetailSiswa`, `getKartuAkun` |
| Presensi | `getAbsensi`, `saveAbsensi`, `getAbsensiMentor`, `saveAbsensiMentor` |
| Kebiasaan | `getKebiasaan`, `saveKebiasaan`, `getKebiasaanRentang`, `getRingkasanKebiasaan`, `getLaporanKebiasaan`, `getKonfigKebiasaan`, `saveKonfigKebiasaan` |
| Jurnal dan keagamaan | `getJurnal`, `saveJurnal`, `saveCatatanJurnal`, `getKeagamaan`, `saveKeagamaan`, `deleteKeagamaan` |
| Akademik | `getAkademik`, `getSiswaAkademik`, `saveAkademik`, `saveAkademikBulk`, `deleteAkademik`, `getPrestasi`, `savePrestasi`, `deletePrestasi` |
| Pembinaan dan notifikasi | `getPembinaan`, `savePembinaan`, `deletePembinaan`, `getNotifikasi`, `setNotifDitangani`, `restoreNotifDitangani` |
| Tata tertib | `getTatib`, `saveTatib`, `deleteTatib`, `getTatibMaster`, `saveTatibMaster`, `saveTatibKonfig`, `getTatibPanggilan`, `saveTatibPanggilan`, `deleteTatibPanggilan`, `getTatibPratinjau`, `getRekapTatib` |
| Laporan dan arsip | `getLaporanRekap`, `getArsipData`, `getArsipList`, `getArsipSaya`, `hitungHapus`, `bulkDestroy` |
| Admin | `savePengaturan`, `saveSemester`, `getAkunKepsek`, `resetPasswordSiswa`, `resetPasswordKepsek` |

> Bentuk data rinci untuk setiap aksi bisa dilihat dari cara modul di `js/modules/` membaca respons, misalnya `absensi.js` untuk presensi dan `tatib.js` untuk tata tertib.

**Saran backend:** Google Apps Script dengan Google Sheets sebagai database adalah cara termudah untuk memulai. Anda juga bebas memakai Node.js, PHP, atau layanan lain selama kontrak di atas dipenuhi.

## ⚙️ Kustomisasi

| Yang ingin diubah | Lokasi |
|---|---|
| Alamat backend | `API_URL` di `js/config.js` |
| Panjang minimal kata sandi | `PASSWORD_MIN_LENGTH` di `js/config.js` |
| Lama cache data dan interval cek notifikasi | `CACHE_TTL` dan `NOTIF_POLL_MS` di `js/config.js` |
| Daftar kebiasaan bawaan | `MASTER_KEBIASAAN` di `js/config.js` (atau atur dari backend lewat `getKonfigKebiasaan`) |
| Daftar surah, iqro, dan doa | `MASTER_SURAHS`, `MASTER_IQRO`, `MASTER_DOA` di `js/config.js` |
| Nama sekolah, judul, dan logo | `index.html`, `manifest.json`, dan folder `assets/img/` |
| Warna tema | `tailwind.config.js` (`primary`, `secondary`, `accent`, `background`, `surface`) |
| Versi cache PWA | `CACHE_NAME` di `sw.js` (naikkan setiap rilis baru) |

## 🌐 Deploy ke Vercel

Konfigurasi sudah disiapkan di `vercel.json`.

1. Import repositori ke [Vercel](https://vercel.com/).
2. Vercel otomatis memakai perintah build `npm run build` dan folder output `dist`.
3. Pastikan `API_URL` di `js/config.js` sudah mengarah ke backend produksi Anda.
4. Deploy.

Berkas HTML, JS, dan CSS dikirim dengan `must-revalidate` agar pembaruan langsung terlihat, sedangkan folder `assets/` di-*cache* lebih lama.

## 🔒 Catatan Keamanan dan Privasi

Aplikasi ini menangani **data pribadi siswa**. Sebelum dipakai di sekolah:

- Verifikasi token, peran, dan hak akses **harus dilakukan di backend**, bukan hanya di frontend.
- Simpan kata sandi dalam bentuk *hash*, jangan teks biasa.
- Gunakan HTTPS dan batasi akses ke database Anda.
- Pastikan penggunaan data siswa sesuai kebijakan sekolah dan peraturan perlindungan data yang berlaku.

## 🛠️ Teknologi

- **HTML5**, **JavaScript** (Vanilla, tanpa framework), dan [Tailwind CSS](https://tailwindcss.com/) 3.4
- **Progressive Web App**: Web App Manifest dan Service Worker
- [Chart.js](https://www.chartjs.org/) untuk grafik
- [jsPDF](https://github.com/parallax/jsPDF) dan [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) untuk ekspor PDF
- [PapaParse](https://www.papaparse.com/) untuk impor CSV
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) untuk QR code
- [SweetAlert2](https://sweetalert2.github.io/) untuk dialog dan notifikasi
- [Font Awesome](https://fontawesome.com/) untuk ikon
- [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Plus Jakarta Sans)

## 👤 Kredit

Seluruh antarmuka, kode, dan desain proyek ini dibuat sepenuhnya oleh:

**Moh. Agil S. Abdul**
[GitHub](https://github.com/gemorca) · [Instagram](https://instagram.com/mohammadagill)

> Pustaka pihak ketiga yang disebutkan di bagian Teknologi tetap menjadi milik masing-masing pembuatnya dan digunakan sesuai lisensi mereka.

## 📄 Lisensi

Hak Cipta © 2026 **Moh. Agil S. Abdul**.

Kode sumber frontend dalam repositori ini dilisensikan di bawah **[Lisensi MIT](LICENSE)**. Anda bebas memakai, mengubah, dan membagikannya dengan tetap mencantumkan pemberitahuan hak cipta di atas.

**Pengecualian:** logo sekolah, logo Tut Wuri Handayani, foto latar, dan ikon aplikasi di folder `assets/img/` adalah identitas milik sekolah atau pihak terkait dan **tidak termasuk** dalam lisensi ini. Ganti dengan aset milik sekolah Anda sebelum digunakan.

---

<div align="center">

**Aplikasi Pemantauan Anak Wali** · Dibuat sendiri oleh Moh. Agil S. Abdul.

</div>
