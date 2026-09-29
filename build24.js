/* iRepair Core · Build 24
   Customer booking improvements: true multi-repair selection, secondary repair contact,
   Core demo booking creation, and job-specific Repair Relay handoff. */
(function(){
  'use strict';
  if(typeof repairSelection!=='function'||typeof IRepairDB==='undefined') return;

  const GROWTH_API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/growth-api';
  const API_KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
  let multiFaults=[];
  let repairQueue=[];
  let queueActive=false;
  let bookingContact={enabled:false,name:'',relationship:'',phone:'',email:'',receivesUpdates:true};
  let submittedJobs=[];

  const style=document.createElement('style');
  style.textContent=`
    .fault.b24-selected{background:linear-gradient(135deg,#d6ecff,#a8d3ff);border:1px solid #4b9cf5;color:#0753ae;box-shadow:inset 0 1px 2px #fff,0 4px 14px #4685c044}
    .fault.b24-added{background:linear-gradient(135deg,#e4f8eb,#c8edd6);border-color:#62b886;color:#24633f}
    .b24-selection{margin-top:12px;padding:12px;border-radius:16px;background:#eef8ff;border:1px solid #badcf8;color:#315c82;font-size:12px;line-height:1.5}
    .b24-contact{margin-top:15px;padding:14px;border-radius:19px;background:#f6fbff;border:1px solid #d5eafa}
    .b24-contact .inputrow{background:#fff}
    .b24-summary{padding:12px 13px;margin:10px 0;border-radius:16px;background:#eef8ff;border:1px solid #beddf7;color:#315c82;font-size:12px;line-height:1.5}
    .b24-complete{padding:15px;border-radius:18px;background:#e8faef;border:1px solid #a7ddb9;color:#245e3d;margin:12px 0}
  `;
  document.head.appendChild(style);

  const originalRepairSelection=repairSelection;
  const originalAddRepair=addRepair;
  const originalServiceScreen=serviceScreen;
  const originalReviewScreen=reviewScreen;
  const originalFinishScreen=finishScreen;
  const originalRestart=restart;

  function currentDeviceRepairs(){return basket.filter(r=>r.deviceId===active)}
  function selectedFaultCount(){return multiFaults.filter(id=>!currentDeviceRepairs().some(r=>r.fault===id)).length}

  repairSelection=function(){
    let d=selected(),count=currentDeviceRepairs().length;
    let options='<option value="">Select your device</option>'+Object.entries(CATALOGUE).map(([key,v])=>`<option value="${key}" ${d.model===key?'selected':''}>${safe(v.name)}</option>`).join('');
    let tabs=devices.map(dd=>`<button class="devtab" aria-pressed="${active===dd.id}" type="button" data-device="${dd.id}">Device ${dd.id} · ${safe(displayModel(dd))}</button>`).join('');
    let faults=FAULTS.map(f=>{
      const added=currentDeviceRepairs().some(r=>r.fault===f.id);
      const pending=multiFaults.includes(f.id);
      const activeNow=fault===f.id;
      const cls=added?' b24-added':(pending||activeNow?' b24-selected':'');
      return `<button type="button" class="fault${cls}" data-multi-fault="${f.id}" aria-pressed="${added||pending||activeNow}"><span class="emoji">${f.icon}</span><span>${safe(f.label)}</span>${added||pending||activeNow?'<span class="check">✓</span>':''}</button>`;
    }).join('');
    const pending=selectedFaultCount();
    const selectorNote=queueActive
      ?`<div class="b24-selection"><strong>Setting up your selected repairs…</strong><br>Complete the options below and iRepair will automatically move to the next selected repair.</div>`
      :`<div class="b24-selection"><strong>Select everything that needs attention.</strong><br>Tap Screen, Battery, Charging or any other combination first. ${pending?`<strong>${pending} repair${pending===1?'':'s'} selected.</strong>`:'You can select more than one.'}${pending?`<button type="button" class="btn" style="margin-top:10px" data-build24="start-selected">Continue with ${pending} selected repair${pending===1?'':'s'} →</button>`:''}</div>`;
    return `<section class="glass panel"><div class="eyebrow">YOUR DEVICE</div><div class="device-tabs">${tabs}</div><button type="button" class="btn secondary" data-action="add-device">＋ Add another device</button><label class="field-label" for="model">Select exact model</label><select class="field" id="model">${options}</select>${d.model==='otherphone'?`<label class="field-label" for="customModel">Exact model</label><input class="field" id="customModel" maxlength="90" placeholder="e.g. Samsung Galaxy S23 Ultra" value="${safe(d.custom)}">`:''}${count?`<p class="helper">${count} repair(s) already attached to this device.</p>`:''}<div class="divider"></div><div class="eyebrow">WHAT NEEDS ATTENTION?</div><p class="muted">Choose <strong>all</strong> the repairs or symptoms that apply. We’ll collect the options for each one next.</p><div class="fault-grid">${faults}</div>${selectorNote}</section>${fault?repairDetails():''}${basketPanel()}`;
  };

  function openNextQueuedRepair(){
    const next=repairQueue.shift();
    if(!next){
      queueActive=false; multiFaults=[]; fault=''; variant=''; editId=null; resetDiagnostic(); render();
      toast('All selected repairs have been added.');
      setTimeout(()=>document.getElementById('basket')?.scrollIntoView({block:'start',behavior:'smooth'}),0);
      return;
    }
    fault=next; variant=''; editId=null; resetDiagnostic(); render();
    setTimeout(()=>document.getElementById('faultDetail')?.scrollIntoView({block:'start',behavior:'smooth'}),0);
  }

  addRepair=function(){
    const before=basket.length;
    originalAddRepair();
    if(queueActive&&basket.length>before){
      setTimeout(openNextQueuedRepair,0);
    }
  };

  function contactSection(){
    return `<div class="b24-contact"><div class="eyebrow">SECONDARY REPAIR CONTACT · OPTIONAL</div><h3>Will somebody else need the repair updates?</h3><p class="muted">Useful when this phone is being handed to iRepair and you won’t be able to receive messages on it. A friend, partner or family member can use their phone as the temporary contact point.</p><label class="inputrow"><input type="checkbox" id="bookingContactEnabled" ${bookingContact.enabled?'checked':''}> Use a secondary contact for this repair</label>${bookingContact.enabled?`<label class="field-label" for="bookingContactName">Their name</label><input class="field" id="bookingContactName" value="${safe(bookingContact.name)}" placeholder="e.g. Partner / family member"><label class="field-label" for="bookingContactPhone">Their mobile number</label><input class="field" id="bookingContactPhone" inputmode="tel" value="${safe(bookingContact.phone)}" placeholder="Mobile number"><label class="field-label" for="bookingContactRelationship">Relationship</label><input class="field" id="bookingContactRelationship" value="${safe(bookingContact.relationship)}" placeholder="Friend, partner, parent…"><label class="field-label" for="bookingContactEmail">Email (optional)</label><input class="field" id="bookingContactEmail" inputmode="email" value="${safe(bookingContact.email)}" placeholder="Email address"><label class="inputrow"><input type="checkbox" id="bookingContactUpdates" ${bookingContact.receivesUpdates?'checked':''}> Send repair updates to this person</label><div class="tip"><strong>Repair Relay:</strong> after the request is created, you can send this person a temporary, cut-down repair link. It only shows this repair’s status and chat — not the full customer app.</div>`:''}<p class="helper">Prototype testing only: please use test contact details until authenticated customer accounts are enabled.</p></div>`;
  }

  serviceScreen=function(){
    let html=originalServiceScreen();
    const marker='<div class="button-row"><button type="button" class="btn secondary" data-action="back-repairs">';
    if(html.includes(marker)) html=html.replace(marker,contactSection()+marker);
    return html;
  };

  reviewScreen=function(){
    let html=originalReviewScreen();
    const summary=bookingContact.enabled?`<div class="b24-summary"><strong>Secondary repair contact</strong><br>${safe(bookingContact.name||'Name required')}${bookingContact.relationship?' · '+safe(bookingContact.relationship):''}<br>${safe(bookingContact.phone||'Mobile required')}${bookingContact.receivesUpdates?'<br>Receives repair updates ✓':''}<br><span class="helper">A Repair Relay link can be shared after the request is created.</span></div>`:'<div class="b24-summary"><strong>Secondary repair contact:</strong> Not required for this repair.</div>';
    html=html.replace('<div class="warning">Demo only: no personal information is sent, no appointment is booked, and no payment or valuation is processed.</div>',summary+'<div class="warning">Prototype only: this creates a synthetic/demo repair record in iRepair Core. Use test contact details only until secure customer accounts are enabled.</div>');
    return html;
  };

  function jobInputForDevice(deviceId){
    const items=basket.filter(r=>r.deviceId===deviceId);
    const priced=items.filter(r=>r.price!==null&&!r.review&&!r.conditional);
    const allPriced=priced.length===items.length;
    const total=allPriced?priced.reduce((sum,r)=>sum+r.price,0):null;
    return {
      customerName:'Prototype customer',
      phone:'',email:'',
      device:displayModel(getDevice(deviceId)),
      deviceConfidence:getDevice(deviceId).model==='otherphone'?'unconfirmed':'confirmed',
      repair:items.map(r=>r.faultLabel+' · '+r.option).join(' + '),
      price:total,
      service:service==='callout'?'Mobile call-out':'Drop-in · Killay',
      address:service==='callout'?place:'Killay',postcode:postcode||'',date:date||'Today',slot:daypart||'',
      compatibility:'unknown',partState:'not_checked',paymentState:'unpaid',status:'booked',source:'customer-app'
    };
  }

  function submitBookingToCore(){
    if(!basket.length){toast('Add at least one repair first.');return false}
    if(bookingContact.enabled&&(!bookingContact.name.trim()||!bookingContact.phone.trim())){toast('Please add the secondary contact name and mobile number.');return false}
    const ids=[...new Set(basket.map(r=>r.deviceId))];
    submittedJobs=ids.map(deviceId=>IRepairDB.createJob(jobInputForDevice(deviceId),'customer-app'));
    if(bookingContact.enabled){
      submittedJobs.forEach(job=>IRepairDB.addSecondaryContact(job.id,{fullName:bookingContact.name,relationship:bookingContact.relationship,phone:bookingContact.phone,email:bookingContact.email,receivesUpdates:bookingContact.receivesUpdates,isPrimaryHandoverContact:true},'customer'));
    }
    mode='finish'; render(); window.scrollTo({top:0,behavior:'instant'});
    return true;
  }

  async function growth(path,options){
    const o=Object.assign({method:'GET',headers:{}},options||{});
    o.headers=Object.assign({'Accept':'application/json','Authorization':'Bearer '+API_KEY,'apikey':API_KEY},o.headers||{});
    if(o.body&&typeof o.body!=='string'){o.headers['Content-Type']='application/json';o.body=JSON.stringify(o.body)}
    const r=await fetch(GROWTH_API+path,o);const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(e){}
    if(!r.ok)throw new Error(d.error||('HTTP '+r.status));return d;
  }
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function createRelayWithRetry(jobId){
    let lastError=null;
    for(let i=0;i<5;i++){
      try{return await growth('/relay',{method:'POST',body:{repairId:jobId,displayName:bookingContact.name||'Repair contact',phone:bookingContact.phone||'',email:bookingContact.email||''}})}catch(e){lastError=e;await wait(700)}
    }
    throw lastError||new Error('Repair Relay unavailable');
  }
  async function shareUrl(title,text,url){
    if(navigator.share){await navigator.share({title,text,url});return}
    try{await navigator.clipboard.writeText(text+'\n\n'+url);toast('Repair Relay link copied.')}catch(e){window.prompt('Copy this Repair Relay link',url)}
  }
  async function shareRelay(jobId,button){
    if(!bookingContact.enabled){toast('No secondary contact was added to this repair.');return}
    if(button){button.disabled=true;button.textContent='Creating Repair Relay…'}
    try{
      const d=await createRelayWithRetry(jobId);
      await shareUrl('iRepair Repair Relay','This temporary iRepair link lets you follow the repair and message Simon while the phone is being repaired.',d.relayUrl);
      if(button){button.disabled=false;button.textContent='Share Repair Relay again'}
    }catch(e){if(button){button.disabled=false;button.textContent='Try Repair Relay again'}toast('Repair Relay is still syncing. Please try again in a moment.')}
  }

  finishScreen=function(){
    if(!submittedJobs.length) return originalFinishScreen();
    const refs=submittedJobs.map(j=>`<div class="line"><strong>${safe(j.device)}</strong><div class="line-meta">${safe(j.repair)}<br>Reference ${safe(j.id)}</div></div>`).join('');
    return `<section class="glass panel" role="status"><div style="font-size:42px;text-align:center">✅</div><h2 style="text-align:center">Repair request created</h2><div class="b24-complete"><strong>iRepair Core has the repair.</strong><br>Your selected repairs are grouped against the same device and can now be managed from the technician app.</div>${refs}${bookingContact.enabled?`<div class="b24-summary"><strong>${safe(bookingContact.name)} is the secondary contact.</strong><br>Use the button below to send the actual <strong>Repair Relay</strong> — a temporary mini-app for this repair only.</div><button type="button" class="btn" data-build24-relay="${safe(submittedJobs[0].id)}">Send Repair Relay to ${safe(bookingContact.name)} →</button>`:'<div class="b24-summary">No secondary contact was selected. Repair updates stay with the primary customer flow.</div>'}<button type="button" class="btn secondary" style="margin-top:10px" data-action="restart">Start another repair ↻</button></section>`;
  };

  restart=function(){
    multiFaults=[];repairQueue=[];queueActive=false;bookingContact={enabled:false,name:'',relationship:'',phone:'',email:'',receivesUpdates:true};submittedJobs=[];
    originalRestart();
  };

  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.multiFault){
      e.preventDefault();e.stopPropagation();
      const id=b.dataset.multiFault;
      const existing=currentDeviceRepairs().find(r=>r.fault===id);
      if(existing&&!queueActive){editRepair(existing.id);return}
      if(queueActive){toast('Finish the selected repair options first.');return}
      multiFaults=multiFaults.includes(id)?multiFaults.filter(x=>x!==id):multiFaults.concat(id);render();return;
    }
    if(b.dataset.build24==='start-selected'){
      e.preventDefault();e.stopPropagation();
      repairQueue=multiFaults.filter(id=>!currentDeviceRepairs().some(r=>r.fault===id));
      if(!repairQueue.length){toast('Choose at least one new repair.');return}
      queueActive=true;openNextQueuedRepair();return;
    }
    if(b.dataset.build24Relay){e.preventDefault();e.stopPropagation();shareRelay(b.dataset.build24Relay,b);return}
  },true);

  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.action==='next-review'&&bookingContact.enabled&&(!bookingContact.name.trim()||!bookingContact.phone.trim())){
      e.preventDefault();e.stopImmediatePropagation();toast('Please add the secondary contact name and mobile number.');
      return;
    }
    if(b.dataset.action==='finish'&&mode==='book'&&stage===3){
      e.preventDefault();e.stopImmediatePropagation();submitBookingToCore();
    }
  },true);

  document.addEventListener('change',function(e){
    const x=e.target;
    if(x.id==='bookingContactEnabled'){bookingContact.enabled=!!x.checked;render();return}
    if(x.id==='bookingContactUpdates'){bookingContact.receivesUpdates=!!x.checked;return}
  });
  document.addEventListener('input',function(e){
    const x=e.target;
    if(x.id==='bookingContactName')bookingContact.name=x.value;
    if(x.id==='bookingContactPhone')bookingContact.phone=x.value;
    if(x.id==='bookingContactRelationship')bookingContact.relationship=x.value;
    if(x.id==='bookingContactEmail')bookingContact.email=x.value;
  });
})();
