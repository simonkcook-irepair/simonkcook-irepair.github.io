/* iRepair Core · Build 30
   Model-specific catalogue integrity: brand split, verified Apple display families and finishes.
   Apple source: https://support.apple.com/en-gb/108044 (published 17 Sep 2026).
*/
(function(){
  'use strict';
  if(typeof repairSelection!=='function'||typeof buildOptions!=='function'||typeof diagnosticFields!=='function') return;

  const APPLE_META={
    iphone6:{display:'LCD',rearGlass:false,colours:['Space Grey','Silver','Gold']},
    iphone6plus:{display:'LCD',rearGlass:false,colours:['Space Grey','Silver','Gold']},
    iphone6s:{display:'LCD',rearGlass:false,colours:['Space Grey','Silver','Gold','Rose Gold']},
    iphone6splus:{display:'LCD',rearGlass:false,colours:['Space Grey','Silver','Gold','Rose Gold']},
    iphonese1:{display:'LCD',rearGlass:false,colours:['Space Grey','Silver','Gold','Rose Gold']},
    iphone7:{display:'LCD',rearGlass:false,colours:['Black','Jet Black','Gold','Rose Gold','Silver','(PRODUCT)RED']},
    iphone7plus:{display:'LCD',rearGlass:false,colours:['Black','Jet Black','Gold','Rose Gold','Silver','(PRODUCT)RED']},
    iphone8:{display:'LCD',rearGlass:true,colours:['Gold','Silver','Space Grey','(PRODUCT)RED']},
    iphone8plus:{display:'LCD',rearGlass:true,colours:['Gold','Silver','Space Grey','(PRODUCT)RED']},
    iphonex:{display:'OLED',rearGlass:true,colours:['Silver','Space Grey']},
    iphonexr:{display:'LCD',rearGlass:true,colours:['Black','White','Blue','Yellow','Coral','(PRODUCT)RED']},
    iphonexs:{display:'OLED',rearGlass:true,colours:['Silver','Space Grey','Gold']},
    iphonexsmax:{display:'OLED',rearGlass:true,colours:['Silver','Space Grey','Gold']},
    iphone11:{display:'LCD',rearGlass:true,colours:['Purple','Green','Yellow','Black','White','(PRODUCT)RED']},
    iphone11pro:{display:'OLED',rearGlass:true,colours:['Silver','Space Grey','Gold','Midnight Green']},
    iphone11pm:{display:'OLED',rearGlass:true,colours:['Silver','Space Grey','Gold','Midnight Green']},
    iphonese2:{display:'LCD',rearGlass:true,colours:['White','Black','(PRODUCT)RED']},
    iphone12mini:{display:'OLED',rearGlass:true,colours:['Black','White','(PRODUCT)RED','Green','Blue','Purple']},
    iphone12:{display:'OLED',rearGlass:true,colours:['Black','White','(PRODUCT)RED','Green','Blue','Purple']},
    iphone12pro:{display:'OLED',rearGlass:true,colours:['Silver','Graphite','Gold','Pacific Blue']},
    iphone12pm:{display:'OLED',rearGlass:true,colours:['Silver','Graphite','Gold','Pacific Blue']},
    iphone13mini:{display:'OLED',rearGlass:true,colours:['(PRODUCT)RED','Starlight','Midnight','Blue','Pink','Green']},
    iphone13:{display:'OLED',rearGlass:true,colours:['(PRODUCT)RED','Starlight','Midnight','Blue','Pink','Green']},
    iphone13pro:{display:'OLED',rearGlass:true,colours:['Graphite','Gold','Silver','Sierra Blue','Alpine Green']},
    iphone13pm:{display:'OLED',rearGlass:true,colours:['Graphite','Gold','Silver','Sierra Blue','Alpine Green']},
    iphonese3:{display:'LCD',rearGlass:true,colours:['(PRODUCT)RED','Starlight','Midnight']},
    iphone14:{display:'OLED',rearGlass:true,colours:['Midnight','Starlight','(PRODUCT)RED','Blue','Purple','Yellow']},
    iphone14plus:{display:'OLED',rearGlass:true,colours:['Midnight','Starlight','(PRODUCT)RED','Blue','Purple','Yellow']},
    iphone14pro:{display:'OLED',rearGlass:true,colours:['Silver','Gold','Space Black','Deep Purple']},
    iphone14pm:{display:'OLED',rearGlass:true,colours:['Silver','Gold','Space Black','Deep Purple']},
    iphone15:{display:'OLED',rearGlass:true,colours:['Black','Blue','Green','Yellow','Pink']},
    iphone15plus:{display:'OLED',rearGlass:true,colours:['Black','Blue','Green','Yellow','Pink']},
    iphone15pro:{display:'OLED',rearGlass:true,colours:['Black Titanium','White Titanium','Blue Titanium','Natural Titanium']},
    iphone15pm:{display:'OLED',rearGlass:true,colours:['Black Titanium','White Titanium','Blue Titanium','Natural Titanium']},
    iphone16e:{display:'OLED',rearGlass:true,colours:['Black','White']},
    iphone16:{display:'OLED',rearGlass:true,colours:['Black','White','Pink','Teal','Ultramarine']},
    iphone16plus:{display:'OLED',rearGlass:true,colours:['Black','White','Pink','Teal','Ultramarine']},
    iphone16pro:{display:'OLED',rearGlass:true,colours:['Black Titanium','White Titanium','Natural Titanium','Desert Titanium']},
    iphone16pm:{display:'OLED',rearGlass:true,colours:['Black Titanium','White Titanium','Natural Titanium','Desert Titanium']},
    iphone17e:{display:'OLED',rearGlass:true,colours:['Black','White','Soft Pink']},
    iphone17:{display:'OLED',rearGlass:true,colours:['Black','White','Mist Blue','Sage','Lavender']},
    iphone17pro:{display:'OLED',rearGlass:true,colours:['Silver','Cosmic Orange','Deep Blue']},
    iphone17pm:{display:'OLED',rearGlass:true,colours:['Silver','Cosmic Orange','Deep Blue']},
    iphoneair:{display:'OLED',rearGlass:true,colours:['Space Black','Cloud White','Light Gold','Sky Blue']},
    iphone18pro:{display:'OLED',rearGlass:true,colours:['Black','Silver','Glacier','Burgundy']},
    iphone18pm:{display:'OLED',rearGlass:true,colours:['Black','Silver','Glacier','Burgundy']}
  };
  window.IRepairAppleMeta=APPLE_META;

  function brandFor(d){
    if(d&&d.brand) return d.brand;
    if(d&&APPLE_META[d.model]) return 'Apple';
    return 'Other';
  }
  function appleKeys(){
    const keys=(typeof IPHONE_KEYS!=='undefined'?IPHONE_KEYS:Object.keys(CATALOGUE));
    return keys.filter(k=>APPLE_META[k]&&CATALOGUE[k]);
  }
  function repairFaultsFor(d){
    const brand=brandFor(d),meta=brand==='Apple'?APPLE_META[d.model]:null;
    return FAULTS.filter(f=>!(f.id==='rear'&&brand==='Apple'&&meta&&meta.rearGlass===false));
  }

  const oldBuildOptions=buildOptions;
  buildOptions=function(){
    const d=selected(),brand=brandFor(d),m=modelFor(d),meta=brand==='Apple'?APPLE_META[d.model]:null;
    if(fault==='screen'){
      if(brand!=='Apple') return [['Screen replacement',null,'Exact screen technology and price will be confirmed from the exact model before booking.']];
      if(!meta) return [['Screen replacement',null,'Exact screen technology must be verified before quoting.']];
      const s=m.screen||{};
      if(meta.display==='LCD'){
        return [['Screen replacement · LCD',s.LCD??null,'This model uses an LCD display, so no OLED comparison is shown.']];
      }
      const out=[];
      if(Number.isFinite(s.LCD)) out.push(['LCD replacement',s.LCD,'Lower-cost aftermarket LCD option for a model originally fitted with OLED.']);
      if(Number.isFinite(s.OLED)) out.push(['OLED replacement',s.OLED,'OLED replacement, matching the original display technology more closely.']);
      if(!out.length) out.push(['Screen replacement · OLED',null,'This model was originally fitted with OLED. Price and part availability will be confirmed before booking.']);
      return out;
    }
    if(fault==='rear'&&brand==='Apple'){
      if(!meta||!meta.rearGlass) return [['Rear housing / cosmetic assessment',null,'This model does not use a replaceable rear-glass panel in the same way as later iPhones.']];
      return [['Rear glass / rear panel replacement',m.rear??null,'Killay office. Exact finish, part availability and repair method are confirmed from the selected model.']];
    }
    return oldBuildOptions();
  };

  const oldDiagnosticFields=diagnosticFields;
  diagnosticFields=function(){
    if(fault!=='rear') return oldDiagnosticFields();
    const d=selected(),brand=brandFor(d),meta=brand==='Apple'?APPLE_META[d.model]:null;
    if(brand==='Apple'&&meta&&meta.rearGlass){
      const colours=meta.colours||[];
      return `<label class="field-label" for="glassColour">What colour / finish is the rear?</label><select class="field" id="glassColour"><option value="">Choose colour</option>${colours.map(v=>`<option value="${safe(v)}" ${diagnostic.colour===v?'selected':''}>${safe(v)}</option>`).join('')}<option value="Not sure" ${diagnostic.colour==='Not sure'?'selected':''}>Not sure</option></select><p class="helper">Colours shown are specific to ${safe(CATALOGUE[d.model]?.name||'this iPhone')}.</p>`;
    }
    return `<label class="field-label" for="glassColour">Colour / finish</label><input class="field" id="glassColour" maxlength="60" placeholder="Enter the device colour if known" value="${safe(diagnostic.colour||'')}"><p class="helper">The exact model and finish will be verified before a rear-part order is placed.</p>`;
  };

  repairSelection=function(){
    const d=selected(),brand=brandFor(d),count=basket.filter(r=>r.deviceId===active).length;
    d.brand=brand;
    const brands=['Apple','Samsung','Google Pixel','Other'];
    const brandButtons=brands.map(v=>`<button type="button" class="b30-brand" data-b30-brand="${safe(v)}" aria-pressed="${brand===v}">${safe(v)}</button>`).join('');
    let modelControl='';
    if(brand==='Apple'){
      const opts='<option value="">Select your iPhone</option>'+appleKeys().map(key=>`<option value="${key}" ${d.model===key?'selected':''}>${safe(CATALOGUE[key].name)}</option>`).join('');
      modelControl=`<label class="field-label" for="model">Select exact iPhone model</label><select class="field" id="model">${opts}</select><p class="helper">Apple model finishes and display family are verified against Apple Support. Unverified placeholder models are not shown.</p>`;
    }else{
      if(d.model!=='otherphone'&&!basket.some(r=>r.deviceId===d.id)){d.model='otherphone';d.custom=''}
      modelControl=`<label class="field-label" for="customModel">Exact ${brand==='Other'?'device':brand} model</label><input class="field" id="customModel" maxlength="90" placeholder="${brand==='Samsung'?'e.g. Galaxy S23 Ultra':brand==='Google Pixel'?'e.g. Pixel 9 Pro':'Enter exact make and model'}" value="${safe(d.custom||'')}"><p class="helper">Exact model is required. iRepair will not guess a screen type, rear colour or part from the brand alone.</p>`;
    }
    const tabs=devices.map(dd=>`<button class="devtab" aria-pressed="${active===dd.id}" type="button" data-device="${dd.id}">Device ${dd.id} · ${safe(displayModel(dd))}</button>`).join('');
    const faults=repairFaultsFor(d).map(f=>`<button type="button" class="fault" data-fault="${f.id}" aria-pressed="${fault===f.id}"><span class="emoji">${f.icon}</span><span>${safe(f.label)}</span>${fault===f.id?'<span class="check">✓</span>':''}</button>`).join('');
    return `<section class="glass panel"><div class="eyebrow">YOUR DEVICE</div><div class="device-tabs">${tabs}</div><button type="button" class="btn secondary" data-action="add-device">＋ Add another device</button><div class="divider"></div><div class="eyebrow">CHOOSE BRAND</div><div class="b30-brand-grid">${brandButtons}</div>${modelControl}${count?`<p class="helper">${count} repair(s) attached to this device. Remove these before changing its brand or model.</p>`:''}<div class="divider"></div><div class="eyebrow">WHAT'S WRONG WITH THE DEVICE?</div><p class="muted">Tap a problem to add it. Repeat to include multiple repairs.</p><div class="fault-grid">${faults}</div></section>${fault?repairDetails():''}${basketPanel()}`;
  };

  document.addEventListener('click',function(e){
    const b=e.target.closest('[data-b30-brand]');
    if(!b) return;
    e.preventDefault();
    const d=selected(),next=b.dataset.b30Brand;
    if(basket.some(r=>r.deviceId===d.id)){
      toast('Remove repairs for this device before changing its brand.');
      render();
      return;
    }
    d.brand=next;
    d.custom='';
    d.model=next==='Apple'?'':'otherphone';
    fault='';
    editId=null;
    resetDiagnostic();
    render();
  });

  document.addEventListener('input',function(e){
    if(e.target.id==='glassColour'&&e.target.tagName==='INPUT') diagnostic.colour=e.target.value;
  });

  const style=document.createElement('style');
  style.textContent=`
    .b30-brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0 13px}
    .b30-brand{min-height:48px;border-radius:16px;border:1px solid rgba(255,255,255,.78);background:linear-gradient(145deg,rgba(255,255,255,.44),rgba(225,242,255,.23));color:#244b70;font-weight:790;box-shadow:inset 0 1px 1px rgba(255,255,255,.9),0 7px 20px rgba(45,88,129,.09);backdrop-filter:blur(22px) saturate(1.35);-webkit-backdrop-filter:blur(22px) saturate(1.35)}
    .b30-brand[aria-pressed=true]{border-color:rgba(41,127,219,.68);background:linear-gradient(140deg,rgba(220,241,255,.72),rgba(157,207,255,.45));color:#075bb8;box-shadow:inset 0 1px 1px #fff,0 8px 23px rgba(38,105,174,.15)}
  `;
  document.head.appendChild(style);
})();
