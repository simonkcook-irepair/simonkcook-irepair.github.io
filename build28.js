/* iRepair Core · Build 28r3
   Persistent high-quality broken-device backdrop + translucent Apple-style glass.
   The backdrop is validated and repaired in-browser if GitHub strips the JPEG EOI marker. */
(function(){
  'use strict';

  const BACKDROP='/assets/irepair-device-backdrop.jpg?v=28r3';

  const style=document.createElement('style');
  style.id='irepair-build28-style';
  style.textContent=`
    :root{
      --irepair-bg:url('${BACKDROP}');
      --b28-edge:rgba(255,255,255,.74);
      --b28-shadow:0 15px 38px rgba(38,79,119,.15),inset 0 1px 1px rgba(255,255,255,.84);
      --b28-glass:linear-gradient(145deg,rgba(255,255,255,.48),rgba(226,243,255,.24));
    }

    html,body{background:#d8ebff!important}
    body{background:linear-gradient(160deg,#edf7ff 0%,#cfe7ff 54%,#eaf5ff 100%)!important;background-attachment:fixed!important}

    .app{
      isolation:isolate;
      background:linear-gradient(155deg,rgba(237,248,255,.28),rgba(195,225,255,.16) 56%,rgba(231,244,255,.28))!important;
      box-shadow:0 0 70px rgba(37,78,118,.12)!important;
    }
    .app:before{
      content:""!important;
      position:fixed!important;
      z-index:-2!important;
      top:52px!important;
      bottom:60px!important;
      left:50%!important;
      width:min(154vw,760px)!important;
      height:auto!important;
      transform:translateX(-50%) translateZ(0)!important;
      border-radius:0!important;
      filter:none!important;
      background-image:var(--irepair-bg)!important;
      background-position:center top!important;
      background-size:100% auto!important;
      background-repeat:no-repeat!important;
      opacity:.82!important;
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
        linear-gradient(180deg,rgba(239,249,255,.02) 0%,rgba(226,243,255,.05) 38%,rgba(234,247,255,.18) 68%,rgba(239,248,255,.48) 94%),
        radial-gradient(circle at 50% 28%,rgba(255,255,255,.02),rgba(184,220,255,.08) 62%,rgba(222,241,255,.22));
      pointer-events:none!important;
    }
    .app>*{position:relative;z-index:1}

    header{
      background:linear-gradient(180deg,rgba(244,251,255,.20),rgba(244,251,255,0))!important;
      border-radius:0 0 30px 30px;
      backdrop-filter:blur(4px)!important;
      -webkit-backdrop-filter:blur(4px)!important;
    }
    .demo-badge{
      background:rgba(248,252,255,.40)!important;
      border:1px solid rgba(255,255,255,.76)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.88),0 8px 22px rgba(54,105,153,.12)!important;
      backdrop-filter:blur(18px) saturate(1.45)!important;
      -webkit-backdrop-filter:blur(18px) saturate(1.45)!important;
    }

    .glass,.panel,.route-card,.b25-other-btn,.service-card,.option,.choice,.line,.sell,.tip,.inputrow,.field,.step,.devtab,.pill,.warning,.ok,.fault{
      background:var(--b28-glass)!important;
      border:1px solid var(--b28-edge)!important;
      box-shadow:var(--b28-shadow)!important;
      backdrop-filter:blur(22px) saturate(1.5)!important;
      -webkit-backdrop-filter:blur(22px) saturate(1.5)!important;
    }
    .glass,.panel{border-radius:24px!important}
    .field,textarea.field,select.field,input.field{
      background:linear-gradient(145deg,rgba(255,255,255,.62),rgba(238,248,255,.40))!important;
      color:#17304d!important;
    }
    .line,.option,.choice,.service-card,.fault{
      box-shadow:inset 0 1px 1px rgba(255,255,255,.76),0 8px 24px rgba(45,88,129,.11)!important;
    }
    .route-card.primary,.option[aria-pressed=true],.choice[aria-pressed=true],.service-card[aria-pressed=true],.fault[aria-pressed=true],.devtab[aria-pressed=true],.pill[aria-pressed=true]{
      background:linear-gradient(140deg,rgba(218,240,255,.66),rgba(154,205,255,.43))!important;
      border-color:rgba(67,145,229,.62)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.88),0 9px 26px rgba(40,105,174,.16)!important;
    }

    .bottom-nav{
      background:linear-gradient(120deg,rgba(250,253,255,.58),rgba(215,235,255,.38))!important;
      border:1px solid rgba(255,255,255,.78)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.92),0 -8px 28px rgba(46,91,132,.14)!important;
      backdrop-filter:blur(26px) saturate(1.5)!important;
      -webkit-backdrop-filter:blur(26px) saturate(1.5)!important;
    }

    /* Home: the broken device is the hero itself, never a framed thumbnail. */
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
      background:linear-gradient(140deg,rgba(255,255,255,.52),rgba(224,242,255,.26))!important;
      border-color:rgba(255,255,255,.80)!important;
      box-shadow:inset 0 1px 1px rgba(255,255,255,.94),0 12px 30px rgba(39,83,124,.15)!important;
      backdrop-filter:blur(26px) saturate(1.52)!important;
      -webkit-backdrop-filter:blur(26px) saturate(1.52)!important;
    }
    .b27-home .b25-other-btn{
      background:linear-gradient(140deg,rgba(255,255,255,.45),rgba(224,242,255,.22))!important;
      border-color:rgba(255,255,255,.72)!important;
    }
    .b25-other{border-top-color:rgba(103,151,194,.16)!important}

    h1,h2,h3,.route-card strong,.b25-other-btn strong{color:#10253f!important;text-shadow:0 1px 0 rgba(255,255,255,.5)}
    .muted,.helper,.route-card small,.b25-other-btn small,.line-meta,.service-body p{color:#4c6783!important}

    @media(max-height:760px){
      .app:before{top:52px!important;width:min(140vw,680px)!important;opacity:.78!important}
      .b27-home .route-choice{margin-top:242px!important}
    }
    @media(min-width:430px){
      .app:before{width:min(146vw,780px)!important}
      .b27-home .route-choice{margin-top:320px!important}
    }
    @media(prefers-reduced-transparency:reduce){
      .glass,.panel,.route-card,.b25-other-btn,.service-card,.option,.choice,.line,.sell,.tip,.inputrow,.field,.bottom-nav{background:rgba(244,250,255,.88)!important}
    }
  `;
  document.head.appendChild(style);

  /* GitHub accepted the complete JPEG body but altered its final marker on one
     upload. Validate the bytes once, append JPEG EOI only when missing, and use
     the corrected in-memory Blob. This preserves the original image quality. */
  async function hydrateBackdrop(){
    try{
      const response=await fetch(BACKDROP,{cache:'force-cache'});
      if(!response.ok) return;
      const bytes=new Uint8Array(await response.arrayBuffer());
      if(bytes.length<4 || bytes[0]!==0xff || bytes[1]!==0xd8) return;

      let imageBytes=bytes;
      const hasEOI=bytes[bytes.length-2]===0xff && bytes[bytes.length-1]===0xd9;
      if(!hasEOI){
        imageBytes=new Uint8Array(bytes.length+2);
        imageBytes.set(bytes,0);
        imageBytes[bytes.length]=0xff;
        imageBytes[bytes.length+1]=0xd9;
      }

      const objectUrl=URL.createObjectURL(new Blob([imageBytes],{type:'image/jpeg'}));
      document.documentElement.style.setProperty('--irepair-bg',`url("${objectUrl}")`);
      window.addEventListener('pagehide',()=>URL.revokeObjectURL(objectUrl),{once:true});
    }catch(error){
      console.warn('iRepair backdrop fallback active',error);
    }
  }

  hydrateBackdrop();
})();
