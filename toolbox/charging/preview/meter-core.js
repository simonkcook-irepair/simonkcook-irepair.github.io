/* iRepair Toolbox | Charging Instruments v5
 * Browser: DEMONSTRATION ONLY. No browser-accessible iPhone charge/current samples.
 * Native: observations must come from UIDevice battery monitoring.
 * Evidence provenance is mandatory in every report. No fake wattage/current claims.
 */
(function(root){"use strict";
const VERSION="charging-meters-5";
const STATES=Object.freeze(["unplugged","charging","full","unknown"]);
const SOURCES=Object.freeze(["simulated","native"]);
function normalisePercent(value){
 if(!Number.isFinite(value)||value<0||value>100)throw new TypeError("Battery level must be 0..100");
 return Math.round(value);
}
function initial(options={}){
 const percent=normalisePercent(options.percent??61);
 const source=options.source||"simulated";
 if(!SOURCES.includes(source))throw new TypeError("Invalid evidence source");
 return Object.freeze({version:VERSION,source,startedPercent:percent,
 currentPercent:percent,baselinePercent:null,lastChargePercent:null,
 powerState:"unplugged",chargeRecognised:false,progressConfirmed:false,
 interruptions:0,connectionTransitions:0,changeCount:0,
 samples:Object.freeze([]),powerConnectedAt:null,progressAt:null,
 status:"awaiting",note:""});
}
function record(s,{type,powerState,percent,at=Date.now()}){
 if(!s||s.version!==VERSION)throw new TypeError("Invalid session");
 if(type!=="power"&&type!=="level")throw new TypeError("Invalid event type");
 if(!Number.isFinite(at)||at<0)throw new TypeError("Invalid time");
 let next={...s},prev=s.powerState;
 const prevConnected=prev==="charging"||prev==="full";
 if(type==="power"){
  if(!STATES.includes(powerState))throw new TypeError("Unsupported power state");
  const nowConnected=powerState==="charging"||powerState==="full";
  if(prevConnected&&!nowConnected){next.interruptions=s.interruptions+1}
  if(prev!==powerState){next.connectionTransitions=s.connectionTransitions+1}
  next.powerState=powerState;
  if(nowConnected){
   next.chargeRecognised=true;
   if(!prevConnected){
    next.baselinePercent=s.currentPercent;
    next.lastChargePercent=s.currentPercent;
    next.powerConnectedAt=at;
   }
  }
 } else {
  const p=normalisePercent(percent);
  next.currentPercent=p;
  if(prevConnected&&prev==="charging"&&s.baselinePercent!==null&&p>s.baselinePercent){
   next.progressConfirmed=true;
   next.progressAt=s.progressAt??at;
   next.lastChargePercent=p;
  }
 }
 next.changeCount=s.changeCount+1;
 next.samples=Object.freeze([...s.samples,{type,at,powerState:next.powerState,percent:next.currentPercent}].slice(-150));
 next.status=next.progressConfirmed?"progress-confirmed":
  next.powerState==="full"&&next.currentPercent===100?"full":
  next.powerState==="charging"?"charging":
  next.interruptions>0?"interrupted":"awaiting";
 return Object.freeze(next);
}
function summary(s){
 const isConnected=s.powerState==="charging"||s.powerState==="full";
 const gainSinceStart=s.currentPercent-s.startedPercent;
 const gainSinceConnection=s.baselinePercent===null?0:s.currentPercent-s.baselinePercent;
 let progress=s.progressConfirmed?"PASS":s.powerState==="full"&&s.currentPercent>=100?"NOT_APPLICABLE":"PENDING";
 let recognition=s.chargeRecognised?"PASS":"NOT_CONFIRMED";
 let stability=s.interruptions>0?"INTERRUPTION_OBSERVED":
    isConnected?"NO_INTERRUPTION_OBSERVED":"NOT_CONFIRMED";
 const canAssert=s.source==="native";
 return Object.freeze({progress,recognition,stability,canAssert,
  isConnected,gainSinceStart,gainSinceConnection,percent:s.currentPercent,
  connectionChanges:s.connectionTransitions,interruptions:s.interruptions,
  note:!canAssert?"Preview simulation — NOT a device diagnostic result.":
   "Measured from iOS battery-state and level APIs; not an electrical current/wattage reading."});
}
function report(s,options={}){
 const z=summary(s),model=String(options.modelName||"Unspecified iPhone").slice(0,100);
 const evidence=z.canAssert?"NATIVE iOS BATTERY OBSERVATIONS":"SIMULATED SAFARI PREVIEW — NOT A REAL HARDWARE TEST";
 const result=z.canAssert?(z.progress==="PASS"?"Charging progress: PASS":z.progress==="NOT_APPLICABLE"?"Charging progress: NOT APPLICABLE (full battery)":"Charging progress: PENDING"):"Diagnostic result: NOT ASSESSED (simulation only)";
 return ["iREPAIR TOOLBOX — CHARGING DIAGNOSTICS",evidence,
   "Model: "+model,
   "Initial battery charge: "+s.startedPercent+"%",
   "Latest battery charge: "+s.currentPercent+"%",
   "Charging recognition: "+(z.canAssert?z.recognition:"DEMO ONLY"),
   "Reported interruptions: "+s.interruptions+(z.canAssert?"":" (simulated)"),
   result,
   "Connection stability: "+(z.canAssert?z.stability:"DEMO ONLY"),
   "Battery Health: not measured by this instrument",
   "Electrical input current and watts: unavailable without supported external hardware",
   "A charge-level rise confirms progress only while iOS reports charging. A charging-status interruption does not by itself identify a defective cable or port.",
   "No forced timeout is used. If charging is recognised without a level increase, progress remains PENDING.",
   "Privacy: processed on-device; preview does not upload diagnostic observations."
 ].join("\n");
}
root.IRepairChargingMeters=Object.freeze({VERSION,STATES,SOURCES,initial,record,summary,report});
})(typeof window!=="undefined"?window:globalThis);