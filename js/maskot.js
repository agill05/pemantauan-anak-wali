/* Maskot burung hantu (set pose baru): SVG + CSS, tanpa library.
 * maskot(pose, ukuran)                      -> string SVG, aman dipakai di template innerHTML.
 * maskotKosong(teks, ukuran, pose)          -> blok .empty-state berisi maskot + teks.
 * maskotRayakan(judul, teks, kunci, pose)   -> popup perayaan, menutup sendiri.
 * maskotAlert(judul, teks, pose)            -> dialog dengan maskot dan tombol OK.
 * <span data-maskot="96" data-maskot-pose="kebiasaan"></span> -> otomatis diisi saat halaman dimuat.
 * Pose: kebiasaan (7 Kebiasaan Hebat: tangan terangkat, tujuh bintang).
 */
function maskotAman(t) {
    if (typeof escapeHtml === "function") return escapeHtml(String(t == null ? "" : t));
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

/* Pose "kebiasaan": sayap kiri terangkat, tujuh bintang melengkung. Untuk 7 Kebiasaan Hebat. */
function maskotKebiasaan(size) {
    var s = size || 120;
    return `<svg class="mk mk-keb" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="214" cy="372" rx="94" ry="8" fill="#000" opacity=".12"/><g class="mk-keb-stars"><g transform="translate(42 106)"><polygon class="mk-keb-star" style="animation-delay:0.00s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(66 77)"><polygon class="mk-keb-star" style="animation-delay:0.28s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(98 55)"><polygon class="mk-keb-star" style="animation-delay:0.56s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(134 42)"><polygon class="mk-keb-star" style="animation-delay:0.84s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(170 38)"><polygon class="mk-keb-star" style="animation-delay:1.12s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(206 42)"><polygon class="mk-keb-star" style="animation-delay:1.40s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(240 57)"><polygon class="mk-keb-star" style="animation-delay:1.68s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g></g><g class="mk-hop"><g class="mk-bob"><path class="mk-keb-tail" d="M266 314C286 316 304 324 314 336C312 346 300 350 290 346C284 350 274 350 268 346Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M158 334L170 348Q148 350 136 362Q128 372 140 374L170 374Q184 366 178 354L184 340Z"/><path d="M252 338L242 350Q262 352 272 362Q278 372 266 374L242 372Q232 364 238 354L238 342Z"/></g><ellipse cx="216" cy="288" rx="74" ry="60" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="204" cy="290" rx="48" ry="50" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M176 268q9 11 18 0"/><path d="M208 270q9 11 18 0"/><path d="M190 300q9 11 18 0"/><path d="M218 302q9 11 18 0"/></g><g class="mk-head"><path class="mk-tuft-l" d="M120 110C118 92 124 74 140 60C158 72 176 82 196 92Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M196 94Q204 74 224 70Q240 72 246 82Q256 80 258 90Q232 92 224 100Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M270 104L332 84Q338 100 330 112L342 126L312 142Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="6"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="172" cy="164" r="21" fill="#5A2E1B"/><circle cx="173" cy="165" r="13" fill="#2B130B"/><circle cx="179" cy="154" r="5.5" fill="#fff"/><path class="mk-keb-glint" d="M167 171Q168 166 173 165Q168 164 167 159Q166 164 161 165Q166 166 167 171Z" fill="#fff"/></g><g class="mk-iris"><circle cx="264" cy="186" r="19" fill="#5A2E1B"/><circle cx="265" cy="187" r="12.5" fill="#2B130B"/><circle cx="270" cy="177" r="5" fill="#fff"/><path class="mk-keb-glint" d="M260 193Q261 188 266 187Q261 186 260 181Q259 186 254 187Q259 188 260 193Z" fill="#fff" style="animation-delay:.4s"/></g></g><path class="mk-brow" d="M168 122L192 132" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M242 144Q256 138 270 136" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M191 229L163 215Q159 233 167 249Z"/><path d="M211 229L239 223Q241 241 229 251Z"/><rect x="189" y="221" width="24" height="18" rx="5"/></g><g class="mk-keb-arm"><path d="M254 244C280 246 304 264 314 290C320 304 322 316 316 322C312 330 302 330 298 322C296 332 286 336 280 328C276 336 264 334 262 324Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M280 328C276 336 264 334 262 324L268 300Z" fill="#9A5128"/><g class="mk-keb-fist"><ellipse cx="274" cy="268" rx="23" ry="26" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M262 252Q273 256 275 267"/><path d="M256 270Q267 270 273 280"/></g></g></g><g class="mk-keb-wing"><path d="M84 104C72 100 60 108 58 120C48 126 42 140 46 152C38 164 38 180 44 190C40 204 46 218 56 226C58 244 72 258 88 266C98 280 112 292 128 296C142 300 152 298 156 292L158 240C148 232 140 220 132 204C122 182 110 152 100 128C96 114 92 106 84 104Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M44 190C40 204 46 218 56 226C58 244 72 258 88 266C98 280 112 292 128 296C142 300 152 298 156 292L154 270C118 262 74 238 44 190Z" fill="#9A5128"/><path d="M74 110C64 116 58 128 58 144C64 134 72 124 84 116Z" fill="#D4894F"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M58 150Q72 150 80 164"/><path d="M52 178Q68 178 78 194"/><path d="M62 212Q78 210 90 226"/></g></g></g></svg>`;
}

/* Daftar pose. Pose belum tersedia jatuh ke pose pertama (kebiasaan). */
var MASKOT_POSE = { kebiasaan: maskotKebiasaan };

function maskot(pose, ukuran) {
    return (MASKOT_POSE[pose] || maskotKebiasaan)(ukuran);
}

function maskotKosong(teks, ukuran, pose) {
    return '<div class="empty-state">' + maskot(pose, ukuran || 96) + '<p class="text-xs text-slate-500">' + maskotAman(teks) + '</p></div>';
}

/* Dialog dengan maskot dan tombol OK (menggantikan ikon bawaan Swal). */
function maskotAlert(judul, teks, pose) {
    if (typeof Swal === "undefined") return Promise.resolve();
    return Swal.fire({
        title: maskotAman(judul),
        html: maskot(pose, 120) + '<p class="text-xs text-slate-500 mt-1">' + maskotAman(teks) + '</p>',
        confirmButtonColor: "#2563eb"
    });
}

/* Popup perayaan singkat (menutup sendiri). kunci = agar tidak muncul berulang dalam satu sesi. */
var maskotSudahMerayakan = {};
function maskotRayakan(judul, teks, kunci, pose) {
    if (kunci && maskotSudahMerayakan[kunci]) {
        if (typeof showToast === "function") showToast(judul);
        return;
    }
    if (kunci) maskotSudahMerayakan[kunci] = true;
    if (typeof Swal === "undefined") { if (typeof showToast === "function") showToast(judul); return; }
    Swal.fire({
        title: maskotAman(judul),
        html: maskot(pose, 150) + '<p class="text-xs text-slate-500 mt-1">' + maskotAman(teks) + '</p>',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        width: 320
    });
}

function mountMaskot(root) {
    (root || document).querySelectorAll("[data-maskot]:not([data-maskot-ready])").forEach(function (el) {
        var ukuran = parseInt(el.getAttribute("data-maskot"), 10) || 96;
        el.innerHTML = maskot(el.getAttribute("data-maskot-pose"), ukuran);
        el.setAttribute("data-maskot-ready", "1");
    });
}

/* Klik maskot = melompat */
document.addEventListener("click", function (e) {
    var svg = e.target.closest && e.target.closest(".mk");
    if (!svg) return;
    var hop = svg.querySelector(".mk-hop");
    if (!hop) return;
    hop.classList.remove("go");
    void hop.getBoundingClientRect();
    hop.classList.add("go");
    hop.addEventListener("animationend", function () { hop.classList.remove("go"); }, { once: true });
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mountMaskot(); });
else mountMaskot();
