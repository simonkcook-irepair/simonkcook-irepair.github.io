/* iRepair technician sign-in interface. Development only.
   The technician UI is hidden until a valid session exists.
   Server-side role enforcement is still required before production use. */
(function(){
  const auth=window.IRepairTechnicianAuth;
  if(!auth)return;
  const style=document.createElement('style');
  style.textContent='#irepairAuthGate{position:fixed;inset:0;z-index:2147483646;background:linear-gradient(145deg,#07192b,#0c2943);color:#fff;display:grid;place-items:center;padding:18px;font:16px system-ui}#irepairAuthGate[hidden]{display:none!important}#irepairAuthGate form{width:min(100%,420px);padding:26px;border:1px solid #77b9e5;border-radius:22px;background:#163650;box-shadow:0 18px 45px #0007}#irepairAuthGate h2{margin:0 0 10px}#irepairAuthGate input,#irepairAuthGate button{box-sizing:border-box;width:100%;padding:14px;margin-top:12px;border-radius:12px;font:inherit}#irepairAuthGate button{border:0;background:#45adff;color:#04192c;font-weight:750;cursor:pointer}#irepairAuthGate input{background:#fff;color:#102439;border:2px solid #d5eaff}#irepairAuthGate p{line-height:1.5}';
  document.head.appendChild(style);
  const gate=document.createElement('section');
  gate.id='irepairAuthGate';
  gate.setAttribute('aria-label','Technician sign in');
  gate.innerHTML='<form id="irepairAuthForm"><h2>iRepair Technician</h2><p>Sign in to access repair jobs.</p><label for="irepairAuthEmail">Email address</label><input id="irepairAuthEmail" type="email" autocomplete="email" required><div id="irepairOtpField" hidden><label for="irepairAuthCode">Email verification code</label><input id="irepairAuthCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}"></div><button id="irepairAuthSubmit" type="submit">Send sign-in code</button><p id="irepairAuthMessage" role="status" aria-live="polite"></p></form>';
  document.body.appendChild(gate);
  const form=gate.querySelector('form'),email=gate.querySelector('#irepairAuthEmail'),code=gate.querySelector('#irepairAuthCode'),otp=gate.querySelector('#irepairOtpField'),submit=gate.querySelector('button'),message=gate.querySelector('#irepairAuthMessage');
  async function assertTechnicianAccess(token){
    const response=await fetch('https://psswyljihufyxiieqziu.supabase.co/functions/v1/core-api/jobs',{
      headers:{Authorization:'Bearer '+token,apikey:window.IRepairAuthConfig.anonKey}
    });
    if(response.status===401||response.status===403)throw Error('Your account does not have technician access.');
    if(!response.ok)throw Error('Unable to verify technician access (HTTP '+response.status+').');
    return true;
  }
  let stage='email';
  form.addEventListener('submit',async function(e){
    e.preventDefault();submit.disabled=true;message.textContent='';
    try{
      if(stage==='email'){
        await auth.signIn(email.value);
        stage='code';otp.hidden=false;code.required=true;submit.textContent='Verify code';message.textContent='Check your email for the sign-in code.';
        code.focus();
      }else{
        await auth.verify(email.value,code.value);
        const token=await auth.token();
        if(!token)throw Error('No active session. Try signing in again.');
        await assertTechnicianAccess(token);
        gate.hidden=true;
        window.dispatchEvent(new Event('irepair-technician-signed-in'));
        if(window.IRepairDB&&window.IRepairDB.syncRemote)await window.IRepairDB.syncRemote();
      }
    }catch(err){message.textContent=err.message||'Unable to sign in';}
    finally{submit.disabled=false;}
  });
  auth.token().then(async token=>{if(token){await assertTechnicianAccess(token);gate.hidden=true;}}).catch(err=>{message.textContent=err.message||'Sign in required';});
})();
