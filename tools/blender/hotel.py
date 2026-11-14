# Hôtel 2 Février (Lomé) : tour en mur-rideau bleu, pignons en marbre blanc, socle sur l'emprise OSM réelle, dôme géodésique
# Repère Blender : X = x_jeu - CX, Y = -(z_jeu - CZ), Z haut.  (glTF : +X, +Y haut, +Z = sud du jeu)
import bpy, bmesh, json, math, os
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
col = bpy.data.collections.new('hotel'); sc.collection.children.link(col)
CX, CZ = -901.0, 169.0                       # centre de la tour (Wikidata)
FP = json.load(open(os.path.join(D, '..', 'footprints.json')))['Hôtel 2 Février']
to_b = lambda gx, gz: (gx - CX, -(gz - CZ))
ax = Vector((0.8, -0.6, 0)); ay = Vector((0.6, 0.8, 0))   # grand axe / normale de la grande façade (vers le monument, au NE)
TW, TD, TH, PH = 50.0, 16.0, 100.0, 8.0

def img_mat(name, img, rough=0.5, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; N = m.node_tree.nodes; bs = N['Principled BSDF']; t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(D, img))
    m.node_tree.links.new(t.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = rough; bs.inputs['Metallic'].default_value = metal; return m
GLASS = img_mat('verre', 'h_glass.jpg', 0.1, 0.35); MARBLE = img_mat('marbre', 'h_marble.jpg', 0.45); POD = img_mat('socle', 'h_podium.jpg', 0.5)
ROOF = bpy.data.materials.new('toit'); ROOF.use_nodes = True; ROOF.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.35, 0.35, 0.36, 1)
DOME = bpy.data.materials.new('dome'); DOME.use_nodes = True; DOME.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.86, 0.87, 0.88, 1); DOME.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.35
STEEL = bpy.data.materials.new('acier'); STEEL.use_nodes = True; b = STEEL.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0.5, 0.5, 0.52, 1); b.inputs['Metallic'].default_value = 0.9

def quad(bm, uv, a, b2, c, d, u0, v0, u1, v1, mi):
    f = bm.faces.new((bm.verts.new(a), bm.verts.new(b2), bm.verts.new(c), bm.verts.new(d))); f.material_index = mi
    for lp, (u, v) in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uv].uv = (u, v)
# ---------- tour ----------
bm = bmesh.new(); uv = bm.loops.layers.uv.new()
c = Vector((0, 0, 0)); hx, hy = ax * (TW / 2), ay * (TD / 2)
P = [c - hx - hy, c + hx - hy, c + hx + hy, c - hx + hy]        # coins (sens direct)
z0, z1 = PH, TH
# grandes façades (verre) : arrière (-ay) et avant (+ay) ; la texture répète un module de 18 colonnes × 32 étages
quad(bm, uv, (*P[1][:2], z0), (*P[0][:2], z0), (*P[0][:2], z1), (*P[1][:2], z1), 0, 0, 1, 1, 0)
quad(bm, uv, (*P[3][:2], z0), (*P[2][:2], z0), (*P[2][:2], z1), (*P[3][:2], z1), 0, 0, 1, 1, 0)
# pignons (marbre)
quad(bm, uv, (*P[0][:2], z0), (*P[3][:2], z0), (*P[3][:2], z1), (*P[0][:2], z1), 0, 0, 1, 1, 1)
quad(bm, uv, (*P[2][:2], z0), (*P[1][:2], z0), (*P[1][:2], z1), (*P[2][:2], z1), 0, 0, 1, 1, 1)
# acrotère + toit
f = bm.faces.new([bm.verts.new((*p[:2], z1)) for p in P]); f.material_index = 2
bmesh.ops.reverse_faces(bm, faces=[f for f in bm.faces if f.material_index in (0, 1)]); bm.normal_update(); me = bpy.data.meshes.new('tour'); bm.to_mesh(me); bm.free(); tour = bpy.data.objects.new('hotel_tour', me); col.objects.link(tour)
for m in (GLASS, MARBLE, ROOF): tour.data.materials.append(m)
# ---------- socle sur l'emprise OSM ----------
pts = [to_b(*p) for p in FP[:-1]]
bm = bmesh.new(); uv = bm.loops.layers.uv.new(); n = len(pts); per = 0
for i in range(n):
    (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % n]; l = math.hypot(x1 - x0, y1 - y0)
    quad(bm, uv, (x0, y0, 0), (x1, y1, 0), (x1, y1, PH), (x0, y0, PH), per / 12, 0, (per + l) / 12, 1, 0); per += l
bm.normal_update()
tf = bm.faces.new([bm.verts.new((x, y, PH)) for x, y in pts]); tf.material_index = 1
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new('socle'); bm.to_mesh(me); bm.free(); pod = bpy.data.objects.new('hotel_socle', me); col.objects.link(pod); pod.data.materials.append(POD); pod.data.materials.append(ROOF)
# vérifier que les faces latérales pointent vers l'extérieur (sinon inverser l'ordre UV)
# ---------- dôme géodésique devant la façade (côté monument) ----------
bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=3, radius=9.0)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.5], context='VERTS')
dc = ay * 66 + ax * 6
bmesh.ops.translate(bm, vec=(dc.x, dc.y, 0), verts=bm.verts); me = bpy.data.meshes.new('dome'); bm.to_mesh(me); bm.free()
dome = bpy.data.objects.new('hotel_dome', me); col.objects.link(dome); dome.data.materials.append(DOME)
wf = dome.modifiers.new('wf', 'WIREFRAME'); wf.thickness = 0.12; wf.use_replace = False; wf.material_offset = 1; dome.data.materials.append(STEEL)
bpy.context.view_layer.objects.active = dome; dome.select_set(True); bpy.ops.object.modifier_apply(modifier='wf')
# ---------- antennes sur le toit ----------
bm = bmesh.new()
for (u, h, r) in ((-6, 22, 0.35), (-3, 9, 0.12), (2, 12, 0.12), (8, 7, 0.1), (14, 6, 0.1), (-14, 8, 0.1)):
    cc = ax * u; cone = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=r, radius2=r * 0.4, depth=h); bmesh.ops.translate(bm, vec=(cc.x, cc.y, TH + h / 2), verts=cone['verts'])
cyl = bmesh.ops.create_cube(bm, size=1.0); bmesh.ops.scale(bm, vec=(6, 4, 3), verts=cyl['verts']); bmesh.ops.translate(bm, vec=(0, 0, TH + 1.5), verts=cyl['verts'])
me = bpy.data.meshes.new('antennes'); bm.to_mesh(me); bm.free(); ant = bpy.data.objects.new('hotel_antennes', me); col.objects.link(ant); ant.data.materials.append(STEEL)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'hotel.blend'))
for o in col.objects:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(D, 'hotel.glb'), export_format='GLB', use_selection=True, export_yup=True, export_image_format='JPEG', export_jpeg_quality=85)
print('HOTEL', sum(len(o.data.polygons) for o in col.objects))
