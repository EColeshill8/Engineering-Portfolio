/* Offline conversion only. occt-import-js is not shipped to site visitors. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = path.resolve(process.argv[2] || path.join(root, '../../work/source-media/Portfolio Content'));
const items = [
  ['ri3d', 'Full Assembly - Ri3D - 2026.step'],
  ['baker-bot', 'General Assembly - Baker Bot.step']
];
const manifestPath = path.join(root, 'src/data/models.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : {};
const srgb = n => n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);

function makeGLB(result) {
  const chunks = [], bufferViews = [], accessors = [], materials = [], meshes = [], nodes = [];
  const materialMap = new Map();
  let offset = 0, triangles = 0;
  function accessor(array, componentType, type, count, limits) {
    const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
    const view = bufferViews.push({buffer: 0, byteOffset: offset, byteLength: bytes.length}) - 1;
    chunks.push(bytes);
    offset += bytes.length;
    const pad = (4 - offset % 4) % 4;
    if (pad) {chunks.push(Buffer.alloc(pad)); offset += pad;}
    return accessors.push({bufferView: view, componentType, count, type, ...limits}) - 1;
  }
  function material(color) {
    const rgb = color || [0.62, 0.66, 0.7];
    const key = rgb.map(n => n.toFixed(3)).join(',');
    if (!materialMap.has(key)) {
      materialMap.set(key, materials.push({name: `CAD ${key}`, pbrMetallicRoughness: {
        baseColorFactor: [...rgb.slice(0, 3).map(srgb), 1], metallicFactor: 0.12, roughnessFactor: 0.65
      }, doubleSided: true}) - 1);
    }
    return materialMap.get(key);
  }
  for (const mesh of result.meshes) {
    const position = new Float32Array(mesh.attributes.position.array);
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < position.length; i++) {min[i % 3] = Math.min(min[i % 3], position[i]); max[i % 3] = Math.max(max[i % 3], position[i]);}
    const attributes = {POSITION: accessor(position, 5126, 'VEC3', position.length / 3, {min, max})};
    if (mesh.attributes.normal) attributes.NORMAL = accessor(new Float32Array(mesh.attributes.normal.array), 5126, 'VEC3', position.length / 3);
    const sourceIndices = mesh.index.array;
    const groups = new Map();
    const faces = mesh.brep_faces?.length ? mesh.brep_faces : [{first: 0, last: sourceIndices.length / 3 - 1, color: mesh.color}];
    for (const face of faces) {
      const mat = material(face.color || mesh.color);
      if (!groups.has(mat)) groups.set(mat, []);
      const target = groups.get(mat);
      for (let i = face.first * 3; i < (face.last + 1) * 3; i++) target.push(sourceIndices[i]);
    }
    const primitives = [];
    for (const [mat, indices] of groups) {
      if (!indices.length) continue;
      triangles += indices.length / 3;
      const ArrayType = position.length / 3 <= 65535 ? Uint16Array : Uint32Array;
      primitives.push({attributes, indices: accessor(new ArrayType(indices), ArrayType === Uint16Array ? 5123 : 5125, 'SCALAR', indices.length), material: mat});
    }
    if (!primitives.length) continue;
    const index = meshes.push({name: mesh.name || 'Assembly part', primitives}) - 1;
    nodes.push({name: mesh.name || 'Assembly part', mesh: index});
  }
  const childIndices = nodes.map((_, i) => i);
  nodes.push({name: 'STEP Z-up to glTF Y-up', rotation: [-Math.SQRT1_2, 0, 0, Math.SQRT1_2], children: childIndices});
  const binary = Buffer.concat(chunks);
  const json = {asset: {version: '2.0', generator: 'Elias portfolio / OpenCascade tessellation'}, scene: 0,
    scenes: [{nodes: [nodes.length - 1]}], nodes, meshes, materials, accessors, bufferViews, buffers: [{byteLength: binary.length}]};
  const rawJson = Buffer.from(JSON.stringify(json));
  const jsonChunk = Buffer.concat([rawJson, Buffer.alloc((4 - rawJson.length % 4) % 4, 32)]);
  const header = Buffer.alloc(12), jsonHeader = Buffer.alloc(8), binHeader = Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binary.length, 8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0); jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  binHeader.writeUInt32LE(binary.length, 0); binHeader.writeUInt32LE(0x004e4942, 4);
  return {data: Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binary]), triangles, parts: meshes.length};
}

(async () => {
  const occt = await require('occt-import-js')();
  for (const [slug, filename] of items) {
    console.log(`Reading ${filename}`);
    const bytes = fs.readFileSync(path.join(source, filename));
    const result = occt.ReadStepFile(bytes, {linearUnit: 'meter', linearDeflectionType: 'absolute_value', linearDeflection: 0.00075, angularDeflection: 0.4});
    if (!result.success || !result.meshes?.length) throw new Error(`STEP conversion failed: ${filename}`);
    const output = makeGLB(result);
    fs.writeFileSync(path.join(root, `public/models/${slug}.glb`), output.data);
    manifest[slug] = {file: `${slug}.glb`, bytes: output.data.length, parts: output.parts, triangles: output.triangles,
      source: filename, sourceSha256: crypto.createHash('sha256').update(bytes).digest('hex'), toleranceMeters: 0.00075};
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`${slug}: ${output.parts} parts, ${output.triangles} triangles, ${(output.data.length / 1048576).toFixed(1)} MiB`);
  }
})().catch(e => {console.error(e); process.exitCode = 1;});
