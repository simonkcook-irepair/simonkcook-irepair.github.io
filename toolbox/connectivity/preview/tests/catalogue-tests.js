/* Connectivity model source and honest-evidence integration checks.
 * node toolbox/connectivity/preview/tests/catalogue-tests.js
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,".."),catalogue=require(path.resolve(__dirname,"../../../shared/iphone-models.json")),context={window:{},Date};
for(const name of ["models.js","core.js"])vm.runInNewContext(fs.readFileSync(path.join(dir,name),"utf8"),context,{filename:name});
const cat=context.window.IRepairDeviceCatalogue,core=context.window.IRepairConnectivityCore;
let tests=0;
function check(name,fn){fn();tests++;console.log("PASS "+name)}
check("All 40 model identities and illustration types match canonical shared catalogue",()=>{
 assert.equal(cat.models.length,40);
 assert.equal(new Set(cat.models.map(m=>m.slug)).size,40);
 for(const [i,expected] of catalogue.models.entries()){
  const actual=cat.models[i];assert.equal(actual.slug,expected.slug);assert.equal(actual.name,expected.name);
  assert.equal(actual.year,expected.year);assert.equal(actual.front,expected.illustration.front);
  assert.equal(actual.rear,expected.illustration.rear);
 }
});
check("Current iPhone names including Duo do not advertise unreleased devices",()=>{
 assert.equal(cat.getModel("iphone-duo").name,"iPhone Duo");
 assert.equal(cat.getModel("iphone-18-pro-max").name,"iPhone 18 Pro Max");
 assert.ok(!cat.models.some(m=>/coming soon/i.test(m.name)));
});
check("All models retain the same six appropriate connectivity checks",()=>{
 for(const m of catalogue.models){
  const plan=core.createPlan(m.slug,cat);
  assert.equal(plan.modelName,m.name);
  assert.equal(plan.steps.map(s=>s.id).join(","),"internet,wifi,cellular,bluetooth,location,airdrop");
 }
});
check("Browser route checks never claim to identify cellular vs Wi-Fi hardware",()=>{
 const p=core.createPlan("iphone-duo",cat),wifi=p.steps.find(s=>s.id==="wifi"),cell=p.steps.find(s=>s.id==="cellular");
 for(const step of [wifi,cell]){
  assert.equal(step.mode,"manual-probe");
  assert.equal(core.canConfirmPass(step,{[step.id]:{status:"reached",elapsedMs:28}},{}),false);
  assert.equal(core.canConfirmPass(step,{[step.id]:{status:"reached",elapsedMs:28}},{[step.id]:true}),true);
  assert.ok(core.evidenceLine(step,{[step.id]:{status:"reached",elapsedMs:28}}).includes("NOT independently verified"));
 }
});
check("Bluetooth and AirDrop remain explicitly customer guided",()=>{
 const p=core.createPlan("iphone-17e",cat);assert.equal(p.steps.find(s=>s.id==="bluetooth").mode,"guided");
 assert.equal(p.steps.find(s=>s.id==="airdrop").mode,"guided");
});
check("Location sample does not assert GPS receiver functionality",()=>{
 const p=core.createPlan("iphone-18-pro",cat);
 const step=p.steps.find(s=>s.id==="location"),line=core.evidenceLine(step,{location:{status:"received",accuracy:14}});
 assert.ok(line.includes("NOT proof of GPS sensor health"));
});
check("No unsupported features asserted by model selection",()=>{
 const p=core.createPlan("iphone-duo",cat);
 assert.ok(!p.steps.some(s=>/face.?id|lidar|ultra.?wide/i.test(s.id+" "+s.title)));
});
check("Unidentified phone never appears identified or automatically passing",()=>{
 const p=core.createPlan("not-real",cat);assert.equal(p.modelName,"Not selected");
 assert.equal(p.modelSlug,"");assert.equal(core.tally(p,{}).PASS,0);
});
check("Report preserves limitations, manual provenance and privacy",()=>{
 const plan=core.createPlan("iphone-duo",cat);
 const report=core.report(plan,{internet:"PASS",wifi:"UNABLE",location:"FAIL"},{
 internet:{status:"reached",elapsedMs:52},location:{status:"failed"}},{wifi:false},{});
 assert.ok(report.includes("iPhone Duo (customer selected)"));
 assert.ok(report.includes("cannot isolate individual radios"));
 assert.ok(report.includes("Customer confirmation is separate"));
 assert.ok(report.includes("Exact coordinates are not displayed"));
});
console.log("ALL "+tests+" CONNECTIVITY_CATALOGUE_TESTS_PASS");
