# Cut square pizza photos out of the old menu images (the menu clips them to circles in CSS).
# Usage: python3 cut_photos.py <folder with the old menu JPGs> photos
import sys
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
C = {
 'cheesy-garlic':(3,532,480,104*0.95),'napoletana':(3,548,1147,108*0.95),'vegetariana':(3,540,1380,114*0.95),
 'diavola':(3,548,1612,112*0.95),'hamsorry':(3,540,1855,106*0.95),'salsiccia-patate':(3,1222,505,116*0.95),
 'bufalina':(3,1232,752,120*0.95),'capricciosa':(3,1226,990,116*0.95),'prosciutto':(3,1230,1235,116*0.95),
 'porcona-rossa':(3,1228,1500,114*0.95),'gamberi':(3,1228,1765,114*0.95),
 'margherita':(17,710,926,312),'marinara':(7,684,1220,400),'mortadella':(8,676,1360,470),
}
S=640
for n,(f,cx,cy,r) in C.items():
    im=Image.open(f'{src}/{f}.jpg').convert('RGB')
    r=int(r); t=im.crop((cx-r,cy-r,cx+r,cy+r)).resize((S,S),Image.LANCZOS)
    t.save(f'{out}/{n}.jpg',quality=90)
print('ok')
