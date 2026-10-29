/* iRepair Panic Diagnostics browser adapter.
   User-selected data is parsed locally and discarded after creating a small
   structured result. No telemetry, storage, uploads or automatic iOS log access.
*/
(function(){
"use strict";
const $=id=>document.getElementById(id);
const core=window.iRepairPanicCore;
const catalogue=window.IRepairDeviceCatalogue;
const references=window.iRepairPanicReferences;
if(!core||!catalogue)throw new Error("Panic reader or model catalogue did not load");
const MAX_SIZE=30*1024*1024;
let result=null,report="",manualSlug="",userSelectedModel=false,selectedFile=null;
let reviewedLibrary=null,referenceCheck=null,referenceController=null,referenceRequestId=0,referenceState="checking";
/* App starts immediately with its built-in conservative rules. Each launch
   performs an actual network check against the separately updated curated
   reference library; there is no live scraping or access to user logs. */
function referenceStatus(mode,message){
 referenceState=mode;
 const bar=$("referenceStatusBar");
 bar.dataset.mode=mode;
 $("referenceStatusText").textContent=message;
 const retry=$("referenceRetry");
 retry.hidden=mode!=="offline"; // show Retry only when the network update failed
 retry.textContent=mode==="offline"?"Retry":"Refresh";
}
async function checkForReviewedReferences(){
 const requestId=++referenceRequestId;
 if(referenceController)referenceController.abort();
 referenceController=new AbortController();
 const controller=referenceController;
 referenceStatus("checking","Checking for reviewed panic-reference updates…");
 let timer;
 try{
  if(!references)throw new Error("Reference module unavailable");
  timer=setTimeout(()=>controller.abort(),5500);
  const response=await fetch(references.endpoint+"?checked="+Date.now(),{
    method:"GET",cache:"no-store",mode:"cors",credentials:"omit",
    redirect:"error",signal:controller.signal
  });
  if(!response.ok)throw new Error("Reference feed unavailable");
  const data=await response.text();
  if(data.length>120000)throw new Error("Reference feed too large");
  const library=references.validate(JSON.parse(data));
  if(requestId!==referenceRequestId)return;
  reviewedLibrary=library;
  const older=library.ageDays>60;
  $("referenceStatusBar").title="Curated library v"+library.version;
  referenceStatus(older?"older":"fresh",
    "References checked · reviewed "+references.date(library)+
    (older?" (older review)":""));
 }catch(error){
  if(requestId!==referenceRequestId)return;
  reviewedLibrary=null;
  referenceStatus("offline","Update unavailable · using built-in panic references");
 }finally{
  if(timer)clearTimeout(timer);
  if(requestId===referenceRequestId)referenceController=null;
 }
}
function beginReferenceCheck(){
 referenceCheck=checkForReviewedReferences();
 return referenceCheck;
}
async function ensureReferenceChecked(){
 if(referenceState!=="checking"||!referenceCheck)return;
 // Import need not block for an unreliable network. If the check exceeds
 // the short grace period, this particular result honestly uses built-in rules.
 await Promise.race([referenceCheck,new Promise(resolve=>setTimeout(resolve,1800))]);
}
function show(name){
 document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===name));
 try{window.scrollTo({top:0,behavior:"instant"});}catch(e){}
}
function safeText(el,value){el.textContent=String(value??"");}
function addEvidence(title,description){
 const item=document.createElement("div"),h=document.createElement("b"),p=document.createElement("p");
 item.className="evidenceRow";safeText(h,title);safeText(p,description);
 item.append(h,p);$("evidenceList").append(item);
}
function buildModels(){
 const select=$("phoneModel");
 // Exactly the approved Audio Diagnostics behaviour:
 // year groups sorted newest first and stable catalogue order within each year.
 const years=[...new Set(catalogue.models.map(m=>m.year))].sort((a,b)=>b-a);
 for(const year of years){
  const group=document.createElement("optgroup");group.label=String(year);
  catalogue.models.filter(m=>m.year===year).forEach(m=>{
   const option=document.createElement("option");option.value=m.slug;option.textContent=m.name;
   group.append(option);
  });
  select.append(group);
 }
 select.addEventListener("change",()=>{
  manualSlug=select.value;
  userSelectedModel=!!manualSlug;
  const m=catalogue.getModel(manualSlug);
  $("modelStatus").textContent=m?"Selected "+m.name+". Model-specific hardware causes still require verification.":"Model optional. Choose it only if it cannot be identified from the log.";
  if(result)displayResult();
 });
 const fromLink=new URLSearchParams(location.search).get("model");
 if(fromLink&&catalogue.getModel(fromLink)){
  select.value=catalogue.getModel(fromLink).slug;
  manualSlug=select.value;userSelectedModel=true;
  $("modelStatus").textContent="Model selected from link: "+catalogue.getModel(manualSlug).name;
 }
}
function setTag(text){
 const span=document.createElement("span");span.textContent=text;$("resultTags").append(span);
}
function displayResult(){
 if(!result)return;
 const selected=userSelectedModel?manualSlug:"";
 const device=core.modelLabel(result,selected,catalogue);
 // A file may not contain any model code; make the existing Audio-style
 // year-grouped selector reachable without asking for another file upload.
 $("editModel").hidden=!(device.name==="Not identified"||device.name==="Conflicting identifiers"||device.source.includes("name unverified"));
 report=core.report(result,device);
 if(references)report+=references.report(result.referenceLibrary,result.referenceMatches);
 $("resultFlag").textContent=result.kind==="insufficient"?"INSUFFICIENT EVIDENCE":"LOG EVIDENCE FOUND";
 safeText($("resultTitle"),result.title);
 safeText($("resultSubtitle"),result.headline);
 $("resultSummary").className="resultSummary"+(result.kind==="insufficient"?"":" attention");
 $("resultTags").replaceChildren();
 setTag(result.kind==="insufficient"?"Unclassified file":"Preliminary panic interpretation");
 setTag(result.extractedSignature?"panicString extracted":"Signature unavailable");
 if(device.name!=="Not identified")setTag(device.name);
 if(references){
  setTag(result.referenceLibrary?
    "References reviewed "+references.date(result.referenceLibrary):
    "Built-in reference library");
 }
 $("evidenceList").replaceChildren();
 addEvidence("iPhone model",device.name+" · "+device.source);
 addEvidence("What the log suggests",result.explanation);
 if(result.tokens.length)addEvidence("Recognised diagnostic identifiers",result.tokens.map(x=>x.label).join(" · "));
 else addEvidence("Recognised identifiers","None in the supported signature catalogue.");
 addEvidence("Recommended next step",result.next);
 const extra=$("referenceFindings"),list=$("referenceFindingsList");
 list.replaceChildren();
 const approved=result.referenceMatches||[];
 extra.hidden=approved.length===0;
 extra.open=false;
 for(const match of approved){
  const item=document.createElement("div");item.className="referenceItem";
  const heading=document.createElement("strong");heading.textContent=match.title;
  const meaning=document.createElement("p");
  meaning.textContent=match.summary+" Suggested check: "+match.action;
  const link=document.createElement("a");
  link.href=match.source.url;
  link.rel="noopener noreferrer";link.target="_blank";
  link.textContent="Reviewed source: "+match.source.title;
  item.append(heading,meaning,link);list.append(item);
 }
 safeText($("resultExplanation"),result.caution);
 const tech=$("technicianDetails");
 tech.open=false;
 $("excerpt").textContent=result.excerpt||"No standalone panicString was found in the selected file.";
 $("copyReport").textContent="Copy technician report";
 show("results");
}
function analyseText(text){
 const data=core.parse(text);
 if(data.error)return {error:data.error};
 // Keep remote evidence separate from the existing local panic classifier.
 // Only match the extracted panicString, never entire unrelated metadata.
 const snapshot=reviewedLibrary;
 data.referenceLibrary=snapshot;
 data.referenceMatches=[];
 if(references&&snapshot&&data.found&&data.extractedSignature){
  data.referenceMatches=references.matches(core.extractPanic(text),snapshot);
 }
 result=data;
 if(data.model?.slug&&!userSelectedModel){
  const m=catalogue.getModel(data.model.slug);
  if(m){
   $("modelStatus").textContent="Detected in file: "+m.name+". You can override it using this year-grouped selector.";
   $("modelHelp").open=false;
  }
 }else if(data.model?.code&&!data.model?.slug){
  $("modelStatus").textContent="The file contains "+data.model.code+". Choose a model only if you can verify it.";
 }
 displayResult();
 return {ok:true};
}
function readFile(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(typeof reader.result==="string"?reader.result:"");
  reader.onerror=()=>reject(reader.error||Error("Cannot read file"));
  reader.onabort=()=>reject(Error("File read cancelled"));
  try{reader.readAsText(file);}catch(e){reject(e);}
 });
}
async function importFile(file){
 if(!file){$("fileStatus").textContent="No file was selected. Choose a panic-full log.";return;}
 if(/\.(pdf|png|jpe?g|heic|mov|mp4|zip|docx?|xlsx?|pages|numbers)$/i.test(file.name)){
  $("fileStatus").textContent="That isn't a panic text file. Choose a panic-full .ips or .ips.ca.synced file.";return;
 }
 if(!file.size){$("fileStatus").textContent="The selected file is empty. Try another.";return;}
 if(file.size>MAX_SIZE){$("fileStatus").textContent="That file exceeds the 30 MB local limit.";return;}
 $("fileStatus").textContent="Selected "+file.name.slice(0,55)+". Reading privately on your iPhone…";
 await new Promise(r=>setTimeout(r,35));
 try{
  const raw=await readFile(file);
  if(!raw.trim()){$("fileStatus").textContent="No readable text found in this file.";return;}
  await ensureReferenceChecked();
  const outcome=analyseText(raw);
  // Raw log text exists only inside this call; do not retain it.
  if(outcome.error)$("fileStatus").textContent=outcome.error;
 }catch(e){$("fileStatus").textContent="Safari couldn't read this file. Save a copy to Files or paste its text under Help.";}
}
async function copy(text){
 try{
  if(!navigator.clipboard?.writeText)throw Error("No clipboard API");
  await navigator.clipboard.writeText(text);return true;
 }catch(e){
  const area=document.createElement("textarea");area.value=text;area.style.cssText="position:fixed;left:-9999px;opacity:0";
  document.body.append(area);area.select();
  let ok=false;try{ok=document.execCommand("copy");}catch(_){}area.remove();
  if(!ok)window.prompt("Select and copy your technician report:",text);
  return ok;
 }
}
function reset(){
 result=null;report="";selectedFile=null;
 manualSlug="";userSelectedModel=false;
 $("phoneModel").value="";
 $("modelHelp").open=false;
 $("modelStatus").textContent="Newer models appear first. Older models are grouped below by release year.";
 $("panicFile").value="";$("panicText").value="";
 $("fileStatus").textContent="Processed on this device. Nothing is uploaded.";
 $("pasteStatus").textContent="";
 $("technicianDetails").open=false;
 show("import");
}
$("begin").addEventListener("click",()=>show("import"));
$("importBack").addEventListener("click",()=>show("home"));
$("editModel").addEventListener("click",()=>{
 $("modelHelp").open=true;
 show("import");
 $("phoneModel").focus();
});
$("panicFile").addEventListener("click",()=>{
 $("panicFile").value="";selectedFile=null;
 $("fileStatus").textContent="Choose a panic-full file from Files…";
});
function fileChosen(){
 const f=$("panicFile").files?.[0];
 if(!f||selectedFile===f)return;
 selectedFile=f;
 void importFile(f);
}
$("panicFile").addEventListener("change",fileChosen);
$("panicFile").addEventListener("input",fileChosen);
$("panicFile").addEventListener("cancel",()=>{$("fileStatus").textContent="Files did not return a selection. Try again or use the paste option.";});
$("analyseText").addEventListener("click",async()=>{
 const input=$("panicText"),text=input.value;
 input.value=""; // clear potentially personal log text from the form
 if(text.length>MAX_SIZE){$("pasteStatus").textContent="Pasted text is too large. Select a smaller log.";return;}
 await ensureReferenceChecked();
 const data=analyseText(text);
 if(data.error)$("pasteStatus").textContent=data.error;
});
$("copyReport").addEventListener("click",async()=>{
 if(report&&await copy(report))$("copyReport").textContent="Copied ✓";
});
$("shareReport").addEventListener("click",async()=>{
 if(!report)return;
 if(navigator.share){
  try{await navigator.share({title:"iRepair Panic Diagnostics",text:report});return;}
  catch(e){if(e.name==="AbortError")return;}
 }
 if(await copy(report))$("shareReport").textContent="Copied to share ✓";
});
$("printReport").addEventListener("click",()=>window.print());
$("checkAnother").addEventListener("click",reset);
$("referenceRetry").addEventListener("click",()=>{void beginReferenceCheck();});
buildModels();
void beginReferenceCheck();
})();
