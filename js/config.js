const API_URL = "https://script.google.com/macros/s/AKfycbxEow_5oMstZhiPJYUKNtQNUSyZs95rvf-ax4Llna0D9KlIJxpH3fM9f7crkNkGOwab/exec";

const CACHE_TTL = 5 * 60 * 1000;
const SNOOZE_24H_MS = 24 * 60 * 60 * 1000;

const KEAGAMAAN_KATEGORI = {
    surah: { label: "Surah", icon: "fa-quran", judul: "Hafalan Al-Qur'an", warna: "emerald" },
    iqro: { label: "Iqro", icon: "fa-book-open-reader", judul: "Bacaan Iqro", warna: "amber" },
    doa: { label: "Doa", icon: "fa-hands-praying", judul: "Hafalan Doa", warna: "sky" }
};

const MASTER_IQRO = [1, 2, 3, 4, 5, 6].map(n => ({ no: n, nama: `Iqro ${n}` }));

const MASTER_DOA = [
    "Doa Bangun Tidur", "Doa Sebelum Tidur", "Doa Sebelum Makan", "Doa Sesudah Makan",
    "Doa Masuk Kamar Mandi", "Doa Keluar Kamar Mandi", "Doa Sebelum Wudhu", "Doa Sesudah Wudhu",
    "Doa Setelah Adzan", "Doa Masuk Masjid", "Doa Keluar Masjid", "Doa Sebelum Belajar",
    "Doa Berpakaian", "Doa Naik Kendaraan", "Doa untuk Kedua Orang Tua"
].map((nama, i) => ({ no: i + 1, nama }));

const MASTER_SURAHS = [
    { no: 1, nama: "Al-Fatihah", juz: 1 }, { no: 2, nama: "Al-Baqarah", juz: 1 }, { no: 3, nama: "Ali 'Imran", juz: 3 },
    { no: 4, nama: "An-Nisa'", juz: 4 }, { no: 5, nama: "Al-Ma'idah", juz: 6 }, { no: 6, nama: "Al-An'am", juz: 7 },
    { no: 7, nama: "Al-A'raf", juz: 8 }, { no: 8, nama: "Al-Anfal", juz: 9 }, { no: 9, nama: "At-Tawbah", juz: 10 },
    { no: 10, nama: "Yunus", juz: 11 }, { no: 11, nama: "Hud", juz: 11 }, { no: 12, nama: "Yusuf", juz: 12 },
    { no: 13, nama: "Ar-Ra'd", juz: 13 }, { no: 14, nama: "Ibrahim", juz: 13 }, { no: 15, nama: "Al-Hijr", juz: 14 },
    { no: 16, nama: "An-Nahl", juz: 14 }, { no: 17, nama: "Al-Isra'", juz: 15 }, { no: 18, nama: "Al-Kahf", juz: 15 },
    { no: 19, nama: "Maryam", juz: 16 }, { no: 20, nama: "Taha", juz: 16 }, { no: 21, nama: "Al-Anbiya'", juz: 17 },
    { no: 22, nama: "Al-Hajj", juz: 17 }, { no: 23, nama: "Al-Mu'minun", juz: 18 }, { no: 24, nama: "An-Nur", juz: 18 },
    { no: 25, nama: "Al-Furqan", juz: 18 }, { no: 26, nama: "Asy-Syu'ara'", juz: 19 }, { no: 27, nama: "An-Naml", juz: 19 },
    { no: 28, nama: "Al-Qasas", juz: 20 }, { no: 29, nama: "Al-Ankabut", juz: 20 }, { no: 30, nama: "Ar-Rum", juz: 21 },
    { no: 31, nama: "Luqman", juz: 21 }, { no: 32, nama: "As-Sajdah", juz: 21 }, { no: 33, nama: "Al-Ahzab", juz: 21 },
    { no: 34, nama: "Saba'", juz: 22 }, { no: 35, nama: "Fatir", juz: 22 }, { no: 36, nama: "Ya-Sin", juz: 22 },
    { no: 37, nama: "As-Saffat", juz: 23 }, { no: 38, nama: "Sad", juz: 23 }, { no: 39, nama: "Az-Zumar", juz: 23 },
    { no: 40, nama: "Gafir", juz: 24 }, { no: 41, nama: "Fussilat", juz: 24 }, { no: 42, nama: "Asy-Syura", juz: 25 },
    { no: 43, nama: "Az-Zukhruf", juz: 25 }, { no: 44, nama: "Ad-Dukhan", juz: 25 }, { no: 45, nama: "Al-Jasiyah", juz: 25 },
    { no: 46, nama: "Al-Ahqaf", juz: 26 }, { no: 47, nama: "Muhammad", juz: 26 }, { no: 48, nama: "Al-Fath", juz: 26 },
    { no: 49, nama: "Al-Hujurat", juz: 26 }, { no: 50, nama: "Qaf", juz: 26 }, { no: 51, nama: "Adz-Zariyat", juz: 26 },
    { no: 52, nama: "At-Tur", juz: 27 }, { no: 53, nama: "An-Najm", juz: 27 }, { no: 54, nama: "Al-Qamar", juz: 27 },
    { no: 55, nama: "Ar-Rahman", juz: 27 }, { no: 56, nama: "Al-Waqi'ah", juz: 27 }, { no: 57, nama: "Al-Hadid", juz: 27 },
    { no: 58, nama: "Al-Mujadilah", juz: 28 }, { no: 59, nama: "Al-Hasyr", juz: 28 }, { no: 60, nama: "Al-Mumtahanah", juz: 28 },
    { no: 61, nama: "As-Saff", juz: 28 }, { no: 62, nama: "Al-Jumu'ah", juz: 28 }, { no: 63, nama: "Al-Munafiqun", juz: 28 },
    { no: 64, nama: "At-Tagabun", juz: 28 }, { no: 65, nama: "At-Talaq", juz: 28 }, { no: 66, nama: "At-Tahrim", juz: 28 },
    { no: 67, nama: "Al-Mulk", juz: 29 }, { no: 68, nama: "Al-Qalam", juz: 29 }, { no: 69, nama: "Al-Haqqah", juz: 29 },
    { no: 70, nama: "Al-Ma'arij", juz: 29 }, { no: 71, nama: "Nuh", juz: 29 }, { no: 72, nama: "Al-Jinn", juz: 29 },
    { no: 73, nama: "Al-Muzzammil", juz: 29 }, { no: 74, nama: "Al-Muddassir", juz: 29 }, { no: 75, nama: "Al-Qiyamah", juz: 29 },
    { no: 76, nama: "Al-Insan", juz: 29 }, { no: 77, nama: "Al-Mursalat", juz: 29 }, { no: 78, nama: "An-Naba'", juz: 30 },
    { no: 79, nama: "An-Nazi'at", juz: 30 }, { no: 80, nama: "'Abasa", juz: 30 }, { no: 81, nama: "At-Takwir", juz: 30 },
    { no: 82, nama: "Al-Infitar", juz: 30 }, { no: 83, nama: "Al-Mutaffifin", juz: 30 }, { no: 84, nama: "Al-Insyiqaq", juz: 30 },
    { no: 85, nama: "Al-Buruj", juz: 30 }, { no: 86, nama: "At-Tariq", juz: 30 }, { no: 87, nama: "Al-A'la", juz: 30 },
    { no: 88, nama: "Al-Gasyiyah", juz: 30 }, { no: 89, nama: "Al-Fajr", juz: 30 }, { no: 90, nama: "Al-Balad", juz: 30 },
    { no: 91, nama: "Asy-Syams", juz: 30 }, { no: 92, nama: "Al-Lail", juz: 30 }, { no: 93, nama: "Ad-Duha", juz: 30 },
    { no: 94, nama: "Al-Insyirah", juz: 30 }, { no: 95, nama: "At-Tin", juz: 30 }, { no: 96, nama: "Al-'Alaq", juz: 30 },
    { no: 97, nama: "Al-Qadr", juz: 30 }, { no: 98, nama: "Al-Bayyinah", juz: 30 }, { no: 99, nama: "Az-Zalzalah", juz: 30 },
    { no: 100, nama: "Al-'Adiyat", juz: 30 }, { no: 101, nama: "Al-Qari'ah", juz: 30 }, { no: 102, nama: "At-Takasur", juz: 30 },
    { no: 103, nama: "Al-'Asr", juz: 30 }, { no: 104, nama: "Al-Humazah", juz: 30 }, { no: 105, nama: "Al-Fil", juz: 30 },
    { no: 106, nama: "Quraisy", juz: 30 }, { no: 107, nama: "Al-Ma'un", juz: 30 }, { no: 108, nama: "Al-Kautsar", juz: 30 },
    { no: 109, nama: "Al-Kafirun", juz: 30 }, { no: 110, nama: "An-Nasr", juz: 30 }, { no: 111, nama: "Al-Lahab", juz: 30 },
    { no: 112, nama: "Al-Ikhlas", juz: 30 }, { no: 113, nama: "Al-Falaq", juz: 30 }, { no: 114, nama: "An-Nas", juz: 30 }
];

const MASTER_KEBIASAAN = [
    { id: "K1", nama: "Bangun Pagi", icon: "fa-sun", color: "text-amber-500 bg-amber-50", nama_singkat: "Bangun Pagi", jam_default: "04:30", detail_default: "Bangun pagi segar, wudhu/berdoa dan merapikan tempat tidur", label_jam: "Jam Bangun Pagi (WITA)", label_detail: "Catatan Saat Bangun", placeholder_detail: "Contoh: Bangun jam 04.30 langsung wudhu dan merapikan tempat tidur" },
    { id: "K2", nama: "Beribadah", icon: "fa-pray", color: "text-emerald-500 bg-emerald-50", nama_singkat: "Beribadah", jam_default: "05:00", detail_default: "Melaksanakan salat/ibadah tepat waktu sesuai agama", label_jam: "Waktu Ibadah Utama (WITA)", label_detail: "Ibadah yang Dikerjakan", placeholder_detail: "Contoh: Salat Subuh berjamaah & tadarus Al-Qur'an" },
    { id: "K3", nama: "Berolahraga", icon: "fa-running", color: "text-blue-500 bg-blue-50", nama_singkat: "Berolahraga", jam_default: "06:00", detail_default: "Senam pagi / jalan sehat 15 menit", label_jam: "Waktu Berolahraga (WITA)", label_detail: "Jenis Olahraga & Durasi", placeholder_detail: "Contoh: Senam kesegaran jasmani / lari pagi 20 menit" },
    { id: "K4", nama: "Makan Sehat dan Bergizi", icon: "fa-apple-alt", color: "text-rose-500 bg-rose-50", nama_singkat: "Makan Sehat", jam_default: "06:30", detail_default: "Sarapan menu sehat seimbang dan minum air putih", label_jam: "Waktu Sarapan (WITA)", label_detail: "Menu Makanan & Minuman Sehat", placeholder_detail: "Contoh: Nasi, telur rebus, sayur bayam, dan air putih" },
    { id: "K5", nama: "Gemar Belajar", icon: "fa-book-open-reader", color: "text-indigo-500 bg-indigo-50", nama_singkat: "Gemar Belajar", jam_default: "19:00", detail_default: "Membaca buku pelajaran dan literasi mandiri", label_jam: "Waktu Mulai Belajar (WITA)", label_detail: "Materi / Buku yang Dipelajari", placeholder_detail: "Contoh: Belajar IPA dan membaca buku pengetahuan 30 menit" },
    { id: "K6", nama: "Bermasyarakat", icon: "fa-hands-helping", color: "text-purple-500 bg-purple-50", nama_singkat: "Bermasyarakat", jam_default: "16:00", detail_default: "Membantu orang tua di rumah dan menyapa tetangga", label_jam: "Waktu Beraktivitas (WITA)", label_detail: "Bentuk Kebaikan yang Dilakukan", placeholder_detail: "Contoh: Membantu orang tua membersihkan rumah dan menyapa tetangga" },
    { id: "K7", nama: "Tidur Cepat", icon: "fa-moon", color: "text-slate-600 bg-slate-100", nama_singkat: "Tidur Cepat", jam_default: "21:15", detail_default: "Tidur malam tepat waktu dan mematikan gawai", label_jam: "Jam Tidur Malam (WITA)", label_detail: "Aktivitas Sebelum Tidur", placeholder_detail: "Contoh: Tidur jam 21.15 setelah berdoa dan mematikan gawai" }
];

function applyKonfigKebiasaan(list) {
    if (!Array.isArray(list) || list.length === 0) return;
    const aktif = list.filter(k => k.aktif !== false).sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    if (aktif.length === 0) return;
    MASTER_KEBIASAAN.splice(0, MASTER_KEBIASAAN.length, ...aktif.map(k => ({
        id: String(k.id),
        nama: k.nama,
        nama_singkat: k.nama_singkat || k.nama,
        icon: k.ikon || "fa-check",
        color: k.warna || "text-slate-600 bg-slate-100",
        jam_default: k.jam_default || "",
        detail_default: k.detail_default || "",
        label_jam: k.label_jam || "Jam (WITA)",
        label_detail: k.label_detail || "Keterangan",
        placeholder_detail: k.placeholder_detail || ""
    })));
}
