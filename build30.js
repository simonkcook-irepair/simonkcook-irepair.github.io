/* iRepair Core · Build 31
   Exact-model capabilities. Keeps Build 24's multi-repair queue and Build 25's
   progressive journey, with the existing Build 28r4 / 29 artwork and glass. */
(function(){
  'use strict';
  const rules=window.IRepairDeviceRules;
  if(!rules||typeof repairSelection!=='function'||!window.IRepairMultiRepair) return;
  const beforeSelection=repairSelection,beforeDiagnostic=diagnosticFields,beforeAddRepair=addRepair;
  const beforeSetModel=setModel,beforeSetDevice=setDevice,beforeRestart=restart,beforeReset=resetDiagnostic;
  const beforeHelpDevice=helpDeviceScreen,beforeHelpIssue=helpIssueScreen;
  let helpManufacturer='';

  // Identity entries add no amounts. Existing prices and flags remain authoritative.
  for(const model of rules.data.models){
    if(!CATALOGUE[model.id]) CATALOGUE[model.id]={name:model.model,screen:{}};
  }
  if(typeof IPHONE_KEYS!=='undefined') IPHONE_KEYS=rules.brandModels('Apple').map(m=>m.id);
  if(typeof ID12_MODELS!=='undefined'){
    for(const key of Object.keys(ID12_MODELS)) if(!rules.confirmed(key)) delete ID12_MODELS[key];
  }
  // Remove old guessed regional identifiers, including the unsourced Duo A-number.
  if(typeof ID10_A!=='undefined'){
    for(const key of Object.keys(ID10_A)) delete ID10_A[key];
    for(const model of rules.brandModels('Apple')){
      for(const identifier of model.identifiers) ID10_A[identifier.value]=model.id;
    }
  }
  window.IRepairAppleMeta=Object.fromEntries(rules.brandModels('Apple').map(m=>[m.id,{
    display:m.originalDisplay.technology,rearGlass:m.rear.hasGlass,colours:m.officialColours.slice()
  }]));

  const manufacturer=d=>rules.find(d.model)?.manufacturer||d.brand||'';
  const locked=d=>basket.some(r=>r.deviceId===d.id);
  function resetSelection(){
    window.IRepairMultiRepair?.reset();
    fault='';editId=null;resetDiagnostic();service='';
  }
  function brandButtons(brand,context){
    return '<div class="b31-brand-grid">'+rules.data.manufacturerOrder.map(v=>
      '<button type="button" class="b30-brand" data-catalogue-brand="'+safe(v)+'" data-catalogue-context="'+context+'" aria-pressed="'+(brand===v)+'">'+safe(v)+'</button>'
    ).join('')+'</div>';
  }
  function modelOptions(brand,value){
    return '<option value="">Choose the exact model</option>'+rules.brandModels(brand).map(model=>
      '<option value="'+model.id+'" '+(value===model.id?'selected':'')+'>'+safe(model.model)+'</option>'
    ).join('')+'<option value="otherphone" '+(value==='otherphone'?'selected':'')+'>My device is not listed</option>';
  }
  function deviceControls(d,context){
    const brand=manufacturer(d),help=context==='help';
    let html=brandButtons(brand,context);
    if(!brand) return html;
    html+='<label class="field-label" for="'+(help?'helpModel':'model')+'">Exact '+safe(brand)+' model</label><select class="field" id="'+(help?'helpModel':'model')+'">'+modelOptions(brand,d.model)+'</select>';
    if(d.model==='otherphone'){
      html+='<label class="field-label" for="'+(help?'helpCustomModel':'customModel')+'">Model name</label><input class="field" id="'+(help?'helpCustomModel':'customModel')+'" maxlength="90" placeholder="Enter the model name" value="'+safe(d.custom||'')+'"><p class="helper">I’ll check this model and its parts before confirming a repair.</p>';
    }
    return html;
  }
  function deviceTabs(){
    if(devices.length<2) return '';
    return '<div class="device-tabs">'+devices.map(d=>
      '<button class="devtab" type="button" data-device="'+d.id+'" aria-pressed="'+(active===d.id)+'">Device '+d.id+' · '+safe(d.model?displayModel(d):'Choose device')+'</button>'
    ).join('')+'</div>';
  }

  repairSelection=function(){
    const d=selected();
    if(!rules.confirmed(d.model)){
      return '<section class="glass panel b25-device-only">'+deviceTabs()+'<div class="eyebrow">STEP 1 · YOUR DEVICE</div><h2>Which device needs attention?</h2><p class="muted">Choose the manufacturer, then the exact model.</p>'+deviceControls(d,'book')+
        (d.model==='otherphone'?'<button type="button" class="btn" style="margin-top:10px" data-catalogue-assessment '+(!String(d.custom||'').trim()?'disabled':'')+'>Ask iRepair to assess this device →</button>':'')+
        '<button type="button" class="btn secondary" style="margin-top:10px" data-build25-unsure>I’m not sure which model I have</button></section>'+(basket.length?basketPanel():'');
    }
    d.brand=rules.find(d.model).manufacturer;
    // Delegate to the existing progressive wrapper and its multi-repair selector.
    const html=beforeSelection();
    return devices.length>1?html.replace('<section class="glass panel">','<section class="glass panel">'+deviceTabs()):html;
  };
  resetDiagnostic=function(){beforeReset();diagnostic.panel=''};
  setModel=function(value){
    const d=selected();
    if(locked(d)){beforeSetModel(value);return}
    if(value&&value!=='otherphone'&&!rules.confirmed(value)){toast('This model needs identification first.');return}
    resetSelection();
    if(rules.confirmed(value)) d.brand=rules.find(value).manufacturer;
    beforeSetModel(value);
  };
  setDevice=function(id){resetSelection();beforeSetDevice(id)};
  addDevice=function(){
    resetSelection();
    devices.push({id:nextDevice++,model:'',custom:'',brand:''});
    active=devices[devices.length-1].id;stage=1;mode='book';render();
    toast('Choose the manufacturer and model for this device.');
  };
  restart=function(){
    helpManufacturer='';resetSelection();beforeRestart();
    selected().model='';selected().brand='';render();
  };

  buildOptions=function(){
    return rules.repairOptions(selected().model,fault,modelFor(selected())).map(o=>[o.label,o.price,o.note]);
  };
  diagnosticFields=function(){
    const model=rules.find(selected().model);
    if(fault==='rear'){
      if(!model?.officialColours.length) return '<p class="helper">I’ll confirm the original finish when I inspect this device.</p>';
      return '<label class="field-label" for="glassColour">What colour / finish is the rear?</label><select class="field" id="glassColour"><option value="">Choose the finish</option>'+model.officialColours.map(colour=>
        '<option value="'+safe(colour)+'" '+(diagnostic.colour===colour?'selected':'')+'>'+safe(colour)+'</option>'
      ).join('')+'<option value="Not sure" '+(diagnostic.colour==='Not sure'?'selected':'')+'>Not sure</option></select><p class="helper">Original finishes for '+safe(model.model)+'. I’ll confirm the matching part and live stock.</p>';
    }
    if(fault==='screen'&&model?.originalDisplay.panels.length>1){
      return '<label class="field-label" for="screenPanel">Which screen needs attention?</label><select class="field" id="screenPanel"><option value="">Choose the screen</option>'+model.originalDisplay.panels.map(panel=>
        '<option value="'+panel.id+'" '+(diagnostic.panel===panel.id?'selected':'')+'>'+safe(panel.label)+'</option>'
      ).join('')+'</select>';
    }
    return beforeDiagnostic();
  };
  repairDetails=function(){
    const f=FAULTS.find(f=>f.id===fault),options=buildOptions();
    if(!f||!rules.faultAllowed(selected().model,fault)||!options.length) return '';
    const single=options.length===1;
    if(single) variant=options[0][0];
    const optionContent=o=>'<div class="option-top"><span>'+safe(o[0])+'</span><span class="option-price">'+gbp(o[1])+'</span></div><p>'+safe(o[2])+'</p>';
    return '<section id="faultDetail" class="glass panel"><div class="mini-head"><div><div class="eyebrow">REPAIR DETAILS</div><h2>'+(editId?'Edit':'Add')+' · '+safe(f.label)+'</h2></div><span class="count">Device '+active+'</span></div>'+diagnosticFields()+
      (single?'<div class="option b31-single">'+optionContent(options[0])+'</div>':'<label class="field-label">Choose your repair option</label>'+options.map(o=>
        '<button class="option" type="button" data-option="'+safe(o[0])+'" aria-pressed="'+(variant===o[0])+'">'+optionContent(o)+'</button>'
      ).join(''))+
      '<button type="button" class="btn" data-action="save-repair">'+(editId?'Save changes':'＋ Add repair to basket')+' →</button>'+(editId?'<button type="button" class="btn ghost" data-action="cancel-edit">Cancel editing</button>':'')+'</section>';
  };
  addRepair=function(){
    const d=selected(),model=rules.find(d.model);
    if(!rules.faultAllowed(d.model,fault)){toast('This repair needs an exact model check.');return}
    const options=buildOptions();
    if(options.length===1) variant=options[0][0];
    const chosen=options.find(o=>o[0]===variant);
    if(!chosen){toast('Choose a repair option for this model.');return}
    if(fault==='rear'&&!model?.officialColours.length) diagnostic.colour='Not sure';
    const error=rules.validateRepair(d,{fault,option:variant,price:chosen[1],diagnostic},modelFor(d));
    if(error){toast(error);return}
    beforeAddRepair();
  };
  isOffice=function(repair){
    const d=getDevice(repair.deviceId);
    return !d||!rules.canCallOut(d.model,repair.fault)||modelFor(d).office===true;
  };

  helpModelOptions=function(){
    const brand=helpBrand==='Apple iPhone'?'Apple':helpManufacturer||manufacturer(selected())||'Apple';
    return modelOptions(brand,selected().model);
  };
  helpDeviceScreen=function(){
    if(helpBrand==='Apple iPhone'){
      selected().brand='Apple';
      return beforeHelpDevice();
    }
    const d=selected(),brand=helpManufacturer;
    // Choosing a route never silently chooses a manufacturer or exact model.
    if(!brand&&!locked(d)){d.model='';d.brand=''}
    return '<section class="glass panel">'+helpProgress()+'<div class="eyebrow">STEP 1 · YOUR DEVICE</div><h2>Let’s identify your device</h2><p class="muted">Choose the manufacturer first.</p>'+deviceControls(d,'help')+
      (rules.confirmed(d.model)?'<button class="btn" style="margin-top:10px" data-action="help-device-next">That’s my device →</button>':'')+
      (d.model==='otherphone'?'<button class="btn" style="margin-top:10px" data-catalogue-assessment '+(!String(d.custom||'').trim()?'disabled':'')+'>Ask iRepair to assess this device →</button>':'')+
      (brand==='Apple'?'<button class="btn secondary" style="margin-top:10px" data-help-brand="Apple iPhone">Help me identify this iPhone →</button>':brand?'<p class="helper">If the phone opens Settings, check About phone for its model name and model number.</p>':'')+
      '<button class="btn ghost help-back" data-action="help-home">← Back</button></section>';
  };
  helpIssueScreen=function(){
    return beforeHelpIssue().replace(/<button\b[^>]*data-help-issue="([^"]+)"[\s\S]*?<\/button>/g,(html,id)=>
      rules.faultAllowed(selected().model,id)?html:'');
  };

  // Window capture runs before existing document capture handlers render a route.
  window.addEventListener('click',function(e){
    const button=e.target.closest('button');
    if(!button) return;
    if(button.dataset.build25Route||button.hasAttribute('data-build25-unsure')||button.hasAttribute('data-build25-change-device')){
      helpManufacturer='';resetSelection();
      if(!locked(selected())) selected().brand='';
    }
    const brand=button.dataset.catalogueBrand;
    if(brand){
      e.preventDefault();e.stopImmediatePropagation();
      const d=selected();
      if(locked(d)){toast('Remove this device’s repairs before changing its manufacturer.');return}
      resetSelection();d.brand=brand;d.model='';d.custom='';
      if(button.dataset.catalogueContext==='help'){helpManufacturer=brand;helpBrand='';helpKnown=''}
      render();return;
    }
    if(button.hasAttribute('data-catalogue-assessment')){
      e.preventDefault();e.stopImmediatePropagation();
      if(!String(selected().custom||'').trim()){toast('Enter the model name first.');return}
      resetSelection();mode='book';stage=1;fault='other';variant='Device assessment';beforeAddRepair();return;
    }
    const attempted=button.dataset.fault||button.dataset.helpIssue;
    if(attempted&&!rules.faultAllowed(selected().model,attempted)){
      e.preventDefault();e.stopImmediatePropagation();toast('This repair needs an exact model check.');
    }
  },true);
  document.addEventListener('change',function(e){
    if(e.target.id==='screenPanel'){diagnostic.panel=e.target.value;render()}
  });
  document.addEventListener('input',function(e){
    if(!['customModel','helpCustomModel'].includes(e.target.id)) return;
    const button=document.querySelector('[data-catalogue-assessment]');
    if(button) button.disabled=!String(e.target.value).trim();
  });

  const style=document.createElement('style');
  style.textContent='.b31-brand-grid{display:grid;grid-template-columns:1fr;gap:8px;margin:9px 0 13px}.b30-brand{min-height:48px;border-radius:16px;border:1px solid rgba(255,255,255,.78);background:linear-gradient(145deg,rgba(255,255,255,.44),rgba(225,242,255,.23));color:#244b70;font-weight:790;box-shadow:inset 0 1px 1px rgba(255,255,255,.9),0 7px 20px rgba(45,88,129,.09);backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35)}.b30-brand[aria-pressed=true]{border-color:rgba(41,127,219,.68);background:linear-gradient(140deg,rgba(220,241,255,.72),rgba(157,207,255,.45));color:#075bb8;box-shadow:inset 0 1px 1px #fff,0 8px 23px rgba(38,105,174,.15)}.b31-single{cursor:default}@media(min-width:480px){.b31-brand-grid{grid-template-columns:repeat(3,1fr)}}';
  document.head.appendChild(style);
  if(!basket.length){selected().model='';selected().brand=''}
  window.IRepairCatalogueReady=true;
})();
