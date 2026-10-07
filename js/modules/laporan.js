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
    select.innerHTML = renderKelasSelectOptions(currentVal, { allLabel: "Semua Kelas", prefix: "Kelas " });
    applyKelasSelectLock(select);
}

function getFilteredLaporanData() {
    if (!appState.laporanRekap) return [];

    const kelasFilter = getEffectiveKelasFilter(document.getElementById("laporan-kelas-filter")?.value || "");
    const statusFilter = document.getElementById("laporan-status-filter")?.value || "";

    return scopeBySiswaId(appState.laporanRekap, item => item.id).filter(item => {
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
                        ${renderPeranChip((appState.siswa || []).find(x => String(x.id) === String(item.id)))}
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${isPerhatian ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}">
                            ${isPerhatian ? '<i class="fas fa-triangle-exclamation mr-1" aria-hidden="true"></i>Perhatian' : '<i class="fas fa-circle-check mr-1" aria-hidden="true"></i>Tuntas'}
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">NISN: ${escapeHtml(item.nisn || '-')} • Kelas: ${kls ? escapeHtml(kls.nama_kelas) : '-'}</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 mt-1.5 pt-1.5 border-t border-slate-50">
                        <span class="text-emerald-600 font-semibold"><i class="fas fa-check-circle text-[10px] mr-1"></i>H: ${item.presensi.hadir}</span>
                        <span class="text-amber-600"><i class="fas fa-notes-medical text-[10px] mr-1"></i>S: ${item.presensi.sakit}</span>
                        <span class="text-blue-600"><i class="fas fa-envelope-open text-[10px] mr-1"></i>I: ${item.presensi.izin}</span>
                        <span class="text-rose-600 font-bold"><i class="fas fa-exclamation-triangle text-[10px] mr-1"></i>A: ${item.presensi.alpa}</span>
                        <span class="text-purple-700 font-semibold"><i class="fas fa-book text-[10px] mr-1"></i>< KKTP: ${item.dibawah_kktp}</span>
                    </div>
                </div>
                <button onclick="openProfilSiswa('${escapeHtml(item.id)}')" class="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl text-xs font-bold shrink-0 transition" title="Lihat Profil Lengkap" aria-label="Lihat profil lengkap">
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

        return `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td style="text-align: center;">${escapeHtml(item.nisn || '-')}</td>
                <td style="text-align: left; font-weight: bold;">${escapeHtml(item.nama)}</td>
                <td style="text-align: center;">${kls ? escapeHtml(kls.nama_kelas) : '-'}</td>
                <td style="text-align: center; color: #16a34a; font-weight: bold;">${item.presensi.hadir}</td>
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
                    <th style="width: 90px;">NISN</th>
                    <th style="text-align: left;">Nama Siswa</th>
                    <th style="width: 55px;">Kelas</th>
                    <th style="width: 45px;">Hadir</th>
                    <th style="width: 45px;">Sakit</th>
                    <th style="width: 45px;">Izin</th>
                    <th style="width: 45px;">Alpa</th>
                    <th style="width: 80px;">&lt; KKTP</th>
                    <th style="width: 105px;">Evaluasi</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
}

function getLaporanRekapTitle() {
    const nama = isGuruUser() ? getLabelSiswa().toUpperCase() : "ANAK WALI";
    return `LAPORAN REKAPITULASI PEMANTAUAN ${nama}`;
}

function printLaporanRekap() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk dicetak.', confirmButtonColor: '#2563eb' });
        return;
    }
    printFeaturePDF(getLaporanRekapTitle(), buildLaporanRekapContent(data), { orientation: "landscape" });
}

function exportLaporanPDF() {
    const data = getFilteredLaporanData();
    if (data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data rekapitulasi untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }
    exportFeaturePDF(
        getLaporanRekapTitle(),
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


const LAPORAN_K_MAX_HARI = 93;

let laporanTab = "umum";
let laporanKebiasaan = null;
let laporanKebiasaanMemuat = false;

function bersihkanTeksPdf(t) {
    return String(t === null || t === undefined ? "" : t)
        .replace(/[\p{Extended_Pictographic}\u200D\uFE0E\uFE0F\u20E3]/gu, "")
        .replace(/[ \t]+/g, " ")
        .trim();
}

function csvSel(v) {
    let t = String(v === null || v === undefined ? "" : v).replace(/\r?\n/g, " ");
    if (/^[=+\-@\t]/.test(t)) t = "'" + t;
    return '"' + t.replace(/"/g, '""') + '"';
}

function tanggalPendek(t) {
    const m = String(t || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(t || "");
}

function setLaporanTab(tab) {
    laporanTab = tab;
    const umum = document.getElementById("laporan-panel-umum");
    const keb = document.getElementById("laporan-panel-kebiasaan");
    if (umum) umum.classList.toggle("hidden", tab !== "umum");
    if (keb) keb.classList.toggle("hidden", tab !== "kebiasaan");
    ["umum", "kebiasaan"].forEach(t => {
        const b = document.getElementById("btn-laporan-tab-" + t);
        if (!b) return;
        const aktif = t === tab;
        b.classList.toggle("bg-white", aktif);
        b.classList.toggle("text-primary", aktif);
        b.classList.toggle("shadow-sm", aktif);
        b.classList.toggle("text-slate-600", !aktif);
        b.setAttribute("aria-pressed", String(aktif));
    });
    if (tab === "kebiasaan") initLaporanKebiasaan();
}

function initLaporanKebiasaan() {
    const kelasSel = document.getElementById("lk-kelas-filter");
    if (kelasSel) {
        const cur = kelasSel.value;
        kelasSel.innerHTML = renderKelasSelectOptions(cur, { allLabel: "Semua Kelas", prefix: "Kelas " });
        applyKelasSelectLock(kelasSel);
    }
    const dari = document.getElementById("lk-dari");
    const sampai = document.getElementById("lk-sampai");
    const today = getDateWITA();
    if (sampai && !sampai.value) { sampai.value = today; sampai.max = today; }
    if (dari && !dari.value) { dari.value = today.slice(0, 8) + "01"; dari.max = today; }
    if (laporanKebiasaan) renderLaporanKebiasaan();
    else muatLaporanKebiasaan({ tampil: true });
}

function ambilParamLaporanKebiasaan() {
    const dari = (document.getElementById("lk-dari") || {}).value || "";
    const sampai = (document.getElementById("lk-sampai") || {}).value || "";
    if (!dari || !sampai) return { error: "Isi tanggal awal dan tanggal akhir." };
    if (dari > sampai) return { error: "Tanggal awal harus sebelum tanggal akhir." };
    const hari = Math.round((Date.parse(sampai + "T00:00:00Z") - Date.parse(dari + "T00:00:00Z")) / 86400000) + 1;
    if (hari > LAPORAN_K_MAX_HARI) return { error: `Rentang maksimal ${LAPORAN_K_MAX_HARI} hari. Pilih periode yang lebih pendek.` };
    const kelas = getEffectiveKelasFilter((document.getElementById("lk-kelas-filter") || {}).value || "");
    return { dari, sampai, kelas };
}

async function muatLaporanKebiasaan(opsi = {}) {
    const prm = ambilParamLaporanKebiasaan();
    if (prm.error) {
        Swal.fire({ icon: "warning", title: "Periode Tidak Valid", text: prm.error, confirmButtonColor: "#2563eb" });
        return null;
    }
    const kunci = [prm.dari, prm.sampai, prm.kelas].join("|");
    const cukup = laporanKebiasaan && laporanKebiasaan.kunci === kunci &&
        (laporanKebiasaan.denganJurnal || !opsi.jurnal);
    if (cukup && !opsi.force) {
        if (opsi.tampil) renderLaporanKebiasaan();
        return laporanKebiasaan.data;
    }
    if (laporanKebiasaanMemuat) return null;
    laporanKebiasaanMemuat = true;
    if (opsi.tampil) renderSkeleton("laporan-k-container", 4);
    else showLoading("Mengambil data laporan...");

    const payload = { dari: prm.dari, sampai: prm.sampai, sertakan_jurnal: !!opsi.jurnal };
    if (prm.kelas) payload.kelas_id = prm.kelas;
    const res = await apiCall("getLaporanKebiasaan", payload, false);
    laporanKebiasaanMemuat = false;
    if (!opsi.tampil) hideLoading();

    if (res && res.status === "success" && res.data) {
        laporanKebiasaan = { kunci, denganJurnal: !!opsi.jurnal, data: res.data };
        renderLaporanKebiasaan();
        return res.data;
    }
    const wadah = document.getElementById("laporan-k-container");
    if (res && res.status === "error") {
        Swal.fire({ icon: "warning", title: "Laporan Tidak Dapat Dimuat", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
    } else if (wadah) {
        wadah.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i><p class="text-xs text-slate-500">Laporan gagal dimuat. Periksa koneksi lalu coba lagi.</p></div>`;
    }
    return null;
}

function ambilDataLaporanKebiasaan() {
    if (!laporanKebiasaan) return null;
    const d = laporanKebiasaan.data;
    const siswa = scopeBySiswaId(d.siswa || [], x => x.id);
    const idSet = new Set(siswa.map(x => String(x.id)));
    const jurnal = (d.jurnal || []).filter(j => idSet.has(String(j.siswa_id)));
    return { periode: d.periode, konfig: d.konfig || [], siswa, jurnal, terpotong: !!d.jurnal_terpotong, denganJurnal: laporanKebiasaan.denganJurnal };
}

function renderLaporanKebiasaan() {
    const wadah = document.getElementById("laporan-k-container");
    if (!wadah) return;
    const d = ambilDataLaporanKebiasaan();
    if (!d) return;
    if (d.siswa.length === 0) {
        wadah.innerHTML = `<div class="empty-state"><i class="fas fa-filter text-2xl mb-2 text-purple-400"></i><p class="text-xs text-slate-500 font-medium">Tidak ada siswa pada cakupan dan periode ini.</p></div>`;
        return;
    }
    const rata = Math.round(d.siswa.reduce((a, x) => a + x.capaian, 0) / d.siswa.length);
    const ringkas = `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span><b>Periode:</b> ${escapeHtml(tanggalPendek(d.periode.dari))} s.d. ${escapeHtml(tanggalPendek(d.periode.sampai))} (${d.periode.hari} hari)</span>
            <span><b>Siswa:</b> ${d.siswa.length}</span>
            <span><b>Rata-rata capaian:</b> ${rata}%</span>
        </div>`;

    const kartu = d.siswa.map(x => {
        const kls = (appState.kelas || []).find(k => String(k.id) === String(x.kelas_id));
        const warna = x.capaian >= 75 ? "bg-emerald-500" : (x.capaian >= 40 ? "bg-amber-500" : "bg-rose-500");
        const chips = d.konfig.map(k => `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold" title="${escapeHtml(k.nama)}">${escapeHtml(k.id)}: ${x.per_kebiasaan[k.id] || 0}</span>`).join("");
        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
                <div class="min-w-0 flex-1 space-y-1.5">
                    <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(x.nama)}</h4>
                        ${renderPeranChip((appState.siswa || []).find(s => String(s.id) === String(x.id)))}
                    </div>
                    <p class="text-[11px] text-slate-400">NISN: ${escapeHtml(x.nisn || "-")} \u2022 Kelas: ${kls ? escapeHtml(kls.nama_kelas) : "-"}</p>
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div class="${warna} h-2 rounded-full" style="width:${Math.min(x.capaian, 100)}%"></div></div>
                        <span class="text-xs font-extrabold text-slate-700 w-10 text-right">${x.capaian}%</span>
                    </div>
                    <div class="flex flex-wrap gap-1">${chips}</div>
                    <div class="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-600 pt-1 border-t border-slate-50">
                        <span><i class="fas fa-star text-amber-500 mr-1"></i>${x.poin} poin</span>
                        <span><i class="fas fa-calendar-check text-emerald-500 mr-1"></i>${x.hari_penuh} hari penuh</span>
                        <span><i class="fas fa-book-open text-blue-500 mr-1"></i>${x.jurnal_ditulis} jurnal</span>
                        <span><i class="fas fa-comment text-purple-500 mr-1"></i>dicatat wali ${x.jurnal_catatan_wali}, mentor ${x.jurnal_catatan_mentor}</span>
                    </div>
                </div>
                <button onclick="openProfilSiswa('${escapeHtml(x.id)}')" class="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl text-xs font-bold shrink-0 transition" title="Lihat Profil Lengkap" aria-label="Lihat profil lengkap">
                    <i class="fas fa-eye"></i>
                </button>
            </div>`;
    }).join("");
    wadah.innerHTML = ringkas + kartu;
}

function namaKelasLaporan(id) {
    const k = (appState.kelas || []).find(x => String(x.id) === String(id));
    return k ? k.nama_kelas : "-";
}

function buildLaporanKebiasaanContent(d, denganJurnal) {
    const e = escapeHtml;
    const t = v => e(bersihkanTeksPdf(v));
    const hKonfig = d.konfig.map(k => `<th style="width: 38px;">${e(k.id)}</th>`).join("");
    const baris = d.siswa.map((x, i) => `
        <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="text-align: center;">${t(x.nisn || "-")}</td>
            <td style="text-align: left; font-weight: bold;">${t(x.nama)}</td>
            <td style="text-align: center;">${t(namaKelasLaporan(x.kelas_id))}</td>
            ${d.konfig.map(k => `<td style="text-align: center;">${x.per_kebiasaan[k.id] || 0}</td>`).join("")}
            <td style="text-align: center; font-weight: bold;">${x.total_sudah}</td>
            <td style="text-align: center; font-weight: bold; ${x.capaian < 40 ? "color: #dc2626;" : ""}">${x.capaian}%</td>
            <td style="text-align: center;">${x.poin}</td>
            <td style="text-align: center;">${x.jurnal_ditulis}</td>
        </tr>`).join("");

    const legenda = d.konfig.map(k => `${e(k.id)} = ${t(k.nama)}`).join("; ");
    let html = `
        <p><b>Periode:</b> ${e(tanggalPendek(d.periode.dari))} s.d. ${e(tanggalPendek(d.periode.sampai))} (${d.periode.hari} hari)</p>
        <table>
            <thead><tr>
                <th style="width: 30px;">No</th><th style="width: 90px;">NISN</th><th style="text-align: left;">Nama Siswa</th><th style="width: 55px;">Kelas</th>
                ${hKonfig}
                <th style="width: 45px;">Total</th><th style="width: 60px;">Capaian</th><th style="width: 45px;">Poin</th><th style="width: 45px;">Jurnal</th>
            </tr></thead>
            <tbody>${baris}</tbody>
        </table>
        <p><b>Keterangan:</b> ${legenda}. Angka pada kolom K adalah jumlah hari berstatus Sudah. Capaian dihitung dari seluruh hari kalender dalam periode, termasuk akhir pekan dan hari libur.</p>`;

    if (denganJurnal) {
        const idKe = new Map(d.siswa.map(x => [String(x.id), x]));
        const ctt = (teks, nama) => teks ? `${t(teks)}${nama ? " (" + t(nama) + ")" : ""}` : "-";
        const barisJ = d.jurnal.map(j => `
            <tr>
                <td style="text-align: center;">${e(tanggalPendek(j.tanggal))}</td>
                <td style="text-align: left;">${t((idKe.get(String(j.siswa_id)) || {}).nama || j.nama || "")}</td>
                <td style="text-align: center;">${t(j.mood)}</td>
                <td style="text-align: left;">${t(j.isi)}</td>
                <td style="text-align: left;">${ctt(j.catatan_wali, j.wali_nama)}</td>
                <td style="text-align: left;">${ctt(j.catatan_mentor, j.mentor_nama)}</td>
            </tr>`).join("");
        html += `
            <h4>Jurnal Harian dan Catatan Guru</h4>
            <table>
                <thead><tr>
                    <th style="width: 62px;">Tanggal</th><th style="width: 110px; text-align: left;">Siswa</th><th style="width: 60px;">Mood</th>
                    <th style="text-align: left;">Isi Jurnal</th><th style="width: 140px; text-align: left;">Catatan Wali</th><th style="width: 140px; text-align: left;">Catatan Mentor</th>
                </tr></thead>
                <tbody>${barisJ || `<tr><td colspan="6" style="text-align: center;">Tidak ada jurnal pada periode ini</td></tr>`}</tbody>
            </table>
            ${d.terpotong ? "<p><b>Catatan:</b> daftar jurnal dibatasi pada entri terbaru. Persempit periode atau pilih satu kelas untuk melihat semuanya.</p>" : ""}`;
    }
    return html;
}

function judulLaporanKebiasaan() {
    const nama = isGuruUser() ? getLabelSiswa().toUpperCase() : "ANAK WALI";
    return `LAPORAN 7 KEBIASAAN HEBAT DAN JURNAL ${nama}`;
}

async function siapkanLaporanKebiasaan(jurnal) {
    const data = await muatLaporanKebiasaan({ jurnal });
    if (!data) return null;
    const d = ambilDataLaporanKebiasaan();
    if (!d || d.siswa.length === 0) {
        Swal.fire({ icon: "warning", title: "Data Kosong", text: "Tidak ada data untuk diekspor pada periode ini.", confirmButtonColor: "#2563eb" });
        return null;
    }
    return d;
}

async function cetakLaporanKebiasaan() {
    const jurnal = !!(document.getElementById("lk-sertakan-jurnal") || {}).checked;
    const d = await siapkanLaporanKebiasaan(jurnal);
    if (d) printFeaturePDF(judulLaporanKebiasaan(), buildLaporanKebiasaanContent(d, jurnal), { orientation: "landscape" });
}

async function eksporLaporanKebiasaanPDF() {
    const jurnal = !!(document.getElementById("lk-sertakan-jurnal") || {}).checked;
    const d = await siapkanLaporanKebiasaan(jurnal);
    if (d) exportFeaturePDF(judulLaporanKebiasaan(), buildLaporanKebiasaanContent(d, jurnal),
        `Laporan_Kebiasaan_${d.periode.dari}_sd_${d.periode.sampai}.pdf`, { orientation: "landscape" });
}

async function eksporLaporanKebiasaanCSV() {
    const d = await siapkanLaporanKebiasaan(false);
    if (!d) return;
    const kepala = ["No", "NISN", "Nama Siswa", "Kelas"].concat(d.konfig.map(k => k.nama))
        .concat(["Total Sudah", "Hari Tercatat", "Hari Penuh", "Capaian (%)", "Poin", "Jurnal Ditulis", "Jurnal Dicatat Wali", "Jurnal Dicatat Mentor"]);
    let csv = "\uFEFF" + kepala.map(csvSel).join(",") + "\n";
    d.siswa.forEach((x, i) => {
        const baris = [i + 1, x.nisn || "-", x.nama, namaKelasLaporan(x.kelas_id)]
            .concat(d.konfig.map(k => x.per_kebiasaan[k.id] || 0))
            .concat([x.total_sudah, x.hari_tercatat, x.hari_penuh, x.capaian, x.poin, x.jurnal_ditulis, x.jurnal_catatan_wali, x.jurnal_catatan_mentor]);
        csv += baris.map(csvSel).join(",") + "\n";
    });
    _downloadCSVString(csv, `Rekap_Kebiasaan_${d.periode.dari}_sd_${d.periode.sampai}.csv`);
    showToast("File Excel/CSV berhasil diunduh!");
}

async function eksporLaporanJurnalCSV() {
    const d = await siapkanLaporanKebiasaan(true);
    if (!d) return;
    const idKe = new Map(d.siswa.map(x => [String(x.id), x]));
    const kepala = ["Tanggal", "NISN", "Nama Siswa", "Kelas", "Mood", "Isi Jurnal", "Catatan Wali", "Nama Wali", "Catatan Mentor", "Nama Mentor"];
    let csv = "\uFEFF" + kepala.map(csvSel).join(",") + "\n";
    d.jurnal.forEach(j => {
        const s = idKe.get(String(j.siswa_id)) || {};
        csv += [j.tanggal, s.nisn || "-", s.nama || j.nama || "", namaKelasLaporan(s.kelas_id), j.mood, j.isi,
            j.catatan_wali, j.wali_nama, j.catatan_mentor, j.mentor_nama].map(csvSel).join(",") + "\n";
    });
    _downloadCSVString(csv, `Jurnal_Siswa_${d.periode.dari}_sd_${d.periode.sampai}.csv`);
    showToast(d.terpotong ? "Excel/CSV diunduh. Daftar dibatasi pada entri terbaru." : "File Excel/CSV berhasil diunduh!", d.terpotong ? "warning" : "success");
}