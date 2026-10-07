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
        loadJurnalGuru(forceRefresh);
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


const JURNAL_CATATAN_MAX = 1000;
const JURNAL_SLOT_LABEL = { wali: "Wali", mentor: "Mentor" };

let jurnalGuruData = [];
let jurnalGuruMemuat = false;
let jurnalGuruTanda = "";
let jurnalGuruPeran = null;
let jurnalGuruMenyimpan = false;

function slotCatatanSiswa(siswa) {
    if (!siswa || !appState.user) return [];
    if (appState.user.role === "admin") return ["wali", "mentor"];
    if (!canWrite("jurnal_catatan", siswa)) return [];
    const tipe = getEffectiveAccessType(siswa);
    if (tipe === "wali") return ["wali"];
    if (tipe === "mentor") return ["mentor"];
    if (tipe === "both") return ["wali", "mentor"];
    return [];
}

function cariSiswaJurnal(id) {
    return (appState.siswa || []).find(s => String(s.id) === String(id)) || null;
}

function pastikanKerangkaJurnalGuru(container) {
    const peranSekarang = String(appState.peranAktif || "");
    if (document.getElementById("jurnal-guru-list") && jurnalGuruPeran === peranSekarang) return;
    jurnalGuruPeran = peranSekarang;
    jurnalGuruTanda = "";
    jurnalGuruData = [];

    const today = getDateWITA();
    const kls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-accent";
    const lbl = "block text-xs font-bold text-slate-500 mb-1 uppercase";
    container.innerHTML = `
        <div class="space-y-3">
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                <div>
                    <label for="jg-siswa" class="${lbl}">Siswa</label>
                    <select id="jg-siswa" onchange="loadJurnalGuru(true)" class="${kls}"></select>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label for="jg-dari" class="${lbl}">Dari</label>
                        <input type="date" id="jg-dari" value="${geserTanggalJurnal(today, -6)}" max="${today}" onchange="loadJurnalGuru(true)" class="${kls}">
                    </div>
                    <div>
                        <label for="jg-sampai" class="${lbl}">Sampai</label>
                        <input type="date" id="jg-sampai" value="${today}" max="${today}" onchange="loadJurnalGuru(true)" class="${kls}">
                    </div>
                </div>
                <div>
                    <label for="jg-filter" class="${lbl}">Tampilkan</label>
                    <select id="jg-filter" onchange="renderJurnalGuru()" class="${kls}">
                        <option value="">Semua jurnal</option>
                        <option value="belum">Belum saya beri catatan</option>
                    </select>
                </div>
            </div>
            <div id="jurnal-guru-ringkas" class="text-[11px] font-semibold text-slate-500 px-1"></div>
            <div id="jurnal-guru-list" class="space-y-2.5"></div>
        </div>`;
    const sel = document.getElementById("jg-siswa");
    populateSiswaSelectForRole(sel, { includeAllOption: true });
    sel.value = "ALL";
    syncSiswaSelect(sel);
}

async function loadJurnalGuru(forceRefresh = false) {
    const container = document.getElementById("jurnal-container");
    if (!container || !appState.user || appState.user.role === "siswa") return;
    pastikanKerangkaJurnalGuru(container);

    const sid = document.getElementById("jg-siswa").value || "ALL";
    const dari = document.getElementById("jg-dari").value;
    const sampai = document.getElementById("jg-sampai").value;
    if (!dari || !sampai || dari > sampai) {
        renderJurnalGuruPesan("Rentang tanggal tidak valid. Tanggal awal harus sebelum tanggal akhir.");
        return;
    }
    if (jurnalGuruMemuat) return;
    if (!forceRefresh && jurnalGuruData.length > 0) { renderJurnalGuru(); return; }

    jurnalGuruMemuat = true;
    if (jurnalGuruData.length === 0) renderSkeleton("jurnal-guru-list", 3);
    try {
        const res = await apiCall("getJurnal", { siswa_id: sid, dari, sampai }, false);
        if (res && res.status === "success" && Array.isArray(res.data)) {
            const tanda = JSON.stringify(res.data);
            const berubah = tanda !== jurnalGuruTanda;
            jurnalGuruTanda = tanda;
            jurnalGuruData = res.data;
            lastFetchTimes.jurnal = Date.now();
            if (berubah || !document.querySelector("#jurnal-guru-list > *")) renderJurnalGuru();
        } else if (res && res.status === "error") {
            renderJurnalGuruPesan(res.message || "Jurnal tidak dapat dimuat.");
        } else if (jurnalGuruData.length === 0) {
            renderJurnalGuruPesan("Jurnal gagal dimuat. Periksa koneksi lalu coba lagi.");
        }
    } finally {
        jurnalGuruMemuat = false;
    }
}

function renderJurnalGuruPesan(teks) {
    const list = document.getElementById("jurnal-guru-list");
    const ringkas = document.getElementById("jurnal-guru-ringkas");
    if (ringkas) ringkas.textContent = "";
    if (list) list.innerHTML = `<div class="empty-state"><i class="fas fa-book-open text-2xl mb-2"></i><p class="text-xs text-slate-500">${escapeHtml(teks)}</p></div>`;
}

function jurnalSudahDicatat(j, slots) {
    return slots.length > 0 && slots.every(sl => String((sl === "wali" ? j.catatan_wali : j.catatan_mentor) || "").trim() !== "");
}

function renderJurnalGuru() {
    const list = document.getElementById("jurnal-guru-list");
    if (!list) return;
    const filter = document.getElementById("jg-filter") ? document.getElementById("jg-filter").value : "";

    const items = [];
    jurnalGuruData.forEach((j, idx) => {
        const siswa = cariSiswaJurnal(j.siswa_id);
        if (isGuruUser() && (!siswa || !isSiswaInPeran(siswa))) return;
        const slots = slotCatatanSiswa(siswa);
        if (filter === "belum" && (slots.length === 0 || jurnalSudahDicatat(j, slots))) return;
        items.push({ j, idx, siswa, slots });
    });

    const total = jurnalGuruData.length;
    const belum = jurnalGuruData.filter(j => {
        const siswa = cariSiswaJurnal(j.siswa_id);
        if (isGuruUser() && (!siswa || !isSiswaInPeran(siswa))) return false;
        const slots = slotCatatanSiswa(siswa);
        return slots.length > 0 && !jurnalSudahDicatat(j, slots);
    }).length;
    const ringkas = document.getElementById("jurnal-guru-ringkas");
    if (ringkas) ringkas.textContent = `${total} jurnal dalam periode. ${belum} belum diberi catatan oleh Anda.`;

    if (items.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-book text-2xl mb-2"></i><p class="text-xs text-slate-500">${filter === "belum" ? "Semua jurnal sudah Anda beri catatan." : "Tidak ada jurnal pada periode ini."}</p></div>`;
        return;
    }

    list.innerHTML = items.map(({ j, idx, siswa, slots }) => {
        const kls = siswa ? (appState.kelas || []).find(k => String(k.id) === String(siswa.kelas_id)) : null;
        const tombol = slots.map(sl => {
            const ada = String((sl === "wali" ? j.catatan_wali : j.catatan_mentor) || "").trim() !== "";
            return `<button type="button" onclick="bukaCatatanJurnal(${idx}, '${sl}')"
                class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition ${ada ? "bg-white text-slate-600 border-slate-300 hover:bg-slate-50" : "bg-primary text-white border-primary hover:opacity-90"}">
                <i class="fas ${ada ? "fa-pen" : "fa-comment-medical"} mr-1"></i>${ada ? "Ubah" : "Tulis"} Catatan ${JURNAL_SLOT_LABEL[sl]}
            </button>`;
        }).join("");
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs">
                <div class="flex justify-between items-start gap-2">
                    <div class="min-w-0">
                        <p class="font-extrabold text-slate-800 truncate">${escapeHtml(siswa ? siswa.nama : "Siswa")}</p>
                        <p class="text-[10px] text-slate-400">Kelas ${escapeHtml(kls ? kls.nama_kelas : "-")} \u2022 ${escapeHtml(formatTanggalLabel(j.tanggal))}</p>
                    </div>
                    <span class="font-bold text-slate-600 shrink-0">${escapeHtml(j.mood || "")}</span>
                </div>
                <p class="text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(j.isi || "")}</p>
                ${renderJurnalCatatan(j)}
                ${tombol ? `<div class="flex flex-wrap gap-2 pt-1">${tombol}</div>` : ""}
            </div>`;
    }).join("");
}

function bukaCatatanJurnal(idx, slot) {
    const j = jurnalGuruData[idx];
    if (!j) return;
    const siswa = cariSiswaJurnal(j.siswa_id);
    if (slotCatatanSiswa(siswa).indexOf(slot) === -1) return;
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const lama = String((slot === "wali" ? j.catatan_wali : j.catatan_mentor) || "");
    box.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-comment-medical text-primary mr-1.5"></i>Catatan ${JURNAL_SLOT_LABEL[slot]}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <p class="text-xs text-slate-500 mb-2"><b>${escapeHtml(siswa ? siswa.nama : "Siswa")}</b> \u2022 ${escapeHtml(formatTanggalLabel(j.tanggal))}</p>
        <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 whitespace-pre-line max-h-32 overflow-y-auto mb-3">${escapeHtml(j.isi || "")}</div>
        <label for="cj-catatan" class="block text-xs font-bold text-slate-500 mb-1">CATATAN UNTUK SISWA</label>
        <textarea id="cj-catatan" rows="4" maxlength="${JURNAL_CATATAN_MAX}" oninput="document.getElementById('cj-hitung').textContent = this.value.length + '/${JURNAL_CATATAN_MAX}'"
            placeholder="Tulis apresiasi atau arahan singkat..."
            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-accent">${escapeHtml(lama)}</textarea>
        <div class="text-right text-[10px] text-slate-400 mt-1 mb-3"><span id="cj-hitung">${lama.length}/${JURNAL_CATATAN_MAX}</span></div>
        <div class="flex gap-2">
            ${lama ? `<button type="button" onclick="simpanCatatanJurnal(${idx}, '${slot}', true)" class="px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100">Hapus</button>` : ""}
            <button type="button" id="cj-simpan" onclick="simpanCatatanJurnal(${idx}, '${slot}', false)" class="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-xs">Simpan Catatan</button>
        </div>`;
    document.getElementById("modal-container")?.classList.remove("hidden");
    setTimeout(() => { const t = document.getElementById("cj-catatan"); if (t) t.focus(); }, 50);
}

async function simpanCatatanJurnal(idx, slot, hapus) {
    if (jurnalGuruMenyimpan) return;
    const j = jurnalGuruData[idx];
    if (!j) return;
    const catatan = hapus ? "" : String((document.getElementById("cj-catatan") || {}).value || "").trim();
    if (!hapus && !catatan) {
        Swal.fire({ icon: "warning", title: "Catatan Kosong", text: "Tulis catatan, atau pakai tombol Hapus untuk menghapus catatan lama.", confirmButtonColor: "#2563eb" });
        return;
    }
    const btn = document.getElementById("cj-simpan");
    jurnalGuruMenyimpan = true;
    if (btn) { btn.disabled = true; btn.classList.add("opacity-60"); btn.textContent = "Menyimpan..."; }

    const res = await apiCall("saveCatatanJurnal", { siswa_id: String(j.siswa_id), tanggal: j.tanggal, catatan, sebagai: slot }, false);
    jurnalGuruMenyimpan = false;

    if (res && res.status === "success") {
        const sebagai = res.sebagai || slot;
        const nama = catatan ? String(appState.user.nama || "") : "";
        if (sebagai === "wali") { j.catatan_wali = catatan; j.wali_nama = nama; }
        else { j.catatan_mentor = catatan; j.mentor_nama = nama; }
        jurnalGuruTanda = JSON.stringify(jurnalGuruData);
        closeModal();
        showToast(res.message || "Catatan tersimpan.");
        renderJurnalGuru();
    } else {
        if (btn) { btn.disabled = false; btn.classList.remove("opacity-60"); btn.textContent = "Simpan Catatan"; }
        if (res && res.status === "error") {
            Swal.fire({ icon: "warning", title: "Catatan Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
        } else {
            showToast("Koneksi bermasalah. Catatan belum terkirim.", "warning");
        }
    }
}