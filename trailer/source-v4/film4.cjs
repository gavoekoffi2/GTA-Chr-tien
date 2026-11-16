// Tournage v3 : le joueur à moto dans Lomé, devant les monuments modélisés (image par image, 30 i/s)
const L = require('./lib.cjs'); const OUT = '/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/t4/raw';
const MON = [-773.7, 4.4], COL = [781, -2153], CATH = [375.6, 561.1], HOT = [-901, 169], PAL = [-601.6, -62.3];
// trajectoires (repère jeu x, z)
const circle = (c, r, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]; });
const SHOTS = {
  // ambulance qui fonce (poursuite basse), gyrophare
  amb_chase: { tod: 0.83, secs: 3.4, warm: 30, setup: `const sp=G.act.spots.find(s=>s.a.id==='ambulance'); G.act.run(sp.a, sp); await new Promise(r=>setTimeout(r,50)); RV=G.player.vehicle; const h=G.world.poi('hospital'); RPATH=roadPath(h.x+260, h.z+120, 160);`, ridePath: 1, speed: 15, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h), t=SHOT_T; CAM.position.set(v.pos.x+s*9-c*2.5, 1.2, v.pos.z+c*9+s*2.5); CAM.lookAt(v.pos.x, 1.6, v.pos.z);` },
  amb_drone: { keep: 1, tod: 0.83, secs: 3.0, warm: 10, setup: `RV=G.player.vehicle; const h=G.world.poi('hospital'); RPATH=roadPath(h.x-200, h.z+180, 140);`, ridePath: 1, speed: 15, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h), t=SHOT_T; CAM.position.set(v.pos.x-s*8+c*4, 6.5-1.5*t, v.pos.z-c*8-s*4); CAM.lookAt(v.pos.x+s*6, 0, v.pos.z+c*6);`, after: `G.act.stop(true);` },
  // un client fait signe, la moto s'arrête
  zem_wave: { tod: 0.83, secs: 3.0, warm: 20, setup: `G.act.stop(true); RV=G.vehicles.find(v=>v.isMoto&&!v.lent); const m=G.world.pois.market; RPATH=roadPath(m.x+150, m.z-160, 70); const e=RPATH[RPATH.length-1], q=RPATH[RPATH.length-2], dx=e[0]-q[0], dz=e[1]-q[1], l=Math.hypot(dx,dz); WC=await G.crowd.addStatic('ama', e[0]-dz/l*2.6+dx/l*1.5, e[1]+dx/l*2.6+dz/l*1.5, Math.atan2(-dz/l, dx/l)+Math.PI/2+Math.PI, 'wave_01', ''); WD=[dx/l,dz/l];`, ridePath: 1, speed: 11, cam: `const t=SHOT_T; RIDE.speed=Math.max(0.3, 11*(1-Math.pow(t,0.7)*1.05)); CAM.position.set(WC.x+WD[0]*3.0+WD[1]*1.4, 1.35, WC.z+WD[1]*3.0-WD[0]*1.4); CAM.lookAt(RV.pos.x*0.6+WC.x*0.4, 1.2, RV.pos.z*0.6+WC.z*0.4);` },
  // le client monte derrière : travelling latéral
  zem_pax: { tod: 0.83, secs: 3.2, warm: 14, setup: `RV=G.vehicles.find(v=>v.isMoto&&!v.lent); const i=G.crowd.statics.indexOf(WC); if(i>=0) G.crowd.statics.splice(i,1); RV.seat(WC.ch,1,false); const c=G.world.pois.church; RPATH=roadPath(c.x+120, c.z-90, 120);`, ridePath: 1, speed: 11, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h); CAM.position.set(v.pos.x+c*4.2+s*1.0, 1.25, v.pos.z-s*4.2+c*1.0); CAM.lookAt(v.pos.x+s*0.6, 1.0, v.pos.z+c*0.6);`, after: `RV.mesh.remove(WC.ch.root); WC.ch.dispose();` },
  // le taxi traverse la ville
  taxi_drive: { tod: 0.83, secs: 3.0, warm: 14, setup: `const u=G.eco.units.find(u=>u.kind==='taxi'); u.busy=true; RV=u.v; G.player.teleport(0,-3000,0); const st=G.world.pois.station; RPATH=roadPath(st.x+200, st.z+200, 140);`, ridePath: 1, enter: 0, speed: 12, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h), t=SHOT_T; CAM.position.set(v.pos.x+s*10+c*3.5, 1.4+t, v.pos.z+c*10-s*3.5); CAM.lookAt(v.pos.x, 1.2, v.pos.z);` },
  // course de moto : anneaux bleus
  race: { tod: 0.83, secs: 3.4, warm: 100, setup: `const sp=G.act.spots.find(s=>s.a.id==='race'); G.act.run(sp.a, sp); await new Promise(r=>setTimeout(r,50)); RV=G.player.vehicle; RACE=1;`, raceRide: 1, marks: 1, speed: 15, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h); CAM.position.set(v.pos.x-s*6.5, 2.6, v.pos.z-c*6.5); CAM.lookAt(v.pos.x+s*8, 1.2, v.pos.z+c*8);`, after: `G.act.stop(true); RACE=0;` },
  // jeux publics : animateur, foule
  square: { tod: 0.83, secs: 3.0, warm: 20, setup: `const h=G.jobs.statics.find(n=>n.name&&n.name[0]==='Animateur'); HO=h; G.player.teleport(h.x+2.2, h.z+0.8, 0); G.player.heading=Math.atan2(h.x-G.player.pos.x, h.z-G.player.pos.z); G.player.ch.root.rotation.y=G.player.heading;`, cam: `const t=SHOT_T, a=0.3+t*0.8; CAM.position.set(HO.x+Math.cos(a)*4.6, 1.7, HO.z+Math.sin(a)*4.6); CAM.lookAt(HO.x+1, 1.4, HO.z+0.4);` },
  // culte du soir : la cathédrale au crépuscule
  church_eve: { tod: 0.858, secs: 3.0, walk: { from: [CATH[0] - 0.324 * 30, CATH[1] - 0.946 * 30], dir: [0.324, 0.946] }, cam: `const p=G.player.pos, t=SHOT_T; CAM.position.set(p.x-0.324*6+0.946*3, 1.2+0.6*t, p.z-0.946*6-0.324*3); CAM.lookAt(p.x+0.324*14, 9, p.z+0.946*14);` },
};
(async () => {
  const only = process.argv.slice(2), PV = !!process.env.PREVIEW; const { b, p } = await L.open(PV ? 960 : 1920, PV ? 540 : 1080, 'high', 'lome', { owned: { moto: true, car: false, helmet: true } });
  await p.evaluate(() => {
    window.SHOT_T = 0;
    window.RIDE = null; window.RV = G.vehicles.find(v => v.isMoto) || G.eco.units.find(u => u.kind === 'zem').v;
    window.mkRide = (pts, speed) => { // Catmull-Rom + table d'abscisse curviligne
      const P = []; const g = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
      for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 8; k++) { const t = k / 8, a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2), f = (j) => 0.5 * ((2 * b[j]) + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t * t * t); P.push([f(0), f(1)]); }
      P.push(pts[pts.length - 1]); const S = [0]; for (let i = 1; i < P.length; i++) S.push(S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
      return { P, S, speed, s: 0 };
    };
    window.rideStep = (dt) => { const R = RIDE; if (!R) return; R.s = Math.min(R.S[R.S.length - 1] - 0.01, R.s + R.speed * dt); let i = 1; while (R.S[i] < R.s) i++;
      const u = (R.s - R.S[i - 1]) / (R.S[i] - R.S[i - 1]), x = R.P[i - 1][0] + (R.P[i][0] - R.P[i - 1][0]) * u, z = R.P[i - 1][1] + (R.P[i][1] - R.P[i - 1][1]) * u;
      const h = Math.atan2(R.P[i][0] - R.P[i - 1][0], R.P[i][1] - R.P[i - 1][1]); let dh = h - RV.heading; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
      const v = RV; v.steer = Math.max(-1, Math.min(1, -dh / Math.max(dt, 1e-3) * 0.12)); v.heading = h; v.speed = R.speed; v.pos.set(x, G.world.groundY(x, z), z); v.mesh.rotation.y = h; v.visual(dt);
      if (G.player.vehicle === v) { G.player.pos.copy(v.pos); G.player.heading = h; } };
    window.roadPath = (x, z, len) => { const w = G.world, a = w.nearestMain(x, z), cand = w.nodesNear(x, z, 600).filter(i => w.comp[i] === w.mainComp && Math.hypot(w.nodes[i].x - w.nodes[a].x, w.nodes[i].z - w.nodes[a].z) > len * 1.3);
      let best = null; for (let k = 0; k < 20 && cand.length; k++) { const p = w.findPath(a, cand[Math.random() * cand.length | 0]); if (!p) continue; let n = 0; for (let i = 1; i < p.length; i++) { const A = w.nodes[p[i - 1]], B = w.nodes[p[i]]; const tr = i > 1 ? Math.abs(Math.atan2(B.x - A.x, B.z - A.z) - Math.atan2(A.x - w.nodes[p[i - 2]].x, A.z - w.nodes[p[i - 2]].z)) : 0; n += Math.min(tr, 6.283 - tr); } if (!best || n < best.n) best = { p, n }; }
      const pts = []; let acc = 0; const P = best.p.map(i => w.nodes[i]);
      for (let i = 0; i < P.length; i++) { const A = P[Math.max(0, i - 1)], B = P[Math.min(P.length - 1, i + 1)], dx = B.x - A.x, dz = B.z - A.z, l = Math.hypot(dx, dz) || 1; pts.push([P[i].x - dz / l * 1.8, P[i].z + dx / l * 1.8]); if (i) acc += Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z); if (acc > len) break; }
      return pts; };

  });
  for (const [k, s] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(k)) continue; const t0 = Date.now();
    await p.keyboard.up('KeyW');
    await p.evaluate(async ([s]) => {
      HIDEMARK = !s.marks; if (!window.__css) { window.__css = 1; document.getElementById('cinehide').textContent += '#banner,#mini,#modal,#fade{display:none!important}'; }
      G.tod = s.tod; G.forceSky(); SHOT_T = 0; RIDE = null;
      if (G.player.vehicle && !s.keep) G.player.exit();
      if (s.setup) await eval('(async()=>{' + s.setup + '})()');
      if (s.ridePath) { const r0 = RPATH[0], r1 = RPATH[1]; RV.place(r0[0], r0[1], Math.atan2(r1[0] - r0[0], r1[1] - r0[1])); if (s.enter !== 0 && !G.player.vehicle) { G.player.teleport(r0[0] + 3, r0[1] + 3, 0); if (RV.isMoto || RV.lent) G.player.enter(RV); } RIDE = mkRide(RPATH, s.speed); }
      if (s.ride) { const r0 = s.ride[0], r1 = s.ride[1]; RV.place(r0[0], r0[1], Math.atan2(r1[0] - r0[0], r1[1] - r0[1])); G.player.teleport(r0[0] + 3, r0[1] + 3, 0); G.player.enter(RV); RIDE = mkRide(s.ride, s.speed); }
      if (s.walk) { G.player.teleport(s.walk.from[0], s.walk.from[1], Math.atan2(s.walk.dir[0], s.walk.dir[1])); G.player.yaw = Math.atan2(-s.walk.dir[0], -s.walk.dir[1]); }
      const cam = new Function(s.cam); CAMHOOK = (dt) => { if (s.raceRide && G.act.targets[0] && (!RIDE || RIDE.tg !== G.act.targets[0])) { const tg = G.act.targets[0], pp = RV.pos; const w = G.world, pth = w.findPath(w.nearestMain(pp.x, pp.z), w.nearestMain(tg.x, tg.z)); if (pth && pth.length > 1) { const pts = [[pp.x, pp.z]].concat(pth.slice(1).map(i => [w.nodes[i].x, w.nodes[i].z])); RIDE = mkRide(pts, s.speed); RIDE.tg = tg; } } rideStep(dt); if (s.walk) G.player.yaw = Math.atan2(-s.walk.dir[0], -s.walk.dir[1]); cam(); };
    }, [s]);
    if (s.walk) await p.keyboard.down('KeyW');
    await L.shot(p, k, PV ? OUT + '_pv' : OUT, PV ? 0.04 : s.secs, 30, PV ? Math.round(s.secs * 15) : (s.warm || (s.ride ? 12 : 24)));
    if (s.after) await p.evaluate(a => eval(a), s.after);
    console.log(k, 'ok', Math.round((Date.now() - t0) / 1000), 's');
  }
  await b.close();
})();
