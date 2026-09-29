/* iRepair Core · Build 27
   Visual-first Home: larger full broken-device hero, less copy, tighter actions. */
(function(){
  'use strict';
  if(typeof homeScreen!=='function') return;

  const previousHomeScreen=homeScreen;
  const style=document.createElement('style');
  style.textContent=`
    .b27-home{position:relative;overflow:hidden;padding:12px 17px 16px;margin-top:5px;background:linear-gradient(155deg,rgba(255,255,255,.94),rgba(237,248,255,.82) 52%,rgba(225,241,255,.88));}
    .b27-home:before{content:"";position:absolute;inset:-30px -20px auto;height:330px;pointer-events:none;background:radial-gradient(circle at 50% 42%,rgba(62,151,236,.22),rgba(141,202,255,.10) 38%,rgba(255,255,255,0) 72%);filter:blur(6px);}
    .b27-home>*{position:relative;z-index:1}
    .b27-home .b26-hero{height:286px;min-height:0;margin:0 0 10px;display:flex;align-items:center;justify-content:center;}
    .b27-home .b26-hero img{width:176px;height:286px;object-fit:cover;object-position:center center;border-radius:24px;border:1px solid rgba(116,157,194,.26);box-shadow:0 18px 34px rgba(28,74,112,.20);}
    .b27-home .route-choice{margin:7px 0 0;gap:9px;}
    .b27-home .route-card{min-height:78px;padding:14px 15px;border-radius:20px;}
    .b27-home .route-card strong{font-size:17px;line-height:1.2;margin-bottom:3px;}
    .b27-home .route-card small{font-size:11px;line-height:1.35;}
    .b27-home .b25-other{margin-top:12px;padding-top:11px;}
    .b27-home .b25-other-title{margin-bottom:7px;font-size:9px;}
    .b27-home .b25-other-grid{gap:8px;}
    .b27-home .b25-other-btn{min-height:70px;padding:11px 10px;border-radius:15px;}
    .b27-home .b25-other-btn strong{font-size:12px;line-height:1.2;}
    .b27-home .b25-other-btn small{margin-top:4px;font-size:9px;line-height:1.3;}
    @media (min-width:430px){
      .b27-home .b26-hero{height:302px}
      .b27-home .b26-hero img{width:186px;height:302px}
    }
  `;
  document.head.appendChild(style);

  homeScreen=function(){
    let html=previousHomeScreen();
    if(!html.includes('b25-home')) return html;

    html=html.replace('class="glass panel b25-home"','class="glass panel b25-home b27-home"');
    html=html.replace(/\s*<div class="eyebrow">WELCOME TO iREPAIR<\/div>\s*<h1>How can I help\?<\/h1>\s*<p class="muted">Choose the easiest way to start\. I’ll only show the next information when you need it\.<\/p>/,'');
    html=html.replace('I know what I need — show me prices','Get repair prices');
    html=html.replace('Choose your device, then select one or more repairs.','Choose your device and repairs');
    html=html.replace('I need help — I’m not sure what I need','Help me identify the problem');
    html=html.replace('Answer a few simple questions and iRepair will guide you.','Answer a few simple questions');
    html=html.replace('Send the app to a friend or family member who may need help.','Send to a friend');
    html=html.replace('Communicate on behalf of someone while their repair is underway.','Help with a repair');
    return html;
  };
})();
