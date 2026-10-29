/* Panic catalogue integration tests: models project from the shared iPhone master.
 * Run: node toolbox/panic/glass-review/tests/catalogue-tests.js
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,"..");
const master=require(path.resolve(__dirname,"../../../shared/iphone-models.json"));
const context={window:{},Date};
vm.runInNewContext(fs.readFileSync(path.join(dir,"models.js"),"utf8"),context);
vm.runInNewContext(fs.readFileSync(path.join(dir,"core.js"),"utf8"),context);
const catalogue=context.window.IRepairDeviceCatalogue,core=context.window.iRepairPanicCore;
const check=(name,callback)=>{callback();console.log("PASS "+name)};
check("Panic selector has all 40 shared model identities",()=>{
 assert.equal(catalogue.models.length,40);
 assert.deepEqual(Array.from(catalogue.models,m=>m.slug),master.models.map(m=>m.slug));
 for(const m of master.models)assert.equal(catalogue.getModel(m.slug).name,m.name,m.slug);
});
check("Current 2026 model names and order",()=>{
 assert.equal(catalogue.getModel("iphone-duo").name,"iPhone Duo");
 assert.ok(!/coming soon/i.test(catalogue.models.map(m=>m.name).join(" ")));
 assert.equal(Math.max(...catalogue.models.map(m=>m.year)),2026);
});
check("Existing known panic metadata maps to master models",()=>{
 for(const [device,slug] of [
  ["iPhone14,2","iphone-13-pro"],
  ["iPhone18,2","iphone-17-pro-max"],
  ["iPhone18,4","iphone-air"]
 ]){
  const p=core.parse(JSON.stringify({productType:device,panicString:"SMC PANIC - gas gauge"}));
  assert.equal(p.model.slug,slug);
  assert.equal(core.modelLabel(p,"",catalogue).name,catalogue.getModel(slug).name);
 }
});
check("Unknown hardware identifier is NOT guessed",()=>{
 const p=core.parse(JSON.stringify({productType:"iPhone99,99",panicString:"watchdog timeout"}));
 assert.equal(p.model.slug,null);
 assert.equal(core.modelLabel(p,"",catalogue).source,"Analytics identifier (name unverified)");
});
check("Contradictory model codes remain ambiguous",()=>{
 const p=core.parse(JSON.stringify({deviceModel:"iPhone14,2",productType:"iPhone18,2",panicString:"SMC PANIC"}));
 assert.equal(p.model.ambiguous,true);
 assert.equal(core.modelLabel(p,"",catalogue).name,"Conflicting identifiers");
});
check("User model choice remains explicit and higher priority",()=>{
 const p=core.parse(JSON.stringify({productType:"iPhone18,2",panicString:"AOP PANIC"}));
 const label=core.modelLabel(p,"iphone-duo",catalogue);
 assert.equal(label.name,"iPhone Duo");assert.equal(label.source,"Customer selection");
});
check("Misleading non-panic analytics never becomes a diagnostic verdict",()=>{
 const p=core.parse(JSON.stringify({productType:"iPhone18,2",note:"ordinary analytics"}));
 assert.equal(p.kind,"insufficient");assert.equal(p.hardwareConfirmed,false);
});
check("Panic report redacts personal log data",()=>{
 const p=core.parse(JSON.stringify({productType:"iPhone18,2",panicString:"SMC PANIC serial: TESTPRIVATE1234567 account: a@example.com"}));
 const report=core.report(p,core.modelLabel(p,"",catalogue));
 assert.ok(!report.includes("TESTPRIVATE1234567")&&!report.includes("a@example.com"));
 assert.ok(report.includes("not proof")||report.includes("not a"));
});
console.log("PANIC_SHARED_CATALOGUE_CHECKS_PASS");
