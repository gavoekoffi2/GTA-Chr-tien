// Modèles de véhicules : carrosseries profilées (berline, taxi, citadine, 4x4, pick-up, minibus, bus) et moto 125.
import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);
const _m = new THREE.Matrix4(), _n = new THREE.Matrix3(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3();
const rgb = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const WHITE = [1, 1, 1], BLACK = rgb(0x0b0b0c), DARK = rgb(0x1d1f22), GREY = rgb(0x4a4d52), SILVER = rgb(0xb9bdc2), CHROME = rgb(0xdfe2e6), AMBER = rgb(0xff9a1f), SEAT = rgb(0x26211e), SKIN = rgb(0x4a2f1f);
const BOX = new THREE.BoxGeometry(1, 1, 1), CYL = new THREE.CylinderGeometry(1, 1, 1, 14), CYL8 = new THREE.CylinderGeometry(1, 1, 1, 7), SPH = new THREE.SphereGeometry(1, 16, 12);

// ---------- matériaux partagés ----------
export const VM = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0d171b, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.74, depthWrite: false, envMapIntensity: 1.6 }),
  misc: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.15 }),
  chrome: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.2, metalness: 0.95 }),
  wheel: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.35 }),
  head: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, emissive: 0xfff2cf, emissiveIntensity: 0.25, roughness: 0.15, metalness: 0.3 }),
  tail: new THREE.MeshStandardMaterial({ color: 0x8a0f0f, emissive: 0xff1a1a, emissiveIntensity: 0.35, roughness: 0.25 }),
  plate: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
  solid: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.3 }),
  beam: new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
};
const paints = new Map();
export function paintMat(color) { if (!paints.has(color)) paints.set(color, new THREE.MeshPhysicalMaterial({ color, vertexColors: true, roughness: 0.42, metalness: 0.45, clearcoat: 0.7, clearcoatRoughness: 0.25 })); return paints.get(color); }
export function setVehicleNight(n) { VM.head.emissiveIntensity = 0.25 + n * 2.6; VM.tail.emissiveIntensity = 0.35 + n * 1.4; VM.beam.opacity = n * 0.5; }
{ // faisceau des phares au sol
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 110, 4, 64, 60, 70); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  VM.beam.map = new THREE.CanvasTexture(cv);
}
const BEAM = new THREE.PlaneGeometry(1, 1); BEAM.rotateX(-Math.PI / 2); BEAM.userData.shared = true;

// plaques d'immatriculation (numéros fictifs) et enseigne TAXI
const PLATES = { lome: ['TG 4821 AK', 'TG 7305 BD', 'TG 1968 AZ'], cotonou: ['BJ 3907 RB', 'AK 5521 RB', 'BL 2046 RB'], accra: ['GR 4512-21', 'GT 908-19', 'GW 7731-22'], abidjan: ['4127 HK 01', '8830 JB 01', '2219 FG 01'], lagos: ['LSD 482 AK', 'KJA 715 BT', 'EPE 209 XA'], paris: ['GA-482-KT', 'FR-915-LM', 'EZ-307-PB'], london: ['LD21 KFT', 'LB19 XPA', 'LK70 RNE'] };
export function setPlateStyle(city) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, 256, 256);
  (PLATES[city] || PLATES.lome).forEach((t, i) => { g.fillStyle = '#f7f7f2'; g.fillRect(0, i * 64, 256, 64); g.strokeStyle = '#111'; g.lineWidth = 5; g.strokeRect(5, i * 64 + 5, 246, 54); g.fillStyle = '#111'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 128, i * 64 + 34); });
  g.fillStyle = '#f2c200'; g.fillRect(0, 192, 256, 64); g.fillStyle = '#111'; g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TAXI', 128, 226);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (VM.plate.map) VM.plate.map.dispose(); VM.plate.map = t; VM.plate.needsUpdate = true;
}
setPlateStyle('lome');

// ---------- assemblage de pièces par matériau ----------
class Parts {
  constructor() { this.b = {}; }
  bucket(name) { return this.b[name] || (this.b[name] = { p: [], n: [], u: [], c: [] }); }
  addM(geo, name, col, matrix) {
    _n.getNormalMatrix(matrix); const B = this.bucket(name), pa = geo.attributes.position, na = geo.attributes.normal, ua = geo.attributes.uv, ca = geo.attributes.color, idx = geo.index, cnt = idx ? idx.count : pa.count;
    for (let k = 0; k < cnt; k++) { const i = idx ? idx.getX(k) : k; _v.fromBufferAttribute(pa, i).applyMatrix4(matrix); B.p.push(_v.x, _v.y, _v.z); _v.fromBufferAttribute(na, i).applyMatrix3(_n).normalize(); B.n.push(_v.x, _v.y, _v.z); B.u.push(ua ? ua.getX(i) : 0, ua ? ua.getY(i) : 0); if (col) B.c.push(col[0], col[1], col[2]); else B.c.push(ca.getX(i), ca.getY(i), ca.getZ(i)); }
    return this;
  }
  add(geo, name, col, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { return this.addM(geo, name, col, _m.compose(_a.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz))); }
  box(name, col, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) { return this.add(BOX, name, col, x, y, z, rx, ry, rz, w, h, d); }
  cylX(name, col, r, len, x, y, z, geo = CYL) { return this.add(geo, name, col, x, y, z, 0, 0, Math.PI / 2, r, len, r); }
  cylZ(name, col, r, len, x, y, z, geo = CYL) { return this.add(geo, name, col, x, y, z, Math.PI / 2, 0, 0, r, len, r); }
  cylY(name, col, r, len, x, y, z, geo = CYL) { return this.add(geo, name, col, x, y, z, 0, 0, 0, r, len, r); }
  sph(name, col, rx, ry, rz, x, y, z) { return this.add(SPH, name, col, x, y, z, 0, 0, 0, rx, ry, rz); }
  tube(name, col, a, b, r, geo = CYL8) { _a.set(a[0], a[1], a[2]); _b.set(b[0], b[1], b[2]); const len = _a.distanceTo(_b); _v.subVectors(_b, _a).normalize(); _q.setFromUnitVectors(UP, _v); _a.add(_b).multiplyScalar(0.5); return this.addM(geo, name, col, _m.compose(_a, _q, _s.set(r, len, r))); }
  path(name, col, pts, r) { for (let i = 0; i < pts.length - 1; i++) this.tube(name, col, pts[i], pts[i + 1], r); return this; }
  quad(name, col, a, b, c, d, uv) { const B = this.bucket(name); _a.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); _b.set(d[0] - a[0], d[1] - a[1], d[2] - a[2]); _v.crossVectors(_a, _b).normalize(); const u = uv || [0, 0, 1, 0, 1, 1, 0, 1]; const P = [a, b, c, d]; for (const k of [0, 1, 2, 0, 2, 3]) { B.p.push(P[k][0], P[k][1], P[k][2]); B.n.push(_v.x, _v.y, _v.z); B.u.push(u[k * 2], u[k * 2 + 1]); B.c.push(col[0], col[1], col[2]); } return this; }
  geo(name) { const B = this.b[name]; if (!B || !B.p.length) return null; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(B.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(B.c, 3)); return g; }
  mesh(name, mat, shadow = true) { const g = this.geo(name); if (!g) return null; const m = new THREE.Mesh(g, mat); m.castShadow = shadow; if (mat.transparent) m.renderOrder = 3; return m; }
}

// surface tendue entre des sections ; bucketFn(i, j) choisit le matériau, colFn(y) la teinte
function loft(P, rings, closed, bucketFn, colFn) {
  const N = rings.length, K = rings[0].length, nr = new Float32Array(N * K * 3), at = (i, j) => rings[i][j % K], seg = closed ? K : K - 1;
  const fn = new THREE.Vector3();
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < seg; j++) {
    const a = at(i, j), b = at(i, j + 1), c = at(i + 1, j + 1), d = at(i + 1, j);
    _a.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); _b.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); fn.crossVectors(_a, _b);
    _a.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); _b.set(d[0] - a[0], d[1] - a[1], d[2] - a[2]); fn.add(_v.crossVectors(_a, _b));
    for (const [ii, jj] of [[i, j], [i, j + 1], [i + 1, j + 1], [i + 1, j]]) { const k = (ii * K + (jj % K)) * 3; nr[k] += fn.x; nr[k + 1] += fn.y; nr[k + 2] += fn.z; }
  }
  for (let k = 0; k < nr.length; k += 3) { const l = Math.hypot(nr[k], nr[k + 1], nr[k + 2]) || 1; nr[k] /= l; nr[k + 1] /= l; nr[k + 2] /= l; }
  const put = (B, i, j) => { const p = at(i, j), k = (i * K + (j % K)) * 3, c = colFn ? colFn(p[1], i, j) : WHITE; B.p.push(p[0], p[1], p[2]); B.n.push(nr[k], nr[k + 1], nr[k + 2]); B.u.push(0, 0); B.c.push(c[0], c[1], c[2]); };
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < seg; j++) { const B = P.bucket(bucketFn(i, j)); put(B, i, j); put(B, i, j + 1); put(B, i + 1, j + 1); put(B, i, j); put(B, i + 1, j + 1); put(B, i + 1, j); }
}
function cap(P, ring, name, front, colFn) {
  let cx = 0, cy = 0; for (const p of ring) { cx += p[0]; cy += p[1]; } cx /= ring.length; cy /= ring.length; const z = ring[0][2], B = P.bucket(name), nz = front ? 1 : -1;
  for (let j = 0; j < ring.length; j++) { const a = ring[j], b = ring[(j + 1) % ring.length], tri = front ? [[cx, cy, z], b, a] : [[cx, cy, z], a, b]; for (const p of tri) { const c = colFn ? colFn(p[1]) : WHITE; B.p.push(p[0], p[1], p[2]); B.n.push(0, 0, nz); B.u.push(0, 0); B.c.push(c[0], c[1], c[2]); } }
}
const lin = pts => z => { if (z <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) if (z <= pts[i + 1][0]) { const t = (z - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; } return pts[pts.length - 1][1]; };

// ---------- roues ----------
const wheelCache = new Map();
function carWheel(r, w = 0.2) {
  const k = 'c' + r + '|' + w; if (wheelCache.has(k)) return wheelCache.get(k);
  const P = new Parts(), ri = r * 0.62, prof = [[ri, -w / 2], [r - 0.035, -w / 2], [r, -w / 2 + 0.035], [r, w / 2 - 0.035], [r - 0.035, w / 2], [ri, w / 2]].map(p => new THREE.Vector2(p[0], p[1]));
  P.add(new THREE.LatheGeometry(prof, 22), 'w', BLACK, 0, 0, 0, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) { // jante des deux côtés
    P.cylX('w', GREY, ri, 0.012, s * (w / 2 - 0.045), 0, 0); P.cylX('w', SILVER, r * 0.2, 0.03, s * (w / 2 - 0.03), 0, 0);
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; P.box('w', SILVER, 0.022, ri * 0.92, 0.06, s * (w / 2 - 0.035), Math.cos(a) * ri * 0.5, Math.sin(a) * ri * 0.5, a, 0, 0); }
    P.add(new THREE.TorusGeometry(ri, 0.014, 6, 22), 'w', SILVER, s * (w / 2 - 0.03), 0, 0, 0, Math.PI / 2, 0);
  }
  const g = P.geo('w'); g.userData.shared = true; wheelCache.set(k, g); return g;
}
function motoWheel(r) {
  const k = 'm' + r; if (wheelCache.has(k)) return wheelCache.get(k);
  const P = new Parts(), t = 0.047, rr = r - t - 0.02;
  P.add(new THREE.TorusGeometry(r - t, t, 10, 26), 'w', BLACK, 0, 0, 0, 0, Math.PI / 2, 0);
  P.add(new THREE.TorusGeometry(rr, 0.014, 6, 26), 'w', SILVER, 0, 0, 0, 0, Math.PI / 2, 0);
  P.cylX('w', GREY, 0.06, 0.1, 0, 0, 0); P.cylX('w', SILVER, 0.085, 0.03, 0.035, 0, 0);
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, s = i % 2 ? 1 : -1; P.tube('w', CHROME, [s * 0.04, Math.cos(a + 0.25 * s) * 0.05, Math.sin(a + 0.25 * s) * 0.05], [0, Math.cos(a) * rr, Math.sin(a) * rr], 0.0045); }
  const g = P.geo('w'); g.userData.shared = true; wheelCache.set(k, g); return g;
}

// ---------- carrosseries ----------
const SPECS = {
  sedan: { W: 1.70, r: 0.31, zf: 1.36, zr: -1.32, sill: 0.29, lights: [0.74, 0.86],
    deck: [[-2.225, 0.66], [-2.2, 0.88], [-2.08, 0.955], [-1.48, 0.985], [1.0, 0.965], [1.55, 0.9], [2.0, 0.81], [2.17, 0.74], [2.225, 0.64]],
    bottom: [[-2.225, 0.44], [-2.16, 0.34], [-1.95, 0.29], [1.95, 0.29], [2.15, 0.33], [2.225, 0.42]],
    half: [[-2.225, 0.69], [-2.14, 0.8], [-1.9, 0.845], [1.7, 0.85], [2.02, 0.82], [2.17, 0.75], [2.225, 0.64]],
    gh: { zA: 1.04, zB: 0.28, zC: -0.9, zD: -1.52, roof: 1.43, tum: 0.2, pillars: [[-0.36, -0.28], [-1.6, -0.84]] }, seats: [0.05, -0.85], doors: [0.9, -0.32, -1.26] },
  hatch: { W: 1.62, r: 0.29, zf: 1.2, zr: -1.12, sill: 0.28, lights: [0.72, 0.9],
    deck: [[-1.89, 0.7], [-1.865, 0.92], [-1.76, 0.985], [0.95, 0.96], [1.42, 0.9], [1.74, 0.8], [1.85, 0.73], [1.89, 0.64]],
    bottom: [[-1.89, 0.44], [-1.82, 0.33], [-1.65, 0.28], [1.62, 0.28], [1.8, 0.32], [1.89, 0.42]],
    half: [[-1.89, 0.7], [-1.82, 0.78], [-1.6, 0.805], [1.45, 0.81], [1.72, 0.78], [1.84, 0.71], [1.89, 0.62]],
    gh: { zA: 0.98, zB: 0.3, zC: -1.5, zD: -1.84, roof: 1.47, tum: 0.2, pillars: [[-0.3, -0.22], [-1.9, -1.32]] }, seats: [0.05, -0.75], doors: [0.86, -0.26] },
  suv: { W: 1.86, r: 0.37, zf: 1.42, zr: -1.36, sill: 0.4, lights: [0.9, 1.04],
    deck: [[-2.33, 0.78], [-2.31, 1.02], [-2.2, 1.1], [1.05, 1.1], [1.7, 1.05], [2.12, 0.98], [2.28, 0.9], [2.33, 0.78]],
    bottom: [[-2.33, 0.56], [-2.25, 0.44], [-2.05, 0.4], [2.02, 0.4], [2.22, 0.44], [2.33, 0.56]],
    half: [[-2.33, 0.82], [-2.25, 0.9], [-2.0, 0.925], [1.8, 0.93], [2.12, 0.9], [2.27, 0.84], [2.33, 0.74]],
    gh: { zA: 1.1, zB: 0.42, zC: -2.02, zD: -2.26, roof: 1.78, tum: 0.16, pillars: [[-0.24, -0.14], [-1.3, -1.2], [-2.3, -1.98]] }, seats: [0.15, -0.8], doors: [0.96, -0.2, -1.25], spare: true },
  pickup: { W: 1.8, r: 0.36, zf: 1.62, zr: -1.5, sill: 0.38, lights: [0.86, 0.98],
    deck: [[-2.6, 0.78], [-2.58, 1.02], [-2.5, 1.07], [-0.62, 1.07], [-0.55, 1.07], [1.15, 1.07], [1.85, 1.02], [2.35, 0.95], [2.52, 0.88], [2.6, 0.76]],
    bottom: [[-2.6, 0.56], [-2.5, 0.42], [-2.3, 0.38], [2.3, 0.38], [2.5, 0.42], [2.6, 0.54]],
    half: [[-2.6, 0.84], [-2.5, 0.89], [-2.2, 0.9], [2.0, 0.9], [2.38, 0.87], [2.54, 0.8], [2.6, 0.7]],
    gh: { zA: 1.2, zB: 0.56, zC: -0.5, zD: -0.6, roof: 1.74, tum: 0.16, pillars: [[-0.02, 0.08], [-0.66, -0.46]] }, seats: [0.2, -0.3], doors: [1.08, 0.03, -0.56], bed: [-2.48, -0.68] },
  minibus: { W: 1.72, r: 0.33, zf: 1.6, zr: -1.2, sill: 0.33, lights: [0.72, 0.92],
    deck: [[-2.36, 0.74], [-2.34, 0.98], [-2.26, 1.04], [2.02, 1.04], [2.2, 0.98], [2.32, 0.86], [2.36, 0.72]],
    bottom: [[-2.36, 0.5], [-2.28, 0.37], [-2.1, 0.33], [2.1, 0.33], [2.28, 0.38], [2.36, 0.5]],
    half: [[-2.36, 0.8], [-2.28, 0.85], [-2.0, 0.86], [2.0, 0.86], [2.24, 0.83], [2.33, 0.77], [2.36, 0.7]],
    gh: { zA: 2.1, zB: 1.5, zC: -2.24, zD: -2.32, roof: 1.97, tum: 0.09, pillars: [[1.02, 1.1], [0.02, 0.1], [-1.06, -0.98], [-2.4, -2.14]] }, seats: [1.25, 0.3, -0.6, -1.5], doors: [1.9, 1.06, -0.02] },
  bus: { W: 2.5, r: 0.5, zf: 3.3, zr: -3.0, sill: 0.42, lights: [0.8, 1.0],
    deck: [[-5.2, 0.9], [-5.18, 1.2], [-5.1, 1.26], [5.05, 1.26], [5.16, 1.2], [5.2, 0.9]],
    bottom: [[-5.2, 0.6], [-5.1, 0.45], [-4.9, 0.42], [4.9, 0.42], [5.1, 0.46], [5.2, 0.6]],
    half: [[-5.2, 1.18], [-5.1, 1.24], [-4.9, 1.25], [4.9, 1.25], [5.1, 1.24], [5.2, 1.17]],
    gh: { zA: 5.17, zB: 4.95, zC: -5.08, zD: -5.17, roof: 3.05, tum: 0.03, pillars: [[4.2, 4.3], [2.8, 2.9], [1.4, 1.5], [0, 0.1], [-1.4, -1.3], [-2.8, -2.7], [-4.2, -4.1], [-5.3, -5.0]] }, seats: [], doors: [4.1, 3.2] },
};
SPECS.taxi = SPECS.sedan;
const DUST = rgb(0xa98f6c);

function carParts(type, o) {
  const sp = SPECS[type], P = new Parts(), lod = o.lod || 0, deck = lin(sp.deck), bottom = lin(sp.bottom), half = lin(sp.half), z0 = sp.deck[0][0], z1 = sp.deck[sp.deck.length - 1][0], Ra = sp.r + 0.075;
  const arch = z => { let a = 0; for (const zw of [sp.zf, sp.zr]) { const d = Math.abs(z - zw); if (d < Ra) a = Math.max(a, sp.r + Math.sqrt(Ra * Ra - d * d)); } return a; };
  const zl = []; for (let z = z0; z < z1; z += lod ? 0.34 : 0.13) zl.push(z); zl.push(z1);
  for (const c of [sp.deck, sp.bottom, sp.half]) for (const p of c) zl.push(p[0]);
  for (const zw of [sp.zf, sp.zr]) for (let k = 0, n = lod ? 6 : 14; k <= n; k++) zl.push(zw + Ra * Math.cos(k * Math.PI / n));
  zl.sort((a, b) => a - b); const zs = [zl[0]]; for (const z of zl) if (z - zs[zs.length - 1] > 0.02) zs.push(z); zs[zs.length - 1] = z1;
  // coque basse
  const F = [0, 0, 0.1, 0.25, 0.52, 0.82, 0.95, 1, 1, 1], XF = [0, 0.8, 0.965, 1, 1, 0.995, 0.965, 0.9, 0.5, 0], CR = [0, 0, 0, 0, 0, 0, 0, 0.004, 0.022, 0.03], K = F.length;
  const rings = zs.map(z => { const hw = half(z), yt = deck(z), yb = Math.min(yt - 0.06, Math.max(bottom(z), arch(z))), ring = []; for (let j = 0; j < 2 * K - 2; j++) { const k = j < K ? j : 2 * K - 2 - j, s = j < K ? 1 : -1; ring.push([s * hw * XF[k], yb + F[k] * (yt - yb) + CR[k], z]); } return ring; });
  const dust = y => { const f = Math.max(0, Math.min(1, (sp.sill + 0.42 - y) / 0.42)) * 0.5; return [1 + (DUST[0] - 1) * f, 1 + (DUST[1] - 1) * f, 1 + (DUST[2] - 1) * f]; };
  const R = 2 * K - 2, darkB = o.darkBumper;
  loft(P, rings, true, (i, j) => { const zm = (zs[i] + zs[i + 1]) / 2, low = j <= 2 || j >= R - 3; return darkB && low && (zm > z1 - 0.34 || zm < z0 + 0.3) ? 'misc' : 'paint'; }, (y, i, j) => (darkB && (j <= 3 || j >= R - 3) && (zs[i] > z1 - 0.34 || zs[i] < z0 + 0.3) ? DARK : dust(y)));
  cap(P, rings[rings.length - 1], 'paint', true, dust); cap(P, rings[0], 'paint', false, dust);
  // intérieur sombre (visible derrière les roues et les vitres)
  const hw0 = half(0), top = deck(0) - 0.1;
  { const za = sp.zr - Ra - 0.12, zb = sp.zf + Ra + 0.12; P.box('misc', BLACK, 2 * (hw0 - 0.07), top - sp.sill - 0.03, zb - za, 0, (top + sp.sill + 0.03) / 2, (za + zb) / 2); }
  // habitacle vitré
  const g = sp.gh, belt = z => deck(z) - 0.02, gz = [g.zD, g.zC, g.zB, g.zA];
  for (const p of g.pillars) gz.push(Math.max(g.zD, p[0]), Math.min(g.zA, p[1]));
  for (let z = g.zD; z < g.zA; z += lod ? 0.6 : 0.24) gz.push(z);
  gz.sort((a, b) => a - b); const gs = [gz[0]]; for (const z of gz) if (z - gs[gs.length - 1] > 0.03) gs.push(z);
  const roofAt = z => { if (z <= g.zD || z >= g.zA) return belt(z); if (z < g.zC) { const t = (z - g.zD) / (g.zC - g.zD); return belt(z) + (g.roof - belt(z)) * Math.pow(t, 0.8); } if (z > g.zB) { const t = (g.zA - z) / (g.zA - g.zB); return belt(z) + (g.roof - belt(z)) * Math.pow(t, 0.85); } return g.roof + 0.012 * Math.sin((z - g.zC) / (g.zB - g.zC) * Math.PI); };
  const gr = gs.map(z => { const b = belt(z), h = Math.max(0, roofAt(z) - b), hwb = half(z) * 0.9, k = Math.min(1, h * 5), cr = 0.035 * Math.min(1, h * 4), xt = hwb - g.tum * h - 0.035 * k;
    const hp = [[hwb, b], [hwb - g.tum * 0.8 * h, b + 0.8 * h], [xt, b + 0.975 * h], [xt * 0.55, b + h + cr * 0.75], [0, b + h + cr]]; return [hp[0], hp[1], hp[2], hp[3], hp[4], [-hp[3][0], hp[3][1]], [-hp[2][0], hp[2][1]], [-hp[1][0], hp[1][1]], [-hp[0][0], hp[0][1]]].map(p => [p[0], p[1], z]); });
  const inPillar = z => g.pillars.some(p => z > p[0] && z < p[1]);
  loft(P, gr, false, (i, j) => { const zm = (gs[i] + gs[i + 1]) / 2; if (j === 0 || j === 7) return inPillar(zm) ? 'paint' : 'glass'; if (j === 1 || j === 6) return 'paint'; return zm > g.zB || zm < g.zC ? 'glass' : 'paint'; }, null);
  // phares, feux, calandre, plaques
  const [yl, yt2] = sp.lights, hwN = half(z1 - 0.1), hwT = half(z0 + 0.08), W = sp.W;
  for (const s of [-1, 1]) {
    P.box('head', WHITE, W * 0.2, 0.13, 0.12, s * hwN * 0.72, yl, z1 - 0.07, 0, s * 0.32, 0); P.box('misc', AMBER, W * 0.05, 0.1, 0.1, s * hwN * 0.98, yl, z1 - 0.13, 0, s * 0.6, 0);
    P.box('tail', WHITE, W * 0.19, 0.15, 0.1, s * hwT * 0.74, yt2, z0 + 0.06, 0, -s * 0.3, 0);
    if (!lod) { P.box('paint', WHITE, 0.05, 0.09, 0.13, s * (half(g.zA - 0.3) * 0.9 + 0.1), belt(g.zA - 0.3) + 0.09, g.zA - 0.34); P.box('misc', DARK, 0.1, 0.025, 0.05, s * (half(g.zA - 0.3) * 0.9 + 0.04), belt(g.zA - 0.3) + 0.05, g.zA - 0.33);
      for (const dz of sp.doors) P.box('misc', BLACK, 0.012, deck(dz) - sp.sill - 0.2, 0.014, s * (half(dz) + 0.001), (deck(dz) + sp.sill) / 2 + 0.03, dz);
      for (const dz of sp.doors.slice(1)) P.box('chrome', CHROME, 0.02, 0.028, 0.12, s * (half(dz) + 0.006), deck(dz) - 0.15, dz + 0.16); }
  }
  P.box('misc', BLACK, W * 0.42, 0.11, 0.05, 0, yl, z1 - 0.012); P.box('chrome', CHROME, W * 0.44, 0.02, 0.05, 0, yl + 0.065, z1 - 0.01); P.box('misc', BLACK, W * 0.5, 0.1, 0.05, 0, sp.sill + 0.17, z1 - 0.02);
  const pl = (z, y, front, row) => { const w = 0.46, h = 0.11, s = front ? 1 : -1, v0 = 1 - (row + 1) * 0.25, v1 = 1 - row * 0.25; P.quad('plate', WHITE, [-s * w / 2, y, z], [s * w / 2, y, z], [s * w / 2, y + h, z], [-s * w / 2, y + h, z], [0, v0, 1, v0, 1, v1, 0, v1]); };
  const row = o.plate || 0; pl(z1 + 0.012, sp.sill + 0.2, true, row); pl(z0 - 0.012, yt2 - 0.22, false, row);
  if (sp.spare) { P.cylZ('misc', BLACK, 0.36, 0.2, 0, 0.92, z0 - 0.1); P.cylZ('misc', SILVER, 0.2, 0.22, 0, 0.92, z0 - 0.1); }
  if (sp.bed) { const [a, b] = sp.bed, y = deck((a + b) / 2) + 0.004, hw = half((a + b) / 2) - 0.09; P.quad('misc', DARK, [-hw, y, b], [hw, y, b], [hw, y, a], [-hw, y, a]);
    if (o.cargo) { const cols = [rgb(0xc9b68a), rgb(0x8a6a3a), rgb(0xd8d2c0)]; for (let k = 0; k < 5; k++) P.sph('misc', cols[k % 3], 0.3, 0.17, 0.42, (k % 2 ? 0.34 : -0.34), y + 0.16 + (k > 3 ? 0.26 : 0), a + 0.5 + (k >> 1) * 0.6); } }
  if (type === 'taxi') { P.box('misc', rgb(0xf2c200), 0.46, 0.15, 0.2, 0, g.roof + 0.11, -0.25); for (const s of [1, -1]) P.quad('plate', WHITE, [-s * 0.21, g.roof + 0.05, -0.25 + s * 0.101], [s * 0.21, g.roof + 0.05, -0.25 + s * 0.101], [s * 0.21, g.roof + 0.17, -0.25 + s * 0.101], [-s * 0.21, g.roof + 0.17, -0.25 + s * 0.101], [0, 0, 1, 0, 1, 0.25, 0, 0.25]); }
  if (o.rack) { const y = g.roof + 0.06, a = g.zC + 0.3, b = g.zB - 0.5, hw = half(0) * 0.62; P.path('misc', DARK, [[-hw, y, a], [-hw, y, b], [hw, y, b], [hw, y, a], [-hw, y, a]], 0.018);
    const cols = [rgb(0x2a5d9f), rgb(0x8a3d2a), rgb(0xd8d2c0), rgb(0x2f6b3a), rgb(0xc9a227)]; let z = a + 0.25, k = 0; while (z < b - 0.3) { const l = 0.4 + (k * 37 % 5) * 0.09, h = 0.16 + (k * 13 % 4) * 0.05; P.box('misc', cols[k % 5], hw * (1.3 + (k % 3) * 0.18), h, l, 0, y + h / 2 + 0.02, z + l / 2, 0, (k % 3 - 1) * 0.05, 0); z += l + 0.05; k++; } }
  // sièges, tableau de bord, volant, conducteur
  if (!lod) {
    const sy = deck(0) - 0.12, xd = o.rhd ? -1 : 1;
    for (const zs2 of sp.seats) for (const s of [-1, 1]) { const x = s * hw0 * 0.44; P.box('misc', SEAT, hw0 * 0.72, 0.4, 0.1, x, sy + 0.2, zs2 - 0.24, -0.12, 0, 0); P.box('misc', SEAT, 0.2, 0.11, 0.08, x, sy + 0.44, zs2 - 0.27); }
    if (sp.seats.length) { const zd = sp.seats[0]; P.box('misc', DARK, 2 * hw0 * 0.84, 0.1, 0.24, 0, sy + 0.03, g.zA - 0.44); P.add(new THREE.TorusGeometry(0.17, 0.018, 6, 16), 'misc', BLACK, xd * hw0 * 0.44, sy + 0.2, zd + 0.42, -0.45, 0, 0);
      if (o.driver) { const x = xd * hw0 * 0.44, sh = rgb(o.shirt || 0x2d6fa3); P.box('misc', sh, 0.38, 0.3, 0.2, x, sy + 0.15, zd - 0.12, -0.08, 0, 0); P.sph('misc', SKIN, 0.095, 0.11, 0.1, x, sy + 0.4, zd - 0.1); P.tube('misc', sh, [x - 0.2, sy + 0.25, zd - 0.08], [x - 0.13, sy + 0.2, zd + 0.34], 0.045); P.tube('misc', sh, [x + 0.2, sy + 0.25, zd - 0.08], [x + 0.13, sy + 0.2, zd + 0.34], 0.045); } }
  }
  return { P, sp, z0, z1, deck, half };
}

export function buildCar(type, color = 0xbfc3c7, o = {}) {
  const { P, sp, z0, z1, deck, half } = carParts(type, o), group = new THREE.Group();
  for (const [name, mat] of [['paint', paintMat(color)], ['misc', VM.misc], ['chrome', VM.chrome], ['head', VM.head], ['tail', VM.tail], ['plate', VM.plate], ['glass', VM.glass]]) { const m = P.mesh(name, mat, name !== 'glass' && name !== 'plate'); if (m) group.add(m); }
  const wheels = [], steer = [], wg = carWheel(sp.r, type === 'bus' ? 0.3 : 0.2), wx = sp.W / 2 - 0.115;
  for (const [x, z, front] of [[wx, sp.zf, 1], [-wx, sp.zf, 1], [wx, sp.zr, 0], [-wx, sp.zr, 0]]) { const piv = new THREE.Group(); piv.position.set(x, sp.r, z); const w = new THREE.Mesh(wg, VM.wheel); w.castShadow = true; piv.add(w); group.add(piv); wheels.push(w); if (front) steer.push(piv); }
  const beam = new THREE.Mesh(BEAM, VM.beam); beam.scale.set(4.2, 1, 9); beam.position.set(0, 0.07, z1 + 4.6); beam.renderOrder = 2; group.add(beam);
  const xd = (o.rhd ? -1 : 1) * half(0) * 0.44, sy = deck(0) - 0.12, zd = sp.seats.length ? sp.seats[0] : 4.4;
  return { group, wheels, steer, r: sp.r, len: z1 - z0, wid: sp.W, type, seat: new THREE.Vector3(xd, sy, zd - 0.1), wheelPos: new THREE.Vector3(xd, sy + 0.22, zd + 0.4), z0, z1 };
}

// ---------- moto 125 (celle des zémidjans) ----------
function fender(P, name, col, cz, cy, radius, width, a0, a1) {
  const n = 9; for (let i = 0; i < n; i++) { const t0 = a0 + (a1 - a0) * i / n, t1 = a0 + (a1 - a0) * (i + 1) / n; for (const [xa, xb, ra, rb] of [[-width / 2, 0, radius - 0.012, radius], [0, width / 2, radius, radius - 0.012]]) {
    const p = (x, r, t) => [x, cy + Math.sin(t) * r, cz + Math.cos(t) * r]; P.quad(name, col, p(xb, rb, t0), p(xa, ra, t0), p(xa, ra, t1), p(xb, rb, t1)); P.quad(name, col, p(xa, ra - 0.006, t0), p(xb, rb - 0.006, t0), p(xb, rb - 0.006, t1), p(xa, ra - 0.006, t1)); } }
}
function motoParts(o) {
  const P = new Parts(), F = new Parts(), R = 0.3, zr = -0.6, zf = 0.66, lod = o.lod || 0;
  // cadre
  P.tube('misc', DARK, [0, 1.0, 0.36], [0, 0.86, 0.42], 0.03).tube('misc', DARK, [0, 0.93, 0.38], [0, 0.72, -0.12], 0.025).tube('misc', DARK, [0, 0.88, 0.4], [0, 0.4, 0.26], 0.022).tube('misc', DARK, [0, 0.4, 0.26], [0, 0.34, -0.14], 0.02);
  for (const s of [-1, 1]) { P.tube('misc', DARK, [s * 0.09, 0.72, -0.1], [s * 0.1, 0.76, -0.74], 0.016).tube('misc', DARK, [s * 0.1, 0.74, -0.55], [s * 0.09, 0.36, -0.18], 0.014).tube('misc', DARK, [s * 0.08, 0.36, -0.12], [s * 0.09, R, zr], 0.018);
    P.tube('chrome', CHROME, [s * 0.125, 0.72, -0.5], [s * 0.125, 0.33, zr + 0.02], 0.014).tube('misc', rgb(0x8a1414), [s * 0.125, 0.68, -0.505], [s * 0.125, 0.44, zr - 0.0], 0.026);
    if (!lod) P.tube('misc', DARK, [s * 0.09, 0.4, -0.38], [s * 0.21, 0.38, -0.38], 0.012).tube('misc', BLACK, [s * 0.16, 0.3, -0.02], [s * 0.24, 0.3, -0.02], 0.016); }
  // moteur et échappement
  P.cylX('misc', SILVER, 0.13, 0.25, 0, 0.4, 0.03).box('misc', SILVER, 0.13, 0.2, 0.13, 0, 0.57, 0.15, 0.26, 0, 0).box('misc', DARK, 0.12, 0.13, 0.15, 0, 0.59, -0.08).cylX('misc', GREY, 0.085, 0.27, 0, 0.42, 0.03);
  if (!lod) for (let k = 0; k < 5; k++) P.box('misc', GREY, 0.17, 0.012, 0.17, 0, 0.5 + k * 0.035, 0.13 + k * 0.009, 0.26, 0, 0);
  P.path('chrome', CHROME, [[-0.06, 0.56, 0.22], [-0.1, 0.35, 0.25], [-0.14, 0.3, -0.2]], 0.02).tube('chrome', CHROME, [-0.15, 0.31, -0.2], [-0.175, 0.4, -0.8], 0.047, CYL).tube('misc', DARK, [-0.19, 0.345, -0.32], [-0.205, 0.39, -0.62], 0.034);
  // réservoir, selle, caches
  P.sph('paint', WHITE, 0.155, 0.115, 0.27, 0, 0.86, 0.14).cylY('chrome', CHROME, 0.03, 0.02, 0, 0.975, 0.2);
  P.box('misc', BLACK, 0.25, 0.07, 0.66, 0, 0.79, -0.4).sph('misc', BLACK, 0.135, 0.055, 0.35, 0, 0.825, -0.4);
  for (const s of [-1, 1]) P.box('paint', WHITE, 0.02, 0.13, 0.2, s * 0.125, 0.65, -0.22, 0.25, 0, s * 0.12);
  // arrière : garde-boue, feu, plaque, porte-bagages
  fender(P, 'chrome', CHROME, zr, R, R + 0.045, 0.12, 1.0, 2.8);
  P.box('tail', WHITE, 0.1, 0.06, 0.05, 0, 0.72, -0.86).quad('plate', WHITE, [0.09, 0.56, -0.9], [-0.09, 0.56, -0.9], [-0.09, 0.67, -0.92], [0.09, 0.67, -0.92], [0, 0.75, 1, 0.75, 1, 1, 0, 1]);
  P.path('chrome', CHROME, [[-0.1, 0.8, -0.7], [-0.1, 0.81, -0.94], [0.1, 0.81, -0.94], [0.1, 0.8, -0.7]], 0.011);
  if (!lod) { P.box('misc', DARK, 0.014, 0.07, 0.46, 0.105, 0.38, -0.34, 0.1, 0, 0).cylX('misc', GREY, 0.09, 0.012, 0.1, R, zr); for (const s of [-1, 1]) P.cylX('misc', AMBER, 0.022, 0.05, s * 0.13, 0.7, -0.8); }
  if (o.stand) P.tube('misc', DARK, [0.1, 0.3, -0.06], [0.22, 0.03, -0.14], 0.012);
  // direction : fourche, guidon, phare, rétroviseurs
  for (const s of [-1, 1]) { F.tube('chrome', CHROME, [s * 0.085, 0.98, 0.372], [s * 0.085, 0.62, 0.525], 0.017).tube('misc', DARK, [s * 0.085, 0.62, 0.525], [s * 0.085, R, zf], 0.024);
    F.tube('misc', BLACK, [s * 0.23, 1.052, 0.332], [s * 0.345, 1.062, 0.325], 0.019);
    if (!lod) { F.tube('chrome', CHROME, [s * 0.2, 1.045, 0.34], [s * 0.26, 1.22, 0.32], 0.006).add(CYL, 'misc', DARK, s * 0.27, 1.23, 0.318, Math.PI / 2, 0, 0, 0.05, 0.012, 0.035); F.cylX('misc', AMBER, 0.022, 0.05, s * 0.15, 0.9, 0.46); } }
  F.box('misc', DARK, 0.23, 0.03, 0.07, 0, 0.97, 0.376).path('chrome', CHROME, [[-0.33, 1.06, 0.326], [-0.12, 1.02, 0.36], [0.12, 1.02, 0.36], [0.33, 1.06, 0.326]], 0.012);
  F.cylZ('chrome', CHROME, 0.088, 0.1, 0, 0.93, 0.5).cylZ('head', WHITE, 0.074, 0.02, 0, 0.93, 0.552).cylY('misc', DARK, 0.045, 0.04, 0, 1.035, 0.43);
  fender(F, 'paint', WHITE, zf, R, R + 0.04, 0.11, 0.85, 2.55);
  return { P, F, R, zr, zf };
}
export function buildMoto(color = 0xb3261e, o = {}) {
  const { P, F, R, zr, zf } = motoParts(o), group = new THREE.Group(), mats = [['paint', paintMat(color)], ['misc', VM.misc], ['chrome', VM.chrome], ['head', VM.head], ['tail', VM.tail], ['plate', VM.plate]];
  for (const [name, mat] of mats) { const m = P.mesh(name, mat); if (m) group.add(m); }
  const pivot = new THREE.Vector3(0, 0.66, 0.51), steerG = new THREE.Group(), inner = new THREE.Group(); steerG.position.copy(pivot); inner.position.copy(pivot).negate(); steerG.add(inner); group.add(steerG);
  for (const [name, mat] of mats) { const m = F.mesh(name, mat); if (m) inner.add(m); }
  const wg = motoWheel(R), wf = new THREE.Mesh(wg, VM.wheel), wr = new THREE.Mesh(wg, VM.wheel); wf.position.set(0, R, zf); wr.position.set(0, R, zr); wf.castShadow = wr.castShadow = true; inner.add(wf); group.add(wr);
  const beam = new THREE.Mesh(BEAM, VM.beam); beam.scale.set(3, 1, 7); beam.position.set(0, 0.07, 4.4); beam.renderOrder = 2; group.add(beam);
  return { group, wheels: [wf, wr], steerG, steerAxis: new THREE.Vector3(0, 0.68, -0.29).normalize(), r: R, len: 2.0, wid: 0.7, type: 'moto',
    seat: new THREE.Vector3(0, 0.83, -0.2), seat2: new THREE.Vector3(0, 0.83, -0.56), grips: [new THREE.Vector3(0.29, 1.058, 0.33), new THREE.Vector3(-0.29, 1.058, 0.33)] };
}

// versions fusionnées et légères pour les véhicules garés (instanciés)
export function buildStatic(type) {
  const isMoto = type === 'moto', paint = new Parts(), rest = new Parts(), I = new THREE.Matrix4();
  const pour = (src, steerless) => { for (const k in src.b) { const g = src.geo(k); if (k === 'paint') paint.addM(g, 'g', null, I); else rest.addM(g, 'g', k === 'glass' ? rgb(0x10181c) : k === 'head' ? rgb(0xe8e8e0) : k === 'tail' ? rgb(0x9a1010) : k === 'plate' ? rgb(0xe8e8e0) : null, I); } };
  if (isMoto) { const { P, F, R, zr, zf } = motoParts({ lod: 1, stand: true }); pour(P); pour(F); for (const z of [zr, zf]) rest.add(motoWheel(R), 'g', null, 0, R, z); }
  else { const { P, sp } = carParts(type, { lod: 1, darkBumper: type === 'taxi' }); pour(P); const wx = sp.W / 2 - 0.115; for (const [x, z] of [[wx, sp.zf], [-wx, sp.zf], [wx, sp.zr], [-wx, sp.zr]]) rest.add(carWheel(sp.r), 'g', null, x, sp.r, z); }
  return { paint: paint.geo('g'), rest: rest.geo('g') };
}
