/* Motion catalogue and sensor-evidence boundaries — intentionally no native claims.
 * node toolbox/motion/preview/tests/catalogue-tests.js
 */
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const canonical=require(path.resolve(__dirname,"../../../shared/iphone-models.json"));
const win={},context={window:win,Date};
for(const n of ["models.js","core.js"]){
 vm.runInNewContext(fs.readFileSync(path.join(root,n),"utf8"),context,{filename:n});
}
const cat=win.IRepairDeviceCatalogue,core=win.IRepairMotionCore;
let checks=0;
function check(label,fn){fn();checks++;console.log("PASS "+label)}
check("All 40 Motion models match the shared names and physical illustration rows",()=>{
 assert.equal(cat.models.length,canonical.models.length);
 for(let i=0;i<canonical.models.length;i++){
  const current=cat.models[i],expected=canonical.models[i];
  assert.equal(current.slug,expected.slug);
  assert.equal(current.name,expected.name);
  assert.equal(current.year,expected.year);
  assert.equal(current.front,expected.illustration.front);
  assert.equal(current.rear,expected.illustration.rear);
 }
});
check("Newer 2026 models are labelled correctly",()=>{
 for(const name of ["iPhone 18 Pro Max","iPhone Duo","iPhone 17e"]){
  assert.ok(cat.models.find(m=>m.name===name));
 }
 assert.ok(!cat.models.some(m=>/coming soon/i.test(m.name)));
});
check("Every catalogued handset receives the existing six honest checks",()=>{
 for(const model of canonical.models){
  const plan=core.createPlan(model.slug,cat);
  assert.equal(plan.modelName,model.name);
  assert.equal(plan.steps.map(s=>s.id).join(","),"accel,gyro,tilt,compass,haptics,proximity");
  assert.ok(plan.steps.every(s=>s.mode&&s.evidence));
 }
});
check("No button or biometric sensor test is falsely offered",()=>{
 const duo=core.createPlan("iphone-duo",cat);
 assert.equal(canonical.models.find(m=>m.slug==="iphone-duo").identity.authentication,"touch-id");
 assert.ok(!duo.steps.some(s=>/face.?id|touch.?id|side.?button|camera.?control|action.?button/i.test(s.id+" "+s.title)));
});
check("A failed/unsupported browser sensor doesn't create a fabricated result",()=>{
 const plan=core.createPlan("iphone-8",cat),totals=core.tally(plan,{});
 assert.equal(totals.PASS,0);assert.equal(totals.UNANSWERED,6);
 assert.ok(core.evidenceMethod(plan.steps[0],{counts:{acceleration:0}}).includes("No verified"));
});
check("Haptics and proximity stay explicitly customer-confirmed",()=>{
 const plan=core.createPlan("iphone-duo",cat);
 const h=plan.steps.find(x=>x.id==="haptics"),p=plan.steps.find(x=>x.id==="proximity");
 assert.equal(h.mode,"haptic-guided");assert.equal(p.mode,"system-guided");
 assert.ok(core.evidenceMethod(h,{}).includes("Customer"));
 assert.ok(core.evidenceMethod(p,{}).includes("Customer"));
});
check("Unknown model choice is never silently guessed",()=>{
 const plan=core.createPlan("iphone-nonexistent",cat);
 assert.equal(plan.modelSlug,"");assert.equal(plan.modelName,"Not selected");
});
check("All browser reports distinguish observation from measurement",()=>{
 const plan=core.createPlan("iphone-duo",cat);
 const report=core.report(plan,{}, {counts:{}},{});
 assert.ok(report.includes("chosen by the customer"));
 assert.ok(report.includes("not electrical")||report.includes("not an electrical")||report.includes("No verified acceleration"));
 assert.ok(report.includes("No sensor streams or biometric information uploaded"));
});
console.log("ALL "+checks+" MOTION_CATALOGUE_CHECKS_PASS");
