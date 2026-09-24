
/* Build 10 · Progressive Apple iPhone identifier using official Apple imagery */
var id10={screen:'home',history:[],candidates:[],lookup:'',message:''};
const ID10_IMG={
 se:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-se-3rd-gen-colors.png',
 seven:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-7/iphone7-colors.jpg',
 sevenPlus:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-7-plus/iphone7plus-colors.jpg',
 eight:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-8/iphone-8-colors.jpg',
 eightPlus:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-8-plus/iphone-8plus-colors.jpg',
 x:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-x-colors.jpg',
 xr:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-xr/identify-iphone-xr-colors.jpg',
 eleven:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11-colors.jpg',
 elevenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/identify-iphone-11pro.jpg',
 twelve:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/2021-iphone12-colors.png',
 twelvePro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-12-pro/iphone12-pro-colors.jpg',
 thirteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-colors.png',
 thirteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/2022-spring-iphone13-pro-colors.png',
 fourteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-colors-spring-2023.png',
 fourteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-14-pro-colors.png',
 fifteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15.png',
 fifteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/fall-2023-iphone-colors-iphone-15-pro.png',
 sixteen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-colors.png',
 sixteenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16-pro-colors.png',
 sixteenE:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-16e/iphone-16e-colors.png',
 seventeen:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-colors.png',
 seventeenPro:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17-pro-colors.png',
 seventeenE:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-17e/iphone-17e-colors.png',
 air:'https://cdsassets.apple.com/live/7WUAS350/images/iphone/iphone-air-colors.png'
};
const ID10_A={
 A1865:'iphonex',A1901:'iphonex',A1902:'iphonex',
 A1920:'iphonexs',A2097:'iphonexs',A2098:'iphonexs',A2099:'iphonexs',A2100:'iphonexs',
 A1921:'iphonexsmax',A2101:'iphonexsmax',A2102:'iphonexsmax',A2103:'iphonexsmax',A2104:'iphonexsmax',
 A1984:'iphonexr',A2105:'iphonexr',A2106:'iphonexr',A2107:'iphonexr',A2108:'iphonexr',
 A2111:'iphone11',A2221:'iphone11',A2223:'iphone11',
 A2160:'iphone11pro',A2215:'iphone11pro',A2217:'iphone11pro',
 A2161:'iphone11pm',A2218:'iphone11pm',A2220:'iphone11pm',
 A2176:'iphone12mini',A2398:'iphone12mini',A2399:'iphone12mini',A2400:'iphone12mini',
 A2172:'iphone12',A2402:'iphone12',A2403:'iphone12',A2404:'iphone12',
 A2341:'iphone12pro',A2406:'iphone12pro',A2407:'iphone12pro',A2408:'iphone12pro',
 A2342:'iphone12pm',A2410:'iphone12pm',A2411:'iphone12pm',A2412:'iphone12pm',
 A2481:'iphone13mini',A2626:'iphone13mini',A2628:'iphone13mini',A2629:'iphone13mini',A2630:'iphone13mini',
 A2482:'iphone13',A2631:'iphone13',A2633:'iphone13',A2634:'iphone13',A2635:'iphone13',
 A2483:'iphone13pro',A2636:'iphone13pro',A2638:'iphone13pro',A2639:'iphone13pro',A2640:'iphone13pro',
 A2484:'iphone13pm',A2641:'iphone13pm',A2643:'iphone13pm',A2644:'iphone13pm',A2645:'iphone13pm',
 A2649:'iphone14',A2881:'iphone14',A2882:'iphone14',A2883:'iphone14',A2884:'iphone14',
 A2632:'iphone14plus',A2885:'iphone14plus',A2886:'iphone14plus',A2887:'iphone14plus',A2888:'iphone14plus',
 A2650:'iphone14pro',A2889:'iphone14pro',A2890:'iphone14pro',A2891:'iphone14pro',A2892:'iphone14pro',
 A2651:'iphone14pm',A2893:'iphone14pm',A2894:'iphone14pm',A2895:'iphone14pm',A2896:'iphone14pm',
 A2846:'iphone15',A3089:'iphone15',A3090:'iphone15',A3092:'iphone15',
 A2847:'iphone15plus',A3093:'iphone15plus',A3094:'iphone15plus',A3096:'iphone15plus',
 A2848:'iphone15pro',A3101:'iphone15pro',A3102:'iphone15pro',A3104:'iphone15pro',
 A2849:'iphone15pm',A3105:'iphone15pm',A3106:'iphone15pm',A3108:'iphone15pm',
 A3212:'iphone16e',A3408:'iphone16e',A3409:'iphone16e',A3410:'iphone16e',
 A3081:'iphone16',A3286:'iphone16',A3287:'iphone16',A3288:'iphone16',
 A3082:'iphone16plus',A3289:'iphone16plus',A3290:'iphone16plus',A3291:'iphone16plus',
 A3083:'iphone16pro',A3292:'iphone16pro',A3293:'iphone16pro',A3294:'iphone16pro',
 A3084:'iphone16pm',A3295:'iphone16pm',A3296:'iphone16pm',A3297:'iphone16pm',
 A3258:'iphone17',A3519:'iphone17',A3520:'iphone17',A3521:'iphone17',
 A3256:'iphone17pro',A3522:'iphone17pro',A3523:'iphone17pro',A3524:'iphone17pro',
 A3257:'iphone17pm',A3525:'iphone17pm',A3526:'iphone17pm',A3527:'iphone17pm',
 A3575:'iphone17e',A3634:'iphone17e',A3635:'iphone17e',
 A3260:'iphoneair',A3516:'iphoneair',A3517:'iphoneair',A3518:'iphoneair',
 A2595:'iphonese3',A2782:'iphonese3',A2783:'iphonese3',A2784:'iphonese3',A2785:'iphonese3',
 A2275:'iphonese2',A2296:'iphonese2',A2298:'iphonese2',
 A1863:'iphone8',A1905:'iphone8',A1906:'iphone8',
 A1864:'iphone8plus',A1897:'iphone8plus',A1898:'iphone8plus',
 A1660:'iphone7',A1778:'iphone7',A1779:'iphone7',
 A1661:'iphone7plus',A1784:'iphone7plus',A1785:'iphone7plus'
};
function id10Reset(){id10={screen:'home',history:[],candidates:[],lookup:'',message:''}}
const _helpReset10=helpReset;helpReset=function(){_helpReset10();id10Reset()}
function id10Img(src,alt){return '<img src="'+src+'" alt="'+safe(alt)+'" loading="lazy" referrerpolicy="no-referrer">'}
function id10Card(title,sub,img,screen,value){
 return '<button type="button" class="id10-card" data-id10-next="'+screen+'"'+(value?' data-id10-value="'+value+'"':'')+'>'+id10Img(img,title)+'<strong>'+safe(title)+'</strong><small>'+safe(sub)+'</small></button>';
}
function id10Progress(n){return '<div class="id10-progress">'+[1,2,3,4].map((_,i)=>'<span class="'+(i<n?'on':'')+'"></span>').join('')+'</div>'}
function id10Go(screen,value){id10.history.push(id10.screen);if(value)id10.last=value;id10.screen=screen;render();window.scrollTo({top:0,behavior:'instant'})}
function id10Back(){id10.screen=id10.history.pop()||'home';render();window.scrollTo({top:0,behavior:'instant'})}
function id10Use(key){if(!CATALOGUE[key])return;selected().model=key;selected().custom='';helpKnown='yes';helpStep=2;mode='help';render();window.scrollTo({top:0,behavior:'instant'})}
function id10ModelButton(key,label,img){return '<button class="id10-card" data-id10-model="'+key+'">'+(img?id10Img(img,label):'')+'<strong>'+safe(label||CATALOGUE[key]?.name||key)+'</strong><small>Use this model and continue to the repair questions</small></button>'}
function id10ANumber(cands,msg){id10.candidates=cands||[];id10.message=msg||'';id10Go('a-number')}
function id10ANumberScreen(){
 let key=id10.lookup?ID10_A[id10.lookup.toUpperCase().replace(/\s+/g,'')]:null;
 let valid=key&&CATALOGUE[key];
 return id10Progress(4)+'<div class="eyebrow">CONFIRM THE MODEL</div><h2 class="id10-question">Check the A-number</h2><p class="id10-sub">This is the reliable fallback when two iPhones look almost identical.</p><div class="id10-note"><strong>iPhone 8 or later with a SIM tray:</strong> remove the tray and look inside the slot, on the upper side nearest the display, under a bright light.<br><br><strong>No SIM tray:</strong> look inside the USB-C or Lightning connector on the upper side.<br><br><strong>iPhone 7 or earlier:</strong> the model number is on the back.</div><label class="field-label" for="id10A">Enter the A-number</label><div class="id10-inline"><input id="id10A" class="field id10-model-number" inputmode="text" maxlength="5" placeholder="A2633" value="'+safe(id10.lookup)+'"><button class="btn" data-id10-action="check-a" style="width:auto;padding:0 16px">Check</button></div>'+
 (valid?'<div class="id10-final"><h3>'+safe(CATALOGUE[key].name)+'</h3><p class="muted">Matched from the model number you entered.</p><button class="btn" data-id10-model="'+key+'">Use '+safe(CATALOGUE[key].name)+' →</button></div>':(id10.message?'<p class="id10-note">'+safe(id10.message)+'</p>':''))+
 '<button class="btn ghost id10-back" data-id10-action="back">← Back</button><p class="id10-source">Identification images and model-number method: Apple Support</p>';
}
function id10Wizard(){
 let s=id10.screen;
 if(s==='a-number')return id10ANumberScreen();
 if(s==='home')return id10Progress(1)+'<div class="eyebrow">IPHONE IDENTIFIER</div><h2 class="id10-question">Does it have a round Home button below the screen?</h2><p class="id10-sub">Choose the picture that looks closest. We’ll only show the next relevant question.</p><div class="id10-grid">'+
  id10Card('Yes — round Home button','Older iPhone / SE style',ID10_IMG.se,'home-cameras','home')+
  id10Card('No — full screen','Face ID / all-screen style',ID10_IMG.thirteen,'camera-count','full')+
  '</div><button class="btn ghost id10-back" data-id10-action="a-number">Use the model number instead</button><p class="id10-source">Official Apple identification images</p>';
 if(s==='home-cameras')return id10Progress(2)+'<div class="eyebrow">HOME-BUTTON IPHONE</div><h2 class="id10-question">How many rear cameras?</h2><div class="id10-grid">'+
  id10Card('One rear camera','Most 4.7-inch and earlier Home-button models',ID10_IMG.eight,'home-one','one')+
  id10Card('Two rear cameras','The cameras sit horizontally',ID10_IMG.eightPlus,'home-two','two')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='home-two')return id10Progress(3)+'<div class="eyebrow">PLUS MODEL</div><h2 class="id10-question">Which back looks like yours?</h2><div class="id10-grid">'+
  id10Card('Glass back','iPhone 8 Plus style',ID10_IMG.eightPlus,'use-model','iphone8plus')+
  id10Card('Aluminium back','iPhone 7 Plus style',ID10_IMG.sevenPlus,'use-model','iphone7plus')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='home-one')return id10Progress(3)+'<div class="eyebrow">HOME-BUTTON IPHONE</div><h2 class="id10-question">These models are too similar to guess safely from one photo.</h2><p class="id10-sub">iPhone 7, iPhone 8 and SE generations can look extremely similar from the front. We’ll use the A-number rather than risk giving the wrong repair price.</p><div class="id10-grid">'+
  id10Card('Glass-back style','iPhone 8 / SE (2nd or 3rd gen)',ID10_IMG.se,'a-number','glass-home')+
  id10Card('Aluminium-back style','iPhone 6 / 6s / 7 family',ID10_IMG.seven,'a-number','metal-home')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='camera-count')return id10Progress(2)+'<div class="eyebrow">FULL-SCREEN IPHONE</div><h2 class="id10-question">How many cameras are on the back?</h2><div class="id10-grid three">'+
  id10Card('One rear camera','XR / e-series / Air families',ID10_IMG.sixteenE,'single-port','one')+
  id10Card('Two rear cameras','Standard dual-camera iPhones',ID10_IMG.thirteen,'dual-shape','two')+
  id10Card('Three rear cameras','Pro-camera iPhones',ID10_IMG.fifteenPro,'triple-shape','three')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='single-port')return id10Progress(3)+'<div class="eyebrow">ONE CAMERA</div><h2 class="id10-question">Which charging connector does it use?</h2><div class="id10-grid">'+
  id10Card('Lightning','Older Apple connector',ID10_IMG.xr,'use-model','iphonexr')+
  id10Card('USB-C','Newer connector',ID10_IMG.sixteenE,'single-usbc','usb-c')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='single-usbc')return id10Progress(4)+'<div class="eyebrow">USB-C · ONE CAMERA</div><h2 class="id10-question">Which real iPhone looks closest?</h2><div class="id10-grid three">'+
  id10Card('iPhone 16e style','Single camera, no full-width plateau',ID10_IMG.sixteenE,'use-model','iphone16e')+
  id10Card('iPhone 17e style','Single camera, newer e-series body',ID10_IMG.seventeenE,'use-model','iphone17e')+
  id10Card('iPhone Air style','Camera sits in a wide raised plateau',ID10_IMG.air,'use-model','iphoneair')+
  '</div><div class="id10-note">If you are not completely sure between 16e and 17e, use the A-number instead of guessing.</div><button class="btn secondary" data-id10-action="a-number">Check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='dual-shape')return id10Progress(3)+'<div class="eyebrow">TWO CAMERAS</div><h2 class="id10-question">Which camera housing matches the phone?</h2><div class="id10-grid three">'+
  id10Card('Narrow vertical strip','iPhone X / XS family',ID10_IMG.x,'a-number','x-xs')+
  id10Card('Square camera bump','iPhone 11–15 standard families',ID10_IMG.eleven,'dual-square','square')+
  id10Card('Tall vertical pill','iPhone 16 / 17 style',ID10_IMG.sixteen,'dual-new','pill')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='dual-square')return id10Progress(4)+'<div class="eyebrow">SQUARE CAMERA BUMP</div><h2 class="id10-question">Are the two lenses straight or diagonal?</h2><div class="id10-grid">'+
  id10Card('Straight / vertical','iPhone 11 or 12 style',ID10_IMG.twelve,'dual-straight','straight')+
  id10Card('Diagonal','iPhone 13, 14 or 15 style',ID10_IMG.thirteen,'dual-diagonal','diagonal')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='dual-straight')return id10Progress(4)+'<div class="eyebrow">VERTICAL LENSES</div><h2 class="id10-question">Are the outer sides rounded or flat?</h2><div class="id10-grid">'+
  id10Card('Rounded sides','iPhone 11',ID10_IMG.eleven,'use-model','iphone11')+
  id10Card('Flat sides','iPhone 12 / 12 mini',ID10_IMG.twelve,'size12','flat')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='size12')return id10Progress(4)+'<div class="eyebrow">IPHONE 12 FAMILY</div><h2 class="id10-question">Which size is it?</h2><div class="id10-grid">'+
  id10ModelButton('iphone12mini','iPhone 12 mini · very small 5.4-inch',ID10_IMG.twelve)+
  id10ModelButton('iphone12','iPhone 12 · standard 6.1-inch',ID10_IMG.twelve)+
  '</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='dual-diagonal')return id10Progress(4)+'<div class="eyebrow">DIAGONAL LENSES</div><h2 class="id10-question">What is at the top of the front screen?</h2><div class="id10-grid">'+
  id10Card('A notch','iPhone 13 / 14 family',ID10_IMG.fourteen,'diag-notch','notch')+
  id10Card('Dynamic Island','iPhone 15 family',ID10_IMG.fifteen,'size15','island')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='diag-notch')return id10Progress(4)+'<div class="eyebrow">NOTCH · DIAGONAL CAMERAS</div><h2 class="id10-question">Which size is it?</h2><div class="id10-grid three">'+
  id10ModelButton('iphone13mini','Very small · iPhone 13 mini',ID10_IMG.thirteen)+
  '<button class="id10-card" data-id10-next="a-number" data-id10-value="13-14-standard">'+id10Img(ID10_IMG.fourteen,'iPhone 13 or 14')+'<strong>Standard size</strong><small>iPhone 13 and iPhone 14 can be too similar to identify safely by appearance alone — check the A-number.</small></button>'+
  id10ModelButton('iphone14plus','Large · iPhone 14 Plus',ID10_IMG.fourteen)+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='size15')return id10Progress(4)+'<div class="eyebrow">IPHONE 15 FAMILY</div><h2 class="id10-question">Which size is it?</h2><div class="id10-grid">'+
  id10ModelButton('iphone15','Standard · iPhone 15',ID10_IMG.fifteen)+
  id10ModelButton('iphone15plus','Large · iPhone 15 Plus',ID10_IMG.fifteen)+
  '</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='dual-new')return id10Progress(4)+'<div class="eyebrow">NEWER VERTICAL CAMERAS</div><h2 class="id10-question">Which real iPhone looks closest?</h2><div class="id10-grid">'+
  id10Card('iPhone 16 family','Vertical cameras in the 16-style housing',ID10_IMG.sixteen,'size16','16')+
  id10Card('iPhone 17','Newer 17-style body and camera housing',ID10_IMG.seventeen,'use-model','iphone17')+
  '</div><div class="id10-note">If the difference is not obvious in your hand, use the A-number. The app will not guess.</div><button class="btn secondary" data-id10-action="a-number">Check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='size16')return id10Progress(4)+'<div class="eyebrow">IPHONE 16 FAMILY</div><h2 class="id10-question">Which size is it?</h2><div class="id10-grid">'+
  id10ModelButton('iphone16','Standard · iPhone 16',ID10_IMG.sixteen)+
  id10ModelButton('iphone16plus','Large · iPhone 16 Plus',ID10_IMG.sixteen)+
  '</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='triple-shape')return id10Progress(3)+'<div class="eyebrow">THREE CAMERAS</div><h2 class="id10-question">Does the raised camera area stretch almost all the way across the back?</h2><div class="id10-grid">'+
  id10Card('No — square camera bump','11 Pro through 16 Pro style',ID10_IMG.sixteenPro,'triple-port','square')+
  id10Card('Yes — wide plateau','17 Pro / newer Pro style',ID10_IMG.seventeenPro,'a-number','wide-pro')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='triple-port')return id10Progress(4)+'<div class="eyebrow">PRO CAMERA SQUARE</div><h2 class="id10-question">Which charging connector does it use?</h2><div class="id10-grid">'+
  id10Card('Lightning','11 Pro to 14 Pro families',ID10_IMG.fourteenPro,'triple-lightning','lightning')+
  id10Card('USB-C','15 Pro / 16 Pro families',ID10_IMG.fifteenPro,'triple-usbc','usb-c')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='triple-usbc')return id10Progress(4)+'<div class="eyebrow">USB-C PRO</div><h2 class="id10-question">Is there a separate Camera Control button low down on the right-hand side?</h2><div class="id10-grid">'+
  id10Card('No Camera Control','iPhone 15 Pro family',ID10_IMG.fifteenPro,'pro-size15','no')+
  id10Card('Yes — Camera Control','iPhone 16 Pro family',ID10_IMG.sixteenPro,'pro-size16','yes')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='pro-size15')return id10Progress(4)+'<div class="eyebrow">IPHONE 15 PRO FAMILY</div><div class="id10-grid">'+id10ModelButton('iphone15pro','iPhone 15 Pro · 6.1-inch',ID10_IMG.fifteenPro)+id10ModelButton('iphone15pm','iPhone 15 Pro Max · 6.7-inch',ID10_IMG.fifteenPro)+'</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='pro-size16')return id10Progress(4)+'<div class="eyebrow">IPHONE 16 PRO FAMILY</div><div class="id10-grid">'+id10ModelButton('iphone16pro','iPhone 16 Pro · 6.3-inch',ID10_IMG.sixteenPro)+id10ModelButton('iphone16pm','iPhone 16 Pro Max · 6.9-inch',ID10_IMG.sixteenPro)+'</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='triple-lightning')return id10Progress(4)+'<div class="eyebrow">LIGHTNING PRO</div><h2 class="id10-question">What is at the top of the front screen?</h2><div class="id10-grid">'+
  id10Card('Dynamic Island','iPhone 14 Pro family',ID10_IMG.fourteenPro,'pro-size14','island')+
  id10Card('A notch','iPhone 11 / 12 / 13 Pro families',ID10_IMG.thirteenPro,'triple-notch','notch')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='pro-size14')return id10Progress(4)+'<div class="eyebrow">IPHONE 14 PRO FAMILY</div><div class="id10-grid">'+id10ModelButton('iphone14pro','iPhone 14 Pro · 6.1-inch',ID10_IMG.fourteenPro)+id10ModelButton('iphone14pm','iPhone 14 Pro Max · 6.7-inch',ID10_IMG.fourteenPro)+'</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='triple-notch')return id10Progress(4)+'<div class="eyebrow">NOTCH · PRO CAMERAS</div><h2 class="id10-question">Are the outer sides rounded or flat?</h2><div class="id10-grid">'+
  id10Card('Rounded sides','iPhone 11 Pro family',ID10_IMG.elevenPro,'pro-size11','rounded')+
  id10Card('Flat sides','iPhone 12 Pro / 13 Pro families',ID10_IMG.thirteenPro,'a-number','12-13-pro')+
  '</div><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 if(s==='pro-size11')return id10Progress(4)+'<div class="eyebrow">IPHONE 11 PRO FAMILY</div><div class="id10-grid">'+id10ModelButton('iphone11pro','iPhone 11 Pro · 5.8-inch',ID10_IMG.elevenPro)+id10ModelButton('iphone11pm','iPhone 11 Pro Max · 6.5-inch',ID10_IMG.elevenPro)+'</div><button class="btn secondary" data-id10-action="a-number">Not sure — check A-number</button><button class="btn ghost id10-back" data-id10-action="back">← Back</button>';
 return '<div class="id10-note">Identification route reset.</div><button class="btn" data-id10-action="reset">Start again</button>';
}
helpDeviceScreen=function(){
 let isApple=helpBrand==='Apple iPhone',isOther=helpBrand==='Other phone',found=helpKnown==='yes',unsure=helpKnown==='no';
 return '<section class="glass panel">'+helpProgress()+'<div class="eyebrow">STEP 1 · YOUR DEVICE</div><h2>What type of phone is it?</h2><div class="phone-type-grid"><button class="phone-type-card" data-help-brand="Apple iPhone" aria-pressed="'+isApple+'"><span class="phone-type-icon">📱</span><strong>Apple iPhone</strong><small>Use the guided iPhone identifier</small></button><button class="phone-type-card" data-help-brand="Other phone" aria-pressed="'+isOther+'"><span class="phone-type-icon">📲</span><strong>Other phone</strong><small>We’ll build this route later</small></button></div>'+
 (isOther?'<div class="tip"><strong>Other-phone identification is parked for now.</strong> Enter the model manually if you know it.</div><label class="field-label" for="helpCustomModel">Phone model</label><input class="field" id="helpCustomModel" maxlength="90" value="'+(selected().model==='otherphone'?safe(selected().custom):'')+'" placeholder="e.g. Samsung Galaxy S23 Ultra"><button class="btn" style="margin-top:12px" data-action="help-other-next">Continue →</button>':'')+
 (isApple?'<div class="divider"></div><h2>Do you know the exact iPhone model?</h2><div class="choice-grid"><button class="choice" data-help-known="yes" aria-pressed="'+found+'">✓ Yes, I know it</button><button class="choice" data-help-known="no" aria-pressed="'+unsure+'">? I’m not sure</button></div>'+
  (found?'<label class="field-label" for="helpModel">Choose exact iPhone</label><select class="field" id="helpModel">'+helpModelOptions()+'</select><button class="btn" style="margin-top:12px" data-action="help-device-next" '+(!IPHONE_KEYS.includes(selected().model)?'disabled':'')+'>That’s my iPhone →</button>':'')+
  (unsure?'<label class="field-label">Can the iPhone switch on and open Settings?</label><div class="pill-row">'+['Yes','No'].map(v=>'<button class="pill" data-help-usable="'+v+'" aria-pressed="'+(helpUsable===v)+'">'+v+'</button>').join('')+'</div>'+
    (helpUsable==='Yes'?'<div class="tip"><strong>Fastest and most accurate:</strong> open <strong>Settings → General → About</strong> and read <strong>Model Name</strong>.</div><button class="btn" data-action="help-found-model">I found the model name →</button><button class="btn secondary" style="margin-top:8px" data-id10-action="visual">I still need visual help →</button>':'')+
    ((helpUsable==='No'||helpUsable==='Visual')?id10Wizard():''):''):'')+
 '<button class="btn ghost help-back" data-action="help-home">← Back</button></section>';
};
document.addEventListener('click',function(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.id10Next){
   const next=b.dataset.id10Next,val=b.dataset.id10Value||'';
   if(next==='use-model'){id10Use(val);return}
   if(next==='a-number'){id10.candidates=[];id10.message='Use the Apple A-number to confirm the exact model before pricing.';id10Go('a-number',val);return}
   id10Go(next,val);return;
 }
 if(b.dataset.id10Model){id10Use(b.dataset.id10Model);return}
 if(b.dataset.id10Action==='back'){id10Back();return}
 if(b.dataset.id10Action==='reset'){id10Reset();render();return}
 if(b.dataset.id10Action==='visual'){helpUsable='Visual';id10Reset();render();return}
 if(b.dataset.id10Action==='a-number'){id10.message='Use the Apple A-number to confirm the exact model before pricing.';id10Go('a-number');return}
 if(b.dataset.id10Action==='check-a'){
   const el=document.getElementById('id10A');id10.lookup=(el?.value||'').trim().toUpperCase();
   if(!/^A\d{4}$/.test(id10.lookup)){id10.message='Enter a model number in the form A1234.'}
   else if(!ID10_A[id10.lookup]){id10.message='That A-number is not yet in this prototype lookup. Keep the phone unconfirmed and staff can verify it.'}
   else{id10.message=''}
   render();return;
 }
},false);
document.addEventListener('input',function(e){if(e.target?.id==='id10A')id10.lookup=e.target.value},false);
