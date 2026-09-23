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

function sortSiswa(listSiswa) {
    return [...listSiswa].sort((a, b) => {
        const noA = (a.no_absen !== undefined && a.no_absen !== null && String(a.no_absen).trim() !== "") ? Number(a.no_absen) : null;
        const noB = (b.no_absen !== undefined && b.no_absen !== null && String(b.no_absen).trim() !== "") ? Number(b.no_absen) : null;

        if (noA !== null && noB !== null) return noA - noB;
        if (noA !== null) return -1;
        if (noB !== null) return 1;

        return String(a.nama || "").localeCompare(String(b.nama || ""), "id");
    });
}

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

function togglePasswordVisibility(inputId, btnEl) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const show = el.type === 'password';
    el.type = show ? 'text' : 'password';
    if (btnEl) {
        const icon = btnEl.querySelector('i');
        if (icon) icon.className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
}

function getTimeWITA24() {
    const now = new Date();
    const options = { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false };
    return new Intl.DateTimeFormat('id-ID', options).format(now).replace('.', ':');
}

function getGuruNip() {
    if (!appState.user) return '........................................';
    if (appState.user.nip) return appState.user.nip;
    const g = (appState.guru || []).find(x => String(x.id) === String(appState.user.id));
    return (g && g.nip) ? g.nip : '........................................';
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
        } catch (e) { }
    }
    return str.includes('WITA') ? str : `${str} WITA`;
}

function formatTimeAgo(timestamp) {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    return `${hours} jam lalu`;
}

let loadingTimer = null;

function showLoading(text = "Memproses...") {
    const loader = document.getElementById("loading-overlay");
    const txt = document.getElementById("loading-text");
    if (txt) txt.innerText = text;

    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => {
        if (loader) {
            loader.classList.remove("hidden");
            loader.classList.add("flex");
        }
    }, 200);
}

function hideLoading() {
    clearTimeout(loadingTimer);
    const loader = document.getElementById("loading-overlay");
    if (loader) {
        loader.classList.add("hidden");
        loader.classList.remove("flex");
    }
}

function getInitialsAvatar(nama) {
    const name = (nama || "User").trim();
    const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

    const palette = ["#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#65a30d", "#059669", "#0891b2"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const bg = palette[Math.abs(hash) % palette.length];

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${bg}"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>`;

    return "data:image/svg+xml," + encodeURIComponent(svg);
}

function showToast(message, icon = "success") {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 1800,
            timerProgressBar: true
        });
    }
}

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
        badge.className = "text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 mb-3 flex items-center gap-1.5";
        box.insertBefore(badge, box.children[1] || box.firstChild);
    }

    if (isSaved) {
        badge.innerHTML = `<i class="fas fa-save text-blue-500"></i> Draf otomatis tersimpan di perangkat`;
    }
}

function closeModal() {
    const modal = document.getElementById("modal-container");
    if (!modal) return;
    if (modal.dataset.forceLock === "true") return;
    modal.classList.add("hidden");
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

async function requestNotificationPermission() {
    if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            showToast("Notifikasi browser berhasil diaktifkan!");
        } else if (permission === "denied") {
            Swal.fire({
                icon: 'warning',
                title: 'Izin Ditolak',
                text: 'Aktifkan izin notifikasi di pengaturan browser Anda untuk menerima peringatan langsung.',
                confirmButtonColor: '#2563eb'
            });
        }
    }
}

function sendWebPushNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: "https://ui-avatars.com/api/?name=AW&background=2563eb&color=fff&size=192",
                    vibrate: [200, 100, 200],
                    tag: 'siswa-bermasalah-alert'
                });
            });
        } else {
            new Notification(title, { body: body });
        }
    }
}
/* ==========================================================
   MODUL LAPORAN & EKSPOR PDF GENERIK PER-FITUR (KOP SURAT RESMI)
   ========================================================== */

function buildKopSuratHeaderHtml(judul, formattedDate) {
    return `
    <div style="display: flex; align-items: center; justify-content: center; gap: 14px; border-bottom: 3px double #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
        <img src="https://zonalogo.com/assets/tut-wuri-handayani.webp" alt="Logo Tut Wuri Handayani" style="width: 64px; height: 64px; object-fit: contain; flex-shrink: 0;">
        <div style="text-align: center; flex: 1;">
            <h4 style="margin: 0; font-size: 13px; font-weight: normal; text-transform: uppercase;">Pemerintah Kabupaten Gorontalo</h4>
            <h3 style="margin: 2px 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">Dinas Pendidikan dan Kebudayaan</h3>
            <h2 style="margin: 2px 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">SMP NEGERI 1 TALAGA JAYA</h2>
            <p style="margin: 0; font-size: 11px; font-style: italic; color: #334155;">Buhu, Kec. Talaga Jaya, Kab. Gorontalo, Gorontalo 96181</p>
        </div>
        <img src="https://www.e-ujian.com/smpntalagajaya/logo" alt="Logo SMPN 1 Talaga Jaya" style="width: 64px; height: 64px; object-fit: contain; flex-shrink: 0;">
    </div>
    <div style="text-align: center; margin-bottom: 16px;">
        <h3 style="margin: 0 0 4px 0; font-size: 14px; text-transform: uppercase; text-decoration: underline; font-weight: bold;">${escapeHtml(judul)}</h3>
        <p style="margin: 0; font-size: 11px; color: #475569;">Tanggal Cetak: ${formattedDate} | Dicetak Oleh: <b>${escapeHtml(appState.user ? appState.user.nama : 'User')}</b> (${escapeHtml(appState.user ? appState.user.role.toUpperCase() : '')})</p>
    </div>
    `;
}

function buildTandaTanganHtml(formattedDate, labelKanan = "Guru Pemantau / Wali Kelas") {
    return `
    <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; page-break-inside: avoid;">
        <div style="text-align: center; width: 220px;">
            <p style="margin-bottom: 60px;">Mengetahui,<br>Kepala SMPN 1 Talaga Jaya</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(appState.pengaturan?.nama_kepsek || '( ............................................ )')}</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #000000;">NIP.${escapeHtml(appState.pengaturan?.nip_kepsek || '........................................')}</p>
        </div>
        <div style="text-align: center; width: 220px;">
            <p style="margin-bottom: 60px;">Talaga Jaya, ${formattedDate}<br>${escapeHtml(labelKanan)}</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(appState.user ? appState.user.nama : 'Guru Pemantau')}</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #000000;">NIP.${escapeHtml(getGuruNip())}</p>
        </div>
    </div>
    `;
}

/**
 * Fungsi generik ekspor PDF ber-Kop Surat Resmi Sekolah untuk seluruh modul fitur.
 * @param {string} title - Judul dokumen (dipakai di kop surat).
 * @param {string} contentHtml - HTML isi laporan (tabel dsb), tanpa kop surat/ttd.
 * @param {string} filename - Nama file PDF yang diunduh.
 * @param {object} [options] - { orientation: 'portrait'|'landscape', labelKanan: string }
 */
function exportFeaturePDF(title, contentHtml, filename, options = {}) {
    if (typeof html2pdf === 'undefined') {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Komponen eksport PDF gagal dimuat. Coba muat ulang halaman.', confirmButtonColor: '#2563eb' });
        return;
    }

    const formattedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const labelKanan = options.labelKanan || "Guru Pemantau / Wali Kelas";
    const orientation = options.orientation || "portrait";

    const fullHtml = `
        <div style="font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 10px;">
            ${buildKopSuratHeaderHtml(title, formattedDate)}
            ${contentHtml}
            ${buildTandaTanganHtml(formattedDate, labelKanan)}
        </div>
    `;

    const source = document.createElement("div");
    source.innerHTML = fullHtml;
    source.style.width = "1000px";

    showLoading("Membuat file PDF...");

    html2pdf()
        .set({
            margin: 10,
            filename: filename,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: orientation }
        })
        .from(source)
        .save()
        .then(() => {
            hideLoading();
            showToast("File PDF berhasil diunduh!");
        })
        .catch(() => {
            hideLoading();
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal membuat file PDF.', confirmButtonColor: '#2563eb' });
        });
}
