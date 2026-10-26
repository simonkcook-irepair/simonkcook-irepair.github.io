/* iRepair Toolbox — Motion v2. Pure stage-specific movement evidence.
   No generated values. Thresholds indicate changing browser data, NOT healthy ICs. */
(function(root){
"use strict";
const finite=n=>typeof n==="number"&&Number.isFinite(n);
function create(stage){
 const axis=[{min:Infinity,max:-Infinity,seen:0},{min:Infinity,max:-Infinity,seen:0}];
 let events=0,activeRotations=0,peakRotation=0;
 function observe(kind,values){
  const expected=stage==="accel"?"acceleration":stage==="gyro"?"rotation":stage==="tilt"?"orientation":null;
  if(!expected||expected!==kind||!Array.isArray(values))return snapshot();
  const available=values.filter(finite);
  if(!available.length)return snapshot();
  events++;
  if(stage==="gyro"){
   const maximum=Math.max(...available.map(Math.abs));
   peakRotation=Math.max(peakRotation,maximum);
   if(maximum>=12)activeRotations++;
  }else{
   for(let i=0;i<2;i++){
    const v=values[i];
    if(finite(v)){axis[i].seen++;axis[i].min=Math.min(axis[i].min,v);axis[i].max=Math.max(axis[i].max,v)}
   }
  }
  return snapshot();
 }
 function snapshot(){
  let first=false,second=false,labels=[];
  if(stage==="accel"){
   first=axis[0].seen>1&&axis[0].max-axis[0].min>=3.2;
   second=axis[1].seen>1&&axis[1].max-axis[1].min>=3.2;
   labels=["Side-to-side movement","Forward/back movement"];
  }else if(stage==="gyro"){
   first=activeRotations>=1;second=activeRotations>=3;
   labels=["Rotation started","Rotation continued"];
  }else if(stage==="tilt"){
   first=axis[0].seen>1&&axis[0].max-axis[0].min>=13;
   second=axis[1].seen>1&&axis[1].max-axis[1].min>=13;
   labels=["Forward/back tilt","Side-to-side tilt"];
  }
  return {stage,events,first,second,complete:first&&second,
   labels,peakRotation:Math.round(peakRotation*10)/10,
   ranges:axis.map(item=>Number.isFinite(item.min)&&Number.isFinite(item.max)?
     Math.round((item.max-item.min)*10)/10:null)};
 }
 return Object.freeze({observe,snapshot});
}
root.IRepairMotionGuidance=Object.freeze({create});
})(typeof window!=="undefined"?window:globalThis);