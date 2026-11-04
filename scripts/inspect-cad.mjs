import fs from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {getBounds} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
for(const file of process.argv.slice(2)) {
  const doc=await io.read(file), root=doc.getRoot();
  if(process.env.CAD_SUMMARY_ONLY){console.log(JSON.stringify({file,bounds:getBounds(root.listScenes()[0]),parts:root.listNodes().filter(n=>n.getMesh()).length,clear:root.listNodes().filter(n=>n.getExtras().clearPanel).map(n=>n.getName()),animations:root.listAnimations().map(a=>a.getName())},null,2));continue;}
  if(process.env.CAD_ANIM_ONLY){
    console.log(JSON.stringify(root.listNodes().filter(n=>n.getName().startsWith('Explode')).slice(0,6).map(n=>({name:n.getName(),translation:n.getTranslation(),extras:n.getExtras()})),null,2));continue;
  }
  if(process.env.CAD_PANELS_ONLY) {
    for(const n of root.listNodes().filter(n=>n.getMesh())) {
      const b=getBounds(n), size=b.max.map((v,i)=>v-b.min[i]), sorted=[...size].sort((a,b)=>a-b);
      if(sorted[0]<0.008 && sorted[1]>0.1) console.log(JSON.stringify({name:n.getName(),size,bounds:b,colors:n.getMesh().listPrimitives().map(p=>p.getMaterial()?.getName())}));
    }
    continue;
  }
  console.log(JSON.stringify({file,bytes:fs.statSync(file).size,bounds:getBounds(root.listScenes()[0]),
    animations:root.listAnimations().map(a=>({name:a.getName(),channels:a.listChannels().length})),
    materials:root.listMaterials().map(m=>({name:m.getName(),color:m.getBaseColorFactor(),alpha:m.getAlphaMode(),extensions:m.listExtensions().map(e=>e.extensionName)})),
    nodes:root.listNodes().filter(n=>n.getMesh()).map(n=>process.env.CAD_NAMES_ONLY ? n.getName() : ({name:n.getName(),translation:n.getTranslation(),bounds:getBounds(n),primitives:n.getMesh().listPrimitives().length,extras:n.getExtras()}))},null,2));
}
