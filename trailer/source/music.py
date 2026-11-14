# Musique originale + design sonore de la bande-annonce Zion City (numpy, 48 kHz stéréo)
import numpy as np, json, wave
SR = 48000; T = json.load(open('timeline.json')); DUR = T['END']; N = int(SR * DUR)
DROP, VERSE, LOGO = T['DROP'], T['VERSE'], T['LOGO']
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)
def at(t): return int(t * SR)
def add(sig, t, g=1.0, pan=0.0):
    i = at(t); 
    if i >= N: return
    s = sig[:N - i] * g
    if s.ndim == 2: L[i:i+len(s)] += s[:,0]; R[i:i+len(s)] += s[:,1]
    else: L[i:i+len(s)] += s * (1 - pan) ** .5 * 1.0; R[i:i+len(s)] += s * (1 + pan) ** .5 * 1.0
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.005, r=None, curve=4.0):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4))
    return e * np.exp(-curve * t / d) if r is None else e * np.clip((d - t) / r, 0, 1)
def lp(x, fc):  # passe-bas 1 pôle (×2)
    a = np.exp(-2 * np.pi * fc / SR); y = x.copy()
    for _ in range(2):
        from scipy.signal import lfilter
        y = lfilter([1 - a], [1, -a], y)
    return y
def hp(x, fc):
    return x - lp(x, fc)
def saw(f, d, det=0.0):
    t = tt(d); ph = (f * (1 + det)) * t
    return 2 * (ph % 1) - 1
def note(n): return 440 * 2 ** ((n - 69) / 12)
NOTES = {'D':62,'E':64,'F':65,'G':67,'A':69,'Bb':70,'B':71,'C':72,'C#':73}
# ---------- éléments ----------
def boom(d=3.0, f0=55):   # « BRAAM » de bande-annonce : sous-grave + cuivre saturé
    t = tt(d); f = f0 * (1 + 1.5 * np.exp(-t * 18)); ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t * 1.1)
    br = sum(saw(f0 * m, d, det) for m, det in [(1, 0), (1, .006), (2, -.004), (1.5, .003), (3, .002)])
    br = np.tanh(lp(br, 380) * 2.2) * np.exp(-t * 0.9) * np.minimum(1, t / 0.02)
    nz = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 6) * 0.6
    return (sub * 0.9 + br * 0.45 + nz)
def hit(d=2.5):  # impact percussif
    t = tt(d); f = 90 * np.exp(-t * 9) + 38; k = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    nz = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 9)
    return np.tanh((k * 1.3 + nz * 0.7) * 1.5)
def riser(d):
    t = tt(d); nz = rng.standard_normal(len(t)); out = np.zeros(len(t)); seg = 2400
    for i in range(0, len(t), seg):
        fc = 300 + 7000 * (i / len(t)) ** 2; out[i:i+seg] = hp(lp(nz[i:i+seg], fc), fc * 0.4)
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * 0.25
    return (out + tone) * (t / d) ** 2.2
def whoosh(d=0.7, rev=False):
    t = tt(d); nz = rng.standard_normal(len(t)); out = np.zeros(len(t)); seg = 1200
    for i in range(0, len(t), seg): fc = 400 + 4000 * np.sin(np.pi * i / len(t)); out[i:i+seg] = lp(nz[i:i+seg], fc)
    e = np.sin(np.pi * t / d) ** 2; s = out * e; return s[::-1] if rev else s
def heartbeat():
    def th(d=0.35, f=50): t = tt(d); return np.sin(2 * np.pi * np.cumsum(f * (1 + np.exp(-t * 30))) / SR) * np.exp(-t * 14)
    s = np.zeros(at(0.9)); a = th(); s[:len(a)] += a; b = th(f=44); s[at(.24):at(.24)+len(b)] += b * .7; return s
def tick(): t = tt(0.04); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 120)
def kick(): t = tt(0.45); f = 48 + 110 * np.exp(-t * 32); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 1.1
def clap():
    t = tt(0.3); n = hp(lp(rng.standard_normal(len(t)), 5000), 900); e = np.exp(-t * 18)
    for o in (0.01, 0.02): e += np.exp(-np.maximum(0, t - o) * 60) * (t > o) * .6
    return n * e * 0.5
def shaker(): t = tt(0.09); return hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 45) * 0.25
def logdrum(f, d=0.35):  # basse « log drum » (amapiano/afro)
    t = tt(d); ff = f * (1 + 0.6 * np.exp(-t * 40)); return np.tanh(np.sin(2 * np.pi * np.cumsum(ff) / SR) * 2) * np.exp(-t * 7)
def pluck(f, d=0.5):  # kalimba
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4.07 * t) * np.exp(-t * 18) + .15 * np.sin(2 * np.pi * f * 2 * t)
    return s * np.exp(-t * 6) * np.minimum(1, t / .003)
def pad(freqs, d, bright=900, a=1.0, r=1.5):
    s = sum(saw(f, d, det) for f in freqs for det in (-0.004, 0.0035)) / (2 * len(freqs))
    s = lp(s, bright); t = tt(d); e = np.minimum(1, t / a) * np.clip((d - t) / r, 0, 1); return s * e
def choir(freqs, d, a=1.2, r=2.0):  # chœur « aah » : scies filtrées par formants
    t = tt(d); out = np.zeros(len(t))
    from scipy.signal import butter, lfilter
    for f in freqs:
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + f)
        for det in (-0.006, 0, 0.005):
            x = 2 * ((np.cumsum(f * (1 + det) * vib) / SR) % 1) - 1
            for fc, g in ((700, 1.0), (1150, 0.6), (2800, 0.25)):
                b, a2 = butter(2, [fc * 0.85 / (SR / 2), fc * 1.15 / (SR / 2)], btype='band'); out += lfilter(b, a2, x) * g
    e = np.minimum(1, t / a) * np.clip((d - t) / r, 0, 1); return out / (3 * len(freqs)) * e * 2.2
def bell(f, d=3.0): t = tt(d); return sum(np.sin(2 * np.pi * f * m * t) * np.exp(-t * k) * g for m, k, g in ((1, 1.2, 1), (2.76, 2.5, .4), (5.4, 4, .2))) * 0.4
# ---------- 1. tension : 0 → DROP ----------
Dm = [note(38), note(45), note(50), note(53)]; Bb = [note(34), note(46), note(50), note(53)]
add(pad([note(38), note(45), note(50)], 12.5, 500, 3, 2), 0.0, 0.5)
add(pad([note(34), note(46), note(50), note(53)], 10.5, 650, 1, 2), 11.5, 0.5)
add(pad([note(36), note(48), note(52), note(55)], 6.0, 700, 1, 3), 21.0, 0.32)
for t0 in (0.05, 6.2, 12.2, 16.3): add(boom(4.0, 49 if t0 != 16.3 else 46), t0, 0.75)
for t0 in (5.4, 11.6, 15.7): add(riser(0.8), t0, 0.35)
bt = 60 / 84  # tic-tac
for i in range(int((21.2 - 6.2) / (bt / 2))): add(tick(), 6.2 + i * bt / 2, 0.22 if i % 2 == 0 else 0.12, 0.3)
for i in range(int((21.2 - 12.2) / bt)): add(kick(), 12.2 + i * bt, 0.35)  # pulsation sourde
for t0 in (21.6, 22.6, 23.6, 24.6): add(heartbeat(), t0, 0.9)
add(riser(DROP - 25.2), 25.2, 0.55); add(whoosh(1.3, True), DROP - 1.3, 0.6)
# ---------- 2. DROP + groove afro (104 bpm) ----------
add(boom(5.0, 55), DROP, 1.0); add(hit(3.0), DROP, 0.9)
bpm = 104; b = 60 / bpm; G0 = DROP; G1 = VERSE - 0.2
prog = [('D', [50, 57, 62, 66]), ('A', [45, 57, 61, 64]), ('Bm', [47, 59, 62, 66]), ('G', [43, 55, 59, 62])]
bars = int((G1 - G0) / (4 * b))
duck = np.ones(N)
for bar in range(bars):
    t0 = G0 + bar * 4 * b; name, ch = prog[bar % 4]; root = ch[0]
    add(pad([note(n) for n in ch[1:]], 4 * b + 0.1, 1400, 0.05, 0.3), t0, 0.32)
    for k in range(4): add(kick(), t0 + k * b, 0.95); duck[at(t0 + k * b):at(t0 + k * b + 0.22)] = np.linspace(0.35, 1, at(0.22))
    for k in (1, 3): add(clap(), t0 + k * b, 0.9, -0.1)
    for k in range(16): add(shaker(), t0 + k * b / 4 + (0.012 if k % 2 else 0), 0.8 if k % 4 == 2 else 0.45, 0.4)
    for k, dn in ((0, 0), (1.5, 0), (2.5, 7), (3.25, 12), (3.5, 0)): add(logdrum(note(root - 12 + dn)), t0 + k * b, 0.55)
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
    for k in range(8): add(pluck(note(arp[k % 4])), t0 + k * b / 2 + (b / 4 if k % 3 == 2 else 0), 0.22, (-0.5 if k % 2 else 0.5))
# coupures d'accentuation sur « Prie / Apprends / Grandis »
for k in ('Prie', 'Apprends', 'Grandis'):
    w = [x for x in T['lines']['l09']['words'] if x[2] == k][0]; add(hit(1.6), w[0] - 0.03, 0.55); add(boom(2.0, 62), w[0] - 0.03, 0.3)
for w in T['lines']['l11']['words']: add(whoosh(0.45), w[0] - 0.25, 0.4); add(hit(0.9), w[0] - 0.02, 0.35)
add(riser(VERSE - 0.2 - (VERSE - 4.2)), VERSE - 4.2, 0.4)
# ---------- 3. verset : chœur ----------
add(boom(4.0, 50), VERSE - 0.2, 0.6)
add(choir([note(62), note(66), note(69)], 3.2, 1.0, 1.0), VERSE, 0.85); add(choir([note(59), note(62), note(66)], 3.0, .8, 1.5), VERSE + 3.0, 0.85)
add(pad([note(38), note(50), note(57)], 7.0, 600, 1.5, 2), VERSE, 0.4)
for i, n in enumerate((74, 78, 81, 86)): add(bell(note(n)), VERSE + 0.4 + i * 1.2, 0.3, (-.4, .4)[i % 2])
add(riser(LOGO - (VERSE + 5.0)), VERSE + 5.0, 0.6)
# ---------- 4. logo + fin ----------
add(boom(6.0, 50), LOGO, 1.0); add(hit(3.0), LOGO, 1.0)
add(choir([note(62), note(66), note(69), note(74)], DUR - LOGO, 0.3, 4), LOGO, 0.6)
add(pad([note(38), note(50), note(54), note(57)], DUR - LOGO, 1100, 0.2, 4), LOGO, 0.45)
for bar in range(int((T['lines']['l15']['t'] - 0.5 - LOGO) / (4 * b)) + 3):  # taikos épiques sur la fin
    t0 = LOGO + 1.2 + bar * 4 * b
    if t0 > DUR - 3: break
    for k in (0, 1.5, 2, 3, 3.5): add(hit(0.8), t0 + k * b, 0.32 if k else 0.45)
add(boom(5.0, 46), T['lines']['l15']['t'] + 4.9, 0.8)
# ---------- réverbération + export ----------
from scipy.signal import fftconvolve
ir_t = tt(2.6); ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t * 2.6)[:, None]; ir[:, 0] = lp(ir[:, 0], 5000); ir[:, 1] = lp(ir[:, 1], 5000)
dry = np.stack([L, R], 1) * duck[:, None] ** 0.6
wet = np.stack([fftconvolve(dry[:, 0], ir[:, 0])[:N], fftconvolve(dry[:, 1], ir[:, 1])[:N]], 1)
mix = dry + wet * 0.09
mix = np.tanh(mix / np.abs(mix).max() * 1.6) * 0.89
fade = np.ones(N); fade[-at(2.0):] = np.linspace(1, 0, at(2.0)); mix *= fade[:, None]
with wave.open('music.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', DUR)
