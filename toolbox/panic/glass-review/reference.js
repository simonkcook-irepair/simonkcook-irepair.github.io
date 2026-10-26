/* iRepair curated panic reference reader; never uploads user logs. */
(function(root){
"use strict";
const endpoint="https://irepair-panic-reference-library-simon-cook.vercel.app/latest.json";
function validate(d){
 if(!d||d.schema!==1||d.library!=="iRepair curated iPhone panic references"||
 !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(d.version||"")||
 !/^\d{4}-\d{2}-\d{2}$/.test(d.reviewedDate||"")||
 !Array.isArray(d.sources)||!Array.isArray(d.rules)||d.rules.length>64||!d.rules.length)throw Error("Invalid reference feed");
 const ms=Date.parse(d.reviewedDate+"T00:00:00Z");
 if(!Number.isFinite(ms)||ms>Date.now()+86400000)throw Error("Invalid review date");
 const links=new Map();
 for(const s of d.sources){
  const u=new URL(s.url);
  if(u.protocol!=="https:"||!["www.ifixit.com","repair.wiki","support.apple.com"].includes(u.hostname)||!s.id)throw Error("Unverified source");
  links.set(s.id,{title:String(s.title).slice(0,100),url:u.href});
 }
 const ids=new Set(),entries=[];
 for(const r of d.rules){
  if(!/^[a-z][a-z0-9-]{2,63}$/.test(r.id||"")||ids.has(r.id)||
   !/^[A-Za-z][A-Za-z0-9_-]{2,39}$/.test(r.match||"")||
   !links.has(r.sourceId)||r.grade!=="reference-reviewed"||
   !["title","summary","action"].every(k=>typeof r[k]==="string"&&r[k].length<=480))throw Error("Invalid unreviewed rule");
  ids.add(r.id);entries.push({id:r.id,match:r.match,title:r.title,summary:r.summary,action:r.action,source:links.get(r.sourceId)});
 }
 return {version:d.version,reviewedDate:d.reviewedDate,ageDays:Math.max(0,Math.floor((Date.now()-ms)/86400000)),entries};
}
function matches(signature,lib){
 if(!lib||!signature)return [];
 const words=new Set(String(signature).slice(0,22000).toLowerCase().split(/[^a-z0-9_-]+/));
 return lib.entries.filter(r=>words.has(r.match.toLowerCase())).slice(0,8);
}
function date(lib){
 return lib?new Date(lib.reviewedDate+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}):"Unknown";
}
function report(lib,items){
 let out=["","REVIEWED PANIC REFERENCE LIBRARY"];
 if(!lib)return out.concat(["Online update unavailable; built-in panic signatures used."]).join("\n");
 out.push("Library version: "+lib.version,"Last human review: "+date(lib),"Checked online, not a real-time crawl of all repair websites.");
 for(const r of items||[])out.push("Possible reference: "+r.title,"Context: "+r.summary,"Further check: "+r.action,"Source: "+r.source.url);
 if(!items?.length)out.push("No additional reviewed reference matched.");
 out.push("Reference clues cannot prove a failed hardware component.");
 return out.join("\n");
}
root.iRepairPanicReferences=Object.freeze({endpoint,validate,matches,date,report});
})(typeof window!=="undefined"?window:globalThis);
