/* Motion & Haptics isolated deterministic checks. Run with Node:
   node toolbox/motion/preview/tests/core-tests.js */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,"..");
const windowObject={};const ctx={window:windowObject,Date};
for(const file of ["models.js","core.js"])vm.runInNewContext(fs.readFileSync(path.join(dir,file),"utf8"),ctx);
const m=windowObject.IRepairDeviceCatalogue,core=windowObject.IRepairMotionCore;
let n=0;function pass(desc,value){assert.ok(value,desc);console.log("PASS",desc);n++}
const plan=core.createPlan("iphone-17-pro-max",m);
pass("Six diagnostic steps",plan.steps.length===6);
pass("Preserves intended test sequence",plan.steps.map(s=>s.id).join(",")==="accel,gyro,tilt,compass,haptics,proximity");
pass("iPhone model name from catalogue",plan.modelName==="iPhone 17 Pro Max");
pass("Unknown model does not claim identification",core.createPlan("",m).modelName==="Not selected");
pass("All stages have honest methods",plan.steps.every(s=>s.evidence&&s.question&&s.instruction));
pass("Compass and proximity never pretend to be measured",plan.steps.filter(s=>["compass","proximity"].includes(s.id)).every(s=>s.mode==="system-guided"));
pass("Haptics customer observation",plan.steps.find(s=>s.id==="haptics").mode==="haptic-guided");
pass("Sensor events only where available",plan.steps.filter(s=>["accel","gyro","tilt"].includes(s.id)).every(s=>s.mode.startsWith("web-")));
let answers={};for(const s of plan.steps)answers=core.setAnswer(answers,s.id,["compass","gyro"].includes(s.id)?"UNABLE":s.id==="haptics"?"FAIL":"PASS");
const totals=core.tally(plan,answers);
pass("Pass/Fail/Unable totals",totals.PASS===3&&totals.FAIL===1&&totals.UNABLE===2);
pass("Never automatically marks unanswered as passing",core.tally(plan,{}).UNANSWERED===6);
assert.throws(()=>core.setAnswer({},"wrong","PASS"));n++;
assert.throws(()=>core.setAnswer({},"accel","SUCCESS"));n++;
const ev={counts:{acceleration:22,rotation:0,orientation:11}};
pass("Real acceleration event count in provenance",core.evidenceMethod(plan.steps[0],ev).includes("22 acceleration samples"));
pass("Missing gyro data accurately reported",core.evidenceMethod(plan.steps[1],ev).includes("No verified rotation samples"));
pass("Orientation event count in provenance",core.evidenceMethod(plan.steps[2],ev).includes("11 orientation samples"));
const report=core.report(plan,answers,ev,{haptics:["No vibration felt"],gyro:["Rotation data unavailable"]});
pass("Report has customer model",report.includes("iPhone 17 Pro Max"));
pass("Report distinguishes tactile reports",report.includes("No vibration felt"));
pass("Never fabricates gyro data",report.includes("No verified rotation samples"));
pass("Report differentiates customer and measurements",report.includes("chosen by the customer"));
pass("No sensor stream uploads in privacy statement",report.includes("No sensor streams or biometric information uploaded"));
pass("Haptic fault clue is cautious",core.interpretation(plan,answers,{}).some(v=>v.title.includes("tactile")&&v.detail.includes("customer must feel")));
pass("Unknown injected symptoms rejected",!core.report(plan,answers,ev,{haptics:["Vibration confirmed automatically"]}).includes("Vibration confirmed automatically"));
pass("No model-specific fake physical diagnosis",!report.includes("automatically verified"));
async function sensorChecks(){
 const listeners=new Map(),messages=[],readings=[];
 const fake={
  DeviceMotionEvent:{requestPermission:()=>Promise.resolve("granted")},
  DeviceOrientationEvent:{requestPermission:()=>Promise.resolve("granted")},
  addEventListener:(type,callback)=>listeners.set(type,callback),
  removeEventListener:(type)=>listeners.delete(type),
  setTimeout:()=>0
 };
 vm.runInNewContext(fs.readFileSync(path.join(dir,"sensors.js"),"utf8"),{window:fake,Date,Promise});
 const feed=fake.IRepairSensorFeed.create((kind,values,count)=>readings.push({kind,values,count}),s=>messages.push(s));
 feed.setStage("accel");
 pass("Sensor feed asks for actual permission",await feed.start()===true&&feed.active);
 listeners.get("devicemotion")({accelerationIncludingGravity:{x:1,y:2,z:9.8},rotationRate:{alpha:4,beta:5,gamma:6}});
 pass("Only current motion stage sample counted",feed.snapshot().counts.acceleration===1&&feed.snapshot().counts.rotation===0);
 feed.setStage("gyro");
 listeners.get("devicemotion")({rotationRate:{alpha:4,beta:5,gamma:6}});
 pass("Rotation counted only during gyro check",feed.snapshot().counts.rotation===1);
 feed.setStage("tilt");
 listeners.get("deviceorientation")({beta:12,gamma:25,alpha:5});
 pass("Orientation counts actual event",feed.snapshot().counts.orientation===1);
 feed.stop();
 pass("Sensor listeners released after stop",!feed.active&&listeners.size===0);
 feed.reset();
 pass("Sensor evidence cleared for new session",feed.snapshot().counts.acceleration===0);
 console.log("ALL",n,"MOTION TESTS PASSED");
}
sensorChecks().catch(error=>{console.error(error);process.exitCode=1});