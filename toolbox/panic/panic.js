(function(){
"use strict";
const $=id=>document.getElementById(id);
const catalogue=window.IRepairDeviceCatalogue;
if(catalogue){for(const m of catalogue.models){const o=document.createElement("option");o.value=m.slug;o.textContent=m.name;$("model").appendChild(o);}}
const initial=new URLSearchParams(location.search).get("model");
if(initial&&catalogue&&catalogue.getModel(initial))$("model").value=initial;
let report="";
const safe=s=>String(s==null?"":s);
const normalize=s=>safe(s).replace(/\r/g,"").slice(0,1500000);
const compact=s=>safe(s).replace(/\s+/g," ").trim().slice(0,380);
function parse(raw){
 const text=normalize(raw);
 let panic="";
 try{
  const obj=JSON.parse(text);
  panic=obj.panicString||obj.panic_string||obj.panicstring||obj.panic||"";
  if(!panic&&obj.metadata)panic=obj.metadata.panicString||"";
 }catch(e){}
 if(!panic){
  const m=text.match(/(?:panicString|panic_string|panicstring)\s*["']?\s*[:=]\s*["']?([\s\S]{0,1800})/i);
  if(m)panic=m[1].split(/\n(?=["']?\w+["']?\s*:)/)[0];
 }
 const excerpt=compact(panic||text);
 const low=(panic||text).toLowerCase();
 const sensors=[];
 const sensorPatterns=[
  ["thermalmonitord","Thermal monitoring / missing sensor communication"],
  ["missing sensor(s)","Missing sensor communication"],
  ["missing sensors","Missing sensor communication"],
  ["mic1","MIC1 identifier"],
  ["mic2","MIC2 identifier"],
  ["mic3","MIC3 identifier"],
  ["prs0","PRS0 identifier"],
  ["tg0b","TG0B identifier"],
  ["tg0v","TG0V identifier"],
  ["gas gauge","Battery gas-gauge communication"],
  ["smc panic","System management controller panic"],
  ["aop panic","Always-on processor panic"],
  ["watchdog timeout","Watchdog timeout"],
  ["userspace watchdog","Userspace watchdog"]
 ];
 for(const [term,label] of sensorPatterns){if(low.includes(term))sensors.push(label);}
 const mentionsPanic=/panicstring|panic_string|panic-full|panic\(cpu|paniclog|panic log|thermalmonitord|smc panic|aop panic|watchdog timeout/i.test(text);
 const repeated=/thermalmonitord|missing sensor|watchdog timeout|smc panic/i.test(low);
 let title,flag,summary,next;
 if(!text.trim()){return {error:"Import or paste a panic log first."};}
 if(!mentionsPanic){title="No recognisable panic signature";flag="Insufficient evidence";summary="This text does not contain a recognised panic marker. Confirm that you selected a panic-full log, rather than an ordinary analytics record.";next="Open Settings → Privacy & Security → Analytics & Improvements → Analytics Data, then share the relevant panic-full record."; }
 else if(/thermalmonitord|missing sensor/i.test(low)){title="Sensor communication clue detected";flag="Peripheral investigation";summary="The log references thermal monitoring or missing sensor communication. On some iPhone models this pattern is associated with recurring watchdog reboots, but it does not uniquely identify the faulty assembly.";next="Confirm the exact iPhone model and complete panic string. Check repair history, connector seating, liquid indicators and the model-specific sensor-to-flex mapping before replacing parts. Do not assume charging-port, power-button or flash flex solely from a generic sensor token."; }
 else if(/smc panic/i.test(low)){title="System management panic clue";flag="Specialist investigation";summary="An SMC-related panic was detected. The underlying component cannot be established from this label alone.";next="Preserve the complete panic string and identify its sensor or bus references, then compare with verified model-specific repair cases."; }
 else if(/aop panic/i.test(low)){title="Always-on processor panic clue";flag="Specialist investigation";summary="An AOP-related panic was detected. This does not by itself prove a specific flex, sensor or logic-board failure.";next="Check the full panic context, connected peripherals and repeat occurrence before deciding on a repair pathway."; }
 else if(/watchdog/i.test(low)){title="Watchdog-related panic clue";flag="Further investigation";summary="A watchdog reference was found. Watchdogs can have different causes, including software and peripheral communication problems.";next="Look for a more specific process name, missing-sensor reference or error code in the complete panic string."; }
 else {title="Panic marker found";flag="Unclassified panic";summary="The text contains a panic reference, but no currently supported interpretation rule matched. The app will not invent a hardware diagnosis.";next="Keep the full panic string and investigate its exact panic family and model-specific context."; }
 return {title,flag,summary,next,excerpt,sensors,mentionsPanic,repeated};
}
function line(label,value){const box=document.createElement("div");box.className="line";const b=document.createElement("b");b.textContent=label;const p=document.createElement("p");p.textContent=value;box.append(b,p);$("details").appendChild(box);}
function analyse(){
 const m=catalogue&&catalogue.getModel($("model").value);
 const result=parse($("log").value);
 if(result.error){$("file-status").textContent=result.error;$("log").focus();return;}
 $("result-title").textContent=result.title;
 $("result-flag").textContent=result.flag;
 $("result-flag").className="flag"+(result.flag==="Insufficient evidence"?"":result.flag==="Specialist investigation"?" warn":"");
 $("details").replaceChildren();
 line("Device",m?m.name:"Model not selected — model-specific conclusions withheld");
 line("Interpretation",result.summary);
 if(result.sensors.length)line("Recognised tokens (not confirmed components)",[...new Set(result.sensors)].join(" · "));
 line("Suggested next step",result.next);
 line("Extracted signature (truncated)",result.excerpt||"No signature available");
 report=["iRepair Panic Diagnostics · Preliminary Report","Device: "+(m?m.name:"Unspecified"),"Finding: "+result.title,"Triage: "+result.flag,"Interpretation: "+result.summary,"Recognised tokens: "+(result.sensors.join(", ")||"None"),"Next: "+result.next,"Excerpt: "+result.excerpt,"Limitation: Log signature is not proof of a defective component. This tool does not access protected iOS analytics automatically.","Processed locally: "+new Date().toISOString()].join("\n");
 $("results").classList.add("show");$("results").scrollIntoView({behavior:"smooth",block:"start"});
}
$("analyse").addEventListener("click",analyse);
$("file").addEventListener("change",async e=>{
 const f=e.target.files&&e.target.files[0];if(!f)return;
 if(f.size>1500000){$("file-status").textContent="File exceeds the 1.5 MB local preview limit.";return;}
 try{$("log").value=await f.text();$("file-status").textContent="Loaded "+f.name+" · ready to analyse locally.";}catch(err){$("file-status").textContent="Unable to read this file. Try pasting its text.";}
});
$("copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(report);$("copy").textContent="✓ Report copied";setTimeout(()=>$("copy").textContent="Copy technician report",1800);}catch(e){$("copy").textContent="Copy unavailable — select report text";}});
$("reset").addEventListener("click",()=>{$("log").value="";$("file").value="";$("results").classList.remove("show");$("file-status").textContent="The log is processed on this device. Nothing is uploaded.";window.scrollTo({top:0,behavior:"smooth"});});
window.IRepairPanicParser={parse};
})();
