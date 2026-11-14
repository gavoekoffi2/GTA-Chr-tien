# carte de profondeur (Depth Anything V2 small, ONNX) pour l'effet 2,5D
import sys, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter
sess = ort.InferenceSession('/tmp/claude-0/-home-user-GTA-Chr-tien/7ce89f35-aafb-525a-a56f-68a679f65abe/scratchpad/models/depth.onnx')
for src in sys.argv[1:]:
    im = Image.open(src).convert('RGB'); W, H = im.size
    h = 518; w = int(round(W / H * h / 14)) * 14
    x = np.asarray(im.resize((w, h), Image.BICUBIC), np.float32) / 255.
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    d = sess.run(None, {'pixel_values': x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)  # 1 = proche
    out = Image.fromarray((d * 255).astype(np.uint8)).resize((1024, int(1024 * H / W)), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2.5))
    out.save(src.rsplit('.', 1)[0] + '_d.png'); print('depth', src)
