/* Build 18 · customer-side hosted Core handshake */
(function(){
  if(!window.IRepairDB)return;
  function esc16(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function jobs16(){return IRepairDB.listJobs().filter(j=>j.source==='customer-app').slice(0,3)}
  function statusClass16(s){return ['completed','cancelled'].includes(s)?s:'active'}
  function coreState16(){const c=IRepairDB.connection||{};return c.online?'<div class="tip" style="margin-bottom:10px"><strong>iRepair Core connected ✓</strong><br>Your repair can sync with the technician app across devices.</div>':'<div class="tip" style="margin-bottom:10px"><strong>Connecting to iRepair Core…</strong><br>The app is using its local cache and will retry automatically.</div>'}
  function customerTimeline(j){const ev=(j.timeline||[]).filter(e=>e.visibility!=='internal').slice().reverse().slice(0,4);if(!ev.length)return '';return '<div style="margin-top:10px">'+ev.map(e=>'<div class="line-meta" style="padding:5px 0;border-top:1px solid #dceaf7"><strong>'+esc16(e.label)+'</strong><br>'+new Date(e.at).toLocaleString('en-GB')+'</div>').join('')+'</div>'}
  function customerSyncCard16(){
    const jobs=jobs16();
    return '<section class="glass panel" id="prototypeSync16">'+
      '<div class="eyebrow">PROTOTYPE · CUSTOMER ↔ iREPAIR CORE ↔ TECHNICIAN</div>'+ 
      '<h2>Your repair connection</h2>'+ 
      '<p class="muted">This customer view only refreshes repair references already known to this device. Technician-only notes and other customers’ jobs are not shown here.</p>'+ 
      coreState16()+
      (jobs.length?'<div>'+jobs.map(j=>'<div class="line"><div class="flexbetween"><strong>'+esc16(j.device)+'</strong><span class="pill '+statusClass16(j.status)+'">'+esc16(IRepairDB.label(j.status))+'</span></div><div class="line-meta">'+esc16(j.repair)+' · '+esc16(j.service)+(j.postcode?' · '+esc16(j.postcode):'')+'</div><div class="line-meta">Reference '+esc16(j.id)+' · '+esc16(IRepairDB.paymentLabel?IRepairDB.paymentLabel(j.paymentState):j.paymentState)+'</div>'+(j.customerMessage?'<div class="tip" style="margin-top:9px"><strong>Update from iRepair:</strong><br>'+esc16(j.customerMessage)+'</div>':'')+customerTimeline(j)+'</div>').join('')+'</div>':'<div class="tip">No prototype booking is saved on this device yet. Create one below, then open the technician app on this or another device.</div>')+
      '<div class="button-row"><button class="btn" data-db16="create">Create demo booking</button><button class="btn secondary" data-db16="tech">Open technician app</button></div>'+ 
      '<button class="btn ghost" data-db16="refresh">Sync with Core ↻</button>'+ 
      '</section>';
  }
  const oldHome16=homeScreen;
  homeScreen=function(){return oldHome16()+customerSyncCard16()};
  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b||!b.dataset.db16)return;const a=b.dataset.db16;
    if(a==='create'){
      const job=IRepairDB.createDemoBooking();
      try{toast('Demo booking '+job.id+' created and queued for iRepair Core.')}catch(err){}
      render();return;
    }
    if(a==='tech'){window.open('/tech.html','_blank');return}
    if(a==='refresh'){
      IRepairDB.syncRemote().then(function(){try{render()}catch(e){}});return;
    }
  },false);
  IRepairDB.subscribe(function(){if(typeof mode!=='undefined'&&mode==='home'){try{render()}catch(e){}}});
  if(IRepairDB.subscribeConnection)IRepairDB.subscribeConnection(function(){if(typeof mode!=='undefined'&&mode==='home'){try{render()}catch(e){}}});
})();
