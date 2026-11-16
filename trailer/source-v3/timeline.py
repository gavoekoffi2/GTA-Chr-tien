import json, subprocess
V = 'vo/'
place = {'l01': 0.8, 'h01': 3.3, 'l02': 8.9, 'l03': 14.9, 'l04': 19.0, 'l05b': 21.8, 'n06': 25.3, 'n07': 27.8, 'n08': 33.4, 'n09': 37.9,
         'l07': 44.8, 'l08': 48.2, 'l09': 51.1, 'l10': 54.1, 'l11': 57.3, 'l12': 60.5, 'l13': 65.0, 'l15': 69.4, 'e01': 75.4, 'l16': 87.6, 'l17b': 92.0, 'l18': 97.4}
lines = {}; txt = {l.split('|')[0]: l.strip().split('|')[3] for l in open(V + 'lines.txt')}
for k, t in place.items():
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', V + k + '.mp3']))
    w = json.load(open(V + k + '.mp3.json'))
    lines[k] = {'t': t, 'd': d, 'text': txt[k], 'words': [[round(t + a, 3), round(b, 3), s] for a, b, s in w]}
T = {'lines': lines, 'FLIP': 17.35, 'REVEAL': 18.45, 'LOME': 24.8, 'DROP': 33.15, 'GOOD': 44.6, 'GRADES': 64.8, 'EDIF': 75.1, 'VERSE': 83.2, 'LOGO': 91.3, 'END': 107.0}
json.dump(T, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
for k, v in lines.items(): print(k, v['t'], round(v['t'] + v['d'], 2), ' '.join(w[2] + '@' + str(w[0]) for w in v['words']))
