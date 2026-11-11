// Véhicules : conduite par le joueur, conducteurs visibles, circulation sur le vrai réseau de rues.
import * as THREE from 'three';
import { buildCar, buildMoto } from './cars.js';
import { createCharacter, applyOutfit, CHARACTERS } from './characters.js';

export const FUEL = { moto: { tank: 4, perM: 1 / 1500 }, car: { tank: 20, perM: 1 / 800 } };
const _g = [new THREE.Vector3(), new THREE.Vector3()];
const PALETTE = [0xe6e6e2, 0xd9dadb, 0xa8adb3, 0x70757c, 0x1b1d21, 0x2a2e35, 0x1f3352, 0x6b1b1b, 0x2f4a36, 0xb9a57c, 0x8a6f4a, 0x9a1f1f];
const MOTO_COL = [0xb3261e, 0x1f4f9a, 0x111214, 0x1d6b3f, 0xc8c9cc, 0x7a1f6b];
// part de chaque type dans la circulation, par ville
const MIX = {
  lome: { moto: 0.42, taxi: 0.14, sedan: 0.12, hatch: 0.1, suv: 0.07, pickup: 0.07, minibus: 0.06, bus: 0.02 },
  cotonou: { moto: 0.5, taxi: 0.08, sedan: 0.12, hatch: 0.1, suv: 0.07, pickup: 0.06, minibus: 0.05, bus: 0.02 },
  accra: { moto: 0.14, taxi: 0.2, minibus: 0.2, sedan: 0.18, hatch: 0.08, suv: 0.12, pickup: 0.06, bus: 0.02 },
  abidjan: { moto: 0.08, taxi: 0.28, minibus: 0.14, sedan: 0.18, hatch: 0.12, suv: 0.1, pickup: 0.05, bus: 0.05 },
  lagos: { moto: 0.2, taxi: 0.14, minibus: 0.24, sedan: 0.14, hatch: 0.06, suv: 0.13, pickup: 0.04, bus: 0.05 },
  paris: { moto: 0.07, taxi: 0.12, hatch: 0.34, sedan: 0.2, suv: 0.15, minibus: 0.04, bus: 0.08 },
  london: { moto: 0.06, taxi: 0.2, bus: 0.14, hatch: 0.3, sedan: 0.16, suv: 0.14 },
};
const pickType = (mix, r) => { let t = 0; for (const k in mix) { t += mix[k]; if (r <= t) return k; } return 'sedan'; };

export class Vehicle {
  constructor(type, color, scene, o = {}) {
    this.type = type; this.isMoto = type === 'moto'; this.scene = scene;
    const b = this.b = this.isMoto ? buildMoto(color, o) : buildCar(type, color, o);
    this.mesh = b.group; scene.add(this.mesh); this.pos = this.mesh.position; this.heading = 0; this.speed = 0; this.steer = 0;
    this.radius = this.isMoto ? 0.6 : type === 'bus' ? 2.6 : type === 'minibus' || type === 'pickup' ? 1.4 : 1.25;
    this.maxSpeed = this.isMoto ? 17 : type === 'bus' ? 12 : 21; this.ai = null; this.rider = null; this.owned = false; this.riders = [];
    const f = this.isMoto ? FUEL.moto : FUEL.car; this.tank = f.tank; this.perM = f.perM; this.fuel = f.tank;
  }
  place(x, z, h = 0) { this.pos.set(x, 0, z); this.heading = h; this.mesh.rotation.set(0, h, 0); this.speed = 0; this.steer = 0; this.visual(0); }
  visual(dt) {
    const b = this.b; for (const w of b.wheels) w.rotation.x += this.speed * dt / b.r;
    if (this.isMoto) { b.steerG.quaternion.setFromAxisAngle(b.steerAxis, -this.steer * 0.45); this.mesh.rotation.z = -this.steer * Math.min(1, Math.abs(this.speed) / 6) * 0.3; }
    else for (const p of b.steer) p.rotation.y = -this.steer * 0.5;
  }
  gripTargets() { const b = this.b, inner = b.steerG.children[0]; for (let i = 0; i < 2; i++) inner.localToWorld(_g[i].copy(b.grips[i]).add(_off)); return _g; }
  wheelTargets() { const b = this.b; for (let i = 0; i < 2; i++) this.mesh.localToWorld(_g[i].copy(b.wheelPos).add(_woff[i])); return _g; }
  // installe un personnage : place 0 = conducteur, 1 = passager
  seat(ch, place = 0, drive = true) {
    const b = this.b; this.mesh.add(ch.root); ch.root.rotation.set(0, 0, 0); ch.root.visible = true;
    if (this.isMoto) { const s = place ? b.seat2 : b.seat; ch.root.position.set(0, 0.3 + (1 - ch.hipScale) * 0.55, s.z); ch.pose = place ? { spread: 0.32 } : { lean: 0.25, spread: 0.3, hands: drive ? () => this.gripTargets() : null }; }
    else { ch.root.position.set(place ? -b.seat.x : b.seat.x, b.seat.y - 0.31 - 0.59 * ch.hipScale, b.seat.z + 0.02); ch.pose = place ? {} : { hands: drive ? () => this.wheelTargets() : null }; }
    ch.play('sit_chair_idle_neutral_01', 0); ch.mixer.update(0.05); this.mesh.updateMatrixWorld(true); ch.riderPose(ch.pose); ch.riderPose(ch.pose);
  }
  // conducteur (et passager) permanents pour la circulation
  async addRider(id, place = 0, top = 0) { const ch = await createCharacter(id); if (this.dead) { ch.dispose(); return null; } if (top) await applyOutfit(ch, top, 0); this.seat(ch, place); ch.mixer.update(0.05); ch.riderPose(ch.pose); this.riders.push(ch); return ch; }
  // conduite par le joueur
  drive(dt, input, world, others) {
    const acc = input.y, st = input.x, dry = this.owned && this.fuel <= 0;
    if (acc > 0.05) this.speed += (this.speed < 0 ? 22 : this.isMoto ? 9.5 : 8.5) * acc * dt; else if (acc < -0.05) this.speed += (this.speed > 0 ? 24 : 5) * acc * dt; else this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), 3.5 * dt);
    this.speed = Math.max(-6, Math.min(dry ? 2.2 : this.maxSpeed, this.speed));
    this.steer += (st - this.steer) * Math.min(1, dt * 6);
    const grip = Math.min(1, Math.abs(this.speed) / 5) * (1 - Math.min(0.55, Math.abs(this.speed) / 45));
    this.heading -= this.steer * grip * 1.9 * dt * Math.sign(this.speed || 1);
    const px = this.pos.x, pz = this.pos.z;
    this.pos.x += Math.sin(this.heading) * this.speed * dt; this.pos.z += Math.cos(this.heading) * this.speed * dt;
    let hit = world.resolve(this.pos, this.radius);
    for (const o of others) { if (o === this) continue; const dx = this.pos.x - o.pos.x, dz = this.pos.z - o.pos.z, rr = this.radius + o.radius, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-4) { const d = Math.sqrt(d2); this.pos.x = o.pos.x + dx / d * rr; this.pos.z = o.pos.z + dz / d * rr; hit = true; } }
    const moved = Math.hypot(this.pos.x - px, this.pos.z - pz);
    if (hit) { this.speed = Math.sign(this.speed) * Math.min(Math.abs(this.speed), moved / Math.max(dt, 1e-3) * 0.9, Math.abs(this.speed) * 0.6); this.bumped = true; }
    if (this.owned) this.fuel = Math.max(0, this.fuel - moved * this.perM);
    this.pos.y = world.groundY(this.pos.x, this.pos.z); this.mesh.rotation.y = this.heading; this.visual(dt);
  }
  dispose() { this.dead = true; for (const r of this.riders) r.dispose(); this.riders = []; this.scene.remove(this.mesh); this.mesh.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); }
}
const _off = new THREE.Vector3(0, 0.03, -0.06), _woff = [new THREE.Vector3(0.15, 0.03, -0.03), new THREE.Vector3(-0.15, 0.03, -0.03)];

// Suivi du réseau : au hasard (circulation) ou le long d'un itinéraire (zémidjan, taxi).
export class Nav {
  constructor(world) { this.world = world; this.side = world.cfg.left ? -1 : 1; }
  len(a, b) { const n = this.world.nodes; return Math.hypot(n[b].x - n[a].x, n[b].z - n[a].z) || 0.1; }
  edge(a, b) { return this.world.nodes[a].adj.find(e => e.to === b) || this.world.nodes[a].adj[0]; }
  pick(at, from) {
    const n = this.world.nodes, adj = n[at].adj; let opts = adj.filter(e => e.cls <= 3 && e.ok && e.to !== from);
    if (!opts.length) opts = adj.filter(e => e.cls <= 3 && e.ok); if (!opts.length) opts = adj.filter(e => e.cls <= 3); if (!opts.length) return null;
    if (from < 0) return opts[Math.random() * opts.length | 0];
    const fx = n[at].x - n[from].x, fz = n[at].z - n[from].z, fl = Math.hypot(fx, fz) || 1; let tot = 0;
    const ws = opts.map(e => { const dx = n[e.to].x - n[at].x, dz = n[e.to].z - n[at].z, dl = Math.hypot(dx, dz) || 1, dot = (fx * dx + fz * dz) / (fl * dl); const w = (dot > 0.8 ? 5 : dot > -0.2 ? 1.6 : 0.15) * (e.cls <= 2 ? 2 : 1); tot += w; return w; });
    let r = Math.random() * tot; for (let i = 0; i < opts.length; i++) { r -= ws[i]; if (r <= 0) return opts[i]; } return opts[0];
  }
  point(a, isMoto) { const n = this.world.nodes, A = n[a.a], B = n[a.b], u = Math.min(1, a.t / a.len), dx = (B.x - A.x) / a.len, dz = (B.z - A.z) / a.len, lane = Math.min(isMoto ? 3.6 : 2.9, a.edge.w / (isMoto ? 3.2 : 4)) * this.side; return { x: A.x + (B.x - A.x) * u - dz * lane, z: A.z + (B.z - A.z) * u + dx * lane }; }
  start(v, a, b) { v.ai = Object.assign(v.ai || {}, { a, b, edge: this.edge(a, b), t: 0, len: this.len(a, b), wait: 0, done: false }); const p = this.point(v.ai, v.isMoto), n = this.world.nodes; v.pos.set(p.x, 0, p.z); v.heading = Math.atan2(n[b].x - n[a].x, n[b].z - n[a].z); v.mesh.rotation.y = v.heading; v.speed = 0; }
  route(v, path) { this.start(v, path[0], path[1]); v.ai.path = path; v.ai.pi = 1; }
  // fait avancer le véhicule ; renvoie true quand un itinéraire est terminé
  step(v, dt, obstacles, cruise) {
    const a = v.ai; if (!a || !a.edge) return false; let blocked = false; const fx = Math.sin(v.heading), fz = Math.cos(v.heading);
    for (const o of obstacles) { if (o.ref === v) continue; const dx = o.x - v.pos.x, dz = o.z - v.pos.z, along = dx * fx + dz * fz; if (along < 0.4 || along > 7 + v.radius + (o.r || 0) + v.speed * 0.3) continue; if (Math.abs(dx * fz - dz * fx) < (v.isMoto ? 0.8 : 1.3) + (o.r || 0.4)) { blocked = true; break; } }
    a.wait = blocked ? a.wait + dt : 0;
    const last = a.path && a.pi >= a.path.length - 1, remain = a.len - a.t;
    let want = blocked && a.wait < 10 ? 0 : (a.edge.cls <= 2 ? cruise : cruise * 0.7) * (remain < 7 ? 0.6 : 1); if (last) want = Math.min(want, 1.2 + remain * 0.7);
    v.speed += Math.max(-16 * dt, Math.min(4.5 * dt, want - v.speed)); if (v.speed < 0) v.speed = 0;
    a.t += v.speed * dt;
    while (a.t >= a.len) {
      let e; if (a.path) { if (a.pi >= a.path.length - 1) { a.t = a.len; a.done = true; break; } a.pi++; e = this.edge(a.b, a.path[a.pi]); } else e = this.pick(a.b, a.a);
      if (!e) { a.t = 0; break; } a.t -= a.len; a.a = a.b; a.b = e.to; a.edge = e; a.len = this.len(a.a, a.b);
    }
    const p = this.point(a, v.isMoto), k = Math.min(1, dt * 5), ox = v.pos.x, oz = v.pos.z;
    v.pos.x += (p.x - v.pos.x) * k; v.pos.z += (p.z - v.pos.z) * k; v.pos.y = this.world.groundY(v.pos.x, v.pos.z);
    const mx = v.pos.x - ox, mz = v.pos.z - oz;
    if (mx * mx + mz * mz > 1e-5) { let d = Math.atan2(mx, mz) - v.heading; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; const turn = d * Math.min(1, dt * 6); v.heading += turn; v.steer += (Math.max(-1, Math.min(1, -turn / Math.max(dt, 1e-3) * 0.5)) - v.steer) * Math.min(1, dt * 4); }
    v.mesh.rotation.y = v.heading; v.visual(dt);
    return !!a.done && v.speed < 0.6;
  }
}

export class Traffic {
  constructor(scene, world, quality, center) {
    this.scene = scene; this.world = world; this.cars = []; this.nav = new Nav(world);
    const cfg = world.cfg, rng = Math.random, n = quality === 'low' ? 9 : quality === 'medium' ? 15 : 24, maxMoto = quality === 'low' ? 2 : quality === 'medium' ? 5 : 9, mix = MIX[world.id] || MIX.lome;
    const people = Object.keys(CHARACTERS).filter(k => k !== 'enfant' && k !== 'afi'); let motos = 0;
    for (let i = 0; i < n; i++) {
      let type = pickType(mix, rng()); if (type === 'moto' && motos >= maxMoto) type = rng() < 0.5 ? 'sedan' : 'hatch';
      let color = PALETTE[rng() * PALETTE.length | 0]; const o = { driver: true, shirt: [0x2d6fa3, 0xe8e8e0, 0x8a2a2a, 0x2f6b3a, 0xd9a520][rng() * 5 | 0], rhd: !!cfg.left, plate: rng() * 3 | 0 };
      if (type === 'moto') color = MOTO_COL[rng() * MOTO_COL.length | 0];
      else if (type === 'taxi') { color = cfg.taxi; o.darkBumper = true; }
      else if (type === 'minibus') { color = world.id === 'lagos' ? 0xf2c200 : rng() < 0.7 ? 0xeeeeea : color; o.darkBumper = true; o.rack = !cfg.style && rng() < 0.6; }
      else if (type === 'pickup') { o.cargo = rng() < 0.6; o.darkBumper = rng() < 0.5; }
      else if (type === 'bus') color = world.id === 'london' ? 0xc8102e : world.id === 'paris' ? 0x3d8f6a : 0x2d6fa3;
      else if (type === 'hatch') o.darkBumper = rng() < 0.5;
      const v = new Vehicle(type, color, scene, o); v.ai = { cruise: (type === 'moto' ? 8.5 : type === 'bus' ? 6.5 : 7.5) + rng() * 3 };
      if (type === 'moto') { motos++; const zem = world.id === 'cotonou' ? 5 : 0; v.addRider(people[rng() * people.length | 0], 0, zem).then(() => { if (rng() < 0.4 && quality !== 'low') v.addRider(people[rng() * people.length | 0], 1); }); }
      this.cars.push(v); this.spawn(v, center, 40, 380);
    }
  }
  spawn(v, c, rmin, rmax) {
    const w = this.world; let ids = w.nodesNear(c.x, c.z, rmax).filter(i => w.comp[i] === w.mainComp && Math.hypot(w.nodes[i].x - c.x, w.nodes[i].z - c.z) >= rmin);
    if (!ids.length) ids = [w.nearestMain(c.x, c.z)];
    const a = ids[Math.random() * ids.length | 0], e = this.nav.pick(a, -1); if (!e) return; this.nav.start(v, a, e.to);
  }
  update(dt, extraObstacles, pp) {
    const obs = this.cars.map(c => ({ x: c.pos.x, z: c.pos.z, r: c.radius, ref: c })).concat(extraObstacles);
    for (const v of this.cars) {
      const d = pp ? Math.abs(v.pos.x - pp.x) + Math.abs(v.pos.z - pp.z) : 0;
      if (d > 520) this.spawn(v, pp, 180, 380);
      for (const r of v.riders) r.root.visible = d < 170;
      this.nav.step(v, dt, obs, v.ai.cruise);
    }
  }
  dispose() { for (const c of this.cars) c.dispose(); this.cars = []; }
}
