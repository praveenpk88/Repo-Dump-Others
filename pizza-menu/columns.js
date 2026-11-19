// Pizza menu in the style of the Pasta & Gnocchi version 1 (../pasta-menu/combo2.js): A3 landscape,
// a "Pick your base" band on top (like "Pick your shape"), then three columns by what's on the pizza:
// Veggie · With meat · From the sea. Uses the 13-pizza list in menu-final.js and the text in menu-data.js.
// Usage: node columns.js   → output/variant-columns.pdf/.png
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
const NOTES = { // the Margherita → Bufalina → Prosciutto ladder, told through notes
  Bufalina: 'Our Margherita + buffalo mozzarella',
  Prosciutto: 'Our Bufalina + prosciutto',
};
const COLUMNS = [
  { name: 'Veggie', note: 'no meat', items: ['Cheesy Garlic', 'Marinara', 'Margherita', 'Bufalina', 'Vegetarian'] },
  { name: 'With meat', note: 'salumi & sausage', items: ['Hawaiian', 'Diavola', 'Salsiccia & Patate', 'Prosciutto', 'Capricciosa', 'La Porcona'] },
  { name: 'From the sea', note: 'anchovies & prawns', items: ['Napoletana', 'Gamberi'] },
];
const PHOTO = { 5: 26, 6: 23, 2: 30 }; // photo size (mm) by how many pizzas share the column

// Illustrated bases (same drawing style as the pasta shapes)
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
  const diet = (p) => (p.diet ? ` <b class="dt">${p.diet.replace(/,\s*/g, ' · ')}</b>` : '');
  const item = (p, h) => `<div class="it"><div class="pb" style="width:${h}mm"><img class="ph" src="../photos/${p.photo}.jpg" style="width:${h}mm; height:${h}mm"></div><div class="tx">
    <div class="nm">${esc(p.name)} <span class="pr">$${money(p.price)}</span></div>
    <div class="ds">${esc(p.desc)}${diet(p)}</div>${NOTES[p.name] || p.note ? `<div class="nt">${esc(NOTES[p.name] || p.note)}</div>` : ''}</div></div>`;
  const cols = COLUMNS.map((c, ci) => {
    const h = PHOTO[c.items.length];
    const arrow = `<i><svg viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="${C.paper}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></i>`;
    const ladder = ci === 2 ? `<div class="ladder"><div class="tag">Level up your Margherita</div><div class="steps">${['Margherita', 'Bufalina', 'Prosciutto'].map((n, i) =>
      `${i ? arrow : ''}<div class="st"><img src="../photos/${all[n].photo}.jpg"><b>${n}</b><span>$${money(all[n].price)}</span><small>${['the classic', '+ buffalo mozzarella', '+ prosciutto'][i]}</small></div>`).join('')}</div></div>` : '';
    const info = ci === 2 ? ladder + `<div class="info"><div class="stamp"><span>${esc(M.brand.tagline).replace(/\. /g, '.<br>')}</span></div>
      <div><h4>Vegan? Just ask</h4><p>${esc(M.notes.vegan.text)}</p><p class="leg"><b>V</b> vegetarian · <b>Ve</b> vegan</p></div></div>` : '';
    return `<div class="col${ci === 2 ? ' sea' : ''}">${c.items.map((n) => item(all[n], h)).join('')}${info}</div>`;
  });

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
.bases { display: grid; grid-template-columns: 34mm 1fr 1fr 118mm; column-gap: 6mm; align-items: center; background: ${C.band}; border-radius: 3mm; padding: 2mm 6mm; height: 27mm; margin-bottom: 3mm }
.bases h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 7mm; line-height: .95; color: ${C.red} }
.bases .opt { display: flex; align-items: center; gap: 3.5mm }
.bases .ic { width: 19mm; height: 19mm; flex: none }
.bases .opt b { display: block; font-weight: 700; color: ${C.red}; font-size: 4.4mm; line-height: 1.1; font-variation-settings: 'opsz' 48 }
.bases .opt span { font-size: 3.3mm; color: ${C.ink} }
.bases .opt.gf b { background: ${C.red}; color: ${C.paper}; display: inline-block; padding: .3mm 2.6mm .6mm; border-radius: 5mm; margin-bottom: .6mm }
.bases .why { font-size: 3.1mm; line-height: 1.32; color: ${C.deep}; border-left: .4mm solid ${C.red}; padding-left: 4mm }
.bases .why b { display: block; color: ${C.red}; font-size: 3.7mm; margin-bottom: .3mm }
.heads, .grid { display: grid; grid-template-columns: 1fr 6mm 1fr 6mm 1fr }
.oval { justify-self: start; font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap;
  font-size: 7mm; padding: 1.6mm 7mm 2mm; margin-bottom: 2.5mm }
.oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .92; margin-left: 2mm }
.grid { height: 182mm }
.ladder { position: relative; background: ${C.band}; border-radius: 3mm; padding: 7mm 4mm 3.5mm; margin-top: auto }
.ladder .tag { position: absolute; top: -3.6mm; left: 50%; transform: translateX(-50%); background: ${C.blue}; color: ${C.red}; font-family: 'Lilita One'; font-size: 4.8mm;
  padding: 1mm 6mm 1.4mm; border-radius: 50%; white-space: nowrap; line-height: 1 }
.ladder .steps { display: flex; align-items: flex-start; justify-content: space-between }
.ladder .st { display: flex; flex-direction: column; align-items: center; text-align: center; width: 33mm }
.ladder .st img { width: 22mm; height: 22mm; border-radius: 50%; object-fit: cover; box-shadow: 0 .6mm 1.4mm rgba(80,30,10,.28); margin-bottom: 1.4mm }
.ladder .st b { color: ${C.red}; font-size: 4mm; line-height: 1.1; font-variation-settings: 'opsz' 48 }
.ladder .st span { font-family: 'Lilita One'; color: ${C.paper}; background: ${C.red}; border-radius: 3mm; font-size: 3.8mm; padding: .3mm 2.4mm .6mm; margin: .8mm 0 .6mm; line-height: 1 }
.ladder .st small { font-size: 2.9mm; font-style: italic; color: ${C.deep} }
.ladder i { width: 6.5mm; height: 6.5mm; border-radius: 50%; background: ${C.red}; padding: 1mm; margin-top: 8mm; flex: none }
.col { display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 2mm }
.vline { width: .35mm; background: ${C.rule}; justify-self: center }
.it { display: flex; align-items: center; gap: 3.5mm; min-width: 0 }
.pb { display: flex; justify-content: center; flex: none }
.ph { border-radius: 50%; object-fit: cover; box-shadow: 0 .7mm 1.6mm rgba(80,30,10,.28) }
.nm { font-weight: 700; color: ${C.red}; font-size: 4.9mm; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { white-space: nowrap }
.ds { font-size: 3.35mm; line-height: 1.28; margin-top: .6mm }
.dt { font-weight: 700; color: ${C.red}; font-size: .9em; white-space: nowrap }
.nt { font-size: 3.15mm; margin-top: .5mm; font-style: italic; color: ${C.deep} }
.col.sea { justify-content: flex-start; gap: 7mm }
.info { margin-top: 5mm; border: .5mm solid ${C.red}; border-radius: 3mm; padding: 5mm 6mm; display: grid; grid-template-columns: 38mm 1fr; column-gap: 6mm; align-items: center }
.stamp { width: 38mm; height: 38mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: grid; place-items: center; text-align: center; transform: rotate(-8deg);
  box-shadow: 0 0 0 1.2mm ${C.paper}, 0 0 0 1.6mm ${C.red} }
.stamp span { font-family: 'Lilita One'; font-size: 4.9mm; line-height: 1.05; padding: 0 3mm }
.info h4 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 6mm; line-height: 1; margin-bottom: 1.2mm }
.info p { font-size: 3.5mm; line-height: 1.35; margin-bottom: 3mm } .info p:last-child { margin-bottom: 0 } .info .leg b { color: ${C.red} }`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>il Mercato Centrale — Pizza Napoletana (columns)</title>
<link rel="stylesheet" href="../fonts/fonts.css"><style>${css}</style></head><body><div class="page">
  <header><img class="logo" src="../brand/il-mercato-logo.png"><h1>Pizza Napoletana</h1>
    <div class="intro">${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div></header>
  <div class="checks"></div>
  <div class="bases"><h3>Pick your<br>base</h3>
    <div class="opt"><div class="ic">${pizzaSvg(false)}</div><div><b>Samuele’s dough</b><span>Our classic base</span></div></div>
    <div class="opt gf"><div class="ic">${pizzaSvg(true)}</div><div><b>Gluten-free base</b><br><span>Made in-house by Samuele</span></div></div>
    <div class="why"><b>Every pizza, either base.</b>Samuele holds a Coeliac Australia certificate. GF pizzas are cooked in the same oven as our regular bases, so we can’t guarantee no gluten or cross-contact.</div>
  </div>
  <div class="heads">${COLUMNS.map((c) => `<div class="oval">${c.name}<small>${c.note}</small></div>`).join('<div></div>')}</div>
  <div class="grid">${cols.join('<div class="vline"></div>')}</div>
  <div class="bottom"></div>
</div></body></html>`;
}

module.exports = { C, PAGE, esc, money, M, all, COLUMNS, NOTES, pizzaSvg }; // shared with columns3.js

if (require.main === module) (async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  const file = path.join(OUT, 'variant-columns.html');
  fs.writeFileSync(file, render());
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, 'variant-columns.png') });
  await page.pdf({ path: path.join(OUT, 'variant-columns.pdf'), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
  console.log('built columns');
  await browser.close();
})();
