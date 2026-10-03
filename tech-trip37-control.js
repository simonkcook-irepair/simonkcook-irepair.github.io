/* iRepair Technician · Build 38 live journey control.
   Provides a visible retry path for iOS location permission / an already-en-route job. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
let scheduled=false;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function liveId(){try{return localStorage.getItem('irepair_live_journey_job_v1')||''}catch(e){return ''}}
function enhance(){
 scheduled=false;
 const jobs=new Map(DB.listJobs().map(j=>[j.id,j]));
 document.querySelectorAll('#main article.job').forEach(card=>{
   const opener=card.querySelector('[data-open]'),id=opener&&opener.dataset.open,job=id&&jobs.get(id);
   let wrap=card.querySelector('.trip38-control');
   if(!job||job.status!=='on_my_way'){if(wrap)wrap.remove();return}
   if(!wrap){wrap=document.createElement('div');wrap.className='trip38-control';const actions=card.querySelector('.actions');if(actions)actions.insertAdjacentElement('beforebegin',wrap);else card.appendChild(wrap)}
   const active=liveId()===job.id;
   wrap.innerHTML='<div><b>🚐 Customer live journey</b><small>'+(active?'This iPhone is assigned as the journey source.':'Location has not started on this technician device yet.')+'</small></div><button type="button" data-trip38-start="'+esc(job.id)+'">'+(active?'Restart live location':'Start / Resume live location')+'</button>';
 });
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-trip38-start]');if(!b)return;e.preventDefault();e.stopPropagation();const id=b.getAttribute('data-trip38-start'),job=DB.getJob(id);if(!job)return;b.disabled=true;b.textContent='Starting…';DB.setStatus(id,'on_my_way','technician-live-retry');setTimeout(schedule,250)},true);
const style=document.createElement('style');style.id='trip38ControlCss';style.textContent='.trip38-control{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:9px 0;padding:10px 11px;border-radius:12px;border:1px solid rgba(80,202,255,.38);background:rgba(10,74,116,.23)}.trip38-control div{min-width:0}.trip38-control b{display:block;font-size:10.5px;color:#d8f2ff}.trip38-control small{display:block;margin-top:3px;font-size:9px;line-height:1.35;color:#8eb4cf}.trip38-control button{flex:0 0 auto;border:1px solid rgba(105,222,255,.58);border-radius:10px;background:linear-gradient(180deg,#159be9,#0871c9);color:white;padding:9px 10px;font-size:9px;font-weight:850;max-width:126px}.trip38-control button:disabled{opacity:.55}@media(max-width:390px){.trip38-control{align-items:stretch;flex-direction:column}.trip38-control button{width:100%;max-width:none}}';document.head.appendChild(style);
DB.subscribe(schedule);DB.subscribeConnection(schedule);new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});window.addEventListener('irepair-trip-location',schedule);schedule();
})();