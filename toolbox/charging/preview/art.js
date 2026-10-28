/* iRepair Charging v3 — clean, realistic, immediately recognisable instruction art.
   These illustrations are not live electrical measurements. */
(function(root){"use strict";
const defs='<defs>'+
'<linearGradient id="caMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8ffff"/><stop offset=".16" stop-color="#9cbed8"/><stop offset=".43" stop-color="#365e82"/><stop offset=".75" stop-color="#183352"/><stop offset="1" stop-color="#a6d2eb"/></linearGradient>'+
'<linearGradient id="caScreen" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#73d6fb"/><stop offset=".22" stop-color="#2e9ad6"/><stop offset=".62" stop-color="#12649d"/><stop offset="1" stop-color="#082c59"/></linearGradient>'+
'<linearGradient id="caPlug" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#fff"/><stop offset=".27" stop-color="#cfe5f5"/><stop offset=".7" stop-color="#829fbb"/><stop offset="1" stop-color="#e8f8ff"/></linearGradient>'+
'<linearGradient id="caBattery" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#05a3ae"/><stop offset=".5" stop-color="#41ded3"/><stop offset="1" stop-color="#bcfff0"/></linearGradient>'+
'<radialGradient id="caHalo"><stop stop-color="#75e9fa" stop-opacity=".27"/><stop offset="1" stop-color="#e7faff" stop-opacity="0"/></radialGradient>'+
'<filter id="caShadow" x="-50%" y="-50%" width="200%" height="230%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#245b85" flood-opacity=".32"/></filter></defs>';
function phone(x,y,w,h,state){
 var cx=w/2,cy=h/2;
 var display=state==="charge"?'<circle cx="'+cx+'" cy="'+cy+'" r="30" fill="#84fff3" opacity=".14"/><circle cx="'+cx+'" cy="'+cy+'" r="23" fill="none" stroke="#bafff8" stroke-opacity=".55" stroke-width="1.7"/><path d="M'+(cx+3)+' '+(cy-23)+'l-17 27h14l-5 21 21-30h-14l4-18Z" fill="#e8fff9"/>':
 state==="battery"?'<rect x="'+(cx-20)+'" y="'+(cy-30)+'" width="40" height="59" rx="9" fill="#082c51" fill-opacity=".35" stroke="#e1ffff" stroke-width="2.7"/><rect x="'+(cx-9)+'" y="'+(cy-35)+'" width="18" height="6" rx="2" fill="#eaffff"/><rect x="'+(cx-15)+'" y="'+(cy-4)+'" width="30" height="27" rx="4" fill="url(#caBattery)"/>':
 '<rect x="15" y="45" width="'+(w-30)+'" height="65" rx="9" fill="#f1ffff" fill-opacity=".2" stroke="#ccffff" stroke-opacity=".45"/><path d="M23 62h'+(w-46)+'M23 77h'+(w-46)+'M23 92h'+(w-46)+'" stroke="#d8ffff" stroke-width="3" stroke-linecap="round"/><rect x="'+(cx-21)+'" y="115" width="42" height="17" rx="8" fill="#c7fff3" fill-opacity=".64"/>';
 return '<g class="caPhone" transform="translate('+x+' '+y+')" filter="url(#caShadow)">'+
 '<rect width="'+w+'" height="'+h+'" rx="21" fill="url(#caMetal)" stroke="#e4f8ff" stroke-width="1.5"/>'+
 '<rect x="5" y="5" width="'+(w-10)+'" height="'+(h-10)+'" rx="17" fill="url(#caScreen)" stroke="#113e67" stroke-width=".8"/>'+
 '<path d="M10 16Q'+(w*.45)+' 5 '+(w-11)+' 41L'+(w-11)+' 8H21Q9 8 10 16Z" fill="#fff" opacity=".13"/>'+
 '<rect x="'+(cx-16)+'" y="10" width="32" height="8" rx="4" fill="#071f39"/>'+display+
 '<rect x="'+(cx-12)+'" y="'+(h-6.5)+'" width="24" height="2" rx="1" fill="#9acbdf" opacity=".65"/>'+
 '<path d="M3 38v28M'+(w-2)+' 58v31" stroke="#d8f9ff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/></g>';
}
function tip(x,y,kind,flip,large){
 var a=kind==="USB-C",s=large?1.35:1;
 var pins=a?'<rect x="-18" y="-12" width="36" height="21" rx="8" fill="url(#caMetal)" stroke="#f1ffff" stroke-width="1.8"/><rect x="-13" y="-9" width="26" height="6" rx="3" fill="#153a5b" stroke="#8cbad0" stroke-width=".8"/>':
 '<rect x="-17" y="-15" width="34" height="23" rx="3" fill="url(#caPlug)" stroke="#edfaff" stroke-width="1.6"/>'+
 [-12,-8,-4,0,4,8,12].map(function(v){return '<rect x="'+(v-1.3)+'" y="-11" width="2.6" height="11" rx="1" fill="#d3b07a"/>';}).join("");
 return '<g class="caConnector" transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')" filter="url(#caShadow)">'+
 '<path d="M0 27v54" stroke="#bbd7e9" stroke-width="7" stroke-linecap="round"/>'+
 '<path d="M0 27v54" stroke="#6692b1" stroke-width="2" stroke-linecap="round"/>'+
 '<rect x="-22" y="5" width="44" height="32" rx="8" fill="url(#caPlug)" stroke="#eefaff" stroke-width="1.4"/>'+pins+
 '<path d="M-15 14h30" stroke="#fff" stroke-opacity=".65" stroke-width="1.4"/></g>';
}
function words(value,x,y,size){
 return '<text x="'+x+'" y="'+y+'" fill="#255d7f" font-family="-apple-system,BlinkMacSystemFont,Arial,sans-serif" font-size="'+(size||12)+'" font-weight="800" text-anchor="middle" letter-spacing=".35">'+value+'</text>';
}
function check(x,y){
 return '<g transform="translate('+x+' '+y+')"><circle r="19" fill="#eefff9" stroke="#7dcfbe" stroke-width="2.3"/><path d="m-8 0 5 5 12-12" fill="none" stroke="#158e83" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>';
}
function alert(x,y){
 return '<g transform="translate('+x+' '+y+')"><circle r="22" fill="#fff5e8" stroke="#eac785" stroke-width="2"/><path d="M0-11v13" stroke="#b07d35" stroke-width="4" stroke-linecap="round"/><circle cy="10" r="2.5" fill="#b07d35"/></g>';
}
function scene(id,kind){
 var content="";
 switch(id){
 case "safety":
 content=phone(67,15,88,165,"battery")+tip(235,89,kind,false,false)+alert(269,54)+words("CHECK FIRST",239,190,13);break;
 case "wired":
 content=phone(127,6,86,167,"charge")+tip(170,183,kind,false,false)+check(253,86);break;
 case "stability":
 content=phone(74,11,86,169,"charge")+tip(116,189,kind,false,false)+
 '<rect x="185" y="67" width="125" height="67" rx="19" fill="#f5fcff" fill-opacity=".9" stroke="#add8e9" stroke-width="2"/>'+
 words("ONLY CHARGES",247,94,13)+words("AT AN ANGLE?",247,115,12)+
 '<path d="M191 143l-23 11-17-5" stroke="#64a9c9" fill="none" stroke-width="2.4" stroke-linecap="round"/>';break;
 case "flip":
 content=tip(100,74,kind,false,true)+tip(240,74,kind,true,true)+
 words("SIDE A",100,190,12)+words("SIDE B",240,190,12)+
 '<path d="M149 43q20-24 42 0" fill="none" stroke="#2196c9" stroke-width="4" stroke-linecap="round"/>'+
 '<path d="m181 37 10 7-1-13" stroke="#2196c9" fill="none" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>'+
 words("180°",170,85,22);break;
 case "swap":
 content=tip(88,73,kind,false,true)+tip(248,73,kind,false,true)+
 '<g transform="translate(88 29)"><circle r="18" fill="#f8fcff" stroke="#aac5d8" stroke-width="2.5"/><path d="M-7-7 7 7M7-7-7 7" stroke="#8d9dab" stroke-width="3.5" stroke-linecap="round"/></g>'+
 check(248,29)+
 '<path d="M134 92h70m-9-9 9 9-9 9" stroke="#278dbb" stroke-width="3.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'+
 words("FIRST CABLE",88,194,12)+words("TRY ANOTHER",248,194,12);break;
 case "port":
 content='<g filter="url(#caShadow)"><path d="M66 15h208q21 0 21 21v52H45V36Q45 15 66 15Z" fill="url(#caMetal)" stroke="#f0ffff" stroke-width="2"/>'+
 (kind==="USB-C"?'<rect x="139" y="53" width="62" height="18" rx="9" fill="#102f4f" stroke="#b6d4e5" stroke-width="3"/><rect x="150" y="61" width="40" height="4" rx="2" fill="#8fb5ce"/>':
 '<rect x="147" y="56" width="46" height="13" rx="5" fill="#102f4f" stroke="#c0d9e7" stroke-width="2.5"/>')+
 '<path d="M52 85h235" stroke="#285d82" stroke-width="3"/></g>'+
 tip(170,153,kind,false,true)+words("PHONE PORT",170,111,12)+words("CABLE TIP",170,208,12);break;
 case "wireless":
 content='<ellipse cx="170" cy="171" rx="111" ry="31" fill="#71d9e9" opacity=".23"/>'+
 '<ellipse cx="170" cy="174" rx="105" ry="23" fill="url(#caMetal)" stroke="#eaffff" stroke-width="2.3" filter="url(#caShadow)"/>'+
 '<ellipse cx="170" cy="168" rx="77" ry="13" fill="#b2fdfb" fill-opacity=".25" stroke="#8bdcea" stroke-width="2"/>'+
 '<ellipse class="caWirelessGlow" cx="170" cy="141" rx="80" ry="34" fill="#9bffe7" opacity=".26"/>'+
 phone(129,7,82,153,"charge")+words("CHARGING PAD",170,207,12);break;
 case "behaviour":
 content=phone(88,9,88,170,"settings")+
 '<rect x="202" y="58" width="107" height="74" rx="18" fill="#f4fcff" stroke="#b5d9eb" stroke-width="2" filter="url(#caShadow)"/>'+
 words("CHARGE",255,81,12)+words("LIMIT",255,97,12)+
 '<g transform="translate(255 116)" fill="#1479ae"><rect x="-8" y="-8" width="6" height="18" rx="2"/><rect x="2" y="-8" width="6" height="18" rx="2"/></g>';break;
 default:content=phone(125,10,88,170,"charge");
 }
 return content;
}
function render(stage,kind){
 var k=kind==="USB-C"?"USB-C":"Lightning";
 var labels={safety:"checking the phone and lead",wired:"connecting a charging lead",stability:"charging connection at an angle",flip:"turning the reversible plug 180 degrees",swap:"trying a different cable",port:"inspecting the cable and port",wireless:"placing phone on charging pad",behaviour:"battery settings and charging limits"};
 return '<svg class="chargeSceneSvg v3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 215" role="img" aria-label="Illustration of '+(labels[stage]||"iPhone charging")+'">'+defs+
 '<ellipse cx="170" cy="108" rx="150" ry="92" fill="url(#caHalo)"/>'+scene(stage,k)+'</svg>';
}
root.IRepairChargingArt=Object.freeze({render});
})(window);