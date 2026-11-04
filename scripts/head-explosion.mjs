// Explicit part-instance layout for the supplied head GLB (Z-up, metres).
// IDs are tied to the source hash checked by prepare-cad.mjs, not fuzzy names.
// Every offset is built from axis-aligned extraction and subsequent group moves.
export const HEAD_SOURCE_SHA='2a761c7f1a41685709a6fdec1a061034489885ab49cbc93e86287153669366ba';
export const HEAD_STAGES=[0,.18,.34,.48,.64,.76,.9,1];
const partPlans=new Map();
const move=(from,to,vector)=>({from,to,vector});
const place=(ids,label,moves,group)=>ids.forEach(id=>{
  if(partPlans.has(id))throw new Error(`Duplicate head part ${id}`);
  partPlans.set(id,{id,label,moves,group:group||`${label}-${id}`});
});
const x=(a,b,d)=>move(a,b,[d,0,0]),y=(a,b,d)=>move(a,b,[0,d,0]),z=(a,b,d)=>move(a,b,[0,0,d]);

place([5],'Front shell',[y(.10,.13,-.01),z(.13,.15,.005),y(.15,.26,-.19),z(.26,.30,.065)]);
place([20],'Rear shell',[y(.10,.28,.16),z(.28,.34,.07)]);
place([9],'Jaw',[z(.34,.48,-.12),y(.48,.58,.02)]);
place([1],'Left side support',[x(.34,.48,-.17),z(.48,.58,.07)]);
place([4],'Right side support',[x(.34,.48,.17),z(.48,.58,.07)]);
place([10],'Driven jaw gear',[x(.34,.48,.20),z(.48,.58,.07)]);
place([49],'Servo herringbone gear',[x(.34,.48,.17),z(.48,.58,.07),y(.64,.70,.005),x(.70,.78,-.03),y(.78,.84,-.005)]);
place([44],'Servo adapter',[x(.34,.48,.115),z(.48,.58,.07)]);
place([19],'Left jaw pivot pin',[x(.18,.34,-.21),z(.48,.58,.07)]);
place([25],'Right jaw pivot pin',[x(.18,.34,.23),z(.48,.58,.07)]);
place([62],'Eyelid axle',[x(.30,.34,-.30),z(.48,.64,.095)]);
place([48],'Mouth/base frame',[]);
place([29],'Centre frame',[z(.76,.90,.04)]);
place([34],'Jaw servo bracket',[x(.50,.64,.09),z(.68,.84,.10)]);
place([52,53],'Jaw servo',[x(.50,.64,.09),z(.68,.84,.07)],'jaw-servo');
place([65,57,59,60,61,63,64,67,68],'Eyelid carrier and servo assemblies',[z(.48,.64,.095)],'eyelid-carrier');
place([66,69],'Eyelids',[z(.34,.46,.045),z(.48,.64,.095)]);
place([56,58],'Eyes',[y(.34,.48,-.045),z(.64,.76,.085)]);

// Screws: withdraw along the actual shaft axis before changing their height.
place([0,2,6,14,15,23],'Base screw',[z(.18,.34,-.085)]);
place([32,41,50,70],'Carrier screw',[z(.18,.34,.15)]);
place([7],'Left carrier screw',[x(.18,.34,-.24),z(.48,.64,.095)]);
place([11],'Right carrier screw',[x(.18,.34,.24),z(.48,.64,.095)]);
place([8],'Left shell-side screw',[x(0,.10,-.245),z(.48,.58,.07)]);
place([24],'Right shell-side screw',[x(0,.10,.245),z(.48,.58,.07)]);
place([12],'Jaw gear screw',[x(.18,.34,.265),z(.48,.58,.07)]);
place([13],'Left lower support screw',[x(0,.10,-.26),z(.48,.58,.07)]);
place([21],'Right lower support screw',[x(0,.10,.26),z(.48,.58,.07)]);
place([28,39,47,54],'Jaw bracket screw',[x(.40,.50,-.16),z(.68,.84,.09)]);

// Inserts follow their actual host until it is clear, then leave its hole.
place([3],'Driven gear insert',[x(.34,.48,.20),z(.48,.58,.07),x(.86,1,.025)]);
place([17],'Right support insert',[x(.34,.48,.17),z(.48,.58,.07),x(.86,1,.03)]);
place([22],'Left support insert',[x(.34,.48,-.17),z(.48,.58,.07),x(.86,1,-.03)]);
place([16],'Right base insert',[x(.86,1,.075)]);
place([18],'Left base insert',[x(.86,1,-.075)]);
place([33],'Left carrier insert',[z(.48,.64,.095),x(.86,1,-.035)]);
place([46],'Right carrier insert',[z(.48,.64,.095),x(.86,1,.035)]);
place([26,30,31,40],'Jaw bracket insert',[x(.50,.64,.09),z(.68,.84,.10),x(.86,1,-.025)]);
place([27,37,38,43],'Centre top insert',[z(.64,.74,.018),z(.76,.90,.04)]);
place([35,36,42,45,51,55],'Centre bottom insert',[z(.76,.90,.04),z(.90,1,-.03)]);

if(partPlans.size!==71)throw new Error(`Head layout covers ${partPlans.size}/71 parts`);
export const headPlan=id=>{const plan=partPlans.get(id);if(!plan)throw new Error(`Unassigned head part ${id}`);return plan;};
const ease=t=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
export function headPose(id,progress){
  return headPlan(id).moves.reduce((offset,m)=>{
    const amount=ease((progress-m.from)/(m.to-m.from));
    return offset.map((v,i)=>v+m.vector[i]*amount);
  },[0,0,0]);
}
