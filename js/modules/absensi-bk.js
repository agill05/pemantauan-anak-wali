// Presensi BK (Tahap 6). Hanya untuk role bk. Data: sheet KehadiranBK lewat getAbsensiBK / saveAbsensiBK.
let abkTab = "isi";
let abkTanggal = null;
let abkKelas = "";
let abkCari = "";
let abkPilih = new Map();      // siswa_id -> status yang dipilih (belum tentu tersimpan)
let abkTersimpan = new Map();  // siswa_id -> status tersimpan di server
let abkMuat = false;

const ABK_STATUS = ["H", "I", "S", "A", "T"];
const ABK_WARNA = {
    H: "bg-emerald-600 text-white border-emerald-600",
    I: "bg-sky-600 text-white border-sky-600",
    S: "bg-amber-500 text-white border-amber-500",
    A: "bg-rose-600 text-white border-rose-600",
    T: "bg-orange-500 text-white border-orange-500"
};

function abkDaftarKelas() {
    const ada = new Set((appState.siswa || []).map(s => String(s.kelas_id)));
    return (appState.kelas || [])
        .filter(k => ada.has(String(k.id)))
        .sort((a, b) => bandingkanKelas(a.nama_kelas, b.nama_kelas));
}

async function renderAbsensiBKView() {
    const el = document.getElementById("absensi-bk-container");
    if (!el) return;
    if (!appState.user || appState.user.role !== "bk") {
        el.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Halaman ini khusus Guru BK.</p>`;
        return;
    }
    if (!abkTanggal) abkTanggal = getDateWITA();
    if (!abkKelas) {
        const k = abkDaftarKelas();
        abkKelas = k.length ? String(k[0].id) : "";
    }
    if (abkTab === "isi") await abkMuatTanggal(false);
    abkGambar();
}

async function abkMuatTanggal(paksa) {
    if (abkMuat) return;
    abkMuat = true;
    try {
        const res = await apiCall("getAbsensiBK", { tanggal: abkTanggal }, false);
        if (res && res.status === "success") {
            abkTersimpan = new Map((res.data || []).map(r => [String(r.siswa_id), String(r.status || "").toUpperCase()]));
            abkPilih = new Map(abkTersimpan);
        } else if (res) {
            showToast(res.message || "Gagal memuat presensi BK.", "error");
        }
    } finally {
        abkMuat = false;
    }
}

function abkGambar() {
    const el = document.getElementById("absensi-bk-container");
    if (!el) return;
    const kelas = abkDaftarKelas();
    const tab = (id, label) => `<button type="button" onclick="abkGantiTab('${id}')" aria-pressed="${abkTab === id}"
        class="flex-1 py-2 rounded-xl text-xs font-bold ${abkTab === id ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}">${label}</button>`;
    const opsiKelas = kelas.map(k => `<option value="${escapeHtml(String(k.id))}" ${String(k.id) === String(abkKelas) ? "selected" : ""}>${escapeHtml(k.nama_kelas)}</option>`).join("");
    el.innerHTML = `
        <div class="flex gap-2 mb-3">${tab("isi", "Isi Presensi")}${tab("rekap", "Rekap")}</div>
        ${abkTab === "isi" ? abkHtmlIsi(opsiKelas) : abkHtmlRekap(opsiKelas)}`;
    if (abkTab === "rekap") abkRekapIsi();
}

function abkHtmlIsi(opsiKelas) {
    const daftar = abkSiswaTampil();
    const semuaKelas = abkSiswaKelas();
    const terisi = semuaKelas.filter(s => abkPilih.get(String(s.id))).length;
    const baris = daftar.map((s, i) => {
        const sid = String(s.id);
        const sel = abkPilih.get(sid) || "";
        const tombol = ABK_STATUS.map(st => `<button type="button" onclick="abkSetStatus('${escapeHtml(sid)}','${st}')" aria-pressed="${sel === st}" aria-label="${escapeHtml(ABSENSI_LABEL[st])}"
            class="w-9 h-9 rounded-lg border text-xs font-extrabold ${sel === st ? ABK_WARNA[st] : "bg-white text-slate-500 border-slate-200"}">${st}</button>`).join("");
        return `<div class="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
            <div class="min-w-0"><p class="text-xs font-bold text-slate-800 truncate">${i + 1}. ${escapeHtml(s.nama)}</p>
            <p class="text-[10px] text-slate-400">${sel ? escapeHtml(ABSENSI_LABEL[sel]) : "Belum diisi"}</p></div>
            <div class="flex gap-1 shrink-0">${tombol}</div></div>`;
    }).join("");
    return `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div class="grid grid-cols-2 gap-2">
                <input type="date" id="abk-tanggal" value="${escapeHtml(abkTanggal)}" max="${escapeHtml(getDateWITA())}" onchange="abkUbahTanggal(this.value)" class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none" aria-label="Tanggal presensi">
                <select id="abk-kelas" onchange="abkUbahKelas(this.value)" class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none" aria-label="Filter kelas">${opsiKelas || '<option value="">Belum ada kelas</option>'}</select>
            </div>
            <input type="search" id="abk-cari" value="${escapeHtml(abkCari)}" oninput="abkUbahCari(this.value)" placeholder="Cari nama siswa..." class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none" aria-label="Cari siswa">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>Terisi ${terisi} / ${semuaKelas.length}</span>
                <button type="button" onclick="abkSemuaHadir()" class="font-bold text-emerald-700"><i class="fas fa-check-double"></i> Semua Hadir</button>
            </div>
        </div>
        <div id="abk-daftar" class="bg-white px-3 mt-3 rounded-2xl border border-slate-100 shadow-sm">${baris || '<p class="text-xs text-slate-400 text-center py-6">Tidak ada siswa.</p>'}</div>
        <button type="button" onclick="abkSimpan()" class="w-full mt-3 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-sm"><i class="fas fa-save mr-1"></i> Simpan Presensi BK</button>`;
}

function abkSiswaKelas() {
    return sortSiswa((appState.siswa || []).filter(s => !abkKelas || String(s.kelas_id) === String(abkKelas)));
}

function abkSiswaTampil() {
    const q = abkCari.trim().toLowerCase();
    return abkSiswaKelas().filter(s => !q || String(s.nama || "").toLowerCase().includes(q));
}

function abkGantiTab(t) { abkTab = t; renderAbsensiBKView(); }
function abkUbahKelas(v) { abkKelas = v; abkGambar(); }
function abkUbahCari(v) {
    abkCari = v;
    const el = document.getElementById("abk-daftar");
    if (!el) return;
    const posisi = v.length;
    abkGambar();
    const inp = document.getElementById("abk-cari");
    if (inp) { inp.focus(); inp.setSelectionRange(posisi, posisi); }
}
async function abkUbahTanggal(v) {
    if (!v) return;
    abkTanggal = v;
    await abkMuatTanggal(true);
    abkGambar();
}

function abkSetStatus(sid, st) {
    abkPilih.set(String(sid), st);
    abkGambar();
}

function abkSemuaHadir() {
    abkSiswaTampil().forEach(s => abkPilih.set(String(s.id), "H"));
    abkGambar();
}

async function abkSimpan() {
    const kunci = getDateLockState(abkTanggal);
    if (!kunci.editable) { showDateLockedAlert(kunci); return; }
    if (!navigator.onLine) { showToast("Presensi BK butuh koneksi internet.", "warning"); return; }
    const daftar = abkSiswaKelas();
    if (daftar.length === 0) { showToast("Tidak ada presensi yang dapat disimpan.", "warning"); return; }
    const kosong = daftar.filter(s => !abkPilih.get(String(s.id)));
    if (kosong.length) {
        Swal.fire({ icon: "warning", title: "Presensi Belum Lengkap", text: `${kosong.length} siswa belum diisi. Lengkapi dulu sebelum menyimpan.`, confirmButtonColor: "#2563eb" });
        return;
    }
    showLoading("Menyimpan presensi BK...");
    const waktu = getTimeWITA24();
    const items = daftar.map(s => ({ siswa_id: String(s.id), status: abkPilih.get(String(s.id)), waktu, tanggal: abkTanggal }));
    const res = await apiCall("saveAbsensiBK", { items, tanggal: abkTanggal }, false);
    hideLoading();
    if (res && res.status === "success") {
        items.forEach(i => abkTersimpan.set(i.siswa_id, i.status));
        showToast("Presensi BK berhasil disimpan!");
        abkGambar();
    } else {
        Swal.fire({ icon: "error", title: "Gagal Menyimpan", text: res?.message || "Terjadi kesalahan jaringan.", confirmButtonColor: "#2563eb" });
    }
}

// ---- Rekap
let abkRekapDari = "";
let abkRekapSampai = "";

function abkHtmlRekap(opsiKelas) {
    return `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <select id="abk-kelas" onchange="abkUbahKelasRekap(this.value)" class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none" aria-label="Filter kelas">${opsiKelas || '<option value="">Belum ada kelas</option>'}</select>
            <div class="grid grid-cols-2 gap-2">
                <label class="text-[11px] text-slate-500">Dari<input type="date" value="${escapeHtml(abkRekapDari)}" onchange="abkRekapDari=this.value;abkRekapIsi()" class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none"></label>
                <label class="text-[11px] text-slate-500">Sampai<input type="date" value="${escapeHtml(abkRekapSampai)}" onchange="abkRekapSampai=this.value;abkRekapIsi()" class="w-full bg-slate-50 border p-2 rounded-xl text-xs outline-none"></label>
            </div>
        </div>
        <div id="abk-rekap" class="mt-3"></div>`;
}

function abkUbahKelasRekap(v) { abkKelas = v; abkRekapIsi(); }

async function abkRekapIsi() {
    const el = document.getElementById("abk-rekap");
    if (!el) return;
    el.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Memuat rekap...</p>`;
    const res = await apiCall("getAbsensiBK", { rekap: true, dari: abkRekapDari, sampai: abkRekapSampai }, false);
    const sekarang = document.getElementById("abk-rekap");
    if (!sekarang) return;
    if (!res || res.status !== "success") {
        sekarang.innerHTML = `<p class="text-xs text-rose-600 text-center py-6">${escapeHtml(res?.message || "Gagal memuat rekap.")}</p>`;
        return;
    }
    const peta = new Map((res.data || []).map(r => [String(r.siswa_id), r]));
    const baris = abkSiswaKelas().map(s => {
        const r = peta.get(String(s.id)) || { H: 0, I: 0, S: 0, A: 0, T: 0, total: 0 };
        const persen = r.total > 0 ? Math.round(((r.H + r.T) / r.total) * 100) : 0;
        return `<tr><td class="text-left font-bold">${escapeHtml(s.nama)}</td><td>${r.H}</td><td>${r.S}</td><td>${r.I}</td><td>${r.T}</td><td>${r.A}</td><td class="font-extrabold">${persen}%</td></tr>`;
    }).join("");
    sekarang.innerHTML = `<div class="tt-tabel-wrap"><table class="tt-tabel">
        <caption class="sr-only">Rekap presensi BK</caption>
        <thead><tr><th scope="col">Nama</th><th scope="col">H</th><th scope="col">S</th><th scope="col">I</th><th scope="col">T</th><th scope="col">A</th><th scope="col">% Hadir</th></tr></thead>
        <tbody>${baris || '<tr><td colspan="7">Tidak ada siswa.</td></tr>'}</tbody></table></div>
        <p class="text-[11px] text-slate-400 mt-2">% Hadir = (Hadir + Terlambat) / total pertemuan tercatat.</p>`;
}
