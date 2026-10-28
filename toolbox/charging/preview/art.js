/* Charging v4: test-stage illustrations are built from the EXACT approved
   Charging landing-page iPhone HTML, not a separate cartoon drawing.
   Static instructional visuals only — never a simulated hardware measurement. */
(function(root){"use strict";
const stages=["safety","wired","stability","flip","swap","port","wireless","behaviour"];
const labels={
 safety:"Safety inspection: iPhone and unplugged charging lead",
 wired:"Wired charging: cable gently approaching iPhone charging port",
 stability:"Connection stability: connected cable at natural rest",
 flip:"Turn an unplugged connector 180 degrees to try its other face",
 swap:"Try a replacement lead: put the old cable aside",
 port:"Inspect a charging port and both faces of a disconnected connector",
 wireless:"iPhone resting on a wireless charging pad",
 behaviour:"Charging limits and battery settings on iPhone"
};
function escape(s){return String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function approvedPhone(){
 let markup="";
 // Directly reuse, including side buttons, metal frame, Dynamic Island,
 // exact approved battery artwork and screen shine.
 if(typeof document!=="undefined"&&typeof document.querySelector==="function"){
  const home=document.querySelector("#home .chargingHero .phoneArt");
  if(home&&home.outerHTML){
   markup=home.outerHTML;
   // The home and test panels coexist: namespace cloned SVG gradient IDs
   // so Safari always resolves the stage artwork's own gradients.
   for(const id of ["chargeOuter","chargeFill","chargeBloom","chargeDiffuse"]){
    markup=markup.replaceAll('id="'+id+'"','id="'+id+'Stage"')
                 .replaceAll('url(#'+id+')','url(#'+id+'Stage)');
   }
  }
 }
 // Offline test-only fallback; real Safari always clones the approved hero.
 if(!markup)markup='<div class="phoneArt" aria-hidden="true"><span class="side s1"></span><span class="side s2"></span><span class="side s3"></span><div class="phoneScreen"><span class="dynamicIsland"></span><div class="chargingHeroSvg chargingHeroV3"></div><div class="screenGlow"></div><div class="screenGlow2"></div></div></div>';
 return '<div class="chargeApprovedDevice">'+markup+'</div>';
}
function cable(kind,extra=""){
 const type=kind==="USB-C"?"usb":"lightning";
 const contacts=Array.from({length:8},()=>'<i></i>').join("");
 return '<div class="realLead '+type+' '+extra+'" aria-hidden="true">'+
 '<div class="realLeadCord"></div><div class="realLeadCollar"></div>'+
 '<div class="realLeadGrip"><div class="realLeadSeam"></div></div>'+
 '<div class="realLeadMetal"><div class="realLeadSlot"></div>'+
 '<div class="realLeadContacts">'+contacts+'</div>'+
 '</div></div>';
}
function port(kind){
 const type=kind==="USB-C"?"usb":"lightning";
 return '<div class="macroPhoneEdge '+type+'" aria-hidden="true">'+
 '<span class="macroEdgeRim"></span><span class="macroSoundGrille left"></span>'+
 '<span class="macroConnectorPort"><i></i></span><span class="macroSoundGrille right"></span>'+
 '</div>';
}
function pad(){
 return '<div class="chargeWirelessPad"><div class="chargePadTop"></div><div class="chargePadLight"></div></div>';
}
function stageContent(stage,kind){
 switch(stage){
 case "safety":return approvedPhone()+cable(kind,"safetyCable")+
  '<span class="chargeVisualLabel one">PHONE</span><span class="chargeVisualLabel two">CHECK THE LEAD</span>';
 case "wired":return approvedPhone()+cable(kind,"connectCable")+
  '<span class="chargeStageIndication" aria-hidden="true"></span>';
 case "stability":return approvedPhone()+cable(kind,"restingCable")+
  '<span class="chargeVisualLabel one">SHOULD STAY CONNECTED</span>';
 case "flip":return '<div class="realFlipPresentation">'+cable(kind,"flipCable")+
   '<div class="flipArc" aria-hidden="true"></div>'+
   '<span class="chargeVisualLabel flipTitle">TURN 180°</span>'+
   '<span class="chargeVisualLabel flipCaption">DISCONNECT FIRST</span></div>';
 case "swap":return '<div class="oldCableGroup">'+cable(kind,"oldCable")+
   '<div class="realWasteBin"><span></span></div>'+
   '<span class="chargeVisualLabel oldCaption">SET OLD LEAD ASIDE</span></div>'+
   '<div class="newCableGroup">'+cable(kind,"newCable")+
   '<span class="chargeVisualLabel newCaption">TRY ANOTHER</span></div>';
 case "port":return '<div class="portInspection">'+port(kind)+
   '<div class="portMagnifier" aria-hidden="true">'+port(kind)+'</div>'+
   '<span class="chargeVisualLabel portCaption">INSPECT THE PORT</span>'+
   '<div class="inspectionCable">'+cable(kind,"macroCable")+'</div>'+
   '<span class="chargeVisualLabel contactsCaption">CHECK BOTH PLUG FACES</span></div>';
 case "wireless":return pad()+approvedPhone();
 case "behaviour":return approvedPhone()+'<div class="chargeSettingGlass">'+
   '<span>BATTERY</span><strong>Charging limit</strong>'+
   '<div class="settingsProgress"><i></i></div><small>Review charging settings</small>'+
   '</div>';
 default:return approvedPhone();
 }
}
function render(stage,kind){
 const id=stages.includes(stage)?stage:"safety";
 const type=kind==="USB-C"?"USB-C":"Lightning";
 return '<div class="chargeStagePhoto photo-'+id+'" data-connector="'+escape(type)+'" role="img" aria-label="'+escape(labels[id])+'">'+
 stageContent(id,type)+'</div>';
}
root.IRepairChargingArt=Object.freeze({render,stages:Object.freeze(stages)});
})(window);