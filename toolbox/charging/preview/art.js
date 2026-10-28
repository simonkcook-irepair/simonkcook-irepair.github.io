/* Charging Diagnostics v4 — premium Toolbox handset reused from the approved landing artwork.
   No separate cartoon phone. All scenes are illustrative, not hardware readouts. */
(function(root){"use strict";
const arrow='<svg class="svArrow" viewBox="0 0 100 70" aria-hidden="true"><path d="M16 48C18 10 78 5 83 45" fill="none" stroke="#158fd0" stroke-width="4.5" stroke-linecap="round"/><path d="m72 37 12 10 10-12" fill="none" stroke="#158fd0" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
function phone(which){
 const contents=which==="settings"?
 '<div class="svSettings"><div class="svSettingsTitle">Battery</div><div class="svSettingsBar"><span></span></div><div class="svSettingsLine"></div><div class="svSettingsLine short"></div><div class="svSettingsLimit">Charge limit</div></div>':
 '<div class="svChargeBattery"><div class="svBatteryFill"></div><div class="svBolt">ϟ</div></div>';
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