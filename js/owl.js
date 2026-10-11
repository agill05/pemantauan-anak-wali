/* Maskot burung hantu animasi (SVG + CSS, tanpa library).
 * owlMascot(size)  -> string SVG, aman dipakai di template innerHTML.
 * owlEmpty(teks)   -> blok .empty-state berisi maskot + teks.
 * <div data-owl="96"></div> -> otomatis diisi maskot saat halaman dimuat.
 */
function owlMascot(size) {
    var s = size || 120;
    return '<svg class="owl" width="' + s + '" height="' + s + '" viewBox="0 0 400 400" aria-hidden="true" focusable="false">' +
        '<ellipse class="o-shadow" cx="208" cy="366" rx="92" ry="9" fill="#000" opacity=".12"/>' +
        '<g class="o-hop"><g class="o-bob">' +
        '<g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round">' +
        '<path d="M160 330 L170 344 Q150 346 138 358 Q130 368 142 370 L172 370 Q184 362 178 350 L184 336 Z"/>' +
        '<path d="M262 340 L250 352 Q270 354 278 364 Q284 372 272 374 L246 372 Q236 364 242 354 L240 342 Z"/></g>' +
        '<g class="o-wing-r">' +
        '<path d="M240 232 C276 236 312 262 330 296 C338 312 332 334 316 332 L292 322 C286 340 262 350 244 340 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M268 300 L296 322 C290 340 262 350 244 340 L262 318 Z" fill="#9A5128"/></g>' +
        '<ellipse cx="200" cy="282" rx="76" ry="66" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/>' +
        '<ellipse cx="190" cy="286" rx="50" ry="52" fill="#FDEBD3"/>' +
        '<g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round">' +
        '<path d="M162 262 q10 12 20 0"/><path d="M196 264 q10 12 20 0"/><path d="M176 296 q10 12 20 0"/><path d="M204 298 q10 12 20 0"/></g>' +
        '<g class="o-head">' +
        '<path class="o-tuft-l" d="M118 96 L112 30 L150 62 L190 78 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M190 62 Q200 36 224 40 Q240 44 244 54 Q256 52 258 62 Q235 66 230 74 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path class="o-tuft-r" d="M262 78 L336 62 L330 100 L340 108 L310 124 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<ellipse cx="208" cy="152" rx="104" ry="86" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/>' +
        '<ellipse cx="152" cy="152" rx="56" ry="62" fill="#FDEBD3"/><ellipse cx="256" cy="162" rx="60" ry="64" fill="#FDEBD3"/>' +
        '<ellipse cx="205" cy="190" rx="80" ry="38" fill="#FDEBD3"/>' +
        '<ellipse cx="126" cy="182" rx="15" ry="11" fill="#F7C9A8"/><ellipse cx="260" cy="204" rx="19" ry="12" fill="#F7C9A8"/>' +
        '<g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="5"><circle cx="149" cy="147" r="42"/><circle cx="253" cy="165" r="40"/></g>' +
        '<g stroke="#1B2A4A" stroke-width="5" fill="none" stroke-linecap="round"><path d="M190 150 Q202 150 214 158"/><path d="M107 138 L98 134"/><path d="M293 170 L305 172"/></g>' +
        '<g class="o-look">' +
        '<g class="o-iris"><circle cx="158" cy="152" r="19" fill="#5A2E1B"/><circle cx="160" cy="154" r="12" fill="#2B130B"/><circle cx="166" cy="142" r="5" fill="#fff"/></g>' +
        '<g class="o-iris"><circle cx="246" cy="168" r="18" fill="#5A2E1B"/><circle cx="248" cy="170" r="12" fill="#2B130B"/><circle cx="250" cy="158" r="4.5" fill="#fff"/></g></g>' +
        '<path class="o-brow" d="M156 101 L180 114" stroke="#3A1F14" stroke-width="5" stroke-linecap="round"/>' +
        '<path class="o-brow" d="M234 128 Q252 120 268 120" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<path d="M182 172 Q198 158 214 172 Q212 196 197 204 Q184 194 182 172Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
        '<path class="o-mouth" d="M189 182 Q198 190 208 182 Q206 198 198 200 Q190 196 189 182Z" fill="#F5694A"/></g>' +
        '<g class="o-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52">' +
        '<path d="M186 228 L158 214 Q154 232 162 248 Z"/><path d="M206 228 L234 222 Q236 240 224 250 Z"/><rect x="184" y="220" width="24" height="18" rx="5"/></g>' +
        '<g class="o-arm" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round">' +
        '<path d="M152 290 C108 314 60 290 44 232 C38 206 48 176 72 164 C92 156 108 168 112 182 C116 196 116 208 122 220 C130 238 144 248 152 266 Z" fill="#BF6F3D"/>' +
        '<path d="M50 238 L56 272 L72 262 L82 286 L98 272 L110 288 L120 266 L134 280 L150 270 L134 250 Z" fill="#9A5128" stroke-width="3"/>' +
        '<g class="o-fist"><path d="M60 178 C54 156 70 142 90 146 C108 150 118 166 112 186 C108 200 90 208 74 202 C66 198 62 190 60 178Z" fill="#BF6F3D"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M74 156 Q86 160 88 172"/><path d="M62 178 Q76 176 84 186"/><path d="M70 196 Q84 192 92 198"/></g></g></g>' +
        '</g></g>' +
        '<g stroke="#F9A91B" stroke-width="8" stroke-linecap="round"><path class="o-spark" d="M44 140 L72 144"/><path class="o-spark" d="M52 108 L74 130"/><path class="o-spark" d="M76 86 L88 116"/></g>' +
        '</svg>';
}

function owlEmpty(teks, size) {
    var aman = typeof escapeHtml === "function" ? escapeHtml(teks) : String(teks).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
    return '<div class="empty-state">' + owlMascot(size || 96) + '<p class="text-xs text-slate-500">' + aman + '</p></div>';
}

/* Burung hantu juara: bawa piala dan medali. Dipakai untuk prestasi dan perayaan. */
function owlTrophy(size) {
    var s = size || 120;
    return `<svg class="owl" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g class="o-shadow t-shadow"><ellipse cx="208" cy="386" rx="90" ry="8" fill="#000" opacity=".12"/></g><g class="t-hop"><g class="t-bob"><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M158 338L170 352Q148 356 134 368Q126 378 140 381L170 381Q184 372 178 358L184 344Z"/><path d="M240 340L252 352Q272 354 282 364Q290 374 276 378L248 378Q238 368 244 356L234 346Z"/></g><path d="M150 292L86 322L106 330L96 342L150 332Z" fill="#7A3E1E" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M240 240C280 244 312 266 326 294C332 308 326 326 312 322L294 314C288 334 266 344 248 338Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="200" cy="286" rx="78" ry="70" fill="#A35A2C" stroke="#3A1F14" stroke-width="4"/><ellipse cx="205" cy="292" rx="50" ry="54" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M172 296q9 11 18 0"/><path d="M214 292q9 11 18 0"/><path d="M186 322q9 11 18 0"/><path d="M220 318q9 11 18 0"/></g><g class="t-head"><path class="t-tuft-l" d="M78 42L72 76L104 92L120 66Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M86 66L84 82L98 80Z" fill="#FDEBD3"/><path d="M134 62Q146 40 168 36Q180 36 186 46Q196 44 196 56L160 70Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="t-tuft-r" d="M214 56L239 12L262 34L266 70L256 76Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M252 44L262 38L264 66L254 66Z" fill="#FDEBD3"/><ellipse cx="188" cy="128" rx="106" ry="84" fill="#A35A2C" stroke="#3A1F14" stroke-width="4"/><ellipse cx="140" cy="144" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="238" cy="124" rx="54" ry="56" fill="#FDEBD3"/><ellipse cx="190" cy="164" rx="84" ry="42" fill="#FDEBD3"/><ellipse cx="192" cy="116" rx="40" ry="40" fill="#FDEBD3"/><ellipse cx="134" cy="182" rx="17" ry="10" fill="#F4B3A8"/><ellipse cx="262" cy="150" rx="17" ry="10" fill="#F4B3A8"/><g class="o-look"><g class="o-iris"><circle cx="144" cy="143" r="31" fill="#2B130B"/><circle cx="144" cy="143" r="26" fill="#F2A413"/><circle cx="142" cy="146" r="18" fill="#2B130B"/><circle cx="136" cy="136" r="6" fill="#fff"/><circle cx="148" cy="154" r="3" fill="#fff"/></g><g class="o-iris"><circle cx="238" cy="124" r="29" fill="#2B130B"/><circle cx="238" cy="124" r="24" fill="#F2A413"/><circle cx="236" cy="127" r="17" fill="#2B130B"/><circle cx="231" cy="118" r="6" fill="#fff"/><circle cx="242" cy="134" r="3" fill="#fff"/></g></g><path class="o-brow" d="M118 98Q138 86 158 96" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="o-brow" d="M216 80Q236 68 254 80" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="t-mouth" d="M184 154Q198 160 214 150Q216 184 200 194Q186 184 184 154Z" fill="#7E1C1C"/><ellipse class="t-mouth" cx="200" cy="182" rx="10" ry="7" fill="#F08090"/><path d="M178 136Q196 126 218 136Q212 152 198 158Q182 150 178 136Z" fill="#F5A623" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/></g><g class="t-medal"><path d="M142 214L206 252" stroke="#3A1F14" stroke-width="13" stroke-linecap="round"/><path d="M250 204L210 250" stroke="#3A1F14" stroke-width="13" stroke-linecap="round"/><path d="M142 214L206 252" stroke="#E23B3B" stroke-width="9" stroke-linecap="round"/><path d="M250 204L210 250" stroke="#E23B3B" stroke-width="9" stroke-linecap="round"/><path d="M142 214L206 252M250 204L210 250" stroke="#fff" stroke-width="3"/><circle cx="211" cy="268" r="25" fill="#F2B01E" stroke="#3A1F14" stroke-width="3.5"/><circle cx="211" cy="268" r="19" fill="#F9C846" stroke="#C47F0A" stroke-width="2"/><polygon points="211.0,254.0 214.5,263.1 224.3,263.7 216.7,269.9 219.2,279.3 211.0,274.0 202.8,279.3 205.3,269.9 197.7,263.7 207.5,263.1" fill="#F2A413" stroke="#C47F0A" stroke-width="1.5" stroke-linejoin="round"/></g><g class="t-arm-l" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M152 296C110 322 62 300 50 250C44 224 52 204 72 198C88 193 102 200 108 214C112 226 124 240 140 252C150 262 154 280 152 296Z" fill="#BF6F3D"/><path d="M52 272L58 294L74 286L84 306L100 292L112 308L122 288L136 300L150 290L146 274Q100 284 52 272Z" fill="#9A5128" stroke-width="3"/><g class="t-fist-l"><ellipse cx="88" cy="208" rx="25" ry="23" fill="#BF6F3D"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M76 196Q88 200 90 212"/><path d="M68 210Q80 208 86 218"/></g></g></g><g class="t-arm-r"><path d="M248 296C256 262 282 226 304 204L338 214C346 238 338 266 322 284C302 304 270 306 248 296Z" fill="#A35A2C" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="t-trophy"><g transform="translate(-18 6) rotate(10 330 150)"><g transform="rotate(-22 291 224)"><rect x="260" y="210" width="64" height="30" rx="3" fill="#2A2420" stroke="#3A1F14" stroke-width="3"/><rect x="270" y="216" width="40" height="13" rx="2" fill="#F2B01E"/></g><path d="M326 148L350 148L346 196L330 196Z" fill="#F2B01E" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><path d="M300 72C278 68 268 90 282 110C290 122 304 126 312 126" stroke="#3A1F14" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M300 72C278 68 268 90 282 110C290 122 304 126 312 126" stroke="#F2B01E" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M376 74C398 70 404 96 390 112C380 122 368 126 360 130" stroke="#3A1F14" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M376 74C398 70 404 96 390 112C380 122 368 126 360 130" stroke="#F2B01E" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M297 60C297 102 310 142 338 150C366 142 380 102 380 60Z" fill="#F9C846" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><path d="M360 66C358 100 350 130 338 146C366 140 378 100 380 60Z" fill="#F2A413"/><ellipse cx="338" cy="60" rx="42" ry="8" fill="#FBD965" stroke="#3A1F14" stroke-width="3.5"/><polygon points="335.0,86.0 339.1,96.3 350.2,97.1 341.7,104.2 344.4,114.9 335.0,109.0 325.6,114.9 328.3,104.2 319.8,97.1 330.9,96.3" fill="#D4902A"/></g></g><g class="t-fist-r"><path d="M298 200C296 178 318 168 336 178C352 188 348 212 334 218C318 222 302 216 298 200Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M316 182Q324 188 322 198"/><path d="M330 184Q336 192 332 202"/></g></g></g></g></g><g fill="#F9A91B"><g transform="translate(53 112) scale(1.2)"><path class="t-twinkle" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g><g transform="translate(35 158) scale(.9)"><path class="t-twinkle" style="animation-delay:.5s" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g><g transform="translate(374 190) scale(.8)"><path class="t-twinkle" style="animation-delay:1s" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g><g transform="translate(316 352) scale(1)"><path class="t-twinkle" style="animation-delay:1.5s" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g></g></svg>`;
}

function owlEmptyTrophy(teks, size) {
    return owlEmpty(teks, size).replace(owlMascot(size || 96), owlTrophy(size || 96));
}

/* Popup perayaan singkat (menutup sendiri). key = kunci agar tidak muncul berulang dalam satu sesi. */
var owlSudahMerayakan = {};
function owlCelebrate(judul, teks, key) {
    if (key && owlSudahMerayakan[key]) {
        if (typeof showToast === "function") showToast(judul);
        return;
    }
    if (key) owlSudahMerayakan[key] = true;
    if (typeof Swal === "undefined") { if (typeof showToast === "function") showToast(judul); return; }
    var aman = function (t) { return typeof escapeHtml === "function" ? escapeHtml(t) : String(t).replace(/[&<>"']/g, ""); };
    Swal.fire({
        title: aman(judul),
        html: owlTrophy(150) + '<p class="text-xs text-slate-500 mt-1">' + aman(teks || "") + '</p>',
        showConfirmButton: false,
        timer: 2800,
        timerProgressBar: true,
        width: 320
    });
}

function mountOwls(root) {
    (root || document).querySelectorAll("[data-owl]:not([data-owl-ready])").forEach(function (el) {
        var ukuran = parseInt(el.getAttribute("data-owl"), 10) || 96;
        el.innerHTML = el.getAttribute("data-owl-pose") === "trophy" ? owlTrophy(ukuran) : owlMascot(ukuran);
        el.setAttribute("data-owl-ready", "1");
    });
}

/* Klik maskot = melompat */
document.addEventListener("click", function (e) {
    var svg = e.target.closest && e.target.closest(".owl");
    if (!svg) return;
    var hop = svg.querySelector(".o-hop, .t-hop");
    if (!hop) return;
    hop.classList.remove("go");
    void hop.getBoundingClientRect();
    hop.classList.add("go");
    hop.addEventListener("animationend", function () { hop.classList.remove("go"); }, { once: true });
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mountOwls(); });
else mountOwls();
