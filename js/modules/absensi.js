async function loadAbsensiData(forceRefresh = false) {
    const inputDate = document.getElementById("absensi-date");
    const tanggal = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    if (inputDate) inputDate.value = tanggal;

    const isStale = (Date.now() - (lastFetchTimes.absensi || 0)) > CACHE_TTL;

    if (appState.absensi && appState.absensi.length > 0) {
        renderAbsensiView();
    } else {
        renderSkeleton("absensi-list-container", 4);
    }

    if (forceRefresh || isStale || !appState.absensi || appState.absensi.length === 0) {
        const res = await apiCall("getAbsensi", { tanggal }, false);
        if (res && res.data) {
            appState.absensi = res.data;
            lastFetchTimes.absensi = Date.now();
            saveAppStateToLocal();
            renderAbsensiView();
        }
    }
}

function renderAbsensiView() {
    const container = document.getElementById("absensi-list-container");
    if (!container) return;

    if (appState.siswa.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-users-slash text-2xl mb-2"></i><p class="text-xs">Belum ada data siswa.</p></div>`;
        return;
    }

    const isEditable = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');
    const selectedKelas = document.getElementById("absensi-kelas-filter")?.value || "";

    const rawFiltered = selectedKelas
        ? appState.siswa.filter(s => String(s.kelas_id) === String(selectedKelas))
        : appState.siswa;

    const filteredSiswa = sortSiswa(rawFiltered);
    const totalSiswa = filteredSiswa.length;
    let countH = 0, countS = 0, countI = 0, countA = 0;

    filteredSiswa.forEach(s => {
        const rec = appState.absensi.find(a => String(a.siswa_id) === String(s.id));
        const st = rec ? rec.status : 'H';
        if (st === 'H') countH++;
        else if (st === 'S') countS++;
        else if (st === 'I') countI++;
        else countA++;
    });

    const persenHadir = totalSiswa > 0 ? Math.round((countH / totalSiswa) * 100) : 0;
    const kelasOptions = appState.kelas.map(k =>
        `<option value="${k.id}" ${String(selectedKelas) === String(k.id) ? 'selected' : ''}>Kelas ${escapeHtml(k.nama_kelas)}</option>`
    ).join("");

    container.innerHTML = `
        <div class="space-y-3">
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Filter Kelas</label>
                <select id="absensi-kelas-filter" onchange="renderAbsensiView()" class="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none">
                    <option value="">Semua Kelas</option>
                    ${kelasOptions}
                </select>
            </div>

            ${totalSiswa > 0 ? `
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-3">
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tingkat Kehadiran</span>
                        <h3 class="text-xl font-extrabold text-emerald-400">${persenHadir}% <span class="text-xs font-normal text-slate-300">Hadir</span></h3>
                    </div>
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                        ${countH}/${totalSiswa}
                    </div>
                </div>

                <div class="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div class="bg-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${persenHadir}%"></div>
                </div>

                <div class="grid grid-cols-4 gap-2 pt-1 border-t border-slate-700/60 text-center">
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Hadir</span>
                        <span class="text-xs font-extrabold text-emerald-400">${countH}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Sakit</span>
                        <span class="text-xs font-extrabold text-blue-400">${countS}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Izin</span>
                        <span class="text-xs font-extrabold text-amber-400">${countI}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Alpa</span>
                        <span class="text-xs font-extrabold text-rose-400">${countA}</span>
                    </div>
                </div>
            </div>
            ` : ''}

            ${filteredSiswa.length === 0 ? `
                <div class="empty-state"><i class="fas fa-user-slash text-xl mb-1"></i><p class="text-xs">Tidak ada siswa di kelas ini.</p></div>
            ` : `
                <form onsubmit="saveBatchAbsensiForm(event)" class="space-y-2">
                    ${filteredSiswa.map(s => {
        const rec = appState.absensi.find(a => String(a.siswa_id) === String(s.id)) || { status: 'H', waktu_masuk: '' };
        const currentStatus = rec.status || 'H';
        const noAbsenBadge = s.no_absen ? `<span class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-black mr-1">${s.no_absen}</span>` : '';

        return `
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 class="font-bold text-xs text-slate-800 flex items-center">${noAbsenBadge}${escapeHtml(s.nama)}</h4>
                                    <span class="text-xs text-slate-400">
                                        <i class="far fa-clock mr-1"></i>${rec.waktu_masuk ? formatDisplayTime(rec.waktu_masuk) : 'Belum Absen'}
                                    </span>
                                </div>
                                <div>
                                    <select data-siswa-id="${s.id}" class="absensi-select-item bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none text-slate-700" ${!isEditable ? 'disabled' : ''}>
                                        <option value="H" ${currentStatus === 'H' ? 'selected' : ''}>Hadir (H)</option>
                                        <option value="I" ${currentStatus === 'I' ? 'selected' : ''}>Izin (I)</option>
                                        <option value="S" ${currentStatus === 'S' ? 'selected' : ''}>Sakit (S)</option>
                                        <option value="A" ${currentStatus === 'A' ? 'selected' : ''}>Alpa (A)</option>
                                        <option value="T" ${currentStatus === 'T' ? 'selected' : ''}>Terlambat (T)</option>
                                    </select>
                                </div>
                            </div>
                        `;
    }).join('')}

                    ${isEditable ? `
                    <div class="pt-2">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2">
                            <i class="fas fa-save"></i> Simpan Semua Presensi (${filteredSiswa.length} Siswa)
                        </button>
                    </div>` : ''}
                </form>
            `}
        </div>
    `;
}

async function saveBatchAbsensiForm(event) {
    if (event) event.preventDefault();
    showLoading("Menyimpan presensi...");

    const selectElements = document.querySelectorAll(".absensi-select-item");
    const payloadAbsensi = [];
    const inputDate = document.getElementById("absensi-date");
    const tanggalTarget = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();

    selectElements.forEach(select => {
        const siswaId = select.getAttribute("data-siswa-id");
        const selectedStatus = select.value;
        payloadAbsensi.push({
            siswa_id: siswaId,
            status: selectedStatus,
            waktu_masuk: getTimeWITA24(),
            tanggal: tanggalTarget
        });
    });

    if (!navigator.onLine) {
        localStorage.setItem("offline_absensi_queue", JSON.stringify({ items: payloadAbsensi, tanggal: tanggalTarget }));

        payloadAbsensi.forEach(item => {
            const idx = appState.absensi.findIndex(a => String(a.siswa_id) === String(item.siswa_id));
            if (idx !== -1) appState.absensi[idx] = item;
            else appState.absensi.push(item);
        });
        saveAppStateToLocal();
        renderAbsensiView();
        hideLoading();
        showToast("Mode Offline: Presensi disimpan sementara di perangkat.", "warning");
        return;
    }

    const res = await apiCall("saveAbsensi", { items: payloadAbsensi, tanggal: tanggalTarget }, false);
    hideLoading();

    if (res && res.status === "success") {
        payloadAbsensi.forEach(item => {
            const idx = appState.absensi.findIndex(a => String(a.siswa_id) === String(item.siswa_id));
            if (idx !== -1) appState.absensi[idx] = item;
            else appState.absensi.push(item);
        });
        saveAppStateToLocal();
        renderAbsensiView();
        showToast("Presensi berhasil disimpan!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan jaringan.',
            confirmButtonColor: '#2563eb'
        });
    }
}