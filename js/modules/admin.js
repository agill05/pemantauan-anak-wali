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
    if (tab === "arsip") renderAdminArsip();
}

function renderAdminSekolah() {
    const nama = document.getElementById("m-skl-kepsek");
    const nip = document.getElementById("m-skl-nip-kepsek");
    if (nama) nama.value = appState.pengaturan?.nama_kepsek || "";
    if (nip) nip.value = appState.pengaturan?.nip_kepsek || "";
    const ksUser = document.getElementById("m-ks-username");
    const ksPass = document.getElementById("m-ks-password");
    if (ksPass) ksPass.value = "";
    if (ksUser) {
        apiCall("getAkunKepsek", {}, false).then(res => {
            if (res && res.status === "success") ksUser.value = res.data.username || "";
        });
    }
}

async function resetPasswordKepsek() {
    const ok = await Swal.fire({
        icon: "warning", title: "Reset Password Kepala Sekolah?",
        text: "Password kembali ke kepsek123 dan Kepala Sekolah wajib menggantinya saat login berikutnya.",
        showCancelButton: true, confirmButtonText: "Ya, Reset", cancelButtonText: "Batal", confirmButtonColor: "#e11d48"
    });
    if (!ok.isConfirmed) return;
    showLoading("Mereset password...");
    const res = await apiCall("resetPasswordKepsek", {}, true);
    hideLoading();
    if (res && res.status === "success") {
        Swal.fire({ icon: "success", title: "Berhasil", text: res.message, confirmButtonColor: "#2563eb" });
    } else {
        Swal.fire({ icon: "error", title: "Gagal", text: (res && res.message) || "Tidak dapat mereset password.", confirmButtonColor: "#2563eb" });
    }
}

async function saveSekolahForm(e) {
    e.preventDefault();
    const btn = document.getElementById("btn-save-sekolah");
    const originalHtml = btn ? btn.innerHTML : "";
    const username = document.getElementById("m-ks-username").value.trim();
    const password = document.getElementById("m-ks-password").value;

    if (!username) {
        Swal.fire({ icon: "warning", title: "Username kosong", text: "Isi username Kepala Sekolah.", confirmButtonColor: "#2563eb" });
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    const payload = {
        nama_kepsek: titleCaseNama(document.getElementById("m-skl-kepsek").value),
        nip_kepsek: document.getElementById("m-skl-nip-kepsek").value,
        username: username,
        password: password,
    };

    const res = await apiCall("savePengaturan", payload, true);

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }

    if (res && res.status === "success") {
        appState.pengaturan = { ...appState.pengaturan, nama_kepsek: payload.nama_kepsek, nip_kepsek: payload.nip_kepsek };
        saveAppStateToLocal();
        document.getElementById("m-ks-password").value = "";
        showToast(res.message || "Data Kepala Sekolah tersimpan!");
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
                <h4 class="font-bold text-xs text-slate-800">${escapeHtml(s.nama)}</h4>
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
                    <span class="block text-xs font-bold text-slate-800 truncate">${escapeHtml(s.nama)}</span>
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
                <input type="text" id="m-guru-nama" onblur="rapikanInputNama(this)" value="${escapeHtml(g?.nama || '')}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
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
        nama: titleCaseNama(document.getElementById("m-guru-nama").value),
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
    if (await konfirmasiHapusBersih("guru", id)) {
        const res = await apiCall("deleteGuru", { id }, true);
        if (res && res.status === "success") {
            if (typeof resetCacheCatatanGuru === "function") resetCacheCatatanGuru();
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
    if (await konfirmasiHapusBersih("kelas", id)) {
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


let adminKonfigKebiasaan = [];
let adminKonfigMemuat = false;
let adminKonfigMenyimpan = false;

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

const MAKS_KEBIASAAN = 7;
const KEBIASAAN_BAKU = [
    { id: "K1", nama: "Bangun Pagi", nama_singkat: "Bangun Pagi" },
    { id: "K2", nama: "Beribadah", nama_singkat: "Beribadah" },
    { id: "K3", nama: "Berolahraga", nama_singkat: "Berolahraga" },
    { id: "K4", nama: "Makan Sehat dan Bergizi", nama_singkat: "Makan Sehat" },
    { id: "K5", nama: "Gemar Belajar", nama_singkat: "Gemar Belajar" },
    { id: "K6", nama: "Bermasyarakat", nama_singkat: "Bermasyarakat" },
    { id: "K7", nama: "Tidur Cepat", nama_singkat: "Tidur Cepat" }
];

function isiNamaSingkatKebiasaan() {
    const nama = (document.getElementById("m-kb-nama") || {}).value || "";
    const b = KEBIASAAN_BAKU.find(x => x.nama === nama);
    const s = document.getElementById("m-kb-singkat");
    if (s) s.value = b ? b.nama_singkat : "";
}

function terapkanKonfigAdmin(list) {
    adminKonfigKebiasaan = (list || []).slice().sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
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
    if (ringkas) ringkas.textContent = `${aktif} aktif dari ${data.length} kebiasaan (maks. ${MAKS_KEBIASAAN})`;

    const btnTambah = document.getElementById("btn-tambah-kebiasaan");
    if (btnTambah) {
        const penuh = data.length >= MAKS_KEBIASAAN;
        btnTambah.disabled = penuh;
        btnTambah.classList.toggle("opacity-60", penuh);
        btnTambah.classList.toggle("cursor-not-allowed", penuh);
        btnTambah.title = penuh ? "Maksimal 7 kebiasaan sudah tercapai" : "";
    }

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

async function geserKebiasaan(idx, arah) {
    const a = adminKonfigKebiasaan[idx];
    const b = adminKonfigKebiasaan[idx + arah];
    if (!a || !b) return;
    const urutA = Number(a.urutan) || (idx + 1);
    let urutB = Number(b.urutan) || (idx + arah + 1);
    if (urutA === urutB) urutB = urutA + arah;
    const res = await kirimKonfigKebiasaan([
        Object.assign({}, a, { urutan: urutB }),
        Object.assign({}, b, { urutan: urutA })
    ]);
    if (res) showToast("Urutan diperbarui.");
}

function openModalKebiasaan(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    if (!id && adminKonfigKebiasaan.length >= MAKS_KEBIASAAN) {
        Swal.fire({ icon: "info", title: "Batas Tercapai", text: "Maksimal 7 kebiasaan. Tidak bisa menambah lagi.", confirmButtonColor: "#2563eb" });
        return;
    }
    const k = id ? adminKonfigKebiasaan.find(x => String(x.id) === String(id)) : null;
    const baku = k ? KEBIASAAN_BAKU.find(b => b.id === String(k.id)) : null;
    const namaTampil = k ? (baku ? baku.nama : k.nama) : "";
    const singkatTampil = k ? (baku ? baku.nama_singkat : (k.nama_singkat || k.nama)) : "";
    const terpakai = new Set(adminKonfigKebiasaan.map(x => String(x.id)));
    const namaOpts = k
        ? `<option value="${escapeHtml(namaTampil)}" selected>${escapeHtml(namaTampil)}</option>`
        : `<option value="">-- Pilih kebiasaan --</option>` +
            KEBIASAAN_BAKU.filter(b => !terpakai.has(b.id))
                .map(b => `<option value="${escapeHtml(b.nama)}">${escapeHtml(b.nama)}</option>`).join("");
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
                <select id="m-kb-nama" onchange="isiNamaSingkatKebiasaan()" class="${inp}" ${k ? "disabled" : "required"}>${namaOpts}</select>
                ${k ? `<p class="text-[10px] text-slate-400 mt-0.5">*Nama kebiasaan tetap dan tidak dapat diubah.</p>` : ""}</div>
            <div class="grid grid-cols-2 gap-2">
                <div><label for="m-kb-singkat" class="${lbl}">NAMA SINGKAT</label>
                    <input type="text" id="m-kb-singkat" value="${escapeHtml(singkatTampil)}" class="${inp} cursor-not-allowed opacity-75 bg-slate-100" readonly></div>
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


let arsipDaftar = [];
let arsipMemuat = false;
let arsipSibuk = false;
let arsipLihat = null;
const ARSIP_PER_HALAMAN = 100;

const ARSIP_KOLOM = {
    Kebiasaan: ["tanggal", "nama_siswa", "kelas", "kebiasaan_id", "status", "jam", "detail"],
    Jurnal: ["tanggal", "nama_siswa", "kelas", "mood", "isi", "catatan_wali", "catatan_mentor"]
};
const ARSIP_LABEL = {
    tanggal: "Tanggal", nama_siswa: "Siswa", kelas: "Kelas", kebiasaan_id: "Kebiasaan", status: "Status",
    jam: "Jam", detail: "Detail", mood: "Mood", isi: "Isi Jurnal", catatan_wali: "Catatan Wali",
    catatan_mentor: "Catatan Mentor"
};
const ARSIP_KOLOM_PANJANG = ["detail", "isi", "catatan_wali", "catatan_mentor"];

function arsipTampilPanel(nama) {
    const utama = document.getElementById("arsip-panel-utama");
    const lihat = document.getElementById("arsip-panel-lihat");
    if (utama) utama.classList.toggle("hidden", nama !== "utama");
    if (lihat) lihat.classList.toggle("hidden", nama !== "lihat");
}

function arsipTahunAjaranDefault() {
    const tgl = String(getDateWITA());
    const th = Number(tgl.slice(0, 4));
    const bln = Number(tgl.slice(5, 7));
    const awal = bln >= 7 ? th : th - 1;
    return { ta: awal + "/" + (awal + 1), semester: bln >= 7 ? "Ganjil" : "Genap" };
}

function arsipIsiDefault() {
    const ta = document.getElementById("arsip-ta");
    const sem = document.getElementById("arsip-semester");
    if (!ta || !sem) return;
    if (!ta.value) {
        const d = arsipTahunAjaranDefault();
        ta.value = d.ta;
        sem.value = d.semester;
    }
}

async function renderAdminArsip() {
    arsipIsiDefault();
    arsipTampilPanel(arsipLihat ? "lihat" : "utama");
    const list = document.getElementById("admin-arsip-list");
    if (!list) return;
    if (arsipDaftar.length > 0) arsipGambarDaftar();
    else renderSkeleton("admin-arsip-list", 3);
    if (arsipMemuat) return;

    arsipMemuat = true;
    const res = await apiCall("getArsipList", {}, false);
    arsipMemuat = false;
    if (res && res.status === "success" && Array.isArray(res.data)) {
        arsipDaftar = res.data;
        arsipGambarDaftar();
    } else if (arsipDaftar.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-wifi text-2xl mb-2"></i><p class="text-xs text-slate-500">${escapeHtml(res?.message || "Daftar arsip gagal dimuat. Periksa koneksi lalu buka tab ini lagi.")}</p></div>`;
    }
}

function arsipGambarDaftar() {
    const list = document.getElementById("admin-arsip-list");
    if (!list) return;
    if (arsipDaftar.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-box-archive text-xl mb-1"></i><p class="text-xs">Belum ada arsip.</p></div>`;
        return;
    }
    list.innerHTML = arsipDaftar.map((r, i) => {
        const ada = r.ada !== false;
        const warnaJenis = r.jenis === "Jurnal" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700";
        return `
        <div class="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 ${ada ? "" : "opacity-60"}">
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1 mb-0.5">
                    <p class="text-xs font-bold text-slate-800">${escapeHtml(r.semester)} ${escapeHtml(r.tahun_ajaran)}</p>
                    <span class="px-1.5 py-0.5 rounded-md ${warnaJenis} text-[10px] font-bold">${escapeHtml(r.jenis)}</span>
                    ${ada ? "" : '<span class="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold">Sheet tidak ditemukan</span>'}
                </div>
                <p class="text-[11px] text-slate-400">${Number(r.jumlah_baris) || 0} baris, sampai ${escapeHtml(r.sampai_tanggal || "-")}</p>
                <p class="text-[11px] text-slate-400 truncate">Oleh ${escapeHtml(r.dibuat_oleh_nama || "-")} \u2022 ${escapeHtml(r.dibuat_pada || "-")}</p>
            </div>
            <button type="button" onclick="arsipBuka(${i})" ${ada ? "" : "disabled"} class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold disabled:opacity-40" aria-label="Lihat isi arsip">
                <i class="fas fa-eye mr-1"></i> Lihat
            </button>
        </div>`;
    }).join("");
}

function arsipBacaForm() {
    const ta = (document.getElementById("arsip-ta")?.value || "").trim();
    const semester = document.getElementById("arsip-semester")?.value || "";
    const sampai = document.getElementById("arsip-sampai")?.value || "";
    const m = ta.match(/^(\d{4})\/(\d{4})$/);
    if (!m || Number(m[2]) !== Number(m[1]) + 1) {
        showToast("Tahun ajaran harus berformat 2026/2027.", "warning");
        return null;
    }
    if (!sampai) {
        showToast("Isi tanggal \"Arsipkan sampai\".", "warning");
        return null;
    }
    if (sampai >= getDateWITA()) {
        showToast("Tanggal harus sebelum hari ini.", "warning");
        return null;
    }
    return { tahun_ajaran: ta, semester: semester, sampai_tanggal: sampai };
}

async function arsipPanggil(payload, teks) {
    showLoading(teks);
    const res = await apiCall("archiveSemester", payload, false, 1, true, 170000);
    hideLoading();
    return res;
}

function arsipHtmlRingkasan(data) {
    return (data || []).map(r => `
        <div class="py-1.5 border-b border-slate-100 last:border-0">
            <div class="flex justify-between gap-2 text-xs">
                <span class="font-bold text-slate-700">${escapeHtml(r.jenis)}</span>
                <span class="text-slate-600"><b>${Number(r.diarsipkan) || 0}</b> dipindah \u2022 ${Number(r.tersisa) || 0} tetap</span>
            </div>
            <p class="text-[11px] text-slate-400">${r.tanggal_terlama ? escapeHtml(r.tanggal_terlama) + " s.d. " + escapeHtml(r.tanggal_terbaru) : "Tidak ada data"} \u2022 ${escapeHtml(r.nama_sheet)}</p>
        </div>`).join("");
}

async function arsipSimulasi(e) {
    if (e) e.preventDefault();
    if (arsipSibuk) return;
    const form = arsipBacaForm();
    if (!form) return;
    const box = document.getElementById("arsip-hasil-simulasi");
    arsipSibuk = true;
    const res = await arsipPanggil(Object.assign({ dry_run: true }, form), "Menghitung simulasi...");
    arsipSibuk = false;
    if (!box) return;
    box.classList.remove("hidden");
    if (res && res.status === "success") {
        box.className = "bg-white p-3.5 rounded-2xl border border-slate-100";
        box.innerHTML = `
            <p class="text-xs font-bold text-slate-700 mb-1"><i class="fas fa-flask mr-1 text-blue-500"></i> Hasil simulasi (belum ada data berubah)</p>
            ${arsipHtmlRingkasan(res.data)}`;
    } else {
        box.className = "bg-rose-50 p-3.5 rounded-2xl border border-rose-100";
        box.innerHTML = `<p class="text-xs font-semibold text-rose-700">${escapeHtml(res?.message || "Koneksi bermasalah. Coba lagi.")}</p>`;
    }
}

async function arsipJalankan() {
    if (arsipSibuk) return;
    const form = arsipBacaForm();
    if (!form) return;

    arsipSibuk = true;
    const sim = await arsipPanggil(Object.assign({ dry_run: true }, form), "Memeriksa data...");
    arsipSibuk = false;
    if (!sim || sim.status !== "success") {
        Swal.fire({ icon: "warning", title: "Tidak Bisa Diarsipkan", text: sim?.message || "Koneksi bermasalah. Coba lagi.", confirmButtonColor: "#2563eb" });
        return;
    }

    const konfirm = await Swal.fire({
        icon: "warning",
        title: "Arsipkan semester ini?",
        html: `
            <div class="text-left text-xs">
                <p class="mb-2"><b>${escapeHtml(form.semester)} ${escapeHtml(form.tahun_ajaran)}</b>, data sampai <b>${escapeHtml(form.sampai_tanggal)}</b>.</p>
                ${arsipHtmlRingkasan(sim.data)}
                <p class="mt-3 text-rose-600 font-semibold">Data dipindah dari sheet aktif. Poin, streak, badge, dan laporan periode ini akan kosong di aplikasi. Cetak laporan semester lebih dulu. Pastikan backup spreadsheet sudah ada.</p>
            </div>`,
        input: "text",
        inputPlaceholder: "Ketik ARSIPKAN",
        showCancelButton: true,
        confirmButtonText: "Arsipkan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#dc2626",
        preConfirm: (v) => {
            if (String(v || "").trim().toUpperCase() !== "ARSIPKAN") {
                Swal.showValidationMessage("Ketik ARSIPKAN untuk melanjutkan.");
                return false;
            }
            return true;
        }
    });
    if (!konfirm.isConfirmed) return;

    arsipSibuk = true;
    const res = await arsipPanggil(form, "Mengarsipkan dan memverifikasi data. Jangan tutup halaman...");
    arsipSibuk = false;

    if (res === null) {
        await Swal.fire({
            icon: "info",
            title: "Respons Tidak Diterima",
            html: "<p class=\"text-xs\">Proses mungkin masih berjalan di server. <b>Jangan ulangi.</b> Tunggu 1 menit, lalu cek Daftar Arsip.</p>",
            confirmButtonColor: "#2563eb"
        });
    } else if (res.status === "success") {
        document.getElementById("arsip-hasil-simulasi")?.classList.add("hidden");
        await Swal.fire({ icon: "success", title: "Arsip Selesai", text: res.message, confirmButtonColor: "#2563eb" });
    } else {
        await Swal.fire({ icon: "error", title: "Arsip Gagal", text: res.message || "Terjadi kesalahan.", confirmButtonColor: "#2563eb" });
    }
    arsipDaftar = [];
    renderAdminArsip();
}

function arsipBuka(i) {
    const r = arsipDaftar[i];
    const panel = document.getElementById("arsip-panel-lihat");
    if (!r || !panel) return;
    arsipLihat = {
        nama: String(r.nama_sheet), jenis: String(r.jenis),
        judul: `${r.jenis} \u2022 ${r.semester} ${r.tahun_ajaran}`,
        offset: 0, total: 0, q: "", kelas: "", headers: [], seq: 0
    };
    const kelasOpts = (appState.kelas || []).map(k => `<option value="${escapeHtml(k.nama_kelas)}"></option>`).join("");
    panel.innerHTML = `
        <div class="flex items-center gap-2">
            <button type="button" onclick="arsipKembali()" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600" aria-label="Kembali ke daftar arsip"><i class="fas fa-arrow-left text-xs"></i></button>
            <div class="min-w-0 flex-1">
                <p class="text-xs font-bold text-slate-800 truncate">${escapeHtml(arsipLihat.judul)}</p>
                <p id="arsip-lihat-info" class="text-[11px] text-slate-400"></p>
            </div>
            <button type="button" onclick="arsipUnduhCsv()" class="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold"><i class="fas fa-download mr-1"></i> CSV</button>
        </div>
        <form onsubmit="arsipCari(event)" class="grid grid-cols-2 gap-2">
            <input type="text" id="arsip-f-q" placeholder="Cari nama siswa..." class="bg-slate-50 border p-2 rounded-xl text-xs outline-none">
            <input type="text" id="arsip-f-kelas" list="arsip-kelas-list" placeholder="Kelas (mis. VII A)" class="bg-slate-50 border p-2 rounded-xl text-xs outline-none">
            <datalist id="arsip-kelas-list">${kelasOpts}</datalist>
            <button type="submit" class="col-span-2 bg-primary text-white font-bold py-2 rounded-xl text-xs">Terapkan Filter</button>
        </form>
        <div id="arsip-lihat-tabel" class="bg-white rounded-2xl border border-slate-100 overflow-x-auto"></div>
        <div id="arsip-lihat-pager" class="flex items-center justify-between text-xs"></div>`;
    arsipTampilPanel("lihat");
    arsipMuatHalaman();
}

function arsipKembali() {
    arsipLihat = null;
    arsipTampilPanel("utama");
}

function arsipCari(e) {
    if (e) e.preventDefault();
    if (!arsipLihat) return;
    arsipLihat.q = (document.getElementById("arsip-f-q")?.value || "").trim();
    arsipLihat.kelas = (document.getElementById("arsip-f-kelas")?.value || "").trim();
    arsipLihat.offset = 0;
    arsipMuatHalaman();
}

function arsipHalaman(arah) {
    if (!arsipLihat) return;
    const baru = arsipLihat.offset + arah * ARSIP_PER_HALAMAN;
    if (baru < 0 || baru >= arsipLihat.total) return;
    arsipLihat.offset = baru;
    arsipMuatHalaman();
}

async function arsipMuatHalaman() {
    const v = arsipLihat;
    if (!v) return;
    const seq = ++v.seq;
    const tabel = document.getElementById("arsip-lihat-tabel");
    if (tabel) tabel.innerHTML = `<div class="p-6 text-center text-xs text-slate-400"><i class="fas fa-spinner fa-spin mr-1"></i> Memuat...</div>`;

    const res = await apiCall("getArsipData", {
        nama_sheet: v.nama, q: v.q, kelas: v.kelas, offset: v.offset, limit: ARSIP_PER_HALAMAN
    }, false);
    if (arsipLihat !== v || seq !== v.seq) return;

    const el = document.getElementById("arsip-lihat-tabel");
    if (!el) return;
    if (!res || res.status !== "success") {
        el.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">${escapeHtml(res?.message || "Gagal memuat arsip. Periksa koneksi.")}</div>`;
        return;
    }
    v.total = Number(res.total) || 0;
    v.headers = Array.isArray(res.headers) ? res.headers : [];

    const pilihan = (ARSIP_KOLOM[v.jenis] || []).filter(c => v.headers.indexOf(c) !== -1);
    const kolom = pilihan.length > 0 ? pilihan : v.headers;

    if (res.data.length === 0) {
        el.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Tidak ada baris yang cocok.</div>`;
    } else {
        el.innerHTML = `
            <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500">
                    <tr>${kolom.map(c => `<th class="px-2 py-2 font-bold whitespace-nowrap">${escapeHtml(ARSIP_LABEL[c] || c)}</th>`).join("")}</tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${res.data.map(row => `<tr>${kolom.map(c => {
                        const teks = String(row[c] === null || row[c] === undefined ? "" : row[c]);
                        const panjang = ARSIP_KOLOM_PANJANG.indexOf(c) !== -1;
                        return `<td class="px-2 py-1.5 align-top text-slate-700 ${panjang ? "min-w-[14rem]" : "whitespace-nowrap"}">${escapeHtml(teks)}</td>`;
                    }).join("")}</tr>`).join("")}
                </tbody>
            </table>`;
    }

    const dari = v.total === 0 ? 0 : v.offset + 1;
    const sampai = Math.min(v.offset + ARSIP_PER_HALAMAN, v.total);
    const info = document.getElementById("arsip-lihat-info");
    if (info) info.textContent = `${v.total} baris`;
    const pager = document.getElementById("arsip-lihat-pager");
    if (pager) {
        pager.innerHTML = `
            <span class="text-slate-500">${dari}\u2013${sampai} dari ${v.total}</span>
            <span class="flex gap-1">
                <button type="button" onclick="arsipHalaman(-1)" ${v.offset <= 0 ? "disabled" : ""} class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold disabled:opacity-40">Sebelumnya</button>
                <button type="button" onclick="arsipHalaman(1)" ${v.offset + ARSIP_PER_HALAMAN >= v.total ? "disabled" : ""} class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold disabled:opacity-40">Berikutnya</button>
            </span>`;
    }
}

function arsipCsvSel(v) {
    let s = String(v === null || v === undefined ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
}

async function arsipUnduhCsv() {
    const v = arsipLihat;
    if (!v || arsipSibuk) return;
    arsipSibuk = true;
    showLoading("Menyiapkan CSV...");
    try {
        let offset = 0, total = Infinity, headers = [], rows = [];
        while (offset < total) {
            const res = await apiCall("getArsipData", {
                nama_sheet: v.nama, q: v.q, kelas: v.kelas, offset: offset, limit: 2000
            }, false, 2, true);
            if (!res || res.status !== "success") throw new Error(res?.message || "Koneksi bermasalah.");
            headers = res.headers || headers;
            total = Number(res.total) || 0;
            if (!res.data.length) break;
            rows = rows.concat(res.data);
            offset += res.data.length;
        }
        if (rows.length === 0) throw new Error("Tidak ada baris untuk diunduh.");
        const baris = [headers.map(arsipCsvSel).join(";")]
            .concat(rows.map(r => headers.map(h => arsipCsvSel(r[h])).join(";")));
        const blob = new Blob(["\ufeff" + baris.join("\r\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = v.nama + ".csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast("CSV diunduh (" + rows.length + " baris).");
    } catch (err) {
        Swal.fire({ icon: "error", title: "Unduhan Gagal", text: String(err.message || err), confirmButtonColor: "#2563eb" });
    } finally {
        hideLoading();
        arsipSibuk = false;
    }
}
