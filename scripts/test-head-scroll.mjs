// Exercise the actual scroll handler without needing a GPU or browser host.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
import {scrollExplosion} from '../src/lib/cad-motion.mjs';
const source=fs.readFileSync(new URL('../src/scripts/cad-viewer.ts',import.meta.url),'utf8');
const handler=stripTypeScriptTypes(source.slice(source.indexOf('  function onScroll('),source.indexOf('  function onPreference(')));
for(const reduced of [false,true]){
  const context=vm.createContext({manualExplosion:false,targetProgress:0,motion:{matches:reduced},
    document:{fullscreenElement:null},shell:{offsetHeight:500},track:{offsetHeight:1000,getBoundingClientRect:()=>({top:-150})},
    getComputedStyle:()=>({top:'100px'}),scrollExplosion,updateProgress:()=>{},invalidate:()=>{}
  });
  vm.runInContext(handler,context);vm.runInContext('onScroll()',context);
  assert.equal(context.targetProgress,.5,'scroll follows immediately with no activation, including reduced motion');
  context.manualExplosion=true;context.targetProgress=.8;vm.runInContext('onScroll()',context);
  assert.equal(context.targetProgress,.8,'resize/load refresh preserves a manual slider adjustment');
  vm.runInContext("onScroll({type:'scroll'})",context);
  assert.equal(context.targetProgress,.5,'the next page scroll resumes follow mode without a button');
  assert.equal(context.manualExplosion,false);
}
console.log('PASS: default scroll control, reduced-motion scroll response, slider override and automatic return to scroll mode.');
