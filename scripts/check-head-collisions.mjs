// Geometry-level diagnostic of the real exported animation, not just boxes.
import fs from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {AnimationMixer,Box3,Matrix4} from 'three';
import {MeshBVH} from 'three-mesh-bvh';

const bytes=fs.readFileSync('public/models/baker-head-exploded-web.glb');
const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const mixer=new AnimationMixer(gltf.scene),clip=gltf.animations[0];mixer.clipAction(clip).play();
gltf.scene.updateMatrixWorld(true);
const parts=[];
gltf.scene.traverse(actor=>{
  if(!Number.isInteger(actor.userData.partId))return;
  const inverse=actor.matrixWorld.clone().invert(),geometries=[];
  actor.traverse(object=>{
    if(!object.isMesh)return;
    const geometry=object.geometry.clone();for(const name of Object.keys(geometry.attributes))if(name!=='position')geometry.deleteAttribute(name);
    geometry.applyMatrix4(new Matrix4().multiplyMatrices(inverse,object.matrixWorld));geometries.push(geometry);
  });
  const geometry=mergeGeometries(geometries,false);geometry.boundsTree=new MeshBVH(geometry);geometry.computeBoundingBox();
  parts.push({id:actor.userData.partId,label:actor.userData.partLabel,group:actor.userData.motionGroup,actor,geometry,box:new Box3()});
});
parts.sort((a,b)=>a.id-b.id);
const matrix=new Matrix4();
function collisions(progress){
  mixer.setTime(progress*.999999);gltf.scene.updateMatrixWorld(true);
  for(const p of parts)p.box.copy(p.geometry.boundingBox).applyMatrix4(p.actor.matrixWorld);
  const hits=[];
  for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
    const a=parts[i],b=parts[j];if(a.group===b.group||!a.box.intersectsBox(b.box))continue;
    matrix.copy(a.actor.matrixWorld).invert().multiply(b.actor.matrixWorld);
    if(a.geometry.boundsTree.intersectsGeometry(b.geometry,matrix))hits.push([a.id,b.id]);
  }
  return hits;
}
const baseline=collisions(0),nativePairs=new Set(baseline.map(pair=>pair.join(',')));
if(process.argv.includes('--route-shell')||process.argv.includes('--route-gear')){
  const shell=process.argv.includes('--route-shell'),id=shell?5:49;
  mixer.setTime(shell?.10:.64);gltf.scene.updateMatrixWorld(true);
  if(shell){parts[62].actor.position.set(0,0,0);gltf.scene.updateMatrixWorld(true);}
  const start=shell?[0,0,0]:[.17,0,.07],end=shell?[0,-.20,-.03]:[.14,0,.07];
  const moving=parts[id],cache=new Map(),blocked=[];
  for(const p of parts)p.box.copy(p.geometry.boundingBox).applyMatrix4(p.actor.matrixWorld);
  const free=offset=>{
    const key=offset.map(v=>v.toFixed(5)).join(',');if(cache.has(key))return cache.get(key);
    moving.actor.position.fromArray(offset);gltf.scene.updateMatrixWorld(true);moving.box.copy(moving.geometry.boundingBox).applyMatrix4(moving.actor.matrixWorld);
    for(const other of parts){
      if(other===moving||other.group===moving.group||!moving.box.intersectsBox(other.box))continue;
      if(shell&&nativePairs.has([Math.min(id,other.id),Math.max(id,other.id)].join(',')))continue;
      matrix.copy(moving.actor.matrixWorld).invert().multiply(other.actor.matrixWorld);
      if(moving.geometry.boundsTree.intersectsGeometry(other.geometry,matrix)){cache.set(key,false);if(blocked.length<12)blocked.push({offset,other:other.id});return false;}
    }
    cache.set(key,true);return true;
  };
  const line=(a,b)=>{
    const steps=Math.ceil(Math.max(...a.map((v,i)=>Math.abs(b[i]-v)))/.001);
    for(let i=0;i<=steps;i++)if(!free(a.map((v,k)=>v+(b[k]-v)*i/Math.max(1,steps))))return false;
    return true;
  };
  let route;
  if(shell){
    outer:for(const firstY of [-.01,-.02,-.03,-.04])for(const liftZ of [.005,.01,.02,.03,.04,.06,.08,-.01,-.02]){
      const a=[0,firstY,0],b=[0,firstY,liftZ],c=[0,-.20,liftZ];
      if(line(start,a)&&line(a,b)&&line(b,c)&&line(c,end)){route=[start,a,b,c,end];break outer;}
    }
  }
  for(const axis of shell?[2,0]:[1,2]){
    if(route)break;
    for(const amount of [.001,.002,.003,.005,-.005,.01,-.01,.02,-.02,.04,-.04,.06,-.06,.08,-.08,.1,-.1,.15,-.15]){
      const a=[...start],b=[...end];a[axis]+=amount;b[axis]=a[axis];
      if(line(start,a)&&line(a,b)&&line(b,end)){route=[start,a,b,end];break;}
    }
    if(route)break;
  }
  console.log(JSON.stringify({part:id,route,points:cache.size,...(!route?{blocked}:{})}));process.exit(route?0:1);
}
const result=[];
const samples=process.argv.includes('--final')?[1]:process.argv.includes('--dense')||process.argv.includes('--assert')?Array.from({length:201},(_,i)=>i/200):[.10,.18,.26,.34,.42,.48,.56,.64,.70,.76,.84,.90,.95,1];
for(const progress of samples){
  const hits=collisions(progress),fresh=hits.filter(pair=>progress===1||!nativePairs.has(pair.join(',')));
  result.push({progress,pairs:fresh.map(([a,b])=>({a,b,names:`${parts[a].label} / ${parts[b].label}`}))});
}
const failures=result.filter(row=>row.pairs.length);
if(failures.length)console.log(JSON.stringify({baseline:baseline.length,samples:failures},null,2));
else console.log(`PASS: ${samples.length} explosion poses; no new intersecting part pairs during movement and no intersections between separated components at the endpoint (${baseline.length} existing source contacts excluded while assembled).`);
fs.mkdirSync('Portfolio Content/Generated CAD',{recursive:true});
fs.writeFileSync('Portfolio Content/Generated CAD/head-collision-review.json',JSON.stringify({baseline,result},null,2));
if(process.argv.includes('--assert')&&failures.length)process.exitCode=1;
