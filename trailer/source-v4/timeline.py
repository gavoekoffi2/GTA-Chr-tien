import json, subprocess
V = 'vo/'
def wend(k):
    w = json.load(open(V + k + '.mp3.json')); return w[-1][0] + w[-1][1]
base = {'l01': 0.8, 'h01': 3.3, 'l02': 8.9, 'l03': 14.9, 'l04': 19.0, 'l05b': 21.8, 'n06': 25.3, 'n07': 27.8, 'n08': 33.4, 'n09': 37.9}
MISS = 44.4; t = MISS + 0.25; place = dict(base); gaps = {'m01': .45, 'm02': .35, 'm03': .2, 'm04': .5, 'm05': .4, 'm06': .45, 'm07': .6}
for k in ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07']: place[k] = round(t, 2); t += wend(k) + gaps[k]
D = round(t - 44.6 + 0.3, 2)   # décalage de la suite (v3 : GOOD = 44.6)
for k, v in {'l07': 44.8, 'l08': 48.2, 'l09': 51.1, 'l10': 54.1, 'l11': 57.3, 'l12': 60.5, 'l13': 65.0, 'l15': 69.4, 'e01': 75.4, 'l16': 87.6, 'l17b': 92.0}.items(): place[k] = round(v + D, 2)
place['f01'] = round(96.6 + D, 2)
lines = {}; txt = {l.split('|')[0]: l.strip().split('|')[3] for l in open(V + 'lines.txt')}
for k, tt in place.items():
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', V + k + '.mp3']))
    w = json.load(open(V + k + '.mp3.json'))
    lines[k] = {'t': tt, 'd': d, 'text': txt[k], 'words': [[round(tt + a, 3), round(b, 3), s] for a, b, s in w]}
T = {'lines': lines, 'FLIP': 17.35, 'REVEAL': 18.45, 'LOME': 24.8, 'DROP': 33.15, 'MISS': MISS, 'GOOD': 44.6 + D, 'GRADES': 64.8 + D, 'EDIF': 75.1 + D, 'VERSE': 83.2 + D, 'LOGO': 91.3 + D,
     'END': round(place['f01'] + wend('f01') + 3.2, 2)}
json.dump(T, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
print('D', D, 'END', T['END'])
for k in ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'l07', 'f01']: v = lines[k]; print(k, v['t'], ' '.join(w[2] + '@' + str(w[0]) for w in v['words']))
