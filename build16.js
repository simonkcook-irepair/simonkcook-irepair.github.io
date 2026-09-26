/* Build 16 · customer-side prototype database handshake */
(function(){
  if(!window.IRepairDB)return;
  function esc16(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function jobs16(){return IRepairDB.listJobs().filter(j=>j.source==='customer-app').slice(0,3)}
  function statusClass16(s){return ['completed','cancelled'].includes(s)?s:'active'}
  function customerSyncCard16(){
    const jobs=jobs16();
    return '<section class="glass panel" id="prototypeSync16">'+
      '<div class="eyebrow">PROTOTYPE · CUSTOMER ↔ TECHNICIAN</div>'+ 
      '<h2>Live repair handshake</h2>'+ 
      '<p class="muted">This temporary shared store lets you see a customer booking appear in the technician app and status changes come back here.</p>'+ 
      (jobs.length?'<div>'+jobs.map(j=>'<div class="line"><div class="flexbetween"><strong>'+esc16(j.device)+'</strong><span class="pill '+statusClass16(j.status)+'">'+esc16(IRepairDB.label(j.status))+'</span></div><div class="line-meta">'+esc16(j.repair)+' · '+esc16(j.service)+(j.postcode?' · '+esc16(j.postcode):'')+'</div><div class="line-meta">Reference '+esc16(j.id)+'</div></div>').join('')+'</div>':'<div class="tip">No prototype bookings yet. Create one below, then open the technician app.</div>')+
      '<div class="button-row"><button class="btn" data-db16="create">Create demo booking</button><button class="btn secondary" data-db16="tech">Open technician app</button></div>'+ 
      (jobs.length?'<button class="btn ghost" data-db16="refresh">Refresh status ↻</button>':'')+
      '</section>';
  }
  const oldHome16=homeScreen;
  homeScreen=function(){return oldHome16()+customerSyncCard16()};

  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b||!b.dataset.db16)return;
    const a=b.dataset.db16;
    if(a==='create'){
      const job=IRepairDB.createDemoBooking();
      try{toast('Demo booking '+job.id+' created. Open the technician app to see it.')}catch(err){}
      render();return;
    }
    if(a==='tech'){
      window.open('/tech.html','_blank');return;
    }
    if(a==='refresh'){render();return;}
  },false);

  IRepairDB.subscribe(function(){if(typeof mode!=='undefined'&&mode==='home'){try{render()}catch(e){}}});
})();
