async function loadKebiasaanData(forceRefresh = false) {
    const dateInput = document.getElementById("kebiasaan-date");
    const tanggal = dateInput ? (dateInput.value || getDateWITA()) : getDateWITA();
    if (dateInput) dateInput.value = tanggal;

    const selectSiswa = document.getElementById("kebiasaan-siswa-select");
    if (selectSiswa && appState.siswa.length > 0 && selectSiswa.options.length === 0) {
        selectSiswa.innerHTML = appState.siswa.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join("");
    }

    const isStale = (Date.now() - (lastFetchTimes.kebiasaan || 0)) > CACHE_TTL;

    if (appState.kebiasaan && appState.kebiasaan.length > 0) {
        renderKebiasaanView();
    } else {
        renderSkeleton("kebiasaan-list-container", 4);
    }

    if (forceRefresh || isStale || !appState.kebiasaan || appState.kebiasaan.length === 0) {
        const res = await apiCall("getKebiasaan", { tanggal }, false);
        if (res && res.data) {
            appState.kebiasaan = res.data;
            lastFetchTimes.kebiasaan = Date.now();
            saveAppStateToLocal();
            renderKebiasaanView();
        }
    }
}

function renderKebiasaanView() {
    const container = document.getElementById("kebiasaan-list-container");
    const selectSiswa = document.getElementById("kebiasaan-siswa-select");
    if (!container || !selectSiswa) return;

    const selectedSiswaId = selectSiswa.value || (appState.siswa[0] ? appState.siswa[0].id : null);
    if (!selectedSiswaId) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-user-slash text-2xl mb-2"></i><p class="text-xs text-slate-500">Belum ada data siswa untuk dipantau kebiasaannya.</p></div>`;
        return;
    }

    const isEditable = appState.user && (appState.user.role === 'admin' || appState.user.role === 'guru' || (appState.user.role === 'siswa' && String(appState.user.id) === String(selectedSiswaId)));

    const studentRecords = appState.kebiasaan.filter(k => String(k.siswa_id) === String(selectedSiswaId));
    const tanggalInput = document.getElementById("kebiasaan-date");
    const tanggal = tanggalInput ? (tanggalInput.value || getDateWITA()) : getDateWITA();
    
    const todayRecords = studentRecords.filter(k => String(k.tanggal) === String(tanggal));
    const completedToday = todayRecords.filter(k => k.status === 'Sudah').length;
    const persenTuntas = Math.round((completedToday / 7) * 100);

    const totalSemuaSudah = studentRecords.filter(k => k.status === 'Sudah').length;

    let badgeTitle = "Prajurit Karakter";
    let badgeIcon = "fa-shield-halved";
    let badgeColor = "bg-blue-500 text-white";

    if (completedToday === 7) {
        badgeTitle = "Bintang 7 Kebiasaan Hari Ini ⭐";
        badgeIcon = "fa-crown";
        badgeColor = "bg-amber-500 text-white";
    } else if (completedToday >= 4) {
        badgeTitle = "Pejuang Hebat 💪";
        badgeIcon = "fa-medal";
        badgeColor = "bg-emerald-500 text-white";
    }

    const gamificationCard = `
        <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-4 text-white shadow-md space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <span class="w-10 h-10 rounded-2xl ${badgeColor} flex items-center justify-center text-lg shadow-inner">
                        <i class="fas ${badgeIcon}"></i>
                    </span>
                    <div>
                        <span class="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">Status Pencapaian</span>
                        <h3 class="text-sm font-black text-white leading-tight">${badgeTitle}</h3>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xl font-black text-amber-300">${completedToday}/7</span>
                    <span class="text-[10px] text-blue-200 block font-medium">Kebiasaan</span>
                </div>
            </div>

            <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-bold">
                    <span class="text-blue-100">Ketercapaian Hari Ini</span>
                    <span class="text-amber-300">${persenTuntas}%</span>
                </div>
                <div class="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div class="bg-amber-400 h-full rounded-full transition-all duration-500" style="width: ${persenTuntas}%"></div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center text-xs">
                <div class="bg-white/10 rounded-xl p-1.5">
                    <span class="text-[10px] text-blue-200 block">Selesai</span>
                    <span class="font-black text-emerald-300">${completedToday}</span>
                </div>
                <div class="bg-white/10 rounded-xl p-1.5">
                    <span class="text-[10px] text-blue-200 block">Kadang</span>
                    <span class="font-black text-amber-300">${todayRecords.filter(k => k.status === 'Kadang').length}</span>
                </div>
                <div class="bg-white/10 rounded-xl p-1.5">
                    <span class="text-[10px] text-blue-200 block">Total Poin</span>
                    <span class="font-black text-white">${totalSemuaSudah * 10}</span>
                </div>
            </div>
        </div>
    `;

    const itemsHtml = MASTER_KEBIASAAN.map(k => {
        const rec = todayRecords.find(item => String(item.kebiasaan_id) === String(k.id)) || { status: 'Belum' };

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl ${k.color} flex items-center justify-center text-lg">
                        <i class="fas ${k.icon}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(k.nama)}</h4>
                        <span class="text-xs font-bold uppercase ${rec.status === 'Sudah' ? 'text-emerald-600' : (rec.status === 'Kadang' ? 'text-amber-600' : 'text-slate-400')}">${rec.status}</span>
                    </div>
                </div>
                <div class="flex gap-1">
                    ${[
                { val: 'Sudah', label: 'Sudah', cls: 'bg-emerald-600 text-white' },
                { val: 'Kadang', label: 'Kadang', cls: 'bg-amber-500 text-white' },
                { val: 'Belum', label: 'Belum', cls: 'bg-slate-700 text-white' }
            ].map(st => `
                        <button ${isEditable ? `onclick="saveKebiasaanItem('${escapeHtml(selectedSiswaId)}', '${k.id}', '${st.val}')"` : 'disabled'}
                                class="px-2.5 py-1 rounded-lg text-xs font-bold ${rec.status === st.val ? st.cls : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} transition">
                            ${st.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div class="space-y-3">
            ${gamificationCard}
            ${itemsHtml}
        </div>
    `;
}

function saveKebiasaanItem(siswa_id, kebiasaan_id, status) {
    const tanggalInput = document.getElementById("kebiasaan-date");
    const tanggal = tanggalInput ? (tanggalInput.value || getDateWITA()) : getDateWITA();

    const existingIndex = appState.kebiasaan.findIndex(k =>
        String(k.siswa_id) === String(siswa_id) &&
        String(k.tanggal) === String(tanggal) &&
        String(k.kebiasaan_id) === String(kebiasaan_id)
    );

    if (existingIndex !== -1) {
        appState.kebiasaan[existingIndex].status = status;
    } else {
        appState.kebiasaan.push({ siswa_id, tanggal, kebiasaan_id, status });
    }

    saveAppStateToLocal();
    renderKebiasaanView();

    const todaySudah = appState.kebiasaan.filter(k => String(k.siswa_id) === String(siswa_id) && String(k.tanggal) === String(tanggal) && k.status === 'Sudah').length;
    if (todaySudah === 7) {
        showToast("🌟 Luar biasa! Seluruh 7 Kebiasaan Hebat hari ini telah tuntas!");
    }

    const queueKey = `${siswa_id}_${kebiasaan_id}_${tanggal}`;
    pendingKebiasaanQueue.set(queueKey, { tanggal, siswa_id, kebiasaan_id, status });

    updateKebiasaanSaveStatus('saving');

    if (kebiasaanDebounceTimer) clearTimeout(kebiasaanDebounceTimer);
    kebiasaanDebounceTimer = setTimeout(async () => {
        await flushKebiasaanQueue();
    }, 1500);
}

async function flushKebiasaanQueue() {
    if (pendingKebiasaanQueue.size === 0) return;

    const entriesToSave = Array.from(pendingKebiasaanQueue.entries());

    for (const [key, item] of entriesToSave) {
        const res = await apiCall("saveKebiasaan", item, false);
        if (res && res.status === "success") {
            pendingKebiasaanQueue.delete(key);
        }
    }

    if (pendingKebiasaanQueue.size === 0) {
        updateKebiasaanSaveStatus('saved');
    } else {
        showToast("Beberapa data kebiasaan gagal disinkronkan. Akan dicoba kembali.", "warning");
    }
}

function updateKebiasaanSaveStatus(state) {
    const badge = document.getElementById("kebiasaan-save-status");
    if (!badge) return;

    if (state === 'saving') {
        badge.className = "text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 shadow-sm";
        badge.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-600"></i> Menyimpan...`;
    } else if (state === 'saved') {
        badge.className = "text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 shadow-sm";
        badge.innerHTML = `<i class="fas fa-check-circle text-emerald-600"></i> Tersimpan`;

        setTimeout(() => {
            if (pendingKebiasaanQueue.size === 0) badge.classList.add("hidden");
        }, 3000);
    }
}