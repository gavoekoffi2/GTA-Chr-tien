// Moteur de missions : propose les missions de la ville, exécute leur scénario, distribue récompenses et grades.
import { S, L, save } from './state.js';
import { ui, T } from './ui.js';
import { MISSIONS, WALK_MISSIONS, VERSES, GRADES } from './content.js';
import { CITIES } from './world.js';
import { makeMarker, makeItem } from './npc.js';

const CANCEL = { cancel: true };
const TXT = {
  talk: ['Parler', 'Talk'], start: ['Commencer', 'Start'], late: ['Trop lent… on reprend le chrono. Courage !', 'Too slow… the timer restarts. Keep going!'],
  waitFor: ['Attends ton compagnon !', 'Wait for your companion!'], walkNext: ['La Marche', 'The Walk'], cityNext: ['Lumière dans la ville', 'Light in the city'],
  travel: ['Rends-toi à la gare pour voyager vers', 'Go to the station to travel to'], allDone: ['Toutes les missions de cette ville sont accomplies. Explore, salue les habitants, cherche les parchemins !', 'All missions in this city are complete. Explore, greet people, look for the scrolls!'],
  hymn: [['♪ À toi la gloire, ô Ressuscité !', '♪ Thine be the glory, risen, conquering Son!'], ['♪ À toi la victoire pour l’éternité !', '♪ Endless is the victory Thou o’er death hast won!'], ['♪ Alléluia ! Alléluia !', '♪ Hallelujah! Hallelujah!']],
  car: ['Ta voiture (garée devant chez toi)', 'Your car (parked outside your home)'], wax: ['Tenues en pagne', 'Wax-print outfits'], crown: ['Tenue dorée', 'Golden outfit'],
};
const t = k => L(TXT[k]);

export class Missions {
  constructor(G) { this.G = G; this.offers = []; this.active = null; this.waiters = []; this.items = []; this.targets = []; this.time = 0; }
  get world() { return this.G.world; }

  nextWalk() { return WALK_MISSIONS.find(m => !S.done[m.id]); }
  available() {
    const out = [], nw = this.nextWalk(); if (nw && nw.city === this.world.id) out.push(nw);
    for (const m of MISSIONS) if (m.mode === 'city' && m.city === this.world.id && !S.done[m.id]) out.push(m);
    return out;
  }
  at(where, o = {}) { const p = typeof where === 'string' ? this.world.poi(where) : where; return this.world.freeNear(p.x + (o.dx || 0), p.z + (o.dz || 0), 0.7); }

  async refresh() {
    this.clearOffers(); const gen = this.gen = (this.gen || 0) + 1;
    for (const def of this.available()) {
      const p = this.at(def.at, { dx: def.dx, dz: def.dz }), poi = this.world.poi(def.at);
      const o = { def, x: p.x, z: p.z, npc: null, marker: makeMarker(def.mode === 'walk' ? 0xf5c542 : 0x5fb7f0) };
      o.marker.position.set(p.x, 0, p.z); this.G.scene.add(o.marker); this.offers.push(o);
      if (def.giver) { const npc = await this.G.crowd.addStatic(def.giver, p.x, p.z, Math.atan2(p.x - poi.cx, p.z - poi.cz), def.ganim, def.gname); if (gen !== this.gen) { this.G.crowd.removeStatic(npc); return; } o.npc = npc; o.x = npc.x; o.z = npc.z; o.marker.position.set(npc.x, 0, npc.z); }
    }
  }
  clearOffers() { for (const o of this.offers) { this.G.scene.remove(o.marker); if (o.npc) this.G.crowd.removeStatic(o.npc); } this.offers = []; }

  // objectif affiché quand aucune mission n'est en cours
  idleGoal() {
    const pp = this.G.player.pos, mode = S.mode, list = this.offers.filter(o => o.def.mode === mode);
    if (list.length) { let b = list[0]; for (const o of list) if ((o.x - pp.x) ** 2 + (o.z - pp.z) ** 2 < (b.x - pp.x) ** 2 + (b.z - pp.z) ** 2) b = o; return { title: mode === 'walk' ? t('walkNext') : t('cityNext'), text: L(b.def.title), x: b.x, z: b.z }; }
    if (mode === 'walk') { const nw = this.nextWalk(); if (nw) { const st = this.world.poi('station'); return { title: t('walkNext'), text: `${t('travel')} ${L(CITIES[nw.city].name)}`, x: st.x, z: st.z }; } }
    if (this.offers.length) { const b = this.offers[0]; return { title: t('cityNext'), text: L(b.def.title), x: b.x, z: b.z }; }
    return { title: this.world.cityName(), text: t('allDone') };
  }
  nearOffer() { if (this.active) return null; const pp = this.G.player.pos; for (const o of this.offers) if (Math.hypot(o.x - pp.x, o.z - pp.z) < 3.2) return o; return null; }

  wait(check) { return new Promise((resolve, reject) => { this.waiters.push({ check, resolve, reject }); }); }
  cancel() { if (!this.active) return; const w = this.waiters; this.waiters = []; this.cancelled = true; for (const x of w) x.reject(CANCEL); }

  async start(offer) {
    const def = offer.def, G = this.G, self = this; this.cancelled = false;
    const m = this.active = { def, npcs: [], giver: offer.npc, last: null, other: offer.npc, mistakes: 0, P: S.name || L(['Ami', 'Friend']), t: L };
    for (const o of this.offers) o.marker.visible = false;
    this.offers = this.offers.filter(o => o !== offer); G.scene.remove(offer.marker);
    const chk = () => { if (self.cancelled) throw CANCEL; };
    const who = w => (w === 'me' ? m.P : w && w.ch ? L(w.name) : L(w));
    const face = npc => { const pp = G.player.pos; npc.ch.root.rotation.y = Math.atan2(pp.x - npc.x, pp.z - npc.z); if (!G.player.vehicle) G.player.heading = Math.atan2(npc.x - pp.x, npc.z - pp.z); };
    Object.assign(m, {
      async say(w, text) { chk(); if (w && w.ch) { m.other = w; if (!w.follow) face(w); if (!/crouch|sit_/.test(w.ch.currentName || '')) w.ch.play('gestic_talk_neutral_01', 0.3); } await ui.say(who(w), L(text)); if (w && w.ch && w.ch.currentName === 'gestic_talk_neutral_01' && !w.follow) w.ch.play(w.base, 0.3); chk(); },
      async talk(list) { for (const [w, tx] of list) await m.say(w, tx); },
      async choice(w, prompt, opts) {
        for (;;) { chk(); const order = opts.map((o, i) => i).sort(() => Math.random() - 0.5), i = order[await ui.choose(who(w), L(prompt), order.map(k => L(opts[k].t)))], o = opts[i];
          if (o.r) { const r = L(o.r); await m.say(r.startsWith('(') ? 'me' : (w === 'me' ? (m.other || m.giver || 'me') : w), o.r); }
          if (o.ok) { if (!m.mistakes) G.reward({ wisdom: 2 }, true); return i; } m.mistakes++; }
      },
      async npc(char, where, name, o = {}) { chk(); const p = self.at(where, o), pp = G.player.pos, n = await G.crowd.addStatic(char, p.x, p.z, Math.atan2(pp.x - p.x, pp.z - p.z), o.anim, name); m.npcs.push(n); return n; },
      obj(text) { self.objective = L(text); },
      async goto(where, text, o = {}) {
        chk(); const p = self.at(where, o), r = o.r || 5; m.obj(text); self.targets = [p]; let left = o.timer || 0; self.timer = left;
        await self.wait(dt => { if (o.timer) { left -= dt; self.timer = left; if (left <= 0) { left = o.timer; ui.toast(t('late')); } } const pp = G.player.pos; if (Math.hypot(pp.x - p.x, pp.z - p.z) > r) return false; if (o.keep && Math.hypot(o.keep.x - pp.x, o.keep.z - pp.z) > 16) { if (!self.warned || self.time - self.warned > 5) { ui.toast(t('waitFor')); self.warned = self.time; } return false; } return true; });
        self.targets = []; self.timer = 0; self.objective = '';
      },
      async meet(npcs, text, verb) {
        chk(); const list = Array.isArray(npcs) ? npcs : [npcs]; m.obj(text);
        const res = await self.wait(() => { const pp = G.player.pos, open = list.filter(n => !n.met); self.targets = open; if (G.player.vehicle && Math.abs(G.player.speed) > 1) return false; for (const n of open) if (Math.hypot(n.x - pp.x, n.z - pp.z) < 2.9) { self.prompt = verb ? L(verb) : t('talk'); if (G.input.take('KeyE')) return n; } return false; });
        if (Array.isArray(npcs)) m.last = res; else res.met = false; m.last = res; self.targets = []; self.objective = ''; self.prompt = null; if (G.player.vehicle) G.player.exit(); return res;
      },
      async collect(n, where, text, o = {}) {
        chk(); const c = self.at(where, o), items = [];
        for (let i = 0; i < n; i++) { const p = (o.spread || 10) <= 6 ? self.world.freeNear(c.x + (Math.random() - 0.5) * (o.spread || 3), c.z + (Math.random() - 0.5) * (o.spread || 3), 0.6) : self.world.roadPoint(c.x, c.z, (o.spread || 10) * 1.5); const it = makeItem(o.color || 0xf5c542); it.position.set(p.x, self.world.groundY(p.x, p.z), p.z); G.scene.add(it); items.push({ mesh: it, x: p.x, z: p.z }); }
        self.items = items; let got = 0; const base = L(text);
        await self.wait(() => { const pp = G.player.pos; self.objective = `${base} (${got}/${n})`; self.targets = items; for (let i = items.length - 1; i >= 0; i--) if (Math.hypot(items[i].x - pp.x, items[i].z - pp.z) < (G.player.vehicle ? 2.4 : 1.5)) { G.scene.remove(items[i].mesh); items.splice(i, 1); G.sfx('pick'); if (o.each) o.each(got); got++; } return items.length === 0; });
        self.items = []; self.targets = []; self.objective = '';
      },
      follow(npc, maxSpeed = 5.5) { npc.follow = true; npc.maxSpeed = maxSpeed; }, stay(npc) { npc.follow = false; npc.ch.root.visible = true; npc.ch.play('idle_neutral_01', 0.3); },
      async pray(fr, en, title) { chk(); if (G.player.vehicle) G.player.exit(); G.player.override = 'crouch_idle'; await ui.pray(S.lang === 'en' ? en : fr, title ? L(title) : null); G.player.override = null; G.reward({ faith: 3 }, true); chk(); },
      async read(id, intro) { chk(); await ui.read(VERSES[id], intro); chk(); },
      async memorize(id) { chk(); await ui.memorize(VERSES[id]); G.reward({ wisdom: 5 }, true); chk(); },
      async quiz(qs) { chk(); const s = await ui.quiz(qs); G.reward({ wisdom: s * 2 }, true); chk(); return s; },
      async ask(q) { chk(); return ui.ask(q); },
      async worship() { chk(); G.player.override = 'claphands_01'; for (const h of TXT.hymn) { ui.toast(L(h), true, 3200); await m.wait(3.2); } G.player.override = null; },
      wait(s) { let e = 0; return self.wait(dt => (e += dt) >= s); },
      toast(tx) { ui.toast(L(tx), true); }, toastBig(title, tx) { ui.toast(`${L(title)} — ${L(tx)}`, true, 6500); },
      anim(target, name) { if (target === 'player') G.player.override = name; else target.ch.play(name || target.base, 0.3); },
    });
    let ok = false;
    try { if (G.player.vehicle) G.player.exit(); await def.run(m); ok = true; } catch (e) { if (e !== CANCEL) { console.error(e); ui.toast('Erreur de mission : ' + (e.message || e)); } }
    for (const it of this.items) G.scene.remove(it.mesh); this.items = []; this.targets = []; this.objective = ''; this.prompt = null; this.timer = 0; G.player.override = null;
    for (const n of m.npcs) G.crowd.removeStatic(n); if (m.giver) G.crowd.removeStatic(m.giver);
    this.active = null; this.waiters = [];
    if (ok) await this.complete(def);
    if (!this.G.switching) await this.refresh();
  }

  async complete(def) {
    S.done[def.id] = 1; const r = def.reward || {}; this.G.reward(r, true); this.G.sfx('win');
    if (def.verse && !S.verses.includes(def.verse)) S.verses.push(def.verse);
    await ui.missionComplete(L(def.title), L(def.lesson), VERSES[def.verse], r);
    if (def.mode === 'walk' && WALK_MISSIONS.filter(x => x.grade === def.grade).every(x => S.done[x.id]) && S.grade < def.grade) {
      S.grade = def.grade; const un = Object.values(CITIES).filter(c => c.grade === def.grade && def.grade > 0).map(c => L(c.name));
      if (def.grade === 2) un.push(t('car')); if (def.grade === 4) un.push(t('wax')); if (def.grade === 7) un.push(t('crown'));
      S.talents += 50; this.G.sfx('grade'); await ui.gradeUp(GRADES[def.grade], un); this.G.onGrade();
    }
    save(); this.G.refreshHud();
  }

  update(dt) {
    this.time += dt; this.prompt = null;
    const ws = this.waiters.slice();
    for (const w of ws) { let r; try { r = w.check(dt); } catch (e) { r = false; } if (r) { const i = this.waiters.indexOf(w); if (i >= 0) this.waiters.splice(i, 1); w.resolve(r); } }
    const bob = Math.sin(this.time * 3) * 0.12;
    for (const o of this.offers) { o.marker.userData.dia.position.y = 2.5 + bob; o.marker.userData.dia.rotation.y += dt * 2; if (o.npc) o.marker.position.set(o.npc.x, 0, o.npc.z); }
    for (const it of this.items) { it.mesh.userData.box.position.y = 1 + bob; it.mesh.userData.box.rotation.y += dt * 2.5; }
  }
  dispose() { this.cancel(); this.clearOffers(); for (const it of this.items) this.G.scene.remove(it.mesh); this.items = []; }
}
