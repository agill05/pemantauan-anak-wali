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
        } else if (getSiswaPeran().length > 0 && filterSelect.options.length <= 1) {
            filterSelect.innerHTML = `<option value="">Semua Siswa</option>` + getSiswaPeran().map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
        }
    }

    if (filterSelect && !isSiswa) enhanceSiswaSelect(filterSelect);

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

const PBN_SKOR_STATUS = { 'perlu tindak lanjut': 3, 'dalam pembinaan': 2, 'pemantauan': 1, 'selesai': 0 };
const PBN_WARNA_PENULIS = { wali: 'border-l-blue-400', mentor: 'border-l-violet-400', admin: 'border-l-slate-400' };

function pbnSkor(rec) {
    return PBN_SKOR_STATUS[String(rec.status || '').trim().toLowerCase()] ?? 0;
}

function pbnStatusTeratas(records) {
    return records.reduce((best, r) => (!best || pbnSkor(r) > pbnSkor(best)) ? r : best, null);
}

function pbnJadwalTerdekat(records) {
    const today = getDateWITA();
    const list = records
        .filter(r => pbnSkor(r) > 0 && r.jadwal_pantau && String(r.jadwal_pantau) >= today)
        .map(r => String(r.jadwal_pantau)).sort();
    return list[0] || '';
}

function renderPembinaanView() {
    const container = document.getElementById("pembinaan-list-container");
    if (!container) return;

    if (isKepsekUser() && !document.getElementById("pembinaan-gs-filter")) {
        container.insertAdjacentHTML('beforebegin', `<div id="pembinaan-gs-filter">${gsRenderFilterKepsek('pbn-f', 'renderPembinaanView')}</div>`);
    }

    const filterSiswaId = document.getElementById("pembinaan-siswa-filter")?.value || "";
    const basePembinaan = scopeBySiswaId(appState.pembinaan, item => item.siswa_id);
    const filteredPembinaan = filterSiswaId
        ? basePembinaan.filter(item => String(item.siswa_id) === String(filterSiswaId))
        : basePembinaan;

    const fk = isKepsekUser() ? gsBacaFilterKepsek('pbn-f') : null;
    let groups = gsTerapkanFilter(gsGroupBySiswa(filteredPembinaan, r => r.siswa_id), fk);
    groups = gsUrutkan(groups, fk ? fk.urut : 'terbaru', g => pbnSkor(pbnStatusTeratas(g.records)));

    if (groups.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-check text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Tidak ada catatan pembinaan aktif untuk siswa ini.</p></div>`;
        pbnRefreshDetail();
        return;
    }

    container.innerHTML = groups.map(g => {
        const aktif = g.records.filter(r => pbnSkor(r) > 0).length;
        const top = pbnStatusTeratas(g.records);
        const pantau = pbnJadwalTerdekat(g.records);
        const ringkasan = `
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
                <span class="font-bold text-slate-600">${aktif} aktif</span>
                <span class="font-bold px-2 py-0.5 rounded-md border ${getPembinaanStatusBadge(top.status)}">${escapeHtml(top.status)}</span>
                ${pantau ? `<span class="text-amber-700 font-bold"><i class="fas fa-clock text-amber-500"></i> Pantau ${escapeHtml(pantau)}</span>` : ''}
            </div>`;
        return gsRenderCard(g, ringkasan, 'openDetailPembinaan');
    }).join("");

    pbnRefreshDetail();
}

function pbnDataGrup(siswaId) {
    const base = scopeBySiswaId(appState.pembinaan, item => item.siswa_id)
        .filter(r => String(r.siswa_id) === String(siswaId));
    const g = gsGroupBySiswa(base, r => r.siswa_id)[0];
    return g || null;
}

function openDetailPembinaan(siswaId) {
    const g = pbnDataGrup(siswaId);
    if (!g) { closeModal(); return; }
    const top = pbnStatusTeratas(g.records);
    const pantau = pbnJadwalTerdekat(g.records);
    const ringkasan = `
        <div class="flex flex-wrap items-center gap-1.5 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span class="font-bold text-slate-600">${g.records.filter(r => pbnSkor(r) > 0).length} aktif dari ${g.records.length}</span>
            <span class="font-bold px-2 py-0.5 rounded-md border ${getPembinaanStatusBadge(top.status)}">${escapeHtml(top.status)}</span>
            ${pantau ? `<span class="text-amber-700 font-bold"><i class="fas fa-clock text-amber-500"></i> Pantau ${escapeHtml(pantau)}</span>` : ''}
        </div>`;
    const body = g.records.map(item => {
        const sebagai = String(item.dibuat_sebagai || '').toLowerCase().trim();
        const warna = PBN_WARNA_PENULIS[sebagai] || PBN_WARNA_PENULIS.wali;
        const isi = `
            <div class="flex justify-between items-start gap-2">
                <div>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${escapeHtml(item.jenis || 'Pembinaan')}</span>
                    <p class="font-bold text-xs text-slate-800">${escapeHtml(item.permasalahan)}</p>
                </div>
                <span class="text-xs font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${getPembinaanStatusBadge(item.status)}">${escapeHtml(item.status)}</span>
            </div>
            ${item.jadwal_pantau ? `<div class="text-xs text-slate-600"><i class="fas fa-clock text-amber-500"></i> Jadwal Pantau: <span class="font-bold text-amber-700">${escapeHtml(item.jadwal_pantau)}</span></div>` : ''}`;
        return gsRenderBarisCatatan(item, 'pembinaan', isi, 'openModalPembinaan', 'deletePembinaan')
            .replace('class="bg-slate-50 p-3', `class="border-l-4 ${warna} bg-slate-50 p-3`);
    }).join('');
    gsOpenSheet(g, { judul: 'Pembinaan', kategori: 'pembinaan', ringkasanHtml: ringkasan, bodyHtml: body, tambahFn: 'tambahPembinaanSiswa', bulkIds: bulkIdsEditable('pembinaan', g.records) });
    const box = document.getElementById("modal-content-box");
    if (box) { box.dataset.gs = 'pembinaan'; box.dataset.gsSiswa = String(siswaId); }
}

function pbnRefreshDetail() {
    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal || modal.classList.contains("hidden") || box.dataset.gs !== 'pembinaan') return;
    openDetailPembinaan(box.dataset.gsSiswa);
}

function tambahPembinaanSiswa(siswaId) {
    openModalPembinaan(null, siswaId);
}

const PBN_JENIS = ['Sikap', 'Akademik', 'Kehadiran', 'Sosial'];
const PBN_STATUS = ['Pemantauan', 'Dalam Pembinaan', 'Perlu Tindak Lanjut', 'Selesai'];
const PBN_JENIS_DARI_KATEGORI = { 'Kedisiplinan': 'Kehadiran', 'Akademik': 'Akademik', 'Kebiasaan': 'Sikap', 'Keagamaan': 'Sikap', 'Tata Tertib': 'Sikap' };
const PBN_STATUS_DARI_LEVEL = { kritis: 'Perlu Tindak Lanjut', sedang: 'Dalam Pembinaan', rendah: 'Pemantauan' };
const PBN_HARI_PANTAU = { kritis: 3, sedang: 7, rendah: 14 };
let pbnFormDariNotif = false;

// Jadwal pantau = hari ini + 3/7/14 hari menurut level. Sabtu atau Minggu digeser ke Senin.
function pbnJadwalDariLevel(level) {
    const [y, m, d] = String(getDateWITA()).slice(0, 10).split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + (PBN_HARI_PANTAU[level] || 7)));
    const hari = t.getUTCDay();
    if (hari === 6) t.setUTCDate(t.getUTCDate() + 2);
    else if (hari === 0) t.setUTCDate(t.getUTCDate() + 1);
    return t.toISOString().slice(0, 10);
}

function pbnIsianDariNotif(n) {
    const jenisAsal = PBN_JENIS.includes(n.pbnJenis) ? n.pbnJenis : '';
    return {
        jenis: jenisAsal || PBN_JENIS_DARI_KATEGORI[n.category] || 'Sikap',
        status: PBN_STATUS_DARI_LEVEL[n.level] || 'Pemantauan',
        masalah: n.defaultPembinaan || '',
        pantau: pbnJadwalDariLevel(n.level)
    };
}

// Dari notifikasi: hanya ID yang dikirim lewat atribut onclick, data dicari dari state.
function openPembinaanDariNotif(notifId) {
    const n = (appState.currentNotifications || []).find(x => String(x.id) === String(notifId));
    if (!n) {
        showToast("Notifikasi tidak ditemukan. Buka ulang daftar notifikasi.", "warning");
        return;
    }
    closeModal();
    const dibuka = openModalPembinaan(null, n.siswa.id, Object.assign({ siswaId: n.siswa.id, siswaNama: n.siswa.nama }, pbnIsianDariNotif(n)));
    if (dibuka !== false) setPendingPembinaanNotif(n.id, n.siswa.id);
}

function openModalPembinaan(id = null, preSiswaId = null, prefill = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return false;
    box.dataset.gs = "";
    pbnFormDariNotif = !!prefill && !id;
    setPendingPembinaanNotif("", "");

    const writable = getSiswaWritable('pembinaan');
    if (!id && writable.length === 0) {
        Swal.fire({ icon: 'info', title: 'Tidak Ada Siswa', text: 'Tidak ada siswa yang dapat Anda beri catatan pembinaan.', confirmButtonColor: '#2563eb' });
        return false;
    }

    if (prefill && !writable.some(s => String(s.id) === String(prefill.siswaId))) {
        Swal.fire({ icon: 'info', title: 'Akses Ditolak', text: 'Anda tidak dapat memberi catatan pembinaan untuk siswa ini.', confirmButtonColor: '#2563eb' });
        return false;
    }

    const rec = id ? appState.pembinaan.find(x => String(x.id) === String(id)) : null;
    // Alur dari notifikasi tidak memakai draf lama supaya isian otomatis tidak tertimpa.
    const draft = (!id && !prefill) ? getFormDraft("pembinaan") : null;
    const pre = prefill || {};

    const siswaOpts = sortSiswa(writable).map(s =>
        `<option value="${s.id}" ${(draft?.['m-pbn-siswa'] || rec?.siswa_id || preSiswaId) == s.id ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`
    ).join("");

    const tanggalPengisian = rec ? rec.tanggal : getDateWITA();

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Catatan Pembinaan' : 'Tambah Catatan Pembinaan'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePembinaanForm(event, '${id || ''}')" class="space-y-3">
            <div>
                ${prefill ? `
                <p class="block text-xs font-bold text-slate-500 mb-1">SISWA</p>
                <div class="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between gap-2">
                    <span class="min-w-0 truncate">${escapeHtml(pre.siswaNama || '')}</span>
                    <i class="fas fa-lock text-slate-400 shrink-0" title="Siswa terkunci dari notifikasi"></i>
                </div>
                <input type="hidden" id="m-pbn-siswa" value="${escapeHtml(String(pre.siswaId))}">` : `
                <label for="m-pbn-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-pbn-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>`}
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-pbn-jenis" class="block text-xs font-bold text-slate-500 mb-1">JENIS</label>
                    <select id="m-pbn-jenis" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${PBN_JENIS.map(j => `<option value="${j}" ${(pre.jenis || draft?.['m-pbn-jenis'] || rec?.jenis) === j ? 'selected' : ''}>${j}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="m-pbn-status" class="block text-xs font-bold text-slate-500 mb-1">STATUS</label>
                    <select id="m-pbn-status" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${PBN_STATUS.map(st => `<option value="${st}" ${String(pre.status || draft?.['m-pbn-status'] || rec?.status).toLowerCase() === st.toLowerCase() ? 'selected' : ''}>${st}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <label for="m-pbn-masalah" class="block text-xs font-bold text-slate-500 mb-1">DESKRIPSI PERMASALAHAN / CATATAN</label>
                <textarea id="m-pbn-masalah" rows="3" placeholder="Jelaskan kasus..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${escapeHtml(pre.masalah || draft?.['m-pbn-masalah'] || rec?.permasalahan || '')}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-pbn-tanggal" class="block text-xs font-bold text-slate-500 mb-1">TANGGAL PENGISIAN</label>
                    <input type="date" id="m-pbn-tanggal" value="${tanggalPengisian}" class="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs outline-none cursor-not-allowed text-slate-500 font-bold" readonly disabled>
                </div>
                <div>
                    <label for="m-pbn-pantau" class="block text-xs font-bold text-slate-500 mb-1">JADWAL PANTAU</label>
                    <input type="date" id="m-pbn-pantau" value="${pre.pantau || draft?.['m-pbn-pantau'] || rec?.jadwal_pantau || ''}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <button type="submit" id="btn-save-pembinaan" class="w-full bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Catatan Pembinaan</button>
        </form>
    `;

    document.getElementById("modal-container")?.classList.remove("hidden");

    if (!id && !prefill) {
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
        const audit = idx !== -1
            ? { dibuat_oleh_id: appState.pembinaan[idx].dibuat_oleh_id, dibuat_sebagai: appState.pembinaan[idx].dibuat_sebagai }
            : buildAuditLocal(siswaId);
        Object.assign(savedRecord, audit);
        if (idx !== -1) {
            appState.pembinaan[idx] = savedRecord;
        } else {
            appState.pembinaan.push(savedRecord);
        }

        if (!pbnFormDariNotif) clearFormDraft("pembinaan");
        pbnFormDariNotif = false;
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
        const res = await apiCall("deletePembinaan", { id }, false);
        if (res && res.status === "error") {
            showToast(res.message || "Gagal menghapus catatan pembinaan.", "warning");
            loadPembinaanData(true);
        }
        checkStudentNotifications();
    }
}

function openQuickPembinaan(siswaId, defaultMasalah, notifId = "") {
    closeModal();
    openModalPembinaan();
    setPendingPembinaanNotif(notifId, siswaId);
    setTimeout(() => {
        const siswaSelect = document.getElementById("m-pbn-siswa");
        const masalahInput = document.getElementById("m-pbn-masalah");
        if (siswaSelect) { siswaSelect.value = siswaId; syncSiswaSelect(siswaSelect); }
        if (masalahInput) masalahInput.value = defaultMasalah || "";
    }, 150);
}

function cetakPDFPembinaan() {
    const filterSiswaId = document.getElementById("pembinaan-siswa-filter")?.value || "";
    if (!filterSiswaId) {
        Swal.fire({ icon: 'warning', title: 'Pilih Siswa', text: 'Silakan pilih satu siswa terlebih dahulu sebelum mencetak.', confirmButtonColor: '#2563eb' });
        return;
    }

    const siswa = appState.siswa.find(s => String(s.id) === String(filterSiswaId)) || appState.user;
    const kls = siswa ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;
    const filteredPembinaan = (appState.pembinaan || []).filter(item => String(item.siswa_id) === String(filterSiswaId));

    if (filteredPembinaan.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Belum ada catatan pembinaan untuk siswa ini.', confirmButtonColor: '#2563eb' });
        return;
    }

    const sortedPembinaan = [...filteredPembinaan].sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
    const rowsHtml = sortedPembinaan.map((item, idx) => `
        <tr>
            <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.tanggal)}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.jenis || 'Pembinaan')}</td>
            <td style="padding: 6px 8px; text-align: left;">${escapeHtml(item.permasalahan)}</td>
            <td style="padding: 6px 6px; text-align: center; font-weight: bold;">${escapeHtml(item.status)}</td>
            <td style="padding: 6px 6px; text-align: center;">${item.jadwal_pantau ? escapeHtml(item.jadwal_pantau) : '-'}</td>
        </tr>
    `).join('');

    const contentHtml = `
        ${pdfInfoBlock([{label: "Nama Siswa", value: siswa ? siswa.nama : "-"}, {label: "Kelas", value: kls ? kls.nama_kelas : "-"}])}
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 6px; width: 90px;">Tanggal</th>
                    <th style="padding: 8px 6px; width: 90px;">Jenis</th>
                    <th style="padding: 8px 6px; text-align: left;">Permasalahan</th>
                    <th style="padding: 8px 6px; width: 100px;">Status</th>
                    <th style="padding: 8px 6px; width: 90px;">Jadwal Pantau</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;

    exportFeaturePDF(
        "LEMBAR REKAM PEMBINAAN & KONSELING SISWA",
        contentHtml,
        `Rekam_Pembinaan_${siswa ? siswa.nama.replace(/\s+/g, '_') : filterSiswaId}_${getDateWITA()}.pdf`,
        { labelKanan: "Guru BK / " + getPeranTtdText(siswa) }
    );
}
