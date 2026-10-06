// =====================================================================
// MODUL JURNAL SISWA (Tahap 3)
// Siswa menulis satu refleksi per hari (hanya hari ini) dan membaca catatan wali/mentor.
// Sisi guru (memberi catatan) dibuat di Tahap 4 dan memakai appState.jurnal serta renderJurnalCatatan.
// Memakai: apiCall, getDateWITA, formatTanggalLabel, escapeHtml, showToast (global).
// =====================================================================

const MOOD_JURNAL = ["😊 Senang", "🌟 Semangat", "😐 Biasa Saja", "😔 Sedih", "😴 Lelah"];
const JURNAL_MAX_CHAR = 2000;

let jurnalMoodDipilih = MOOD_JURNAL[0];
let jurnalMemuat = false;
let jurnalMenyimpan = false;

function jurnalDraftKey() {
    return "jurnal_" + (appState.user ? appState.user.id : "x") + "_" + getDateWITA();
}

async function loadJurnalData(forceRefresh = false) {
    if (!appState.user) return;
    const container = document.getElementById("jurnal-container");
    if (!container) return;

    if (appState.user.role !== "siswa") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-book-open text-2xl mb-2"></i><p class="text-xs text-slate-500">Halaman jurnal untuk guru akan tersedia pada pembaruan berikutnya.</p></div>`;
        return;
    }

    if (!appState.jurnal) appState.jurnal = [];
    if (appState.jurnal.length > 0) renderJurnalView();
    else renderSkeleton("jurnal-container", 3);

    const isStale = (Date.now() - (lastFetchTimes.jurnal || 0)) > CACHE_TTL;
    if (!forceRefresh && !isStale && appState.jurnal.length > 0) return;
    if (jurnalMemuat) return;
    jurnalMemuat = true;
    try {
        const sampai = getDateWITA();
        const dari = geserTanggalJurnal(sampai, -60);
        const res = await apiCall("getJurnal", { siswa_id: String(appState.user.id), dari, sampai }, false);
        if (res && res.status === "success" && Array.isArray(res.data)) {
            appState.jurnal = res.data;
            lastFetchTimes.jurnal = Date.now();
            renderJurnalView();
        } else if (appState.jurnal.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i><p class="text-xs text-slate-500">Jurnal gagal dimuat. Periksa koneksi lalu coba lagi.</p></div>`;
        }
    } finally {
        jurnalMemuat = false;
    }
}

function geserTanggalJurnal(tanggal, n) {
    const p = String(tanggal).split("-").map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.toISOString().slice(0, 10);
}

function ambilJurnalHariIni() {
    const today = getDateWITA();
    return (appState.jurnal || []).find(j => String(j.tanggal) === today) || null;
}

function renderJurnalView() {
    const container = document.getElementById("jurnal-container");
    if (!container || !appState.user || appState.user.role !== "siswa") return;

    const today = getDateWITA();
    const ada = ambilJurnalHariIni();
    const draft = !ada ? (getFormDraft(jurnalDraftKey()) || null) : null;

    // Pertahankan ketikan jika form sudah tampil dan sedang diisi.
    const ketikan = document.getElementById("jurnal-isi");
    const isiAwal = ketikan ? ketikan.value : (ada ? ada.isi : (draft ? draft.isi : ""));
    if (!ketikan) jurnalMoodDipilih = ada ? ada.mood : (draft && draft.mood ? draft.mood : jurnalMoodDipilih);

    const moodHtml = MOOD_JURNAL.map(m => `
        <button type="button" onclick="pilihMoodJurnal('${m}')" aria-pressed="${jurnalMoodDipilih === m}" data-mood="${m}"
            class="mood-btn px-3 py-2 rounded-xl text-xs font-extrabold transition border ${jurnalMoodDipilih === m ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm scale-105' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}">${m}</button>`).join("");

    const form = `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div class="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-pen-to-square text-accent mr-2"></i>${ada ? "Jurnal Hari Ini" : "Tulis Jurnal Hari Ini"}</h3>
                <span class="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[11px] font-extrabold">${escapeHtml(formatTanggalLabel(today))}</span>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5">Bagaimana perasaanmu hari ini?</label>
                <div id="jurnal-mood-wrap" class="flex flex-wrap gap-2">${moodHtml}</div>
            </div>
            <div>
                <label for="jurnal-isi" class="block text-xs font-bold text-slate-600 mb-1">Kebaikan dan pengalaman positif hari ini</label>
                <textarea id="jurnal-isi" rows="5" maxlength="${JURNAL_MAX_CHAR}" oninput="onKetikJurnal()"
                    placeholder="Ceritakan pengalaman atau kebaikan yang kamu lakukan hari ini..."
                    class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-accent">${escapeHtml(isiAwal)}</textarea>
                <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span id="jurnal-draft-info">${draft ? "Draf dipulihkan." : ""}</span>
                    <span id="jurnal-hitung">${(isiAwal || "").length}/${JURNAL_MAX_CHAR}</span>
                </div>
            </div>
            <button type="button" id="jurnal-simpan" onclick="simpanJurnal()"
                class="w-full bg-primary text-white rounded-xl py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition">
                <i class="fas fa-paper-plane"></i> ${ada ? "Perbarui Jurnal" : "Simpan dan Kirim Jurnal"}
            </button>
        </div>`;

    const riwayat = (appState.jurnal || []).filter(j => String(j.tanggal) !== today)
        .sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)));

    const riwayatHtml = `
        <div class="space-y-2.5">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Riwayat dan Catatan Guru</h3>
            ${riwayat.length === 0 && !ada
            ? `<div class="empty-state"><i class="fas fa-book text-2xl mb-2"></i><p class="text-xs text-slate-500">Belum ada jurnal. Tulis jurnal pertamamu hari ini.</p></div>`
            : ""}
            ${ada ? renderKartuJurnal(ada, true) : ""}
            ${riwayat.map(j => renderKartuJurnal(j, false)).join("")}
        </div>`;

    container.innerHTML = `<div class="space-y-4">${form}${riwayatHtml}</div>`;
}

// Dipakai ulang oleh Tahap 4 (tampilan guru) lewat parameter.
function renderKartuJurnal(j, hariIni) {
    return `
        <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs">
            <div class="flex justify-between items-center gap-2">
                <span class="font-extrabold text-blue-700">${escapeHtml(formatTanggalLabel(j.tanggal))}${hariIni ? ` <span class="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-1">Hari ini</span>` : ""}</span>
                <span class="font-bold text-slate-600">${escapeHtml(j.mood || "")}</span>
            </div>
            <p class="text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(j.isi || "")}</p>
            ${renderJurnalCatatan(j)}
        </div>`;
}

function renderJurnalCatatan(j) {
    const blok = (label, nama, teks, kelas, ikon) => `
        <div class="p-2.5 ${kelas} border rounded-xl space-y-0.5">
            <span class="font-extrabold block"><i class="fas ${ikon} mr-1"></i>${label}${nama ? " (" + escapeHtml(nama) + ")" : ""}</span>
            <p class="italic text-slate-700 whitespace-pre-line">${escapeHtml(teks)}</p>
        </div>`;
    const wali = j.catatan_wali ? blok("Wali Kelas", j.wali_nama, j.catatan_wali, "bg-blue-50 border-blue-200 text-blue-700", "fa-chalkboard-user") : "";
    const mentor = j.catatan_mentor ? blok("Mentor", j.mentor_nama, j.catatan_mentor, "bg-emerald-50 border-emerald-200 text-emerald-700", "fa-hands-holding-child") : "";
    return (wali || mentor) ? `<div class="space-y-2 pt-1">${wali}${mentor}</div>` : "";
}

function pilihMoodJurnal(mood) {
    jurnalMoodDipilih = mood;
    document.querySelectorAll("#jurnal-mood-wrap .mood-btn").forEach(btn => {
        const aktif = btn.getAttribute("data-mood") === mood;
        btn.setAttribute("aria-pressed", String(aktif));
        btn.className = "mood-btn px-3 py-2 rounded-xl text-xs font-extrabold transition border " +
            (aktif ? "bg-amber-400 text-slate-900 border-amber-500 shadow-sm scale-105"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100");
    });
    onKetikJurnal();
}

function onKetikJurnal() {
    const el = document.getElementById("jurnal-isi");
    if (!el) return;
    const hitung = document.getElementById("jurnal-hitung");
    if (hitung) hitung.textContent = `${el.value.length}/${JURNAL_MAX_CHAR}`;
    if (!ambilJurnalHariIni()) {
        try { saveFormDraft(jurnalDraftKey(), { mood: jurnalMoodDipilih, isi: el.value }); } catch (e) { }
        const info = document.getElementById("jurnal-draft-info");
        if (info) info.textContent = "Draf tersimpan di perangkat ini.";
    }
}

async function simpanJurnal() {
    if (jurnalMenyimpan) return;
    const el = document.getElementById("jurnal-isi");
    const isi = el ? el.value.trim() : "";
    if (!isi) {
        Swal.fire({ icon: "warning", title: "Jurnal Kosong", text: "Tuliskan refleksi harianmu terlebih dahulu.", confirmButtonColor: "#2563eb" });
        return;
    }
    const today = getDateWITA();
    const btn = document.getElementById("jurnal-simpan");
    jurnalMenyimpan = true;
    if (btn) { btn.disabled = true; btn.classList.add("opacity-60"); btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`; }

    const res = await apiCall("saveJurnal", { siswa_id: String(appState.user.id), tanggal: today, mood: jurnalMoodDipilih, isi }, false);
    jurnalMenyimpan = false;

    if (res && res.status === "success") {
        clearFormDraft(jurnalDraftKey());
        const idx = (appState.jurnal || []).findIndex(j => String(j.tanggal) === today);
        if (idx !== -1) {
            appState.jurnal[idx].mood = jurnalMoodDipilih;
            appState.jurnal[idx].isi = isi;
        } else {
            appState.jurnal.unshift({ id: res.id, siswa_id: String(appState.user.id), tanggal: today, mood: jurnalMoodDipilih, isi });
        }
        showToast("Jurnal tersimpan dan terkirim ke guru.");
        renderJurnalView();
        loadJurnalData(true);
    } else {
        if (btn) { btn.disabled = false; btn.classList.remove("opacity-60"); btn.innerHTML = `<i class="fas fa-paper-plane"></i> Simpan dan Kirim Jurnal`; }
        if (res && res.status === "error") {
            Swal.fire({ icon: "warning", title: "Jurnal Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
        } else {
            showToast("Koneksi bermasalah. Jurnal belum terkirim. Draf tetap aman di perangkat ini.", "warning");
        }
    }
}
