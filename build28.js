/* iRepair Core · Build 28
   Persistent high-resolution broken-device artwork + translucent Apple-style glass. */
(function(){
  'use strict';

  // Reassemble the higher-resolution WebP staged in small static chunks.
  let bgUrl='';
  try{
    if(window.__IR_BG28){
      const raw=atob(window.__IR_BG28);
      const bytes=new Uint8Array(raw.length);
      for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
      // Basic RIFF/WEBP guard so a partial/corrupt asset never replaces the fallback.
      if(raw.slice(0,4)==='RIFF' && raw.slice(8,12)==='WEBP'){
        bgUrl=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
        document.documentElement.style.setProperty('--irepair-bg',`url("${bgUrl}")`);
        window.__IR_BG28_READY=true;
      }
    }
  }catch(e){
    console.warn('Build 28 background fallback',e);
  }
  try{ delete window.__IR_BG28; }catch(e){ window.__IR_BG28=''; }

  const style=document.createElement('style');
  style.id='irepair-build28-style';
  style.textContent=`
    :root{
      --b28-edge:rgba(255,255,255,.72);
      --b28-edge-soft:rgba(255,255,255,.52);
      --b28-shadow:0 15px 38px rgba(38,79,119,.16),inset 0 1px 1px rgba(255,255,255,.82);
      --b28-glass:linear-gradient(145deg,rgba(255,255,255,.48),rgba(226,243,255,.24));
      --b28-glass-strong:linear-gradient(145deg,rgba(255,255,255,.58),rgba(227,243,255,.34));
    }

    html,body{background:#d8ebff!important}
    body{background:linear-gradient(160deg,#edf7ff 0%,#cfe7ff 54%,#eaf5ff 100%)!important;background-attachment:fixed!important}

    .app{
      isolation:isolate;
      background:linear-gradient(155deg,rgba(237,248,255,.34),rgba(195,225,255,.20) 56%,rgba(231,244,255,.34))!important;
      box-shadow:0 0 70px rgba(37,78,118,.12)!important;
    }
    .app:before{
      content:""!important;
      position:fixed!important;
      z-index:-2!important;
      top:58px!important;
      bottom:64px!important;
      left:50%!important;
      width:min(150vw,720px)!important;
      height:auto!important;
      transform:translateX(-50%) translateZ(0)!important;
      border-radius:0!important;
      filter:none!important;
      background-image:var(--irepair-bg,url('/assets/irepair-broken-device-hero.jpg?v=26'))!important;
      background-position:center top!important;
      background-size:100% auto!important;
      background-repeat:no-repeat!important;
      opacity:.72!important;
      pointer-events:none!important;
    }
    .app:after{
      content:""!important;
      position:fixed!important;
      z-index:-1!important;
      inset:0!important;
      width:auto!important;
      height:auto!important;
      border-radius:0!important;
      filter:none!important;
      background:
        linear-gradient(180deg,rgba(239,249,255,.03) 0%,rgba(226,243,255,.06) 37%,rgba(234,247,255,.24) 67%,rgba(239,248,255,.56) 93%),
        radial-gradient(circle at 50% 28%,rgba(255,255,255,.05),rgba(184,220,255,.10) 62%,rgba(222,241,255,.30));
      pointer-events:none!important;
    }
    .app>*{position:relative;z-index:1}

    header{
      background:linear-gradient(180deg,rgba(244,251,255,.26),rgba(244,251,255,0))!important;
      border-radius:0 0 30px 30px;
      backdrop-filter:blur(5px)!important;
      -webkit-backdrop-filter:blur(5px)!important;
    }
    .demo-badge{
      background:rgba(248,252,255,.42)!important;
      border:1px solid rgba(255,255,255,.72)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.85),0 8px 22px rgba(54,105,153,.12)!important;
      backdrop-filter:blur(18px) saturate(1.45)!important;
      -webkit-backdrop-filter:blur(18px) saturate(1.45)!important;
    }

    .glass,.panel,.route-card,.b25-other-btn,.service-card,.option,.choice,.line,.sell,.tip,.inputrow,.field,.step,.devtab,.pill,.warning,.ok{
      background:var(--b28-glass)!important;
      border:1px solid var(--b28-edge)!important;
      box-shadow:var(--b28-shadow)!important;
      backdrop-filter:blur(20px) saturate(1.45)!important;
      -webkit-backdrop-filter:blur(20px) saturate(1.45)!important;
    }
    .glass,.panel{border-radius:24px!important}
    .field,textarea.field,select.field,input.field{
      background:linear-gradient(145deg,rgba(255,255,255,.64),rgba(238,248,255,.43))!important;
      color:#17304d!important;
    }
    .line,.option,.choice,.service-card,.fault{
      box-shadow:inset 0 1px 1px rgba(255,255,255,.72),0 8px 24px rgba(45,88,129,.11)!important;
    }
    .fault{
      background:linear-gradient(145deg,rgba(255,255,255,.52),rgba(226,243,255,.28))!important;
      border-color:var(--b28-edge)!important;
      backdrop-filter:blur(20px) saturate(1.45)!important;
      -webkit-backdrop-filter:blur(20px) saturate(1.45)!important;
    }
    .route-card.primary,.option[aria-pressed=true],.choice[aria-pressed=true],.service-card[aria-pressed=true],.fault[aria-pressed=true],.devtab[aria-pressed=true],.pill[aria-pressed=true]{
      background:linear-gradient(140deg,rgba(218,240,255,.68),rgba(154,205,255,.46))!important;
      border-color:rgba(67,145,229,.64)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.85),0 9px 26px rgba(40,105,174,.16)!important;
    }

    .bottom-nav{
      background:linear-gradient(120deg,rgba(250,253,255,.62),rgba(215,235,255,.42))!important;
      border:1px solid rgba(255,255,255,.76)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.9),0 -8px 28px rgba(46,91,132,.14)!important;
      backdrop-filter:blur(24px) saturate(1.5)!important;
      -webkit-backdrop-filter:blur(24px) saturate(1.5)!important;
    }

    /* Home becomes visually led: no nested opaque hero box; device artwork is the page. */
    .b27-home{
      background:transparent!important;
      border-color:transparent!important;
      box-shadow:none!important;
      backdrop-filter:none!important;
      -webkit-backdrop-filter:none!important;
      padding-top:0!important;
      overflow:visible!important;
    }
    .b27-home:before{display:none!important}
    .b27-home .b26-hero{display:none!important}
    .b27-home .route-choice{margin-top:300px!important}
    .b27-home .route-card{
      background:linear-gradient(140deg,rgba(255,255,255,.56),rgba(224,242,255,.29))!important;
      border-color:rgba(255,255,255,.78)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.92),0 12px 30px rgba(39,83,124,.15)!important;
      backdrop-filter:blur(24px) saturate(1.5)!important;
      -webkit-backdrop-filter:blur(24px) saturate(1.5)!important;
    }
    .b27-home .b25-other-btn{
      background:linear-gradient(140deg,rgba(255,255,255,.49),rgba(224,242,255,.25))!important;
      border-color:rgba(255,255,255,.7)!important;
    }
    .b25-other{border-top-color:rgba(103,151,194,.18)!important}

    h1,h2,h3,.route-card strong,.b25-other-btn strong{color:#10253f!important;text-shadow:0 1px 0 rgba(255,255,255,.5)}
    .muted,.helper,.route-card small,.b25-other-btn small,.line-meta,.service-body p{color:#4c6783!important}

    @media(max-height:760px){
      .app:before{top:58px!important;width:min(136vw,650px)!important;opacity:.67!important}
      .b27-home .route-choice{margin-top:238px!important}
    }
    @media(min-width:430px){
      .app:before{width:min(142vw,740px)!important}
      .b27-home .route-choice{margin-top:320px!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .glass,.panel,.route-card,.b25-other-btn,.service-card,.option,.choice,.line,.sell,.tip,.inputrow,.field,.bottom-nav{background:rgba(244,250,255,.88)!important}
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('pagehide',function(){
    if(bgUrl){ try{ URL.revokeObjectURL(bgUrl); }catch(e){} }
  },{once:true});
})();
