# Cut each dish out of the old Canva pasta (4.jpg) and gnocchi (5.jpg) pages as a PNG with soft edges.
# The Canva background is the same cream as the menu (#FDFBEF), so build.js can put each cut back in its
# original spot and it blends in. Boxes are in Canva page pixels (1414 x 2000) and must not touch any text.
# Usage: python -I cut_photos.py <folder with the Canva JPGs> <out folder>
import sys
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
FEATHER = 10  # px fade at each edge

# name: (page, x0, y0, x1, y1, feather_sides)   sides: l t r b
BOXES = {
    'carbonara': (4, 45, 370, 310, 580, 'ltrb'),
    'spaghetti-pomodoro': (4, 260, 530, 518, 732, 'ltrb'),
    'amatriciana': (4, 40, 708, 318, 935, 'ltrb'),
    'pappardelle-bolognese': (4, 245, 893, 520, 1097, 'ltrb'),
    'lasagna': (4, 42, 1075, 312, 1320, 'ltrb'),
    'rigatoni-vodka': (4, 252, 1275, 516, 1500, 'ltrb'),
    'nonna-anna': (4, 55, 1478, 338, 1755, 'ltrb'),
    'capsicum': (4, 287, 1672, 552, 1940, 'ltrb'),
    'gnocchi-carbonara': (5, 42, 432, 396, 692, 'ltrb'),
    'gnocchi-classico': (5, 230, 672, 574, 966, 'ltrb'),
    'gnocchi-amatriciana': (5, 42, 940, 396, 1204, 'ltrb'),
    'gnocchi-bolognese': (5, 244, 1178, 596, 1448, 'ltrb'),
    'gnocchi-pesto': (5, 48, 1420, 398, 1740, 'ltrb'),
    # Taller box so the whole plate fits; its own shape mask (SHAPE below) instead of a rectangle.
    'gnocchi-sorrentina': (5, 222, 1686, 664, 1995, 'ltrb'),
    # "Create your own" poster (6.jpg): the parmesan cream rigatoni, on a red background (the ellipse mask in combo2.js hides it)
    'create-cream': (6, 10, 540, 860, 1360, 'ltrb'),
    # Square crops centred on each plate, for round frames (the ellipse mask hides the poster background)
    'create-parmesan': (6, 52, 570, 812, 1330, 'ltrb'),
    'create-zucchini': (6, 635, 1150, 1295, 1810, 'ltrb'),
    # Brush strokes in the bottom-right corner, in two pieces that stay clear of the old Sorrentina text.
    'strokes-top': (5, 1262, 1730, 1414, 1892, 'lt'),
    'strokes-bottom': (5, 1110, 1880, 1414, 2000, 'lt'),
}

# Areas painted cream before cutting, to remove bits of a neighbouring plate: polygons in page pixels.
CLEAN = {  # the pesto plate's rim above the Sorrentina bowl, following its curve so the bowl and its plate stay intact
    'gnocchi-sorrentina': [[(228, 1690), (366, 1690), (336, 1706), (300, 1721), (262, 1731), (228, 1739)]],
}

# Cuts that don't suit a rectangle: alpha = the bowl's outline plus the plate as a soft ellipse (page pixels).
# The plate's ellipse is pulled in slightly on the right so it fades before the old menu text next to it.
SHAPE = {
    'gnocchi-sorrentina': {
        'poly': [(298, 1748), (326, 1700), (470, 1688), (560, 1688), (628, 1692), (632, 1760), (618, 1884), (298, 1884)],
        'ellipse': (445, 1858, 207, 118),  # cx, cy, rx, ry
    },
}

for name, (page, x0, y0, x1, y1, sides) in BOXES.items():
    im = Image.open(f'{src}/{page}.jpg').convert('RGB')
    for poly in CLEAN.get(name, []):
        ImageDraw.Draw(im).polygon(poly, fill=(253, 251, 239))
    im = im.crop((x0, y0, x1, y1))
    w, h = im.size
    if name in SHAPE:
        sp = SHAPE[name]
        bowl = Image.new('L', (w, h), 0)
        ImageDraw.Draw(bowl).polygon([(x - x0, y - y0) for x, y in sp['poly']], fill=255)
        bowl = bowl.filter(ImageFilter.GaussianBlur(3))
        cx, cy, rx, ry = sp['ellipse']
        plate = Image.new('L', (w, h), 0)
        ImageDraw.Draw(plate).ellipse((cx - rx - x0, cy - ry - y0, cx + rx - x0, cy + ry - y0), fill=255)
        plate = plate.filter(ImageFilter.GaussianBlur(9))
        a = Image.fromarray(__import__('numpy').maximum(__import__('numpy').array(bowl), __import__('numpy').array(plate)))
        im.putalpha(a)
        im.save(f'{out}/{name}.png')
        print(name, im.size, '(shaped)')
        continue
    l, t, r, b = (FEATHER if s in sides else 0 for s in 'ltrb')
    a = Image.new('L', (w, h), 0)
    ImageDraw.Draw(a).rectangle((l, t, w - 1 - r, h - 1 - b), fill=255)
    a = a.filter(ImageFilter.GaussianBlur(FEATHER / 2.5))
    # Keep page-edge sides fully opaque.
    d = ImageDraw.Draw(a)
    if not r: d.rectangle((w - FEATHER, t + FEATHER, w - 1, h - 1 - b - FEATHER), fill=255)
    if not b: d.rectangle((l + FEATHER, h - FEATHER, w - 1 - r - FEATHER, h - 1), fill=255)
    im.putalpha(a)
    im.save(f'{out}/{name}.png')
    print(name, im.size)
