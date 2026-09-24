'use strict';
// Build 09 iPhone visual identification overlay. Loaded after the Build 08 core.
Object.assign(CATALOGUE,{
 'iphone6':{name:'iPhone 6',screen:{}},
 'iphone6plus':{name:'iPhone 6 Plus',screen:{}},
 'iphone6s':{name:'iPhone 6s',screen:{}},
 'iphone6splus':{name:'iPhone 6s Plus',screen:{}},
 'iphonese1':{name:'iPhone SE (1st generation)',screen:{}},
 'iphone7':{name:'iPhone 7',screen:{}},
 'iphone7plus':{name:'iPhone 7 Plus',screen:{}},
 'iphone8':{name:'iPhone 8',screen:{}},
 'iphone8plus':{name:'iPhone 8 Plus',screen:{}},
 'iphonex':{name:'iPhone X',screen:{}},
 'iphonexr':{name:'iPhone XR',screen:{}},
 'iphonexs':{name:'iPhone XS',screen:{}},
 'iphonexsmax':{name:'iPhone XS Max',screen:{}},
 'iphone11':{name:'iPhone 11',screen:{}},
 'iphone11pro':{name:'iPhone 11 Pro',screen:{}},
 'iphone11pm':{name:'iPhone 11 Pro Max',screen:{}},
 'iphonese2':{name:'iPhone SE (2nd generation)',screen:{}},
 'iphone12mini':{name:'iPhone 12 mini',screen:{}},
 'iphone12':{name:'iPhone 12',screen:{LCD:79,OLED:129}},
 'iphone12pro':{name:'iPhone 12 Pro',screen:{}},
 'iphone12pm':{name:'iPhone 12 Pro Max',screen:{}},
 'iphone13mini':{name:'iPhone 13 mini',screen:{}},
 'iphone13':{name:'iPhone 13',screen:{LCD:99,OLED:149},battery:79,rear:99},
 'iphone13pro':{name:'iPhone 13 Pro',screen:{LCD:99,OLED:149},rear:99},
 'iphone13pm':{name:'iPhone 13 Pro Max',screen:{}},
 'iphonese3':{name:'iPhone SE (3rd generation)',screen:{}},
 'iphone14':{name:'iPhone 14',screen:{}},
 'iphone14plus':{name:'iPhone 14 Plus',screen:{LCD:99,OLED:149}},
 'iphone14pro':{name:'iPhone 14 Pro',screen:{}},
 'iphone14pm':{name:'iPhone 14 Pro Max',screen:{LCD:109,OLED:149},rear:99},
 'iphone15':{name:'iPhone 15',screen:{}},
 'iphone15plus':{name:'iPhone 15 Plus',screen:{LCD:99,OLED:149},rear:99},
 'iphone15pro':{name:'iPhone 15 Pro',screen:{OLED:149},rear:99,review:true},
 'iphone15pm':{name:'iPhone 15 Pro Max',screen:{LCD:119,OLED:169},battery:79,rear:99,review:true},
 'iphone16e':{name:'iPhone 16e',screen:{}},
 'iphone16':{name:'iPhone 16',screen:{}},
 'iphone16plus':{name:'iPhone 16 Plus',screen:{}},
 'iphone16pro':{name:'iPhone 16 Pro',screen:{}},
 'iphone16pm':{name:'iPhone 16 Pro Max',screen:{}},
 'iphoneair':{name:'iPhone Air',screen:{}},
 'iphone17e':{name:'iPhone 17e',screen:{}},
 'iphone17':{name:'iPhone 17',screen:{LCD:129,OLED:179}},
 'iphone17pro':{name:'iPhone 17 Pro',screen:{}},
 'iphone17pm':{name:'iPhone 17 Pro Max',screen:{}},
 'iphone18pro':{name:'iPhone 18 Pro',screen:{}},
 'iphone18pm':{name:'iPhone 18 Pro Max',screen:{}},
});
var IPHONE_KEYS=Object.keys(CATALOGUE).filter(k=>k.startsWith('iphone')&&!['iphoneair'].includes(k)).concat(['iphoneair']);
var helpCameraControl='';
function helpReset(){helpStep=1;helpKnown='';helpUsable='';helpBrand='';helpCameras='';helpDisplay='';helpPort='';helpCameraControl='';helpIssue='';let d=selected();if(d&&!basket.some(r=>r.deviceId===d.id)){d.model='';d.custom=''}}
function helpModelOptions(){return '<option value="">Select your iPhone</option>'+IPHONE_KEYS.map(key=>`<option value="${key}" ${selected().model===key?'selected':''}>${safe(CATALOGUE[key].name)}</option>`).join('')}
function helpProgress(){return `<div class="help-progress"><span class="help-dot on"></span><span class="help-dot ${helpStep>=2?'on':''}"></span></div>`}
function cameraGraphic(type){let lenses=type==='single'||type==='single-plateau'?1:type.startsWith('dual')?2:3;return `<span class="phone-diagram ${type}" aria-hidden="true"><span class="module"></span>${Array.from({length:lenses},(_,i)=>`<span class="lens l${i+1}"></span>`).join('')}<span class="flash"></span></span>`}
const CAMERA_LAYOUTS=[
 ['single','One rear camera','Single lens in the corner'],
 ['dual-horizontal','Two · horizontal','7 Plus / 8 Plus style'],
 ['dual-strip','Two · narrow vertical strip','X / XS style'],
 ['dual-square-vertical','Two · vertical in square bump','11 / 12 style'],
 ['dual-diagonal','Two · diagonal','13 / 14 / 15 style'],
 ['dual-new-vertical','Two · newer vertical layout','16 / 17 style'],
 ['triple-square','Three · triangular cluster','Pro style camera square'],
 ['triple-plateau','Three · wide camera plateau','17 Pro / newer Pro style'],
 ['single-plateau','One · wide camera plateau','iPhone Air style']
];
