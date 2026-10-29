"use strict";
// Model-specific camera guide QA. This checks ILLUSTRATED physical lens
// locations, not whether iOS actually selected a particular video sensor.
// Run: node toolbox/camera/v11-visual-review/tests/lens-position-tests.cjs
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.resolve(__dirname,"../models.js"),"utf8");
const ctx={window:{}};vm.runInNewContext(source,ctx);
const cat=ctx.window.IRepairDeviceCatalogue;
function getRing(slug,focus){
 const element={id:"camera-lens-map-test",dataset:{},setAttribute(){},classList:{toggle(){}},innerHTML:""};
 cat.render(element,slug,"rear",focus);
 const m=element.innerHTML.match(/<circle class="cameraGuideRing" cx="([\d.]+)" cy="([\d.]+)"/);
 return{status:element.dataset.opticalPosition,model:element.dataset.model,point:m?{x:Number(m[1]),y:Number(m[2])}:null,ringCount:(element.innerHTML.match(/class="cameraGuideRing"/g)||[]).length};
}
let count=0;const test=(name,fn)=>{fn();count++;console.log("PASS "+name)};
for(const slug of ["iphone-17-pro","iphone-17-pro-max","iphone-18-pro","iphone-18-pro-max"]){
 test(slug+" upper-left Ultra Wide, lower-left Main, centre-right Telephoto",()=>{
  const ultra=getRing(slug,"ultra"),main=getRing(slug,"wide"),tele=getRing(slug,"tele");
  assert.equal(ultra.status,"checked");assert.equal(main.status,"checked");assert.equal(tele.status,"checked");
  for(const item of [ultra,main,tele])assert.equal(item.ringCount,1);
  assert.equal(ultra.point.x,main.point.x,"Wide and Ultra Wide must occupy LEFT column");
  assert.ok(ultra.point.y<main.point.y,"Ultra Wide must be ABOVE Main");
  assert.ok(tele.point.x>main.point.x,"Telephoto must be to the RIGHT");
  assert.ok(ultra.point.y<tele.point.y&&tele.point.y<main.point.y,"Telephoto must sit between them vertically");
 });
}
test("Generic iPhone 16 Pro is not assigned an unverified individual lens position",()=>{
 const r=getRing("iphone-16-pro","ultra");assert.equal(r.status,"group");assert.equal(r.ringCount,3);
});
test("Lens selection cannot be confused with LiDAR or flash",()=>{
 const a=getRing("iphone-18-pro-max","lidarScanner"),b=getRing("iphone-18-pro-max","flashLed");
 assert.equal(a.status,"lidar");assert.equal(b.status,"flash");
});
test("All three optical sensors exist on both 18 Pro models",()=>{
 for(const slug of ["iphone-18-pro","iphone-18-pro-max"]){
  const m=cat.getModel(slug);assert.equal(m.rear,"plateau-triple");
 }
});
console.log("LENS_MAP_PASS "+count+" model-specific checks");
