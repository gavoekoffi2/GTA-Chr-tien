import json, sys, urllib.request, urllib.parse, re, os
UA = {'User-Agent': 'ZionCityTrailer/1.0 (educational video; contact via wiki)'}
API = 'https://commons.wikimedia.org/w/api.php'
def q(**p):
    import time, urllib.error
    p.update(format='json'); u = API + '?' + urllib.parse.urlencode(p)
    for k in range(8):
        time.sleep(1.5)
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            w = int(e.headers.get('Retry-After') or 10); print('429, attente', w, file=sys.stderr); time.sleep(w + 2 * k)
    raise RuntimeError('trop de 429')
def files(cat, depth=0, seen=None):
    seen = seen if seen is not None else set(); out = []
    if cat in seen: return out
    seen.add(cat); cont = {}
    while True:
        d = q(action='query', generator='categorymembers', gcmtitle=cat, gcmlimit=50, gcmtype='file|subcat', prop='imageinfo', iiprop='url|size|extmetadata|mime', iiurlwidth=480, **cont)
        for pg in d.get('query', {}).get('pages', {}).values():
            if pg['ns'] == 14 and depth > 0: out += files(pg['title'], depth - 1, seen)
            ii = pg.get('imageinfo')
            if not ii: continue
            ii = ii[0]; m = ii.get('extmetadata', {})
            if ii.get('mime') != 'image/jpeg' or ii['width'] < 1600 or ii['width'] < ii['height'] * 1.2: continue
            lic = m.get('LicenseShortName', {}).get('value', '')
            if not re.search(r'CC BY|CC0|Public domain|PD', lic, re.I) or re.search(r'NC|ND', lic): continue
            art = re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', '')).strip()
            out.append({'title': pg['title'], 'w': ii['width'], 'h': ii['height'], 'url': ii['url'], 'thumb': ii['thumburl'], 'lic': lic, 'artist': art[:80], 'cat': cat})
        if 'continue' in d: cont = {k: v for k, v in d['continue'].items()}
        else: break
    return out
if __name__ == '__main__':
    name, depth = sys.argv[1], int(sys.argv[2]); cats = sys.argv[3:]
    res = []
    for c in cats:
        try: r = files(c, depth)
        except Exception as e: print('échec', c, e, file=sys.stderr); r = []
        res += r; uniq = {x['title']: x for x in res}
        json.dump(list(uniq.values()), open(name + '.json', 'w'), ensure_ascii=False, indent=0); print(name, c, len(r), len(uniq), flush=True)
