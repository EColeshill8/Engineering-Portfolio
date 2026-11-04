"""Offline geometry/layout diagnostic. Does not reproduce the browser's PBR renderer."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, struct
import numpy as np

root=Path(__file__).resolve().parents[1]
raw=(root/'Portfolio Content/Generated CAD/baker-head-exploded-studio.glb').read_bytes()
length=struct.unpack_from('<I',raw,12)[0]
gltf=json.loads(raw[20:20+length]);binary=memoryview(raw)[28+length:]
def accessor(i):
    a=gltf['accessors'][i];v=gltf['bufferViews'][a['bufferView']]
    count={'SCALAR':1,'VEC3':3,'VEC4':4}[a['type']]
    dtype={5121:'u1',5123:'<u2',5125:'<u4',5126:'<f4',5122:'<i2'}[a['componentType']]
    size=np.dtype(dtype).itemsize
    data=np.ndarray(shape=(a['count'],count),dtype=dtype,buffer=binary,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',count*size),size))
    if a.get('normalized'):data=data/np.iinfo(data.dtype).max
    return data
def matrix(n,progress):
    offset=np.zeros(3)
    for move in n.get('extras',{}).get('explodeMoves',[]):
        t=np.clip((progress-move['from'])/(move['to']-move['from']),0,1)
        offset+=np.array(move['vector'])*(t*t*(3-2*t))
    if 'matrix' in n:
        m=np.array(n['matrix']).reshape(4,4).T
        m[:3,3]+=offset
        return m
    x,y,z,w=n.get('rotation',[0,0,0,1])
    r=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w),0],
                [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w),0],
                [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y),0],[0,0,0,1]],dtype=float)
    r[:3,:3]*=np.array(n.get('scale',[1,1,1]))
    r[:3,3]=np.array(n.get('translation',[0,0,0]))+offset
    return r
def geometry(progress):
    faces=[];colors=[]
    def walk(i,parent):
        n=gltf['nodes'][i];world=parent@matrix(n,progress)
        if 'mesh' in n:
            for p in gltf['meshes'][n['mesh']]['primitives']:
                if p.get('mode',4)!=4:continue
                points=accessor(p['attributes']['POSITION']);points=points@world[:3,:3].T+world[:3,3]
                indices=accessor(p['indices']).reshape(-1,3) if 'indices' in p else np.arange(len(points)).reshape(-1,3)
                faces.append(points[indices]);color=gltf['materials'][p['material']]['pbrMetallicRoughness']['baseColorFactor'][:3]
                colors.append(np.tile(color,(len(indices),1)))
        for child in n.get('children',[]):walk(child,world)
    for n in gltf['scenes'][0]['nodes']:walk(n,np.eye(4))
    return np.concatenate(faces),np.concatenate(colors)
states=[geometry(p) for p in (0,.5,1)]
allpoints=np.concatenate([s[0].reshape(-1,3) for s in states])
centre=(allpoints.min(0)+allpoints.max(0))/2
view=np.array([[.819,0,-.574],[-.269,.883,-.384],[.506,.469,.723]])
projected=(allpoints-centre)@view.T;extent=np.max(np.abs(projected[:,:2]),axis=0)
scale=min(260/extent[0],310/extent[1])
sheet=Image.new('RGB',(1800,720),'#1b2936');draw=ImageDraw.Draw(sheet)
light=np.array([-.4,.7,.6]);light/=np.linalg.norm(light)
for panel,(faces,colors) in enumerate(states):
    normals=np.cross(faces[:,1]-faces[:,0],faces[:,2]-faces[:,0]);normals/=np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-12)
    illumination=.22+1.15*np.maximum(0,normals@light)
    lit=np.clip(colors*illumination[:,None],0,1)
    srgb=np.where(lit<=.0031308,lit*12.92,1.055*lit**(1/2.4)-.055)
    rgb=(srgb*255).astype(np.uint8)
    p=(faces-centre)@view.T
    for face in np.argsort(p[:,:,2].mean(axis=1)):
        if normals[face]@view[2]<0:continue
        xy=list(zip(panel*600+300+p[face,:,0]*scale,365-p[face,:,1]*scale))
        draw.polygon(xy,fill=tuple(rgb[face]))
    draw.text((panel*600+20,20),['Assembled','50% exploded','Exploded'][panel],fill='white')
draw.text((20,695),'Geometry/layout review. Browser uses real directional lighting, shadows, reflections and antialiasing.',fill='white')
destination=root/'Portfolio Content/Generated Media/head-animation-review.jpg'
sheet.save(destination,quality=94);print(destination)
