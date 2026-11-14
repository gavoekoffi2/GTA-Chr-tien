# Monuments réels modélisés dans Blender (4.5 LTS)

Chaque monument est construit par un script Python (`bpy`) d'après des photos réelles (Wikimedia Commons) et les
plans OpenStreetMap / Wikidata, puis exporté en glTF (`assets/landmarks/`) avec les textures « cuites »
(couleur × occlusion ambiante) pour rester léger sur téléphone. `js/landmarks.js` les place aux coordonnées réelles.

| Monument | Script | Références |
|---|---|---|
| Monument de l'Indépendance (Lomé) | `monument.py` (+ `hole_m.json` : silhouette découpée relevée sur photo) | photos Commons « Monument de l'Indépendance, Lomé », Wikidata Q39048890 |
| Colombe de la Paix (Lomé, place de la Paix) | `colombe.py` | photos Commons « Peace dove statue in Lomé », position OSM (rond-point Place de la Paix) |
| Hôtel 2 Février (Lomé) | `hotel.py` (emprise du socle : `footprints.json`, OSM) | photos Commons « Hotel 2 Fevrier, Lomé », Wikidata Q1643159 |

Refaire : `GAME=1 blender -b --python monument.py` → `blender -b --python bake_export.py -- monument_jeu.blend sortie.glb "groupes"`
→ `npx @gltf-transform/cli quantize`. Contrôle visuel : `blender -b --python preview.py -- fichier.blend prefixe "vues" 32`.

La carte de Lomé a été agrandie vers le nord (bbox 6.107–6.153) en gardant le même centre, pour inclure la place de la Paix ;
seuls les bâtiments proches de l'axe menant au monument sont ajoutés (`extension` dans `tools/cities.json`).
