import bpy, math, sys, os
from mathutils import Vector
D = os.path.dirname(os.path.abspath(__file__)); argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
blend, out, views = argv[0], argv[1], argv[2].split(';')
bpy.ops.wm.open_mainfile(filepath=os.path.join(D, blend)); sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(argv[3]) if len(argv) > 3 else 48; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 960, 540; sc.render.film_transparent = False
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; sky = nt.nodes.new('ShaderNodeTexSky'); sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(35); sky.sun_rotation = math.radians(140)
nt.links.new(sky.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.35
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3.5; sun.rotation_euler = (math.radians(50), 0, math.radians(140)); sc.collection.objects.link(sun)
g = bpy.data.objects.new('sol', bpy.data.meshes.new('sol')); import bmesh; bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=120); bm.to_mesh(g.data); bm.free(); sc.collection.objects.link(g)
gm = bpy.data.materials.new('sol'); gm.use_nodes = True; gm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.35, 0.42, 0.25, 1); g.data.materials.append(gm)
sc.view_settings.view_transform = 'AgX'
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
for i, v in enumerate(views):
    px, py, pz, tx, ty, tz, lens = map(float, v.split(','))
    cam.location = (px, py, pz); cam.data.lens = lens; d = Vector((tx, ty, tz)) - cam.location; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(D, f'{out}_{i}.png'); bpy.ops.render.render(write_still=True)
