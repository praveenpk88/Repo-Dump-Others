// Halloween pizza poster: two versions rendered to A3 portrait PDF + PNG.
//   A — follows the shop's existing red promo posters (Marinara / Mortadella Special).
//   B — a darker, more designed take that keeps the brand red, cream and checks.
// Usage: node build.js   (or: node build.js a)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// ---- edit the poster text here ----
const T = {
  name: 'Pizza Nera',                 // version B headline (suggested name)
  kicker: 'Halloween Special',
  ingredients: 'Charcoal dough, pumpkin cream, fior di latte, gorgonzola & crispy prosciutto',
  price: 'XX',                        // set to e.g. '28'
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
// A — same system as the existing promo posters
// ============================================================================
function posterA() {
  const C = { red: '#C40001', cream: '#F8F1DF', oval: '#F2902E', pale: '#F0EEE6', check: '#9FB3C0' };
  const css = `
body { background: ${C.red}; font-family: 'Lilita One' }
.page { background: ${C.red} }
.dots-tl { position: absolute; left: 9mm; top: 9mm }
.dots-r { position: absolute; right: 7mm; top: 64mm }
.xs { position: absolute; right: 18mm; top: 12mm; color: ${C.cream}; font-family: 'Poppins'; font-weight: 600; font-size: 8mm; letter-spacing: 4.5mm }
.oval { position: absolute; left: 50%; top: 46mm; width: 190mm; height: 66mm; margin-left: -95mm; border-radius: 50%; background: ${C.oval} }
h1 { position: absolute; left: 0; right: 0; top: 22mm; text-align: center; color: ${C.cream}; font-weight: 400; font-size: 44mm; line-height: .86;
  transform: scaleX(.84); letter-spacing: -.005em; text-shadow: 0 .8mm 0 rgba(0,0,0,.12) }
.date { position: absolute; left: 0; right: 0; top: 118mm; text-align: center; color: ${C.cream}; font-size: 8.5mm; letter-spacing: .06em; transform: scaleX(.9) }
.bats { position: absolute; top: 112mm; right: 22mm; width: 30mm; display: grid; gap: 2mm }
.bats svg { width: 16mm } .bats svg:nth-child(2) { width: 11mm; margin-left: 14mm }
.bats.l { left: 20mm; right: auto; top: 102mm } .bats.l svg:nth-child(2) { margin-left: 0; width: 9mm }
.arc { position: absolute; left: 0; top: 116mm; width: ${W}mm; height: 80mm }
.pale { position: absolute; left: 50%; top: 248mm; width: 420mm; height: 420mm; margin-left: -210mm; border-radius: 50%; background: ${C.pale} }
.pizza { position: absolute; left: 50%; top: 160mm; width: 285mm; margin-left: -142.5mm; filter: drop-shadow(0 6mm 6mm rgba(0,0,0,.35)) brightness(1.06) saturate(1.08) }
.price { position: absolute; left: 14mm; top: 322mm; width: 52mm; height: 52mm; border-radius: 50%; background: ${C.red}; color: ${C.cream};
  display: grid; place-items: center; font-size: 21mm; box-shadow: 0 0 0 1.6mm ${C.pale} }
.price span { transform: scaleX(.88) }
.checks { position: absolute; right: 16mm; bottom: 20mm; width: 54mm; height: 8mm;
  background: repeating-conic-gradient(${C.check} 0 25%, transparent 0 50%) 0 0 / 4mm 4mm }
.pill { position: absolute; left: 50%; bottom: -10mm; width: 90mm; height: 26mm; margin-left: -45mm; border-radius: 13mm; background: #e2ded4 }`;

  return head('Halloween Special — A', css) + `
<div class="page">
  <div class="dots-tl">${dots(5, 5, 5.4, .75, C.cream)}</div>
  <div class="dots-r">${dots(2, 10, 5.4, .75, C.cream)}</div>
  <div class="xs">× × × ×</div>
  <div class="oval"></div>
  <h1>Halloween<br>Special</h1>
  <div class="date">${esc(T.date)}</div>
  <div class="bats l">${bat(C.cream)}${bat(C.cream)}</div>
  <div class="bats">${bat(C.cream)}${bat(C.cream)}</div>
  <svg class="arc" viewBox="0 0 297 80"><defs><path id="arc" d="M6,78 Q148.5,4 291,78"/></defs>
    <text font-family="Lilita One" font-size="7.9" fill="${C.cream}" text-anchor="middle" letter-spacing=".1">
    <textPath href="#arc" startOffset="50%">${esc(T.ingredients)}</textPath></text></svg>
  <div class="pale"></div>
  <img class="pizza" src="../photos/pizza.png">
  <div class="price"><span>$${price(T.price)}</span></div>
  <div class="checks"></div>
  <div class="pill"></div>
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

const POSTERS = { a: posterA, b: posterB };

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
