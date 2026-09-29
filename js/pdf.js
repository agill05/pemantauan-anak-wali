/* ==========================================================
   PDF RESMI (KOP SURAT) - jsPDF + jspdf-autotable
   Dipakai semua laporan lewat exportFeaturePDF() / printFeaturePDF().
   API lama tidak berubah: (title, contentHtml, filename, options).
   ========================================================== */

const PDF_FONT = "times";
const PDF_MARGIN = 15;
const PDF_PX_TO_MM = 0.3;
const PDF_LOGOS = {
    left: ["assets/img/logo-tutwuri.png", "https://zonalogo.com/assets/tut-wuri-handayani.webp"],
    right: ["assets/img/logo-sekolah.png", "https://www.e-ujian.com/smpntalagajaya/logo"]
};
const _pdfImageCache = {};

function pdfLoadImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        const timer = setTimeout(() => resolve(null), 6000);
        if (/^https?:/i.test(url)) img.crossOrigin = "anonymous";
        img.onload = () => {
            clearTimeout(timer);
            try {
                const c = document.createElement("canvas");
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                c.getContext("2d").drawImage(img, 0, 0);
                resolve({ data: c.toDataURL("image/png"), w: c.width, h: c.height });
            } catch (e) { resolve(null); }
        };
        img.onerror = () => { clearTimeout(timer); resolve(null); };
        img.src = url;
    });
}

async function pdfLoadFirstImage(urls) {
    const key = urls[0];
    if (key in _pdfImageCache) return _pdfImageCache[key];
    let result = null;
    for (const u of urls) {
        result = await pdfLoadImage(u);
        if (result && result.w > 0) break;
        result = null;
    }
    _pdfImageCache[key] = result;
    return result;
}

function pdfParseColor(v) {
    if (!v) return null;
    let m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return [+m[1], +m[2], +m[3]];
    m = v.match(/^#([0-9a-f]{6})$/i);
    if (m) {
        const n = parseInt(m[1], 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    return null;
}

function pdfSegments(node) {
    const out = [];
    (function walk(n, bold) {
        n.childNodes.forEach(c => {
            if (c.nodeType === 3) {
                const t = c.textContent.replace(/[\s\u00A0]+/g, " ");
                if (t) out.push({ text: t, bold });
            } else if (c.nodeType === 1) {
                if (c.tagName === "BR") { out.push({ text: "\n", bold }); return; }
                const isBold = bold || c.tagName === "B" || c.tagName === "STRONG" ||
                    c.style.fontWeight === "bold" || parseInt(c.style.fontWeight) >= 600;
                walk(c, isBold);
            }
        });
    })(node, false);
    return out;
}

/* Gambar teks campuran tebal/normal dengan word-wrap. Return y setelah baris terakhir. */
function pdfDrawRich(doc, segs, x, y, maxW, fontSize, lineH, align) {
    doc.setFontSize(fontSize);
    const lines = [[]];
    let cur = 0;
    segs.forEach(seg => {
        seg.text.split(/(\s+)/).forEach(part => {
            if (part === "") return;
            const line = lines[lines.length - 1];
            if (part === "\n") { lines.push([]); cur = 0; return; }
            const isSpace = /^\s+$/.test(part);
            const t = isSpace ? " " : part;
            doc.setFont(PDF_FONT, seg.bold ? "bold" : "normal");
            const w = doc.getTextWidth(t);
            if (isSpace && line.length === 0) return;
            if (!isSpace && cur + w > maxW && line.length > 0) {
                while (line.length && line[line.length - 1].space) cur -= line.pop().w;
                lines.push([]);
                cur = 0;
            }
            lines[lines.length - 1].push({ t, w, bold: seg.bold, space: isSpace });
            cur += w;
        });
    });
    lines.forEach(line => {
        while (line.length && line[line.length - 1].space) line.pop();
        const total = line.reduce((s, tk) => s + tk.w, 0);
        let cx = align === "center" ? x - total / 2 : x;
        line.forEach(tk => {
            doc.setFont(PDF_FONT, tk.bold ? "bold" : "normal");
            doc.text(tk.t, cx, y);
            cx += tk.w;
        });
        y += lineH;
    });
    return y;
}

function pdfDrawLogo(doc, img, boxX, boxY, box) {
    if (!img) return;
    const scale = Math.min(box / img.w, box / img.h);
    const w = img.w * scale, h = img.h * scale;
    doc.addImage(img.data, "PNG", boxX + (box - w) / 2, boxY + (box - h) / 2, w, h);
}

function pdfDrawKop(doc, pageW, y0, logoL, logoR) {
    const box = 20;
    const cx = pageW / 2;
    pdfDrawLogo(doc, logoL, PDF_MARGIN, y0, box);
    pdfDrawLogo(doc, logoR, pageW - PDF_MARGIN - box, y0, box);

    doc.setTextColor(15, 23, 42);
    doc.setFont(PDF_FONT, "normal"); doc.setFontSize(11);
    doc.text("PEMERINTAH KABUPATEN GORONTALO", cx, y0 + 4.5, { align: "center" });
    doc.setFont(PDF_FONT, "bold"); doc.setFontSize(13);
    doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN", cx, y0 + 10, { align: "center" });
    doc.setFontSize(15);
    doc.text("SMP NEGERI 1 TALAGA JAYA", cx, y0 + 16, { align: "center" });
    doc.setFont(PDF_FONT, "italic"); doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text("Buhu, Kec. Talaga Jaya, Kab. Gorontalo, Gorontalo 96181", cx, y0 + 21, { align: "center" });

    const ly = y0 + box + 3;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.9);
    doc.line(PDF_MARGIN, ly, pageW - PDF_MARGIN, ly);
    doc.setLineWidth(0.25);
    doc.line(PDF_MARGIN, ly + 1.3, pageW - PDF_MARGIN, ly + 1.3);
    doc.setTextColor(15, 23, 42);
    return ly + 8;
}

function pdfDrawTitle(doc, pageW, y, title, dateStr) {
    const cx = pageW / 2;
    doc.setFont(PDF_FONT, "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.splitTextToSize(String(title).toUpperCase(), pageW - 2 * PDF_MARGIN).forEach(line => {
        doc.text(line, cx, y, { align: "center" });
        const w = doc.getTextWidth(line);
        doc.setLineWidth(0.3);
        doc.line(cx - w / 2, y + 1.2, cx + w / 2, y + 1.2);
        y += 6;
    });
    const nama = appState.user ? appState.user.nama : "User";
    const role = appState.user && appState.user.role ? appState.user.role.toUpperCase() : "";
    doc.setTextColor(71, 85, 105);
    y = pdfDrawRich(doc, [
        { text: `Tanggal Cetak: ${dateStr} | Dicetak Oleh: `, bold: false },
        { text: nama, bold: true },
        { text: role ? ` (${role})` : "", bold: false }
    ], cx, y + 0.5, pageW - 2 * PDF_MARGIN, 10, 5, "center");
    doc.setTextColor(15, 23, 42);
    return y + 4;
}

function pdfCellObj(cell, isHead) {
    const st = cell.style;
    const rowSt = cell.parentElement ? cell.parentElement.style : {};
    const o = { content: cell.textContent.replace(/[\s\u00A0]+/g, " ").trim(), styles: {} };
    const cs = parseInt(cell.getAttribute("colspan") || "1", 10);
    if (cs > 1) o.colSpan = cs;
    const al = st.textAlign || rowSt.textAlign;
    if (al) o.styles.halign = al;
    if (!isHead) {
        const fw = st.fontWeight || rowSt.fontWeight;
        if (fw === "bold" || parseInt(fw) >= 600) o.styles.fontStyle = "bold";
        const col = pdfParseColor(st.color);
        if (col) o.styles.textColor = col;
    }
    return o;
}

function pdfDrawTable(doc, tableEl, y, usableW) {
    const headRows = [...tableEl.querySelectorAll("thead tr")];
    const bodyRows = [...tableEl.querySelectorAll("tbody tr")];
    const head = headRows.map(tr => [...tr.children].map(c => {
        const o = pdfCellObj(c, true);
        if (!o.styles.halign) o.styles.halign = "center";
        return o;
    }));
    const body = bodyRows.map(tr => [...tr.children].map(c => pdfCellObj(c, false)));

    const refRow = headRows.length ? [...headRows[headRows.length - 1].children] : [...(bodyRows[0] ? bodyRows[0].children : [])];
    const widths = refRow.map(c => {
        const w = c.style.width;
        return w && /px$/.test(w) ? parseFloat(w) * PDF_PX_TO_MM : null;
    });
    const autoCount = widths.filter(w => w === null).length;
    let fixed = widths.reduce((s, w) => s + (w || 0), 0);
    let factor = 1;
    if (autoCount > 0) {
        const maxFixed = usableW - 45 * autoCount;
        if (fixed > maxFixed && fixed > 0) factor = Math.max(maxFixed, 10) / fixed;
    } else if (fixed > 0) {
        factor = usableW / fixed;
    }
    const columnStyles = {};
    widths.forEach((w, i) => {
        columnStyles[i] = w === null ? { cellWidth: "auto" } : { cellWidth: w * factor };
    });

    doc.autoTable({
        startY: y,
        head,
        body,
        theme: "grid",
        tableWidth: usableW,
        margin: { top: PDF_MARGIN, left: PDF_MARGIN, right: PDF_MARGIN, bottom: 18 },
        showHead: "everyPage",
        rowPageBreak: "avoid",
        columnStyles,
        styles: {
            font: PDF_FONT, fontSize: 10, cellPadding: 2,
            lineColor: [148, 163, 184], lineWidth: 0.2,
            textColor: [15, 23, 42], valign: "middle", overflow: "linebreak"
        },
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", halign: "center" }
    });
    return doc.lastAutoTable.finalY + 5;
}

function pdfDrawSignatureBlock(doc, cx, y, lines, name, nip) {
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(11);
    lines.forEach((ln, i) => doc.text(ln, cx, y + i * 5, { align: "center" }));
    let ny = y + lines.length * 5 + 20;
    doc.setFont(PDF_FONT, "bold");
    doc.splitTextToSize(name, 66).forEach(line => {
        doc.text(line, cx, ny, { align: "center" });
        const w = doc.getTextWidth(line);
        doc.setLineWidth(0.25);
        doc.line(cx - w / 2, ny + 1, cx + w / 2, ny + 1);
        ny += 5;
    });
    doc.setFont(PDF_FONT, "normal");
    doc.setFontSize(10);
    doc.text(`NIP.${nip}`, cx, ny, { align: "center" });
}

function pdfDrawSignature(doc, pageW, pageH, y, dateStr, labelKanan) {
    if (y + 50 > pageH - 15) {
        doc.addPage();
        y = PDF_MARGIN + 5;
    }
    y += 6;
    doc.setTextColor(15, 23, 42);
    const kepsek = (appState.pengaturan && appState.pengaturan.nama_kepsek) || "( ............................................ )";
    const nipKepsek = (appState.pengaturan && appState.pengaturan.nip_kepsek) || "........................................";
    const guru = appState.user ? appState.user.nama : "Guru Pemantau";
    pdfDrawSignatureBlock(doc, PDF_MARGIN + 33, y,
        ["Mengetahui,", "Kepala SMPN 1 Talaga Jaya"], kepsek, nipKepsek);
    pdfDrawSignatureBlock(doc, pageW - PDF_MARGIN - 33, y,
        [`Talaga Jaya, ${dateStr}`, labelKanan], guru, getGuruNip());
}

async function buildOfficialPdf(title, contentHtml, options = {}) {
    const { jsPDF } = window.jspdf;
    const orientation = options.orientation || "portrait";
    const labelKanan = options.labelKanan || "Guru Pemantau / Wali Kelas";
    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const usableW = pageW - 2 * PDF_MARGIN;
    const bottomLimit = pageH - 20;

    const [logoL, logoR] = await Promise.all([
        pdfLoadFirstImage(PDF_LOGOS.left),
        pdfLoadFirstImage(PDF_LOGOS.right)
    ]);

    let y = pdfDrawKop(doc, pageW, 12, logoL, logoR);
    y = pdfDrawTitle(doc, pageW, y, title, dateStr);

    const holder = document.createElement("div");
    holder.innerHTML = contentHtml;
    [...holder.children].forEach(el => {
        const tag = el.tagName;
        if (tag === "TABLE") {
            y = pdfDrawTable(doc, el, y, usableW);
        } else if (/^H[1-6]$/.test(tag)) {
            if (y + 12 > bottomLimit) { doc.addPage(); y = PDF_MARGIN + 5; }
            doc.setFont(PDF_FONT, "bold");
            doc.setFontSize(11);
            const txt = el.textContent.replace(/\s+/g, " ").trim();
            doc.text(txt, PDF_MARGIN, y);
            doc.setLineWidth(0.2);
            doc.line(PDF_MARGIN, y + 1, PDF_MARGIN + doc.getTextWidth(txt), y + 1);
            y += 6;
        } else {
            const segs = pdfSegments(el);
            if (!segs.length) return;
            if (y + 10 > bottomLimit) { doc.addPage(); y = PDF_MARGIN + 5; }
            y = pdfDrawRich(doc, segs, PDF_MARGIN, y, usableW, 11, 5, "left") + 2;
        }
    });

    pdfDrawSignature(doc, pageW, pageH, y, dateStr, labelKanan);

    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont(PDF_FONT, "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Halaman ${i} dari ${total}`, pageW / 2, pageH - 8, { align: "center" });
    }
    return doc;
}

function pdfLibReady() {
    if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.API.autoTable === "function") return true;
    Swal.fire({ icon: "error", title: "Gagal", text: "Komponen eksport PDF gagal dimuat. Coba muat ulang halaman.", confirmButtonColor: "#2563eb" });
    return false;
}

/**
 * Ekspor PDF ber-kop surat.
 * @param {string} title - judul dokumen
 * @param {string} contentHtml - HTML isi: <p>, <h4>, <table> (thead/tbody). Tanpa kop dan tanda tangan.
 * @param {string} filename - nama file
 * @param {object} [options] - { orientation: 'portrait'|'landscape', labelKanan: string }
 */
async function exportFeaturePDF(title, contentHtml, filename, options = {}) {
    if (!pdfLibReady()) return;
    showLoading("Membuat file PDF...");
    try {
        const doc = await buildOfficialPdf(title, contentHtml, options);
        doc.save(filename);
        hideLoading();
        showToast("File PDF berhasil diunduh!");
    } catch (err) {
        console.error("Gagal membuat PDF:", err);
        hideLoading();
        Swal.fire({ icon: "error", title: "Gagal", text: "Gagal membuat file PDF.", confirmButtonColor: "#2563eb" });
    }
}

/* Cetak lewat dialog print browser, dengan layout PDF yang sama. */
async function printFeaturePDF(title, contentHtml, options = {}) {
    if (!pdfLibReady()) return;
    showLoading("Menyiapkan cetak...");
    try {
        const doc = await buildOfficialPdf(title, contentHtml, options);
        hideLoading();
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
    } catch (err) {
        console.error("Gagal menyiapkan cetak:", err);
        hideLoading();
        Swal.fire({ icon: "error", title: "Gagal", text: "Gagal menyiapkan dokumen cetak.", confirmButtonColor: "#2563eb" });
    }
}
