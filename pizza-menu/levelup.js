// Pizza menu, the manager's Classic → Level up → Go all in direction, rebuilt to pair with the pasta Sidebar menu
// (../pasta-menu/sidebar.js). A3 landscape.
//   - The one true ladder (Margherita → Bufalina → Prosciutto: same pizza, toppings added after the oven) is a hero band.
//   - The other pizzas are separate items, so they are plain lists under each tier instead of rows that imply upgrades.
//   - Red sidebar: Pick your base (Samuele's dough or gluten-free), vegan note, V / Ve key, allergy line.
//   a · Adjusted (standard header)   b · Poster header
// Uses menu-final.js (13 pizzas, prices +50c). Usage: node levelup.js   → output/levelup-a.pdf/.png, levelup-b.*
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { C, PAGE, esc, money, M, all, pizzaSvg } = require('./columns');

const OUT = path.join(__dirname, 'output');
const checks = (h) => `repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / ${h}mm ${h}mm`;
const TIERS = [
  { name: 'Classic', note: 'the classic flavours', items: ['Marinara', 'Cheesy Garlic', 'Napoletana', 'Vegetarian'] },
  { name: 'Level up', note: 'a little more on top', items: ['Hawaiian', 'Diavola', 'Salsiccia & Patate'] },
  { name: 'Go all in', note: 'the most loaded', items: ['Capricciosa', 'La Porcona', 'Gamberi'] },
];
const LADDER = [
  ['Margherita', null],
  ['Bufalina', '+ buffalo mozzarella'],
  ['Prosciutto', '+ prosciutto, on top of the Bufalina'],
];
const GF_TEXT = 'Samuele holds a Coeliac Australia certificate. GF pizzas are cooked in the same oven as our regular bases, so we can’t guarantee no gluten or cross-contact.';
const tags = (p) => (p.diet ? p.diet.split(/,\s*/).map((d) => ` <b class="dt">${d}</b>`).join('') : '');
const arrow = `<svg viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="${C.paper}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function render(poster) {
  const item = (p, h) => `<div class="it"><img class="ph" src="../photos/${p.photo}.jpg" style="width:${h}mm; height:${h}mm"><div class="tx">
    <div class="nm">${esc(p.name)}${tags(p)}</div><b class="pr">$${money(p.price)}</b>
    <div class="ds">${esc(p.desc)}</div>${p.note ? `<div class="nt">${esc(p.note)}</div>` : ''}</div></div>`;
  const ladder = `<div class="ladder"><div class="tag">Same pizza, level it up</div>${LADDER.map(([n, d], i) => {
    const p = all[n];
    return `${i ? `<i>${arrow}</i>` : ''}<div class="st"><img src="../photos/${p.photo}.jpg"><div>
      <div class="nm">${esc(n)}${tags(p)}</div><b class="pr">$${money(p.price)}</b><div class="ds">${esc(d || p.desc)}</div></div></div>`;
  }).join('')}</div>`;

  const header = poster ? `
  <div class="hero"><div class="badge"><img src="../brand/il-mercato-logo.png"></div>
    <div class="ttl"><div class="blob"></div><h1>Pizza Napoletana</h1></div>
    <div class="side"><div class="xs">× × × ×</div>${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div><div class="dots"></div></div>
  <div class="checks full"></div>` : `
  <header><img class="logo" src="../brand/il-mercato-logo.png"><h1>Pizza Napoletana</h1>
    <div class="intro">${esc(M.brand.intro)}<b>${esc(M.brand.introAsk)}</b></div></header>
  <div class="checks"></div>`;

  const css = `
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; font-variation-settings: 'opsz' 14; color: ${C.ink} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper}; padding: ${poster ? '0 12mm' : '8mm 12mm 0'} }
img { display: block } svg { display: block; width: 100%; height: 100% }
header { display: grid; grid-template-columns: 70mm minmax(0, 1fr) 88mm; align-items: center; height: 30mm; column-gap: 8mm }
header .logo { width: 62mm }
header h1 { font-family: 'Lilita One'; font-weight: 400; color: ${C.red}; font-size: 21mm; line-height: .9; text-align: center; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap }
header .intro { font-size: 2.75mm; line-height: 1.32; color: ${C.deep}; border-left: .5mm solid ${C.red}; padding-left: 4mm } header .intro b { display: block; margin-top: .8mm; color: ${C.red} }
.checks { height: 7mm; background: ${checks(7)}; margin: 1mm 0 3.5mm }
.checks.full { margin: 0 -12mm 4mm }
.hero { margin: 0 -12mm; height: 42mm; background: ${C.red}; position: relative; display: grid; grid-template-columns: 80mm 1fr 84mm; align-items: center; padding: 0 12mm; column-gap: 6mm }
.hero .badge { background: ${C.paper}; border-radius: 5mm; padding: 2.6mm 4.6mm; width: 66mm; box-shadow: 0 1mm 2.4mm rgba(0,0,0,.2) } .hero .badge img { width: 100% }
.hero .ttl { position: relative; display: grid; place-items: center; height: 100% }
.hero .blob { position: absolute; width: 86%; height: 64%; background: ${C.blue}; border-radius: 50% }
.hero h1 { position: relative; font-family: 'Lilita One'; font-weight: 400; color: ${C.paper}; font-size: 19mm; line-height: .9; text-transform: uppercase; transform: scaleX(.86); white-space: nowrap;
  text-shadow: .5mm .5mm 0 ${C.deep}, 1mm 1mm 0 ${C.deep}, 1.5mm 1.5mm 0 ${C.deep} }
.hero .side { color: ${C.paper}; font-size: 2.9mm; line-height: 1.34 } .hero .side b { display: block; margin-top: .8mm } .hero .xs { font-family: 'Lilita One'; font-size: 5mm; letter-spacing: 1.5mm; margin-bottom: 1.4mm; opacity: .9 }
.hero .dots { position: absolute; left: 2mm; top: 4mm; width: 8mm; height: 34mm; background: radial-gradient(circle, rgba(253,251,239,.6) .6mm, transparent .7mm) 0 0 / 4mm 4mm }
.body { display: grid; grid-template-columns: 1fr 96mm; column-gap: 6mm }
main { display: flex; flex-direction: column; height: ${poster ? 233 : 237}mm }
.heads, .lists { display: grid; grid-template-columns: 1fr 5mm 1fr 5mm 1fr }
.oval { justify-self: start; font-family: 'Lilita One'; font-weight: 400; background: ${C.red}; color: ${C.paper}; border-radius: 50%/60%; line-height: 1; white-space: nowrap;
  font-size: 6.6mm; padding: 1.5mm 6.5mm 1.9mm; margin-bottom: 7mm }
.oval small { font-family: 'Fraunces'; font-style: italic; font-size: .5em; opacity: .92; margin-left: 2mm }
.ladder { position: relative; background: ${C.band}; border-radius: 4mm; padding: 7mm 5mm 4.5mm; display: grid; grid-template-columns: 1fr 9mm 1fr 9mm 1fr; align-items: center; column-gap: 0 }
.ladder .tag { position: absolute; top: -4mm; left: 50%; transform: translateX(-50%); background: ${C.blue}; color: ${C.red}; font-family: 'Lilita One'; font-size: 5.2mm;
  padding: 1.1mm 7mm 1.5mm; border-radius: 50%; white-space: nowrap; line-height: 1 }
.ladder .st { display: flex; align-items: center; gap: 3.5mm; min-width: 0 }
.ladder .st img { width: 37mm; height: 37mm; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 .8mm 2mm rgba(80,30,10,.3) }
.ladder .st .nm { font-size: 5.4mm } .ladder .st .ds { font-size: 3.25mm }
.ladder i { width: 8mm; height: 8mm; border-radius: 50%; background: ${C.red}; padding: 1.3mm; justify-self: center }
.lists { flex: 1; margin-top: 6mm }
.col { display: flex; flex-direction: column; justify-content: space-around }
.vline { width: .35mm; background: ${C.rule}; justify-self: center; margin: 2mm 0 }
.it { display: flex; align-items: center; gap: 3.2mm; min-width: 0 }
.ph { border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 .7mm 1.6mm rgba(80,30,10,.28) }
.tx { min-width: 0 }
.nm { font-weight: 700; color: ${C.red}; font-size: 4.6mm; line-height: 1.1; font-variation-settings: 'opsz' 48, 'SOFT' 50 }
.pr { display: inline-block; margin-top: .9mm; font-family: 'Lilita One'; font-weight: 400; color: ${C.paper}; background: ${C.red}; border-radius: 3mm; font-size: 4.1mm; padding: .3mm 2.3mm .6mm; line-height: 1 }
.dt { font-weight: 700; color: ${C.red}; font-size: .7em; white-space: nowrap; border: .3mm solid ${C.red}; border-radius: 1mm; padding: 0 .7mm; vertical-align: .2em; margin-left: .4mm }
.ds { font-size: 3.2mm; line-height: 1.28; margin-top: .8mm }
.nt { font-size: 3mm; margin-top: .5mm; font-style: italic; color: ${C.deep} }
aside { background: ${C.red}; color: ${C.paper}; border-radius: 4mm; height: ${poster ? 233 : 237}mm; padding: 6mm 6mm 5mm; display: flex; flex-direction: column; align-items: center; text-align: center }
aside h3 { font-family: 'Lilita One'; font-weight: 400; font-size: 8mm; line-height: 1 }
aside .sub { font-size: 3.4mm; font-style: italic; opacity: .9; margin: 1.2mm 0 4.5mm }
.bases { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; width: 100% }
.bases > div { display: flex; flex-direction: column; align-items: center; gap: 1.6mm }
.bases .ic { width: 33mm; height: 33mm; border-radius: 50%; background: ${C.paper}; padding: 3mm }
.bases .gf .ic { box-shadow: 0 0 0 .8mm ${C.red}, 0 0 0 1.5mm ${C.paper} }
.bases b { font-family: 'Lilita One'; font-weight: 400; font-size: 5.2mm; line-height: 1 } .bases small { font-size: 3.1mm; opacity: .9 }
.gfnote { font-size: 3mm; line-height: 1.32; opacity: .88; margin-top: 4mm }
.div { height: 5mm; width: 100%; margin: 6mm 0 5mm; background: radial-gradient(circle, rgba(253,251,239,.55) .5mm, transparent .6mm) 0 50% / 4mm 4mm repeat-x }
.stamp { width: 44mm; height: 44mm; border-radius: 50%; background: ${C.paper}; color: ${C.red}; display: grid; place-items: center; transform: rotate(-8deg); margin: 1mm 0 5mm;
  box-shadow: 0 0 0 1.3mm ${C.red}, 0 0 0 1.8mm ${C.paper} }
.stamp span { font-family: 'Lilita One'; font-size: 5.6mm; line-height: 1.05; padding: 0 3mm }
aside h4 { font-family: 'Lilita One'; font-weight: 400; font-size: 6.4mm; line-height: 1; margin-bottom: 1.2mm }
aside p { font-size: 3.5mm; line-height: 1.35 }
aside .vg { margin: auto 0; display: flex; flex-direction: column; align-items: center }
aside .leg { font-size: 3.1mm; opacity: .9; line-height: 1.4 }
aside .leg b { border: .3mm solid ${C.paper}; border-radius: 1mm; padding: 0 .7mm }`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>il Mercato Centrale — Pizza Napoletana</title>
<link rel="stylesheet" href="../fonts/fonts.css"><style>${css}</style></head><body><div class="page">${header}
  <div class="body"><main>
      <div class="heads">${TIERS.map((t) => `<div class="oval">${t.name}<small>${t.note}</small></div>`).join('<div></div>')}</div>
      ${ladder}
      <div class="lists">${TIERS.map((t) => `<div class="col">${t.items.map((n) => item(all[n], t.items.length > 3 ? 25 : 29)).join('')}</div>`).join('<div class="vline"></div>')}</div>
    </main>
    <aside>
      <h3>Pick your base</h3><div class="sub">Every pizza, either base</div>
      <div class="bases"><div><div class="ic">${pizzaSvg(false)}</div><b>Samuele’s dough</b><small>Our classic base</small></div>
        <div class="gf"><div class="ic">${pizzaSvg(true)}</div><b>Gluten-free</b><small>Made in-house by Samuele</small></div></div>
      <div class="gfnote">${GF_TEXT}</div>
      <div class="div"></div>
      <div class="vg"><div class="stamp"><span>${esc(M.brand.tagline).replace(/\. /g, '.<br>')}</span></div>
      <h4>Vegan? Just ask</h4><p>${esc(M.notes.vegan.text)}</p></div>
      <div class="leg"><b>V</b> vegetarian · <b>Ve</b> vegan<br>Allergies? Please ask our team before ordering.</div>
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
    const file = path.join(OUT, `levelup-${k}.html`);
    fs.writeFileSync(file, VERSIONS[k]());
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `levelup-${k}.png`) });
    await page.pdf({ path: path.join(OUT, `levelup-${k}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
