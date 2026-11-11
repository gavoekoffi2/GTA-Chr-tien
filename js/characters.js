// Chargement des personnages 3D (avatars Microsoft Rocketbox, licence MIT) et de leurs animations.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const cache = new Map();
let animData = null;
const clipCache = new Map();

export const CHARACTERS = {
  kofi:    { file: 'Male_Adult_12', g: 'm', playable: true },
  yao:     { file: 'Male_Adult_18', g: 'm', playable: true },
  mensah:  { file: 'Business_Male_05', g: 'm', playable: true },
  edem:    { file: 'Male_Adult_04', g: 'm', playable: true },
  kodjo:   { file: 'Wood_Male_01', g: 'm', playable: true },
  ama:     { file: 'Business_Female_01', g: 'f', playable: true },
  afi:     { file: 'Pilot_Female_02', g: 'f', playable: true, extra: ['hat'] },
  esi:     { file: 'Female_Adult_11', g: 'f', playable: true },
  akou:    { file: 'Medical_Female_01', g: 'f', playable: true },
  sena:    { file: 'Female_Party_02', g: 'f' },
  ouvrier: { file: 'Construction_Male_03', g: 'm', extra: ['helmet', 'tools'] },
  sportif: { file: 'Sports_Male_03', g: 'm' },
  jeune:   { file: 'Male_Adult_17', g: 'm' },
  enfant:  { file: 'Male_Child_02', g: 'm' },
};

function tex(url, srgb = true) {
  const t = texLoader.load(url);
  t.flipY = false;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export async function loadAnimations() {
  if (animData) return animData;
  const [meta, bin] = await Promise.all([
    fetch('assets/anims.json').then(r => r.json()),
    fetch('assets/anims.bin').then(r => r.arrayBuffer()),
  ]);
  animData = { meta, bin };
  return animData;
}

const IN_PLACE = /walk|run/;
function getClip(name, hipScale) {
  const key = name + '|' + hipScale.toFixed(2);
  if (clipCache.has(key)) return clipCache.get(key);
  const { meta, bin } = animData;
  const c = meta.clips[name];
  if (!c) return null;
  const nj = meta.joints.length, nf = c.nf;
  const q = new Int16Array(bin, c.q, nf * nj * 4);
  const p = new Float32Array(bin.slice(c.p, c.p + nf * 12));
  const times = new Float32Array(nf);
  for (let i = 0; i < nf; i++) times[i] = i / meta.fps;
  const tracks = [];
  meta.joints.forEach((jn, ji) => {
    const v = new Float32Array(nf * 4);
    for (let f = 0; f < nf; f++) for (let k = 0; k < 4; k++) v[f * 4 + k] = q[(f * nj + ji) * 4 + k] / 32767;
    tracks.push(new THREE.QuaternionKeyframeTrack(jn.replace(/ /g, '_') + '.quaternion', times, v));
  });
  const pos = new Float32Array(nf * 3);
  const inPlace = IN_PLACE.test(name);
  for (let f = 0; f < nf; f++) {
    pos[f * 3] = inPlace ? 0 : p[f * 3] * hipScale;
    pos[f * 3 + 1] = p[f * 3 + 1] * hipScale;
    pos[f * 3 + 2] = inPlace ? 0 : p[f * 3 + 2] * hipScale;
  }
  tracks.push(new THREE.VectorKeyframeTrack('Bip01.position', times, pos));
  const clip = new THREE.AnimationClip(name, -1, tracks);
  clipCache.set(key, clip);
  return clip;
}

async function loadBase(id) {
  if (cache.has(id)) return cache.get(id);
  const def = CHARACTERS[id];
  const p = (async () => {
    const gltf = await loader.loadAsync(`assets/chars/${def.file}.glb`);
    const base = `assets/chars/${def.file}`;
    gltf.scene.traverse(o => {
      if (o.name.startsWith('Bip02')) o.name = o.name.replace('Bip02', 'Bip01');
      if (!o.isMesh) return;
      o.castShadow = true;
      o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const out = mats.map(m => {
        const n = m.name.toLowerCase();
        let kind = 'body';
        for (const k of ['head', 'opacity', 'helmet', 'hat', 'tools']) if (n.includes(k)) kind = k;
        const mat = new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0, name: kind });
        if (kind === 'opacity') {
          mat.map = tex(`${base}_opacity.png`);
          mat.transparent = false; mat.alphaTest = 0.4; mat.side = THREE.DoubleSide;
        } else mat.map = tex(`${base}_${kind}.jpg`);
        return mat;
      });
      o.material = Array.isArray(o.material) ? out : out[0];
    });
    return gltf.scene;
  })();
  cache.set(id, p);
  return p;
}

export class Character {
  constructor(id, root) {
    this.id = id; this.def = CHARACTERS[id];
    this.root = new THREE.Group();
    this.model = root;
    this.root.add(root);
    this.mixer = new THREE.AnimationMixer(root);
    this.actions = {}; this.current = null;
    const hips = root.getObjectByName('Bip01');
    const ref = this.def.g === 'f' ? 0.92 : 0.895;
    this.hipScale = hips ? hips.position.y / ref : 1;
    this.height = 1.75 * this.hipScale;
  }
  action(name) {
    const full = `${this.def.g}_${name}`;
    if (!this.actions[name]) {
      const clip = getClip(full, this.hipScale) || getClip('m_' + name, this.hipScale);
      if (!clip) return null;
      this.actions[name] = this.mixer.clipAction(clip);
    }
    return this.actions[name];
  }
  play(name, fade = 0.25, timeScale = 1) {
    if (this.currentName === name) { if (this.current) this.current.timeScale = timeScale; return; }
    const a = this.action(name);
    if (!a) return;
    a.reset(); a.timeScale = timeScale; a.setEffectiveWeight(1); a.play();
    if (this.current) this.current.crossFadeTo(a, fade, false);
    this.current = a; this.currentName = name;
  }
  update(dt) { this.mixer.update(dt); }
  dispose() { this.mixer.stopAllAction(); this.root.removeFromParent(); }
}

export async function createCharacter(id) {
  await loadAnimations();
  const base = await loadBase(id);
  const root = SkeletonUtils.clone(base);
  return new Character(id, root);
}

// ---------- Garde-robe : recoloration des vêtements (la peau est préservée) ----------
export const TOPS = [null, { c: '#f1f1ee' }, { c: '#b3261e' }, { c: '#1f5fa8' }, { c: '#1d7a46' }, { c: '#e2b21c' }, { c: '#6a2c91' }, { wax: 0 }, { wax: 1 }, { wax: 2 }];
export const BOTTOMS = [null, { c: '#1b1b1f' }, { c: '#24385c' }, { c: '#c9b58c' }, { c: '#eeeeea' }, { c: '#5a3a22' }];
const waxCache = {};
export function waxCanvas(k) {
  if (waxCache[k]) return waxCache[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  const pal = [['#1b2a6b', '#f2a900', '#ffffff', '#c8102e'], ['#b3151b', '#f6c800', '#111111', '#ffffff'], ['#0b6b3a', '#f2c230', '#7a1f17', '#fdf5d0']][k];
  g.fillStyle = pal[0]; g.fillRect(0, 0, 128, 128);
  if (k === 0) { for (const [x, y] of [[32, 32], [96, 96]]) for (let r = 28; r > 4; r -= 8) { g.fillStyle = pal[1 + ((r / 8) | 0) % 3]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.fillStyle = pal[2]; for (const [x, y] of [[96, 32], [32, 96]]) { g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 18, y); g.lineTo(x, y + 18); g.lineTo(x - 18, y); g.fill(); } }
  else if (k === 1) { for (let y = 0; y < 128; y += 32) { g.strokeStyle = pal[1 + (y / 32) % 3]; g.lineWidth = 9; g.beginPath(); for (let x = 0; x <= 128; x += 16) g.lineTo(x, y + 8 + ((x / 16) % 2) * 16); g.stroke(); } }
  else { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = pal[1 + (i + j) % 3]; g.beginPath(); g.ellipse(i * 32 + 16, j * 32 + 16, 13, 7, (i + j) % 2 ? 0.8 : -0.8, 0, 7); g.fill(); } }
  return (waxCache[k] = cv);
}
const imgCache = {};
function loadImage(url) { return imgCache[url] || (imgCache[url] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; })); }
const outfitCache = new Map();
export async function applyOutfit(ch, top, bottom) {
  const def = ch.def, k = `${def.file}|${top}|${bottom}`;
  let texP = outfitCache.get(k);
  if (!texP) {
    texP = (async () => {
      const img = await loadImage(`assets/chars/${def.file}_body.jpg`), N = 1024;
      const cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, N, N);
      const T = TOPS[top], B = BOTTOMS[bottom];
      if (T || B) {
        const id = g.getImageData(0, 0, N, N), d = id.data, reg = new Uint8Array(N * N); const sum = [0, 0, 0], cnt = [0, 0, 0];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const u = x / N, v = y / N, side = u < 0.33 || u > 0.67; let r = 0;
          if (!side) r = v > 0.04 && v < 0.84 ? 1 : 0; else if (v < 0.42) r = 2; else if (v < 0.8) r = 1;
          if (!r) continue; const i = (y * N + x) * 4, R = d[i], G = d[i + 1], Bl = d[i + 2], mx = Math.max(R, G, Bl), mn = Math.min(R, G, Bl);
          if (mx < 10) continue; const sat = mx ? (mx - mn) / mx : 0;
          if (R > G && G >= Bl && sat > 0.22 && sat < 0.78 && mx > 60 && (R - Bl) > 28 && (R - G) < (R - Bl) * 0.75 && (R - G) > 6) continue; // peau
          reg[y * N + x] = r; sum[r] += 0.3 * R + 0.59 * G + 0.11 * Bl; cnt[r]++;
        }
        const col = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
        const tc = T && T.c ? col(T.c) : null, bc = B ? col(B.c) : null, wax = T && T.wax !== undefined ? waxCanvas(T.wax).getContext('2d').getImageData(0, 0, 128, 128).data : null;
        const avg = [1, (sum[1] / (cnt[1] || 1)) || 1, (sum[2] / (cnt[2] || 1)) || 1];
        for (let p = 0; p < N * N; p++) { const r = reg[p]; if (!r || (r === 1 && !T) || (r === 2 && !B)) continue; const i = p * 4, lum = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2], f = Math.max(0.3, Math.min(1.35, lum / avg[r])) * 0.82;
          let c = r === 1 ? tc : bc; if (r === 1 && wax) { const x = p % N, y = (p / N) | 0, wi = (((y * 0.6) & 127) * 128 + ((x * 0.6) & 127)) * 4; c = [wax[wi], wax[wi + 1], wax[wi + 2]]; }
          d[i] = Math.min(255, c[0] * f); d[i + 1] = Math.min(255, c[1] * f); d[i + 2] = Math.min(255, c[2] * f); }
        g.putImageData(id, 0, 0);
      }
      const t = new THREE.CanvasTexture(cv); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    })();
    outfitCache.set(k, texP);
  }
  const t = await texP;
  ch.model.traverse(o => { if (!o.isMesh) return; const set = m => { if (m.name !== 'body') return m; const c = m.userData.own ? m : m.clone(); c.userData.own = true; c.map = t; c.needsUpdate = true; return c; };
    o.material = Array.isArray(o.material) ? o.material.map(set) : set(o.material); });
}
