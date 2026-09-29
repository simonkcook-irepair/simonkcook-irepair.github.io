/* iRepair Core · Build 28
   Persistent broken-device background and translucent Apple-style glass surfaces. */
(function(){
  'use strict';

  const style=document.createElement('style');
  style.textContent=`
    :root{--b28-glass:rgba(246,251,255,.46);--b28-glass-strong:rgba(249,252,255,.60);--b28-edge:rgba(255,255,255,.72);--b28-shadow:0 12px 38px rgba(45,91,132,.16)}
    body{background:#dcecff!important}
    .app{background:linear-gradient(155deg,rgba(238,248,255,.52),rgba(199,227,255,.35) 55%,rgba(231,244,255,.50))!important;isolation:isolate}
    .app:before{content:""!important;position:fixed!important;z-index:-3!important;inset:78px -70px 72px -30px!important;width:auto!important;height:auto!important;border-radius:0!important;filter:none!important;background:url('/assets/irepair-broken-device-bg.jpg?v=28') center 12% / min(112vw,560px) auto no-repeat!important;opacity:.72!important;pointer-events:none!important;transform:translateZ(0)}
    .app:after{content:""!important;position:fixed!important;z-index:-2!important;inset:0!important;width:auto!important;height:auto!important;border-radius:0!important;filter:none!important;background:linear-gradient(180deg,rgba(239,248,255,.08),rgba(222,240,255,.16) 48%,rgba(236,247,255,.45) 85%,rgba(242,249,255,.72))!important;pointer-events:none!important}
    header{background:linear-gradient(180deg,rgba(239,249,255,.34),rgba(239,249,255,0));border-radius:0 0 28px 28px}
    .glass,.panel,.route-card,.b25-other-btn,.service-card,.option,.choice,.line,.sell,.tip,.inputrow,.field,.bottom-nav{background:linear-gradient(135deg,rgba(255,255,255,.58),rgba(235,247,255,.34))!important;border:1px solid var(--b28-edge)!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.78),var(--b28-shadow)!important;backdrop-filter:blur(22px) saturate(1.35)!important;-webkit-backdrop-filter:blur(22px) saturate(1.35)!important}
    .glass,.panel{border-radius:24px}
    .route-card.primary,.option[aria-pressed=true],.choice[aria-pressed=true],.service-card[aria-pressed=true],.fault[aria-pressed=true]{background:linear-gradient(135deg,rgba(213,238,255,.67),rgba(166,212,255,.48))!important;border-color:rgba(87,158,231,.62)!important}
    .bottom-nav{background:linear-gradient(110deg,rgba(250,253,255,.66),rgba(220,238,255,.48))!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.9),0 -8px 30px rgba(50,91,128,.16)!important}
    .b27-home{background:transparent!important;border-color:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding-top:0!important}
    .b27-home:before{display:none!important}
    .b27-home .b26-hero{display:none!important}
    .b27-home .route-choice{margin-top:260px!important}
    .b27-home .route-card{background:linear-gradient(135deg,rgba(255,255,255,.54),rgba(232,245,255,.32))!important;backdrop-filter:blur(24px) saturate(1.4)!important;-webkit-backdrop-filter:blur(24px) saturate(1.4)!important;border-color:rgba(255,255,255,.78)!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.92),0 12px 32px rgba(41,86,126,.16)!important}
    .b27-home .b25-other-btn{background:linear-gradient(135deg,rgba(255,255,255,.50),rgba(232,245,255,.30))!important}
    .b25-other{border-top-color:rgba(122,162,199,.24)!important}
    .route-card strong,.b25-other-btn strong,h1,h2,h3{color:#10253f!important;text-shadow:0 1px 0 rgba(255,255,255,.5)}
    .muted,.helper,.route-card small,.b25-other-btn small{color:#4c6783!important}
    @media(max-height:760px){.b27-home .route-choice{margin-top:210px!important}.app:before{inset:70px -45px 70px -20px!important;background-size:min(104vw,500px) auto!important}}
    @media(min-width:430px){.b27-home .route-choice{margin-top:280px!important}.app:before{background-size:min(108vw,570px) auto!important}}
  `;
  document.head.appendChild(style);
})();
