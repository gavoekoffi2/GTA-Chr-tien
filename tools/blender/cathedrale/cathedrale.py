# Cathédrale du Sacré-Cœur de Lomé — volumes + façades peintes (tex.py), d'après photos Commons et emprise OSM.
# Repère local Blender : façade vers −Y, nef le long de +Y, Z haut. Origine = centre de l'emprise.
import bpy, bmesh, math, os
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
col = bpy.data.collections.new('cathedrale'); sc.collection.children.link(col)
def img_mat(name, img, alpha=False, rough=0.75):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; bs = N['Principled BSDF']; t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(D, img))
    t.extension = 'REPEAT'; m.node_tree.links.new(t.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = rough
    if alpha: m.node_tree.links.new(t.outputs['Alpha'], bs.inputs['Alpha'])
    return m
def flat(name, rgb, rough=0.7):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; return m
SIDE = img_mat('cath_cote', 'side.png'); TOWER = img_mat('cath_tour', 'tower.png'); FRONT = img_mat('cath_facade', 'front.png'); GABLE = img_mat('cath_pignon', 'gable.png')
SPIRE = img_mat('cath_fleche', 'spire.png', alpha=True); ROOF = img_mat('cath_toit', 'roof.jpg', rough=0.5)
RED = flat('cath_rouge', (0.27, 0.035, 0.025)); WHITE = flat('cath_blanc', (0.88, 0.86, 0.82))
bm = bmesh.new(); uv = bm.loops.layers.uv.new(); MATS = [SIDE, TOWER, FRONT, GABLE, ROOF, RED, WHITE]
def quad(a, b, c, d, mi, uvs):
    f = bm.faces.new([bm.verts.new(p) for p in (a, b, c, d)]); f.material_index = mi
    for lp, t in zip(f.loops, uvs): lp[uv].uv = t
    return f
def wall(p0, p1, z0, z1, mi, u0=0.0, u1=1.0, v0=0.0, v1=1.0):
    """Mur vertical de p0 à p1 (vu de l'extérieur : p0 à gauche)."""
    return quad((p0[0], p0[1], z0), (p1[0], p1[1], z0), (p1[0], p1[1], z1), (p0[0], p0[1], z1), mi, ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))
def boxw(x0, y0, x1, y1, z0, z1, mi_front, mi_side, front_uv=(0, 1, 0, 1), side_rep=1.0):
    """Bloc : face avant (−Y) texturée, autres faces avec mi_side."""
    wall((x0, y0), (x1, y0), z0, z1, mi_front, front_uv[0], front_uv[1], front_uv[2], front_uv[3])
    wall((x1, y0), (x1, y1), z0, z1, mi_side, 0, side_rep, 0, 1); wall((x1, y1), (x0, y1), z0, z1, mi_side, 0, side_rep, 0, 1); wall((x0, y1), (x0, y0), z0, z1, mi_side, 0, side_rep, 0, 1)
L, W, HW = 40.0, 14.4, 14.0
YF, YB = -20.0, 20.0                  # façade, chevet
TW, TD, TH = 4.4, 4.4, 24.0           # tours (façade réelle ≈ 15 m)
CWID = W - 2 * TW + 2 * 0.4           # façade centrale entre les tours (≈ 4.8 → élargie visuellement)
# ---------- tours ----------
for sx in (-1, 1):
    x0, x1 = (-W / 2 - 0.4, -W / 2 - 0.4 + TW) if sx < 0 else (W / 2 + 0.4 - TW, W / 2 + 0.4)
    boxw(x0, YF, x1, YF + TD, 0, TH, 1, 1)
    quad((x0, YF, TH), (x1, YF, TH), (x1, YF + TD, TH), (x0, YF + TD, TH), 5, ((0, 0), (1, 0), (1, 1), (0, 1)))
# ---------- façade centrale avec pignon ----------
cx0, cx1 = -W / 2 - 0.4 + TW, W / 2 + 0.4 - TW
fw = cx1 - cx0
f = bm.faces.new([bm.verts.new(p) for p in ((cx0, YF + 0.6, 0), (cx1, YF + 0.6, 0), (cx1, YF + 0.6, 16.6), (0, YF + 0.6, 21.0), (cx0, YF + 0.6, 16.6))]); f.material_index = 2
for lp in f.loops: x, z = lp.vert.co.x, lp.vert.co.z; lp[uv].uv = ((x - cx0) / fw, z / 21.0)
# ---------- nef : murs latéraux (travées de 5.6 m), pignons latéraux à horloge ----------
ys = YF + TD
nb = int((YB - 6 - ys) / 5.6)
for sx in (-1, 1):
    x = sx * W / 2
    for k in range(nb):
        y0, y1 = ys + k * 5.6, ys + (k + 1) * 5.6
        if sx > 0: wall((x, y0), (x, y1), 0, HW, 0)
        else: wall((x, y1), (x, y0), 0, HW, 0)
    # pignon à horloge (au tiers arrière)
    yg = ys + (nb - 2) * 5.6 + 0.5
    for (a, b2) in (((x + sx * 0.02, yg), (x + sx * 0.02, yg + 4.6)),):
        if sx > 0: wall(a, b2, HW - 0.4, HW + 5.1, 3)
        else: wall(b2, a, HW - 0.4, HW + 5.1, 3)
# ---------- chevet (demi-octogone) ----------
ye = ys + nb * 5.6
pts = [(W / 2, ye)] + [(math.cos(a) * W / 2, ye + math.sin(a) * W / 2 * 0.9) for a in [k / 4 * math.pi for k in range(1, 4)]] + [(-W / 2, ye)]
for i in range(len(pts) - 1): wall(pts[i], pts[i + 1], 0, HW - 1.5, 0, 0, 1)
# ---------- toiture verte ----------
RH = 5.2
quad((W / 2 + 0.5, ys, HW), (W / 2 + 0.5, ye, HW), (0, ye, HW + RH), (0, ys, HW + RH), 4, ((0, 0), (8, 0), (8, 2), (0, 2)))
quad((-W / 2 - 0.5, ye, HW), (-W / 2 - 0.5, ys, HW), (0, ys, HW + RH), (0, ye, HW + RH), 4, ((0, 0), (8, 0), (8, 2), (0, 2)))
quad((-W / 2, ys - 0.01, HW), (W / 2, ys - 0.01, HW), (W / 2, ys - 0.01, HW), (0, ys - 0.01, HW + RH), 6, ((0, 0), (1, 0), (1, 0), (0.5, 1)))
# toit du chevet (demi-cône à 4 pans)
for i in range(len(pts) - 1):
    a, b2 = pts[i], pts[i + 1]
    f = bm.faces.new([bm.verts.new((a[0], a[1], HW - 1.5)), bm.verts.new((b2[0], b2[1], HW - 1.5)), bm.verts.new((0, ye, HW + RH - 1.0))]); f.material_index = 4
    for lp, t in zip(f.loops, ((0, 0), (2, 0), (1, 1.5))): lp[uv].uv = t
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new('cath'); bm.to_mesh(me); bm.free(); body = bpy.data.objects.new('cath_corps', me); col.objects.link(body)
for m in MATS: body.data.materials.append(m)
# ---------- parapets ajourés, pinacles, flèches octogonales, croix ----------
def cone(r1, r2, h, seg, at, mat, name):
    b = bmesh.new(); c = bmesh.ops.create_cone(b, cap_ends=True, segments=seg, radius1=r1, radius2=r2, depth=h)
    bmesh.ops.translate(b, vec=(at[0], at[1], at[2] + h / 2), verts=c['verts'])
    uvl = b.loops.layers.uv.new()
    for f in b.faces:
        for lp in f.loops: v = lp.vert.co; lp[uvl].uv = ((math.atan2(v.y - at[1], v.x - at[0]) / (2 * math.pi) + 0.5) * seg / 2, (v.z - at[2]) / h)
    me = bpy.data.meshes.new(name); b.to_mesh(me); b.free(); o = bpy.data.objects.new(name, me); col.objects.link(o); o.data.materials.append(mat); return o
def cross(at, s, name):
    b = bmesh.new()
    for (sx, sy, sz, ox, oz) in ((0.12, 0.12, 1.0, 0, 0.5), (0.6, 0.12, 0.12, 0, 0.7)):
        c = bmesh.ops.create_cube(b, size=1.0); bmesh.ops.scale(b, vec=(sx * s, sy * s, sz * s), verts=c['verts']); bmesh.ops.translate(b, vec=(at[0] + ox, at[1], at[2] + oz * s), verts=c['verts'])
    me = bpy.data.meshes.new(name); b.to_mesh(me); b.free(); o = bpy.data.objects.new(name, me); col.objects.link(o); o.data.materials.append(RED); return o
for sx in (-1, 1):
    tx = sx * (W / 2 + 0.4 - TW / 2); ty = YF + TD / 2
    # parapet blanc ajouré (anneau carré bas) et 4 pinacles
    b = bmesh.new()
    for (dx, dy, lx, ly) in ((0, -TD / 2 + 0.15, TW, 0.3), (0, TD / 2 - 0.15, TW, 0.3), (-TW / 2 + 0.15, 0, 0.3, TD), (TW / 2 - 0.15, 0, 0.3, TD)):
        c = bmesh.ops.create_cube(b, size=1.0); bmesh.ops.scale(b, vec=(lx, ly, 1.1), verts=c['verts']); bmesh.ops.translate(b, vec=(tx + dx, ty + dy, TH + 0.55), verts=c['verts'])
    me = bpy.data.meshes.new('parapet'); b.to_mesh(me); b.free(); o = bpy.data.objects.new('parapet', me); col.objects.link(o); o.data.materials.append(WHITE)
    for (dx, dy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        px, py = tx + dx * (TW / 2 - 0.3), ty + dy * (TD / 2 - 0.3)
        cone(0.32, 0.32, 1.2, 4, (px, py, TH), RED, 'pinacle_base'); cone(0.34, 0.0, 1.6, 4, (px, py, TH + 1.2), RED, 'pinacle'); cross((px, py, TH + 2.7), 0.6, 'croix_p')
    cone(2.0, 2.0, 0.9, 8, (tx, ty, TH), RED, 'base_fleche')
    sp = cone(1.9, 0.12, 12.5, 8, (tx, ty, TH + 0.9), SPIRE, 'fleche'); sp.data.polygons.foreach_set('use_smooth', [False] * len(sp.data.polygons))
    cross((tx, ty, TH + 13.3), 1.6, 'croix')
cross((0, YF + 0.6, 21.0), 1.3, 'croix_pignon')
for sx in (-1, 1): cross((sx * (W / 2 + 0.05), ys + (nb - 2) * 5.6 + 2.8, HW + 5.0), 0.9, 'croix_horloge')
# flèche du transept (clocheton gris derrière le pignon latéral)
cone(0.5, 0.05, 6.0, 8, (0, ys + (nb - 2) * 5.6 + 2.8, HW + RH - 0.5), flat('zinc', (0.55, 0.55, 0.55), 0.4), 'clocheton')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'cathedrale.blend'))
for o in col.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(D, 'cathedrale.glb'), export_format='GLB', use_selection=True, export_yup=True, export_image_format='AUTO')
print('CATH', sum(len(o.data.polygons) for o in col.objects), 'travées', nb, 'chevet', round(ye, 1))
