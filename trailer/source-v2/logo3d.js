// Logo 3D « ZION CITY » : lettres extrudées en or, reflets, balayage de lumière, bloom — rendu déterministe render(t)
import * as THREE from 'three';
import { RoomEnvironment } from './lib/environments/RoomEnvironment.js';
import { EffectComposer } from './lib/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './lib/postprocessing/OutputPass.js';

function pathToShapes(d, scale, ox) {
  // commandes SVG simples (M L Q C Z) issues de fontTools → THREE.Shape avec trous
  const toks = d.match(/[MLHVQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi); const polys = []; let cur = null, i = 0, cmd = '', cx = 0, cy = 0;
  const num = () => +toks[i++];
  while (i < toks.length) {
    if (/[MLHVQCZ]/i.test(toks[i])) cmd = toks[i++].toUpperCase();
    if (cmd === 'M') { cx = num(); cy = num(); cur = new THREE.Path(); cur.moveTo((cx + ox) * scale, cy * scale); polys.push(cur); cmd = 'L'; }
    else if (cmd === 'L') { cx = num(); cy = num(); cur.lineTo((cx + ox) * scale, cy * scale); }
    else if (cmd === 'H') { cx = num(); cur.lineTo((cx + ox) * scale, cy * scale); }
    else if (cmd === 'V') { cy = num(); cur.lineTo((cx + ox) * scale, cy * scale); }
    else if (cmd === 'Q') { const a = num(), b = num(); cx = num(); cy = num(); cur.quadraticCurveTo((a + ox) * scale, b * scale, (cx + ox) * scale, cy * scale); }
    else if (cmd === 'C') { const a = num(), b = num(), c = num(), e = num(); cx = num(); cy = num(); cur.bezierCurveTo((a + ox) * scale, b * scale, (c + ox) * scale, e * scale, (cx + ox) * scale, cy * scale); }
    else if (cmd === 'Z') { cur.closePath(); cmd = ''; }
    else i++;
  }
  const items = polys.map(p => { const pts = p.getPoints(8); return { p, pts, area: THREE.ShapeUtils.area(pts) }; });
  const big = Math.max(...items.map(o => Math.abs(o.area)));
  const outerSign = Math.sign(items.find(o => Math.abs(o.area) === big).area);
  const outers = items.filter(o => Math.sign(o.area) === outerSign), holes = items.filter(o => Math.sign(o.area) !== outerSign);
  const inside = (pt, poly) => { let c = false; for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) { const A = poly[a], B = poly[b]; if (((A.y > pt.y) !== (B.y > pt.y)) && pt.x < (B.x - A.x) * (pt.y - A.y) / (B.y - A.y) + A.x) c = !c; } return c; };
  return outers.map(o => { const s = new THREE.Shape(o.pts); for (const h of holes) if (inside(h.pts[0], o.pts)) s.holes.push(new THREE.Path(h.pts)); return s; });
}

export async function createLogo(canvas, W, H) {
  console.log('logo: fetch'); const G = await (await fetch('fonts/cinzel_glyphs.json')).json(); console.log('logo: glyphs');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H, false); renderer.setPixelRatio(1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentRotation.set(0.5, 2.3, 0);
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd99a2b, metalness: 1, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: 0.85 });
  const goldSide = new THREE.MeshPhysicalMaterial({ color: 0x9a6418, metalness: 1, roughness: 0.35, envMapIntensity: 1.0 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xdcd6cc, metalness: 0.85, roughness: 0.32, envMapIntensity: 0.9 });
  const letters = [];
  function word(txt, size, y, mat, depth, track) {
    const sc = size / G.upm; let x = 0; const adv = [];
    for (const ch of txt) { if (ch === ' ') { x += 300; continue; } adv.push([ch, x]); x += G.glyphs[ch].adv + track; }
    const total = (x - track) * sc;
    for (const [ch, x0] of adv) {
      const shapes = pathToShapes(G.glyphs[ch].d, sc, 0);
      const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: depth * 0.18, bevelSize: size * 0.012, bevelSegments: 4, curveSegments: 10 });
      geo.computeBoundingBox(); const bb = geo.boundingBox; const cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
      geo.translate(-cx, -cy, -depth / 2);
      const m = new THREE.Mesh(geo, [mat, mat === gold ? goldSide : mat]);
      const home = new THREE.Vector3(x0 * sc + cx - total / 2, y + cy, 0); m.position.copy(home); scene.add(m);
      letters.push({ m, home, i: letters.length });
    }
  }
  word('ZION', 3.2, 0.55, gold, 0.55, 90);
  word('CITY', 1.15, -1.75, white, 0.22, 380);
  // filets dorés de part et d'autre de CITY
  const bars = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), gold); b.position.set(s * 3.55, -1.62, 0); scene.add(b); return b; });
  const key = new THREE.PointLight(0xfff1d0, 0, 30, 1.5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd59a, 1.2); rim.position.set(-4, 6, -6); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  // poussière d'or
  const N = 900, pos = new Float32Array(N * 3), seed = []; let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) seed.push([rnd() * 16 - 8, rnd() * 9 - 4.5, rnd() * 8 - 5, rnd()]);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd98a, size: 0.035, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(dust);
  console.log('logo: geo ok'); const comp = new EffectComposer(renderer); comp.setSize(W, H); comp.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.4, 0.45, 0.93); comp.addPass(bloom); comp.addPass(new OutputPass());
  const eo = x => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3, cl = x => Math.min(1, Math.max(0, x));
  return {
    render(t, up = 0) {
      // t : secondes depuis l'apparition ; up : 0→1 quand le logo remonte pour l'écran de fin
      for (const L of letters) {
        const k = eo((t - 0.05 * L.i) / 1.3); const m = L.m;
        m.position.set(L.home.x * (1 + 1.8 * (1 - k)), L.home.y + (1 - k) * (L.i % 2 ? 3 : -3), (1 - k) * (14 + L.i * 2));
        m.rotation.set((1 - k) * 2.2 * (L.i % 2 ? 1 : -1), (1 - k) * 3.0 + Math.sin(t * 0.6 + L.i) * 0.03, 0);
      }
      bars.forEach((b, j) => { b.scale.x = eo((t - 1.0) / 0.8) + 1e-3; });
      const sweep = -9 + 18 * cl((t - 0.9) / 2.2) + Math.max(0, t - 3.1) * 0; key.position.set(sweep, 1.5, 3.2); key.intensity = 30 * Math.sin(Math.PI * cl((t - 0.9) / 2.2)) + 3;
      for (let i = 0; i < N; i++) { const q = seed[i]; pos[i * 3] = q[0] + Math.sin(t * 0.3 + q[3] * 9) * 0.3; pos[i * 3 + 1] = ((q[1] + t * (0.15 + q[3] * 0.25) + 4.5) % 9) - 4.5; pos[i * 3 + 2] = q[2]; }
      pg.attributes.position.needsUpdate = true; dust.material.opacity = 0.7 * cl(t / 1.0);
      const z = (25 - 4.5 * eo(t / 2.5) - 0.18 * Math.min(t, 5)) * (W < H ? 2.35 : 1); cam.position.set(Math.sin(t * 0.25) * 0.8, 0.25 + up * 0.0, z); cam.lookAt(0, -0.3, 0);
      cam.position.y += up * 0; scene.position.y = up * 1.55; scene.scale.setScalar(1 - 0.45 * up);
      bloom.strength = 0.28 + 0.6 * Math.exp(-Math.max(0, t - 0.2) * 1.8);
      comp.render();
    }
  };
}
