/* Generate model-name / drawing row copies from one authoritative JSON file.
 * Run: node toolbox/shared/sync-legacy-models.cjs --check
 * Or:  node toolbox/shared/sync-legacy-models.cjs --write
 * Never changes tests, component labels, meters or UI markup.
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../.."),catalogue=require("./iphone-models.json");
const targetFiles=["toolbox/audio/models.js","toolbox/camera/glass-review/models.js","toolbox/panic/glass-review/models.js","toolbox/motion/preview/models.js","toolbox/connectivity/preview/models.js"];
const columns=catalogue.models.map(m=>[m.slug,m.name,m.year,m.illustration.front,m.illustration.rear,m.illustration.heightMm,m.illustration.widthMm]);
const re=/const columns\s*=\s*\[[\s\S]*?\];\s*const models\s*=/;
const formatted="const columns = "+JSON.stringify(columns,null,1)+";\nconst models =";
const write=process.argv.includes("--write"),check=process.argv.includes("--check");
if(write===check)throw Error("Choose exactly one: --write or --check");
let errors=0;
for(const file of targetFiles){
 const full=path.join(root,file);
 if(!fs.existsSync(full)){console.log("MISSING_TARGET "+file);errors++;continue}
 const original=fs.readFileSync(full,"utf8");
 assert.ok(re.test(original),"Cannot locate model data in "+file);
 const projected=original.replace(re,formatted);
 if(projected!==original){if(write){fs.writeFileSync(full,projected);console.log("SYNCED "+file)}else{console.error("OUTDATED "+file);errors++}}
 else console.log("MATCH "+file);
}
if(errors)process.exitCode=1;else console.log("ALL_MODEL_PROJECTIONS_MATCH "+columns.length);
