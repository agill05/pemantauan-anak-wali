/* Tahap 7: Rekap poin tata tertib per kelas (tab di Laporan) + PDF Surat Panggilan Orang Tua.
 * Dimuat SETELAH laporan.js dan tatib.js. Tidak mengubah file lain selain membungkus setLaporanTab. */

let tlData = null;
let tlMemuat = false;
const TL_ROMAWI = ["", "I", "II", "III"];

function tlVal(id) { return String((document.getElementById(id) || {}).value || ""); }

function tlInjectUI() {
    if (document.getElementById("laporan-panel-tatib")) return;
    const view = document.getElementById("view-laporan");
    const panelKeb = document.getElementById("laporan-panel-kebiasaan");
    const btnKeb = document.getElementById("btn-laporan-tab-kebiasaan");
    if (!view || !panelKeb || !btnKeb) return;

    const b = document.createElement("button");
    b.type = "button";
    b.id = "btn-laporan-tab-tatib";
    b.setAttribute("aria-pressed", "false");
    b.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-600";
    b.textContent = "Tata Tertib";
    b.addEventListener("click", () => setLaporanTab("tatib"));
    btnKeb.insertAdjacentElement("afterend", b);

    const cls = "w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold outline-none text-slate-700";
    const lbl = "block text-xs font-bold text-slate-500 uppercase mb-1";
    const btn = "font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition text-white";
    const p = document.createElement("div");
    p.id = "laporan-panel-tatib";
    p.className = "space-y-4 hidden";
    p.innerHTML = `
        <div class="bg-surface p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div>
                <h2 class="text-sm font-bold text-slate-800"><i class="fas fa-gavel text-amber-500 mr-2"></i>Rekap Poin Tata Tertib</h2>
                <p class="text-xs text-slate-400">Poin pelanggaran per kelas, status ambang, dan Surat Panggilan Orang Tua</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <div><label for="lt-kelas" class="${lbl}">Kelas</label><select id="lt-kelas" onchange="renderLaporanTatib()" class="${cls}"></select></div>
                <div><label for="lt-ta" class="${lbl}">Periode</label><select id="lt-ta" onchange="muatLaporanTatib(true)" class="${cls}"></select></div>
                <div><label for="lt-status" class="${lbl}">Tampilkan</label>
                    <select id="lt-status" onchange="renderLaporanTatib()" class="${cls}">
                        <option value="">Siswa yang punya catatan</option>
                        <option value="tertunda">Panggilan belum dicatat</option>
                        <option value="t1">Panggilan I</option>
                        <option value="t2">Panggilan II</option>
                        <option value="t3">Panggilan III</option>
                        <option value="batas">Mencapai batas</option>
                        <option value="aman">Aman</option>
                        <option value="semua">Semua siswa</option>
                    </select></div>
            </div>
            <div class="grid grid-cols-3 gap-2 pt-1">
                <button type="button" onclick="eksporLaporanTatibCSV()" class="bg-emerald-600 hover:bg-emerald-700 ${btn}"><i class="fas fa-file-excel"></i> Excel</button>
                <button type="button" onclick="cetakLaporanTatib()" class="bg-blue-600 hover:bg-blue-700 ${btn}"><i class="fas fa-print"></i> Cetak PDF</button>
                <button type="button" onclick="eksporLaporanTatibPDF()" class="bg-slate-800 hover:bg-slate-900 ${btn}"><i class="fas fa-file-pdf"></i> Eksport PDF</button>
            </div>
        </div>
        <div id="lt-ringkas" class="space-y-2"></div>
        <div id="lt-container" class="space-y-2"></div>`;
    panelKeb.insertAdjacentElement("afterend", p);
}

const tlSetTabAsli = setLaporanTab;
setLaporanTab = function (tab) {
    tlSetTabAsli(tab);
    tlInjectUI();
    const panel = document.getElementById("laporan-panel-tatib");
    const btn = document.getElementById("btn-laporan-tab-tatib");
    const aktif = tab === "tatib";
    if (panel) panel.classList.toggle("hidden", !aktif);
    if (btn) {
        btn.classList.toggle("bg-white", aktif);
        btn.classList.toggle("text-primary", aktif);
        btn.classList.toggle("shadow-sm", aktif);
        btn.classList.toggle("text-slate-600", !aktif);
        btn.setAttribute("aria-pressed", String(aktif));
    }
    if (aktif) {
        animateSwap(panel, "left");
        tlInit();
    }
};

function tlOpsiTahunAjaran() {
    const d = (typeof arsipTahunAjaranDefault === "function") ? arsipTahunAjaranDefault() : null;
    const awal = d ? Number(d.ta.slice(0, 4)) : new Date().getFullYear() - 1;
    const ta = n => `${n}/${n + 1}`;
    return [["", "Kumulatif (semua waktu)"], [ta(awal), "TA " + ta(awal)], [ta(awal - 1), "TA " + ta(awal - 1)]];
}

function tlInit() {
    const kel = document.getElementById("lt-kelas");
    if (kel) {
        kel.innerHTML = renderKelasSelectOptions(kel.value, { allLabel: "Semua Kelas", prefix: "Kelas " });
        applyKelasSelectLock(kel);
    }
    const ta = document.getElementById("lt-ta");
    if (ta && ta.options.length === 0) {
        ta.innerHTML = tlOpsiTahunAjaran().map(o => `<option value="${escapeHtml(o[0])}">${escapeHtml(o[1])}</option>`).join("");
    }
    if (tlData) renderLaporanTatib();
    else muatLaporanTatib(true);
}

async function muatLaporanTatib(paksa) {
    if (tlMemuat) return;
    const ta = tlVal("lt-ta");
    if (!paksa && tlData && tlData.ta === ta) { renderLaporanTatib(); return; }
    tlMemuat = true;
    renderSkeleton("lt-container", 3);
    const res = await apiCall("getRekapTatib", ta ? { tahun_ajaran: ta } : {}, false);
    tlMemuat = false;
    if (res && res.status === "success" && Array.isArray(res.data)) {
        tlData = { ta: ta, data: res.data, konfig: res.konfig || ttKonfig() };
        renderLaporanTatib();
    } else {
        const el = document.getElementById("lt-container");
        if (el) el.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i><p class="text-xs text-slate-500">${escapeHtml((res && res.message) || "Rekap gagal dimuat. Periksa koneksi lalu coba lagi.")}</p></div>`;
    }
}

function tlNamaSiswa(id) {
    const s = (appState.siswa || []).find(x => String(x.id) === String(id));
    return s ? s.nama : "Siswa";
}

function tlNamaKelas(id) {
    const k = (appState.kelas || []).find(x => String(x.id) === String(id));
    return k ? k.nama_kelas : "-";
}

// Siswa dalam cakupan peran dan filter kelas (tanpa filter status).
function tlBase() {
    if (!tlData) return [];
    const kelas = getEffectiveKelasFilter(tlVal("lt-kelas"));
    return scopeBySiswaId(tlData.data, r => r.siswa_id).filter(r => !kelas || String(r.kelas_id) === String(kelas));
}

function tlFiltered() {
    const st = tlVal("lt-status");
    return tlBase().filter(r => {
        const tert = (r.panggilan_tertunda || []).length > 0;
        if (st === "semua") return true;
        if (st === "tertunda") return tert;
        if (st === "t1") return r.tahap === 1 && !r.mencapai_batas;
        if (st === "t2") return r.tahap === 2 && !r.mencapai_batas;
        if (st === "t3") return r.tahap === 3 && !r.mencapai_batas;
        if (st === "batas") return !!r.mencapai_batas;
        if (st === "aman") return r.tahap === 0 && !r.mencapai_batas;
        return Number(r.jumlah_catatan) > 0;
    });
}

function tlLabelStatus(r) {
    return r.mencapai_batas ? "Batas tercapai" : (TT_TAHAP_LABEL[r.tahap] || TT_TAHAP_LABEL[0]);
}

function tlRingkasKelas(base) {
    const peta = new Map();
    base.forEach(r => {
        const k = String(r.kelas_id || "");
        if (!peta.has(k)) peta.set(k, { kelas_id: k, siswa: 0, t0: 0, t1: 0, t2: 0, t3: 0, batas: 0, tertunda: 0 });
        const o = peta.get(k);
        o.siswa++;
        if (r.mencapai_batas) o.batas++;
        else o["t" + r.tahap]++;
        if ((r.panggilan_tertunda || []).length) o.tertunda++;
    });
    return Array.from(peta.values()).sort((a, b) => tlNamaKelas(a.kelas_id).localeCompare(tlNamaKelas(b.kelas_id), "id", { numeric: true }));
}

function renderLaporanTatib() {
    const wadah = document.getElementById("lt-container");
    const ringkas = document.getElementById("lt-ringkas");
    if (!wadah || !tlData) return;
    const base = tlBase();
    const rows = tlFiltered();

    if (ringkas) {
        const chip = (n, t, cls) => `<span class="px-1.5 py-0.5 rounded border text-[11px] font-bold ${cls}">${t} ${n}</span>`;
        ringkas.innerHTML = tlRingkasKelas(base).map(o => `
            <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between gap-2 mb-1.5">
                    <p class="text-xs font-bold text-slate-800">Kelas ${escapeHtml(tlNamaKelas(o.kelas_id))}</p>
                    <span class="text-[11px] text-slate-400">${o.siswa} siswa${o.tertunda ? ` \u2022 ${o.tertunda} panggilan belum dicatat` : ""}</span>
                </div>
                <div class="flex flex-wrap gap-1">
                    ${chip(o.t0, "Aman", TT_TAHAP_BADGE[0])}${chip(o.t1, "P I", TT_TAHAP_BADGE[1])}${chip(o.t2, "P II", TT_TAHAP_BADGE[2])}${chip(o.t3, "P III", TT_TAHAP_BADGE[3])}${chip(o.batas, "Batas", "bg-rose-100 text-rose-800 border-rose-300")}
                </div>
            </div>`).join("");
    }

    if (rows.length === 0) {
        wadah.innerHTML = `<div class="empty-state"><i class="fas fa-filter text-2xl mb-2 text-amber-400"></i><p class="text-xs text-slate-500 font-medium">Tidak ada siswa yang cocok dengan filter.</p></div>`;
        return;
    }
    const adaTa = !!tlData.ta;
    const bisaSurat = !isSiswaAktif();
    wadah.innerHTML = rows.map(r => {
        const siswa = (appState.siswa || []).find(x => String(x.id) === String(r.siswa_id));
        const badge = r.mencapai_batas ? TT_TAHAP_BADGE[3] : (TT_TAHAP_BADGE[r.tahap] || TT_TAHAP_BADGE[0]);
        const tert = (r.panggilan_tertunda || []);
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <h4 class="font-bold text-xs text-slate-800 truncate">${escapeHtml(tlNamaSiswa(r.siswa_id))} ${renderPeranChip(siswa)}</h4>
                        <p class="text-[11px] text-slate-400">Kelas ${escapeHtml(tlNamaKelas(r.kelas_id))} \u2022 ${Number(r.jumlah_catatan) || 0} catatan</p>
                    </div>
                    <span class="shrink-0 text-xs font-bold px-2 py-0.5 rounded-md border ${badge}">${escapeHtml(tlLabelStatus(r))}</span>
                </div>
                <div class="space-y-1">
                    <p class="text-xs font-bold text-slate-700">${Number(r.total) || 0} <span class="text-slate-400 font-semibold">/ ${tlData.konfig.batas_keluar} poin</span></p>
                    ${ttBarProgres(r)}
                    <p class="text-[11px] text-slate-400">Pelanggaran ${Number(r.pelanggaran) || 0} \u2022 Penghargaan ${Number(r.penghargaan) || 0}${adaTa && r.periode ? ` \u2022 Poin ${escapeHtml(tlData.ta)}: ${Number(r.periode.total) || 0}` : ""}</p>
                    <p class="text-[11px] text-slate-500">Panggilan dicatat: ${(r.panggilan_tercatat || []).length ? escapeHtml((r.panggilan_tercatat || []).join(", ")) : "-"}${tert.length ? ` \u2022 <b class="text-violet-700">belum: ${escapeHtml(tert.join(", "))}</b>` : ""}</p>
                </div>
                ${bisaSurat && r.tahap >= 1 ? `
                <div class="flex justify-end pt-1 border-t border-slate-50">
                    <button type="button" onclick="tlSuratPanggilan('${escapeHtml(r.siswa_id)}')" class="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"><i class="fas fa-envelope-open-text"></i> Surat Panggilan</button>
                </div>` : ""}
            </div>`;
    }).join("");
}

// ---------- rekap: PDF dan CSV ----------

function tlJudul() {
    return isGuruUser() ? "REKAPITULASI POIN TATA TERTIB " + getLabelSiswa().toUpperCase() : "REKAPITULASI POIN TATA TERTIB SISWA";
}

function tlHtmlRekap(base, rows) {
    const e = escapeHtml;
    const t = v => e(bersihkanTeksPdf(v));
    const adaTa = !!tlData.ta;
    const kelasFilter = getEffectiveKelasFilter(tlVal("lt-kelas"));
    const info = pdfInfoBlock([
        { label: "Kelas", value: kelasFilter ? tlNamaKelas(kelasFilter) : "Semua kelas" },
        { label: "Periode", value: adaTa ? "Tahun ajaran " + tlData.ta : "Kumulatif" },
        { label: "Ambang", value: `Panggilan I ${tlData.konfig.panggilan_1}, II ${tlData.konfig.panggilan_2}, III ${tlData.konfig.panggilan_3}, batas ${tlData.konfig.batas_keluar} poin` }
    ]);
    const c = v => `<td style="text-align: center;">${v}</td>`;
    const ringkasan = tlRingkasKelas(base).map((o, i) => `<tr>${c(i + 1)}<td style="text-align: left; font-weight: bold;">${t(tlNamaKelas(o.kelas_id))}</td>${c(o.siswa)}${c(o.t0)}${c(o.t1)}${c(o.t2)}${c(o.t3)}${c(o.batas)}${c(o.tertunda)}</tr>`).join("");
    const th = (v, w) => `<th${w ? ` style="width: ${w}px;"` : ""}>${v}</th>`;
    const detail = rows.map((r, i) => `<tr>${c(i + 1)}<td style="text-align: left; font-weight: bold;">${t(tlNamaSiswa(r.siswa_id))}</td>${c(t(tlNamaKelas(r.kelas_id)))}${c(r.pelanggaran)}${c(r.penghargaan)}<td style="text-align: center; font-weight: bold;">${r.total}</td>${adaTa ? c(r.periode ? r.periode.total : "-") : ""}${c(t(tlLabelStatus(r)))}${c(t((r.panggilan_tercatat || []).join(", ") || "-"))}</tr>`).join("");
    return `
        ${info}
        <h4>A. Ringkasan per Kelas</h4>
        <table><thead><tr>${th("No", 30)}${th("Kelas")}${th("Siswa", 50)}${th("Aman", 50)}${th("P I", 45)}${th("P II", 45)}${th("P III", 45)}${th("Batas", 50)}${th("Belum Dicatat", 85)}</tr></thead>
        <tbody>${ringkasan || `<tr><td colspan="9" style="text-align: center;">Tidak ada data</td></tr>`}</tbody></table>
        <h4>B. Daftar Siswa</h4>
        <table><thead><tr>${th("No", 30)}<th style="text-align: left;">Nama Siswa</th>${th("Kelas", 55)}${th("Pelanggaran", 75)}${th("Penghargaan", 80)}${th("Total", 45)}${adaTa ? th("Poin TA", 55) : ""}${th("Status", 95)}${th("Panggilan Dicatat", 100)}</tr></thead>
        <tbody>${detail || `<tr><td colspan="${adaTa ? 9 : 8}" style="text-align: center;">Tidak ada data</td></tr>`}</tbody></table>
        <p><b>Keterangan:</b> Total = poin pelanggaran dikurangi penghargaan (minimal 0). P I/II/III = tahap Panggilan Orang Tua.</p>`;
}

async function tlSiapkan() {
    if (blokirSiswaPdf()) return null;
    if (!tlData) await muatLaporanTatib(true);
    if (!tlData) return null;
    const rows = tlFiltered();
    if (rows.length === 0) {
        Swal.fire({ icon: "warning", title: "Data Kosong", text: "Tidak ada data tata tertib untuk diekspor.", confirmButtonColor: "#2563eb" });
        return null;
    }
    return { base: tlBase(), rows: rows };
}

async function cetakLaporanTatib() {
    const d = await tlSiapkan();
    if (d) printFeaturePDF(tlJudul(), tlHtmlRekap(d.base, d.rows), { orientation: "landscape" });
}

async function eksporLaporanTatibPDF() {
    const d = await tlSiapkan();
    if (d) exportFeaturePDF(tlJudul(), tlHtmlRekap(d.base, d.rows), `Rekap_Tata_Tertib_${getDateWITA()}.pdf`, { orientation: "landscape" });
}

async function eksporLaporanTatibCSV() {
    const d = await tlSiapkan();
    if (!d) return;
    const adaTa = !!tlData.ta;
    const kepala = ["No", "Nama Siswa", "Kelas", "Jumlah Catatan", "Pelanggaran", "Penghargaan", "Total"]
        .concat(adaTa ? ["Poin " + tlData.ta] : []).concat(["Status", "Panggilan Dicatat", "Panggilan Belum Dicatat"]);
    let csv = "\uFEFF" + kepala.map(csvSel).join(",") + "\n";
    d.rows.forEach((r, i) => {
        const baris = [i + 1, tlNamaSiswa(r.siswa_id), tlNamaKelas(r.kelas_id), r.jumlah_catatan, r.pelanggaran, r.penghargaan, r.total]
            .concat(adaTa ? [r.periode ? r.periode.total : ""] : [])
            .concat([tlLabelStatus(r), (r.panggilan_tercatat || []).join(" "), (r.panggilan_tertunda || []).join(" ")]);
        csv += baris.map(csvSel).join(",") + "\n";
    });
    _downloadCSVString(csv, `Rekap_Tata_Tertib_${getDateWITA()}.csv`);
    showToast("File Excel/CSV berhasil diunduh!");
}

// ---------- Surat Panggilan Orang Tua ----------

function tlHari(tgl) {
    const d = new Date(tgl + "T00:00:00Z");
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("id-ID", { weekday: "long", timeZone: "UTC" });
}

function tlWali(siswa) {
    const u = appState.user;
    if (isGuruUser()) return { nama: u.nama, nip: getGuruNip() };
    const kl = (appState.kelas || []).find(k => String(k.id) === String(siswa && siswa.kelas_id));
    const g = kl && kl.guru_id ? (appState.guru || []).find(x => String(x.id) === String(kl.guru_id)) : null;
    return { nama: (g && g.nama) || "............................................", nip: (g && g.nip) || "........................................" };
}

function tlHtmlSurat(o) {
    const e = escapeHtml;
    const t = v => e(bersihkanTeksPdf(v));
    const { siswa, row, ringkasan, catatan, form, konfig } = o;
    const romawi = TL_ROMAWI[form.tahap];
    const ambang = konfig["panggilan_" + form.tahap];
    const total = ringkasan ? ringkasan.total : row.total;
    const pel = catatan.filter(c => String(c.jenis) !== "penghargaan").sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
    const c = v => `<td style="text-align: center;">${v}</td>`;
    const baris = pel.map((x, i) => `<tr>${c(i + 1)}${c(e(tanggalPendek(x.tanggal)))}<td style="text-align: left;">${t(x.nama)}${Number(x.pengali) > 1 ? ` (x${Number(x.pengali)})` : ""}</td>${c(Number(x.skor_akhir) || 0)}</tr>`).join("");
    const tahap3 = form.tahap === 3
        ? ` Panggilan ini merupakan panggilan terakhir sebelum akumulasi mencapai batas ${konfig.batas_keluar} poin.` : "";
    const hariTgl = [tlHari(form.tanggal), formatTanggalLabel(form.tanggal)].filter(Boolean).join(", ");

    return `
        ${pdfInfoBlock([
            { label: "Nomor", value: form.nomor || "....... / ....... / " + getDateWITA().slice(0, 4) },
            { label: "Lampiran", value: "1 (satu) berkas rincian poin" },
            { label: "Perihal", value: "Panggilan Orang Tua/Wali (Panggilan " + romawi + ")" }
        ])}
        <p>Yth. Bapak/Ibu Orang Tua/Wali dari ananda:</p>
        ${pdfInfoBlock([
            { label: "Nama", value: siswa.nama },
            { label: "Kelas", value: tlNamaKelas(siswa.kelas_id) },
            { label: "NISN", value: siswa.nisn || "-" }
        ])}
        <p>Assalamu'alaikum Warahmatullahi Wabarakatuh. Berdasarkan catatan tata tertib SMP Negeri 1 Talaga Jaya, ananda tercatat memiliki akumulasi poin pelanggaran sebesar <b>${total} poin</b> dan telah mencapai ambang Panggilan Orang Tua ${romawi} (${ambang} poin).${tahap3}</p>
        <p>Sehubungan dengan hal tersebut, kami mengundang Bapak/Ibu untuk hadir pada:</p>
        ${pdfInfoBlock([
            { label: "Hari/Tanggal", value: hariTgl },
            { label: "Pukul", value: form.jam + " WITA" },
            { label: "Tempat", value: form.tempat },
            { label: "Acara", value: "Pembinaan dan pembahasan perkembangan ananda" }
        ])}
        <p>Rincian poin pelanggaran ananda:</p>
        <table><thead><tr><th style="width: 30px;">No</th><th style="width: 80px;">Tanggal</th><th style="text-align: left;">Pelanggaran</th><th style="width: 55px;">Poin</th></tr></thead>
        <tbody>${baris || `<tr><td colspan="4" style="text-align: center;">Tidak ada rincian</td></tr>`}</tbody></table>
        <p>Total poin pelanggaran: <b>${ringkasan ? ringkasan.pelanggaran : row.pelanggaran}</b>. Penghargaan: <b>${ringkasan ? ringkasan.penghargaan : row.penghargaan}</b>. Akumulasi (pelanggaran dikurangi penghargaan): <b>${total} poin</b>.</p>
        <p>Demikian surat ini kami sampaikan. Atas kehadiran dan kerja sama Bapak/Ibu, kami ucapkan terima kasih. Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>`;
}

async function tlSuratPanggilan(siswaId) {
    if (blokirSiswaPdf()) return;
    if (!pdfLibReady()) return;
    const row = tlData && tlData.data.find(r => String(r.siswa_id) === String(siswaId));
    const siswa = (appState.siswa || []).find(s => String(s.id) === String(siswaId));
    if (!row || !siswa) return;
    if (row.tahap < 1) {
        Swal.fire({ icon: "info", title: "Belum Ada Panggilan", text: "Poin siswa ini belum mencapai ambang Panggilan I.", confirmButtonColor: "#2563eb" });
        return;
    }
    const tert = (row.panggilan_tertunda || []);
    const awal = tert.length ? TL_ROMAWI.indexOf(tert[0]) : row.tahap;
    const opsiTahap = [1, 2, 3].filter(n => n <= row.tahap)
        .map(n => `<option value="${n}" ${n === awal ? "selected" : ""}>Panggilan ${TL_ROMAWI[n]}</option>`).join("");
    const gaya = `style="width:100%;margin:4px 0 10px;font-size:14px"`;
    const lbl = `style="display:block;font-size:12px;font-weight:700;color:#64748b"`;

    const baca = () => {
        const v = id => String((document.getElementById(id) || {}).value || "").trim();
        const o = { tahap: Number(v("sp-tahap")), tanggal: v("sp-tgl"), jam: v("sp-jam"), tempat: v("sp-tempat") || "SMP Negeri 1 Talaga Jaya", nomor: v("sp-nomor") };
        if (!o.tanggal || !o.jam) { Swal.showValidationMessage("Isi tanggal dan jam pertemuan."); return false; }
        return o;
    };
    const dlg = await Swal.fire({
        title: "Surat Panggilan Orang Tua",
        html: `<div style="text-align:left">
            <p style="font-size:13px;margin-bottom:8px"><b>${escapeHtml(siswa.nama)}</b> \u2022 ${Number(row.total) || 0} poin</p>
            <label ${lbl}>Tahap panggilan</label><select id="sp-tahap" class="swal2-select" ${gaya}>${opsiTahap}</select>
            <label ${lbl}>Tanggal pertemuan</label><input id="sp-tgl" type="date" class="swal2-input" min="${getDateWITA()}" ${gaya}>
            <label ${lbl}>Pukul (WITA)</label><input id="sp-jam" type="time" class="swal2-input" value="08:00" ${gaya}>
            <label ${lbl}>Tempat</label><input id="sp-tempat" type="text" class="swal2-input" placeholder="SMP Negeri 1 Talaga Jaya" maxlength="80" ${gaya}>
            <label ${lbl}>Nomor surat (opsional)</label><input id="sp-nomor" type="text" class="swal2-input" maxlength="60" ${gaya}>
        </div>`,
        showDenyButton: true, showCancelButton: true,
        confirmButtonText: "Unduh PDF", denyButtonText: "Cetak", cancelButtonText: "Batal",
        confirmButtonColor: "#7c3aed", denyButtonColor: "#2563eb",
        preConfirm: baca, preDeny: baca
    });
    if (!dlg.isConfirmed && !dlg.isDenied) return;
    const form = dlg.value;
    if (!form) return;

    showLoading("Menyiapkan surat...");
    try {
        const res = await apiCall("getTatib", { siswa_id: String(siswaId) }, false);
        if (!res || res.status !== "success" || !Array.isArray(res.data)) throw new Error((res && res.message) || "Gagal mengambil rincian poin.");
        const konfig = res.konfig || tlData.konfig;
        const wali = tlWali(siswa);
        const kepsek = (appState.pengaturan && appState.pengaturan.nama_kepsek) || "............................................";
        const nipKepsek = (appState.pengaturan && appState.pengaturan.nip_kepsek) || "........................................";
        const html = tlHtmlSurat({ siswa, row, ringkasan: res.ringkasan, catatan: res.data, form, konfig });
        const doc = await buildOfficialPdf("SURAT PANGGILAN ORANG TUA/WALI", html, {
            orientation: "portrait",
            signatures: [
                { lines: ["Mengetahui,", "Kepala SMPN 1 Talaga Jaya"], name: kepsek, nip: nipKepsek },
                { lines: ["Talaga Jaya, {tanggal}", getPeranTtdText(siswa)], name: wali.nama, nip: wali.nip }
            ]
        });
        hideLoading();
        if (dlg.isDenied) {
            const url = URL.createObjectURL(doc.output("blob"));
            const frame = document.createElement("iframe");
            frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
            frame.onload = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (x) { window.open(url, "_blank"); } };
            frame.src = url;
            document.body.appendChild(frame);
            setTimeout(() => { frame.remove(); URL.revokeObjectURL(url); }, 120000);
        } else {
            doc.save(`Surat_Panggilan_${TL_ROMAWI[form.tahap]}_${String(siswa.nama).replace(/\s+/g, "_")}_${getDateWITA()}.pdf`);
            showToast("Surat panggilan diunduh!");
        }
    } catch (err) {
        console.error("Gagal membuat surat panggilan:", err);
        hideLoading();
        Swal.fire({ icon: "error", title: "Surat Gagal", text: String(err.message || err), confirmButtonColor: "#2563eb" });
    }
}

tlInjectUI();