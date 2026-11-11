// Interface : dialogues, choix, quiz, prière, mémorisation, écrans de récompense.
import { S, L } from './state.js';

const $ = id => document.getElementById(id);
const STR = {
  continue: ['Continuer', 'Continue'], play: ['Jouer', 'Play'], newgame: ['Nouvelle partie', 'New game'],
  lang: ['Language: English', 'Langue : Français'], loading: ['Chargement…', 'Loading…'],
  sub: ['dans la Ville', 'in the City'],
  foot: ['Un jeu qui édifie. Marche avec Dieu, sers ton prochain, deviens une lumière dans la ville.', 'A game that builds you up. Walk with God, serve your neighbour, become a light in the city.'],
  choose: ['Ton personnage', 'Your character'], yourname: ['Ton prénom', 'Your first name'], top: ['Haut', 'Top'], bottom: ['Bas', 'Bottom'],
  start: ['Commencer', 'Start'], ok: ['Valider', 'Done'], amen: ['Amen', 'Amen'], next: ['Continuer', 'Continue'], close: ['Fermer', 'Close'],
  objective: ['Objectif', 'Objective'], talents: ['talents', 'talents'],
  correct: ['Bonne réponse !', 'Correct!'], wrong: ['Pas tout à fait…', 'Not quite…'],
  question: ['Question', 'Question'], memorize: ['Mémorise ce verset', 'Memorise this verse'],
  memo2: ['Complète le verset dans le bon ordre', 'Complete the verse in the right order'],
  missionDone: ['Mission accomplie', 'Mission complete'], lesson: ['Ce que tu retiens', 'What to remember'],
  newGrade: ['Nouveau grade', 'New rank'], reward: ['Récompenses', 'Rewards'],
  faith: ['Foi', 'Faith'], love: ['Amour', 'Love'], wisdom: ['Sagesse', 'Wisdom'],
  pray: ['Temps de prière', 'Time of prayer'], read: ['Lecture de la Parole', 'Reading the Word'],
  retry: ['Réessayer', 'Try again'], verseWon: ['Verset ajouté à ta Bible', 'Verse added to your Bible'],
  unlocked: ['Débloqué', 'Unlocked'],
};
export const T = k => L(STR[k]) || k;

export const ui = {
  busy: 0, _advance: null, touch: false,

  init() {
    $('dialog').addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') this.advance(); });
    this.refreshTexts();
  },
  refreshTexts() {
    document.documentElement.lang = S.lang;
    $('t-sub').textContent = T('sub'); $('btn-lang').textContent = T('lang'); $('menu-foot').textContent = T('foot');
    $('btn-new').textContent = T('newgame'); $('btn-continue').textContent = S.started ? T('continue') : T('play');
    $('btn-new').classList.toggle('hidden', !S.started);
    $('menu-verse').textContent = L(['« Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée. » — Matthieu 5:14', '"Ye are the light of the world. A city that is set on an hill cannot be hid." — Matthew 5:14']);
    $('cs-title').textContent = T('choose'); $('cs-lname').textContent = T('yourname'); $('cs-ltop').textContent = T('top'); $('cs-lbottom').textContent = T('bottom'); $('cs-ok').textContent = T('start');
    document.title = L(['Lumière dans la Ville', 'Light in the City']);
  },
  show(id, on = true) { $(id).classList.toggle('hidden', !on); },
  advance() { if (this._advance) { const f = this._advance; this._advance = null; f(); return true; } return false; },

  toast(text, gold = false, ms = 3800) {
    const d = document.createElement('div'); d.className = 'toast' + (gold ? ' gold' : ''); d.textContent = text; $('toasts').appendChild(d);
    while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
    setTimeout(() => d.remove(), ms);
  },
  setObjective(text, title) {
    const o = $('objective'); if (!text) { o.classList.add('hidden'); return; }
    o.classList.remove('hidden'); o.innerHTML = `<b></b><span></span>`; o.firstChild.textContent = title || T('objective'); o.lastChild.textContent = text;
  },
  setPrompt(text, key = 'E') {
    const p = $('prompt'); if (!text) { p.classList.add('hidden'); return; }
    p.classList.remove('hidden'); p.innerHTML = this.touch ? '' : `<kbd>${key}</kbd>`; p.appendChild(document.createTextNode(text));
  },
  fade(on) { $('fade').classList.toggle('on', on); return new Promise(r => setTimeout(r, 650)); },

  // --- Dialogues ---
  say(who, text) {
    this.busy++; this.show('dialog'); $('dlg-who').textContent = who || ''; $('dlg-choices').innerHTML = ''; $('dlg-next').classList.remove('hidden');
    const el = $('dlg-text'); el.textContent = '';
    return new Promise(res => {
      let i = 0, done = false; const full = text;
      const tick = setInterval(() => { i += 2; el.textContent = full.slice(0, i); if (i >= full.length) { clearInterval(tick); done = true; } }, 16);
      const adv = () => {
        if (!done) { clearInterval(tick); el.textContent = full; done = true; this._advance = adv; return; }
        this.busy--; this.show('dialog', false); res();
      };
      this._advance = adv;
    });
  },
  choose(who, prompt, options) {
    this.busy++; this.show('dialog'); $('dlg-who').textContent = who || ''; $('dlg-text').textContent = prompt; $('dlg-next').classList.add('hidden'); this._advance = null;
    const box = $('dlg-choices'); box.innerHTML = '';
    return new Promise(res => {
      options.forEach((o, i) => { const b = document.createElement('button'); b.textContent = o; b.onclick = () => { this.busy--; this.show('dialog', false); res(i); }; box.appendChild(b); });
    });
  },

  // --- Fenêtres ---
  openModal(html) { this.busy++; this.show('modal'); const box = $('modal-box'); box.innerHTML = html; box.scrollTop = 0; return box; },
  closeModal() { this.busy = Math.max(0, this.busy - 1); this.show('modal', false); $('modal-box').innerHTML = ''; },
  modal(html, buttons = [T('next')]) {
    const box = this.openModal(html + `<div class="opts" style="align-items:center" id="mb"></div>`);
    return new Promise(res => {
      buttons.forEach((t, i) => { const b = document.createElement('button'); b.className = 'big' + (i === 0 ? ' gold' : ''); b.textContent = t; b.style.minWidth = '200px'; b.style.textAlign = 'center'; b.onclick = () => { this.closeModal(); res(i); }; box.querySelector('#mb').appendChild(b); });
    });
  },
  scriptureHTML(v) { return `<div class="scripture">${esc(L(v.text))}<b>${esc(L(v.ref))}</b></div>`; },
  async read(v, intro) { await this.modal(`<h2>${T('read')}</h2>${intro ? `<p>${esc(intro)}</p>` : ''}${this.scriptureHTML(v)}`); },

  // Une question à choix : renvoie true si bonne réponse du premier coup
  ask(q, n, total) {
    const opts = q.o.map((t, i) => ({ t: L(t), ok: i === q.a }));
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[opts[i], opts[j]] = [opts[j], opts[i]]; }
    const box = this.openModal(`<h3>${T('question')}${total ? ` ${n}/${total}` : ''}</h3><p style="font-size:18px;font-weight:600">${esc(L(q.q))}</p><div class="opts"></div><p id="fb" style="min-height:1.5em;font-weight:700"></p>`);
    return new Promise(res => {
      let first = true;
      opts.forEach(o => { const b = document.createElement('button'); b.textContent = o.t; b.onclick = () => {
        if (o.ok) { b.classList.add('ok'); box.querySelector('#fb').textContent = T('correct') + (q.why ? ' ' + L(q.why) : ''); box.querySelectorAll('.opts button').forEach(x => x.disabled = true); setTimeout(() => { this.closeModal(); res(first); }, q.why ? 2600 : 1100); }
        else { b.classList.add('ko'); b.disabled = true; first = false; box.querySelector('#fb').textContent = T('wrong'); }
      }; box.querySelector('.opts').appendChild(b); });
    });
  },
  async quiz(questions) { let score = 0; for (let i = 0; i < questions.length; i++) if (await this.ask(questions[i], i + 1, questions.length)) score++; return score; },

  // Mémorisation : on lit le verset, puis on replace les mots manquants
  async memorize(v) {
    await this.modal(`<h2>${T('memorize')}</h2>${this.scriptureHTML(v)}`);
    const words = L(v.text).split(' '); const idx = [];
    const cand = words.map((w, i) => i).filter(i => words[i].replace(/[^\p{L}]/gu, '').length > 3);
    const n = Math.min(5, Math.max(2, Math.round(cand.length / 3)));
    while (idx.length < n && cand.length) idx.push(cand.splice(Math.random() * cand.length | 0, 1)[0]);
    idx.sort((a, b) => a - b);
    for (;;) {
      const ok = await new Promise(res => {
        let pos = 0, errors = 0;
        const html = words.map((w, i) => idx.includes(i) ? `<span class="blank" data-i="${i}">&nbsp;</span>` : esc(w)).join(' ');
        const box = this.openModal(`<h2>${T('memo2')}</h2><div class="scripture">${html}<b>${esc(L(v.ref))}</b></div><div class="chips"></div>`);
        const sh = idx.slice().sort(() => Math.random() - 0.5);
        sh.forEach(i => { const c = document.createElement('button'); c.className = 'chip'; c.textContent = words[i].replace(/[.,;:!?»«"]/g, ''); c.onclick = () => {
          const want = words[idx[pos]].replace(/[.,;:!?»«"]/g, '');
          if (c.textContent === want) { box.querySelector(`[data-i="${idx[pos]}"]`).textContent = words[idx[pos]]; c.classList.add('used'); pos++; if (pos >= idx.length) setTimeout(() => { this.closeModal(); res(errors <= 2); }, 900); }
          else { errors++; c.style.background = 'rgba(200,60,60,.5)'; setTimeout(() => c.style.background = '', 400); }
        }; box.querySelector('.chips').appendChild(c); });
      });
      if (ok) return true;
      this.toast(T('retry'));
    }
  },

  // Prière : les lignes apparaissent une à une, puis « Amen »
  pray(lines, title) {
    const box = this.openModal(`<h2>🙏 ${esc(title || T('pray'))}</h2><div class="prayer">${lines.map(l => `<span>${esc(l)} </span>`).join('')}</div><div class="opts" style="align-items:center"><button class="big gold" id="amen" style="min-width:200px;text-align:center;visibility:hidden">${T('amen')}</button></div>`);
    return new Promise(res => {
      const sp = box.querySelectorAll('.prayer span'); let i = 0;
      const t = setInterval(() => { if (i < sp.length) sp[i++].classList.add('show'); else { clearInterval(t); box.querySelector('#amen').style.visibility = 'visible'; } }, 1500);
      box.querySelector('.prayer').onclick = () => { while (i < sp.length) sp[i++].classList.add('show'); };
      box.querySelector('#amen').onclick = () => { clearInterval(t); this.closeModal(); res(); };
    });
  },

  rewardsHTML(r) {
    const a = [];
    if (r.faith) a.push(`<span style="color:#f5c542">✝ +${r.faith} ${T('faith')}</span>`);
    if (r.love) a.push(`<span style="color:#ef5b6b">♥ +${r.love} ${T('love')}</span>`);
    if (r.wisdom) a.push(`<span style="color:#5fb7f0">✦ +${r.wisdom} ${T('wisdom')}</span>`);
    if (r.talents) a.push(`<span>🪙 +${r.talents} ${T('talents')}</span>`);
    return `<div class="rewards">${a.join('')}</div>`;
  },
  missionComplete(title, lesson, verse, r) {
    return this.modal(`<h3>${T('missionDone')}</h3><h2>${esc(title)}</h2>${this.rewardsHTML(r)}${verse ? this.scriptureHTML(verse) : ''}<h3>${T('lesson')}</h3><p>${esc(lesson)}</p>`);
  },
  gradeUp(g, unlocks) {
    return this.modal(`<h3>${T('newGrade')}</h3><div class="badge">${g.icon}</div><h2>${esc(L(g.name))}</h2><p>${esc(L(g.desc))}</p><h3>${T('reward')}</h3><p><b style="color:#f5c542">${esc(L(g.badge))}</b></p>${unlocks.length ? `<p>${T('unlocked')} : ${unlocks.map(esc).join(' · ')}</p>` : ''}`);
  },

  hud(gradeName, gradeIcon) {
    const cap = v => Math.min(100, v) + '%';
    $('st-faith').style.width = cap(S.stats.faith / 3); $('st-love').style.width = cap(S.stats.love / 3); $('st-wisdom').style.width = cap(S.stats.wisdom / 3);
    $('talents').textContent = `🪙 ${S.talents} ${T('talents')}`; $('grade-name').textContent = gradeName; $('grade-icon').textContent = gradeIcon;
  },
};
export function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
