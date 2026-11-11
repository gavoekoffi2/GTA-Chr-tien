// Génération procédurale des villes (Lomé d'abord, puis d'autres villes africaines et européennes).
import * as THREE from 'three';
import { S, L } from './state.js';

export const NX = 7, NZ = 6, P = 76, R = 12, B = P - R, CURB = 0.16;
export const W = NX * P, D = NZ * P;
export const roadX = i => -W / 2 + i * P;
export const roadZ = j => -D / 2 + j * P;

export const CITIES = {
  lome: { name: 'Lomé', country: ['Togo', 'Togo'], seed: 11, water: 'ocean', ground: 'laterite', tree: 'palm', en: false,
    walls: ['#e9d8b4', '#d9b98a', '#f1e7d0', '#c9d6c2', '#e3c0a0', '#cfd8e0'], floors: [1, 4], tall: 0.12, taxi: 0xf2c200, motos: 5, grade: 0,
    sun: [0.62, 0.35], landmark: ["Place de l'Indépendance", 'Independence Square'] },
  cotonou: { name: 'Cotonou', country: ['Bénin', 'Benin'], seed: 23, water: 'ocean', ground: 'laterite', tree: 'palm', en: false,
    walls: ['#f0dcb0', '#e8c79a', '#d6e2d0', '#f3ead8', '#e0b99a'], floors: [1, 4], tall: 0.1, taxi: 0xf2c200, motos: 7, grade: 2,
    sun: [0.6, 1.2], landmark: ["Place de l'Étoile Rouge", 'Red Star Square'] },
  accra: { name: 'Accra', country: ['Ghana', 'Ghana'], seed: 37, water: 'ocean', ground: 'laterite', tree: 'palm', en: true,
    walls: ['#f2e3c3', '#e2c9a3', '#d3dbe6', '#efd9c9', '#cfe0cf'], floors: [1, 5], tall: 0.2, taxi: 0xf28c00, motos: 3, grade: 3,
    sun: [0.7, -0.6], landmark: ["Place de l'Étoile Noire", 'Black Star Square'] },
  abidjan: { name: 'Abidjan', country: ["Côte d'Ivoire", "Côte d'Ivoire"], seed: 41, water: 'ocean', ground: 'pave', tree: 'palm', en: false,
    walls: ['#f4efe4', '#dfe5ea', '#e9d6b8', '#d9c7b0', '#e6e0d2'], floors: [2, 6], tall: 0.38, taxi: 0xe8641b, motos: 2, grade: 4,
    sun: [0.55, 2.4], landmark: ['Le Plateau', 'The Plateau'] },
  lagos: { name: 'Lagos', country: ['Nigeria', 'Nigeria'], seed: 53, water: 'ocean', ground: 'pave', tree: 'palm', en: true,
    walls: ['#efe6d2', '#d8d2c4', '#e4cfae', '#cdd9e2', '#e9ddc9'], floors: [2, 7], tall: 0.42, taxi: 0xf2c200, motos: 5, grade: 5,
    sun: [0.5, 0.9], landmark: ['Place de la Liberté', 'Freedom Park'] },
  paris: { name: 'Paris', country: ['France', 'France'], seed: 67, water: 'river', ground: 'cobble', tree: 'leaf', en: false, style: 'haussmann',
    walls: ['#e9e0cc', '#e2d8c2', '#ece5d5', '#ddd2bb'], floors: [5, 6], tall: 0.04, taxi: 0x202020, motos: 1, grade: 6,
    sun: [0.42, -1.0], landmark: ['Champ de la Tour', 'Tower Field'] },
  london: { name: ['Londres', 'London'], country: ['Royaume-Uni', 'United Kingdom'], seed: 79, water: 'river', ground: 'cobble', tree: 'leaf', en: true, style: 'brick', left: true,
    walls: ['#b9a48c', '#a8927a', '#c9b79e', '#9c8a78'], floors: [3, 5], tall: 0.14, taxi: 0x111111, motos: 1, grade: 6,
    sun: [0.36, 0.4], landmark: ["Place de l'Horloge", 'Clock Square'] },
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

export class World {
  constructor(scene, cityId, quality) {
    this.scene = scene; this.id = cityId; this.cfg = CITIES[cityId]; this.q = quality;
    this.group = new THREE.Group(); scene.add(this.group);
    this.rng = rng32(this.cfg.seed);
    this.buckets = {}; this.mats = {}; this.colliders = []; this.grid = new Map();
    this.pois = {}; this.blocks = []; this.nightMats = []; this.signs = [];
    this.inst = { palm: [], tree: [], lamp: [], bench: [], stall: [] };
    this.river = this.cfg.water === 'river' ? 3 : -1;
    this.bounds = { x0: -W / 2 - 4, x1: W / 2 + 4, z0: -D / 2 - 4, z1: this.cfg.water === 'ocean' ? D / 2 + 46 : D / 2 + 4 };
    this.build();
  }
  cityName() { return L(this.cfg.name); }
  T(fr, en) { return this.cfg.en ? en : fr; }

  mat(key) {
    if (this.mats[key]) return this.mats[key];
    const [type, arg] = key.split(':'); let m;
    const std = (name, o = {}) => new THREE.MeshStandardMaterial({ map: ptex(name + '_d', true), normalMap: ptex(name + '_n'), roughness: 0.95, ...o });
    if (type === 'tex') m = std(arg);
    else if (type === 'plaster') m = std('plaster', { color: arg, roughness: 0.9 });
    else if (type === 'tin') m = std('tin', { color: arg, roughness: 0.55, metalness: 0.5 });
    else if (type === 'flat') m = new THREE.MeshStandardMaterial({ color: arg, roughness: 0.8 });
    else if (type === 'metal') m = new THREE.MeshStandardMaterial({ color: arg, roughness: 0.4, metalness: 0.8 });
    else if (type === 'glow') m = new THREE.MeshStandardMaterial({ color: arg, emissive: arg, emissiveIntensity: 0.0, roughness: 0.5 });
    else if (type === 'facade' || type === 'shop') {
      const [style, color] = arg.split('|');
      const t = type === 'shop' ? shopCanvas(color, this.cfg.en ? SHOPS_EN : SHOPS_FR, this.rng) : facadeCanvas(style, color, this.rng);
      m = new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emap, emissive: 0xffffff, emissiveIntensity: 0, roughness: style === 'glass' ? 0.12 : 0.88, metalness: style === 'glass' ? 0.75 : 0 });
      if (style !== 'glass') m.normalMap = ptex('plaster_n');
      this.nightMats.push(m);
    }
    this.mats[key] = m; return m;
  }
  bk(key) { if (!this.buckets[key]) { this.mat(key); this.buckets[key] = new Bucket(); } return this.buckets[key]; }
  collide(x0, z0, x1, z1, h = 10) { this.colliders.push({ x0, z0, x1, z1, h }); }
  sign(lines, x, y, z, w, h, ry = 0, opts = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: signTexture(lines, opts), roughness: 0.6, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.y = ry; this.group.add(m); return m;
  }

  // ---------- Construction ----------
  build() {
    const cfg = this.cfg, rng = this.rng;
    // sol général
    const gname = 'tex:' + cfg.ground;
    const big = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.MeshStandardMaterial({ map: ptex(cfg.ground + '_d', true).clone(), roughness: 1, color: 0xcccccc }));
    big.material.map.repeat.set(500, 500); big.material.map.needsUpdate = true; big.rotation.x = -Math.PI / 2; big.position.y = -0.06; big.receiveShadow = true; this.group.add(big);
    // routes
    const as = this.bk('tex:asphalt');
    for (let i = 0; i <= NX; i++) as.top(roadX(i) - R / 2, -D / 2 - R / 2, roadX(i) + R / 2, D / 2 + R / 2, 0.0, 6);
    for (let j = 0; j <= NZ; j++) for (let i = 0; i < NX; i++) as.top(roadX(i) + R / 2, roadZ(j) - R / 2, roadX(i + 1) - R / 2, roadZ(j) + R / 2, 0.0, 6);
    this.roadMarks();
    // répartition des pâtés de maisons
    const special = ['church', 'home', 'market', 'hospital', 'school', 'park', 'station', 'orphanage', 'prison', 'stadium'];
    const cells = [];
    for (let bz = 0; bz < NZ; bz++) for (let bx = 0; bx < NX; bx++) if (bz !== this.river && !(bx === 3 && bz === 2)) cells.push([bx, bz]);
    for (let i = cells.length - 1; i > 0; i--) { const j = rng() * (i + 1) | 0;[cells[i], cells[j]] = [cells[j], cells[i]]; }
    // l'église et la maison près du centre pour bien démarrer
    cells.sort((a, b) => 0); const near = cells.filter(c => Math.abs(c[0] - 3) <= 1 && Math.abs(c[1] - 2) <= 1);
    const order = [...near, ...cells.filter(c => !near.includes(c))];
    const types = {}; types['3,2'] = 'landmark';
    special.forEach((t, i) => { types[order[i].join()] = t; });
    order.slice(special.length).forEach(c => { const r = rng(); types[c.join()] = r < cfg.tall ? 'office' : r < 0.55 + cfg.tall / 2 ? 'commercial' : 'residential'; });
    for (let bz = 0; bz < NZ; bz++) for (let bx = 0; bx < NX; bx++) {
      if (bz === this.river) continue;
      const type = types[bx + ',' + bz], cx = roadX(bx) + P / 2, cz = roadZ(bz) + P / 2;
      const blk = { bx, bz, type, cx, cz, x0: cx - B / 2, x1: cx + B / 2, z0: cz - B / 2, z1: cz + B / 2 };
      this.blocks.push(blk);
      this.bk('tex:pave').box(blk.x0, -0.05, blk.z0, blk.x1, CURB, blk.z1, 3, 3);
      this[type](blk);
      if (type !== 'commercial' && type !== 'residential' && type !== 'office') this.pois[type] = { x: cx, z: blk.z1 - 2.2, block: blk, face: Math.PI };
    }
    if (this.river >= 0) this.buildRiver(); else this.buildCoast();
    this.streetFurniture();
    this.outskirts();
    for (const k in this.buckets) { const m = this.buckets[k].mesh(this.mats[k]); if (k.startsWith('tex:asphalt') || k.startsWith('mark')) m.castShadow = false; this.group.add(m); }
    this.buildInstances();
    for (const c of this.colliders) for (let gx = Math.floor(c.x0 / 16); gx <= Math.floor(c.x1 / 16); gx++) for (let gz = Math.floor(c.z0 / 16); gz <= Math.floor(c.z1 / 16); gz++) { const k = gx + ',' + gz; if (!this.grid.has(k)) this.grid.set(k, []); this.grid.get(k).push(c); }
  }

  roadMarks() {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 128; const g = cv.getContext('2d');
    g.clearRect(0, 0, 32, 128); g.fillStyle = 'rgba(235,235,225,0.9)'; g.fillRect(8, 10, 16, 64);
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    this.mats['mark'] = new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const mk = this.buckets['mark'] = new Bucket();
    const zc = document.createElement('canvas'); zc.width = 128; zc.height = 32; const zg = zc.getContext('2d'); zg.fillStyle = 'rgba(240,240,232,0.92)'; for (let k = 0; k < 4; k++) zg.fillRect(k * 32 + 6, 0, 18, 32);
    const zt = new THREE.CanvasTexture(zc); zt.wrapS = zt.wrapT = THREE.RepeatWrapping; zt.colorSpace = THREE.SRGBColorSpace;
    this.mats['zebra'] = new THREE.MeshStandardMaterial({ map: zt, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const zb = this.buckets['zebra'] = new Bucket();
    for (let i = 0; i <= NX; i++) for (let j = 0; j < NZ; j++) {
      const x = roadX(i), z0 = roadZ(j) + R / 2 + 4, z1 = roadZ(j + 1) - R / 2 - 4;
      mk.quad([x - 0.15, 0.02, z1], [x + 0.15, 0.02, z1], [x + 0.15, 0.02, z0], [x - 0.15, 0.02, z0], 0, 0, 1, (z1 - z0) / 6);
      zb.quad([x - R / 2 + 0.5, 0.02, z0 - 0.6], [x + R / 2 - 0.5, 0.02, z0 - 0.6], [x + R / 2 - 0.5, 0.02, z0 - 3.4], [x - R / 2 + 0.5, 0.02, z0 - 3.4], 0, 0, 3.5, 1);
      zb.quad([x - R / 2 + 0.5, 0.02, z1 + 3.4], [x + R / 2 - 0.5, 0.02, z1 + 3.4], [x + R / 2 - 0.5, 0.02, z1 + 0.6], [x - R / 2 + 0.5, 0.02, z1 + 0.6], 0, 0, 3.5, 1);
    }
    for (let j = 0; j <= NZ; j++) for (let i = 0; i < NX; i++) {
      const z = roadZ(j), x0 = roadX(i) + R / 2 + 4, x1 = roadX(i + 1) - R / 2 - 4;
      mk.quad([x0, 0.02, z - 0.15], [x0, 0.02, z + 0.15], [x1, 0.02, z + 0.15], [x1, 0.02, z - 0.15], 0, 0, 1, (x1 - x0) / 6);
    }
  }

  // ---------- Bâtiments ----------
  building(x0, z0, x1, z1, floors, style, color, shops = true) {
    const y0 = CURB, gh = shops ? 3.8 : 0, fh = 3.1, top = y0 + gh + floors * fh;
    if (shops) { const sb = this.bk('shop:x|' + color); const o = (this.rng() * 4 | 0) / 4; const sc = 16;
      sb.quad([x0, y0, z1], [x1, y0, z1], [x1, y0 + gh, z1], [x0, y0 + gh, z1], o, 0, o + (x1 - x0) / sc, 1);
      sb.quad([x1, y0, z0], [x0, y0, z0], [x0, y0 + gh, z0], [x1, y0 + gh, z0], o, 0, o + (x1 - x0) / sc, 1);
      sb.quad([x1, y0, z1], [x1, y0, z0], [x1, y0 + gh, z0], [x1, y0 + gh, z1], o, 0, o + (z1 - z0) / sc, 1);
      sb.quad([x0, y0, z0], [x0, y0, z1], [x0, y0 + gh, z1], [x0, y0 + gh, z0], o, 0, o + (z1 - z0) / sc, 1);
      const aw = this.bk('flat:' + ['#a33327', '#1f5fa8', '#2a6e4a', '#c9a227'][this.rng() * 4 | 0]);
      aw.box(x0 - 1.1, y0 + gh - 0.25, z0 - 1.1, x1 + 1.1, y0 + gh - 0.1, z1 + 1.1); }
    const fb = this.bk(`facade:${style}|${color}`);
    fb.sides(x0, y0 + gh, z0, x1, top, z1, 12.8, 12.4, (this.rng() * 4 | 0) / 4);
    const rf = this.bk('tex:concrete'); rf.top(x0, z0, x1, z1, top, 5);
    const pc = this.bk('plaster:' + shade(color, 0.92)), t = 0.3, ph = 0.9;
    pc.box(x0, top, z0, x1, top + ph, z0 + t); pc.box(x0, top, z1 - t, x1, top + ph, z1); pc.box(x0, top, z0, x0 + t, top + ph, z1); pc.box(x1 - t, top, z0, x1, top + ph, z1);
    if (style === 'haussmann') { const zr = this.bk('metal:#55606a'); zr.hip(x0, z0, x1, z1, top + 0.2, 3.2); }
    else if (floors < 8 && this.rng() < 0.7) this.inst.tank = (this.inst.tank || []).concat([[x0 + 2 + this.rng() * (x1 - x0 - 4), top, z0 + 2 + this.rng() * (z1 - z0 - 4)]]);
    this.collide(x0, z0, x1, z1, top);
  }
  styleFor(floors) { const c = this.cfg; if (c.style) return floors > 9 ? 'glass' : c.style; return floors >= 8 ? (this.rng() < 0.6 ? 'glass' : 'modern') : floors >= 4 && this.rng() < 0.4 ? 'modern' : 'plaster'; }
  wallColor() { return this.cfg.walls[this.rng() * this.cfg.walls.length | 0]; }

  commercial(b) {
    const rng = this.rng, nx = 2 + (rng() < 0.5 ? 1 : 0), nz = 2, m = 3.2, gw = (B - 2 * m) / nx, gd = (B - 2 * m) / nz;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const gap = this.cfg.style ? 0 : rng() * 1.2;
      const x0 = b.x0 + m + i * gw + gap, x1 = b.x0 + m + (i + 1) * gw - gap, z0 = b.z0 + m + j * gd + gap, z1 = b.z0 + m + (j + 1) * gd - gap;
      const [f0, f1] = this.cfg.floors; let fl = f0 + (rng() * (f1 - f0 + 1) | 0);
      if (rng() < this.cfg.tall * 0.5) fl = 8 + (rng() * 6 | 0);
      this.building(x0, z0, x1, z1, fl, this.styleFor(fl), this.wallColor());
    }
  }
  office(b) {
    const rng = this.rng, m = 8;
    const fl = 10 + (rng() * 10 | 0), w = 26 + rng() * 10;
    this.building(b.cx - w / 2, b.cz - w / 2 - 4, b.cx + w / 2, b.cz + w / 2 - 4, fl, rng() < 0.75 ? 'glass' : 'modern', '#dfe5ea', false);
    this.bk('flat:#3a4650').box(b.cx - w / 2 - 0.2, CURB, b.cz - w / 2 - 4.2, b.cx + w / 2 + 0.2, CURB + 4, b.cz + w / 2 - 3.8);
    for (let k = 0; k < 6; k++) this.plant(b.x0 + m + rng() * (B - 2 * m), b.z1 - 5 - rng() * 6, true);
    this.inst.bench.push([b.cx - 8, CURB, b.z1 - 6, 0], [b.cx + 8, CURB, b.z1 - 6, 0]);
  }
  house(x0, z0, x1, z1, color, floors = 1, roofCol) {
    const y0 = CURB, h = floors * 3.0;
    const fb = this.bk(`facade:plaster|${color}`); fb.sides(x0, y0, z0, x1, y0 + h, z1, 12.8, 12.4, (this.rng() * 4 | 0) / 4);
    const rc = roofCol || ['#9c3b2a', '#7d8a94', '#8a4a2c', '#3f6b8a', '#b0b4b6', '#5e7d55'][this.rng() * 6 | 0];
    const rb = this.cfg.water === 'river' ? this.bk('tex:rooftile') : this.bk('tin:' + rc);
    rb.hip(x0 - 0.7, z0 - 0.7, x1 + 0.7, z1 + 0.7, y0 + h, 2.2);
    this.bk('plaster:' + color).top(x0 - 0.7, z0 - 0.7, x1 + 0.7, z1 + 0.7, y0 + h - 0.02);
    this.collide(x0, z0, x1, z1, h + 2);
  }
  yardWall(x0, z0, x1, z1, color, gate = true) {
    const w = this.bk('plaster:' + color), y0 = CURB, h = 2.1, t = 0.25;
    w.box(x0, y0, z0, x1, y0 + h, z0 + t); w.box(x0, y0, z0, x0 + t, y0 + h, z1); w.box(x1 - t, y0, z0, x1, y0 + h, z1);
    this.collide(x0, z0, x1, z0 + t, h); this.collide(x0, z0, x0 + t, z1, h); this.collide(x1 - t, z0, x1, z1, h);
    if (gate) { const gx = (x0 + x1) / 2; w.box(x0, y0, z1 - t, gx - 1.6, y0 + h, z1); w.box(gx + 1.6, y0, z1 - t, x1, y0 + h, z1); this.collide(x0, z1 - t, gx - 1.6, z1, h); this.collide(gx + 1.6, z1 - t, x1, z1, h);
      this.bk('metal:#2d3b45').box(gx - 1.6, y0, z1 - 0.12, gx + 1.6, y0 + 1.9, z1 - 0.04); this.collide(gx - 1.6, z1 - t, gx + 1.6, z1, h); }
  }
  residential(b) {
    const rng = this.rng, m = 3.2, n = 3, g = (B - 2 * m) / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x0 = b.x0 + m + i * g + 0.4, x1 = x0 + g - 0.8, z0 = b.z0 + m + j * g + 0.4, z1 = z0 + g - 0.8;
      if (this.cfg.style) { this.building(x0, z0, x1, z1, 2 + (rng() * 3 | 0), this.cfg.style, this.wallColor(), false); continue; }
      const wc = this.wallColor();
      this.bk('tex:' + (this.cfg.ground === 'laterite' ? 'laterite' : 'concrete')).top(x0, z0, x1, z1, CURB + 0.01, 4);
      this.yardWall(x0, z0, x1, z1, shade(wc, 0.9));
      const hw = 5 + rng() * 2.5, hd = 4 + rng() * 2;
      this.house((x0 + x1) / 2 - hw, (z0 + z1) / 2 - hd - 1, (x0 + x1) / 2 + hw, (z0 + z1) / 2 + hd - 1, wc, rng() < 0.3 ? 2 : 1);
      if (rng() < 0.7) this.plant(x0 + 2.5 + rng() * 3, z1 - 3, false);
    }
  }
  plant(x, z, palmOk = true, y = CURB) {
    if (this.cfg.tree === 'palm' && palmOk && this.rng() < 0.6) this.inst.palm.push([x, y, z, 0.8 + this.rng() * 0.5, this.rng() * 6.28]);
    else this.inst.tree.push([x, y, z, 0.8 + this.rng() * 0.6, this.rng() * 6.28]);
  }
  forecourt(b, key = 'tex:concrete') { this.bk(key).top(b.x0 + 3, b.z0 + 3, b.x1 - 3, b.z1 - 3, CURB + 0.01, 4); }

  park(b) {
    const rng = this.rng; this.forecourt(b, 'tex:grass');
    const p = this.bk('tex:pave'); p.top(b.cx - 2, b.z0 + 3, b.cx + 2, b.z1 - 3, CURB + 0.02, 3); p.top(b.x0 + 3, b.cz - 2, b.x1 - 3, b.cz + 2, CURB + 0.02, 3);
    for (let k = 0; k < 16; k++) { const x = b.x0 + 6 + rng() * (B - 12), z = b.z0 + 6 + rng() * (B - 12); if (Math.abs(x - b.cx) > 4 && Math.abs(z - b.cz) > 4) this.plant(x, z, rng() < 0.4); }
    for (const s of [-1, 1]) { this.inst.bench.push([b.cx + s * 3.2, CURB, b.cz + 12, s * Math.PI / 2], [b.cx + s * 3.2, CURB, b.cz - 12, s * Math.PI / 2]); }
    const f = this.bk('tex:concrete'); f.box(b.cx - 3, CURB, b.cz - 3, b.cx + 3, CURB + 0.6, b.cz + 3); this.collide(b.cx - 3, b.cz - 3, b.cx + 3, b.cz + 3, 1);
    this.bk('flat:#3b88a8').top(b.cx - 2.6, b.cz - 2.6, b.cx + 2.6, b.cz + 2.6, CURB + 0.62);
    this.sign([this.T('JARDIN DE LA PAIX', 'PEACE GARDEN')], b.cx, 3.2, b.z1 - 3, 7, 1.4, 0, { bg: '#1d6b3f' });
    this.posts(b.cx, b.z1 - 3, 7);
  }
  posts(x, z, w, h = 3.4) { const m = this.bk('metal:#4a4f55'); m.box(x - w / 2 - 0.1, CURB, z - 0.08, x - w / 2 + 0.06, h, z + 0.08); m.box(x + w / 2 - 0.06, CURB, z - 0.08, x + w / 2 + 0.1, h, z + 0.08); }

  market(b) {
    const rng = this.rng; this.forecourt(b, 'tex:laterite');
    const cols = ['#c0392b', '#2471a3', '#d4ac0d', '#1e8449', '#ca6f1e', '#7d3c98', '#aeb6bf'];
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
      const x = b.x0 + 9 + i * 11.5, z = b.z0 + 9 + j * 12;
      this.inst.stall.push([x, CURB, z, cols[rng() * cols.length | 0], rng()]);
      this.collide(x - 1.7, z - 1.0, x + 1.7, z + 1.0, 1);
    }
    this.sign([this.T('GRAND MARCHÉ', 'CENTRAL MARKET'), this.cityName().toUpperCase()], b.cx, 5, b.z1 - 3.2, 12, 2.6, 0, { bg: '#b3541e', h: 160 });
    this.posts(b.cx, b.z1 - 3.2, 12, 6.2);
  }
  church(b) {
    // Temple ouvert (piliers + toit), typique des églises d'Afrique de l'Ouest
    this.forecourt(b, 'tex:pave');
    const x0 = b.cx - 14, x1 = b.cx + 14, z0 = b.z0 + 6, z1 = b.z1 - 16, y = CURB, h = 6.5;
    const w = this.bk('plaster:#f4f0e6'), fl = this.bk('flat:#b9a58a'); fl.box(x0 - 1, y, z0 - 1, x1 + 1, y + 0.18, z1 + 1);
    for (let k = 0; k <= 5; k++) for (const x of [x0, x1 - 0.6]) { const z = z0 + k * (z1 - z0 - 0.6) / 5; w.box(x, y, z, x + 0.6, y + h, z + 0.6); this.collide(x, z, x + 0.6, z + 0.6, h); }
    w.box(x0, y, z0, x1, y + h, z0 + 0.5); this.collide(x0, z0, x1, z0 + 0.5, h);
    w.box(x0, y + 4.2, z1 - 0.5, x1, y + h, z1);
    for (const sx of [x0, x1 - 0.5]) { w.box(sx, y, z0, sx + 0.5, y + 1.1, z1); this.collide(sx, z0, sx + 0.5, z1, 1.1); }
    const roof = this.bk('tin:#8e2f25'); roof.hip(x0 - 1.5, z0 - 1.5, x1 + 1.5, z1 + 1.5, y + h, 4.2); this.bk('flat:#e9e2d2').top(x0, z0, x1, z1, y + h - 0.02);
    // clocher + croix
    const tx = b.cx; w.box(tx - 2.2, y + h, z1 - 4.4, tx + 2.2, y + h + 7, z1); this.bk('tin:#8e2f25').hip(tx - 2.6, z1 - 4.8, tx + 2.6, z1 + 0.4, y + h + 7, 3.4);
    const cr = this.bk('flat:#ffffff'); cr.box(tx - 0.14, y + h + 10.2, z1 - 2.3, tx + 0.14, y + h + 13.2, z1 - 2.05); cr.box(tx - 0.95, y + h + 11.9, z1 - 2.3, tx + 0.95, y + h + 12.2, z1 - 2.05);
    // estrade, pupitre, croix, bancs
    fl.box(x0 + 5, y + 0.18, z0 + 0.5, x1 - 5, y + 0.6, z0 + 5); this.collide(b.cx - 0.6, z0 + 3.2, b.cx + 0.6, z0 + 4.2, 1.5);
    this.bk('flat:#5b3a22').box(b.cx - 0.5, y + 0.6, z0 + 3.4, b.cx + 0.5, y + 1.75, z0 + 4.0);
    const wc = this.bk('flat:#5b3a22'); wc.box(b.cx - 0.12, y + 2, z0 + 0.5, b.cx + 0.12, y + 5.4, z0 + 0.7); wc.box(b.cx - 1.0, y + 4.1, z0 + 0.5, b.cx + 1.0, y + 4.35, z0 + 0.7);
    for (let r = 0; r < 6; r++) for (const s of [-1, 1]) { const bx = b.cx + s * 6.2, bz = z0 + 8.5 + r * 3.1; this.inst.bench.push([bx, y + 0.18, bz, Math.PI, 4.2]); this.collide(bx - 4.4, bz - 0.35, bx + 4.4, bz + 0.35, 0.9); }
    this.sign([this.T('ÉGLISE LA LUMIÈRE DU MONDE', 'LIGHT OF THE WORLD CHURCH'), this.T('« Jésus-Christ est Seigneur »', '"Jesus Christ is Lord"')], b.cx, y + 5.35, z1 + 0.03, 14, 2.2, 0, { bg: '#f4f0e6', fg: '#7a1f17', border: '#7a1f17', h: 96, w: 600 });
    for (const s of [-1, 1]) { this.plant(b.cx + s * 21, b.z1 - 8, true); this.plant(b.cx + s * 21, b.cz, false); }
    this.churchSpot = { x: b.cx, z: z0 + 12, altar: { x: b.cx, z: z0 + 6.2 } };
  }
  compound(b, { color, floors = 2, w = 40, d = 18, sign, signBg, roofCol, noCourt }) {
    if (!noCourt) this.forecourt(b, this.cfg.ground === 'laterite' ? 'tex:laterite' : 'tex:concrete');
    const x0 = b.cx - w / 2, z0 = b.z0 + 6;
    this.house(x0, z0, x0 + w, z0 + d, color, floors, roofCol);
    this.bk('flat:#3a2a1c').box(b.cx - 1.1, CURB, z0 + d, b.cx + 1.1, CURB + 2.3, z0 + d + 0.08);
    if (sign) this.sign(sign, b.cx, CURB + floors * 3 - 0.9, z0 + d + 0.75, Math.min(w - 8, 16), 1.7, 0, { bg: signBg || '#124b8a' });
    return { x0, z0, x1: x0 + w, z1: z0 + d };
  }
  hospital(b) {
    this.compound(b, { color: '#f3f4f2', floors: 3, w: 46, d: 22, sign: [this.T('HÔPITAL DE LA COMPASSION', 'COMPASSION HOSPITAL')], signBg: '#b3261e', roofCol: '#7d8a94' });
    const c = this.bk('flat:#c62828'); c.box(b.cx - 0.5, 12.2, b.z0 + 28.1, b.cx + 0.5, 15.2, b.z0 + 28.3); c.box(b.cx - 1.5, 13.2, b.z0 + 28.1, b.cx + 1.5, 14.2, b.z0 + 28.3);
    for (const s of [-1, 1]) { this.plant(b.cx + s * 24, b.z1 - 10, false); this.inst.bench.push([b.cx + s * 9, CURB, b.z1 - 12, Math.PI]); }
  }
  school(b) {
    this.compound(b, { color: '#f1d9a0', floors: 2, w: 50, d: 13, sign: [this.T('ÉCOLE LA SAGESSE', 'WISDOM SCHOOL')], signBg: '#1d6b3f', roofCol: '#9c3b2a' });
    const m = this.bk('metal:#c8ccd0'); m.box(b.cx + 14, CURB, b.cz + 6, b.cx + 14.12, 9, b.cz + 6.12);
    this.bk('flat:#1d7a46').box(b.cx + 14.12, 7.4, b.cz + 6.02, b.cx + 16.4, 8.8, b.cz + 6.08);
    for (let k = 0; k < 4; k++) this.plant(b.x0 + 8 + k * 16, b.z1 - 8, false);
  }
  orphanage(b) {
    this.compound(b, { color: '#f6c9a8', floors: 1, w: 34, d: 14, sign: [this.T("ORPHELINAT LA MAISON DE L'ESPÉRANCE", 'HOUSE OF HOPE ORPHANAGE')], signBg: '#8a3d7a', roofCol: '#3f6b8a' });
    const m = this.bk('metal:#d0a020'); m.box(b.cx - 14, CURB, b.cz + 8, b.cx - 13.9, 2.6, b.cz + 8.1); m.box(b.cx - 10, CURB, b.cz + 8, b.cx - 9.9, 2.6, b.cz + 8.1); m.box(b.cx - 14, 2.5, b.cz + 8, b.cx - 9.9, 2.6, b.cz + 8.1);
    for (let k = 0; k < 3; k++) this.plant(b.cx + 6 + k * 8, b.cz + 10, false);
  }
  prison(b) {
    this.forecourt(b, 'tex:concrete');
    const x0 = b.x0 + 6, x1 = b.x1 - 6, z0 = b.z0 + 6, z1 = b.z1 - 14, w = this.bk('tex:concrete');
    w.box(x0, CURB, z0, x1, 5.2, z1, 4, 4); this.collide(x0, z0, x1, z1, 5.2);
    this.bk('flat:#6f757a').box(x0 + 6, 5.2, z0 + 6, x1 - 6, 8.4, z1 - 6);
    this.bk('metal:#3b4248').box(b.cx - 2, CURB, z1, b.cx + 2, 3.4, z1 + 0.1);
    for (const sx of [x0, x1 - 2.4]) { w.box(sx, 5.2, z1 - 2.4, sx + 2.4, 7.6, z1, 4, 4); }
    this.sign([this.T('MAISON D’ARRÊT', 'CITY PRISON')], b.cx, 4.3, z1 + 0.12, 9, 1.3, 0, { bg: '#2e3439' });
  }
  stadium(b) {
    this.forecourt(b, 'tex:grass');
    const mk = this.bk('flat:#f2f2ee'), x0 = b.x0 + 8, x1 = b.x1 - 8, z0 = b.z0 + 12, z1 = b.z1 - 12, y = CURB + 0.03, t = 0.12;
    mk.top(x0, z0, x1, z0 + t, y); mk.top(x0, z1 - t, x1, z1, y); mk.top(x0, z0, x0 + t, z1, y); mk.top(x1 - t, z0, x1, z1, y); mk.top(b.cx - t / 2, z0, b.cx + t / 2, z1, y);
    const g = this.bk('metal:#f0f0f0');
    for (const gx of [x0, x1]) { g.box(gx - 0.06, CURB, b.cz - 3.66, gx + 0.06, 2.6, b.cz - 3.54); g.box(gx - 0.06, CURB, b.cz + 3.54, gx + 0.06, 2.6, b.cz + 3.66); g.box(gx - 0.06, 2.48, b.cz - 3.66, gx + 0.06, 2.6, b.cz + 3.66); }
    const st = this.bk('tex:concrete'); for (let k = 0; k < 4; k++) st.box(x0, CURB, b.z0 + 3 + k * 1.2, x1, CURB + 0.5 * (4 - k), b.z0 + 4.2 + k * 1.2, 3, 3); this.collide(x0, b.z0 + 3, x1, b.z0 + 7.8, 2);
    this.sign([this.T('TERRAIN DES JEUNES', 'YOUTH PITCH')], b.cx, 3.2, b.z1 - 3, 8, 1.3, 0, { bg: '#1d6b3f' }); this.posts(b.cx, b.z1 - 3, 8);
  }
  station(b) {
    this.forecourt(b, 'tex:asphalt');
    const m = this.bk('metal:#6b7379'), r = this.bk('tin:#3f6b8a'), x0 = b.cx - 20, x1 = b.cx + 20, z0 = b.z0 + 8, z1 = b.z0 + 26;
    for (const x of [x0, b.cx, x1]) for (const z of [z0, z1]) { m.box(x - 0.2, CURB, z - 0.2, x + 0.2, 6, z + 0.2); this.collide(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 6); }
    r.hip(x0 - 2, z0 - 2, x1 + 2, z1 + 2, 6, 1.6);
    this.compound({ ...b, z0: b.z0 + 24 }, { color: '#e6e0d0', floors: 1, w: 22, d: 9, sign: [this.T('GARE ROUTIÈRE & AÉROPORT', 'BUS STATION & AIRPORT')], signBg: '#124b8a', noCourt: true });
    this.parked = [[b.cx - 12, z0 + 9, 0, 'bus'], [b.cx + 12, z0 + 9, 0, 'bus']];
  }
  home(b) {
    const rng = this.rng, m = 3.2, n = 3, g = (B - 2 * m) / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x0 = b.x0 + m + i * g + 0.4, x1 = x0 + g - 0.8, z0 = b.z0 + m + j * g + 0.4, z1 = z0 + g - 0.8;
      const mine = i === 1 && j === 2, wc = mine ? '#f2e2b8' : this.wallColor();
      if (this.cfg.style && !mine) { this.building(x0, z0, x1, z1, 3, this.cfg.style, wc, false); continue; }
      this.bk('tex:' + (this.cfg.ground === 'laterite' ? 'laterite' : 'concrete')).top(x0, z0, x1, z1, CURB + 0.01, 4);
      this.yardWall(x0, z0, x1, z1, shade(wc, 0.9), !mine);
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      this.house(cx - 6.5, cz - 6.5, cx + 6.5, cz + 1.5, wc, mine ? 2 : 1, mine ? '#2f6f9f' : undefined);
      if (mine) {
        this.bk('flat:#4a2f1b').box(cx - 0.7, CURB, cz + 1.5, cx + 0.7, CURB + 2.2, cz + 1.58);
        this.inst.palm.push([x0 + 2.4, CURB, z1 - 3, 1, 1], [x1 - 2.4, CURB, z1 - 3.5, 1.1, 3]);
        this.sign([this.T('MA MAISON', 'MY HOME')], cx, 3.3, cz + 1.62, 3.6, 0.7, 0, { bg: '#2f6f9f', h: 96 });
        this.homeSpot = { x: cx, z: cz + 5 };
      } else if (rng() < 0.7) this.plant(x0 + 3, z1 - 3, false);
    }
  }

  landmark(b) {
    const id = this.id; this.forecourt(b, 'tex:pave');
    const wh = this.bk('plaster:#f5f3ee'), y = CURB, cx = b.cx, cz = b.cz, rng = this.rng;
    const ring = (r, h, key = 'tex:concrete') => { const k = this.bk(key); k.box(cx - r, y, cz - r, cx + r, y + h, cz + r); };
    const add = (m) => { m.castShadow = true; this.group.add(m); return m; };
    const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
    if (id === 'lome') {
      ring(9, 0.5); this.bk('flat:#3b88a8').top(cx - 8.4, cz - 8.4, cx + 8.4, cz + 8.4, y + 0.52);
      wh.box(cx - 7, y, cz - 1, cx - 2.2, y + 15, cz + 1); wh.box(cx + 2.2, y, cz - 1, cx + 7, y + 15, cz + 1); wh.box(cx - 7, y + 12, cz - 1, cx + 7, y + 15, cz + 1);
      const br = std(0x6b4a25, { metalness: 0.7, roughness: 0.35 });
      const body = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 2.6, 4, 10), br)); body.position.set(cx, y + 3.4, cz + 2.4);
      const head = add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), br)); head.position.set(cx, y + 5.6, cz + 2.4);
      for (const s of [-1, 1]) { const arm = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 2.2, 4, 8), br)); arm.position.set(cx + s * 1.1, y + 5.9, cz + 2.4); arm.rotation.z = -s * 0.55; }
      wh.box(cx - 1, y, cz + 1.6, cx + 1, y + 1.6, cz + 3.2);
      this.collide(cx - 9, cz - 9, cx + 9, cz + 9, 15);
    } else if (id === 'cotonou') {
      ring(8, 0.6); const col = add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.5, 22, 12), std(0xf2efe8))); col.position.set(cx, y + 11, cz);
      const s = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + Math.PI / 2, r = k % 2 ? 1.5 : 3.8; s[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
      const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: false }), std(0xc62828))); star.position.set(cx, y + 25, cz - 0.4);
      this.collide(cx - 8, cz - 8, cx + 8, cz + 8, 22);
    } else if (id === 'accra') {
      wh.box(cx - 12, y, cz - 3, cx - 7, y + 14, cz + 3); wh.box(cx + 7, y, cz - 3, cx + 12, y + 14, cz + 3); wh.box(cx - 12, y + 14, cz - 3, cx + 12, y + 18, cz + 3); wh.box(cx - 5, y + 18, cz - 2, cx + 5, y + 20, cz + 2);
      const s = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + Math.PI / 2, r = k % 2 ? 1.1 : 2.8; s[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); }
      const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: false }), std(0x111111))); star.position.set(cx, y + 23, cz - 0.3);
      this.sign(['FREEDOM AND JUSTICE'], cx, y + 16, cz + 3.05, 16, 1.6, 0, { bg: '#f5f3ee', fg: '#222', border: null });
      this.collide(cx - 12, cz - 3, cx - 7, cz + 3, 14); this.collide(cx + 7, cz - 3, cx + 12, cz + 3, 14);
    } else if (id === 'abidjan') {
      ring(10, 0.4); const m = std(0xf7f7f4);
      for (const s of [-1, 1]) { const leg = add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 34, 2.2), m)); leg.position.set(cx + s * 4.6, y + 16, cz); leg.rotation.z = s * 0.27; }
      const cross = add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 1.2), m)); cross.position.set(cx, y + 36, cz); const bar = add(new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.2, 1.2), m)); bar.position.set(cx, y + 37.5, cz);
      this.collide(cx - 10, cz - 10, cx + 10, cz + 10, 30);
    } else if (id === 'lagos') {
      ring(7, 0.5); const t = add(new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.5, 46, 20), new THREE.MeshStandardMaterial({ color: 0x7fa6c0, metalness: 0.8, roughness: 0.15 }))); t.position.set(cx, y + 23, cz);
      const cap = add(new THREE.Mesh(new THREE.CylinderGeometry(6.5, 4.5, 3, 20), std(0xf0f0f0))); cap.position.set(cx, y + 47.5, cz);
      this.sign(['LAGOS'], cx, y + 3.2, cz + 12, 14, 3.6, 0, { bg: '#0b6b3a', h: 140 });
      this.collide(cx - 7, cz - 7, cx + 7, cz + 7, 46);
    } else if (id === 'paris') {
      const iron = std(0x5a4a3a, { metalness: 0.6, roughness: 0.5 }); const H = 62;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10, r = 15 * Math.pow(1 - t, 2.2) + 0.5; pts.push(new THREE.Vector3(cx + sx * r, y + t * H, cz + sz * r)); }
        add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.9, 6), iron));
        this.collide(cx + sx * 15 - 2, cz + sz * 15 - 2, cx + sx * 15 + 2, cz + sz * 15 + 2, 10);
      }
      for (const [h, r] of [[10, 11], [24, 6], [44, 2.6]]) { const pl = add(new THREE.Mesh(new THREE.BoxGeometry(r * 2, 1.4, r * 2), iron)); pl.position.set(cx, y + h, cz); }
      const sp = add(new THREE.Mesh(new THREE.ConeGeometry(0.9, 14, 6), iron)); sp.position.set(cx, y + H + 6, cz);
    } else if (id === 'london') {
      const st = this.bk('plaster:#c9b58c'); st.box(cx - 4, y, cz - 4, cx + 4, y + 38, cz + 4, 4, 4);
      for (const [dx, dz, ry] of [[0, 4.06, 0], [0, -4.06, Math.PI], [4.06, 0, Math.PI / 2], [-4.06, 0, -Math.PI / 2]]) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = '#f4f0e0'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 8; g.stroke();
        for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); g.lineTo(128 + Math.cos(a) * 114, 128 + Math.sin(a) * 114); g.stroke(); }
        g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 50); g.moveTo(128, 128); g.lineTo(180, 150); g.stroke();
        const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
        const c = new THREE.Mesh(new THREE.CircleGeometry(3, 32), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.15 })); c.position.set(cx + dx, y + 32, cz + dz); c.rotation.y = ry; this.group.add(c);
      }
      this.bk('metal:#3a4046').hip(cx - 4.5, cz - 4.5, cx + 4.5, cz + 4.5, y + 38, 12);
      this.collide(cx - 4, cz - 4, cx + 4, cz + 4, 38);
    }
    this.sign([L(this.cfg.landmark).toUpperCase(), this.cityName().toUpperCase() + ' — ' + L(this.cfg.country).toUpperCase()], cx, 2.6, b.z1 - 3.2, 12, 2.2, 0, { bg: '#1c2b3a', h: 150 });
    this.posts(cx, b.z1 - 3.2, 12, 3.8);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { this.plant(cx + sx * 26, cz + sz * 22, true); this.inst.bench.push([cx + sx * 14, y, cz + 22, Math.PI]); }
  }

  buildCoast() {
    const z0 = D / 2 + R / 2, sand = this.bk('tex:sand');
    sand.top(-W / 2 - 300, z0, W / 2 + 300, z0 + 70, -0.02, 5);
    const wm = new THREE.MeshStandardMaterial({ color: 0x1f7f9c, roughness: 0.12, metalness: 0.55, normalMap: ptex('water_n').clone(), transparent: true, opacity: 0.94 });
    wm.normalMap.repeat.set(60, 60); wm.normalMap.needsUpdate = true; wm.normalScale.set(0.6, 0.6);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(3000, 1500), wm); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.12, z0 + 52 + 750); sea.receiveShadow = true; this.group.add(sea); this.water = wm;
    const foam = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, roughness: 1 })); foam.rotation.x = -Math.PI / 2; foam.position.set(0, 0.13, z0 + 52.5); this.group.add(foam); this.foam = foam;
    for (let x = -W / 2; x < W / 2; x += 9 + this.rng() * 8) this.inst.palm.push([x, 0, z0 + 5 + this.rng() * 22, 0.9 + this.rng() * 0.6, this.rng() * 6.28]);
    const cols = [0xc0392b, 0x1f618d, 0xf1c40f, 0x117a65];
    for (let k = 0; k < 7; k++) {
      const g = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); g.scale(1.0, 0.8, 5.2);
      const boat = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: cols[k % 4], roughness: 0.7, side: THREE.DoubleSide }));
      const x = -W / 2 + 40 + k * 70 + this.rng() * 20, z = z0 + 34 + this.rng() * 8; boat.position.set(x, 0.75, z); boat.rotation.y = 1.2 + this.rng() * 0.7; boat.castShadow = true; this.group.add(boat);
      this.collide(x - 3.5, z - 2.5, x + 3.5, z + 2.5, 1);
    }
    this.pois.beach = { x: 0, z: z0 + 30, face: 0 };
  }
  buildRiver() {
    const j = this.river, z0 = roadZ(j) + R / 2, z1 = roadZ(j + 1) - R / 2;
    const wm = new THREE.MeshStandardMaterial({ color: 0x3f6f6a, roughness: 0.15, metalness: 0.5, normalMap: ptex('water_n').clone() }); wm.normalMap.repeat.set(40, 4); wm.normalMap.needsUpdate = true;
    const riv = new THREE.Mesh(new THREE.PlaneGeometry(3000, z1 - z0), wm); riv.rotation.x = -Math.PI / 2; riv.position.set(0, -1.6, (z0 + z1) / 2); this.group.add(riv); this.water = wm;
    const q = this.bk('tex:concrete');
    q.quad([-1500, -3, z0], [1500, -3, z0], [1500, 0, z0], [-1500, 0, z0], 0, 0, 600, 1); q.quad([1500, -3, z1], [-1500, -3, z1], [-1500, 0, z1], [1500, 0, z1], 0, 0, 600, 1);
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(3000, z1 - z0 + 2), new THREE.MeshBasicMaterial({ color: 0x1a2a2a })); dark.rotation.x = -Math.PI / 2; dark.position.set(0, -3, (z0 + z1) / 2); this.group.add(dark);
    this.group.children[0].position.y = -0.06; // sol
    const hole = this.bk('flat:#000000'); // (le sol général est masqué par le quai)
    for (let i = 0; i <= NX; i++) {
      const x = roadX(i); q.box(x - R / 2 - 0.4, -1.0, z0, x + R / 2 + 0.4, -0.02, z1, 4, 4);
      const rl = this.bk('plaster:#d8d2c2'); rl.box(x - R / 2 - 0.4, 0, z0, x - R / 2, 1.1, z1); rl.box(x + R / 2, 0, z0, x + R / 2 + 0.4, 1.1, z1);
      this.collide(x - R / 2 - 0.6, z0, x - R / 2, z1, 1.1); this.collide(x + R / 2, z0, x + R / 2 + 0.6, z1, 1.1);
      if (i < NX) { this.collide(x + R / 2, z0 + 0.2, roadX(i + 1) - R / 2, z1 - 0.2, 0.1); const rr = this.bk('plaster:#d8d2c2'); rr.box(x + R / 2, 0, z0, roadX(i + 1) - R / 2, 1.0, z0 + 0.35); rr.box(x + R / 2, 0, z1 - 0.35, roadX(i + 1) - R / 2, 1.0, z1); }
    }
    this.collide(-1500, z0, -W / 2 - R / 2, z1, 1); this.collide(W / 2 + R / 2, z0, 1500, z1, 1);
    this.riverZ = [z0, z1];
    this.pois.beach = { x: roadX(3) + P / 2, z: roadZ(j) - R / 2 - 3, face: 0 };
    // le sol général ne doit pas couvrir la rivière : on le découpe en deux bandes
    const base = this.group.children[0]; this.group.remove(base);
    for (const [a, c] of [[-1500, z0], [z1, 1500]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3000, c - a), base.material); m.rotation.x = -Math.PI / 2; m.position.set(0, -0.06, (a + c) / 2); m.receiveShadow = true; this.group.add(m); }
  }

  streetFurniture() {
    const rng = this.rng;
    for (const b of this.blocks) {
      for (let k = 0; k < 2; k++) { this.inst.lamp.push([b.x0 + 1.0, CURB, b.z0 + 14 + k * 36, 0], [b.x1 - 1.0, CURB, b.z0 + 14 + k * 36, Math.PI], [b.x0 + 14 + k * 36, CURB, b.z0 + 1.0, -Math.PI / 2], [b.x0 + 14 + k * 36, CURB, b.z1 - 1.0, Math.PI / 2]); }
      if (b.type === 'commercial' || b.type === 'office') for (let k = 0; k < 3; k++) if (rng() < 0.6) this.plant(b.x0 + 1.4, b.z0 + 8 + k * 22 + rng() * 4, true);
    }
    // panneaux avec des versets le long des rues
    const en = S.lang === 'en';
    BILLBOARDS.forEach((bb, k) => {
      const b = this.blocks[(k * 5 + 2) % this.blocks.length]; const x = b.x1 - 1.3, z = b.z0 + 24 + (k % 3) * 6;
      const m = this.sign(en ? bb[1] : bb[0], x, 6.4, z, 7.5, 3.2, Math.PI / 2, { bg: ['#12324f', '#4a1f4f', '#0f4a3a', '#5a2a12'][k % 4], h: 220, w: 512, border: '#f5c542' });
      const p = this.bk('metal:#4a4f55'); p.box(x - 0.15, CURB, z - 0.15, x + 0.15, 4.8, z + 0.15); this.collide(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 5);
      const back = m.clone(); back.material = this.mat('metal:#4a4f55'); back.position.x -= 0.04; back.rotation.y = -Math.PI / 2; this.group.add(back); m.position.x += 0.02;
    });
  }
  outskirts() {
    // ceinture de maisons au-delà des limites, sans collisions (on ne peut pas y aller)
    const rng = this.rng, add = (x, z) => {
      const w = 5 + rng() * 6, d = 4 + rng() * 5, c = this.wallColor();
      if (this.cfg.style) { const fl = 3 + (rng() * 3 | 0); this.bk(`facade:${this.cfg.style}|${c}`).sides(x - w, 0, z - d, x + w, fl * 3.1, z + d, 12.8, 12.4); this.bk('metal:#55606a').hip(x - w, z - d, x + w, z + d, fl * 3.1, 3); }
      else { this.bk(`facade:plaster|${c}`).sides(x - w, 0, z - d, x + w, 3.2, z + d, 12.8, 12.4); this.bk('tin:' + ['#9c3b2a', '#7d8a94', '#8a4a2c'][rng() * 3 | 0]).hip(x - w - 0.6, z - d - 0.6, x + w + 0.6, z + d + 0.6, 3.2, 2); }
      if (rng() < 0.5) this.plant(x + w + 3, z, true, 0);
    };
    for (let ring = 0; ring < 3; ring++) {
      const off = 18 + ring * 26;
      for (let x = -W / 2 - off; x <= W / 2 + off; x += 24) { add(x + rng() * 6, -D / 2 - off - rng() * 6); if (this.cfg.water !== 'ocean') add(x + rng() * 6, D / 2 + off + rng() * 6); }
      for (let z = -D / 2 - off; z <= D / 2 + (this.cfg.water === 'ocean' ? -10 : off); z += 24) { if (this.riverZ && z > this.riverZ[0] - 14 && z < this.riverZ[1] + 14) continue; add(-W / 2 - off - rng() * 6, z + rng() * 6); add(W / 2 + off + rng() * 6, z + rng() * 6); }
    }
  }

  buildInstances() {
    const dummy = new THREE.Object3D(), group = this.group;
    const place = (geo, mat, list, fn, shadow = true) => {
      if (!list.length) return null;
      const im = new THREE.InstancedMesh(geo, mat, list.length); im.castShadow = shadow; im.receiveShadow = true;
      list.forEach((it, i) => { dummy.position.set(it[0], it[1], it[2]); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); fn && fn(dummy, it, i, im); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; group.add(im); return im;
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
    for (let k = 0; k < 7; k++) { const g = new THREE.IcosahedronGeometry(1.5 + r2() * 0.9, 2); const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const f = 0.85 + ((Math.sin(pa.getX(i) * 12.9 + pa.getY(i) * 78.2 + pa.getZ(i) * 37.7) * 43758.5) % 1 + 1) % 1 * 0.3; pa.setXYZ(i, pa.getX(i) * f, pa.getY(i) * f * 0.8, pa.getZ(i) * f); } g.translate((r2() - 0.5) * 3.2, 4.2 + r2() * 1.8, (r2() - 0.5) * 3.2); { const na = g.attributes.normal, pp = g.attributes.position; for (let i = 0; i < pp.count; i++) { const v = new THREE.Vector3(pp.getX(i), pp.getY(i) - 4.6, pp.getZ(i)).normalize(); na.setXYZ(i, v.x, v.y * 0.6 + 0.4, v.z); } } blobs.push(g); }
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
    place(table, new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.9 }), this.inst.stall, null);
    const roofG = tr(new THREE.BoxGeometry(3.8, 0.06, 2.4), 0, 2.65, 0.1, 0.12);
    const rim = place(roofG, new THREE.MeshStandardMaterial({ map: ptex('tin_d', true), roughness: 0.6, metalness: 0.3 }), this.inst.stall, (d, it, i, im) => { im.setColorAt(i, new THREE.Color(it[3])); });
    const goods = []; const gcol = [0xc0392b, 0xe67e22, 0xf1c40f, 0x27ae60, 0x8e5a2b, 0xf5f5dc]; const gl = [];
    this.inst.stall.forEach((s, si) => { for (let k = 0; k < 4; k++) gl.push([s[0] - 1.2 + k * 0.8, s[1] + 1.02, s[2] + ((si + k) % 2 ? 0.25 : -0.2), gcol[(si * 3 + k) % gcol.length]]); });
    place(new THREE.SphereGeometry(0.3, 8, 6, 0, 6.3, 0, Math.PI / 2).scale(1, 0.9, 1.3), new THREE.MeshStandardMaterial({ roughness: 0.8 }), gl, (d, it, i, im) => { im.setColorAt(i, new THREE.Color(it[3])); }, false);
    // réservoirs d'eau sur les toits
    if (this.inst.tank) place(tr(new THREE.CylinderGeometry(0.9, 0.9, 1.6, 12), 0, 0.8, 0), new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.5 }), this.inst.tank, null);
  }

  // ---------- Requêtes ----------
  blockAt(x, z) { for (const b of this.blocks) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1) return b; return null; }
  groundY(x, z) { return this.blockAt(x, z) ? CURB : 0; }
  // repousse un cercle hors des obstacles ; renvoie true s'il y a eu contact
  resolve(pos, r, maxH = 0) {
    let hit = false; const gx = Math.floor(pos.x / 16), gz = Math.floor(pos.z / 16);
    for (let a = gx - 1; a <= gx + 1; a++) for (let b = gz - 1; b <= gz + 1; b++) {
      const list = this.grid.get(a + ',' + b); if (!list) continue;
      for (const c of list) {
        if (c.h <= maxH) continue;
        const nx = Math.max(c.x0, Math.min(pos.x, c.x1)), nz = Math.max(c.z0, Math.min(pos.z, c.z1));
        let dx = pos.x - nx, dz = pos.z - nz; const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue; hit = true;
        if (d2 > 1e-6) { const d = Math.sqrt(d2); pos.x = nx + dx / d * r; pos.z = nz + dz / d * r; }
        else { const l = pos.x - c.x0, rr = c.x1 - pos.x, t = pos.z - c.z0, bb = c.z1 - pos.z, m = Math.min(l, rr, t, bb); if (m === l) pos.x = c.x0 - r; else if (m === rr) pos.x = c.x1 + r; else if (m === t) pos.z = c.z0 - r; else pos.z = c.z1 + r; }
      }
    }
    const bd = this.bounds;
    if (pos.x < bd.x0) { pos.x = bd.x0; hit = true; } if (pos.x > bd.x1) { pos.x = bd.x1; hit = true; }
    if (pos.z < bd.z0) { pos.z = bd.z0; hit = true; } if (pos.z > bd.z1) { pos.z = bd.z1; hit = true; }
    return hit;
  }
  free(x, z, r = 0.6) { const p = { x, z }; return !this.resolve(p, r); }
  // point libre sur un trottoir
  sidewalkPoint(rng = Math.random) {
    for (let t = 0; t < 30; t++) {
      const b = this.blocks[rng() * this.blocks.length | 0], side = rng() * 4 | 0, u = 4 + rng() * (B - 8);
      const p = side === 0 ? [b.x0 + u, b.z0 + 1.6] : side === 1 ? [b.x0 + u, b.z1 - 1.6] : side === 2 ? [b.x0 + 1.6, b.z0 + u] : [b.x1 - 1.6, b.z0 + u];
      if (this.free(p[0], p[1], 0.7)) return { x: p[0], z: p[1], block: b };
    }
    return { x: 0, z: roadZ(0), block: this.blocks[0] };
  }
  poi(name) { return this.pois[name] || this.pois.landmark; }
  setNight(n) {
    for (const m of this.nightMats) m.emissiveIntensity = n * 0.9;
    if (this.lampMat) this.lampMat.emissiveIntensity = n * 3;
  }
  update(dt, t) {
    if (this.water) { this.water.normalMap.offset.x = t * 0.008; this.water.normalMap.offset.y = t * 0.012; }
    if (this.foam) { this.foam.position.z = D / 2 + R / 2 + 52.3 + Math.sin(t * 0.7) * 0.6; this.foam.material.opacity = 0.45 + Math.sin(t * 0.7) * 0.25; }
  }
  dispose() {
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { for (const k of ['map', 'emissiveMap']) if (m[k] && m[k].isCanvasTexture) m[k].dispose(); m.dispose(); } });
    this.scene.remove(this.group);
  }
}
