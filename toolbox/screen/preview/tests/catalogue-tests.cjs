/* Screen & Touch: shared model integrity and truthful dual-display reporting.
 * node toolbox/screen/preview/tests/catalogue-tests.cjs
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,".."),master=require(path.resolve(__dirname,"../../../shared/iphone-models.json"));
const html=fs.readFileSync(path.join(dir,"index.html"),"utf8"),models=fs.readFileSync(path.join(dir,"models.js"),"utf8");
const scope={window:{}};vm.runInNewContext(models,scope);
const cat=scope.window.IRepairDeviceCatalogue;
let passed=0;function check(name,fn){fn();passed++;console.log("PASS "+name)}
check("All 40 iPhone models and drawing metadata match the canonical master",()=>{
 assert.equal(cat.models.length,40);
 for(let i=0;i<40;i++){const a=cat.models[i],b=master.models[i];assert.equal(a.slug,b.slug);assert.equal(a.name,b.name);assert.equal(a.year,b.year);assert.equal(a.front,b.illustration.front);assert.equal(a.rear,b.illustration.rear)}
});
check("Current Duo and 18 Pro Max appear without obsolete model labels",()=>{
 assert.equal(cat.getModel("iphone-duo").name,"iPhone Duo");
 assert.equal(cat.getModel("iphone-18-pro-max").name,"iPhone 18 Pro Max");
 assert.ok(!cat.models.some(m=>/coming soon/i.test(m.name)));
});
check("No implicit Safari device identification or automatic display verdict",()=>{
 assert.match(html,/Safari cannot automatically confirm/);
 assert.match(html,/selected by you, not independently verified/);
 assert.doesNotMatch(html,/(navigator\.userAgent|window\.screen\.width).*iphone-/i);
});
check("Duo requires customer choice of one screen and other stays untested",()=>{
 assert.match(html,/id="displaySurface"/);
 assert.match(html,/Outer display/);assert.match(html,/Inner display/);
 assert.match(html,/Other display','NOT TESTED — separate assessment required/);
 assert.match(html,/cannot certify both displays/);
 assert.equal(master.models.find(m=>m.slug==="iphone-duo").identity.displaySurfaces.length,2);
});
check("Original approved eight display patterns and full-screen toggle preserved",()=>{
 assert.equal((html.match(/\{name:'(White|Black|Red|Green|Blue|RGB bands|Vertical colour lines|Horizontal colour lines)'/g)||[]).length,8);
 assert.match(html,/View in full screen mode/);assert.match(html,/displayUnobstructed/);
});
check("Original nine touch spots and accessible finish-at-working-point preserved",()=>{
 assert.match(html,/for\(let i=0;i<9;i\+\+\)/);
 assert.match(html,/tap FINISH HERE on a working number/);
 assert.match(html,/const r=d\.getBoundingClientRect\(\)/);
});
check("Original full-viewport coverage remains based on sampled events only",()=>{
 assert.match(html,/const COLS=12,ROWS=22,TOTAL=COLS\*ROWS/);
 assert.match(html,/function markEvent\(e\)/);
 assert.match(html,/getCoalescedEvents/);
 assert.match(html,/Never interpolate or invent touch positions/);
 assert.match(html,/results\.coverage=percent>=92&&cornerCount===4\?'PASS':'INCOMPLETE'/);
});
check("Original illuminated perimeter traversal and fallback preserved",()=>{
 assert.match(html,/function startEdge\(\)/);
 assert.match(html,/const N=900,len=path\.getTotalLength\(\),samples=\[\]/);
 assert.match(html,/mask\.setAttribute\('stroke-dasharray','100 100'\)/);
 assert.match(html,/fail\.onclick=e=>/);assert.match(html,/core\.onclick=e=>/);
});
check("Unchanged approved build marker and direct model script order",()=>{
 assert.match(html,/data-build="coverage-lab-evidence-v2-2026-10-24"/);
 assert.ok(html.indexOf('src="./models.js?v=screen-shared-models-1"')<html.indexOf("const catalogue=window.IRepairDeviceCatalogue"));
});
check("Reports distinguish browser viewport, customer observation and other Duo display",()=>{
 assert.match(html,/Display assessed: /);
 assert.match(html,/Other iPhone Duo display: NOT TESTED/);
 assert.match(html,/Scope: browser viewport only/);
 assert.match(html,/Cells not reached are untested/);
});
console.log("SCREEN_SHARED_MODEL_CHECKS_PASSED "+passed);
