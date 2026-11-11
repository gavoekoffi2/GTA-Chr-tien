// Vie des rues : murs de clôture, poteaux et fils électriques, véhicules garés, vendeuses sous parasol, kiosques, pneus.
import * as THREE from 'three';
import { buildStatic, VM } from './cars.js';
import { signTexture } from './world.js';

const TILE = 420;
function inst(w, geo, mat, all, fn, shadow = true) {
  if (!all.length) return; const dummy = new THREE.Object3D(), tiles = new Map();
  for (const it of all) { const k = Math.floor(it[0] / TILE) + ',' + Math.floor(it[2] / TILE); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(it); }
  for (const list of tiles.values()) { const im = new THREE.InstancedMesh(geo, mat, list.length); im.castShadow = shadow; im.receiveShadow = true;
    list.forEach((it, i) => { dummy.position.set(it[0], it[1], it[2]); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); if (fn) fn(dummy, it, i, im); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.computeBoundingSphere(); w.group.add(im); }
}
function mergeGeo(parts) { // fusion de géométries (position, normale, uv)
  const p = [], n = [], u = [], idx = []; let off = 0;
  for (const g of parts) { const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv; for (let i = 0; i < pa.count; i++) { p.push(pa.getX(i), pa.getY(i), pa.getZ(i)); n.push(na.getX(i), na.getY(i), na.getZ(i)); u.push(ua ? ua.getX(i) : 0, ua ? ua.getY(i) : 0); } if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + off); else for (let i = 0; i < pa.count; i++) idx.push(i + off); off += pa.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setIndex(idx); return g;
}
const tr = (g, x, y, z, rx = 0, ry = 0, rz = 0) => { g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); return g; };
const pip = (p, x, z) => { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) if ((p[i + 1] > z) !== (p[j + 1] > z) && x < (p[j] - p[i]) * (z - p[i + 1]) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; return c; };

export function decorate(w) {
  const rng = w.rng, q = w.q, K = q === 'low' ? 0.35 : q === 'medium' ? 0.65 : 1, afr = !w.cfg.style;
  // réservation de l'espace pour éviter les objets superposés
  const grid = new Map(), ck = (x, z) => Math.floor(x / 6) + ',' + Math.floor(z / 6);
  const taken = (x, z, r) => { const gx = Math.floor(x / 6), gz = Math.floor(z / 6); for (let a = gx - 1; a <= gx + 1; a++) for (let b = gz - 1; b <= gz + 1; b++) { const l = grid.get(a + ',' + b); if (l) for (const c of l) if ((c[0] - x) ** 2 + (c[1] - z) ** 2 < (c[2] + r) ** 2) return true; } return false; };
  const mark = (x, z, r) => { const k = ck(x, z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push([x, z, r]); };
  const claim = (x, z, r) => { if (taken(x, z, r)) return false; mark(x, z, r); return true; };
  w.claim = claim;
  for (const k of ['lamp', 'palm', 'tree', 'stall']) for (const it of w.inst[k]) mark(it[0], it[2], k === 'lamp' ? 0.4 : 1.0);
  for (const f of w.fuelStations) mark(f.x, f.z, 9);
  const pois = Object.values(w.pois), nearPoi = (x, z, r) => pois.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r || (p.cx - x) ** 2 + (p.cz - z) ** 2 < r * r);
  const gb = w.greens.map(g => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < g.length; i += 2) { x0 = Math.min(x0, g[i]); x1 = Math.max(x1, g[i]); z0 = Math.min(z0, g[i + 1]); z1 = Math.max(z1, g[i + 1]); } return [x0, x1, z0, z1, g]; });
  const inGreen = (x, z) => gb.some(b => x > b[0] && x < b[1] && z > b[2] && z < b[3] && pip(b[4], x, z));
  const ch = w.pois.church, core = (x, z) => Math.hypot(x - ch.cx, z - ch.cz);
  const edges = []; w.nodes.forEach((n, i) => { for (const e of n.adj) { if (e.to > i) continue; const m = w.nodes[e.to], l = Math.hypot(m.x - n.x, m.z - n.z); if (l > 6) edges.push({ n, m, e, l, dx: (m.x - n.x) / l, dz: (m.z - n.z) / l }); } });

  // ---------- murs de clôture le long des rues résidentielles ----------
  const bushes = [];
  if (afr) {
    const kinds = ['cream', 'block', 'ochre', 'green'], H = 2.4, T = 0.11, top = w.bk('flat:#b9b1a2');
    const built = (x, z, nx, nz) => { for (const d of [5, 10, 16, 23]) if (w.segDist(x + nx * d, z + nz * d, 3.5) < 3.5) return true; return false; };
    for (const E of edges) {
      if (E.e.cls < 3 || E.e.cls > 4 || E.l < 16) continue;
      for (const side of [1, -1]) {
        const nx = -E.dz * side, nz = E.dx * side, off = E.e.w / 2 + 3.4; let start = -1, last = -1; const kind = kinds[rng() * (rng() < 0.6 ? 2 : 4) | 0];
        const close = () => {
          if (start >= 0 && last - start >= 8) {
            const s0 = start - 1.5, s1 = last + 1.5, ax = E.n.x + E.dx * s0 + nx * off, az = E.n.z + E.dz * s0 + nz * off, bx = E.n.x + E.dx * s1 + nx * off, bz = E.n.z + E.dz * s1 + nz * off, len = s1 - s0, u0 = (rng() * 8 | 0) / 8, B = w.bk('wall:' + kind, ax, az);
            const o = [nx * T, nz * T], A1 = [ax - o[0], az - o[1]], B1 = [bx - o[0], bz - o[1]], A2 = [ax + o[0], az + o[1]], B2 = [bx + o[0], bz + o[1]];
            const f = (P, Q) => B.quad([P[0], 0, P[1]], [Q[0], 0, Q[1]], [Q[0], H, Q[1]], [P[0], H, P[1]], u0, 0, u0 + len / 12.8, 1);
            if (side > 0) { f(B1, A1); f(A2, B2); } else { f(A1, B1); f(B2, A2); }
            top.up([A1[0], H, A1[1]], [B1[0], H, B1[1]], [B2[0], H, B2[1]], [A2[0], H, A2[1]], 3);
            w.addSeg(ax, az, bx, bz); mark((ax + bx) / 2, (az + bz) / 2, 0.3);
            for (let s = 4; s < len - 3; s += 9) if (rng() < 0.3) bushes.push([ax + E.dx * s + nx * 0.5, H - 0.25, az + E.dz * s + nz * 0.5, rng()]);
          }
          start = -1;
        };
        for (let s = 6; s <= E.l - 6; s += 2) {
          const x = E.n.x + E.dx * s + nx * off, z = E.n.z + E.dz * s + nz * off;
          const ok = w.segDist(x, z, 1.7) >= 1.7 && !w.inside(x, z) && !w.onRoad(x, z) && !nearPoi(x, z, 34) && !inGreen(x, z) && (!w.shore || z < w.shoreZ(x) - 95) && built(x, z, nx, nz) && !taken(x, z, 0.5);
          if (ok) { if (start < 0) start = s; last = s; } else close();
        }
        close();
      }
    }
  }

  // ---------- poteaux et fils électriques ----------
  const poles = [], wire = [];
  for (const E of edges) {
    if (E.e.cls > 3 || E.l < 34) continue; const side = (E.n.x * 7 + E.n.z * 13 | 0) % 2 ? 1 : -1, nx = -E.dz * side, nz = E.dx * side, off = E.e.w / 2 + 0.75; let prev = null;
    for (let s = 5; s <= E.l - 4; s += 36) { const x = E.n.x + E.dx * s + nx * off, z = E.n.z + E.dz * s + nz * off; if (!w.free(x, z, 0.5) || !claim(x, z, 0.35)) { prev = null; continue; } const p = [x, 0, z, Math.atan2(E.dx, E.dz)]; poles.push(p);
      if (prev) for (const o of [-0.5, 0, 0.5]) { const ax = prev[0] + nx * o, az = prev[2] + nz * o, bx = x + nx * o, bz = z + nz * o; for (let k = 0; k < 5; k++) { const t0 = k / 5, t1 = (k + 1) / 5, sag = t => 7.75 - 0.55 * 4 * t * (1 - t); wire.push(ax + (bx - ax) * t0, sag(t0), az + (bz - az) * t0, ax + (bx - ax) * t1, sag(t1), az + (bz - az) * t1); } }
      prev = p; }
  }
  if (q === 'low') poles.length = Math.min(poles.length, 150);
  inst(w, mergeGeo([tr(new THREE.CylinderGeometry(0.09, 0.14, 8, 6), 0, 4, 0), tr(new THREE.BoxGeometry(1.25, 0.09, 0.09), 0, 7.7, 0)]), w.mat(afr ? 'flat:#8f8a80' : 'flat:#5a4a3a'), poles, (d, it) => { d.rotation.y = it[3]; }, false);
  if (wire.length && q !== 'low') { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3)); const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x14161a })); l.frustumCulled = false; w.group.add(l); }

  // ---------- motos et voitures garées ----------
  const motos = [], cars = { sedan: [], hatch: [], pickup: [] }, MC = [0xb3261e, 0x1f4f9a, 0x15161a, 0x1d6b3f, 0xc8c9cc, 0x7a1f6b, 0xd98a00], CC = [0xe6e6e2, 0xd9dadb, 0xa8adb3, 0x70757c, 0x24262b, 0x1f3352, 0x6b1b1b, 0x2f4a36, 0xb9a57c];
  const maxM = Math.round(230 * K * (afr ? 1 : 0.35)), maxC = Math.round(130 * K);
  const row = (E, s, side, n) => { const nx = -E.dz * side, nz = E.dx * side, off = E.e.w / 2 + 1.35, h = Math.atan2(E.dx, E.dz) + side * (Math.PI / 2 - 0.45); for (let k = 0; k < n && motos.length < maxM; k++) { const x = E.n.x + E.dx * (s + k * 0.8) + nx * off, z = E.n.z + E.dz * (s + k * 0.8) + nz * off; if (w.free(x, z, 0.5) && claim(x, z, 0.38)) motos.push([x, 0, z, h + (rng() - 0.5) * 0.3, MC[rng() * MC.length | 0]]); } };
  for (const [k, n] of [['market', 30], ['station', 12], ['church', 9], ['hospital', 8], ['school', 6], ['stadium', 6], ['dealer', 8]]) { const p = w.pois[k]; if (!p) continue; let left = Math.round(n * (afr ? 1 : 0.4)); for (const E of edges) { if (left <= 0) break; if (E.e.cls > 3) continue; const mx = (E.n.x + E.m.x) / 2, mz = (E.n.z + E.m.z) / 2; if (Math.hypot(mx - p.x, mz - p.z) > 75) continue; const c = Math.min(left, 3 + (rng() * 4 | 0)); row(E, 3 + rng() * Math.max(1, E.l - 9), rng() < 0.5 ? 1 : -1, c); left -= c; } }
  for (const E of edges) {
    if (E.e.cls > 2) { if (E.e.cls === 3 && rng() < 0.12 * K && E.l > 20) row(E, 4 + rng() * (E.l - 10), rng() < 0.5 ? 1 : -1, 1 + (rng() * 2 | 0)); continue; }
    for (let s = 8; s < E.l - 8; s += 16) {
      const r = rng(), side = rng() < 0.5 ? 1 : -1;
      if (r < 0.2 * K && motos.length < maxM) row(E, s, side, 1 + (rng() * 3 | 0));
      else if (r < 0.2 * K + 0.22 * K) { const tot = cars.sedan.length + cars.hatch.length + cars.pickup.length; if (tot >= maxC) continue; const nx = -E.dz * side, nz = E.dx * side, off = E.e.w / 2 + 1.3, x = E.n.x + E.dx * s + nx * off, z = E.n.z + E.dz * s + nz * off;
        if (!w.free(x, z, 1.3) || w.onRoad(x, z) || nearPoi(x, z, 9) || !claim(x, z, 2.5)) continue; const t = rng() < 0.55 ? 'sedan' : rng() < 0.7 ? 'hatch' : 'pickup', h = Math.atan2(E.dx, E.dz) + (rng() < 0.5 ? Math.PI : 0), L = t === 'pickup' ? 2.6 : t === 'hatch' ? 1.9 : 2.2;
        cars[t].push([x, 0, z, h, CC[rng() * CC.length | 0]]); const c = Math.cos(h), sn = Math.sin(h), P = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c], a = P(-0.85, -L), b = P(0.85, -L), d2 = P(0.85, L), e2 = P(-0.85, L); w.addPoly([a[0], a[1], b[0], b[1], d2[0], d2[1], e2[0], e2[1]]); }
    }
  }
  const paintM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.4 }), col = new THREE.Color();
  const park = (type, list, lean) => { if (!list.length) return; const g = buildStatic(type); inst(w, g.paint, paintM, list, (d, it, i, im) => { d.rotation.order = 'YXZ'; d.rotation.set(0, it[3], lean); im.setColorAt(i, col.setHex(it[4])); }); inst(w, g.rest, VM.solid, list, d => { d.rotation.order = 'YXZ'; }, true); };
  // (la seconde passe réutilise la même orientation)
  const park2 = (type, list, lean) => { if (!list.length) return; const g = buildStatic(type), f = (d, it) => { d.rotation.order = 'YXZ'; d.rotation.set(0, it[3], lean); }; inst(w, g.paint, paintM, list, (d, it, i, im) => { f(d, it); im.setColorAt(i, col.setHex(it[4])); }); inst(w, g.rest, VM.solid, list, f); };
  park2('moto', motos, 0.16); for (const t in cars) park2(t, cars[t], 0);

  // ---------- vendeuses sous parasol, kiosques, piles de pneus ----------
  const para = [], goods = [], kiosks = [], tyres = [], PC = [0xc0392b, 0x2471a3, 0xd4ac0d, 0x1e8449, 0xca6f1e, 0xf2f2ee, 0x7d3c98], GC = [0xc0392b, 0xe67e22, 0xf1c40f, 0x27ae60, 0x8e5a2b, 0xf5f5dc, 0x6b3f1d], KC = [0x1f5fa8, 0xd4ac0d, 0xc0392b, 0x1e8449, 0xe9e2d0];
  const maxP = Math.round(110 * K * (afr ? 1 : 0.25));
  for (const E of edges) {
    if (E.e.cls > 3) continue; const dc = core((E.n.x + E.m.x) / 2, (E.n.z + E.m.z) / 2), dens = (E.e.cls <= 2 ? 0.3 : 0.1) * (dc < 500 ? 1.4 : dc < 1000 ? 0.8 : 0.4) * (afr ? 1 : 0.3);
    for (let s = 7; s < E.l - 6; s += 13) {
      const r = rng(); if (r > dens) continue; const side = rng() < 0.5 ? 1 : -1, nx = -E.dz * side, nz = E.dx * side, off = E.e.w / 2 + 2.0, x = E.n.x + E.dx * s + nx * off, z = E.n.z + E.dz * s + nz * off, h = Math.atan2(E.dx, E.dz);
      if (!w.free(x, z, 1.2) || w.onRoad(x, z) || nearPoi(x, z, 7)) continue;
      if (r < dens * 0.72 && para.length < maxP) { if (!claim(x, z, 1.3)) continue; para.push([x, 0, z, h, PC[rng() * PC.length | 0]]); for (let k = 0; k < 5; k++) { const lx = -0.5 + (k % 3) * 0.5, lz = k < 3 ? -0.18 : 0.2, c = Math.cos(h), sn = Math.sin(h); goods.push([x + lx * c + lz * sn, 0.86, z - lx * sn + lz * c, GC[rng() * GC.length | 0]]); } w.collide(x - 0.6, z - 0.6, x + 0.6, z + 0.6); }
      else if (r < dens * 0.9 && kiosks.length < 46 * K && E.e.cls <= 3) { if (!w.free(x + nx * 0.6, z + nz * 0.6, 1.6) || !claim(x + nx * 0.6, z + nz * 0.6, 1.9)) continue; kiosks.push([x + nx * 0.6, 0, z + nz * 0.6, Math.atan2(-nx, -nz), KC[rng() * KC.length | 0], rng() * 4 | 0]); w.collide(x + nx * 0.6 - 1.1, z + nz * 0.6 - 1.1, x + nx * 0.6 + 1.1, z + nz * 0.6 + 1.1); }
      else if (tyres.length < 14 && afr) { if (!claim(x, z, 1.4)) continue; tyres.push([x, 0, z, h]); w.collide(x - 0.5, z - 0.5, x + 0.5, z + 0.5); }
    }
  }
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b5236, roughness: 0.9 });
  inst(w, mergeGeo([tr(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 5), 0.5, 1.15, 0.45), tr(new THREE.BoxGeometry(1.5, 0.06, 0.8), 0, 0.8, 0), ...[[-0.68, -0.33], [0.68, -0.33], [-0.68, 0.33], [0.68, 0.33]].map(([x, z]) => tr(new THREE.BoxGeometry(0.05, 0.8, 0.05), x, 0.4, z)), tr(new THREE.BoxGeometry(0.34, 0.42, 0.34), -1.0, 0.21, 0.5)]), wood, para, (d, it) => { d.rotation.y = it[3]; });
  inst(w, tr(new THREE.ConeGeometry(1.35, 0.5, 8, 1, true), 0.5, 2.45, 0.45), new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }), para, (d, it, i, im) => { d.rotation.y = it[3]; im.setColorAt(i, col.setHex(it[4])); });
  inst(w, new THREE.SphereGeometry(0.17, 7, 5).scale(1, 0.75, 1), new THREE.MeshStandardMaterial({ roughness: 0.8 }), goods, (d, it, i, im) => { im.setColorAt(i, col.setHex(it[3])); }, false);
  // kiosques peints avec enseigne
  inst(w, mergeGeo([tr(new THREE.BoxGeometry(2.1, 2.2, 1.5), 0, 1.1, 0), tr(new THREE.BoxGeometry(2.4, 0.07, 1.1), 0, 2.2, 1.0, 0.18)]), new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.2 }), kiosks, (d, it, i, im) => { d.rotation.y = it[3]; im.setColorAt(i, col.setHex(it[4])); });
  const KT = w.cfg.en ? [['AIRTIME', 'TRANSFER'], ['HOT BREAD'], ['PHOTOCOPY', 'PRINTING'], ['COLD DRINKS']] : [['CRÉDIT', 'TRANSFERT'], ['PAIN CHAUD'], ['PHOTOCOPIE', 'SAISIE'], ['BOISSONS FRAÎCHES']];
  const ktex = KT.map((t, i) => new THREE.MeshStandardMaterial({ map: signTexture(t, { bg: ['#f5c542', '#7a1f17', '#124b8a', '#0d6f73'][i], fg: i === 0 ? '#111' : '#fff', border: null, w: 256, h: 96 }), roughness: 0.6 })), kg = new THREE.PlaneGeometry(1.9, 0.55), dark = new THREE.MeshStandardMaterial({ color: 0x15191d, roughness: 0.6 }), og = new THREE.PlaneGeometry(1.5, 0.9);
  for (const k of kiosks) { const c = Math.cos(k[3]), s = Math.sin(k[3]); const m = new THREE.Mesh(kg, ktex[k[5]]); m.position.set(k[0] + s * 0.76, 1.9, k[2] + c * 0.76); m.rotation.y = k[3]; w.group.add(m); const o = new THREE.Mesh(og, dark); o.position.set(k[0] + s * 0.757, 1.1, k[2] + c * 0.757); o.rotation.y = k[3]; w.group.add(o); }
  // vulcanisateurs : piles de pneus
  const tl = []; for (const t of tyres) { for (let k = 0; k < 5; k++) tl.push([t[0], 0.11 + k * 0.2, t[2], k * 0.7]); tl.push([t[0] + 0.75, 0.33, t[2] + 0.2, 99]); w.board([w.T('VULCANISATEUR', 'VULCANIZER'), w.T('COLLAGE — PNEUS', 'TYRE REPAIR')], t[0] - Math.cos(t[3]) * 1.3, t[2] + Math.sin(t[3]) * 1.3, t[3] + Math.PI / 2, 2.4, 0.9, 2.3, { bg: '#f2efe6', fg: '#111', border: '#b3261e', h: 110, w: 300 }); }
  inst(w, new THREE.TorusGeometry(0.27, 0.1, 6, 14).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.9 }), tl, (d, it) => { if (it[3] === 99) d.rotation.x = Math.PI / 2 - 0.25; else d.rotation.y = it[3]; });
  // bougainvilliers sur les murs
  const BC = [0xc2185b, 0xd81b60, 0xe65100, 0xf06292, 0x2e7d32];
  inst(w, new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ roughness: 1 }), bushes, (d, it, i, im) => { d.scale.set(1.5 + it[3], 0.75, 0.7); d.rotation.y = it[3] * 6; im.setColorAt(i, col.setHex(BC[it[3] * BC.length | 0])); }, false);

  // ---------- halos des lampadaires la nuit ----------
  if (w.inst.lamp.length && q !== 'low') {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,150,1)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    w.poolMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    inst(w, new THREE.CircleGeometry(6.5, 16).rotateX(-Math.PI / 2), w.poolMat, w.inst.lamp.map(l => [l[0] - 1.9 * Math.cos(l[3]), 0.09, l[2] + 1.9 * Math.sin(l[3])]), null, false);
  }
}
