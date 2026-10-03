/* iRepair Technician · Build 39 direct live journey control.
   The user tap itself requests iPhone location and sends the first GPS fix immediately. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
const API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/trip-api';
const KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
const LIVE_KEY='irepair_live_journey_job_v1';
let scheduled=false,watchId=null,watchJob='',lastPush=0;
const states=new Map();
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}
function liveId(){try{return localStorage.getItem(LIVE_KEY)||''}catch(e){return ''}}
function setLiveId(id){try{id?localStorage.setItem(LIVE_KEY,id):localStorage.removeItem(LIVE_KEY)}catch(e){}}
function setState(id,state,text){states.set(id,{state,text:text||''});schedule();window.dispatchEvent(new CustomEvent('irepair-trip-location',{detail:{state,jobId:id}}))}
async function postLocation(id,pos){
 const c=pos&&pos.coords;if(!c)throw new Error('No GPS coordinates received');
 const r=await fetch(API+'/jobs/'+encodeURIComponent(id),{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:'Bearer '+KEY,apikey:KEY},body:JSON.stringify({state:'en_route',latitude:c.latitude,longitude:c.longitude,accuracyMetres:c.accuracy,headingDegrees:Number.isFinite(c.heading)?c.heading:null})});
 const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(e){}
 if(!r.ok)throw new Error(d.error||('Trip API '+r.status));
 return d;
}
function stopWatch(){if(watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId)}watchId=null;watchJob=''}
function pushWatch(id,pos){if(id!==liveId())return;const now=Date.now();if(now-lastPush<8000)return;lastPush=now;postLocation(id,pos).then(()=>setState(id,'live','Live GPS is updating the customer journey.')).catch(e=>setState(id,'error','GPS was received but could not be sent: '+e.message))}
function beginWatch(id){
 if(!navigator.geolocation)return;
 if(watchId!==null&&watchJob===id)return;
 stopWatch();watchJob=id;
 watchId=navigator.geolocation.watchPosition(p=>pushWatch(id,p),e=>{
   const msg=e&&e.code===1?'Location permission is blocked for this site.':e&&e.code===2?'Your iPhone could not determine its location.':'The GPS request timed out.';
   setState(id,'error',msg);
 },{enableHighAccuracy:true,maximumAge:3000,timeout:15000});
}
function statusCopy(job){
 const s=states.get(job.id),active=liveId()===job.id;
 if(s&&s.state==='requesting')return{cls:'starting',line:'Requesting iPhone location…',button:'Requesting…',disabled:true};
 if(s&&s.state==='live')return{cls:'live',line:s.text||'Live GPS is updating the customer journey.',button:'Restart live location',disabled:false};
 if(s&&s.state==='error')return{cls:'error',line:s.text||'Live location could not start.',button:'Try live location again',disabled:false};
 if(active)return{cls:'starting',line:'This iPhone is assigned to the journey. Tap below to obtain a fresh GPS fix.',button:'Start / Resume live location',disabled:false};
 return{cls:'idle',line:'Location has not started on this technician device yet.',button:'Start / Resume live location',disabled:false};
}
function enhance(){
 scheduled=false;
 const jobs=new Map(DB.listJobs().map(j=>[j.id,j]));
 document.querySelectorAll('#main article.job').forEach(card=>{
   const opener=card.querySelector('[data-open]'),id=opener&&opener.dataset.open,job=id&&jobs.get(id);
   let wrap=card.querySelector('.trip38-control');
   if(!job||job.status!=='on_my_way'){if(wrap)wrap.remove();return}
   if(!wrap){wrap=document.createElement('div');wrap.className='trip38-control';const actions=card.querySelector('.actions');if(actions)actions.insertAdjacentElement('beforebegin',wrap);else card.appendChild(wrap)}
   const s=statusCopy(job);
   wrap.className='trip38-control '+s.cls;
   wrap.innerHTML='<div><b>🚐 Customer live journey</b><small>'+esc(s.line)+'</small></div><button type="button" data-trip38-start="'+esc(job.id)+'" '+(s.disabled?'disabled':'')+'>'+esc(s.button)+'</button>';
 });
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance)}
function requestNow(id,button){
 const job=DB.getJob(id);if(!job||job.status!=='on_my_way')return;
 if(!navigator.geolocation){setState(id,'error','Location services are unavailable in this browser.');return}
 window.__IREPAIR_DIRECT_TRIP_CONTROL=true;
 setLiveId(id);setState(id,'requesting','Requesting iPhone location…');
 if(button){button.disabled=true;button.textContent='Requesting…'}
 navigator.geolocation.getCurrentPosition(async pos=>{
   try{
     await postLocation(id,pos);
     setState(id,'live','Live GPS is updating the customer journey · accuracy about '+Math.round(pos.coords.accuracy||0)+' m.');
     beginWatch(id);
   }catch(e){setState(id,'error','Location was found, but the journey update failed: '+e.message)}
 },e=>{
   const msg=e&&e.code===1?'Location permission is blocked. In Safari, allow Location for this website and try again.':e&&e.code===2?'Your iPhone could not determine its location. Please try again outside or with Location Services enabled.':'The location request timed out. Tap Try again.';
   setState(id,'error',msg);
 },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-trip38-start]');if(!b)return;e.preventDefault();e.stopPropagation();requestNow(b.getAttribute('data-trip38-start'),b)},true);
const style=document.createElement('style');style.id='trip38ControlCss';style.textContent='.trip38-control{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0;padding:10px 11px;border-radius:12px;border:1px solid rgba(80,202,255,.38);background:rgba(10,74,116,.23)}.trip38-control div{min-width:0}.trip38-control b{display:block;font-size:10.5px;color:#d8f2ff}.trip38-control small{display:block;margin-top:3px;font-size:9px;line-height:1.35;color:#8eb4cf}.trip38-control button{flex:0 0 auto;border:1px solid rgba(105,222,255,.58);border-radius:10px;background:linear-gradient(180deg,#159be9,#0871c9);color:white;padding:9px 10px;font-size:9px;font-weight:850;max-width:140px}.trip38-control button:disabled{opacity:.6}.trip38-control.live{border-color:rgba(83,239,134,.5);background:rgba(21,123,70,.2)}.trip38-control.live b{color:#d8ffe5}.trip38-control.error{border-color:rgba(255,188,77,.5);background:rgba(145,90,15,.2)}.trip38-control.error b{color:#ffe1aa}@media(max-width:390px){.trip38-control{align-items:stretch;flex-direction:column}.trip38-control button{width:100%;max-width:none}}';document.head.appendChild(style);
DB.subscribe(schedule);DB.subscribeConnection(schedule);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule()});schedule();
})();