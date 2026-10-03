/* iRepair Technician · Build 35 Satellite booking source badges. */
(function(){
'use strict';
if(!window.IRepairDB)return;
const DB=window.IRepairDB;
let scheduled=false;
function sourceEvent(job){return (job&&job.timeline||[]).slice().reverse().find(e=>e&&e.type==='satellite')||null}
function enhance(){
  scheduled=false;
  const map=new Map(DB.listJobs().map(j=>[j.id,j]));
  document.querySelectorAll('#main article.job').forEach(card=>{
    const opener=card.querySelector('[data-open]'),id=opener&&opener.dataset.open,job=id&&map.get(id),ev=sourceEvent(job);
    let badge=card.querySelector('.satellite35-source');
    if(!ev){if(badge)badge.remove();return}
    const office=/office/i.test(String(ev.label||''));
    if(!badge){badge=document.createElement('div');badge.className='satellite35-source';const head=card.querySelector('.jobhead');if(head)head.insertAdjacentElement('afterend',badge);else card.prepend(badge)}
    badge.classList.toggle('office',office);
    const html='<span class="satellite35-pulse"></span><b>'+(office?'🏠 OFFICE SATELLITE':'📡 NEARBY SATELLITE')+'</b><small>'+(office?'Booked from live Killay office availability':'Booked from live nearby technician availability')+'</small>';
    if(badge.innerHTML!==html)badge.innerHTML=html;
  });
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance)}
const style=document.createElement('style');style.id='techBuild35Css';style.textContent=`
.satellite35-source{display:grid;grid-template-columns:12px auto 1fr;align-items:center;gap:7px;margin:8px 0 2px;padding:8px 10px;border-radius:11px;border:1px solid rgba(83,229,255,.42);background:linear-gradient(90deg,rgba(9,106,170,.25),rgba(13,48,76,.25));color:#bdeeff}.satellite35-source.office{border-color:rgba(94,239,143,.42);background:linear-gradient(90deg,rgba(20,130,74,.24),rgba(11,54,39,.24));color:#c9ffda}.satellite35-source b{font-size:10px;letter-spacing:.055em}.satellite35-source small{font-size:9.5px;color:#82aeca;text-align:right}.satellite35-source.office small{color:#88cda1}.satellite35-pulse{width:8px;height:8px;border-radius:50%;background:#52dcff;box-shadow:0 0 9px #52dcff}.satellite35-source.office .satellite35-pulse{background:#58f27f;box-shadow:0 0 9px #58f27f}@media(max-width:390px){.satellite35-source{grid-template-columns:10px 1fr}.satellite35-source small{grid-column:2;text-align:left}}
`;document.head.appendChild(style);
DB.subscribe(schedule);DB.subscribeConnection(schedule);
const obs=new MutationObserver(schedule);obs.observe(document.body,{childList:true,subtree:true});
window.addEventListener('irepair-api-change',schedule);schedule();
})();
(function(){
 if(!document.querySelector('script[data-irepair-tech36]')){const s=document.createElement('script');s.src='/tech-build36.js?v=36';s.dataset.irepairTech36='1';document.head.appendChild(s)}
 if(!document.querySelector('script[data-irepair-trip36]')){const s=document.createElement('script');s.src='/tech-trip36.js?v=37r2';s.dataset.irepairTrip36='1';document.head.appendChild(s)}
 if(!document.querySelector('script[data-irepair-trip38]')){const s=document.createElement('script');s.src='/tech-trip37-control.js?v=38';s.dataset.irepairTrip38='1';document.head.appendChild(s)}
})();
