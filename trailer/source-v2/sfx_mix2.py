import json, numpy as np, wave, subprocess, sys
exec(open('/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/tr/music.py').read().split('# ---------- 1. tension')[0])
T = json.load(open('timeline.json')); DUR = T['END']; N = int(SR * DUR)
E = json.load(open('/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/tr/events2.json'))['events']
sL = np.zeros(N); sR = np.zeros(N)
def put(sig, t, g, pan=0.0):
    i = at(max(0, t)); s = sig[:N - i] * g; sL[i:i+len(s)] += s * (1 - pan); sR[i:i+len(s)] += s * (1 + pan)
def pop(): t = tt(0.12); return np.sin(2 * np.pi * (900 - 500 * t / .12) * t) * np.exp(-t * 40) * 0.6
def shimmer(): t = tt(2.0); return sum(np.sin(2 * np.pi * f * t + f) for f in (2093, 2637, 3136, 4186)) * np.exp(-t * 1.6) * np.minimum(1, t / .3) * 0.12
def alarm():  # alarme de voiture
    t = tt(1.4); f = np.where((t * 6) % 1 < .5, 1300, 900); return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .18 * np.exp(-t * 1.2)
def glass():
    t = tt(1.8); out = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 5) * .6
    for k in range(40):
        a = int(rng.uniform(0, 1.2) * SR); f = rng.uniform(2500, 7000); tk = tt(.15); s = np.sin(2 * np.pi * f * tk) * np.exp(-tk * 40) * rng.uniform(.1, .3); out[a:a+len(s)] += s[:len(out) - a]
    h = hit(1.0); out[:len(h)] += h * .5; return out
def stamp(): return hit(0.9) * .9 + boom(1.0, 70)[:at(0.9)] * .3
def slash():  # lame de lumière
    t = tt(0.5); n = rng.standard_normal(len(t)); out = np.zeros(len(t))
    for i in range(0, len(t), 600): fc = 1500 + 9000 * (i / len(t)); out[i:i+600] = hp(n[i:i+600], fc * .5)
    return out * np.sin(np.pi * t / .5) ** 2 * .8 + np.sin(2 * np.pi * np.cumsum(800 + 3000 * t / .5) / SR) * np.exp(-t * 6) * .2
def coin(): t = tt(.6); return (np.sin(2 * np.pi * 1975 * t) + np.sin(2 * np.pi * 2637 * t) * np.where(t > .07, 1, 0)) * np.exp(-t * 7) * .35
for e in E:
    n, g, t = e['name'], e['g'], e['t']
    if n == 'whoosh': put(whoosh(0.5), t - 0.1, g * 0.75, 0.2 * np.sin(t))
    elif n == 'impact': put(hit(1.2), t, g * 0.6); put(boom(1.6, 60), t, g * 0.25)
    elif n == 'hit': put(hit(1.0), t, g * 0.5)
    elif n == 'pop': put(pop(), t, g * 0.6)
    elif n == 'tick': put(pluck(1318, .4), t, g * 0.4)
    elif n == 'ding': put(bell(1568, 1.6) * 1.2, t, g * 0.5)
    elif n == 'shimmer': put(shimmer(), t, g)
    elif n == 'alarm': put(alarm(), t, g * .7, -.3)
    elif n == 'glass': put(glass(), t, g * .8)
    elif n == 'stamp': put(stamp(), t, g * .8)
    elif n == 'slash': put(slash(), t, g * .8, .2)
    elif n == 'coin': put(coin(), t, g * .7, .1)
with wave.open('sfx.wav', 'wb') as w:
    m = np.clip(np.stack([sL, sR], 1), -1, 1); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype('<i2').tobytes())
ins = []; fl = []
for i, (k, v) in enumerate(T['lines'].items()):
    ins += ['-i', f'vo/{k}.mp3']; d = int(v['t'] * 1000); fl.append(f'[{i}:a]aresample=48000,adelay={d}|{d}[a{i}]')
fl.append(''.join(f'[a{i}]' for i in range(len(T['lines']))) + f"amix=inputs={len(T['lines'])}:normalize=0,apad=whole_dur={DUR},atrim=0:{DUR},highpass=f=70,equalizer=f=130:t=q:w=1:g=5,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=4:attack=4:release=90:makeup=3,aecho=0.8:0.5:45|90:0.12|0.07,pan=stereo|c0=c0|c1=c0[v]")
subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[v]', '-ar', '48000', 'voice.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voice.wav', '-i', 'music.wav', '-i', 'sfx.wav', '-filter_complex',
  '[0:a]asplit[v1][v2];[1:a]volume=0.6[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=350[md];[2:a]volume=0.85[s];[v1]volume=1.4[vv];[vv][md][s]amix=inputs=3:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[o]',
  '-map', '[o]', '-ar', '48000', 'mix.wav'], check=True)
print('mix ok')
