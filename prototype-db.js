/* iRepair Core · shared prototype data layer
   Build 16: local browser store used to demonstrate customer <-> technician handshake.
   Replace this adapter with the hosted API/database without changing the UI contract. */
(function(g){
  const KEY='irepair_core_prototype_db_v1';
  const CHANNEL='irepair_core_prototype_sync';
  const STATUS=[
    ['booked','Booked'],['confirmed','Confirmed'],['on_my_way','On my way'],['arrived','Arrived'],
    ['repairing','Repairing'],['waiting_part','Waiting for part'],['completed','Completed'],['cancelled','Cancelled']
  ];
  let bc=null;
  try{bc=('BroadcastChannel' in g)?new BroadcastChannel(CHANNEL):null}catch(e){}

  function blank(){return {version:1,jobs:[],customers:[],updatedAt:new Date().toISOString()}}
  function read(){
    try{const raw=localStorage.getItem(KEY);if(!raw)return blank();const v=JSON.parse(raw);return v&&Array.isArray(v.jobs)?v:blank()}catch(e){return blank()}
  }
  function write(state,source){
    state.updatedAt=new Date().toISOString();
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    try{bc&&bc.postMessage({type:'changed',source:source||'unknown',at:state.updatedAt})}catch(e){}
    try{g.dispatchEvent(new CustomEvent('irepair-db-change',{detail:{source:source||'unknown'}}))}catch(e){}
    return state;
  }
  function uid(prefix){return (prefix||'IR')+'-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
  function normaliseJob(input){
    const now=new Date().toISOString();
    return Object.assign({
      id:uid('IR'),customerId:uid('CU'),customerName:'Demo customer',phone:'',email:'',
      device:'Unconfirmed device',variant:'',deviceConfidence:'unconfirmed',repair:'Assessment',price:null,
      service:'Mobile call-out',address:'',postcode:'',date:'Today',slot:'',status:'booked',
      compatibility:'unknown',notes:[],createdAt:now,updatedAt:now,source:'customer-app'
    },input||{}, {updatedAt:now});
  }
  function createJob(input,source){const s=read();const job=normaliseJob(input);s.jobs.unshift(job);write(s,source||'customer');return job}
  function getJob(id){return read().jobs.find(j=>j.id===id)||null}
  function listJobs(){return read().jobs.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))}
  function updateJob(id,patch,source){const s=read();const i=s.jobs.findIndex(j=>j.id===id);if(i<0)return null;s.jobs[i]=Object.assign({},s.jobs[i],patch||{},{updatedAt:new Date().toISOString()});write(s,source||'technician');return s.jobs[i]}
  function setStatus(id,status,source){if(!STATUS.some(x=>x[0]===status))return null;return updateJob(id,{status},source||'technician')}
  function addNote(id,text,author,source){const job=getJob(id);if(!job||!String(text||'').trim())return null;const notes=(job.notes||[]).slice();notes.push({id:uid('NO'),text:String(text).trim(),author:author||'Technician',at:new Date().toISOString()});return updateJob(id,{notes},source||'technician')}
  function clear(){write(blank(),'reset')}
  function createDemoBooking(){
    return createJob({
      customerName:'Demo customer',device:'iPhone 13',variant:'UK / exact variant not required for demo',deviceConfidence:'confirmed',
      repair:'Screen replacement',price:99,service:'Mobile call-out',address:'Swansea',postcode:'SA2',date:'Today',slot:'Afternoon',
      compatibility:'universal',status:'booked',source:'customer-app'
    },'customer-app');
  }
  function label(status){return (STATUS.find(x=>x[0]===status)||[status,status])[1]}
  function subscribe(fn){
    const local=()=>fn(read());
    g.addEventListener('storage',local);g.addEventListener('irepair-db-change',local);
    if(bc)bc.addEventListener('message',local);
    return ()=>{g.removeEventListener('storage',local);g.removeEventListener('irepair-db-change',local);if(bc)bc.removeEventListener('message',local)};
  }
  g.IRepairDB={KEY,STATUS,read,write,listJobs,getJob,createJob,updateJob,setStatus,addNote,createDemoBooking,clear,label,subscribe};
})(window);