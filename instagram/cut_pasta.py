# Cut square pasta photos (plate centred) out of the old Canva menus and promo posters.
# Usage: python3 cut_pasta.py <folder with the old menu JPGs> <out folder> [preview.jpg]
import sys
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
C = {  # name: (file, cx, cy, r)
 'carbonara': (4, 178, 473, 122), 'spaghetti-pomodoro': (4, 390, 630, 118), 'amatriciana': (4, 178, 822, 124),
 'pappardelle-bolognese': (4, 385, 995, 124), 'lasagna': (4, 185, 1195, 132), 'rigatoni-vodka': (4, 388, 1378, 124),
 'nonna-anna': (4, 195, 1615, 134), 'capsicum': (4, 420, 1790, 126),
 'gnocchi-carbonara': (5, 220, 562, 150), 'gnocchi-classico': (5, 405, 818, 150), 'gnocchi-amatriciana': (5, 220, 1072, 152),
 'gnocchi-bolognese': (5, 420, 1312, 150), 'gnocchi-pesto': (5, 225, 1582, 152), 'gnocchi-sorrentina': (5, 455, 1830, 168),
 'rigatoni-cream': (6, 422, 972, 405), 'zucchini-pasta': (6, 964, 1430, 430),
}
S = 640
tiles = []
for n, (f, cx, cy, r) in C.items():
    im = Image.open(f'{src}/{f}.jpg').convert('RGB')
    t = im.crop((cx - r, cy - r, cx + r, cy + r)).resize((S, S), Image.LANCZOS)
    t.save(f'{out}/{n}.jpg', quality=90)
    p = t.resize((200, 200)); d = ImageDraw.Draw(p); d.ellipse((2, 2, 198, 198), outline='lime', width=2); d.text((4, 4), n, fill='blue')
    tiles.append(p)
if len(sys.argv) > 3:
    sheet = Image.new('RGB', (200 * 8, 200 * 2), 'white')
    for i, p in enumerate(tiles): sheet.paste(p, ((i % 8) * 200, (i // 8) * 200))
    sheet.save(sys.argv[3], quality=85)
