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