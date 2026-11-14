const L = require('./lib.cjs'), SH = require('./shots.js'); const OUT = '/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/tr/raw';
(async () => { const only = process.argv.slice(2); const { b, p } = await L.open(1920, 1080, 'high');
  for (const [k, s] of Object.entries(SH)) { if (only.length && !only.includes(k)) continue; const t0 = Date.now();
    await p.evaluate(`G.tod=${s.tod};SHOT_T=0;(${s.setup.toString()})();G.forceSky()`);
    await L.shot(p, k, OUT, s.secs, 30, 30); console.log(k, 'ok', Math.round((Date.now() - t0) / 1000), 's'); }
  await b.close(); })();
