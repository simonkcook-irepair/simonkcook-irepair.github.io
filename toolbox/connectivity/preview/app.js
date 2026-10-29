/* iRepair Toolbox Connectivity — Safari adapter; no radio or GPS claims. */
(function(){"use strict";
const $=id=>document.getElementById(id),core=window.IRepairConnectivityCore,cat=window.IRepairDeviceCatalogue;
if(!core||!cat)throw Error("Connectivity components missing");
let plan=core.createPlan("",cat),index=0,answers={},observed={},evidence={},confirmed={},reportText="",activeRequest=0,abort=null;
const set=(id,t)=>{$(id).textContent=String(t)};
const current=()=>plan.steps[index];
function visible(name){
 document.querySelectorAll(".view").forEach(n=>n.classList.toggle("active",n.id===name));
 try{window.scrollTo({top:0,behavior:"instant"})}catch(e){}
}
function setupModels(){
 const sel=$("phoneModel"),years=[...new Set(cat.models.map(m=>m.year))].sort((a,b)=>b-a);
 for(const yr of years){
  const group=document.createElement("optgroup");group.label=String(yr);
  for(const m of cat.models.filter(x=>x.year===yr)){
   const opt=document.createElement("option");opt.value=m.slug;opt.textContent=m.name;group.append(opt);
  }sel.append(group);
 }
 const query=new URLSearchParams(location.search).get("model");
 if(query&&cat.getModel(query))sel.value=query;
 sel.addEventListener("change",()=>set("modelHelp",sel.value?
  (cat.getModel(sel.value)?.name||"Selected iPhone")+" (customer selected, not browser verified).":
  "Choosing a model adds detail to your report. Safari cannot confirm the exact model automatically."));
}
function progress(){
 const track=$("progress");track.replaceChildren();
 plan.steps.forEach((_,i)=>{
  const mark=document.createElement("i");mark.classList.toggle("on",i<=index);track.append(mark);
 });
 track.setAttribute("aria-label","Check "+(index+1)+" of "+plan.steps.length);
}
function markResponse(state,title,detail){
 $("connectStage").querySelector(".responsePane").dataset.state=state;
 set("liveBadge",state==="reached"?"✓":state==="failed"?"!":state==="testing"?"··":"◌");
 set("resultTitle",title);set("resultDetail",detail);
}
function allowPass(){
 const s=current();if(!s)return;
 const allowed=core.canConfirmPass(s,evidence,confirmed);
 const btn=document.querySelector('[data-answer="PASS"]');
 btn.disabled=!allowed;
 btn.textContent=allowed?"✓ Pass & Continue":"✓ Pass";
}
function closeRequest(){
 activeRequest++;
 if(abort){try{abort.abort()}catch(e){}}
 abort=null;
}
function renderStep(){
 closeRequest();
 const step=current();if(!step){results();return}
 progress();visible("test");
 $("symptomPanel").hidden=true;
 set("stepCounter","Check "+(index+1)+" of "+plan.steps.length);
 set("stepTitle",step.title);
 set("stepInstruction",step.instruction);
 set("stepEyebrow","A SIMPLE GUIDED CHECK");
 set("guideActionLabel",step.short);
 set("testQuestion",step.question);
 const stage=$("connectStage");stage.className="connectStage stage-"+step.id;
 const guided=step.mode==="guided";
 set("responseHeading",guided?"WHAT TO LOOK FOR":step.mode==="manual-probe"?"YOUR CONNECTION · CHECK":"YOUR IPHONE · LIVE");
 const outcome=step.mode==="guided"?
  {bluetooth:["Connect your accessory","The accessory should show Connected in Settings."],
   airdrop:["Send your photo","The other Apple device should receive the photo."]}[step.id]:
  ["Ready to check","Follow the instruction and tap the test button."];
 markResponse("waiting",outcome[0],outcome[1]);
 const stored=evidence[step.id];
 if(stored?.status==="reached")markResponse("reached","Connection responds","The test page was reached. The network type itself has not been verified.");
 if(stored?.status==="received")markResponse("reached","Location received","Safari returned a location estimate. This does not identify a GPS-only fix.");
 if(stored?.status==="failed")markResponse("failed","Check did not complete","A network, permission or service issue may be involved.");
 $("selectionPrompt").hidden=step.mode!=="manual-probe";
 if(step.id==="wifi")set("confirmLabel","I connected to Wi-Fi in Settings");
 if(step.id==="cellular")set("confirmLabel","I turned Wi-Fi off and enabled Mobile Data");
 $("routeConfirmed").checked=!!confirmed[step.id];
 $("routeConfirmed").disabled=step.mode!=="manual-probe";
 $("runTest").hidden=guided;
 $("runTest").disabled=false;
 set("runTest",step.mode==="location"?"Check location":"Check connection");
 $("testExplanation").hidden=guided;
 set("testExplanation",step.mode==="location"?
  "This checks for a location estimate, not the GPS chip alone. Your coordinates are not saved.":
  step.id==="cellular"?
  "A tiny same-site request checks internet access. Safari cannot confirm whether cellular carried it.":
  step.id==="wifi"?
  "A tiny same-site request checks internet access. Safari cannot identify the Wi-Fi radio or network.":
  "A tiny request checks this site's reachability. It is not a download-speed or hardware test.");
 $("technicalPanel").hidden=guided;$("technicalPanel").open=false;
 set("technicalReadings",core.evidenceLine(step,evidence));
 $("previous").disabled=index===0;
 allowPass();
}
function requestProof(){
 const s=current();if(!s)return;
 if(s.mode==="manual-probe"&&!confirmed[s.id]){
  markResponse("waiting","Confirm your connection","Tick the box above after changing your iPhone's network settings.");
  return;
 }
 closeRequest();
 const id=activeRequest,started=performance.now();
 let controller=typeof AbortController!=="undefined"?new AbortController():null;abort=controller;
 set("runTest","Checking…");$("runTest").disabled=true;
 markResponse("testing","Checking connection","Attempting a small request to this iRepair page.");
 const opts={cache:"no-store",credentials:"omit"};
 if(controller)opts.signal=controller.signal;
 const timeout=setTimeout(()=>{if(controller)controller.abort()},8000);
 fetch("./probe.txt?check="+Date.now(),opts)
 .then(async res=>{
  if(!res.ok)throw Error("HTTP "+res.status);
  const text=await res.text();
  if(text.trim()!=="IREPAIR_CONNECTIVITY_PROBE_V1")throw Error("Unexpected test response");
  return {elapsedMs:Math.max(0,Math.round(performance.now()-started))};
 }).then(out=>{
  if(id!==activeRequest)return;
  evidence[s.id]={status:"reached",elapsedMs:out.elapsedMs};
  markResponse("reached","Connection responds","The test page replied. You can record the result below.");
 }).catch(error=>{
  if(id!==activeRequest)return;
  evidence[s.id]={status:"failed"};
  markResponse("failed","Could not reach test page","This could be your connection, settings or the test site. Try again or choose Unable to Test.");
 }).finally(()=>{
  clearTimeout(timeout);
  if(id===activeRequest){
   $("runTest").disabled=false;set("runTest","Try connection again");
   set("technicalReadings",core.evidenceLine(s,evidence));allowPass();
  }
 });
}
function requestLocation(){
 const s=current();if(!s||s.id!=="location")return;
 closeRequest();
 const id=activeRequest;
 if(!navigator.geolocation?.getCurrentPosition){
  evidence.location={status:"failed"};
  markResponse("failed","Location unavailable","This browser does not offer a location service. You can choose Unable to Test.");
  set("technicalReadings",core.evidenceLine(s,evidence));allowPass();return;
 }
 set("runTest","Checking…");$("runTest").disabled=true;
 markResponse("testing","Finding a location","Allow location access when your iPhone asks.");
 // Coordinates stay inside the Geolocation callback; retain only the reported accuracy.
 navigator.geolocation.getCurrentPosition(position=>{
  if(id!==activeRequest)return;
  const value=Number(position?.coords?.accuracy);
  if(!Number.isFinite(value)||value<0){
   evidence.location={status:"failed"};
   markResponse("failed","No usable estimate","Safari did not provide valid accuracy information.");
  }else{
   evidence.location={status:"received",accuracy:value};
   markResponse("reached","Location received","Your iPhone returned an estimate. No exact coordinates are saved.");
  }
  $("runTest").disabled=false;set("runTest","Try location again");
  set("technicalReadings",core.evidenceLine(s,evidence));allowPass();
 },error=>{
  if(id!==activeRequest)return;
  evidence.location={status:"failed"};
  const detail=error?.code===1?"Location access was not permitted. You can choose Unable to Test.":
   error?.code===3?"The location request timed out. Try again outdoors or choose Unable to Test.":
   "A location could not be returned. This is not proof of a faulty GPS receiver.";
  markResponse("failed","Location not available",detail);
  $("runTest").disabled=false;set("runTest","Try location again");
  set("technicalReadings",core.evidenceLine(s,evidence));allowPass();
 },{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}
function advance(){if(index>=plan.steps.length-1)results();else{index++;renderStep()}}
function mark(value){
 const s=current();if(!s)return;
 if(value==="PASS"&&!core.canConfirmPass(s,evidence,confirmed))return;
 answers=core.setAnswer(answers,s.id,value);
 if(value==="FAIL"){
  const options=$("symptomOptions");options.replaceChildren();
  for(const text of core.symptoms[s.id]){
   const label=document.createElement("label");label.className="symptomOption";
   const check=document.createElement("input");check.type="checkbox";check.value=text;
   check.checked=observed[s.id]?.includes(text)||false;
   label.append(check,document.createTextNode(text));options.append(label);
  }$("symptomPanel").hidden=false;$("symptomContinue").focus();return;
 }
 delete observed[s.id];advance();
}
function resultRow(s){
 const outcome=answers[s.id]||"UNANSWERED",row=document.createElement("div");row.className="resultRow";
 const name=document.createElement("strong");name.className=outcome==="PASS"?"good":outcome==="FAIL"?"bad":"neutral";
 name.textContent=s.title+" — "+(outcome==="PASS"?"Pass":outcome==="FAIL"?"Fail":outcome==="UNABLE"?"Unable to Test":"Not completed");
 const detail=document.createElement("span");detail.textContent=core.evidenceLine(s,evidence);
 row.append(name,detail);
 if(outcome==="FAIL"&&observed[s.id]?.length){const extra=document.createElement("span");extra.textContent="Observed: "+observed[s.id].join("; ");row.append(extra)}
 $("resultRows").append(row);
}
function results(){
 closeRequest();
 const counts=core.tally(plan,answers);
 for(const key of ["PASS","FAIL","UNABLE"])set(key.toLowerCase()+"Count",counts[key]);
 set("resultIntro",plan.modelSlug?plan.modelName+" · your connection observations.":"Your connectivity observations · model not selected.");
 $("resultRows").replaceChildren();plan.steps.forEach(resultRow);
 const hints=core.interpret(plan,answers),box=$("triageHints"),rows=$("triageRows");
 rows.replaceChildren();box.hidden=hints.length===0;
 for(const hint of hints){
  const node=document.createElement("div");node.className="triageRow";
  const title=document.createElement("strong");title.textContent=hint.title;
  const detail=document.createElement("span");detail.textContent=hint.detail;
  node.append(title,detail);rows.append(node);
 }
 reportText=core.report(plan,answers,evidence,confirmed,observed);
 set("copyReport","Copy technician report");set("shareReport","Share report");visible("results");
}
function begin(){
 closeRequest();answers={};observed={};evidence={};confirmed={};reportText="";
 index=0;plan=core.createPlan($("phoneModel").value,cat);renderStep();
}
function exit(){closeRequest();visible("setup")}
async function copy(value){
 try{if(!navigator.clipboard?.writeText)throw Error("Clipboard API unavailable");
 await navigator.clipboard.writeText(value);return true;}
 catch(err){
  const field=document.createElement("textarea");field.value=value;
  field.style.cssText="position:fixed;left:-9999px;opacity:0";
  document.body.append(field);field.select();
  let ok=false;try{ok=document.execCommand("copy")}catch(e){}
  field.remove();
  if(!ok)window.prompt("Select and copy your report",value);
  return ok;
 }
}
$("begin").addEventListener("click",()=>visible("setup"));
$("setupBack").addEventListener("click",()=>visible("home"));
$("start").addEventListener("click",begin);
$("runTest").addEventListener("click",()=>{if(current()?.id==="location")requestLocation();else requestProof()});
$("routeConfirmed").addEventListener("change",()=>{
 const s=current();if(!s||s.mode!=="manual-probe")return;
 confirmed[s.id]=$("routeConfirmed").checked;
 // Changing the manually confirmed interface invalidates the previous reachability evidence.
 delete evidence[s.id];
 markResponse("waiting","Ready to check","Use the button below to check the selected connection.");
 set("technicalReadings",core.evidenceLine(s,evidence));
 allowPass();
});
$("symptomContinue").addEventListener("click",()=>{
 const s=current();if(!s||answers[s.id]!=="FAIL")return;
 observed[s.id]=Array.from($("symptomOptions").querySelectorAll("input:checked"),e=>e.value);
 advance();
});
document.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>mark(btn.dataset.answer)));
$("previous").addEventListener("click",()=>{if(index>0){index--;renderStep()}});
$("leave").addEventListener("click",exit);$("exitTest").addEventListener("click",exit);
$("copyReport").addEventListener("click",async()=>{if(reportText&&await copy(reportText))set("copyReport","Copied ✓")});
$("shareReport").addEventListener("click",async()=>{
 if(!reportText)return;
 if(navigator.share){try{await navigator.share({title:"iRepair Connectivity Report",text:reportText});return}catch(e){if(e.name==="AbortError")return}}
 if(await copy(reportText))set("shareReport","Copied for sharing ✓");
});
$("printReport").addEventListener("click",()=>window.print());
$("startOver").addEventListener("click",()=>{closeRequest();visible("setup")});
document.addEventListener("visibilitychange",()=>{if(document.hidden)closeRequest()});
window.addEventListener("pagehide",closeRequest);
setupModels();
})();