/* iRepair Technician · Build 40 passive scroll stability.
   Restores scroll position after Core DOM refreshes without touching buttons or subscriptions. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
const stale=new Set([
  'IR-MUMRCJTS-7F41','IR-DEMO-KILLAY','IR-MUNY4S5L-37LD','IR-DEMO-MORRISTON',
  'IR-MUO975MG-OQNU','IR-MUMR3OIG-DFD7','IR-MUJNCWA0-E291','IR-MUMQFXZX-790A','IR-MUMPX6J4-38FP'
]);

/* Clear only the known prototype jobs already removed from Supabase. */
try{
  const state=DB.read();
  const current=Array.isArray(state.jobs)?state.jobs:[];
  const jobs=current.filter(j=>!stale.has(String(j&&j.id||'')));
  if(jobs.length!==current.length){state.jobs=jobs;DB.write(state,'build40-test-cleanup')}
}catch(e){}

let x=window.scrollX||0,y=window.scrollY||0,restoring=false;
function remember(){if(restoring)return;x=window.scrollX||0;y=window.scrollY||0}
function restore(){
  const targetX=x,targetY=y;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    restoring=true;
    if(Math.abs((window.scrollY||0)-targetY)>2||Math.abs((window.scrollX||0)-targetX)>2){
      window.scrollTo(targetX,targetY);
    }
    restoring=false;
  }));
}
window.addEventListener('scroll',remember,{passive:true});
window.addEventListener('touchstart',remember,{passive:true});
window.addEventListener('touchmove',remember,{passive:true});
window.addEventListener('irepair-db-change',()=>{remember();restore()});
window.addEventListener('storage',()=>{remember();restore()});
window.IRepairTechScroll40={active:true};
})();
