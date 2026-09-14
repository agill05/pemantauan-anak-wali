const API_URL = "https://script.google.com/macros/s/AKfycbyKFFTWsOr9kHdJnjEjhBEFq9ewT62UocKpWVUIw5IbwdjAAREqPujQYzrBDQnGX254/exec";

// ==================================================================
// 1. STATE MANAGEMENT & MASTER DATA
// ==================================================================
let kebiasaanDebounceTimer = null;
let pendingKebiasaanQueue = new Map();
let silentTokenRefreshInterval = null;

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
    currentNotifications: []
};

// Master 114 Surah Al-Qur'an
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
    { no: 109, nama: "Al-Kafirun", juz: 30 }, { no: 110, nama: "An-Nasr", juz: 30 }, { no: 111, nama: "Al-Masad", juz: 30 },
    { no: 112, nama: "Al-Ikhlas", juz: 30 }, { no: 113, nama: "Al-Falaq", juz: 30 }, { no: 114, nama: "An-Nas", juz: 30 }
];

// Master 7 Kebiasaan Hebat
const MASTER_KEBIASAAN = [
    { id: "K1", nama: "Bangun Pagi", icon: "fa-sun", color: "text-amber-500 bg-amber-50" },
    { id: "K2", nama: "Beribadah / Shalat", icon: "fa-pray", color: "text-emerald-500 bg-emerald-50" },
    { id: "K3", nama: "Berolahraga", icon: "fa-running", color: "text-blue-500 bg-blue-50" },
    { id: "K4", nama: "Makan Sehat & Bergizi", icon: "fa-apple-alt", color: "text-rose-500 bg-rose-50" },
    { id: "K5", nama: "Gemar Membaca & Belajar", icon: "fa-book-reader", color: "text-indigo-500 bg-indigo-50" },
    { id: "K6", nama: "Bermasyarakat / Gotong Royong", icon: "fa-hands-helping", color: "text-purple-500 bg-purple-50" },
    { id: "K7", nama: "Tidur Cepat & Teratur", icon: "fa-moon", color: "text-slate-600 bg-slate-100" }
];

// ==================================================================
// 2. HELPER UTILITY & DRAFT ENGINE
// ==================================================================
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

function selectLoginRole(role) {
    const roleInput = document.getElementById("login-role");
    if (roleInput) roleInput.value = role;

    document.querySelectorAll(".login-role-btn").forEach(btn => btn.classList.remove("selected"));
    const selectedBtn = document.getElementById(`role-btn-${role}`);
    if (selectedBtn) selectedBtn.classList.add("selected");
}

function togglePasswordVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
}

function getTimeWITA24() {
    const now = new Date();
    const options = { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('id-ID', options).format(now).replace('.', ':');
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
        } catch (e) {}
    }
    return str.includes('WITA') ? str : `${str} WITA`;
}

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

function showLoading(text = "Memproses...") {
    const loader = document.getElementById("loading-overlay");
    const txt = document.getElementById("loading-text");
    if (txt) txt.innerText = text;
    if (loader) {
        loader.classList.remove("hidden");
        loader.classList.add("flex");
    }
}

function hideLoading() {
    const loader = document.getElementById("loading-overlay");
    if (loader) {
        loader.classList.add("hidden");
        loader.classList.remove("flex");
    }
}

// Anti-Loss Draft Engine Helpers
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
        badge.className = "text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 mb-3 flex items-center gap-1.5";
        box.insertBefore(badge, box.children[1] || box.firstChild);
    }

    if (isSaved) {
        badge.innerHTML = `<i class="fas fa-save text-blue-500"></i> Draf otomatis tersimpan di perangkat`;
    }
}

// ==================================================================
// 3. API ENGINE & AUTHENTICATION
// ==================================================================
async function apiCall(action, payload = {}, showFullLoader = false, retries = 3) {
    if (showFullLoader) showLoading();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: action, token: appState.token, payload: payload })
            });
            const json = await response.json();
            if (showFullLoader) hideLoading();
            return json;
        } catch (err) {
            console.error(`Attempt ${attempt} failed:`, err);
            if (attempt === retries) {
                if (showFullLoader) hideLoading();
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Koneksi Gagal', 
                    text: 'Tidak dapat terhubung ke server. Pastikan jaringan stabil.' 
                });
                return null;
            }
            await new Promise(res => setTimeout(res, 1500));
        }
    }
}

function startSilentTokenRefresh() {
    if (silentTokenRefreshInterval) clearInterval(silentTokenRefreshInterval);

    // Perbarui token setiap 10 menit
    silentTokenRefreshInterval = setInterval(async () => {
        if (!appState.token) return;

        const res = await apiCall("refreshToken", {}, false);
        if (res && res.status === "success" && res.token) {
            appState.token = res.token;
            
            const savedSession = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
            savedSession.token = res.token;
            localStorage.setItem("session_anak_wali", JSON.stringify(savedSession));
            console.log("[Auth Engine] Token sesi diperbarui secara otomatis.");
        }
    }, 10 * 60 * 1000);
}

async function handleAppLogin(e) {
    e.preventDefault();
    const role = document.getElementById("login-role") ? document.getElementById("login-role").value : "";
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    if (!role) {
        Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan pilih role pengguna terlebih dahulu.', confirmButtonColor: '#2563eb' });
        return;
    }

    const res = await apiCall("login", { role, username, password }, true);
    if (res && res.status === "success") {
        appState.token = res.token;
        appState.user = res.user;
        localStorage.setItem("session_anak_wali", JSON.stringify({ token: res.token, user: res.user }));
        await setupAppSession();
    }
}

async function setupAppSession() {
    applyRoleUI(appState.user.role);
    startSilentTokenRefresh();

    const loginView = document.getElementById("view-login");
    const mainHeader = document.getElementById("main-header");
    const mainContent = document.getElementById("main-content");
    const bottomNav = document.getElementById("bottom-nav");

    if (loginView) { loginView.classList.remove("active"); loginView.classList.add("hidden"); }
    if (mainHeader) mainHeader.classList.remove("hidden");
    if (mainContent) mainContent.classList.remove("hidden");

    // Pastikan Navigasi Bawah selalu tampil untuk semua peran
    if (bottomNav) bottomNav.classList.remove("hidden");

    const userAvatar = document.getElementById("user-avatar");
    const headerTitle = document.getElementById("header-title");
    const headerSubtitle = document.getElementById("header-subtitle");

    if (userAvatar) userAvatar.src = appState.user.foto || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(appState.user.nama));
    if (headerTitle) headerTitle.innerText = appState.user.nama;
    if (headerSubtitle) headerSubtitle.innerText = `SMPN 1 Talaga Jaya • ${appState.user.role.toUpperCase()}`;

    const sbAvatar = document.getElementById("sidebar-avatar");
    const sbNama = document.getElementById("sidebar-nama");
    const sbRole = document.getElementById("sidebar-role-badge");
    if (sbAvatar) sbAvatar.src = userAvatar ? userAvatar.src : "";
    if (sbNama) sbNama.innerText = appState.user.nama;
    if (sbRole) sbRole.innerText = appState.user.role.toUpperCase();
    renderSidebarMenu(appState.user.role);

    showLoading("Menyinkronkan data...");
    const resBootstrap = await apiCall("getBootstrapData", {}, false);
    hideLoading();

    if (resBootstrap && resBootstrap.status === "success") {
        appState.kelas = resBootstrap.data.initial.kelas || [];
        appState.guru = resBootstrap.data.initial.guru || [];
        appState.siswa = resBootstrap.data.initial.siswa || [];
        appState.myStudents = resBootstrap.data.initial.siswa || [];
    }

    await checkStudentNotifications();

    // Arahkan ke Beranda/Dashboard saat awal masuk
    switchView("dashboard");
}

function handleLogout(force = false) {
    const executeLogout = () => {
        if (silentTokenRefreshInterval) clearInterval(silentTokenRefreshInterval);
        localStorage.removeItem("session_anak_wali");
        appState = { token: null, user: null, kelas: [], guru: [], siswa: [], myStudents: [] };
        location.reload();
    };

    if (force) {
        executeLogout();
    } else {
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: "Apakah Anda yakin ingin keluar dari aplikasi?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) executeLogout();
        });
    }
}

async function fetchAllAppData(force = true) {
    if (!force && appState.siswa.length > 0 && appState.akademik.length > 0) return;

    showLoading("Menyinkronkan seluruh data...");
    const resBootstrap = await apiCall("getBootstrapData", {}, false);
    hideLoading();

    if (resBootstrap && resBootstrap.status === "success") {
        appState.kelas = resBootstrap.data.initial.kelas || [];
        appState.guru = resBootstrap.data.initial.guru || [];
        appState.siswa = resBootstrap.data.initial.siswa || [];
        appState.myStudents = resBootstrap.data.initial.siswa || [];
    }
}

async function manualRefreshAll() {
    const icon = document.querySelector("#btn-refresh-header i");
    if (icon) icon.classList.add("fa-spin");

    await fetchAllAppData(true);
    await loadAbsensiData(true);
    await checkStudentNotifications();

    const activeView = document.querySelector(".view-section.active");
    const viewId = activeView ? activeView.id.replace("view-", "") : "dashboard";
    switchView(viewId);

    if (icon) icon.classList.remove("fa-spin");
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data terbaru berhasil dimuat.', timer: 1200, showConfirmButton: false });
}

// ==================================================================
// 4. NAVIGATION & LAYOUT CONTROLLERS
// ==================================================================
function applyRoleUI(role) {
    document.body.setAttribute("data-role", role);
    const navContainer = document.getElementById("bottom-nav-items");
    const notifBtnHeader = document.getElementById("btn-notif-header");

    if (notifBtnHeader) {
        notifBtnHeader.classList.remove("hidden");
    }

    if (!navContainer) return;

    if (role === "siswa") {
        navContainer.innerHTML = `
            <button onclick="switchView('dashboard')" class="nav-item flex flex-col items-center gap-1 text-slate-400 active" data-target="dashboard">
                <i class="fas fa-home text-lg"></i>
                <span class="text-[10px] font-bold">Beranda</span>
            </button>
            <button onclick="switchView('kebiasaan')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="kebiasaan">
                <i class="fas fa-star text-lg"></i>
                <span class="text-[10px] font-bold">Kebiasaan</span>
            </button>
            <button onclick="switchView('karakter')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="karakter">
                <i class="fas fa-quran text-lg"></i>
                <span class="text-[10px] font-bold">Keagamaan</span>
            </button>
            <button onclick="switchView('akademik')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="akademik">
                <i class="fas fa-graduation-cap text-lg"></i>
                <span class="text-[10px] font-bold">Akademik</span>
            </button>
            <button onclick="openProfilSiswa('${appState.user ? appState.user.id : ''}')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="profil-siswa">
                <i class="fas fa-user-circle text-lg"></i>
                <span class="text-[10px] font-bold">Profil</span>
            </button>
        `;
    } else {
        navContainer.innerHTML = `
            <button onclick="switchView('dashboard')" class="nav-item flex flex-col items-center gap-1 text-slate-400 active" data-target="dashboard">
                <i class="fas fa-home text-lg"></i>
                <span class="text-[10px] font-bold">Beranda</span>
            </button>
            <button onclick="switchView('absensi')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="absensi">
                <i class="fas fa-calendar-check text-lg"></i>
                <span class="text-[10px] font-bold">Presensi</span>
            </button>
            <button onclick="switchView('akademik')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="akademik">
                <i class="fas fa-graduation-cap text-lg"></i>
                <span class="text-[10px] font-bold">Akademik</span>
            </button>
            <button onclick="switchView('laporan')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="laporan">
                <i class="fas fa-file-invoice text-lg"></i>
                <span class="text-[10px] font-bold">Laporan</span>
            </button>
            ${role === 'admin' ? `
            <button onclick="switchView('admin-manage')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="admin-manage">
                <i class="fas fa-user-cog text-lg"></i>
                <span class="text-[10px] font-bold">Master</span>
            </button>` : ''}
        `;
    }
}

function switchView(viewId) {
    if (pendingKebiasaanQueue && pendingKebiasaanQueue.size > 0) {
        flushKebiasaanQueue();
    }
    document.querySelectorAll(".view-section").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".sidebar-nav-item").forEach(el => el.classList.remove("active", "bg-slate-100", "text-primary"));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add("active");

    const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (navBtn) navBtn.classList.add("active");

    const sidebarBtn = document.querySelector(`.sidebar-nav-item[data-target="${viewId}"]`);
    if (sidebarBtn) sidebarBtn.classList.add("active", "bg-slate-100", "text-primary");

    if (viewId === "dashboard") renderDashboard();
    if (viewId === "absensi") loadAbsensiData();
    if (viewId === "kebiasaan") loadKebiasaanData();
    if (viewId === "karakter") loadKeagamaanData();
    if (viewId === "akademik") loadAkademikData();
    if (viewId === "pembinaan") loadPembinaanData();
    if (viewId === "laporan") loadLaporanRekap();
    if (viewId === "siswa") renderSiswaView();
    if (viewId === "admin-manage") renderAdminManage();
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

function handleSidebarNav(viewId) {
    switchView(viewId);
    toggleSidebar(false);
}

function renderSidebarMenu(role) {
    const container = document.getElementById("sidebar-menu-items");
    if (!container) return;

    const item = (view, icon, label) => `
        <button onclick="handleSidebarNav('${view}')" class="sidebar-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition" data-target="${view}">
            <i class="fas ${icon} w-5 text-center text-primary"></i> ${label}
        </button>`;

    let html = item("dashboard", "fa-home", "Beranda");

    if (role === "siswa") {
        html += item("kebiasaan", "fa-star", "7 Kebiasaan Hebat");
        html += item("karakter", "fa-quran", "Keagamaan");
        html += item("akademik", "fa-graduation-cap", "Akademik & Prestasi");
    } else {
        html += item("absensi", "fa-calendar-check", "Presensi Kehadiran");
        html += item("kebiasaan", "fa-star", "7 Kebiasaan Hebat");
        html += item("karakter", "fa-quran", "Keagamaan");
        html += item("akademik", "fa-graduation-cap", "Akademik & Prestasi");
        html += item("pembinaan", "fa-user-edit", "Catatan Pembinaan");
        html += item("siswa", "fa-users", "Data Siswa");
        html += item("laporan", "fa-file-invoice", "Laporan");
        if (role === "admin") {
            html += item("admin-manage", "fa-user-cog", "Master Data");
        }
    }

    container.innerHTML = html;
}

// ==================================================================
// 5. DASHBOARD MODULE
// ==================================================================
async function renderDashboard() {
    renderSkeleton("dash-stats-container", 3);
    const res = await apiCall("getDashboardData", {}, false);

    if (!res || res.status !== "success") return;

    const { total_siswa, hadir_today, priority_list, agenda_list } = res.data;
    const role = appState.user.role;

    const adminBanner = document.getElementById("dash-admin-banner");
    if (adminBanner) {
        if (role === "admin") adminBanner.classList.remove("hidden");
        else adminBanner.classList.add("hidden");
    }

    const statsContainer = document.getElementById("dash-stats-container");
    if (statsContainer) {
        if (role === "admin" || role === "guru") {
            statsContainer.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">${role === 'admin' ? 'Total Siswa' : 'Anak Wali'}</span>
                        <span class="w-7 h-7 rounded-lg bg-blue-50 text-primary flex items-center justify-center text-xs"><i class="fas fa-users"></i></span>
                    </div>
                    <p class="text-2xl font-black text-slate-800 mt-1">${total_siswa}</p>
                </div>
                <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Hadir Hari Ini</span>
                        <span class="w-7 h-7 rounded-lg bg-emerald-50 text-secondary flex items-center justify-center text-xs"><i class="fas fa-calendar-check"></i></span>
                    </div>
                    <p class="text-2xl font-black text-emerald-600 mt-1">${hadir_today}</p>
                </div>
                <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Perlu Perhatian</span>
                        <span class="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs"><i class="fas fa-triangle-exclamation"></i></span>
                    </div>
                    <p class="text-2xl font-black text-rose-600 mt-1">${priority_list.length}</p>
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between col-span-3">
                    <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Status Pemantauan Saya</span>
                    <p class="text-sm font-bold text-slate-700 mt-1">
                      ${priority_list.length > 0 ? '⚠️ Memerlukan Tindak Lanjut' : '✅ Perkembangan Baik'}
                    </p>
                </div>
            `;
        }
    }

    renderPrioritySection(priority_list);
    renderAgendaSection(agenda_list);
}

function renderPrioritySection(priorityList) {
    const container = document.getElementById("dash-priority-container");
    if (!container) return;

    if (!priorityList || priorityList.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-check-circle text-emerald-500 text-2xl mb-2"></i>
            <p class="text-xs text-slate-500">Semua siswa dalam kondisi baik. Tidak ada indikator perhatian aktif.</p>
          </div>
        `;
        return;
    }

    container.innerHTML = priorityList.map(item => {
        const s = item.siswa;
        const indicatorsHtml = item.indicators.map(ind => `
          <span class="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
            <i class="fas fa-exclamation-triangle text-[9px]"></i> ${escapeHtml(ind.pesan)}
          </span>
        `).join(" ");

        return `
          <div class="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img src="${escapeHtml(s.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.nama))}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                <div>
                  <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
                  <p class="text-[10px] text-slate-400">NISN: ${escapeHtml(s.nisn || '-')} | Ortu: ${escapeHtml(s.no_hp_ortu || '-')}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="openProfilSiswa('${escapeHtml(s.id)}')" class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 text-xs">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="hubungiOrtu('${escapeHtml(s.id)}')" class="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 text-xs">
                    <i class="fab fa-whatsapp"></i>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-1 pt-1 border-t border-slate-50">
              ${indicatorsHtml}
            </div>
          </div>
        `;
    }).join("");
}

function renderAgendaSection(agendaList) {
    const container = document.getElementById("dash-agenda-list");
    if (!container) return;

    if (!agendaList || agendaList.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 italic px-1">Belum ada agenda pembinaan mendatang.</p>`;
        return;
    }

    container.innerHTML = agendaList.map(ag => `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-800">${escapeHtml(ag.nama_siswa)}</h4>
              <p class="text-[10px] text-slate-500">${escapeHtml(ag.jenis)} • ${escapeHtml(ag.permasalahan || '-')}</p>
            </div>
          </div>
          <span class="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">
            ${escapeHtml(ag.jadwal_pantau)}
          </span>
        </div>
    `).join("");
}

// Notifikasi Engine
async function checkStudentNotifications() {
    if (!appState.user) return;

    const [resAbs, resAkd, resPbn] = await Promise.all([
        apiCall("getAbsensi", { tanggal: getDateWITA() }, false),
        apiCall("getAkademik", {}, false),
        apiCall("getPembinaan", {}, false)
    ]);

    const absensiData = resAbs?.data || [];
    const akademikData = resAkd?.data || [];
    const pembinaanData = resPbn?.data || [];

    let issueCount = 0;
    const notificationList = [];

    const targetStudents = (appState.user.role === 'siswa')
        ? (appState.siswa.length > 0 ? appState.siswa : [appState.user])
        : (appState.siswa || []);

    targetStudents.forEach(s => {
        const sId = String(s.id);
        
        const totalAlpa = absensiData.filter(a => String(a.siswa_id) === sId && a.status === 'A').length;
        if (totalAlpa > 0) {
            issueCount++;
            notificationList.push({
                siswa: s,
                type: 'danger',
                title: 'Absensi (Alpa)',
                desc: appState.user.role === 'siswa'
                    ? `Anda tercatat Alpa pada hari ini.`
                    : `${s.nama} tercatat Alpa pada hari ini.`
            });
        }

        const lowGrades = akademikData.filter(a => String(a.siswa_id) === sId && Number(a.nilai_akhir || 0) < Number(a.kktp || 75));
        if (lowGrades.length > 0) {
            lowGrades.forEach(g => {
                issueCount++;
                notificationList.push({
                    siswa: s,
                    type: 'warning',
                    title: 'Nilai Akademik Kurang',
                    desc: appState.user.role === 'siswa'
                        ? `Nilai mata pelajaran ${g.mapel} Anda (${g.nilai_akhir}) di bawah standar KKTP (${g.kktp}).`
                        : `${s.nama}: Nilai ${g.mapel} (${g.nilai_akhir}) di bawah standar KKTP (${g.kktp}).`
                });
            });
        }

        const activePem = pembinaanData.filter(p => String(p.siswa_id) === sId && String(p.status).toLowerCase() !== 'selesai');
        if (activePem.length > 0) {
            activePem.forEach(p => {
                issueCount++;
                notificationList.push({
                    siswa: s,
                    type: 'info',
                    title: 'Catatan Pembinaan',
                    desc: appState.user.role === 'siswa'
                        ? `Catatan pembinaan (${p.jenis}): ${p.permasalahan}`
                        : `${s.nama}: Catatan pembinaan (${p.jenis}): ${p.permasalahan}`
                });
            });
        }
    });

    appState.currentNotifications = notificationList;

    const badge = document.getElementById("notif-badge");
    const btnNotif = document.getElementById("btn-notif-header");
    if (badge && btnNotif) {
        if (issueCount > 0) {
            badge.innerText = issueCount;
            badge.classList.remove("hidden");
            btnNotif.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }
}

function openNotificationModal() {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const list = appState.currentNotifications || [];

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i class="fas fa-bell text-amber-500"></i> Notifikasi Siswa Bermasalah (${list.length})
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            ${list.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-check-circle text-emerald-500 text-2xl mb-1"></i>
                    <p class="text-xs text-slate-500">Tidak ada siswa yang memerlukan perhatian mendesak.</p>
                </div>
            ` : list.map(n => `
                <div class="p-3 rounded-2xl border ${n.type === 'danger' ? 'bg-rose-50 border-rose-100' : (n.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100')} flex justify-between items-center">
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded uppercase ${n.type === 'danger' ? 'bg-rose-200 text-rose-800' : (n.type === 'warning' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800')}">${n.title}</span>
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(n.siswa.nama)}</h4>
                        </div>
                        <p class="text-[11px] text-slate-600">${escapeHtml(n.desc)}</p>
                    </div>
                    <button onclick="closeModal(); openProfilSiswa('${n.siswa.id}')" class="p-2 bg-white text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-100 shrink-0 ml-2">
                        Profil <i class="fas fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

// ==================================================================
// 6. PRESENSI MODULE
// ==================================================================
async function loadAbsensiData(forceRefresh = false) {
    const inputDate = document.getElementById("absensi-date");
    const tanggal = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    if (inputDate) inputDate.value = tanggal;

    if (!forceRefresh && appState.absensi.length > 0) {
        renderAbsensiView();
        return;
    }

    renderSkeleton("absensi-list-container", 4);
    const res = await apiCall("getAbsensi", { tanggal }, false);

    if (res && res.data) {
        appState.absensi = res.data;
    }
    renderAbsensiView();
}

function renderAbsensiView() {
    const container = document.getElementById("absensi-list-container");
    if (!container) return;

    if (appState.siswa.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-users-slash text-2xl mb-2"></i><p class="text-xs">Belum ada data siswa.</p></div>`;
        return;
    }

    const isEditable = appState.user.role === 'admin' || appState.user.role === 'guru';
    const selectedKelas = document.getElementById("absensi-kelas-filter")?.value || "";

    const filteredSiswa = selectedKelas 
        ? appState.siswa.filter(s => String(s.kelas_id) === String(selectedKelas))
        : appState.siswa;

    // --- Kalkulasi Statistik Presensi Kelas ---
    const totalSiswa = filteredSiswa.length;
    let countH = 0, countS = 0, countI = 0, countA = 0;

    filteredSiswa.forEach(s => {
        const rec = appState.absensi.find(a => String(a.siswa_id) === String(s.id));
        const st = rec ? rec.status : 'H';
        if (st === 'H') countH++;
        else if (st === 'S') countS++;
        else if (st === 'I') countI++;
        else countA++;
    });

    const persenHadir = totalSiswa > 0 ? Math.round((countH / totalSiswa) * 100) : 0;
    // ----------------------------------------

    const kelasOptions = appState.kelas.map(k => 
        `<option value="${k.id}" ${String(selectedKelas) === String(k.id) ? 'selected' : ''}>Kelas ${escapeHtml(k.nama_kelas)}</option>`
    ).join("");

    container.innerHTML = `
        <div class="space-y-3">
            <!-- Filter Kelas -->
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                <label class="block text-[9px] font-bold text-slate-400 uppercase mb-1">Filter Kelas</label>
                <select id="absensi-kelas-filter" onchange="renderAbsensiView()" class="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none">
                    <option value="">Semua Kelas</option>
                    ${kelasOptions}
                </select>
            </div>

            <!-- Card Indikator Persentase Kehadiran -->
            ${totalSiswa > 0 ? `
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-3">
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tingkat Kehadiran</span>
                        <h3 class="text-xl font-extrabold text-emerald-400">${persenHadir}% <span class="text-xs font-normal text-slate-300">Hadir</span></h3>
                    </div>
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                        ${countH}/${totalSiswa}
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${persenHadir}%"></div>
                </div>

                <!-- Mini Breakdown Stats -->
                <div class="grid grid-cols-4 gap-2 pt-1 border-t border-slate-700/60 text-center">
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-[9px] text-slate-400 font-bold">Hadir</span>
                        <span class="text-xs font-extrabold text-emerald-400">${countH}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-[9px] text-slate-400 font-bold">Sakit</span>
                        <span class="text-xs font-extrabold text-blue-400">${countS}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-[9px] text-slate-400 font-bold">Izin</span>
                        <span class="text-xs font-extrabold text-amber-400">${countI}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-[9px] text-slate-400 font-bold">Alpa</span>
                        <span class="text-xs font-extrabold text-rose-400">${countA}</span>
                    </div>
                </div>
            </div>
            ` : ''}

            ${isEditable && filteredSiswa.length > 0 ? `
            <!-- Panel Tombol Presensi Massal Cepat -->
            <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presensi Massal Cepat:</span>
                <div class="grid grid-cols-4 gap-1.5">
                    <button type="button" onclick="setAllAbsensiStatus('H')" class="py-2 px-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold transition flex flex-col items-center gap-1 border border-emerald-100">
                        <i class="fas fa-check-circle text-xs"></i> Hadir Semua
                    </button>
                    <button type="button" onclick="setAllAbsensiStatus('S')" class="py-2 px-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold transition flex flex-col items-center gap-1 border border-blue-100">
                        <i class="fas fa-notes-medical text-xs"></i> Sakit Semua
                    </button>
                    <button type="button" onclick="setAllAbsensiStatus('I')" class="py-2 px-1 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold transition flex flex-col items-center gap-1 border border-amber-100">
                        <i class="fas fa-envelope text-xs"></i> Izin Semua
                    </button>
                    <button type="button" onclick="setAllAbsensiStatus('A')" class="py-2 px-1 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition flex flex-col items-center gap-1 border border-rose-100">
                        <i class="fas fa-times-circle text-xs"></i> Alpa Semua
                    </button>
                </div>
            </div>
            ` : ''}

            ${filteredSiswa.length === 0 ? `
                <div class="empty-state"><i class="fas fa-user-slash text-xl mb-1"></i><p class="text-xs">Tidak ada siswa di kelas ini.</p></div>
            ` : `
                <form onsubmit="saveBatchAbsensiForm(event)" class="space-y-2">
                    ${filteredSiswa.map(s => {
                        const rec = appState.absensi.find(a => String(a.siswa_id) === String(s.id)) || { status: 'H', waktu_masuk: '' };
                        const currentStatus = rec.status || 'H';
                        return `
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
                                    <span class="text-[10px] text-slate-400">
                                        <i class="far fa-clock mr-1"></i>${rec.waktu_masuk ? formatDisplayTime(rec.waktu_masuk) : 'Belum Absen'}
                                    </span>
                                </div>
                                <div>
                                    <select data-siswa-id="${s.id}" class="absensi-select-item bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none text-slate-700" ${!isEditable ? 'disabled' : ''}>
                                        <option value="H" ${currentStatus === 'H' ? 'selected' : ''}>Hadir (H)</option>
                                        <option value="I" ${currentStatus === 'I' ? 'selected' : ''}>Izin (I)</option>
                                        <option value="S" ${currentStatus === 'S' ? 'selected' : ''}>Sakit (S)</option>
                                        <option value="A" ${currentStatus === 'A' ? 'selected' : ''}>Alpa (A)</option>
                                        <option value="T" ${currentStatus === 'T' ? 'selected' : ''}>Tanpa Keterangan (T)</option>
                                    </select>
                                </div>
                            </div>
                        `;
                    }).join('')}

                    ${isEditable ? `
                    <div class="pt-2">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2">
                            <i class="fas fa-save"></i> Simpan Semua Presensi (${filteredSiswa.length} Siswa)
                        </button>
                    </div>` : ''}
                </form>
            `}
        </div>
    `;
}

async function saveBatchAbsensiForm(e) {
    e.preventDefault();
    const selectItems = document.querySelectorAll(".absensi-select-item");
    if (selectItems.length === 0) return;

    const confirm = await Swal.fire({
        title: 'Konfirmasi Presensi',
        html: `Apakah Anda yakin ingin menyimpan presensi untuk <b>${selectItems.length} siswa</b>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Simpan Semua',
        cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    const tanggal = document.getElementById("absensi-date").value;
    const jamWITA = getTimeWITA24();
    const items = [];

    selectItems.forEach(select => {
        const siswa_id = select.getAttribute("data-siswa-id");
        const status = select.value;

        items.push({ siswa_id, status, waktu_masuk: jamWITA });

        const existingIndex = appState.absensi.findIndex(a => String(a.siswa_id) === String(siswa_id) && String(a.tanggal) === String(tanggal));
        if (existingIndex !== -1) {
            appState.absensi[existingIndex].status = status;
            appState.absensi[existingIndex].waktu_masuk = jamWITA;
        } else {
            appState.absensi.push({ siswa_id, tanggal, status, waktu_masuk: jamWITA });
        }
    });

    renderAbsensiView();
    const res = await apiCall("saveAbsensi", { tanggal, items }, true);
    if (res && res.status === "success") {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Semua data presensi berhasil disimpan.', timer: 1500, showConfirmButton: false });
    }
}

/**
 * Mengubah seluruh pilihan status presensi siswa secara massal di layar
 * @param {string} status - Kode status ('H', 'S', 'I', 'A', 'T')
 */
function setAllAbsensiStatus(status) {
    const selects = document.querySelectorAll(".absensi-select-item");
    if (selects.length === 0) return;

    selects.forEach(select => {
        select.value = status;
    });

    const statusMap = {
        'H': 'Hadir',
        'S': 'Sakit',
        'I': 'Izin',
        'A': 'Alpa',
        'T': 'Tanpa Keterangan'
    };

    const label = statusMap[status] || status;

    // Toast notifikasi ringan saat aksi massal diterapkan
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Status seluruh siswa (${selects.length}) diubah ke: ${label}`,
        showConfirmButton: false,
        timer: 1500
    });
}

// ==================================================================
// 7. KEBIASAAN MODULE (DEBOUNCE ENGINE)
// ==================================================================
async function loadKebiasaanData(forceRefresh = false) {
    const dateInput = document.getElementById("kebiasaan-date");
    const tanggal = dateInput ? (dateInput.value || getDateWITA()) : getDateWITA();
    if (dateInput) dateInput.value = tanggal;

    const selectSiswa = document.getElementById("kebiasaan-siswa-select");
    if (selectSiswa && appState.siswa.length > 0 && selectSiswa.options.length === 0) {
        selectSiswa.innerHTML = appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    }

    if (!forceRefresh && appState.kebiasaan.length > 0) {
        renderKebiasaanView();
        return;
    }

    renderSkeleton("kebiasaan-list-container", 4);
    const res = await apiCall("getKebiasaan", { tanggal }, false);

    if (res && res.data) appState.kebiasaan = res.data;
    renderKebiasaanView();
}

function renderKebiasaanView() {
    const container = document.getElementById("kebiasaan-list-container");
    const selectSiswa = document.getElementById("kebiasaan-siswa-select");
    if (!container || !selectSiswa) return;

    const selectedSiswaId = selectSiswa.value || (appState.siswa[0] ? appState.siswa[0].id : null);
    if (!selectedSiswaId) return;

    const isEditable = appState.user.role === 'admin' || appState.user.role === 'guru' || (appState.user.role === 'siswa' && String(appState.user.id) === String(selectedSiswaId));

    container.innerHTML = MASTER_KEBIASAAN.map(k => {
        const rec = appState.kebiasaan.find(item => String(item.siswa_id) === String(selectedSiswaId) && String(item.kebiasaan_id) === String(k.id)) || { status: 'Belum' };
        
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl ${k.color} flex items-center justify-center text-lg">
                        <i class="fas ${k.icon}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(k.nama)}</h4>
                        <span class="text-[9px] font-bold uppercase ${rec.status === 'Sudah' ? 'text-emerald-600' : (rec.status === 'Kadang' ? 'text-amber-600' : 'text-slate-400')}">${rec.status}</span>
                    </div>
                </div>
                <div class="flex gap-1">
                    ${[
                        { val: 'Sudah', label: 'Sudah', cls: 'bg-emerald-600 text-white' },
                        { val: 'Kadang', label: 'Kadang', cls: 'bg-amber-500 text-white' },
                        { val: 'Belum', label: 'Belum', cls: 'bg-slate-700 text-white' }
                    ].map(st => `
                        <button ${isEditable ? `onclick="saveKebiasaanItem('${escapeHtml(selectedSiswaId)}', '${k.id}', '${st.val}')"` : 'disabled'}
                                class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${rec.status === st.val ? st.cls : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} transition">
                            ${st.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }).join("");
}

function saveKebiasaanItem(siswa_id, kebiasaan_id, status) {
    const tanggalInput = document.getElementById("kebiasaan-date");
    const tanggal = tanggalInput ? tanggalInput.value : getDateWITA();

    const existingIndex = appState.kebiasaan.findIndex(k => 
        String(k.siswa_id) === String(siswa_id) && 
        String(k.tanggal) === String(tanggal) && 
        String(k.kebiasaan_id) === String(kebiasaan_id)
    );

    if (existingIndex !== -1) {
        appState.kebiasaan[existingIndex].status = status;
    } else {
        appState.kebiasaan.push({ siswa_id, tanggal, kebiasaan_id, status });
    }

    renderKebiasaanView();

    const queueKey = `${siswa_id}_${kebiasaan_id}_${tanggal}`;
    pendingKebiasaanQueue.set(queueKey, { tanggal, siswa_id, kebiasaan_id, status });

    updateKebiasaanSaveStatus('saving');

    if (kebiasaanDebounceTimer) clearTimeout(kebiasaanDebounceTimer);

    kebiasaanDebounceTimer = setTimeout(async () => {
        await flushKebiasaanQueue();
    }, 1500);
}

async function flushKebiasaanQueue() {
    if (pendingKebiasaanQueue.size === 0) return;

    const itemsToSave = Array.from(pendingKebiasaanQueue.values());
    pendingKebiasaanQueue.clear();

    for (const item of itemsToSave) {
        await apiCall("saveKebiasaan", item, false);
    }

    updateKebiasaanSaveStatus('saved');
}

function updateKebiasaanSaveStatus(state) {
    const badge = document.getElementById("kebiasaan-save-status");
    if (!badge) return;

    if (state === 'saving') {
        badge.className = "text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 shadow-sm";
        badge.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-600"></i> Menyimpan...`;
    } else if (state === 'saved') {
        badge.className = "text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 shadow-sm";
        badge.innerHTML = `<i class="fas fa-check-circle text-emerald-600"></i> Tersimpan`;

        setTimeout(() => {
            if (pendingKebiasaanQueue.size === 0) {
                badge.classList.add("hidden");
            }
        }, 3000);
    }
}

// ==================================================================
// 8. KEAGAMAAN / HAFALAN MODULE
// ==================================================================
async function loadKeagamaanData(forceRefresh = false) {
    const filterSelect = document.getElementById("karakter-siswa-filter");
    if (filterSelect && appState.siswa.length > 0 && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    }

    const selectedSiswaId = filterSelect ? filterSelect.value : null;

    if (!forceRefresh && appState.keagamaan.length > 0) {
        renderKeagamaanView();
        return;
    }

    renderSkeleton("keagamaan-container", 3);
    const res = await apiCall("getKeagamaan", { siswa_id: selectedSiswaId }, false);

    if (res && res.data) appState.keagamaan = res.data;
    renderKeagamaanView();
}

function renderKeagamaanView() {
    const container = document.getElementById("keagamaan-container");
    if (!container) return;

    if (!appState.keagamaan || appState.keagamaan.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-quran text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Belum ada catatan hafalan Al-Qur'an.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user.role === 'admin' || appState.user.role === 'guru';

    container.innerHTML = appState.keagamaan.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const statusBadge = item.status === 'Lancar' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (item.status === 'Mengulang' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200');

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-book-open"></i></div>
                        <div>
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama_surat)}</h4>
                            <p class="text-[10px] text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} • ${escapeHtml(item.tanggal)}</p>
                        </div>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-md border ${statusBadge}">${escapeHtml(item.status)}</span>
                </div>
                ${item.catatan ? `<p class="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 italic">"${escapeHtml(item.catatan)}"</p>` : ''}
                ${isAdminOrGuru ? `
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
                    <button onclick="openModalKeagamaan('${escapeHtml(item.id)}')" class="text-[10px] font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteKeagamaan('${escapeHtml(item.id)}')" class="text-[10px] font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>
        `;
    }).join("");
}

function openModalKeagamaan(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const record = id ? appState.keagamaan.find(x => String(x.id) === String(id)) : null;
    const siswaOptions = appState.siswa.map(s => `<option value="${s.id}" ${record && String(record.siswa_id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");
    const surahOptions = MASTER_SURAHS.map(s => `<option value="${s.nama}" ${record && record.nama_surat === s.nama ? 'selected' : ''}>${s.no}. Surah ${s.nama} (Juz ${s.juz})</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-quran text-emerald-600 mr-1.5"></i>${record ? 'Edit Catatan Hafalan' : 'Catat Hafalan Surah'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveKeagamaanForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-kag-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOptions}</select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">SURAH AL-QUR'AN</label>
                <select id="m-kag-surah" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${surahOptions}</select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-kag-tanggal" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" value="${record ? record.tanggal : getDateWITA()}" required>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">STATUS</label>
                    <select id="m-kag-status" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        <option value="Lancar" ${record && record.status === 'Lancar' ? 'selected' : ''}>Lancar</option>
                        <option value="Mengulang" ${record && record.status === 'Mengulang' ? 'selected' : ''}>Mengulang</option>
                        <option value="Belum Mulai" ${record && record.status === 'Belum Mulai' ? 'selected' : ''}>Belum Mulai</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">CATATAN GURU</label>
                <textarea id="m-kag-catatan" rows="2" placeholder="Catatan kelancaran / tajwid..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">${record ? escapeHtml(record.catatan || '') : ''}</textarea>
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Hafalan</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveKeagamaanForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-kag-siswa").value,
        nama_surat: document.getElementById("m-kag-surah").value,
        tanggal: document.getElementById("m-kag-tanggal").value,
        status: document.getElementById("m-kag-status").value,
        catatan: document.getElementById("m-kag-catatan").value
    };

    const res = await apiCall("saveKeagamaan", payload, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await loadKeagamaanData(true);
    }
}

async function deleteKeagamaan(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Hafalan?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteKeagamaan", { id }, true);
        if (res && res.status === "success") await loadKeagamaanData(true);
    }
}

// ==================================================================
// 9. AKADEMIK & PRESTASI MODULE
// ==================================================================
function switchAkademikTab(tab) {
    document.querySelectorAll(".akd-tab-content").forEach(c => c.classList.add("hidden"));
    document.querySelectorAll(".akd-tab-btn").forEach(b => {
        b.classList.remove("bg-white", "text-primary", "shadow-sm", "bg-surface");
        b.classList.add("text-slate-600");
    });

    const target = document.getElementById(`akd-tab-${tab}`);
    const targetBtn = document.getElementById(`btn-akd-tab-${tab}`);

    if (target) target.classList.remove("hidden");
    if (targetBtn) {
        targetBtn.classList.add("bg-white", "text-primary", "shadow-sm");
        targetBtn.classList.remove("text-slate-600");
    }

    if (tab === "nilai") renderAkademikNilai();
    if (tab === "prestasi") renderAkademikPrestasi();
}

async function loadAkademikData(forceRefresh = false) {
    const filterSelect = document.getElementById("akademik-siswa-filter");
    if (filterSelect && appState.siswa.length > 0 && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    }

    const selectedSiswaId = filterSelect ? filterSelect.value : null;

    if (!forceRefresh && appState.akademik.length > 0 && appState.prestasi.length > 0) {
        switchAkademikTab('nilai');
        return;
    }

    renderSkeleton("akademik-list-container", 3);
    renderSkeleton("prestasi-list-container", 3);

    const [resAkd, resPrs] = await Promise.all([
        apiCall("getAkademik", { siswa_id: selectedSiswaId }, false),
        apiCall("getPrestasi", { siswa_id: selectedSiswaId }, false)
    ]);

    if (resAkd && resAkd.data) appState.akademik = resAkd.data;
    if (resPrs && resPrs.data) appState.prestasi = resPrs.data;

    switchAkademikTab('nilai');
}

function renderAkademikNilai() {
    const container = document.getElementById("akademik-list-container");
    if (!container) return;

    if (!appState.akademik || appState.akademik.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-graduation-cap text-2xl mb-2 text-indigo-500"></i><p class="text-xs text-slate-500">Belum ada data nilai mata pelajaran.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user.role === 'admin' || appState.user.role === 'guru';

    container.innerHTML = appState.akademik.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const isBelowKKTP = Number(item.nilai_akhir) < Number(item.kktp);
        const badgeColor = isBelowKKTP ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.mapel)}</h4>
                    <p class="text-[10px] text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} | KKTP: ${item.kktp}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-black px-2.5 py-1 rounded-xl border ${badgeColor}">
                        ${item.nilai_akhir} ${isBelowKKTP ? '⚠️' : '✅'}
                    </span>
                    ${isAdminOrGuru ? `
                    <div class="flex gap-1">
                        <button onclick="openModalAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function renderAkademikPrestasi() {
    const container = document.getElementById("prestasi-list-container");
    if (!container) return;

    if (!appState.prestasi || appState.prestasi.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-trophy text-2xl mb-2 text-amber-500"></i><p class="text-xs text-slate-500">Belum ada data catatan prestasi.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user.role === 'admin' || appState.user.role === 'guru';

    container.innerHTML = appState.prestasi.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold"><i class="fas fa-award"></i></div>
                        <div>
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama_prestasi)}</h4>
                            <p class="text-[10px] text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} • ${escapeHtml(item.tanggal)}</p>
                        </div>
                    </div>
                    <span class="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">${escapeHtml(item.tingkat)}</span>
                </div>
                ${isAdminOrGuru ? `
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
                    <button onclick="openModalPrestasi('${escapeHtml(item.id)}')" class="text-[10px] font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deletePrestasi('${escapeHtml(item.id)}')" class="text-[10px] font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>
        `;
    }).join("");
}

function openModalAkademik(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const rec = id ? appState.akademik.find(x => String(x.id) === String(id)) : null;
    const siswaOpts = appState.siswa.map(s => `<option value="${s.id}" ${rec && String(rec.siswa_id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Nilai Akademik' : 'Input Nilai Mata Pelajaran'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveAkademikForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-akd-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">MATA PELAJARAN</label>
                <input type="text" id="m-akd-mapel" value="${escapeHtml(rec?.mapel || '')}" placeholder="Contoh: Matematika" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">NILAI AKHIR</label>
                    <input type="number" id="m-akd-nilai" value="${rec?.nilai_akhir || ''}" placeholder="0 - 100" min="0" max="100" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">KKTP (STANDAR)</label>
                    <input type="number" id="m-akd-kktp" value="${rec?.kktp || '75'}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Nilai</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveAkademikForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-akd-siswa").value,
        mapel: document.getElementById("m-akd-mapel").value,
        nilai_akhir: document.getElementById("m-akd-nilai").value,
        kktp: document.getElementById("m-akd-kktp").value
    };

    const res = await apiCall("saveAkademik", payload, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await loadAkademikData(true);
    }
}

async function deleteAkademik(id) {
    const confirm = await Swal.fire({ title: 'Hapus Nilai Mapel?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteAkademik", { id }, true);
        if (res && res.status === "success") await loadAkademikData(true);
    }
}

function openModalPrestasi(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const rec = id ? appState.prestasi.find(x => String(x.id) === String(id)) : null;
    const siswaOpts = appState.siswa.map(s => `<option value="${s.id}" ${rec && String(rec.siswa_id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Prestasi Siswa' : 'Catat Prestasi Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePrestasiForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-prs-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NAMA PRESTASI / JUARA</label>
                <input type="text" id="m-prs-nama" value="${escapeHtml(rec?.nama_prestasi || '')}" placeholder="Contoh: Juara 1 OSN IPA" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">TINGKAT</label>
                    <select id="m-prs-tingkat" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional'].map(t => `<option value="${t}" ${rec && rec.tingkat === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-prs-tanggal" value="${rec ? rec.tanggal : getDateWITA()}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <button type="submit" class="w-full bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Prestasi</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function savePrestasiForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-prs-siswa").value,
        nama_prestasi: document.getElementById("m-prs-nama").value,
        tingkat: document.getElementById("m-prs-tingkat").value,
        tanggal: document.getElementById("m-prs-tanggal").value
    };

    const res = await apiCall("savePrestasi", payload, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await loadAkademikData(true);
    }
}

async function deletePrestasi(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Prestasi?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deletePrestasi", { id }, true);
        if (res && res.status === "success") await loadAkademikData(true);
    }
}

// ==================================================================
// 10. PEMBINAAN SISWA MODULE (AUTO-DRAFT SUPPORT)
// ==================================================================
function getPembinaanStatusBadge(status) {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'pemantauan') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (s === 'dalam pembinaan') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'perlu tindak lanjut') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s === 'selesai') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
}

async function loadPembinaanData(forceRefresh = false) {
    const filterSelect = document.getElementById("pembinaan-siswa-filter");
    if (filterSelect && appState.siswa.length > 0 && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    }

    const selectedSiswaId = filterSelect ? filterSelect.value : null;

    if (!forceRefresh && appState.pembinaan.length > 0) {
        renderPembinaanView();
        return;
    }

    renderSkeleton("pembinaan-list-container", 3);
    const res = await apiCall("getPembinaan", { siswa_id: selectedSiswaId }, false);

    if (res && res.data) appState.pembinaan = res.data;
    renderPembinaanView();
}

function renderPembinaanView() {
    const container = document.getElementById("pembinaan-list-container");
    if (!container) return;

    if (!appState.pembinaan || appState.pembinaan.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-check text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Tidak ada catatan pembinaan aktif.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user.role === 'admin' || appState.user.role === 'guru';

    container.innerHTML = appState.pembinaan.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const statusBadge = getPembinaanStatusBadge(item.status);

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(item.jenis || 'Pembinaan')}</span>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.permasalahan)}</h4>
                        <p class="text-[10px] text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} • Tanggal: ${escapeHtml(item.tanggal)}</p>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-md border ${statusBadge}">${escapeHtml(item.status)}</span>
                </div>
                ${item.jadwal_pantau ? `
                <div class="text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5 text-slate-600 font-medium">
                    <i class="fas fa-clock text-amber-500"></i> Jadwal Pantau: <span class="font-bold text-amber-700">${escapeHtml(item.jadwal_pantau)}</span>
                </div>` : ''}
                ${isAdminOrGuru ? `
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
                    <button onclick="openModalPembinaan('${escapeHtml(item.id)}')" class="text-[10px] font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deletePembinaan('${escapeHtml(item.id)}')" class="text-[10px] font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>
        `;
    }).join("");
}

function openModalPembinaan(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const rec = id ? appState.pembinaan.find(x => String(x.id) === String(id)) : null;

    // Cek apakah ada draf tersimpan untuk input baru
    const draft = !id ? getFormDraft("pembinaan") : null;

    const siswaOpts = appState.siswa.map(s => 
        `<option value="${s.id}" ${(draft?.['m-pbn-siswa'] || rec?.siswa_id) == s.id ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`
    ).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Catatan Pembinaan' : 'Tambah Catatan Pembinaan'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePembinaanForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-pbn-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">JENIS</label>
                    <select id="m-pbn-jenis" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${['Sikap', 'Akademik', 'Kehadiran', 'Sosial'].map(j => `<option value="${j}" ${(draft?.['m-pbn-jenis'] || rec?.jenis) === j ? 'selected' : ''}>${j}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">STATUS</label>
                    <select id="m-pbn-status" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${['Pemantauan', 'Dalam Pembinaan', 'Perlu Tindak Lanjut', 'Selesai'].map(st => `<option value="${st}" ${String(draft?.['m-pbn-status'] || rec?.status).toLowerCase() === st.toLowerCase() ? 'selected' : ''}>${st}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">DESKRIPSI PERMASALAHAN / CATATAN</label>
                <textarea id="m-pbn-masalah" rows="3" placeholder="Jelaskan kasus..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${escapeHtml(draft?.['m-pbn-masalah'] || rec?.permasalahan || '')}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-pbn-tanggal" value="${draft?.['m-pbn-tanggal'] || rec?.tanggal || getDateWITA()}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-500 mb-1">JADWAL PANTAU</label>
                    <input type="date" id="m-pbn-pantau" value="${draft?.['m-pbn-pantau'] || rec?.jadwal_pantau || ''}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <button type="submit" class="w-full bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Catatan Pembinaan</button>
        </form>
    `;

    document.getElementById("modal-container")?.classList.remove("hidden");

    if (!id) {
        const fields = ['m-pbn-siswa', 'm-pbn-jenis', 'm-pbn-status', 'm-pbn-masalah', 'm-pbn-tanggal', 'm-pbn-pantau'];
        attachAutoSaveDraft("pembinaan", fields);
        if (draft) showDraftIndicator(true);
    }
}

async function savePembinaanForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-pbn-siswa").value,
        jenis: document.getElementById("m-pbn-jenis").value,
        status: document.getElementById("m-pbn-status").value,
        permasalahan: document.getElementById("m-pbn-masalah").value,
        tanggal: document.getElementById("m-pbn-tanggal").value,
        jadwal_pantau: document.getElementById("m-pbn-pantau").value
    };

    const res = await apiCall("savePembinaan", payload, true);
    if (res && res.status === "success") {
        clearFormDraft("pembinaan");
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await loadPembinaanData(true);
    }
}

async function deletePembinaan(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Pembinaan?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deletePembinaan", { id }, true);
        if (res && res.status === "success") await loadPembinaanData(true);
    }
}

// ==================================================================
// 11. PROFIL SISWA 360° & PRINT MODULE
// ==================================================================
function switchTabSiswa(tabName, btnEl) {
    document.querySelectorAll('.prof-tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-b-2', 'border-blue-600', 'text-blue-600', 'font-bold');
        btn.classList.add('text-slate-500');
    });
    document.querySelectorAll('.prof-tab-content').forEach(content => content.classList.add('hidden'));

    btnEl.classList.add('active', 'border-b-2', 'border-blue-600', 'text-blue-600', 'font-bold');
    btnEl.classList.remove('text-slate-500');

    const target = document.getElementById(`tab-siswa-${tabName}`);
    if (target) target.classList.remove('hidden');
}

async function openProfilSiswa(siswaId) {
    showLoading("Memuat profil lengkap...");
    const res = await apiCall("getDetailSiswa", { siswa_id: siswaId }, false);
    hideLoading();

    if (!res || res.status !== "success") return;

    appState.activeSiswaDetail = res.data;
    const { siswa, absensi, kebiasaan, hafalan, akademik, prestasi, pembinaan } = res.data;
    const kls = appState.kelas.find(k => String(k.id) === String(siswa.kelas_id));

    const container = document.getElementById("profil-siswa-details");
    if (!container) return;

    const totalHadir = absensi.filter(a => a.status === 'H').length;
    const totalSakit = absensi.filter(a => a.status === 'S').length;
    const totalIzin = absensi.filter(a => a.status === 'I').length;
    const totalAlpa = absensi.filter(a => a.status === 'A').length;

    container.innerHTML = `
        <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <img src="${escapeHtml(siswa.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(siswa.nama))}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200">
            <div>
                <h3 class="font-bold text-base text-slate-800">${escapeHtml(siswa.nama)}</h3>
                <p class="text-xs text-slate-400">NISN: ${escapeHtml(siswa.nisn || '-')} • Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                <p class="text-xs text-slate-400">Ortu/Wali: ${escapeHtml(siswa.no_hp_ortu || '-')}</p>
            </div>
        </div>

        <div class="flex flex-nowrap border-b border-slate-200 bg-white px-2 rounded-t-2xl shadow-sm pt-2 overflow-x-auto no-scrollbar">
            <button class="prof-tab-btn active border-b-2 border-blue-600 text-blue-600 font-bold flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('ringkasan', this)">Ringkasan</button>
            <button class="prof-tab-btn text-slate-500 flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('keagamaan', this)">Keagamaan</button>
            <button class="prof-tab-btn text-slate-500 flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('akademik', this)">Akademik</button>
            <button class="prof-tab-btn text-slate-500 flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('catatan', this)">Catatan</button>
        </div>

        <div class="space-y-4 pt-2">
            <div id="tab-siswa-ringkasan" class="prof-tab-content space-y-4">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-calendar-alt text-blue-500 mr-1.5"></i>Rekapitulasi Kehadiran</h4>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                            <span class="text-[9px] font-bold text-emerald-600 block">HADIR</span>
                            <span class="text-base font-black text-emerald-700">${totalHadir}</span>
                        </div>
                        <div class="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                            <span class="text-[9px] font-bold text-blue-600 block">SAKIT</span>
                            <span class="text-base font-black text-blue-700">${totalSakit}</span>
                        </div>
                        <div class="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                            <span class="text-[9px] font-bold text-amber-600 block">IZIN</span>
                            <span class="text-base font-black text-amber-700">${totalIzin}</span>
                        </div>
                        <div class="bg-rose-50 p-2.5 rounded-2xl border border-rose-100">
                            <span class="text-[9px] font-bold text-rose-600 block">ALPA</span>
                            <span class="text-base font-black text-rose-700">${totalAlpa}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-star text-amber-500 mr-1.5"></i>7 Kebiasaan Hebat</h4>
                    <div class="divide-y divide-slate-100">
                        ${MASTER_KEBIASAAN.map(k => {
                            const rec = kebiasaan.find(item => String(item.kebiasaan_id) === String(k.id)) || { status: 'Belum' };
                            return `
                                <div class="py-2 flex justify-between items-center text-xs">
                                    <span class="font-medium text-slate-700 flex items-center gap-2"><i class="fas ${k.icon} text-slate-400"></i> ${escapeHtml(k.nama)}</span>
                                    <span class="font-bold ${rec.status === 'Sudah' ? 'text-emerald-600' : (rec.status === 'Kadang' ? 'text-amber-600' : 'text-slate-400')}">${rec.status}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div id="tab-siswa-keagamaan" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-quran text-emerald-500 mr-1.5"></i>Capaian Hafalan Al-Qur'an</h4>
                    ${hafalan.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada data hafalan.</p>' : `
                        <div class="space-y-2">
                            ${hafalan.map(h => `
                                <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                                    <div class="flex justify-between font-bold text-slate-800">
                                        <span>Surah ${escapeHtml(h.nama_surat)}</span>
                                        <span class="text-emerald-600">${escapeHtml(h.status)}</span>
                                    </div>
                                    ${h.catatan ? `<p class="text-[10px] text-slate-500 italic font-medium">"${escapeHtml(h.catatan)}"</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>

            <div id="tab-siswa-akademik" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-graduation-cap text-indigo-500 mr-1.5"></i>Nilai Mata Pelajaran & KKTP</h4>
                    ${akademik.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada data nilai akademik.</p>' : `
                        <div class="divide-y divide-slate-100">
                            ${akademik.map(a => `
                                <div class="py-2 flex justify-between items-center text-xs">
                                    <span class="font-medium text-slate-700">${escapeHtml(a.mapel)}</span>
                                    <span class="font-bold ${Number(a.nilai_akhir) < Number(a.kktp) ? 'text-rose-600' : 'text-emerald-600'}">${a.nilai_akhir} (KKTP: ${a.kktp})</span>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-trophy text-amber-500 mr-1.5"></i>Catatan Prestasi</h4>
                    ${prestasi.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada catatan prestasi.</p>' : `
                        <div class="space-y-2">
                            ${prestasi.map(p => `
                                <div class="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between items-center">
                                    <div>
                                        <h5 class="font-bold text-slate-800">${escapeHtml(p.nama_prestasi)}</h5>
                                        <p class="text-[10px] text-slate-400">${escapeHtml(p.tingkat)} • ${escapeHtml(p.tanggal)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>

            <div id="tab-siswa-catatan" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-user-edit text-rose-500 mr-1.5"></i>Catatan Pembinaan</h4>
                    ${pembinaan.length === 0 ? '<p class="text-xs text-slate-400 italic">Tidak ada catatan pembinaan.</p>' : `
                        <div class="space-y-2">
                            ${pembinaan.map(p => `
                                <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                                    <div class="flex justify-between font-bold text-slate-800">
                                        <span>${escapeHtml(p.permasalahan)}</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${getPembinaanStatusBadge(p.status)}">${escapeHtml(p.status)}</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400">Tanggal: ${escapeHtml(p.tanggal)}</p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    switchView("profil-siswa");
}

function printProfilSiswa() {
    if (!appState.activeSiswaDetail) return;
    const { siswa, absensi, akademik, hafalan } = appState.activeSiswaDetail;
    const kls = appState.kelas.find(k => String(k.id) === String(siswa.kelas_id));

    const printArea = document.getElementById("printable-area");
    if (!printArea) return;

    printArea.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">LAPORAN PEMANTAUAN ANAK WALI</h2>
                <h3 style="margin: 5px 0 0 0; font-size: 16px;">SMP NEGERI 1 TALAGA JAYA</h3>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #555;">Tahun Ajaran 2025/2026</p>
            </div>

            <table style="width: 100%; font-size: 12px; margin-bottom: 20px;">
                <tr><td style="width: 120px; font-weight: bold;">Nama Siswa</td><td>: ${escapeHtml(siswa.nama)}</td></tr>
                <tr><td style="font-weight: bold;">NISN</td><td>: ${escapeHtml(siswa.nisn || '-')}</td></tr>
                <tr><td style="font-weight: bold;">Kelas</td><td>: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</td></tr>
                <tr><td style="font-weight: bold;">Orang Tua / Wali</td><td>: ${escapeHtml(siswa.no_hp_ortu || '-')}</td></tr>
            </table>

            <h4 style="font-size: 14px; margin-bottom: 5px;">1. Rekapitulasi Presensi</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;" border="1">
                <thead><tr style="background: #f0f0f0;"><th style="padding: 6px;">Hadir</th><th style="padding: 6px;">Sakit</th><th style="padding: 6px;">Izin</th><th style="padding: 6px;">Alpa</th></tr></thead>
                <tbody>
                    <tr style="text-align: center;">
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'H').length} hari</td>
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'S').length} hari</td>
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'I').length} hari</td>
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'A').length} hari</td>
                    </tr>
                </tbody>
            </table>

            <h4 style="font-size: 14px; margin-bottom: 5px;">2. Hasil Belajar Akademik</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;" border="1">
                <thead><tr style="background: #f0f0f0;"><th style="padding: 6px;">Mata Pelajaran</th><th style="padding: 6px;">Nilai Akhir</th><th style="padding: 6px;">KKTP</th><th style="padding: 6px;">Keterangan</th></tr></thead>
                <tbody>
                    ${akademik.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 6px;">Belum ada data nilai</td></tr>' : akademik.map(a => `
                        <tr>
                            <td style="padding: 6px;">${escapeHtml(a.mapel)}</td>
                            <td style="padding: 6px; text-align: center;">${a.nilai_akhir}</td>
                            <td style="padding: 6px; text-align: center;">${a.kktp}</td>
                            <td style="padding: 6px; text-align: center;">${Number(a.nilai_akhir) >= Number(a.kktp) ? 'Tuntas' : 'Perlu Bimbingan'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h4 style="font-size: 14px; margin-bottom: 5px;">3. Hafalan Al-Qur'an</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;" border="1">
                <thead><tr style="background: #f0f0f0;"><th style="padding: 6px;">Nama Surah</th><th style="padding: 6px;">Status</th><th style="padding: 6px;">Catatan Guru</th></tr></thead>
                <tbody>
                    ${hafalan.length === 0 ? '<tr><td colspan="3" style="text-align: center; padding: 6px;">Belum ada data hafalan</td></tr>' : hafalan.map(h => `
                        <tr>
                            <td style="padding: 6px;">${escapeHtml(h.nama_surat)}</td>
                            <td style="padding: 6px; text-align: center;">${escapeHtml(h.status)}</td>
                            <td style="padding: 6px;">${escapeHtml(h.catatan || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
                <div style="text-align: center; width: 200px;">
                    <p>Orang Tua / Wali Siswa</p>
                    <br><br><br>
                    <p>( .................................... )</p>
                </div>
                <div style="text-align: center; width: 200px;">
                    <p>Wali Kelas</p>
                    <br><br><br>
                    <p><b>${escapeHtml(appState.user.nama)}</b></p>
                </div>
            </div>
        </div>
    `;

    window.print();
}

function hubungiOrtu(siswaId) {
    const s = appState.siswa.find(x => String(x.id) === String(siswaId)) || appState.user;
    if (!s || !s.no_hp_ortu) {
        Swal.fire({ icon: 'warning', title: 'Nomor Tidak Ada', text: 'Nomor WhatsApp Orang Tua/Wali belum terdaftar.', confirmButtonColor: '#2563eb' });
        return;
    }

    let phone = safeStr(s.no_hp_ortu).replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.substring(1);

    const message = encodeURIComponent(`Assalamu'alaikum Bapak/Ibu Wali dari ${s.nama}. Kami dari pihak SMP Negeri 1 Talaga Jaya ingin menyampaikan informasi perkembangan anak wali.`);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank');
}

// ==================================================================
// 12. LAPORAN REKAP & EXPORT MODULE (PDF ENGINE)
// ==================================================================
async function loadLaporanRekap(forceRefresh = false) {
    if (!forceRefresh && appState.laporanRekap.length > 0) {
        renderLaporanRekapView();
        return;
    }

    renderSkeleton("laporan-rekap-container", 4);
    const res = await apiCall("getLaporanRekap", {}, false);

    if (res && res.data) appState.laporanRekap = res.data;
    renderLaporanRekapView();
}

function renderLaporanRekapView() {
    const container = document.getElementById("laporan-rekap-container");
    if (!container) return;

    if (!appState.laporanRekap || appState.laporanRekap.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-file-invoice text-2xl mb-2 text-purple-500"></i><p class="text-xs text-slate-500">Belum ada data rekapitulasi.</p></div>`;
        return;
    }

    container.innerHTML = appState.laporanRekap.map(item => {
        const kls = appState.kelas.find(k => String(k.id) === String(item.kelas_id));

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama)}</h4>
                    <p class="text-[10px] text-slate-400">NISN: ${escapeHtml(item.nisn || '-')} | Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    <div class="flex gap-2 text-[10px] text-slate-600 mt-1">
                        <span>Hadir: <b>${item.presensi.hadir}</b></span>
                        <span>Sakit: <b>${item.presensi.sakit}</b></span>
                        <span>Izin: <b>${item.presensi.izin}</b></span>
                        <span class="text-rose-600 font-bold">Alpa: ${item.presensi.alpa}</span>
                    </div>
                </div>
                <button onclick="openProfilSiswa('${escapeHtml(item.id)}')" class="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 text-xs">
                    <i class="fas fa-file-alt"></i> Detail
                </button>
            </div>
        `;
    }).join("");
}

function printLaporanRekap() {
    if (!appState.laporanRekap || appState.laporanRekap.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Data Kosong',
            text: 'Tidak ada data rekapitulasi untuk dicetak.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const printArea = document.getElementById("printable-area");
    if (!printArea) return;

    const formattedDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const rowsHtml = appState.laporanRekap.map((item, index) => {
        const kls = appState.kelas.find(k => String(k.id) === String(item.kelas_id));
        const isPerhatian = (item.presensi.alpa >= 3 || item.dibawah_kktp >= 2);
        const statusText = isPerhatian ? 'Perlu Perhatian' : 'Tuntas / Baik';
        const statusColor = isPerhatian ? '#dc2626' : '#16a34a';

        return `
            <tr>
                <td style="padding: 6px 4px; text-align: center;">${index + 1}</td>
                <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.nisn || '-')}</td>
                <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(item.nama)}</td>
                <td style="padding: 6px 4px; text-align: center;">${kls ? escapeHtml(kls.nama_kelas) : '-'}</td>
                <td style="padding: 6px 4px; text-align: center; color: #16a34a; font-weight: bold;">${item.presensi.hadir}</td>
                <td style="padding: 6px 4px; text-align: center;">${item.presensi.sakit}</td>
                <td style="padding: 6px 4px; text-align: center;">${item.presensi.izin}</td>
                <td style="padding: 6px 4px; text-align: center; font-weight: bold; color: ${item.presensi.alpa > 0 ? '#dc2626' : 'inherit'};">${item.presensi.alpa}</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold; color: ${item.dibawah_kktp > 0 ? '#dc2626' : 'inherit'};">${item.dibawah_kktp} Mapel</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold; color: ${statusColor};">${statusText}</td>
            </tr>
        `;
    }).join('');

    printArea.innerHTML = `
        <div style="font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 10px;">
            <div style="text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
                <h4 style="margin: 0; font-size: 13px; font-weight: normal; text-transform: uppercase; letter-spacing: 1px;">Pemerintah Kabupaten Gorontalo</h4>
                <h3 style="margin: 2px 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">Dinas Pendidikan dan Kebudayaan</h3>
                <h2 style="margin: 2px 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">SMP NEGERI 1 TALAGA JAYA</h2>
                <p style="margin: 0; font-size: 11px; font-style: italic; color: #334155;">Jl. Pelabuhan II, Kec. Talaga Jaya, Kab. Gorontalo, Gorontalo 96181</p>
            </div>

            <div style="text-align: center; margin-bottom: 16px;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; text-transform: uppercase; text-decoration: underline; font-weight: bold;">LAPORAN REKAPITULASI PEMANTAUAN ANAK WALI</h3>
                <p style="margin: 0; font-size: 11px; color: #475569;">Tanggal Cetak: ${formattedDate} | Dicetak Oleh: <b>${escapeHtml(appState.user.nama)}</b> (${escapeHtml(appState.user.role.toUpperCase())})</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;" border="1" borderColor="#94a3b8">
                <thead>
                    <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                        <th style="padding: 8px 4px; width: 30px;">No</th>
                        <th style="padding: 8px 6px; width: 90px;">NISN</th>
                        <th style="padding: 8px 6px; text-align: left;">Nama Siswa</th>
                        <th style="padding: 8px 4px; width: 55px;">Kelas</th>
                        <th style="padding: 8px 4px; width: 45px;">Hadir</th>
                        <th style="padding: 8px 4px; width: 45px;">Sakit</th>
                        <th style="padding: 8px 4px; width: 45px;">Izin</th>
                        <th style="padding: 8px 4px; width: 45px;">Alpa</th>
                        <th style="padding: 8px 6px; width: 80px;">< KKTP</th>
                        <th style="padding: 8px 6px; width: 105px;">Evaluasi</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; page-break-inside: avoid;">
                <div style="text-align: center; width: 220px;">
                    <p style="margin-bottom: 60px;">Mengetahui,<br>Kepala SMPN 1 Talaga Jaya</p>
                    <p style="margin: 0; font-weight: bold; text-decoration: underline;">( ............................................ )</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">NIP. ........................................</p>
                </div>
                <div style="text-align: center; width: 220px;">
                    <p style="margin-bottom: 60px;">Talaga Jaya, ${formattedDate}<br>Guru Pemantau / Wali Kelas</p>
                    <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(appState.user.nama)}</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">NIP/ID: ${escapeHtml(appState.user.id)}</p>
                </div>
            </div>
        </div>
    `;

    window.print();
}

function exportRekapCSV() {
    if (!appState.laporanRekap || appState.laporanRekap.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data laporan untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nama Siswa,NISN,Hadir,Sakit,Izin,Alpa,Nilai_Dibawah_KKTP\n";

    appState.laporanRekap.forEach(row => {
        csvContent += `"${row.id}","${row.nama}","${row.nisn}",${row.presensi.hadir},${row.presensi.sakit},${row.presensi.izin},${row.presensi.alpa},${row.dibawah_kktp}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Pemantauan_Anak_Wali_${getDateWITA()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================================================================
// 13. MASTER DATA MANAGEMENT (ADMIN & GURU)
// ==================================================================
function renderSiswaView() {
    const container = document.getElementById("siswa-card-container");
    if (!container) return;

    const searchInput = document.getElementById("search-siswa-input");
    const query = (searchInput ? searchInput.value : "").toLowerCase();
    const filtered = appState.siswa.filter(s => safeStr(s.nama).toLowerCase().includes(query) || safeStr(s.nisn).toLowerCase().includes(query));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-search text-xl mb-1"></i><p class="text-xs">Siswa tidak ditemukan.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user.role === 'admin' || appState.user.role === 'guru';

    container.innerHTML = filtered.map(s => {
        const kls = appState.kelas.find(k => String(k.id) === String(s.kelas_id));
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <img src="${escapeHtml(s.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.nama))}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                    <div>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
                        <p class="text-[10px] text-slate-400">NISN: ${escapeHtml(s.nisn || '-')} | Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="openProfilSiswa('${escapeHtml(s.id)}')" class="touch-btn bg-blue-50 text-blue-600 rounded-lg text-xs">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="hubungiOrtu('${escapeHtml(s.id)}')" class="touch-btn bg-emerald-50 text-emerald-600 rounded-lg text-xs">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    ${isAdminOrGuru ? `
                    <button onclick="openModalSiswa('${escapeHtml(s.id)}')" class="touch-btn bg-slate-100 text-slate-600 rounded-lg text-xs">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSiswa('${escapeHtml(s.id)}')" class="touch-btn bg-rose-50 text-rose-600 rounded-lg text-xs">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function renderAdminManage() { switchAdminTab("guru"); }

function switchAdminTab(tab) {
    document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.add("hidden"));
    document.querySelectorAll(".admin-tab-btn").forEach(b => {
        b.classList.remove("bg-white", "text-primary", "shadow-sm", "bg-surface");
        b.classList.add("text-slate-600");
    });

    const target = document.getElementById(`admin-tab-${tab}`);
    const targetBtn = document.getElementById(`btn-admin-tab-${tab}`);

    if (target) target.classList.remove("hidden");
    if (targetBtn) {
        targetBtn.classList.add("bg-white", "text-primary", "shadow-sm");
        targetBtn.classList.remove("text-slate-600");
    }

    if (tab === "guru") renderAdminGuru();
    if (tab === "siswa") renderAdminSiswa();
    if (tab === "kelas") renderAdminKelas();
}

function renderAdminGuru() {
    const list = document.getElementById("admin-guru-list");
    if (!list) return;

    const query = (document.getElementById("search-guru-input")?.value || "").toLowerCase();
    const filtered = appState.guru.filter(g => safeStr(g.nama).toLowerCase().includes(query) || safeStr(g.username).toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-chalkboard-teacher text-xl mb-1"></i><p class="text-xs">Belum ada Guru.</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(g => `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
                <h4 class="font-bold text-xs text-slate-800">${escapeHtml(g.nama)}</h4>
                <p class="text-[10px] text-slate-400">Username: ${escapeHtml(g.username)} | NIP: ${escapeHtml(g.nip || '-')}</p>
            </div>
            <div class="flex gap-1">
                <button onclick="openModalGuru('${escapeHtml(g.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs"><i class="fas fa-edit"></i></button>
                <button onclick="deleteGuru('${escapeHtml(g.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join("");
}

function renderAdminSiswa() {
    const list = document.getElementById("admin-siswa-list");
    if (!list) return;

    const query = (document.getElementById("search-admin-siswa-input")?.value || "").toLowerCase();
    const filtered = appState.siswa.filter(s => safeStr(s.nama).toLowerCase().includes(query) || safeStr(s.nisn).toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-user-graduate text-xl mb-1"></i><p class="text-xs">Belum ada Siswa.</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(s => `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
                <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
                <p class="text-[10px] text-slate-400">Username: ${escapeHtml(s.username)} | NISN: ${escapeHtml(s.nisn || '-')}</p>
            </div>
            <div class="flex gap-1">
                <button onclick="openModalSiswa('${escapeHtml(s.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSiswa('${escapeHtml(s.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join("");
}

function renderAdminKelas() {
    const list = document.getElementById("admin-kelas-list");
    if (!list) return;

    if (appState.kelas.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-door-open text-xl mb-1"></i><p class="text-xs">Belum ada Kelas.</p></div>`;
        return;
    }

    list.innerHTML = appState.kelas.map(k => {
        const wali = appState.guru.find(g => String(g.id) === String(k.guru_id));
        return `
            <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">Kelas ${escapeHtml(k.nama_kelas)}</h4>
                    <p class="text-[10px] text-slate-400">Wali Kelas: ${wali ? escapeHtml(wali.nama) : 'Belum ditentukan'}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="openModalKelas('${escapeHtml(k.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteKelas('${escapeHtml(k.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join("");
}

function openModalGuru(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const g = id ? appState.guru.find(x => String(x.id) === String(id)) : null;

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${g ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveGuruForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                <input type="text" id="m-guru-nama" value="${escapeHtml(g?.nama || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">USERNAME</label>
                <input type="text" id="m-guru-user" value="${escapeHtml(g?.username || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">PASSWORD ${g ? '(Kosongkan jika tidak diganti)' : ''}</label>
                <input type="password" id="m-guru-pwd" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" ${g ? '' : 'required'}>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NIP</label>
                <input type="text" id="m-guru-nip" value="${escapeHtml(g?.nip || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NO. TELEPON / WA</label>
                <input type="text" id="m-guru-hp" value="${escapeHtml(g?.no_hp || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Guru</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveGuruForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        nama: document.getElementById("m-guru-nama").value,
        username: document.getElementById("m-guru-user").value,
        password: document.getElementById("m-guru-pwd").value,
        nip: document.getElementById("m-guru-nip").value,
        no_hp: document.getElementById("m-guru-hp").value
    };

    const res = await apiCall("saveGuru", payload, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await fetchAllAppData(true);
        renderAdminGuru();
    }
}

async function deleteGuru(id) {
    const confirm = await Swal.fire({ title: 'Hapus Guru?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteGuru", { id }, true);
        if (res && res.status === "success") {
            await fetchAllAppData(true);
            renderAdminGuru();
        }
    }
}

function openModalSiswa(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const s = id ? appState.siswa.find(x => String(x.id) === String(id)) : null;
    const kelasOpts = appState.kelas.map(k => `<option value="${k.id}" ${s?.kelas_id === k.id ? 'selected' : ''}>${escapeHtml(k.nama_kelas)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${s ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveSiswaForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                <input type="text" id="m-ssw-nama" value="${escapeHtml(s?.nama || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">USERNAME</label>
                <input type="text" id="m-ssw-user" value="${escapeHtml(s?.username || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">PASSWORD ${s ? '(Kosongkan jika tidak diganti)' : ''}</label>
                <input type="password" id="m-ssw-pwd" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" ${s ? '' : 'required'}>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NISN</label>
                <input type="text" id="m-ssw-nisn" value="${escapeHtml(s?.nisn || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">KELAS</label>
                <select id="m-ssw-kelas" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                    <option value="">Pilih Kelas</option>
                    ${kelasOpts}
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NO. WA ORANG TUA / WALI</label>
                <input type="text" id="m-ssw-ortu" value="${escapeHtml(s?.no_hp_ortu || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" placeholder="08xxxxxxxxxx">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Siswa</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveSiswaForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        nama: document.getElementById("m-ssw-nama").value,
        username: document.getElementById("m-ssw-user").value,
        password: document.getElementById("m-ssw-pwd").value,
        nisn: document.getElementById("m-ssw-nisn").value,
        kelas_id: document.getElementById("m-ssw-kelas").value,
        no_hp_ortu: document.getElementById("m-ssw-ortu").value
    };

    const res = await apiCall("saveSiswa", payload, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await fetchAllAppData(true);
        renderSiswaView();
        renderAdminSiswa();
    }
}

async function deleteSiswa(id) {
    const confirm = await Swal.fire({ title: 'Hapus Siswa?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteSiswa", { id }, true);
        if (res && res.status === "success") {
            await fetchAllAppData(true);
            renderSiswaView();
            renderAdminSiswa();
        }
    }
}

function openModalKelas(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const k = id ? appState.kelas.find(x => String(x.id) === String(id)) : null;
    const guruOpts = appState.guru.map(g => `<option value="${g.id}" ${k?.guru_id === g.id ? 'selected' : ''}>${escapeHtml(g.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${k ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveKelasForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">NAMA KELAS (Contoh: 7A, 8B)</label>
                <input type="text" id="m-kls-nama" value="${escapeHtml(k?.nama_kelas || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-500 mb-1">WALI KELAS</label>
                <select id="m-kls-guru" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                    <option value="">Pilih Wali Kelas</option>
                    ${guruOpts}
                </select>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Kelas</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveKelasForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        nama_kelas: document.getElementById("m-kls-nama").value,
        guru_id: document.getElementById("m-kls-guru").value
    };

    const res = await apiCall("saveKelas", payload, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        await fetchAllAppData(true);
        renderAdminKelas();
    }
}

async function deleteKelas(id) {
    const confirm = await Swal.fire({ title: 'Hapus Kelas?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteKelas", { id }, true);
        if (res && res.status === "success") {
            await fetchAllAppData(true);
            renderAdminKelas();
        }
    }
}

// ==================================================================
// 14. SETTINGS & APP INITIALIZATION
// ==================================================================
function openUserSettingsModal() {
    const container = document.getElementById("modal-content-box");
    if (!container) return;

    const user = appState.user;

    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-cog text-blue-600 mr-1.5"></i>Pengaturan Akun</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="space-y-4">
            <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <img src="${user.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nama)}" class="w-12 h-12 rounded-full object-cover border border-slate-200">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(user.nama)}</h4>
                    <span class="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">${escapeHtml(user.role)}</span>
                </div>
            </div>
            <form onsubmit="changePasswordForm(event)" class="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h4 class="text-xs font-bold text-slate-700 uppercase">Ganti Kata Sandi</h4>
                <input type="password" id="m-pwd-old" placeholder="Kata sandi lama" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
                <input type="password" id="m-pwd-new" placeholder="Kata sandi baru" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
                <button type="submit" class="w-full bg-slate-800 text-white font-bold py-2 rounded-xl text-xs">Update Kata Sandi</button>
            </form>
            <button onclick="handleLogout()" class="w-full bg-rose-50 text-rose-600 font-bold py-2.5 rounded-xl border border-rose-200 text-xs flex items-center justify-center gap-2">
                <i class="fas fa-sign-out-alt"></i> Keluar
            </button>
        </div>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function changePasswordForm(e) {
    e.preventDefault();
    const oldPassword = document.getElementById("m-pwd-old").value;
    const newPassword = document.getElementById("m-pwd-new").value;
    const res = await apiCall("changePassword", { oldPassword, newPassword }, true);
    if (res && res.status === "success") {
        closeModal();
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kata sandi diperbarui!', timer: 1500, showConfirmButton: false });
    }
}

function closeModal() {
    const modal = document.getElementById("modal-container");
    if (modal) modal.classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", async () => {
    const savedSession = localStorage.getItem("session_anak_wali");
    if (savedSession) {
        try {
            const parsed = JSON.parse(savedSession);
            appState.token = parsed.token;
            appState.user = parsed.user;

            const validRes = await apiCall("validateSession", {}, false);
            if (validRes && validRes.status === "success") {
                appState.user = validRes.user;
                await setupAppSession();
            } else {
                localStorage.removeItem("session_anak_wali");
            }
        } catch (e) {
            localStorage.removeItem("session_anak_wali");
        }
    }
});