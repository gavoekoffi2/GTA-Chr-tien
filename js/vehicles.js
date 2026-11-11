// Véhicules : modèles procéduraux, conduite du joueur et circulation.
import * as THREE from 'three';

const glass = new THREE.MeshPhysicalMaterial({ color: 0x0c1418, roughness: 0.08, metalness: 0.6, clearcoat: 1 });
const tyre = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
const rim = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.3, metalness: 0.9 });
const chrome = new THREE.MeshStandardMaterial({ color: 0x8c9198, roughness: 0.3, metalness: 0.9 });
const dark = new THREE.MeshStandardMaterial({ color: 0x18191b, roughness: 0.7 });
const head = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff3cf, emissiveIntensity: 0.4 });
const tail = new THREE.MeshStandardMaterial({ color: 0x8a0d0d, emissive: 0xff1a1a, emissiveIntensity: 0.5 });
const paint = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.35, metalness: 0.5, clearcoat: 0.9, clearcoatRoughness: 0.15 });

function extrude(pts, width, mat, bevel = 0.05) {
  const s = new THREE.Shape(); pts.forEach((p, i) => s[i ? 'lineTo' : 'moveTo'](p[0], p[1]));
  const g = new THREE.ExtrudeGeometry(s, { depth: width - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 });
  g.translate(0, 0, -(width - bevel * 2) / 2); g.rotateY(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; return m;
}
function box(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; return m; }
function wheel(r, w) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 18), tyre); t.rotation.z = Math.PI / 2; t.castShadow = true; g.add(t);
  const h = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.58, r * 0.58, w + 0.02, 10), rim); h.rotation.z = Math.PI / 2; g.add(h);
  return g;
}
function addWheels(car, r, w, hx, zf, zr) {
  car.userData.wheels = [];
  for (const [x, z] of [[-hx, zf], [hx, zf], [-hx, zr], [hx, zr]]) { const wh = wheel(r, w); wh.position.set(x, r, z); car.add(wh); car.userData.wheels.push(wh); }
}

export function makeVehicle(type, color = 0x8a8f96) {
  const car = new THREE.Group(); const body = paint(color); let len = 4.4, wid = 1.8;
  if (type === 'sedan' || type === 'taxi') {
    car.add(extrude([[-2.2, 0.32], [2.2, 0.32], [2.22, 0.72], [1.35, 0.95], [-1.55, 0.98], [-2.2, 0.9]], 1.8, body));
    car.add(extrude([[1.05, 0.93], [0.35, 1.42], [-1.0, 1.42], [-1.62, 0.95]], 1.6, glass, 0.03));
    car.add(box(1.5, 0.06, 1.42, body, 0, 1.45, -0.33));
    for (const sx of [-1, 1]) { car.add(box(0.05, 0.5, 0.09, body, sx * 0.79, 1.19, -0.3)); }
    for (const sx of [-0.62, 0.62]) { car.add(box(0.36, 0.14, 0.06, head, sx, 0.72, 2.21)); car.add(box(0.36, 0.12, 0.06, tail, sx, 0.8, -2.2)); }
    car.add(box(1.3, 0.16, 0.05, dark, 0, 0.5, 2.24));
    if (type === 'taxi') { car.add(box(0.5, 0.16, 0.22, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffaa, emissiveIntensity: 0.4 }), 0, 1.56, -0.2)); }
    addWheels(car, 0.33, 0.24, 0.84, 1.38, -1.35);
  } else if (type === 'van' || type === 'pickup') {
    len = 4.8; wid = 1.9;
    if (type === 'van') {
      car.add(extrude([[-2.4, 0.38], [2.4, 0.38], [2.4, 1.0], [2.05, 1.15], [1.55, 1.98], [-2.4, 1.98]], 1.9, body));
      for (const sx of [-1, 1]) car.add(box(0.04, 0.5, 2.9, glass, sx * 0.94, 1.52, -0.75));
      const ws = box(1.6, 0.86, 0.04, glass, 0, 1.55, 1.82); ws.rotation.x = -0.54; car.add(ws);
      car.add(box(1.5, 0.45, 0.04, glass, 0, 1.55, -2.4));
    } else {
      car.add(extrude([[-2.4, 0.38], [2.4, 0.38], [2.4, 0.95], [1.4, 1.02], [-2.4, 1.02]], 1.9, body));
      car.add(extrude([[1.2, 1.0], [0.75, 1.62], [-0.45, 1.62], [-0.5, 1.0]], 1.7, glass, 0.03));
      car.add(box(1.72, 0.06, 1.3, body, 0, 1.65, 0.15));
      for (const sx of [-1, 1]) car.add(box(0.08, 0.3, 1.8, body, sx * 0.9, 1.15, -1.45)); car.add(box(1.9, 0.3, 0.08, body, 0, 1.15, -2.36));
    }
    for (const sx of [-0.68, 0.68]) { car.add(box(0.34, 0.16, 0.06, head, sx, 0.82, 2.4)); car.add(box(0.2, 0.3, 0.06, tail, sx, 0.9, -2.4)); }
    addWheels(car, 0.36, 0.26, 0.88, 1.5, -1.5);
  } else if (type === 'bus') {
    len = 9.5; wid = 2.5; const h = color === 0xc8102e ? 4.2 : 3.0;
    car.add(box(2.5, h - 0.45, 9.5, body, 0, 0.45 + (h - 0.45) / 2, 0));
    for (let lvl = 0; lvl < (h > 4 ? 2 : 1); lvl++) { const y = 1.75 + lvl * 1.9; for (const sx of [-1, 1]) car.add(box(0.04, 0.8, 8.6, glass, sx * 1.26, y, 0)); car.add(box(2.2, 0.9, 0.04, glass, 0, y, 4.76)); }
    for (const sx of [-0.9, 0.9]) { car.add(box(0.4, 0.2, 0.06, head, sx, 0.8, 4.76)); car.add(box(0.3, 0.3, 0.06, tail, sx, 0.9, -4.76)); }
    addWheels(car, 0.48, 0.3, 1.12, 3.1, -2.9);
  } else if (type === 'moto') {
    len = 2.0; wid = 0.7; car.userData.wheels = [];
    for (const z of [0.68, -0.62]) { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.07, 8, 18), tyre); t.rotation.y = Math.PI / 2; t.castShadow = true; g.add(t); const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 10), rim); hb.rotation.z = Math.PI / 2; g.add(hb); g.position.set(0, 0.34, z); car.add(g); car.userData.wheels.push(g); }
    car.add(box(0.26, 0.26, 0.5, body, 0, 0.82, 0.18)); car.add(box(0.28, 0.1, 0.72, dark, 0, 0.84, -0.42));
    car.add(box(0.2, 0.3, 0.4, chrome, 0, 0.52, 0.05)); const fk = box(0.06, 0.75, 0.06, chrome, 0, 0.72, 0.6); fk.rotation.x = 0.35; car.add(fk);
    car.add(box(0.66, 0.04, 0.04, dark, 0, 1.1, 0.47)); car.add(box(0.14, 0.12, 0.06, head, 0, 0.98, 0.62)); car.add(box(0.1, 0.06, 0.04, tail, 0, 0.82, -0.8));
    car.add(box(0.06, 0.06, 0.9, chrome, 0.13, 0.42, -0.35));
  }
  car.userData.type = type; car.userData.len = len; car.userData.wid = wid;
  return car;
}

export class Vehicle {
  constructor(type, color, scene) {
    this.type = type; this.mesh = makeVehicle(type, color); scene.add(this.mesh); this.scene = scene;
    this.pos = this.mesh.position; this.heading = 0; this.speed = 0; this.steer = 0;
    this.radius = type === 'moto' ? 0.6 : type === 'bus' ? 2.2 : 1.25; this.ai = null; this.rider = null; this.owned = false;
    this.maxSpeed = type === 'moto' ? 17 : type === 'bus' ? 12 : 21;
  }
  place(x, z, h = 0) { this.pos.set(x, 0, z); this.heading = h; this.mesh.rotation.y = h; this.speed = 0; }
  spin(dt) { const r = this.type === 'moto' ? 0.34 : 0.34; for (const w of this.mesh.userData.wheels) w.rotation.x += this.speed * dt / r; }
  // conduite par le joueur
  drive(dt, input, world, others) {
    const acc = input.y, st = input.x;
    if (acc > 0.05) this.speed += (this.speed < 0 ? 22 : 8.5) * acc * dt; else if (acc < -0.05) this.speed += (this.speed > 0 ? 24 : 5) * acc * dt; else this.speed -= Math.sign(this.speed) * Math.min(Math.abs(this.speed), 3.5 * dt);
    this.speed = Math.max(-6, Math.min(this.maxSpeed * (this.cap || 1), this.speed));
    this.steer += (st - this.steer) * Math.min(1, dt * 6);
    const grip = Math.min(1, Math.abs(this.speed) / 5) * (1 - Math.min(0.55, Math.abs(this.speed) / 45));
    this.heading -= this.steer * grip * 1.9 * dt * Math.sign(this.speed || 1);
    const px = this.pos.x, pz = this.pos.z;
    this.pos.x += Math.sin(this.heading) * this.speed * dt; this.pos.z += Math.cos(this.heading) * this.speed * dt;
    let hit = world.resolve(this.pos, this.radius);
    for (const o of others) { if (o === this) continue; const dx = this.pos.x - o.pos.x, dz = this.pos.z - o.pos.z, rr = this.radius + o.radius, d2 = dx * dx + dz * dz; if (d2 < rr * rr && d2 > 1e-4) { const d = Math.sqrt(d2); this.pos.x = o.pos.x + dx / d * rr; this.pos.z = o.pos.z + dz / d * rr; hit = true; } }
    if (hit) { const moved = Math.hypot(this.pos.x - px, this.pos.z - pz); this.speed = Math.sign(this.speed) * Math.min(Math.abs(this.speed), moved / Math.max(dt, 1e-3) * 0.9, Math.abs(this.speed) * 0.6); }
    this.mesh.rotation.y = this.heading; this.mesh.rotation.z = this.type === 'moto' ? -this.steer * grip * 0.35 : 0;
    this.spin(dt);
  }
  dispose() { this.scene.remove(this.mesh); this.mesh.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
}

// Circulation : les véhicules suivent le vrai réseau de rues et s'arrêtent devant tout obstacle.
export class Traffic {
  constructor(scene, world, quality, center) {
    this.scene = scene; this.world = world; this.cars = []; this.side = world.cfg.left ? -1 : 1;
    const cfg = world.cfg, rng = Math.random, n = quality === 'low' ? 8 : quality === 'medium' ? 14 : 22;
    const cols = [0xe9e9e6, 0x1c1f24, 0x8a8f96, 0x7a1f1f, 0x1f3f6f, 0xcfd3d6, 0x2f5d3a, 0xb99a5b];
    for (let i = 0; i < n; i++) {
      const r = rng(); let type = 'sedan', color = cols[rng() * cols.length | 0];
      if (i < cfg.motos && quality !== 'low') { type = 'moto'; color = [0xb3261e, 0x1f5fa8, 0x111111, 0xd98a00][i % 4]; }
      else if (r < 0.3) { type = 'taxi'; color = cfg.taxi; } else if (r < 0.45) { type = 'van'; color = world.id === 'lagos' ? 0xf2c200 : color; }
      else if (r < 0.55) type = 'pickup'; else if (r < 0.6 + (world.id === 'london' ? 0.15 : 0)) { type = 'bus'; color = world.id === 'london' ? 0xc8102e : 0x2d6fa3; }
      const v = new Vehicle(type, color, scene); v.ai = { target: 7 + rng() * 4, wait: 0 };
      this.cars.push(v); this.spawn(v, center, 40, 380);
    }
  }
  drivable(i) { return this.world.nodes[i].adj.some(e => e.cls <= 3); }
  spawn(v, c, rmin, rmax) {
    const w = this.world; let ids = w.nodesNear(c.x, c.z, rmax).filter(i => this.drivable(i) && Math.hypot(w.nodes[i].x - c.x, w.nodes[i].z - c.z) >= rmin);
    if (!ids.length) ids = [w.nearestNode(c.x, c.z, 3)];
    const a = ids[Math.random() * ids.length | 0]; const e = this.pick(a, -1); if (!e) return;
    Object.assign(v.ai, { a, b: e.to, edge: e, t: 0, len: this.len(a, e.to), wait: 0 }); v.speed = 0;
    const p = this.point(v.ai); v.pos.set(p.x, 0, p.z); v.heading = Math.atan2(w.nodes[e.to].x - w.nodes[a].x, w.nodes[e.to].z - w.nodes[a].z); v.mesh.rotation.y = v.heading;
  }
  len(a, b) { const n = this.world.nodes; return Math.hypot(n[b].x - n[a].x, n[b].z - n[a].z) || 0.1; }
  pick(at, from) {
    const n = this.world.nodes, adj = n[at].adj; let opts = adj.filter(e => e.cls <= 3 && e.ok && e.to !== from);
    if (!opts.length) opts = adj.filter(e => e.cls <= 3 && e.ok); if (!opts.length) opts = adj.filter(e => e.cls <= 3); if (!opts.length) return null;
    if (from < 0) return opts[Math.random() * opts.length | 0];
    const fx = n[at].x - n[from].x, fz = n[at].z - n[from].z, fl = Math.hypot(fx, fz) || 1; let tot = 0;
    const ws = opts.map(e => { const dx = n[e.to].x - n[at].x, dz = n[e.to].z - n[at].z, dl = Math.hypot(dx, dz) || 1, dot = (fx * dx + fz * dz) / (fl * dl); const w = (dot > 0.8 ? 5 : dot > -0.2 ? 1.6 : 0.15) * (e.cls <= 2 ? 2 : 1); tot += w; return w; });
    let r = Math.random() * tot; for (let i = 0; i < opts.length; i++) { r -= ws[i]; if (r <= 0) return opts[i]; } return opts[0];
  }
  point(a) { const n = this.world.nodes, A = n[a.a], B = n[a.b], u = a.t / a.len, dx = (B.x - A.x) / a.len, dz = (B.z - A.z) / a.len, lane = Math.min(2.9, a.edge.w / 4) * this.side; return { x: A.x + (B.x - A.x) * u - dz * lane, z: A.z + (B.z - A.z) * u + dx * lane }; }
  step(v, dt, obstacles) {
    const a = v.ai; if (!a.edge) return; let blocked = false; const fx = Math.sin(v.heading), fz = Math.cos(v.heading);
    for (const o of obstacles) { if (o.ref === v) continue; const dx = o.x - v.pos.x, dz = o.z - v.pos.z, along = dx * fx + dz * fz; if (along < 0.4 || along > 8 + v.radius + (o.r || 0)) continue; if (Math.abs(dx * fz - dz * fx) < 1.3 + (o.r || 0.4)) { blocked = true; break; } }
    a.wait = blocked ? a.wait + dt : 0;
    const want = blocked && a.wait < 12 ? 0 : (a.edge.cls <= 2 ? a.target : a.target * 0.65) * (a.len - a.t < 7 ? 0.6 : 1);
    v.speed += Math.max(-16 * dt, Math.min(4 * dt, want - v.speed)); if (v.speed < 0) v.speed = 0;
    a.t += v.speed * dt;
    while (a.t >= a.len) { const e = this.pick(a.b, a.a); if (!e) { a.t = 0; break; } a.t -= a.len; a.a = a.b; a.b = e.to; a.edge = e; a.len = this.len(a.a, a.b); }
    const p = this.point(a), k = Math.min(1, dt * 5), ox = v.pos.x, oz = v.pos.z;
    v.pos.x += (p.x - v.pos.x) * k; v.pos.z += (p.z - v.pos.z) * k;
    const mx = v.pos.x - ox, mz = v.pos.z - oz;
    if (mx * mx + mz * mz > 1e-5) { const wantH = Math.atan2(mx, mz); let d = wantH - v.heading; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; v.heading += d * Math.min(1, dt * 6); }
    v.mesh.rotation.y = v.heading; v.spin(dt);
  }
  update(dt, extraObstacles, pp) {
    const obs = this.cars.map(c => ({ x: c.pos.x, z: c.pos.z, r: c.radius, ref: c })).concat(extraObstacles);
    for (const v of this.cars) {
      if (pp && Math.abs(v.pos.x - pp.x) + Math.abs(v.pos.z - pp.z) > 520) this.spawn(v, pp, 180, 380);
      this.step(v, dt, obs);
    }
  }
  dispose() { for (const c of this.cars) c.dispose(); this.cars = []; }
}
