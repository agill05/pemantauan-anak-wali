function maskotAman(t) {
    if (typeof escapeHtml === "function") return escapeHtml(String(t == null ? "" : t));
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

function maskotKebiasaan(size) {
    var s = size || 120;
    return `<svg class="mk mk-keb" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="214" cy="372" rx="94" ry="8" fill="#000" opacity=".12"/><g class="mk-keb-stars"><g transform="translate(42 106)"><polygon class="mk-keb-star" style="animation-delay:0.00s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(66 77)"><polygon class="mk-keb-star" style="animation-delay:0.28s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(98 55)"><polygon class="mk-keb-star" style="animation-delay:0.56s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(134 42)"><polygon class="mk-keb-star" style="animation-delay:0.84s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(170 38)"><polygon class="mk-keb-star" style="animation-delay:1.12s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(206 42)"><polygon class="mk-keb-star" style="animation-delay:1.40s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g><g transform="translate(240 57)"><polygon class="mk-keb-star" style="animation-delay:1.68s" points="0.0,-15.0 3.9,-5.3 14.3,-4.6 6.3,2.0 8.8,12.1 0.0,6.6 -8.8,12.1 -6.3,2.0 -14.3,-4.6 -3.9,-5.3" fill="#FDB515" stroke="#5A2E14" stroke-width="3" stroke-linejoin="round"/></g></g><g class="mk-hop"><g class="mk-bob"><path class="mk-keb-tail" d="M266 314C286 316 304 324 314 336C312 346 300 350 290 346C284 350 274 350 268 346Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M158 334L170 348Q148 350 136 362Q128 372 140 374L170 374Q184 366 178 354L184 340Z"/><path d="M252 338L242 350Q262 352 272 362Q278 372 266 374L242 372Q232 364 238 354L238 342Z"/></g><ellipse cx="216" cy="288" rx="74" ry="60" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="204" cy="290" rx="48" ry="50" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M176 268q9 11 18 0"/><path d="M208 270q9 11 18 0"/><path d="M190 300q9 11 18 0"/><path d="M218 302q9 11 18 0"/></g><g class="mk-head"><path class="mk-tuft-l" d="M120 110C118 92 124 74 140 60C158 72 176 82 196 92Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M196 94Q204 74 224 70Q240 72 246 82Q256 80 258 90Q232 92 224 100Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M270 104L332 84Q338 100 330 112L342 126L312 142Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="6"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="172" cy="164" r="21" fill="#5A2E1B"/><circle cx="173" cy="165" r="13" fill="#2B130B"/><circle cx="179" cy="154" r="5.5" fill="#fff"/><path class="mk-keb-glint" d="M167 171Q168 166 173 165Q168 164 167 159Q166 164 161 165Q166 166 167 171Z" fill="#fff"/></g><g class="mk-iris"><circle cx="264" cy="186" r="19" fill="#5A2E1B"/><circle cx="265" cy="187" r="12.5" fill="#2B130B"/><circle cx="270" cy="177" r="5" fill="#fff"/><path class="mk-keb-glint" d="M260 193Q261 188 266 187Q261 186 260 181Q259 186 254 187Q259 188 260 193Z" fill="#fff" style="animation-delay:.4s"/></g></g><path class="mk-brow" d="M168 122L192 132" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M242 144Q256 138 270 136" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M191 229L163 215Q159 233 167 249Z"/><path d="M211 229L239 223Q241 241 229 251Z"/><rect x="189" y="221" width="24" height="18" rx="5"/></g><g class="mk-keb-arm"><path d="M254 244C280 246 304 264 314 290C320 304 322 316 316 322C312 330 302 330 298 322C296 332 286 336 280 328C276 336 264 334 262 324Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M280 328C276 336 264 334 262 324L268 300Z" fill="#9A5128"/><g class="mk-keb-fist"><ellipse cx="274" cy="268" rx="23" ry="26" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M262 252Q273 256 275 267"/><path d="M256 270Q267 270 273 280"/></g></g></g><g class="mk-keb-wing"><path d="M84 104C72 100 60 108 58 120C48 126 42 140 46 152C38 164 38 180 44 190C40 204 46 218 56 226C58 244 72 258 88 266C98 280 112 292 128 296C142 300 152 298 156 292L158 240C148 232 140 220 132 204C122 182 110 152 100 128C96 114 92 106 84 104Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M44 190C40 204 46 218 56 226C58 244 72 258 88 266C98 280 112 292 128 296C142 300 152 298 156 292L154 270C118 262 74 238 44 190Z" fill="#9A5128"/><path d="M74 110C64 116 58 128 58 144C64 134 72 124 84 116Z" fill="#D4894F"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M58 150Q72 150 80 164"/><path d="M52 178Q68 178 78 194"/><path d="M62 212Q78 210 90 226"/></g></g></g></svg>`;
}

function maskotAkademik(size) {
    var s = size || 120;
    return `<svg class="mk mk-aka" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="210" cy="372" rx="94" ry="8" fill="#000" opacity=".12"/><g class="mk-hop"><g class="mk-bob"><g transform="translate(-4 -8)"><path class="mk-aka-tail" d="M266 314C286 316 304 324 314 336C312 346 300 350 290 346C284 350 274 350 268 346Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M158 334L170 348Q148 350 136 362Q128 372 140 374L170 374Q184 366 178 354L184 340Z"/><path d="M252 338L242 350Q262 352 272 362Q278 372 266 374L242 372Q232 364 238 354L238 342Z"/></g><ellipse cx="216" cy="288" rx="74" ry="60" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="204" cy="290" rx="48" ry="50" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M176 268q9 11 18 0"/><path d="M208 270q9 11 18 0"/><path d="M190 300q9 11 18 0"/><path d="M218 302q9 11 18 0"/></g><g class="mk-head"><path class="mk-tuft-l" d="M120 110C118 92 124 74 140 60C158 72 176 82 196 92Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M270 104L332 84Q338 100 330 112L342 126L312 142Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="6"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="172" cy="164" r="21" fill="#5A2E1B"/><circle cx="173" cy="165" r="13" fill="#2B130B"/><circle cx="179" cy="154" r="5.5" fill="#fff"/><circle cx="167" cy="172" r="2.6" fill="#fff"/></g><g class="mk-iris"><circle cx="264" cy="186" r="19" fill="#5A2E1B"/><circle cx="265" cy="187" r="12.5" fill="#2B130B"/><circle cx="270" cy="177" r="5" fill="#fff"/><circle cx="260" cy="193" r="2.4" fill="#fff"/></g></g><path class="mk-brow" d="M168 122L192 132" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M242 144Q256 138 270 136" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/><g class="mk-aka-cap"><path d="M158 54L251 33L337 84L244 103Z" fill="#1F2E52" stroke="#0F1A33" stroke-width="4" stroke-linejoin="round"/><path d="M158 54L244 103L244 113L158 64Z" fill="#14213F" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round"/><path d="M244 103L337 84L337 94L244 113Z" fill="#0F1A33" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round"/><path d="M192 84C194 68 212 60 238 60C264 60 282 68 284 82L286 100C266 110 214 108 194 100Z" fill="#243B6B" stroke="#0F1A33" stroke-width="4" stroke-linejoin="round"/><path d="M194 92C214 100 266 102 285 92" fill="none" stroke="#14213F" stroke-width="3" stroke-linecap="round"/><path d="M238 61Q290 62 318 90" fill="none" stroke="#F9A91B" stroke-width="3.5" stroke-linecap="round"/><circle cx="238" cy="61" r="5" fill="#F9A91B" stroke="#3A1F14" stroke-width="2.5"/><g class="mk-aka-tassel"><path d="M318 90L318 108" stroke="#F9A91B" stroke-width="3.5" stroke-linecap="round"/><path d="M309 112L327 112L331 148L305 148Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><circle cx="318" cy="110" r="7" fill="#F9A91B" stroke="#3A1F14" stroke-width="3"/><path d="M312 122V146M318 122V146M324 122V146" fill="none" stroke="#C47F0A" stroke-width="2" stroke-linecap="round"/></g></g></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M191 229L163 215Q159 233 167 249Z"/><path d="M211 229L239 223Q241 241 229 251Z"/><rect x="189" y="221" width="24" height="18" rx="5"/></g><g class="mk-aka-arm-r"><path d="M254 244C280 246 304 264 314 290C320 304 322 316 316 322C312 330 302 330 298 322C296 332 286 336 280 328C276 336 264 334 262 324Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M280 328C276 336 264 334 262 324L268 300Z" fill="#9A5128"/><g class="mk-aka-fist"><ellipse cx="274" cy="268" rx="23" ry="26" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M262 252Q273 256 275 267"/><path d="M256 270Q267 270 273 280"/></g></g></g><g class="mk-aka-arm-l" transform="translate(4 8)"><g class="mk-aka-cert"><g transform="translate(85 188) rotate(-12)"><rect x="-39" y="-59" width="78" height="118" rx="4" fill="#FDEBD3" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g transform="translate(-1 -26)"><polygon class="mk-aka-star" points="0.0,-24.0 5.9,-8.1 22.8,-7.4 9.5,3.1 14.1,19.4 0.0,10.0 -14.1,19.4 -9.5,3.1 -22.8,-7.4 -5.9,-8.1" fill="#F9A91B"/></g><g stroke="#DDAA70" stroke-width="5" stroke-linecap="round"><path d="M-21 12H18"/><path d="M-21 26H16"/><path d="M-21 40H4"/></g></g></g><path d="M146 240L158 296C142 308 124 304 114 294C106 306 88 304 80 292C68 296 56 286 54 274C44 266 36 256 36 244Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M158 296C142 308 124 304 114 294C106 306 88 304 80 292C68 296 56 286 54 274C84 282 130 284 156 272Z" fill="#9A5128"/><g class="mk-aka-fist-l"><ellipse cx="54" cy="224" rx="25" ry="27" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M42 210Q54 214 56 227"/><path d="M38 229Q50 229 56 242"/></g></g></g></g></g></g></svg>`;
}

function maskotJurnal(size) {
    var s = size || 120;
    return `<svg class="mk mk-jur" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="206" cy="386" rx="94" ry="7" fill="#000" opacity=".12"/><g class="mk-hop"><g class="mk-bob"><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M146 340L160 354Q138 358 124 370Q116 380 130 382L160 382Q174 374 168 362L172 346Z"/><path d="M250 342L240 354Q260 356 270 366Q276 376 264 378L240 376Q230 368 236 358L236 346Z"/></g><ellipse cx="200" cy="268" rx="72" ry="58" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="196" cy="256" rx="42" ry="36" fill="#FDEBD3"/><g class="mk-head"><g transform="translate(-28 -30) scale(1.06)"><path class="mk-tuft-l" d="M118 108C112 84 126 56 147 41C160 62 178 76 198 90Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M192 90Q198 62 222 50Q240 50 248 62Q258 62 260 74Q236 78 226 94Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M268 100L338 74Q342 96 332 112L344 128L312 144Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="6"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="172" cy="168" r="21" fill="#5A2E1B"/><circle cx="173" cy="169" r="13" fill="#2B130B"/><circle cx="179" cy="158" r="5.5" fill="#fff"/><circle cx="167" cy="176" r="2.6" fill="#fff"/></g><g class="mk-iris"><circle cx="264" cy="190" r="19" fill="#5A2E1B"/><circle cx="265" cy="191" r="12.5" fill="#2B130B"/><circle cx="270" cy="181" r="5" fill="#fff"/><circle cx="260" cy="197" r="2.4" fill="#fff"/></g></g><path class="mk-brow" d="M168 122L192 132" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M242 144Q256 138 270 136" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/></g></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M180 203L154 190Q150 206 158 222Z"/><path d="M200 203L226 198Q228 214 217 224Z"/><rect x="178" y="196" width="22" height="16" rx="5"/></g><g class="mk-jur-book"><path d="M78 262L198 348L222 348L338 240L324 224L210 276L92 248Z" fill="#243B6B" stroke="#0F1A33" stroke-width="4" stroke-linejoin="round"/><path d="M208 276L210 348" stroke="#14213F" stroke-width="4" stroke-linecap="round"/><path d="M92 250Q130 224 164 226Q190 232 208 256L210 300Q150 270 100 282Z" fill="#FDEBD3" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><path d="M208 256Q250 226 318 224L326 240L210 302Z" fill="#FDEBD3" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><g fill="none" stroke="#DDAA70" stroke-width="3.5" stroke-linecap="round"><path d="M106 268Q150 252 198 274"/><path d="M110 280Q150 266 196 286"/><path d="M224 268Q262 248 308 244"/><path d="M224 281Q262 262 312 257"/><path d="M226 294Q264 276 314 270"/></g><path class="mk-jur-ink" d="M108 258Q124 250 140 258" fill="none" stroke="#1F2E52" stroke-width="3.5" stroke-linecap="round"/></g><path class="mk-jur-wing" d="M52 222C44 244 50 270 66 286C90 296 126 290 152 274L150 236C128 214 84 206 52 222Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-jur-write"><g transform="translate(101 203) rotate(-31)"><rect x="-11" y="-58" width="22" height="14" rx="4" fill="#F27C86" stroke="#3A1F14" stroke-width="3"/><rect x="-11" y="-44" width="22" height="9" fill="#1F2E52" stroke="#3A1F14" stroke-width="3"/><rect x="-11" y="-35" width="22" height="66" fill="#F9B71A" stroke="#3A1F14" stroke-width="3"/><path d="M0 -35V31" stroke="#E08A00" stroke-width="5"/><path d="M-11 31L11 31L0 56Z" fill="#F2D2A0" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path d="M-4 46L4 46L0 56Z" fill="#1B2A4A"/></g><ellipse cx="86" cy="224" rx="25" ry="23" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M76 210Q88 214 90 226"/><path d="M68 226Q80 226 86 238"/></g></g><g class="mk-jur-arm-r"><path d="M296 266C322 262 344 280 346 302C348 322 334 334 316 332C300 330 288 318 288 300Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-jur-fist"><ellipse cx="314" cy="298" rx="28" ry="30" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M300 282Q314 286 316 300"/><path d="M296 302Q310 302 316 316"/></g></g></g></g></g></svg>`;
}

function maskotPresensi(size) {
    var s = size || 120;
    return `<svg class="mk mk-pre" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="190" cy="392" rx="96" ry="6" fill="#000" opacity=".12"/><g class="mk-hop"><g class="mk-bob"><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M138 346L152 360Q130 364 118 376Q110 386 124 388L154 388Q168 380 162 368L166 352Z"/><path d="M228 350L218 362Q238 364 248 374Q254 384 242 386L218 384Q208 376 214 366L214 354Z"/></g><ellipse cx="190" cy="280" rx="74" ry="62" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="180" cy="284" rx="46" ry="52" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M154 268q9 11 18 0"/><path d="M186 270q9 11 18 0"/><path d="M168 300q9 11 18 0"/><path d="M196 302q9 11 18 0"/></g><g class="mk-head"><g transform="translate(-28 -47) scale(1.08)"><path class="mk-tuft-l" d="M120 110C118 92 124 74 140 60C158 72 176 82 196 92Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M196 94Q204 74 224 70Q240 72 246 82Q256 80 258 90Q232 92 224 100Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M270 104L332 84Q338 100 330 112L342 126L312 142Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="6"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="6" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="176" cy="164" r="21" fill="#5A2E1B"/><circle cx="177" cy="165" r="13" fill="#2B130B"/><circle cx="183" cy="154" r="5.5" fill="#fff"/><circle cx="171" cy="172" r="2.6" fill="#fff"/></g><g class="mk-iris"><circle cx="266" cy="184" r="19" fill="#5A2E1B"/><circle cx="267" cy="185" r="12.5" fill="#2B130B"/><circle cx="272" cy="175" r="5" fill="#fff"/><circle cx="262" cy="191" r="2.4" fill="#fff"/></g></g><path class="mk-brow" d="M168 122L192 132" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M242 144Q256 138 270 136" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/></g></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M176 202L148 186Q143 206 152 224Z"/><path d="M198 202L226 196Q230 214 218 226Z"/><rect x="174" y="194" width="26" height="20" rx="5"/></g><g class="mk-pre-clip"><g transform="translate(273 278) rotate(14)"><rect x="-52" y="-70" width="104" height="140" rx="8" fill="#243B6B" stroke="#0F1A33" stroke-width="4"/><rect x="-43" y="-60" width="86" height="122" rx="4" fill="#FDF3E1"/><rect x="-22" y="-82" width="44" height="24" rx="7" fill="#1F2E52" stroke="#0F1A33" stroke-width="3"/><circle cx="0" cy="-74" r="4" fill="#FDF3E1"/><rect x="-35" y="-51" width="18" height="18" rx="3" fill="#fff" stroke="#1F2E52" stroke-width="3"/><path d="M-32 -42l4 5l9 -11" fill="none" stroke="#1F2E52" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="-35" y="-30" width="18" height="18" rx="3" fill="#fff" stroke="#1F2E52" stroke-width="3"/><path class="mk-pre-check" style="animation-delay:0s" d="M-32 -21l4 5l9 -11" fill="none" stroke="#1F2E52" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="-35" y="-9" width="18" height="18" rx="3" fill="#fff" stroke="#1F2E52" stroke-width="3"/><path d="M-32 0l4 5l9 -11" fill="none" stroke="#1F2E52" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="-35" y="12" width="18" height="18" rx="3" fill="#fff" stroke="#1F2E52" stroke-width="3"/><path class="mk-pre-check" style="animation-delay:1.6s" d="M-32 21l4 5l9 -11" fill="none" stroke="#1F2E52" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="-35" y="33" width="18" height="18" rx="3" fill="#fff" stroke="#1F2E52" stroke-width="3"/><path d="M-32 42l4 5l9 -11" fill="none" stroke="#1F2E52" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g></g><g class="mk-pre-arm-r"><path d="M312 262C340 254 366 272 368 296C370 318 352 332 332 328C316 326 306 306 312 262Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-pre-fist"><ellipse cx="338" cy="288" rx="24" ry="28" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M326 270Q338 274 340 288"/><path d="M322 292Q334 292 340 304"/></g></g></g><path class="mk-pre-wing" d="M150 224C118 222 82 238 64 266C54 284 60 306 80 314C92 318 100 308 110 316C124 322 138 310 150 296Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-pre-write"><g transform="translate(150 221) rotate(-55)"><rect x="-14" y="-96" width="28" height="18" rx="5" fill="#F4693F" stroke="#3A1F14" stroke-width="3.5"/><rect x="-14" y="-78" width="28" height="10" fill="#B8BDC7" stroke="#3A1F14" stroke-width="3.5"/><rect x="-14" y="-68" width="28" height="126" fill="#FFB300" stroke="#3A1F14" stroke-width="3.5"/><rect x="2" y="-68" width="12" height="126" fill="#F59A00"/><path d="M-14 58L14 58L0 96Z" fill="#F5D2A0" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><path d="M-5 82L5 82L0 96Z" fill="#1B2A4A"/></g><ellipse cx="128" cy="216" rx="25" ry="23" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M118 202Q130 206 132 218"/><path d="M110 218Q122 218 128 230"/></g></g></g></g></svg>`;
}

function maskotTatib(size) {
    var s = size || 120;
    return `<svg class="mk mk-tat" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="206" cy="378" rx="100" ry="7" fill="#000" opacity=".12"/><g class="mk-hop"><g class="mk-bob"><path class="mk-tat-tail" d="M262 304C284 304 304 312 316 326C312 338 298 340 288 334C280 338 268 334 262 326Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M148 334L162 346Q142 350 130 360Q122 368 134 371L164 371Q178 364 172 354L176 338Z"/><path d="M244 336L234 348Q254 350 264 358Q270 367 258 369L234 367Q224 360 230 351L230 340Z"/></g><ellipse cx="200" cy="270" rx="70" ry="60" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="190" cy="274" rx="48" ry="50" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M160 262q9 11 18 0"/><path d="M196 264q9 11 18 0"/><path d="M174 294q9 11 18 0"/><path d="M204 296q9 11 18 0"/></g><g class="mk-tat-wing-r"><path d="M240 246C262 226 316 232 334 262C342 276 338 296 320 300L296 292C288 304 266 306 250 298Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M262 272L296 292C288 304 266 306 254 296Z" fill="#9A5128"/></g><path d="M156 236C124 238 88 248 66 266L86 292C110 284 140 282 158 288Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-head"><g transform="translate(-28 -41) scale(1.08)"><path class="mk-tuft-l" d="M120 110C118 92 124 74 140 60C158 72 176 82 196 92Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M196 94Q204 74 224 70Q240 72 246 82Q256 80 258 90Q232 92 224 100Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M270 104L332 84Q338 100 330 112L342 126L312 142Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="7"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="7" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="176" cy="164" r="21" fill="#5A2E1B"/><circle cx="177" cy="165" r="13" fill="#2B130B"/><circle cx="183" cy="154" r="5.5" fill="#fff"/><circle cx="171" cy="172" r="2.6" fill="#fff"/></g><g class="mk-iris"><circle cx="266" cy="184" r="19" fill="#5A2E1B"/><circle cx="267" cy="185" r="12.5" fill="#2B130B"/><circle cx="272" cy="175" r="5" fill="#fff"/><circle cx="262" cy="191" r="2.4" fill="#fff"/></g></g><path class="mk-brow" d="M166 118L194 133" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M238 150Q256 140 276 134" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/></g></g><g class="mk-tat-cord" fill="none" stroke="#3A3A44" stroke-width="3" stroke-linecap="round"><path d="M168 226Q170 246 186 252"/><path d="M216 226Q214 244 196 252"/></g><g class="mk-tat-whistle"><g transform="translate(193 250) rotate(14)"><rect x="-4" y="-8" width="8" height="10" rx="3" fill="none" stroke="#3A3A44" stroke-width="3"/><path d="M-9 2H9L9 14L17 20Q22 34 8 40Q-8 44 -14 32Q-18 20 -9 14Z" fill="#B9BEC6" stroke="#3A3A44" stroke-width="3" stroke-linejoin="round"/><path d="M-9 2H9V10H-9Z" fill="#D5D9DF" stroke="#3A3A44" stroke-width="3" stroke-linejoin="round"/><ellipse cx="2" cy="28" rx="5" ry="4" fill="#5B6270"/><path d="M-8 22Q-6 18 -2 17" fill="none" stroke="#F4F6F8" stroke-width="3" stroke-linecap="round"/></g></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M184 212L158 196Q153 216 162 232Z"/><path d="M204 212L230 205Q234 224 222 234Z"/><rect x="182" y="203" width="26" height="20" rx="5"/></g><g class="mk-tat-book"><g transform="translate(108 230) rotate(-14)"><rect x="-40" y="-61" width="88" height="110" rx="5" fill="#FDF3E1" stroke="#0F1A33" stroke-width="3.5"/><rect x="-44" y="-54" width="88" height="110" rx="6" fill="#1F3156" stroke="#0F1A33" stroke-width="4"/><rect x="-44" y="-54" width="12" height="110" rx="6" fill="#172447"/><path d="M-26 -44H36M-26 48H36" stroke="#2D4577" stroke-width="3" stroke-linecap="round"/><g class="mk-tat-shield"><path d="M-14 -24Q4 -19 22 -24V0Q22 18 4 30Q-14 18 -14 0Z" fill="#F9A91B" stroke="#FDB515" stroke-width="3" stroke-linejoin="round"/><path d="M-8 -17Q-1 -15 4 -15V22Q-8 12 -8 0Z" fill="#FBC24A"/></g></g></g><g class="mk-tat-hand-l"><ellipse cx="72" cy="258" rx="27" ry="25" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="94" cy="244" rx="13" ry="8" transform="rotate(-35 94 244)" fill="#BF6F3D" stroke="#3A1F14" stroke-width="3.5"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M56 246Q70 248 74 262"/><path d="M52 262Q66 262 72 274"/></g></g><g class="mk-tat-point"><g class="mk-tat-finger"><path d="M300 236C294 208 298 180 310 170C320 168 326 182 324 200C322 214 322 226 322 236Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M304 190Q312 184 319 190" fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"/></g><ellipse cx="308" cy="248" rx="34" ry="30" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="282" cy="236" rx="11" ry="14" transform="rotate(-20 282 236)" fill="#BF6F3D" stroke="#3A1F14" stroke-width="3.5"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M292 252Q306 254 310 268"/><path d="M308 238Q322 240 326 254"/><path d="M326 262Q332 270 326 278"/></g></g></g></g></g></svg>`;
}
function maskotBiasa(size) {
    var s = size || 120;
    return '<svg class="mk mk-vb" width="' + s + '" height="' + s + '" viewBox="0 0 400 400" aria-hidden="true" focusable="false">' +
        '<ellipse class="mk-o-shadow" cx="208" cy="366" rx="92" ry="9" fill="#000" opacity=".12"/>' +
        '<g class="mk-o-hop"><g class="mk-o-bob">' +
        '<g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round">' +
        '<path d="M160 330 L170 344 Q150 346 138 358 Q130 368 142 370 L172 370 Q184 362 178 350 L184 336 Z"/>' +
        '<path d="M262 340 L250 352 Q270 354 278 364 Q284 372 272 374 L246 372 Q236 364 242 354 L240 342 Z"/></g>' +
        '<g class="mk-o-wing-r">' +
        '<path d="M240 232 C276 236 312 262 330 296 C338 312 332 334 316 332 L292 322 C286 340 262 350 244 340 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M268 300 L296 322 C290 340 262 350 244 340 L262 318 Z" fill="#9A5128"/></g>' +
        '<ellipse cx="200" cy="282" rx="76" ry="66" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/>' +
        '<ellipse cx="190" cy="286" rx="50" ry="52" fill="#FDEBD3"/>' +
        '<g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round">' +
        '<path d="M162 262 q10 12 20 0"/><path d="M196 264 q10 12 20 0"/><path d="M176 296 q10 12 20 0"/><path d="M204 298 q10 12 20 0"/></g>' +
        '<g class="mk-o-head">' +
        '<path class="mk-o-tuft-l" d="M118 96 L112 30 L150 62 L190 78 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M190 62 Q200 36 224 40 Q240 44 244 54 Q256 52 258 62 Q235 66 230 74 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path class="mk-o-tuft-r" d="M262 78 L336 62 L330 100 L340 108 L310 124 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<ellipse cx="208" cy="152" rx="104" ry="86" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/>' +
        '<ellipse cx="152" cy="152" rx="56" ry="62" fill="#FDEBD3"/><ellipse cx="256" cy="162" rx="60" ry="64" fill="#FDEBD3"/>' +
        '<ellipse cx="205" cy="190" rx="80" ry="38" fill="#FDEBD3"/>' +
        '<ellipse cx="126" cy="182" rx="15" ry="11" fill="#F7C9A8"/><ellipse cx="260" cy="204" rx="19" ry="12" fill="#F7C9A8"/>' +
        '<g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="5"><circle cx="149" cy="147" r="42"/><circle cx="253" cy="165" r="40"/></g>' +
        '<g stroke="#1B2A4A" stroke-width="5" fill="none" stroke-linecap="round"><path d="M190 150 Q202 150 214 158"/><path d="M107 138 L98 134"/><path d="M293 170 L305 172"/></g>' +
        '<g class="mk-o-look">' +
        '<g class="mk-o-iris"><circle cx="158" cy="152" r="19" fill="#5A2E1B"/><circle cx="160" cy="154" r="12" fill="#2B130B"/><circle cx="166" cy="142" r="5" fill="#fff"/></g>' +
        '<g class="mk-o-iris"><circle cx="246" cy="168" r="18" fill="#5A2E1B"/><circle cx="248" cy="170" r="12" fill="#2B130B"/><circle cx="250" cy="158" r="4.5" fill="#fff"/></g></g>' +
        '<path class="mk-o-brow" d="M156 101 L180 114" stroke="#3A1F14" stroke-width="5" stroke-linecap="round"/>' +
        '<path class="mk-o-brow" d="M234 128 Q252 120 268 120" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<path d="M182 172 Q198 158 214 172 Q212 196 197 204 Q184 194 182 172Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
        '<path class="mk-o-mouth" d="M189 182 Q198 190 208 182 Q206 198 198 200 Q190 196 189 182Z" fill="#F5694A"/></g>' +
        '<g class="mk-o-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52">' +
        '<path d="M186 228 L158 214 Q154 232 162 248 Z"/><path d="M206 228 L234 222 Q236 240 224 250 Z"/><rect x="184" y="220" width="24" height="18" rx="5"/></g>' +
        '<g class="mk-o-arm" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round">' +
        '<path d="M152 290 C108 314 60 290 44 232 C38 206 48 176 72 164 C92 156 108 168 112 182 C116 196 116 208 122 220 C130 238 144 248 152 266 Z" fill="#BF6F3D"/>' +
        '<path d="M50 238 L56 272 L72 262 L82 286 L98 272 L110 288 L120 266 L134 280 L150 270 L134 250 Z" fill="#9A5128" stroke-width="3"/>' +
        '<g class="mk-o-fist"><path d="M60 178 C54 156 70 142 90 146 C108 150 118 166 112 186 C108 200 90 208 74 202 C66 198 62 190 60 178Z" fill="#BF6F3D"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M74 156 Q86 160 88 172"/><path d="M62 178 Q76 176 84 186"/><path d="M70 196 Q84 192 92 198"/></g></g></g>' +
        '</g></g>' +
        '<g stroke="#F9A91B" stroke-width="8" stroke-linecap="round"><path class="mk-o-spark" d="M44 140 L72 144"/><path class="mk-o-spark" d="M52 108 L74 130"/><path class="mk-o-spark" d="M76 86 L88 116"/></g>' +
        '</svg>';
}

function maskotPiala(size) {
    var s = size || 120;
    return `<svg class="mk mk-vb" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g class="mk-o-shadow mk-t-shadow"><ellipse cx="208" cy="386" rx="90" ry="8" fill="#000" opacity=".12"/></g><g class="mk-t-hop"><g class="mk-t-bob"><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M158 338L170 352Q148 356 134 368Q126 378 140 381L170 381Q184 372 178 358L184 344Z"/><path d="M240 340L252 352Q272 354 282 364Q290 374 276 378L248 378Q238 368 244 356L234 346Z"/></g><path d="M150 292L86 322L106 330L96 342L150 332Z" fill="#7A3E1E" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M240 240C280 244 312 266 326 294C332 308 326 326 312 322L294 314C288 334 266 344 248 338Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="200" cy="286" rx="78" ry="70" fill="#A35A2C" stroke="#3A1F14" stroke-width="4"/><ellipse cx="205" cy="292" rx="50" ry="54" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M172 296q9 11 18 0"/><path d="M214 292q9 11 18 0"/><path d="M186 322q9 11 18 0"/><path d="M220 318q9 11 18 0"/></g><g class="mk-t-head"><path class="mk-t-tuft-l" d="M78 42L72 76L104 92L120 66Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M86 66L84 82L98 80Z" fill="#FDEBD3"/><path d="M134 62Q146 40 168 36Q180 36 186 46Q196 44 196 56L160 70Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-t-tuft-r" d="M214 56L239 12L262 34L266 70L256 76Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M252 44L262 38L264 66L254 66Z" fill="#FDEBD3"/><ellipse cx="188" cy="128" rx="106" ry="84" fill="#A35A2C" stroke="#3A1F14" stroke-width="4"/><ellipse cx="140" cy="144" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="238" cy="124" rx="54" ry="56" fill="#FDEBD3"/><ellipse cx="190" cy="164" rx="84" ry="42" fill="#FDEBD3"/><ellipse cx="192" cy="116" rx="40" ry="40" fill="#FDEBD3"/><ellipse cx="134" cy="182" rx="17" ry="10" fill="#F4B3A8"/><ellipse cx="262" cy="150" rx="17" ry="10" fill="#F4B3A8"/><g class="mk-o-look"><g class="mk-o-iris"><circle cx="144" cy="143" r="31" fill="#2B130B"/><circle cx="144" cy="143" r="26" fill="#F2A413"/><circle cx="142" cy="146" r="18" fill="#2B130B"/><circle cx="136" cy="136" r="6" fill="#fff"/><circle cx="148" cy="154" r="3" fill="#fff"/></g><g class="mk-o-iris"><circle cx="238" cy="124" r="29" fill="#2B130B"/><circle cx="238" cy="124" r="24" fill="#F2A413"/><circle cx="236" cy="127" r="17" fill="#2B130B"/><circle cx="231" cy="118" r="6" fill="#fff"/><circle cx="242" cy="134" r="3" fill="#fff"/></g></g><path class="mk-o-brow" d="M118 98Q138 86 158 96" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-o-brow" d="M216 80Q236 68 254 80" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-t-mouth" d="M184 154Q198 160 214 150Q216 184 200 194Q186 184 184 154Z" fill="#7E1C1C"/><ellipse class="mk-t-mouth" cx="200" cy="182" rx="10" ry="7" fill="#F08090"/><path d="M178 136Q196 126 218 136Q212 152 198 158Q182 150 178 136Z" fill="#F5A623" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/></g><g class="mk-t-medal"><path d="M142 214L206 252" stroke="#3A1F14" stroke-width="13" stroke-linecap="round"/><path d="M250 204L210 250" stroke="#3A1F14" stroke-width="13" stroke-linecap="round"/><path d="M142 214L206 252" stroke="#E23B3B" stroke-width="9" stroke-linecap="round"/><path d="M250 204L210 250" stroke="#E23B3B" stroke-width="9" stroke-linecap="round"/><path d="M142 214L206 252M250 204L210 250" stroke="#fff" stroke-width="3"/><circle cx="211" cy="268" r="25" fill="#F2B01E" stroke="#3A1F14" stroke-width="3.5"/><circle cx="211" cy="268" r="19" fill="#F9C846" stroke="#C47F0A" stroke-width="2"/><polygon points="211.0,254.0 214.5,263.1 224.3,263.7 216.7,269.9 219.2,279.3 211.0,274.0 202.8,279.3 205.3,269.9 197.7,263.7 207.5,263.1" fill="#F2A413" stroke="#C47F0A" stroke-width="1.5" stroke-linejoin="round"/></g><g class="mk-t-arm-l" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M152 296C110 322 62 300 50 250C44 224 52 204 72 198C88 193 102 200 108 214C112 226 124 240 140 252C150 262 154 280 152 296Z" fill="#BF6F3D"/><path d="M52 272L58 294L74 286L84 306L100 292L112 308L122 288L136 300L150 290L146 274Q100 284 52 272Z" fill="#9A5128" stroke-width="3"/><g class="mk-t-fist-l"><ellipse cx="88" cy="208" rx="25" ry="23" fill="#BF6F3D"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M76 196Q88 200 90 212"/><path d="M68 210Q80 208 86 218"/></g></g></g><g class="mk-t-arm-r"><path d="M248 296C256 262 282 226 304 204L338 214C346 238 338 266 322 284C302 304 270 306 248 296Z" fill="#A35A2C" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-t-trophy"><g transform="translate(-18 6) rotate(10 330 150)"><g transform="rotate(-22 291 224)"><rect x="260" y="210" width="64" height="30" rx="3" fill="#2A2420" stroke="#3A1F14" stroke-width="3"/><rect x="270" y="216" width="40" height="13" rx="2" fill="#F2B01E"/></g><path d="M326 148L350 148L346 196L330 196Z" fill="#F2B01E" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><path d="M300 72C278 68 268 90 282 110C290 122 304 126 312 126" stroke="#3A1F14" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M300 72C278 68 268 90 282 110C290 122 304 126 312 126" stroke="#F2B01E" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M376 74C398 70 404 96 390 112C380 122 368 126 360 130" stroke="#3A1F14" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M376 74C398 70 404 96 390 112C380 122 368 126 360 130" stroke="#F2B01E" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M297 60C297 102 310 142 338 150C366 142 380 102 380 60Z" fill="#F9C846" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><path d="M360 66C358 100 350 130 338 146C366 140 378 100 380 60Z" fill="#F2A413"/><ellipse cx="338" cy="60" rx="42" ry="8" fill="#FBD965" stroke="#3A1F14" stroke-width="3.5"/><polygon points="335.0,86.0 339.1,96.3 350.2,97.1 341.7,104.2 344.4,114.9 335.0,109.0 325.6,114.9 328.3,104.2 319.8,97.1 330.9,96.3" fill="#D4902A"/></g></g><g class="mk-t-fist-r"><path d="M298 200C296 178 318 168 336 178C352 188 348 212 334 218C318 222 302 216 298 200Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M316 182Q324 188 322 198"/><path d="M330 184Q336 192 332 202"/></g></g></g></g></g><g fill="#F9A91B"><g transform="translate(53 112) scale(1.2)"><path class="mk-t-twinkle" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g><g transform="translate(35 158) scale(.9)"><path class="mk-t-twinkle" style="animation-delay:.5s" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g><g transform="translate(374 190) scale(.8)"><path class="mk-t-twinkle" style="animation-delay:1s" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g><g transform="translate(316 352) scale(1)"><path class="mk-t-twinkle" style="animation-delay:1.5s" d="M0 -22Q3 -3 22 0Q3 3 0 22Q-3 3 -22 0Q-3 -3 0 -22Z"/></g></g></svg>`;
}

function maskotPengingat(size) {
    var s = size || 120;
    return `<svg class="mk mk-vb" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g class="mk-r-shadow"><ellipse cx="166" cy="368" rx="96" ry="8" fill="#000" opacity=".12"/></g><g class="mk-r-hop"><g class="mk-r-bob"><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M120 336L134 350Q112 354 98 364Q92 374 104 378L136 378Q148 370 142 358L146 346Z"/><path d="M198 340L210 350Q228 350 240 360Q246 370 234 374L206 374Q194 366 200 356Z"/></g><path d="M112 304L62 326L82 332L68 344L118 336Z" fill="#7A3E1E" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="150" cy="272" rx="80" ry="68" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="182" cy="278" rx="48" ry="54" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M160 258q9 11 18 0"/><path d="M192 262q9 11 18 0"/><path d="M170 292q9 11 18 0"/><path d="M198 296q9 11 18 0"/></g><g class="mk-r-head"><g transform="translate(-50 -20)"><path class="mk-x-tuft-l" d="M118 96 L112 30 L150 62 L190 78 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M190 62 Q200 36 224 40 Q240 44 244 54 Q256 52 258 62 Q235 66 230 74 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-x-tuft-r" d="M262 78 L336 62 L330 100 L340 108 L310 124 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="208" cy="152" rx="104" ry="86" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="152" cy="152" rx="56" ry="62" fill="#FDEBD3"/><ellipse cx="256" cy="162" rx="60" ry="64" fill="#FDEBD3"/><ellipse cx="205" cy="190" rx="80" ry="38" fill="#FDEBD3"/><ellipse cx="126" cy="182" rx="15" ry="11" fill="#F7C9A8"/><ellipse cx="260" cy="204" rx="19" ry="12" fill="#F7C9A8"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="5"><circle cx="149" cy="147" r="42"/><circle cx="253" cy="165" r="40"/></g><g stroke="#1B2A4A" stroke-width="5" fill="none" stroke-linecap="round"><path d="M190 150 Q202 150 214 158"/><path d="M107 138 L98 134"/><path d="M293 170 L305 172"/></g><g class="mk-o-look"><g class="mk-o-iris"><circle cx="158" cy="152" r="19" fill="#5A2E1B"/><circle cx="160" cy="154" r="12" fill="#2B130B"/><circle cx="166" cy="142" r="5" fill="#fff"/></g><g class="mk-o-iris"><circle cx="246" cy="168" r="18" fill="#5A2E1B"/><circle cx="248" cy="170" r="12" fill="#2B130B"/><circle cx="250" cy="158" r="4.5" fill="#fff"/></g></g><path class="mk-o-brow" d="M156 101 L180 114" stroke="#3A1F14" stroke-width="5" stroke-linecap="round"/><path class="mk-o-brow" d="M234 128 Q252 120 268 120" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M182 172 Q198 158 214 172 Q212 196 197 204 Q184 194 182 172Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-x-mouth" d="M189 182 Q198 190 208 182 Q206 198 198 200 Q190 196 189 182Z" fill="#F5694A"/></g></g><g class="mk-r-point"><path d="M214 238C246 228 278 206 298 174C304 164 314 156 324 158C336 162 338 176 332 190C328 204 324 226 314 246C298 276 268 302 232 308L210 298Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M236 306C262 296 282 280 298 258L286 296C272 310 252 316 236 312Z" fill="#9A5128"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M318 186Q326 192 324 204"/><path d="M308 196Q316 200 314 210"/></g></g><g transform="translate(-20 -4)"><g class="mk-r-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M186 228 L158 214 Q154 232 162 248 Z"/><path d="M206 228 L234 222 Q236 240 224 250 Z"/><rect x="184" y="220" width="24" height="18" rx="5"/></g></g><path d="M64 246C42 262 30 292 40 318C46 332 68 338 90 330L110 322L112 270C104 250 82 240 64 246Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-r-clip"><g transform="rotate(-22 100 262)"><rect x="58" y="212" width="84" height="100" rx="7" fill="#2B4A82" stroke="#1B2A4A" stroke-width="3"/><rect x="65" y="224" width="70" height="82" rx="3" fill="#FFFBF2"/><rect x="80" y="203" width="40" height="16" rx="5" fill="#9AA3B5" stroke="#5B6477" stroke-width="2.5"/><rect x="68" y="238" width="11" height="11" rx="2" fill="#fff" stroke="#3C5A92" stroke-width="2"/><path class="mk-r-check" style="animation-delay:0.0s" d="M70 244l3.5 3.5l6-8" fill="none" stroke="#2B4A82" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M87 244H124" stroke="#5A7BB5" stroke-width="3" stroke-linecap="round"/><rect x="68" y="262" width="11" height="11" rx="2" fill="#fff" stroke="#3C5A92" stroke-width="2"/><path class="mk-r-check" style="animation-delay:0.5s" d="M70 268l3.5 3.5l6-8" fill="none" stroke="#2B4A82" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M87 268H124" stroke="#5A7BB5" stroke-width="3" stroke-linecap="round"/><rect x="68" y="286" width="11" height="11" rx="2" fill="#fff" stroke="#3C5A92" stroke-width="2"/><path class="mk-r-check" style="animation-delay:1.0s" d="M70 292l3.5 3.5l6-8" fill="none" stroke="#2B4A82" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M87 292H124" stroke="#5A7BB5" stroke-width="3" stroke-linecap="round"/></g></g><g class="mk-r-fist" transform="translate(-6 14)"><path d="M56 286C52 270 66 262 82 266C98 270 104 284 98 298C92 308 74 310 64 302C60 298 57 292 56 286Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M68 272Q78 276 80 286"/><path d="M60 288Q70 288 76 296"/></g></g><path d="M40 318L44 338L58 330L66 344L80 334L92 344L100 326Z" fill="#9A5128" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/></g></g><g class="mk-r-clock"><circle cx="330" cy="108" r="48" fill="#243B6B" stroke="#14213F" stroke-width="3"/><circle cx="330" cy="108" r="41" fill="#FFF8EA"/><path d="M330.0 72.0 L330.0 67.0" stroke="#1F2E52" stroke-width="3" stroke-linecap="round"/><path d="M355.5 82.5 L358.3 79.7" stroke="#1F2E52" stroke-width="2" stroke-linecap="round"/><path d="M366.0 108.0 L371.0 108.0" stroke="#1F2E52" stroke-width="3" stroke-linecap="round"/><path d="M355.5 133.5 L358.3 136.3" stroke="#1F2E52" stroke-width="2" stroke-linecap="round"/><path d="M330.0 144.0 L330.0 149.0" stroke="#1F2E52" stroke-width="3" stroke-linecap="round"/><path d="M304.5 133.5 L301.7 136.3" stroke="#1F2E52" stroke-width="2" stroke-linecap="round"/><path d="M294.0 108.0 L289.0 108.0" stroke="#1F2E52" stroke-width="3" stroke-linecap="round"/><path d="M304.5 82.5 L301.7 79.7" stroke="#1F2E52" stroke-width="2" stroke-linecap="round"/><path class="mk-r-hour" d="M330 108L312 95" stroke="#1F2E52" stroke-width="5" stroke-linecap="round"/><path class="mk-r-min" d="M330 108L354 91" stroke="#1F2E52" stroke-width="4" stroke-linecap="round"/><circle cx="330" cy="108" r="4.5" fill="#1F2E52"/></g><g stroke="#F9A91B" stroke-width="7" stroke-linecap="round"><path class="mk-o-spark" d="M346 30L351 46"/><path class="mk-o-spark" d="M362 40L371 54"/><path class="mk-o-spark" d="M374 62L388 66"/></g></svg>`;
}

function maskotCeria(size) {
    var s = size || 120;
    return `<svg class="mk mk-vb" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g class="mk-c-shadow"><ellipse cx="206" cy="392" rx="70" ry="6" fill="#000" opacity=".12"/></g><g class="mk-c-hop"><g class="mk-c-bob"><path d="M160 298L104 314L112 324L124 338L160 328Z" fill="#7A3E1E" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g class="mk-c-kick"><path d="M258 322L272 332L298 302Q310 292 316 304Q320 320 300 342Q290 352 280 346L262 338Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/></g><path d="M162 326L176 342Q156 348 146 360Q140 372 152 378L178 380Q190 372 186 360L190 344Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="278" rx="68" ry="84" transform="rotate(10 214 278)" fill="#A35A2C" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="234" cy="278" rx="46" ry="58" transform="rotate(10 234 278)" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M214 250q9 11 18 0"/><path d="M246 246q9 11 18 0"/><path d="M222 286q9 11 18 0"/><path d="M254 282q9 11 18 0"/></g><g class="mk-c-wing-l"><g><path d="M176 226C150 196 116 160 70 132C56 126 38 124 26 130C32 138 28 148 20 160C30 164 34 170 30 180C40 184 46 190 44 200C52 204 56 212 56 222C66 226 70 234 70 244C96 262 132 266 156 258C170 252 180 242 182 232Z" fill="#A35A2C" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M70 148C100 170 130 200 156 232L118 226C96 206 80 180 70 148Z" fill="#C07A45"/><path d="M52 196C84 216 114 236 150 250C124 262 88 258 68 242C58 232 52 214 52 196Z" fill="#8F4A24"/></g></g><g class="mk-c-wing-r"><g transform="translate(420 0) scale(-1 1) rotate(12 176 226)"><path d="M176 226C150 196 116 160 70 132C56 126 38 124 26 130C32 138 28 148 20 160C30 164 34 170 30 180C40 184 46 190 44 200C52 204 56 212 56 222C66 226 70 234 70 244C96 262 132 266 156 258C170 252 180 242 182 232Z" fill="#A35A2C" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M70 148C100 170 130 200 156 232L118 226C96 206 80 180 70 148Z" fill="#C07A45"/><path d="M52 196C84 216 114 236 150 250C124 262 88 258 68 242C58 232 52 214 52 196Z" fill="#8F4A24"/></g></g><g class="mk-c-head"><g transform="translate(16 4)"><path class="mk-x-tuft-l" d="M78 42L72 76L104 92L120 66Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M86 66L84 82L98 80Z" fill="#FDEBD3"/><path d="M134 62Q146 40 168 36Q180 36 186 46Q196 44 196 56L160 70Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-x-tuft-r" d="M214 56L239 12L262 34L266 70L256 76Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M252 44L262 38L264 66L254 66Z" fill="#FDEBD3"/><ellipse cx="188" cy="128" rx="106" ry="84" fill="#A35A2C" stroke="#3A1F14" stroke-width="4"/><ellipse cx="140" cy="144" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="238" cy="124" rx="54" ry="56" fill="#FDEBD3"/><ellipse cx="190" cy="164" rx="84" ry="42" fill="#FDEBD3"/><ellipse cx="192" cy="116" rx="40" ry="40" fill="#FDEBD3"/><ellipse cx="134" cy="182" rx="17" ry="10" fill="#F4B3A8"/><ellipse cx="262" cy="150" rx="17" ry="10" fill="#F4B3A8"/><g class="mk-o-look"><g class="mk-o-iris"><circle cx="144" cy="143" r="31" fill="#2B130B"/><circle cx="144" cy="143" r="26" fill="#F2A413"/><circle cx="142" cy="146" r="18" fill="#2B130B"/><circle cx="136" cy="136" r="6" fill="#fff"/><circle cx="148" cy="154" r="3" fill="#fff"/></g><g class="mk-o-iris"><circle cx="238" cy="124" r="29" fill="#2B130B"/><circle cx="238" cy="124" r="24" fill="#F2A413"/><circle cx="236" cy="127" r="17" fill="#2B130B"/><circle cx="231" cy="118" r="6" fill="#fff"/><circle cx="242" cy="134" r="3" fill="#fff"/></g></g><path class="mk-o-brow" d="M118 98Q138 86 158 96" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-o-brow" d="M216 80Q236 68 254 80" stroke="#3A1F14" stroke-width="5" stroke-linecap="round" fill="none"/><path class="mk-x-mouth" d="M184 154Q198 160 214 150Q216 184 200 194Q186 184 184 154Z" fill="#7E1C1C"/><ellipse class="mk-x-mouth" cx="200" cy="182" rx="10" ry="7" fill="#F08090"/><path d="M178 136Q196 126 218 136Q212 152 198 158Q182 150 178 136Z" fill="#F5A623" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/></g></g></g></g><g stroke="#F9A91B" stroke-width="9" stroke-linecap="round"><path class="mk-c-spark" d="M52 66L80 86"/><path class="mk-c-spark" d="M32 94L74 104"/><path class="mk-c-spark" d="M326 30L304 70"/><path class="mk-c-spark" d="M360 62L312 86"/></g></svg>`;
}

function maskotAdmin(size) {
    var s = size || 120;
    return `<svg class="mk mk-adm" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><ellipse class="mk-shadow" cx="208" cy="380" rx="100" ry="7" fill="#000" opacity=".12"/><g transform="translate(16 40)"><g class="mk-adm-sparks" fill="none" stroke="#F9B71A" stroke-width="6" stroke-linecap="round"><path class="mk-adm-spark" d="M344 58L342 78"/><path class="mk-adm-spark" style="animation-delay:.25s" d="M372 72L362 86"/><path class="mk-adm-spark" style="animation-delay:.5s" d="M384 104L368 108"/></g><g class="mk-adm-gear-s"><path d="M366.0 112.0L365.9 113.9L372.6 116.6L370.9 122.3L363.8 121.1L360.1 126.1L358.7 127.4L361.5 134.1L356.3 136.9L352.2 131.0L346.0 132.0L344.1 131.9L341.4 138.6L335.7 136.9L336.9 129.8L331.9 126.1L330.6 124.7L323.9 127.5L321.1 122.3L327.0 118.2L326.0 112.0L326.1 110.1L319.4 107.4L321.1 101.7L328.2 102.9L331.9 97.9L333.3 96.6L330.5 89.9L335.7 87.1L339.8 93.0L346.0 92.0L347.9 92.1L350.6 85.4L356.3 87.1L355.1 94.2L360.1 97.9L361.4 99.3L368.1 96.5L370.9 101.7L365.0 105.8Z" fill="#F9B71A" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/><circle cx="346" cy="112" r="7" fill="#FDEBD3" stroke="#3A1F14" stroke-width="3"/></g></g><g class="mk-hop"><g class="mk-bob"><path class="mk-adm-tail" d="M262 304C284 304 304 312 316 326C312 338 298 340 288 334C280 338 268 334 262 326Z" fill="#8F4A24" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M148 334L162 346Q142 350 130 360Q122 368 134 371L164 371Q178 364 172 354L176 338Z"/><path d="M244 336L234 348Q254 350 264 358Q270 367 258 369L234 367Q224 360 230 351L230 340Z"/></g><ellipse cx="200" cy="270" rx="70" ry="60" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="190" cy="274" rx="48" ry="50" fill="#FDEBD3"/><g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M160 262q9 11 18 0"/><path d="M196 264q9 11 18 0"/><path d="M174 294q9 11 18 0"/><path d="M204 296q9 11 18 0"/></g><g class="mk-head"><g transform="translate(-28 -41) scale(1.08)"><path class="mk-tuft-l" d="M120 110C118 92 124 74 140 60C158 72 176 82 196 92Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M196 94Q204 74 224 70Q240 72 246 82Q256 80 258 90Q232 92 224 100Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path class="mk-tuft-r" d="M270 104L332 84Q338 100 330 112L342 126L312 142Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><ellipse cx="214" cy="160" rx="102" ry="80" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/><ellipse cx="160" cy="158" rx="52" ry="58" fill="#FDEBD3"/><ellipse cx="262" cy="172" rx="54" ry="58" fill="#FDEBD3"/><ellipse cx="212" cy="198" rx="76" ry="36" fill="#FDEBD3"/><ellipse cx="148" cy="200" rx="15" ry="10" fill="#F7C9A8" opacity=".85"/><ellipse cx="272" cy="218" rx="17" ry="10" fill="#F7C9A8" opacity=".85"/><g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="7"><circle cx="166" cy="160" r="36"/><circle cx="258" cy="178" r="34"/></g><g stroke="#1B2A4A" stroke-width="7" fill="none" stroke-linecap="round"><path d="M201 160Q212 158 224 170"/><path d="M130 150L118 146"/><path d="M292 180L306 182"/></g><g class="mk-look"><g class="mk-iris"><circle cx="176" cy="164" r="21" fill="#5A2E1B"/><circle cx="177" cy="165" r="13" fill="#2B130B"/><circle cx="183" cy="154" r="5.5" fill="#fff"/><circle cx="171" cy="172" r="2.6" fill="#fff"/></g><g class="mk-iris"><circle cx="266" cy="184" r="19" fill="#5A2E1B"/><circle cx="267" cy="185" r="12.5" fill="#2B130B"/><circle cx="272" cy="175" r="5" fill="#fff"/><circle cx="262" cy="191" r="2.4" fill="#fff"/></g></g><path class="mk-brow" d="M166 118L194 133" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M238 150Q256 140 276 134" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M188 178Q207 162 228 176Q226 206 208 216Q190 206 188 178Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/><path class="mk-mouth" d="M195 189Q208 197 221 187Q220 207 208 210Q197 205 195 189Z" fill="#F5694A"/></g></g><g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M184 212L158 196Q153 216 162 232Z"/><path d="M204 212L230 205Q234 224 222 234Z"/><rect x="182" y="203" width="26" height="20" rx="5"/></g><g class="mk-adm-gear"><path d="M340.0 302.0L339.9 305.8L353.4 310.8L350.9 321.8L336.5 320.4L330.5 331.4L328.1 334.4L336.1 346.4L327.6 353.8L316.8 344.2L305.5 349.6L301.8 350.6L301.2 365.0L290.0 366.0L286.9 351.9L274.5 349.6L271.0 348.3L262.0 359.6L252.4 353.8L258.1 340.5L249.5 331.4L247.5 328.3L233.5 332.1L229.1 321.8L241.6 314.4L240.0 302.0L240.1 298.2L226.6 293.2L229.1 282.2L243.5 283.6L249.5 272.6L251.9 269.6L243.9 257.6L252.4 250.2L263.2 259.8L274.5 254.4L278.2 253.4L278.8 239.0L290.0 238.0L293.1 252.1L305.5 254.4L309.0 255.7L318.0 244.4L327.6 250.2L321.9 263.5L330.5 272.6L332.5 275.7L346.5 271.9L350.9 282.2L338.4 289.6Z" fill="#7D90B6" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><circle cx="290" cy="302" r="34" fill="none" stroke="#5E7199" stroke-width="5"/><circle cx="290" cy="302" r="15" fill="#FDEBD3" stroke="#3A1F14" stroke-width="4"/><path d="M262 276Q270 266 282 262" fill="none" stroke="#A9B8D6" stroke-width="4" stroke-linecap="round"/></g><g class="mk-adm-tool"><g class="mk-adm-wrench"><g transform="translate(168 298) rotate(-15)"><path d="M-76 -10L8 -15Q20 -26 40 -28L64 -28Q78 -24 82 -12L82 -7L62 -7Q55 -7 55 0Q55 7 62 7L82 7L82 12Q78 24 64 28L40 28Q20 26 8 15L-76 10Q-90 0 -76 -10Z" fill="#7D90B6" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><circle cx="-72" cy="0" r="5.5" fill="#FDEBD3" stroke="#3A1F14" stroke-width="3"/><rect x="-14" y="-12" width="26" height="24" rx="4" fill="#5E7199" stroke="#3A1F14" stroke-width="3"/><path d="M-8 -5H6M-8 0H6M-8 5H6" stroke="#2A3A5C" stroke-width="2.5" stroke-linecap="round"/><path d="M-62 -4L0 -9" stroke="#A9B8D6" stroke-width="3.5" stroke-linecap="round" fill="none"/></g></g><g class="mk-adm-wing-l"><path d="M150 244C118 240 84 252 66 276C56 292 62 312 78 320C84 330 98 332 104 324C114 332 128 328 130 318C142 316 152 304 154 290Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M104 324C114 332 128 328 130 318C142 316 152 304 154 290L132 296C122 306 108 312 98 312Z" fill="#9A5128"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M84 296Q96 298 100 310"/><path d="M104 292Q116 296 118 308"/></g></g></g><g class="mk-adm-wing-r"><path d="M262 276C290 270 322 284 336 308C344 322 338 340 324 342C320 350 308 352 302 344C294 350 282 346 280 336C268 330 262 310 262 276Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M302 344C294 350 282 346 280 336C268 330 264 316 264 304L290 322C300 330 312 336 322 336Z" fill="#9A5128"/><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M312 306Q322 312 322 324"/><path d="M296 312Q306 318 306 330"/></g></g></g></g></svg>`;
}

function maskotRangka(kls, belakang, depan, opsi) {
    var o = opsi || {}, s = o.ukuran || 120;
    var alis = o.alis === "serius"
        ? '<path class="mk-brow" d="M112 112 L156 130" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M288 112 L244 130" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/>'
        : '<path class="mk-brow" d="M120 118 Q138 106 158 114" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/><path class="mk-brow" d="M242 114 Q262 106 280 118" stroke="#3A1F14" stroke-width="6" stroke-linecap="round" fill="none"/>';
    var bintang = o.bintang
        ? '<path class="mk-star" d="M146 166 L149 174 L157 176 L149 179 L146 187 L143 179 L135 176 L143 174Z" fill="#F9A91B"/><path class="mk-star" d="M254 166 L257 174 L265 176 L257 179 L254 187 L251 179 L243 176 L251 174Z" fill="#F9A91B"/>'
        : '';
    return `<svg class="mk mk-${kls}" width="${s}" height="${s}" viewBox="0 0 400 400" aria-hidden="true" focusable="false">` +
        `<ellipse class="mk-shadow" cx="200" cy="389" rx="96" ry="7" fill="#000" opacity=".12"/>` +
        `<g class="mk-hop"><g class="mk-bob">` +
        `<g fill="#F9A91B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"><path d="M148 350 h26 l4 18 q14 4 12 14 q-14 6 -26 0 q-14 6 -30 0 q-4 -10 10 -14 Z"/><path transform="translate(400 0) scale(-1 1)" d="M148 350 h26 l4 18 q14 4 12 14 q-14 6 -26 0 q-14 6 -30 0 q-4 -10 10 -14 Z"/></g>` +
        (o.punggung || '') +
        `<ellipse cx="200" cy="296" rx="90" ry="76" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/>` +
        `<ellipse cx="200" cy="308" rx="54" ry="58" fill="#FDEBD3"/>` +
        `<g fill="none" stroke="#E2B98C" stroke-width="4" stroke-linecap="round"><path d="M168 286 q10 12 20 0"/><path d="M204 286 q10 12 20 0"/><path d="M186 316 q10 12 20 0"/><path d="M168 340 q10 12 20 0"/><path d="M204 340 q10 12 20 0"/></g>` +
        (belakang || '') +
        `<g class="mk-head">` +
        `<path class="mk-tuft-l" d="M88 132 L78 56 Q82 44 94 50 L152 88 L172 102 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>` +
        `<path class="mk-tuft-r" d="M312 132 L322 56 Q318 44 306 50 L248 88 L228 102 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M168 88 Q178 52 204 54 Q226 56 232 72 Q248 72 250 84 Q226 90 218 100 Z" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>` +
        `<ellipse cx="200" cy="168" rx="128" ry="98" fill="#BF6F3D" stroke="#3A1F14" stroke-width="4"/>` +
        `<ellipse cx="146" cy="170" rx="62" ry="68" fill="#FDEBD3"/><ellipse cx="254" cy="170" rx="62" ry="68" fill="#FDEBD3"/><ellipse cx="200" cy="208" rx="88" ry="42" fill="#FDEBD3"/>` +
        `<ellipse cx="108" cy="212" rx="15" ry="10" fill="#F7C9A8"/><ellipse cx="292" cy="212" rx="15" ry="10" fill="#F7C9A8"/>` +
        `<g fill="#FFFBF2" stroke="#1B2A4A" stroke-width="6"><circle cx="146" cy="174" r="44"/><circle cx="254" cy="174" r="44"/></g>` +
        `<path d="M190 172 Q200 166 210 172" stroke="#1B2A4A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M102 166 L92 162 M298 166 L308 162" stroke="#1B2A4A" stroke-width="6" stroke-linecap="round"/>` +
        `<g class="mk-look">` +
        `<g class="mk-iris"><circle cx="148" cy="176" r="23" fill="#5A2E1B"/><circle cx="150" cy="178" r="15" fill="#2B130B"/><circle cx="158" cy="166" r="6" fill="#fff"/></g>` +
        `<g class="mk-iris"><circle cx="256" cy="176" r="23" fill="#5A2E1B"/><circle cx="258" cy="178" r="15" fill="#2B130B"/><circle cx="266" cy="166" r="6" fill="#fff"/></g>` +
        bintang + `</g>` +
        alis +
        `<path d="M184 192 Q200 178 216 192 Q214 216 200 224 Q186 216 184 192Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>` +
        `<path class="mk-mouth" d="M191 200 Q200 210 209 200 Q207 216 200 218 Q193 214 191 200Z" fill="#F5694A"/>` +
        `</g>` +
        (o.tanpaDasi ? '' : `<g class="mk-bow" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round" fill="#1F2E52"><path d="M200 268 L158 248 Q150 270 160 288 Z"/><path d="M200 268 L242 248 Q250 270 240 288 Z"/><rect x="186" y="257" width="28" height="22" rx="6"/></g>`) +
        (depan || '') +
        `</g></g></svg>`;
}

var MASKOT_SAYAP = "#BF6F3D", MASKOT_SAYAP_GELAP = "#9A5128", MASKOT_GARIS = "#3A1F14";
function maskotPercik(rays) {
    return '<g class="mk-sps" fill="none" stroke="#F9A91B" stroke-width="8" stroke-linecap="round">' + rays.map(function (d) { return '<path class="mk-sp" d="' + d + '"/>'; }).join("") + '</g>';
}
function maskotMap(x, y, w, h, warna, label) {
    return '<g class="mk-ars-f"><path d="M' + x + ' ' + (y + 6) + ' q0 -6 6 -6 h14 q4 0 6 4 l3 4 h' + (w - 29) + ' q6 0 6 6 v' + h + ' h-' + w + ' Z" fill="' + warna + '" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
        (label ? '<rect x="' + (x + 8) + '" y="' + (y + 12) + '" width="' + Math.round(w * 0.48) + '" height="6" rx="2" fill="#FDEBD3" opacity=".92"/>' : '') + '</g>';
}

function maskotArsip(size) {
    var isi = '<g class="mk-ars-isi">' + maskotMap(176, 266, 44, 50, "#D94B3F", true) + maskotMap(144, 262, 44, 54, "#FDB827", true) + maskotMap(112, 264, 44, 52, "#5AAE4F", true) + maskotMap(80, 268, 44, 48, "#2E86D6", true) + '</g>';
    var kotak = '<g class="mk-ars-box"><path d="M26 296 L66 312 L96 296 Z" fill="#D8995A" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M62 310 L242 316 L238 372 L66 366 Z" fill="#E3A86B" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M64 312 L240 318 L240 328 L64 322 Z" fill="#B97D43" opacity=".55"/>' +
        '<rect x="150" y="338" width="44" height="11" rx="5.5" fill="#8A5A2B" stroke="#3A1F14" stroke-width="2.5"/></g>';
    var map = '<g class="mk-ars-map"><g transform="translate(-22 -14)"><g transform="rotate(-14 110 270)"><path d="M62 252 q0 -8 8 -8 h30 q5 0 8 5 l4 6 h56 q8 0 8 8 v50 h-114 Z" fill="#1F3A6B" stroke="#0F1A33" stroke-width="4" stroke-linejoin="round"/><rect x="76" y="258" width="38" height="11" rx="3" fill="#FDEBD3"/></g>' +
        '<path d="M150 236 C122 240 100 250 92 264 C86 276 94 288 106 284 L138 270 C154 262 158 248 150 236Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M76 266 q-10 -16 4 -26 q14 -6 26 4 l6 16 q-6 14 -22 16 q-10 0 -14 -10Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M86 246 q8 4 8 14"/><path d="M96 244 q8 6 6 16"/></g></g></g>';
    var kanan = '<g class="mk-ars-wing-r"><path d="M252 244 C284 252 298 286 284 324 C276 346 252 358 228 354 C216 344 224 332 238 328 C252 318 254 300 246 284 Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M262 316 C256 334 242 346 228 354 C252 358 276 346 284 324 C276 324 268 322 262 316Z" fill="' + MASKOT_SAYAP_GELAP + '"/></g>';
    return maskotRangka("ars", isi, kotak + map + kanan + maskotPercik(["M24 124 L48 138", "M34 98 L52 118", "M54 76 L64 104"]), { ukuran: size });
}

function maskotSemangat(size) {
    var lengan = "M146 268 Q62 292 54 212";
    var kiri = '<g class="mk-sem-arm"><path d="' + lengan + '" fill="none" stroke="#3A1F14" stroke-width="46" stroke-linecap="round"/><path d="' + lengan + '" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="38" stroke-linecap="round"/>' +
        '<path d="M70 284 Q110 280 140 266" fill="none" stroke="' + MASKOT_SAYAP_GELAP + '" stroke-width="8" stroke-linecap="round" opacity=".7"/>' +
        '<g class="mk-sem-fist"><path d="M30 196 C24 174 40 158 60 162 C80 166 88 184 82 202 C76 216 58 222 44 214 C36 208 32 204 30 196Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M46 172 Q58 176 60 188"/><path d="M34 196 Q48 194 56 204"/><path d="M42 210 Q56 206 64 210"/></g></g></g>';
    var kanan = '<g class="mk-sem-wing-r"><path d="M252 244 C290 256 308 296 296 332 C290 348 268 348 252 332 C244 300 248 274 246 258 Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/><path d="M262 316 C268 330 280 338 292 336 C298 326 298 316 296 308 C284 314 272 316 262 316Z" fill="' + MASKOT_SAYAP_GELAP + '"/></g>';
    return maskotRangka("sem", "", kanan + kiri + maskotPercik(["M8 150 L30 150", "M14 116 L34 132", "M40 94 L50 120"]), { ukuran: size, alis: "serius" });
}

function maskotKartu(size) {
    var kartu = '<g class="mk-kar-card"><g transform="rotate(-3 96 310)"><rect x="18" y="262" width="158" height="92" rx="10" fill="#1F3A6B" stroke="#0F1A33" stroke-width="4"/>' +
        '<circle cx="62" cy="306" r="23" fill="#FDEBD3"/><circle cx="62" cy="298" r="8" fill="#1F3A6B"/><path d="M44 322 Q62 300 80 322 Q62 330 44 322Z" fill="#1F3A6B"/>' +
        '<rect x="96" y="284" width="56" height="8" rx="4" fill="#FDEBD3"/><rect x="96" y="302" width="36" height="8" rx="4" fill="#FDEBD3"/>' +
        '<rect x="120" y="316" width="42" height="30" rx="4" fill="#FFFBF2"/><g fill="#1F3A6B"><rect x="124" y="320" width="8" height="8"/><rect x="136" y="320" width="6" height="6"/><rect x="148" y="320" width="10" height="8"/><rect x="124" y="332" width="6" height="10"/><rect x="134" y="330" width="10" height="6"/><rect x="148" y="334" width="8" height="8"/></g></g></g>';
    var tangan = '<g class="mk-kar-arm-l"><path d="M146 278 Q90 276 46 266" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="M146 278 Q90 276 46 266" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M34 258 q8 2 10 10"/><path d="M42 252 q8 2 10 12"/></g></g>';
    var kunci = '<g class="mk-kar-key"><rect x="334" y="170" width="12" height="82" rx="5" fill="#F9B91B" stroke="#3A1F14" stroke-width="3.5"/><circle cx="340" cy="140" r="24" fill="#F9B91B" stroke="#3A1F14" stroke-width="4"/><circle cx="340" cy="140" r="11" fill="#FFFBF2" stroke="#3A1F14" stroke-width="3"/>' +
        '<path d="M346 222 h18 v10 h-18 M346 238 h14 v10 h-14" fill="#F9B91B" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/>' +
        '' +
        '<g class="mk-kar-fist"><path d="M318 224 C312 204 326 190 342 192 C358 194 366 210 360 228 C354 242 334 246 324 238 C320 234 320 230 318 224Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M332 202 q10 4 10 14"/><path d="M322 220 q12 -2 20 8"/></g></g></g>';
    var lenganKanan = '<g class="mk-kar-arm-r"><path d="M250 270 Q316 290 336 236" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="M250 270 Q316 290 336 236" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/></g>';
    var kilau = '<path class="mk-star" d="M376 96 L381 110 L395 115 L381 120 L376 134 L371 120 L357 115 L371 110Z" fill="#F9B91B"/>';
    return maskotRangka("kar", "", kartu + tangan + lenganKanan + kunci + kilau, { ukuran: size, bintang: true });
}

function maskotKeagamaan(size) {
    var tangan = '<g transform="translate(%X% 0) scale(%S% 1)"><g class="mk-kag-arm"><path d="M142 272 Q86 292 76 240" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="M142 272 Q86 292 76 240" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<path d="M50 236 C44 214 54 196 66 204 C70 190 86 190 90 204 C100 198 112 212 104 228 C102 246 86 256 70 252 C58 250 52 244 50 236Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M66 206 q2 10 0 20"/><path d="M88 206 q-2 10 0 20"/></g></g></g>';
    var kiri = tangan.replace("%X%", "0").replace("%S%", "1"), kanan = tangan.replace("%X%", "400").replace("%S%", "-1");
    var rehal = '<g class="mk-kag-rehal"><path d="M112 388 L288 326" stroke="#3A1F14" stroke-width="26" stroke-linecap="round"/><path d="M288 388 L112 326" stroke="#3A1F14" stroke-width="26" stroke-linecap="round"/>' +
        '<path d="M112 388 L288 326" stroke="#A9692F" stroke-width="18" stroke-linecap="round"/><path d="M288 388 L112 326" stroke="#C07B3A" stroke-width="18" stroke-linecap="round"/></g>';
    var buku = '<g class="mk-kag-book"><path d="M122 354 L282 354 L284 366 L120 366 Z" fill="#FDEBD3" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M142 298 L262 298 L282 354 L122 354 Z" fill="#1F4D3A" stroke="#0F2A20" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M150 306 L254 306 L270 346 L134 346 Z" fill="none" stroke="#E2B13C" stroke-width="3" stroke-linejoin="round"/>' +
        '<g class="mk-kag-star" fill="none" stroke="#E2B13C" stroke-width="3" stroke-linejoin="round"><rect x="188" y="311" width="28" height="28" transform="rotate(0 202 325)"/><rect x="188" y="311" width="28" height="28" transform="rotate(45 202 325)"/><circle cx="202" cy="325" r="7"/></g></g>';
    return maskotRangka("kag", "", kiri + kanan + rehal + buku, { ukuran: size });
}

function maskotLaporan(size) {
    var bar = function (x, h, w) { return '<rect class="mk-lap-bar" x="' + x + '" y="' + (338 - h) + '" width="22" height="' + h + '" rx="2" fill="' + w + '"/>'; };
    var papan = '<g class="mk-lap-board"><g transform="rotate(-2 96 305)"><rect x="18" y="226" width="158" height="134" rx="10" fill="#FDEBD3" stroke="#1B2A4A" stroke-width="5"/>' +
        bar(38, 30, "#2E86D6") + bar(66, 52, "#5AAE4F") + bar(94, 74, "#FDB827") + bar(122, 96, "#F5821F") +
        '<path d="M30 338 H156" stroke="#1B2A4A" stroke-width="4" stroke-linecap="round"/>' +
        '<path class="mk-lap-trend" pathLength="1" d="M34 296 Q96 288 150 244 M150 244 L136 246 M150 244 L148 258" fill="none" stroke="#1B2A4A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g></g>';
    var lenganKiri = '<g class="mk-lap-arm-l"><path d="M146 286 Q90 304 30 304" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="M146 286 Q90 304 30 304" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/></g>';
    var jari = '<g fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"><path d="M18 286 q-8 4 -6 14 q2 10 14 12 l4 -22 Z"/></g><g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M16 292 q6 2 8 8"/></g>';
    var tongkat = '<g class="mk-lap-pointer"><path d="M268 306 L172 244" stroke="#3A1F14" stroke-width="10" stroke-linecap="round"/><path d="M268 306 L172 244" stroke="#8A5226" stroke-width="5" stroke-linecap="round"/></g>';
    var kanan = '<g class="mk-lap-arm-r"><path d="M254 272 Q282 296 270 312" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="M254 272 Q282 296 270 312" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M262 316 q8 -2 14 4"/></g></g>';
    return maskotRangka("lap", "", lenganKiri + papan + jari + tongkat + kanan, { ukuran: size });
}

function maskotNotifikasi(size) {
    var lenganKiri = "M146 268 Q50 304 52 196";
    var lonceng = '<g class="mk-not-bell"><rect x="47" y="112" width="10" height="52" rx="4" fill="#F9B91B" stroke="#3A1F14" stroke-width="3.5"/><circle cx="52" cy="112" r="8" fill="#F9B91B" stroke="#3A1F14" stroke-width="3.5"/>' +
        '<path d="M22 100 C22 68 32 46 52 46 C72 46 82 68 82 100 L94 108 H10 Z" fill="#FDB827" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M32 98 C32 74 38 58 48 56" fill="none" stroke="#FFF1B8" stroke-width="5" stroke-linecap="round" opacity=".8"/><circle cx="52" cy="40" r="7" fill="#E5383B" stroke="#3A1F14" stroke-width="3"/></g>';
    var kiri = '<g class="mk-not-arm"><path d="' + lenganKiri + '" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="' + lenganKiri + '" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<path d="M26 150 C22 134 34 124 50 128 C66 132 76 146 70 164 C64 176 46 180 36 172 C30 166 28 158 26 150Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M38 134 q8 4 8 14"/><path d="M30 154 q10 -2 18 6"/></g></g>';
    var lenganKanan = "M254 268 Q338 292 346 222";
    var kanan = '<g class="mk-not-arm-r"><path d="' + lenganKanan + '" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="' + lenganKanan + '" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<path d="M322 204 C318 184 332 168 350 172 C368 176 374 194 368 212 C362 226 342 232 330 224 C324 220 324 212 322 204Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M340 182 q10 4 10 16"/><path d="M328 206 q12 -2 20 8"/></g></g>';
    var suara = maskotPercik(["M12 62 Q4 80 12 98", "M96 62 Q104 80 96 98", "M2 50 Q-10 80 2 108"]);
    return maskotRangka("not", "", kiri.replace(/^/, "") + lonceng + kanan + suara, { ukuran: size, alis: "serius" });
}

function maskotPembinaan(size) {
    var gelembung = '<g class="mk-pbn-bubble"><path d="M62 40 C34 40 20 60 20 80 C20 102 38 118 62 118 L86 130 L80 114 C96 108 104 94 104 80 C104 58 88 40 62 40Z" fill="#FDEBD3" stroke="#3A1F14" stroke-width="4" stroke-linejoin="round"/>' +
        '<path class="mk-pbn-heart" d="M62 98 C38 82 42 62 54 62 C59 62 62 66 62 70 C62 66 65 62 70 62 C82 62 86 82 62 98Z" fill="#E5383B"/></g>';
    var terbuka = "M146 274 Q96 290 52 270";
    var kiri = '<g class="mk-pbn-arm"><path d="' + terbuka + '" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="' + terbuka + '" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<path d="M50 252 C34 244 16 252 8 264 C14 266 18 268 20 272 C24 270 28 272 30 276 C34 274 38 276 42 282 C54 282 62 270 60 258 Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M20 266 q8 -2 14 2"/><path d="M30 274 q6 -2 12 2"/></g></g>';
    var dada = "M262 272 Q276 308 224 302";
    var kanan = '<g class="mk-pbn-chest"><path d="' + dada + '" fill="none" stroke="#3A1F14" stroke-width="40" stroke-linecap="round"/><path d="' + dada + '" fill="none" stroke="' + MASKOT_SAYAP + '" stroke-width="32" stroke-linecap="round"/>' +
        '<path d="M194 290 C194 276 210 270 224 276 C238 282 240 300 230 308 C218 316 198 310 194 298Z" fill="' + MASKOT_SAYAP + '" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="#3A1F14" stroke-width="3" stroke-linecap="round"><path d="M208 282 q6 6 4 16"/><path d="M220 282 q6 6 4 18"/></g></g>';
    return maskotRangka("pbn", "", gelembung + kiri + kanan, { ukuran: size });
}

function maskotProfil(size) {
    var G = MASKOT_GARIS, S = MASKOT_SAYAP;
    var kiri = '<g class="mk-pro-arm-l">' +
        '<path d="M150 276 Q104 290 84 312" fill="none" stroke="' + G + '" stroke-width="40" stroke-linecap="round"/>' +
        '<path d="M150 276 Q104 290 84 312" fill="none" stroke="' + S + '" stroke-width="32" stroke-linecap="round"/>' +
        '<path d="M110 300 Q98 306 86 312" fill="none" stroke="' + MASKOT_SAYAP_GELAP + '" stroke-width="8" stroke-linecap="round" opacity=".6"/>' +
        '<g class="mk-pro-lens">' +
        '<path d="M100 282 L78 308" stroke="#0F1A33" stroke-width="15" stroke-linecap="round"/><path d="M100 282 L78 308" stroke="#1F2E52" stroke-width="9" stroke-linecap="round"/>' +
        '<circle cx="128" cy="254" r="41" fill="#0F1A33"/><circle cx="128" cy="254" r="38" fill="#1F2E52"/>' +
        '<circle cx="128" cy="254" r="31" fill="#D9EEFB"/>' +
        '<path d="M142 232 A31 31 0 0 1 159 262 L145 258 Z" fill="#B9DDF3" opacity=".7"/>' +
        '<g class="mk-pro-glint"><path d="M106 246 Q109 232 123 228" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="108" cy="262" r="3.5" fill="#fff"/></g>' +
        '</g>' +
        '<path d="M54 312 C50 294 68 286 86 290 C104 294 110 312 102 328 C94 340 70 340 60 330 C56 326 55 320 54 312Z" fill="' + S + '" stroke="' + G + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="' + G + '" stroke-width="3" stroke-linecap="round"><path d="M70 296 q10 4 10 16"/><path d="M60 318 q12 -2 20 8"/></g>' +
        '</g>';
    var kartu = '<g class="mk-pro-card">' +
        '<path d="M270 352 Q330 366 352 330" fill="none" stroke="' + G + '" stroke-width="40" stroke-linecap="round"/>' +
        '<path d="M270 352 Q330 366 352 330" fill="none" stroke="' + S + '" stroke-width="32" stroke-linecap="round"/>' +
        '<g transform="rotate(3 300 306)">' +
        '<rect x="244" y="239" width="112" height="134" rx="11" fill="#FDEBD3" stroke="#1B2A4A" stroke-width="5"/>' +
        '<circle class="mk-pro-ava" cx="300" cy="275" r="15" fill="#2A3C63"/>' +
        '<path class="mk-pro-ava" d="M274 315 Q274 293 300 293 Q326 293 326 315 Z" fill="#2A3C63"/>' +
        '<rect class="mk-pro-line mk-pro-l1" x="259" y="320" width="82" height="6" rx="3" fill="#2A3C63"/>' +
        '<rect class="mk-pro-line mk-pro-l2" x="259" y="333" width="84" height="6" rx="3" fill="#2A3C63"/>' +
        '<rect class="mk-pro-line mk-pro-l3" x="259" y="346" width="54" height="6" rx="3" fill="#2A3C63"/>' +
        '</g>' +
        '<path d="M332 330 C326 310 340 296 356 298 C372 300 380 316 374 334 C368 348 348 352 338 344 C334 340 334 336 332 330Z" fill="' + S + '" stroke="' + G + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<g fill="none" stroke="' + G + '" stroke-width="3" stroke-linecap="round"><path d="M346 308 q10 4 10 14"/><path d="M336 330 q12 -2 20 8"/></g>' +
        '</g>';
    var kilat = maskotPercik(["M356 140 L368 112", "M366 158 L390 140", "M370 180 L394 176"]);
    return maskotRangka("pro", "", kiri + kartu + kilat, { ukuran: size, bintang: true });
}

function maskotGuru(size) {
    var G = MASKOT_GARIS, S = MASKOT_SAYAP, B = "#1E3A8A", BG = "#0F1A33";
    var badan =
        '<ellipse cx="200" cy="296" rx="90" ry="76" fill="' + B + '" stroke="' + G + '" stroke-width="4"/>' +
        '<path d="M168 244 L232 244 L200 324 Z" fill="#FFFFFF" stroke="' + G + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M170 258 L200 282 L182 296 Z" fill="#F1F5F9" stroke="' + G + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M230 258 L200 282 L218 296 Z" fill="#F1F5F9" stroke="' + G + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M146 244 L170 244 L200 324 L168 348 Z" fill="#172554" stroke="' + BG + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M254 244 L230 244 L200 324 L232 348 Z" fill="#172554" stroke="' + BG + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<g class="mk-gur-tie">' +
        '<path d="M193 276 L207 276 L205 288 L195 288 Z" fill="#B45309" stroke="' + G + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M195 288 L205 288 L214 336 L200 354 L186 336 Z" fill="#D97706" stroke="' + G + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M194 306 L206 301 M192 320 L208 314" stroke="#FCD34D" stroke-width="3" stroke-linecap="round"/></g>' +
        '<circle cx="200" cy="364" r="3.5" fill="#FCD34D" stroke="' + G + '" stroke-width="2"/>' +
        '<path d="M132 322 L158 324" stroke="' + BG + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M138 322 L146 311 L154 323 Z" fill="#FFFFFF" stroke="' + G + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<g class="mk-gur-badge"><rect x="240" y="318" width="36" height="16" rx="3" fill="#FFFFFF" stroke="' + G + '" stroke-width="2"/>' +
        '<text x="258" y="330" font-family="Arial, sans-serif" font-size="10" font-weight="700" text-anchor="middle" fill="' + B + '">GURU</text></g>';
    var kiri =
        '<g class="mk-gur-arm-l">' +
        '<path d="M146 284 Q104 296 84 262" fill="none" stroke="' + BG + '" stroke-width="40" stroke-linecap="round"/>' +
        '<path d="M146 284 Q104 296 84 262" fill="none" stroke="' + B + '" stroke-width="32" stroke-linecap="round"/>' +
        '<g class="mk-gur-ptr"><path d="M84 250 L40 118" stroke="' + G + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M84 250 L40 118" stroke="#C2873E" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="40" cy="118" r="5.5" fill="#DC2626" stroke="' + G + '" stroke-width="2"/></g>' +
        '<ellipse cx="84" cy="250" rx="21" ry="19" fill="' + S + '" stroke="' + G + '" stroke-width="4"/>' +
        '<g fill="none" stroke="' + G + '" stroke-width="3" stroke-linecap="round"><path d="M72 242 q8 2 10 10"/><path d="M82 238 q8 2 8 12"/></g></g>';
    var kanan =
        '<g class="mk-gur-arm-r">' +
        '<path d="M254 284 Q300 300 290 336" fill="none" stroke="' + BG + '" stroke-width="40" stroke-linecap="round"/>' +
        '<path d="M254 284 Q300 300 290 336" fill="none" stroke="' + B + '" stroke-width="32" stroke-linecap="round"/>' +
        '<g class="mk-gur-clip"><g transform="translate(326 322) rotate(12)">' +
        '<rect x="-30" y="-40" width="60" height="80" rx="5" fill="#2B4A82" stroke="' + BG + '" stroke-width="3"/>' +
        '<rect x="-24" y="-32" width="48" height="68" rx="2" fill="#FFFBF2"/>' +
        '<rect x="-12" y="-46" width="24" height="12" rx="3" fill="#9AA3B5" stroke="' + BG + '" stroke-width="2.5"/>' +
        '<rect x="-19" y="-22" width="10" height="10" rx="2" fill="#fff" stroke="#2B4A82" stroke-width="2"/>' +
        '<path class="mk-gur-check" d="M-17 -17 l3 3.5 l5 -7" fill="none" stroke="#16A34A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M-4 -17 H18" stroke="#5A7BB5" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="-19" y="-4" width="10" height="10" rx="2" fill="#fff" stroke="#2B4A82" stroke-width="2"/>' +
        '<path d="M-4 1 H18" stroke="#5A7BB5" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="-19" y="14" width="10" height="10" rx="2" fill="#fff" stroke="#2B4A82" stroke-width="2"/>' +
        '<path d="M-4 19 H12" stroke="#5A7BB5" stroke-width="3" stroke-linecap="round"/></g></g>' +
        '<ellipse cx="292" cy="338" rx="20" ry="18" fill="' + S + '" stroke="' + G + '" stroke-width="4"/>' +
        '<g fill="none" stroke="' + G + '" stroke-width="3" stroke-linecap="round"><path d="M284 326 q8 2 8 12"/><path d="M296 328 q6 4 4 12"/></g></g>';
    return maskotRangka("gur", badan, kiri + kanan, { ukuran: size, tanpaDasi: true });
}

function maskotSiswa(size) {
    var G = MASKOT_GARIS, S = MASKOT_SAYAP, BG = "#0F1A33";
    var punggung =
        '<g class="mk-sis-pack">' +
        '<rect x="92" y="236" width="216" height="118" rx="38" fill="#D97706" stroke="' + G + '" stroke-width="4"/>' +
        '<path d="M178 240 Q200 220 222 240" fill="none" stroke="' + G + '" stroke-width="6" stroke-linecap="round"/>' +
        '<rect x="82" y="290" width="28" height="48" rx="10" fill="#B45309" stroke="' + G + '" stroke-width="3"/>' +
        '<rect x="290" y="290" width="28" height="48" rx="10" fill="#B45309" stroke="' + G + '" stroke-width="3"/></g>';
    var badan =
        '<ellipse cx="200" cy="296" rx="90" ry="76" fill="#FFFFFF" stroke="' + G + '" stroke-width="4"/>' +
        '<path d="M123.5 336 A90 76 0 0 0 276.5 336 Z" fill="#2563EB" stroke="' + G + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<path d="M200 296 L200 336" stroke="#CBD5E1" stroke-width="2.5"/>' +
        '<circle cx="200" cy="312" r="3" fill="#94A3B8"/><circle cx="200" cy="328" r="3" fill="#94A3B8"/>' +
        '<rect x="190" y="334" width="20" height="8" rx="2" fill="#FCD34D" stroke="' + G + '" stroke-width="2"/>' +
        '<path d="M170 258 L200 282 L180 296 Z" fill="#E2E8F0" stroke="' + G + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M230 258 L200 282 L220 296 Z" fill="#E2E8F0" stroke="' + G + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<g class="mk-sis-tie"><path d="M193 282 L207 282 L205 292 L195 292 Z" fill="#B91C1C" stroke="' + G + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M195 292 L205 292 L211 318 L200 328 L189 318 Z" fill="#DC2626" stroke="' + G + '" stroke-width="2.5" stroke-linejoin="round"/></g>' +
        '<path d="M152 258 Q138 300 150 340" fill="none" stroke="' + G + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M152 258 Q138 300 150 340" fill="none" stroke="#D97706" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M248 258 Q262 300 250 340" fill="none" stroke="' + G + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M248 258 Q262 300 250 340" fill="none" stroke="#D97706" stroke-width="8" stroke-linecap="round"/>';
    var kiri =
        '<g class="mk-sis-arm-l">' +
        '<g class="mk-sis-book"><g transform="translate(110 334) rotate(-8)">' +
        '<rect x="-26" y="-34" width="52" height="68" rx="4" fill="#1E3A8A" stroke="' + BG + '" stroke-width="3"/>' +
        '<rect x="-18" y="-24" width="36" height="14" rx="2" fill="#FFFBF2"/>' +
        '<path d="M-18 6 H18 M-18 16 H8" stroke="#93C5FD" stroke-width="3" stroke-linecap="round"/></g></g>' +
        '<path d="M146 282 Q106 296 126 340" fill="none" stroke="' + G + '" stroke-width="38" stroke-linecap="round"/>' +
        '<path d="M146 282 Q106 296 126 340" fill="none" stroke="' + S + '" stroke-width="30" stroke-linecap="round"/>' +
        '<ellipse cx="150" cy="282" rx="22" ry="20" fill="#FFFFFF" stroke="' + G + '" stroke-width="3"/>' +
        '<ellipse cx="132" cy="342" rx="18" ry="16" fill="' + S + '" stroke="' + G + '" stroke-width="3.5"/>' +
        '<g fill="none" stroke="' + G + '" stroke-width="3" stroke-linecap="round"><path d="M124 334 q6 2 8 10"/></g></g>';
    var kanan =
        '<g class="mk-sis-arm">' +
        '<path d="M254 282 Q322 282 324 204" fill="none" stroke="' + G + '" stroke-width="38" stroke-linecap="round"/>' +
        '<path d="M254 282 Q322 282 324 204" fill="none" stroke="' + S + '" stroke-width="30" stroke-linecap="round"/>' +
        '<ellipse cx="256" cy="282" rx="22" ry="20" fill="#FFFFFF" stroke="' + G + '" stroke-width="3"/>' +
        '<g class="mk-sis-hand">' +
        '<rect x="306" y="150" width="11" height="30" rx="5.5" fill="' + S + '" stroke="' + G + '" stroke-width="3"/>' +
        '<rect x="319" y="142" width="11" height="34" rx="5.5" fill="' + S + '" stroke="' + G + '" stroke-width="3"/>' +
        '<rect x="332" y="150" width="11" height="30" rx="5.5" fill="' + S + '" stroke="' + G + '" stroke-width="3"/>' +
        '<ellipse cx="325" cy="190" rx="23" ry="24" fill="' + S + '" stroke="' + G + '" stroke-width="3.5"/></g></g>';
    return maskotRangka("sis", badan, kiri + kanan, { ukuran: size, tanpaDasi: true, punggung: punggung });
}

var MASKOT_POSE = { kebiasaan: maskotKebiasaan, akademik: maskotAkademik, jurnal: maskotJurnal, presensi: maskotPresensi, tatib: maskotTatib, biasa: maskotBiasa, piala: maskotPiala, pengingat: maskotPengingat, ceria: maskotCeria, admin: maskotAdmin, arsip: maskotArsip, semangat: maskotSemangat, kartu: maskotKartu, keagamaan: maskotKeagamaan, laporan: maskotLaporan, notifikasi: maskotNotifikasi, pembinaan: maskotPembinaan, profil: maskotProfil, guru: maskotGuru, siswa: maskotSiswa };

function maskot(pose, ukuran) {
    return (MASKOT_POSE[pose] || maskotKebiasaan)(ukuran);
}

function maskotKosong(teks, ukuran, pose) {
    return '<div class="empty-state">' + maskot(pose, ukuran || 96) + '<p class="text-xs text-slate-500">' + maskotAman(teks) + '</p></div>';
}

function maskotAlert(judul, teks, pose) {
    if (typeof Swal === "undefined") return Promise.resolve();
    return Swal.fire({
        title: maskotAman(judul),
        html: maskot(pose, 120) + '<p class="text-xs text-slate-500 mt-1">' + maskotAman(teks) + '</p>',
        confirmButtonColor: "#2563eb"
    });
}

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

function maskotGerakDiam() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

var MASKOT_DURASI = { spin: 800, nod: 900, flap: 700, tilt: 1300, wink: 700, pusing: 1500, menguap: 2100, menoleh: 2600, meregang: 1500, kedip: 1900 };
var MASKOT_REAKSI = ["hop", "spin", "nod", "flap", "tilt", "wink"];
var maskotKlikRiwayat = { n: 0, t: 0, terakhir: "" };

function maskotBersihkan(svg) {
    Array.prototype.slice.call(svg.classList).forEach(function (k) {
        if (k.indexOf("mk-rx-") === 0 || k.indexOf("mk-id-") === 0) svg.classList.remove(k);
    });
    clearTimeout(svg._mkTimer);
}

function maskotMainkan(svg, awalan, nama) {
    maskotBersihkan(svg);
    void svg.getBoundingClientRect();
    svg.classList.add(awalan + nama);
    svg._mkTimer = setTimeout(function () { svg.classList.remove(awalan + nama); }, MASKOT_DURASI[nama] || 1000);
}

function maskotLompat(svg) {
    var hop = svg.querySelector(".mk-hop, .mk-o-hop, .mk-t-hop, .mk-r-hop, .mk-c-hop");
    if (!hop) return false;
    hop.classList.remove("go");
    void hop.getBoundingClientRect();
    hop.classList.add("go");
    hop.addEventListener("animationend", function () { hop.classList.remove("go"); }, { once: true });
    return true;
}

document.addEventListener("click", function (e) {
    var svg = e.target.closest && e.target.closest(".mk");
    if (!svg || maskotGerakDiam()) return;
    var r = maskotKlikRiwayat, now = Date.now();
    r.n = (now - r.t < 700) ? r.n + 1 : 1;
    r.t = now;
    maskotBersihkan(svg);
    svg.classList.remove("mk-track");
    var lk = svg.querySelector(".mk-look, .mk-o-look");
    if (lk) lk.style.transform = "";
    if (r.n >= 5) {
        r.n = 0;
        r.terakhir = "pusing";
        maskotMainkan(svg, "mk-rx-", "pusing");
        return;
    }
    var pilihan = MASKOT_REAKSI.filter(function (x) { return x !== r.terakhir; });
    var nama = pilihan[Math.floor(Math.random() * pilihan.length)];
    r.terakhir = nama;
    if (nama === "hop") { if (!maskotLompat(svg)) maskotMainkan(svg, "mk-rx-", "spin"); }
    else maskotMainkan(svg, "mk-rx-", nama);
});

var MASKOT_ISENG = ["menguap", "menoleh", "meregang", "kedip"];
function maskotTerlihat() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return Array.prototype.filter.call(document.querySelectorAll("svg.mk"), function (svg) {
        var b = svg.getBoundingClientRect();
        return b.width >= 40 && b.height >= 40 && b.bottom > 0 && b.top < vh &&
            !svg.classList.contains("mk-track") && !/(^|\s)mk-(rx|id)-/.test(svg.getAttribute("class") || "");
    });
}
function maskotJadwalIseng() {
    setTimeout(function () {
        if (!document.hidden && !maskotGerakDiam()) {
            var daftar = maskotTerlihat();
            if (daftar.length) {
                var svg = daftar[Math.floor(Math.random() * daftar.length)];
                maskotMainkan(svg, "mk-id-", MASKOT_ISENG[Math.floor(Math.random() * MASKOT_ISENG.length)]);
            }
        }
        maskotJadwalIseng();
    }, 10000 + Math.random() * 20000);
}

var maskotLacak = { x: 0, y: 0, rafId: 0, timer: 0 };
function maskotArahMata() {
    maskotLacak.rafId = 0;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    Array.prototype.forEach.call(document.querySelectorAll("svg.mk"), function (svg) {
        var b = svg.getBoundingClientRect();
        if (b.width < 40 || b.bottom < 0 || b.top > vh) return;
        if (/(^|\s)mk-(rx|id)-/.test(svg.getAttribute("class") || "")) return;
        var look = svg.querySelector(".mk-look, .mk-o-look");
        if (!look) return;
        var dx = maskotLacak.x - (b.left + b.width / 2), dy = maskotLacak.y - (b.top + b.height * 0.42);
        var jarak = Math.sqrt(dx * dx + dy * dy) || 1, kuat = Math.min(1, jarak / 160);
        look.style.transform = "translate(" + (dx / jarak * 7 * kuat).toFixed(1) + "px," + (dy / jarak * 5 * kuat).toFixed(1) + "px)";
        svg.classList.add("mk-track");
    });
    clearTimeout(maskotLacak.timer);
    maskotLacak.timer = setTimeout(function () {
        Array.prototype.forEach.call(document.querySelectorAll("svg.mk-track"), function (svg) {
            svg.classList.remove("mk-track");
            var look = svg.querySelector(".mk-look, .mk-o-look");
            if (look) look.style.transform = "";
        });
    }, 2500);
}
function maskotPantau(e) {
    if (maskotGerakDiam()) return;
    maskotLacak.x = e.clientX;
    maskotLacak.y = e.clientY;
    if (!maskotLacak.rafId) maskotLacak.rafId = requestAnimationFrame(maskotArahMata);
}
document.addEventListener("pointermove", maskotPantau, { passive: true });
document.addEventListener("pointerdown", maskotPantau, { passive: true });
maskotJadwalIseng();

var maskotUcapTerakhir = "";
try { maskotUcapTerakhir = sessionStorage.getItem("mk_ucap_terakhir") || ""; } catch (e) { }

function maskotUcapBobot(c) {
    var b = Number(c.bobot);
    return b > 0 ? b : 1;
}

function maskotUcapPilih(kandidat) {
    var daftar = (kandidat || []).filter(function (c) { return c && c.teks; });
    if (!daftar.length) return null;
    var kolam = daftar.filter(function (c) { return c.kunci !== maskotUcapTerakhir; });
    if (!kolam.length) kolam = daftar;
    var total = kolam.reduce(function (a, c) { return a + maskotUcapBobot(c); }, 0);
    var r = Math.random() * total, dipilih = kolam[kolam.length - 1];
    for (var i = 0; i < kolam.length; i++) {
        r -= maskotUcapBobot(kolam[i]);
        if (r <= 0) { dipilih = kolam[i]; break; }
    }
    maskotUcapTerakhir = dipilih.kunci || "";
    try { sessionStorage.setItem("mk_ucap_terakhir", maskotUcapTerakhir); } catch (e) { }
    return dipilih;
}

function maskotUcapHtml(u, ukuran) {
    var aksi = "";
    if (u.view) aksi = ' data-mk-ucap-buka="' + maskotAman(u.view) + '"';
    else if (u.profil) aksi = ' data-mk-ucap-profil="' + maskotAman(u.profil) + '"';
    else if (u.notif) aksi = ' data-mk-ucap-notif="1"';
    if (aksi) aksi += ' role="button" tabindex="0"';
    var tingkat = /^(kritis|sedang|rendah|baik)$/.test(u.tingkat || "") ? ' data-tingkat="' + u.tingkat + '"' : "";
    var angka = (u.angka !== undefined && u.angka !== null && u.angka !== "") ? '<span class="mk-ucap-angka">' + maskotAman(u.angka) + '</span>' : "";
    return '<div class="mk-ucap-wrap">' +
        '<div class="mk-ucap-mk">' + maskot(u.pose || "ceria", ukuran || 64) + '</div>' +
        '<div class="mk-ucap"' + tingkat + aksi + '>' +
        angka + '<span class="mk-ucap-teks">' + maskotAman(u.teks) + '</span>' +
        '<button type="button" class="mk-ucap-tutup" data-mk-ucap-tutup aria-label="Tutup gelembung">&times;</button>' +
        '</div></div>';
}

function maskotUcapPasang(wadah, kandidat, ukuran) {
    if (!wadah) return null;
    var u = maskotUcapPilih(kandidat);
    wadah.innerHTML = u ? maskotUcapHtml(u, ukuran) : "";
    return u;
}

function maskotUcapPutar(wadah, ambil, ukuran, jeda) {
    if (!wadah) return null;
    var ctl = { mati: false }, timer = 0, kunciKini = "", teksKini = "", pernah = false, jedaMs = jeda || 7000;
    function daftar() {
        var d = [];
        try { d = (typeof ambil === "function" ? ambil() : ambil) || []; } catch (e) { d = []; }
        return d.filter(function (c) { return c && c.teks; })
            .sort(function (a, b) { return maskotUcapBobot(b) - maskotUcapBobot(a); });
    }
    function giliran() {
        clearTimeout(timer);
        if (ctl.mati) return;
        if (!document.body.contains(wadah) || (pernah && !wadah.querySelector(".mk-ucap-wrap"))) { ctl.mati = true; return; }
        if (!document.hidden) {
            var d = daftar();
            if (!d.length) {
                wadah.innerHTML = "";
                pernah = false; kunciKini = ""; teksKini = "";
            } else {
                var i = -1;
                for (var k = 0; k < d.length; k++) { if (d[k].kunci === kunciKini) { i = k; break; } }
                var pilih = d[(i + 1) % d.length];
                if (d.length === 1 && pilih.kunci === kunciKini) {
                    if (pilih.teks !== teksKini && wadah.querySelector(".mk-ucap-wrap")) {  } else pilih = null;
                }
                if (pilih) {
                    wadah.innerHTML = maskotUcapHtml(pilih, ukuran);
                    pernah = true; kunciKini = pilih.kunci || ""; teksKini = pilih.teks;
                    var svg = wadah.querySelector("svg.mk");
                    if (svg && !maskotGerakDiam()) {
                        maskotMainkan(svg, "mk-rx-", pilih.tingkat === "kritis" ? "flap" : pilih.tingkat === "baik" ? "nod" : "tilt");
                    }
                }
            }
        }
        timer = setTimeout(giliran, jedaMs);
    }
    ctl.berhenti = function () { ctl.mati = true; clearTimeout(timer); };
    ctl.segarkan = giliran;
    giliran();
    return ctl;
}

function maskotUcapAksiBaru(e) {
    if (!e.target.closest) return;
    if (e.target.closest("[data-mk-ucap-tutup]")) return;
    var p = e.target.closest("[data-mk-ucap-profil]");
    if (p) { if (typeof openProfilSiswa === "function") openProfilSiswa(p.getAttribute("data-mk-ucap-profil")); return; }
    var n = e.target.closest("[data-mk-ucap-notif]");
    if (n && typeof openNotificationModal === "function") openNotificationModal();
}
document.addEventListener("click", maskotUcapAksiBaru);
document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest && e.target.closest("[data-mk-ucap-profil],[data-mk-ucap-notif]");
    if (el && e.target === el) { e.preventDefault(); maskotUcapAksiBaru(e); }
});

document.addEventListener("click", function (e) {
    var tutup = e.target.closest && e.target.closest("[data-mk-ucap-tutup]");
    if (tutup) {
        var w = tutup.closest(".mk-ucap-wrap");
        if (w) {
            w.classList.add("mk-ucap-keluar");
            setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 200);
        }
        e.stopPropagation();
        return;
    }
    var buka = e.target.closest && e.target.closest("[data-mk-ucap-buka]");
    if (buka && typeof switchView === "function") switchView(buka.getAttribute("data-mk-ucap-buka"));
});
document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var buka = e.target.closest && e.target.closest("[data-mk-ucap-buka]");
    if (buka && e.target === buka && typeof switchView === "function") {
        e.preventDefault();
        switchView(buka.getAttribute("data-mk-ucap-buka"));
    }
});

var MASKOT_NGANTUK = { dari: 21, sampai: 4 };
var MASKOT_AGUSTUS = { bulan: 8, dari: 10, sampai: 20 };
var MASKOT_KELULUSAN = { bulan: 6, dari: 1, sampai: 25 };
var maskotKonteksCache = { menit: -1, nilai: null };

function maskotWaktuWITA(tgl) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Makassar", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", hourCycle: "h23" })
        .formatToParts(tgl || new Date()).forEach(function (x) { p[x.type] = parseInt(x.value, 10); });
    return { jam: p.hour % 24, bulan: p.month, hari: p.day };
}

function maskotRamadan(tgl) {
    try {
        var m = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { timeZone: "Asia/Makassar", month: "numeric" })
            .formatToParts(tgl || new Date()).filter(function (x) { return x.type === "month"; })[0];
        return !!m && parseInt(m.value, 10) === 9;
    } catch (e) { return false; }
}

function maskotHitungKonteks(tgl) {
    var w = maskotWaktuWITA(tgl), k = { ngantuk: w.jam >= MASKOT_NGANTUK.dari || w.jam < MASKOT_NGANTUK.sampai, hari: "" };
    if (maskotRamadan(tgl)) k.hari = "ramadan";
    else if (w.bulan === MASKOT_AGUSTUS.bulan && w.hari >= MASKOT_AGUSTUS.dari && w.hari <= MASKOT_AGUSTUS.sampai) k.hari = "agustus";
    else if (w.bulan === MASKOT_KELULUSAN.bulan && w.hari >= MASKOT_KELULUSAN.dari && w.hari <= MASKOT_KELULUSAN.sampai) k.hari = "lulus";
    return k;
}

function maskotKonteks() {
    var uji = "";
    try { uji = new URLSearchParams(location.search).get("mk") || ""; } catch (e) { }
    var menit = Math.floor(Date.now() / 60000);
    if (!uji && maskotKonteksCache.menit === menit) return maskotKonteksCache.nilai;
    var k = maskotHitungKonteks();
    if (uji) {
        var u = uji.toLowerCase().split(",");
        if (u.indexOf("malam") >= 0) k.ngantuk = true;
        ["ramadan", "agustus", "lulus"].forEach(function (h) { if (u.indexOf(h) >= 0) k.hari = h; });
    }
    maskotKonteksCache = { menit: menit, nilai: k };
    return k;
}

function maskotAngka(n) { return (Math.round(n * 10) / 10).toString(); }
function maskotTitikKurva(g, d0, d1, ofs, n) {
    var pts = [];
    for (var i = 0; i <= n; i++) {
        var dx = d0 + (d1 - d0) * i / n;
        pts.push([g.cx + dx * g.rx, g.cy - g.ry * Math.sqrt(Math.max(0, 1 - dx * dx)) + ofs * g.ry]);
    }
    return pts;
}
function maskotJalur(pts, awal) {
    return pts.map(function (p, i) { return (i ? "L" : awal) + maskotAngka(p[0]) + " " + maskotAngka(p[1]); }).join("");
}
function maskotPita(g, d0, d1, a, b) {
    return maskotJalur(maskotTitikKurva(g, d0, d1, a, 14), "M") + maskotJalur(maskotTitikKurva(g, d1, d0, b, 14), "L") + "Z";
}

var MASKOT_PETA_TOPI = {
    ramadan: function (g) {
        var X = function (dx) { return g.cx + dx * g.rx; }, T = g.cy - g.ry, Y = function (dy) { return T + dy * g.ry; };
        var yPangkal = function (dx) { return g.cy - g.ry * Math.sqrt(1 - dx * dx) + 0.16 * g.ry; };
        var yt = yPangkal(0.5), tengah = yPangkal(0);
        var kendali = 2 * tengah - yt;
        var badan = "M" + maskotAngka(X(-0.5)) + " " + maskotAngka(yt) +
            "L" + maskotAngka(X(-0.42)) + " " + maskotAngka(Y(-0.42)) +
            "Q" + maskotAngka(X(0)) + " " + maskotAngka(Y(-0.5)) + " " + maskotAngka(X(0.42)) + " " + maskotAngka(Y(-0.42)) +
            "L" + maskotAngka(X(0.5)) + " " + maskotAngka(yt) +
            "Q" + maskotAngka(X(0)) + " " + maskotAngka(kendali) + " " + maskotAngka(X(-0.5)) + " " + maskotAngka(yt) + "Z";
        var emas = "M" + maskotAngka(X(-0.49)) + " " + maskotAngka(yt - 0.06 * g.ry) +
            "Q" + maskotAngka(X(0)) + " " + maskotAngka(kendali - 0.06 * g.ry) + " " + maskotAngka(X(0.49)) + " " + maskotAngka(yt - 0.06 * g.ry);
        var kilau = "M" + maskotAngka(X(-0.3)) + " " + maskotAngka(Y(-0.3)) + "Q" + maskotAngka(X(0)) + " " + maskotAngka(Y(-0.37)) + " " + maskotAngka(X(0.3)) + " " + maskotAngka(Y(-0.3));
        return '<path d="' + badan + '" fill="#1A1A20" stroke="#000" stroke-width="3.5" stroke-linejoin="round"/>' +
            '<path d="' + kilau + '" fill="none" stroke="#3F3F4C" stroke-width="3" stroke-linecap="round"/>' +
            '<path d="' + emas + '" fill="none" stroke="#E2B13C" stroke-width="3" stroke-linecap="round"/>';
    },
    agustus: function (g) {
        var a = 0.1, m = 0.215, b = 0.33, k = g.rx / 100;
        var tepi = maskotPita(g, -0.96, 0.96, a, b);
        var ujung = maskotTitikKurva(g, 0.94, 0.94, 0.215, 1)[0];
        var ekor = '<g transform="translate(' + maskotAngka(ujung[0]) + " " + maskotAngka(ujung[1]) + ") scale(" + maskotAngka(k) + ')">' +
            '<path d="M-2 -5L20 6L13 26L-6 12Z" fill="#E4002B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M-2 2L18 18L9 36L-8 20Z" fill="#fff" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/></g>';
        return ekor +
            '<path d="' + maskotPita(g, -0.96, 0.96, a, m) + '" fill="#E4002B"/>' +
            '<path d="' + maskotPita(g, -0.96, 0.96, m, b) + '" fill="#fff"/>' +
            '<path d="' + tepi + '" fill="none" stroke="#3A1F14" stroke-width="3.5" stroke-linejoin="round"/>';
    },
    lulus: function (g) {
        var sx = g.rx / 102, sy = g.ry / 80, tx = g.cx - 214 * sx, ty = (g.cy - g.ry) - 80 * sy;
        return '<g transform="translate(' + maskotAngka(tx) + " " + maskotAngka(ty) + ") scale(" + maskotAngka(sx) + " " + maskotAngka(sy) + ')">' +
            '<path d="M158 54L251 33L337 84L244 103Z" fill="#1F2E52" stroke="#0F1A33" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M158 54L244 103L244 113L158 64Z" fill="#14213F" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M244 103L337 84L337 94L244 113Z" fill="#0F1A33" stroke="#0F1A33" stroke-width="3" stroke-linejoin="round"/>' +
            '<path d="M192 84C194 68 212 60 238 60C264 60 282 68 284 82L286 100C266 110 214 108 194 100Z" fill="#243B6B" stroke="#0F1A33" stroke-width="4" stroke-linejoin="round"/>' +
            '<path d="M238 61Q290 62 318 90" fill="none" stroke="#F9A91B" stroke-width="3.5" stroke-linecap="round"/>' +
            '<circle cx="238" cy="61" r="5" fill="#F9A91B" stroke="#3A1F14" stroke-width="2.5"/>' +
            '<path d="M318 90L318 108" stroke="#F9A91B" stroke-width="3.5" stroke-linecap="round"/>' +
            '<path d="M309 112L327 112L331 148L305 148Z" fill="#F9A91B" stroke="#3A1F14" stroke-width="3" stroke-linejoin="round"/>' +
            '<circle cx="318" cy="110" r="7" fill="#F9A91B" stroke="#3A1F14" stroke-width="3"/></g>';
    },
    tidur: function (g) {
        var X = function (dx) { return g.cx + dx * g.rx; }, T = g.cy - g.ry, Y = function (dy) { return T + dy * g.ry; };
        var ya = function (dx) { return g.cy - g.ry * Math.sqrt(1 - dx * dx) - 0.02 * g.ry; };
        var P = function (dx, dy) { return maskotAngka(X(dx)) + " " + maskotAngka(Y(dy)); };
        var badan = "M" + maskotAngka(X(-0.8)) + " " + maskotAngka(ya(-0.8)) +
            "C" + P(-0.84, -0.5) + " " + P(-0.4, -0.95) + " " + P(0.1, -0.88) +
            "C" + P(0.55, -0.82) + " " + P(0.92, -0.55) + " " + P(1.05, 0.02) +
            "C" + P(0.94, -0.12) + " " + P(0.88, -0.1) + " " + maskotAngka(X(0.8)) + " " + maskotAngka(ya(0.8)) + "Z";
        var kapas = { x: X(1.05), y: Y(0.02), r: g.rx * 0.15 };
        var bintang = function (cx, cy, r) {
            var d = "";
            for (var i = 0; i < 10; i++) {
                var ang = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
                d += (i ? "L" : "M") + maskotAngka(cx + rr * Math.cos(ang)) + " " + maskotAngka(cy + rr * Math.sin(ang));
            }
            return '<path d="' + d + 'Z" fill="#FFD54F"/>';
        };
        return '<path d="' + badan + '" fill="#5B6EC7" stroke="#2A3470" stroke-width="3.5" stroke-linejoin="round"/>' +
            bintang(X(-0.45), Y(-0.38), g.rx * 0.09) + bintang(X(0.15), Y(-0.6), g.rx * 0.07) + bintang(X(0.62), Y(-0.38), g.rx * 0.06) +
            '<circle cx="' + maskotAngka(kapas.x) + '" cy="' + maskotAngka(kapas.y) + '" r="' + maskotAngka(kapas.r) + '" fill="#fff" stroke="#2A3470" stroke-width="3"/>' +
            '<path d="' + maskotPita(g, -0.84, 0.84, -0.04, 0.2) + '" fill="#F7F8FF" stroke="#2A3470" stroke-width="3.5" stroke-linejoin="round"/>';
    }
};

function maskotSvgNode(markup) {
    var d = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + markup + '</svg>', "image/svg+xml");
    return document.importNode(d.documentElement.firstChild, true);
}

function maskotKelopak(induk, g) {
    var mata = [];
    var putih = Array.prototype.slice.call(induk.querySelectorAll('g[fill="#FFFBF2"] > circle'));
    if (putih.length) {
        var tebal = putih[0].parentNode.getAttribute("stroke-width") || "6";
        putih.forEach(function (c) {
            mata.push({ x: +c.getAttribute("cx"), y: +c.getAttribute("cy"), r: +c.getAttribute("r"), tebal: tebal, garis: "#1B2A4A" });
        });
    } else {
        Array.prototype.forEach.call(induk.querySelectorAll(".mk-iris, .mk-o-iris"), function (gi) {
            var c = gi.querySelector("circle");
            if (c) mata.push({ x: +c.getAttribute("cx"), y: +c.getAttribute("cy"), r: +c.getAttribute("r") + 2, tebal: "4", garis: "#3A1F14" });
        });
    }
    if (!mata.length) return;
    var isi = mata.map(function (m) {
        return '<path d="M' + maskotAngka(m.x - m.r) + " " + maskotAngka(m.y) + "A" + maskotAngka(m.r) + " " + maskotAngka(m.r) + " 0 0 1 " +
            maskotAngka(m.x + m.r) + " " + maskotAngka(m.y) + 'Z" fill="#FDEBD3" stroke="' + m.garis + '" stroke-width="' + m.tebal + '" stroke-linejoin="round"/>';
    }).join("");
    var node = maskotSvgNode('<g class="mk-aks mk-aks-kelopak">' + isi + "</g>");
    var pos = null;
    Array.prototype.forEach.call(induk.children, function (el) {
        if (!pos && el.classList && (el.classList.contains("mk-look") || el.classList.contains("mk-o-look"))) pos = el;
    });
    if (pos && pos.nextSibling) induk.insertBefore(node, pos.nextSibling);
    else induk.appendChild(node);
}

function maskotAksesori(svg) {
    if (svg.getAttribute("data-mk-aks")) return;
    svg.setAttribute("data-mk-aks", "1");
    var k = maskotKonteks();
    if (!k.ngantuk && !k.hari) return;
    var kepala = svg.querySelector(".mk-head, .mk-o-head, .mk-t-head, .mk-r-head, .mk-c-head");
    if (!kepala) return;
    var elips = Array.prototype.filter.call(kepala.querySelectorAll("ellipse"), function (e) { return +e.getAttribute("rx") >= 100; })[0];
    if (!elips) return;
    var induk = elips.parentNode;
    var g = { cx: +elips.getAttribute("cx"), cy: +elips.getAttribute("cy"), rx: +elips.getAttribute("rx"), ry: +elips.getAttribute("ry") };
    if (k.ngantuk) maskotKelopak(induk, g);
    if (svg.classList.contains("mk-aka")) return;
    var topi = k.hari || (k.ngantuk ? "tidur" : "");
    if (topi && MASKOT_PETA_TOPI[topi]) induk.appendChild(maskotSvgNode('<g class="mk-aks mk-aks-' + topi + '">' + MASKOT_PETA_TOPI[topi](g) + "</g>"));
}

function maskotPindai(simpul) {
    if (!simpul || simpul.nodeType !== 1) return;
    if (simpul.matches && simpul.matches("svg.mk")) { maskotAksesori(simpul); return; }
    if (simpul.querySelectorAll) Array.prototype.forEach.call(simpul.querySelectorAll("svg.mk:not([data-mk-aks])"), maskotAksesori);
}

function maskotPantauAksesori() {
    maskotPindai(document.body);
    if (typeof MutationObserver === "undefined") return;
    new MutationObserver(function (daftar) {
        daftar.forEach(function (rec) { Array.prototype.forEach.call(rec.addedNodes, maskotPindai); });
    }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { mountMaskot(); maskotPantauAksesori(); });
else { mountMaskot(); maskotPantauAksesori(); }