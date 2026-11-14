const L = require('./lib.cjs'); const S = '/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/tr/cities/';
(async () => { require('fs').mkdirSync(S, { recursive: true });
  for (const c of (process.argv[2] || 'cotonou,accra,abidjan,lagos,paris,london').split(',')) {
    const { b, p } = await L.open(1600, 900, 'high', c);
    await p.evaluate(() => { window.SHOT_T = 0; const o = G.world.pois.landmark || G.world.pois.church; G.tod = 0.815; G.forceSky(); G.player.teleport(o.x + 10, o.z + 10, 0);
      CAMHOOK = () => { const a = 2.3 + SHOT_T * 0.25; CAM.position.set(o.x + Math.sin(a) * 150, 62 - SHOT_T * 10, o.z + Math.cos(a) * 150); CAM.lookAt(o.x, 8, o.z); }; });
    for (let i = 0; i < 12; i++) await p.evaluate(() => STEP(1 / 30));
    for (const t of [0, 1]) { await p.evaluate(t => { SHOT_T = t; return STEP(1 / 30); }, t); await p.screenshot({ path: `${S}${c}_${t}.jpg`, type: 'jpeg', quality: 92, timeout: 180000 }); }
    console.log(c, 'ok'); await b.close(); }
})();
