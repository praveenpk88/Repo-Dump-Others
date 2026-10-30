// Halloween pizza poster rendered to A3 portrait PDF + PNG.
//   A1–A3 — follow the shop's existing red promo posters (Marinara / Mortadella Special), light → peak enhancement.
//   B — a darker, more designed take that keeps the brand red, cream and checks.
// Usage: node build.js   (or: node build.js a1 a3)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// ---- edit the poster text here ----
const T = {
  name: 'Pizza Nera',                 // version B headline (suggested name)
  kicker: 'Halloween Special',
  ingredients: 'Pumpkin cream, gorgonzola, fior di latte, guanciale & sun-dried tomatoes',
  price: '28',                        // 'XX' prints a highlighted placeholder
  date: '31 October',
  tagline: 'Dare to go dark',
};

const OUT = path.join(__dirname, 'output');
const W = 297, H = 420; // mm, A3 portrait (same proportions as the existing 1414×2000 promo posters)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const head = (title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../fonts/fonts.css"><style>
@page { size: ${W}mm ${H}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${W}mm; height: ${H}mm }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact }
.page { width: ${W}mm; height: ${H}mm; position: relative; overflow: hidden }
.tbc { background: #ffe27a; color: #5a3d00; padding: 0 .12em; border-radius: .12em }
${css}</style></head><body>`;
const price = (p) => (p === 'XX' ? '<span class="tbc">XX</span>' : esc(p));

const bat = (c) => `<svg viewBox="0 0 64 28"><path fill="${c}" d="M32 9c1.2-2.4 2.2-3.6 3-4.2.2 1.4.6 2.4 1.4 3 3.2-3.6 8.6-6.2 15.6-6.8-2.4 2-3.6 4.4-3.4 7.2 3.6-.6 7.6.2 11.4 2.4-3.8.4-6.6 2.2-8 5.4-2.6-1.8-6-2-9.4-.6.6 2.6.2 5.6-1.6 8.6-2.4-3.6-5.6-5.4-9-5.4s-6.6 1.8-9 5.4c-1.8-3-2.2-6-1.6-8.6-3.4-1.4-6.8-1.2-9.4.6-1.4-3.2-4.2-5-8-5.4C8.8 8.4 12.8 7.6 16.4 8.2c.2-2.8-1-5.2-3.4-7.2 7 .6 12.4 3.2 15.6 6.8.8-.6 1.2-1.6 1.4-3 .8.6 1.8 1.8 3 4.2z"/></svg>`;
const dots = (cols, rows, gap, r, c) => {
  let s = '';
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) s += `<circle cx="${x * gap + r}" cy="${y * gap + r}" r="${r}" fill="${c}"/>`;
  return `<svg width="${(cols - 1) * gap + 2 * r}mm" height="${(rows - 1) * gap + 2 * r}mm" viewBox="0 0 ${(cols - 1) * gap + 2 * r} ${(rows - 1) * gap + 2 * r}">${s}</svg>`;
};

// ============================================================================
// A — same system as the existing promo posters, in three enhancement levels:
//   1 light polish · 2 moderate Halloween touches · 3 peak (moon, webs, pumpkin price)
// ============================================================================

// Quarter spider web anchored in a corner. flip mirrors it for the right-hand corner.
const web = (c, size, flip = false) => {
  const R = 100, spokes = 7, rings = [22, 42, 62, 82, 100];
  const pt = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  let d = '';
  for (let i = 0; i < spokes; i++) { const [x, y] = pt(R * 1.05, (i / (spokes - 1)) * Math.PI / 2); d += `M0 0L${x.toFixed(1)} ${y.toFixed(1)}`; }
  for (const r of rings) {
    for (let i = 0; i < spokes - 1; i++) {
      const a0 = (i / (spokes - 1)) * Math.PI / 2, a1 = ((i + 1) / (spokes - 1)) * Math.PI / 2;
      const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1), [mx, my] = pt(r * 0.86, (a0 + a1) / 2);
      d += `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
  }
  return `<svg width="${size}mm" height="${size}mm" viewBox="0 0 100 100" style="${flip ? 'transform:scaleX(-1)' : ''}">
    <path d="${d}" fill="none" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/></svg>`;
};
const spider = (c, thread) => `<svg viewBox="0 0 40 ${thread + 40}" width="100%">
  <path d="M20 0V${thread + 8}" stroke="${c}" stroke-width=".8"/>
  <g transform="translate(20 ${thread + 18})" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round">
    <path d="M-5 -4l-8 -7-4 4M-5 0h-10l-4 4M-5 3l-8 6-2 6M-4 6l-5 9 1 5M5 -4l8 -7 4 4M5 0h10l4 4M5 3l8 6 2 6M4 6l5 9-1 5"/></g>
  <ellipse cx="20" cy="${thread + 21}" rx="6" ry="7.5" fill="${c}"/><circle cx="20" cy="${thread + 12}" r="4" fill="${c}"/></svg>`;
// Orange oval with pumpkin "drips" hanging from its bottom edge.
const dripOval = (c, gloss) => {
  const cx = 95, cy = 33, rx = 95, ry = 33;
  const drips = [[38, 10], [58, 18], [83, 8], [104, 22], [128, 12], [150, 16]];
  const yb = (x) => cy + ry * Math.sqrt(1 - ((x - cx) / rx) ** 2) - 2;
  const d = drips.map(([x, len]) => { const y = yb(x), w = 3.4;
    return `M${x - w} ${y}V${y + len}a${w} ${w} 0 0 0 ${2 * w} 0V${y}Z`; }).join('');
  return `<svg viewBox="0 0 190 96" width="190mm" height="96mm">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/><path d="${d}" fill="${c}"/>
    ${gloss ? `<ellipse cx="60" cy="16" rx="32" ry="6" fill="#fff" opacity=".22" transform="rotate(-8 60 16)"/>` : ''}</svg>`;
};
// Jack-o'-lantern price tag.
const pumpkin = (label) => `<svg viewBox="0 0 120 108" width="100%">
  <defs><radialGradient id="pk" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#FFB050"/><stop offset=".6" stop-color="#F2862A"/><stop offset="1" stop-color="#C9561A"/></radialGradient></defs>
  <path d="M60 22 C58 12 62 6 70 3" stroke="#3F5B2A" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M68 10c8-6 18-4 22 2-8 0-14 2-20 6" fill="#4E7A33"/>
  <ellipse cx="22" cy="64" rx="18" ry="34" fill="url(#pk)"/><ellipse cx="98" cy="64" rx="18" ry="34" fill="url(#pk)"/>
  <ellipse cx="38" cy="62" rx="24" ry="40" fill="url(#pk)"/><ellipse cx="82" cy="62" rx="24" ry="40" fill="url(#pk)"/>
  <ellipse cx="60" cy="61" rx="27" ry="42" fill="url(#pk)"/>
  <path d="M38 24 C30 50 30 80 38 100 M82 24 C90 50 90 80 82 100 M60 20 V103" stroke="#B4481A" stroke-width="1.4" fill="none" opacity=".55"/>
  <text x="60" y="78" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#FFE27A" stroke="#5A1E05" stroke-width="2.2" paint-order="stroke"
    transform="translate(60 0) scale(.9 1) translate(-60 0)">${label}</text></svg>`;
const grain = (o) => `<svg style="position:absolute;inset:0;opacity:${o};mix-blend-mode:overlay;pointer-events:none" width="100%" height="100%">
  <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#gr)"/></svg>`;

function posterA(L) {
  const C = { red: '#C40001', cream: '#F8F1DF', oval: '#F2902E', pale: '#F0EEE6', check: '#9FB3C0', ink: '#1A0B07', deep: '#7A0000' };
  const extrude = (n, step, col) => Array.from({ length: n }, (_, i) => `${((i + 1) * step).toFixed(2)}mm ${((i + 1) * step).toFixed(2)}mm 0 ${col}`).join(', ');
  const titleShadow = [
    '0 .8mm 0 rgba(0,0,0,.12)',
    `${extrude(5, .32, C.deep)}, 0 3mm 4mm rgba(0,0,0,.25)`,
    `${extrude(9, .34, C.ink)}, 0 5mm 6mm rgba(0,0,0,.35)`,
  ][L - 1];
  const css = `
body { background: ${C.red}; font-family: 'Lilita One' }
.page { background: ${[
    C.red,
    `radial-gradient(ellipse 80% 60% at 50% 32%, #D50A08, ${C.red} 55%, #A80000)`,
    `radial-gradient(ellipse 85% 55% at 50% 28%, #D90C08, ${C.red} 50%, #8E0000 85%, #5E0000)`,
  ][L - 1]} }
.dots-tl { position: absolute; left: 9mm; top: 9mm }
.dots-r { position: absolute; right: 7mm; top: 64mm }
.web { position: absolute; top: 0; opacity: ${L === 3 ? .75 : .55} } .web.l { left: 0 } .web.r { right: 0 }
.spider { position: absolute; right: ${L === 3 ? 30 : 22}mm; top: 0; width: ${L === 3 ? 11 : 8}mm }
.xs { position: absolute; right: 18mm; top: 12mm; color: ${C.cream}; font-family: 'Poppins'; font-weight: 600; font-size: 8mm; letter-spacing: 4.5mm }
.oval { position: absolute; left: 50%; top: 46mm; width: 190mm; height: 66mm; margin-left: -95mm; border-radius: 50%; background: ${C.oval} }
.drip { position: absolute; left: 50%; top: 46mm; margin-left: -95mm; ${L === 3 ? 'filter: drop-shadow(0 1.2mm 0 rgba(0,0,0,.18))' : ''} }
h1 { position: absolute; left: 0; right: 0; top: 22mm; text-align: center; color: ${C.cream}; font-weight: 400; font-size: 44mm; line-height: .86;
  transform: scaleX(.84) ${L === 3 ? 'rotate(-2deg)' : ''}; letter-spacing: -.005em; text-shadow: ${titleShadow} }
.date { position: absolute; left: 0; right: 0; top: ${L === 1 ? 118 : 137}mm; text-align: center; color: ${C.cream}; font-size: 8.5mm; letter-spacing: .06em; transform: scaleX(.9) }
.date.tag span { display: inline-block; background: ${C.ink}; color: ${C.oval}; padding: 1.2mm 6mm 1.6mm; border-radius: 1.5mm; letter-spacing: .12em; transform: rotate(-2deg) }
.bat { position: absolute } .bat svg { width: 100%; display: block }
.arc { position: absolute; left: 0; top: ${L === 1 ? 116 : 122}mm; width: ${W}mm; height: 80mm; ${L > 1 ? 'filter: drop-shadow(0 .5mm 0 rgba(0,0,0,.25))' : ''} }
.pale { position: absolute; left: 50%; top: 248mm; width: 420mm; height: 420mm; margin-left: -210mm; border-radius: 50%; background: ${C.pale} }
.moon { background: radial-gradient(circle at 42% 30%, #FFF9EA, #F2EAD4 55%, #E6DCC2) }
.moon.glow { box-shadow: 0 0 0 4mm rgba(255,240,205,.18), 0 0 0 10mm rgba(255,240,205,.1), 0 0 40mm 12mm rgba(255,214,150,.35) }
.crater { position: absolute; border-radius: 50%; background: rgba(150,120,80,.06) }
.pizza { position: absolute; left: 50%; top: 160mm; width: ${L === 1 ? 290 : 296}mm; margin-left: -${L === 1 ? 145 : 148}mm;
  filter: drop-shadow(0 6mm ${L === 3 ? 9 : 6}mm rgba(0,0,0,${L === 3 ? .5 : .38})) brightness(1.07) contrast(1.03) saturate(1.1) }
.price { position: absolute; left: 14mm; top: 322mm; width: 52mm; height: 52mm; border-radius: 50%; background: ${C.red}; color: ${C.cream};
  display: grid; place-items: center; font-size: 21mm;
  box-shadow: ${L === 1 ? `0 0 0 1.6mm ${C.pale}` : `0 0 0 1.6mm ${C.pale}, 0 0 0 3.4mm ${C.oval}, 0 2mm 5mm rgba(0,0,0,.25)`} }
.price span { transform: scaleX(.88) }
.pk { position: absolute; left: 9mm; top: 302mm; width: 80mm; transform: rotate(-8deg); filter: drop-shadow(0 2.5mm 3mm rgba(0,0,0,.35)) }
.checks { position: absolute; right: 16mm; bottom: 20mm; width: 54mm; height: 8mm;
  background: repeating-conic-gradient(${L === 1 ? C.check : C.ink} 0 25%, ${L === 1 ? 'transparent' : C.oval} 0 50%) 0 0 / 4mm 4mm }
.strip { position: absolute; left: 0; right: 0; bottom: 0; height: 10mm; background: repeating-conic-gradient(${C.ink} 0 25%, ${C.oval} 0 50%) 0 0 / 10mm 10mm }
.strip::before { content: ''; position: absolute; left: 0; right: 0; top: -2mm; height: 1.2mm; background: ${C.ink} }
.pill { position: absolute; left: 50%; bottom: -10mm; width: 90mm; height: 26mm; margin-left: -45mm; border-radius: 13mm; background: #e2ded4 }`;

  const bats = [
    // [left, top, width, rotate, colour]
    [[20, 102, 16, 0], [21, 112, 9, 0], [252, 112, 16, 0], [266, 121, 11, 0]],
    [[16, 100, 17, -10], [38, 110, 10, 8], [24, 120, 7, -4], [246, 104, 18, 10], [270, 116, 10, -6], [256, 126, 7, 4]],
    [[14, 96, 22, -12], [42, 110, 12, 10], [22, 124, 8, -6], [240, 98, 24, 12], [272, 114, 12, -8], [254, 128, 8, 6],
     [104, 368, 24, -8], [140, 386, 12, 6], [166, 362, 17, 10], [204, 380, 21, -6], [244, 364, 11, 4], [262, 388, 15, -10]],
  ][L - 1];
  const batCol = (i) => (L === 3 && i >= 6 ? C.ink : C.cream);
  const ingredients = T.ingredients;
  const batsHtml = bats.map(([x, y, w, r], i) => `<div class="bat" style="left:${x}mm;top:${y}mm;width:${w}mm;transform:rotate(${r}deg)">${bat(batCol(i))}</div>`);

  return head(`Halloween Special — A${L}`, css) + `
<div class="page">
  ${L === 3 ? grain(.16) : ''}
  ${L === 1 ? `<div class="dots-tl">${dots(5, 5, 5.4, .75, C.cream)}</div>` : `<div class="web l">${web(C.cream, L === 3 ? 62 : 52)}</div>`}
  ${L === 3 ? `<div class="web r">${web(C.cream, 44, true)}</div>` : ''}
  <div class="dots-r">${dots(2, 10, 5.4, .75, C.cream)}</div>
  ${L === 3 ? '' : '<div class="xs">× × × ×</div>'}
  ${L > 1 ? `<div class="spider">${spider(L === 3 ? C.ink : C.cream, L === 3 ? 34 : 4)}</div>` : ''}
  ${L === 1 ? '<div class="oval"></div>' : `<div class="drip">${dripOval(C.oval, L === 3)}</div>`}
  <h1>Halloween<br>Special</h1>
  <div class="date${L === 3 ? ' tag' : ''}"><span>${esc(T.date)}</span></div>
  ${batsHtml.slice(0, 6).join('')}
  <svg class="arc" viewBox="0 0 297 80"><defs><path id="arc" d="M6,78 Q148.5,4 291,78"/></defs>
    <text font-family="Lilita One" font-size="7.9" fill="${C.cream}" text-anchor="middle" letter-spacing=".1">
    <textPath href="#arc" startOffset="50%">${esc(ingredients)}</textPath></text></svg>
  <div class="pale${L > 1 ? ' moon' : ''}${L === 3 ? ' glow' : ''}">${L === 3 ? `
    <i class="crater" style="left:52mm;top:30mm;width:22mm;height:22mm"></i><i class="crater" style="left:330mm;top:40mm;width:30mm;height:30mm"></i>
    <i class="crater" style="left:84mm;top:96mm;width:14mm;height:14mm"></i><i class="crater" style="left:300mm;top:110mm;width:16mm;height:16mm"></i>` : ''}</div>
  <img class="pizza" src="../photos/pizza.png">
  ${batsHtml.slice(6).join('')}
  ${L === 3 ? `<div class="pk">${pumpkin('$' + esc(T.price))}</div>` : `<div class="price"><span>$${price(T.price)}</span></div>`}
  ${L === 3 ? '<div class="strip"></div>' : '<div class="checks"></div><div class="pill"></div>'}
</div></body></html>`;
}

// ============================================================================
// B — "Pizza Nera": dark slate, pumpkin glow, brand red + cream
// ============================================================================
function posterB() {
  const C = { night: '#120E0C', slate: '#26201C', pumpkin: '#FF8A1F', ember: '#FF5A14', red: '#C40001', cream: '#F8EEDB' };
  const css = `
body { background: ${C.night}; color: ${C.cream}; font-family: 'Fraunces', serif }
.page { background:
  radial-gradient(ellipse 70% 38% at 50% 60%, rgba(255,122,26,.42), rgba(255,90,20,.12) 55%, transparent 75%),
  radial-gradient(ellipse 90% 70% at 50% 45%, ${C.slate}, ${C.night} 80%) }
.grain { position: absolute; inset: 0; opacity: .22; mix-blend-mode: overlay }
.brand { position: absolute; left: 0; right: 0; top: 15mm; text-align: center; font-family: 'Oswald'; font-weight: 500; letter-spacing: .5em;
  font-size: 4.2mm; text-transform: uppercase; opacity: .85 }
.brand b { font-weight: 700 }
.kicker { position: absolute; left: 0; right: 0; top: 33mm; text-align: center; display: flex; justify-content: center; align-items: center; gap: 6mm;
  font-family: 'Oswald'; font-weight: 600; font-size: 7.5mm; letter-spacing: .38em; text-transform: uppercase; color: ${C.pumpkin} }
.kicker::before, .kicker::after { content: ''; width: 26mm; height: .5mm; background: ${C.pumpkin}; opacity: .7 }
h1 { position: absolute; left: 0; right: 0; top: 44mm; text-align: center; font-weight: 900; font-size: 56mm; line-height: .9;
  font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; letter-spacing: -.02em;
  background: linear-gradient(180deg, #FFC56B 0%, ${C.pumpkin} 42%, ${C.ember} 70%, ${C.red} 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 1.2mm 0 rgba(0,0,0,.5)) drop-shadow(0 0 8mm rgba(255,110,20,.35)) }
.tag { position: absolute; left: 0; right: 0; top: 98mm; text-align: center; font-family: 'Mrs Saint Delafield'; font-size: 17mm; color: ${C.cream}; transform: rotate(-3deg) }
.pizza { position: absolute; left: 50%; top: 128mm; width: 300mm; margin-left: -150mm; filter: drop-shadow(0 8mm 10mm rgba(0,0,0,.65)) brightness(1.1) contrast(1.04) saturate(1.1) }
.price { position: absolute; right: 18mm; top: 252mm; width: 50mm; height: 50mm; border-radius: 50%; background: ${C.red}; display: grid; place-items: center;
  box-shadow: 0 0 0 1.3mm ${C.cream}, 0 0 0 3mm ${C.red}, 0 3mm 8mm rgba(0,0,0,.5); transform: rotate(-8deg); text-align: center }
.price b { font-weight: 900; font-size: 20mm; line-height: .9; font-variation-settings: 'opsz' 144, 'SOFT' 100 }
.price small { display: block; font-family: 'Oswald'; font-weight: 600; font-size: 3.4mm; letter-spacing: .3em; text-transform: uppercase; margin-top: 1mm }
.ingr { position: absolute; left: 30mm; right: 30mm; top: 330mm; text-align: center; text-wrap: balance; font-size: 8.4mm; line-height: 1.3; font-weight: 400;
  font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.ingr i { color: ${C.pumpkin}; font-style: normal; padding: 0 2mm }
.date { position: absolute; left: 0; right: 0; top: 368mm; text-align: center; font-family: 'Oswald'; font-weight: 500; font-size: 5.4mm; letter-spacing: .45em;
  text-transform: uppercase; color: ${C.pumpkin} }
.checks { position: absolute; left: 0; right: 0; bottom: 0; height: 12mm;
  background: repeating-conic-gradient(${C.red} 0 25%, ${C.night} 0 50%) 0 0 / 12mm 12mm }
.checks::before { content: ''; position: absolute; left: 0; right: 0; top: -2.2mm; height: 1.2mm; background: ${C.cream} }
.bat { position: absolute; opacity: .9 } .bat svg { width: 100% }
.dots { position: absolute; opacity: .5 }`;

  const ingr = T.ingredients.replace(' & ', ', ').split(', ').map((x) => esc(x).replace(/ /g, '&nbsp;')).join('<i>·</i> ');
  return head(`${T.name} — B`, css) + `
<div class="page">
  <svg class="grain" width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
  <div class="dots" style="left:12mm;top:14mm">${dots(4, 4, 5.4, .7, C.pumpkin)}</div>
  <div class="dots" style="right:12mm;top:14mm">${dots(4, 4, 5.4, .7, C.pumpkin)}</div>
  <div class="brand">il mercato <b>Centrale</b> · Melbourne</div>
  <div class="kicker">${esc(T.kicker)}</div>
  <h1>${esc(T.name)}</h1>
  <div class="tag">${esc(T.tagline)}</div>
  <div class="bat" style="left:24mm;top:104mm;width:22mm;transform:rotate(-12deg)">${bat('#0A0807')}</div>
  <div class="bat" style="left:52mm;top:120mm;width:12mm;transform:rotate(8deg)">${bat('#0A0807')}</div>
  <div class="bat" style="right:30mm;top:110mm;width:16mm;transform:rotate(10deg)">${bat('#0A0807')}</div>
  <img class="pizza" src="../photos/pizza.png">
  <div class="price"><div><b>$${price(T.price)}</b></div></div>
  <div class="ingr">${ingr}</div>
  <div class="date">${esc(T.date)} · Halloween</div>
  <div class="checks"></div>
</div></body></html>`;
}

const POSTERS = { a1: () => posterA(1), a2: () => posterA(2), a3: () => posterA(3), b: posterB };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(POSTERS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((W / 25.4) * 96), pxH = Math.round((H / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2.5 });
  for (const k of want) {
    const file = path.join(OUT, `halloween-${k}.html`);
    fs.writeFileSync(file, POSTERS[k]());
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `halloween-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `halloween-${k}.pdf`), width: `${W}mm`, height: `${H}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
