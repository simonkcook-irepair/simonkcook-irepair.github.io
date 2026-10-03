/* iRepair Technician · Build 47 concise access-request wording + native notification bridge. */
(function(){
'use strict';
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-template="unlock"]');if(!b)return;const t=document.getElementById('chatText');if(t){t.value='I need to unlock the device to complete testing. Please reply so I can continue.';t.focus()}});
if(!document.querySelector('script[data-irepair-native-notifications]')){const s=document.createElement('script');s.src='/native-notifications47.js?v=47';s.dataset.irepairNativeNotifications='1';document.head.appendChild(s)}
})();
