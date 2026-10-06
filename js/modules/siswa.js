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

    document.getElementById("btn-magiclink-profil")?.classList.toggle("hidden", !(isAdminUser() || isGuruUser()) || !canWrite("magiclink", siswa));

    const mentor = siswa.mentor_id ? (appState.guru || []).find(g => String(g.id) === String(siswa.mentor_id)) : null;
    const staf = isAdminUser() || isGuruUser();
    const infoMentor = staf ? `<p class="text-xs text-slate-400">Mentor: ${mentor ? escapeHtml(mentor.nama) : (siswa.mentor_id ? '-' : 'Belum ada')} <span class="ml-1">${renderPeranChip(siswa)}</span></p>` : '';

    const totalHadir = absensi.filter(a => a.status === 'H').length;
    const totalSakit = absensi.filter(a => a.status === 'S').length;
    const totalIzin = absensi.filter(a => a.status === 'I').length;
    const totalAlpa = absensi.filter(a => a.status === 'A').length;

    container.innerHTML = `
        <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <img src="${escapeHtml(siswa.foto || getInitialsAvatar(siswa.nama))}" class="w-16 h-16 rounded-2xl object-cover border border-slate-200">
            <div>
                <h3 class="font-bold text-base text-slate-800">${escapeHtml(siswa.nama)}</h3>
                <p class="text-xs text-slate-400">NISN: ${escapeHtml(siswa.nisn || '-')} • Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                <p class="text-xs text-slate-400">Ortu/Wali: ${escapeHtml(siswa.nama_ortu || normalizePhone(siswa.no_hp_ortu) || '-')}</p>
                ${infoMentor}
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
                                    <span class="font-bold ${rec.status === 'Sudah' ? 'text-emerald-600' : 'text-slate-400'}">${rec.status === 'Sudah' ? 'Sudah' : 'Belum'}</span>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            </div>

            <div id="tab-siswa-keagamaan" class="prof-tab-content space-y-4 hidden">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider"><i class="fas fa-quran text-emerald-500 mr-1.5"></i>Capaian Keagamaan <span class="normal-case font-medium text-slate-400">(Surah, Iqro & Doa)</span></h4>
                    ${hafalan.length === 0 ? '<p class="text-xs text-slate-400 italic">Belum ada data keagamaan.</p>' : `
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
                                            <span class="min-w-0 truncate"><span class="text-[10px] font-bold uppercase text-slate-400 mr-1">${KEAGAMAAN_KATEGORI[getKategoriHafalan(h)].label}</span>${escapeHtml(formatCapaianKeagamaan(h))}</span>
                                            <span class="text-xs font-bold px-2 py-0.5 rounded-md border ${statusBadge}">${escapeHtml(h.status)}</span>
                                        </div>
                                        ${h.catatan ? `<p class="text-xs text-slate-500 italic font-medium">"${escapeHtml(h.catatan)}"</p>` : ''}
                                        ${renderPenulisBadge(h)}
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
                                        ${renderPenulisBadge(p)}
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
                                    ${renderPenulisBadge(p)}
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
    const skorKebiasaan = Math.round((kebiasaan.filter(k => k.status === 'Sudah').length / Math.max(MASTER_KEBIASAAN.length, 1)) * 100);
    const skorKeagamaan = hitungSkorKeagamaan(hafalan);
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

async function printProfilSiswa() {
    if (!appState.activeSiswaDetail) return;
    const { siswa, absensi, akademik, hafalan, prestasi = [], pembinaan = [] } = appState.activeSiswaDetail;

    let kj = null;
    const sampaiKj = getDateWITA();
    showLoading("Menyiapkan rapor...");
    const resKj = await apiCall("getLaporanKebiasaan",
        { siswa_id: String(siswa.id), dari: geserTanggalJurnal(sampaiKj, -29), sampai: sampaiKj, sertakan_jurnal: true }, false, 2, true);
    hideLoading();
    if (resKj && resKj.status === "success" && resKj.data && resKj.data.siswa && resKj.data.siswa[0]) kj = resKj.data;

    const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;
    const e = escapeHtml;
    const hitung = st => absensi.filter(a => a.status === st).length;

    const tabel = (heads, rows, emptyText) => `
        <table>
            <thead><tr>${heads.map(h => `<th${h.w ? ` style="width: ${h.w}px;"` : ""}>${e(h.t)}</th>`).join("")}</tr></thead>
            <tbody>${rows.length === 0
                ? `<tr><td colspan="${heads.length}" style="text-align: center;">${e(emptyText)}</td></tr>`
                : rows.join("")}</tbody>
        </table>`;
    const c = v => `<td style="text-align: center;">${e(v)}</td>`;
    const l = v => `<td style="text-align: left;">${e(v)}</td>`;

    const biodata = [
        ["Nama Siswa", siswa.nama],
        ["NISN", siswa.nisn || "-"],
        ["Kelas", kls ? kls.nama_kelas : "-"],
        ["Nama Orang Tua / Wali", siswa.nama_ortu || "-"],
        ["No. WA Orang Tua / Wali", normalizePhone(siswa.no_hp_ortu) || "-"]
    ].map(([k, v]) => `<tr><td style="width: 170px; font-weight: bold;">${e(k)}</td><td>: ${e(v)}</td></tr>`).join("");

    const b = v => e(bersihkanTeksPdf(v));
    const cb = v => `<td style="text-align: center;">${b(v)}</td>`;
    const lb = v => `<td style="text-align: left;">${b(v)}</td>`;
    let bagianKebiasaan = "";
    if (kj) {
        const rk = kj.siswa[0];
        const pct = n => Math.round((n / Math.max(kj.periode.hari, 1)) * 100);
        const gabungCatatan = j => [
            j.catatan_wali ? `Wali: ${j.catatan_wali}` : "",
            j.catatan_mentor ? `Mentor: ${j.catatan_mentor}` : ""
        ].filter(Boolean).join("; ") || "-";
        const jurnal10 = (kj.jurnal || []).slice(0, 10);
        bagianKebiasaan = `
        <h4>6. Rekap 7 Kebiasaan Hebat (${kj.periode.hari} Hari Terakhir)</h4>
        ${tabel([{ t: "Kebiasaan" }, { t: "Hari Sudah", w: 90 }, { t: "Persentase", w: 90 }],
            kj.konfig.map(k => { const n = rk.per_kebiasaan[k.id] || 0; return `<tr>${lb(k.nama)}${c(n + " hari")}${c(pct(n) + "%")}</tr>`; }),
            "Belum ada data kebiasaan")}
        <p>Total poin: <b>${rk.poin}</b>. Hari dengan semua kebiasaan terpenuhi: <b>${rk.hari_penuh}</b> dari ${kj.periode.hari} hari. Capaian keseluruhan: <b>${rk.capaian}%</b>.</p>

        <h4>7. Jurnal Harian dan Catatan Guru${(kj.jurnal || []).length > 10 ? " (10 Terbaru)" : ""}</h4>
        ${tabel([{ t: "Tanggal", w: 70 }, { t: "Mood", w: 65 }, { t: "Isi Jurnal" }, { t: "Catatan Guru", w: 170 }],
            jurnal10.map(j => `<tr>${cb(tanggalPendek(j.tanggal))}${cb(j.mood)}${lb(j.isi)}${lb(gabungCatatan(j))}</tr>`),
            "Belum ada jurnal pada periode ini")}`;
    }

    const html = `
        <table data-plain="1"><tbody>${biodata}</tbody></table>

        <h4>1. Rekapitulasi Presensi</h4>
        ${tabel([{ t: "Hadir" }, { t: "Sakit" }, { t: "Izin" }, { t: "Alpa" }], [
            `<tr>${c(hitung("H") + " hari")}${c(hitung("S") + " hari")}${c(hitung("I") + " hari")}${c(hitung("A") + " hari")}</tr>`
        ], "")}

        <h4>2. Hasil Belajar Akademik</h4>
        ${tabel([{ t: "Mata Pelajaran" }, { t: "Nilai Akhir", w: 90 }, { t: "KKTP", w: 70 }, { t: "Keterangan", w: 130 }],
            akademik.map(a => `<tr>${l(a.mapel)}${c(a.nilai_akhir)}${c(a.kktp)}${c(Number(a.nilai_akhir) >= Number(a.kktp) ? "Tuntas" : "Perlu Bimbingan")}</tr>`),
            "Belum ada data nilai")}

        <h4>3. Capaian Keagamaan (Surah, Iqro & Doa)</h4>
        ${tabel([{ t: "Kategori", w: 70 }, { t: "Capaian" }, { t: "Status", w: 100 }, { t: "Catatan Guru" }],
            hafalan.map(h => `<tr>${c(KEAGAMAAN_KATEGORI[getKategoriHafalan(h)].label)}${l(formatCapaianKeagamaan(h))}${c(h.status)}${l(h.catatan || "-")}</tr>`),
            "Belum ada data keagamaan")}

        <h4>4. Catatan Prestasi</h4>
        ${tabel([{ t: "Nama Prestasi / Juara" }, { t: "Tingkat", w: 100 }, { t: "Tanggal", w: 100 }],
            prestasi.map(p => `<tr>${l(p.nama_prestasi)}${c(p.tingkat)}${c(p.tanggal)}</tr>`),
            "Belum ada catatan prestasi")}

        <h4>5. Catatan Pembinaan</h4>
        ${tabel([{ t: "Permasalahan" }, { t: "Status", w: 100 }, { t: "Tanggal", w: 100 }],
            pembinaan.map(p => `<tr>${l(p.permasalahan)}${c(p.status)}${c(p.tanggal)}</tr>`),
            "Tidak ada catatan pembinaan")}
        ${bagianKebiasaan}
    `;

    const kepsek = (appState.pengaturan && appState.pengaturan.nama_kepsek) || "............................................";
    const nipKepsek = (appState.pengaturan && appState.pengaturan.nip_kepsek) || "........................................";

    printFeaturePDF("LAPORAN PEMANTAUAN ANAK WALI", html, {
        orientation: "portrait",
        signatures: [
            { lines: ["Orang Tua / Wali Siswa"], name: siswa.nama_ortu || "............................................" },
            { lines: ["Mengetahui,", "Kepala SMPN 1 Talaga Jaya"], name: kepsek, nip: nipKepsek },
            { lines: ["Talaga Jaya, {tanggal}", getPeranTtdText(siswa)], name: appState.user ? appState.user.nama : getPeranTtdText(siswa), nip: getGuruNip() }
        ]
    });
}

async function hubungiOrtu(siswaId) {
    const sBasic = appState.siswa.find(x => String(x.id) === String(siswaId)) || (appState.activeSiswaDetail?.siswa?.id == siswaId ? appState.activeSiswaDetail.siswa : null) || appState.user;
    if (!sBasic) return;

    if (!normalizePhone(sBasic.no_hp_ortu)) {
        Swal.fire({
            icon: 'warning',
            title: 'Nomor Tidak Ada',
            text: `Nomor WhatsApp Orang Tua/Wali untuk ${sBasic.nama} belum terdaftar. Silakan lengkapi di Master Siswa.`,
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    const phone = toWhatsAppNumber(sBasic.no_hp_ortu);

    const box = document.getElementById("modal-content-box");
    if (!box) {
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(`Assalamu'alaikum Bapak/Ibu Wali dari ${sBasic.nama}.`)}`, '_blank');
        return;
    }

    let detail = (appState.activeSiswaDetail && String(appState.activeSiswaDetail.siswa.id) === String(siswaId))
        ? appState.activeSiswaDetail
        : null;

    if (!detail) {
        showLoading("Menyiapkan data laporan...");
        const res = await apiCall("getDetailSiswa", { siswa_id: siswaId }, false);
        hideLoading();
        if (res && res.status === "success") {
            detail = res.data;
        }
    }

    const s = detail ? detail.siswa : sBasic;
    const absensiFull = detail ? (detail.absensi || []) : [];

    const countH = absensiFull.filter(a => a.status === 'H').length;
    const countS = absensiFull.filter(a => a.status === 'S').length;
    const countI = absensiFull.filter(a => a.status === 'I').length;
    const countA = absensiFull.filter(a => a.status === 'A').length;

    const sId = String(s.id);
    const kebiasaanToday = (appState.kebiasaan || []).filter(k => String(k.siswa_id) === sId && k.tanggal === getDateWITA());
    const kebiasaanDone = kebiasaanToday.filter(k => k.status === 'Sudah').length;

    const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(s.kelas_id)) : null;
    const namaKelas = kls ? kls.nama_kelas : '-';

    const sebagaiMentor = isGuruUser() && getEffectiveAccessType(s) === 'mentor';
    const penutup = sebagaiMentor ? 'Mentor / Guru SMPN 1 Talaga Jaya' : 'Wali Kelas / Guru SMPN 1 Talaga Jaya';

    const templateLengkap = `*LAPORAN PERKEMBANGAN ANAK WALI*
*SMP NEGERI 1 TALAGA JAYA*
----------------------------------------
Assalamu'alaikum Wr. Wb.
Yth. Bapak/Ibu Orang Tua/Wali dari ananda:
👤 *Nama:* ${s.nama}
🏫 *Kelas:* ${namaKelas}
🆔 *NISN:* ${s.nisn || '-'}

📊 *Ringkasan Kehadiran:*
• Hadir: ${countH} hari
• Sakit: ${countS} hari
• Izin: ${countI} hari
• Alpa: ${countA} hari

⭐ *Karakter & 7 Kebiasaan Hebat:*
• Ketercapaian Hari Ini: ${kebiasaanDone}/${MASTER_KEBIASAAN.length} Kebiasaan

Mohon kerja sama Bapak/Ibu untuk terus mendampingi dan memotivasi ananda di rumah. Terima kasih.
_Wassalamu'alaikum Wr. Wb._
*${penutup}*`;

    const templatePresensi = `*PEMBERITAHUAN PRESENSI SISWA*
*SMP NEGERI 1 TALAGA JAYA*
----------------------------------------
Assalamu'alaikum Wr. Wb.
Yth. Orang Tua dari ananda *${s.nama}* (Kelas ${namaKelas}).

Kami ingin menginformasikan rekapitulasi kehadiran ananda saat ini:
✅ Hadir: ${countH} hari | 🤒 Sakit: ${countS} hari | ✉️ Izin: ${countI} hari | ⚠️ Alpa: ${countA} hari

${countA >= 3 ? '⚠️ *Catatan Khusus:* Ananda memiliki catatan alpa yang perlu diperhatikan. Mohon konfirmasi dan bimbingannya di rumah.' : 'Alhamdulillah kehadiran ananda cukup baik. Mohon pertahankan kedisiplinannya.'}

Terima kasih atas perhatian Bapak/Ibu.
_Wassalamu'alaikum Wr. Wb._`;

    const templateSapaan = `Assalamu'alaikum Bapak/Ibu Wali dari ${s.nama}. Kami dari SMP Negeri 1 Talaga Jaya ingin berdiskusi mengenai perkembangan belajar ananda. Mohon konfirmasinya. Terima kasih.`;

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <i class="fab fa-whatsapp text-emerald-600 text-lg"></i> Kirim Laporan WhatsApp
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup"><i class="fas fa-times"></i></button>
        </div>

        <div class="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 mb-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="min-w-0 flex-1">
                <h4 class="font-bold text-xs text-slate-800 truncate">${escapeHtml(s.nama)}</h4>
                <p class="text-xs text-emerald-700 font-semibold"><i class="fab fa-whatsapp"></i> ${escapeHtml(normalizePhone(s.no_hp_ortu))}</p>
            </div>
        </div>

        <div class="space-y-3">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Format Laporan:</p>

            <button type="button" onclick="sendCustomWhatsApp('${phone}', \`${encodeURIComponent(templateLengkap)}\`)" class="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-start gap-3 group">
                <span class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <i class="fas fa-file-invoice text-xs"></i>
                </span>
                <div>
                    <h5 class="font-bold text-xs text-slate-800">Laporan Perkembangan Lengkap</h5>
                    <p class="text-[11px] text-slate-400 mt-0.5">Berisi rekap presensi (H/S/I/A), ketercapaian 7 kebiasaan, dan catatan guru.</p>
                </div>
            </button>

            <button type="button" onclick="sendCustomWhatsApp('${phone}', \`${encodeURIComponent(templatePresensi)}\`)" class="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-start gap-3 group">
                <span class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <i class="fas fa-calendar-check text-xs"></i>
                </span>
                <div>
                    <h5 class="font-bold text-xs text-slate-800">Laporan Khusus Presensi & Kehadiran</h5>
                    <p class="text-[11px] text-slate-400 mt-0.5">Berisi detail kehadiran, alpa, izin, dan pengingat kedisiplinan orang tua.</p>
                </div>
            </button>

            <button type="button" onclick="sendCustomWhatsApp('${phone}', \`${encodeURIComponent(templateSapaan)}\`)" class="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-start gap-3 group">
                <span class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <i class="fas fa-comment-dots text-xs"></i>
                </span>
                <div>
                    <h5 class="font-bold text-xs text-slate-800">Pesan Sapaan Singkat</h5>
                    <p class="text-[11px] text-slate-400 mt-0.5">Sapaan awal sopan dari guru untuk memulai obrolan/konsultasi.</p>
                </div>
            </button>
        </div>
    `;

    document.getElementById("modal-container")?.classList.remove("hidden");
}

function sendCustomWhatsApp(phone, encodedMessage) {
    closeModal();
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
}

function renderSiswaView() {
    const container = document.getElementById("siswa-card-container");
    if (!container) return;

    if (!appState.siswa || appState.siswa.length === 0) {
        renderSkeleton("siswa-card-container", 5);
        fetchAllAppData(false).then(() => {
            _refreshAllSiswaDropdowns();
            renderSiswaView();
        });
        return;
    }

    const searchInput = document.getElementById("search-siswa-input");
    const query = (searchInput ? searchInput.value : "").toLowerCase();

    const rawFiltered = scopeSiswaForUser(appState.siswa).filter(s => safeStr(s.nama).toLowerCase().includes(query) || safeStr(s.nisn).toLowerCase().includes(query));
    const filtered = sortSiswa(rawFiltered);

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-search text-xl mb-1"></i><p class="text-xs">Siswa tidak ditemukan.</p></div>`;
        return;
    }

    container.innerHTML = renderReadOnlyBanner('siswa', 'data siswa') + filtered.map(s => {
        const kls = appState.kelas ? appState.kelas.find(k => String(k.id) === String(s.kelas_id)) : null;
        const bisaUbahSiswa = canWrite('siswa', s);
        const noAbsenLabel = s.no_absen ? `No. Absen: ${s.no_absen} | ` : '';

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <img src="${escapeHtml(s.foto || getInitialsAvatar(s.nama))}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                    <div>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)} <span class="ml-1">${renderPeranChip(s)}</span></h4>
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
                    ${bisaUbahSiswa ? `
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

    if (!id && isGuruUser() && !isWaliUser()) {
        openModalAmbilSiswa();
        return;
    }

    const s = id ? appState.siswa.find(x => String(x.id) === String(id)) : null;
    const guruMode = isGuruUser();
    const kelasOpts = guruMode
        ? (() => {
            const kw = getKelasWaliId();
            const kls = (appState.kelas || []).find(k => String(k.id) === String(kw));
            return kls ? `<option value="${kls.id}" selected>${escapeHtml(kls.nama_kelas)}</option>` : `<option value="" selected>Belum ada kelas wali</option>`;
        })()
        : getVisibleKelas().map(k => `<option value="${k.id}" ${String(s?.kelas_id) === String(k.id) ? 'selected' : ''}>${escapeHtml(k.nama_kelas)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${s ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        ${!s && guruMode ? _tabsTambahSiswa('baru') : ''}
        <form onsubmit="saveSiswaForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-ssw-nama" class="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                <input type="text" id="m-ssw-nama" value="${escapeHtml(s?.nama || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-ssw-absen" class="block text-xs font-bold text-slate-500 mb-1">NOMOR ABSEN (OPSIONAL)</label>
                    <input type="number" id="m-ssw-absen" value="${s?.no_absen !== undefined && s?.no_absen !== null ? s.no_absen : ''}" placeholder="Contoh: 1" min="1" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
                <div>
                    <label for="m-ssw-nisn" class="block text-xs font-bold text-slate-500 mb-1">NISN</label>
                    <input type="text" id="m-ssw-nisn" value="${escapeHtml(s?.nisn || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-ssw-user" class="block text-xs font-bold text-slate-500 mb-1">USERNAME</label>
                    <input type="text" id="m-ssw-user" value="${escapeHtml(s?.username || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label for="m-ssw-kelas" class="block text-xs font-bold text-slate-500 mb-1">KELAS</label>
                    <select id="m-ssw-kelas" ${guruMode ? "disabled" : ""} class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none disabled:opacity-70 disabled:cursor-not-allowed">
                        ${guruMode ? "" : '<option value="">Pilih Kelas</option>'}
                        ${kelasOpts}
                    </select>
                </div>
            </div>
            ${isAdminUser() ? `
            <div>
                <label for="m-ssw-mentor" class="block text-xs font-bold text-slate-500 mb-1">MENTOR (OPSIONAL)</label>
                <select id="m-ssw-mentor" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                    <option value="">Tanpa mentor</option>
                    ${(appState.guru || []).map(g => `<option value="${escapeHtml(g.id)}" ${String(s?.mentor_id || "").trim() === String(g.id) ? 'selected' : ''}>${escapeHtml(g.nama)}</option>`).join("")}
                </select>
            </div>` : ""}
            <div>
                <label for="m-ssw-pwd" class="block text-xs font-bold text-slate-500 mb-1">PASSWORD ${s ? '(Kosongkan jika tidak diganti)' : '(Opsional)'}</label>
                <div class="relative">
                    <input type="password" id="m-ssw-pwd" class="w-full bg-slate-50 border p-2.5 pr-9 rounded-xl text-xs outline-none" placeholder="${s ? '' : 'Kosongkan untuk pakai password default'}">
                    <button type="button" onclick="togglePasswordVisibility('m-ssw-pwd', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Tampilkan kata sandi">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <p class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-1.5 flex items-start gap-1.5">
                    <i class="fas fa-triangle-exclamation mt-0.5"></i>
                    <span>Jika dikosongkan, password akan diset otomatis ke <b>siswa123</b>. Sarankan pengguna segera menggantinya — sistem akan memaksa ganti password saat login pertama.</span>
                </p>
            </div>
            <div>
                <label for="m-ssw-nama-ortu" class="block text-xs font-bold text-slate-500 mb-1">NAMA ORANG TUA / WALI</label>
                <input type="text" id="m-ssw-nama-ortu" value="${escapeHtml(s?.nama_ortu || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" placeholder="Nama lengkap orang tua/wali">
            </div>
            <div>
                <label for="m-ssw-ortu" class="block text-xs font-bold text-slate-500 mb-1">NO. WA ORANG TUA / WALI</label>
                <input type="text" id="m-ssw-ortu" value="${escapeHtml(normalizePhone(s?.no_hp_ortu))}" oninput="validatePhoneField(this, 'm-ssw-ortu-error')" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" placeholder="08xxxxxxxxxx">
                <p id="m-ssw-ortu-error" class="hidden text-[10px] text-rose-500 mt-1 font-semibold"><i class="fas fa-circle-exclamation"></i> Format nomor tidak valid. Gunakan 08xxxxxxxxxx (10-14 digit).</p>
            </div>
            <button type="submit" id="btn-save-siswa" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Siswa</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveSiswaForm(e, id) {
    e.preventDefault();

    const hpInput = document.getElementById("m-ssw-ortu");
    if (hpInput && !validatePhoneField(hpInput, "m-ssw-ortu-error")) {
        hpInput.focus();
        return;
    }

    const btn = document.getElementById("btn-save-siswa");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const payload = {
        id: id || null,
        nama: document.getElementById("m-ssw-nama").value,
        no_absen: document.getElementById("m-ssw-absen").value,
        username: document.getElementById("m-ssw-user").value,
        password: document.getElementById("m-ssw-pwd").value,
        nisn: document.getElementById("m-ssw-nisn").value,
        kelas_id: isGuruUser() ? (getKelasWaliId() || "") : document.getElementById("m-ssw-kelas").value,
        no_hp_ortu: normalizePhone(document.getElementById("m-ssw-ortu").value),
        nama_ortu: document.getElementById("m-ssw-nama-ortu").value,
    };

    const mentorSel = document.getElementById("m-ssw-mentor");
    if (isAdminUser() && mentorSel) {
        const lama = id ? String((appState.siswa.find(x => String(x.id) === String(id)) || {}).mentor_id || "").trim() : "";
        if (mentorSel.value !== lama) payload.mentor_id = mentorSel.value;
    }

    const res = await apiCall("saveSiswa", payload, true);

    if (res && res.status === "success") {
        closeModal();
        showToast("Data Siswa diperbarui!");
        await fetchAllAppData(true);
        renderSiswaView();
        renderAdminSiswa();
        _refreshAllSiswaDropdowns();
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-70", "cursor-not-allowed");
            btn.innerHTML = originalHtml;
        }
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan data siswa.',
            confirmButtonColor: '#2563eb'
        });
    }
}

function downloadTemplateSiswaCSV() {
    const csvContent = "\uFEFF" + "username,nama,no_absen,nisn,nama_kelas,no_hp_ortu,nama_ortu,password,mentor_id\n" +
        "siswa01,Contoh Nama Siswa,1,0012345678,VII A,081234567890,Contoh Nama Orang Tua,,guru01\n";
    _downloadCSVString(csvContent, "Template_Import_Siswa.csv");
    showToast("Template CSV Siswa berhasil diunduh!");
}

function exportSiswaCSV() {
    if (!appState.siswa || appState.siswa.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data siswa untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }
    const rows = sortSiswa(scopeSiswaForUser(appState.siswa)).map(s => {
        const kls = appState.kelas.find(k => String(k.id) === String(s.kelas_id));
        const mg = s.mentor_id ? (appState.guru || []).find(g => String(g.id) === String(s.mentor_id)) : null;
        return {
            username: s.username || "",
            nama: s.nama || "",
            no_absen: s.no_absen || "",
            nisn: s.nisn || "",
            nama_kelas: kls ? kls.nama_kelas : "",
            no_hp_ortu: normalizePhone(s.no_hp_ortu),
            nama_ortu: s.nama_ortu || "",
            password: "",
            mentor_id: mg ? mg.username : (s.mentor_id || "")
        };
    });
    const csvContent = "\uFEFF" + Papa.unparse(rows, { columns: ["username", "nama", "no_absen", "nisn", "nama_kelas", "no_hp_ortu", "nama_ortu", "password", "mentor_id"] });
    _downloadCSVString(csvContent, `Data_Siswa_SMPN1TalagaJaya_${getDateWITA()}.csv`);
    showToast("Data Siswa berhasil diekspor ke CSV!");
}

function triggerImportSiswa() {
    const input = document.getElementById("import-siswa-file");
    if (input) {
        input.value = "";
        input.click();
    }
}

function handleImportSiswaFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: h => h.trim().toLowerCase(),
        complete: async (results) => {
            const rows = (results.data || []).filter(r => r.username && r.nama);
            if (rows.length === 0) {
                Swal.fire({ icon: 'warning', title: 'File Kosong', text: 'Tidak ditemukan baris data valid (username & nama wajib diisi) pada file CSV.', confirmButtonColor: '#2563eb' });
                return;
            }

            const confirm = await Swal.fire({
                title: `Import ${rows.length} Data Siswa?`,
                text: 'Data dengan username yang sudah ada akan diperbarui (UPSERT). Data baru akan ditambahkan dengan password default "siswa123" jika kolom password kosong.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Ya, Import Sekarang',
                cancelButtonText: 'Batal'
            });
            if (!confirm.isConfirmed) return;

            showLoading("Mengimpor data siswa...");
            const res = await apiCall("importSiswaBatch", { rows }, true);
            hideLoading();

            if (res && res.status === "success") {
                await fetchAllAppData(true);
                renderSiswaView();
                renderAdminSiswa();
                _refreshAllSiswaDropdowns();
                Swal.fire({ icon: 'success', title: 'Import Selesai', text: res.message, confirmButtonColor: '#2563eb' });
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal Import', text: res?.message || 'Terjadi kesalahan saat import data siswa.', confirmButtonColor: '#2563eb' });
            }
        },
        error: () => {
            Swal.fire({ icon: 'error', title: 'Gagal Membaca File', text: 'Pastikan file berformat CSV yang valid.', confirmButtonColor: '#2563eb' });
        }
    });
}

async function deleteSiswa(id) {
    if (await konfirmasiHapusBersih("siswa", id)) {
        const res = await apiCall("deleteSiswa", { id }, true);
        if (res && res.status === "success") {
            if (typeof bersihkanJejakSiswaLokal === "function") bersihkanJejakSiswaLokal([id]);
            await fetchAllAppData(true);
            renderSiswaView();
            renderAdminSiswa();
            _refreshAllSiswaDropdowns();
        } else {
            Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: res?.message || 'Terjadi kesalahan saat menghapus data siswa.', confirmButtonColor: '#2563eb' });
        }
    }
}

function _tabsTambahSiswa(aktif) {
    const cls = (m) => m === aktif ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500';
    return `
        <div class="flex bg-slate-200/70 p-1 rounded-xl gap-1 mb-3">
            <button type="button" onclick="openModalSiswa()" class="flex-1 py-1.5 rounded-lg text-xs font-bold ${cls('baru')}">Siswa Baru</button>
            <button type="button" onclick="openModalAmbilSiswa()" class="flex-1 py-1.5 rounded-lg text-xs font-bold ${cls('ambil')}">Ambil dari Data Sekolah</button>
        </div>`;
}

let _ambilSiswaHasil = [];
let _ambilSiswaSeq = 0;

function _ambilSiswaPeranOpsi() {
    const opsi = [];
    if (isWaliUser()) opsi.push({ v: 'wali', t: 'Wali kelas' });
    opsi.push({ v: 'mentor', t: 'Mentor' });
    return opsi;
}

function _ambilSiswaPeranDipilih() {
    const el = document.querySelector('input[name="ambil-sebagai"]:checked');
    if (el) return el.value;
    return _ambilSiswaPeranOpsi()[0].v;
}

function openModalAmbilSiswa() {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const opsi = _ambilSiswaPeranOpsi();
    const awal = (opsi.length > 1 && getPeranAktif() === 'mentor') ? 'mentor' : opsi[0].v;
    _ambilSiswaHasil = [];

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${isWaliUser() ? 'Tambah Siswa' : 'Ambil Siswa Binaan'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        ${isWaliUser() ? _tabsTambahSiswa('ambil') : ''}
        ${opsi.length > 1 ? `
        <div class="mb-3">
            <p class="block text-xs font-bold text-slate-500 mb-1">AMBIL SEBAGAI</p>
            <div class="flex gap-2">
                ${opsi.map(o => `
                <label class="flex-1 flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="radio" name="ambil-sebagai" value="${o.v}" ${o.v === awal ? 'checked' : ''} onchange="_renderHasilAmbilSiswa()"> ${o.t}
                </label>`).join('')}
            </div>
        </div>` : `<input type="radio" name="ambil-sebagai" value="${opsi[0].v}" checked class="hidden">`}
        <div>
            <label for="ambil-siswa-q" class="block text-xs font-bold text-slate-500 mb-1">CARI NAMA ATAU NISN</label>
            <input type="text" id="ambil-siswa-q" oninput="_renderHasilAmbilSiswa()" placeholder="Ketik untuk menyaring daftar" autocomplete="off" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
        </div>
        <div id="ambil-siswa-hasil" class="mt-3 space-y-2 max-h-72 overflow-y-auto">
            <p class="text-xs text-slate-400 text-center py-4"><i class="fas fa-spinner fa-spin"></i> Memuat data siswa...</p>
        </div>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
    _muatSiswaSekolah();
}

async function _muatSiswaSekolah() {
    const wadah = document.getElementById("ambil-siswa-hasil");
    if (!wadah) return;

    const seq = ++_ambilSiswaSeq;
    const res = await apiCall("cariSiswaSekolah", { q: "" }, false, 2, true);
    if (seq !== _ambilSiswaSeq) return;

    if (!res || res.status !== "success") {
        wadah.innerHTML = `<p class="text-xs text-rose-500 text-center py-4">${escapeHtml(res?.message || 'Gagal memuat data. Periksa koneksi.')}</p>`;
        return;
    }
    _ambilSiswaHasil = res.data || [];
    _renderHasilAmbilSiswa();
}

function _renderHasilAmbilSiswa() {
    const wadah = document.getElementById("ambil-siswa-hasil");
    if (!wadah) return;
    const q = (document.getElementById("ambil-siswa-q")?.value || "").trim().toLowerCase();
    const daftar = _ambilSiswaHasil.filter(s => !q || String(s.nama || "").toLowerCase().includes(q) || String(s.nisn || "").toLowerCase().includes(q));
    if (daftar.length === 0) {
        wadah.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Siswa tidak ditemukan.</p>';
        return;
    }

    const sebagai = _ambilSiswaPeranDipilih();
    wadah.innerHTML = daftar.map(s => {
        let alasan = "";
        if (sebagai === 'wali' && s.punya_kelas) {
            alasan = s.di_kelas_saya ? "Sudah di kelas Anda." : `Sudah di kelas ${s.kelas_nama || 'lain'}, minta admin memindahkan.`;
        } else if (sebagai === 'mentor' && s.punya_mentor) {
            alasan = s.binaan_saya ? "Sudah jadi binaan Anda." : "Sudah punya mentor, minta admin memindahkan.";
        }
        const aktif = alasan === "";
        return `
            <div class="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2 ${aktif ? '' : 'opacity-60'}">
                <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(s.nama)}</p>
                    <p class="text-[11px] text-slate-400">NISN: ${escapeHtml(s.nisn || '-')} | Kelas: ${escapeHtml(s.kelas_nama || '-')} | Mentor: ${s.punya_mentor ? 'ada' : 'belum'}</p>
                    ${aktif ? '' : `<p class="text-[11px] text-amber-700 mt-0.5">${escapeHtml(alasan)}</p>`}
                </div>
                <button ${aktif ? '' : 'disabled'} onclick="ambilSiswaSekolah('${escapeHtml(s.id)}')" class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${aktif ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}">Ambil</button>
            </div>`;
    }).join("");
}

async function ambilSiswaSekolah(siswaId) {
    const sebagai = _ambilSiswaPeranDipilih();
    const res = await apiCall("ambilSiswa", { siswa_id: siswaId, sebagai }, true);

    if (res && res.status === "success") {
        if (res.user && typeof syncUserFlags === "function") syncUserFlags(res.user);
        closeModal();
        showToast(res.message || "Siswa berhasil diambil.");
        await fetchAllAppData(true);
        renderSiswaView();
        _refreshAllSiswaDropdowns();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengambil Siswa',
            text: res?.message || 'Koneksi bermasalah. Coba lagi.',
            confirmButtonColor: '#2563eb'
        });
        if (res) _muatSiswaSekolah();
    }
}
