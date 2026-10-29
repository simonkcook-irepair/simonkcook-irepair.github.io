/* Actual browser motion sensor adapter; never creates simulated readings. */
(function(root){
"use strict";
function create(onData,onState){
 let active=false,stage="",permission="not-requested",lastTime=0;
 let counts={acceleration:0,rotation:0,orientation:0};
 const num=v=>typeof v==="number"&&Number.isFinite(v)?v:null;
 const valid=a=>a.some(v=>v!==null);
 function emit(type,values){
  if(!active)return;
  const only={acceleration:"accel",rotation:"gyro",orientation:"tilt"};
  if(stage!==only[type]||!valid(values))return;
  counts[type]++;
  const now=Date.now();
  if(now-lastTime>80){lastTime=now;onData(type,values,counts[type]);}
 }
 function motion(e){
  const a=e.accelerationIncludingGravity,r=e.rotationRate;
  if(a)emit("acceleration",[num(a.x),num(a.y),num(a.z)]);
  if(r)emit("rotation",[num(r.alpha),num(r.beta),num(r.gamma)]);
 }
 function orientation(e){
  emit("orientation",[num(e.beta),num(e.gamma),num(e.alpha)]);
 }
 function stop(){
  active=false;
  root.removeEventListener("devicemotion",motion);
  root.removeEventListener("deviceorientation",orientation);
  if(permission==="listening")permission="paused";
 }
 async function start(){
  // Call both requestPermission methods synchronously from this tap gesture.
  const asks=[];
  try{
   const dm=root.DeviceMotionEvent,orient=root.DeviceOrientationEvent;
   if(dm)asks.push(typeof dm.requestPermission==="function"?
    Promise.resolve(dm.requestPermission()):Promise.resolve("granted"));
   if(orient)asks.push(typeof orient.requestPermission==="function"?
    Promise.resolve(orient.requestPermission()):Promise.resolve("granted"));
  }catch(error){permission="unavailable";onState("Motion access could not be requested.");return false;}
  if(!asks.length){permission="unsupported";onState("This browser does not expose motion events.");return false}
  onState("Requesting motion and orientation access…");
  const responses=await Promise.allSettled(asks);
  const granted=responses.some(r=>r.status==="fulfilled"&&r.value==="granted");
  if(!granted){permission="denied";onState("Motion access not granted. Review Safari Settings or choose Unable to Test.");return false}
  stop();active=true;permission="listening";
  root.addEventListener("devicemotion",motion,{passive:true});
  root.addEventListener("deviceorientation",orientation,{passive:true});
  onState("Motion permission accepted. Move gently; actual readings appear when Safari sends samples.");
  const expected=stage;
  root.setTimeout(()=>{
   if(!active||stage!==expected)return;
   const key=expected==="accel"?"acceleration":expected==="gyro"?"rotation":"orientation";
   if(counts[key]===0)onState("No "+key+" samples received yet. Check permissions or select Unable to Test.");
  },4500);
  return true;
 }
 return Object.freeze({
  start,stop,setStage:v=>{stage=v;lastTime=0},
  get active(){return active},
  get permission(){return permission},
  snapshot:()=>({counts:{...counts}}),
  reset:()=>{stop();counts={acceleration:0,rotation:0,orientation:0};permission="not-requested"}
 });
}
root.IRepairSensorFeed=Object.freeze({create});
})(window);