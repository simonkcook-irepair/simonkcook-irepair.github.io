/* iRepair Core · Build 25
   Progressive customer journey: minimal landing and one decision at a time.
   Sell-device is only offered after repair pricing is visible.
   Home also exposes compact referral and Repair Relay entry points. */
(function(){
  'use strict';
  if(typeof homeScreen!=='function'||typeof repairSelection!=='function'||typeof basketPanel!=='function') return;

  const build24RepairSelection=repairSelection;
  const GROWTH_API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/growth-api';
  const API_KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
  let utilityView='';

  const style=document.createElement('style');
  style.textContent=`
    .b25-home{padding:22px 17px 19px;margin-top:5px}
    .b25-home h1{margin:5px 0 8px;font-size:31px}
    .b25-home .route-choice{margin-top:18px}
    .b25-home .route-card{min-height:92px;padding:17px}
    .b25-home .route-card strong{font-size:17px;line-height:1.25}
    .b25-other{margin-top:16px;padding-top:15px;border-top:1px solid #d6e7f5}
    .b25-other-title{font-size:10px;font-weight:900;letter-spacing:.08em;color:#6986a2;margin-bottom:8px}
    .b25-other-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .b25-other-btn{border:1px solid #bdd8ed;border-radius:16px;background:#f4faff;color:#244f74;padding:13px 11px;text-align:left;min-height:86px}
    .b25-other-btn strong{display:block;font-size:12px;line-height:1.25;color:#17466f}
    .b25-other-btn small{display:block;margin-top:5px;font-size:9px;line-height:1.4;color:#7890a7}
    .b25-utility{padding:20px 16px}
    .b25-utility h2{margin:5px 0 7px}
    .b25-relay-note{padding:11px 12px;border-radius:15px;background:#edf7ff;border:1px solid #c9e3f7;color:#476b89;font-size:10px;line-height:1.5;margin:10px 0 13px}
    .b25-device-only{padding:20px 16px}
    .b25-device-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;margin-bottom:13px;border-radius:16px;background:#edf7ff;border:1px solid #c5e1f7;color:#2f5d84}
    .b25-device-summary strong{display:block;color:#153f68;font-size:13px}
    .b25-device-summary small{display:block;margin-top:2px;font-size:10px;color:#6b88a3}
    .b25-change{border:1px solid #9acaf5;border-radius:12px;background:#fff;color:#1763ad;padding:7px 10px;font-size:10px;font-weight:800;white-space:nowrap}
    .b25-sell{margin-top:13px;padding:14px;border-radius:18px;background:#f7fbff;border:1px solid #d0e6f8}
    .b25-sell h3{margin:0 0 5px;font-size:14px}
    .b25-sell p{margin:0 0 10px}
  `;
  document.head.appendChild(style);

  async function growth25(path,options){
    const o=Object.assign({method:'GET',headers:{}},options||{});
    o.headers=Object.assign({'Accept':'application/json','Authorization':'Bearer '+API_KEY,'apikey':API_KEY},o.headers||{});
    if(o.body&&typeof o.body!=='string'){o.headers['Content-Type']='application/json';o.body=JSON.stringify(o.body)}
    const r=await fetch(GROWTH_API+path,o),text=await r.text();let data={};
    try{data=text?JSON.parse(text):{}}catch(e){}
    if(!r.ok)throw new Error(data.error||('HTTP '+r.status));return data;
  }
  async function shareIRepair25(){
    try{
      const d=await growth25('/referrals',{method:'POST',body:{channel:'native-share',sourceContext:'home'}});
      const title='iRepair';
      const text='If you ever need help with your phone, I recommend iRepair.';
      if(navigator.share){await navigator.share({title,text,url:d.shareUrl});return}
      try{await navigator.clipboard.writeText(text+'\n\n'+d.shareUrl);toast('iRepair link copied — ready to send.')}catch(e){window.prompt('Copy this iRepair link',d.shareUrl)}
    }catch(e){toast('The share link is unavailable at the moment. Please try again.')}
  }
  function openRelay25(raw){
    let value=String(raw||'').trim();
    if(!value){toast('Paste the Repair Relay link or code first.');return}
    try{
      if(/^https?:\/\//i.test(value)){
        const u=new URL(value);
        if(u.hostname!=='simonkcook-irepair.github.io'||u.pathname!=='/relay.html'||!u.searchParams.get('t')){toast('That does not look like an iRepair Repair Relay link.');return}
        location.href='/relay.html?t='+encodeURIComponent(u.searchParams.get('t'));return;
      }
      value=value.replace(/^.*[?&]t=/,'').split('&')[0].trim();
      if(!value){toast('That Repair Relay code is incomplete.');return}
      location.href='/relay.html?t='+encodeURIComponent(value);
    }catch(e){toast('That Repair Relay link could not be opened.')}
  }

  /* Front page: two main repair routes, then two compact utility routes. */
  homeScreen=function(){
    if(utilityView==='relay'){
      return `<section class="glass panel b25-utility">
        <div class="eyebrow">REPAIR RELAY</div>
        <h2>Helping with someone else’s repair?</h2>
        <p class="muted">Repair Relay is the cut-down iRepair view for a friend, partner or family member who is acting as the contact while the customer’s phone is with me.</p>
        <div class="b25-relay-note"><strong>Already received a Relay link?</strong><br>You can simply tap that link in the message you were sent. Or paste the link / Relay code below.</div>
        <input class="field" id="b25RelayInput" autocomplete="off" autocapitalize="off" placeholder="Paste Repair Relay link or code">
        <button type="button" class="btn" style="margin-top:10px" data-build25-open-relay>Open Repair Relay →</button>
        <button type="button" class="btn secondary" style="margin-top:8px" data-build25-home>← Back to iRepair</button>
      </section>`;
    }
    return `<section class="glass panel b25-home">
      <div class="eyebrow">WELCOME TO iREPAIR</div>
      <h1>How can I help?</h1>
      <p class="muted">Choose the easiest way to start. I’ll only show the next information when you need it.</p>
      <div class="route-choice">
        <button class="route-card primary" data-build25-route="known"><strong>I know what I need — show me prices</strong><small>Choose your device, then select one or more repairs.</small></button>
        <button class="route-card" data-build25-route="help"><strong>I need help — I’m not sure what I need</strong><small>Answer a few simple questions and iRepair will guide you.</small></button>
      </div>
      <div class="b25-other">
        <div class="b25-other-title">OTHER WAYS TO USE iREPAIR</div>
        <div class="b25-other-grid">
          <button type="button" class="b25-other-btn" data-build25-share><strong>💙 Recommend iRepair</strong><small>Send the app to a friend or family member who may need help.</small></button>
          <button type="button" class="b25-other-btn" data-build25-relay><strong>🔔 Repair Relay</strong><small>Communicate on behalf of someone while their repair is underway.</small></button>
        </div>
      </div>
    </section>`;
  };

  /* Known-repair route: choose the device first. Nothing else appears until that choice is made. */
  repairSelection=function(){
    const d=selected();
    if(!d.model){
      const options='<option value="">Choose your device</option>'+Object.entries(CATALOGUE).map(([key,v])=>`<option value="${key}">${safe(v.name)}</option>`).join('');
      return `<section class="glass panel b25-device-only">
        <div class="eyebrow">STEP 1 · YOUR DEVICE</div>
        <h2>Which device needs attention?</h2>
        <p class="muted">Choose the exact model first. Repairs and prices will appear afterwards.</p>
        <select class="field" id="model">${options}</select>
        <button type="button" class="btn secondary" style="margin-top:10px" data-build25-unsure>I’m not sure which model I have</button>
      </section>`;
    }
    if(d.model==='otherphone'&&!String(d.custom||'').trim()){
      return `<section class="glass panel b25-device-only">
        <div class="eyebrow">STEP 1 · YOUR DEVICE</div>
        <h2>What phone is it?</h2>
        <p class="muted">Enter the model if you know it, or use the guided identification route.</p>
        <input class="field" id="customModel" maxlength="90" placeholder="e.g. Samsung Galaxy S23 Ultra" value="${safe(d.custom||'')}">
        <button type="button" class="btn secondary" style="margin-top:10px" data-build25-unsure>I’m not sure which model I have</button>
      </section>`;
    }

    /* Build 24 owns multi-repair selection. Replace its large device block with a compact chosen-device summary. */
    let html=build24RepairSelection();
    const divider='<div class="divider"></div>';
    const cut=html.indexOf(divider);
    if(cut>0){
      const tail=html.slice(cut+divider.length);
      const canChange=!basket.some(r=>r.deviceId===active);
      html=`<section class="glass panel"><div class="b25-device-summary"><span><strong>${safe(displayModel(d))}</strong><small>Device selected · now choose everything that needs attention</small></span>${canChange?'<button type="button" class="b25-change" data-build25-change-device>Change</button>':''}</div>`+tail;
    }
    return html;
  };

  /* Price/basket stage: selling is only an alternative after the repair decision has a price or quote context. */
  basketPanel=function(){
    const s=basketSummary();
    const items=basket.map(r=>`<div class="line"><div class="flexbetween"><strong>Device ${r.deviceId} · ${safe(r.model)}</strong><span class="line-price">${safe(priceFor(r))}</span></div><div class="line-meta">${safe(r.faultLabel)} · ${safe(r.option)}${r.diagnostic.colour?' · '+safe(r.diagnostic.colour):''}${r.review?' · owner review':''}</div><div class="line-actions"><button type="button" class="btn-small" data-edit="${r.id}">Edit</button><button type="button" class="btn-small" data-remove="${r.id}">Remove</button></div></div>`).join('');
    const sell=s.count?`<div class="b25-sell"><h3>Repair not within your budget?</h3><p class="muted">If the repair cost no longer makes sense for you, you can ask about selling the device instead.</p><button type="button" class="btn secondary" data-action="sell">Sell this device instead →</button></div>`:'';
    return `<section class="glass panel" id="basket"><div class="mini-head"><h2>Your repairs</h2><span class="count">${s.count} repair${s.count===1?'':'s'}</span></div>${items||'<p class="muted">Select the repairs above. Prices and options will be added here as you go.</p>'}${s.count?`<div class="subtotal"><span>Priced items subtotal</span><strong>${gbp(s.total)}</strong></div><p class="helper">${s.pending?`${s.pending} item(s) still need a quote, diagnosis or approval. The subtotal excludes them.`:'You can add another repair before continuing.'} Multi-repair discounts require staff confirmation.</p><div class="button-row"><button type="button" class="btn secondary" data-action="another-repair">＋ Add another repair</button><button type="button" class="btn secondary" data-action="add-device">＋ Another device</button></div><button type="button" class="btn" data-action="next-service">Continue →</button>`:''}${sell}</section>`;
  };

  /* Legacy sell card can no longer leak onto Home or pre-price screens. */
  sellCard=function(){return ''};

  document.addEventListener('click',function(e){
    const homeLink=e.target.closest('[data-brand-home]');
    if(homeLink){
      if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();e.stopPropagation();
      utilityView='';
      if(typeof scan13Reset==='function')scan13Reset();
      mode='home';render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-build25-share')){e.preventDefault();e.stopPropagation();shareIRepair25();return}
    if(b.hasAttribute('data-build25-relay')){e.preventDefault();e.stopPropagation();utilityView='relay';render();window.scrollTo({top:0,behavior:'instant'});return}
    if(b.hasAttribute('data-build25-home')){e.preventDefault();e.stopPropagation();utilityView='';render();window.scrollTo({top:0,behavior:'instant'});return}
    if(b.hasAttribute('data-build25-open-relay')){e.preventDefault();e.stopPropagation();openRelay25((document.getElementById('b25RelayInput')||{}).value||'');return}
    if(b.dataset.build25Route==='known'){
      e.preventDefault();e.stopPropagation();utilityView='';
      mode='book';stage=1;fault='';variant='';editId=null;resetDiagnostic();
      const d=selected();if(d&&!basket.some(r=>r.deviceId===d.id)){d.model='';d.custom=''}
      render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(b.dataset.build25Route==='help'){
      e.preventDefault();e.stopPropagation();utilityView='';helpReset();mode='help';render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(b.hasAttribute('data-build25-unsure')){
      e.preventDefault();e.stopPropagation();utilityView='';helpReset();mode='help';render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(b.hasAttribute('data-build25-change-device')){
      e.preventDefault();e.stopPropagation();const d=selected();if(d){d.model='';d.custom=''}fault='';variant='';render();return;
    }
  },true);
})();
