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
