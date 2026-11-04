import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {AnimationMixer,Box3,Vector3} from 'three';
import {createTurntable,scrollExplosion} from '../src/lib/cad-motion.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'src/data/models-web.json')));
const rotation=createTurntable();
assert(rotation.canRotate(true,false,0),'starts rotating when visible');
rotation.begin();assert(!rotation.canRotate(true,false,9999),'drag pauses rotation');
rotation.end(100);assert(!rotation.canRotate(true,false,1699));assert(rotation.canRotate(true,false,1700),'automatically resumes after inspection');
rotation.inspect(2000);assert(!rotation.canRotate(true,false,3000));assert(rotation.canRotate(true,false,3600));
rotation.toggle();assert(!rotation.canRotate(true,false,5000),'manual pause persists');
rotation.toggle();assert(rotation.canRotate(true,false,5000));
assert(!rotation.canRotate(false,false,5000));assert(!rotation.canRotate(true,true,5000));
const reduced=createTurntable(true);assert(!reduced.canRotate(true,false,0));reduced.toggle();assert(reduced.canRotate(true,false,0));
assert.equal(scrollExplosion(100,1000,500,100),0);assert.equal(scrollExplosion(-400,1000,500,100),1);
assert.equal(scrollExplosion(-150,1000,500,100),.5);
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
for(const [slug,info] of Object.entries(manifest)){
  if(process.argv[2]&&process.argv[2]!==slug)continue;
  const bytes=fs.readFileSync(path.join(root,'public/models',info.file));
  const gltf=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  let triangles=0,lines=0,clear=0;
  gltf.scene.traverse(object=>{
    if(object.isLineSegments){lines++;return;}
    if(object.isMesh){triangles+=(object.geometry.index?.count||object.geometry.attributes.position.count)/3;
      const mats=Array.isArray(object.material)?object.material:[object.material];
      if(mats.some(m=>m.transparent&&m.opacity<.3))clear++;
      assert(object.geometry.attributes.normal,`${slug}: missing surface normals`);
    }
  });
  assert.equal(Math.round(triangles),Math.round(info.triangles),`${slug}: full triangle count retained`);
  assert(lines>10,`${slug}: CAD feature lines present`);
  if(slug==='ri3d')assert.equal(clear,3,'only the three hopper walls are clear');
  if(slug==='baker-bot')assert(clear>=5,'named Baker Bot polycarbonate panels are clear');
  if(slug==='baker-head-exploded'){
    const clip=gltf.animations.find(a=>a.name==='Head explode');assert(clip);
    assert.equal(clip.tracks.length,71);
    const mixer=new AnimationMixer(gltf.scene);mixer.clipAction(clip).play();
    const size=()=>new Box3().setFromObject(gltf.scene).getSize(new Vector3());
    mixer.setTime(0);const assembled=size();
    mixer.setTime(clip.duration*.999999);const exploded=size();
    assert(exploded.x>assembled.x*2,'head separates sideways');assert(exploded.y>assembled.y*1.6,'jaw/shell separate vertically');
    assert(exploded.z>assembled.z*2,'front/rear shells separate');
    mixer.setTime(0);assert(size().distanceTo(assembled)<1e-5,'scroll back restores exact assembled bounds');
    const actors=new Map();gltf.scene.traverse(o=>{if(Number.isInteger(o.userData.partId))actors.set(o.userData.partId,o);});
    assert.equal(actors.size,71,'every part has an explicit instance assignment');
    const near=(a,b,message)=>assert(a.distanceTo(b)<.00002,message);
    mixer.setTime(.05);
    for(const [id,distance] of [[8,-.1225],[24,.1225],[13,-.13],[21,.13]])near(actors.get(id).position,new Vector3(distance,0,0),'all four exterior screws withdraw together in the first batch');
    for(const id of [7,11,12])near(actors.get(id).position,new Vector3(0,0,0),'later screws wait for their own batch');
    mixer.setTime(.5);
    near(actors.get(34).position,new Vector3(0,0,0),'jaw bracket waits until the side mechanisms clear');
    near(actors.get(29).position,new Vector3(0,0,0),'centre frame does not lift through the servo bracket');
    assert(actors.get(5).position.y<-.19,'front shell clears before the internal stack opens');
    mixer.setTime(.8);
    for(const id of [57,59,60,61,63,64,67,68])near(actors.get(id).position,actors.get(65).position,'SG90 components stay aligned with the carrier');
    near(actors.get(52).position,actors.get(53).position,'jaw servo shaft stays attached to its motor');
    mixer.setTime(clip.duration*.999999);
    assert(actors.get(34).position.z>actors.get(52).position.z+.025,'jaw bracket is separated above the motor');
    assert(actors.get(49).position.x<actors.get(4).position.x-.025,'small gear is clear of the side support');
    assert(actors.get(10).position.x>actors.get(4).position.x+.025,'driven gear is clear of the opposite support face');
    assert(actors.get(26).position.x<actors.get(34).position.x-.02,'bracket inserts leave the correct side of their holes');
    assert(actors.get(35).position.z<actors.get(29).position.z-.025,'bottom inserts withdraw below the centre frame');
    console.log(`Head bounds assembled ${assembled.toArray().map(n=>n.toFixed(3))}; exploded ${exploded.toArray().map(n=>n.toFixed(3))} m`);
  }
}
console.log('PASS: real GLTFLoader decoding, full geometry/normals, feature edges, clear panels, reversible head animation, default/resumed/manual/reduced rotation and scroll mapping.');
