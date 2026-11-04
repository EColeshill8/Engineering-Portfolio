// Execute the actual page bootstrap with a controlled renderer promise. This
// verifies load/retry/fallback behavior; GPU rendering is tested separately.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
const code=stripTypeScriptTypes(fs.readFileSync(new URL('../src/scripts/client.ts',import.meta.url),'utf8'))
  .replace("await import('./cad-viewer')",'await getCADModule()');
function node(extra={}){
  const handlers=new Map();return {hidden:false,disabled:false,textContent:'',...extra,
    addEventListener(name,fn){handlers.set(name,[...(handlers.get(name)||[]),fn]);},
    emit(name){for(const fn of handlers.get(name)||[])fn();},
    setAttribute(name,value){this[name]=value;},removeAttribute(name){delete this[name];}
  };
}
function fixture(){
  const launch=node(),poster=node(),status=node(),actions=node({hidden:true}),explosion=node({hidden:true}),spin=node();
  const classes=new Set(),stage=node({querySelector:()=>poster});
  const shell=node({dataset:{modelSrc:'/models/test.glb'},classList:{add:s=>classes.add(s),remove:s=>classes.delete(s)},querySelectorAll:()=>[],querySelector:s=>({
    '[data-model-launch]':launch,'[data-model-stage]':stage,'[data-model-status]':status,'[data-model-actions]':actions,'[data-model-spin]':spin,
    '[data-model-explosion-controls]':explosion
  })[s]});
  let observe,loadCount=0,disposeCount=0,fail=false,pending,resolvePending,rejectPending;
  const timers=new Set();
  const document=node({querySelector:()=>null,querySelectorAll:s=>s==='[data-model-shell]'?[shell]:[]});
  class IntersectionObserver{constructor(fn){observe=fn;}observe(){}}
  vm.runInNewContext(code,{document,window:{IntersectionObserver},IntersectionObserver,
    setTimeout:fn=>{timers.add(fn);return fn;},clearTimeout:fn=>timers.delete(fn),
    getCADModule:async()=>({createCADViewer:async()=>{loadCount++;if(fail)throw new Error('Source failed');if(pending)await pending;return {dispose:()=>disposeCount++};}})
  });
  return {launch,poster,status,actions,explosion,shell,classes,
    visible:()=>observe([{isIntersecting:true}]),fail:()=>{fail=true;},succeed:()=>{fail=false;},
    hold:()=>{pending=new Promise((resolve,reject)=>{resolvePending=resolve;rejectPending=reject;});},release:()=>resolvePending(),reject:()=>rejectPending(new Error('Late failure')),allowNext:()=>{pending=undefined;},
    timeout:()=>{for(const fn of [...timers])fn();},get loads(){return loadCount;},get disposals(){return disposeCount;}
  };
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const good=fixture();good.visible();await settle();
assert.equal(good.loads,1);assert(good.launch.hidden);assert(good.poster.hidden);assert(!good.actions.hidden);assert(good.classes.has('model-loaded'));
good.visible();await settle();assert.equal(good.loads,1,'reentering the viewport does not reload');
const bad=fixture();bad.fail();bad.visible();await settle();
assert(!bad.launch.hidden&&!bad.launch.disabled&&!bad.poster.hidden&&bad.actions.hidden,'failed source preserves poster and retry');
bad.succeed();bad.launch.emit('click');await settle();assert.equal(bad.loads,2);assert(bad.poster.hidden,'retry can load successfully');
bad.shell.emit('model-error');assert.equal(bad.disposals,1);assert(!bad.poster.hidden&&bad.actions.hidden,'context failure restores poster');
const slow=fixture();slow.hold();slow.visible();await settle();slow.timeout();
assert(!slow.poster.hidden&&!slow.launch.hidden,'timeout exposes the fallback');
slow.release();await settle();assert.equal(slow.disposals,1,'late renderer is disposed rather than replacing the fallback');assert(!slow.poster.hidden);
const late=fixture();late.hold();late.visible();await settle();late.timeout();late.allowNext();late.launch.emit('click');await settle();
assert(late.poster.hidden,'retry loads while the earlier request is pending');late.reject();await settle();assert(late.poster.hidden,'late failure cannot remove the successful retry');
console.log('PASS: actual CAD page bootstrap, visible-only loading, retry, context failure, timeout and late-load cleanup.');
