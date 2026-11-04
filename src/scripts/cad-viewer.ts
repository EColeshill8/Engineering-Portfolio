import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {createTurntable,scrollExplosion,clamp01} from '../lib/cad-motion.mjs';

// One small renderer per visible assembly. Each stops drawing offscreen and in
// hidden tabs. CAD source positions/finishes are prepared offline.
export async function createCADViewer(shell:HTMLElement){
  const stage=shell.querySelector<HTMLElement>('[data-model-stage]')!;
  const canvas=document.createElement('canvas');
  canvas.className='assembly-viewer';canvas.tabIndex=0;canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label',`${shell.dataset.modelName}. Drag to rotate. Arrow keys rotate; plus and minus zoom.`);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio||1,1.5),2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.setClearColor(0x101923,0);
  const scene=new THREE.Scene();
  // Low-level reflections support metals; the key provides the visible form.
  const pmrem=new THREE.PMREMGenerator(renderer), room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
  scene.environment=environment.texture;scene.environmentIntensity=.32;
  scene.add(new THREE.HemisphereLight(0xe9f3ff,0x18202b,.5));
  const key=new THREE.DirectionalLight(0xfff1df,3.2);key.position.set(-3.5,5,4);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=3;key.shadow.camera.bottom=-3;
  key.shadow.camera.near=.1;key.shadow.camera.far=15;
  key.shadow.bias=-.0002;key.shadow.normalBias=.008;key.shadow.radius=3;
  scene.add(key);
  const fill=new THREE.DirectionalLight(0xb9d8ff,.65);fill.position.set(4,2,1);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xd2e9ff,1.6);rim.position.set(1,3,-4);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(32,1,.02,100);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=true;controls.dampingFactor=.09;controls.enablePan=false;
  controls.enableZoom=false;controls.minPolarAngle=.12;controls.maxPolarAngle=Math.PI*.88;
  controls.rotateSpeed=.65;controls.zoomSpeed=.75;
  canvas.style.touchAction='pan-y';
  const turntable=new THREE.Group();scene.add(turntable);
  let dead=false;
  const bindings=new AbortController();
  const listen=(target:EventTarget,type:string,handler:EventListener)=>target.addEventListener(type,handler,{signal:bindings.signal});
  const cleanup=()=>{
    if(dead)return;
    bindings.abort();
    dead=true;cancelAnimationFrame(frame);resizeObserver?.disconnect();visibility?.disconnect();
    window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',onVisibility);
    motion.removeEventListener('change',onPreference);window.removeEventListener('pagehide',cleanup);
    controls.dispose();environment.dispose();
    scene.traverse((o:any)=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach((m:any)=>m.dispose());});
    renderer.dispose();canvas.remove();
  };
  let frame=0,drawing=false,resizeObserver:ResizeObserver,visibility:IntersectionObserver;
  let last=0,inView=false,dirty=true,pointerDown=false,headProgress=0,targetProgress=0,manualExplosion=false;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const rotation=createTurntable(motion.matches);
  const spin=shell.querySelector<HTMLButtonElement>('[data-model-spin]')!;
  const range=shell.querySelector<HTMLInputElement>('[data-model-explode]');
  const output=shell.querySelector<HTMLOutputElement>('[data-model-progress]');
  const follow=shell.querySelector<HTMLButtonElement>('[data-model-follow]');
  const track=shell.closest<HTMLElement>('[data-model-scroll-track]');
  const edges=shell.querySelector<HTMLButtonElement>('[data-model-edges]');
  const lines:THREE.LineSegments[]=[];
  let mixer:THREE.AnimationMixer|undefined,clip:THREE.AnimationClip|undefined;
  const updateButton=()=>{spin.textContent=rotation.wanted?'Pause rotation':'Resume rotation';spin.setAttribute('aria-pressed',String(!rotation.wanted));};
  function wake(){if(!dead&&!drawing&&!frame&&inView&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}}
  const invalidate=()=>{dirty=true;wake();};
  function onVisibility(){if(document.hidden){pointerDown=false;rotation.end(performance.now());}else invalidate();}
  const updateProgress=()=>{
    if(!range)return;
    range.value=String(Math.round(targetProgress*100));
    if(output)output.value=`${Math.round(targetProgress*100)}%`;
    follow!.hidden=!manualExplosion||motion.matches;
  };
  function onScroll(){
    if(track&&!manualExplosion&&!motion.matches&&!document.fullscreenElement){
      const top=parseFloat(getComputedStyle(shell).top)||100;
      targetProgress=scrollExplosion(track.getBoundingClientRect().top,track.offsetHeight,shell.offsetHeight,top);
      updateProgress();invalidate();
    }
  }
  function onPreference(){rotation.preference(motion.matches);if(motion.matches){targetProgress=headProgress;manualExplosion=true;}updateProgress();updateButton();invalidate();}
  function draw(now:number){
    frame=0;if(dead||!inView||document.hidden)return;
    if(now-last<1000/30){frame=requestAnimationFrame(draw);return;}
    drawing=true;
    const dt=Math.min((now-last)/1000,.05);last=now;
    const rotating=rotation.canRotate(inView,document.hidden,now);
    if(rotating){turntable.rotation.y+=dt*THREE.MathUtils.degToRad(6);dirty=true;}
    const moving=Math.abs(headProgress-targetProgress)>.0001;
    if(moving){
      headProgress=motion.matches?targetProgress:THREE.MathUtils.damp(headProgress,targetProgress,10,dt);
      if(Math.abs(headProgress-targetProgress)<.0001)headProgress=targetProgress;
      mixer?.setTime(headProgress*(clip?.duration||1)*.999999);dirty=true;
    }
    const cameraChanged=controls.update(dt);
    if(dirty||cameraChanged){renderer.render(scene,camera);dirty=false;}
    drawing=false;
    // Keep the short inspection delay alive even while the model is stationary.
    if(rotation.wanted||pointerDown||moving||cameraChanged)frame=requestAnimationFrame(draw);
  }
  try{
    const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const gltf=await loader.loadAsync(shell.dataset.modelSrc!);
    if(dead)return;
    const model=gltf.scene;
    const initial=new THREE.Box3().setFromObject(model),center=initial.getCenter(new THREE.Vector3());
    const scale=2.7/Math.max(...initial.getSize(new THREE.Vector3()).toArray());
    model.traverse((object:any)=>{
      if(object.isLineSegments){
        object.material=new THREE.LineBasicMaterial({color:0x102131,transparent:true,opacity:.25,depthWrite:false});
        object.renderOrder=2;lines.push(object);
      }else if(object.isMesh){
        const mats=Array.isArray(object.material)?object.material:[object.material];
        object.castShadow=mats.every((m:any)=>!m.transparent);object.receiveShadow=true;
        mats.forEach((m:any)=>{if(m.transparent){m.depthWrite=false;object.renderOrder=1;}else{m.polygonOffset=true;m.polygonOffsetFactor=1;m.polygonOffsetUnits=1;}});
      }
    });
    clip=gltf.animations.find(a=>a.name==='Head explode');
    if(clip){mixer=new THREE.AnimationMixer(model);mixer.clipAction(clip).play();mixer.setTime(0);}
    // Fit to both endpoints so scrolling never clips separated components.
    const envelope=initial.clone();
    if(mixer&&clip){mixer.setTime(clip.duration*.999999);model.updateMatrixWorld(true);envelope.union(new THREE.Box3().setFromObject(model));mixer.setTime(0);}
    const envelopeSize=envelope.getSize(new THREE.Vector3()).multiplyScalar(scale);
    const envelopeCenter=envelope.getCenter(new THREE.Vector3()).sub(center).multiplyScalar(scale);
    const orbitOffset=Math.hypot(envelopeCenter.x,envelopeCenter.z);envelopeCenter.x=0;envelopeCenter.z=0;
    const mount=new THREE.Group();mount.scale.setScalar(scale);mount.position.copy(center).multiplyScalar(-scale);mount.add(model);turntable.add(mount);
    // A faint ground shadow anchors the full robots. The head floats so its
    // jaw can separate downward without colliding with a fabricated surface.
    if(!clip){
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x02070c,opacity:.4}));
      floor.rotation.x=-Math.PI/2;floor.position.y=(initial.min.y-center.y)*scale-.02;floor.receiveShadow=true;scene.add(floor);
    }
    const orbit=(shell.dataset.modelOrbit||'35 68').split(' ').map(Number);
    const baseDirection=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(orbit[1]),THREE.MathUtils.degToRad(orbit[0]));
    let fitDistance=6;
    function resetCamera(){controls.target.copy(envelopeCenter);camera.position.copy(baseDirection).multiplyScalar(fitDistance).add(envelopeCenter);controls.minDistance=fitDistance*.23;controls.maxDistance=fitDistance*2.5;turntable.rotation.y=0;controls.update();invalidate();}
    const resize=()=>{
      const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);
      // Bounding sphere fits all turntable angles, also in a narrow viewport.
      const radius=envelopeSize.length()/2+orbitOffset;
      const limitingFov=Math.min(camera.fov*Math.PI/180,2*Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect));
      const next=radius/Math.sin(limitingFov/2)*1.05;
      if(Math.abs(next-fitDistance)>.03){fitDistance=next;resetCamera();}
      invalidate();onScroll();
    };
    stage.append(canvas);resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resize();resetCamera();
    controls.addEventListener('start',()=>{pointerDown=true;rotation.begin();invalidate();});
    controls.addEventListener('end',()=>{pointerDown=false;rotation.end(performance.now());invalidate();});
    controls.addEventListener('change',invalidate);
    listen(canvas,'pointerdown',()=>{canvas.focus({preventScroll:true});controls.enableZoom=true;});
    listen(canvas,'blur',()=>{controls.enableZoom=false;});
    listen(canvas,'keydown',(rawEvent)=>{
      const event=rawEvent as KeyboardEvent;
      const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'];if(!keys.includes(event.key))return;
      event.preventDefault();rotation.inspect(performance.now());
      const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
      if(event.key==='ArrowLeft')spherical.theta-=.12;if(event.key==='ArrowRight')spherical.theta+=.12;
      if(event.key==='ArrowUp')spherical.phi=Math.max(.12,spherical.phi-.12);if(event.key==='ArrowDown')spherical.phi=Math.min(Math.PI*.88,spherical.phi+.12);
      if(event.key==='+'||event.key==='=')spherical.radius=Math.max(controls.minDistance,spherical.radius*.9);
      if(event.key==='-')spherical.radius=Math.min(controls.maxDistance,spherical.radius*1.1);
      if(event.key==='Home')resetCamera();else camera.position.setFromSpherical(spherical).add(controls.target);
      controls.update();invalidate();
    });
    listen(spin,'click',()=>{rotation.toggle();updateButton();invalidate();});updateButton();
    if(edges)listen(edges,'click',()=>{const show=edges.getAttribute('aria-pressed')!=='true';edges.setAttribute('aria-pressed',String(show));lines.forEach(l=>l.visible=show);invalidate();});
    if(range)listen(range,'input',()=>{manualExplosion=true;targetProgress=clamp01(Number(range.value)/100);updateProgress();invalidate();});
    if(follow)listen(follow,'click',()=>{manualExplosion=false;onScroll();updateProgress();});
    listen(shell.querySelector('[data-model-reset]')!,'click',()=>{rotation.inspect(performance.now());resetCamera();});
    listen(shell.querySelector('[data-model-expand]')!,'click',async()=>{
      try{if(document.fullscreenElement)await document.exitFullscreen();else await shell.requestFullscreen();}
      catch{shell.querySelector('[data-model-status]')!.textContent='Fullscreen is unavailable. Drag and zoom in the page to inspect the model.';}
    });
    motion.addEventListener('change',onPreference);window.addEventListener('scroll',onScroll,{passive:true});
    document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',cleanup,{once:true});
    if('IntersectionObserver' in window){visibility=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)invalidate();},{threshold:.01});visibility.observe(stage);}
    else{inView=true;invalidate();}
    onScroll();
    listen(canvas,'webglcontextlost',event=>{event.preventDefault();cleanup();shell.dispatchEvent(new Event('model-error'));});
    return {dispose:cleanup,refresh:()=>{onScroll();invalidate();}};
  }catch(error){cleanup();throw error;}
}
