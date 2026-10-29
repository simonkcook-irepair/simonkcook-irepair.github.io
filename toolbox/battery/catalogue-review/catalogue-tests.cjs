/* Battery integration: shared model catalogue, evidence provenance, and privacy.
 * node toolbox/battery/catalogue-review/catalogue-tests.cjs
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const here=__dirname,master=require(path.resolve(here,"../../shared/iphone-models.json")),cx={window:{}};
for(const f of ["models.js","core.js"])vm.runInNewContext(fs.readFileSync(path.join(here,f),"utf8"),cx,{filename:f});
const cat=cx.window.IRepairDeviceCatalogue,core=cx.window.iRepairBatteryCore;
let passes=0;function check(s,fn){fn();passes++;console.log("PASS "+s)}
check("Battery's model metadata exactly matches all 40 shared models",()=>{
 assert.equal(cat.models.length,40);
 for(let i=0;i<40;i++){const a=cat.models[i],b=master.models[i];assert.equal(a.slug,b.slug);assert.equal(a.name,b.name);assert.equal(a.year,b.year);assert.equal(a.front,b.illustration.front);assert.equal(a.rear,b.illustration.rear);}
});
check("Current iPhones correctly named, no unreleased label",()=>{
 assert.equal(cat.getModel("iphone-duo").name,"iPhone Duo");
 assert.equal(cat.getModel("iphone-18-pro-max").name,"iPhone 18 Pro Max");
 assert.ok(!cat.models.some(m=>/coming soon/i.test(m.name)));
});
check("Known imported hardware model identifier resolves from the catalogue",()=>{
 const log=core.parseAnalytics('{"productType":"iPhone18,2","last_value_CycleCount":132}');
 assert.equal(log.model.name,cat.getModel("iphone-17-pro-max").name);
});
check("Browser customer model selection works without uploading a log",()=>{
 const chosen=cat.getModel("iphone-13-pro");
 const result=core.assess({selectedModel:chosen,serviceStatus:"unknown"});
 assert.equal(result.model.name,"iPhone 13 Pro");assert.equal(result.modelSource,"Customer selection (not independently verified)");
 assert.equal(result.capacity,null);assert.equal(result.cycles,null);
 assert.ok(core.report(result).includes("Model source: Customer selection"));
 assert.ok(!core.report(result).includes("(null)"));
});
check("Imported analytics is weaker model evidence than a customer declaration",()=>{
 const log=core.parseAnalytics('{"productType":"iPhone18,2","last_value_CycleCount":132}');
 const result=core.assess({analytics:log,selectedModel:cat.getModel("iphone-13-pro"),serviceStatus:"unknown"});
 assert.equal(result.model.name,"iPhone 13 Pro");assert.equal(result.modelMismatch,true);
 assert.ok(core.report(result).includes("Model identifier disagreement"));
 assert.equal(result.cycles,132);assert.equal(result.capacity,null);
});
check("Native device identity wins when its identifier is recognised",()=>{
 const result=core.assess({native:{source:"ios-native",modelIdentifier:"iPhone18,2",chargePercent:64,chargingState:"charging",iosVersion:"26.7"},selectedModel:cat.getModel("iphone-13-pro")});
 assert.equal(result.model.name,"iPhone 17 Pro Max");
 assert.equal(result.modelSource,"Native iOS device identifier");assert.equal(result.modelMismatch,true);
 assert.equal(result.native.chargePercent,64);
});
check("iPhone Duo cannot pass both separate batteries from one analytics reading",()=>{
 const a=core.assess({selectedModel:cat.getModel("iphone-duo"),capacity:92,capacitySource:"manual",serviceStatus:"normal"});
 assert.ok(a.explanation.includes("two batteries"));
 assert.ok(core.report(a).includes("iPhone Duo"));
});
check("No battery health invented from a model selection or a cycle reading",()=>{
 const data=core.parseAnalytics('{"last_value_CycleCount":244,"deviceId":"PRIVATESECRETS222"}');
 const a=core.assess({analytics:data,selectedModel:cat.getModel("iphone-duo"),serviceStatus:"unknown"});
 assert.equal(a.capacity,null);assert.equal(a.level,"partial");
 const text=core.report(a);assert.ok(text.includes("Maximum capacity:")||text.includes("Battery Health maximum capacity:"));
 assert.ok(!text.includes("PRIVATESECRETS222"));assert.ok(!text.includes("Charge cycles: 244 (native"));
});
check("Health and charging readouts remain constrained to their real evidence",()=>{
 const a=core.assess({selectedModel:cat.getModel("iphone-15"),capacity:85,capacitySource:"manual",serviceStatus:"normal"});
 assert.equal(a.capacitySource,"Customer-entered iOS Battery Health");
 assert.equal(a.native,null);assert.equal(a.cycles,null);
 assert.ok(core.report(a).includes("Browser does not independently access battery health"));
});
check("The customer-facing UI keeps the approved interface and lightweight optional selection",()=>{
 const html=fs.readFileSync(path.join(here,"index.html"),"utf8"),js=fs.readFileSync(path.join(here,"engine.js"),"utf8");
 assert.ok(html.includes('data-build="battery-native-ready-v1"'));
 for(const id of ["begin","analyticsFile","noFile","healthPercent","batteryStatus","copyReport","printReport","batteryModel"])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.indexOf('src="./models.js')<html.indexOf('src="./core.js'));
 assert.ok(js.includes('selectedModel:selectedModel()'));
 assert.ok(html.includes("Safari cannot identify the exact iPhone model"));
});
console.log("ALL "+passes+" BATTERY_SHARED_CATALOGUE_CHECKS_PASSED");
