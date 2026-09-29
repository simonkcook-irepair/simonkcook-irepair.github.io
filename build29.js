/* iRepair Core · Build 29
   Pixel-matched Home treatment based on the approved visual concept. */
(function(){
  'use strict';

  if(typeof homeScreen!=='function') return;

  const tagIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.2 13.2 20.6a2 2 0 0 1-2.8 0L3.4 13.6a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l7.2 7.2a1.7 1.7 0 0 1 0 2.4Z"/><circle cx="8" cy="8" r="1.5"/></svg>`;
  const searchIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/></svg>`;
  const chevronIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>`;

  const previousHomeScreen=homeScreen;
  homeScreen=function(){
    let html=previousHomeScreen();
    if(!html.includes('b27-home')) return html;

    html=html.replace(
      '<button class="route-card primary" data-build25-route="known"><strong>Get repair prices</strong><small>Choose your device and repairs</small></button>',
      `<button class="route-card primary b29-route" data-build25-route="known"><span class="b29-action-icon">${tagIcon}</span><span class="b29-action-copy"><strong>Get repair prices</strong><small>Choose your device and repairs</small></span><span class="b29-chevron">${chevronIcon}</span></button>`
    );
    html=html.replace(
      '<button class="route-card" data-build25-route="help"><strong>Help me identify the problem</strong><small>Answer a few simple questions</small></button>',
      `<button class="route-card b29-route" data-build25-route="help"><span class="b29-action-icon">${searchIcon}</span><span class="b29-action-copy"><strong>Help me identify the problem</strong><small>Answer a few simple questions</small></span><span class="b29-chevron">${chevronIcon}</span></button>`
    );
    html=html.replace(
      '<button type="button" class="b25-other-btn" data-build25-share><strong>💙 Recommend iRepair</strong><small>Send to a friend</small></button>',
      `<button type="button" class="b25-other-btn b29-other-btn" data-build25-share><span class="b29-emoji" aria-hidden="true">💙</span><span class="b29-other-copy"><strong>Recommend iRepair</strong><small>Send to a friend</small></span><span class="b29-mini-chevron">${chevronIcon}</span></button>`
    );
    html=html.replace(
      '<button type="button" class="b25-other-btn" data-build25-relay><strong>🔔 Repair Relay</strong><small>Help with a repair</small></button>',
      `<button type="button" class="b25-other-btn b29-other-btn" data-build25-relay><span class="b29-emoji" aria-hidden="true">🔔</span><span class="b29-other-copy"><strong>Repair Relay</strong><small>Help with a repair</small></span><span class="b29-mini-chevron">${chevronIcon}</span></button>`
    );
    return html;
  };

  const style=document.createElement('style');
  style.id='irepair-build29-style';
  style.textContent=`
    :root{
      --b29-ink:#0d2039;
      --b29-muted:#506b88;
      --b29-blue:#0874e7;
      --b29-card:linear-gradient(140deg,rgba(252,254,255,.95),rgba(233,246,255,.89));
      --b29-edge:rgba(255,255,255,.96);
      --b29-shadow:0 10px 27px rgba(44,89,132,.13),inset 0 1px 1px rgba(255,255,255,.98);
    }

    html,body{background:#eaf5ff!important}
    body{background:linear-gradient(155deg,#f2f9ff 0%,#d9edff 55%,#edf7ff 100%)!important}
    .app{
      background-image:
        linear-gradient(180deg,rgba(242,250,255,.86),rgba(225,242,255,.91) 34%,rgba(234,247,255,.98) 100%),
        var(--irepair-bg,url('/assets/irepair-broken-device-hero.jpg?v=26)),
        linear-gradient(155deg,#f2f9ff,#d7ecff 56%,#eef8ff)!important;
      background-position:center,center -24px,center!important;
      background-size:100% 100%,145vw auto,100% 100%!important;
      background-repeat:no-repeat!important;
      box-shadow:none!important;
    }
    .app:before{
      top:78px!important;
      bottom:0!important;
      left:50%!important;
      width:min(100vw,495px)!important;
      height:auto!important;
      transform:translateX(-50%) translateZ(0)!important;
      background-position:center top!important;
      background-size:100% auto!important;
      background-repeat:no-repeat!important;
      opacity:1!important;
      filter:none!important;
    }
    .app:after{display:none!important}

    header{
      padding:14px 4px 11px!important;
      background:linear-gradient(180deg,rgba(245,251,255,.12),rgba(245,251,255,0))!important;
      border-radius:0!important;
      backdrop-filter:none!important;
      -webkit-backdrop-filter:none!important;
    }
    .demo-badge{
      background:rgba(250,253,255,.76)!important;
      border:1px solid rgba(255,255,255,.96)!important;
      box-shadow:inset 0 1px 1px #fff,0 7px 18px rgba(54,105,153,.10)!important;
      backdrop-filter:blur(18px) saturate(1.25)!important;
      -webkit-backdrop-filter:blur(18px) saturate(1.25)!important;
    }

    .b27-home{
      padding:0 4px 14px!important;
      margin-top:5px!important;
    }
    .b27-home .route-choice{
      margin:clamp(350px,calc(100vw - 34px),440px) 0 0!important;
      gap:12px!important;
    }
    .b27-home .route-card.b29-route{
      display:grid!important;
      grid-template-columns:54px minmax(0,1fr) 38px;
      align-items:center;
      column-gap:12px;
      min-height:81px!important;
      padding:12px 13px!important;
      border-radius:21px!important;
      background:var(--b29-card)!important;
      border:1px solid var(--b29-edge)!important;
      box-shadow:var(--b29-shadow)!important;
      backdrop-filter:blur(25px) saturate(1.22)!important;
      -webkit-backdrop-filter:blur(25px) saturate(1.22)!important;
    }
    .b27-home .route-card.b29-route.primary{background:var(--b29-card)!important}
    .b29-action-icon{
      width:54px;
      height:54px;
      border-radius:14px;
      display:grid;
      place-items:center;
      color:var(--b29-blue);
      background:linear-gradient(145deg,rgba(222,241,255,.96),rgba(232,246,255,.82));
      box-shadow:inset 0 1px 1px rgba(255,255,255,.95);
    }
    .b29-action-icon svg{width:31px;height:31px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .b29-action-copy{display:block;min-width:0;text-align:left}
    .b27-home .route-card.b29-route strong{
      color:var(--b29-ink)!important;
      font-size:18px!important;
      line-height:1.16!important;
      letter-spacing:-.38px;
      font-weight:830;
      margin:0 0 4px!important;
      white-space:nowrap;
      text-shadow:none!important;
    }
    .b27-home .route-card.b29-route small{
      color:var(--b29-muted)!important;
      font-size:13px!important;
      line-height:1.24!important;
    }
    .b29-chevron,.b29-mini-chevron{
      border-radius:999px;
      display:grid;
      place-items:center;
      color:#317ab9;
      background:linear-gradient(145deg,rgba(249,253,255,.92),rgba(223,241,255,.84));
      box-shadow:inset 0 1px 1px rgba(255,255,255,.98),0 3px 12px rgba(54,108,154,.08);
    }
    .b29-chevron{width:38px;height:38px}
    .b29-chevron svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}

    .b27-home .b25-other{
      margin-top:10px!important;
      padding-top:8px!important;
      border-top:0!important;
    }
    .b27-home .b25-other-title{
      margin:0 0 7px!important;
      color:#607a96!important;
      font-size:10px!important;
      line-height:1.2!important;
      letter-spacing:.13em!important;
      font-weight:850!important;
    }
    .b27-home .b25-other-grid{gap:8px!important}
    .b27-home .b25-other-btn.b29-other-btn{
      display:grid!important;
      grid-template-columns:28px minmax(0,1fr) 28px;
      align-items:center;
      column-gap:5px;
      min-height:65px!important;
      padding:9px 7px 9px 9px!important;
      border-radius:16px!important;
      background:linear-gradient(140deg,rgba(251,254,255,.93),rgba(235,247,255,.86))!important;
      border:1px solid rgba(255,255,255,.95)!important;
      box-shadow:inset 0 1px 1px #fff,0 8px 21px rgba(44,88,129,.10)!important;
      backdrop-filter:blur(22px) saturate(1.2)!important;
      -webkit-backdrop-filter:blur(22px) saturate(1.2)!important;
    }
    .b29-emoji{font-size:25px;line-height:1;text-align:center}
    .b29-other-copy{display:block;min-width:0;text-align:left}
    .b27-home .b29-other-copy strong{
      color:var(--b29-ink)!important;
      font-size:12.5px!important;
      line-height:1.18!important;
      font-weight:820!important;
      margin:0!important;
      white-space:nowrap;
      text-shadow:none!important;
    }
    .b27-home .b29-other-copy small{
      color:#647c95!important;
      font-size:10.5px!important;
      line-height:1.2!important;
      margin-top:4px!important;
      white-space:nowrap;
    }
    .b29-mini-chevron{width:28px;height:28px}
    .b29-mini-chevron svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}

    .footer-logo,.disclaimer{display:none!important}
    .bottom-nav{
      background:linear-gradient(120deg,rgba(252,254,255,.92),rgba(229,243,255,.88))!important;
      border:1px solid rgba(255,255,255,.98)!important;
      border-radius:29px 29px 0 0!important;
      box-shadow:inset 0 1px 1px #fff,0 -8px 25px rgba(46,91,132,.10)!important;
      backdrop-filter:blur(27px) saturate(1.25)!important;
      -webkit-backdrop-filter:blur(27px) saturate(1.25)!important;
    }
    .bottom-nav button{font-size:11px!important;gap:4px!important;color:#667a92!important}
    .bottom-nav button.active{color:#0871dc!important}
    .bottom-nav span{width:27px;height:27px;display:grid;place-items:center;font-size:0!important}
    .bottom-nav svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .bottom-nav button.active .b29-home-nav{fill:currentColor;stroke:none}

    @media(max-width:400px){
      .b27-home .route-card.b29-route{grid-template-columns:50px minmax(0,1fr) 34px;column-gap:10px;padding-left:11px!important;padding-right:11px!important}
      .b29-action-icon{width:50px;height:50px}
      .b27-home .route-card.b29-route strong{font-size:16px!important;letter-spacing:-.25px}
      .b27-home .route-card.b29-route small{font-size:12px!important}
      .b29-chevron{width:34px;height:34px}
      .b27-home .b25-other-btn.b29-other-btn{grid-template-columns:26px minmax(0,1fr) 24px;column-gap:4px;padding-left:7px!important;padding-right:6px!important}
      .b29-emoji{font-size:22px}
      .b27-home .b29-other-copy strong{font-size:11.5px!important}
      .b27-home .b29-other-copy small{font-size:9.5px!important}
      .b29-mini-chevron{width:24px;height:24px}
    }
    @media(max-height:780px){
      .b27-home .route-choice{margin-top:clamp(294px,calc(100vw - 78px),356px)!important}
      .b27-home .route-card.b29-route{min-height:74px!important}
      .b29-action-icon{width:48px;height:48px}
      .b27-home .b25-other-btn.b29-other-btn{min-height:60px!important}
    }
  `;
  document.head.appendChild(style);

  const navIcons={
    navHome:`<svg class="b29-home-nav" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 11.5H5V21h5v-6h4v6h5v-9.5H21.5Z"/></svg>`,
    navBook:`<svg viewBox="0 0 24 24" aria-hidden="true">${[5,9.5,14,18.5].map(y=>[7.5,12,16.5].map(x=>`<circle cx="${x}" cy="${y}" r=".8" fill="currentColor" stroke="none"/>`).join('')).join('')}</svg>`,
    navRepairs:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17a2.1 2.1 0 1 0 3 3l8.3-8.3a4 4 0 0 0 5-5L18 9l-2.4-2.4 2.3-2.3a4 4 0 0 0-3.2 2Z"/></svg>`,
    navProfile:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`
  };
  Object.entries(navIcons).forEach(([id,icon])=>{
    const span=document.querySelector(`#${id} span`);
    if(span) span.innerHTML=icon;
  });
})();
