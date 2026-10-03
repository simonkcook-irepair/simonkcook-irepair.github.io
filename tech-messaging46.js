/* iRepair Technician · Build 46 concise access-request wording. */
(function(){
'use strict';
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-template="unlock"]');if(!b)return;const t=document.getElementById('chatText');if(t){t.value='I need to unlock the device to complete testing. Please reply so I can continue.';t.focus()}});
})();
