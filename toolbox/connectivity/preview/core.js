/* iRepair Toolbox Connectivity: customer-first deterministic report engine. */
(function(root){"use strict";
const STEPS=Object.freeze([
{id:"internet",title:"Internet",short:"Check your connection",mode:"probe",
 instruction:"Tap the button below. We’ll check whether this iPhone can reach the iRepair test page.",
 expected:"Internet connection responds",question:"Did your internet connection respond?",
 note:"Same-origin web reachability only; not a hardware or broadband speed test."},
{id:"wifi",title:"Wi-Fi",short:"Connect to Wi-Fi",mode:"manual-probe",
 instruction:"Open Settings → Wi-Fi. Connect to a known network, then return here and tap Check connection.",
 expected:"Wi-Fi connected and browsing works",question:"Is Wi-Fi connected and working?",
 note:"Customer confirms Wi-Fi is on; the browser cannot independently identify the current network interface."},
{id:"cellular",title:"Mobile data",short:"Try mobile data",mode:"manual-probe",
 instruction:"Turn Wi-Fi off temporarily in Settings and make sure Mobile Data is enabled. Return here and tap Check connection. This uses a tiny amount of data.",
 expected:"Mobile data reaches the test page",question:"Did your mobile data work?",
 note:"Customer confirms Wi-Fi off and Mobile Data on; Safari cannot verify the cellular radio or data route."},
{id:"bluetooth",title:"Bluetooth",short:"Pair a Bluetooth device",mode:"guided",
 instruction:"Open Settings → Bluetooth. Turn Bluetooth on and try connecting to a known accessory, such as headphones or a speaker.",
 expected:"Your accessory connects",question:"Did your Bluetooth accessory connect?",
 note:"Customer-guided accessory observation; browser cannot scan or confirm Bluetooth pairing."},
{id:"location",title:"Location",short:"Find your location",mode:"location",
 instruction:"Tap Check location and allow access if asked. The app only needs to know whether a location estimate is returned.",
 expected:"A location estimate is received",question:"Was your location found?",
 note:"Browser Geolocation result; may use GNSS, Wi-Fi or mobile networks and is NOT proof of GPS sensor health."},
{id:"airdrop",title:"AirDrop",short:"Share with another device",mode:"guided",
 instruction:"If you have another Apple device nearby, try sending a photo using Share → AirDrop. Return here and record the result.",
 expected:"The other device receives your photo",question:"Did AirDrop work?",
 note:"Requires another compatible Apple device, correct discoverability and permissions; customer-guided."}
]);
const valid=new Set(STEPS.map(s=>s.id)),options=Object.freeze(["PASS","FAIL","UNABLE"]);
const symptoms=Object.freeze({
internet:Object.freeze(["Test page could not be reached","Connection intermittent","Very slow connection"]),
wifi:Object.freeze(["Cannot join Wi-Fi network","Wi-Fi drops frequently","Connected but no internet"]),
cellular:Object.freeze(["No Service / SOS","Mobile Data enabled but offline","Intermittent mobile data"]),
bluetooth:Object.freeze(["Accessory not discovered","Pairing unsuccessful","Repeated disconnections"]),
location:Object.freeze(["Location permission denied","No location returned","Estimate too inaccurate for task"]),
airdrop:Object.freeze(["Other device not visible","Transfer fails","Transfer stalls or is cancelled"])
});
function createPlan(slug,catalogue){const m=catalogue?.getModel?.(slug)||null;return{modelSlug:m?.slug||"",modelName:m?.name||"Not selected",steps:STEPS.map(s=>({...s}))}}
function setAnswer(answers,id,value){if(!valid.has(id)||!options.includes(value))throw Error("Invalid diagnostic answer");return{...answers,[id]:value}}
function tally(plan,answers){const counts={PASS:0,FAIL:0,UNABLE:0,UNANSWERED:0};for(const s of plan.steps){const v=answers?.[s.id];counts[options.includes(v)?v:"UNANSWERED"]++}return counts}
function canConfirmPass(step,evidence,confirmed){
 if(step.mode==="guided")return true;
 if(step.mode==="probe")return evidence?.[step.id]?.status==="reached";
 if(step.mode==="manual-probe")return evidence?.[step.id]?.status==="reached"&&confirmed?.[step.id]===true;
 if(step.mode==="location")return evidence?.location?.status==="received";
 return false;
}
function interpret(plan,answers){
 const tips=[];
 const flagged=id=>answers?.[id]==="FAIL";
 if(flagged("internet"))tips.push({title:"Connection is not reachable",detail:"Check Airplane Mode, Wi-Fi or Mobile Data availability, service status and known-good networks. A failed test page request alone does not identify faulty phone hardware."});
 if(flagged("wifi"))tips.push({title:"Investigate Wi-Fi connection",detail:"Try another known network, restart networking, check router/internet service and iOS settings before considering antenna or logic-board work."});
 if(flagged("cellular"))tips.push({title:"Investigate mobile-data service",detail:"Check SIM/eSIM, coverage, plan status, carrier outage and APN/network settings. An unsuccessful web request does not prove a baseband fault."});
 if(flagged("bluetooth"))tips.push({title:"Investigate Bluetooth pairing",detail:"Try a second verified accessory, reset accessory pairing and check permissions before investigating Bluetooth hardware."});
 if(flagged("location"))tips.push({title:"Investigate location services",detail:"Check location permission, precise-location setting, signal environment and device settings. Browser location estimates do not isolate the GPS receiver."});
 if(flagged("airdrop"))tips.push({title:"Investigate AirDrop transfer",detail:"Check both Apple devices, Wi-Fi and Bluetooth availability, discoverability and supported features. Do not interpret a single unsuccessful transfer as component failure."});
 return tips;
}
function evidenceLine(step,evidence){
 const v=evidence?.[step.id];
 if(step.id==="location")return v?.status==="received"?
  "Browser location estimate received; reported accuracy around "+Math.round(v.accuracy)+" metres. No location coordinates retained in report. NOT proof of GPS sensor health.":
  "No verified browser location estimate received. Permission, availability and environment can affect this.";
 if(["internet","wifi","cellular"].includes(step.id))return v?.status==="reached"?
   "iRepair same-origin test page reached in "+Math.round(v.elapsedMs)+" ms; route/interface and radio hardware NOT independently verified.":
   "No successful same-origin test-page request recorded; no diagnosis of hardware made.";
 return step.note;
}
function report(plan,answers,evidence,confirmed,observed){
 const counts=tally(plan,answers);
 const lines=["iREPAIR TOOLBOX — CONNECTIVITY DIAGNOSTICS",
  "Date: "+new Date().toLocaleString("en-GB"),"iPhone: "+plan.modelName+(plan.modelSlug?" (customer selected)":" (not identified)"),
  "Results: "+counts.PASS+" Pass / "+counts.FAIL+" Fail / "+counts.UNABLE+" Unable / "+counts.UNANSWERED+" Not completed",
  "Customer confirmation is separate from measured browser reachability and location availability.",""];
 for(const s of plan.steps){
  lines.push(s.title+": "+(answers?.[s.id]||"UNANSWERED"));
  lines.push("  Method: "+evidenceLine(s,evidence));
  if(s.mode==="manual-probe")lines.push("  User states connection type was set as instructed: "+(confirmed?.[s.id]?"Yes":"Not confirmed"));
  const reported=Array.isArray(observed?.[s.id])?observed[s.id].filter(v=>symptoms[s.id].includes(v)):[];
  if(answers?.[s.id]==="FAIL"&&reported.length)lines.push("  Observed: "+reported.join("; "));
 }
 const hints=interpret(plan,answers);if(hints.length){lines.push("","TECHNICIAN TRIAGE — NOT A CONFIRMED HARDWARE DIAGNOSIS");for(const h of hints)lines.push(h.title+": "+h.detail);}
 lines.push("","Privacy: Exact coordinates are not displayed, saved or included in this report. Network checks request only the iRepair test resource; ordinary website access logs may exist.");
 lines.push("Limits: Browser does not identify Wi-Fi vs cellular radios, inspect Bluetooth pairing, certify GPS-only accuracy or diagnose a device's baseband. These checks cannot isolate individual radios. More native measurements require an iPhone App Store build.");
 return lines.join("\n");
}
root.IRepairConnectivityCore=Object.freeze({steps:STEPS,symptoms,createPlan,setAnswer,tally,canConfirmPass,interpret,evidenceLine,report});
})(typeof window!=="undefined"?window:globalThis);