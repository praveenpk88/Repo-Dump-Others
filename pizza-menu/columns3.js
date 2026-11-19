// Pizza menu, round 3 treatments, matching ../pasta-menu/combo3.js. Treatment 1 (Refined) is columns.js as approved.
//   2 · Sidebar  a red sidebar holds Pick your base and the Level up your Margherita ladder
//   3 · Poster   red header with the blue oval, cream card columns, blue column heads
// Usage: node columns3.js   (or node columns3.js 2)   → output/variant-columns-2.pdf/.png, variant-columns-3.*
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { C, PAGE, esc, money, M, all, COLUMNS, NOTES, pizzaSvg } = require('./columns');

const OUT = path.join(__dirname, 'output');
const checks = (h) => `repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / ${h}mm ${h}mm`;
const LADDER = [['Margherita', 'the classic'], ['Bufalina', '+ buffalo mozzarella'], ['Prosciutto', '+ prosciutto']];
const arrowSvg = (color) => `<svg viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const GF_TEXT = 'Samuele holds a Coeliac Australia certificate. GF pizzas are cooked in the same oven as our regular bases, so we can’t guarantee no gluten or cross-contact.';

const diet = (p) => (p.diet ? ` <b class="dt">${p.diet.replace(/,\s*/g, ' · ')}</b>` : '');
const item = (p, h) => `<div class="it"><div class="pb" style="width:${h}mm"><img class="ph" src="../photos/${p.photo}.jpg" style="width:${h}mm; height:${h}mm"></div><div class="tx">
  <div class="nm">${esc(p.name)} <span class="pr">$${money(p.price)}</span></div>
  <div class="ds">${esc(p.desc)}${diet(p)}</div>${NOTES[p.name] || p.note ? `<div class="nt">${esc(NOTES[p.name] || p.note)}</div>` : ''}</div></div>`;
const infoBox = () => `<div class="info"><div class="stamp"><span>${esc(M.brand.tagline).replace(/\. /g, '.<br>')}</span></div>
  <div><h4>Vegan? Just ask</h4><p>${esc(M.notes.vegan.text)}</p><p class="leg"><b>V</b> vegetarian · <b>Ve</b> vegan</p></div></div>`;

const baseCss = `
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: 8mm 12mm 0 }
img { display: block } svg { display: block; width: 100%; height: 100% }
.checks { height: 7mm; background: ${checks(7)}; margin: 1mm 0 3.5mm }
.bottom { position: absolute; left: 0; right: 0; bottom: 0; height: 5mm; background: ${checks(5)} }
.it { display: flex; align-items: center; gap: 3mm; min-width: 0 }
.pb { display: flex; justify-content: center; flex: none }
.ph { border-radius: 50%; object-fit: cover; box-shadow: 0 .7mm 1.6mm rgba(80,30,10,.28) }
.nm { font-weight: 700; color: ${C.red}; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { white-space: nowrap }
.ds { line-height: 1.28; margin-top: .6mm }
.dt { font-weight: 700; color: ${C.red}; font-size: .9em; white-space: nowrap }
.nt { margin-top: .5mm; font-style: italic; color: ${C.deep} }
.heads, .grid { display: grid; grid-template-columns: 1fr 6mm 1fr 6mm 1fr }
.col { display: flex; flex-direction: column; justify-content: space-between }
.vline { width: .35mm; background: ${C.rule}; justify-self: center }
.info { border: .5mm solid ${C.red}; border-radius: 3mm; padding: 4.5mm 5mm; display: grid; grid-template-columns: 34mm 1fr; column-gap: 5mm; align-items: center; background: ${C.paper} }
.stamp { width: 34mm; height: 34mm; border-radius: 50%; background: ${C.red}; color: ${C.paper}; display: grid; place-items: center; text-align: center; transform: rotate(-8deg);
  box-shadow: 0 0 0 1.2mm ${C.paper}, 0 0 0 1.6mm ${C.red} }
.stamp span { font-family: 'Lilita One'; font-size: 4.4mm; line-height: 1.05; padding: 0 3mm }
.info h4 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 5.6mm; line-height: 1; margin-bottom: 1.2mm }
.info p { font-size: 3.4mm; line-height: 1.35; margin-bottom: 2.6mm } .info p:last-child { margin-bottom: 0 } .info .leg b { color: ${C.red} }`;

const stdHeader = (h = 32) => `<header style="display:grid; grid-template-columns:72mm minmax(0,1fr) 86mm; align-items:center; height:${h}mm; column-gap:8mm">
  <img src="../brand/il-mercato-logo.png" style="width:64mm"><h1 style="font-family:'Lilita One'; font-weight:400; color:${C.red}; font-size:22mm; line-height:.9; text-align:center;
  text-transform:uppercase; transform:scaleX(.86); white-space:nowrap">Pizza Napoletana</h1>
  <div style="font-size:3.1mm; line-height:1.38; color:${C.deep}; border-left:.5mm solid ${C.red}; padding-left:4mm">${esc(M.brand.intro)}<b style="display:block; margin-top:1mm; color:${C.red}">${esc(M.brand.introAsk)}</b></div>
</header><div class="checks"></div>`;
const page = (title, css, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../fonts/fonts.css"><style>${baseCss}${css}</style></head><body><div class="page">${body}<div class="bottom"></div></div></body></html>`;

// =============================================================================================
// 2 · Sidebar
// =============================================================================================
function v2() {
  const PH = { 5: 27, 6: 24, 2: 34 };
  const cols = COLUMNS.map((c, ci) => `<div class="col${ci === 2 ? ' sea' : ''}">${c.items.map((n) => item(all[n], PH[c.items.length])).join('')}${ci === 2 ? infoBox() : ''}</div>`);
  const css = `
.body { display: grid; grid-template-columns: 1fr 98mm; column-gap: 6mm }
.oval { justify-self: start; font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap;
  font-size: 6.4mm; padding: 1.5mm 6mm 1.9mm; margin-bottom: 2.5mm } .oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .92; margin-left: 2mm }
.grid { height: 222mm }
.nm { font-size: 4.6mm } .ds { font-size: 3.25mm } .nt { font-size: 3.05mm }
.col.sea { justify-content: space-between } .col.sea .info { grid-template-columns: 1fr; justify-items: center; text-align: center; row-gap: 4mm; padding: 6mm 5mm }
aside { background: ${C.red}; color: ${C.paper}; border-radius: 4mm; height: 236mm; padding: 6mm 6mm 5mm; display: flex; flex-direction: column }
aside h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 8mm; line-height: 1; text-align: center }
aside .sub { text-align: center; font-size: 3.3mm; font-style: italic; opacity: .9; margin: 1mm 0 4mm }
.bases { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm }
.bases > div { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.6mm }
.bases .ic { width: 30mm; height: 30mm; border-radius: 50%; background: ${C.paper}; padding: 2.5mm }
.bases b { font-family: 'Lilita One'; font-weight: 400; font-size: 5mm; line-height: 1 }
.bases small { font-size: 3mm; opacity: .9 }
.gfnote { font-size: 2.9mm; line-height: 1.3; opacity: .88; text-align: center; margin-top: 3.5mm }
.div { height: 6mm; margin: 4mm 0; background: radial-gradient(circle, rgba(253,251,239,.55) .5mm, transparent .6mm) 0 50% / 4mm 4mm repeat-x }
.ladder { display: flex; flex-direction: column; align-items: center; gap: 1.6mm; margin-top: 2mm }
.ladder .st { display: grid; grid-template-columns: 27mm 1fr; column-gap: 4mm; align-items: center; width: 80mm }
.ladder .st img { width: 27mm; height: 27mm; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 1mm ${C.paper} }
.ladder .st b { font-family: 'Lilita One'; font-weight: 400; font-size: 5.4mm; line-height: 1; display: block }
.ladder .st span { display: inline-block; background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 4.2mm; padding: .3mm 2.6mm .6mm; border-radius: 3mm; margin: 1mm 0 .6mm; line-height: 1 }
.ladder .st small { display: block; font-size: 3.1mm; font-style: italic; opacity: .92 }
.ladder i { width: 7mm; height: 7mm; border-radius: 50%; background: ${C.paper}; padding: 1mm; transform: rotate(90deg); margin-left: -54mm }`;
  return page('il Mercato Centrale — Pizza Napoletana (round 3 · 2)', css, stdHeader() + `
  <div class="body"><main>
      <div class="heads">${COLUMNS.map((c) => `<div class="oval">${c.name}<small>${c.note}</small></div>`).join('<div></div>')}</div>
      <div class="grid">${cols.join('<div class="vline"></div>')}</div></main>
    <aside>
      <h3>Pick your base</h3><div class="sub">Every pizza, either base</div>
      <div class="bases"><div><div class="ic">${pizzaSvg(false)}</div><b>Samuele’s dough</b><small>Our classic base</small></div>
        <div><div class="ic">${pizzaSvg(true)}</div><b>Gluten-free</b><small>Made in-house by Samuele</small></div></div>
      <div class="gfnote">${GF_TEXT}</div>
      <div class="div"></div>
      <h3>Level up your Margherita</h3><div class="sub" style="margin-bottom:1mm">Same pizza, a little more on top</div>
      <div class="ladder">${LADDER.map(([n, s], i) => `${i ? `<i>${arrowSvg(C.red)}</i>` : ''}<div class="st"><img src="../photos/${all[n].photo}.jpg"><div><b>${n}</b><span>$${money(all[n].price)}</span><small>${s}</small></div></div>`).join('')}</div>
    </aside></div>`);
}

// =============================================================================================
// 3 · Poster
// =============================================================================================
function v3() {
  const PH = { 5: 24, 6: 21.5, 2: 28 };
  const ladder = `<div class="ladder"><div class="tag">Level up your Margherita</div><div class="steps">${LADDER.map(([n, s], i) =>
    `${i ? `<i>${arrowSvg(C.paper)}</i>` : ''}<div class="st"><img src="../photos/${all[n].photo}.jpg"><b>${n}</b><span>$${money(all[n].price)}</span><small>${s}</small></div>`).join('')}</div></div>`;
  const cols = COLUMNS.map((c, ci) => `<div class="col card${ci === 2 ? ' sea' : ''}">${c.items.map((n) => item(all[n], PH[c.items.length])).join('')}${ci === 2 ? ladder + infoBox() : ''}</div>`);
  const css = `
.page { padding: 0 12mm }
.hero { margin: 0 -12mm; height: 46mm; background: ${C.red}; position: relative; display: grid; grid-template-columns: 82mm 1fr 82mm; align-items: center; padding: 0 12mm; column-gap: 6mm }
.hero .badge { background: ${C.paper}; border-radius: 5mm; padding: 3mm 5mm; width: 72mm; box-shadow: 0 1mm 2.4mm rgba(0,0,0,.2) } .hero .badge img { width: 100% }
.hero .ttl { position: relative; display: grid; place-items: center; height: 100% }
.hero .blob { position: absolute; width: 84%; height: 62%; background: ${C.blue}; border-radius: 50% }
.hero h1 { position: relative; font-family: 'Lilita One'; font-weight: 400; color: ${C.paper}; font-size: 20mm; line-height: .9; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap;
  text-shadow: .5mm .5mm 0 ${C.deep}, 1mm 1mm 0 ${C.deep}, 1.5mm 1.5mm 0 ${C.deep} }
.hero .side { color: ${C.paper}; font-size: 3mm; line-height: 1.36 } .hero .side b { display: block; margin-top: 1mm } .hero .xs { font-family: 'Lilita One'; font-size: 5mm; letter-spacing: 1.5mm; margin-bottom: 1.5mm; opacity: .9 }
.hero .dots { position: absolute; left: 2mm; top: 4mm; width: 8mm; height: 38mm; background: radial-gradient(circle, rgba(253,251,239,.6) .6mm, transparent .7mm) 0 0 / 4mm 4mm }
.checks.full { margin: 0 -12mm 3.5mm }
.bases { display: grid; grid-template-columns: 30mm 1fr 1fr 120mm; column-gap: 6mm; align-items: center; height: 25mm; margin-bottom: 2mm }
.bases h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 6.6mm; line-height: .95; color: ${C.red} }
.bases .opt { display: flex; align-items: center; gap: 3.5mm }
.bases .ic { width: 21mm; height: 21mm; border-radius: 50%; background: ${C.band}; padding: 1.5mm; flex: none }
.bases .opt.gf .ic { background: ${C.red} }
.bases .opt b { display: block; font-weight: 700; color: ${C.red}; font-size: 4.4mm; line-height: 1.1 } .bases .opt span { font-size: 3.3mm }
.bases .why { font-size: 3.1mm; line-height: 1.32; color: ${C.deep} } .bases .why b { display: block; color: ${C.red}; font-size: 3.7mm }
.bluehead { justify-self: start; font-family: 'Lilita One'; font-weight: 400; background: ${C.blue}; color: ${C.red}; border-radius: 50%; line-height: 1; white-space: nowrap;
  font-size: 6.8mm; padding: 1.6mm 7mm 2mm; margin: 0 0 2mm 2mm } .bluehead small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; color: ${C.deep}; margin-left: 2mm }
.grid { height: 186mm } .vline { background: transparent }
.card { background: ${C.band}; border-radius: 3mm; padding: 4mm 4mm }
.nm { font-size: 4.6mm } .ds { font-size: 3.2mm } .nt { font-size: 3mm }
.col.sea { justify-content: flex-start; gap: 4mm }
.ladder { position: relative; background: ${C.red}; color: ${C.paper}; border-radius: 3mm; padding: 7mm 3mm 3mm; margin-top: 5mm }
.ladder .tag { position: absolute; top: -3.6mm; left: 50%; transform: translateX(-50%); background: ${C.blue}; color: ${C.red}; font-family: 'Lilita One'; font-size: 4.6mm;
  padding: 1mm 6mm 1.4mm; border-radius: 50%; white-space: nowrap; line-height: 1 }
.ladder .steps { display: flex; align-items: flex-start; justify-content: space-between }
.ladder .st { display: flex; flex-direction: column; align-items: center; text-align: center; width: 31mm }
.ladder .st img { width: 20mm; height: 20mm; border-radius: 50%; object-fit: cover; box-shadow: 0 0 0 .8mm ${C.paper}; margin-bottom: 1.4mm }
.ladder .st b { font-family: 'Lilita One'; font-weight: 400; font-size: 4.2mm; line-height: 1 }
.ladder .st span { font-family: 'Lilita One'; color: ${C.red}; background: ${C.paper}; border-radius: 3mm; font-size: 3.6mm; padding: .3mm 2.4mm .6mm; margin: .8mm 0 .5mm; line-height: 1 }
.ladder .st small { font-size: 2.8mm; font-style: italic; opacity: .9 }
.ladder i { width: 6mm; height: 6mm; flex: none; margin-top: 7mm; opacity: .9 }
.col.sea .info { margin-top: auto }`;
  return page('il Mercato Centrale — Pizza Napoletana (round 3 · 3)', css, `
  <div class="hero"><div class="badge"><img src="../brand/il-mercato-logo.png"></div>
    <div class="ttl"><div class="blob"></div><h1>Pizza Napoletana</h1></div>
    <div class="side"><div class="xs">× × × ×</div>${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div><div class="dots"></div></div>
  <div class="checks full"></div>
  <div class="bases"><h3>Pick your<br>base</h3>
    <div class="opt"><div class="ic">${pizzaSvg(false)}</div><div><b>Samuele’s dough</b><span>Our classic base</span></div></div>
    <div class="opt gf"><div class="ic">${pizzaSvg(true)}</div><div><b>Gluten-free base</b><span>Made in-house by Samuele</span></div></div>
    <div class="why"><b>Every pizza, either base.</b>${GF_TEXT}</div></div>
  <div class="heads">${COLUMNS.map((c) => `<div class="bluehead">${c.name}<small>${c.note}</small></div>`).join('<div></div>')}</div>
  <div class="grid">${cols.join('<div class="vline"></div>')}</div>`);
}

const VERSIONS = { 2: v2, 3: v3 };

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VERSIONS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const pg = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `variant-columns-${k}.html`);
    fs.writeFileSync(file, VERSIONS[k]());
    await pg.goto('file://' + file, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(OUT, `variant-columns-${k}.png`) });
    await pg.pdf({ path: path.join(OUT, `variant-columns-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
