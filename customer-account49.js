/* iRepair Core · Customer Accounts · Build 49
   Passwordless email account shell + Core customer identity + repairs/profile views.
*/
(function(g){
'use strict';
if(g.__IREPAIR_CUSTOMER_ACCOUNT49)return;g.__IREPAIR_CUSTOMER_ACCOUNT49=true;

const SUPA='https://psswyljihufyxiieqziu.supabase.co';
const KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
const ACCOUNT_API=SUPA+'/functions/v1/customer-account-api';
const SESSION_KEY='irepair_customer_session_v1';
let session=null,pendingEmail='',pendingName='',accountData=null,currentView='profile',busy=false;

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtStatus=s=>String(s||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const gbp=n=>n==null?'':('£'+Number(n).toFixed(0));

function readSession(){try{const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');return s&&s.access_token?s:null}catch(e){return null}}
function saveSession(s){session=s;if(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s));localStorage.setItem('irepair_native_access_token',s.access_token);syncNative(s.access_token)}else{localStorage.removeItem(SESSION_KEY);localStorage.removeItem('irepair_native_access_token');syncNative('')}}
function syncNative(token){try{const n=parent&&parent.IRepairNotifications;if(!n)return;n.setAccessToken(token||'');if(token)n.check().then(st=>{if(st&&st.native&&st.permission==='granted')n.enable().catch(()=>{})}).catch(()=>{})}catch(e){}}
async function authFetch(path,body,access){
  const h={apikey:KEY,'Content-Type':'application/json'};
  if(access)h.Authorization='Bearer '+access;
  const r=await fetch(SUPA+'/auth/v1'+path,{method:'POST',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(e){}
  if(!r.ok)throw new Error(d.msg||d.error_description||d.error||('Authentication '+r.status));
  return d;
}
async function refreshIfNeeded(){
  if(!session)return null;
  const exp=Number(session.expires_at||0);
  if(exp&&Date.now()/1000 < exp-90)return session;
  if(!session.refresh_token){saveSession(null);return null}
  try{
    const d=await authFetch('/token?grant_type=refresh_token',{refresh_token:session.refresh_token});
    const s={...d,expires_at:Math.floor(Date.now()/1000)+Number(d.expires_in||3600)};
    saveSession(s);return s;
  }catch(e){saveSession(null);return null}
}
async function accountCall(path,method='GET',body){
  const s=await refreshIfNeeded();if(!s)throw new Error('Please sign in again.');
  const h={apikey:KEY,Authorization:'Bearer '+s.access_token,Accept:'application/json'};
  if(body)h['Content-Type']='application/json';
  const r=await fetch(ACCOUNT_API+path,{method,headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(e){}
  if(!r.ok)throw new Error(d.error||('Account '+r.status));
  return d;
}
async function requestCode(email,name){
  pendingEmail=String(email||'').trim().toLowerCase();pendingName=String(name||'').trim();
  if(!/^\S+@\S+\.\S+$/.test(pendingEmail))throw new Error('Please enter a valid email address.');
  await authFetch('/otp',{email:pendingEmail,create_user:true,data:pendingName?{full_name:pendingName}:{}});
}
async function verifyCode(code){
  const token=String(code||'').trim().replace(/\s+/g,'');
  if(!pendingEmail||!/^[0-9]{6,8}$/.test(token))throw new Error('Enter the code from your email.');
  const d=await authFetch('/verify',{type:'email',email:pendingEmail,token});
  if(!d.access_token)throw new Error('The sign-in code could not be verified.');
  const s={...d,expires_at:Math.floor(Date.now()/1000)+Number(d.expires_in||3600)};
  saveSession(s);
  accountData=await accountCall('/bootstrap','POST',{fullName:pendingName});
  pendingEmail='';pendingName='';
}
async function loadAccount(){
  if(!session){accountData=null;return}
  try{
    const d=await accountCall('/me');
    if(d.linked===false)accountData=await accountCall('/bootstrap','POST',{});
    else accountData=d;
  }catch(e){accountData=null;throw e}
}
async function logout(){
  const s=await refreshIfNeeded();
  try{if(s)await authFetch('/logout',null,s.access_token)}catch(e){}
  saveSession(null);accountData=null;pendingEmail='';pendingName='';
}
function nativeState(){try{return parent&&parent.IRepairNotifications&&parent.IRepairNotifications.getState?parent.IRepairNotifications.getState():null}catch(e){return null}}

function ensureShell(){
  if(document.getElementById('irepairAccount49'))return;
  const style=document.createElement('style');style.id='irepairAccount49Style';style.textContent=`
#irepairAccount49{position:fixed;z-index:15000;inset:0;background:linear-gradient(155deg,#eff8ff,#d6ebff 57%,#eef6ff);overflow:auto;padding:calc(10px + env(safe-area-inset-top)) 13px calc(28px + env(safe-area-inset-bottom));display:none;color:#122b48}
#irepairAccount49.open{display:block}.a49-wrap{max-width:495px;margin:auto}.a49-top{display:flex;align-items:center;gap:10px;padding:8px 2px 14px}.a49-back{width:42px;height:42px;border:1px solid #fff;border-radius:50%;background:#ffffffb8;color:#1768bd;font-size:22px;box-shadow:0 4px 14px #3c78aa26}.a49-top h2{margin:0;font-size:22px}.a49-top small{display:block;color:#66829d;font-size:10px;margin-top:2px}.a49-card{padding:17px 15px;margin:0 0 12px;border:1px solid #fff;border-radius:24px;background:linear-gradient(140deg,#fffffff0,#f3faffc7);box-shadow:inset 0 1px 1px #fff,0 9px 26px #396f9e22}.a49-card h3{font-size:17px;margin:0 0 6px}.a49-muted{font-size:11px;line-height:1.5;color:#617b96}.a49-label{display:block;font-size:10px;font-weight:850;color:#426985;margin:12px 0 5px}.a49-input{width:100%;min-height:48px;padding:11px 12px;border:1px solid #c7e1f5;border-radius:14px;background:white;color:#122b48;font-size:14px}.a49-code{font-size:22px;letter-spacing:.16em;text-align:center;font-weight:800}.a49-btn{width:100%;min-height:48px;margin-top:12px;border:0;border-radius:18px;background:linear-gradient(145deg,#2698ee,#0871d4);color:white;font-size:13px;font-weight:850;box-shadow:0 7px 18px #0871d43a}.a49-btn.secondary{background:#e8f4ff;color:#1465ad;border:1px solid #b7d9f4;box-shadow:none}.a49-btn:disabled{opacity:.55}.a49-error{margin-top:10px;padding:9px 11px;border-radius:12px;background:#fff0ef;border:1px solid #f0b8b2;color:#8d3931;font-size:10px;line-height:1.4}.a49-ok{margin-top:10px;padding:9px 11px;border-radius:12px;background:#eaf9ef;border:1px solid #addbbb;color:#2c6942;font-size:10px;line-height:1.4}.a49-profile{display:grid;grid-template-columns:1fr auto;gap:5px 12px;align-items:center}.a49-profile strong{font-size:16px}.a49-profile span{font-size:10px;color:#6a849d}.a49-counts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.a49-count{padding:12px;border-radius:15px;background:#edf7ff;border:1px solid #cce5f7}.a49-count b{display:block;font-size:20px;color:#0e6fcb}.a49-count small{font-size:9px;color:#67839c}.a49-repair{padding:12px;margin:8px 0;border-radius:16px;background:#f8fcff;border:1px solid #d5eaf8}.a49-repair-top{display:flex;justify-content:space-between;gap:8px}.a49-repair b{font-size:12px}.a49-repair em{font-style:normal;font-size:9px;font-weight:800;color:#0a6cca;background:#e4f2ff;padding:5px 7px;border-radius:99px}.a49-repair small{display:block;margin-top:5px;color:#6b859d;font-size:9px}.a49-setting{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-top:1px solid #dbeaf5}.a49-setting:first-of-type{border-top:0}.a49-setting b{font-size:11px}.a49-setting span{display:block;font-size:9px;color:#70879c;margin-top:2px}.a49-mini{border:1px solid #afd5f0;border-radius:12px;background:#eef8ff;color:#0d67b7;padding:8px 10px;font-size:9px;font-weight:850}.a49-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}.a49-tabs button{padding:10px;border-radius:13px;border:1px solid #cce4f5;background:#eff8ff;color:#52708a;font-size:10px;font-weight:800}.a49-tabs button.on{background:#167dd9;color:#fff;border-color:#167dd9}
`;document.head.appendChild(style);
  const shell=document.createElement('div');shell.id='irepairAccount49';shell.innerHTML='<div class="a49-wrap"><div class="a49-top"><button class="a49-back" type="button" data-a49="close">‹</button><div><h2 id="a49Title">My iRepair</h2><small>Secure customer account</small></div></div><div id="a49Body"></div></div>';document.body.appendChild(shell);
}
function setMessage(msg,type='error'){const el=document.getElementById('a49Msg');if(!el)return;el.className=type==='ok'?'a49-ok':'a49-error';el.textContent=msg;el.hidden=false}
function signedOutMarkup(){
  if(pendingEmail)return `<section class="a49-card"><h3>Check your email</h3><p class="a49-muted">Enter the sign-in code sent to <b>${esc(pendingEmail)}</b>.</p><label class="a49-label" for="a49Code">SIGN-IN CODE</label><input id="a49Code" class="a49-input a49-code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="000000"><button class="a49-btn" type="button" data-a49="verify">Verify & continue</button><button class="a49-btn secondary" type="button" data-a49="change-email">Use a different email</button><div id="a49Msg" hidden></div></section><section class="a49-card"><p class="a49-muted">During development the Supabase email template must be configured to send the numeric OTP. If the email currently contains only a sign-in link, this screen is ready but the mail template has not yet been switched.</p></section>`;
  return `<section class="a49-card"><h3>Your iRepair account</h3><p class="a49-muted">Sign in without a password to keep your devices and repairs together and receive important repair updates in the installed app.</p><label class="a49-label" for="a49Name">NAME</label><input id="a49Name" class="a49-input" autocomplete="name" placeholder="Your name"><label class="a49-label" for="a49Email">EMAIL</label><input id="a49Email" class="a49-input" type="email" autocomplete="email" autocapitalize="none" placeholder="you@example.com"><button class="a49-btn" type="button" data-a49="send-code">Email me a sign-in code</button><div id="a49Msg" hidden></div></section><section class="a49-card"><h3>No password to remember</h3><p class="a49-muted">Your email is verified before Core creates or opens your customer identity. Repair data is not exposed through the public customer tables.</p></section>`;
}
function accountMarkup(){
  const d=accountData||{},a=d.account||{},c=d.customer||{},repairs=d.repairs||[],devices=d.devices||[],ns=nativeState();
  if(currentView==='repairs'){
    return `<div class="a49-tabs"><button type="button" data-a49="profile">Profile</button><button class="on" type="button">Repairs</button></div><section class="a49-card"><h3>My repairs</h3><p class="a49-muted">${repairs.length?'Your repairs linked to this secure account.':'There are no repairs linked to this account yet.'}</p>${repairs.map(r=>`<div class="a49-repair"><div class="a49-repair-top"><b>${esc(r.repair||'Repair')} · ${esc(r.id)}</b><em>${esc(fmtStatus(r.status))}</em></div><small>${esc([r.service,r.date,r.slot,gbp(r.price)].filter(Boolean).join(' · '))}</small></div>`).join('')}</section>`;
  }
  return `<div class="a49-tabs"><button class="on" type="button">Profile</button><button type="button" data-a49="repairs">Repairs</button></div><section class="a49-card"><div class="a49-profile"><div><strong>${esc(c.full_name||a.fullName||'iRepair customer')}</strong><span>${esc(a.email||c.email||'')}</span></div><span>✓ VERIFIED</span></div><div class="a49-counts"><div class="a49-count"><b>${devices.length}</b><small>SAVED DEVICES</small></div><div class="a49-count"><b>${repairs.length}</b><small>REPAIRS</small></div></div></section><section class="a49-card"><h3>Notifications</h3><div class="a49-setting"><div><b>Repair updates</b><span>${ns&&ns.native?'Native notification support detected.':'Available in the installed iRepair app.'}</span></div>${ns&&ns.native?`<button class="a49-mini" type="button" data-a49="enable-notifications">${ns.permission==='granted'?'Enabled':'Enable'}</button>`:''}</div><div class="a49-setting"><div><b>iRepair nearby</b><span>Optional alerts when mobile repair availability is near your chosen area.</span></div>${ns&&ns.native?`<button class="a49-mini" type="button" data-a49="nearby">Set area</button>`:''}</div><div id="a49Msg" hidden></div></section><section class="a49-card"><button class="a49-btn secondary" type="button" data-a49="logout">Sign out</button></section>`;
}
function render(){
  ensureShell();const body=document.getElementById('a49Body');if(!body)return;
  document.getElementById('a49Title').textContent=currentView==='repairs'?'My repairs':'My iRepair';
  body.innerHTML=session&&accountData?accountMarkup():signedOutMarkup();
}
async function open(view='profile'){
  currentView=view;ensureShell();document.getElementById('irepairAccount49').classList.add('open');render();
  if(session&&!accountData){busy=true;try{await loadAccount();render()}catch(e){setMessage(e.message||String(e))}finally{busy=false}}
}
function close(){document.getElementById('irepairAccount49')?.classList.remove('open')}

document.addEventListener('click',async e=>{
  const nav=e.target.closest&&e.target.closest('#navProfile,#navProfileShortcut,#navRepairs,#navRepairsShortcut');
  if(nav){e.preventDefault();e.stopImmediatePropagation();open(nav.id.toLowerCase().includes('repair')?'repairs':'profile');return}
  const b=e.target.closest&&e.target.closest('[data-a49]');if(!b)return;
  const action=b.dataset.a49;
  if(action==='close'){close();return}
  if(busy)return;
  if(action==='change-email'){pendingEmail='';pendingName='';render();return}
  if(action==='profile'){currentView='profile';render();return}
  if(action==='repairs'){currentView='repairs';render();return}
  busy=true;b.disabled=true;
  try{
    if(action==='send-code'){
      const email=document.getElementById('a49Email')?.value||'',name=document.getElementById('a49Name')?.value||'';
      await requestCode(email,name);render();setMessage('Code requested. Check your email.','ok');setTimeout(()=>document.getElementById('a49Code')?.focus(),40);
    }else if(action==='verify'){
      await verifyCode(document.getElementById('a49Code')?.value||'');currentView='profile';render();setMessage('You are signed in.','ok');
    }else if(action==='logout'){
      await logout();render();
    }else if(action==='enable-notifications'){
      const n=parent&&parent.IRepairNotifications;if(!n)throw new Error('Native notifications are not available in this build.');
      const s=await n.enable();render();if(s.permission==='granted')setMessage('Notifications are enabled on this device.','ok');
    }else if(action==='nearby'){
      const n=parent&&parent.IRepairNotifications;if(!n)throw new Error('Nearby alerts are only available in the installed app.');
      await n.setNearbyFromCurrentLocation(4,'My area');setMessage('Nearby repair alerts are enabled for a 4-mile area around your current location.','ok');
    }
  }catch(err){setMessage(err instanceof Error?err.message:String(err))}
  finally{busy=false;if(b&&document.contains(b))b.disabled=false}
},true);

session=readSession();if(session){syncNative(session.access_token);loadAccount().catch(()=>{});}
try{const d=document.querySelector('.disclaimer');if(d)d.textContent='Development build · Secure customer accounts are being connected to iRepair Core.'}catch(e){}
g.IRepairCustomerAccount={open,getSession:()=>session,getData:()=>accountData,refresh:loadAccount};
})(window);
