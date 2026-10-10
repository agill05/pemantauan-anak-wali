/* Modul Tata Tertib (Tahap 5-6): daftar poin siswa, form input banyak siswa, detail rinci, panggilan orang tua.
 * Memakai grup-siswa.js (gsRenderCard, gsOpenSheet). Notifikasi ambang ada di dashboard.js. */

const TT_KAT_LABEL_BAWAAN = { A: "Kelakuan", B: "Kerajinan", C: "Kerapian", D: "Penghargaan" };
const TT_KAT_WARNA = {
    A: "text-rose-600 bg-rose-50",
    B: "text-amber-600 bg-amber-50",
    C: "text-sky-600 bg-sky-50",
    D: "text-emerald-600 bg-emerald-50"
};
const TT_SYARAT_LABEL = { putra: "Putra", putri: "Putri", muslim: "Muslim" };
const TT_TAHAP_LABEL = ["Aman", "Panggilan I", "Panggilan II", "Panggilan III"];
const TT_TAHAP_BADGE = [
    "bg-emerald-50 text-emerald-700 border-emerald-200",
    "bg-amber-50 text-amber-700 border-amber-200",
    "bg-orange-50 text-orange-700 border-orange-200",
    "bg-rose-50 text-rose-700 border-rose-200"
];
const TT_TAHAP_BAR = ["bg-emerald-500", "bg-amber-500", "bg-orange-500", "bg-rose-500"];
const TT_MAKS_SISWA = 100;
const TT_MAKS_TAMPIL_SISWA = 200;
const TT_KONFIG_BAWAAN = { batas_keluar: 50, panggilan_1: 15, panggilan_2: 30, panggilan_3: 45, pengali_ulang: 2 };

let tatibMaster = { master: [], konfig: null, kategori: TT_KAT_LABEL_BAWAAN, waktu: 0 };
let tatibKonfig = null;
let tatibRekap = new Map();
let tatibStatistik = null;
let tatibMemuat = false;
let ttForm = null;
let ttPratinjauTimer = null;

function ttKonfig() {
    return Object.assign({}, TT_KONFIG_BAWAAN, tatibKonfig || {});
}

function ttNamaKategori(k) {
    return (tatibMaster.kategori && tatibMaster.kategori[k]) || TT_KAT_LABEL_BAWAAN[k] || k;
}

function ttCariSiswa(id) {
    return (appState.siswa || []).find(s => String(s.id) === String(id)) || null;
}

function ttRekapSiswa(id) {
    return tatibRekap.get(String(id)) || { total: 0, pelanggaran: 0, penghargaan: 0, tahap: 0, mencapai_batas: false, panggilan_tertunda: [] };
}

async function ttPastikanMaster(paksa = false) {
    const segar = tatibMaster.master.length > 0 && (Date.now() - tatibMaster.waktu) < 5 * 60 * 1000;
    if (!paksa && segar) return true;
    const res = await apiCall("getTatibMaster", {}, !segar);
    if (res && res.status === "success" && res.data && Array.isArray(res.data.master)) {
        tatibMaster = { master: res.data.master, konfig: res.data.konfig || null, kategori: res.data.kategori || TT_KAT_LABEL_BAWAAN, waktu: Date.now() };
        if (res.data.konfig) tatibKonfig = res.data.konfig;
        return true;
    }
    return tatibMaster.master.length > 0;
}

// ---------- daftar ----------

async function loadTatibData(forceRefresh = false) {
    const filterSelect = document.getElementById("tatib-siswa-filter");
    if (filterSelect) {
        const daftar = getSiswaPeran();
        if (daftar.length > 0 && filterSelect.options.length <= 1) {
            filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + daftar.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
        }
        enhanceSiswaSelect(filterSelect);
    }

    if (appState.tatib && appState.tatib.length > 0) renderTatibView();
    else renderSkeleton("tatib-list-container", 3);

    if (tatibMemuat) return;
    tatibMemuat = true;
    try {
        const [resCatatan, resRekap, resPanggilan] = await Promise.all([
            apiCall("getTatib", {}, false),
            apiCall("getRekapTatib", {}, false),
            apiCall("getTatibPanggilan", {}, false, 1, true)
        ]);
        if (resPanggilan && resPanggilan.status === "success" && Array.isArray(resPanggilan.data)) {
            tatibPanggilan = resPanggilan.data;
        }
        if (resCatatan && resCatatan.status === "success" && Array.isArray(resCatatan.data)) {
            appState.tatib = resCatatan.data;
        }
        if (resRekap && resRekap.status === "success" && Array.isArray(resRekap.data)) {
            tatibRekap = new Map(resRekap.data.map(r => [String(r.siswa_id), r]));
            tatibStatistik = resRekap.statistik || null;
            if (resRekap.konfig) tatibKonfig = resRekap.konfig;
        }
    } finally {
        tatibMemuat = false;
    }
    renderTatibView();
}

function ttBarProgres(rekap) {
    const k = ttKonfig();
    const batas = k.batas_keluar || 50;
    const total = Math.max(0, Number(rekap.total) || 0);
    const pct = Math.min(100, (total / batas) * 100);
    const warna = rekap.mencapai_batas ? "bg-rose-600" : TT_TAHAP_BAR[rekap.tahap] || TT_TAHAP_BAR[0];
    const tanda = [k.panggilan_1, k.panggilan_2, k.panggilan_3].map(p =>
        `<span class="absolute top-0 bottom-0 w-px bg-white" style="left:${Math.min(100, (p / batas) * 100)}%"></span>`).join("");
    return `
        <div class="relative h-2.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-label="Poin pelanggaran"
            aria-valuemin="0" aria-valuemax="${batas}" aria-valuenow="${Math.min(total, batas)}">
            <div class="h-full rounded-full ${warna}" style="width:${pct}%"></div>
            ${tanda}
        </div>`;
}

function ttRingkasanHtml(siswaId) {
    const r = ttRekapSiswa(siswaId);
    const k = ttKonfig();
    const label = r.mencapai_batas ? "Batas tercapai" : (TT_TAHAP_LABEL[r.tahap] || TT_TAHAP_LABEL[0]);
    const badge = r.mencapai_batas ? TT_TAHAP_BADGE[3] : (TT_TAHAP_BADGE[r.tahap] || TT_TAHAP_BADGE[0]);
    const tertunda = Array.isArray(r.panggilan_tertunda) && r.panggilan_tertunda.length > 0;
    return `
        <div class="space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                <span class="font-bold text-slate-700">${Number(r.total) || 0} <span class="text-slate-400 font-semibold">/ ${k.batas_keluar} poin</span></span>
                <span class="flex flex-wrap items-center gap-1">
                    ${tertunda ? `<span class="font-bold px-2 py-0.5 rounded-md border bg-violet-50 text-violet-700 border-violet-200" title="Panggilan orang tua belum dicatat">Panggilan belum dicatat</span>` : ""}
                    <span class="font-bold px-2 py-0.5 rounded-md border ${badge}">${escapeHtml(label)}</span>
                </span>
            </div>
            ${ttBarProgres(r)}
            <p class="text-[11px] text-slate-400">Pelanggaran ${Number(r.pelanggaran) || 0} \u2022 Penghargaan ${Number(r.penghargaan) || 0}</p>
        </div>`;
}

function ttRingkasStatistik() {
    const el = document.getElementById("tatib-ringkas");
    if (!el) return;
    const st = tatibStatistik;
    if (!st) { el.innerHTML = ""; return; }
    const kotak = (n, label, cls) => `
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm px-2 py-2 text-center">
            <p class="text-sm font-extrabold ${cls}">${Number(n) || 0}</p>
            <p class="text-[10px] font-bold text-slate-400 leading-tight">${label}</p>
        </div>`;
    el.innerHTML =
        kotak(st.tahap_0, "Aman", "text-emerald-600") +
        kotak(st.tahap_1, "Panggilan I", "text-amber-600") +
        kotak(st.tahap_2, "Panggilan II", "text-orange-600") +
        kotak(st.tahap_3, "Panggilan III", "text-rose-600") +
        kotak(st.mencapai_batas, "Batas", "text-rose-700");
}

function renderTatibView() {
    const container = document.getElementById("tatib-list-container");
    if (!container) return;

    if (isKepsekUser() && !document.getElementById("tatib-gs-filter")) {
        container.insertAdjacentHTML("beforebegin", `<div id="tatib-gs-filter">${gsRenderFilterKepsek("tt-f", "renderTatibView")}</div>`);
    }
    ttRingkasStatistik();

    const filterSiswaId = document.getElementById("tatib-siswa-filter")?.value || "";
    const base = scopeBySiswaId(appState.tatib, r => r.siswa_id);
    const disaring = filterSiswaId ? base.filter(r => String(r.siswa_id) === String(filterSiswaId)) : base;

    const fk = isKepsekUser() ? gsBacaFilterKepsek("tt-f") : null;
    let groups = gsTerapkanFilter(gsGroupBySiswa(disaring, r => r.siswa_id), fk);
    groups = gsUrutkan(groups, fk ? fk.urut : "mendesak", g => Number(ttRekapSiswa(g.siswaId).total) || 0);

    if (groups.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-circle-check text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Belum ada catatan tata tertib.</p></div>`;
        tatibRefreshDetail();
        return;
    }

    container.innerHTML = groups.map(g => gsRenderCard(g, ttRingkasanHtml(g.siswaId), "openDetailTatib")).join("");
    tatibRefreshDetail();
}

// ---------- detail (Tahap 6) ----------

function ttDataGrup(siswaId) {
    const base = scopeBySiswaId(appState.tatib, r => r.siswa_id).filter(r => String(r.siswa_id) === String(siswaId));
    const g = gsGroupBySiswa(base, r => r.siswa_id)[0];
    return g || { siswaId: String(siswaId), siswa: ttCariSiswa(siswaId), records: [] };
}

let ttDetailKat = "semua";
let tatibPanggilan = [];
const TT_TAHAP_ROMAWI = ["", "I", "II", "III"];

function ttTertunda(siswaId) {
    const t = ttRekapSiswa(siswaId).panggilan_tertunda;
    return Array.isArray(t) ? t : [];
}

function ttPanggilanSiswa(siswaId) {
    return (tatibPanggilan || [])
        .filter(p => String(p.siswa_id) === String(siswaId))
        .sort((a, b) => TT_TAHAP_ROMAWI.indexOf(String(a.tahap)) - TT_TAHAP_ROMAWI.indexOf(String(b.tahap)));
}

// Wali kelas siswa (atau admin) boleh mencatat panggilan orang tua. Kepsek hanya membaca.
function tatibBisaCatatPanggilan(siswaId) {
    const u = appState.user;
    if (!u || isKepsekUser()) return false;
    if (u.role === "admin") return true;
    if (u.role !== "guru") return false;
    const siswa = ttCariSiswa(siswaId);
    if (!siswa) return false;
    const tipe = getEffectiveAccessType(siswa);
    return tipe === "wali" || tipe === "both";
}

function ttBisaUbahPanggilan(p) {
    if (tatibBisaCatatPanggilan(p.siswa_id)) return true;
    const u = appState.user;
    return !!u && u.role === "guru" && String(p.dibuat_oleh_id || "").trim() === String(u.id).trim();
}

function ttTeksPembinaan(siswaId) {
    const r = ttRekapSiswa(siswaId);
    const tahap = r.mencapai_batas ? "mencapai batas" : (r.tahap >= 1 ? "Panggilan Orang Tua " + TT_TAHAP_ROMAWI[r.tahap] : "");
    return "Pembinaan tata tertib: akumulasi " + (Number(r.total) || 0) + " poin pelanggaran" + (tahap ? " (" + tahap + ")" : "") + ".";
}

function ttBuatPembinaan(siswaId) {
    openQuickPembinaan(siswaId, ttTeksPembinaan(siswaId), "");
}

function ttRincianKategori(records) {
    const per = { A: { n: 0, poin: 0 }, B: { n: 0, poin: 0 }, C: { n: 0, poin: 0 }, D: { n: 0, poin: 0 } };
    records.forEach(r => {
        const p = per[r.kategori];
        if (!p) return;
        p.n++;
        p.poin += Number(r.skor_akhir) || 0;
    });
    return `<div class="grid grid-cols-2 gap-2">` + Object.keys(per).map(k => `
        <div class="rounded-xl border border-slate-100 p-2 ${TT_KAT_WARNA[k]}">
            <p class="text-[11px] font-bold">${k} \u2022 ${escapeHtml(ttNamaKategori(k))}</p>
            <p class="text-xs font-extrabold">${k === "D" ? "\u2212" : ""}${per[k].poin} poin</p>
            <p class="text-[10px] opacity-80">${per[k].n} catatan</p>
        </div>`).join("") + `</div>`;
}

function ttHtmlPanggilan(siswaId) {
    const daftar = ttPanggilanSiswa(siswaId);
    const tertunda = ttTertunda(siswaId);
    const baris = daftar.map(p => {
        const aksi = ttBisaUbahPanggilan(p) ? `
            <div class="flex justify-end gap-3 pt-1 border-t border-slate-100">
                <button onclick="openModalTatibPanggilan('${escapeHtml(siswaId)}', '${escapeHtml(p.tahap)}', '${escapeHtml(p.id)}')" class="text-xs font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="hapusTatibPanggilan('${escapeHtml(p.id)}')" class="text-xs font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
            </div>` : "";
        return `
            <div class="bg-violet-50/60 p-2.5 rounded-xl border border-violet-100 space-y-1">
                <div class="flex justify-between items-center gap-2 text-xs">
                    <span class="font-bold text-violet-700">Panggilan ${escapeHtml(p.tahap)}</span>
                    <span class="text-slate-500">${escapeHtml(p.tanggal)} \u2022 ${Number(p.skor_saat) || 0} poin</span>
                </div>
                ${p.catatan ? `<p class="text-xs text-slate-600 break-words">${escapeHtml(p.catatan)}</p>` : ""}
                <div class="flex flex-wrap items-center gap-1.5">${renderPenulisBadge(p)}</div>
                ${aksi}
            </div>`;
    }).join("");
    const petunjuk = tertunda.length ? `<p class="text-xs font-bold text-violet-700"><i class="fas fa-circle-exclamation"></i> Belum dicatat: Panggilan ${tertunda.join(", ")}</p>` : "";
    return `
        <div class="space-y-2">
            <p class="text-xs font-bold text-slate-700">Panggilan Orang Tua</p>
            ${baris || `<p class="text-xs text-slate-400">Belum ada panggilan dicatat.</p>`}
            ${petunjuk}
        </div>`;
}

function ttFilterRiwayat(k) {
    ttDetailKat = k;
    const box = document.getElementById("modal-content-box");
    if (box && box.dataset.gs === "tatib") openDetailTatib(box.dataset.gsSiswa, true);
}

function openDetailTatib(siswaId, pertahankan = false) {
    if (!pertahankan) ttDetailKat = "semua";
    const g = ttDataGrup(siswaId);
    const sid = escapeHtml(g.siswaId);
    const tertunda = ttTertunda(g.siswaId);

    const aksi = [];
    if (!isKepsekUser() && canWrite("pembinaan", g.siswa || g.siswaId)) {
        aksi.push(`<button onclick="ttBuatPembinaan('${sid}')" class="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700 flex items-center gap-1"><i class="fas fa-edit"></i> Buat Pembinaan</button>`);
    }
    if (tatibBisaCatatPanggilan(g.siswaId) && tertunda.length > 0) {
        aksi.push(`<button onclick="openModalTatibPanggilan('${sid}', '${tertunda[0]}')" class="px-2.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-violet-700 flex items-center gap-1"><i class="fas fa-phone"></i> Catat Panggilan Ortu</button>`);
    }

    const chip = (k, label) => {
        const on = ttDetailKat === k;
        return `<button type="button" onclick="ttFilterRiwayat('${k}')" aria-pressed="${on}" class="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold ${on ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}">${label}</button>`;
    };
    const tampil = ttDetailKat === "semua" ? g.records : g.records.filter(r => r.kategori === ttDetailKat);
    const riwayat = tampil.length === 0
        ? `<p class="text-xs text-slate-400 text-center py-3">Tidak ada catatan.</p>`
        : tampil.map(rec => {
            const penghargaan = String(rec.jenis) === "penghargaan";
            const warna = TT_KAT_WARNA[rec.kategori] || "text-slate-600 bg-slate-100";
            const pengali = Number(rec.pengali) || 1;
            const isi = `
                <div class="flex justify-between items-start gap-2">
                    <div class="min-w-0">
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${warna}">${escapeHtml(rec.master_id || "")} \u2022 ${escapeHtml(ttNamaKategori(rec.kategori))}</span>
                        <p class="font-bold text-xs text-slate-800 mt-1 break-words">${escapeHtml(rec.nama)}</p>
                    </div>
                    <span class="text-xs font-extrabold whitespace-nowrap ${penghargaan ? "text-emerald-600" : "text-rose-600"}">${penghargaan ? "\u2212" : "+"}${Number(rec.skor_akhir) || 0}</span>
                </div>
                ${pengali > 1 ? `<p class="text-[11px] font-bold text-amber-700">Pelanggaran berulang: ${Number(rec.skor_dasar) || 0} \u00d7 ${pengali}</p>` : ""}
                ${rec.keterangan ? `<p class="text-xs text-slate-500 break-words">${escapeHtml(rec.keterangan)}</p>` : ""}`;
            return gsRenderBarisCatatan(rec, "tatib", isi, "openModalTatibEdit", "hapusTatib");
        }).join("");

    const body = `
        <div class="space-y-3">
            <div>
                <p class="text-xs font-bold text-slate-700 mb-1.5">Rincian per Kategori</p>
                ${ttRincianKategori(g.records)}
            </div>
            ${ttHtmlPanggilan(g.siswaId)}
            <div class="space-y-2">
                <p class="text-xs font-bold text-slate-700">Riwayat</p>
                <div class="flex gap-1.5 overflow-x-auto pb-1">
                    ${chip("semua", "Semua")}${Object.keys(TT_KAT_LABEL_BAWAAN).map(k => chip(k, k)).join("")}
                </div>
                ${riwayat}
            </div>
        </div>`;

    gsOpenSheet(g, {
        judul: "Tata Tertib", kategori: "tatib",
        ringkasanHtml: `<div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-2">${ttRingkasanHtml(g.siswaId)}${aksi.length ? `<div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">${aksi.join("")}</div>` : ""}</div>`,
        bodyHtml: body, tambahFn: "tambahTatibSiswa"
    });
    const box = document.getElementById("modal-content-box");
    if (box) { box.dataset.gs = "tatib"; box.dataset.gsSiswa = String(g.siswaId); }
}

function tatibRefreshDetail() {
    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal || modal.classList.contains("hidden") || box.dataset.gs !== "tatib") return;
    openDetailTatib(box.dataset.gsSiswa, true);
}

// ---------- panggilan orang tua ----------

async function segarkanSetelahPanggilan() {
    await loadTatibData(true);
    if (typeof checkStudentNotifications === "function") checkStudentNotifications();
}

async function openModalTatibPanggilan(siswaId, tahap = "", id = null) {
    if (tatibRekap.size === 0 && !tatibMemuat) await loadTatibData();
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    const siswa = ttCariSiswa(siswaId);
    const p = id ? (tatibPanggilan || []).find(x => String(x.id) === String(id)) : null;
    if (id && !p) return;
    if (!id && !tatibBisaCatatPanggilan(siswaId)) {
        Swal.fire({ icon: "info", title: "Akses Ditolak", text: "Hanya wali kelas siswa atau admin yang dapat mencatat panggilan orang tua.", confirmButtonColor: "#2563eb" });
        return;
    }
    const sudah = new Set(ttPanggilanSiswa(siswaId).map(x => String(x.tahap)));
    const bolehTahap = id ? [String(p.tahap)] : ["I", "II", "III"].filter(t => !sudah.has(t));
    if (!bolehTahap.length) {
        Swal.fire({ icon: "info", title: "Sudah Lengkap", text: "Panggilan I, II, dan III sudah dicatat.", confirmButtonColor: "#2563eb" });
        return;
    }
    const pilih = bolehTahap.includes(String(tahap)) ? String(tahap) : (ttTertunda(siswaId).find(t => bolehTahap.includes(t)) || bolehTahap[0]);
    const r = ttRekapSiswa(siswaId);
    const inp = "w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none";
    const lbl = "block text-xs font-bold text-slate-500 mb-1";

    box.dataset.gs = "";
    box.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-800">${p ? "Ubah" : "Catat"} Panggilan Orang Tua</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="simpanTatibPanggilan(event, '${escapeHtml(siswaId)}', '${p ? escapeHtml(p.id) : ""}')" class="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs space-y-0.5">
                <p class="font-bold text-slate-800">${escapeHtml(siswa ? siswa.nama : "Siswa")}</p>
                <p class="text-slate-500">${p ? Number(p.skor_saat) || 0 : Number(r.total) || 0} poin pelanggaran${p ? " saat dicatat" : " saat ini (dicatat otomatis)"}</p>
            </div>
            <div>
                <label for="tt-p-tahap" class="${lbl}">TAHAP PANGGILAN</label>
                <select id="tt-p-tahap" class="${inp}" ${p ? "disabled" : ""}>
                    ${bolehTahap.map(t => `<option value="${t}" ${t === pilih ? "selected" : ""}>Panggilan ${t}</option>`).join("")}
                </select>
            </div>
            <div>
                <label for="tt-p-tanggal" class="${lbl}">TANGGAL PANGGILAN</label>
                <input type="date" id="tt-p-tanggal" value="${escapeHtml(p ? p.tanggal : getDateWITA())}" max="${getDateWITA()}" required class="${inp}">
            </div>
            <div>
                <label for="tt-p-catatan" class="${lbl}">CATATAN HASIL PERTEMUAN (opsional)</label>
                <textarea id="tt-p-catatan" rows="3" maxlength="300" class="${inp}" placeholder="Contoh: orang tua hadir, siswa berjanji memperbaiki kehadiran">${escapeHtml(p ? p.catatan : "")}</textarea>
            </div>
            <button type="submit" id="btn-save-tatib-panggilan" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-xs">Simpan Panggilan</button>
        </form>`;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function simpanTatibPanggilan(e, siswaId, id) {
    e.preventDefault();
    const v = (el) => String((document.getElementById(el) || {}).value || "").trim();
    const tanggal = v("tt-p-tanggal");
    if (!tanggal) return;
    const payload = id
        ? { id, tanggal, catatan: v("tt-p-catatan") }
        : { siswa_id: siswaId, tahap: v("tt-p-tahap"), tanggal, catatan: v("tt-p-catatan") };
    const btn = document.getElementById("btn-save-tatib-panggilan");
    if (btn) { btn.disabled = true; btn.classList.add("opacity-60"); }
    const res = await apiCall("saveTatibPanggilan", payload, true);
    if (res && res.status === "success") {
        closeModal();
        showToast(res.message || "Panggilan dicatat.");
        await segarkanSetelahPanggilan();
        openDetailTatib(siswaId);
        return;
    }
    if (btn) { btn.disabled = false; btn.classList.remove("opacity-60"); }
    if (res && res.status === "error") {
        Swal.fire({ icon: "warning", title: "Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
    } else {
        showToast("Koneksi bermasalah. Panggilan belum tersimpan.", "warning");
    }
}

async function hapusTatibPanggilan(id) {
    const p = (tatibPanggilan || []).find(x => String(x.id) === String(id));
    if (!p) return;
    const ok = await Swal.fire({
        icon: "warning", title: "Hapus catatan panggilan?",
        text: `Panggilan ${p.tahap} tanggal ${p.tanggal} dihapus. Notifikasi ambang bisa muncul lagi.`,
        showCancelButton: true, confirmButtonText: "Ya, Hapus", cancelButtonText: "Batal", confirmButtonColor: "#e11d48"
    });
    if (!ok.isConfirmed) return;
    const res = await apiCall("deleteTatibPanggilan", { id }, true);
    if (res && res.status === "success") {
        showToast("Catatan panggilan dihapus.");
        await segarkanSetelahPanggilan();
        openDetailTatib(p.siswa_id, true);
    } else {
        Swal.fire({ icon: "error", title: "Gagal", text: (res && res.message) || "Tidak dapat menghapus.", confirmButtonColor: "#2563eb" });
    }
}

function tambahTatibSiswa(siswaId) {
    openModalTatibInput(siswaId);
}

async function hapusTatib(id) {
    const rec = (appState.tatib || []).find(r => String(r.id) === String(id));
    if (!rec) return;
    const ok = await Swal.fire({
        icon: "warning", title: "Hapus catatan?",
        text: `${rec.nama} (${Number(rec.skor_akhir) || 0} poin). Poin dan pengali siswa dihitung ulang.`,
        showCancelButton: true, confirmButtonText: "Ya, Hapus", cancelButtonText: "Batal", confirmButtonColor: "#e11d48"
    });
    if (!ok.isConfirmed) return;
    const res = await apiCall("deleteTatib", { id }, true);
    if (res && res.status === "success") {
        showToast("Catatan dihapus.");
        await loadTatibData(true);
        if (typeof checkStudentNotifications === "function") checkStudentNotifications();
    } else {
        Swal.fire({ icon: "error", title: "Gagal", text: (res && res.message) || "Tidak dapat menghapus catatan.", confirmButtonColor: "#2563eb" });
    }
}

// ---------- form input (banyak siswa) ----------

async function openModalTatibInput(preSiswaId = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    const writable = sortSiswa(getSiswaWritable("tatib"));
    if (writable.length === 0) {
        Swal.fire({ icon: "info", title: "Tidak Ada Siswa", text: "Tidak ada siswa yang dapat Anda beri catatan tata tertib.", confirmButtonColor: "#2563eb" });
        return;
    }
    const siap = await ttPastikanMaster();
    if (!siap) {
        Swal.fire({ icon: "error", title: "Gagal Memuat", text: "Daftar tata tertib tidak dapat dimuat. Periksa koneksi lalu coba lagi.", confirmButtonColor: "#2563eb" });
        return;
    }
    if (tatibMaster.master.length === 0) {
        Swal.fire({ icon: "info", title: "Daftar Kosong", text: "Daftar tata tertib belum diisi. Hubungi admin.", confirmButtonColor: "#2563eb" });
        return;
    }

    ttForm = {
        writable,
        siswa: new Set(preSiswaId && writable.some(s => String(s.id) === String(preSiswaId)) ? [String(preSiswaId)] : []),
        cariSiswa: "", kelas: "", kat: "A", cariItem: "", masterId: "",
        preview: null, token: 0
    };
    const adaKategori = Object.keys(TT_KAT_LABEL_BAWAAN).find(k => tatibMaster.master.some(m => m.aktif && m.kategori === k));
    if (adaKategori) ttForm.kat = adaKategori;

    const kelasIds = Array.from(new Set(writable.map(s => String(s.kelas_id))));
    const kelasOpt = kelasIds.length > 1
        ? `<select id="tt-kelas" onchange="ttUbahKelas(this.value)" class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none" aria-label="Filter kelas">
              <option value="">Semua kelas</option>
              ${kelasIds.map(id => `<option value="${escapeHtml(id)}">${escapeHtml(gsNamaKelas({ kelas_id: id }) || id)}</option>`).join("")}
           </select>` : "";
    const inp = "w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none";
    const lbl = "block text-xs font-bold text-slate-500 mb-1";

    box.dataset.gs = "";
    box.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-800">Catat Tata Tertib</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="simpanTatibForm(event)" class="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="tt-cari-siswa" class="text-xs font-bold text-slate-500">SISWA</label>
                    <span id="tt-jumlah-siswa" class="text-xs font-bold text-blue-600"></span>
                </div>
                <div class="grid gap-2 ${kelasOpt ? "grid-cols-2" : ""}">
                    <input type="search" id="tt-cari-siswa" oninput="ttCariSiswaInput(this.value)" placeholder="Cari nama siswa..." autocomplete="off" class="${inp}">
                    ${kelasOpt}
                </div>
                <div class="flex gap-2 mt-2">
                    <button type="button" onclick="ttPilihSemuaSiswa()" class="text-xs font-bold text-blue-600">Pilih semua hasil</button>
                    <button type="button" onclick="ttKosongkanSiswa()" class="text-xs font-bold text-slate-500">Kosongkan</button>
                </div>
                <div id="tt-siswa-list" class="mt-1 max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50"></div>
            </div>
            <div>
                <label for="tt-tanggal" class="${lbl}">TANGGAL KEJADIAN</label>
                <input type="date" id="tt-tanggal" value="${getDateWITA()}" max="${getDateWITA()}" required onchange="ttJadwalkanPratinjau()" class="${inp}">
            </div>
            <button type="button" onclick="ttImporAlpa()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5">
                <i class="fas fa-calendar-xmark"></i> Impor Alpa dari Presensi (B4)
            </button>
            <div>
                <p class="${lbl}">KATEGORI</p>
                <div id="tt-kat" class="flex gap-1.5 overflow-x-auto pb-1"></div>
            </div>
            <div>
                <label for="tt-cari-item" class="${lbl}">ITEM</label>
                <input type="search" id="tt-cari-item" oninput="ttCariItemInput(this.value)" placeholder="Cari pelanggaran / penghargaan..." autocomplete="off" class="${inp}">
                <div id="tt-item-list" class="mt-2 max-h-48 overflow-y-auto space-y-1.5"></div>
            </div>
            <div id="tt-skor-wrap"></div>
            <div id="tt-pratinjau" aria-live="polite"></div>
            <div>
                <label for="tt-ket" class="${lbl}">KETERANGAN (opsional)</label>
                <textarea id="tt-ket" rows="2" maxlength="300" class="${inp}" placeholder="Contoh: terlambat 20 menit saat upacara"></textarea>
            </div>
            <button type="submit" id="btn-save-tatib-catatan" class="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs">Simpan Catatan</button>
        </form>`;
    document.getElementById("modal-container")?.classList.remove("hidden");
    ttRenderSiswa();
    ttRenderKategori();
    ttRenderItem();
    ttRenderSkor();
    ttRenderPratinjau();
}

function ttSiswaTersaring() {
    const cari = ttForm.cariSiswa;
    return ttForm.writable.filter(s => {
        if (ttForm.kelas && String(s.kelas_id) !== String(ttForm.kelas)) return false;
        return !cari || String(s.nama || "").toLowerCase().includes(cari);
    });
}

function ttRenderSiswa() {
    const list = document.getElementById("tt-siswa-list");
    const hitung = document.getElementById("tt-jumlah-siswa");
    if (hitung) hitung.textContent = `${ttForm.siswa.size} dipilih (maks. ${TT_MAKS_SISWA})`;
    if (!list) return;
    const tampil = ttSiswaTersaring();
    const potong = tampil.slice(0, TT_MAKS_TAMPIL_SISWA);
    list.innerHTML = potong.map(s => {
        const id = String(s.id);
        return `
            <label class="flex items-center gap-2 px-2.5 py-2 text-xs cursor-pointer hover:bg-slate-50">
                <input type="checkbox" ${ttForm.siswa.has(id) ? "checked" : ""} onchange="ttToggleSiswa('${escapeHtml(id)}', this.checked)">
                <span class="min-w-0 flex-1 truncate font-semibold text-slate-700">${escapeHtml(s.nama)}</span>
                <span class="text-[11px] text-slate-400 shrink-0">${escapeHtml(gsNamaKelas(s))}</span>
            </label>`;
    }).join("") + (tampil.length > potong.length ? `<p class="text-[11px] text-slate-400 px-2.5 py-2">Menampilkan ${potong.length} dari ${tampil.length}. Persempit pencarian.</p>` : "")
        || `<p class="text-xs text-slate-400 px-2.5 py-3 text-center">Tidak ada siswa yang cocok.</p>`;
}

function ttPeringatanBatas() {
    Swal.fire({ icon: "info", title: "Batas Tercapai", text: `Maksimal ${TT_MAKS_SISWA} siswa sekali simpan.`, confirmButtonColor: "#2563eb" });
}

function ttToggleSiswa(id, aktif) {
    if (aktif) {
        if (ttForm.siswa.size >= TT_MAKS_SISWA) { ttPeringatanBatas(); ttRenderSiswa(); return; }
        ttForm.siswa.add(String(id));
    } else {
        ttForm.siswa.delete(String(id));
    }
    ttRenderSiswa();
    ttJadwalkanPratinjau();
}

function ttPilihSemuaSiswa() {
    let terlampaui = false;
    ttSiswaTersaring().forEach(s => {
        if (ttForm.siswa.size >= TT_MAKS_SISWA) { terlampaui = true; return; }
        ttForm.siswa.add(String(s.id));
    });
    if (terlampaui) ttPeringatanBatas();
    ttRenderSiswa();
    ttJadwalkanPratinjau();
}

function ttKosongkanSiswa() {
    ttForm.siswa.clear();
    ttRenderSiswa();
    ttJadwalkanPratinjau();
}

function ttCariSiswaInput(nilai) {
    ttForm.cariSiswa = String(nilai || "").trim().toLowerCase();
    ttRenderSiswa();
}

function ttUbahKelas(nilai) {
    ttForm.kelas = nilai;
    ttRenderSiswa();
}

function ttRenderKategori() {
    const el = document.getElementById("tt-kat");
    if (!el) return;
    el.innerHTML = Object.keys(TT_KAT_LABEL_BAWAAN).map(k => {
        const on = ttForm.kat === k;
        return `<button type="button" onclick="ttPilihKategori('${k}')" aria-pressed="${on}"
            class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition ${on ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}">${k} \u2022 ${escapeHtml(ttNamaKategori(k))}</button>`;
    }).join("");
}

function ttPilihKategori(k) {
    if (ttForm.kat === k) return;
    ttForm.kat = k;
    const m = ttMasterTerpilih();
    if (m && m.kategori !== k) { ttForm.masterId = ""; ttForm.preview = null; }
    ttRenderKategori();
    ttRenderItem();
    ttRenderSkor();
    ttRenderPratinjau();
}

function ttMasterTerpilih() {
    return ttForm && ttForm.masterId ? tatibMaster.master.find(m => m.id === ttForm.masterId) || null : null;
}

function ttCariItemInput(nilai) {
    ttForm.cariItem = String(nilai || "").trim().toLowerCase();
    ttRenderItem();
}

function ttRenderItem() {
    const el = document.getElementById("tt-item-list");
    if (!el) return;
    const cari = ttForm.cariItem;
    const daftar = tatibMaster.master.filter(m => {
        if (!m.aktif || m.kategori !== ttForm.kat) return false;
        return !cari || (String(m.nama) + " " + m.id).toLowerCase().includes(cari);
    });
    el.innerHTML = daftar.map(m => {
        const on = ttForm.masterId === m.id;
        const skor = m.skor_min === m.skor_max ? `${m.skor_min} poin` : `${m.skor_min}\u2013${m.skor_max} poin`;
        const syarat = m.syarat ? ` \u2022 ${escapeHtml(TT_SYARAT_LABEL[m.syarat] || m.syarat)}` : "";
        return `
            <button type="button" onclick="ttPilihItem('${escapeHtml(m.id)}')" aria-pressed="${on}"
                class="w-full text-left px-2.5 py-2 rounded-xl border text-xs ${on ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white hover:bg-slate-50"}">
                <span class="block font-bold text-slate-800 break-words">${escapeHtml(m.nama)}</span>
                <span class="block text-[11px] text-slate-400">${escapeHtml(m.id)} \u2022 ${skor}${syarat}</span>
                ${m.catatan_aturan ? `<span class="block text-[11px] text-slate-400 break-words">${escapeHtml(m.catatan_aturan)}</span>` : ""}
            </button>`;
    }).join("") || `<p class="text-xs text-slate-400 text-center py-3">Tidak ada item yang cocok.</p>`;
}

function ttPilihItem(id) {
    ttForm.masterId = id;
    ttForm.preview = null;
    ttRenderItem();
    ttRenderSkor();
    ttJadwalkanPratinjau();
}

function ttRenderSkor() {
    const wrap = document.getElementById("tt-skor-wrap");
    if (!wrap) return;
    const m = ttMasterTerpilih();
    if (!m) { wrap.innerHTML = ""; return; }
    const lbl = "block text-xs font-bold text-slate-500 mb-1";
    if (m.skor_min === m.skor_max) {
        wrap.innerHTML = `
            <p class="${lbl}">SKOR</p>
            <p class="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">${m.skor_min} poin (tetap)</p>
            <input type="hidden" id="tt-skor" value="${m.skor_min}">`;
    } else {
        wrap.innerHTML = `
            <label for="tt-skor" class="${lbl}">SKOR (${m.skor_min}\u2013${m.skor_max})</label>
            <input type="number" id="tt-skor" min="${m.skor_min}" max="${m.skor_max}" step="1" required value="${m.skor_min}"
                oninput="ttRenderPratinjau()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">`;
    }
}

function ttSkorSaatIni() {
    const el = document.getElementById("tt-skor");
    const s = el ? String(el.value).trim() : "";
    return /^\d+$/.test(s) ? Number(s) : null;
}

function ttJadwalkanPratinjau() {
    ttForm.preview = null;
    ttRenderPratinjau();
    clearTimeout(ttPratinjauTimer);
    const m = ttMasterTerpilih();
    const tanggal = (document.getElementById("tt-tanggal") || {}).value || "";
    if (!m || m.jenis !== "pelanggaran" || ttForm.siswa.size === 0 || !tanggal) return;
    const token = ++ttForm.token;
    const ids = Array.from(ttForm.siswa);
    ttPratinjauTimer = setTimeout(async () => {
        const res = await apiCall("getTatibPratinjau", { siswa_ids: ids, master_id: m.id, tanggal }, false, 1, true);
        if (!ttForm || token !== ttForm.token) return;
        ttForm.preview = (res && res.status === "success" && Array.isArray(res.data)) ? res.data : null;
        ttRenderPratinjau();
    }, 350);
}

function ttRenderPratinjau() {
    const el = document.getElementById("tt-pratinjau");
    if (!el || !ttForm) return;
    const m = ttMasterTerpilih();
    if (!m || ttForm.siswa.size === 0) { el.innerHTML = ""; return; }
    if (m.jenis !== "pelanggaran") {
        el.innerHTML = `<div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl px-3 py-2 text-xs font-semibold">Penghargaan mengurangi total poin pelanggaran. Tidak ada pengali.</div>`;
        return;
    }
    if (!ttForm.preview) {
        el.innerHTML = `<div class="bg-slate-50 border border-slate-100 text-slate-500 rounded-xl px-3 py-2 text-xs">Menghitung pengali...</div>`;
        return;
    }
    const ulang = ttForm.preview.filter(p => Number(p.pengali) > 1);
    if (ulang.length === 0) {
        el.innerHTML = `<div class="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl px-3 py-2 text-xs font-semibold">Kejadian pertama untuk semua siswa terpilih. Skor tidak dikali.</div>`;
        return;
    }
    const skor = ttSkorSaatIni();
    const pengali = Number(ulang[0].pengali);
    const nama = id => (ttCariSiswa(id) || {}).nama || "Siswa";
    const daftar = ulang.slice(0, 6).map(p => `${escapeHtml(nama(p.siswa_id))} (ke-${Number(p.kejadian_ke)})`).join(", ");
    const sisa = ulang.length - 6;
    el.innerHTML = `
        <div class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2 text-xs space-y-1">
            <p class="font-bold"><i class="fas fa-triangle-exclamation mr-1"></i>${ulang.length} dari ${ttForm.preview.length} siswa mengulang pelanggaran ini: skor \u00d7${pengali}</p>
            ${skor !== null ? `<p>Skor akhir: ${skor} \u00d7 ${pengali} = <b>${skor * pengali} poin</b> untuk siswa yang mengulang.</p>` : ""}
            <p class="text-amber-800">${daftar}${sisa > 0 ? ` dan ${sisa} lainnya` : ""}</p>
        </div>`;
}

async function simpanTatibForm(e) {
    e.preventDefault();
    const m = ttMasterTerpilih();
    const peringatan = (text) => Swal.fire({ icon: "warning", title: "Data Belum Lengkap", text, confirmButtonColor: "#2563eb" });
    if (ttForm.siswa.size === 0) return peringatan("Pilih minimal satu siswa.");
    if (!m) return peringatan("Pilih item pelanggaran atau penghargaan.");
    const skor = ttSkorSaatIni();
    if (skor === null || skor < m.skor_min || skor > m.skor_max) {
        return peringatan(`Skor harus bilangan bulat ${m.skor_min === m.skor_max ? m.skor_min : m.skor_min + "-" + m.skor_max}.`);
    }
    const tanggal = (document.getElementById("tt-tanggal") || {}).value || "";
    if (!tanggal) return peringatan("Isi tanggal kejadian.");

    const btn = document.getElementById("btn-save-tatib-catatan");
    if (btn) { btn.disabled = true; btn.classList.add("opacity-60"); }
    const res = await apiCall("saveTatib", {
        siswa_ids: Array.from(ttForm.siswa),
        master_id: m.id,
        skor_dasar: skor,
        tanggal,
        keterangan: ((document.getElementById("tt-ket") || {}).value || "").trim()
    }, true);

    if (res && res.status === "success") {
        const ambang = Array.isArray(res.ambang) ? res.ambang.filter(a => a.naik) : [];
        ttForm = null;
        closeModal();
        showToast(res.message || "Catatan tata tertib disimpan.");
        await loadTatibData(true);
        if (typeof checkStudentNotifications === "function") checkStudentNotifications();
        if (ambang.length) ttLaporAmbang(ambang);
        return;
    }
    if (btn) { btn.disabled = false; btn.classList.remove("opacity-60"); }
    if (res && res.status === "error") {
        Swal.fire({ icon: "warning", title: "Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
    } else {
        showToast("Koneksi bermasalah. Catatan belum tersimpan.", "warning");
    }
}

function ttLaporAmbang(ambang) {
    const baris = ambang.slice(0, 10).map(a => {
        const nama = (ttCariSiswa(a.siswa_id) || {}).nama || "Siswa";
        const label = a.mencapai_batas ? "Batas tercapai" : TT_TAHAP_LABEL[a.tahap];
        return `<li class="flex justify-between gap-3"><span>${escapeHtml(nama)}</span><b>${escapeHtml(label)}</b></li>`;
    }).join("");
    const sisa = ambang.length - 10;
    Swal.fire({
        icon: "info", title: "Ambang Poin Tercapai",
        html: `<ul class="text-left text-sm space-y-1">${baris}</ul>${sisa > 0 ? `<p class="text-xs mt-2">dan ${sisa} siswa lainnya.</p>` : ""}`,
        confirmButtonColor: "#2563eb"
    });
}

// ---------- edit satu catatan ----------

async function openModalTatibEdit(id) {
    const box = document.getElementById("modal-content-box");
    const rec = (appState.tatib || []).find(r => String(r.id) === String(id));
    if (!box || !rec) return;
    await ttPastikanMaster();
    const m = tatibMaster.master.find(x => x.id === String(rec.master_id).trim());
    const min = m ? m.skor_min : 1;
    const max = m ? m.skor_max : 100;
    const siswa = ttCariSiswa(rec.siswa_id);
    const inp = "w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none";
    const lbl = "block text-xs font-bold text-slate-500 mb-1";
    const pengali = Number(rec.pengali) || 1;

    box.dataset.gs = "";
    box.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-800">Ubah Catatan Tata Tertib</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="simpanTatibEdit(event, '${escapeHtml(rec.id)}')" class="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            <div class="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs space-y-0.5">
                <p class="font-bold text-slate-800">${escapeHtml(siswa ? siswa.nama : "Siswa")}</p>
                <p class="text-slate-600 break-words">${escapeHtml(rec.master_id || "")} \u2022 ${escapeHtml(rec.nama)}</p>
                ${pengali > 1 ? `<p class="text-amber-700 font-bold">Pengali \u00d7${pengali} dihitung otomatis oleh server.</p>` : ""}
            </div>
            <div>
                <label for="tt-e-tanggal" class="${lbl}">TANGGAL KEJADIAN</label>
                <input type="date" id="tt-e-tanggal" value="${escapeHtml(rec.tanggal)}" max="${getDateWITA()}" required class="${inp}">
            </div>
            <div>
                <label for="tt-e-skor" class="${lbl}">SKOR (${min}${min === max ? "" : "\u2013" + max})</label>
                <input type="number" id="tt-e-skor" min="${min}" max="${max}" step="1" required value="${Number(rec.skor_dasar) || min}" ${min === max ? "readonly" : ""} class="${inp}">
            </div>
            <div>
                <label for="tt-e-ket" class="${lbl}">KETERANGAN</label>
                <textarea id="tt-e-ket" rows="2" maxlength="300" class="${inp}">${escapeHtml(rec.keterangan || "")}</textarea>
            </div>
            <button type="submit" id="btn-save-tatib-edit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs">Simpan Perubahan</button>
        </form>`;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function simpanTatibEdit(e, id) {
    e.preventDefault();
    const v = (el) => String((document.getElementById(el) || {}).value || "").trim();
    const skor = v("tt-e-skor");
    if (!/^\d+$/.test(skor)) {
        Swal.fire({ icon: "warning", title: "Skor Tidak Valid", text: "Skor harus bilangan bulat.", confirmButtonColor: "#2563eb" });
        return;
    }
    const btn = document.getElementById("btn-save-tatib-edit");
    if (btn) { btn.disabled = true; btn.classList.add("opacity-60"); }
    const res = await apiCall("saveTatib", { id, tanggal: v("tt-e-tanggal"), skor_dasar: Number(skor), keterangan: v("tt-e-ket") }, true);
    if (res && res.status === "success") {
        const siswaId = ((appState.tatib || []).find(r => String(r.id) === String(id)) || {}).siswa_id;
        closeModal();
        showToast(res.message || "Catatan diperbarui.");
        await loadTatibData(true);
        if (typeof checkStudentNotifications === "function") checkStudentNotifications();
        if (siswaId) openDetailTatib(siswaId);
        return;
    }
    if (btn) { btn.disabled = false; btn.classList.remove("opacity-60"); }
    if (res && res.status === "error") {
        Swal.fire({ icon: "warning", title: "Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
    } else {
        showToast("Koneksi bermasalah. Perubahan belum tersimpan.", "warning");
    }
}

// ---------- Tahap 8: siswa, dashboard, impor Alpa ----------

const TT_ID_ALPA = "TT-B04";
let tatibSaya = { ringkasan: null, waktu: 0, memuat: false };

function tatibResetLokal() {
    tatibRekap = new Map();
    tatibPanggilan = [];
    tatibStatistik = null;
    tatibSaya = { ringkasan: null, waktu: 0, memuat: false };
}

function tatibBersihkanLokal(ids) {
    const set = ids instanceof Set ? ids : new Set((ids || []).map(String));
    set.forEach(id => tatibRekap.delete(String(id)));
    tatibPanggilan = (tatibPanggilan || []).filter(p => !set.has(String(p.siswa_id)));
    if (appState.user && set.has(String(appState.user.id))) tatibSaya = { ringkasan: null, waktu: 0, memuat: false };
}

async function tatibMuatSaya(paksa = false) {
    if (!appState.user || appState.user.role !== "siswa" || tatibSaya.memuat) return;
    if (!paksa && tatibSaya.waktu && Date.now() - tatibSaya.waktu < 2 * 60 * 1000) return;
    tatibSaya.memuat = true;
    try {
        const res = await apiCall("getTatib", {}, false, 1, true);
        if (res && res.status === "success" && Array.isArray(res.data)) {
            appState.tatib = res.data;
            tatibSaya.ringkasan = res.ringkasan || null;
            if (res.konfig) tatibKonfig = res.konfig;
            tatibSaya.waktu = Date.now();
        }
    } finally {
        tatibSaya.memuat = false;
    }
    ttRenderKartuSiswa();
}

function ttRiwayatSaya() {
    const uid = appState.user ? String(appState.user.id) : "";
    return (appState.tatib || []).filter(r => String(r.siswa_id) === uid);
}

function ttPesanSiswa(r) {
    const k = ttKonfig();
    if (r.mencapai_batas) return "Poinmu mencapai batas. Segera temui wali kelas.";
    if (r.tahap >= 1) return `Poin pelanggaranmu sudah melewati ${k["panggilan_" + r.tahap]}. Bicaralah dengan wali kelas atau mentor.`;
    return "Aman. Pertahankan kedisiplinanmu.";
}

function ttKartuSiswaHtml(mode) {
    const r = tatibSaya.ringkasan;
    if (!r) return `<p class="sd-note">${tatibSaya.memuat || !tatibSaya.waktu ? "Memuat poin tata tertib..." : "Poin tata tertib belum bisa dimuat."}</p>`;
    const k = ttKonfig();
    const total = Number(r.total) || 0;
    const label = r.mencapai_batas ? "Batas tercapai" : (r.tahap >= 1 ? "Perlu perhatian" : "Aman");
    const badge = r.mencapai_batas ? TT_TAHAP_BADGE[3] : (TT_TAHAP_BADGE[r.tahap] || TT_TAHAP_BADGE[0]);
    const riwayat = ttRiwayatSaya();
    const tampil = riwayat.slice(0, mode === "profil" ? 10 : 3);
    const daftar = tampil.length === 0
        ? `<p class="text-xs text-slate-400">Belum ada catatan.</p>`
        : tampil.map(rec => {
            const peng = String(rec.jenis) === "penghargaan";
            return `<div class="flex justify-between items-start gap-2 text-xs">
                <span class="min-w-0 break-words text-slate-700">${escapeHtml(rec.nama)}<small class="block text-[11px] text-slate-400">${escapeHtml(String(rec.tanggal || "").slice(0, 10))}</small></span>
                <span class="font-extrabold whitespace-nowrap ${peng ? "text-emerald-600" : "text-rose-600"}">${peng ? "\u2212" : "+"}${Number(rec.skor_akhir) || 0}</span>
            </div>`;
        }).join("");
    return `
        <div class="space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                <span class="font-bold text-slate-700">${total} <span class="text-slate-400 font-semibold">/ ${k.batas_keluar} poin</span></span>
                <span class="font-bold px-2 py-0.5 rounded-md border ${badge}">${label}</span>
            </div>
            ${ttBarProgres(r)}
            <p class="text-[11px] text-slate-400">Pelanggaran ${Number(r.pelanggaran) || 0} \u2022 Penghargaan ${Number(r.penghargaan) || 0}</p>
            <p class="text-xs text-slate-600">${escapeHtml(ttPesanSiswa(r))}</p>
            ${mode === "profil" ? `<div class="pt-1">${ttRincianKategori(riwayat)}</div>` : ""}
            <div class="space-y-1.5 pt-2 border-t border-slate-100">${daftar}</div>
        </div>`;
}

function ttKartuBerandaHtml() {
    return `<div id="sd-tatib-card">${sdCard("Poin Tata Tertib", ttKartuSiswaHtml("beranda"))}</div>`;
}

function ttProfilTatibHtml(siswa) {
    if (!appState.user || appState.user.role !== "siswa" || String(siswa.id) !== String(appState.user.id)) return "";
    setTimeout(() => tatibMuatSaya(true), 0);
    return `<div id="profil-tatib-card" class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-gavel text-amber-500 mr-1.5"></i>Poin Tata Tertib</h4>
        ${ttKartuSiswaHtml("profil")}
    </div>`;
}

function ttRenderKartuSiswa() {
    const home = document.getElementById("sd-tatib-card");
    if (home) home.outerHTML = ttKartuBerandaHtml();
    const prof = document.getElementById("profil-tatib-card");
    if (prof) {
        prof.innerHTML = `<h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-gavel text-amber-500 mr-1.5"></i>Poin Tata Tertib</h4>${ttKartuSiswaHtml("profil")}`;
    }
}

// Dashboard staf: panggilan orang tua yang belum dan sudah ditangani.
function tatibRenderStatusDashboard(res) {
    let box = document.getElementById("dash-tatib-status");
    const role = appState.user && appState.user.role;
    if (!role || role === "siswa" || role === "ortu" || !res || res.status !== "success" || !Array.isArray(res.data)) {
        if (box) box.remove();
        return;
    }
    if (!box) {
        const anchor = document.getElementById("dash-section-agenda");
        if (!anchor) return;
        anchor.insertAdjacentHTML("beforebegin", `<div id="dash-tatib-status"></div>`);
        box = document.getElementById("dash-tatib-status");
    }
    let perlu = 0, ditangani = 0, batas = 0;
    res.data.forEach(r => {
        const s = (appState.siswa || []).find(x => String(x.id) === String(r.siswa_id));
        if (!s || (typeof isSiswaInPeran === "function" && !isSiswaInPeran(s))) return;
        const tertunda = Array.isArray(r.panggilan_tertunda) ? r.panggilan_tertunda : [];
        if (tertunda.length > 0) perlu++;
        else if ((Number(r.tahap) || 0) >= 1) ditangani++;
        if (r.mencapai_batas) batas++;
    });
    const sel = (n, label, warna) => `<div class="rounded-xl border border-slate-100 p-2 text-center ${warna}"><p class="text-lg font-black leading-tight">${n}</p><p class="text-[11px] font-bold">${label}</p></div>`;
    box.innerHTML = `
        <div class="flex justify-between items-center mb-2 px-1">
            <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tata Tertib: Panggilan Orang Tua</h2>
            <button type="button" class="dash-section-link" onclick="switchView('tatib')">Lihat Semua <i class="fas fa-chevron-right text-[10px]"></i></button>
        </div>
        <div class="grid grid-cols-3 gap-2">
            ${sel(perlu, "Belum ditangani", "bg-violet-50 text-violet-700")}
            ${sel(ditangani, "Sudah ditangani", "bg-emerald-50 text-emerald-700")}
            ${sel(batas, "Mencapai batas", "bg-rose-50 text-rose-700")}
        </div>`;
}

// Impor saran Alpa dari presensi: pilih siswa Alpa pada tanggal terpilih, item B4. Tetap perlu Simpan.
async function ttImporAlpa() {
    if (!ttForm) return;
    const tanggal = (document.getElementById("tt-tanggal") || {}).value || "";
    if (!tanggal) { showToast("Isi tanggal kejadian dulu.", "warning"); return; }
    const m = tatibMaster.master.find(x => x.id === TT_ID_ALPA);
    if (!m || !m.aktif) {
        Swal.fire({ icon: "info", title: "Item B4 Tidak Ada", text: "Item Alpa (B4) tidak ditemukan atau tidak aktif di daftar tata tertib.", confirmButtonColor: "#2563eb" });
        return;
    }
    const res = await apiCall("getAbsensi", { tanggal }, false, 1, true);
    if (!res || res.status !== "success" || !Array.isArray(res.data)) {
        showToast("Presensi tidak dapat dimuat.", "warning");
        return;
    }
    const boleh = new Set(ttForm.writable.map(s => String(s.id)));
    const sudah = new Set((appState.tatib || [])
        .filter(r => r.master_id === TT_ID_ALPA && String(r.tanggal).slice(0, 10) === tanggal)
        .map(r => String(r.siswa_id)));
    const ids = Array.from(new Set(res.data
        .filter(a => String(a.status) === "A")
        .map(a => String(a.siswa_id))
        .filter(id => boleh.has(id) && !sudah.has(id))));
    if (ids.length === 0) {
        showToast("Tidak ada siswa Alpa yang belum tercatat pada tanggal ini.", "info");
        return;
    }
    const nama = id => (ttCariSiswa(id) || {}).nama || "Siswa";
    const daftar = ids.slice(0, 8).map(id => escapeHtml(nama(id))).join(", ") + (ids.length > 8 ? ` dan ${ids.length - 8} lainnya` : "");
    const ok = await Swal.fire({
        icon: "question", title: `${ids.length} siswa Alpa`,
        html: `<p style="font-size:13px">${daftar}</p><p style="font-size:12px;margin-top:6px">Pilih mereka dengan item B4 (${m.skor_min} poin)?</p>`,
        showCancelButton: true, confirmButtonText: "Pilih", cancelButtonText: "Batal", confirmButtonColor: "#2563eb"
    });
    if (!ok.isConfirmed || !ttForm) return;
    ids.forEach(id => ttForm.siswa.add(id));
    ttForm.kat = m.kategori;
    ttForm.masterId = m.id;
    ttForm.cariItem = "";
    const cari = document.getElementById("tt-cari-item");
    if (cari) cari.value = "";
    ttRenderSiswa();
    ttRenderKategori();
    ttRenderItem();
    ttRenderSkor();
    ttJadwalkanPratinjau();
}


// ---------- Tata Tertib Sekolah (baca saja, untuk siswa) ----------

let ttBacaKata = "";

async function renderTatibBaca() {
    const list = document.getElementById("tatib-baca-list");
    if (!list) return;
    if (tatibMaster.master.length === 0) renderSkeleton("tatib-baca-list", 3);
    const ok = await ttPastikanMaster();
    if (!ok || tatibMaster.master.length === 0) {
        const info = document.getElementById("tatib-baca-info");
        if (info) info.innerHTML = "";
        list.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i>
            <p class="text-xs text-slate-500">Tata tertib belum bisa dimuat. Periksa koneksi lalu coba lagi.</p>
            <button type="button" onclick="renderTatibBaca()" class="mt-2 text-xs font-bold text-blue-600"><i class="fas fa-rotate mr-1"></i> Muat ulang</button></div>`;
        return;
    }
    ttBacaRenderInfo();
    ttBacaRenderList();
}

function ttBacaCari(nilai) {
    ttBacaKata = String(nilai || "").trim().toLowerCase();
    ttBacaRenderList();
}

function ttBacaRenderInfo() {
    const el = document.getElementById("tatib-baca-info");
    if (!el) return;
    const k = ttKonfig();
    el.innerHTML = `
        <div class="bg-amber-50 border border-amber-100 rounded-2xl p-3 space-y-1">
            <p class="text-xs font-bold text-amber-700"><i class="fas fa-circle-info mr-1"></i> Cara kerja poin</p>
            <p class="text-xs text-amber-800">Setiap pelanggaran menambah poin. Penghargaan mengurangi poin. Total poin tidak kurang dari 0.</p>
            <p class="text-xs text-amber-800">Panggilan orang tua tahap I pada ${Number(k.panggilan_1) || 0} poin, tahap II pada ${Number(k.panggilan_2) || 0} poin, tahap III pada ${Number(k.panggilan_3) || 0} poin. Batas akumulasi ${Number(k.batas_keluar) || 0} poin.</p>
        </div>`;
}

function ttBacaRenderList() {
    const list = document.getElementById("tatib-baca-list");
    if (!list) return;
    const kata = ttBacaKata;
    const items = tatibMaster.master.filter(m => {
        if (m.aktif === false) return false;
        if (!kata) return true;
        const syarat = m.syarat ? (TT_SYARAT_LABEL[m.syarat] || m.syarat) : "";
        return `${m.kategori}${m.no} ${m.nama} ${m.catatan_aturan || ""} ${syarat} ${ttNamaKategori(m.kategori)}`.toLowerCase().includes(kata);
    });
    if (items.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-magnifying-glass text-2xl mb-2"></i><p class="text-xs text-slate-500">${kata ? "Tidak ada aturan yang cocok dengan pencarian." : "Belum ada aturan tata tertib."}</p></div>`;
        return;
    }
    const kategoriUrut = Array.from(new Set(items.map(m => m.kategori)));
    list.innerHTML = kategoriUrut.map(kat => {
        const daftar = items.filter(m => m.kategori === kat);
        const warna = TT_KAT_WARNA[kat] || "text-slate-600 bg-slate-50";
        const baris = daftar.map(m => {
            const penghargaan = m.jenis === "penghargaan";
            const skor = m.skor_min === m.skor_max ? `${m.skor_min}` : `${m.skor_min}\u2013${m.skor_max}`;
            const skorTeks = penghargaan ? `\u2212${skor} poin` : `+${skor} poin`;
            const skorWarna = penghargaan ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200";
            const syarat = m.syarat ? `<span class="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 mr-1">Khusus ${escapeHtml(TT_SYARAT_LABEL[m.syarat] || m.syarat)}</span>` : "";
            return `
                <li class="flex items-start gap-3 p-3">
                    <span class="shrink-0 text-[11px] font-bold rounded-lg px-2 py-1 ${warna}">${escapeHtml(kat + m.no)}</span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-semibold text-slate-700 break-words">${escapeHtml(m.nama)}</p>
                        ${m.catatan_aturan ? `<p class="text-[11px] text-slate-400 break-words mt-0.5">${escapeHtml(m.catatan_aturan)}</p>` : ""}
                        ${syarat ? `<p class="mt-1">${syarat}</p>` : ""}
                    </div>
                    <span class="shrink-0 text-[11px] font-bold border rounded-lg px-2 py-1 ${skorWarna}">${escapeHtml(skorTeks)}</span>
                </li>`;
        }).join("");
        return `
            <details class="bg-surface rounded-2xl border border-slate-100 shadow-sm overflow-hidden" open>
                <summary class="flex items-center gap-2 px-3 py-3 cursor-pointer select-none">
                    <span class="text-[11px] font-bold rounded-lg px-2 py-1 ${warna}">${escapeHtml(kat)}</span>
                    <span class="text-sm font-bold text-slate-800 flex-1">${escapeHtml(ttNamaKategori(kat))}</span>
                    <span class="text-[11px] text-slate-400">${daftar.length} aturan</span>
                </summary>
                <ul class="divide-y divide-slate-100 border-t border-slate-100">${baris}</ul>
            </details>`;
    }).join("");
}
