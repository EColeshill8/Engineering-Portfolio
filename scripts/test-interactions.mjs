// Controlled DOM events exercise the real browser handlers without claiming browser QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {defaults,sampleDisplay,effectiveWeather} from '../src/lib/weather-engine.mjs';
const read=file=>stripTypeScriptTypes(fs.readFileSync(new URL(file,import.meta.url),'utf8')).replace(/^import[^\n]+\n/m,'');
function node(extra={}) {
  const listeners=new Map();
  return {textContent:'',hidden:false,...extra,addEventListener(type,listener){listeners.set(type,[...(listeners.get(type)||[]),listener]);},emit(type,event={}){for(const listener of listeners.get(type)||[])listener(event);},setAttribute(name,value){this[name]=value;}};
}
function weatherFixture(reduced=false) {
  const observers=[],frames=new Map();let serial=0;
  const motion=node({matches:reduced}),document=node({hidden:false,querySelectorAll(){return [demo];}});
  const fields={};
  for(const [key,value] of Object.entries({morning:12,day:18,evening:14,night:8,condition:800,clouds:20,rainProbability:80,display:'cycle',period:0})) {
    const output={value:''};
    fields[key]=node({value:String(value),checked:true,selectedOptions:[{textContent:'Rain'}],closest(){return {querySelector(){return output;}};}});
  }
  fields.effects=node({checked:true});fields.daytimeRain=node({checked:true});
  const form=node({elements:{namedItem(name){return fields[name];}}});
  const nodes=new Map([['[data-weather-form]',form],['[data-weather-play]',node()],['[data-weather-speed]',node({value:'4'})],['[data-weather-visual]',node({style:{setProperty(name,value){this[name]=value;}}})]]);
  const demo={querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector);}};
  class IntersectionObserver {constructor(callback){observers.push(callback);}observe(){}}
  vm.runInNewContext(read('../src/scripts/weather-demo.ts'),{defaults,sampleDisplay,effectiveWeather,document,window:{matchMedia:()=>motion,IntersectionObserver},IntersectionObserver,requestAnimationFrame(callback){const id=++serial;frames.set(id,callback);return id;},cancelAnimationFrame(id){frames.delete(id);},queueMicrotask});
  return {nodes,fields,form,motion,document,frames,visible(value){observers[0]([{isIntersecting:value}]);}};
}
const weather=weatherFixture();
assert.equal(weather.frames.size,0,'offscreen simulator does not animate');
weather.visible(true);assert.equal(weather.frames.size,1,'visible simulator starts');
weather.nodes.get('[data-weather-play]').emit('click');
assert.equal(weather.frames.size,0,'manual pause cancels the frame');
weather.visible(false);weather.visible(true);
assert.equal(weather.frames.size,0,'manual pause persists across visibility changes');
weather.fields.display.value='weather';weather.fields.condition.value='500';weather.fields.rainProbability.value='20';weather.form.emit('input');
assert.match(weather.nodes.get('[data-weather-status]').textContent,/does not pass/,'rain probability input changes the forecast gate');
assert.match(weather.nodes.get('[data-weather-period]').textContent,/Clear \/ cloudy/,'fallback weather is identified in the output');
weather.fields.rainProbability.value='80';weather.form.emit('input');
assert.match(weather.nodes.get('[data-weather-status]').textContent,/check passes/);
const reduced=weatherFixture(true);reduced.visible(true);
assert.equal(reduced.frames.size,0,'reduced-motion starts paused');
assert.equal(reduced.fields.effects.checked,false,'reduced-motion disables flashing effects');
reduced.nodes.get('[data-weather-play]').emit('click');assert.equal(reduced.frames.size,1,'explicit play remains available');
reduced.document.hidden=true;reduced.document.emit('visibilitychange');assert.equal(reduced.frames.size,0,'hidden tab stops animation');

function carouselFixture(cycling=false,reduced=false) {
  const timers=new Map();let serial=0,observe;
  const motion=node({matches:reduced}),document=node({hidden:false,querySelector(){return null;},querySelectorAll(){return [carousel];}});
  const track=node({children:[0,1,2].map(index=>({offsetLeft:index*100})),scrollLeft:0,scrollTo({left}){this.scrollLeft=left;this.emit('scroll');}});
  const previous=node(),next=node(),cycle=cycling ? node() : null,count=node(),controls=node({hidden:true});
  const elements={'[data-carousel-track]':track,'[data-carousel-prev]':previous,'[data-carousel-next]':next,'[data-carousel-cycle]':cycle,'[data-carousel-count]':count,'[data-carousel-controls]':controls};
  const carousel=node({dataset:{cycling:String(cycling)},querySelector(selector){return elements[selector];},contains(){return false;}});
  class IntersectionObserver {constructor(callback){observe=callback;}observe(){}}
  class ResizeObserver {observe(){}}
  vm.runInNewContext(read('../src/scripts/carousels.ts'),{document,window:{matchMedia:()=>motion,IntersectionObserver},IntersectionObserver,ResizeObserver,setTimeout(callback){const id=++serial;timers.set(id,callback);return id;},clearTimeout(id){timers.delete(id);}});
  return {track,previous,next,cycle,count,controls,carousel,timers,motion,document,visible(value){observe([{isIntersecting:value}]);}};
}
const gallery=carouselFixture();
assert.equal(gallery.controls.hidden,false);
assert.equal(gallery.previous.disabled,true);
gallery.next.emit('click');assert.equal(gallery.track.scrollLeft,100);
gallery.next.emit('click');assert.equal(gallery.next.disabled,true);
let prevented=false;
gallery.track.emit('keydown',{key:'Home',target:gallery.track,preventDefault(){prevented=true;}});
assert.equal(prevented,true);assert.equal(gallery.track.scrollLeft,0,'Home key returns to first photo');
const slideshow=carouselFixture(true);assert.equal(slideshow.timers.size,0);
slideshow.visible(true);assert.equal(slideshow.timers.size,1);
slideshow.carousel.emit('mouseenter');assert.equal(slideshow.timers.size,0,'hover pauses cycling');
slideshow.carousel.emit('mouseleave');assert.equal(slideshow.timers.size,1);
slideshow.cycle.emit('click');slideshow.visible(false);slideshow.visible(true);
assert.equal(slideshow.timers.size,0,'manual slideshow pause persists');
const stillGallery=carouselFixture(true,true);stillGallery.visible(true);
assert.equal(stillGallery.timers.size,0,'reduced-motion gallery does not cycle');
console.log('PASS: weather inputs and fallback UI, manual/reduced-motion pause, carousel keyboard navigation and visible-only slideshow timing.');
