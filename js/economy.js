// Économie de la ville : argent (F CFA), zémidjans et taxis, carburant, achats, petits boulots, offrandes.
import * as THREE from 'three';
import { S, L, save } from './state.js';
import { ui, esc } from './ui.js';
import { Vehicle, Nav } from './vehicles.js';
import { makeMarker, makeItem } from './npc.js';
import { CHARACTERS } from './characters.js';
import { audio } from './audio.js';

export const PRICE = { litre: 700, moto: 12000, car: 30000, helmet: 1500, meal: 300, alms: 100, top: 1000, wax: 3000, bottle: 50, call: 100,
  ticket: { lome: 3000, cotonou: 3000, accra: 4000, lagos: 6000, abidjan: 9000, paris: 25000, london: 25000 } };
export const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';
const r25 = n => Math.max(100, Math.round(n / 25) * 25), r50 = n => Math.max(100, Math.round(n / 50) * 50);
const T = {
  zem: ['Prendre un zémidjan', 'Take a moto-taxi'], taxi: ['Prendre un taxi', 'Take a taxi'], where: ['Où va-t-on ?', 'Where to?'], goal: ['🎯 Mon objectif en cours', '🎯 My current objective'],
  driver: ['Le conducteur', 'The driver'], ask: ['C’est {p}.', 'That will be {p}.'], ok: ['D’accord, on y va.', 'All right, let’s go.'], haggle: ['Chef, fais-moi {p}…', 'Boss, make it {p}…'], no: ['Non merci.', 'No thanks.'],
  hagOk: ['Bon… monte, c’est parce que c’est toi. {p}.', 'Fine… hop on, just for you. {p}.'], hagNo: ['Non oh, le carburant est cher ! {p}, dernier prix.', 'No way, fuel is expensive! {p}, last price.'],
  poor: ['Il te manque {p}. Ramasse des bouteilles ♻ ou fais un petit boulot 💼.', 'You are {p} short. Collect bottles ♻ or do a small job 💼.'],
  riding: ['En route vers {d}', 'On the way to {d}'], skip: ['Passer le trajet', 'Skip the ride'], arrived: ['Arrivé ! Tu paies {p}.', 'Here we are! You pay {p}.'], here: ['Tu es déjà tout près.', 'You are already close by.'],
  chat: [['On dit quoi ? La journée est bonne ?', 'How is it going? Good day so far?'], ['La route est gâtée par ici, accroche-toi !', 'The road is rough here, hold on tight!'], ['Dieu est grand, on se débrouille.', 'God is great, we get by.'], ['Avec ce soleil, il faut boire beaucoup d’eau.', 'With this sun, you must drink plenty of water.'], ['Tu vas à l’église, toi ? Ma femme y va chaque dimanche.', 'You go to church? My wife goes every Sunday.']],
  fuel: ['Faire le plein — {p}', 'Fill up — {p}'], fuelPart: ['Mettre {l} L — {p}', 'Add {l} L — {p}'], fueled: ['Réservoir rempli : −{p}', 'Tank filled: −{p}'], lowFuel: ['⛽ Presque plus d’essence ! Cherche une station-service.', '⛽ Almost out of fuel! Find a fuel station.'], dry: ['⛽ Panne sèche ! Tu pousses ton véhicule… Trouve une station.', '⛽ Out of fuel! You are pushing your vehicle… Find a station.'],
  dealer: ['Voir les véhicules à vendre', 'See vehicles for sale'], dealerT: ['Motos & autos d’occasion', 'Used bikes & cars'], buyMoto: ['Moto 125 d’occasion', 'Used 125 motorbike'], buyCar: ['Voiture d’occasion', 'Used car'], buyHelmet: ['Casque (prudence !)', 'Helmet (safety first!)'], owned: ['déjà à toi', 'already yours'], bought: ['Félicitations ! Prends-en soin.', 'Congratulations! Take good care of it.'], close: ['Fermer', 'Close'],
  offer: ['Donner une offrande', 'Give an offering'], offerT: ['Offrande', 'Offering'], offerD: ['« Que chacun donne comme il l’a résolu en son cœur, sans tristesse ni contrainte ; car Dieu aime celui qui donne avec joie. » — 2 Corinthiens 9:7', '"Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." — 2 Corinthians 9:7'], tithe: ['Un dixième', 'A tenth'], gave: ['Merci. Ton offrande aidera les veuves et les orphelins.', 'Thank you. Your offering will help widows and orphans.'],
  alms: ['Donner {p}', 'Give {p}'], beggar: ['Un nécessiteux', 'A man in need'], almsR: [['Que Dieu te le rende au centuple !', 'May God repay you a hundredfold!'], ['Merci… je n’avais rien mangé aujourd’hui.', 'Thank you… I had eaten nothing today.']], almsV: ['« Celui qui a pitié du pauvre prête à l’Éternel. » — Proverbes 19:17', '"He that hath pity upon the poor lendeth unto the LORD." — Proverbs 19:17'],
  meal: ['Acheter un repas — {p}', 'Buy a meal — {p}'], cook: ['Maman Afi', 'Mama Afi'], mealR: ['Riz, haricots et poisson ! Bon appétit, mon enfant.', 'Rice, beans and fish! Enjoy your meal, my child.'], grace: ['« Merci, Seigneur, pour ce repas. » Tu as repris des forces !', '"Thank you, Lord, for this meal." Your strength is back!'], hungry: ['Tu as faim : tu cours moins vite. Va manger au marché 🍲.', 'You are hungry: you run slower. Go and eat at the market 🍲.'],
  job: ['Petit boulot : 3 livraisons', 'Small job: 3 deliveries'], boss: ['Maman Akossiwa', 'Mama Akossiwa'], jobGo: ['Porte ces 3 colis à mes clients. Fais vite, et sois poli !', 'Take these 3 parcels to my customers. Be quick, and be polite!'], deliv: ['Livre le colis ({i}/3)', 'Deliver the parcel ({i}/3)'], delivOk: ['Colis livré ! +{p}', 'Parcel delivered! +{p}'], jobDone: ['Bon travail ! « Tout ce que vous faites, faites-le de bon cœur. »', 'Good work! "Whatsoever ye do, do it heartily."'],
  zemJob: ['Zémidjan : cherche un client', 'Moto-taxi: find a customer'], zemT: ['Travail de zémidjan', 'Moto-taxi work'], taxiT: ['Travail de taxi', 'Taxi work'], pick: ['Prends le client qui te fait signe', 'Pick up the customer waving at you'], carry: ['Dépose ton client : {d}', 'Drop your customer: {d}'], please: ['{d}, s’il te plaît !', '{d}, please!'],
  paid: ['Course terminée : +{p}', 'Ride complete: +{p}'], tip: [' (dont {p} de pourboire pour ta prudence)', ' (including a {p} tip for careful driving)'], jobStop: ['Tu arrêtes le travail. Gain de la journée : {p}.', 'You stop working. Earned today: {p}.'], needVeh: ['Monte d’abord sur ta moto ou dans ta voiture.', 'Get on your motorbike or into your car first.'],
  client: ['Un client', 'A customer'], over: ['Le client te tend {a} au lieu de {b}, sans s’en rendre compte.', 'The customer hands you {a} instead of {b}, without noticing.'], giveBack: ['Lui rendre la différence', 'Give back the difference'], keep: ['Tout garder', 'Keep it all'], backR: ['Eh ! Tu es honnête, toi. Que Dieu te bénisse !', 'Eh! You are an honest one. God bless you!'], keepR: ['(Non… cet argent n’est pas à moi. « Celui qui est fidèle dans les moindres choses l’est aussi dans les grandes. »)', '(No… this money is not mine. "He that is faithful in that which is least is faithful also in much.")'],
  bottle: ['♻ Bouteilles recyclées : +{p}', '♻ Bottles recycled: +{p}'], called: ['Un zémidjan arrive près de toi.', 'A moto-taxi is coming to you.'],
  dest: { church: ['Église', 'Church'], market: ['Marché', 'Market'], station: ['Gare', 'Station'], hospital: ['Hôpital', 'Hospital'], school: ['École', 'School'], park: ['Jardin', 'Garden'], stadium: ['Stade', 'Stadium'], beach: ['Bord de l’eau', 'Waterfront'], home: ['Ma maison', 'My home'], landmark: ['Monument', 'Landmark'], orphanage: ['Orphelinat', 'Orphanage'], prison: ['Prison', 'Prison'], fuel: ['Station-service', 'Fuel station'], dealer: ['Vente de motos', 'Bike dealer'] },
};
const t = (k, o = {}) => { let s = L(T[k]); for (const key in o) s = s.replace('{' + key + '}', o[key]); return s; };
const D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class Economy {
  constructor(G) { this.G = G; this.units = []; this.inter = []; this.bottles = []; this.ride = null; this.job = null; this.targets = []; this.time = 0; this.tick = 0; this.warn = {}; this.stands = []; this.ranks = []; }
  get world() { return this.G.world; }
  earn(n, quiet) { S.money += Math.round(n); if (!quiet) audio.sfx('coin'); this.G.refreshHud(); }
  pay(n) { if (S.money < n) { audio.sfx('deny'); ui.toast(t('poor', { p: fmt(n - S.money) })); return false; } S.money -= Math.round(n); audio.sfx('pay'); this.G.refreshHud(); return true; }

  async setup() {
    const G = this.G, w = this.world, q = G.quality; this.nav = new Nav(w); this.dead = false;
    const keys = ['church', 'market', 'station', 'hospital', 'school', 'park', 'stadium', 'home', 'landmark', 'orphanage', 'prison', 'beach'];
    for (const k of keys) { const p = w.pois[k]; if (!p) continue; this.stands.push(Object.assign(w.roadside(p.x, p.z, 4), { poi: k })); if (['station', 'market', 'landmark', 'hospital', 'church'].includes(k)) this.ranks.push(Object.assign(w.roadside(p.x, p.z, -9), { poi: k })); }
    const men = Object.keys(CHARACTERS).filter(k => CHARACTERS[k].g === 'm' && k !== 'enfant');
    for (let i = 0; i < (q === 'low' ? 2 : 3); i++) { const v = new Vehicle('moto', [0xb3261e, 0x1f4f9a, 0x1d6b3f][i], G.scene); v.addRider(men[(i * 3 + 1) % men.length], 0, w.id === 'cotonou' ? 5 : 0); this.units.push({ v, kind: 'zem', stand: null, busy: false }); }
    for (let i = 0; i < (q === 'low' ? 1 : 2); i++) { const v = new Vehicle('taxi', w.cfg.taxi, G.scene, { driver: true, darkBumper: true, rhd: !!w.cfg.left, plate: i }); this.units.push({ v, kind: 'taxi', stand: null, busy: false }); }
    this.assign(true);
    // points d'intérêt de la vie quotidienne
    for (const u of this.units) this.inter.push({ unit: u, r: u.kind === 'zem' ? 3 : 3.8, get x() { return u.v.pos.x; }, get z() { return u.v.pos.z; }, prompt: () => (u.busy || G.player.vehicle ? null : t(u.kind)), act: () => this.rideMenu(u) });
    for (const f of w.fuelStations) this.inter.push({ x: f.x, z: f.z, r: 11, icon: '⛽', prompt: () => this.fuelPrompt(), act: () => this.refuel(), any: true });
    const dl = w.pois.dealer; if (dl) this.inter.push({ x: dl.x, z: dl.z, r: 5, icon: '🏍', prompt: () => t('dealer'), act: () => this.dealerMenu() });
    const ch = w.pois.church, of = w.freeNear(ch.x + Math.cos(ch.face) * 6, ch.z - Math.sin(ch.face) * 6, 0.8); this.offerSpot = of;
    const mk = makeMarker(0xffffff, false); mk.position.set(of.x, 0, of.z); mk.userData.dia.position.y = 1.5; G.scene.add(mk); this.offerMarker = mk;
    this.inter.push({ x: of.x, z: of.z, r: 2.6, prompt: () => t('offer'), act: () => this.offering() });
    const m = w.pois.market, add = async (id, base, name, anim, dist) => { const p = w.roadPoint(base.x, base.z, dist); const n = await G.crowd.addStatic(id, p.x, p.z, Math.random() * 6.28, anim, name); if (this.dead) { G.crowd.removeStatic(n); return null; } return n; };
    add('esi', m, T.cook, 'idle_look_around_01', 28).then(n => n && this.inter.push({ x: n.x, z: n.z, r: 3, icon: '🍲', prompt: () => t('meal', { p: fmt(PRICE.meal) }), act: () => this.meal(n) }));
    add('ama', m, T.boss, 'idle_neutral_01', 45).then(n => n && this.inter.push({ x: n.x, z: n.z, r: 3, icon: '💼', prompt: () => (this.job || G.missions.active ? null : t('job')), act: () => this.startDelivery(n) }));
    for (const [k, id] of [['market', 'yao'], ['station', 'kodjo']]) add(id, w.pois[k], T.beggar, 'crouch_idle', 34).then(n => { if (!n) return; n.cool = 0; this.inter.push({ x: n.x, z: n.z, r: 2.8, prompt: () => t('alms', { p: fmt(PRICE.alms) }), act: () => this.alms(n) }); });
    for (let i = 0; i < 14; i++) this.bottles.push(this.newBottle());
  }
  newBottle() { const w = this.world, c = this.G.player.pos, a = Math.random() * 6.283, d = 60 + Math.random() * 480, p = w.roadPoint(c.x + Math.cos(a) * d, c.z + Math.sin(a) * d, 60), m = makeItem(0x3fae6a); m.scale.setScalar(0.7); m.position.set(p.x, w.groundY(p.x, p.z), p.z); this.G.scene.add(m); return { mesh: m, x: p.x, z: p.z }; }
  dispose() { this.dead = true; const sc = this.G.scene; for (const u of this.units) u.v.dispose(); for (const b of this.bottles) sc.remove(b.mesh); if (this.offerMarker) sc.remove(this.offerMarker); this.endJob(true); this.units = []; this.bottles = []; this.inter = []; this.ride = null; }
  vehicles() { return this.units.map(u => u.v); }
  obstacles() { return this.units.map(u => ({ x: u.v.pos.x, z: u.v.pos.z, r: u.v.radius, ref: u.v })); }

  // place les zémidjans et taxis libres aux stations les plus proches du joueur
  assign(force) {
    const pp = this.G.player.pos;
    for (const kind of ['zem', 'taxi']) {
      const list = (kind === 'zem' ? this.stands : this.ranks).slice().sort((a, b) => D(a, pp) - D(b, pp)), units = this.units.filter(u => u.kind === kind && !u.busy); let k = 0;
      const taken = new Set(units.filter(u => u.stand && D(u.v.pos, pp) < 110 && !force).map(u => u.stand));
      for (const u of units) { if (taken.has(u.stand)) continue; while (k < list.length && taken.has(list[k])) k++; if (k >= list.length) break; const st = list[k++]; taken.add(st); u.stand = st; u.v.place(st.x, st.z, st.h); u.v.pos.y = this.world.groundY(st.x, st.z); }
    }
  }

  // ---------- trajets en zémidjan ou en taxi ----------
  destinations() {
    const w = this.world, pp = this.G.player.pos, out = [], g = this.G.currentGoal && this.G.currentGoal();
    if (g && g.x !== undefined && D(g, pp) > 60) out.push({ label: t('goal'), x: g.x, z: g.z });
    for (const k in T.dest) { let p = w.pois[k]; if (k === 'fuel') { p = w.fuelStations.slice().sort((a, b) => D(a, pp) - D(b, pp))[0]; } if (!p) continue; const name = k === 'landmark' ? L(w.cfg.landmark) : (p.name && !['home', 'orphanage', 'park', 'prison'].includes(k) ? p.name : L(T.dest[k])); if (D(p, pp) > 60) out.push({ label: name, x: p.x, z: p.z }); }
    return out;
  }
  quote(kind, dest) { const w = this.world, pp = this.G.player.pos, a = w.nearestMain(pp.x, pp.z), b = w.nearestMain(dest.x, dest.z), path = a === b ? null : w.findPath(a, b), len = path ? w.pathLength(path) : D(pp, dest) * 1.3; return { path, len, fair: r50(kind === 'taxi' ? 200 + len * 0.8 : 100 + len * 0.45) }; }
  rideMenu(u) {
    const list = this.destinations().map(d => Object.assign(d, this.quote(u.kind, d)));
    const rows = list.map((d, i) => `<button data-i="${i}"><b>${esc(d.label)}</b><br><small>${Math.round(d.len)} m · ≈ ${fmt(d.fair)}</small></button>`).join('');
    const box = ui.openModal(`<h2>${u.kind === 'zem' ? '🏍' : '🚕'} ${t('where')}</h2><div class="opts">${rows}</div><div class="opts" style="align-items:center"><button class="big" id="rm-x" style="min-width:200px;text-align:center">${t('close')}</button></div>`);
    box.querySelector('#rm-x').onclick = () => ui.closeModal();
    box.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { ui.closeModal(); this.bargain(u, list[+b.dataset.i]); });
  }
  async bargain(u, d) {
    const ask = r50(d.fair * 1.25); let price = ask;
    const c = await ui.choose(t('driver'), `${d.label} ? ${t('ask', { p: fmt(ask) })}`, [t('ok'), t('haggle', { p: fmt(d.fair) }), t('no')]);
    if (c === 2) return;
    if (c === 1) { if (Math.random() < 0.6) { price = d.fair; await ui.say(t('driver'), t('hagOk', { p: fmt(price) })); } else { price = r50((ask + d.fair) / 2); const c2 = await ui.choose(t('driver'), t('hagNo', { p: fmt(price) }), [t('ok'), t('no')]); if (c2 === 1) return; } }
    if (S.money < price) { audio.sfx('deny'); ui.toast(t('poor', { p: fmt(price - S.money) })); return; }
    this.startRide(u, d, price);
  }
  startRide(u, d, fare) {
    const G = this.G, v = u.v; if (G.player.vehicle) G.player.exit(); u.busy = true; G.player.enter(v, true);
    if (d.path && d.path.length > 1) this.nav.route(v, d.path);
    this.ride = { unit: u, dest: d, fare, t: 0, said: 0 };
  }
  async endRide(skip) {
    const r = this.ride; if (!r || r.ending) return; r.ending = true; const G = this.G, v = r.unit.v;
    if (skip && r.dest.path && r.dest.path.length > 1) { await ui.fade(true); const p = r.dest.path, n = p.length; this.nav.start(v, p[n - 2], p[n - 1]); v.ai.t = v.ai.len; const q = this.nav.point(v.ai, v.isMoto); v.pos.set(q.x, 0, q.z); v.speed = 0; }
    else if (skip) { await ui.fade(true); const f = this.world.roadside(r.dest.x, r.dest.z, 2); v.place(f.x, f.z, f.h); }
    G.player.exit(); G.player.first = true; if (skip) await ui.fade(false);
    S.money = Math.max(0, S.money - r.fare); audio.sfx('pay'); G.refreshHud(); ui.toast(t('arrived', { p: fmt(r.fare) }));
    r.unit.busy = false; r.unit.stand = { x: v.pos.x, z: v.pos.z, h: v.heading, temp: true }; v.ai = null; v.speed = 0; this.ride = null; save();
  }

  // ---------- carburant ----------
  myVehicle() { const G = this.G, pl = G.player; if (pl.vehicle && pl.vehicle.owned) return pl.vehicle; let best = null, bd = 8; for (const v of G.vehicles) { const d = D(v.pos, pl.pos); if (d < bd) { bd = d; best = v; } } return best; }
  fuelPrompt() { const v = this.myVehicle(); if (!v) return null; const need = v.tank - v.fuel; if (need < 0.15) return null; const cost = r25(need * PRICE.litre); if (S.money >= cost) return t('fuel', { p: fmt(cost) }); const l = Math.floor(S.money / PRICE.litre * 10) / 10; return l >= 0.2 ? t('fuelPart', { l, p: fmt(Math.round(l * PRICE.litre)) }) : t('fuel', { p: fmt(cost) }); }
  refuel() { const v = this.myVehicle(); if (!v) return; const need = v.tank - v.fuel, cost = r25(need * PRICE.litre); if (S.money >= cost) { S.money -= cost; v.fuel = v.tank; ui.toast(t('fueled', { p: fmt(cost) }), true); } else { const l = Math.floor(S.money / PRICE.litre * 10) / 10; if (l < 0.2) { this.pay(cost); return; } const c = Math.round(l * PRICE.litre); S.money -= c; v.fuel += l; ui.toast(t('fueled', { p: fmt(c) }), true); } audio.sfx('pay'); this.warn = {}; this.sync(); this.G.refreshHud(); save(); }
  sync() { for (const v of this.G.vehicles) S.fuel[v.isMoto ? 'moto' : 'car'] = Math.round(v.fuel * 100) / 100; }

  // ---------- achats ----------
  dealerMenu() {
    const G = this.G, row = (id, label, price, own) => `<button data-b="${id}" ${own ? 'disabled style="opacity:.5"' : ''}><b>${label}</b><br><small>${own ? t('owned') : fmt(price)}</small></button>`;
    const box = ui.openModal(`<h2>🏍 ${t('dealerT')}</h2><p style="opacity:.8">${fmt(S.money)}</p><div class="opts">${row('moto', t('buyMoto'), PRICE.moto, S.owned.moto)}${row('car', t('buyCar'), PRICE.car, S.owned.car)}${row('helmet', t('buyHelmet'), PRICE.helmet, S.owned.helmet)}</div><div class="opts" style="align-items:center"><button class="big" id="dl-x" style="min-width:200px;text-align:center">${t('close')}</button></div>`);
    box.querySelector('#dl-x').onclick = () => ui.closeModal();
    box.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const k = b.dataset.b; if (!this.pay(PRICE[k])) return; S.owned[k] = true; ui.closeModal(); ui.toast(t('bought'), true); audio.sfx('win'); if (k === 'moto') G.spawnOwn('moto'); else if (k === 'car') G.spawnOwn('sedan'); else G.reward({ wisdom: 3 }, true); save(); });
  }
  offering() {
    const tenth = r25(S.money / 10), amounts = [...new Set([tenth, 500, 1000, 2500])].filter(a => a >= 100 && a <= S.money);
    const box = ui.openModal(`<h2>🙏 ${t('offerT')}</h2><div class="scripture">${esc(t('offerD'))}</div><p style="opacity:.8">${fmt(S.money)}</p><div class="opts">${amounts.map(a => `<button data-a="${a}"><b>${fmt(a)}</b>${a === tenth ? ' — ' + t('tithe') : ''}</button>`).join('')}</div><div class="opts" style="align-items:center"><button class="big" id="of-x" style="min-width:200px;text-align:center">${t('close')}</button></div>`);
    box.querySelector('#of-x').onclick = () => ui.closeModal();
    box.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = +b.dataset.a; if (!this.pay(a)) return; S.given = (S.given || 0) + a; ui.closeModal(); const fresh = this.time - (this.lastGift || -999) > 120; this.lastGift = this.time; this.G.reward(fresh ? { faith: Math.max(2, Math.min(12, Math.round(a / 250))), love: 2 } : { love: 1 }, true); ui.toast(t('gave'), true); save(); });
  }
  async alms(n) { if (!this.pay(PRICE.alms)) return; S.given = (S.given || 0) + PRICE.alms; const fresh = this.time - (n.cool || -999) > 90; n.cool = this.time; if (fresh) this.G.reward({ love: 2 }, true); n.ch.root.rotation.y = Math.atan2(this.G.player.pos.x - n.x, this.G.player.pos.z - n.z); await ui.say(t('beggar'), L(T.almsR[Math.random() * 2 | 0])); if (!this.almsVerse) { this.almsVerse = true; ui.toast(t('almsV'), true, 6000); } save(); }
  async meal(n) { if (S.energy > 92) { ui.toast(t('mealR')); return; } if (!this.pay(PRICE.meal)) return; await ui.say(t('cook'), t('mealR')); S.energy = 100; this.warn.hungry = false; ui.toast(t('grace'), true); this.G.reward({ faith: 1 }, true); save(); }

  // ---------- petits boulots ----------
  startDelivery(n) {
    const w = this.world; ui.say(t('boss'), t('jobGo'));
    const pts = []; for (let i = 0; i < 3; i++) { const a = Math.random() * 6.283, d = 110 + Math.random() * 190; pts.push(w.roadPoint(n.x + Math.cos(a) * d, n.z + Math.sin(a) * d, 40)); }
    this.job = { kind: 'deliv', pts, i: 0, earned: 0, mark: makeMarker(0x7dd87d) }; this.G.scene.add(this.job.mark); this.targets = [pts[0]];
  }
  canDrive() { const pl = this.G.player; return pl.vehicle && pl.vehicle.owned && !pl.passenger; }
  toggleZemJob() {
    if (this.job) { this.endJob(); return; } if (this.G.missions.active || this.ride) return;
    if (!this.canDrive()) { ui.toast(t('needVeh')); return; }
    this.job = { kind: 'zem', state: 'wait', earned: 0, n: 0, mark: makeMarker(0x7dd87d) }; this.G.scene.add(this.job.mark); this.nextCustomer();
  }
  async nextCustomer() {
    const j = this.job, w = this.world, G = this.G, pp = G.player.pos; if (!j) return; j.state = 'wait'; this.targets = [];
    let ids = w.nodesNear(pp.x, pp.z, 300).filter(i => w.comp[i] === w.mainComp && D(w.nodes[i], pp) > 110); if (!ids.length) ids = [w.nearestMain(pp.x + 150, pp.z + 60)];
    const nd = w.nodes[ids[Math.random() * ids.length | 0]], p = w.roadside(nd.x, nd.z, 0, -1.4), people = Object.keys(CHARACTERS).filter(k => k !== 'enfant');
    const c = await G.crowd.addStatic(people[Math.random() * people.length | 0], p.x, p.z, p.h + Math.PI / 2, 'wave_01', T.client);
    if (this.job !== j) { G.crowd.removeStatic(c); return; } j.cust = c; j.state = 'seek'; this.targets = [c];
  }
  endJob(silent) {
    const j = this.job; if (!j) return; const G = this.G; this.job = null; this.targets = []; G.scene.remove(j.mark);
    if (j.cust) { if (j.state === 'carry') { j.cust.ch.pose = null; G.scene.add(j.cust.ch.root); j.cust.ch.dispose(); } else G.crowd.removeStatic(j.cust); }
    if (!silent && j.kind === 'zem') ui.toast(t('jobStop', { p: fmt(j.earned) }), true); save();
  }
  async updateJob(dt) {
    const j = this.job, G = this.G, pl = G.player, pp = pl.pos, w = this.world; if (!j) return;
    const tg = this.targets[0]; if (tg) { j.mark.visible = true; j.mark.position.set(tg.x, 0, tg.z); j.mark.userData.dia.rotation.y += dt * 2; } else j.mark.visible = false;
    if (j.kind === 'deliv') { const p = j.pts[j.i]; if (D(p, pp) < 3.2 && Math.abs(pl.speed) < 6) { j.i++; this.earn(250); ui.toast(t('delivOk', { p: fmt(250) }), true); if (j.i >= 3) { this.job = null; this.targets = []; G.scene.remove(j.mark); G.reward({ love: 2 }, true); ui.toast(t('jobDone'), true, 5000); S.jobs = (S.jobs || 0) + 1; save(); } else this.targets = [j.pts[j.i]]; } return; }
    if (!this.canDrive()) { this.endJob(); return; } const v = pl.vehicle;
    if (j.state === 'seek' && D(j.cust, pp) < 5.5 && Math.abs(v.speed) < 1.3) {
      const c = j.cust, i = G.crowd.statics.indexOf(c); if (i >= 0) G.crowd.statics.splice(i, 1); v.seat(c.ch, 1, false);
      const opts = this.destinations().filter(d => D(d, pp) > 250 && d.label !== t('goal')), d = opts[Math.random() * opts.length | 0] || { label: '…', x: pp.x + 300, z: pp.z };
      const q = this.quote('zem', d); j.dest = d; j.len = q.len; j.bumps = 0; j.state = 'carry'; v.bumped = false; this.targets = [d]; ui.toast(`« ${t('please', { d: d.label })} »`, false, 4500);
    } else if (j.state === 'carry') {
      if (v.bumped) { j.bumps++; v.bumped = false; } if (pl.pedBrake && !j.pb) { j.bumps++; j.pb = true; } else if (!pl.pedBrake) j.pb = false;
      if (D(j.dest, pp) < 9 && Math.abs(v.speed) < 1.3) {
        const c = j.cust; j.cust = null; c.ch.pose = null; G.scene.add(c.ch.root); const f = w.freeNear(v.pos.x + Math.cos(v.heading) * 1.4, v.pos.z - Math.sin(v.heading) * 1.4, 0.4); c.ch.root.position.set(f.x, w.groundY(f.x, f.z), f.z); c.ch.root.rotation.set(0, Math.atan2(v.pos.x - f.x, v.pos.z - f.z), 0); c.ch.currentName = null; c.ch.play('wave_01', 0.2); setTimeout(() => c.ch.dispose(), 5000);
        const fare = r25((v.isMoto ? 150 : 300) + j.len * (v.isMoto ? 0.55 : 0.9)), tip = j.bumps === 0 ? r25(fare * 0.15) : 0; j.state = 'wait'; this.targets = [];
        if (Math.random() < 0.14) { const extra = fare * 10; const k = await ui.choose(t('client'), t('over', { a: fmt(extra), b: fmt(fare) }), [t('giveBack'), t('keep')]); if (k === 0) { await ui.say(t('client'), t('backR')); G.reward({ love: 3, faith: 2 }, true); } else await ui.say(S.name || '…', t('keepR')); }
        this.earn(fare + tip); j.earned += fare + tip; j.n++; S.jobs = (S.jobs || 0) + 1; ui.toast(t('paid', { p: fmt(fare + tip) }) + (tip ? t('tip', { p: fmt(tip) }) : ''), true, 4500); save();
        if (this.job === j) this.nextCustomer();
      }
    }
  }

  callZem() { const u = this.units.find(q => q.kind === 'zem' && !q.busy); if (!u || this.ride) return; if (!this.pay(PRICE.call)) return; const pp = this.G.player.pos, s = this.world.roadside(pp.x, pp.z, 3); u.stand = { x: s.x, z: s.z, h: s.h, temp: true }; u.v.place(s.x, s.z, s.h); ui.toast(t('called'), true); }

  // objectif affiché pendant un trajet ou un boulot
  status() {
    if (this.ride) return { title: this.ride.unit.kind === 'zem' ? L(['Zémidjan', 'Moto-taxi']) : 'Taxi', text: t('riding', { d: this.ride.dest.label }), x: this.ride.dest.x, z: this.ride.dest.z };
    const j = this.job; if (!j) return null;
    if (j.kind === 'deliv') return { title: L(['Petit boulot', 'Small job']), text: t('deliv', { i: j.i + 1 }), x: j.pts[j.i].x, z: j.pts[j.i].z };
    const title = (this.G.player.vehicle && !this.G.player.vehicle.isMoto ? t('taxiT') : t('zemT')) + ` · ${fmt(j.earned)}`;
    if (j.state === 'carry') return { title, text: t('carry', { d: j.dest.label }), x: j.dest.x, z: j.dest.z };
    return j.cust ? { title, text: t('pick'), x: j.cust.x, z: j.cust.z } : { title, text: '…' };
  }
  // renvoie l'action possible près du joueur
  nearby() {
    const pl = this.G.player, pp = pl.pos; if (this.ride) return { prompt: t('skip'), act: () => this.endRide(true) };
    let best = null, bd = 1e9; for (const it of this.inter) { if (pl.vehicle && !it.any) continue; const d = D(it, pp); if (d < it.r && d < bd) { const p = it.prompt(); if (p) { bd = d; best = { prompt: p, act: it.act }; } } }
    return best;
  }
  mapIcons() { const out = []; for (const u of this.units) if (!u.busy) out.push({ x: u.v.pos.x, z: u.v.pos.z, ch: u.kind === 'zem' ? '🏍' : '🚕' }); for (const it of this.inter) if (it.icon) out.push({ x: it.x, z: it.z, ch: it.icon }); return out; }

  update(dt, obstacles) {
    const G = this.G, pl = G.player, pp = pl.pos; this.time += dt; this.tick -= dt;
    if (this.tick <= 0) { this.tick = 2; this.assign(false); this.sync(); }
    for (const u of this.units) for (const r of u.v.riders) r.root.visible = D(u.v.pos, pp) < 170;
    if (this.ride && !this.ride.ending) { const r = this.ride, v = r.unit.v; r.t += dt; const has = r.dest.path && r.dest.path.length > 1, done = has ? this.nav.step(v, dt, obstacles, r.unit.kind === 'taxi' ? 12.5 : 10.5) : true;
      if (r.t > 5 + r.said * 16 && r.said < 3) { ui.toast(`« ${L(T.chat[(r.said * 2 + (this.time | 0)) % T.chat.length])} »`, false, 4200); r.said++; }
      if (done) this.endRide(!has); }
    if (this.job) this.updateJob(dt);
    if (this.offerMarker) this.offerMarker.userData.dia.rotation.y += dt * 2;
    // bouteilles à recycler
    for (let i = 0; i < this.bottles.length; i++) { const b = this.bottles[i]; b.mesh.userData.box.rotation.y += dt * 2; const d = D(b, pp); if (d < 1.6 && !pl.vehicle) { G.scene.remove(b.mesh); this.earn(PRICE.bottle); ui.toast(t('bottle', { p: fmt(PRICE.bottle) }), false, 1800); this.bottles[i] = this.newBottle(); } else if (d > 700) { G.scene.remove(b.mesh); this.bottles[i] = this.newBottle(); } }
    // énergie : on se fatigue en courant, il faut manger
    S.energy = Math.max(0, S.energy - dt * (0.015 + (pl.running ? 0.06 : 0))); pl.energy = S.energy;
    if (S.energy < 6 && !this.warn.hungry) { this.warn.hungry = true; ui.toast(t('hungry'), false, 6000); }
    const v = pl.vehicle; if (v && v.owned) { const f = v.fuel / v.tank; if (f <= 0 && !this.warn.dry) { this.warn.dry = true; audio.sfx('deny'); ui.toast(t('dry'), false, 7000); } else if (f < 0.15 && f > 0 && !this.warn.low) { this.warn.low = true; ui.toast(t('lowFuel'), false, 5000); } }
  }
}
