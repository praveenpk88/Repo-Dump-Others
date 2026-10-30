# La Pizza Napoletana — pizza menu (draft)

Landscape pizza menu for La Pizza Napoletana by Samuele Ferro at il Mercato Centrale Melbourne.
Built from the manager's red mock-up: each row reads **Classic → Level up → Go all in**.

Three design variants, each rendered as an A3 landscape PDF (print) and PNG (preview) in `output/`:

| Variant | Idea |
| --- | --- |
| **A · Trattoria** | The manager's red mock-up, refined: a photo beside every pizza, an oven drawing, a sidebar for focaccia, dolce and notes. |
| **B · La Scala** | One photo per row, with the row drawn as a ladder. Red header band with the il Mercato checks to tie in with the other shops. |
| **C · Lavagna** | Typographic, no photos, larger type. Made for big prints and wall boards. |

Everything is sized in mm, so the PDFs scale cleanly to A2/A1.

## Editing

- **Text and prices:** `menu-data.js`. A price of `null` prints as a highlighted `XX` (still to be confirmed).
- **Layouts:** `build.js` (one function per variant).
- **Rebuild:** `node build.js` (or `node build.js a` for one variant). Needs Playwright with Chromium.
- **Photos:** `photos/` holds square JPGs cut from the old Canva menus by `cut_photos.py`. Swap in Samuele's new photos
  using the same file names, then add `photo: '<name>'` to the item in `menu-data.js`.
- **Fonts:** `fonts/` (Google Fonts, OFL): Cormorant Garamond, EB Garamond, DM Serif Display, Lora, Oswald, Fraunces, Cinzel, Mrs Saint Delafield.
