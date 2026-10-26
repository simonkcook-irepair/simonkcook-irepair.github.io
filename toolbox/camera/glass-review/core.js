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
const ids=new Set([...basics,ultra,tele,front,flash].map(v=>v.id));
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
 const plan=[...basics];
 if(lens.ultra)plan.push(ultra);
 if(lens.tele)plan.push(tele);
 plan.push(front,flash);
 return {modelSlug:model?.slug||"",modelName:model?.name||"Not selected",year:model?.year||null,lenses:lens,
  steps:plan.map(step=>({...step}))};
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
    src.flashTorchUsed?"Customer activated browser-exposed LED torch":
    "Customer observed flash via Camera app, or could not access it independently";
  lines.push(step.label+": "+value);
  lines.push("  Method: "+method);
 }
 lines.push("","Camera access: Permission requested only during live preview; no photos uploaded or stored.");
 lines.push("Limitation: Safari cannot independently guarantee rear physical wide/ultra-wide/telephoto lens isolation, calibrated focus accuracy, TrueDepth sensors or flash availability.");
 lines.push("Native follow-up: AVFoundation discovery, effective device verification and on-iPhone testing still required.");
 return lines.join("\n");
}
root.iRepairCameraCore=Object.freeze({createPlan,lensAvailability,tally,setAnswer,report});
})(typeof window!=="undefined"?window:globalThis);