let backupDaftar = [];
let backupInfo = null;
let backupMemuat = false;
let backupSibuk = false;

const BACKUP_BASI_JAM = 48;

function backupLabelWaktu(w) {
    const m = String(w || "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : String(w || "-");
}

function backupLabelTipe(tipe) {
    const t = String(tipe || "");
    if (t === "otomatis") return "Otomatis";
    if (t === "manual") return "Manual";
    if (t === "pra-restore") return "Pengaman sebelum pulihkan";
    if (t.indexOf("pra-") === 0) return "Sebelum " + t.substring(4);
    return t || "-";
}

function backupUmurJam(w) {
    const m = String(w || "").match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):?(\d{2})?/);
    if (!m) return null;
    const waktu = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || "00"}+08:00`);
    if (isNaN(waktu.getTime())) return null;
    return (Date.now() - waktu.getTime()) / 3600000;
}

function backupLabelUmur(jam) {
    if (jam === null) return "";
    if (jam < 1) return "kurang dari 1 jam lalu";
    if (jam < 24) return `${Math.floor(jam)} jam lalu`;
    return `${Math.floor(jam / 24)} hari lalu`;
}

function backupBarisPeringatan(teks) {
    return `<div class="flex items-start gap-2 bg-amber-50 border border-amber-100 p-3 rounded-xl text-xs text-amber-700"><i class="fas fa-triangle-exclamation mt-0.5" aria-hidden="true"></i><span>${teks}</span></div>`;
}

function backupGambarStatus() {
    const el = document.getElementById("backup-status");
    if (!el || !backupInfo) return;

    const terakhir = backupInfo.terakhir;
    const r = backupInfo.config || {};
    let html = "";

    if (!terakhir) {
        html += backupBarisPeringatan("Belum ada backup. Tekan Backup sekarang untuk membuat yang pertama.");
    } else if (terakhir.status !== "sukses") {
        html += backupBarisPeringatan(`Backup terakhir gagal (${escapeHtml(backupLabelWaktu(terakhir.waktu))}): ${escapeHtml(terakhir.catatan || "tanpa keterangan")}`);
    } else {
        const umur = backupUmurJam(terakhir.waktu);
        html += `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100">
                <p class="text-xs font-bold text-slate-500 mb-1">BACKUP TERAKHIR</p>
                <p class="text-sm font-bold text-slate-800">${escapeHtml(backupLabelWaktu(terakhir.waktu))}</p>
                <p class="text-xs text-slate-500">${escapeHtml(backupLabelUmur(umur))} &middot; ${escapeHtml(backupLabelTipe(terakhir.tipe))}</p>
            </div>`;
        if (umur !== null && umur > BACKUP_BASI_JAM) {
            html += backupBarisPeringatan("Backup terakhir sudah lebih dari 2 hari. Periksa jadwal otomatis.");
        }
    }

    if (r.aktif && !backupInfo.trigger_aktif) {
        html += backupBarisPeringatan("Jadwal otomatis belum terpasang. Tekan Simpan pengaturan di bawah untuk memasangnya.");
    }
    if (r.aktif === false) {
        html += backupBarisPeringatan("Backup otomatis dinonaktifkan. Data hanya terlindungi oleh backup manual.");
    }

    html += `<p class="text-xs text-slate-500">Jadwal otomatis: setiap hari sekitar pukul ${String(Number(r.jam) || 0).padStart(2, "0")}:00 WITA. Disimpan ${Number(r.harian) || 0} backup harian, ${Number(r.mingguan) || 0} mingguan, dan ${Number(r.bulanan) || 0} bulanan. Sisanya masuk tempat sampah Drive.</p>`;

    if (/^https:\/\//.test(backupInfo.folder_url || "")) {
        html += `<a href="${escapeHtml(backupInfo.folder_url)}" target="_blank" rel="noopener" class="text-xs font-bold text-blue-600"><i class="fas fa-folder-open mr-1" aria-hidden="true"></i> Buka folder backup di Drive</a>`;
    }

    el.innerHTML = html;
}

function backupGambarDaftar() {
    const list = document.getElementById("backup-list");
    if (!list) return;

    if (backupDaftar.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Belum ada riwayat backup.</p>`;
        return;
    }

    list.innerHTML = backupDaftar.map(b => {
        const sukses = b.status === "sukses";
        const url = /^https:\/\//.test(b.url || "") ? b.url : "";
        const chip = sukses
            ? `<span class="text-xs font-bold text-emerald-600">Sukses</span>`
            : `<span class="text-xs font-bold text-rose-600">Gagal</span>`;
        const rincian = sukses
            ? `${Number(b.jumlah_sheet) || 0} sheet &middot; ${escapeHtml(b.oleh || "-")}`
            : escapeHtml(b.catatan || "Tanpa keterangan");
        const catatan = sukses && b.catatan ? `<p class="text-xs text-slate-500 mt-0.5">${escapeHtml(b.catatan)}</p>` : "";
        const aksi = sukses
            ? `<div class="flex gap-3 mt-2">
                    ${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="text-xs font-bold text-blue-600"><i class="fas fa-up-right-from-square mr-1" aria-hidden="true"></i> Buka</a>` : ""}
                    <button type="button" onclick="backupPulihBuka(${Number(b.id)})" class="text-xs font-bold text-amber-600"><i class="fas fa-clock-rotate-left mr-1" aria-hidden="true"></i> Pulihkan</button>
                    <button type="button" onclick="backupHapus(${Number(b.id)})" class="text-xs font-bold text-rose-600"><i class="fas fa-trash mr-1" aria-hidden="true"></i> Hapus</button>
               </div>`
            : "";
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-slate-700">${escapeHtml(backupLabelWaktu(b.waktu))}</span>
                    ${chip}
                </div>
                <p class="text-xs text-slate-500 mt-0.5">${escapeHtml(backupLabelTipe(b.tipe))} &middot; ${rincian}</p>
                ${catatan}
                ${aksi}
            </div>`;
    }).join("");
}

function backupGambar() {
    backupGambarStatus();
    backupGambarConfig();
    backupGambarDaftar();
}

async function renderAdminBackup() {
    const list = document.getElementById("backup-list");
    if (!list) return;

    if (backupInfo) backupGambar();
    else renderSkeleton("backup-list", 3);
    if (backupMemuat) return;

    backupMemuat = true;
    const res = await apiCall("getBackupList", {}, false);
    backupMemuat = false;

    if (res && res.status === "success" && res.data) {
        backupInfo = res.data;
        backupDaftar = res.data.daftar || [];
        backupGambar();
    } else if (!backupInfo) {
        const pesan = res?.message || "Daftar backup gagal dimuat. Periksa koneksi lalu coba lagi.";
        list.innerHTML = `<p class="text-xs text-rose-600 text-center py-6">${escapeHtml(pesan)}</p>`;
    }
}

function backupMuatUlang() {
    backupInfo = null;
    backupDaftar = [];
    const status = document.getElementById("backup-status");
    if (status) status.innerHTML = "";
    renderAdminBackup();
}

async function backupBuatSekarang() {
    if (backupSibuk) return;

    const konfirmasi = await Swal.fire({
        icon: "question",
        title: "Buat Backup Sekarang?",
        text: "Seluruh spreadsheet disalin ke folder backup di Drive. Proses bisa memakan waktu beberapa detik sampai satu menit.",
        input: "text",
        inputPlaceholder: "Catatan (opsional)",
        inputAttributes: { maxlength: 200 },
        showCancelButton: true,
        confirmButtonText: "Buat Backup",
        cancelButtonText: "Batal",
        confirmButtonColor: "#2563eb"
    });
    if (!konfirmasi.isConfirmed) return;

    backupSibuk = true;
    showLoading("Membuat backup. Jangan tutup halaman ini...");
    const res = await apiCall("createBackup", { catatan: konfirmasi.value || "" }, false, 1, true, 120000);
    hideLoading();
    backupSibuk = false;

    if (res && res.status === "success") {
        showToast("Backup berhasil dibuat.");
    } else if (res) {
        Swal.fire({ icon: "error", title: "Backup Gagal", text: res.message || "Terjadi kesalahan.", confirmButtonColor: "#2563eb" });
    } else {
        Swal.fire({ icon: "warning", title: "Belum Ada Respons", text: "Server belum merespons. Backup mungkin masih berjalan. Muat ulang daftar beberapa saat lagi untuk memastikan.", confirmButtonColor: "#2563eb" });
    }
    backupMuatUlang();
}

async function backupHapus(id) {
    if (backupSibuk) return;

    const hasil = await Swal.fire({
        icon: "warning",
        title: "Hapus Backup?",
        text: "File dipindahkan ke tempat sampah Drive. Ketik HAPUS untuk melanjutkan.",
        input: "text",
        inputPlaceholder: "HAPUS",
        showCancelButton: true,
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
        confirmButtonColor: "#e11d48",
        preConfirm: (v) => {
            if (String(v || "").trim() !== "HAPUS") {
                Swal.showValidationMessage("Ketik HAPUS dengan huruf besar.");
                return false;
            }
            return "HAPUS";
        }
    });
    if (!hasil.isConfirmed) return;

    backupSibuk = true;
    showLoading("Menghapus backup...");
    const res = await apiCall("deleteBackup", { id: id, konfirmasi: "HAPUS" }, false);
    hideLoading();
    backupSibuk = false;

    if (res && res.status === "success") {
        showToast("Backup dihapus.");
        backupMuatUlang();
    } else {
        Swal.fire({ icon: "error", title: "Gagal Menghapus", text: res?.message || "Terjadi kesalahan.", confirmButtonColor: "#2563eb" });
    }
}

let backupPulihId = null;

function backupPulihTutup() {
    backupPulihId = null;
    const pulih = document.getElementById("backup-panel-pulih");
    const utama = document.getElementById("backup-panel-utama");
    if (pulih) { pulih.classList.add("hidden"); pulih.innerHTML = ""; }
    if (utama) utama.classList.remove("hidden");
}

async function backupPulihBuka(id) {
    if (backupSibuk) return;
    backupSibuk = true;
    showLoading("Membuka file backup...");
    const res = await apiCall("getBackupSheets", { id: id }, false, 1, true, 60000);
    hideLoading();
    backupSibuk = false;

    if (!res || res.status !== "success" || !res.data) {
        Swal.fire({ icon: "error", title: "Gagal Membuka Backup", text: res?.message || "Server tidak merespons.", confirmButtonColor: "#2563eb" });
        return;
    }

    backupPulihId = id;
    const b = res.data.backup;
    const baris = res.data.sheets.map((s, i) => {
        const sekarang = s.baris_sekarang === null ? "tidak ada" : s.baris_sekarang;
        const kurang = s.baris_sekarang !== null && s.baris_backup < s.baris_sekarang;
        const catatan = s.baris_sekarang === null
            ? `<span class="text-emerald-600">akan dibuat ulang</span>`
            : kurang ? `<span class="text-amber-600">backup lebih sedikit</span>` : "";
        return `
            <label class="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-100 text-xs">
                <input type="checkbox" class="backup-pulih-cek mt-0.5" value="${escapeHtml(s.nama)}">
                <span class="flex-1">
                    <span class="font-bold text-slate-700">${escapeHtml(s.nama)}</span>
                    <span class="block text-slate-500">Backup: ${Number(s.baris_backup)} baris &middot; Sekarang: ${escapeHtml(String(sekarang))} baris ${catatan}</span>
                </span>
            </label>`;
    }).join("");

    const panel = document.getElementById("backup-panel-pulih");
    const utama = document.getElementById("backup-panel-utama");
    if (!panel || !utama) return;
    utama.classList.add("hidden");
    panel.classList.remove("hidden");
    panel.innerHTML = `
        <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-slate-800">Pulihkan dari ${escapeHtml(backupLabelWaktu(b.waktu))}</p>
            <button type="button" onclick="backupPulihTutup()" class="text-xs font-bold text-slate-500">Batal</button>
        </div>
        ${backupBarisPeringatan("Sheet terpilih diganti total dengan isi backup. Data yang dibuat setelah backup ini hilang dari sheet itu. Secara bawaan sistem membuat salinan pengaman dulu sebelum menimpa. Maksimal 15 sheet.")}
        <div class="space-y-2">${baris}</div>
        <button type="button" onclick="backupPulihJalan()" class="w-full bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold"><i class="fas fa-clock-rotate-left mr-1" aria-hidden="true"></i> Pulihkan sheet terpilih</button>`;
}

async function backupPulihJalan() {
    if (backupSibuk || backupPulihId === null) return;
    const nama = Array.from(document.querySelectorAll(".backup-pulih-cek:checked")).map(el => el.value);
    if (!nama.length) { showToast("Pilih minimal satu sheet.", "warning"); return; }
    if (nama.length > 15) { showToast("Maksimal 15 sheet per pemulihan.", "warning"); return; }

    const hasil = await Swal.fire({
        icon: "warning",
        title: "Pulihkan " + nama.length + " Sheet?",
        html: "Sheet berikut ditimpa:<br><b>" + nama.map(escapeHtml).join(", ") + "</b><br><br>" +
            '<label style="display:flex;gap:8px;align-items:flex-start;text-align:left;font-size:13px;margin-bottom:8px">' +
            '<input type="checkbox" id="backup-pulih-pengaman" checked style="margin-top:3px">' +
            "<span>Buat salinan pengaman dulu (disarankan). Tanpa ini, data sheet sekarang yang berbeda dari backup tidak bisa dikembalikan.</span></label>" +
            "Ketik PULIHKAN untuk melanjutkan.",
        input: "text",
        inputPlaceholder: "PULIHKAN",
        showCancelButton: true,
        confirmButtonText: "Pulihkan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#e11d48",
        preConfirm: (v) => {
            if (String(v || "").trim() !== "PULIHKAN") {
                Swal.showValidationMessage("Ketik PULIHKAN dengan huruf besar.");
                return false;
            }
            const cek = document.getElementById("backup-pulih-pengaman");
            return { pengaman: !cek || cek.checked };
        }
    });
    if (!hasil.isConfirmed) return;
    const pengaman = !hasil.value || hasil.value.pengaman !== false;

    backupSibuk = true;
    showLoading("Memulihkan data. Jangan tutup halaman ini...");
    const res = await apiCall("restoreBackup", { id: backupPulihId, sheets: nama, konfirmasi: "PULIHKAN", pengaman: pengaman }, false, 1, true, 180000);
    hideLoading();
    backupSibuk = false;

    if (!res) {
        Swal.fire({ icon: "warning", title: "Belum Ada Respons", text: "Pemulihan mungkin masih berjalan. Tunggu 1-2 menit, lalu cek data dan daftar backup (cari tipe pra-restore).", confirmButtonColor: "#2563eb" });
        return;
    }

    const d = res.data || {};
    const ok = res.status === "success";
    await Swal.fire({
        icon: ok ? "success" : "error",
        title: ok ? "Pemulihan Selesai" : "Pemulihan Berhenti",
        html: escapeHtml(res.message || "") + (d.backup_sebelum ? "<br><small>Kondisi sebelum pemulihan: " + escapeHtml(d.backup_sebelum) + "</small>" : ""),
        confirmButtonColor: "#2563eb"
    });

    backupPulihTutup();
    if (typeof fetchAllAppData === "function") await fetchAllAppData(true);
    backupMuatUlang();
}


const BACKUP_BATAS = {
    jam: { min: 0, max: 23, label: "Jam backup (WITA, 0-23)" },
    harian: { min: 1, max: 30, label: "Simpan backup harian" },
    mingguan: { min: 0, max: 12, label: "Simpan backup mingguan" },
    bulanan: { min: 0, max: 24, label: "Simpan backup bulanan" }
};

function backupGambarConfig() {
    const el = document.getElementById("backup-config");
    if (!el || !backupInfo || !backupInfo.config) return;
    const c = backupInfo.config;

    const angka = Object.keys(BACKUP_BATAS).map(k => {
        const b = BACKUP_BATAS[k];
        return `
            <label class="block text-xs text-slate-600">
                <span class="font-bold">${escapeHtml(b.label)}</span>
                <input type="number" id="backup-cfg-${k}" min="${b.min}" max="${b.max}" step="1" value="${Number(c[k])}"
                    class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            </label>`;
    }).join("");

    el.innerHTML = `
        <details class="bg-white p-3.5 rounded-2xl border border-slate-100">
            <summary class="text-xs font-bold text-slate-700 cursor-pointer"><i class="fas fa-gear mr-1" aria-hidden="true"></i> Pengaturan jadwal</summary>
            <div class="space-y-3 mt-3">
                <label class="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" id="backup-cfg-aktif" ${c.aktif ? "checked" : ""}>
                    <span class="font-bold">Backup otomatis harian</span>
                </label>
                <label class="flex items-start gap-2 text-xs text-slate-700">
                    <input type="checkbox" id="backup-cfg-pra_aksi" class="mt-0.5" ${c.pra_aksi ? "checked" : ""}>
                    <span><span class="font-bold">Backup otomatis sebelum aksi berisiko</span><br>
                    <span class="text-slate-500">Arsip semester, hapus massal, impor batch, hapus siswa/guru/kelas. Dibuat paling cepat 1 jam sekali.</span></span>
                </label>
                <div class="grid grid-cols-2 gap-3">${angka}</div>
                <p class="text-xs text-slate-500">Backup yang dibuat dalam 48 jam terakhir selalu disimpan. Backup yang melewati batas dipindahkan ke tempat sampah Drive.</p>
                <button type="button" onclick="backupSimpanConfig()" class="bg-primary text-white px-3 py-2 rounded-xl text-xs font-bold"><i class="fas fa-floppy-disk mr-1" aria-hidden="true"></i> Simpan pengaturan</button>
            </div>
        </details>`;
}

async function backupSimpanConfig() {
    if (backupSibuk) return;

    const payload = {
        aktif: !!document.getElementById("backup-cfg-aktif")?.checked,
        pra_aksi: !!document.getElementById("backup-cfg-pra_aksi")?.checked
    };
    for (const k of Object.keys(BACKUP_BATAS)) {
        const b = BACKUP_BATAS[k];
        const mentah = String(document.getElementById("backup-cfg-" + k)?.value ?? "").trim();
        const n = Number(mentah);
        if (mentah === "" || !Number.isInteger(n) || n < b.min || n > b.max) {
            showToast(`${b.label} harus bilangan bulat ${b.min} sampai ${b.max}.`, "warning");
            return;
        }
        payload[k] = n;
    }

    backupSibuk = true;
    showLoading("Menyimpan pengaturan backup...");
    const res = await apiCall("saveBackupConfig", payload, false, 1, true, 60000);
    hideLoading();
    backupSibuk = false;

    if (res && res.status === "success") {
        if (res.peringatan) {
            Swal.fire({ icon: "warning", title: "Tersimpan, Jadwal Belum Terpasang", text: res.peringatan, confirmButtonColor: "#2563eb" });
        } else {
            showToast("Pengaturan backup disimpan.");
        }
        backupMuatUlang();
    } else {
        Swal.fire({ icon: "error", title: "Gagal Menyimpan", text: res?.message || "Server tidak merespons.", confirmButtonColor: "#2563eb" });
    }
}

function renderBackupBannerDashboard(ringkas) {
    const el = document.getElementById("dash-backup-banner");
    if (!el) return;
    if (!ringkas || ringkas.tingkat === "ok" || !ringkas.pesan) {
        el.classList.add("hidden");
        el.innerHTML = "";
        return;
    }
    const bahaya = ringkas.tingkat === "bahaya";
    const warna = bahaya ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-amber-50 border-amber-100 text-amber-700";
    el.className = `flex items-start gap-2 ${warna} border p-3 rounded-2xl text-xs`;
    el.innerHTML = `
        <i class="fas fa-triangle-exclamation mt-0.5" aria-hidden="true"></i>
        <span class="flex-1">${escapeHtml(ringkas.pesan)}</span>
        <button type="button" onclick="switchView('backup')" class="font-bold underline shrink-0">Buka Backup</button>`;
}