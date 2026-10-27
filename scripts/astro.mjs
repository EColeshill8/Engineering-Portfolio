import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const astroRoot = path.join(root,'node_modules/astro');
const manifest = JSON.parse(fs.readFileSync(path.join(astroRoot,'package.json'),'utf8'));
const child = spawn(process.execPath,[path.join(astroRoot,manifest.bin.astro),...process.argv.slice(2)],{
  cwd:root,stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'}
});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code ?? 1;});
