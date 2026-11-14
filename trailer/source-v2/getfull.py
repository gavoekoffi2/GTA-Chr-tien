import json, sys, os, time, urllib.request, re
UA = {'User-Agent': 'ZionCityTrailer/1.0 (educational video)'}
os.makedirs('sel', exist_ok=True); cred = json.load(open('sel/credits.json')) if os.path.exists('sel/credits.json') else {}
for spec in sys.argv[1:]:
    name, src, idx = spec.split(':'); r = json.load(open(f'photos/{src}_sorted.json'))[int(idx)]
    url = r['url'] if r['w'] <= 1920 else re.sub(r'/\d+px-', '/1920px-', r['thumb'])
    p = f'sel/{name}.jpg'
    if not os.path.exists(p):
        for k in range(6):
            try: open(p, 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()); break
            except Exception as e: print('retry', name, e); time.sleep(5 + 5 * k)
        time.sleep(1)
    cred[name] = {'title': r['title'], 'artist': r['artist'], 'lic': r['lic']}
    print(name, r['title'], '|', r['artist'], '|', r['lic'])
json.dump(cred, open('sel/credits.json', 'w'), ensure_ascii=False, indent=1)
