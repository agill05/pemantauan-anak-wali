function renderAdminManage() { switchAdminTab("guru"); }

function switchAdminTab(tab) {
    document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.add("hidden"));
    document.querySelectorAll(".admin-tab-btn").forEach(b => {
        b.classList.remove("bg-white", "text-primary", "shadow-sm", "bg-surface");
        b.classList.add("text-slate-600");
    });

    const target = document.getElementById(`admin-tab-${tab}`);
    const targetBtn = document.getElementById(`btn-admin-tab-${tab}`);

    if (target) target.classList.remove("hidden");
    if (targetBtn) {
        targetBtn.classList.add("bg-white", "text-primary", "shadow-sm");
        targetBtn.classList.remove("text-slate-600");
    }

    if (tab === "guru") renderAdminGuru();
    if (tab === "siswa") renderAdminSiswa();
    if (tab === "kelas") renderAdminKelas();
    if (tab === "mentor") renderAdminMentor();
    if (tab === "sekolah") renderAdminSekolah();
    if (tab === "kebiasaan") renderAdminKebiasaan();
}

function renderAdminSekolah() {
    const nama = document.getElementById("m-skl-kepsek");
    const nip = document.getElementById("m-skl-nip-kepsek");
    if (nama) nama.value = appState.pengaturan?.nama_kepsek || "";
    if (nip) nip.value = appState.pengaturan?.nip_kepsek || "";
}

async function saveSekolahForm(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-save-sekolah");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const payload = {
        nama_kepsek: document.getElementById("m-skl-kepsek").value,
        nip_kepsek: document.getElementById("m-skl-nip-kepsek").value,
    };

    const res = await apiCall("savePengaturan", payload, true);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }

    if (res && res.status === "success") {
        appState.pengaturan = { ...appState.pengaturan, ...payload };
        saveAppStateToLocal();
        showToast("Data Kepala Sekolah tersimpan!");
    } else {
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: res?.message || 'Terjadi kesalahan.', confirmButtonColor: '#2563eb' });
    }
}

function renderAdminGuru() {
    const list = document.getElementById("admin-guru-list");
    if (!list) return;

    const query = (document.getElementById("search-guru-input")?.value || "").toLowerCase();
    const filtered = appState.guru.filter(g => safeStr(g.nama).toLowerCase().includes(query) || safeStr(g.username).toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-chalkboard-teacher text-xl mb-1"></i><p class="text-xs">Belum ada Guru.</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(g => `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
                <h4 class="font-bold text-xs text-slate-800">${escapeHtml(g.nama)}</h4>
                <p class="text-xs text-slate-400">Username: ${escapeHtml(g.username)} | NIP: ${escapeHtml(g.nip || '-')}</p>
                ${renderPeranBadgesGuru(g)}
            </div>
            <div class="flex gap-1">
                <button onclick="openModalGuru('${escapeHtml(g.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit data guru"><i class="fas fa-edit"></i></button>
                <button onclick="deleteGuru('${escapeHtml(g.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus data guru"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join("");
}

function getBinaanCount(guruId) {
    return (appState.siswa || []).filter(s => String(s.mentor_id || "").trim() === String(guruId)).length;
}

function getKelasWaliGuru(guruId) {
    return (appState.kelas || []).find(k => String(k.guru_id) === String(guruId)) || null;
}

function getNamaMentorSiswa(siswa) {
    const mid = String(siswa.mentor_id || "").trim();
    if (!mid) return "Belum ada";
    const g = (appState.guru || []).find(x => String(x.id) === mid);
    return g ? g.nama : "(guru tidak ditemukan)";
}

function renderPeranBadgesGuru(g) {
    const kls = getKelasWaliGuru(g.id);
    const n = getBinaanCount(g.id);
    const badges = [];
    if (kls) badges.push(`<span class="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">Wali ${escapeHtml(kls.nama_kelas)}</span>`);
    if (n > 0) badges.push(`<span class="px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[10px] font-bold">Mentor ${n} siswa</span>`);
    return badges.length ? `<div class="flex flex-wrap gap-1 mt-1">${badges.join("")}</div>` : "";
}

function renderAdminSiswa() {
    const list = document.getElementById("admin-siswa-list");
    if (!list) return;

    const query = (document.getElementById("search-admin-siswa-input")?.value || "").toLowerCase();
    const rawFiltered = appState.siswa.filter(s => safeStr(s.nama).toLowerCase().includes(query) || safeStr(s.nisn).toLowerCase().includes(query));
    const filtered = sortSiswa(rawFiltered);

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-user-graduate text-xl mb-1"></i><p class="text-xs">Belum ada Siswa.</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(s => `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
                <h4 class="font-bold text-xs text-slate-800">${s.no_absen ? `[${s.no_absen}] ` : ''}${escapeHtml(s.nama)}</h4>
                <p class="text-xs text-slate-400">Username: ${escapeHtml(s.username)} | NISN: ${escapeHtml(s.nisn || '-')}</p>
                <p class="text-xs text-slate-400">Mentor: ${escapeHtml(getNamaMentorSiswa(s))}</p>
            </div>
            <div class="flex gap-1">
                <button onclick="openModalSiswa('${escapeHtml(s.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit data siswa"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSiswa('${escapeHtml(s.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus data siswa"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join("");
}

function renderAdminMentor() {
    const list = document.getElementById("admin-mentor-list");
    if (!list) return;

    const query = (document.getElementById("search-mentor-input")?.value || "").toLowerCase();
    const filtered = (appState.guru || []).filter(g => safeStr(g.nama).toLowerCase().includes(query) || safeStr(g.username).toLowerCase().includes(query));

    const tanpaMentor = (appState.siswa || []).filter(s => !String(s.mentor_id || "").trim()).length;
    const summary = document.getElementById("admin-mentor-summary");
    if (summary) summary.textContent = `${(appState.siswa || []).length} siswa, ${tanpaMentor} belum punya mentor.`;

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-chalkboard-teacher text-xl mb-1"></i><p class="text-xs">Guru tidak ditemukan.</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(g => {
        const n = getBinaanCount(g.id);
        return `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div>
                <h4 class="font-bold text-xs text-slate-800">${escapeHtml(g.nama)}</h4>
                <p class="text-xs text-slate-400">Anak binaan: ${n} siswa</p>
                ${renderPeranBadgesGuru(g)}
            </div>
            <button onclick="openModalMentor('${escapeHtml(g.id)}')" class="px-3 py-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold" aria-label="Atur anak binaan guru">
                <i class="fas fa-user-tag mr-1"></i> Atur
            </button>
        </div>`;
    }).join("");
}

let _mentorModal = null;

function openModalMentor(guruId) {
    const box = document.getElementById("modal-content-box");
    const g = (appState.guru || []).find(x => String(x.id) === String(guruId));
    if (!box || !g) return;

    const awal = (appState.siswa || []).filter(s => String(s.mentor_id || "").trim() === String(guruId)).map(s => String(s.id));
    _mentorModal = { guruId: String(guruId), awal: new Set(awal), sel: new Set(awal) };

    const kelasOpts = (appState.kelas || []).map(k => `<option value="${escapeHtml(k.id)}">${escapeHtml(k.nama_kelas)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <div>
                <h3 class="text-sm font-bold text-slate-800">Atur Anak Binaan</h3>
                <p class="text-[11px] text-slate-400">Mentor: ${escapeHtml(g.nama)}</p>
            </div>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-2">
            <input type="text" id="m-mentor-search" oninput="renderMentorSiswaList()" placeholder="Cari siswa..." class="bg-slate-50 border p-2 rounded-xl text-xs outline-none">
            <select id="m-mentor-kelas" onchange="renderMentorSiswaList()" class="bg-slate-50 border p-2 rounded-xl text-xs outline-none">
                <option value="">Semua Kelas</option>
                ${kelasOpts}
            </select>
        </div>
        <div class="flex items-center justify-between mb-2 text-xs">
            <span id="m-mentor-count" class="font-bold text-slate-600"></span>
            <span class="flex gap-1">
                <button type="button" onclick="mentorPilihTampil(true)" class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold">Pilih tampil</button>
                <button type="button" onclick="mentorPilihTampil(false)" class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold">Lepas tampil</button>
            </span>
        </div>
        <div id="m-mentor-list" class="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1"></div>
        <button type="button" id="btn-save-mentor" onclick="saveMentorForm()" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-3">Simpan Anak Binaan</button>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
    renderMentorSiswaList();
}

function _mentorSiswaTampil() {
    const q = (document.getElementById("m-mentor-search")?.value || "").toLowerCase();
    const kid = document.getElementById("m-mentor-kelas")?.value || "";
    const hasil = (appState.siswa || []).filter(s =>
        (!kid || String(s.kelas_id) === String(kid)) &&
        (!q || safeStr(s.nama).toLowerCase().includes(q) || safeStr(s.nisn).toLowerCase().includes(q))
    );
    return sortSiswa(hasil);
}

function renderMentorSiswaList() {
    const list = document.getElementById("m-mentor-list");
    if (!list || !_mentorModal) return;

    const tampil = _mentorSiswaTampil();
    if (tampil.length === 0) {
        list.innerHTML = `<div class="empty-state"><p class="text-xs">Siswa tidak ditemukan.</p></div>`;
    } else {
        list.innerHTML = tampil.map(s => {
            const sid = String(s.id);
            const kls = (appState.kelas || []).find(k => String(k.id) === String(s.kelas_id));
            const mid = String(s.mentor_id || "").trim();
            const milikLain = mid && mid !== _mentorModal.guruId;
            const mentorLain = milikLain ? (appState.guru || []).find(x => String(x.id) === mid) : null;
            const info = milikLain
                ? `<span class="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 font-bold">Mentor: ${escapeHtml(mentorLain ? mentorLain.nama : "?")}</span>`
                : "";
            return `
            <label class="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-2.5 py-2 cursor-pointer">
                <input type="checkbox" ${_mentorModal.sel.has(sid) ? "checked" : ""} onchange="toggleMentorSiswa('${escapeHtml(sid)}', this.checked)">
                <span class="flex-1 min-w-0">
                    <span class="block text-xs font-bold text-slate-800 truncate">${s.no_absen ? `[${escapeHtml(s.no_absen)}] ` : ""}${escapeHtml(s.nama)}</span>
                    <span class="block text-[11px] text-slate-400">${kls ? "Kelas " + escapeHtml(kls.nama_kelas) : "Tanpa kelas"}</span>
                </span>
                ${info}
            </label>`;
        }).join("");
    }
    _updateMentorCount();
}

function _updateMentorCount() {
    const el = document.getElementById("m-mentor-count");
    if (el && _mentorModal) el.textContent = `${_mentorModal.sel.size} siswa dipilih`;
}

function toggleMentorSiswa(sid, checked) {
    if (!_mentorModal) return;
    if (checked) _mentorModal.sel.add(String(sid));
    else _mentorModal.sel.delete(String(sid));
    _updateMentorCount();
}

function mentorPilihTampil(pilih) {
    if (!_mentorModal) return;
    _mentorSiswaTampil().forEach(s => {
        if (pilih) _mentorModal.sel.add(String(s.id));
        else _mentorModal.sel.delete(String(s.id));
    });
    renderMentorSiswaList();
}

async function saveMentorForm() {
    if (!_mentorModal) return;
    const { guruId, sel, awal } = _mentorModal;

    const dipindah = [...sel].filter(sid => {
        const s = (appState.siswa || []).find(x => String(x.id) === sid);
        const mid = s ? String(s.mentor_id || "").trim() : "";
        return mid && mid !== guruId;
    }).length;
    const dilepas = [...awal].filter(sid => !sel.has(sid)).length;

    if (dipindah > 0 || dilepas > 0) {
        const parts = [];
        if (dipindah > 0) parts.push(`${dipindah} siswa dipindah dari mentor lain`);
        if (dilepas > 0) parts.push(`${dilepas} siswa dilepas dari guru ini`);
        const c = await Swal.fire({ title: 'Simpan perubahan?', text: parts.join(', ') + '.', icon: 'question', showCancelButton: true, confirmButtonColor: '#2563eb', confirmButtonText: 'Ya, Simpan', cancelButtonText: 'Batal' });
        if (!c.isConfirmed) return;
    }

    const btn = document.getElementById("btn-save-mentor");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const res = await apiCall("setMentorBatch", { guru_id: guruId, siswa_ids: [...sel], mode: "replace" }, true);

    if (res && res.status === "success") {
        closeModal();
        _mentorModal = null;
        showToast(res.message || "Anak binaan diperbarui!");
        await fetchAllAppData(true);
        renderAdminMentor();
        renderAdminGuru();
        renderAdminSiswa();
        _refreshAllSiswaDropdowns();
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-70", "cursor-not-allowed");
            btn.innerHTML = originalHtml;
        }
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: res?.message || 'Terjadi kesalahan saat mengatur mentor.', confirmButtonColor: '#2563eb' });
    }
}

function renderAdminKelas() {
    const list = document.getElementById("admin-kelas-list");
    if (!list) return;

    if (appState.kelas.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-door-open text-xl mb-1"></i><p class="text-xs">Belum ada Kelas.</p></div>`;
        return;
    }

    list.innerHTML = appState.kelas.map(k => {
        const wali = appState.guru.find(g => String(g.id) === String(k.guru_id));
        return `
            <div class="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div>
                    <h4 class="font-bold text-xs text-slate-800">Kelas ${escapeHtml(k.nama_kelas)}</h4>
                    <p class="text-xs text-slate-400">Wali Kelas: ${wali ? escapeHtml(wali.nama) : 'Belum ditentukan'}</p>
                </div>
                <div class="flex gap-1">
                    <button onclick="openModalKelas('${escapeHtml(k.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit data kelas"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteKelas('${escapeHtml(k.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus data kelas"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join("");
}

function openModalGuru(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const g = id ? appState.guru.find(x => String(x.id) === String(id)) : null;

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${g ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveGuruForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-guru-nama" class="block text-xs font-bold text-slate-500 mb-1">NAMA LENGKAP</label>
                <input type="text" id="m-guru-nama" value="${escapeHtml(g?.nama || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-guru-user" class="block text-xs font-bold text-slate-500 mb-1">USERNAME</label>
                    <input type="text" id="m-guru-user" value="${escapeHtml(g?.username || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
                <div>
                    <label for="m-guru-nip" class="block text-xs font-bold text-slate-500 mb-1">NIP</label>
                    <input type="text" id="m-guru-nip" value="${escapeHtml(g?.nip || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                </div>
            </div>
            <div>
                <label for="m-guru-pwd" class="block text-xs font-bold text-slate-500 mb-1">PASSWORD ${g ? '(Kosongkan jika tidak diganti)' : '(Opsional)'}</label>
                <div class="relative">
                    <input type="password" id="m-guru-pwd" class="w-full bg-slate-50 border p-2.5 pr-9 rounded-xl text-xs outline-none" placeholder="${g ? '' : 'Kosongkan untuk pakai password default'}">
                    <button type="button" onclick="togglePasswordVisibility('m-guru-pwd', this)" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Tampilkan kata sandi">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <p class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mt-1.5 flex items-start gap-1.5">
                    <i class="fas fa-triangle-exclamation mt-0.5"></i>
                    <span>Jika dikosongkan, password akan diset otomatis ke <b>guru123</b>. Sarankan pengguna segera menggantinya — sistem akan memaksa ganti password saat login pertama.</span>
                </p>
            </div>
            <div>
                <label for="m-guru-hp" class="block text-xs font-bold text-slate-500 mb-1">NO. TELEPON / WA</label>
                <input type="text" id="m-guru-hp" value="${escapeHtml(normalizePhone(g?.no_hp))}" oninput="validatePhoneField(this)" placeholder="08xxxxxxxxxx" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                <p id="m-guru-hp-error" class="hidden text-[10px] text-rose-500 mt-1 font-semibold"><i class="fas fa-circle-exclamation"></i> Format nomor tidak valid. Gunakan 08xxxxxxxxxx (10-14 digit).</p>
            </div>
            <button type="submit" id="btn-save-guru" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Guru</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveGuruForm(e, id) {
    e.preventDefault();

    const hpInput = document.getElementById("m-guru-hp");
    if (hpInput && !validatePhoneField(hpInput)) {
        hpInput.focus();
        return;
    }

    const btn = document.getElementById("btn-save-guru");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const payload = {
        id: id || null,
        nama: document.getElementById("m-guru-nama").value,
        username: document.getElementById("m-guru-user").value,
        password: document.getElementById("m-guru-pwd").value,
        nip: document.getElementById("m-guru-nip").value,
        no_hp: normalizePhone(document.getElementById("m-guru-hp").value)
    };

    const res = await apiCall("saveGuru", payload, true);
    if (res && res.status === "success") {
        closeModal();
        showToast("Data Guru diperbarui!");
        await fetchAllAppData(true);
        renderAdminGuru();
        _refreshAllSiswaDropdowns();
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-70", "cursor-not-allowed");
            btn.innerHTML = originalHtml;
        }
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: res?.message || 'Terjadi kesalahan saat menyimpan data guru.', confirmButtonColor: '#2563eb' });
    }
}

async function deleteGuru(id) {
    const confirm = await Swal.fire({ title: 'Hapus Guru?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteGuru", { id }, true);
        if (res && res.status === "success") {
            await fetchAllAppData(true);
            renderAdminGuru();
            _refreshAllSiswaDropdowns();
        } else {
            Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: res?.message || 'Terjadi kesalahan saat menghapus data guru.', confirmButtonColor: '#2563eb' });
        }
    }
}

function openModalKelas(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    const k = id ? appState.kelas.find(x => String(x.id) === String(id)) : null;
    const guruOpts = appState.guru.map(g => `<option value="${g.id}" ${k?.guru_id === g.id ? 'selected' : ''}>${escapeHtml(g.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${k ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveKelasForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-kls-nama" class="block text-xs font-bold text-slate-500 mb-1">NAMA KELAS (Contoh: 7A, 8B)</label>
                <input type="text" id="m-kls-nama" value="${escapeHtml(k?.nama_kelas || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div>
                <label for="m-kls-guru" class="block text-xs font-bold text-slate-500 mb-1">WALI KELAS</label>
                <select id="m-kls-guru" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                    <option value="">Pilih Wali Kelas</option>
                    ${guruOpts}
                </select>
            </div>
            <button type="submit" id="btn-save-kelas" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Kelas</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveKelasForm(e, id) {
    e.preventDefault();

    const btn = document.getElementById("btn-save-kelas");
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.classList.add("opacity-70", "cursor-not-allowed");
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const payload = {
        id: id || null,
        nama_kelas: document.getElementById("m-kls-nama").value,
        guru_id: document.getElementById("m-kls-guru").value
    };

    const res = await apiCall("saveKelas", payload, true);
    if (res && res.status === "success") {
        closeModal();
        showToast("Data kelas diperbarui!");
        await fetchAllAppData(true);
        renderAdminKelas();
        _refreshAllSiswaDropdowns();
    } else {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-70", "cursor-not-allowed");
            btn.innerHTML = originalHtml;
        }
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: res?.message || 'Terjadi kesalahan saat menyimpan data kelas.', confirmButtonColor: '#2563eb' });
    }
}

async function deleteKelas(id) {
    const confirm = await Swal.fire({ title: 'Hapus Kelas?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        const res = await apiCall("deleteKelas", { id }, true);
        if (res && res.status === "success") {
            await fetchAllAppData(true);
            renderAdminKelas();
            _refreshAllSiswaDropdowns();
        } else {
            Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: res?.message || 'Terjadi kesalahan saat menghapus data kelas.', confirmButtonColor: '#2563eb' });
        }
    }
}

function downloadTemplateGuruCSV() {
    const csvContent = "\uFEFF" + "username,nama,nip,no_hp,password\n" +
        "guru01,Contoh Nama Guru,196501011990031001,081234567890,\n";
    _downloadCSVString(csvContent, "Template_Import_Guru.csv");
    showToast("Template CSV Guru berhasil diunduh!");
}

function exportGuruCSV() {
    if (!appState.guru || appState.guru.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Tidak ada data guru untuk diekspor.', confirmButtonColor: '#2563eb' });
        return;
    }
    const rows = appState.guru.map(g => ({
        username: g.username || "",
        nama: g.nama || "",
        nip: g.nip || "",
        no_hp: normalizePhone(g.no_hp),
        password: ""
    }));
    const csvContent = "\uFEFF" + Papa.unparse(rows, { columns: ["username", "nama", "nip", "no_hp", "password"] });
    _downloadCSVString(csvContent, `Data_Guru_SMPN1TalagaJaya_${getDateWITA()}.csv`);
    showToast("Data Guru berhasil diekspor ke CSV!");
}

function triggerImportGuru() {
    const input = document.getElementById("import-guru-file");
    if (input) {
        input.value = "";
        input.click();
    }
}

function handleImportGuruFile(event) {
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
                title: `Import ${rows.length} Data Guru?`,
                text: 'Data dengan username yang sudah ada akan diperbarui (UPSERT). Data baru akan ditambahkan dengan password default "guru123" jika kolom password kosong.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Ya, Import Sekarang',
                cancelButtonText: 'Batal'
            });
            if (!confirm.isConfirmed) return;

            showLoading("Mengimpor data guru...");
            const res = await apiCall("importGuruBatch", { rows }, true);
            hideLoading();

            if (res && res.status === "success") {
                await fetchAllAppData(true);
                renderAdminGuru();
                _refreshAllSiswaDropdowns();
                Swal.fire({ icon: 'success', title: 'Import Selesai', text: res.message, confirmButtonColor: '#2563eb' });
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal Import', text: res?.message || 'Terjadi kesalahan saat import data guru.', confirmButtonColor: '#2563eb' });
            }
        },
        error: () => {
            Swal.fire({ icon: 'error', title: 'Gagal Membaca File', text: 'Pastikan file berformat CSV yang valid.', confirmButtonColor: '#2563eb' });
        }
    });
}

function _downloadCSVString(csvContent, filename) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


// =====================================================================
// PENGATURAN KEBIASAAN (Tahap 4, admin)
// Sumber data: sheet KonfigKebiasaan lewat getKonfigKebiasaan / saveKonfigKebiasaan.
// Kebiasaan tidak dihapus, hanya dinonaktifkan, supaya riwayat siswa tetap utuh.
// =====================================================================
let adminKonfigKebiasaan = [];
let adminKonfigMemuat = false;
let adminKonfigMenyimpan = false;

// Literal penuh supaya Tailwind menyertakan kelasnya saat build.
const PALET_KEBIASAAN = [
    { label: "Kuning", kelas: "text-amber-500 bg-amber-50" },
    { label: "Hijau", kelas: "text-emerald-500 bg-emerald-50" },
    { label: "Biru", kelas: "text-blue-500 bg-blue-50" },
    { label: "Merah Muda", kelas: "text-rose-500 bg-rose-50" },
    { label: "Indigo", kelas: "text-indigo-500 bg-indigo-50" },
    { label: "Ungu", kelas: "text-purple-500 bg-purple-50" },
    { label: "Abu-abu", kelas: "text-slate-600 bg-slate-100" },
    { label: "Toska", kelas: "text-teal-500 bg-teal-50" },
    { label: "Oranye", kelas: "text-orange-500 bg-orange-50" },
    { label: "Biru Langit", kelas: "text-sky-500 bg-sky-50" },
    { label: "Pink", kelas: "text-pink-500 bg-pink-50" },
    { label: "Hijau Muda", kelas: "text-lime-600 bg-lime-50" }
];

function terapkanKonfigAdmin(list) {
    adminKonfigKebiasaan = (list || []).slice().sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    // Sinkronkan daftar yang dipakai layar kebiasaan di perangkat ini.
    if (typeof applyKonfigKebiasaan === "function") applyKonfigKebiasaan(adminKonfigKebiasaan);
    try { localStorage.setItem("cache_konfig_kebiasaan", JSON.stringify(adminKonfigKebiasaan.filter(k => k.aktif !== false))); } catch (e) { }
    if (typeof kebiasaanKonfigLoaded !== "undefined") kebiasaanKonfigLoaded = true;
}

async function renderAdminKebiasaan(force = false) {
    const list = document.getElementById("admin-kebiasaan-list");
    if (!list) return;
    if (adminKonfigKebiasaan.length > 0) gambarAdminKebiasaan();
    else renderSkeleton("admin-kebiasaan-list", 3);
    if (adminKonfigMemuat || (!force && adminKonfigKebiasaan.length > 0)) return;

    adminKonfigMemuat = true;
    const res = await apiCall("getKonfigKebiasaan", { semua: true }, false);
    adminKonfigMemuat = false;
    if (res && res.status === "success" && Array.isArray(res.data)) {
        terapkanKonfigAdmin(res.data);
        gambarAdminKebiasaan();
    } else if (adminKonfigKebiasaan.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i><p class="text-xs text-slate-500">Pengaturan gagal dimuat. Periksa koneksi lalu buka tab ini lagi.</p></div>`;
    }
}

function gambarAdminKebiasaan() {
    const list = document.getElementById("admin-kebiasaan-list");
    if (!list) return;
    const data = adminKonfigKebiasaan;
    const aktif = data.filter(k => k.aktif !== false).length;
    const ringkas = document.getElementById("admin-kebiasaan-ringkas");
    if (ringkas) ringkas.textContent = `${aktif} aktif dari ${data.length} kebiasaan`;

    list.innerHTML = data.map((k, i) => {
        const on = k.aktif !== false;
        return `
            <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 ${on ? "" : "opacity-60"}">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${escapeHtml(k.warna || "text-slate-600 bg-slate-100")}">
                    <i class="fas ${escapeHtml(k.ikon || "fa-check")}"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(k.id)} \u2022 ${escapeHtml(k.nama)}</p>
                    <p class="text-[11px] text-slate-400 truncate">Jam default ${escapeHtml(k.jam_default || "-")} \u2022 ${on ? "Aktif" : "Nonaktif"}</p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                    <button type="button" onclick="geserKebiasaan(${i}, -1)" ${i === 0 ? "disabled" : ""} class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Naikkan urutan"><i class="fas fa-arrow-up text-xs"></i></button>
                    <button type="button" onclick="geserKebiasaan(${i}, 1)" ${i === data.length - 1 ? "disabled" : ""} class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-30" aria-label="Turunkan urutan"><i class="fas fa-arrow-down text-xs"></i></button>
                    <button type="button" onclick="openModalKebiasaan('${escapeHtml(k.id)}')" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" aria-label="Ubah kebiasaan"><i class="fas fa-pen text-xs"></i></button>
                </div>
            </div>`;
    }).join("") || `<div class="empty-state"><p class="text-xs text-slate-500">Belum ada kebiasaan.</p></div>`;
}

// Kirim ke server. Berhasil: ganti daftar lokal dengan hasil server.
async function kirimKonfigKebiasaan(items) {
    if (adminKonfigMenyimpan) return null;
    adminKonfigMenyimpan = true;
    const res = await apiCall("saveKonfigKebiasaan", { items }, true);
    adminKonfigMenyimpan = false;
    if (res && res.status === "success") {
        if (Array.isArray(res.data)) terapkanKonfigAdmin(res.data);
        gambarAdminKebiasaan();
        return res;
    }
    if (res && res.status === "error") {
        Swal.fire({ icon: "warning", title: "Tidak Tersimpan", text: res.message || "Ditolak server.", confirmButtonColor: "#2563eb" });
    } else {
        showToast("Koneksi bermasalah. Perubahan belum tersimpan.", "warning");
    }
    return null;
}

// Tukar urutan dua kebiasaan yang bersebelahan. Hanya dua baris yang dikirim.
async function geserKebiasaan(idx, arah) {
    const a = adminKonfigKebiasaan[idx];
    const b = adminKonfigKebiasaan[idx + arah];
    if (!a || !b) return;
    const urutA = Number(a.urutan) || (idx + 1);
    let urutB = Number(b.urutan) || (idx + arah + 1);
    if (urutA === urutB) urutB = urutA + arah; // urutan kembar: pisahkan dulu
    const res = await kirimKonfigKebiasaan([
        Object.assign({}, a, { urutan: urutB }),
        Object.assign({}, b, { urutan: urutA })
    ]);
    if (res) showToast("Urutan diperbarui.");
}

function openModalKebiasaan(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    const k = id ? adminKonfigKebiasaan.find(x => String(x.id) === String(id)) : null;
    const warnaAda = k ? PALET_KEBIASAAN.some(p => p.kelas === k.warna) : true;
    const warnaOpts = PALET_KEBIASAAN.map(p => `<option value="${p.kelas}" ${k && k.warna === p.kelas ? "selected" : ""}>${p.label}</option>`).join("") +
        (!warnaAda ? `<option value="${escapeHtml(k.warna)}" selected>Kustom (tetap dipakai)</option>` : "");
    const inp = "w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none";
    const lbl = "block text-xs font-bold text-slate-500 mb-1";
    const urutanBaru = adminKonfigKebiasaan.reduce((m, x) => Math.max(m, Number(x.urutan) || 0), 0) + 1;

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${k ? "Ubah Kebiasaan " + escapeHtml(k.id) : "Tambah Kebiasaan"}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="simpanFormKebiasaan(event, '${k ? escapeHtml(k.id) : ""}')" class="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><label for="m-kb-nama" class="${lbl}">NAMA KEBIASAAN</label>
                <input type="text" id="m-kb-nama" maxlength="60" value="${escapeHtml(k ? k.nama : "")}" class="${inp}" required></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label for="m-kb-singkat" class="${lbl}">NAMA SINGKAT</label>
                    <input type="text" id="m-kb-singkat" maxlength="30" value="${escapeHtml(k ? k.nama_singkat : "")}" class="${inp}" placeholder="Sama dengan nama"></div>
                <div><label for="m-kb-jam" class="${lbl}">JAM DEFAULT (WITA)</label>
                    <input type="time" id="m-kb-jam" value="${escapeHtml(k ? k.jam_default : "")}" class="${inp}"></div>
            </div>
            <div><label for="m-kb-detail" class="${lbl}">KETERANGAN DEFAULT</label>
                <input type="text" id="m-kb-detail" maxlength="200" value="${escapeHtml(k ? k.detail_default : "")}" class="${inp}"></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label for="m-kb-ikon" class="${lbl}">IKON (Font Awesome)</label>
                    <input type="text" id="m-kb-ikon" maxlength="40" value="${escapeHtml(k ? k.ikon : "fa-check")}" oninput="pratinjauKebiasaan()" class="${inp}" placeholder="fa-sun"></div>
                <div><label for="m-kb-warna" class="${lbl}">WARNA</label>
                    <select id="m-kb-warna" onchange="pratinjauKebiasaan()" class="${inp}">${warnaOpts}</select></div>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-500">
                <span id="m-kb-pratinjau" class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 bg-slate-100"><i class="fas fa-check"></i></span>
                Pratinjau ikon. Cari nama ikon gratis di fontawesome.com/icons, tulis seperti fa-sun.
            </div>
            <div><label for="m-kb-label-jam" class="${lbl}">LABEL ISIAN JAM</label>
                <input type="text" id="m-kb-label-jam" maxlength="60" value="${escapeHtml(k ? k.label_jam : "Jam (WITA)")}" class="${inp}"></div>
            <div><label for="m-kb-label-detail" class="${lbl}">LABEL ISIAN KETERANGAN</label>
                <input type="text" id="m-kb-label-detail" maxlength="60" value="${escapeHtml(k ? k.label_detail : "Keterangan")}" class="${inp}"></div>
            <div><label for="m-kb-placeholder" class="${lbl}">CONTOH ISIAN (placeholder)</label>
                <input type="text" id="m-kb-placeholder" maxlength="200" value="${escapeHtml(k ? k.placeholder_detail : "")}" class="${inp}"></div>
            <div class="grid grid-cols-2 gap-2">
                <div><label for="m-kb-urutan" class="${lbl}">URUTAN</label>
                    <input type="number" id="m-kb-urutan" min="1" max="99" value="${k ? (Number(k.urutan) || 1) : urutanBaru}" class="${inp}"></div>
                <div><label for="m-kb-aktif" class="${lbl}">STATUS</label>
                    <select id="m-kb-aktif" class="${inp}">
                        <option value="Aktif" ${!k || k.aktif !== false ? "selected" : ""}>Aktif</option>
                        <option value="Nonaktif" ${k && k.aktif === false ? "selected" : ""}>Nonaktif</option>
                    </select></div>
            </div>
            <button type="submit" id="btn-save-kebiasaan" class="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Kebiasaan</button>
        </form>`;
    document.getElementById("modal-container")?.classList.remove("hidden");
    pratinjauKebiasaan();
}

function pratinjauKebiasaan() {
    const wadah = document.getElementById("m-kb-pratinjau");
    if (!wadah) return;
    const ikon = ((document.getElementById("m-kb-ikon") || {}).value || "").trim();
    const warna = (document.getElementById("m-kb-warna") || {}).value || "text-slate-600 bg-slate-100";
    const aman = /^fa-[a-z0-9-]+$/.test(ikon) ? ikon : "fa-circle-question";
    wadah.className = "w-9 h-9 rounded-xl flex items-center justify-center " + warna;
    wadah.innerHTML = `<i class="fas ${aman}"></i>`;
}

async function simpanFormKebiasaan(e, id) {
    e.preventDefault();
    const v = (el) => String((document.getElementById(el) || {}).value || "").trim();
    const nama = v("m-kb-nama");
    const ikon = v("m-kb-ikon") || "fa-check";
    if (!nama) return;
    if (!/^fa-[a-z0-9-]+$/.test(ikon)) {
        Swal.fire({ icon: "warning", title: "Ikon Tidak Valid", text: "Tulis nama ikon Font Awesome, contoh: fa-sun atau fa-book-open.", confirmButtonColor: "#2563eb" });
        return;
    }
    const item = {
        nama,
        nama_singkat: v("m-kb-singkat") || nama,
        jam_default: v("m-kb-jam"),
        detail_default: v("m-kb-detail"),
        ikon,
        warna: v("m-kb-warna"),
        label_jam: v("m-kb-label-jam") || "Jam (WITA)",
        label_detail: v("m-kb-label-detail") || "Keterangan",
        placeholder_detail: v("m-kb-placeholder"),
        urutan: Number(v("m-kb-urutan")) || 1,
        aktif: v("m-kb-aktif") === "Nonaktif" ? "Nonaktif" : "Aktif"
    };
    if (id) item.id = id;

    if (id && item.aktif === "Nonaktif") {
        const ok = await Swal.fire({
            icon: "question", title: "Nonaktifkan kebiasaan?",
            text: "Kebiasaan ini tidak muncul lagi di isian siswa. Riwayat yang sudah ada tetap tersimpan dan bisa diaktifkan kembali.",
            showCancelButton: true, confirmButtonText: "Ya, nonaktifkan", cancelButtonText: "Batal", confirmButtonColor: "#2563eb"
        });
        if (!ok.isConfirmed) return;
    }

    const btn = document.getElementById("btn-save-kebiasaan");
    if (btn) { btn.disabled = true; btn.classList.add("opacity-60"); }
    const res = await kirimKonfigKebiasaan([item]);
    if (res) {
        closeModal();
        showToast(res.message || "Pengaturan kebiasaan disimpan.");
    } else if (btn) {
        btn.disabled = false;
        btn.classList.remove("opacity-60");
    }
}