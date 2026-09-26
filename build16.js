/* Build 17 · customer-side prototype database handshake */
(function(){
  if(!window.IRepairDB)return;
  function esc16(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function jobs16(){return IRepairDB.listJobs().filter(j=>j.source==='customer-app').slice(0,3)}
  function statusClass16(s){return ['completed','cancelled'].includes(s)?s:'active'}
  function customerTimeline(j){const ev=(j.timeline||[]).filter(e=>e.visibility!=='internal').slice().reverse().slice(0,4);if(!ev.length)return '';return '<div style="margin-top:10px">'+ev.map(e=>'<div class="line-meta" style="padding:5px 0;border-top:1px solid #dceaf7"><strong>'+esc16(e.label)+'</strong><br>'+new Date(e.at).toLocaleString('en-GB')+'</div>').join('')+'</div>'}
  function customerSyncCard16(){
    const jobs=jobs16();
    return '<section class="glass panel" id="prototypeSync16">'+
      '<div class="eyebrow">PROTOTYPE · CUSTOMER ↔ TECHNICIAN</div>'+ 
      '<h2>Your repair connection</h2>'+ 
      '<p class="muted">This is the same repair record the technician app is using. Status, payment and customer updates flow back here from the technician side.</p>'+ 
      (jobs.length?'<div>'+jobs.map(j=>'<div class="line"><div class="flexbetween"><strong>'+esc16(j.device)+'</strong><span class="pill '+statusClass16(j.status)+'">'+esc16(IRepairDB.label(j.status))+'</span></div><div class="line-meta">'+esc16(j.repair)+' · '+esc16(j.service)+(j.postcode?' · '+esc16(j.postcode):'')+'</div><div class="line-meta">Reference '+esc16(j.id)+' · '+esc16(IRepairDB.paymentLabel?IRepairDB.paymentLabel(j.paymentState):j.paymentState)+'</div>'+(j.customerMessage?'<div class="tip" style="margin-top:9px"><strong>Update from iRepair:</strong><br>'+esc16(j.customerMessage)+'</div>':'')+customerTimeline(j)+'</div>').join('')+'</div>':'<div class="tip">No prototype bookings yet. Create one below, then open the technician app.</div>')+
      '<div class="button-row"><button class="btn" data-db16="create">Create demo booking</button><button class="btn secondary" data-db16="tech">Open technician app</button></div>'+ 
      (jobs.length?'<button class="btn ghost" data-db16="refresh">Refresh status ↻</button>':'')+
      '</section>';
  }
  const oldHome16=homeScreen;
  homeScreen=function(){return oldHome16()+customerSyncCard16()};
  document.addEventListener('click',function(e){const b=e.target.closest('button');if(!b||!b.dataset.db16)return;const a=b.dataset.db16;if(a==='create'){const job=IRepairDB.createDemoBooking();try{toast('Demo booking '+job.id+' created. Open the technician app to see it.')}catch(err){}render();return}if(a==='tech'){window.open('/tech.html','_blank');return}if(a==='refresh'){render();return}},false);
  IRepairDB.subscribe(function(){if(typeof mode!=='undefined'&&mode==='home'){try{render()}catch(e){}}});
})();
