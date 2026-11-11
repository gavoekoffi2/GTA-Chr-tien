// Zion City — boucle principale.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { S, L, load, save, reset } from './state.js';
import { ui, T, esc } from './ui.js';
import { World, CITIES, rng32 } from './world.js';
import { createCharacter, loadAnimations, CHARACTERS, applyOutfit, TOPS, BOTTOMS, waxCanvas } from './characters.js';
import { Input, Player } from './player.js';
import { Vehicle, Traffic } from './vehicles.js';
import { setVehicleNight, setPlateStyle } from './cars.js';
import { Crowd, makeMarker, makeItem } from './npc.js';
import { Missions } from './missions.js';
import { Economy, PRICE, fmt } from './economy.js';
import { audio, STATIONS, CREDITS } from './audio.js';
import { WALK_MISSIONS, CITY_MISSIONS, VERSES, GRADES, SCROLLS, GREETINGS } from './content.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const NAMES = { kofi: 'Kofi', yao: 'Yao', mensah: 'Mensah', edem: 'Edem', kodjo: 'Kodjo', ama: 'Ama', afi: 'Afi', esi: 'Esi', akou: 'Akou' };
const X = {
  greet: ['Saluer', 'Greet'], passer: ['Un habitant', 'A local'], travel: ['Voyager', 'Travel'], enter: ['Monter sur ma moto', 'Get on my motorbike'], drive: ['Conduire ma voiture', 'Drive my car'], getOff: ['Descendre', 'Get off'],
  peds: ['Doucement ! Les piétons d’abord. « Tu aimeras ton prochain comme toi-même. »', 'Easy! Pedestrians first. "Thou shalt love thy neighbour as thyself."'],
  scroll: ['Tu as trouvé un parchemin !', 'You found a scroll!'], where: ['Où veux-tu aller ?', 'Where do you want to go?'], locked: ['Grade requis', 'Rank required'], here: ['Tu es ici', 'You are here'],
  mode: ['Choisis ton chemin', 'Choose your path'], walk: ['La Marche chrétienne', 'The Christian Walk'], walkD: ['De la nouvelle naissance à la maturité : 7 grades, 21 étapes. Prière, Parole, service, témoignage, combat, disciples.', 'From new birth to maturity: 7 ranks, 21 steps. Prayer, Word, service, witness, warfare, disciples.'],
  city: ['Lumière dans la ville', 'Light in the City'], cityD: ['Missions libres dans la ville : secourir, nourrir, réconcilier, pardonner. Vis ta foi au quotidien.', 'Free missions around the city: rescue, feed, reconcile, forgive. Live out your faith every day.'],
  both: ['Les deux chemins restent ouverts : tu peux changer à tout moment depuis le menu ☰.', 'Both paths stay open: you can switch at any time from the ☰ menu.'],
  tabs: [['Missions', 'Missions'], ['Ma Bible', 'My Bible'], ['Grades', 'Ranks'], ['Musique', 'Music'], ['Options', 'Options']], noVerse: ['Accomplis des missions et cherche les parchemins pour remplir ta Bible.', 'Complete missions and look for scrolls to fill your Bible.'],
  callMoto: ['Faire venir ma moto', 'Bring my motorbike'], callCar: ['Faire venir ma voiture', 'Bring my car'], callZem: ['Appeler un zémidjan', 'Call a moto-taxi'], zemJob: ['Travailler comme zémidjan / taxi', 'Work as a moto-taxi / taxi'], stopJob: ['Arrêter le travail', 'Stop working'],
  outfit: ['Personnage et vêtements (tailleur)', 'Character and clothes (tailor)'], quality: ['Qualité graphique', 'Graphics quality'], sound: ['Sons', 'Sound'],
  menu: ['Menu principal', 'Main menu'], resume: ['Reprendre', 'Resume'], on: ['activés', 'on'], off: ['coupés', 'off'], done: ['accompli', 'done'], abandon: ['Abandonner la mission en cours', 'Abandon current mission'],
  help: ['Déplacement : ZQSD / WASD / flèches · Courir : Maj · Action : E · Véhicule : F · Radio : R · Klaxon : H · Travail : J · Menu : Tab · Caméra : glisser la souris', 'Move: WASD / arrows · Run: Shift · Action: E · Vehicle: F · Radio: R · Horn: H · Work: J · Menu: Tab · Camera: drag the mouse'],
  helpT: ['Manette à gauche pour marcher, glisse à droite pour regarder. E : action · » : courir · 🚗 : véhicule · 📻 : radio', 'Left stick to walk, drag on the right to look. E: action · »: run · 🚗: vehicle · 📻: radio'],
  scrolls: ['Parchemins trouvés dans cette ville', 'Scrolls found in this city'], welcome: ['Bienvenue à', 'Welcome to'], confirmNew: ['Recommencer effacera ta progression. Continuer ?', 'Starting over will erase your progress. Continue?'], yes: ['Oui', 'Yes'], no: ['Non', 'No'],
  osm: ['Plan des villes : © les contributeurs d’OpenStreetMap', 'City maps: © OpenStreetMap contributors'],
  free: ['offert par ton église pour ta mission', 'paid by your church for your mission'], ticket: ['Billet', 'Ticket'], short: ['Il te manque', 'You are short by'],
  stations: ['Stations de radio', 'Radio stations'], radioOff: ['Radio éteinte', 'Radio off'], musicMode: ['Écouter la musique', 'Listen to music'], mAlways: ['partout (écouteurs)', 'everywhere (earphones)'], mVeh: ['seulement en véhicule', 'in vehicles only'], mOff: ['jamais', 'never'],
  addSongs: ['➕ Ajouter mes propres chansons', '➕ Add my own songs'], addHint: ['Choisis des fichiers audio de ton appareil : ils restent sur ton appareil.', 'Pick audio files from your device: they stay on your device.'],
  start: ['Bienvenue à Lomé ! Tu as un peu d’argent : prends un zémidjan 🏍 pour aller loin, ramasse des bouteilles ♻ et fais de petits boulots 💼 pour gagner ta vie.', 'Welcome to Lomé! You have a little money: take a moto-taxi 🏍 to go far, collect bottles ♻ and do small jobs 💼 to earn your living.'],
  price: ['prix', 'price'], tailor: ['Les tenues colorées s’achètent chez le tailleur.', 'Coloured outfits are bought from the tailor.'], motoGift: ['Frère Kodjo t’offre sa moto ! Elle t’attend près de toi.', 'Brother Kodjo gives you his motorbike! It is waiting near you.'],
};
const x = k => L(X[k]);

const G = {
  scene: new THREE.Scene(), time: 0, tod: 0.3, state: 'boot', vehicles: [], scrollItems: [], switching: false, quality: 'high',
  reward(r) { for (const k of ['faith', 'love', 'wisdom']) if (r[k]) S.stats[k] += r[k]; const m = (r.talents || 0) * 50 + (r.money || 0); if (m) S.money += m; this.refreshHud(); },
  refreshHud() { const g = GRADES[S.grade]; ui.hud(L(g.name), g.icon); },
  sfx(name) { audio.sfx(name); },
  onGrade() { if (S.grade >= 1 && !S.owned.moto) { S.owned.moto = true; this.spawnOwn('moto'); ui.toast(x('motoGift'), true, 6000); save(); } },
  currentGoal() { const m = this.missions; if (!m) return null; if (m.active) { const pp = this.player.pos; let b = null, bd = 1e9; for (const q of m.targets) { const d = Math.hypot(q.x - pp.x, q.z - pp.z); if (d < bd) { bd = d; b = q; } } return b; } const g = m.idleGoal(); return g.x !== undefined ? g : null; },
};
window.G = G;

// ---------- Rendu ----------
const canvas = $('game');
let Q = 'high';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.25, 1200);
const sky = new Sky(); sky.scale.setScalar(6000); G.scene.add(sky);
const sun = new THREE.DirectionalLight(0xfff1dc, 3); G.scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xbcd6ff, 0x8a7458, 0.6); G.scene.add(hemi);
G.scene.fog = new THREE.Fog(0xc9d8e6, 120, 700);
const pmrem = new THREE.PMREMGenerator(renderer); const skyScene = new THREE.Scene(); const sky2 = new Sky(); sky2.scale.setScalar(1000); skyScene.add(sky2);
let envRT = null, envTimer = 99;
const sunDir = new THREE.Vector3();

function applyQuality() {
  const s = S.settings.quality; Q = params.get('q') || (s !== 'auto' ? s : (matchMedia('(pointer: coarse)').matches ? 'medium' : 'high')); G.quality = Q;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q === 'high' ? 2 : Q === 'medium' ? 1.5 : 1));
  renderer.shadowMap.enabled = Q !== 'low'; renderer.shadowMap.type = THREE.PCFShadowMap; sun.castShadow = Q !== 'low';
  const ms = Q === 'high' ? 2048 : 1024; if (sun.shadow.mapSize.x !== ms) { sun.shadow.mapSize.set(ms, ms); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  const c = sun.shadow.camera, r = Q === 'high' ? 55 : 38; c.left = c.bottom = -r; c.right = c.top = r; c.near = 1; c.far = 400; c.updateProjectionMatrix(); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  const far = Q === 'high' ? 760 : Q === 'medium' ? 520 : 360; G.scene.fog.near = far * 0.45; G.scene.fog.far = far; camera.far = far + 60; camera.updateProjectionMatrix();
  resize();
}
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);

function updateSky(dt, force) {
  G.tod = (G.tod + dt / 780) % 1;
  const sv = Math.sin((G.tod - 0.25) * Math.PI * 2) * 0.9 + 0.6, el = Math.max(-0.25, Math.min(1.2, sv * 0.85)), az = 0.6 + G.tod * 2.2;
  const day = THREE.MathUtils.smoothstep(sv, -0.05, 0.35), night = 1 - THREE.MathUtils.smoothstep(sv, -0.12, 0.12);
  sunDir.setFromSphericalCoords(1, Math.PI / 2 - Math.max(0.06, el), az);
  const u = sky.material.uniforms; u.sunPosition.value.setFromSphericalCoords(1, Math.PI / 2 - el, az); u.turbidity.value = 5; u.rayleigh.value = 1.3 + (1 - day) * 1.5; u.mieCoefficient.value = 0.006; u.mieDirectionalG.value = 0.8;
  sun.intensity = 0.2 + day * 2.3; sun.color.setHSL(0.09, 0.35 + (1 - day) * 0.4, 0.5 + day * 0.42); hemi.intensity = 0.28 + day * 0.34;
  renderer.toneMappingExposure = 0.4 + day * 0.12 + night * 0.25;
  G.scene.fog.color.setRGB(0.1 + day * 0.56, 0.13 + day * 0.63, 0.2 + day * 0.68);
  G.night = night; if (G.world) G.world.setNight(night); setVehicleNight(night);
  envTimer += dt;
  if (force || envTimer > (Q === 'low' ? 60 : 20)) { envTimer = 0; const u2 = sky2.material.uniforms; for (const k of ['sunPosition', 'turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) { if (u2[k].value.copy) u2[k].value.copy(u[k].value); else u2[k].value = u[k].value; }
    const rt = pmrem.fromScene(skyScene, 0, 1, 2000); if (envRT) envRT.dispose(); envRT = rt; G.scene.environment = rt.texture; G.scene.environmentIntensity = 0.4; }
}

// ---------- Ville ----------
const progress = (p, text) => { $('loadbar').style.width = Math.round(p * 100) + '%'; if (text) $('loadtext').textContent = text; };
async function enterCity(id, spawn) {
  G.switching = true;
  if (G.missions) G.missions.dispose(); if (G.eco) G.eco.dispose(); if (G.crowd) G.crowd.dispose(); if (G.traffic) G.traffic.dispose();
  if (G.player && G.player.vehicle) G.player.exit();
  for (const v of G.vehicles) v.dispose(); G.vehicles = []; for (const s of G.scrollItems) G.scene.remove(s.mesh); G.scrollItems = [];
  if (G.world) G.world.dispose();
  S.city = id; progress(0.35, L(CITIES[id].name) + '…'); setPlateStyle(id);
  const world = G.world = await World.create(G.scene, id, Q); progress(0.7);
  const sp = spawn === 'saved' && S.pos && S.pos.c === id ? S.pos : world.poi(spawn === 'station' ? 'station' : S.started ? 'home' : 'landmark');
  const f = world.freeNear(sp.x + (sp.c ? 0 : 5), sp.z + (sp.c ? 0 : 5), 0.8);
  if (!G.player) { G.player = new Player(G.scene, camera, world); G.input = new Input(canvas); } else G.player.world = world;
  if (!G.player.ch) await setCharacter(S.char);
  G.player.teleport(f.x, f.z, sp.face !== undefined ? sp.face + Math.PI : 0);
  G.crowd = new Crowd(G.scene, world, Q); await G.crowd.init(G.player.pos); progress(0.85);
  G.traffic = new Traffic(G.scene, world, Q, G.player.pos);
  if (S.owned.moto) G.spawnOwn('moto'); if (S.owned.car) G.spawnOwn('sedan');
  placeScrolls();
  G.eco = new Economy(G); await G.eco.setup();
  G.missions = new Missions(G); G.switching = false; await G.missions.refresh(); progress(1);
  audio.ctxState.africa = !world.cfg.style;
  $('cityname').textContent = `${world.cityName()} · ${L(world.cfg.country)}`; updateSky(0, true); G.refreshHud();
}
G.spawnOwn = function (type) {
  const key = type === 'moto' ? 'moto' : 'car'; if (!S.owned[key]) return null;
  let v = this.vehicles.find(q => q.type === type);
  if (!v) { v = new Vehicle(type, type === 'moto' ? 0x1f5fa8 : 0xf4f4f0, this.scene, { rhd: !!this.world.cfg.left, plate: 2 }); v.owned = true; v.fuel = Math.min(v.tank, S.fuel[key]); v.marker = makeMarker(0x7dd87d, false); v.marker.userData.dia.position.y = type === 'moto' ? 1.9 : 2.2; this.scene.add(v.marker); const d = v.dispose.bind(v); v.dispose = () => { this.scene.remove(v.marker); d(); }; this.vehicles.push(v); }
  const pp = this.player.pos, s = this.world.roadside(pp.x, pp.z, type === 'moto' ? 2.5 : 8), p = this.world.freeNear(s.x, s.z, 1.2); v.place(p.x, p.z, s.h); v.pos.y = this.world.groundY(p.x, p.z); return v;
};
async function setCharacter(id) { const ch = await createCharacter(id); await applyOutfit(ch, S.top, S.bottom); G.player.setCharacter(ch); S.char = id; }
function placeScrolls() {
  const w = G.world, rng = rng32(w.id.charCodeAt(0) * 131 + w.id.length), ch = w.poi('church'), ci = Object.keys(CITIES).indexOf(w.id);
  for (let i = 0; i < 10; i++) { const a = rng() * 6.283, d = 80 + rng() * 620, p = w.roadPoint(ch.x + Math.cos(a) * d, ch.z + Math.sin(a) * d, 60, rng); const id = w.id + i; if (S.scrolls[id]) continue;
    const m = makeItem(0xfff0a8); m.position.set(p.x, w.groundY(p.x, p.z), p.z); G.scene.add(m); G.scrollItems.push({ mesh: m, x: p.x, z: p.z, id, verse: SCROLLS[(i + ci * 3) % SCROLLS.length] }); }
}
async function travel(id) { await ui.fade(true); ui.show('loading'); await enterCity(id, 'station'); ui.show('loading', false); save(); await ui.fade(false); ui.toast(`${x('welcome')} ${L(CITIES[id].name)} !`, true); }

// ---------- Menus ----------
function chooseMode() {
  const box = ui.openModal(`<h2>${x('mode')}</h2><div class="opts"><button data-m="walk"><b style="color:#f5c542;font-size:18px">✝ ${x('walk')}</b><br><small>${x('walkD')}</small></button><button data-m="city"><b style="color:#5fb7f0;font-size:18px">☀ ${x('city')}</b><br><small>${x('cityD')}</small></button></div><p style="opacity:.7;font-size:13px">${x('both')}</p><p style="opacity:.6;font-size:12px">${ui.touch ? x('helpT') : x('help')}</p>`);
  return new Promise(res => box.querySelectorAll('button').forEach(b => b.onclick = () => { S.mode = b.dataset.m; ui.closeModal(); save(); res(); }));
}
const playable = Object.keys(CHARACTERS).filter(k => CHARACTERS[k].playable);
function openCharsel(first) {
  G.state = 'charsel'; ui.show('hud', false); ui.show('charsel'); let busy = false; if (G.player.vehicle) G.player.exit();
  const name = () => { $('cs-name').innerHTML = `${NAMES[S.char]}<small>${playable.indexOf(S.char) + 1} / ${playable.length} · 🪙 ${fmt(S.money)}</small>`; };
  const sw = (el, list, key, cur, set) => { el.innerHTML = ''; list.forEach((o, i) => { const b = document.createElement('button'); b.className = 'sw' + (i === cur() ? ' on' : ''); const own = !o || S.wardrobe[key].includes(i) || (first && o.c), price = o && o.wax !== undefined ? PRICE.wax : PRICE.top;
    if (!o) { b.textContent = '∅'; b.style.background = '#444'; } else if (o.c) b.style.background = o.c; else b.style.backgroundImage = `url(${waxCanvas(o.wax).toDataURL()})`;
    if (!own) b.innerHTML += `<span class="pr">${fmt(price)}</span>`;
    b.onclick = async () => { if (busy) return; if (!own) { if (S.money < price) { audio.sfx('deny'); ui.toast(`${x('short')} ${fmt(price - S.money)}`); return; } S.money -= price; audio.sfx('pay'); }
      if (!S.wardrobe[key].includes(i)) S.wardrobe[key].push(i); busy = true; set(i); await applyOutfit(G.player.ch, S.top, S.bottom); busy = false; draw(); save(); }; el.appendChild(b); }); };
  const draw = () => { name(); sw($('cs-tops'), TOPS, 't', () => S.top, i => S.top = i); sw($('cs-bottoms'), BOTTOMS, 'b', () => S.bottom, i => S.bottom = i); };
  const step = async d => { if (busy) return; busy = true; const i = (playable.indexOf(S.char) + d + playable.length) % playable.length; const pos = G.player.pos.clone(), h = G.player.heading; await setCharacter(playable[i]); G.player.pos.copy(pos); G.player.heading = h; busy = false; draw(); };
  $('cs-prev').onclick = () => step(-1); $('cs-next').onclick = () => step(1); $('cs-input').value = S.name; draw();
  G.player.yaw = G.player.heading; G.player.pitch = 0.08; G.player.dist = 3.4; G.player.first = true;
  $('cs-ok').onclick = async () => { if (busy) return; S.name = $('cs-input').value.trim().slice(0, 16) || NAMES[S.char]; ui.show('charsel', false); G.player.yaw = G.player.heading + Math.PI; G.player.pitch = 0.22; G.player.dist = 4.6;
    if (first) { S.started = true; save(); await chooseMode(); } save(); startPlay(); if (first) ui.toast(x('start'), true, 9000); };
}
function startPlay() { G.state = 'play'; ui.show('menu', false); ui.show('hud'); ui.show('touch', ui.touch); G.refreshHud(); G.input.clear(); audio.ctxState.menu = false; audio.stopOnce(); }
function showMenu() { G.state = 'menu'; ui.refreshTexts(); ui.show('hud', false); ui.show('menu'); $('menu-foot').textContent = T('foot') + ' — ' + x('osm'); audio.ctxState.menu = true; }

function phone(tab = 0) {
  const tabs = X.tabs.map((t, i) => `<button class="${i === tab ? 'on' : ''}" data-t="${i}">${L(t)}</button>`).join('');
  let body = '';
  if (tab === 0) {
    body += `<div class="tabs"><button class="${S.mode === 'walk' ? 'on' : ''}" data-mode="walk">✝ ${x('walk')}</button><button class="${S.mode === 'city' ? 'on' : ''}" data-mode="city">☀ ${x('city')}</button></div><div class="list">`;
    if (S.mode === 'walk') { for (let g = 1; g <= 7; g++) { body += `<h3>${GRADES[g].icon} ${esc(L(GRADES[g].name))}</h3>`; for (const m of WALK_MISSIONS.filter(q => q.grade === g)) { const next = G.missions.nextWalk() === m; body += `<div class="item ${S.done[m.id] ? 'done' : next ? '' : 'lock'}"><b>${S.done[m.id] ? '✔' : next ? '➤' : '🔒'} ${esc(L(m.title))}</b><small>${esc(L(CITIES[m.city].name))}${S.done[m.id] ? ' · ' + x('done') : ''}</small></div>`; } } }
    else for (const c in CITIES) { const list = CITY_MISSIONS.filter(q => q.city === c); body += `<h3>${esc(L(CITIES[c].name))} ${S.grade < CITIES[c].grade ? '🔒' : ''}</h3>`; for (const m of list) body += `<div class="item ${S.done[m.id] ? 'done' : ''}"><b>${S.done[m.id] ? '✔' : '•'} ${esc(L(m.title))}</b></div>`; }
    body += '</div>';
  } else if (tab === 1) {
    const n = G.scrollItems.length; body += `<p style="opacity:.75;font-size:13px">${x('scrolls')} : ${10 - n} / 10</p>`;
    body += S.verses.length ? S.verses.map(id => ui.scriptureHTML(VERSES[id])).join('<div style="height:8px"></div>') : `<p>${x('noVerse')}</p>`;
  } else if (tab === 2) {
    body += '<div class="list">' + GRADES.slice(1).map((g, i) => `<div class="item ${S.grade > i ? '' : 'lock'}"><div class="gradeline"><div class="ic">${g.icon}</div><div><b>${i + 1}. ${esc(L(g.name))}</b><small>${esc(L(g.desc))}</small><small style="color:#f5c542">${S.grade > i ? '🏅 ' + esc(L(g.badge)) : ''}</small></div></div></div>`).join('') + '</div>';
  } else if (tab === 3) {
    const mm2 = audio.musicMode();
    body += `<h3>${x('stations')}</h3><div class="opts">` + STATIONS.map((s, i) => `<button data-st="${i}" class="${audio.station === i ? 'sel' : ''}"><div class="station"><div class="ic">${s.icon}</div><div><b>${esc(L(s.name))}</b><br><small>${esc(L(s.desc))}${i === 4 && s.tracks.length ? ' · ' + s.tracks.length : ''}</small></div></div></button>`).join('') + `<button data-st="-1" class="${audio.station < 0 ? 'sel' : ''}"><div class="station"><div class="ic">🔇</div><div><b>${x('radioOff')}</b></div></div></button></div>`;
    body += `<h3>${x('musicMode')}</h3><div class="tabs">${[['always', 'mAlways'], ['vehicle', 'mVeh'], ['off', 'mOff']].map(([k, l]) => `<button data-mm="${k}" class="${mm2 === k ? 'on' : ''}">${x(l)}</button>`).join('')}</div>`;
    body += `<div class="opts"><button id="add-songs" class="big" style="text-align:center">${x('addSongs')}</button></div><input id="song-files" type="file" accept="audio/*" multiple style="display:none"><p style="opacity:.6;font-size:12px">${x('addHint')}</p><p style="opacity:.55;font-size:11px">${esc(CREDITS)}</p>`;
  } else {
    const b = (id, t) => `<button class="big" data-a="${id}" style="text-align:center">${t}</button>`, job = G.eco.job && G.eco.job.kind === 'zem';
    body += `<div class="opts">${b('zem', '📞 ' + x('callZem') + ' — ' + fmt(PRICE.call))}${S.owned.moto ? b('moto', '🏍 ' + x('callMoto')) : ''}${S.owned.car ? b('car', '🚗 ' + x('callCar')) : ''}${S.owned.moto || S.owned.car ? b('job', '💼 ' + (job ? x('stopJob') : x('zemJob'))) : ''}${b('outfit', '👕 ' + x('outfit'))}${G.missions.active ? b('abandon', '✖ ' + x('abandon')) : ''}${b('lang', '🌍 ' + T('lang'))}${b('quality', `⚙ ${x('quality')} : ${S.settings.quality}`)}${b('sound', `🔊 ${x('sound')} : ${S.settings.sound ? x('on') : x('off')}`)}${b('menu', '⌂ ' + x('menu'))}</div><p style="opacity:.6;font-size:12px">${ui.touch ? x('helpT') : x('help')}<br>${x('osm')}</p>`;
  }
  const box = ui.openModal(`<div class="tabs">${tabs}</div>${body}<div class="opts" style="align-items:center;margin-top:14px"><button class="big gold" id="ph-close" style="min-width:200px;text-align:center">${x('resume')}</button></div>`);
  const re = t => { ui.closeModal(); phone(t); };
  box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => re(+b.dataset.t));
  box.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; save(); re(0); });
  box.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { audio.setStation(+b.dataset.st); re(3); });
  box.querySelectorAll('[data-mm]').forEach(b => b.onclick = () => { S.settings.music = b.dataset.mm; save(); re(3); });
  const add = box.querySelector('#add-songs'); if (add) { const inp = box.querySelector('#song-files'); add.onclick = () => inp.click(); inp.onchange = () => { if (inp.files.length) { audio.addUserFiles(inp.files); re(3); } }; }
  box.querySelector('#ph-close').onclick = () => ui.closeModal();
  box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a;
    if (a === 'moto' || a === 'car') { if (G.player.vehicle) { if (G.eco.ride) return; G.player.exit(); } G.spawnOwn(a === 'moto' ? 'moto' : 'sedan'); ui.closeModal(); }
    else if (a === 'zem') { ui.closeModal(); G.eco.callZem(); }
    else if (a === 'job') { ui.closeModal(); G.eco.toggleZemJob(); }
    else if (a === 'outfit') { ui.closeModal(); openCharsel(false); }
    else if (a === 'abandon') { G.missions.cancel(); ui.closeModal(); }
    else if (a === 'lang') { S.lang = S.lang === 'fr' ? 'en' : 'fr'; save(); ui.refreshTexts(); $('cityname').textContent = `${G.world.cityName()} · ${L(G.world.cfg.country)}`; G.refreshHud(); re(4); }
    else if (a === 'quality') { const o = ['auto', 'low', 'medium', 'high']; S.settings.quality = o[(o.indexOf(S.settings.quality) + 1) % 4]; save(); applyQuality(); re(4); }
    else if (a === 'sound') { S.settings.sound = !S.settings.sound; save(); re(4); }
    else if (a === 'menu') { ui.closeModal(); save(); showMenu(); } });
}
function travelMenu() {
  const nw = G.missions.nextWalk();
  const rows = Object.keys(CITIES).map(c => { const cf = CITIES[c], here = c === S.city, lock = S.grade < cf.grade, free = nw && nw.city === c, price = free ? 0 : PRICE.ticket[c];
    return `<button data-c="${c}" data-p="${price}" ${here || lock ? 'disabled' : ''} style="${here || lock ? 'opacity:.45' : ''}"><b>${esc(L(cf.name))}</b> — ${esc(L(cf.country))}<br><small>${here ? x('here') : lock ? `🔒 ${x('locked')} : ${esc(L(GRADES[cf.grade].name))}` : free ? `✈ ${x('ticket')} ${x('free')}` : `✈ ${x('ticket')} : ${fmt(price)}`}</small></button>`; }).join('');
  const box = ui.openModal(`<h2>${x('where')}</h2><p style="opacity:.8">🪙 ${fmt(S.money)}</p><div class="opts">${rows}</div><div class="opts" style="align-items:center"><button class="big" id="tr-x" style="min-width:200px;text-align:center">${T('close')}</button></div>`);
  box.querySelector('#tr-x').onclick = () => ui.closeModal();
  box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const p = +b.dataset.p; if (p && !G.eco.pay(p)) return; ui.closeModal(); if (G.missions.active) G.missions.cancel(); G.eco.endJob(true); setTimeout(() => travel(b.dataset.c), 50); });
}

// ---------- Mini-carte ----------
const mm = $('minimap'), mg = mm.getContext('2d'); let mmT = 0, hudT = 0;
function drawMinimap() {
  const w = G.world, pp = G.player.pos, R = 170, sc = w.mapScale, N = mm.width, k = N / (2 * R);
  mg.fillStyle = '#31475c'; mg.fillRect(0, 0, N, N);
  mg.drawImage(w.mapCanvas, (pp.x - R - w.ext.x0) / sc, (pp.z - R - w.ext.z0) / sc, 2 * R / sc, 2 * R / sc, 0, 0, N, N);
  const place = (x0, z0, clamp) => { let dx = (x0 - pp.x) * k, dz = (z0 - pp.z) * k; const d = Math.hypot(dx, dz), lim = N / 2 - 8; if (d > lim) { if (!clamp) return null; dx *= lim / d; dz *= lim / d; } return [N / 2 + dx, N / 2 + dz]; };
  const dot = (x0, z0, col, r = 5, clamp = true, ring) => { const p = place(x0, z0, clamp); if (!p) return; mg.fillStyle = col; mg.beginPath(); mg.arc(p[0], p[1], r, 0, 7); mg.fill(); mg.lineWidth = 2; mg.strokeStyle = ring || '#00000088'; mg.stroke(); };
  const st = w.poi('station'), hm = w.poi('home'), ch = w.poi('church'); dot(st.x, st.z, '#ffffff', 4, false); dot(hm.x, hm.z, '#2f6f9f', 4, false); dot(ch.x, ch.z, '#b3261e', 4, false);
  for (const s of G.scrollItems) dot(s.x, s.z, '#fff0a8', 2.5, false);
  for (const b of G.eco.bottles) dot(b.x, b.z, '#3fae6a', 2, false);
  mg.font = '13px sans-serif'; mg.textAlign = 'center'; mg.textBaseline = 'middle';
  for (const ic of G.eco.mapIcons()) { const p = place(ic.x, ic.z, false); if (p) mg.fillText(ic.ch, p[0], p[1]); }
  for (const v of G.vehicles) if (!v.rider) dot(v.pos.x, v.pos.z, '#7dd87d', 4, true);
  const m = G.missions; if (!m.active) for (const o of m.offers) dot(o.x, o.z, o.def.mode === 'walk' ? '#f5c542' : '#5fb7f0', 6, o.def.mode === S.mode);
  const pulse = 5 + Math.sin(G.time * 5) * 1.5; for (const tg of m.targets) dot(tg.x, tg.z, '#ffffff', pulse, true, '#f5c542');
  for (const tg of G.eco.targets) dot(tg.x, tg.z, '#7dd87d', pulse, true, '#ffffff');
  if (G.eco.ride) dot(G.eco.ride.dest.x, G.eco.ride.dest.z, '#ffffff', pulse, true, '#7dd87d');
  mg.save(); mg.translate(N / 2, N / 2); mg.rotate(-G.player.heading + Math.PI); mg.fillStyle = '#fff'; mg.strokeStyle = '#000'; mg.lineWidth = 2; mg.beginPath(); mg.moveTo(0, -9); mg.lineTo(6, 7); mg.lineTo(0, 3); mg.lineTo(-6, 7); mg.closePath(); mg.fill(); mg.stroke(); mg.restore();
}

// ---------- Boucle ----------
const clock = new THREE.Clock(); const goal = makeMarker(0xffffff); G.scene.add(goal); goal.visible = false; let pedToast = 0, saveT = 0, busyScroll = false;
const TALK = ['Parler', 'Talk'], START = ['Commencer', 'Start'];
function interact() {
  const pl = G.player, pp = pl.pos, inp = G.input, m = G.missions, w = G.world, eco = G.eco; let prompt = null, key = 'E';
  if (inp.take('KeyR')) audio.cycle(1);
  if (inp.take('KeyH')) audio.horn(pl.vehicle ? pl.vehicle.isMoto : true);
  if (inp.take('KeyJ')) eco.toggleZemJob();
  // véhicules
  if (eco.ride) { const n = eco.nearby(); prompt = n.prompt; if (inp.take('KeyE')) n.act(); inp.take('KeyF'); ui.setPrompt(prompt, 'E'); return; }
  if (pl.vehicle) { if (Math.abs(pl.vehicle.speed) < 3 && inp.take('KeyF')) { pl.exit(); return; } }
  else { let near = null; for (const v of G.vehicles) if (Math.hypot(v.pos.x - pp.x, v.pos.z - pp.z) < v.radius + 2.2) near = v; if (near) { prompt = near.isMoto ? x('enter') : x('drive'); key = 'F'; if (inp.take('KeyF')) { pl.enter(near); return; } } }
  const near = eco.nearby();
  if (m.prompt) { prompt = m.prompt; key = 'E'; }
  else if (!m.active && m.nearOffer() && !pl.vehicle) { const o = m.nearOffer(); prompt = `${o.npc ? L(TALK) : L(START)} — ${L(o.def.title)}`; key = 'E'; if (inp.take('KeyE')) { eco.endJob(true); m.start(o); return; } }
  else if (near) { prompt = near.prompt; key = 'E'; if (inp.take('KeyE')) { near.act(); return; } }
  else if (!m.active && !pl.vehicle) {
    const st = w.poi('station');
    if (Math.hypot(st.x - pp.x, st.z - pp.z) < 6) { prompt = x('travel'); key = 'E'; if (inp.take('KeyE')) { travelMenu(); return; } }
    else { const p = G.crowd.nearestPed(pp, 2.3); if (p && p.pause <= 0) { prompt = x('greet'); key = 'E'; if (inp.take('KeyE')) { G.crowd.stop(p, pp, 6); pl.heading = Math.atan2(p.ch.root.position.x - pp.x, p.ch.root.position.z - pp.z); const g = GREETINGS[Math.random() * GREETINGS.length | 0][0]; if (G.time - (p.greeted || -99) > 60) { p.greeted = G.time; S.greeted++; G.reward({ love: 1 }); } ui.say(x('passer'), L(g)); return; } } }
  }
  ui.setPrompt(prompt, key);
  // parchemins
  if (!busyScroll && !m.active) for (let i = G.scrollItems.length - 1; i >= 0; i--) { const s = G.scrollItems[i]; if (Math.hypot(s.x - pp.x, s.z - pp.z) < 1.8) { G.scene.remove(s.mesh); G.scrollItems.splice(i, 1); S.scrolls[s.id] = 1; if (!S.verses.includes(s.verse)) S.verses.push(s.verse); busyScroll = true; audio.sfx('pick'); G.reward({ wisdom: 3 }); ui.read(VERSES[s.verse], x('scroll')).then(() => { busyScroll = false; save(); }); break; } }
  inp.take('KeyE'); inp.take('KeyF');
}

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta()); G.time += dt;
  if (!G.world || !G.player || G.switching) { renderer.render(G.scene, camera); return; }
  const pl = G.player, inp = G.input, eco = G.eco, playing = G.state === 'play'; inp.update();
  if (ui.busy && (inp.take('KeyE') || inp.take('Space') || inp.take('Enter'))) ui.advance();
  const frozen = !playing || ui.busy > 0;
  if (playing && !ui.busy && inp.take('Tab')) phone(0);
  if (G.state === 'menu') pl.yaw += dt * 0.06;
  const peds = G.crowd.obstacles(), units = eco.vehicles(), all = G.traffic.cars.concat(G.vehicles, units);
  pl.pedBrake = false; pl.update(dt, inp, frozen, all, pl.vehicle ? peds : []);
  if (pl.pedBrake && G.time - pedToast > 8) { pedToast = G.time; ui.toast(x('peds')); }
  G.crowd.update(dt, { x: pl.pos.x, z: pl.pos.z, inVehicle: !!pl.vehicle });
  const me = { x: pl.pos.x, z: pl.pos.z, r: pl.vehicle ? pl.vehicle.radius : 0.4, ref: pl.vehicle }, parked = G.vehicles.filter(v => !v.rider).map(v => ({ x: v.pos.x, z: v.pos.z, r: v.radius, ref: v }));
  G.traffic.update(dt, peds.concat([me], parked, eco.obstacles()), pl.pos);
  eco.update(dt, peds.concat(parked, G.traffic.cars.map(c => ({ x: c.pos.x, z: c.pos.z, r: c.radius, ref: c }))));
  for (const v of G.vehicles) { v.marker.visible = !v.rider; v.marker.position.set(v.pos.x, 0, v.pos.z); v.marker.userData.dia.rotation.y += dt * 2; }
  for (const s of G.scrollItems) s.mesh.userData.box.rotation.y += dt * 2;
  G.missions.update(dt);
  if (playing && !ui.busy) interact(); else ui.setPrompt(null);
  // objectif et tableau de bord
  const m = G.missions; hudT -= dt;
  if (hudT <= 0 && playing) { hudT = 0.3; let title, text, tg = null; const es = eco.status();
    if (m.active) { title = L(m.active.def.title); text = m.objective || '…'; if (m.timer > 0) text += `  ⏱ ${Math.ceil(m.timer)} s`; tg = G.currentGoal(); }
    else if (es) { title = es.title; text = es.text; if (es.x !== undefined) tg = es; }
    else { const g = m.idleGoal(); title = g.title; text = g.text; if (g.x !== undefined) tg = g; }
    if (tg) text += ` — ${Math.round(Math.hypot(tg.x - pl.pos.x, tg.z - pl.pos.z))} m`;
    const street = G.world.streetAt(pl.pos.x, pl.pos.z); $('cityname').textContent = street ? `${street} · ${G.world.cityName()}` : `${G.world.cityName()} · ${L(G.world.cfg.country)}`;
    ui.setObjective(text, title); G.goalT = m.active ? tg : null; G.refreshHud();
    const own = pl.vehicle && pl.vehicle.owned ? pl.vehicle : null; ui.show('fuel', !!own); if (own) { const f = own.fuel / own.tank; $('fuel-bar').style.width = Math.round(f * 100) + '%'; $('fuel').classList.toggle('low', f < 0.15); }
    if (ui.touch) { ui.show('tb-job', !!own); ui.show('tb-horn', !!pl.vehicle); }
  }
  if (G.goalT && playing) { goal.visible = true; goal.position.set(G.goalT.x, 0, G.goalT.z); goal.userData.dia.rotation.y += dt * 2; } else goal.visible = false;
  G.world.update(dt, G.time); updateSky(dt);
  sun.target.position.set(pl.pos.x, 0, pl.pos.z); sun.position.copy(sunDir).multiplyScalar(180).add(sun.target.position);
  sky.position.copy(camera.position);
  const ac = audio.ctxState; ac.inVehicle = !!pl.vehicle; ac.speed = pl.speed; ac.moto = !!(pl.vehicle && pl.vehicle.isMoto); ac.busy = ui.busy > 0; ac.night = G.night || 0; ac.shore = G.world.shore ? Math.max(0, 1 - Math.max(0, G.world.shoreZ(pl.pos.x) - pl.pos.z) / 160) : 0; audio.update(dt);
  mmT -= dt; if (mmT <= 0 && playing) { mmT = 0.1; drawMinimap(); }
  saveT += dt; if (saveT > 12 && playing && !m.active && !eco.ride) { saveT = 0; S.pos = { c: S.city, x: pl.pos.x, z: pl.pos.z }; save(); }
  renderer.render(G.scene, camera);
}

// ---------- Démarrage ----------
async function boot() {
  load(); if (params.get('lang')) S.lang = params.get('lang'); ui.init(); applyQuality(); audio.init(); $('loadtext').textContent = T('loading');
  audio.onTrack = (text, gold) => { if (G.state === 'play') ui.toast(text, !!gold, gold ? 6000 : 3600); };
  addEventListener('pointerdown', () => audio.unlock(), { once: true }); addEventListener('keydown', () => audio.unlock(), { once: true });
  requestAnimationFrame(frame);
  try {
    progress(0.1); await loadAnimations(); progress(0.2);
    await enterCity(CITIES[S.city] ? S.city : 'lome', 'saved');
  } catch (e) { console.error(e); $('loadtext').textContent = 'Erreur : ' + (e.message || e); return; }
  ui.show('loading', false); showMenu();
  $('btn-continue').onclick = () => { audio.unlock(); audio.sfx('tap'); ui.show('menu', false); if (!S.started) openCharsel(true); else startPlay(); };
  $('btn-new').onclick = async () => { const r = await ui.modal(`<p>${x('confirmNew')}</p>`, [x('no'), x('yes')]); if (r === 1) { reset(); S.started = false; ui.show('menu', false); ui.show('loading'); if (G.player.vehicle) G.player.exit(); G.player.ch.dispose(); G.player.ch = null; await enterCity('lome', 'new'); ui.show('loading', false); openCharsel(true); } };
  $('btn-lang').onclick = () => { S.lang = S.lang === 'fr' ? 'en' : 'fr'; save(); showMenu(); };
  window.READY = true;
}
boot();
