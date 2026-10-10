const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const MAGIC_LINK_KEY = "magic_link_aktif_";
let magicLinkTimer = null;

function decodeMagicExpiry(token) {
    try {
        const b64 = String(token).split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
        const exp = Number(atob(b64).split("|")[1]);
        return exp > 0 ? exp : 0;
    } catch (e) { return 0; }
}

function getActiveMagicLink(siswaId) {
    try {
        const raw = JSON.parse(localStorage.getItem(MAGIC_LINK_KEY + siswaId) || "null");
        if (raw && raw.url && raw.expiry > Date.now()) return raw;
        localStorage.removeItem(MAGIC_LINK_KEY + siswaId);
    } catch (e) { }
    return null;
}

function saveActiveMagicLink(siswaId, url, expiry) {
    try { localStorage.setItem(MAGIC_LINK_KEY + siswaId, JSON.stringify({ url, expiry })); } catch (e) { }
}

function hapusSemuaMagicLinkLokal() {
    try {
        Object.keys(localStorage)
            .filter(k => k.indexOf(MAGIC_LINK_KEY) === 0)
            .forEach(k => localStorage.removeItem(k));
    } catch (e) { }
}

function formatSisaMagic(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function formatJamWita(ts) {
    return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" })
        .replace(".", ":") + " WITA";
}

function refreshMagicLinkButton() {
    clearInterval(magicLinkTimer);
    magicLinkTimer = null;
    const btn = document.getElementById("btn-magiclink-profil");
    const siswa = appState.activeSiswaDetail && appState.activeSiswaDetail.siswa;
    if (!btn || !siswa) return;

    const setIdle = () => {
        btn.classList.remove("bg-emerald-600", "hover:bg-emerald-700");
        btn.classList.add("bg-amber-600", "hover:bg-amber-700");
        btn.title = "";
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> Kirim Link ke Ortu (15 Menit)`;
    };

    const aktif = getActiveMagicLink(siswa.id);
    if (!aktif) { setIdle(); return; }

    btn.classList.remove("bg-amber-600", "hover:bg-amber-700");
    btn.classList.add("bg-emerald-600", "hover:bg-emerald-700");
    btn.title = "Link masih aktif. Klik untuk melihat atau menyalin. Link baru bisa dibuat setelah waktu habis.";

    const tick = () => {
        const sisa = aktif.expiry - Date.now();
        const live = document.getElementById("magic-link-countdown");
        if (sisa <= 0) {
            clearInterval(magicLinkTimer);
            magicLinkTimer = null;
            try { localStorage.removeItem(MAGIC_LINK_KEY + siswa.id); } catch (e) { }
            if (live) live.textContent = "Kedaluwarsa";
            setIdle();
            return;
        }
        const teks = formatSisaMagic(sisa);
        btn.innerHTML = `<i class="fas fa-hourglass-half"></i> Link aktif: <span class="font-mono">${teks}</span>`;
        if (live) live.textContent = teks;
    };
    tick();
    magicLinkTimer = setInterval(tick, 1000);
}

async function generateAndShareMagicLink() {
    const detail = appState.activeSiswaDetail;
    const siswa = detail ? detail.siswa : null;

    if (!siswa) {
        Swal.fire({ icon: 'warning', title: 'Siswa Belum Dipilih', text: 'Silakan buka detail profil siswa terlebih dahulu.', confirmButtonColor: '#2563eb' });
        return;
    }

    if (!canWrite("magiclink", siswa)) {
        Swal.fire({ icon: 'info', title: 'Tidak Diizinkan', text: 'Link orang tua hanya dapat dibuat oleh wali kelas, mentor siswa, atau admin.', confirmButtonColor: '#2563eb' });
        return;
    }

    const aktif = getActiveMagicLink(siswa.id);
    if (aktif) {
        tampilkanModalMagicLink(siswa, aktif.url, aktif.expiry);
        return;
    }

    showLoading("Menyiapkan Link Orang Tua...");
    let magicToken = null;
    let errorMessage = "";

    try {
        const res = await apiCall("generateMagicLink", { siswa_id: siswa.id }, false);
        if (res && res.status === "success" && (res.magic_token || res.token)) {
            magicToken = res.magic_token || res.token;
        } else if (res && res.status === "error") {
            errorMessage = res.message || "Akses ditolak.";
        } else {
            errorMessage = "Tidak ada respons dari server. Periksa koneksi internet lalu coba lagi.";
        }
    } catch (e) {
        console.error("Gagal request magic link:", e);
        errorMessage = "Terjadi kesalahan saat menghubungi server. Coba lagi.";
    }

    hideLoading();

    if (!magicToken) {
        Swal.fire({ icon: 'error', title: 'Gagal Membuat Link', text: errorMessage || 'Link tidak dapat dibuat.', confirmButtonColor: '#2563eb' });
        return;
    }

    const expiry = decodeMagicExpiry(magicToken) || (Date.now() + MAGIC_LINK_TTL_MS);
    const magicUrl = `${window.location.href.split('?')[0]}?magic_token=${encodeURIComponent(magicToken)}`;

    saveActiveMagicLink(siswa.id, magicUrl, expiry);
    tampilkanModalMagicLink(siswa, magicUrl, expiry);
    refreshMagicLinkButton();
}

function tampilkanModalMagicLink(siswa, magicUrl, expiry) {
    const modalBox = document.getElementById("modal-content-box");
    const modalContainer = document.getElementById("modal-container");
    if (!modalBox || !modalContainer) return;

    const dibuat = expiry - MAGIC_LINK_TTL_MS;
    const phoneFormatted = toWhatsAppNumber(siswa.no_hp_ortu);

    const waMessage = encodeURIComponent(
        `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
        `Yth. Orang Tua / Wali dari ananda *${siswa.nama}*.\n` +
        `Berikut kami bagikan tautan resmi Pemantauan Anak Wali SMPN 1 Talaga Jaya:\n\n` +
        `${magicUrl}\n\n` +
        `⏱️ *Catatan Keamanan:* Tautan ini bersifat rahasia dan berlaku sampai pukul *${formatJamWita(expiry)}*.\n\n` +
        `Terima kasih.` +
        (isGuruUser() && appState.user ? `\n\nHormat kami,\n*${appState.user.nama}*\n${getPeranTtdText(siswa)} SMPN 1 Talaga Jaya` : ``)
    );

    const waLink = phoneFormatted ? `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${waMessage}` : null;

    modalBox.innerHTML = `
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-slate-800">Kirim Link ke Orang Tua</h3>
                    <p class="text-[11px] text-slate-400">Siswa: ${escapeHtml(siswa.nama)}</p>
                </div>
            </div>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>

        <div class="space-y-4">
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 space-y-1.5">
                <div class="flex items-center justify-between gap-2 font-bold">
                    <span class="flex items-center gap-1.5"><i class="fas fa-clock text-amber-600"></i> Sisa waktu aktif</span>
                    <span id="magic-link-countdown" class="font-mono text-sm">${formatSisaMagic(expiry - Date.now())}</span>
                </div>
                <p class="text-[11px] text-amber-700">Dibuat: ${formatJamWita(dibuat)}</p>
                <p class="text-[11px] text-amber-700">Berakhir: ${formatJamWita(expiry)}</p>
                <p class="text-[11px] text-amber-700">Link baru bisa dibuat setelah ${formatJamWita(expiry)}.</p>
                <p class="text-amber-700 leading-relaxed text-[11px]">
                    Orang tua dapat langsung memantau capaian kehadiran, karakter 7 kebiasaan, keagamaan, dan nilai anak tanpa perlu login akun.
                </p>
            </div>

            <div>
                <label for="magic-link-url-input" class="block text-xs font-bold text-slate-500 uppercase mb-1">Tautan Akses Cepat</label>
                <div class="flex items-center gap-2">
                    <input type="text" id="magic-link-url-input" readonly value="${magicUrl}"
                        class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 outline-none select-all font-mono">
                    <button onclick="copyMagicLinkClipboard()" id="btn-copy-magic-link"
                        class="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow-sm">
                        <i class="fas fa-copy"></i> Salin
                    </button>
                </div>
            </div>

            <div class="pt-2">
                ${waLink ? `
                <a href="${waLink}" target="_blank" onclick="closeModal()"
                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition">
                    <i class="fab fa-whatsapp text-base"></i> Kirim WhatsApp ke Orang Tua
                </a>
                ` : `
                <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                    <i class="fas fa-info-circle mr-1"></i> Nomor WhatsApp orang tua belum terdaftar pada data siswa. Salin tautan di atas secara manual.
                </div>
                `}
            </div>
        </div>
    `;

    modalContainer.classList.remove("hidden");
}

function copyMagicLinkClipboard() {
    const input = document.getElementById("magic-link-url-input");
    const btn = document.getElementById("btn-copy-magic-link");
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        if (btn) {
            btn.innerHTML = `<i class="fas fa-check text-emerald-400"></i> Disalin!`;
            setTimeout(() => {
                btn.innerHTML = `<i class="fas fa-copy"></i> Salin`;
            }, 2000);
        }
        showToast("Tautan berhasil disalin ke clipboard!");
    }).catch(() => {
        showToast("Gagal menyalin tautan secara otomatis.", "warning");
    });
}

function renderMagicLinkProfilView(detailData) {
    if (!detailData) return;

    document.getElementById("view-login")?.classList.add("hidden");
    document.getElementById("main-header")?.classList.remove("hidden");
    document.getElementById("main-content")?.classList.remove("hidden");
    document.getElementById("btn-toggle-sidebar")?.classList.add("hidden");
    document.getElementById("btn-refresh-header")?.classList.add("hidden");
    document.getElementById("btn-notif-header")?.classList.add("hidden");
    document.getElementById("bottom-nav")?.classList.add("hidden");
    document.getElementById("btn-back-profil")?.classList.add("hidden");

    const roleButtons = document.querySelectorAll("[data-role-visible]");
    roleButtons.forEach(el => el.classList.add("hidden"));

    openProfilSiswa(detailData);
    switchView("profil-siswa");

    const backBtn = document.getElementById("btn-back-profil");
    if (backBtn) backBtn.classList.add("hidden");
}

let magicExpiryTimer = null;
let magicClockOffset = 0;

// Dipanggil sekali setelah tautan valid dibuka. Saat waktu habis, halaman diganti layar kedaluwarsa.
function startMagicExpiryWatch(token, serverTime, kontak) {
    clearInterval(magicExpiryTimer);
    const expiry = decodeMagicExpiry(token);
    if (!expiry) return;
    magicClockOffset = serverTime ? (Number(serverTime) - Date.now()) : 0;

    const cek = () => {
        if (Date.now() + magicClockOffset < expiry) return;
        clearInterval(magicExpiryTimer);
        magicExpiryTimer = null;
        document.removeEventListener("visibilitychange", cek);
        blokirAksesOrtu("Tautan pemantauan sudah kedaluwarsa (berlaku 15 menit). Silakan minta tautan baru kepada Wali Kelas.", kontak);
    };
    magicExpiryTimer = setInterval(cek, 1000);
    document.addEventListener("visibilitychange", cek);
}

// Blokir total akses ortu: sembunyikan seluruh app shell, hapus data di memori, tampilkan layar blokir.
// Wajib lepas class "has-session": CSS-nya memaksa header/konten/nav tampil dan menyembunyikan #view-login.
function blokirAksesOrtu(message, kontak = null, opsi = {}) {
    clearInterval(magicExpiryTimer);
    magicExpiryTimer = null;
    try { if (typeof closeModal === "function") closeModal(); } catch (e) { }
    try { if (window.Swal && Swal.isVisible()) Swal.close(); } catch (e) { }

    document.documentElement.classList.remove("has-session");
    ["main-header", "main-content", "bottom-nav", "sidebar", "btn-toggle-sidebar"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
    });
    try { appState.user = null; appState.token = null; } catch (e) { }

    showExpiredMagicLinkScreen(message, kontak, opsi);
}

function showExpiredMagicLinkScreen(message = "Tautan pemantauan sudah kedaluwarsa.", kontak = null, opsi = {}) {
    const loginView = document.getElementById("view-login");
    if (!loginView) return;

    loginView.classList.remove("hidden");
    loginView.classList.add("active");

    const judul = opsi.judul || "Akses Kedaluwarsa";
    const ikon = opsi.ikon || "fa-hourglass-end";
    const keterangan = opsi.keterangan ||
        "Untuk menjaga privasi dan keamanan data anak didik, tautan pemantauan dibatasi maksimal 15 menit. Silakan hubungi Wali Kelas untuk meminta tautan baru.";

    const waNomor = kontak && kontak.wali_hp ? toWhatsAppNumber(kontak.wali_hp) : "";
    const waTeks = encodeURIComponent(
        `Assalamu'alaikum.\n\nSaya orang tua/wali dari ananda *${(kontak && kontak.siswa_nama) || ""}*. ` +
        `Tautan pemantauan sudah kedaluwarsa. Mohon dikirimkan tautan baru. Terima kasih.`
    );
    const waLink = waNomor ? `https://api.whatsapp.com/send?phone=${waNomor}&text=${waTeks}` : "";
    const namaWali = kontak && kontak.wali_nama ? escapeHtml(kontak.wali_nama) : "Wali Kelas";

    let aksi;
    if (opsi.reload) {
        aksi = `<button onclick="window.location.reload()"
                class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
                <i class="fas fa-rotate-right"></i> Muat Ulang
            </button>`;
    } else if (waLink) {
        aksi = `<a href="${waLink}" target="_blank" rel="noopener"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2">
                <i class="fab fa-whatsapp text-base"></i> Hubungi ${namaWali} via WhatsApp
            </a>`;
    } else {
        aksi = `<p class="text-[11px] text-slate-400">Silakan hubungi Wali Kelas atau sekolah.</p>`;
    }

    loginView.innerHTML = `
        <div class="w-full max-w-sm px-4">
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-md border border-rose-100 mb-4">
                    <i class="fas ${ikon}"></i>
                </div>
                <h1 class="text-xl font-black text-slate-800 mb-1">${escapeHtml(judul)}</h1>
                <p class="text-xs text-slate-500">Pemantauan Anak Wali – SMPN 1 Talaga Jaya</p>
            </div>

            <div class="bg-surface p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
                <div class="bg-rose-50 text-rose-700 text-xs p-3 rounded-2xl border border-rose-100 leading-relaxed font-medium">
                    <i class="fas fa-shield-alt mr-1 text-rose-600"></i> ${escapeHtml(message || "Tautan ini telah melewati batas waktu aman 15 menit.")}
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">${escapeHtml(keterangan)}</p>
                <div class="pt-2">${aksi}</div>
            </div>
        </div>
    `;
}
