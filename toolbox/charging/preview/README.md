# iRepair Toolbox — Charging Diagnostics

**Status:** Unapproved browser-review prototype · 27 October 2026. Do not mark completed or locked before user approval.
**Standalone GitHub branch:** `toolbox/charging-glass-preview-2026-10-27`
**App folder:** `toolbox/charging/preview/`
**Dedicated Vercel project:** `irepair-charging-review` (`prj_pVGZL3zZn1s4gmmYGnbY9OEzHt7l`)
**Safety:** Do not alter any of the six completed, locked prototypes: Screen, Battery, Audio, Panic, Camera, Motion & Haptics. Connectivity remains a separate unfinished review, its approved landing hero must stay unchanged. iRepair Core functionality must not be modified.

## Customer experience
Premium, icy-blue glass styling; a charging-specific shining iPhone hero with luminous battery, electrical bolt and controlled energy pulses **within the handset display**. The hero is explicitly centred with the `translate(-50%,-50%) scale(...)` transform to avoid the Connectivity v2 regression. Guided stages share the approved DO THIS → WHAT TO LOOK FOR visual pattern. No claim of live charging readout from Safari.

The six customer-observed stages:
1. Safety inspection (no moisture, swelling, unusually hot devices or damaged leads).
2. Wired charging symbol observation using a suitable wall plug.
3. Alternative known-good cable / power adapter cross-check.
4. Port visual condition / normal connector fit, *without* inserting tools or force.
5. Qi wireless charger observation, optional if accessory unavailable.
6. Charge pauses, battery limit / temperature/optimised charging education.

Each stage has Pass, Fail, Unable, optional symptoms, cautious triage, one-tap-copy report, sharing and printable PDF. On **Failed or Unable** safety inspection, the remaining powered tests do not run. Do not encourage unsafe charging of damaged or liquid-affected devices.

The browser deliberately does **not** expose or invent battery current, charge state, voltage, negotiated USB-C power, internal connector pin readings or Qi electrical coupling. All Pass/Fail/Unable are customer observations, never electrical component certifications. The user-selected model adds the expected Lightning or USB-C connector (iPhone 15 series and later: USB-C; legacy models Lightning), without treating browser device identification as certain.

## Model note
The imported catalogue covers iPhone 8 onwards and includes SE 2020/2022; all supported catalogue models have Qi charging available in a compatible setup, but the customer may not own a Qi charger. The model connection family is an aid, not a proof of actual fitted or repaired hardware.

## Native iOS implementation
See `ios/NATIVE_ROADMAP.md`. Public `UIDevice.isBatteryMonitoringEnabled`, `.batteryLevel`, `.batteryState` support genuine charge state changes (charging/full/unplugged/unknown) and percentage. They do NOT provide unrestricted current, voltage, charging-port state or wired-versus-Qi source details; such claims must not be included. Native app can substantially automate **recognition of charge-state transitions**, but not certify the individual charging port or adapter. Test native flows and interruptions on physical iPhones.

Apple support reference: https://support.apple.com/en-gb/108805
Apple public API reference: https://developer.apple.com/documentation/uikit/uidevice/isbatterymonitoringenabled
Web Battery API compatibility: https://caniuse.com/mdn-api_navigator_getbattery

## Verification
Run `node toolbox/charging/preview/tests/core-tests.js` (pure deterministic suite). Before review handover, also smoke-test six stages including safety-short-circuit, verify all static assets on live Vercel preview and compare committed changes against `main`. No ZIP file is needed for iPhone browser inspection.
