import json, os, glob
FR = {}
for root in ('raw', 'raw3'):
    for d in os.listdir(root):
        FR[d] = len(glob.glob(f'{root}/{d}/*.jpg'))
json.dump(FR, open('frames3.json', 'w')); print(FR)
