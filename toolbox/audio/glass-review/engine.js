(function(){
'use strict';
const $=id=>document.getElementById(id);
const catalogue=window.IRepairDeviceCatalogue;
let selectedModel=null,previewSide='front';
const steps=[
 {id:'receiver',part:'Upper speaker / receiver',question:'Can you hear this?',instruction:'Listen near the upper speaker.',side:'front',focus:'top',type:'left'},
 {id:'lower',part:'Lower loudspeaker',question:'Can you hear this clearly?',instruction:'Listen for crackling or distortion.',side:'front',focus:'bottom',type:'right'},
 {id:'bottomMic',part:'Lower microphone',question:'Speak now.',instruction:'Watch the live sound meter respond.',side:'front',focus:'bottomMic',type:'mic'},
 {id:'frontMic',part:'Front microphone',question:'Speak now.',instruction:'Watch the live sound meter respond.',side:'front',focus:'topMic',type:'mic'},
 {id:'rearMic',part:'Rear microphone',question:'Speak now.',instruction:'Watch the live sound meter respond.',side:'rear',focus:'rearMic',type:'mic'}
];
let index=0,answers={},ctx=null,toneNodes=[],toneStopHandle=null,micStream=null,analyser=null,micCtx=null,raf=null,recoveryOsc=null,recoveryCtx=null,recoveryTimer=null;
let toneVersion=0,cleanTarget='lower',cleanMode='sweep',cleanVersion=0;
let currentView='start';
let soundStyle=0;
const soundNames=['Sonic Horizon · Original','Horizon · Deep','Horizon · Aurora','Spatial Current · Original','Current · Silk','Current · Immersive'];
let toastTimer=null;
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function stagePhone(el,side,focus){
 catalogue.render(el,selectedModel,side,focus);
}
function showDevice(){
 $('start-stage').classList.toggle('has-model',!!selectedModel);
 stagePhone($('start-device'),previewSide,'');
 $('start-component-label').textContent=selectedModel?selectedModel.name:'Select a model';
 $('model-caption').textContent=selectedModel?'Model-matched front and rear illustration':'Select a model to see your handset.';
 $('flip-preview').textContent=previewSide==='front'?'View rear of handset ↻':'View front of handset ↻';
 $('start-btn').disabled=!selectedModel;
 $('quick-clear').disabled=!selectedModel;
 $('model-share').disabled=!selectedModel;
}
function pickDevice(slug){
 const device=catalogue.getModel(slug);
 selectedModel=device;previewSide='front';
 $('phone-model').value=device?device.slug:'';
 const url=new URL(location.href);
 if(device)url.searchParams.set('model',device.slug);else url.searchParams.delete('model');
 try{history.replaceState(null,'',url.pathname+url.search+url.hash);}catch(e){}
 showDevice();
}

/* Native iPhone handoff: no browser user-agent guessing.
   The host must explicitly expose a public-API-backed device snapshot. */
const nativeAudioModels=Object.freeze({
 'iPhone14,2':'iphone-13-pro','iPhone14,3':'iphone-13-pro-max',
 'iPhone14,4':'iphone-13-mini','iPhone14,5':'iphone-13',
 'iPhone15,2':'iphone-14-pro','iPhone15,3':'iphone-14-pro-max',
 'iPhone15,4':'iphone-15','iPhone15,5':'iphone-15-plus',
 'iPhone16,1':'iphone-15-pro','iPhone16,2':'iphone-15-pro-max',
 'iPhone17,1':'iphone-16-pro','iPhone17,2':'iphone-16-pro-max',
 'iPhone17,3':'iphone-16','iPhone17,4':'iphone-16-plus',
 'iPhone17,5':'iphone-16e',
 'iPhone18,1':'iphone-17-pro','iPhone18,2':'iphone-17-pro-max',
 'iPhone18,3':'iphone-17','iPhone18,4':'iphone-air'
});
let nativeIdentified=false;
async function detectNativeModel(){
 const handler=window.webkit?.messageHandlers?.iRepairAudioDevice;
 if(typeof handler?.postMessage!=='function')return;
 try{
  const reply=handler.postMessage({action:'identifyDevice',schema:1});
  if(!reply||typeof reply.then!=='function')return;
  const payload=await reply;
  const data=typeof payload==='string'?JSON.parse(payload):payload;
  if(!data||data.source!=='ios-native'||typeof data.modelIdentifier!=='string')return;
  const slug=nativeAudioModels[data.modelIdentifier];
  if(!slug||!catalogue.getModel(slug))return;
  // A model choice supplied in an incoming link is not silently overwritten.
  if(selectedModel)return;
  pickDevice(slug);
  nativeIdentified=true;
  $('model-caption').textContent='Detected by iOS · handset illustration selected automatically';
 }catch(e){
  // A bridge failure never creates a fake device identification.
 }
}

function setupModels(){
 let years=[...new Set(catalogue.models.map(m=>m.year))].sort((a,b)=>b-a);
 const select=$('phone-model');
 for(const year of years){
  const group=document.createElement('optgroup');group.label=String(year);
  catalogue.models.filter(m=>m.year===year).forEach(m=>{
   const option=document.createElement('option');option.value=m.slug;option.textContent=m.name;group.appendChild(option);
  });
  select.appendChild(group);
 }
 select.addEventListener('change',()=>pickDevice(select.value));
 $('flip-preview').addEventListener('click',()=>{previewSide=previewSide==='front'?'rear':'front';showDevice();});
 $('model-share').addEventListener('click',async()=>{
  if(!selectedModel)return;
  const url=new URL(location.href);url.searchParams.set('model',selectedModel.slug);
  try{await navigator.clipboard.writeText(url.toString());toast('Model link copied');}
  catch(e){toast('Copy link from Safari address bar');}
 });
 const query=new URLSearchParams(location.search).get('model');
 if(query&&catalogue.getModel(query))pickDevice(query);
 else showDevice();
}
function view(name){
 currentView=name;document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id===name));
 try{window.scrollTo({top:0,behavior:'instant'});}catch(e){}
}
function stopTone(){
 toneVersion++;
 if(toneStopHandle)clearTimeout(toneStopHandle);toneStopHandle=null;
 toneNodes.forEach(n=>{try{n.stop();}catch(e){}});toneNodes=[];
 const b=$('replay');if(b)b.textContent='▶ Resume sound';
}
async function ensureAudio(){
 if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)throw Error('Audio unavailable');ctx=new A();}
 if(ctx.state==='suspended')await ctx.resume();
 return ctx;
}
async function playTone(channel){
 stopTone();
 const run=toneVersion,activeId=steps[index].id;
 try{
  const c=await ensureAudio();
  if(toneVersion!==run||currentView!=='test'||steps[index].id!==activeId)return;
  const rate=c.sampleRate,duration=7.2,length=Math.round(rate*duration),buffer=c.createBuffer(2,length,rate);
  const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
  const TAU=2*Math.PI,style=soundStyle;
  const smooth=(x,a,b)=>{const q=Math.max(0,Math.min(1,(x-a)/(b-a)));return q*q*(3-2*q)};
  const env=(t,a,b,c,d)=>smooth(t,a,b)*(1-smooth(t,c,d));
  let seed=1399+(style===0?1:style===3?4:style)*7919,low=0,mid=0,high=0,phase=0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1};
  for(let i=0;i<length;i++){
   const t=i/rate,fade=env(t,0,.09,duration-.42,duration);
   const noise=random();low+=.00095*(noise-low);mid+=.017*(noise-mid);high+=.13*(noise-high);
   const air=noise-high,body=mid-low,rise=smooth(t,.2,3.6);
   let wave=0;
   if(style===0){ // Original Sonic Horizon from v1.5, unchanged.
    const drift=.5+.5*Math.sin(TAU*.18*t);
    wave=.07*(Math.sin(TAU*196*t)+.5*Math.sin(TAU*247*t)+.3*Math.sin(TAU*294*t))*env(t,.1,1.6,5.6,7.15)+.12*body*(.5+.5*drift)+.03*air*rise;
   }else if(style===1){ // Deep: warm lower harmonics, slower swell.
    const drift=.5+.5*Math.sin(TAU*.12*t);
    wave=.072*(Math.sin(TAU*164.81*t)+.46*Math.sin(TAU*207.65*t)+.3*Math.sin(TAU*246.94*t))*env(t,.1,1.9,5.6,7.15)+.17*body*(.35+.65*drift)+.018*air*rise;
   }else if(style===2){ // Aurora: bright wide bloom and floating upper layers.
    const drift=.5+.5*Math.sin(TAU*.21*t);
    wave=.055*(Math.sin(TAU*220*t)+.52*Math.sin(TAU*277.18*t)+.32*Math.sin(TAU*329.63*t)+.12*Math.sin(TAU*554.37*t))*env(t,.1,1.4,5.6,7.15)+.105*body*(.45+.55*drift)+.038*air*rise;
   }else if(style===3){ // Original Spatial Current from v1.5, unchanged.
    const swell=.5+.5*Math.sin(TAU*.36*t-.6),hz=210+260*swell;
    phase+=TAU*hz/rate;
    wave=(.065*Math.sin(phase)*(.3+.7*swell)+.14*body*(.4+.6*swell)+.025*air*swell)*env(t,0,.6,5.7,7.15);
   }else if(style===4){ // Silk: slower, softer and warmer movement.
    const swell=.5+.5*Math.sin(TAU*.23*t-.7),hz=185+175*swell;
    phase+=TAU*hz/rate;
    wave=(.055*Math.sin(phase)*(.4+.6*swell)+.155*body*(.35+.65*swell)+.015*air*swell)*env(t,0,.9,5.65,7.15);
   }else{ // Immersive: two evolving harmonics with a wider moving sweep.
    const swell=.5+.5*Math.sin(TAU*.31*t-.4),hz=230+310*swell;
    phase+=TAU*hz/rate;
    wave=(.056*Math.sin(phase)+.025*Math.sin(phase*.503)+.14*body*(.25+.75*swell)+.032*air*swell)*env(t,0,.7,5.7,7.15);
   }
   const sample=Math.tanh(wave*1.6)*fade*.78;
   if(channel==='left')left[i]=sample;else if(channel==='right')right[i]=sample;else{left[i]=sample;right[i]=sample;}
  }
  const source=c.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(c.destination);toneNodes=[source];source.start();
  $('replay').textContent='■ Pause sound';
 }catch(e){toast('Audio could not start');$('test-note').textContent='Tap Resume sound to try again.';}
}
function renderSoundChooser(){
 const options=$('sound-options');options.replaceChildren();
 soundNames.forEach((name,i)=>{
  const button=document.createElement('button');button.type='button';button.className='sound-choice'+(soundStyle===i?' active':'');
  button.textContent=String(i+1).padStart(2,'0');button.setAttribute('aria-label','Preview '+name);button.setAttribute('aria-pressed',String(soundStyle===i));
  button.addEventListener('click',()=>{soundStyle=i;renderSoundChooser();if(currentView==='test'&&steps[index].type!=='mic')playTone(steps[index].type);});
  options.appendChild(button);
 });
 $('sound-name').textContent=soundNames[soundStyle];
}

function clearMic(){
 clearVoice();
 if(raf)cancelAnimationFrame(raf);raf=null;analyser=null;
 if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;}
 if(micCtx){micCtx.close().catch(()=>{});micCtx=null;}
}

/* Optional short microphone preview. Entirely in memory; nothing uploaded. */
let voiceRecorder=null,voiceTimer=null,voiceUrl=null,voiceParts=[];
function clearVoice(){
 if(voiceTimer)clearTimeout(voiceTimer);voiceTimer=null;
 if(voiceRecorder){
  voiceRecorder.ondataavailable=null;voiceRecorder.onstop=null;
  try{if(voiceRecorder.state!=='inactive')voiceRecorder.stop();}catch(e){}
  voiceRecorder=null;
 }
 voiceParts=[];
 const audio=$('voiceAudio');if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio.hidden=true;}
 if(voiceUrl){URL.revokeObjectURL(voiceUrl);voiceUrl=null;}
 if($('recordVoice'))$('recordVoice').disabled=true;
 if($('voiceNote'))$('voiceNote').textContent='Your sample stays on this device and is discarded when you leave the test.';
}
function recordVoice(){
 if(!micStream||typeof MediaRecorder==='undefined'){
  $('voiceNote').textContent='Recording is unavailable here. Use the live sound meter instead.';return;
 }
 if(voiceRecorder?.state==='recording')return;
 try{
  const rec=new MediaRecorder(micStream);voiceRecorder=rec;voiceParts=[];
  if(voiceUrl){URL.revokeObjectURL(voiceUrl);voiceUrl=null;}
  $('voiceAudio').pause();$('voiceAudio').hidden=true;$('voiceAudio').removeAttribute('src');
  rec.ondataavailable=e=>{if(e.data&&e.data.size)voiceParts.push(e.data);};
  rec.onstop=()=>{
   if(voiceRecorder!==rec)return;
   $('recordVoice').disabled=false;
   if(!voiceParts.length){$('voiceNote').textContent='No recording captured; try the live meter.';return;}
   const blob=new Blob(voiceParts,{type:rec.mimeType||voiceParts[0].type||'audio/mp4'});
   voiceUrl=URL.createObjectURL(blob);
   $('voiceAudio').src=voiceUrl;$('voiceAudio').hidden=false;
   $('voiceNote').textContent='Listen back to the short sample. It will be erased when you leave this step.';
   voiceParts=[];
  };
  rec.onerror=()=>{$('voiceNote').textContent='Unable to record on this browser.';};
  rec.start();
  $('recordVoice').disabled=true;
  $('voiceNote').textContent='Recording for three seconds…';
  voiceTimer=setTimeout(()=>{
   voiceTimer=null;
   if(rec.state==='recording')try{rec.stop();}catch(e){}
  },3000);
 }catch(e){$('recordVoice').disabled=false;$('voiceNote').textContent='Recording is not supported here.';}
}

const micEvidence={};
function micEvidenceText(id){
 const e=micEvidence[id];if(!e)return 'Not measured';
 if(e.error)return 'Capture unavailable: '+e.error;
 return (e.strong>=5?'SIGNAL DETECTED':e.samples<8?'INSUFFICIENT DATA':'NO CLEAR SIGNAL DETECTED')+'; peak '+e.peak.toFixed(1)+' dBFS; mean '+(e.samples?e.sum/e.samples:-90).toFixed(1)+' dBFS; '+e.samples+' measurement frames';
}
async function micStart(){
 clearMic();$('db').textContent='— dBFS';
 const id=steps[index].id;
 const evidence={samples:0,sum:0,peak:-90,strong:0,error:null};micEvidence[id]=evidence;
 $('test-note').textContent='Allow microphone access to see the live level.';
 try{
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw Error('Mic access is not available');
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
  if(currentView!=='test'||steps[index].id!==id){stream.getTracks().forEach(t=>t.stop());return;}
  micStream=stream;
  $('recordVoice').disabled=typeof MediaRecorder==='undefined';
  $('voiceNote').textContent=typeof MediaRecorder==='undefined'?'Your browser does not support local recording.':'Optional: Record a 3-second sample and listen back.';
  const A=window.AudioContext||window.webkitAudioContext;micCtx=new A();
  await micCtx.resume();
  const input=micCtx.createMediaStreamSource(stream);
  analyser=micCtx.createAnalyser();analyser.fftSize=2048;input.connect(analyser);
  const buf=new Float32Array(analyser.fftSize),bars=Array.from($('meter').children);
  $('test-note').textContent='Safari uses its available mic input. Physical source selection requires native iOS.';
  function frame(){
   if(!analyser||currentView!=='test'||steps[index].id!==id)return;
   analyser.getFloatTimeDomainData(buf);
   let sum=0;for(let i=0;i<buf.length;i++)sum+=buf[i]*buf[i];
   const rms=Math.sqrt(sum/buf.length);
   const db=rms?Math.max(-90,20*Math.log10(rms)):-90;
   evidence.samples++;evidence.sum+=db;evidence.peak=Math.max(evidence.peak,db);if(db>-48)evidence.strong++;
   $('db').textContent=db.toFixed(1)+' dBFS';
   const amp=Math.max(0,Math.min(1,(db+75)/65));
   bars.forEach((b,i)=>{const wave=Math.max(0,1-Math.abs(i-(bars.length-1)/2)/(bars.length/2));b.style.height=Math.max(5,Math.round(amp*100*(.5+.5*wave)))+'%';b.style.opacity=i/(bars.length-1)<amp+.10?'1':'.22';});
   raf=requestAnimationFrame(frame);
  }frame();
 }catch(e){evidence.error=e&&e.name?e.name:'Input unavailable';$('test-note').textContent='Microphone unavailable. Choose Cannot test or change Safari permission.';}
}
function renderTest(){
 clearMic();stopTone();
 const t=steps[index];view('test');
 $('step-label').textContent='TEST '+(index+1)+' OF '+steps.length;
 $('track').innerHTML=steps.map((_,i)=>'<i class="'+(i<=index?'on':'')+'"></i>').join('');
 $('component').textContent=t.part;
 $('question').textContent=t.question;
 $('instruction').textContent=t.instruction;
 $('highlight-label').textContent=t.part;
 stagePhone($('test-device'),t.side,t.focus);
 const mic=t.type==='mic';
 $('meter-wrap').classList.toggle('hide',!mic);
 $('micPlayback').classList.toggle('hide',!mic);
 $('micPlayback').open=false;
 $('replay').classList.toggle('hide',mic);
 $('sound-chooser').classList.toggle('hide',mic);
 if(!mic)renderSoundChooser();
 if(mic){micStart();}
 else { $('test-note').textContent='Choose a sound above. It loops until you select a result. Browser audio cannot isolate a physical speaker.';playTone(t.type);}
}
function reportValue(t){return answers[t.id]||'CANNOT TEST';}
function renderReport(){
 clearMic();stopTone();view('results');
 $('report-device').textContent=(selectedModel?selectedModel.name:'iPhone')+' · Your audio test observations';
 let pass=0,fail=0,unable=0;
 const labels={'PASS':'Pass','FAIL':'Fail','CANNOT TEST':'Cannot test'};
 $('report').innerHTML=steps.map(t=>{
  let value=reportValue(t);if(value==='PASS')pass++;else if(value==='FAIL')fail++;else unable++;
  let klass=value==='PASS'?'good':value==='FAIL'?'bad':'neutral';
  return '<div class="report-line"><strong>'+t.part+(t.type==='mic'?'<span style="display:block;font-size:10px;font-weight:500;margin-top:5px;line-height:1.4;color:#52718c">'+micEvidenceText(t.id)+'</span>':'')+'</strong><small class="'+klass+'">'+labels[value]+'</small></div>';
 }).join('');
 $('stats').innerHTML=[['Passed',pass],['Failed',fail],['Untested',unable]].map(t=>'<div class="stat"><b>'+t[1]+'</b><span>'+t[0]+'</span></div>').join('');
}
function answer(value){answers[steps[index].id]=value;index++;if(index===steps.length)renderReport();else renderTest();}
function reportText(){
 return ['iREPAIR AUDIO DIAGNOSTICS','Date: '+new Date().toLocaleString('en-GB'),'Device: '+(selectedModel?selectedModel.name:'Unidentified iPhone'),'Assessment: user-observed browser preview with automatically measured microphone input','',...steps.map(t=>t.part+': '+reportValue(t)+(t.type==='mic'?' | Browser input: '+micEvidenceText(t.id):'')),'','Note: iPhone model was selected by the customer, not automatically detected. Model-matched drawings show approximate audio areas. Microphone steps may sample the same browser-selected input; these are not independent physical microphone measurements. Safari cannot select individual physical microphone sources or isolate receiver output. Stereo tracks do not confirm independent physical speaker operation. Native iOS testing is required.'].join('\n');
}
async function copyReport(){
 const value=reportText();
 try{await navigator.clipboard.writeText(value);toast('Report copied');}catch(e){
  const box=document.createElement('textarea');box.value=value;document.body.appendChild(box);box.select();
  if(document.execCommand('copy'))toast('Report copied');else toast('Clipboard unavailable');box.remove();
 }
}
function displayRecovery(){
 stagePhone($('recovery-device'),'front',cleanTarget==='upper'?'top':'bottom');
 $('recovery-label').textContent=cleanTarget==='upper'?'Upper earpiece area':'Lower loudspeaker area';
 document.querySelectorAll('[data-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.target===cleanTarget)));
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===cleanMode)));
 $('clean-routing').textContent='Safari plays through its current output; highlighting does not isolate this speaker.';
 $('recovery-go').textContent=cleanMode==='sweep'?'▶ Run high-frequency sweep':'▶ Run water-eject cycle';
}
function stopRecovery(){
 cleanVersion++;
 if(recoveryTimer)clearTimeout(recoveryTimer);recoveryTimer=null;
 if(recoveryOsc){try{recoveryOsc.stop();}catch(e){}recoveryOsc=null;}
 if(recoveryCtx){recoveryCtx.close().catch(()=>{});recoveryCtx=null;}
 $('recovery-go').disabled=false;$('recovery-stop').disabled=true;
 $('recovery-note').textContent='Stopped. Ready for another cycle.';
}
async function runRecovery(){
 if(recoveryCtx)return;
 const version=++cleanVersion;
 try{
  const A=window.AudioContext||window.webkitAudioContext;if(!A)throw Error('Audio unavailable');
  const c=new A();recoveryCtx=c;await c.resume();
  if(version!==cleanVersion||currentView!=='recovery'){await c.close();return;}
  const osc=c.createOscillator(),gain=c.createGain(),now=c.currentTime;
  osc.type='sine';
  // A controlled, audible frequency sweep: high-frequency sound is NOT physical dirt removal.
  // Water-eject mode remains a short low-frequency oscillation.
  if(cleanMode==='sweep'){
   for(let n=0;n<8;n++){
    const at=now+n;
    osc.frequency.setValueAtTime(950,at);
    osc.frequency.exponentialRampToValueAtTime(2350,at+.9);
    gain.gain.setValueAtTime(0,at);
    gain.gain.linearRampToValueAtTime(.035,at+.14);
    gain.gain.setValueAtTime(.035,at+.80);
    gain.gain.linearRampToValueAtTime(0,at+.97);
   }
  }else{
   osc.frequency.setValueAtTime(165,now);
   gain.gain.setValueAtTime(0,now);
   gain.gain.linearRampToValueAtTime(.075,now+.25);
   gain.gain.setValueAtTime(.075,now+7.5);
   gain.gain.linearRampToValueAtTime(0,now+8);
  }
  osc.connect(gain);gain.connect(c.destination);osc.start(now);osc.stop(now+8.02);recoveryOsc=osc;
  $('recovery-go').disabled=true;$('recovery-stop').disabled=false;
  $('recovery-note').textContent='8-second cycle playing';
  recoveryTimer=setTimeout(()=>{if(version!==cleanVersion)return;stopRecovery();$('recovery-note').textContent='Cycle complete. Re-test the speaker to compare.';},8120);
 }catch(e){stopRecovery();toast('Sound cycle could not start');}
}
$('start-btn').addEventListener('click',()=>{if(!selectedModel)return;index=0;answers={};Object.keys(micEvidence).forEach(k=>delete micEvidence[k]);renderTest();});
$('change-model').addEventListener('click',()=>{clearMic();stopTone();view('start');showDevice();});
$('quick-clear').addEventListener('click',()=>{stopTone();displayRecovery();view('recovery');});
$('back').addEventListener('click',()=>{if(index){index--;renderTest();}else{clearMic();stopTone();view('start');}});
$('replay').addEventListener('click',()=>{if(toneNodes.length)stopTone();else playTone(steps[index].type);});
document.querySelectorAll('[data-answer]').forEach(e=>e.addEventListener('click',()=>answer(e.dataset.answer)));
$('copy').addEventListener('click',copyReport);
$('share-audio').addEventListener('click',async()=>{
 const text=reportText();
 if(navigator.share){
  try{await navigator.share({title:'iRepair Audio Diagnostics',text});return;}catch(e){if(e.name==='AbortError')return;}
 }
 await copyReport();
});
$('print-audio').addEventListener('click',()=>window.print());
$('recordVoice').addEventListener('click',recordVoice);
$('again').addEventListener('click',()=>{index=0;answers={};Object.keys(micEvidence).forEach(k=>delete micEvidence[k]);renderTest();});
$('recovery-open').addEventListener('click',()=>{displayRecovery();view('recovery');});
document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',()=>{stopRecovery();cleanTarget=b.dataset.target;if(cleanTarget==='upper'&&cleanMode==='water')cleanMode='sweep';displayRecovery();}));
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.mode==='water'&&cleanTarget==='upper')cleanTarget='lower';stopRecovery();cleanMode=b.dataset.mode;displayRecovery();}));
$('recovery-back').addEventListener('click',()=>{stopRecovery();view('results');});
$('recovery-go').addEventListener('click',runRecovery);
$('recovery-stop').addEventListener('click',stopRecovery);
window.addEventListener('pagehide',()=>{clearMic();stopTone();stopRecovery();if(ctx)ctx.close().catch(()=>{});});
$('meter').innerHTML=Array.from({length:25},()=>'<span></span>').join('');
setupModels();
void detectNativeModel();
renderSoundChooser();
})();