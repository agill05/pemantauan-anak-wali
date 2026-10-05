async function loadLaporanRekap(forceRefresh = false) {
    const isStale = (Date.now() - (lastFetchTimes.laporan || 0)) > CACHE_TTL;

    populateLaporanKelasFilter();

    if (appState.laporanRekap && appState.laporanRekap.length > 0) {
        renderLaporanRekapView();
    } else {
        renderSkeleton("laporan-rekap-container", 4);
    }

    if (forceRefresh || isStale || !appState.laporanRekap || appState.laporanRekap.length === 0) {
        const res = await apiCall("getLaporanRekap", {}, false);
        if (res && res.data) {
            appState.laporanRekap = res.data;
            lastFetchTimes.laporan = Date.now();
            saveAppStateToLocal();
            renderLaporanRekapView();
        }
    }
}

function populateLaporanKelasFilter() {
    const select = document.getElementById("laporan-kelas-filter");
    if (!select || !appState.kelas || appState.kelas.length === 0) return;

    const isGuru = appState.user && appState.user.role === 'guru';
    if (isGuru && appState.user.kelas_id) {
        select.value = String(appState.user.kelas_id);
        select.disabled = true;
        select.classList.add("opacity-70", "cursor-not-allowed");
    } else {
        select.disabled = false;
        select.classList.remove("opacity-70", "cursor-not-allowed");
    }

    const currentVal = select.value;
    const opts = appState.kelas.map(k => `<option value="${k.id}" ${String(currentVal) === String(k.id) ? 'selected' : ''}>Kelas ${escapeHtml(k.nama_kelas)}</option>`).join("");
    select.innerHTML = (isGuru ? '' : `<option value="">Semua Kelas</option>`) + opts;
}

function getFilteredLaporanData() {
    if (!appState.laporanRekap) return [];

    const kelasFilter = document.getElementById("laporan-kelas-filter")?.value || "";
    const statusFilter = document.getElementById("laporan-status-filter")?.value || "";

    return appState.laporanRekap.filter(item => {
        if (kelasFilter && String(item.kelas_id) !== String(kelasFilter)) {
            return false;
        }

        const isPerhatian = (item.presensi.alpa >= 3 || item.dibawah_kktp >= 2);
        if (statusFilter === "perhatian" && !isPerhatian) return false;
        if (statusFilter === "tuntas" && isPerhatian) return false;

        return true;
    });
}

function filterLaporanView() {
    renderLaporanRekapView();
}

function renderLaporanRekapView() {
    const container = document.getElementById("laporan-rekap-container");
    if (!container) return;

    populateLaporanKelasFilter();

    const data = getFilteredLaporanData();

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter text-2xl mb-2 text-purple-400"></i>
                <p class="text-xs text-slate-500 font-medium">Tidak ada data rekapitulasi yang cocok dengan filter yang dipilih.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(item => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(item.kelas_id)) : null;
        const isPerhatian = (item.presensi.alpa >= 3 || item.dibawah_kktp >= 2);
        const totalHadir = (item.presensi.hadir || 0) + (item.presensi.telat || 0);

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama)}</h4>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${isPerhatian ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}">
                            ${isPerhatian ? '⚠️️ Perhatian' : '✅ Tuntas'}
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">NISN: ${escapeHtml(item.nisn || '-')} • Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 mt-1.5 pt-1.5 border-t border-slate-50">
                        <span class="text-emerald-600 font-semibold"><i class="fas fa-check-circle text-[10px] mr-1"></i>H: ${totalHadir}</span>
                        <span class="text-orange-600 font-semibold"><i class="fas fa-clock text-[10px] mr-1"></i>T: ${item.presensi.telat || 0}</span>
                        <span class="text-blue-600"><i class="fas fa-notes-medical text-[10px] mr-1"></i>S: ${item.presensi.sakit}</span>
                        <span class="text-amber-600"><i class="fas fa-envelope-open text-[10px] mr-1"></i>I: ${item.presensi.izin}</span>
                        <span class="text-rose-600 font-bold"><i class="fas fa-exclamation-triangle text-[10px] mr-1"></i>A: ${item.presensi.alpa}</span>
                        <span class="text-purple-700 font-semibold"><i class="fas fa-book text-[10px] mr-1"></i>< KKTP: ${item.dibawah_kktp}</span>
                    </div>
                </div>
                <button onclick="openProfilSiswa('${escapeHtml(item.id)}')" class="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl text-xs font-bold shrink-0 transition" title="Lihat Profil Lengkap">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    }).join("");
}

function buildLaporanRekapContent(data) {
    const rowsHtml = data.map((item, index) => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(item.kelas_id)) : null;
        const isPerhatian = (item.presensi.alpa >= 3 || item.dibawah_kktp >= 2);
        const statusText = isPerhatian ? 'Perlu Perhatian' : 'Tuntas / Baik';
        const statusColor = isPerhatian ? '#dc2626' : '#16a34a';
        const totalHadir = (item.presensi.hadir || 0) + (item.presensi.telat || 0);

        return `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td style="text-align: center;">${escapeHtml(item.nisn || '-')}</td>
                <td style="text-align: left; font-weight: bold;">${escapeHtml(item.nama)}</td>
                <td style="text-align: center;">${kls ? escapeHtml(kls.nama_kelas) : '-'}</td>
                <td style="text-align: center; color: #16a34a; font-weight: bold;">${totalHadir}</td>
                <td style="text-align: center; color: #ea580c;">${item.presensi.telat || 0}</td>
                <td style="text-align: center;">${item.presensi.sakit}</td>
                <td style="text-align: center;">${item.presensi.izin}</td>
                <td style="text-align: center; font-weight: bold; ${item.presensi.alpa > 0 ? 'color: #dc2626;' : ''}">${item.presensi.alpa}</td>
                <td style="text-align: center; font-weight: bold; ${item.dibawah_kktp > 0 ? 'color: #dc2626;' : ''}">${item.dibawah_kktp} Mapel</td>
                <td style="text-align: center; font-weight: bold; color: ${statusColor};">${statusText}</td>
            </tr>
        `;
    }).join('');

    return `
        <table>
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th style="width: 80px;">NISN</th>
                    <th style="text-align: left;">Nama Siswa</th>
                    <th style="width: 50px;">Kelas</th>
                    <th style="width: 40px;">Hadir</th>
                    <th style="width: 40px;">Telat</th>
                    <th style="width: 40px;">Sakit</th>
                    <th style="width: 40px;">Izin</th>
                    <th style="width: 40px;">Alpa</th>
                    <th style="width: 75px;">&lt; KKTP</th>
                    <th style="width: 100px;">Evaluasi</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
}

const LAPORAN_REKAP_TITLE = "LAPORAN REKAPITULASI PEMANTAUAN ANAK WALI";

function printLaporanRekap() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk dicetak.', confirmButtonColor: '#2563eb' });
        return;
    }
    printFeaturePDF(LAPORAN_REKAP_TITLE, buildLaporanRekapContent(data), { orientation: "landscape" });
}

function exportLaporanPDF() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }
    exportFeaturePDF(
        LAPORAN_REKAP_TITLE,
        buildLaporanRekapContent(data),
        `Laporan_Rekap_Anak_Wali_${getDateWITA()}.pdf`,
        { orientation: "landscape" }
    );
}

function exportRekapCSV() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data laporan untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += "No,NISN,Nama Siswa,Kelas,Total_Hadir,Telat,Sakit,Izin,Alpa,Mapel_Dibawah_KKTP,Status_Evaluasi\n";

    data.forEach((row, idx) => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(row.kelas_id)) : null;
        const namaKelas = kls ? kls.nama_kelas : '-';
        const isPerhatian = (row.presensi.alpa >= 3 || row.dibawah_kktp >= 2);
        const statusText = isPerhatian ? 'Perlu Perhatian' : 'Tuntas / Baik';
        const totalHadir = (row.presensi.hadir || 0) + (row.presensi.telat || 0);

        csvContent += `${idx + 1},"${row.nisn || '-'}","${row.nama.replace(/"/g, '""')}","${namaKelas}",${totalHadir},${row.presensi.telat || 0},${row.presensi.sakit},${row.presensi.izin},${row.presensi.alpa},${row.dibawah_kktp},"${statusText}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Pemantauan_Anak_Wali_SMPN1TalagaJaya_${getDateWITA()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("File Excel/CSV berhasil diunduh!");
}
