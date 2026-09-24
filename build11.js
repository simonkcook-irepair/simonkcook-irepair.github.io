
/* Build 11 · compact, careful Apple iPhone identifier */
var id11={screen:'front',history:[],lookup:'',message:''};

const ID11_IMG={
  frontHome:'https://ipcdn-web.apple.com/assets/v2/web/fd102098-a0ac-47fc-86c4-459dee1c38a4',
  frontNotch:'https://ipcdn-web.apple.com/assets/v2/web/99209a8d-43fb-4e39-ab88-b9791ac6adc4',
  frontIsland:'https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/en_US/b0767c451cbc6537bf21e31c4c2b24c1.png',
  oneCam:'https://ipcdn-web.apple.com/assets/v2/web/3a6eb13e-ebed-4c60-8940-c93268cd3573',
  twoStraight11:'https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/en_US/80d92c7e8820f9ec8cf367d47022300d.png',
  twoStraight12:'https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/en_US/a78062a01a3a8cb0a5d7e57e5ce46dfb.png',
  twoDiagonal:'https://help.apple.com/assets/69F8EBBDF3B89A4F6E0C704C/69F8EBC43862495245036393/en_US/293e232de3c8bfb95d93e402a8a63b7c.png',
  threeSquare:'https://ipcdn-web.apple.com/assets/v2/web/c284f865-8e17-412f-9844-39cd30cf6a69',
  twoVerticalNew:'https://ipcdn-web.apple.com/assets/v2/web/e0390897-c746-4591-a3b1-a0817ceac903',
  threePlateau:'https://ipcdn-web.apple.com/assets/v2/web/fc54dbd5-1456-456f-a872-6e053227099a',
  xStyle:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-x-colors.jpg',
  eightPlus:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-8-plus/iphone-8plus-colors.jpg',
  sevenPlus:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-7-plus/iphone7plus-colors.jpg'
};

function id11Reset(){id11={screen:'front',history:[],lookup:'',message:''}}
const _helpReset11=helpReset;
helpReset=function(){_helpReset11();id11Reset()};

function id11Img(src,alt){
  return '<span class="pic"><img src="'+src+'" alt="'+safe(alt)+'" loading="lazy" referrerpolicy="no-referrer"></span>';
}
function id11Opt(title,sub,img,next,value){
  return '<button type="button" class="id11-option" data-id11-next="'+next+'"'+(value?' data-id11-value="'+value+'"':'')+'>'+id11Img(img,title)+'<strong>'+safe(title)+'</strong>'+(sub?'<small>'+safe(sub)+'</small>':'')+'</button>';
}
function id11SymbolOpt(title,sub,symbol,next,value,extraClass){
  return '<button type="button" class="id11-option" data-id11-next="'+next+'"'+(value?' data-id11-value="'+value+'"':'')+'><span class="id11-symbol '+(extraClass||'')+'">'+symbol+'</span><strong>'+safe(title)+'</strong>'+(sub?'<small>'+safe(sub)+'</small>':'')+'</button>';
}
function id11Progress(n){
  return '<div class="id11-progress">'+[1,2,3,4,5].map((_,i)=>'<span class="'+(i<n?'on':'')+'"></span>').join('')+'</div>';
}
function id11Go(screen,value){
  id11.history.push(id11.screen);
  id11.screen=screen;
  if(value)id11.value=value;
  render();window.scrollTo({top:0,behavior:'instant'});
}
function id11Back(){
  id11.screen=id11.history.pop()||'front';
  render();window.scrollTo({top:0,behavior:'instant'});
}
function id11Use(key){
  if(!CATALOGUE[key])return;
  selected().model=key;
  selected().custom='';
  helpKnown='yes';
  helpStep=2;
  mode='help';
  render();
  window.scrollTo({top:0,behavior:'instant'});
}
function id11ANumber(msg){
  id11.message=msg||'Check the A-number so we can confirm the exact iPhone before showing repair pricing.';
  id11Go('a-number');
}
function id11AResult(){
  const clean=(id11.lookup||'').toUpperCase().replace(/\s+/g,'');
  const key=(typeof ID10_A!=='undefined')?ID10_A[clean]:null;
  if(!clean)return '';
  if(!/^A\d{4}$/.test(clean))return '<div class="id11-note">Enter the model number in the form <strong>A1234</strong>.</div>';
  if(!key||!CATALOGUE[key])return '<div class="id11-note">That A-number is not in the prototype lookup yet. Leave the model unconfirmed and we can verify it before quoting.</div>';
  return '<div class="id11-result"><strong>'+safe(CATALOGUE[key].name)+'</strong><p class="muted">Matched from '+safe(clean)+'.</p><button class="btn" data-id11-model="'+key+'">Use '+safe(CATALOGUE[key].name)+' →</button></div>';
}
function id11AView(){
 return id11Progress(5)+'<div class="eyebrow">CONFIRM MODEL</div><h2 class="id11-q">Check the A-number</h2><p class="id11-sub">Use this only when two iPhones are too similar to identify safely by appearance.</p>'+
 '<div class="id11-note"><strong>iPhone 8 or later with a SIM tray:</strong> remove the tray and look inside the slot, on the upper side nearest the display.<br><br><strong>No SIM tray:</strong> look inside the charging connector.<br><br><strong>iPhone 7 or earlier:</strong> the A-number is on the back.</div>'+
 '<label class="field-label" for="id11A">Model number</label><input id="id11A" class="field id11-a" maxlength="5" placeholder="A2633" value="'+safe(id11.lookup)+'">'+
 '<button class="btn" style="margin-top:9px" data-id11-action="check-a">Check model</button>'+id11AResult()+
 '<button class="btn ghost" data-id11-action="back">← Back</button><div class="id11-source">Apple model-identification method</div>';
}

function id11Wizard(){
 const s=id11.screen;
 if(s==='a-number')return id11AView();

 if(s==='front')return id11Progress(1)+'<div class="eyebrow">IDENTIFY YOUR IPHONE</div><h2 class="id11-q">What does the FRONT look like?</h2><p class="id11-sub">Tap the small image that matches your screen.</p><div class="id11-grid three">'+
  id11Opt('Home button','Round button below screen',ID11_IMG.frontHome,'home-cams','home')+
  id11Opt('Notch','Cut-out at top of screen',ID11_IMG.frontNotch,'notch-cams','notch')+
  id11Opt('Dynamic Island','Small pill-shaped cut-out',ID11_IMG.frontIsland,'island-cams','island')+
  '</div><div class="id11-actions"><button class="btn secondary" data-id11-action="a-number">Use A-number instead</button></div><div class="id11-source">Apple reference diagrams</div>';

 if(s==='home-cams')return id11Progress(2)+'<div class="eyebrow">HOME BUTTON</div><h2 class="id11-q">How many rear cameras?</h2><div class="id11-grid">'+
  id11SymbolOpt('1 camera','Most Home-button iPhones','●','home-one')+
  id11Opt('2 cameras','Two cameras side by side',ID11_IMG.eightPlus,'home-two')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='home-one')return id11Progress(3)+'<div class="eyebrow">ONE CAMERA</div><h2 class="id11-q">What is the back made from?</h2><div class="id11-grid">'+
  id11SymbolOpt('Glass back','iPhone 8 / newer SE style','◫','home-glass')+
  id11SymbolOpt('Metal back','iPhone 6 / 6s / 7 style','▯','a-number')+
  '</div><div class="id11-note">Several one-camera Home-button iPhones look almost identical. We’ll use the A-number rather than guess.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='home-glass')return id11Progress(4)+'<div class="eyebrow">GLASS BACK</div><h2 class="id11-q">This is most likely iPhone 8 or SE (2nd/3rd gen)</h2><p class="id11-sub">They are too similar externally for reliable repair pricing.</p><button class="btn" data-id11-action="a-number">Check A-number →</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='home-two')return id11Progress(3)+'<div class="eyebrow">TWO CAMERAS</div><h2 class="id11-q">Which back looks closer?</h2><div class="id11-grid">'+
  id11Opt('Glass back','iPhone 8 Plus',ID11_IMG.eightPlus,'model','iphone8plus')+
  id11Opt('Metal back','iPhone 7 Plus',ID11_IMG.sevenPlus,'model','iphone7plus')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='notch-cams')return id11Progress(2)+'<div class="eyebrow">NOTCH</div><h2 class="id11-q">How many rear cameras?</h2><div class="id11-grid three">'+
  id11Opt('1 camera','Single lens',ID11_IMG.oneCam,'notch-one')+
  id11Opt('2 cameras','Dual-camera iPhone',ID11_IMG.twoDiagonal,'notch-two')+
  id11Opt('3 cameras','Pro camera system',ID11_IMG.threeSquare,'notch-three')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='notch-one')return id11Progress(3)+'<div class="eyebrow">NOTCH · ONE CAMERA</div><h2 class="id11-q">Which charging connector?</h2><div class="id11-grid">'+
  id11SymbolOpt('Lightning','Older Apple connector','⚡','model','iphonexr')+
  id11SymbolOpt('USB-C','Newer oval connector','USB-C','a-number','16e-17e')+
  '</div><div class="id11-note">Lightning + notch + one rear camera identifies iPhone XR. USB-C narrows to newer e-series models, which we confirm by A-number.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='notch-two')return id11Progress(3)+'<div class="eyebrow">NOTCH · TWO CAMERAS</div><h2 class="id11-q">How are the cameras arranged?</h2><div class="id11-grid three">'+
  id11Opt('Narrow vertical strip','iPhone X / XS style',ID11_IMG.xStyle,'a-number','x-xs')+
  id11Opt('Straight in square','iPhone 11 / 12 style',ID11_IMG.twoStraight12,'straight-family')+
  id11Opt('Diagonal','iPhone 13 / 14 style',ID11_IMG.twoDiagonal,'diagonal-family')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='straight-family')return id11Progress(4)+'<div class="eyebrow">STRAIGHT CAMERAS</div><h2 class="id11-q">Are the phone sides rounded or flat?</h2><div class="id11-grid">'+
  id11Opt('Rounded sides','iPhone 11',ID11_IMG.twoStraight11,'model','iphone11')+
  id11Opt('Flat sides','iPhone 12 family',ID11_IMG.twoStraight12,'size12')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size12')return id11Progress(5)+'<div class="eyebrow">IPHONE 12 FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid">'+
  id11SymbolOpt('Very small','iPhone 12 mini','▯','model','iphone12mini','phone-sm')+
  id11SymbolOpt('Standard','iPhone 12','▯','model','iphone12','phone-lg')+
  '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='diagonal-family')return id11Progress(4)+'<div class="eyebrow">DIAGONAL CAMERAS</div><h2 class="id11-q">Which size?</h2><div class="id11-grid three">'+
  id11SymbolOpt('Very small','iPhone 13 mini','▯','model','iphone13mini','phone-sm')+
  id11SymbolOpt('Standard','iPhone 13 or 14','▯','a-number','13-14','')+
  id11SymbolOpt('Large','iPhone 14 Plus','▯','model','iphone14plus','phone-lg')+
  '</div><div class="id11-note">Standard-size iPhone 13 and iPhone 14 can be too similar to price safely from appearance alone.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='notch-three')return id11Progress(3)+'<div class="eyebrow">NOTCH · THREE CAMERAS</div><h2 class="id11-q">Are the sides rounded or flat?</h2><div class="id11-grid">'+
  id11SymbolOpt('Rounded sides','iPhone 11 Pro family','◯','size11pro')+
  id11SymbolOpt('Flat sides','iPhone 12 / 13 Pro family','□','pro-flat-a')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size11pro')return id11Progress(4)+'<div class="eyebrow">IPHONE 11 PRO FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid">'+
  id11SymbolOpt('Smaller','iPhone 11 Pro','▯','model','iphone11pro','phone-sm')+
  id11SymbolOpt('Larger','iPhone 11 Pro Max','▯','model','iphone11pm','phone-lg')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='pro-flat-a')return id11Progress(4)+'<div class="eyebrow">FLAT-SIDED PRO</div><h2 class="id11-q">iPhone 12 Pro and 13 Pro are very similar</h2><p class="id11-sub">We’ll confirm the generation from the A-number rather than rely on tiny camera or notch differences.</p><button class="btn" data-id11-action="a-number">Check A-number →</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='island-cams')return id11Progress(2)+'<div class="eyebrow">DYNAMIC ISLAND</div><h2 class="id11-q">How many rear cameras?</h2><div class="id11-grid three">'+
  id11Opt('1 camera','Air-style single camera',ID11_IMG.oneCam,'island-one')+
  id11Opt('2 cameras','Standard iPhone',ID11_IMG.twoVerticalNew,'island-two')+
  id11Opt('3 cameras','Pro iPhone',ID11_IMG.threeSquare,'island-three')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='island-one')return id11Progress(3)+'<div class="eyebrow">DYNAMIC ISLAND · ONE CAMERA</div><h2 class="id11-q">This points to the iPhone Air family</h2><p class="id11-sub">Use the A-number if the phone does not clearly match the Air-style body.</p><button class="btn" data-id11-model="iphoneair">Use iPhone Air →</button><button class="btn secondary" data-id11-action="a-number">Check A-number</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='island-two')return id11Progress(3)+'<div class="eyebrow">DYNAMIC ISLAND · TWO CAMERAS</div><h2 class="id11-q">How are the cameras arranged?</h2><div class="id11-grid">'+
  id11Opt('Diagonal','iPhone 15 family',ID11_IMG.twoDiagonal,'size15')+
  id11Opt('Vertical','iPhone 16 / 17 style',ID11_IMG.twoVerticalNew,'size16-17')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size15')return id11Progress(4)+'<div class="eyebrow">IPHONE 15 FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid">'+
  id11SymbolOpt('Standard','iPhone 15','▯','model','iphone15','phone-sm')+
  id11SymbolOpt('Large','iPhone 15 Plus','▯','model','iphone15plus','phone-lg')+
  '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size16-17')return id11Progress(4)+'<div class="eyebrow">VERTICAL CAMERAS</div><h2 class="id11-q">Which size?</h2><div class="id11-grid">'+
  id11SymbolOpt('Large','iPhone 16 Plus','▯','model','iphone16plus','phone-lg')+
  id11SymbolOpt('Standard','iPhone 16 or 17','▯','a-number','16-17','phone-sm')+
  '</div><div class="id11-note">The standard-size 16 and 17 are close enough that the app should confirm the A-number rather than guess.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='island-three')return id11Progress(3)+'<div class="eyebrow">DYNAMIC ISLAND · THREE CAMERAS</div><h2 class="id11-q">Which charging connector?</h2><div class="id11-grid">'+
  id11SymbolOpt('Lightning','iPhone 14 Pro family','⚡','size14pro')+
  id11SymbolOpt('USB-C','iPhone 15 Pro or newer','USB-C','usb-pro')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size14pro')return id11Progress(4)+'<div class="eyebrow">IPHONE 14 PRO FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid">'+
  id11SymbolOpt('Smaller','iPhone 14 Pro','▯','model','iphone14pro','phone-sm')+
  id11SymbolOpt('Larger','iPhone 14 Pro Max','▯','model','iphone14pm','phone-lg')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='usb-pro')return id11Progress(4)+'<div class="eyebrow">USB-C PRO</div><h2 class="id11-q">What does the camera area look like?</h2><div class="id11-grid">'+
  id11Opt('Square camera bump','15 Pro / 16 Pro style',ID11_IMG.threeSquare,'camera-control')+
  id11Opt('Wide camera plateau','17 Pro / newer Pro style',ID11_IMG.threePlateau,'a-number','17plus')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='camera-control')return id11Progress(5)+'<div class="eyebrow">SQUARE USB-C PRO</div><h2 class="id11-q">Is there a Camera Control button low on the right side?</h2><div class="id11-grid">'+
  id11SymbolOpt('No','iPhone 15 Pro family','—','size15pro')+
  id11SymbolOpt('Yes','iPhone 16 Pro family','◉','size16pro')+
  '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size15pro')return id11Progress(5)+'<div class="eyebrow">IPHONE 15 PRO FAMILY</div><div class="id11-grid">'+
  id11SymbolOpt('Smaller','iPhone 15 Pro','▯','model','iphone15pro','phone-sm')+
  id11SymbolOpt('Larger','iPhone 15 Pro Max','▯','model','iphone15pm','phone-lg')+
  '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 if(s==='size16pro')return id11Progress(5)+'<div class="eyebrow">IPHONE 16 PRO FAMILY</div><div class="id11-grid">'+
  id11SymbolOpt('Smaller','iPhone 16 Pro','▯','model','iphone16pro','phone-sm')+
  id11SymbolOpt('Larger','iPhone 16 Pro Max','▯','model','iphone16pm','phone-lg')+
  '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

 return '<div class="id11-note">Identification flow reset.</div><button class="btn" data-id11-action="reset">Start again</button>';
}

helpDeviceScreen=function(){
 const isApple=helpBrand==='Apple iPhone',isOther=helpBrand==='Other phone';
 const found=helpKnown==='yes',unsure=helpKnown==='no';
 return '<section class="glass panel">'+helpProgress()+
 '<div class="eyebrow">STEP 1 · YOUR DEVICE</div><h2>What type of phone is it?</h2>'+
 '<div class="phone-type-grid"><button class="phone-type-card" data-help-brand="Apple iPhone" aria-pressed="'+isApple+'"><span class="phone-type-icon">📱</span><strong>Apple iPhone</strong><small>Guided iPhone identification</small></button><button class="phone-type-card" data-help-brand="Other phone" aria-pressed="'+isOther+'"><span class="phone-type-icon">📲</span><strong>Other phone</strong><small>We’ll build this route later</small></button></div>'+
 (isOther?'<div class="tip"><strong>Other-phone identification is parked for now.</strong> Enter the model manually if you know it.</div><label class="field-label" for="helpCustomModel">Phone model</label><input class="field" id="helpCustomModel" maxlength="90" value="'+(selected().model==='otherphone'?safe(selected().custom):'')+'" placeholder="e.g. Samsung Galaxy S23 Ultra"><button class="btn" style="margin-top:12px" data-action="help-other-next">Continue →</button>':'')+
 (isApple?'<div class="divider"></div><h2>Do you know the exact iPhone model?</h2><div class="choice-grid"><button class="choice" data-help-known="yes" aria-pressed="'+found+'">✓ Yes, I know it</button><button class="choice" data-help-known="no" aria-pressed="'+unsure+'">? I’m not sure</button></div>'+
   (found?'<label class="field-label" for="helpModel">Choose exact iPhone</label><select class="field" id="helpModel">'+helpModelOptions()+'</select><button class="btn" style="margin-top:12px" data-action="help-device-next" '+(!IPHONE_KEYS.includes(selected().model)?'disabled':'')+'>That’s my iPhone →</button>':'')+
   (unsure?'<label class="field-label">Can the iPhone switch on and open Settings?</label><div class="pill-row">'+['Yes','No'].map(v=>'<button class="pill" data-help-usable="'+v+'" aria-pressed="'+(helpUsable===v)+'">'+v+'</button>').join('')+'</div>'+
      (helpUsable==='Yes'?'<div class="tip"><strong>Fastest:</strong> Settings → General → About → <strong>Model Name</strong>.</div><button class="btn" data-action="help-found-model">I found the model name →</button><button class="btn secondary" style="margin-top:8px" data-id11-action="visual">I still need visual help →</button>':'')+
      ((helpUsable==='No'||helpUsable==='Visual')?'<div class="id11-wrap">'+id11Wizard()+'</div>':''):''):'')+
 '<button class="btn ghost help-back" data-action="help-home">← Back</button></section>';
};

document.addEventListener('click',function(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.id11Next){
   const next=b.dataset.id11Next,val=b.dataset.id11Value||'';
   if(next==='model'){id11Use(val);return}
   if(next==='a-number'){id11ANumber();return}
   id11Go(next,val);return;
 }
 if(b.dataset.id11Model){id11Use(b.dataset.id11Model);return}
 if(b.dataset.id11Action==='visual'){helpUsable='Visual';id11Reset();render();return}
 if(b.dataset.id11Action==='back'){id11Back();return}
 if(b.dataset.id11Action==='reset'){id11Reset();render();return}
 if(b.dataset.id11Action==='a-number'){id11ANumber();return}
 if(b.dataset.id11Action==='check-a'){
   const el=document.getElementById('id11A');id11.lookup=(el?.value||'').trim().toUpperCase();render();return;
 }
},false);

document.addEventListener('input',function(e){
 if(e.target?.id==='id11A')id11.lookup=e.target.value;
},false);