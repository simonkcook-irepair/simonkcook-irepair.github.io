/* Build 14 · make Device Scanner the default identification route */
(function(){
  function openScanner(){
    if(typeof scan13Reset==='function')scan13Reset();
    mode='scanner';
    if(typeof scan13!=='undefined')scan13.screen='start';
    render();
    window.scrollTo({top:0,behavior:'instant'});
  }

  /* Intercept the old guided-help entry before the legacy identifier handles it. */
  document.addEventListener('click',function(e){
    const b=e.target.closest('button');
    if(!b)return;
    if(b.dataset.action==='route-help'){
      e.preventDefault();
      e.stopImmediatePropagation();
      openScanner();
    }
  },true);

  /* If the fallback identifier is opened from elsewhere, make scanning the
     primary option and keep Settings/manual identification underneath. */
  const legacyHelpDeviceScreen=helpDeviceScreen;
  helpDeviceScreen=function(){
    if(helpBrand==='Apple iPhone' || helpBrand==='Other phone')return legacyHelpDeviceScreen();
    return '<section class="glass panel">'+helpProgress()+
      '<div class="eyebrow">STEP 1 · IDENTIFY YOUR DEVICE</div>'+ 
      '<h2>Let iRepair identify it for you</h2>'+ 
      '<p class="muted">The scanner is the default route. It will ask for the exact photos it needs and only falls back to manual checks when a device cannot be confirmed safely.</p>'+ 
      '<button class="btn" data-action="device-scanner">⌁ Scan / identify this device →</button>'+ 
      '<div class="divider"></div>'+ 
      '<button class="btn secondary" data-help-brand="Apple iPhone">Use iPhone Settings / manual identification</button>'+ 
      '<button class="btn secondary" style="margin-top:8px" data-help-brand="Other phone">Enter another phone manually</button>'+ 
      '<button class="btn ghost help-back" data-action="help-home">← Back</button>'+ 
      '</section>';
  };

  /* Clarify on the home repair-help card that scanning is now what happens first. */
  const homeBefore14=homeScreen;
  homeScreen=function(){
    let html=homeBefore14();
    html=html.replace('I need help — I’m not sure what I need','I need help — scan my device first');
    html=html.replace('Answer a few plain-English questions and we’ll guide you to the likely repair.','Start with the Device Scanner, then iRepair will guide you through the repair using the confirmed model.');
    return html;
  };
})();
