/* iRepair Camera Diagnostics pure plan and report regression tests.
 * Run: node toolbox/camera/glass-review/tests/core-tests.js */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const c={window:{},Date};
vm.runInNewContext(fs.readFileSync(path.join(root,"models.js"),"utf8"),c);
vm.runInNewContext(fs.readFileSync(path.join(root,"core.js"),"utf8"),c);
const models=c.window.IRepairDeviceCatalogue,engine=c.window.iRepairCameraCore;
let n=0;function check(message,cond){assert.ok(cond,message);console.log("PASS",message);n++}
check("Known latest iPhone families",models.getModel("iphone-18-pro-max")?.year===2026);
const unknown=engine.createPlan("",models);
check("Unknown model has safe base plan",unknown.steps.map(s=>s.id).join(",")==="rear,focus,front,flash");
check("Unknown model does not invent additional cameras",!unknown.lenses.ultra&&!unknown.lenses.tele);
const pro=engine.createPlan("iphone-17-pro-max",models);
check("Triple rear camera plan",pro.steps.map(s=>s.id).join(",")==="rear,focus,ultra,tele,front,flash");
check("Single rear camera iPhone Air",engine.createPlan("iphone-air",models).steps.length===4);
check("Single rear camera iPhone 17e",engine.createPlan("iphone-17e",models).steps.length===4);
check("iPhone Duo main+ultrawide",engine.createPlan("iphone-duo",models).lenses.ultra&&!engine.createPlan("iphone-duo",models).lenses.tele);
check("Dual 2025 iPhone ultra wide",engine.createPlan("iphone-17",models).lenses.ultra&&!engine.createPlan("iphone-17",models).lenses.tele);
check("iPhone 8 Plus telephoto not ultra wide",engine.createPlan("iphone-8-plus",models).lenses.tele&&!engine.createPlan("iphone-8-plus",models).lenses.ultra);
check("iPhone X telephoto",engine.createPlan("iphone-x",models).lenses.tele);
check("iPhone XR single camera",engine.createPlan("iphone-xr",models).steps.length===4);
check("iPhone 11 ultra wide",engine.createPlan("iphone-11",models).lenses.ultra);
check("iPhone 11 Pro triple",engine.createPlan("iphone-11-pro",models).lenses.ultra&&engine.createPlan("iphone-11-pro",models).lenses.tele);
let answers={};
for(const s of pro.steps)answers=engine.setAnswer(answers,s.id,s.id==="tele"?"FAIL":s.id==="ultra"?"UNABLE":"PASS");
const count=engine.tally(pro.steps,answers);
check("Pass Fail Unable totals",count.PASS===4&&count.FAIL===1&&count.UNABLE===1&&count.UNANSWERED===0);
check("Unanswered never silently passes",engine.tally(pro.steps,{}).UNANSWERED===6);
assert.throws(()=>engine.setAnswer({},"unsupported-hardware","PASS"));n++;
assert.throws(()=>engine.setAnswer({},"rear","AUTOPASS"));n++;
const text=engine.report(pro,answers,{flashTorchUsed:true});
check("Cautious physical lens provenance",text.includes("physical lens not independently verified"));
check("No invented hardware measurement",text.includes("Guided visual observation"));
check("Source model and results preserved",text.includes("iPhone 17 Pro Max")&&text.includes("Telephoto lens: FAIL"));
check("Camera images excluded from report",text.includes("no photos uploaded or stored"));
console.log("ALL",n,"CAMERA CORE TESTS PASSED");