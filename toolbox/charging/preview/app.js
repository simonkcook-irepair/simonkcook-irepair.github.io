/* iRepair Charging Diagnostics v2 — guided customer observations only. */
(function(){"use strict";
const $=id=>document.getElementById(id),
 core=window.IRepairChargingCore,cat=window.IRepairDeviceCatalogue,artwork=window.IRepairChargingArt;
if(!core||!cat||!artwork)throw Error("iRepair Charging modules are missing");
let plan=core.makePlan("",cat),index=0,answers={},symptoms={},reportText="";
const set=(id,v)=>{$(id).textContent=String(v)};
const step=()=>plan.steps[index];
function visible(id){
 document.querySelectorAll(".view").forEach(n=>n.classList.toggle("active",n.id===id));
 try{window.scrollTo({top:0,behavior:"instant"})}catch(e){}
}
function models(){
 const sel=$("phoneModel"),years=[...new Set(cat.models.map(m=>m.year))].sort((a,b)=>b-a);
 for(const year of years){
  const group=document.createElement("optgroup");group.label=String(year);
  for(const m of cat.models.filter(x=>x.year===year)){
   const opt=document.createElement("option");opt.value=m.slug;opt.textContent=m.name;group.append(opt);
  }sel.append(group);
 }
 const requested=new URLSearchParams(location.search).get("model");
 if(requested&&cat.getModel(requested))sel.value=cat.getModel(requested).slug;
 function onSelect(){
  const picked=cat.getModel(sel.value),type=core.portType(picked);
  set("modelHelp",picked?picked.name+" selected for the report. This is not verified by Safari.":
   "Choosing a model helps identify its connector. Safari can't identify it reliably.");
  set("connectorSummary",picked?"Expected charging connector: "+type:"Charging connector depends on iPhone model");
 }
 sel.addEventListener("change",onSelect);onSelect();
}
function progress(){
 const el=$("progress");el.replaceChildren();
 plan.steps.forEach((_,i)=>{const part=document.createElement("i");part.classList.toggle("on",i<=index);el.append(part)});
 el.setAttribute("aria-label","Check "+(index+1)+" of "+plan.steps.length);
}
const perStage={
 safety:{icon:"!",heading:"Everything looks safe",outcome:"Check for damage, liquid, swelling or unusual heat.",action:"Inspect before plugging in",caution:"STOP if your phone, connector or lead is wet, hot or damaged. Do not connect power."},
 wired:{icon:"✓",heading:"Charging recognised",outcome:"Look for the normal charging indicator.",action:"Connect normally",caution:"If a liquid alert appears, disconnect immediately and stop."},
 stability:{icon:"✓",heading:"Connection stays steady",outcome:"Charging shouldn't require holding the lead at an angle or applying pressure.",action:"Watch an ordinary connection",caution:"Do not deliberately wiggle, bend, rock or force the connector to test it."},
 flip:{icon:"↻",heading:"Both sides behave alike",outcome:"Compare whether the phone recognises the plug in each orientation.",action:"Disconnect, turn 180°, reconnect",caution:"Turn the unplugged connector only. Never twist or turn it inside the port."},
 swap:{icon:"✓",heading:"The other charger works",outcome:"A known-good replacement cable or adapter should be recognised.",action:"Try another known-good lead",caution:"Use only clean, undamaged, compatible cables and power adapters."},
 port:{icon:"⌕",heading:"Contacts look intact",outcome:"Check both faces of the cable tip, and the port opening, for dirt or damage.",action:"Inspect disconnected contacts",caution:"Disconnect first. Do not insert tools, cotton buds or liquid into the port."},
 wireless:{icon:"◎",heading:"Wireless charging starts",outcome:"The iPhone displays its normal charging indication on a compatible pad.",action:"Use a compatible Qi pad",caution:"Without a compatible charger, choose Unable to Test."},
 behaviour:{icon:"✓",heading:"A normal charging pattern",outcome:"A charge limit or warmth may explain a pause in charging.",action:"Review battery settings",caution:"Stop charging if the phone is unusually hot, damaged or shows a liquid alert."}
};
function render(){
 const s=step();if(!s){results();return}
 progress();visible("test");$("symptomPanel").hidden=true;
 set("stepCounter","Check "+(index+1)+" of "+plan.steps.length);
 set("stepTitle",s.title);
 set("stepInstruction",s.guide);
 set("testQuestion",s.question);
 const art=perStage[s.id],stage=$("chargingStage");
 stage.className="chargeStage stage-"+s.id;
 $("guideArtwork").innerHTML=artwork.render(s.id,plan.connector);
 set("actionLabel",art.action);
 set("expectedIcon",art.icon);set("expectedTitle",art.heading);
 set("expectedDetail",art.outcome);
 set("chargeCaution",art.caution);
 set("technicalMethod",s.note+(s.id==="port"?
  " Expected model connector: "+plan.connector+".":""));
 $("technicalPanel").open=false;
 $("previous").disabled=index===0;
}
function advance(){
 if(index===0&&answers.safety!=="PASS"){results();return;}
 if(index===plan.steps.length-1){results();return}
 index++;render();
}
function mark(answer){
 const s=step();if(!s)return;
 answers=core.addAnswer(answers,s.id,answer);
 if(s.id==="safety"&&answer!=="PASS"){
  // A previously safe session cannot retain powered results after safety is revoked.
  for(const other of plan.steps.slice(1)){delete answers[other.id];delete symptoms[other.id]}
 }
 if(answer==="FAIL"){
  const group=$("symptomOptions");group.replaceChildren();
  for(const entry of core.symptomChoices[s.id]){
   const lab=document.createElement("label"),box=document.createElement("input");
   lab.className="symptomOption";box.type="checkbox";box.value=entry;
   box.checked=!!symptoms[s.id]?.includes(entry);
   lab.append(box,document.createTextNode(entry));group.append(lab);
  }
  $("symptomPanel").hidden=false;
  set("symptomContinue",s.id==="safety"?"Stop & View Safety Report →":"Continue →");
  $("symptomContinue").focus();return;
 }
 delete symptoms[s.id];advance();
}
function row(s){
 const answer=answers[s.id]||"UNANSWERED",line=document.createElement("div");line.className="resultRow";
 const title=document.createElement("strong"),info=document.createElement("span");
 title.className=answer==="PASS"?"good":answer==="FAIL"?"bad":"neutral";
 title.textContent=s.title+" — "+(answer==="PASS"?"Pass":answer==="FAIL"?"Fail":answer==="UNABLE"?"Unable to Test":"Not completed");
 info.textContent=s.note;line.append(title,info);
 if(answer==="FAIL"&&symptoms[s.id]?.length){
  const reasons=document.createElement("span");reasons.textContent="Reported: "+symptoms[s.id].join("; ");line.append(reasons);
 }
 $("resultRows").append(line);
}
function results(){
 const totals=core.tally(plan,answers);
 for(const status of ["PASS","FAIL","UNABLE"])set(status.toLowerCase()+"Count",totals[status]);
 set("resultIntro",plan.modelSlug?plan.modelName+" · "+plan.connector+" · customer observations.":
 "Customer-guided results · model not selected.");
 const safetyStopped=answers.safety==="FAIL"||answers.safety==="UNABLE";
 $("safetySummary").hidden=!safetyStopped;
 if(safetyStopped){
  const node=$("safetySummary").querySelector("strong");
  if(node)node.textContent=answers.safety==="FAIL"?"Stop using the charger for now":"Check safety before charging";
 }
 $("resultRows").replaceChildren();plan.steps.forEach(row);
 const hints=core.interpretations(answers,symptoms),area=$("triageHints"),list=$("triageRows");
 list.replaceChildren();area.hidden=hints.length===0;
 for(const h of hints){
  const item=document.createElement("div"),heading=document.createElement("strong"),detail=document.createElement("span");
  item.className="triageRow";heading.textContent=h.title;detail.textContent=h.detail;item.append(heading,detail);list.append(item);
 }
 reportText=core.report(plan,answers,symptoms);
 set("copyReport","Copy technician report");set("shareReport","Share report");visible("results");
}
function begin(){
 index=0;answers={};symptoms={};reportText="";
 plan=core.makePlan($("phoneModel").value,cat);
 render();
}
async function copy(value){
 try{if(!navigator.clipboard?.writeText)throw Error("clipboard unavailable");
  await navigator.clipboard.writeText(value);return true;
 }catch(e){
  const node=document.createElement("textarea");node.value=value;
  node.style.cssText="position:fixed;left:-9999px;opacity:0";
  document.body.append(node);node.select();let success=false;
  try{success=document.execCommand("copy")}catch(err){}
  node.remove();if(!success)window.prompt("Select and copy your report",value);return success;
 }
}
$("begin").addEventListener("click",()=>visible("setup"));
$("setupBack").addEventListener("click",()=>visible("home"));
$("start").addEventListener("click",begin);
$("exitTest").addEventListener("click",()=>visible("setup"));
$("leave").addEventListener("click",()=>visible("setup"));
$("previous").addEventListener("click",()=>{if(index>0){index--;render()}});
document.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>mark(btn.dataset.answer)));
$("symptomContinue").addEventListener("click",()=>{
 const s=step();if(!s||answers[s.id]!=="FAIL")return;
 symptoms[s.id]=Array.from($("symptomOptions").querySelectorAll("input:checked"),x=>x.value);
 advance();
});
$("startOver").addEventListener("click",()=>visible("setup"));
$("copyReport").addEventListener("click",async()=>{if(reportText&&await copy(reportText))set("copyReport","Copied ✓")});
$("shareReport").addEventListener("click",async()=>{
 if(!reportText)return;
 if(navigator.share){try{await navigator.share({title:"iRepair Charging Diagnostics",text:reportText});return}
 catch(e){if(e.name==="AbortError")return}}
 if(await copy(reportText))set("shareReport","Copied for sharing ✓");
});
$("printReport").addEventListener("click",()=>window.print());
models();
})();