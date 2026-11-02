// Instagram pasta carousel: 5 slides at 1080×1350, same look and structure as the pizza post (build.js).
// Usage: node pasta.js        (renders output-pasta/slide-1.png … slide-5.png)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'output-pasta');
const W = 1080, H = 1350;
const C = { red: '#C40001', deep: '#8E1410', paper: '#FDFBEF', cream: '#F8F1DF', ink: '#2B1712', blue: '#B9CBD6' };
const PH = '../photos-pasta/';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const checks = (sz, a = C.red, b = C.paper) => `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / ${sz}px ${sz}px`;
const extrude = (n, step) => Array.from({ length: n }, (_, i) => `${(i + 1) * step}px ${(i + 1) * step}px 0 ${C.ink}`).join(', ');
const page = (title, css, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../../halloween-poster/fonts/fonts.css"><style>
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: ${W}px; height: ${H}px }
body { font-family: 'Fraunces', serif; -webkit-font-smoothing: antialiased }
.s { width: ${W}px; height: ${H}px; position: relative; overflow: hidden }
.lilita { font-family: 'Lilita One'; font-weight: 400 }
.logo-badge { position: absolute; left: 56px; top: 56px; background: ${C.paper}; border-radius: 28px; padding: 16px 26px; box-shadow: 0 6px 18px rgba(0,0,0,.18) }
.logo-badge img { width: 230px; display: block }
.swipe { position: absolute; right: 56px; bottom: 72px; background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 34px;
  padding: 12px 30px 15px; border-radius: 40px; box-shadow: 0 6px 16px rgba(0,0,0,.2) }
.swipe.red { background: ${C.red}; color: ${C.paper} }
.strip { position: absolute; left: 0; right: 0; bottom: 0; height: 34px; background: ${checks(34)} }
.top { position: absolute; left: 0; right: 0; top: 0; height: 30px; background: ${checks(30)} }
.plate { border-radius: 50%; object-fit: cover; box-shadow: 0 12px 26px rgba(80,30,10,.32) }
${css}</style></head><body><div class="s">${body}</div></body></html>`;

// 1 · Hook: "Pasta Fresca" with the big creamy rigatoni.
const slide1 = () => page('Pasta Fresca', `
.s { background: radial-gradient(ellipse 90% 60% at 50% 30%, #D90C08, ${C.red} 55%, #9A0000) }
.oval { position: absolute; left: 50%; top: 250px; width: 900px; height: 270px; margin-left: -450px; border-radius: 50%; background: ${C.blue}; transform: rotate(-4deg) }
h1 { position: absolute; left: 0; right: 0; top: 200px; text-align: center; color: ${C.cream}; font-size: 196px; line-height: .86; transform: scaleX(.86) rotate(-4deg); text-shadow: ${extrude(8, 1.6)} }
.sub { position: absolute; left: 100px; right: 100px; top: 600px; text-align: center; color: ${C.cream}; font-size: 40px; line-height: 1.28; font-weight: 600 }
.sub b { color: #FFD9A0 }
.hero { position: absolute; left: 50%; top: 760px; width: 700px; height: 700px; margin-left: -350px; box-shadow: 0 24px 40px rgba(0,0,0,.4) }
.side { position: absolute; width: 300px; height: 300px; top: 900px }
.side.l { left: -90px } .side.r { right: -90px }`,
`<div class="logo-badge"><img src="../../pizza-menu/brand/il-mercato-logo.png"></div>
 <div class="oval"></div><h1 class="lilita">Pasta<br>Fresca</h1>
 <div class="sub">Fresh pasta &amp; <b>house-made gnocchi</b>, right next to the pizza oven at il Mercato Centrale.</div>
 <img class="plate side l" src="${PH}gnocchi-pesto.jpg"><img class="plate side r" src="${PH}spaghetti-pomodoro.jpg">
 <img class="plate hero" src="${PH}rigatoni-cream.jpg">
 <div class="swipe">Swipe &rarr;</div><div class="strip"></div>`);

// 2 · Your pasta, your way: pick pasta → pick sauce → make it yours.
const slide2 = () => {
  const steps = [
    ['1', 'Pick your pasta', 'Rigatoni · Spaghetti · Pappardelle · Gnocchi', 'rigatoni-vodka'],
    ['2', 'Pick your sauce', 'Carbonara · Amatriciana · Pomodoro · Bolognese · Vodka · Pesto', 'pappardelle-bolognese'],
    ['3', 'Make it yours', "Add ’nduja, mushrooms, prawns or chicken", 'amatriciana'],
  ];
  return page('Your pasta, your way', `
.s { background: ${C.paper} }
h2 { position: absolute; left: 0; right: 0; top: 80px; text-align: center; color: ${C.red}; font-size: 116px; line-height: .9; transform: scaleX(.86) }
.lead { position: absolute; left: 100px; right: 100px; top: 200px; text-align: center; font-size: 34px; color: ${C.deep}; line-height: 1.3 }
.rows { position: absolute; left: 70px; right: 70px; top: 300px }
.r { display: grid; grid-template-columns: 250px 1fr; column-gap: 44px; align-items: center; height: 262px }
.r img { width: 250px; height: 250px }
.num { display: inline-grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: ${C.red}; color: ${C.paper}; font-family: 'Lilita One'; font-size: 40px; vertical-align: middle }
.st { display: inline-block; font-family: 'Lilita One'; font-size: 54px; color: ${C.red}; margin-left: 16px; vertical-align: middle }
.ds { font-size: 31px; color: ${C.ink}; margin-top: 12px; line-height: 1.3 }
.down { height: 38px; display: grid; place-items: center; margin-left: 105px; width: 40px } .down svg { width: 40px; height: 40px }`,
  `<div class="top"></div><h2 class="lilita">Your pasta, your way</h2>
   <div class="lead">Swap to gnocchi or any pasta on the menu, with any of our sauces.</div>
   <div class="rows">${steps.map(([n, t, d, ph], i) => `
     <div class="r"><img class="plate" src="${PH}${ph}.jpg"><div><span class="num">${n}</span><span class="st">${t}</span><div class="ds">${esc(d)}</div></div></div>
     ${i < 2 ? `<div class="down"><svg viewBox="0 0 24 24"><path d="M12 3v15M6 12l6 6 6-6" fill="none" stroke="${C.red}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}`).join('')}
   </div>
   <div class="swipe red">Swipe &rarr;</div><div class="strip"></div>`);
};

// 3 · House-made gnocchi, with the Sorrentina in its focaccia bowl.
const slide3 = () => page('House-made gnocchi', `
.s { background: ${C.red} }
.glow { position: absolute; left: 50%; top: 110px; width: 760px; height: 760px; margin-left: -380px; border-radius: 50%; background: radial-gradient(circle, rgba(255,214,150,.35), transparent 70%) }
.hero { position: absolute; left: 50%; top: 150px; width: 620px; height: 620px; margin-left: -310px; box-shadow: 0 24px 40px rgba(0,0,0,.4) }
.mini { position: absolute; width: 230px; height: 230px }
.edge { position: absolute; left: 0; right: 0; top: 820px; height: 30px; background: ${checks(30, C.paper, C.red)} }
h2 { position: absolute; left: 0; right: 0; top: 880px; text-align: center; color: ${C.cream}; font-size: 112px; line-height: .9; transform: scaleX(.86); text-shadow: ${extrude(6, 1.5)} }
.txt { position: absolute; left: 110px; right: 110px; top: 1090px; text-align: center; color: ${C.cream}; font-size: 33px; line-height: 1.35 }
.txt b { color: #FFD9A0 }`,
`<div class="glow"></div>
 <img class="plate mini" style="left:40px;top:120px" src="${PH}gnocchi-classico.jpg">
 <img class="plate mini" style="right:40px;top:560px" src="${PH}gnocchi-carbonara.jpg">
 <img class="plate hero" src="${PH}gnocchi-sorrentina.jpg">
 <div class="edge"></div>
 <h2 class="lilita">House-made<br>gnocchi</h2>
 <div class="txt">Soft potato gnocchi, made in-house. Have them with any of our sauces, or baked <b>Sorrentina-style in a focaccia bowl</b>.</div>
 <div class="swipe">Swipe &rarr;</div>`);

// 4 · Engagement grid.
const slide4 = () => {
  const ps = [['Carbonara', 'carbonara'], ['Spaghetti Pomodoro', 'spaghetti-pomodoro'], ['Amatriciana', 'amatriciana'],
    ['Pappardelle Bolognese', 'pappardelle-bolognese'], ['Classic Lasagna', 'lasagna'], ['Rigatoni alla Vodka', 'rigatoni-vodka'],
    ['Gnocchi al Pesto', 'gnocchi-pesto'], ['Gnocchi Sorrentina', 'gnocchi-sorrentina'], ['Pasta della Nonna Anna', 'nonna-anna']];
  return page("What's your pick", `
.s { background: ${C.paper} }
h2 { position: absolute; left: 0; right: 0; top: 80px; text-align: center; color: ${C.red}; font-size: 124px; line-height: .9; transform: scaleX(.86) }
.lead { position: absolute; left: 0; right: 0; top: 205px; text-align: center; font-size: 36px; color: ${C.deep}; font-weight: 600 }
.grid { position: absolute; left: 50px; right: 50px; top: 282px; display: grid; grid-template-columns: repeat(3, 1fr); row-gap: 14px }
.g { text-align: center } .g img { width: 238px; height: 238px }
.g div { font-weight: 800; color: ${C.red}; font-size: 27px; margin-top: 8px; line-height: 1.1; font-variation-settings: 'opsz' 48 }`,
  `<div class="top"></div><h2 class="lilita">What's your pick?</h2>
   <div class="lead">Tell us in the comments</div>
   <div class="grid">${ps.map(([n, p]) => `<div class="g"><img class="plate" src="${PH}${p}.jpg"><div>${esc(n)}</div></div>`).join('')}</div>
   <div class="swipe red">Swipe &rarr;</div><div class="strip"></div>`);
};

// 5 · Call to action / end card.
const slide5 = () => page('Follow us', `
.s { background: radial-gradient(ellipse 90% 60% at 50% 40%, #D90C08, ${C.red} 55%, #9A0000) }
.oval { position: absolute; left: 50%; top: 300px; width: 880px; height: 300px; margin-left: -440px; border-radius: 50%; background: ${C.blue}; transform: rotate(-4deg) }
h2 { position: absolute; left: 0; right: 0; top: 250px; text-align: center; color: ${C.cream}; font-size: 176px; line-height: .86; transform: scaleX(.86) rotate(-4deg); text-shadow: ${extrude(8, 1.6)} }
.list { position: absolute; left: 120px; right: 120px; top: 690px; color: ${C.cream}; font-size: 40px; line-height: 1.25; font-weight: 600 }
.list div { display: flex; gap: 22px; align-items: center; padding: 16px 0; border-bottom: 2px dashed rgba(248,241,223,.35) }
.list i { flex: none; width: 18px; height: 18px; border-radius: 50%; background: #FFD9A0 }
.where { position: absolute; left: 0; right: 0; top: 1010px; text-align: center }
.where span { display: inline-block; background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 46px; padding: 16px 44px 20px; border-radius: 50px; box-shadow: 0 8px 18px rgba(0,0,0,.25) }
.tagline { position: absolute; left: 0; right: 0; top: 1140px; text-align: center; color: ${C.cream}; font-size: 36px; font-style: italic }`,
`<div class="logo-badge"><img src="../../pizza-menu/brand/il-mercato-logo.png"></div>
 <div class="oval"></div><h2 class="lilita">Follow<br>for more</h2>
 <div class="list"><div><i></i>New dishes &amp; specials first</div><div><i></i>Behind the scenes in the kitchen</div><div><i></i>Pasta, pizza &amp; everything in between</div></div>
 <div class="where"><span>Find us at il Mercato Centrale</span></div>
 <div class="tagline">Tag the friend who always steals your gnocchi.</div>
 <div class="strip"></div>`);

const SLIDES = [slide1, slide2, slide3, slide4, slide5];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const [i, make] of SLIDES.entries()) {
    const file = path.join(OUT, `slide-${i + 1}.html`);
    fs.writeFileSync(file, make());
    await tab.goto('file://' + file);
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: path.join(OUT, `slide-${i + 1}.png`) });
    fs.unlinkSync(file);
    console.log('built pasta slide', i + 1);
  }
  await browser.close();
})();
