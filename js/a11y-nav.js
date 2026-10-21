(function () {
    "use strict";

    var EXIT_WINDOW_MS = 2000;
    var INERT_IDS = ["main-content", "main-header", "bottom-nav", "app-sidebar", "sidebar-backdrop"];
    var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    function sudahLogin() {
        try {
            return typeof appState !== "undefined" && !!appState && !!appState.user;
        } catch (e) {
            return false;
        }
    }

    var NAV = { ready: false, cur: null, skip: 0, silent: false, exitArmed: false, exitTimer: null };

    function viewAktif() {
        var el = document.querySelector(".view-section.active");
        return el ? el.id.replace("view-", "") : null;
    }

    function navInit(viewId) {
        if (NAV.ready || !window.history || !history.pushState) return;
        NAV.ready = true;
        try {
            history.replaceState({ nav: "root" }, "");
            history.pushState({ nav: "view", v: viewId }, "");
            NAV.cur = viewId;
        } catch (e) {
            NAV.ready = false;
        }
    }

    function navReset() {
        NAV.ready = false;
        NAV.cur = null;
        NAV.exitArmed = false;
        clearTimeout(NAV.exitTimer);
    }

    function bungkusSwitchView() {
        var asli = window.switchView;
        if (typeof asli !== "function" || asli.__navWrapped) return;

        var bungkus = function (viewId) {
            var hasil = asli.apply(this, arguments);
            try {
                if (NAV.silent || !sudahLogin()) return hasil;
                var aktif = viewAktif();
                if (!aktif || aktif === "login") return hasil;
                if (!NAV.ready) {
                    navInit(aktif);
                } else if (aktif !== NAV.cur) {
                    history.pushState({ nav: "view", v: aktif }, "");
                    NAV.cur = aktif;
                }
            } catch (e) { }
            return hasil;
        };
        bungkus.__navWrapped = true;
        window.switchView = bungkus;
    }

    function tutupLapisanTeratas() {
        try {
            if (window.Swal && typeof Swal.isVisible === "function" && Swal.isVisible()) {
                var pop = typeof Swal.getPopup === "function" ? Swal.getPopup() : null;
                if (pop && !pop.classList.contains("swal2-toast")) {
                    Swal.close();
                    return true;
                }
            }
        } catch (e) { }

        var modal = document.getElementById("modal-container");
        if (modal && !modal.classList.contains("hidden")) {
            if (modal.dataset.forceLock !== "true" && typeof window.closeModal === "function") {
                window.closeModal();
            }
            return true;
        }

        var sidebar = document.getElementById("app-sidebar");
        if (sidebar && !sidebar.classList.contains("-translate-x-full") && typeof window.toggleSidebar === "function") {
            window.toggleSidebar(false);
            return true;
        }
        return false;
    }

    function onPopState(e) {
        if (NAV.skip > 0) {
            NAV.skip--;
            return;
        }
        if (!NAV.ready || !sudahLogin()) return;

        var st = e.state || {};

        if (tutupLapisanTeratas()) {
            NAV.skip++;
            try { history.forward(); } catch (err) { NAV.skip = 0; }
            return;
        }

        if (st.nav === "view" && st.v) {
            NAV.cur = st.v;
            NAV.silent = true;
            try { window.switchView(st.v); } finally { NAV.silent = false; }
            return;
        }

        if (st.nav === "root") {
            if (NAV.exitArmed) {
                NAV.exitArmed = false;
                clearTimeout(NAV.exitTimer);
                NAV.skip++;
                try { history.back(); } catch (err) { NAV.skip = 0; }
                return;
            }
            NAV.exitArmed = true;
            clearTimeout(NAV.exitTimer);
            NAV.exitTimer = setTimeout(function () { NAV.exitArmed = false; }, EXIT_WINDOW_MS);
            try {
                history.pushState({ nav: "view", v: NAV.cur || viewAktif() || "dashboard" }, "");
            } catch (err) { }
            if (typeof window.showToast === "function") {
                window.showToast("Tekan Kembali sekali lagi untuk keluar", "info");
            }
        }
    }

    var lastFocus = null;
    var modalTerbuka = false;

    function modalEl() { return document.getElementById("modal-container"); }
    function boxEl() { return document.getElementById("modal-content-box"); }

    function labelModal() {
        var box = boxEl();
        if (!box) return;
        var judul = box.querySelector("h1,h2,h3,h4");
        if (judul) {
            if (!judul.id) judul.id = "modal-title";
            box.setAttribute("aria-labelledby", judul.id);
            box.removeAttribute("aria-label");
        } else {
            box.removeAttribute("aria-labelledby");
            box.setAttribute("aria-label", "Dialog");
        }
    }

    function setInert(aktif) {
        INERT_IDS.forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            if (aktif) el.setAttribute("inert", "");
            else el.removeAttribute("inert");
        });
    }

    function terlihat(el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function modalDibuka() {
        var box = boxEl();
        if (!box) return;
        var aktif = document.activeElement;
        lastFocus = aktif && aktif !== document.body ? aktif : null;

        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        if (!box.hasAttribute("tabindex")) box.setAttribute("tabindex", "-1");
        box.style.outline = "none";
        labelModal();
        setInert(true);

        requestAnimationFrame(function () {
            var m = modalEl();
            if (m && !m.classList.contains("hidden")) {
                try { box.focus({ preventScroll: true }); } catch (e) { }
            }
        });
    }

    function modalDitutup() {
        setInert(false);
        var target = lastFocus;
        lastFocus = null;
        if (target && target.isConnected && typeof target.focus === "function") {
            try { target.focus({ preventScroll: true }); } catch (e) { }
        }
    }

    function sinkronModal() {
        var m = modalEl();
        if (!m) return;
        var buka = !m.classList.contains("hidden");
        if (buka && !modalTerbuka) {
            modalTerbuka = true;
            modalDibuka();
        } else if (!buka && modalTerbuka) {
            modalTerbuka = false;
            modalDitutup();
        }
    }

    function onKeyDown(e) {
        var m = modalEl();
        var modalBuka = m && !m.classList.contains("hidden");
        var swalBuka = false;
        try {
            swalBuka = !!(window.Swal && typeof Swal.isVisible === "function" && Swal.isVisible());
        } catch (err) { }

        if (e.key === "Escape") {
            if (swalBuka) return;
            if (modalBuka) {
                if (m.dataset.forceLock !== "true" && typeof window.closeModal === "function") {
                    e.preventDefault();
                    window.closeModal();
                }
                return;
            }
            var sb = document.getElementById("app-sidebar");
            if (sb && !sb.classList.contains("-translate-x-full") && typeof window.toggleSidebar === "function") {
                e.preventDefault();
                window.toggleSidebar(false);
            }
            return;
        }

        if (e.key === "Tab" && modalBuka && !swalBuka) {
            var box = boxEl();
            if (!box) return;
            var daftar = Array.prototype.filter.call(box.querySelectorAll(FOCUSABLE), terlihat);
            if (!daftar.length) {
                e.preventDefault();
                return;
            }
            var awal = daftar[0];
            var akhir = daftar[daftar.length - 1];
            var aktif = document.activeElement;
            if (e.shiftKey && (aktif === awal || aktif === box || !box.contains(aktif))) {
                e.preventDefault();
                akhir.focus();
            } else if (!e.shiftKey && (aktif === akhir || !box.contains(aktif))) {
                e.preventDefault();
                awal.focus();
            }
        }
    }

    function pasang() {
        bungkusSwitchView();
        window.addEventListener("popstate", onPopState);
        document.addEventListener("keydown", onKeyDown);

        var m = modalEl();
        if (m && window.MutationObserver) {
            new MutationObserver(sinkronModal).observe(m, { attributes: true, attributeFilter: ["class"] });
            var box = boxEl();
            if (box) {
                new MutationObserver(function () {
                    if (modalTerbuka) labelModal();
                }).observe(box, { childList: true });
            }
            sinkronModal();
        }

        if (window.MutationObserver) {
            new MutationObserver(function () {
                if (!document.documentElement.classList.contains("has-session")) navReset();
            }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        }
    }

    bungkusSwitchView();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", pasang);
    } else {
        pasang();
    }
})();