// JSON is the reviewed source of truth; the browser bundle has no runtime fetch.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/device-catalogue.json'),'utf8'));
const bundle='/* Generated from device-catalogue.json; do not edit this bundle directly. */\n(function(g){const data='+JSON.stringify(data)+';if(typeof module==="object"&&module.exports)module.exports=data;else g.IRepairDeviceCatalogueData=data;})(globalThis);\n';
fs.writeFileSync(path.join(root,'data/device-catalogue.js'),bundle);
