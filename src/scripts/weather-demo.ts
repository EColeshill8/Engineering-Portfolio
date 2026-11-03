import {defaults, sampleDisplay, effectiveWeather} from '../lib/weather-engine.mjs';
document.querySelectorAll<HTMLElement>('[data-weather-demo]').forEach(demo=>{
  const form=demo.querySelector<HTMLFormElement>('[data-weather-form]')!;
  const visual=demo.querySelector<HTMLElement>('[data-weather-visual]')!;
  const play=demo.querySelector<HTMLButtonElement>('[data-weather-play]')!;
  const speed=demo.querySelector<HTMLSelectElement>('[data-weather-speed]')!;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const periods=['Morning','Afternoon','Evening','Night'];
  const names=['morning','day','evening','night'];
  let input={...defaults,temperatures:[...defaults.temperatures]};
  let time=0,last=0,frame=0,inView=false,paused=motion.matches;
  const field=(name:string)=>form.elements.namedItem(name) as HTMLInputElement;
  const render=()=>{
    const mode=field('display').value;
    const result=sampleDisplay(input,time,mode,Number(field('period').value),field('effects').checked && !motion.matches);
    const rgb=result.rgb.join(', ');
    visual.style.setProperty('--led-rgb',rgb);
    visual.setAttribute('aria-label',`LED strip preview: ${result.label}, RGB ${rgb}`);
    demo.querySelector('[data-weather-phase]')!.textContent=result.label;
    const condition=(form.elements.namedItem('condition') as HTMLSelectElement).selectedOptions[0].textContent;
    demo.querySelector('[data-weather-period]')!.textContent=result.label==='Weather' ? `${result.code!==input.code ? 'Clear / cloudy sky' : condition} · ${input.clouds}% clouds` : `${periods[result.stage]} · ${input.temperatures[result.stage]}°C feels like`;
    demo.querySelector('[data-weather-rgb]')!.textContent=rgb;
    demo.querySelector('[data-weather-brightness]')!.textContent=`${Math.round(result.brightness*1000)/10}%`;
  };
  const animate=(now:number)=>{
    if(last) time+=(now-last)*Number(speed.value);
    last=now;render();frame=requestAnimationFrame(animate);
  };
  const sync=()=>{
    cancelAnimationFrame(frame);last=0;
    play.textContent=paused ? 'Play preview' : 'Pause preview';
    play.setAttribute('aria-pressed',String(!paused));
    if(!paused && inView && !document.hidden) frame=requestAnimationFrame(animate);
    else render();
  };
  const read=()=>{
    input={temperatures:names.map(name=>Number(field(name).value)),code:Number(field('condition').value),clouds:Number(field('clouds').value),rainProbability:Number(field('rainProbability').value),daytimeRain:field('daytimeRain').checked};
    names.forEach((name,index)=>{field(name).closest('label')!.querySelector('output')!.value=`${input.temperatures[index]}°C`;});
    demo.querySelector<HTMLOutputElement>('[data-clouds-value]')!.value=`${input.clouds}%`;
    demo.querySelector<HTMLOutputElement>('[data-rain-value]')!.value=`${input.rainProbability}%`;
    const rain=[3,5].includes(Math.trunc(input.code/100));
    demo.querySelector<HTMLElement>('[data-weather-rain]')!.hidden=!rain;
    demo.querySelector<HTMLElement>('[data-weather-stage-select]')!.hidden=field('display').value!=='temperature';
    demo.querySelector('[data-weather-status]')!.textContent=rain && effectiveWeather(input)!==input.code ? 'Rain does not pass the daytime check (7 a.m.–7 p.m., at least 60% probability). The display uses cloud-based weather instead.' : `Cloud cover sets the base brightness. ${rain ? 'The daytime rain check passes.' : 'Temperature colours use the feels-like forecast.'}`;
    render();
  };
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',read);
  form.addEventListener('change',read);
  form.addEventListener('reset',()=>{queueMicrotask(()=>{time=0;last=0;read();sync();});});
  play.addEventListener('click',()=>{paused=!paused;sync();});
  speed.addEventListener('change',()=>{last=0;});
  motion.addEventListener('change',()=>{if(motion.matches) {paused=true;field('effects').checked=false;}sync();});
  document.addEventListener('visibilitychange',sync);
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.15}).observe(visual);
  else {inView=true;sync();}
  if(motion.matches) field('effects').checked=false;
  read();sync();
});
