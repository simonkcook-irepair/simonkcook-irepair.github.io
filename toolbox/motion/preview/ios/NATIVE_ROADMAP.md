# Motion & Haptics — Native iOS Development Plan

This browser preview has **no native component-level verification**.
Build a separate SwiftUI / WKWebView or native camera-equivalent app for App Store submission.

## Core Motion
- Query `CMMotionManager.isDeviceMotionAvailable`, `isAccelerometerAvailable`, `isGyroAvailable`, `isMagnetometerAvailable` individually.
- For accelerometer stream, show actual acceleration and orientation changes; for gyroscope, show angular-velocity range while a customer carefully rotates the device.
- For magnetic field, annotate magnetic interference and accuracy. Separate compass heading from physical magnetometer raw values.
- Only mark a test as a measured hardware PASS if a validated, repeatable criterion exists; otherwise retain customer-observed Pass/Fail/Unable.
- Stop updates on scene background, test exit or app close.

## Haptic feedback
- Use public `UIImpactFeedbackGenerator` and optional `CHHapticEngine` to request several controlled patterns.
- Ask customer whether vibration was **felt**. There is no public return of Taptic Engine's actual mechanical amplitude.

## Proximity
- Where available, enable `UIDevice.current.isProximityMonitoringEnabled`, observe `proximityState` changes while the user covers/uncover the top sensor region and reset the property at completion.
- The exact support and lock-screen behaviours must be checked on physical iPhone models.
- Never claim a blank/stuck screen definitively identifies the replacement part.

## Integration
Reuse Toolbox reporting and model selectors in a new iOS codebase; do not modify the five frozen prototypes. Comply with system permissions, iOS accessibility and privacy. iOS developer membership, signing, Xcode and physical-device QA remain required.
