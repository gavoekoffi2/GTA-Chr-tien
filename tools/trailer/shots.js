// Plans de la bande-annonce : setup() dans la page, CAMHOOK lit SHOT_T (0→1)
const near = `const nn = (x, z) => { const w = G.world; const i = w.nearestMain(x, z); return w.nodes[i]; };`;
module.exports = {
  ocean: { tod: 0.835, secs: 5.6, setup: () => { const z0 = G.world.shoreZ(391); G.player.teleport(391, z0 - 60, 0);
    CAMHOOK = () => { const t = SHOT_T; CAM.position.set(391 - 40 + t * 30, 6 + t * 10, z0 + 120 - t * 70); CAM.lookAt(391, 18, z0 - 400); }; } },
  aerial: { tod: 0.845, secs: 4.6, setup: () => { const o = G.world.pois.church; G.player.teleport(o.x + 20, o.z + 20, 0);
    CAMHOOK = () => { const t = SHOT_T, a = 0.9 + t * 0.3; CAM.position.set(o.x + Math.sin(a) * 190, 95 - t * 15, o.z + Math.cos(a) * 190); CAM.lookAt(o.x, 10, o.z); }; } },
  church: { tod: 0.845, secs: 2.4, setup: () => { const o = G.world.pois.church, w = G.world; const n = w.nodes[w.nearestMain(o.x, o.z + 40)]; G.player.teleport(n.x, n.z, 0); window.SP = n;
    CAMHOOK = () => { const t = SHOT_T, dx = o.x - SP.x, dz = o.z - SP.z, d = Math.hypot(dx, dz); CAM.position.set(SP.x - dx / d * 6 * (1 - t), 1.3 + t * 1.5, SP.z - dz / d * 6 * (1 - t)); CAM.lookAt(o.x, 14 + t * 4, o.z); }; } },
  street: { tod: 0.84, secs: 2.6, setup: () => { const o = G.world.pois.market; const n = G.world.nodes[G.world.nearestMain(o.x, o.z)]; G.player.teleport(n.x + 3, n.z + 3, 0); window.SP = n;
    CAMHOOK = () => { const t = SHOT_T; CAM.position.set(SP.x + 2 + t * 4, 1.1, SP.z + 2); CAM.lookAt(SP.x + 30, 2.2, SP.z - 18); }; } },
  zem: { tod: 0.84, secs: 2.6, setup: () => { const o = G.world.pois.market; G.player.teleport(o.x, o.z, 0);
    window.FOLLOW = null; CAMHOOK = () => { if (!FOLLOW) { const m = G.traffic.cars.filter(c => c.isMoto && c.riders.length && c.speed > 3).sort((a, b) => Math.hypot(a.pos.x - o.x, a.pos.z - o.z) - Math.hypot(b.pos.x - o.x, b.pos.z - o.z)); if (m.length) FOLLOW = m[0]; }
      const v = FOLLOW; if (!v) return; const h = v.heading, s = SHOT_T, side = 1.6 - s * 3.0; CAM.position.set(v.pos.x - Math.sin(h) * 3.6 + Math.cos(h) * side, 1.35, v.pos.z - Math.cos(h) * 3.6 - Math.sin(h) * side); CAM.lookAt(v.pos.x + Math.sin(h) * 3, 1.0, v.pos.z + Math.cos(h) * 3); }; } },
  night: { tod: 0.975, secs: 3.4, setup: () => { const o = G.world.pois.market; const n = G.world.nodes[G.world.nearestMain(o.x + 40, o.z)]; G.player.teleport(n.x, n.z, 0); window.SP = n;
    CAMHOOK = () => { const t = SHOT_T; CAM.position.set(SP.x - 30 + t * 12, 14 - t * 5, SP.z + 30 - t * 12); CAM.lookAt(SP.x + 20, 0, SP.z - 20); }; } },
  hero: { tod: 0.84, secs: 5.6, setup: () => { const o = G.world.pois.market; const n = G.world.nodes[G.world.nearestMain(o.x - 30, o.z)]; G.player.teleport(n.x, n.z, 0.7);
    CAMHOOK = () => { const t = SHOT_T, p = G.player.pos, a = 0.7 + 0.6 - t * 0.9, r = 2.4 - t * 0.5; CAM.position.set(p.x + Math.sin(a) * r, p.y + 1.0 + t * 0.35, p.z + Math.cos(a) * r); CAM.lookAt(p.x, p.y + 1.5, p.z); }; } },
  taxi: { tod: 0.84, secs: 2.6, setup: () => { const o = G.world.pois.market; G.player.teleport(o.x, o.z, 0);
    window.FOLLOW = null; CAMHOOK = () => { if (!FOLLOW) { const m = G.traffic.cars.filter(c => !c.isMoto && c.speed > 3).sort((a, b) => Math.hypot(a.pos.x - o.x, a.pos.z - o.z) - Math.hypot(b.pos.x - o.x, b.pos.z - o.z)); if (m.length) FOLLOW = m[0]; }
      const v = FOLLOW; if (!v) return; const h = v.heading, s = SHOT_T; CAM.position.set(v.pos.x + Math.sin(h) * (8 - s * 2.5) + Math.cos(h) * 2.6, 0.6 + s * 0.5, v.pos.z + Math.cos(h) * (8 - s * 2.5) - Math.sin(h) * 2.6); CAM.lookAt(v.pos.x, 0.9, v.pos.z); }; } },
};
