function getPembinaanStatusBadge(status) {
    const s = String(status || '').trim().toLowerCase();
    if (s === 'pemantauan') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (s === 'dalam pembinaan') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'perlu tindak lanjut') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (s === 'selesai') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
}

async function loadPembinaanData(forceRefresh = false) {
    const isSiswa = appState.user && appState.user.role === 'siswa';
    const filterSelect = document.getElementById("pembinaan-siswa-filter");

    if (filterSelect) {
        if (isSiswa) {
            filterSelect.innerHTML = `<option value="${appState.user.id}">${escapeHtml(appState.user.nama || 'Saya')}</option>`;
            filterSelect.value = appState.user.id;
            filterSelect.disabled = true;
        } else if (appState.siswa.length > 0 && filterSelect.options.length <= 1) {
            filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
        }
    }

    const selectedSiswaId = isSiswa ? appState.user.id : (filterSelect ? filterSelect.value : null);

    if (appState.pembinaan && appState.pembinaan.length > 0) {
        renderPembinaanView();
    } else {
        renderSkeleton("pembinaan-list-container", 3);
    }

    const res = await apiCall("getPembinaan", { siswa_id: selectedSiswaId }, false);
    if (res && res.data) {
        appState.pembinaan = res.data;
        lastFetchTimes.pembinaan = Date.now();
        saveAppStateToLocal();
        renderPembinaanView();
    }
}

function renderPembinaanView() {
    const container = document.getElementById("pembinaan-list-container");
    if (!container) return;

    const filterSiswaId = document.getElementById("pembinaan-siswa-filter")?.value || "";
    const filteredPembinaan = filterSiswaId
        ? (appState.pembinaan || []).filter(item => String(item.siswa_id) === String(filterSiswaId))
        : (appState.pembinaan || []);

    if (filteredPembinaan.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-check text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Tidak ada catatan pembinaan aktif untuk siswa ini.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    container.innerHTML = filteredPembinaan.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const statusBadge = getPembinaanStatusBadge(item.status);

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(item.jenis || 'Pembinaan')}</span>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.permasalahan)}</h4>
                        <p class="text-xs text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} • Tanggal: ${escapeHtml(item.tanggal)}</p>
                    </div>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-md border ${statusBadge}">${escapeHtml(item.status)}</span>
                </div>
                ${item.jadwal_pantau ? `
                <div class="text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5 text-slate-600 font-medium">
                    <i class="fas fa-clock text-amber-500"></i> Jadwal Pantau: <span class="font-bold text-amber-700">${escapeHtml(item.jadwal_pantau)}</span>
                </div>` : ''}
                ${isAdminOrGuru ? `
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
                    <button onclick="openModalPembinaan('${escapeHtml(item.id)}')" class="text-xs font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deletePembinaan('${escapeHtml(item.id)}')" class="text-xs font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>
        `;
    }).join("");
}

function openModalPembinaan(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const rec = id ? appState.pembinaan.find(x => String(x.id) === String(id)) : null;
    const draft = !id ? getFormDraft("pembinaan") : null;

    const siswaOpts = appState.siswa.map(s =>
        `<option value="${s.id}" ${(draft?.['m-pbn-siswa'] || rec?.siswa_id) == s.id ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`
    ).join("");

    const tanggalPengisian = rec ? rec.tanggal : getDateWITA();

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Catatan Pembinaan' : 'Tambah Catatan Pembinaan'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePembinaanForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-pbn-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-pbn-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-pbn-jenis" class="block text-xs font-bold text-slate-500 mb-1">JENIS</label>
                    <select id="m-pbn-jenis" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${['Sikap', 'Akademik', 'Kehadiran', 'Sosial'].map(j => `<option value="${j}" ${(draft?.['m-pbn-jenis'] || rec?.jenis) === j ? 'selected' : ''}>${j}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="m-pbn-status" class="block text-xs font-bold text-slate-500 mb-1">STATUS</label>
                    <select id="m-pbn-status" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${['Pemantauan', 'Dalam Pembinaan', 'Perlu Tindak Lanjut', 'Selesai'].map(st => `<option value="${st}" ${String(draft?.['m-pbn-status'] || rec?.status).toLowerCase() === st.toLowerCase() ? 'selected' : ''}>${st}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label for="m-pbn-masalah" class="block text-xs font-bold text-slate-500 mb-1">DESKRIPSI PERMASALAHAN / CATATAN</label>
                <textarea id="m-pbn-masalah" rows="3" placeholder="Jelaskan kasus..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${escapeHtml(draft?.['m-pbn-masalah'] || rec?.permasalahan || '')}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-pbn-tanggal" class="block text-xs font-bold text-slate-500 mb-1">TANGGAL PENGISIAN</label>
                    <input type="date" id="m-pbn-tanggal" value="${tanggalPengisian}" class="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs outline-none cursor-not-allowed text-slate-500 font-bold" readonly disabled>
                </div>
                <div>
                    <label for="m-pbn-pantau" class="block text-xs font-bold text-slate-500 mb-1">JADWAL PANTAU</label>
                    <input type="date" id="m-pbn-pantau" value="${draft?.['m-pbn-pantau'] || rec?.jadwal_pantau || ''}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <button type="submit" id="btn-save-pembinaan" class="w-full bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Catatan Pembinaan</button>
        </form>
    `;

    document.getElementById("modal-container")?.classList.remove("hidden");

    if (!id) {
        const fields = ['m-pbn-siswa', 'm-pbn-jenis', 'm-pbn-status', 'm-pbn-masalah', 'm-pbn-pantau'];
        attachAutoSaveDraft("pembinaan", fields);
        if (draft) showDraftIndicator(true);
    }
}

async function savePembinaanForm(e, id) {
    e.preventDefault();

    const siswaId = document.getElementById("m-pbn-siswa").value;
    const jenis = document.getElementById("m-pbn-jenis").value;
    const status = document.getElementById("m-pbn-status").value;
    const permasalahan = document.getElementById("m-pbn-masalah").value;
    const tanggal = document.getElementById("m-pbn-tanggal").value || getDateWITA();
    const jadwal_pantau = document.getElementById("m-pbn-pantau").value;

    const payload = {
        id: id || null,
        siswa_id: siswaId,
        jenis: jenis,
        status: status,
        permasalahan: permasalahan,
        tanggal: tanggal,
        jadwal_pantau: jadwal_pantau
    };

    showLoading("Menyimpan catatan pembinaan...");

    const res = await apiCall("savePembinaan", payload, false);
    hideLoading();

    if (res && res.status === "success") {
        const recordId = res.id || res.data?.id || id || ("PBN-" + Date.now());
        const savedRecord = {
            id: recordId,
            siswa_id: siswaId,
            jenis: jenis,
            status: status,
            permasalahan: permasalahan,
            tanggal: tanggal,
            jadwal_pantau: jadwal_pantau
        };

        const idx = appState.pembinaan.findIndex(x => String(x.id) === String(recordId) || (id && String(x.id) === String(id)));
        if (idx !== -1) {
            appState.pembinaan[idx] = savedRecord;
        } else {
            appState.pembinaan.push(savedRecord);
        }

        clearFormDraft("pembinaan");
        saveAppStateToLocal();
        renderPembinaanView();
        closeModal();

        await markNotifHandledByPembinaan(siswaId, recordId);
        checkStudentNotifications();

        showToast("Catatan pembinaan berhasil disimpan!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan catatan pembinaan ke database spreadsheet.',
            confirmButtonColor: '#2563eb'
        });
    }
}

async function deletePembinaan(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Pembinaan?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        appState.pembinaan = appState.pembinaan.filter(x => String(x.id) !== String(id));
        saveAppStateToLocal();
        renderPembinaanView();
        showToast("Pembinaan dihapus");
        apiCall("deletePembinaan", { id }, false);
    }
}

function openQuickPembinaan(siswaId, defaultMasalah, notifId = "") {
    closeModal();
    openModalPembinaan();
    setPendingPembinaanNotif(notifId, siswaId);
    setTimeout(() => {
        const siswaSelect = document.getElementById("m-pbn-siswa");
        const masalahInput = document.getElementById("m-pbn-masalah");
        if (siswaSelect) siswaSelect.value = siswaId;
        if (masalahInput) masalahInput.value = defaultMasalah || "";
    }, 150);
}