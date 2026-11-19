// Illustrated pasta shapes for the "Pick your shape" bar: golden pasta with a deep-red outline, drawn as SVG
// so they print sharp at any size. Each function returns an <svg> (viewBox 0 0 100 100).
const GOLD = '#F0C25E', GOLD_DARK = '#C98B2B', LINE = '#8E1410', RED = '#C40001', CREAM = '#FDFBEF';

// A strand drawn twice (thick outline, then gold on top) so it reads as a solid piece of pasta.
const strand = (d, w = 7) =>
  `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${GOLD}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const svg = (body) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

// One ridged tube seen at an angle; open end on the right.
const tube = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})">
  <path d="M-26 -11 H22 A6 11 0 0 1 22 11 H-26 A6 11 0 0 1 -26 -11 Z" fill="${GOLD}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
  ${[-6.5, -2.2, 2.2, 6.5].map((v) => `<path d="M-27 ${v} H20" stroke="${GOLD_DARK}" stroke-width="1.5" stroke-linecap="round"/>`).join('')}
  <ellipse cx="22" cy="0" rx="6" ry="11" fill="${GOLD}" stroke="${LINE}" stroke-width="2.6"/>
  <ellipse cx="22.4" cy="0" rx="3" ry="6.4" fill="${GOLD_DARK}" stroke="${LINE}" stroke-width="1.6"/></g>`;

// A gnocchi pillow with ridges and a thumb dimple.
const gnoc = (x, y, rot, s = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M-15 -2 C-15 -11 -6 -13 0 -12 C8 -12 15 -9 15 -1 C15 8 7 11 0 11 C-8 11 -15 7 -15 -2 Z" fill="${GOLD}" stroke="${LINE}" stroke-width="2.6"/>
  ${[-9, -4.5, 0, 4.5, 9].map((v) => `<path d="M${v} -9.5 C${v + 2} -3 ${v + 2} 3 ${v} 9" fill="none" stroke="${GOLD_DARK}" stroke-width="1.5" stroke-linecap="round"/>`).join('')}
  <ellipse cx="-6.5" cy="-1" rx="3.2" ry="2.4" fill="${GOLD_DARK}" opacity=".55"/></g>`;

const SHAPE_SVG = {
  Rigatoni: () => svg(tube(46, 62, -18) + tube(54, 38, 14)),

  Spaghetti: () => svg(
    // a loose twirled nest of thin strands
    strand('M20 56 C18 30 80 26 82 50 C84 74 26 80 24 58 C22 42 70 38 72 54 C74 66 38 70 38 56 C38 48 58 46 60 54', 3.4) +
    strand('M16 48 C24 22 74 16 86 40 C92 54 84 70 70 76', 3.4) +
    strand('M26 70 C40 86 70 86 84 66', 3.4) +
    strand('M30 40 C40 30 64 30 74 42', 3.4)),

  Fusilli: () => {
    // a corkscrew: alternating front (gold) and back (darker) twists stacked along a tilted axis
    let g = '';
    for (let k = 0; k < 7; k++) {
      const y = 20 + k * 10;
      g += `<ellipse cx="50" cy="${y + 5}" rx="14" ry="5.2" transform="rotate(24 50 ${y + 5})" fill="${GOLD_DARK}" stroke="${LINE}" stroke-width="2.2"/>`;
      g += `<ellipse cx="50" cy="${y}" rx="14" ry="5.2" transform="rotate(-24 50 ${y})" fill="${GOLD}" stroke="${LINE}" stroke-width="2.2"/>`;
    }
    return svg(`<g transform="rotate(-30 50 52)">${g}</g>`);
  },

  Pappardelle: () => svg(
    // wide ribbons, loosely folded
    strand('M14 40 C30 22 46 56 62 38 C72 27 80 32 88 36', 13) +
    strand('M12 64 C30 48 48 82 66 62 C74 54 82 56 88 60', 13)),

  Gnocchi: () => svg(gnoc(32, 40, -12) + gnoc(68, 42, 14) + gnoc(50, 68, -4)),

  'Gluten-free gnocchi': () => svg(gnoc(34, 52, -12) + gnoc(62, 66, 10) +
    `<circle cx="72" cy="27" r="17" fill="${RED}"/><circle cx="72" cy="27" r="14" fill="none" stroke="${CREAM}" stroke-width="1" stroke-dasharray="2 2"/>` +
    `<text x="72" y="33.5" text-anchor="middle" font-family="Lilita One" font-size="17" fill="${CREAM}">GF</text>`),
};

// ---------------------------------------------------------------------------------------------
// Pappardelle options (the first drawing read as "two wavy lines").
// ---------------------------------------------------------------------------------------------
// A wide ribbon with crimped (fluted) edges, following a wave. cx/cy centre, len, h height, rot degrees.
function ribbon({ x0, x1, cy, h, amp, waves, phase = 0, scallop = 1.6, rot = 0, fill = GOLD }) {
  const N = 64, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = x0 + (x1 - x0) * t;
    const y = cy + amp * Math.sin(t * Math.PI * 2 * waves + phase);
    const s = scallop * Math.abs(Math.sin(t * Math.PI * 14));
    top.push(`${x.toFixed(1)} ${(y - h / 2 - s).toFixed(1)}`);
    bot.push(`${x.toFixed(1)} ${(y + h / 2 + s).toFixed(1)}`);
  }
  const mid = Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N, x = x0 + (x1 - x0) * t;
    return `${x.toFixed(1)} ${(cy + amp * Math.sin(t * Math.PI * 2 * waves + phase)).toFixed(1)}`;
  });
  return `<g transform="rotate(${rot} 50 50)"><path d="M${top.join(' L')} L${bot.reverse().join(' L')} Z" fill="${fill}" stroke="${LINE}" stroke-width="2.3" stroke-linejoin="round"/>
    <path d="M${mid.join(' L')}" fill="none" stroke="${GOLD_DARK}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".7"/></g>`;
}

const PAPPARDELLE = {
  // A: a coiled nest of wide ribbon, the way fresh pappardelle is portioned
  nest: () => {
    const R = [5, 10, 15, 20, 25, 30], k = .72;
    let d = 'M50 54', x = 50;
    R.forEach((r, i) => { const nx = i % 2 === 0 ? x + 2 * r - (i ? 0 : 0) : x - 2 * r; d += ` A${r} ${r * k} 0 0 1 ${nx} 54`; x = nx; });
    d = 'M50 54'; x = 50;
    // half-arcs with alternating centres (50 and 55) give an even spiral
    [[60, 5], [40, 10], [70, 15], [30, 20], [80, 25]].forEach(([nx, r]) => { d += ` A${r} ${r * k} 0 0 1 ${nx} 54`; });
    d += ' C80 74 70 86 62 88';
    return svg(strand(d, 6.6) + `<path d="${d}" fill="none" stroke="${GOLD_DARK}" stroke-width="1" stroke-dasharray="2.5 2.5" opacity=".6"/>`);
  },
  // B: three crimped ribbons, loosely stacked
  ribbons: () => svg(
    ribbon({ x0: 12, x1: 88, cy: 28, h: 11, amp: 5, waves: 1.2, phase: 0 }) +
    ribbon({ x0: 10, x1: 86, cy: 50, h: 11, amp: 5, waves: 1.2, phase: 1 }) +
    ribbon({ x0: 14, x1: 90, cy: 72, h: 11, amp: 5, waves: 1.2, phase: 2 })),
  // C: one big fluted ribbon, folded in a wave
  ribbon: () => svg(ribbon({ x0: 10, x1: 90, cy: 50, h: 22, amp: 13, waves: 1, phase: .3, scallop: 2.2, rot: -14 })),
  // D: two crossing ribbons, the back one in shadow
  crossed: () => svg(
    ribbon({ x0: 10, x1: 88, cy: 52, h: 15, amp: 11, waves: 1, phase: Math.PI, rot: 28, fill: GOLD_DARK }) +
    ribbon({ x0: 12, x1: 90, cy: 48, h: 15, amp: 11, waves: 1, phase: 0, rot: -22 })),
};
const PAPPARDELLE_PICK = 'ribbons';
SHAPE_SVG.Pappardelle = PAPPARDELLE[PAPPARDELLE_PICK];

module.exports = { SHAPE_SVG, PAPPARDELLE };
