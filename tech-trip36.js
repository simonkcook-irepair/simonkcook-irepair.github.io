/* iRepair Technician · Build 37 live trip bridge for Repair Relay.
   Only the browser that selects "On my way" becomes the live journey source. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
const API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/trip-api';
const KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
const LIVE_KEY='irepair_live_journey_job_v1';
const sent=new Map();
let geoWatch=null,geoJob='',lastGeoPush=0,geoState='idle';
function tripState(status){return status==='on_my_way'?'en_route':status==='arrived'?'arrived':status==='completed'?'completed':status==='cancelled'?'cancelled':'planned'}
async function post(jobId,body){const r=await fetch(API+'/jobs/'+encodeURIComponent(jobId),{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:'Bearer '+KEY,apikey:KEY},body:JSON.stringify(body||{})});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
async function sync(job){if(!job||!job.id)return;const state=tripState(job.status),fingerprint=state;if(sent.get(job.id)===fingerprint)return;sent.set(job.id,fingerprint);try{await post(job.id,{state})}catch(e){sent.delete(job.id)}}
function syncAll(){DB.listJobs().forEach(sync);syncLiveWatch()}
function liveId(){try{return localStorage.getItem(LIVE_KEY)||''}catch(e){return ''}}
function setLiveId(id){try{id?localStorage.setItem(LIVE_KEY,id):localStorage.removeItem(LIVE_KEY)}catch(e){}}
function stopGeo(){if(geoWatch!==null&&navigator.geolocation){navigator.geolocation.clearWatch(geoWatch)}geoWatch=null;geoJob='';geoState='idle';window.dispatchEvent(new CustomEvent('irepair-trip-location',{detail:{state:'idle'}}))}
function pushGeo(jobId,pos){if(!pos||!pos.coords||jobId!==liveId())return;const now=Date.now();if(now-lastGeoPush<12000)return;lastGeoPush=now;geoState='live';window.dispatchEvent(new CustomEvent('irepair-trip-location',{detail:{state:'live',accuracy:pos.coords.accuracy}}));post(jobId,{state:'en_route',latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracyMetres:pos.coords.accuracy,headingDegrees:Number.isFinite(pos.coords.heading)?pos.coords.heading:null}).catch(()=>{})}
function startGeo(jobId){if(geoWatch!==null&&geoJob===jobId)return;stopGeo();if(!navigator.geolocation){geoState='unsupported';return}geoJob=jobId;geoState='requesting';window.dispatchEvent(new CustomEvent('irepair-trip-location',{detail:{state:'requesting'}}));geoWatch=navigator.geolocation.watchPosition(p=>pushGeo(jobId,p),e=>{geoState=e&&e.code===1?'denied':'unavailable';window.dispatchEvent(new CustomEvent('irepair-trip-location',{detail:{state:geoState}}))},{enableHighAccuracy:true,maximumAge:5000,timeout:15000})}
function syncLiveWatch(){const id=liveId();if(!id){stopGeo();return}const job=DB.getJob(id);if(!job||job.status!=='on_my_way'){setLiveId('');stopGeo();return}startGeo(id)}
function wrapStatus(){if(typeof DB.setStatus!=='function'||DB.setStatus.__trip37)return;const original=DB.setStatus;const wrapped=function(id,status,source){const out=original.call(DB,id,status,source);if(status==='on_my_way'){setLiveId(id);setTimeout(syncLiveWatch,0)}else if(['arrived','completed','cancelled'].includes(status)&&liveId()===id){setLiveId('');stopGeo()}return out};wrapped.__trip37=true;DB.setStatus=wrapped}
wrapStatus();DB.subscribe(syncAll);DB.subscribeConnection(syncAll);window.addEventListener('irepair-api-change',syncAll);window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncLiveWatch()});syncAll();setInterval(()=>{if(document.visibilityState!=='hidden')syncAll()},30000);
})();