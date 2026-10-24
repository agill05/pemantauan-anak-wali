const BANTUAN_VERSI = 1;
const BANTUAN_VERSI_PERAN = { admin: 2 };

const BANTUAN_TUR = {
    siswa: [
        { ikon: "fa-hand-sparkles", judul: "Selamat datang!", teks: "Aplikasi ini membantumu mencatat kebiasaan baik dan jurnal harian. Tur singkat ini hanya butuh satu menit." },
        { ikon: "fa-house", judul: "Beranda dan misi hari ini", teks: "Halaman Beranda menampilkan misi hari ini: mengisi kebiasaan dan jurnal. Selesaikan keduanya setiap hari." },
        { ikon: "fa-star", judul: "7 Kebiasaan Hebat", teks: "Buka Kebiasaan, lalu isi tiap kebiasaan yang sudah kamu lakukan hari ini. Perubahan tersimpan otomatis. Hari yang sudah lewat hanya bisa dilihat." },
        { ikon: "fa-book-open", judul: "Jurnal Harian", teks: "Tulis refleksi singkat tentang harimu. Tulisan yang belum dikirim tersimpan sebagai draf. Catatan dari guru juga muncul di halaman ini." },
        { ikon: "fa-eye", judul: "Halaman untuk dilihat", teks: "Keagamaan, Akademik & Prestasi, Tata Tertib, dan Arsip Semester menampilkan data dari guru. Halaman ini hanya untuk dibaca." },
        { ikon: "fa-circle-question", judul: "Butuh bantuan?", teks: "Ketuk tanda tanya di bagian atas layar kapan saja. Bantuannya menyesuaikan halaman yang sedang kamu buka." }
    ],
    guru: [
        { ikon: "fa-hand-sparkles", judul: "Selamat datang!", teks: "Tur singkat ini menunjukkan alur kerja harian Anda. Hanya butuh sekitar dua menit." },
        { ikon: "fa-house", judul: "Beranda", teks: "Beranda berisi ringkasan kelas, menu cepat, dan agenda pembinaan mendatang. Mulai hari dari sini." },
        { ikon: "fa-calendar-check", judul: "Presensi", teks: "Pilih tanggal, ketuk Set Semua Hadir, lalu ubah hanya siswa yang izin, sakit, alpa, atau terlambat. Presensi yang diisi saat offline akan terkirim otomatis begitu internet kembali." },
        { ikon: "fa-pen-to-square", judul: "Catat perkembangan siswa", teks: "Kebiasaan, Jurnal, Keagamaan, dan Akademik dicatat per siswa. Pilih siswa lebih dulu, lalu isi. Nilai satu kelas bisa dimasukkan sekaligus lewat tombol Massal." },
        { ikon: "fa-user-pen", judul: "Pembinaan dan Tata Tertib", teks: "Catat masalah dan tindak lanjut di Pembinaan. Catat pelanggaran atau penghargaan di Tata Tertib. Lonceng di atas memberi tahu jika ada yang perlu ditangani." },
        { ikon: "fa-file-pdf", judul: "Laporan dan orang tua", teks: "Menu Laporan mengekspor rekap ke PDF atau Excel. Di Data Siswa, Anda bisa membuat tautan pemantauan untuk orang tua dan mengirimnya lewat WhatsApp. Tautan berlaku 15 menit." },
        { ikon: "fa-circle-question", judul: "Butuh bantuan?", teks: "Ketuk tanda tanya di bagian atas layar. Bantuannya menyesuaikan halaman yang sedang dibuka. Tur ini bisa diulang dari menu Bantuan." }
    ],
    kepsek: [
        { ikon: "fa-hand-sparkles", judul: "Selamat datang!", teks: "Tur singkat ini menunjukkan cara memantau sekolah dari aplikasi ini." },
        { ikon: "fa-house", judul: "Beranda", teks: "Beranda berisi ringkasan per kelas, grafik, dan agenda pembinaan mendatang." },
        { ikon: "fa-eye", judul: "Pemantauan", teks: "Buka Presensi, Kebiasaan, Keagamaan, Akademik, Pembinaan, dan Tata Tertib dari menu. Pilih kelas atau siswa untuk melihat rinciannya." },
        { ikon: "fa-file-pdf", judul: "Laporan", teks: "Menu Laporan mengekspor rekap ke PDF atau Excel. Gunakan filter kelas dan status untuk mempersempit data." },
        { ikon: "fa-circle-question", judul: "Butuh bantuan?", teks: "Ketuk tanda tanya di bagian atas layar. Bantuannya menyesuaikan halaman yang sedang dibuka." }
    ],
    bk: [
        { ikon: "fa-hand-sparkles", judul: "Selamat datang!", teks: "Tur singkat ini menunjukkan tiga hal yang bisa Anda kerjakan sebagai Guru BK." },
        { ikon: "fa-house", judul: "Beranda", teks: "Beranda berisi ringkasan dan notifikasi Tata Tertib, seperti siswa yang mencapai batas poin dan panggilan orang tua." },
        { ikon: "fa-gavel", judul: "Tata Tertib", teks: "Anda bisa melihat semua siswa. Ketuk Catat untuk mencatat pelanggaran atau penghargaan. Surat panggilan orang tua bisa dicetak dan ditandatangani atas nama Anda." },
        { ikon: "fa-calendar-check", judul: "Presensi BK", teks: "Catat kehadiran siswa pada layanan BK. Rekap tersedia untuk rentang tanggal yang Anda pilih." },
        { ikon: "fa-circle-question", judul: "Butuh bantuan?", teks: "Ketuk tanda tanya di bagian atas layar. Bantuannya menyesuaikan halaman yang sedang dibuka." }
    ],
    admin: [
        { ikon: "fa-hand-sparkles", judul: "Selamat datang!", teks: "Tur singkat ini menunjukkan area kerja admin. Hanya butuh sekitar dua menit." },
        { ikon: "fa-house", judul: "Beranda", teks: "Beranda berisi ringkasan semua kelas, grafik, dan agenda pembinaan." },
        { ikon: "fa-database", judul: "Master Data", teks: "Kelola Guru, Guru BK, Siswa, Kelas, Mentor, Sekolah, Kebiasaan, dan Tata Tertib. Data guru, siswa, dan Guru BK bisa diimpor dari CSV. Unduh Template CSV dulu agar formatnya sesuai. Ketuk Pilih di daftar untuk menghapus beberapa data sekaligus." },
        { ikon: "fa-pen-to-square", judul: "Koreksi data lama", teks: "Hanya admin yang bisa mengubah presensi dan kebiasaan pada tanggal yang sudah lewat. Halaman akan menampilkan tanda Mode koreksi admin." },
        { ikon: "fa-box-archive", judul: "Arsip semester", teks: "Simpan data semester lama di menu Arsip, buka lagi kapan saja, dan ekspor ke CSV." },
        { ikon: "fa-clock-rotate-left", judul: "Backup dan pemulihan", teks: "Menu Backup menyimpan salinan seluruh data ke Drive. Backup berjalan otomatis setiap hari dan bisa dibuat manual. Jika data terhapus atau rusak, ketuk Pulihkan pada backup yang diinginkan lalu pilih sheet yang perlu dikembalikan." },
        { ikon: "fa-key", judul: "Reset kata sandi", teks: "Guru dan siswa yang lupa kata sandi meminta reset ke admin. Reset dilakukan dari Master Data." },
        { ikon: "fa-circle-question", judul: "Butuh bantuan?", teks: "Ketuk tanda tanya di bagian atas layar. Bantuannya menyesuaikan halaman yang sedang dibuka." }
    ]
};

const BANTUAN_HALAMAN = {
    dashboard: {
        ikon: "fa-house", judul: "Beranda",
        ringkas: "Ringkasan pemantauan dan jalan pintas ke fitur yang sering dipakai.",
        langkah: [
            "Lihat ringkasan kelas dan grafik di bagian atas.",
            "Ketuk menu cepat untuk langsung membuka fitur.",
            "Cek agenda pembinaan mendatang di bagian bawah."
        ],
        tips: ["Ketuk ikon segarkan di header jika data terasa belum terbaru."],
        peran: {
            siswa: {
                ringkas: "Misi hari ini dan ringkasan perkembanganmu.",
                langkah: [
                    "Lihat misi hari ini: kebiasaan dan jurnal.",
                    "Ketuk misi untuk langsung mengisinya.",
                    "Selesaikan semua misi agar harimu tercatat lengkap."
                ]
            },
            admin: {
                langkah: [
                    "Lihat ringkasan kelas dan grafik di bagian atas.",
                    "Perhatikan banner di bawah kotak Mode Administrator. Banner muncul jika backup belum ada, gagal, atau sudah lebih dari 2 hari. Ketuk Buka Backup untuk memeriksanya.",
                    "Ketuk menu cepat untuk langsung membuka fitur.",
                    "Cek agenda pembinaan mendatang di bagian bawah."
                ]
            }
        }
    },
    absensi: {
        ikon: "fa-calendar-check", judul: "Presensi Kehadiran",
        ringkas: "Catat kehadiran siswa per hari dalam bentuk tabel.",
        langkah: [
            "Pilih tanggal di bagian atas. Bawaannya hari ini.",
            "Ketuk Set Semua Hadir untuk mengisi semua siswa sekaligus.",
            "Ubah status siswa yang tidak hadir: Izin, Sakit, Alpa, atau Terlambat.",
            "Ketuk Simpan Semua Presensi."
        ],
        tips: [
            "Hanya hari ini yang bisa diisi. Tanggal yang sudah lewat hanya bisa dilihat. Hubungi admin untuk koreksi.",
            "Tanpa internet, presensi disimpan di perangkat dan terkirim otomatis saat koneksi kembali.",
            "Ketuk ikon PDF untuk mencetak rekap presensi."
        ]
    },
    "absensi-bk": {
        ikon: "fa-calendar-check", judul: "Presensi Layanan BK",
        ringkas: "Catat kehadiran siswa pada layanan BK dan lihat rekapnya.",
        langkah: [
            "Pilih tanggal layanan.",
            "Tandai status kehadiran tiap siswa.",
            "Simpan, lalu buka rekap untuk melihat rentang tanggal tertentu."
        ],
        tips: ["Halaman ini hanya untuk presensi layanan BK. Presensi kelas diisi oleh wali kelas."]
    },
    kebiasaan: {
        ikon: "fa-star", judul: "7 Kebiasaan Hebat",
        ringkas: "Catat kebiasaan harian siswa: bangun pagi, beribadah, berolahraga, makan sehat, gemar belajar, bermasyarakat, dan tidur cepat.",
        langkah: [
            "Pilih siswa dan tanggal.",
            "Isi setiap kebiasaan yang sudah dilakukan.",
            "Perubahan tersimpan otomatis. Perhatikan tanda simpan di bagian atas."
        ],
        tips: [
            "Hari yang sudah lewat hanya bisa dilihat. Ketuk Ke hari ini untuk kembali.",
            "Ketuk ikon PDF untuk mencetak ringkasan kebiasaan."
        ],
        peran: {
            siswa: {
                ringkas: "Isi kebiasaan baik yang sudah kamu lakukan hari ini.",
                langkah: [
                    "Pastikan tanggal yang tampil adalah hari ini.",
                    "Isi setiap kebiasaan yang sudah kamu lakukan.",
                    "Perubahan tersimpan otomatis. Tunggu tanda tersimpan sebelum pindah halaman."
                ],
                tips: ["Hari yang sudah lewat hanya bisa dilihat, tidak bisa diubah."]
            }
        }
    },
    jurnal: {
        ikon: "fa-book-open", judul: "Jurnal Harian",
        ringkas: "Refleksi harian siswa dan catatan dari guru.",
        langkah: [
            "Pilih siswa dan tanggal.",
            "Baca refleksi yang ditulis siswa.",
            "Tambahkan catatan guru jika perlu."
        ],
        tips: ["Catatan guru ikut tampil di jurnal siswa."],
        peran: {
            siswa: {
                ringkas: "Tulis refleksi singkat tentang harimu.",
                langkah: [
                    "Ketuk kolom jurnal dan tulis refleksimu.",
                    "Ketuk Simpan dan Kirim Jurnal setelah selesai.",
                    "Baca catatan dari gurumu di halaman yang sama."
                ],
                tips: ["Tulisan yang belum dikirim disimpan sebagai draf di perangkat ini."]
            }
        }
    },
    karakter: {
        ikon: "fa-quran", judul: "Keagamaan",
        ringkas: "Hafalan Surah, bacaan Iqro, dan hafalan doa harian.",
        langkah: [
            "Pilih siswa, atau biarkan Semua Siswa.",
            "Pilih kategori: Semua, Surah, Iqro, atau Doa.",
            "Ketuk Catat Capaian untuk menambah catatan baru."
        ],
        tips: ["Ketuk ikon PDF untuk mencetak jurnal keagamaan."],
        peran: {
            siswa: {
                ringkas: "Lihat capaian hafalan dan bacaanmu.",
                langkah: [
                    "Pilih kategori: Semua, Surah, Iqro, atau Doa.",
                    "Lihat capaian yang sudah dicatat gurumu."
                ],
                tips: ["Halaman ini hanya untuk dibaca. Capaian dicatat oleh guru."]
            }
        }
    },
    akademik: {
        ikon: "fa-graduation-cap", judul: "Akademik & Prestasi",
        ringkas: "Nilai per mata pelajaran dan catatan prestasi non-akademik.",
        langkah: [
            "Pilih tab Nilai Mapel atau Prestasi Siswa.",
            "Pilih siswa untuk melihat rinciannya.",
            "Ketuk Nilai Mapel atau Catat Prestasi untuk menambah data.",
            "Ketuk Massal untuk memasukkan nilai satu kelas sekaligus."
        ],
        tips: ["Ketuk ikon PDF untuk mencetak transkrip nilai dan prestasi."],
        peran: {
            siswa: {
                ringkas: "Lihat nilai dan prestasimu.",
                langkah: [
                    "Pilih tab Nilai Mapel atau Prestasi Siswa.",
                    "Lihat nilai dan catatan yang dimasukkan gurumu."
                ],
                tips: ["Halaman ini hanya untuk dibaca."]
            }
        }
    },
    pembinaan: {
        ikon: "fa-user-pen", judul: "Catatan Pembinaan",
        ringkas: "Pantau masalah siswa dan tindak lanjutnya.",
        langkah: [
            "Pilih siswa, atau biarkan Semua Siswa.",
            "Ketuk Tambah Catatan untuk mencatat masalah baru.",
            "Perbarui status catatan: Perlu Tindak Lanjut, Dalam Pembinaan, Pemantauan, atau Selesai."
        ],
        tips: [
            "Catatan yang perlu perhatian muncul di lonceng notifikasi.",
            "Ketuk ikon PDF untuk mencetak lembar rekam pembinaan."
        ]
    },
    tatib: {
        ikon: "fa-gavel", judul: "Tata Tertib",
        ringkas: "Poin pelanggaran dan penghargaan siswa.",
        langkah: [
            "Pilih siswa, atau biarkan Semua Siswa.",
            "Ketuk Catat, lalu pilih siswa dan jenis pelanggaran atau penghargaan.",
            "Periksa pratinjau sebelum menyimpan."
        ],
        tips: [
            "Surat panggilan orang tua bisa dicetak dari laporan Tata Tertib.",
            "Notifikasi muncul saat siswa mencapai batas poin."
        ]
    },
    "tatib-baca": {
        ikon: "fa-gavel", judul: "Tata Tertib Sekolah",
        ringkas: "Aturan dan poin yang berlaku di sekolah. Halaman ini hanya untuk dibaca.",
        langkah: [
            "Ketik kata kunci di kotak cari, misalnya terlambat.",
            "Baca aturan dan poinnya."
        ],
        tips: []
    },
    laporan: {
        ikon: "fa-file-invoice", judul: "Laporan",
        ringkas: "Rekap pemantauan yang bisa diekspor.",
        langkah: [
            "Pilih tab Presensi & Akademik atau Kebiasaan & Jurnal.",
            "Pilih filter kelas dan status.",
            "Ketuk Excel untuk berkas spreadsheet, atau Cetak PDF dan Eksport PDF untuk dokumen."
        ],
        tips: ["Filter Perlu Perhatian menampilkan siswa yang perlu tindak lanjut lebih dulu."]
    },
    siswa: {
        ikon: "fa-users", judul: "Data Siswa",
        ringkas: "Daftar siswa, profil, dan tautan untuk orang tua.",
        langkah: [
            "Cari siswa lewat nama atau NISN.",
            "Gunakan filter kelas dan urutan untuk merapikan daftar.",
            "Ketuk siswa untuk membuka profilnya.",
            "Ketuk Tambah untuk menambah siswa, atau ikon kartu untuk mencetak kartu akun."
        ],
        tips: ["Tautan pemantauan orang tua berlaku 15 menit. Kirim lewat WhatsApp, lalu buat ulang jika sudah kedaluwarsa."]
    },
    "admin-manage": {
        ikon: "fa-user-gear", judul: "Master Data",
        ringkas: "Kelola data dasar aplikasi.",
        langkah: [
            "Pilih tab: Guru, BK, Siswa, Kelas, Mentor, Sekolah, Kebiasaan, atau Tata Tertib.",
            "Ketuk Tambah untuk membuat data baru.",
            "Untuk data banyak, unduh Template CSV, isi, lalu impor."
        ],
        tips: [
            "Untuk menghapus banyak data, ketuk Pilih di tab Guru, BK, Siswa, atau Kelas, centang datanya, lalu ketuk Hapus.",
            "Hapus massal meminta konfirmasi dan tidak bisa dibatalkan di halaman ini. Periksa pilihan Anda dulu.",
            "Jika data terhapus keliru, pulihkan dari menu Backup. Backup otomatis sebelum hapus massal hanya dibuat jika pengaturannya aktif.",
            "Reset kata sandi guru dan siswa dilakukan dari tab masing-masing."
        ]
    },
    backup: {
        ikon: "fa-database", judul: "Backup Data",
        ringkas: "Simpan salinan seluruh data ke Drive dan pulihkan jika ada data yang terhapus atau rusak.",
        langkah: [
            "Ketuk Backup sekarang untuk membuat salinan manual. Catatan boleh diisi.",
            "Buka Pengaturan jadwal untuk mengatur backup otomatis: jam, dan jumlah backup harian, mingguan, serta bulanan yang disimpan. Ketuk Simpan pengaturan.",
            "Untuk memulihkan, ketuk Pulihkan pada backup yang diinginkan, centang sheet yang perlu dikembalikan, lalu ketuk Pulihkan sheet terpilih.",
            "Ketik PULIHKAN pada kotak konfirmasi untuk melanjutkan."
        ],
        tips: [
            "Pemulihan mengganti seluruh isi sheet yang dipilih. Data yang dibuat setelah waktu backup hilang dari sheet itu.",
            "Pulihkan hanya sheet yang rusak. Bandingkan jumlah baris di backup dengan jumlah baris sekarang sebelum memilih.",
            "Biarkan Buat salinan pengaman dulu tetap dicentang agar pemulihan bisa dibatalkan. Salinan itu muncul di daftar dengan tipe Pengaman sebelum pulihkan.",
            "Backup yang sudah pernah dipakai memulihkan menampilkan catatan Dipulihkan beserta waktunya.",
            "Folder backup di Drive berisi data pribadi siswa dan guru. Jangan dibagikan."
        ]
    },
    arsip: {
        ikon: "fa-box-archive", judul: "Arsip",
        ringkas: "Simpan dan buka kembali data semester lama.",
        langkah: [
            "Pilih semester yang ingin dibuka.",
            "Lihat data arsip, atau ekspor ke CSV."
        ],
        tips: []
    },
    "arsip-saya": {
        ikon: "fa-box-archive", judul: "Arsip Semester",
        ringkas: "Lihat data dari semester yang sudah lewat.",
        langkah: [
            "Pilih semester yang ingin dilihat.",
            "Buka bagian yang kamu butuhkan, misalnya presensi atau laporan semester."
        ],
        tips: ["Halaman ini hanya untuk dibaca."]
    }
};

const BANTUAN_FAQ = [
    {
        q: "Saya lupa kata sandi. Apa yang harus dilakukan?",
        a: "Hubungi admin sekolah untuk meminta reset. Admin memberi kata sandi sementara. Setelah masuk, aplikasi meminta Anda membuat kata sandi baru.",
        roles: ["siswa", "guru", "kepsek", "bk", "admin"]
    },
    {
        q: "Bagaimana cara mengganti kata sandi?",
        a: () => "Ketuk ikon roda gigi di header, lalu isi bagian Ganti Kata Sandi. Panjang minimal " + bantuanMinSandi() + " karakter.",
        roles: ["siswa", "guru", "kepsek", "bk", "admin"]
    },
    {
        q: "Data tidak muncul atau belum yang terbaru.",
        a: "Ketuk ikon segarkan di header, atau Segarkan Data di menu samping. Pastikan juga perangkat tersambung ke internet.",
        roles: ["siswa", "guru", "kepsek", "bk", "admin"]
    },
    {
        q: "Internet saya putus. Apakah pekerjaan saya hilang?",
        a: "Presensi yang diisi saat offline disimpan di perangkat dan terkirim otomatis saat internet kembali. Untuk fitur lain, tunggu sampai muncul pesan koneksi terhubung kembali sebelum menyimpan.",
        roles: ["guru", "kepsek", "admin"]
    },
    {
        q: "Internet saya putus. Apakah pekerjaan saya hilang?",
        a: "Tunggu sampai muncul pesan koneksi terhubung kembali sebelum menyimpan. Tulisan jurnal yang belum dikirim tersimpan sebagai draf di perangkat ini.",
        roles: ["siswa", "bk"]
    },
    {
        q: "Kenapa data kemarin tidak bisa diubah?",
        a: "Data hari yang sudah lewat dikunci agar catatan tetap akurat. Anda masih bisa melihatnya. Hubungi admin jika perlu koreksi.",
        roles: ["siswa", "guru", "kepsek", "bk"]
    },
    {
        q: "Bagaimana mengoreksi data tanggal yang sudah lewat?",
        a: "Admin bisa membuka tanggal lama langsung. Halaman akan menampilkan tanda Mode koreksi admin.",
        roles: ["admin"]
    },
    {
        q: "Bagaimana orang tua melihat perkembangan anaknya?",
        a: "Buka Data Siswa, pilih siswa, lalu buat tautan pemantauan. Kirim lewat WhatsApp ke orang tua. Orang tua tidak perlu akun. Tautan berlaku 15 menit. Jika sudah kedaluwarsa, buat tautan baru.",
        roles: ["guru", "kepsek", "admin"]
    },
    {
        q: "Saya wali kelas sekaligus mentor. Bagaimana berganti peran?",
        a: "Gunakan pilihan Peran Aktif di menu samping, atau pilihan di header. Pilih Semua untuk melihat gabungan siswa dari kedua peran.",
        roles: ["guru"]
    },
    {
        q: "Bagaimana mengimpor data dari CSV?",
        a: "Buka Master Data, pilih tab yang sesuai, lalu ketuk Template CSV untuk mengunduh format yang benar. Isi templatenya, lalu ketuk impor dan pilih berkas.",
        roles: ["admin"]
    },
    {
        q: "Data terhapus atau rusak. Bagaimana memulihkannya?",
        a: "Buka menu Backup, pilih backup yang dibuat sebelum data bermasalah, lalu ketuk Pulihkan. Centang hanya sheet yang perlu dikembalikan, lalu ketik PULIHKAN. Pemulihan lewat aplikasi mengganti isi sheet itu sepenuhnya, jadi data yang dibuat setelah waktu backup hilang dari sheet tersebut.",
        roles: ["admin"]
    },
    {
        q: "Apakah pemulihan menimpa data yang sekarang?",
        a: "Ya. Sheet yang dipilih diganti sama persis dengan isi backup, tidak digabung. Karena itu aplikasi membuat salinan pengaman lebih dulu. Jika hasilnya keliru, pulihkan lagi dari backup bertipe Pengaman sebelum pulihkan.",
        roles: ["admin"]
    },
    {
        q: "Bagaimana mengatur backup otomatis?",
        a: "Buka menu Backup, lalu ketuk Pengaturan jadwal. Atur jam dan jumlah backup yang disimpan, lalu ketuk Simpan pengaturan. Backup lama yang melewati batas dipindahkan ke tempat sampah Drive.",
        roles: ["admin"]
    },
    {
        q: "Banner backup muncul di Beranda. Apa artinya?",
        a: "Banner muncul jika belum ada backup, backup terakhir gagal, backup terakhir lebih dari 2 hari, atau jadwal otomatis belum aktif. Ketuk Buka Backup untuk memeriksa, lalu buat backup manual atau simpan ulang pengaturan jadwal.",
        roles: ["admin"]
    },
    {
        q: "Bagaimana memasang aplikasi di layar utama?",
        a: "Ketuk Install Aplikasi di menu samping bila tombolnya tampil. Di iPhone, buka lewat Safari, ketuk Bagikan, lalu pilih Tambah ke Layar Utama.",
        roles: ["siswa", "guru", "kepsek", "bk", "admin"]
    },
    {
        q: "Bagaimana mengaktifkan mode gelap?",
        a: "Ketuk ikon roda gigi di header, lalu pilih Terang, Gelap, atau Sistem di bagian Mode Tampilan.",
        roles: ["siswa", "guru", "kepsek", "bk", "admin"]
    },
    {
        q: "Apa fungsi ikon lonceng?",
        a: "Lonceng menampilkan pemberitahuan yang perlu perhatian, misalnya catatan pembinaan yang belum ditangani atau notifikasi Tata Tertib.",
        roles: ["guru", "kepsek", "bk", "admin", "siswa"]
    }
];

const BANTUAN_STATE = { tab: "halaman", view: null, langkah: [], i: 0 };

function bantuanMinSandi() {
    return typeof PASSWORD_MIN_LENGTH !== "undefined" ? PASSWORD_MIN_LENGTH : 6;
}

function bantuanRole() {
    const u = (typeof appState !== "undefined" && appState && appState.user) || null;
    const r = u ? String(u.role || "").toLowerCase() : "";
    return BANTUAN_TUR[r] ? r : "";
}

function bantuanKunciTur() {
    const u = (typeof appState !== "undefined" && appState && appState.user) || {};
    const versi = BANTUAN_VERSI_PERAN[String(u.role || "")] || BANTUAN_VERSI;
    return "bantuan_tur_v" + versi + "_" + String(u.id || u.username || u.nama || "x") + "_" + String(u.role || "");
}

function bantuanTurSudah() {
    try { return localStorage.getItem(bantuanKunciTur()) === "1"; } catch (_) { return true; }
}

function bantuanTandaiTur() {
    try { localStorage.setItem(bantuanKunciTur(), "1"); } catch (_) { }
}

function bantuanViewAktif() {
    const el = document.querySelector(".view-section.active");
    const id = el && el.id ? el.id.replace("view-", "") : "dashboard";
    return id === "login" ? "dashboard" : id;
}

function bantuanHalamanData(viewId, role) {
    const dasar = BANTUAN_HALAMAN[viewId] || {
        ikon: "fa-circle-info", judul: "Halaman ini",
        ringkas: "Gunakan menu di samping untuk berpindah halaman.",
        langkah: ["Buka menu di kiri atas untuk melihat semua halaman."], tips: []
    };
    const ganti = dasar.peran && dasar.peran[role];
    return ganti ? Object.assign({}, dasar, ganti) : dasar;
}

function bantuanTampilkan(html) {
    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal) return false;
    box.innerHTML = html;
    modal.classList.remove("hidden");
    return true;
}

function bantuanModalTerbuka() {
    const m = document.getElementById("modal-container");
    return !!m && !m.classList.contains("hidden");
}

function bantuanSwalTerbuka() {
    try { return typeof Swal !== "undefined" && Swal.isVisible(); } catch (_) { return false; }
}

function bantuanTombolTutup() {
    return `<button type="button" onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup"><i class="fas fa-times"></i></button>`;
}

function bukaBantuan(opsi) {
    const role = bantuanRole();
    if (!role) return;
    const o = opsi || {};
    BANTUAN_STATE.tab = o.tab === "faq" ? "faq" : "halaman";
    BANTUAN_STATE.view = o.view || bantuanViewAktif();
    renderBantuan();
}

function bantuanTab(tab) {
    BANTUAN_STATE.tab = tab === "faq" ? "faq" : "halaman";
    renderBantuan();
    const btn = document.getElementById("bantuan-tab-" + BANTUAN_STATE.tab);
    if (btn) btn.focus();
}

function bantuanBagianHalaman(role) {
    const d = bantuanHalamanData(BANTUAN_STATE.view, role);
    const langkah = (d.langkah || []).map((t, i) => `
        <li class="flex gap-2.5 items-start">
            <span class="w-6 h-6 shrink-0 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">${i + 1}</span>
            <span class="text-sm text-slate-700 leading-relaxed">${escapeHtml(t)}</span>
        </li>`).join("");
    const tips = (d.tips || []).length ? `
        <div class="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p class="text-xs font-bold text-slate-700 mb-1.5"><i class="fas fa-lightbulb text-amber-500 mr-1.5" aria-hidden="true"></i>Perlu diketahui</p>
            <ul class="space-y-1.5">${d.tips.map(t => `<li class="text-xs text-slate-600 leading-relaxed">${escapeHtml(t)}</li>`).join("")}</ul>
        </div>` : "";
    return `
        <div class="flex items-center gap-2.5 mb-1.5">
            <span class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><i class="fas ${d.ikon}" aria-hidden="true"></i></span>
            <h4 class="text-sm font-bold text-slate-800">${escapeHtml(d.judul)}</h4>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed mb-3">${escapeHtml(d.ringkas)}</p>
        <ol class="space-y-2.5">${langkah}</ol>
        ${tips}`;
}

function bantuanBagianFaq(role) {
    const daftar = BANTUAN_FAQ.filter(f => f.roles.includes(role));
    return `<div class="space-y-2">${daftar.map(f => {
        const jawab = typeof f.a === "function" ? f.a() : f.a;
        return `
        <details class="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <summary class="text-sm font-semibold text-slate-800 cursor-pointer">${escapeHtml(f.q)}</summary>
            <p class="text-sm text-slate-600 leading-relaxed mt-2">${escapeHtml(jawab)}</p>
        </details>`;
    }).join("")}</div>`;
}

function renderBantuan() {
    const role = bantuanRole();
    if (!role) return;
    const tabBtn = (id, label) => {
        const on = BANTUAN_STATE.tab === id;
        return `<button type="button" id="bantuan-tab-${id}" onclick="bantuanTab('${id}')" aria-pressed="${on}"
            class="py-2 rounded-lg text-xs font-bold transition ${on ? "bg-white text-primary shadow-sm" : "text-slate-600"}">${label}</button>`;
    };
    bantuanTampilkan(`
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <i class="fas fa-circle-question text-blue-600" aria-hidden="true"></i> Bantuan &amp; Panduan
            </h3>
            ${bantuanTombolTutup()}
        </div>
        <div class="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-3" role="group" aria-label="Bagian bantuan">
            ${tabBtn("halaman", "Halaman ini")}
            ${tabBtn("faq", "Tanya jawab")}
        </div>
        <div id="bantuan-isi">${BANTUAN_STATE.tab === "faq" ? bantuanBagianFaq(role) : bantuanBagianHalaman(role)}</div>
        <button type="button" onclick="mulaiTur()"
            class="w-full mt-4 bg-blue-50 text-blue-700 font-bold py-2.5 rounded-xl border border-blue-100 text-xs flex items-center justify-center gap-2">
            <i class="fas fa-route" aria-hidden="true"></i> Ulangi tur pengenalan
        </button>`);
}

function mulaiTur(opsi) {
    const role = bantuanRole();
    if (!role) return;
    BANTUAN_STATE.langkah = BANTUAN_TUR[role];
    BANTUAN_STATE.i = 0;
    renderTur();
}

function bantuanTurNav(arah) {
    const n = BANTUAN_STATE.langkah.length;
    const baru = BANTUAN_STATE.i + arah;
    if (baru < 0) return;
    if (baru >= n) { closeModal(); return; }
    BANTUAN_STATE.i = baru;
    renderTur();
    const utama = document.getElementById("bantuan-tur-lanjut");
    if (utama) utama.focus();
}

function renderTur() {
    const { langkah, i } = BANTUAN_STATE;
    const s = langkah[i];
    if (!s) return;
    const akhir = i === langkah.length - 1;
    const titik = langkah.map((_, k) =>
        `<span aria-hidden="true" class="h-1.5 rounded-full ${k === i ? "w-5 bg-blue-600" : "w-1.5 bg-slate-300"}"></span>`).join("");
    bantuanTampilkan(`
        <div class="flex justify-between items-center mb-4">
            <p class="text-xs font-bold text-slate-500">Langkah ${i + 1} dari ${langkah.length}</p>
            <button type="button" onclick="closeModal()" class="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1">${akhir ? "Tutup" : "Lewati"}</button>
        </div>
        <div class="flex justify-center gap-1.5 mb-5">${titik}</div>
        <div class="text-center px-1">
            <span class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 text-2xl inline-flex items-center justify-center mb-3">
                <i class="fas ${s.ikon}" aria-hidden="true"></i>
            </span>
            <h3 class="text-base font-bold text-slate-800 mb-2">${escapeHtml(s.judul)}</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(s.teks)}</p>
        </div>
        <div class="flex gap-2 mt-6">
            ${i > 0 ? `<button type="button" onclick="bantuanTurNav(-1)" class="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm">Kembali</button>` : ""}
            <button type="button" id="bantuan-tur-lanjut" onclick="bantuanTurNav(1)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm">${akhir ? "Selesai" : "Berikutnya"}</button>
        </div>
        ${akhir ? `<button type="button" onclick="bukaBantuan({tab:'faq'})" class="w-full mt-2 text-xs font-bold text-blue-600 py-2">Lihat tanya jawab</button>` : ""}`);
}

function bantuanSiapTampil() {
    const root = document.documentElement;
    return !!bantuanRole() && root.classList.contains("has-session") &&
        !document.hidden && !bantuanModalTerbuka() && !bantuanSwalTerbuka();
}

let bantuanTurTimer = null;

function jadwalkanTurOtomatis() {
    if (!bantuanRole() || bantuanTurSudah()) return;
    if (bantuanTurTimer) clearInterval(bantuanTurTimer);
    let coba = 0;
    bantuanTurTimer = setInterval(() => {
        coba++;
        if (coba > 8) { clearInterval(bantuanTurTimer); bantuanTurTimer = null; return; }
        if (!bantuanSiapTampil()) return;
        clearInterval(bantuanTurTimer);
        bantuanTurTimer = null;
        bantuanTandaiTur();
        mulaiTur({ otomatis: true });
    }, 1500);
}