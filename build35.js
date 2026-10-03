/* iRepair Core · Build 35
   Customer-facing Satellite availability. Keeps technician coordinates server-side. */
(function(){
  'use strict';
  if(typeof homeScreen!=='function')return;

  const API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/satellite-api';
  const API_KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
  const CTX_KEY='irepair_satellite_context_v1';
  let satellite=null,match=null,officeClaimToken='',loading=false,error='';

  const previousHome=homeScreen;
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  async function api(path,options){
    const o=Object.assign({method:'GET',headers:{}},options||{});
    o.headers=Object.assign({'Accept':'application/json','Authorization':'Bearer '+API_KEY,'apikey':API_KEY},o.headers||{});
    if(o.body&&typeof o.body!=='string'){o.headers['Content-Type']='application/json';o.body=JSON.stringify(o.body)}
    const r=await fetch(API+path,o);const text=await r.text();let data={};
    try{data=text?JSON.parse(text):{}}catch(e){}
    if(!r.ok)throw new Error(data.error||('HTTP '+r.status));return data;
  }
  function rerenderHome(){try{if(typeof mode!=='undefined'&&mode==='home')render()}catch(e){}}
  function readContext(){
    try{
      const raw=sessionStorage.getItem(CTX_KEY);if(!raw)return null;
      const ctx=JSON.parse(raw),exp=new Date(ctx.expiresAt||0).getTime();
      if(!ctx||!ctx.claimToken||!Number.isFinite(exp)||exp<=Date.now()){sessionStorage.removeItem(CTX_KEY);return null}
      return ctx;
    }catch(e){return null}
  }
  async function loadStatus(){
    try{const data=await api('/status');satellite=data.satellite||null;officeClaimToken=String(data.claimToken||'');error='';rerenderHome()}
    catch(e){satellite=null;officeClaimToken='';error='';}
  }
  function saveContext(type,claimToken){
    if(!claimToken)return null;
    const ctx={type:type||'satellite',mode:satellite&&satellite.mode||'',claimToken:String(claimToken),matchedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+90*60*1000).toISOString()};
    try{sessionStorage.setItem(CTX_KEY,JSON.stringify(ctx))}catch(e){}
    window.IRepairSatelliteContext=ctx;return ctx;
  }
  function clearContext(){try{sessionStorage.removeItem(CTX_KEY)}catch(e){}window.IRepairSatelliteContext=null}
  function startRepair(type){
    if(type==='office')saveContext('office',officeClaimToken);
    else if(type==='mobile'&&match&&match.claimToken)saveContext('mobile',match.claimToken);
    else clearContext();
    try{
      mode='book';stage=1;fault='';variant='';editId=null;
      if(typeof resetDiagnostic==='function')resetDiagnostic();
      const d=typeof selected==='function'?selected():null;
      if(d&&typeof basket!=='undefined'&&!basket.some(r=>r.deviceId===d.id)){d.model='';d.custom=''}
      render();window.scrollTo({top:0,behavior:'instant'});
    }catch(e){location.reload()}
  }
  function availabilityCard(){
    if(!satellite||!satellite.active)return '';
    if(satellite.officeCallIn){
      return '<div class="b35-satellite office"><div class="b35-orbit" aria-hidden="true">⌾</div><div class="b35-copy"><span class="b35-kicker">LIVE AVAILABILITY</span><strong>Killay call-in available</strong><small>A technician has repair capacity at '+esc(satellite.officeLabel||'the Killay office')+' today.</small></div><button type="button" class="b35-action" data-sat-start="office">Check repair options</button></div>';
    }
    if(!satellite.canCheckNearby)return '';
    if(match&&match.match){
      return '<div class="b35-satellite matched"><div class="b35-orbit" aria-hidden="true">⌾</div><div class="b35-copy"><span class="b35-kicker">SATELLITE MATCH</span><strong>'+esc(match.headline||'Technician nearby today')+'</strong><small>'+esc(match.message||'Fast local repair availability may be possible from the current working area.')+'</small></div><button type="button" class="b35-action" data-sat-start="mobile">Use this availability</button></div>';
    }
    if(match&&match.match===false){
      return '<div class="b35-satellite no-match"><div class="b35-orbit" aria-hidden="true">⌾</div><div class="b35-copy"><span class="b35-kicker">TECHNICIAN WORKING LOCALLY</span><strong>No fast-route match right now</strong><small>'+esc(match.message||'Normal booking is still available.')+'</small></div><button type="button" class="b35-action secondary" data-sat-normal>Book normally</button></div>';
    }
    return '<div class="b35-satellite"><div class="b35-orbit" aria-hidden="true">⌾</div><div class="b35-copy"><span class="b35-kicker">SATELLITE · LIVE</span><strong>Technician working locally today</strong><small>Share your location once to see whether a fast local repair slot is available. Your location is used for this check only.</small></div><button type="button" class="b35-action" data-sat-check '+(loading?'disabled':'')+'>'+(loading?'Checking…':'Check near me')+'</button>'+(error?'<div class="b35-error">'+esc(error)+'</div>':'')+'</div>';
  }

  homeScreen=function(){
    const html=previousHome();
    if(!html.includes('b27-home'))return html;
    const card=availabilityCard();if(!card)return html;
    return html.replace('<div class="route-choice">',card+'<div class="route-choice">');
  };

  async function checkNearby(){
    if(loading)return;
    if(!navigator.geolocation){error='Location checking is not supported on this device.';rerenderHome();return}
    loading=true;error='';match=null;rerenderHome();
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const data=await api('/match',{method:'POST',body:{latitude:pos.coords.latitude,longitude:pos.coords.longitude}});
        satellite=data.satellite||satellite;match=data;error='';
      }catch(e){error='I could not check local availability just now. Normal booking is still available.'}
      finally{loading=false;rerenderHome()}
    },()=>{loading=false;error='Location was not shared. You can still use normal booking.';rerenderHome()},{enableHighAccuracy:false,timeout:9000,maximumAge:120000});
  }

  async function claimJob(jobRef,ctx,attempt){
    if(!ctx||!ctx.claimToken||!jobRef)return;
    try{await api('/claim',{method:'POST',body:{jobRef,claimToken:ctx.claimToken}});}
    catch(e){if((attempt||0)<3)setTimeout(()=>claimJob(jobRef,ctx,(attempt||0)+1),[800,1600,3000,5000][attempt||0]);}
  }
  function hookBookingSource(){
    const db=window.IRepairDB;if(!db||typeof db.createJob!=='function'||db.createJob.__satellite35)return;
    const original=db.createJob;
    const wrapped=function(input,source){
      const job=original.call(db,input,source),ctx=readContext();
      if(job&&ctx&&['office','mobile'].includes(ctx.type))setTimeout(()=>claimJob(job.id,ctx,0),350);
      return job;
    };
    wrapped.__satellite35=true;db.createJob=wrapped;
  }

  window.addEventListener('click',function(e){
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-sat-check')){e.preventDefault();e.stopImmediatePropagation();checkNearby();return}
    if(b.hasAttribute('data-sat-start')){e.preventDefault();e.stopImmediatePropagation();startRepair(b.dataset.satStart||'satellite');return}
    if(b.hasAttribute('data-sat-normal')){e.preventDefault();e.stopImmediatePropagation();startRepair('normal');return}
  },true);

  const style=document.createElement('style');style.id='irepair-build35-style';
  style.textContent=`
    .b35-satellite{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:11px;align-items:center;margin:10px 0 12px;padding:12px;border:1px solid rgba(41,144,234,.58);border-radius:19px;background:linear-gradient(135deg,rgba(227,247,255,.90),rgba(183,225,255,.68));box-shadow:inset 0 1px 1px rgba(255,255,255,.95),0 9px 24px rgba(25,101,166,.16);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
    .b35-satellite.office{border-color:rgba(43,179,113,.58);background:linear-gradient(135deg,rgba(234,255,245,.92),rgba(195,241,218,.72))}
    .b35-satellite.matched{border-color:rgba(33,183,107,.72);background:linear-gradient(135deg,rgba(231,255,243,.94),rgba(179,239,209,.72));box-shadow:inset 0 1px 1px #fff,0 9px 25px rgba(28,149,91,.18)}
    .b35-satellite.no-match{border-color:rgba(137,171,201,.55);background:linear-gradient(135deg,rgba(245,250,255,.94),rgba(222,235,246,.76))}
    .b35-orbit{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.72);color:#0874e7;font-size:29px;box-shadow:inset 0 1px 0 #fff,0 5px 15px rgba(28,95,153,.12)}
    .office .b35-orbit,.matched .b35-orbit{color:#138b54}
    .b35-copy{min-width:0;text-align:left}.b35-copy strong{display:block;font-size:14px;line-height:1.2;color:#143e65}.b35-copy small{display:block;margin-top:3px;font-size:10px;line-height:1.35;color:#58758f}.b35-kicker{display:block;margin-bottom:3px;font-size:8px;font-weight:900;letter-spacing:.09em;color:#0874e7}.office .b35-kicker,.matched .b35-kicker{color:#117a49}
    .b35-action{border:0;border-radius:12px;background:#0874e7;color:#fff;padding:9px 10px;font-size:9px;font-weight:850;line-height:1.15;max-width:94px;box-shadow:0 5px 13px rgba(8,116,231,.22)}.b35-action:disabled{opacity:.55}.b35-action.secondary{background:#58758f}.office .b35-action,.matched .b35-action{background:#138b54}.b35-error{grid-column:2/-1;font-size:9px;line-height:1.35;color:#8a4f20}
    @media(max-width:390px){.b35-satellite{grid-template-columns:38px minmax(0,1fr);gap:9px}.b35-orbit{width:38px;height:38px;font-size:25px}.b35-action{grid-column:2;width:100%;max-width:none}.b35-copy strong{font-size:13px}}
  `;
  document.head.appendChild(style);

  const existing=readContext();if(existing)window.IRepairSatelliteContext=existing;
  hookBookingSource();loadStatus();
})();
