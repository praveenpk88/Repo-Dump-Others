# Pasta Fresca and Gnocchi menus

The two portrait Canva menus (Pasta Fresca and Gnocchi), rebuilt in the same layout so prices can be changed and the PDF stays sharp.
Outputs in `output/`: `pasta-menu.pdf/.png` and `gnocchi-menu.pdf/.png`, A4 portrait. Everything is in mm, so they scale up cleanly.

- **Prices and text:** the `MENUS` block at the top of `build.js`. Prices print with cents (25.5 → $25.50).
- **Rebuild:** `node build.js` (or `node build.js pasta`). Needs Playwright with Chromium.
- **Photos:** `photos/` holds each dish cut from the Canva pages by `cut_photos.py`
  (`python -I cut_photos.py <folder with 4.jpg and 5.jpg> photos`). The Canva background is the same cream as the menu,
  so each cut goes back in its original spot and blends in.

## Combined Pasta & Gnocchi menu (A3 landscape, draft)

`node combo.js` → `output/combo-a.*` and `output/combo-b.*`. Same look as the pizza menu: Classic → Level up → Go all in,
a Pasta row and a Gnocchi row, and "Pick your shape" (rigatoni, spaghetti, fusilli, pappardelle, gnocchi, gluten-free gnocchi).

| Version | Idea |
| --- | --- |
| **A · Tier grid** | Shape pills across the top, a round photo next to every dish, red Pasta / Gnocchi labels down the side. |
| **B · Hero rows** | One big photo per row under a light-blue title oval, dishes as text, a red "Pick your shape" panel and a $10 Monday badge. |

Tiers: Classic = simple sauces, Level up = rich meat sauces, Go all in = baked (Nonna Anna, Lasagna, Sorrentina).
Text and prices are at the top of `combo.js`.

### Round 2 (built on version A)

`node combo2.js` → `output/combo2-1.*`, `combo2-2.*`, `combo2-3.*`. Classic / Level up / Go all in is dropped for pasta.
Every version has illustrated shapes on top, drawn in `shapes.js` (SVG, so they print sharp at any size).

| Version | How dishes are organised |
| --- | --- |
| **1 · Veggie / With meat / Al forno** | By what's in it. |
| **2 · Rosso / Bianco / Ragù & forno** | By sauce colour, with a sauce swatch in each heading. |
| **3 · Step by step** | 1 Pick your shape (big shape cards), 2 Pick your dish (cards, cheapest first, no columns), $10 Monday badge. |

## Notes

Prices raised by 50 cents from the Canva versions (Nov 2026). Not changed: the $10 Monday Special and the +$2.50 focaccia bowl.
Typos fixed from Canva: Papardelle → Pappardelle, vegetabels → vegetables, ricotta salatta → ricotta salata.

### Round 3 (treatments of version 1)

`node combo3.js` → `output/combo3-1.*`, `-2.*`, `-3.*`. Create your own gets a big panel with both bases photographed
(`photos/create-parmesan.png`, `photos/create-zucchini.png`, cut from the Create your own poster).
1 · Refined (full-width red panel along the bottom) · 2 · Sidebar (red sidebar with shapes and Create your own) ·
3 · Poster (red header with the blue oval, cream card columns, round price badge).
Matching pizza treatments: `../pizza-menu/columns.js` (1) and `../pizza-menu/columns3.js` (2 and 3).
