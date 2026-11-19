// Print finals of the two chosen menus, A3 landscape:
//   Pasta & Gnocchi: pasta-menu/output/sidebar-a.html (Sidebar, adjusted), using the 2x print photos in pasta-menu/photos-hd
//   Pizza:           pizza-menu/output/variant-mercato-final.html (Classic → Level up → Go all in)
// Writes final/<name>.pdf (vector text and shapes) and final/<name>.png (4961 × 3508 px = 300 dpi at A3, tagged 300 dpi).
// Rebuild the source menus first if you change prices:  (cd pasta-menu && node sidebar.js a)  and  (cd pizza-menu && node build.js mercato-final)
// Usage: node render-final.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

const PAGE = { w: 420, h: 297 }; // mm
const DPI = 300;
const OUT = path.join(__dirname, 'final');
const JOBS = [
  { name: 'pasta-gnocchi-A3', src: 'pasta-menu/output/sidebar-a.html', swap: ['../photos/', '../photos-hd/'] },
  { name: 'pizza-A3', src: 'pizza-menu/output/variant-mercato-final.html' },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const cssW = Math.round((PAGE.w / 25.4) * 96), cssH = Math.round((PAGE.h / 25.4) * 96);
  const scale = (PAGE.w / 25.4) * DPI / cssW; // ≈ 3.125 → 4961 px wide
  const page = await browser.newPage({ viewport: { width: cssW, height: cssH }, deviceScaleFactor: scale });
  for (const j of JOBS) {
    let file = path.join(__dirname, j.src);
    if (j.swap) { // a sibling copy, so relative paths still resolve
      const html = fs.readFileSync(file, 'utf8').split(j.swap[0]).join(j.swap[1]);
      file = file.replace(/\.html$/, '-print.html');
      fs.writeFileSync(file, html);
    }
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = path.join(OUT, `${j.name}.png`);
    await page.screenshot({ path: png });
    await page.pdf({ path: path.join(OUT, `${j.name}.pdf`), width: `${PAGE.w}mm`, height: `${PAGE.h}mm`, printBackground: true });
    // Tag the PNG as 300 dpi so print software sizes it as A3 without asking.
    execFileSync('python', ['-I', '-c', 'import sys; from PIL import Image; im = Image.open(sys.argv[1]); im.load(); im.save(sys.argv[1], dpi=(300, 300)); print(im.size)', png], { stdio: 'inherit' });
    console.log('built', j.name);
  }
  await browser.close();
})();
