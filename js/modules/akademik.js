function switchAkademikTab(tab) {
    const tgtPre = document.getElementById(`akd-tab-${tab}`);
    const berubahAkd = !!(tgtPre && tgtPre.classList.contains("hidden"));
    document.querySelectorAll(".akd-tab-content").forEach(c => c.classList.add("hidden"));
    document.querySelectorAll(".akd-tab-btn").forEach(b => {
        b.classList.remove("bg-white", "text-primary", "shadow-sm", "bg-surface");
        b.classList.add("text-slate-600");
    });

    const target = document.getElementById(`akd-tab-${tab}`);
    const targetBtn = document.getElementById(`btn-akd-tab-${tab}`);

    if (target) target.classList.remove("hidden");
    if (targetBtn) {
        targetBtn.classList.add("bg-white", "text-primary", "shadow-sm");
        targetBtn.classList.remove("text-slate-600");
    }

    if (berubahAkd) animateSwap(target, tab === "prestasi" ? "left" : "right");
    if (tab === "nilai") renderAkademikNilai();
    if (tab === "prestasi") renderAkademikPrestasi();
}

async function loadAkademikData(forceRefresh = false) {
    const filterSelect = document.getElementById("akademik-siswa-filter");
    if (filterSelect && filterSelect.options.length === 0) {
        populateSiswaSelectForRole(filterSelect, { includeAllOption: true });
    }

    const rawSelectedSiswaId = filterSelect ? filterSelect.value : "";
    const isAdminOrGuru = isStafLihat();
    const isPrestasiActive = !document.getElementById("akd-tab-prestasi")?.classList.contains("hidden");
    const currentTab = isPrestasiActive ? 'prestasi' : 'nilai';

    if (isAdminOrGuru && rawSelectedSiswaId === "") {
        switchAkademikTab(currentTab);
        return;
    }

    const selectedSiswaId = rawSelectedSiswaId === "ALL" ? null : rawSelectedSiswaId;
    const isStale = (Date.now() - (lastFetchTimes.akademik || 0)) > CACHE_TTL;

    if (appState.akademik && appState.akademik.length > 0) {
        switchAkademikTab(currentTab);
    } else {
        renderSkeleton("akademik-list-container", 3);
        renderSkeleton("prestasi-list-container", 3);
    }

    if (forceRefresh || isStale || !appState.akademik || appState.akademik.length === 0) {
        const [resAkd, resPrs] = await Promise.all([
            apiCall("getAkademik", { siswa_id: selectedSiswaId }, false),
            apiCall("getPrestasi", { siswa_id: selectedSiswaId }, false)
        ]);

        if (resAkd && resAkd.data) appState.akademik = resAkd.data;
        if (resPrs && resPrs.data) appState.prestasi = resPrs.data;

        lastFetchTimes.akademik = Date.now();
        saveAppStateToLocal();
        switchAkademikTab(currentTab);
    }
}

function renderAkademikNilai() {
    const container = document.getElementById("akademik-list-container");
    if (!container) return;

    const selectEl = document.getElementById("akademik-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    const isAdminOrGuru = isStafLihat();

    if (isAdminOrGuru && filterSiswaId === "") {
        container.innerHTML = maskotKosong("Silakan pilih siswa terlebih dahulu.", 96, "akademik");
        return;
    }

    const dalamPeran = scopeBySiswaId(appState.akademik, item => item.siswa_id);
    const idSaya = String((appState.user && appState.user.id) || "").trim();
    const idDalam = new Set(dalamPeran.map(item => String(item.id)));
    const milikSaya = isGuruUser()
        ? (appState.akademik || []).filter(item => !idDalam.has(String(item.id)) && String(item.dibuat_oleh_id || "").trim() === idSaya)
        : [];
    const baseAkademik = dalamPeran.concat(milikSaya);
    const filteredAkademik = akdTerapkanFilterSemester((filterSiswaId && filterSiswaId !== "ALL")
        ? baseAkademik.filter(item => String(item.siswa_id) === String(filterSiswaId))
        : baseAkademik);
    const bannerBaca = renderReadOnlyBanner('akademik', 'nilai mapel') + akdFilterSemesterHtml();
    akdPasangGaya();

    if (filteredAkademik.length === 0) {
        container.innerHTML = bannerBaca + maskotKosong("Belum ada data nilai mata pelajaran untuk siswa ini.", 96, "akademik");
        return;
    }

    const idsBisaHapusAkd = filteredAkademik.filter(item => canEditRecord(item, 'akademik')).map(item => String(item.id));
    const kartuHtml = filteredAkademik.map(item => {
        const sDalam = appState.siswa.find(x => String(x.id) === String(item.siswa_id));
        const luarPeran = !sDalam && !!item.siswa_nama;
        const s = sDalam || (luarPeran
            ? { nama: item.siswa_nama + (item.nama_kelas ? " (" + item.nama_kelas + ")" : "") }
            : appState.user);
        const isBelowKKTP = Number(item.nilai_akhir) < Number(item.kktp);
        const badgeColor = isBelowKKTP ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
        const bisaUbah = canEditRecord(item, 'akademik');

        return `
            <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between">
                ${bisaUbah ? bulkCheckbox("akademik", item.id) : ""}
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.mapel)}</h4>
                    ${renderInfoRows([
                        {label:"Siswa",value:escapeHtml(s ? s.nama : 'Siswa') + (luarPeran ? '' : ' <span class="ml-1">' + renderPeranChip(s) + '</span>'),html:true},
                        {label:"Semester",value:item.semester || "-"},
                        {label:"Tugas",value:akdChipDaftar(item, "tugas"),html:true},
                        {label:"Rata-Rata Tugas",value:akdChipDaftar(item, "tugas") ? '<b class="text-slate-900">' + escapeHtml(akdFmt(akdRataItem(item, "tugas"))) + '</b>' : "",html:true},
                        {label:"UH",value:akdChipDaftar(item, "uh"),html:true},
                        {label:"Rata-Rata UH",value:akdChipDaftar(item, "uh") ? '<b class="text-slate-900">' + escapeHtml(akdFmt(akdRataItem(item, "uh"))) + '</b>' : "",html:true},
                        {label:"STS",value:akdAngka(item.sts) !== null ? akdFmt(item.sts) : ""},
                        {label:"ASAS",value:akdAngka(item.asas) !== null ? akdFmt(item.asas) : ""},
                        {label:"Nilai Akhir",value:'<b class="text-slate-900">' + escapeHtml(akdFmt(item.nilai_akhir)) + '</b>' + (akdSementara(item) ? '<span class="akd-sementara">sementara</span>' : ''),html:true},
                        {label:"KKTP",value:'<b class="text-slate-900">' + escapeHtml(akdFmt(item.kktp)) + '</b>',html:true}
                    ])}
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-black px-2.5 py-1 rounded-xl border ${badgeColor}">
                        ${akdFmt(item.nilai_akhir)} ${isBelowKKTP ? '⚠️' : '✅'}
                    </span>
                    ${bisaUbah ? `
                    <div class="flex gap-1">
                        <button onclick="openModalAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit nilai akademik"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAkademik('${escapeHtml(item.id)}')" class="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus nilai akademik"><i class="fas fa-trash"></i></button>
                    </div>` : ''}
                </div>
            </div>
            ${item.dibuat_oleh_nama ? `
            <div class="akd-diinput-footer mt-2 pt-2 border-t border-slate-100 text-[11px] leading-snug">
                <span class="text-slate-400 font-semibold">Diinput oleh :</span>
                <span class="font-bold text-slate-700"> ${escapeHtml(item.dibuat_oleh_nama)}</span>
            </div>` : ''}
        </div>
        `;
    }).join("");

    const tabelHtml = akdTabelLeger(filteredAkademik, bulkAktif("akademik"));

    container.innerHTML = bannerBaca + bulkToolbar("akademik", idsBisaHapusAkd)
        + `<div class="tt-kartu-wrap space-y-2.5">${kartuHtml}</div>` + tabelHtml;
}

const AKD_MAKS_DAFTAR = 25;
const AKD_SEMESTER = ["Ganjil", "Genap"];
const AKD_BOBOT = { tugas: 20, uh: 30, sts: 20, asas: 30 };


function akdLabelKomponen(k, n) {
    if (k === "sts") return "STS";
    if (k === "asas") return "ASAS";
    if (k === "tugas") return "Tugas" + (n ? " " + n : "");
    if (k === "uh") return "UH" + (n ? " " + n : "");
    return k;
}

function akdAngka(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(String(v).replace(",", "."));
    return isFinite(n) ? n : null;
}

function akdFmt(v) {
    const n = akdAngka(v);
    return n === null ? "-" : String(Math.round(n * 100) / 100).replace(".", ",");
}

function akdDaftar(item, prefix) {
    let arr = [];
    const m = item ? item[prefix] : "";
    if (Array.isArray(m)) arr = m;
    else if (m !== "" && m !== null && m !== undefined) {
        try { const j = JSON.parse(String(m)); if (Array.isArray(j)) arr = j; } catch (e) { arr = []; }
    } else if (item) {
        for (let i = 1; i <= 5; i++) arr.push(item[prefix + "_" + i]);
    }
    return arr.map(v => akdAngka(v));
}

function akdHitungRapor(komp) {
    const ada = l => (l || []).map(akdAngka).filter(n => n !== null);
    const rata = l => l.length ? Math.round(l.reduce((a, b) => a + b, 0) / l.length * 100) / 100 : null;
    const rt = rata(ada(komp.tugas)), ru = rata(ada(komp.uh)), sts = akdAngka(komp.sts), asas = akdAngka(komp.asas);
    let total = 0, bobot = 0;
    [[rt, AKD_BOBOT.tugas], [ru, AKD_BOBOT.uh], [sts, AKD_BOBOT.sts], [asas, AKD_BOBOT.asas]].forEach(p => {
        if (p[0] !== null) { total += p[0] * p[1]; bobot += p[1]; }
    });
    return { rata_tugas: rt, rata_uh: ru, nilai_akhir: bobot > 0 ? Math.round(total / bobot * 100) / 100 : null };
}

function akdSemesterDefault() {
    if (typeof kalenderSemester === "function") return kalenderSemester().semester;
    return Number(String(getDateWITA()).slice(5, 7)) >= 7 ? "Ganjil" : "Genap";
}

function akdFilterSemester(list, smt) {
    const s = smt || akdSemesterDefault();
    return (list || []).filter(a => !a.semester || a.semester === s);
}

let _akdSemFilter = "aktif";

function akdTerapkanFilterSemester(list) {
    if (_akdSemFilter === "semua") return list;
    return akdFilterSemester(list, _akdSemFilter === "aktif" ? "" : _akdSemFilter);
}

function akdSetFilterSemester(v) {
    _akdSemFilter = v;
    renderAkademikNilai();
}

function akdFilterSemesterHtml() {
    const opt = (v, t) => `<option value="${v}" ${_akdSemFilter === v ? "selected" : ""}>${t}</option>`;
    return `<div class="flex items-center gap-2 mb-2">
        <label for="akd-sem-filter" class="text-xs font-bold text-slate-500">SEMESTER</label>
        <select id="akd-sem-filter" onchange="akdSetFilterSemester(this.value)" class="bg-slate-50 border p-1.5 rounded-lg text-xs outline-none">
            ${opt("aktif", "Berjalan (" + akdSemesterDefault() + ")")}${opt("Ganjil", "Ganjil")}${opt("Genap", "Genap")}${opt("semua", "Semua")}
        </select>
    </div>`;
}

function akdDaftarNilai(item, prefix) {
    return akdDaftar(item, prefix).filter(v => v !== null).map(akdFmt).join(", ");
}

function akdPasangGaya() {
    if (document.getElementById("akd-gaya")) return;
    const st = document.createElement("style");
    st.id = "akd-gaya";
    st.textContent = `
.akd-grup { display: none; margin-bottom: 1.25rem; }
@media (min-width: 768px) { .akd-grup { display: block; } }
.akd-grup-judul { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin: 0 0 0.5rem; font-size: 0.8125rem; font-weight: 800; color: #1e293b; }
.akd-grup-judul span { font-size: 0.6875rem; font-weight: 600; color: #64748b; }
.tt-tabel th.akd-n, .tt-tabel td.akd-n { min-width: 2.75rem; padding-left: 0.35rem; padding-right: 0.35rem; }
.tt-tabel thead th.akd-band { background: #e2e8f0; }
.tt-tabel td.akd-rata, .tt-tabel thead th.akd-rata { background: #f1f5f9; font-weight: 800; color: #0f172a; }
.tt-tabel thead th.akd-rata { background: #e2e8f0; }
.akd-sementara { display: block; margin-top: 2px; font-size: 0.625rem; font-weight: 700; color: #b45309; }
.akd-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.akd-chip { display: inline-flex; gap: 0.25rem; padding: 0.125rem 0.375rem; border-radius: 0.5rem; background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 0.6875rem; color: #334155; }
.akd-chip b { color: #64748b; }
body.dark .akd-grup-judul { color: #f1f5f9; }
body.dark .akd-grup-judul span { color: #94a3b8; }
body.dark .tt-tabel thead th.akd-band, body.dark .tt-tabel thead th.akd-rata { background: #1e293b; color: #e2e8f0; }
body.dark .tt-tabel td.akd-rata { background: #273449; color: #f1f5f9; }
body.dark .akd-sementara { color: #fbbf24; }
body.dark .akd-chip { background: #273449; border-color: #334155; color: #e2e8f0; }
body.dark .akd-chip b { color: #94a3b8; }
`;
    document.head.appendChild(st);
}

function akdInfoSiswa(item) {
    const sDalam = (appState.siswa || []).find(x => String(x.id) === String(item.siswa_id));
    const luarPeran = !sDalam && !!item.siswa_nama;
    const s = sDalam || (luarPeran
        ? { nama: item.siswa_nama + (item.nama_kelas ? " (" + item.nama_kelas + ")" : "") }
        : appState.user);
    return { s: s, luarPeran: luarPeran, nama: s ? s.nama : "Siswa" };
}

function akdRataItem(item, jenis) {
    const h = akdHitungRapor({ tugas: akdDaftar(item, "tugas"), uh: akdDaftar(item, "uh"), sts: "", asas: "" });
    const v = jenis === "uh" ? h.rata_uh : h.rata_tugas;
    return v === null ? akdAngka(item["rata_" + jenis]) : v;
}

function akdSementara(item) {
    const ada = akdDaftar(item, "tugas").some(v => v !== null) || akdDaftar(item, "uh").some(v => v !== null)
        || akdAngka(item.sts) !== null || akdAngka(item.asas) !== null;
    return ada && akdAngka(item.asas) === null;
}

function akdMaksKolom(rows, jenis) {
    let m = 0;
    rows.forEach(r => {
        const d = akdDaftar(r, jenis);
        let n = d.length;
        while (n > 0 && d[n - 1] === null) n--;
        m = Math.max(m, n);
    });
    return Math.max(m, 1);
}

function akdChipDaftar(item, jenis) {
    const d = akdDaftar(item, jenis);
    while (d.length && d[d.length - 1] === null) d.pop();
    if (!d.length) return "";
    const kode = jenis === "uh" ? "UH" : "T";
    return `<span class="akd-chips">${d.map((v, i) =>
        `<span class="akd-chip"><b>${kode}${i + 1}</b> ${v === null ? "-" : escapeHtml(akdFmt(v))}</span>`).join("")}</span>`;
}

function akdSelAngka(v, kelas) {
    return `<td class="tt-tengah ${kelas || ""}">${v === null || v === undefined ? '<span class="text-slate-300">-</span>' : escapeHtml(akdFmt(v))}</td>`;
}

function akdTabelLeger(list, kolCek) {
    const modeSiswa = new Set(list.map(r => String(r.siswa_id))).size === 1;
    const banding = (a, b) => String(a).localeCompare(String(b), "id", { sensitivity: "base", numeric: true });
    const idxMapel = m => { const i = DAFTAR_MAPEL.indexOf(String(m || "").trim()); return i === -1 ? 999 : i; };

    const grup = new Map();
    list.forEach(r => {
        const kunci = (modeSiswa ? "" : String(r.mapel || "").trim().toLowerCase()) + "|" + (r.semester || "");
        if (!grup.has(kunci)) grup.set(kunci, []);
        grup.get(kunci).push(r);
    });
    const daftarGrup = [...grup.values()].sort((a, b) => modeSiswa
        ? banding(a[0].semester || "", b[0].semester || "")
        : (idxMapel(a[0].mapel) - idxMapel(b[0].mapel)) || banding(a[0].mapel, b[0].mapel) || banding(a[0].semester || "", b[0].semester || ""));

    return daftarGrup.map(g => {
        const rows = [...g].sort((a, b) => modeSiswa
            ? (idxMapel(a.mapel) - idxMapel(b.mapel)) || banding(a.mapel, b.mapel)
            : banding(akdInfoSiswa(a).nama, akdInfoSiswa(b).nama));
        const nT = akdMaksKolom(rows, "tugas");
        const nU = akdMaksKolom(rows, "uh");
        const smtLabel = rows[0].semester ? "Semester " + rows[0].semester : "Tanpa semester";
        const judul = modeSiswa ? smtLabel : String(rows[0].mapel || "");
        const sub = modeSiswa
            ? akdInfoSiswa(rows[0]).nama + " \u00B7 " + rows.length + " mapel"
            : smtLabel + " \u00B7 " + rows.length + " siswa";

        const th2 = (t, kelas) => `<th scope="col" rowspan="2" class="${kelas || ""}">${t}</th>`;
        const subHead = (kode, jenis, n) => Array.from({ length: n }, (_, i) =>
            `<th scope="col" class="akd-n" title="${akdLabelKomponen(jenis, i + 1)}"><span aria-hidden="true">${kode}${i + 1}</span><span class="sr-only">${akdLabelKomponen(jenis, i + 1)}</span></th>`).join("");

        const body = rows.map((item, i) => {
            const inf = akdInfoSiswa(item);
            const dibawah = Number(item.nilai_akhir) < Number(item.kktp);
            const badgeColor = dibawah ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200';
            const bisaUbah = canEditRecord(item, 'akademik');
            const dT = akdDaftar(item, "tugas"), dU = akdDaftar(item, "uh");
            const selT = Array.from({ length: nT }, (_, k) => akdSelAngka(k < dT.length ? dT[k] : null, "akd-n")).join("");
            const selU = Array.from({ length: nU }, (_, k) => akdSelAngka(k < dU.length ? dU[k] : null, "akd-n")).join("");
            const namaSel = modeSiswa
                ? escapeHtml(item.mapel)
                : escapeHtml(inf.nama) + (inf.luarPeran ? '' : ' <span class="ml-1">' + renderPeranChip(inf.s) + '</span>');
            return `
            <tr>
                ${kolCek ? `<td class="tt-cek">${bisaUbah ? bulkCheckbox("akademik", item.id) : ""}</td>` : ""}
                <td class="tt-no">${i + 1}</td>
                <th scope="row" class="tt-nama">${namaSel}</th>
                ${selT}
                ${akdSelAngka(akdRataItem(item, "tugas"), "akd-rata")}
                ${selU}
                ${akdSelAngka(akdRataItem(item, "uh"), "akd-rata")}
                ${akdSelAngka(akdAngka(item.sts))}
                ${akdSelAngka(akdAngka(item.asas))}
                <td class="tt-tengah"><span class="inline-block text-xs font-black px-2 py-0.5 rounded-lg border ${badgeColor}">${escapeHtml(akdFmt(item.nilai_akhir))} ${dibawah ? '\u26A0\uFE0F' : '\u2705'}</span>${akdSementara(item) ? '<span class="akd-sementara">sementara</span>' : ''}</td>
                <td class="tt-tengah">${escapeHtml(akdFmt(item.kktp))}</td>
                <td class="tt-padat">${escapeHtml(item.dibuat_oleh_nama || "-")}</td>
                <td class="tt-aksi">${bisaUbah ? `
                    <span class="tt-aksi-grup">
                        <button onclick="openModalAkademik('${escapeHtml(item.id)}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg text-xs" aria-label="Edit nilai"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAkademik('${escapeHtml(item.id)}')" class="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs" aria-label="Hapus nilai"><i class="fas fa-trash"></i></button>
                    </span>` : ""}</td>
            </tr>`;
        }).join("");

        return `
        <section class="akd-grup" aria-label="${escapeHtml(judul)}">
            <h4 class="akd-grup-judul">${escapeHtml(judul)}<span>${escapeHtml(sub)}</span></h4>
            <div class="tt-tabel-wrap tt-tinggi">
                <table class="tt-tabel">
                    <caption class="sr-only">Nilai ${escapeHtml(judul)}, ${escapeHtml(sub)}</caption>
                    <thead>
                        <tr>
                            ${kolCek ? '<th scope="col" rowspan="2" class="tt-cek"><span class="sr-only">Pilih</span></th>' : ""}
                            ${th2("No", "tt-no")}
                            ${th2(modeSiswa ? "Mapel" : "Siswa", "tt-nama")}
                            <th scope="colgroup" colspan="${nT}" class="akd-band">Tugas</th>
                            ${th2("Rata-Rata Tugas", "akd-rata")}
                            <th scope="colgroup" colspan="${nU}" class="akd-band">UH</th>
                            ${th2("Rata-Rata UH", "akd-rata")}
                            ${th2("STS", "tt-tengah")}
                            ${th2("ASAS", "tt-tengah")}
                            ${th2("Nilai Akhir", "tt-tengah")}
                            ${th2("KKTP", "tt-tengah")}
                            ${th2("Diinput oleh")}
                            ${th2("Aksi", "tt-aksi")}
                        </tr>
                        <tr>${subHead("T", "tugas", nT)}${subHead("UH", "uh", nU)}</tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            </div>
        </section>`;
    }).join("");
}

function akdBacaForm() {
    const komp = { tugas: [], uh: [], sts: "", asas: "" };
    document.querySelectorAll("[data-akd-list]").forEach(i => komp[i.dataset.akdList].push(i.value.trim()));
    document.querySelectorAll("[data-akd-kom]").forEach(i => { komp[i.dataset.akdKom] = i.value.trim(); });
    return komp;
}

function akdUpdatePreview() {
    const el = document.getElementById("akd-preview");
    if (!el) return;
    const komp = akdBacaForm();
    const h = akdHitungRapor(komp);
    const manualEl = document.getElementById("m-akd-nilai");
    const kktp = akdAngka((document.getElementById("m-akd-kktp") || {}).value);
    let nilai = h.nilai_akhir;
    if (nilai === null && manualEl) nilai = akdAngka(manualEl.value);
    const bawah = nilai !== null && kktp !== null && nilai < kktp;
    el.className = "rounded-xl border px-3 py-2 text-xs " + (nilai === null ? "bg-slate-50 border-slate-200 text-slate-500" : (bawah ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"));
    el.innerHTML = nilai === null
        ? "Nilai rapor muncul setelah ada nilai terisi."
        : `<b>Nilai Rapor: ${akdFmt(nilai)}</b> ${bawah ? "(di bawah KKTP)" : "(tuntas)"}<br><span class="opacity-80">Rata-Rata Tugas ${akdFmt(h.rata_tugas)} &bull; Rata-Rata UH ${akdFmt(h.rata_uh)} &bull; STS ${akdFmt(komp.sts)} &bull; ASAS ${akdFmt(komp.asas)}${h.nilai_akhir !== null && akdAngka(komp.asas) === null ? " (sementara, ASAS belum diisi)" : ""}</span>`;
}

function akdKotakDaftarHtml(jenis, idx, nilai) {
    return `<div data-akd-kotak="${jenis}">
        <label class="block text-[10px] font-bold text-slate-500 mb-1">${akdLabelKomponen(jenis, idx + 1).toUpperCase()}</label>
        <input type="number" data-akd-list="${jenis}" min="0" max="100" step="0.01" inputmode="decimal" oninput="akdUpdatePreview()" value="${nilai === null || nilai === undefined ? '' : escapeHtml(String(nilai))}" aria-label="${akdLabelKomponen(jenis, idx + 1)}" class="w-full bg-slate-50 border p-2 rounded-xl text-xs text-center outline-none">
    </div>`;
}

function akdTambahKotak(jenis) {
    const wadah = document.getElementById("akd-wadah-" + jenis);
    if (!wadah) return;
    const n = wadah.querySelectorAll("[data-akd-list]").length;
    if (n >= AKD_MAKS_DAFTAR) { showToast("Maksimal " + AKD_MAKS_DAFTAR + " " + akdLabelKomponen(jenis) + ".", "warning"); return; }
    wadah.insertAdjacentHTML("beforeend", akdKotakDaftarHtml(jenis, n, null));
    const kotak = wadah.querySelectorAll("[data-akd-list]");
    kotak[kotak.length - 1].focus();
    akdUpdatePreview();
}

function akdHapusKotak(jenis) {
    const wadah = document.getElementById("akd-wadah-" + jenis);
    if (!wadah) return;
    const kotak = wadah.querySelectorAll("[data-akd-kotak]");
    if (kotak.length <= 1) { showToast("Minimal satu kotak " + akdLabelKomponen(jenis) + ".", "warning"); return; }
    kotak[kotak.length - 1].remove();
    akdUpdatePreview();
}

function akdFormKomponenHtml(rec) {
    const semPilih = rec && rec.semester ? rec.semester : akdSemesterDefault();
    const kunciSemester = !isAdminUser();
    const semOpts = AKD_SEMESTER.map(s => `<option value="${s}" ${s === semPilih ? 'selected' : ''}>${s}</option>`).join("");

    const daftarKotak = jenis => {
        let nilai = rec ? akdDaftar(rec, jenis) : [];
        while (nilai.length && nilai[nilai.length - 1] === null) nilai.pop();
        if (nilai.length < AKD_MAKS_DAFTAR) nilai.push(null);
        return nilai.map((v, i) => akdKotakDaftarHtml(jenis, i, v)).join("");
    };
    const blokDaftar = (jenis, judul, bobot) => `
            <div>
                <div class="flex items-center justify-between mb-1">
                    <p class="text-xs font-bold text-slate-500">${judul} <span class="font-normal text-slate-400">(bobot ${bobot}%)</span></p>
                    <div class="flex gap-1">
                        <button type="button" onclick="akdTambahKotak('${jenis}')" class="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold">+ ${akdLabelKomponen(jenis)}</button>
                        <button type="button" onclick="akdHapusKotak('${jenis}')" class="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold" aria-label="Hapus kotak terakhir ${akdLabelKomponen(jenis)}"><i class="fas fa-minus"></i></button>
                    </div>
                </div>
                <div id="akd-wadah-${jenis}" class="grid grid-cols-4 gap-1.5">${daftarKotak(jenis)}</div>
            </div>`;
    const kotakTunggal = k => `
        <div>
            <label for="m-akd-${k}" class="block text-[10px] font-bold text-slate-500 mb-1">${akdLabelKomponen(k).toUpperCase()}</label>
            <input type="number" id="m-akd-${k}" data-akd-kom="${k}" min="0" max="100" step="0.01" inputmode="decimal" oninput="akdUpdatePreview()" value="${rec && akdAngka(rec[k]) !== null ? escapeHtml(rec[k]) : ''}" class="w-full bg-slate-50 border p-2 rounded-xl text-xs text-center outline-none">
        </div>`;
    const legacy = !!rec && !akdDaftar(rec, "tugas").some(v => v !== null) && !akdDaftar(rec, "uh").some(v => v !== null)
        && akdAngka(rec.sts) === null && akdAngka(rec.asas) === null;
    const manual = legacy ? `
        <div>
            <label for="m-akd-nilai" class="block text-xs font-bold text-slate-500 mb-1">NILAI AKHIR (DATA LAMA)</label>
            <input type="number" id="m-akd-nilai" min="0" max="100" step="0.01" inputmode="decimal" oninput="akdUpdatePreview()" value="${escapeHtml(rec.nilai_akhir)}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
            <p class="text-[11px] text-slate-400 mt-1">Data lama tanpa komponen. Isi komponen di bawah untuk menghitung otomatis.</p>
        </div>` : "";
    return `
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-akd-semester" class="block text-xs font-bold text-slate-500 mb-1">SEMESTER</label>
                    <select id="m-akd-semester" ${kunciSemester ? 'disabled' : ''} class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${kunciSemester ? 'opacity-70' : ''}" required>${semOpts}</select>
                    ${kunciSemester ? '<p class="text-[11px] text-slate-400 mt-1"><i class="fas fa-lock mr-1"></i>Dikunci sesuai kalender semester.</p>' : ''}
                </div>
                <div>
                    <label for="m-akd-kktp" class="block text-xs font-bold text-slate-500 mb-1">KKTP</label>
                    <input type="number" id="m-akd-kktp" min="0" max="100" step="0.01" inputmode="decimal" oninput="akdUpdatePreview()" value="${rec ? escapeHtml(rec.kktp) : '75'}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            ${manual}
            ${blokDaftar("tugas", "NILAI TUGAS", AKD_BOBOT.tugas)}
            ${blokDaftar("uh", "ULANGAN HARIAN", AKD_BOBOT.uh)}
            <div>
                <p class="text-xs font-bold text-slate-500 mb-1">ASESMEN SUMATIF <span class="font-normal text-slate-400">(STS ${AKD_BOBOT.sts}%, ASAS ${AKD_BOBOT.asas}%)</span></p>
                <div class="grid grid-cols-2 gap-2">${kotakTunggal("sts")}${kotakTunggal("asas")}</div>
            </div>
            <p class="text-[11px] text-slate-400">Kotak kosong tidak dihitung. Isi 0 jika siswa tidak mengumpulkan. Maks ${AKD_MAKS_DAFTAR} tugas dan ${AKD_MAKS_DAFTAR} UH.</p>
            <div id="akd-preview" class="rounded-xl border px-3 py-2 text-xs bg-slate-50 border-slate-200 text-slate-500"></div>
            <button type="submit" class="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Nilai</button>`;
}

const DAFTAR_MAPEL = ["Agama", "PKn", "Bahasa Indonesia", "Bahasa Inggris", "Matematika", "IPA", "IPS", "PJOK", "Informatika", "Prakarya"];

let _siswaSemuaAkd = null;

async function ambilSiswaSemuaAkademik() {
    if (_siswaSemuaAkd && Date.now() - _siswaSemuaAkd.t < 5 * 60 * 1000) return _siswaSemuaAkd.data;
    showLoading("Memuat daftar siswa...");
    const res = await apiCall("getSiswaAkademik", {}, false);
    hideLoading();
    if (res && res.status === "success" && Array.isArray(res.data)) {
        _siswaSemuaAkd = { t: Date.now(), data: res.data };
        return res.data;
    }
    return null;
}

let _akdPenuhT = 0;

async function akdPastikanDataPenuh() {
    if (Date.now() - _akdPenuhT < 60000) return;
    const segar = await apiCall("getAkademik", { siswa_id: null }, false);
    if (segar && segar.data) {
        appState.akademik = segar.data;
        lastFetchTimes.akademik = Date.now();
        saveAppStateToLocal();
        _akdPenuhT = Date.now();
    }
}

function akdCariBarisAda(siswaId, mapel, smt) {
    const kunci = String(mapel || "").trim().toLowerCase();
    return (appState.akademik || []).find(r => String(r.siswa_id) === String(siswaId)
        && String(r.mapel || "").trim().toLowerCase() === kunci
        && (r.semester ? r.semester === smt : true)) || null;
}

async function akdCekLanjut() {
    const form = document.getElementById("akd-form");
    const wrap = document.getElementById("akd-komponen-wrap");
    const info = document.getElementById("akd-lanjut-info");
    if (!form || !wrap || !info) return;
    const siswaId = (document.getElementById("m-akd-siswa") || {}).value || "";
    const mapel = ((document.getElementById("m-akd-mapel") || {}).value || "").trim();
    if (!siswaId || !mapel) return;
    const semEl = document.getElementById("m-akd-semester");
    const smt = isAdminUser() && semEl ? semEl.value : akdSemesterDefault();

    let ada = akdCariBarisAda(siswaId, mapel, smt);
    if (!ada) {
        await akdPastikanDataPenuh();
        if ((document.getElementById("m-akd-siswa") || {}).value !== siswaId
            || ((document.getElementById("m-akd-mapel") || {}).value || "").trim() !== mapel) return;
        ada = akdCariBarisAda(siswaId, mapel, smt);
    }

    const sebelumnya = form.dataset.lanjutId || "";
    if (ada && canEditRecord(ada, 'akademik')) {
        form.dataset.lanjutId = String(ada.id);
        wrap.innerHTML = akdFormKomponenHtml(ada);
        const hitung = j => akdDaftar(ada, j).filter(v => v !== null).length;
        info.className = "rounded-xl border px-3 py-2 text-xs bg-sky-50 border-sky-200 text-sky-700";
        info.innerHTML = `Nilai ${escapeHtml(mapel)} siswa ini sudah ada. Dilanjutkan dari <b>Tugas ${hitung("tugas") + 1}</b> dan <b>UH ${hitung("uh") + 1}</b>.`;
    } else {
        form.dataset.lanjutId = "";
        if (sebelumnya) wrap.innerHTML = akdFormKomponenHtml(null);
        if (ada) {
            info.className = "rounded-xl border px-3 py-2 text-xs bg-amber-50 border-amber-200 text-amber-700";
            info.innerHTML = "Nilai mapel ini untuk siswa tersebut diisi guru lain. Hanya guru pengisinya atau admin yang dapat menambah.";
        } else {
            info.className = "hidden";
            info.innerHTML = "";
        }
    }
    akdUpdatePreview();
}

async function openModalAkademik(id = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    box.dataset.gs = "";

    let writable;
    if (!id && isGuruUser()) {
        writable = await ambilSiswaSemuaAkademik();
        if (!writable) {
            showToast("Gagal memuat daftar siswa. Coba lagi.", "warning");
            return;
        }
    } else {
        writable = getSiswaWritable('akademik');
    }
    if (!id && writable.length === 0) {
        Swal.fire({ icon: 'info', title: 'Tidak Ada Siswa', text: 'Tidak ada siswa yang dapat Anda isi nilainya.', confirmButtonColor: '#2563eb' });
        return;
    }

    const rec = id ? (appState.akademik || []).find(x => String(x.id) === String(id)) : null;
    if (id && !rec) {
        showToast("Data nilai tidak ditemukan. Muat ulang halaman.", "warning");
        return;
    }

    const filterEl = document.getElementById("akademik-siswa-filter");
    const preSiswaId = rec ? rec.siswa_id : (filterEl && filterEl.value && filterEl.value !== "ALL" ? filterEl.value : "");
    const daftar = rec
        ? (appState.siswa || []).filter(s => String(s.id) === String(rec.siswa_id))
        : writable;
    const urut = (!rec && isGuruUser())
        ? [...daftar].sort((a, b) =>
            bandingkanKelas(a.nama_kelas, b.nama_kelas) ||
            String(a.nama || "").localeCompare(String(b.nama || ""), "id", { sensitivity: "base", numeric: true }))
        : sortSiswa(daftar);
    const siswaOpts = (rec && urut.length === 0)
        ? `<option value="${escapeHtml(rec.siswa_id)}" selected>${escapeHtml((rec.siswa_nama || rec.siswa_id) + (rec.nama_kelas ? " (" + rec.nama_kelas + ")" : ""))}</option>`
        : urut.map(s => {
        const label = (!rec && isGuruUser() && s.nama_kelas) ? `${s.nama} (${s.nama_kelas})` : s.nama;
        return `<option value="${escapeHtml(s.id)}" ${String(preSiswaId) === String(s.id) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join("");

    const mapelSaatIni = String(rec?.mapel || "").trim();
    const mapelList = DAFTAR_MAPEL.slice();
    if (mapelSaatIni && !mapelList.includes(mapelSaatIni)) mapelList.push(mapelSaatIni);
    const mapelOpts = `<option value="" ${mapelSaatIni ? '' : 'selected'} disabled>Pilih mata pelajaran</option>` +
        mapelList.map(m => `<option value="${escapeHtml(m)}" ${m === mapelSaatIni ? 'selected' : ''}>${escapeHtml(m)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Nilai Mapel' : 'Tambah Nilai Mapel'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form id="akd-form" onsubmit="saveAkademikForm(event, '${id ? escapeHtml(id) : ''}')" class="space-y-3">
            <div>
                <label for="m-akd-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-akd-siswa" ${rec ? '' : 'onchange="akdCekLanjut()"'} class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" ${rec ? 'disabled' : ''} required>${siswaOpts}</select>
            </div>
            <div>
                <label for="m-akd-mapel" class="block text-xs font-bold text-slate-500 mb-1">MATA PELAJARAN</label>
                <select id="m-akd-mapel" ${rec ? '' : 'onchange="akdCekLanjut()"'} class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${mapelOpts}</select>
            </div>
            <div id="akd-lanjut-info" class="hidden"></div>
            <div id="akd-komponen-wrap" class="space-y-3">${akdFormKomponenHtml(rec)}</div>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
    akdUpdatePreview();
}

async function saveAkademikForm(e, id) {
    e.preventDefault();
    id = id || ((document.getElementById("akd-form") || {}).dataset || {}).lanjutId || "";
    const kktp = Number(document.getElementById("m-akd-kktp").value);
    if (!(kktp >= 0 && kktp <= 100)) {
        showToast("KKTP harus 0 sampai 100.", "warning");
        return;
    }
    const semester = document.getElementById("m-akd-semester").value;
    if (!semester) { showToast("Pilih semester.", "warning"); return; }

    let salah = null;
    const cek = inp => {
        inp.classList.remove("border-rose-400");
        const v = inp.value.trim();
        if (v === "") return null;
        const n = Number(v);
        if (!(n >= 0 && n <= 100)) { inp.classList.add("border-rose-400"); salah = salah || inp; return null; }
        return n;
    };
    const komp = { tugas: [], uh: [], sts: "", asas: "" };
    document.querySelectorAll("[data-akd-list]").forEach(inp => komp[inp.dataset.akdList].push(cek(inp)));
    document.querySelectorAll("[data-akd-kom]").forEach(inp => { const n = cek(inp); komp[inp.dataset.akdKom] = n === null ? "" : n; });
    if (salah) { showToast("Semua nilai harus 0 sampai 100.", "warning"); salah.focus(); return; }
    ["tugas", "uh"].forEach(j => { while (komp[j].length && komp[j][komp[j].length - 1] === null) komp[j].pop(); });

    const adaKomponen = komp.tugas.some(v => v !== null) || komp.uh.some(v => v !== null) || komp.sts !== "" || komp.asas !== "";
    const manualEl = document.getElementById("m-akd-nilai");
    const manual = manualEl ? manualEl.value.trim() : "";
    if (!adaKomponen && manual === "") { showToast("Isi minimal satu nilai.", "warning"); return; }
    if (!adaKomponen && !(Number(manual) >= 0 && Number(manual) <= 100)) { showToast("Nilai akhir harus 0 sampai 100.", "warning"); return; }

    const h = akdHitungRapor(komp);
    const siswaEl = document.getElementById("m-akd-siswa");
    const payload = {
        id: id || null,
        siswa_id: siswaEl.value,
        mapel: document.getElementById("m-akd-mapel").value.trim(),
        semester: semester,
        kktp: kktp,
        tugas: komp.tugas,
        uh: komp.uh,
        sts: komp.sts,
        asas: komp.asas,
        rata_tugas: h.rata_tugas === null ? "" : h.rata_tugas,
        rata_uh: h.rata_uh === null ? "" : h.rata_uh,
        nilai_akhir: adaKomponen ? h.nilai_akhir : Number(manual)
    };

    showLoading("Menyimpan nilai mapel...");
    const res = await apiCall("saveAkademik", payload, false);
    hideLoading();

    if (res && res.status === "success") {
        const newId = res.id || id || ("AKD-" + Date.now());
        const diLuarPeran = !id && isGuruUser() && !(appState.siswa || []).some(s => String(s.id) === String(payload.siswa_id));
        if (diLuarPeran) {
            const segar = await apiCall("getAkademik", { siswa_id: null }, false);
            if (segar && segar.data) { appState.akademik = segar.data; saveAppStateToLocal(); }
            renderAkademikNilai();
            closeModal();
            showToast("Nilai mapel tersimpan! Lihat lewat pilihan Semua. (siswa di luar wali/binaan Anda)");
            return;
        }
        if (!Array.isArray(appState.akademik)) appState.akademik = [];
        const idx = appState.akademik.findIndex(x => String(x.id) === String(newId));
        const base = idx !== -1 ? appState.akademik[idx] : buildAuditLocal(payload.siswa_id);
        const saved = { ...base, ...payload, id: newId, semester: res.semester || payload.semester };
        if (!saved.dibuat_oleh_nama) saved.dibuat_oleh_nama = String((appState.user && (appState.user.nama || appState.user.username)) || "");
        if (idx !== -1) appState.akademik[idx] = saved;
        else appState.akademik.push(saved);

        saveAppStateToLocal();
        renderAkademikNilai();
        closeModal();
        showToast("Nilai mapel tersimpan!");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan nilai mapel.',
            confirmButtonColor: '#2563eb'
        });
    }
}

let _akdBulkSiswa = [];

async function openModalAkademikBulk() {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    box.dataset.gs = "";

    const semua = await ambilSiswaSemuaAkademik();
    if (!semua || semua.length === 0) {
        showToast("Gagal memuat daftar siswa. Coba lagi.", "warning");
        return;
    }
    _akdBulkSiswa = semua;

    const daftarKelas = [...new Set(semua.map(s => String(s.nama_kelas || "").trim()).filter(Boolean))]
        .sort(bandingkanKelas);
    const kelasOpts = `<option value="" selected disabled>Pilih kelas</option>` +
        daftarKelas.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("");
    const mapelOpts = `<option value="" selected disabled>Pilih mata pelajaran</option>` +
        DAFTAR_MAPEL.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">Input Nilai Massal</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveAkademikBulk(event)" class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-akdb-kelas" class="block text-xs font-bold text-slate-500 mb-1">KELAS</label>
                    <select id="m-akdb-kelas" onchange="renderAkdBulkList()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${kelasOpts}</select>
                </div>
                <div>
                    <label for="m-akdb-kktp" class="block text-xs font-bold text-slate-500 mb-1">KKTP</label>
                    <input type="number" id="m-akdb-kktp" min="0" max="100" step="0.01" inputmode="decimal" value="75" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <div>
                <label for="m-akdb-mapel" class="block text-xs font-bold text-slate-500 mb-1">MATA PELAJARAN</label>
                <select id="m-akdb-mapel" onchange="akdBulkGanti()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${mapelOpts}</select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-akdb-semester" class="block text-xs font-bold text-slate-500 mb-1">SEMESTER</label>
                    <select id="m-akdb-semester" onchange="akdBulkGanti()" ${isAdminUser() ? '' : 'disabled'} class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none ${isAdminUser() ? '' : 'opacity-70'}" required>${AKD_SEMESTER.map(s => `<option value="${s}" ${s === akdSemesterDefault() ? 'selected' : ''}>${s}</option>`).join("")}</select>
                    ${isAdminUser() ? '' : '<p class="text-[11px] text-slate-400 mt-1"><i class="fas fa-lock mr-1"></i>Dikunci sesuai kalender.</p>'}
                </div>
                <div>
                    <label for="m-akdb-komponen" class="block text-xs font-bold text-slate-500 mb-1">JENIS NILAI</label>
                    <select id="m-akdb-komponen" onchange="akdBulkGanti()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                        <option value="tugas">Tugas</option><option value="uh">Ulangan Harian</option><option value="sts">STS</option><option value="asas">ASAS</option>
                    </select>
                </div>
            </div>
            <div id="akdb-nomor-wrap">
                <label for="m-akdb-nomor" class="block text-xs font-bold text-slate-500 mb-1">NOMOR</label>
                <select id="m-akdb-nomor" onchange="renderAkdBulkList()" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none"></select>
                <p class="text-[11px] text-slate-400 mt-1">Satu nomor = satu penugasan untuk seluruh kelas. Pilih nomor "baru" untuk tugas berikutnya.</p>
            </div>
            <div class="flex justify-between items-center px-1">
                <span class="text-xs font-bold text-slate-500 uppercase">Nilai Siswa</span>
                <span id="akdb-counter" class="text-xs font-bold text-slate-400">0 terisi</span>
            </div>
            <div id="akdb-list" class="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
                <p class="text-xs text-slate-400 text-center py-6">Pilih kelas dulu.</p>
            </div>
            <p class="text-[11px] text-slate-400">Kosongkan nilai siswa yang tidak ingin diisi. Nilai pada nomor yang sama akan ditimpa. Kosong = tidak dihitung, isi 0 jika tidak mengumpulkan. Nilai rapor dihitung ulang otomatis.</p>
            <button type="submit" class="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Semua Nilai</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
    akdBulkRefreshNomor();
}

function akdBulkRefreshNomor() {
    const jenis = (document.getElementById("m-akdb-komponen") || {}).value || "tugas";
    const wrap = document.getElementById("akdb-nomor-wrap");
    const sel = document.getElementById("m-akdb-nomor");
    if (!wrap || !sel) return;
    const berdaftar = jenis === "tugas" || jenis === "uh";
    wrap.classList.toggle("hidden", !berdaftar);
    if (!berdaftar) return;
    const mapel = ((document.getElementById("m-akdb-mapel") || {}).value || "").trim().toLowerCase();
    const smt = (document.getElementById("m-akdb-semester") || {}).value || "";
    let maks = 0;
    (appState.akademik || []).forEach(r => {
        if (String(r.mapel || "").trim().toLowerCase() !== mapel || String(r.semester || "") !== smt) return;
        const d = akdDaftar(r, jenis);
        maks = Math.max(maks, d.length);
    });
    const dipilih = Number(sel.value) || 0;
    const jumlah = Math.min(maks + 1, AKD_MAKS_DAFTAR);
    let html = "";
    for (let i = 1; i <= jumlah; i++) html += `<option value="${i}">${akdLabelKomponen(jenis, i)}${i === maks + 1 ? " (baru)" : ""}</option>`;
    sel.innerHTML = html;
    sel.value = String(dipilih >= 1 && dipilih <= jumlah ? dipilih : jumlah);
}

function akdBulkGanti() {
    akdBulkRefreshNomor();
    renderAkdBulkList();
}

function renderAkdBulkList() {
    const kelas = (document.getElementById("m-akdb-kelas") || {}).value || "";
    const list = document.getElementById("akdb-list");
    if (!list) return;
    const siswa = _akdBulkSiswa
        .filter(s => String(s.nama_kelas || "").trim() === kelas)
        .sort((a, b) => String(a.nama || "").localeCompare(String(b.nama || ""), "id", { sensitivity: "base", numeric: true }));
    if (siswa.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Tidak ada siswa di kelas ini.</p>`;
        updateAkdBulkCounter();
        return;
    }
    const mapelPilih = ((document.getElementById("m-akdb-mapel") || {}).value || "").trim().toLowerCase();
    const smtPilih = (document.getElementById("m-akdb-semester") || {}).value || "";
    const kompPilih = (document.getElementById("m-akdb-komponen") || {}).value || "";
    const nomorPilih = Number((document.getElementById("m-akdb-nomor") || {}).value || 0);
    const nilaiAda = id => {
        if (!mapelPilih) return "";
        const r = (appState.akademik || []).find(x => String(x.siswa_id) === String(id)
            && String(x.mapel || "").trim().toLowerCase() === mapelPilih && String(x.semester || "") === smtPilih);
        if (!r) return "";
        const v = (kompPilih === "tugas" || kompPilih === "uh") ? akdDaftar(r, kompPilih)[nomorPilih - 1] : akdAngka(r[kompPilih]);
        return v === null || v === undefined ? "" : v;
    };
    list.innerHTML = siswa.map((s, i) => `
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5">
            <span class="text-xs text-slate-400 w-5 text-right shrink-0">${i + 1}</span>
            <span class="flex-1 min-w-0 text-xs font-semibold text-slate-700 truncate">${escapeHtml(s.nama)}</span>
            <input type="number" data-akdb-siswa="${escapeHtml(s.id)}" min="0" max="100" step="0.01" inputmode="decimal"
                value="${escapeHtml(String(nilaiAda(s.id)))}" oninput="updateAkdBulkCounter()" onkeydown="akdBulkEnter(event)" placeholder="-"
                aria-label="Nilai ${escapeHtml(s.nama)}"
                class="w-20 bg-white border p-1.5 rounded-lg text-xs text-center outline-none">
        </div>`).join("");
    updateAkdBulkCounter();
}

function akdBulkEnter(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const inputs = [...document.querySelectorAll("#akdb-list input[data-akdb-siswa]")];
    const next = inputs[inputs.indexOf(e.target) + 1];
    if (next) next.focus();
}

function updateAkdBulkCounter() {
    const inputs = [...document.querySelectorAll("#akdb-list input[data-akdb-siswa]")];
    const terisi = inputs.filter(i => i.value.trim() !== "").length;
    const el = document.getElementById("akdb-counter");
    if (el) el.textContent = `${terisi} terisi dari ${inputs.length}`;
}

async function saveAkademikBulk(e) {
    e.preventDefault();
    const mapel = (document.getElementById("m-akdb-mapel").value || "").trim();
    const semester = document.getElementById("m-akdb-semester").value;
    const komponen = document.getElementById("m-akdb-komponen").value;
    const nomor = Number((document.getElementById("m-akdb-nomor") || {}).value || 0);
    const kktp = Number(document.getElementById("m-akdb-kktp").value);
    if (!mapel) { showToast("Pilih mata pelajaran.", "warning"); return; }
    if (!semester || !komponen) { showToast("Pilih semester dan jenis nilai.", "warning"); return; }
    if ((komponen === "tugas" || komponen === "uh") && !(nomor >= 1 && nomor <= AKD_MAKS_DAFTAR)) { showToast("Pilih nomor " + akdLabelKomponen(komponen) + ".", "warning"); return; }
    if (!(kktp >= 0 && kktp <= 100)) { showToast("KKTP harus 0 sampai 100.", "warning"); return; }

    const items = [];
    let salah = null;
    document.querySelectorAll("#akdb-list input[data-akdb-siswa]").forEach(inp => {
        const v = inp.value.trim();
        if (v === "") return;
        const n = Number(v);
        if (!(n >= 0 && n <= 100)) { inp.classList.add("border-rose-400"); salah = salah || inp; return; }
        inp.classList.remove("border-rose-400");
        items.push({ siswa_id: inp.dataset.akdbSiswa, nilai: n });
    });
    if (salah) { showToast("Nilai harus 0 sampai 100.", "warning"); salah.focus(); return; }
    if (items.length === 0) { showToast("Belum ada nilai yang diisi.", "warning"); return; }

    showLoading(`Menyimpan ${items.length} nilai...`);
    const res = await apiCall("saveAkademikBulk", { mapel, semester, komponen, nomor, kktp, items }, false);
    hideLoading();

    if (res && res.status === "success") {
        const segar = await apiCall("getAkademik", { siswa_id: null }, false);
        if (segar && segar.data) { appState.akademik = segar.data; lastFetchTimes.akademik = Date.now(); saveAppStateToLocal(); }
        renderAkademikNilai();
        closeModal();
        const lewat = Array.isArray(res.dilewati) ? res.dilewati : [];
        if (lewat.length === 0) {
            showToast(`${res.tersimpan} nilai ${akdLabelKomponen(komponen, nomor)} ${mapel} tersimpan!`);
        } else {
            const nama = id => { const s = _akdBulkSiswa.find(x => String(x.id) === String(id)); return s ? s.nama : id; };
            Swal.fire({
                icon: 'info',
                title: `${res.tersimpan} nilai tersimpan`,
                html: `<div class="text-xs text-left">${lewat.length} dilewati:<ul class="list-disc pl-5 mt-1">` +
                    lewat.map(d => `<li>${escapeHtml(nama(d.siswa_id))}: ${escapeHtml(d.alasan)}</li>`).join("") + `</ul></div>`,
                confirmButtonColor: '#2563eb'
            });
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan nilai massal.',
            confirmButtonColor: '#2563eb'
        });
    }
}

async function deleteAkademik(id) {
    const confirm = await Swal.fire({ title: 'Hapus Nilai Mapel?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (!confirm.isConfirmed) return;
    appState.akademik = (appState.akademik || []).filter(x => String(x.id) !== String(id));
    saveAppStateToLocal();
    renderAkademikNilai();
    showToast("Nilai mapel dihapus");
    const res = await apiCall("deleteAkademik", { id }, false);
    if (res && res.status === "error") {
        showToast(res.message || "Gagal menghapus nilai mapel.", "warning");
        loadAkademikData(true);
    }
}

function renderAkademikPrestasi() {
    const container = document.getElementById("prestasi-list-container");
    if (!container) return;

    const selectEl = document.getElementById("akademik-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    const isAdminOrGuru = isStafLihat();

    if (isAdminOrGuru && filterSiswaId === "") {
        container.innerHTML = maskotKosong("Silakan pilih siswa terlebih dahulu.", 96, "akademik");
        return;
    }

    if (isKepsekUser() && !document.getElementById("prestasi-gs-filter")) {
        container.insertAdjacentHTML('beforebegin', `<div id="prestasi-gs-filter">${gsRenderFilterKepsek('prs-f', 'renderAkademikPrestasi')}</div>`);
    }

    const basePrestasi = scopeBySiswaId(appState.prestasi, item => item.siswa_id);
    const filteredPrestasi = (filterSiswaId && filterSiswaId !== "ALL")
        ? basePrestasi.filter(item => String(item.siswa_id) === String(filterSiswaId))
        : basePrestasi;

    const fk = isKepsekUser() ? gsBacaFilterKepsek('prs-f') : null;
    let groups = gsTerapkanFilter(gsGroupBySiswa(filteredPrestasi, r => r.siswa_id), fk);
    groups = gsUrutkan(groups, fk ? fk.urut : 'terbaru', g => prsSkorTertinggi(g.records));

    if (groups.length === 0) {
        container.innerHTML = maskotKosong("Belum ada data catatan prestasi untuk siswa ini.", 96, "piala");
        prsRefreshDetail();
        return;
    }

    container.innerHTML = groups.map(g => {
        const terbaru = g.records[0];
        const ringkasan = `
            <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-xs">
                    <span class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><i class="fas fa-award"></i></span>
                    <span class="font-bold text-slate-700">${g.records.length} prestasi</span>
                </div>
                ${prsRenderRincianTingkat(g.records)}
                <p class="text-xs text-slate-500">Terbaru: <span class="font-bold text-slate-700">${escapeHtml(terbaru.nama_prestasi)}</span></p>
            </div>`;
        return gsRenderCard(g, ringkasan, 'openDetailPrestasi');
    }).join("");

    prsRefreshDetail();
}

const PRS_TINGKAT = ['Sekolah', 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional'];

function prsSkorTertinggi(records) {
    return records.reduce((m, r) => Math.max(m, PRS_TINGKAT.indexOf(r.tingkat)), -1);
}

function prsRenderRincianTingkat(records) {
    const hitung = {};
    records.forEach(r => { const t = r.tingkat || 'Lainnya'; hitung[t] = (hitung[t] || 0) + 1; });
    const urut = Object.keys(hitung).sort((a, b) => PRS_TINGKAT.indexOf(b) - PRS_TINGKAT.indexOf(a));
    return `<div class="flex flex-wrap gap-1">${urut.map(t =>
        `<span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">${escapeHtml(t)} ${hitung[t]}</span>`).join('')}</div>`;
}

function openDetailPrestasi(siswaId) {
    const base = scopeBySiswaId(appState.prestasi, item => item.siswa_id)
        .filter(r => String(r.siswa_id) === String(siswaId));
    const g = gsGroupBySiswa(base, r => r.siswa_id)[0];
    if (!g) { closeModal(); return; }
    const body = g.records.map(item => {
        const isi = `
            <div class="flex justify-between items-start gap-2">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm"><i class="fas fa-award"></i></div>
                    <h4 class="font-bold text-xs text-slate-800">${escapeHtml(item.nama_prestasi)}</h4>
                </div>
                <span class="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 whitespace-nowrap">${escapeHtml(item.tingkat)}</span>
            </div>`;
        return gsRenderBarisCatatan(item, 'prestasi', isi, 'openModalPrestasi', 'deletePrestasi');
    }).join('');
    gsOpenSheet(g, { judul: 'Prestasi', kategori: 'prestasi', ringkasanHtml: prsRenderRincianTingkat(g.records), bodyHtml: body, tambahFn: 'tambahPrestasiSiswa', bulkIds: bulkIdsEditable('prestasi', g.records) });
    const box = document.getElementById("modal-content-box");
    if (box) { box.dataset.gs = 'prestasi'; box.dataset.gsSiswa = String(siswaId); }
}

function prsRefreshDetail() {
    const box = document.getElementById("modal-content-box");
    const modal = document.getElementById("modal-container");
    if (!box || !modal || modal.classList.contains("hidden") || box.dataset.gs !== 'prestasi') return;
    openDetailPrestasi(box.dataset.gsSiswa);
}

function tambahPrestasiSiswa(siswaId) {
    openModalPrestasi(null, siswaId);
}

function openModalPrestasi(id = null, preSiswaId = null) {
    const box = document.getElementById("modal-content-box");
    if (!box) return;
    box.dataset.gs = "";

    const writable = getSiswaWritable('prestasi');
    if (!id && writable.length === 0) {
        Swal.fire({ icon: 'info', title: 'Tidak Ada Siswa', text: 'Tidak ada siswa yang dapat Anda isi prestasinya.', confirmButtonColor: '#2563eb' });
        return;
    }

    const rec = id ? appState.prestasi.find(x => String(x.id) === String(id)) : null;
    const siswaOpts = sortSiswa(writable).map(s => `<option value="${s.id}" ${String(rec ? rec.siswa_id : (preSiswaId || '')) === String(s.id) ? 'selected' : ''}>${escapeHtml(s.nama)}</option>`).join("");

    box.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-slate-800">${rec ? 'Edit Prestasi Siswa' : 'Catat Prestasi Baru'}</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600" aria-label="Tutup jendela dialog"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="savePrestasiForm(event, '${id || ''}')" class="space-y-3">
            <div>
                <label for="m-prs-siswa" class="block text-xs font-bold text-slate-500 mb-1">SISWA</label>
                <select id="m-prs-siswa" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>${siswaOpts}</select>
            </div>
            <div>
                <label for="m-prs-nama" class="block text-xs font-bold text-slate-500 mb-1">NAMA PRESTASI / JUARA</label>
                <input type="text" id="m-prs-nama" value="${escapeHtml(rec?.nama_prestasi || '')}" placeholder="Contoh: Juara 1 OSN IPA" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label for="m-prs-tingkat" class="block text-xs font-bold text-slate-500 mb-1">TINGKAT</label>
                    <select id="m-prs-tingkat" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                        ${PRS_TINGKAT.map(t => `<option value="${t}" ${rec && rec.tingkat === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="m-prs-tanggal" class="block text-xs font-bold text-slate-500 mb-1">TANGGAL</label>
                    <input type="date" id="m-prs-tanggal" value="${rec ? rec.tanggal : getDateWITA()}" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none" required>
                </div>
            </div>
            <button type="submit" class="w-full bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs mt-2">Simpan Prestasi</button>
        </form>
    `;
    document.getElementById("modal-container")?.classList.remove("hidden");
}

async function savePrestasiForm(e, id) {
    e.preventDefault();
    const payload = {
        id: id || null,
        siswa_id: document.getElementById("m-prs-siswa").value,
        nama_prestasi: document.getElementById("m-prs-nama").value,
        tingkat: document.getElementById("m-prs-tingkat").value,
        tanggal: document.getElementById("m-prs-tanggal").value
    };

    showLoading("Menyimpan catatan prestasi...");
    const res = await apiCall("savePrestasi", payload, false);
    hideLoading();

    if (res && res.status === "success") {
        const newId = res.id || id || ("PRS-" + Date.now());
        const idx = appState.prestasi.findIndex(x => String(x.id) === String(newId));
        const base = idx !== -1 ? appState.prestasi[idx] : buildAuditLocal(payload.siswa_id);
        const savedRecord = { ...base, ...payload, id: newId };
        if (idx !== -1) appState.prestasi[idx] = savedRecord;
        else appState.prestasi.push(savedRecord);

        saveAppStateToLocal();
        renderAkademikPrestasi();
        closeModal();
        if (id) showToast("Catatan prestasi tersimpan!");
        else maskotRayakan("Prestasi tercatat!", "Selamat! Terus semangat berprestasi.", null, "akademik");
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            text: res?.message || 'Terjadi kesalahan saat menyimpan catatan prestasi ke database spreadsheet.',
            confirmButtonColor: '#2563eb'
        });
    }
}

async function deletePrestasi(id) {
    const confirm = await Swal.fire({ title: 'Hapus Catatan Prestasi?', text: 'Data tidak dapat dikembalikan.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (confirm.isConfirmed) {
        appState.prestasi = appState.prestasi.filter(x => String(x.id) !== String(id));
        saveAppStateToLocal();
        renderAkademikPrestasi();
        showToast("Prestasi dihapus");
        const res = await apiCall("deletePrestasi", { id }, false);
        if (res && res.status === "error") {
            showToast(res.message || "Gagal menghapus prestasi.", "warning");
            loadAkademikData(true);
        }
    }
}
function cetakPDFAkademik() {
    const selectEl = document.getElementById("akademik-siswa-filter");
    const filterSiswaId = selectEl ? selectEl.value : "";
    if (!filterSiswaId || filterSiswaId === "ALL" || filterSiswaId === "") {
        maskotAlert('Pilih Siswa', 'Silakan pilih satu siswa terlebih dahulu sebelum mencetak.', 'presensi');
        return;
    }

    const siswa = appState.siswa.find(s => String(s.id) === String(filterSiswaId)) || appState.user;
    const kls = siswa ? appState.kelas.find(k => String(k.id) === String(siswa.kelas_id)) : null;
    const filteredAkademik = akdTerapkanFilterSemester((appState.akademik || []).filter(item => String(item.siswa_id) === String(filterSiswaId)));
    const filteredPrestasi = (appState.prestasi || []).filter(item => String(item.siswa_id) === String(filterSiswaId));

    if (filteredAkademik.length === 0 && filteredPrestasi.length === 0) {
        maskotAlert('Data Kosong', 'Belum ada data nilai maupun prestasi untuk siswa ini.', 'presensi');
        return;
    }

    const daftarPdf = (item, jenis) => {
        const d = akdDaftar(item, jenis);
        while (d.length && d[d.length - 1] === null) d.pop();
        return d.length ? d.map(v => v === null ? "-" : akdFmt(v)).join(", ") : "-";
    };
    const nilaiRowsHtml = filteredAkademik.length > 0 ? filteredAkademik.map((item, idx) => {
        const isBelowKKTP = Number(item.nilai_akhir) < Number(item.kktp);
        const statusText = (isBelowKKTP ? 'Belum Tuntas' : 'Tuntas') + (akdSementara(item) ? ' (sementara)' : '');
        const td = (v, extra = '') => `<td style="padding: 6px 4px; text-align: center; ${extra}">${escapeHtml(String(v))}</td>`;
        return `
            <tr>
                ${td(idx + 1)}
                <td style="padding: 6px 8px; text-align: center; font-weight: bold;">${escapeHtml(item.mapel)}</td>
                ${td(item.semester || '-')}
                ${td(daftarPdf(item, "tugas"))}
                ${td(akdFmt(akdRataItem(item, "tugas")), 'font-weight: bold;')}
                ${td(daftarPdf(item, "uh"))}
                ${td(akdFmt(akdRataItem(item, "uh")), 'font-weight: bold;')}
                ${td(akdFmt(item.sts))}
                ${td(akdFmt(item.asas))}
                ${td(akdFmt(item.nilai_akhir), 'font-weight: bold;')}
                ${td(item.kktp)}
                ${td(statusText, `font-weight: bold; color: ${isBelowKKTP ? '#dc2626' : '#16a34a'};`)}
            </tr>
        `;
    }).join('') : `<tr><td colspan="12" style="padding: 10px; text-align: center; color: #64748b;">Belum ada data nilai mapel.</td></tr>`;

    const prestasiRowsHtml = filteredPrestasi.length > 0 ? filteredPrestasi.map((item, idx) => `
        <tr>
            <td style="padding: 6px 4px; text-align: center;">${idx + 1}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.tanggal)}</td>
            <td style="padding: 6px 8px; text-align: left; font-weight: bold;">${escapeHtml(item.nama_prestasi)}</td>
            <td style="padding: 6px 6px; text-align: center;">${escapeHtml(item.tingkat)}</td>
        </tr>
    `).join('') : `<tr><td colspan="4" style="padding: 10px; text-align: center; color: #64748b;">Belum ada catatan prestasi.</td></tr>`;

    const contentHtml = `
        ${pdfInfoBlock([{label: "Nama Siswa", value: siswa ? siswa.nama : "-"}, {label: "Kelas", value: kls ? kls.nama_kelas : "-"}])}

        <h4 style="font-size: 12px; margin: 0 0 6px 0; text-decoration: underline;">A. Transkrip Nilai Mapel (Nilai Tugas, Nilai UH, STS, ASAS, Nilai Rapor)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 16px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 3px; width: 24px;">No</th>
                    <th style="padding: 8px 5px; text-align: center;">Mata Pelajaran</th>
                    <th style="padding: 8px 3px; width: 46px;">Smt</th>
                    <th style="padding: 8px 5px; text-align: center;">Nilai Tugas</th>
                    <th style="padding: 8px 3px; width: 50px;">Rata-Rata Tugas</th>
                    <th style="padding: 8px 5px; text-align: center;">Nilai UH</th>
                    <th style="padding: 8px 3px; width: 50px;">Rata-Rata UH</th>
                    <th style="padding: 8px 3px; width: 36px;">STS</th>
                    <th style="padding: 8px 3px; width: 36px;">ASAS</th>
                    <th style="padding: 8px 3px; width: 46px;">Nilai Rapor</th>
                    <th style="padding: 8px 3px; width: 36px;">KKTP</th>
                    <th style="padding: 8px 3px; width: 80px;">Evaluasi</th>
                </tr>
            </thead>
            <tbody>${nilaiRowsHtml}</tbody>
        </table>

        <h4 style="font-size: 12px; margin: 0 0 6px 0; text-decoration: underline;">B. Catatan Prestasi Siswa</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;" border="1" borderColor="#94a3b8">
            <thead>
                <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
                    <th style="padding: 8px 4px; width: 30px;">No</th>
                    <th style="padding: 8px 6px; width: 90px;">Tanggal</th>
                    <th style="padding: 8px 6px; text-align: left;">Nama Prestasi</th>
                    <th style="padding: 8px 6px; width: 90px;">Tingkat</th>
                </tr>
            </thead>
            <tbody>${prestasiRowsHtml}</tbody>
        </table>
    `;

    exportFeaturePDF(
        "TRANSKRIP NILAI & CATATAN PRESTASI SISWA",
        contentHtml,
        `Transkrip_Akademik_${siswa ? siswa.nama.replace(/\s+/g, '_') : filterSiswaId}_${getDateWITA()}.pdf`,
        { orientation: "landscape" }
    );
}