function switchTabSiswa(tabName, btnEl) {
    document.querySelectorAll('.prof-tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-b-2', 'border-blue-600', 'text-blue-600', 'font-bold');
        btn.classList.add('text-slate-500');
    });
    document.querySelectorAll('.prof-tab-content').forEach(content => content.classList.add('hidden'));

    btnEl.classList.add('active', 'border-b-2', 'border-blue-600', 'text-blue-600', 'font-bold');
    btnEl.classList.remove('text-slate-500');

    const target = document.getElementById(`tab-siswa-${tabName}`);
    if (target) target.classList.remove('hidden');

    if (tabName === 'ringkasan' && appState.activeSiswaDetail) {
        setTimeout(() => renderRadarChartSiswa(appState.activeSiswaDetail), 100);
    }
}

async function openProfilSiswa(siswaTarget) {
    let detailData = null;

    if (typeof siswaTarget === 'object' && siswaTarget !== null) {
        detailData = siswaTarget;
    } else {
        const sLocal = appState.siswa.find(s => String(s.id) === String(siswaTarget));

        if (appState.activeSiswaDetail && String(appState.activeSiswaDetail.siswa.id) === String(siswaTarget)) {
            detailData = appState.activeSiswaDetail;
        } else if (sLocal) {
            detailData = {
                siswa: sLocal,
                absensi: appState.absensi.filter(a => String(a.siswa_id) === String(siswaTarget)),
                kebiasaan: appState.kebiasaan.filter(k => String(k.siswa_id) === String(siswaTarget)),
                hafalan: appState.keagamaan.filter(h => String(h.siswa_id) === String(siswaTarget)),
                akademik: appState.akademik.filter(ak => String(ak.siswa_id) === String(siswaTarget)),
                prestasi: appState.prestasi.filter(p => String(p.siswa_id) === String(siswaTarget)),
                pembinaan: appState.pembinaan.filter(pb => String(pb.siswa_id) === String(siswaTarget))
            };
        }

        apiCall("getDetailSiswa", { siswa_id: siswaTarget }, false).then(res => {
            if (res && res.status === "success") {
                appState.activeSiswaDetail = res.data;
                const activeView = document.querySelector(".view-section.active");
                if (activeView && activeView.id === "view-profil-siswa") {
                    openProfilSiswa(res.data);
                }
            }
        });
    }

    if (!detailData) return;

    appState.activeSiswaDetail = detailData;
    const { siswa, absensi, kebiasaan, hafalan, akademik, prestasi, pembinaan } = detailData;
    const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;

    const container = document.getElementById("profil-siswa-details");
    if (!container) return;

    const totalHadir = absensi.filter(a => a.status === 'H').length;
    const totalSakit = absensi.filter(a => a.status === 'S').length;
    const totalIzin = absensi.filter(a => a.status === 'I').length;
    const totalAlpa = absensi.filter(a => a.status === 'A').length;

    container.innerHTML = `
        <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <img src="${escapeHtml(siswa.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(siswa.nama))}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200">
            <div>
                <h3 class="font-bold text-base text-slate-800">${escapeHtml(siswa.nama)}</h3>
                <p class="text-xs text-slate-400">NISN: ${escapeHtml(siswa.nisn || '-')} • Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                <p class="text-xs text-slate-400">Ortu/Wali: ${escapeHtml(siswa.no_hp_ortu || '-')}</p>
            </div>
        </div>

        <div class="flex flex-nowrap border-b border-slate-200 bg-white px-2 rounded-t-2xl shadow-sm pt-2 overflow-x-auto no-scrollbar">
            <button class="prof-tab-btn active border-b-2 border-blue-600 text-blue-600 font-bold flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('ringkasan', this)">Ringkasan</button>
            <button class="prof-tab-btn text-slate-500 flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('keagamaan', this)">Keagamaan</button>
            <button class="prof-tab-btn text-slate-500 flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('akademik', this)">Akademik</button>
            <button class="prof-tab-btn text-slate-500 flex-none whitespace-nowrap px-4 py-2.5 text-xs text-center" onclick="switchTabSiswa('catatan', this)">Catatan</button>
        </div>

        <div class="space-y-4 pt-2">
            <div id="tab-siswa-ringkasan" class="prof-tab-content space-y-4">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fas fa-chart-pie text-primary"></i> Analisis Grafis Radar Karakter Siswa
                    </h4>
                    <div class="w-full max-w-sm mx-auto p-2">
                        <canvas id="radarChartSiswa"></canvas>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-calendar-alt text-blue-500 mr-1.5"></i>Rekapitulasi Kehadiran</h4>
                    <div class="grid grid-cols-4 gap-2 text-center">
                        <div class="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                            <span class="text-xs font-bold text-emerald-600 block">HADIR</span>
                            <span class="text-base font-black text-emerald-700">${totalHadir}</span>
                        </div>
                        <div class="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                            <span class="text-xs font-bold text-blue-600 block">SAKIT</span>
                            <span class="text-base font-black text-blue-700">${totalSakit}</span>
                        </div>
                        <div class="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                            <span class="text-xs font-bold text-amber-600 block">IZIN</span>
                            <span class="text-base font-black text-amber-700">${totalIzin}</span>
                        </div>
                        <div class="bg-rose-50 p-2.5 rounded-2xl border border-rose-100">
                            <span class="text-xs font-bold text-rose-600 block">ALPA</span>
                            <span class="text-base font-black text-rose-700">${totalAlpa}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-star text-amber-500 mr-1.5"></i>7 Kebiasaan Hebat</h4>
                    <div class="divide-y divide-slate-100">
                        ${MASTER_KEBIASAAN.map(k => {
        const rec = kebiasaan.find(item => String(item.kebiasaan_id) === String(k.id)) || { status: 'Belum' };
        return `
                                <div class="py-2 flex justify-between items-center text-xs">
                                    <span class="font-medium text-slate-700 flex items-center gap-2"><i class="fas ${k.icon} text-slate-400"></i> ${escapeHtml(k.nama)}</span>
                                    <span class="font-bold ${rec.status === 'Sudah' ? 'text-emerald-600' : (rec.status === 'Kadang' ? 'text-amber-600' : 'text-slate-400')}">${rec.status}</span>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            </div>

            <div id="tab-siswa-keagamaan" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-quran text-emerald-500 mr-1.5"></i>Capaian Hafalan Al-Qur'an</h4>
                    ${hafalan.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada data hafalan.</p>' : `
                        <div class="space-y-2">
                            ${hafalan.map(h => {
        const statusBadge = h.status === 'Lancar'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : (h.status === 'Mengulang'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-600 border-slate-200');
        return `
                                    <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                                        <div class="flex justify-between items-center font-bold text-slate-800">
                                            <span>Surah ${escapeHtml(h.nama_surat)}</span>
                                            <span class="text-xs font-bold px-2 py-0.5 rounded-md border ${statusBadge}">${escapeHtml(h.status)}</span>
                                        </div>
                                        ${h.catatan ? `<p class="text-xs text-slate-500 italic font-medium">"${escapeHtml(h.catatan)}"</p>` : ''}
                                    </div>
                                `;
    }).join('')}
                        </div>
                    `}
                </div>
            </div>

            <div id="tab-siswa-akademik" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-graduation-cap text-indigo-500 mr-1.5"></i>Nilai Mata Pelajaran & KKTP</h4>
                    ${akademik.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada data nilai akademik.</p>' : `
                        <div class="divide-y divide-slate-100">
                            ${akademik.map(a => `
                                <div class="py-2 flex justify-between items-center text-xs">
                                    <span class="font-medium text-slate-700">${escapeHtml(a.mapel)}</span>
                                    <span class="font-bold ${Number(a.nilai_akhir) < Number(a.kktp) ? 'text-rose-600' : 'text-emerald-600'}">${a.nilai_akhir} (KKTP: ${a.kktp})</span>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-trophy text-amber-500 mr-1.5"></i>Catatan Prestasi</h4>
                    ${prestasi.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada catatan prestasi.</p>' : `
                        <div class="space-y-2">
                            ${prestasi.map(p => `
                                <div class="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between items-center">
                                    <div>
                                        <h5 class="font-bold text-slate-800">${escapeHtml(p.nama_prestasi)}</h5>
                                        <p class="text-xs text-slate-400">${escapeHtml(p.tingkat)} • ${escapeHtml(p.tanggal)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>

            <div id="tab-siswa-catatan" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-user-edit text-rose-500 mr-1.5"></i>Catatan Pembinaan</h4>
                    ${pembinaan.length === 0 ? '<p class="text-xs text-slate-400 italic">Tidak ada catatan pembinaan.</p>' : `
                        <div class="space-y-2">
                            ${pembinaan.map(p => `
                                <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                                    <div class="flex justify-between font-bold text-slate-800">
                                        <span>${escapeHtml(p.permasalahan)}</span>
                                        <span class="text-xs font-bold px-2 py-0.5 rounded border ${getPembinaanStatusBadge(p.status)}">${escapeHtml(p.status)}</span>
                                    </div>
                                    <p class="text-xs text-slate-400">Tanggal: ${escapeHtml(p.tanggal)}</p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    switchView("profil-siswa");
    setTimeout(() => renderRadarChartSiswa(detailData), 150);
}

function renderRadarChartSiswa(detailData) {
    const ctx = document.getElementById('radarChartSiswa');
    if (!ctx) return;

    if (window.activeRadarChartInstance) {
        window.activeRadarChartInstance.destroy();
    }

    const { absensi = [], kebiasaan = [], hafalan = [], akademik = [], pembinaan = [] } = detailData;

    const totalAbsen = absensi.length || 1;
    const skorHadir = Math.round((absensi.filter(a => a.status === 'H').length / totalAbsen) * 100);
    const skorKebiasaan = Math.round((kebiasaan.filter(k => k.status === 'Sudah').length / 7) * 100);
    const skorKeagamaan = Math.min(100, (hafalan.filter(h => h.status === 'Lancar').length / 10) * 100);
    const totalNilai = akademik.reduce((acc, curr) => acc + Number(curr.nilai_akhir), 0);
    const skorAkademik = akademik.length > 0 ? Math.round(totalNilai / akademik.length) : 0;
    const skorKedisiplinan = Math.max(0, 100 - (pembinaan.length * 20));

    window.activeRadarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Kehadiran', '7 Kebiasaan', 'Keagamaan', 'Akademik', 'Kedisiplinan'],
            datasets: [{
                label: 'Profil Karakter Siswa',
                data: [skorHadir, skorKebiasaan, skorKeagamaan, skorAkademik, skorKedisiplinan],
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: '#2563eb',
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function printProfilSiswa() {
    if (!appState.activeSiswaDetail) return;
    const { siswa, absensi, akademik, hafalan } = appState.activeSiswaDetail;
    const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;

    const printArea = document.getElementById("printable-area");
    if (!printArea) return;

    printArea.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">LAPORAN PEMANTAUAN ANAK WALI</h2>
                <h3 style="margin: 5px 0 0 0; font-size: 16px;">SMP NEGERI 1 TALAGA JAYA</h3>
                <p style="margin: 2px 0 0 0; font-size: 12px; color: #555;">Tahun Ajaran 2025/2026</p>
            </div>

            <table style="width: 100%; font-size: 12px; margin-bottom: 20px;">
                <tr><td style="width: 120px; font-weight: bold;">Nama Siswa</td><td>: ${escapeHtml(siswa.nama)}</td></tr>
                <tr><td style="font-weight: bold;">NISN</td><td>: ${escapeHtml(siswa.nisn || '-')}</td></tr>
                <tr><td style="font-weight: bold;">Kelas</td><td>: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</td></tr>
                <tr><td style="font-weight: bold;">Orang Tua / Wali</td><td>: ${escapeHtml(siswa.no_hp_ortu || '-')}</td></tr>
            </table>

            <h4 style="font-size: 14px; margin-bottom: 5px;">1. Rekapitulasi Presensi</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;" border="1">
                <thead><tr style="background: #f0f0f0;"><th style="padding: 6px;">Hadir</th><th style="padding: 6px;">Sakit</th><th style="padding: 6px;">Izin</th><th style="padding: 6px;">Alpa</th></tr></thead>
                <tbody>
                    <tr style="text-align: center;">
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'H').length} hari</td>
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'S').length} hari</td>
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'I').length} hari</td>
                        <td style="padding: 6px;">${absensi.filter(a => a.status === 'A').length} hari</td>
                    </tr>
                </tbody>
            </table>

            <h4 style="font-size: 14px; margin-bottom: 5px;">2. Hasil Belajar Akademik</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;" border="1">
                <thead><tr style="background: #f0f0f0;"><th style="padding: 6px;">Mata Pelajaran</th><th style="padding: 6px;">Nilai Akhir</th><th style="padding: 6px;">KKTP</th><th style="padding: 6px;">Keterangan</th></tr></thead>
                <tbody>
                    ${akademik.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 6px;">Belum ada data nilai</td></tr>' : akademik.map(a => `
                        <tr>
                            <td style="padding: 6px;">${escapeHtml(a.mapel)}</td>
                            <td style="padding: 6px; text-align: center;">${escapeHtml(a.nilai_akhir)}</td>
                            <td style="padding: 6px; text-align: center;">${escapeHtml(a.kktp)}</td>
                            <td style="padding: 6px; text-align: center;">${Number(a.nilai_akhir) >= Number(a.kktp) ? 'Tuntas' : 'Perlu Bimbingan'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h4 style="font-size: 14px; margin-bottom: 5px;">3. Hafalan Al-Qur'an</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;" border="1">
                <thead><tr style="background: #f0f0f0;"><th style="padding: 6px;">Nama Surah</th><th style="padding: 6px;">Status</th><th style="padding: 6px;">Catatan Guru</th></tr></thead>
                <tbody>
                    ${hafalan.length === 0 ? '<tr><td colspan="3" style="text-align: center; padding: 6px;">Belum ada data hafalan</td></tr>' : hafalan.map(h => `
                        <tr>
                            <td style="padding: 6px;">${escapeHtml(h.nama_surat)}</td>
                            <td style="padding: 6px; text-align: center;">${escapeHtml(h.status)}</td>
                            <td style="padding: 6px;">${escapeHtml(h.catatan || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
                <div style="text-align: center; width: 200px;">
                    <p>Orang Tua / Wali Siswa</p>
                    <br><br><br>
                    <p>( .................................... )</p>
                </div>
                <div style="text-align: center; width: 200px;">
                    <p>Wali Kelas</p>
                    <br><br><br>
                    <p><b>${escapeHtml(appState.user ? appState.user.nama : 'Wali Kelas')}</b></p>
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

function renderSiswaView() {
    const container = document.getElementById("siswa-card-container");
    if (!container) return;

    const searchInput = document.getElementById("search-siswa-input");
    const query = (searchInput ? searchInput.value : "").toLowerCase();

    const rawFiltered = appState.siswa.filter(s => safeStr(s.nama).toLowerCase().includes(query) || safeStr(s.nisn).toLowerCase().includes(query));
    const filtered = sortSiswa(rawFiltered);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-search text-xl mb-1"></i><p class="text-xs">Siswa tidak ditemukan.</p></div>`;
        return;
    }

    const isAdminOrGuru = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    container.innerHTML = filtered.map(s => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(s.kelas_id)) : null;
        const noAbsenLabel = s.no_absen ? `No. Absen: ${s.no_absen} | ` : '';

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <img src="${escapeHtml(s.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.nama))}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                    <div>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
                        <p class="text-xs text-slate-400">${noAbsenLabel}NISN: ${escapeHtml(s.nisn || '-')} | Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="openProfilSiswa('${escapeHtml(s.id)}')" class="touch-btn bg-blue-50 text-blue-600 rounded-lg text-xs">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="hubungiOrtu('${escapeHtml(s.id)}')" class="touch-btn bg-emerald-50 text-emerald-600 rounded-lg text-xs">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    ${isAdminOrGuru ? `
                    <button onclick="openModalSiswa('${escapeHtml(s.id)}')" class="touch-btn bg-slate-100 text-slate-600 rounded-lg text-xs">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteSiswa('${escapeHtml(s.id)}')" class="touch-btn bg-rose-50 text-rose-600 rounded-lg text-xs">
                        <i class="fas fa-trash"></i>
                    </button>` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function openModalSiswa(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const s = id ? appState.siswa.find(x => String(x.id) === String(id)) : null;
    const kelasOpts = appState.kelas.map(k => `<option value="${k.id}" ${s?.kelas_id === k.id ? 'selected' : ''}>${escapeHtml(k.nama_kelas)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${s ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveSiswaForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                <input type="text" id="m-ssw-nama" value="${escapeHtml(s?.nama || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1">NOMOR ABSEN (OPSIONAL)</label>
                    <input type="number" id="m-ssw-absen" value="${s?.no_absen !== undefined && s?.no_absen !== null ? s.no_absen : ''}" placeholder="Contoh: 1" min="1" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1">NISN</label>
                    <input type="text" id="m-ssw-nisn" value="${escapeHtml(s?.nisn || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">USERNAME</label>
                <input type="text" id="m-ssw-user" value="${escapeHtml(s?.username || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">PASSWORD ${s ? '(Kosongkan jika tidak diganti)' : '(Opsional)'}</label>
                <input type="password" id="m-ssw-pwd" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" placeholder="${s ? '' : 'Kosongkan untuk pakai password default'}">
                <p class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-1.5 flex items-start gap-1.5">
                    <i class="fas fa-triangle-exclamation mt-0.5"></i>
                    <span>Jika dikosongkan, password akan diset otomatis ke <b>siswa123</b>. Sarankan pengguna segera menggantinya — sistem akan memaksa ganti password saat login pertama.</span>
                </p>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">KELAS</label>
                <select id="m-ssw-kelas" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                    <option value="">Pilih Kelas</option>
                    ${kelasOpts}
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">NO. WA ORANG TUA / WALI</label>
                <input type="text" id="m-ssw-ortu" value="${escapeHtml(s?.no_hp_ortu || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" placeholder="08xxxxxxxxxx">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Siswa</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveSiswaForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        nama: document.getElementById("m-ssw-nama").value,
        no_absen: document.getElementById("m-ssw-absen").value,
        username: document.getElementById("m-ssw-user").value,
        password: document.getElementById("m-ssw-pwd").value,
        nisn: document.getElementById("m-ssw-nisn").value,
        kelas_id: document.getElementById("m-ssw-kelas").value,
        no_hp_ortu: document.getElementById("m-ssw-ortu").value,
    };

    const res = await apiCall("saveSiswa", payload, true);
    if (res && res.status === "success") {
        closeModal();
        showToast("Data Siswa diperbarui!");
        await fetchAllAppData(true);
        renderSiswaView();
        renderAdminSiswa();
    }
}

async function deleteSiswa(id) {
    const confirm = await Swal.fire({ title: 'Hapus Siswa?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteSiswa", { id }, true);
        if (res && res.status === "success") {
            await fetchAllAppData(true);
            renderSiswaView();
            renderAdminSiswa();
        }
    }
}