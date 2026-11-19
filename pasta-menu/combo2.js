// Combined Pasta & Gnocchi menu, round 2 (built on version A). A3 landscape.
// No Classic / Level up / Go all in: three different ways to organise the dishes, each with illustrated shapes on top.
//   1 · Veggie / Meat / Al forno      columns by what's in it
//   2 · Rosso / Bianco / Ragù & forno  columns by sauce colour
//   3 · Pick your shape → pick your dish   step-by-step, dishes as cards, no columns
// Usage: node combo2.js   (or node combo2.js 2)   → output/combo2-1.pdf/.png …
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { SHAPE_SVG } = require('./shapes');

const OUT = path.join(__dirname, 'output');
const PAGE = { w: 420, h: 297 };
const C = { paper: '#FDFBEF', red: '#C40001', deep: '#8E1410', ink: '#3A1E18', band: '#F7E9D6', rule: '#EAD8C0', blue: '#B9CBD6' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const money = (p) => (Number.isInteger(p) ? String(p) : p.toFixed(2));

// ---------------------------------------------------------------------------------------------
// Content. kind: veg | meat | forno (what's in it). sauce: rosso | bianco | ragu (sauce colour).
// ---------------------------------------------------------------------------------------------
const TITLE = 'Pasta & Gnocchi';
const INTRO = 'Pasta fresca and house-made gnocchi, your way.';
// From the "Create your own" poster. $22 there, +50c like the rest of the menu; add-ons unchanged.
const CREATE = { name: 'Create your own', price: 22.5, photo: 'create-cream', base: 'Parmesan cream or zucchini cream base',
  adds: [["'Nduja", 2], ['Mushrooms', 2.5], ['Prawns', 4], ['Chicken', 4]] };
const SHAPES = ['Rigatoni', 'Spaghetti', 'Fusilli', 'Pappardelle', 'Gnocchi', 'Gluten-free gnocchi'];
const SWAP = 'Swap any dish to any shape, except the lasagna.';
const MONDAY = '$10 Rigatoni alla Vodka every Monday';

const PASTA = [
  { name: 'Rigatoni alla Vodka', price: 17.5, v: 1, kind: 'veg', sauce: 'rosso', photo: 'rigatoni-vodka', desc: 'Slightly spicy tomato & cream sauce with a splash of vodka', note: '$10 every Monday' },
  { name: 'Spaghetti Pomodoro', price: 19.5, v: 1, kind: 'veg', sauce: 'rosso', photo: 'spaghetti-pomodoro', desc: 'Rich tomato sauce, stracciatella & fresh basil' },
  { name: 'Capsicum Pasta', price: 20.5, v: 1, kind: 'veg', sauce: 'bianco', photo: 'capsicum', desc: 'Creamy capsicum sauce, ricotta salata & parsley' },
  { name: 'Amatriciana', price: 24.5, kind: 'meat', sauce: 'rosso', photo: 'amatriciana', desc: 'Rigatoni in a tomato & pork sauce with guanciale & pecorino' },
  { name: 'Carbonara', price: 25.5, kind: 'meat', sauce: 'bianco', photo: 'carbonara', desc: 'Rigatoni in egg yolk, parmesan & pecorino with a dash of cream' },
  { name: 'Pappardelle Bolognese', price: 26.5, kind: 'meat', sauce: 'ragu', photo: 'pappardelle-bolognese', desc: 'Fresh egg ribbons in a slow-simmered beef ragu' },
  { name: 'Pasta della Nonna Anna', price: 25.5, kind: 'forno', sauce: 'ragu', photo: 'nonna-anna', desc: 'Baked rigatoni with minced beef, rich tomato sauce, cheese & vegetables' },
  { name: 'The Classic Lasagna', price: 26.5, kind: 'forno', sauce: 'ragu', photo: 'lasagna', desc: 'Beef ragu, creamy bechamel, melted mozzarella & a grilled cheese top' },
];
const GNOCCHI = [
  { name: 'Gnocchi Classico', price: 20.5, v: 1, kind: 'veg', sauce: 'rosso', photo: 'gnocchi-classico', desc: 'Rich tomato sauce, stracciatella & fresh basil' },
  { name: 'Gnocchi al Pesto', price: 22.5, v: 1, kind: 'veg', sauce: 'bianco', photo: 'gnocchi-pesto', desc: 'Basil pesto, semi-dried cherry tomatoes & stracciatella' },
  { name: 'Gnocchi Amatriciana', price: 25.5, kind: 'meat', sauce: 'rosso', photo: 'gnocchi-amatriciana', desc: 'Tomato & pork sauce with guanciale & pecorino' },
  { name: 'Gnocchi Carbonara', price: 26.5, kind: 'meat', sauce: 'bianco', photo: 'gnocchi-carbonara', desc: 'Egg yolk, parmesan & pecorino with a dash of cream' },
  { name: 'Gnocchi Bolognese', price: 27.5, kind: 'meat', sauce: 'ragu', photo: 'gnocchi-bolognese', desc: 'Slow-simmered beef ragu' },
  { name: 'Gnocchi Sorrentina', price: 23.5, v: 1, kind: 'forno', sauce: 'ragu', photo: 'gnocchi-sorrentina', desc: 'Baked with Napoli sauce & mozzarella', note: 'In a focaccia bowl +$2.50' },
];
const ROWS = [{ name: 'Pasta', items: PASTA }, { name: 'Gnocchi', items: GNOCCHI }];

// Column schemes for versions 1 and 2.
const BY_KIND = [
  { key: 'veg', name: 'Veggie', note: 'no meat' },
  { key: 'meat', name: 'With meat', note: 'rich & hearty' },
  { key: 'forno', name: 'Al forno', note: 'baked & bubbling' },
];
const BY_SAUCE = [
  { key: 'rosso', name: 'Rosso', note: 'tomato sauces', swatch: '#E0412A' },
  { key: 'bianco', name: 'Bianco', note: 'creamy & green', swatch: '#F3E2B4' },
  { key: 'ragu', name: 'Ragù & forno', note: 'meaty & baked', swatch: '#7B3A1E' },
];

// ---------------------------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------------------------
const MASK = { 'gnocchi-sorrentina': 'none' };
const WIDE = { 'gnocchi-sorrentina': 1.7 }; // photo box width ÷ height for cuts wider than a plate
const photo = (name, h) =>
  `<img class="ph" src="../photos/${name}.png" style="height:${h}mm${MASK[name] ? `; -webkit-mask-image:${MASK[name]}` : ''}">`;
const diet = (p) => (p.v ? ' <b class="dt">V</b>' : '');

const head = (title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../../pizza-menu/fonts/fonts.css">
<style>
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: 8mm 12mm 0 }
img { display: block }
svg { display: block; width: 100%; height: 100% }
.ph { width: auto; flex: none; -webkit-mask-image: radial-gradient(ellipse closest-side, #000 90%, transparent 100%) }
header { display: grid; grid-template-columns: 74mm minmax(0, 1fr) 86mm; align-items: center; height: 36mm; column-gap: 8mm }
.logo { width: 68mm }
h1 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 23mm; line-height: .9; text-align: center; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap }
.intro { font-size: 3.6mm; line-height: 1.38; color: ${C.deep}; border-left: .5mm solid ${C.red}; padding-left: 4mm }
.checks { height: 7mm; background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / 7mm 7mm; margin: 1mm 0 4mm }
.bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 5mm; background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / 5mm 5mm }
.nm { font-weight: 700; color: ${C.red}; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { white-space: nowrap }
.ds { line-height: 1.28; color: ${C.ink} }
.dt { font-weight: 700; color: ${C.red}; font-size: .9em; white-space: nowrap }
.nt { font-style: italic; color: ${C.deep} }
.oval { font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap }
.oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .92; margin-left: 2mm }
.legend { position: absolute; right: 12mm; bottom: 8mm; font-size: 3.2mm; color: ${C.deep} } .legend b { color: ${C.red} }
${css}
</style></head><body><div class="page">
  <header>
    <img class="logo" src="../../pizza-menu/brand/il-mercato-logo.png">
    <h1>${esc(TITLE)}</h1>
    <div class="intro">${esc(INTRO)}</div>
  </header>
  <div class="checks"></div>`;
const foot = `<div class="bottom"></div></div></body></html>`;

// The "Pick your shape" band with the illustrated shapes (versions 1 and 2).
const shapeBand = () => `<div class="shapes">
  <h3>Pick your<br>shape</h3>
  <div class="row">${SHAPES.map((s) => `<div class="sh${/Gluten/.test(s) ? ' gf' : ''}"><div class="ic">${SHAPE_SVG[s]()}</div><span>${esc(s)}</span></div>`).join('')}</div>
  <div class="why"><b>Any dish, any shape.</b> Swap to any of these, except the lasagna.</div>
</div>`;
const shapeBandCss = `
.shapes { display: grid; grid-template-columns: 34mm 1fr 58mm; align-items: center; background: ${C.band}; border-radius: 3mm; padding: 2mm 6mm; margin-bottom: 3mm; height: 27mm }
.shapes h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 7mm; line-height: .95; color: ${C.red} }
.shapes .row { display: flex; justify-content: space-around; align-items: flex-end }
.shapes .sh { display: flex; flex-direction: column; align-items: center; gap: .6mm }
.shapes .ic { width: 17mm; height: 17mm }
.shapes .sh span { font-weight: 700; font-size: 3.6mm; color: ${C.red}; white-space: nowrap; padding: .3mm 2.4mm .5mm; border-radius: 6mm }
.shapes .sh.gf span { background: ${C.red}; color: ${C.paper} }
.shapes .why { font-size: 3.3mm; line-height: 1.3; color: ${C.deep}; border-left: .4mm solid ${C.red}; padding-left: 4mm }
.shapes .why b { display: block; color: ${C.red}; font-size: 3.8mm }`;

// =============================================================================================
// Versions 1 & 2 · Version A's grid with new column headings. Photos sit in a fixed-width box so every
// dish name lines up, which A didn't do.
// =============================================================================================
function columnsVersion(scheme, label, headExtra = '') {
  const cellCount = (items, key) => items.filter((p) => p[scheme === BY_KIND ? 'kind' : 'sauce'] === key).length;
  const field = scheme === BY_KIND ? 'kind' : 'sauce';
  const item = (p, h, bw) => `<div class="it"><div class="pb" style="width:${bw.toFixed(1)}mm">${photo(p.photo, h)}</div><div class="tx">
    <div class="nm">${esc(p.name)} <span class="pr">$${money(p.price)}</span></div>
    <div class="ds">${esc(p.desc)}${diet(p)}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div></div>`;
  const css = shapeBandCss + `
.grid { display: grid; grid-template-columns: 15mm 1fr 6mm 1fr 6mm 1fr; grid-template-rows: auto 88mm 88mm }
.col { justify-self: start; align-self: end; font-size: 7mm; padding: 1.6mm 7mm 2mm; margin: 0 0 2mm 2mm; display: flex; align-items: center; gap: 2.2mm }
.col i { width: 4.6mm; height: 4.6mm; border-radius: 50%; border: .6mm solid ${C.paper}; flex: none }
.lab { display: grid; place-items: center; border-radius: 3mm; background: ${C.red}; margin: 2mm 3mm 2mm 0 }
.lab span { font-family: 'Lilita One'; color: ${C.paper}; font-size: 8mm; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; letter-spacing: .03em }
.cell { display: flex; flex-direction: column; justify-content: space-evenly; padding: 1mm 0 }
.r2 { border-top: .4mm dashed ${C.rule} }
.vline { width: .35mm; background: ${C.rule}; justify-self: center; margin: 4mm 0 }
.it { display: flex; align-items: center; gap: 2.5mm; min-width: 0 }
.pb { display: flex; justify-content: center; flex: none }
.it .nm { font-size: 4.9mm } .it .ds { font-size: 3.35mm; margin-top: .6mm } .it .nt { font-size: 3.15mm; margin-top: .5mm }
${headExtra}`;
  const rows = ROWS.map((r, ri) => {
    const cells = scheme.map((c) => {
      const items = r.items.filter((p) => p[field] === c.key);
      const h = items.length >= 3 ? 23 : items.length === 2 ? 29 : 31;
      const bw = Math.max(...items.map((p) => h * (WIDE[p.photo] || 1.42))); // same photo box in a cell, so the names line up
      return `<div class="cell${ri ? ' r2' : ''}">${items.map((p) => item(p, h, bw)).join('')}</div>`;
    });
    return `<div class="lab"><span>${r.name}</span></div>` + cells.join(`<div class="vline${ri ? ' r2' : ''}"></div>`);
  }).join('');
  return head(`il Mercato Centrale — ${TITLE} (${label})`, css) + shapeBand() + `
  <div class="grid">
    <div></div>${scheme.map((c) => `<div class="oval col">${c.swatch ? `<i style="background:${c.swatch}"></i>` : ''}${c.name}<small>${c.note}</small></div>`).join('<div></div>')}
    ${rows}
  </div>
  <div class="legend"><b>V</b> vegetarian</div>` + foot;
}
const version1 = () => columnsVersion(BY_KIND, '1');
const version2 = () => columnsVersion(BY_SAUCE, '2');

// =============================================================================================
// Version 3 · Step by step. Big shape cards first ("1 Pick your shape"), then every dish as a card
// with the photo on top ("2 Pick your dish"), cheapest first. No columns to explain.
// =============================================================================================
function version3() {
  const card = (p) => `<div class="card"><div class="pw">${photo(p.photo, WIDE[p.photo] ? 28 : 33)}${
    /Monday/.test(p.note || '') ? '<div class="sticker"><b>$10</b>Mondays</div>' : ''}</div>
    <div class="nm">${esc(p.name)}</div><div class="price">$${money(p.price)}${diet(p)}</div>
    <div class="ds">${esc(p.desc)}</div>${p.note && !/Monday/.test(p.note) ? `<div class="nt">${esc(p.note)}</div>` : ''}</div>`;
  const css = `
.step { display: flex; align-items: center; gap: 3mm; margin-bottom: 2mm }
.step b { width: 9mm; height: 9mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: grid; place-items: center; font-family: 'Lilita One'; font-weight: 400; font-size: 5.6mm }
.step h3 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 7.4mm; line-height: 1 }
.step span { font-style: italic; color: ${C.deep}; font-size: 3.6mm; margin-left: 2mm }
.shapes { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4mm; margin-bottom: 4mm }
.sh { background: ${C.band}; border-radius: 3mm; height: 28mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm }
.sh .ic { width: 21mm; height: 21mm }
.sh span { font-weight: 700; color: ${C.red}; font-size: 4mm; white-space: nowrap }
.sh.gf { background: ${C.red} } .sh.gf span { color: ${C.paper} }
.rows { display: grid; grid-template-columns: 15mm 1fr; row-gap: 3mm }
.lab { display: grid; place-items: center; border-radius: 3mm; background: ${C.red}; margin-right: 3mm }
.lab span { font-family: 'Lilita One'; color: ${C.paper}; font-size: 7.4mm; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap }
.cards { display: grid; grid-template-columns: repeat(8, 1fr); column-gap: 3.5mm; height: 84mm; align-items: start; align-content: center }
.card { display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 0 }
.card .pw { height: 33mm; display: flex; align-items: center; justify-content: center; margin-bottom: 1.8mm }
.card .nm { font-size: 4.5mm; line-height: 1.1; min-height: 10mm; display: flex; align-items: center }
.card .price { font-family: 'Lilita One'; color: ${C.paper}; background: ${C.red}; border-radius: 4mm; font-size: 4.8mm; padding: .5mm 3.2mm .8mm; margin: .8mm 0 1.4mm; line-height: 1 }
.card .price .dt { color: ${C.paper}; font-family: 'Fraunces'; margin-left: 1mm; opacity: .9 }
.card .ds { font-size: 3.35mm; line-height: 1.25 }
.card .nt { font-size: 3.1mm; margin-top: .6mm }
.card .pw { position: relative }
.sticker { position: absolute; right: -3mm; top: -1mm; width: 15mm; height: 15mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; transform: rotate(10deg);
  display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2.5mm; font-weight: 700; line-height: 1; box-shadow: 0 0 0 .7mm ${C.paper} }
.sticker b { font-family: 'Lilita One'; font-weight: 400; font-size: 5.6mm; line-height: .95 }
.create { grid-column: span 2; align-self: center; height: 66mm; background: ${C.red}; color: ${C.paper}; border-radius: 3mm; padding: 4mm 5mm 4mm 4mm;
  display: grid; grid-template-columns: 31mm 1fr; column-gap: 4.5mm; align-items: center }
.create .ph { height: 31mm; -webkit-mask-image: radial-gradient(ellipse closest-side, #000 86%, transparent 97%) }
.create .phw { width: 31mm; height: 31mm; border-radius: 50%; background: ${C.paper}; display: grid; place-items: center; overflow: hidden; box-shadow: 0 0 0 1mm rgba(253,251,239,.35) }
.create h4 { font-family: 'Lilita One'; font-weight: 400; font-size: 6.4mm; line-height: 1; white-space: nowrap }
.create .price { display: inline-block; background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 5mm; padding: .5mm 3mm .9mm; border-radius: 4mm; line-height: 1; margin-top: 1.4mm }
.create .base { font-size: 3.35mm; font-style: italic; line-height: 1.3; margin: 1.6mm 0 2mm; opacity: .95 }
.create .add { font-weight: 700; font-size: 2.9mm; margin-bottom: .6mm; letter-spacing: .06em; text-transform: uppercase; opacity: .85 }
.create ul { list-style: none; font-size: 3.4mm; line-height: 1.4 }
.create li { white-space: nowrap } .create li::before { content: '× '; font-family: 'Lilita One'; opacity: .8 }
.create .leg { margin-top: 1.8mm; font-size: 2.9mm; opacity: .8 }`;
  const sorted = (items) => [...items].sort((a, b) => a.price - b.price);
  return head(`il Mercato Centrale — ${TITLE} (3)`, css) + `
  <div class="step"><b>1</b><h3>Pick your shape</h3><span>Any dish, any shape, except the lasagna</span></div>
  <div class="shapes">${SHAPES.map((s) => `<div class="sh${/Gluten/.test(s) ? ' gf' : ''}"><div class="ic">${SHAPE_SVG[s]()}</div><span>${esc(s)}</span></div>`).join('')}</div>
  <div class="step"><b>2</b><h3>Pick your dish</h3></div>
  <div class="rows">
    <div class="lab"><span>Pasta</span></div><div class="cards">${sorted(PASTA).map((p) => card({ ...p, note: /Monday/.test(p.note || '') ? p.note : '' })).join('')}</div>
    <div class="lab"><span>Gnocchi</span></div><div class="cards">${sorted(GNOCCHI).map(card).join('')}
      <div class="create"><div class="phw">${photo(CREATE.photo, 38)}</div><div>
        <h4>${esc(CREATE.name)}</h4><div class="price">$${money(CREATE.price)}</div>
        <div class="base">${esc(CREATE.base)}</div>
        <div class="add">Add</div><ul>${CREATE.adds.map(([n, p]) => `<li>${esc(n)} $${money(p)}</li>`).join('')}</ul>
        <div class="leg">V vegetarian</div></div></div></div>
  </div>` + foot;
}

const VERSIONS = { 1: version1, 2: version2, 3: version3 };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VERSIONS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `combo2-${k}.html`);
    fs.writeFileSync(file, VERSIONS[k]());
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `combo2-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `combo2-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
