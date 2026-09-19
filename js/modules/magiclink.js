async function generateAndShareMagicLink() {
    const detail = appState.activeSiswaDetail;
    const siswa = detail ? detail.siswa : null;

    if (!siswa) {
        Swal.fire({
            icon: 'warning',
            title: 'Siswa Belum Dipilih',
            text: 'Silakan buka detail profil siswa terlebih dahulu.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    showLoading("Membuat Magic Link Orang Tua...");
    let magicToken = null;
    let magicUrl = "";

    try {
        const res = await apiCall("createMagicLink", { siswa_id: siswa.id }, false);
        if (res && res.status === "success" && res.token) {
            magicToken = res.token;
        }
    } catch (e) {
        console.warn("Gagal request token dari server, menggunakan token darurat lokal:", e);
    }

    hideLoading();

    // Jika API server belum support atau offline, buat token fallback berbasis encoding waktu
    if (!magicToken) {
        const payload = {
            sId: siswa.id,
            exp: Date.now() + (15 * 60 * 1000)
        };
        magicToken = btoa(JSON.stringify(payload));
    }

    const currentUrl = window.location.href.split('?')[0];
    magicUrl = `${currentUrl}?magic_token=${encodeURIComponent(magicToken)}`;

    const phoneRaw = safeStr(siswa.no_hp_ortu || '').replace(/[^0-9]/g, '');
    let phoneFormatted = phoneRaw;
    if (phoneFormatted.startsWith('0')) {
        phoneFormatted = '62' + phoneFormatted.substring(1);
    }

    const waMessage = encodeURIComponent(
        `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
        `Yth. Orang Tua / Wali dari ananda *${siswa.nama}*.\n` +
        `Berikut kami bagikan tautan resmi Pemantauan Anak Wali SMPN 1 Talaga Jaya:\n\n` +
        `${magicUrl}\n\n` +
        `⏱️ *Catatan Keamanan:* Tautan ini bersifat rahasia dan hanya dapat diakses selama *15 menit* sejak dibagikan.\n\n` +
        `Terima kasih.`
    );

    const waLink = phoneFormatted ? `https://api.whatsapp.com/send?phone=${phoneFormatted}&text=${waMessage}` : null;

    const modalBox = document.getElementById("modal-content-box");
    const modalContainer = document.getElementById("modal-container");
    if (!modalBox || !modalContainer) return;

    modalBox.innerHTML = `
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                    <i class="fas fa-magic"></i>
                </div>
                <div>
                    <h3 class="text-sm font-bold text-slate-800">Bagikan Magic Link Orang Tua</h3>
                    <p class="text-[11px] text-slate-400">Siswa: ${escapeHtml(siswa.nama)}</p>
                </div>
            </div>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>

        <div class="space-y-4">
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 space-y-1.5">
                <div class="flex items-center gap-1.5 font-bold">
                    <i class="fas fa-clock text-amber-600"></i>
                    <span>Kedaluwarsa Otomatis: 15 Menit</span>
                </div>
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

    // Sembunyikan tombol generate magic link dan cetak saat diakses oleh ortu
    const roleButtons = document.querySelectorAll("[data-role-visible]");
    roleButtons.forEach(el => el.classList.add("hidden"));

    openProfilSiswa(detailData);
    switchView("profil-siswa");

    // Pastikan tombol kembali di profil disembunyikan
    const backBtn = document.getElementById("btn-back-profil");
    if (backBtn) backBtn.classList.add("hidden");
}

function showExpiredMagicLinkScreen(message = "Tautan Magic Link telah kedaluwarsa.") {
    const loginView = document.getElementById("view-login");
    if (!loginView) return;

    loginView.classList.remove("hidden");
    loginView.classList.add("active");

    loginView.innerHTML = `
        <div class="w-full max-w-sm px-4">
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-md border border-rose-100 mb-4">
                    <i class="fas fa-hourglass-end"></i>
                </div>
                <h1 class="text-xl font-black text-slate-800 mb-1">Akses Kedaluwarsa</h1>
                <p class="text-xs text-slate-500">Pemantauan Anak Wali • SMPN 1 Talaga Jaya</p>
            </div>

            <div class="bg-surface p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
                <div class="bg-rose-50 text-rose-700 text-xs p-3 rounded-2xl border border-rose-100 leading-relaxed font-medium">
                    <i class="fas fa-shield-alt mr-1 text-rose-600"></i> ${escapeHtml(message || 'Tautan ini telah melewati batas waktu aman 15 menit.')}
                </div>
                <p class="text-xs text-slate-500 leading-relaxed">
                    Untuk menjaga privasi dan keamanan data anak didik, tautan pemantauan orang tua dibatasi maksimal 15 menit. Silakan hubungi Wali Kelas jika Anda memerlukan tautan pemantauan baru.
                </p>
                <div class="pt-2">
                    <button onclick="window.location.href = window.location.pathname"
                        class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2">
                        <i class="fas fa-sign-in-alt"></i> Masuk Halaman Login
                    </button>
                </div>
            </div>
        </div>
    `;
}