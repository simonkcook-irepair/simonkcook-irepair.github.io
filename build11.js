
/* Build 11 · revised compact Apple iPhone identifier */
var id11={screen:'start',history:[],lookup:''};

const ID11_IMG={
  home:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-se-3rd-gen-colors.png',
  notch:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16e/iphone-16e-colors.png',
  island:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-colors.png',
  x:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-x-colors.jpg',
  xr:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-xr/identify-iphone-xr-colors.jpg',
  sevenPlus:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-7-plus/iphone7plus-colors.jpg',
  eightPlus:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-8-plus/iphone8plus-colors.jpg',
  eleven:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11-colors.jpg',
  twelve:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/2021-iphone12-colors.png',
  thirteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-colors.png',
  fourteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-colors-spring-2023.png',
  fifteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15.png',
  sixteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-colors.png',
  seventeen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-colors.png',
  air:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-air-colors.png',
  elevenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11pro.jpg',
  thirteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-pro-colors.png',
  fourteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-pro-colors.png',
  fifteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15-pro.png',
  sixteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-pro-max-colors.png',
  eighteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-18-pro-colors.png'
};

if(typeof ID10_A!=='undefined'){
  Object.assign(ID10_A,{
    A1549:'iphone6',A1586:'iphone6',A1589:'iphone6',
    A1522:'iphone6plus',A1524:'iphone6plus',A1593:'iphone6plus',
    A1633:'iphone6s',A1688:'iphone6s',A1700:'iphone6s',
    A1634:'iphone6splus',A1687:'iphone6splus',A1699:'iphone6splus',
    A1662:'iphonese1',A1723:'iphonese1',A1724:'iphonese1'
  });
}

function id11Reset(){id11={screen:'start',history:[],lookup:''}}
const _helpReset11=helpReset;
helpReset=function(){_helpReset11();id11Reset()};

function id11Progress(n){
  return '<div class="id11-progress">'+[1,2,3,4,5].map((_,i)=>'<span class="'+(i<n?'on':'')+'"></span>').join('')+'</div>';
}
function id11Photo(src,side){
  return '<span class="id11-photo '+(side||'rear')+'" style="background-image:url(\''+src+'\')"></span>';
}
function id11Choice(title,sub,src,side,next,value){
  return '<button type="button" class="id11-option" data-id11-next="'+next+'"'+(value?' data-id11-value="'+value+'"':'')+'>'+id11Photo(src,side)+'<strong>'+safe(title)+'</strong>'+(sub?'<small>'+safe(sub)+'</small>':'')+'</button>';
}
function id11Symbol(title,sub,symbol,next,value,cls){
  return '<button type="button" class="id11-option" data-id11-next="'+next+'"'+(value?' data-id11-value="'+value+'"':'')+'><span class="id11-symbol '+(cls||'')+'">'+symbol+'</span><strong>'+safe(title)+'</strong>'+(sub?'<small>'+safe(sub)+'</small>':'')+'</button>';
}
function id11Go(screen,value){
  id11.history.push(id11.screen);
  id11.screen=screen;
  if(value)id11.value=value;
  render();
  window.scrollTo({top:0,behavior:'instant'});
}
function id11Back(){
  id11.screen=id11.history.pop()||'start';
  render();
  window.scrollTo({top:0,behavior:'instant'});
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
function id11AResult(){
  const clean=(id11.lookup||'').toUpperCase().replace(/\s+/g,'');
  if(!clean)return '';
  if(!/^A\d{4}$/.test(clean))return '<div class="id11-note">Enter the model number in the form <strong>A1234</strong>.</div>';
  const key=(typeof ID10_A!=='undefined')?ID10_A[clean]:null;
  if(!key||!CATALOGUE[key])return '<div class="id11-note">That A-number is not in this prototype lookup yet. We can leave the device unconfirmed and verify it before pricing.</div>';
  return '<div class="id11-result"><strong>'+safe(CATALOGUE[key].name)+'</strong><p class="muted">Matched from '+safe(clean)+'.</p><button class="btn" data-id11-model="'+key+'">Use '+safe(CATALOGUE[key].name)+' →</button></div>';
}
function id11AView(){
  return id11Progress(5)+'<div class="eyebrow">CONFIRM MODEL</div><h2 class="id11-q">Check the A-number</h2><p class="id11-sub">We use this only when two iPhones are too similar to identify safely by appearance.</p>'+
  '<div class="id11-note"><strong>iPhone 8 or later with a SIM tray:</strong> remove the tray and look inside the slot, on the upper side nearest the display.<br><br><strong>No SIM tray:</strong> look inside the charging connector.<br><br><strong>iPhone 7 or earlier:</strong> look on the back of the phone.</div>'+
  '<label class="field-label" for="id11A">Model number</label><input id="id11A" class="field id11-a" maxlength="5" placeholder="A2633" value="'+safe(id11.lookup)+'">'+
  '<button class="btn" style="margin-top:9px" data-id11-action="check-a">Check model</button>'+id11AResult()+
  '<button class="btn ghost" data-id11-action="back">← Back</button><div class="id11-source">Model-number method: Apple Support</div>';
}

function id11Wizard(){
  const s=id11.screen;
  if(s==='a-number')return id11AView();

  if(s==='start')return id11Progress(1)+'<div class="eyebrow">IDENTIFY YOUR IPHONE</div><h2 class="id11-q">Can you open Settings?</h2><p class="id11-sub">If the phone works, this is the quickest and most accurate route.</p><div class="id11-grid two">'+
    id11Symbol('Yes','I can open Settings','⚙️','settings')+
    id11Symbol('No','Use the visual identifier','✕','front')+
    '</div><button class="btn secondary id11-manual" data-id11-next="manual">I already know the model</button>';

  if(s==='settings')return id11Progress(2)+'<div class="eyebrow">CHECK SETTINGS</div><h2 class="id11-q">Settings → General → About</h2><p class="id11-sub">Look for <strong>Model Name</strong>, then choose exactly what it says.</p><label class="field-label" for="helpModel">Model Name</label><select class="field" id="helpModel">'+helpModelOptions()+'</select><button class="btn" style="margin-top:10px" data-id11-action="use-selected" '+(!IPHONE_KEYS.includes(selected().model)?'disabled':'')+'>Use this iPhone →</button><button class="btn secondary" data-id11-next="front">I still need visual help</button><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='manual')return id11Progress(2)+'<div class="eyebrow">CHOOSE MODEL</div><h2 class="id11-q">Which iPhone is it?</h2><label class="field-label" for="helpModel">iPhone model</label><select class="field" id="helpModel">'+helpModelOptions()+'</select><button class="btn" style="margin-top:10px" data-id11-action="use-selected" '+(!IPHONE_KEYS.includes(selected().model)?'disabled':'')+'>Use this iPhone →</button><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='front')return id11Progress(2)+'<div class="eyebrow">LOOK AT THE FRONT</div><h2 class="id11-q">What does the top/front look like?</h2><p class="id11-sub">Only the front matters on this screen.</p><div class="id11-grid three">'+
    id11Choice('Home button','Round button below screen',ID11_IMG.home,'front','home-cams')+
    id11Choice('Notch','Wide cut-out at the top',ID11_IMG.notch,'front','notch-cams')+
    id11Choice('Dynamic Island','Small pill-shaped cut-out',ID11_IMG.island,'front','island-cams')+
    '</div><button class="btn secondary" data-id11-action="a-number">None of these / not sure</button><button class="btn ghost" data-id11-action="back">← Back</button><div class="id11-source">Official Apple reference images</div>';

  if(s==='home-cams')return id11Progress(3)+'<div class="eyebrow">LOOK AT THE BACK</div><h2 class="id11-q">How many rear cameras?</h2><div class="id11-grid two">'+
    id11Choice('1 camera','Single rear lens',ID11_IMG.home,'rear','home-one')+
    id11Choice('2 cameras','Two cameras side by side',ID11_IMG.eightPlus,'rear','home-two')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='home-one')return id11Progress(4)+'<div class="eyebrow">ONE CAMERA</div><h2 class="id11-q">Is the back glass or metal?</h2><div class="id11-grid two">'+
    id11Symbol('Glass back','iPhone 8 / SE style','◫','a-number')+
    id11Symbol('Metal back','iPhone 6 / 6s / 7 style','▯','a-number')+
    '</div><div class="id11-note">These models can be extremely similar, so the next step uses the A-number rather than guessing.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='home-two')return id11Progress(4)+'<div class="eyebrow">TWO CAMERAS</div><h2 class="id11-q">Which back looks closer?</h2><div class="id11-grid two">'+
    id11Choice('Glass back','iPhone 8 Plus',ID11_IMG.eightPlus,'rear','model','iphone8plus')+
    id11Choice('Metal back','iPhone 7 Plus',ID11_IMG.sevenPlus,'rear','model','iphone7plus')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='notch-cams')return id11Progress(3)+'<div class="eyebrow">LOOK AT THE BACK</div><h2 class="id11-q">How many rear cameras?</h2><div class="id11-grid three">'+
    id11Choice('1 camera','Single lens',ID11_IMG.notch,'rear','notch-one')+
    id11Choice('2 cameras','Dual camera',ID11_IMG.thirteen,'rear','notch-two')+
    id11Choice('3 cameras','Pro camera system',ID11_IMG.thirteenPro,'rear','notch-three')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='notch-one')return id11Progress(4)+'<div class="eyebrow">ONE CAMERA + NOTCH</div><h2 class="id11-q">Which charging connector?</h2><div class="id11-grid two">'+
    id11Symbol('Lightning','Older Apple connector','⚡','model','iphonexr')+
    id11Symbol('USB-C','Newer oval connector','USB-C','a-number',null,'text')+
    '</div><div class="id11-note">Lightning identifies iPhone XR. USB-C narrows it to the newer e-series, which we confirm by A-number.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='notch-two')return id11Progress(4)+'<div class="eyebrow">TWO CAMERAS + NOTCH</div><h2 class="id11-q">How are the cameras arranged?</h2><div class="id11-grid three">'+
    id11Choice('Narrow vertical strip','iPhone X / XS style',ID11_IMG.x,'rear','a-number')+
    id11Choice('Straight in square','iPhone 11 / 12 style',ID11_IMG.twelve,'rear','straight-family')+
    id11Choice('Diagonal','iPhone 13 / 14 style',ID11_IMG.thirteen,'rear','diagonal-family')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='straight-family')return id11Progress(5)+'<div class="eyebrow">STRAIGHT CAMERAS</div><h2 class="id11-q">Are the outer sides rounded or flat?</h2><div class="id11-grid two">'+
    id11Choice('Rounded sides','iPhone 11',ID11_IMG.eleven,'rear','model','iphone11')+
    id11Choice('Flat sides','iPhone 12 family',ID11_IMG.twelve,'rear','size12')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size12')return id11Progress(5)+'<div class="eyebrow">IPHONE 12 FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid two">'+
    id11Symbol('Very small','iPhone 12 mini','▯','model','iphone12mini','phone-sm')+
    id11Symbol('Standard','iPhone 12','▯','model','iphone12','phone-lg')+
    '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='diagonal-family')return id11Progress(5)+'<div class="eyebrow">DIAGONAL CAMERAS</div><h2 class="id11-q">Which size?</h2><div class="id11-grid three">'+
    id11Symbol('Very small','iPhone 13 mini','▯','model','iphone13mini','phone-sm')+
    id11Symbol('Standard','iPhone 13 or 14','▯','a-number',null,'')+
    id11Symbol('Large','iPhone 14 Plus','▯','model','iphone14plus','phone-lg')+
    '</div><div class="id11-note">Standard-size iPhone 13 and iPhone 14 are too similar to price safely from appearance alone.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='notch-three')return id11Progress(4)+'<div class="eyebrow">THREE CAMERAS + NOTCH</div><h2 class="id11-q">Are the outer sides rounded or flat?</h2><div class="id11-grid two">'+
    id11Choice('Rounded sides','iPhone 11 Pro family',ID11_IMG.elevenPro,'rear','size11pro')+
    id11Choice('Flat sides','iPhone 12 / 13 Pro family',ID11_IMG.thirteenPro,'rear','a-number')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size11pro')return id11Progress(5)+'<div class="eyebrow">IPHONE 11 PRO FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid two">'+
    id11Symbol('Smaller','iPhone 11 Pro','▯','model','iphone11pro','phone-sm')+
    id11Symbol('Larger','iPhone 11 Pro Max','▯','model','iphone11pm','phone-lg')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='island-cams')return id11Progress(3)+'<div class="eyebrow">LOOK AT THE BACK</div><h2 class="id11-q">How many rear cameras?</h2><div class="id11-grid three">'+
    id11Choice('1 camera','Air-style single camera',ID11_IMG.air,'rear','model','iphoneair')+
    id11Choice('2 cameras','Standard iPhone',ID11_IMG.seventeen,'rear','island-two')+
    id11Choice('3 cameras','Pro iPhone',ID11_IMG.sixteenPro,'rear','island-three')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='island-two')return id11Progress(4)+'<div class="eyebrow">TWO CAMERAS + DYNAMIC ISLAND</div><h2 class="id11-q">How are the cameras arranged?</h2><div class="id11-grid two">'+
    id11Choice('Diagonal','iPhone 15 family',ID11_IMG.fifteen,'rear','size15')+
    id11Choice('Vertical','iPhone 16 / 17 style',ID11_IMG.seventeen,'rear','size16-17')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size15')return id11Progress(5)+'<div class="eyebrow">IPHONE 15 FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid two">'+
    id11Symbol('Standard','iPhone 15','▯','model','iphone15','phone-sm')+
    id11Symbol('Large','iPhone 15 Plus','▯','model','iphone15plus','phone-lg')+
    '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size16-17')return id11Progress(5)+'<div class="eyebrow">VERTICAL CAMERAS</div><h2 class="id11-q">Is it clearly the large Plus size?</h2><div class="id11-grid two">'+
    id11Symbol('Yes — large','iPhone 16 Plus','▯','model','iphone16plus','phone-lg')+
    id11Symbol('No / not sure','iPhone 16 or 17','▯','a-number',null,'phone-sm')+
    '</div><div class="id11-note">The standard iPhone 16 and iPhone 17 are close enough that we confirm the A-number instead of guessing.</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='island-three')return id11Progress(4)+'<div class="eyebrow">THREE CAMERAS + DYNAMIC ISLAND</div><h2 class="id11-q">Which charging connector?</h2><div class="id11-grid two">'+
    id11Symbol('Lightning','iPhone 14 Pro family','⚡','size14pro')+
    id11Symbol('USB-C','iPhone 15 Pro or newer','USB-C','usb-pro',null,'text')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size14pro')return id11Progress(5)+'<div class="eyebrow">IPHONE 14 PRO FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid two">'+
    id11Symbol('Smaller','iPhone 14 Pro','▯','model','iphone14pro','phone-sm')+
    id11Symbol('Larger','iPhone 14 Pro Max','▯','model','iphone14pm','phone-lg')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='usb-pro')return id11Progress(5)+'<div class="eyebrow">USB-C PRO IPHONE</div><h2 class="id11-q">What does the camera area look like?</h2><div class="id11-grid two">'+
    id11Choice('Square camera bump','iPhone 15 / 16 Pro style',ID11_IMG.sixteenPro,'rear','camera-control')+
    id11Choice('Wide plateau','iPhone 17 / 18 Pro style',ID11_IMG.eighteenPro,'wide','a-number')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='camera-control')return id11Progress(5)+'<div class="eyebrow">SQUARE USB-C PRO</div><h2 class="id11-q">Is there a Camera Control button low on the right side?</h2><div class="id11-grid two">'+
    id11Symbol('No','iPhone 15 Pro family','—','size15pro')+
    id11Symbol('Yes','iPhone 16 Pro family','◉','size16pro')+
    '</div><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size15pro')return id11Progress(5)+'<div class="eyebrow">IPHONE 15 PRO FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid two">'+
    id11Symbol('Smaller','iPhone 15 Pro','▯','model','iphone15pro','phone-sm')+
    id11Symbol('Larger','iPhone 15 Pro Max','▯','model','iphone15pm','phone-lg')+
    '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

  if(s==='size16pro')return id11Progress(5)+'<div class="eyebrow">IPHONE 16 PRO FAMILY</div><h2 class="id11-q">Which size?</h2><div class="id11-grid two">'+
    id11Symbol('Smaller','iPhone 16 Pro','▯','model','iphone16pro','phone-sm')+
    id11Symbol('Larger','iPhone 16 Pro Max','▯','model','iphone16pm','phone-lg')+
    '</div><button class="btn secondary" data-id11-action="a-number">Not sure</button><button class="btn ghost" data-id11-action="back">← Back</button>';

  return '<div class="id11-note">Identification route reset.</div><button class="btn" data-id11-action="reset">Start again</button>';
}

helpDeviceScreen=function(){
  if(!helpBrand){
    return '<section class="glass panel id11-brand-only">'+helpProgress()+'<div class="eyebrow">STEP 1 · YOUR DEVICE</div><h2>What type of phone is it?</h2><div class="phone-type-grid"><button class="phone-type-card" data-help-brand="Apple iPhone"><span class="phone-type-icon">📱</span><strong>Apple iPhone</strong><small>Guided iPhone identification</small></button><button class="phone-type-card" data-help-brand="Other phone"><span class="phone-type-icon">📲</span><strong>Other phone</strong><small>We’ll build this route later</small></button></div><button class="btn ghost help-back" data-action="help-home">← Back</button></section>';
  }
  if(helpBrand==='Other phone'){
    return '<section class="glass panel">'+helpProgress()+'<div class="eyebrow">OTHER PHONE</div><div class="tip"><strong>This route is parked for now.</strong> Enter the model manually if you know it.</div><label class="field-label" for="helpCustomModel">Phone model</label><input class="field" id="helpCustomModel" maxlength="90" value="'+(selected().model==='otherphone'?safe(selected().custom):'')+'" placeholder="e.g. Samsung Galaxy S23 Ultra"><button class="btn" style="margin-top:12px" data-action="help-other-next">Continue →</button><button class="btn ghost" data-id11-action="brand-back">← Change phone type</button></section>';
  }
  return '<section class="glass panel">'+helpProgress()+'<div class="id11-wrap">'+id11Wizard()+'</div><button class="btn ghost" data-id11-action="brand-back">← Change phone type</button></section>';
};

document.addEventListener('click',function(e){
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.id11Next){
    const next=b.dataset.id11Next,val=b.dataset.id11Value||'';
    if(next==='model'){id11Use(val);return}
    if(next==='a-number'){id11Go('a-number');return}
    id11Go(next,val);return;
  }
  if(b.dataset.id11Model){id11Use(b.dataset.id11Model);return}
  if(b.dataset.id11Action==='brand-back'){helpBrand='';helpKnown='';helpUsable='';id11Reset();render();return}
  if(b.dataset.id11Action==='back'){id11Back();return}
  if(b.dataset.id11Action==='reset'){id11Reset();render();return}
  if(b.dataset.id11Action==='a-number'){id11Go('a-number');return}
  if(b.dataset.id11Action==='check-a'){const el=document.getElementById('id11A');id11.lookup=(el?.value||'').trim().toUpperCase();render();return}
  if(b.dataset.id11Action==='use-selected'){if(IPHONE_KEYS.includes(selected().model)){helpKnown='yes';helpStep=2;mode='help';render();window.scrollTo({top:0,behavior:'instant'})}return}
},false);

document.addEventListener('input',function(e){
  if(e.target?.id==='id11A')id11.lookup=e.target.value;
},false);
