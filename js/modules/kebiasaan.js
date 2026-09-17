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

    container.innerHTML = MASTER_KEBIASAAN.map(k => {
        const rec = appState.kebiasaan.find(item => String(item.siswa_id) === String(selectedSiswaId) && String(item.kebiasaan_id) === String(k.id)) || { status: 'Belum' };

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
}

function saveKebiasaanItem(siswa_id, kebiasaan_id, status) {
    const tanggalInput = document.getElementById("kebiasaan-date");
    const tanggal = tanggalInput ? tanggalInput.value : getDateWITA();

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