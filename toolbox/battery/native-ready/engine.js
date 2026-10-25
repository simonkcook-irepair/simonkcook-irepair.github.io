/* iRepair Battery Native-Ready Preview — browser UI and future WKWebView adapter.
   No fake device readings. The consumer supplies at most two Settings details. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const Core=window.iRepairBatteryCore;
if(!Core)throw new Error("Battery inference core failed to load");
const MAX_FILE_SIZE=40*1024*1024;
const state={analytics:null,native:null,capacity:null,capacitySource:null,status:"unknown",lastReport:"",lastResult:null,summary:"",selected:null};
function show(name){
 document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name));
 window.scrollTo({top:0,behavior:"instant"});
}
function statusText(message){
 $("uploadStatus").textContent=message;
}
function setPills(root,values){
 root.replaceChildren();
 for(const text of values){
  const span=document.createElement("span");span.textContent=text;root.append(span);
 }
}
function nativeDisplay(){
 const snap=Core.nativeSnapshot(state.native);
 if(!snap){setPills($("deviceMeta"),["Browser preview","Native device readings unavailable"]);return;}
 const labels=[];
 if(snap.model)labels.push(Core.modelLabel(snap.model));
 if(snap.iosVersion)labels.push("iOS "+snap.iosVersion);
 if(snap.chargePercent!==null)labels.push("Charge "+snap.chargePercent+"%");
 if(snap.chargingState!=="unknown")labels.push("Power "+snap.chargingState);
 setPills($("deviceMeta"),labels.length?labels:["Native iOS","No device readings available"]);
}
async function requestNativeSnapshot(){
 // WKScriptMessageHandlerWithReply returns a Promise on supported WKWebView.
 // A plain Safari website never receives this bridge; we do not simulate it.
 const handler=window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.iRepairDevice;
 if(!handler||typeof handler.postMessage!=="function"){nativeDisplay();return;}
 try{
  const reply=handler.postMessage({action:"getSnapshot",schema:1});
  if(reply&&typeof reply.then==="function"){
   const payload=await reply;
   const parsed=typeof payload==="string"?JSON.parse(payload):payload;
   state.native=Core.nativeSnapshot(parsed)?parsed:null; // retain verified raw modelIdentifier for evaluation
  }
 }catch(e){state.native=null;}
 nativeDisplay();
}
function renderFileFound(){
 const data=state.analytics;
 const container=$("foundFromFile");
 if(!data){container.hidden=true;return;}
 const cycles=data.cycles&&!data.cycles.conflict?data.cycles.value:null;
 const health=data.health&&!data.health.conflict?data.health.value:null;
 container.hidden=false;
 if(health!==null){
  container.textContent="From your analytics file: "+health+"% maximum capacity"+(cycles!==null?" · "+cycles+" cycles":"")+". Please check the current value in Settings; analytics may be older.";
 }else if(cycles!==null){
  container.textContent="We found "+cycles+" battery cycles in your file. Battery Health percentage is missing, so you can complete the check in Settings.";
 }else if(data.anyFound){
  container.textContent="Some battery counters were found, but no verified health percentage. Check Settings if possible.";
 }else{
  container.textContent="No recognised battery readings were found. That's okay—Settings may have the information.";
 }
}
function openHealth(){
 renderFileFound();
 const imported=state.analytics?.health;
 const cap=imported&&!imported.conflict?imported.value:null;
 if(state.capacity===null && Number.isInteger(cap)&&cap>=1&&cap<=100){
  state.capacity=cap;state.capacitySource="analytic-prefill";
  $("healthPercent").value=String(cap);
  $("percentHint").textContent="Prefilled from analytics (unverified). Check against the current value in iOS Settings.";
 }else if(state.capacity===null){
  $("healthPercent").value="";
  $("percentHint").textContent="Type the maximum-capacity percentage shown by iOS. Leave blank if unavailable.";
 }
 renderStatusButtons();
 $("healthError").textContent="";
 show("health");
}
function renderStatusButtons(){
 document.querySelectorAll("#batteryStatus [data-status]").forEach(btn=>{
  btn.setAttribute("aria-pressed",String(btn.dataset.status===state.status));
 });
}
function readHealth(){
 const input=$("healthPercent");
 const raw=input.value.trim();
 if(raw){
  const n=Number(raw);
  if(!Number.isInteger(n)||n<1||n>100){
   $("healthError").textContent="Enter a whole percentage between 1 and 100, or leave it blank if unavailable.";
   input.focus();return false;
  }
  if(state.capacity!==n){state.capacitySource="manual";}
  state.capacity=n;
 }else{state.capacity=null;state.capacitySource=null;}
 $("healthError").textContent="";
 return true;
}
function rows(label,value){
 const row=document.createElement("div");row.className="reportRow";
 const left=document.createElement("span"),right=document.createElement("b");right.className="neutral";
 left.textContent=label;right.textContent=value;
 row.append(left,right);return row;
}
function renderTech(data){
 const group=$("technicalDetails"),container=$("technicalReadings");container.replaceChildren();
 if(!data){group.hidden=true;state.summary="";return;}
 group.hidden=false;group.open=false;
 state.summary=Core.fieldSummary(data);
 if(data.raw.length){
  for(const entry of data.raw){
   const row=document.createElement("div");row.className="technicalMetric";
   const name=document.createElement("span"),value=document.createElement("b");
   name.textContent=entry.label;value.textContent=Core.rawLabel(entry);
   row.append(name,value);container.append(row);
  }
 }else{
  const msg=document.createElement("p");msg.className="fieldHint";msg.textContent="No additional supported telemetry in this file.";container.append(msg);
 }
 const count=document.createElement("p");count.className="fieldHint";
 count.textContent=data.keyNames.length+" battery-related field names identified. The safe summary includes names only.";
 container.append(count);
 $("copyFieldSummary").textContent="Copy battery field summary";
}
function updateResults(){
 const info=Core.assess({analytics:state.analytics,native:state.native,capacity:state.capacity,
  capacitySource:state.capacitySource,serviceStatus:state.status});
 state.lastResult=info;
 state.lastReport=Core.report(info);
 const label={incomplete:"INCOMPLETE",partial:"PARTIAL INFORMATION",review:"REVIEW ADVISED",service:"SERVICE RECOMMENDED",reported:"GUIDED REVIEW"}[info.level]||"BATTERY REVIEW";
 $("resultLabel").textContent=label;
 $("resultTitle").textContent=info.title;
 $("resultSubtitle").textContent=info.summary;
 $("resultBox").className="resultSummary"+(["service","review"].includes(info.level)?" attention":"");
 const tags=[];
 tags.push(info.native?"Native data available":"Browser guided");
 if(info.analytics)tags.push("Analytics imported");
 if(info.capacitySource)tags.push("Capacity recorded");
 setPills($("resultTags"),tags);
 const listing=$("reportRows");listing.replaceChildren();
 listing.append(rows("iPhone model",Core.modelLabel(info.model)));
 if(info.native?.iosVersion)listing.append(rows("iOS version",info.native.iosVersion));
 if(info.native?.chargePercent!==null&&info.native?.chargePercent!==undefined)listing.append(rows("Current charge",info.native.chargePercent+"% · native reading"));
 if(info.native?.chargingState&&info.native.chargingState!=="unknown")listing.append(rows("Charging state",info.native.chargingState));
 listing.append(rows("Maximum capacity",info.capacity===null?"Not available":info.capacity+"%"));
 listing.append(rows("Capacity source",info.capacitySource||"Not supplied"));
 listing.append(rows("Battery Health status",({normal:"No service warning",service:"Service recommended",unknown:"Unable to check"})[info.status]));
 listing.append(rows("Charge cycles",info.cycles===null?"Not available":info.cycles+" · analytics"));
 if(info.rawCount)listing.append(rows("Extra battery data",info.rawCount+" raw fields"));
 if(info.mismatch)listing.append(rows("Analytics conflict","Settings value differs"));
 const explanation=$("resultExplanation");
 explanation.replaceChildren();
 const bold=document.createElement("b");bold.textContent="What this means";
 const p=document.createElement("p");p.style.margin="6px 0 0";p.textContent=info.explanation;
 explanation.append(bold,p);
 renderTech(info.analytics);
 $("copyReport").textContent="Copy Report";
 $("missingDataCTA").hidden=!info.needsSettings;
 show("results");
}
async function copy(text){
 try{if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");await navigator.clipboard.writeText(text);return true;}
 catch(e){
  const area=document.createElement("textarea");area.value=text;area.style.cssText="position:fixed;opacity:0;left:-9000px";
  document.body.append(area);area.select();let ok=false;
  try{ok=document.execCommand("copy");}catch(_){}area.remove();
  if(!ok)window.prompt("Copy the report:",text);
  return ok;
 }
}
function setFileStatus(text){$("uploadStatus").textContent=text;}
function readFileAsText(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(typeof reader.result==="string"?reader.result:"");
  reader.onerror=()=>reject(reader.error||Error("Unable to read"));
  reader.onabort=()=>reject(Error("File read cancelled"));
  try{reader.readAsText(file);}catch(e){reject(e);}
 });
}
async function importText(text){
 if(!text?.trim())throw Error("The selected file contains no readable analytics text.");
 const data=Core.parseAnalytics(text);
 // The raw text is deliberately not kept after this call; no log is uploaded.
 state.analytics=data;
 state.capacity=null;state.capacitySource=null;
 $("healthPercent").value="";$("percentHint").textContent="Enter the percentage in iOS Settings, if shown.";
 state.status="unknown";
 openHealth();
}
async function importFile(file){
 if(!file){setFileStatus("No file selected. You can continue without one.");return;}
 if(/\.(pdf|jpe?g|png|heic|mov|mp4|zip|docx?|xlsx?)$/i.test(file.name)){
  setFileStatus("Choose a text analytics file, usually Analytics-…ips or .ips.ca.synced.");return;
 }
 if(file.size===0){setFileStatus("That file is empty. Try another.");return;}
 if(file.size>MAX_FILE_SIZE){setFileStatus("That file is over 40 MB. Choose a smaller Analytics- file.");return;}
 setFileStatus("Selected "+file.name.slice(0,55)+". Reading privately on your iPhone…");
 await new Promise(r=>setTimeout(r,30));
 try{await importText(await readFileAsText(file));}
 catch(e){setFileStatus("Safari couldn't interpret that file. Try a recent Analytics- file or continue without one.");}
}
function reset(){
 state.analytics=null;state.capacity=null;state.capacitySource=null;state.status="unknown";
 state.lastReport="";state.lastResult=null;state.summary="";
 $("analyticsFile").value="";$("pasteInput").value="";$("uploadStatus").textContent="";
 $("pasteStatus").textContent="";$("healthPercent").value="";
 $("percentHint").textContent="Enter the percentage in iOS Settings, if shown.";
 renderStatusButtons();nativeDisplay();
 show("home");
}
$("begin").addEventListener("click",()=>{nativeDisplay();show("upload");});
$("noFile").addEventListener("click",()=>{state.analytics=null;state.capacity=null;state.capacitySource=null;state.status="unknown";openHealth();});
$("homeFromUpload").addEventListener("click",()=>show("home"));
$("healthBack").addEventListener("click",()=>show("upload"));
$("finishCheck").addEventListener("click",()=>{if(readHealth())updateResults();});
$("healthPercent").addEventListener("input",()=>{
 state.capacitySource="manual";$("healthError").textContent="";
 $("percentHint").textContent="From Battery Health in iOS Settings.";
});
document.querySelectorAll("#batteryStatus [data-status]").forEach(btn=>{
 btn.addEventListener("click",()=>{state.status=btn.dataset.status;renderStatusButtons();});
});
const fileInput=$("analyticsFile");let selected=null;
fileInput.addEventListener("click",()=>{
 fileInput.value="";selected=null;setFileStatus("Choose an Analytics- file from Files…");
});
function selectedFile(){
 const f=fileInput.files?.[0];if(!f||f===selected)return;
 selected=f;void importFile(f);
}
fileInput.addEventListener("change",selectedFile);
fileInput.addEventListener("input",selectedFile);
fileInput.addEventListener("cancel",()=>setFileStatus("No file returned. You can try again or continue without one."));
$("parsePasted").addEventListener("click",()=>{
 const text=$("pasteInput").value;
 if(!text.trim()){$("pasteStatus").textContent="Paste analytics text first.";return;}
 if(text.length>MAX_FILE_SIZE){$("pasteStatus").textContent="Text too large. Choose a smaller file.";return;}
 try{void importText(text)}catch(e){$("pasteStatus").textContent="Could not read pasted analytics text.";}
});
$("missingDataCTA").addEventListener("click",openHealth);
$("copyReport").addEventListener("click",async()=>{if(await copy(state.lastReport))$("copyReport").textContent="Copied ✓";});
$("copyFieldSummary").addEventListener("click",async()=>{if(await copy(state.summary))$("copyFieldSummary").textContent="Copied ✓";});
$("shareReport").addEventListener("click",async()=>{
 if(navigator.share){try{await navigator.share({title:"iRepair Battery Diagnostics",text:state.lastReport});return;}catch(e){if(e.name==="AbortError")return;}}
 if(await copy(state.lastReport))$("shareReport").textContent="Copied to share ✓";
});
$("printReport").addEventListener("click",()=>window.print());
$("restart").addEventListener("click",reset);
void requestNativeSnapshot();
})();
