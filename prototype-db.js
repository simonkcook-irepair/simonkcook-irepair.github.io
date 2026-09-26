/* iRepair Core · shared prototype data layer
   Build 17: local browser store used to demonstrate customer <-> technician handshake.
   UI code talks to this adapter; production can swap it for hosted API/database calls. */
(function(g){
  const KEY='irepair_core_prototype_db_v1';
  const CHANNEL='irepair_core_prototype_sync';
  const STATUS=[
    ['booked','Booked'],['confirmed','Confirmed'],['on_my_way','On my way'],['arrived','Arrived'],
    ['repairing','Repairing'],['waiting_part','Waiting for part'],['completed','Completed'],['cancelled','Cancelled']
  ];
  const PART_STATES=[
    ['not_checked','Not checked'],['in_stock','In stock'],['order_required','Order required'],
    ['ordered','Ordered'],['received','Received'],['fitted','Fitted']
  ];
  const PAYMENT_STATES=[['unpaid','Unpaid'],['deposit','Deposit paid'],['paid','Paid']];
  let bc=null;
  try{bc=('BroadcastChannel' in g)?new BroadcastChannel(CHANNEL):null}catch(e){}

  function iso(){return new Date().toISOString()}
  function blank(){return {version:2,jobs:[],customers:[],updatedAt:iso()}}
  function uid(prefix){return (prefix||'IR')+'-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
  function event(type,label,actor,visibility){return {id:uid('EV'),type:type||'update',label:String(label||''),actor:actor||'System',visibility:visibility||'customer',at:iso()}}
  function hydrateJob(j){
    if(!j)return j;
    return Object.assign({
      customerId:uid('CU'),customerName:'Demo customer',phone:'',email:'',device:'Unconfirmed device',variant:'',
      deviceConfidence:'unconfirmed',repair:'Assessment',price:null,service:'Mobile call-out',address:'',postcode:'',
      date:'Today',slot:'',status:'booked',compatibility:'unknown',partState:'not_checked',partName:'',supplier:'',
      paymentState:'unpaid',priority:'normal',technician:'Simon',notes:[],timeline:[],customerMessage:'',
      source:'customer-app',createdAt:iso(),updatedAt:iso()
    },j);
  }
  function read(){
    try{
      const raw=localStorage.getItem(KEY);if(!raw)return blank();
      const v=JSON.parse(raw);if(!v||!Array.isArray(v.jobs))return blank();
      v.version=2;v.jobs=v.jobs.map(hydrateJob);if(!Array.isArray(v.customers))v.customers=[];return v;
    }catch(e){return blank()}
  }
  function write(state,source){
    state.version=2;state.updatedAt=iso();
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    try{bc&&bc.postMessage({type:'changed',source:source||'unknown',at:state.updatedAt})}catch(e){}
    try{g.dispatchEvent(new CustomEvent('irepair-db-change',{detail:{source:source||'unknown'}}))}catch(e){}
    return state;
  }
  function normaliseJob(input){
    const now=iso();const job=hydrateJob(Object.assign({id:uid('IR'),createdAt:now,updatedAt:now},input||{}));
    if(!job.timeline.length)job.timeline=[event('created','Repair request created','Customer','customer')];
    return job;
  }
  function createJob(input,source){const s=read();const job=normaliseJob(input);s.jobs.unshift(job);write(s,source||'customer');return job}
  function getJob(id){return read().jobs.find(j=>j.id===id)||null}
  function listJobs(){return read().jobs.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))}
  function updateJob(id,patch,source){const s=read();const i=s.jobs.findIndex(j=>j.id===id);if(i<0)return null;s.jobs[i]=hydrateJob(Object.assign({},s.jobs[i],patch||{},{updatedAt:iso()}));write(s,source||'technician');return s.jobs[i]}
  function addEvent(id,type,label,actor,visibility,source){const j=getJob(id);if(!j)return null;const timeline=(j.timeline||[]).slice();timeline.push(event(type,label,actor,visibility));return updateJob(id,{timeline},source||'technician')}
  function setStatus(id,status,source){
    if(!STATUS.some(x=>x[0]===status))return null;
    const s=read();const i=s.jobs.findIndex(j=>j.id===id);if(i<0)return null;
    const j=hydrateJob(s.jobs[i]);j.status=status;j.updatedAt=iso();j.timeline=(j.timeline||[]).concat([event('status','Status changed to '+label(status),'Technician','customer')]);s.jobs[i]=j;write(s,source||'technician');return j;
  }
  function setPartState(id,partState,source){
    if(!PART_STATES.some(x=>x[0]===partState))return null;
    const j=getJob(id);if(!j)return null;const timeline=(j.timeline||[]).concat([event('part','Part status: '+partLabel(partState),'Technician','internal')]);
    return updateJob(id,{partState,timeline},source||'technician');
  }
  function setPaymentState(id,paymentState,source){
    if(!PAYMENT_STATES.some(x=>x[0]===paymentState))return null;
    const j=getJob(id);if(!j)return null;const timeline=(j.timeline||[]).concat([event('payment','Payment: '+paymentLabel(paymentState),'Technician','customer')]);
    return updateJob(id,{paymentState,timeline},source||'technician');
  }
  function addNote(id,text,author,source){const job=getJob(id);if(!job||!String(text||'').trim())return null;const notes=(job.notes||[]).slice();notes.push({id:uid('NO'),text:String(text).trim(),author:author||'Technician',at:iso()});return updateJob(id,{notes},source||'technician')}
  function setCustomerMessage(id,text,source){
    const job=getJob(id);if(!job)return null;const value=String(text||'').trim();const timeline=(job.timeline||[]).slice();
    if(value)timeline.push(event('message',value,'Technician','customer'));
    return updateJob(id,{customerMessage:value,timeline},source||'technician');
  }
  function clear(){write(blank(),'reset')}
  function createDemoBooking(){return createJob({customerName:'Demo customer',device:'iPhone 13',variant:'UK / exact variant not required for demo',deviceConfidence:'confirmed',repair:'Screen replacement',price:99,service:'Mobile call-out',address:'Swansea',postcode:'SA2',date:'Today',slot:'Afternoon',compatibility:'universal',partState:'in_stock',partName:'iPhone 13 OLED screen',paymentState:'unpaid',status:'booked',source:'customer-app'},'customer-app')}
  function createDemoDay(){
    const made=[];
    made.push(createJob({customerName:'Alex Morgan',device:'iPhone 13',deviceConfidence:'confirmed',repair:'Screen replacement · OLED',price:149,service:'Mobile call-out',address:'Sketty',postcode:'SA2',date:'Today',slot:'09:30',compatibility:'universal',partState:'in_stock',partName:'iPhone 13 OLED',paymentState:'unpaid',priority:'normal',status:'confirmed'},'seed'));
    made.push(createJob({customerName:'Jordan Evans',device:'Samsung Galaxy S23 Ultra',variant:'Regional variant needs confirmation if sub-board required',deviceConfidence:'confirmed',repair:'Screen assessment',price:null,service:'Mobile call-out',address:'Morriston',postcode:'SA6',date:'Today',slot:'11:30',compatibility:'variant-sensitive',partState:'not_checked',paymentState:'unpaid',priority:'high',status:'booked'},'seed'));
    made.push(createJob({customerName:'Casey Williams',device:'iPhone 12',deviceConfidence:'confirmed',repair:'Battery replacement',price:69,service:'Drop-in · Killay',address:'Killay',postcode:'SA2',date:'Today',slot:'14:00',compatibility:'universal',partState:'in_stock',partName:'iPhone 12 battery',paymentState:'paid',priority:'normal',status:'completed'},'seed'));
    return made;
  }
  function label(status){return (STATUS.find(x=>x[0]===status)||[status,status])[1]}
  function partLabel(v){return (PART_STATES.find(x=>x[0]===v)||[v,v])[1]}
  function paymentLabel(v){return (PAYMENT_STATES.find(x=>x[0]===v)||[v,v])[1]}
  function subscribe(fn){const local=()=>fn(read());g.addEventListener('storage',local);g.addEventListener('irepair-db-change',local);if(bc)bc.addEventListener('message',local);return ()=>{g.removeEventListener('storage',local);g.removeEventListener('irepair-db-change',local);if(bc)bc.removeEventListener('message',local)}}
  g.IRepairDB={KEY,STATUS,PART_STATES,PAYMENT_STATES,read,write,listJobs,getJob,createJob,updateJob,setStatus,setPartState,setPaymentState,addNote,setCustomerMessage,addEvent,createDemoBooking,createDemoDay,clear,label,partLabel,paymentLabel,subscribe};
})(window);