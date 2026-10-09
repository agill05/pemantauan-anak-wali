// Pilih banyak + hapus massal (bulkDestroy) untuk semua CRUD.
// Pakai: bulkToolbar(kind, idsTampil) di atas daftar, bulkCheckbox(kind, id) di tiap baris.

const BULK_STATE = {};

function _bulkSt(kind) {
    if (!BULK_STATE[kind]) BULK_STATE[kind] = { aktif: false, ids: new Set(), tampil: [] };
    return BULK_STATE[kind];
}

const BULK_CFG = {
    guru: {
        label: "guru", server: true,
        sesudah: async function () {
            if (typeof resetCacheCatatanGuru === "function") resetCacheCatatanGuru();
            await fetchAllAppData(true);
            renderAdminGuru();
            if (typeof _refreshAllSiswaDropdowns === "function") _refreshAllSiswaDropdowns();
        },
        render: function () { renderAdminGuru(); }
    },
    siswa: {
        label: "siswa", server: true,
        sesudah: async function (ids) {
            if (typeof bersihkanJejakSiswaLokal === "function") bersihkanJejakSiswaLokal(ids);
            await fetchAllAppData(true);
            if (typeof renderSiswaView === "function") renderSiswaView();
            if (typeof renderAdminSiswa === "function") renderAdminSiswa();
            if (typeof _refreshAllSiswaDropdowns === "function") _refreshAllSiswaDropdowns();
        },
        render: function () {
            if (typeof renderSiswaView === "function") renderSiswaView();
            if (typeof renderAdminSiswa === "function") renderAdminSiswa();
        }
    },
    kelas: {
        label: "kelas", server: true,
        sesudah: async function () {
            await fetchAllAppData(true);
            renderAdminKelas();
            if (typeof _refreshAllSiswaDropdowns === "function") _refreshAllSiswaDropdowns();
        },
        render: function () { renderAdminKelas(); }
    },
    keagamaan: {
        label: "catatan keagamaan", state: "keagamaan", modal: true,
        sesudah: function () { renderKeagamaanView(); },
        render: function () { kagRefreshDetail(); }
    },
    akademik: {
        label: "nilai mapel", state: "akademik",
        sesudah: function () { renderAkademikNilai(); },
        render: function () { renderAkademikNilai(); }
    },
    prestasi: {
        label: "catatan prestasi", state: "prestasi", modal: true,
        sesudah: function () { renderAkademikPrestasi(); if (typeof prsRefreshDetail === "function") prsRefreshDetail(); },
        render: function () { prsRefreshDetail(); }
    },
    pembinaan: {
        label: "catatan pembinaan", state: "pembinaan", modal: true,
        sesudah: function () {
            renderPembinaanView();
            if (typeof pbnRefreshDetail === "function") pbnRefreshDetail();
            if (typeof checkStudentNotifications === "function") checkStudentNotifications();
        },
        render: function () { pbnRefreshDetail(); }
    }
};

function bulkIdsEditable(kategori, records) {
    if (isKepsekUser()) return [];
    return (records || []).filter(r => canEditRecord(r, kategori)).map(r => String(r.id));
}

function bulkAktif(kind) {
    return _bulkSt(kind).aktif;
}

function bulkCheckbox(kind, id) {
    const st = _bulkSt(kind);
    if (!st.aktif) return "";
    const sid = String(id);
    return `<input type="checkbox" data-bulk-cb="${kind}" value="${escapeHtml(sid)}" ${st.ids.has(sid) ? "checked" : ""}
        onchange="bulkToggle('${kind}','${escapeHtml(sid)}',this.checked)"
        class="w-4 h-4 mr-2.5 shrink-0 accent-blue-600" aria-label="Pilih data">`;
}

function _bulkBarInner(kind) {
    const st = _bulkSt(kind);
    const total = st.tampil.length;
    if (!st.aktif) {
        if (total === 0) return "";
        return `<button type="button" onclick="bulkMode('${kind}')" class="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg ml-auto"><i class="fas fa-check-square"></i> Pilih</button>`;
    }
    const n = st.ids.size;
    const semua = total > 0 && n === total;
    return `
        <label class="flex items-center gap-2 text-xs font-bold text-slate-600">
            <input type="checkbox" data-bulk-all="${kind}" ${semua ? "checked" : ""} onchange="bulkPilihSemua('${kind}',this.checked)" class="w-4 h-4 accent-blue-600">
            Semua (${total})
        </label>
        <div class="flex items-center gap-1.5">
            <button type="button" onclick="bulkMode('${kind}')" class="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">Batal</button>
            <button type="button" onclick="bulkHapus('${kind}')" ${n === 0 ? "disabled" : ""} class="text-xs font-bold text-white bg-rose-600 px-3 py-1.5 rounded-lg ${n === 0 ? "opacity-40" : ""}"><i class="fas fa-trash"></i> Hapus (${n})</button>
        </div>`;
}

// idsTampil = id yang sedang tampil DAN boleh dihapus user ini.
function bulkToolbar(kind, idsTampil) {
    const st = _bulkSt(kind);
    st.tampil = (idsTampil || []).map(String);
    const tampilSet = new Set(st.tampil);
    st.ids.forEach(id => { if (!tampilSet.has(id)) st.ids.delete(id); });
    const inner = _bulkBarInner(kind);
    if (!inner) return "";
    return `<div data-bulk-bar="${kind}" class="flex items-center justify-between gap-2 mb-2">${inner}</div>`;
}

function _bulkRefreshBar(kind) {
    document.querySelectorAll(`[data-bulk-bar="${kind}"]`).forEach(el => { el.innerHTML = _bulkBarInner(kind); });
}

function bulkMode(kind) {
    const st = _bulkSt(kind);
    st.aktif = !st.aktif;
    st.ids.clear();
    BULK_CFG[kind].render();
}

function bulkToggle(kind, id, checked) {
    const st = _bulkSt(kind);
    if (checked) st.ids.add(String(id)); else st.ids.delete(String(id));
    _bulkRefreshBar(kind);
}

function bulkPilihSemua(kind, checked) {
    const st = _bulkSt(kind);
    st.ids.clear();
    if (checked) st.tampil.forEach(id => st.ids.add(id));
    document.querySelectorAll(`[data-bulk-cb="${kind}"]`).forEach(cb => { cb.checked = !!checked; });
    _bulkRefreshBar(kind);
}

function bulkReset(kind) {
    const st = _bulkSt(kind);
    st.aktif = false;
    st.ids.clear();
}

// Dipanggil saat modal ditutup: mode pilih di sheet catatan tidak boleh tersisa.
function bulkResetModal() {
    Object.keys(BULK_CFG).forEach(k => { if (BULK_CFG[k].modal) bulkReset(k); });
}

async function _bulkKonfirmasi(kind, ids) {
    const cfg = BULK_CFG[kind];
    const n = ids.length;

    if (!cfg.server) {
        const r = await Swal.fire({
            title: `Hapus ${n} ${cfg.label}?`,
            text: "Data tidak dapat dikembalikan.",
            icon: "warning", showCancelButton: true,
            confirmButtonColor: "#ef4444", confirmButtonText: `Ya, Hapus ${n}`, cancelButtonText: "Batal"
        });
        return !!r.isConfirmed;
    }

    const hitung = await apiCall("hitungHapus", { jenis: kind, ids: ids }, true);
    if (!hitung || hitung.status !== "success") {
        Swal.fire({ icon: "error", title: "Gagal Menghitung Data", text: (hitung && hitung.message) || "Periksa koneksi lalu coba lagi.", confirmButtonColor: "#2563eb" });
        return false;
    }

    const baris = (label, jumlah) => `<li class="flex justify-between gap-3"><span>${escapeHtml(label)}</span><b>${Number(jumlah || 0)}</b></li>`;
    const rincian = hitung.rincian || {};
    const jumlah = Number(hitung.jumlah || n);
    const daftarNama = (hitung.nama_daftar || []).map(x => escapeHtml(x)).join(", ") + (jumlah > (hitung.nama_daftar || []).length ? ", ..." : "");
    let intro = "", daftar = "";

    if (kind === "siswa") {
        intro = `<b>${jumlah} siswa</b> (${daftarNama}) dan seluruh riwayatnya akan <b>dihapus permanen</b>. Total <b>${Number(hitung.total || 0)}</b> baris data:`;
        daftar = Object.keys(LABEL_HAPUS_SISWA).map(k => baris(LABEL_HAPUS_SISWA[k], rincian[k])).join("");
    } else if (kind === "guru") {
        intro = `<b>${jumlah} akun guru</b> (${daftarNama}) dihapus. Catatan yang pernah ditulis <b>tetap ada</b>. Dampaknya:`;
        daftar = Object.keys(LABEL_HAPUS_GURU).map(k => baris(LABEL_HAPUS_GURU[k], rincian[k])).join("");
    } else {
        intro = `<b>${jumlah} kelas</b> (${daftarNama}) dihapus. Data siswa <b>tidak ikut terhapus</b>.`;
        daftar = baris("Siswa dilepas dari kelas (bisa diambil wali baru)", rincian.siswa_dilepas);
    }

    const catatan = [];
    if (hitung.foto) catatan.push(`${hitung.foto} foto profil di Drive ikut dihapus.`);
    if (kind === "siswa") catatan.push("Arsip semester tidak ikut dihapus.");
    catatan.push("Tindakan ini <b>tidak dapat dikembalikan</b>.");

    const r = await Swal.fire({
        title: `Hapus ${jumlah} ${cfg.label}?`,
        html: `<div class="text-left text-sm">${intro}<ul class="my-3 space-y-1 text-xs">${daftar}</ul><div class="text-xs text-slate-500">${catatan.join(" ")}</div></div>`,
        icon: "warning", showCancelButton: true,
        confirmButtonColor: "#ef4444", confirmButtonText: `Ya, Hapus ${jumlah}`, cancelButtonText: "Batal"
    });
    return !!r.isConfirmed;
}

async function bulkHapus(kind) {
    const cfg = BULK_CFG[kind];
    const st = _bulkSt(kind);
    const ids = Array.from(st.ids);
    if (!ids.length) { showToast("Belum ada data yang dipilih.", "warning"); return; }

    if (!(await _bulkKonfirmasi(kind, ids))) return;

    const res = await apiCall("bulkDestroy", { jenis: kind, ids: ids }, true);
    if (!res || res.status !== "success") {
        Swal.fire({ icon: "error", title: "Gagal Menghapus", text: (res && res.message) || "Terjadi kesalahan saat menghapus data.", confirmButtonColor: "#2563eb" });
        return;
    }

    const terhapus = (res.ids_dihapus || ids).map(String);
    if (cfg.state) {
        const set = new Set(terhapus);
        appState[cfg.state] = (appState[cfg.state] || []).filter(x => !set.has(String(x.id)));
        saveAppStateToLocal();
    }

    bulkReset(kind);
    await cfg.sesudah(terhapus);

    if (res.ditolak || res.tidak_ditemukan) {
        Swal.fire({ icon: "info", title: "Selesai Sebagian", text: res.message, confirmButtonColor: "#2563eb" });
    } else {
        showToast(res.message || "Data berhasil dihapus.");
    }
}