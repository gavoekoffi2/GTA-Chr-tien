# Monument de l'Indépendance (Lomé) — modélisation procédurale d'après photos (Blender 4.5, bpy)
# Repère : mètres, Z en haut, façade avant (côté statue) vers -Y, X à droite vu de face.
import bpy, bmesh, json, math, random, os, sys
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__)); rnd = random.Random(7); GAME = os.environ.get('GAME') == '1'
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
col = bpy.data.collections.new('monument'); sc.collection.children.link(col)

def obj_from_bm(bm, name, mat=None):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new(name, me); col.objects.link(ob)
    if mat: ob.data.materials.append(mat)
    return ob

def prism(points2d, depth, name, mat, plane='XZ', y0=None):
    """Prisme extrudé à partir d'un polygone 2D (x, z) sur l'épaisseur depth (axe Y centré)."""
    bm = bmesh.new(); vs = [bm.verts.new((x, -depth / 2, z)) for x, z in points2d]
    f = bm.faces.new(vs); bm.normal_update()
    if f.normal.y > 0: f.normal_flip()
    r = bmesh.ops.extrude_face_region(bm, geom=[f]); nv = [g for g in r['geom'] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=nv, vec=(0, depth, 0)); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4], quad_method='BEAUTY', ngon_method='EAR_CLIP')
    return obj_from_bm(bm, name, mat)

def box(x0, y0, z0, x1, y1, z1, name, mat):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(x1 - x0, y1 - y0, z1 - z0), verts=bm.verts)
    bmesh.ops.translate(bm, vec=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), verts=bm.verts); return obj_from_bm(bm, name, mat)

def boolean(target, cutter, op='DIFFERENCE'):
    m = target.modifiers.new('b', 'BOOLEAN'); m.operation = op; m.object = cutter; m.solver = 'EXACT'; m.use_self = True; m.use_hole_tolerant = True
    bpy.context.view_layer.objects.active = target; bpy.ops.object.modifier_apply(modifier=m.name); bpy.data.objects.remove(cutter)

# ---------- matières (procédurales, cuites ensuite pour le jeu) ----------
def mat_concrete(name, base=(0.50, 0.35, 0.20), dark=(0.20, 0.15, 0.10), streak=0.75):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (9, 9, 0.35)   # coulures verticales
    Lk.new(tc.outputs['Object'], mp.inputs['Vector'])
    n1 = N.new('ShaderNodeTexNoise'); n1.inputs['Scale'].default_value = 3.0; n1.inputs['Detail'].default_value = 8; Lk.new(mp.outputs['Vector'], n1.inputs['Vector'])
    n2 = N.new('ShaderNodeTexNoise'); n2.inputs['Scale'].default_value = 1.2; n2.inputs['Detail'].default_value = 4; Lk.new(tc.outputs['Object'], n2.inputs['Vector'])
    wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Z'; wv.inputs['Scale'].default_value = 0.9; wv.inputs['Distortion'].default_value = 2.0; Lk.new(tc.outputs['Object'], wv.inputs['Vector'])
    r1 = N.new('ShaderNodeMapRange'); r1.inputs['From Min'].default_value = 0.45; r1.inputs['From Max'].default_value = 0.75; Lk.new(n1.outputs['Fac'], r1.inputs['Value'])
    mx = N.new('ShaderNodeMath'); mx.operation = 'MULTIPLY'; Lk.new(r1.outputs['Result'], mx.inputs[0]); mx.inputs[1].default_value = streak
    r2 = N.new('ShaderNodeMapRange'); r2.inputs['From Min'].default_value = 0.35; r2.inputs['From Max'].default_value = 0.7; Lk.new(n2.outputs['Fac'], r2.inputs['Value'])
    r2s = N.new('ShaderNodeMath'); r2s.operation = 'MULTIPLY'; Lk.new(r2.outputs['Result'], r2s.inputs[0]); r2s.inputs[1].default_value = 0.3
    ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; Lk.new(mx.outputs[0], ad.inputs[0]); Lk.new(r2s.outputs[0], ad.inputs[1])
    wm = N.new('ShaderNodeMath'); wm.operation = 'MULTIPLY'; Lk.new(wv.outputs['Fac'], wm.inputs[0]); wm.inputs[1].default_value = 0.12
    ad2 = N.new('ShaderNodeMath'); ad2.operation = 'ADD'; ad2.use_clamp = True; Lk.new(ad.outputs[0], ad2.inputs[0]); Lk.new(wm.outputs[0], ad2.inputs[1])
    cr = N.new('ShaderNodeMix'); cr.data_type = 'RGBA'; cr.inputs[6].default_value = (*base, 1); cr.inputs[7].default_value = (*dark, 1); Lk.new(ad2.outputs[0], cr.inputs[0])
    Lk.new(cr.outputs[2], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.9
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.25; Lk.new(n1.outputs['Fac'], bump.inputs['Height']); Lk.new(bump.outputs['Normal'], bs.inputs['Normal'])
    return m
def mat_flat(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; bs = m.node_tree.nodes['Principled BSDF']; bs.inputs['Base Color'].default_value = (*rgb, 1); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal; return m
def mat_stone(name):  # parement en moellons sombres
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); vo = N.new('ShaderNodeTexVoronoi'); vo.feature = 'DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value = 4.0; Lk.new(tc.outputs['Object'], vo.inputs['Vector'])
    vc = N.new('ShaderNodeTexVoronoi'); vc.inputs['Scale'].default_value = 4.0; Lk.new(tc.outputs['Object'], vc.inputs['Vector'])
    rr = N.new('ShaderNodeMapRange'); rr.inputs['From Min'].default_value = 0.0; rr.inputs['From Max'].default_value = 0.06; Lk.new(vo.outputs['Distance'], rr.inputs['Value'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (0.05, 0.05, 0.06, 1); cr.color_ramp.elements[1].color = (0.2, 0.2, 0.21, 1); Lk.new(vc.outputs['Distance'], cr.inputs['Fac'])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs[7].default_value = (0.85, 0.85, 0.83, 1); Lk.new(rr.outputs['Result'], mx.inputs[0]); Lk.new(cr.outputs['Color'], mx.inputs[6])
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1; Lk.new(rr.outputs['Result'], inv.inputs[1])
    # joints clairs (mortier) entre pierres sombres
    mx2 = N.new('ShaderNodeMix'); mx2.data_type = 'RGBA'; mx2.inputs[6].default_value = (0.55, 0.54, 0.5, 1); Lk.new(cr.outputs['Color'], mx2.inputs[7]); Lk.new(rr.outputs['Result'], mx2.inputs[0])
    Lk.new(mx2.outputs[2], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.85
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.6; Lk.new(rr.outputs['Result'], bump.inputs['Height']); Lk.new(bump.outputs['Normal'], bs.inputs['Normal'])
    return m
CONC = mat_concrete('beton'); PANEL = mat_concrete('beton_panneau', base=(0.10, 0.09, 0.08), dark=(0.04, 0.035, 0.03), streak=0.3)
STAT = mat_flat('pierre_statue', (0.55, 0.53, 0.49), 0.7); BRONZE = mat_flat('bronze', (0.35, 0.27, 0.18), 0.35, 1.0)
STONE = mat_stone('moellons')
PERCE = bpy.data.materials.new('perce'); PERCE.use_nodes = True; _n = PERCE.node_tree.nodes; _t = _n.new('ShaderNodeTexImage'); _t.image = bpy.data.images.load(os.path.join(D, 'panel_holes.png'))
PERCE.node_tree.links.new(_t.outputs['Color'], _n['Principled BSDF'].inputs['Base Color']); PERCE.node_tree.links.new(_t.outputs['Alpha'], _n['Principled BSDF'].inputs['Alpha']); _n['Principled BSDF'].inputs['Roughness'].default_value = 0.9
STONE = STONE; STEP = mat_flat('granit_rose', (0.70, 0.56, 0.52), 0.45); PAVE = mat_flat('dallage', (0.78, 0.74, 0.68), 0.5)

# ---------- mur central avec la silhouette humaine découpée ----------
hole = json.load(open(os.path.join(D, 'hole_m.json')))
W2, TH = 4.75, 1.8
# léger élargissement du haut (rebord intérieur visible sur la photo)
hole = [[x * 1.02, z + (0.18 if z > 8.5 else 0)] for x, z in hole]
gi = [i for i, (x, z) in enumerate(hole) if z < 0.05]
# ordonner : partir du point au sol le plus à droite et faire le tour par le haut jusqu'au point au sol le plus à gauche
iR = max(gi, key=lambda i: hole[i][0]); iL = min(gi, key=lambda i: hole[i][0]); n = len(hole)
def walk(step):
    out = []; i = iR
    while True:
        out.append(hole[i])
        if i == iL: break
        i = (i + step) % n
    return out
pa, pb = walk(1), walk(-1); path = pa if max(p[1] for p in pa) > max(p[1] for p in pb) else pb
path = [p for p in path if p[1] >= 0.05 or p in (hole[iR], hole[iL])]
outline = [(-W2, 0.0)] + [(-W2 + 2 * W2 * k / 20, 13.9 + 1.0 * (1 - (((-W2 + 2 * W2 * k / 20) / W2) ** 2))) for k in range(21)] + [(W2, 0.0)]
outline = [(-W2, 0.0), (-W2, 13.9)] + outline[2:-1] + [(W2, 13.9), (W2, 0.0)]
poly = outline + [(path[0][0], 0.0)] + [tuple(p) for p in path[1:-1]] + [(path[-1][0], 0.0)]
wall = prism(poly, TH, 'mur_central', CONC)
# tranche intérieure de la découpe : un peu plus sombre (ombre portée) — gérée par la cuisson AO

# ---------- deux « livres » : dos (texte) + pages perforées ----------
SP_H, CV_H0, CV_H1, SP_W, SP_T, CV_L, CV_T, ANG = 16.8, 16.8, 20.0, 4.5, 1.0, 6.3, 0.55, math.radians(55)
def page(sx, sy):
    """Page perforée : dalle + cadres en relief des deux côtés, panneaux sombres, trous ronds en deux files par case."""
    p0 = Vector((sx * (W2 + SP_T), sy * SP_W / 2, 0)); d = Vector((sx * math.cos(ANG), sy * math.sin(ANG), 0))
    Y = Vector((-d.y, d.x, 0)); M = Matrix(((d.x, Y.x, 0, p0.x), (d.y, Y.y, 0, p0.y), (0, 0, 1, 0), (0, 0, 0, 1)))
    L, T = CV_L, CV_T; hgt = lambda u: CV_H0 + (CV_H1 - CV_H0) * (u / L)
    def solid(u0, y0, u1, y1, z0, ztop, name, mat):
        bm = bmesh.new(); pts = [(u0, y0), (u1, y0), (u1, y1), (u0, y1)]
        vb = [bm.verts.new((u, y, z0)) for u, y in pts]; vt = [bm.verts.new((u, y, ztop(u))) for u, y in pts]
        bm.faces.new(vb); bm.faces.new(vt[::-1])
        for i in range(4): bm.faces.new((vb[i], vt[i], vt[(i + 1) % 4], vb[(i + 1) % 4]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces); o = obj_from_bm(bm, name, mat); o.matrix_world = M; return o
    slab = solid(0, -T / 2, L, T / 2, 0, hgt, f'page_{sx}_{sy}', CONC)
    ribs = [0.12 + k * (L - 0.24) / 3 for k in range(4)]; rows = [0.7 + r * 2.85 for r in range(7)]
    panels, frames = [], []
    for side in (-1, 1):
        y0, y1 = side * T / 2, side * (T / 2 + 0.025)
        for k in range(3):
            u0, u1 = ribs[k] + 0.13, ribs[k + 1] - 0.13; top = min(hgt(u0), hgt(u1)) - 0.55
            panels.append(solid(u0, min(y0, y1), u1, max(y0, y1), 0.6, lambda u, t=top: t, 'panneau', PANEL))
        yf0, yf1 = side * T / 2, side * (T / 2 + 0.16)
        for u in ribs: frames.append(solid(u - 0.13, min(yf0, yf1), u + 0.13, max(yf0, yf1), 0, lambda uu, u=u: hgt(u) - 0.04, 'nervure', CONC))
        for z in rows:
            if z + 0.2 < hgt(0) - 0.5: frames.append(solid(ribs[0], min(yf0, yf1) * 0.9, ribs[3], max(yf0, yf1) * 0.9, z, lambda uu, z=z: z + 0.18, 'barre', CONC))
    cut = bmesh.new()
    for k in range(3):
        u0, u1 = ribs[k] + 0.13, ribs[k + 1] - 0.13; uc = [u0 + (u1 - u0) * f for f in (0.33, 0.67)]
        for r in range(6):
            z0, z1 = rows[r] + 0.18, rows[r + 1]
            if z1 > min(hgt(u0), hgt(u1)) - 0.55: continue
            for c, ucol in enumerate(uc):
                nh = rnd.randint(3, 4)
                for j in range(nh):
                    z = z0 + (z1 - z0) * (j + 0.5 + rnd.uniform(-0.2, 0.2)) / nh; u = ucol + rnd.uniform(-0.12, 0.12) + (0.18 if (j + c) % 2 else -0.08)
                    rr = rnd.uniform(0.12, 0.17)
                    cyl = bmesh.ops.create_cone(cut, cap_ends=True, cap_tris=False, segments=12, radius1=rr, radius2=rr, depth=2.0)
                    bmesh.ops.transform(cut, matrix=Matrix.Translation((u, 0, z)) @ Matrix.Rotation(math.radians(90), 4, 'X'), verts=cyl['verts'])
    if GAME:
        cut.free()
        for o in [slab] + panels: bpy.data.objects.remove(o)
        slab = solid(0, -T / 2, L, T / 2, 0, hgt, f'page_{sx}_{sy}', CONC)
        # la dalle pleine est remplacée par un cadre (bords) + deux plans découpés
        bpy.data.objects.remove(slab); slab = None; parts = []
        for (a0, a1, b0, b1) in ((0, ribs[0] + 0.13, 0, 0), (ribs[3] - 0.13, L, 0, 0)):
            parts.append(solid(a0, -T / 2, a1, T / 2, 0, hgt, 'bord', CONC))
        for k in range(3):
            u0, u1 = ribs[k] + 0.13, ribs[k + 1] - 0.13; top = min(hgt(u0), hgt(u1)) - 0.55
            parts.append(solid(u0, -T / 2, u1, T / 2, 0, lambda u: 0.6, 'pied', CONC)); parts.append(solid(u0, -T / 2, u1, T / 2, top, hgt, 'tete_page', CONC))
        for side in (-1, 1):
            bm = bmesh.new(); y = side * (T / 2 - 0.02); uv = bm.loops.layers.uv.new(); Lx = L
            vs = [bm.verts.new((0, y, 0)), bm.verts.new((Lx, y, 0)), bm.verts.new((Lx, y, CV_H1)), bm.verts.new((0, y, CV_H1))]
            f = bm.faces.new(vs if side < 0 else vs[::-1])
            for lp in f.loops: lp[uv].uv = (lp.vert.co.x / Lx, lp.vert.co.z / CV_H1)
            o = obj_from_bm(bm, 'perce', PERCE); o.matrix_world = M; parts.append(o)
        bpy.ops.object.select_all(action='DESELECT')
        for o in parts[:-2] + frames: o.select_set(True)
        bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join(); parts[0].name = f'page_{sx}_{sy}'; return parts[0]
    cutter = obj_from_bm(cut, 'trous', None); cutter.matrix_world = M
    for o in [slab] + panels:
        c2 = cutter.copy(); c2.data = cutter.data.copy(); col.objects.link(c2); boolean(o, c2)
    bpy.data.objects.remove(cutter)
    bpy.ops.object.select_all(action='DESELECT')
    for o in [slab] + panels + frames: o.select_set(True)
    bpy.context.view_layer.objects.active = slab; bpy.ops.object.join(); return slab
pages = [page(sx, sy) for sx in (-1, 1) for sy in (-1, 1)]
spines = [box(sx * W2 if sx > 0 else -W2 - SP_T, -SP_W / 2, 0, sx * W2 + SP_T if sx > 0 else -W2, SP_W / 2, SP_H, f'dos_{sx}', CONC) for sx in (-1, 1)]
# rebord en saillie sous l'arc du bas-relief + chaperon du dos
for sx in (-1, 1):
    x_out = sx * (W2 + SP_T)
    box(x_out - (0.12 if sx > 0 else -0.12) * 0 - (0 if sx > 0 else 0.12), -SP_W / 2 + 0.2, SP_H - 0.25, x_out + (0.12 if sx > 0 else 0), SP_W / 2 - 0.2, SP_H, 'chaperon', CONC)

# ---------- plaques gravées (texte + bas-relief) : plans décalés avec texture ----------
def decal(name, img, w, h, center, normal_x):
    if h is None: im = bpy.data.images.load(img); h = w * im.size[1] / im.size[0]
    bm = bmesh.new(); s = 1 if normal_x > 0 else -1
    x = center[0] + s * 0.012; ys = [center[1] - w / 2, center[1] + w / 2]; z0, z1 = center[2] - h / 2, center[2] + h / 2
    vs = [bm.verts.new((x, ys[0], z0)), bm.verts.new((x, ys[1], z0)), bm.verts.new((x, ys[1], z1)), bm.verts.new((x, ys[0], z1))]
    f = bm.faces.new(vs if s > 0 else vs[::-1]); uv = bm.loops.layers.uv.new()
    for lp in f.loops:
        y, z = lp.vert.co.y, lp.vert.co.z; lp[uv].uv = (((y - ys[0]) if s > 0 else (ys[1] - y)) / w, (z - z0) / h)
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; bs = N['Principled BSDF']; tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(img)
    m.node_tree.links.new(tx.outputs['Color'], bs.inputs['Base Color']); m.node_tree.links.new(tx.outputs['Alpha'], bs.inputs['Alpha']); bs.inputs['Roughness'].default_value = 0.9
    m.blend_method = 'CLIP' if hasattr(m, 'blend_method') else None
    return obj_from_bm(bm, name, m)
decal('texte_proclamation', os.path.join(D, 'tex_proclamation.png'), 3.4, None, (-W2 - SP_T, 0, 11.3), -1)
decal('texte_hommage', os.path.join(D, 'tex_hommage.png'), 3.4, None, (W2 + SP_T, 0, 10.2), 1)
decal('relief_g', os.path.join(D, 'tex_relief.png'), 3.9, 3.0, (-W2 - SP_T, 0, 1.6), -1)
decal('relief_d', os.path.join(D, 'tex_relief.png'), 3.9, 3.0, (W2 + SP_T, 0, 1.6), 1)

# ---------- socle avant, escaliers, statue à la flamme ----------
FY = -0.9  # face avant du mur
box(-4.2, FY - 4.2, 0, 4.2, FY, 1.35, 'socle', STONE)                    # massif en moellons
box(-1.6, FY - 4.25, 0, 1.6, FY - 3.9, 1.0, 'porte_socle', mat_flat('porte', (0.2, 0.2, 0.22), 0.5))
for side in (-1, 1):                                                          # deux volées de marches sur les côtés
    for k in range(8):
        z1 = 1.35 * (k + 1) / 8; x0 = side * (4.2 + 2.6 - k * 0.32); x1 = side * 4.2
        box(min(x0, x1), FY - 4.2, 0, max(x0, x1), FY - 0.4, z1, f'marche', STEP)
box(-7.2, FY - 4.6, -0.02, 7.2, FY + 0.3, 0.02, 'parvis', PAVE)
for side in (-1, 1): box(min(side * 4.2, side * 6.8), FY - 0.45, 0, max(side * 4.2, side * 6.8), FY - 0.35, 1.35, 'joue', STONE)
# statue (métaballs) : femme assise levant une coupe enflammée
SX, SYc, SZ = 0.0, FY - 2.3, 1.35 + 1.55
# statue : squelette (sommets + arêtes) habillé par le modificateur Skin puis lissé
pts = {  # nom : (x, y, z, rayon)
 'bassin': (0, 0.05, 0.25, 0.42), 'genouG': (-0.32, -0.45, 0.1, 0.24), 'genouD': (0.32, -0.45, 0.1, 0.24), 'piedG': (-0.25, 0.35, 0.0, 0.16), 'piedD': (0.25, 0.35, 0.0, 0.16),
 'taille': (0, 0.0, 0.7, 0.3), 'poitrine': (0, -0.05, 1.1, 0.34), 'epaules': (0, 0.0, 1.38, 0.3), 'cou': (0, 0.0, 1.55, 0.1), 'tete': (0, -0.02, 1.78, 0.19), 'crane': (0, 0.02, 1.95, 0.15),
 'epG': (-0.3, 0.0, 1.4, 0.12), 'coudeG': (-0.36, -0.1, 1.9, 0.09), 'mainG': (-0.2, -0.16, 2.42, 0.08),
 'epD': (0.3, 0.0, 1.4, 0.12), 'coudeD': (0.36, -0.1, 1.9, 0.09), 'mainD': (0.2, -0.16, 2.42, 0.08), 'coupe': (0, -0.17, 2.55, 0.1)}
edges = [('bassin', 'genouG'), ('genouG', 'piedG'), ('bassin', 'genouD'), ('genouD', 'piedD'), ('bassin', 'taille'), ('taille', 'poitrine'), ('poitrine', 'epaules'), ('epaules', 'cou'), ('cou', 'tete'), ('tete', 'crane'),
 ('epaules', 'epG'), ('epG', 'coudeG'), ('coudeG', 'mainG'), ('epaules', 'epD'), ('epD', 'coudeD'), ('coudeD', 'mainD'), ('mainG', 'coupe'), ('mainD', 'coupe')]
names = list(pts); me = bpy.data.meshes.new('statue'); me.from_pydata([(SX + pts[n][0], SYc + pts[n][1], SZ + pts[n][2]) for n in names], [(names.index(a2), names.index(b2)) for a2, b2 in edges], [])
stat = bpy.data.objects.new('statue', me); col.objects.link(stat)
sk = stat.modifiers.new('skin', 'SKIN'); sk.use_smooth_shade = True
for i, n in enumerate(names): me.skin_vertices[0].data[i].radius = (pts[n][3], pts[n][3] * (0.85 if n in ('poitrine', 'bassin', 'taille') else 1))
me.skin_vertices[0].data[0].use_root = True
sub = stat.modifiers.new('sub', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
bpy.context.view_layer.objects.active = stat; stat.select_set(True)
for m in list(stat.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
stat.data.materials.append(STAT)
bm = bmesh.new(); r = bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.12, radius2=0.42, depth=0.16); bmesh.ops.translate(bm, vec=(SX, SYc - 0.17, SZ + 2.62), verts=r['verts'])
obj_from_bm(bm, 'coupe', STAT)
for k in range(3): box(SX - 0.9 + k * 0.6, SYc - 0.75, 1.35, SX - 0.5 + k * 0.6, SYc + 0.75, 1.35 + 1.0, 'pilier_socle', STAT)
box(SX - 1.0, SYc - 0.85, 1.35 + 1.0, SX + 1.0, SYc + 0.85, 1.35 + 1.25, 'dalle_socle', STAT)
box(SX - 0.75, SYc - 0.6, 1.35 + 1.25, SX + 0.75, SYc + 0.6, SZ - 0.05, 'assise', STAT)
# flamme en métal
fl = bpy.data.objects.new('flamme', bpy.data.meshes.new('flamme')); col.objects.link(fl)
bm = bmesh.new()
for k in range(5):
    a = k / 5 * 6.283; c = bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.08, radius2=0.0, depth=0.9)
    bmesh.ops.transform(bm, matrix=Matrix.Translation((SX + math.cos(a) * 0.12, SYc - 0.15 + math.sin(a) * 0.12, SZ + 3.1)) @ Matrix.Rotation(0.35, 4, Vector((math.sin(a), -math.cos(a), 0))), verts=c['verts'])
bm.to_mesh(fl.data); bm.free(); fl.data.materials.append(BRONZE)

# ---------- export intermédiaire ----------
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'monument_jeu.blend' if GAME else 'monument.blend'))
tris = sum(len(o.data.polygons) for o in col.objects if o.type == 'MESH')
print('OBJETS', len(col.objects), 'faces', tris)
