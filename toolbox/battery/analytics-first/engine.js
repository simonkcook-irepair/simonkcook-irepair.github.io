(function(){
"use strict";
const $=id=>document.getElementById(id);
const MAX_FILE_SIZE=20*1024*1024;
let lastReport="";
let lastResult=null;
function show(page){
 for(const card of document.querySelectorAll(".view"))card.classList.toggle("active",card.id===page);
 if(typeof scrollTo==="function")scrollTo({top:0,behavior:"instant"});
}
function escapeHTML(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function findMetric(input,names,min,max){
 const rx=new RegExp(String.raw`(?:^|[\s,{;])["']?(${names.join("|")})["']?\s*[:=]\s*["']?(\d{1,6})(?=["',}\s]|$)`,"gi");
 const values=[];let m;
 while((m=rx.exec(input))!==null){
  const n=Number(m[2]);
  if(Number.isInteger(n)&&n>=min&&n<=max)values.push({name:m[1],value:n});
  if(values.length>=500)break;
 }
 const unique=[...new Set(values.map(v=>v.value))];
 return {value:unique.length===1?unique[0]:null,ambiguous:unique.length>1,seen:values.length,keys:[...new Set(values.map(v=>v.name))].slice(0,6)};
}
function parseAnalytics(text){
 const cycles=findMetric(text,[
  "last_value_CycleCount","BatteryCycleCount","battery_cycle_count",
  "cycle_count","cycleCount","CycleCount"
 ],0,50000);
 const health=findMetric(text,[
  "last_value_MaximumCapacityPercent","BatteryMaximumCapacityPercent",
  "MaximumCapacityPercent","battery_maximum_capacity_percent",
  "maximum_capacity_percent"
 ],1,100);
 return {cycles,health,found:cycles.seen>0||health.seen>0,conflict:cycles.ambiguous||health.ambiguous};
}
function sourceText(metric,suffix){
 if(metric.ambiguous)return "Conflicting readings";
 if(metric.value===null)return "Not available";
 return metric.value+suffix;
}
function makeReport(info){
 const items=[
  "iREPAIR TOOLBOX — BATTERY DIAGNOSTICS",
  "Date: "+new Date().toLocaleString("en-GB"),
  "Method: "+(info.source==="analytics"?"Local analysis of user-selected iOS analytics text":"Guided observation from iPhone Settings"),
  "Assessment: "+info.title
 ];
 if(info.source==="analytics"){
  items.push("Maximum capacity: "+sourceText(info.data.health,"% (unverified analytics field)"));
  items.push("Cycle count: "+sourceText(info.data.cycles," (unverified analytics field)"));
  items.push("Conflicting metric values: "+(info.data.conflict?"Yes":"No"));
  items.push("Analytics recognised: "+(info.data.found?"At least one supported field":"No supported battery fields"));
 }else{
  items.push("Battery Health message: "+info.guided);
 }
 items.push("",
  "Interpretation: "+info.explanation,
  "Limits: iPhone Safari cannot independently access battery health, charging current or temperature. Analytics values are extracted from an unverified, user-selected file and may be incomplete or stale. Unsupplied or conflicting data does not confirm a hardware fault. No physical electrical measurements were performed.");
 return items.join("\n");
}
function metricRow(label,value){
 const div=document.createElement("div");div.className="reportRow";
 const left=document.createElement("span");left.textContent=label;
 const right=document.createElement("b");right.className="neutral";right.textContent=value;
 div.append(left,right);return div;
}
function resultForAnalytics(data){
 if(!data.found)return {source:"analytics",data,title:"No battery readings found",label:"UNABLE TO TEST",kind:"neutral",
  subtitle:"This file didn’t contain fields we can reliably recognise.",
  explanation:"No recognised battery health percentage or cycle count was found. That is not a fault. Try another recent Analytics- file, or use the quick guided check in Battery Health."};
 if(data.conflict)return {source:"analytics",data,title:"Battery data needs review",label:"INCONCLUSIVE",kind:"attention",
  subtitle:"The file includes different values for the same battery metric.",
  explanation:"Some extracted fields disagree, possibly because the file contains older records or multiple batteries. We haven't chosen an arbitrary value. Check iOS Battery Health or use a more recent analytics file."};
 if(data.health.value!==null&&data.health.value<=80)return {source:"analytics",data,title:"Battery wear worth checking",label:"REVIEW ADVISED",kind:"attention",
  subtitle:"A maximum-capacity percentage at or below 80% was found.",
  explanation:"The value in this file suggests battery wear. Confirm the current figure in Settings before considering battery service or replacement. This isn't an independent hardware test."};
 return {source:"analytics",data,title:"Battery information found",label:"DATA EXTRACTED",kind:"normal",
  subtitle:"We've pulled out the battery readings available in this file.",
  explanation:"These are the reported values present in the imported analytics text. They may be old or incomplete. No hardware fault has been proven; check Settings if you need to verify the current battery condition."};
}
function resultForGuided(status){
 if(status==="SERVICE")return {source:"guided",guided:"Service recommended (user-observed)",title:"Battery service advised",label:"REVIEW ADVISED",kind:"attention",
  subtitle:"Your iPhone is showing a battery service message.",
  explanation:"iOS is recommending battery service. Ask a qualified technician to assess battery health and discuss replacement if appropriate."};
 if(status==="NORMAL")return {source:"guided",guided:"No service warning reported",title:"No service warning reported",label:"GUIDED CHECK",kind:"normal",
  subtitle:"You haven't reported a battery service warning.",
  explanation:"A normal Battery Health screen is reassuring, but it cannot rule out intermittent charging problems or other faults. This guided check does not independently test battery hardware."};
 return {source:"guided",guided:"Unable to find Battery Health",title:"Battery status unavailable",label:"UNABLE TO TEST",kind:"neutral",
  subtitle:"That's fine — you don't need to guess.",
  explanation:"No battery-health reading was available. Try Settings → Battery → Battery Health, or choose a recent analytics file. Missing data isn't evidence of a faulty battery."};
}
function renderResult(info){
 lastResult=info;
 $("resultLabel").textContent=info.label;
 $("resultTitle").textContent=info.title;
 $("resultSubtitle").textContent=info.subtitle;
 $("resultBox").className="resultSummary"+(info.kind==="attention"?" attention":info.kind==="safety"?" safety":"");
 const rows=$("reportRows");rows.replaceChildren();
 if(info.source==="analytics"){
  rows.append(metricRow("Maximum capacity",sourceText(info.data.health,"%")));
  rows.append(metricRow("Charge cycles",sourceText(info.data.cycles,"")));
  rows.append(metricRow("Source","Imported analytics file"));
 }else{
  rows.append(metricRow("iOS Battery Health",info.guided.replace(" (user-observed)","")));
  rows.append(metricRow("Source","Your answer in Settings"));
 }
 $("resultExplanation").replaceChildren();
 const strong=document.createElement("b");strong.textContent="What this means";
 const description=document.createElement("p");description.textContent=info.explanation;description.style.margin="6px 0 0";
 $("resultExplanation").append(strong,description);
 $("copyReport").textContent="Copy diagnostic report";
 lastReport=makeReport(info);
 show("results");
}
function reportError(message,source){
 const target=$(source==="paste"?"pasteStatus":"uploadStatus");
 target.textContent=message;
}
function scanText(text){
 if(!text.trim()){return null;}
 return resultForAnalytics(parseAnalytics(text));
}
async function importFile(file){
 $("uploadStatus").textContent="";
 if(!file)return;
 if(!/\.(ips|json|log|txt)$/i.test(file.name)){
  reportError("Please select an .ips, .json, .log or .txt analytics file.","upload");return;
 }
 if(file.size>MAX_FILE_SIZE){
  reportError("That file is too large. Please choose one under 20 MB.","upload");return;
 }
 if(!file.size){reportError("That file is empty. Please choose another.","upload");return;}
 $("uploadStatus").textContent="Reading this file on your device…";
 try{
  const content=await file.text();
  const info=scanText(content);
  if(!info){reportError("The file did not contain readable text. Please choose another.","upload");return;}
  renderResult(info);
 }catch(e){
  reportError("Unable to read that file. Please try another analytics file.","upload");
 }
}
function resetToUpload(){
 $("analyticsFile").value="";
 $("pasteInput").value="";
 $("pasteStatus").textContent="";
 $("uploadStatus").textContent="";
 show("upload");
}
$("begin").addEventListener("click",resetToUpload);
$("analyticsFile").addEventListener("change",e=>importFile(e.target.files&&e.target.files[0]));
$("parsePasted").addEventListener("click",()=>{
 const text=$("pasteInput").value;
 if(!text.trim()){reportError("Paste the copied analytics text first.","paste");return;}
 if(text.length>MAX_FILE_SIZE){reportError("The pasted text is too long. Select a file instead.","paste");return;}
 $("pasteStatus").textContent="";
 renderResult(resultForAnalytics(parseAnalytics(text)));
});
$("homeFromUpload").addEventListener("click",()=>show("home"));
$("noFile").addEventListener("click",()=>show("guided"));
$("backToUpload").addEventListener("click",resetToUpload);
for(const btn of document.querySelectorAll("[data-guided]")){
 btn.addEventListener("click",()=>renderResult(resultForGuided(btn.dataset.guided)));
}
$("anotherFile").addEventListener("click",resetToUpload);
$("restart").addEventListener("click",()=>show("home"));
$("copyReport").addEventListener("click",async()=>{
 if(!lastReport)return;
 try{
  if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(lastReport);
  $("copyReport").textContent="Report copied ✓";
 }catch(e){
  const el=document.createElement("textarea");
  el.value=lastReport;el.style.cssText="position:fixed;left:-5000px;opacity:0";
  document.body.append(el);el.select();
  let done=false;try{done=document.execCommand("copy");}catch(_){}
  el.remove();
  if(done)$("copyReport").textContent="Report copied ✓";
  else prompt("Copy your report:",lastReport);
 }
});
})();