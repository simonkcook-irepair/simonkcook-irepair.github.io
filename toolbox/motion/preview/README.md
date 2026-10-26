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

## Motion & Haptics v2 — customer-friendly review (26 October 2026)
User requested a simpler, less technical workflow and specifically praised the custom
motion logo but not the extra external-orbit aesthetic. V2 restores the signature
single front-facing iPhone on the landing page, with the motion symbol kept centred.
The six guided stages are now visually distinct:
- Accelerometer: directional arrows, a phone visual responding to actual acceleration,
  and separate side-to-side/forward-back observations.
- Gyroscope: rotating halo with actual rotation responses, checked over repeated samples.
- Orientation: live illustrated phone pitch and roll with separate detection checks.
- Compass: recognisable compass display illustration and Apple Compass instructions.
- Haptics: animated radial waves and a customer-confirmed physical response.
- Proximity: phone-to-ear illustration and guided normal-call screen check.

**No simulated sensor readings and no auto-passing components.** Browser stages
disable Pass until the *requested qualitative response* is supported by actual
device events. Fail and Unable remain accessible. These lightweight response
thresholds are indicators of movement, **not calibrated specifications, proof
of a healthy accelerometer/gyro, or fault isolation**. Each successful response
still requires the customer's Pass confirmation. The numerical telemetry is
collapsed under "View technical readings"; it remains available in technician
reports with provenance. Permission denied/unavailable is not treated as a failed
sensor. All other prototypes remain locked and untouched.

V2 is **NOT APPROVED OR LOCKED**; real-iPhone Safari testing and visual review
are still required. Do not alter the five approved app prototypes.


## Review build v3: effortless customer experience
User guiding principle: the interface should have the simplicity of a "For Dummies"
explanation, while maintaining premium iRepair glass styling and real technical
rigour under the surface.

The central test stage is now always split into two separate, labelled panels:
**1 · DO THIS** (illustrative animation; never called sensor evidence) and
**2 · YOUR IPHONE · LIVE** (a small handset whose movement is driven exclusively by
actual browser readings). For Compass, Haptics and Proximity, panel 2 becomes
**WHAT TO LOOK FOR** with clearly customer-observed expected behaviour.

Accelerometer and orientation tests have genuinely **sequential** actions:
side-to-side then towards/away (accelerometer X then screen-normal Z), and
pitch then roll (orientation beta then gamma). Completing the first switches the
instruction and animated guide for the next action. The first action's samples
cannot be reused to credit the second. Rotation needs repeated actual gyroscope
response samples. The demo can animate, but the live handset never animates
without actual sensor readings. Raw numbers/sample counts are behind the closed
technical-details panel. Physical Pass remains gated to response evidence for
browser-measured stages, but is always customer-confirmed; guided steps remain
manual Pass / Fail / Unable. Stage-specific sensor thresholds are qualitative,
**not proof of component health**, calibration, fault isolation or physical
distance measurement.

This remains a review candidate, **not yet user-locked**. Test in actual iPhone
Safari; browser permissions and Core Motion hardware should be verified separately
before commercial release. Keep Screen, Battery, Audio, Panic and Camera locked.
