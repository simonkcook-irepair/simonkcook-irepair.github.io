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
  const bar=document.createElement("span");bar.className="meterCobSegment";bar.style.setProperty("--index",String(i));bar.style.setProperty("--lamp-hue",String(Math.round(i*126/23)));
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
 set("simConnect",connected?"Power connected":"Simulate power connection");
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
 const summary=engine.summary(current);
 const name=catalogue.getModel($("phoneModel").value)?.name||"iPhone not selected";
 $("reportRows").replaceChildren();
 addRow("iPhone model",name);
 addRow("Initial charge level",current.startedPercent+"% (simulated)");
 addRow("Final charge level",current.currentPercent+"% (simulated)");
 addRow("Reported charging",current.chargeRecognised?"Detected in demo":"Not detected in demo");
 addRow("Charge increase",current.progressConfirmed?"Simulated +"+summary.gainSinceStart+"%":"Not confirmed");
 addRow("Connection interruptions",current.interruptions+" (simulated)");
 addRow("Evidence type","Simulation — no hardware reading");
 set("reportHeading","Preview only — not a device Pass");
 set("reportSubheading",current.progressConfirmed?"The demo shows how a native automatic Pass would look. No real iPhone was measured.":"Charging progress has not been demonstrated yet. No real iPhone was measured.");
 set("copyMeterReport","Copy Preview Report");
 reportString=engine.report(current,{modelName:name});
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
$("start").addEventListener("click",()=>{current=engine.initial({percent:61,source:"simulated"});show("instrument");update()});
$("instrumentBack").addEventListener("click",()=>show("setup"));
$("simConnect").addEventListener("click",()=>transition("power",{powerState:"charging"}));
$("simIncrease").addEventListener("click",()=>{if(current.powerState==="charging"&&current.currentPercent<100)transition("level",{percent:current.currentPercent+1})});
$("simInterrupt").addEventListener("click",()=>transition("power",{powerState:"unplugged"}));
$("simReset").addEventListener("click",()=>{current=engine.initial({percent:61,source:"simulated"});update()});
$("viewReport").addEventListener("click",renderReport);
$("backToMeters").addEventListener("click",()=>show("instrument"));
$("restartMeter").addEventListener("click",()=>{current=engine.initial({percent:61,source:"simulated"});update();show("instrument")});
$("copyMeterReport").addEventListener("click",async()=>{if(await copy(reportString))set("copyMeterReport","Preview Copied ✓")});
$("shareMeterReport").addEventListener("click",async()=>{
 if(navigator.share){try{await navigator.share({title:"Charging Diagnostics — simulation",text:reportString});return}catch(err){if(err.name==="AbortError")return}}
 if(await copy(reportString))set("shareMeterReport","Preview Copied ✓");
});
$("printMeterReport").addEventListener("click",()=>window.print());
$("phoneModel").addEventListener("change",update);
fillModels();cob();update();
})();