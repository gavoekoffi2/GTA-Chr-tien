import glob,os,subprocess,sys
from PIL import Image
R='/home/user/microsoft/microsoft-rocketbox/Assets'; G='/home/user/GTA-Chr-tien/assets'
B='/home/user/tools/node_modules/fbx2gltf/bin/Linux/FBX2glTF'
for d in sorted(glob.glob(R+'/Avatars/*/*/')):
    n=os.path.basename(d[:-1]); fbx=f'{d}Export/{n}.fbx'
    subprocess.run([B,'--binary','--input',fbx,'--output',f'{G}/chars/{n}'],capture_output=True)
    for t in glob.glob(d+'Textures/*_color.tga'):
        kind=os.path.basename(t).split('_')[-2]
        im=Image.open(t); print(n,kind,im.mode,im.size)
        if kind=='opacity':
            im=im.convert('RGBA').resize((1024,1024),Image.LANCZOS); im.save(f'{G}/chars/{n}_opacity.png',optimize=True)
        else:
            s=1024 if kind=='body' else 512
            im.convert('RGB').resize((s,s),Image.LANCZOS).save(f'{G}/chars/{n}_{kind}.jpg',quality=82)
for f in sorted(glob.glob(R+'/Animations/*/*.fbx')):
    n=os.path.basename(f).replace('.max.fbx','')
    subprocess.run([B,'--binary','--input',f,'--output',f'{G}/anims/{n}'],capture_output=True)
