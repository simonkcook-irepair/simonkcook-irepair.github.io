/* iRepair Charging Diagnostics v5 — self-contained unit/regression tests.
 * node toolbox/charging/preview/tests/meter-tests.js */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const dir=path.resolve(__dirname,".."),scope={};
vm.runInNewContext(fs.readFileSync(path.join(dir,"meter-core.js"),"utf8"),{window:scope,Date});
const m=scope.IRepairChargingMeters,html=fs.readFileSync(path.join(dir,"index.html"),"utf8"),
 css=fs.readFileSync(path.join(dir,"meter.css"),"utf8"),
 energy=fs.readFileSync(path.join(dir,"energy.css"),"utf8"),
 choice=fs.readFileSync(path.join(dir,"choice.css"),"utf8"),
 app=fs.readFileSync(path.join(dir,"meter-app.js"),"utf8"),
 swift=fs.readFileSync(path.join(dir,"ios/ChargingDeviceMonitor.swift"),"utf8");
let pass=0;function ok(text,predicate){assert.ok(predicate,text);pass++}
const a=m.initial({source:"simulated",percent:61});
ok("Simulated evidence recorded",a.source==="simulated");
ok("Correct initial level",a.currentPercent===61);
ok("No charging recognised until event",!a.chargeRecognised);
ok("Progress pending on startup",m.summary(a).progress==="PENDING");
ok("Source is not asserted native",!m.summary(a).canAssert);
const loose=m.record(a,{type:"level",percent:62,at:1});
ok("Disconnected rise is not a charging pass",m.summary(loose).progress==="PENDING");
const connected=m.record(a,{type:"power",powerState:"charging",at:10});
ok("Connection is recognised on charging-state event",m.summary(connected).recognition==="PASS");
ok("Charging alone does not claim progress",m.summary(connected).progress==="PENDING");
ok("Baseline stored when charge source connected",connected.baselinePercent===61);
const success=m.record(connected,{type:"level",percent:62,at:11});
ok("True reported rise marks progress Pass",m.summary(success).progress==="PASS");
ok("Rise recorded as +1%",m.summary(success).gainSinceStart===1);
ok("Simulated Pass cannot become native hardware result",!m.summary(success).canAssert);
const off=m.record(success,{type:"power",powerState:"unplugged",at:12});
ok("Loss of charging is counted",off.interruptions===1);
ok("Previously confirmed progress retained across interruption",off.progressConfirmed);
ok("Stability is distinct from progress",m.summary(off).stability==="INTERRUPTION_OBSERVED");
const back=m.record(off,{type:"power",powerState:"charging",at:13});
ok("Reconnected state captured",back.powerState==="charging");
ok("New baseline after reattachment",back.baselinePercent===62);
const noPassAfterDisconnect=m.record(m.record(a,{type:"power",powerState:"charging",at:1}),{type:"power",powerState:"unplugged",at:2});
const changedWhileAway=m.record(noPassAfterDisconnect,{type:"level",percent:63,at:3});
ok("Battery level increase after unplug does not count",!changedWhileAway.progressConfirmed);
ok("Full battery does not automatically fail",m.summary(m.record(m.initial({percent:100}),{type:"power",powerState:"full",at:5})).progress==="NOT_APPLICABLE");
ok("Unsupported battery percent throws",(()=>{try{m.initial({percent:101});return false}catch{return true}})());
ok("Non-numeric percent throws",(()=>{try{m.record(a,{type:"level",percent:NaN});return false}catch{return true}})());
ok("Unsupported power state throws",(()=>{try{m.record(a,{type:"power",powerState:"fast-25W"});return false}catch{return true}})());
ok("Long observation does not impose timeout",!fs.readFileSync(path.join(dir,"meter-core.js"),"utf8").includes("setTimeout("));
ok("Report credits actual data only when native",m.report(success).includes("NOT A REAL HARDWARE TEST"));
ok("Simulated report never prints Charging Progress PASS",!m.report(success).includes("Charging progress: PASS"));
const nat=m.record(m.record(m.initial({source:"native",percent:61}),{type:"power",powerState:"charging",at:1}),{type:"level",percent:62,at:2});
ok("Native evidence returns Pass after real increase",m.summary(nat).progress==="PASS"&&m.summary(nat).canAssert);
ok("Native report documents genuine pass",m.report(nat).includes("Charging progress: PASS"));
ok("Report does not claim battery health",m.report(nat).includes("Battery Health: not measured"));
ok("Report disclaims amperage/watts",m.report(nat).includes("Electrical input current and watts: unavailable"));
ok("Original premium hero retained",html.includes('class="chargingHeroSvg chargingHeroV3"'));
ok("Both meters present",html.includes('id="meterDial"')&&html.includes('id="meterCobTrack"'));
ok("Battery level visibly labelled rather than battery health",html.includes("Battery charge level"));
ok("No false browser readings shown",html.includes("Simulated readings")&&html.includes("No real diagnostic result"));
ok("All demo controls available",["simConnect","simIncrease","simInterrupt","simReset"].every(id=>html.includes('id="'+id+'"')));
ok("Preview report distinguished from device result",html.includes("Preview only — not assessed"));
ok("Metres have glossy visual treatment",css.includes(".meterDialGlow")&&css.includes(".meterCobSegment"));
ok("Reduced motion accessible",css.includes("prefers-reduced-motion"));
ok("Native source subscribes to battery-state notifications",swift.includes("UIDevice.batteryStateDidChangeNotification"));
ok("Native source subscribes to battery-level notifications",swift.includes("UIDevice.batteryLevelDidChangeNotification"));
ok("Native source uses public battery monitoring",swift.includes("isBatteryMonitoringEnabled = true"));
ok("Native source increments progress only during charging",swift.includes("if state == .charging"));
ok("No invented voltage/current API",!swift.includes("batteryCurrent")&&!swift.includes("chargingWatts"));
ok("Demo JS never creates native source",!app.includes('source:"native"'));
ok("Instrument UI uses strict simulated source",app.includes('source:"simulated"'));
const ids=[...app.matchAll(/\$\("([A-Za-z0-9]+)"\)/g)].map(x=>x[1]);
const missing=[...new Set(ids)].filter(id=>!html.includes('id="'+id+'"'));
ok("All referenced DOM controls exist",missing.length===0);
new Function(app);ok("Controller syntax compiles",true);
const count=(html.match(/<section id="(?:home|setup|instrument|report)"/g)||[]).length;
ok("Correct four-screen flow",count===4);

ok("Battery dial gradient has green neon palette",html.includes('stop-color="#12e56b"')&&html.includes('stop-color="#6bff9a"'));
ok("Battery percentage uses luminous green",css.includes(".meterBatteryPanel .meterDialNumber{")&&css.includes("color:#079f57"));
ok("Circular charge ring has green glow",css.includes(".meterBatteryPanel .meterDialProgress{")&&css.includes("drop-shadow(0 0 10px #0ee96a)"));
ok("Battery level rail has luminous green filling",css.includes(".meterBatteryPanel .meterLevelFill{")&&css.includes("#48ff8d"));
ok("Charging connection segments light neon green",css.includes(".meterConnectionPanel[data-power=\"charging\"] .meterCobSegment")&&css.includes("#47ff8c"));
ok("Power disconnected is muted and neutral",css.includes(".meterConnectionPanel .meterCobSegment{")&&css.includes("#b4c7d1"));
ok("Confirmed power glow is scoped to power actually connected",css.includes('[data-progress=\"confirmed\"][data-power=\"charging\"] .meterCobSegment'));
ok("Confirmed state does not keep disconnected lights lit",!css.includes('.meterConnectionPanel[data-progress=\"confirmed\"] .meterCobSegment{'));
ok("Charged state indicator is steadier green",css.includes('[data-progress=\"confirmed\"] .meterConnectionIndicator.on{')&&css.includes("animation:none;"));
ok("Controller supplies battery status to styling",app.includes('dataset.progress=current.progressConfirmed?'));
ok("Reduced-motion choice supported for neon pulse",css.includes("neonPowerChase")&&css.includes("@media(prefers-reduced-motion:reduce)"));
ok("Overall blue glass untouched",css.includes("linear-gradient(150deg,#fffffff0 0%,#ecf9ffed 39%,#d9f0ffea 100%)"));

ok("COB lamps receive hue stops from zero to green",app.includes('String(Math.round(i*126/23))'));
ok("COB has 24 sequenced lights",app.includes('for(let i=0;i<24;i++)'));
ok("New power animation is a slow sequential spectrum reveal",css.includes("miSpectrumIgnite .33s")&&css.includes("animation-delay:calc(var(--index) * .235s)"));
ok("Spectrum changes smoothly from red through yellow to green",css.includes("hsl(var(--lamp-hue) 100% 56%)")&&css.includes("hsl(calc(var(--lamp-hue) + 5.5) 100% 53%)"));
ok("COB has travelling bright leading edge",css.includes("@keyframes miSpectrumTravel")&&css.includes("5.75s linear both"));
ok("Charging spectrum remains fully illuminated after sweep",css.includes("100%{opacity:1;transform:scaleY(1);filter:brightness(1)}"));
ok("Charging bar is not merely green pulse",css.includes("animation:none;\n background:linear-gradient(180deg,#e1edf3")&&css.includes("miSpectrumIgnite"));
ok("Disconnected segment fill explicitly resets",css.includes(':not([data-power="charging"]):not([data-power="full"]) .meterCobSegment::before'));
ok("Reduced-motion shows immediately completed spectrum",css.includes("animation:none!important;opacity:1!important;transform:none!important"));
ok("Accessibility clarifies gradient is visual not electrical measurement",app.includes("Decorative red-to-green charging connection sweep")&&app.includes("not measured as amps or watts"));
ok("Battery percentage dial remains vivid green",css.includes(".meterBatteryPanel .meterDialNumber{")&&html.includes('stop-color="#12e56b"'));
ok("Revised assets have cache busting",html.includes("charge-review-5-handover"));

ok("Synchronized battery dial contains an energy-sweep arc",html.includes('class="meterEnergySweep"')&&html.includes('class="meterEnergyHalo"'));
ok("Inter-panel energy bridge has zero layout height",html.includes('class="meterEnergyBridge"')&&css.includes(".meterEnergyBridge{position:relative;z-index:10;height:0;"));
ok("Connected status is propagated to both meters",app.includes('$("meterBatteryPanel").dataset.power=power')&&app.includes('$("instrument").dataset.power=power'));
ok("Full-bar energy whoosh waits until spectrum finishes",css.includes("miEnergyWhoosh 1.13s")&&css.includes("5.83s both"));
ok("Power meter bloom visually pulses as a whole",css.includes("@keyframes miWholeLineSurge")&&css.includes("brightness(1.35)"));
ok("Bright travel wave overlays full illuminated bar",css.includes(".meterCobTrack::before{")&&css.includes("@keyframes miEnergyWhoosh"));
ok("Rising spark bridges charging and battery instruments",css.includes("@keyframes miEnergyHandUp")&&css.includes("6.64s both"));
ok("Battery ring stays in waiting mode until after power finale",css.includes("miBatteryCircleWhoosh 1.66s")&&css.includes("6.93s both"));
ok("Battery ring sweep rotates clockwise through full circuit",css.includes("transform:rotate(-90deg);opacity:0")&&css.includes("transform:rotate(270deg);opacity:0"));
ok("Battery ring becomes noticeably brighter after visual transfer",css.includes("@keyframes miBatteryRingPowerUp")&&css.includes("drop-shadow(0 0 23px #24ff79)"));
ok("No simulated amp readings introduced",!app.includes("getBattery(")&&app.includes("not measured as amps or watts"));
ok("Unplugged state clears handover animation immediately",css.includes('#instrument[data-power="unplugged"] .meterEnergyBridge::before'));
ok("Reduced-motion turns off energy whooshes and keeps clear steady meter",css.includes(".meterBatteryPanel .meterEnergySweep,")&&css.includes(".meterBatteryPanel .meterDialProgress,")&&css.includes("animation:none!important"));
ok("Animated charging methods review version appears",html.includes("charging-glass-review-11-full-handset-single-landing")&&html.includes("charge-review-7-animated"));

ok("New energy stylesheet loaded after approved prior meter visuals",html.indexOf('meter.css?v=charge-review-5-handover')<html.indexOf('energy.css?v=charge-review-6-living'));
ok("Power connects to ongoing lighting state",app.includes('stage.dataset.energy="connected"'));
ok("Power disconnect starts reverse energy withdrawal",app.includes('stage.dataset.energy="reversing"'));
ok("Energy shutdown returns to idle once animation ends",app.includes('stage.dataset.energy="idle"')&&app.includes('},4200)'));
ok("Reconnection cancels outstanding reverse timer",app.includes("stopEnergyShutdown();")&&app.includes("clearTimeout(energyOffTimer)"));
ok("Voltage/wattage remains unavailable",energy.includes("not live amps, watts or charge rate"));
ok("Initial approved spectrum remains on initial connection",energy.includes("miEnergyWhoosh 1.13s")&&energy.includes("5.83s both"));
ok("Living COB strip pulse loops indefinitely",energy.includes("miLivingStrip 5.6s linear 8.85s infinite"));
ok("Circular energy handover pulse loops in synchrony",energy.includes("miLivingCircle 5.6s ease-in-out 8.85s infinite"));
ok("Between-meter energy flare loops in synchrony",energy.includes("miLivingBridge 5.6s ease-in-out 8.85s infinite"));
ok("Ring pulses after strip begins sweeping",energy.includes("@keyframes miLivingCircle")&&energy.includes("0%,39%{opacity:0")&&energy.includes("43%,100%{left:100%;opacity:0"));
ok("Unplug uses reverse ring animation",energy.includes("@keyframes miUnplugRing")&&energy.includes("transform:rotate(270deg)"));
ok("Unplug makes ring-to-strip reverse bridge",energy.includes("@keyframes miUnplugBridge"));
ok("Power bar drains right-to-left on unplug",energy.includes("@keyframes miUnplugFlash")&&energy.includes("100%{left:-44%;opacity:0}"));
ok("Individual COB lamps switch off right-to-left",app.includes('0.82+(23-i)*0.11')&&energy.includes("miUnplugLamp .37s ease-in-out var(--reverse-delay,1s)"));
ok("Early unplug samples actual illuminated LEDs",app.includes('getStyle(lamp,"::before").opacity')&&energy.includes("var(--reverse-opacity,1)"));
ok("UI does not mutate battery percentage during lighting",!energy.includes("batteryPercent.innerHTML")&&!energy.includes("percent="));
ok("Reduced-motion fallback disables endless and reverse effects",energy.includes("@media(prefers-reduced-motion:reduce)")&&energy.includes("animation:none!important"));
ok("Original battery meter CSS is independently retained",css.includes(".meterBatteryPanel .meterDialProgress{")&&css.includes("#48ff8d"));

ok("Two animated method choice cards exist",html.includes('id="chooseWired"')&&html.includes('id="chooseWireless"'));
ok("Animated choice screen is after model selection and before meters",html.indexOf('<section id="setup"')<html.indexOf('<section id="chooseCharge"')&&html.indexOf('<section id="chooseCharge"')<html.indexOf('<section id="instrument"'));
ok("Wired illustration uses approved premium frame",html.includes('class="phoneArt choicePhoneArt"')&&choice.includes(".choicePhone .choicePhoneArt"));
ok("Wired illustration animates cable insertion",choice.includes("@keyframes choiceCableInsert")&&choice.includes(".choicePlugGroup"));
ok("Wired choice includes real separate plug elements",html.includes('class="choicePlugTip"')&&html.includes('class="choicePlugGrip"')&&html.includes('class="choiceCableLine"'));
ok("Model selection changes Lightning vs USB-C guide",app.includes('selected&&selected.year<2023?"lightning":"usb-c"')&&choice.includes('[data-port="lightning"]'));
ok("Wireless illustration lowers phone onto pad",choice.includes("@keyframes choiceWirelessLower")&&html.includes('class="choiceChargingPad"'));
ok("Wireless charging pad has illuminated rim",choice.includes(".choicePadRing")&&choice.includes("@keyframes choicePadPulse"));
ok("Both animated choices fit side-by-side",choice.includes("grid-template-columns:minmax(0,1fr) minmax(0,1fr)"));
ok("User can explicitly skip wireless charging",html.includes('id="skipWireless"')&&app.includes("skipWirelessMethod"));
ok("Skipped wireless cannot silently become a Pass",app.includes('SKIPPED — NOT ASSESSED')&&app.includes('SKIPPED — no charger available'));
ok("Individual wired and wireless sessions retained",app.includes("methodSessions={wired:null,wireless:null}")&&app.includes("methodSessions[mode]=current"));
ok("Simulation-only claim preserved for both methods",html.includes("Safari cannot independently identify cable versus wireless input"));
ok("Method name shown in unchanged charging instrument",app.includes('"CHARGING LEAD TEST"')&&app.includes('"WIRELESS CHARGING TEST"'));
ok("Charging lead flow asks optional wireless rather than unconditionally completing",app.includes('activeMode==="wired"&&!methodSessions.wireless&&!wirelessSkipped'));
ok("Wireless first cannot bypass wired assessment",app.includes('activeMode==="wireless"&&!methodSessions.wired'));
ok("Report distinguishes method progress and interruption counts",app.includes('label+" — interruption count"')&&app.includes('label+" — charge progress"'));
ok("Report is exportable with real line breaks",app.includes('.join("\\n")'));
ok("Power meter animation CSS preserved unchanged as separate file",energy.includes("miLivingStrip 5.6s linear 8.85s infinite"));
ok("Phone user preferences for reduced motion applied to new instructions",choice.includes("@media(prefers-reduced-motion:reduce)"));
ok("Approved colour palette remains icy-blue glass",choice.includes("linear-gradient(145deg,#ffffffed 0%,#e8f8ffef 37%,#cae9fff0 100%)"));
ok("Neither animation injects fictitious battery data",!choice.includes("batteryCurrent")&&!choice.includes("chargingWatts"));

ok("Wireless-only meter skip control exists",html.includes('id="skipWirelessInTest"')&&app.includes('$("skipWirelessInTest").hidden=mode!=="wireless"'));
ok("Wireless-only skip control is wired to its action",app.includes('$("skipWirelessInTest").addEventListener("click",skipWirelessMethod)'));
ok("Wireless skip excludes any false retained session",app.includes('methodSessions.wireless=null')&&app.includes('&&!(activeMode==="wireless"&&wirelessSkipped)'));
ok("Wireless-only skip is visually hidden during wired testing",choice.includes('.meterFootActions [hidden]{display:none!important}'));
ok("Selected iPhone front silhouette updates animated illustration",app.includes('$("chooseCharge").dataset.front=selected?.front||"island"'));
ok("Notch and home-button variants appear for matching iPhone families",choice.includes('[data-front="notch"]')&&choice.includes('[data-front="home"]'));
ok("Newest choice assets are cache busted",html.includes("charge-review-7-animated-r2"));

/* v8 art-only regression: exact approved charging instrument files are outside
 * scope of this visual refinement. Real movement is validated in a browser. */
const docking=fs.readFileSync(path.join(dir,"docking.css"),"utf8");
ok("Hardware docking stylesheet added after approved v7 choices",html.indexOf("choice.css?v=")<html.indexOf("docking.css?v="));
ok("New illustration-only build marker is used",html.includes('charging-glass-review-11-full-handset-single-landing'));
ok("Physical port has speaker grilles and machined bottom edge",html.includes('class="choicePhoneBase"')&&html.includes('class="choiceAcousticGrille left"')&&html.includes('class="choiceAcousticGrille right"'));
ok("Metal charging connector retains distinct USB-C and Lightning tips",docking.includes(".choicePlugTip{")&&docking.includes('[data-port="lightning"] .choicePlugTip'));
ok("Cable tip visibly docks below the hardware port",docking.includes("@keyframes choiceCableDock")&&docking.includes("translateY(-7px)"));
ok("Wireless handset uses depth perspective rather than upright float",docking.includes("rotateX(67deg)")&&docking.includes("@keyframes choiceWirelessDock"));
ok("Wireless landing has slow contact and release phases",docking.includes("7.2s")&&docking.includes("51%,70%"));
ok("Wireless charger landing shadow and alignment guide are present",html.includes('class="choiceDockShadow"')&&html.includes('class="choiceDockGuide"'));
ok("Docking animation observes reduced motion preferences",docking.includes("@media(prefers-reduced-motion:reduce)"));
ok("Neither art-only stylesheet nor choice screen claims current readings",!docking.includes("chargingWatts")&&!docking.includes("batteryCurrent"));


const photo=fs.readFileSync(path.join(dir,"photoreal.css"),"utf8");
ok("Both methods use exactly the same source image", (html.match(/src="\.\/assets\/iphone-identical\.webp"/g)||[]).length===2);
ok("Single phone source is backed by a shared asset",html.includes('class="photoDevice photoDeviceWired"')&&html.includes('class="photoDevice photoDeviceWireless"'));
ok("Real image of Apple-style white lead used",html.includes('class="photoLead" src="./assets/apple-style-usbc.webp"'));
ok("Realistic wireless charging pad image used",html.includes('class="photoPad" src="./assets/wireless-pad.webp"'));
ok("Both hardware photos are independently animated",photo.includes("@keyframes photoLeadInsertion")&&photo.includes("@keyframes photoPhoneLanding"));
ok("Wireless iPhone has long deliberate landing hold",photo.includes("53%,73%")&&photo.includes("8s"));
ok("Both photographs are centred on same axis",photo.includes(".photoDevice {")&&photo.includes("left:50%")&&photo.includes("translateX(-50%)"));
ok("Approved previously functional meter CSS remains loaded",html.includes('meter.css?v=charge-review-5-handover')&&html.includes('energy.css?v=charge-review-6-living'));
ok("New imagery loaded after earlier choice and docking layers",html.indexOf("docking.css?v=")<html.indexOf("photoreal.css?v="));
ok("Photo styles leave earlier meter untouched",!photo.includes(".meterBatteryPanel")&&!photo.includes(".meterCobTrack")&&!photo.includes(".meterDial"));
ok("Photographic instructions support Reduce Motion",photo.includes("@media(prefers-reduced-motion:reduce)"));
ok("Both photos use the same parent art template",html.includes('class="chargeChoiceArt cableArt"')&&html.includes('class="chargeChoiceArt wirelessArt"'));
ok("Legacy port selection still represented",photo.includes('[data-port="lightning"] .photoLightningCap'));
ok("Shared image file exists",fs.existsSync(path.join(dir,"assets/iphone-identical.webp")));
ok("Apple-style lead image file exists",fs.existsSync(path.join(dir,"assets/apple-style-usbc.webp")));
ok("Charging pad image file exists",fs.existsSync(path.join(dir,"assets/wireless-pad.webp")));


const precision=fs.readFileSync(path.join(dir,"precision.css"),"utf8");
ok("Precision docking follows shared photoreal layer",html.indexOf("photoreal.css?v=")<html.indexOf("precision.css?v="));
ok("Current v11 build marker",html.includes('charging-glass-review-11-full-handset-single-landing'));
ok("Plug physically inserts behind phone rather than stopping underneath",precision.includes("translateY(var(--plug-depth))")&&precision.includes(".photoDeviceWired {z-index:6}"));
ok("Wireless lands with viewport-specific contact travel",precision.includes("--dock-travel:103px")&&precision.includes("--dock-travel:108px")&&precision.includes("--plug-depth:-92px"));
ok("Same phone preserved for both tests", html.split('src="./assets/iphone-identical.webp"').length===3);
ok("Shared handset is clipped naturally at scene edge",precision.includes(".photoDevice{top:-6px}"));
ok("Contact animations remain illustrative, no invented readings",!precision.includes("batteryCurrent")&&!precision.includes("chargingWatts"));
ok("v10 respects reduced motion",precision.includes("@media(prefers-reduced-motion:reduce)"));

/* Approved 54-second narrated review — 28 Oct 2026.
 * The artwork must show whole phones, more wired lead, a centred cordless
 * pad and ONE graceful descent with no reverse/bounce animation.
 */
const full=fs.readFileSync(path.join(dir,"full-body.css"),"utf8");
ok("Full-body art override loads after all older styles",html.indexOf("precision.css?v=")<html.indexOf("full-body.css?v="));
ok("Whole handset displayed inside both art panels",full.includes("width:min(92%,140px)")&&full.includes("top:12px!important"));
ok("Identical photographic source still appears twice",html.split('src="./assets/iphone-identical.webp"').length===3);
ok("Pad has no trailing lead visual",full.includes(".photoPad")&&full.includes("translateX(-50%)"));
ok("Cable is long and centred onto physical port",full.includes("@keyframes fullCableInsert")&&full.includes("top:149px!important")&&full.includes("translateX(-50%)"));
ok("Wireless animation descends once and keeps its final position",full.includes("@keyframes fullPhoneSingleDescent")&&full.includes("7.6s")&&full.includes("1 both!important"));
ok("No repeated up-and-down movement in v11 landing",!full.includes("infinite")&&!full.includes("alternate")&&!full.includes("reverse"));
ok("Matching centred geometry is retained on narrow screens",full.includes("@media(max-width:365px)")&&full.includes("--landing-distance:90px"));
ok("Both methods retain reduced-motion support",full.includes("@media(prefers-reduced-motion:reduce)"));
ok("Full-body art styles do not touch approved meters",!full.includes(".meterBatteryPanel")&&!full.includes(".meterCobTrack"));
const sharedImage=fs.readFileSync(path.join(dir,"assets/iphone-identical.webp"));
ok("Handset image is full body not cropped lower third",sharedImage.toString("ascii",12,16)==="VP8X"&&sharedImage.readUIntLE(27,3)+1>270);
const cableImage=fs.readFileSync(path.join(dir,"assets/apple-style-usbc.webp"));
ok("Longer braided cable graphic retains more visible lead",cableImage.toString("ascii",12,16)==="VP8X"&&cableImage.readUIntLE(27,3)+1>225);

console.log("ALL "+pass+" CHARGING INSTRUMENT CHECKS PASSED");
