/* iRepair Toolbox Charging v5 — instrument preview controller.
 * IMPORTANT: all Safari values are explicitly SIMULATED; native APIs are not
 * reachable from this preview. The source cannot be promoted to "native".
 */
(function(){"use strict";
const $=id=>document.getElementById(id);
const engine=window.IRepairChargingMeters;
const catalogue=window.IRepairDeviceCatalogue;
if(!engine||!catalogue)throw new Error("Charging instruments were not loaded");
let current=engine.initial({percent:61,source:"simulated"}),reportString="";
let activeMode="wired";
let methodSessions={wired:null,wireless:null};
let wirelessSkipped=false;
function sessionFor(mode){
 const other=mode==="wireless"?"wired":"wireless";
 const prior=methodSessions[other];
 return methodSessions[mode]||engine.initial({percent:prior?.currentPercent??61,source:"simulated"});
}
function updateChoice(){
 const selected=catalogue.getModel($("phoneModel").value);
 const port=selected&&selected.year<2023?"lightning":"usb-c";
 $("chooseCharge").dataset.port=port;
 $("chooseCharge").dataset.front=selected?.front||"island";
 $("wiredChoiceStatus").textContent=methodSessions.wired?"Demo observations saved":"Ready to test";
 $("wirelessChoiceStatus").textContent=wirelessSkipped?"Skipped — not assessed":methodSessions.wireless?"Demo observations saved":"Ready to test";
 $("chooseWired").dataset.done=methodSessions.wired?"true":"false";
 $("chooseWireless").dataset.done=methodSessions.wireless?"true":"false";
 $("chooseWireless").dataset.skipped=wirelessSkipped?"true":"false";
 $("choiceReport").hidden=!methodSessions.wired&&!methodSessions.wireless;
 $("skipWireless").textContent=wirelessSkipped?"Wireless already skipped":"Skip wireless charging";
 $("skipWireless").disabled=wirelessSkipped;
 $("beginWired").textContent=methodSessions.wired?"Review Charging Lead Test →":"Begin Charging Lead Test →";
}
function chooseMode(mode){
 if(mode!=="wired"&&mode!=="wireless")throw new Error("Unsupported charging method");
 activeMode=mode;
 if(mode==="wireless")wirelessSkipped=false;
 current=sessionFor(mode);
 methodSessions[mode]=current;
 resetEnergy();
 $("activeTestEyebrow").textContent=mode==="wired"?"CHARGING LEAD TEST":"WIRELESS CHARGING TEST";
 $("activeTestDescription").textContent=mode==="wired"?"Connect your charging lead to the bottom of the iPhone. The Safari preview will demonstrate charging recognition.":"Position the iPhone on a compatible wireless charging pad. Safari cannot verify the charging method, so the selection is customer-declared.";
 $("completeMethod").textContent=mode==="wired"?"Finish Lead Test →":"Finish Wireless Test →";
 $("skipWirelessInTest").hidden=mode!=="wireless";
 show("instrument");update();
}
function completeMethod(){
 methodSessions[activeMode]=current;
 updateChoice();
 if(activeMode==="wired"&&!methodSessions.wireless&&!wirelessSkipped){
  show("chooseCharge");return;
 }
 if(activeMode==="wireless"&&!methodSessions.wired){
  show("chooseCharge");return;
 }
 renderReport();
}
function skipWirelessMethod(){
 wirelessSkipped=true;methodSessions.wireless=null;updateChoice();
 if(methodSessions.wired){renderReport();return;}
 show("chooseCharge");
}
function resetWorkflow(){
 methodSessions={wired:null,wireless:null};
 wirelessSkipped=false;activeMode="wired";
 current=engine.initial({percent:61,source:"simulated"});
 resetEnergy();updateChoice();
}

let energyWasConnected=false;
let energyOffTimer=null;
function stopEnergyShutdown(){
 if(energyOffTimer!==null){clearTimeout(energyOffTimer);energyOffTimer=null;}
}
function resetEnergy(){
 stopEnergyShutdown();energyWasConnected=false;
 $("instrument").dataset.energy="idle";
}
function setEnergyForPower(connected){
 const stage=$("instrument");
 if(connected&&!energyWasConnected){
  stopEnergyShutdown();
  stage.dataset.energy="connected";
 }else if(!connected&&energyWasConnected){
  // Sample precisely which LEDs were lit BEFORE their normal powered CSS
  // gets disconnected. Early unplug must not suddenly light the entire bar.
  const getStyle=typeof window.getComputedStyle==="function"?window.getComputedStyle.bind(window):null;
  if(getStyle){
   for(const lamp of $("meterCobTrack").children){
    const sample=getStyle(lamp,"::before").opacity;
    lamp.style.setProperty("--reverse-opacity",Number.isFinite(Number(sample))?String(Math.min(1,Math.max(0,Number(sample)))):"1");
   }
  }
  stage.dataset.energy="reversing";
  stopEnergyShutdown();
  energyOffTimer=setTimeout(()=>{
   energyOffTimer=null;
   if(!energyWasConnected&&stage.dataset.energy==="reversing"){
    stage.dataset.energy="idle";
   }
  },4200);
 }else if(!connected&&!stage.dataset.energy){
  stage.dataset.energy="idle";
 }
 energyWasConnected=connected;
}

const labels={notconfirmed:"Not confirmed",awaiting:"Waiting",charging:"Charging",full:"Full"};
function show(id){
 document.querySelectorAll(".view").forEach(node=>node.classList.toggle("active",node.id===id));
 try{window.scrollTo({top:0,behavior:"instant"})}catch(e){}
}
function fillModels(){
 const sel=$("phoneModel");
 for(const year of [...new Set(catalogue.models.map(m=>m.year))].sort((a,b)=>b-a)){
  const group=document.createElement("optgroup");group.label=year;
  for(const model of catalogue.models.filter(m=>m.year===year)){
   const opt=document.createElement("option");opt.value=model.slug;opt.textContent=model.name;group.append(opt);
  }
  sel.append(group);
 }
 const requested=new URLSearchParams(location.search).get("model");
 if(requested&&catalogue.getModel(requested))sel.value=catalogue.getModel(requested).slug;
}
function set(id,value){$(id).textContent=String(value)}
function cob(){
 const target=$("meterCobTrack");target.replaceChildren();
 for(let i=0;i<24;i++){
  const bar=document.createElement("span");bar.className="meterCobSegment";bar.style.setProperty("--index",String(i));bar.style.setProperty("--lamp-hue",String(Math.round(i*126/23)));bar.style.setProperty("--reverse-delay",(0.82+(23-i)*0.11).toFixed(3)+"s");
  target.append(bar);
 }
}
function update(){
 const summary=engine.summary(current);
 const percent=current.currentPercent;
 const dash=2*Math.PI*92;
 set("batteryPercent",percent);
 // InnerHTML is used only with a numeric percent from strict, validated local state.
 $("batteryPercent").innerHTML=String(percent)+'<em>%</em>';
 $("meterDial").setAttribute("aria-label","Simulated battery level "+percent+" percent");
 for(const id of ["meterDialProgress","meterDialGlow"]){
  $(id).style.strokeDasharray=dash.toFixed(3);
  $(id).style.strokeDashoffset=(dash*(1-percent/100)).toFixed(3);
 }
 $("meterLevelFill").style.width=percent+"%";
 $("meterLevelGlow").style.left=percent+"%";
 set("startingPercent",current.startedPercent+"%");
 const delta=current.currentPercent-current.startedPercent;
 set("batteryGain",delta===0?"—":(delta>0?"+":"")+delta+"%");
 $("batteryGain").classList.toggle("positive",delta>0);
 set("progressStatus",current.progressConfirmed?"Confirmed ✓":current.powerState==="full"&&percent===100?"Full battery":"Waiting for rise");
 set("batteryCaption",current.progressConfirmed?"Progress confirmed": "Current level");
 const power=current.powerState;
 $("meterBatteryPanel").dataset.power=power;
 $("instrument").dataset.power=power;
 $("meterBatteryPanel").dataset.progress=current.progressConfirmed?"confirmed":power==="charging"?"charging":"idle";
 const connected=summary.isConnected;
 setEnergyForPower(connected);
 const panel=$("connectionPanel");
 panel.dataset.power=power;panel.dataset.progress=current.progressConfirmed?"confirmed":"pending";panel.dataset.interruptions=String(current.interruptions);
 if(power==="charging"){
  set("connectionTitle","Charging recognised");
  set("connectionSubtitle",current.progressConfirmed?"iOS-style charging state and battery progress simulated.":"Connection detected. Watching for a genuine battery percentage rise.");
 }else if(power==="full"){
  set("connectionTitle","Battery fully charged");
  set("connectionSubtitle","At 100%, a further percentage rise is not expected.");
 }else{
  set("connectionTitle",current.interruptions?"Charging disconnected":"Waiting for charger");
  set("connectionSubtitle",current.interruptions?"An interruption was recorded in this demonstration.":"Connect power to begin the charging recognition check.");
 }
 const indicator=$("connectionIndicator");
 indicator.classList.toggle("on",connected);
 set("recognitionValue",current.chargeRecognised?"Recognised":"Not confirmed");
 set("interruptionValue",current.interruptions);
 $("meterCobTrack").setAttribute("aria-label",connected?"Decorative red-to-green charging connection sweep; power is recognised in this simulation, not measured as amps or watts":"Simulated charger not connected; connection meter inactive");
 $("simConnect").disabled=connected;
 $("simIncrease").disabled=!connected||percent>=100;
 $("simInterrupt").disabled=!connected;
 set("simConnect",connected?"Power connected":activeMode==="wireless"?"Simulate wireless power":"Simulate cable connection");
 const assess=$("meterAssessment");assess.classList.remove("passed","observed","waiting");
 if(current.progressConfirmed){
  assess.classList.add("passed");
  set("assessmentIcon","✓");
  set("assessmentTitle","Charge increase detected");
  set("assessmentDescription","Battery percentage rose while charging was reported. In native iOS, this would automatically pass charging progress.");
 }else if(current.interruptions>0&&!connected){
  assess.classList.add("observed");
  set("assessmentIcon","!");
  set("assessmentTitle","Interruption recorded");
  set("assessmentDescription","Charging state was lost. It will be recorded separately from battery progress in the report.");
 }else if(connected){
  assess.classList.add("waiting");
  set("assessmentIcon","ϟ");
  set("assessmentTitle","Charging recognised");
  set("assessmentDescription","Ready for automatic progress confirmation. No countdown or timeout is required.");
 }else{
  set("assessmentIcon","◌");
  set("assessmentTitle","Ready to observe");
  set("assessmentDescription","The native app will confirm progress automatically when charging is reported and the battery level genuinely rises.");
 }
 reportString=engine.report(current,{modelName:catalogue.getModel($("phoneModel").value)?.name||"Not selected"});
}
function transition(type,payload){
 current=engine.record(current,{type,...payload});update();
}
function addRow(label,value){
 const row=document.createElement("div");row.className="meterReportRow";
 const key=document.createElement("span");key.textContent=label;
 const val=document.createElement("strong");val.textContent=value;
 row.append(key,val);$("reportRows").append(row);
}
function renderReport(){
 if((activeMode==="wired"||activeMode==="wireless")&&!(activeMode==="wireless"&&wirelessSkipped))methodSessions[activeMode]=current;
 const summary=engine.summary(current);
 const name=catalogue.getModel($("phoneModel").value)?.name||"iPhone not selected";
 $("reportRows").replaceChildren();
 addRow("iPhone model",name);
 for(const mode of ["wired","wireless"]){
  const label=mode==="wired"?"Charging lead":"Wireless charging";
  const session=methodSessions[mode];
  if(mode==="wireless"&&wirelessSkipped){
   addRow(label,"SKIPPED — no charger available");
   continue;
  }
  if(!session){
   addRow(label,"NOT TESTED");
   continue;
  }
  const reading=engine.summary(session);
  addRow(label+" — recognition",session.chargeRecognised?"Simulated recognition":"Not yet confirmed");
  addRow(label+" — charge progress",session.progressConfirmed?"Demonstrated +"+reading.gainSinceConnection+"%":"Pending / not confirmed");
  addRow(label+" — interruption count",session.interruptions+" (simulated)");
 }
 addRow("Evidence type","Safari simulation — not real device evidence");
 set("reportHeading","Preview only — not a device Pass");
 set("reportSubheading",current.progressConfirmed?"The demo shows how a native automatic Pass would look. No real iPhone was measured.":"Charging progress has not been demonstrated yet. No real iPhone was measured.");
 set("copyMeterReport","Copy Preview Report");
 reportString=[
  "iREPAIR TOOLBOX — TWO-METHOD CHARGING REVIEW",
  "SAFARI SIMULATION ONLY — NO REAL HARDWARE RESULTS",
  "Model: "+name,
  ...["wired","wireless"].flatMap(mode=>{
   const label=mode==="wired"?"CHARGING LEAD":"WIRELESS CHARGING";
   const sample=methodSessions[mode];
   if(mode==="wireless"&&wirelessSkipped)return [label+": SKIPPED — NOT ASSESSED"];
   if(!sample)return [label+": NOT TESTED"];
   const reading=engine.summary(sample);
   return [label+": SIMULATED RECOGNITION "+(sample.chargeRecognised?"YES":"NO"),
    "Progress: "+(sample.progressConfirmed?"simulated +"+reading.gainSinceConnection+"%":"pending, no increase confirmed"),
    "Reported interruptions: "+sample.interruptions+" (simulated)"];
  }),
  "The charging method was selected by the user, not identified electronically.",
  "iOS provides charge state and battery level; it does not distinguish wired from wireless power using these public battery APIs.",
  "No actual current, watts, battery health, port integrity or charger technology measured.",
  "Wireless SKIPPED is never a Pass or a Fail.",
  "No user observations uploaded by this browser demonstration."
 ].join("\n");
 show("report");
}
async function copy(str){
 try{await navigator.clipboard.writeText(str);return true}catch(e){}
 const ta=document.createElement("textarea");ta.value=str;
 ta.style.cssText="position:fixed;left:-9999px";document.body.append(ta);ta.select();
 let worked=false;try{worked=document.execCommand("copy")}catch(e){}
 ta.remove();
 if(!worked)window.prompt("Copy the preview report",str);
 return worked;
}
$("begin").addEventListener("click",()=>show("setup"));
$("setupBack").addEventListener("click",()=>show("home"));
$("start").addEventListener("click",()=>{resetWorkflow();show("chooseCharge")});
$("chooseBack").addEventListener("click",()=>show("setup"));
$("beginWired").addEventListener("click",()=>chooseMode("wired"));
$("chooseWired").addEventListener("click",()=>chooseMode("wired"));
$("chooseWireless").addEventListener("click",()=>chooseMode("wireless"));
$("skipWireless").addEventListener("click",skipWirelessMethod);
$("choiceReport").addEventListener("click",renderReport);
$("completeMethod").addEventListener("click",completeMethod);
$("skipWirelessInTest").addEventListener("click",skipWirelessMethod);
$("instrumentBack").addEventListener("click",()=>{methodSessions[activeMode]=current;updateChoice();show("chooseCharge")});
$("simConnect").addEventListener("click",()=>transition("power",{powerState:"charging"}));
$("simIncrease").addEventListener("click",()=>{if(current.powerState==="charging"&&current.currentPercent<100)transition("level",{percent:current.currentPercent+1})});
$("simInterrupt").addEventListener("click",()=>transition("power",{powerState:"unplugged"}));
$("simReset").addEventListener("click",()=>{current=engine.initial({percent:61,source:"simulated"});resetEnergy();update()});
$("viewReport").addEventListener("click",renderReport);
$("backToMeters").addEventListener("click",()=>{resetEnergy();show("instrument");update()});
$("restartMeter").addEventListener("click",()=>{current=engine.initial({percent:61,source:"simulated"});resetEnergy();update();show("instrument")});
$("copyMeterReport").addEventListener("click",async()=>{if(await copy(reportString))set("copyMeterReport","Preview Copied ✓")});
$("shareMeterReport").addEventListener("click",async()=>{
 if(navigator.share){try{await navigator.share({title:"Charging Diagnostics — simulation",text:reportString});return}catch(err){if(err.name==="AbortError")return}}
 if(await copy(reportString))set("shareMeterReport","Preview Copied ✓");
});
$("printMeterReport").addEventListener("click",()=>window.print());
$("phoneModel").addEventListener("change",()=>{updateChoice();update()});
fillModels();cob();updateChoice();update();
})();