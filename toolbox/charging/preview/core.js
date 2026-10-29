/* iRepair Toolbox Charging Diagnostics v2
   Browser observations only: no voltage, amperage or connector-pin measurements. */
(function(root){"use strict";
const STEPS=Object.freeze([
{id:"safety",title:"Safe to charge?",label:"Check everything first",mode:"guided",
 guide:"Before connecting power, check your phone, cable and plug. Are they dry, cool and undamaged?",
 expect:"No moisture, swelling, scorching, loose parts or damaged insulation.",
 question:"Is everything safe to use?",
 note:"Customer visual inspection. Stop before powered checks if damage, moisture, battery swelling, heat or a liquid alert is suspected."},
{id:"wired",title:"Wired charging",label:"Connect your charger",mode:"guided",
 guide:"Connect a suitable, known-working wall charger normally. Look for the iPhone's charging indication.",
 expect:"Your iPhone recognises the charger without needing you to adjust the plug.",
 question:"Did charging start normally?",
 note:"Customer visual observation. Safari cannot measure charging state, power, voltage, or connector contacts."},
{id:"stability",title:"Connection stability",label:"Does charging stay connected?",mode:"guided",
 guide:"With the cable resting naturally, watch for charging dropping out. Has it ever needed to be held at an angle to charge?",
 expect:"Charging remains connected without supporting the cable or holding it at an angle.",
 question:"Is the charging connection reliable?",
 note:"Observation of ordinary use only. Do not deliberately wiggle, bend, pull, rock or force the connector to trigger charging."},
{id:"flip",title:"Turn the plug over",label:"Try the opposite side",mode:"guided",
 guide:"Disconnect the lead. Turn its reversible Lightning or USB-C plug 180°, then reconnect it gently.",
 expect:"Charging behaves reliably in both plug orientations.",
 question:"Does charging behave the same both ways?",
 note:"A change after turning a reversible plug suggests contact, contamination, lead or port issues, but is not proof of any particular contact/pin fault."},
{id:"swap",title:"Try another charger",label:"Compare a second cable",mode:"guided",
 guide:"If possible, try a different known-good cable and suitable adapter. Keep the original unplugged for comparison.",
 expect:"Your iPhone recognises the known-good alternative charger.",
 question:"Did the alternative charger work?",
 note:"Customer accessory comparison. If no known-good alternative is available, choose Unable to Test."},
{id:"port",title:"Check lead and port",label:"Look closely at the contacts",mode:"guided",
 guide:"Unplug the lead. Look at both sides of its tip for marks, residue or wear, then look at the phone's port for fluff or damage.",
 expect:"Both the connector and charging port look clean, intact and unobstructed.",
 question:"Do the cable tip and port look healthy?",
 note:"Visual inspection only, with the cable disconnected. No insertion, scraping or electrical probing. A soft, dry, lint-free cloth may be used on the disconnected cable plug only."},
{id:"wireless",title:"Wireless charging",label:"Try a charging pad",mode:"guided",
 guide:"If you have a compatible, powered Qi charging pad, place the iPhone centrally on it.",
 expect:"The iPhone indicates that wireless charging has started.",
 question:"Did wireless charging work?",
 note:"Requires a compatible and working charger. Customer observation only; no browser access to wireless charging hardware."},
{id:"behaviour",title:"Charging behaviour",label:"Check for charging pauses",mode:"guided",
 guide:"Look at Settings → Battery for charge limits or optimised charging, and check for any temperature warnings.",
 expect:"Charging progresses normally or any pause can be explained by a limit or temperature.",
 question:"Does charging behave normally?",
 note:"Temperature protections, optimised charging and charge limits can affect charging. Safari cannot read these settings or actual charging state."}
]);
const valid=new Set(STEPS.map(s=>s.id));const outcomes=["PASS","FAIL","UNABLE"];
const symptomChoices=Object.freeze({
 safety:["Wet connector or liquid warning","Phone swollen or unusually hot","Damaged lead, plug or port","Scorching or discolouration"],
 wired:["No charging indication","Recognised intermittently","Accessory warning appears","Unusually slow charge indication"],
 stability:["Only charges while held at a particular angle","Charging stops during normal handling","Connector does not stay seated","Connection reliable only with pressure"],
 flip:["Works only after turning the plug over","Works only in the first orientation","Different behaviour between the two sides","Neither orientation works"],
 swap:["Works with the other lead","Works with a different power adapter","Still not charging with known-good accessories","No second charger to compare"],
 port:["Dark or stained contact on cable plug","Residue or wear on one side of cable tip","Visible pocket fluff in phone port","Port or lead visibly damaged"],
 wireless:["Wireless pad does not start charging","Wireless charging works but wired does not","Only charges in certain positions","No suitable pad available"],
 behaviour:["Charging pauses or stops unexpectedly","Optimised charging or charge limit active","Temperature warning","Battery percentage not increasing"]
});
function portType(model){if(!model)return "Charging connector not selected";return model.year>=2023?"USB-C":"Lightning";}
function makePlan(slug,cat){const model=cat?.getModel?.(slug)||null;
return{modelSlug:model?.slug||"",modelName:model?.name||"Not selected",
 connector:portType(model),steps:STEPS.map(s=>({...s}))};}
function addAnswer(old,id,value){if(!valid.has(id)||!outcomes.includes(value))throw Error("Invalid charging result");return{...(old||{}),[id]:value};}
function tally(plan,answers){const result={PASS:0,FAIL:0,UNABLE:0,UNANSWERED:0};
for(const step of plan.steps){const a=answers?.[step.id];result[outcomes.includes(a)?a:"UNANSWERED"]++;}return result;}
function interpretations(answers,selected={}){
 const findings=[],fail=id=>answers?.[id]==="FAIL",pass=id=>answers?.[id]==="PASS";
 const chosen=(id,label)=>Array.isArray(selected[id])&&selected[id].includes(label);
 if(fail("safety"))findings.push({title:"Safety issue: stop charging",detail:"Disconnect equipment and do not continue powered checks. Moisture, swelling, overheating and damaged leads/ports need cautious inspection. Never override a liquid alert just to complete a test."});
 if(fail("stability"))findings.push({title:"Position-dependent or intermittent connection",detail:"Customer reports charging dependent on plug position or connection stability. Suspect a worn or contaminated lead, debris or contact wear in the port. Compare a known-good lead and examine the disconnected connector and port; this is not a definitive component diagnosis."});
 if(fail("flip")&&(chosen("flip","Works only after turning the plug over")||chosen("flip","Works only in the first orientation")||chosen("flip","Different behaviour between the two sides")))
 findings.push({title:"Different charging response after reversing plug",detail:"Different results between connector orientations can indicate contamination or wear on cable contacts, or a charging-port contact issue. Compare another cable first; lead replacement or professional port inspection/service may be appropriate. The test does not identify any exact power or data pin."});
 else if(fail("flip"))findings.push({title:"Reversible cable test not successful",detail:"Charging did not behave reliably in both directions; this does not establish whether the lead, port, power adapter or device is at fault."});
 if(fail("port"))findings.push({title:"Cable contacts or port need visual inspection",detail:"Visible darkening or contamination on the disconnected lead tip may reduce contact quality; some ordinary discolouration can also occur with use. A damaged lead should be replaced. Any port cleaning or repair should be performed safely and professionally."});
 if(fail("wired")&&pass("swap"))findings.push({title:"Original charging accessories are suspect",detail:"A replacement lead/adapter worked while the first arrangement did not. Compare the original cable, adapter and socket before concluding the phone requires repair."});
 if(fail("wired")&&pass("wireless"))findings.push({title:"Wireless charging works; wired path needs review",detail:"A functioning wireless setup with failing wired charging is a useful clue, not proof of a faulty charging port. Compare known-good wired accessories and inspect the connector before considering internal hardware."});
 if(fail("wired")&&fail("swap"))findings.push({title:"Wired charging failed with multiple accessories",detail:"Further investigation may include cable fit, connector contamination, power supply, battery condition and charging circuitry. Only suitable technician equipment can isolate electrical faults."});
 if(fail("wireless")&&pass("wired"))findings.push({title:"Check wireless charging setup",detail:"Confirm the pad has power, supports the iPhone, and is aligned properly. Thick or unsuitable cases can interfere with the process."});
 if(fail("behaviour"))findings.push({title:"Charging interruptions need context",detail:"Check temperature, battery charging limits, optimised charging settings and iOS status before diagnosing a charging component fault."});
 return findings;
}
function report(plan,answers,symptoms){
 const n=tally(plan,answers);
 const lines=["iREPAIR TOOLBOX — CHARGING DIAGNOSTICS",
 "Report date: "+new Date().toLocaleString("en-GB"),
 "iPhone: "+plan.modelName+(plan.modelSlug?" (customer selected)":" (not identified)"),
 "Expected connector: "+plan.connector,
 "Results: "+n.PASS+" Pass / "+n.FAIL+" Fail / "+n.UNABLE+" Unable / "+n.UNANSWERED+" Not completed",
 "Method: all observations are manually confirmed; this Safari app does not measure charging voltage, charging current, USB/Lightning electrical contacts or actual battery charging state.",""];
 for(const s of plan.steps){
  lines.push(s.title+": "+(answers?.[s.id]||"UNANSWERED"));
  lines.push("  Basis: "+s.note);
  const chosen=Array.isArray(symptoms?.[s.id])?symptoms[s.id].filter(x=>symptomChoices[s.id].includes(x)):[];
  if(answers?.[s.id]==="FAIL"&&chosen.length)lines.push("  Customer observed: "+chosen.join("; "));
 }
 if(answers?.safety!=="PASS")lines.push("","SAFETY NOTE: No powered charging tests should proceed without a confirmed safe visual inspection.");
 const findings=interpretations(answers,symptoms);
 if(findings.length){lines.push("","TECHNICIAN CLUES — POSSIBILITIES, NOT CONFIRMED HARDWARE FAULTS");
 for(const f of findings)lines.push(f.title+": "+f.detail);}
 lines.push("","Connector note: Lightning and USB-C are reversible; power/data pin configurations differ, and the app does not identify individual electrical contacts.");
 lines.push("Privacy: customer observations remain on this page; no charging records are uploaded.");
 return lines.join("\n");
}
root.IRepairChargingCore=Object.freeze({steps:STEPS,symptomChoices,portType,makePlan,addAnswer,tally,interpretations,report});
})(typeof window!=="undefined"?window:globalThis);