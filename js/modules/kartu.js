const KARTU_W = 85.6;
const KARTU_H = 54;
const KARTU_GAP = 4;
const KARTU_COLS = 2;
const KARTU_ROWS = 4;
const KARTU_PER_HALAMAN = KARTU_COLS * KARTU_ROWS;
const KARTU_MAX_PILIH = 400;

const _kartuState = { kelasId: "", sel: new Set() };

function _kartuBolehAkses() {
    const role = String((appState.user && appState.user.role) || "").toLowerCase();
    if (role === "admin") return true;
    if (role === "guru" && isWaliUser()) return true;
    Swal.fire({
        icon: "info",
        title: "Tidak Tersedia",
        text: role === "guru" ? "Cetak kartu akun hanya untuk wali kelas." : "Fitur ini tidak tersedia untuk peran Anda.",
        confirmButtonColor: "#2563eb"
    });
    return false;
}

function _kartuDaftarSiswa() {
    let list = scopeSiswaForUser(appState.siswa || []);
    if (isGuruUser()) {
        const kw = String(getKelasWaliId());
        list = list.filter(s => String(s.kelas_id) === kw);
    }
    return sortSiswa(list);
}

function _kartuDaftarTampil() {
    const semua = _kartuDaftarSiswa();
    if (isGuruUser() || !_kartuState.kelasId) return semua;
    return semua.filter(s => String(s.kelas_id) === String(_kartuState.kelasId));
}

function _kartuNamaKelas(kelasId) {
    const k = (appState.kelas || []).find(x => String(x.id) === String(kelasId));
    return k ? k.nama_kelas : "";
}

function openModalKartu(preId = null) {
    if (blokirSiswaPdf()) return;
    if (!_kartuBolehAkses()) return;
    const box = document.getElementById("modal-content-box");
    if (!box) return;

    if (!appState.siswa || appState.siswa.length === 0) {
        showToast("Data siswa belum dimuat. Coba lagi sebentar.", "warning");
        return;
    }

    const semua = _kartuDaftarSiswa();
    const pre = preId ? semua.find(s => String(s.id) === String(preId)) : null;

    if (isGuruUser()) {
        _kartuState.kelasId = String(getKelasWaliId());
    } else if (pre) {
        _kartuState.kelasId = String(pre.kelas_id || "");
    } else {
        const kelasPertama = (getVisibleKelas() || [])[0];
        _kartuState.kelasId = kelasPertama ? String(kelasPertama.id) : "";
    }

    _kartuState.sel = new Set();
    if (pre) _kartuState.sel.add(String(pre.id));
    else _kartuDaftarTampil().forEach(s => _kartuState.sel.add(String(s.id)));

    const filterKelas = isGuruUser() ? `
        <p class="text-xs text-slate-500">Kelas: <b>${escapeHtml(_kartuNamaKelas(_kartuState.kelasId) || "-")}</b></p>
    ` : `
        <div>
            <label for="kartu-kelas" class="block text-xs font-bold text-slate-500 mb-1">KELAS</label>
            <select id="kartu-kelas" onchange="kartuPilihKelas(this.value)" class="w-full bg-slate-50 border p-2.5 rounded-xl text-xs outline-none">
                ${(getVisibleKelas() || []).map(k => `<option value="${escapeHtml(k.id)}" ${String(k.id) === _kartuState.kelasId ? "selected" : ""}>${escapeHtml(k.nama_kelas)}</option>`).join("")}
            </select>
        </div>
    `;

    box.innerHTML = `
        <div class="flex justify-between items-center mb-3">
            <h3 class="text-sm font-bold text-slate-800"><i class="fas fa-id-card text-primary mr-1.5"></i>Cetak Kartu Akun Siswa</h3>
            <button type="button" onclick="closeModal()" aria-label="Tutup" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="space-y-3">
            ${filterKelas}
            <p class="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
                <i class="fas fa-triangle-exclamation mt-0.5"></i>
                <span>Password hanya tercetak untuk siswa yang <b>belum mengganti</b> password awalnya. Siswa lain akan tertulis "sudah diganti". Simpan dan bagikan kartu dengan hati-hati.</span>
            </p>
            <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input type="checkbox" id="kartu-semua" onchange="kartuPilihSemua(this.checked)"> Pilih semua
                </label>
                <span id="kartu-jumlah" class="text-xs text-slate-500"></span>
            </div>
            <div id="kartu-daftar" class="max-h-64 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100"></div>
            <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="kartuProses('download')" class="bg-primary text-white font-bold py-2.5 rounded-xl text-xs"><i class="fas fa-file-pdf mr-1"></i> Unduh PDF</button>
                <button type="button" onclick="kartuProses('print')" class="bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs"><i class="fas fa-print mr-1"></i> Cetak</button>
            </div>
        </div>
    `;
    _kartuRenderDaftar();
    document.getElementById("modal-container")?.classList.remove("hidden");
}

function _kartuRenderDaftar() {
    const wadah = document.getElementById("kartu-daftar");
    if (!wadah) return;
    const tampil = _kartuDaftarTampil();
    if (tampil.length === 0) {
        wadah.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Tidak ada siswa di kelas ini.</p>`;
    } else {
        wadah.innerHTML = tampil.map(s => {
            const id = String(s.id);
            const noAbsen = s.no_absen ? `${escapeHtml(String(s.no_absen))}. ` : "";
            return `
                <label class="flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" ${_kartuState.sel.has(id) ? "checked" : ""} onchange="kartuToggle('${escapeHtml(id)}', this.checked)">
                    <span class="text-slate-700">${noAbsen}${escapeHtml(s.nama || "")}</span>
                </label>`;
        }).join("");
    }
    _kartuSinkronCentang();
}

function _kartuSinkronCentang() {
    const tampil = _kartuDaftarTampil();
    const terpilih = tampil.filter(s => _kartuState.sel.has(String(s.id))).length;
    const semua = document.getElementById("kartu-semua");
    if (semua) {
        semua.checked = tampil.length > 0 && terpilih === tampil.length;
        semua.indeterminate = terpilih > 0 && terpilih < tampil.length;
    }
    const jumlah = document.getElementById("kartu-jumlah");
    if (jumlah) jumlah.textContent = `${terpilih} dari ${tampil.length} dipilih`;
}

function kartuPilihKelas(kelasId) {
    _kartuState.kelasId = String(kelasId || "");
    _kartuState.sel = new Set(_kartuDaftarTampil().map(s => String(s.id)));
    _kartuRenderDaftar();
}

function kartuToggle(id, checked) {
    if (checked) _kartuState.sel.add(String(id));
    else _kartuState.sel.delete(String(id));
    _kartuSinkronCentang();
}

function kartuPilihSemua(checked) {
    _kartuDaftarTampil().forEach(s => {
        if (checked) _kartuState.sel.add(String(s.id));
        else _kartuState.sel.delete(String(s.id));
    });
    _kartuRenderDaftar();
}

async function kartuProses(mode) {
    if (blokirSiswaPdf()) return;
    if (!pdfLibReady()) return;

    const terpilih = _kartuDaftarTampil().filter(s => _kartuState.sel.has(String(s.id)));
    if (terpilih.length === 0) {
        showToast("Pilih minimal satu siswa.", "warning");
        return;
    }
    if (terpilih.length > KARTU_MAX_PILIH) {
        Swal.fire({ icon: "warning", title: "Terlalu Banyak", text: `Maksimal ${KARTU_MAX_PILIH} kartu sekali cetak.`, confirmButtonColor: "#2563eb" });
        return;
    }

    showLoading("Menyiapkan kartu...");
    try {
        const res = await apiCall("getKartuAkun", { siswa_ids: terpilih.map(s => String(s.id)) }, false);
        if (!res || res.status !== "success") {
            hideLoading();
            Swal.fire({ icon: "error", title: "Gagal", text: (res && res.message) || "Gagal mengambil data kartu.", confirmButtonColor: "#2563eb" });
            return;
        }

        const dapat = terpilih.filter(s => Object.prototype.hasOwnProperty.call(res.data.pakai_default, String(s.id)));
        if (dapat.length === 0) {
            hideLoading();
            Swal.fire({ icon: "warning", title: "Tidak Ada Kartu", text: "Siswa terpilih tidak berada dalam akses Anda.", confirmButtonColor: "#2563eb" });
            return;
        }

        const doc = await buildKartuPdf(dapat, res.data);
        hideLoading();
        closeModal();

        const label = isGuruUser() || _kartuState.kelasId
            ? _kartuNamaKelas(_kartuState.kelasId).replace(/[^A-Za-z0-9]+/g, "_")
            : "Terpilih";
        if (mode === "print") _kartuCetak(doc);
        else {
            doc.save(`Kartu_Akun_Siswa_${label || "Terpilih"}_${getDateWITA()}.pdf`);
            showToast("Kartu akun berhasil diunduh!");
        }
    } catch (err) {
        console.error("Gagal membuat kartu:", err);
        hideLoading();
        Swal.fire({ icon: "error", title: "Gagal", text: "Gagal membuat kartu akun.", confirmButtonColor: "#2563eb" });
    }
}

function _kartuCetak(doc) {
    const url = URL.createObjectURL(doc.output("blob"));
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    frame.onload = () => {
        try {
            frame.contentWindow.focus();
            frame.contentWindow.print();
        } catch (e) {
            window.open(url, "_blank");
        }
    };
    frame.src = url;
    document.body.appendChild(frame);
    setTimeout(() => { frame.remove(); URL.revokeObjectURL(url); }, 120000);
}

function _kartuLoginUrl() {
    return location.href.split(/[?#]/)[0].replace(/index\.html$/i, "");
}

function _kartuBuatQr(teks) {
    if (typeof qrcode !== "function") return null;
    try {
        const q = qrcode(0, "M");
        q.addData(teks);
        q.make();
        const n = q.getModuleCount();
        const m = [];
        for (let r = 0; r < n; r++) {
            const baris = [];
            for (let c = 0; c < n; c++) baris.push(q.isDark(r, c));
            m.push(baris);
        }
        return { n, m };
    } catch (e) {
        return null;
    }
}

function _kartuGambarQr(doc, qr, x, y, size) {
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, size, size, "F");
    const quiet = 1.5;
    const cell = (size - 2 * quiet) / qr.n;
    doc.setFillColor(15, 23, 42);
    for (let r = 0; r < qr.n; r++) {
        for (let c = 0; c < qr.n; c++) {
            if (qr.m[r][c]) doc.rect(x + quiet + c * cell, y + quiet + r * cell, cell + 0.02, cell + 0.02, "F");
        }
    }
}

async function _kartuMuatFoto(list) {
    const hasil = {};
    const antrean = list.filter(s => s.foto && String(s.foto).trim() !== "");
    const UKURAN_BATCH = 6;
    for (let i = 0; i < antrean.length; i += UKURAN_BATCH) {
        const batch = antrean.slice(i, i + UKURAN_BATCH);
        const imgs = await Promise.all(batch.map(s => pdfLoadImage(String(s.foto))));
        batch.forEach((s, j) => { if (imgs[j] && imgs[j].w > 0) hasil[String(s.id)] = imgs[j]; });
    }
    return hasil;
}

async function buildKartuPdf(list, info) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const logo = await pdfLoadFirstImage(PDF_LOGOS.right);
    const fotos = await _kartuMuatFoto(list);
    const qr = _kartuBuatQr(_kartuLoginUrl());

    const gridW = KARTU_COLS * KARTU_W + (KARTU_COLS - 1) * KARTU_GAP;
    const gridH = KARTU_ROWS * KARTU_H + (KARTU_ROWS - 1) * KARTU_GAP;
    const x0 = (pageW - gridW) / 2;
    const y0 = (pageH - gridH) / 2;

    list.forEach((s, i) => {
        if (i > 0 && i % KARTU_PER_HALAMAN === 0) doc.addPage();
        const k = i % KARTU_PER_HALAMAN;
        const col = k % KARTU_COLS;
        const row = Math.floor(k / KARTU_COLS);
        _kartuGambar(doc, x0 + col * (KARTU_W + KARTU_GAP), y0 + row * (KARTU_H + KARTU_GAP), s, {
            logo,
            foto: fotos[String(s.id)] || null,
            qr,
            pakaiDefault: info.pakai_default[String(s.id)] === true,
            passwordDefault: info.password_default || ""
        });
    });
    return doc;
}

function _kartuGambar(doc, x, y, s, ctx) {
    const W = KARTU_W, H = KARTU_H;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, W, H, 2, 2, "F");

    doc.setFillColor(30, 64, 175);
    doc.roundedRect(x, y, W, 11, 2, 2, "F");
    doc.rect(x, y + 6, W, 5, "F");

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + 1.6, y + 1.3, 8.4, 8.4, 1.2, 1.2, "F");
    pdfDrawLogo(doc, ctx.logo, x + 1.8, y + 1.5, 8);

    doc.setTextColor(255, 255, 255);
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(8.5);
    doc.text("KARTU AKUN SISWA", x + 12, y + 5.2);
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(6);
    doc.text("SMP NEGERI 1 TALAGA JAYA", x + 12, y + 8.6);

    const px = x + 3, py = y + 14, pw = 17, ph = 22;
    doc.setFillColor(226, 232, 240);
    doc.rect(px, py, pw, ph, "F");
    if (ctx.foto) {
        const sk = Math.min(pw / ctx.foto.w, ph / ctx.foto.h);
        const iw = ctx.foto.w * sk, ih = ctx.foto.h * sk;
        doc.addImage(ctx.foto.data, "JPEG", px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih);
    } else {
        const ini = String(s.nama || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
        doc.setTextColor(100, 116, 139);
        doc.setFont(PDF_FONT, "bold");
        doc.setFontSize(15);
        doc.text(ini, px + pw / 2, py + ph / 2 + 2, { align: "center" });
    }
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.rect(px, py, pw, ph, "S");

    const tx = x + 23;
    const tw = W - 23 - 3;
    doc.setTextColor(15, 23, 42);
    doc.setFont(PDF_FONT, "bold");
    let ukuran = 10;
    doc.setFontSize(ukuran);
    let baris = doc.splitTextToSize(String(s.nama || "-"), tw);
    if (baris.length > 2) {
        ukuran = 8;
        doc.setFontSize(ukuran);
        baris = doc.splitTextToSize(String(s.nama || "-"), tw);
    }
    if (baris.length > 2) baris = [baris[0], pdfFitOneLine(doc, baris.slice(1).join(" "), tw, "bold", ukuran, 6)];
    let ty = py + 3.8;
    baris.forEach(t => { doc.setFont(PDF_FONT, "bold"); doc.setFontSize(ukuran); doc.text(t, tx, ty); ty += ukuran * 0.45; });

    const kelas = _kartuNamaKelas(s.kelas_id) || "-";
    ty += 1.5;
    doc.setFontSize(7.5);
    [["NISN", s.nisn || "-"], ["Kelas", kelas]].forEach(([lbl, val]) => {
        doc.setFont(PDF_FONT, "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(lbl, tx, ty);
        doc.text(":", tx + 11, ty);
        doc.setFont(PDF_FONT, "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(String(val), tx + 13, ty);
        ty += 4;
    });

    const bx = x + 3, by = y + 37, bw = W - 6 - 14 - 2, bh = 12.5;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(bx, by, bw, bh, 1, 1, "F");

    const nilaiMaks = bw - 18;
    const tulisKredensial = (lbl, val, baseY, miring) => {
        doc.setFont(PDF_FONT, "normal");
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(lbl, bx + 1.5, baseY);
        doc.text(":", bx + 13, baseY);
        doc.setTextColor(15, 23, 42);
        if (miring) {
            doc.setFont(PDF_FONT, "italic");
            doc.setFontSize(7);
            doc.text(val, bx + 15, baseY);
            return;
        }
        let uk = 8.5;
        doc.setFont("courier", "bold");
        doc.setFontSize(uk);
        while (doc.getTextWidth(val) > nilaiMaks && uk > 5) { uk -= 0.25; doc.setFontSize(uk); }
        doc.text(val, bx + 15, baseY);
    };
    tulisKredensial("Username", String(s.username || "-"), by + 4.8, false);
    if (ctx.pakaiDefault && ctx.passwordDefault) tulisKredensial("Password", ctx.passwordDefault, by + 10.2, false);
    else tulisKredensial("Password", "sudah diganti", by + 10.2, true);

    if (ctx.qr) {
        const qs = 14;
        _kartuGambarQr(doc, ctx.qr, x + W - 3 - qs, y + 36.5, qs);
        doc.setFont(PDF_FONT, "normal");
        doc.setFontSize(4.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Scan untuk login", x + W - 3 - qs / 2, y + 52.4, { align: "center" });
    }

    doc.setFont(PDF_FONT, "italic");
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text(
        ctx.pakaiDefault ? "Rahasiakan kartu ini. Wajib ganti password saat login pertama." : "Lupa password? Hubungi wali kelas.",
        x + 3, y + 52.4
    );

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, W, H, 2, 2, "S");
}