let keagamaanKategoriFilter = "semua";

function getKategoriHafalan(h) {
    const k = String((h && h.kategori) || "").toLowerCase();
    return KEAGAMAAN_KATEGORI[k] ? k : "surah";
}

function formatCapaianKeagamaan(h) {
    const kat = getKategoriHafalan(h);
    const nama = h.nama_surat || "";
    if (kat === "surah") return `Surah ${nama}`;
    if (kat === "iqro") return h.halaman ? `${nama}, hal. ${h.halaman}` : nama;
    return nama;
}

const DOA_LAINNYA_VALUE = "__lainnya__";
const DOA_NAMA_MAX = 60;

function normalizeNamaDoa(str) {
    return String(str || "").replace(/\s+/g, " ").trim();
}

function cariDoaStandar(nama) {
    const key = normalizeNamaDoa(nama).toLowerCase();
    if (!key) return null;
    const found = MASTER_DOA.find(d => d.nama.toLowerCase() === key)
        || MASTER_DOA.find(d => d.nama.toLowerCase() === `doa ${key}`);
    return found ? found.nama : null;
}

function resolveNamaDoa(input) {
    const norm = normalizeNamaDoa(input);
    if (!norm) return "";
    const standar = cariDoaStandar(norm);
    if (standar) return standar;
    const titled = norm.toLowerCase().replace(/(^|\s)(\S)/g, (m, sp, ch) => sp + ch.toUpperCase());
    const withPrefix = /^doa(\s|$)/i.test(titled) ? titled : `Doa ${titled}`;
    return cariDoaStandar(withPrefix) || withPrefix;
}

function isDoaStandar(nama) {
    return MASTER_DOA.some(d => d.nama === nama);
}

function kagKunciItem(h) {
    return getKategoriHafalan(h) + "|" + String(h.nama_surat || "");
}

function kagLebihBaru(a, b) {
    const d = gsTanggalNum(a) - gsTanggalNum(b);
    if (d !== 0) return d > 0;
    return String(a.dibuat_pada || "") >= String(b.dibuat_pada || "");
}

// Status resmi: per siswa + item, ambil catatan terbaru.
function kagResmi(list = []) {
    const map = new Map();
    list.forEach(h => {
        const k = String(h.siswa_id) + "|" + kagKunciItem(h);
        const cur = map.get(k);
        if (!cur || kagLebihBaru(h, cur)) map.set(k, h);
    });
    return Array.from(map.values());
}

function getHafalanProgressStats(hafalanList = []) {
    const lancar = kagResmi(hafalanList).filter(h => h.status === "Lancar");
    const lancarSet = (kat) => new Set(lancar.filter(h => getKategoriHafalan(h) === kat).map(h => h.nama_surat));
    const surahLancar = lancarSet("surah");
    const iqroLancar = lancarSet("iqro");
    const doaLancar = lancarSet("doa");

    const juz30Surahs = MASTER_SURAHS.filter(s => s.juz === 30);
    const juz30Lancar = juz30Surahs.filter(s => surahLancar.has(s.nama)).length;
    const totalSurahLancar = MASTER_SURAHS.filter(s => surahLancar.has(s.nama)).length;
    const iqroCount = MASTER_IQRO.filter(i => iqroLancar.has(i.nama)).length;
    const doaCount = MASTER_DOA.filter(d => doaLancar.has(d.nama)).length;
    const doaTambahan = Array.from(doaLancar).filter(n => !isDoaStandar(n)).length;
    const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

    return {
        juz30: { count: juz30Lancar, total: juz30Surahs.length, percent: pct(juz30Lancar, juz30Surahs.length) },
        total: { count: totalSurahLancar, total: 114, percent: pct(totalSurahLancar, 114) },
        iqro: { count: iqroCount, total: MASTER_IQRO.length, percent: pct(iqroCount, MASTER_IQRO.length) },
        doa: { count: doaCount, total: MASTER_DOA.length, percent: pct(doaCount, MASTER_DOA.length), tambahan: doaTambahan }
    };
}

function hitungSkorKeagamaan(hafalanList = []) {
    const s = getHafalanProgressStats(hafalanList);
    const poin = s.total.count + s.doa.count + s.doa.tambahan + (s.iqro.count * 2);
    return Math.min(100, Math.round((poin / 10) * 100));
}

function setKeagamaanKategori(kat) {
    const prevKat = keagamaanKategoriFilter;
    keagamaanKategoriFilter = (kat === "semua" || KEAGAMAAN_KATEGORI[kat]) ? kat : "semua";
    document.querySelectorAll("#keagamaan-kategori-tabs .kag-tab-btn").forEach(btn => {
        const on = btn.getAttribute("data-kat") === keagamaanKategoriFilter;
        ["bg-surface", "text-primary", "shadow-sm"].forEach(c => btn.classList.toggle(c, on));
        btn.classList.toggle("text-slate-600", !on);
    });
    renderKeagamaanView();
    if (prevKat !== keagamaanKategoriFilter) {
        const urut = Array.from(document.querySelectorAll("#keagamaan-kategori-tabs .kag-tab-btn")).map(b => b.getAttribute("data-kat"));
        animateSwap(document.getElementById("keagamaan-container"), urut.indexOf(keagamaanKategoriFilter) > urut.indexOf(prevKat) ? "left" : "right");
    }
}

async function loadKeagamaanData(forceRefresh = false) {
    const filterSelect = document.getElementById("karakter-siswa-filter");
    if (filterSelect && filterSelect.options.length === 0) {
        populateSiswaSelectForRole(filterSelect, { includeAllOption: true });
    }

    const rawSelectedSiswaId = filterSelect ? filterSelect.value : "";
    const isAdminOrGuru = isStafLihat();

    if (isAdminOrGuru && rawSelectedSiswaId === "") {
        renderKeagamaanView();
        return;
    }

    const selectedSiswaId = rawSelectedSiswaId === "ALL" ? null : rawSelectedSiswaId;
    const isStale = (Date.now() - (lastFetchTimes.keagamaan || 0)) > CACHE_TTL;

    if (appState.keagamaan && appState.keagamaan.length > 0) {
        renderKeagamaanView();
    } else {
        renderSkeleton("keagamaan-container", 3);
    }

    if (forceRefresh || isStale || !appState.keagamaan || appState.keagamaan.length === 0) {
        const res = await apiCall("getKeagamaan", { siswa_id: selectedSiswaId }, false);
        if (res && res.data) {
            appState.keagamaan = res.data;
            lastFetchTimes.keagamaan = Date.now();
            saveAppStateToLocal();
            renderKeagamaanView();
        }
    }
}

function _kagBar(label, valueText, percent, barClass) {
    return `
        <div class="space-y-1">
            <div class="flex justify-between text-xs font-semibold">
                <span>${label}</span>
                <span>${valueText}</span>
            </div>
            <div class="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                <div class="${barClass} h-full rounded-full transition-all duration-500" style="width: ${percent}%"></div>
            </div>
        </div>`;
}

function _kagProgressHeader(stats, kat) {
    let judul, sub, chip, bars;
    const barSurah = _kagBar("Capaian Juz 30 (Juz Amma)", `${stats.juz30.percent}%`, stats.juz30.percent, "bg-amber-300")
        + _kagBar("Keseluruhan 114 Surah", `${stats.total.percent}%`, stats.total.percent, "bg-emerald-300");
    const barIqro = _kagBar(`Jilid Selesai (${stats.iqro.count}/${stats.iqro.total})`, `${stats.iqro.percent}%`, stats.iqro.percent, "bg-amber-300");
    const doaExtra = stats.doa.tambahan > 0 ? ` +${stats.doa.tambahan} tambahan` : "";
    const barDoa = _kagBar(`Doa Dihafal (${stats.doa.count}/${stats.doa.total}${doaExtra})`, `${stats.doa.percent}%`, stats.doa.percent, "bg-sky-300");

    if (kat === "surah") {
        judul = "Progres Hafalan Al-Qur'an"; sub = "Capaian Juz 30 & Total 114 Surah";
        chip = `${stats.juz30.count}/${stats.juz30.total} Surah (Juz 30)`; bars = barSurah;
    } else if (kat === "iqro") {
        judul = "Progres Iqro"; sub = "Capaian jilid Iqro 1 sampai 6";
        chip = `${stats.iqro.count}/${stats.iqro.total} Jilid`; bars = barIqro;
    } else if (kat === "doa") {
        judul = "Progres Hafalan Doa"; sub = "Doa-doa harian";
        chip = `${stats.doa.count}/${stats.doa.total} Doa${stats.doa.tambahan > 0 ? ` +${stats.doa.tambahan}` : ""}`; bars = barDoa;
    } else {
        judul = "Progres Keagamaan"; sub = "Al-Qur'an, Iqro & Doa Harian";
        chip = `${stats.juz30.count}/${stats.juz30.total} Surah (Juz 30)`; bars = barSurah + barIqro + barDoa;
    }

    return `
    <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-sm space-y-3 mb-4">
        <div class="flex justify-between items-center gap-2">
            <div class="min-w-0">
                <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-100">${judul}</h3>
                <p class="text-xs text-emerald-200">${sub}</p>
            </div>
            <span class="bg-white/20 px-2.5 py-1 rounded-xl text-xs font-extrabold backdrop-blur-sm shrink-0">${chip}</span>
        </div>
        ${bars}
    </div>`;
}

function kagSkorMendesak(g) {
    return kagResmi(g.records).reduce((n, h) => n + (h.status === "Mengulang" ? 2 : (h.status === "Belum Mulai" ? 1 : 0)), 0);
}

function kagGabungItem(records) {
    const map = new Map();
    records.forEach(h => {
        const k = kagKunciItem(h);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(h);
    });
    const out = [];
    map.forEach(list => {
        list.sort((x, y) => (kagLebihBaru(x, y) ? -1 : 1));
        const terbaruPerPembuat = new Map();
        list.forEach(h => { const pk = gsKunciPembuat(h); if (!terbaruPerPembuat.has(pk)) terbaruPerPembuat.set(pk, h.status); });
        const beda = new Set(terbaruPerPembuat.values()).size > 1;
        out.push({ records: list, resmi: list[0], beda });
    });
    out.sort((x, y) => (kagLebihBaru(x.resmi, y.resmi) ? -1 : 1));
    return out;
}

function kagStatusBadgeCls(status) {
    return status === 'Lancar' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (status === 'Mengulang' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200');
}

function kagBedaChip() {
    return `<span class="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200"><i class="fas fa-triangle-exclamation text-[9px]"></i> Beda status</span>`;
}

function kagRingkasanTeks(records, kat) {
    const st = getHafalanProgressStats(records);
    const doaEx = st.doa.tambahan > 0 ? ` +${st.doa.tambahan}` : "";
    const surah = `Juz 30: ${st.juz30.count}/${st.juz30.total}`;
    const iqro = `Iqro: ${st.iqro.count}/${st.iqro.total}`;
    const doa = `Doa: ${st.doa.count}/${st.doa.total}${doaEx}`;
    if (kat === "surah") return [surah, `Total: ${st.total.count}/114`];
    if (kat === "iqro") return [iqro];
    if (kat === "doa") return [doa];
    return [surah, iqro, doa];
}

function kagRingkasanHtml(records, kat) {
    const chips = kagRingkasanTeks(records, kat).map(t => `<span class="font-bold text-slate-600">${escapeHtml(t)}</span>`).join('<span class="text-slate-300">·</span>');
    const nBeda = kagGabungItem(records).filter(x => x.beda).length;
    return `<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">${chips}${nBeda ? kagBedaChip() + `<span class="font-bold text-rose-600">${nBeda}</span>` : ''}</div>`;
}

function renderKeagamaanView() {
    const container = document.getElementById("keagamaan-container");
    if (!container) return;

    if (isKepsekUser() && !document.getElementById("keagamaan-gs-filter")) {
        container.insertAdjacentHTML('beforebegin', `<div id="keagamaan-gs-filter">${gsRenderFilterKepsek('kag-f', 'renderKeagamaanView')}</div>`);
    }

    const selectEl = document.getElementById("karakter-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    const isAdminOrGuru = isStafLihat();

    if (isAdminOrGuru && filterSiswaId === "") {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-hand-pointer text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Silakan pilih siswa terlebih dahulu.</p></div>`;
        return;
    }

    const baseKeagamaan = scopeBySiswaId(appState.keagamaan, h => h.siswa_id);
    const perSiswa = (filterSiswaId && filterSiswaId !== "ALL")
        ? baseKeagamaan.filter(h => String(h.siswa_id) === String(filterSiswaId))
        : baseKeagamaan;

    const kat = keagamaanKategoriFilter;
    const satuSiswa = !isAdminOrGuru || (filterSiswaId && filterSiswaId !== "ALL");
    const progressHeaderHtml = satuSiswa ? _kagProgressHeader(getHafalanProgressStats(perSiswa), kat) : "";

    const fk = isKepsekUser() ? gsBacaFilterKepsek('kag-f') : null;
    let groups = gsTerapkanFilter(gsGroupBySiswa(perSiswa, h => h.siswa_id), fk);
    groups = groups.map(g => ({ g, tampil: kat === "semua" ? g.records : g.records.filter(h => getKategoriHafalan(h) === kat) }))
        .filter(x => x.tampil.length > 0);
    const urut = gsUrutkan(groups.map(x => x.g), fk ? fk.urut : 'terbaru', kagSkorMendesak);
    const tampilMap = new Map(groups.map(x => [x.g.siswaId, x.tampil]));

    if (urut.length === 0) {
        const emptyLabel = kat === "iqro" ? "bacaan Iqro" : (kat === "doa" ? "hafalan doa" : (kat === "surah" ? "hafalan Al-Qur'an" : "capaian keagamaan"));
        const emptyIcon = KEAGAMAAN_KATEGORI[kat] ? KEAGAMAAN_KATEGORI[kat].icon : "fa-quran";
        container.innerHTML = progressHeaderHtml + `<div class="empty-state"><i class="fas ${emptyIcon} text-2xl mb-2 text-emerald-500"></i><p class="text-xs text-slate-500">Belum ada catatan ${emptyLabel}.</p></div>`;
        kagRefreshDetail();
        return;
    }

    const cardsHtml = urut.map(g => {
        const gTampil = Object.assign({}, g, { records: tampilMap.get(g.siswaId) });
        return gsRenderCard(gTampil, kagRingkasanHtml(g.records, kat), 'openDetailKeagamaan');
    }).join("");

    container.innerHTML = progressHeaderHtml + cardsHtml;
    kagRefreshDetail();
}

function kagDataGrup(siswaId) {
    const base = scopeBySiswaId(appState.keagamaan, h => h.siswa_id)
        .filter(h => String(h.siswa_id) === String(siswaId));
    return gsGroupBySiswa(base, h => h.siswa_id)[0] || null;
}

function kagBarisItem(item) {
    const r = item.resmi;
    const meta = KEAGAMAAN_KATEGORI[getKategoriHafalan(r)];
    const subs = item.records.map(h => {
        const bisaUbah = !isKepsekUser() && canEditRecord(h, 'keagamaan');
        return `
            <div class="bg-white p-2 rounded-lg border border-slate-100 space-y-1">
                <div class="flex flex-wrap items-center gap-1.5">
                    ${renderPenulisBadge(h)}
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border ${kagStatusBadgeCls(h.status)}">${escapeHtml(h.status)}</span>
                    <span class="text-[10px] text-slate-400">${escapeHtml(gsFormatTanggal(h))}</span>
                </div>
                ${h.catatan ? `<p class="text-xs text-slate-600 italic">"${escapeHtml(h.catatan)}"</p>` : ''}
                ${bisaUbah ? `
                <div class="flex justify-end gap-2">
                    <button onclick="openModalKeagamaan('${escapeHtml(h.id)}')" class="text-xs font-bold text-blue-600"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteKeagamaan('${escapeHtml(h.id)}')" class="text-xs font-bold text-rose-600"><i class="fas fa-trash"></i> Hapus</button>
                </div>` : ''}
            </div>`;
    }).join("");
    return `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
            <div class="flex justify-between items-start gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <i class="fas ${meta.icon} text-emerald-600"></i>
                    <h4 class="font-bold text-xs text-slate-800 truncate">${escapeHtml(formatCapaianKeagamaan(r))}</h4>
                </div>
                <div class="flex flex-wrap justify-end items-center gap-1">
                    ${item.beda ? kagBedaChip() : ''}
                    <span class="text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${kagStatusBadgeCls(r.status)}">${escapeHtml(r.status)}</span>
                </div>
            </div>
            ${subs}
        </div>`;
}

function openDetailKeagamaan(siswaId, tab) {
    const g = kagDataGrup(siswaId);
    if (!g) { closeModal(); return; }
    const box = document.getElementById("modal-content-box");
    const aktif = KEAGAMAAN_KATEGORI[tab] ? tab
        : (box && box.dataset.gs === 'keagamaan' && String(box.dataset.gsSiswa) === String(siswaId) && KEAGAMAAN_KATEGORI[box.dataset.gsTab] ? box.dataset.gsTab
            : (KEAGAMAAN_KATEGORI[keagamaanKategoriFilter] ? keagamaanKategoriFilter : "surah"));

    const tabs = Object.keys(KEAGAMAAN_KATEGORI).map(k => {
        const n = new Set(g.records.filter(h => getKategoriHafalan(h) === k).map(kagKunciItem)).size;
        const on = k === aktif;
        return `<button type="button" onclick="openDetailKeagamaan('${escapeHtml(g.siswaId)}','${k}')" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${on ? 'bg-surface text-primary shadow-sm' : 'text-slate-600'}">${KEAGAMAAN_KATEGORI[k].label} (${n})</button>`;
    }).join("");

    const ringkasan = `
        <div class="space-y-2">
            <div class="bg-slate-50 p-2 rounded-xl border border-slate-100">${kagRingkasanHtml(g.records, "semua")}</div>
            <div class="flex bg-slate-200/70 p-1 rounded-xl gap-1">${tabs}</div>
        </div>`;

    const items = kagGabungItem(g.records.filter(h => getKategoriHafalan(h) === aktif));
    const body = items.length
        ? items.map(kagBarisItem).join("")
        : `<div class="empty-state"><p class="text-xs text-slate-500">Belum ada catatan ${escapeHtml(KEAGAMAAN_KATEGORI[aktif].label.toLowerCase())}.</p></div>`;

    gsOpenSheet(g, { judul: 'Keagamaan', kategori: 'keagamaan', ringkasanHtml: ringkasan, bodyHtml: body, tambahFn: 'tambahKeagamaanSiswa' });
    const box2 = document.getElementById("modal-content-box");
    if (box2) { box2.dataset.gs = 'keagamaan'; box2.dataset.gsSiswa = String(siswaId); box2.dataset.gsTab = aktif; }
}

function kagRefreshDetail() {
    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal || modal.classList.contains("hidden") || box.dataset.gs !== 'keagamaan') return;
    openDetailKeagamaan(box.dataset.gsSiswa, box.dataset.gsTab);
}

function tambahKeagamaanSiswa(siswaId) {
    const box = document.getElementById("modal-content-box");
    const tab = box ? box.dataset.gsTab : "";
    openModalKeagamaan(null, siswaId, tab);
}

function _kagItemOptions(kat, selected) {
    if (kat === "iqro") {
        return MASTER_IQRO.map(i => `<option value="${i.nama}" ${selected === i.nama ? 'selected' : ''}>${i.nama}</option>`).join("");
    }
    if (kat === "doa") {
        const isCustom = !!selected && !isDoaStandar(selected);
        return MASTER_DOA.map(d => `<option value="${d.nama}" ${selected === d.nama ? 'selected' : ''}>${d.no}. ${d.nama}</option>`).join("")
            + `<option value="${DOA_LAINNYA_VALUE}" ${isCustom ? 'selected' : ''}>Lainnya (ketik sendiri)</option>`;
    }
    return MASTER_SURAHS.map(s => `<option value="${s.nama}" ${selected === s.nama ? 'selected' : ''}>${s.no}. Surah ${s.nama} (Juz ${s.juz})</option>`).join("");
}

function onKeagamaanKategoriChange(selected = "") {
    const kat = document.getElementById("m-kag-kategori").value;
    const itemSel = document.getElementById("m-kag-surah");
    const itemLabel = document.getElementById("m-kag-item-label");
    const halWrap = document.getElementById("m-kag-halaman-wrap");
    const hint = document.getElementById("m-kag-hint");

    itemSel.innerHTML = _kagItemOptions(kat, selected);
    const customInput = document.getElementById("m-kag-doa-custom");
    if (customInput) customInput.value = (kat === "doa" && selected && !isDoaStandar(selected)) ? selected : "";
    onKeagamaanItemChange();
    itemLabel.textContent = kat === "iqro" ? "JILID IQRO" : (kat === "doa" ? "DOA" : "SURAH AL-QUR'AN");
    halWrap.classList.toggle("hidden", kat !== "iqro");
    hint.textContent = kat === "iqro"
        ? "Lancar = jilid sudah selesai. Pilih Mengulang atau Belum Mulai jika masih berjalan, lalu isi halaman terakhir."
        : (kat === "doa"
            ? "Lancar = sudah hafal dan lancar. Doa di luar daftar bisa dicatat lewat pilihan Lainnya."
            : "Lancar = sudah hafal dan lancar.");
}

function onKeagamaanItemChange() {
    const kat = document.getElementById("m-kag-kategori")?.value;
    const sel = document.getElementById("m-kag-surah");
    const wrap = document.getElementById("m-kag-doa-custom-wrap");
    const input = document.getElementById("m-kag-doa-custom");
    if (!wrap || !input || !sel) return;
    const show = kat === "doa" && sel.value === DOA_LAINNYA_VALUE;
    wrap.classList.toggle("hidden", !show);
    input.required = show;
}

function openModalKeagamaan(id = null, preSiswaId = null, preKat = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    box.dataset.gs = "";

    const writable = getSiswaWritable('keagamaan');
    if (!id && writable.length === 0) {
        Swal.fire({ icon: 'info', title: 'Tidak Ada Siswa', text: 'Tidak ada siswa yang dapat Anda isi capaian keagamaannya.', confirmButtonColor: '#2563eb' });
        return;
    }

    const record = id ? appState.keagamaan.find(x => String(x.id) === String(id)) : null;
    const siswaOptions = sortSiswa(writable).map(s => `<option value="${s.id}" ${(record ? String(record.siswa_id) === String(s.id) : (preSiswaId !== null && String(preSiswaId) === String(s.id))) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");
    const kat = record ? getKategoriHafalan(record) : (KEAGAMAAN_KATEGORI[preKat] ? preKat : KEAGAMAAN_KATEGORI[keagamaanKategoriFilter] ? keagamaanKategoriFilter : "surah");
    const kategoriOptions = Object.keys(KEAGAMAAN_KATEGORI).map(k => `<option value="${k}" ${k === kat ? 'selected' : ''}>${KEAGAMAAN_KATEGORI[k].label}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-quran text-emerald-600 mr-1.5"></i>${record ? 'Edit Catatan Keagamaan' : 'Catat Capaian Keagamaan'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveKeagamaanForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-kag-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-kag-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOptions}</select>
            </div>
            <div>
                <label for="m-kag-kategori" class="block text-xs font-bold text-slate-500 mb-1">KATEGORI</label>
                <select id="m-kag-kategori" onchange="onKeagamaanKategoriChange()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">${kategoriOptions}</select>
            </div>
            <div>
                <label id="m-kag-item-label" for="m-kag-surah" class="block text-xs font-bold text-slate-500 mb-1">SURAH AL-QUR'AN</label>
                <select id="m-kag-surah" onchange="onKeagamaanItemChange()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required></select>
            </div>
            <div id="m-kag-doa-custom-wrap" class="hidden">
                <label for="m-kag-doa-custom" class="block text-xs font-bold text-slate-500 mb-1">NAMA DOA</label>
                <input type="text" id="m-kag-doa-custom" maxlength="${DOA_NAMA_MAX}" placeholder="Contoh: Doa Bersin" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
            </div>
            <div id="m-kag-halaman-wrap" class="hidden">
                <label for="m-kag-halaman" class="block text-xs font-bold text-slate-500 mb-1">HALAMAN TERAKHIR (OPSIONAL)</label>
                <input type="number" id="m-kag-halaman" min="1" max="60" inputmode="numeric" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" value="${record && record.halaman ? escapeHtml(String(record.halaman)) : ''}" placeholder="Contoh: 14">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-kag-tanggal" class="block text-xs font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-kag-tanggal" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" value="${record ? record.tanggal : getDateWITA()}" required>
                </div>
                <div>
                    <label for="m-kag-status" class="block text-xs font-bold text-slate-500 mb-1">STATUS</label>
                    <select id="m-kag-status" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        <option value="Lancar" ${record && record.status === 'Lancar' ? 'selected' : ''}>Lancar</option>
                        <option value="Mengulang" ${record && record.status === 'Mengulang' ? 'selected' : ''}>Mengulang</option>
                        <option value="Belum Mulai" ${record && record.status === 'Belum Mulai' ? 'selected' : ''}>Belum Mulai</option>
                    </select>
                </div>
            </div>
            <p id="m-kag-hint" class="text-[11px] text-slate-400 -mt-1"></p>
            <div>
                <label for="m-kag-catatan" class="block text-xs font-bold text-slate-500 mb-1">CATATAN GURU</label>
                <textarea id="m-kag-catatan" rows="2" placeholder="Catatan kelancaran / tajwid / makhraj..." class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">${record ? escapeHtml(record.catatan || '') : ''}</textarea>
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Capaian</button>
        </form>
    `;
    onKeagamaanKategoriChange(record ? record.nama_surat : "");
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function saveKeagamaanForm(e, id) {
    e.preventDefault();
    const kategori = document.getElementById("m-kag-kategori").value;
    const halRaw = document.getElementById("m-kag-halaman").value;
    let namaItem = document.getElementById("m-kag-surah").value;

    if (kategori === "doa" && namaItem === DOA_LAINNYA_VALUE) {
        namaItem = resolveNamaDoa(document.getElementById("m-kag-doa-custom").value);
        if (!namaItem) {
            Swal.fire({ icon: 'warning', title: 'Nama Doa Kosong', text: 'Silakan ketik nama doa terlebih dahulu.', confirmButtonColor: '#2563eb' });
            return;
        }
        namaItem = namaItem.substring(0, DOA_NAMA_MAX);
    }

    const payload = {
        id: id || ("HFL-" + Date.now()),
        siswa_id: document.getElementById("m-kag-siswa").value,
        kategori,
        nama_surat: namaItem,
        halaman: kategori === "iqro" ? halRaw : "",
        tanggal: document.getElementById("m-kag-tanggal").value,
        status: document.getElementById("m-kag-status").value,
        catatan: document.getElementById("m-kag-catatan").value
    };

    const idx = appState.keagamaan.findIndex(x => String(x.id) === String(payload.id));
    const base = idx !== -1 ? appState.keagamaan[idx] : buildAuditLocal(payload.siswa_id);
    const localRec = { ...base, ...payload };
    if (idx !== -1) appState.keagamaan[idx] = localRec;
    else appState.keagamaan.push(localRec);

    saveAppStateToLocal();
    renderKeagamaanView();
    closeModal();
    showToast("Catatan keagamaan tersimpan!");

    const res = await apiCall("saveKeagamaan", payload, false);
    if (res && res.status === "error") {
        showToast(res.message || "Gagal menyimpan catatan keagamaan.", "warning");
        loadKeagamaanData(true);
    }
}

async function deleteKeagamaan(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Keagamaan?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        appState.keagamaan = appState.keagamaan.filter(x => String(x.id) !== String(id));
        saveAppStateToLocal();
        renderKeagamaanView();
        showToast("Catatan keagamaan dihapus");
        const res = await apiCall("deleteKeagamaan", { id }, false);
        if (res && res.status === "error") {
            showToast(res.message || "Gagal menghapus catatan keagamaan.", "warning");
            loadKeagamaanData(true);
        }
    }
}

function cetakPDFKeagamaan() {
    const selectEl = document.getElementById("karakter-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    if (!filterSiswaId || filterSiswaId === "ALL" || filterSiswaId === "") {
        Swal.fire({ icon: 'warning', title: 'Pilih Siswa', text: 'Silakan pilih satu siswa terlebih dahulu sebelum mencetak.', confirmButtonColor: '#2563eb' });
        return;
    }

    const siswa = appState.siswa.find(s => String(s.id) === String(filterSiswaId)) || appState.user;
    const kls = siswa ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;
    const filteredHafalan = (appState.keagamaan || []).filter(h => String(h.siswa_id) === String(filterSiswaId));

    if (filteredHafalan.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Belum ada catatan keagamaan untuk siswa ini.', confirmButtonColor: '#2563eb' });
        return;
    }

    const stats = getHafalanProgressStats(filteredHafalan);

    const sortedHafalan = [...filteredHafalan].sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));
    const rowsHtml = sortedHafalan.map((item, idx) => `
        <tr>
            <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.tanggal)}</td>
            <td style="padding: 6px 6px; text-align: center;">${KEAGAMAAN_KATEGORI[getKategoriHafalan(item)].label}</td>
            <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(formatCapaianKeagamaan(item))}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.status)}</td>
            <td style="padding: 6px 8px; text-align: left;">${item.catatan ? escapeHtml(item.catatan) : '-'}</td>
        </tr>
    `).join('');

    const contentHtml = `
        ${pdfInfoBlock([{label: "Nama Siswa", value: siswa ? siswa.nama : "-"}, {label: "Kelas", value: kls ? kls.nama_kelas : "-"}])}
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 6px;">Juz 30 (Juz Amma)</th>
                    <th style="padding: 6px;">Total 114 Surah</th>
                    <th style="padding: 6px;">Jilid Iqro Selesai</th>
                    <th style="padding: 6px;">Doa Dihafal</th>
                </tr>
            </thead>
            <tbody>
                <tr style="text-align: center; font-weight: bold;">
                    <td style="padding: 6px;">${stats.juz30.count}/${stats.juz30.total} (${stats.juz30.percent}%)</td>
                    <td style="padding: 6px;">${stats.total.count}/${stats.total.total} (${stats.total.percent}%)</td>
                    <td style="padding: 6px;">${stats.iqro.count}/${stats.iqro.total} (${stats.iqro.percent}%)</td>
                    <td style="padding: 6px;">${stats.doa.count}/${stats.doa.total} (${stats.doa.percent}%)${stats.doa.tambahan > 0 ? ` +${stats.doa.tambahan} tambahan` : ''}</td>
                </tr>
            </tbody>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 6px; width: 80px;">Tanggal</th>
                    <th style="padding: 8px 6px; width: 60px;">Kategori</th>
                    <th style="padding: 8px 6px; text-align: left;">Capaian</th>
                    <th style="padding: 8px 6px; width: 80px;">Status</th>
                    <th style="padding: 8px 6px; text-align: left;">Catatan</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;

    exportFeaturePDF(
        "JURNAL & PROGRES KEAGAMAAN",
        contentHtml,
        `Jurnal_Keagamaan_${siswa ? siswa.nama.replace(/\s+/g, '_') : filterSiswaId}_${getDateWITA()}.pdf`
    );
}
