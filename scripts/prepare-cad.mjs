// Reproducible web derivatives. Source STEP / GLB files remain untouched.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup, prune, weld, joinPrimitives, meshopt, getBounds} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder} from 'meshoptimizer';
import {BufferGeometry, BufferAttribute, EdgesGeometry} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {HEAD_SOURCE_SHA,HEAD_STAGES,headPlan,headPose} from './head-explosion.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifestPath=path.join(root,'src/data/models-web.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));
const sources=JSON.parse(fs.readFileSync(path.join(root,'src/data/models.json')));
const archive=path.join(root,'Portfolio Content/Generated CAD');
fs.mkdirSync(archive,{recursive:true});
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const linear=n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4;
const srgb=n=>n<=.0031308?n*12.92:1.055*n**(1/2.4)-.055;

for(const slug of ['baker-bot','ri3d','baker-head-exploded']){
  if(process.argv[2]&&process.argv[2]!==slug)continue;
  const isHead=slug==='baker-head-exploded';
  const native=slug==='baker-bot'&&fs.existsSync(path.join(archive,`${slug}-native.glb`));
  const source=isHead?'Head Assembly Exxxploded.glb':native?`${slug}-native.glb`:sources[slug].file;
  const preferred=isHead?path.join(root,'Portfolio Content',source):path.join(root,'public/models',source);
  const input=fs.existsSync(preferred)?preferred:path.join(archive,source);
  const doc=await io.read(input), scene=doc.getRoot().listScenes()[0];
  if(native){
    const basis=doc.createNode('Native STEP Z-up to glTF Y-up').setRotation([-Math.SQRT1_2,0,0,Math.SQRT1_2]);
    for(const child of scene.listChildren())basis.addChild(child);
    scene.addChild(basis);
  }
  const sourceInfo=native?{file:source,bytes:fs.statSync(input).size,source:'General Assembly - Baker Bot.step',
    sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'Portfolio Content/General Assembly - Baker Bot.step'))).digest('hex'),
    toleranceMeters:.00018,angularDeflection:.16,converter:'native OpenCascade 7.8.1'}:sources[slug];
  const parts=doc.getRoot().listNodes().filter(n=>n.getMesh());
  // Native exports may instance the same mesh several times. Give each node
  // independent primitive/material assignments before styling, then deduplicate
  // the resulting shared geometry again during compression.
  for(const node of parts){
    const original=node.getMesh(),copy=doc.createMesh(original.getName());
    for(const primitive of original.listPrimitives())copy.addPrimitive(primitive.clone());
    node.setMesh(copy);
  }
  const world=parts.map(n=>n.getWorldMatrix());
  const bounds=parts.map(n=>getBounds(n));
  if(isHead){
    if(crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex')!==HEAD_SOURCE_SHA)throw new Error('Head source changed: review explicit part-instance assignments before rebuilding.');
    // The Onshape GLB has Z-up geometry. Bake the existing instance transforms,
    // then add one canonical basis transform and an animated parent per part.
    const basis=doc.createNode('Head Z-up to Y-up').setRotation([-Math.SQRT1_2,0,0,Math.SQRT1_2]);
    const animation=doc.createAnimation('Head explode');
    const buffer=doc.getRoot().listBuffers()[0];
    const times=Float32Array.from({length:201},(_,i)=>i/200);
    const time=doc.createAccessor('Explosion time',buffer).setType('SCALAR').setArray(times);
    for(const [i,n] of parts.entries()){
      const offset=headPose(i,1),plan=headPlan(i);
      const parent=doc.createNode(`Explode ${i}: ${n.getName()}`).setExtras({partId:i,explodeOffset:offset,explodeMoves:plan.moves,motionGroup:plan.group,partLabel:plan.label});
      parent.addChild(n); n.setMatrix(world[i]); basis.addChild(parent);
      const output=doc.createAccessor(`Offset ${i}`,buffer).setType('VEC3').setArray(new Float32Array([...times].flatMap(t=>headPose(i,t))));
      const sampler=doc.createAnimationSampler().setInput(time).setOutput(output).setInterpolation('LINEAR');
      animation.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(parent).setTargetPath('translation').setSampler(sampler));
    }
    for(const n of scene.listChildren()) scene.removeChild(n);
    scene.addChild(basis);
  }
  let transparentParts=0, triangles=0, lineSegments=0;
  const lineMaterial=doc.createMaterial('CAD feature edges').setBaseColorFactor([.012,.018,.025,1]).setMetallicFactor(0).setRoughnessFactor(1);
  const buffer=doc.getRoot().listBuffers()[0];
  for(const [partIndex,node] of parts.entries()){
    const mesh=node.getMesh(), name=node.getName();
    const names=[name];let ancestor=node.getParentNode();while(ancestor){names.push(ancestor.getName());ancestor=ancestor.getParentNode();}
    const extent=bounds[partIndex].max.map((v,i)=>v-bounds[partIndex].min[i]);
    const sorted=[...extent].sort((a,b)=>a-b);
    // The three RI3D hopper walls are unnamed 1.5 mm sheets, not the blue
    // shooter plates or the thicker floor plates. Confirmed from source bounds.
    const clear=mesh.listPrimitives().some(p=>p.getMaterial()?.getAlphaMode()==='BLEND'&&p.getMaterial().getBaseColorFactor()[3]<.5)||
      /polycarb|polycarbonate|acrylic|glass|clear panel|Battery Compartment Back PC/i.test(names.join(' / '))||
      (slug==='ri3d'&&name==='Part 1'&&sorted[0]<.0017&&sorted[1]>.2&&sorted[2]>.3);
    if(clear)transparentParts++;
    node.setExtras({...node.getExtras(),sourcePart:name,clearPanel:clear});
    const groups=new Map();
    for(const p of mesh.listPrimitives()){
      const original=p.getMaterial(), key=original?.getName()||'Default';
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(p);
    }
    // Merge the numerous same-material face primitives inside each part only.
    for(const primitives of groups.values())if(primitives.length>1){
      const merged=joinPrimitives(primitives); for(const p of primitives){mesh.removePrimitive(p);p.dispose();} mesh.addPrimitive(merged);
    }
    for(const p of mesh.listPrimitives()){
      triangles+=(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3;
      const old=p.getMaterial();
      const parsed=old?.getName().startsWith('CAD ')?old.getName().slice(4).split(',').map(Number):old?.getName().split('_').slice(0,3).map(Number);
      const rgb=parsed?.length===3&&parsed.every(Number.isFinite)?parsed:(old?.getBaseColorFactor().slice(0,3).map(srgb)||[.65,.67,.7]);
      const average=rgb.reduce((a,b)=>a+b)/3, neutral=Math.max(...rgb)-Math.min(...rgb)<.12;
      const metal=/alum|steel|shaft|bearing|bolt|screw|pin$|insert|spacer|churro|pulley|gearbox/i.test(name);
      let display=neutral&&average>.55?(metal?[.69,.72,.76]:average>.88?[.82,.83,.85]:[.65,.68,.71]):rgb.map(v=>Math.max(.065,v*.9));
      const mat=doc.createMaterial(`${name}: ${old?.getName()||'finish'}`)
        .setBaseColorFactor([...display.map(linear),clear?.18:1])
        .setMetallicFactor(clear?0:metal?.62:0.04)
        .setRoughnessFactor(clear?.17:metal?.34:average<.25?.66:.43)
        .setAlphaMode(clear?'BLEND':'OPAQUE').setDoubleSided(clear);
      if(clear)mat.setBaseColorFactor([.72,.82,.88,.18]);
      p.setMaterial(mat);
    }
    // Feature lines only: a 35 degree crease threshold omits triangulation and
    // smooth cylinder tessellation. Generated offline, not on visitors' CPUs.
    if(Math.max(...extent)>.022){
      const geoms=mesh.listPrimitives().map(p=>{
        const g=new BufferGeometry();
        g.setAttribute('position',new BufferAttribute(new Float32Array(p.getAttribute('POSITION').getArray()),3));
        g.setIndex(new BufferAttribute(p.getIndices()?new Uint32Array(p.getIndices().getArray()):Uint32Array.from({length:p.getAttribute('POSITION').getCount()},(_,i)=>i),1));
        return g;
      });
      const combined=mergeGeometries(geoms,false);
      const edges=new EdgesGeometry(combined,35), array=edges.getAttribute('position').array;
      if(array.length){
        const a=doc.createAccessor(`${name} feature edges`,buffer).setType('VEC3').setArray(new Float32Array(array));
        mesh.addPrimitive(doc.createPrimitive().setMode(1).setAttribute('POSITION',a).setMaterial(lineMaterial));
        lineSegments+=array.length/6;
      }
      geoms.forEach(g=>g.dispose());combined.dispose();edges.dispose();
    }
  }
  await doc.transform(dedup(),weld(),prune());
  // Keep an uncompressed derivative for geometry/render diagnostics.
  await io.write(path.join(archive,`${slug}-studio.glb`),doc);
  await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:14}));
  const file=`${slug}-web.glb`, output=path.join(root,'public/models',file);
  await io.write(output,doc);
  const originalTriangles=Math.round(triangles);
  triangles=Math.round(doc.getRoot().listNodes().filter(n=>n.getMesh()).reduce((sum,n)=>sum+n.getMesh().listPrimitives().filter(p=>p.getMode()===4).reduce((a,p)=>a+(p.getIndices()?.getCount()||p.getAttribute('POSITION').getCount())/3,0),0));
  manifest[slug]={...(isHead?{}:sourceInfo),file,bytes:fs.statSync(output).size,parts:parts.length,triangles,originalTriangles,
    source:isHead?source:sourceInfo.source,sourceSha256:isHead?crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'):sourceInfo.sourceSha256,
    materialTreatment:'part-specific satin metal / polymer; clear polycarbonate',geometryTreatment:'full tessellation, no triangle simplification; 35 degree feature edges',
    compression:'EXT_meshopt_compression',lineSegments,transparentParts,...(isHead?{animation:'Head explode',animationParts:parts.length,animationStages:HEAD_STAGES,layout:'Explicit 71-part reference layout with staged axis-aligned extractions'}:{})};
  if(!isHead&&!native&&input===preferred){fs.copyFileSync(input,path.join(archive,path.basename(input)));fs.unlinkSync(input);}
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
  if(native){sources[slug]={...sourceInfo,parts:parts.length,triangles:originalTriangles};fs.writeFileSync(path.join(root,'src/data/models.json'),JSON.stringify(sources,null,2));}
  console.log(`${slug}: ${parts.length} parts, ${Math.round(triangles).toLocaleString()} triangles, ${lineSegments} edges, ${transparentParts} clear panels; ${(manifest[slug].bytes/1048576).toFixed(1)} MiB`);
}
