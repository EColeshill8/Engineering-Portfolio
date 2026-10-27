import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const base=(process.env.BASE_PATH || '/').replace(/\/$/,'');
const files=fs.readdirSync(dist,{recursive:true}).filter(f=>f.endsWith('.html'));
const failures=[];
let links=0;
function resolveReference(value,from){
  if (!value || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return;
  const relative=from==='index.html' ? '/' : '/'+from.replaceAll(path.sep,'/').replace(/index\.html$/,'');
  const url=new URL(value.replaceAll('&amp;','&'),'https://local.invalid'+base+relative);
  if (url.origin!=='https://local.invalid') return;
  let pathname=decodeURIComponent(url.pathname);
  if(base){if(!pathname.startsWith(base+'/') && pathname!==base){failures.push(`${from}: URL escapes base: ${value}`);return;} pathname=pathname.slice(base.length);}
  let target=path.join(dist,pathname);
  if(fs.existsSync(target) && fs.statSync(target).isDirectory()) target=path.join(target,'index.html');
  if(!fs.existsSync(target)){failures.push(`${from}: missing ${value}`);return;}
  if(url.hash && target.endsWith('.html')){
    const html=fs.readFileSync(target,'utf8');
    if(!html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) failures.push(`${from}: missing anchor ${value}`);
  }
  links++;
}
for(const file of files){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  if((html.match(/<h1\b/g)||[]).length!==1)failures.push(`${file}: expected one H1`);
  if(!/<title>[^<]+<\/title>/.test(html))failures.push(`${file}: missing title`);
  if(!/name="description"/.test(html))failures.push(`${file}: missing description`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(ids).size!==ids.length)failures.push(`${file}: duplicate element IDs`);
  for(const match of html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g))resolveReference(match[1],file);
  for(const match of html.matchAll(/<img\b[^>]*>/g))if(!/\balt=/.test(match[0]))failures.push(`${file}: image without alt attribute`);
}
const models=JSON.parse(fs.readFileSync(path.join(root,'src/data/models-web.json')));
for(const slug of ['ri3d','baker-bot']){
  const model=models[slug];
  if(!model){failures.push(`missing ${slug} model`);continue;}
  const bytes=fs.readFileSync(path.join(dist,'models',model.file));
  if(bytes.readUInt32LE(0)!==0x46546c67 || bytes.readUInt32LE(4)!==2 || bytes.readUInt32LE(8)!==bytes.length)failures.push(`${slug}: invalid GLB header`);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  if(!json.meshes?.length || !json.extensionsUsed?.includes('EXT_meshopt_compression'))failures.push(`${slug}: missing compressed geometry`);
  if(bytes.length!==model.bytes)failures.push(`${slug}: manifest size mismatch`);
  if(model.toleranceMeters > (slug==='ri3d' ? 0.00035 : 0.00075))failures.push(`${slug}: CAD export exceeds the detail tolerance`);
  if(model.triangles < model.originalTriangles * (slug==='ri3d' ? 0.8 : 0.75))failures.push(`${slug}: geometry was simplified below the detail budget`);
  if(json.materials.some(material=>Math.max(...material.pbrMetallicRoughness.baseColorFactor.slice(0,3))>0.85))failures.push(`${slug}: an untuned white CAD material remains`);
}
if(fs.readdirSync(path.join(dist,'models')).filter(name=>name.endsWith('.glb')).length!==2)failures.push('raw CAD exports must not be deployed');
const media=JSON.parse(fs.readFileSync(path.join(root,'src/data/media.json')));
for(const item of Object.values(media))for(const variant of Object.values(item.variants))if(!fs.existsSync(path.join(dist,'media',variant.file)))failures.push(`missing photo ${variant.file}`);
const videos=JSON.parse(fs.readFileSync(path.join(root,'src/data/videos.json')));
for(const [key,item] of Object.entries(videos)){
  const bytes=fs.readFileSync(path.join(dist,'videos',item.file));
  if(bytes.length!==item.bytes || createHash('sha256').update(bytes).digest('hex')!==item.sha256)failures.push(`${key}: video does not match prepared manifest`);
  const atoms=[];
  for(let offset=0;offset+8<=bytes.length;){
    const size=bytes.readUInt32BE(offset);
    if(size<8 || offset+size>bytes.length){failures.push(`${key}: invalid MP4 container`);break;}
    atoms.push(bytes.toString('ascii',offset+4,offset+8));offset+=size;
  }
  if(atoms[0]!=='ftyp' || !atoms.includes('moov') || !atoms.includes('mdat') || atoms.indexOf('moov')>atoms.indexOf('mdat'))failures.push(`${key}: MP4 is not ready for progressive playback`);
  if(!media[item.poster])failures.push(`${key}: missing poster image`);
}
const baker=fs.readFileSync(path.join(dist,'projects/baker-bot/index.html'),'utf8');
const headVideo=baker.match(/<video\b[^>]*data-loop-video[^>]*>/)?.[0] || '';
if(!['muted','loop','playsinline','controls','poster='].every(attribute=>headVideo.includes(attribute)) || !baker.includes('baker-head-test.mp4') || !baker.includes('whole-robot coordination and AI-driven gestures remain in development'))failures.push('Baker Bot head test, playback controls, poster or subsystem disclosure missing');
const projectDirs=fs.readdirSync(path.join(dist,'projects'),{withFileTypes:true}).filter(x=>x.isDirectory());
if(projectDirs.length!==12)failures.push(`expected 12 project pages, found ${projectDirs.length}`);
if(!fs.readFileSync(path.join(dist,'projects/wec-2024/index.html'),'utf8').includes('6th place'))failures.push('WEC 2024 correction missing');
if(!fs.existsSync(path.join(dist,'sitemap.xml')) || !fs.existsSync(path.join(dist,'robots.txt')))failures.push('missing search metadata');
const combat=fs.readFileSync(path.join(dist,'projects/combat-robotics/index.html'),'utf8');
if(!combat.includes('TEMPORARY REFERENCE MEDIA') || !combat.includes('botbrawl-logo-1400.webp') || !combat.includes('Logo: BotBrawl Canada') || !combat.includes('Liam Haddock') || !combat.includes('XHBQaKOk97Y'))failures.push('combat logo, reference disclosure, credits or video missing');
if(!combat.includes('combat-clutch-1400.webp') || !combat.includes('design study, not a built mechanism'))failures.push('combat concept sketch or design-stage disclosure missing');
const fio=fs.readFileSync(path.join(dist,'projects/fio-production-engineering/index.html'),'utf8');
if(!fio.includes('fio-logo-1400.webp') || !fio.includes('futabanorthamerica.com/ontario'))failures.push('official FIO logo or source credit missing');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${files.length} HTML pages, ${projectDirs.length} case studies, ${links} local references, ${Object.keys(media).length} image sources, ${Object.keys(videos).length} progressive MP4 and 2 shaded compressed GLB models. Base: ${base || '/'}`);
