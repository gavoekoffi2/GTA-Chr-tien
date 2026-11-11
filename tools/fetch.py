import urllib.request,urllib.error,time,os,sys,json
CFG=json.load(open('cities.json'))
def get(c,a,d,b,name,depth=0):
    if os.path.exists(name) and os.path.getsize(name)>300: return
    for t in range(4):
        try:
            r=urllib.request.Request(f'https://api.openstreetmap.org/api/0.6/map?bbox={c:.5f},{a:.5f},{d:.5f},{b:.5f}',headers={'User-Agent':'map-fetch/1.0'})
            open(name,'wb').write(urllib.request.urlopen(r,timeout=120).read()); time.sleep(1); return
        except urllib.error.HTTPError as e:
            if e.code==400 and depth<3:
                ml=(a+b)/2; mo=(c+d)/2; base=name[:-4]
                for k,(x0,y0,x1,y1) in enumerate([(c,a,mo,ml),(mo,a,d,ml),(c,ml,mo,b),(mo,ml,d,b)]): get(x0,y0,x1,y1,f'{base}{k}.osm',depth+1)
                return
            print(name,'http',e.code); time.sleep(5)
        except Exception as e: print(name,'retry',str(e)[:60]); time.sleep(4)
for cid in sys.argv[1:]:
    lat0,lat1,lon0,lon1=CFG[cid]['bbox']; n=CFG[cid].get('tiles',4)
    for i in range(n):
        for j in range(n):
            get(lon0+(lon1-lon0)*j/n, lat0+(lat1-lat0)*i/n, lon0+(lon1-lon0)*(j+1)/n, lat0+(lat1-lat0)*(i+1)/n, f'{cid}_{i}_{j}.osm')
    print(cid,'ok',len([f for f in os.listdir('.') if f.startswith(cid+'_')]))
