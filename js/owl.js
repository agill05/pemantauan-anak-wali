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

function mountOwls(root) {
    (root || document).querySelectorAll("[data-owl]:not([data-owl-ready])").forEach(function (el) {
        el.innerHTML = owlMascot(parseInt(el.getAttribute("data-owl"), 10) || 96);
        el.setAttribute("data-owl-ready", "1");
    });
}

/* Klik maskot = melompat */
document.addEventListener("click", function (e) {
    var svg = e.target.closest && e.target.closest(".owl");
    if (!svg) return;
    var hop = svg.querySelector(".o-hop");
    if (!hop) return;
    hop.classList.remove("go");
    void hop.getBoundingClientRect();
    hop.classList.add("go");
    hop.addEventListener("animationend", function () { hop.classList.remove("go"); }, { once: true });
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mountOwls(); });
else mountOwls();
