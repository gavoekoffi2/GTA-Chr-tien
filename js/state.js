// État global du jeu + sauvegarde locale.
const KEY = 'lumiere-dans-la-ville-v1';

const fresh = () => ({
  lang: 'fr', char: 'kofi', name: '', top: 0, bottom: 0,
  city: 'lome', mode: 'walk',
  stats: { faith: 0, love: 0, wisdom: 0 }, talents: 0,
  done: {}, verses: [], scrolls: {}, grade: 0, greeted: 0,
  settings: { quality: 'auto', sound: true },
  started: false,
});

export const S = fresh();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); Object.assign(S, fresh(), d); S.stats = Object.assign({ faith: 0, love: 0, wisdom: 0 }, d.stats); S.settings = Object.assign({ quality: 'auto', sound: true }, d.settings); }
  } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
}
export function reset() {
  const keep = { lang: S.lang, settings: S.settings };
  Object.assign(S, fresh(), keep);
  save();
}
// Texte bilingue : L(['français', 'english'])
export const L = a => (Array.isArray(a) ? a[S.lang === 'en' ? 1 : 0] : a);
