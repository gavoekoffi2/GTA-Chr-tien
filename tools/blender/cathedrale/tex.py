# Textures peintes de la cathédrale du Sacré-Cœur (blanc + rouge brique, gothique), d'après photos
from PIL import Image, ImageDraw, ImageFilter
import math, random
R = (142, 42, 34); RD = (112, 30, 26); WH = (243, 240, 233); GL = (38, 48, 62); PX = 64
rnd = random.Random(3)
def canvas(wm, hm, bg=WH): im = Image.new('RGBA', (int(wm * PX), int(hm * PX)), bg + (255,)); return im, ImageDraw.Draw(im)
Y = lambda im, z: im.height - z * PX   # z en mètres depuis le bas
def lancet(d, im, x0, z0, w, h, frame=0.22, glass=GL, mull=0, louvre=False):
    """Fenêtre en arc brisé : cadre rouge, vitrail sombre."""
    def path(x0, z0, w, h, n=24):
        r = w * 0.85; cx1, cx2 = x0 + w - r, x0 + r; zt = z0 + h - math.sqrt(r * r - (w / 2 - (w - r)) ** 2) if r > w / 2 else z0 + h
        pts = [(x0, z0), (x0, zt)]
        top = z0 + h
        for i in range(n + 1):
            t = i / n; a = math.pi - t * (math.acos((w - r) / r) if r > 0 else 0)
            pts.append((cx2 + r * math.cos(a) - 0, zt + r * math.sin(a))) if False else None
        # arc brisé simple : deux arcs de cercle
        for i in range(n + 1):
            t = i / n; x = x0 + t * w / 2; dz = (top - zt) * math.sin(t * math.pi / 2); pts.append((x, zt + dz))
        for i in range(n + 1):
            t = i / n; x = x0 + w / 2 + t * w / 2; dz = (top - zt) * math.cos(t * math.pi / 2); pts.append((x, zt + dz))
        pts += [(x0 + w, z0)]
        return [(x * PX, Y(im, z)) for x, z in pts]
    d.polygon(path(x0 - frame, z0 - frame * 0.5, w + 2 * frame, h + frame * 1.6), fill=R)
    d.polygon(path(x0, z0, w, h), fill=glass)
    if louvre:
        for k in range(int(h / 0.25)):
            z = z0 + 0.15 + k * 0.25; d.line((x0 * PX + 3, Y(im, z), (x0 + w) * PX - 3, Y(im, z)), fill=(70, 74, 80), width=3)
    else:
        for k in range(1, int(h / 0.5)):
            z = z0 + k * 0.5; d.line((x0 * PX, Y(im, z), (x0 + w) * PX, Y(im, z)), fill=(90, 92, 96), width=2)
        for k in range(1, max(2, int(w / 0.45))):
            x = x0 + k * w / max(2, int(w / 0.45)); d.line((x * PX, Y(im, z0 + h * 0.75), x * PX, Y(im, z0)), fill=(90, 92, 96), width=2)
        # touches de couleur (vitrail)
        for k in range(int(w * h * 3)):
            x = rnd.uniform(x0 + 0.05, x0 + w - 0.05); z = rnd.uniform(z0 + 0.1, z0 + h * 0.75); c = rnd.choice([(150, 120, 60), (60, 80, 140), (140, 50, 50), (70, 110, 80)])
            d.rectangle((x * PX, Y(im, z), x * PX + 5, Y(im, z) + 7), fill=c)
    if mull: d.line(((x0 + w / 2) * PX, Y(im, z0 + h * 0.8), (x0 + w / 2) * PX, Y(im, z0)), fill=R, width=int(0.14 * PX))
def scallops(d, im, x0, x1, z, depth=0.45, n=None):
    """Frise festonnée rouge (arcs pendants) sous une corniche."""
    n = n or max(2, int((x1 - x0) / 0.7)); w = (x1 - x0) / n
    d.rectangle((x0 * PX, Y(im, z + 0.25), x1 * PX, Y(im, z)), fill=R)
    for k in range(n):
        cx = x0 + (k + 0.5) * w
        d.ellipse(((cx - w / 2) * PX, Y(im, z + depth * 0.2), (cx + w / 2) * PX, Y(im, z - depth)), fill=WH + (255,))
    for k in range(n + 1):
        x = x0 + k * w; d.polygon([((x - 0.08) * PX, Y(im, z)), ((x + 0.08) * PX, Y(im, z)), (x * PX, Y(im, z - depth * 0.8))], fill=R)
def grime(im, amt=14):
    px = im.load()
    for k in range(int(im.width * im.height / 60)):
        x = rnd.randrange(im.width); y = rnd.randrange(im.height); v = rnd.randint(-amt, amt // 2)
        r, g, b, a = px[x, y]; px[x, y] = (max(0, min(255, r + v)), max(0, min(255, g + v)), max(0, min(255, b + v)), a)
    return im.filter(ImageFilter.GaussianBlur(0.6))
# ---- travée latérale de la nef : 5.6 m × 14 m ----
im, d = canvas(5.6, 14)
d.rectangle((0, Y(im, 14), 5.6 * PX, Y(im, 13.2)), fill=R); scallops(d, im, 0, 5.6, 13.2, 0.4, 8)
for x in (0, 5.6): d.rectangle(((x - 0.38) * PX, 0, (x + 0.38) * PX, im.height), fill=R)
d.rectangle((0, Y(im, 7.55), 5.6 * PX, Y(im, 7.2)), fill=R); d.rectangle((0, Y(im, 0.45), 5.6 * PX, Y(im, 0)), fill=RD)
lancet(d, im, 1.9, 1.0, 1.8, 5.2, mull=1)
lancet(d, im, 1.85, 8.6, 0.8, 2.6); lancet(d, im, 2.95, 8.6, 0.8, 2.6)
grime(im).save('side.png')
# ---- face de tour : 5.2 m × 24 m ----
im, d = canvas(5.2, 24, R)
d.rectangle((0.5 * PX, Y(im, 9.4), 4.7 * PX, Y(im, 0.6)), fill=WH); lancet(d, im, 1.9, 1.6, 1.4, 6.2)
scallops(d, im, 0.5, 4.7, 9.4, 0.4, 6)
d.rectangle((0.6 * PX, Y(im, 14.2), 4.6 * PX, Y(im, 10.2)), fill=R)
for k, x in enumerate((0.75, 1.75, 2.75, 3.75)):
    lancet(d, im, x, 10.7, 0.7, 2.8, frame=0.1, glass=WH if k in (0, 3) else (60, 52, 46))
d.rectangle((0.5 * PX, Y(im, 22.0), 4.7 * PX, Y(im, 15.0)), fill=WH)
lancet(d, im, 0.95, 15.6, 1.3, 5.2, louvre=True); lancet(d, im, 2.95, 15.6, 1.3, 5.2, louvre=True)
grime(im).save('tower.png')
# ---- façade centrale : 7.6 m × 21 m (pignon jusqu'à 21 m) ----
im, d = canvas(7.6, 21, R)
d.rectangle((0.35 * PX, Y(im, 11.0), 7.25 * PX, Y(im, 0.5)), fill=WH)
scallops(d, im, 0.35, 7.25, 11.0, 0.45, 9)
# rosace
cx, cz, rr = 3.8, 6.4, 2.35
d.ellipse(((cx - rr - 0.25) * PX, Y(im, cz + rr + 0.25), (cx + rr + 0.25) * PX, Y(im, cz - rr - 0.25)), fill=R)
d.ellipse(((cx - rr) * PX, Y(im, cz + rr), (cx + rr) * PX, Y(im, cz - rr)), fill=(48, 66, 110))
for k in range(12):
    a = k / 12 * 2 * math.pi; x1, z1 = cx + math.cos(a) * rr, cz + math.sin(a) * rr
    d.line((cx * PX, Y(im, cz), x1 * PX, Y(im, z1)), fill=R, width=int(0.13 * PX))
    ex, ez = cx + math.cos(a) * rr * 0.62, cz + math.sin(a) * rr * 0.62; d.ellipse(((ex - 0.5) * PX, Y(im, ez + 0.5), (ex + 0.5) * PX, Y(im, ez - 0.5)), outline=R, width=int(0.1 * PX))
d.ellipse(((cx - 0.55) * PX, Y(im, cz + 0.55), (cx + 0.55) * PX, Y(im, cz - 0.55)), fill=R); d.ellipse(((cx - 0.4) * PX, Y(im, cz + 0.4), (cx + 0.4) * PX, Y(im, cz - 0.4)), fill=(200, 170, 120))
for k in range(60):
    a = rnd.uniform(0, 6.283); r2 = rnd.uniform(0.7, rr - 0.15); x, z = cx + math.cos(a) * r2, cz + math.sin(a) * r2
    d.rectangle((x * PX, Y(im, z), x * PX + 5, Y(im, z) + 5), fill=rnd.choice([(170, 140, 70), (150, 60, 60), (80, 120, 90), (90, 110, 170)]))
# portail
lancet(d, im, 2.8, 0.5, 2.0, 3.4, frame=0.3, glass=(66, 44, 30))
# registre supérieur : arcatures + horloge
d.rectangle((0.35 * PX, Y(im, 16.2), 7.25 * PX, Y(im, 11.5)), fill=WH)
for x in (0.7, 5.75): lancet(d, im, x, 11.9, 1.15, 3.6, frame=0.18, glass=WH)
lancet(d, im, 2.5, 11.9, 2.6, 4.2, frame=0.2, glass=WH)
d.ellipse((2.95 * PX, Y(im, 15.0), 4.65 * PX, Y(im, 13.3)), fill=R); d.ellipse((3.07 * PX, Y(im, 14.88), 4.53 * PX, Y(im, 13.42)), fill=(250, 250, 248))
for k in range(12):
    a = k / 12 * 2 * math.pi; d.line(((3.8 + math.cos(a) * 0.62) * PX, Y(im, 14.15 + math.sin(a) * 0.62), (3.8 + math.cos(a) * 0.7) * PX, Y(im, 14.15 + math.sin(a) * 0.7)), fill=(60, 60, 60), width=4)
d.line((3.8 * PX, Y(im, 14.15), 4.2 * PX, Y(im, 14.4)), fill=(40, 40, 40), width=5); d.line((3.8 * PX, Y(im, 14.15), 3.7 * PX, Y(im, 14.6)), fill=(40, 40, 40), width=4)
# pignon : arcature blanche
d.polygon([(1.4 * PX, Y(im, 16.6)), (6.2 * PX, Y(im, 16.6)), (3.8 * PX, Y(im, 19.8))], fill=WH); lancet(d, im, 3.3, 16.9, 1.0, 1.9, frame=0.12, glass=(60, 52, 46))
grime(im).save('front.png')
# ---- pignon latéral à horloge : 4.6 m × 5.5 m ----
im, d = canvas(4.6, 5.5, R)
d.polygon([(0.35 * PX, Y(im, 0)), (4.25 * PX, Y(im, 0)), (4.25 * PX, Y(im, 2.8)), (2.3 * PX, Y(im, 5.1)), (0.35 * PX, Y(im, 2.8))], fill=WH)
d.ellipse((1.45 * PX, Y(im, 3.3), 3.15 * PX, Y(im, 1.6)), fill=R); d.ellipse((1.57 * PX, Y(im, 3.18), 3.03 * PX, Y(im, 1.72)), fill=(250, 248, 240))
for k in range(12):
    a = k / 12 * 2 * math.pi; d.line(((2.3 + math.cos(a) * 0.6) * PX, Y(im, 2.45 + math.sin(a) * 0.6), (2.3 + math.cos(a) * 0.68) * PX, Y(im, 2.45 + math.sin(a) * 0.68)), fill=(160, 120, 60), width=5)
grime(im).save('gable.png')
# ---- flèche ajourée (octogonale) : bandes rouges et ouvertures en arc ----
im = Image.new('RGBA', (256, 1024), R + (255,)); d = ImageDraw.Draw(im)
for row in range(14):
    y0 = 40 + row * 70
    for c in range(3):
        x0 = 30 + c * 75; d.rectangle((x0, y0 + 14, x0 + 40, y0 + 52), fill=(0, 0, 0, 0)); d.ellipse((x0, y0, x0 + 40, y0 + 28), fill=(0, 0, 0, 0))
    d.rectangle((0, y0 + 56, 256, y0 + 66), fill=RD + (255,))
im.save('spire.png')
# ---- toit en tôle verte ondulée ----
im = Image.new('RGB', (256, 256), (58, 128, 66)); d = ImageDraw.Draw(im)
for x in range(0, 256, 16): d.rectangle((x, 0, x + 6, 256), fill=(74, 150, 82))
for k in range(30): x = rnd.randrange(256); y = rnd.randrange(256); d.rectangle((x, y, x + 20, y + 5), fill=(170, 160, 140))
im.filter(ImageFilter.GaussianBlur(1)).save('roof.jpg')
print('textures ok')
