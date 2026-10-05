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
    const siswaOptions = (appState.siswa || []).map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
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

function getGuruKelasId() {
    if (!appState.user || appState.user.role !== 'guru') return null;
    const kls = appState.kelas.find(k => String(k.guru_id) === String(appState.user.id));
    return kls ? kls.id : null;
}

function isGuruUser() {
    return !!(appState.user && appState.user.role === 'guru');
}

// Daftar kelas yang boleh dilihat user.
// Admin: semua. Guru: hanya kelas walinya (kosong jika bukan wali).
function getVisibleKelas() {
    const all = appState.kelas || [];
    if (!isGuruUser()) return all;
    const kelasId = getGuruKelasId();
    if (kelasId === null || kelasId === undefined) return [];
    return all.filter(k => String(k.id) === String(kelasId));
}

// Nilai filter kelas yang berlaku. Guru selalu dikunci ke kelas walinya.
function getEffectiveKelasFilter(rawValue) {
    if (!isGuruUser()) return rawValue || "";
    const kelasId = getGuruKelasId();
    return (kelasId === null || kelasId === undefined) ? "" : String(kelasId);
}

// Filter pengaman sisi klien. Backend tetap sumber utama.
// getKelasId: fungsi yang mengambil kelas_id dari satu item.
function scopeByGuruKelas(list, getKelasId) {
    const arr = list || [];
    if (!isGuruUser()) return arr;
    const kelasId = getGuruKelasId();
    if (kelasId === null || kelasId === undefined) return [];
    return arr.filter(item => String(getKelasId(item)) === String(kelasId));
}

function scopeSiswaForUser(list) {
    return scopeByGuruKelas(list, s => s.kelas_id);
}

// Isi <select> kelas sesuai role. Guru: satu opsi, terpilih, disabled.
// opts.allLabel: teks opsi "semua" (admin). opts.prefix: awalan nama kelas.
// opts.placeholder: true = opsi kosong "Pilih Kelas" memakai allLabel.
function renderKelasSelectOptions(selectedId, opts = {}) {
    const allLabel = opts.allLabel || "Semua Kelas";
    const prefix = opts.prefix || "";
    const visible = getVisibleKelas();
    const optHtml = (k, sel) =>
        `<option value="${k.id}" ${sel ? 'selected' : ''}>${prefix}${escapeHtml(k.nama_kelas)}</option>`;

    if (isGuruUser()) {
        if (visible.length === 0) return `<option value="" selected>Belum ada kelas wali</option>`;
        return visible.map(k => optHtml(k, true)).join("");
    }
    return `<option value="">${escapeHtml(allLabel)}</option>` +
        visible.map(k => optHtml(k, String(selectedId) === String(k.id))).join("");
}

function applyKelasSelectLock(selectEl) {
    if (!selectEl) return;
    selectEl.disabled = isGuruUser();
}
