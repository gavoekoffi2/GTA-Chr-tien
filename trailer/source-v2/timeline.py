import json, subprocess
V = 'vo/'
place = {'l01': 0.8, 'l02': 3.5, 'l03': 9.5, 'l04': 13.6, 'l05': 16.4, 'l06': 19.4, 'l07': 24.2, 'l08': 27.6, 'l09': 30.6, 'l10': 33.6, 'l11': 36.8,
         'l12': 40.0, 'l13': 44.5, 'l14': 48.9, 'l15': 57.8, 'l16': 69.4, 'l17': 73.2, 'l18': 78.4}
lines = {}; txt = {l.split('|')[0]: l.strip().split('|')[3] for l in open(V + 'lines.txt')}
for k, t in place.items():
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', V + k + '.mp3']))
    w = json.load(open(V + k + '.mp3.json'))
    lines[k] = {'t': t, 'd': d, 'text': txt[k], 'words': [[round(t + a, 3), round(b, 3), s] for a, b, s in w]}
T = {'lines': lines, 'FLIP': 11.95, 'REVEAL': 13.05, 'DROP': 44.2, 'VERSE': 63.9, 'LOGO': 72.4, 'END': 88.0}
json.dump(T, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
for k, v in lines.items(): print(k, v['t'], round(v['t'] + v['d'], 2), ' '.join(w[2] + '@' + str(w[0]) for w in v['words']))
