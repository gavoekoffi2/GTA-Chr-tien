// Captures d'interface pour la bande-annonce v4 (écrans réels du jeu, 1920x1080)
const L = require('./lib.cjs'); const OUT = '/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/tr/img';
(async () => {
  const { b, p } = await L.open(1920, 1080, 'high', 'lome', { owned: { moto: true, car: false, helmet: true }, money: 38450, stats: { faith: 64, love: 51, wisdom: 47 } });
  const step = async n => { for (let i = 0; i < n; i++) await p.evaluate(() => STEP(1 / 30)); };
  const shot = async (name, n = 8) => { await step(n); await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 92, timeout: 300000 }); console.log(name); };
  await p.evaluate(() => { document.getElementById('cinehide').textContent = '#touch,#toasts,#prompt{display:none!important}'; G.tod = 0.83; G.forceSky(); HIDEMARK = true; });
  const look = async (expr) => p.evaluate(e => { const f = new Function(e); CAMHOOK = () => f(); }, expr);
  // 1. comptes du soir avec Tonton Komlan
  await p.evaluate(() => { const it = G.jobs.inter.find(i => i.icon === '🛵'); const n = G.jobs.statics.find(s => s.name && s.name[0] === 'Tonton Komlan'); window.KO = n; G.player.teleport(n.x + 1.8, n.z + 1.2, 0);
    const v = G.vehicles.find(v => v.isMoto); G.jobs.shift = { kind: 'zem', v, earned: 6850, rides: 7, boss: n, warned: true, start: 1 }; });
  await look(`CAM.position.set(KO.x+4.5, 1.7, KO.z+3.2); CAM.lookAt(KO.x, 1.3, KO.z);`); await step(10);
  await p.evaluate(() => { G.tod = 0.84; G.forceSky(); G.jobs.accounts(KO); }); await shot('ui_accounts');
  await p.evaluate(() => document.querySelector('#modal-box button').click()); await shot('ui_honest', 12);
  await p.evaluate(() => document.querySelector('#dlg-choices button').click()); await shot('ui_honest2', 40);
  await p.evaluate(() => { const n = document.getElementById('dlg-next'); n && n.click(); }); await step(10);
  await p.evaluate(() => { for (let k = 0; k < 6; k++) { const c = document.querySelector('#dialog:not(.hidden) #dlg-choices button'); if (c) c.click(); const n = document.getElementById('dlg-next'); if (n) n.click(); } }); await step(20);
  await p.evaluate(() => { for (let k = 0; k < 6; k++) { const c = document.querySelector('#dlg-choices button'); if (c) c.click(); const n = document.getElementById('dlg-next'); if (n) n.click(); } G.jobs.shift = null; }); await step(10);
  // 2. boutique
  await p.evaluate(() => { const n = G.jobs.statics.find(s => s.name && s.name[0] === 'Boutique Bon Berger'); window.SH = n; G.player.teleport(n.x + 1.8, n.z + 1.2, 0); document.querySelectorAll('#modal-box button').forEach(b => /Fermer|Close/.test(b.textContent) && b.click()); });
  await look(`CAM.position.set(SH.x+4.5, 1.7, SH.z+3.2); CAM.lookAt(SH.x, 1.3, SH.z);`); await step(10);
  await p.evaluate(() => G.jobs.shopMenu()); await shot('ui_shop');
  await p.evaluate(() => { const b = document.getElementById('modal-box'); const h = [...b.querySelectorAll('h3')][2]; b.scrollTop = h.offsetTop - 20; }); await shot('ui_shop2', 4);
  await p.evaluate(() => document.getElementById('sh-x').click()); await step(4);
  // 3. Grand Jeu Biblique sur la place
  await p.evaluate(() => { const n = G.jobs.statics.find(s => s.name && s.name[0] === 'Animateur'); window.HO = n; G.player.teleport(n.x + 2, n.z + 1, 0); });
  await look(`CAM.position.set(HO.x+5, 2.0, HO.z+3.5); CAM.lookAt(HO.x, 1.3, HO.z);`); await step(10);
  await p.evaluate(() => G.jobs.gamesMenu()); await shot('ui_games');
  await p.evaluate(() => document.querySelector('[data-g="0"]').click()); await shot('ui_quiz', 10);
  await p.evaluate(() => { const ok = [...document.querySelectorAll('#modal-box .opts button')]; ok[0].click(); }); await shot('ui_quiz_a', 6);
  await p.evaluate(() => { for (let k = 0; k < 30; k++) { const b = [...document.querySelectorAll('#modal-box .opts button:not([disabled])')]; if (b.length) b[0].click(); const c = document.querySelector('#dlg-choices button:last-child'); if (c) c.click(); const n = document.getElementById('dlg-next'); if (n) n.click(); } }); await step(60);
  await p.evaluate(() => { for (let k = 0; k < 30; k++) { const b = [...document.querySelectorAll('#modal-box .opts button:not([disabled])')]; if (b.length) b[0].click(); const c = document.querySelector('#dlg-choices button:last-child'); if (c) c.click(); const n = document.getElementById('dlg-next'); if (n) n.click(); } }); await step(60);
  // 4. prière du matin à la maison
  await p.evaluate(() => { document.querySelectorAll('#modal-box button').forEach(b => /Fermer|Close/.test(b.textContent) && b.click()); const h = G.world.pois.home; window.HM = h; G.player.teleport(h.x + 1, h.z + 1, 0); G.tod = 0.3; G.forceSky(); });
  await look(`CAM.position.set(HM.x+5, 2.2, HM.z+5); CAM.lookAt(HM.x, 1.5, HM.z);`); await step(10);
  await p.evaluate(() => { G.jobs.lastTod = 0.3; S.work.sp.done = {}; G.jobs.homeAct(); }); await shot('ui_pray', 120);
  await p.evaluate(() => { const a = document.getElementById('amen'); a && a.click(); }); await step(10);
  // 5. téléphone : ma vie spirituelle
  await p.evaluate(() => { S.work.sp.done = { pray: 1, read: 1, visit: 1 }; S.work.streak = 6; S.work.day = 9; S.up = { helmet: true, engine: true, phone: true, bible: true, kiosk: true }; S.work.zem = { days: 6, trust: 5, streak: 6, recommended: true };
    const box = document.getElementById('modal-box'); document.getElementById('modal').classList.remove('hidden');
    box.innerHTML = `<div class="tabs">${['Missions', 'Ma Bible', 'Grades', 'Musique', 'Options', 'Activités', 'Ma vie'].map((t, i) => `<button class="${i === 6 ? 'on' : ''}">${t}</button>`).join('')}</div>` + G.jobs.phoneHTML(); });
  await shot('ui_life', 4);
  await b.close();
})();
