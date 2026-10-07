let kebiasaanLoadedTanggal = null;
let kebiasaanTab = "hari-ini";
let kebiasaanKonfigLoaded = false;
let kebiasaanRingkasan = {};
let kebiasaanKalender = { bulan: null, data: {}, siswa: null };
const RINGKASAN_TTL = 60 * 1000;
const K7_PAGI_IDS = ["K1", "K2", "K3", "K4"];

async function ensureKonfigKebiasaan(force = false) {
    if (kebiasaanKonfigLoaded && !force) return;
    const res = await apiCall("getKonfigKebiasaan", {}, false, 2, true);
    if (res && res.status === "success" && Array.isArray(res.data) && res.data.length > 0) {
        applyKonfigKebiasaan(res.data);
        kebiasaanKonfigLoaded = true;
        try { localStorage.setItem("cache_konfig_kebiasaan", JSON.stringify(res.data)); } catch (e) { }
    } else if (!kebiasaanKonfigLoaded) {
        try {
            const cached = JSON.parse(localStorage.getItem("cache_konfig_kebiasaan") || "null");
            if (Array.isArray(cached) && cached.length > 0) applyKonfigKebiasaan(cached);
        } catch (e) { }
    }
}

function getSiswaKebiasaanTerpilih() {
    const sel = document.getElementById("kebiasaan-siswa-select");
    return sel ? sel.value : "";
}

function getTanggalKebiasaan() {
    const el = document.getElementById("kebiasaan-date");
    return el ? (el.value || getDateWITA()) : getDateWITA();
}

function bisaIsiKebiasaan(siswaId) {
    const u = appState.user;
    if (!u || !siswaId) return false;
    if (u.role === "admin") return true;
    if (u.role === "siswa") return String(u.id) === String(siswaId);
    if (u.role === "guru") return false;
    return false;
}

async function loadKebiasaanData(forceRefresh = false) {
    const dateInput = document.getElementById("kebiasaan-date");
    const tanggal = dateInput ? (dateInput.value || getDateWITA()) : getDateWITA();
    if (dateInput) {
        dateInput.value = tanggal;
        dateInput.max = getDateWITA();
    }

    const selectSiswa = document.getElementById("kebiasaan-siswa-select");
    if (selectSiswa && selectSiswa.options.length === 0) {
        populateSiswaSelectForRole(selectSiswa);
    }

    renderKebiasaanTabs();
    await ensureKonfigKebiasaan(forceRefresh);

    const isStale = (Date.now() - (lastFetchTimes.kebiasaan || 0)) > CACHE_TTL;
    const sameDate = kebiasaanLoadedTanggal === tanggal;

    if (sameDate && appState.kebiasaan && appState.kebiasaan.length > 0) {
        renderKebiasaanView();
    } else {
        renderSkeleton("kebiasaan-list-container", 4);
    }

    if (pendingKebiasaanQueue.size > 0) { renderKebiasaanView(); return; }

    if (forceRefresh || isStale || !sameDate || !appState.kebiasaan || appState.kebiasaan.length === 0) {
        const res = await apiCall("getKebiasaan", { tanggal }, false);
        if (res && res.status === "success" && res.data) {
            appState.kebiasaan = res.data;
            kebiasaanLoadedTanggal = tanggal;
            lastFetchTimes.kebiasaan = Date.now();
            saveAppStateToLocal();
            renderKebiasaanView();
        }
    }
    muatRingkasanKebiasaan(false);
}

async function muatRingkasanKebiasaan(force = false) {
    const sid = getSiswaKebiasaanTerpilih();
    if (!sid || sid === "ALL") return;
    const cache = kebiasaanRingkasan[sid];
    if (!force && cache && (Date.now() - cache.waktu) < RINGKASAN_TTL) return;
    const res = await apiCall("getRingkasanKebiasaan", { siswa_id: sid }, false, 2, true);
    if (res && res.status === "success" && res.data) {
        kebiasaanRingkasan[sid] = { data: res.data, waktu: Date.now() };
        if (kebiasaanTab === "hari-ini" && getSiswaKebiasaanTerpilih() === sid) renderKebiasaanView();
    }
}

function onKebiasaanSiswaChange() {
    kebiasaanKalender = { bulan: null, data: {}, siswa: null };
    renderKebiasaanView();
    muatRingkasanKebiasaan(false);
    if (kebiasaanTab === "kalender") loadKalenderKebiasaan();
}

function renderKebiasaanTabs() {
    const wrap = document.getElementById("kebiasaan-tabs");
    if (!wrap) return;
    const tab = (id, label, icon) => `
        <button type="button" onclick="setKebiasaanTab('${id}')" aria-pressed="${kebiasaanTab === id}"
            class="flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${kebiasaanTab === id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}">
            <i class="fas ${icon} mr-1"></i>${label}
        </button>`;
    wrap.innerHTML = tab("hari-ini", "Hari Ini", "fa-list-check") + tab("kalender", "Kalender", "fa-calendar-days");
}

function setKebiasaanTab(tab) {
    if (kebiasaanTab === tab) return;
    kebiasaanTab = tab;
    renderKebiasaanTabs();
    const dateWrap = document.getElementById("kebiasaan-date-wrap");
    if (dateWrap) dateWrap.classList.toggle("hidden", tab === "kalender");
    if (tab === "kalender") loadKalenderKebiasaan();
    else renderKebiasaanView();
}

function renderKebiasaanView() {
    if (kebiasaanTab === "kalender") { loadKalenderKebiasaan(); return; }

    const container = document.getElementById("kebiasaan-list-container");
    const selectSiswa = document.getElementById("kebiasaan-siswa-select");
    if (!container || !selectSiswa) return;

    if (getSiswaPeran().length === 0 && appState.user && appState.user.role !== "siswa") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-slash text-2xl mb-2"></i><p class="text-xs text-slate-500">Belum ada data siswa untuk dipantau kebiasaannya.</p></div>`;
        return;
    }

    const selectedSiswaId = selectSiswa.value;
    if (!selectedSiswaId) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer text-2xl mb-2"></i><p class="text-xs text-slate-500">Silakan pilih siswa terlebih dahulu.</p></div>`;
        return;
    }

    const tanggal = getTanggalKebiasaan();
    const lockState = getDateLockState(tanggal);
    const roleAllowed = bisaIsiKebiasaan(selectedSiswaId);
    const bacaSaja = isGuruUser() || isKepsekUser();
    const isEditable = !!(roleAllowed && lockState.editable);

    const total = MASTER_KEBIASAAN.length;
    const todayRecords = appState.kebiasaan.filter(k =>
        String(k.siswa_id) === String(selectedSiswaId) && String(k.tanggal) === String(tanggal));
    const aktifIds = new Set(MASTER_KEBIASAAN.map(k => String(k.id)));
    const selesai = todayRecords.filter(k => k.status === "Sudah" && aktifIds.has(String(k.kebiasaan_id))).length;
    const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;

    const ring = (kebiasaanRingkasan[selectedSiswaId] || {}).data || null;
    const poin = ring ? ring.poin : null;
    const streak = ring ? ring.streak : null;

    const kartuProgres = `
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-4 text-white shadow-md space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Ketercapaian ${tanggal === getDateWITA() ? "Hari Ini" : escapeHtml(formatTanggalLabel(tanggal))}</span>
                    <h3 class="text-2xl font-black leading-tight">${selesai}<span class="text-sm text-blue-200">/${total}</span></h3>
                </div>
                <div class="flex items-center gap-2 bg-white/15 rounded-2xl px-3 py-2">
                    <i class="fas fa-fire text-amber-300 text-lg"></i>
                    <div class="leading-tight">
                        <span class="text-[10px] text-blue-100 block">Beruntun</span>
                        <span class="font-black text-amber-300 text-sm">${streak === null ? "…" : streak + " hari"}</span>
                    </div>
                </div>
            </div>
            <div class="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                <div class="bg-amber-400 h-full rounded-full transition-all duration-500" style="width:${persen}%"></div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="bg-white/10 rounded-xl p-1.5">
                    <span class="text-[10px] text-blue-200 block">Total Poin</span>
                    <span class="font-black text-white">${poin === null ? "…" : poin}</span>
                </div>
                <div class="bg-white/10 rounded-xl p-1.5">
                    <span class="text-[10px] text-blue-200 block">Ketercapaian</span>
                    <span class="font-black text-emerald-300">${persen}%</span>
                </div>
            </div>
        </div>`;

    const badgeHtml = ring && Array.isArray(ring.badge) ? `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lencana Karakter</h4>
            <div class="grid grid-cols-4 gap-1.5">
                ${ring.badge.map(b => `
                    <div title="${escapeHtml(b.nama)}: ${escapeHtml(b.deskripsi)}"
                         class="p-2 rounded-xl text-center border transition ${b.terbuka ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}">
                        <i class="fas ${escapeHtml(b.ikon)} text-lg ${b.terbuka ? 'text-amber-500' : ''}"></i>
                        <div class="text-[9px] font-extrabold mt-1 leading-tight">${escapeHtml(b.nama)}</div>
                    </div>`).join("")}
            </div>
        </div>` : "";

    const tombolPagi = isEditable ? `
        <button type="button" onclick="isiCepatPagi('${escapeHtml(selectedSiswaId)}')"
            class="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition">
            <i class="fas fa-bolt"></i> Tandai Rutinitas Pagi
        </button>` : "";

    const itemsHtml = MASTER_KEBIASAAN.map(k => {
        const rec = todayRecords.find(item => String(item.kebiasaan_id) === String(k.id));
        const sudah = !!rec && rec.status === "Sudah";
        const jam = rec && rec.jam ? rec.jam : "";
        const detail = rec && rec.detail ? rec.detail : "";
        const aksi = isEditable ? `onclick="bukaModalKebiasaan('${escapeHtml(selectedSiswaId)}','${escapeHtml(k.id)}')"` : "";
        return `
            <div ${aksi} class="p-3.5 rounded-2xl border-2 transition ${sudah ? 'bg-emerald-50/70 border-emerald-400' : 'bg-white border-slate-100'} ${isEditable ? 'cursor-pointer active:scale-[0.99]' : ''}"
                 role="${isEditable ? 'button' : 'group'}" ${isEditable ? 'tabindex="0"' : ''}>
                <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-xl ${escapeHtml(k.color)} flex items-center justify-center text-lg shrink-0">
                            <i class="fas ${escapeHtml(k.icon)}"></i>
                        </div>
                        <div class="min-w-0">
                            <h4 class="font-bold text-xs text-slate-800 flex items-center gap-1.5 flex-wrap">
                                ${escapeHtml(k.nama)}
                                ${sudah ? `<span class="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded-full font-extrabold">Terisi</span>` : ""}
                            </h4>
                            <p class="text-[11px] text-slate-500 leading-snug mt-0.5">${escapeHtml(k.detail_default || "")}</p>
                        </div>
                    </div>
                    <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${sudah ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-slate-300'}">
                        <i class="fas ${sudah ? 'fa-check' : (isEditable ? 'fa-pen' : 'fa-minus')} text-[10px]"></i>
                    </div>
                </div>
                ${sudah ? `
                    <div class="mt-2.5 pt-2.5 border-t border-emerald-200/60 text-[11px] text-slate-700 space-y-0.5">
                        <div class="font-bold"><i class="far fa-clock text-blue-500 mr-1"></i>${jam ? escapeHtml(jam) + " WITA" : "Jam tidak dicatat"}</div>
                        <p class="text-slate-600 italic">${detail ? "“" + escapeHtml(detail) + "”" : "Tanpa catatan"}</p>
                    </div>` : ""}
            </div>`;
    }).join("");

    container.innerHTML = `
        <div class="space-y-3">
            ${renderDateLockBanner(lockState, "kebiasaan")}
            ${bacaSaja ? renderBacaSajaBanner("Mode baca saja, kebiasaan diisi siswa.") : ""}
            ${kartuProgres}
            ${badgeHtml}
            ${tombolPagi}
            ${itemsHtml}
        </div>`;
}

function bukaModalKebiasaan(siswaId, kebiasaanId) {
    if (!bisaIsiKebiasaan(siswaId)) {
        showToast("Anda tidak dapat mengisi kebiasaan siswa ini.", "warning");
        return;
    }
    const tanggal = getTanggalKebiasaan();
    const lock = getDateLockState(tanggal);
    if (!lock.editable) { showDateLockedAlert(lock); return; }

    const k = MASTER_KEBIASAAN.find(x => String(x.id) === String(kebiasaanId));
    if (!k) return;
    const rec = appState.kebiasaan.find(r =>
        String(r.siswa_id) === String(siswaId) && String(r.tanggal) === String(tanggal) &&
        String(r.kebiasaan_id) === String(kebiasaanId));
    const sudah = !!rec && rec.status === "Sudah";
    const jam = (rec && rec.jam) || k.jam_default || "";
    const detail = sudah ? (rec.detail || "") : (k.detail_default || "");

    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal) return;

    box.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl ${escapeHtml(k.color)} flex items-center justify-center text-lg shrink-0"><i class="fas ${escapeHtml(k.icon)}"></i></div>
                    <div class="min-w-0">
                        <h3 class="font-black text-sm text-slate-800 truncate">${escapeHtml(k.nama)}</h3>
                        <p class="text-[11px] text-slate-400 font-bold">${escapeHtml(formatTanggalLabel(tanggal))} (WITA)</p>
                    </div>
                </div>
                <button type="button" onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-1" aria-label="Tutup"><i class="fas fa-times text-lg"></i></button>
            </div>
            <div>
                <label for="m-kbs-jam" class="block text-xs font-bold text-slate-600 mb-1"><i class="far fa-clock mr-1 text-blue-500"></i>${escapeHtml(k.label_jam || "Jam (WITA)")}</label>
                <input type="time" id="m-kbs-jam" value="${escapeHtml(jam)}"
                    class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-blue-600 text-sm outline-none focus:ring-2 focus:ring-accent">
            </div>
            <div>
                <label for="m-kbs-detail" class="block text-xs font-bold text-slate-600 mb-1"><i class="fas fa-align-left mr-1 text-blue-500"></i>${escapeHtml(k.label_detail || "Keterangan")}</label>
                <textarea id="m-kbs-detail" rows="3" maxlength="300" placeholder="${escapeHtml(k.placeholder_detail || "")}"
                    class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-accent">${escapeHtml(detail)}</textarea>
            </div>
            <div class="flex gap-2 pt-1">
                ${sudah ? `<button type="button" onclick="simpanKebiasaanModal('${escapeHtml(siswaId)}','${escapeHtml(kebiasaanId)}','Belum')"
                    class="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">Tandai Belum</button>` : ""}
                <button type="button" onclick="simpanKebiasaanModal('${escapeHtml(siswaId)}','${escapeHtml(kebiasaanId)}','Sudah')"
                    class="flex-1 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5">
                    <i class="fas fa-check"></i> Simpan Kebiasaan
                </button>
            </div>
        </div>`;
    modal.classList.remove("hidden");
    setTimeout(() => { const el = document.getElementById("m-kbs-detail"); if (el) el.focus(); }, 50);
}

function simpanKebiasaanModal(siswaId, kebiasaanId, status) {
    let jam = "";
    let detail = "";
    if (status === "Sudah") {
        jam = (document.getElementById("m-kbs-jam") || {}).value || "";
        detail = ((document.getElementById("m-kbs-detail") || {}).value || "").trim();
        if (!jam) { showToast("Isi jam terlebih dahulu.", "warning"); return; }
        if (!detail) { showToast("Isi keterangan terlebih dahulu.", "warning"); return; }
    }
    closeModal();
    simpanKebiasaanItem(siswaId, kebiasaanId, status, jam, detail);
}

function simpanKebiasaanItem(siswaId, kebiasaanId, status, jam, detail) {
    if (!bisaIsiKebiasaan(siswaId)) {
        showToast("Anda tidak dapat mengisi kebiasaan siswa ini.", "warning");
        return;
    }
    const tanggal = getTanggalKebiasaan();
    const lock = getDateLockState(tanggal);
    if (!lock.editable) { showDateLockedAlert(lock); return; }

    perbaruiKebiasaanLokal(siswaId, tanggal, kebiasaanId, status, jam, detail);
    saveAppStateToLocal();
    renderKebiasaanView();

    const total = MASTER_KEBIASAAN.length;
    const sudah = appState.kebiasaan.filter(k =>
        String(k.siswa_id) === String(siswaId) && String(k.tanggal) === String(tanggal) && k.status === "Sudah").length;
    if (status === "Sudah" && total > 0 && sudah >= total) {
        showToast("🌟 Luar biasa! Semua kebiasaan hari ini tuntas!");
    }

    antrekanKebiasaan(siswaId, tanggal, kebiasaanId, status, jam, detail);
}

function perbaruiKebiasaanLokal(siswaId, tanggal, kebiasaanId, status, jam, detail) {
    const idx = appState.kebiasaan.findIndex(k =>
        String(k.siswa_id) === String(siswaId) && String(k.tanggal) === String(tanggal) &&
        String(k.kebiasaan_id) === String(kebiasaanId));
    if (idx !== -1) {
        appState.kebiasaan[idx].status = status;
        appState.kebiasaan[idx].jam = status === "Sudah" ? (jam || "") : "";
        appState.kebiasaan[idx].detail = status === "Sudah" ? (detail || "") : "";
    } else {
        appState.kebiasaan.push({
            siswa_id: siswaId, tanggal: tanggal, kebiasaan_id: kebiasaanId, status: status,
            jam: status === "Sudah" ? (jam || "") : "", detail: status === "Sudah" ? (detail || "") : ""
        });
    }
}

function antrekanKebiasaan(siswaId, tanggal, kebiasaanId, status, jam, detail) {
    const key = `${siswaId}_${kebiasaanId}_${tanggal}`;
    pendingKebiasaanQueue.set(key, { tanggal, siswa_id: siswaId, kebiasaan_id: kebiasaanId, status, jam, detail });
    updateKebiasaanSaveStatus("saving");
    if (kebiasaanDebounceTimer) clearTimeout(kebiasaanDebounceTimer);
    kebiasaanDebounceTimer = setTimeout(() => { flushKebiasaanQueue(); }, 600);
}

async function flushKebiasaanQueue() {
    if (pendingKebiasaanQueue.size === 0) return;

    const grup = new Map();
    pendingKebiasaanQueue.forEach((item, key) => {
        const g = `${item.siswa_id}|${item.tanggal}`;
        if (!grup.has(g)) grup.set(g, { siswa_id: item.siswa_id, tanggal: item.tanggal, items: [], keys: [] });
        const entri = grup.get(g);
        entri.items.push({ kebiasaan_id: item.kebiasaan_id, status: item.status, jam: item.jam, detail: item.detail });
        entri.keys.push(key);
    });

    let pesanKunci = "";
    let pesanGalat = "";
    for (const g of grup.values()) {
        const res = await apiCall("saveKebiasaan", { siswa_id: g.siswa_id, tanggal: g.tanggal, items: g.items }, false);
        if (res && res.status === "success") {
            g.keys.forEach(k => pendingKebiasaanQueue.delete(k));
        } else if (res && res.status === "error") {
            g.keys.forEach(k => pendingKebiasaanQueue.delete(k));
            if (res.code === "DATE_LOCKED" || res.code === "DATE_FUTURE") pesanKunci = res.message;
            else pesanGalat = res.message || "Data kebiasaan ditolak server.";
        }
    }

    if (pesanKunci || pesanGalat) {
        updateKebiasaanSaveStatus("saved");
        Swal.fire({ icon: "warning", title: "Data Tidak Tersimpan", text: pesanKunci || pesanGalat, confirmButtonColor: "#2563eb" });
        loadKebiasaanData(true);
        return;
    }

    if (pendingKebiasaanQueue.size === 0) {
        updateKebiasaanSaveStatus("saved");
        delete kebiasaanRingkasan[getSiswaKebiasaanTerpilih()];
        muatRingkasanKebiasaan(true);
        kebiasaanKalender = { bulan: null, data: {}, siswa: null };
    } else {
        showToast("Beberapa data kebiasaan belum terkirim. Akan dicoba lagi.", "warning");
        if (kebiasaanDebounceTimer) clearTimeout(kebiasaanDebounceTimer);
        kebiasaanDebounceTimer = setTimeout(() => { flushKebiasaanQueue(); }, 8000);
    }
}

function updateKebiasaanSaveStatus(state) {
    const badge = document.getElementById("kebiasaan-save-status");
    if (!badge) return;
    badge.classList.remove("hidden");

    if (state === "saving") {
        badge.className = "text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 shadow-sm";
        badge.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-600"></i> Menyimpan...`;
    } else if (state === "saved") {
        badge.className = "text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 shadow-sm";
        badge.innerHTML = `<i class="fas fa-check-circle text-emerald-600"></i> Tersimpan`;
        setTimeout(() => {
            if (pendingKebiasaanQueue.size === 0) badge.classList.add("hidden");
        }, 3000);
    }
}

async function isiCepatPagi(siswaId) {
    if (!bisaIsiKebiasaan(siswaId)) return;
    const tanggal = getTanggalKebiasaan();
    const lock = getDateLockState(tanggal);
    if (!lock.editable) { showDateLockedAlert(lock); return; }

    const target = MASTER_KEBIASAAN.filter(k => K7_PAGI_IDS.includes(String(k.id)));
    if (target.length === 0) {
        showToast("Tidak ada kebiasaan pagi yang aktif.", "warning");
        return;
    }
    const belum = target.filter(k => {
        const rec = appState.kebiasaan.find(r =>
            String(r.siswa_id) === String(siswaId) && String(r.tanggal) === String(tanggal) &&
            String(r.kebiasaan_id) === String(k.id));
        return !(rec && rec.status === "Sudah");
    });
    if (belum.length === 0) {
        showToast("Rutinitas pagi sudah tercatat semua.");
        return;
    }

    const daftar = belum.map(k => `<li>${escapeHtml(k.nama_singkat || k.nama)} (${escapeHtml(k.jam_default || "-")})</li>`).join("");
    const konfirmasi = await Swal.fire({
        icon: "question",
        title: "Tandai Rutinitas Pagi?",
        html: `<p style="font-size:13px;margin-bottom:6px">Kebiasaan berikut ditandai Sudah dengan jam dan catatan bawaan. Anda dapat mengubahnya setelah ini.</p><ul style="text-align:left;font-size:13px;padding-left:20px;list-style:disc">${daftar}</ul>`,
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Ya, Tandai",
        cancelButtonText: "Batal"
    });
    if (!konfirmasi.isConfirmed) return;

    const items = belum.map(k => ({
        kebiasaan_id: k.id, status: "Sudah", jam: k.jam_default || "", detail: k.detail_default || ""
    }));
    items.forEach(it => perbaruiKebiasaanLokal(siswaId, tanggal, it.kebiasaan_id, "Sudah", it.jam, it.detail));
    saveAppStateToLocal();
    renderKebiasaanView();
    updateKebiasaanSaveStatus("saving");

    const res = await apiCall("saveKebiasaan", { siswa_id: siswaId, tanggal, items }, false);
    if (res && res.status === "success") {
        updateKebiasaanSaveStatus("saved");
        showToast(`${items.length} kebiasaan pagi tercatat.`);
        delete kebiasaanRingkasan[siswaId];
        kebiasaanKalender = { bulan: null, data: {}, siswa: null };
        muatRingkasanKebiasaan(true);
    } else if (res && res.status === "error") {
        updateKebiasaanSaveStatus("saved");
        Swal.fire({ icon: "warning", title: "Data Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
        loadKebiasaanData(true);
    } else {
        items.forEach(it => antrekanKebiasaan(siswaId, tanggal, it.kebiasaan_id, "Sudah", it.jam, it.detail));
    }
}

function bulanSekarang() { return getDateWITA().slice(0, 7); }

function geserBulanKebiasaan(delta) {
    const bulan = kebiasaanKalender.bulan || bulanSekarang();
    const p = bulan.split("-").map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1 + delta, 1));
    const baru = d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0");
    if (baru > bulanSekarang()) return;
    kebiasaanKalender = { bulan: baru, data: {}, siswa: null };
    loadKalenderKebiasaan();
}

async function loadKalenderKebiasaan() {
    const container = document.getElementById("kebiasaan-list-container");
    const sid = getSiswaKebiasaanTerpilih();
    if (!container) return;
    if (!sid || sid === "ALL") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer text-2xl mb-2"></i><p class="text-xs text-slate-500">Silakan pilih siswa terlebih dahulu.</p></div>`;
        return;
    }
    if (!kebiasaanKalender.bulan) kebiasaanKalender.bulan = bulanSekarang();
    const bulan = kebiasaanKalender.bulan;

    if (kebiasaanKalender.siswa === sid) {
        renderKalenderKebiasaan();
        return;
    }
    renderSkeleton("kebiasaan-list-container", 3);

    const p = bulan.split("-").map(Number);
    const hariDalamBulan = new Date(Date.UTC(p[0], p[1], 0)).getUTCDate();
    const dari = `${bulan}-01`;
    const sampai = `${bulan}-${String(hariDalamBulan).padStart(2, "0")}`;
    const res = await apiCall("getKebiasaanRentang", { siswa_id: sid, dari, sampai }, false);
    if (res && res.status === "success" && Array.isArray(res.data)) {
        const peta = {};
        res.data.forEach(r => {
            if (r.status !== "Sudah") return;
            peta[r.tanggal] = (peta[r.tanggal] || 0) + 1;
        });
        kebiasaanKalender.data = peta;
        kebiasaanKalender.siswa = sid;
    } else {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i><p class="text-xs text-slate-500">Kalender gagal dimuat. Periksa koneksi lalu coba lagi.</p></div>`;
        return;
    }
    renderKalenderKebiasaan();
}

function renderKalenderKebiasaan() {
    const container = document.getElementById("kebiasaan-list-container");
    if (!container) return;
    const bulan = kebiasaanKalender.bulan || bulanSekarang();
    const [tahun, bln] = bulan.split("-").map(Number);
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const hariPertama = new Date(Date.UTC(tahun, bln - 1, 1)).getUTCDay();
    const jumlahHari = new Date(Date.UTC(tahun, bln, 0)).getUTCDate();
    const total = MASTER_KEBIASAAN.length;
    const hariIni = getDateWITA();
    const peta = kebiasaanKalender.data || {};
    const bisaMaju = bulan < bulanSekarang();

    let sel = "";
    for (let i = 0; i < hariPertama; i++) sel += `<div></div>`;
    let hariPenuh = 0;
    let hariTerisi = 0;
    for (let d = 1; d <= jumlahHari; d++) {
        const key = `${bulan}-${String(d).padStart(2, "0")}`;
        const n = peta[key] || 0;
        const masaDepan = key > hariIni;
        let gaya = "bg-slate-50 border-slate-100 text-slate-500";
        if (masaDepan) gaya = "bg-white border-slate-100 text-slate-300";
        else if (total > 0 && n >= total) { gaya = "bg-emerald-100 border-emerald-400 text-emerald-800 font-black"; hariPenuh++; hariTerisi++; }
        else if (n > 0) { gaya = "bg-amber-50 border-amber-300 text-amber-800 font-bold"; hariTerisi++; }
        const hariIniCls = key === hariIni ? " ring-2 ring-blue-500" : "";
        sel += `
            <button type="button" ${masaDepan ? "disabled" : `onclick="lompatKeTanggalKebiasaan('${key}')"`}
                class="p-1.5 rounded-xl border-2 flex flex-col items-center justify-center ${gaya}${hariIniCls}" aria-label="${d} ${namaBulan[bln - 1]}, ${n} dari ${total} kebiasaan">
                <span class="text-xs font-bold">${d}</span>
                <span class="text-[9px] mt-0.5">${masaDepan ? "" : n + "/" + total}</span>
            </button>`;
    }

    container.innerHTML = `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
                <button type="button" onclick="geserBulanKebiasaan(-1)" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" aria-label="Bulan sebelumnya"><i class="fas fa-chevron-left"></i></button>
                <span class="font-extrabold text-sm text-slate-800">${namaBulan[bln - 1]} ${tahun}</span>
                <button type="button" ${bisaMaju ? "" : "disabled"} onclick="geserBulanKebiasaan(1)" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 ${bisaMaju ? "" : "opacity-40 cursor-not-allowed"}" aria-label="Bulan berikutnya"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="grid grid-cols-7 gap-1.5 text-center font-bold text-[10px] text-slate-400">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
            </div>
            <div class="grid grid-cols-7 gap-1.5">${sel}</div>
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
                <div class="bg-emerald-50 rounded-xl p-2"><span class="text-[10px] text-emerald-700 block">Hari Tuntas</span><span class="font-black text-emerald-700">${hariPenuh}</span></div>
                <div class="bg-amber-50 rounded-xl p-2"><span class="text-[10px] text-amber-700 block">Hari Terisi</span><span class="font-black text-amber-700">${hariTerisi}</span></div>
            </div>
            <div class="flex flex-wrap gap-3 text-[10px] text-slate-500 font-semibold">
                <span><i class="fas fa-square text-emerald-300 mr-1"></i>Semua tuntas</span>
                <span><i class="fas fa-square text-amber-200 mr-1"></i>Sebagian</span>
                <span><i class="fas fa-square text-slate-200 mr-1"></i>Belum diisi</span>
            </div>
            <p class="text-[10px] text-slate-400">Ketuk tanggal untuk melihat rincian hari itu.</p>
        </div>`;
}

function lompatKeTanggalKebiasaan(tanggal) {
    const el = document.getElementById("kebiasaan-date");
    if (el) el.value = tanggal;
    kebiasaanTab = "hari-ini";
    const dateWrap = document.getElementById("kebiasaan-date-wrap");
    if (dateWrap) dateWrap.classList.remove("hidden");
    loadKebiasaanData(true);
}

function cetakPDFKebiasaan() {
    const selectedSiswaId = getSiswaKebiasaanTerpilih();
    if (!selectedSiswaId || selectedSiswaId === "ALL") {
        Swal.fire({ icon: "warning", title: "Pilih Siswa", text: "Silakan pilih siswa terlebih dahulu sebelum mencetak.", confirmButtonColor: "#2563eb" });
        return;
    }

    const siswa = appState.siswa.find(s => String(s.id) === String(selectedSiswaId));
    const kls = siswa ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;
    const tanggal = getTanggalKebiasaan();
    const todayRecords = (appState.kebiasaan || []).filter(k =>
        String(k.siswa_id) === String(selectedSiswaId) && String(k.tanggal) === String(tanggal));

    const rowsHtml = MASTER_KEBIASAAN.map((k, idx) => {
        const rec = todayRecords.find(item => String(item.kebiasaan_id) === String(k.id));
        const sudah = !!rec && rec.status === "Sudah";
        return `
            <tr>
                <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
                <td style="padding: 6px 8px; text-align: left;">${escapeHtml(k.nama)}</td>
                <td style="padding: 6px 6px; text-align: center; font-weight: bold;">${sudah ? "Sudah" : "Belum"}</td>
                <td style="padding: 6px 6px; text-align: center;">${sudah && rec.jam ? escapeHtml(rec.jam) : "-"}</td>
                <td style="padding: 6px 8px; text-align: left;">${sudah && rec.detail ? escapeHtml(rec.detail) : "-"}</td>
            </tr>`;
    }).join("");

    const total = MASTER_KEBIASAAN.length;
    const selesai = todayRecords.filter(k => k.status === "Sudah").length;
    const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;

    const contentHtml = `
        <p style="margin: 0 0 8px 0; font-size: 12px;">
            Nama Siswa: <b>${escapeHtml(siswa ? siswa.nama : "-")}</b> &nbsp;|&nbsp;
            Kelas: <b>${kls ? escapeHtml(kls.nama_kelas) : "-"}</b> &nbsp;|&nbsp;
            Tanggal: <b>${escapeHtml(formatTanggalLabel(tanggal))}</b> &nbsp;|&nbsp;
            Ketercapaian: <b>${selesai}/${total} (${persen}%)</b>
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 6px; text-align: left;">Kebiasaan</th>
                    <th style="padding: 8px 6px; width: 60px;">Status</th>
                    <th style="padding: 8px 6px; width: 50px;">Jam</th>
                    <th style="padding: 8px 6px; text-align: left;">Keterangan</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>`;

    exportFeaturePDF(
        "RINGKASAN CAPAIAN 7 KEBIASAAN HEBAT SISWA",
        contentHtml,
        `Rekap_Kebiasaan_${siswa ? siswa.nama.replace(/\s+/g, "_") : selectedSiswaId}_${tanggal}.pdf`
    );
}