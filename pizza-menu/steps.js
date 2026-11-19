// Pizza menu in the step-by-step style of the Pasta & Gnocchi menu (../pasta-menu/combo2.js, version 3). A3 landscape.
//   1 · Pick your base    Samuele's classic dough or the gluten-free base
//   2 · Pick your pizza   Rossa (tomato base) and Bianca (white base) rows, with the Margherita → Bufalina → Prosciutto ladder
// Uses the 13-pizza list in menu-final.js and the intro / GF / vegan text in menu-data.js.
// Usage: node steps.js   → output/variant-steps.pdf/.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const M = require('./menu-data');
const F = require('./menu-final');

const OUT = path.join(__dirname, 'output');
const PAGE = { w: 420, h: 297 };
const C = { paper: '#FDFBEF', red: '#C40001', deep: '#8E1410', ink: '#3A1E18', band: '#F7E9D6', rule: '#EAD8C0', blue: '#B9CBD6' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const money = (p) => (Number.isInteger(p) ? String(p) : p.toFixed(2));

// ---------------------------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------------------------
const all = Object.fromEntries(F.pizzas.flat().filter(Boolean).map((p) => [p.name, p]));
const pick = (...names) => names.map((n) => all[n]);
const LADDER = ['Margherita', 'Bufalina', 'Prosciutto']; // same pizza, buffalo mozzarella and prosciutto added
const ROSSA = pick('Marinara', 'Margherita', 'Bufalina', 'Prosciutto', 'Hawaiian', 'Diavola', 'Capricciosa', 'La Porcona');
// Napoletana is in Bianca because its description lists no tomato (still to confirm with the manager).
const BIANCA = pick('Cheesy Garlic', 'Napoletana', 'Vegetarian', 'Salsiccia & Patate', 'Gamberi');
const SHORT = { // tighter descriptions for the cards; the rest use menu-final.js as written
  Bufalina: '+ buffalo mozzarella',
  Prosciutto: '+ buffalo mozzarella & prosciutto',
  'La Porcona': 'Mozzarella, pork sausage, ham & spicy salame',
};

// ---------------------------------------------------------------------------------------------
// Illustrated bases (same drawing style as the pasta shapes)
// ---------------------------------------------------------------------------------------------
const GOLD = '#F0C25E', GOLD_DARK = '#C98B2B', LINE = '#8E1410', TOMATO = '#D9381E', MOZZ = '#FFF7E2', BASIL = '#3E8B3A';
const pizzaSvg = (gf) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="52" r="38" fill="${GOLD}" stroke="${LINE}" stroke-width="2.6"/>
  ${[[22, 40], [30, 78], [74, 80], [82, 48], [60, 18]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.2" fill="${GOLD_DARK}" opacity=".6"/>`).join('')}
  <circle cx="50" cy="52" r="29" fill="${TOMATO}" stroke="${LINE}" stroke-width="1.8"/>
  ${[[38, 42, 7], [60, 40, 6], [50, 60, 7.5], [34, 62, 5.5], [66, 62, 5.5]].map(([x, y, r]) =>
    `<path d="M${x - r} ${y} C${x - r} ${y - r} ${x + r} ${y - r - 1} ${x + r} ${y} C${x + r} ${y + r * .9} ${x - r} ${y + r} ${x - r} ${y} Z" fill="${MOZZ}" stroke="${LINE}" stroke-width="1.2"/>`).join('')}
  ${[[47, 46, -30], [58, 54, 40], [42, 56, 110]].map(([x, y, r]) =>
    `<path d="M0 -6 C4 -3 4 3 0 6 C-4 3 -4 -3 0 -6 Z" transform="translate(${x} ${y}) rotate(${r})" fill="${BASIL}" stroke="#20501E" stroke-width=".9"/>`).join('')}
  ${gf ? `<circle cx="80" cy="20" r="16" fill="${C.red}" stroke="${C.paper}" stroke-width="2"/>
    <text x="80" y="26" text-anchor="middle" font-family="Lilita One" font-size="16" fill="${C.paper}">GF</text>` : ''}
</svg>`;

// ---------------------------------------------------------------------------------------------
function render() {
  const card = (p) => `<div class="card"><div class="pw"><img class="ph" src="../photos/${p.photo}.jpg"></div>
    <div class="nm">${esc(p.name)}</div><div class="price">$${money(p.price)}${p.diet ? ` <span class="dt">${p.diet.replace(/,\s*/g, ' · ')}</span>` : ''}</div>
    <div class="ds">${esc(SHORT[p.name] || p.desc)}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div>`;
  const arrow = `<svg viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="${C.paper}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rossa = ROSSA.map((p) => (LADDER.includes(p.name) ? null : card(p)));
  const li = ROSSA.findIndex((p) => p.name === LADDER[0]);
  const ladder = `<div class="ladder"><div class="tag">Same pizza, level it up</div>
    ${LADDER.map((n) => card(all[n])).join('')}<i class="a1">${arrow}</i><i class="a2">${arrow}</i></div>`;
  rossa.splice(li, LADDER.length, ladder);

  const css = `
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: 8mm 12mm 0 }
img { display: block } svg { display: block; width: 100%; height: 100% }
header { display: grid; grid-template-columns: 74mm minmax(0, 1fr) 86mm; align-items: center; height: 36mm; column-gap: 8mm }
.logo { width: 68mm }
h1 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 23mm; line-height: .9; text-align: center; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap }
.intro { font-size: 3.15mm; line-height: 1.38; color: ${C.deep}; border-left: .5mm solid ${C.red}; padding-left: 4mm }
.intro b { display: block; margin-top: 1mm; color: ${C.red} }
.checks { height: 7mm; background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / 7mm 7mm; margin: 1mm 0 4mm }
.bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 5mm; background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / 5mm 5mm }
.step { display: flex; align-items: center; gap: 3mm; margin-bottom: 2mm }
.step b { width: 9mm; height: 9mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: grid; place-items: center; font-family: 'Lilita One'; font-weight: 400; font-size: 5.6mm }
.step h3 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 7.4mm; line-height: 1 }
.step span { font-style: italic; color: ${C.deep}; font-size: 3.6mm; margin-left: 2mm }
.bases { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-bottom: 4mm }
.base { background: ${C.band}; border-radius: 3mm; height: 28mm; display: grid; grid-template-columns: 24mm 1fr; column-gap: 5mm; align-items: center; padding: 0 7mm 0 5mm }
.base .ic { width: 24mm; height: 24mm }
.base h4 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 6.6mm; line-height: 1; margin-bottom: 1.2mm }
.base p { font-size: 3.35mm; line-height: 1.32; color: ${C.ink} }
.base.gf { background: ${C.red} } .base.gf h4, .base.gf p { color: ${C.paper} }
.rows { display: grid; grid-template-columns: 15mm 1fr; row-gap: 3mm }
.lab { display: grid; place-items: center; border-radius: 3mm; background: ${C.red}; margin-right: 3mm; position: relative }
.lab span { font-family: 'Lilita One'; color: ${C.paper}; font-size: 7.4mm; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap }
.lab small { position: absolute; bottom: 3mm; left: 50%; transform: translateX(-50%) rotate(180deg); writing-mode: vertical-rl; font-size: 2.8mm; font-style: italic; color: ${C.paper}; opacity: .85; white-space: nowrap }
.cards { display: grid; grid-template-columns: repeat(8, 1fr); column-gap: 3.5mm; height: 84mm; align-items: start; align-content: center }
.card { display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 0; position: relative; z-index: 1 }
.card .pw { height: 33mm; display: flex; align-items: center; justify-content: center; margin-bottom: 1.8mm }
.card .ph { width: 32mm; height: 32mm; border-radius: 50%; object-fit: cover; box-shadow: 0 .7mm 1.6mm rgba(80,30,10,.28) }
.card .nm { font-weight: 700; color: ${C.red}; font-size: 4.5mm; line-height: 1.1; min-height: 10mm; display: flex; align-items: center; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.card .price { font-family: 'Lilita One'; color: ${C.paper}; background: ${C.red}; border-radius: 4mm; font-size: 4.8mm; padding: .5mm 3.2mm .8mm; margin: .8mm 0 1.4mm; line-height: 1; white-space: nowrap }
.card .price .dt { font-family: 'Fraunces'; font-weight: 700; font-size: .72em; margin-left: .8mm; opacity: .92 }
.card .ds { font-size: 3.3mm; line-height: 1.25 }
.card .nt { font-size: 3.05mm; margin-top: .7mm; font-style: italic; color: ${C.deep} }
.ladder { grid-column: span 3; display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 3.5mm; position: relative; padding: 5mm 0 3mm; margin-top: -5mm }
.ladder::before { content: ''; position: absolute; inset: 0 -1.5mm; background: ${C.band}; border-radius: 4mm }
.ladder .tag { position: absolute; top: -3.4mm; left: 50%; transform: translateX(-50%); z-index: 2; background: ${C.blue}; color: ${C.red}; font-family: 'Lilita One'; font-size: 4.6mm;
  padding: .9mm 6mm 1.3mm; border-radius: 50%; white-space: nowrap; line-height: 1 }
.ladder i { position: absolute; z-index: 2; top: 18mm; width: 7.5mm; height: 7.5mm; border-radius: 50%; background: ${C.red}; padding: 1.2mm; box-shadow: 0 0 0 .8mm ${C.band} }
.ladder .a1 { left: calc(33.333% - 3.75mm) } .ladder .a2 { left: calc(66.666% - 3.75mm) }
.info { grid-column: span 3; align-self: center; height: 64mm; display: grid; grid-template-columns: 44mm 1fr; column-gap: 6mm; align-items: center;
  border: .5mm solid ${C.red}; border-radius: 3mm; padding: 4mm 7mm 4mm 5mm }
.stamp { width: 44mm; height: 44mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: grid; place-items: center; text-align: center; transform: rotate(-8deg);
  box-shadow: 0 0 0 1.2mm ${C.paper}, 0 0 0 1.6mm ${C.red} }
.stamp span { font-family: 'Lilita One'; font-size: 5.6mm; line-height: 1.05; padding: 0 4mm }
.info h4 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 6mm; line-height: 1; margin-bottom: 1.2mm }
.info p { font-size: 3.5mm; line-height: 1.35; margin-bottom: 3mm } .info p:last-child { margin-bottom: 0 }
.info .leg b { color: ${C.red} }`;

  const intro = `${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>il Mercato Centrale — Pizza Napoletana (steps)</title>
<link rel="stylesheet" href="../fonts/fonts.css"><style>${css}</style></head><body><div class="page">
  <header><img class="logo" src="../brand/il-mercato-logo.png"><h1>Pizza Napoletana</h1><div class="intro">${intro}</div></header>
  <div class="checks"></div>
  <div class="step"><b>1</b><h3>Pick your base</h3><span>Every pizza comes on either base</span></div>
  <div class="bases">
    <div class="base"><div class="ic">${pizzaSvg(false)}</div><div><h4>Samuele’s dough</h4>
      <p>Our classic base, made by Samuele with traditional Napoletana and contemporanea techniques.</p></div></div>
    <div class="base gf"><div class="ic">${pizzaSvg(true)}</div><div><h4>Gluten-free base</h4>
      <p>Made in-house by Samuele, who holds a Coeliac Australia certificate. Cooked in the same oven as our regular bases, so we can’t guarantee no cross-contact.</p></div></div>
  </div>
  <div class="step"><b>2</b><h3>Pick your pizza</h3></div>
  <div class="rows">
    <div class="lab"><span>Rossa</span></div><div class="cards">${rossa.join('')}</div>
    <div class="lab"><span>Bianca</span></div><div class="cards">${BIANCA.map(card).join('')}
      <div class="info"><div class="stamp"><span>${esc(M.brand.tagline).replace(/\. /g, '.<br>')}</span></div><div>
        <h4>Rossa or bianca?</h4><p>Rossa pizzas start with San Marzano tomato. Bianca pizzas have a white base, like mozzarella or zucchini cream.</p>
        <h4>Vegan? Just ask</h4><p>${esc(M.notes.vegan.text)}</p>
        <p class="leg"><b>V</b> vegetarian · <b>Ve</b> vegan</p></div></div></div>
  </div>
  <div class="bottom"></div>
</div></body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  const file = path.join(OUT, 'variant-steps.html');
  fs.writeFileSync(file, render());
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, 'variant-steps.png') });
  await page.pdf({ path: path.join(OUT, 'variant-steps.pdf'), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
  console.log('built steps');
  await browser.close();
})();
