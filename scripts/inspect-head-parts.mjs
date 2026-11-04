import fs from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {getBounds} from '@gltf-transform/functions';
const doc=await new NodeIO().read('Portfolio Content/Head Assembly Exxxploded.glb');
const parts=doc.getRoot().listNodes().filter(n=>n.getMesh()).map((n,id)=>{
  const b=getBounds(n),center=b.min.map((v,i)=>(v+b.max[i])*500),size=b.min.map((v,i)=>(b.max[i]-v)*1000);
  return {id,name:n.getName(),center,size,world:n.getWorldMatrix()};
});
for(const p of parts)console.log(`${String(p.id).padStart(2)} ${p.name.padEnd(46)} c ${p.center.map(n=>n.toFixed(2).padStart(7)).join(' ')} size ${p.size.map(n=>n.toFixed(2).padStart(7)).join(' ')}`);
fs.writeFileSync('Portfolio Content/Generated CAD/head-parts.json',JSON.stringify(parts,null,2));
const bytes=fs.readFileSync('Portfolio Content/Head Assembly Exxxploded.glb');
const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
console.log('Metadata root',JSON.stringify(json.extensions||{}).slice(0,1200));
console.log('Metadata node',JSON.stringify(json.nodes.find(n=>n.extensions)?.extensions||{}).slice(0,1800));
