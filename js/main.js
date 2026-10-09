function canAccessView(role, viewId) {
    const staffOnly = ["siswa", "laporan"];
    if (viewId === "admin-manage" || viewId === "arsip") return role === "admin";
    if (viewId === "arsip-saya") return role === "siswa" || role === "guru" || role === "kepsek";
    if (viewId === "jurnal") return true;
    if (staffOnly.includes(viewId)) return role === "admin" || role === "guru" || role === "kepsek";
    return true;
}

function switchView(viewId) {
    if (appState.user && !canAccessView(appState.user.role, viewId)) {
        viewId = "dashboard";
    }

    if (pendingKebiasaanQueue && pendingKebiasaanQueue.size > 0) {
        flushKebiasaanQueue();
    }

    if (viewId && viewId !== "login") {
        sessionStorage.setItem("app_last_view", viewId);
    }

    applyWriteVisibility();

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
    if (viewId === "jurnal") loadJurnalData();
    if (viewId === "karakter") loadKeagamaanData();
    if (viewId === "akademik") loadAkademikData();
    if (viewId === "pembinaan") loadPembinaanData();
    if (viewId === "laporan") loadLaporanRekap();
    if (viewId === "siswa") renderSiswaView();
    if (viewId === "admin-manage") renderAdminManage();
    if (viewId === "arsip") renderAdminArsip();
    if (viewId === "arsip-saya") renderArsipSaya();
}

function renderPeranSwitcher() {
    document.getElementById("peran-switcher-sidebar")?.remove();
    document.getElementById("peran-switcher-header")?.remove();
    if (!isGuruUser()) return;

    const ada = getPeranTersedia();
    if (ada.length < 2) return;
    const aktif = getPeranAktif();

    const nav = document.getElementById("sidebar-menu-items");
    if (nav) {
        const wrap = document.createElement("div");
        wrap.id = "peran-switcher-sidebar";
        wrap.className = "px-3 pt-3";
        wrap.innerHTML = `
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Peran Aktif</p>
            <div class="flex gap-1 bg-slate-100 p-1 rounded-xl" role="group" aria-label="Pilih peran aktif">
                ${ada.map(p => `
                    <button type="button" onclick="setPeranAktif('${p}')" aria-pressed="${p === aktif}"
                        class="flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition ${p === aktif ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
                        ${PERAN_LABEL[p]}
                    </button>`).join("")}
            </div>`;
        nav.parentNode.insertBefore(wrap, nav);
    }

    const refreshBtn = document.getElementById("btn-refresh-header");
    if (refreshBtn) {
        const sel = document.createElement("select");
        sel.id = "peran-switcher-header";
        sel.setAttribute("aria-label", "Peran aktif");
        sel.className = "bg-white/15 text-white text-xs font-bold rounded-lg px-2 py-1.5 outline-none border border-white/30 max-w-[7.5rem]";
        sel.innerHTML = ada.map(p => `<option value="${p}" class="text-slate-800" ${p === aktif ? "selected" : ""}>${PERAN_LABEL[p]}</option>`).join("");
        sel.addEventListener("change", () => setPeranAktif(sel.value));
        refreshBtn.parentNode.insertBefore(sel, refreshBtn);
    }
}

function onPeranChanged() {
    if (!appState.user) return;
    renderPeranSwitcher();
    updateHeaderUser();
    applyWriteVisibility();
    if (typeof _refreshAllSiswaDropdowns === "function") _refreshAllSiswaDropdowns();
    if (typeof checkStudentNotifications === "function") checkStudentNotifications();

    const activeView = document.querySelector(".view-section.active");
    const viewId = activeView ? activeView.id.replace("view-", "") : "dashboard";
    if (viewId !== "login") switchView(viewId);
}

function _refreshAllSiswaDropdowns() {
    const siswaList = getSiswaPeran();

    const selKebiasaan = document.getElementById("kebiasaan-siswa-select");
    if (selKebiasaan && siswaList.length > 0) populateSiswaSelectForRole(selKebiasaan, { includeAllOption: true });

    const selKarakter = document.getElementById("karakter-siswa-filter");
    if (selKarakter && siswaList.length > 0) populateSiswaSelectForRole(selKarakter, { includeAllOption: true });

    const selAkademik = document.getElementById("akademik-siswa-filter");
    if (selAkademik && siswaList.length > 0) populateSiswaSelectForRole(selAkademik, { includeAllOption: true });

    const selPembinaan = document.getElementById("pembinaan-siswa-filter");
    if (selPembinaan && siswaList.length > 0) {
        const prev = selPembinaan.value;
        const siswaOptions = siswaList.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
        selPembinaan.innerHTML = `<option value="">-- Semua Siswa --</option>` + siswaOptions;
        if (prev && Array.from(selPembinaan.options).some(o => o.value === prev)) selPembinaan.value = prev;
                enhanceSiswaSelect(selPembinaan);
    }

    const activeView = document.querySelector(".view-section.active");
    if (activeView) {
        const viewId = activeView.id.replace("view-", "");
        if (viewId === "absensi") renderAbsensiView();
        else if (viewId === "kebiasaan") renderKebiasaanView();
        else if (viewId === "karakter") renderKeagamaanView();
        else if (viewId === "akademik") { renderAkademikNilai(); renderAkademikPrestasi(); }
        else if (viewId === "pembinaan") renderPembinaanView();
        else if (viewId === "siswa") renderSiswaView();
    }
}

async function manualRefreshAll() {
    const icons = document.querySelectorAll("#btn-refresh-header i, #btn-refresh-sidebar i");
    icons.forEach(i => i.classList.add("fa-spin"));

    await fetchAllAppData(true);
    _refreshAllSiswaDropdowns();
    await loadAbsensiData(true);
    await checkStudentNotifications();

    const activeView = document.querySelector(".view-section.active");
    const viewId = activeView ? activeView.id.replace("view-", "") : "dashboard";
    switchView(viewId);

    icons.forEach(i => i.classList.remove("fa-spin"));
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
            
            initTheme();
            setHeaderText("Pemantauan Anak Wali", "Akses Orang Tua – Berlaku 15 Menit");

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

                if (!parsed.user.mustChangePassword) {
                    showPostLoginSplash("Memulihkan sesi...");
                    startSplashAutoProgress();
                }
                await setupAppSession();

                apiCall("validateSession", {}, false).then(validRes => {
                    if (validRes && validRes.status === "success") {
                        if (validRes.user) {
                            syncUserFlags(validRes.user);
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
}

function applyTheme(theme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
    }
}

function startDataPolling() {
    if (dataPollingInterval) clearInterval(dataPollingInterval);

    dataPollingInterval = setInterval(async () => {
        if (!appState.token || !appState.user) return;
        if (document.hidden) return;

        if (pendingKebiasaanQueue && pendingKebiasaanQueue.size > 0) return;
        const modal = document.getElementById("modal-container");
        if (modal && !modal.classList.contains("hidden")) return;

        const sigVersi = await cekVersiData();
        if (sigVersi === null) return;

        const activeView = document.querySelector(".view-section.active");
        const viewId = activeView ? activeView.id.replace("view-", "") : "dashboard";

        try {
            switch (viewId) {
                case "dashboard":
                    await loadAbsensiData(true);
                    renderDashboard();
                    break;
                case "absensi": await loadAbsensiData(true); break;
                case "kebiasaan": await loadKebiasaanData(true); break;
                case "jurnal": await loadJurnalData(true); break;
                case "karakter": await loadKeagamaanData(true); break;
                case "akademik": await loadAkademikData(true); break;
                case "pembinaan": await loadPembinaanData(true); break;
                case "laporan": await loadLaporanRekap(true); break;
            }
            _lastVersiSheet = sigVersi;
        } catch (e) {
            console.error("Polling error:", e);
        }
    }, DATA_POLL_INTERVAL_MS);
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('ServiceWorker Aktif:', reg.scope))
            .catch(err => console.log('Registrasi ServiceWorker Gagal:', err));
    });
}
