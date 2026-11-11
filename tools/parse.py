import glob,math,xml.etree.ElementTree as ET
def load(prefix):
    nodes={};ways={};rels={}
    for f in glob.glob(f'/home/user/tools/osm/{prefix}_*.osm'):
        for el in ET.parse(f).getroot():
            if el.tag=='node': nodes[el.get('id')]=(float(el.get('lat')),float(el.get('lon')),{t.get('k'):t.get('v') for t in el.findall('tag')})
            elif el.tag=='way': ways[el.get('id')]=([n.get('ref') for n in el.findall('nd')],{t.get('k'):t.get('v') for t in el.findall('tag')})
            elif el.tag=='relation': rels[el.get('id')]=([(m.get('type'),m.get('ref'),m.get('role')) for m in el.findall('member')],{t.get('k'):t.get('v') for t in el.findall('tag')})
    return nodes,ways,rels
