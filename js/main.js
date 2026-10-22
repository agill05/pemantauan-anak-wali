function canAccessView(role, viewId) {
    if (role === "bk") return ["dashboard", "tatib", "absensi-bk"].includes(viewId);
    if (viewId === "absensi-bk") return false;
    const staffOnly = ["siswa", "laporan", "tatib"];
    if (viewId === "admin-manage" || viewId === "arsip") return role === "admin";
    if (viewId === "arsip-saya") return role === "siswa" || role === "guru" || role === "kepsek";
    if (viewId === "tatib-baca") return role === "siswa";
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

    if (viewId === "dashboard") {
        if (typeof bukaUcapanMaskot === "function") bukaUcapanMaskot();
        renderDashboard();
    }
    if (viewId === "absensi") loadAbsensiData();
    if (viewId === "kebiasaan") loadKebiasaanData();
    if (viewId === "jurnal") loadJurnalData();
    if (viewId === "karakter") loadKeagamaanData();
    if (viewId === "akademik") loadAkademikData();
    if (viewId === "pembinaan") loadPembinaanData();
    if (viewId === "tatib") loadTatibData();
    if (viewId === "laporan") loadLaporanRekap();
    if (viewId === "siswa") renderSiswaView();
    if (viewId === "admin-manage") renderAdminManage();
    if (viewId === "arsip") renderAdminArsip();
    if (viewId === "arsip-saya") renderArsipSaya();
    if (viewId === "tatib-baca") renderTatibBaca();
    if (viewId === "absensi-bk") renderAbsensiBKView();
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

    const selTatib = document.getElementById("tatib-siswa-filter");
    if (selTatib && siswaList.length > 0) {
        const prev = selTatib.value;
        selTatib.innerHTML = `<option value="">-- Semua Siswa --</option>` + siswaList.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
        if (prev && Array.from(selTatib.options).some(o => o.value === prev)) selTatib.value = prev;
        enhanceSiswaSelect(selTatib);
    }

    const activeView = document.querySelector(".view-section.active");
    if (activeView) {
        const viewId = activeView.id.replace("view-", "");
        if (viewId === "absensi") renderAbsensiView();
        else if (viewId === "kebiasaan") renderKebiasaanView();
        else if (viewId === "karakter") renderKeagamaanView();
        else if (viewId === "akademik") { renderAkademikNilai(); renderAkademikPrestasi(); }
        else if (viewId === "pembinaan") renderPembinaanView();
        else if (viewId === "tatib") renderTatibView();
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
        showLoading("Memeriksa tautan pemantauan...");
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
            const info = (res.data && res.data.info) || {};
            startMagicExpiryWatch(magicToken, res.server_time, {
                wali_nama: info.wali_nama,
                wali_hp: info.wali_hp,
                siswa_nama: res.data && res.data.siswa ? res.data.siswa.nama : ""
            });
            return;
        } else if (res && res.status === "expired") {
            blokirAksesOrtu(res.message, { wali_nama: res.wali_nama, wali_hp: res.wali_hp, siswa_nama: res.siswa_nama });
            return;
        } else {
            if (!res) {
                blokirAksesOrtu("Tidak dapat memeriksa tautan. Periksa koneksi internet lalu muat ulang halaman.", null,
                    { judul: "Gagal Memuat", ikon: "fa-wifi-slash", reload: true, keterangan: "Data anak didik tidak ditampilkan sebelum tautan berhasil diperiksa." });
            } else {
                blokirAksesOrtu(res.message || "Tautan pemantauan tidak valid.", null,
                    { judul: "Tautan Tidak Valid", ikon: "fa-ban", keterangan: "Tautan rusak atau tidak lengkap. Silakan minta tautan baru kepada Wali Kelas." });
            }
            return;
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

const THEME_KEY = "app_theme";
const THEME_COLOR_LIGHT = "#ffffff";
const THEME_COLOR_DARK = "#0f172a";
let themeMediaBound = false;

function getThemePref() {
    try {
        const v = localStorage.getItem(THEME_KEY);
        return v === "light" || v === "dark" ? v : "system";
    } catch (e) {
        return "system";
    }
}

function resolveTheme(pref) {
    if (pref === "system") {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return pref === "dark" ? "dark" : "light";
}

function themeOptionButton(value, icon, label) {
    const aktif = getThemePref() === value;
    const cls = aktif ? "bg-blue-600 text-white shadow-sm" : "text-slate-600";
    return `<button type="button" data-theme-opt="${value}" onclick="setThemePref('${value}')" aria-pressed="${aktif}" class="${cls} flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition"><i class="fas ${icon}" aria-hidden="true"></i><span>${label}</span></button>`;
}

function syncThemeUI(pref, resolved) {
    const dark = resolved === "dark";
    const label = dark ? "Ganti ke mode terang" : "Ganti ke mode gelap";
    ["btn-theme-login"].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.setAttribute("aria-label", label);
        btn.setAttribute("title", label);
        const icon = btn.querySelector("i");
        if (icon) {
            icon.classList.remove("fa-moon", "fa-sun");
            icon.classList.add(dark ? "fa-sun" : "fa-moon");
        }
    });
    document.querySelectorAll("[data-theme-opt]").forEach(btn => {
        const aktif = btn.getAttribute("data-theme-opt") === pref;
        btn.setAttribute("aria-pressed", String(aktif));
        btn.classList.toggle("bg-blue-600", aktif);
        btn.classList.toggle("text-white", aktif);
        btn.classList.toggle("shadow-sm", aktif);
        btn.classList.toggle("text-slate-600", !aktif);
    });
}

function applyTheme(pref) {
    pref = pref || getThemePref();
    const resolved = resolveTheme(pref);
    const dark = resolved === "dark";
    document.documentElement.classList.toggle("dark", dark);
    if (document.body) document.body.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
    syncThemeUI(pref, resolved);
    try {
        window.dispatchEvent(new CustomEvent("themechange", { detail: { dark: dark } }));
    } catch (e) { }
}

function setThemePref(pref) {
    try {
        if (pref === "light" || pref === "dark") localStorage.setItem(THEME_KEY, pref);
        else localStorage.removeItem(THEME_KEY);
    } catch (e) { }
    applyTheme(pref === "light" || pref === "dark" ? pref : "system");
}

function toggleDarkMode() {
    setThemePref(document.body.classList.contains("dark") ? "light" : "dark");
}

function initTheme() {
    applyTheme();
    if (!themeMediaBound && window.matchMedia) {
        themeMediaBound = true;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => { if (getThemePref() === "system") applyTheme(); };
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else if (mq.addListener) mq.addListener(onChange);
    }
}

try { initTheme(); } catch (e) { }

const FONT_SCALE_KEY = "app_font_scale";
const FONT_SCALE_OPSI = { normal: "", besar: "112.5%", "sangat-besar": "125%" };

function getFontScalePref() {
    try {
        const v = localStorage.getItem(FONT_SCALE_KEY);
        return Object.prototype.hasOwnProperty.call(FONT_SCALE_OPSI, v) ? v : "normal";
    } catch (e) {
        return "normal";
    }
}

function fontScaleOptionButton(value, label) {
    const aktif = getFontScalePref() === value;
    const cls = aktif ? "bg-blue-600 text-white shadow-sm" : "text-slate-600";
    return `<button type="button" data-fontscale-opt="${value}" onclick="setFontScalePref('${value}')" aria-pressed="${aktif}" class="${cls} flex items-center justify-center py-2 rounded-lg text-xs font-bold transition text-center">${label}</button>`;
}

function applyFontScale(pref) {
    pref = Object.prototype.hasOwnProperty.call(FONT_SCALE_OPSI, pref) ? pref : getFontScalePref();
    const root = document.documentElement;
    root.style.fontSize = FONT_SCALE_OPSI[pref];
    if (pref === "normal") root.removeAttribute("data-font-scale");
    else root.setAttribute("data-font-scale", pref);
    document.querySelectorAll("[data-fontscale-opt]").forEach(btn => {
        const aktif = btn.getAttribute("data-fontscale-opt") === pref;
        btn.setAttribute("aria-pressed", String(aktif));
        btn.classList.toggle("bg-blue-600", aktif);
        btn.classList.toggle("text-white", aktif);
        btn.classList.toggle("shadow-sm", aktif);
        btn.classList.toggle("text-slate-600", !aktif);
    });
}

function setFontScalePref(pref) {
    if (!Object.prototype.hasOwnProperty.call(FONT_SCALE_OPSI, pref)) pref = "normal";
    try {
        if (pref === "normal") localStorage.removeItem(FONT_SCALE_KEY);
        else localStorage.setItem(FONT_SCALE_KEY, pref);
    } catch (e) { }
    applyFontScale(pref);
}

try { applyFontScale(); } catch (e) { }

let pollBerjalan = false;
let pollVisibilitasTerpasang = false;

function startDataPolling() {
    if (dataPollingInterval) clearInterval(dataPollingInterval);

    dataPollingInterval = setInterval(pollDataSekali, DATA_POLL_INTERVAL_MS);
    if (!pollVisibilitasTerpasang) {
        pollVisibilitasTerpasang = true;
        document.addEventListener("visibilitychange", () => { if (!document.hidden) pollDataSekali(); });
    }
}

async function pollDataSekali() {
    if (pollBerjalan) return;
    pollBerjalan = true;
    try {
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
                    if (appState.user.role === "siswa" && typeof muatMisiHariIni === "function") await muatMisiHariIni();
                    if (appState.user.role === "siswa" && typeof tatibMuatSaya === "function") await tatibMuatSaya(true);
                    break;
                case "absensi": await loadAbsensiData(true); break;
                case "kebiasaan": await loadKebiasaanData(true); break;
                case "jurnal": await loadJurnalData(true); break;
                case "karakter": await loadKeagamaanData(true); break;
                case "akademik": await loadAkademikData(true); break;
                case "pembinaan": await loadPembinaanData(true); break;
                case "tatib": await tatibSegarkanDiam(); break;
                case "laporan":
                    await loadLaporanRekap(true);
                    if (typeof tlSegarkanDiam === "function") await tlSegarkanDiam();
                    break;
            }
            _lastVersiSheet = sigVersi;
        } catch (e) {
            console.error("Polling error:", e);
        }
    } finally {
        pollBerjalan = false;
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('ServiceWorker Aktif:', reg.scope))
            .catch(err => console.log('Registrasi ServiceWorker Gagal:', err));
    });
}