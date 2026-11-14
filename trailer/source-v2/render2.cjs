const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
const [fmt, mode, a, from, to] = process.argv.slice(2); const W = fmt === 'v' ? 1080 : 1920, H = fmt === 'v' ? 1920 : 1080;
(async () => { const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await br.newContext({ viewport: { width: W, height: H } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8790/trailer2.html?fmt=' + fmt); await p.waitForFunction('window.READY === true', null, { timeout: 300000 });
  if (mode === 'events') { fs.writeFileSync(__dirname + '/events2.json', JSON.stringify(await p.evaluate(() => ({ events: EVENTS, dur: DURATION })))); console.log('events', errs); await br.close(); return; }
  if (mode === 'stills') { fs.mkdirSync(__dirname + '/st3', { recursive: true }); for (const t of a.split(',')) { await p.evaluate(t => seekAsync(t), +t); await p.screenshot({ path: `${__dirname}/st3/${fmt}_${t}.jpg`, type: 'jpeg', quality: 85 }); } console.log('errs', errs.slice(0, 8)); await br.close(); return; }
  const dur = await p.evaluate(() => DURATION), fps = 30, f0 = Math.round((+from || 0) * fps), f1 = Math.round((+to || dur) * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', a], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = f0; i < f1; i++) { await p.evaluate(t => seekAsync(t), i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 93 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if ((i - f0) % 150 === 0) console.log(i, '/', f1, Math.round((Date.now() - t0) / 1000) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', errs.slice(0, 5)); await br.close(); })();
