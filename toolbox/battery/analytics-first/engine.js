(function(){
"use strict";
const $=id=>document.getElementById(id);
const MAX_FILE_SIZE=40*1024*1024;
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

/* Only use identifiers explicitly labelled as a device model in the
   analytics file. Never infer a customer model from the browser user agent.
   Mapping references: https://theapplewiki.com/wiki/Models/iPhone */
const MODEL_NAMES={
 "iPhone14,2":"iPhone 13 Pro","iPhone14,3":"iPhone 13 Pro Max",
 "iPhone14,4":"iPhone 13 mini","iPhone14,5":"iPhone 13",
 "iPhone15,2":"iPhone 14 Pro","iPhone15,3":"iPhone 14 Pro Max",
 "iPhone15,4":"iPhone 15","iPhone15,5":"iPhone 15 Plus",
 "iPhone16,1":"iPhone 15 Pro","iPhone16,2":"iPhone 15 Pro Max",
 "iPhone17,1":"iPhone 16 Pro","iPhone17,2":"iPhone 16 Pro Max",
 "iPhone17,3":"iPhone 16","iPhone17,4":"iPhone 16 Plus",
 "iPhone17,5":"iPhone 16e",
 "iPhone18,1":"iPhone 17 Pro","iPhone18,2":"iPhone 17 Pro Max",
 "iPhone18,3":"iPhone 17","iPhone18,4":"iPhone Air",
 "iPhone18,5":"iPhone 17e",
 "iPhone19,2":"iPhone 18 Pro","iPhone19,3":"iPhone 18 Pro Max",
 "iPhone19,4":"iPhone Duo","iPhone19,7":"iPhone 18 Pro Max"
};
function findDeviceModel(text){
 const re=/(?:^|[\s,{;])["']?(?:productType|product_type|_productModel|productModel|deviceModel|device_model|modelIdentifier|model_identifier|hardwareModel|model)["']?\s*[:=]\s*["']?(iPhone\d{1,2},\d{1,2})(?=["',}\s]|$)/gim;
 const values=new Set();let m;
 while((m=re.exec(text))!==null){
  values.add(m[1].replace(/^iphone/i,"iPhone"));
  if(values.size>8)break;
 }
 if(values.size===1){
  const id=values.values().next().value;
  return {code:id,name:MODEL_NAMES[id]||null,ambiguous:false,found:true};
 }
 return {code:null,name:null,ambiguous:values.size>1,found:values.size>0};
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
 const model=findDeviceModel(text);
 return {cycles,health,model,found:cycles.seen>0||health.seen>0,conflict:cycles.ambiguous||health.ambiguous};
}
function deviceModelText(model){
 if(!model||!model.found)return "Not identified in this file";
 if(model.ambiguous)return "Several different model identifiers found";
 return model.name?model.name+" ("+model.code+")":model.code+" (model identifier; exact name unverified)";
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
  items.push("iPhone model: "+deviceModelText(info.data.model));
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
  rows.append(metricRow("iPhone model",deviceModelText(info.data.model)));
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
function readFileText(file){
 return new Promise((resolve,reject)=>{
  if(typeof FileReader==="undefined"){
   if(typeof file.text==="function")file.text().then(resolve,reject);
   else reject(new Error("This browser cannot read selected files."));
   return;
  }
  const reader=new FileReader();
  reader.onload=()=>resolve(typeof reader.result==="string"?reader.result:"");
  reader.onerror=()=>{
   if(typeof file.text==="function")file.text().then(resolve,reject);
   else reject(reader.error||new Error("File reading failed"));
  };
  reader.onabort=()=>reject(new Error("File reading cancelled"));
  try{reader.readAsText(file)}catch(err){
   if(typeof file.text==="function")file.text().then(resolve,reject);
   else reject(err);
  }
 });
}
async function importFile(file){
 if(!file){
  reportError("No file was returned. Try again, or use the pasted-text option under Help.","upload");
  return;
 }
 // Files on iOS may supply Analytics-*.ips.ca.synced or an extensionless
 // copy. Reject obvious non-text media, but inspect other filenames by
 // content rather than relying on file-extension filtering.
 if(/\.(pdf|jpe?g|png|heic|heif|mp4|mov|zip|docx?|xlsx?|pages|numbers)$/i.test(file.name)){
  reportError("That is not an analytics text file. Choose an Analytics- file, often ending .ips.ca.synced.","upload");
  return;
 }
 if(file.size>MAX_FILE_SIZE){
  reportError("This file is over 40 MB and cannot be checked here. Choose a smaller Analytics- file.","upload");
  return;
 }
 if(!file.size){
  reportError("The selected file is empty. Choose another Analytics- file.","upload");
  return;
 }
 const visibleName=file.name.length>58?file.name.slice(0,52)+"…":file.name;
 $("uploadStatus").textContent="Selected "+visibleName+". Reading on your iPhone…";
 // Give iPhone Safari a chance to paint progress before analysing the file.
 await new Promise(done=>setTimeout(done,35));
 try{
  const content=await readFileText(file);
  if(!content||!content.trim()){
   reportError("The selected file had no readable analytics text. Choose another file.","upload");
   return;
  }
  const info=scanText(content);
  if(!info){
   reportError("We could not read battery information from that file. Choose another recent Analytics- file.","upload");
   return;
  }
  renderResult(info);
 }catch(e){
  reportError("The file was selected but Safari couldn't read it. Save it to On My iPhone in Files, then try again, or use Paste under Help.","upload");
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
const fileInput=$("analyticsFile");
let lastSelectedFile=null;
fileInput.addEventListener("click",()=>{
 // Reset for a repeated selection of the SAME .ips file; Safari may not
 // dispatch change unless the previous input value is cleared.
 fileInput.value="";
 lastSelectedFile=null;
 $("uploadStatus").textContent="Choose an Analytics- file in Files. The check will start when you select it.";
});
function fileChosen(){
 const file=fileInput.files&&fileInput.files[0];
 if(!file)return;
 if(file===lastSelectedFile)return; // input + change may both fire
 lastSelectedFile=file;
 $("uploadStatus").textContent="File selected. Preparing analysis…";
 void importFile(file);
}
fileInput.addEventListener("change",fileChosen);
fileInput.addEventListener("input",fileChosen);
fileInput.addEventListener("cancel",()=>{
 if(!lastSelectedFile)$("uploadStatus").textContent="No file was returned from Files. Try again or choose Paste under the help instructions.";
});
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