/* iRepair Core · Build 26
   Compact broken-device visual for the customer Home screen. */
(function(){
  'use strict';
  if(typeof homeScreen!=='function') return;

  const previousHomeScreen=homeScreen;
  const style=document.createElement('style');
  style.textContent=`
    .b26-hero{display:flex;justify-content:center;align-items:center;margin:10px 0 2px;min-height:154px}
    .b26-hero img{display:block;width:112px;height:153px;object-fit:cover;object-position:center 38%;border-radius:19px;border:1px solid rgba(116,157,194,.38);box-shadow:0 12px 26px rgba(24,63,99,.16)}
    @media (min-width:430px){.b26-hero img{width:120px;height:164px}}
  `;
  document.head.appendChild(style);

  homeScreen=function(){
    const html=previousHomeScreen();
    if(!html.includes('b25-home')) return html;
    const hero='<div class="b26-hero" aria-hidden="true"><img src="/assets/irepair-broken-device-hero.jpg?v=26" alt="" loading="eager" decoding="async"></div>';
    return html.replace('<div class="route-choice">',hero+'<div class="route-choice">');
  };
})();
