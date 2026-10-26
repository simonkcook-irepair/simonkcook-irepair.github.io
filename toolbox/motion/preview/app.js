/* iRepair Motion & Haptics guided Safari app — no simulated sensor data. */
(function(){
"use strict";
const $=id=>document.getElementById(id),core=window.IRepairMotionCore,cat=window.IRepairDeviceCatalogue;
if(!core||!cat||!window.IRepairSensorFeed)throw Error("Motion Toolbox modules missing");
let plan=core.createPlan("",cat),index=0,answers={},symptoms={},reportText="";
const set=(id,value)=>{$(id).textContent=String(value)};
const current=()=>plan.steps[index];
const fmt=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(2):"—";
function show(id){
 document.querySelectorAll(".view").forEach(n=>n.classList.toggle("active",n.id===id));
 try{window.scrollTo({top:0,behavior:"instant"})}catch(e){}
}
function onSensor(kind,nums,count){
 if(!document.querySelector("#test.active"))return;
 const labels=kind==="acceleration"?["X · m/s²","Y · m/s²","Z · m/s²"]:
  kind==="rotation"?["α · °/s","β · °/s","γ · °/s"]:["PITCH · °","ROLL · °","YAW · °"];
 ["X","Y","Z"].forEach((key,i)=>{set("read"+key+"Label",labels[i]);set("read"+key,fmt(nums[i]))});
 set("sensorStatus",count+" real "+kind+" event"+(count===1?"":"s")+" received for this check.");
 if(kind==="orientation"){
  const pitch=Number.isFinite(nums[0])?Math.max(-23,Math.min(23,-nums[0]*.23)):0;
  const roll=Number.isFinite(nums[1])?Math.max(-24,Math.min(24,nums[1]*.45)):0;
  $("demoDevice").style.setProperty("--rx",pitch+"deg");
  $("demoDevice").style.setProperty("--ry",roll+"deg");
  $("demoDevice").setAttribute("aria-label","Live orientation, pitch "+
    (Number.isFinite(nums[0])?nums[0].toFixed(0):"unknown")+
    " degrees, roll "+(Number.isFinite(nums[1])?nums[1].toFixed(0):"unknown")+" degrees.");
 }
}
const feed=window.IRepairSensorFeed.create(onSensor,message=>set("sensorStatus",message));
function buildModels(){
 const sel=$("phoneModel"),years=[...new Set(cat.models.map(m=>m.year))].sort((a,b)=>b-a);
 years.forEach(year=>{
  const group=document.createElement("optgroup");group.label=String(year);
  cat.models.filter(m=>m.year===year).forEach(m=>{
   const opt=document.createElement("option");opt.value=m.slug;opt.textContent=m.name;group.append(opt)
  });sel.append(group);
 });
 const suggested=new URLSearchParams(location.search).get("model");
 if(suggested&&cat.getModel(suggested))sel.value=cat.getModel(suggested).slug;
 sel.addEventListener("change",()=>{
  const m=cat.getModel(sel.value);
  set("modelHelp",m?m.name+" selected for your report. Safari cannot verify the model.":
    "Model selection adds detail to the report. Safari cannot automatically identify the iPhone model.");
 });
}
function progress(){
 const track=$("progress");track.replaceChildren();
 plan.steps.forEach((_,i)=>{
  const bar=document.createElement("i");bar.classList.toggle("on",i<=index);track.append(bar)
 });
 track.setAttribute("aria-label","Test "+(index+1)+" of "+plan.steps.length);
}
function renderStep(){
 const s=current();if(!s){results();return}
 feed.setStage(s.id);show("test");$("symptomPanel").hidden=true;progress();
 set("stepCounter","Sensor "+(index+1)+" / "+plan.steps.length);
 set("stepTitle",s.title);set("stepInstruction",s.instruction);set("testQuestion",s.question);
 set("stepEyebrow",s.mode==="web-motion"||s.mode==="web-orientation"?"Live sensor observation":
  s.id==="haptics"?"Tactile feedback check":s.id==="proximity"?"Near-ear response":"Compass guidance");
 set("stepMethod",s.mode==="web-motion"||s.mode==="web-orientation"?
  "Readings are genuine browser sensor events if available, never an automatic hardware verdict.":
  s.id==="haptics"?"Only you can verify physically felt haptic feedback.":
  "Guided observation in an Apple system feature, not an electronic sensor measurement.");
 $("previous").disabled=index===0;
 const measuring=["accel","gyro","tilt"].includes(s.id);
 $("readings").hidden=!measuring;
 $("permissionButton").hidden=!measuring||feed.active;
 $("permissionButton").textContent=feed.permission==="not-requested"?"Enable Live Motion Sensors":"Retry / Enable Motion Access";
 $("hapticButton").hidden=s.id!=="haptics";
 $("hapticButton").textContent="Request Haptic Feedback";
 const stage=$("motionStage");
 stage.classList.toggle("guided",!measuring);
 stage.classList.toggle("proximityStage",s.id==="proximity");
 stage.classList.toggle("hapticStage",s.id==="haptics");
 $("demoDevice").style.removeProperty("--rx");$("demoDevice").style.removeProperty("--ry");
 $("demoDevice").setAttribute("aria-label",measuring?"Illustrative phone; orientation changes only with live sensor values":"Animated example illustration, not live sensor data");
 set("stageLabel",measuring?"LIVE DATA · IF AVAILABLE":s.id==="compass"?"APPLE COMPASS APP":
  s.id==="proximity"?"PROXIMITY · CALL":"TACTILE CHECK · FEEL IT");
 if(measuring){
  const labels=s.id==="accel"?["X · m/s²","Y · m/s²","Z · m/s²"]:
   s.id==="gyro"?["α · °/s","β · °/s","γ · °/s"]:["PITCH · °","ROLL · °","YAW · °"];
  ["X","Y","Z"].forEach((key,i)=>{set("read"+key+"Label",labels[i]);set("read"+key,"—")});
  set("sensorStatus",feed.active?"Move gently and watch for actual "+s.title.toLowerCase()+" readings.":
   "Tap Enable Live Motion Sensors; Safari may request permission.");
 }else set("sensorStatus",s.id==="haptics"?
  "Safari may not be able to vibrate the Taptic Engine. Check feedback in Settings → Sounds & Haptics.":
  s.id==="proximity"?"Observe the screen during a normal phone call; Safari cannot measure proximity.":
  "Use Apple's Compass app. Browser heading data is not claimed.");
}
function advance(){if(index>=plan.steps.length-1)results();else {index++;renderStep()}}
function mark(status){
 const s=current();if(!s)return;
 answers=core.setAnswer(answers,s.id,status);
 if(status==="FAIL"){
  const panel=$("symptomOptions");panel.replaceChildren();
  core.symptoms[s.id].forEach(message=>{
   const label=document.createElement("label");label.className="symptomOption";
   const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=message;
   checkbox.checked=symptoms[s.id]?.includes(message)||false;
   label.append(checkbox,document.createTextNode(message));panel.append(label);
  });
  $("symptomPanel").hidden=false;$("symptomContinue").focus();return;
 }
 delete symptoms[s.id];advance();
}
function renderResultRow(s,evidence){
 const row=document.createElement("div");row.className="resultRow";
 const result=answers[s.id]||"UNANSWERED";
 const title=document.createElement("strong");title.className=result==="PASS"?"good":result==="FAIL"?"bad":"neutral";
 title.textContent=s.title+" — "+(result==="UNABLE"?"Unable to Test":result==="UNANSWERED"?"Not completed":result==="PASS"?"Pass":"Fail");
 const detail=document.createElement("span");detail.textContent=core.evidenceMethod(s,evidence);
 row.append(title,detail);
 if(result==="FAIL"&&symptoms[s.id]?.length){
  const note=document.createElement("span");note.textContent="Observed: "+symptoms[s.id].join("; ");row.append(note);
 }
 $("resultRows").append(row);
}
function results(){
 feed.stop();const evidence=feed.snapshot(),totals=core.tally(plan,answers);
 ["PASS","FAIL","UNABLE"].forEach(key=>set(key.toLowerCase()+"Count",totals[key]));
 set("resultIntro",plan.modelSlug?plan.modelName+" · your observations and actual browser readings.":
  "Your observations and actual browser readings · model not selected.");
 $("resultRows").replaceChildren();plan.steps.forEach(s=>renderResultRow(s,evidence));
 const hints=core.interpretation(plan,answers,symptoms),rows=$("triageRows");
 rows.replaceChildren();$("triageHints").hidden=hints.length===0;
 hints.forEach(h=>{
  const node=document.createElement("div");node.className="triageRow";
  const name=document.createElement("strong");name.textContent=h.title;
  const description=document.createElement("span");description.textContent=h.detail;
  node.append(name,description);rows.append(node);
 });
 reportText=core.report(plan,answers,evidence,symptoms);
 set("copyReport","Copy technician report");set("shareReport","Share report");show("results");
}
function begin(){feed.reset();answers={};symptoms={};reportText="";index=0;
 plan=core.createPlan($("phoneModel").value,cat);renderStep()}
function exit(){feed.stop();show("setup")}
function haptic(){
 try{
  if(typeof navigator.vibrate==="function"&&navigator.vibrate([120,90,120]))
   set("sensorStatus","Vibration requested. Only you can confirm if you felt it.");
  else set("sensorStatus","Safari cannot directly drive the iPhone Taptic Engine. Try a system haptic in Settings → Sounds & Haptics.");
 }catch(e){set("sensorStatus","Browser haptic control unavailable; test a normal iPhone system feedback pattern.")}
 set("hapticButton","Try Haptic Request Again");
}
async function copy(value){
 try{if(!navigator.clipboard?.writeText)throw Error("clipboard unavailable");
 await navigator.clipboard.writeText(value);return true}
 catch(e){
  const node=document.createElement("textarea");node.value=value;
  node.style.cssText="position:fixed;left:-9999px;opacity:0";
  document.body.append(node);node.select();
  let ok=false;try{ok=document.execCommand("copy")}catch(err){}
  node.remove();if(!ok)window.prompt("Select and copy your report:",value);return ok;
 }
}
$("begin").addEventListener("click",()=>show("setup"));
$("setupBack").addEventListener("click",()=>show("home"));
$("start").addEventListener("click",begin);
$("exitTest").addEventListener("click",exit);$("leave").addEventListener("click",exit);
$("permissionButton").addEventListener("click",async()=>{
 const ok=await feed.start();$("permissionButton").hidden=ok;
});
$("hapticButton").addEventListener("click",haptic);
$("symptomContinue").addEventListener("click",()=>{
 const s=current();if(!s||answers[s.id]!=="FAIL")return;
 symptoms[s.id]=Array.from($("symptomOptions").querySelectorAll("input:checked"),v=>v.value);
 advance();
});
document.querySelectorAll("[data-answer]").forEach(btn=>
 btn.addEventListener("click",()=>mark(btn.dataset.answer)));
$("previous").addEventListener("click",()=>{if(index>0){index--;renderStep()}});
$("copyReport").addEventListener("click",async()=>{if(reportText&&await copy(reportText))set("copyReport","Copied ✓")});
$("shareReport").addEventListener("click",async()=>{
 if(!reportText)return;
 if(navigator.share){try{await navigator.share({title:"iRepair Motion Diagnostics",text:reportText});return}
  catch(e){if(e.name==="AbortError")return}}
 if(await copy(reportText))set("shareReport","Copied for sharing ✓");
});
$("printReport").addEventListener("click",()=>window.print());
$("startOver").addEventListener("click",()=>{feed.stop();show("setup")});
document.addEventListener("visibilitychange",()=>{
 if(document.hidden)feed.stop();
 else if(document.querySelector("#test.active")&&["accel","gyro","tilt"].includes(current()?.id)){
  $("permissionButton").hidden=false;
  set("sensorStatus","Motion listeners were paused in the background. Tap Retry / Enable Motion Access.");
 }
});
window.addEventListener("pagehide",()=>feed.stop());
buildModels();
})();