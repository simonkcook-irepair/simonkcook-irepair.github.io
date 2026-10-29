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

/* V3 instruction-first and live-result split: real events drive only live state. */
vm.runInNewContext(fs.readFileSync(path.join(dir,"guidance.js"),"utf8"),ctx);
const guidance=windowObject.IRepairMotionGuidance;
const accel=guidance.create("accel");
pass("Accelerometer starts on side-to-side instruction",accel.snapshot().phase==="first"&&accel.snapshot().instruction.includes("left and right"));
accel.observe("acceleration",[0,0,9.8]);
accel.observe("acceleration",[1,0,9.8]);
accel.observe("acceleration",[3,0,9.8]);
pass("First direction unlocks next instructional phase",accel.snapshot().first&&!accel.snapshot().second&&accel.snapshot().phase==="second"&&accel.snapshot().instruction.includes("towards you"));
accel.observe("acceleration",[10,10,9.8]);
accel.observe("acceleration",[15,15,9.8]);
accel.observe("acceleration",[20,20,9.8]);
pass("Extra side motion cannot masquerade as forward/back motion",!accel.snapshot().second);
accel.observe("acceleration",[20,20,11.3]);
pass("Normal-to-screen Z motion completes second phase",accel.snapshot().complete&&accel.snapshot().phase==="complete");
const wrong=guidance.create("gyro");
wrong.observe("orientation",[30,30,12]);
pass("Wrong sensor events ignored",wrong.snapshot().events===0);
wrong.observe("rotation",[3,2,4]);wrong.observe("rotation",[16,null,0]);
pass("One rotation spike insufficient",wrong.snapshot().first&&!wrong.snapshot().second);
wrong.observe("rotation",[19,0,0]);wrong.observe("rotation",[20,1,0]);
pass("Continued genuine rotation completes gyroscope",wrong.snapshot().complete);
const tilt=guidance.create("tilt");
tilt.observe("orientation",[0,0,0]);tilt.observe("orientation",[7,0,0]);tilt.observe("orientation",[15,0,0]);
pass("Forward/back tilt first, side tilt second",tilt.snapshot().first&&!tilt.snapshot().second&&tilt.snapshot().phase==="second");
tilt.observe("orientation",[20,0,0]);tilt.observe("orientation",[21,8,0]);tilt.observe("orientation",[22,16,0]);
pass("Separate left/right tilt values finish after phase switch",tilt.snapshot().complete);
const absent=guidance.create("accel");
absent.observe("acceleration",[null,NaN,undefined]);
pass("Invalid readings cannot count as motion",absent.snapshot().events===0&&!absent.snapshot().complete);
const rendering=fs.readFileSync(path.join(dir,"index.html"),"utf8");
const appSource=fs.readFileSync(path.join(dir,"app.js"),"utf8");
const styles=fs.readFileSync(path.join(dir,"visual.css"),"utf8");
pass("Central card separates what-to-do from live result",rendering.includes('class="instructionPane"')&&rendering.includes('class="responsePane"'));
pass("Guided checks label expected behaviour instead of false live data",appSource.includes('WHAT TO LOOK FOR')&&rendering.includes('id="guidedOutcome"'));
pass("All guided illustrations have distinct elements",["guideCompass","guideRipples","guideEar"].every(n=>rendering.includes(n)));
pass("Customer instructions change when tracker phase changes",appSource.includes('set("guideActionLabel",data.instruction)')&&appSource.includes('stage.dataset.phase=data.phase'));
pass("Live iPhone visual is not pre-animated",styles.includes('.responsePane .demoDevice')&&styles.includes('animation:none!important'));
pass("Technical values hidden in expand-only section",rendering.includes('<details id="technicalPanel"')&&rendering.indexOf('id="sensorStatus"')>rendering.indexOf('<details id="technicalPanel"'));
pass("Browser sensor PASS stays locked until both checks",appSource.includes('pass.disabled=!done')&&appSource.includes('if(status==="PASS"&&tracker&&!tracker.snapshot().complete)return'));
pass("Guide-only tests do not pretend to get motion sensor data",appSource.includes('const measuring=["accel","gyro","tilt"].includes(s.id)'));
pass("Accelerometer forward/back demo uses visual depth cue",styles.includes('.stage-accel[data-phase="second"] .guideDepth'));
pass("Technician report retains provenance and caveat",core.report(plan,answers,{detected:{accel:accel.snapshot()}},{}).includes("not an independent hardware verdict"));
