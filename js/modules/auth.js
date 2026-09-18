function selectLoginRole(role) {
    const roleInput = document.getElementById("login-role");
    if (roleInput) roleInput.value = role;

    document.querySelectorAll(".login-role-btn").forEach(btn => btn.classList.remove("selected"));
    const selectedBtn = document.getElementById(`role-btn-${role}`);
    if (selectedBtn) selectedBtn.classList.add("selected");
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
    } else if (res && res.status === "error") {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Masuk',
            text: res.message || 'Username atau kata sandi yang Anda masukkan salah.',
            confirmButtonColor: '#2563eb'
        });

        const pwdInput = document.getElementById("login-password");
        if (pwdInput) {
            pwdInput.value = "";
            pwdInput.focus();
        }
    }
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
                <label class="block text-xs font-bold text-slate-500 mb-1">PASSWORD DEFAULT SAAT INI</label>
                <input type="password" id="force-pwd-old" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">PASSWORD BARU (MIN. 6 KARAKTER)</label>
                <input type="password" id="force-pwd-new" minlength="6" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs">Simpan & Lanjutkan</button>
        </form>
    `;
    container.classList.remove("hidden");
    container.dataset.forceLock = "true";
}

async function submitForcePasswordChange(e) {
    e.preventDefault();
    const oldPassword = document.getElementById("force-pwd-old").value;
    const newPassword = document.getElementById("force-pwd-new").value;

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

        Swal.fire({ icon: 'success', title: 'Password Diperbarui', text: 'Password berhasil diganti. Selamat datang!', timer: 1400, showConfirmButton: false });
        await continueSessionSetup();
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

    if (userAvatar) userAvatar.src = appState.user.foto || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(appState.user.nama));
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

    const resBootstrap = await apiCall("getBootstrapData", {}, false);
    if (resBootstrap && resBootstrap.status === "success") {
        appState.kelas = resBootstrap.data.initial.kelas || [];
        appState.guru = resBootstrap.data.initial.guru || [];
        appState.siswa = resBootstrap.data.initial.siswa || [];
        appState.myStudents = resBootstrap.data.initial.siswa || [];
        saveAppStateToLocal();
    }

    _refreshAllSiswaDropdowns();

    if (targetView === "dashboard") {
        renderDashboard();
    }

    startRealtimeNotificationPolling();
    checkStudentNotifications();
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

        document.documentElement.classList.remove("has-session");
        sessionStorage.removeItem("app_last_view");
        localStorage.removeItem("session_anak_wali");
        localStorage.removeItem("cache_appState_full");
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

    const item = (view, icon, label) => `
        <button onclick="handleSidebarNav('${view}')" class="sidebar-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition" data-target="${view}">
            <i class="fas ${icon} w-5 text-center text-primary"></i> ${label}
        </button>`;

    let html = item("dashboard", "fa-home", "Beranda");

    if (role === "siswa") {
        html += item("kebiasaan", "fa-star", "7 Kebiasaan Hebat");
        html += item("karakter", "fa-quran", "Keagamaan");
        html += item("akademik", "fa-graduation-cap", "Akademik & Prestasi");
    } else if (role !== "ortu") {
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
            <!-- 1. Kartu Profil & Tombol Edit -->
            <div class="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 gap-2 w-full">
                <div class="flex items-center gap-2.5 min-w-0">
                    <img src="${user.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nama)}" 
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

            <!-- 2. Mode Tampilan -->
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

            <!-- 3. Form Ganti Kata Sandi -->
            ${user.role !== 'ortu' ? `
            <form onsubmit="changePasswordForm(event)" class="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full">
                <h4 class="text-xs font-bold text-slate-700 uppercase">Ganti Kata Sandi</h4>
                <input type="password" id="m-pwd-old" placeholder="Kata sandi lama" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
                <input type="password" id="m-pwd-new" placeholder="Kata sandi baru" class="w-full bg-white border p-2.5 rounded-xl text-xs outline-none" required>
                <button type="submit" class="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-900 transition">Update Kata Sandi</button>
            </form>` : ''}

            <!-- 4. Tombol Keluar -->
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
    const res = await apiCall("changePassword", { oldPassword, newPassword }, true);
    if (res && res.status === "success") {
        closeModal();
        showToast("Kata sandi diperbarui!");
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
            <!-- Upload Foto Profil -->
            <div class="flex flex-col items-center justify-center gap-2">
                <div class="relative group">
                    <img id="preview-foto-profil" 
                        src="${user.foto || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nama || 'User'))}" 
                        class="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md">
                    <label for="input-foto-file" 
                        class="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition active:scale-95" 
                        title="Ubah Foto">
                        <i class="fas fa-camera text-xs"></i>
                    </label>
                    <input type="file" id="input-foto-file" accept="image/*" onchange="previewSelectedPhoto(event)" class="hidden">
                </div>
                <span class="text-[11px] text-slate-400">Format: JPG/PNG (Maks. 2MB)</span>
            </div>

            <!-- Nama Lengkap -->
            <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input type="text" id="self-nama" value="${escapeHtml(user.nama || '')}" 
                       class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isEditingLocked ? 'cursor-not-allowed opacity-75 bg-slate-100' : ''}" 
                       ${isEditingLocked ? 'readonly' : 'required'}>
                ${isEditingLocked ? '<p class="text-[10px] text-slate-400 mt-0.5">*Nama hanya dapat diubah oleh Admin sekolah.</p>' : ''}
            </div>

            <div class="grid grid-cols-2 gap-2">
                <!-- Username -->
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                    <input type="text" id="self-username" value="${escapeHtml(user.username || '')}" 
                           class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isEditingLocked ? 'cursor-not-allowed opacity-75 bg-slate-100' : ''}" 
                           ${isEditingLocked ? 'readonly' : 'required'}>
                </div>

                <!-- NIP / NISN -->
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">${role === 'guru' ? 'NIP' : (role === 'siswa' ? 'NISN' : 'ID Identifier')}</label>
                    <input type="text" id="self-nip-nisn" value="${escapeHtml(user.nip || user.nisn || '')}" 
                           class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isEditingLocked ? 'cursor-not-allowed opacity-75 bg-slate-100' : ''}" 
                           ${isEditingLocked ? 'readonly' : ''}>
                </div>
            </div>

            <!-- No. Telepon / WhatsApp -->
            <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">No. WhatsApp / HP</label>
                <input type="text" id="self-hp" value="${escapeHtml(user.no_hp || user.no_hp_ortu || '')}" 
                       placeholder="08xxxxxxxxxx" 
                       class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none focus:border-blue-500">
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2">
                <i class="fas fa-save"></i> Simpan Perubahan Profil
            </button>
        </form>
    `;

    document.getElementById("modal-container")?.classList.remove("hidden");
}

/**
 * Preview Foto secara lokal sebelum diunggah
 */
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

/**
 * Handle Submit Form Edit Profil
 */
async function saveSelfProfileForm(e) {
    e.preventDefault();

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