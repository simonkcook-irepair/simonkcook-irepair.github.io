# Native iPhone Charging Diagnostics — implementation plan
Use Swift/SwiftUI or UIKit wrapping the approved customer-friendly stage visuals. UI must stay large, simple, premium and accessible.

### Verified public API
`UIDevice.current.isBatteryMonitoringEnabled = true` before reading
`UIDevice.current.batteryState` and `batteryLevel`.
Observe `UIDevice.batteryStateDidChangeNotification` and
`UIDevice.batteryLevelDidChangeNotification`.
Interpret `.unplugged`, `.charging`, `.full`, `.unknown` conservatively.
Explicitly dispose observers and battery-monitoring changes at the correct lifecycle stage.

What this can do: show **real charging state transitions** and battery percentage changes on supported iPhones. Provide live feedback for plugging in and disconnecting a power source; control for OS notification delays and full-battery states.

What this CANNOT do using unrestricted public iOS SDK:
- Electrically probe Lightning/USB-C connector pins.
- Measure charge current/voltage, adapter watts or USB Power Delivery negotiated profile.
- Certify a particular cable, port flex, charge IC, magnetic alignment or coil.
- Universally distinguish wired charging from MagSafe/Qi by `UIDevice.batteryState`.
- Prove battery-health maximum capacity with unrestricted `UIDevice` APIs.

A native `batteryState` sample does not inherently prove healthy electrical hardware, even if the user physically connects a charging cable; still preserve user cross-checks and Pass/Fail/Unable.

### Safe sequence
Safety stop is mandatory before powered tests. No invasive physical probing instructions. Carefully distinguish damaged/liquid/swollen devices, charging-limit settings, overheating, and external power issues.
Native live `charging` status could assist the wired and wireless stages, but user may still need to physically switch sources and confirm them. Optional symptom capture, report attribution (native reading vs customer), and privacy-preserving local processing.

### Developer and device validation
Requires Apple developer credentials / signed iOS build / physical-device tests.
Test on Lightning and USB-C iPhones, full battery, low battery, damaged cables,
MagSafe/Qi, unavailable accessories, liquid alert, optimised charge limits,
interruption/background transitions, hardware permission and varying accessibility settings.
Do not sign off a native health verdict without calibrated external instrumentation where necessary.

Primary reference: https://developer.apple.com/documentation/uikit/uidevice/batterystate


## v2 charging-contact workflow (27 October 2026)
Preserve the 8-stage model introduced after technician review. The native app
may use public `UIDevice` notifications to show a *true* charge-state transition
during the customer-driven plugin/unplug/flip/alternate-lead sequence, but must
not infer a precise charging power, active source type (USB-C vs Qi), cable
oxidation, exact connector pin or port flex health from `batteryState`.

New stage evidence policy:
- **Connection stability:** ask if charging already requires a certain angle,
  or show if charging state drops under normal stationary use; do **not**
  intentionally command wiggling, leverage or pressure to induce the problem.
- **Reverse connector:** user disconnects first, then rotates plug 180 degrees.
  Observe `batteryState` only after natural reattachment. This is an
  orientation-dependent behavioural comparison, NOT an individual contact test.
- **Known-good accessory cross-check:** source conditions must be
  customer-confirmed; the native API cannot uniquely identify which cable was
  inserted or diagnose its contacts.
- **Inspect both cable faces:** customer can see discoloration, residue or
  wear. No image classifier may state a precise damaged pin without verified
  physical evidence. USB-C has multiple VBUS contacts and its pinout is
  different from Lightning.
- **Safety check must remain first and cannot be skipped** if swelling,
  water, liquid alert, hot cable or other hazard is suspected.

For the visual experience, preserve the exact premium iPhone landing framing
and separate animated illustration (instruction) from any live `UIDevice`
evidence. Add local-only report entries for charging recognition, stability,
plug orientation and alternate lead before drawing an accessory/port triage
hypothesis. App Store hardware assertions require physical-device validation.
