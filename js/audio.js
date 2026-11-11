// Sons du jeu : stations de radio (comme dans les jeux en monde ouvert), ambiance de la ville, moteur, klaxon.
import { S, L, save } from './state.js';

const KM = 'Kevin MacLeod', OH = 'Open Hymnal';
export const STATIONS = [
  { id: 'akwaba', icon: '🥁', name: ['Radio Akwaba', 'Radio Akwaba'], desc: ["Rythmes d'Afrique de l'Ouest", 'West African rhythms'], tracks: [
    ['allada', 'Allada', KM], ['kumasi', 'Kumasi Groove', KM], ['accralate', 'Accralate', KM], ['adding_sun', 'Adding the Sun', KM]] },
  { id: 'cantiques', icon: '🎹', name: ['Radio Cantiques', 'Hymn Radio'], desc: ['Les grands cantiques de la foi', 'The great hymns of the faith'], tracks: [
    ['holy_holy_holy', ['Saint, saint, saint', 'Holy, Holy, Holy'], OH], ['amazing_grace', ['Grâce infinie (Amazing Grace)', 'Amazing Grace'], KM], ['what_a_friend', ['Quel ami fidèle et tendre', 'What a Friend We Have in Jesus'], OH],
    ['to_god_be_the_glory', ['À Dieu soit la gloire', 'To God Be the Glory'], OH], ['it_is_well', ['Quel repos céleste (It Is Well)', 'It Is Well with My Soul'], OH], ['mighty_fortress', ["C'est un rempart que notre Dieu", 'A Mighty Fortress Is Our God'], OH],
    ['blessed_assurance', ['Assurance bénie (Blessed Assurance)', 'Blessed Assurance'], OH], ['praise_to_the_lord', ['Louez le Seigneur, le Tout-Puissant', 'Praise to the Lord, the Almighty'], OH], ['thaxted', 'Thaxted (Holst)', KM]] },
  { id: 'paix', icon: '🕊️', name: ['Radio Paix', 'Peace Radio'], desc: ['Musique douce pour prier et méditer', 'Gentle music for prayer and meditation'], tracks: [
    ['kalimba', 'Kalimba Relaxation Music', KM], ['wholesome', 'Wholesome', KM]] },
  { id: 'jeunesse', icon: '🎺', name: ['Radio Jeunesse', 'Youth Radio'], desc: ['Reggae et rythmes joyeux', 'Reggae and joyful grooves'], tracks: [
    ['montego', 'Montego', KM], ['gonna_start', 'Gonna Start', KM], ['beachfront', 'Beachfront Celebration', KM], ['life_of_riley', 'Life of Riley', KM]] },
  { id: 'perso', icon: '📱', name: ['Ma musique', 'My music'], desc: ['Tes propres chansons (ajoute-les dans le menu)', 'Your own songs (add them in the menu)'], tracks: [] },
];
const PRAISE = [
  ['« Que tout ce qui respire loue l’Éternel ! » — Psaume 150:6', '"Let every thing that hath breath praise the LORD." — Psalm 150:6'],
  ['« Chantez à l’Éternel un cantique nouveau ! » — Psaume 96:1', '"O sing unto the LORD a new song." — Psalm 96:1'],
  ['« Servez l’Éternel avec joie, venez avec allégresse en sa présence ! » — Psaume 100:2', '"Serve the LORD with gladness: come before his presence with singing." — Psalm 100:2'],
  ['« Je bénirai l’Éternel en tout temps ; sa louange sera toujours dans ma bouche. » — Psaume 34:2', '"I will bless the LORD at all times: his praise shall continually be in my mouth." — Psalm 34:1'],
];
export const CREDITS = 'Musique : Kevin MacLeod (incompetech.com), licence Creative Commons Attribution 4.0 — cantiques : Open Hymnal Project (domaine public).';

let ctx = null, master = null, noiseBuf = null;
const env = { hum: null, waves: null, engine: null, engGain: null, engFilter: null };
export const audio = {
  el: null, station: 0, order: [], idx: 0, vol: 0, target: 0, now: null, count: 0, onTrack: null, special: null, unlocked: false,
  ctxState: { inVehicle: false, speed: 0, moto: false, shore: 0, busy: false, menu: false, night: 0, africa: true },

  init() {
    const el = this.el = new Audio(); el.preload = 'none'; el.volume = 0;
    el.addEventListener('ended', () => { if (this.special) { const cb = this.special.done; this.special = null; if (cb) cb(); this.play(); } else this.next(); });
    el.addEventListener('error', () => { if (el.src) setTimeout(() => this.next(), 1500); });
    this.station = typeof S.radio === 'number' ? S.radio : 0;
  },
  // à appeler lors du premier geste du joueur (les navigateurs bloquent le son avant)
  unlock() {
    if (this.unlocked) return; this.unlocked = true;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination); this.buildAmbience(); } catch (e) { ctx = null; }
    this.play();
  },
  enabled() { return S.settings.sound !== false; },
  musicMode() { return S.settings.music || 'always'; },

  // ---------- radio ----------
  stationInfo() { return this.station >= 0 ? STATIONS[this.station] : null; },
  setStation(i, announce = true) {
    this.station = i; S.radio = i; save(); this.order = []; this.special = null;
    if (i < 0) { this.el.pause(); this.now = null; if (announce && this.onTrack) this.onTrack(L(['📻 Radio éteinte', '📻 Radio off'])); return; }
    this.play(announce);
  },
  cycle(d = 1) { const n = STATIONS.length + 1; let i = this.station + 1; i = (i + d + n) % n; this.setStation(i - 1); },
  next() { this.idx++; this.play(); },
  play(announce = true) {
    if (!this.unlocked || this.special) return; const st = this.stationInfo(); if (!st) return;
    if (!st.tracks.length) { this.el.pause(); this.now = null; if (announce && this.onTrack) this.onTrack(`${st.icon} ${L(st.name)} — ${L(['ajoute tes chansons dans le menu ☰ → Musique', 'add your songs in the ☰ menu → Music'])}`); return; }
    if (!this.order.length || this.idx >= this.order.length) { this.order = st.tracks.map((t, i) => i).sort(() => Math.random() - 0.5); this.idx = 0; }
    const t = st.tracks[this.order[this.idx]]; this.now = t;
    this.el.src = t[3] || `assets/music/${t[0]}.mp3`; this.el.play().catch(() => {});
    this.count++;
    if (announce && this.onTrack) { this.onTrack(`${st.icon} ${L(st.name)} — ${L(t[1])}${t[2] ? ' · ' + t[2] : ''}`); if (this.count % 3 === 0) setTimeout(() => this.onTrack && this.onTrack(L(PRAISE[(this.count / 3 | 0) % PRAISE.length]), true), 4200); }
  },
  // joue un morceau précis (culte, menu) puis reprend la radio
  playOnce(file, done) { if (!this.unlocked) return; this.special = { done }; this.el.src = `assets/music/${file}.mp3`; this.el.play().catch(() => {}); },
  stopOnce() { if (this.special) { this.special = null; this.play(false); } },
  addUserFiles(files) {
    const st = STATIONS[4]; for (const f of files) st.tracks.push(['user', f.name.replace(/\.[a-z0-9]+$/i, ''), '', URL.createObjectURL(f)]);
    if (st.tracks.length) this.setStation(4);
  },

  // ---------- ambiance et moteur ----------
  buildAmbience() {
    const len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); const d = noiseBuf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const loop = (freq, type, q) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = ctx.createGain(); g.gain.value = 0; s.connect(f).connect(g).connect(master); s.start(); return g; };
    env.hum = loop(320, 'lowpass', 0.5); env.waves = loop(700, 'bandpass', 0.6);
    const o = env.engine = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const f = env.engFilter = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; const g = env.engGain = ctx.createGain(); g.gain.value = 0; o.connect(f).connect(g).connect(master); o.start();
    this.hornT = 6;
  },
  beep(freq, t0, dur, vol = 0.1, type = 'triangle') {
    if (!ctx || !this.enabled()) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq; const t = ctx.currentTime + t0;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
  },
  sfx(name) {
    const seq = { pick: [[880, 0, 0.09], [1320, 0.07, 0.12]], coin: [[1568, 0, 0.07], [2093, 0.06, 0.18]], pay: [[660, 0, 0.08], [440, 0.08, 0.14]], deny: [[196, 0, 0.18], [165, 0.14, 0.22]], win: [[523, 0, 0.15], [659, 0.13, 0.15], [784, 0.26, 0.15], [1047, 0.39, 0.4]], grade: [[392, 0, 0.2], [523, 0.18, 0.2], [659, 0.36, 0.2], [784, 0.54, 0.2], [1047, 0.72, 0.7]], tap: [[660, 0, 0.05]] }[name] || [];
    if (ctx && ctx.state === 'suspended') ctx.resume(); for (const [f, t0, d] of seq) this.beep(f, t0, d, 0.11);
  },
  horn(moto) { if (moto) { this.beep(720, 0, 0.16, 0.16, 'square'); this.beep(720, 0.2, 0.2, 0.16, 'square'); } else { this.beep(415, 0, 0.42, 0.14, 'square'); this.beep(523, 0, 0.42, 0.12, 'square'); } },

  update(dt) {
    const c = this.ctxState, on = this.enabled(), mode = this.musicMode();
    // volume de la musique : plus fort en véhicule, discret à pied, atténué pendant les dialogues
    let tv = 0; if (on && mode !== 'off' && (this.station >= 0 || this.special)) tv = this.special ? 0.75 : c.menu ? 0.5 : c.inVehicle ? 0.72 : mode === 'always' ? 0.4 : 0;
    if (c.busy && !this.special) tv *= 0.45;
    this.vol += (tv - this.vol) * Math.min(1, dt * 2.2); const v = Math.max(0, Math.min(1, this.vol)); if (this.el && Math.abs(this.el.volume - v) > 0.005) this.el.volume = v;
    if (this.el && this.unlocked && this.now && !this.special) { if (v < 0.01 && !this.el.paused && tv === 0) this.el.pause(); else if (tv > 0 && this.el.paused && this.el.src) this.el.play().catch(() => {}); }
    if (!ctx) return; const t = ctx.currentTime, amb = on && !c.menu ? 1 : 0;
    env.hum.gain.setTargetAtTime(amb * (0.05 + 0.03 * (1 - c.night)) * (c.inVehicle ? 0.6 : 1), t, 0.5);
    env.waves.gain.setTargetAtTime(amb * c.shore * (0.1 + 0.07 * Math.sin(t * 0.7)), t, 0.4);
    const sp = Math.abs(c.speed), eg = amb && c.inVehicle ? (c.moto ? 0.05 : 0.035) + Math.min(0.04, sp * 0.003) : 0;
    env.engGain.gain.setTargetAtTime(eg, t, 0.12); env.engine.frequency.setTargetAtTime((c.moto ? 62 : 38) + sp * (c.moto ? 9 : 5.5), t, 0.1); env.engFilter.frequency.setTargetAtTime(380 + sp * 60, t, 0.2); env.engine.type = c.moto ? 'square' : 'sawtooth';
    // klaxons lointains de la circulation
    this.hornT -= dt; if (this.hornT <= 0) { this.hornT = (c.africa ? 5 : 14) + Math.random() * 11; if (amb && c.night < 0.8) { const f = 600 + Math.random() * 300, vv = 0.012 + Math.random() * 0.02; this.beep(f, 0, 0.12, vv, 'square'); if (Math.random() < 0.6) this.beep(f, 0.18, 0.14, vv, 'square'); } }
  },
};
