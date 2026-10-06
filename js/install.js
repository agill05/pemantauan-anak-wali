const INSTALL_FLAG_KEY = "anak_wali_app_terpasang";
let _deferredInstallPrompt = null;
let _installEventSeen = false;

function isAppInstalled() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
}

function getInstallFlag() {
    try { return localStorage.getItem(INSTALL_FLAG_KEY) === "1"; } catch (e) { return false; }
}

function setInstallFlag(on) {
    try {
        if (on) localStorage.setItem(INSTALL_FLAG_KEY, "1");
        else localStorage.removeItem(INSTALL_FLAG_KEY);
    } catch (e) { }
}

function getInstallPlatform() {
    const ua = navigator.userAgent || "";
    const touch = (navigator.maxTouchPoints || 0) > 0;
    if (/FBAN|FBAV|Instagram|Line\/|TikTok|MicroMessenger|; wv\)/i.test(ua)) return "inapp";
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? "ios-lain" : "ios-safari";
    if (/Android/i.test(ua)) return /Chrome\/|SamsungBrowser|EdgA|OPR\//.test(ua) ? "android" : "android-lain";
    if (touch && /X11|Linux/.test(ua)) return "android";
    return "desktop";
}

function shouldShowInstall() {
    if (isAppInstalled()) return false;
    if (getInstallFlag()) return false;
    const platform = getInstallPlatform();
    if (platform === "desktop") return false;
    if (platform === "android") return _installEventSeen;
    return true;
}

function updateInstallButtons() {
    const tampil = shouldShowInstall();
    const login = document.getElementById("btn-install-login");
    const sidebar = document.getElementById("btn-install-sidebar");
    if (login) login.hidden = !tampil;
    if (sidebar) sidebar.classList.toggle("hidden", !tampil);
}

function showInstallGuide() {
    const platform = getInstallPlatform();
    const panduanAndroid = {
        judul: "Cara Install di Android",
        html: "<ol style='text-align:left;margin:0 0 0 18px;list-style:decimal'><li>Ketuk menu <b>&#8942;</b> (titik tiga) di pojok kanan atas browser.</li><li>Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</li><li>Ketuk <b>Instal</b>. Ikon aplikasi muncul di layar utama.</li></ol>"
    };
    const langkah = {
        "inapp": {
            judul: "Buka di Chrome Dulu",
            html: "<p>Halaman ini terbuka di dalam aplikasi lain (misalnya WhatsApp), jadi belum bisa di-install.</p><ol style='text-align:left;margin:12px 0 0 18px;list-style:decimal'><li>Ketuk menu <b>&#8942;</b> (titik tiga) atau ikon bagikan.</li><li>Pilih <b>Buka di Chrome</b> atau <b>Buka di browser</b>.</li><li>Setelah terbuka di Chrome, tekan <b>Install Aplikasi</b> lagi.</li></ol>"
        },
        "ios-safari": {
            judul: "Cara Install di iPhone / iPad",
            html: "<ol style='text-align:left;margin:0 0 0 18px;list-style:decimal'><li>Ketuk ikon <b>Bagikan</b> (kotak dengan panah ke atas) di bagian bawah Safari.</li><li>Gulir lalu pilih <b>Tambah ke Layar Utama</b>.</li><li>Ketuk <b>Tambah</b>. Ikon aplikasi muncul di layar utama.</li></ol>"
        },
        "ios-lain": {
            judul: "Buka di Safari Dulu",
            html: "<p>Di iPhone / iPad, aplikasi hanya bisa di-install lewat <b>Safari</b>.</p><ol style='text-align:left;margin:12px 0 0 18px;list-style:decimal'><li>Salin alamat halaman ini lalu buka di <b>Safari</b>.</li><li>Ketuk ikon <b>Bagikan</b>, pilih <b>Tambah ke Layar Utama</b>.</li><li>Ketuk <b>Tambah</b>.</li></ol>"
        }
    }[platform] || panduanAndroid;

    if (typeof Swal === "undefined") {
        alert(langkah.judul);
        return;
    }
    Swal.fire({ title: langkah.judul, html: langkah.html, icon: "info", confirmButtonColor: "#2563eb", confirmButtonText: "Mengerti" });
}

async function installApp() {
    if (!_deferredInstallPrompt) {
        showInstallGuide();
        return;
    }
    const prompt = _deferredInstallPrompt;
    _deferredInstallPrompt = null;
    try {
        prompt.prompt();
        await prompt.userChoice;
    } catch (e) {
        showInstallGuide();
    }
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredInstallPrompt = e;
    _installEventSeen = true;
    setInstallFlag(false);
    updateInstallButtons();
});

window.addEventListener("appinstalled", () => {
    _deferredInstallPrompt = null;
    setInstallFlag(true);
    updateInstallButtons();
    if (typeof showToast === "function") showToast("Aplikasi berhasil di-install!");
});

if (window.matchMedia) {
    const mq = window.matchMedia("(display-mode: standalone)");
    if (mq.addEventListener) mq.addEventListener("change", updateInstallButtons);
}

if (isAppInstalled()) setInstallFlag(true);

if (navigator.getInstalledRelatedApps) {
    navigator.getInstalledRelatedApps()
        .then((apps) => {
            if (apps && apps.length > 0 && !_installEventSeen) {
                setInstallFlag(true);
                updateInstallButtons();
            }
        })
        .catch(() => { });
}

updateInstallButtons();