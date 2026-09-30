// JSON is the reviewed source of truth; the browser bundle has no runtime fetch.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/device-catalogue.json'),'utf8'));
const bundle='/* Generated from device-catalogue.json; do not edit this bundle directly. */\n(function(g){const data='+JSON.stringify(data)+';if(typeof module==="object"&&module.exports)module.exports=data;else g.IRepairDeviceCatalogueData=data;})(globalThis);\n';
fs.writeFileSync(path.join(root,'data/device-catalogue.js'),bundle);
const report=[
  '# Catalogue research register · '+data.researchedAt,
  '',
  'Source registry and per-attribute provenance are in [device-catalogue.json](../data/device-catalogue.json). Nulls and unknowns are retained rather than inferred. Colours identify verified manufacturer finishes, not stock availability. Samsung regional / special-edition coverage remains limited.',
  '',
  '| Manufacturer / exact model | Original display | Verified official finishes | Confirmed sold screen options | Rear material / repair method | Sources |',
  '|---|---|---|---|---|---|'
];
for(const model of data.models){
  const display=model.originalDisplay;
  const technology=display.marketingName+' / '+display.technology+(display.proMotion?' · ProMotion':'')+(display.ltpo===true?' · LTPO':'');
  const refs=[...new Set(['identity','display','colours','rearMaterial','repairMethod'].flatMap(key=>model.provenance[key]||[]))];
  const links=refs.map(id=>'['+id+']('+data.sources[id].url+')').join('; ');
  const offers=model.repairs.screen.soldOptions.map(option=>option.technology).join(', ')||'Unknown → assessment';
  report.push('| '+[model.manufacturer+' / '+model.model,technology,model.officialColours.join(', '),offers,(model.rear.material||'Unknown')+' / '+model.rear.method,links].join(' | ')+' |');
}
report.push('','## Unresolved attributes','','All models retain an exact-variant and live-stock check. The JSON’s `unknowns` and `variantSensitiveParts` are authoritative. Specific gaps: sold replacement parts for Samsung / Pixel, incomplete regional Samsung colour coverage, some identifiers and LTPO backplanes, and specialist rear repair / connector replacement methods. No generic replacement choice is generated for these gaps.','',Object.keys(data.sources).length+' source records are preserved. Prices were not imported from any researched page.');
fs.writeFileSync(path.join(root,'docs/catalogue-research.md'),report.join('\n')+'\n');
