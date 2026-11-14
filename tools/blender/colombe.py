# Colombe de la Paix (Lomé, place de la Paix) — d'après photos Commons. Hauteur totale ≈ 19 m, base ≈ 18 m.
import bpy, bmesh, math, os
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
col = bpy.data.collections.new('colombe'); sc.collection.children.link(col)
def obj(bm, name, mat):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); col.objects.link(o); o.data.materials.append(mat); return o
def marble(name, base=(0.80, 0.78, 0.74), vein=(0.55, 0.53, 0.50)):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; Lk = m.node_tree.links; bs = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); n = N.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 1.6; n.inputs['Detail'].default_value = 10; n.inputs['Distortion'].default_value = 4; Lk.new(tc.outputs['Object'], n.inputs['Vector'])
    vo = N.new('ShaderNodeTexVoronoi'); vo.feature = 'DISTANCE_TO_EDGE'; vo.inputs['Scale'].default_value = 1.4; Lk.new(tc.outputs['Object'], vo.inputs['Vector'])   # joints de plaques
    rr = N.new('ShaderNodeMapRange'); rr.inputs['From Min'].default_value = 0.0; rr.inputs['From Max'].default_value = 0.03; Lk.new(vo.outputs['Distance'], rr.inputs['Value'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*vein, 1); cr.color_ramp.elements[1].color = (*base, 1); cr.color_ramp.elements[0].position = 0.35; Lk.new(n.outputs['Fac'], cr.inputs['Fac'])
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs[6].default_value = (0.42, 0.40, 0.37, 1); Lk.new(rr.outputs['Result'], mx.inputs[0]); Lk.new(cr.outputs['Color'], mx.inputs[7])
    Lk.new(mx.outputs[2], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.4
    return m
MAR = marble('marbre')
FEATH = marble('plumes', (0.9, 0.89, 0.86), (0.72, 0.71, 0.68)); _n = FEATH.node_tree.nodes; _l = FEATH.node_tree.links
_w = _n.new('ShaderNodeTexWave'); _w.wave_type = 'BANDS'; _w.bands_direction = 'X'; _w.inputs['Scale'].default_value = 2.2; _w.inputs['Distortion'].default_value = 0.6
_tc = _n.new('ShaderNodeTexCoord'); _l.new(_tc.outputs['Object'], _w.inputs['Vector'])
_b = _n.new('ShaderNodeBump'); _b.inputs['Strength'].default_value = 0.8; _l.new(_w.outputs['Fac'], _b.inputs['Height']); _l.new(_b.outputs['Normal'], _n['Principled BSDF'].inputs['Normal'])
_c = _n.new('ShaderNodeMix'); _c.data_type = 'RGBA'; _c.inputs[7].default_value = (0.55, 0.54, 0.51, 1)
_r = _n.new('ShaderNodeMapRange'); _r.inputs['From Min'].default_value = 0.85; _r.inputs['From Max'].default_value = 1.0; _l.new(_w.outputs['Fac'], _r.inputs['Value'])
_bc = _n['Principled BSDF'].inputs['Base Color'].links[0].from_socket; _l.new(_bc, _c.inputs[6]); _l.new(_r.outputs['Result'], _c.inputs[0]); _l.new(_c.outputs[2], _n['Principled BSDF'].inputs['Base Color'])
MARD = marble('marbre_sombre', (0.62, 0.58, 0.52), (0.42, 0.39, 0.35)); WHITE = marble('pierre_blanche', (0.88, 0.87, 0.84), (0.7, 0.69, 0.66))
# ---------- 8 jambages courbes ----------
NB, R0, R1, HT = 8, 8.4, 1.55, 10.6
for k in range(NB):
    a = k / NB * 2 * math.pi + math.pi / 8
    d = Vector((math.cos(a), math.sin(a), 0)); t = Vector((-d.y, d.x, 0))
    bm = bmesh.new(); prof = []
    S = 18
    for i in range(S + 1):
        u = i / S; r = R1 + (R0 - R1) * (1 - u) ** 2.1; z = HT * u ** 0.85; w = (0.4 + 1.9 * min(1, u * 7)) * (1 - 0.6 * u); th = 0.42 - 0.15 * u
        c = d * r + Vector((0, 0, z)); prof.append([c - t * w / 2 - d * th / 2, c + t * w / 2 - d * th / 2, c + t * w / 2 + d * th / 2, c - t * w / 2 + d * th / 2])
    rings = [[bm.verts.new(p) for p in ring] for ring in prof]
    for i in range(S):
        for j in range(4): bm.faces.new((rings[i][j], rings[i][(j + 1) % 4], rings[i + 1][(j + 1) % 4], rings[i + 1][j]))
    bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1]); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # pied biseauté (photo : extrémités taillées en pointe)
    obj(bm, f'jambage_{k}', MAR)
    # contre-fiche intérieure plus courte (deuxième nervure visible sur la photo)
    bm = bmesh.new(); prof = []
    for i in range(S + 1):
        u = i / S; r = R1 * 0.8 + (R0 * 0.62 - R1 * 0.8) * (1 - u) ** 1.6; z = HT * 0.78 * u ** 0.9; w = 0.55 - 0.25 * u; th = 0.35
        c = d * r + Vector((0, 0, z)) + t * 0.0; prof.append([c - t * w / 2 - d * th / 2, c + t * w / 2 - d * th / 2, c + t * w / 2 + d * th / 2, c - t * w / 2 + d * th / 2])
    rings = [[bm.verts.new(p) for p in ring] for ring in prof]
    for i in range(S):
        for j in range(4): bm.faces.new((rings[i][j], rings[i][(j + 1) % 4], rings[i + 1][(j + 1) % 4], rings[i + 1][j]))
    bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1]); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); obj(bm, f'nervure_{k}', MARD)
# ---------- colonne centrale évasée (tour en plaques) ----------
bm = bmesh.new(); prof = [(1.9, 0), (1.5, 1.0), (1.05, 3.0), (0.85, 5.5), (0.9, 7.5), (1.15, 9.2), (1.55, 10.4), (1.6, 10.9), (1.2, 11.0)]
rings = []
for (r, z) in prof:
    rings.append([bm.verts.new((r * math.cos(a), r * math.sin(a), z)) for a in [i / 24 * 2 * math.pi for i in range(24)]])
for i in range(len(rings) - 1):
    for j in range(24): bm.faces.new((rings[i][j], rings[i][(j + 1) % 24], rings[i + 1][(j + 1) % 24], rings[i + 1][j]))
bm.faces.new(rings[-1]); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); obj(bm, 'colonne', MARD)
# ---------- globe ----------
bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=1.45); bmesh.ops.translate(bm, vec=(0, 0, 12.3), verts=bm.verts); obj(bm, 'globe', MARD)
# ---------- colombe (squelette + Skin), ailes levées, rameau d'olivier ----------
pts = {'queue': (-2.4, 0, 0.3, 0.3), 'croupion': (-1.5, 0, 0.45, 0.45), 'ventre': (-0.4, 0, 0.35, 0.75), 'poitrail': (0.6, 0, 0.75, 0.62), 'cou': (1.2, 0, 1.25, 0.34), 'tete': (1.65, 0, 1.55, 0.33), 'bec': (2.2, 0, 1.45, 0.08)}
names = list(pts); edges = [(names[i], names[i + 1]) for i in range(len(names) - 1)]
me = bpy.data.meshes.new('corps'); me.from_pydata([pts[n][:3] for n in names], [(names.index(a), names.index(b)) for a, b in edges], [])
body = bpy.data.objects.new('colombe_corps', me); col.objects.link(body)
sk = body.modifiers.new('skin', 'SKIN'); sk.use_smooth_shade = True
for i, n in enumerate(names): r = pts[n][3]; me.skin_vertices[0].data[i].radius = (r * (0.25 if n == 'queue' else 1), r * (2.0 if n == 'queue' else 0.85))
sub = body.modifiers.new('sub', 'SUBSURF'); sub.levels = 2
bpy.context.view_layer.objects.active = body; body.select_set(True)
for m in list(body.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
body.data.materials.append(WHITE)
def wing(side, name, tilt):
    """Aile levée : silhouette pleine (épaule → poignet → rémiges festonnées), épaissie et légèrement cambrée."""
    # contour dans le plan de l'aile : u = vers l'arrière (−X du corps), v = vers le haut le long de l'aile
    out = [(0.55, 0.0), (0.75, 0.9), (0.62, 1.9), (0.35, 2.75), (0.05, 3.25)]          # bord d'attaque (avant), de l'épaule à la pointe
    tips = []
    for f in range(8):                                                                # rémiges : festons du bord de fuite
        t = f / 7; base_u = -0.05 - 1.15 * t; base_v = 3.25 - 1.9 * t ** 1.2
        tips += [(base_u - 0.18, base_v - 0.05), (base_u - 0.28, base_v - 0.32)]
    back = [(-1.35, 0.9), (-1.0, 0.45), (-0.45, 0.05)]
    poly = out + tips + back
    bm = bmesh.new(); vs = [bm.verts.new((u, 0, v)) for u, v in poly]; f = bm.faces.new(vs)
    bmesh.ops.triangulate(bm, faces=[f], quad_method='BEAUTY', ngon_method='EAR_CLIP')
    for v in bm.verts: v.co.y = 0.12 * math.sin(v.co.z / 3.3 * math.pi) * side          # cambrure
    o = obj(bm, name, FEATH); so = o.modifiers.new('ep', 'SOLIDIFY'); so.thickness = 0.14; so.offset = 0
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='ep')
    o.data.polygons.foreach_set('use_smooth', [True] * len(o.data.polygons))
    o.matrix_basis = Matrix.Translation((0.25, side * 0.42, 1.0)) @ Matrix.Rotation(side * math.radians(tilt), 4, 'X') @ Matrix.Rotation(math.radians(-8), 4, 'Y')
    return o
wing(1, 'aile_g', 14); wing(-1, 'aile_d', 22)
# rameau d'olivier dans le bec
bm = bmesh.new()
for k in range(5):
    c = bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.06, radius2=0.0, depth=0.35); bmesh.ops.transform(bm, matrix=Matrix.Translation((2.2 + 0.05 * k, (-1) ** k * 0.08, 1.3 - 0.12 * k)) @ Matrix.Rotation(1.2, 4, 'X'), verts=c['verts'])
obj(bm, 'rameau', MARD)
for n in ('colombe_corps', 'aile_g', 'aile_d', 'rameau'):
    o = bpy.data.objects[n]; o.matrix_basis = Matrix.Translation((0, 0, 13.45)) @ Matrix.Scale(1.4, 4) @ o.matrix_basis
# ---------- dalle circulaire et bordure ----------
bm = bmesh.new(); r = bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=11.5, radius2=11.5, depth=0.12); bmesh.ops.translate(bm, vec=(0, 0, 0.06), verts=r['verts'])
obj(bm, 'dalle', marble('dallage', (0.72, 0.66, 0.6), (0.6, 0.55, 0.5)))
bm = bmesh.new(); r = bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=3.4, radius2=3.2, depth=0.4); bmesh.ops.translate(bm, vec=(0, 0, 0.2), verts=r['verts']); obj(bm, 'marche', MARD)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'colombe.blend'))
print('COLOMBE', sum(len(o.data.polygons) for o in col.objects))
