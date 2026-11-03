"""Diagnostic orthographic renders of the original head mesh; no browser needed."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, struct
import numpy as np

root = Path(__file__).resolve().parents[1]
raw = (root / 'Portfolio Content/Generated CAD/baker-head-exploded.glb').read_bytes()
json_length = struct.unpack_from('<I', raw, 12)[0]
gltf = json.loads(raw[20:20+json_length])
binary = memoryview(raw)[28+json_length:]

def accessor(index):
    a = gltf['accessors'][index]
    view = gltf['bufferViews'][a['bufferView']]
    components = {'SCALAR':1,'VEC3':3}[a['type']]
    dtype = {5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']]
    return np.frombuffer(binary, dtype=dtype, count=a['count']*components,
                         offset=view.get('byteOffset',0)+a.get('byteOffset',0)).reshape(a['count'],components)

triangles, colours = [], []
for mesh in gltf['meshes']:
    for primitive in mesh['primitives']:
        points = accessor(primitive['attributes']['POSITION'])
        indices = accessor(primitive['indices']).reshape(-1,3)
        faces = points[indices]
        base = np.array(gltf['materials'][primitive['material']]['pbrMetallicRoughness']['baseColorFactor'][:3])
        srgb = np.where(base<=.0031308,base*12.92,1.055*base**(1/2.4)-.055)
        triangles.append(faces)
        colours.append(np.tile(srgb,(len(faces),1)))
triangles = np.concatenate(triangles)
colours = np.concatenate(colours)
minimum, maximum = triangles.min(axis=(0,1)), triangles.max(axis=(0,1))
triangles -= (minimum+maximum)/2
normals = np.cross(triangles[:,1]-triangles[:,0],triangles[:,2]-triangles[:,0])
normals /= np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-12)
light = np.array([.3,-.5,.8]); light /= np.linalg.norm(light)
shaded = (np.clip(colours*(.45+.55*np.abs(normals@light))[:,None],0,1)*255).astype(np.uint8)
sheet = Image.new('RGB',(1260,530),'#25313c')
views = [('Front',np.array([[1,0,0],[0,0,1],[0,-1,0]])),
         ('Side',np.array([[0,1,0],[0,0,1],[1,0,0]])),
         ('Three-quarter',np.array([[.8,.6,0],[-.2,.267,.943],[.566,-.754,.333]]))]
for panel,(label,matrix) in enumerate(views):
    projected = triangles@matrix.T
    extent = np.max(np.abs(projected[:,:,:2]),axis=(0,1))
    scale = min(180/max(extent[0],1e-6),200/max(extent[1],1e-6))
    x = panel*420+210+projected[:,:,0]*scale
    y = 265-projected[:,:,1]*scale
    painter = ImageDraw.Draw(sheet)
    for face in np.argsort(projected[:,:,2].mean(axis=1)):
        painter.polygon(list(zip(x[face],y[face])),fill=tuple(shaded[face]))
    painter.text((panel*420+18,15),label,fill='white')
ImageDraw.Draw(sheet).text((18,510),'Source geometry: '+ ' x '.join(f'{n*1000:.0f}' for n in maximum-minimum)+' mm',fill='white')
destination = root / 'Portfolio Content/Generated Media/head-export-review.jpg'
sheet.save(destination,quality=90)
print(destination)
