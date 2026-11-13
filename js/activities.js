// Activités rejouables (course de moto, ambulance, tirs au but, chorale, quiz éclair, grand nettoyage)
// et événements imprévus dans la rue (voleur, grand-mère, panne, enfant perdu).
import * as THREE from 'three';
import { S, L, save } from './state.js';
import { ui, esc } from './ui.js';
import { Vehicle } from './vehicles.js';
import { makeMarker, makeItem } from './npc.js';
import { VERSES } from './content.js';
import { audio } from './audio.js';
import { fmt } from './economy.js';

const STOP = { stop: true };
const D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const tm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const T = {
  start: ['Commencer', 'Start'], later: ['Plus tard', 'Later'], best: ['Record', 'Best'], reward: ['Gain', 'Reward'], none: ['aucun', 'none'],
  success: ['ACTIVITÉ RÉUSSIE', 'ACTIVITY COMPLETE'], fail: ['ÉCHEC', 'FAILED'], newRec: ['Nouveau record !', 'New record!'], go: ['PARTEZ !', 'GO!'],
  timeUp: ['Temps écoulé', 'Time is up'], help: ['Aider', 'Help'], push: ['Pousser (appuie plusieurs fois)', 'Push (tap repeatedly)'],
  eventDone: ['BONNE ACTION', 'GOOD DEED'], gone: ['Trop tard, la personne est partie.', 'Too late, the person has left.'],
};
const t = k => L(T[k]);

// ---------- icônes flottantes visibles de loin ----------
const iconCache = {};
export function makeIcon(emoji, color = '#f5c542') {
  const k = emoji + color;
  if (!iconCache[k]) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(66, 68, 56, 0, 7); g.fill();
    g.fillStyle = color; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.lineWidth = 7; g.strokeStyle = '#fff'; g.stroke();
    g.font = '64px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(emoji, 64, 70);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; iconCache[k] = tx;
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconCache[k], depthTest: false, fog: false, transparent: true }));
  s.renderOrder = 10; s.scale.setScalar(2.4); return s;
}
export function scaleIcon(sprite, cam, base = 2.4) { const d = sprite.getWorldPosition(_v).distanceTo(cam.position); sprite.scale.setScalar(Math.max(base, Math.min(14, d * 0.045))); }
const _v = new THREE.Vector3();

// ---------- bannière façon « mission réussie » ----------
let banner = null;
function showBanner(title, sub, gold = true, ms = 3200) {
  if (!banner) { banner = document.createElement('div'); banner.id = 'banner'; document.body.appendChild(banner); }
  banner.className = gold ? 'gold' : 'red'; banner.innerHTML = `<b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}`; banner.classList.add('show');
  clearTimeout(showBanner.t); showBanner.t = setTimeout(() => banner.classList.remove('show'), ms);
}

// ---------- surcouche des mini-jeux ----------
function overlay() { const el = document.createElement('div'); el.id = 'mini'; el.innerHTML = '<canvas></canvas><div class="mini-top"></div>'; document.body.appendChild(el); const cv = el.querySelector('canvas'); const fit = () => { cv.width = innerWidth * Math.min(2, devicePixelRatio || 1); cv.height = innerHeight * Math.min(2, devicePixelRatio || 1); }; fit(); addEventListener('resize', fit); return { el, cv, g: cv.getContext('2d'), top: el.querySelector('.mini-top'), close() { removeEventListener('resize', fit); el.remove(); } }; }

const ACTS = [
  { id: 'race', at: 'landmark', icon: '🏁', color: '#2f7fd6', name: ['Course de moto', 'Motorbike race'], desc: ['Traverse la ville d’un point de contrôle à l’autre avant la fin du chrono. Prudence avec les piétons !', 'Ride through the city from checkpoint to checkpoint before the clock runs out. Mind the pedestrians!'], rec: 'time', reward: ['jusqu’à 1 500 F', 'up to 1,500 F'] },
  { id: 'ambulance', at: 'hospital', icon: '🚑', color: '#c62828', name: ['Ambulancier', 'Paramedic'], desc: ['Prends l’ambulance et ramène 3 blessés à l’hôpital le plus vite possible. « J’étais malade, et vous m’avez visité. »', 'Take the ambulance and bring 3 injured people to the hospital as fast as you can. "I was sick, and ye visited me."'], rec: 'count', reward: ['500 F par patient', '500 F per patient'] },
  { id: 'penalty', at: 'stadium', icon: '⚽', color: '#1d7a46', name: ['Tirs au but', 'Penalty shoot-out'], desc: ['5 tirs face au gardien. Vise bien et appuie au bon moment !', '5 shots against the keeper. Aim well and press at the right moment!'], rec: 'score', reward: ['100 F par but', '100 F per goal'] },
  { id: 'choir', at: 'church', icon: '🎵', color: '#8a3d7a', name: ['Chorale de l’église', 'Church choir'], desc: ['Chante avec la chorale : appuie sur les notes au bon moment (D F J K ou touche l’écran).', 'Sing with the choir: hit the notes on time (D F J K or tap the screen).'], rec: 'score', reward: ['Foi + argent', 'Faith + money'] },
  { id: 'quiz', at: 'school', icon: '📖', color: '#d98a00', name: ['Quiz éclair', 'Lightning quiz'], desc: ['8 versets, 12 secondes chacun : retrouve la bonne référence biblique.', '8 verses, 12 seconds each: find the right Bible reference.'], rec: 'score', reward: ['Sagesse + 60 F par réponse', 'Wisdom + 60 F per answer'] },
  { id: 'clean', at: 'park', icon: '🧹', color: '#0d6f73', name: ['Grand nettoyage', 'Big clean-up'], desc: ['Ramasse 12 déchets dans le quartier en 2 min 30. « La terre appartient à l’Éternel. »', 'Pick up 12 pieces of rubbish in 2 min 30. "The earth is the LORD’s."'], rec: 'time', reward: ['600 F', '600 F'] },
];
const LYRICS = [
  ['Louez l’Éternel ! Louez Dieu dans son sanctuaire !', 'Praise ye the LORD. Praise God in his sanctuary!'],
  ['Saint, saint, saint est l’Éternel des armées !', 'Holy, holy, holy, is the LORD of hosts!'],
  ['Toute la terre est pleine de sa gloire !', 'The whole earth is full of his glory!'],
  ['Chantez à l’Éternel un cantique nouveau !', 'O sing unto the LORD a new song!'],
  ['Que tout ce qui respire loue l’Éternel !', 'Let every thing that hath breath praise the LORD!'],
];

export class Activities {
  constructor(G) { this.G = G; this.spots = []; this.active = null; this.waiters = []; this.targets = []; this.timer = 0; this.event = null; this.nextEvent = 45 + Math.random() * 30; this.lent = []; this.extra = []; }
  get world() { return this.G.world; }

  setup() {
    const w = this.world, G = this.G; S.records = S.records || {};
    for (const a of ACTS) {
      const p = w.pois[a.at]; if (!p) continue; const s = w.roadside(p.x, p.z, 16, -2.2), f = w.freeNear(s.x, s.z, 0.8);
      const mk = makeMarker(new THREE.Color(a.color).getHex()); mk.position.set(f.x, 0, f.z); const ic = makeIcon(a.icon, a.color); ic.position.y = 5.4; mk.add(ic); G.scene.add(mk);
      this.spots.push({ a, x: f.x, z: f.z, mk, ic });
    }
  }
  dispose() { this.stop(true); this.clearEvent(); for (const s of this.spots) this.G.scene.remove(s.mk); this.spots = []; }

  // ---------- attente asynchrone pilotée par update() ----------
  until(fn) { return new Promise((res, rej) => this.waiters.push({ fn, res, rej })); }
  sleep(s) { let e = 0; return this.until(dt => (e += dt) >= s); }
  chk() { if (this.stopping) throw STOP; }
  stop(silent) { if (!this.active) return; this.stopping = true; this.silent = silent; const w = this.waiters; this.waiters = []; for (const x of w) x.rej(STOP); }

  record(id, val, lowerBetter) { const r = S.records[id]; if (r === undefined || (lowerBetter ? val < r : val > r)) { S.records[id] = val; return true; } return false; }
  recText(a) { const r = S.records[a.id]; if (r === undefined) return t('none'); return a.rec === 'time' ? tm(r) : String(r); }

  async open(spot) {
    const a = spot.a, G = this.G;
    const k = await ui.modal(`<div class="badge" style="font-size:54px">${a.icon}</div><h2>${esc(L(a.name))}</h2><p>${esc(L(a.desc))}</p><div class="rewards"><span>🏆 ${t('best')} : ${this.recText(a)}</span><span>🪙 ${t('reward')} : ${esc(L(a.reward))}</span></div>`, [t('start'), t('later')]);
    if (k !== 0 || this.active || G.missions.active) return;
    G.eco.endJob(true); this.run(a, spot);
  }
  async run(a, spot) {
    if (this.active) return; const G = this.G; this.active = { a, spot, cleanup: [] }; this.stopping = false; this.timer = 0; this.objective = ''; for (const s of this.spots) s.mk.visible = false;
    let res = null;
    try { res = await this['act_' + a.id](this.active); } catch (e) { if (e !== STOP) { console.error(e); ui.toast('Erreur : ' + (e.message || e)); } }
    for (const f of this.active.cleanup.reverse()) { try { f(); } catch (e) { /* ignore */ } }
    this.active = null; this.waiters = []; this.targets = []; this.timer = 0; this.objective = ''; this.stopping = false; for (const s of this.spots) s.mk.visible = true; G.input.clear();
    if (res && !this.silent) { if (res.ok) { if (res.money) G.eco.earn(res.money); G.reward(res.stats || {}); audio.sfx('win'); showBanner(t('success'), `${res.text || ''}${res.money ? '  ·  +' + fmt(res.money) : ''}${res.rec ? '  ·  ' + t('newRec') : ''}`); } else { audio.sfx('deny'); showBanner(t('fail'), res.text || '', false); } save(); }
    this.silent = false;
  }
  // véhicule prêté pour l'activité
  lend(type, color, x, z, h, o) {
    const G = this.G, v = new Vehicle(type, color, G.scene, o); v.owned = true; v.lent = true; v.fuel = v.tank; v.place(x, z, h);
    v.marker = makeMarker(0x7dd87d, false); v.marker.userData.dia.position.y = type === 'moto' ? 1.9 : 2.4; G.scene.add(v.marker); G.vehicles.push(v);
    this.active.cleanup.push(() => { if (G.player.vehicle === v) G.player.exit(); G.scene.remove(v.marker); const i = G.vehicles.indexOf(v); if (i >= 0) G.vehicles.splice(i, 1); v.dispose(); }); return v;
  }
  mark(obj) { this.G.scene.add(obj); this.active.cleanup.push(() => this.G.scene.remove(obj)); return obj; }
  async npc(id, x, z, anim, name) { const n = await this.G.crowd.addStatic(id, x, z, Math.random() * 6.28, anim, name); this.active.cleanup.push(() => this.G.crowd.removeStatic(n)); return n; }
  async countdown() { for (const n of ['3', '2', '1']) { showBanner(n, '', true, 700); audio.beep(440, 0, 0.15, 0.12); await this.sleep(0.8); } showBanner(t('go'), '', true, 900); audio.beep(880, 0, 0.3, 0.14); }
  inVeh(v) { return this.G.player.vehicle === v; }

  // ---------- 🏁 course de moto ----------
  async act_race(A) {
    const G = this.G, w = this.world, pl = G.player; let v;
    if (S.owned.moto) { v = G.spawnOwn('moto'); v.fuel = Math.max(v.fuel, v.tank * 0.5); } else { const s = w.roadside(A.spot.x, A.spot.z, 6); v = this.lend('moto', 0x2f7fd6, s.x, s.z, s.h); }
    if (pl.vehicle) pl.exit(); pl.enter(v);
    const a0 = w.nearestMain(v.pos.x, v.pos.z), cand = w.nodesNear(v.pos.x, v.pos.z, 1100).filter(i => w.comp[i] === w.mainComp && D(w.nodes[i], v.pos) > 650);
    let path = null; for (let k = 0; k < 8 && !path; k++) { const b = cand[Math.random() * cand.length | 0]; path = b !== undefined ? w.findPath(a0, b) : null; }
    if (!path) return { ok: false, text: '…' };
    const cps = []; let acc = 0; for (let i = 1; i < path.length; i++) { acc += D(w.nodes[path[i]], w.nodes[path[i - 1]]); if (acc > 140 || i === path.length - 1) { cps.push(w.nodes[path[i]]); acc = 0; } }
    const len = w.pathLength(path), limit = Math.round(len / 9 + 25);
    this.objective = L(['Prépare-toi…', 'Get ready…']); await this.countdown();
    let left = limit, i = 0, el = 0; const ring = this.mark(makeMarker(0x5fb7f0)); ring.scale.set(3, 1, 3); const nxt = this.mark(makeMarker(0x5fb7f0, false)); nxt.scale.setScalar(2);
    const show = () => { ring.position.set(cps[i].x, 0, cps[i].z); const n2 = cps[i + 1]; nxt.visible = !!n2; if (n2) nxt.position.set(n2.x, 0, n2.z); this.targets = [cps[i]]; };
    show();
    const ok = await this.until(dt => {
      left -= dt; el += dt; this.timer = left; this.objective = `${L(['Point de contrôle', 'Checkpoint'])} ${i + 1}/${cps.length}`;
      if (!this.inVeh(v)) this.objective = L(['Remonte sur la moto ! (F)', 'Get back on the bike! (F)']);
      if (left <= 0) return 'fail';
      if (this.inVeh(v) && D(pl.pos, cps[i]) < 9) { i++; audio.sfx('pick'); if (i >= cps.length) return 'win'; show(); }
      return false;
    });
    if (ok === 'fail') return { ok: false, text: t('timeUp') };
    const rec = this.record('race', Math.round(el), true), money = Math.round(500 + 1000 * Math.max(0, left / limit) / 25) * 25;
    return { ok: true, money, stats: { wisdom: 2 }, rec, text: `⏱ ${tm(el)}` };
  }

  // ---------- 🚑 ambulancier ----------
  async act_ambulance(A) {
    const G = this.G, w = this.world, pl = G.player, hp = w.poi('hospital'), s = w.roadside(A.spot.x, A.spot.z, 7);
    const v = this.lend('minibus', 0xf4f4f2, s.x, s.z, s.h, { darkBumper: false }), red = new THREE.MeshStandardMaterial({ color: 0xc62828, emissive: 0x550000 });
    for (const sx of [-0.875, 0.875]) { v.mesh.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.62, 0.2), red), { position: new THREE.Vector3(sx, 1.45, -0.6) })); v.mesh.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.62), red), { position: new THREE.Vector3(sx, 1.45, -0.6) })); }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.25), new THREE.MeshStandardMaterial({ color: 0x1f5fa8, emissive: 0x1f5fa8, emissiveIntensity: 0.6 })); bar.position.set(0, 2.02, 1.4); v.mesh.add(bar);
    if (pl.vehicle) pl.exit(); pl.enter(v); let saved = 0, t0 = 0;
    for (let n = 0; n < 3; n++) {
      const a = Math.random() * 6.283, p = w.roadPoint(hp.x + Math.cos(a) * 320, hp.z + Math.sin(a) * 320, 90), who = ['ouvrier', 'kodjo', 'ama', 'esi', 'edem'][Math.random() * 5 | 0];
      const pat = await this.npc(who, p.x, p.z, 'crouch_idle', ['Blessé', 'Injured person']); const mk = this.mark(makeMarker(0xc62828)); mk.position.set(pat.x, 0, pat.z);
      let left = 140; this.targets = [pat]; showBanner(`🚑 ${L(['Urgence', 'Emergency'])} ${n + 1}/3`, L(['Un blessé t’attend !', 'An injured person needs you!']), false, 2200);
      const got = await this.until(dt => { left -= dt; this.timer = left; this.objective = L(['Va chercher le blessé', 'Pick up the injured person']); if (left <= 0) return 'late'; if (this.inVeh(v) && D(pl.pos, pat) < 9 && Math.abs(v.speed) < 2) return 'ok'; if (!this.inVeh(v)) this.objective = L(['Remonte dans l’ambulance ! (F)', 'Get back in the ambulance! (F)']); return false; });
      this.G.scene.remove(mk); this.G.crowd.removeStatic(pat);
      if (got === 'late') { ui.toast(L(['Une autre ambulance s’en est chargée…', 'Another ambulance took care of it…'])); continue; }
      ui.toast(L(['Le blessé est à bord. Vite, à l’hôpital !', 'The patient is on board. Quick, to the hospital!']), true); this.targets = [hp];
      const back = await this.until(dt => { left -= dt; this.timer = left; t0 += dt; this.objective = L(['Conduis le blessé à l’hôpital', 'Drive the patient to the hospital']); if (left <= 0) return 'late'; if (this.inVeh(v) && D(pl.pos, hp) < 14 && Math.abs(v.speed) < 2.5) return 'ok'; return false; });
      if (back === 'ok') { saved++; G.eco.earn(500); G.reward({ love: 3 }); ui.toast(L(['Patient sauvé ! +500 F', 'Patient saved! +500 F']), true); } else ui.toast(L(['Le patient a été transféré par hélicoptère…', 'The patient was airlifted instead…']));
    }
    const rec = this.record('ambulance', saved, false);
    return saved ? { ok: true, money: saved === 3 ? 500 : 0, stats: { love: 2 }, rec, text: `${saved}/3 ${L(['patients sauvés', 'patients saved'])}` } : { ok: false, text: L(['Aucun patient sauvé', 'No patient saved']) };
  }

  // ---------- 🧹 grand nettoyage ----------
  async act_clean(A) {
    const G = this.G, w = this.world, pl = G.player, items = [];
    if (pl.vehicle) pl.exit();
    for (let i = 0; i < 12; i++) { const a = Math.random() * 6.283, d = 25 + Math.random() * 120, p = w.roadPoint(A.spot.x + Math.cos(a) * d, A.spot.z + Math.sin(a) * d, 30), m = this.mark(makeItem(0x8f8f80)); m.scale.setScalar(0.8); m.position.set(p.x, w.groundY(p.x, p.z), p.z); items.push({ m, x: p.x, z: p.z }); }
    await this.countdown(); let left = 150, el = 0;
    const r = await this.until(dt => { left -= dt; el += dt; this.timer = left; this.objective = `${L(['Déchets ramassés', 'Rubbish collected'])} ${12 - items.length}/12`; this.targets = items.slice().sort((a, b) => D(a, pl.pos) - D(b, pl.pos)).slice(0, 1);
      for (let i = items.length - 1; i >= 0; i--) { items[i].m.userData.box.rotation.y += dt * 2; if (D(items[i], pl.pos) < (pl.vehicle ? 2.6 : 1.7)) { G.scene.remove(items[i].m); items.splice(i, 1); audio.sfx('pick'); } }
      return items.length === 0 ? 'win' : left <= 0 ? 'fail' : false; });
    if (r === 'fail') return { ok: false, text: `${12 - items.length}/12` };
    return { ok: true, money: 600, stats: { love: 3 }, rec: this.record('clean', Math.round(el), true), text: `⏱ ${tm(el)}` };
  }

  // ---------- 📖 quiz éclair ----------
  async act_quiz() {
    const keys = Object.keys(VERSES).sort(() => Math.random() - 0.5).slice(0, 8); let score = 0; const ov = overlay(); ui.busy++;
    try {
      for (let q = 0; q < keys.length; q++) {
        const v = VERSES[keys[q]], others = Object.keys(VERSES).filter(k => k !== keys[q]).sort(() => Math.random() - 0.5).slice(0, 2), opts = [keys[q], ...others].sort(() => Math.random() - 0.5);
        ov.cv.style.display = 'none';
        ov.top.innerHTML = `<div class="quiz"><div class="qh">📖 ${q + 1}/8 · ⭐ ${score}</div><div class="qbar"><i></i></div><div class="scripture">${esc(L(v.text))}</div><div class="opts">${opts.map(k => `<button data-k="${k}">${esc(L(VERSES[k].ref))}</button>`).join('')}</div></div>`;
        const bar = ov.top.querySelector('.qbar i'); let left = 12, picked = null;
        ov.top.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { if (picked === null) picked = b.dataset.k; });
        const r = await this.until(dt => { left -= dt; bar.style.width = Math.max(0, left / 12 * 100) + '%'; return picked !== null ? 'pick' : left <= 0 ? 'late' : false; });
        const good = r === 'pick' && picked === keys[q]; if (good) { score++; audio.sfx('coin'); } else audio.sfx('deny');
        ov.top.querySelectorAll('[data-k]').forEach(b => { b.disabled = true; if (b.dataset.k === keys[q]) b.classList.add('ok'); else if (b.dataset.k === picked) b.classList.add('ko'); });
        await this.sleep(1.1);
      }
    } finally { ov.close(); ui.busy = Math.max(0, ui.busy - 1); }
    return score ? { ok: true, money: score * 60 + (score === 8 ? 300 : 0), stats: { wisdom: score * 2 }, rec: this.record('quiz', score, false), text: `${score}/8` } : { ok: false, text: '0/8' };
  }

  // ---------- ⚽ tirs au but ----------
  async act_penalty() {
    const ov = overlay(), g = ov.g, cv = ov.cv; ui.busy++; let shot = 0, goals = 0, phase = 'aim', time = 0, aim = { u: 0, v: 0.5 }, ball = null, keeper = 0, msg = '', msgT = 0, fire = false;
    const onKey = e => { if (['Space', 'KeyE', 'Enter'].includes(e.code)) { fire = true; e.preventDefault(); } }; addEventListener('keydown', onKey); cv.onpointerdown = () => { fire = true; };
    ov.top.innerHTML = `<div class="mini-hint">${esc(L(['Appuie (Espace / E / touche l’écran) quand la cible est bien placée', 'Press (Space / E / tap) when the target is well placed']))}</div>`;
    try {
      await this.until(dt => {
        time += dt; const W = cv.width, H = cv.height, gw = W * 0.56, gh = gw * 0.33, gx = (W - gw) / 2, gy = H * 0.22, X = u => W / 2 + u * gw / 2, Y = v => gy + gh - v * gh;
        // décor
        const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#7fb6e6'); sky.addColorStop(0.3, '#cfe3f2'); sky.addColorStop(0.31, '#3f8a3a'); sky.addColorStop(1, '#2f6f2c'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 8; i++) g.fillRect(0, H * 0.31 + i * H * 0.09, W, H * 0.045);
        g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(gx, gy, gw, gh); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1; for (let i = 1; i < 16; i++) { g.beginPath(); g.moveTo(gx + gw * i / 16, gy); g.lineTo(gx + gw * i / 16, gy + gh); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(gx, gy + gh * i / 6); g.lineTo(gx + gw, gy + gh * i / 6); g.stroke(); }
        g.strokeStyle = '#fff'; g.lineWidth = W * 0.008; g.strokeRect(gx, gy, gw, gh); g.lineWidth = 3; g.beginPath(); g.moveTo(0, gy + gh); g.lineTo(W, gy + gh); g.stroke();
        // gardien
        const kx = X(keeper * 0.62), ky = gy + gh, kw = gw * 0.07, tilt = keeper * 0.9; g.save(); g.translate(kx, ky); g.rotate(tilt); g.fillStyle = '#f2c200'; g.fillRect(-kw / 2, -gh * 0.62, kw, gh * 0.42); g.fillStyle = '#4a2f1f'; g.beginPath(); g.arc(0, -gh * 0.7, kw * 0.42, 0, 7); g.fill(); g.fillStyle = '#111'; g.fillRect(-kw / 2, -gh * 0.2, kw, gh * 0.2); g.strokeStyle = '#4a2f1f'; g.lineWidth = kw * 0.28; g.beginPath(); g.moveTo(-kw / 2, -gh * 0.55); g.lineTo(-kw * 1.4, -gh * 0.85); g.moveTo(kw / 2, -gh * 0.55); g.lineTo(kw * 1.4, -gh * 0.85); g.stroke(); g.restore();
        // visée
        const sp = 1.6 + shot * 0.35;
        if (phase === 'aim') { aim.u = 1.18 * Math.sin(time * sp); aim.v = 0.58 + 0.56 * Math.sin(time * sp * 1.37 + 1); g.strokeStyle = '#ff3b30'; g.lineWidth = 4; g.beginPath(); g.arc(X(aim.u), Y(aim.v), W * 0.022, 0, 7); g.stroke(); g.beginPath(); g.moveTo(X(aim.u) - W * 0.035, Y(aim.v)); g.lineTo(X(aim.u) + W * 0.035, Y(aim.v)); g.moveTo(X(aim.u), Y(aim.v) - W * 0.035); g.lineTo(X(aim.u), Y(aim.v) + W * 0.035); g.stroke();
          if (fire) { fire = false; phase = 'shoot'; audio.beep(180, 0, 0.12, 0.2, 'square'); const side = aim.u < -0.25 ? -1 : aim.u > 0.25 ? 1 : 0, guess = Math.random() < 0.45 ? side : [-1, 0, 1][Math.random() * 3 | 0]; ball = { t: 0, guess }; } }
        // ballon
        const bx0 = W / 2, by0 = H * 0.9; let bx = bx0, by = by0, br = W * 0.03;
        if (ball) { ball.t += dt; keeper += (ball.guess - keeper) * Math.min(1, dt * 7); const k = Math.min(1, ball.t / 0.55); bx = bx0 + (X(aim.u) - bx0) * k; by = by0 + (Y(aim.v) - by0) * k - Math.sin(k * Math.PI) * H * 0.06; br = W * (0.03 - 0.016 * k);
          if (ball.t >= 0.6 && phase === 'shoot') { phase = 'result'; const inGoal = Math.abs(aim.u) < 1 && aim.v > 0 && aim.v < 1, corner = aim.v > 0.78 && Math.abs(aim.u) > 0.72, kc = ball.guess * 0.62, saved = !corner && Math.abs(aim.u - kc) < 0.42 && aim.v < 0.9;
            if (inGoal && !saved) { goals++; msg = L(['BUUUT !', 'GOAL!']); audio.sfx('win'); } else { msg = inGoal ? L(['Arrêté par le gardien !', 'Saved by the keeper!']) : L(['À côté !', 'Wide!']); audio.sfx('deny'); } msgT = 1.6; shot++; } }
        else keeper *= 0.9;
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(bx, by + br * 0.9, br, br * 0.35, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(bx + br * 0.2, by - br * 0.1, br * 0.35, 0, 7); g.fill();
        // tableau
        g.fillStyle = 'rgba(10,20,34,0.8)'; g.fillRect(W * 0.03, H * 0.04, W * 0.3, H * 0.09); g.fillStyle = '#fff'; g.font = `bold ${H * 0.045}px Arial`; g.textAlign = 'left'; g.fillText(`⚽ ${goals} / ${shot}   (${5 - shot} ${L(['restants', 'left'])})`, W * 0.045, H * 0.1);
        if (msgT > 0) { msgT -= dt; g.fillStyle = '#f5c542'; g.font = `bold ${H * 0.09}px Arial`; g.textAlign = 'center'; g.fillText(msg, W / 2, H * 0.62); if (msgT <= 0) { if (shot >= 5) return true; phase = 'aim'; ball = null; time = Math.random() * 6; } }
        return false;
      });
    } finally { removeEventListener('keydown', onKey); ov.close(); ui.busy = Math.max(0, ui.busy - 1); }
    return goals ? { ok: true, money: goals * 100 + (goals === 5 ? 300 : 0), stats: { love: 1 }, rec: this.record('penalty', goals, false), text: `${goals}/5 ${L(['buts', 'goals'])}` } : { ok: false, text: '0/5' };
  }

  // ---------- 🎵 chorale ----------
  async act_choir() {
    const ov = overlay(), g = ov.g, cv = ov.cv; ui.busy++; const LANES = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], COLS = ['#ef5b6b', '#f5c542', '#5fb7f0', '#6fcf7a'], notes = [], DUR = 40, FALL = 1.7;
    for (let k = 0, tt = 2.2; tt < DUR; k++, tt += 0.62) { if (k % 8 === 7) continue; notes.push({ t: tt, lane: (k * 7 + (k >> 2)) % 4, hit: 0 }); if (k % 11 === 5) notes.push({ t: tt, lane: ((k * 7 + (k >> 2)) + 2) % 4, hit: 0 }); }
    let time = 0, perfect = 0, good = 0, miss = 0, streak = 0, flash = [0, 0, 0, 0], fb = '', fbT = 0;
    const press = lane => { flash[lane] = 0.15; let best = null, bd = 0.2; for (const n of notes) if (!n.hit && n.lane === lane && Math.abs(n.t - time) < bd) { bd = Math.abs(n.t - time); best = n; } if (best) { best.hit = 1; if (bd < 0.08) { perfect++; fb = L(['Parfait !', 'Perfect!']); } else { good++; fb = L(['Bien !', 'Good!']); } streak++; fbT = 0.5; } else { streak = 0; } };
    const onKey = e => { const i = LANES.indexOf(e.code); if (i >= 0 && !e.repeat) { press(i); e.preventDefault(); } }; addEventListener('keydown', onKey);
    cv.onpointerdown = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; press(Math.max(0, Math.min(3, Math.floor((x - 0.25) / 0.125)))); };
    audio.playOnce('holy_holy_holy');
    try {
      await this.until(dt => {
        time += dt; const W = cv.width, H = cv.height, lx = W * 0.25, lw = W * 0.125, hy = H * 0.82;
        const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2b1236'); bg.addColorStop(1, '#0f1c2d'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(245,197,66,0.08)'; g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W * 0.15, H); g.lineTo(W * 0.85, H); g.fill();
        for (let i = 0; i < 4; i++) { g.fillStyle = flash[i] > 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)'; g.fillRect(lx + i * lw + 3, 0, lw - 6, H); flash[i] = Math.max(0, flash[i] - dt); g.strokeStyle = COLS[i]; g.lineWidth = 5; g.beginPath(); g.arc(lx + i * lw + lw / 2, hy, lw * 0.3, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.font = `bold ${lw * 0.2}px Arial`; g.textAlign = 'center'; g.fillText('DFJK'[i], lx + i * lw + lw / 2, hy + lw * 0.07); }
        for (const n of notes) { if (n.hit) continue; const dtn = n.t - time; if (dtn < -0.2) { n.hit = 2; miss++; streak = 0; fb = L(['Raté', 'Miss']); fbT = 0.4; continue; } if (dtn > FALL) continue; const y = hy - dtn / FALL * hy; g.fillStyle = COLS[n.lane]; g.beginPath(); g.arc(lx + n.lane * lw + lw / 2, y, lw * 0.26, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(lx + n.lane * lw + lw / 2 - lw * 0.07, y - lw * 0.07, lw * 0.08, 0, 7); g.fill(); }
        g.fillStyle = '#f5c542'; g.font = `italic ${H * 0.038}px Georgia`; g.textAlign = 'center'; g.fillText(L(LYRICS[Math.floor(time / 8) % LYRICS.length]), W / 2, H * 0.08);
        g.fillStyle = '#fff'; g.font = `bold ${H * 0.035}px Arial`; g.textAlign = 'left'; g.fillText(`✨ ${perfect}  👍 ${good}  ✖ ${miss}   🔥 ${streak}`, W * 0.03, H * 0.95);
        g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(W * 0.03, H * 0.13, W * 0.18, 8); g.fillStyle = '#f5c542'; g.fillRect(W * 0.03, H * 0.13, W * 0.18 * Math.min(1, time / (DUR + 1)), 8);
        if (fbT > 0) { fbT -= dt; g.fillStyle = '#fff'; g.font = `bold ${H * 0.06}px Arial`; g.textAlign = 'center'; g.fillText(fb, W / 2, H * 0.5); }
        return time > DUR + 1.2;
      });
    } finally { removeEventListener('keydown', onKey); ov.close(); ui.busy = Math.max(0, ui.busy - 1); audio.stopOnce(); }
    const total = notes.length, acc = (perfect + good * 0.6) / total, pct = Math.round(acc * 100);
    return pct >= 25 ? { ok: true, money: Math.round(perfect * 10 + good * 5), stats: { faith: Math.round(acc * 14) }, rec: this.record('choir', pct, false), text: `${pct} %` } : { ok: false, text: `${pct} %` };
  }

  // ---------- événements imprévus dans la rue ----------
  clearEvent() { const e = this.event; if (!e) return; for (const n of e.npcs) this.G.crowd.removeStatic(n); for (const o of e.objs) this.G.scene.remove(o); if (e.car) e.car.dispose(); this.event = null; if (!this.active) this.targets = []; }
  async spawnEvent() {
    const G = this.G, w = this.world, pp = G.player.pos, a = Math.random() * 6.283, p = w.roadPoint(pp.x + Math.cos(a) * 55, pp.z + Math.sin(a) * 55, 25), kind = ['thief', 'elder', 'breakdown', 'child'][Math.random() * 4 | 0];
    const e = { kind, npcs: [], objs: [], t: 0, state: 'wait', x: p.x, z: p.z }; this.event = e;
    const add = async (id, x, z, anim, name) => { const n = await G.crowd.addStatic(id, x, z, Math.random() * 6.28, anim, name); if (this.event !== e) { G.crowd.removeStatic(n); throw STOP; } e.npcs.push(n); return n; };
    try {
      if (kind === 'thief') { e.victim = await add('esi', p.x, p.z, 'cell_phone_talk_01', ['Une passante', 'A passer-by']); const q = w.freeNear(p.x + 3, p.z + 2, 0.5); e.thief = await add('jeune', q.x, q.z, 'idle_look_around_01', ['Le voleur', 'The thief']); }
      else if (kind === 'elder') e.main = await add('esi', p.x, p.z, 'idle_look_around_01', ['Grand-mère Afiwa', 'Grandma Afiwa']);
      else if (kind === 'child') e.main = await add('enfant', p.x, p.z, 'crouch_idle', ['Un enfant perdu', 'A lost child']);
      else { const s = w.roadside(p.x, p.z, 4, 0.4); e.car = new Vehicle('sedan', 0x6b1b1b, G.scene, {}); e.car.place(s.x, s.z, s.h); e.x = s.x; e.z = s.z; const q = w.freeNear(s.x + Math.cos(s.h) * 1.8, s.z - Math.sin(s.h) * 1.8, 0.5); e.main = await add('kodjo', q.x, q.z, 'gestic_talk_neutral_01', ['Un automobiliste', 'A driver']); }
      const ic = makeIcon('❗', '#c62828'); ic.position.set(e.x, 4.2, e.z); G.scene.add(ic); e.objs.push(ic); e.icon = ic;
      ui.toast({ thief: L(['🗣 « Au voleur ! » Quelqu’un crie près d’ici…', '🗣 "Stop, thief!" Someone is shouting nearby…']), elder: L(['👵 Une grand-mère semble perdue près d’ici.', '👵 An old lady looks lost nearby.']), child: L(['🧒 Un enfant pleure tout seul près d’ici.', '🧒 A child is crying alone nearby.']), breakdown: L(['🚗 Un automobiliste est en panne près d’ici.', '🚗 A driver has broken down nearby.']) }[kind], true, 5000);
    } catch (err) { if (err !== STOP) console.error(err); }
  }
  eventPrompt() {
    const e = this.event, pl = this.G.player, pp = pl.pos; if (!e || e.busy || pl.vehicle) return null;
    if (e.kind === 'thief') { if (e.state === 'caught' && D(e.thief, pp) < 2.4) return { prompt: L(['Parler au voleur', 'Talk to the thief']), act: () => this.thiefTalk() }; if (e.state === 'return' && D(e.victim, pp) < 2.6) return { prompt: L(['Rendre le sac', 'Return the bag']), act: () => this.thiefReturn() }; return null; }
    if (e.state === 'wait' && e.main && D(e.main, pp) < 2.8) return { prompt: t('help'), act: () => this.eventStart() };
    if (e.kind === 'breakdown' && e.state === 'push' && e.car && D(e.car.pos, pp) < 3.6) return { prompt: t('push'), act: () => { e.push += 0.12; audio.beep(140, 0, 0.08, 0.1, 'square'); const c = e.car; c.pos.x += Math.sin(c.heading) * 0.5; c.pos.z += Math.cos(c.heading) * 0.5; c.visual(0.25); if (e.push >= 1) this.eventDone(L(['La voiture a redémarré !', 'The car started again!']), 300, { love: 2 }); } };
    return null;
  }
  async eventStart() {
    const e = this.event, G = this.G, w = this.world; e.busy = true;
    try {
      if (e.kind === 'elder') { await ui.say(L(e.main.name), L(['Mon enfant, je dois aller à l’église pour la prière, mais mes yeux ne voient plus bien la route…', 'My child, I must go to church for prayer, but my eyes can no longer see the road well…'])); e.dest = w.poi('church'); e.state = 'escort'; e.main.follow = true; e.main.maxSpeed = 1.3; }
      else if (e.kind === 'child') { await ui.say(L(e.main.name), L(['Je… je ne trouve plus ma maman. Elle vendait des oranges au marché…', 'I… I can’t find my mum. She was selling oranges at the market…'])); const m = w.poi('market'); e.dest = w.freeNear(m.x + 4, m.z + 3, 0.6); e.mother = await G.crowd.addStatic('ama', e.dest.x, e.dest.z, 0, 'idle_look_around_01', ['Sa maman', 'His mother']); e.npcs.push(e.mother); e.state = 'escort'; e.main.follow = true; e.main.maxSpeed = 4; e.main.ch.play('idle_neutral_01', 0.3); }
      else if (e.kind === 'breakdown') { await ui.say(L(e.main.name), L(['Ma batterie est à plat ! Tu peux m’aider à pousser pour la faire démarrer ?', 'My battery is flat! Can you help me push to start it?'])); e.state = 'push'; e.push = 0; }
      if (e.icon) e.icon.visible = false;
    } finally { e.busy = false; }
  }
  async thiefTalk() {
    const e = this.event; e.busy = true;
    const k = await ui.choose(L(e.thief.name), L(['Pardon ! Pardon ! Je n’ai rien mangé depuis deux jours…', 'Sorry! Sorry! I haven’t eaten for two days…']), [L(['« Rends-moi ce sac. Jésus peut changer ta vie : viens à l’église, on t’aidera à trouver du travail. »', '"Give me that bag. Jesus can change your life: come to church, we will help you find work."']), L(['« Rends ce sac et va-t’en. »', '"Give back that bag and go away."'])]);
    if (k === 0) { await ui.say(L(e.thief.name), L(['Personne ne m’avait jamais parlé comme ça… Je viendrai dimanche. Promis.', 'Nobody ever spoke to me like that… I’ll come on Sunday. I promise.'])); this.G.reward({ love: 3, faith: 2 }); }
    e.state = 'return'; e.thief.ch.play('idle_neutral_01', 0.3); if (e.icon) { e.icon.visible = true; e.icon.position.set(e.victim.x, 4.2, e.victim.z); } e.busy = false;
  }
  async thiefReturn() { const e = this.event; e.busy = true; await ui.say(L(e.victim.name), L(['Mon sac ! Il y avait tout l’argent du loyer dedans. Que Dieu te bénisse ! Tiens, prends ceci.', 'My bag! All my rent money was in it. God bless you! Here, take this.'])); e.busy = false; this.eventDone(L(['Sac rendu à sa propriétaire', 'Bag returned to its owner']), 500, { love: 3 }); }
  eventDone(text, money, stats) { const G = this.G; if (money) G.eco.earn(money); G.reward(stats); audio.sfx('win'); showBanner(t('eventDone'), `${text}${money ? '  ·  +' + fmt(money) : ''}`); const e = this.event; e.state = 'done'; for (const n of e.npcs) { n.follow = false; n.ch.play('wave_01', 0.3); } setTimeout(() => { if (this.event === e) this.clearEvent(); }, 6000); this.nextEvent = 70 + Math.random() * 60; S.deeds = (S.deeds || 0) + 1; save(); }
  updateEvent(dt) {
    const e = this.event, G = this.G, w = this.world, pl = G.player, pp = pl.pos; if (!e || e.state === 'done') return; e.t += dt;
    if (e.icon && e.icon.visible) scaleIcon(e.icon, G.player.cam, 2);
    if (e.kind === 'thief' && e.thief) {
      if (e.state === 'wait' && D(e.victim, pp) < 26) { e.state = 'flee'; e.t = 0; e.victim.ch.play('cheer_01', 0.2); ui.toast(L(['🏃 Attrape le voleur ! (cours : double appui ou Maj)', '🏃 Catch the thief! (run: double-tap or Shift)']), true, 4000); e.thief.ch.play('run_neutral', 0.2, 1.4); const a = w.nearestMain(e.thief.x, e.thief.z), far = w.nodesNear(e.thief.x, e.thief.z, 500).filter(i => w.comp[i] === w.mainComp && D(w.nodes[i], e.thief) > 300 && D(w.nodes[i], pp) > D(w.nodes[i], e.thief)); e.path = w.findPath(a, far[Math.random() * far.length | 0] ?? a) || [a]; e.pi = 0; if (e.icon) e.icon.visible = false; }
      if (e.state === 'flee') {
        const sp = e.t < 22 ? 4.6 : 3.7, n = w.nodes[e.path[Math.min(e.pi, e.path.length - 1)]], pos = e.thief.ch.root.position, dx = n.x - pos.x, dz = n.z - pos.z, d = Math.hypot(dx, dz);
        if (d < 1.5) { e.pi++; if (e.pi >= e.path.length) { const a = w.nearestMain(pos.x, pos.z), far = w.nodesNear(pos.x, pos.z, 400).filter(i => w.comp[i] === w.mainComp && D(w.nodes[i], pos) > 200); e.path = w.findPath(a, far[Math.random() * far.length | 0] ?? a) || [a]; e.pi = 0; } }
        else { pos.x += dx / d * sp * dt; pos.z += dz / d * sp * dt; e.thief.ch.root.rotation.y = Math.atan2(dx, dz); }
        this.targets = [e.thief];
        if (D(e.thief, pp) < (pl.vehicle ? 3 : 1.8)) { e.state = 'caught'; this.targets = []; e.thief.ch.play('crouch_idle', 0.2); ui.toast(L(['Tu l’as rattrapé ! Parle-lui (E).', 'You caught him! Talk to him (E).']), true); }
        else if (e.t > 75 || D(e.thief, pp) > 160) { ui.toast(L(['Le voleur s’est échappé…', 'The thief got away…'])); this.clearEvent(); this.nextEvent = 60 + Math.random() * 60; return; }
      }
      if (e.state === 'return') this.targets = [e.victim];
    }
    if (e.state === 'escort') { this.targets = [e.dest]; if (D(pp, e.dest) < 8 && D(e.main, e.dest) < 10) { if (e.kind === 'elder') this.eventDone(L(['Grand-mère est arrivée à l’église', 'Grandma has arrived at church']), 200, { love: 3 }); else { e.mother.ch.play('cheer_01', 0.2); this.eventDone(L(['L’enfant a retrouvé sa maman !', 'The child found his mother!']), 300, { love: 4 }); } } }
    if (e.state === 'wait' && e.t > 120 && D(e, pp) > 40) { this.clearEvent(); this.nextEvent = 40 + Math.random() * 40; }
  }

  // ---------- intégration ----------
  nearby() {
    const pl = this.G.player, pp = pl.pos; if (this.active) return null;
    const ev = this.eventPrompt(); if (ev) return ev;
    if (pl.vehicle || this.G.missions.active || this.G.eco.ride) return null;
    for (const s of this.spots) if (D(s, pp) < 3.2) return { prompt: `${s.a.icon} ${L(s.a.name)}`, act: () => this.open(s) };
    return null;
  }
  status() {
    if (this.active) { const a = this.active.a, tg = this.targets[0]; return { title: `${a.icon} ${L(a.name)}`, text: (this.objective || '…') + (this.timer > 0 ? `  ⏱ ${tm(this.timer)}` : ''), x: tg && tg.x, z: tg && tg.z }; }
    const e = this.event; if (!e || e.state === 'wait' || e.state === 'done') return null; const tg = this.targets[0];
    const txt = { flee: L(['Attrape le voleur !', 'Catch the thief!']), caught: L(['Parle au voleur (E)', 'Talk to the thief (E)']), return: L(['Rapporte le sac à sa propriétaire', 'Bring the bag back to its owner']), escort: e.kind === 'elder' ? L(['Accompagne grand-mère à l’église (marche doucement)', 'Walk grandma to church (go slowly)']) : L(['Ramène l’enfant à sa maman, au marché', 'Take the child to his mother at the market']), push: L(['Pousse la voiture (E)', 'Push the car (E)']) }[e.state];
    return { title: L(['Bonne action', 'Good deed']), text: txt, x: tg && tg.x, z: tg && tg.z };
  }
  busyEvent() { const e = this.event; return !!(e && e.state !== 'wait' && e.state !== 'done'); }
  mapIcons() { const out = this.spots.map(s => ({ x: s.x, z: s.z, ch: s.a.icon })); if (this.event && this.event.icon && this.event.icon.visible) out.push({ x: this.event.icon.position.x, z: this.event.icon.position.z, ch: '❗' }); return out; }
  list() { return this.spots.map(s => ({ s, a: s.a, rec: this.recText(s.a), d: Math.round(D(s, this.G.player.pos)) })); }
  update(dt) {
    const G = this.G;
    const ws = this.waiters.slice(); for (const w of ws) { let r; try { r = w.fn(dt); } catch (e) { r = false; console.error(e); } if (r) { const i = this.waiters.indexOf(w); if (i >= 0) this.waiters.splice(i, 1); w.res(r); } }
    const bob = Math.sin(performance.now() / 300) * 0.15; for (const s of this.spots) { s.mk.userData.dia.rotation.y += dt * 2; s.ic.position.y = 5.4 + bob; if (s.mk.visible) scaleIcon(s.ic, G.player.cam); }
    if (!this.active && !this.event && !G.missions.active && !G.eco.ride && !(G.eco.job && G.eco.job.kind === 'zem')) { this.nextEvent -= dt; if (this.nextEvent <= 0) { this.nextEvent = 9999; this.spawnEvent(); } }
    this.updateEvent(dt);
  }
}
