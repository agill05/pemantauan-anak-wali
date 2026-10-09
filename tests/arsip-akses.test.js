// Uji akses silang peran untuk endpoint arsip (getArsipSaya, getArsipData, deleteArsip).
// Memuat fungsi asli dari Kode.gs ke VM dengan sheet palsu. Tidak menyentuh spreadsheet.
// Jalankan: node tests/arsip-akses.test.js [path/ke/Kode.gs]
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const sumber = process.argv[2] || path.join(__dirname, "..", "Kode.gs");
const kode = fs.readFileSync(sumber, "utf8").replace(/\r/g, "");

function ambilFungsi(nama) {
    const mulai = kode.indexOf("function " + nama + "(");
    if (mulai === -1) throw new Error("Fungsi tidak ditemukan di Kode.gs: " + nama);
    let i = kode.indexOf("{", mulai), depth = 0;
    for (; i < kode.length; i++) {
        if (kode[i] === "{") depth++;
        else if (kode[i] === "}" && --depth === 0) return kode.slice(mulai, i + 1);
    }
    throw new Error("Kurung tidak seimbang: " + nama);
}

class SheetPalsu {
    constructor(tabel) { this.t = tabel; }
    getLastRow() { return this.t.length; }
    getLastColumn() { return this.t.length ? this.t[0].length : 0; }
    getRange(r, c, nr, nc) {
        const t = this.t;
        return { getValues: () => t.slice(r - 1, r - 1 + nr).map(b => b.slice(c - 1, c - 1 + nc)) };
    }
}
const tabel = (headers, objs) => [headers].concat(objs.map(o => headers.map(h => o[h] === undefined ? "" : o[h])));

const P1 = "2026-2027_Ganjil", P0 = "2025-2026_Genap";
const AKSES_H = ["periode_key", "siswa_id", "nama_siswa", "kelas_id", "kelas", "wali_id", "wali_nama", "mentor_id", "mentor_nama"];
const akses = tabel(AKSES_H, [
    { periode_key: P1, siswa_id: "s1", nama_siswa: "Ani", kelas: "VII A", wali_id: "g1", mentor_id: "g2" },
    { periode_key: P1, siswa_id: "s2", nama_siswa: "Budi", kelas: "VII A", wali_id: "g1", mentor_id: "g3" },
    { periode_key: P1, siswa_id: "s3", nama_siswa: "Citra", kelas: "VII B", wali_id: "g4", mentor_id: "g2" },
    { periode_key: P0, siswa_id: "s1", nama_siswa: "Ani", kelas: "VI A", wali_id: "g5", mentor_id: "" }
]);
const META_H = ["id", "tahun_ajaran", "semester", "jenis", "nama_sheet", "jumlah_baris", "sampai_tanggal", "dibuat_oleh_id", "dibuat_oleh_nama", "dibuat_pada"];
const metaObj = [
    { id: "1", tahun_ajaran: "2026/2027", semester: "Ganjil", jenis: "Laporan", nama_sheet: "Arsip_Laporan_" + P1, dibuat_oleh_id: "adm", dibuat_oleh_nama: "Admin", dibuat_pada: "2026-12-30 10:00:00" },
    { id: "2", tahun_ajaran: "2026/2027", semester: "Ganjil", jenis: "Kebiasaan", nama_sheet: "Arsip_Kebiasaan_" + P1, dibuat_oleh_id: "adm", dibuat_oleh_nama: "Admin", dibuat_pada: "2026-12-30 09:00:00" },
    { id: "3", tahun_ajaran: "2025/2026", semester: "Genap", jenis: "Laporan", nama_sheet: "Arsip_Laporan_" + P0, dibuat_oleh_id: "adm", dibuat_oleh_nama: "Admin", dibuat_pada: "2026-06-30 10:00:00" }
];
const LAP_H = ["periode_key", "siswa_id", "nama_siswa", "kelas_id", "kelas", "hadir", "alpa"];
const KEB_H = ["id", "siswa_id", "nama_siswa", "kelas", "tanggal", "status", "dibuat_oleh_id"];
const sheets = {
    ArsipAkses: new SheetPalsu(akses),
    ArsipSemester: new SheetPalsu(tabel(META_H, metaObj)),
    ["Arsip_Laporan_" + P1]: new SheetPalsu(tabel(LAP_H, [
        { periode_key: P1, siswa_id: "s1", nama_siswa: "Ani", kelas: "VII A", hadir: 80, alpa: 1 },
        { periode_key: P1, siswa_id: "s2", nama_siswa: "Budi", kelas: "VII A", hadir: 70, alpa: 4 },
        { periode_key: P1, siswa_id: "s3", nama_siswa: "Citra", kelas: "VII B", hadir: 90, alpa: 0 }])),
    ["Arsip_Kebiasaan_" + P1]: new SheetPalsu(tabel(KEB_H, [
        { id: "k1", siswa_id: "s1", nama_siswa: "Ani", kelas: "VII A", tanggal: "2026-09-01", status: "Sudah", dibuat_oleh_id: "g1" },
        { id: "k2", siswa_id: "s2", nama_siswa: "Budi", kelas: "VII A", tanggal: "2026-09-01", status: "Belum", dibuat_oleh_id: "g1" },
        { id: "k3", siswa_id: "s3", nama_siswa: "Citra", kelas: "VII B", tanggal: "2026-09-01", status: "Sudah", dibuat_oleh_id: "g4" }])),
    ["Arsip_Laporan_" + P0]: new SheetPalsu(tabel(LAP_H, [
        { periode_key: P0, siswa_id: "s1", nama_siswa: "Ani", kelas: "VI A", hadir: 60, alpa: 2 }]))
};

const ctx = vm.createContext({
    ARSIP_META_SHEET: "ArsipSemester", ARSIP_AKSES_SHEET: "ArsipAkses", TIMEZONE_WITA: "Asia/Makassar",
    getSheet: n => sheets[n],
    getSheetData: n => {
        const t = sheets[n].t, h = t[0];
        return t.slice(1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
    },
    _getSS: () => ({ getSheetByName: n => sheets[n] || null }),
    formatDateWITA: v => String(v), formatTimeWITA: v => String(v), k7NormJam: v => String(v),
    Utilities: { formatDate: v => String(v) }
});
["isBacaSemua", "k7Err", "k7Idx", "k7ReadRaw", "k7PeriodeKeyMeta", "k7BacaAkses_", "k7AksesArsip",
    "k7PeriodeDariPayload", "handleGetArsipSaya", "handleGetArsipData", "handleDeleteArsip"]
    .forEach(n => vm.runInContext(ambilFungsi(n), ctx));
const J = (kode) => vm.runInContext(kode, ctx);
const panggil = (fn, user, payload) => { ctx.__u = user; ctx.__p = payload; return J(fn + "(__u, __p)"); };

let gagal = 0, lulus = 0;
function cek(nama, kondisi, detail) {
    if (kondisi) { lulus++; console.log("  ok   " + nama); }
    else { gagal++; console.log("  GAGAL " + nama + (detail ? " -> " + detail : "")); }
}
const siswa = id => ({ id: id, role: "siswa" });
const guru = id => ({ id: id, role: "guru" });
const admin = { id: "adm", role: "admin" }, kepsek = { id: "kps", role: "kepsek" };
const ids = r => r.data.map(x => x.siswa_id).sort().join(",");
const sheetLap = "Arsip_Laporan_" + P1, sheetKeb = "Arsip_Kebiasaan_" + P1;

console.log("Siswa");
let r = panggil("handleGetArsipSaya", siswa("s1"));
cek("s1 melihat 2 periode (Ganjil 26/27 dan Genap 25/26) untuk Laporan+Kebiasaan", r.status === "success" && r.data.length === 3, JSON.stringify(r.data && r.data.length));
cek("daftar tidak membocorkan dibuat_oleh_*", r.data.every(x => x.dibuat_oleh_id === undefined && x.dibuat_oleh_nama === undefined));
cek("peran siswa", r.data.every(x => x.peran === "siswa"));
r = panggil("handleGetArsipData", siswa("s1"), { nama_sheet: sheetLap });
cek("s1 hanya baca baris sendiri di Laporan", r.status === "success" && ids(r) === "s1", ids(r));
r = panggil("handleGetArsipData", siswa("s1"), { nama_sheet: sheetLap, siswa_id: "s3" });
cek("s1 minta siswa_id=s3 tetap kosong", r.status === "success" && r.total === 0);
r = panggil("handleGetArsipData", siswa("s1"), { nama_sheet: sheetLap, q: "Budi" });
cek("s1 cari nama Budi tetap kosong", r.status === "success" && r.total === 0);
r = panggil("handleGetArsipData", siswa("s1"), { nama_sheet: sheetKeb });
cek("kolom dibuat_oleh_id disembunyikan dari siswa (header)", r.status === "success" && r.headers.indexOf("dibuat_oleh_id") === -1);
cek("kolom dibuat_oleh_id disembunyikan dari siswa (data)", r.data.every(x => !("dibuat_oleh_id" in x)));
r = panggil("handleGetArsipData", siswa("s9"), { nama_sheet: sheetLap });
cek("siswa tanpa snapshot ditolak", r.status === "error");
r = panggil("handleGetArsipSaya", siswa("s9"));
cek("siswa tanpa snapshot: daftar kosong", r.status === "success" && r.data.length === 0);

console.log("Guru");
r = panggil("handleGetArsipSaya", guru("g1"));
cek("g1 (wali) lihat periode Ganjil saja", r.data.length === 2 && r.data.every(x => x.periode_key === P1));
cek("g1 peran wali, 2 siswa", r.data.every(x => x.peran === "wali" && x.jumlah_siswa === 2));
r = panggil("handleGetArsipData", guru("g1"), { nama_sheet: sheetLap });
cek("g1 baca s1,s2 bukan s3", ids(r) === "s1,s2", ids(r));
r = panggil("handleGetArsipData", guru("g1"), { nama_sheet: sheetLap, siswa_id: "s3" });
cek("g1 minta s3 kosong", r.total === 0);
r = panggil("handleGetArsipData", guru("g1"), { nama_sheet: sheetKeb });
cek("g1 baca Kebiasaan hanya s1,s2", ids(r) === "s1,s2", ids(r));
cek("g1 tetap melihat dibuat_oleh_id (hanya siswa disembunyikan)", r.headers.indexOf("dibuat_oleh_id") !== -1);
r = panggil("handleGetArsipData", guru("g1"), { nama_sheet: "Arsip_Laporan_" + P0 });
cek("g1 tidak boleh baca periode 25/26", r.status === "error");
r = panggil("handleGetArsipData", guru("g2"), { nama_sheet: sheetLap });
cek("g2 (mentor) baca s1,s3", ids(r) === "s1,s3", ids(r));
r = panggil("handleGetArsipSaya", guru("g2"));
cek("g2 peran mentor", r.data.every(x => x.peran === "mentor"));
r = panggil("handleGetArsipData", guru("g5"), { nama_sheet: "Arsip_Laporan_" + P0 });
cek("g5 (wali lama) baca s1 periode 25/26", r.status === "success" && ids(r) === "s1");
r = panggil("handleGetArsipData", guru("g5"), { nama_sheet: sheetLap });
cek("g5 tidak boleh baca periode 26/27", r.status === "error");
r = panggil("handleGetArsipData", guru("g9"), { nama_sheet: sheetLap });
cek("guru tak terkait ditolak", r.status === "error");
r = panggil("handleGetArsipSaya", guru("g9"));
cek("guru tak terkait: daftar kosong", r.status === "success" && r.data.length === 0);
r = panggil("handleGetArsipData", guru("g1"), { nama_sheet: sheetLap, kelas: "VII B" });
cek("filter kelas tidak menembus scope g1", r.total === 0);

console.log("Kepsek dan admin");
r = panggil("handleGetArsipSaya", kepsek);
cek("kepsek lihat semua arsip", r.data.length === 3);
r = panggil("handleGetArsipData", kepsek, { nama_sheet: sheetLap });
cek("kepsek baca semua siswa", ids(r) === "s1,s2,s3");
r = panggil("handleGetArsipData", admin, { nama_sheet: sheetKeb });
cek("admin baca semua baris dan audit", r.total === 3 && r.headers.indexOf("dibuat_oleh_id") !== -1);

console.log("Penolakan umum");
r = panggil("handleGetArsipData", { id: "x", role: "tamu" }, { nama_sheet: sheetLap });
cek("role asing ditolak", r.status === "error");
r = panggil("handleGetArsipSaya", { id: "x", role: "tamu" });
cek("role asing ditolak di daftar", r.status === "error");
r = panggil("handleGetArsipData", admin, { nama_sheet: "ArsipAkses" });
cek("sheet non-arsip (ArsipAkses) tidak terdaftar", r.status === "error");
r = panggil("handleGetArsipData", admin, { nama_sheet: "Siswa" });
cek("sheet live (Siswa) tidak terdaftar", r.status === "error");

console.log("Hapus arsip");
["siswa:s1", "guru:g1", "kepsek:kps"].forEach(x => {
    const [role, id] = x.split(":");
    const h = panggil("handleDeleteArsip", { id: id, role: role }, { tahun_ajaran: "2026/2027", semester: "Ganjil", konfirmasi: "HAPUS" });
    cek("deleteArsip ditolak untuk " + role, h.status === "error" && h.message === "Akses ditolak.");
});
r = panggil("handleDeleteArsip", admin, { tahun_ajaran: "2026/2027", semester: "Ganjil", konfirmasi: "hapus" });
cek("admin tanpa konfirmasi HAPUS ditolak", r.status === "error" && /Konfirmasi/.test(r.message));
r = panggil("handleDeleteArsip", admin, { tahun_ajaran: "2026-2027", semester: "Ganjil", konfirmasi: "HAPUS" });
cek("admin format tahun salah ditolak", r.status === "error" && /format/i.test(r.message));

console.log("\n" + lulus + " lulus, " + gagal + " gagal");
process.exit(gagal ? 1 : 0);
