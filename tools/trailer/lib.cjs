// Outils de capture cinématographique pour la bande-annonce Zion City
const { chromium } = require('playwright');
exports.open = async (w = 1920, h = 1080, q = 'high', city = 'lome', extra = {}) => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() == 'error') console.log('ERR', m.text().slice(0, 200)); });
  await p.addInitScript(([city, extra]) => {
    // horloge virtuelle : le jeu avance exactement de VT entre deux images capturées
    window.VT = 0; const real = performance.now.bind(performance); let base = null;
    window.REALTIME = true; performance.now = () => { if (window.REALTIME) return real(); return window.VT * 1000; };
    localStorage.setItem('lumiere-dans-la-ville-v1', JSON.stringify(Object.assign({ v: 2, started: true, name: 'Kofi', city, grade: 3, mode: 'city', money: 25000, energy: 100, settings: { quality: 'high', sound: 0, music: 0 } }, extra)));
  }, [city, extra]);
  await p.goto('http://localhost:8765/index.html?q=' + q); await p.waitForFunction('window.READY===true', null, { timeout: 600000 });
  await p.click('#btn-continue'); await p.waitForTimeout(1500);
  await p.evaluate(() => {
    const st = document.createElement('style'); st.textContent = '#hud,#touch,#toasts,#dialog,#prompt,#objective{display:none!important}'; st.id = 'cinehide'; document.head.appendChild(st);
    window.CAM = G.player.cam; G.player.cam = new CAM.constructor(); window.CAMHOOK = null;
    const ou = G.world.update.bind(G.world); G.world.update = (dt, t) => { ou(dt, t); if (window.CAMHOOK) window.CAMHOOK(dt); if (window.HIDEMARK) G.scene.traverse(o => { if (o.isSprite || (o.userData && o.userData.dia)) o.visible = false; }); };
    window.HIDEMARK = true;
    // un pas de jeu = 1/30 s
    window.REALTIME = false; window.VT = 1000;
    window.STEP = (dt) => new Promise(r => { window.VT += dt; G.hold = false; requestAnimationFrame(() => { G.hold = true; r(); }); });
    G.missions.update = () => {}; // pas de dialogues de mission pendant le tournage
  });
  return { b, p };
};
// tourne un plan : setup(page) puis n images, cam(t) évaluée dans la page
exports.shot = async (p, name, dir, secs, fps = 30, warm = 20) => {
  const fs = require('fs'); fs.mkdirSync(dir + '/' + name, { recursive: true });
  for (let i = 0; i < warm; i++) await p.evaluate(() => STEP(1 / 30));
  const n = Math.round(secs * fps);
  for (let i = 0; i < n; i++) { await p.evaluate(([i, n]) => { window.SHOT_T = i / n; return STEP(1 / 30); }, [i, n]); await p.screenshot({ path: `${dir}/${name}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92, timeout: 180000 }); }
};
