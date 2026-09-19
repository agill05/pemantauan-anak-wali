function switchAkademikTab(tab) {
    document.querySelectorAll(".akd-tab-content").forEach(c => c.classList.add("hidden"));
    document.querySelectorAll(".akd-tab-btn").forEach(b => {
        b.classList.remove("bg-white", "text-primary", "shadow-sm", "bg-surface");
        b.classList.add("text-slate-600");
    });

    const target = document.getElementById(`akd-tab-${tab}`);
    const targetBtn = document.getElementById(`btn-akd-tab-${tab}`);

    if (target) target.classList.remove("hidden");
    if (targetBtn) {
        targetBtn.classList.add("bg-white", "text-primary", "shadow-sm");
        targetBtn.classList.remove("text-slate-600");
    }

    if (tab === "nilai") renderAkademikNilai();
    if (tab === "prestasi") renderAkademikPrestasi();
}

async function loadAkademikData(forceRefresh = false) {
    const filterSelect = document.getElementById("akademik-siswa-filter");
    if (filterSelect && appState.siswa.length > 0 && filterSelect.options.length <= 1) {
        filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    }

    const selectedSiswaId = filterSelect ? filterSelect.value : null;
    const isStale = (Date.now() - (lastFetchTimes.akademik || 0)) > CACHE_TTL;

    const isPrestasiActive = !document.getElementById("akd-tab-prestasi")?.classList.contains("hidden");
    const currentTab = isPrestasiActive ? 'prestasi' : 'nilai';

    if (appState.akademik && appState.akademik.length > 0) {
        switchAkademikTab(currentTab);
    } else {
        renderSkeleton("akademik-list-container", 3);
        renderSkeleton("prestasi-list-container", 3);
    }

    if (forceRefresh || isStale || !appState.akademik || appState.akademik.length === 0) {
        const [resAkd, resPrs] = await Promise.all([
            apiCall("getAkademik", { siswa_id: selectedSiswaId }, false),
            apiCall("getPrestasi", { siswa_id: selectedSiswaId }, false)
        ]);

        if (resAkd && resAkd.data) appState.akademik = resAkd.data;
        if (resPrs && resPrs.data) appState.prestasi = resPrs.data;

        lastFetchTimes.akademik = Date.now();
        saveAppStateToLocal();
        switchAkademikTab(currentTab);
    }
}

function renderAkademikNilai() {
    const container = document.getElementById("akademik-list-container");
    if (!container) return;

    const filterSiswaId = document.getElementById("akademik-siswa-filter")?.value || "";
    const filteredAkademik = filterSiswaId
        ? (appState.akademik || []).filter(item => String(item.siswa_id) === String(filterSiswaId))
        : (appState.akademik || []);

    if (filteredAkademik.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-graduation-cap text-2xl mb-2 text-indigo-500"></i><p class="text-xs text-slate-500">Belum ada data nilai mata pelajaran untuk siswa ini.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    container.innerHTML = filteredAkademik.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const isBelowKKTP = Number(item.nilai_akhir) < Number(item.kktp);
        const badgeColor = isBelowKKTP ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.mapel)}</h4>
                    <p class="text-xs text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} | KKTP: ${item.kktp}</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-black px-2.5 py-1 rounded-xl border ${badgeColor}">
                        ${item.nilai_akhir} ${isBelowKKTP ? '⚠️' : '✅'}
                    </span>
                    ${isAdminOrGuru ? `
                    <div class="flex gap-1">
                        <button onclick="openModalAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit nilai akademik"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus nilai akademik"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function renderAkademikPrestasi() {
    const container = document.getElementById("prestasi-list-container");
    if (!container) return;

    const filterSiswaId = document.getElementById("akademik-siswa-filter")?.value || "";
    const filteredPrestasi = filterSiswaId
        ? (appState.prestasi || []).filter(item => String(item.siswa_id) === String(filterSiswaId))
        : (appState.prestasi || []);

    if (filteredPrestasi.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-trophy text-2xl mb-2 text-amber-500"></i><p class="text-xs text-slate-500">Belum ada data catatan prestasi untuk siswa ini.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    container.innerHTML = filteredPrestasi.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold"><i class="fas fa-award"></i></div>
                        <div>
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama_prestasi)}</h4>
                            <p class="text-xs text-slate-400">Siswa: ${escapeHtml(s ? s.nama : 'Siswa')} • ${escapeHtml(item.tanggal)}</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">${escapeHtml(item.tingkat)}</span>
                </div>
                ${isAdminOrGuru ? `
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
                    <button onclick="openModalPrestasi('${escapeHtml(item.id)}')" class="text-xs font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deletePrestasi('${escapeHtml(item.id)}')" class="text-xs font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>
        `;
    }).join("");
}

function openModalAkademik(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const rec = id ? appState.akademik.find(x => String(x.id) === String(id)) : null;
    const siswaOpts = appState.siswa.map(s => `<option value="${s.id}" ${rec && String(rec.siswa_id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Nilai Akademik' : 'Input Nilai Mata Pelajaran'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveAkademikForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-akd-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-akd-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div>
                <label for="m-akd-mapel" class="block text-xs font-bold text-slate-500 mb-1">MATA PELAJARAN</label>
                <input type="text" id="m-akd-mapel" value="${escapeHtml(rec?.mapel || '')}" placeholder="Contoh: Matematika" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-akd-nilai" class="block text-xs font-bold text-slate-500 mb-1">NILAI AKHIR</label>
                    <input type="number" id="m-akd-nilai" value="${rec?.nilai_akhir || ''}" placeholder="0 - 100" min="0" max="100" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label for="m-akd-kktp" class="block text-xs font-bold text-slate-500 mb-1">KKTP (STANDAR)</label>
                    <input type="number" id="m-akd-kktp" value="${rec?.kktp || '75'}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Nilai</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveAkademikForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-akd-siswa").value,
        mapel: document.getElementById("m-akd-mapel").value,
        nilai_akhir: document.getElementById("m-akd-nilai").value,
        kktp: document.getElementById("m-akd-kktp").value
    };

    showLoading("Menyimpan nilai akademik...");
    const res = await apiCall("saveAkademik", payload, false);
    hideLoading();

    if (res && res.status === "success") {
        const savedRecord = { ...payload, id: res.id || id || ("AKD-" + Date.now()) };
        const idx = appState.akademik.findIndex(x => String(x.id) === String(savedRecord.id));
        if (idx !== -1) appState.akademik[idx] = savedRecord;
        else appState.akademik.push(savedRecord);

        saveAppStateToLocal();
        renderAkademikNilai();
        closeModal();
        showToast("Nilai tersimpan!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan nilai akademik ke database spreadsheet.',
            confirmButtonColor: '#2563eb'
        });
    }
}

async function deleteAkademik(id) {
    const confirm = await Swal.fire({ title: 'Hapus Nilai Mapel?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        appState.akademik = appState.akademik.filter(x => String(x.id) !== String(id));
        saveAppStateToLocal();
        renderAkademikNilai();
        showToast("Nilai dihapus");
        apiCall("deleteAkademik", { id }, false);
    }
}

function openModalPrestasi(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const rec = id ? appState.prestasi.find(x => String(x.id) === String(id)) : null;
    const siswaOpts = appState.siswa.map(s => `<option value="${s.id}" ${rec && String(rec.siswa_id) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Prestasi Siswa' : 'Catat Prestasi Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePrestasiForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-prs-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-prs-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div>
                <label for="m-prs-nama" class="block text-xs font-bold text-slate-500 mb-1">NAMA PRESTASI / JUARA</label>
                <input type="text" id="m-prs-nama" value="${escapeHtml(rec?.nama_prestasi || '')}" placeholder="Contoh: Juara 1 OSN IPA" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-prs-tingkat" class="block text-xs font-bold text-slate-500 mb-1">TINGKAT</label>
                    <select id="m-prs-tingkat" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional'].map(t => `<option value="${t}" ${rec && rec.tingkat === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="m-prs-tanggal" class="block text-xs font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-prs-tanggal" value="${rec ? rec.tanggal : getDateWITA()}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <button type="submit" class="w-full bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Prestasi</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function savePrestasiForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-prs-siswa").value,
        nama_prestasi: document.getElementById("m-prs-nama").value,
        tingkat: document.getElementById("m-prs-tingkat").value,
        tanggal: document.getElementById("m-prs-tanggal").value
    };

    showLoading("Menyimpan catatan prestasi...");
    const res = await apiCall("savePrestasi", payload, false);
    hideLoading();

    if (res && res.status === "success") {
        const savedRecord = { ...payload, id: res.id || id || ("PRS-" + Date.now()) };
        const idx = appState.prestasi.findIndex(x => String(x.id) === String(savedRecord.id));
        if (idx !== -1) appState.prestasi[idx] = savedRecord;
        else appState.prestasi.push(savedRecord);

        saveAppStateToLocal();
        renderAkademikPrestasi();
        closeModal();
        showToast("Catatan prestasi tersimpan!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan catatan prestasi ke database spreadsheet.',
            confirmButtonColor: '#2563eb'
        });
    }
}

async function deletePrestasi(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Prestasi?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        appState.prestasi = appState.prestasi.filter(x => String(x.id) !== String(id));
        saveAppStateToLocal();
        renderAkademikPrestasi();
        showToast("Prestasi dihapus");
        apiCall("deletePrestasi", { id }, false);
    }
}