function getHafalanProgressStats(hafalanList = []) {
    const lancarSurahs = hafalanList.filter(h => h.status === 'Lancar').map(h => h.nama_surat);

    const juz30Surahs = MASTER_SURAHS.filter(s => s.juz === 30);
    const juz30Lancar = juz30Surahs.filter(s => lancarSurahs.includes(s.nama)).length;
    const juz30Percent = Math.round((juz30Lancar / juz30Surahs.length) * 100);

    const totalLancar = MASTER_SURAHS.filter(s => lancarSurahs.includes(s.nama)).length;
    const totalPercent = Math.round((totalLancar / 114) * 100);

    return {
        juz30: { count: juz30Lancar, total: juz30Surahs.length, percent: juz30Percent },
        total: { count: totalLancar, total: 114, percent: totalPercent }
    };
}

async function loadKeagamaanData(forceRefresh = false) {
    const filterSelect = document.getElementById("karakter-siswa-filter");
    if (filterSelect && filterSelect.options.length === 0) {
        populateSiswaSelectForRole(filterSelect, { includeAllOption: true });
    }

    const rawSelectedSiswaId = filterSelect ? filterSelect.value : "";
    const isAdminOrGuru = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    if (isAdminOrGuru && rawSelectedSiswaId === "") {
        renderKeagamaanView();
        return;
    }

    const selectedSiswaId = rawSelectedSiswaId === "ALL" ? null : rawSelectedSiswaId;
    const isStale = (Date.now() - (lastFetchTimes.keagamaan || 0)) > CACHE_TTL;

    if (appState.keagamaan && appState.keagamaan.length > 0) {
        renderKeagamaanView();
    } else {
        renderSkeleton("keagamaan-container", 3);
    }

    if (forceRefresh || isStale || !appState.keagamaan || appState.keagamaan.length === 0) {
        const res = await apiCall("getKeagamaan", { siswa_id: selectedSiswaId }, false);
        if (res && res.data) {
            appState.keagamaan = res.data;
            lastFetchTimes.keagamaan = Date.now();
            saveAppStateToLocal();
            renderKeagamaanView();
        }
    }
}

function renderKeagamaanView() {
    const container = document.getElementById("keagamaan-container");
    if (!container) return;

    const selectEl = document.getElementById("karakter-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    const isAdminOrGuru = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    if (isAdminOrGuru && filterSiswaId === "") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Silakan pilih siswa terlebih dahulu.</p></div>`;
        return;
    }

    const filteredHafalan = (filterSiswaId && filterSiswaId !== "ALL")
        ? appState.keagamaan.filter(h => String(h.siswa_id) === String(filterSiswaId))
        : appState.keagamaan;

    const stats = getHafalanProgressStats(filteredHafalan);

    const progressHeaderHtml = `
    <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-sm space-y-3 mb-4">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-100">Progres Hafalan Al-Qur'an</h3>
                <p class="text-xs text-emerald-200">Capaian Juz 30 & Total 114 Surah</p>
            </div>
            <span class="bg-white/20 px-2.5 py-1 rounded-xl text-xs font-extrabold backdrop-blur-sm">
                ${stats.juz30.count}/${stats.juz30.total} Surah (Juz 30)
            </span>
        </div>

        <div class="space-y-1">
            <div class="flex justify-between text-xs font-semibold">
                <span>Capaian Juz 30 (Juz Amma)</span>
                <span>${stats.juz30.percent}%</span>
            </div>
            <div class="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                <div class="bg-amber-300 h-full rounded-full transition-all duration-500" style="width: ${stats.juz30.percent}%"></div>
            </div>
        </div>

        <div class="space-y-1">
            <div class="flex justify-between text-xs font-semibold">
                <span>Keseluruhan 114 Surah</span>
                <span>${stats.total.percent}%</span>
            </div>
            <div class="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-300 h-full rounded-full transition-all duration-500" style="width: ${stats.total.percent}%"></div>
            </div>
        </div>
    </div>
    `;

    if (!filteredHafalan || filteredHafalan.length === 0) {
        container.innerHTML = progressHeaderHtml + `<div class="empty-state"><i class="fas fa-quran text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Belum ada catatan hafalan Al-Qur'an.</p></div>`;
        return;
    }

    const isAdminOrGuruItem = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    const cardsHtml = filteredHafalan.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const statusBadge = item.status === 'Lancar' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (item.status === 'Mengulang' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200');

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-book-open"></i></div>
                        <div>
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama_surat)}</h4>
                            <p class="text-xs text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} • ${escapeHtml(item.tanggal)}</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-md border ${statusBadge}">${escapeHtml(item.status)}</span>
                </div>
                ${item.catatan ? `<p class="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 italic">"${escapeHtml(item.catatan)}"</p>` : ''}
                ${isAdminOrGuruItem ? `
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
                    <button onclick="openModalKeagamaan('${escapeHtml(item.id)}')" class="text-xs font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteKeagamaan('${escapeHtml(item.id)}')" class="text-xs font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>
        `;
    }).join("");

    container.innerHTML = progressHeaderHtml + cardsHtml;
}

function openModalKeagamaan(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const record = id ? appState.keagamaan.find(x => String(x.id) === String(id)) : null;
    const siswaOptions = appState.siswa.map(s => `<option value="${s.id}" ${record && String(record.siswa_id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");
    const surahOptions = MASTER_SURAHS.map(s => `<option value="${s.nama}" ${record && record.nama_surat === s.nama ? 'selected' : ''}>${s.no}. Surah ${s.nama} (Juz ${s.juz})</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-quran text-emerald-600 mr-1.5"></i>${record ? 'Edit Catatan Hafalan' : 'Catat Hafalan Surah'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveKeagamaanForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-kag-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-kag-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOptions}</select>
            </div>
            <div>
                <label for="m-kag-surah" class="block text-xs font-bold text-slate-500 mb-1">SURAH AL-QUR'AN</label>
                <select id="m-kag-surah" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${surahOptions}</select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-kag-tanggal" class="block text-xs font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-kag-tanggal" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" value="${record ? record.tanggal : getDateWITA()}" required>
                </div>
                <div>
                    <label for="m-kag-status" class="block text-xs font-bold text-slate-500 mb-1">STATUS</label>
                    <select id="m-kag-status" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        <option value="Lancar" ${record && record.status === 'Lancar' ? 'selected' : ''}>Lancar</option>
                        <option value="Mengulang" ${record && record.status === 'Mengulang' ? 'selected' : ''}>Mengulang</option>
                        <option value="Belum Mulai" ${record && record.status === 'Belum Mulai' ? 'selected' : ''}>Belum Mulai</option>
                    </select>
                </div>
            </div>
            <div>
                <label for="m-kag-catatan" class="block text-xs font-bold text-slate-500 mb-1">CATATAN GURU</label>
                <textarea id="m-kag-catatan" rows="2" placeholder="Catatan kelancaran / tajwid..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">${record ? escapeHtml(record.catatan || '') : ''}</textarea>
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Hafalan</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveKeagamaanForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || ("HFL-" + Date.now()),
        siswa_id: document.getElementById("m-kag-siswa").value,
        nama_surat: document.getElementById("m-kag-surah").value,
        tanggal: document.getElementById("m-kag-tanggal").value,
        status: document.getElementById("m-kag-status").value,
        catatan: document.getElementById("m-kag-catatan").value
    };

    const idx = appState.keagamaan.findIndex(x => String(x.id) === String(payload.id));
    if (idx !== -1) appState.keagamaan[idx] = payload;
    else appState.keagamaan.push(payload);

    saveAppStateToLocal();
    renderKeagamaanView();
    closeModal();
    showToast("Catatan hafalan tersimpan!");

    apiCall("saveKeagamaan", payload, false);
}

async function deleteKeagamaan(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Hafalan?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        appState.keagamaan = appState.keagamaan.filter(x => String(x.id) !== String(id));
        saveAppStateToLocal();
        renderKeagamaanView();
        showToast("Hafalan dihapus");
        apiCall("deleteKeagamaan", { id }, false);
    }
}
