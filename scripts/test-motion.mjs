// Exercise the real client playback logic with browser media/visibility events.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';

const client=stripTypeScriptTypes(fs.readFileSync(new URL('../src/scripts/client.ts',import.meta.url),'utf8'));
function eventNode(extra={}){
  const listeners=new Map();
  return {...extra,
    addEventListener(type,listener){const list=listeners.get(type)||[];list.push(listener);listeners.set(type,list);},
    emit(type){for(const listener of listeners.get(type)||[])listener();}
  };
}
function fixture(reduced=false,blocked=false){
  let observe;
  const source=eventNode();
  const video=eventNode({paused:true,muted:false,defaultMuted:false,autoplay:false,
    querySelector(){return source;},
    toggleAttribute(name,value){this[name]=value;},
    removeAttribute(name){this[name]=false;},
    play(){if(blocked)return Promise.reject(new Error('Autoplay blocked'));if(this.paused){this.paused=false;this.emit('play');}return Promise.resolve();},
    pause(){if(!this.paused){this.paused=true;this.emit('pause');}}
  });
  const toggle=eventNode({hidden:true,textContent:''}),error={hidden:true};
  const section={querySelector(selector){return {'[data-loop-video]':video,'[data-loop-toggle]':toggle,'[data-loop-error]':error}[selector];}};
  const motion=eventNode({matches:reduced});
  const document=eventNode({hidden:false,querySelector(){return null;},querySelectorAll(selector){return selector==='[data-loop-clip]'?[section]:[];}});
  class IntersectionObserver{constructor(listener){observe=listener;}observe(){}}
  vm.runInNewContext(client,{document,window:{matchMedia:()=>motion,IntersectionObserver},IntersectionObserver});
  return {video,toggle,error,source,motion,document,visible(value){observe([{isIntersecting:value}]);}};
}
const normal=fixture();
normal.visible(true);
assert.equal(normal.video.paused,false,'visible video autoplays');
assert.equal(normal.video.muted,true,'autoplay is silent');
normal.toggle.emit('click');
normal.visible(false);normal.visible(true);
assert.equal(normal.video.paused,true,'manual pause persists after scrolling');
normal.toggle.emit('click');normal.visible(false);
assert.equal(normal.video.paused,true,'offscreen playback pauses');
normal.visible(true);
assert.equal(normal.video.paused,false,'automatic offscreen pause resumes on return');
normal.document.hidden=true;normal.document.emit('visibilitychange');
assert.equal(normal.video.paused,true,'background tab pauses');
normal.document.hidden=false;normal.document.emit('visibilitychange');
assert.equal(normal.video.paused,false,'foreground tab resumes');
normal.motion.matches=true;normal.motion.emit('change');
assert.equal(normal.video.paused,true,'enabling reduced motion stops automatic playback');
assert.equal(normal.video.autoplay,false,'reduced motion removes autoplay');
const reduced=fixture(true);
reduced.visible(true);
assert.equal(reduced.video.paused,true,'reduced-motion visitors start with the poster');
reduced.toggle.emit('click');
assert.equal(reduced.video.paused,false,'explicit play remains available with reduced motion');
reduced.visible(false);reduced.visible(true);
assert.equal(reduced.video.paused,true,'reduced-motion playback does not resume automatically');
reduced.source.emit('error');
assert.equal(reduced.error.hidden,false,'source failure exposes the direct-link fallback');
const blocked=fixture(false,true);
blocked.visible(true);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(blocked.video.paused,true,'blocked autoplay remains paused');
assert.equal(blocked.toggle.textContent,'Play head test','blocked autoplay offers manual play');
console.log('PASS: motion preferences, manual pause, viewport/tab visibility, blocked autoplay and source failure.');
