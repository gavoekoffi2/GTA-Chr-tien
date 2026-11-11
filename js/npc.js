// Habitants : piétons qui suivent les vraies rues, personnages de mission, repères lumineux.
import * as THREE from 'three';
import { createCharacter, CHARACTERS } from './characters.js';
import { S } from './state.js';

export function npcId(want) { // évite que le PNJ soit le sosie du joueur
  if (want !== S.char) return want;
  const g = CHARACTERS[want].g; return Object.keys(CHARACTERS).find(k => k !== want && CHARACTERS[k].g === g && k !== 'enfant') || 'kofi';
}

export class Crowd {
  constructor(scene, world, quality) { this.scene = scene; this.world = world; this.peds = []; this.statics = []; this.n = quality === 'low' ? 6 : quality === 'medium' ? 10 : 16; }
  async init(center) {
    const ids = Object.keys(CHARACTERS).filter(k => k !== S.char);
    const jobs = [];
    for (let i = 0; i < this.n; i++) jobs.push(createCharacter(ids[i % ids.length]).then(ch => {
      const p = { ch, speed: 1.15 + Math.random() * 0.4, side: Math.random() < 0.5 ? 1 : -1, pause: 0, greeted: 0 };
      this.scene.add(ch.root); this.peds.push(p); this.place(p, center, 15, 150); ch.play('walk_neutral', 0, p.speed / 1.35);
    }));
    await Promise.all(jobs);
  }
  len(a, b) { const n = this.world.nodes; return Math.hypot(n[b].x - n[a].x, n[b].z - n[a].z) || 0.1; }
  place(p, c, rmin, rmax) {
    const w = this.world; let ids = w.nodesNear(c.x, c.z, rmax).filter(i => w.nodes[i].adj.length && Math.hypot(w.nodes[i].x - c.x, w.nodes[i].z - c.z) >= rmin);
    if (!ids.length) ids = [w.nearestNode(c.x, c.z)];
    const a = ids[Math.random() * ids.length | 0], adj = w.nodes[a].adj, e = adj[Math.random() * adj.length | 0];
    p.a = a; p.b = e.to; p.edge = e; p.len = this.len(a, e.to); p.t = Math.random() * p.len;
    const q = this.point(p); p.ch.root.position.set(q.x, w.groundY(q.x, q.z), q.z);
  }
  point(p) { const n = this.world.nodes, A = n[p.a], B = n[p.b], u = p.t / p.len, dx = (B.x - A.x) / p.len, dz = (B.z - A.z) / p.len, off = (p.edge.w / 2 + (p.edge.cls <= 3 ? 1.4 : -0.6)) * p.side; return { x: A.x + (B.x - A.x) * u - dz * off, z: A.z + (B.z - A.z) * u + dx * off }; }
  update(dt, pp) {
    const w = this.world;
    for (const p of this.peds) {
      const pos = p.ch.root.position, dist = Math.abs(pos.x - pp.x) + Math.abs(pos.z - pp.z);
      if (dist > 190) this.place(p, pp, 70, 150);
      if (p.pause > 0) { p.pause -= dt; if (p.pause <= 0) p.ch.play('walk_neutral', 0.3, p.speed / 1.35); p.ch.update(dt); continue; }
      p.t += p.speed * dt;
      if (p.t >= p.len) { const adj = w.nodes[p.b].adj; let opts = adj.filter(e => e.to !== p.a); if (!opts.length) opts = adj; const e = opts[Math.random() * opts.length | 0]; p.t = 0; p.a = p.b; p.b = e.to; p.edge = e; p.len = this.len(p.a, p.b); }
      const q = this.point(p), k = Math.min(1, dt * 3), ox = pos.x, oz = pos.z;
      pos.x += (q.x - pos.x) * k; pos.z += (q.z - pos.z) * k; w.resolve(pos, 0.3); pos.y = w.groundY(pos.x, pos.z);
      const mx = pos.x - ox, mz = pos.z - oz; if (mx * mx + mz * mz > 1e-6) { let d = Math.atan2(mx, mz) - p.ch.root.rotation.y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; p.ch.root.rotation.y += d * Math.min(1, dt * 6); }
      p.ch.root.visible = dist < 140; if (dist < 90) p.ch.update(dt);
    }
    for (const s of this.statics) this.updateStatic(s, dt, pp);
  }
  nearestPed(pp, r) { let best = null, bd = r; for (const p of this.peds) { const d = Math.hypot(p.ch.root.position.x - pp.x, p.ch.root.position.z - pp.z); if (d < bd) { bd = d; best = p; } } return best; }
  stop(p, pp, secs = 5) { p.pause = secs; p.ch.root.rotation.y = Math.atan2(pp.x - p.ch.root.position.x, pp.z - p.ch.root.position.z); p.ch.play('gestic_talk_neutral_01', 0.3); }
  obstacles() { const o = []; for (const p of this.peds) o.push({ x: p.ch.root.position.x, z: p.ch.root.position.z, r: 0.35 }); for (const s of this.statics) if (s.ch.root.visible) o.push({ x: s.ch.root.position.x, z: s.ch.root.position.z, r: 0.35 }); return o; }

  // personnages de mission
  async addStatic(id, x, z, face = 0, anim = 'idle_neutral_01', name = '') {
    const ch = await createCharacter(npcId(id)); const f = this.world.freeNear(x, z, 0.6);
    ch.root.position.set(f.x, this.world.groundY(f.x, f.z), f.z); ch.root.rotation.y = face; this.scene.add(ch.root); ch.play(anim || 'idle_neutral_01', 0);
    const s = { ch, name, follow: false, base: anim || 'idle_neutral_01', maxSpeed: 5.5, get x() { return ch.root.position.x; }, get z() { return ch.root.position.z; } };
    this.statics.push(s); return s;
  }
  removeStatic(s) { const i = this.statics.indexOf(s); if (i >= 0) this.statics.splice(i, 1); s.ch.dispose(); }
  updateStatic(s, dt, pp) {
    const pos = s.ch.root.position;
    if (s.follow) {
      if (pp.inVehicle) { s.ch.root.visible = false; pos.x = pp.x; pos.z = pp.z; }
      else {
        if (!s.ch.root.visible) { s.ch.root.visible = true; const f = this.world.freeNear(pp.x + 1.2, pp.z + 0.8, 0.5); pos.x = f.x; pos.z = f.z; }
        const dx = pp.x - pos.x, dz = pp.z - pos.z, d = Math.hypot(dx, dz);
        if (d > 2.0) { const sp = Math.min(s.maxSpeed, d > 6 ? 5.5 : 2.2, s.maxSpeed); pos.x += dx / d * sp * dt; pos.z += dz / d * sp * dt; this.world.resolve(pos, 0.3); s.ch.root.rotation.y = Math.atan2(dx, dz); if (sp > 3) s.ch.play('run_neutral', 0.2, sp / 3.2); else s.ch.play('walk_neutral', 0.2, sp / 1.35); if (d > 60) { const f = this.world.freeNear(pp.x + 1.5, pp.z + 1, 0.5); pos.x = f.x; pos.z = f.z; } }
        else s.ch.play('idle_neutral_01', 0.3);
        pos.y = this.world.groundY(pos.x, pos.z);
      }
    }
    if (Math.abs(pos.x - pp.x) + Math.abs(pos.z - pp.z) < 120) s.ch.update(dt);
  }
  dispose() { for (const p of this.peds) p.ch.dispose(); for (const s of this.statics) s.ch.dispose(); this.peds = []; this.statics = []; }
}

// Repère lumineux (mission, objet à ramasser)
const beamGeo = new THREE.CylinderGeometry(0.9, 0.9, 30, 16, 1, true);
const diaGeo = new THREE.OctahedronGeometry(0.28);
export function makeMarker(color = 0xf5c542, beam = true) {
  const g = new THREE.Group();
  const d = new THREE.Mesh(diaGeo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2 })); d.scale.y = 1.6; d.position.y = 2.45; g.add(d);
  if (beam) { const b = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })); b.position.y = 15; g.add(b);
    const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.y = 0.09; g.add(r); }
  g.userData.dia = d; return g;
}
export function makeItem(color = 0xf5c542) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.16), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, roughness: 0.5 })); m.position.y = 1.0; m.castShadow = true; g.add(m);
  const r = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.66, 24), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.y = 0.09; g.add(r);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 14, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })); b.position.y = 7; g.add(b);
  g.userData.box = m; return g;
}
