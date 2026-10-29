/* Motion v3: genuine, sequential gesture evidence. Visual demonstration is separate.
   Thresholds are UI response indicators, never calibrated hardware health tests. */
(function(root){
"use strict";
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const descriptors=Object.freeze({
 accel:{kind:"acceleration",labels:["Left and right","Towards you and away"],instructions:["Move your iPhone left and right","Move it towards you, then away"]},
 gyro:{kind:"rotation",labels:["Rotation started","Rotation continued"],instructions:["Turn your iPhone gently","Keep turning your iPhone"]},
 tilt:{kind:"orientation",labels:["Forward and backward tilt","Left and right tilt"],instructions:["Tilt forwards and backwards","Now tilt left and right"]}
});
function create(stage){
 const d=descriptors[stage]||null;
 let events=0,first=false,second=false,peakRotation=0,rotationEvents=0;
 const stats=[{min:Infinity,max:-Infinity,seen:0},{min:Infinity,max:-Infinity,seen:0}];
 function range(i){const a=stats[i];return a.seen>=3?a.max-a.min:0}
 function updateAxis(i,v){
  if(!finite(v))return;
  const a=stats[i];a.seen++;a.min=Math.min(a.min,v);a.max=Math.max(a.max,v);
 }
 function observe(kind,values){
  if(!d||kind!==d.kind||!Array.isArray(values)||!values.some(finite))return snapshot();
  events++;
  if(stage==="gyro"){
   const peak=Math.max(...values.filter(finite).map(Math.abs));
   peakRotation=Math.max(peakRotation,peak);
   if(peak>=12){rotationEvents++;if(rotationEvents>=1)first=true;if(rotationEvents>=3)second=true}
  }else if(!first){
   // Collect ONLY the first requested direction. Do not credit both phases
   // from the same sample or from an earlier side-to-side movement.
   updateAxis(0,stage==="accel"?values[0]:values[0]);
   if(range(0)>=(stage==="accel"?1.4:13))first=true;
  }else if(!second){
   // Accelerometer Z is normal to the screen (towards/away in portrait);
   // orientation gamma is roll (left/right). Each starts with fresh data.
   updateAxis(1,stage==="accel"?values[2]:values[1]);
   if(range(1)>=(stage==="accel"?1.0:13))second=true;
  }
  return snapshot();
 }
 function snapshot(){
  const complete=first&&second,phase=!first?"first":!second?"second":"complete";
  const ranges=stats.map(a=>a.seen>1?Math.round((a.max-a.min)*10)/10:null);
  return {stage,events,first,second,complete,phase,labels:d?.labels||[],
   instruction:d?d.instructions[complete?1:phase==="second"?1:0]:"",
   peakRotation:Math.round(peakRotation*10)/10,ranges};
 }
 return Object.freeze({observe,snapshot});
}
root.IRepairMotionGuidance=Object.freeze({create});
})(typeof window!=="undefined"?window:globalThis);