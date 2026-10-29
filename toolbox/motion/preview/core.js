/* iRepair Toolbox Motion & Haptics — pure, browser-neutral diagnostic plan.
   Results are user-scored; sensor readings are supporting evidence, never PASS automation. */
(function(root){
"use strict";
const states=Object.freeze(["PASS","FAIL","UNABLE"]);
const steps=Object.freeze([
 {id:"accel",title:"Accelerometer",subtitle:"Motion along three axes",icon:"↗",mode:"web-motion",
  instruction:"Hold the iPhone securely. Move it gently side to side, then forwards and backwards. Watch for two green ticks. No need to shake it.",
  question:"Did the iPhone detect both movement directions?",
  evidence:"Browser motion-event samples, where permission and Safari support allow"},
 {id:"gyro",title:"Gyroscope",subtitle:"Rotation response",icon:"⟳",mode:"web-motion",
  instruction:"Hold the iPhone securely and turn it slowly in your hand. Follow the circular motion shown below.",
  question:"Was rotation detected while you turned the phone?",
  evidence:"Browser rotation-rate event fields, where exposed by Safari"},
 {id:"tilt",title:"Orientation",subtitle:"Pitch and roll",icon:"◇",mode:"web-orientation",
  instruction:"Slowly tilt your iPhone forwards and backwards, then left and right. If Safari allows access, the little phone follows your tilt.",
  question:"Did both tilt directions respond?",
  evidence:"Browser deviceorientation samples when available"},
 {id:"compass",title:"Compass",subtitle:"Magnetic heading",icon:"◎",mode:"system-guided",
  instruction:"Open the Compass app on your iPhone. Turn the phone gently and see whether its direction changes. Keep away from magnets and metal.",
  question:"Did the compass heading change correctly?",
  evidence:"Customer observation in Apple's Compass app; no native magnetometer stream"},
 {id:"haptics",title:"Haptics",subtitle:"Taptic Engine response",icon:"◌",mode:"haptic-guided",
  instruction:"Open Settings → Sounds & Haptics and try a normal haptic feedback preview. Can you feel the gentle tap or vibration?",
  question:"Could you clearly feel the vibration?",
  evidence:"Customer-confirmed tactile feedback; browser cannot measure physical vibration"},
 {id:"proximity",title:"Proximity sensor",subtitle:"Near-ear response",icon:"⊙",mode:"system-guided",
  instruction:"During an ordinary phone call, bring the iPhone towards your ear, then move it away again. Check whether the screen goes dark and lights up again.",
  question:"Did the screen turn off near your ear and on again afterwards?",
  evidence:"Customer observation during a phone call; Safari cannot read proximity hardware"}
]);
const symptoms=Object.freeze({
 accel:Object.freeze(["Values remain unchanged","Movement response is intermittent","Motion data unavailable despite permission"]),
 gyro:Object.freeze(["Rotation values remain unchanged","Erratic or delayed rotation","Rotation data unavailable"]),
 tilt:Object.freeze(["Orientation values stay unchanged","Illustration behaves inconsistently","Orientation permission/data unavailable"]),
 compass:Object.freeze(["Heading stuck or jumps","Calibration warning repeats","Compass app reports unavailable"]),
 haptics:Object.freeze(["No vibration felt","Vibration unusually weak","Intermittent vibration","Haptics settings were disabled"]),
 proximity:Object.freeze(["Screen stays on near ear","Screen fails to turn on when moved away","Intermittent behaviour"])
});
const valid=new Set(steps.map(s=>s.id));
function createPlan(modelSlug,catalogue){
 const m=catalogue?.getModel?.(modelSlug)||null;
 return {modelSlug:m?.slug||"",modelName:m?.name||"Not selected",steps:steps.map(s=>({...s}))};
}
function setAnswer(old,id,result){
 if(!valid.has(id)||!states.includes(result))throw Error("Invalid diagnostic result");
 return {...(old||{}),[id]:result};
}
function tally(plan,answers){
 const n={PASS:0,FAIL:0,UNABLE:0,UNANSWERED:0};
 for(const s of plan.steps){const r=answers?.[s.id];n[states.includes(r)?r:"UNANSWERED"]++}
 return n;
}
function evidenceMethod(step,evidence){
 const counts=evidence?.counts||{};
 if(step.mode==="web-motion"||step.mode==="web-orientation"){
  const kind=step.id==="accel"?"acceleration":step.id==="gyro"?"rotation":"orientation";
  const count=Math.max(0,Math.floor(Number(counts[kind])||0));
  return count>0?"Browser received "+count+" "+kind+" samples; this is not an electrical component verdict":
   "No verified "+kind+" samples received by the browser";
 }
 return step.evidence;
}
function interpretation(plan,answers,reported){
 const out=[];
 const has=id=>plan.steps.some(s=>s.id===id);
 if(has("accel")&&answers?.accel==="FAIL"||answers?.gyro==="FAIL"||answers?.tilt==="FAIL"){
  out.push({title:"Motion-sensing behaviour needs confirmation",
   detail:"Review motion permissions, Safari availability, the observed values and native Core Motion sensor capability. A browser FAIL is not proof of an accelerometer or gyroscope IC defect."});
 }
 if(answers?.compass==="FAIL")out.push({title:"Investigate compass / magnetic interference",
  detail:"Magnetic cases, nearby metal, calibration conditions and software can affect the Compass app. Confirm with native magnetometer data before considering hardware faults."});
 if(answers?.haptics==="FAIL")out.push({title:"Investigate tactile output",
  detail:"Check Sounds & Haptics settings and system feedback first. A requested vibration or touch alone cannot confirm Taptic Engine operation; the customer must feel the output."});
 if(answers?.proximity==="FAIL")out.push({title:"Investigate proximity response",
  detail:"Check screen protection, top-sensor obstruction, call state and model-specific proximity behaviour before investigating display, flex or sensor hardware."});
 return out;
}
function report(plan,answers,evidence,reported){
 const stats=tally(plan,answers);
 const lines=["iREPAIR TOOLBOX — MOTION & HAPTICS DIAGNOSTICS",
  "Report date: "+new Date().toLocaleString("en-GB"),
  "Model: "+plan.modelName+(plan.modelSlug?" (customer selected)":" (not identified)"),
  "Results: "+stats.PASS+" Pass / "+stats.FAIL+" Fail / "+stats.UNABLE+" Unable / "+stats.UNANSWERED+" Unanswered",
  "Important: Pass/Fail/Unable outcomes were chosen by the customer, not computed from hardware.",""];
 for(const step of plan.steps){
  lines.push(step.title+": "+(answers?.[step.id]||"UNANSWERED"));
  lines.push("  Method: "+evidenceMethod(step,evidence));
  const measured=evidence?.detected?.[step.id];
  if(["accel","gyro","tilt"].includes(step.id)&&measured){
   lines.push("  Live movement evidence: "+(measured.complete?"Two response checkpoints observed":
     measured.events?"Partial movement response; checkpoints incomplete":"No response checkpoints observed")+
     " (not an independent hardware verdict)");
   if(step.id==="gyro")lines.push("  Peak observed angular rate: "+measured.peakRotation+" degrees/s");
   else lines.push("  Observed channel ranges: "+measured.ranges.map(v=>v===null?"not available":String(v)).join(", "));
  }
  const selected=Array.isArray(reported?.[step.id])?reported[step.id].filter(v=>symptoms[step.id].includes(v)):[];
  if(answers?.[step.id]==="FAIL"&&selected.length)lines.push("  Observed symptoms: "+selected.join("; "));
 }
 const hints=interpretation(plan,answers,reported);
 if(hints.length){lines.push("","TECHNICIAN TRIAGE — POSSIBLE INVESTIGATION, NOT A CONFIRMED FAULT");
  for(const h of hints)lines.push(h.title+": "+h.detail)}
 lines.push("","Privacy: Motion samples processed in page memory. No sensor streams or biometric information uploaded.");
 lines.push("Limits: Safari motion events depend on device, permission and browser support. Compass, proximity and haptic hardware are customer-guided; iOS Core Motion and Core Haptics testing require a native build.");
 return lines.join("\n");
}
root.IRepairMotionCore=Object.freeze({steps,states,symptoms,createPlan,setAnswer,tally,interpretation,report,evidenceMethod});
})(typeof window!=="undefined"?window:globalThis);