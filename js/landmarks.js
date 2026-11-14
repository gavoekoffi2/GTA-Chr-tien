// Monuments réels modélisés dans Blender (d'après photos), placés aux coordonnées OpenStreetMap / Wikidata.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
// rot : orientation de la façade avant (+Z du modèle) ; collide : rectangles locaux [x0, z0, x1, z1] (m)
export const MODELS = {
  lome: [
    { id: 'monument', name: "Monument de l'Indépendance", url: 'assets/landmarks/lome_monument.glb', x: -773.7, z: 4.4, rot: Math.atan2(0.8, 0.6), plaza: 'independance',
      collide: [[-4.75, -0.9, 4.75, 0.9], [-5.75, -2.3, -4.75, 2.3], [4.75, -2.3, 5.75, 2.3], [-9.5, 2.0, -5.6, 7.6], [-9.5, -7.6, -5.6, -2.0], [5.6, 2.0, 9.5, 7.6], [5.6, -7.6, 9.5, -2.0], [-7, 0.9, 7, 5.6]] },
    { id: 'hotel2fevrier', name: 'Hôtel 2 Février', url: 'assets/landmarks/lome_hotel2fevrier.glb', x: -901, z: 169, rot: 0, y: 0, clear: [[-885, 156, 12], [-861, 120, 9]],
      collideWorld: [[-878.9, 113.3, -892.5, 98.7, -914.0, 114.9, -929.9, 137.0, -894.1, 161.4, -899.0, 166.8, -908.2, 159.2, -930.5, 178.0, -940.1, 200.5, -916.6, 218.4, -894.4, 201.5, -887.0, 178.3, -893.4, 171.7, -888.3, 165.9, -871.8, 184.1, -852.2, 165.3, -849.7, 167.1, -848.3, 165.3, -846.5, 166.6, -835.2, 142.5, -852.6, 133.9, -863.9, 126.2, -869.3, 121.6]], collideRot: { cx: -901, cz: 169, ax: [0.8, 0.6], ay: [0.6, -0.8], w: 50, d: 16 } },
  ],
};

export function clearZones(cityId) { return (MODELS[cityId] || []).flatMap(m => m.clear || []); }

export function preloadLandmarks(cityId) {
  const list = MODELS[cityId] || [];
  return Promise.all(list.map(m => loader.loadAsync(m.url).then(g => ({ def: m, scene: g.scene })).catch(e => { console.warn('monument non chargé', m.url, e); return null; }))).then(a => a.filter(Boolean));
}

function prepare(root) {
  root.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    const m = o.material; if (!m) return;
    const n = (m.name || '') + ' ' + (o.name || '');
    if (/perce/.test(n)) { m.alphaTest = 0.5; m.transparent = false; m.side = THREE.DoubleSide; }
    if (/texte|relief/.test(n)) { m.alphaTest = 0.35; m.transparent = false; m.polygonOffset = true; m.polygonOffsetFactor = -2; }
    if (/beton|socle/.test(n)) m.color.set(0xf2d3a8);          // teinte ocre du béton de Lomé
    if (/statue/.test(n)) m.color.set(0xc9c2b6);
    if (/bronze|flamme/.test(n)) { m.metalness = 0.85; m.roughness = 0.35; }
    else if (/verre/.test(n)) { m.metalness = 0.45; m.roughness = 0.12; m.color.set(0xaab6c2); }
    else if (/acier|dome|marbre|socle_mat|toit/.test(m.name || '')) { /* matières de l'hôtel : garder les valeurs */ }
    else if (m.roughness !== undefined) m.roughness = Math.max(m.roughness, 0.85);
  });
}

// place autour du monument de l'Indépendance : esplanade dallée, pelouse surélevée, bassin bleu, lampadaires à globes, buis taillés
function plazaIndependance(w, x, z, rot) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; w.group.add(g);
  const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.85, ...o });
  const disc = (r0, r1, y, mat, seg = 72) => { const m = new THREE.Mesh(r0 ? new THREE.RingGeometry(r0, r1, seg, 1) : new THREE.CircleGeometry(r1, seg), mat); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; g.add(m); return m; };
  const cvTex = (draw, rep) => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; draw(cv.getContext('2d')); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  let sd = 7; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const paveT = cvTex(c => { c.fillStyle = '#9e9284'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = 168 + rr() * 26; c.fillStyle = `rgb(${v},${v - 8},${v - 22})`; c.fillRect(i * 64 + 1.5, j * 64 + 1.5, 61, 61); }
    for (let k = 0; k < 900; k++) { c.fillStyle = `rgba(60,50,40,${rr() * 0.12})`; c.fillRect(rr() * 256, rr() * 256, 2, 2); } }, 34);
  disc(0, 62, 0.04, std({ map: paveT, roughness: 0.6 }));
  const grassT = cvTex(c => { c.fillStyle = '#3b5a20'; c.fillRect(0, 0, 256, 256); for (let k = 0; k < 6000; k++) { const v = rr(); c.fillStyle = `rgba(${30 + v * 60},${60 + v * 55},${15 + v * 25},0.6)`; c.fillRect(rr() * 256, rr() * 256, 1.5, 3); } }, 14);
  // allée dallée sombre vers l'avant (axe de la statue)
  const al = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), std({ color: 0x6f675d, roughness: 0.6 })); al.rotation.x = -Math.PI / 2; al.position.set(0, 0.05, 30); g.add(al);
  const grass = std({ map: grassT, roughness: 0.95 });
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(24, 26, 0.6, 72), grass); mound.position.y = 0.3; mound.receiveShadow = true; g.add(mound);
  const rim = std({ color: 0xe7dccb, roughness: 0.6 }); const rimM = new THREE.Mesh(new THREE.TorusGeometry(30.5, 0.35, 6, 96), rim); rimM.rotation.x = Math.PI / 2; rimM.position.y = 0.35; g.add(rimM);
  const rimI = new THREE.Mesh(new THREE.TorusGeometry(26.6, 0.35, 6, 96), rim); rimI.rotation.x = Math.PI / 2; rimI.position.y = 0.35; g.add(rimI);
  const water = disc(26.6, 30.5, 0.22, std({ color: 0x2f7fb8, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.92 }), 96); water.renderOrder = 1;
  disc(26.6, 30.5, 0.06, std({ color: 0x3aa6d8 }), 96);
  // buis taillés et lauriers roses sur la pelouse
  const leafT = cvTex(c => { c.fillStyle = '#2f5a1c'; c.fillRect(0, 0, 256, 256); for (let k = 0; k < 2500; k++) { const v = rr(); c.fillStyle = `rgba(${30 + v * 60},${70 + v * 70},${20 + v * 25},0.8)`; c.beginPath(); c.arc(rr() * 256, rr() * 256, 2 + rr() * 3, 0, 7); c.fill(); } }, 2);
  const bush = std({ map: leafT, roughness: 0.95 }), rose = std({ map: leafT, color: 0xf0b0c0, roughness: 0.9 });
  for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2 + 0.07, r = 18 + (k % 3) * 1.6; if (Math.abs(Math.sin(a)) > 0.92 && Math.cos(a) > 0) continue;
    const bg = new THREE.IcosahedronGeometry(0.9 + (k % 2) * 0.3, 2), pa = bg.attributes.position; for (let i = 0; i < pa.count; i++) { const f = 1 + (rr() - 0.5) * 0.18; pa.setXYZ(i, pa.getX(i) * f, pa.getY(i) * f, pa.getZ(i) * f); } bg.computeVertexNormals();
    const b = new THREE.Mesh(bg, k % 7 === 0 ? rose : bush); b.scale.y = 0.8; b.position.set(Math.sin(a) * r, 1.2, Math.cos(a) * r); b.castShadow = true; g.add(b); }
  // lampadaires à globes blancs
  const pole = std({ color: 0x2d2f33, metalness: 0.6, roughness: 0.4 }), globeM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 0.25, roughness: 0.3 });
  w.nightMats.push(globeM);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = 40;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 6), pole); p.position.set(Math.sin(a) * r, 2.1, Math.cos(a) * r); g.add(p);
    for (const s of [-1, 1]) { const gl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), globeM); gl.position.set(Math.sin(a) * r + Math.cos(a) * s * 0.55, 4.3, Math.cos(a) * r - Math.sin(a) * s * 0.55); g.add(gl); }
    w.collide(x + Math.sin(a + rot) * r - 0.2, z + Math.cos(a + rot) * r - 0.2, x + Math.sin(a + rot) * r + 0.2, z + Math.cos(a + rot) * r + 0.2); }
}

export function placeLandmarks(w, loaded) {
  for (const { def, scene } of loaded) {
    prepare(scene); scene.position.set(def.x, def.y ?? 0.62, def.z); scene.rotation.y = def.rot; w.group.add(scene);
    if (def.collideWorld) w.addPoly(def.collideWorld);
    if (def.collideRot) { const r = def.collideRot, hx = r.w / 2, hy = r.d / 2, P = (a, b) => [r.cx + r.ax[0] * a + r.ay[0] * b, r.cz + r.ax[1] * a + r.ay[1] * b]; w.addPoly([...P(-hx, -hy), ...P(hx, -hy), ...P(hx, hy), ...P(-hx, hy)]); }
    const cs = Math.cos(def.rot), sn = Math.sin(def.rot), tw = (lx, lz) => [def.x + lx * cs + lz * sn, def.z - lx * sn + lz * cs];
    for (const [x0, z0, x1, z1] of def.collide || []) w.addPoly([...tw(x0, z0), ...tw(x1, z0), ...tw(x1, z1), ...tw(x0, z1)]);
    if (def.plaza === 'independance') plazaIndependance(w, def.x, def.z, def.rot);
  }
}
