// Pasta Fresca and Gnocchi menus: rebuilt from the Canva pages (same portrait layout), rendered to A4 PDF + PNG.
// Edit prices and text in MENUS below, then run: node build.js   (or: node build.js pasta / gnocchi)
// Photos are cut from the Canva pages by cut_photos.py and placed back where they were.
// Fonts and logo come from ../pizza-menu.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'output');
const PAGE = { w: 210, h: 297 }; // mm, A4 portrait (same shape as the Canva pages)
const K = PAGE.w / 1414; // positions below are in Canva page pixels (1414 x 2000); K turns them into mm
const mm = (px) => `${(px * K).toFixed(2)}mm`;
const C = { paper: '#FDFBEF', red: '#C40001', text: '#B8141B' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const money = (p) => (Number.isInteger(p) ? String(p) : p.toFixed(2)); // 25.5 → "25.50"

// photo: [x, y] of the cut in Canva pixels (same boxes as cut_photos.py). at: [x, y] where the name starts.
const MENUS = {
  pasta: {
    title: 'Pasta Fresca', titleAt: [982, 178], titleSize: 17.5,
    checksTop: 290,
    footer: 'Change your pasta to gnocchi or any other pasta in the menu',
    items: [
      { name: 'Carbonara', price: 25.5, photo: ['carbonara', 45, 370], at: [318, 388],
        desc: 'Rigatoni al dente tossed in a rich egg yolk, parmesan and pecorino sauce finished with a dash of cream.' },
      { name: 'Spaghetti Pomodoro', price: 19.5, photo: ['spaghetti-pomodoro', 260, 530], at: [523, 563], v: true,
        desc: 'Spaghetti tossed in a rich tomato sauce, topped up with stracciatella and a fresh basil leaf.' },
      { name: 'Amatriciana', price: 24.5, photo: ['amatriciana', 40, 708], at: [333, 742],
        desc: 'Rigatoni tossed in a rich tomato and pork sauce, finished off with guanciale and pecorino.' },
      { name: 'Pappardelle Bolognese', price: 26.5, photo: ['pappardelle-bolognese', 245, 893], at: [522, 920],
        desc: 'Ribbon like fresh egg pasta tossed in a rich, slow-simmered beef ragu.' },
      { name: 'The Classic Lasagna', price: 26.5, photo: ['lasagna', 42, 1075], at: [316, 1117],
        desc: 'Layered wide pasta with slow-simmered beef ragu, creamy bechamel, melted mozzarella and a top layer of grilled cheese.' },
      { name: 'Rigatoni Alla Vodka', price: 17.5, photo: ['rigatoni-vodka', 252, 1275], at: [518, 1292], v: true,
        desc: 'Al dente rigatoni tossed in a slightly spicy tomato and cream sauce with a splash of vodka.', note: '$10 Monday Special' },
      { name: 'Pasta della Nonna Anna', price: 25.5, photo: ['nonna-anna', 55, 1478], at: [340, 1517],
        desc: 'Baked rigatoni with minced beef, rich tomato sauce, cheese and vegetables.' },
      { name: 'Capsicum Pasta', price: 20.5, photo: ['capsicum', 287, 1672], at: [555, 1712], v: true,
        desc: 'Creamy capsicum base topped up with ricotta salata and parsley.' },
    ],
  },
  gnocchi: {
    title: 'Gnocchi', titleAt: [955, 165], titleSize: 16.5,
    checksTop: 268,
    subtitle: 'Order your gnocchi with any of our pasta sauces!', subtitleTop: 350,
    decor: [['strokes-top', 1262, 1730], ['strokes-bottom', 1110, 1880]],
    items: [
      { name: 'Gnocchi Carbonara', price: 26.5, photo: ['gnocchi-carbonara', 42, 432], at: [408, 475],
        desc: 'House-made gnocchi, tossed in a rich egg yolk, parmesan and pecorino sauce finished with a dash of cream.' },
      { name: 'Gnocchi Classico', price: 20.5, photo: ['gnocchi-classico', 230, 672], at: [576, 725], v: true,
        desc: 'House-made gnocchi tossed in a rich tomato sauce, topped up with stracciatella and a fresh basil leaf.' },
      { name: 'Gnocchi Amatriciana', price: 25.5, photo: ['gnocchi-amatriciana', 42, 940], at: [402, 997],
        desc: 'Gnocchi tossed in a rich tomato and pork sauce, finished off with guanciale and pecorino.' },
      { name: 'Gnocchi Bolognese', price: 27.5, photo: ['gnocchi-bolognese', 244, 1178], at: [600, 1225],
        desc: 'House-made gnocchi tossed in a rich, slow-simmered beef ragu.' },
      { name: 'Gnocchi al Pesto', price: 22.5, photo: ['gnocchi-pesto', 48, 1420], at: [410, 1487], v: true,
        desc: 'Homemade potato gnocchi with basil pesto, semi-dried cherry tomatoes and stracciatella.' },
      { name: 'Gnocchi Sorrentina', price: 23.5, photo: ['gnocchi-sorrentina', 228, 1690], at: [668, 1725], v: true,
        extra: '+ $2.50 Focaccia Bowl', desc: 'Homemade potato gnocchi baked with Napoli sauce and mozzarella cheese.' },
    ],
  },
};

const RIGHT = 1335; // text wraps before this x (Canva pixels)

function render(key) {
  const M = MENUS[key];
  const img = ([name, x, y], cls = 'ph') => `<img class="${cls}" src="../photos/${name}.png" style="left:${mm(x)}; top:${mm(y)}" data-px="${name}">`;
  const item = (it) => `
    ${img(it.photo)}
    <div class="it" style="left:${mm(it.at[0])}; top:${mm(it.at[1] - 10)}; width:${mm(RIGHT - it.at[0])}">
      <div class="nm">${esc(it.name)} $${money(it.price)}</div>
      ${it.extra ? `<div class="ex">${esc(it.extra)}</div>` : ''}
      <div class="ds">${esc(it.desc)}${it.v ? ' <b>V</b>' : ''}</div>
      ${it.note ? `<div class="nt">${esc(it.note)}</div>` : ''}
    </div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>il Mercato Centrale — ${esc(M.title)}</title>
<link rel="stylesheet" href="../../pizza-menu/fonts/fonts.css">
<style>
@page { size: ${PAGE.w}mm ${PAGE.h}mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${PAGE.w}mm; height: ${PAGE.h}mm; background: ${C.paper} }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Fraunces', serif; color: ${C.text} }
.page { width: ${PAGE.w}mm; height: ${PAGE.h}mm; position: relative; overflow: hidden; background: ${C.paper} }
img { display: block; position: absolute }
.logo { left: 13mm; top: 6.5mm; width: 65mm }
h1 { position: absolute; left: ${mm(M.titleAt[0])}; top: ${mm(M.titleAt[1])}; transform: translate(-50%, -50%) scaleX(.86);
  font-family: 'Lilita One'; font-weight: 400; font-size: ${M.titleSize}mm; line-height: 1; color: ${C.red}; text-transform: uppercase; white-space: nowrap }
.checks { position: absolute; left: ${mm(52)}; width: ${mm(1286)}; top: ${mm(M.checksTop)}; height: ${mm(62)};
  background: repeating-conic-gradient(${C.red} 0 25%, ${C.paper} 0 50%) 0 0 / ${mm(62)} ${mm(62)} }
.sub { position: absolute; left: 0; right: 0; top: ${mm(M.subtitleTop || 0)}; text-align: center; font-size: 4.6mm; font-weight: 650; color: ${C.red} }
.it { position: absolute; z-index: 2 }
.nm { font-size: 6.6mm; font-weight: 600; color: ${C.red}; line-height: 1.15; white-space: nowrap; font-variation-settings: 'opsz' 72, 'SOFT' 100, 'WONK' 0 }
.ds { font-size: 4.35mm; font-weight: 560; line-height: 1.32; margin-top: .6mm; padding-left: 2.6mm; font-variation-settings: 'opsz' 24, 'SOFT' 100 }
.ds b { font-weight: 700 }
.ex { font-size: 3.4mm; font-weight: 600; padding-left: 2mm; margin-top: .2mm }
.nt { font-size: 3.6mm; font-weight: 600; margin-top: 1.4mm; padding-left: 1.2mm }
.foot { position: absolute; right: 7.5mm; bottom: 5.8mm; font-size: 3.6mm; font-weight: 650; color: ${C.red} }
</style></head><body><div class="page">
  <img class="logo" src="../../pizza-menu/brand/il-mercato-logo.png">
  <h1>${esc(M.title)}</h1>
  <div class="checks"></div>
  ${M.subtitle ? `<div class="sub">${esc(M.subtitle)}</div>` : ''}
  ${(M.decor || []).map((d) => img(d, 'decor')).join('')}
  ${M.items.map(item).join('')}
  ${M.footer ? `<div class="foot">${esc(M.footer)}</div>` : ''}
</div>
<script>
  // Size each cut at its natural pixel size, scaled to mm, so it lands exactly where it was on the Canva page.
  for (const el of document.querySelectorAll('img[data-px]'))
    el.onload = () => { el.style.width = (el.naturalWidth * ${K}) + 'mm'; };
</script></body></html>`;
}

(async () => {
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MENUS);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const pxW = Math.round((PAGE.w / 25.4) * 96), pxH = Math.round((PAGE.h / 25.4) * 96);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH }, deviceScaleFactor: 2 });
  for (const k of want) {
    const file = path.join(OUT, `${k}-menu.html`);
    fs.writeFileSync(file, render(k));
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(async (k) => {
      await document.fonts.ready;
      for (const el of document.querySelectorAll('img[data-px]')) el.style.width = (el.naturalWidth * k) + 'mm';
    }, K);
    await page.screenshot({ path: path.join(OUT, `${k}-menu.png`) });
    await page.pdf({ path: path.join(OUT, `${k}-menu.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    console.log('built', k);
  }
  await browser.close();
})();
