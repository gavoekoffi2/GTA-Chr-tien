// Joueur : commandes (clavier, souris, tactile), déplacement à pied et caméra à la troisième personne.
import * as THREE from 'three';
import { ui } from './ui.js';

export class Input {
  constructor(canvas) {
    this.keys = {}; this.move = { x: 0, y: 0 }; this.run = false; this.look = { dx: 0, dy: 0 }; this.pressed = {}; this.zoom = 0;
    const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window; this.touch = touch; ui.touch = touch;
    addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; const k = e.code; if (!this.keys[k]) this.pressed[k] = true; this.keys[k] = true; if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(k)) e.preventDefault(); });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = {}; });
    // caméra : glisser avec la souris ou le doigt (moitié droite)
    let drag = null;
    canvas.addEventListener('pointerdown', e => { if (drag === null) { drag = e.pointerId; this.lx = e.clientX; this.ly = e.clientY; canvas.setPointerCapture(e.pointerId); } });
    canvas.addEventListener('pointermove', e => { if (e.pointerId !== drag) return; this.look.dx += e.clientX - this.lx; this.look.dy += e.clientY - this.ly; this.lx = e.clientX; this.ly = e.clientY; });
    const end = e => { if (e.pointerId === drag) drag = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', e => { this.zoom += Math.sign(e.deltaY); }, { passive: true });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    // manette tactile
    const joy = document.getElementById('joy'), knob = document.getElementById('joyknob'); let jid = null; this.joy = { x: 0, y: 0 };
    const jmove = e => { const r = joy.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } this.joy.x = dx; this.joy.y = -dy; knob.style.transform = `translate(${dx * 36}px,${dy * 36}px)`; };
    joy.addEventListener('pointerdown', e => { jid = e.pointerId; joy.setPointerCapture(jid); jmove(e); e.preventDefault(); });
    joy.addEventListener('pointermove', e => { if (e.pointerId === jid) jmove(e); });
    const jend = e => { if (e.pointerId === jid) { jid = null; this.joy.x = this.joy.y = 0; knob.style.transform = ''; } }; joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);
    const btn = (id, code, toggle) => { const b = document.getElementById(id); b.addEventListener('pointerdown', e => { e.preventDefault(); if (toggle) { this.runLock = !this.runLock; b.classList.toggle('on', this.runLock); } else this.pressed[code] = true; }); };
    btn('tb-act', 'KeyE'); btn('tb-veh', 'KeyF'); btn('tb-run', 'Run', true); btn('tb-job', 'KeyJ'); btn('tb-horn', 'KeyH');
    document.getElementById('btn-radio').addEventListener('click', () => { this.pressed.KeyR = true; });
    document.getElementById('btn-phone').addEventListener('click', () => { this.pressed.Tab = true; });
  }
  take(code) { if (this.pressed[code]) { this.pressed[code] = false; return true; } return false; }
  update() {
    const k = this.keys; let x = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.KeyQ || k.ArrowLeft ? 1 : 0), y = (k.KeyW || k.KeyZ || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    if (Math.abs(this.joy.x) + Math.abs(this.joy.y) > 0.08) { x = this.joy.x; y = this.joy.y; }
    this.move.x = x; this.move.y = y; this.run = !!(k.ShiftLeft || k.ShiftRight || this.runLock || Math.hypot(this.joy.x, this.joy.y) > 0.93);
  }
  clear() { this.pressed = {}; this.look.dx = this.look.dy = 0; }
}

export class Player {
  constructor(scene, camera, world) {
    this.scene = scene; this.cam = camera; this.world = world; this.pos = new THREE.Vector3(); this.heading = 0; this.ch = null;
    this.yaw = 0; this.pitch = 0.22; this.dist = 4.6; this.vehicle = null; this.passenger = false; this.override = null; this.speed = 0; this.camPos = new THREE.Vector3(); this.first = true; this.energy = 100;
  }
  setCharacter(ch) { const v = this.vehicle, pas = this.passenger; if (this.ch) this.ch.dispose(); this.ch = ch; this.scene.add(ch.root); ch.root.position.copy(this.pos); ch.root.rotation.y = this.heading; ch.play('idle_neutral_01', 0); if (v) v.seat(ch, pas ? 1 : 0, !pas); }
  teleport(x, z, heading = 0) { if (this.vehicle) this.exit(); this.pos.set(x, this.world.groundY(x, z), z); this.heading = heading; this.yaw = heading + Math.PI; this.first = true; if (this.ch) { this.ch.root.position.copy(this.pos); this.ch.root.rotation.set(0, heading, 0); } }
  // monte sur un véhicule : comme conducteur, ou comme passager (zémidjan, taxi)
  enter(v, passenger = false) { this.vehicle = v; this.passenger = passenger; if (!passenger) v.rider = this; this.override = null; v.seat(this.ch, passenger ? 1 : 0, !passenger); this.ch.currentName = null; this.ch.play('sit_chair_idle_neutral_01', 0); }
  exit() {
    const v = this.vehicle; if (!v) return; this.vehicle = null; if (v.rider === this) v.rider = null; if (!this.passenger) { v.speed = 0; v.steer = 0; v.visual(0); } this.passenger = false;
    const ch = this.ch; ch.pose = null; this.scene.add(ch.root); ch.root.visible = true;
    const sx = Math.cos(v.heading), sz = -Math.sin(v.heading); let p = null;
    for (const s of [1, -1]) { const x = v.pos.x + sx * (v.radius + 0.9) * s, z = v.pos.z + sz * (v.radius + 0.9) * s; if (this.world.free(x, z, 0.4)) { p = { x, z }; break; } }
    if (!p) p = this.world.freeNear(v.pos.x, v.pos.z, 0.5);
    this.pos.set(p.x, this.world.groundY(p.x, p.z), p.z); this.heading = v.heading; ch.root.position.copy(this.pos); ch.root.rotation.set(0, this.heading, 0); ch.currentName = null; ch.play('idle_neutral_01', 0);
  }
  update(dt, input, frozen, vehicles, obstacles) {
    const w = this.world, mv = frozen ? { x: 0, y: 0 } : input.move;
    if (!frozen) { this.yaw -= input.look.dx * 0.0052; this.pitch = Math.max(-0.25, Math.min(1.25, this.pitch + input.look.dy * 0.004)); this.dist = Math.max(2.2, Math.min(14, this.dist + input.zoom * 0.5)); }
    input.look.dx = input.look.dy = 0; input.zoom = 0;
    if (this.vehicle) {
      const v = this.vehicle;
      if (!this.passenger) {
        let stop = false; const sh = Math.sin(v.heading), chh = Math.cos(v.heading);
        for (const o of obstacles) { const dx = o.x - v.pos.x, dz = o.z - v.pos.z, al = dx * sh + dz * chh; if (al > 0 && al < 3 + v.speed * 0.7 && Math.abs(dx * chh - dz * sh) < 1.4) { stop = true; this.pedBrake = true; break; } }
        v.drive(dt, { x: mv.x, y: stop && v.speed > 0 ? -1 : mv.y }, w, vehicles); if (stop && v.speed > 0 && mv.y > 0) v.speed = Math.max(0, v.speed - 30 * dt);
      }
      this.pos.copy(v.pos); this.heading = v.heading; this.speed = v.speed;
      if (Math.abs(v.speed) > 2) { let d = (v.heading + Math.PI) - this.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; this.yaw += d * Math.min(1, dt * 1.6); }
    } else {
      const l = Math.hypot(mv.x, mv.y);
      if (l > 0.08 && !this.override) {
        const run = input.run && this.energy > 3, sp = (run ? 5.4 : 1.9) * Math.min(1, l), fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw), rx = Math.cos(this.yaw), rz = -Math.sin(this.yaw);
        const dx = (fx * mv.y + rx * mv.x) / l, dz = (fz * mv.y + rz * mv.x) / l;
        this.pos.x += dx * sp * dt; this.pos.z += dz * sp * dt; w.resolve(this.pos, 0.36);
        for (const v of vehicles) { const ex = this.pos.x - v.pos.x, ez = this.pos.z - v.pos.z, rr = v.radius * 0.8 + 0.3, d2 = ex * ex + ez * ez; if (d2 < rr * rr && d2 > 1e-4) { const d = Math.sqrt(d2); this.pos.x = v.pos.x + ex / d * rr; this.pos.z = v.pos.z + ez / d * rr; } }
        let d = Math.atan2(dx, dz) - this.heading; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; this.heading += d * Math.min(1, dt * 11);
        this.ch.play(run && l > 0.5 ? 'run_neutral' : 'walk_neutral', 0.18, run ? 1.75 : Math.max(0.8, sp / 1.4)); this.speed = sp; this.running = run && l > 0.5;
      } else { this.speed = 0; this.running = false; this.ch.play(this.override || 'idle_neutral_01', 0.25); }
      this.pos.y = w.groundY(this.pos.x, this.pos.z);
      this.ch.root.position.copy(this.pos); this.ch.root.rotation.y = this.heading;
    }
    this.ch.update(dt);
    // caméra
    const inV = !!this.vehicle, dist = this.dist * (inV ? (this.vehicle.type === 'bus' ? 3 : this.vehicle.isMoto ? 1.25 : 1.6) : 1), th = inV ? 1.55 : 1.45;
    const tx = this.pos.x, ty = this.pos.y + th, tz = this.pos.z, cp = Math.cos(this.pitch), ox = Math.sin(this.yaw) * cp, oy = Math.sin(this.pitch), oz = Math.cos(this.yaw) * cp;
    let dd = dist; for (let s = 0.6; s <= dist; s += 0.5) { const y = ty + oy * s; if (y < 14 && !w.free(tx + ox * s, tz + oz * s, 0.25)) { dd = Math.max(0.5, s - 0.45); break; } }
    const want = new THREE.Vector3(tx + ox * dd, Math.max(0.35, ty + oy * dd), tz + oz * dd);
    if (this.first) { this.camPos.copy(want); this.first = false; } else this.camPos.lerp(want, Math.min(1, dt * 12));
    this.cam.position.copy(this.camPos); this.cam.lookAt(tx, ty, tz);
  }
}
