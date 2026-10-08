let absensiLoadedTanggal = null;
let absensiTab = 'kelas';
let absensiLastPeran = null;
let absensiMentorLoadedTanggal = null;
let absensiMentorTried = null;
let absensiMentorFetching = false;

const ABSENSI_LABEL = { H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alpa', T: 'Terlambat', '': 'Belum diisi' };

function absensiTabTersedia() {
    const u = appState.user;
    if (!u) return { kelas: false, binaan: false };
    if (u.role === 'admin' || u.role === 'kepsek') return { kelas: true, binaan: true };
    if (u.role !== 'guru') return { kelas: false, binaan: false };
    return { kelas: isWaliUser(), binaan: isMentorUser() };
}

function syncAbsensiTab() {
    const info = absensiTabTersedia();
    const peran = isGuruUser() ? getPeranAktif() : null;
    if (peran !== absensiLastPeran) {
        absensiLastPeran = peran;
        if (peran === 'wali' && info.kelas) absensiTab = 'kelas';
        else if (peran === 'mentor' && info.binaan) absensiTab = 'binaan';
    }
    if (absensiTab === 'binaan' && !info.binaan) absensiTab = 'kelas';
    if (absensiTab === 'kelas' && !info.kelas && info.binaan) absensiTab = 'binaan';
    return info;
}

function setAbsensiTab(tab) {
    absensiTab = tab;
    renderAbsensiView();
}

function absensiSiswaTab(tab) {
    const all = appState.siswa || [];
    const u = appState.user;
    if (!u) return [];
    const punyaMentor = s => String(s.mentor_id || '').trim() !== '';
    if (u.role === 'admin' || u.role === 'kepsek') return tab === 'binaan' ? all.filter(punyaMentor) : all;
    if (tab === 'binaan') return all.filter(s => String(s.mentor_id || '').trim() === String(u.id));
    const kw = getKelasWaliId();
    return kw === null ? [] : all.filter(s => String(s.kelas_id) === String(kw));
}

function absensiRec(tab, siswaId) {
    const src = tab === 'binaan' ? appState.absensiMentor : appState.absensi;
    const r = (src || []).find(a => String(a.siswa_id) === String(siswaId));
    return { status: (r && r.status) || '', waktu: r ? (r.waktu_masuk || r.waktu || '') : '' };
}

function absensiBisaTulis(tab, siswa) {
    return canWriteType(getAccessTypeSiswa(siswa), tab === 'binaan' ? 'absensi_mentor' : 'absensi');
}

function absensiNamaKelas(id) {
    const k = (appState.kelas || []).find(x => String(x.id) === String(id));
    return k ? k.nama_kelas : '-';
}

function absensiNamaMentor(id) {
    const gid = String(id || '').trim();
    if (!gid) return '-';
    if (appState.user && String(appState.user.id) === gid) return appState.user.nama || 'Anda';
    const g = (appState.guru || []).find(x => String(x.id) === gid);
    return g ? g.nama : '-';
}

function getAbsensiListAktif() {
    const info = syncAbsensiTab();
    const tab = absensiTab;
    let list = absensiSiswaTab(tab);
    let filter = '';
    if (isBacaSemuaUser()) {
        if (tab === 'kelas') {
            filter = document.getElementById('absensi-kelas-filter')?.value || '';
            if (filter) list = list.filter(s => String(s.kelas_id) === String(filter));
        } else {
            filter = document.getElementById('absensi-mentor-filter')?.value || '';
            if (filter) list = list.filter(s => String(s.mentor_id || '').trim() === String(filter));
        }
    }
    return { tab, info, filter, list: sortSiswa(list) };
}

async function loadAbsensiMentor(tanggal, force) {
    const stale = (Date.now() - (lastFetchTimes.absensiMentor || 0)) > CACHE_TTL;
    if (!force && !stale && absensiMentorLoadedTanggal === tanggal) return;
    if (absensiMentorFetching) return;
    absensiMentorFetching = true;
    absensiMentorTried = tanggal;
    let res = null;
    try { res = await apiCall("getAbsensiMentor", { tanggal }, false); } finally { absensiMentorFetching = false; }
    if (res && res.data) {
        appState.absensiMentor = res.data;
        absensiMentorLoadedTanggal = tanggal;
        lastFetchTimes.absensiMentor = Date.now();
        renderAbsensiView();
    }
}

async function loadAbsensiData(forceRefresh = false) {
    const inputDate = document.getElementById("absensi-date");
    const tanggal = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    if (inputDate) inputDate.value = tanggal;
    const info = syncAbsensiTab();

    const isStale = (Date.now() - (lastFetchTimes.absensi || 0)) > CACHE_TTL;
    const sameDate = absensiLoadedTanggal === tanggal;

    if (sameDate && appState.absensi && appState.absensi.length > 0) {
        renderAbsensiView();
    } else {
        renderSkeleton("absensi-list-container", 4);
    }

    if (forceRefresh || isStale || !sameDate || !appState.absensi || appState.absensi.length === 0) {
        const res = await apiCall("getAbsensi", { tanggal }, false);
        if (res && res.data) {
            appState.absensi = res.data;
            absensiLoadedTanggal = tanggal;
            lastFetchTimes.absensi = Date.now();
            saveAppStateToLocal();
            renderAbsensiView();
        }
    }

    if (info.binaan) {
        if (forceRefresh) absensiMentorTried = null;
        await loadAbsensiMentor(tanggal, forceRefresh);
    }
}

function renderAbsensiTabs(info) {
    if (!(info.kelas && info.binaan)) return '';
    const btn = (tab, label, icon) => {
        const aktif = absensiTab === tab;
        return `<button type="button" onclick="setAbsensiTab('${tab}')" class="flex-1 py-2 rounded-lg text-xs font-bold transition ${aktif ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}"><i class="fas ${icon} mr-1.5"></i>${label}</button>`;
    };
    return `<div class="flex gap-1 bg-slate-100 p-1 rounded-xl">${btn('kelas', 'Presensi Kelas', 'fa-chalkboard-teacher')}${btn('binaan', 'Presensi Binaan', 'fa-user-friends')}</div>`;
}

function renderAbsensiView() {
    const container = document.getElementById("absensi-list-container");
    if (!container) return;

    const tanggalInputEl = document.getElementById("absensi-date");
    const tanggalAktif = tanggalInputEl ? (tanggalInputEl.value || getDateWITA()) : getDateWITA();
    const { tab, info, filter, list: filteredSiswa } = getAbsensiListAktif();
    const isBinaan = tab === 'binaan';

    if (isBinaan && absensiMentorLoadedTanggal !== tanggalAktif && absensiMentorTried !== tanggalAktif) {
        loadAbsensiMentor(tanggalAktif, true);
    }

    const tabsHtml = renderAbsensiTabs(info);

    if (!info.kelas && !info.binaan) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-users-slash text-2xl mb-2"></i><p class="text-xs">Belum ada data siswa.</p></div>`;
        return;
    }

    const lockState = getDateLockState(tanggalAktif);
    const dateEditable = !!(appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru') && lockState.editable);
    const totalSiswa = filteredSiswa.length;
    const rowEditable = s => dateEditable && absensiBisaTulis(tab, s);
    const editableCount = filteredSiswa.filter(rowEditable).length;
    const isEditable = editableCount > 0;
    let countH = 0, countS = 0, countI = 0, countA = 0, countT = 0, countB = 0;

    filteredSiswa.forEach(s => {
        const st = absensiRec(tab, s.id).status;
        if (st === 'H') countH++;
        else if (st === 'S') countS++;
        else if (st === 'I') countI++;
        else if (st === 'T') countT++;
        else if (st === 'A') countA++;
        else countB++;
    });

    const persenHadir = totalSiswa > 0 ? Math.round((countH / totalSiswa) * 100) : 0;

    let filterHtml = '';
    if (isBacaSemuaUser()) {
        if (!isBinaan) {
            filterHtml = `
                <div class="flex-1">
                    <label for="absensi-kelas-filter" class="block text-xs font-bold text-slate-400 uppercase mb-1">Filter Kelas</label>
                    <select id="absensi-kelas-filter" onchange="renderAbsensiView()" class="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none">
                        ${renderKelasSelectOptions(filter, { allLabel: "Semua Kelas", prefix: "Kelas " })}
                    </select>
                </div>`;
        } else {
            const mentorIds = [...new Set(absensiSiswaTab('binaan').map(s => String(s.mentor_id || '').trim()))];
            const opts = mentorIds
                .map(id => ({ id, nama: absensiNamaMentor(id) }))
                .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
                .map(m => `<option value="${escapeHtml(m.id)}" ${String(filter) === m.id ? 'selected' : ''}>${escapeHtml(m.nama)}</option>`).join('');
            filterHtml = `
                <div class="flex-1">
                    <label for="absensi-mentor-filter" class="block text-xs font-bold text-slate-400 uppercase mb-1">Filter Mentor</label>
                    <select id="absensi-mentor-filter" onchange="renderAbsensiView()" class="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none">
                        <option value="">Semua Mentor</option>${opts}
                    </select>
                </div>`;
        }
    } else if (isBinaan) {
        filterHtml = `<div class="flex-1"><span class="block text-xs font-bold text-slate-400 uppercase mb-1">Presensi Binaan</span><span class="text-xs text-slate-600 font-semibold">Kehadiran pertemuan bimbingan mentor. Tidak masuk rekap presensi kelas.</span></div>`;
    }

    const bulkHtml = isEditable ? `
        <div class="flex items-center gap-1.5 pt-1 sm:pt-4">
            <button type="button" onclick="setAllAbsensiStatus('H')" class="touch-btn flex-1 sm:flex-none px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5 shadow-sm" title="Ubah status seluruh siswa jadi Hadir">
                <i class="fas fa-check-double text-emerald-600"></i> Set Semua Hadir
            </button>
            <button type="button" onclick="setAllAbsensiStatus('I')" class="touch-btn px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition" title="Set Semua Izin"><i class="fas fa-envelope-open-text"></i></button>
            <button type="button" onclick="setAllAbsensiStatus('S')" class="touch-btn px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition" title="Set Semua Sakit"><i class="fas fa-notes-medical"></i></button>
        </div>` : '';

    const rekapBtn = isBinaan ? `
        <button type="button" onclick="tampilRekapAbsensiMentor()" class="touch-btn px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
            <i class="fas fa-chart-bar"></i> Rekap Binaan
        </button>` : '';

    const statCell = (label, id, val, color) => `
        <div class="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
            <span class="block text-xs text-slate-400 font-bold">${label}</span>
            <span id="${id}" class="text-xs font-extrabold ${color}">${val}</span>
        </div>`;

    const statsHtml = totalSiswa > 0 ? `
        <div id="absensi-stats-card" class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">${isBinaan ? 'Kehadiran Binaan' : 'Tingkat Kehadiran'}</span>
                    <h3 id="absensi-persen-text" class="text-xl font-extrabold text-emerald-400">${persenHadir}% <span class="text-xs font-normal text-slate-300">Hadir</span></h3>
                </div>
                <div id="absensi-ratio-badge" class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">${countH}/${totalSiswa}</div>
            </div>
            <div class="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div id="absensi-progress-bar" class="bg-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${persenHadir}%"></div>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 border-t border-slate-700/60 text-center">
                ${statCell('Hadir', 'stat-count-h', countH, 'text-emerald-400')}
                ${statCell('Sakit', 'stat-count-s', countS, 'text-blue-400')}
                ${statCell('Izin', 'stat-count-i', countI, 'text-amber-400')}
                ${statCell('Telat', 'stat-count-t', countT, 'text-orange-400')}
                ${statCell('Alpa', 'stat-count-a', countA, 'text-rose-400')}
                ${statCell('Belum', 'stat-count-b', countB, 'text-slate-300')}
            </div>
        </div>` : '';

    const rowsHtml = filteredSiswa.map(s => {
        const rec = absensiRec(tab, s.id);
        const editRow = rowEditable(s);
        const chip = isBinaan
            ? `<span class="ml-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200">${escapeHtml(absensiNamaKelas(s.kelas_id))}</span>`
            : `<span class="ml-1.5">${renderPeranChip(s)}</span>`;
        const mentorLine = (isBinaan && isBacaSemuaUser()) ? `<span class="text-xs text-slate-400 block"><i class="fas fa-user-tie mr-1"></i>${escapeHtml(absensiNamaMentor(s.mentor_id))}</span>` : '';
        const opt = (v, label) => `<option value="${v}" ${rec.status === v ? 'selected' : ''}>${label} (${v})</option>`;
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                    <h4 class="font-bold text-xs text-slate-800 flex items-center flex-wrap">${escapeHtml(s.nama)}${chip}</h4>
                    ${mentorLine}
                    <span class="text-xs text-slate-400"><i class="far fa-clock mr-1"></i>${rec.waktu ? formatDisplayTime(rec.waktu) : 'Belum Absen'}</span>
                </div>
                <div>
                    <select onchange="updateLiveAbsensiStats()" data-siswa-id="${s.id}" ${editRow ? '' : 'disabled'} class="absensi-select-item bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none text-slate-700">
                        <option value="" ${rec.status === '' ? 'selected' : ''}>Belum diisi</option>${opt('H', 'Hadir')}${opt('I', 'Izin')}${opt('S', 'Sakit')}${opt('A', 'Alpa')}${opt('T', 'Terlambat')}
                    </select>
                </div>
            </div>`;
    }).join('');

    const kosongTeks = isBinaan ? 'Belum ada anak binaan.' : 'Tidak ada siswa di kelas ini.';

    container.innerHTML = `
        <div class="space-y-3">
            ${tabsHtml}
            ${renderDateLockBanner(lockState, 'absensi')}
            ${(filterHtml || bulkHtml || rekapBtn) ? `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
                ${filterHtml}
                <div class="flex items-center gap-1.5 pt-1 sm:pt-4">${rekapBtn}</div>
                ${bulkHtml}
            </div>` : ''}
            ${statsHtml}
            ${totalSiswa === 0 ? `
                <div class="empty-state"><i class="fas fa-user-slash text-xl mb-1"></i><p class="text-xs">${kosongTeks}</p></div>
            ` : `
                <form onsubmit="saveBatchAbsensiForm(event)" class="space-y-2">
                    ${rowsHtml}
                    ${isEditable ? `
                    <div class="pt-2">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2">
                            <i class="fas fa-save"></i> Simpan Semua Presensi ${isBinaan ? 'Binaan ' : ''}(${editableCount} Siswa)
                        </button>
                    </div>` : ''}
                </form>
            `}
        </div>
    `;
}

async function tampilRekapAbsensiMentor() {
    const { list } = getAbsensiListAktif();
    if (list.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Belum ada anak binaan.', confirmButtonColor: '#2563eb' });
        return;
    }
    showLoading("Memuat rekap binaan...");
    const res = await apiCall("getAbsensiMentor", { rekap: true }, false);
    hideLoading();
    if (!res || res.status !== 'success') {
        Swal.fire({ icon: 'error', title: 'Gagal Memuat', text: res?.message || 'Terjadi kesalahan jaringan.', confirmButtonColor: '#2563eb' });
        return;
    }
    const peta = new Map((res.data || []).map(r => [String(r.siswa_id), r]));
    const baris = list.map(s => {
        const r = peta.get(String(s.id)) || { H: 0, S: 0, I: 0, T: 0, A: 0, total: 0 };
        const persen = r.total > 0 ? Math.round(((r.H + r.T) / r.total) * 100) : 0;
        return `<tr>
            <td style="padding:5px 6px;text-align:left;font-weight:bold;">${escapeHtml(s.nama)}</td>
            <td style="padding:5px 4px;">${r.H}</td><td style="padding:5px 4px;">${r.S}</td>
            <td style="padding:5px 4px;">${r.I}</td><td style="padding:5px 4px;">${r.T}</td>
            <td style="padding:5px 4px;">${r.A}</td><td style="padding:5px 4px;font-weight:bold;">${persen}%</td></tr>`;
    }).join('');
    Swal.fire({
        title: 'Rekap Presensi Binaan',
        width: 640,
        confirmButtonColor: '#2563eb',
        html: `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;text-align:center;" border="1" bordercolor="#cbd5e1">
            <thead><tr style="background:#f1f5f9;"><th style="padding:6px;text-align:left;">Nama</th><th>H</th><th>S</th><th>I</th><th>T</th><th>A</th><th>% Hadir</th></tr></thead>
            <tbody>${baris}</tbody></table></div>
            <p style="font-size:11px;color:#64748b;margin-top:8px;">Seluruh tanggal. % Hadir = (Hadir + Terlambat) / total pertemuan tercatat.</p>`
    });
}

function absensiAdaKosong(selectElements) {
    const kosong = Array.from(selectElements).filter(sel => sel.value === '');
    selectElements.forEach(sel => { sel.style.outline = ''; });
    if (kosong.length === 0) return false;
    kosong.forEach(sel => { sel.style.outline = '2px solid #fb7185'; });
    kosong[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    Swal.fire({
        icon: 'warning',
        title: 'Presensi Belum Lengkap',
        text: `Masih ada ${kosong.length} siswa belum diisi. Lengkapi dulu, atau ketuk "Set Semua Hadir" lalu ubah yang tidak hadir.`,
        confirmButtonColor: '#2563eb'
    });
    return true;
}

async function saveBatchAbsensiForm(event) {
    if (event) event.preventDefault();

    if (absensiTab === 'binaan') return saveBatchAbsensiMentor();

    const inputDate = document.getElementById("absensi-date");
    const tanggalTarget = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    const lockState = getDateLockState(tanggalTarget);
    if (!lockState.editable) {
        showDateLockedAlert(lockState);
        return;
    }

    const selectElements = document.querySelectorAll(".absensi-select-item:not([disabled])");
    if (selectElements.length === 0) {
        showToast("Tidak ada presensi yang dapat disimpan.", "warning");
        return;
    }
    if (absensiAdaKosong(selectElements)) return;

    showLoading("Menyimpan presensi...");

    const payloadAbsensi = [];

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

async function saveBatchAbsensiMentor() {
    const inputDate = document.getElementById("absensi-date");
    const tanggalTarget = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    const lockState = getDateLockState(tanggalTarget);
    if (!lockState.editable) {
        showDateLockedAlert(lockState);
        return;
    }

    const selectElements = document.querySelectorAll(".absensi-select-item:not([disabled])");
    if (selectElements.length === 0) {
        showToast("Tidak ada presensi yang dapat disimpan.", "warning");
        return;
    }
    if (!navigator.onLine) {
        showToast("Presensi binaan butuh koneksi internet.", "warning");
        return;
    }
    if (absensiAdaKosong(selectElements)) return;

    showLoading("Menyimpan presensi binaan...");
    const waktu = getTimeWITA24();
    const items = Array.from(selectElements).map(sel => ({
        siswa_id: sel.getAttribute("data-siswa-id"),
        status: sel.value,
        waktu: waktu,
        tanggal: tanggalTarget
    }));

    const res = await apiCall("saveAbsensiMentor", { items, tanggal: tanggalTarget }, false);
    hideLoading();

    if (res && res.status === "success") {
        if (!Array.isArray(appState.absensiMentor)) appState.absensiMentor = [];
        items.forEach(item => {
            const idx = appState.absensiMentor.findIndex(a => String(a.siswa_id) === String(item.siswa_id));
            if (idx !== -1) appState.absensiMentor[idx] = item;
            else appState.absensiMentor.push(item);
        });
        absensiMentorLoadedTanggal = tanggalTarget;
        lastFetchTimes.absensiMentor = Date.now();
        renderAbsensiView();
        showToast("Presensi binaan berhasil disimpan!");
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
    const inputDate = document.getElementById("absensi-date");
    const lockState = getDateLockState(inputDate ? (inputDate.value || getDateWITA()) : getDateWITA());
    if (!lockState.editable) {
        showDateLockedAlert(lockState);
        return;
    }

    const selects = document.querySelectorAll(".absensi-select-item:not([disabled])");
    if (!selects || selects.length === 0) return;

    selects.forEach(sel => {
        sel.value = targetStatus;
    });

    updateLiveAbsensiStats();

    const labelMap = ABSENSI_LABEL;
    showToast(`Semua siswa yang dapat diisi diatur menjadi: ${labelMap[targetStatus] || targetStatus}`);
}

function updateLiveAbsensiStats() {
    const selects = document.querySelectorAll(".absensi-select-item");
    if (!selects || selects.length === 0) return;

    const total = selects.length;
    let countH = 0, countS = 0, countI = 0, countA = 0, countT = 0, countB = 0;

    selects.forEach(sel => {
        const val = sel.value;
        if (val !== '') sel.style.outline = '';
        if (val === 'H') countH++;
        else if (val === 'S') countS++;
        else if (val === 'I') countI++;
        else if (val === 'T') countT++;
        else if (val === 'A') countA++;
        else countB++;
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
    const statB = document.getElementById("stat-count-b");

    if (persenEl) persenEl.innerHTML = `${persen}% <span class="text-xs font-normal text-slate-300">Hadir</span>`;
    if (ratioEl) ratioEl.innerText = `${countH}/${total}`;
    if (progressEl) progressEl.style.width = `${persen}%`;
    if (statH) statH.innerText = countH;
    if (statS) statS.innerText = countS;
    if (statI) statI.innerText = countI;
    if (statT) statT.innerText = countT;
    if (statA) statA.innerText = countA;
    if (statB) statB.innerText = countB;
}
function cetakPDFAbsensi() {
    const { tab, filter, list } = getAbsensiListAktif();
    const isBinaan = tab === 'binaan';
    if (list.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: isBinaan ? 'Tidak ada anak binaan untuk dicetak.' : 'Tidak ada siswa pada kelas yang dipilih.', confirmButtonColor: '#2563eb' });
        return;
    }

    const inputDate = document.getElementById("absensi-date");
    const tanggal = inputDate ? (inputDate.value || getDateWITA()) : getDateWITA();
    const admin = isBacaSemuaUser();
    const showKelas = isBinaan ? true : (admin && !filter);
    const showMentor = isBinaan && admin;

    const urut = [...list];
    if (showKelas) urut.sort((a, b) => absensiNamaKelas(a.kelas_id).localeCompare(absensiNamaKelas(b.kelas_id), "id", { numeric: true }));

    let namaGrup;
    if (isBinaan) namaGrup = admin ? (filter ? absensiNamaMentor(filter) : "Semua Mentor") : (appState.user.nama || "Mentor");
    else namaGrup = admin ? (filter ? absensiNamaKelas(filter) : "Semua Kelas") : absensiNamaKelas(getKelasWaliId());

    let countH = 0, countS = 0, countI = 0, countA = 0, countT = 0, countB = 0;
    const td = (v, extra = '') => `<td style="padding: 6px 6px; text-align: center; ${extra}">${v}</td>`;

    const rowsHtml = urut.map((s, idx) => {
        const rec = absensiRec(tab, s.id);
        const st = rec.status;
        if (st === 'H') countH++; else if (st === 'S') countS++; else if (st === 'I') countI++; else if (st === 'T') countT++; else if (st === 'A') countA++; else countB++;
        return `<tr>
            ${td(idx + 1)}
            <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(s.nama)}</td>
            ${showKelas ? td(escapeHtml(absensiNamaKelas(s.kelas_id))) : ''}
            ${showMentor ? td(escapeHtml(absensiNamaMentor(s.mentor_id))) : ''}
            ${td(escapeHtml(ABSENSI_LABEL[st] || st))}
            ${td(rec.waktu ? escapeHtml(formatDisplayTime(rec.waktu)) : '-')}
        </tr>`;
    }).join('');

    const th = (v, w = '') => `<th style="padding: 8px 6px; ${w ? 'width:' + w + ';' : ''}">${v}</th>`;
    const labelGrup = isBinaan ? 'Mentor' : 'Kelas';

    const contentHtml = `
        ${pdfInfoBlock([{label: labelGrup, value: namaGrup}, {label: "Tanggal Presensi", value: tanggal}])}
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    ${th('No', '30px')}
                    <th style="padding: 8px 6px; text-align: left;">Nama Siswa</th>
                    ${showKelas ? th('Kelas', '60px') : ''}
                    ${showMentor ? th('Mentor', '110px') : ''}
                    ${th('Status', '90px')}
                    ${th('Waktu', '90px')}
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 6px;">Hadir</th><th style="padding: 6px;">Sakit</th><th style="padding: 6px;">Izin</th><th style="padding: 6px;">Terlambat</th><th style="padding: 6px;">Alpa</th><th style="padding: 6px;">Belum diisi</th>
                </tr>
            </thead>
            <tbody>
                <tr style="text-align: center; font-weight: bold;">
                    <td style="padding: 6px;">${countH}</td><td style="padding: 6px;">${countS}</td><td style="padding: 6px;">${countI}</td><td style="padding: 6px;">${countT}</td><td style="padding: 6px;">${countA}</td><td style="padding: 6px;">${countB}</td>
                </tr>
            </tbody>
        </table>
    `;

    exportFeaturePDF(
        isBinaan
            ? `REKAPITULASI PRESENSI BINAAN - ${namaGrup.toUpperCase()}`
            : `REKAPITULASI PRESENSI KEHADIRAN - KELAS ${namaGrup.toUpperCase()}`,
        contentHtml,
        isBinaan ? `Rekap_Presensi_Binaan_${namaGrup}_${tanggal}.pdf` : `Rekap_Presensi_${namaGrup}_${tanggal}.pdf`
    );
}
