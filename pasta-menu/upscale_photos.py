# Make print copies of the pasta photos: 2x Lanczos upscale with light sharpening, into photos-hd/.
# The cuts from the Canva pages are only 200-300 px, a bit under 300 dpi at their printed size on A3.
# This can't add real detail (the photographer's shots would), but it prints smoother than the browser's own scaling.
# Usage: python -I upscale_photos.py
import glob, os
from PIL import Image, ImageFilter

src, out = 'photos', 'photos-hd'
os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob(f'{src}/*.png')):
    im = Image.open(f).convert('RGBA')
    k = 2 if max(im.size) < 600 else 1
    big = im.resize((im.width * k, im.height * k), Image.LANCZOS) if k > 1 else im.copy()
    rgb, a = big.convert('RGB'), big.getchannel('A')
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
    rgb.putalpha(a)
    rgb.save(f'{out}/{os.path.basename(f)}')
    print(os.path.basename(f), im.size, '->', rgb.size)
