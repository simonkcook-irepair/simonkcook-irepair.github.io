/* iRepair Toolbox — Charging Diagnostics. Browser review is CUSTOMER-OBSERVED.
   No Safari battery-current, charge-state, Lightning or USB-C hardware assertions. */
(function(root){"use strict";
const STEPS=Object.freeze([
 {id:"safety",title:"Safe to charge?",label:"Check the charger",guide:"Check the cable, plug and phone for damage or moisture before connecting anything.",expect:"Everything looks dry, undamaged and safe to use.",question:"Is everything safe to use?",note:"Visual safety observation only. Stop immediately if the battery is swollen, a connector is damaged, or a liquid alert is shown."},
 {id:"wired",title:"Wired charging",label:"Plug in your charger",guide:"Use a known-good wall charger and cable. Connect gently, then look for the charging symbol on your iPhone.",expect:"A charging symbol appears or the battery page shows charging.",question:"Did your iPhone recognise the charger?",note:"Safari cannot access actual battery charging state, charging current, power or connector hardware."},
 {id:"swap",title:"Try another charger",label:"Change cable and plug",guide:"Try a different cable and wall adapter that are known to work. Connect gently and look for the charging symbol.",expect:"The iPhone recognises the other charger.",question:"Did it charge with another cable and plug?",note:"This is a comparison of customer-observed charging behaviour. Alternative accessories are not required; Unable to Test is valid."},
 {id:"port",title:"Charging connection",label:"Check the charging port",guide:"Disconnect the cable. Look for visible damage or fluff around the port, without inserting anything. Reconnect normally and see if it fits.",expect:"The plug connects normally and stays connected without being forced.",question:"Does the charging connection feel normal?",note:"Customer visual/physical observation only; do not insert tools, use liquids, force the plug or perform an electrical port test."},
 {id:"wireless",title:"Wireless charging",label:"Place on a wireless charger",guide:"If you have a compatible Qi charger, remove thick or magnetic accessories and place the iPhone centrally on the pad.",expect:"The iPhone indicates that wireless charging has started.",question:"Did wireless charging work?",note:"Customer observation. Requires compatible, powered and working Qi charger. No browser access to wireless coils or charging current."},
 {id:"behaviour",title:"Charging behaviour",label:"Check for warnings",guide:"Look for charging alerts or a charge limit in Settings → Battery. Charging may pause when the phone is warm or a limit is set.",expect:"Charging proceeds normally, or you can explain why it paused.",question:"Is the charging behaviour normal?",note:"Customer observation only; optimised charging, charge limits and temperature can affect when charging resumes."}
]);
const valid=new Set(STEPS.map(s=>s.id)), outcomes=["PASS","FAIL","UNABLE"];
const symptomChoices=Object.freeze({
 safety:["Damaged cable or plug","Liquid warning / moisture","Phone swollen or unusually hot","Damaged charging port"],
 wired:["No charging symbol","Charging only intermittently","Accessory warning","Phone becomes unusually warm"],
 swap:["Still will not charge","Charges with alternate cable","Charges with alternate adapter","No alternative accessories available"],
 port:["Connector feels loose","Debris visible","Port looks damaged","Plug will not insert normally"],
 wireless:["No wireless charging response","Charges wirelessly but not by cable","Position-dependent charging","Wireless accessory unavailable"],
 behaviour:["Charging stops unexpectedly","Charge limit / optimised charging active","Temperature warning or unusually hot","Battery percentage seems stuck"]
});
function portType(model){if(!model)return "Charging connector (model not selected)";
 return model.year>=2023&&model.slug!=="iphone-se-2022"?"USB-C":"Lightning";
}
function makePlan(slug,cat){const m=cat?.getModel?.(slug)||null;
 return{modelSlug:m?.slug||"",modelName:m?.name||"Not selected",connector:portType(m),
 steps:STEPS.map(s=>({...s}))};
}
function addAnswer(old,id,value){if(!valid.has(id)||!outcomes.includes(value))throw Error("Invalid charging result");return{...old,[id]:value};}
function tally(plan,answers){const totals={PASS:0,FAIL:0,UNABLE:0,UNANSWERED:0};
 for(const s of plan.steps){const a=answers?.[s.id];totals[outcomes.includes(a)?a:"UNANSWERED"]++}return totals;
}
function interpretations(answers){
 const out=[],fail=id=>answers?.[id]==="FAIL",passed=id=>answers?.[id]==="PASS";
 if(fail("safety"))out.push({title:"Safety check failed — do not continue charging",detail:"Stop using damaged, wet or swollen equipment. Do not insert tools into the port. Seek safe professional inspection; a liquid alert or swelling requires caution."});
 if(fail("wired")&&passed("wireless"))out.push({title:"Wired charging path deserves attention",detail:"Wireless charging was reported to work while wired charging did not. Compare known-good adapters/cables and inspect the port before considering port or board-level faults; this is not a confirmed component diagnosis."});
 if(fail("wired")&&passed("swap"))out.push({title:"Check the original cable or power adapter",detail:"An alternative charger worked. The first cable, plug, outlet or compatibility may explain the problem; the iPhone's port has not been independently certified."});
 if(fail("wired")&&fail("swap"))out.push({title:"Wired charging failed with more than one accessory",detail:"Check debris, connector fit, power sources, iOS alerts and battery state. Further technician testing may be required; browser responses cannot distinguish a charging-port fault from board-level or battery faults."});
 if(fail("port"))out.push({title:"Port connection needs inspection",detail:"Do not force a connector or insert metal objects. A technician can visually inspect and safely clean/measure with suitable equipment. A loose port is not automatically an electrical diagnosis."});
 if(fail("wireless")&&passed("wired"))out.push({title:"Wireless charging setup may need checking",detail:"Test charger power, alignment, case and Qi compatibility before considering wireless coil or charging circuitry."});
 if(fail("behaviour"))out.push({title:"Check charging software and temperature",detail:"Review Settings → Battery, charging limits, optimised charging, temperature warnings and iOS state. Slow or paused charging does not by itself prove damaged hardware."});
 return out;
}
function report(plan,answers,symptoms){
 const count=tally(plan,answers);
 const lines=["iREPAIR TOOLBOX — CHARGING DIAGNOSTICS","Date: "+new Date().toLocaleString("en-GB"),
  "Model: "+plan.modelName+(plan.modelSlug?" (customer selected)":" (not identified)"),
  "Expected connector: "+plan.connector,
  "Results: "+count.PASS+" Pass / "+count.FAIL+" Fail / "+count.UNABLE+" Unable / "+count.UNANSWERED+" Unanswered",
  "Evidence: all charging observations were manually selected by the customer. No Safari charging state, electrical current or port condition measurements were performed.",""];
 for(const s of plan.steps){
  const result=answers?.[s.id]||"UNANSWERED";lines.push(s.title+": "+result);
  lines.push("  Basis: "+s.note);
  const allowed=Array.isArray(symptoms?.[s.id])?symptoms[s.id].filter(x=>symptomChoices[s.id].includes(x)):[];
  if(result==="FAIL"&&allowed.length)lines.push("  Customer reported: "+allowed.join("; "));
 }
 const hints=interpretations(answers);
 if(hints.length){lines.push("","TECHNICIAN TRIAGE — POSSIBILITIES, NOT HARDWARE FAULT CONFIRMATIONS");
  for(const h of hints)lines.push(h.title+": "+h.detail);}
 lines.push("","Browser limitations: iPhone Safari does not expose battery charging state, charging power, USB-C/Lightning diagnostics, cable negotiation or Qi power data through public web APIs.");
 lines.push("Safety: Do not charge a wet, swollen, smoking, damaged or abnormally hot device. Never insert tools into the port during guided testing.");
 lines.push("Privacy: This guided test processes observations locally in the page and sends no diagnostic readings to a server.");
 return lines.join("\n");
}
root.IRepairChargingCore=Object.freeze({steps:STEPS,symptomChoices,portType,makePlan,addAnswer,tally,interpretations,report});
})(typeof window!=="undefined"?window:globalThis);