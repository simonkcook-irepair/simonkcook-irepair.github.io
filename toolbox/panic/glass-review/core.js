/* iRepair Panic Diagnostics inference core — local, conservative and side-effect-free.
   This is NOT a hardware diagnostic, does not use private Apple APIs and does
   not store or transmit the imported panic file. Provenance: panic-full text.
*/
(function(root){
"use strict";
const LIMIT=4_000_000;
const safe=v=>typeof v==="string"?v:String(v??"");
const modelMap=Object.freeze({
 "iPhone14,2":"iphone-13-pro","iPhone14,3":"iphone-13-pro-max",
 "iPhone14,4":"iphone-13-mini","iPhone14,5":"iphone-13",
 "iPhone15,2":"iphone-14-pro","iPhone15,3":"iphone-14-pro-max",
 "iPhone15,4":"iphone-15","iPhone15,5":"iphone-15-plus",
 "iPhone16,1":"iphone-15-pro","iPhone16,2":"iphone-15-pro-max",
 "iPhone17,1":"iphone-16-pro","iPhone17,2":"iphone-16-pro-max",
 "iPhone17,3":"iphone-16","iPhone17,4":"iphone-16-plus",
 "iPhone17,5":"iphone-16e",
 "iPhone18,1":"iphone-17-pro","iPhone18,2":"iphone-17-pro-max",
 "iPhone18,3":"iphone-17","iPhone18,4":"iphone-air"
});
function extractModel(text){
 const re=/(?:^|[\s,{;])["']?(?:productType|product_type|productModel|deviceModel|device_model|hardwareModel|modelIdentifier|model_identifier)["']?\s*[:=]\s*["']?(iPhone\d{1,2},\d{1,2})(?=["',}\s]|$)/gim;
 const ids=new Set();let m;
 while((m=re.exec(text))!==null){ids.add(m[1].replace(/^iphone/i,"iPhone"));if(ids.size>8)break;}
 const code=ids.size===1?[...ids][0]:null;
 return {code,slug:code?modelMap[code]||null:null,ambiguous:ids.size>1,present:ids.size>0};
}
function panicCandidate(obj,depth=0){
 if(!obj||typeof obj!=="object"||depth>5)return null;
 for(const k of ["panicString","panic_string","panicstring","panic"]){
  if(typeof obj[k]==="string"&&obj[k].trim())return obj[k];
 }
 for(const k of ["metadata","message","payload","log","data","event"]){
  const found=panicCandidate(obj[k],depth+1);if(found)return found;
 }
 return null;
}
function extractPanic(text){
 try{const found=panicCandidate(JSON.parse(text));if(found)return found;}catch(e){}
 // A panic-full .ips can contain one JSON header followed by a second JSON
 // payload; try lines rather than asserting the whole file is valid JSON.
 const lines=text.split(/\n/);
 if(lines.length>1){
  for(const line of lines.slice(0,60)){
   if(!/panicString|panic_string|panicstring|"panic"\s*:/.test(line))continue;
   try{const found=panicCandidate(JSON.parse(line));if(found)return found;}catch(e){}
  }
 }
 // Capture JSON quoted escaped strings (with \n) if the surrounding
 // structure wasn't parsable. Limit to avoid unbounded regex work.
 const m=text.match(/"(?:panicString|panic_string|panicstring)"\s*:\s*"((?:\\.|[^"\\]){0,20000})"/i);
 if(m){
  try{return JSON.parse('"'+m[1]+'"');}catch(e){return m[1].replace(/\\n/g,"\n").replace(/\\"/g,'"');}
 }
 const plain=text.match(/(?:^|[\n\r])\s*(?:panicString|panic_string|panicstring)\s*[:=]\s*(.{1,3000})/i);
 if(plain)return plain[1];
 return "";
}
const rules=[
 {id:"thermalmonitord",test:/\bthermalmonitord\b/i,label:"Thermal monitoring watchdog"},
 {id:"missing_sensor",test:/\bmissing[\s_-]+sensor(?:\(s\)|s)?\b/i,label:"Missing sensor communication"},
 {id:"mic1",test:/\bmic1\b/i,label:"MIC1 identifier"},
 {id:"mic2",test:/\bmic2\b/i,label:"MIC2 identifier"},
 {id:"mic3",test:/\bmic3\b/i,label:"MIC3 identifier"},
 {id:"prs0",test:/\bprs0\b/i,label:"PRS0 identifier"},
 {id:"tg0b",test:/\btg0b\b/i,label:"TG0B identifier"},
 {id:"tg0v",test:/\btg0v\b/i,label:"TG0V identifier"},
 {id:"gas_gauge",test:/\bgas[\s_-]?gauge\b/i,label:"Battery gas-gauge reference"},
 {id:"smc",test:/\bsmc[\s_-]*panic\b/i,label:"SMC panic reference"},
 {id:"aop",test:/\baop[\s_-]*panic\b/i,label:"AOP panic reference"},
 {id:"watchdog",test:/\b(?:userspace\s+)?watchdog(?:\s+timeout)?\b/i,label:"Watchdog reference"}
];
function redact(input){
 let s=safe(input).replace(/\s+/g," ").slice(0,540);
 return s
 .replace(/[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}/g,"[UUID]")
 .replace(/\b(?:[\w.+-]+)@(?:[\w.-]+\.[A-Za-z]{2,})\b/g,"[email]")
 .replace(/0x[0-9a-f]{7,}/gi,"[memory address]")
 .replace(/\b(?:serial(?:number)?|imei|imsi|udid|ecid|device[_-]?id|account[_-]?id|token|phone[_-]?number)\s*[:=]\s*["']?[\w+.:-]{3,}/gi,"[identifier removed]")
 .replace(/\b[A-F0-9]{24,}\b/gi,"[opaque identifier]")
 .slice(0,360);
}
function parse(raw){
 const text=safe(raw).replace(/\r/g,"").slice(0,LIMIT);
 if(!text.trim())return {error:"Select a panic-full log or paste a panic string first."};
 const model=extractModel(text);
 const panic=extractPanic(text);
 const marker=/\bpanic(?:-full|\s+full|\s*\(|\s+log|string|_string)?\b|\bthermalmonitord\b|\bsmc\s+panic\b|\baop\s+panic\b/i.test(text.slice(0,500000));
 // Search ONLY in extracted panic string when available; don't treat log
 // metadata or surrounding unrelated analytics data as a component clue.
 const evidence=panic||text.slice(0,12000);
 const markers=rules.filter(rule=>rule.test.test(evidence)).map(r=>({id:r.id,label:r.label}));
 const ids=new Set(markers.map(e=>e.id));
 let kind="unclassified",title="Panic marker found",headline="Further investigation recommended";
 let explanation="We found a panic reference, but no currently supported signature rule identifies the panic family. No hardware part can be confirmed.";
 let next="Preserve the original log and review its complete panic context, recent software changes, repair history and repeated occurrences before considering hardware replacement.";
 if(!marker&&!panic){
  kind="insufficient";title="No recognisable panic signature";headline="A panic-full log is needed";
  explanation="This file or text does not contain a clear panic marker. It may be another kind of analytics record.";
  next="In Settings → Privacy & Security → Analytics & Improvements → Analytics Data, look for a relevant panic-full record. Its absence does not prove the iPhone is healthy.";
 }else if(ids.has("thermalmonitord")||ids.has("missing_sensor")){
  kind="sensor";title="Sensor communication clue";headline="A missing-sensor or watchdog reference is reported";
  explanation="A thermal monitoring or missing-sensor signature has been recorded. Depending on the handset, this can accompany recurring restarts. The token is not itself the identity of a defective flex or sensor.";
  next="Confirm the handset and exact missing-sensor tokens, compare repeated dated panic reports, inspect relevant connectors, liquid indicators and repair history. Use verified model-specific evidence before proposing component replacement.";
 }else if(ids.has("smc")){
  kind="smc";title="System management panic clue";headline="An SMC-related reference is reported";
  explanation="The log contains an SMC panic reference. This alone cannot distinguish a peripheral, electrical or logic-board cause.";
  next="Review the complete panic family, affected buses, battery and peripheral connections, and physically reproduce the issue before considering board-level repair.";
 }else if(ids.has("aop")){
  kind="aop";title="Always-on processor panic clue";headline="An AOP-related reference is reported";
  explanation="The log contains an always-on processor reference. It does not independently prove that any particular sensor, flex or logic-board component is faulty.";
  next="Compare other dated logs, check firmware/iOS context and connected peripherals, and seek model-specific evidence before changing hardware.";
 }else if(ids.has("watchdog")){
  kind="watchdog";title="Watchdog-related panic clue";headline="A watchdog reference is reported";
  explanation="A watchdog means a process failed to respond within an expected period. Software, sensor communication and other causes may be involved.";
  next="Inspect the named service or missing-sensor references, software update history and whether the fault occurs repeatedly under the same conditions.";
 }
 return {schema:1,kind,title,headline,explanation,next,
  found:kind!=="insufficient",tokens:markers,model,
  excerpt:panic?redact(panic):"",extractedSignature:!!panic,
  origin:"User-selected analytics text",hardwareConfirmed:false,
  caution:"A panic log is evidence of a reported software or hardware event, not proof of a specific failed part or logic board."};
}
function modelLabel(result,selected,cat){
 const manual=cat&&cat.getModel(selected);
 if(manual)return {name:manual.name,source:"Customer selection"};
 if(result.model?.ambiguous)return {name:"Conflicting identifiers",source:"Log metadata"};
 if(result.model?.slug&&cat){
  const found=cat.getModel(result.model.slug);if(found)return {name:found.name,source:"Analytics identifier (unverified)"};
 }
 if(result.model?.code)return {name:result.model.code,source:"Analytics identifier (name unverified)"};
 return {name:"Not identified",source:"Not available"};
}
function report(result,device){
 const rows=[
  "iREPAIR TOOLBOX — PANIC DIAGNOSTICS",
  "Date: "+new Date().toLocaleString("en-GB"),
  "Assessment: "+result.title,
  "Evidence: "+result.headline,
  "iPhone model: "+device.name,
  "Model source: "+device.source,
  "Classification: "+(result.found?"Preliminary panic clue":"Insufficient evidence"),
  "Recognised tokens: "+(result.tokens.length?result.tokens.map(x=>x.label).join(", "):"None"),
  "Explanation: "+result.explanation,
  "Suggested next step: "+result.next,
  "Evidence source: User-selected local analytics text",
  "Limitations: "+result.caution,
  "Original log contents and personal identifiers are NOT included in this report."
 ];
 return rows.join("\n");
}
root.iRepairPanicCore=Object.freeze({parse,extractModel,modelLabel,report,redact});
})(typeof window!=="undefined"?window:globalThis);
