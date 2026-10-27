/* Charging Diagnostics v2: one polished, static SVG demonstration per stage.
   These illustrations show what to look for, NOT measured or live hardware data. */
(function(root){"use strict";
const defs=`<defs>
 <linearGradient id="artGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e3ffff"/><stop offset=".2" stop-color="#78dbf8"/><stop offset=".55" stop-color="#2a94d1"/><stop offset="1" stop-color="#0c4a91"/></linearGradient>
 <linearGradient id="artScreen" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#317fb7"/><stop offset=".53" stop-color="#15568f"/><stop offset="1" stop-color="#082a54"/></linearGradient>
 <linearGradient id="artMetal" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#fff"/><stop offset=".36" stop-color="#c1e5f9"/><stop offset=".75" stop-color="#729dbc"/><stop offset="1" stop-color="#e9ffff"/></linearGradient>
 <filter id="artGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5"/></filter>
 </defs>`;
function handset(x,y,w=64,h=130){
 return `<g class="artHandset" transform="translate(${x} ${y})">
 <rect width="${w}" height="${h}" rx="16" fill="url(#artMetal)" stroke="#efffff" stroke-width="2"/>
 <rect x="5" y="5" width="${w-10}" height="${h-10}" rx="12" fill="url(#artScreen)" stroke="#70dcff" stroke-width="1.1"/>
 <rect x="${w/2-13}" y="10" width="26" height="5" rx="2.5" fill="#051c33"/>
 <circle cx="${w/2}" cy="${h/2}" r="17" fill="#71ffff" opacity=".12"/>
 <circle cx="${w/2}" cy="${h/2}" r="14" stroke="#75faff" opacity=".5" stroke-width="1.8"/>
 <path d="M${w/2-8} ${h/2}h16m-8-8v16" stroke="#bfffff" stroke-width="2.4" stroke-linecap="round"/>
 <rect x="${w/2-11}" y="${h-7}" width="22" height="3" rx="1.5" fill="#103b66"/>
 </g>`;
}
function connector(x,y,flip=false,kind="Lightning"){
 const w=kind==="USB-C"?37:30, tip=kind==="USB-C"?13:10;
 return `<g class="artConnector" transform="translate(${x} ${y}) rotate(${flip?180:0})">
 <path d="M0 34v28" stroke="#9ed1ec" stroke-width="6" stroke-linecap="round"/>
 <rect x="-22" y="11" width="44" height="30" rx="10" fill="url(#artMetal)" stroke="#ebffff" stroke-width="2"/>
 <rect x="${-w/2}" y="-9" width="${w}" height="24" rx="${kind==="USB-C"?8:3}" fill="url(#artMetal)" stroke="#edfaff" stroke-width="1.5"/>
 ${kind==="USB-C"?`<rect x="-13" y="-5" width="26" height="6" rx="3" fill="#2d6287" stroke="#a9ffff" stroke-width=".9"/>`:
 `<g fill="#d1eff5">${[-9,-6,-3,0,3,6,9].map(v=>`<rect x="${v-1}" y="-4" width="2" height="14" rx="1"/>`).join("")}</g>`}
 </g>`;
}
const ring=(x,y,r=32)=>`<circle cx="${x}" cy="${y}" r="${r}" stroke="#80eaff" stroke-opacity=".48" fill="#9cffff" fill-opacity=".075" stroke-width="1.8" stroke-dasharray="4 6"/>`;
const tick=(x,y)=>`<g stroke="#d7ffff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M${x-8} ${y}l6 6 13-15"/></g>`;
const caution=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M0-21 23 19h-46Z" fill="#fff2da" fill-opacity=".17" stroke="#ffd6a6" stroke-width="2.8"/><path d="M0-8v12" stroke="#fff4da" stroke-width="3.2" stroke-linecap="round"/><circle cy="12" r="2" fill="#fff4da"/></g>`;
const lens=(x,y)=>`<g transform="translate(${x} ${y})"><circle r="30" stroke="#e8ffff" stroke-width="4" fill="#c8faff" fill-opacity=".1"/><circle r="22" stroke="#88faff" stroke-width="1.4"/><path d="M20 21l25 26" stroke="#efffff" stroke-width="6" stroke-linecap="round"/></g>`;
const scenes={
 safety:kind=>`${handset(59,22,70,137)}${connector(209,87,false,kind)}${lens(207,67)}${caution(264,125)}${ring(94,90,80)}`,
 wired:kind=>`${handset(126,12,70,129)}${connector(161,146,false,kind)}${ring(161,76,73)}<g class="artPowerBolt" fill="#edffff"><path d="M164 41 149 83h16l-8 30 25-46h-18l9-26Z"/></g>${tick(243,87)}`,
 stability:kind=>`${handset(75,18,73,129)}${connector(111,155,false,kind)}${ring(111,116,57)}
 <path d="M195 53v80m-8-73 8-10 8 10m-16 65 8 10 8-10" stroke="#95f4ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>
 <path d="M218 45l28 28m0-28-28 28" stroke="#e3ffff" stroke-width="4" stroke-linecap="round" opacity=".65"/><circle cx="232" cy="59" r="24" fill="#65d7f5" fill-opacity=".11"/>`,
 flip:kind=>`${connector(90,93,false,kind)}${connector(231,93,true,kind)}
 <path class="artRotateArrow" d="M139 52q26-31 51 0" stroke="#e2ffff" stroke-width="4" stroke-linecap="round"/>
 <path d="m185 42 5 10 9-7" stroke="#e2ffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M181 139q-26 24-51 0" stroke="#78dfff" stroke-width="3" stroke-linecap="round"/>
 <path d="m132 149-2-10-10 7" stroke="#78dfff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
 ${ring(90,83,47)}${ring(231,94,47)}`,
 swap:kind=>`${handset(128,21,66,130)}${connector(51,90,false,kind)}${connector(270,90,false,kind)}
 <path d="M75 89h38m-9-9 9 9-9 9" stroke="#c8ffff" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
 <path d="M247 110h-36m9-9-9 9 9 9" stroke="#c8ffff" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
 ${ring(162,88,59)}`,
 port:kind=>`${connector(103,97,false,kind)}${lens(127,68)}
 <g transform="translate(220 92)"><rect x="-38" y="-22" width="77" height="46" rx="15" fill="url(#artMetal)" stroke="#f4ffff" stroke-width="2.2"/>
 <rect x="-25" y="-11" width="50" height="22" rx="8" fill="#0d3d6b" stroke="#94eaff" stroke-width="2.3"/>
 <path d="M-15-7v14M-7-7v14M1-7v14M9-7v14M17-7v14" stroke="#9feef7" stroke-width="2" opacity=".68"/></g>
 <path d="M166 93h13" stroke="#d6ffff" stroke-width="3" stroke-linecap="round"/>
 ${ring(220,91,60)}`,
 wireless:kind=>`${handset(129,14,64,125)}
 <ellipse cx="161" cy="148" rx="94" ry="20" fill="#276da2" fill-opacity=".36" stroke="#ccffff" stroke-width="2.5"/>
 <ellipse cx="161" cy="143" rx="63" ry="12" fill="#8efaff" fill-opacity=".3" stroke="#a9ffff" stroke-width="2"/>
 <ellipse class="artWirelessRing" cx="161" cy="105" rx="82" ry="30" stroke="#adffff" stroke-width="2" stroke-dasharray="5 9"/>
 <path d="M161 125V79" stroke="#eaffff" stroke-width="3" stroke-dasharray="4 5"/>
 ${ring(161,87,48)}`,
 behaviour:kind=>`${handset(80,18,74,131)}
 <g transform="translate(219 85)"><circle r="43" fill="#cffaff" fill-opacity=".11" stroke="#d7ffff" stroke-width="2.5"/>
 <circle r="32" stroke="#78eaff" stroke-dasharray="4 5" stroke-width="2"/>
 <path d="M0-24v27h19" stroke="#e8ffff" stroke-width="4" stroke-linecap="round"/>
 <circle r="4" fill="#fff"/></g>
 <rect x="100" y="73" width="33" height="50" rx="7" fill="#63f7db" fill-opacity=".22" stroke="#bcffff" stroke-width="2.3"/>
 <rect x="110" y="68" width="13" height="5" rx="2" fill="#bcffff"/>
 <rect x="105" y="94" width="24" height="24" rx="3" fill="#70ffe0" opacity=".72"/>`
};
function render(stage,kind){
 const fn=scenes[stage]||scenes.safety;
 const connectorType=kind==="USB-C"?"USB-C":"Lightning";
 return `<svg viewBox="0 0 320 185" class="chargeSceneSvg" role="img" aria-label="Illustrated ${stage} charging instruction" xmlns="http://www.w3.org/2000/svg">
 ${defs}<ellipse cx="160" cy="90" rx="126" ry="78" fill="#78eaff" fill-opacity=".09"/>
 ${fn(connectorType)}
 </svg>`;
}
root.IRepairChargingArt=Object.freeze({render});
})(window);