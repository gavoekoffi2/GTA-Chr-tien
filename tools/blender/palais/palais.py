# Palais des Congrès de Lomé (Parlement) — emprise OSM réelle en étoile à trois ailes, façades vitrées sur pilotis,
# salle centrale ronde coiffée d'une couronne de pignons triangulaires, « corne » blanche à l'entrée côté monument.
import bpy, bmesh, json, math, os
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__)); G = json.load(open(os.path.join(D, 'pdc_geo.json')))
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
col = bpy.data.collections.new('palais'); sc.collection.children.link(col)
def img_mat(name, img, rough=0.5, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; b = N['Principled BSDF']; t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(D, img))
    m.node_tree.links.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
def flat(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
FAC = img_mat('pdc_facade', 'pdc_facade.jpg', 0.25); REZ = img_mat('pdc_rez', 'pdc_rez.jpg', 0.2); SAL = img_mat('pdc_salle', 'pdc_salle.jpg', 0.45)
WHITE = flat('pdc_blanc', (0.82, 0.82, 0.8), 0.5); ROOFG = flat('pdc_toit', (0.22, 0.24, 0.26), 0.5, 0.4); TERR = flat('pdc_terrasse', (0.55, 0.55, 0.53), 0.8)
def ring_walls(bm, uvl, pts, z0, z1, mi, umod, vspan):
    n = len(pts); per = 0.0
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]; l = math.hypot(b[0] - a[0], b[1] - a[1])
        f = bm.faces.new([bm.verts.new((a[0], a[1], z0)), bm.verts.new((b[0], b[1], z0)), bm.verts.new((b[0], b[1], z1)), bm.verts.new((a[0], a[1], z1))]); f.material_index = mi
        for lp, (u, v) in zip(f.loops, ((per / umod, 0), ((per + l) / umod, 0), ((per + l) / umod, vspan), (per / umod, vspan))): lp[uvl].uv = (u, v)
        per += l
def cap(bm, pts, z, mi, down=False):
    vs = [bm.verts.new((x, y, z)) for x, y in pts]; f = bm.faces.new(vs[::-1] if down else vs); f.material_index = mi; return f
outer, inner = G['outer'], G['inner']
area = lambda P: 0.5 * sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))
if area(outer) < 0: outer = outer[::-1]          # sens trigonométrique → murs orientés vers l'extérieur
if area(inner) < 0: inner = inner[::-1]
bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
ring_walls(bm, uvl, outer, 5.0, 14.0, 0, 12.0, 1.0)        # ailes : bandeau marbre + vitrage
ring_walls(bm, uvl, inner, 0.0, 5.0, 1, 6.0, 1.0)          # rez vitré en retrait
cap(bm, outer, 14.0, 4); cap(bm, outer, 5.0, 3, down=True)  # terrasse, sous-face de l'encorbellement
bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4], quad_method='BEAUTY', ngon_method='EAR_CLIP')
me = bpy.data.meshes.new('ailes'); bm.to_mesh(me); bm.free(); ailes = bpy.data.objects.new('pdc_ailes', me); col.objects.link(ailes)
for m in (FAC, REZ, SAL, WHITE, TERR): ailes.data.materials.append(m)
# pilotis le long du bord extérieur (tous les ~7 m)
bm = bmesh.new(); n = len(outer); acc = 0.0
for i in range(n):
    a, b = Vector((*outer[i], 0)), Vector((*outer[(i + 1) % n], 0)); l = (b - a).length; k = 0.0
    while acc + l > k + 7.0 * (1 if k else 0) and l > 0:
        t = (7.0 - acc) / l if k == 0 else (k + 7.0 - acc) / l
        if t > 1: break
        k = t * l + acc - 7.0 if False else t * l
        p = a + (b - a) * t; inward = Vector((-(b - a).y, (b - a).x, 0)).normalized() * 1.2
        c = bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.42, radius2=0.42, depth=5.0); bmesh.ops.translate(bm, vec=(p.x + inward.x, p.y + inward.y, 2.5), verts=c['verts'])
        acc = 0.0; a = p; l = (b - a).length
    acc += l
me = bpy.data.meshes.new('pilotis'); bm.to_mesh(me); bm.free(); pil = bpy.data.objects.new('pdc_pilotis', me); col.objects.link(pil); pil.data.materials.append(WHITE)
# salle centrale ronde + couronne de pignons
cx, cy = G['centre']; R = 21.0
bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); N = 48
pts = [(cx + R * math.cos(2 * math.pi * k / N), cy + R * math.sin(2 * math.pi * k / N)) for k in range(N)]
ring_walls(bm, uvl, pts, 14.0, 20.5, 0, 10.0, 6.5 / 8.0); cap(bm, pts, 20.5, 1)
me = bpy.data.meshes.new('salle'); bm.to_mesh(me); bm.free(); sal = bpy.data.objects.new('pdc_salle', me); col.objects.link(sal); sal.data.materials.append(SAL); sal.data.materials.append(ROOFG)
bm = bmesh.new(); NG = 18; R2 = R + 3.2; zr = 20.3
for k in range(NG):
    a0 = 2 * math.pi * k / NG; a1 = 2 * math.pi * (k + 1) / NG; am = (a0 + a1) / 2
    p0 = Vector((cx + R2 * math.cos(a0), cy + R2 * math.sin(a0), zr)); p1 = Vector((cx + R2 * math.cos(a1), cy + R2 * math.sin(a1), zr))
    tip = Vector((cx + (R2 + 1.6) * math.cos(am), cy + (R2 + 1.6) * math.sin(am), zr + 3.0))     # pointe du pignon, penchée vers l'extérieur
    inn0 = Vector((cx + (R - 6) * math.cos(a0), cy + (R - 6) * math.sin(a0), zr + 1.6)); inn1 = Vector((cx + (R - 6) * math.cos(a1), cy + (R - 6) * math.sin(a1), zr + 1.6))
    vs = [bm.verts.new(v) for v in (p0, p1, tip, inn0, inn1)]
    bm.faces.new((vs[0], vs[1], vs[2]))                       # face triangulaire du pignon
    bm.faces.new((vs[1], vs[4], vs[2])); bm.faces.new((vs[4], vs[3], vs[2])); bm.faces.new((vs[3], vs[0], vs[2]))   # pans de toiture vers le centre
centre_v = bm.verts.new((cx, cy, zr + 2.2))
ring = [Vector((cx + (R - 6) * math.cos(2 * math.pi * k / NG), cy + (R - 6) * math.sin(2 * math.pi * k / NG), zr + 1.6)) for k in range(NG)]
rv = [bm.verts.new(v) for v in ring]
for k in range(NG): bm.faces.new((rv[k], rv[(k + 1) % NG], centre_v))
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.01); bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new('couronne'); bm.to_mesh(me); bm.free(); cou = bpy.data.objects.new('pdc_couronne', me); col.objects.link(cou); cou.data.materials.append(ROOFG)
# « corne » blanche (sculpture de l'entrée) : cône courbé posé sur deux jambes, sur la façade côté monument
dirm = Vector((-0.932, -0.361, 0))          # direction du monument en repère Blender (Y = −z_jeu)
best = max(outer, key=lambda p: Vector((p[0] - cx, p[1] - cy, 0)).normalized().dot(dirm) * 0 + (Vector(p).to_3d() - Vector((cx, cy, 0))).dot(dirm))
# point de façade concave le plus proche du monument le long de la direction : on prend le milieu entre deux ailes
ent = Vector((cx, cy, 0)) + dirm * 24.0
bm = bmesh.new(); prof = []
for i in range(14):
    t = i / 13; r = 3.3 * (1 - t) ** 1.1 + 0.05; z = 6.6 + 12.5 * t; off = dirm * (4.5 * math.sin(t * math.pi * 0.5))
    prof.append([Vector((ent.x + off.x + r * math.cos(a), ent.y + off.y + r * math.sin(a), z)) for a in [k / 12 * 2 * math.pi for k in range(12)]])
rings = [[bm.verts.new(p) for p in ring] for ring in prof]
for i in range(13):
    for j in range(12): bm.faces.new((rings[i][j], rings[i][(j + 1) % 12], rings[i + 1][(j + 1) % 12], rings[i + 1][j]))
bm.faces.new(rings[0][::-1])
for s in (-1, 1):
    side = Vector((-dirm.y, dirm.x, 0)) * s
    c = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.7, radius2=0.45, depth=6.6)
    bmesh.ops.transform(bm, matrix=Matrix.Translation(ent + side * 1.9 + dirm * 0.8 + Vector((0, 0, 3.0))) @ Matrix.Rotation(-s * 0.22, 4, Vector((dirm.x, dirm.y, 0))), verts=c['verts'])
ring2 = bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=3.6, radius2=3.6, depth=1.2); bmesh.ops.translate(bm, vec=(ent.x, ent.y, 6.0), verts=ring2['verts'])
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new('corne'); bm.to_mesh(me); bm.free(); co = bpy.data.objects.new('pdc_corne', me); col.objects.link(co); co.data.materials.append(WHITE)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'palais.blend'))
for o in col.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(D, 'palais.glb'), export_format='GLB', use_selection=True, export_yup=True, export_image_format='JPEG')
print('PALAIS', sum(len(o.data.polygons) for o in col.objects), 'pilotis', len(pil.data.polygons) // 12)
