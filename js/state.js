// Normalisasi nomor HP ke format lokal 08xxxxxxxxxx.
// Menangani angka dari Sheets yang kehilangan 0 di depan (812...), awalan 62 / +62, spasi, dan tanda hubung.
function normalizePhone(phone) {
    let p = String(phone === null || phone === undefined ? '' : phone).replace(/[^0-9]/g, '');
    if (p === '') return '';
    if (p.startsWith('62')) p = '0' + p.substring(2);
    else if (p.startsWith('8')) p = '0' + p;
    return p;
}

// Format internasional (62xxxxxxxxxx) untuk tautan WhatsApp.
function toWhatsAppNumber(phone) {
    const p = normalizePhone(phone);
    return p.startsWith('0') ? '62' + p.substring(1) : p;
}

let lastFetchTimes = {
    bootstrap: 0,
    absensi: 0,
    kebiasaan: 0,
    keagamaan: 0,
    akademik: 0,
    pembinaan: 0,
    laporan: 0
};

let kebiasaanDebounceTimer = null;
let pendingKebiasaanQueue = new Map();
let silentTokenRefreshInterval = null;
let notificationPollingInterval = null;
let headerClockInterval = null;

let appState = {
    token: null,
    user: null,
    kelas: [],
    guru: [],
    siswa: [],
    myStudents: [],
    peranAktif: null,
    absensi: [],
    kebiasaan: [],
    keagamaan: [],
    akademik: [],
    prestasi: [],
    pembinaan: [],
    activeSiswaDetail: null,
    laporanRekap: [],
    currentNotifications: [],
    notificationsReady: false,
    handledNotifications: [],
    pengaturan: { nama_kepsek: "", nip_kepsek: "" }
};

function populateSiswaSelectForRole(selectEl, options = {}) {
    if (!selectEl || !appState.user) return;
    const includeAllOption = !!options.includeAllOption;
    const isSiswaRole = appState.user.role === 'siswa';

    if (isSiswaRole) {
        selectEl.innerHTML = `<option value="${appState.user.id}" selected>${escapeHtml(appState.user.nama)}</option>`;
        selectEl.value = appState.user.id;
        selectEl.disabled = true;
        return;
    }

    const prevValue = selectEl.value;
    selectEl.disabled = false;
    const siswaOptions = getSiswaPeran().map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    const allOption = includeAllOption ? `<option value="ALL">Semua Siswa</option>` : "";
    selectEl.innerHTML = `<option value="" disabled selected>-- Pilih Siswa --</option>` + allOption + siswaOptions;

    if (prevValue && prevValue !== "") selectEl.value = prevValue;
}

let dataPollingInterval = null;
const DATA_POLL_INTERVAL_MS = 18000;

function saveAppStateToLocal() {
    try {
        localStorage.setItem("cache_appState_full", JSON.stringify({
            cacheOwnerId: appState.user ? String(appState.user.id) : null,
            cacheOwnerRole: appState.user ? appState.user.role : null,
            kelas: appState.kelas,
            guru: appState.guru,
            siswa: appState.siswa,
            myStudents: appState.myStudents,
            absensi: appState.absensi,
            kebiasaan: appState.kebiasaan,
            keagamaan: appState.keagamaan,
            akademik: appState.akademik,
            prestasi: appState.prestasi,
            pembinaan: appState.pembinaan,
            laporanRekap: appState.laporanRekap,
            pengaturan: appState.pengaturan,
            lastFetchTimes: lastFetchTimes
        }));
    } catch (e) { }
}

function loadAppStateFromLocal() {
    const cached = localStorage.getItem("cache_appState_full");
    if (cached) {
        try {
            const data = JSON.parse(cached);
            const ownerId = data.cacheOwnerId;
            const ownerRole = data.cacheOwnerRole;
            delete data.cacheOwnerId;
            delete data.cacheOwnerRole;
            // Cache hanya sah jika milik user yang sedang login.
            // Cache lama tanpa pemilik juga dibuang.
            if (!appState.user || !ownerId || ownerId !== String(appState.user.id) || ownerRole !== appState.user.role) {
                localStorage.removeItem("cache_appState_full");
                return false;
            }
            if (data.lastFetchTimes) {
                lastFetchTimes = { ...lastFetchTimes, ...data.lastFetchTimes };
                delete data.lastFetchTimes;
            }
            appState = { ...appState, ...data };
            return true;
        } catch (e) { }
    }
    return false;
}

// ===== Peran guru: wali kelas / mentor =====
// Backend mengirim flag turunan di appState.user: is_wali, is_mentor, kelas_wali_id, jumlah_binaan.
// appState.siswa berisi gabungan anak wali + anak binaan (sudah disaring backend).
// appState.peranAktif ("wali" | "mentor" | "semua") hanya menyaring tampilan guru. Admin dan siswa: null.
const PERAN_LABEL = { wali: "Wali Kelas", mentor: "Mentor", semua: "Semua" };
const PERAN_STORAGE_PREFIX = "peran_aktif_";

// Cermin WRITE_KATEGORI di Kode.gs. Backend tetap penentu akhir.
const WRITE_KATEGORI_CLIENT = {
    wali: new Set(["siswa", "absensi", "kebiasaan", "akademik", "keagamaan", "prestasi", "pembinaan", "magiclink"]),
    mentor: new Set(["keagamaan", "prestasi", "pembinaan"]),
    self: new Set(["kebiasaan"])
};

function isGuruUser() {
    return !!(appState.user && appState.user.role === 'guru');
}

function isAdminUser() {
    return !!(appState.user && appState.user.role === 'admin');
}

// ID kelas yang diwalikan guru, atau null. Memakai flag backend; fallback ke pencarian Kelas.guru_id
// untuk sesi lama yang belum membawa flag.
function getKelasWaliId() {
    if (!isGuruUser()) return null;
    const flag = appState.user.kelas_wali_id;
    if (flag !== undefined && flag !== null && String(flag) !== "") return String(flag);
    if (appState.user.is_wali !== undefined) return null;
    const kls = (appState.kelas || []).find(k => String(k.guru_id) === String(appState.user.id));
    return kls ? String(kls.id) : null;
}

function isWaliUser() {
    if (!isGuruUser()) return false;
    if (appState.user.is_wali !== undefined) return !!appState.user.is_wali;
    return getKelasWaliId() !== null;
}

function isMentorUser() {
    if (!isGuruUser()) return false;
    if (appState.user.is_mentor !== undefined) return !!appState.user.is_mentor;
    const gid = String(appState.user.id);
    return (appState.siswa || []).some(s => String(s.mentor_id || "").trim() === gid);
}

// Peran yang boleh dipilih guru, urutan: wali, mentor, semua.
function getPeranTersedia() {
    if (!isGuruUser()) return [];
    const wali = isWaliUser();
    const mentor = isMentorUser();
    if (wali && mentor) return ["wali", "mentor", "semua"];
    if (mentor) return ["mentor"];
    return ["wali"];
}

function getPeranAktif() {
    if (!isGuruUser()) return null;
    const ada = getPeranTersedia();
    if (appState.peranAktif && ada.includes(appState.peranAktif)) return appState.peranAktif;
    return ada.length > 1 ? "semua" : ada[0];
}

// Panggil setelah login, pulih sesi, atau flag user berubah.
function initPeranAktif() {
    if (!isGuruUser()) {
        appState.peranAktif = null;
        return null;
    }
    const ada = getPeranTersedia();
    let saved = null;
    try { saved = localStorage.getItem(PERAN_STORAGE_PREFIX + appState.user.id); } catch (e) { }
    if (saved && ada.includes(saved)) appState.peranAktif = saved;
    else appState.peranAktif = ada.length > 1 ? "semua" : ada[0];
    return appState.peranAktif;
}

function setPeranAktif(peran) {
    if (!isGuruUser()) return;
    if (!getPeranTersedia().includes(peran)) return;
    if (appState.peranAktif === peran) return;
    appState.peranAktif = peran;
    try { localStorage.setItem(PERAN_STORAGE_PREFIX + appState.user.id, peran); } catch (e) { }
    if (typeof onPeranChanged === "function") onPeranChanged();
}

// Gabungkan flag terbaru dari backend (validateSession, refreshToken) ke sesi berjalan.
function syncUserFlags(fresh) {
    if (!fresh || !appState.user) return;
    if (fresh.id !== undefined && String(fresh.id) !== String(appState.user.id)) return;

    const snapshot = () => JSON.stringify([
        appState.user.is_wali, appState.user.is_mentor, appState.user.kelas_wali_id,
        appState.user.jumlah_binaan, appState.peranAktif
    ]);
    const before = snapshot();

    appState.user = { ...appState.user, ...fresh };
    try {
        const s = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
        if (s.user) {
            ["is_wali", "is_mentor", "kelas_wali_id", "jumlah_binaan"].forEach(k => {
                if (appState.user[k] !== undefined) s.user[k] = appState.user[k];
            });
            localStorage.setItem("session_anak_wali", JSON.stringify(s));
        }
    } catch (e) { }

    initPeranAktif();
    if (before !== snapshot() && typeof onPeranChanged === "function") onPeranChanged();
}

// Teks peran statis untuk badge sidebar: dari flag, bukan dari peran aktif.
function getGuruPeranText() {
    if (!isGuruUser()) return "";
    const wali = isWaliUser();
    const mentor = isMentorUser();
    if (wali && mentor) return "Wali & Mentor";
    if (mentor) return "Mentor";
    if (wali) return "Wali Kelas";
    return "";
}

// ===== Akses per siswa =====
// Mirror getAccessMap di backend: "admin" | "self" | "wali" | "mentor" | "both" | null.
function getAccessTypeSiswa(siswa) {
    if (!siswa || !appState.user) return null;
    const role = appState.user.role;
    if (role === "admin") return "admin";
    if (role === "siswa") return String(siswa.id) === String(appState.user.id) ? "self" : null;
    if (role !== "guru") return null;
    const kw = getKelasWaliId();
    const isWali = kw !== null && String(siswa.kelas_id) === kw;
    const isMentor = String(siswa.mentor_id || "").trim() === String(appState.user.id);
    if (isWali && isMentor) return "both";
    if (isWali) return "wali";
    if (isMentor) return "mentor";
    return null;
}

// Tipe akses setelah dipersempit peran aktif. Siswa "both" saat peran Mentor dihitung mentor,
// saat peran Wali dihitung wali. Hanya mempersempit, tidak pernah memperluas hak.
function getEffectiveAccessType(siswa) {
    const raw = getAccessTypeSiswa(siswa);
    if (raw !== "both") return raw;
    const p = getPeranAktif();
    if (p === "mentor") return "mentor";
    if (p === "wali") return "wali";
    return "both";
}

function isSiswaInPeran(siswa) {
    const raw = getAccessTypeSiswa(siswa);
    if (!raw) return false;
    if (raw !== "wali" && raw !== "mentor" && raw !== "both") return true;
    const p = getPeranAktif();
    if (p === "semua") return true;
    if (p === "wali") return raw === "wali" || raw === "both";
    if (p === "mentor") return raw === "mentor" || raw === "both";
    return false;
}

// Penanda per siswa untuk mode Semua: "wali" | "mentor" | "both" | null.
function getPeranBadgeSiswa(siswa) {
    const raw = getAccessTypeSiswa(siswa);
    return (raw === "wali" || raw === "mentor" || raw === "both") ? raw : null;
}

// Siswa sesuai peran aktif. Admin dan siswa: semua yang ada di appState.siswa.
function getSiswaPeran() {
    return (appState.siswa || []).filter(isSiswaInPeran);
}

function scopeSiswaForUser(list) {
    return (list || []).filter(isSiswaInPeran);
}

// Saring daftar apa pun yang punya siswa_id (laporanRekap memakai item.id).
function scopeBySiswaId(list, getSiswaId) {
    const arr = list || [];
    if (!isGuruUser()) return arr;
    const ids = new Set(getSiswaPeran().map(s => String(s.id)));
    return arr.filter(item => ids.has(String(getSiswaId(item))));
}

function canWriteType(type, kategori) {
    if (!type) return false;
    if (type === "admin") return true;
    if (type === "both") return WRITE_KATEGORI_CLIENT.wali.has(kategori) || WRITE_KATEGORI_CLIENT.mentor.has(kategori);
    const set = WRITE_KATEGORI_CLIENT[type];
    return !!set && set.has(kategori);
}

function _resolveSiswaRef(ref) {
    if (ref && typeof ref === "object") return ref;
    return (appState.siswa || []).find(s => String(s.id) === String(ref)) || null;
}

// canWrite("pembinaan")            : boleh menulis kategori ini di peran aktif?
// canWrite("pembinaan", siswaOrId) : boleh menulis untuk siswa ini?
function canWrite(kategori, siswaRef) {
    const u = appState.user;
    if (!u) return false;
    if (u.role === "admin") return true;
    if (u.role === "siswa") return WRITE_KATEGORI_CLIENT.self.has(kategori);
    if (u.role !== "guru") return false;

    if (siswaRef !== undefined && siswaRef !== null && siswaRef !== "") {
        const s = _resolveSiswaRef(siswaRef);
        return s ? canWriteType(getEffectiveAccessType(s), kategori) : false;
    }
    const p = getPeranAktif();
    if (p === "wali") return WRITE_KATEGORI_CLIENT.wali.has(kategori);
    if (p === "mentor") return WRITE_KATEGORI_CLIENT.mentor.has(kategori);
    return WRITE_KATEGORI_CLIENT.wali.has(kategori) || WRITE_KATEGORI_CLIENT.mentor.has(kategori);
}

// Ubah/hapus satu catatan. Mentor hanya catatan buatannya sendiri.
// Data lama (dibuat_oleh_id kosong) dianggap milik wali.
function canEditRecord(rec, kategori) {
    if (!rec || !appState.user) return false;
    if (appState.user.role === "admin") return true;
    if (!canWrite(kategori, rec.siswa_id)) return false;
    if (!isGuruUser()) return true;
    const s = _resolveSiswaRef(rec.siswa_id);
    if (getEffectiveAccessType(s) !== "mentor") return true;
    const owner = String(rec.dibuat_oleh_id || "").trim();
    return owner !== "" && owner === String(appState.user.id).trim();
}

// ===== Label sesuai peran aktif =====
function getLabelSiswa() {
    const p = getPeranAktif();
    if (p === "wali") return "Anak Wali";
    if (p === "mentor") return "Anak Binaan";
    if (p === "semua") return "Anak Wali & Binaan";
    return "Siswa";
}

// ===== Kelas =====
// Daftar kelas yang muncul di filter. Admin dan siswa: semua.
// Guru: kelas wali (jika peran Wali/Semua) + kelas tempat anak binaan berada.
function getVisibleKelas() {
    const all = appState.kelas || [];
    if (!isGuruUser()) return all;
    const ids = new Set();
    const p = getPeranAktif();
    const kw = getKelasWaliId();
    if (kw !== null && (p === "wali" || p === "semua")) ids.add(kw);
    getSiswaPeran().forEach(s => ids.add(String(s.kelas_id)));
    return all.filter(k => ids.has(String(k.id)));
}

// Guru dengan satu kelas terlihat tidak perlu memilih. Lebih dari satu: bebas memilih.
function isKelasSelectLocked() {
    return isGuruUser() && getVisibleKelas().length <= 1;
}

function getEffectiveKelasFilter(rawValue) {
    if (!isGuruUser()) return rawValue || "";
    const visible = getVisibleKelas();
    if (visible.length === 1) return String(visible[0].id);
    if (rawValue && visible.some(k => String(k.id) === String(rawValue))) return String(rawValue);
    return "";
}

// Isi <select> kelas. Guru dengan satu kelas: satu opsi, terpilih. Guru dengan banyak kelas: seperti admin,
// tetapi hanya kelas terlihat. opts.allLabel: teks opsi "semua". opts.prefix: awalan nama kelas.
function renderKelasSelectOptions(selectedId, opts = {}) {
    const allLabel = opts.allLabel || "Semua Kelas";
    const prefix = opts.prefix || "";
    const visible = getVisibleKelas();
    const optHtml = (k, sel) =>
        `<option value="${k.id}" ${sel ? 'selected' : ''}>${prefix}${escapeHtml(k.nama_kelas)}</option>`;

    if (isGuruUser()) {
        if (visible.length === 0) return `<option value="" selected>Belum ada kelas</option>`;
        if (visible.length === 1) return optHtml(visible[0], true);
    }
    return `<option value="">${escapeHtml(allLabel)}</option>` +
        visible.map(k => optHtml(k, String(selectedId) === String(k.id))).join("");
}

function applyKelasSelectLock(selectEl) {
    if (!selectEl) return;
    selectEl.disabled = isKelasSelectLocked();
}