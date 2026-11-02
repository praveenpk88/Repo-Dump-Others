// Instagram launch carousel for the pizzeria: 5 slides at 1080×1350 (4:5 portrait), il Mercato look.
// Usage: node build.js        (renders output/slide-1.png … slide-5.png)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'output');
const W = 1080, H = 1350;
const C = { red: '#C40001', deep: '#8E1410', paper: '#FDFBEF', cream: '#F8F1DF', ink: '#2B1712', blue: '#B9CBD6', band: '#F7E9D6' };
const MENU = '../../pizza-menu/photos/';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const checks = (sz, a = C.red, b = C.paper) => `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / ${sz}px ${sz}px`;
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
${css}</style></head><body><div class="s">${body}</div></body></html>`;

// 1 · Hook: "Ciao Melbourne!" with the hero pizza.
const slide1 = () => page('Ciao Melbourne', `
.s { background: radial-gradient(ellipse 90% 60% at 50% 30%, #D90C08, ${C.red} 55%, #9A0000) }
.oval { position: absolute; left: 50%; top: 250px; width: 900px; height: 270px; margin-left: -450px; border-radius: 50%; background: ${C.blue}; transform: rotate(-4deg) }
h1 { position: absolute; left: 0; right: 0; top: 200px; text-align: center; color: ${C.cream}; font-size: 190px; line-height: .86; transform: scaleX(.86) rotate(-4deg);
  text-shadow: ${Array.from({ length: 8 }, (_, i) => `${(i + 1) * 1.6}px ${(i + 1) * 1.6}px 0 ${C.ink}`).join(', ')} }
.sub { position: absolute; left: 90px; right: 90px; top: 600px; text-align: center; color: ${C.cream}; font-size: 40px; line-height: 1.28; font-weight: 600 }
.sub b { color: #FFD9A0; font-weight: 700 }
.pizza { position: absolute; left: 50%; bottom: -40px; width: 1160px; margin-left: -580px; filter: drop-shadow(0 26px 30px rgba(0,0,0,.45)) brightness(1.08) saturate(1.1) }`,
`<div class="logo-badge"><img src="../../pizza-menu/brand/il-mercato-logo.png"></div>
 <div class="oval"></div><h1 class="lilita">Ciao<br>Melbourne!</h1>
 <div class="sub">Neapolitan pizza, fresh from our oven at <b>il Mercato Centrale</b>. And now we're on Instagram.</div>
 <img class="pizza" src="../../halloween-poster/photos/pizza-tomatoes.png">
 <div class="swipe">Swipe &rarr;</div><div class="strip"></div>`);

// 2 · The menu idea: Classic → Level up → Go all in.
const slide2 = () => {
  const rows = [
    ['Classic', 'the classic flavours', 'Margherita', 'San Marzano tomato, fior di latte, basil & EVOO', 'margherita'],
    ['Level up', 'a little more', 'Bufalina', '+ buffalo mozzarella', 'bufalina'],
    ['Go all in', 'everything on it', 'Prosciutto', '+ prosciutto & buffalo mozzarella', 'prosciutto'],
  ];
  return page('Pick your level', `
.s { background: ${C.paper} }
.top { position: absolute; left: 0; right: 0; top: 0; height: 30px; background: ${checks(30)} }
h2 { position: absolute; left: 0; right: 0; top: 86px; text-align: center; color: ${C.red}; font-size: 120px; line-height: .9; transform: scaleX(.86) }
.lead { position: absolute; left: 100px; right: 100px; top: 210px; text-align: center; font-size: 34px; color: ${C.deep}; line-height: 1.3 }
.rows { position: absolute; left: 70px; right: 70px; top: 320px }
.r { display: grid; grid-template-columns: 250px 1fr; column-gap: 44px; align-items: center; height: 262px }
.r img { width: 250px; height: 250px; border-radius: 50%; object-fit: cover; box-shadow: 0 10px 22px rgba(80,30,10,.3) }
.tag { display: inline-block; background: ${C.red}; color: ${C.paper}; font-family: 'Lilita One'; font-size: 40px; padding: 6px 30px 10px; border-radius: 50%/60% }
.tag small { font-family: 'Fraunces'; font-style: italic; font-size: 22px; margin-left: 10px }
.nm { font-weight: 800; font-size: 54px; color: ${C.red}; margin-top: 12px; font-variation-settings: 'opsz' 72, 'SOFT' 50 }
.ds { font-size: 30px; color: ${C.ink}; margin-top: 4px }
.down { height: 38px; display: grid; place-items: center; margin-left: 105px; width: 40px }
.down svg { width: 40px; height: 40px }`,
  `<div class="top"></div><h2 class="lilita">Pick your level</h2>
   <div class="lead">Start with the classic, add a little more, or go all in.</div>
   <div class="rows">${rows.map(([t, n, name, d, ph], i) => `
     <div class="r"><img src="${MENU}${ph}.jpg"><div><span class="tag">${t}<small>${n}</small></span><div class="nm">${name}</div><div class="ds">${esc(d)}</div></div></div>
     ${i < 2 ? `<div class="down"><svg viewBox="0 0 24 24"><path d="M12 3v15M6 12l6 6 6-6" fill="none" stroke="${C.red}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}`).join('')}
   </div>
   <div class="swipe red">Swipe &rarr;</div><div class="strip"></div>`);
};

// 3 · The dough: close-up photo + Samuele's line.
const slide3 = () => page('The dough comes first', `
.s { background: ${C.red} }
.photo { position: absolute; left: 0; top: 0; width: ${W}px; height: 720px; object-fit: cover }
.fade { position: absolute; left: 0; right: 0; top: 560px; height: 170px; background: linear-gradient(transparent, ${C.red}) }
.edge { position: absolute; left: 0; right: 0; top: 712px; height: 30px; background: ${checks(30, C.paper, C.red)} }
h2 { position: absolute; left: 0; right: 0; top: 790px; text-align: center; color: ${C.cream}; font-size: 112px; line-height: .9; transform: scaleX(.86);
  text-shadow: ${Array.from({ length: 6 }, (_, i) => `${(i + 1) * 1.5}px ${(i + 1) * 1.5}px 0 ${C.ink}`).join(', ')} }
.txt { position: absolute; left: 100px; right: 100px; top: 1000px; text-align: center; color: ${C.cream}; font-size: 33px; line-height: 1.35 }
.txt b { display: block; margin-top: 18px; color: #FFD9A0; font-style: italic; font-weight: 700 }`,
`<img class="photo" src="../photos/crust-closeup.jpg"><div class="fade"></div><div class="edge"></div>
 <h2 class="lilita">The dough<br>comes first</h2>
 <div class="txt">Samuele blends traditional Napoletana and contemporanea pizza-making, always experimenting with flour, fermentation and hydration.
   <b>Curious? Ask him what flour he's using today.</b></div>
 <div class="swipe">Swipe &rarr;</div>`);

// 4 · Engagement: "What's your pick?" grid.
const slide4 = () => {
  const ps = [['Margherita', 'margherita'], ['Diavola', 'diavola'], ['Capricciosa', 'capricciosa'], ['Marinara', 'marinara'], ['Bufalina', 'bufalina'],
    ['Gamberi', 'gamberi'], ['Prosciutto', 'prosciutto'], ['La Porcona', 'porcona-rossa'], ['Salsiccia & Patate', 'salsiccia-patate']];
  return page("What's your pick", `
.s { background: ${C.paper} }
.top { position: absolute; left: 0; right: 0; top: 0; height: 30px; background: ${checks(30)} }
h2 { position: absolute; left: 0; right: 0; top: 80px; text-align: center; color: ${C.red}; font-size: 124px; line-height: .9; transform: scaleX(.86) }
.lead { position: absolute; left: 0; right: 0; top: 205px; text-align: center; font-size: 36px; color: ${C.deep}; font-weight: 600 }
.grid { position: absolute; left: 60px; right: 60px; top: 282px; display: grid; grid-template-columns: repeat(3, 1fr); row-gap: 16px }
.g { text-align: center } .g img { width: 238px; height: 238px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 18px rgba(80,30,10,.28) }
.g div { font-weight: 800; color: ${C.red}; font-size: 31px; margin-top: 10px; font-variation-settings: 'opsz' 48 }`,
  `<div class="top"></div><h2 class="lilita">What's your pick?</h2>
   <div class="lead">Tell us in the comments</div>
   <div class="grid">${ps.map(([n, p]) => `<div class="g"><img src="${MENU}${p}.jpg"><div>${esc(n)}</div></div>`).join('')}</div>
   <div class="swipe red">Swipe &rarr;</div><div class="strip"></div>`);
};

// 5 · Call to action / end card (also works as the last frame of a Reel).
const slide5 = () => page('Follow us', `
.s { background: radial-gradient(ellipse 90% 60% at 50% 40%, #D90C08, ${C.red} 55%, #9A0000) }
.oval { position: absolute; left: 50%; top: 300px; width: 880px; height: 300px; margin-left: -440px; border-radius: 50%; background: ${C.blue}; transform: rotate(-4deg) }
h2 { position: absolute; left: 0; right: 0; top: 250px; text-align: center; color: ${C.cream}; font-size: 176px; line-height: .86; transform: scaleX(.86) rotate(-4deg);
  text-shadow: ${Array.from({ length: 8 }, (_, i) => `${(i + 1) * 1.6}px ${(i + 1) * 1.6}px 0 ${C.ink}`).join(', ')} }
.list { position: absolute; left: 120px; right: 120px; top: 690px; color: ${C.cream}; font-size: 40px; line-height: 1.25; font-weight: 600 }
.list div { display: flex; gap: 22px; align-items: center; padding: 16px 0; border-bottom: 2px dashed rgba(248,241,223,.35) }
.list i { flex: none; width: 18px; height: 18px; border-radius: 50%; background: #FFD9A0 }
.where { position: absolute; left: 0; right: 0; top: 1010px; text-align: center }
.where span { display: inline-block; background: ${C.paper}; color: ${C.red}; font-family: 'Lilita One'; font-size: 46px; padding: 16px 44px 20px; border-radius: 50px;
  box-shadow: 0 8px 18px rgba(0,0,0,.25) }
.tagline { position: absolute; left: 0; right: 0; top: 1140px; text-align: center; color: ${C.cream}; font-size: 36px; font-style: italic }`,
`<div class="logo-badge"><img src="../../pizza-menu/brand/il-mercato-logo.png"></div>
 <div class="oval"></div><h2 class="lilita">Follow<br>for more</h2>
 <div class="list"><div><i></i>New pizzas &amp; specials first</div><div><i></i>Behind the scenes with Samuele</div><div><i></i>Dough talk, flour &amp; fire</div></div>
 <div class="where"><span>Find us at il Mercato Centrale</span></div>
 <div class="tagline">Tag a friend who owes you a pizza.</div>
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
    console.log('built slide', i + 1);
  }
  await browser.close();
})();
