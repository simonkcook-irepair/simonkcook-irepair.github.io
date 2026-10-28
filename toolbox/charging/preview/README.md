# iRepair Toolbox — Charging Diagnostics v5

**Status:** Working Safari review of the two-meter native-ready hardware diagnostics concept; NOT signed off / NOT locked.  
**Preview project:** `irepair-charging-review`  
**Working branch:** `toolbox/charging-glass-preview-2026-10-27`  
**Previous charging revisions:** preserved in Git history; the v4 landing-artwork markup and shine are preserved byte-for-byte.

## New product direction (October 2026)
The user approved separation of actual functional Hardware Diagnostics from Help & Troubleshooting. The former eight-question guided cable and port inspection was valuable technician knowledge but belongs in Help, not inside a quick global diagnostic sequence. V5 therefore removes those stages from the **active customer flow**, while retaining their code in historical revisions for eventual migration to Help & Troubleshooting.

The new customer assessment has **two premium meters**:
1. **Battery Charge Level** (the operating-system percentage, NOT the Battery Health / Maximum Capacity figure).
2. **Charging Connection** (reported charging/unplugged/full state, recognition and number of reported interruptions). A beautiful COB-style lighting display illustrates reported state, not amps, watts or an actual current waveform.

The quick global health check can register charging recognition without waiting for percentage to rise. Charge progression is **pending** until a genuine percentage increase occurs *while iOS reports charging*, at which point it automatically records a **Pass**. No 30–60 second customer countdown; no timeout-based Fail for missing progress. If 100% and full, progress is **not applicable**. An interrupted charging state is a separately documented finding and does not erase previous evidence of battery progress.

## Browser Safari preview
The dedicated `index.html` retains the exact approved v4 landing iPhone artwork, with only the surrounding "what we'll check" copy updated. The new views are in the same icy-blue glass styling as other Toolbox apps. Source files:
- `meter-core.js`: immutable event-driven state engine, explicit evidence provenance and report logic.
- `meter-app.js`: accessible browser demo interactions and copy/share/print preview report.
- `meter.css`: new premium two-meter visual system and reduced-motion fallback.
- `models.js`: unchanged model selection catalogue.
- `tests/meter-tests.js`: deterministic regression coverage.

**Important:** Safari cannot read native iPhone charging state or charge-level information. Both values and all demo interactions are **SIMULATED**, prominently labelled on the actual instrument and reports. A simulation is never claimed as a device Pass. The app does not and cannot measure electrical current, USB power, battery health, port continuity, or charger wattage.

To demonstrate: select a phone (optional), open meters, tap "Simulate power connection" (recognition appears), then "+1% charge" (progress confirmed), optionally "Disconnect" (interruption recorded), then view/copy report.

## Native iOS implementation scaffold
`ios/ChargingDeviceMonitor.swift` uses Apple's public `UIDevice` battery monitoring and level/state notifications to produce real event-driven readings. It records charging recognition, connection interruption, charge percentage and automatic progress success. This Swift source has **not yet been built or validated on a physical iPhone**. A separate fully integrated SwiftUI app, App Store signing, real-device testing and integration into the Toolbox global diagnostics orchestration remain.

The API gives charging/unplugged/full and battery-level updates; it does **not** reveal charging input amps/watts/voltage, USB Power Delivery negotiation or the physical port condition. Battery Health is a separate product workflow, not this percentage.

## Preservation and safety
No changes are made to iRepair Core's main branch, or to the approved Screen, Battery, Audio, Panic, Camera, Motion & Haptics prototypes. Connectivity's approved landing is untouched. The original Charging v4 artwork and old guided-test files remain in the repository, but are not loaded by the new active flow. The old tests must be migrated to Help & Troubleshooting only after that feature is authorised.

No one should claim successful physical-device testing until an actual signed build has been installed and tested. Browser review remains the next approval gate.


## Visual refinement — 28 October 2026 (green neon meters)
User specifically approved green neon active indicators. Preserve the app's original premium icy-blue glass shell and exact praised iPhone landing hero. The **battery percentage ring, rail fill, thumb and numeric readout** are now luminous neon green. The **charging connection COB segments, power icon and recognition indicator** become vibrant green only when charging/full is reported; at idle/disconnected they remain muted. Active charging has a soft travelling/pulsing glow; after a confirmed percentage rise the connected meter settles into a stronger, steady green. After power is disconnected it goes muted again even if an earlier charging-progress Pass persists in the report. Reduced-motion preference disables animated pulses. These changes are purely visual and do not expand Safari device access. Reviewed source: `meter.css`, `index.html` ring gradient and `meter-app.js` state hooks. Preserve as a coherent colour rule for later iOS implementation.


## Charging connection meter — smooth spectral COB animation
Review-requested visual refinement: preserve the fully approved icy-blue glass UI, the neon-green battery percentage indicator, and the exact landing iPhone. Replace only the charging connection bar's static green pulsing pattern with a theatrical, one-time left-to-right, empty-to-full progression on reported power connection. The 24 LED positions show continuous interpolated hue stops red → orange → amber → yellow → lime → green, each smoothly lighting in sequence over approximately 5.7 seconds. A softened moving highlight travels along the leading edge. At full illumination it remains steady and colorful while charging remains connected; disconnecting immediately resets to neutral grey. Accessibility prefers-reduced-motion fills immediately, without movement. This is an aesthetic charging-recognition animation, not a current/charging-rate/wattage measurement.
