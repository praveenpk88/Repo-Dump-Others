# Cut the Halloween pizza out of the photo as a soft-edged ellipse (transparent PNG).
# Usage: python3 cut_pizza.py <photo.jpg> <out.png> [x0 y0 x1 y1]   (ellipse box measured on a 1999 px wide preview)
import sys
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
k = im.width / 1999
box_in = [float(v) for v in sys.argv[3:7]] if len(sys.argv) >= 7 else (268, 292, 1748, 1236)
x0, y0, x1, y1 = [round(v * k) for v in box_in]
pad = round(40 * k)
box = (x0 - pad, y0 - pad, x1 + pad, y1 + pad)
crop = im.crop(box)
mask = Image.new('L', crop.size, 0)
ImageDraw.Draw(mask).ellipse((pad, pad, pad + x1 - x0, pad + y1 - y0), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(round(5 * k)))
crop.putalpha(mask)
w = 2400
crop.resize((w, round(crop.height * w / crop.width)), Image.LANCZOS).save(out, optimize=True)
print(crop.size)
