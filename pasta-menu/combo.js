// Combined Pasta & Gnocchi menu, A3 landscape, in the il Mercato pizza-menu style (Classic → Level up → Go all in).
// Two rows: Pasta and Gnocchi. Any dish can be swapped to any shape in SHAPES.
// Usage: node combo.js          (both versions)   ·   node combo.js a   (one version)
// Outputs output/combo-a.pdf/.png and output/combo-b.pdf/.png. Photos come from photos/ (cut_photos.py).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'output');
const PAGE = { w: 420, h: 297 }; // mm, A3 landscape (same as the pizza menu)
const C = { paper: '#FDFBEF', red: '#C40001', deep: '#8E1410', ink: '#3A1E18', band: '#F7E9D6', rule: '#EAD8C0', blue: '#B9CBD6' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const money = (p) => (Number.isInteger(p) ? String(p) : p.toFixed(2)); // 25.5 → "25.50"

// ---------------------------------------------------------------------------------------------
// Menu content. Prices are the current ones (+50c). v: vegetarian.
// ---------------------------------------------------------------------------------------------
const TITLE = 'Pasta & Gnocchi';
const INTRO = 'Pasta fresca, cooked to order, and gnocchi made in-house by our pasta chef Daniele.';
const SHAPES = ['Rigatoni', 'Spaghetti', 'Fusilli', 'Pappardelle', 'Gnocchi', 'Gluten-free gnocchi'];
const TIERS = [
  { name: 'Classic', note: 'fresh & simple' },
  { name: 'Level up', note: 'rich sauces' },
  { name: 'Go all in', note: 'baked & cheesy' },
];
const ROWS = [
  {
    name: 'Pasta', title: 'Pasta Fresca', hero: 'pappardelle-bolognese',
    tiers: [
      [
        { name: 'Rigatoni alla Vodka', price: 17.5, v: true, photo: 'rigatoni-vodka', desc: 'Slightly spicy tomato & cream sauce with a splash of vodka', note: '$10 Monday Special' },
        { name: 'Spaghetti Pomodoro', price: 19.5, v: true, photo: 'spaghetti-pomodoro', desc: 'Rich tomato sauce, stracciatella & fresh basil' },
        { name: 'Capsicum Pasta', price: 20.5, v: true, photo: 'capsicum', desc: 'Creamy capsicum sauce, ricotta salata & parsley' },
      ],
      [
        { name: 'Amatriciana', price: 24.5, photo: 'amatriciana', desc: 'Rigatoni in a tomato & pork sauce with guanciale & pecorino' },
        { name: 'Carbonara', price: 25.5, photo: 'carbonara', desc: 'Rigatoni in egg yolk, parmesan & pecorino with a dash of cream' },
        { name: 'Pappardelle Bolognese', price: 26.5, photo: 'pappardelle-bolognese', desc: 'Fresh egg ribbons in a slow-simmered beef ragu' },
      ],
      [
        { name: 'Pasta della Nonna Anna', price: 25.5, photo: 'nonna-anna', desc: 'Baked rigatoni with minced beef, rich tomato sauce, cheese & vegetables' },
        { name: 'The Classic Lasagna', price: 26.5, photo: 'lasagna', desc: 'Beef ragu, creamy bechamel, melted mozzarella & a grilled cheese top' },
      ],
    ],
  },
  {
    name: 'Gnocchi', title: 'Gnocchi', hero: 'gnocchi-sorrentina',
    tiers: [
      [
        { name: 'Gnocchi Classico', price: 20.5, v: true, photo: 'gnocchi-classico', desc: 'Rich tomato sauce, stracciatella & fresh basil' },
        { name: 'Gnocchi al Pesto', price: 22.5, v: true, photo: 'gnocchi-pesto', desc: 'Basil pesto, semi-dried cherry tomatoes & stracciatella' },
      ],
      [
        { name: 'Gnocchi Amatriciana', price: 25.5, photo: 'gnocchi-amatriciana', desc: 'Tomato & pork sauce with guanciale & pecorino' },
        { name: 'Gnocchi Carbonara', price: 26.5, photo: 'gnocchi-carbonara', desc: 'Egg yolk, parmesan & pecorino with a dash of cream' },
        { name: 'Gnocchi Bolognese', price: 27.5, photo: 'gnocchi-bolognese', desc: 'Slow-simmered beef ragu' },
      ],
      [
        { name: 'Gnocchi Sorrentina', price: 23.5, v: true, photo: 'gnocchi-sorrentina', desc: 'Baked with Napoli sauce & mozzarella', note: 'In a focaccia bowl +$2.50' },
      ],
    ],
  },
];
const SWAP_NOTE = 'Swap any dish to any of our shapes (except the lasagna).';

// Photo masks: an ellipse inside each cut hides bits of neighbouring plates. Sorrentina's bowl is wide at the top,
// so it keeps its soft-edged rectangle (the stray plate edge is painted out in cut_photos.py).
const MASK = { 'gnocchi-sorrentina': 'none' };
const photo = (name, h, cls = 'ph') =>
  `<img class="${cls}" src="../photos/${name}.png" style="height:${h}mm${MASK[name] ? `; -webkit-mask-image:${MASK[name]}` : ''}">`;

const head = (title, css) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../../pizza-menu/fonts/fonts.css">
<style>
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: 8mm 12mm 0 }
img { display: block }
.ph { width: auto; flex: none; -webkit-mask-image: radial-gradient(ellipse closest-side, #000 90%, transparent 100%) }
header { display: grid; grid-template-columns: 74mm minmax(0, 1fr) 86mm; align-items: center; height: 38mm; column-gap: 8mm }
.logo { width: 70mm }
h1 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 23mm; line-height: .9; text-align: center; text-transform: uppercase;
  transform: scaleX(.86); white-space: nowrap }
.intro { font-size: 3.6mm; line-height: 1.38; color: ${C.deep}; border-left: .5mm solid ${C.red}; padding-left: 4mm }
.checks { height: 7mm; background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / 7mm 7mm; margin: 1mm 0 4mm }
.bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 5mm; background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / 5mm 5mm }
.nm { font-weight: 700; color: ${C.red}; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { white-space: nowrap }
.ds { line-height: 1.28; color: ${C.ink} }
.dt { font-weight: 700; color: ${C.red}; font-size: .9em; white-space: nowrap }
.nt { font-style: italic; color: ${C.deep} }
.oval { font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap }
.oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .9; margin-left: 2mm }
${css}
</style></head><body><div class="page">
  <header>
    <img class="logo" src="../../pizza-menu/brand/il-mercato-logo.png">
    <h1>${esc(TITLE)}</h1>
    <div class="intro">${esc(INTRO)}</div>
  </header>
  <div class="checks"></div>`;
const foot = `<div class="bottom"></div></div></body></html>`;

// =============================================================================================
// VERSION A · Tier grid. Like the pizza menu: Classic → Level up → Go all in across the top,
// a Pasta row and a Gnocchi row, a round photo by every dish. "Pick your shape" bar above the grid.
// =============================================================================================
function versionA() {
  const PH = [[25, 25, 32], [33, 25, 50]]; // photo heights per row / tier (mm)
  const item = (p, h, big) => `<div class="it${big ? ' big' : ''}">${photo(p.photo, h)}<div class="tx">
    <div class="nm">${esc(p.name)} <span class="pr">$${money(p.price)}</span></div>
    <div class="ds">${esc(p.desc)}${p.v ? ' <b class="dt">V</b>' : ''}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div></div>`;
  const css = `
.shapes { display: flex; align-items: center; gap: 3mm; background: ${C.band}; border-radius: 3mm; padding: 2.6mm 5mm; margin-bottom: 3.5mm }
.shapes h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 6.2mm; color: ${C.red}; margin-right: 1mm; white-space: nowrap }
.shapes .s { border: .45mm solid ${C.red}; color: ${C.red}; border-radius: 10mm; padding: 1mm 3.6mm 1.3mm; font-weight: 700; font-size: 4mm; white-space: nowrap; background: ${C.paper} }
.shapes .s.gf { background: ${C.red}; color: ${C.paper} }
.shapes .why { margin-left: auto; font-size: 3.3mm; font-style: italic; color: ${C.deep}; text-align: right; line-height: 1.25; max-width: 62mm }
.grid { display: grid; grid-template-columns: 17mm 1fr 6mm 1fr 6mm 1fr; grid-template-rows: auto 95mm 95mm; column-gap: 0; row-gap: 0 }
.tier { justify-self: start; align-self: end; font-size: 7mm; padding: 1.6mm 7mm 2mm; margin: 0 0 2.5mm 0 }
.lab { display: grid; place-items: center; border-radius: 3mm; background: ${C.red}; margin: 2mm 4mm 2mm 0 }
.lab span { font-family: 'Lilita One'; color: ${C.paper}; font-size: 8.5mm; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; letter-spacing: .03em }
.cell { display: flex; flex-direction: column; justify-content: space-evenly; padding: 1mm 0 }
.row2 { border-top: .4mm dashed ${C.rule} }
.it { display: flex; align-items: center; gap: 3.5mm; min-width: 0 }
.it .nm { font-size: 5mm } .it .ds { font-size: 3.4mm; margin-top: .6mm } .it .nt { font-size: 3.2mm; margin-top: .5mm }
.it.big { flex-direction: column; align-items: flex-start; gap: 2mm } .it.big .nm { font-size: 5.6mm } .it.big .ds { font-size: 3.7mm }
.vline { width: .35mm; background: ${C.rule}; justify-self: center; margin: 4mm 0 }
.legend { position: absolute; right: 12mm; bottom: 8.5mm; font-size: 3.2mm; color: ${C.deep} } .legend b { color: ${C.red} }`;
  const cells = ROWS.map((r, ri) => {
    const lab = `<div class="lab${ri ? ' row2x' : ''}"><span>${r.name}</span></div>`;
    const tiers = r.tiers.map((t, ti) => `<div class="cell${ri ? ' row2' : ''}">${t.map((p) => item(p, PH[ri][ti], t.length === 1)).join('')}</div>`);
    return lab + tiers.join(`<div class="vline${ri ? ' row2' : ''}"></div>`);
  }).join('');
  return head(`il Mercato Centrale — ${TITLE} (A)`, css) + `
  <div class="shapes"><h3>Pick your shape</h3>${SHAPES.map((s) => `<span class="s${/Gluten/.test(s) ? ' gf' : ''}">${esc(s)}</span>`).join('')}
    <div class="why">${esc(SWAP_NOTE)}</div></div>
  <div class="grid">
    <div></div>${TIERS.map((t) => `<div class="oval tier">${t.name}<small>${t.note}</small></div>`).join('<div></div>')}
    ${cells}
  </div>
  <div class="legend"><b>V</b> vegetarian</div>` + foot;
}

// =============================================================================================
// VERSION B · Hero rows + shape panel. Each row opens with one big photo under a light-blue title oval,
// dishes are text-led in the three tiers, and a red side panel lists the six shapes. Monday special as a round badge.
// =============================================================================================
function versionB() {
  const item = (p) => `<div class="it"><div class="nm">${esc(p.name)} <span class="pr">$${money(p.price)}</span></div>
    <div class="ds">${esc(p.desc)}${p.v ? ' <b class="dt">V</b>' : ''}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div>`;
  const css = `
.body { display: grid; grid-template-columns: 1fr 74mm; column-gap: 8mm }
.tiers, .row { display: grid; grid-template-columns: 64mm 1fr 1fr 1fr; column-gap: 6mm }
.tiers { margin-bottom: 1mm } .tiers .oval { justify-self: start; font-size: 6.6mm; padding: 1.5mm 6.5mm 1.9mm }
.row { height: 104mm; align-items: center; border-top: .4mm dashed ${C.rule} } .row:first-of-type { border-top: none }
.hero { position: relative; height: 100%; display: grid; place-items: center }
.hero .ph { max-width: 62mm; height: auto !important; max-height: 70mm; margin-top: 12mm }
.hero .title { position: absolute; top: 4mm; left: 50%; transform: translateX(-50%); background: ${C.blue}; border-radius: 50%; padding: 3mm 9mm 3.6mm; z-index: 2 }
.hero .title span { display: block; font-family: 'Lilita One'; color: ${C.red}; font-size: 9mm; line-height: 1; white-space: nowrap; transform: scaleX(.9) }
.col { display: flex; flex-direction: column; justify-content: center; gap: 5.5mm; height: 100% }
.it .nm { font-size: 4.9mm } .it .ds { font-size: 3.6mm; margin-top: .7mm } .it .nt { font-size: 3.3mm; margin-top: .6mm }
aside { background: ${C.red}; color: ${C.paper}; border-radius: 4mm; padding: 7mm 6mm 6mm; height: 214mm; position: relative; display: flex; flex-direction: column }
aside h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 9mm; line-height: .95; text-align: center }
aside .sub { font-size: 3.4mm; font-style: italic; text-align: center; margin: 2mm 0 4mm; opacity: .92 }
aside ul { list-style: none; display: flex; flex-direction: column; gap: 2.6mm }
aside li { font-weight: 700; font-size: 5.2mm; display: flex; align-items: center; gap: 3mm; font-variation-settings: 'opsz' 48 }
aside li::before { content: '×'; font-family: 'Lilita One'; font-size: 5mm; opacity: .8 }
aside li.gf { background: ${C.paper}; color: ${C.red}; border-radius: 2mm; padding: 1mm 3mm; margin-left: -3mm }
aside .dots { height: 10mm; margin: 0 2mm; background: radial-gradient(circle, rgba(253,251,239,.55) .55mm, transparent .65mm) 0 0 / 4mm 4mm }
aside .ex { font-size: 3.1mm; text-align: center; opacity: .9; margin-top: 3mm }
.badge { align-self: center; margin: auto 0; transform: rotate(-8deg); width: 46mm; height: 46mm; border-radius: 50%; flex: none;
  background: ${C.paper}; color: ${C.red}; display: grid; place-items: center; text-align: center; box-shadow: 0 1mm 2.5mm rgba(60,10,0,.3); border: .8mm dashed ${C.red} }
.badge b { display: block; font-family: 'Lilita One'; font-weight: 400; font-size: 13mm; line-height: .9 }
.badge span { display: block; font-size: 3.2mm; font-weight: 700; line-height: 1.2; padding: 0 4mm }
.legend { position: absolute; left: 12mm; bottom: 8.5mm; font-size: 3.2mm; color: ${C.deep} } .legend b { color: ${C.red} }`;
  const rows = ROWS.map((r) => `<div class="row"><div class="hero"><div class="title"><span>${esc(r.title)}</span></div>${photo(r.hero, 78)}</div>
    ${r.tiers.map((t) => `<div class="col">${t.map((p) => item({ ...p, note: /Monday/.test(p.note || '') ? '' : p.note })).join('')}</div>`).join('')}</div>`).join('');
  return head(`il Mercato Centrale — ${TITLE} (B)`, css) + `
  <div class="body">
    <main>
      <div class="tiers"><div></div>${TIERS.map((t) => `<div class="oval">${t.name}<small>${t.note}</small></div>`).join('')}</div>
      ${rows}
    </main>
    <aside>
      <h3>Pick your<br>shape</h3>
      <div class="sub">Any dish, any shape</div>
      <ul>${SHAPES.map((s) => `<li${/Gluten/.test(s) ? ' class="gf"' : ''}>${esc(s)}</li>`).join('')}</ul>
      <div class="ex">Except the lasagna</div>
      <div class="badge"><div><b>$10</b><span>Rigatoni alla Vodka<br>every Monday</span></div></div>
      <div class="dots"></div>
    </aside>
  </div>
  <div class="legend"><b>V</b> vegetarian</div>` + foot;
}

const VERSIONS = { a: versionA, b: versionB };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VERSIONS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `combo-${k}.html`);
    fs.writeFileSync(file, VERSIONS[k]());
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `combo-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `combo-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
