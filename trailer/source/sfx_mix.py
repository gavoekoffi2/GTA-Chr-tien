# bruitages calés sur les EVENTS de la page + voix + musique → mix final
import json, numpy as np, wave, subprocess, sys
sys.argv = ['music.py']; exec(open('music.py').read().split('# ---------- 1. tension')[0])  # réutilise les synthés
E = json.load(open('events.json'))['events']
sL = np.zeros(N); sR = np.zeros(N)
def put(sig, t, g, pan=0.0):
    i = at(max(0, t)); s = sig[:N - i] * g; sL[i:i+len(s)] += s * (1 - pan); sR[i:i+len(s)] += s * (1 + pan)
def pop(): t = tt(0.12); return np.sin(2 * np.pi * (900 - 500 * t / .12) * t) * np.exp(-t * 40) * 0.6
def ding(): return bell(1568, 1.6) * 1.2
def shimmer(): t = tt(2.0); return sum(np.sin(2 * np.pi * f * t + f) for f in (2093, 2637, 3136, 4186)) * np.exp(-t * 1.6) * np.minimum(1, t / .3) * 0.12
for e in E:
    n, g, t = e['name'], e['g'], e['t']
    if n == 'whoosh': put(whoosh(0.5), t - 0.1, g * 0.7, 0.2 * np.sin(t))
    elif n == 'impact': put(hit(1.2), t, g * 0.6); put(boom(1.6, 60), t, g * 0.25)
    elif n == 'hit': put(hit(1.0), t, g * 0.5)
    elif n == 'pop': put(pop(), t, g * 0.6)
    elif n == 'tick': put(pluck(1318, .4), t, g * 0.35)
    elif n == 'ding': put(ding(), t, g * 0.5)
    elif n == 'shimmer': put(shimmer(), t, g)
with wave.open('sfx.wav', 'wb') as w:
    m = np.stack([sL, sR], 1); m = np.clip(m, -1, 1); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype('<i2').tobytes())
# voix : placement + traitement « bande-annonce »
T = json.load(open('timeline.json')); ins = []; fl = []
for i, (k, v) in enumerate(T['lines'].items()):
    ins += ['-i', f'vo/{k}.mp3']; d = int(v['t'] * 1000); fl.append(f'[{i}:a]aresample=48000,adelay={d}|{d}[a{i}]')
fl.append(''.join(f'[a{i}]' for i in range(len(T['lines']))) + f"amix=inputs={len(T['lines'])}:normalize=0,apad=whole_dur={T['END']},atrim=0:{T['END']},highpass=f=70,equalizer=f=140:t=q:w=1:g=4,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3.5:attack=4:release=90:makeup=3,aecho=0.8:0.5:45|90:0.12|0.07,pan=stereo|c0=c0|c1=c0[v]")
subprocess.run(['ffmpeg', '-y', '-v', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[v]', '-ar', '48000', 'voice.wav'], check=True)
# mix : musique duckée sous la voix
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'voice.wav', '-i', 'music.wav', '-i', 'sfx.wav', '-filter_complex',
  '[0:a]asplit[v1][v2];[1:a]volume=0.62[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=350[md];[2:a]volume=0.8[s];[v1]volume=1.35[vv];[vv][md][s]amix=inputs=3:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[o]',
  '-map', '[o]', '-ar', '48000', 'mix.wav'], check=True)
print('mix ok')
