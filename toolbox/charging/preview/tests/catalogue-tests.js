/* Charging v11 signed-off visual baseline + shared model catalogue checks.
 * node toolbox/charging/preview/tests/catalogue-tests.js
 * Run alongside meter-tests.js — this must not mutate any v11 visuals.
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const dir=path.resolve(__dirname,".."),manifest=require(path.resolve(__dirname,"../../../shared/iphone-models.json")),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(dir,"models.js"),"utf8"),ctx);
const cat=ctx.window.IRepairDeviceCatalogue;
let count=0;
function check(name,fn){fn();count++;console.log("PASS "+name)}
check("All 40 models match the shared source exactly",()=>{
 assert.equal(cat.models.length,manifest.models.length);assert.equal(cat.models.length,40);
 assert.equal(new Set(cat.models.map(m=>m.slug)).size,40);
 for(let i=0;i<manifest.models.length;i++){
  const m=cat.models[i],expected=manifest.models[i];
  assert.equal(m.slug,expected.slug);assert.equal(m.name,expected.name);assert.equal(m.year,expected.year);
  assert.equal(m.front,expected.illustration.front);assert.equal(m.rear,expected.illustration.rear);
 }
});
check("Current models including iPhone Duo are accurately labelled",()=>{
 for(const [slug,name] of [["iphone-duo","iPhone Duo"],["iphone-18-pro-max","iPhone 18 Pro Max"],["iphone-17e","iPhone 17e"]]){
  assert.equal(cat.getModel(slug)?.name,name);
 }
 assert.ok(!cat.models.some(m=>/coming soon/i.test(m.name)));
});
check("Legacy Lightning and newer USB-C guidance stays unchanged",()=>{
 const old=cat.models.filter(m=>m.year<2023),newer=cat.models.filter(m=>m.year>=2023);
 assert.ok(old.length>0&&newer.length>0);
 for(const m of old)assert.equal(manifest.models.find(x=>x.slug===m.slug)?.identity.connector,"lightning",m.slug);
 for(const m of newer)assert.equal(manifest.models.find(x=>x.slug===m.slug)?.identity.connector,"usb-c",m.slug);
 const app=fs.readFileSync(path.join(dir,"meter-app.js"),"utf8");
 assert.ok(app.includes('selected&&selected.year<2023?"lightning":"usb-c"'));
});
check("Device metadata never claims verified wireless method or charger power",()=>{
 assert.ok(manifest.evidencePolicy.wirelessCharging);
 const app=fs.readFileSync(path.join(dir,"meter-app.js"),"utf8");
 assert.ok(app.includes("No actual current, watts, battery health"));
 assert.ok(app.includes("it does not distinguish wired from wireless"));
});
check("Customer-facing v11 sign-off, animations, artwork unchanged",()=>{
 const files={
 "index.html":"35abab223e301cc7783da3f9a182effa2337c5a7",
 "full-body.css":"4122ab0f6ee348525a9c8828565ae884956fe0e4",
 "assets/iphone-identical.webp":"4bba79bdb62607abac6e3cb2eed008cada744f61",
 "assets/apple-style-usbc.webp":"07dc53d6362c3a1f6de513491cae7c7557e32d5d",
 "assets/wireless-pad.webp":"ad015dec9223f1132b1fc315ec1bfc379f711635",
 "meter-app.js":"e09f38260d3cd22cd37ab3c4798192400c981dfb",
 "meter-core.js":"118e147cbc3acc8ce1f5129247328a33c56abd5f",
 "visual.css":"e21f4055130a59c1e8273e114da17f92103689ec",
 "meter.css":"f5778ee6c13fc6c86bdb12d5567ee1c95f5abf67",
 "energy.css":"02436b25a6f2490732708091b2f36544cf291815"
 };
 for(const [file,expectedSha] of Object.entries(files)){
  const data=fs.readFileSync(path.join(dir,file));
  const got=crypto.createHash("sha1").update("blob "+data.length+"\\0").update(data).digest("hex");
  assert.equal(got,expectedSha,"Approved prototype asset was unexpectedly modified: "+file);
 }
});
check("Browser still distinguishes simulated readings from physical battery measurements",()=>{
 const html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 assert.ok(html.includes('charging-glass-review-11-full-handset-single-landing'));
 assert.ok(html.includes('full-body.css?v=charge-review-11-complete-handset'));
 const app=fs.readFileSync(path.join(dir,"meter-app.js"),"utf8");
 assert.ok(app.includes('source:"simulated"'));
});
console.log("ALL "+count+" CHARGING_CATALOGUE_CHECKS_PASSED");
