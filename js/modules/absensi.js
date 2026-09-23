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
    let countH = 0, countS = 0, countI = 0, countA = 0, countT = 0;

    filteredSiswa.forEach(s => {
        const rec = appState.absensi.find(a => String(a.siswa_id) === String(s.id));
        const st = rec ? rec.status : 'H';
        if (st === 'H') countH++;
        else if (st === 'S') countS++;
        else if (st === 'I') countI++;
        else if (st === 'T') countT++;
        else countA++;
    });

    const persenHadir = totalSiswa > 0 ? Math.round((countH / totalSiswa) * 100) : 0;
    const kelasOptions = appState.kelas.map(k =>
        `<option value="${k.id}" ${String(selectedKelas) === String(k.id) ? 'selected' : ''}>Kelas ${escapeHtml(k.nama_kelas)}</option>`
    ).join("");

    container.innerHTML = `
        <div class="space-y-3">
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
                <div class="flex-1">
                    <label for="absensi-kelas-filter" class="block text-xs font-bold text-slate-400 uppercase mb-1">Filter Kelas</label>
                    <select id="absensi-kelas-filter" onchange="renderAbsensiView()" class="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none">
                        <option value="">Semua Kelas</option>
                        ${kelasOptions}
                    </select>
                </div>
                ${isEditable && filteredSiswa.length > 0 ? `
                <div class="flex items-center gap-1.5 pt-1 sm:pt-4">
                    <button type="button" onclick="setAllAbsensiStatus('H')" class="touch-btn flex-1 sm:flex-none px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5 shadow-sm" title="Ubah status seluruh siswa jadi Hadir">
                        <i class="fas fa-check-double text-emerald-600"></i> Set Semua Hadir
                    </button>
                    <button type="button" onclick="setAllAbsensiStatus('I')" class="touch-btn px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition" title="Set Semua Izin">
                        <i class="fas fa-envelope-open-text"></i>
                    </button>
                    <button type="button" onclick="setAllAbsensiStatus('S')" class="touch-btn px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition" title="Set Semua Sakit">
                        <i class="fas fa-notes-medical"></i>
                    </button>
                </div>` : ''}
            </div>

            ${totalSiswa > 0 ? `
            <div id="absensi-stats-card" class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-3">
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tingkat Kehadiran</span>
                        <h3 id="absensi-persen-text" class="text-xl font-extrabold text-emerald-400">${persenHadir}% <span class="text-xs font-normal text-slate-300">Hadir</span></h3>
                    </div>
                    <div id="absensi-ratio-badge" class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                        ${countH}/${totalSiswa}
                    </div>
                </div>

                <div class="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div id="absensi-progress-bar" class="bg-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${persenHadir}%"></div>
                </div>

                <div class="grid grid-cols-5 gap-1.5 pt-1 border-t border-slate-700/60 text-center">
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Hadir</span>
                        <span id="stat-count-h" class="text-xs font-extrabold text-emerald-400">${countH}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Sakit</span>
                        <span id="stat-count-s" class="text-xs font-extrabold text-blue-400">${countS}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Izin</span>
                        <span id="stat-count-i" class="text-xs font-extrabold text-amber-400">${countI}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Telat</span>
                        <span id="stat-count-t" class="text-xs font-extrabold text-orange-400">${countT}</span>
                    </div>
                    <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <span class="block text-xs text-slate-400 font-bold">Alpa</span>
                        <span id="stat-count-a" class="text-xs font-extrabold text-rose-400">${countA}</span>
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
                                    <select onchange="updateLiveAbsensiStats()" data-siswa-id="${s.id}" class="absensi-select-item bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none text-slate-700" ${!isEditable ? 'disabled' : ''}>
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

function setAllAbsensiStatus(targetStatus) {
    const selects = document.querySelectorAll(".absensi-select-item");
    if (!selects || selects.length === 0) return;

    selects.forEach(sel => {
        sel.value = targetStatus;
    });

    updateLiveAbsensiStats();

    const labelMap = { 'H': 'Hadir', 'I': 'Izin', 'S': 'Sakit', 'A': 'Alpa', 'T': 'Terlambat' };
    showToast(`Semua siswa diatur menjadi: ${labelMap[targetStatus] || targetStatus}`);
}

function updateLiveAbsensiStats() {
    const selects = document.querySelectorAll(".absensi-select-item");
    if (!selects || selects.length === 0) return;

    const total = selects.length;
    let countH = 0, countS = 0, countI = 0, countA = 0, countT = 0;

    selects.forEach(sel => {
        const val = sel.value;
        if (val === 'H') countH++;
        else if (val === 'S') countS++;
        else if (val === 'I') countI++;
        else if (val === 'T') countT++;
        else countA++;
    });

    const persen = total > 0 ? Math.round((countH / total) * 100) : 0;

    const persenEl = document.getElementById("absensi-persen-text");
    const ratioEl = document.getElementById("absensi-ratio-badge");
    const progressEl = document.getElementById("absensi-progress-bar");
    const statH = document.getElementById("stat-count-h");
    const statS = document.getElementById("stat-count-s");
    const statI = document.getElementById("stat-count-i");
    const statT = document.getElementById("stat-count-t");
    const statA = document.getElementById("stat-count-a");

    if (persenEl) persenEl.innerHTML = `${persen}% <span class="text-xs font-normal text-slate-300">Hadir</span>`;
    if (ratioEl) ratioEl.innerText = `${countH}/${total}`;
    if (progressEl) progressEl.style.width = `${persen}%`;
    if (statH) statH.innerText = countH;
    if (statS) statS.innerText = countS;
    if (statI) statI.innerText = countI;
    if (statT) statT.innerText = countT;
    if (statA) statA.innerText = countA;
}
function cetakPDFAbsensi() {
    if (!appState.siswa || appState.siswa.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data siswa untuk dicetak.', confirmButtonColor: '#2563eb' });
        return;
    }

    const inputDate = document.getElementById("absensi-date");
    const tanggal = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    const selectedKelas = document.getElementById("absensi-kelas-filter")?.value || "";

    const rawFiltered = selectedKelas
        ? appState.siswa.filter(s => String(s.kelas_id) === String(selectedKelas))
        : appState.siswa;
    const filteredSiswa = sortSiswa(rawFiltered);

    if (filteredSiswa.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada siswa pada kelas yang dipilih.', confirmButtonColor: '#2563eb' });
        return;
    }

    const kls = selectedKelas ? appState.kelas.find(k => String(k.id) === String(selectedKelas)) : null;
    const namaKelas = kls ? kls.nama_kelas : "Semua Kelas";

    const labelMap = { 'H': 'Hadir', 'I': 'Izin', 'S': 'Sakit', 'A': 'Alpa', 'T': 'Terlambat' };
    let countH = 0, countS = 0, countI = 0, countA = 0, countT = 0;

    const rowsHtml = filteredSiswa.map((s, idx) => {
        const rec = appState.absensi.find(a => String(a.siswa_id) === String(s.id));
        const st = rec ? (rec.status || 'H') : 'H';
        if (st === 'H') countH++; else if (st === 'S') countS++; else if (st === 'I') countI++; else if (st === 'T') countT++; else countA++;

        return `
            <tr>
                <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
                <td style="padding: 6px 4px; text-align: center;">${escapeHtml(s.no_absen || '-')}</td>
                <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(s.nama)}</td>
                <td style="padding: 6px 6px; text-align: center;">${escapeHtml(labelMap[st] || st)}</td>
                <td style="padding: 6px 6px; text-align: center;">${rec && rec.waktu_masuk ? escapeHtml(formatDisplayTime(rec.waktu_masuk)) : '-'}</td>
            </tr>
        `;
    }).join('');

    const contentHtml = `
        <p style="margin: 0 0 8px 0; font-size: 12px;">Kelas: <b>${escapeHtml(namaKelas)}</b> &nbsp;|&nbsp; Tanggal Presensi: <b>${escapeHtml(tanggal)}</b></p>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 4px; width: 60px;">No. Absen</th>
                    <th style="padding: 8px 6px; text-align: left;">Nama Siswa</th>
                    <th style="padding: 8px 6px; width: 90px;">Status</th>
                    <th style="padding: 8px 6px; width: 90px;">Waktu Masuk</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 6px;">Hadir</th>
                    <th style="padding: 6px;">Sakit</th>
                    <th style="padding: 6px;">Izin</th>
                    <th style="padding: 6px;">Terlambat</th>
                    <th style="padding: 6px;">Alpa</th>
                </tr>
            </thead>
            <tbody>
                <tr style="text-align: center; font-weight: bold;">
                    <td style="padding: 6px;">${countH}</td>
                    <td style="padding: 6px;">${countS}</td>
                    <td style="padding: 6px;">${countI}</td>
                    <td style="padding: 6px;">${countT}</td>
                    <td style="padding: 6px;">${countA}</td>
                </tr>
            </tbody>
        </table>
    `;

    exportFeaturePDF(
        `REKAPITULASI PRESENSI KEHADIRAN - KELAS ${namaKelas.toUpperCase()}`,
        contentHtml,
        `Rekap_Presensi_${namaKelas}_${tanggal}.pdf`
    );
}
