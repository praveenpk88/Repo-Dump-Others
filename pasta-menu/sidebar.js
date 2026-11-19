// Pasta & Gnocchi, the chosen Sidebar layout (round 3 · 2), reworked. A3 landscape.
//   a · Adjusted  same layout; prices pinned to a right-hand column, Monday special in the empty Al forno gnocchi cell,
//                 allergy line, slightly bigger shapes and base photos
//   b · Poster    a, with the red poster header (blue oval, × × × ×, dots)
// Usage: node sidebar.js   (or node sidebar.js b)   → output/sidebar-a.pdf/.png, sidebar-b.*
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { SHAPE_SVG } = require('./shapes');
const { C, PAGE, esc, money, TITLE, INTRO, SHAPES, CREATE, ROWS, BY_KIND, WIDE, photo } = require('./combo2');

const OUT = path.join(__dirname, 'output');
const BASES = [{ name: 'Parmesan cream', photo: 'create-parmesan' }, { name: 'Zucchini cream', photo: 'create-zucchini' }];
const checks = (h) => `repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / ${h}mm ${h}mm`;
const round = (name, d) => `<div class="rnd" style="width:${d}mm; height:${d}mm"><img src="../photos/${name}.png"></div>`;

function render(poster) {
  const item = (p, h, bw) => `<div class="it"><div class="pb" style="width:${bw.toFixed(1)}mm">${photo(p.photo, h)}</div><div class="tx">
    <div class="nm">${esc(p.name)}${p.v ? ' <b class="dt">V</b>' : ''}</div><b class="pr">$${money(p.price)}</b>
    <div class="ds">${esc(p.desc)}</div>${p.note && !/Monday/.test(p.note) ? `<div class="nt">${esc(p.note)}</div>` : ''}</div></div>`;
  const monday = `<div class="monday"><div class="mb"><b>$10</b><span>Mondays</span></div><div><h5>Monday special</h5><p>Rigatoni alla Vodka, <b>$10</b> all day</p></div></div>`;
  const rows = ROWS.map((r, ri) => {
    const cells = BY_KIND.map((c) => {
      const items = r.items.filter((p) => p.kind === c.key);
      const h = { 3: 23, 2: 27, 1: 30 }[Math.min(items.length, 3)];
      const bw = Math.max(...items.map((p) => h * (WIDE[p.photo] || 1.3)));
      const extra = ri === 1 && c.key === 'forno' ? monday : '';
      return `<div class="cell${ri ? ' r2' : ''}">${items.map((p) => item(p, h, bw)).join('')}${extra}</div>`;
    });
    return `<div class="lab"><span>${r.name}</span></div>` + cells.join(`<div class="vline${ri ? ' r2' : ''}"></div>`);
  }).join('');

  const header = poster ? `
  <div class="hero"><div class="badge"><img src="../../pizza-menu/brand/il-mercato-logo.png"></div>
    <div class="ttl"><div class="blob"></div><h1>${esc(TITLE)}</h1></div>
    <div class="side"><div class="xs">× × × ×</div>${esc(INTRO)}</div><div class="dots"></div></div>
  <div class="checks full"></div>` : `
  <header><img class="logo" src="../../pizza-menu/brand/il-mercato-logo.png"><h1>${esc(TITLE)}</h1><div class="intro">${esc(INTRO)}</div></header>
  <div class="checks"></div>`;

  const css = `
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: ${poster ? '0 12mm' : '8mm 12mm 0'} }
img { display: block } svg { display: block; width: 100%; height: 100% }
.ph { width: auto; flex: none; -webkit-mask-image: radial-gradient(ellipse closest-side, #000 90%, transparent 100%) }
img[src*="gnocchi-sorrentina"] { -webkit-mask-image: none }
.rnd { border-radius: 50%; overflow: hidden; background: ${C.paper}; flex: none }
.rnd img { width: 100%; height: 100%; object-fit: cover; -webkit-mask-image: radial-gradient(circle closest-side, #000 93%, transparent 100%) }
header { display: grid; grid-template-columns: 70mm minmax(0, 1fr) 80mm; align-items: center; height: 30mm; column-gap: 8mm }
header .logo { width: 62mm }
header h1 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 21mm; line-height: .9; text-align: center; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap }
header .intro { font-size: 3.6mm; line-height: 1.38; color: ${C.deep}; border-left: .5mm solid ${C.red}; padding-left: 4mm }
.checks { height: 7mm; background: ${checks(7)}; margin: 1mm 0 3.5mm }
.checks.full { margin: 0 -12mm 4mm }
.hero { margin: 0 -12mm; height: 42mm; background: ${C.red}; position: relative; display: grid; grid-template-columns: 80mm 1fr 76mm; align-items: center; padding: 0 12mm; column-gap: 6mm }
.hero .badge { background: ${C.paper}; border-radius: 5mm; padding: 2.6mm 4.6mm; width: 66mm; box-shadow: 0 1mm 2.4mm rgba(0,0,0,.2) } .hero .badge img { width: 100% }
.hero .ttl { position: relative; display: grid; place-items: center; height: 100% }
.hero .blob { position: absolute; width: 82%; height: 64%; background: ${C.blue}; border-radius: 50% }
.hero h1 { position: relative; font-family: 'Lilita One'; font-weight: 400; color: ${C.paper}; font-size: 20mm; line-height: .9; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap;
  text-shadow: .5mm .5mm 0 ${C.deep}, 1mm 1mm 0 ${C.deep}, 1.5mm 1.5mm 0 ${C.deep} }
.hero .side { color: ${C.paper}; font-size: 3.6mm; line-height: 1.38 } .hero .xs { font-family: 'Lilita One'; font-size: 5mm; letter-spacing: 1.5mm; margin-bottom: 2mm; opacity: .9 }
.hero .dots { position: absolute; left: 2mm; top: 4mm; width: 8mm; height: 34mm; background: radial-gradient(circle, rgba(253,251,239,.6) .6mm, transparent .7mm) 0 0 / 4mm 4mm }
.body { display: grid; grid-template-columns: 1fr 96mm; column-gap: 6mm }
.grid { display: grid; grid-template-columns: 13mm 1fr 5mm 1fr 5mm 1fr; grid-template-rows: auto ${poster ? 105 : 109}mm ${poster ? 105 : 109}mm }
.oval { justify-self: start; align-self: end; font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap;
  font-size: 6.2mm; padding: 1.4mm 6mm 1.8mm; margin: 0 0 1.5mm 2mm }
.oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .92; margin-left: 2mm }
.lab { display: grid; place-items: center; border-radius: 3mm; background: ${C.red}; margin: 2mm 3mm 2mm 0 }
.lab span { font-family: 'Lilita One'; color: ${C.paper}; font-size: 7.6mm; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; letter-spacing: .03em }
.cell { display: flex; flex-direction: column; justify-content: space-evenly; padding: 1mm 0 }
.r2 { border-top: .4mm dashed ${C.rule} }
.vline { width: .35mm; background: ${C.rule}; justify-self: center; margin: 4mm 0 }
.it { display: flex; align-items: center; gap: 2.4mm; min-width: 0 }
.pb { display: flex; justify-content: center; flex: none }
.tx { flex: 1; min-width: 0 }
.nm { font-weight: 700; color: ${C.red}; font-size: 4.3mm; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { display: inline-block; margin-top: .9mm; font-family: 'Lilita One'; font-weight: 400; color: ${C.paper}; background: ${C.red}; border-radius: 3mm; font-size: 3.9mm; padding: .3mm 2.2mm .6mm; line-height: 1 }
.dt { font-weight: 700; color: ${C.red}; font-size: .78em; white-space: nowrap; border: .3mm solid ${C.red}; border-radius: 1mm; padding: 0 .7mm; vertical-align: .15em }
.ds { font-size: 3.2mm; line-height: 1.28; margin-top: .8mm }
.nt { font-size: 3mm; margin-top: .5mm; font-style: italic; color: ${C.deep} }
.monday { display: flex; align-items: center; gap: 3.5mm; background: ${C.band}; border-radius: 3mm; padding: 3mm 4mm }
.monday .mb { width: 21mm; height: 21mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: flex; flex-direction: column; align-items: center; justify-content: center;
  transform: rotate(-8deg); flex: none; font-size: 2.8mm; font-weight: 700; line-height: 1 }
.monday .mb b { font-family: 'Lilita One'; font-weight: 400; font-size: 8mm; line-height: .95 }
.monday h5 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 5mm; line-height: 1; margin-bottom: 1mm }
.monday p { font-size: 3.3mm; line-height: 1.3 } .monday p b { color: ${C.red} }
aside { background: ${C.red}; color: ${C.paper}; border-radius: 4mm; height: ${poster ? 233 : 237}mm; padding: 5.5mm 6mm 5mm; display: flex; flex-direction: column }
aside h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 8mm; line-height: 1; text-align: center }
aside .sub { text-align: center; font-size: 3.4mm; font-style: italic; opacity: .9; margin: 1.2mm 0 4.5mm }
.shapes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.6mm 2mm }
.sh { display: flex; flex-direction: column; align-items: center; gap: 1mm }
.sh .ic { width: 27mm; height: 27mm; border-radius: 50%; background: ${C.paper}; padding: 2.6mm }
.sh span { font-weight: 700; font-size: 3.3mm; text-align: center; line-height: 1.1 }
.sh.gf .ic { box-shadow: 0 0 0 .8mm ${C.red}, 0 0 0 1.5mm ${C.paper} }
.div { height: 5mm; margin: 6mm 0 5mm; background: radial-gradient(circle, rgba(253,251,239,.55) .5mm, transparent .6mm) 0 50% / 4mm 4mm repeat-x }
.ct { display: flex; align-items: center; justify-content: center; gap: 3mm }
.ct .price { background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 5.6mm; padding: .5mm 3.2mm .9mm; border-radius: 5mm; line-height: 1 }
.steps { display: flex; justify-content: center; gap: 2mm; font-size: 3.1mm; margin: 1.6mm 0 2.6mm; opacity: .95 }
.steps b { display: inline-grid; place-items: center; width: 4.4mm; height: 4.4mm; border-radius: 50%; background: ${C.paper}; color: ${C.red}; font-size: 2.8mm; margin-right: 1mm }
.bs { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1mm; margin-bottom: 3mm }
.bs > div.b { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.6mm }
.bs .rnd { box-shadow: 0 0 0 1mm ${C.paper} }
.bs b { font-family: 'Lilita One'; font-weight: 400; font-size: 4.6mm; line-height: 1 }
.bs .or { font-style: italic; font-size: 3.4mm; opacity: .9; margin-top: -6mm }
aside h5 { font-size: 3mm; letter-spacing: .08em; text-transform: uppercase; opacity: .85; text-align: center; margin-bottom: 1.4mm }
aside ul { list-style: none; display: grid; grid-template-columns: auto auto; justify-content: center; gap: 1.8mm 7mm; font-size: 4.3mm }
aside li::before { content: '× '; font-family: 'Lilita One'; opacity: .75 }
aside .leg { margin-top: auto; text-align: center; font-size: 3.9mm; font-weight: 600; opacity: 1; line-height: 1.35 }
aside .leg b { border: .3mm solid ${C.paper}; border-radius: 1mm; padding: 0 .7mm }`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>il Mercato Centrale — ${esc(TITLE)}</title>
<link rel="stylesheet" href="../../pizza-menu/fonts/fonts.css"><style>${css}</style></head><body><div class="page">${header}
  <div class="body"><main><div class="grid"><div></div>${BY_KIND.map((c) => `<div class="oval">${c.name}<small>${c.note}</small></div>`).join('<div></div>')}${rows}</div></main>
    <aside>
      <h3>Pick your shape</h3><div class="sub">Any dish, any shape, except the lasagna</div>
      <div class="shapes">${SHAPES.map((s) => `<div class="sh${/Gluten/.test(s) ? ' gf' : ''}"><div class="ic">${SHAPE_SVG[s]()}</div><span>${esc(s)}</span></div>`).join('')}</div>
      <div class="div"></div>
      <div class="ct"><h3>Create your own</h3><div class="price">$${money(CREATE.price)}</div></div>
      <div class="steps"><span><b>1</b>Pick a base</span><span><b>2</b>Pick a shape</span><span><b>3</b>Add extras</span></div>
      <div class="bs"><div class="b">${round(BASES[0].photo, 37)}<b>${BASES[0].name}</b></div><div class="or">or</div><div class="b">${round(BASES[1].photo, 37)}<b>${BASES[1].name}</b></div></div>
      <h5>Add</h5><ul>${CREATE.adds.map(([n, p]) => `<li>${esc(n)} <b>$${money(p)}</b></li>`).join('')}</ul>
      <div class="leg"><b>V</b> vegetarian · Allergies? Please ask our team before ordering.</div>
    </aside></div>
  <div style="position:absolute; left:0; right:0; bottom:0; height:5mm; background:${checks(5)}"></div>
</div></body></html>`;
}

const VERSIONS = { a: () => render(false), b: () => render(true) };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VERSIONS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `sidebar-${k}.html`);
    fs.writeFileSync(file, VERSIONS[k]());
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `sidebar-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `sidebar-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
