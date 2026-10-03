/* iRepair Technician · Build 41 sync guard.
   Suppresses only duplicate background heartbeat events. Never intercepts taps, pointer events or buttons. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
function stableJobs(){
  try{return JSON.stringify((DB.read().jobs||[]).map(j=>({id:j.id,status:j.status,partState:j.partState,paymentState:j.paymentState,scheduleOrder:j.scheduleOrder,updatedAt:j.updatedAt,address:j.address,postcode:j.postcode,slot:j.slot,timeline:(j.timeline||[]).length,messages:(j.messages||[]).length,observations:(j.observations||[]).length,contacts:(j.contacts||[]).length})))}catch(e){return ''}
}
let lastJobs=stableJobs();
let lastOnline=DB.connection&&typeof DB.connection.online==='boolean'?DB.connection.online:null;
window.addEventListener('irepair-db-change',function(e){
  if(!e||!e.detail||e.detail.source!=='remote-sync'){lastJobs=stableJobs();return}
  const next=stableJobs();
  if(next===lastJobs){e.stopImmediatePropagation();return}
  lastJobs=next;
},true);
window.addEventListener('irepair-api-change',function(e){
  const online=e&&e.detail&&typeof e.detail.online==='boolean'?e.detail.online:null;
  if(online!==null&&online===lastOnline){e.stopImmediatePropagation();return}
  if(online!==null)lastOnline=online;
},true);
window.IRepairTechSync41={active:true};
})();