/* iRepair Core · Build 25
   Progressive customer journey: one decision at a time.
   Keeps prototype features out of the landing page and only offers device sale after repair pricing exists. */
(function(){
  'use strict';
  if(typeof render!=='function'||typeof homeScreen!=='function') return;

  let addingAnother=false;

  const style=document.createElement('style');
  style.textContent=`
    .b25-landing{padding:22px 17px 18px;margin-top:6px}
    .b25-landing h1{margin:5px 0 7px;font-size:31px}
    .b25-landing .route-choice{margin-top:18px}
    .b25-landing .route-card{min-height:108px;padding:18px}
    .b25-landing .route-card strong{font-size:17px;line-height:1.25}
    .b25-landing .route-card small{font-size:12px;margin-top:7px}
    .b25-landing-note{text-align:center;color:#617b97;font-size:10px;line-height:1.45;padding:3px 20px 12px}
    .b25-hidden{display:none!important}
    .b25-context{padding:12px 14px;margin-bottom:10px}
    .b25-context strong{font-size:13px}
    .b25-context .line-meta{margin-top:3px}
    .b25-budget{padding:14px 15px;margin-top:10px}
    .b25-budget h3{margin:2px 0 5px;font-size:15px}
    .b25-budget .btn{margin-top:10px}
  `;
  document.head.appendChild(style);

  /* Landing page: deliberately only the two primary customer routes. */
  homeScreen=function(){
    return `<section class="glass panel b25-landing">
      <div class="eyebrow">iREPAIR</div>
      <h1>What can I help you with?</h1>
      <p class="muted">Choose the route that feels easiest. I’ll only show the next information when you need it.</p>
      <div class="route-choice">
        <button class="route-card primary" data-action="route-known">
          <strong>I know what I need — show me prices</strong>
          <small>Choose your device, then select one or more repairs.</small>
        </button>
        <button class="route-card" data-action="route-help">
          <strong>I need help — I’m not sure what I need</strong>
          <small>Answer a few simple questions and iRepair will guide you.</small>
        </button>
      </div>
    </section><div class="b25-landing-note">Already have a repair underway? Use <strong>Repairs</strong> in the navigation below.</div>`;
  };

  /* Sell is an affordability alternative after a repair price exists — never a landing-page route. */
  sellCard=function(){
    if(mode!=='book'||stage!==1||!basket||!basket.length) return '';
    return `<section class="glass b25-budget">
      <div class="eyebrow">ANOTHER OPTION</div>
      <h3>Repair price not right for you?</h3>
      <p class="muted" style="margin:0">If the repair is outside your budget, you can ask iRepair about selling the device instead.</p>
      <button type="button" class="btn secondary" data-action="sell">Explore selling this device →</button>
    </section>`;
  };

  const previousRender=render;
  function firstRepairPanel(){return document.querySelector('#main > section.glass.panel')}
  function insertContext(before,title,text){
    const s=document.createElement('section');
    s.className='glass panel b25-context';
    s.innerHTML=`<strong>${safe(title)}</strong><div class="line-meta">${safe(text)}</div>`;
    before.parentNode.insertBefore(s,before);
  }
  function hideAfter(node){
    if(!node)return;
    let n=node;
    while(n){n.classList.add('b25-hidden');n=n.nextElementSibling}
  }
  function focusCurrentDecision(){
    document.querySelectorAll('.b25-context').forEach(x=>x.remove());
    if(mode!=='book'||stage!==1) return;

    const detail=document.getElementById('faultDetail');
    const basketEl=document.getElementById('basket');
    const selection=detail?detail.previousElementSibling:firstRepairPanel();

    if(detail){
      if(selection)selection.classList.add('b25-hidden');
      if(basketEl)basketEl.classList.add('b25-hidden');
      const label=(typeof FAULTS!=='undefined'&&FAULTS.find(x=>x.id===fault))?.label||'repair';
      const deviceName=(typeof selected==='function'&&selected().model)?displayModel(selected()):'your device';
      insertContext(detail,deviceName,`Now choose the options for ${label}. The other selected repairs will follow automatically.`);
      return;
    }

    if(!selection)return;

    /* First visit: device first. Fault choices appear after a model is selected. */
    const hasModel=!!(typeof selected==='function'&&selected().model);
    if(!hasModel&&(!basket||!basket.length)){
      hideAfter(selection.querySelector('.divider'));
      if(basketEl)basketEl.classList.add('b25-hidden');
      return;
    }

    /* Once repairs have been priced, show the concise basket/price decision by default. */
    if(basket&&basket.length&&!addingAnother){
      selection.classList.add('b25-hidden');
      if(basketEl)insertContext(basketEl,displayModel(selected()),`${basket.filter(r=>r.deviceId===active).length} repair${basket.filter(r=>r.deviceId===active).length===1?'':'s'} added. Review the prices, add another repair, or continue.`);
      return;
    }

    /* If the customer explicitly adds another repair/device, focus on the selector and hide the long basket until finished. */
    if(basket&&basket.length&&addingAnother){
      if(basketEl)basketEl.classList.add('b25-hidden');
      insertContext(selection,displayModel(selected()),`${basket.length} repair${basket.length===1?'':'s'} already saved. Select the additional work below.`);
    }
  }

  render=function(){
    previousRender();
    focusCurrentDecision();
  };

  /* Keep the progressive state aligned with the existing prototype actions. */
  const previousAddRepair=typeof addRepair==='function'?addRepair:null;
  if(previousAddRepair){
    addRepair=function(){
      const before=basket.length;
      previousAddRepair();
      if(basket.length>before) addingAnother=false;
    };
  }

  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.action==='route-known'&&mode==='home'&&basket.length===0&&devices.length===1&&selected().model==='iphone13'){
      /* Remove the old prototype default so the real flow starts with a device choice. */
      selected().model='';selected().custom='';
    }
    if(b.dataset.action==='another-repair'||b.dataset.action==='add-device') addingAnother=true;
    if(b.dataset.action==='next-service'||b.dataset.action==='restart'||b.dataset.action==='back-repairs') addingAnother=false;
  },true);
})();
