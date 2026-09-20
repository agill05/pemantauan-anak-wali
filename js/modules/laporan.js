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

    const currentVal = select.value;
    const opts = appState.kelas.map(k => `<option value="${k.id}" ${String(currentVal) === String(k.id) ? 'selected' : ''}>Kelas ${escapeHtml(k.nama_kelas)}</option>`).join("");
    select.innerHTML = `<option value="">Semua Kelas</option>` + opts;
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

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama)}</h4>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${isPerhatian ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}">
                            ${isPerhatian ? '⚠️ Perhatian' : '✅ Tuntas'}
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">NISN: ${escapeHtml(item.nisn || '-')} • Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 mt-1.5 pt-1.5 border-t border-slate-50">
                        <span class="text-emerald-600 font-semibold"><i class="fas fa-check-circle text-[10px] mr-1"></i>H: ${item.presensi.hadir}</span>
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

function buildLaporanRekapHtml(data) {
    const formattedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const rowsHtml = data.map((item, index) => {
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

    return `
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
                    <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(appState.pengaturan?.nama_kepsek || '( ............................................ )')}</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #000000;">NIP. ${escapeHtml(appState.pengaturan?.nip_kepsek || '........................................')}</p>
                </div>
                <div style="text-align: center; width: 220px;">
                    <p style="margin-bottom: 60px;">Talaga Jaya, ${formattedDate}<br>Guru Pemantau / Wali Kelas</p>
                    <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(appState.user ? appState.user.nama : 'Guru Pemantau')}</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #000000;">NIP. ${escapeHtml(getGuruNip())}</p>
                </div>
            </div>
        </div>
    `;
}

// "Cetak PDF" — render ke area cetak lalu buka dialog Print (user pilih printer fisik
// atau "Save as PDF" manual di dialog browser).
function printLaporanRekap() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk dicetak.', confirmButtonColor: '#2563eb' });
        return;
    }

    const printArea = document.getElementById("printable-area");
    if (!printArea) return;

    printArea.innerHTML = buildLaporanRekapHtml(data);
    printArea.classList.remove("hidden");
    setTimeout(() => {
        window.print();
        printArea.classList.add("hidden");
    }, 150);
}

// "Eksport PDF" — render ke elemen tersembunyi lalu convert jadi file .pdf beneran
// pakai html2pdf.js, langsung terunduh tanpa dialog Print.
function exportLaporanPDF() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }

    if (typeof html2pdf === 'undefined') {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Komponen eksport PDF gagal dimuat. Coba muat ulang halaman.', confirmButtonColor: '#2563eb' });
        return;
    }

    const source = document.createElement("div");
    source.innerHTML = buildLaporanRekapHtml(data);
    source.style.width = "1000px";

    showLoading("Membuat file PDF...");

    html2pdf()
        .set({
            margin: 10,
            filename: `Laporan_Rekap_Anak_Wali_${getDateWITA()}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }
        })
        .from(source)
        .save()
        .then(() => {
            hideLoading();
            showToast("File PDF berhasil diunduh!");
        })
        .catch(() => {
            hideLoading();
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal membuat file PDF.', confirmButtonColor: '#2563eb' });
        });
}

function exportRekapCSV() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data laporan untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += "No,NISN,Nama Siswa,Kelas,Hadir,Sakit,Izin,Alpa,Mapel_Dibawah_KKTP,Status_Evaluasi\n";

    data.forEach((row, idx) => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(row.kelas_id)) : null;
        const namaKelas = kls ? kls.nama_kelas : '-';
        const isPerhatian = (row.presensi.alpa >= 3 || row.dibawah_kktp >= 2);
        const statusText = isPerhatian ? 'Perlu Perhatian' : 'Tuntas / Baik';

        csvContent += `${idx + 1},"${row.nisn || '-'}","${row.nama.replace(/"/g, '""')}","${namaKelas}",${row.presensi.hadir},${row.presensi.sakit},${row.presensi.izin},${row.presensi.alpa},${row.dibawah_kktp},"${statusText}"\n`;
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