let ucapanMaskotPerluBaru = true;
let ucapanMaskotKunci = "";
let ucapanMaskotNomor = 0;

function bukaUcapanMaskot() {
    ucapanMaskotPerluBaru = true;
}

function wadahUcapanMaskot() {
    let el = document.getElementById("dash-maskot-ucap");
    if (el) return el;
    const view = document.getElementById("view-dashboard");
    if (!view) return null;
    el = document.createElement("div");
    el.id = "dash-maskot-ucap";
    el.className = "mk-ucap-host";
    view.insertBefore(el, view.firstChild);
    return el;
}

let ucapanMaskotCtl = null;
const UCAP_LEVEL = { kritis: 3, sedang: 2, rendah: 1 };

let ucapanAgenda = null;
let ucapanPerKelas = null;
let ucapanTatib = null;

function ucapanTatibRingkas(res) {
    if (!res || res.status !== "success" || !Array.isArray(res.data)) return null;
    let perlu = 0, batas = 0;
    res.data.forEach(r => {
        const tertunda = Array.isArray(r.panggilan_tertunda) ? r.panggilan_tertunda : [];
        if (tertunda.length > 0) perlu++;
        if (r.mencapai_batas) batas++;
    });
    return { perlu, batas };
}

function ucapanPimpinan(u, notifAktif, tambah) {
    const isAdmin = u.role === "admin";
    const semuaNotif = () => {
        const perSiswa = new Map();
        notifAktif.forEach(n => {
            if (!n || !n.siswa) return;
            const id = String(n.siswa.id);
            const e = perSiswa.get(id) || { level: "rendah", tingkat: 0 };
            const t = UCAP_LEVEL[n.level] || 1;
            if (t > e.tingkat) { e.tingkat = t; e.level = n.level; }
            perSiswa.set(id, e);
        });
        return Array.from(perSiswa.values());
    };

    if (appState.notificationsReady) {
        const semua = semuaNotif();
        const kritis = semua.filter(e => e.level === "kritis").length;
        if (kritis) {
            tambah({ kunci: "p-kritis", view: "siswa", bobot: 6, tingkat: "kritis", angka: kritis, teks: "siswa berstatus kritis di seluruh sekolah." });
        }
        if (semua.length) {
            tambah({ kunci: "p-perhatian", view: "siswa", bobot: 3, tingkat: kritis ? "kritis" : "sedang", angka: semua.length, teks: "siswa perlu perhatian." });
        } else {
            tambah({ kunci: "p-aman", bobot: 1, tingkat: "baik", teks: "Tidak ada siswa yang perlu perhatian saat ini." });
        }

        const perKategori = new Map();
        notifAktif.forEach(n => {
            const kat = String((n && n.category) || "").trim();
            if (!kat) return;
            const e = perKategori.get(kat) || { jumlah: 0, tingkat: 0, level: "rendah" };
            e.jumlah++;
            const t = UCAP_LEVEL[n.level] || 1;
            if (t > e.tingkat) { e.tingkat = t; e.level = n.level; }
            perKategori.set(kat, e);
        });
        Array.from(perKategori.entries())
            .sort((a, b) => b[1].tingkat - a[1].tingkat || b[1].jumlah - a[1].jumlah)
            .slice(0, 3)
            .forEach(([kat, e]) => tambah({
                kunci: "p-kat-" + kat, notif: true, bobot: e.tingkat === 3 ? 4 : 2, tingkat: e.level,
                angka: e.jumlah, teks: `catatan ${ucapanPotong(kat, 40)}.`
            }));
    }

    const tt = ucapanTatibRingkas(ucapanTatib);
    if (tt) {
        if (tt.batas) tambah({ kunci: "p-tatib-batas", view: "tatib", pose: "tatib", bobot: 5, tingkat: "kritis", angka: tt.batas, teks: "siswa mencapai batas tata tertib." });
        if (tt.perlu) tambah({ kunci: "p-tatib-panggil", view: "tatib", pose: "tatib", bobot: 3, tingkat: "sedang", angka: tt.perlu, teks: "siswa menunggu panggilan orang tua (tata tertib)." });
        if (!tt.batas && !tt.perlu) tambah({ kunci: "p-tatib-aman", pose: "tatib", bobot: 1, tingkat: "baik", teks: "Tidak ada panggilan orang tua yang tertunda." });
    }

    if (Array.isArray(ucapanAgenda) && ucapanAgenda.length) {
        const ag = ucapanAgenda[0];
        tambah({
            kunci: "p-agenda", view: "pembinaan", pose: "pengingat", bobot: 3, tingkat: "rendah", angka: ucapanAgenda.length,
            teks: `agenda pembinaan akan datang. Terdekat: ${ucapanNamaSingkat(ag.nama_siswa)}${ag.jadwal_pantau ? " (" + ucapanPotong(ag.jadwal_pantau, 24) + ")" : ""}.`
        });
    }

    if (isAdmin) {
        const siswaAll = appState.siswa || [];
        const kelasAll = appState.kelas || [];
        let adaMasalah = false;
        if (siswaAll.length) {
            const tanpaKelas = siswaAll.filter(s => !String(s.kelas_id || "").trim()).length;
            const tanpaMentor = siswaAll.filter(s => !String(s.mentor_id || "").trim()).length;
            if (tanpaKelas) { adaMasalah = true; tambah({ kunci: "a-tanpa-kelas", view: "admin-manage", bobot: 4, tingkat: "sedang", angka: tanpaKelas, teks: "siswa belum punya kelas." }); }
            if (tanpaMentor) { adaMasalah = true; tambah({ kunci: "a-tanpa-mentor", view: "admin-manage", bobot: 3, tingkat: "rendah", angka: tanpaMentor, teks: "siswa belum punya mentor." }); }
        }
        if (kelasAll.length) {
            const tanpaWali = kelasAll.filter(k => !String(k.guru_id || "").trim()).length;
            if (tanpaWali) { adaMasalah = true; tambah({ kunci: "a-tanpa-wali", view: "admin-manage", bobot: 4, tingkat: "sedang", angka: tanpaWali, teks: "kelas belum punya wali kelas." }); }
        }
        if (siswaAll.length && !adaMasalah) {
            tambah({ kunci: "a-data-rapi", bobot: 1, tingkat: "baik", teks: `Data master rapi: ${siswaAll.length} siswa, ${kelasAll.length} kelas, ${(appState.guru || []).length} guru.` });
        }
    } else if (Array.isArray(ucapanPerKelas) && ucapanPerKelas.length) {
        const urut = ucapanPerKelas.filter(k => Number(k.perlu_perhatian) > 0)
            .sort((a, b) => Number(b.perlu_perhatian) - Number(a.perlu_perhatian));
        if (urut.length) {
            const k = urut[0];
            tambah({
                kunci: "k-kelas-teratas", pose: "laporan", bobot: 4, tingkat: "sedang", angka: k.perlu_perhatian,
                teks: `siswa perlu perhatian di ${ucapanPotong(k.nama_kelas, 30)}, terbanyak di antara ${ucapanPerKelas.length} kelas.`
            });
        } else {
            tambah({ kunci: "k-kelas-aman", pose: "laporan", bobot: 1, tingkat: "baik", teks: `Semua ${ucapanPerKelas.length} kelas tanpa siswa yang perlu perhatian.` });
        }
    }

    const hari = typeof maskotKonteks === "function" ? maskotKonteks().hari : "";
    if (hari === "ramadan") tambah({ kunci: "h-ramadan", pose: "ceria", bobot: 1, tingkat: "baik", teks: "Selamat menjalankan ibadah Ramadan." });
    else if (hari === "agustus") tambah({ kunci: "h-agustus", pose: "ceria", bobot: 1, tingkat: "baik", teks: "Dirgahayu Republik Indonesia!" });
    else if (hari === "lulus") tambah({ kunci: "h-lulus", pose: "akademik", bobot: 1, tingkat: "baik", teks: "Musim kelulusan. Pastikan data kelas dan nilai akhir sudah rapi." });
}

function ucapanNamaSingkat(nama) {
    return String(nama || "").trim().split(/\s+/).slice(0, 2).join(" ") || "Siswa";
}
function ucapanPotong(teks, maks) {
    const t = String(teks || "").replace(/\s+/g, " ").trim();
    return t.length > maks ? t.slice(0, maks - 1).trim() + "…" : t;
}

function kandidatUcapanMaskot() {
    const u = appState.user;
    const daftar = [];
    if (!u) return daftar;
    const today = getDateWITA();
    const jam = typeof getJamWITA === "function" ? getJamWITA() : new Date().getHours();
    const isSiswa = u.role === "siswa";
    const isAdmin = u.role === "admin";
    const isPimpinan = isAdmin || u.role === "kepsek";
    const pose = isSiswa ? "siswa" : isAdmin ? "admin" : "guru";
    const tambah = (o) => daftar.push(Object.assign({ pose }, o));
    const notifAktif = appState.notificationsReady ? (appState.currentNotifications || []) : [];

    if (isSiswa) {
        if (misiTerakhirMuat > 0) {
            const total = (typeof MASTER_KEBIASAAN !== "undefined" && MASTER_KEBIASAAN.length) || 7;
            const sudah = sdMine(appState.kebiasaan).filter(k => sdTgl(k) === today && k.status === "Sudah").length;
            const jurnal = sdMine(appState.jurnal).some(j => sdTgl(j) === today);
            const streak = sdHitungStreak(today);
            if (sudah < total) {
                tambah({
                    kunci: "s-kebiasaan", view: "kebiasaan", bobot: 3, tingkat: "sedang", angka: `${sudah}/${total}`,
                    teks: "kebiasaan hari ini sudah terisi."
                });
            }
            if (!jurnal) {
                tambah({ kunci: "s-jurnal", view: "jurnal", bobot: jam >= 15 ? 4 : 2, tingkat: "sedang", teks: "Jurnal hari ini belum ditulis." });
            }
            if (sudah >= total && jurnal) {
                tambah({ kunci: "s-selesai", bobot: 3, tingkat: "baik", teks: "Semua misi hari ini selesai: kebiasaan dan jurnal." });
            }
            if (streak >= 2) {
                tambah({ kunci: "s-streak", bobot: 2, tingkat: "baik", angka: streak, teks: "hari streak berturut-turut." });
            }
        }
        if (notifAktif.length) {
            const n = notifAktif.slice().sort((a, b) => (UCAP_LEVEL[b.level] || 0) - (UCAP_LEVEL[a.level] || 0))[0];
            tambah({
                kunci: "s-perhatian", notif: true, bobot: n.level === "kritis" ? 6 : 4, tingkat: n.level,
                teks: `Perlu perhatian: ${ucapanPotong(n.title, 64)}${notifAktif.length > 1 ? ` (+${notifAktif.length - 1} lagi)` : ""}`
            });
        } else if (appState.notificationsReady) {
            tambah({ kunci: "s-aman", bobot: 1, tingkat: "baik", teks: "Tidak ada indikator perhatian aktif untukmu." });
        }
    } else if (isPimpinan) {
        ucapanPimpinan(u, notifAktif, tambah);
        const pilih = daftar.slice().sort((a, b) => (b.bobot || 1) - (a.bobot || 1)).slice(0, 6);
        daftar.length = 0;
        pilih.forEach(x => daftar.push(x));
    } else if (u.role === "bk") {
        tambah({ kunci: "b-tatib", view: "tatib", bobot: 2, tingkat: "baik", teks: "Catat pelanggaran dan penghargaan siswa lewat menu Tata Tertib." });
    } else {
        const nama = u.role === "guru" ? getLabelSiswa().toLowerCase() : "siswa";
        const peran = isGuruUser() ? getPeranAktif() : "semua";
        const minggu = new Date(today + "T00:00:00Z").getUTCDay() === 0;

        const presensi = (tab, kunci, kata) => {
            const siswa = absensiSiswaTab(tab);
            if (!siswa.length) return;
            const rek = { belum: 0 }, alpa = [];
            siswa.forEach(s => {
                const st = absensiRec(tab, s.id).status;
                if (!st) rek.belum++;
                else {
                    rek[st] = (rek[st] || 0) + 1;
                    if (st === "A") alpa.push(ucapanNamaSingkat(s.nama));
                }
            });
            if (rek.belum > 0) {
                tambah({
                    kunci: kunci + "-belum", view: "absensi", bobot: 5, tingkat: "sedang", angka: rek.belum,
                    teks: `dari ${siswa.length} ${kata} belum dipresensi hari ini.`
                });
            } else {
                const bagian = [`${rek.H || 0} hadir`];
                if (rek.T) bagian.push(`${rek.T} terlambat`);
                if (rek.S) bagian.push(`${rek.S} sakit`);
                if (rek.I) bagian.push(`${rek.I} izin`);
                if (rek.A) bagian.push(`${rek.A} alpa`);
                let teks = `Presensi ${kata} lengkap: ${bagian.join(", ")}.`;
                if (alpa.length) teks += ` Alpa: ${alpa.slice(0, 3).join(", ")}${alpa.length > 3 ? " dkk" : ""}.`;
                tambah({ kunci: kunci + "-rekap", view: "absensi", bobot: rek.A ? 4 : 2, tingkat: rek.A ? "sedang" : "baik", teks });
            }
        };
        if (!minggu) {
            const kelasBisa = isGuruUser() ? (isWaliUser() && (peran === "wali" || peran === "semua")) : true;
            if (kelasBisa && typeof absensiLoadedTanggal !== "undefined" && absensiLoadedTanggal === today) {
                presensi("kelas", "g-presensi-kelas", nama);
            }
            if (isGuruUser() && isMentorUser() && (peran === "mentor" || peran === "semua") &&
                typeof absensiMentorLoadedTanggal !== "undefined" && absensiMentorLoadedTanggal === today) {
                presensi("binaan", "g-presensi-binaan", "anak binaan");
            }
        }

        if (appState.notificationsReady) {
            const perSiswa = new Map();
            notifAktif.forEach(n => {
                if (!n || !n.siswa) return;
                const id = String(n.siswa.id);
                const e = perSiswa.get(id) || { siswa: n.siswa, tingkat: 0, level: "rendah", item: [], utama: n };
                e.item.push(n);
                const t = UCAP_LEVEL[n.level] || 1;
                if (t > e.tingkat) { e.tingkat = t; e.level = n.level; e.utama = n; }
                perSiswa.set(id, e);
            });
            const urut = Array.from(perSiswa.values()).sort((a, b) =>
                b.tingkat - a.tingkat || b.item.length - a.item.length || String(a.siswa.nama).localeCompare(String(b.siswa.nama)));
            const kritis = urut.filter(e => e.level === "kritis");
            if (kritis.length) {
                tambah({
                    kunci: "g-kritis", view: "siswa", bobot: 6, tingkat: "kritis", angka: kritis.length,
                    teks: `${nama} berstatus kritis: ${kritis.slice(0, 3).map(e => ucapanNamaSingkat(e.siswa.nama)).join(", ")}${kritis.length > 3 ? " dkk" : ""}.`
                });
            }
            urut.slice(0, 3).forEach(e => tambah({
                kunci: "g-siswa-" + e.siswa.id, profil: String(e.siswa.id), bobot: e.tingkat === 3 ? 5 : e.tingkat === 2 ? 3 : 2, tingkat: e.level,
                teks: `${ucapanNamaSingkat(e.siswa.nama)}: ${ucapanPotong(e.utama.title, 64)}${e.item.length > 1 ? ` (+${e.item.length - 1} catatan lain)` : ""}`
            }));
            if (urut.length) {
                tambah({ kunci: "g-perhatian", view: "siswa", bobot: 3, tingkat: urut[0].level, angka: urut.length, teks: `${nama} perlu perhatian.` });
            } else {
                tambah({ kunci: "g-aman", bobot: 2, tingkat: "baik", teks: `Semua ${nama} dalam kondisi baik. Tidak ada yang perlu perhatian.` });
            }
        }
    }

    if (!daftar.length) {
        const slot = jam < 4 ? "begadang" : jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
        const sapa = { begadang: "Masih terjaga?", pagi: "Selamat pagi!", siang: "Selamat siang!", sore: "Selamat sore!", malam: "Selamat malam!" };
        tambah({ kunci: "sapa", bobot: 1, teks: `${sapa[slot]} Memeriksa data terbaru...` });
    }
    return daftar;
}

function ucapanMaskotDashboard() {
    const u = appState.user;
    if (!u || typeof maskotUcapPutar !== "function") return;
    const kunci = String(u.id) + ":" + (isGuruUser() ? getPeranAktif() : "");
    if (!ucapanMaskotPerluBaru && kunci === ucapanMaskotKunci) return;
    ucapanMaskotPerluBaru = false;
    ucapanMaskotKunci = kunci;
    const nomor = ++ucapanMaskotNomor;
    const pasang = () => {
        if (nomor !== ucapanMaskotNomor || !appState.user) return;
        const wadah = wadahUcapanMaskot();
        if (!wadah) return;
        if (ucapanMaskotCtl) ucapanMaskotCtl.berhenti();
        ucapanMaskotCtl = maskotUcapPutar(wadah, kandidatUcapanMaskot, 64, 7000);
    };
    if (u.role === "siswa" && typeof muatMisiHariIni === "function") {
        Promise.race([muatMisiHariIni(), new Promise(r => setTimeout(r, 2500))]).then(pasang, pasang);
    } else {
        try {
            if (u.role === "guru" && typeof loadAbsensiData === "function" && absensiLoadedTanggal !== getDateWITA()) Promise.resolve(loadAbsensiData()).catch(() => { });
        } catch (e) {  }
        pasang();
    }
}

async function renderDashboard() {
    if (!appState.user) return;
    const roleAsli = appState.user.role;
    const role = roleAsli === "kepsek" ? "admin" : roleAsli;

    const adminBanner = document.getElementById("dash-admin-banner");
    if (adminBanner) {
        if (roleAsli === "admin") adminBanner.classList.remove("hidden");
        else adminBanner.classList.add("hidden");
    }

    const isBK = roleAsli === "bk";
    ["dash-section-bottom", "dash-section-agenda"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (isBK) { el.classList.add("hidden"); el.dataset.bkHidden = "1"; }
        else if (el.dataset.bkHidden === "1") { el.classList.remove("hidden"); delete el.dataset.bkHidden; }
    });

    const statsContainer = document.getElementById("dash-stats-container");
    if (statsContainer && isBK) {
        statsContainer.className = "grid grid-cols-1 sm:grid-cols-2 gap-3";
        statsContainer.innerHTML = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <span class="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-base"><i class="fas fa-users"></i></span>
                <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-slate-500">Total Siswa</p>
                    <p class="text-2xl font-black text-slate-800 leading-tight">${getSiswaPeran().length}</p>
                    <p class="text-[11px] text-slate-400">Seluruh siswa yang dapat Anda layani</p>
                </div>
            </div>`;
    } else if (statsContainer) {
        const totalSiswaCount = getSiswaPeran().length;
        const labelSiswa = role === 'admin' ? 'Siswa' : getLabelSiswa();
        const hadirHariIni = scopeBySiswaId(appState.absensi, a => a.siswa_id).filter(a => a.status === 'H').length;
        const tampilHadir = role === "guru";
        statsContainer.className = tampilHadir ? "grid grid-cols-1 sm:grid-cols-3 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3";
        if (role === "admin" || role === "guru") {
            statsContainer.innerHTML = `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-base"><i class="fas fa-users"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-500">${role === 'admin' ? 'Total Siswa' : labelSiswa}</p>
                        <p class="text-2xl font-black text-slate-800 leading-tight">${totalSiswaCount}</p>
                        <p class="text-[11px] text-slate-400">${role === 'admin' ? 'Total siswa yang terdaftar' : 'Total ' + labelSiswa.toLowerCase() + ' yang dibina'}</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
                ${tampilHadir ? `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-secondary flex items-center justify-center text-base"><i class="fas fa-calendar-check"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-emerald-600">Hadir Hari Ini</p>
                        <p class="text-2xl font-black text-emerald-600 leading-tight">${hadirHariIni}</p>
                        <p class="text-[11px] text-slate-400">Dari ${totalSiswaCount} ${role === 'admin' ? 'siswa' : labelSiswa.toLowerCase()}</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
                ` : ""}
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-base"><i class="fas fa-triangle-exclamation"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-rose-500">Perlu Perhatian</p>
                        <p id="dash-stat-perhatian-count" class="text-2xl font-black text-rose-600 leading-tight">${getAttentionStudentCount()}</p>
                        <p class="text-[11px] text-slate-400">${labelSiswa} yang perlu perhatian</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
            `;
        } else {
            renderSiswaStatusCard();
        }
    }

    applyDashboardRoleTexts();
    if (role === "siswa") {
        renderSiswaDashboardParts();
        if (typeof muatMisiHariIni === "function") muatMisiHariIni();
    }

    ucapanMaskotDashboard();

    if (isBK) return;

    apiCall("getDashboardData", {}, false).then(res => {
        if (res && res.status === "success") {
            if (role !== "siswa") renderPrioritySection(res.data.priority_list);
            ucapanAgenda = scopeBySiswaId(res.data.agenda_list, a => a.siswa_id) || [];
            ucapanPerKelas = Array.isArray(res.data.per_kelas) ? res.data.per_kelas : null;
            renderAgendaSection(res.data.agenda_list);
            if (roleAsli === "kepsek") renderRingkasanKelas(res.data.per_kelas);
            if (roleAsli === "admin" && typeof renderBackupBannerDashboard === "function") renderBackupBannerDashboard(res.data.backup);
            checkStudentNotifications();
        }
    });
}

function getAttentionStudentCount() {
    const list = appState.currentNotifications || [];
    return new Set(list.map(n => String(n.siswa && n.siswa.id))).size;
}

function applyDashboardRoleTexts() {
    const isSiswa = appState.user && appState.user.role === "siswa";
    const title = document.getElementById("dash-bottom-title");
    const sub = document.getElementById("dash-bottom-subtitle");
    const link = document.getElementById("dash-priority-link");
    if (title) title.textContent = isSiswa ? "Perlu Perhatian Saya" : "Perlu Perhatian Khusus";
    if (sub) {
        sub.classList.toggle("lg:block", !isSiswa);
        if (!isSiswa) {
            const nama = appState.user && appState.user.role === "admin" ? "siswa" : getLabelSiswa().toLowerCase();
            sub.textContent = `Beberapa ${nama} membutuhkan perhatian lebih.`;
        }
    }
    if (link) link.setAttribute("onclick", isSiswa ? "openNotificationModal()" : "switchView('siswa')");
}

function renderSiswaDashboardParts() {
    renderSiswaStatusCard();
    renderSiswaHome();
    renderPrioritySectionSiswa();
}

function renderSiswaStatusCard() {
    const statsContainer = document.getElementById("dash-stats-container");
    if (!statsContainer || !appState.user || appState.user.role !== "siswa") return;
    statsContainer.innerHTML = "";
}

function sdMine(list) {
    const uid = String(appState.user.id);
    return (list || []).filter(x => String(x.siswa_id) === uid);
}
function sdTgl(x) { return String((x && x.tanggal) || "").slice(0, 10); }
function sdAddDays(ymd, n) {
    const d = new Date(ymd + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
function sdSapaan() {
    const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Makassar", hour: "2-digit", hour12: false }).format(new Date())) % 24;
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
}
function sdCard(title, body, link) {
    const l = link ? `<button type="button" class="sd-link" onclick="switchView('${link[0]}')">${link[1]} <i class="fas fa-chevron-right text-[9px]"></i></button>` : "";
    return `<div class="sd-card"><div class="sd-title"><span>${title}</span>${l}</div>${body}</div>`;
}
function sdTanggalKebiasaan() {
    const set = {};
    sdMine(appState.kebiasaan).forEach(k => {
        if (k.status === "Sudah") { const t = sdTgl(k); set[t] = (set[t] || 0) + 1; }
    });
    return set;
}

function sdSapaanCard(u) {
    const kls = (appState.kelas || []).find(k => String(k.id) === String(u.kelas_id));
    const wali = kls ? (appState.guru || []).find(g => String(g.id) === String(kls.guru_id)) : null;
    const mentor = u.mentor_id ? (appState.guru || []).find(g => String(g.id) === String(u.mentor_id)) : null;
    const foto = escapeHtml(u.foto || getInitialsAvatar(u.nama));
    return `<div class="sd-greet">
        <img src="${foto}" alt="">
        <div class="min-w-0">
            <h3>${sdSapaan()}, ${escapeHtml(getFirstName(u.nama) || "Kamu")}!</h3>
            ${renderInfoRows([{ label: "Kelas", value: kls ? kls.nama_kelas : "-" }, { label: "Wali", value: wali ? wali.nama : "-" }, { label: "Mentor", value: mentor ? mentor.nama : "-" }])}
        </div></div>`;
}

function sdMisiCard(today) {
    const total = (typeof MASTER_KEBIASAAN !== "undefined" && MASTER_KEBIASAAN.length) || 7;
    const sudah = sdMine(appState.kebiasaan).filter(k => sdTgl(k) === today && k.status === "Sudah").length;
    const jurnal = sdMine(appState.jurnal).some(j => sdTgl(j) === today);
    const tugas = [
        { ok: sudah >= total, label: "Isi kebiasaan harian", info: `${Math.min(sudah, total)}/${total}`, view: "kebiasaan" },
        { ok: jurnal, label: "Tulis jurnal hari ini", info: jurnal ? "Selesai" : "Belum", view: "jurnal" }
    ];
    const poin = Math.min(sudah / total, 1) + (jurnal ? 1 : 0);
    const pct = Math.round(poin / tugas.length * 100);
    const rows = tugas.map(t => `<button type="button" class="sd-task ${t.ok ? "done" : ""}" onclick="switchView('${t.view}')">
        <span><i class="fas ${t.ok ? "fa-circle-check" : "fa-circle"} mr-1.5"></i>${t.label}</span><small>${t.info}</small></button>`).join("");
    return sdCard("Misi Hari Ini", `<div class="sd-mission"><div class="sd-ring" style="--p:${pct}"><span>${pct}%</span></div>
        <p class="sd-note" style="margin:0">${pct >= 100 ? "Hebat! Semua misi hari ini selesai." : "Yuk selesaikan misimu hari ini!"}</p>${maskot(pct >= 100 ? "piala" : "pengingat", 72)}</div>${rows}`);
}

function sdHitungStreak(today) {
    const set = sdTanggalKebiasaan();
    let t = set[today] ? today : sdAddDays(today, -1);
    let n = 0;
    while (set[t]) { n++; t = sdAddDays(t, -1); }
    const ring = typeof kebiasaanRingkasan !== "undefined" ? (kebiasaanRingkasan[String(appState.user.id)] || {}).data : null;
    const server = ring && Number(ring.streak) > 0 ? Number(ring.streak) : 0;
    return Math.max(n, server);
}
function sdBadgeCard(today, absBulan, hafalan) {
    const streak = sdHitungStreak(today);
    const hadirPenuh = absBulan.length > 0 && absBulan.every(a => a.status === "H" || a.status === "T");
    const lancar = hafalan.filter(h => h.status === "Lancar").length;
    const badges = [
        { ok: streak >= 7, icon: "fa-fire", text: "7 Hari Konsisten" },
        { ok: hadirPenuh, icon: "fa-calendar-check", text: "Hadir Penuh Bulan Ini" },
        { ok: lancar >= 3, icon: "fa-book-quran", text: "Hafalan Lancar" }
    ].map(b => `<span class="sd-badge ${b.ok ? "" : "off"}"><i class="fas ${b.icon}"></i>${b.text}</span>`).join("");
    const body = `<div style="display:flex;align-items:center;gap:.5rem"><div style="flex:1;min-width:0"><p class="text-sm font-black text-slate-800"><i class="fas fa-fire text-orange-500 mr-1"></i>${streak} hari berturut-turut</p>
        <p class="sd-note" style="margin:0.125rem 0 0.5rem">${streak > 0 ? "Pertahankan semangatmu!" : "Isi kebiasaan hari ini untuk mulai streak."}</p></div>${streak > 0 ? maskot("semangat", 72) : ""}</div>
        <div class="sd-badges">${badges}</div>`;
    return sdCard("Streak & Badge", body);
}

function sdTrenCard(today) {
    const total = (typeof MASTER_KEBIASAAN !== "undefined" && MASTER_KEBIASAAN.length) || 7;
    const set = sdTanggalKebiasaan();
    const hari = [];
    for (let i = 13; i >= 0; i--) hari.push(sdAddDays(today, -i));
    const nilai = hari.map(t => Math.min((set[t] || 0) / total, 1));
    const jum = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const lalu = jum(nilai.slice(0, 7)), kini = jum(nilai.slice(7));
    const selisih = Math.round((kini - lalu) * 100);
    const pesan = selisih > 0 ? `Naik ${selisih}% dibanding minggu lalu. Keren!` : selisih < 0 ? "Minggu ini sedikit turun. Ayo semangat lagi!" : "Stabil seperti minggu lalu.";
    const bars = nilai.slice(7).map((v, i) => `<div class="${i === 6 ? "now" : ""}" style="height:${Math.max(v * 100, 3)}%"></div>`).join("");
    const lbl = hari.slice(7).map(t => `<span>${t.slice(8)}</span>`).join("");
    return sdCard("Tren Kebiasaan 7 Hari", `<p class="text-sm font-black text-slate-800">${Math.round(kini * 100)}% <span class="text-xs font-semibold text-slate-400">minggu ini</span></p>
        <div class="sd-trend">${bars}</div><div class="sd-trend-lbl">${lbl}</div><p class="sd-note">${pesan}</p>`, ["kebiasaan", "Detail"]);
}

function sdHadirCard(absBulan) {
    const c = { H: 0, S: 0, I: 0, A: 0, T: 0 };
    absBulan.forEach(a => { if (c[a.status] !== undefined) c[a.status]++; });
    const hadir = c.H + c.T;
    const pct = absBulan.length ? Math.round(hadir / absBulan.length * 100) : 0;
    const sisa = Math.max(3 - c.A, 0);
    const body = absBulan.length
        ? `<p class="text-sm font-black text-slate-800">${pct}% <span class="text-xs font-semibold text-slate-400">hadir bulan ini</span></p>
           <div class="sd-bar"><i style="width:${pct}%"></i></div>
           <div class="sd-stat"><div><b>${c.S}</b>Sakit</div><div><b>${c.I}</b>Izin</div><div><b>${c.A}</b>Alpa</div></div>
           <p class="sd-note">Sisa kuota Alpa: <b>${sisa}</b> dari 3.</p>`
        : `<p class="sd-note">Belum ada data kehadiran bulan ini.</p>`;
    return sdCard("Kehadiran Bulan Ini", body, ["absensi", "Detail"]);
}

function sdNilaiCard(nilai) {
    if (!nilai.length) return sdCard("Ringkasan Nilai", `<p class="sd-note">Belum ada data nilai.</p>`, ["karakter", "Detail"]);
    const tertinggi = nilai.reduce((a, b) => Number(b.nilai_akhir) > Number(a.nilai_akhir) ? b : a);
    const bawah = nilai.filter(n => Number(n.nilai_akhir) < Number(n.kktp)).length;
    const tuntas = nilai.length - bawah;
    const pct = Math.round(tuntas / nilai.length * 100);
    const info = bawah > 0 ? `${bawah} mapel perlu ditingkatkan` : "Semua mapel sudah tuntas. Mantap!";
    return sdCard("Ringkasan Nilai", `<p class="text-xs text-slate-500">Tertinggi: <b class="text-slate-800">${escapeHtml(tertinggi.mapel)}</b> (${escapeHtml(String(tertinggi.nilai_akhir))})</p>
        <div class="sd-bar"><i style="width:${pct}%"></i></div><p class="sd-note">${info}</p>`, ["karakter", "Detail"]);
}

function sdHafalanCard(hafalan) {
    if (!hafalan.length) return sdCard("Progres Hafalan", `<p class="sd-note">Belum ada catatan hafalan.</p>`, ["karakter", "Detail"]);
    const terakhir = hafalan.slice().sort((a, b) => sdTgl(b).localeCompare(sdTgl(a)))[0];
    const lancar = hafalan.filter(h => h.status === "Lancar").length;
    return sdCard("Progres Hafalan", `<p class="text-sm font-black text-slate-800">${escapeHtml(terakhir.nama_surat || "-")}</p>
        ${renderInfoRows([{ label: "Status", value: terakhir.status || "-" }, { label: "Lancar", value: lancar + " capaian" }])}`, ["karakter", "Detail"]);
}

function sdPrestasiCard(prestasi) {
    if (!prestasi.length) return sdCard("Prestasi Terbaru", `<p class="sd-note">Belum ada prestasi tercatat. Terus berusaha!</p>`, ["karakter", "Detail"]);
    const list = prestasi.slice().sort((a, b) => sdTgl(b).localeCompare(sdTgl(a))).slice(0, 3);
    const tl = list.map(p => `<div>${escapeHtml(p.nama_prestasi || "-")}<small>${escapeHtml(p.tingkat || "")} ${escapeHtml(sdTgl(p))}</small></div>`).join("");
    return sdCard("Prestasi Terbaru", `<div class="sd-tl">${tl}</div>`, ["karakter", "Detail"]);
}

let misiTerakhirMuat = 0;
let misiSedangMuat = null;
const MISI_TTL_MS = 30000;

function muatMisiHariIni(force = false) {
    const u = appState.user;
    if (!u || u.role !== "siswa") return Promise.resolve();
    if (misiSedangMuat) return misiSedangMuat;

    const uid = String(u.id);
    const butuhRingkasan = typeof kebiasaanRingkasan !== "undefined" && !kebiasaanRingkasan[uid];
    if (!force && !butuhRingkasan && (Date.now() - misiTerakhirMuat) < MISI_TTL_MS) return Promise.resolve();

    misiSedangMuat = (async () => {
        try {
            const today = getDateWITA();
            const dari = sdAddDays(today, -60);
            const aman = p => p.catch(() => null);
            const antreanKebiasaan = typeof pendingKebiasaanQueue !== "undefined" && pendingKebiasaanQueue.size > 0;

            const [resKeb, resJur, resKag, resRing] = await Promise.all([
                antreanKebiasaan ? null : aman(apiCall("getKebiasaan", { tanggal: today }, false, 2, true)),
                aman(apiCall("getJurnal", { siswa_id: uid, dari, sampai: today }, false, 2, true)),
                aman(apiCall("getKeagamaan", { siswa_id: uid }, false, 2, true)),
                aman(apiCall("getRingkasanKebiasaan", { siswa_id: uid }, false, 2, true))
            ]);

            if (!appState.user || String(appState.user.id) !== uid) return;

            let berhasil = false;

            if (resKeb && resKeb.status === "success" && Array.isArray(resKeb.data)) {
                const dateInput = document.getElementById("kebiasaan-date");
                const tglTampil = dateInput ? dateInput.value : "";
                if (!tglTampil || tglTampil === today) {
                    appState.kebiasaan = resKeb.data;
                    if (typeof kebiasaanLoadedTanggal !== "undefined") kebiasaanLoadedTanggal = today;
                    lastFetchTimes.kebiasaan = Date.now();
                }
                berhasil = true;
            }
            if (resJur && resJur.status === "success" && Array.isArray(resJur.data)) {
                appState.jurnal = resJur.data;
                lastFetchTimes.jurnal = Date.now();
                berhasil = true;
            }
            if (resKag && Array.isArray(resKag.data)) {
                appState.keagamaan = resKag.data;
                lastFetchTimes.keagamaan = Date.now();
            }
            if (resRing && resRing.status === "success" && resRing.data && typeof kebiasaanRingkasan !== "undefined") {
                kebiasaanRingkasan[uid] = { data: resRing.data, waktu: Date.now() };
            }

            if (berhasil) misiTerakhirMuat = Date.now();
            saveAppStateToLocal();
            renderSiswaHome();
        } catch (e) {
            console.error("muatMisiHariIni gagal:", e);
        } finally {
            misiSedangMuat = null;
        }
    })();
    return misiSedangMuat;
}

function renderSiswaHome() {
    const el = document.getElementById("dash-siswa-home");
    if (!el || !appState.user || appState.user.role !== "siswa") return;
    const u = appState.user;
    const today = getDateWITA();
    const bulan = today.slice(0, 7);
    const absBulan = sdMine(appState.absensi).filter(a => sdTgl(a).startsWith(bulan));
    const hafalan = sdMine(appState.keagamaan).filter(h => h.nama_surat);
    const nilai = akdFilterSemester(sdMine(appState.akademik).filter(n => n.mapel));
    const prestasi = sdMine(appState.prestasi);
    el.innerHTML = [
        sdSapaanCard(u),
        sdMisiCard(today),
        sdBadgeCard(today, absBulan, hafalan),
        typeof ttKartuBerandaHtml === "function" ? ttKartuBerandaHtml() : "",
        `<div class="sd-grid2">${sdHadirCard(absBulan)}${sdNilaiCard(nilai)}</div>`,
        sdTrenCard(today),
        `<div class="sd-grid2">${sdHafalanCard(hafalan)}${sdPrestasiCard(prestasi)}</div>`
    ].join("");
    if (typeof tatibMuatSaya === "function") tatibMuatSaya();
}

function renderPrioritySectionSiswa() {
    const container = document.getElementById("dash-priority-container");
    if (!container || !appState.user || appState.user.role !== "siswa") return;

    if (!appState.notificationsReady) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-circle-notch fa-spin text-slate-300 text-xl mb-2"></i>
            <p class="text-xs text-slate-400">Memeriksa data kamu...</p>
          </div>`;
        return;
    }

    const list = appState.currentNotifications || [];
    const namaDepan = escapeHtml(getFirstName(appState.user.nama) || "Kamu");

    if (list.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-check-circle text-emerald-500 text-2xl mb-2"></i>
            <p class="text-xs text-slate-500"><b class="text-slate-700">${namaDepan}</b>, kondisimu baik. Tidak ada indikator perhatian aktif.</p>
          </div>`;
        return;
    }

    const levelStyle = {
        kritis: { border: "border-rose-100", badge: "bg-rose-600 text-white", text: "KRITIS", icon: "text-rose-500" },
        sedang: { border: "border-amber-100", badge: "bg-amber-500 text-white", text: "SEDANG", icon: "text-amber-500" },
        rendah: { border: "border-blue-100", badge: "bg-blue-500 text-white", text: "PENGAWASAN", icon: "text-blue-500" }
    };
    const MAX_SHOWN = 4;
    const shown = list.slice(0, MAX_SHOWN);

    let html = shown.map(n => {
        const st = levelStyle[n.level] || levelStyle.rendah;
        return `
          <button type="button" onclick="openNotificationModal()" class="w-full text-left bg-white p-3.5 rounded-2xl border ${st.border} shadow-sm space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">${escapeHtml(n.category || "")}</span>
              <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded shrink-0 ${st.badge}">${st.text}</span>
            </div>
            <h4 class="font-bold text-xs text-slate-800 flex items-start gap-1.5"><i class="fas fa-exclamation-triangle mt-0.5 ${st.icon}"></i><span class="min-w-0">${escapeHtml(n.title)}</span></h4>
            <p class="text-xs text-slate-500 leading-relaxed">${escapeHtml(n.desc)}</p>
          </button>`;
    }).join("");

    if (list.length > MAX_SHOWN) {
        html += `<p class="text-center text-xs text-slate-400 pt-1">+${list.length - MAX_SHOWN} indikator lainnya. Tekan "Lihat Semua".</p>`;
    }
    container.innerHTML = html;
}

function renderPrioritySection(priorityList) {
    const container = document.getElementById("dash-priority-container");
    if (!container) return;

    priorityList = (priorityList || []).filter(item => isSiswaInPeran(item.siswa));
    const namaSiswa = appState.user && appState.user.role === "admin" ? "siswa" : getLabelSiswa().toLowerCase();

    if (priorityList.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            ${maskot("ceria", 96)}
            <p class="text-xs text-slate-500">Semua ${namaSiswa} dalam kondisi baik. Tidak ada indikator perhatian aktif.</p>
          </div>
        `;
        return;
    }

    container.innerHTML = priorityList.map(item => {
        const s = item.siswa;
        const indicatorsHtml = item.indicators.map(ind => `
          <span class="inline-flex items-center gap-1 text-xs font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
            <i class="fas fa-exclamation-triangle text-xs"></i> ${escapeHtml(ind.pesan)}
          </span>
        `).join(" ");

        return `
          <div class="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img src="${escapeHtml(s.foto || getInitialsAvatar(s.nama))}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                <div>
                  <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)} <span class="ml-1">${renderPeranChip(s)}</span></h4>
                  <p class="text-xs text-slate-400">NISN: ${escapeHtml(s.nisn || '-')} | Ortu: ${escapeHtml(normalizePhone(s.no_hp_ortu) || '-')}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="openProfilSiswa('${escapeHtml(s.id)}')" class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 text-xs" aria-label="Lihat profil siswa">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="hubungiOrtu('${escapeHtml(s.id)}')" class="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 text-xs" aria-label="Hubungi orang tua via WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-1 pt-1 border-t border-slate-50">
              ${indicatorsHtml}
            </div>
          </div>
        `;
    }).join("");
}

function renderAgendaSection(agendaList) {
    const container = document.getElementById("dash-agenda-list");
    if (!container) return;

    agendaList = scopeBySiswaId(agendaList, a => a.siswa_id);

    if (!agendaList || agendaList.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            ${maskot("pengingat", 96)}
            <p class="text-xs text-slate-500 font-semibold">Belum ada agenda pembinaan yang akan datang.</p>
            <p class="text-[11px] text-slate-400 mt-1">Agenda akan muncul di sini setelah dijadwalkan.</p>
          </div>
        `;
        return;
    }

    container.innerHTML = agendaList.map(ag => `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div>
              <h4 class="font-bold text-xs text-slate-800">${escapeHtml(ag.nama_siswa)}</h4>
              ${renderInfoRows([{label:"Jenis",value:ag.jenis},{label:"Masalah",value:ag.permasalahan || "-"}])}
            </div>
          </div>
          <span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100">
            ${escapeHtml(ag.jadwal_pantau)}
          </span>
        </div>
    `).join("");
}

let pendingPembinaanNotif = null;

function saveNotifDitangani(n, extra = {}) {
    return apiCall("setNotifDitangani", {
        notif_id: n.id,
        siswa_id: n.siswa.id,
        level: n.level,
        kategori: n.category,
        judul: n.title,
        ...extra
    }, false);
}

async function dismissNotification(notifId) {
    const n = (appState.currentNotifications || []).find(x => String(x.id) === String(notifId));
    if (!n) return;

    const { isConfirmed, value } = await Swal.fire({
        title: 'Tandai Sudah Ditangani?',
        text: `${n.siswa.nama} — ${n.title}`,
        input: 'text',
        inputPlaceholder: 'Catatan singkat (opsional)',
        inputAttributes: { maxlength: 300 },
        showCancelButton: true,
        confirmButtonText: 'Ya, Tandai',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#059669'
    });
    if (!isConfirmed) return;

    showLoading("Menyimpan...");
    const res = await saveNotifDitangani(n, { catatan: (value || '').trim(), sumber: 'manual' });
    hideLoading();

    await checkStudentNotifications();
    openNotificationModal('active');

    if (res && res.status === "success") {
        showToast("Dipindahkan ke 'Sudah Ditangani'. Muncul lagi setelah masa tunda berakhir, kecuali sudah ada catatan pembinaan yang berjalan.", "info");
    } else {
        showToast(res?.message || "Gagal menandai notifikasi. Coba lagi.", "warning");
    }
}

async function restoreNotification(notifId) {
    showLoading("Membuka kembali...");
    const res = await apiCall("restoreNotifDitangani", { notif_id: notifId }, false);
    hideLoading();

    if (!res || res.status !== "success") {
        showToast(res?.message || "Gagal membuka kembali notifikasi.", "warning");
        return;
    }

    await checkStudentNotifications();
    openNotificationModal('handled');
    showToast("Notifikasi dikembalikan ke daftar 'Perlu Tindakan'.", "info");
}

function setPendingPembinaanNotif(notifId, siswaId) {
    pendingPembinaanNotif = notifId ? { notifId: notifId, siswaId: siswaId } : null;
}

async function markNotifHandledByPembinaan(siswaId, pembinaanId) {
    const p = pendingPembinaanNotif;
    pendingPembinaanNotif = null;
    if (!p || String(p.siswaId) !== String(siswaId)) return;

    const n = (appState.currentNotifications || []).find(x => String(x.id) === String(p.notifId));
    if (!n) return;
    await saveNotifDitangani(n, { sumber: 'pembinaan', pembinaan_id: pembinaanId });
}

function renderHandledInfo(n) {
    const h = n.handledBy || {};
    const isSelf = String(h.ditangani_oleh_id) === String(appState.user.id);
    const roleLabel = ({ admin: 'Admin', mentor: 'Mentor' })[String(h.ditangani_oleh_role || '').toLowerCase()] || 'Wali';
    const oleh = isSelf ? 'Anda' : `${escapeHtml(h.ditangani_oleh_nama || '-')} (${roleLabel})`;
    const via = h.sumber === 'pembinaan' ? 'Ditindaklanjuti lewat catatan pembinaan' : 'Ditangani';
    return `<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100"><i class="fas fa-check text-[9px]"></i> ${via} oleh ${oleh} · ${formatTimeAgo(n.dismissedAt)}</span>`;
}

function canRestoreNotif() {
    return !!(appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru'));
}

function renderHandledNote(n) {
    const catatan = n.handledBy && n.handledBy.catatan;
    if (!catatan) return '';
    return `<p class="text-[11px] text-slate-500 italic">Catatan: ${escapeHtml(catatan)}</p>`;
}

let notifSigTerakhir = null;
let notifHasilServer = null;
let notifIdDikenal = null;
let notifNomorMinta = 0;
let notifNomorTerapan = 0;

async function checkStudentNotifications(opsi = {}) {
    if (!appState.user || appState.user.role === 'ortu') return;

    const nomor = ++notifNomorMinta;
    const res = await apiCall("getNotifikasi", { sig: notifSigTerakhir }, false, 1, true);
    if (nomor < notifNomorTerapan) return;

    if (res && res.status === "success") {
        if (!res.tidak_berubah && res.data) {
            notifHasilServer = res.data;
            notifSigTerakhir = res.sig || null;
        }
    } else if (!notifHasilServer) {
        notifHasilServer = { perlu_tindakan: [], ditangani: [], tatib: null };
    }
    if (!notifHasilServer) return;

    notifNomorTerapan = nomor;
    terapkanNotifikasi(notifHasilServer, opsi);
}

function terapkanNotifikasi(hasil, opsi) {
    const isSiswa = appState.user.role === 'siswa';
    const peranIds = isGuruUser() ? new Set(getSiswaPeran().map(s => String(s.id))) : null;
    const dalamPeran = n => !peranIds || peranIds.has(String(n.siswa.id));

    const activeList = (hasil.perlu_tindakan || []).filter(dalamPeran);
    const handledList = (hasil.ditangani || []).filter(dalamPeran);

    const idSekarang = new Set((hasil.perlu_tindakan || []).map(n => String(n.id)));
    const baru = (opsi && opsi.umumkan && notifIdDikenal)
        ? activeList.filter(n => !notifIdDikenal.has(String(n.id)))
        : [];
    notifIdDikenal = idSekarang;

    appState.currentNotifications = activeList;
    appState.handledNotifications = handledList;

    const badge = document.getElementById("notif-badge");
    if (badge) {
        if (activeList.length > 0) {
            badge.innerText = activeList.length;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    updateSidebarBadge();
    appState.notificationsReady = true;

    const statCount = document.getElementById("dash-stat-perhatian-count");
    if (statCount) statCount.innerText = getAttentionStudentCount();

    if (isSiswa) renderSiswaDashboardParts();
    ucapanTatib = hasil.tatib || null;
    if (typeof tatibRenderStatusDashboard === 'function') tatibRenderStatusDashboard(hasil.tatib || null);

    if (!isSiswa && baru.length > 0) {
        showToast(`${baru.length} catatan siswa baru ditemukan!`, "warning");
        const kritisBaru = baru.filter(n => n.level === 'kritis').length;
        if (kritisBaru > 0) {
            sendWebPushNotification(
                "⚠️ Perhatian Khusus Siswa",
                `Terdapat ${kritisBaru} catatan siswa baru dengan tingkat keparahan KRITIS membutuhkan tindakan segera.`
            );
        }
    }
}

function openNotificationModal(activeTab = 'active', selectedKelasId = '') {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const isCanManageNotif = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru');

    let activeList = appState.currentNotifications || [];
    let handledList = appState.handledNotifications || [];

    selectedKelasId = getEffectiveKelasFilter(selectedKelasId);

    if (selectedKelasId) {
        activeList = activeList.filter(n => {
            const s = appState.siswa.find(x => String(x.id) === String(n.siswa.id));
            return s && String(s.kelas_id) === String(selectedKelasId);
        });
        handledList = handledList.filter(n => {
            const s = appState.siswa.find(x => String(x.id) === String(n.siswa.id));
            return s && String(s.kelas_id) === String(selectedKelasId);
        });
    }

    const currentList = activeTab === 'active' ? activeList : handledList;

    const kelasOptions = renderKelasSelectOptions(selectedKelasId, { allLabel: "Semua Kelas", prefix: "Kelas " });
    const kelasDisabledAttr = isKelasSelectLocked() ? "disabled" : "";

    const getLevelBadge = (level) => {
        if (level === 'kritis') return '<span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-rose-600 text-white animate-pulse">KRITIS</span>';
        if (level === 'sedang') return '<span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-500 text-white">SEDANG</span>';
        return '<span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-blue-500 text-white">PENGAWASAN</span>';
    };

    const getCardStyle = (level, isHandled) => {
        if (isHandled) return 'bg-slate-50 border-slate-200 opacity-90';
        if (level === 'kritis') return 'bg-rose-50/70 border-rose-200';
        if (level === 'sedang') return 'bg-amber-50/70 border-amber-200';
        return 'bg-blue-50/70 border-blue-200';
    };

    box.innerHTML = `
        <div class="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <i class="fas fa-bell text-amber-500"></i> Notifikasi Sistem
                </h3>
            </div>
            <div class="flex items-center gap-2">
                ${isCanManageNotif ? `
                <button onclick="requestNotificationPermission()" title="Aktifkan Notifikasi Perangkat" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 font-bold flex items-center gap-1">
                    <i class="fas fa-mobile-alt"></i> Push
                </button>` : ''}
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup"><i class="fas fa-times"></i></button>
            </div>
        </div>

        ${isCanManageNotif ? `
        <div class="space-y-2 mb-3">
            <div>
                <select onchange="openNotificationModal('${activeTab}', this.value)" ${kelasDisabledAttr} class="w-full bg-slate-100 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none text-slate-700 disabled:opacity-70 disabled:cursor-not-allowed">
                    ${kelasOptions}
                </select>
            </div>
            <div class="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button onclick="openNotificationModal('active', '${selectedKelasId}')"
                    class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
                    Perlu Tindakan (${activeList.length})
                </button>
                <button onclick="openNotificationModal('handled', '${selectedKelasId}')"
                    class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'handled' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
                    Sudah Ditangani (${handledList.length})
                </button>
            </div>
        </div>
        ` : ''}

        <div class="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            ${currentList.length === 0 ? `
                <div class="empty-state">
                    ${activeTab === 'active' ? maskot("ceria", 96) : maskot("notifikasi", 96)}
                    <p class="text-xs font-bold text-slate-700">
                        ${activeTab === 'active' ? 'Tidak Ada Notifikasi Baru' : 'Belum Ada Notifikasi Ditandai'}
                    </p>
                    <p class="text-[11px] text-slate-400 mt-0.5">
                        ${activeTab === 'active' ? 'Semua indikator pemantauan terpantau baik.' : 'Notifikasi yang ditandai akan tersimpan di sini.'}
                    </p>
                </div>
            ` : currentList.map(n => `
                <div class="p-3.5 rounded-2xl border ${getCardStyle(n.level, activeTab === 'handled')} shadow-sm space-y-2.5">
                    <div class="flex justify-between items-start gap-2">
                        <div>
                            <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                                ${getLevelBadge(n.level)}
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">${escapeHtml(n.category)}</span>
                                ${activeTab === 'handled' ? renderHandledInfo(n) : ''}
                            </div>
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(n.siswa.nama)} ${renderPeranChip((appState.siswa || []).find(x => String(x.id) === String(n.siswa.id)))} — <span class="text-slate-700 font-semibold">${escapeHtml(n.title)}</span></h4>
                        </div>

                        ${isCanManageNotif ? (
            activeTab === 'active' ? `
                                <button onclick="dismissNotification('${n.id}')" title="Tandai Sudah Ditangani (disembunyikan sementara)" aria-label="Tandai sudah ditangani" class="text-slate-400 hover:text-emerald-600 p-1 shrink-0">
                                    <i class="fas fa-check-circle text-lg"></i>
                                </button>
                            ` : (canRestoreNotif(n) ? `
                                <button onclick="restoreNotification('${n.id}')" title="Kembalikan ke Daftar Perlu Tindakan" class="text-slate-400 hover:text-blue-600 p-1 shrink-0 flex items-center gap-1 text-xs font-bold">
                                    <i class="fas fa-undo text-sm"></i> Buka Lagi
                                </button>
                            ` : `
                                <span class="text-[10px] text-slate-400 shrink-0" title="Ditandai oleh wali kelas atau admin"><i class="fas fa-lock"></i> Dikunci</span>
                            `)
        ) : ''}
                    </div>

                    <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(n.desc)}</p>
                    ${activeTab === 'handled' ? renderHandledNote(n) : ''}

                    <div class="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 flex-wrap">
                        <button onclick="closeModal(); openProfilSiswa('${n.siswa.id}')" class="px-2.5 py-1.5 bg-white text-slate-700 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-100 flex items-center gap-1">
                            <i class="fas fa-user text-blue-500"></i> Profil ${appState.user.role === 'siswa' ? 'Saya' : ''}
                        </button>

                        ${isCanManageNotif ? `
                        <button onclick="hubungiOrtu('${n.siswa.id}')" class="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 flex items-center gap-1">
                            <i class="fab fa-whatsapp"></i> WA Ortu
                        </button>
                        <button onclick="openPembinaanDariNotif('${escapeHtml(String(n.id))}')" class="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700 flex items-center gap-1">
                            <i class="fas fa-edit"></i> Buat Catatan Pembinaan
                        </button>
                        ${n.tatibTahap && typeof tatibBisaCatatPanggilan === 'function' && tatibBisaCatatPanggilan(n.siswa.id) ? `
                        <button onclick="closeModal(); openModalTatibPanggilan('${n.siswa.id}', '${n.tatibTahap}')" class="px-2.5 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-violet-700 flex items-center gap-1">
                            <i class="fas fa-phone"></i> Catat Panggilan Ortu
                        </button>` : ''}
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

function renderRingkasanKelas(list) {
    const box = document.getElementById("dash-kelas-list");
    if (!box) return;
    if (!list || list.length === 0) {
        box.innerHTML = `<p class="text-xs text-slate-400">Belum ada data kelas.</p>`;
        return;
    }
    const kartuHtml = list.map(k => {
        const pct = k.total > 0 ? Math.round((k.hadir / k.total) * 100) : 0;
        const warna = (k.belum_diisi >= k.total) ? ["text-slate-500", "bg-slate-200"]
            : (pct >= 75 ? ["text-emerald-700", "bg-emerald-500"]
                : (pct >= 40 ? ["text-amber-700", "bg-amber-500"] : ["text-rose-600", "bg-rose-500"]));
        return `
        <div class="p-3 rounded-xl border border-slate-100 bg-white">
            <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(k.nama_kelas)}</p>
                    ${renderInfoRows([{label:"Wali",value:k.wali || "-"},{label:"Siswa",value:k.total + " siswa"}])}
                </div>
                <span class="text-base font-black ${warna[0]} shrink-0">${pct}%</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div class="h-full ${warna[1]}" style="width:${pct}%"></div>
            </div>
            <div class="sd-stat" style="flex-wrap:wrap"><div><b>${k.hadir}</b>Hadir</div><div><b>${k.sakit}</b>Sakit</div><div><b>${k.izin}</b>Izin</div><div><b>${k.alpa}</b>Alpa</div><div><b>${k.belum_diisi}</b>Belum diisi</div>${k.perlu_perhatian ? `<div style="background:#fff1f2;color:#e11d48"><b style="color:#e11d48">${k.perlu_perhatian}</b>Perlu perhatian</div>` : ""}</div>
        </div>`;
    }).join("");
    const jml = { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0, belum: 0, perhatian: 0 };
    const barisHtml = list.map((k, i) => {
        const pct = k.total > 0 ? Math.round((k.hadir / k.total) * 100) : 0;
        const warna = (k.belum_diisi >= k.total) ? ["text-slate-500", "bg-slate-200"]
            : (pct >= 75 ? ["text-emerald-700", "bg-emerald-500"]
                : (pct >= 40 ? ["text-amber-700", "bg-amber-500"] : ["text-rose-600", "bg-rose-500"]));
        jml.total += k.total || 0; jml.hadir += k.hadir || 0; jml.sakit += k.sakit || 0;
        jml.izin += k.izin || 0; jml.alpa += k.alpa || 0; jml.belum += k.belum_diisi || 0; jml.perhatian += k.perlu_perhatian || 0;
        return `
            <tr>
                <td class="tt-no">${i + 1}</td>
                <th scope="row" class="tt-nama">${escapeHtml(k.nama_kelas)}</th>
                <td>${escapeHtml(k.wali || "-")}</td>
                <td class="tt-tengah">${k.total}</td>
                <td class="tt-tengah">${k.hadir}</td>
                <td class="tt-tengah">${k.sakit}</td>
                <td class="tt-tengah">${k.izin}</td>
                <td class="tt-tengah">${k.alpa}</td>
                <td class="tt-tengah">${k.belum_diisi}</td>
                <td class="tt-tengah">${k.perlu_perhatian ? `<span class="font-bold text-rose-600">${k.perlu_perhatian}</span>` : '<span class="text-slate-300">0</span>'}</td>
                <td class="tt-poin"><span class="font-black ${warna[0]}">${pct}%</span><div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div class="h-full ${warna[1]}" style="width:${pct}%"></div></div></td>
            </tr>`;
    }).join("");
    const pctTotal = jml.total > 0 ? Math.round((jml.hadir / jml.total) * 100) : 0;
    const tabelHtml = `
        <div class="tt-tabel-wrap tt-tinggi">
            <table class="tt-tabel">
                <caption class="sr-only">Ringkasan presensi per kelas hari ini</caption>
                <thead><tr>
                    <th scope="col" class="tt-no">No</th>
                    <th scope="col" class="tt-nama">Kelas</th>
                    <th scope="col">Wali</th>
                    <th scope="col" class="tt-tengah">Siswa</th>
                    <th scope="col" class="tt-tengah">Hadir</th>
                    <th scope="col" class="tt-tengah">Sakit</th>
                    <th scope="col" class="tt-tengah">Izin</th>
                    <th scope="col" class="tt-tengah">Alpa</th>
                    <th scope="col" class="tt-tengah">Belum diisi</th>
                    <th scope="col" class="tt-tengah">Perlu perhatian</th>
                    <th scope="col">% Hadir</th>
                </tr></thead>
                <tbody>${barisHtml}</tbody>
                <tfoot><tr>
                    <td></td>
                    <th scope="row" class="tt-nama">Total</th>
                    <td></td>
                    <td class="tt-tengah">${jml.total}</td>
                    <td class="tt-tengah">${jml.hadir}</td>
                    <td class="tt-tengah">${jml.sakit}</td>
                    <td class="tt-tengah">${jml.izin}</td>
                    <td class="tt-tengah">${jml.alpa}</td>
                    <td class="tt-tengah">${jml.belum}</td>
                    <td class="tt-tengah">${jml.perhatian}</td>
                    <td class="tt-tengah">${pctTotal}%</td>
                </tr></tfoot>
            </table>
        </div>`;
    box.innerHTML = `<div class="tt-kartu-wrap space-y-2">${kartuHtml}</div>` + tabelHtml;
}