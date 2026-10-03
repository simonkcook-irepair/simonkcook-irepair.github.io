/* iRepair Technician · Build 38 stability layer.
   Prevents background Core sync from replacing the page during iPhone scrolling.
   Also clears the known stale prototype jobs already removed from Supabase. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
const stale=new Set([
  'IR-MUMRCJTS-7F41','IR-DEMO-KILLAY','IR-MUNY4S5L-37LD','IR-DEMO-MORRISTON',
  'IR-MUO975MG-OQNU','IR-MUMR3OIG-DFD7','IR-MUJNCWA0-E291','IR-MUMQFXZX-790A','IR-MUMPX6J4-38FP'
]);

/* Purge only the known test rows that were deleted from the shared backend. */
try{
  const state=DB.read();
  const jobs=(state.jobs||[]).filter(j=>!stale.has(String(j&&j.id||'')));
  if(jobs.length!==(state.jobs||[]).length){
    state.jobs=jobs;
    DB.write(state,'build38-test-cleanup');
  }
}catch(e){}

let touching=false,lastScrollAt=0,pendingTimer=null,pendingRun=null;
window.addEventListener('touchstart',()=>{touching=true},{passive:true});
window.addEventListener('touchend',()=>{touching=false;flushSoon()},{passive:true});
window.addEventListener('touchcancel',()=>{touching=false;flushSoon()},{passive:true});
window.addEventListener('scroll',()=>{lastScrollAt=Date.now();flushSoon()},{passive:true});

function jobsFingerprint(state){
  try{return JSON.stringify((state&&state.jobs)||DB.read().jobs||[])}catch(e){return String(Date.now())}
}
function interactionBusy(){return touching||(Date.now()-lastScrollAt<650)}
function preserveScroll(fn,arg){
  const x=window.scrollX||0,y=window.scrollY||0;
  fn(arg);
  requestAnimationFrame(()=>{
    if(Math.abs((window.scrollY||0)-y)>1||Math.abs((window.scrollX||0)-x)>1){
      window.scrollTo({left:x,top:y,behavior:'instant'});
    }
  });
}
function flushSoon(){
  if(!pendingRun)return;
  clearTimeout(pendingTimer);
  pendingTimer=setTimeout(()=>{
    if(interactionBusy()){flushSoon();return}
    const run=pendingRun;pendingRun=null;run();
  },720);
}
function updateCoreChip(detail){
  const chip=document.getElementById('coreChip');if(!chip)return;
  const online=detail&&typeof detail.online==='boolean'?detail.online:!!(DB.connection&&DB.connection.online);
  chip.textContent=online?'CORE ONLINE':'CORE SYNC';
  chip.classList.toggle('online',online);
}

/* Wrap only tech-core.js's coreUpdate callback; enhancement-module subscribers remain untouched. */
const originalSubscribe=DB.subscribe.bind(DB);
DB.subscribe=function(fn){
  if(!fn||fn.name!=='coreUpdate')return originalSubscribe(fn);
  let last=jobsFingerprint(DB.read());
  return originalSubscribe(function(state){
    const next=jobsFingerprint(state);
    if(next===last){updateCoreChip();return}
    last=next;
    const run=()=>preserveScroll(fn,state);
    if(interactionBusy()){pendingRun=run;flushSoon()}else run();
  });
};

/* Connection heartbeats should update only the chip, never rebuild the job list. */
const originalConnectionSubscribe=DB.subscribeConnection.bind(DB);
DB.subscribeConnection=function(fn){
  if(!fn||fn.name!=='coreUpdate')return originalConnectionSubscribe(fn);
  return originalConnectionSubscribe(function(detail){updateCoreChip(detail)});
};

window.IRepairTechStability38={active:true};
})();
