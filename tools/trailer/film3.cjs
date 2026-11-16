// Tournage v3 : le joueur à moto dans Lomé, devant les monuments modélisés (image par image, 30 i/s)
const L = require('./lib.cjs'); const OUT = '/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/t3/raw';
const MON = [-773.7, 4.4], COL = [781, -2153], CATH = [375.6, 561.1], HOT = [-901, 169], PAL = [-601.6, -62.3];
// trajectoires (repère jeu x, z)
const circle = (c, r, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]; });
const SHOTS = {
  // vol de drone : de la mer de toits vers la place de l'Indépendance (monument, hôtel, palais)
  drone_lome: { tod: 0.83, secs: 4.6, setup: `G.player.teleport(-640, 120, 0);`, cam: `const t=SHOT_T, e=t*t*(3-2*t); CAM.position.set(-560-150*e, 95-45*e, 260-150*e); CAM.lookAt(-800+30*e, 10, 40-10*e);` },
  // rue animée près du Grand Marché
  street_mkt: { tod: 0.83, secs: 2.2, setup: `const n=G.world.nodes[G.world.nearestMain(470,400)]; G.player.teleport(n.x+40, n.z+40, 0); window.SP=n;`, cam: `const t=SHOT_T; CAM.position.set(SP.x+3+t*5, 1.3, SP.z+3); CAM.lookAt(SP.x+35, 2.5, SP.z-20);` },
  // la cathédrale : contre-plongée qui s'élève
  cath_dolly: { tod: 0.83, secs: 2.6, setup: `G.player.teleport(${CATH[0] - 0.324 * 45}, ${CATH[1] - 0.946 * 45}, 0);`, cam: `const t=SHOT_T, F=[-0.324,-0.946]; CAM.position.set(${CATH[0]}+F[0]*(38-6*t)+0.946*4, 1.6+3*t, ${CATH[1]}+F[1]*(38-6*t)-0.324*4); CAM.lookAt(${CATH[0]}+F[0]*20, 16+4*t, ${CATH[1]}+F[1]*20);` },
  // à moto autour du monument : poursuite basse
  ride_chase: { tod: 0.83, secs: 4.4, ride: circle(MON, 46, -0.6, 2.6, 60), speed: 12, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h), ox=v.pos.x-(${MON[0]}), oz=v.pos.z-(${MON[1]}), l=Math.hypot(ox,oz); CAM.position.set(v.pos.x-s*5.0+ox/l*1.6, 1.85, v.pos.z-c*5.0+oz/l*1.6); CAM.lookAt(v.pos.x*0.78+(${MON[0]})*0.22+s*5, 2.4, v.pos.z*0.78+(${MON[1]})*0.22+c*5);` },
  // travelling latéral : la moto passe, le monument et la tour en fond
  ride_side: { tod: 0.83, secs: 3.2, ride: circle(MON, 46, 1.1, 2.9, 40), speed: 11, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h), ox=v.pos.x-(${MON[0]}), oz=v.pos.z-(${MON[1]}), l=Math.hypot(ox,oz); CAM.position.set(v.pos.x+ox/l*8-s*1.5, 1.25, v.pos.z+oz/l*8-c*1.5); CAM.lookAt(v.pos.x+s*1.2, 2.0, v.pos.z+c*1.2);` },
  // drone qui suit la moto autour du monument
  ride_drone: { tod: 0.83, secs: 4.0, ride: circle(MON, 46, 2.2, 5.0, 50), speed: 12, cam: `const v=RV, h=v.heading, s=Math.sin(h), c=Math.cos(h), t=SHOT_T; CAM.position.set(v.pos.x-s*22+(${MON[0]}-v.pos.x)*0.15, 20-4*t, v.pos.z-c*22+(${MON[1]}-v.pos.z)*0.15); CAM.lookAt((v.pos.x*2+${MON[0]})/3, 4, (v.pos.z*2+${MON[1]})/3);` },
  // la moto passe devant la cathédrale (caméra fixe basse)
  ride_cath: { tod: 0.83, secs: 2.8, ride: [[338, 534], [359, 527], [374, 521], [392, 514], [410, 507]], speed: 11, cam: `const t=SHOT_T; CAM.position.set(370+t*6, 1.0, 503); CAM.lookAt(${CATH[0]}+t*4, 12, ${CATH[1]});` },
  // arrivée sur la place de la Paix : la moto fonce vers la caméra, la Colombe derrière
  ride_col_front: { tod: 0.83, secs: 3.0, ride: [[797, -2250], [795, -2215], [792, -2185]].concat(circle(COL, 19, -1.5, 1.4, 24)), speed: 12, cam: `const v=RV, t=SHOT_T; CAM.position.set(${COL[0]}+12, 1.5+1.5*t, ${COL[1]}+34); CAM.lookAt(${COL[0]}*0.7+v.pos.x*0.3, 6+2*t, ${COL[1]}*0.7+v.pos.z*0.3);` },
  // orbite de drone autour de la Colombe, la moto tourne dans le rond-point
  ride_col_drone: { tod: 0.83, secs: 3.6, ride: circle(COL, 19, 0.6, 4.4, 40), speed: 11, cam: `const t=SHOT_T, a=2.2+t*0.9; CAM.position.set(${COL[0]}+Math.cos(a)*40, 24-6*t, ${COL[1]}-Math.sin(a)*40); CAM.lookAt(${COL[0]}, 8, ${COL[1]});` },
  // à pied vers la cathédrale (prière)
  walk_cath: { tod: 0.83, secs: 2.8, walk: { from: [CATH[0] - 0.324 * 34, CATH[1] - 0.946 * 34], dir: [0.324, 0.946] }, cam: `const p=G.player.pos, t=SHOT_T; CAM.position.set(p.x-0.324*4.2+0.946*1.0, 1.7, p.z-0.946*4.2-0.324*1.0); CAM.lookAt(p.x+0.324*12, 7+3*t, p.z+0.946*12);` },
  // silhouette au coucher du soleil devant le monument
  hero_mon: { tod: 0.865, secs: 3.2, setup: `G.player.teleport(${MON[0]} + 0.8 * 20, ${MON[1]} + 0.6 * 20, Math.atan2(-0.8, -0.6));`, cam: `const p=G.player.pos, t=SHOT_T, a=0.62+0.5-0.7*t; CAM.position.set(p.x+Math.sin(a)*3.2, p.y+0.9+0.4*t, p.z+Math.cos(a)*3.2); CAM.lookAt(p.x-0.8*6, p.y+3.5+2*t, p.z-0.6*6);` },
  // nuit : la Colombe éclairée
  night_col: { tod: 0.975, secs: 3.2, setup: `G.player.teleport(${COL[0] + 30}, ${COL[1] + 30}, 0);`, cam: `const t=SHOT_T, a=0.6+t*0.5; CAM.position.set(${COL[0]}+Math.cos(a)*34, 7+4*t, ${COL[1]}-Math.sin(a)*34); CAM.lookAt(${COL[0]}, 10, ${COL[1]});` },
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
      G.player.pos.copy(v.pos); G.player.heading = h; };
  });
  for (const [k, s] of Object.entries(SHOTS)) {
    if (only.length && !only.includes(k)) continue; const t0 = Date.now();
    await p.keyboard.up('KeyW');
    await p.evaluate(([s]) => {
      G.tod = s.tod; G.forceSky(); SHOT_T = 0; RIDE = null;
      if (G.player.vehicle) G.player.exit();
      if (s.setup) eval(s.setup);
      if (s.ride) { const r0 = s.ride[0], r1 = s.ride[1]; RV.place(r0[0], r0[1], Math.atan2(r1[0] - r0[0], r1[1] - r0[1])); G.player.teleport(r0[0] + 3, r0[1] + 3, 0); G.player.enter(RV); RIDE = mkRide(s.ride, s.speed); }
      if (s.walk) { G.player.teleport(s.walk.from[0], s.walk.from[1], Math.atan2(s.walk.dir[0], s.walk.dir[1])); G.player.yaw = Math.atan2(-s.walk.dir[0], -s.walk.dir[1]); }
      const cam = new Function(s.cam); CAMHOOK = (dt) => { rideStep(dt); if (s.walk) G.player.yaw = Math.atan2(-s.walk.dir[0], -s.walk.dir[1]); cam(); };
    }, [s]);
    if (s.walk) await p.keyboard.down('KeyW');
    await L.shot(p, k, PV ? OUT + '_pv' : OUT, PV ? 0.04 : s.secs, 30, PV ? Math.round(s.secs * 15) : (s.ride ? 12 : 24));
    console.log(k, 'ok', Math.round((Date.now() - t0) / 1000), 's');
  }
  await b.close();
})();
