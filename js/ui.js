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

function togglePasswordVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
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