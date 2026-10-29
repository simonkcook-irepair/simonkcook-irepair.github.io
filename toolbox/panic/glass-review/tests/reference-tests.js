/* Repeatable reviewed-reference regression tests. Run with Node.js. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const base=path.resolve(__dirname,"..");
const ctx={URL,Date};vm.runInNewContext(fs.readFileSync(path.join(base,"reference.js"),"utf8"),ctx);
vm.runInNewContext(fs.readFileSync(path.join(base,"core.js"),"utf8"),ctx);
const referenceModule=ctx.iRepairPanicReferences,core=ctx.iRepairPanicCore;
const raw=JSON.parse(fs.readFileSync(path.join(base,"..","reference-library","v1","latest.json"),"utf8"));
const lib=referenceModule.validate(raw);
let tests=0;
function ok(name,value){assert.ok(value,name);tests++;console.log("PASS:",name)}
ok("Reviewed version and sources",lib.version==="2026.10.26.1"&&lib.entries.length===3);
for(const word of ["i2c","ANS2","AppleSocHot"]){
 const hit=referenceModule.matches("panic(cpu 0): "+word+" communication failed",lib);
 ok("Curated identifier "+word,hit.length===1&&!!hit[0].source.url);
}
ok("Signature boundaries",referenceModule.matches("ANS2fake I2Cunrelated AppleSocHottest",lib).length===0);
const nonPanic=core.parse('{"last_value_CycleCount":129,"note":"ANS2"}');
ok("Ordinary analytics is not a panic",nonPanic.kind==="insufficient");
const panicText='{"product":"iPhone18,2","panicString":"panic(cpu 0): ANS2 Recoverable Panic"}';
ok("Match extracted panic signature only",referenceModule.matches(core.extractPanic(panicText),lib).length===1);
for(const data of [
 {...raw,schema:2},
 {...raw,reviewedDate:"2099-01-01"},
 {...raw,rules:[{...raw.rules[0],grade:"unverified"}]},
 {...raw,rules:[{...raw.rules[0],match:"(?=.*)"}]},
 {...raw,rules:[raw.rules[0],raw.rules[0]]},
 {...raw,sources:[{...raw.sources[0],url:"https://nottrusted.example/"}]}
]){
 assert.throws(()=>referenceModule.validate(data));
 tests++;
}
ok("Offline description is explicit",referenceModule.report(null,[]).includes("unavailable"));
ok("Source citation included in technician report",referenceModule.report(lib,referenceModule.matches("ANS2",lib)).includes("https://www.ifixit.com/"));
console.log("ALL",tests,"REFERENCE LIBRARY UNIT TESTS PASSED");
