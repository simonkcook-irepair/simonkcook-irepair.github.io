/* iRepair Core · Build 25
   Progressive customer journey: minimal landing and one decision at a time.
   Sell-device is only offered after repair pricing is visible. */
(function(){
  'use strict';
  if(typeof homeScreen!=='function'||typeof repairSelection!=='function'||typeof basketPanel!=='function') return;

  const build24RepairSelection=repairSelection;

  const style=document.createElement('style');
  style.textContent=`
    .b25-home{padding:22px 17px 19px;margin-top:5px}
    .b25-home h1{margin:5px 0 8px;font-size:31px}
    .b25-home .route-choice{margin-top:18px}
    .b25-home .route-card{min-height:92px;padding:17px}
    .b25-home .route-card strong{font-size:17px;line-height:1.25}
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

  /* Front page: only the two main starting routes. */
  homeScreen=function(){
    return `<section class="glass panel b25-home">
      <div class="eyebrow">WELCOME TO iREPAIR</div>
      <h1>How can I help?</h1>
      <p class="muted">Choose the easiest way to start. I’ll only show the next information when you need it.</p>
      <div class="route-choice">
        <button class="route-card primary" data-build25-route="known"><strong>I know what I need — show me prices</strong><small>Choose your device, then select one or more repairs.</small></button>
        <button class="route-card" data-build25-route="help"><strong>I need help — I’m not sure what I need</strong><small>Answer a few simple questions and iRepair will guide you.</small></button>
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
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.build25Route==='known'){
      e.preventDefault();e.stopPropagation();
      mode='book';stage=1;fault='';variant='';editId=null;resetDiagnostic();
      const d=selected();if(d&&!basket.some(r=>r.deviceId===d.id)){d.model='';d.custom=''}
      render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(b.dataset.build25Route==='help'){
      e.preventDefault();e.stopPropagation();helpReset();mode='help';render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(b.hasAttribute('data-build25-unsure')){
      e.preventDefault();e.stopPropagation();helpReset();mode='help';render();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(b.hasAttribute('data-build25-change-device')){
      e.preventDefault();e.stopPropagation();const d=selected();if(d){d.model='';d.custom=''}fault='';variant='';render();return;
    }
  },true);
})();
