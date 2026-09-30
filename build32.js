/* Home scanner entry and exact-model handoff to the existing repair flow. */
(function(){
  'use strict';
  const rules=window.IRepairDeviceRules;
  if(!rules||typeof scan13View!=='function')return;
  let scanBrand='',scanModel='';
  const previousHome=homeScreen;
  homeScreen=function(){
    const html=previousHome();
    if(!html.includes('b27-home'))return html;
    return html.replace('<div class="route-choice">','<div class="route-choice"><button type="button" class="route-card b32-scanner" data-action="device-scanner"><span class="b32-scan-icon" aria-hidden="true">⌁</span><span><span class="b32-kicker">PHONE IDENTIFICATION</span><strong>Scan & identify your phone</strong><small>Not sure of the model? Start here, then choose your repairs.</small></span></button>');
  };
  const previousReset=scan13Reset;
  scan13Reset=function(){scanBrand='';scanModel='';previousReset()};
  scan13StartView=function(){return '<section class="glass panel"><div class="eyebrow">PHONE IDENTIFICATION</div><h1 style="margin-left:0">Let’s identify your phone</h1><p class="muted">Identify the phone you’re using, or take guided photos of another phone.</p><div class="scan13-choice"><button class="scan13-card" data-scan13-target="this"><span class="ico" aria-hidden="true">📱</span><span><strong>This phone</strong><small>Check its model in Settings.</small></span></button><button class="scan13-card" data-scan13-target="another"><span class="ico" aria-hidden="true">⌁</span><span><strong>Scan another phone</strong><small>Use your camera or choose photos.</small></span></button></div><p class="helper">Automatic photo recognition is not available yet. I’ll ask you to confirm the exact model before showing repairs.</p><button class="btn ghost" data-scan13-action="home">Back to home</button></section>'};
  function confirmView(withPhotos){
    return '<section class="glass panel"><div class="eyebrow">'+(withPhotos?'PHOTOS CAPTURED':'IDENTIFY THIS PHONE')+'</div><h2>Confirm the exact model</h2>'+(withPhotos?scan13Shots()+'<p class="muted">Your photos are ready. Automatic recognition is not available yet, so check the model in Settings before continuing.</p>':'<p class="muted">Open Settings → General → About on an iPhone, or Settings → About phone on Samsung and Google Pixel. Check the model name and model number.</p>')+'<label class="field-label" for="scannerBrand">Manufacturer</label><select class="field" id="scannerBrand"><option value="">Choose the manufacturer</option>'+rules.data.manufacturerOrder.map(b=>'<option value="'+safe(b)+'" '+(b===scanBrand?'selected':'')+'>'+safe(b)+'</option>').join('')+'</select>'+(scanBrand?'<label class="field-label" for="scannerModel">Exact model</label><select class="field" id="scannerModel"><option value="">Choose the model shown in Settings</option>'+rules.brandModels(scanBrand).map(m=>'<option value="'+safe(m.id)+'" '+(m.id===scanModel?'selected':'')+'>'+safe(m.model||m.name)+'</option>').join('')+'</select>':'')+'<button type="button" class="btn" style="margin-top:14px" data-scanner-repairs '+(!rules.confirmed(scanModel)?'disabled':'')+'>Choose repairs for this phone</button>'+(scanBrand==='Apple'?'<button class="btn secondary" style="margin-top:10px" data-scan13-action="existing-id">Help me identify this iPhone</button>':'')+'<button class="btn secondary" style="margin-top:10px" data-scanner-help>I still need help identifying it</button><p class="helper">Photos stay in this browser session and are not uploaded.</p><button class="btn ghost" data-scan13-action="back">Back</button></section>';
  }
  scan13ThisDeviceView=function(){return confirmView(false)};
  scan13CompleteView=function(){return confirmView(true)};
  const previousCamera=scan13CameraView;
  scan13CameraView=function(){return previousCamera().replace('For this prototype, captured pictures stay in this browser session and are not uploaded anywhere. The recognition backend will be connected separately.','Your photos stay in this browser session and are not uploaded. After the scan, confirm the model to continue to repairs.')};
  document.addEventListener('change',function(e){
    if(e.target.id==='scannerBrand'){scanBrand=rules.data.manufacturerOrder.includes(e.target.value)?e.target.value:'';scanModel='';render()}
    if(e.target.id==='scannerModel'){scanModel=rules.find(e.target.value)?.manufacturer===scanBrand?e.target.value:'';render()}
  });
  window.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b)return;
    if(!b.hasAttribute('data-scanner-repairs')&&!b.hasAttribute('data-scanner-help'))return;
    e.preventDefault();e.stopImmediatePropagation();scan13StopCamera();
    if(b.hasAttribute('data-scanner-help')){helpReset();mode='help';render();window.scrollTo({top:0,behavior:'instant'});return}
    if(!rules.confirmed(scanModel)||rules.find(scanModel).manufacturer!==scanBrand)return;
    // A scanned second phone becomes a separate device when the basket already
    // contains repairs, rather than replacing a device with booked parts.
    if(basket.some(r=>r.deviceId===selected().id)&&selected().model!==scanModel)addDevice();
    setModel(scanModel);mode='book';stage=1;fault='';variant='';editId=null;render();window.scrollTo({top:0,behavior:'instant'});
  },true);
  const style=document.createElement('style');style.id='irepair-build32-style';
  style.textContent='.b27-home .route-choice{margin-top:clamp(250px,calc(100vw - 100px),340px)!important}.b27-home .b32-scanner{display:grid;grid-template-columns:50px minmax(0,1fr);gap:12px;align-items:center;text-align:left;min-height:112px;padding:16px!important;border:1px solid rgba(74,151,235,.65)!important;background:linear-gradient(135deg,rgba(232,247,255,.82),rgba(174,218,255,.52))!important;box-shadow:inset 0 1px 1px #fff,0 10px 26px rgba(35,101,170,.18)!important;backdrop-filter:blur(25px);-webkit-backdrop-filter:blur(25px)}.b32-scan-icon{display:grid;place-items:center;width:50px;height:60px;border-radius:16px;background:rgba(255,255,255,.58);color:#0874e7;font-size:40px}.b32-kicker{display:block;font-size:12px;font-weight:800;letter-spacing:.06em;color:#075bb8;margin-bottom:5px}.b27-home .b32-scanner strong{white-space:normal;font-size:20px!important;line-height:1.2!important}.b27-home .b32-scanner small{display:block;font-size:14px!important;line-height:1.4!important;margin-top:5px;color:#355875}.scan13-choice small{font-size:14px}.brand:focus-visible{outline:3px solid #0874e7;outline-offset:5px;border-radius:8px}';
  document.head.appendChild(style);
})();
