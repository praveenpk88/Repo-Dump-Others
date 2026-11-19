# Pasta Fresca and Gnocchi menus

The two portrait Canva menus (Pasta Fresca and Gnocchi), rebuilt in the same layout so prices can be changed and the PDF stays sharp.
Outputs in `output/`: `pasta-menu.pdf/.png` and `gnocchi-menu.pdf/.png`, A4 portrait. Everything is in mm, so they scale up cleanly.

- **Prices and text:** the `MENUS` block at the top of `build.js`. Prices print with cents (25.5 → $25.50).
- **Rebuild:** `node build.js` (or `node build.js pasta`). Needs Playwright with Chromium.
- **Photos:** `photos/` holds each dish cut from the Canva pages by `cut_photos.py`
  (`python -I cut_photos.py <folder with 4.jpg and 5.jpg> photos`). The Canva background is the same cream as the menu,
  so each cut goes back in its original spot and blends in.

Prices raised by 50 cents from the Canva versions (Nov 2026). Not changed: the $10 Monday Special and the +$2.50 focaccia bowl.
Typos fixed from Canva: Papardelle → Pappardelle, vegetabels → vegetables, ricotta salatta → ricotta salata.
