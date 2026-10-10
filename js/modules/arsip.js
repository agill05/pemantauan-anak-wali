let arsipSayaDaftar = [];
let arsipSayaMemuat = false;
let arsipSayaLihat = null;
const arsipSayaSiswaCache = {};

const ARSIP_SAYA_URUTAN = ["Laporan", "Presensi", "PresensiMentor", "Akademik", "Prestasi",
    "Keagamaan", "Kebiasaan", "Jurnal", "Pembinaan"];
const ARSIP_SAYA_LABEL = {
    Laporan: "Laporan Semester", Presensi: "Presensi", PresensiMentor: "Presensi Mentor",
    Akademik: "Akademik", Prestasi: "Prestasi", Keagamaan: "Keagamaan",
    Kebiasaan: "Kebiasaan", Jurnal: "Jurnal", Pembinaan: "Pembinaan"
};
const ARSIP_SAYA_IKON = {
    Laporan: "fa-file-invoice", Presensi: "fa-calendar-check", PresensiMentor: "fa-user-clock",
    Akademik: "fa-graduation-cap", Prestasi: "fa-trophy", Keagamaan: "fa-quran",
    Kebiasaan: "fa-star", Jurnal: "fa-book-open", Pembinaan: "fa-user-edit"
};

function arsipSayaRole() {
    return appState.user ? String(appState.user.role).toLowerCase() : "";
}

function arsipSayaLabelJenis(j) {
    return ARSIP_SAYA_LABEL[j] || j;
}

function arsipSayaTampilPanel(nama) {
    document.getElementById("arsip-saya-panel-daftar")?.classList.toggle("hidden", nama !== "daftar");
    document.getElementById("arsip-saya-panel-lihat")?.classList.toggle("hidden", nama !== "lihat");
}

async function renderArsipSaya() {
    arsipSayaTampilPanel(arsipSayaLihat ? "lihat" : "daftar");
    const list = document.getElementById("arsip-saya-list");
    const ket = document.getElementById("arsip-saya-ket");
    if (!list) return;

    const role = arsipSayaRole();
    if (ket) {
        ket.textContent = role === "siswa"
            ? "Data semester lama milik kamu. Hanya bisa dilihat, tidak bisa diubah."
            : role === "guru"
                ? "Data semester lama siswa yang pernah kamu dampingi sebagai wali kelas atau mentor pada periode itu. Hanya bisa dilihat."
                : "Data semester lama seluruh siswa. Mode baca saja.";
    }

    if (arsipSayaDaftar.length > 0) arsipSayaGambarDaftar();
    else renderSkeleton("arsip-saya-list", 3);
    if (arsipSayaMemuat) return;

    arsipSayaMemuat = true;
    const res = await apiCall("getArsipSaya", {}, false);
    arsipSayaMemuat = false;
    if (res && res.status === "success" && Array.isArray(res.data)) {
        arsipSayaDaftar = res.data;
        arsipSayaGambarDaftar();
    } else if (arsipSayaDaftar.length === 0) {
        const pesan = res?.message || "Daftar arsip gagal dimuat. Periksa koneksi lalu coba lagi.";
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wifi text-2xl mb-2"></i>
                <p class="text-xs text-slate-500">${escapeHtml(pesan)}</p>
                <button type="button" onclick="arsipSayaMuatUlang()" class="mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold">Coba lagi</button>
            </div>`;
    }
}

function arsipSayaMuatUlang() {
    arsipSayaDaftar = [];
    renderArsipSaya();
}

function arsipSayaKelompok() {
    const peta = {};
    const urut = [];
    arsipSayaDaftar.forEach((r, i) => {
        const k = String(r.periode_key || (String(r.tahun_ajaran).replace("/", "-") + "_" + r.semester));
        if (!peta[k]) {
            peta[k] = { key: k, ta: r.tahun_ajaran, sem: r.semester, sampai: r.sampai_tanggal || "", peran: r.peran || "", baris: [] };
            urut.push(peta[k]);
        }
        peta[k].baris.push({ r: r, i: i });
    });
    urut.forEach(g => {
        g.baris.sort((a, b) => {
            const x = ARSIP_SAYA_URUTAN.indexOf(a.r.jenis);
            const y = ARSIP_SAYA_URUTAN.indexOf(b.r.jenis);
            return (x === -1 ? 99 : x) - (y === -1 ? 99 : y);
        });
    });
    return urut;
}

function arsipSayaLabelPeran(p) {
    return String(p || "").split(",").map(x => x.trim()).filter(Boolean)
        .map(x => x === "wali" ? "Wali Kelas" : x === "mentor" ? "Mentor" : "").filter(Boolean).join(" & ");
}

function arsipSayaGambarDaftar() {
    const list = document.getElementById("arsip-saya-list");
    if (!list) return;
    const kelompok = arsipSayaKelompok();
    if (kelompok.length === 0) {
        const role = arsipSayaRole();
        const teks = role === "siswa"
            ? "Belum ada arsip semester untuk kamu."
            : role === "guru"
                ? "Belum ada arsip semester untuk siswa yang kamu dampingi."
                : "Belum ada arsip semester.";
        list.innerHTML = `<div class="empty-state"><i class="fas fa-box-archive text-xl mb-1"></i><p class="text-xs">${escapeHtml(teks)}</p></div>`;
        return;
    }
    const penuh = arsipSayaRole() === "kepsek";
    list.innerHTML = kelompok.map(g => {
        const peran = arsipSayaLabelPeran(g.peran);
        const chips = g.baris.map(x => {
            const warna = ARSIP_WARNA[x.r.jenis] || "bg-slate-100 text-slate-700";
            const ikon = ARSIP_SAYA_IKON[x.r.jenis] || "fa-table";
            return `
            <button type="button" onclick="arsipSayaBuka(${x.i})" class="px-2 py-1.5 rounded-lg ${warna} text-[11px] font-bold" aria-label="Lihat arsip ${escapeHtml(arsipSayaLabelJenis(x.r.jenis))} ${escapeHtml(g.sem)} ${escapeHtml(g.ta)}">
                <i class="fas ${ikon} mr-1" aria-hidden="true"></i>${escapeHtml(arsipSayaLabelJenis(x.r.jenis))}${penuh ? ` (${Number(x.r.jumlah_baris) || 0})` : ""}
            </button>`;
        }).join("");
        return `
        <div class="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2">
            <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-800">${escapeHtml(g.sem)} ${escapeHtml(g.ta)}</p>
                    <p class="text-[11px] text-slate-400">Data sampai ${escapeHtml(g.sampai || "-")}</p>
                </div>
                ${peran ? `<span class="shrink-0 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">${escapeHtml(peran)}</span>` : ""}
            </div>
            <div class="flex flex-wrap gap-1.5">${chips}</div>
        </div>`;
    }).join("");
}

function arsipSayaBuka(i) {
    const r = arsipSayaDaftar[i];
    const panel = document.getElementById("arsip-saya-panel-lihat");
    if (!r || !panel) return;
    const role = arsipSayaRole();
    const pakaiFilter = role === "guru" || role === "kepsek";
    arsipSayaLihat = {
        nama: String(r.nama_sheet), jenis: String(r.jenis),
        periode: String(r.periode_key || ""), ta: r.tahun_ajaran, sem: r.semester,
        judul: `${arsipSayaLabelJenis(r.jenis)} \u2022 ${r.semester} ${r.tahun_ajaran}`,
        offset: 0, total: 0, q: "", kelas: "", siswaId: "", headers: [], seq: 0
    };
    const kelasOpts = (appState.kelas || []).map(k => `<option value="${escapeHtml(k.nama_kelas)}"></option>`).join("");
    panel.innerHTML = `
        <div class="flex items-center gap-2">
            <button type="button" onclick="arsipSayaKembali()" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600" aria-label="Kembali ke daftar arsip"><i class="fas fa-arrow-left text-xs"></i></button>
            <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(arsipSayaLihat.judul)}</p>
                <p id="arsip-saya-info" class="text-[11px] text-slate-400"></p>
            </div>
            ${r.jenis === "Laporan" && role !== "siswa" ? `<button type="button" onclick="arsipSayaUnduhPdf()" class="px-3 py-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold" aria-label="Unduh laporan semester PDF"><i class="fas fa-file-pdf mr-1"></i> PDF</button>` : ""}
            <button type="button" onclick="arsipSayaUnduhCsv()" class="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold"><i class="fas fa-download mr-1"></i> CSV</button>
        </div>
        ${pakaiFilter ? `
        <form onsubmit="arsipSayaCari(event)" class="grid grid-cols-2 gap-2">
            <input type="text" id="arsip-saya-f-q" placeholder="Cari nama siswa..." class="bg-slate-50 border p-2 rounded-xl text-xs outline-none">
            <input type="text" id="arsip-saya-f-kelas" list="arsip-saya-kelas-list" placeholder="Kelas (mis. VII A)" class="bg-slate-50 border p-2 rounded-xl text-xs outline-none">
            <datalist id="arsip-saya-kelas-list">${kelasOpts}</datalist>
            ${role === "guru" ? `
            <select id="arsip-saya-f-siswa" class="col-span-2 bg-slate-50 border p-2 rounded-xl text-xs outline-none" aria-label="Pilih siswa">
                <option value="">Semua siswa</option>
            </select>` : ""}
            <button type="submit" class="col-span-2 bg-primary text-white font-bold py-2 rounded-xl text-xs">Terapkan Filter</button>
        </form>` : ""}
        <div id="arsip-saya-tabel" class="bg-white rounded-2xl border border-slate-100 overflow-x-auto"></div>
        <div id="arsip-saya-pager" class="flex items-center justify-between text-xs"></div>`;
    arsipSayaTampilPanel("lihat");
    arsipSayaMuatHalaman();
    if (role === "guru") arsipSayaIsiSiswa(arsipSayaLihat);
}

async function arsipSayaIsiSiswa(v) {
    const lap = arsipSayaDaftar.filter(r => String(r.periode_key) === v.periode && r.jenis === "Laporan")[0];
    if (!lap) return;
    let daftar = arsipSayaSiswaCache[v.periode];
    if (!daftar) {
        const res = await apiCall("getArsipData", { nama_sheet: String(lap.nama_sheet), offset: 0, limit: 2000 }, false, 2, true);
        if (!res || res.status !== "success" || !Array.isArray(res.data)) return;
        daftar = res.data
            .map(x => ({ id: String(x.siswa_id || ""), nama: String(x.nama_siswa || ""), kelas: String(x.kelas || "") }))
            .filter(x => x.id)
            .sort((a, b) => a.nama.localeCompare(b.nama));
        arsipSayaSiswaCache[v.periode] = daftar;
    }
    if (arsipSayaLihat !== v) return;
    const sel = document.getElementById("arsip-saya-f-siswa");
    if (!sel) return;
    sel.innerHTML = `<option value="">Semua siswa (${daftar.length})</option>` +
        daftar.map(x => `<option value="${escapeHtml(x.id)}">${escapeHtml(x.nama)}${x.kelas ? " \u2022 " + escapeHtml(x.kelas) : ""}</option>`).join("");
}

function arsipSayaKembali() {
    arsipSayaLihat = null;
    arsipSayaTampilPanel("daftar");
}

function arsipSayaCari(e) {
    if (e) e.preventDefault();
    const v = arsipSayaLihat;
    if (!v) return;
    v.q = (document.getElementById("arsip-saya-f-q")?.value || "").trim();
    v.kelas = (document.getElementById("arsip-saya-f-kelas")?.value || "").trim();
    v.siswaId = document.getElementById("arsip-saya-f-siswa")?.value || "";
    v.offset = 0;
    arsipSayaMuatHalaman();
}

function arsipSayaHalaman(arah) {
    const v = arsipSayaLihat;
    if (!v) return;
    const baru = v.offset + arah * ARSIP_PER_HALAMAN;
    if (baru < 0 || baru >= v.total) return;
    v.offset = baru;
    arsipSayaMuatHalaman();
}

function arsipSayaPayload(v, offset, limit) {
    const p = { nama_sheet: v.nama, offset: offset, limit: limit };
    if (v.q) p.q = v.q;
    if (v.kelas) p.kelas = v.kelas;
    if (v.siswaId) p.siswa_id = v.siswaId;
    return p;
}

async function arsipSayaMuatHalaman() {
    const v = arsipSayaLihat;
    if (!v) return;
    if (v.jenis === "Laporan") { arsipSayaMuatLaporan(v); return; }
    const seq = ++v.seq;
    const tabel = document.getElementById("arsip-saya-tabel");
    if (tabel) tabel.innerHTML = `<div class="p-6 text-center text-xs text-slate-400"><i class="fas fa-spinner fa-spin mr-1"></i> Memuat...</div>`;

    const res = await apiCall("getArsipData", arsipSayaPayload(v, v.offset, ARSIP_PER_HALAMAN), false);
    if (arsipSayaLihat !== v || seq !== v.seq) return;

    const el = document.getElementById("arsip-saya-tabel");
    if (!el) return;
    if (!res || res.status !== "success") {
        el.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">${escapeHtml(res?.message || "Gagal memuat arsip. Periksa koneksi.")}</div>`;
        return;
    }
    v.total = Number(res.total) || 0;
    v.headers = Array.isArray(res.headers) ? res.headers : [];
    const kolom = arsipPilihKolom(v.jenis, v.headers);

    if (res.data.length === 0) {
        el.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Tidak ada baris yang cocok.</div>`;
    } else {
        el.innerHTML = `
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500">
                    <tr>${kolom.map(c => `<th class="px-2 py-2 font-bold whitespace-nowrap">${escapeHtml(arsipLabelKolom(c))}</th>`).join("")}</tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${res.data.map(row => `<tr>${kolom.map(c => {
                        const teks = String(row[c] === null || row[c] === undefined ? "" : row[c]);
                        return `<td class="px-2 py-1.5 align-top text-slate-700 ${arsipKolomPanjang(c) ? "min-w-[14rem]" : "whitespace-nowrap"}">${escapeHtml(teks)}</td>`;
                    }).join("")}</tr>`).join("")}
                </tbody>
            </table>`;
    }

    const dari = v.total === 0 ? 0 : v.offset + 1;
    const sampai = Math.min(v.offset + ARSIP_PER_HALAMAN, v.total);
    const info = document.getElementById("arsip-saya-info");
    if (info) info.textContent = `${v.total} baris`;
    const pager = document.getElementById("arsip-saya-pager");
    if (pager) {
        pager.innerHTML = `
            <span class="text-slate-500">${dari}\u2013${sampai} dari ${v.total}</span>
            <span class="flex gap-1">
                <button type="button" onclick="arsipSayaHalaman(-1)" ${v.offset <= 0 ? "disabled" : ""} class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold disabled:opacity-40">Sebelumnya</button>
                <button type="button" onclick="arsipSayaHalaman(1)" ${v.offset + ARSIP_PER_HALAMAN >= v.total ? "disabled" : ""} class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold disabled:opacity-40">Berikutnya</button>
            </span>`;
    }
}

let arsipSayaUnduhSibuk = false;

async function arsipSayaUnduhCsv() {
    const v = arsipSayaLihat;
    if (!v || arsipSayaUnduhSibuk) return;
    arsipSayaUnduhSibuk = true;
    showLoading("Menyiapkan CSV...");
    try {
        const { headers, rows } = await arsipSayaAmbilSemua(v);
        if (rows.length === 0) throw new Error("Tidak ada baris untuk diunduh.");
        const baris = [headers.map(arsipCsvSel).join(";")]
            .concat(rows.map(r => headers.map(h => arsipCsvSel(r[h])).join(";")));
        const blob = new Blob(["\ufeff" + baris.join("\r\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = v.nama + ".csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("CSV diunduh (" + rows.length + " baris).");
    } catch (err) {
        Swal.fire({ icon: "error", title: "Unduhan Gagal", text: String(err.message || err), confirmButtonColor: "#2563eb" });
    } finally {
        hideLoading();
        arsipSayaUnduhSibuk = false;
    }
}

const ARSIP_LAPORAN_PDF_KOLOM = [
    ["nama_siswa", "Siswa", null], ["kelas", "Kelas", 48],
    ["hadir", "H", 26], ["sakit", "S", 26], ["izin", "I", 26], ["alpa", "A", 26],
    ["total_mapel", "Mapel", 34], ["dibawah_kktp", "< KKTP", 34],
    ["jumlah_prestasi", "Prestasi", 38], ["jumlah_hafalan", "Hafalan", 38],
    ["jumlah_pembinaan", "Pembinaan", 44], ["skor_kebiasaan", "Skor Kebiasaan", 48],
    ["jurnal_ditulis", "Jurnal", 32]
];

function arsipSayaAngka(x, kunci) {
    const n = Number(x && x[kunci]);
    return isNaN(n) ? 0 : n;
}

function arsipSayaPersenHadir(x) {
    const h = arsipSayaAngka(x, "hadir");
    const total = h + arsipSayaAngka(x, "sakit") + arsipSayaAngka(x, "izin") + arsipSayaAngka(x, "alpa");
    return total === 0 ? null : Math.round(h / total * 100);
}

function arsipSayaTeksPersen(p) {
    return p === null ? "-" : p + "%";
}

async function arsipSayaAmbilSemua(v) {
    let offset = 0, total = Infinity, headers = [], rows = [];
    while (offset < total) {
        const res = await apiCall("getArsipData", arsipSayaPayload(v, offset, 2000), false, 2, true);
        if (!res || res.status !== "success") throw new Error(res?.message || "Koneksi bermasalah.");
        headers = res.headers || headers;
        total = Number(res.total) || 0;
        if (!res.data.length) break;
        rows = rows.concat(res.data);
        offset += res.data.length;
    }
    return { headers: headers, rows: rows };
}

function arsipSayaRingkasanLaporan(rows) {
    const jumlah = (k) => rows.reduce((t, x) => t + arsipSayaAngka(x, k), 0);
    const hadir = jumlah("hadir");
    const catatan = hadir + jumlah("sakit") + jumlah("izin") + jumlah("alpa");
    return {
        siswa: rows.length,
        persenHadir: catatan === 0 ? null : Math.round(hadir / catatan * 100),
        alpa: jumlah("alpa"),
        bawahKktp: rows.filter(x => arsipSayaAngka(x, "dibawah_kktp") > 0).length,
        prestasi: jumlah("jumlah_prestasi")
    };
}

function arsipSayaKartuAngka(label, nilai, warna) {
    return `
        <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center">
            <p class="text-base font-bold ${warna}">${escapeHtml(String(nilai))}</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase">${escapeHtml(label)}</p>
        </div>`;
}

function arsipSayaHtmlLaporanSiswa(x) {
    const p = arsipSayaPersenHadir(x);
    const baris = (label, nilai) => `
        <div class="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
            <span class="text-slate-500">${escapeHtml(label)}</span>
            <span class="font-bold text-slate-800">${escapeHtml(String(nilai))}</span>
        </div>`;
    const bagian = (judul, ikon, isi) => `
        <div class="bg-white p-3.5 rounded-2xl border border-slate-100">
            <p class="text-[11px] font-bold text-slate-400 uppercase mb-1"><i class="fas ${ikon} mr-1" aria-hidden="true"></i>${escapeHtml(judul)}</p>
            <div class="text-xs">${isi}</div>
        </div>`;
    const bawah = arsipSayaAngka(x, "dibawah_kktp");
    return `
        <div class="space-y-2">
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100">
                <p class="text-sm font-bold text-slate-800">${escapeHtml(String(x.nama_siswa || "-"))}</p>
                <p class="text-[11px] text-slate-400">${escapeHtml(String(x.kelas || "-"))}</p>
            </div>
            ${bagian("Kehadiran", "fa-calendar-check",
                baris("Hadir", arsipSayaAngka(x, "hadir")) + baris("Sakit", arsipSayaAngka(x, "sakit")) +
                baris("Izin", arsipSayaAngka(x, "izin")) + baris("Alpa", arsipSayaAngka(x, "alpa")) +
                baris("Persentase hadir", arsipSayaTeksPersen(p)))}
            ${bagian("Akademik", "fa-graduation-cap",
                baris("Jumlah mapel", arsipSayaAngka(x, "total_mapel")) +
                baris("Mapel di bawah KKTP", bawah === 0 ? "Tidak ada" : bawah))}
            ${bagian("Capaian dan Pembinaan", "fa-trophy",
                baris("Prestasi", arsipSayaAngka(x, "jumlah_prestasi")) +
                baris("Hafalan", arsipSayaAngka(x, "jumlah_hafalan")) +
                baris("Pembinaan", arsipSayaAngka(x, "jumlah_pembinaan")))}
            ${bagian("7 Kebiasaan", "fa-star",
                baris("Kebiasaan sudah", arsipSayaAngka(x, "kebiasaan_sudah")) +
                baris("Hari tercatat", arsipSayaAngka(x, "kebiasaan_hari_tercatat")) +
                baris("Skor kebiasaan", arsipSayaAngka(x, "skor_kebiasaan")) +
                baris("Jurnal ditulis", arsipSayaAngka(x, "jurnal_ditulis")))}
        </div>`;
}

function arsipSayaHtmlLaporanTabel(rows) {
    const kolom = ["nama_siswa", "kelas", "hadir", "sakit", "izin", "alpa", "total_mapel", "dibawah_kktp",
        "jumlah_prestasi", "jumlah_hafalan", "jumlah_pembinaan", "skor_kebiasaan", "jurnal_ditulis"];
    const label = { nama_siswa: "Siswa", kelas: "Kelas", hadir: "H", sakit: "S", izin: "I", alpa: "A",
        total_mapel: "Mapel", dibawah_kktp: "< KKTP", jumlah_prestasi: "Prestasi", jumlah_hafalan: "Hafalan",
        jumlah_pembinaan: "Pembinaan", skor_kebiasaan: "Skor", jurnal_ditulis: "Jurnal" };
    const sel = (x, c) => {
        const teks = escapeHtml(String(x[c] === null || x[c] === undefined ? "" : x[c]));
        const merah = (c === "alpa" || c === "dibawah_kktp") && arsipSayaAngka(x, c) > 0;
        return `<td class="px-2 py-1.5 align-top whitespace-nowrap ${merah ? "text-rose-600 font-bold" : "text-slate-700"}">${teks}</td>`;
    };
    return `
        <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-500">
                <tr>${kolom.map(c => `<th class="px-2 py-2 font-bold whitespace-nowrap">${escapeHtml(label[c])}</th>`).join("")}</tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                ${rows.map(x => `<tr>${kolom.map(c => sel(x, c)).join("")}</tr>`).join("")}
            </tbody>
        </table>`;
}

async function arsipSayaMuatLaporan(v) {
    const seq = ++v.seq;
    const tabel = document.getElementById("arsip-saya-tabel");
    const pager = document.getElementById("arsip-saya-pager");
    if (pager) pager.innerHTML = "";
    if (tabel) tabel.innerHTML = `<div class="p-6 text-center text-xs text-slate-400"><i class="fas fa-spinner fa-spin mr-1"></i> Memuat...</div>`;

    let hasil;
    try {
        hasil = await arsipSayaAmbilSemua(v);
    } catch (err) {
        if (arsipSayaLihat !== v || seq !== v.seq) return;
        const el = document.getElementById("arsip-saya-tabel");
        if (el) el.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">${escapeHtml(String(err.message || err))}</div>`;
        return;
    }
    if (arsipSayaLihat !== v || seq !== v.seq) return;
    const el = document.getElementById("arsip-saya-tabel");
    if (!el) return;

    v.laporan = hasil.rows;
    v.total = hasil.rows.length;
    const info = document.getElementById("arsip-saya-info");
    if (info) info.textContent = `${v.total} siswa`;

    if (hasil.rows.length === 0) {
        el.className = "bg-white rounded-2xl border border-slate-100 overflow-x-auto";
        el.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Tidak ada baris yang cocok.</div>`;
        return;
    }

    if (arsipSayaRole() === "siswa") {
        el.className = "";
        el.innerHTML = arsipSayaHtmlLaporanSiswa(hasil.rows[0]);
        return;
    }

    const r = arsipSayaRingkasanLaporan(hasil.rows);
    el.className = "space-y-2";
    el.innerHTML = `
        <div class="grid grid-cols-5 gap-1.5">
            ${arsipSayaKartuAngka("Siswa", r.siswa, "text-slate-800")}
            ${arsipSayaKartuAngka("Hadir", arsipSayaTeksPersen(r.persenHadir), "text-emerald-600")}
            ${arsipSayaKartuAngka("Alpa", r.alpa, r.alpa > 0 ? "text-rose-600" : "text-slate-800")}
            ${arsipSayaKartuAngka("< KKTP", r.bawahKktp, r.bawahKktp > 0 ? "text-amber-600" : "text-slate-800")}
            ${arsipSayaKartuAngka("Prestasi", r.prestasi, "text-blue-600")}
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 overflow-x-auto">${arsipSayaHtmlLaporanTabel(hasil.rows)}</div>`;
}

function arsipSayaHtmlLaporanPdf(rows) {
    const kepala = `<th style="width: 24px;">No</th>` + ARSIP_LAPORAN_PDF_KOLOM.map(k =>
        `<th${k[2] ? ` style="width: ${k[2]}px;"` : ""}>${escapeHtml(k[1])}</th>`).join("");
    const isi = rows.map((x, i) => {
        const sel = ARSIP_LAPORAN_PDF_KOLOM.map(k => {
            const teks = escapeHtml(String(x[k[0]] === null || x[k[0]] === undefined ? "" : x[k[0]]));
            return k[0] === "nama_siswa" || k[0] === "kelas"
                ? `<td>${teks}</td>`
                : `<td style="text-align:center;">${teks}</td>`;
        }).join("");
        return `<tr><td style="text-align:center;">${i + 1}</td>${sel}</tr>`;
    }).join("");
    return `<table><thead><tr>${kepala}</tr></thead><tbody>${isi}</tbody></table>`;
}

let arsipSayaPdfSibuk = false;

async function arsipSayaUnduhPdf() {
    const v = arsipSayaLihat;
    if (!v || v.jenis !== "Laporan" || arsipSayaPdfSibuk) return;
    if (arsipSayaRole() === "siswa") { blokirSiswaPdf(); return; }
    if (!pdfLibReady()) return;
    arsipSayaPdfSibuk = true;
    showLoading("Menyiapkan laporan...");
    try {
        const hasil = (Array.isArray(v.laporan) && v.laporan.length > 0) ? { rows: v.laporan } : await arsipSayaAmbilSemua(v);
        if (hasil.rows.length === 0) throw new Error("Tidak ada baris untuk dicetak.");
        const r = arsipSayaRingkasanLaporan(hasil.rows);
        const meta = arsipSayaDaftar.filter(x => String(x.periode_key) === v.periode && x.jenis === "Laporan")[0];
        const info = pdfInfoBlock([
            { label: "Periode", value: `${v.sem} ${v.ta}` },
            { label: "Data sampai", value: (meta && meta.sampai_tanggal) || "-" },
            { label: "Kelas", value: v.kelas || "Semua kelas" },
            { label: "Jumlah siswa", value: String(r.siswa) },
            { label: "Rata-rata hadir", value: arsipSayaTeksPersen(r.persenHadir) },
            { label: "Siswa dengan mapel < KKTP", value: String(r.bawahKktp) }
        ]);
        const catatan = `<p>Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa. Data dihitung dari arsip semester dan tidak berubah.</p>`;
        const nama = `Laporan_Arsip_${v.periode}${v.kelas ? "_" + v.kelas.replace(/[^A-Za-z0-9]+/g, "") : ""}.pdf`;
        const doc = await buildOfficialPdf(`Laporan Semester ${v.sem} ${v.ta}`, info + arsipSayaHtmlLaporanPdf(hasil.rows) + catatan,
            { orientation: "landscape" });
        doc.save(nama);
        showToast("File PDF berhasil diunduh!");
    } catch (err) {
        console.error("Gagal membuat PDF arsip:", err);
        Swal.fire({ icon: "error", title: "PDF Gagal", text: String(err.message || err), confirmButtonColor: "#2563eb" });
    } finally {
        hideLoading();
        arsipSayaPdfSibuk = false;
    }
}
