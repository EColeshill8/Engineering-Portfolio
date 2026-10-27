// Fast material revisions of an existing web assembly, without changing its geometry.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder} from 'meshoptimizer';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const manifestPath = path.join(root,'src/data/models-web.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath));
const linear = n => n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
for (const [slug, info] of Object.entries(manifest)) {
  if (process.argv[2] && process.argv[2] !== slug) continue;
  const filename = path.join(root,'public/models',info.file);
  const document = await io.read(filename);
  for (const material of document.getRoot().listMaterials()) {
    // The converter retains original STEP display RGB values in material names.
    const match = /^CAD ([\d.]+),([\d.]+),([\d.]+)$/.exec(material.getName());
    if (!match) throw new Error(`Original STEP colour missing: ${material.getName()}`);
    const rgb = match.slice(1).map(Number);
    const average = rgb.reduce((a,b) => a+b,0) / 3;
    const neutral = Math.max(...rgb) - Math.min(...rgb) < 0.12;
    const display = neutral && average > 0.55 ? [0.64,0.68,0.73] : rgb.map(n => Math.max(0.055,n*0.92));
    material.setBaseColorFactor([...display.map(linear),1])
      .setMetallicFactor(neutral && average > 0.35 ? 0.42 : 0.06)
      .setRoughnessFactor(average < 0.18 ? 0.82 : neutral ? 0.48 : 0.6)
      .setDoubleSided(false);
  }
  await document.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:12}));
  await io.write(filename,document);
  info.bytes = fs.statSync(filename).size;
  info.materialTreatment = 'satin-metal / matte-polymer viewing palette';
  info.geometryTreatment = 'retained existing detailed assembly';
  console.log(`${slug}: ${info.triangles.toLocaleString()} triangles retained; ${(info.bytes/1048576).toFixed(1)} MiB`);
}
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
