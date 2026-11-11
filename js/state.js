// État global du jeu + sauvegarde locale.
const KEY = 'lumiere-dans-la-ville-v1';

const fresh = () => ({
  v: 2, lang: 'fr', char: 'kofi', name: '', top: 0, bottom: 0,
  city: 'lome', mode: 'walk',
  stats: { faith: 0, love: 0, wisdom: 0 }, money: 2000, energy: 100,
  owned: { moto: false, car: false, helmet: false }, fuel: { moto: 4, car: 20 }, wardrobe: { t: [0], b: [0] },
  done: {}, verses: [], scrolls: {}, grade: 0, greeted: 0, jobs: 0, given: 0, radio: 0,
  settings: { quality: 'auto', sound: true, music: 'always' },
  started: false,
});

export const S = fresh();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw), f = fresh(); Object.assign(S, f, d);
      for (const k of ['stats', 'owned', 'fuel', 'wardrobe', 'settings']) S[k] = Object.assign(f[k], d[k]);
      if (d.v !== 2) { // sauvegarde de la première version : les talents deviennent des francs, on garde sa moto
        S.v = 2; S.money = (d.talents || 0) * 50 + 2000; S.owned.moto = !!d.started; S.owned.car = (d.grade || 0) >= 2;
        S.wardrobe = { t: [...new Set([0, d.top || 0])], b: [...new Set([0, d.bottom || 0])] };
      }
      delete S.talents;
    }
  } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
}
export function reset() {
  const keep = { lang: S.lang, settings: S.settings, radio: S.radio };
  Object.assign(S, fresh(), keep);
  save();
}
// Texte bilingue : L(['français', 'english'])
export const L = a => (Array.isArray(a) ? a[S.lang === 'en' ? 1 : 0] : a);
