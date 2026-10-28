# iRepair Toolbox — Charging Diagnostics (Browser Review v4)

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

## Design standard — v4: approved landing page is authoritative

User rejected the v2 and v3 stage art and the subsequent unrelated dark
multi-screen design mockup. **Do not introduce new palettes, phone silhouettes,
dark backgrounds, cartoon connectors or abstract technical line art.**

**APPROVED/LOCKED AS REFERENCE:** Charging v3 landing screen with the exact
shining premium iPhone, central illuminated battery symbol and diagonal
screen shine; user praised it in the video at 00:02–00:13. The v4 build
**does not modify the landing HTML/CSS**.

At runtime, `art.js` clones the actual `#home .chargingHero .phoneArt`
markup, including frame, side controls, screen, Dynamic Island,
`chargingHeroV3` battery image and diagonal shine. The cloned SVG IDs
are namespaced to avoid conflicts. The surrounding stage panels use
the approved icy-blue glass palette; any accessory imagery should be
illustrative yet realistic-looking, focused on one action. No fake live
hardware measurements.

Stages involving phone: Safety, Wired, Connection Stability, Wireless
Charging, Charging Behaviour. All reuse the same landing-page handset.
The three focused accessory demonstrations: the unplugged connector turning
180° (true Y-axis 3D rotation, not upside-down in the port), old lead being
set aside in favour of another, and enlarged charging-port/cable-contact
inspection using a circular zoom.

Video-reviewed requirements to preserve:
- 00:20–00:54: replace cartoon phone/charging lead with approved phone design
- 00:55–01:15: make a SINGLE reversible lead head visibly turn 180°
- 01:20–01:34: avoid two leads with a generic cross/tick
- 01:36–02:06: highlight port and connector contacts with zoom
- 02:08–02:34: wireless and charging-behaviour visuals must be immediately clear

**Review status: Pending user acceptance.** Do not mark visual design locked
on test results alone. The previously liked landing page is preserved.

### Reference commits
- Charging v1: `48692653af7852171643bda2e9aa7777ae12675e`
- Charging v2 logic and first stage art: `b0a492af60417e181ef9f51c71f4f4638cdc4c3f`
- Charging v3 approved landing image and rejected stages: `33317ac3e9bfbb40e779c4b086d867dbc8148530`

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
