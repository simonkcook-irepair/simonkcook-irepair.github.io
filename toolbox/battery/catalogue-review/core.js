/* iRepair Battery Core v1 — pure local analytics and native-provenance inference.
   No DOM, storage, network or personal metadata retention. */
(function(root) {
"use strict";
const CYCLE_KEYS=["last_value_CycleCount","BatteryCycleCount","battery_cycle_count","cycle_count","cycleCount","CycleCount"];
const PERCENT_KEYS=["last_value_MaximumCapacityPercent","BatteryMaximumCapacityPercent","MaximumCapacityPercent","battery_maximum_capacity_percent","maximum_capacity_percent"];
const RAW=[
 {key:"AppleRawMaxCapacity",label:"Raw maximum capacity",min:1,max:300000},
 {key:"NominalChargeCapacity",label:"Nominal charge capacity",min:1,max:300000},
 {key:"MaximumFCC",label:"Maximum FCC",min:1,max:300000},
 {key:"MaximumQmax",label:"Maximum Qmax",min:1,max:300000},
 {key:"TotalOperatingTime",label:"Operating-time counter",min:0,max:100000000},
 {key:"AverageTemperature",label:"Average temperature counter (raw)",min:0,max:10000},
 {key:"MaximumTemperature",label:"Maximum temperature counter (raw)",min:0,max:10000}
];
const MODEL_MAP=Object.freeze({
 "iPhone14,2":"iPhone 13 Pro","iPhone14,3":"iPhone 13 Pro Max",
 "iPhone14,4":"iPhone 13 mini","iPhone14,5":"iPhone 13",
 "iPhone15,2":"iPhone 14 Pro","iPhone15,3":"iPhone 14 Pro Max",
 "iPhone15,4":"iPhone 15","iPhone15,5":"iPhone 15 Plus",
 "iPhone16,1":"iPhone 15 Pro","iPhone16,2":"iPhone 15 Pro Max",
 "iPhone17,1":"iPhone 16 Pro","iPhone17,2":"iPhone 16 Pro Max",
 "iPhone17,3":"iPhone 16","iPhone17,4":"iPhone 16 Plus",
 "iPhone17,5":"iPhone 16e",
 "iPhone18,1":"iPhone 17 Pro","iPhone18,2":"iPhone 17 Pro Max",
 "iPhone18,3":"iPhone 17","iPhone18,4":"iPhone Air"
});
function lookupModel(code){return typeof code==="string"&&/^iPhone\d{1,2},\d{1,2}$/.test(code)?MODEL_MAP[code]||null:null;}
function findMetric(text,names,min,max){
 // Keys are an internal whitelist; never interpolate user-provided key names.
 const keys=new Set(names.map(k=>k.toLowerCase()));
 const re=/(?:^|[\s,{;])["']?([A-Za-z_][A-Za-z0-9_.]{1,79})["']?\s*[:=]\s*["']?(\d{1,8})(?=["',}\s]|$)/gim;
 const values=[];let m;
 while((m=re.exec(text))!==null){
  if(!keys.has(m[1].toLowerCase()))continue;
  const value=Number(m[2]);if(value>=min&&value<=max)values.push({key:m[1],value});
  if(values.length>=512)break;
 }
 const unique=[...new Set(values.map(e=>e.value))];
 return {value:unique.length===1?unique[0]:null,seen:values.length,conflict:unique.length>1};
}
function findModel(text){
 const re=/(?:^|[\s,{;])["']?(?:productType|product_type|_productModel|productModel|deviceModel|device_model|modelIdentifier|model_identifier|hardwareModel|model)["']?\s*[:=]\s*["']?(iPhone\d{1,2},\d{1,2})(?=["',}\s]|$)/gim;
 const ids=new Set();let m;
 while((m=re.exec(text))!==null){ids.add(m[1].replace(/^iphone/i,"iPhone"));if(ids.size>8)break;}
 if(ids.size===1){const code=[...ids][0];return {code,name:lookupModel(code),found:true,ambiguous:false};}
 return {code:null,name:null,found:ids.size>0,ambiguous:ids.size>1};
}
function fieldNames(text){
 const set=new Set();let m;
 const re=/"([A-Za-z_][A-Za-z0-9_]{2,79})"\s*:/g;
 while((m=re.exec(text))!==null){
  const name=m[1];
  if(!/(battery|cycle|capacity|charge|qmax|fcc|temperature|voltage|soc)/i.test(name))continue;
  if(/(device|serial|uuid|account|imei|token|person|location|username|phoneNumber|user|identifier)/i.test(name))continue;
  set.add(name);if(set.size>=90)break;
 }
 return [...set].sort();
}
function parseAnalytics(text){
 if(typeof text!=="string")throw new TypeError("Expected analytics text");
 const cycles=findMetric(text,CYCLE_KEYS,0,50000);
 const health=findMetric(text,PERCENT_KEYS,1,100);
 const model=findModel(text);
 const raw=RAW.map(k=>{
  const r=findMetric(text,["last_value_"+k.key,k.key],k.min,k.max);
  return {key:k.key,label:k.label,value:r.value,seen:r.seen,conflict:r.conflict};
 }).filter(r=>r.seen>0);
 return {schema:1,cycles,health,model,raw,keyNames:fieldNames(text),
  anyFound:cycles.seen>0||health.seen>0||raw.length>0,conflicting:cycles.conflict||health.conflict,
  source:"imported-analytics",verified:false};
}
function modelLabel(model){
 if(!model||!model.found)return "Not identified";
 if(model.ambiguous)return "Conflicting model identifiers";
 return model.name?model.name+" ("+model.code+")":model.code+" (model name unverified)";
}
function nativeSnapshot(input){
 if(!input||typeof input!=="object"||input.source!=="ios-native")return null;
 const code=typeof input.modelIdentifier==="string"&&/^iPhone\d{1,2},\d{1,2}$/.test(input.modelIdentifier)?input.modelIdentifier:null;
 const model=code?{code,name:lookupModel(code),found:true,ambiguous:false}:null;
 const level=Number(input.chargePercent);
 const pct=input.chargePercent!==null&&Number.isFinite(level)&&level>=0&&level<=100?Math.round(level):null;
 const state=["charging","unplugged","full","unknown"].includes(input.chargingState)?input.chargingState:"unknown";
 const ios=/^\d+(?:\.\d+){0,2}$/.test(String(input.iosVersion||""))?input.iosVersion:null;
 return {source:"ios-native",model,iosVersion:ios,chargePercent:pct,chargingState:state};
}
function assess(input){
 const a=input?.analytics||null,n=nativeSnapshot(input?.native),manual=input?.capacity;
 const entered=Number.isInteger(manual)&&manual>=1&&manual<=100;
 const fromLog=a?.health&&!a.health.conflict? a.health.value:null;
 const capacity=entered?manual:(Number.isInteger(fromLog)?fromLog:null);
 const source=entered?(input?.capacitySource==="analytic-prefill"?"Unverified analytics file (prefilled; check Settings)":"Customer-entered iOS Battery Health"):
  capacity!==null?"Unverified analytics file":null;
 const status=["normal","service","unknown"].includes(input?.serviceStatus)?input.serviceStatus:"unknown";
 const model=n?.model||a?.model||null;
 const cycles=a?.cycles&&!a.cycles.conflict?a.cycles.value:null;
 const mismatch=entered&&Number.isInteger(fromLog)&&fromLog!==manual;
 let level="incomplete",title="Battery review incomplete",summary="We couldn't establish a complete Battery Health result.";
 let explanation="Missing readings don't mean your battery is faulty.";
 if(status==="service"){
  level="service";title="Battery service recommended";
  summary="Your iPhone reports that battery service is recommended.";
  explanation="Arrange a qualified battery inspection and discuss replacement. This is the customer-reported iOS warning, not an independent electrical test.";
 }else if(capacity!==null&&capacity<=80){
  level="review";title="Battery wear worth reviewing";
  summary="The available maximum-capacity reading is "+capacity+"%.";
  explanation="An indicated capacity at or below 80% warrants a battery service discussion. Confirm any analytics-only figure in iOS Settings.";
 }else if(status==="normal"&&capacity!==null){
  level="reported";title="No service warning reported";
  summary="Maximum capacity "+capacity+"% and no battery-service warning reported.";
  explanation="These are useful reported readings, but they cannot rule out intermittent battery or charging issues.";
 }else if(status==="normal"){
  level="partial";title="No service warning reported";
  summary="No service warning was reported; maximum capacity remains unavailable.";
  explanation="If available, the maximum-capacity percentage adds useful context.";
 }else if(capacity!==null){
  level="partial";title="Maximum capacity available";
  summary=(entered?"iOS Settings shows ":"An analytics file reports ")+capacity+"% maximum capacity.";
  explanation="Service warning status could not be confirmed. Capacity alone does not independently prove battery condition.";
 }else if(cycles!==null){
  level="partial";title="Partial battery information";
  summary="We found "+cycles+" charge cycles, but no maximum-capacity percentage.";
  explanation="Cycle count on its own cannot establish battery health. Check the percentage shown by iOS Settings.";
 }else if(a?.anyFound){
  level="partial";title="Limited analytics information";
  summary="Some battery counters were found, but no interpretable health reading.";
  explanation="Raw counters do not establish a calibrated battery-health percentage.";
 }
 if(mismatch)explanation+=" The iOS Settings entry differs from the analytics value; the Settings entry takes priority.";
 if(a?.conflicting)explanation+=" Conflicting analytics readings were excluded from the assessment.";
 if(model?.name==="iPhone Duo")explanation+=" This device uses two batteries; one reading may not describe the entire system.";
 return {schema:1,level,title,summary,explanation,capacity,capacitySource:source,status,cycles,
  model,modelSource:n?.model?"Native iOS device":model?.found?"Unverified analytics file":null,
  native:n,analytics:a,rawCount:a?.raw?.length||0,conflicting:!!a?.conflicting,mismatch,entered,
  needsSettings:!entered&&status==="unknown"};
}
function rawLabel(r){return r.conflict?"Conflicting readings":r.value===null?"Unavailable":String(r.value)+" (raw; uncalibrated)";}
function fieldSummary(data){
 if(!data)return "No analytics file was analysed.";
 const arr=["iREPAIR BATTERY FIELD SUMMARY","Only supported field names and numeric readings; not a raw file.",
  "iPhone model: "+modelLabel(data.model),
  "CycleCount: "+(data.cycles.conflict?"Conflicting":data.cycles.value??"Not available"),
  "MaximumCapacityPercent: "+(data.health.conflict?"Conflicting":data.health.value??"Not available"),
  "Other recognised fields:"];
 for(const r of data.raw)arr.push("  "+r.key+": "+rawLabel(r));
 arr.push("Other battery-related field names (no values):");
 arr.push(...(data.keyNames.length?data.keyNames.map(k=>"  "+k):["  None"]));
 arr.push("Raw telemetry has unverified units. No device serials, account identifiers or raw log text are included.");
 return arr.join("\n");
}
function report(result){
 const r=result,arr=["iREPAIR TOOLBOX — BATTERY DIAGNOSTICS","Date: "+new Date().toLocaleString("en-GB"),
  "Assessment: "+r.title,"iPhone model: "+modelLabel(r.model),
  "Model source: "+(r.modelSource||"Unavailable")];
 if(r.native){
  arr.push("iOS version: "+(r.native.iosVersion||"Unavailable"));
  arr.push("Current charge: "+(r.native.chargePercent===null?"Unavailable":r.native.chargePercent+"% (native device reading)"));
  arr.push("Charging state: "+r.native.chargingState);
 }
 arr.push("Battery Health maximum capacity: "+(r.capacity===null?"Not available":r.capacity+"%"));
 arr.push("Capacity source: "+(r.capacitySource||"Unavailable"));
 arr.push("Service status: "+({normal:"No warning reported",service:"Service recommended",unknown:"Unable to check"}[r.status]));
 arr.push("Charge cycles: "+(r.cycles===null?"Not available":r.cycles+" (unverified analytics file)"));
 arr.push("Additional analytics fields: "+r.rawCount);
 arr.push("Conflicting analytics: "+(r.conflicting?"Yes":"No"));
 arr.push("Different analytics vs Settings capacity: "+(r.mismatch?"Yes (Settings prioritised)":"No"));
 arr.push("","Interpretation: "+r.explanation);
 arr.push("Limitations: Browser does not independently access battery health, charging state, cycle count or hardware temperature. Native public iOS API permits current charge and charging state but not maximum-capacity health/cycle count. Analytics data may be stale and does not prove a hardware fault.");
 arr.push("Private log contents or device identifiers were not included.");
 return arr.join("\n");
}
root.iRepairBatteryCore=Object.freeze({parseAnalytics,lookupModel,modelLabel,nativeSnapshot,assess,rawLabel,fieldSummary,report});
})(typeof window!=="undefined"?window:globalThis);
