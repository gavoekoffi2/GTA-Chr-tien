import json, os, glob
T = json.load(open('timeline.json'))
FR = {d: len(glob.glob(f'raw/{d}/*.jpg')) for d in os.listdir('raw')} if os.path.isdir('raw') else {}
h = open('trailer.html').read().replace('<script>\nconst Q', '<script>window.TIMELINE=' + json.dumps(T, ensure_ascii=False) + ';window.FRAMES=' + json.dumps(FR) + ';</script>\n<script>\nconst Q', 1)
open('page.html', 'w').write(h); print('page ok', FR)
