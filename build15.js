/* Build 15 · adaptive regional-variant evidence + part-compatibility gate */
(function(){
  var scan15={
    reason:'',
    sideShot:null,
    compatibility:'not-checked',
    compatibilityNote:'',
    returnScreen:'complete'
  };

  /* The parts catalogue will supply concrete rules. Until then, unknown
     compatibility is deliberately treated as a blocker for a model-specific
     part order/guaranteed booking. */
  window.iRepairCompatibilityGate={
    evaluate:function(partRule){
      var rule=partRule||{};
      if(rule.regionalCompatibility==='universal'){
        scan15.compatibility='universal';
        scan15.compatibilityNote=rule.note||'This part is confirmed compatible across the relevant variants.';
        return {status:'universal',allowPartCommitment:true,needVariantEvidence:false};
      }
      if(rule.regionalCompatibility==='variant-sensitive'){
        scan15.compatibility='variant-sensitive';
        scan15.compatibilityNote=rule.note||'The selected repair may use different parts between regional variants.';
        return {status:'variant-sensitive',allowPartCommitment:false,needVariantEvidence:true};
      }
      scan15.compatibility='unknown';
      scan15.compatibilityNote=rule.note||'Regional compatibility has not yet been verified for this part.';
      return {status:'unknown',allowPartCommitment:false,needVariantEvidence:true};
    },
    requestVariantCheck:function(reason){
      scan15.reason=reason||'The selected repair needs a regional-variant check before a part can be committed.';
      scan15.returnScreen=scan13.screen||'complete';
      scan13StopCamera();
      scan13.screen='variant-camera';
      mode='scanner';
      render();
      window.scrollTo({top:0,behavior:'instant'});
    },
    clear:function(){
      scan15={reason:'',sideShot:null,compatibility:'not-checked',compatibilityNote:'',returnScreen:'complete'};
    },
    getEvidence:function(){
      return {side:scan15.sideShot,reason:scan15.reason,status:scan15.compatibility,note:scan15.compatibilityNote};
    }
  };

  const resetBefore15=scan13Reset;
  scan13Reset=function(){
    resetBefore15();
    if(window.iRepairCompatibilityGate)window.iRepairCompatibilityGate.clear();
  };

  function compatibilityCard(){
    var cls=scan15.compatibility==='universal'?'ok':'warning';
    var title=scan15.compatibility==='universal'?'Regional compatibility cleared':
      scan15.compatibility==='variant-sensitive'?'Regional variant required':
      scan15.compatibility==='unknown'?'Compatibility must be checked':'Regional compatibility gate';
    var text=scan15.compatibilityNote||'After the device and repair are known, iRepair checks whether that exact part differs between regional/carrier variants. An extra side/model-code check is only requested when it matters.';
    return '<div class="'+cls+'"><strong>'+safe(title)+'</strong><br>'+safe(text)+'</div>';
  }

  const completeBefore15=scan13CompleteView;
  scan13CompleteView=function(){
    var base=completeBefore15();
    var insert='<div class="divider"></div><div class="eyebrow">PART COMPATIBILITY</div>'+compatibilityCard()+
      '<p class="muted">If a selected part is variant-sensitive, iRepair will automatically ask for one more view rather than making every customer take it.</p>'+ 
      '<button class="btn secondary" data-scan15-action="variant-test">Test the regional side-photo step →</button>';
    return base.replace('<button class="btn" data-scan13-action="existing-id">',insert+'<button class="btn" data-scan13-action="existing-id">');
  };

  function sideCameraView(){
    return '<section class="glass panel scan13-stage">'+
      '<div class="eyebrow">ONE MORE DETAIL</div><h2>Show me the right-hand edge of the device</h2>'+ 
      '<p class="scan13-instruction">Include the power/side button and the full area above and below it. Keep any antenna windows, cut-outs or extra buttons visible.</p>'+ 
      (scan15.reason?'<div class="tip"><strong>Why I need this:</strong> '+safe(scan15.reason)+'</div>':'')+
      '<div class="scan13-camera"><video id="scan13Video" autoplay playsinline muted></video><div class="scan13-guide edge"></div><div class="scan13-guide-label">Right-hand edge / side controls</div></div>'+ 
      (scan13.error?'<div class="warning">'+safe(scan13.error)+'</div>':'')+
      '<button class="scan13-capture" aria-label="Take side photo" data-scan15-action="capture-side"></button>'+ 
      '<p class="muted" style="text-align:center;margin-top:6px">Tap the white button when the edge and buttons are clear.</p>'+ 
      '<button class="btn secondary" data-scan15-action="file-side">Choose a photo instead</button>'+ 
      '<input id="scan15File" type="file" accept="image/*" capture="environment" hidden>'+ 
      '<button class="btn ghost" data-scan15-action="cancel-side">← Cancel this check</button></section>';
  }

  function sideReviewView(){
    return '<section class="glass panel scan13-stage"><div class="eyebrow">CHECK SIDE PHOTO</div>'+ 
      '<h2>Right-hand edge</h2><p class="scan13-instruction">Make sure the power/side button and any small antenna window or chassis cut-out can be seen.</p>'+ 
      '<div class="scan13-camera"><img src="'+scan15.sideShot+'" alt="Right-hand edge of device"><div class="scan13-guide edge"></div></div>'+ 
      '<button class="btn" data-scan15-action="use-side">Use this photo →</button>'+ 
      '<button class="btn secondary" data-scan15-action="retake-side">Retake</button>'+ 
      '<button class="btn ghost" data-scan15-action="cancel-side">← Cancel this check</button></section>';
  }

  function sideDoneView(){
    return '<section class="glass panel scan13-stage"><div class="eyebrow">REGIONAL EVIDENCE ADDED</div>'+ 
      '<h2>Side/edge photo captured</h2>'+ 
      '<div class="scan13-camera"><img src="'+scan15.sideShot+'" alt="Captured side of device"></div>'+ 
      '<div class="ok"><strong>Evidence saved for this scan.</strong><br>The recognition/parts engine can use this view to look for regional chassis, antenna and control differences.</div>'+ 
      '<div class="warning"><strong>Important:</strong> a visual regional clue is evidence, not an automatic parts guarantee. If the selected component is variant-sensitive, the exact model code must still be confirmed before ordering or guaranteeing the repair.</div>'+ 
      '<button class="btn" data-scan15-action="return-complete">Return to scan result →</button></section>';
  }

  const viewBefore15=scan13View;
  scan13View=function(){
    if(scan13.screen==='variant-camera')return sideCameraView();
    if(scan13.screen==='variant-review')return sideReviewView();
    if(scan13.screen==='variant-done')return sideDoneView();
    return viewBefore15();
  };

  const afterBefore15=scan13AfterRender;
  scan13AfterRender=async function(){
    if(scan13.screen!=='variant-camera')return afterBefore15();
    const video=document.getElementById('scan13Video');
    if(!video)return;
    scan13.error='';
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access is not available in this browser.');
      scan13.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      video.srcObject=scan13.stream;
      await video.play().catch(()=>{});
    }catch(err){
      scan13.error='I could not open the camera. You can choose a photo from your library instead.';
      scan13StopCamera();render();
    }
  };

  function captureSide(){
    const v=document.getElementById('scan13Video');
    if(!v||!v.videoWidth){scan13.error='The camera is not ready yet. Try again in a moment, or choose a photo instead.';render();return}
    const max=1400,scale=Math.min(1,max/v.videoWidth),c=document.createElement('canvas');
    c.width=Math.max(1,Math.round(v.videoWidth*scale));c.height=Math.max(1,Math.round(v.videoHeight*scale));
    c.getContext('2d').drawImage(v,0,0,c.width,c.height);
    scan15.sideShot=c.toDataURL('image/jpeg',0.86);
    scan13StopCamera();scan13.screen='variant-review';render();
  }

  function handleSideFile(file){
    if(!file)return;
    const r=new FileReader();
    r.onload=function(){scan13StopCamera();scan15.sideShot=String(r.result||'');scan13.screen='variant-review';render()};
    r.readAsDataURL(file);
  }

  document.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b)return;
    const a=b.dataset.scan15Action;if(!a)return;
    if(a==='variant-test'){
      window.iRepairCompatibilityGate.evaluate({regionalCompatibility:'variant-sensitive',note:'Prototype test: imagine the chosen repair uses a part that may differ between regional variants.'});
      window.iRepairCompatibilityGate.requestVariantCheck('The selected part may differ between regional/carrier variants.');return;
    }
    if(a==='capture-side'){captureSide();return}
    if(a==='file-side'){document.getElementById('scan15File')?.click();return}
    if(a==='retake-side'){scan15.sideShot=null;scan13.screen='variant-camera';render();return}
    if(a==='use-side'){scan13.screen='variant-done';render();return}
    if(a==='cancel-side'){scan13StopCamera();scan13.screen=scan15.returnScreen||'complete';render();return}
    if(a==='return-complete'){scan13.screen='complete';render();return}
  },false);

  document.addEventListener('change',function(e){
    if(e.target?.id==='scan15File')handleSideFile(e.target.files?.[0]);
  },false);
})();
