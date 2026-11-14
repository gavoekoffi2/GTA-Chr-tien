# Cuisson des matières procédurales (couleur × occlusion ambiante) puis export glTF binaire pour le jeu
# usage : blender -b --python bake_export.py -- fichier.blend sortie.glb 'groupe:prefixe1,prefixe2:res;...' [samples_ao]
import bpy, sys, os, json
D = os.path.dirname(os.path.abspath(__file__)); argv = sys.argv[sys.argv.index('--') + 1:]
blend, out, spec = argv[0], argv[1], argv[2]; ao_samples = int(argv[3]) if len(argv) > 3 else 48
bpy.ops.wm.open_mainfile(filepath=os.path.join(D, blend)); sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = ao_samples
def sel(objs, active):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = active
used = set()
for g in spec.split(';'):
    name, prefs, res = g.split(':'); res = int(res); prefs = prefs.split(',')
    objs = [o for o in bpy.data.objects if o.type == 'MESH' and o.name not in used and any(o.name.startswith(p) for p in prefs)]
    if not objs: print('groupe vide', name); continue
    used.update(o.name for o in objs)
    sel(objs, objs[0])
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(objs) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active; ob.name = name
    # UV automatiques
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.004, area_weight=0.0, scale_to_bounds=False); bpy.ops.object.mode_set(mode='OBJECT')
    imgs = {}
    for kind in ('DIFFUSE', 'AO'):
        im = bpy.data.images.new(f'{name}_{kind}', res, res, alpha=False); im.colorspace_settings.name = 'sRGB' if kind == 'DIFFUSE' else 'Non-Color'; imgs[kind] = im
        for m in ob.data.materials:
            nt = m.node_tree; n = nt.nodes.get('bake_img') or nt.nodes.new('ShaderNodeTexImage'); n.name = 'bake_img'; n.image = im
            for x in nt.nodes: x.select = False
            n.select = True; nt.nodes.active = n
        sel([ob], ob)
        sc.render.bake.margin = 6
        if kind == 'DIFFUSE': sc.cycles.samples = 4; bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, use_clear=True)
        else: sc.cycles.samples = ao_samples; sc.world = sc.world or bpy.data.worlds.new('w'); bpy.ops.object.bake(type='AO', use_clear=True)
        im.filepath_raw = os.path.join(D, f'{name}_{kind}.png'); im.file_format = 'PNG'; im.save()
    # couleur finale = albedo × (0.35 + 0.65 × AO), calculée hors Blender pour la précision
    import numpy as np
    a = np.array(imgs['DIFFUSE'].pixels[:]).reshape(res, res, 4); o2 = np.array(imgs['AO'].pixels[:]).reshape(res, res, 4)
    lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4); srgb = lambda c: np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, 1), 1 / 2.4) - 0.055)
    f = srgb(lin(a[..., :3]) * (0.35 + 0.65 * o2[..., :1])); fin = bpy.data.images.new(f'{name}_tex', res, res, alpha=False)
    fin.pixels[:] = np.concatenate([f, np.ones((res, res, 1))], 2).ravel(); fin.filepath_raw = os.path.join(D, f'{name}_tex.jpg'); fin.file_format = 'JPEG'; sc.render.image_settings.quality = 88; fin.save()
    fin.pack()
    # matière simple pour l'export : texture cuite
    mm = bpy.data.materials.new(name + '_mat'); mm.use_nodes = True; bs = mm.node_tree.nodes['Principled BSDF']; tx = mm.node_tree.nodes.new('ShaderNodeTexImage'); tx.image = fin
    mm.node_tree.links.new(tx.outputs['Color'], bs.inputs['Base Color']); bs.inputs['Roughness'].default_value = 0.88
    ob.data.materials.clear(); ob.data.materials.append(mm)
    print('CUIT', name, len(ob.data.polygons))
# exporter : groupes cuits + objets à texture d'image (plaques)
keep = [o for o in bpy.data.objects if o.type == 'MESH']
for o in keep:
    for m in o.data.materials:
        if m and m.node_tree:
            for n in m.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image: n.image.pack() if not n.image.packed_file else None
sel(keep, keep[0])
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True, export_apply=True, export_image_format='AUTO', export_materials='EXPORT', export_yup=True)
print('EXPORT', out, os.path.getsize(out))
