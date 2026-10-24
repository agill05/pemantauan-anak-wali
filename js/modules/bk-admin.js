let bkList = [];
let bkLoaded = false;

function setBKFromState(arr) {
    if (!Array.isArray(arr)) return;
    bkList = arr;
    bkLoaded = true;
    appState.bk = arr;
}

async function loadBKList(force) {
    if (bkLoaded && !force) return bkList;
    const res = await apiCall("getBK", {}, false, 3, true);
    if (res && res.status === "success") {
        setBKFromState(res.data || []);
        saveAppStateToLocal();
    }
    return bkList;
}

async function renderAdminBK(force) {
    const list = document.getElementById("admin-bk-list");
    if (!list) return;
    if (!bkLoaded) list.innerHTML = '<p class="text-xs text-slate-400 p-3"><i class="fas fa-spinner fa-spin"></i> Memuat data Guru BK...</p>';
    await loadBKList(force);

    const query = (document.getElementById("search-bk-input")?.value || "").toLowerCase();
    const filtered = bkList.filter(b => safeStr(b.nama).toLowerCase().includes(query) || safeStr(b.username).toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = maskotKosong("Belum ada akun Guru BK.", 96, "admin");
        return;
    }

    const aksi = (id) => {
        const sid = escapeHtml(id);
        return `<span class="tt-aksi-grup">
            <button onclick="openModalBK('${sid}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit data Guru BK"><i class="fas fa-edit"></i></button>
            <button onclick="resetPasswordBK('${sid}')" class="p-2 bg-amber-50 text-amber-600 rounded-lg text-xs" aria-label="Reset password Guru BK"><i class="fas fa-key"></i></button>
            <button onclick="deleteBK('${sid}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus akun Guru BK"><i class="fas fa-trash"></i></button>
        </span>`;
    };

    const kolCek = bulkAktif("bk");
    const kartuHtml = filtered.map(b => `
        <div class="adm-card bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            ${bulkCheckbox("bk", b.id)}
            <div class="adm-main flex-1 min-w-0">
                <h4 class="font-bold text-xs text-slate-800">${escapeHtml(b.nama)}</h4>
                <p class="adm-sub text-xs text-slate-400">Username: ${escapeHtml(b.username)} | NIP: ${escapeHtml(b.nip || "-")}</p>
            </div>
            <div class="adm-act flex gap-1">${aksi(b.id)}</div>
        </div>`).join("");

    const barisHtml = filtered.map((b, i) => `
        <tr>
            ${kolCek ? `<td class="tt-cek">${bulkCheckbox("bk", b.id)}</td>` : ""}
            <td class="tt-no">${i + 1}</td>
            <th scope="row" class="tt-nama">${escapeHtml(b.nama)}</th>
            <td>${escapeHtml(b.username || "-")}</td>
            <td class="tt-tgl">${escapeHtml(b.nip || "-")}</td>
            <td class="tt-aksi">${aksi(b.id)}</td>
        </tr>`).join("");

    list.innerHTML = bulkToolbar("bk", filtered.map(b => String(b.id)))
        + `<div class="tt-kartu-wrap space-y-2">${kartuHtml}</div>`
        + admTabelHtml("Daftar Guru BK", kolCek, [["Nama", "tt-nama"], ["Username"], ["NIP"], ["Aksi", "tt-aksi"]], barisHtml);
}

function openModalBK(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    const b = id ? bkList.find(x => String(x.id) === String(id)) : null;

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${b ? "Edit Data Guru BK" : "Tambah Guru BK Baru"}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveBKForm(event, '${id || ""}')" class="space-y-3">
            <div>
                <label for="m-bk-nama" class="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                <input type="text" id="m-bk-nama" onblur="rapikanInputNama(this)" value="${escapeHtml(b?.nama || "")}" placeholder="Masukkan nama lengkap" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-bk-user" class="block text-xs font-bold text-slate-500 mb-1">USERNAME</label>
                    <input type="text" id="m-bk-user" value="${escapeHtml(b?.username || "")}" placeholder="Masukkan username" autocapitalize="none" autocomplete="off" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label for="m-bk-nip" class="block text-xs font-bold text-slate-500 mb-1">NIP</label>
                    <input type="text" id="m-bk-nip" value="${escapeHtml(b?.nip || "")}" placeholder="Masukkan NIP" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <div>
                <label for="m-bk-pwd" class="block text-xs font-bold text-slate-500 mb-1">PASSWORD ${b ? "(Kosongkan jika tidak diganti)" : "(Opsional)"}</label>
                <div class="relative">
                    <input type="password" id="m-bk-pwd" class="w-full bg-slate-50 border p-2.5 pr-9 rounded-xl text-xs outline-none" placeholder="${b ? "" : "Kosongkan untuk pakai password default"}">
                    <button type="button" onclick="togglePasswordVisibility('m-bk-pwd', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Tampilkan kata sandi">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <p class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-1.5 flex items-start gap-1.5">
                    <i class="fas fa-triangle-exclamation mt-0.5"></i>
                    <span>Jika dikosongkan, password akan diset otomatis ke <b>bk123</b>. Sistem memaksa ganti password saat login pertama.</span>
                </p>
            </div>
            <div>
                <label for="m-bk-hp" class="block text-xs font-bold text-slate-500 mb-1">NO. TELEPON / WA</label>
                <input type="text" id="m-bk-hp" value="${escapeHtml(normalizePhone(b?.no_hp))}" oninput="validatePhoneField(this)" placeholder="08xxxxxxxxxx" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                <p id="m-bk-hp-error" class="hidden text-[10px] text-rose-500 mt-1 font-semibold"><i class="fas fa-circle-exclamation"></i> Format nomor tidak valid. Gunakan 08xxxxxxxxxx (10-14 digit).</p>
            </div>
            <button type="submit" id="btn-save-bk" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Guru BK</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveBKForm(e, id) {
    e.preventDefault();

    const hpInput = document.getElementById("m-bk-hp");
    if (hpInput && !validatePhoneField(hpInput)) {
        hpInput.focus();
        return;
    }

    const btn = document.getElementById("btn-save-bk");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const payload = {
        id: id || null,
        nama: titleCaseNama(document.getElementById("m-bk-nama").value),
        username: document.getElementById("m-bk-user").value,
        password: document.getElementById("m-bk-pwd").value,
        nip: document.getElementById("m-bk-nip").value,
        no_hp: normalizePhone(document.getElementById("m-bk-hp").value)
    };

    const res = await apiCall("saveBK", payload, true);
    if (res && res.status === "success") {
        closeModal();
        showToast(res.message || "Data Guru BK disimpan!");
        await renderAdminBK(true);
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-70", "cursor-not-allowed");
            btn.innerHTML = originalHtml;
        }
        Swal.fire({ icon: "error", title: "Gagal Menyimpan", text: res?.message || "Terjadi kesalahan saat menyimpan data Guru BK.", confirmButtonColor: "#2563eb" });
    }
}

async function deleteBK(id) {
    if (!(await konfirmasiHapusBersih("bk", id))) return;

    const res = await apiCall("deleteBK", { id }, true);
    if (res && res.status === "success") {
        showToast("Akun Guru BK dihapus.");
        await renderAdminBK(true);
    } else {
        Swal.fire({ icon: "error", title: "Gagal Menghapus", text: res?.message || "Terjadi kesalahan saat menghapus akun Guru BK.", confirmButtonColor: "#2563eb" });
    }
}

async function resetPasswordBK(id) {
    const b = bkList.find(x => String(x.id) === String(id));
    const konfirmasi = await Swal.fire({
        title: "Reset password?",
        text: `Password ${b ? b.nama : "Guru BK"} akan dikembalikan ke bk123 dan wajib diganti saat login berikutnya.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Ya, Reset",
        cancelButtonText: "Batal"
    });
    if (!konfirmasi.isConfirmed) return;

    const res = await apiCall("resetPasswordBK", { id }, true);
    if (res && res.status === "success") {
        Swal.fire({ icon: "success", title: "Password Direset", text: res.message, confirmButtonColor: "#2563eb" });
    } else {
        Swal.fire({ icon: "error", title: "Gagal Reset", text: res?.message || "Terjadi kesalahan saat reset password.", confirmButtonColor: "#2563eb" });
    }
}

function downloadTemplateBKCSV() {
    const csvContent = "\uFEFF" + "username,nama,nip,no_hp,password\n" +
        "bk01,Contoh Nama Guru BK,196501011990031001,081234567890,\n";
    _downloadCSVString(csvContent, "Template_Import_Guru_BK.csv");
    showToast("Template CSV Guru BK berhasil diunduh!");
}

async function exportBKCSV() {
    await loadBKList(false);
    if (!bkList.length) {
        Swal.fire({ icon: "warning", title: "Data Kosong", text: "Tidak ada data Guru BK untuk diekspor.", confirmButtonColor: "#2563eb" });
        return;
    }
    const rows = bkList.map(b => ({
        username: b.username || "",
        nama: b.nama || "",
        nip: b.nip || "",
        no_hp: normalizePhone(b.no_hp),
        password: ""
    }));
    const csvContent = "\uFEFF" + Papa.unparse(rows, { columns: ["username", "nama", "nip", "no_hp", "password"] });
    _downloadCSVString(csvContent, `Data_Guru_BK_${getDateWITA()}.csv`);
    showToast("Data Guru BK berhasil diekspor ke CSV!");
}

function triggerImportBK() {
    const input = document.getElementById("import-bk-file");
    if (input) {
        input.value = "";
        input.click();
    }
}

function handleImportBKFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.trim().toLowerCase(),
        complete: async (results) => {
            const rows = (results.data || []).filter(r => r.username && r.nama);
            if (rows.length === 0) {
                Swal.fire({ icon: "warning", title: "File Kosong", text: "Tidak ditemukan baris data valid (username & nama wajib diisi) pada file CSV.", confirmButtonColor: "#2563eb" });
                return;
            }

            const konfirmasi = await Swal.fire({
                title: `Import ${rows.length} Data Guru BK?`,
                text: 'Username yang sudah ada akan diperbarui. Data baru memakai password default "bk123" jika kolom password kosong.',
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#2563eb",
                confirmButtonText: "Ya, Import Sekarang",
                cancelButtonText: "Batal"
            });
            if (!konfirmasi.isConfirmed) return;

            showLoading("Mengimpor data Guru BK...");
            const res = await apiCall("importBKBatch", { rows }, true);
            hideLoading();

            if (res && res.status === "success") {
                await renderAdminBK(true);
                Swal.fire({ icon: "success", title: "Import Selesai", text: res.message, confirmButtonColor: "#2563eb" });
            } else {
                Swal.fire({ icon: "error", title: "Gagal Import", text: res?.message || "Terjadi kesalahan saat import data Guru BK.", confirmButtonColor: "#2563eb" });
            }
        },
        error: () => {
            Swal.fire({ icon: "error", title: "Gagal Membaca File", text: "Pastikan file berformat CSV yang valid.", confirmButtonColor: "#2563eb" });
        }
    });
}