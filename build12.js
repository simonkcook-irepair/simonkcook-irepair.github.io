/* Build 12 · safety-first iPhone identifier. Never guesses an ambiguous model. */
if(!CATALOGUE.iphoneduo)CATALOGUE.iphoneduo={name:'iPhone Duo',screen:{},review:true};
if(typeof IPHONE_KEYS!=='undefined'&&!IPHONE_KEYS.includes('iphoneduo'))IPHONE_KEYS.push('iphoneduo');
if(typeof ID10_A!=='undefined')Object.assign(ID10_A,{
 A3472:'iphone18pro',A3713:'iphone18pro',A3714:'iphone18pro',A3715:'iphone18pro',
 A3473:'iphone18pm',A3716:'iphone18pm',A3717:'iphone18pm',A3718:'iphone18pm',A3720:'iphoneduo'
});

const ID12_ROWS=`iphone6|L|1|N|s|h|r|m|N|s
iphone6plus|L|1|N|s|h|r|m|N|l
iphone6s|L|1|N|s|h|r|m|N|s
iphone6splus|L|1|N|s|h|r|m|N|l
iphonese1|L|1|N|s|h|f|m|N|v
iphone7|L|1|N|s|h|r|m|N|s
iphone7plus|L|2|N|dh|h|r|m|N|l
iphone8|L|1|N|s|h|r|g|N|s
iphone8plus|L|2|N|dh|h|r|g|N|l
iphonex|L|2|N|ds|w|r|g|N|s
iphonexr|L|1|N|s|w|r|g|N|s
iphonexs|L|2|N|ds|w|r|g|N|s
iphonexsmax|L|2|N|ds|w|r|g|N|l
iphone11|L|2|N|dv|w|r|g|N|s
iphone11pro|L|3|N|ts|w|r|g|N|s
iphone11pm|L|3|N|ts|w|r|g|N|l
iphonese2|L|1|N|s|h|r|g|N|s
iphone12mini|L|2|N|dv|w|f|g|N|c
iphone12|L|2|N|dv|w|f|g|N|s
iphone12pro|L|3|N|ts|w|f|g|N|s
iphone12pm|L|3|N|ts|w|f|g|N|l
iphone13mini|L|2|N|dd|w|f|g|N|c
iphone13|L|2|N|dd|w|f|g|N|s
iphone13pro|L|3|N|ts|w|f|g|N|s
iphone13pm|L|3|N|ts|w|f|g|N|l
iphonese3|L|1|N|s|h|r|g|N|s
iphone14|L|2|N|dd|w|f|g|N|s
iphone14plus|L|2|N|dd|w|f|g|N|l
iphone14pro|L|3|N|ts|p|f|g|N|s
iphone14pm|L|3|N|ts|p|f|g|N|l
iphone15|U|2|N|dd|p|f|g|N|s
iphone15plus|U|2|N|dd|p|f|g|N|l
iphone15pro|U|3|N|ts|p|f|g|N|s
iphone15pm|U|3|N|ts|p|f|g|N|l
iphone16e|U|1|N|s|w|f|g|N|s
iphone16|U|2|N|dn|p|f|g|Y|s
iphone16plus|U|2|N|dn|p|f|g|Y|l
iphone16pro|U|3|N|ts|p|f|g|Y|s
iphone16pm|U|3|N|ts|p|f|g|Y|l
iphone17e|U|1|N|s|w|f|g|N|s
iphone17|U|2|N|dn|p|f|g|Y|s
iphone17pro|U|3|N|tp|p|f|g|Y|s
iphone17pm|U|3|N|tp|p|f|g|Y|l
iphoneair|U|1|N|sp|p|f|g|Y|s
iphone18pro|U|3|N|tp|p|f|g|Y|s
iphone18pm|U|3|N|tp|p|f|g|Y|l
iphoneduo|U|2|Y|fd|p|d|g|Y|d`.trim().split('\n');
const ID12_MODELS={};
for(const row of ID12_ROWS){
 const [k,port,cameras,foldable,layout,front,frame,back,cameraControl,size]=row.split('|');
 ID12_MODELS[k]={port,cameras,foldable,layout,front,frame,back,cameraControl,size};
}
const ID12_PRIORITY=['port','cameras','foldable','layout','front','frame','cameraControl','back','size'];
const ID12_TEXT={
 port:['What charging socket is on the bottom of the iPhone?','This first check immediately separates iPhone 14 and earlier from the newer USB-C families.',{
  L:['Lightning','Small Apple charging socket','⚡'],U:['USB-C','Wider oval charging socket','USB-C']}],
 cameras:['How many rear camera lenses does it have?','Count the large camera lenses. Do not count the flash or a small LiDAR sensor.',{
  '1':['1 camera','One large rear lens','1'],'2':['2 cameras','Two large rear lenses','2'],'3':['3 cameras','Three large rear lenses','3']}],
 foldable:['Does the phone fold open?','Only choose Yes if the handset physically folds into a larger inner screen.',{
  Y:['Yes — it folds','Foldable iPhone','↔'],N:['No — solid phone','Normal one-piece handset','▯']}],
 layout:['How are the rear cameras arranged?','Look only at the position of the large rear camera lenses.',{
  s:['Single lens in the corner','One normal corner camera','◉'],sp:['Single lens on a wide camera bar','Camera area stretches across the back','◉'],
  dh:['Two lenses side-by-side','Horizontal pair','● ●'],ds:['Two lenses in a narrow vertical strip','Tall slim camera section','●\n●'],
  dv:['Two lenses straight up-and-down in a square','Both lenses in a square camera bump','●\n●'],dd:['Two lenses diagonally','One top-left, one bottom-right','● \n ●'],
  dn:['Two lenses straight up-and-down in a slim pill','Newer narrow vertical camera unit','●\n●'],ts:['Three lenses in a square camera area','Triangular three-camera cluster','●●\n ●'],
  tp:['Three lenses on a wide camera area','Camera area stretches from side to side','●●●'],fd:['Two cameras on a foldable iPhone','Foldable body','↔']}],
 front:['What does the top/front of the screen look like?','No technical names needed — choose the physical shape you can see.',{
  h:['Round Home button below the screen','Physical round button at the bottom','◉'],
  w:['Wide black cut-out joined to the top edge','The black area touches the top edge','▰'],
  p:['Small floating pill-shaped black area','There is visible screen above the black pill','▬']}],
 frame:['Are the outer sides rounded or flat?','Look at the metal edge around the phone, not the screen glass.',{
  r:['Rounded sides','Edges curve into the front and back','◖▯◗'],f:['Flat straight sides','Straight slab-like outer edge','▯'],d:['Foldable frame','Hinge through the middle','↔']}],
 cameraControl:['Is there a Camera Control button low on the right-hand side?','This is the extra camera control below the normal side button.',{
  Y:['Yes','Extra Camera Control is present','◉'],N:['No','No extra Camera Control there','—']}],
 back:['Is the back glass or metal?','Glass is a smooth rear panel; older metal backs are aluminium with antenna lines.',{
  g:['Glass back','Glass rear panel','◫'],m:['Metal / aluminium back','Older aluminium rear casing','▯']}],
 size:['Which size best matches the phone?','Use size only as a final separator. If unsure, verify the A-number instead.',{
  v:['Very small old-style iPhone','Old 4-inch size','▯'],c:['Mini size','Noticeably smaller than normal','▯'],
  s:['Standard size','Normal iPhone size','▯'],l:['Large size','Plus / Pro Max sized','▯'],d:['Foldable size','Folds open larger','↔']}]
};

var id12={screen:'start',answers:{},order:[],lookup:'',aCandidates:[]};
function id12Reset(){id12={screen:'start',answers:{},order:[],lookup:'',aCandidates:[]}}
const _helpReset12=helpReset;helpReset=function(){_helpReset12();id12Reset()};

function id12Progress(){
 const n=Math.min(5,Math.max(1,id12.order.length+1));
 return '<div class="id11-progress">'+[1,2,3,4,5].map((_,i)=>'<span class="'+(i<n?'on':'')+'"></span>').join('')+'</div>';
}
function id12Candidates(){
 let a=Object.keys(ID12_MODELS).filter(k=>CATALOGUE[k]);
 for(const [c,v] of Object.entries(id12.answers))a=a.filter(k=>String(ID12_MODELS[k][c])===String(v));
 return a;
}
function id12Distinct(a,c){return [...new Set(a.map(k=>String(ID12_MODELS[k][c])).filter(Boolean))]}
function id12Next(a){for(const c of ID12_PRIORITY)if(id12.answers[c]===undefined&&id12Distinct(a,c).length>1)return c;return null}
function id12Names(a){return a.map(k=>CATALOGUE[k]?.name||k)}
function id12Card(c,v){
 const d=ID12_TEXT[c][2][v];if(!d)return '';
 return '<button class="id11-option" data-id12-criterion="'+c+'" data-id12-value="'+safe(v)+'"><span class="id11-symbol '+(d[2].length>3?'text':'')+'" style="white-space:pre-line">'+safe(d[2])+'</span><strong>'+safe(d[0])+'</strong><small>'+safe(d[1])+'</small></button>';
}
function id12Use(k){
 if(!CATALOGUE[k])return;selected().model=k;selected().custom='';helpKnown='yes';helpStep=2;mode='help';render();window.scrollTo({top:0,behavior:'instant'});
}
function id12Apply(c,v){id12.answers[c]=v;id12.order.push(c);id12.screen='visual';render();window.scrollTo({top:0,behavior:'instant'})}
function id12Back(){
 if(id12.screen==='a-number'){id12.screen='visual';render();return}
 if(id12.screen==='settings'||id12.screen==='manual'){id12.screen='start';render();return}
 if(id12.screen==='visual'&&id12.order.length){delete id12.answers[id12.order.pop()];render();return}
 id12.screen='start';render();
}
function id12AResult(){
 const n=(id12.lookup||'').toUpperCase().replace(/\s+/g,'');if(!n)return '';
 if(!/^A\d{4}$/.test(n))return '<div class="id11-note">Enter the model number in the form <strong>A1234</strong>.</div>';
 const k=(typeof ID10_A!=='undefined')?ID10_A[n]:null;
 if(!k||!CATALOGUE[k])return '<div class="id11-note"><strong>Not matched yet.</strong> Do not use a guessed model for pricing or parts. Verify the handset manually.</div>';
 return '<div class="id11-result"><strong>'+safe(CATALOGUE[k].name)+'</strong><p class="muted">Confirmed from '+safe(n)+'.</p><button class="btn" data-id12-model="'+k+'">Use '+safe(CATALOGUE[k].name)+' →</button></div>';
}
function id12AView(){
 const a=id12.aCandidates||[],r=a.length?'<div class="id11-note"><strong>Possible models still remaining:</strong><br>'+id12Names(a).map(safe).join(' · ')+'</div>':'';
 return id12Progress()+'<div class="eyebrow">VERIFY EXACT MODEL</div><h2 class="id11-q">Check the A-number</h2><p class="id11-sub">These iPhones are too similar to identify safely from appearance. The app will not guess.</p>'+r+
 '<div class="id11-note"><strong>Where to look:</strong><br><br><strong>iPhone 8 or later with a SIM tray:</strong> remove the tray and look inside the slot, on the upper side nearest the display.<br><br><strong>No SIM tray:</strong> look inside the charging connector.<br><br><strong>iPhone 7 or earlier:</strong> look on the back.</div>'+ 
 '<label class="field-label" for="id12A">Model number</label><input id="id12A" class="field id11-a" maxlength="5" placeholder="A2633" value="'+safe(id12.lookup)+'"><button class="btn" style="margin-top:9px" data-id12-action="check-a">Check model</button>'+id12AResult()+
 '<button class="btn ghost" data-id12-action="back">← Back</button><div class="id11-source">Model-number method and hardware details: Apple Support</div>';
}
function id12Result(k){
 return id12Progress()+'<div class="eyebrow">MODEL IDENTIFIED</div><h2 class="id11-q">'+safe(CATALOGUE[k].name)+'</h2><p class="id11-sub">The physical answers narrow to one model in the current iPhone catalogue.</p>'+ 
 '<div class="id11-result"><strong>'+safe(CATALOGUE[k].name)+'</strong><p class="muted">Before pricing or ordering a part, confirm this looks right.</p><button class="btn" data-id12-model="'+k+'">Yes — use this model →</button></div>'+ 
 '<button class="btn secondary" data-id12-action="a-number">I am not completely sure — verify the A-number</button><button class="btn ghost" data-id12-action="back">← Back one answer</button>';
}
function id12Ambiguous(a){
 id12.aCandidates=a.slice();
 return id12Progress()+'<div class="eyebrow">EXACT CHECK REQUIRED</div><h2 class="id11-q">These models are too similar to guess</h2><p class="id11-sub">The answers have narrowed the phone down, but not far enough to order or price a model-specific part safely.</p>'+ 
 '<div class="id11-note"><strong>Remaining possibilities:</strong><br>'+id12Names(a).map(safe).join(' · ')+'</div><button class="btn" data-id12-action="a-number">Verify with the A-number →</button><button class="btn ghost" data-id12-action="back">← Back one answer</button>';
}
function id12Question(a,c){
 const d=ID12_TEXT[c],vals=id12Distinct(a,c),cols=vals.length>=3?'three':'two';
 return id12Progress()+'<div class="eyebrow">IDENTIFY YOUR IPHONE</div><h2 class="id11-q">'+safe(d[0])+'</h2><p class="id11-sub">'+safe(d[1])+'</p><div class="id11-grid '+cols+'">'+vals.map(v=>id12Card(c,v)).join('')+'</div>'+ 
 '<button class="btn secondary" data-id12-action="a-number">I’m not sure — verify the A-number</button>'+(id12.order.length?'<button class="btn ghost" data-id12-action="back">← Back</button>':'');
}
function id12Visual(){
 const a=id12Candidates();if(!a.length)return id12Progress()+'<div class="eyebrow">CHECK NEEDED</div><h2 class="id11-q">Those answers do not match a known iPhone combination</h2><p class="id11-sub">Rather than force a model, verify the A-number.</p><button class="btn" data-id12-action="a-number">Check the A-number →</button><button class="btn ghost" data-id12-action="back">← Back</button>';
 if(a.length===1)return id12Result(a[0]);const c=id12Next(a);return c?id12Question(a,c):id12Ambiguous(a);
}
function id12Wizard(){
 if(id12.screen==='a-number')return id12AView();if(id12.screen==='visual')return id12Visual();
 if(id12.screen==='settings')return id12Progress()+'<div class="eyebrow">FASTEST EXACT CHECK</div><h2 class="id11-q">Settings → General → About</h2><p class="id11-sub">Look for <strong>Model Name</strong>. This is preferable to visual identification whenever the phone can open Settings.</p><label class="field-label" for="helpModel">Model Name</label><select class="field" id="helpModel">'+helpModelOptions()+'</select><button class="btn" style="margin-top:10px" data-id12-action="use-selected" '+(!IPHONE_KEYS.includes(selected().model)?'disabled':'')+'>Use this iPhone →</button><button class="btn secondary" data-id12-action="visual">I still need visual help</button><button class="btn ghost" data-id12-action="back">← Back</button>';
 if(id12.screen==='manual')return id12Progress()+'<div class="eyebrow">CHOOSE MODEL</div><h2 class="id11-q">Which iPhone is it?</h2><p class="id11-sub">Use this only when you are confident of the exact model.</p><label class="field-label" for="helpModel">iPhone model</label><select class="field" id="helpModel">'+helpModelOptions()+'</select><button class="btn" style="margin-top:10px" data-id12-action="use-selected" '+(!IPHONE_KEYS.includes(selected().model)?'disabled':'')+'>Use this iPhone →</button><button class="btn secondary" data-id12-action="visual">I’m not certain — identify it instead</button><button class="btn ghost" data-id12-action="back">← Back</button>';
 return id12Progress()+'<div class="eyebrow">IDENTIFY YOUR IPHONE</div><h2 class="id11-q">Can you open Settings on the phone?</h2><p class="id11-sub">If it works, Model Name in Settings is safest. If it does not, we’ll identify it from physical features.</p><div class="id11-grid two"><button class="id11-option" data-id12-action="settings"><span class="id11-symbol">⚙️</span><strong>Yes</strong><small>I can open Settings</small></button><button class="id11-option" data-id12-action="visual"><span class="id11-symbol">⌁</span><strong>No</strong><small>Identify it by appearance</small></button></div><button class="btn secondary" data-id12-action="manual">I already know the exact model</button>';
}

helpDeviceScreen=function(){
 if(!helpBrand)return '<section class="glass panel id11-brand-only">'+helpProgress()+'<div class="eyebrow">STEP 1 · YOUR DEVICE</div><h2>What type of phone is it?</h2><div class="phone-type-grid"><button class="phone-type-card" data-help-brand="Apple iPhone"><span class="phone-type-icon">📱</span><strong>Apple iPhone</strong><small>Exact guided identification</small></button><button class="phone-type-card" data-help-brand="Other phone"><span class="phone-type-icon">📲</span><strong>Other phone</strong><small>We’ll build this route later</small></button></div><button class="btn ghost help-back" data-action="help-home">← Back</button></section>';
 if(helpBrand==='Other phone')return '<section class="glass panel">'+helpProgress()+'<div class="eyebrow">OTHER PHONE</div><div class="tip"><strong>This route is parked for now.</strong> Enter the model manually if you know it.</div><label class="field-label" for="helpCustomModel">Phone model</label><input class="field" id="helpCustomModel" maxlength="90" value="'+(selected().model==='otherphone'?safe(selected().custom):'')+'" placeholder="e.g. Samsung Galaxy S23 Ultra"><button class="btn" style="margin-top:12px" data-action="help-other-next">Continue →</button><button class="btn ghost" data-id12-action="brand-back">← Change phone type</button></section>';
 return '<section class="glass panel">'+helpProgress()+'<div class="id11-wrap">'+id12Wizard()+'</div><button class="btn ghost" data-id12-action="brand-back">← Change phone type</button></section>';
};

document.addEventListener('click',function(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.id12Criterion){id12Apply(b.dataset.id12Criterion,b.dataset.id12Value||'');return}
 if(b.dataset.id12Model){id12Use(b.dataset.id12Model);return}
 const a=b.dataset.id12Action;if(!a)return;
 if(a==='settings'){id12.screen='settings';render();return}
 if(a==='manual'){id12.screen='manual';render();return}
 if(a==='visual'){id12.screen='visual';id12.answers={};id12.order=[];id12.aCandidates=[];render();return}
 if(a==='back'){id12Back();return}
 if(a==='a-number'){id12.aCandidates=id12Candidates();id12.screen='a-number';render();return}
 if(a==='check-a'){id12.lookup=(document.getElementById('id12A')?.value||'').trim().toUpperCase();render();return}
 if(a==='use-selected'){if(IPHONE_KEYS.includes(selected().model))id12Use(selected().model);return}
 if(a==='brand-back'){helpBrand='';helpKnown='';helpUsable='';id12Reset();render();return}
},false);
document.addEventListener('input',e=>{if(e.target?.id==='id12A')id12.lookup=e.target.value},false);

(function(){
 const supported=(typeof IPHONE_KEYS!=='undefined'?IPHONE_KEYS:[]).filter(k=>CATALOGUE[k]);
 const missing=supported.filter(k=>!ID12_MODELS[k]);
 if(missing.length)console.error('Build 12 identifier missing model metadata:',missing);
})();