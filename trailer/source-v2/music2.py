# Musique originale v2 « le GTA des chrétiens » (numpy, 48 kHz stéréo)
import numpy as np, json, wave
exec(open('/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/tr/music.py').read().split('# ---------- 1. tension')[0])
T = json.load(open('timeline.json')); DUR = T['END']; N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
FLIP, REVEAL, DROP, VERSE, LOGO = T['FLIP'], T['REVEAL'], T['DROP'], T['VERSE'], T['LOGO']
W = lambda k, w: [x[0] for x in T['lines'][k]['words'] if x[2].lower().startswith(w.lower())][0]
def sub808(f, d=0.9):
    t = tt(d); ff = f * (1 + 0.5 * np.exp(-t * 25)); return np.tanh(np.sin(2 * np.pi * np.cumsum(ff) / SR) * 2.5) * np.exp(-t * 2.2) * np.minimum(1, t / 0.004)
def hat(open_=False): t = tt(0.25 if open_ else 0.05); return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (14 if open_ else 90)) * 0.35
def snare():
    t = tt(0.35); body = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25); n = hp(lp(rng.standard_normal(len(t)), 7000), 1200) * np.exp(-t * 13)
    return (body * 0.6 + n * 0.8) * 0.8
def stab(freqs, d=1.2, bright=2400): return pad(freqs, d, bright, 0.005, d * 0.8) * 1.6
duck = np.ones(N)
# ===== 1. accroche « monde GTA » : trap sombre 140 bpm (demi-temps) =====
b = 60 / 140; t0 = 0.75
add(pad([note(38), note(45), note(50), note(53)], 9.0, 420, 1.5, 1.5), 0.0, 0.45)
add(boom(3.5, 46), 0.05, 0.9)
for i in range(int((9.15 - t0) / (b / 2))):
    tb = t0 + i * b / 2
    add(hat(i % 8 == 7), tb, 0.55 if i % 2 == 0 else 0.3, 0.3)
    if i % 16 in (11, 13): [add(hat(), tb + k * b / 8, 0.25, 0.3) for k in range(4)]  # roulements
for bar in range(int((9.15 - t0) / (4 * b))):
    tb = t0 + bar * 4 * b
    for k, n in ((0, 38), (1.5, 38), (2.75, 41), (3.25, 36)): add(sub808(note(n)), tb + k * b, 0.75)
    add(snare(), tb + 2 * b, 0.8); add(clap(), tb + 2 * b, 0.5)
    for k in (0, 1.5): duck[at(tb + k * b):at(tb + k * b + 0.15)] = 0.5
# sirène sur « Fuir la police »
ts = W('l02', 'Fuir') - 0.05; t_ = tt(1.6); sir = np.sin(2 * np.pi * np.cumsum(700 + 300 * np.sin(2 * np.pi * 1.6 * t_)) / SR) * np.exp(-t_ * 1.2) * 0.25; add(sir, ts, 0.6, 0.4)
add(boom(2.0, 41), W('l02', 'Voler') - 0.03, 0.55); add(boom(2.0, 39), ts, 0.5); add(boom(3.0, 36), W('l02', 'chaos') - 0.03, 0.8)
# ===== 2. la question + retournement (arrêt de bande) =====
add(pad([note(34), note(46), note(49)], FLIP - 9.15 + 0.2, 300, 0.5, 0.4), 9.15, 0.5)
for t0_ in (9.6, 10.6): add(heartbeat(), t0_, 0.8)
add(riser(REVEAL - (FLIP - 0.5)), FLIP - 0.5, 0.7); add(whoosh(1.0, True), REVEAL - 1.0, 0.8)
# ===== 3. révélation : boom + chœur =====
add(boom(6.0, 50), REVEAL, 1.0); add(hit(3.0), REVEAL, 0.9)
add(choir([note(62), note(66), note(69), note(74)], 6.3, 0.15, 2.0), REVEAL, 0.75)
add(pad([note(38), note(50), note(54), note(57)], 6.6, 1000, 0.2, 2.0), REVEAL, 0.45)
for i, tb in enumerate(np.arange(REVEAL + 1.2, 19.2, 60 / 100 * 2)): add(hit(0.9), tb, 0.35 if i % 2 else 0.5)
add(boom(2.5, 55), W('l05', 'GTA') - 0.05, 0.5)
# ===== 4. ville africaine + contraste : groove 100 bpm retenu =====
bpm = 100; b = 60 / bpm; G0 = 19.3; G1 = 40.0
prog = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]]
for bar in range(int((G1 - G0) / (4 * b)) + 1):
    tb = G0 + bar * 4 * b
    if tb >= G1: break
    ch = prog[bar % 4]
    add(pad([note(n) for n in ch[1:]], 4 * b + 0.1, 1200, 0.1, 0.4), tb, 0.26)
    for k in range(4): add(kick(), tb + k * b, 0.6 if k % 2 == 0 else 0.45); duck[at(tb + k * b):at(tb + k * b + 0.2)] = np.minimum(duck[at(tb + k * b):at(tb + k * b + 0.2)], 0.55)
    for k in range(8): add(shaker(), tb + k * b / 2, 0.45, 0.4)
    if tb > 24: add(clap(), tb + b, 0.5); add(clap(), tb + 3 * b, 0.5)
    for k, dn in ((0, 0), (2.5, 7), (3.5, 0)): add(logdrum(note(ch[0] - 12 + dn)), tb + k * b, 0.35)
# « au lieu de X » (sombre) → « tu Y » (lumineux)
for l, x, y in (('l07', 'crimes', None), ('l09', 'voler', 'donnes'), ('l10', 'battre', 'pardonnes'), ('l11', 'fuir', 'sers')):
    add(boom(1.8, 40), W(l, x) - 0.03, 0.55); add(stab([note(38), note(41), note(44)], 0.8, 700), W(l, x) - 0.03, 0.35)
    if y: add(stab([note(62), note(66), note(69), note(74)], 1.4, 3000), W(l, y) - 0.03, 0.4); add(bell(note(86), 2.0), W(l, y) - 0.03, 0.25); add(hit(1.0), W(l, y) - 0.03, 0.4)
add(stab([note(62), note(66), note(69), note(74)], 1.6, 3000), W('l08', 'bonnes') - 0.03, 0.45); add(shimmerless := bell(note(81), 2.5), W('l08', 'bonnes'), 0.3)
# montée vers le drop
for i in range(16): add(snare(), 40.0 + (DROP - 0.2 - 40.0) * (1 - (1 - i / 16) ** 1.6), 0.25 + 0.45 * i / 16)
add(riser(DROP - 41.0), 41.0, 0.6)
# ===== 5. DROP : groove afro complet 104 bpm =====
add(boom(4.0, 55), DROP, 1.0); add(hit(2.5), DROP, 0.9)
bpm = 104; b = 60 / bpm; G1 = VERSE - 0.3
prog = [('D', [50, 57, 62, 66]), ('A', [45, 57, 61, 64]), ('Bm', [47, 59, 62, 66]), ('G', [43, 55, 59, 62])]
for bar in range(int((G1 - DROP) / (4 * b)) + 1):
    tb = DROP + bar * 4 * b
    if tb >= G1: break
    _, ch = prog[bar % 4]; root = ch[0]
    add(pad([note(n) for n in ch[1:]], 4 * b + 0.1, 1500, 0.05, 0.3), tb, 0.3)
    for k in range(4): add(kick(), tb + k * b, 1.0); duck[at(tb + k * b):at(tb + k * b + 0.22)] = np.linspace(0.35, 1, at(0.22))
    for k in (1, 3): add(clap(), tb + k * b, 0.9, -0.1)
    for k in range(16): add(shaker(), tb + k * b / 4 + (0.012 if k % 2 else 0), 0.8 if k % 4 == 2 else 0.45, 0.4)
    for k, dn in ((0, 0), (1.5, 0), (2.5, 7), (3.25, 12), (3.5, 0)): add(logdrum(note(root - 12 + dn)), tb + k * b, 0.6)
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
    for k in range(8): add(pluck(note(arp[k % 4])), tb + k * b / 2 + (b / 4 if k % 3 == 2 else 0), 0.24, (-0.5 if k % 2 else 0.5))
for k in ('Prie', 'Apprends', 'Aide', 'Grandis'): add(hit(1.6), W('l15', k) - 0.03, 0.6); add(boom(2.0, 62), W('l15', k) - 0.03, 0.35)
add(riser(VERSE - 0.3 - (VERSE - 3.0)), VERSE - 3.0, 0.4)
# ===== 6. verset : chœur =====
add(boom(4.0, 50), VERSE - 0.2, 0.6)
add(choir([note(62), note(66), note(69)], 3.2, 1.0, 1.0), VERSE, 0.85); add(choir([note(59), note(62), note(66)], 3.0, .8, 1.5), VERSE + 3.0, 0.85)
add(pad([note(38), note(50), note(57)], 7.0, 600, 1.5, 2), VERSE, 0.4)
for i, n in enumerate((74, 78, 81, 86)): add(bell(note(n)), VERSE + 0.4 + i * 1.2, 0.3, (-.4, .4)[i % 2])
add(riser(LOGO - 69.2), 69.2, 0.7); add(whoosh(1.2, True), LOGO - 1.2, 0.7)
# ===== 7. logo + fin =====
add(boom(6.0, 50), LOGO, 1.0); add(hit(3.0), LOGO, 1.0)
add(choir([note(62), note(66), note(69), note(74)], DUR - LOGO, 0.3, 4), LOGO, 0.65)
add(pad([note(38), note(50), note(54), note(57)], DUR - LOGO, 1100, 0.2, 4), LOGO, 0.45)
for bar in range(12):
    tb = LOGO + 1.2 + bar * 4 * b
    if tb > DUR - 4: break
    for k in (0, 1.5, 2, 3, 3.5): add(hit(0.8), tb + k * b, 0.32 if k else 0.45)
    for k in range(4): add(kick(), tb + k * b, 0.7)
    for k in range(8): add(shaker(), tb + k * b / 2, 0.4, 0.4)
add(boom(4.5, 55), W('l17', 'GTA') - 0.05, 0.6)
add(boom(5.0, 46), T['lines']['l18']['t'] + 6.1, 0.9)
# ===== réverbération + export =====
from scipy.signal import fftconvolve
ir_t = tt(2.6); ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t * 2.6)[:, None]; ir[:, 0] = lp(ir[:, 0], 5000); ir[:, 1] = lp(ir[:, 1], 5000)
dry = np.stack([L, R], 1) * duck[:, None] ** 0.6
# arrêt de bande au retournement : la musique ralentit et descend
a, z = at(FLIP - 0.05), at(FLIP + 0.75); seg = dry[a:z].copy(); n = len(seg); pos = np.cumsum(np.linspace(1, 0, n)); pos = np.clip(pos, 0, n - 1).astype(int)
dry[a:z] = seg[pos] * np.linspace(1, 0, n)[:, None]; dry[z:at(REVEAL - 1.0)] *= 0.25
wet = np.stack([fftconvolve(dry[:, 0], ir[:, 0])[:N], fftconvolve(dry[:, 1], ir[:, 1])[:N]], 1)
mix = dry + wet * 0.09
mix = np.tanh(mix / np.abs(mix).max() * 1.6) * 0.89
fade = np.ones(N); fade[-at(2.5):] = np.linspace(1, 0, at(2.5)); mix *= fade[:, None]
with wave.open('music.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', DUR)
