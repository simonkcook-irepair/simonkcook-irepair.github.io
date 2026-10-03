/* iRepair Core · Native Notification Bridge · Build 47
   Shared by customer app, private technician app and Repair Relay.
   Web-safe: does nothing unless running inside a native Capacitor shell.
*/
(function(g){
'use strict';
if(g.__IREPAIR_NATIVE_NOTIFICATIONS47)return;g.__IREPAIR_NATIVE_NOTIFICATIONS47=true;
const API='https://psswyljihufyxiieqziu.supabase.co/functions/v1/notification-api';
const KEY='sb_publishable_oRtVKV3yejg4521iPjNeDg_YWxa088L';
const relayToken=new URLSearchParams(location.search).get('t')||'';
const isTech=/\/tech\.html$/i.test(location.pathname);
const appVariant=isTech?'technician':'customer';
let accessToken='';let listenersBound=false;let lastRegistration=null;
const state={native:false,permission:'unknown',registered:false,error:'',appVariant,relay:!!relayToken};
function cap(){return g.Capacitor||null}
function plugin(name){const c=cap();return c&&c.Plugins&&c.Plugins[name]||null}
function isNative(){const c=cap();if(!c)return false;try{return typeof c.isNativePlatform==='function'?!!c.isNativePlatform():typeof c.getPlatform==='function'&&c.getPlatform()!=='web'}catch(e){return false}}
function emit(){try{g.dispatchEvent(new CustomEvent('irepair-notifications-change',{detail:{...state}}))}catch(e){}}
function headers(auth){const h={Accept:'application/json',apikey:KEY,Authorization:'Bearer '+(auth||KEY),'Content-Type':'application/json'};return h}
async function call(path,body,auth){const r=await fetch(API+path,{method:'POST',headers:headers(auth),body:JSON.stringify(body||{}),cache:'no-store'});const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch(e){}if(!r.ok)throw new Error(d.error||('Notification API '+r.status));return d}
function findAccessToken(){if(accessToken)return accessToken;try{const direct=localStorage.getItem('irepair_native_access_token');if(direct)return direct;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(!/^sb-.*-auth-token$/.test(k))continue;const raw=localStorage.getItem(k)||'';try{const x=JSON.parse(raw);const token=x&&((x.access_token)||(x.currentSession&&x.currentSession.access_token));if(token)return token}catch(e){}}}catch(e){}return ''}
function bundleId(){try{return cap()&&cap().getConfig&&cap().getConfig().appId||''}catch(e){return ''}}
function environment(){return /testflight|debug|sandbox/i.test(String(g.__IREPAIR_NATIVE_BUILD||''))?'sandbox':'production'}
async function backendRegister(token){const body={deviceToken:token,bundleId:bundleId(),environment:environment(),appVariant};if(relayToken)return call('/relay/register',{...body,relayToken},KEY);const auth=findAccessToken();if(!auth)throw new Error('Native app account sign-in is required before push registration');return call('/devices/register',body,auth)}
function deepLinkFromNotification(event){const n=event&&event.notification||event||{};const d=n.data||{};return d?.irepair?.deepLink||d?.deepLink||d?.irepair_deep_link||''}
function openDeepLink(path){if(!path)return;if(path.startsWith('http://')||path.startsWith('https://')){location.href=path;return}if(path.startsWith('/relay')){location.href=path;return}if(isTech&&path.startsWith('/tech/jobs/')){const ref=decodeURIComponent(path.split('/').pop()||'');location.href='/tech.html?job='+encodeURIComponent(ref);return}if(!isTech&&path.startsWith('/repairs/')){const ref=decodeURIComponent(path.split('/').pop()||'');location.href='/?repair='+encodeURIComponent(ref);return}location.href=path}
function bindListeners(){if(listenersBound)return;const Push=plugin('PushNotifications');if(!Push||!Push.addListener)return;listenersBound=true;
 Push.addListener('registration',async info=>{try{lastRegistration=info&&info.value||'';if(!lastRegistration)throw new Error('APNs token was empty');await backendRegister(lastRegistration);state.registered=true;state.error='';emit()}catch(e){state.registered=false;state.error=e instanceof Error?e.message:String(e);emit()}});
 Push.addListener('registrationError',e=>{state.registered=false;state.error=e&&e.error?String(e.error):'Push registration failed';emit()});
 Push.addListener('pushNotificationReceived',n=>{try{g.dispatchEvent(new CustomEvent('irepair-native-push',{detail:n}))}catch(e){}});
 Push.addListener('pushNotificationActionPerformed',e=>{openDeepLink(deepLinkFromNotification(e))});
}
async function check(){state.native=isNative();if(!state.native){state.permission='web';emit();return {...state}}const Push=plugin('PushNotifications');if(!Push){state.permission='plugin_missing';state.error='Native PushNotifications plugin is not available';emit();return {...state}}bindListeners();try{const p=await Push.checkPermissions();state.permission=String(p&&p.receive||'prompt');state.error='';emit();return {...state}}catch(e){state.permission='error';state.error=e instanceof Error?e.message:String(e);emit();return {...state}}}
async function enable(){state.native=isNative();if(!state.native)throw new Error('Native notifications are only available in the installed iRepair app');const Push=plugin('PushNotifications');if(!Push)throw new Error('Native PushNotifications plugin is unavailable');bindListeners();let p=await Push.checkPermissions();if(p.receive==='prompt'||p.receive==='prompt-with-rationale')p=await Push.requestPermissions();state.permission=String(p.receive||'unknown');if(p.receive!=='granted'){state.error='Notifications were not enabled on this device';emit();return {...state}}state.error='';await Push.register();emit();return {...state}}
async function preferences(patch){if(relayToken)throw new Error('Relay notification preferences are managed by the full iRepair app');const auth=findAccessToken();if(!auth)throw new Error('Sign in is required to change notification preferences');return call('/preferences',{appVariant,...patch},auth)}
function setAccessToken(token){accessToken=String(token||'')}
function nativePrompt(){if(!isNative()||document.getElementById('irepairNativeNotify47'))return;const box=document.createElement('div');box.id='irepairNativeNotify47';box.innerHTML='<div><b>🔔 Stay updated by iRepair</b><small>Get repair messages and important updates even when the app is closed.</small></div><button type="button">Enable notifications</button>';
 const css=document.createElement('style');css.textContent='#irepairNativeNotify47{position:fixed;z-index:12000;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:520px;margin:auto;padding:11px 12px;border:1px solid #7ccfff88;border-radius:17px;background:#09263ded;color:#fff;box-shadow:0 12px 32px #0007;backdrop-filter:blur(18px);display:flex;align-items:center;gap:10px}#irepairNativeNotify47>div{display:grid;gap:2px;min-width:0;flex:1}#irepairNativeNotify47 b{font-size:11px}#irepairNativeNotify47 small{font-size:8.5px;line-height:1.35;color:#a9cce2}#irepairNativeNotify47 button{border:0;border-radius:11px;background:linear-gradient(145deg,#219df0,#0872cb);color:white;padding:9px 10px;font-size:9px;font-weight:850}';document.head.appendChild(css);document.body.appendChild(box);box.querySelector('button').onclick=async()=>{const b=box.querySelector('button');b.disabled=true;b.textContent='Enabling…';try{const s=await enable();if(s.permission==='granted')box.remove();else{b.disabled=false;b.textContent='Enable notifications'}}catch(e){b.disabled=false;b.textContent='Try again'}}}
async function boot(){await check();if(state.native&&state.permission!=='granted')nativePrompt();if(state.native&&state.permission==='granted'){const Push=plugin('PushNotifications');if(Push){bindListeners();try{await Push.register()}catch(e){}}}}
g.IRepairNotifications={check,enable,setPreferences:preferences,setAccessToken,getState:()=>({...state}),openDeepLink};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot());else boot();
})(window);
