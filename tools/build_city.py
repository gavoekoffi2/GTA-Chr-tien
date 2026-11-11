# Convertit les données OpenStreetMap (ODbL) d'une ville en un fichier compact pour le jeu.
import sys,json,math,random
sys.path.insert(0,'/home/user/tools/osm')
from parse import load
CFG=json.load(open('/home/user/tools/osm/cities.json'))
cid=sys.argv[1]; cfg=CFG[cid]
nodes,ways,rels=load(cid)
lat0,lat1,lon0,lon1=cfg['bbox']; latc=(lat0+lat1)/2; lonc=(lon0+lon1)/2
KX=math.cos(math.radians(latc))*111320; KZ=110540
def proj(la,lo): return ((lo-lonc)*KX, -(la-latc)*KZ)
X0,Z0=proj(lat1,lon0); X1,Z1=proj(lat0,lon1)
rnd=random.Random(cfg.get('seed',1))
def pts(nd): return [proj(nodes[n][0],nodes[n][1]) for n in nd if n in nodes]
def area(p): return 0.5*sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))
def cen(p): return (sum(q[0] for q in p)/len(p), sum(q[1] for q in p)/len(p))
def simp(p,eps=0.25):
    out=[]
    for i,q in enumerate(p):
        a=p[i-1]; b=p[(i+1)%len(p)]
        cr=abs((q[0]-a[0])*(b[1]-a[1])-(q[1]-a[1])*(b[0]-a[0])); L=math.hypot(b[0]-a[0],b[1]-a[1]) or 1
        if cr/L>eps and math.hypot(q[0]-a[0],q[1]-a[1])>0.3: out.append(q)
    return out if len(out)>=3 else p
def flat(p): return [round(v*10) for q in p for v in q]
inb=lambda p: X0-50<p[0]<X1+50 and Z0-50<p[1]<Z1+50
CLS={'motorway':0,'trunk':0,'primary':0,'motorway_link':1,'trunk_link':1,'primary_link':1,'secondary':1,'secondary_link':2,'tertiary':2,'tertiary_link':2,'residential':3,'unclassified':3,'living_street':3,'pedestrian':4,'service':4,'track':4,'path':5,'footway':5,'steps':5,'cycleway':5}
names=[]; 
def nid(s):
    if s not in names: names.append(s)
    return names.index(s)
rn={}; rnl=[]; roads=[]
for nd,t in ways.values():
    h=t.get('highway')
    if h not in CLS: continue
    if t.get('tunnel') in('yes','building_passage') or t.get('area')=='yes' or t.get('layer','0').startswith('-'): continue
    if CLS[h]==5 and cfg.get('nopaths'): continue
    if CLS[h]==4 and t.get('service') in ('parking_aisle','driveway') : continue
    ids=[]
    for n in nd:
        if n not in nodes: continue
        p=proj(nodes[n][0],nodes[n][1])
        if not inb(p): 
            if ids: roads.append([CLS[h],nid(t['name']) if 'name' in t else -1,1 if t.get('oneway')=='yes' or t.get('junction')=='roundabout' else 0,ids]); ids=[]
            continue
        if n not in rn: rn[n]=len(rnl); rnl.append(p)
        ids.append(rn[n])
    if len(ids)>1: roads.append([CLS[h],nid(t['name']) if 'name' in t else -1,1 if t.get('oneway')=='yes' or t.get('junction')=='roundabout' else 0,ids])
# bâtiments
blds=[]; named=[]
special=cfg.get('levels',{})
def add_building(p,t):
    if len(p)>1 and p[0]==p[-1]: p=p[:-1]
    if len(p)<3: return
    a=area(p)
    if abs(a)<14: return
    if a<0: p=p[::-1]; a=-a
    c=cen(p)
    if not (X0<c[0]<X1 and Z0<c[1]<Z1): return
    p=simp(p)
    lv=None
    try: lv=int(float(t.get('building:levels')))
    except: pass
    if lv is None and 'height' in t:
        try: lv=max(1,round(float(t['height'].replace('m',''))/3.1))
        except: pass
    nm=t.get('name','')
    for k,v in special.items():
        if k.lower() in nm.lower(): lv=v
    if lv is None:
        dc=math.hypot(c[0]-CX,c[1]-CZ); core=max(0,1-dc/cfg.get('core',600)); r=rnd.random(); lo,hi=cfg.get('floors',[1,3])
        if a<70: lv=lo
        elif a<220: lv=lo+(1 if r<0.25+core*0.4 else 0)
        elif a<700: lv=lo+int(r*(hi-lo+1)*(0.55+core*0.5))
        else: lv=lo+1+int(r*(hi-lo+1)*(0.5+core*0.6))
        if a>350 and rnd.random()<cfg.get('tall',0.0)*(0.3+core): lv=7+int(rnd.random()*10)
    kind=0
    am=t.get('amenity'); b=t.get('building')
    if am=='place_of_worship' or b in('church','cathedral','chapel'): kind=1 if t.get('religion','christian')=='christian' else 2
    elif b in ('roof','shed','carport') : kind=3
    blds.append([min(lv,60),kind]+flat(p))
    if nm: named.append([nm,round(c[0]),round(c[1]),len(blds)-1])
cc=cfg['center']; CX,CZ=proj(cc[0],cc[1])
for nd,t in ways.values():
    if 'building' in t and t.get('building')!='no' and t.get('location')!='underground': add_building(pts(nd),t)
for mem,t in rels.values():
    if t.get('type')=='multipolygon' and 'building' in t:
        for ty,ref,role in mem:
            if ty=='way' and role!='inner' and ref in ways and 'building' not in ways[ref][1]: add_building(pts(ways[ref][0]),t)
# eau, verdure, côte
def join(segs):
    segs=[list(s) for s in segs]; out=[]
    while segs:
        cur=segs.pop(0); ch=True
        while ch:
            ch=False
            for s in segs:
                if s[0]==cur[-1]: cur+=s[1:]; segs.remove(s); ch=True; break
                if s[-1]==cur[0]: cur=s[:-1]+cur; segs.remove(s); ch=True; break
        out.append(cur)
    return out
water=[];green=[];pitch=[];coast=[]
def clip(p): return [(min(max(q[0],X0-400),X1+400),min(max(q[1],Z0-400),Z1+400)) for q in p]
for nd,t in ways.values():
    nat=t.get('natural'); lz=t.get('leisure'); lu=t.get('landuse')
    if nat=='coastline': coast.append(nd)
    elif nat=='water' or t.get('waterway') in('riverbank','dock') or lu=='basin':
        p=pts(nd)
        if len(p)>3 and abs(area(p))>40: water.append(flat(simp(clip(p[:-1] if p[0]==p[-1] else p),0.5)))
    elif lz=='pitch':
        p=pts(nd)
        if len(p)>3: pitch.append(flat(p[:-1]))
    elif lz in('park','garden') or lu in('grass','village_green','recreation_ground','cemetery','forest') or nat in('wood','grassland'):
        p=pts(nd)
        if len(p)>3 and abs(area(p))>60: green.append(flat(simp(clip(p[:-1]),0.5)))
for mem,t in rels.values():
    if t.get('type')=='multipolygon' and (t.get('natural')=='water' or t.get('waterway')=='riverbank'):
        outer=join([ways[ref][0] for ty,ref,role in mem if ty=='way' and role!='inner' and ref in ways])
        for o in outer:
            p=pts(o)
            if len(p)>3: water.append(flat(simp(clip(p[:-1] if p[0]==p[-1] else p),0.5)))
def pin(p,x,z):
    c=False;n=len(p)//2
    for i in range(n):
        j=(i-1)%n;xi,zi,xj,zj=p[i*2]/10,p[i*2+1]/10,p[j*2]/10,p[j*2+1]/10
        if (zi>z)!=(zj>z) and x<(xj-xi)*(z-zi)/((zj-zi) or 1e-9)+xi: c=not c
    return c
cents=[(sum(b[2::2])/len(b[2::2])/10,sum(b[3::2])/len(b[3::2])/10) for b in blds[::max(1,len(blds)//500)]]
water=[w for w in water if sum(1 for c in cents if pin(w,c[0],c[1]))<3]
coastl=[flat([q for q in pts(c)]) for c in join(coast)]
# POI : point sur la rue la plus proche
segs=[]
for r in roads:
    if r[0]<=3:
        for i in range(len(r[3])-1): segs.append((rnl[r[3][i]],rnl[r[3][i+1]],r[0]))
W=[14,11,9,7,4.5,2.5]
def snap(x,z,off=2.0):
    best=None
    for a,b,c in segs:
        dx,dz=b[0]-a[0],b[1]-a[1]; L=dx*dx+dz*dz or 1; t=max(0.1,min(0.9,((x-a[0])*dx+(z-a[1])*dz)/L)); px,pz=a[0]+dx*t,a[1]+dz*t; d=math.hypot(x-px,z-pz)
        if best is None or d<best[0]: best=(d,px,pz,c)
    d,px,pz,c=best; k=(W[c]/2+off)/(d or 1)
    return [round(px+(x-px)*min(1,k),1),round(pz+(z-pz)*min(1,k),1)]
pois={}
def find(pred):
    best=None
    for src in list(ways.values())+[([i],n[2]) for i,n in nodes.items() if n[2]]:
        nd,t=src
        if not pred(t): continue
        p=pts(nd)
        if not p: continue
        c=cen(p)
        if not (X0+120<c[0]<X1-120 and Z0+120<c[1]<Z1-120): continue
        d=math.hypot(c[0]-CX,c[1]-CZ)
        if best is None or d<best[0]: best=(d,c,t.get('name',''))
    return best
AUTO={'church':lambda t:t.get('amenity')=='place_of_worship' and t.get('religion','christian')=='christian','market':lambda t:t.get('amenity')=='marketplace','hospital':lambda t:t.get('amenity') in('hospital','clinic'),'school':lambda t:t.get('amenity')=='school','park':lambda t:t.get('leisure')=='park','stadium':lambda t:t.get('leisure')=='pitch','station':lambda t:t.get('amenity')=='bus_station' or t.get('railway')=='station' or t.get('building')=='train_station','prison':lambda t:t.get('amenity')=='prison'}
for k in ['church','market','hospital','school','park','stadium','station','prison','landmark','home','orphanage']:
    o=cfg.get('pois',{}).get(k)
    if o: c=proj(o[0],o[1]); nm=o[2] if len(o)>2 else ''
    else:
        f=find(AUTO[k]) if k in AUTO else None
        if f: c=f[1]; nm=f[2]
        else:
            ang=rnd.random()*6.28; c=(CX+math.cos(ang)*350,CZ+math.sin(ang)*350); nm=''
    pois[k]={'c':[round(c[0],1),round(c[1],1)],'s':snap(c[0],c[1]),'n':nm}
rivers=[flat(pts(nd)) for nd,t in ways.values() if t.get('waterway')=='river' and len(nd)>1]
# stations-service et vendeurs de motos réels
def spots(pred,maxn):
    res=[]
    for src in list(ways.values())+[([i],n[2]) for i,n in nodes.items() if n[2]]:
        nd,t=src
        if not pred(t): continue
        p=pts(nd)
        if not p: continue
        c=cen(p)
        if not (X0+150<c[0]<X1-150 and Z0+150<c[1]<Z1-150): continue
        if any(math.hypot(c[0]-r[2],c[1]-r[3])<120 for r in res): continue
        s2=snap(c[0],c[1],5.0); res.append([s2[0],s2[1],c[0],c[1],math.hypot(c[0]-CX,c[1]-CZ)])
    res.sort(key=lambda r:r[4]); return [[r[0],r[1],round(r[2],1),round(r[3],1)] for r in res[:maxn]]
fuel=spots(lambda t:t.get('amenity')=='fuel',6)
dealer=spots(lambda t:t.get('shop') in('motorcycle','car','car_repair','motorcycle_repair'),1)
out={'fuel':fuel,'dealer':dealer,'rivers':rivers,'id':cid,'ext':[round(X0),round(Z0),round(X1),round(Z1)],'names':names,'rn':flat(rnl),'roads':roads,'b':blds,'named':named,'water':water,'green':green,'pitch':pitch,'coast':coastl,'pois':pois}
json.dump(out,open(f'/home/user/GTA-Chr-tien/assets/cities/{cid}.json','w'),separators=(',',':'),ensure_ascii=False)
print(cid,'fuel',len(fuel),'dealer',len(dealer),'roads',len(roads),'nodes',len(rnl),'buildings',len(blds),'named',len(named),'water',len(water),'green',len(green),'coast',[len(c)//2 for c in coastl],'ext',out['ext'])
for k,v in pois.items(): print(' ',k,v)
