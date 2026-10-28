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


## Coordinated power-to-battery animation (review refinement, 28 Oct 2026)

Preserve exactly the approved icy-blue Toolbox styling, iPhone landing, green percentage meter, and 5.7-second red-to-green COB colour progression. Only add a connected-state celebration:
1. After the last green COB light activates (~5.7s), a soft, bright moving white/green flare travels left-to-right over the fully lit bar, accompanied by a brief whole-strip bloom.
2. A small upward energy bridge travels between the two meter cards (~6.6s).
3. A luminous green-white trail circles clockwise once around the upper battery percentage ring (~6.9s), ending with a brighter steady neon ring and clearer numeric glow.
4. The battery percent itself never changes because of animation. It changes only when the data engine receives a battery-level event. The animated timeline is decorative and is NOT a charge-current, power, or charging-speed readout.
5. Unplug immediately clears the connected-only energy effect while retaining evidence of an earlier measured charge rise. Reconnection triggers the sequence again. Reduced motion omits all whooshes and shows the final illuminated state without animation.

Actual Safari readings remain explicitly simulated. iOS native charging and battery level remain the eventual data source. Review pending user visual approval.


## Charging v6 — continuous energy loop and graceful reverse power-down

User approved the existing vivid red-to-green COB spectrum, initial full-bar whoosh, and battery-ring handover. The ONLY design change in v6 is the motion behaviour after that first cycle:

- On reported charging connection, the existing spectrum fills first (unchanged).
- After the initial energy transfer, a 5.6-second coordinated loop persists for the full connected session: repeated white/green energy wave over the entire colourful bar, luminous bridge between the two meters, then clockwise green energy orbit around the battery ring. The genuine percentage number is never animated/fabricated.
- On disconnect, the recurring sequence stops; the ring briefly releases its glow in reverse, the bridge falls back toward the charging bar, and the colored COB LEDs extinguish RIGHT-to-LEFT in sequence. The reverse lasts about 4 seconds and then returns to idle.
- Early disconnect samples the current display opacity of each lamp, so previously dark lamps do not light erroneously during reverse.
- Reconnecting immediately cancels the shutdown timer and restarts the initial spectrum and handover. Start/Reset cleanly restore idle.
- Reduced Motion disables every whoosh / loop / reverse motion, but maintains clear connected and unplugged states.
- The entire visual remains a decorative representation of charging recognition. Browser preview values are SIMULATED and remain clearly labelled. Native iOS monitor/reports, original approved home handset and report evidence logic remain untouched.

Implementation isolated to new `energy.css`, minor controller phase hooks in `meter-app.js`, and `index.html` versioned stylesheet import. Existing approved `meter.css` and iRepair Core main branch are not altered.


## v7 — actual moving charging-method illustrations, not static concept images

Review direction: after the approved landing and model selector, offer two animated charging paths side-by-side on iPhone. Keep the original Toolbox icy-blue glass, physically modelled premium iPhone and all previously approved green charge meters / continuous energy handover / reverse power-off.

- **Charging lead**: CSS-animated realistic metallic iPhone front and bottom charging socket; a layered silver connector and white cable rise into the socket, briefly glow on contact, and withdraw before repeating. The selected model adjusts the connector representation to Lightning for pre-2023 models and USB-C for later models. These visuals are instructions, not a claim to test actual charging contacts.
- **Wireless charger**: corresponding metallic premium iPhone floats slowly down onto a pearlescent Qi-style pad with an illuminated green rim, then gently rises, demonstrating correct placement.
- Both are real animated HTML/CSS, not a JPG or image storyboard. They use the previously approved CSS phone frame, glass, screen glint and blue shine.
- Selecting either animated card opens **the existing live-looking power & battery meters**; current session is tracked separately for each selected method. Cable is the primary default route, wireless is optional. After completing cable, user can choose wireless, skip it or review their provisional report.
- If **wireless skipped**, report says "SKIPPED — NOT ASSESSED" (neither Pass nor Fail). If not attempted, method is "NOT TESTED." Recognition, progress and interruptions for each attempted method remain separate.
- Browser modes are explicit **Safari simulations** and the selected power input is user-declared: public iOS battery APIs do not automatically distinguish Lightning/USB-C from Qi/MagSafe charging. Native app should instruct the customer to use only the selected charger while reading actual battery state; no false route identification or electrical measurements.
- New separate `choice.css` preserves `visual.css`, `meter.css` and `energy.css` byte-for-byte. Existing praise/locked landing hero and all other Toolbox tools are untouched.
- Touch-friendly side-by-side choice cards, interactive skip action and reduced-motion still views. Review pending iPhone visual approval.
