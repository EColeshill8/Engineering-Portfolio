export const clamp01=value=>Math.max(0,Math.min(1,value));
export const smoothstep=value=>{const t=clamp01(value);return t*t*(3-2*t);};
export function scrollExplosion(top,trackHeight,viewerHeight,stickyTop){
  return smoothstep((stickyTop-top)/Math.max(1,trackHeight-viewerHeight));
}
export function createTurntable(reduced=false){
  let wanted=!reduced,dragging=false,resumeAt=0;
  return {
    get wanted(){return wanted;},
    toggle(){wanted=!wanted;},
    preference(value){wanted=!value;},
    begin(){dragging=true;},
    end(now){dragging=false;resumeAt=now+1600;},
    inspect(now){resumeAt=now+1600;},
    canRotate(visible,hidden,now){return wanted&&visible&&!hidden&&!dragging&&now>=resumeAt;}
  };
}
