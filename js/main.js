function switchView(viewId) {
    if (pendingKebiasaanQueue && pendingKebiasaanQueue.size > 0) {
        flushKebiasaanQueue();
    }

    if (viewId && viewId !== "login") {
        sessionStorage.setItem("app_last_view", viewId);
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

function _refreshAllSiswaDropdowns() {
    const siswaList = appState.siswa || [];
    const isSiswa = appState.user && appState.user.role === 'siswa';
    const isGuruOrAdmin = appState.user && (appState.user.role === 'guru' || appState.user.role === 'admin');

    const selKebiasaan = document.getElementById("kebiasaan-siswa-select");
    if (selKebiasaan) {
        if (isSiswa) {
            selKebiasaan.innerHTML = `<option value="${appState.user.id}">${escapeHtml(appState.user.nama)}</option>`;
            selKebiasaan.value = appState.user.id;
            selKebiasaan.disabled = true;
        } else {
            const prev = selKebiasaan.value;
            selKebiasaan.innerHTML = `<option value="">-- Pilih Siswa --</option>` + 
                siswaList.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
            selKebiasaan.value = prev || "";
            selKebiasaan.disabled = false;
        }
    }

    const selKarakter = document.getElementById("karakter-siswa-filter");
    if (selKarakter) {
        if (isSiswa) {
            selKarakter.innerHTML = `<option value="${appState.user.id}">${escapeHtml(appState.user.nama)}</option>`;
            selKarakter.value = appState.user.id;
            selKarakter.disabled = true;
        } else {
            const prev = selKarakter.value;
            selKarakter.innerHTML = `<option value="">-- Pilih Siswa --</option>` + 
                siswaList.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
            selKarakter.value = prev || "";
            selKarakter.disabled = false;
        }
    }

    const selAkademik = document.getElementById("akademik-siswa-filter");
    if (selAkademik) {
        if (isSiswa) {
            selAkademik.innerHTML = `<option value="${appState.user.id}">${escapeHtml(appState.user.nama)}</option>`;
            selAkademik.value = appState.user.id;
            selAkademik.disabled = true;
        } else {
            const prev = selAkademik.value;
            selAkademik.innerHTML = `<option value="">-- Pilih Siswa --</option>` + 
                siswaList.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
            selAkademik.value = prev || "";
            selAkademik.disabled = false;
        }
    }

    const selPembinaan = document.getElementById("pembinaan-siswa-filter");
    if (selPembinaan) {
        if (isSiswa) {
            selPembinaan.innerHTML = `<option value="${appState.user.id}">${escapeHtml(appState.user.nama)}</option>`;
            selPembinaan.value = appState.user.id;
            selPembinaan.disabled = true;
        } else {
            const prev = selPembinaan.value;
            selPembinaan.innerHTML = `<option value="">-- Semua Siswa --</option>` + 
                siswaList.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
            selPembinaan.value = prev || "";
            selPembinaan.disabled = false;
        }
    }

    const activeView = document.querySelector(".view-section.active");
    if (activeView) {
        const viewId = activeView.id.replace("view-", "");
        if (viewId === "absensi") renderAbsensiView();
        else if (viewId === "kebiasaan") renderKebiasaanView();
        else if (viewId === "karakter") renderKeagamaanView();
        else if (viewId === "pembinaan") renderPembinaanView();
        else if (viewId === "siswa") renderSiswaView();
    }
}

/**
 * Mekanisme Smart Polling untuk Pembaruan Data Otomatis
 */
function isUserInteracting() {
    const modalContainer = document.getElementById("modal-container");
    const isModalOpen = modalContainer && !modalContainer.classList.contains("hidden");
    const activeEl = document.activeElement;
    const isInputFocused = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "SELECT" || 
        activeEl.tagName === "TEXTAREA"
    );
    return isModalOpen || isInputFocused;
}

function startSmartPolling() {
    if (autoPollingInterval) clearInterval(autoPollingInterval);

    autoPollingInterval = setInterval(async () => {
        if (document.hidden || !appState.token || !appState.user || isUserInteracting()) return;

        if (typeof pendingKebiasaanQueue !== "undefined" && pendingKebiasaanQueue.size > 0) return;

        const activeView = document.querySelector(".view-section.active");
        if (!activeView) return;

        const viewId = activeView.id.replace("view-", "");

        try {
            if (viewId === "dashboard") {
                await checkStudentNotifications();
            } else if (viewId === "absensi") {
                await loadAbsensiData(true);
            } else if (viewId === "kebiasaan") {
                const selectSiswa = document.getElementById("kebiasaan-siswa-select");
                if (selectSiswa && selectSiswa.value) {
                    await loadKebiasaanData(true);
                }
            } else if (viewId === "karakter") {
                await loadKeagamaanData(true);
            } else if (viewId === "akademik") {
                await loadAkademikData(true);
            } else if (viewId === "pembinaan") {
                await loadPembinaanData(true);
            }
        } catch (err) {
            console.warn("Polling silent error:", err);
        }
    }, POLLING_INTERVAL_MS);
}

document.addEventListener("visibilitychange", () => {
    if (!document.hidden && appState.token) {
        const activeView = document.querySelector(".view-section.active");
        if (activeView) {
            const viewId = activeView.id.replace("view-", "");
            switchView(viewId);
        }
    }
});

async function manualRefreshAll() {
    const icon = document.querySelector("#btn-refresh-header i");
    if (icon) icon.classList.add("fa-spin");

    await fetchAllAppData(true);
    _refreshAllSiswaDropdowns();
    await loadAbsensiData(true);
    await checkStudentNotifications();

    const activeView = document.querySelector(".view-section.active");
    const viewId = activeView ? activeView.id.replace("view-", "") : "dashboard";
    switchView(viewId);

    if (icon) icon.classList.remove("fa-spin");
    showToast("Data terbaru disinkronkan.");
}

window.addEventListener("DOMContentLoaded", async () => {
    setupNetworkStatusListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('magic_token');

    if (magicToken) {
        showLoading("Memvalidasi Magic Link Orang Tua...");
        const res = await apiCall("getMagicLinkData", { magic_token: magicToken }, false);
        hideLoading();

        if (res && res.status === "success") {
            document.getElementById("view-login")?.classList.add("hidden");
            document.getElementById("main-header")?.classList.remove("hidden");
            document.getElementById("btn-toggle-sidebar")?.classList.add("hidden");
            document.getElementById("btn-refresh-header")?.classList.add("hidden");
            document.getElementById("btn-notif-header")?.classList.add("hidden");
            document.getElementById("bottom-nav")?.classList.add("hidden");
            document.getElementById("btn-back-profil")?.classList.add("hidden");

            const headerTitle = document.getElementById("header-title");
            const headerSubtitle = document.getElementById("header-subtitle");
            if (headerTitle) headerTitle.innerText = "Pemantauan Anak Wali";
            if (headerSubtitle) headerSubtitle.innerText = "Mode Akses Orang Tua (Kedaluwarsa 15 Menit)";

            appState.user = { role: 'ortu', nama: 'Orang Tua / Wali' };
            applyRoleUI('ortu');
            renderMagicLinkProfilView(res.data);
            return;
        } else if (res && res.status === "expired") {
            showExpiredMagicLinkScreen(res.message);
            return;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Tautan Tidak Valid',
                text: res?.message || 'Tautan Magic Link tidak valid.',
                confirmButtonColor: '#2563eb'
            });
        }
    }

    initTheme();

    const savedSession = localStorage.getItem("session_anak_wali");
    if (savedSession) {
        try {
            const parsed = JSON.parse(savedSession);
            if (parsed && parsed.token && parsed.user) {
                appState.token = parsed.token;
                appState.user = parsed.user;

                await setupAppSession();

                apiCall("validateSession", {}, false).then(validRes => {
                    if (validRes && validRes.status === "success") {
                        if (validRes.user) {
                            appState.user = validRes.user;
                        }
                    } else if (validRes && validRes.status === "error") {
                        handleLogout(true);
                    }
                });
            } else {
                localStorage.removeItem("session_anak_wali");
                document.documentElement.classList.remove("has-session");
            }
        } catch (e) {
            localStorage.removeItem("session_anak_wali");
            document.documentElement.classList.remove("has-session");
        }
    } else {
        document.documentElement.classList.remove("has-session");
    }
});

function initTheme() {
    const savedTheme = localStorage.getItem("app_theme") || "light";
    applyTheme(savedTheme);
}

function toggleDarkMode() {
    const isDark = document.body.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
    showToast(nextTheme === "dark" ? "Mode Gelap diaktifkan 🌙" : "Mode Terang diaktifkan ☀️");
}

function applyTheme(theme) {
    const icon = document.getElementById("theme-toggle-icon");
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        if (icon) {
            icon.className = "fas fa-sun text-amber-300 text-base";
        }
    } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        if (icon) {
            icon.className = "fas fa-moon text-base";
        }
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('ServiceWorker Aktif:', reg.scope))
            .catch(err => console.log('Registrasi ServiceWorker Gagal:', err));
    });
}