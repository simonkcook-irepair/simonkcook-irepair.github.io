function candidateModels(){
 let cam=helpCameras,front=helpDisplay,port=helpPort,cc=helpCameraControl;
 if(cam==='single'){
   if(front==='Home button')return ['iphonese3','iphonese2','iphone8','iphone7','iphone6s','iphone6','iphone6splus','iphone6plus'];
   if(front==='Notch'&&port==='Lightning')return ['iphonexr'];
   if(front==='Notch'&&port==='USB-C')return ['iphone16e','iphone17e'];
   return ['iphonexr','iphone16e','iphone17e','iphonese3','iphonese2','iphone8','iphone7'];
 }
 if(cam==='single-plateau')return ['iphoneair'];
 if(cam==='dual-horizontal')return ['iphone7plus','iphone8plus'];
 if(cam==='dual-strip')return ['iphonex','iphonexs','iphonexsmax'];
 if(cam==='dual-square-vertical')return ['iphone11','iphone12','iphone12mini'];
 if(cam==='dual-diagonal'){
   if(front==='Dynamic Island / cut-out'||port==='USB-C')return ['iphone15','iphone15plus'];
   return ['iphone13','iphone13mini','iphone14','iphone14plus'];
 }
 if(cam==='dual-new-vertical')return ['iphone16','iphone16plus','iphone17'];
 if(cam==='triple-plateau')return ['iphone17pro','iphone17pm','iphone18pro','iphone18pm'];
 if(cam==='triple-square'){
   if(front==='Dynamic Island / cut-out'&&port==='Lightning')return ['iphone14pro','iphone14pm'];
   if(front==='Dynamic Island / cut-out'&&port==='USB-C'){
     if(cc==='Yes')return ['iphone16pro','iphone16pm'];
     if(cc==='No')return ['iphone15pro','iphone15pm'];
     return ['iphone15pro','iphone15pm','iphone16pro','iphone16pm'];
   }
   return ['iphone11pro','iphone11pm','iphone12pro','iphone12pm','iphone13pro','iphone13pm'];
 }
 if(front==='Home button')return ['iphonese3','iphonese2','iphone8','iphone8plus','iphone7','iphone7plus'];
 if(front==='Notch'&&port==='USB-C')return ['iphone16e','iphone17e'];
 if(front==='Dynamic Island / cut-out'&&port==='Lightning')return ['iphone14pro','iphone14pm'];
 if(front==='Dynamic Island / cut-out'&&port==='USB-C')return ['iphone15','iphone15plus','iphone15pro','iphone15pm','iphone16','iphone16plus','iphone16pro','iphone16pm','iphoneair','iphone17','iphone17pro','iphone17pm','iphone18pro','iphone18pm'];
 return ['iphonex','iphonexr','iphonexs','iphonexsmax','iphone11','iphone11pro','iphone11pm','iphone12mini','iphone12','iphone12pro','iphone12pm','iphone13mini','iphone13','iphone13pro','iphone13pm','iphone14','iphone14plus'];
}
function candidatePanel(){
 if(!helpCameras||!helpDisplay||!helpPort)return '';
 let list=candidateModels();
 let picked=selected().model;
 let cards=list.slice(0,12).map(key=>`<button type="button" class="result-card" data-help-modelpick="${key}" aria-pressed="${picked===key}"><span class="result-phone">📱</span><span><strong>${safe(CATALOGUE[key]?.name||key)}</strong><small>Tap if this looks like your model</small></span></button>`).join('');
 return `<div class="divider"></div><div class="eyebrow">BEST MATCHES FROM YOUR CLUES</div><p class="muted">${list.length===1?'We have narrowed it to one likely model.':'These models share the physical clues you selected. Choose the best match; staff can verify before the repair.'}</p>${cards}${list.length>12?'<p class="helper">There are more possible matches. Checking Settings → General → About is the safest confirmation if the phone can be opened.</p>':''}${IPHONE_KEYS.includes(picked)&&list.includes(picked)?`<button class="btn" style="margin-top:10px" data-action="help-device-next">Use ${safe(CATALOGUE[picked].name)} →</button>`:`<button class="btn secondary" style="margin-top:10px" data-action="help-unconfirmed-next">I still can’t tell — continue unconfirmed →</button>`}`;
}
function visualIdentifier(){
 let needCC=(helpDisplay==='Dynamic Island / cut-out'&&helpPort==='USB-C'&&helpCameras==='triple-square');
 return `<div class="tip"><strong>Look at the back of the iPhone.</strong> Choose the camera arrangement that most closely matches it. The drawings are simplified identification diagrams, not product photos.</div><label class="field-label">Which rear camera layout matches?</label><div class="visual-grid">${CAMERA_LAYOUTS.map(([id,title,sub])=>`<button type="button" class="visual-card" data-help-cameras="${id}" aria-pressed="${helpCameras===id}">${cameraGraphic(id)}<strong>${safe(title)}</strong><small>${safe(sub)}</small></button>`).join('')}</div><button type="button" class="btn ghost" data-help-cameras="not-sure">I’m not sure about the cameras</button><label class="field-label">Which front design matches your iPhone?</label><div class="pill-row">${['Home button','Notch','Dynamic Island / cut-out','Not sure'].map(v=>`<button class="pill" data-help-display="${v}" aria-pressed="${helpDisplay===v}">${v}</button>`).join('')}</div><label class="field-label">Charging connector</label><div class="pill-row">${['Lightning','USB-C','Not sure'].map(v=>`<button class="pill" data-help-port="${v}" aria-pressed="${helpPort===v}">${v}</button>`).join('')}</div>${needCC?`<label class="field-label">Is there a separate Camera Control button low down on the right-hand side?</label><div class="pill-row">${['Yes','No','Not sure'].map(v=>`<button class="pill" data-help-camera-control="${v}" aria-pressed="${helpCameraControl===v}">${v}</button>`).join('')}</div>`:''}${helpCameras&&helpDisplay&&helpPort?`<p class="clue-summary">Clues: ${safe([CAMERA_LAYOUTS.find(x=>x[0]===helpCameras)?.[1]||helpCameras,helpDisplay,helpPort,needCC&&helpCameraControl?('Camera Control: '+helpCameraControl):''].filter(Boolean).join(' · '))}</p>${candidatePanel()}`:''}<p class="research-note">Identification logic uses physical features only as a shortlist. Some iPhone generations are externally very similar, so the exact model should still be confirmed before a repair price is final.</p>`;
}
