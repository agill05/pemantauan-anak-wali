function switchAkademikTab(tab) {
    const tgtPre = document.getElementById(`akd-tab-${tab}`);
    const berubahAkd = !!(tgtPre && tgtPre.classList.contains("hidden"));
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

    if (berubahAkd) animateSwap(target, tab === "prestasi" ? "left" : "right");
    if (tab === "nilai") renderAkademikNilai();
    if (tab === "prestasi") renderAkademikPrestasi();
}

async function loadAkademikData(forceRefresh = false) {
    const filterSelect = document.getElementById("akademik-siswa-filter");
    if (filterSelect && filterSelect.options.length === 0) {
        populateSiswaSelectForRole(filterSelect, { includeAllOption: true });
    }

    const rawSelectedSiswaId = filterSelect ? filterSelect.value : "";
    const isAdminOrGuru = isStafLihat();
    const isPrestasiActive = !document.getElementById("akd-tab-prestasi")?.classList.contains("hidden");
    const currentTab = isPrestasiActive ? 'prestasi' : 'nilai';

    if (isAdminOrGuru && rawSelectedSiswaId === "") {
        switchAkademikTab(currentTab);
        return;
    }

    const selectedSiswaId = rawSelectedSiswaId === "ALL" ? null : rawSelectedSiswaId;
    const isStale = (Date.now() - (lastFetchTimes.akademik || 0)) > CACHE_TTL;

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

    const selectEl = document.getElementById("akademik-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    const isAdminOrGuru = isStafLihat();

    if (isAdminOrGuru && filterSiswaId === "") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer text-2xl mb-2 text-indigo-500"></i><p class="text-xs text-slate-500">Silakan pilih siswa terlebih dahulu.</p></div>`;
        return;
    }

    const baseAkademik = scopeBySiswaId(appState.akademik, item => item.siswa_id);
    const filteredAkademik = (filterSiswaId && filterSiswaId !== "ALL")
        ? baseAkademik.filter(item => String(item.siswa_id) === String(filterSiswaId))
        : baseAkademik;
    const bannerBaca = renderReadOnlyBanner('akademik', 'nilai mapel');

    if (filteredAkademik.length === 0) {
        container.innerHTML = bannerBaca + `<div class="empty-state"><i class="fas fa-graduation-cap text-2xl mb-2 text-indigo-500"></i><p class="text-xs text-slate-500">Belum ada data nilai mata pelajaran untuk siswa ini.</p></div>`;
        return;
    }

    const idsBisaHapusAkd = filteredAkademik.filter(item => canEditRecord(item, 'akademik')).map(item => String(item.id));
    container.innerHTML = bannerBaca + bulkToolbar("akademik", idsBisaHapusAkd) + filteredAkademik.map(item => {
        const s = appState.siswa.find(x => String(x.id) === String(item.siswa_id)) || appState.user;
        const isBelowKKTP = Number(item.nilai_akhir) < Number(item.kktp);
        const badgeColor = isBelowKKTP ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
        const bisaUbah = canEditRecord(item, 'akademik');

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                ${bisaUbah ? bulkCheckbox("akademik", item.id) : ""}
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.mapel)}</h4>
                    ${renderInfoRows([
                        {label:"Siswa",value:escapeHtml(s ? s.nama : 'Siswa') + ' <span class="ml-1">' + renderPeranChip(s) + '</span>',html:true},
                        {label:"KKTP",value:item.kktp}
                    ])}
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-black px-2.5 py-1 rounded-xl border ${badgeColor}">
                        ${item.nilai_akhir} ${isBelowKKTP ? '⚠️' : '✅'}
                    </span>
                    ${bisaUbah ? `
                    <div class="flex gap-1">
                        <button onclick="openModalAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit nilai akademik"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus nilai akademik"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function openModalAkademik(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    box.dataset.gs = "";

    const writable = getSiswaWritable('akademik');
    if (!id && writable.length === 0) {
        Swal.fire({ icon: 'info', title: 'Tidak Ada Siswa', text: 'Tidak ada siswa yang dapat Anda isi nilainya.', confirmButtonColor: '#2563eb' });
        return;
    }

    const rec = id ? (appState.akademik || []).find(x => String(x.id) === String(id)) : null;
    if (id && !rec) {
        showToast("Data nilai tidak ditemukan. Muat ulang halaman.", "warning");
        return;
    }

    const filterEl = document.getElementById("akademik-siswa-filter");
    const preSiswaId = rec ? rec.siswa_id : (filterEl && filterEl.value && filterEl.value !== "ALL" ? filterEl.value : "");
    const daftar = rec
        ? (appState.siswa || []).filter(s => String(s.id) === String(rec.siswa_id))
        : writable;
    const siswaOpts = sortSiswa(daftar).map(s => `<option value="${escapeHtml(s.id)}" ${String(preSiswaId) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Nilai Mapel' : 'Tambah Nilai Mapel'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveAkademikForm(event, '${id ? escapeHtml(id) : ''}')" class="space-y-3">
            <div>
                <label for="m-akd-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-akd-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" ${rec ? 'disabled' : ''} required>${siswaOpts}</select>
            </div>
            <div>
                <label for="m-akd-mapel" class="block text-xs font-bold text-slate-500 mb-1">MATA PELAJARAN</label>
                <input type="text" id="m-akd-mapel" value="${escapeHtml(rec?.mapel || '')}" placeholder="Contoh: Matematika" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-akd-nilai" class="block text-xs font-bold text-slate-500 mb-1">NILAI AKHIR</label>
                    <input type="number" id="m-akd-nilai" min="0" max="100" step="0.01" inputmode="decimal" value="${rec ? escapeHtml(rec.nilai_akhir) : ''}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label for="m-akd-kktp" class="block text-xs font-bold text-slate-500 mb-1">KKTP</label>
                    <input type="number" id="m-akd-kktp" min="0" max="100" step="0.01" inputmode="decimal" value="${rec ? escapeHtml(rec.kktp) : '75'}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <button type="submit" class="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Nilai</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveAkademikForm(e, id) {
    e.preventDefault();
    const nilai = Number(document.getElementById("m-akd-nilai").value);
    const kktp = Number(document.getElementById("m-akd-kktp").value);
    if (!(nilai >= 0 && nilai <= 100) || !(kktp >= 0 && kktp <= 100)) {
        showToast("Nilai dan KKTP harus 0 sampai 100.", "warning");
        return;
    }
    const siswaEl = document.getElementById("m-akd-siswa");
    const payload = {
        id: id || null,
        siswa_id: siswaEl.value,
        mapel: document.getElementById("m-akd-mapel").value.trim(),
        nilai_akhir: nilai,
        kktp: kktp
    };

    showLoading("Menyimpan nilai mapel...");
    const res = await apiCall("saveAkademik", payload, false);
    hideLoading();

    if (res && res.status === "success") {
        const newId = res.id || id || ("AKD-" + Date.now());
        if (!Array.isArray(appState.akademik)) appState.akademik = [];
        const idx = appState.akademik.findIndex(x => String(x.id) === String(newId));
        const base = idx !== -1 ? appState.akademik[idx] : buildAuditLocal(payload.siswa_id);
        const saved = { ...base, ...payload, id: newId };
        if (idx !== -1) appState.akademik[idx] = saved;
        else appState.akademik.push(saved);

        saveAppStateToLocal();
        renderAkademikNilai();
        closeModal();
        showToast("Nilai mapel tersimpan!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan nilai mapel.',
            confirmButtonColor: '#2563eb'
        });
    }
}

async function deleteAkademik(id) {
    const confirm = await Swal.fire({ title: 'Hapus Nilai Mapel?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (!confirm.isConfirmed) return;
    appState.akademik = (appState.akademik || []).filter(x => String(x.id) !== String(id));
    saveAppStateToLocal();
    renderAkademikNilai();
    showToast("Nilai mapel dihapus");
    const res = await apiCall("deleteAkademik", { id }, false);
    if (res && res.status === "error") {
        showToast(res.message || "Gagal menghapus nilai mapel.", "warning");
        loadAkademikData(true);
    }
}

function renderAkademikPrestasi() {
    const container = document.getElementById("prestasi-list-container");
    if (!container) return;

    const selectEl = document.getElementById("akademik-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    const isAdminOrGuru = isStafLihat();

    if (isAdminOrGuru && filterSiswaId === "") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer text-2xl mb-2 text-amber-500"></i><p class="text-xs text-slate-500">Silakan pilih siswa terlebih dahulu.</p></div>`;
        return;
    }

    if (isKepsekUser() && !document.getElementById("prestasi-gs-filter")) {
        container.insertAdjacentHTML('beforebegin', `<div id="prestasi-gs-filter">${gsRenderFilterKepsek('prs-f', 'renderAkademikPrestasi')}</div>`);
    }

    const basePrestasi = scopeBySiswaId(appState.prestasi, item => item.siswa_id);
    const filteredPrestasi = (filterSiswaId && filterSiswaId !== "ALL")
        ? basePrestasi.filter(item => String(item.siswa_id) === String(filterSiswaId))
        : basePrestasi;

    const fk = isKepsekUser() ? gsBacaFilterKepsek('prs-f') : null;
    let groups = gsTerapkanFilter(gsGroupBySiswa(filteredPrestasi, r => r.siswa_id), fk);
    groups = gsUrutkan(groups, fk ? fk.urut : 'terbaru', g => prsSkorTertinggi(g.records));

    if (groups.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-trophy text-2xl mb-2 text-amber-500"></i><p class="text-xs text-slate-500">Belum ada data catatan prestasi untuk siswa ini.</p></div>`;
        prsRefreshDetail();
        return;
    }

    container.innerHTML = groups.map(g => {
        const terbaru = g.records[0];
        const ringkasan = `
            <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-xs">
                    <span class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><i class="fas fa-award"></i></span>
                    <span class="font-bold text-slate-700">${g.records.length} prestasi</span>
                </div>
                ${prsRenderRincianTingkat(g.records)}
                <p class="text-xs text-slate-500">Terbaru: <span class="font-bold text-slate-700">${escapeHtml(terbaru.nama_prestasi)}</span></p>
            </div>`;
        return gsRenderCard(g, ringkasan, 'openDetailPrestasi');
    }).join("");

    prsRefreshDetail();
}

const PRS_TINGKAT = ['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional'];

function prsSkorTertinggi(records) {
    return records.reduce((m, r) => Math.max(m, PRS_TINGKAT.indexOf(r.tingkat)), -1);
}

function prsRenderRincianTingkat(records) {
    const hitung = {};
    records.forEach(r => { const t = r.tingkat || 'Lainnya'; hitung[t] = (hitung[t] || 0) + 1; });
    const urut = Object.keys(hitung).sort((a, b) => PRS_TINGKAT.indexOf(b) - PRS_TINGKAT.indexOf(a));
    return `<div class="flex flex-wrap gap-1">${urut.map(t =>
        `<span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">${escapeHtml(t)} ${hitung[t]}</span>`).join('')}</div>`;
}

function openDetailPrestasi(siswaId) {
    const base = scopeBySiswaId(appState.prestasi, item => item.siswa_id)
        .filter(r => String(r.siswa_id) === String(siswaId));
    const g = gsGroupBySiswa(base, r => r.siswa_id)[0];
    if (!g) { closeModal(); return; }
    const body = g.records.map(item => {
        const isi = `
            <div class="flex justify-between items-start gap-2">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm"><i class="fas fa-award"></i></div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama_prestasi)}</h4>
                </div>
                <span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">${escapeHtml(item.tingkat)}</span>
            </div>`;
        return gsRenderBarisCatatan(item, 'prestasi', isi, 'openModalPrestasi', 'deletePrestasi');
    }).join('');
    gsOpenSheet(g, { judul: 'Prestasi', kategori: 'prestasi', ringkasanHtml: prsRenderRincianTingkat(g.records), bodyHtml: body, tambahFn: 'tambahPrestasiSiswa', bulkIds: bulkIdsEditable('prestasi', g.records) });
    const box = document.getElementById("modal-content-box");
    if (box) { box.dataset.gs = 'prestasi'; box.dataset.gsSiswa = String(siswaId); }
}

function prsRefreshDetail() {
    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal || modal.classList.contains("hidden") || box.dataset.gs !== 'prestasi') return;
    openDetailPrestasi(box.dataset.gsSiswa);
}

function tambahPrestasiSiswa(siswaId) {
    openModalPrestasi(null, siswaId);
}

function openModalPrestasi(id = null, preSiswaId = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    box.dataset.gs = "";

    const writable = getSiswaWritable('prestasi');
    if (!id && writable.length === 0) {
        Swal.fire({ icon: 'info', title: 'Tidak Ada Siswa', text: 'Tidak ada siswa yang dapat Anda isi prestasinya.', confirmButtonColor: '#2563eb' });
        return;
    }

    const rec = id ? appState.prestasi.find(x => String(x.id) === String(id)) : null;
    const siswaOpts = sortSiswa(writable).map(s => `<option value="${s.id}" ${String(rec ? rec.siswa_id : (preSiswaId || '')) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

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
                        ${PRS_TINGKAT.map(t => `<option value="${t}" ${rec && rec.tingkat === t ? 'selected' : ''}>${t}</option>`).join('')}
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
        const newId = res.id || id || ("PRS-" + Date.now());
        const idx = appState.prestasi.findIndex(x => String(x.id) === String(newId));
        const base = idx !== -1 ? appState.prestasi[idx] : buildAuditLocal(payload.siswa_id);
        const savedRecord = { ...base, ...payload, id: newId };
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
        const res = await apiCall("deletePrestasi", { id }, false);
        if (res && res.status === "error") {
            showToast(res.message || "Gagal menghapus prestasi.", "warning");
            loadAkademikData(true);
        }
    }
}
function cetakPDFAkademik() {
    const selectEl = document.getElementById("akademik-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    if (!filterSiswaId || filterSiswaId === "ALL" || filterSiswaId === "") {
        Swal.fire({ icon: 'warning', title: 'Pilih Siswa', text: 'Silakan pilih satu siswa terlebih dahulu sebelum mencetak.', confirmButtonColor: '#2563eb' });
        return;
    }

    const siswa = appState.siswa.find(s => String(s.id) === String(filterSiswaId)) || appState.user;
    const kls = siswa ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;
    const filteredAkademik = (appState.akademik || []).filter(item => String(item.siswa_id) === String(filterSiswaId));
    const filteredPrestasi = (appState.prestasi || []).filter(item => String(item.siswa_id) === String(filterSiswaId));

    if (filteredAkademik.length === 0 && filteredPrestasi.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Belum ada data nilai maupun prestasi untuk siswa ini.', confirmButtonColor: '#2563eb' });
        return;
    }

    const nilaiRowsHtml = filteredAkademik.length > 0 ? filteredAkademik.map((item, idx) => {
        const isBelowKKTP = Number(item.nilai_akhir) < Number(item.kktp);
        const statusText = isBelowKKTP ? 'Belum Tuntas' : 'Tuntas';
        return `
            <tr>
                <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
                <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(item.mapel)}</td>
                <td style="padding: 6px 6px; text-align: center;">${escapeHtml(String(item.kktp))}</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold;">${escapeHtml(String(item.nilai_akhir))}</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold; color: ${isBelowKKTP ? '#dc2626' : '#16a34a'};">${statusText}</td>
            </tr>
        `;
    }).join('') : `<tr><td colspan="5" style="padding: 10px; text-align: center; color: #64748b;">Belum ada data nilai mapel.</td></tr>`;

    const prestasiRowsHtml = filteredPrestasi.length > 0 ? filteredPrestasi.map((item, idx) => `
        <tr>
            <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.tanggal)}</td>
            <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(item.nama_prestasi)}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.tingkat)}</td>
        </tr>
    `).join('') : `<tr><td colspan="4" style="padding: 10px; text-align: center; color: #64748b;">Belum ada catatan prestasi.</td></tr>`;

    const contentHtml = `
        ${pdfInfoBlock([{label: "Nama Siswa", value: siswa ? siswa.nama : "-"}, {label: "Kelas", value: kls ? kls.nama_kelas : "-"}])}

        <h4 style="font-size: 12px; margin: 0 0 6px 0; text-decoration: underline;">A. Transkrip Nilai Mapel (Evaluasi KKTP)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 6px; text-align: left;">Mata Pelajaran</th>
                    <th style="padding: 8px 6px; width: 60px;">KKTP</th>
                    <th style="padding: 8px 6px; width: 70px;">Nilai Akhir</th>
                    <th style="padding: 8px 6px; width: 90px;">Evaluasi</th>
                </tr>
            </thead>
            <tbody>${nilaiRowsHtml}</tbody>
        </table>

        <h4 style="font-size: 12px; margin: 0 0 6px 0; text-decoration: underline;">B. Catatan Prestasi Siswa</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 6px; width: 90px;">Tanggal</th>
                    <th style="padding: 8px 6px; text-align: left;">Nama Prestasi</th>
                    <th style="padding: 8px 6px; width: 90px;">Tingkat</th>
                </tr>
            </thead>
            <tbody>${prestasiRowsHtml}</tbody>
        </table>
    `;

    exportFeaturePDF(
        "TRANSKRIP NILAI & CATATAN PRESTASI SISWA",
        contentHtml,
        `Transkrip_Akademik_${siswa ? siswa.nama.replace(/\s+/g, '_') : filterSiswaId}_${getDateWITA()}.pdf`
    );
}