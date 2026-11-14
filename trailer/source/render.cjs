// rend page.html image par image → ffmpeg (ou images de contrôle)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
const [fmt, mode, a, b2] = process.argv.slice(2); const W = fmt === 'v' ? 1080 : 1920, H = fmt === 'v' ? 1920 : 1080; const DIR = __dirname;
(async () => { const br = await chromium.launch(); const p = await (await br.newContext({ viewport: { width: W, height: H } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + DIR + '/page.html?fmt=' + fmt); await p.evaluate(() => window.READY);
  if (mode === 'events') { fs.writeFileSync(DIR + '/events.json', JSON.stringify(await p.evaluate(() => ({ events: EVENTS, dur: DURATION })))); console.log('events', errs); await br.close(); return; }
  if (mode === 'stills') { for (const t of a.split(',')) { await p.evaluate(t => seekAsync(t), +t); await p.screenshot({ path: `${DIR}/st2/${fmt}_${t}.jpg`, type: 'jpeg', quality: 85 }); } console.log('errs', errs); await br.close(); return; }
  const dur = await p.evaluate(() => DURATION), fps = 30, n = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) { await p.evaluate(t => seekAsync(t), i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 300 === 0) console.log(i, '/', n, Math.round((Date.now() - t0) / 1000) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', errs.slice(0, 5)); await br.close(); })();
