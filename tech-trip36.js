/* iRepair Technician · Build 36 trip-state bridge for Repair Relay. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
const API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/trip-api';
const KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
const sent=new Map();
function tripState(status){return status==='on_my_way'?'en_route':status==='arrived'?'arrived':status==='completed'?'completed':status==='cancelled'?'cancelled':'planned'}
async function sync(job){if(!job||!job.id)return;const state=tripState(job.status),fingerprint=state;if(sent.get(job.id)===fingerprint)return;sent.set(job.id,fingerprint);try{const r=await fetch(API+'/jobs/'+encodeURIComponent(job.id),{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:'Bearer '+KEY,apikey:KEY},body:JSON.stringify({state})});if(!r.ok)throw new Error('HTTP '+r.status)}catch(e){sent.delete(job.id)}}
function syncAll(){DB.listJobs().forEach(sync)}
DB.subscribe(syncAll);DB.subscribeConnection(syncAll);window.addEventListener('irepair-api-change',syncAll);syncAll();setInterval(()=>{if(document.visibilityState!=='hidden')syncAll()},30000);
})();