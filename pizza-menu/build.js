// Builds the pizza menu variants as HTML, then renders each to an A3 landscape PDF + PNG preview.
// Usage: node build.js            (all variants)
//        node build.js a c        (only some)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const M = require('./menu-data');

const OUT = path.join(__dirname, 'output');
const PAGE = { w: 420, h: 297 }; // mm, A3 landscape. Everything is laid out in mm so it scales to A2/A1 cleanly.

// ---------- shared bits ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const price = (p) => (p == null ? '<span class="tbc">XX</span>' : String(p));
const photo = (name) => (name ? `../photos/${name}.jpg` : null);

const leaf = (c = 'currentColor') =>
  `<svg class="leaf" viewBox="0 0 24 24" aria-label="vegan"><path fill="${c}" d="M20 3C9 3 4 9 4 15c0 2 .6 3.6 1.4 4.8L3 22l1.4 1.4 2.5-2.4C8.1 21.6 9.6 22 11 22c6 0 10-6 9-19zM8 18c2-5 5-8 9-10-3 3-6 6-9 10z"/></svg>`;

const stamp = (ring, ink, size = 40) => `
<svg class="stamp" width="${size}mm" height="${size}mm" viewBox="0 0 200 200">
  <defs><path id="sc-${ring.slice(1)}" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
  <circle cx="100" cy="100" r="96" fill="none" stroke="${ring}" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="58" fill="none" stroke="${ring}" stroke-width="1.2"/>
  <text font-family="Cinzel" font-size="14.5" font-weight="600" fill="${ink}">
    <textPath href="#sc-${ring.slice(1)}" startOffset="0" textLength="458" lengthAdjust="spacing">LA PIZZA NAPOLETANA · BY SAMUELE FERRO ·</textPath>
  </text>
  <text x="100" y="117" text-anchor="middle" font-family="Cormorant Garamond" font-weight="700" font-size="54" fill="${ink}">LPN</text>
</svg>`;

// Line drawing of a wood-fired oven, used as a header illustration.
const oven = (c) => `
<svg class="oven" viewBox="0 -10 260 180" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M34 146 C34 70 78 30 130 30 C182 30 226 70 226 146"/>
  <path d="M48 120 C52 76 86 46 130 46" stroke-width="1" stroke-dasharray="1 5"/>
  <path d="M116 30 V12 H144 V30"/><path d="M112 12 H148" />
  <path d="M124 6 C120 0 128 -2 126 -8 M136 6 C132 0 140 -2 138 -8" stroke-width="1.1"/>
  <path d="M88 146 V122 C88 98 107 82 130 82 C153 82 172 98 172 122 V146"/>
  <path d="M80 146 V120 C80 92 103 72 130 72 C157 72 180 92 180 120 V146" stroke-width="1.1"/>
  <path d="M84 100 L92 104 M96 82 L102 89 M114 74 L117 83 M146 74 L143 83 M164 82 L158 89 M176 100 L168 104" stroke-width="1.1"/>
  <path d="M104 144 L156 136 M106 136 L154 144" stroke-width="2.6"/>
  <path d="M112 134 C106 122 116 112 118 102 C122 114 128 114 126 124 C132 118 134 110 132 100 C144 112 146 126 140 134 C146 130 148 124 148 118 C154 128 150 136 146 138" stroke-width="1.5"/>
  <path d="M14 146 H246"/><path d="M22 156 H238" stroke-width="1.2"/><path d="M30 156 V166 M230 156 V166" stroke-width="1.2"/>
  <path d="M196 146 L246 112 M238 106 C246 100 256 106 250 114 L242 118 Z" stroke-width="1.6"/>
</svg>`;

// Little "heat" pips for the tier headers: ● ○ ○ → ● ● ●
const pips = (n, on, off) =>
  [0, 1, 2].map((i) => `<i style="background:${i < n ? on : 'transparent'};border-color:${i < n ? on : off}"></i>`).join('');

const head = (title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../fonts/fonts.css">
<style>
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-kerning: normal }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden }
.tbc { background: #ffe27a; color: #5a3d00; padding: 0 .25em; border-radius: .2em; font-weight: 700 }
.leaf { width: 1em; height: 1em; vertical-align: -.12em; display: inline-block }
img { display: block }
${css}
</style></head><body>`;

// ============================================================================
// VARIANT A · "Trattoria" — the manager's red mock-up, refined.
// Photo beside every pizza, three tiers with arrows, sidebar for focaccia, dolce and notes.
// ============================================================================
function variantA() {
  const C = { paper: '#F6EEDF', red: '#8C1C1C', green: '#3D5A36', ink: '#2A221E', rule: '#C9B48F' };
  const cell = (p) => {
    if (!p) return '<div class="cell empty"></div>';
    const img = photo(p.photo)
      ? `<img class="ph" src="${photo(p.photo)}">`
      : `<div class="ph none"><span>photo<br>to come</span></div>`;
    return `<div class="cell">${img}<div class="tx">
      <div class="nm">${esc(p.name)}<span class="pr">${price(p.price)}</span>${p.vegan ? leaf(C.green) : ''}</div>
      <div class="ds">${esc(p.desc)}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div></div>`;
  };
  const side = (p) => `<div class="sitem">${
    photo(p.photo) ? `<img class="ph" src="${photo(p.photo)}">` : `<div class="ph none"><span>photo<br>to come</span></div>`
  }<div class="tx"><div class="nm">${esc(p.name)}<span class="pr">${price(p.price)}</span>${p.vegan ? leaf(C.green) : ''}</div><div class="ds">${esc(p.desc)}</div></div></div>`;

  const css = `
body { background: ${C.paper}; color: ${C.ink}; font-family: 'EB Garamond', serif }
.page { padding: 10mm 13mm 0;
  background: radial-gradient(ellipse at 20% 0%, #fbf6ec 0, transparent 60%), radial-gradient(ellipse at 100% 100%, #efe3cc 0, transparent 55%), ${C.paper} }
header { display: grid; grid-template-columns: 52mm 1fr 62mm; align-items: center; height: 56mm }
.stamp { margin-left: 2mm }
.brand { text-align: center }
h1 { font-family: 'Cormorant Garamond'; font-weight: 700; font-size: 16mm; line-height: .9; letter-spacing: .06em; text-transform: uppercase; color: ${C.red} }
.by { font-family: 'Mrs Saint Delafield'; font-size: 12mm; line-height: .8; color: ${C.green}; margin-top: .5mm }
.intro { margin: 2.5mm auto 0; width: 190mm; border: .35mm solid ${C.green}; border-radius: 1mm; padding: 2mm 5mm;
  font-size: 3.35mm; line-height: 1.35; position: relative }
.intro b { display: block; color: ${C.green}; font-weight: 600; font-style: italic; margin-top: .6mm }
.oven { width: 58mm; justify-self: end; margin-right: 2mm }
.body { display: grid; grid-template-columns: 1fr 86mm; column-gap: 9mm; margin-top: 2mm }
.tiers, .row { display: grid; grid-template-columns: 1.18fr 1fr 1fr; column-gap: 6mm }
.tiers div { font-family: 'Cormorant Garamond'; font-weight: 700; font-size: 6mm; letter-spacing: .14em; text-transform: uppercase;
  color: ${C.red}; display: flex; align-items: center; gap: 3mm; padding-bottom: 1.4mm }
.tiers div:not(:last-child)::after { content: ''; flex: 1; height: .3mm; background: ${C.red};
  -webkit-mask: linear-gradient(90deg, #000 calc(100% - 2.4mm), transparent 0) }
.tiers div:not(:last-child) { position: relative }
.tiers div:not(:last-child)::before { content: ''; position: absolute; right: 0; top: 50%; margin-top: -1.95mm; border: 1.4mm solid transparent;
  border-left: 2.4mm solid ${C.red}; transform: translateX(1.2mm) }
.row { border-top: .3mm dotted ${C.rule}; height: 18.3mm; align-items: center }
.cell { display: flex; align-items: center; gap: 3mm; min-width: 0 }
.ph { width: 15.5mm; height: 15.5mm; object-fit: cover; border-radius: 50%; flex: none; box-shadow: 0 .5mm 1.2mm rgba(60,30,10,.28) }
.ph.none { box-shadow: none; border: .3mm dashed ${C.rule}; display: grid; place-items: center; text-align: center;
  font-size: 2mm; line-height: 1.05; color: #a8916b; font-style: italic }
.nm { font-family: 'Cormorant Garamond'; font-weight: 700; font-size: 4.25mm; letter-spacing: .07em; text-transform: uppercase; color: ${C.ink};
  white-space: nowrap; display: flex; align-items: baseline; gap: 2.2mm }
.nm .leaf { font-size: 3.2mm; align-self: center }
.pr { font-family: 'EB Garamond'; font-weight: 500; font-size: 4.1mm; letter-spacing: 0; color: ${C.red} }
.ds { font-size: 3.15mm; line-height: 1.22; margin-top: .4mm }
.nt { font-size: 2.85mm; font-style: italic; color: ${C.green}; margin-top: .3mm }
aside { padding-top: 1mm }
.band { font-family: 'Cormorant Garamond'; font-weight: 700; font-size: 5.6mm; letter-spacing: .2em; text-transform: uppercase; text-align: center;
  color: #fbf4e6; padding: 1.2mm 0 .9mm; margin-bottom: 2.4mm; clip-path: polygon(0 8%, 100% 0, 99% 100%, 1% 92%) }
.band.g { background: ${C.green} } .band.r { background: ${C.red}; margin-top: 5mm }
.sitem { display: flex; align-items: center; gap: 3mm; padding: 1.3mm 0 }
.sitem .ph { width: 14.5mm; height: 14.5mm }
.sitem { padding: 1.8mm 0 }
.box { border: .35mm solid ${C.rule}; border-radius: 1.4mm; padding: 2.6mm 3.5mm; margin-top: 5mm; font-size: 3mm; line-height: 1.3 }
.box h4 { font-family: 'Cormorant Garamond'; font-weight: 700; font-size: 3.9mm; letter-spacing: .12em; text-transform: uppercase; color: ${C.green};
  display: flex; align-items: center; gap: 2mm; margin-bottom: .6mm }
.box.gf { border-color: ${C.red} } .box.gf h4 { color: ${C.red} }
.gfm { width: 6.5mm; height: 6.5mm; border-radius: 50%; border: .35mm solid ${C.red}; display: grid; place-items: center; font-size: 2.8mm; letter-spacing: 0 }
footer { position: absolute; left: 13mm; right: 13mm; bottom: 4.5mm; display: flex; align-items: center; gap: 6mm; color: ${C.green} }
footer::before, footer::after { content: ''; flex: 1; height: .3mm; background: ${C.green}; opacity: .6 }
footer span { font-family: 'Cormorant Garamond'; font-weight: 600; font-size: 3.6mm; letter-spacing: .4em; text-transform: uppercase }
footer em { font-style: normal; font-size: 2.9mm; letter-spacing: .12em; color: ${C.red} }`;

  return head('La Pizza Napoletana — Variant A', css) + `
<div class="page">
  <header>
    ${stamp(C.red, C.red, 42)}
    <div class="brand"><h1>${esc(M.brand.name)}</h1><div class="by">${esc(M.brand.by)}</div>
      <div class="intro">${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div></div>
    ${oven(C.ink)}
  </header>
  <div class="body">
    <main>
      <div class="tiers">${M.tiers.map((t) => `<div>${t}</div>`).join('')}</div>
      ${M.pizzas.map((r) => `<div class="row">${r.map(cell).join('')}</div>`).join('')}
    </main>
    <aside>
      <div class="band g">Focaccia</div>${M.focaccia.map(side).join('')}
      <div class="band r">Dolce</div>${M.dolce.map(side).join('')}
      <div class="box"><h4>${leaf(C.green)} ${esc(M.notes.vegan.title)}</h4>${esc(M.notes.vegan.text)}</div>
      <div class="box gf"><h4><span class="gfm">GF</span>${esc(M.notes.gf.title)}</h4>${esc(M.notes.gf.text)}</div>
    </aside>
  </div>
  <footer><span>${esc(M.brand.tagline)}</span><em>${esc(M.brand.venue)}</em></footer>
</div></body></html>`;
}

// ============================================================================
// VARIANT B · "La Scala" — one hero photo per row, the row reads as a ladder.
// Red header band (with the il Mercato checks as a nod to the other shops), cream body.
// ============================================================================
function variantB() {
  const C = { paper: '#F8F1E4', red: '#A3201B', deep: '#7E1512', green: '#40603A', ink: '#2B211D', rule: '#D9C7A6', panel: '#EFE2C8' };
  const hero = (r) => r.find((p) => p && p.photo);
  const step = (p, i) => {
    if (!p) return '<div class="st empty"></div>';
    return `<div class="st"><span class="dot${i === 0 ? ' first' : ''}"></span>
      <div class="nm">${esc(p.name)}${p.vegan ? ' ' + leaf(C.green) : ''}</div>
      <div class="ds">${esc(p.desc)} <span class="pr">${price(p.price)}</span></div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div>`;
  };
  const row = (r) => {
    const h = hero(r);
    const last = r.reduce((n, p, i) => (p ? i : n), 0);
    return `<div class="row">
      ${h ? `<div class="hero"><img src="${photo(h.photo)}">${h !== r[0] ? `<small>pictured: ${esc(h.name)}</small>` : ''}</div>`
          : `<div class="hero none"><span>photo<br>to come</span></div>`}
      <div class="steps"><div class="line" style="right:${(2 - last) * 33.33 + 30}%"></div>${r.map(step).join('')}</div></div>`;
  };
  const sitem = (p) => `<div class="si"><div class="nm">${esc(p.name)}${p.vegan ? ' ' + leaf(C.green) : ''}</div>
    <div class="ds">${esc(p.desc)} <span class="pr">${price(p.price)}</span></div></div>`;
  const checks = `repeating-conic-gradient(${C.paper} 0 25%, ${C.red} 0 50%) 0 0 / 5mm 5mm`;

  const css = `
body { background: ${C.paper}; color: ${C.ink}; font-family: 'Lora', serif }
header { background: ${C.red}; color: #FBF2E2; height: 41mm; padding: 0 14mm; display: grid; grid-template-columns: auto 1fr 112mm; align-items: center; column-gap: 9mm;
  background-image: radial-gradient(ellipse at 15% 20%, rgba(255,255,255,.08), transparent 60%) }
.checks { height: 5mm; background: ${checks} }
h1 { font-family: 'DM Serif Display'; font-weight: 400; font-size: 15.5mm; line-height: 1; letter-spacing: .01em; white-space: nowrap }
.by { font-family: 'Mrs Saint Delafield'; font-size: 11.5mm; line-height: 1; margin-top: .5mm; padding-left: 62mm; color: #F3DDB4 }
.intro { font-size: 3.15mm; line-height: 1.4; border-left: .35mm solid rgba(251,242,226,.5); padding-left: 5mm }
.intro b { display: block; font-family: 'Oswald'; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; font-size: 2.85mm; margin-top: 1.4mm; color: #F3DDB4 }
.body { display: grid; grid-template-columns: 1fr 84mm; column-gap: 9mm; padding: 4.5mm 14mm 0 }
.tiers { display: grid; grid-template-columns: 22mm 1fr; column-gap: 5mm; margin-bottom: 1mm }
.tiers > div { display: grid; grid-template-columns: 1.2fr 1fr 1fr; column-gap: 5mm }
.t { font-family: 'Oswald'; font-weight: 600; font-size: 4.4mm; letter-spacing: .16em; text-transform: uppercase; color: ${C.red}; display: flex; align-items: center; gap: 2.4mm }
.t small { font-family: 'Lora'; font-style: italic; font-weight: 400; font-size: 2.8mm; letter-spacing: 0; text-transform: none; color: #7a6a58 }
.pips { display: inline-flex; gap: .9mm } .pips i { width: 2mm; height: 2mm; border-radius: 50%; border: .3mm solid; display: block }
.row { display: grid; grid-template-columns: 22mm 1fr; column-gap: 5mm; align-items: center; height: 20.1mm; border-top: .3mm solid ${C.rule} }
.hero { position: relative; width: 18mm; height: 18mm; justify-self: center }
.hero img { width: 18mm; height: 18mm; object-fit: cover; border-radius: 50%; box-shadow: 0 .6mm 1.4mm rgba(70,30,10,.3) }
.hero small { position: absolute; left: 50%; bottom: -1.4mm; transform: translateX(-50%); white-space: nowrap; font-size: 1.8mm; font-style: italic; color: #8d7b64;
  background: ${C.paper}; padding: 0 .8mm; border-radius: .6mm }
.hero.none { border: .3mm dashed ${C.rule}; border-radius: 50%; display: grid; place-items: center; text-align: center; font-size: 2mm; font-style: italic; color: #a8916b; line-height: 1.1 }
.steps { position: relative; display: grid; grid-template-columns: 1.2fr 1fr 1fr; column-gap: 5mm; align-items: start }
.line { position: absolute; left: 1mm; top: 2.15mm; height: .35mm; background: ${C.red}; opacity: .45 }
.st { position: relative; padding-left: 4.2mm; min-width: 0 }
.dot { position: absolute; z-index: 1; left: 0; top: 1.2mm; width: 2.2mm; height: 2.2mm; border-radius: 50%; background: ${C.paper}; border: .45mm solid ${C.red} }
.dot.first { background: ${C.red} }
.nm { font-family: 'DM Serif Display'; font-size: 4.6mm; line-height: 1.05; color: ${C.deep}; white-space: nowrap; display: inline-block; position: relative; background: ${C.paper}; padding-right: 2mm }
.nm .leaf { font-size: 3.4mm }
.ds { font-size: 3.05mm; line-height: 1.28; margin-top: .5mm }
.pr { font-family: 'Oswald'; font-weight: 500; font-size: 3.5mm; color: ${C.red}; margin-left: 1mm; white-space: nowrap }
.nt { font-size: 2.75mm; font-style: italic; color: ${C.green}; margin-top: .3mm }
aside .nm { background: transparent }
aside { background: ${C.panel}; border-radius: 2mm; padding: 5mm 5.5mm; align-self: start; margin-top: 1mm }
aside h3 { font-family: 'Oswald'; font-weight: 600; font-size: 4.6mm; letter-spacing: .2em; text-transform: uppercase; color: ${C.red};
  display: flex; align-items: center; gap: 2.5mm; margin-bottom: 1.6mm }
aside h3::after { content: ''; flex: 1; height: .3mm; background: ${C.red}; opacity: .4 }
aside h3.d { margin-top: 4mm }
.si { padding: 1.4mm 0 } .si .nm { font-size: 4.3mm }
.feat { display: flex; align-items: center; gap: 3.5mm; margin: 1mm 0 }
.feat img { width: 16mm; height: 16mm; object-fit: cover; border-radius: 50%; box-shadow: 0 .6mm 1.4mm rgba(70,30,10,.3) }
.note { margin-top: 4mm; font-size: 2.85mm; line-height: 1.32; padding-top: 3mm; border-top: .3mm solid ${C.rule} }
.note h4 { font-family: 'Oswald'; font-weight: 600; font-size: 3.2mm; letter-spacing: .12em; text-transform: uppercase; color: ${C.green}; margin-bottom: .6mm }
.note.gf h4 { color: ${C.red} }
footer { position: absolute; left: 0; right: 0; bottom: 0; height: 9mm; background: ${C.red}; color: #FBF2E2; display: flex; align-items: center; justify-content: space-between; padding: 0 14mm }
footer span { font-family: 'Oswald'; font-weight: 500; letter-spacing: .45em; font-size: 3.2mm; text-transform: uppercase }
footer em { font-family: 'Lora'; font-size: 2.9mm; letter-spacing: .06em }`;

  return head('La Pizza Napoletana — Variant B', css) + `
<div class="page">
  <header>
    ${stamp('#FBF2E2', '#FBF2E2', 31)}
    <div><h1>${esc(M.brand.name)}</h1><div class="by">${esc(M.brand.by)}</div></div>
    <div class="intro">${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div>
  </header>
  <div class="checks"></div>
  <div class="body">
    <main>
      <div class="tiers"><span></span><div>
        <div class="t"><span class="pips">${pips(1, C.red, C.red)}</span>Classic</div>
        <div class="t"><span class="pips">${pips(2, C.red, C.red)}</span>Level up</div>
        <div class="t"><span class="pips">${pips(3, C.red, C.red)}</span>Go all in</div></div></div>
      ${M.pizzas.map(row).join('')}
    </main>
    <aside>
      <h3>Focaccia</h3>
      <div class="feat">${M.focaccia[1].photo ? `<img src="${photo(M.focaccia[1].photo)}">` : ''}<div>${M.focaccia.map(sitem).join('')}</div></div>
      <h3 class="d">Dolce</h3>${M.dolce.map(sitem).join('')}
      <div class="note"><h4>${leaf(C.green)} ${esc(M.notes.vegan.title)}</h4>${esc(M.notes.vegan.text)}</div>
      <div class="note gf"><h4>${esc(M.notes.gf.title)}</h4>${esc(M.notes.gf.text)}</div>
    </aside>
  </div>
  <footer><span>${esc(M.brand.tagline)}</span><em>${esc(M.brand.venue)}</em></footer>
</div></body></html>`;
}

// ============================================================================
// VARIANT C · "Lavagna" — typographic, no photos. Built for big print / wall board.
// Red brand column on the left, large type, the ladder shown by type weight and colour.
// ============================================================================
function variantC() {
  const C = { paper: '#F7EFE0', red: '#B0241C', deep: '#861A14', green: '#3F5E38', ink: '#271E1A', rule: '#D6C29F' };
  const cell = (p, i) => {
    if (!p) return '<div class="c empty"></div>';
    return `<div class="c t${i}"><div class="nm"><span>${esc(p.name)}</span><b class="pr">${price(p.price)}</b>${p.vegan ? leaf(C.green) : ''}</div>
      <div class="ds">${esc(p.desc)}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div>`;
  };
  const extra = (p) => `<div class="c"><div class="nm"><span>${esc(p.name)}</span><b class="pr">${price(p.price)}</b>${p.vegan ? leaf(C.green) : ''}</div><div class="ds">${esc(p.desc)}</div></div>`;

  const css = `
body { background: ${C.paper}; color: ${C.ink}; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14 }
.page { display: grid; grid-template-columns: 92mm 1fr }
.brand { background: ${C.red}; color: #FBF1DF; padding: 13mm 10mm 10mm 12mm; display: flex; flex-direction: column; position: relative;
  background-image: radial-gradient(ellipse at 0% 0%, rgba(255,255,255,.1), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(0,0,0,.18), transparent 60%) }
.brand::after { content: ''; position: absolute; top: 0; bottom: 0; right: 0; width: 4mm;
  background: repeating-conic-gradient(${C.paper} 0 25%, ${C.red} 0 50%) 0 0 / 4mm 4mm }
h1 { font-weight: 900; font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; font-size: 14.6mm; line-height: .86; letter-spacing: -.01em }
.by { font-family: 'Mrs Saint Delafield'; font-size: 12mm; line-height: 1; color: #F6D9A8; margin: 1.5mm 0 0 14mm; white-space: nowrap }
.intro { font-size: 3.5mm; line-height: 1.45; margin-top: 7mm; font-variation-settings: 'opsz' 14 }
.intro b { display: block; margin-top: 2.5mm; font-weight: 600; font-style: italic; color: #F6D9A8 }
.how { margin-top: 7mm; border-top: .35mm solid rgba(251,241,223,.4); padding-top: 4mm; font-size: 3.1mm; line-height: 1.4 }
.how h4, .notes h4 { font-weight: 800; font-size: 3.4mm; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 1.2mm; font-variation-settings: 'opsz' 14 }
.how ol { list-style: none } .how li { display: flex; gap: 2.5mm; margin: .9mm 0 }
.how li b { width: 5mm; height: 5mm; border-radius: 50%; border: .35mm solid #FBF1DF; display: grid; place-items: center; font-size: 2.6mm; flex: none }
.notes { font-size: 2.85mm; line-height: 1.38 }
.notes > div { margin-top: 3.5mm }
.stampwrap { margin: auto 0; align-self: center; opacity: .9 }
main { padding: 11mm 12mm 0 11mm; position: relative }
.tiers, .row { display: grid; grid-template-columns: 1.25fr 1fr 1fr; column-gap: 7mm }
.tiers > div { font-weight: 800; font-size: 5.2mm; letter-spacing: .16em; text-transform: uppercase; color: ${C.red}; padding-bottom: 2mm;
  border-bottom: .7mm solid ${C.red}; display: flex; justify-content: space-between; align-items: baseline; font-variation-settings: 'opsz' 14 }
.tiers > div small { font-weight: 400; font-style: italic; font-size: 3mm; letter-spacing: 0; text-transform: none; color: #8a735a }
.row { border-bottom: .3mm solid ${C.rule}; height: 19.4mm; align-items: center }
.c { min-width: 0 }
.nm { display: flex; align-items: baseline; gap: 2.4mm; white-space: nowrap }
.nm span { font-weight: 700; font-size: 5.3mm; letter-spacing: -.005em; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.t0 .nm span { color: ${C.ink} } .t1 .nm span { color: ${C.deep} } .t2 .nm span { color: ${C.red}; font-weight: 900 }
.pr { font-weight: 600; font-size: 4.2mm; color: ${C.red} }
.nm .leaf { font-size: 3.6mm; align-self: center }
.ds { font-size: 3.35mm; line-height: 1.28; margin-top: .4mm; color: #3d322b }
.nt { font-size: 2.9mm; font-style: italic; color: ${C.green}; margin-top: .3mm }
.extras { display: grid; grid-template-columns: .72fr 1.28fr; column-gap: 9mm; margin-top: 7mm }
.extras h3 { font-weight: 800; font-size: 4.6mm; letter-spacing: .16em; text-transform: uppercase; color: ${C.red}; border-bottom: .7mm solid ${C.red};
  padding-bottom: 1.5mm; margin-bottom: 1.5mm; font-variation-settings: 'opsz' 14 }
.extras .list { display: grid; grid-template-columns: 1fr 1fr; gap: 1.6mm 6mm }
.extras .list.three { grid-template-columns: 1fr 1fr 1fr }
.extras .nm span { font-size: 4.5mm }
footer { position: absolute; left: 11mm; right: 12mm; bottom: 5mm; display: flex; justify-content: space-between; font-size: 3mm; letter-spacing: .4em;
  text-transform: uppercase; color: ${C.green}; font-weight: 600 }`;

  return head('La Pizza Napoletana — Variant C', css) + `
<div class="page">
  <section class="brand">
    <h1>La Pizza<br>Napoletana</h1><div class="by">${esc(M.brand.by)}</div>
    <div class="intro">${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div>
    <div class="how"><h4>How to read the menu</h4><ol>
      <li><b>1</b><span><strong>Classic</strong>: the flavour as Naples makes it.</span></li>
      <li><b>2</b><span><strong>Level up</strong>: the same pizza with a twist.</span></li>
      <li><b>3</b><span><strong>Go all in</strong>: loaded with more on top.</span></li></ol></div>
    <div class="stampwrap">${stamp('#F6D9A8', '#FBF1DF', 34)}</div>
    <div class="notes">
      <div><h4>${leaf('#FBF1DF')} ${esc(M.notes.vegan.title)}</h4>${esc(M.notes.vegan.text)}</div>
      <div><h4>${esc(M.notes.gf.title)}</h4>${esc(M.notes.gf.text)}</div>
      <div style="opacity:.85;letter-spacing:.12em;text-transform:uppercase;font-size:2.6mm">${esc(M.brand.venue)}</div>
    </div>
  </section>
  <main>
    <div class="tiers">${M.tiers.map((t, i) => `<div>${t}<small>${['the original', 'a little more', 'everything on it'][i]}</small></div>`).join('')}</div>
    ${M.pizzas.map((r) => `<div class="row">${r.map(cell).join('')}</div>`).join('')}
    <div class="extras">
      <div><h3>Focaccia</h3><div class="list">${M.focaccia.map(extra).join('')}</div></div>
      <div><h3>Dolce</h3><div class="list three">${M.dolce.map(extra).join('')}</div></div>
    </div>
    <footer><span>${esc(M.brand.tagline)}</span></footer>
  </main>
</div></body></html>`;
}

// ============================================================================
// il MERCATO versions — the il Mercato Centrale look (cream, strong red, Lilita title,
// red/cream checks, round photos), three columns Classic → Level up → Go all in.
//   mercato-long: the manager's long list (menu-data.js), every row a ladder, focaccia + dolce sidebar
//   mercato-final: the final 13-pizza list (menu-final.js), only row 1 is a ladder, no sidebar
// ============================================================================
const F = require('./menu-final');
const C_M = { paper: '#FDFBEF', red: '#C40001', deep: '#8E1410', ink: '#3A1E18', band: '#F7E9D6', rule: '#EAD8C0', blue: '#B9CBD6' };

function mercato({ title, rows, ladder, side, big }) {
  const C = C_M;
  const S = big
    ? { row: 40.5, ph: 31, nm: 6.4, ds: 3.9, nt: 3.4, gap: 6 }
    : { row: 18.6, ph: 15.5, nm: 4.5, ds: 3.1, nt: 2.8, gap: 5 };
  const diet = (p) => p.diet || (p.vegan ? 'V, Ve' : '');
  const cell = (p) => {
    if (!p) return '<div class="cell empty"></div>';
    const img = photo(p.photo) ? `<img class="ph" src="${photo(p.photo)}">` : `<div class="ph none"><span>photo<br>to come</span></div>`;
    return `<div class="cell">${img}<div class="tx">
      <div class="nm">${esc(p.name)} <span class="pr">$${price(p.price)}</span></div>
      <div class="ds">${esc(p.desc)}${diet(p) ? ` <b class="dt">${diet(p)}</b>` : ''}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div></div>`;
  };
  const arrow = `<svg class="arr" viewBox="0 0 24 24"><path d="M4 12h13M12 6l6 6-6 6" fill="none" stroke="${C.red}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const row = (r, i) => {
    const isLadder = ladder === 'all' || i === 0;
    const cells = r.map(cell);
    if (!side && !r[1] && !r[2]) return `<div class="row">${cells[0]}<div class="sep"></div><div class="infobox">${info}</div></div>`;
    return `<div class="row${i === 0 ? ' hero' : ''}">${cells[0]}<div class="sep">${isLadder && r[1] ? arrow : ''}</div>${cells[1]}<div class="sep">${isLadder && r[2] ? arrow : ''}</div>${cells[2]}</div>`;
  };
  const sitem = (p) => `<div class="si"><div class="nm">${esc(p.name)} <span class="pr">$${price(p.price)}</span></div><div class="ds">${esc(p.desc)}${diet(p) ? ` <b class="dt">${diet(p)}</b>` : ''}</div></div>`;
  const checks = (h) => `repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / ${h}mm ${h}mm`;

  const css = `
body { background: ${C.paper}; color: ${C.ink}; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14 }
.page { padding: 8mm 12mm 0; background: ${C.paper} }
header { display: grid; grid-template-columns: 74mm minmax(0, 1fr) ${side ? '92mm' : '86mm'}; align-items: center; height: ${big ? 40 : 38}mm; column-gap: 8mm }
.logo { width: 70mm }
h1 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: ${big ? 23.5 : 22}mm; line-height: .9; text-align: center; text-transform: uppercase;
  transform: scaleX(.86); letter-spacing: .01em; white-space: nowrap }
.intro { font-size: 3.05mm; line-height: 1.38; color: ${C.deep}; border-left: .5mm solid ${C.red}; padding-left: 4mm }
.intro b { display: block; margin-top: 1mm; font-weight: 700; color: ${C.red} }
.checks { height: 7mm; background: ${checks(7)}; margin: 1mm 0 4mm }
.body { display: grid; grid-template-columns: 1fr ${side ? '82mm' : ''}; column-gap: 8mm }
.tiers, .row { display: grid; grid-template-columns: 1fr ${S.gap + 4}mm 1fr ${S.gap + 4}mm 1fr; align-items: center }
.tiers { margin-bottom: 2mm }
.tiers .t { justify-self: start; background: ${C.red}; color: ${C.paper}; font-family: 'Lilita One'; font-size: ${big ? 7.4 : 6}mm; line-height: 1;
  padding: 1.6mm 7mm 2mm; border-radius: 50%/60%; letter-spacing: .02em }
.tiers .t span { display: inline-block; transform: scaleX(.92) }
.tiers .t small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .9; margin-left: 2mm }
.tiers .sep { height: .5mm; background: ${C.red}; opacity: .35 }
.row { height: ${S.row}mm; border-top: .35mm dashed ${C.rule} }
.row.hero { background: ${C.band}; border-radius: 3mm; border-top: none; margin-bottom: ${big ? 1.5 : .8}mm }
.row.hero .cell:first-child { padding-left: ${big ? 3 : 2}mm }
.row.hero + .row { border-top: none }
.sep { display: grid; place-items: center } .arr { width: ${big ? 7 : 5}mm; height: ${big ? 7 : 5}mm }
.cell { display: flex; align-items: center; gap: ${big ? 4.5 : 3}mm; min-width: 0 }
.ph { width: ${S.ph}mm; height: ${S.ph}mm; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 .7mm 1.6mm rgba(80,30,10,.28) }
.ph.none { box-shadow: none; border: .4mm dashed ${C.rule}; display: grid; place-items: center; text-align: center; font-size: ${big ? 2.8 : 2}mm; font-style: italic; color: #b59a7a; line-height: 1.1 }
.nm { font-weight: 700; font-size: ${S.nm}mm; color: ${C.red}; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { white-space: nowrap }
.ds { font-size: ${S.ds}mm; line-height: 1.28; margin-top: ${big ? 1 : .5}mm; color: ${C.ink} }
.dt { font-weight: 700; color: ${C.red}; font-size: .9em; white-space: nowrap }
.nt { font-size: ${S.nt}mm; font-style: italic; color: ${C.deep}; margin-top: .6mm }
aside { align-self: start }
aside h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 7mm; color: ${C.paper}; background: ${C.red}; text-align: center; padding: 1.2mm 0 1.6mm; border-radius: 50%/60%; margin-bottom: 2mm }
aside h3.d { margin-top: 5mm }
.si { padding: 1.6mm 0; border-bottom: .35mm dashed ${C.rule} } .si .nm { font-size: 4.4mm }
.note { margin-top: 4.5mm; font-size: 2.9mm; line-height: 1.32; border: .4mm solid ${C.red}; border-radius: 2mm; padding: 2.4mm 3.2mm }
.note h4 { font-family: 'Lilita One'; font-weight: 400; font-size: 4.2mm; color: ${C.red}; margin-bottom: .6mm }
.foot { position: absolute; left: 12mm; right: 12mm; bottom: 9mm; display: flex; justify-content: space-between; align-items: flex-end; gap: 10mm; font-size: ${big ? 3.2 : 2.9}mm; color: ${C.deep} }
.foot b { color: ${C.red} }
.foot .gf { max-width: ${big ? 190 : 150}mm; line-height: 1.3 }
.infobox { grid-column: 3 / 6; align-self: center; border: .5mm solid ${C.red}; border-radius: 3mm; padding: 4mm 6mm; font-size: ${S.ds - .2}mm; line-height: 1.35;
  display: grid; grid-template-columns: 1fr auto; column-gap: 8mm; align-items: center }
.infobox h4 { font-family: 'Lilita One'; font-weight: 400; font-size: ${S.nm - .6}mm; color: ${C.red}; margin-bottom: .8mm }
.infobox .legend { font-size: ${S.ds}mm; color: ${C.deep}; line-height: 1.5; white-space: nowrap } .infobox .legend b { color: ${C.red} }
.bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 5mm; background: ${checks(5)} }`;

  const intro = `${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b>`;
  const info = `<div><h4>GF bases available</h4>${esc(M.notes.gf.text)}</div><div class="legend"><b>V</b> vegetarian<br><b>Ve</b> vegan<br>Vegan? Just ask.</div>`;
  const hasInfoRow = !side && rows.some((r) => r[0] && !r[1] && !r[2]);
  const tierNotes = ['the classic flavours', 'a little more', 'everything on it'];
  return head(`il Mercato Centrale — ${title}`, css) + `
<div class="page">
  <header>
    <img class="logo" src="../brand/il-mercato-logo.png">
    <h1>${esc(title)}</h1>
    <div class="intro">${intro}</div>
  </header>
  <div class="checks"></div>
  <div class="body">
    <main>
      <div class="tiers">${F.tiers.map((t, i) => `<div class="t"><span>${t}</span><small>${tierNotes[i]}</small></div>`).join('<div class="sep"></div>')}</div>
      ${rows.map(row).join('')}
    </main>
    ${side ? `<aside>
      <h3>Focaccia</h3>${M.focaccia.map(sitem).join('')}
      <h3 class="d">Dolce</h3>${M.dolce.map(sitem).join('')}
      <div class="note"><h4>Vegan? Just ask</h4>${esc(M.notes.vegan.text)}</div>
      <div class="note"><h4>GF bases available</h4>${esc(M.notes.gf.text)}</div>
    </aside>` : ''}
  </div>
  ${hasInfoRow ? '' : `<div class="foot"><div></div><div><b>V</b> vegetarian · <b>Ve</b> vegan</div></div>`}
  <div class="bottom"></div>
</div></body></html>`;
}
const mercatoLong = () => mercato({ title: 'Pizza Napoletana', rows: M.pizzas, ladder: 'all', side: true, big: false });
const mercatoFinal = () => mercato({ title: 'Pizza Napoletana', rows: F.pizzas, ladder: 'first', side: false, big: true });

// ---------- render ----------
const VARIANTS = { a: variantA, b: variantB, c: variantC, 'mercato-long': mercatoLong, 'mercato-final': mercatoFinal };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VARIANTS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `variant-${k}.html`);
    fs.writeFileSync(file, VARIANTS[k]());
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `variant-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `variant-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
