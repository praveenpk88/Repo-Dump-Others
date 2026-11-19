// Pasta & Gnocchi, round 3: three treatments of the approved version 1 (Veggie / With meat / Al forno).
// Each gives "Create your own" a big panel with both bases photographed (parmesan cream and zucchini cream).
//   1 · Refined  the approved layout, tightened, with a full-width Create your own panel along the bottom
//   2 · Sidebar  a red sidebar holds Pick your shape and Create your own; the dishes get taller rows
//   3 · Poster   the il Mercato promo-poster look: red header with the blue oval, cream card columns, round price badge
// Usage: node combo3.js   (or node combo3.js 2)   → output/combo3-1.pdf/.png …
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { SHAPE_SVG } = require('./shapes');
const { C, PAGE, esc, money, TITLE, INTRO, SHAPES, CREATE, ROWS, BY_KIND, WIDE, photo, diet } = require('./combo2');

const OUT = path.join(__dirname, 'output');
const BASES = [{ name: 'Parmesan cream', photo: 'create-parmesan' }, { name: 'Zucchini cream', photo: 'create-zucchini' }];
const round = (name, d) => `<div class="rnd" style="width:${d}mm; height:${d}mm"><img src="../photos/${name}.png"></div>`;
const checks = (h) => `repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / ${h}mm ${h}mm`;

const base = (title, css, header) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../../pizza-menu/fonts/fonts.css">
<style>
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: 8mm 12mm 0 }
img { display: block } svg { display: block; width: 100%; height: 100% }
.ph { width: auto; flex: none; -webkit-mask-image: radial-gradient(ellipse closest-side, #000 90%, transparent 100%) }
.rnd { border-radius: 50%; overflow: hidden; background: ${C.paper}; flex: none }
.rnd img { width: 100%; height: 100%; object-fit: cover; -webkit-mask-image: radial-gradient(circle closest-side, #000 93%, transparent 100%) }
.lilita { font-family: 'Lilita One'; font-weight: 400 }
.checks { height: 7mm; background: ${checks(7)}; margin: 1mm 0 3.5mm }
.bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 5mm; background: ${checks(5)} }
.nm { font-weight: 700; color: ${C.red}; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { white-space: nowrap }
.ds { line-height: 1.28; color: ${C.ink} }
.dt { font-weight: 700; color: ${C.red}; font-size: .9em; white-space: nowrap }
.nt { font-style: italic; color: ${C.deep} }
.oval { font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap }
.oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .92; margin-left: 2mm }
.lab { display: grid; place-items: center; border-radius: 3mm; background: ${C.red} }
.lab span { font-family: 'Lilita One'; color: ${C.paper}; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; letter-spacing: .03em }
.it { display: flex; align-items: center; min-width: 0 }
.pb { display: flex; justify-content: center; flex: none }
.cell { display: flex; flex-direction: column; justify-content: space-evenly }
.vline { width: .35mm; background: ${C.rule}; justify-self: center; margin: 4mm 0 }
.r2 { border-top: .4mm dashed ${C.rule} }
${css}
</style></head><body><div class="page">${header}`;
const foot = `<div class="bottom"></div></div></body></html>`;

const stdHeader = (h = 30, logo = 62, size = 21) => `
  <header style="display:grid; grid-template-columns:${logo + 6}mm minmax(0,1fr) 86mm; align-items:center; height:${h}mm; column-gap:8mm">
    <img src="../../pizza-menu/brand/il-mercato-logo.png" style="width:${logo}mm">
    <h1 class="lilita" style="color:${C.red}; font-size:${size}mm; line-height:.9; text-align:center; text-transform:uppercase; transform:scaleX(.86); white-space:nowrap">${esc(TITLE)}</h1>
    <div style="font-size:3.6mm; line-height:1.38; color:${C.deep}; border-left:.5mm solid ${C.red}; padding-left:4mm">${esc(INTRO)}</div>
  </header><div class="checks"></div>`;

// The Veggie / With meat / Al forno grid. o: { rowH, ph: {3,2,1}, nm, ds, gap, labW, card }
function grid(o) {
  const item = (p, h, bw) => `<div class="it" style="gap:${o.gap}mm"><div class="pb" style="width:${bw.toFixed(1)}mm">${photo(p.photo, h)}</div><div class="tx">
    <div class="nm" style="font-size:${o.nm}mm">${esc(p.name)} <span class="pr">$${money(p.price)}</span></div>
    <div class="ds" style="font-size:${o.ds}mm; margin-top:.6mm">${esc(p.desc)}${diet(p)}</div>${p.note ? `<div class="nt" style="font-size:${o.ds - .2}mm; margin-top:.5mm">${esc(p.note)}</div>` : ''}</div></div>`;
  const rows = ROWS.map((r, ri) => {
    const cells = BY_KIND.map((c) => {
      const items = r.items.filter((p) => p.kind === c.key);
      const h = o.ph[Math.min(items.length, 3)];
      const bw = Math.max(...items.map((p) => h * (WIDE[p.photo] || 1.42)));
      return `<div class="cell${ri ? ' r2' : ''}">${items.map((p) => item(p, h, bw)).join('')}</div>`;
    });
    return `<div class="lab" style="margin:2mm 3mm 2mm 0"><span style="font-size:${o.labFont || 8}mm">${r.name}</span></div>` + cells.join(`<div class="vline${ri ? ' r2' : ''}"></div>`);
  }).join('');
  const heads = BY_KIND.map((c) => `<div class="${o.headClass || 'oval'} col">${c.name}<small>${c.note}</small></div>`).join('<div></div>');
  return `<div class="grid" style="display:grid; grid-template-columns:${o.labW}mm 1fr 6mm 1fr 6mm 1fr; grid-template-rows:auto ${o.rowH}mm ${o.rowH}mm">
    <div></div>${heads}${rows}</div>`;
}

const shapeItems = () => SHAPES.map((s) => `<div class="sh${/Gluten/.test(s) ? ' gf' : ''}"><div class="ic">${SHAPE_SVG[s]()}</div><span>${esc(s)}</span></div>`).join('');
const addList = () => CREATE.adds.map(([n, p]) => `<li>${esc(n)} <b>$${money(p)}</b></li>`).join('');

// =============================================================================================
// 1 · Refined
// =============================================================================================
function v1() {
  const css = `
.shapes { display: grid; grid-template-columns: 32mm 1fr 66mm; align-items: center; background: ${C.band}; border-radius: 3mm; padding: 1.5mm 6mm; margin-bottom: 2.5mm; height: 24mm }
.shapes h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 6.6mm; line-height: .95; color: ${C.red} }
.shapes .row { display: flex; justify-content: space-around; align-items: flex-end }
.shapes .sh { display: flex; flex-direction: column; align-items: center; gap: .4mm }
.shapes .ic { width: 15mm; height: 15mm }
.shapes .sh span { font-weight: 700; font-size: 3.5mm; color: ${C.red}; white-space: nowrap; padding: .3mm 2.4mm .5mm; border-radius: 6mm }
.shapes .sh.gf span { background: ${C.red}; color: ${C.paper} }
.shapes .why { font-size: 3.2mm; line-height: 1.3; color: ${C.deep}; border-left: .4mm solid ${C.red}; padding-left: 4mm }
.shapes .why b { display: block; color: ${C.red}; font-size: 3.7mm }
.col { justify-self: start; align-self: end; font-size: 6.6mm; padding: 1.5mm 6.5mm 1.9mm; margin: 0 0 1.5mm 2mm }
.create { position: absolute; left: 12mm; right: 12mm; bottom: 9mm; height: 40mm; background: ${C.red}; color: ${C.paper}; border-radius: 4mm;
  display: flex; justify-content: space-between; align-items: center; padding: 0 9mm }
.create h4 { font-family: 'Lilita One'; font-weight: 400; font-size: 9mm; line-height: .95 }
.create .price { display: inline-block; background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 6mm; padding: .6mm 3.6mm 1mm; border-radius: 5mm; line-height: 1; margin: 1.6mm 0 1.4mm }
.create .how { font-size: 3.4mm; font-style: italic; opacity: .92 }
.create .bs { display: flex; align-items: center; gap: 3.5mm }
.create .rnd { box-shadow: 0 0 0 1mm ${C.paper} }
.create .bs b { font-family: 'Lilita One'; font-weight: 400; font-size: 5.4mm; line-height: 1 } .create .bs small { display: block; font-size: 3.2mm; font-style: italic; opacity: .9; margin-top: .6mm }
.create .or { width: 10mm; height: 10mm; border-radius: 50%; border: .5mm solid rgba(253,251,239,.7); display: grid; place-items: center; font-style: italic; font-size: 3.6mm }
.create .adds { border-left: .35mm solid rgba(253,251,239,.45); padding-left: 7mm }
.create .adds h5 { font-size: 3.1mm; letter-spacing: .08em; text-transform: uppercase; opacity: .85; margin-bottom: 1.4mm }
.create ul { list-style: none; display: grid; grid-template-columns: auto auto; gap: 1.6mm 7mm; font-size: 4mm }
.create li::before { content: '× '; font-family: 'Lilita One'; opacity: .75 } .create li b { font-weight: 700 }`;
  return base(`il Mercato Centrale — ${TITLE} (round 3 · 1)`, css, stdHeader()) + `
  <div class="shapes"><h3>Pick your<br>shape</h3><div class="row">${shapeItems()}</div>
    <div class="why"><b>Any dish, any shape.</b>Swap to any of these, except the lasagna. <b style="display:inline; font-size:inherit">V</b> vegetarian</div></div>
  ${grid({ rowH: 78, ph: { 3: 21.5, 2: 27, 1: 28 }, nm: 4.7, ds: 3.3, gap: 2.5, labW: 14, labFont: 7.6 })}
  <div class="create"><div><h4>Create your own</h4><div class="price">$${money(CREATE.price)}</div><div class="how">Pick a base, then add what you like</div></div>
    <div class="bs">${round(BASES[0].photo, 33)}<div><b>Parmesan<br>cream</b><small>base</small></div></div>
    <div class="or">or</div>
    <div class="bs">${round(BASES[1].photo, 33)}<div><b>Zucchini<br>cream</b><small>base</small></div></div>
    <div class="adds"><h5>Add</h5><ul>${addList()}</ul></div></div>` + foot;
}

// =============================================================================================
// 2 · Sidebar
// =============================================================================================
function v2() {
  const css = `
.body { display: grid; grid-template-columns: 1fr 98mm; column-gap: 6mm }
.col { justify-self: start; align-self: end; font-size: 6.2mm; padding: 1.4mm 6mm 1.8mm; margin: 0 0 1.5mm 2mm }
aside { background: ${C.red}; color: ${C.paper}; border-radius: 4mm; height: 236mm; padding: 6mm 6mm 5mm; display: flex; flex-direction: column }
aside h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 8mm; line-height: 1; text-align: center }
aside .sub { text-align: center; font-size: 3.3mm; font-style: italic; opacity: .9; margin: 1mm 0 3.5mm }
.shapes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm 2mm }
.sh { display: flex; flex-direction: column; align-items: center; gap: 1mm }
.sh .ic { width: 25mm; height: 25mm; border-radius: 50%; background: ${C.paper}; padding: 2.5mm }
.sh span { font-weight: 700; font-size: 3.3mm; text-align: center; line-height: 1.1 }
.sh.gf .ic { box-shadow: 0 0 0 .8mm ${C.red}, 0 0 0 1.5mm ${C.paper} }
.div { height: 6mm; margin: 5mm 0 4mm; background: radial-gradient(circle, rgba(253,251,239,.55) .5mm, transparent .6mm) 0 50% / 4mm 4mm repeat-x }
.ct { display: flex; align-items: center; justify-content: center; gap: 3mm }
.ct .price { background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 5.6mm; padding: .5mm 3.2mm .9mm; border-radius: 5mm; line-height: 1 }
.bs { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin: 3mm 0 3.5mm }
.bs > div { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.6mm }
.bs .rnd { box-shadow: 0 0 0 1mm ${C.paper} }
.bs b { font-family: 'Lilita One'; font-weight: 400; font-size: 4.8mm; line-height: 1 }
aside h5 { font-size: 3mm; letter-spacing: .08em; text-transform: uppercase; opacity: .85; text-align: center; margin-bottom: 1.4mm }
aside ul { margin-bottom: 4mm; list-style: none; display: grid; grid-template-columns: auto auto; justify-content: center; gap: 1.4mm 6mm; font-size: 3.9mm }
aside li::before { content: '× '; font-family: 'Lilita One'; opacity: .75 }
aside .leg { margin-top: auto; text-align: center; font-size: 3mm; opacity: .85 }`;
  return base(`il Mercato Centrale — ${TITLE} (round 3 · 2)`, css, stdHeader(32, 64, 22)) + `
  <div class="body"><main>${grid({ rowH: 111, ph: { 3: 24, 2: 27, 1: 25 }, nm: 4.5, ds: 3.3, gap: 2.5, labW: 14, labFont: 8 })}</main>
    <aside>
      <h3>Pick your shape</h3><div class="sub">Any dish, any shape, except the lasagna</div>
      <div class="shapes">${shapeItems()}</div>
      <div class="div"></div>
      <div class="ct"><h3>Create your own</h3><div class="price">$${money(CREATE.price)}</div></div>
      <div class="sub" style="margin-bottom:0">Pick a base, then add what you like</div>
      <div class="bs">${BASES.map((b) => `<div>${round(b.photo, 42)}<b>${b.name}</b></div>`).join('')}</div>
      <h5>Add</h5><ul>${addList()}</ul>
      <div class="leg">V vegetarian</div>
    </aside></div>` + foot;
}

// =============================================================================================
// 3 · Poster
// =============================================================================================
function v3() {
  const header = `
  <div class="hero">
    <div class="badge"><img src="../../pizza-menu/brand/il-mercato-logo.png"></div>
    <div class="ttl"><div class="blob"></div><h1>${esc(TITLE)}</h1></div>
    <div class="side"><div class="xs">× × × ×</div><p>${esc(INTRO)}</p></div>
    <div class="dots"></div>
  </div><div class="checks full"></div>`;
  const css = `
.page { padding: 0 12mm }
.hero { margin: 0 -12mm; height: 46mm; background: ${C.red}; position: relative; display: grid; grid-template-columns: 82mm 1fr 80mm; align-items: center; padding: 0 12mm; column-gap: 6mm }
.hero .badge { background: ${C.paper}; border-radius: 5mm; padding: 3mm 5mm; width: 72mm; box-shadow: 0 1mm 2.4mm rgba(0,0,0,.2) } .hero .badge img { width: 100% }
.hero .ttl { position: relative; display: grid; place-items: center; height: 100% }
.hero .blob { position: absolute; width: 78%; height: 62%; background: ${C.blue}; border-radius: 50% }
.hero h1 { position: relative; font-family: 'Lilita One'; font-weight: 400; color: ${C.paper}; font-size: 21mm; line-height: .9; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap;
  text-shadow: .5mm .5mm 0 ${C.deep}, 1mm 1mm 0 ${C.deep}, 1.5mm 1.5mm 0 ${C.deep} }
.hero .side { color: ${C.paper}; font-size: 3.6mm; line-height: 1.38 } .hero .xs { font-family: 'Lilita One'; font-size: 5mm; letter-spacing: 1.5mm; margin-bottom: 2mm; opacity: .9 }
.hero .dots { position: absolute; left: 2mm; top: 4mm; width: 8mm; height: 38mm; background: radial-gradient(circle, rgba(253,251,239,.6) .6mm, transparent .7mm) 0 0 / 4mm 4mm }
.checks.full { margin: 0 -12mm 3.5mm }
.shapes { display: grid; grid-template-columns: 30mm 1fr 60mm; align-items: center; margin-bottom: 2mm; height: 25mm }
.shapes h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 6.6mm; line-height: .95; color: ${C.red} }
.shapes .row { display: flex; justify-content: space-around; align-items: flex-end }
.shapes .sh { display: flex; flex-direction: column; align-items: center; gap: .8mm }
.shapes .ic { width: 18mm; height: 18mm; border-radius: 50%; background: ${C.band}; padding: 2mm }
.shapes .sh span { font-weight: 700; font-size: 3.4mm; color: ${C.red}; white-space: nowrap }
.shapes .sh.gf .ic { background: ${C.red} } .shapes .sh.gf span { background: ${C.red}; color: ${C.paper}; padding: 0 2.2mm .3mm; border-radius: 5mm }
.shapes .why { font-size: 3.2mm; line-height: 1.3; color: ${C.deep} } .shapes .why b { display: block; color: ${C.red}; font-size: 3.8mm }
.bluehead { justify-self: start; align-self: end; font-family: 'Lilita One'; font-weight: 400; background: ${C.blue}; color: ${C.red}; border-radius: 50%; line-height: 1; white-space: nowrap;
  font-size: 6.8mm; padding: 1.6mm 7mm 2mm; margin: 0 0 1.5mm 2mm }
.bluehead small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; color: ${C.deep}; margin-left: 2mm }
.grid .cell { background: ${C.band}; padding: 0 3mm } .grid .cell.r2 { border-top: .6mm solid ${C.paper} }
.grid > .cell:nth-child(n) { border-radius: 0 }
.grid .vline { background: transparent }
.grid img[src*="gnocchi-sorrentina"] { -webkit-mask-image: radial-gradient(ellipse 50% 58% at 50% 56%, #000 78%, transparent 100%) !important }
.create { position: absolute; left: 12mm; right: 12mm; bottom: 9mm; height: 38mm; border: .6mm solid ${C.red}; border-radius: 4mm; background: ${C.paper};
  display: flex; justify-content: space-between; align-items: center; padding: 0 30mm 0 9mm }
.create h4 { font-family: 'Lilita One'; font-weight: 400; font-size: 9.4mm; line-height: .95; color: ${C.red} }
.create .how { font-size: 3.5mm; font-style: italic; color: ${C.deep}; margin-top: 1.4mm }
.create .bs { display: flex; align-items: center; gap: 3mm }
.create .rnd { box-shadow: 0 .8mm 2mm rgba(80,30,10,.3) }
.create .bs b { font-family: 'Lilita One'; font-weight: 400; font-size: 5.4mm; line-height: 1; color: ${C.red} }
.create .adds h5 { font-size: 3.1mm; letter-spacing: .08em; text-transform: uppercase; color: ${C.deep}; margin-bottom: 1.4mm }
.create ul { list-style: none; display: grid; grid-template-columns: auto auto; gap: 1.6mm 7mm; font-size: 4mm }
.create li::before { content: '× '; font-family: 'Lilita One'; color: ${C.red} } .create li b { color: ${C.red} }
.create .pbadge { position: absolute; right: -4mm; top: -9mm; width: 27mm; height: 27mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: grid; place-items: center;
  transform: rotate(-10deg); font-family: 'Lilita One'; font-size: 7.4mm; box-shadow: 0 0 0 1.2mm ${C.paper}, 0 0 0 1.7mm ${C.red} }
`;
  return base(`il Mercato Centrale — ${TITLE} (round 3 · 3)`, css, header) + `
  <div class="shapes"><h3>Pick your<br>shape</h3><div class="row">${shapeItems()}</div>
    <div class="why"><b>Any dish, any shape.</b>Swap to any of these, except the lasagna. V vegetarian</div></div>
  ${grid({ rowH: 74, ph: { 3: 21, 2: 26, 1: 27 }, nm: 4.6, ds: 3.25, gap: 2.5, labW: 14, labFont: 7.4, headClass: 'bluehead' })}
  <div class="create"><div><h4>Create your own</h4><div class="how">Pick a base, then add what you like</div></div>
    ${BASES.map((b) => `<div class="bs">${round(b.photo, 33)}<b>${b.name.replace(' ', '<br>')}</b></div>`).join('')}
    <div class="adds"><h5>Add</h5><ul>${addList()}</ul></div>
    <div class="pbadge">$${money(CREATE.price)}</div></div>` + foot;
}

const VERSIONS = { 1: v1, 2: v2, 3: v3 };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VERSIONS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `combo3-${k}.html`);
    fs.writeFileSync(file, VERSIONS[k]());
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `combo3-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `combo3-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
