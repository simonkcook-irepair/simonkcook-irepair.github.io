# iRepair Toolbox — Motion & Haptics Diagnostics

**Status:** New, UNAPPROVED browser review candidate · 26 October 2026.
**Independent source branch:** `toolbox/motion-haptics-glass-preview-2026-10-26`
**Directory:** `toolbox/motion/preview/`
**Vercel project:** `prj_HYytm3JBh9VIYYoq34sM3JHBez0D` (`irepair-motion-haptics-review`).

## Safeguards
- **Do not change any of the five user-locked iRepair Toolbox prototypes** (Screen, Battery, Audio, Panic or Camera Diagnostics), their production deployments, files or locks.
- Copied the approved camera glass theme to this app to achieve consistent branding without importing or editing the camera's locked sources.
- The source/model schematic is a visual aid, not a sensor result.
- Never simulate sensor data. Motion readings come only from browser `devicemotion` and `deviceorientation` events after an explicit permission gesture, and display '—' unless numerical data is actually received.
- Sensor listeners are released on completion, exit, tab-backgrounding and pagehide. No persistence, analytics or upload.
- Pass / Fail / Unable choices are **customer-scored**. Missing browser data cannot be treated as proof of hardware failure.
- Compass and proximity use guided observations in Apple's apps/system call UI. iOS Safari does not independently expose the physical sensor for those checks.
- Haptic request is attempted only if the browser exposes `navigator.vibrate` and only when tapped. Vibration request does NOT validate the Taptic Engine. iPhone Safari generally lacks a programmable vibration interface; customer checks a system haptic and records what they felt.

## Six stages
1. Accelerometer: browser X/Y/Z acceleration including gravity, in m/s² where available.
2. Gyroscope: browser rotationRate α/β/γ, in degrees/s where exposed.
3. Orientation: browser deviceorientation pitch/roll/yaw, in degrees; the handset graphic follows genuine received data.
4. Compass: observe Apple's Compass app. Magnetic interference/calibration cautions.
5. Haptics: attempt browser vibration if supported, otherwise use native iPhone Sounds & Haptics system interaction.
6. Proximity: guided normal-call near-ear display blank/wake observation.

All stages provide Pass, Fail, Unable to Test. Failed stages offer symptom checkboxes; reports retain evidence provenance, privacy and technician notes; one-tap clipboard copy, share and print/PDF are offered.

## Browser review vs native roadmap
This is not the final App Store binary. Native iOS should use one shared `CMMotionManager` to access `isAccelerometerAvailable`, `isGyroAvailable`, `isMagnetometerAvailable` and device-motion updates, and stop all streams when inactive. Probe actual device availability rather than guessing by model or misclassifying denied permission.
- Native haptics may generate feedback via `UIImpactFeedbackGenerator` / `CHHapticEngine`; **there is no public API that returns a direct tactile motor self-test verdict**. Ask the customer to confirm physically felt output.
- Proximity may use `UIDevice.isProximityMonitoringEnabled` and `proximityState` where available. Request only while actively testing and restore/disable monitoring afterwards. No inference that a screen-off failure always proves a specific flex/logic-board issue.
- Compass/magnetometer field data may be checked with Core Motion, while location-based heading services, where needed, require appropriate privacy consent.
- Use system APIs and real-device validation to build robust native support for iPhones. Avoid private APIs or manufacturing-service mode claims.

Relevant Apple developer documentation:
- https://developer.apple.com/documentation/coremotion/cmmotionmanager
- https://developer.apple.com/documentation/coremotion/getting-processed-device-motion-data
- https://developer.apple.com/documentation/corehaptics/
- https://developer.apple.com/documentation/uikit/uidevice

## Tests
`node toolbox/motion/preview/tests/core-tests.js` tests engine totals, provenance, cautionary triage, privacy wording, and mocked permission/real-event state handling.
Physical Safari motion permission and haptic behaviour **not yet verified** on a real iPhone; the user must inspect and approve this new prototype before a lock.
