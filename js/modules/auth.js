const LOGIN_ROLE_KEY = "login_last_role";
const LOGIN_ROLE_LABEL = { siswa: "Siswa", guru: "Guru", admin: "Admin" };
const LOGIN_FIELD_IDS = ["login-role", "login-username", "login-password"];
let loginInFlight = false;

function showLoginError(message, invalidIds = []) {
    const box = document.getElementById("login-error");
    if (!box) return;
    box.textContent = message;
    LOGIN_FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (invalidIds.includes(id)) el.setAttribute("aria-invalid", "true");
        else el.removeAttribute("aria-invalid");
    });
}

function clearLoginError() {
    const box = document.getElementById("login-error");
    if (box) box.textContent = "";
    LOGIN_FIELD_IDS.forEach(id => document.getElementById(id)?.removeAttribute("aria-invalid"));
}

function setLoginBusy(busy) {
    const btn = document.getElementById("btn-submit-login");
    const label = document.getElementById("btn-login-label");
    if (btn) {
        btn.disabled = busy;
        btn.setAttribute("aria-busy", busy ? "true" : "false");
    }
    if (label) label.textContent = busy ? "Memeriksa…" : "Masuk";
}

function shakeLoginForm() {
    const form = document.getElementById("form-login");
    if (!form) return;
    form.classList.remove("is-shaking");
    void form.offsetWidth;
    form.classList.add("is-shaking");
    form.addEventListener("animationend", () => form.classList.remove("is-shaking"), { once: true });
}

function showPostLoginSplash(text) {
    const el = document.getElementById("post-login-splash");
    const txt = document.getElementById("splash-text");
    const bar = document.getElementById("splash-bar");
    if (txt && text) txt.textContent = text;
    if (bar) bar.style.width = "0%";
    if (el) { el.classList.remove("hidden"); el.classList.add("flex"); }
}

function setSplashProgress(percent, text) {
    const bar = document.getElementById("splash-bar");
    const txt = document.getElementById("splash-text");
    if (bar) bar.style.width = Math.max(0, Math.min(100, percent)) + "%";
    if (txt && text) txt.textContent = text;
}

function hidePostLoginSplash() {
    const el = document.getElementById("post-login-splash");
    if (el) { el.classList.add("hidden"); el.classList.remove("flex"); }
}

function toggleLoginPassword() {
    const input = document.getElementById("login-password");
    const btn = document.getElementById("login-toggle");
    if (!input || !btn) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.classList.toggle("is-shown", show);
    btn.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
}

async function handleAppLogin(e) {
    e.preventDefault();
    if (loginInFlight) return;

    const roleEl = document.getElementById("login-role");
    const usernameEl = document.getElementById("login-username");
    const passwordEl = document.getElementById("login-password");
    const role = roleEl ? roleEl.value : "";
    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    clearLoginError();

    if (!role) {
        showLoginError("Pilih jenis pengguna: Siswa, Guru, atau Admin.", ["login-role"]);
        roleEl?.focus();
        return;
    }
    if (!username) {
        showLoginError("Isi ID atau username.", ["login-username"]);
        usernameEl.focus();
        return;
    }
    if (!password) {
        showLoginError("Isi kata sandi.", ["login-password"]);
        passwordEl.focus();
        return;
    }
    if (!navigator.onLine) {
        showLoginError("Tidak ada koneksi internet. Sambungkan dulu, lalu coba lagi.");
        return;
    }

    loginInFlight = true;
    setLoginBusy(true);

    let res = null;
    try {
        res = await apiCall("login", { role, username, password }, false);
    } catch (err) {
        console.error("Login gagal:", err);
    }

    if (res && res.status === "success") {
        try { localStorage.setItem(LOGIN_ROLE_KEY, role); } catch (_) { }
        appState.token = res.token;
        appState.user = res.user;
        localStorage.setItem("session_anak_wali", JSON.stringify({ token: res.token, user: res.user }));
        showPostLoginSplash("Login Berhasil, Mengalihkan...");
        setSplashProgress(15);
        try {
            await setupAppSession();
        } catch (err) {
            console.error("setupAppSession gagal:", err);
            hidePostLoginSplash();
            loginInFlight = false;
            setLoginBusy(false);
            showLoginError("Berhasil masuk, tetapi aplikasi gagal dimuat. Coba masuk lagi.");
        }
        return;
    }

    loginInFlight = false;
    setLoginBusy(false);

    if (res) {
        showLoginError(
            res.message || `Username atau kata sandi salah. Cek juga jenis pengguna yang dipilih (${LOGIN_ROLE_LABEL[role]}).`,
            ["login-username", "login-password"]
        );
        passwordEl.value = "";
        passwordEl.focus();
        shakeLoginForm();
    } else {
        showLoginError("Tidak bisa terhubung ke server. Periksa internet, lalu coba lagi.");
    }
}

function initLoginForm() {
    const form = document.getElementById("form-login");
    if (!form || form.dataset.ready) return;
    form.dataset.ready = "1";

    let saved = null;
    try { saved = localStorage.getItem(LOGIN_ROLE_KEY); } catch (_) { }
    const roleEl = document.getElementById("login-role");
    if (roleEl && LOGIN_ROLE_LABEL[saved]) roleEl.value = saved;

    const pwd = document.getElementById("login-password");
    const caps = document.getElementById("login-caps");
    const updateCaps = ev => {
        if (caps && typeof ev.getModifierState === "function") caps.hidden = !ev.getModifierState("CapsLock");
    };
    pwd?.addEventListener("keydown", updateCaps);
    pwd?.addEventListener("keyup", updateCaps);
    pwd?.addEventListener("blur", () => { if (caps) caps.hidden = true; });

    LOGIN_FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        el?.addEventListener("input", clearLoginError);
        el?.addEventListener("change", clearLoginError);
    });

    const notice = document.getElementById("login-offline");
    const syncOnline = () => { if (notice) notice.hidden = navigator.onLine; };
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    syncOnline();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginForm);
} else {
    initLoginForm();
}

async function setupAppSession() {
    if (appState.user && appState.user.mustChangePassword) {
        showForcePasswordChangeModal();
        return;
    }
    await continueSessionSetup();
}

function showForcePasswordChangeModal() {
    const box = document.getElementById("modal-content-box");
    const container = document.getElementById("modal-container");
    if (!box || !container) return;

    box.innerHTML = `
        <div class="mb-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i class="fas fa-shield-halved text-amber-500"></i> Wajib Ganti Password
            </h3>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed">Akun Anda masih menggunakan <b>password default</b>. Demi keamanan data siswa, Anda wajib menggantinya terlebih dahulu sebelum melanjutkan.</p>
        </div>
        <form onsubmit="submitForcePasswordChange(event)" class="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
                <label for="force-pwd-old" class="block text-xs font-bold text-slate-500 mb-1">PASSWORD DEFAULT SAAT INI</label>
                <input type="password" id="force-pwd-old" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label for="force-pwd-new" class="block text-xs font-bold text-slate-500 mb-1">PASSWORD BARU (MIN. 6 KARAKTER)</label>
                <input type="password" id="force-pwd-new" minlength="6" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <button type="submit" id="btn-force-pwd" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs">Simpan & Lanjutkan</button>
        </form>
    `;
    container.classList.remove("hidden");
    container.dataset.forceLock = "true";
}

async function submitForcePasswordChange(e) {
    e.preventDefault();
    const oldPassword = document.getElementById("force-pwd-old").value;
    const newPassword = document.getElementById("force-pwd-new").value;

    const btn = document.getElementById("btn-force-pwd");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }

    const res = await apiCall("changePassword", { oldPassword, newPassword }, true);
    if (res && res.status === "success") {
        appState.user.mustChangePassword = false;

        const savedSession = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
        if (savedSession.user) savedSession.user.mustChangePassword = false;
        localStorage.setItem("session_anak_wali", JSON.stringify(savedSession));

        const modal = document.getElementById("modal-container");
        if (modal) {
            modal.dataset.forceLock = "";
            modal.classList.add("hidden");
        }

        showToast("Password berhasil diganti. Selamat datang!");
        await continueSessionSetup();
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-70", "cursor-not-allowed");
            btn.innerHTML = originalHtml;
        }
        Swal.fire({ icon: 'error', title: 'Gagal Mengganti Password', text: res?.message || 'Kata sandi lama kemungkinan salah.', confirmButtonColor: '#2563eb' });
    }
}

async function continueSessionSetup() {
    applyRoleUI(appState.user.role);
    startSilentTokenRefresh();
    setupNetworkStatusListeners();

    const loginView = document.getElementById("view-login");
    const mainHeader = document.getElementById("main-header");
    const mainContent = document.getElementById("main-content");
    const bottomNav = document.getElementById("bottom-nav");

    if (loginView) { loginView.classList.remove("active"); loginView.classList.add("hidden"); }
    if (mainHeader) mainHeader.classList.remove("hidden");
    if (mainContent) mainContent.classList.remove("hidden");
    if (bottomNav) bottomNav.classList.remove("hidden");

    const userAvatar = document.getElementById("user-avatar");
    const headerTitle = document.getElementById("header-title");
    const headerSubtitle = document.getElementById("header-subtitle");

    if (userAvatar) userAvatar.src = appState.user.foto || (getInitialsAvatar(appState.user.nama));
    if (headerTitle) headerTitle.innerText = `Selamat Datang, ${appState.user.nama}`;
    if (headerSubtitle) headerSubtitle.innerText = `${appState.user.role.charAt(0).toUpperCase() + appState.user.role.slice(1)} • SMPN 1 Talaga Jaya`;
    startHeaderDateTimeClock();

    const sbAvatar = document.getElementById("sidebar-avatar");
    const sbNama = document.getElementById("sidebar-nama");
    const sbRole = document.getElementById("sidebar-role-badge");
    if (sbAvatar) sbAvatar.src = userAvatar ? userAvatar.src : "";
    if (sbNama) sbNama.innerText = appState.user.nama;
    if (sbRole) sbRole.innerText = appState.user.role.toUpperCase();
    renderSidebarMenu(appState.user.role);

    document.documentElement.classList.add("has-session");

    const hasCachedData = loadAppStateFromLocal();

    const targetView = sessionStorage.getItem("app_last_view") || "dashboard";
    switchView(targetView);

    setSplashProgress(30, "Menyiapkan sesi...");

    setSplashProgress(50, "Memuat data sekolah...");
    const resBootstrap = await apiCall("getBootstrapData", {}, false);
    setSplashProgress(85, "Menyusun data...");
    if (resBootstrap && resBootstrap.status === "success") {
        appState.kelas = resBootstrap.data.initial.kelas || [];
        appState.guru = resBootstrap.data.initial.guru || [];
        appState.siswa = resBootstrap.data.initial.siswa || [];
        appState.myStudents = resBootstrap.data.initial.siswa || [];
        appState.pengaturan = resBootstrap.data.initial.pengaturan || { nama_kepsek: "", nip_kepsek: "" };
        saveAppStateToLocal();
    }

    _refreshAllSiswaDropdowns();

    if (targetView === "dashboard") {
        renderDashboard();
    }

    startRealtimeNotificationPolling();
    startDataPolling();
    checkStudentNotifications();

    setSplashProgress(100, "Selesai!");
    await new Promise(resolve => setTimeout(resolve, 250));
    hidePostLoginSplash();
}

function startHeaderDateTimeClock() {
    const dateEl = document.getElementById("header-date-text");
    const timeEl = document.getElementById("header-time-text");
    if (!dateEl || !timeEl) return;

    const update = () => {
        const now = new Date();
        dateEl.innerText = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        timeEl.innerText = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA";
    };

    update();
    if (headerClockInterval) clearInterval(headerClockInterval);
    headerClockInterval = setInterval(update, 30000);
}

function startRealtimeNotificationPolling() {
    if (notificationPollingInterval) clearInterval(notificationPollingInterval);

    notificationPollingInterval = setInterval(async () => {
        if (!appState.token || !appState.user) return;

        const prevCount = appState.currentNotifications ? appState.currentNotifications.length : 0;
        await checkStudentNotifications();
        const currentCount = appState.currentNotifications ? appState.currentNotifications.length : 0;

        if (currentCount > prevCount) {
            showToast(`${currentCount - prevCount} catatan siswa baru ditemukan!`, "warning");
        }
    }, 30000);
}

function handleLogout(force = false) {
    const executeLogout = () => {
        if (silentTokenRefreshInterval) clearInterval(silentTokenRefreshInterval);
        if (notificationPollingInterval) clearInterval(notificationPollingInterval);
        if (dataPollingInterval) clearInterval(dataPollingInterval);

        document.documentElement.classList.remove("has-session");
        sessionStorage.removeItem("app_last_view");
        localStorage.removeItem("session_anak_wali");
        localStorage.removeItem("cache_appState_full");
        localStorage.removeItem("notif_ditangani_cache");
        localStorage.removeItem("dismissed_notifications_map");
        localStorage.removeItem("login_last_role");
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

function updateRoleVisibility(role) {
    document.querySelectorAll("[data-role-visible]").forEach(el => {
        const allowed = el.getAttribute("data-role-visible").split(",").map(r => r.trim().toLowerCase());
        if (allowed.includes(role.toLowerCase())) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });
}

function applyRoleUI(role) {
    document.body.setAttribute("data-role", role);
    updateRoleVisibility(role);

    const navContainer = document.getElementById("bottom-nav-items");
    const notifBtnHeader = document.getElementById("btn-notif-header");

    if (notifBtnHeader && role !== "ortu") {
        notifBtnHeader.classList.remove("hidden");
    }

    if (!navContainer) return;

    if (role === "siswa") {
        navContainer.innerHTML = `
            <button onclick="switchView('dashboard')" class="nav-item flex flex-col items-center gap-1 text-slate-400 active" data-target="dashboard">
                <i class="fas fa-home text-lg"></i>
                <span class="text-xs font-bold">Beranda</span>
            </button>
            <button onclick="switchView('kebiasaan')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="kebiasaan">
                <i class="fas fa-star text-lg"></i>
                <span class="text-xs font-bold">Kebiasaan</span>
            </button>
            <button onclick="switchView('karakter')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="karakter">
                <i class="fas fa-quran text-lg"></i>
                <span class="text-xs font-bold">Keagamaan</span>
            </button>
            <button onclick="switchView('akademik')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="akademik">
                <i class="fas fa-graduation-cap text-lg"></i>
                <span class="text-xs font-bold">Akademik</span>
            </button>
            <button onclick="openProfilSiswa('${appState.user ? appState.user.id : ''}')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="profil-siswa">
                <i class="fas fa-user-circle text-lg"></i>
                <span class="text-xs font-bold">Profil</span>
            </button>
        `;
    } else if (role !== "ortu") {
        navContainer.innerHTML = `
            <button onclick="switchView('dashboard')" class="nav-item flex flex-col items-center gap-1 text-slate-400 active" data-target="dashboard">
                <i class="fas fa-home text-lg"></i>
                <span class="text-xs font-bold">Beranda</span>
            </button>
            <button onclick="switchView('absensi')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="absensi">
                <i class="fas fa-calendar-check text-lg"></i>
                <span class="text-xs font-bold">Presensi</span>
            </button>
            <button onclick="switchView('akademik')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="akademik">
                <i class="fas fa-graduation-cap text-lg"></i>
                <span class="text-xs font-bold">Akademik</span>
            </button>
            <button onclick="switchView('laporan')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="laporan">
                <i class="fas fa-file-invoice text-lg"></i>
                <span class="text-xs font-bold">Laporan</span>
            </button>
            ${role === 'admin' ? `
            <button onclick="switchView('admin-manage')" class="nav-item flex flex-col items-center gap-1 text-slate-400" data-target="admin-manage">
                <i class="fas fa-user-cog text-lg"></i>
                <span class="text-xs font-bold">Master</span>
            </button>` : ''}
        `;
    }
}

function renderSidebarMenu(role) {
    const container = document.getElementById("sidebar-menu-items");
    if (!container) return;

    const item = (view, icon, label, badgeId = "") => `
        <button onclick="handleSidebarNav('${view}')" class="sidebar-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition" data-target="${view}">
            <i class="fas ${icon} w-5 text-center text-primary"></i>
            <span class="flex-1 text-left">${label}</span>
            ${badgeId ? `<span id="${badgeId}" class="sidebar-badge"></span>` : ""}
        </button>`;

    const section = (label) => `<p class="sidebar-section-label">${label}</p>`;

    let html = item("dashboard", "fa-home", "Beranda");

    if (role === "siswa") {
        html += section("Pemantauan");
        html += item("kebiasaan", "fa-star", "7 Kebiasaan Hebat");
        html += item("karakter", "fa-quran", "Keagamaan");
        html += item("akademik", "fa-graduation-cap", "Akademik & Prestasi");
    } else if (role !== "ortu") {
        html += section("Pemantauan");
        html += item("absensi", "fa-calendar-check", "Presensi Kehadiran");
        html += item("kebiasaan", "fa-star", "7 Kebiasaan Hebat");
        html += item("karakter", "fa-quran", "Keagamaan");
        html += item("akademik", "fa-graduation-cap", "Akademik & Prestasi");

        html += section("Pembinaan");
        html += item("pembinaan", "fa-user-edit", "Catatan Pembinaan", "sidebar-badge-pembinaan");
        html += item("siswa", "fa-users", "Data Siswa");

        html += section("Lainnya");
        html += item("laporan", "fa-file-invoice", "Laporan");
        if (role === "admin") {
            html += item("admin-manage", "fa-user-cog", "Master Data");
        }
    }

    container.innerHTML = html;
    updateSidebarBadge();
}

function updateSidebarBadge() {
    const el = document.getElementById("sidebar-badge-pembinaan");
    if (!el) return;
    const n = appState.currentNotifications ? appState.currentNotifications.length : 0;
    el.innerText = n > 0 ? n : "";
}

function handleSidebarNav(viewId) {
    switchView(viewId);
    toggleSidebar(false);
}

function openUserSettingsModal() {
    const container = document.getElementById("modal-content-box");
    if (!container) return;

    const user = appState.user || { nama: 'Pengguna', role: 'guest' };

    container.innerHTML = `
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <i class="fas fa-cog text-blue-600"></i> Pengaturan Akun
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup"><i class="fas fa-times"></i></button>
        </div>

        <div class="flex flex-col space-y-3 w-full">
            <div class="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 gap-2 w-full">
                <div class="flex items-center gap-2.5 min-w-0">
                    <img src="${user.foto || getInitialsAvatar(user.nama)}"
                         class="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0">
                    <div class="min-w-0">
                        <h4 class="font-bold text-xs text-slate-800 truncate">${escapeHtml(user.nama)}</h4>
                        <span class="inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase mt-0.5">${escapeHtml(user.role)}</span>
                    </div>
                </div>
                <button onclick="openEditProfilModal()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 shrink-0">
                    <i class="fas fa-user-edit"></i> <span>Edit Profil</span>
                </button>
            </div>

            <div class="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 gap-2 w-full">
                <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs shrink-0">
                        <i class="fas fa-moon"></i>
                    </span>
                    <div class="min-w-0">
                        <h4 class="font-bold text-xs text-slate-800">Mode Tampilan</h4>
                        <p class="text-[11px] text-slate-400 truncate">Pilih tema Gelap / Terang</p>
                    </div>
                </div>
                <button onclick="toggleDarkMode(); openUserSettingsModal();" class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm transition flex items-center gap-1.5 shrink-0">
                    <i class="fas ${document.body.classList.contains('dark') ? 'fa-sun text-amber-500' : 'fa-moon text-slate-600'}"></i>
                    <span>${document.body.classList.contains('dark') ? 'Terang' : 'Gelap'}</span>
                </button>
            </div>

            ${user.role !== 'ortu' ? `
            <form onsubmit="changePasswordForm(event)" class="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full">
                <h4 class="text-xs font-bold text-slate-700 uppercase">Ganti Kata Sandi</h4>
                <input type="password" id="m-pwd-old" placeholder="Kata sandi lama" aria-label="Kata sandi lama" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
                <input type="password" id="m-pwd-new" placeholder="Kata sandi baru" aria-label="Kata sandi baru" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required minlength="6">
                <button type="submit" id="btn-change-pwd" class="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-900 transition">Update Kata Sandi</button>
            </form>` : ''}

            <button onclick="handleLogout()" class="w-full bg-rose-50 text-rose-600 font-bold py-2.5 rounded-xl border border-rose-200 text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition">
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

    if (newPassword.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Password Terlalu Pendek', text: 'Kata sandi baru minimal 6 karakter.', confirmButtonColor: '#2563eb' });
        return;
    }

    const btn = document.getElementById("btn-change-pwd");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    }

    const res = await apiCall("changePassword", { oldPassword, newPassword }, true);

    if (btn) {
        btn.disabled = false;
        btn.classList.remove("opacity-70", "cursor-not-allowed");
        btn.innerHTML = originalHtml;
    }

    if (res && res.status === "success") {
        closeModal();
        showToast("Kata sandi diperbarui!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengganti Password',
            text: res?.message || 'Kata sandi lama kemungkinan salah.',
            confirmButtonColor: '#2563eb'
        });
    }
}

function openEditProfilModal() {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const user = appState.user || {};
    const role = (user.role || "").toLowerCase();

    const isEditingLocked = role === "siswa" || role === "guru";

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i class="fas fa-user-pen text-blue-600"></i> Edit Profil Saya
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup"><i class="fas fa-times"></i></button>
        </div>

        <form onsubmit="saveSelfProfileForm(event)" class="space-y-4">
            <div class="flex flex-col items-center justify-center gap-2">
                <div class="relative group">
                    <img id="preview-foto-profil"
                        src="${user.foto || getInitialsAvatar(user.nama)}"
                        class="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md">
                    <label for="input-foto-file"
                        class="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition active:scale-95"
                        title="Ubah Foto">
                        <i class="fas fa-camera text-xs"></i>
                    </label>
                    <input type="file" id="input-foto-file" accept="image/*" onchange="previewSelectedPhoto(event)" class="hidden">
                </div>
                <span class="text-[11px] text-slate-400">Format: JPG/PNG (Maks. 2MB)</span>
                ${user.foto ? `
                <button type="button" onclick="hapusFotoProfil()" class="text-[11px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1">
                    <i class="fas fa-trash-alt"></i> Hapus Foto
                </button>` : ''}
            </div>

            <div>
                <label for="self-nama" class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input type="text" id="self-nama" value="${escapeHtml(user.nama || '')}"
                       class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isEditingLocked ? 'cursor-not-allowed opacity-75 bg-slate-100' : ''}"
                       ${isEditingLocked ? 'readonly' : 'required'}>
                ${isEditingLocked ? '<p class="text-[10px] text-slate-400 mt-0.5">*Nama hanya dapat diubah oleh Admin sekolah.</p>' : ''}
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="self-username" class="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                    <input type="text" id="self-username" value="${escapeHtml(user.username || '')}"
                           class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isEditingLocked ? 'cursor-not-allowed opacity-75 bg-slate-100' : ''}"
                           ${isEditingLocked ? 'readonly' : 'required'}>
                </div>

                <div>
                    <label for="self-nip-nisn" class="block text-xs font-bold text-slate-500 uppercase mb-1">${role === 'guru' ? 'NIP' : (role === 'siswa' ? 'NISN' : 'ID Identifier')}</label>
                    <input type="text" id="self-nip-nisn" value="${escapeHtml(user.nip || user.nisn || '')}"
                           class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isEditingLocked ? 'cursor-not-allowed opacity-75 bg-slate-100' : ''}"
                           ${isEditingLocked ? 'readonly' : ''}>
                </div>
            </div>

            <div>
                <label for="self-hp" class="block text-xs font-bold text-slate-500 uppercase mb-1">No. WhatsApp / HP</label>
                <input type="text" id="self-hp" value="${escapeHtml(user.no_hp || user.no_hp_ortu || '')}"
                       placeholder="08xxxxxxxxxx" oninput="validatePhoneField(this)"
                       class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none focus:border-blue-500">
                <p id="self-hp-error" class="hidden text-[10px] text-rose-500 mt-1 font-semibold"><i class="fas fa-circle-exclamation"></i> Format nomor tidak valid. Gunakan 08xxxxxxxxxx (10-14 digit).</p>
            </div>

            <button type="submit" id="btn-save-profil" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2">
                <i class="fas fa-save"></i> Simpan Perubahan Profil
            </button>
        </form>
    `;

    document.getElementById("modal-container")?.classList.remove("hidden");
}

function previewSelectedPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 2MB!", "warning");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const previewImg = document.getElementById("preview-foto-profil");
        if (previewImg) previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function hapusFotoProfil() {
    const confirm = await Swal.fire({
        icon: 'warning',
        title: 'Hapus Foto Profil?',
        text: 'Foto akan dihapus permanen dari Drive.',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#e11d48'
    });
    if (!confirm.isConfirmed) return;

    showLoading("Menghapus foto...");
    const res = await apiCall("hapusFotoProfil", {}, true);
    hideLoading();

    if (res && res.status === "success") {
        appState.user.foto = "";

        const savedSession = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
        savedSession.user = appState.user;
        localStorage.setItem("session_anak_wali", JSON.stringify(savedSession));

        const defaultAvatar = getInitialsAvatar(appState.user.nama);
        const previewImg = document.getElementById("preview-foto-profil");
        const userAvatar = document.getElementById("user-avatar");
        const sbAvatar = document.getElementById("sidebar-avatar");

        if (previewImg) previewImg.src = defaultAvatar;
        if (userAvatar) userAvatar.src = defaultAvatar;
        if (sbAvatar) sbAvatar.src = defaultAvatar;

        openEditProfilModal();
        showToast("Foto profil dihapus!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: res?.message || 'Terjadi kesalahan saat menghapus foto.',
            confirmButtonColor: '#2563eb'
        });
    }
}

function validatePhoneField(input, errorElId) {
    const errorEl = document.getElementById(errorElId || (input.id + "-error"));
    const value = input.value.trim();
    const isValid = value === "" || /^08[0-9]{8,12}$/.test(value);

    if (isValid) {
        input.classList.remove("border-rose-400", "focus:border-rose-500");
        input.classList.add("focus:border-blue-500");
        if (errorEl) errorEl.classList.add("hidden");
    } else {
        input.classList.add("border-rose-400", "focus:border-rose-500");
        input.classList.remove("focus:border-blue-500");
        if (errorEl) errorEl.classList.remove("hidden");
    }
    return isValid;
}

async function saveSelfProfileForm(e) {
    e.preventDefault();

    const hpInput = document.getElementById("self-hp");
    if (hpInput && !validatePhoneField(hpInput)) {
        hpInput.focus();
        return;
    }

    const submitBtn = document.getElementById("btn-save-profil");
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-70", "cursor-not-allowed");
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const fileInput = document.getElementById("input-foto-file");
    const file = fileInput?.files[0];

    let base64Photo = null;

    if (file) {
        base64Photo = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    const payload = {
        nama: document.getElementById("self-nama").value,
        username: document.getElementById("self-username").value,
        no_hp: document.getElementById("self-hp").value,
        fileData: base64Photo
    };

    showLoading("Memperbarui profil...");

    const res = await apiCall("updateSelfProfile", payload, false);
    hideLoading();

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
        submitBtn.innerHTML = originalBtnHtml;
    }

    if (res && res.status === "success") {
        closeModal();

        appState.user.nama = payload.nama;
        appState.user.username = payload.username;
        appState.user.no_hp = payload.no_hp;
        if (res.photoUrl) appState.user.foto = res.photoUrl;

        const savedSession = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
        savedSession.user = appState.user;
        localStorage.setItem("session_anak_wali", JSON.stringify(savedSession));

        const userAvatar = document.getElementById("user-avatar");
        const sbAvatar = document.getElementById("sidebar-avatar");
        const headerTitle = document.getElementById("header-title");

        if (userAvatar) userAvatar.src = appState.user.foto;
        if (sbAvatar) sbAvatar.src = appState.user.foto;
        if (headerTitle) headerTitle.innerText = `Selamat Datang, ${appState.user.nama}`;

        showToast("Profil berhasil diperbarui!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memperbarui',
            text: res?.message || 'Terjadi kesalahan saat menyimpan profil.',
            confirmButtonColor: '#2563eb'
        });
    }
}