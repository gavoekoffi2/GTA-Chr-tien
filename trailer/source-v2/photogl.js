// Moteur photo WebGL2 : photos réelles + carte de profondeur → caméra 2,5D, flou de mouvement, aberration, étalonnage
const VS = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
uniform sampler2D img, dep; uniform vec2 res, isz; uniform float zoom, focus, fx, fy, expo, sat, warm, con, ca, blur, vig, fade, gt, lift, tint;
uniform vec2 pan, cam, bdir; uniform vec3 tcol;
in vec2 uv; out vec4 o;
vec2 base(vec2 u){ float ra = res.x / res.y, ri = isz.x / isz.y; vec2 s = ra > ri ? vec2(1., ri / ra) : vec2(ra / ri, 1.);
  s /= zoom; vec2 c = vec2(mix(s.x * .5, 1. - s.x * .5, fx), mix(s.y * .5, 1. - s.y * .5, fy)); return c + (u - .5) * s + pan; }
vec2 par(vec2 b){ vec2 off = cam * .045; float d = texture(dep, b).r; vec2 q = b + off * (d - focus); d = texture(dep, q).r; q = b + off * (d - focus); d = texture(dep, q).r; return b + off * (d - focus); }
vec3 samp(vec2 u){ vec2 b = par(base(u)); vec2 co = (u - .5) * ca * .012;
  return vec3(texture(img, b + co).r, texture(img, b).g, texture(img, b - co).b); }
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ vec3 c = vec3(0.);
  if (blur > .0005) { for (int i = 0; i < 12; i++) { float k = float(i) / 11. - .5; c += samp(uv + bdir * blur * k); } c /= 12.; } else c = samp(uv);
  c *= expo; c = mix(vec3(dot(c, vec3(.299, .587, .114))), c, sat); c.r *= 1. + warm * .12; c.b *= 1. - warm * .14; c.g *= 1. + warm * .02;
  c = (c - .5) * con + .5 + lift; c = mix(c, c * tcol, tint);
  vec2 v = uv - .5; c *= 1. - vig * dot(v, v) * 1.6;
  c += (h(uv * res + gt) - .5) * .035; o = vec4(clamp(c, 0., 1.) * fade, fade); }`;
export function createPhotoGL(canvas) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, preserveDrawingBuffer: true });
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const U = {}; for (const n of ['img', 'dep', 'res', 'isz', 'zoom', 'focus', 'fx', 'fy', 'expo', 'sat', 'warm', 'con', 'ca', 'blur', 'vig', 'fade', 'gt', 'lift', 'tint', 'pan', 'cam', 'bdir', 'tcol']) U[n] = gl.getUniformLocation(pr, n);
  gl.uniform1i(U.img, 0); gl.uniform1i(U.dep, 1); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const mk = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT], [gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; };
  const tImg = mk(), tDep = mk(); let curImg = null, curDep = null;
  const flat = document.createElement('canvas'); flat.width = flat.height = 2; const fc = flat.getContext('2d'); fc.fillStyle = '#808080'; fc.fillRect(0, 0, 2, 2);
  return {
    draw(o) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (!o || !o.img) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return; }
      if (o.img !== curImg) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tImg); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.img); curImg = o.img; }
      const d = o.dep || flat; if (d !== curDep) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tDep); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, d); curDep = d; }
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tImg); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tDep);
      const g = Object.assign({ zoom: 1, focus: .5, fx: .5, fy: .5, expo: 1, sat: 1, warm: 0, con: 1, ca: 0, blur: 0, vig: .5, fade: 1, gt: 0, lift: 0, tint: 0, pan: [0, 0], cam: [0, 0], bdir: [1, 0], tcol: [1, 1, 1] }, o);
      gl.uniform2f(U.res, canvas.width, canvas.height); gl.uniform2f(U.isz, o.img.naturalWidth || o.img.width, o.img.naturalHeight || o.img.height);
      for (const k of ['zoom', 'focus', 'fx', 'fy', 'expo', 'sat', 'warm', 'con', 'ca', 'blur', 'vig', 'fade', 'gt', 'lift', 'tint']) gl.uniform1f(U[k], g[k]);
      gl.uniform2f(U.pan, g.pan[0], g.pan[1]); gl.uniform2f(U.cam, g.cam[0], g.cam[1]); gl.uniform2f(U.bdir, g.bdir[0], g.bdir[1]); gl.uniform3f(U.tcol, ...g.tcol);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };
}
