// Villes réelles : le plan (rues, bâtiments, côte) vient d'OpenStreetMap © les contributeurs d'OpenStreetMap (ODbL).
import * as THREE from 'three';
import { S, L } from './state.js';

export const WIDTH = [14, 11, 9, 7, 4.5, 2.5];
export const CITIES = {
  lome: { name: 'Lomé', country: ['Togo', 'Togo'], water: 'ocean', ground: 'laterite', tree: 'palm', en: false,
    walls: ['#e2c48c', '#d2a070', '#eadfc0', '#b9c9ae', '#dba882', '#b8c6d2', '#c9805a'], taxi: 0xf2c200, motos: 6, grade: 0, landmark: ["Monument de l'Indépendance", 'Independence Monument'] },
  cotonou: { name: 'Cotonou', country: ['Bénin', 'Benin'], water: 'ocean', ground: 'laterite', tree: 'palm', en: false,
    walls: ['#f0dcb0', '#e8c79a', '#d6e2d0', '#f3ead8', '#e0b99a'], taxi: 0xf2c200, motos: 8, grade: 2, landmark: ["Place de l'Étoile Rouge", 'Red Star Square'] },
  accra: { name: 'Accra', country: ['Ghana', 'Ghana'], water: 'ocean', ground: 'laterite', tree: 'palm', en: true,
    walls: ['#f2e3c3', '#e2c9a3', '#d3dbe6', '#efd9c9', '#cfe0cf'], taxi: 0xf28c00, motos: 3, grade: 3, landmark: ["Place de l'Indépendance", 'Independence Square'] },
  abidjan: { name: 'Abidjan', country: ["Côte d'Ivoire", "Côte d'Ivoire"], water: 'lagoon', ground: 'concrete', tree: 'palm', en: false,
    walls: ['#f4efe4', '#dfe5ea', '#e9d6b8', '#d9c7b0', '#e6e0d2'], taxi: 0xe8641b, motos: 2, grade: 4, landmark: ['Cathédrale Saint-Paul', "St Paul's Cathedral"] },
  lagos: { name: 'Lagos', country: ['Nigeria', 'Nigeria'], water: 'lagoon', ground: 'concrete', tree: 'palm', en: true,
    walls: ['#efe6d2', '#d8d2c4', '#e4cfae', '#cdd9e2', '#e9ddc9'], taxi: 0xf2c200, motos: 5, grade: 5, landmark: ['Place Tinubu', 'Tinubu Square'] },
  paris: { name: 'Paris', country: ['France', 'France'], water: 'river', ground: 'concrete', tree: 'leaf', en: false, style: 'haussmann',
    walls: ['#e9e0cc', '#e2d8c2', '#ece5d5', '#ddd2bb'], taxi: 0x202020, motos: 1, grade: 6, landmark: ['Tour Eiffel', 'Eiffel Tower'] },
  london: { name: ['Londres', 'London'], country: ['Royaume-Uni', 'United Kingdom'], water: 'river', ground: 'concrete', tree: 'leaf', en: true, style: 'brick', left: true,
    walls: ['#b9a48c', '#a8927a', '#c9b79e', '#9c8a78'], taxi: 0x111111, motos: 1, grade: 6, landmark: ['Big Ben', 'Big Ben'] },
};

export function rng32(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const texLoader = new THREE.TextureLoader();
const texCache = {};
function ptex(name, srgb) {
  const k = name;
  if (!texCache[k]) {
    const t = texLoader.load(`assets/tex/${name}.jpg`);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    texCache[k] = t;
  }
  return texCache[k];
}

// ---- Géométrie groupée par matériau ----
class Bucket {
  constructor() { this.p = []; this.n = []; this.u = []; this.i = []; }
  quad(a, b, c, d, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
    const k = this.p.length / 3;
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]);
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (let q = 0; q < 4; q++) this.n.push(nx, ny, nz);
    this.u.push(u0, v0, u1, v0, u1, v1, u0, v1);
    this.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  top(x0, z0, x1, z1, y, s = 4) { this.quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], x0 / s, z1 / s, x1 / s, z0 / s); }
  sides(x0, y0, z0, x1, y1, z1, su = 4, sv = 4, uo = 0) {
    const w = (x1 - x0) / su, d = (z1 - z0) / su, h = (y1 - y0) / sv;
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], uo, 0, uo + w, h);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], uo, 0, uo + w, h);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], uo, 0, uo + d, h);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], uo, 0, uo + d, h);
  }
  box(x0, y0, z0, x1, y1, z1, su = 4, sv = 4) { this.sides(x0, y0, z0, x1, y1, z1, su, sv); this.top(x0, z0, x1, z1, y1, su); }
  hip(x0, z0, x1, z1, y, h, s = 2.5) {
    const zc = (z0 + z1) / 2, ins = Math.min((z1 - z0) / 2, (x1 - x0) / 2 - 0.01), r0 = [x0 + ins, y + h, zc], r1 = [x1 - ins, y + h, zc];
    const sl = Math.hypot(h, (z1 - z0) / 2) / s, w = (x1 - x0) / s;
    this.quad([x0, y, z1], [x1, y, z1], r1, r0, 0, 0, w, sl);
    this.quad([x1, y, z0], [x0, y, z0], r0, r1, 0, 0, w, sl);
    this.quad([x1, y, z1], [x1, y, z0], r1, r1, 0, 0, (z1 - z0) / s, sl);
    this.quad([x0, y, z0], [x0, y, z1], r0, r0, 0, 0, (z1 - z0) / s, sl);
  }
  mesh(mat) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setIndex(this.i);
    const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
}

// ---- Textures dessinées (façades, boutiques, panneaux) ----
function shade(hex, f) { const c = new THREE.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString(); }
function facadeCanvas(style, color, rng) {
  const N = 4, C = 128, cv = document.createElement('canvas'), em = document.createElement('canvas');
  cv.width = cv.height = em.width = em.height = N * C;
  const g = cv.getContext('2d'), e = em.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, N * C, N * C); e.fillStyle = '#000'; e.fillRect(0, 0, N * C, N * C);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${rng() < 0.5 ? 0 : 255},${rng() < 0.5 ? 0 : 255},${rng() < 0.5 ? 0 : 200},${rng() * 0.035})`; g.fillRect(rng() * N * C, rng() * N * C, 2 + rng() * 5, 2 + rng() * 9); }
  if (style === 'brick') { g.strokeStyle = 'rgba(40,25,15,0.25)'; g.lineWidth = 1; for (let y = 0; y < N * C; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(N * C, y); g.stroke(); for (let x = (y / 6 % 2) * 8; x < N * C; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 6); g.stroke(); } } }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const x = c * C, y = r * C;
    if (style === 'glass') {
      const gr = g.createLinearGradient(x, y, x + C, y + C); gr.addColorStop(0, '#5f8fb0'); gr.addColorStop(0.5, '#2f5f7c'); gr.addColorStop(1, '#6fa3c2');
      g.fillStyle = gr; g.fillRect(x + 2, y + 2, C - 4, C - 4); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(x + 2, y + 2, C - 4, 14);
      g.fillStyle = '#26323a'; g.fillRect(x, y, C, 3); g.fillRect(x, y, 3, C); g.fillRect(x + C / 2 - 1, y, 2, C);
      if (rng() < 0.3) { e.fillStyle = rng() < 0.5 ? '#ffe9b0' : '#cfe6ff'; e.fillRect(x + 4, y + 20, C - 8, C - 26); }
      continue;
    }
    g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(x, y + C - 3, C, 3);
    const tall = style === 'haussmann';
    const ww = style === 'modern' ? C - 24 : tall ? 44 : 50, wh = tall ? 88 : style === 'modern' ? 56 : 62;
    const wx = x + (C - ww) / 2, wy = y + (tall ? 20 : 30);
    g.fillStyle = shade(color, 0.72); g.fillRect(wx - 5, wy - 5, ww + 10, wh + 10);
    const gl = g.createLinearGradient(wx, wy, wx + ww, wy + wh); gl.addColorStop(0, '#31465a'); gl.addColorStop(0.6, '#1b2a38'); gl.addColorStop(1, '#3d5870');
    g.fillStyle = gl; g.fillRect(wx, wy, ww, wh);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx + ww * 0.6, wy); g.lineTo(wx + ww * 0.85, wy); g.lineTo(wx + ww * 0.25, wy + wh); g.fill();
    if (rng() < 0.45) { g.fillStyle = ['#c9b9a0', '#e8e0d0', '#9fb3a0', '#b08a8a'][rng() * 4 | 0]; g.globalAlpha = 0.75; g.fillRect(wx, wy, ww * (0.3 + rng() * 0.25), wh); g.globalAlpha = 1; }
    g.fillStyle = style === 'modern' ? '#3a3f44' : '#f2efe6'; g.fillRect(wx + ww / 2 - 1.5, wy, 3, wh); if (!tall && style !== 'modern') g.fillRect(wx, wy + wh / 2 - 1.5, ww, 3);
    g.fillStyle = shade(color, 1.12); g.fillRect(wx - 8, wy + wh + 5, ww + 16, 5);
    if (style === 'plaster' && rng() < 0.55) { g.fillStyle = ['#6b4a2f', '#2f5d4a', '#7a2f25', '#31506f'][rng() * 4 | 0]; g.fillRect(wx - 16, wy, 13, wh); g.fillRect(wx + ww + 3, wy, 13, wh); g.strokeStyle = 'rgba(0,0,0,0.3)'; for (let k = 4; k < wh; k += 5) { g.beginPath(); g.moveTo(wx - 16, wy + k); g.lineTo(wx - 3, wy + k); g.moveTo(wx + ww + 3, wy + k); g.lineTo(wx + ww + 16, wy + k); g.stroke(); } }
    if (tall) { g.fillStyle = '#1c1c1c'; g.fillRect(wx - 12, wy + wh - 20, ww + 24, 2); for (let k = -12; k <= ww + 12; k += 5) g.fillRect(wx + k, wy + wh - 20, 1.2, 22); }
    if (style !== 'haussmann' && rng() < 0.2) { g.fillStyle = '#d8d8d2'; g.fillRect(wx + ww - 22, wy + wh + 12, 26, 15); g.fillStyle = '#777'; g.fillRect(wx + ww - 19, wy + wh + 15, 20, 9); }
    if (rng() < 0.12) { g.fillStyle = 'rgba(60,40,20,0.10)'; g.fillRect(wx + rng() * ww, wy + wh + 10, 5, C - wh - 40); }
    if (rng() < 0.32) { e.fillStyle = ['#ffd98a', '#fff1c4', '#ffe2a8'][rng() * 3 | 0]; e.fillRect(wx, wy, ww, wh); }
  }
  const map = new THREE.CanvasTexture(cv), emap = new THREE.CanvasTexture(em);
  for (const t of [map, emap]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; }
  return { map, emap };
}

const SHOPS_FR = ['BOUTIQUE DIVINE GRÂCE', 'ALIMENTATION EL-SHADDAÏ', 'COIFFURE LA BÉNÉDICTION', 'PHARMACIE DE LA PAIX', 'CAFÉTÉRIA EBEN-EZER', 'QUINCAILLERIE DIEU DONNE', 'COUTURE EMMANUEL', 'TÉLÉPHONES SHALOM', 'BOULANGERIE LA MANNE', 'LIBRAIRIE LA BONNE SEMENCE', 'RESTAURANT CHEZ MAMAN', 'PRESSING LA COLOMBE'];
const SHOPS_EN = ["GOD'S TIME PROVISIONS", 'BLESSED HANDS SALON', 'PEACE PHARMACY', 'EBENEZER CHOP BAR', 'GRACE FASHION HOUSE', 'SHALOM PHONES', 'MANNA BAKERY', 'GOOD SEED BOOKSHOP', 'FAVOUR ELECTRICALS', "MAMA'S KITCHEN", 'DOVE LAUNDRY', 'HOPE HARDWARE'];
function shopCanvas(color, names, rng) {
  const cv = document.createElement('canvas'), em = document.createElement('canvas'); cv.width = em.width = 1024; cv.height = em.height = 256;
  const g = cv.getContext('2d'), e = em.getContext('2d'); g.fillStyle = shade(color, 0.92); g.fillRect(0, 0, 1024, 256); e.fillStyle = '#000'; e.fillRect(0, 0, 1024, 256);
  const cols = ['#b3261e', '#1f5fa8', '#1d7a46', '#d98a00', '#6a2c91', '#0d6f73', '#222'];
  for (let i = 0; i < 4; i++) {
    const x = i * 256, c = cols[rng() * cols.length | 0];
    g.fillStyle = c; g.fillRect(x + 6, 8, 244, 54);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const name = names[rng() * names.length | 0]; let fs = 26; g.font = `bold ${fs}px Arial`; while (g.measureText(name).width > 232 && fs > 10) { fs--; g.font = `bold ${fs}px Arial`; }
    g.fillText(name, x + 128, 36);
    e.fillStyle = 'rgba(255,255,255,0.25)'; e.fillRect(x + 6, 8, 244, 54);
    if (rng() < 0.25) { g.fillStyle = '#8d9499'; g.fillRect(x + 14, 74, 228, 176); g.strokeStyle = 'rgba(0,0,0,0.25)'; for (let y = 78; y < 250; y += 7) { g.beginPath(); g.moveTo(x + 14, y); g.lineTo(x + 242, y); g.stroke(); } continue; }
    const gl = g.createLinearGradient(x, 74, x + 256, 250); gl.addColorStop(0, '#2c4254'); gl.addColorStop(1, '#16232e');
    g.fillStyle = gl; g.fillRect(x + 14, 78, 140, 150); g.fillRect(x + 168, 78, 74, 172);
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 14, 78, 140, 30);
    for (let k = 0; k < 9; k++) { g.fillStyle = ['#d94', '#4a8', '#c44', '#eee', '#48c', '#dc5'][rng() * 6 | 0]; g.fillRect(x + 20 + (k % 5) * 26, 150 + (k / 5 | 0) * 36, 20, 28); }
    g.strokeStyle = '#ddd'; g.lineWidth = 3; g.strokeRect(x + 14, 78, 140, 150); g.strokeRect(x + 168, 78, 74, 172);
    e.fillStyle = '#ffe7b0'; e.globalAlpha = 0.6; e.fillRect(x + 14, 78, 140, 150); e.fillRect(x + 168, 78, 74, 172); e.globalAlpha = 1;
  }
  const map = new THREE.CanvasTexture(cv), emap = new THREE.CanvasTexture(em);
  for (const t of [map, emap]) { t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; }
  return { map, emap };
}
function fit(g, text, maxW, fs, weight = 'bold', font = 'Arial') { g.font = `${weight} ${fs}px ${font}`; while (g.measureText(text).width > maxW && fs > 8) { fs--; g.font = `${weight} ${fs}px ${font}`; } }
export function signTexture(lines, { w = 512, h = 128, bg = '#124b8a', fg = '#fff', border = '#fff' } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h); if (border) { g.strokeStyle = border; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  const arr = Array.isArray(lines) ? lines : [lines], lh = (h - 24) / arr.length;
  arr.forEach((t, i) => { fit(g, t, w - 40, Math.min(lh * 0.78, i === 0 ? 64 : 44), i === 0 ? 'bold' : 'normal'); g.fillText(t, w / 2, 12 + lh * (i + 0.5)); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

const BILLBOARDS = [
  [['« Je suis la lumière du monde »', 'Jean 8:12'], ['"I am the light of the world"', 'John 8:12']],
  [['Dieu est amour', '1 Jean 4:8'], ['God is love', '1 John 4:8']],
  [['« Venez à moi, vous tous qui êtes fatigués »', 'Matthieu 11:28'], ['"Come unto me, all ye that labour"', 'Matthew 11:28']],
  [["L'Éternel est mon berger", 'Psaume 23:1'], ['The LORD is my shepherd', 'Psalm 23:1']],
  [['Priez sans cesse', '1 Thessaloniciens 5:17'], ['Pray without ceasing', '1 Thessalonians 5:17']],
  [['Aimez-vous les uns les autres', 'Jean 13:34'], ['Love one another', 'John 13:34']],
  [['Tout est possible à celui qui croit', 'Marc 9:23'], ['All things are possible to him that believeth', 'Mark 9:23']],
  [['Jésus-Christ est le même hier, aujourd’hui, et éternellement', 'Hébreux 13:8'], ['Jesus Christ the same yesterday, and to day, and for ever', 'Hebrews 13:8']],
];


// --- compléments de géométrie ---
Bucket.prototype.tri = function (a, b, c, s = 6) {
  const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
  if (ny < 0) { const t = b; b = c; c = t; nx = -nx; ny = -ny; nz = -nz; }
  const l = Math.hypot(nx, ny, nz) || 1, k = this.p.length / 3;
  this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  for (let q = 0; q < 3; q++) this.n.push(nx / l, ny / l, nz / l);
  this.u.push(a[0] / s, a[2] / s, b[0] / s, b[2] / s, c[0] / s, c[2] / s); this.i.push(k, k + 1, k + 2);
};
Bucket.prototype.up = function (a, b, c, d, s = 6) { this.tri(a, b, c, s); this.tri(a, c, d, s); };
Bucket.prototype.poly = function (pts, y, s = 6) { // pts : [x,z,x,z…]
  const c = []; for (let i = 0; i < pts.length; i += 2) c.push(new THREE.Vector2(pts[i], pts[i + 1]));
  for (const f of THREE.ShapeUtils.triangulateShape(c, [])) this.tri([c[f[0]].x, y, c[f[0]].y], [c[f[1]].x, y, c[f[1]].y], [c[f[2]].x, y, c[f[2]].y], s);
};
Bucket.prototype.ribbon = function (ax, az, bx, bz, w, y, s = 6) {
  const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1, nx = -dz / l * w / 2, nz = dx / l * w / 2;
  this.up([ax - nx, y, az - nz], [ax + nx, y, az + nz], [bx + nx, y, bz + nz], [bx - nx, y, bz - nz], s);
};
const CELL = 24;
const key = (x, z) => Math.floor(x / CELL) + ',' + Math.floor(z / CELL);
function pip(p, x, z) { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) { if ((p[i + 1] > z) !== (p[j + 1] > z) && x < (p[j] - p[i]) * (z - p[i + 1]) / (p[j + 1] - p[i + 1]) + p[i]) c = !c; } return c; }

export class World {
  static async create(scene, cityId, quality) {
    const data = await fetch(`assets/cities/${cityId}.json`).then(r => r.json());
    return new World(scene, cityId, quality, data);
  }
  constructor(scene, cityId, quality, data) {
    this.scene = scene; this.id = cityId; this.cfg = CITIES[cityId]; this.q = quality; this.data = data;
    this.group = new THREE.Group(); scene.add(this.group);
    this.rng = rng32(cityId.length * 977 + 5);
    this.buckets = {}; this.mats = {}; this.segGrid = new Map(); this.polyGrid = new Map();
    this.pois = {}; this.nightMats = []; this.inst = { palm: [], tree: [], lamp: [], bench: [], stall: [], tank: [] };
    const e = data.ext; this.ext = { x0: e[0], z0: e[1], x1: e[2], z1: e[3] };
    this.bounds = { x0: e[0] + 60, z0: e[1] + 60, x1: e[2] - 60, z1: e[3] - 60 };
    this.build();
  }
  cityName() { return L(this.cfg.name); }
  T(fr, en) { return this.cfg.en ? en : fr; }

  mat(k) {
    if (this.mats[k]) return this.mats[k];
    const [type, arg] = k.split(':'); let m;
    const std = (name, o = {}) => new THREE.MeshStandardMaterial({ map: ptex(name + '_d', true), normalMap: ptex(name + '_n'), roughness: 0.95, ...o });
    if (type === 'tex') m = std(arg);
    else if (type === 'plaster') m = std('plaster', { color: arg, roughness: 0.9 });
    else if (type === 'tin') m = std('tin', { color: arg, roughness: 0.55, metalness: 0.45 });
    else if (type === 'flat') m = new THREE.MeshStandardMaterial({ color: arg, roughness: 0.8 });
    else if (type === 'metal') m = new THREE.MeshStandardMaterial({ color: arg, roughness: 0.4, metalness: 0.8 });
    else if (type === 'facade' || type === 'shop') {
      const [style, color] = arg.split('|');
      const t = type === 'shop' ? shopCanvas(color, this.cfg.en ? SHOPS_EN : SHOPS_FR, this.rng) : facadeCanvas(style, color, this.rng);
      m = new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emap, emissive: 0xffffff, emissiveIntensity: 0, roughness: style === 'glass' ? 0.12 : 0.88, metalness: style === 'glass' ? 0.75 : 0 });
      if (style !== 'glass') m.normalMap = ptex('plaster_n');
      this.nightMats.push(m);
    }
    this.mats[k] = m; return m;
  }
  bk(k, x, z) { this.mat(k); const kk = x === undefined ? k : k + '@' + Math.floor(x / 420) + ',' + Math.floor(z / 420); if (!this.buckets[kk]) this.buckets[kk] = new Bucket(); return this.buckets[kk]; }
  addSeg(x1, z1, x2, z2) {
    const s = [x1, z1, x2, z2], a = Math.floor(Math.min(x1, x2) / CELL), b = Math.floor(Math.max(x1, x2) / CELL), c = Math.floor(Math.min(z1, z2) / CELL), d = Math.floor(Math.max(z1, z2) / CELL);
    for (let i = a; i <= b; i++) for (let j = c; j <= d; j++) { const k = i + ',' + j; let l = this.segGrid.get(k); if (!l) this.segGrid.set(k, l = []); l.push(s); }
  }
  addPoly(p) {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 1]); z1 = Math.max(z1, p[i + 1]); const j = (i + 2) % p.length; this.addSeg(p[i], p[i + 1], p[j], p[j + 1]); }
    for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) { const k = i + ',' + j; let l = this.polyGrid.get(k); if (!l) this.polyGrid.set(k, l = []); l.push(p); }
  }
  collide(x0, z0, x1, z1) { this.addPoly([x0, z0, x1, z0, x1, z1, x0, z1]); }
  sign(lines, x, y, z, w, h, ry = 0, opts = {}) {
    const mat = new THREE.MeshStandardMaterial({ map: signTexture(lines, opts), roughness: 0.6 });
    const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); b.rotation.y = Math.PI; b.position.z = -0.06; f.position.z = 0.03;
    const mid = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.06), this.mat('metal:#4a4f55')); mid.position.z = -0.015;
    g.add(f, b, mid); g.position.set(x, y, z); g.rotation.y = ry; this.group.add(g); return g;
  }
  board(lines, x, z, ry, w = 8, h = 1.6, y = 4.2, opts = {}) { // panneau sur deux poteaux
    this.sign(lines, x, y, z, w, h, ry, opts);
    const c = Math.cos(ry), s = Math.sin(ry), m = this.mat('metal:#4a4f55');
    for (const k of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, y, 6), m); p.position.set(x + c * k * (w / 2 - 0.2), y / 2, z - s * k * (w / 2 - 0.2)); p.castShadow = true; this.group.add(p); }
  }

  // ---------- Construction ----------
  build() {
    const d = this.data, cfg = this.cfg, rng = this.rng, ex = this.ext;
    // graphe des rues
    const rn = d.rn; this.nodes = [];
    for (let i = 0; i < rn.length; i += 2) this.nodes.push({ x: rn[i] / 10, z: rn[i + 1] / 10, adj: [], w: 0 });
    for (const [cls, nm, one, ids] of d.roads) {
      const w = WIDTH[cls], name = nm >= 0 ? d.names[nm] : '';
      for (let i = 0; i < ids.length - 1; i++) { const a = this.nodes[ids[i]], b = this.nodes[ids[i + 1]]; a.adj.push({ to: ids[i + 1], cls, w, ok: true, name }); b.adj.push({ to: ids[i], cls, w, ok: !one, name }); a.w = Math.max(a.w, w); b.w = Math.max(b.w, w); }
    }
    this.nodeGrid = new Map();
    this.nodes.forEach((n, i) => { const k = Math.floor(n.x / 60) + ',' + Math.floor(n.z / 60); let l = this.nodeGrid.get(k); if (!l) this.nodeGrid.set(k, l = []); l.push(i); });
    // côte
    this.shore = null;
    if (d.coast.length) {
      const c = d.coast.reduce((a, b) => (b.length > a.length ? b : a)); const pts = []; for (let i = 0; i < c.length; i += 2) pts.push([c[i] / 10, c[i + 1] / 10]);
      pts.sort((a, b) => a[0] - b[0]); pts.unshift([-4000, pts[0][1]]); pts.push([4000, pts[pts.length - 1][1]]); this.shore = pts;
    }
    // terre et mer
    const gname = 'tex:' + cfg.ground;
    if (this.shore) {
      const land = this.bk(gname), sand = this.bk('tex:sand'), sp = this.shore;
      for (let i = 0; i < sp.length - 1; i++) { const a = sp[i], b = sp[i + 1];
        land.up([a[0], 0, -4000], [b[0], 0, -4000], [b[0], 0, b[1] - 70], [a[0], 0, a[1] - 70], 7);
        sand.up([a[0], 0, a[1] - 70], [b[0], 0, b[1] - 70], [b[0], -0.35, b[1] + 6], [a[0], -0.35, a[1] + 6], 5); }
      const wm = new THREE.MeshStandardMaterial({ color: 0x1f7f9c, roughness: 0.12, metalness: 0.55, normalMap: ptex('water_n').clone(), transparent: true, opacity: 0.93 });
      wm.normalMap.repeat.set(160, 160); wm.normalMap.needsUpdate = true; wm.normalScale.set(0.6, 0.6);
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), wm); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.18; this.group.add(sea); this.water = wm;
    } else {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), new THREE.MeshStandardMaterial({ map: ptex(cfg.ground + '_d', true).clone(), roughness: 1 }));
      m.material.map.repeat.set(1300, 1300); m.material.map.needsUpdate = true; m.rotation.x = -Math.PI / 2; m.receiveShadow = true; this.group.add(m);
    }
    // eau intérieure, verdure, terrains
    const flt = a => a.map(v => v / 10);
    if (d.water.length) {
      const wm2 = new THREE.MeshStandardMaterial({ color: cfg.water === 'river' ? 0x4f7672 : 0x3b7f8f, roughness: 0.15, metalness: 0.5, normalMap: ptex('water_n').clone() }); wm2.normalMap.repeat.set(1, 1); wm2.normalMap.needsUpdate = true;
      this.mats['water'] = wm2; const wb = this.buckets['water'] = new Bucket(); this.water2 = wm2;
      for (const w of d.water) { const p = flt(w); try { wb.poly(p, 0.035, 14); } catch (e) { continue; } this.addPoly(p); }
    }
    this.greens = [];
    for (const g of d.green) { const p = flt(g); try { this.bk('tex:grass').poly(p, 0.012, 5); this.greens.push(p); } catch (e) { /* polygone invalide */ } }
    for (const g of d.pitch) { const p = flt(g); try { this.bk('flat:#4f8a3a').poly(p, 0.03, 5); } catch (e) { /* ignore */ } }
    this.buildRoads();
    this.buildBuildings();
    this.setupPois();
    this.props();
    for (const k in this.buckets) { if (!this.buckets[k].i.length) continue; const m = this.buckets[k].mesh(this.mats[k.split('@')[0]]); if (/asphalt|mark|pave|laterite|sand|grass|water|concrete$/.test(k) && !k.startsWith('plaster')) m.castShadow = false; if (k === 'mark') m.renderOrder = 2; this.group.add(m); }
    this.buildInstances();
    this.drawMap();
  }

  buildRoads() {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = 'rgba(235,235,225,0.9)'; g.fillRect(4, 10, 24, 64);
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    this.mats['mark'] = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const mk = this.buckets['mark'] = new Bucket();
    const dirt = 'tex:pave';
    const disc = (b, x, z, r, y) => { for (let k = 0; k < 8; k++) { const a0 = k * Math.PI / 4, a1 = a0 + Math.PI / 4; b.tri([x, y, z], [x + Math.cos(a0) * r, y, z + Math.sin(a0) * r], [x + Math.cos(a1) * r, y, z + Math.sin(a1) * r], 6); } };
    this.nodes.forEach((n, i) => {
      for (const e of n.adj) {
        if (e.to < i && this.nodes[e.to].adj.some(x => x.to === i)) { if (!(e.to < i)) continue; }
        if (e.to > i) continue; const m = this.nodes[e.to];
        if (e.cls <= 3) { this.bk('tex:pave', n.x, n.z).ribbon(n.x, n.z, m.x, m.z, e.w + 5, 0.02); this.bk('tex:asphalt', n.x, n.z).ribbon(n.x, n.z, m.x, m.z, e.w, 0.05); }
        else this.bk(dirt, n.x, n.z).ribbon(n.x, n.z, m.x, m.z, e.w, 0.03);
        if (e.cls <= 2) { const l = Math.hypot(m.x - n.x, m.z - n.z); if (l > 6) { const dx = (m.x - n.x) / l, dz = (m.z - n.z) / l, nx = -dz * 0.11, nz = dx * 0.11; const a = [n.x + dx * 2, n.z + dz * 2], b = [m.x - dx * 2, m.z - dz * 2];
          mk.quad([a[0] - nx, 0.06, a[1] - nz], [a[0] + nx, 0.06, a[1] + nz], [b[0] + nx, 0.06, b[1] + nz], [b[0] - nx, 0.06, b[1] - nz], 0, 0, 1, (l - 4) / 7); const N = mk.n.length; if (mk.n[N - 2] < 0) for (let q = 1; q <= 12; q++) mk.n[N - q] *= -1; } }
      }
      if (n.adj.length) { const c = Math.min(...n.adj.map(e => e.cls)); if (c <= 3) { disc(this.bk('tex:pave', n.x, n.z), n.x, n.z, n.w / 2 + 2.5, 0.02); disc(this.bk('tex:asphalt', n.x, n.z), n.x, n.z, n.w / 2, 0.05); } else disc(this.bk(dirt, n.x, n.z), n.x, n.z, n.w / 2, 0.03); }
    });
    this.mats['mark'].side = THREE.DoubleSide;
  }

  buildBuildings() {
    const cfg = this.cfg, rng = this.rng, tinCols = ['#b0685a', '#9aa3aa', '#a8785c', '#8f9a9e', '#b9bcbc', '#8e6f5e', '#7f9aae'];
    this.bInfo = [];
    for (const b of this.data.b) {
      const lv = b[0], kind = b[1], n = (b.length - 2) / 2, p = new Array(n * 2);
      for (let i = 0; i < n * 2; i++) p[i] = b[i + 2] / 10;
      let ar = 0, cx = 0, cz = 0; for (let i = 0; i < n; i++) { const j = (i + 1) % n; ar += p[i * 2] * p[j * 2 + 1] - p[j * 2] * p[i * 2 + 1]; cx += p[i * 2]; cz += p[i * 2 + 1]; }
      ar = Math.abs(ar / 2); cx /= n; cz /= n;
      const color = kind === 1 ? '#f4f0e6' : cfg.walls[rng() * cfg.walls.length | 0];
      const style = cfg.style && lv < 9 ? cfg.style : lv >= 7 ? (rng() < 0.55 ? 'glass' : 'modern') : lv >= 4 && rng() < 0.4 ? 'modern' : 'plaster';
      const shops = kind === 0 && lv >= 2 && ar > 90 && rng() < (cfg.style ? 0.6 : 0.45);
      const gh = shops ? 3.8 : 0, h = kind === 3 ? 3 : gh + (lv - (shops ? 1 : 0)) * 3.1 + (lv === 1 ? 0.3 : 0);
      const fb = this.bk(`facade:${style}|${color}`, cx, cz), sb = shops ? this.bk('shop:x|' + color, cx, cz) : null;
      let u = (rng() * 4 | 0) / 4;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, x1 = p[i * 2], z1 = p[i * 2 + 1], x2 = p[j * 2], z2 = p[j * 2 + 1], l = Math.hypot(x2 - x1, z2 - z1);
        if (shops) sb.quad([x2, 0, z2], [x1, 0, z1], [x1, gh, z1], [x2, gh, z2], u * 0.8, 0, u * 0.8 + l / 16, 1);
        fb.quad([x2, gh, z2], [x1, gh, z1], [x1, h, z1], [x2, h, z2], u, 0, u + l / 12.8, (h - gh) / 12.4);
        u += l / 12.8;
      }
      // toit
      const low = lv <= 2 && !cfg.style;
      if (n === 4 && (low || cfg.style) && kind !== 3 && rng() < 0.8) {
        const P4 = [0, 1, 2, 3].map(i => [p[i * 2], p[i * 2 + 1]]), L1 = Math.hypot(P4[1][0] - P4[0][0], P4[1][1] - P4[0][1]), L2 = Math.hypot(P4[2][0] - P4[1][0], P4[2][1] - P4[1][1]);
        const q = L1 >= L2 ? P4 : [P4[1], P4[2], P4[3], P4[0]], long = Math.max(L1, L2), short = Math.min(L1, L2);
        const ma = [(q[3][0] + q[0][0]) / 2, (q[3][1] + q[0][1]) / 2], mb = [(q[1][0] + q[2][0]) / 2, (q[1][1] + q[2][1]) / 2], dl = Math.hypot(mb[0] - ma[0], mb[1] - ma[1]) || 1;
        const ins = Math.min(short / 2, long * 0.45), dx = (mb[0] - ma[0]) / dl, dz = (mb[1] - ma[1]) / dl, rh = Math.min(cfg.style ? 3.2 : 2.0, short * 0.28);
        const r0 = [ma[0] + dx * ins, h + rh, ma[1] + dz * ins], r1 = [mb[0] - dx * ins, h + rh, mb[1] - dz * ins], v = i => [q[i][0], h, q[i][1]];
        const rb = cfg.style ? this.bk(cfg.style === 'brick' ? 'tex:rooftile' : 'metal:#5c6670', cx, cz) : this.bk('tin:' + tinCols[rng() * tinCols.length | 0], cx, cz);
        rb.up(v(0), v(1), r1, r0, 2.5); rb.up(v(2), v(3), r0, r1, 2.5); rb.tri(v(1), v(2), r1, 2.5); rb.tri(v(3), v(0), r0, 2.5);
      } else {
        const rb = low || kind === 3 ? this.bk('tin:' + tinCols[rng() * tinCols.length | 0], cx, cz) : this.bk('tex:concrete', cx, cz);
        try { rb.poly(p, h, 5); } catch (e) { /* ignore */ }
        if (!low && lv < 9 && ar > 60 && rng() < 0.5) this.inst.tank.push([cx, h, cz]);
      }
      this.addPoly(p); this.bInfo.push({ cx, cz, h, ar, kind });
    }
  }

  nearestBuilding(x, z, pred) { let best = null, bd = 1e9; for (const b of this.bInfo) { const d = (b.cx - x) ** 2 + (b.cz - z) ** 2; if (d < bd && (!pred || pred(b))) { bd = d; best = b; } } return best; }

  setupPois() {
    const d = this.data, cfg = this.cfg;
    const LABEL = { church: [['ÉGLISE LA LUMIÈRE DU MONDE'], ['LIGHT OF THE WORLD CHURCH'], '#7a1f17'], market: [['GRAND MARCHÉ'], ['CENTRAL MARKET'], '#b3541e'], hospital: [['HÔPITAL DE LA COMPASSION'], ['COMPASSION HOSPITAL'], '#b3261e'], school: [['ÉCOLE'], ['SCHOOL'], '#1d6b3f'], park: [['JARDIN DE LA PAIX'], ['PEACE GARDEN'], '#1d6b3f'], stadium: [['TERRAIN DES JEUNES'], ['YOUTH PITCH'], '#1d6b3f'], station: [['GARE — VOYAGES'], ['STATION — TRAVEL'], '#124b8a'], prison: [["MAISON D'ARRÊT"], ['CITY PRISON'], '#2e3439'], orphanage: [["ORPHELINAT LA MAISON DE L'ESPÉRANCE"], ['HOUSE OF HOPE ORPHANAGE'], '#8a3d7a'], home: [['MA MAISON'], ['MY HOME'], '#2f6f9f'], landmark: [[''], [''], '#1c2b3a'] };
    for (const k in d.pois) {
      const o = d.pois[k]; let [x, z] = o.s; const [cx, cz] = o.c;
      const f = this.freeNear(x, z, 1.0); x = f.x; z = f.z;
      const face = Math.atan2(cx - x, cz - z);
      this.pois[k] = { x, z, cx, cz, face, name: o.n };
      const lab = LABEL[k]; let lines = (cfg.en ? lab[1] : lab[0]).slice();
      if (k === 'landmark') lines = [L(cfg.landmark).toUpperCase(), this.cityName().toUpperCase() + ' — ' + L(cfg.country).toUpperCase()];
      else if (o.n && k !== 'home' && k !== 'orphanage' && k !== 'park') lines = [o.n.toUpperCase()].concat(k === 'church' ? [this.T('« Jésus-Christ est Seigneur »', '"Jesus Christ is Lord"')] : k === 'station' ? [this.T('VOYAGES VERS LES AUTRES VILLES', 'TRAVEL TO OTHER CITIES')] : []);
      const bx = x + Math.sin(face) * 1.4, bz = z + Math.cos(face) * 1.4;
      this.board(lines, bx, bz, face + Math.PI, k === 'home' ? 3.6 : 8.5, lines.length > 1 ? 2.1 : 1.4, 4.6, { bg: lab[2], h: lines.length > 1 ? 150 : 96 });
    }
    // plage ou berge
    const ch = this.pois.church;
    if (this.shore) { const z = this.shoreZ(ch.x) - 16; this.pois.beach = { x: ch.x, z, cx: ch.x, cz: z + 20, face: 0, name: '' }; }
    else if (d.water.length) { let best = null, bd = 1e9; for (const w of d.water) for (let i = 0; i < w.length; i += 2) { const x = w[i] / 10, z = w[i + 1] / 10, dd = (x - ch.x) ** 2 + (z - ch.z) ** 2; if (dd < bd && x > this.bounds.x0 && x < this.bounds.x1 && z > this.bounds.z0 && z < this.bounds.z1) { bd = dd; best = [x, z]; } }
      const n = this.nodes[this.nearestNode(best[0], best[1], 3)], f = this.freeNear(n.x, n.z, 1); this.pois.beach = { x: f.x, z: f.z, cx: best[0], cz: best[1], face: 0, name: '' }; }
    else this.pois.beach = this.pois.park;
    this.pois.altar = this.pois.church;
    this.homeSpot = this.pois.home;
    // clocher et croix sur l'église
    const cb = this.nearestBuilding(ch.cx, ch.cz, b => b.ar > 80) || { cx: ch.cx, cz: ch.cz, h: 9 };
    const w = this.bk('plaster:#f4f0e6'), H = cb.h + 11; w.sides(cb.cx - 2.4, 0, cb.cz - 2.4, cb.cx + 2.4, H, cb.cz + 2.4, 4, 4);
    this.bk('tin:#8e2f25').hip(cb.cx - 2.8, cb.cz - 2.8, cb.cx + 2.8, cb.cz + 2.8, H, 5.5);
    const cr = this.bk('flat:#ffffff'); cr.box(cb.cx - 0.16, H + 5.3, cb.cz - 0.16, cb.cx + 0.16, H + 9, cb.cz + 0.16); cr.box(cb.cx - 1.1, H + 7.3, cb.cz - 0.16, cb.cx + 1.1, H + 7.65, cb.cz + 0.16); cr.box(cb.cx - 0.16, H + 7.3, cb.cz - 1.1, cb.cx + 0.16, H + 7.65, cb.cz + 1.1);
    this.landmark(this.pois.landmark);
  }

  landmark(lm) {
    const id = this.id, cx = lm.cx, cz = lm.cz, y = 0, wh = this.bk('plaster:#f5f3ee');
    const add = m => { m.castShadow = true; this.group.add(m); return m; };
    const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
    const star = (r, col, yy) => { const s = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + Math.PI / 2, rr = k % 2 ? r * 0.4 : r; s[k ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); } const m = add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.7, bevelEnabled: false }), std(col))); m.position.set(cx, yy, cz - 0.35); };
    if (id === 'lome') {
      this.bk('tex:concrete').box(cx - 9, y, cz - 9, cx + 9, y + 0.5, cz + 9); this.bk('flat:#3b88a8').top(cx - 8.4, cz - 8.4, cx + 8.4, cz + 8.4, y + 0.52);
      wh.box(cx - 7, y, cz - 1, cx - 2.2, y + 15, cz + 1); wh.box(cx + 2.2, y, cz - 1, cx + 7, y + 15, cz + 1); wh.box(cx - 7, y + 12, cz - 1, cx + 7, y + 15, cz + 1);
      const br = std(0x6b4a25, { metalness: 0.7, roughness: 0.35 });
      add(new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 2.6, 4, 10), br)).position.set(cx, y + 3.4, cz + 2.4);
      add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), br)).position.set(cx, y + 5.6, cz + 2.4);
      for (const s of [-1, 1]) { const arm = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 2.2, 4, 8), br)); arm.position.set(cx + s * 1.1, y + 5.9, cz + 2.4); arm.rotation.z = -s * 0.55; }
      wh.box(cx - 1, y, cz + 1.6, cx + 1, y + 1.6, cz + 3.2); this.collide(cx - 9, cz - 9, cx + 9, cz + 9);
    } else if (id === 'cotonou') {
      this.bk('tex:concrete').box(cx - 7, y, cz - 7, cx + 7, y + 0.6, cz + 7); add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.5, 22, 12), std(0xf2efe8))).position.set(cx, y + 11, cz); star(3.8, 0xc62828, y + 25); this.collide(cx - 7, cz - 7, cx + 7, cz + 7);
    } else if (id === 'accra') {
      wh.box(cx - 12, y, cz - 3, cx - 7, y + 14, cz + 3); wh.box(cx + 7, y, cz - 3, cx + 12, y + 14, cz + 3); wh.box(cx - 12, y + 14, cz - 3, cx + 12, y + 18, cz + 3); wh.box(cx - 5, y + 18, cz - 2, cx + 5, y + 20, cz + 2); star(2.8, 0x111111, y + 23);
      this.sign(['FREEDOM AND JUSTICE'], cx, y + 16, cz + 3.1, 16, 1.6, 0, { bg: '#f5f3ee', fg: '#222', border: null }); this.collide(cx - 12, cz - 3, cx - 7, cz + 3); this.collide(cx + 7, cz - 3, cx + 12, cz + 3);
    } else if (id === 'abidjan') {
      const m = std(0xf7f7f4); for (const s of [-1, 1]) { const leg = add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 44, 2.2), m)); leg.position.set(cx + s * 6, y + 21, cz); leg.rotation.z = s * 0.27; }
      add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 10, 1.2), m)).position.set(cx, y + 47, cz); add(new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 1.2), m)).position.set(cx, y + 48.5, cz);
    } else if (id === 'lagos') {
      this.bk('tex:concrete').box(cx - 6, y, cz - 6, cx + 6, y + 0.6, cz + 6); this.bk('flat:#3b88a8').top(cx - 5.4, cz - 5.4, cx + 5.4, cz + 5.4, y + 0.62);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 9, 10), std(0xe8e4da))).position.set(cx, y + 4.5, cz); add(new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 10), std(0xc9a227, { metalness: 0.8, roughness: 0.3 }))).position.set(cx, y + 9.6, cz); this.collide(cx - 6, cz - 6, cx + 6, cz + 6);
    } else if (id === 'paris') {
      const iron = std(0x5a4a3a, { metalness: 0.6, roughness: 0.5 }), H = 300, B2 = 62;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const pts = []; for (let k = 0; k <= 12; k++) { const t = k / 12, r = B2 * Math.pow(1 - t, 2.6) + 1.2; pts.push(new THREE.Vector3(cx + sx * r, y + t * H, cz + sz * r)); } add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 3.2, 6), iron)); this.collide(cx + sx * B2 - 7, cz + sz * B2 - 7, cx + sx * B2 + 7, cz + sz * B2 + 7); }
      for (const [h, r] of [[57, 34], [115, 17], [276, 5]]) add(new THREE.Mesh(new THREE.BoxGeometry(r * 2, 5, r * 2), iron)).position.set(cx, y + h, cz);
      add(new THREE.Mesh(new THREE.ConeGeometry(2, 30, 6), iron)).position.set(cx, y + H + 12, cz);
    } else if (id === 'london') {
      const st = this.bk('plaster:#c9b58c'), H = 80; st.box(cx - 6, y, cz - 6, cx + 6, y + H, cz + 6, 4, 4);
      for (const [dx, dz, ry] of [[0, 6.08, 0], [0, -6.08, Math.PI], [6.08, 0, Math.PI / 2], [-6.08, 0, -Math.PI / 2]]) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = '#f4f0e0'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 8; g.stroke();
        for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); g.lineTo(128 + Math.cos(a) * 114, 128 + Math.sin(a) * 114); g.stroke(); }
        g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 50); g.moveTo(128, 128); g.lineTo(180, 150); g.stroke();
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const c = new THREE.Mesh(new THREE.CircleGeometry(4.6, 32), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.15 })); c.position.set(cx + dx, y + H - 9, cz + dz); c.rotation.y = ry; this.group.add(c);
      }
      this.bk('metal:#3a4046').hip(cx - 6.6, cz - 6.6, cx + 6.6, cz + 6.6, y + H, 16);
    }
  }

  props() {
    const rng = this.rng, cfg = this.cfg, en = S.lang === 'en';
    let acc = 0, bbIdx = 0;
    this.nodes.forEach((n, i) => {
      for (const e of n.adj) {
        if (e.to > i || e.cls > 3) continue; const m = this.nodes[e.to], l = Math.hypot(m.x - n.x, m.z - n.z); if (l < 8) continue;
        const dx = (m.x - n.x) / l, dz = (m.z - n.z) / l;
        for (let s = 6; s < l - 4; s += 21) {
          acc++; const side = acc % 2 ? 1 : -1, px = n.x + dx * s, pz = n.z + dz * s;
          if (e.cls <= 2 && acc % 2 === 0) { const off = e.w / 2 + 1.1, x = px - dz * off * side, z = pz + dx * off * side; if (this.free(x, z, 0.5)) this.inst.lamp.push([x, 0, z, Math.atan2(-dx * side, -dz * side)]); }
          else if (rng() < (e.cls <= 2 ? 0.5 : 0.16)) { const off = e.w / 2 + 2.1, x = px - dz * off * side, z = pz + dx * off * side; if (this.free(x, z, 1.1)) this.plant(x, z, true); }
          if (e.cls <= 1 && acc % 23 === 0 && bbIdx < BILLBOARDS.length * 2) { const off = e.w / 2 + 3.2, x = px - dz * off * side, z = pz + dx * off * side; if (this.free(x, z, 2.2)) { const bb = BILLBOARDS[bbIdx++ % BILLBOARDS.length]; this.board(en ? bb[1] : bb[0], x, z, Math.atan2(dx, dz) + (side > 0 ? Math.PI : 0), 7.5, 3.2, 6.6, { bg: ['#12324f', '#4a1f4f', '#0f4a3a', '#5a2a12'][bbIdx % 4], h: 220, border: '#f5c542' }); } }
        }
      }
    });
    for (const g of this.greens) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < g.length; i += 2) { x0 = Math.min(x0, g[i]); x1 = Math.max(x1, g[i]); z0 = Math.min(z0, g[i + 1]); z1 = Math.max(z1, g[i + 1]); }
      const n = Math.min(40, (x1 - x0) * (z1 - z0) / 260); for (let k = 0; k < n; k++) { const x = x0 + rng() * (x1 - x0), z = z0 + rng() * (z1 - z0); if (pip(g, x, z) && this.free(x, z, 1.2)) this.plant(x, z, rng() < 0.35); } }
    if (this.shore) for (let x = this.ext.x0; x < this.ext.x1; x += 7 + rng() * 9) { const z = this.shoreZ(x) - 26 - rng() * 60; if (this.free(x, z, 1.5) && !this.onRoad(x, z)) this.inst.palm.push([x, 0, z, 0.9 + rng() * 0.6, rng() * 6.28]); }
    // étals autour du marché
    const mk = this.pois.market, cols = ['#c0392b', '#2471a3', '#d4ac0d', '#1e8449', '#ca6f1e', '#7d3c98', '#aeb6bf'];
    for (const i of this.nodesNear(mk.cx, mk.cz, 130)) { const n = this.nodes[i]; for (const e of n.adj) { if (e.to > i || e.cls > 4) continue; const m = this.nodes[e.to], l = Math.hypot(m.x - n.x, m.z - n.z); if (l < 9) continue; const dx = (m.x - n.x) / l, dz = (m.z - n.z) / l;
      for (let s = 5; s < l - 4; s += 6.5) for (const side of [-1, 1]) { if (this.inst.stall.length > 70 || rng() < 0.35) continue; const off = e.w / 2 + 1.5, x = n.x + dx * s - dz * off * side, z = n.z + dz * s + dx * off * side; if (this.free(x, z, 1.5)) { this.inst.stall.push([x, 0, z, cols[rng() * cols.length | 0], Math.atan2(dx, dz) + Math.PI / 2]); this.collide(x - 0.9, z - 0.9, x + 0.9, z + 0.9); } } } }
    // pirogues sur la plage
    if (this.shore) { const colsB = [0xc0392b, 0x1f618d, 0xf1c40f, 0x117a65]; for (let k = 0; k < 9; k++) { const x = this.pois.beach.x - 260 + k * 62 + rng() * 20, z = this.shoreZ(x) - 9 - rng() * 6; const g = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.scale(1.0, 0.8, 5.2); const boat = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: colsB[k % 4], roughness: 0.7, side: THREE.DoubleSide })); boat.position.set(x, 0.6, z); boat.rotation.y = 0.3 + rng() * 0.6; boat.castShadow = true; this.group.add(boat); this.collide(x - 1.5, z - 3, x + 1.5, z + 3); } }
  }
  plant(x, z, palmOk = true) {
    if (this.cfg.tree === 'palm' && palmOk && this.rng() < 0.55) this.inst.palm.push([x, 0, z, 0.8 + this.rng() * 0.5, this.rng() * 6.28]);
    else this.inst.tree.push([x, 0, z, 0.8 + this.rng() * 0.6, this.rng() * 6.28]);
  }
  buildInstances() {
    const dummy = new THREE.Object3D(), group = this.group;
    const place = (geo, mat, all, fn, shadow = true) => {
      if (!all.length) return null;
      const tiles = new Map(); for (const it of all) { const k = Math.floor(it[0] / 420) + ',' + Math.floor(it[2] / 420); if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(it); }
      for (const list of tiles.values()) {
        const im = new THREE.InstancedMesh(geo, mat, list.length); im.castShadow = shadow; im.receiveShadow = true;
        list.forEach((it, i) => { dummy.position.set(it[0], it[1], it[2]); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); fn && fn(dummy, it, i, im); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
        im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.computeBoundingSphere(); group.add(im);
      }
      return true;
    };
    const merge = (parts) => { // fusion simple de géométries indexées
      const p = [], n = [], u = [], idx = []; let off = 0;
      for (const g0 of parts) { const g = g0.index ? g0 : g0.toNonIndexed(); const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
        for (let i = 0; i < pa.count; i++) { p.push(pa.getX(i), pa.getY(i), pa.getZ(i)); n.push(na.getX(i), na.getY(i), na.getZ(i)); u.push(ua ? ua.getX(i) : 0, ua ? ua.getY(i) : 0); }
        if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + off); else for (let i = 0; i < pa.count; i++) idx.push(i + off);
        off += pa.count; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setIndex(idx); return g;
    };
    const tr = (g, x, y, z, rx = 0, ry = 0, rz = 0) => { g.rotateX(rx); g.rotateZ(rz); g.rotateY(ry); g.translate(x, y, z); return g; };
    const sy = (d, it) => { d.rotation.y = it[4] || 0; d.scale.setScalar(it[3] || 1); };
    // palmiers
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, 2.5, 0), new THREE.Vector3(0.7, 5.2, 0), new THREE.Vector3(1.0, 7.6, 0)]);
    const trunk = new THREE.TubeGeometry(curve, 8, 0.2, 6);
    const lc = document.createElement('canvas'); lc.width = 64; lc.height = 256; const lg = lc.getContext('2d');
    lg.strokeStyle = '#3f6b2a'; lg.lineWidth = 3; lg.beginPath(); lg.moveTo(32, 0); lg.lineTo(32, 256); lg.stroke();
    for (let y = 6; y < 250; y += 7) { const w = 30 * Math.sin((y / 256) * Math.PI * 0.9 + 0.25); lg.strokeStyle = y % 2 ? '#2f6b22' : '#4b8a2c'; lg.lineWidth = 4; lg.beginPath(); lg.moveTo(32, y); lg.lineTo(32 - w, y + 16); lg.moveTo(32, y); lg.lineTo(32 + w, y + 16); lg.stroke(); }
    const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
    const fronds = [];
    for (let k = 0; k < 11; k++) { const g = new THREE.PlaneGeometry(1.5, 4.2, 1, 6); g.translate(0, 2.1, 0); const pa = g.attributes.position; const droop = 0.75 + (k % 3) * 0.3;
      for (let i = 0; i < pa.count; i++) { const t = pa.getY(i) / 4.2; pa.setZ(i, -droop * t * t * 2.2); pa.setY(i, pa.getY(i) * (1 - 0.25 * t * droop)); }
      g.computeVertexNormals(); g.rotateX(Math.PI / 2 - 0.12 - (k % 3) * 0.3); g.rotateY(k * (Math.PI * 2 / 11)); g.translate(1.0, 7.6, 0); fronds.push(g); }
    place(trunk, new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: 1 }), this.inst.palm, sy);
    place(merge(fronds), new THREE.MeshStandardMaterial({ map: lt, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.9 }), this.inst.palm, sy);
    // arbres feuillus
    const tt = new THREE.CylinderGeometry(0.22, 0.34, 3.4, 7); tt.translate(0, 1.7, 0);
    const blobs = []; const r2 = rng32(5);
    for (let k = 0; k < 5; k++) { const g = new THREE.IcosahedronGeometry(1.5 + r2() * 0.9, 1); const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const f = 0.85 + ((Math.sin(pa.getX(i) * 12.9 + pa.getY(i) * 78.2 + pa.getZ(i) * 37.7) * 43758.5) % 1 + 1) % 1 * 0.3; pa.setXYZ(i, pa.getX(i) * f, pa.getY(i) * f * 0.8, pa.getZ(i) * f); } g.translate((r2() - 0.5) * 3.2, 4.2 + r2() * 1.8, (r2() - 0.5) * 3.2); { const na = g.attributes.normal, pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const v = new THREE.Vector3(pp.getX(i), pp.getY(i) - 4.6, pp.getZ(i)).normalize(); na.setXYZ(i, v.x, v.y * 0.6 + 0.4, v.z); } } blobs.push(g); }
    place(tt, new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 }), this.inst.tree, sy);
    place(merge(blobs), new THREE.MeshStandardMaterial({ color: this.cfg.tree === 'leaf' ? 0x47702f : 0x2c5f27, roughness: 1 }), this.inst.tree, sy);
    // lampadaires
    const pole = merge([tr(new THREE.CylinderGeometry(0.07, 0.1, 7, 6), 0, 3.5, 0), tr(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), -1.0, 6.95, 0, 0, 0, Math.PI / 2)]);
    const ry = (d, it) => { d.rotation.y = it[3] || 0; };
    place(pole, this.mat('metal:#5b6066'), this.inst.lamp, ry, false);
    this.lampMat = new THREE.MeshStandardMaterial({ color: 0xfff2cc, emissive: 0xffd98a, emissiveIntensity: 0 });
    place(tr(new THREE.BoxGeometry(0.7, 0.12, 0.28), -1.9, 6.9, 0), this.lampMat, this.inst.lamp, ry, false);
    // bancs
    const bench = merge([tr(new THREE.BoxGeometry(1, 0.08, 0.45), 0, 0.45, 0), tr(new THREE.BoxGeometry(1, 0.45, 0.07), 0, 0.72, -0.2), tr(new THREE.BoxGeometry(0.06, 0.45, 0.4), -0.45, 0.22, 0), tr(new THREE.BoxGeometry(0.06, 0.45, 0.4), 0.45, 0.22, 0)]);
    place(bench, new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.8 }), this.inst.bench, (d, it) => { d.rotation.y = it[3] || 0; d.scale.set((it[4] || 0.9) * 2, 1, 1); });
    // étals de marché
    const table = merge([tr(new THREE.BoxGeometry(3.2, 0.1, 1.6), 0, 0.85, 0), ...[[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]].map(([x, z]) => tr(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 5), x, 1.3, z))]);
    place(table, new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.9 }), this.inst.stall, (d, it) => { d.rotation.y = it[4]; });
    const roofG = tr(new THREE.BoxGeometry(3.8, 0.06, 2.4), 0, 2.65, 0.1, 0.12);
    const rim = place(roofG, new THREE.MeshStandardMaterial({ map: ptex('tin_d', true), roughness: 0.6, metalness: 0.3 }), this.inst.stall, (d, it, i, im) => { d.rotation.y = it[4]; im.setColorAt(i, new THREE.Color(it[3])); });
    const goods = []; const gcol = [0xc0392b, 0xe67e22, 0xf1c40f, 0x27ae60, 0x8e5a2b, 0xf5f5dc]; const gl = [];
    this.inst.stall.forEach((s, si) => { for (let k = 0; k < 4; k++) { const lx = -1.2 + k * 0.8, lz = (si + k) % 2 ? 0.25 : -0.2, c = Math.cos(s[4]), sn = Math.sin(s[4]); gl.push([s[0] + lx * c + lz * sn, 1.02, s[2] - lx * sn + lz * c, gcol[(si * 3 + k) % gcol.length]]); } });
    place(new THREE.SphereGeometry(0.3, 8, 6, 0, 6.3, 0, Math.PI / 2).scale(1, 0.9, 1.3), new THREE.MeshStandardMaterial({ roughness: 0.8 }), gl, (d, it, i, im) => { im.setColorAt(i, new THREE.Color(it[3])); }, false);
    // réservoirs d'eau sur les toits
    if (this.inst.tank.length) place(tr(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 12), 0, 0.8, 0), new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.5 }), this.inst.tank, null);
  }


  // ---------- Requêtes ----------
  shoreZ(x) { const s = this.shore; if (!s) return 1e9; let i = 0; while (i < s.length - 2 && s[i + 1][0] < x) i++; const a = s[i], b = s[i + 1], t = Math.max(0, Math.min(1, (x - a[0]) / ((b[0] - a[0]) || 1))); return a[1] + (b[1] - a[1]) * t; }
  groundY(x, z) { if (!this.shore) return 0; const d = z - (this.shoreZ(x) - 70); return d <= 0 ? 0 : -0.35 * Math.min(1, d / 76); }
  inside(x, z) { const l = this.polyGrid.get(key(x, z)); if (l) for (const p of l) if (pip(p, x, z)) return true; return false; }
  segDist(x, z, r) { // distance minimale aux murs (bornée par r)
    let best = r * r; const gx = Math.floor(x / CELL), gz = Math.floor(z / CELL);
    for (let a = gx - 1; a <= gx + 1; a++) for (let b = gz - 1; b <= gz + 1; b++) { const l = this.segGrid.get(a + ',' + b); if (!l) continue;
      for (const s of l) { const dx = s[2] - s[0], dz = s[3] - s[1], L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - s[0]) * dx + (z - s[1]) * dz) / L2)), ex = x - s[0] - dx * t, ez = z - s[1] - dz * t, d2 = ex * ex + ez * ez; if (d2 < best) best = d2; } }
    return Math.sqrt(best);
  }
  free(x, z, r = 0.6) { return this.segDist(x, z, r) >= r && !this.inside(x, z) && (!this.shore || z < this.shoreZ(x) - 1); }
  freeNear(x, z, r = 0.8) { if (this.free(x, z, r)) return { x, z }; for (let d = 1.5; d < 60; d += 1.5) for (let k = 0; k < 10; k++) { const a = k * 0.628 + d, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (this.free(px, pz, r)) return { x: px, z: pz }; } return { x, z }; }
  // repousse un cercle hors des murs ; renvoie true s'il y a eu contact
  resolve(pos, r) {
    let hit = false;
    for (let it = 0; it < 2; it++) {
      const gx = Math.floor(pos.x / CELL), gz = Math.floor(pos.z / CELL);
      for (let a = gx - 1; a <= gx + 1; a++) for (let b = gz - 1; b <= gz + 1; b++) { const l = this.segGrid.get(a + ',' + b); if (!l) continue;
        for (const s of l) { const dx = s[2] - s[0], dz = s[3] - s[1], L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((pos.x - s[0]) * dx + (pos.z - s[1]) * dz) / L2)), cx = s[0] + dx * t, cz = s[1] + dz * t, ex = pos.x - cx, ez = pos.z - cz, d2 = ex * ex + ez * ez;
          if (d2 < r * r && d2 > 1e-8) { const d = Math.sqrt(d2); pos.x = cx + ex / d * r; pos.z = cz + ez / d * r; hit = true; } } }
    }
    const bd = this.bounds;
    if (pos.x < bd.x0) { pos.x = bd.x0; hit = true; } if (pos.x > bd.x1) { pos.x = bd.x1; hit = true; }
    if (pos.z < bd.z0) { pos.z = bd.z0; hit = true; } if (pos.z > bd.z1) { pos.z = bd.z1; hit = true; }
    if (this.shore) { const sz = this.shoreZ(pos.x) - 1.5; if (pos.z > sz) { pos.z = sz; hit = true; } }
    return hit;
  }
  nodesNear(x, z, r) { const out = [], g = Math.ceil(r / 60), cx = Math.floor(x / 60), cz = Math.floor(z / 60); for (let a = cx - g; a <= cx + g; a++) for (let b = cz - g; b <= cz + g; b++) { const l = this.nodeGrid.get(a + ',' + b); if (l) for (const i of l) { const n = this.nodes[i]; if ((n.x - x) ** 2 + (n.z - z) ** 2 <= r * r) out.push(i); } } return out; }
  nearestNode(x, z, maxCls = 5) { for (let r = 60; r < 1500; r *= 2) { let best = -1, bd = 1e12; for (const i of this.nodesNear(x, z, r)) { const n = this.nodes[i]; if (!n.adj.some(e => e.cls <= maxCls)) continue; const d = (n.x - x) ** 2 + (n.z - z) ** 2; if (d < bd) { bd = d; best = i; } } if (best >= 0) return best; } return 0; }
  onRoad(x, z) { for (const i of this.nodesNear(x, z, 70)) { const n = this.nodes[i]; for (const e of n.adj) { const m = this.nodes[e.to], dx = m.x - n.x, dz = m.z - n.z, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - n.x) * dx + (z - n.z) * dz) / L2)); if (Math.hypot(x - n.x - dx * t, z - n.z - dz * t) < e.w / 2 + 1) return e; } } return null; }
  streetAt(x, z) { let best = '', bd = 30; for (const i of this.nodesNear(x, z, 80)) { const n = this.nodes[i]; for (const e of n.adj) { if (!e.name) continue; const m = this.nodes[e.to], dx = m.x - n.x, dz = m.z - n.z, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - n.x) * dx + (z - n.z) * dz) / L2)), d = Math.hypot(x - n.x - dx * t, z - n.z - dz * t); if (d < bd) { bd = d; best = e.name; } } } return best; }
  // point libre le long d'une rue, près de (x,z)
  roadPoint(x, z, radius, rng = Math.random) {
    const ids = this.nodesNear(x, z, Math.max(radius, 45)).filter(i => this.nodes[i].adj.length);
    for (let t = 0; t < 40 && ids.length; t++) { const n = this.nodes[ids[rng() * ids.length | 0]], e = n.adj[rng() * n.adj.length | 0], m = this.nodes[e.to], u = rng(), dx = m.x - n.x, dz = m.z - n.z, l = Math.hypot(dx, dz) || 1, off = (rng() * 2 - 1) * (e.w / 2 + 1.6);
      const px = n.x + dx * u - dz / l * off, pz = n.z + dz * u + dx / l * off; if (Math.hypot(px - x, pz - z) <= radius + 12 && this.free(px, pz, 0.8)) return { x: px, z: pz }; }
    return this.freeNear(x, z, 0.8);
  }
  poi(name) { return this.pois[name] || this.pois.landmark; }
  setNight(n) { for (const m of this.nightMats) m.emissiveIntensity = n * 0.9; if (this.lampMat) this.lampMat.emissiveIntensity = n * 3; }
  update(dt, t) {
    if (this.water) { this.water.normalMap.offset.x = t * 0.004; this.water.normalMap.offset.y = t * 0.006; }
    if (this.water2) this.water2.normalMap.offset.x = t * 0.01;
  }
  drawMap() {
    const e = this.ext, sc = 1.6, cv = document.createElement('canvas'); cv.width = Math.ceil((e.x1 - e.x0) / sc); cv.height = Math.ceil((e.z1 - e.z0) / sc);
    const g = cv.getContext('2d'), X = x => (x - e.x0) / sc, Z = z => (z - e.z0) / sc;
    g.fillStyle = '#d9cdb0'; g.fillRect(0, 0, cv.width, cv.height);
    if (this.shore) { g.fillStyle = '#3f8fb5'; g.beginPath(); g.moveTo(0, cv.height); for (const p of this.shore) g.lineTo(X(p[0]), Z(p[1])); g.lineTo(cv.width, cv.height); g.fill(); }
    const poly = (p, k = 1) => { g.beginPath(); for (let i = 0; i < p.length; i += 2) g[i ? 'lineTo' : 'moveTo'](X(p[i] * k), Z(p[i + 1] * k)); g.closePath(); g.fill(); };
    g.fillStyle = '#3f8fb5'; for (const w of this.data.water) poly(w, 0.1);
    g.fillStyle = '#9fc48a'; for (const w of this.data.green) poly(w, 0.1); for (const w of this.data.pitch) poly(w, 0.1);
    g.lineCap = 'round';
    for (const pass of [0, 1]) this.nodes.forEach((n, i) => { for (const ed of n.adj) { if (ed.to > i) continue; const m = this.nodes[ed.to]; g.strokeStyle = pass ? (ed.cls <= 2 ? '#fff' : '#f4f1ea') : '#8d8676'; g.lineWidth = Math.max(1.2, ed.w / sc) + (pass ? 0 : 1.4); g.beginPath(); g.moveTo(X(n.x), Z(n.z)); g.lineTo(X(m.x), Z(m.z)); g.stroke(); } });
    g.fillStyle = '#b89f84'; for (const b of this.data.b) { g.beginPath(); for (let i = 2; i < b.length; i += 2) g[i > 2 ? 'lineTo' : 'moveTo'](X(b[i] / 10), Z(b[i + 1] / 10)); g.closePath(); g.fill(); }
    this.mapCanvas = cv; this.mapScale = sc;
  }
  dispose() {
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { for (const k of ['map', 'emissiveMap']) if (m[k] && m[k].isCanvasTexture) m[k].dispose(); m.dispose(); } });
    this.scene.remove(this.group);
  }
}
