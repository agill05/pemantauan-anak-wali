async function renderDashboard() {
    if (!appState.user) return;
    const role = appState.user.role;

    const adminBanner = document.getElementById("dash-admin-banner");
    if (adminBanner) {
        if (role === "admin") adminBanner.classList.remove("hidden");
        else adminBanner.classList.add("hidden");
    }

    const statsContainer = document.getElementById("dash-stats-container");
    if (statsContainer) {
        const totalSiswaCount = appState.siswa.length;
        if (role === "admin" || role === "guru") {
            statsContainer.innerHTML = `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-base"><i class="fas fa-users"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-slate-500">${role === 'admin' ? 'Total Siswa' : 'Anak Wali'}</p>
                        <p class="text-2xl font-black text-slate-800 leading-tight">${totalSiswaCount}</p>
                        <p class="text-[11px] text-slate-400">Total anak wali yang dibina</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-emerald-50 text-secondary flex items-center justify-center text-base"><i class="fas fa-calendar-check"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-emerald-600">Hadir Hari Ini</p>
                        <p class="text-2xl font-black text-emerald-600 leading-tight">${appState.absensi.filter(a => a.status === 'H').length}</p>
                        <p class="text-[11px] text-slate-400">Dari ${totalSiswaCount} anak wali</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <span class="w-11 h-11 shrink-0 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-base"><i class="fas fa-triangle-exclamation"></i></span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-bold text-rose-500">Perlu Perhatian</p>
                        <p id="dash-stat-perhatian-count" class="text-2xl font-black text-rose-600 leading-tight">${appState.currentNotifications ? appState.currentNotifications.length : 0}</p>
                        <p class="text-[11px] text-slate-400">Anak wali yang perlu perhatian</p>
                    </div>
                    <i class="fas fa-chevron-right text-slate-300 text-xs"></i>
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between col-span-3">
                    <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">Status Pemantauan Saya</span>
                    <p class="text-sm font-bold text-slate-700 mt-1">
                      ${(appState.currentNotifications && appState.currentNotifications.length > 0) ? '⚠️ Memerlukan Tindak Lanjut' : '✅ Perkembangan Baik'}
                    </p>
                </div>
            `;
        }
    }

    apiCall("getDashboardData", {}, false).then(res => {
        if (res && res.status === "success") {
            renderPrioritySection(res.data.priority_list);
            renderAgendaSection(res.data.agenda_list);
            checkStudentNotifications();
        }
    });
}

function renderPrioritySection(priorityList) {
    const container = document.getElementById("dash-priority-container");
    if (!container) return;

    if (!priorityList || priorityList.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-check-circle text-emerald-500 text-2xl mb-2"></i>
            <p class="text-xs text-slate-500">Semua siswa dalam kondisi baik. Tidak ada indikator perhatian aktif.</p>
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
                  <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
                  <p class="text-xs text-slate-400">NISN: ${escapeHtml(s.nisn || '-')} | Ortu: ${escapeHtml(s.no_hp_ortu || '-')}</p>
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
              <p class="text-xs text-slate-500">${escapeHtml(ag.jenis)} • ${escapeHtml(ag.permasalahan || '-')}</p>
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
        inputPlaceholder: 'Catatan singkat (opsional), mis. sudah menghubungi ortu',
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
        showToast("Dipindahkan ke 'Sudah Ditangani'. Jika belum ada catatan pembinaan, akan muncul kembali dalam 24 jam.", "info");
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
    const roleLabel = h.ditangani_oleh_role === 'admin' ? 'Admin' : 'Guru';
    const oleh = isSelf ? 'Anda' : `${escapeHtml(h.ditangani_oleh_nama || '-')} (${roleLabel})`;
    const via = h.sumber === 'pembinaan' ? 'Ditindaklanjuti lewat catatan pembinaan' : 'Ditangani';
    return `<span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100"><i class="fas fa-check text-[9px]"></i> ${via} oleh ${oleh} · ${formatTimeAgo(n.dismissedAt)}</span>`;
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

    const processNotifItem = (item) => {
        if (isSiswa && String(item.siswa.id) !== currentUserId) {
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
                        title: 'Hafalan Perlu Perbaikan',
                        desc: `Surah ${h.nama_surat} untuk ${isSiswa ? 'kamu' : s.nama} perlu diulang kembali (${h.catatan || 'Perhatikan kelancaran'}).`,
                        defaultPembinaan: `Bimbingan hafalan Al-Qur'an: Surah ${h.nama_surat}`
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

    const statCount = document.getElementById("dash-stat-perhatian-count");
    if (statCount) {
        statCount.innerText = activeList.length;
    }

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

    const kelasOptions = (appState.kelas || []).map(k => `
        <option value="${k.id}" ${String(selectedKelasId) === String(k.id) ? 'selected' : ''}>Kelas ${escapeHtml(k.nama_kelas)}</option>
    `).join("");

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
                <select onchange="openNotificationModal('${activeTab}', this.value)" class="w-full bg-slate-100 border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none text-slate-700">
                    <option value="">Semua Kelas</option>
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
                            <h4 class="font-bold text-xs text-slate-800">${escapeHtml(n.siswa.nama)} — <span class="text-slate-700 font-semibold">${escapeHtml(n.title)}</span></h4>
                        </div>

                        ${isCanManageNotif ? (
            activeTab === 'active' ? `
                                <button onclick="dismissNotification('${n.id}')" title="Tandai Sudah Ditangani (Snooze 24 Jam)" aria-label="Tandai sudah ditangani" class="text-slate-400 hover:text-emerald-600 p-1 shrink-0">
                                    <i class="fas fa-check-circle text-lg"></i>
                                </button>
                            ` : `
                                <button onclick="restoreNotification('${n.id}')" title="Kembalikan ke Daftar Perlu Tindakan" class="text-slate-400 hover:text-blue-600 p-1 shrink-0 flex items-center gap-1 text-xs font-bold">
                                    <i class="fas fa-undo text-sm"></i> Buka Lagi
                                </button>
                            `
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