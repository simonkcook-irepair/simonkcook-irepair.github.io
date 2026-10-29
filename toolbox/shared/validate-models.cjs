/* Offline hardware catalogue audit. Run: node toolbox/shared/validate-models.cjs */
"use strict";
const assert=require("node:assert/strict");
const data=require("./iphone-models.json");
const models=data.models;
const bySlug=new Map(models.map(m=>[m.slug,m]));
const check=(name,test)=>{test();console.log("PASS "+name)};
check("40 distinct Apple-published iPhone models",()=>{assert.equal(models.length,40);assert.equal(bySlug.size,40)});
check("Every model has a stable name, year and drawing geometry",()=>{
 for(const m of models){assert.match(m.slug,/^iphone-(?:[a-z0-9-]+)$/);assert.ok(m.name.startsWith("iPhone"));assert.ok(!/coming soon/i.test(m.name));assert.ok(m.year>=2017&&m.year<=2026);assert.ok(m.illustration.widthMm>0&&m.illustration.heightMm>0)}
});
check("Model-specific USB-C or Lightning connectors",()=>{
 for(const m of models)assert.equal(m.identity.connector,m.year>=2023?"usb-c":"lightning",m.slug);
});
check("Touch ID and Face ID are mutually exclusive",()=>{
 for(const m of models)assert.ok(["touch-id","face-id"].includes(m.identity.authentication));
 assert.equal(bySlug.get("iphone-duo").identity.authentication,"touch-id");
 assert.equal(bySlug.get("iphone-8-plus").identity.authentication,"touch-id");
 assert.equal(bySlug.get("iphone-17e").identity.authentication,"face-id");
});
check("iPhone Duo: two screens, two battery packs, both front cameras",()=>{
 const d=bySlug.get("iphone-duo");
 assert.deepEqual(d.identity.displaySurfaces,["outer","inner"]);assert.equal(d.identity.batteryPackCount,2);
 assert.deepEqual(d.cameras.frontCameras,["outer-centre-stage","inner-under-display"]);
 assert.deepEqual(d.cameras.rearPhysicalLensTypes,["wide","ultra-wide"]);
 assert.equal(d.cameras.lidar,false);assert.equal(d.controls.actionButton,false);assert.equal(d.controls.cameraControl,true);
});
check("Camera hardware cannot be inferred from digital 2x crop",()=>{
 for(const m of models){assert.equal(m.cameras.opticalQualityCropIsIndependentLens,false);assert.ok(m.cameras.rearPhysicalLensTypes.every(x=>["wide","ultra-wide","telephoto"].includes(x)))}
 for(const slug of ["iphone-duo","iphone-17e","iphone-16e","iphone-17"]){assert.equal(bySlug.get(slug).cameras.rearPhysicalLensTypes.includes("telephoto"),false)}
 assert.equal(bySlug.get("iphone-18-pro").cameras.rearPhysicalLensTypes.includes("telephoto"),true);
});
check("LiDAR only on supported 12 Pro+ lines",()=>{
 for(const m of models){const expected=/^iphone-(12|13|14|15|16|17|18)-pro(?:-max)?$/.test(m.slug);assert.equal(m.cameras.lidar,expected,m.slug)}
});
check("Control support reflects Apple specifications",()=>{
 for(const slug of ["iphone-16","iphone-16-plus","iphone-16e","iphone-17","iphone-17e","iphone-air","iphone-18-pro"]){assert.equal(bySlug.get(slug).controls.actionButton,true,slug)}
 for(const slug of ["iphone-16","iphone-17","iphone-air","iphone-duo","iphone-18-pro"]){assert.equal(bySlug.get(slug).controls.cameraControl,true,slug)}
 for(const slug of ["iphone-16e","iphone-17e","iphone-15-pro"]){assert.equal(bySlug.get(slug).controls.cameraControl,false,slug)}
});
check("Charging standards and MagSafe exceptions",()=>{
 for(const m of models)assert.equal(m.charging.qiWireless,true,m.slug);
 assert.equal(bySlug.get("iphone-16e").charging.magsafe,false);
 assert.equal(bySlug.get("iphone-17e").charging.magsafe,true);
 assert.equal(bySlug.get("iphone-duo").charging.magsafe,true);
});
check("Unverified individual microphone routes never reported as verified",()=>{for(const m of models){assert.equal(m.audio.physicalMicRoutingVerified,false);assert.equal(m.cameras.lensCoordinatesVerified,false)}});
check("All hardware capabilities have source and evidence notes",()=>{
 assert.ok(data.sources.appleIdentification.startsWith("https://support.apple.com"));
 assert.ok(data.sources.duoTechSpecs.startsWith("https://www.apple.com"));
 assert.ok(data.evidencePolicy.physicalMicSelection&&data.evidencePolicy.cameraLenses);
});
console.log("CATALOGUE VALIDATED: "+models.length+" models; ten requirement groups");
