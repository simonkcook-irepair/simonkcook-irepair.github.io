/* Charging Diagnostics v4 — premium Toolbox handset reused from the approved landing artwork.
   No separate cartoon phone. All scenes are illustrative, not hardware readouts. */
(function(root){"use strict";
const arrow='<svg class="svArrow" viewBox="0 0 100 70" aria-hidden="true"><path d="M16 48C18 10 78 5 83 45" fill="none" stroke="#158fd0" stroke-width="4.5" stroke-linecap="round"/><path d="m72 37 12 10 10-12" fill="none" stroke="#158fd0" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
function phone(which){
 const contents=which==="settings"?
 '<div class="svSettings"><div class="svSettingsTitle">Battery</div><div class="svSettingsBar"><span></span></div><div class="svSettingsLine"></div><div class="svSettingsLine short"></div><div class="svSettingsLimit">Charge limit</div></div>':
 `<svg class="svScreenArtwork chargingHeroV3" viewBox="0 0 240 476" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
     <linearGradient id="testchargeOuter" x1="53" y1="133" x2="187" y2="339" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f7ffff"/><stop offset=".27" stop-color="#c4ffff"/><stop offset=".58" stop-color="#7ad5ed"/><stop offset="1" stop-color="#e4ffff"/>
     </linearGradient>
     <linearGradient id="testchargeFill" x1="120" y1="336" x2="120" y2="160" gradientUnits="userSpaceOnUse">
      <stop stop-color="#17b6b2"/><stop offset=".42" stop-color="#45ddce"/><stop offset="1" stop-color="#afffe8"/>
     </linearGradient>
     <radialGradient id="testchargeBloom">
      <stop stop-color="#6cfff0" stop-opacity=".52"/><stop offset=".65" stop-color="#8dfbff" stop-opacity=".14"/>
      <stop offset="1" stop-color="#7aeaff" stop-opacity="0"/>
     </radialGradient>
     <filter id="testchargeDiffuse" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <ellipse cx="120" cy="236" rx="119" ry="185" fill="url(#testchargeBloom)"/>
    <rect x="47" y="144" width="146" height="212" rx="32" fill="#7efff3" opacity=".27" filter="url(#testchargeDiffuse)"/>
    <rect x="91" y="124" width="58" height="18" rx="8" fill="#d6ffff" opacity=".93"/>
    <rect x="58" y="141" width="124" height="196" rx="27" fill="#06385c" fill-opacity=".35" stroke="url(#testchargeOuter)" stroke-width="5"/>
    <rect x="66" y="150" width="108" height="179" rx="20" fill="#06284c" fill-opacity=".35" stroke="#d6ffff" stroke-opacity=".3"/>
    <path class="chargeLevelV3" d="M69 224h102v83q0 18-18 18H87q-18 0-18-18V224Z" fill="url(#testchargeFill)" opacity=".96"/>
    <path d="M71 169q11-17 30-17h38" stroke="#f6ffff" stroke-opacity=".65" stroke-width="3.2" stroke-linecap="round"/>
    <path class="chargeBoltV3" d="M125 175 90 241h26l-8 58 46-83h-27l11-41Z" fill="#eaffff" stroke="#f9ffff" stroke-width="2" stroke-linejoin="round"/>
    <text x="120" y="378" text-anchor="middle" font-size="14" letter-spacing="3.8" font-weight="750" fill="#e4ffff" font-family="-apple-system,BlinkMacSystemFont,Arial,sans-serif">CHARGING</text>
    <path d="M106 399h28" stroke="#d6ffff" stroke-width="2" opacity=".58" stroke-linecap="round"/>
   </svg>`;
 return '<div class="svPhone" aria-hidden="true"><div class="phoneArt"><span class="side s1"></span><span class="side s2"></span><span class="side s3"></span><div class="phoneScreen"><span class="dynamicIsland"></span>'+contents+'<div class="screenGlow"></div><div class="screenGlow2"></div></div></div></div>';
}
function cable(kind,extra=""){
 const type=kind==="USB-C"?"usb":"lightning";
 return '<div class="svCable '+extra+'" aria-hidden="true"><div class="svCableTail"></div><div class="svCableBody"><div class="svCableSeam"></div></div><div class="svMetal '+type+'"><div class="svContact '+type+'"></div></div></div>';
}
function label(content,extra=""){return '<span class="svCaption '+extra+'">'+content+'</span>';}
function frame(stage,content,description){
 return '<div class="svVisual sv-'+stage+'" role="img" aria-label="'+description+'">'+content+'</div>';
}
function render(stage,kind){
 const type=kind==="USB-C"?"USB-C":"Lightning";
 const p=phone(stage==="behaviour"?"settings":"charge");
 let inside;
 switch(stage){
 case "safety":
  inside=p+cable(type,"svCableSide")+label("Check the unplugged cable and phone","svNote");break;
 case "wired":
  inside=p+cable(type,"svCablePlugIn")+label("Connect gently","svNote");break;
 case "stability":
  inside=p+cable(type,"svCableStable")+label("Does it need a particular angle?","svQuestion");break;
 case "flip":
  inside='<div class="svFlipFocus"><div class="svFlipAura"></div>'+cable(type,"svCableFlip")+'</div>'+
   arrow+label("180°","svDegrees")+label("Unplug · turn · reconnect","svInstruction");break;
 case "swap":
  inside='<div class="svBin"><span class="svBinLid"></span><span class="svBinBase"></span></div>'+
   cable(type,"svCableOld")+cable(type,"svCableNew")+
   label("Try a known-good replacement cable","svInstruction");break;
 case "port":
  inside='<div class="svEdge"><span class="svEdgePort '+(type==="USB-C"?"usb":"lightning")+'"></span><i class="svSpeaker a"></i><i class="svSpeaker b"></i></div>'+
  '<div class="svLens"><span class="svLensPort '+(type==="USB-C"?"usb":"lightning")+'"></span><span class="svLensContact"></span></div>'+
  cable(type,"svCableInspect")+label("Inspect the port and BOTH faces of the plug","svInstruction");break;
 case "wireless":
  inside='<div class="svPad"><div class="svPadRing"></div><div class="svPadLight"></div></div>'+
  p+label("Use a compatible charging pad","svInstruction");break;
 case "behaviour":
  inside=p+label("Review Battery settings and charge limits","svInstruction");break;
 default:inside=p;
 }
 const descriptions={
 safety:"Inspect a realistic iPhone and disconnected charging cable for damage",
 wired:"Connect a charging lead gently to a premium iPhone",
 stability:"Observe whether the charging cable must be held at a particular angle; do not deliberately wiggle it",
 flip:"One reversible cable connector turns 180 degrees while disconnected",
 swap:"Replace the old charging lead with a known-good cable",
 port:"A realistic phone charging port magnified to inspect connector contacts",
 wireless:"A premium iPhone above a wireless charging pad",
 behaviour:"iPhone showing its battery settings and charging limits"
 };
 return frame(stage,inside,descriptions[stage]||"iPhone charging test");
}
root.IRepairChargingArt=Object.freeze({render});
})(window);