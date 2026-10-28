/* iRepair Toolbox — public-model catalogue and original schematic SVG renderer.
   Apple model-family information: https://support.apple.com/en-gb/108044
   Drawings represent visible design features, not engineering-grade microphone coordinates.
   Native iOS must separately verify available input data sources and playback routing. */
(function (root) {
"use strict";
const columns = [
["iphone-8","iPhone 8",2017,"home","single",138.4,67.3],
["iphone-8-plus","iPhone 8 Plus",2017,"home","horizontal",158.4,78.1],
["iphone-x","iPhone X",2017,"notch","vertical",143.6,70.9],
["iphone-xr","iPhone XR",2018,"notch","single",150.9,75.7],
["iphone-xs","iPhone XS",2018,"notch","vertical",143.6,70.9],
["iphone-xs-max","iPhone XS Max",2018,"notch","vertical",157.5,77.4],
["iphone-11","iPhone 11",2019,"notch","dual-square",150.9,75.7],
["iphone-11-pro","iPhone 11 Pro",2019,"notch","triple",144.0,71.4],
["iphone-11-pro-max","iPhone 11 Pro Max",2019,"notch","triple",158.0,77.8],
["iphone-se-2020","iPhone SE (2nd generation · 2020)",2020,"home","single",138.4,67.3],
["iphone-12-mini","iPhone 12 mini",2020,"notch","dual-vertical",131.5,64.2],
["iphone-12","iPhone 12",2020,"notch","dual-vertical",146.7,71.5],
["iphone-12-pro","iPhone 12 Pro",2020,"notch","triple",146.7,71.5],
["iphone-12-pro-max","iPhone 12 Pro Max",2020,"notch","triple",160.8,78.1],
["iphone-13-mini","iPhone 13 mini",2021,"notch","dual-diagonal",131.5,64.2],
["iphone-13","iPhone 13",2021,"notch","dual-diagonal",146.7,71.5],
["iphone-13-pro","iPhone 13 Pro",2021,"notch","triple",146.7,71.5],
["iphone-13-pro-max","iPhone 13 Pro Max",2021,"notch","triple",160.8,78.1],
["iphone-se-2022","iPhone SE (3rd generation · 2022)",2022,"home","single",138.4,67.3],
["iphone-14","iPhone 14",2022,"notch","dual-diagonal",146.7,71.5],
["iphone-14-plus","iPhone 14 Plus",2022,"notch","dual-diagonal",160.8,78.1],
["iphone-14-pro","iPhone 14 Pro",2022,"island","triple",147.5,71.5],
["iphone-14-pro-max","iPhone 14 Pro Max",2022,"island","triple",160.7,77.6],
["iphone-15","iPhone 15",2023,"island","dual-diagonal",147.6,71.6],
["iphone-15-plus","iPhone 15 Plus",2023,"island","dual-diagonal",160.9,77.8],
["iphone-15-pro","iPhone 15 Pro",2023,"island","triple",146.6,70.6],
["iphone-15-pro-max","iPhone 15 Pro Max",2023,"island","triple",159.9,76.7],
["iphone-16","iPhone 16",2024,"island","dual-vertical",147.6,71.6],
["iphone-16-plus","iPhone 16 Plus",2024,"island","dual-vertical",160.9,77.8],
["iphone-16-pro","iPhone 16 Pro",2024,"island","triple",149.6,71.5],
["iphone-16-pro-max","iPhone 16 Pro Max",2024,"island","triple",163.0,77.6],
["iphone-16e","iPhone 16e",2025,"notch","single",146.7,71.5],
["iphone-17","iPhone 17",2025,"island","dual-vertical",149.6,71.5],
["iphone-17-pro","iPhone 17 Pro",2025,"island","plateau-triple",150.0,71.9],
["iphone-17-pro-max","iPhone 17 Pro Max",2025,"island","plateau-triple",163.4,78.0],
["iphone-air","iPhone Air",2025,"island","plateau-single",156.2,74.7],
["iphone-17e","iPhone 17e",2026,"notch","single",146.7,71.5],
["iphone-18-pro","iPhone 18 Pro",2026,"small-island","plateau-triple",150.0,71.9],
["iphone-18-pro-max","iPhone 18 Pro Max",2026,"small-island","plateau-triple",163.4,78.0],
["iphone-duo","iPhone Duo (foldable · coming soon)",2026,"duo","duo",117.8,84.1]
];
const models = columns.map(function (m) { return Object.freeze({slug:m[0],name:m[1],year:m[2],front:m[3],rear:m[4],heightMm:m[5],widthMm:m[6]}); });
const bySlug = Object.fromEntries(models.map(m=>[m.slug,m]));
const aliases = {"se2020":"iphone-se-2020","iphone-se-2":"iphone-se-2020","se2":"iphone-se-2020","se-2020":"iphone-se-2020","se2022":"iphone-se-2022","iphone-se-3":"iphone-se-2022","se3":"iphone-se-2022"};
function getModel(slug) { return bySlug[aliases[String(slug||"").toLowerCase()]||String(slug||"").toLowerCase()]||null; }
function rect(x,y,w,h,r,fill,stroke,width) {
 return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'" stroke-width="'+(width||1)+'"':'')+'/>';
}
function circle(x,y,r,fill,stroke,width) {
 return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'" stroke-width="'+(width||1)+'"':'')+'/>';
}
function lens(x,y,size) {
 return circle(x,y,size+3,"#536e82","#c9dce9",2)+circle(x,y,size,"#0a192b","#243e52",2)+circle(x-2,y-3,size*.5,"#173e62")+circle(x-4,y-5,2,"#a3e4ff");
}
function halo(x,y) {
 return '<g class="flash">'+circle(x,y,29,"#4be8d020","#67f3d0",2.4)+circle(x,y,15,"#58e8d036","#b7ffeb",2)+'</g>';
}
function draw(svg, modelLike, side, focus) {
 if (!svg) return;
 const m = typeof modelLike==="string"?getModel(modelLike):modelLike;
 const actual = m||bySlug["iphone-17"];
 side = side==="rear"?"rear":"front";
 const duo=actual.front==="duo";
 const H=duo?320:Math.round(Math.min(432,Math.max(385,actual.heightMm/163*431)));
 const W=duo?229:Math.round(H*actual.widthMm/actual.heightMm);
 const x=(280-W)/2,y=(470-H)/2,r=duo?20:(actual.front==="home"?27:Math.max(27,Math.round(W*.18)));
 const gx=x+W/2,bezel=actual.front==="home"?7:5;
 const grad="body-"+svg.id, screenGrad="screen-"+svg.id;
 let str='<defs><linearGradient id="'+grad+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d8e7f0"/><stop offset=".45" stop-color="#7891a5"/><stop offset="1" stop-color="#d4e5f1"/></linearGradient><linearGradient id="'+screenGrad+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1c6c8c"/><stop offset=".48" stop-color="#153850"/><stop offset="1" stop-color="#0b142b"/></linearGradient></defs>';
 str+=rect(x,y,W,H,r,"url(#"+grad+")")+rect(x+3,y+3,W-6,H-6,r-3,side==="front"?"#070f1a":"#69859a");
 // Side controls are proportional to actual model housing.
 str+=rect(x-3,y+H*.23,3,Math.max(16,H*.08),1.4,"#bdd1dd");
 str+=rect(x-3,y+H*.38,3,Math.max(24,H*.1),1.4,"#bdd1dd");
 str+=rect(x+W,y+H*.28,3,Math.max(27,H*.12),1.4,"#c4d6df");
 if(side==="front") {
   const home=actual.front==="home";
   if(home) {
     const screenY=y+H*.145,screenH=H*.715;
     str+=rect(x+7,screenY,W-14,screenH,6,"url(#"+screenGrad+")");
     str+='<path d="M '+(x+15)+' '+(screenY+screenH*.83)+' Q '+gx+' '+(screenY+screenH*.2)+' '+(x+W-13)+' '+(screenY+screenH*.65)+'" fill="none" stroke="#76daed" stroke-opacity=".22" stroke-width="3"/>';
     str+=rect(gx-17,y+H*.074,34,3,1.5,"#9db5c4")+circle(gx-32,y+H*.079,3,"#18334c");
     str+=circle(gx,y+H*.928,15,"#354d61","#a6c8d9",1.8)+circle(gx,y+H*.928,11,"#101d2c");
   } else {
     str+=rect(x+5,y+5,W-10,H-10,r-5,"url(#"+screenGrad+")");
     str+='<path d="M '+(x+14)+' '+(y+H*.68)+' Q '+gx+' '+(y+H*.2)+' '+(x+W-13)+' '+(y+H*.43)+'" fill="none" stroke="#77d0dd" stroke-opacity=".29" stroke-width="3"/>';
     if(actual.front==="notch") {
       const notchW=Math.min(101,W*.59);
       str+=rect(gx-notchW/2,y+5,notchW,25,11,"#050d17");
       str+=rect(gx-18,y+14,37,3,1.5,"#475b73")+circle(gx+notchW*.32,y+16,3,"#1d3e58");
     } else if(actual.front==="duo") {
       str+=rect(gx-32,y+14,64,14,7,"#03101c")+circle(gx+20,y+21,2,"#244764");
       str+=rect(x+4,y+2,5,H-4,2,"#b8ccdc");
     } else {
       const islandWidth=actual.front==="small-island"?44:65;
       str+=rect(gx-islandWidth/2,y+19,islandWidth,15,8,"#02101d")+circle(gx+islandWidth*.29,y+26,2.5,"#1c4764");
     }
     str+=rect(gx-20,y+H-12,40,3,2,"#bfdaeb");
   }
   // Earpiece sits in the top edge for all-screen designs, not inside the pill.
   if(!home)str+=rect(gx-16,y+3,32,2.7,1.5,"#c9e9fa");
   for(let i=0;i<5;i++){
     str+=circle(x+W*.15+i*4,y+H-1,1.25,"#a3bccc");
     str+=circle(x+W*.70+i*4,y+H-1,1.25,"#a3bccc");
   }
   const bottomY=y+H-1;
   const mark={
    top:[gx,y+(home?H*.08:4)],
    topMic:[home?gx-25:gx+19,y+(home?H*.078:(actual.front==="notch"?19:26))],
    bottom:[x+W*.76,bottomY],
    bottomMic:[x+W*.24,bottomY],
    both:[gx,y+4]
   };
   if(mark[focus])str+=halo(...mark[focus]);
 } else {
   const isProPlateau=actual.rear==="plateau-triple",isAir=actual.rear==="plateau-single";
   str+=rect(x+6,y+6,W-12,H-12,r-6,"#68869b");
   // A subtle centred back emblem, not a reproduced product photograph.
   str+=circle(gx,y+H*.51,19,"#a7c2d022");
   const ox=x+15,oy=y+20;
   const cam=actual.rear;
   let micx=x+W*.53,micy=y+66;
   const L=(dx,dy,s=12)=>lens(x+dx,y+dy,s);
   const F=(dx,dy)=>circle(x+dx,y+dy,6,"#f1e8ca","#ffeac7",1.4);
   if(cam==="single") {
     str+=L(34,40,17)+F(70,40);micx=x+72;micy=y+56;
   } else if(cam==="horizontal") {
     str+=rect(ox,y+21,78,36,18,"#3f586e","#94acbf",2);
     str+=L(34,39,12)+L(60,39,12)+F(101,39);micx=x+100;micy=y+63;
   } else if(cam==="vertical") {
     str+=rect(x+14,y+17,38,98,17,"#324d64","#adc7d7",2);
     str+=L(33,40,13)+L(33,92,13)+F(74,39);micx=x+73;micy=y+62;
   } else if(cam==="dual-square"||cam==="dual-diagonal"||cam==="dual-vertical") {
     if(cam==="dual-vertical")str+=rect(x+13,y+15,47,109,20,"#39576e","#91b4c9",2);
     else str+=rect(x+12,y+14,110,113,22,"#4d6b82","#a2becf",2);
     if(cam==="dual-diagonal")str+=L(35,39,17)+L(90,91,17);
     else str+=L(36,41,17)+L(36,95,17);
     F(cam==="dual-vertical"?87:91,38);
     micx=x+(cam==="dual-vertical"?88:96);micy=y+65;
   } else if(cam==="triple"||isProPlateau) {
     str+=rect(x+(isProPlateau?8:13),y+14,W-(isProPlateau?16:W<175?16:W*.42),isProPlateau?135:121,24,"#587487","#a4bac8",2);
     str+=L(35,42,16)+L(87,79,16)+L(35,113,16);
     F(isProPlateau?W-43:91,35);
     str+=circle(x+(isProPlateau?W-44:92),y+114,7,"#122a40","#7898ad",2);
     micx=x+(isProPlateau?W-53:91);micy=y+73;
   } else if(isAir) {
     str+=rect(x+8,y+14,W-16,78,21,"#546e83","#91afbd",2);
     str+=L(40,50,18)+F(W-37,51);
     micx=x+W-46;micy=y+75;
   } else if(cam==="duo") {
     str+=rect(x+12,y+16,W-24,76,18,"#4a6d85","#a5c1d0",2);
     str+=L(48,52,17)+L(94,52,17)+F(W-35,51);
     str+=rect(x+2,y+3,6,H-6,3,"#becfda");
     micx=x+W-40;micy=y+75;
   }
   if(focus==="rearMic")str+=halo(micx,micy);
 }
 svg.innerHTML=str;
 svg.dataset.model=actual.slug;
 svg.classList.toggle("rear",side==="rear");
 svg.setAttribute("role","img");
 svg.setAttribute("aria-label",actual.name+" "+(side==="rear"?"rear camera and microphone area":"front receiver and microphone areas")+" schematic");
}
root.IRepairDeviceCatalogue=Object.freeze({models:Object.freeze(models),getModel,render:draw});
})(window);
