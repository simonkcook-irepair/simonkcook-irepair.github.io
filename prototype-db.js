/* iRepair Core · shared prototype data adapter
   Build 18: local-first UI contract + hosted cross-device API synchronisation.
   Customer and technician screens keep a fast local cache while the Replit API
   becomes the shared source across different devices. */
(function(g){
  const KEY='irepair_core_prototype_db_v1';
  const CHANNEL='irepair_core_prototype_sync';
  const API_BASE='https://treasured-delightful-profile--simonkcook.replit.app/api';
  const STATUS=[
    ['booked','Booked'],['confirmed','Confirmed'],['on_my_way','On my way'],['arrived','Arrived'],
    ['repairing','Repairing'],['waiting_part','Waiting for part'],['completed','Completed'],['cancelled','Cancelled']
  ];
  const PART_STATES=[
    ['not_checked','Not checked'],['in_stock','In stock'],['order_required','Order required'],
    ['ordered','Ordered'],['received','Received'],['fitted','Fitted']
  ];
  const PAYMENT_STATES=[['unpaid','Unpaid'],['deposit','Deposit paid'],['paid','Paid']];
  const PRIORITIES=[['normal','Normal'],['high','High']];
  let bc=null,syncTimer=null,syncing=false;
  const connection={online:false,lastSuccess:null,lastError:null,apiBase:API_BASE};
  try{bc=('BroadcastChannel' in g)?new BroadcastChannel(CHANNEL):null}catch(e){}

  function iso(){return new Date().toISOString()}
  function blank(){return {version:3,jobs:[],customers:[],updatedAt:iso()}}
  function uid(prefix){return (prefix||'IR')+'-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
  function event(type,label,actor,visibility){return {id:uid('EV'),type:type||'update',label:String(label||''),actor:actor||'System',visibility:visibility||'customer',at:iso()}}
  function hydrateJob(j){
    if(!j)return j;
    return Object.assign({
      id:uid('IR'),customerId:uid('CU'),customerName:'Demo customer',phone:'',email:'',device:'Unconfirmed device',variant:'',
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
      v.version=3;v.jobs=v.jobs.map(hydrateJob);if(!Array.isArray(v.customers))v.customers=[];return v;
    }catch(e){return blank()}
  }
  function write(state,source){
    state.version=3;state.updatedAt=iso();
    try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
    try{bc&&bc.postMessage({type:'changed',source:source||'unknown',at:state.updatedAt})}catch(e){}
    try{g.dispatchEvent(new CustomEvent('irepair-db-change',{detail:{source:source||'unknown'}}))}catch(e){}
    return state;
  }
  function markConnection(ok,err){
    connection.online=!!ok;
    if(ok){connection.lastSuccess=iso();connection.lastError=null}else if(err){connection.lastError=String(err&&err.message||err)}
    try{g.dispatchEvent(new CustomEvent('irepair-api-change',{detail:Object.assign({},connection)}))}catch(e){}
  }
  async function api(path,options){
    const opts=Object.assign({method:'GET',headers:{'Accept':'application/json'}},options||{});
    opts.headers=Object.assign({'Accept':'application/json'},opts.headers||{});
    if(opts.body && typeof opts.body!=='string'){
      opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(opts.body);
    }
    const res=await fetch(API_BASE+path,opts);
    const text=await res.text();let data=null;
    try{data=text?JSON.parse(text):null}catch(e){data={raw:text}}
    if(!res.ok)throw new Error('API '+res.status+(data&&data.error?' · '+data.error:''));
    markConnection(true);return data;
  }
  function jobsFrom(data){
    if(Array.isArray(data))return data;
    if(data&&Array.isArray(data.jobs))return data.jobs;
    if(data&&Array.isArray(data.data))return data.data;
    return [];
  }
  function jobFrom(data){
    if(!data)return null;
    if(data.job&&typeof data.job==='object')return data.job;
    if(data.data&&typeof data.data==='object'&&!Array.isArray(data.data))return data.data;
    return typeof data==='object'&&!Array.isArray(data)?data:null;
  }
  function mergeRemoteJob(remote,localId){
    const r=hydrateJob(remote);const s=read();
    let i=s.jobs.findIndex(j=>j.id===r.id);
    if(i<0 && localId)i=s.jobs.findIndex(j=>j.id===localId);
    if(i>=0)s.jobs[i]=hydrateJob(Object.assign({},s.jobs[i],r));else s.jobs.unshift(r);
    write(s,'remote');return r;
  }
  async function syncRemote(){
    if(syncing)return read();syncing=true;
    try{
      const data=await api('/jobs');const remote=jobsFrom(data).map(hydrateJob);const local=read();
      const pending=local.jobs.filter(j=>j._pendingCreate && !remote.some(r=>r.id===j.id));
      const merged=remote.concat(pending);write({version:3,jobs:merged,customers:local.customers||[],updatedAt:iso()},'remote-sync');
      return read();
    }catch(e){markConnection(false,e);return read()}finally{syncing=false}
  }
  function queueCreate(job){
    api('/jobs',{method:'POST',body:job}).then(data=>{
      const r=jobFrom(data);if(r)mergeRemoteJob(Object.assign({},r,{_pendingCreate:false}),job.id);
      else updateLocalOnly(job.id,{_pendingCreate:false},'remote-create');
    }).catch(e=>{markConnection(false,e);updateLocalOnly(job.id,{_pendingCreate:true},'remote-pending')});
  }
  function queuePatch(id,patch){api('/jobs/'+encodeURIComponent(id),{method:'PATCH',body:patch}).then(data=>{const r=jobFrom(data);if(r)mergeRemoteJob(r,id)}).catch(e=>markConnection(false,e))}
  function queueAction(id,route,body){api('/jobs/'+encodeURIComponent(id)+'/'+route,{method:'POST',body:body||{}}).then(data=>{const r=jobFrom(data);if(r)mergeRemoteJob(r,id)}).catch(e=>markConnection(false,e))}
  function normaliseJob(input){
    const now=iso();const job=hydrateJob(Object.assign({id:uid('IR'),createdAt:now,updatedAt:now,_pendingCreate:true},input||{}));
    if(!job.timeline.length)job.timeline=[event('created','Repair request created','Customer','customer')];return job;
  }
  function createJob(input,source){const s=read();const job=normaliseJob(input);s.jobs.unshift(job);write(s,source||'customer');queueCreate(job);return job}
  function getJob(id){return read().jobs.find(j=>j.id===id)||null}
  function listJobs(){return read().jobs.slice().sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))}
  function updateLocalOnly(id,patch,source){const s=read();const i=s.jobs.findIndex(j=>j.id===id);if(i<0)return null;s.jobs[i]=hydrateJob(Object.assign({},s.jobs[i],patch||{},{updatedAt:iso()}));write(s,source||'local');return s.jobs[i]}
  function updateJob(id,patch,source){const j=updateLocalOnly(id,patch,source||'technician');if(j)queuePatch(id,patch||{});return j}
  function addEvent(id,type,labelText,actor,visibility,source){const j=getJob(id);if(!j)return null;const timeline=(j.timeline||[]).slice();timeline.push(event(type,labelText,actor,visibility));return updateJob(id,{timeline},source||'technician')}
  function setStatus(id,status,source){
    if(!STATUS.some(x=>x[0]===status))return null;const j=getJob(id);if(!j)return null;
    const timeline=(j.timeline||[]).concat([event('status','Status changed to '+label(status),'Technician','customer')]);
    const out=updateLocalOnly(id,{status,timeline},source||'technician');queueAction(id,'status',{status,actor:'Technician'});return out;
  }
  function setPartState(id,partState,source){
    if(!PART_STATES.some(x=>x[0]===partState))return null;const j=getJob(id);if(!j)return null;
    const timeline=(j.timeline||[]).concat([event('part','Part status: '+partLabel(partState),'Technician','internal')]);
    const out=updateLocalOnly(id,{partState,timeline},source||'technician');queueAction(id,'part-state',{partState,actor:'Technician'});return out;
  }
  function setPaymentState(id,paymentState,source){
    if(!PAYMENT_STATES.some(x=>x[0]===paymentState))return null;const j=getJob(id);if(!j)return null;
    const timeline=(j.timeline||[]).concat([event('payment','Payment: '+paymentLabel(paymentState),'Technician','customer')]);
    const out=updateLocalOnly(id,{paymentState,timeline},source||'technician');queueAction(id,'payment-state',{paymentState,actor:'Technician'});return out;
  }
  function setPriority(id,priority,source){
    if(!PRIORITIES.some(x=>x[0]===priority))return null;const out=updateLocalOnly(id,{priority},source||'technician');if(out)queueAction(id,'priority',{priority,actor:'Technician'});return out;
  }
  function addNote(id,text,author,source){
    const job=getJob(id);const value=String(text||'').trim();if(!job||!value)return null;
    const notes=(job.notes||[]).slice();notes.push({id:uid('NO'),text:value,author:author||'Technician',at:iso()});
    const out=updateLocalOnly(id,{notes},source||'technician');queueAction(id,'notes',{text:value,author:author||'Technician'});return out;
  }
  function setCustomerMessage(id,text,source){
    const job=getJob(id);if(!job)return null;const value=String(text||'').trim();const timeline=(job.timeline||[]).slice();
    if(value)timeline.push(event('message',value,'Technician','customer'));
    const out=updateLocalOnly(id,{customerMessage:value,timeline},source||'technician');
    if(value)queueAction(id,'customer-updates',{text:value,author:'Technician'});return out;
  }
  function clear(){write(blank(),'reset');syncRemote()}
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
  function priorityLabel(v){return (PRIORITIES.find(x=>x[0]===v)||[v,v])[1]}
  function subscribe(fn){const local=()=>fn(read());g.addEventListener('storage',local);g.addEventListener('irepair-db-change',local);if(bc)bc.addEventListener('message',local);return ()=>{g.removeEventListener('storage',local);g.removeEventListener('irepair-db-change',local);if(bc)bc.removeEventListener('message',local)}}
  function subscribeConnection(fn){const h=e=>fn(e.detail||Object.assign({},connection));g.addEventListener('irepair-api-change',h);return ()=>g.removeEventListener('irepair-api-change',h)}
  function startSync(){syncRemote();if(!syncTimer)syncTimer=setInterval(()=>{if(document.visibilityState!=='hidden')syncRemote()},7000)}
  g.IRepairDB={KEY,API_BASE,STATUS,PART_STATES,PAYMENT_STATES,PRIORITIES,connection,read,write,listJobs,getJob,createJob,updateJob,setStatus,setPartState,setPaymentState,setPriority,addNote,setCustomerMessage,addEvent,createDemoBooking,createDemoDay,clear,label,partLabel,paymentLabel,priorityLabel,subscribe,subscribeConnection,syncRemote,startSync};
  startSync();
})(window);