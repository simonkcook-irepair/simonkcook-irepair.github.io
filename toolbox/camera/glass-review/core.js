/* iRepair Toolbox Camera Diagnostics — deterministic model-aware guided plan.
   Browser evidence is user-observed; browser camera streams never prove the identity
   of physical constituent lenses. This module requires no browser or network APIs. */
(function(root){
"use strict";
const allowed=Object.freeze(["PASS","FAIL","UNABLE"]);
const basics=Object.freeze([
 {id:"rear",title:"Rear camera",label:"Rear image & colour",facing:"environment",
  instruction:"Point the rear camera at a well-lit, detailed subject. Look for sharpness, colour, lines, spots and distortion.",
  check:"Check the live rear-camera picture for correct colours, clarity and no visible defects.",
  mode:"browser",category:"rear camera"},
 {id:"focus",title:"Focus response",label:"Near & distant focus",facing:"environment",
  instruction:"Hold a clearly printed object nearby, then aim at something several metres away. Look for focus settling on both.",
  check:"Does the picture become clear when you move between nearby and distant subjects?",
  mode:"browser",category:"focus"}
]);
const stability=Object.freeze({id:"stability",title:"Image stability",label:"Rear picture stability & noise",facing:"environment",
 instruction:"Hold the iPhone still while viewing the rear camera. Watch for continuous shaking, fluttering or clicking focus. Listen near the camera for an unusual high-pitched buzzing or chirping sound. Remove magnetic cases or accessories first; do not shake the phone.",
 check:"While held still, is the picture stable and free of unusual repeated high-pitched camera noise?",
 mode:"browser",category:"rear stabilisation / focus actuator"});
const ultra=Object.freeze({id:"ultra",title:"Ultra-wide camera",label:"Ultra-wide lens · 0.5×",facing:"environment",
 instruction:"Open the iPhone Camera app, choose 0.5× and inspect a well-lit scene. Return here to record what you saw.",
 check:"Does the native Camera app show a clear, genuinely wider view at 0.5×?",
 mode:"native-guided",category:"ultra-wide camera"});
const tele=Object.freeze({id:"tele",title:"Telephoto camera",label:"Telephoto lens",facing:"environment",
 instruction:"Open the iPhone Camera app, select its optical telephoto option (for example 2×, 3×, 5×, or another model-specific lens) and inspect fine detail. Return here to record the result. Avoid judging a digitally cropped zoom as an isolated lens.",
 check:"Does the Camera app offer a clear optical telephoto view without spots, lines or distortion?",
 mode:"native-guided",category:"telephoto camera"});
const front=Object.freeze({id:"front",title:"Front camera",label:"Selfie image & colour",facing:"user",
 instruction:"Look at the live front-camera picture. Check your face and a bright background for sharpness, correct colour, distortion or damage.",
 check:"Is the front-facing image clear and normally coloured?",
 mode:"browser",category:"front camera"});
const flash=Object.freeze({id:"flash",title:"Rear flash",label:"Flash / torch",facing:"environment",
 instruction:"Use the in-app torch button if supported. Otherwise open the iPhone Camera app and take a flash photo in a dim room. Do not shine the flash into anyone’s eyes.",
 check:"Does the rear LED flash or torch activate normally when requested?",
 mode:"torch-or-native-guided",category:"rear flash"});
const faceid=Object.freeze({id:"faceid",title:"Face ID",label:"Face ID recognition",facing:"user",
 instruction:"On a Face ID-enabled iPhone, use Face ID as you normally would to unlock the device or authenticate in a trusted app. Return here to record the result. Do not enter a passcode into this app, reset Face ID, or attempt to view its infrared camera. If Face ID is not enrolled, disabled, blocked or temporarily unavailable, choose Unable to Test.",
 check:"When Face ID is already set up, does the iPhone successfully recognise your face and authenticate without using your passcode?",
 mode:"system-guided",category:"Face ID / TrueDepth authentication"});
const symptomOptions=Object.freeze({
 rear:Object.freeze(["No image / black view","Frozen preview or camera app closes","Distorted colours, lines or spots"]),
 focus:Object.freeze(["Permanently blurred","Near focus will not settle","Distant focus will not settle","Repeated focus hunting"]),
 stability:Object.freeze(["Shaky image while the phone is still","High-pitched buzzing or whining","Rattling or clicking when camera starts","Intermittent shake or focus"]),
 flash:Object.freeze(["Torch does not illuminate","Photo flash does not fire","Flash works only intermittently"])
});
const ids=new Set([...basics,stability,flash,ultra,tele,front,faceid].map(v=>v.id));
function faceIdSupported(model){
 // The home-button iPhones in this catalogue use Touch ID, not Face ID.
 // An unselected/unknown model must not be guessed as capable.
 return !!model && ["notch","island","small-island","duo"].includes(model.front);
}
function lensAvailability(model){
 if(!model)return {ultra:false,tele:false,source:"Model not identified"};
 const rear=model.rear;
 if(rear==="triple"||rear==="plateau-triple")return {ultra:true,tele:true,source:"Published iPhone camera layout"};
 if(rear==="horizontal"||rear==="vertical")return {ultra:false,tele:true,source:"Published iPhone camera layout"};
 if(["dual-square","dual-diagonal","dual-vertical","duo"].includes(rear))return {ultra:true,tele:false,source:"Published iPhone camera layout"};
 return {ultra:false,tele:false,source:"Published iPhone camera layout"};
}
function createPlan(modelSlug,cat){
 const model=cat?.getModel?.(modelSlug)||null;
 const lens=lensAvailability(model);
 const plan=[...basics,stability,flash];
 if(lens.ultra)plan.push(ultra);
 if(lens.tele)plan.push(tele);
 plan.push(front);
 if(faceIdSupported(model))plan.push(faceid);
 return {modelSlug:model?.slug||"",modelName:model?.name||"Not selected",year:model?.year||null,lenses:lens,
  faceIdCapable:faceIdSupported(model),steps:plan.map(step=>({...step}))};
}
function tally(steps,answers){
 const counts={PASS:0,FAIL:0,UNABLE:0,UNANSWERED:0};
 for(const step of steps){
  const v=answers?.[step.id];
  if(allowed.includes(v))counts[v]++;else counts.UNANSWERED++;
 }
 return counts;
}
function setAnswer(answers,id,status){
 if(!ids.has(id))throw Error("Unrecognised camera test");
 if(!allowed.includes(status))throw Error("Unrecognised result");
 return {...answers,[id]:status};
}
function interpretation(plan,answers,symptoms){
 // These are correlations for technician triage, not board-level diagnoses.
 const hints=[];
 const observed=id=>Array.isArray(symptoms?.[id])?symptoms[id].filter(v=>symptomOptions[id]?.includes(v)):[];
 if(answers?.rear==="FAIL"&&answers?.flash==="FAIL"){
  hints.push({id:"rear-flash",title:"Rear camera + flash both reported faulty",
   detail:"This combined symptom can indicate a camera-system communication, shared supply or connection problem on some models. It does not prove a common power rail or identify a failed camera module. Compare the rear module, connector, torch and model-specific circuit evidence."});
 }else if(answers?.rear==="FAIL"&&answers?.flash==="PASS"){
  hints.push({id:"rear-only",title:"Rear camera fault with working flash",
   detail:"The working flash is useful for narrowing an investigation, but it does not prove that the camera module itself is defective. Check camera routing, connections and relevant software or hardware clues."});
 }else if(answers?.rear==="PASS"&&answers?.flash==="FAIL"){
  hints.push({id:"flash-only",title:"Flash fault with working rear picture",
   detail:"A working camera image with a failed torch or flash may indicate an LED/control path, permission or temperature restriction, or an intermittent camera-system problem. Confirm in Control Centre and Apple's Camera app."});
 }
 if(answers?.stability==="FAIL"||answers?.focus==="FAIL"){
  hints.push({id:"focus-stability",title:"Investigate autofocus / image-stabilisation behaviour",
   detail:"Blurred or wandering focus, a shaky view while the phone is stationary, and unusual buzzing after impact may be consistent with autofocus or optical-stabilisation actuator damage. Magnets, accessories and software can cause similar symptoms. Confirm on the affected camera and with a known-good module before replacement."});
 }
 const mechanical=[...observed("focus"),...observed("stability")];
 if(mechanical.length&&hints.some(h=>h.id==="focus-stability")){
  const hint=hints.find(h=>h.id==="focus-stability");
  hint.detail="Customer-observed symptoms: "+mechanical.join("; ")+". "+hint.detail;
 }
 if(plan.faceIdCapable&&answers?.front==="PASS"&&answers?.faceid==="FAIL"){
  hints.push({id:"truedepth",title:"Selfie camera works but Face ID was reported failing",
   detail:"A visible selfie image does not verify the infrared camera, dot projector or the complete TrueDepth authentication path. Check enrolled/locked-out status, screen obstruction and Apple's Face ID troubleshooting before investigating the system."});
 }else if(plan.faceIdCapable&&answers?.faceid==="FAIL"){
  hints.push({id:"faceid",title:"Face ID recognition reported unsuccessful",
   detail:"An unsuccessful recognition attempt does not prove TrueDepth hardware damage. The person may not be enrolled, access may be temporarily blocked, or authentication may need another attempt. Review system state before concluding a hardware fault."});
 }
 return hints;
}
function report(plan,answers,evidence){
 const stats=tally(plan.steps,answers);
 const src=evidence||{};
 const lines=[
  "iREPAIR TOOLBOX — CAMERA DIAGNOSTICS",
  "Report date: "+new Date().toLocaleString("en-GB"),
  "iPhone model: "+plan.modelName+(plan.modelSlug?" (selected by customer)":" (not identified)"),
  "Result counts: "+stats.PASS+" Pass · "+stats.FAIL+" Fail · "+stats.UNABLE+" Unable · "+stats.UNANSWERED+" Unanswered",
  "Procedure: Guided visual observation. No automated optical hardware fault has been proven.",
  ""
 ];
 for(const step of plan.steps){
  const value=answers?.[step.id]||"UNANSWERED";
  const method=step.mode==="browser"?"Customer observed browser live camera preview":
    step.mode==="native-guided"?"Customer observed Apple Camera app; physical lens not independently verified":
    step.mode==="system-guided"?(src.faceIdNative?.outcome==="authenticated"?
      "Native iOS LocalAuthentication reported successful Face ID authentication; no individual TrueDepth component was tested":
      "Customer reported Apple system Face ID recognition; no biometric or infrared data was accessed"):
    src.flashTorchUsed?"Customer activated browser-exposed LED torch":
    "Customer observed flash via Camera app, or could not access it independently";
  lines.push(step.label+": "+value);
  lines.push("  Method: "+method);
 }
 const symptoms=src.symptoms||{};
 for(const step of plan.steps){
  const reported=Array.isArray(symptoms[step.id])?symptoms[step.id].filter(v=>symptomOptions[step.id]?.includes(v)):[];
  if(answers?.[step.id]==="FAIL"&&reported.length){
   lines.push("Customer-described "+step.label+" symptoms: "+reported.join("; "));
  }
 }
 const clues=interpretation(plan,answers,symptoms);
 if(clues.length){
  lines.push("","TECHNICIAN TRIAGE CLUES — NOT CONFIRMED HARDWARE FAULTS");
  for(const clue of clues)lines.push(clue.title+": "+clue.detail);
 }
 if(src.faceIdNative?.outcome){
  lines.push("","Native Face ID evidence: "+String(src.faceIdNative.outcome)+
   " (LocalAuthentication system outcome only; not an infrared camera or dot-projector component test).");
 }
 lines.push("","Camera access: Permission requested only during live preview; no photos uploaded or stored.");
 lines.push("Face ID: A guided system authentication observation is distinct from the RGB selfie camera. The app never accesses infrared or biometric templates.");
 lines.push("Limitation: Safari cannot independently guarantee rear physical wide/ultra-wide/telephoto lens isolation, calibrated focus accuracy, optical image stabilisation, TrueDepth sensors or flash availability.");
 lines.push("Native follow-up: AVFoundation discovery, effective device verification and on-iPhone testing still required.");
 return lines.join("\n");
}
root.iRepairCameraCore=Object.freeze({createPlan,lensAvailability,faceIdSupported,symptomOptions,tally,setAnswer,interpretation,report});
})(typeof window!=="undefined"?window:globalThis);