function homeScreen(){return `<section class="glass panel"><div class="eyebrow">CUSTOMER APP PREVIEW · BUILD 09</div><h1 style="margin-left:0">What can I help you with?</h1><p class="muted">Start with whichever route feels easiest. You can switch routes at any time.</p><div class="route-choice"><button class="route-card primary" data-action="route-known"><strong>I know what I need — show me prices</strong><small>Choose your model, repair and available options directly.</small></button><button class="route-card" data-action="route-help"><strong>I need help — I’m not sure what I need</strong><small>Answer a few plain-English questions and we’ll guide you to the likely repair.</small></button></div></section><section class="glass panel"><div class="eyebrow">ALREADY STARTED?</div><div class="choice-grid"><button class="choice" id="navRepairsShortcut"><strong>My repairs</strong><br><span class="muted">Track an existing job</span></button><button class="choice" id="navProfileShortcut"><strong>My details</strong><br><span class="muted">Devices, addresses & profile</span></button></div></section>${sellCard()}`}

// Handle Build 09 controls the Build 08 click router does not know about.
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.dataset.helpCameraControl){helpCameraControl=b.dataset.helpCameraControl;render();return}
  if(b.dataset.helpModelpick){let d=selected();d.model=b.dataset.helpModelpick;d.custom='';helpKnown='yes';render();return}
  if(b.dataset.action==='help-visual'){helpUsable='Visual';render();return}
  if(b.dataset.action==='help-other-next'){let d=selected();d.model='otherphone';d.custom=(document.getElementById('helpCustomModel')?.value||'Other phone').trim();helpStep=2;mode='help';render();window.scrollTo({top:0,behavior:'instant'});return}
},false);

document.addEventListener('input',e=>{if(e.target?.id==='helpCustomModel'&&helpBrand==='Other phone'){selected().custom=e.target.value}},false);
