/* iRepair Toolbox — Camera Diagnostics Safari adapter.
   No photos/video uploaded, stored persistently or transmitted; all visual
   observations are customer-scored. Native physical-lens isolation deferred. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const cat=window.IRepairDeviceCatalogue,core=window.iRepairCameraCore;
if(!cat||!core)throw Error("iRepair Camera Diagnostics catalogue/engine unavailable");
let plan=core.createPlan("",cat),index=0,answers={},symptoms={},nativeFaceId=null;
let stream=null,activeFacing="",generation=0,torchTimer=null,torchUsed=false,report="";
const $video=$("cameraVideo");
function show(view){
 document.querySelectorAll(".view").forEach(node=>node.classList.toggle("active",node.id===view));
 try{window.scrollTo({top:0,behavior:"instant"});}catch(e){}
}
function getStep(){return plan.steps[index];}
function text(node,message){node.textContent=String(message??"");}
function modelName(slug){return cat.getModel(slug)?.name||"Not selected";}
function buildModels(){
 const sel=$("phoneModel");
 const years=[...new Set(cat.models.map(m=>m.year))].sort((a,b)=>b-a);
 for(const year of years){
  const g=document.createElement("optgroup");g.label=String(year);
  for(const model of cat.models.filter(m=>m.year===year)){
   const option=document.createElement("option");option.value=model.slug;option.textContent=model.name;g.append(option);
  }
  sel.append(g);
 }
 const fromLink=new URLSearchParams(location.search).get("model");
 if(fromLink&&cat.getModel(fromLink))sel.value=cat.getModel(fromLink).slug;
 sel.addEventListener("change",updateSetup);
 updateSetup();
}
function updateSetup(){
 plan=core.createPlan($("phoneModel").value,cat);
 const extra=[];
 if(plan.lenses.ultra)extra.push("ultra-wide");
 if(plan.lenses.tele)extra.push("telephoto");
 text($("planTitle"),plan.steps.length+" guided camera checks"+(plan.modelSlug?" · "+plan.modelName:""));
 text($("planText"),"Rear image, focus, shake/noise and flash"+(extra.length?", "+extra.join(" and "):"")+
   ", front camera"+(plan.faceIdCapable?" and Face ID recognition":"")+".");
 text($("modelHelp"),plan.modelSlug?"Customer-selected "+plan.modelName+". Lens checks follow its published camera layout; Safari cannot independently verify those physical lenses.":"Year-grouped newest-first models. Skip this if unsure: the core rear/front camera checks still work.");
}
function cleanupTorch(){
 if(torchTimer){clearTimeout(torchTimer);torchTimer=null;}
 if(stream){
  const track=stream.getVideoTracks?.()[0];
  if(track&&track.readyState==="live"&&typeof track.applyConstraints==="function"){
   try{void track.applyConstraints({advanced:[{torch:false}]}).catch(()=>{});}catch(e){}
  }
 }
 $("torchButton").disabled=false;
 text($("torchButton"),"Switch torch on briefly");
}
function discardPhoto(){
 const img=$("photoPreview");
 img.hidden=true;img.removeAttribute("src");
 $("discardFrame").hidden=true;
 $("captureFrame").disabled=false;
}
function stopStream(){
 ++generation;cleanupTorch();discardPhoto();
 if(stream){for(const track of stream.getTracks())try{track.stop()}catch(e){}}
 stream=null;activeFacing="";
 $video.pause();$video.srcObject=null;
 $video.classList.remove("visible","selfie");
 $("previewLabel").hidden=true;$("focusReticle").hidden=true;
 $("photoPanel").hidden=true;$("photoPanel").open=false;
 $("torchButton").hidden=true;
}
function fallback(heading,message){
 $video.classList.remove("visible");
 $("cameraFallback").hidden=false;
 text($("fallbackHeading"),heading);
 text($("fallbackNote"),message);
}
function showModelIllustration(step){
 stopStream();
 const faceId=step.id==="faceid";
 fallback(faceId?"Face ID is an Apple system feature":"Check in the iPhone Camera app",
   "Return here to record the result you observed.");
 $("cameraFallback").hidden=true;
 const svg=$("modelDiagram");
 const side=faceId?"front":"rear";
 cat.render(svg,plan.modelSlug||"iphone-17",side,faceId?"frontMic":"");
 svg.removeAttribute("hidden");
 svg.setAttribute("aria-label",plan.modelName+" "+side+" camera illustration — not a measured hardware test");
 $("retryCamera").hidden=true;
 $("previewLabel").hidden=true;
 $("streamStatus").textContent=faceId?
   "Safari cannot read Face ID or the infrared TrueDepth image. Use your iPhone's normal Face ID authentication, then return here; never share your passcode.":
   "Safari cannot confirm that the "+(step.id==="ultra"?"0.5× ultra-wide":"telephoto")+" physical lens is isolated. Open Apple's Camera app to inspect it.";
}
async function openCamera(facing){
 const step=getStep();
 if(!step||step.mode==="native-guided"||step.mode==="system-guided")return;
 const myGen=++generation;
 cleanupTorch();
 discardPhoto();
 $("modelDiagram").setAttribute("hidden","");
 $("retryCamera").hidden=true;
 $("torchButton").hidden=true;
 $("photoPanel").hidden=true;
 $("previewLabel").hidden=true;
 $("focusReticle").hidden=true;
 fallback("Opening camera preview…","You may be asked to allow camera access.");
 text($("streamStatus"),"Requesting "+(facing==="user"?"front":"rear")+" camera access…");
 if(!navigator.mediaDevices?.getUserMedia){
  fallback("Camera preview unavailable","This browser cannot access a camera. Use Unable to Test, or try an external Safari tab.");
  text($("streamStatus"),"This browser does not support live camera capture.");
  $("retryCamera").hidden=false;return;
 }
 if(stream&&activeFacing!==facing){
  stopStream();
 }else if(stream&&activeFacing===facing){
  if(myGen!==generation)return; // A previous transition superseded this attempt.
  bindStream(stream,facing,step);return;
 }
 // stopStream increments generation: start the new request from current value
 const requestGeneration=++generation;
 try{
  const s=await navigator.mediaDevices.getUserMedia({audio:false,
   video:{facingMode:{ideal:facing},width:{ideal:1280},height:{ideal:720},frameRate:{ideal:24,max:30}}});
  if(requestGeneration!==generation||!document.querySelector("#test.active")||getStep()?.facing!==facing){
   for(const track of s.getTracks())track.stop();return;
  }
  stream=s;activeFacing=facing;
  bindStream(s,facing,step);
 }catch(e){
  if(requestGeneration!==generation)return;
  const denied=e?.name==="NotAllowedError"||e?.name==="PermissionDeniedError";
  fallback(denied?"Camera permission not granted":"Camera preview unavailable",
    denied?"Allow camera access in Safari settings, or mark Unable to Test.":
    "The requested camera could not be opened. Try again or mark Unable to Test.");
  text($("streamStatus"),denied?"Camera permission is currently denied or unavailable.":"No live camera available for this stage.");
  $("retryCamera").hidden=false;
 }
}
function bindStream(s,facing,step){
 $video.srcObject=s;
 const track=s.getVideoTracks?.()[0];
 const route=track?.getSettings?.().facingMode||"";
 $video.classList.toggle("selfie",facing==="user"&&route!=="environment");
 $video.play().then(()=>{
  if(!stream||stream!==s)return;
  $("cameraFallback").hidden=true;
  $video.classList.add("visible");
  $("previewLabel").hidden=false;
  const mismatch=!!route&&route!==facing;
  text($("previewLabel"),mismatch?"CAMERA SOURCE · CHECK VIEW":
    facing==="user"?"FRONT VIEW REQUESTED · LIVE":"REAR VIEW REQUESTED · LIVE");
  $("focusReticle").hidden=step.id!=="focus";
  $("photoPanel").hidden=false;
  text($("streamStatus"),mismatch?
    "Safari returned a different facing-mode stream. Confirm what you see; mark Unable to Test if it is the wrong camera.":
    (route===facing?"Browser reports a "+(facing==="user"?"front":"rear")+"-facing stream. ":"Safari requested a "+(facing==="user"?"front":"rear")+"-facing stream; verify the view. ")+
    "Nothing is recorded automatically.");
  if(step.id==="flash"){
   const caps=track?.getCapabilities?.()||{};
   $("torchButton").hidden=caps.torch!==true;
   if(caps.torch===true)text($("streamStatus"),"Browser supports a controlled rear torch check. Tap the button once and observe the LED.");
   else text($("streamStatus"),"Browser torch access unavailable. Check the rear flash using Apple's Camera app.");
  }
 }).catch(()=>{
  fallback("Camera playback unavailable","Safari has not started the video preview. Retry or mark Unable to Test.");
  $("retryCamera").hidden=false;
  text($("streamStatus"),"Live preview could not begin.");
 });
}
function drawProgress(){
 const el=$("progress");el.replaceChildren();
 for(let i=0;i<plan.steps.length;i++){
  const bar=document.createElement("i");bar.classList.toggle("on",i<=index);
  el.append(bar);
 }
 el.setAttribute("aria-label","Camera check "+(index+1)+" of "+plan.steps.length);
}
function showSymptomFollowup(step){
 const panel=$("symptomPanel"),choices=$("symptomOptions");
 choices.replaceChildren();
 for(const labelText of core.symptomOptions[step.id]||[]){
  const label=document.createElement("label");label.className="symptomOption";
  const check=document.createElement("input");check.type="checkbox";check.value=labelText;
  check.checked=Array.isArray(symptoms[step.id])&&symptoms[step.id].includes(labelText);
  label.append(check,document.createTextNode(labelText));choices.append(label);
 }
 panel.hidden=false;
 $("symptomContinue").focus();
}
function advanceStep(){
 $("symptomPanel").hidden=true;
 if(index>=plan.steps.length-1)showResults();
 else {index++;renderStep()}
}
function renderStep(){
 const step=getStep();
 if(!step){showResults();return}
 show("test");
 $("symptomPanel").hidden=true;
 $("nativeFace").hidden=true;
 drawProgress();
 text($("stepCounter"),"Camera "+(index+1)+" / "+plan.steps.length);
 text($("stepEyebrow"),step.id==="faceid"?"Face ID / TrueDepth check":
   step.mode==="native-guided"?"Guided lens observation":
   step.id==="flash"?"Flash and rear-camera comparison":
   step.id==="stability"?"Image stabilisation observation":"Live camera check");
 text($("stepTitle"),step.title);
 text($("stepInstruction"),step.instruction);
 text($("testQuestion"),step.check);
 text($("testFoot"),step.mode==="system-guided"?
 "Record Pass only if system Face ID actually recognised you. If not enrolled or unavailable, select Unable to Test. A selfie preview is not a TrueDepth test.":
 step.mode==="native-guided"?
 "Record only what you observed in Apple's Camera app; Safari cannot independently confirm the physical lens.":
 step.id==="stability"?
 "An unstable picture or high-pitched noise is a possible focus/OIS clue, not proof of a damaged camera module.":
 step.id==="flash"&&answers.rear==="FAIL"?
 "The rear image was marked Fail. Check the torch independently: both failing can be a useful shared-system clue, not proof of a common power rail.":
 "Mark your own visual observation. A live preview is not an automated hardware diagnosis.");
 $("previous").disabled=index===0;
 const nativeBridge=window.webkit?.messageHandlers?.iRepairFaceID;
 $("nativeFace").hidden=!(step.id==="faceid"&&typeof nativeBridge?.postMessage==="function");
 text($("nativeFaceStatus"),nativeFaceId?
   "System result: "+nativeFaceId.outcome+". This is not a component-level hardware test.":
   "Uses iOS LocalAuthentication. No Face ID biometric data is accessible to this app.");
 $("retryCamera").hidden=step.mode==="native-guided"||step.mode==="system-guided";
 $("torchButton").hidden=true;
 $("modelDiagram").setAttribute("hidden","");
 if(step.mode==="native-guided"||step.mode==="system-guided"){
  showModelIllustration(step);
 }else{
  // Release capture when changing camera direction to prevent iOS conflicts.
  if(activeFacing!==step.facing&&stream)stopStream();
  void openCamera(step.facing);
 }
}
function mark(answer){
 const step=getStep();
 if(!step)return;
 answers=core.setAnswer(answers,step.id,answer);
 discardPhoto();
 if(answer==="FAIL"&&core.symptomOptions[step.id]){
  showSymptomFollowup(step);return;
 }
 delete symptoms[step.id];
 advanceStep();
}
function startTests(){
 stopStream();
 answers={};symptoms={};nativeFaceId=null;torchUsed=false;index=0;plan=core.createPlan($("phoneModel").value,cat);
 renderStep();
}
function showResults(){
 stopStream();
 const stats=core.tally(plan.steps,answers);
 text($("passCount"),stats.PASS);
 text($("failCount"),stats.FAIL);
 text($("unableCount"),stats.UNABLE);
 text($("resultIntro"),plan.modelSlug?"Results for "+plan.modelName+" · based on your observations.":
   "Results based on your observations · iPhone model not selected.");
 const rows=$("resultRows");rows.replaceChildren();
 for(const step of plan.steps){
  const value=answers[step.id]||"UNABLE";
  const row=document.createElement("div");row.className="resultRow";
  const title=document.createElement("strong");title.textContent=step.label+" — "+(value==="UNABLE"?"Unable to Test":value==="PASS"?"Pass":"Fail");
  title.className=value==="PASS"?"good":value==="FAIL"?"bad":"neutral";
  const note=document.createElement("span");
  note.textContent=step.mode==="system-guided"?
   "Customer reported system Face ID recognition. The app did not capture biometric data or test individual TrueDepth parts.":
   step.mode==="native-guided"?"Customer observation in Apple Camera app; physical lens was not verified independently.":
   step.mode==="torch-or-native-guided"?"Rear LED observation; "+(torchUsed?"browser torch was activated":"native Camera app check or browser support may be limited")+".":"Customer observation of the browser camera preview.";
  row.append(title,note);
  if(value==="FAIL"&&symptoms[step.id]?.length){
   const tags=document.createElement("span");
   tags.textContent="Observed: "+symptoms[step.id].join("; ");
   row.append(tags);
  }
  rows.append(row);
 }
 const clues=core.interpretation(plan,answers,symptoms);
 const hints=$("triageHints"),hintRows=$("triageRows");
 hintRows.replaceChildren();hints.hidden=clues.length===0;
 for(const hint of clues){
  const card=document.createElement("div");card.className="triageRow";
  const title=document.createElement("strong");title.textContent=hint.title;
  const detail=document.createElement("span");detail.textContent=hint.detail;
  card.append(title,detail);hintRows.append(card);
 }
 report=core.report(plan,answers,{flashTorchUsed:torchUsed,symptoms,faceIdNative:nativeFaceId});
 text($("copyReport"),"Copy technician report");
 text($("shareReport"),"Share report");
 show("results");
}
async function copy(textToCopy){
 try{
  if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");
  await navigator.clipboard.writeText(textToCopy);return true;
 }catch(e){
  const field=document.createElement("textarea");field.value=textToCopy;
  field.style.cssText="position:fixed;left:-9999px;opacity:0";
  document.body.append(field);field.select();
  let ok=false;try{ok=document.execCommand("copy")}catch(err){}
  field.remove();if(!ok)window.prompt("Select and copy your camera report:",textToCopy);
  return ok;
 }
}
async function torchPulse(){
 const track=stream?.getVideoTracks?.()[0];
 if(!track||track.readyState!=="live"||!track.applyConstraints)return;
 if(track.getCapabilities?.().torch!==true)return;
 const button=$("torchButton");button.disabled=true;
 text(button,"Torch active…");
 try{
  await track.applyConstraints({advanced:[{torch:true}]});
  torchUsed=true;
  text($("streamStatus"),"Torch briefly active. Inspect the rear LED without looking directly into it.");
  torchTimer=setTimeout(()=>{
   torchTimer=null;
   try{void track.applyConstraints({advanced:[{torch:false}]}).catch(()=>{})}catch(e){}
   button.disabled=false;text(button,"Switch torch on briefly");
   text($("streamStatus"),"Torch switched off. Record your observation below.");
  },2200);
 }catch(e){
  button.disabled=false;text(button,"Switch torch on briefly");
  text($("streamStatus"),"Torch could not be controlled by Safari. Check the LED with Apple's Camera app.");
 }
}
function captureFrame(){
 const video=$video;
 if(!stream||!video.videoWidth||!video.videoHeight)return;
 const canvas=$("captureCanvas");
 const ratio=Math.min(1,1280/Math.max(video.videoWidth,video.videoHeight));
 canvas.width=Math.round(video.videoWidth*ratio);
 canvas.height=Math.round(video.videoHeight*ratio);
 canvas.getContext("2d",{alpha:false}).drawImage(video,0,0,canvas.width,canvas.height);
 const photo=$("photoPreview");photo.src=canvas.toDataURL("image/jpeg",.78);photo.hidden=false;
 $("discardFrame").hidden=false;
 $("captureFrame").disabled=true;
}
function leaveTest(){
 stopStream();show("setup");
}
$("symptomContinue").addEventListener("click",()=>{
 const step=getStep();if(!step||answers[step.id]!=="FAIL")return;
 symptoms[step.id]=Array.from($("symptomOptions").querySelectorAll("input:checked"),input=>input.value);
 advanceStep();
});
$("nativeFaceButton").addEventListener("click",async()=>{
 if(getStep()?.id!=="faceid")return;
 const bridge=window.webkit?.messageHandlers?.iRepairFaceID;
 if(typeof bridge?.postMessage!=="function")return;
 const button=$("nativeFaceButton");button.disabled=true;
 text($("nativeFaceStatus"),"iOS is checking system Face ID authentication…");
 try{
  const result=await bridge.postMessage({action:"authenticateFaceID"});
  if(getStep()?.id!=="faceid")return;
  const outcomes=new Set(["authenticated","notConfirmed","unavailable","unsupported"]);
  nativeFaceId=result?.source==="ios-native"&&outcomes.has(result?.status)?
    {outcome:result.status}:null;
  text($("nativeFaceStatus"),nativeFaceId?
   "System result: "+nativeFaceId.outcome+". Record your conclusion below; this does not test individual TrueDepth parts.":
   "A native Face ID result was unavailable; choose Unable to Test if necessary.");
 }catch(e){
  text($("nativeFaceStatus"),"Native authentication unavailable; choose Unable to Test if appropriate.");
 }finally{button.disabled=false;}
});
$("begin").addEventListener("click",()=>show("setup"));
$("setupBack").addEventListener("click",()=>show("home"));
$("start").addEventListener("click",startTests);
$("exitTest").addEventListener("click",leaveTest);
$("leave").addEventListener("click",leaveTest);
$("previous").addEventListener("click",()=>{if(index>0){index--;renderStep()}});
document.querySelectorAll("[data-answer]").forEach(btn=>
 btn.addEventListener("click",()=>mark(btn.getAttribute("data-answer"))));
$("retryCamera").addEventListener("click",()=>{void openCamera(getStep().facing)});
$("torchButton").addEventListener("click",()=>{void torchPulse()});
$("captureFrame").addEventListener("click",captureFrame);
$("discardFrame").addEventListener("click",discardPhoto);
$("copyReport").addEventListener("click",async()=>{if(report&&await copy(report))text($("copyReport"),"Copied ✓")});
$("shareReport").addEventListener("click",async()=>{
 if(!report)return;
 if(navigator.share){
  try{await navigator.share({title:"iRepair Camera Diagnostics",text:report});return}
  catch(e){if(e.name==="AbortError")return}
 }
 if(await copy(report))text($("shareReport"),"Copied to share ✓");
});
$("printReport").addEventListener("click",()=>window.print());
$("startOver").addEventListener("click",()=>{stopStream();show("setup");updateSetup()});
document.addEventListener("visibilitychange",()=>{
 if(document.hidden){
  stopStream();
 }else if(document.querySelector("#test.active")&&getStep()?.mode!=="native-guided"&&getStep()?.mode!=="system-guided"){
  fallback("Camera paused","The app was in the background. Tap Try camera again to restart the preview.");
  $("retryCamera").hidden=false;
  text($("streamStatus"),"Camera was released while the page was in the background.");
 }
});
window.addEventListener("pagehide",stopStream);
buildModels();
})();