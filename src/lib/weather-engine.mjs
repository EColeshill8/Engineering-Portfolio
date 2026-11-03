// Browser port of HSVColor.cpp / ColorEngine.cpp and the display timing in main.cpp.
// Private network/API configuration from the source archive is deliberately excluded.
export const temperatureStops = [
  [-40,235,1,.70],[-25,220,1,.85],[-15,205,.95,.95],[-5,192,.85,1],
  [8.9999,185,.70,.95],[9,48,.75,.90],[11,42,.90,.95],[18,32,1,1],
  [24,20,1,1],[32,16,1,1],[45,0,1,1]
];
export const timings = {temperatureStage:30000, temperature:20000, weather:10000, fade:2000, startup:2500, resetFade:600, resetHold:300};
export const defaults = {temperatures:[12,18,14,8], code:800, clouds:20, rainProbability:80, daytimeRain:true};
export const clamp = (value,min=0,max=1) => Math.min(max,Math.max(min,value));
export const smoothstep = value => {const t=clamp(value);return t*t*(3-2*t);};
export const mix = (a,b,t) => a.map((v,i)=>v+(b[i]-v)*clamp(t));
export function hsvToRgb(h,s,v) {
  h=clamp(h);s=clamp(s);v=clamp(v);
  const i=Math.floor(h*6), f=h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
  return [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];
}
export function temperatureColor(temperature) {
  const value=clamp(temperature,-40,45);
  let lower=temperatureStops[0], upper=lower;
  for(let i=0;i<temperatureStops.length-1;i++) {
    if(value>=temperatureStops[i][0] && value<=temperatureStops[i+1][0]) {lower=temperatureStops[i];upper=temperatureStops[i+1];break;}
  }
  if(value>=45) lower=upper=temperatureStops.at(-1);
  const t=lower===upper ? 0 : smoothstep((value-lower[0])/(upper[0]-lower[0]));
  const hsv=mix(lower.slice(1),upper.slice(1),t);
  return [...hsvToRgb(hsv[0]/360,hsv[1],hsv[2]),1];
}
export function cloudBrightness(clouds) {return 1-.5*clamp(clouds/100)**2;}
export function cloudCode(clouds) {return clouds>=85 ? 804 : clouds>=60 ? 803 : clouds>=25 ? 802 : clouds>15 ? 801 : 800;}
export function effectiveWeather(input) {
  const group=Math.trunc(input.code/100);
  return (group===3 || group===5) && (!input.daytimeRain || input.rainProbability<60) ? cloudCode(input.clouds) : input.code;
}
export function weatherColor(code,clouds) {
  switch(Math.trunc(code/100)) {
    case 2:return [.45,0,.75,1];
    case 3:return [.45,.55,.75,1];
    case 5:return [.15,.35,1,1];
    case 6:return [.9,.9,1,1];
    case 7:return [.55,.55,.55,1];
    case 8:return mix([.35,.70,1,.95],[.52,.52,.58,1],smoothstep(clouds/100));
    default:return [1,1,1,1];
  }
}
export function baseColor(input,mode,stage=0) {
  const wf=mode==='temperature' ? temperatureColor(input.temperatures[stage]) : weatherColor(effectiveWeather(input),input.clouds);
  return wf.slice(0,3).map(value=>Math.trunc(clamp(value*255*cloudBrightness(input.clouds)*wf[3],0,255)));
}
export function displayPhase(time) {
  const t=Math.max(0,time), stage=Math.floor(t/timings.temperatureStage)%4, within=t%30000;
  if(within>=20000 && within<22000) return {stage,from:'temperature',to:'weather',amount:smoothstep((within-20000)/2000),label:'Temperature → weather'};
  if(within>=22000) return {stage,from:'weather',to:'weather',amount:1,label:'Weather'};
  if(t>=30000 && within<2000) return {stage,from:'weather',to:'temperature',amount:smoothstep(within/2000),label:'Weather → temperature'};
  return {stage,from:'temperature',to:'temperature',amount:1,label:'Temperature'};
}
// Seeded samples provide repeatable previews of the firmware's random effects.
function randomAt(seed) {const n=Math.sin(seed*12.9898+78.233)*43758.5453;return n-Math.floor(n);}
export function applyEffects(rgb,code,time,weatherTime) {
  const group=Math.trunc(code/100);
  if(group===5) return rgb.map(v=>Math.trunc(v*(94+Math.floor(randomAt(Math.floor(time/350))*7))/100));
  if(group===7) {const average=Math.trunc(rgb.reduce((a,b)=>a+b,0)/3);return rgb.map(v=>Math.trunc((v+average)/2));}
  if(group===2) {
    // One 60 ms flash per slowly varying 4–12 s gap; the device uses random().
    const gap=4000+Math.floor(randomAt(Math.floor(time/12000))*8000);
    if(weatherTime>3000 && weatherTime%gap<60) return [255,255,255];
  }
  if(group===8 && time<30000) {
    // repeatEffect=false in the supplied firmware: the sunbeam runs once per wake.
    const t=weatherTime-1600;
    let hue=60, envelope=0;
    if(t>=0 && t<750) envelope=smoothstep(t/750);
    else if(t>=750 && t<1500) envelope=1;
    else if(t>=1500 && t<2250) {envelope=1;hue=60-40*smoothstep((t-1500)/750);}
    else if(t>=2250 && t<3000) {envelope=1;hue=20;}
    else if(t>=3000 && t<3750) {envelope=1;hue=20+40*smoothstep((t-3000)/750);}
    else if(t>=3750 && t<4250) envelope=1-smoothstep((t-3750)/500);
    const overlay=hsvToRgb(hue/360,1,1).map(v=>Math.trunc(v*255));
    return mix(rgb,overlay,envelope*.95).map(Math.trunc);
  }
  return rgb;
}
export function sampleDisplay(input,time,selection='cycle',selectedStage=0,effects=true) {
  const phase=selection==='cycle' ? displayPhase(time) : {stage:selectedStage,from:selection,to:selection,amount:1,label:selection==='temperature' ? 'Temperature' : 'Weather'};
  let rgb=mix(baseColor(input,phase.from,phase.stage),baseColor(input,phase.to,phase.stage),phase.amount).map(Math.trunc);
  const strength=(phase.from==='weather' ? 1:0)*(1-phase.amount)+(phase.to==='weather' ? 1:0)*phase.amount;
  const weatherTime=selection==='cycle' ? Math.max(0,time%30000-21840) : time;
  if(effects && strength>=.98) rgb=applyEffects(rgb,effectiveWeather(input),time,weatherTime);
  let brightness=selection==='cycle' ? smoothstep(time/2500) : 1;
  if(selection==='cycle' && time>=120000 && time%120000<1500) {
    const reset=time%120000;
    brightness*=reset<600 ? 1-smoothstep(reset/600) : reset<900 ? 0 : smoothstep((reset-900)/600);
  }
  rgb=rgb.map(v=>Math.trunc(clamp(v*brightness,0,255)));
  // writeLEDs() dims the green PWM channel to 95% after compositing.
  rgb[1]=Math.trunc(rgb[1]*.95);
  return {...phase,rgb,code:effectiveWeather(input),brightness:cloudBrightness(input.clouds)};
}
