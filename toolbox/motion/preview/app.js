/* iRepair Motion & Haptics guided Safari app — no simulated sensor data. */
(function(){
"use strict";
const $=id=>document.getElementById(id),core=window.IRepairMotionCore,cat=window.IRepairDeviceCatalogue;
if(!core||!cat||!window.IRepairSensorFeed||!window.IRepairMotionGuidance)throw Error("Motion Toolbox modules missing");
let plan=core.createPlan("",cat),index=0,answers={},symptoms={},reportText="",tracker=null,detections={},liveZBaseline=null;
const set=(id,value)=>{$(id).textContent=String(value)};
const current=()=>plan.steps[index];
const fmt=v=>Number.isFinite(v)?(v>=0?"+":"")+v.toFixed(2):"—";
function show(id){
 document.querySelectorAll(".view").forEach(n=>n.classList.toggle("active",n.id===id));
 try{window.scrollTo({top:0,behavior:"instant"})}catch(e){}
}
function updateDetected(status){
 const step=current();if(!step||!tracker)return;
 const data=status||tracker.snapshot(),last=detections[step.id],done=data.complete;
 detections[step.id]=data;
 const stage=$("motionStage");
 stage.dataset.phase=data.phase;
 if(last&&last.phase==="first"&&data.phase==="second")liveZBaseline=null;
 set("guideActionLabel",data.instruction);
 set("responseHeading","YOUR IPHONE · LIVE");
 const box=$("detectionPanel");box.dataset.state=done?"detected":data.events?"in-progress":"waiting";
 set("detectionIcon",done?"✓":data.first?"✓":data.events?"↗":"◌");
 set("detectionTitle",done?"Both moves detected":data.first?"First move detected":data.events?"Movement coming through":"Waiting for movement");
 set("detectionDetail",done?"Great! Choose Pass to continue.":
  data.first?"Now follow the next example above.":
  data.events?"Keep following the example above.":"Move your phone as shown above.");
 for(const [id,label,ok] of [["checkA",data.labels[0],data.first],["checkB",data.labels[1],data.second]]){
  const el=$(id);el.textContent=(ok?"✓ ":"◌ ")+label;el.classList.toggle("done",ok);
 }
 const pass=document.querySelector('[data-answer="PASS"]');
 pass.disabled=!done;pass.textContent=done?"✓ Pass & Continue":"✓ Pass";
}
function onSensor(kind,nums,count){
 if(!document.querySelector("#test.active"))return;
 const labels=kind==="acceleration"?["X · m/s²","Y · m/s²","Z · m/s²"]:
  kind==="rotation"?["α · °/s","β · °/s","γ · °/s"]:["PITCH · °","ROLL · °","YAW · °"];
 ["X","Y","Z"].forEach((key,i)=>{set("read"+key+"Label",labels[i]);set("read"+key,fmt(nums[i]))});
 if(tracker)updateDetected(tracker.observe(kind,nums));
 // Visuals follow real event values when exposed; no scripted sensor movement.
 if(kind==="acceleration"){
  const vx=Number.isFinite(nums[0])?Math.max(-17,Math.min(17,nums[0]*1.8)):0;
  $("demoDevice").style.setProperty("--tx",vx+"px");
  // Screen-normal acceleration, not a fabricated distance estimate.
  if(Number.isFinite(nums[2])){
   if(liveZBaseline===null)liveZBaseline=nums[2];
   const scale=Math.max(.88,Math.min(1.12,1+(nums[2]-liveZBaseline)*.035));
   $("demoDevice").style.setProperty("--live-scale",scale.toFixed(3));
  }
 }else if(kind==="rotation"){
  const turn=Number.isFinite(nums[2])?nums[2]:Number.isFinite(nums[0])?nums[0]:0;
  $("demoDevice").style.setProperty("--rz",Math.max(-23,Math.min(23,turn*.35))+"deg");
 }
 set("sensorStatus","Real sensor readings received: "+count+" samples. These do not prove overall hardware health.");
 if(kind==="orientation"){
  const pitch=Number.isFinite(nums[0])?Math.max(-23,Math.min(23,-nums[0]*.23)):0;
  const roll=Number.isFinite(nums[1])?Math.max(-24,Math.min(24,nums[1]*.45)):0;
  $("demoDevice").style.setProperty("--rx",pitch+"deg");
  $("demoDevice").style.setProperty("--ry",roll+"deg");
  $("demoDevice").setAttribute("aria-label","iPhone illustration following live pitch and roll data");
 }
}
function onFeedState(message){
 set("sensorStatus",message);
 if(!document.querySelector("#test.active")||!tracker)return;
 if(/not granted|does not expose|could not|No (acceleration|rotation|orientation) samples/.test(message)){
  const d=tracker.snapshot();
  if(!d.complete){
   set("detectionIcon","?");
   set("detectionTitle","No live response yet");
   set("detectionDetail","If Safari cannot read movement, choose Unable to Test.");
   if(message.includes("No ")&&message.includes("samples"))
     $("permissionButton").hidden=false;
  }
 }
}
const feed=window.IRepairSensorFeed.create(onSensor,onFeedState);
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
 const measuring=["accel","gyro","tilt"].includes(s.id);
 liveZBaseline=null;
 feed.setStage(s.id);
 tracker=measuring?window.IRepairMotionGuidance.create(s.id):null;
 show("test");$("symptomPanel").hidden=true;progress();
 set("stepCounter","Check "+(index+1)+" of "+plan.steps.length);
 const friendly={accel:"Moving your iPhone",gyro:"Turning your iPhone",tilt:"Tilting your iPhone",
  compass:"Check your compass",haptics:"Feel the vibration",proximity:"Screen near your ear"};
 set("stepTitle",friendly[s.id]||s.title);
 set("stepInstruction",s.instruction);
 $("stepInstruction").hidden=true;
 set("testQuestion",measuring?"Did your iPhone respond as shown?":s.question);
 set("stepEyebrow","A SIMPLE GUIDED CHECK");
 set("stepMethod",measuring?
   "Motion response is inferred from actual browser readings; this is not a component-level hardware verdict.":
   "Customer-observed test; no individual hardware sensor was electronically measured.");
 $("stepMethod").hidden=true;
 $("previous").disabled=index===0;
 $("technicalPanel").hidden=!measuring;$("technicalPanel").open=false;
 $("readings").hidden=!measuring;
 $("permissionButton").hidden=!measuring||feed.active;
 $("permissionButton").textContent=feed.permission==="not-requested"?"Allow Motion Detection":"Try Motion Access Again";
 $("hapticButton").hidden=s.id!=="haptics"||typeof navigator.vibrate!=="function";
 $("hapticButton").textContent="Try Haptic Feedback";
 const stage=$("motionStage");
 for(const type of ["accel","gyro","tilt","compass","haptics","proximity"]){
  stage.classList.toggle("stage-"+type,s.id===type);
 }
 stage.classList.toggle("guided",!measuring);
 stage.classList.toggle("proximityStage",s.id==="proximity");
 stage.classList.toggle("hapticStage",s.id==="haptics");
 stage.dataset.phase="first";
 for(const prop of ["--rx","--ry","--tx","--ty","--rz","--live-scale"])
  $("demoDevice").style.removeProperty(prop);
 $("demoDevice").setAttribute("aria-label",measuring?
  "Live visual follows browser sensor values only. The top example is not sensor data.":
  "No live sensor data claimed for this guided check.");
 $("checkpoints").hidden=!measuring;
 $("guidedOutcome").hidden=measuring;
 const box=$("detectionPanel");
 box.dataset.state=measuring?"waiting":"guided";
 if(measuring){
  updateDetected();
  const labels=s.id==="accel"?["X · m/s²","Y · m/s²","Z · m/s²"]:
    s.id==="gyro"?["α · °/s","β · °/s","γ · °/s"]:["PITCH · °","ROLL · °","YAW · °"];
  for(const [i,key] of ["X","Y","Z"].entries()){set("read"+key+"Label",labels[i]);set("read"+key,"—")}
  set("sensorStatus",feed.active?"Listening for real iPhone movement.":"Enable access so Safari can receive movement data.");
 }else{
  document.querySelector('[data-answer="PASS"]').disabled=false;
  const instruction={compass:"Open Compass. Turn your phone slowly.",
   haptics:"Try a normal haptic in iPhone Settings.",
   proximity:"During a call, bring the phone towards your ear."};
  const result={compass:["◎","Heading changes","The direction should move when you turn."],
   haptics:["◌","A gentle tap","You should feel a vibration or haptic tap."],
   proximity:["◉","Screen sleeps, then wakes","Dark near your ear; on again when moved away."]};
  set("guideActionLabel",instruction[s.id]);
  set("responseHeading","WHAT TO LOOK FOR");
  set("guidedOutcome",result[s.id][0]);
  set("detectionIcon","✓");
  set("detectionTitle",result[s.id][1]);
  set("detectionDetail",result[s.id][2]);
  set("sensorStatus","Customer-guided observation; no browser sensor data is claimed.");
 }
}
function advance(){if(index>=plan.steps.length-1)results();else {index++;renderStep()}}
function mark(status){
 const s=current();if(!s)return;
 if(status==="PASS"&&tracker&&!tracker.snapshot().complete)return;
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
 reportText=core.report(plan,answers,{...evidence,detected:detections},symptoms);
 set("copyReport","Copy technician report");set("shareReport","Share report");show("results");
}
function begin(){feed.reset();answers={};symptoms={};detections={};tracker=null;liveZBaseline=null;reportText="";index=0;
 plan=core.createPlan($("phoneModel").value,cat);renderStep()}
function exit(){feed.stop();tracker=null;show("setup")}
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