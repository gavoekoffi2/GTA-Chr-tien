// Textures dessinées des bâtiments : façades détaillées avec relief (normal map), boutiques, murs de clôture.
import * as THREE from 'three';

const shade = (hex, f) => { const c = new THREE.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString(); };
const mix = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(cv, srgb = true, rs = THREE.RepeatWrapping, rt = THREE.RepeatWrapping) { const t = new THREE.CanvasTexture(cv); t.wrapS = rs; t.wrapT = rt; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; }
// relief → normal map
function normalMap(hc, strength = 2) {
  const w = hc.width, h = hc.height, src = hc.getContext('2d').getImageData(0, 0, w, h).data, [oc, og] = mk(w, h), out = og.createImageData(w, h), d = out.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const l = src[(y * w + (x + w - 1) % w) * 4], r = src[(y * w + (x + 1) % w) * 4], u = src[(((y + h - 1) % h) * w + x) * 4], dn = src[(((y + 1) % h) * w + x) * 4];
    let nx = (l - r) / 255 * strength, ny = (dn - u) / 255 * strength; const il = 1 / Math.sqrt(nx * nx + ny * ny + 1), i = (y * w + x) * 4;
    d[i] = (nx * il * 0.5 + 0.5) * 255; d[i + 1] = (ny * il * 0.5 + 0.5) * 255; d[i + 2] = (il * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  og.putImageData(out, 0, 0); return tex(oc, false);
}
const GREY = v => `rgb(${v},${v},${v})`;
function weather(g, W, H, rng, amount = 1) {
  for (let i = 0; i < 14 * amount; i++) { const x = rng() * W, y = rng() * H, r = (0.06 + rng() * 0.16) * W, gr = g.createRadialGradient(x, y, 0, x, y, r), dark = rng() < 0.6; gr.addColorStop(0, dark ? 'rgba(40,30,20,0.10)' : 'rgba(255,255,255,0.09)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 900 * amount; i++) { g.fillStyle = `rgba(${rng() < 0.5 ? 0 : 255},${rng() < 0.5 ? 0 : 240},${rng() < 0.5 ? 0 : 210},${rng() * 0.03})`; g.fillRect(rng() * W, rng() * H, 1 + rng() * 4, 1 + rng() * 7); }
}
function streak(g, x, y, w, len, a = 0.16) { const gr = g.createLinearGradient(0, y, 0, y + len); gr.addColorStop(0, `rgba(45,35,25,${a})`); gr.addColorStop(1, 'rgba(45,35,25,0)'); g.fillStyle = gr; g.fillRect(x, y, w, len); }

export function facadeTex(style, color, rng, res = 1024) {
  if (color === 'x') color = '#a49d93';
  const N = 4, C = res / N, [cv, g] = mk(res, res), [ec, e] = mk(res / 2, res / 2), [hc, h] = mk(512, 512), HS = 512 / res, ES = 0.5;
  // dessine à la fois la couleur et le relief
  const R = (x, y, w, hh, fill, hv) => { if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, hh); } if (hv !== undefined) { h.fillStyle = GREY(hv); h.fillRect(x * HS, y * HS, Math.max(1, w * HS), Math.max(1, hh * HS)); } };
  const lit = (x, y, w, hh, col) => { e.fillStyle = col; e.fillRect(x * ES, y * ES, w * ES, hh * ES); };
  const glass = (x, y, w, hh) => { const gr = g.createLinearGradient(x, y, x + w, y + hh); gr.addColorStop(0, '#3b566b'); gr.addColorStop(0.55, '#1c2c3a'); gr.addColorStop(1, '#4a6b84'); g.fillStyle = gr; g.fillRect(x, y, w, hh); g.fillStyle = 'rgba(255,255,255,0.09)'; g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x + w * 0.55, y); g.lineTo(x + w * 0.8, y); g.lineTo(x + w * 0.25, y + hh); g.fill(); R(x, y, w, hh, null, 70); };
  const s = C / 256; // échelle : 256 px par travée
  const block = style === 'block', brick = style === 'brick';
  g.fillStyle = block ? '#a49d93' : color; g.fillRect(0, 0, res, res); h.fillStyle = GREY(128); h.fillRect(0, 0, 512, 512); e.fillStyle = '#000'; e.fillRect(0, 0, res / 2, res / 2);
  if (block || brick) { const bh = (brick ? 5.6 : 16.5) * s, bw = (brick ? 18 : 33) * s; for (let y = 0, r = 0; y < res; y += bh, r++) for (let x = -(r % 2) * bw / 2; x < res; x += bw) { const v = 0.9 + rng() * 0.2; g.fillStyle = brick ? shade(color, v) : shade('#a49d93', v); g.fillRect(x + 0.6, y + 0.6, bw - 1.2, bh - 1.2); } g.fillStyle = brick ? 'rgba(60,50,40,0.5)' : 'rgba(70,66,60,0.45)'; for (let y = 0; y < res; y += bh) g.fillRect(0, y, res, 1.2); h.fillStyle = GREY(118); for (let y = 0; y < 512; y += bh * HS) h.fillRect(0, y, 512, 1); }
  else if (style === 'haussmann') { g.fillStyle = 'rgba(90,80,60,0.16)'; for (let y = 0; y < res; y += C / 6) g.fillRect(0, y, res, 1.3); }
  weather(g, res, res, rng, block ? 1.6 : 1);
  const shut = ['#6b4a2f', '#2f5d4a', '#7a2f25', '#31506f', '#8a7a55', '#3d3d3d'], doorC = ['#1f4f8a', '#2f6b4a', '#7a2f25', '#5a4630', '#3a3f45', '#8a6a20'];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const x = c * C, y = r * C, ground = r === N - 1, k = rng(), on = rng() < 0.3;
    R(x, y + C - 4 * s, C, 4 * s, 'rgba(0,0,0,0.13)', 112); // nez de dalle
    if (style === 'glass') {
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const px = x + i * C / 2, py = y + j * C / 2, tint = rng(); const gr = g.createLinearGradient(px, py, px, py + C / 2); gr.addColorStop(0, tint < 0.5 ? '#6f9cba' : '#5d8fa8'); gr.addColorStop(1, tint < 0.5 ? '#2c556f' : '#274a60'); g.fillStyle = gr; g.fillRect(px, py, C / 2, C / 2); if (rng() < 0.18) { g.fillStyle = 'rgba(230,230,220,0.5)'; g.fillRect(px + 3 * s, py + 3 * s, C / 2 - 6 * s, (20 + rng() * 60) * s); } if (rng() < 0.3) lit(px + 4 * s, py + 14 * s, C / 2 - 8 * s, C / 2 - 20 * s, rng() < 0.5 ? '#ffe9b0' : '#cfe6ff'); }
      R(x, y + C * 0.86, C, C * 0.14, '#22323c', 120); R(x, y, 3 * s, C, '#26323a', 150); R(x + C / 2 - 1.5 * s, y, 3 * s, C, '#26323a', 150); R(x, y + C / 2 - 1.5 * s, C, 3 * s, '#26323a', 150); continue;
    }
    if (ground && style !== 'modern' && style !== 'haussmann' && style !== 'brick') R(x, y + C * 0.7, C, C * 0.3, 'rgba(0,0,0,0.07)'); // soubassement
    const win = (wx, wy, ww, wh, type) => {
      R(wx - 6 * s, wy - 6 * s, ww + 12 * s, wh + 12 * s, shade(block ? '#a49d93' : color, 0.7), 96);
      if (type === 'naco') { g.fillStyle = '#16222c'; g.fillRect(wx, wy, ww, wh); R(wx, wy, ww, wh, null, 64); const n = 7, sh = wh / n; for (let i = 0; i < n; i++) { const gr = g.createLinearGradient(0, wy + i * sh, 0, wy + (i + 1) * sh); gr.addColorStop(0, '#9fb9c8'); gr.addColorStop(1, '#3f5a6c'); g.fillStyle = gr; g.fillRect(wx + 2 * s, wy + i * sh + 1.5 * s, ww - 4 * s, sh - 4 * s); R(wx, wy + i * sh, ww, 2 * s, null, 110); }
        R(wx + ww / 2 - 2 * s, wy, 4 * s, wh, '#d8dadc', 150); if (rng() < 0.6) { g.strokeStyle = 'rgba(20,20,20,0.75)'; g.lineWidth = 1.4 * s; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(wx + ww * i / 6, wy); g.lineTo(wx + ww * i / 6, wy + wh); g.stroke(); } g.beginPath(); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke(); } if (on) lit(wx, wy, ww, wh, '#ffd98a'); }
      else if (type === 'shut') { const col = shut[rng() * shut.length | 0]; R(wx, wy, ww, wh, col, 142); g.fillStyle = 'rgba(0,0,0,0.28)'; for (let i = 3 * s; i < wh; i += 6 * s) g.fillRect(wx, wy + i, ww, 1.4 * s); R(wx + ww / 2 - 1.5 * s, wy, 3 * s, wh, shade(col, 0.6), 120); }
      else if (type === 'bars') { g.fillStyle = '#12161a'; g.fillRect(wx, wy, ww, wh); R(wx, wy, ww, wh, null, 60); g.fillStyle = '#3a3f45'; for (let i = 0; i <= 5; i++) g.fillRect(wx + ww * i / 5 - 1.2 * s, wy, 2.4 * s, wh); g.fillRect(wx, wy + wh * 0.5, ww, 2.4 * s); if (on) lit(wx, wy, ww, wh, '#ffcf80'); }
      else { glass(wx, wy, ww, wh); if (rng() < 0.45) { g.fillStyle = ['#c9b9a0', '#e8e0d0', '#9fb3a0', '#b08a8a'][rng() * 4 | 0]; g.globalAlpha = 0.72; g.fillRect(wx, wy, ww * (0.3 + rng() * 0.3), wh); g.globalAlpha = 1; } R(wx + ww / 2 - 2 * s, wy, 4 * s, wh, type === 'alu' ? '#3a3f44' : '#f2efe6', 150); if (type !== 'alu') R(wx, wy + wh * 0.45, ww, 3 * s, '#f2efe6', 150); if (on) lit(wx, wy, ww, wh, ['#ffd98a', '#fff1c4', '#ffe2a8'][rng() * 3 | 0]); }
      R(wx - 9 * s, wy + wh + 5 * s, ww + 18 * s, 6 * s, shade(block ? '#a49d93' : color, 1.15), 188); streak(g, wx + rng() * ww * 0.7, wy + wh + 11 * s, (5 + rng() * 8) * s, (30 + rng() * 60) * s);
    };
    const door = (dx, dw) => { const col = doorC[rng() * doorC.length | 0], dy = y + C * 0.24, dh = C * 0.76 - 4 * s; R(dx - 5 * s, dy - 5 * s, dw + 10 * s, dh + 5 * s, shade(color, 0.7), 100); R(dx, dy, dw, dh, col, 118); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 1.5 * s; g.strokeRect(dx + 5 * s, dy + 6 * s, dw - 10 * s, dh * 0.42); g.strokeRect(dx + 5 * s, dy + dh * 0.52, dw - 10 * s, dh * 0.42); R(dx + dw - 12 * s, dy + dh * 0.5, 5 * s, 9 * s, '#c9c9c0', 160); R(dx - 8 * s, y + C - 9 * s, dw + 16 * s, 5 * s, '#8f8a80', 170); };
    if (style === 'modern') { R(x, y + C * 0.2, C, 5 * s, shade(color, 1.12), 175); R(x, y + C * 0.2 + 5 * s, C, 5 * s, 'rgba(0,0,0,0.2)');
      if (ground && k < 0.35) door(x + C * 0.34, C * 0.32); else { const wy = y + C * 0.3, wh = C * 0.42; R(x + 8 * s, wy - 4 * s, C - 16 * s, wh + 8 * s, '#2c3238', 96); for (let i = 0; i < 3; i++) { const wx = x + 12 * s + i * (C - 24 * s) / 3; glass(wx, wy, (C - 24 * s) / 3 - 4 * s, wh); if (rng() < 0.3) lit(wx, wy, (C - 24 * s) / 3 - 4 * s, wh, '#fff1c4'); } R(x + 4 * s, wy + wh + 6 * s, C - 8 * s, 4 * s, shade(color, 1.1), 180); streak(g, x + rng() * C * 0.8, wy + wh + 10 * s, 7 * s, 46 * s); }
      if (rng() < 0.22) { R(x + C * 0.66, y + C * 0.78, 30 * s, 17 * s, '#dcdcd6', 215); R(x + C * 0.66 + 3 * s, y + C * 0.78 + 3 * s, 24 * s, 11 * s, '#7d7d78', 200); streak(g, x + C * 0.7, y + C * 0.78 + 17 * s, 5 * s, 30 * s, 0.25); } }
    else if (style === 'claustra') { const cx0 = x + 14 * s, cy0 = y + 26 * s, cw = C * 0.5, chh = C * 0.6; R(cx0 - 4 * s, cy0 - 4 * s, cw + 8 * s, chh + 8 * s, shade(color, 1.1), 150); const n = 6, cs = cw / n; for (let i = 0; i < n; i++) for (let j = 0; j < Math.round(chh / cs); j++) { R(cx0 + i * cs + cs * 0.2, cy0 + j * cs + cs * 0.2, cs * 0.6, cs * 0.6, '#1a1e22', 60); }
      if (ground && k < 0.4) door(x + C * 0.66, C * 0.26); else win(x + C * 0.66, y + C * 0.28, C * 0.24, C * 0.4, 'naco'); }
    else if (style === 'haussmann') { if (ground) { R(x, y, C, C, 'rgba(60,50,35,0.10)'); if (k < 0.5) { R(x + C * 0.3, y + C * 0.18, C * 0.4, C * 0.82, '#2a3a2e', 100); R(x + C * 0.34, y + C * 0.24, C * 0.32, C * 0.3, '#1c2a34', 80); } else win(x + C * 0.26, y + C * 0.2, C * 0.48, C * 0.56, 'plain'); }
      else { const wx = x + C * 0.3, wy = y + C * 0.12, ww = C * 0.4, wh = C * 0.7; R(wx - 10 * s, wy - 12 * s, ww + 20 * s, 8 * s, shade(color, 1.1), 185); win(wx, wy, ww, wh, 'plain'); g.fillStyle = '#16181a'; g.fillRect(wx - 14 * s, wy + wh - 26 * s, ww + 28 * s, 2.4 * s); for (let i = -14 * s; i <= ww + 14 * s; i += 6 * s) g.fillRect(wx + i, wy + wh - 26 * s, 1.5 * s, 28 * s); R(wx - 16 * s, wy + wh + 2 * s, ww + 32 * s, 6 * s, shade(color, 0.9), 200); } }
    else if (style === 'brick') { if (ground && k < 0.4) { door(x + C * 0.36, C * 0.28); R(x + C * 0.34, y + C * 0.12, C * 0.32, C * 0.1, '#e8e4d8', 170); } else { const wx = x + C * 0.3, wy = y + C * 0.2, ww = C * 0.4, wh = C * 0.56; R(wx - 8 * s, wy - 14 * s, ww + 16 * s, 12 * s, '#e4dfd2', 180); win(wx, wy, ww, wh, 'plain'); } }
    else if (style === 'colonial') { const wx = x + C * 0.3, wy = y + C * 0.26, ww = C * 0.4, wh = ground ? C * 0.7 : C * 0.5; g.fillStyle = shade(color, 1.18); g.beginPath(); g.arc(wx + ww / 2, wy, ww / 2 + 8 * s, Math.PI, 0); g.fill(); g.fillStyle = '#1b2832'; g.beginPath(); g.arc(wx + ww / 2, wy, ww / 2, Math.PI, 0); g.fill(); h.fillStyle = GREY(70); h.beginPath(); h.arc((wx + ww / 2) * HS, wy * HS, ww / 2 * HS, Math.PI, 0); h.fill();
      if (ground && k < 0.5) { R(wx, wy, ww, wh, doorC[rng() * doorC.length | 0], 115); R(wx + ww / 2 - 1.5 * s, wy, 3 * s, wh, 'rgba(0,0,0,0.4)', 100); } else win(wx, wy, ww, wh, k < 0.6 ? 'shut' : 'plain'); R(x, y + 8 * s, C, 5 * s, shade(color, 1.16), 180); }
    else { // crépi peint et parpaing : fenêtres à lames de verre, volets, grilles
      if (ground && k < 0.26) door(x + C * 0.34 + (rng() - 0.5) * C * 0.2, C * (0.26 + rng() * 0.06));
      else if (block && k > 0.78) { /* mur aveugle */ }
      else if (!ground && k > 0.9 && !block) { const dx = x + C * 0.36, dy = y + C * 0.2, dw = C * 0.28, dh = C * 0.72; glass(dx, dy, dw, dh); R(dx + dw / 2 - 1.5 * s, dy, 3 * s, dh, '#f2efe6', 150); g.fillStyle = '#20242a'; g.fillRect(x + C * 0.18, y + C * 0.62, C * 0.64, 2.4 * s); for (let i = 0; i <= 10; i++) g.fillRect(x + C * 0.18 + i * C * 0.064, y + C * 0.62, 1.6 * s, C * 0.3); R(x + C * 0.16, y + C * 0.92, C * 0.68, 6 * s, shade(color, 0.85), 205); }
      else { const ww = C * (block ? 0.3 : 0.36), wh = C * (block ? 0.32 : 0.42), wx = x + (C - ww) / 2 + (rng() - 0.5) * C * 0.12, wy = y + C * 0.28; const tp = block ? (k < 0.4 ? 'shut' : k < 0.75 ? 'bars' : 'naco') : (k < 0.5 ? 'naco' : k < 0.68 ? 'shut' : 'plain'); win(wx, wy, ww, wh, tp);
        if (!block && tp === 'plain' && rng() < 0.6) { const col = shut[rng() * shut.length | 0]; for (const sx of [wx - 20 * s, wx + ww + 4 * s]) { R(sx, wy, 16 * s, wh, col, 150); g.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 4 * s; i < wh; i += 6 * s) g.fillRect(sx, wy + i, 16 * s, 1.3 * s); } }
        if (!block && rng() < 0.16) { R(wx + ww - 20 * s, wy + wh + 16 * s, 30 * s, 17 * s, '#dcdcd6', 215); R(wx + ww - 17 * s, wy + wh + 19 * s, 24 * s, 11 * s, '#7d7d78', 200); streak(g, wx + ww - 12 * s, wy + wh + 33 * s, 5 * s, 36 * s, 0.25); } }
      if (rng() < 0.12) { g.strokeStyle = 'rgba(40,30,25,0.35)'; g.lineWidth = 1 * s; g.beginPath(); let cx2 = x + rng() * C, cy2 = y + rng() * C * 0.3; g.moveTo(cx2, cy2); for (let i = 0; i < 6; i++) { cx2 += (rng() - 0.5) * 22 * s; cy2 += 16 * s; g.lineTo(cx2, cy2); } g.stroke(); }
    }
  }
  // éclaboussures de terre rouge au pied des murs
  if (style !== 'glass' && style !== 'haussmann' && style !== 'brick') { const y0 = res - C * 0.32, gr = g.createLinearGradient(0, y0, 0, res); gr.addColorStop(0, 'rgba(150,90,50,0)'); gr.addColorStop(1, 'rgba(140,82,46,0.42)'); g.fillStyle = gr; g.fillRect(0, y0, res, C * 0.32); }
  return { map: tex(cv), emap: tex(ec), nmap: normalMap(hc, style === 'glass' ? 0.8 : 2.4) };
}

export function shopTex(color, names, rng, res = 1024) {
  const W = res, H = res / 4, s = H / 256, [cv, g] = mk(W, H), [ec, e] = mk(W / 2, H / 2), [hc, h] = mk(512, 128), HS = 512 / W;
  const R = (x, y, w, hh, fill, hv) => { if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, hh); } if (hv !== undefined) { h.fillStyle = GREY(hv); h.fillRect(x * HS, y * HS, Math.max(1, w * HS), Math.max(1, hh * HS)); } };
  g.fillStyle = shade(color, 0.94); g.fillRect(0, 0, W, H); h.fillStyle = GREY(128); h.fillRect(0, 0, 512, 128); e.fillStyle = '#000'; e.fillRect(0, 0, W / 2, H / 2); weather(g, W, H, rng, 0.5);
  const cols = ['#b3261e', '#1f5fa8', '#1d7a46', '#d98a00', '#6a2c91', '#0d6f73', '#222', '#f2efe6', '#e8c21c'], goods = ['#d94', '#4a8', '#c44', '#eee', '#48c', '#dc5', '#a5d', '#f84'];
  for (let i = 0; i < 4; i++) {
    const x = i * W / 4, C = W / 4, c = cols[rng() * cols.length | 0], light = c === '#f2efe6' || c === '#e8c21c', name = names[rng() * names.length | 0], k = rng();
    R(x + 6 * s, 8 * s, C - 12 * s, 54 * s, c, 150); g.strokeStyle = light ? '#b3261e' : 'rgba(255,255,255,0.7)'; g.lineWidth = 2 * s; g.strokeRect(x + 10 * s, 12 * s, C - 20 * s, 46 * s);
    g.fillStyle = light ? '#7a1f17' : '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 27 * s; g.font = `bold ${fs}px Arial`; while (g.measureText(name).width > C - 30 * s && fs > 8) { fs--; g.font = `bold ${fs}px Arial`; } g.fillText(name, x + C / 2, 36 * s);
    e.fillStyle = 'rgba(255,255,255,0.22)'; e.fillRect((x + 6 * s) / 2, 4 * s, (C - 12 * s) / 2, 27 * s);
    R(x + 4 * s, 64 * s, C - 8 * s, 7 * s, 'rgba(0,0,0,0.22)', 190); // ombre de l'auvent
    const y0 = 76 * s, hh = H - y0 - 6 * s;
    if (k < 0.3) { const sc = ['#8d9499', '#5f7d96', '#7d8a70', '#9a8f80'][rng() * 4 | 0]; R(x + 12 * s, y0, C - 24 * s, hh, sc, 118); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = y0 + 4 * s; y < y0 + hh; y += 7 * s) g.fillRect(x + 12 * s, y, C - 24 * s, 1.6 * s); h.fillStyle = GREY(104); for (let y = y0 + 4 * s; y < y0 + hh; y += 7 * s) h.fillRect((x + 12 * s) * HS, y * HS, (C - 24 * s) * HS, 1); R(x + C / 2 - 8 * s, y0 + hh - 16 * s, 16 * s, 9 * s, '#c9c9c0', 160); }
    else if (k < 0.72) { g.fillStyle = '#15191d'; g.fillRect(x + 12 * s, y0, C - 24 * s, hh); R(x + 12 * s, y0, C - 24 * s, hh, null, 62); for (let r = 0; r < 3; r++) { R(x + 16 * s, y0 + (18 + r * 44) * s + 30 * s, C - 32 * s, 3 * s, '#5a4630'); for (let q = 0; q < 9; q++) if (rng() < 0.85) { g.fillStyle = goods[rng() * goods.length | 0]; const gw = (10 + rng() * 12) * s, gh = (14 + rng() * 16) * s; g.fillRect(x + 18 * s + q * (C - 40 * s) / 9, y0 + (18 + r * 44) * s + 30 * s - gh, gw, gh); } } R(x + 20 * s, y0 + hh - 44 * s, C * 0.45, 44 * s, '#6b4a2c', 140); e.fillStyle = '#ffdf9a'; e.globalAlpha = 0.55; e.fillRect((x + 12 * s) / 2, y0 / 2, (C - 24 * s) / 2, hh / 2); e.globalAlpha = 1; }
    else { const gl = g.createLinearGradient(x, y0, x + C, y0 + hh); gl.addColorStop(0, '#2c4254'); gl.addColorStop(1, '#16232e'); g.fillStyle = gl; g.fillRect(x + 12 * s, y0, C * 0.56, hh * 0.86); g.fillRect(x + C * 0.66, y0, C * 0.28, hh); R(x + 12 * s, y0, C * 0.56, hh * 0.86, null, 76); R(x + C * 0.66, y0, C * 0.28, hh, null, 80); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 12 * s, y0, C * 0.56, 26 * s); for (let q = 0; q < 8; q++) { g.fillStyle = goods[rng() * goods.length | 0]; g.fillRect(x + 20 * s + (q % 4) * 30 * s, y0 + (60 + (q / 4 | 0) * 44) * s, 22 * s, 32 * s); } g.strokeStyle = '#d8d8d2'; g.lineWidth = 3 * s; g.strokeRect(x + 12 * s, y0, C * 0.56, hh * 0.86); g.strokeRect(x + C * 0.66, y0, C * 0.28, hh); e.fillStyle = '#ffe7b0'; e.globalAlpha = 0.6; e.fillRect((x + 12 * s) / 2, y0 / 2, C * 0.28, hh * 0.43); e.globalAlpha = 1; }
    R(x, 0, 3 * s, H, shade(color, 0.8), 150);
  }
  const gr = g.createLinearGradient(0, H * 0.72, 0, H); gr.addColorStop(0, 'rgba(150,90,50,0)'); gr.addColorStop(1, 'rgba(140,82,46,0.4)'); g.fillStyle = gr; g.fillRect(0, H * 0.72, W, H * 0.28);
  return { map: tex(cv, true, THREE.RepeatWrapping, THREE.ClampToEdgeWrapping), emap: tex(ec, true, THREE.RepeatWrapping, THREE.ClampToEdgeWrapping), nmap: normalMap(hc, 2.2) };
}

// mur de clôture : 12,8 m de long sur 2,4 m de haut, avec un portail
export function wallTex(kind, rng, french = true) {
  const W = 1024, H = 192, [cv, g] = mk(W, H), [hc, h] = mk(512, 96), HS = 0.5;
  const base = kind === 'block' ? '#a49d93' : kind === 'ochre' ? '#d2a36a' : kind === 'green' ? '#a9bfa0' : '#e6dcc4';
  const R = (x, y, w, hh, fill, hv) => { if (fill) { g.fillStyle = fill; g.fillRect(x, y, w, hh); } if (hv !== undefined) { h.fillStyle = GREY(hv); h.fillRect(x * HS, y * HS, Math.max(1, w * HS), Math.max(1, hh * HS)); } };
  g.fillStyle = base; g.fillRect(0, 0, W, H); h.fillStyle = GREY(128); h.fillRect(0, 0, 512, 96);
  if (kind === 'block') { for (let y = 0, r = 0; y < H; y += 16, r++) for (let x = -(r % 2) * 16; x < W; x += 32) { g.fillStyle = shade(base, 0.9 + rng() * 0.2); g.fillRect(x + 0.7, y + 0.7, 30.6, 14.6); } h.fillStyle = GREY(116); for (let y = 0; y < 96; y += 8) h.fillRect(0, y, 512, 1); }
  weather(g, W, H, rng, 0.8);
  R(0, 0, W, 12, shade(base, 0.82), 190); for (let x = 0; x < W; x += 256) R(x, 0, 22, H, shade(base, 1.06), 165);
  for (let i = 0; i < 9; i++) streak(g, rng() * W, 12, 6 + rng() * 14, 40 + rng() * 90, 0.2);
  const gc = ['#1f4f8a', '#2f6b4a', '#7a2f25', '#3a3f45', '#6a4a20'][rng() * 5 | 0], gx = 380, gw = 250; R(gx - 10, 0, gw + 20, H, shade(base, 1.08), 175); R(gx, 22, gw, H - 22, gc, 112);
  g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 2.5; g.strokeRect(gx + 8, 30, gw / 2 - 12, H - 40); g.strokeRect(gx + gw / 2 + 4, 30, gw / 2 - 12, H - 40); g.fillStyle = 'rgba(255,255,255,0.14)'; for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(gx + gw / 4 + i * gw / 2, 62 + j * 46, 14, 0, 7); g.fill(); } R(gx + gw / 2 - 2, 22, 4, H - 22, 'rgba(0,0,0,0.5)', 90);
  if (rng() < 0.6 && french) { g.save(); g.fillStyle = 'rgba(30,30,30,0.72)'; g.font = 'bold 21px Arial'; g.textAlign = 'center'; const tx = ['DÉFENSE D’URINER', 'DÉFENSE D’AFFICHER', 'ATTENTION ÉCOLE', 'À VENDRE', 'DIEU EST AMOUR'][rng() * 5 | 0]; g.fillText(tx, 800, 84); if (tx.startsWith('DÉFENSE D’U')) { g.font = 'bold 16px Arial'; g.fillText('AMENDE 5000 F', 800, 108); } g.restore(); }
  const gr = g.createLinearGradient(0, H * 0.6, 0, H); gr.addColorStop(0, 'rgba(150,90,50,0)'); gr.addColorStop(1, 'rgba(140,82,46,0.5)'); g.fillStyle = gr; g.fillRect(0, H * 0.6, W, H * 0.4);
  return { map: tex(cv, true, THREE.RepeatWrapping, THREE.ClampToEdgeWrapping), nmap: normalMap(hc, 2.2) };
}

// feuillage : amas de feuilles sur fond transparent
export function leafTex(kind = 'mango') {
  const [cv, g] = mk(256, 256), cols = kind === 'flame' ? ['#2f6a2a', '#3f7d30', '#d9421c', '#f06a1c', '#c8321a'] : kind === 'neem' ? ['#4f8a34', '#5f9a3c', '#3f7a2c', '#6aa544'] : ['#1f4f20', '#2a5f27', '#356f2c', '#244f22'];
  let a = 12345; const rnd = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
  for (let i = 0; i < 420; i++) { const ang = rnd() * 6.283, r = Math.pow(rnd(), 0.6) * 112, x = 128 + Math.cos(ang) * r, y = 128 + Math.sin(ang) * r; g.fillStyle = cols[rnd() * cols.length | 0]; g.beginPath(); g.ellipse(x, y, 7 + rnd() * 9, 3 + rnd() * 4, rnd() * 3.14, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
