async function renderDashboard() {
    if (!appState.user) return;
    const roleAsli = appState.user.role;
    const role = roleAsli === "kepsek" ? "admin" : roleAsli;

    const adminBanner = document.getElementById("dash-admin-banner");
    if (adminBanner) {
        if (roleAsli === "admin") adminBanner.classList.remove("hidden");
        else adminBanner.classList.add("hidden");
    }

    const statsContainer = document.getElementById("dash-stats-container");
    if (statsContainer) {
        const totalSiswaCount = getSiswaPeran().length;
        const labelSiswa = role === 'admin' ? 'Siswa' : getLabelSiswa();
        const hadirHariIni = scopeBySiswaId(appState.absensi, a => a.siswa_id).filter(a => a.status === 'H').length;
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
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-secondary flex items-center justify-center text-base"><i class="fas fa-calendar-check"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-emerald-600">Hadir Hari Ini</p>
                        <p class="text-2xl font-black text-emerald-600 leading-tight">${hadirHariIni}</p>
                        <p class="text-[11px] text-slate-400">Dari ${totalSiswaCount} ${role === 'admin' ? 'siswa' : labelSiswa.toLowerCase()}</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
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
    if (role === "siswa") renderSiswaDashboardParts();

    apiCall("getDashboardData", {}, false).then(res => {
        if (res && res.status === "success") {
            if (role !== "siswa") renderPrioritySection(res.data.priority_list);
            renderAgendaSection(res.data.agenda_list);
            if (roleAsli === "kepsek") renderRingkasanKelas(res.data.per_kelas);
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

/* Kartu status lama diganti kartu-kartu baru di #dash-siswa-home */
function renderSiswaStatusCard() {
    const statsContainer = document.getElementById("dash-stats-container");
    if (!statsContainer || !appState.user || appState.user.role !== "siswa") return;
    statsContainer.innerHTML = "";
}

/* ---------- Helper dashboard siswa ---------- */
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
/* Set tanggal (YYYY-MM-DD) yang punya minimal 1 kebiasaan berstatus Sudah */
function sdTanggalKebiasaan() {
    const set = {};
    sdMine(appState.kebiasaan).forEach(k => {
        if (k.status === "Sudah") { const t = sdTgl(k); set[t] = (set[t] || 0) + 1; }
    });
    return set;
}

/* ---------- A. Sapaan personal ---------- */
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

/* ---------- B. Misi hari ini ---------- */
function sdMisiCard(today) {
    const total = (typeof MASTER_KEBIASAAN !== "undefined" && MASTER_KEBIASAAN.length) || 7;
    const sudah = sdMine(appState.kebiasaan).filter(k => sdTgl(k) === today && k.status === "Sudah").length;
    const jurnal = sdMine(appState.jurnal).some(j => sdTgl(j) === today);
    const ibadah = sdMine(appState.keagamaan).some(j => sdTgl(j) === today);
    const tugas = [
        { ok: sudah >= total, label: "Isi kebiasaan harian", info: `${Math.min(sudah, total)}/${total}`, view: "kebiasaan" },
        { ok: jurnal, label: "Tulis jurnal hari ini", info: jurnal ? "Selesai" : "Belum", view: "jurnal" },
        { ok: ibadah, label: "Catat ibadah hari ini", info: ibadah ? "Selesai" : "Belum", view: "karakter" }
    ];
    const poin = Math.min(sudah / total, 1) + (jurnal ? 1 : 0) + (ibadah ? 1 : 0);
    const pct = Math.round(poin / 3 * 100);
    const rows = tugas.map(t => `<button type="button" class="sd-task ${t.ok ? "done" : ""}" onclick="switchView('${t.view}')">
        <span><i class="fas ${t.ok ? "fa-circle-check" : "fa-circle"} mr-1.5"></i>${t.label}</span><small>${t.info}</small></button>`).join("");
    return sdCard("Misi Hari Ini", `<div class="sd-mission"><div class="sd-ring" style="--p:${pct}"><span>${pct}%</span></div>
        <p class="sd-note" style="margin:0">${pct >= 100 ? "Hebat! Semua misi hari ini selesai." : "Yuk selesaikan misimu hari ini!"}</p></div>${rows}`);
}

/* ---------- C. Streak dan badge ---------- */
function sdHitungStreak(today) {
    const set = sdTanggalKebiasaan();
    let t = set[today] ? today : sdAddDays(today, -1);
    let n = 0;
    while (set[t]) { n++; t = sdAddDays(t, -1); }
    return n;
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
    const body = `<p class="text-sm font-black text-slate-800"><i class="fas fa-fire text-orange-500 mr-1"></i>${streak} hari berturut-turut</p>
        <p class="sd-note" style="margin:0.125rem 0 0.5rem">${streak > 0 ? "Pertahankan semangatmu!" : "Isi kebiasaan hari ini untuk mulai streak."}</p>
        <div class="sd-badges">${badges}</div>`;
    return sdCard("Streak & Badge", body);
}

/* ---------- D. Tren kebiasaan (7 hari, minggu ini vs lalu) ---------- */
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

/* ---------- E. Kehadiran bulan ini ---------- */
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

/* ---------- F. Ringkasan nilai ---------- */
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

/* ---------- G. Progres hafalan ---------- */
function sdHafalanCard(hafalan) {
    if (!hafalan.length) return sdCard("Progres Hafalan", `<p class="sd-note">Belum ada catatan hafalan.</p>`, ["karakter", "Detail"]);
    const terakhir = hafalan.slice().sort((a, b) => sdTgl(b).localeCompare(sdTgl(a)))[0];
    const lancar = hafalan.filter(h => h.status === "Lancar").length;
    return sdCard("Progres Hafalan", `<p class="text-sm font-black text-slate-800">${escapeHtml(terakhir.nama_surat || "-")}</p>
        ${renderInfoRows([{ label: "Status", value: terakhir.status || "-" }, { label: "Lancar", value: lancar + " capaian" }])}`, ["karakter", "Detail"]);
}

/* ---------- H. Prestasi terbaru ---------- */
function sdPrestasiCard(prestasi) {
    if (!prestasi.length) return sdCard("Prestasi Terbaru", `<p class="sd-note">Belum ada prestasi tercatat. Terus berusaha!</p>`, ["karakter", "Detail"]);
    const list = prestasi.slice().sort((a, b) => sdTgl(b).localeCompare(sdTgl(a))).slice(0, 3);
    const tl = list.map(p => `<div>${escapeHtml(p.nama_prestasi || "-")}<small>${escapeHtml(p.tingkat || "")} ${escapeHtml(sdTgl(p))}</small></div>`).join("");
    return sdCard("Prestasi Terbaru", `<div class="sd-tl">${tl}</div>`, ["karakter", "Detail"]);
}

function renderSiswaHome() {
    const el = document.getElementById("dash-siswa-home");
    if (!el || !appState.user || appState.user.role !== "siswa") return;
    const u = appState.user;
    const today = getDateWITA();
    const bulan = today.slice(0, 7);
    const absBulan = sdMine(appState.absensi).filter(a => sdTgl(a).startsWith(bulan));
    const hafalan = sdMine(appState.keagamaan).filter(h => h.nama_surat);
    const nilai = sdMine(appState.akademik).filter(n => n.mapel);
    const prestasi = sdMine(appState.prestasi);
    el.innerHTML = [
        sdSapaanCard(u),
        sdMisiCard(today),
        sdBadgeCard(today, absBulan, hafalan),
        `<div class="sd-grid2">${sdHadirCard(absBulan)}${sdNilaiCard(nilai)}</div>`,
        sdTrenCard(today),
        `<div class="sd-grid2">${sdHafalanCard(hafalan)}${sdPrestasiCard(prestasi)}</div>`
    ].join("");
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
            <i class="fas fa-check-circle text-emerald-500 text-2xl mb-2"></i>
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
            <i class="fas fa-calendar-day text-slate-300 text-2xl mb-2"></i>
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

const NOTIF_CACHE_KEY = "notif_ditangani_cache";
let pendingPembinaanNotif = null;

async function fetchNotifDitangani() {
    const res = await apiCall("getNotifDitangani", {}, false);
    if (res && res.status === "success") {
        appState.notifDitangani = res.data || [];
        try { localStorage.setItem(NOTIF_CACHE_KEY, JSON.stringify(appState.notifDitangani)); } catch (e) { }
    } else if (!appState.notifDitangani) {
        try { appState.notifDitangani = JSON.parse(localStorage.getItem(NOTIF_CACHE_KEY) || "[]"); }
        catch (e) { appState.notifDitangani = []; }
    }
}

function getHandledRecord(notifId) {
    const rec = (appState.notifDitangani || []).find(r => String(r.id) === String(notifId));
    if (!rec) return null;
    if (Date.now() - Number(rec.ditangani_at) >= SNOOZE_24H_MS) return null;
    return rec;
}

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
        const sNotif = (appState.siswa || []).find(x => String(x.id) === String(n.siswa.id));
        const sebagaiMentor = isGuruUser() && getAccessTypeSiswa(sNotif) === 'mentor';
        showToast(sebagaiMentor
            ? "Ditandai oleh Mentor. Wali kelas tetap melihat notifikasi ini. Akan muncul kembali dalam 24 jam jika belum ada catatan pembinaan."
            : "Dipindahkan ke 'Sudah Ditangani'. Jika belum ada catatan pembinaan, akan muncul kembali dalam 24 jam.", "info");
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

function canRestoreNotif(n) {
    if (!appState.user) return false;
    if (appState.user.role === 'admin') return true;
    const s = (appState.siswa || []).find(x => String(x.id) === String(n.siswa.id));
    if (getAccessTypeSiswa(s) !== 'mentor') return true;
    return String((n.handledBy || {}).ditangani_oleh_role || '').toLowerCase() === 'mentor';
}

function renderHandledNote(n) {
    const catatan = n.handledBy && n.handledBy.catatan;
    if (!catatan) return '';
    return `<p class="text-[11px] text-slate-500 italic">Catatan: ${escapeHtml(catatan)}</p>`;
}

async function checkStudentNotifications() {
    if (!appState.user || appState.user.role === 'ortu') return;

    const isSiswa = appState.user.role === 'siswa';
    const currentUserId = String(appState.user.id);

    if (!appState.pembinaan || appState.pembinaan.length === 0) {
        const resPbn = await apiCall("getPembinaan", {}, false);
        if (resPbn && resPbn.data) appState.pembinaan = resPbn.data;
    }

    const [resRekap] = await Promise.all([
        apiCall("getLaporanRekap", {}, false),
        fetchNotifDitangani()
    ]);
    const rekapData = resRekap?.data || [];

    let activeList = [];
    let handledList = [];
    const todayStr = getDateWITA();

    const peranIds = isGuruUser() ? new Set(getSiswaPeran().map(s => String(s.id))) : null;

    const processNotifItem = (item) => {
        if (isSiswa && String(item.siswa.id) !== currentUserId) {
            return;
        }
        if (peranIds && !peranIds.has(String(item.siswa.id))) {
            return;
        }

        const rec = getHandledRecord(item.id);
        if (rec) {
            handledList.push({ ...item, dismissedAt: Number(rec.ditangani_at), handledBy: rec });
        } else {
            activeList.push(item);
        }
    };

    const filteredRekap = isSiswa
        ? rekapData.filter(item => String(item.id) === currentUserId)
        : rekapData;

    filteredRekap.forEach(item => {
        const sId = String(item.id);

        if (item.presensi.alpa >= 3) {
            processNotifItem({
                id: `${sId}_alpa_kritis`,
                siswa: { id: item.id, nama: item.nama },
                level: 'kritis',
                category: 'Kedisiplinan',
                title: 'Akumulasi Alpa Tinggi',
                desc: `${isSiswa ? 'Kamu' : item.nama} memiliki akumulasi Alpa sebanyak ${item.presensi.alpa} kali (Batas maksimal 3).`,
                defaultPembinaan: `Tindak lanjut presensi: Akumulasi Alpa mencapai ${item.presensi.alpa} hari.`
            });
        } else if (item.presensi.alpa >= 1 && item.presensi.alpa < 3) {
            processNotifItem({
                id: `${sId}_alpa_sedang`,
                siswa: { id: item.id, nama: item.nama },
                level: 'sedang',
                category: 'Kedisiplinan',
                title: 'Perhatian Absensi',
                desc: `${isSiswa ? 'Kamu' : item.nama} tercatat Alpa ${item.presensi.alpa} kali. Perlu pengawasan awal.`,
                defaultPembinaan: `Pemantauan presensi awal: Catatan Alpa ${item.presensi.alpa} hari.`
            });
        }

        if (item.dibawah_kktp >= 2) {
            processNotifItem({
                id: `${sId}_akademik_kritis`,
                siswa: { id: item.id, nama: item.nama },
                level: 'kritis',
                category: 'Akademik',
                title: 'Nilai di Bawah KKTP',
                desc: `${isSiswa ? 'Kamu' : item.nama} memiliki ${item.dibawah_kktp} mata pelajaran di bawah standar KKTP.`,
                defaultPembinaan: `Bimbingan belajar khusus: ${item.dibawah_kktp} mata pelajaran belum tuntas KKTP.`
            });
        } else if (item.dibawah_kktp === 1) {
            processNotifItem({
                id: `${sId}_akademik_sedang`,
                siswa: { id: item.id, nama: item.nama },
                level: 'sedang',
                category: 'Akademik',
                title: 'Peringatan KKTP',
                desc: `${isSiswa ? 'Kamu' : item.nama} memiliki 1 mata pelajaran yang belum memenuhi KKTP.`,
                defaultPembinaan: `Bimbingan akademik untuk 1 mapel yang belum tuntas KKTP.`
            });
        }
    });

    if (appState.kebiasaan && appState.kebiasaan.length > 0) {
        const targetSiswa = isSiswa
            ? appState.siswa.filter(s => String(s.id) === currentUserId)
            : appState.siswa;

        targetSiswa.forEach(s => {
            const sId = String(s.id);
            const k2Rec = appState.kebiasaan.find(k => String(k.siswa_id) === sId && String(k.kebiasaan_id) === 'K2' && k.tanggal === todayStr);
            if (k2Rec && k2Rec.status === 'Belum') {
                processNotifItem({
                    id: `${sId}_kebiasaan_k2`,
                    siswa: { id: s.id, nama: s.nama },
                    level: 'rendah',
                    category: 'Kebiasaan',
                    title: 'Belum Beribadah/Shalat',
                    desc: `${isSiswa ? 'Kamu' : s.nama} tercatat belum melaksanakan ibadah pada pantauan hari ini.`,
                    defaultPembinaan: `Pembinaan karakter: Pembiasaan ibadah harian.`
                });
            }
        });
    }

    if (appState.keagamaan && appState.keagamaan.length > 0) {
        const targetHafalan = isSiswa
            ? appState.keagamaan.filter(h => String(h.siswa_id) === currentUserId)
            : appState.keagamaan;

        targetHafalan.forEach(h => {
            if (h.status === 'Mengulang') {
                const s = appState.siswa.find(x => String(x.id) === String(h.siswa_id)) || (isSiswa ? appState.user : null);
                if (s) {
                    processNotifItem({
                        id: `hfl_${h.id}_mengulang`,
                        siswa: { id: s.id, nama: s.nama },
                        level: 'sedang',
                        category: 'Keagamaan',
                        title: ({ surah: 'Hafalan Perlu Perbaikan', iqro: 'Bacaan Iqro Perlu Perbaikan', doa: 'Hafalan Doa Perlu Perbaikan' })[getKategoriHafalan(h)],
                        desc: `${formatCapaianKeagamaan(h)} untuk ${isSiswa ? 'kamu' : s.nama} perlu diulang kembali (${h.catatan || 'Perhatikan kelancaran'}).`,
                        defaultPembinaan: `Bimbingan ${KEAGAMAAN_KATEGORI[getKategoriHafalan(h)].judul}: ${formatCapaianKeagamaan(h)}`
                    });
                }
            }
        });
    }

    if (appState.pembinaan && appState.pembinaan.length > 0) {
        const targetPembinaan = isSiswa
            ? appState.pembinaan.filter(p => String(p.siswa_id) === currentUserId)
            : appState.pembinaan;

        targetPembinaan.forEach(p => {
            const s = appState.siswa.find(x => String(x.id) === String(p.siswa_id)) || (isSiswa ? appState.user : null);
            if (s && String(p.status).toLowerCase() !== 'selesai') {
                const stLower = String(p.status).toLowerCase();
                let lvl = 'sedang';
                if (stLower === 'perlu tindak lanjut') lvl = 'kritis';

                processNotifItem({
                    id: `pbn_${p.id}_aktif`,
                    siswa: { id: s.id, nama: s.nama },
                    level: lvl,
                    category: 'Pembinaan',
                    title: `Catatan Pembinaan (${p.status})`,
                    desc: `Kasus "${p.permasalahan}" ${isSiswa ? 'kamu' : 'untuk ' + s.nama} masih dalam status ${p.status}.`,
                    defaultPembinaan: `Tindak lanjut pembinaan: ${p.permasalahan}`
                });
            }
        });
    }

    const levelOrder = { 'kritis': 3, 'sedang': 2, 'rendah': 1 };
    activeList.sort((a, b) => levelOrder[b.level] - levelOrder[a.level]);
    handledList.sort((a, b) => b.dismissedAt - a.dismissedAt);

    const prevCount = appState.currentNotifications ? appState.currentNotifications.length : 0;
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
    if (statCount) {
        statCount.innerText = getAttentionStudentCount();
    }

    if (isSiswa) renderSiswaDashboardParts();

    if (!isSiswa && activeList.length > prevCount) {
        const kritisCount = activeList.filter(n => n.level === 'kritis').length;
        if (kritisCount > 0) {
            sendWebPushNotification(
                "⚠️ Perhatian Khusus Siswa",
                `Terdapat ${kritisCount} catatan siswa dengan tingkat keparahan KRITIS membutuhkan tindakan segera.`
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
                    <i class="fas ${activeTab === 'active' ? 'fa-check-circle text-emerald-500' : 'fa-inbox text-slate-300'} text-3xl mb-2"></i>
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
                                <button onclick="dismissNotification('${n.id}')" title="Tandai Sudah Ditangani (Snooze 24 Jam)" aria-label="Tandai sudah ditangani" class="text-slate-400 hover:text-emerald-600 p-1 shrink-0">
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
                        <button onclick="openQuickPembinaan('${n.siswa.id}', '${escapeHtml(n.defaultPembinaan)}', '${n.id}')" class="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-rose-700 flex items-center gap-1">
                            <i class="fas fa-edit"></i> Buat Catatan Pembinaan
                        </button>
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
    box.innerHTML = list.map(k => {
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
}
