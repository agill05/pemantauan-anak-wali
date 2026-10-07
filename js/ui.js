function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeStr(v) {
    return (v === null || v === undefined) ? "" : String(v);
}

function sortSiswa(listSiswa) {
    return [...listSiswa].sort((a, b) => {
        const noA = (a.no_absen !== undefined && a.no_absen !== null && String(a.no_absen).trim() !== "") ? Number(a.no_absen) : null;
        const noB = (b.no_absen !== undefined && b.no_absen !== null && String(b.no_absen).trim() !== "") ? Number(b.no_absen) : null;

        if (noA !== null && noB !== null) return noA - noB;
        if (noA !== null) return -1;
        if (noB !== null) return 1;

        return String(a.nama || "").localeCompare(String(b.nama || ""), "id");
    });
}

function renderSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 skeleton rounded-full shrink-0"></div>
                <div class="space-y-2 flex-1">
                    <div class="h-3 bg-slate-200 skeleton rounded w-1/3"></div>
                    <div class="h-2 bg-slate-200 skeleton rounded w-1/2"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function togglePasswordVisibility(inputId, btnEl) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const show = el.type === 'password';
    el.type = show ? 'text' : 'password';
    if (btnEl) {
        const icon = btnEl.querySelector('i');
        if (icon) icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

function getTimeWITA24() {
    const now = new Date();
    const options = { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('id-ID', options).format(now).replace('.', ':');
}

function getGuruNip() {
    if (!appState.user) return '........................................';
    if (appState.user.nip) return appState.user.nip;
    const g = (appState.guru || []).find(x => String(x.id) === String(appState.user.id));
    return (g && g.nip) ? g.nip : '........................................';
}

function getDateWITA() {
    const now = new Date();
    const options = { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
    const y = parts.find(p => p.type === 'year').value;
    const m = parts.find(p => p.type === 'month').value;
    const d = parts.find(p => p.type === 'day').value;
    return `${y}-${m}-${d}`;
}

function formatDisplayTime(val) {
    if (!val || val === 'null' || val === 'undefined') return 'Belum Absen';
    const str = String(val).trim();
    if (str.includes('T')) {
        try {
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes} WITA`;
            }
        } catch (e) { }
    }
    return str.includes('WITA') ? str : `${str} WITA`;
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    return `${hours} jam lalu`;
}

let loadingTimer = null;

function showLoading(text = "Memproses...") {
    const loader = document.getElementById("loading-overlay");
    const txt = document.getElementById("loading-text");
    if (txt) txt.innerText = text;

    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => {
        if (loader) {
            loader.classList.remove("hidden");
            loader.classList.add("flex");
        }
    }, 200);
}

function hideLoading() {
    clearTimeout(loadingTimer);
    const loader = document.getElementById("loading-overlay");
    if (loader) {
        loader.classList.add("hidden");
        loader.classList.remove("flex");
    }
}

function getInitialsAvatar(nama) {
    const name = (nama || "User").trim();
    const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

    const palette = ["#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#65a30d", "#059669", "#0891b2"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const bg = palette[Math.abs(hash) % palette.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${bg}"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>`;

    return "data:image/svg+xml," + encodeURIComponent(svg);
}

function showToast(message, icon = "success") {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
        });
    }
}

function saveFormDraft(draftKey, formData) {
    localStorage.setItem(`draft_${draftKey}`, JSON.stringify(formData));
}

function getFormDraft(draftKey) {
    const data = localStorage.getItem(`draft_${draftKey}`);
    return data ? JSON.parse(data) : null;
}

function clearFormDraft(draftKey) {
    localStorage.removeItem(`draft_${draftKey}`);
}

function attachAutoSaveDraft(draftKey, fieldIds) {
    fieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                const draftData = {};
                fieldIds.forEach(fId => {
                    const input = document.getElementById(fId);
                    if (input) draftData[fId] = input.value;
                });
                saveFormDraft(draftKey, draftData);
                showDraftIndicator(true);
            });
        }
    });
}

function showDraftIndicator(isSaved) {
    let badge = document.getElementById("form-draft-indicator");
    if (!badge) {
        const box = document.getElementById("modal-content-box");
        if (!box) return;
        badge = document.createElement("div");
        badge.id = "form-draft-indicator";
        badge.className = "text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 mb-3 flex items-center gap-1.5";
        box.insertBefore(badge, box.children[1] || box.firstChild);
    }

    if (isSaved) {
        badge.innerHTML = `<i class="fas fa-save text-blue-500"></i> Draf otomatis tersimpan di perangkat`;
    }
}

function closeModal() {
    const modal = document.getElementById("modal-container");
    if (!modal) return;
    if (modal.dataset.forceLock === "true") return;
    modal.classList.add("hidden");
}

function toggleSidebar(forceOpen) {
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar || !backdrop) return;

    const willOpen = typeof forceOpen === "boolean" ? forceOpen : sidebar.classList.contains("-translate-x-full");

    if (willOpen) {
        sidebar.classList.remove("-translate-x-full");
        backdrop.classList.remove("hidden");
        requestAnimationFrame(() => backdrop.classList.remove("opacity-0"));
        document.body.classList.add("overflow-hidden");
    } else {
        sidebar.classList.add("-translate-x-full");
        backdrop.classList.add("opacity-0");
        document.body.classList.remove("overflow-hidden");
        setTimeout(() => backdrop.classList.add("hidden"), 300);
    }
}

async function requestNotificationPermission() {
    if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            showToast("Notifikasi browser berhasil diaktifkan!");
        } else if (permission === "denied") {
            Swal.fire({
                icon: 'warning',
                title: 'Izin Ditolak',
                text: 'Aktifkan izin notifikasi di pengaturan browser Anda untuk menerima peringatan langsung.',
                confirmButtonColor: '#2563eb'
            });
        }
    }
}

function sendWebPushNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: "https://ui-avatars.com/api/?name=AW&background=2563eb&color=fff&size=192",
                    vibrate: [200, 100, 200],
                    tag: 'siswa-bermasalah-alert'
                });
            });
        } else {
            new Notification(title, { body: body });
        }
    }
}

function getRoleLabel(role) {
    const map = { admin: "Admin", guru: "Guru", kepsek: "Kepala Sekolah", siswa: "Siswa", ortu: "Orang Tua" };
    return map[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : "");
}

function getFirstName(nama) {
    const parts = String(nama || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    const w = parts[0];
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

const SAPAAN_WAKTU = {
    begadang: ["Masih terjaga,", "Wah, begadang ya,", "Jangan lupa istirahat,", "Selamat Begadang,"],
    pagi: ["Selamat Pagi,", "Semangat Pagi,", "Pagi yang cerah,", "Selamat memulai hari,"],
    siang: ["Selamat Siang,", "Semangat Siang,", "Siang yang cerah,", "Selamat beraktivitas,"],
    sore: ["Selamat Sore,", "Sore yang tenang,", "Semangat Sore,", "Sore yang indah,"],
    malam: ["Selamat Malam,", "Malam yang tenang,", "Semangat Malam,", "Malam yang damai,"]
};

const _sapaanSeed = Math.floor(Math.random() * 1000);

function getJamWITA() {
    const jam = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Makassar" }).format(new Date());
    const n = parseInt(jam, 10);
    return Number.isNaN(n) ? new Date().getHours() : n;
}

function getSapaanWaktu(jam = getJamWITA()) {
    let slot = "malam";
    if (jam < 4) slot = "begadang";
    else if (jam < 11) slot = "pagi";
    else if (jam < 15) slot = "siang";
    else if (jam < 18) slot = "sore";
    const daftar = SAPAAN_WAKTU[slot];
    return daftar[_sapaanSeed % daftar.length];
}

function updateHeaderUser() {
    if (!appState.user) return;
    const nama = appState.user.nama || "";
    const greeting = document.getElementById("header-greeting");
    const welcome = document.getElementById("header-welcome");
    const namaEl = document.getElementById("header-nama");
    const title = document.getElementById("header-title");
    const sub = document.getElementById("header-subtitle");

    const sapaan = getSapaanWaktu();
    if (greeting) { greeting.textContent = sapaan; greeting.classList.remove("hidden"); }
    if (welcome) welcome.textContent = sapaan + " ";
    if (namaEl) namaEl.textContent = nama;
    if (title) title.title = nama;
    if (sub) {
        const peranTeks = isGuruUser() && getPeranTersedia().length > 1 ? ` (${PERAN_LABEL[getPeranAktif()]})` : "";
        sub.textContent = `${getRoleLabel(appState.user.role)}${peranTeks} • SMPN 1 Talaga Jaya`;
        sub.title = sub.textContent;
    }
}

function setHeaderText(titleText, subtitleText) {
    const greeting = document.getElementById("header-greeting");
    const welcome = document.getElementById("header-welcome");
    const namaEl = document.getElementById("header-nama");
    const title = document.getElementById("header-title");
    const sub = document.getElementById("header-subtitle");
    if (greeting) greeting.classList.add("hidden");
    if (welcome) welcome.textContent = "";
    if (namaEl) namaEl.textContent = titleText;
    if (title) title.title = titleText;
    if (sub) { sub.textContent = subtitleText; sub.title = subtitleText; }
}

function formatTanggalLabel(tanggal) {
    const d = new Date(`${tanggal}T00:00:00Z`);
    if (isNaN(d.getTime())) return String(tanggal);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function getDateLockState(tanggal) {
    const today = getDateWITA();
    const role = appState.user ? appState.user.role : "";
    const label = formatTanggalLabel(tanggal);

    if (!tanggal || tanggal === today) return { editable: true, kind: "today", message: "" };
    if (tanggal > today) {
        return {
            editable: false, kind: "future",
            message: `Belum waktunya diisi. Data tanggal ${label} baru bisa diisi pada harinya.`
        };
    }
    if (role === "admin") {
        return {
            editable: true, kind: "admin-past",
            message: `Mode koreksi admin. Anda sedang mengubah data tanggal ${label} yang sudah lewat.`
        };
    }
    return {
        editable: false, kind: "past",
        message: `Data tanggal ${label} hanya bisa dilihat. Data hari yang sudah lewat tidak dapat diubah. Hubungi admin jika perlu koreksi.`
    };
}

function renderDateLockBanner(state, target) {
    if (!state || state.kind === "today") return "";
    const styles = {
        future: { box: "bg-sky-50 border-sky-200 text-sky-800", icon: "fa-clock" },
        past: { box: "bg-amber-50 border-amber-200 text-amber-800", icon: "fa-lock" },
        "admin-past": { box: "bg-indigo-50 border-indigo-200 text-indigo-800", icon: "fa-pen-to-square" }
    };
    const st = styles[state.kind];
    return `
        <div class="${st.box} border rounded-2xl p-3 flex items-start gap-2.5 text-xs" role="status">
            <i class="fas ${st.icon} mt-0.5 shrink-0"></i>
            <p class="flex-1 min-w-0 font-semibold leading-relaxed">${escapeHtml(state.message)}</p>
            <button type="button" onclick="kembaliKeHariIni('${target}')" class="shrink-0 font-bold underline underline-offset-2 whitespace-nowrap">Ke hari ini</button>
        </div>`;
}

function kembaliKeHariIni(target) {
    if (target === "absensi") {
        const el = document.getElementById("absensi-date");
        if (el) el.value = getDateWITA();
        loadAbsensiData(true);
    } else if (target === "kebiasaan") {
        const el = document.getElementById("kebiasaan-date");
        if (el) el.value = getDateWITA();
        loadKebiasaanData(true);
    }
}

function showDateLockedAlert(state) {
    if (!state || state.editable) return;
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: state.kind === "future" ? "info" : "warning",
            title: state.kind === "future" ? "Belum Waktunya" : "Data Terkunci",
            text: state.message,
            confirmButtonColor: "#2563eb"
        });
    }
}

const PENULIS_LABEL = { wali: "Wali", mentor: "Mentor", admin: "Admin" };
const PENULIS_STYLE = {
    wali: "bg-blue-50 text-blue-700 border-blue-100",
    mentor: "bg-violet-50 text-violet-700 border-violet-100",
    admin: "bg-slate-100 text-slate-700 border-slate-200"
};

function renderPeranChip(siswa) {
    if (getPeranAktif() !== "semua") return "";
    const b = getPeranBadgeSiswa(siswa);
    if (!b) return "";
    const map = {
        wali: ["Anak Wali", PENULIS_STYLE.wali],
        mentor: ["Binaan", PENULIS_STYLE.mentor],
        both: ["Wali & Binaan", "bg-emerald-50 text-emerald-700 border-emerald-100"]
    };
    const [teks, cls] = map[b];
    return `<span class="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}">${teks}</span>`;
}

function renderPenulisBadge(rec) {
    const u = appState.user;
    if (!rec || !u || (u.role !== "admin" && u.role !== "guru")) return "";
    const sebagai = String(rec.dibuat_sebagai || "").toLowerCase().trim();
    const peran = PENULIS_LABEL[sebagai] ? sebagai : "wali";
    const ownerId = String(rec.dibuat_oleh_id || "").trim();
    let nama = "";
    if (ownerId) {
        if (ownerId === String(u.id)) nama = "Anda";
        else if (ownerId === "guru-dihapus") nama = "Guru dihapus";
        else {
            const g = (appState.guru || []).find(x => String(x.id) === ownerId);
            nama = g ? g.nama : "";
        }
    }
    const teks = nama ? `${nama} (${PENULIS_LABEL[peran]})` : PENULIS_LABEL[peran];
    return `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${PENULIS_STYLE[peran]}" title="Dicatat oleh ${escapeHtml(teks)}"><i class="fas fa-pen-nib text-[9px]"></i> ${escapeHtml(teks)}</span>`;
}

function renderBacaSajaBanner(teks) {
    return `<div class="bg-violet-50 border border-violet-200 text-violet-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2" role="note">
        <i class="fas fa-eye mt-0.5"></i><span>${escapeHtml(teks)}</span>
    </div>`;
}

function renderReadOnlyBanner(kategori, modul) {
    if (isKepsekUser()) return renderBacaSajaBanner("Mode baca saja. Kepala Sekolah hanya dapat melihat data.");
    if (!isGuruUser()) return "";
    const list = getSiswaPeran();
    if (list.length === 0) return "";
    const dapat = list.filter(s => canWrite(kategori, s)).length;
    if (dapat === list.length) return "";
    return renderBacaSajaBanner(dapat === 0
        ? `Mode baca saja. Hanya wali kelas yang dapat mengisi ${modul} anak binaan.`
        : `Siswa berlabel Binaan hanya dapat dibaca. Hanya wali kelas yang dapat mengisi ${modul} mereka.`);
}

function applyWriteVisibility() {
    const role = appState.user ? String(appState.user.role).toLowerCase() : "";
    document.querySelectorAll("[data-write]").forEach(el => {
        const roles = (el.getAttribute("data-role-visible") || "").split(",").map(r => r.trim().toLowerCase()).filter(Boolean);
        const roleOk = roles.length === 0 || roles.includes(role);
        el.classList.toggle("hidden", !(roleOk && canWrite(el.getAttribute("data-write"))));
    });
}

const LABEL_HAPUS_SISWA = {
    Kehadiran: "Presensi kelas", KehadiranMentor: "Presensi mentor", Kebiasaan: "Kebiasaan",
    Jurnal: "Jurnal", Hafalan: "Hafalan", Akademik: "Akademik",
    Prestasi: "Prestasi", Pembinaan: "Pembinaan", Notif_Ditangani: "Notifikasi"
};

const LABEL_HAPUS_GURU = {
    kelas_dilepas: "Kelas dilepas dari wali",
    binaan_dilepas: "Anak binaan dilepas",
    jurnal_wali: "Catatan jurnal wali (penulis jadi \"Guru dihapus\")",
    jurnal_mentor: "Catatan jurnal mentor (penulis jadi \"Guru dihapus\")",
    kehadiran_mentor: "Presensi binaan (nama mentor dikosongkan)",
    notif: "Notifikasi yang ditangani",
    pembinaan: "Catatan pembinaan (tetap ada)",
    prestasi: "Catatan prestasi (tetap ada)",
    hafalan: "Catatan hafalan (tetap ada)"
};

async function konfirmasiHapusBersih(jenis, id) {
    const hitung = await apiCall("hitungHapus", { jenis: jenis, id: id }, true);
    if (!hitung || hitung.status !== "success") {
        Swal.fire({ icon: 'error', title: 'Gagal Menghitung Data', text: (hitung && hitung.message) || 'Tidak bisa menghitung data yang akan dihapus. Periksa koneksi lalu coba lagi.', confirmButtonColor: '#2563eb' });
        return false;
    }

    const baris = (label, jumlah) => '<li class="flex justify-between gap-3"><span>' + escapeHtml(label) + '</span><b>' + Number(jumlah || 0) + '</b></li>';
    const nama = escapeHtml(hitung.nama || "");
    const rincian = hitung.rincian || {};
    let judul = "Hapus Data?";
    let intro = "";
    let daftar = "";
    let tombol = "Ya, Hapus";

    if (jenis === "siswa") {
        judul = "Hapus Siswa?";
        tombol = "Ya, Hapus Semua Data";
        intro = 'Siswa <b>' + nama + '</b> dan seluruh riwayatnya akan <b>dihapus permanen</b>. Total <b>' + Number(hitung.total || 0) + '</b> baris data:';
        daftar = Object.keys(LABEL_HAPUS_SISWA).map(k => baris(LABEL_HAPUS_SISWA[k], rincian[k])).join("");
    } else if (jenis === "guru") {
        judul = "Hapus Guru?";
        tombol = "Ya, Hapus Guru";
        intro = 'Akun guru <b>' + nama + '</b> dihapus. Catatan yang pernah ditulis <b>tetap ada</b>. Dampaknya:';
        daftar = Object.keys(LABEL_HAPUS_GURU).map(k => baris(LABEL_HAPUS_GURU[k], rincian[k])).join("");
    } else if (jenis === "kelas") {
        judul = "Hapus Kelas?";
        tombol = "Ya, Hapus Kelas";
        intro = 'Kelas <b>' + nama + '</b> dihapus. Data siswa <b>tidak ikut terhapus</b>.';
        daftar = baris("Siswa dilepas dari kelas (bisa diambil wali baru)", rincian.siswa_dilepas);
    }

    const catatan = [];
    if (hitung.foto) catatan.push("Foto profil di Drive ikut dihapus.");
    if (jenis === "siswa") catatan.push("Arsip semester tidak ikut dihapus.");
    catatan.push("Tindakan ini <b>tidak dapat dikembalikan</b>.");

    const konfirmasi = await Swal.fire({
        title: judul,
        html: '<div class="text-left text-sm">' + intro + '<ul class="my-3 space-y-1 text-xs">' + daftar + '</ul><div class="text-xs text-slate-500">' + catatan.join(" ") + '</div></div>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: tombol,
        cancelButtonText: 'Batal'
    });
    return !!konfirmasi.isConfirmed;
}

function _siswaComboMeta(id) {
    const s = (appState.siswa || []).find(x => String(x.id) === String(id));
    if (!s) return null;
    const k = (appState.kelas || []).find(x => String(x.id) === String(s.kelas_id));
    const kelas = k ? k.nama_kelas : "";
    const nisn = String(s.nisn || "");
    return {
        sub: [kelas, nisn ? "NISN " + nisn : ""].filter(Boolean).join(" \u2022 "),
        chip: renderPeranChip(s),
        hay: (String(s.nama || "") + " " + nisn + " " + kelas).toLowerCase()
    };
}

function syncSiswaSelect(sel) {
    if (sel && sel._comboSync) sel._comboSync();
}

function enhanceSiswaSelect(sel) {
    if (!sel) return;
    if (sel.dataset.combo === "1") { syncSiswaSelect(sel); return; }
    sel.dataset.combo = "1";

    const wrap = document.createElement("div");
    wrap.className = "relative min-w-0" + (sel.classList.contains("flex-1") ? " flex-1" : "");
    sel.parentNode.insertBefore(wrap, sel);

    const inp = document.createElement("input");
    inp.type = "text";
    inp.autocomplete = "off";
    inp.placeholder = "Ketik nama / NISN...";
    inp.setAttribute("role", "combobox");
    inp.setAttribute("aria-expanded", "false");
    inp.className = (sel.className || "").replace("flex-1", "") + " w-full";

    const list = document.createElement("div");
    list.className = "hidden absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg";

    sel.tabIndex = -1;
    sel.setAttribute("aria-hidden", "true");
    sel.style.cssText = "position:absolute;left:0;bottom:0;width:100%;height:1px;opacity:0;pointer-events:none;";
    wrap.append(inp, list, sel);

    const label = () => {
        const o = sel.options[sel.selectedIndex];
        if (!o || (o.value === "" && o.disabled)) return "";
        return o.textContent;
    };
    const close = () => {
    list.classList.add("hidden");
    inp.setAttribute("aria-expanded", "false");
    inp.placeholder = "Ketik nama / NISN...";
    inp.value = label();
    };
    const render = (q) => {
        const tokens = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
        const rows = Array.from(sel.options).filter(o => !(o.value === "" && o.disabled)).filter(o => {
            if (!tokens.length) return true;
            if (o.value === "" || o.value === "ALL") return false;
            const m = _siswaComboMeta(o.value);
            const hay = m ? m.hay : o.textContent.toLowerCase();
            return tokens.every(t => hay.includes(t));
        });
        const html = rows.slice(0, 60).map(o => {
            const m = (o.value && o.value !== "ALL") ? _siswaComboMeta(o.value) : null;
            const aktif = o.value === sel.value ? " bg-blue-50" : "";
            return `<button type="button" data-v="${escapeHtml(o.value)}" class="block w-full text-left px-3 py-2 border-b border-slate-50 hover:bg-slate-50${aktif}">
                <div class="text-xs font-semibold text-slate-700">${escapeHtml(o.textContent)} ${m ? m.chip : ""}</div>
                ${m && m.sub ? `<div class="text-[10px] text-slate-400">${escapeHtml(m.sub)}</div>` : ""}
            </button>`;
        }).join("");
        list.innerHTML = html || `<div class="px-3 py-2 text-xs text-slate-400">Siswa tidak ditemukan</div>`;
        if (rows.length > 60) list.insertAdjacentHTML("beforeend", `<div class="px-3 py-1.5 text-[10px] text-slate-400">Ketik lebih spesifik untuk mempersempit...</div>`);
        list.classList.remove("hidden");
        inp.setAttribute("aria-expanded", "true");
    };
    const pick = (v) => {
        sel.value = v;
        inp.value = label();
        list.classList.add("hidden");
        inp.setAttribute("aria-expanded", "false");
        inp.blur();
        sel.dispatchEvent(new Event("change", { bubbles: true }));
    };

    inp.addEventListener("focus", () => {
    const terpilih = label();
    if (terpilih) inp.placeholder = terpilih;
    inp.value = "";
    render("");
    });
    inp.addEventListener("input", () => render(inp.value));
    inp.addEventListener("blur", () => setTimeout(close, 150));
    inp.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { inp.blur(); }
        else if (e.key === "Enter") {
            e.preventDefault();
            const b = list.querySelector("button[data-v]");
            if (b) pick(b.dataset.v);
        }
    });
    list.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-v]");
        if (b) pick(b.dataset.v);
    });

    sel._comboSync = () => {
        inp.disabled = sel.disabled;
        inp.classList.toggle("opacity-70", sel.disabled);
        if (document.activeElement !== inp) inp.value = label();
    };
    new MutationObserver(() => sel._comboSync())
        .observe(sel, { childList: true, attributes: true, attributeFilter: ["disabled"] });
    sel._comboSync();
}

(function () {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    new MutationObserver(() => {
        box.querySelectorAll('select[id^="m-"][id$="-siswa"]').forEach(enhanceSiswaSelect);
    }).observe(box, { childList: true });
})();