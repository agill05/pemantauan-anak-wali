/* Modul bersama: tampilan grup per siswa (level 1 card, level 2 detail).
 * Dipakai keagamaan.js, akademik.js (prestasi), pembinaan.js. */

const GS_URUT_LABEL = {
    terbaru: "Terbaru",
    terbanyak: "Paling banyak catatan",
    mendesak: "Status mendesak"
};

function gsTanggalNum(rec) {
    const t = Date.parse(String(rec && rec.tanggal || ""));
    return isNaN(t) ? 0 : t;
}

function gsKunciPembuat(rec) {
    const sebagai = String(rec.dibuat_sebagai || "").toLowerCase().trim();
    const oleh = String(rec.dibuat_oleh_id || "").trim();
    return (sebagai || "wali") + "|" + oleh;
}

// Kelompokkan catatan per siswa. Hasil: array {siswaId, siswa, records, terakhir}
function gsGroupBySiswa(records, getSiswaId) {
    const map = new Map();
    (records || []).forEach(rec => {
        const sid = String(getSiswaId ? getSiswaId(rec) : rec.siswa_id);
        if (!map.has(sid)) map.set(sid, []);
        map.get(sid).push(rec);
    });
    const out = [];
    map.forEach((list, sid) => {
        list.sort((a, b) => gsTanggalNum(b) - gsTanggalNum(a));
        const siswa = (appState.siswa || []).find(x => String(x.id) === sid)
            || (appState.user && String(appState.user.id) === sid ? appState.user : null);
        out.push({ siswaId: sid, siswa, records: list, terakhir: gsTanggalNum(list[0]) });
    });
    return out;
}

function gsUrutkan(groups, mode, skorMendesak) {
    const arr = groups.slice();
    if (mode === "terbanyak") arr.sort((a, b) => b.records.length - a.records.length || b.terakhir - a.terakhir);
    else if (mode === "mendesak" && typeof skorMendesak === "function") arr.sort((a, b) => skorMendesak(b) - skorMendesak(a) || b.terakhir - a.terakhir);
    else arr.sort((a, b) => b.terakhir - a.terakhir);
    return arr;
}

// Chip kontributor unik (satu chip per pembuat)
function gsRenderKontributor(records) {
    const seen = new Set();
    const chips = [];
    (records || []).forEach(rec => {
        const k = gsKunciPembuat(rec);
        if (seen.has(k)) return;
        seen.add(k);
        const chip = renderPenulisBadge(rec);
        if (chip) chips.push(chip);
    });
    return chips.length ? `<div class="flex flex-wrap items-center gap-1.5">${chips.join("")}</div>` : "";
}

function gsFormatTanggal(rec) {
    if (!rec) return "";
    const mentah = rec.dibuat_pada ? String(rec.dibuat_pada).trim() : "";
    const m = mentah.match(/(\d{1,2}:\d{2})(?::\d{2})?$/);
    const jam = m ? m[1] : "";
    return jam ? `${rec.tanggal || ""} · ${jam}` : String(rec.tanggal || "");
}

function gsNamaSiswa(g) {
    return g.siswa ? g.siswa.nama : "Siswa";
}

function gsNamaKelas(siswa) {
    if (!siswa) return "";
    const k = (appState.kelas || []).find(x => String(x.id) === String(siswa.kelas_id));
    return k ? k.nama_kelas : "";
}

// Card level 1. ringkasanHtml = isi spesifik modul. aksiDetail = nama fungsi global (string) yang menerima siswaId.
function gsRenderCard(g, ringkasanHtml, aksiDetail) {
    const kelas = gsNamaKelas(g.siswa);
    const peran = g.siswa ? renderPeranChip(g.siswa) : "";
    const terakhir = g.records[0] ? g.records[0].tanggal : "";
    const badan = [ringkasanHtml || "", gsRenderKontributor(g.records)].filter(Boolean).join("");
    return `
        <div class="gs-card bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div class="gs-card-head flex justify-between items-start gap-2">
                <div class="min-w-0">
                    <h4 class="font-bold text-xs text-slate-800 truncate">${escapeHtml(gsNamaSiswa(g))}</h4>
                    <p class="text-xs text-slate-400">${escapeHtml(kelas)}</p>
                </div>
                <div class="flex flex-wrap justify-end gap-1">${peran}</div>
            </div>
            ${badan ? `<div class="gs-card-body space-y-2 min-w-0">${badan}</div>` : ""}
            <div class="gs-card-foot flex justify-between items-center pt-1 border-t border-slate-50">
                <span class="text-xs text-slate-400">${g.records.length} catatan${terakhir ? " · update " + escapeHtml(terakhir) : ""}</span>
                <button onclick="${aksiDetail}('${escapeHtml(g.siswaId)}')" class="text-xs font-bold text-blue-600">Detail <i class="fas fa-chevron-right text-[9px]"></i></button>
            </div>
        </div>`;
}

// Sheet level 2. opsi: { judul, ringkasanHtml, bodyHtml, tambahFn (string, tanpa argumen siswa) }
function gsOpenSheet(g, opsi) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    const bisaTambah = opsi.tambahFn && !isKepsekUser() && canWrite(opsi.kategori, g.siswa || g.siswaId);
    box.innerHTML = `
        <div class="flex justify-between items-start mb-3 gap-2">
            <div class="min-w-0">
                <h3 class="text-sm font-bold text-slate-800 truncate">${escapeHtml(gsNamaSiswa(g))}</h3>
                <p class="text-xs text-slate-400">${escapeHtml(opsi.judul || "")} · ${escapeHtml(gsNamaKelas(g.siswa))}</p>
            </div>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        ${opsi.ringkasanHtml ? `<div class="mb-3">${opsi.ringkasanHtml}</div>` : ""}
        ${opsi.bulkIds ? bulkToolbar(opsi.kategori, opsi.bulkIds) : ""}
        <div class="space-y-2 overflow-y-auto" style="max-height:58vh">${opsi.bodyHtml}</div>
        ${bisaTambah ? `<button onclick="${opsi.tambahFn}('${escapeHtml(g.siswaId)}')" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-3"><i class="fas fa-plus"></i> Tambah</button>` : ""}
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

// Baris catatan di detail: pembuat, tanggal, aksi sesuai hak akses
function gsRenderBarisCatatan(rec, kategori, isiHtml, editFn, hapusFn) {
    const bisaUbah = !isKepsekUser() && canEditRecord(rec, kategori);
    const cb = bisaUbah ? bulkCheckbox(kategori, rec.id) : "";
    return `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
            ${cb ? `<div class="flex items-start">${cb}<div class="flex-1 min-w-0 space-y-1.5">${isiHtml}</div></div>` : isiHtml}
            <div class="flex flex-wrap items-center gap-1.5">
                ${renderPenulisBadge(rec)}
                <span class="text-[10px] text-slate-400">${escapeHtml(gsFormatTanggal(rec))}</span>
            </div>
            ${bisaUbah ? `
            <div class="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button onclick="${editFn}('${escapeHtml(rec.id)}')" class="text-xs font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="${hapusFn}('${escapeHtml(rec.id)}')" class="text-xs font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
            </div>` : ""}
        </div>`;
}

// Filter tambahan kepsek: kelas + pembuat. Isi <select> dari data, kembalikan html.
function gsRenderFilterKepsek(prefixId, onChangeFn) {
    if (!isKepsekUser()) return "";
    const kelasOpt = `<option value="">Semua Kelas</option>` + (appState.kelas || [])
        .map(k => `<option value="${k.id}">${escapeHtml(k.nama_kelas)}</option>`).join("");
    const guruOpt = `<option value="">Semua Pembuat</option>` + (appState.guru || [])
        .map(g => `<option value="${g.id}">${escapeHtml(g.nama)}</option>`).join("");
    const urutOpt = Object.keys(GS_URUT_LABEL)
        .map(k => `<option value="${k}">${GS_URUT_LABEL[k]}</option>`).join("");
    const cls = "w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none";
    return `
        <div class="grid grid-cols-3 gap-2 mb-2">
            <select id="${prefixId}-kelas" onchange="${onChangeFn}()" class="${cls}" aria-label="Filter kelas">${kelasOpt}</select>
            <select id="${prefixId}-guru" onchange="${onChangeFn}()" class="${cls}" aria-label="Filter pembuat">${guruOpt}</select>
            <select id="${prefixId}-urut" onchange="${onChangeFn}()" class="${cls}" aria-label="Urutkan">${urutOpt}</select>
        </div>`;
}

function gsBacaFilterKepsek(prefixId) {
    return {
        kelas: document.getElementById(prefixId + "-kelas")?.value || "",
        guru: document.getElementById(prefixId + "-guru")?.value || "",
        urut: document.getElementById(prefixId + "-urut")?.value || "terbaru"
    };
}

// Terapkan filter kelas dan pembuat pada hasil grup. Catatan difilter per pembuat, grup kosong dibuang.
function gsTerapkanFilter(groups, f) {
    if (!f) return groups;
    return groups.map(g => {
        let recs = g.records;
        if (f.guru) recs = recs.filter(r => String(r.dibuat_oleh_id || "") === String(f.guru));
        return Object.assign({}, g, { records: recs });
    }).filter(g => {
        if (g.records.length === 0) return false;
        if (f.kelas && (!g.siswa || String(g.siswa.kelas_id) !== String(f.kelas))) return false;
        return true;
    });
}
