/* iRepair Charging Diagnostics v1 — guided customer observations only. */
(function(){"use strict";
const $=id=>document.getElementById(id),
 core=window.IRepairChargingCore,cat=window.IRepairDeviceCatalogue;
if(!core||!cat)throw Error("iRepair Charging modules are missing");
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
 safety:{icon:"✓",art:"!",heading:"No visible danger",outcome:"The cable, plug and phone look safe and dry.",action:"Check for damage first",caution:"If anything is wet, swollen, damaged or unusually hot, stop. Do not connect the charger."},
 wired:{icon:"⚡",art:"⚡",heading:"Charging appears",outcome:"Look for the charging indicator on your iPhone.",action:"Connect a wall charger",caution:"Do not force the plug. If a liquid alert appears, disconnect it and stop."},
 swap:{icon:"↺",art:"↺",heading:"Alternative works",outcome:"Notice whether the other cable and plug are recognised.",action:"Swap the cable and plug",caution:"Only use undamaged, suitable accessories that are known to work."},
 port:{icon:"◉",art:"⌕",heading:"Normal connector fit",outcome:"The plug should seat normally without excessive force or looseness.",action:"Look at the port gently",caution:"Do not push metal tools, cotton buds or liquid into the port."},
 wireless:{icon:"◎",art:"◎",heading:"Wireless power appears",outcome:"Look for the usual wireless charging indication.",action:"Place on the charging pad",caution:"You can choose Unable to Test if you don't have a compatible Qi charger."},
 behaviour:{icon:"⚡",art:"⚡",heading:"No unexplained warning",outcome:"Charging behaves normally, or a charge limit explains a pause.",action:"Check Battery settings",caution:"Optimised charging, charge limits and temperature can pause or slow charging."}
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
 set("artIcon",art.art);set("actionLabel",art.action);
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
 const hints=core.interpretations(answers),area=$("triageHints"),list=$("triageRows");
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