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
