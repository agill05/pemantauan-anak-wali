async function loadLaporanRekap(forceRefresh = false) {
    const isStale = (Date.now() - (lastFetchTimes.laporan || 0)) > CACHE_TTL;

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

function renderLaporanRekapView() {
    const container = document.getElementById("laporan-rekap-container");
    if (!container) return;

    if (!appState.laporanRekap || appState.laporanRekap.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-file-invoice text-2xl mb-2 text-purple-500"></i><p class="text-xs text-slate-500">Belum ada data rekapitulasi.</p></div>`;
        return;
    }

    container.innerHTML = appState.laporanRekap.map(item => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(item.kelas_id)) : null;

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama)}</h4>
                    <p class="text-xs text-slate-400">NISN: ${escapeHtml(item.nisn || '-')} | Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    <div class="flex gap-2 text-xs text-slate-600 mt-1">
                        <span>Hadir: <b>${item.presensi.hadir}</b></span>
                        <span>Sakit: <b>${item.presensi.sakit}</b></span>
                        <span>Izin: <b>${item.presensi.izin}</b></span>
                        <span class="text-rose-600 font-bold">Alpa: ${item.presensi.alpa}</span>
                    </div>
                </div>
                <button onclick="openProfilSiswa('${escapeHtml(item.id)}')" class="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 text-xs">
                    <i class="fas fa-file-alt"></i> Detail
                </button>
            </div>
        `;
    }).join("");
}

function printLaporanRekap() {
    if (!appState.laporanRekap || appState.laporanRekap.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk dicetak.', confirmButtonColor: '#2563eb' });
        return;
    }

    const printArea = document.getElementById("printable-area");
    if (!printArea) return;

    const formattedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const rowsHtml = appState.laporanRekap.map((item, index) => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(item.kelas_id)) : null;
        const isPerhatian = (item.presensi.alpa >= 3 || item.dibawah_kktp >= 2);
        const statusText = isPerhatian ? 'Perlu Perhatian' : 'Tuntas / Baik';
        const statusColor = isPerhatian ? '#dc2626' : '#16a34a';

        return `
            <tr>
                <td style="padding: 6px 4px; text-align: center;">${index + 1}</td>
                <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.nisn || '-')}</td>
                <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(item.nama)}</td>
                <td style="padding: 6px 4px; text-align: center;">${kls ? escapeHtml(kls.nama_kelas) : '-'}</td>
                <td style="padding: 6px 4px; text-align: center; color: #16a34a; font-weight: bold;">${item.presensi.hadir}</td>
                <td style="padding: 6px 4px; text-align: center;">${item.presensi.sakit}</td>
                <td style="padding: 6px 4px; text-align: center;">${item.presensi.izin}</td>
                <td style="padding: 6px 4px; text-align: center; font-weight: bold; color: ${item.presensi.alpa > 0 ? '#dc2626' : 'inherit'};">${item.presensi.alpa}</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold; color: ${item.dibawah_kktp > 0 ? '#dc2626' : 'inherit'};">${item.dibawah_kktp} Mapel</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold; color: ${statusColor};">${statusText}</td>
            </tr>
        `;
    }).join('');

    printArea.innerHTML = `
        <div style="font-family: 'Times New Roman', Times, serif; color: #0f172a; padding: 10px;">
            <div style="text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
                <h4 style="margin: 0; font-size: 13px; font-weight: normal; text-transform: uppercase;">Pemerintah Kabupaten Gorontalo</h4>
                <h3 style="margin: 2px 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">Dinas Pendidikan dan Kebudayaan</h3>
                <h2 style="margin: 2px 0; font-size: 18px; font-weight: bold; text-transform: uppercase;">SMP NEGERI 1 TALAGA JAYA</h2>
                <p style="margin: 0; font-size: 11px; font-style: italic; color: #334155;">Jl. Pelabuhan II, Kec. Talaga Jaya, Kab. Gorontalo, Gorontalo 96181</p>
            </div>

            <div style="text-align: center; margin-bottom: 16px;">
                <h3 style="margin: 0 0 4px 0; font-size: 14px; text-transform: uppercase; text-decoration: underline; font-weight: bold;">LAPORAN REKAPITULASI PEMANTAUAN ANAK WALI</h3>
                <p style="margin: 0; font-size: 11px; color: #475569;">Tanggal Cetak: ${formattedDate} | Dicetak Oleh: <b>${escapeHtml(appState.user ? appState.user.nama : 'User')}</b> (${escapeHtml(appState.user ? appState.user.role.toUpperCase() : '')})</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px;" border="1" borderColor="#94a3b8">
                <thead>
                    <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                        <th style="padding: 8px 4px; width: 30px;">No</th>
                        <th style="padding: 8px 6px; width: 90px;">NISN</th>
                        <th style="padding: 8px 6px; text-align: left;">Nama Siswa</th>
                        <th style="padding: 8px 4px; width: 55px;">Kelas</th>
                        <th style="padding: 8px 4px; width: 45px;">Hadir</th>
                        <th style="padding: 8px 4px; width: 45px;">Sakit</th>
                        <th style="padding: 8px 4px; width: 45px;">Izin</th>
                        <th style="padding: 8px 4px; width: 45px;">Alpa</th>
                        <th style="padding: 8px 6px; width: 80px;">< KKTP</th>
                        <th style="padding: 8px 6px; width: 105px;">Evaluasi</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; page-break-inside: avoid;">
                <div style="text-align: center; width: 220px;">
                    <p style="margin-bottom: 60px;">Mengetahui,<br>Kepala SMPN 1 Talaga Jaya</p>
                    <p style="margin: 0; font-weight: bold; text-decoration: underline;">( ............................................ )</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">NIP. ........................................</p>
                </div>
                <div style="text-align: center; width: 220px;">
                    <p style="margin-bottom: 60px;">Talaga Jaya, ${formattedDate}<br>Guru Pemantau / Wali Kelas</p>
                    <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(appState.user ? appState.user.nama : 'Guru Pemantau')}</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #64748b;">NIP/ID: ${escapeHtml(appState.user ? appState.user.id : '-')}</p>
                </div>
            </div>
        </div>
    `;

    printArea.classList.remove("hidden");
    setTimeout(() => {
        window.print();
        printArea.classList.add("hidden");
    }, 150);
}

function exportRekapCSV() {
    if (!appState.laporanRekap || appState.laporanRekap.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data laporan untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nama Siswa,NISN,Hadir,Sakit,Izin,Alpa,Nilai_Dibawah_KKTP\n";

    appState.laporanRekap.forEach(row => {
        csvContent += `"${row.id}","${row.nama}","${row.nisn}",${row.presensi.hadir},${row.presensi.sakit},${row.presensi.izin},${row.presensi.alpa},${row.dibawah_kktp}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Pemantauan_Anak_Wali_${getDateWITA()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}