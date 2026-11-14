import json, subprocess
V = 'vo/'
place = {'l01':1.6,'l02':6.3,'l03':12.3,'l04':16.4,'l05':22.6,'l06':24.9,'l07':28.7,'l08':33.4,'l09':36.5,'l10':41.3,'l11':46.0,'l12':56.6,'l13':66.6,'l14':70.4,'l15':73.1}
lines = {}
txt = {l.split('|')[0]: l.strip().split('|')[3] for l in open(V+'lines.txt')}
for k, t in place.items():
    d = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',V+k+'.mp3']))
    w = json.load(open(V+k+'.mp3.json'))
    lines[k] = {'t': t, 'd': d, 'text': txt[k], 'words': [[round(t+a,3), round(b,3), s] for a,b,s in w]}
T = {'lines': lines, 'DROP': 27.75, 'VERSE': 61.0, 'LOGO': 68.55, 'END': 82.0}
json.dump(T, open('timeline.json','w'), ensure_ascii=False, indent=1)
for k,v in lines.items(): print(k, v['t'], round(v['t']+v['d'],2), [w[2]+'@'+str(w[0]) for w in v['words']])
