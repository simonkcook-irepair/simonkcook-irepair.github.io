# iRepair Toolbox — Charging Diagnostics (Browser Review v2)

**Status:** Unapproved browser review prototype. **Not signed off or locked.**
**Branch:** `toolbox/charging-glass-preview-2026-10-27`
**Directory:** `toolbox/charging/preview/`
**Dedicated Vercel project:** `irepair-charging-review` (`prj_pVGZL3zZn1s4gmmYGnbY9OEzHt7l`).

## Strict preservation
Six approved prototypes (Screen, Battery, Audio, Panic, Camera, Motion & Haptics)
are locked. The separately reviewed Connectivity application has an
**approved landing page only**. Do not modify any of these assets or iRepair
Core without express permission. Charging v1 is preserved in git history
(commit `48692653af7852171643bda2e9aa7777ae12675e`).

## Design standard
Professional icy-blue glass design with signature **fully centred, shiny iPhone**.
The landing handset includes a battery, power bolt, and illuminated approaching
connector inside the phone display. Each diagnostic check has its own deliberately
composed scalable SVG illustration, not repeating emoji/clipart, implemented in
`art.js`: real-looking handset and connector, **two plug sides with a 180°
arrow**, close-up of cable-tip/port contacts, alternative accessories, wireless
pad and charging-settings scene. Lightning/USB-C connector rendering depends
on the customer-selected model. The art is an **instruction**, never real
electrical feedback. Maintain separate **DO THIS** and **WHAT TO LOOK FOR**
sections throughout.

### Eight guided checks, in order
1. **Safety:** inspect phone, cable, plug for swelling, damage, moisture or
temperature. Failure OR inability to confirm safety immediately ends powered
testing; don't reuse old powered results if safety status changes.
2. **Wired charging:** normal plug-in observation, genuine customer confirmation.
3. **Connection stability:** ask if charging already drops out or requires a
particular angle or external pressure. **Never direct deliberate wiggling,
forcing or levering**.
4. **Reversible connector:** unplug first, rotate Lightning / USB-C cable end
180°, reconnect gently, compare recognition. Mark whether both sides work
reliably and capture symptoms if not.
5. **Alternate known-good cable/adapter:** helps distinguish a worn accessory
from port or phone issues.
6. **Cable contacts and port:** examine **both cable faces** for darkened,
stained or worn contacts, inspect port entrance for fluff or damage. No
scraping or inserted tools. Only a disconnected external cable plug may be
wiped with a soft dry lint-free cloth as Apple recommends.
7. **Wireless charging:** compatible Qi setup if available.
8. **Charging behaviour:** pause / charge limits / temperature.

Each step offers customer-selected Pass / Fail / Unable, optional symptom
selection, and cautious report interpretation. In particular, position-dependent
charging, differences between the two sides of a plug, and success with another
lead are separate **triage clues**, not automatically confirmed faults.

### Electrical accuracy
Do NOT claim a single generic centre pin carries high voltage. Lightning and
USB-C contact maps differ; USB-C power is carried by multiple VBUS contacts
alongside configuration and data signals. Visual darkening does not prove
which exact circuit is faulty; some discoloration is normal with use. A
customer may need a new lead OR professional port service depending on
known-good cross-checks and inspection.

### Limits and privacy
iPhone Safari cannot independently read `UIDevice.batteryState`, the current
power source, charging current, port contact resistance or USB-C negotiation.
The customer chooses the result. The report is generated locally and has
Copy, Share, Print/PDF and technician symptom interpretations. Do not claim
an automated hardware test in the browser.

### Native iOS roadmap
Public `UIDevice` Battery Monitoring can observe actual charge-state changes,
but cannot diagnose individual connector pins, charging current, PD contract,
port flex or wireless coil. Make native source-of-evidence explicit and validate
on Lightning and USB-C physical iPhones before commercial release. See
`ios/NATIVE_ROADMAP.md`.

### Authoritative source guidance
- https://support.apple.com/en-gb/102643
- https://support.apple.com/en-gb/guide/iphone/iphbbe12ba1/ios
- https://developer.apple.com/documentation/uikit/uidevice/batterystate
- https://developerhelp.microchip.com/xwiki/bin/view/applications/usb/typec-features/cable-connector/

### Validation
Run `node toolbox/charging/preview/tests/core-tests.js`, smoke-test
Safety FAIL / UNABLE plus normal eight-step journey, inspect live iPhone Safari
artwork and verify all deployed assets match the GitHub commit. This
prototype remains **unapproved until user review**.
