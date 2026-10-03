# iRepair native iOS workspace

This directory contains the native shells for iRepair Core.

## Targets

- `customer/` — public iRepair customer app for the Apple App Store.
- `technician/` — private/internal iRepair Technician app. This is not intended for public App Store discovery.

Both targets use the same iRepair Core/Supabase backend and the shared native notification bridge.

## Proposed bundle identifiers

- Customer: `uk.co.irepairandrescue.app`
- Technician: `uk.co.irepairandrescue.tech`

These are source-code defaults only. Confirm availability in Apple Developer before creating the permanent App IDs.

## Toolchain

- Node.js 22+
- Capacitor 8 stable
- Xcode 26+
- Swift Package Manager
- Apple Developer Program membership

## Generate the native iOS projects

From `native/`:

```bash
npm install
npm run generate:customer
npm run generate:technician
```

Each generation command stages the current iRepair web assets, creates the Capacitor iOS project with Swift Package Manager, patches the required APNs callbacks into `AppDelegate.swift`, and adds the current iOS camera/location permission descriptions.

Then open either target:

```bash
npm --workspace customer run cap:open
npm --workspace technician run cap:open
```

After web changes, use:

```bash
npm run sync:customer
npm run sync:technician
```

## Required Xcode capabilities

Both targets:
- Push Notifications

Customer:
- Location When In Use
- Camera

Technician:
- Location When In Use
- Background Modes / Location Updates will be added when the native background Satellite tracker is implemented.

## APNs

Each app instance receives its own APNs device token. The iRepair Notification Hub stores the token against the correct app variant and sends pushes using the matching bundle ID.

The provider retries the alternate APNs environment once when Apple returns `BadDeviceToken`, allowing development/TestFlight environment mismatches to self-correct safely.

The APNs provider credentials must remain server-side in Supabase secrets. Never commit a .p8 key or service-role credential to this repository.

## Continuous verification

`.github/workflows/native-ios-check.yml` generates both native projects on a macOS GitHub runner and performs unsigned iOS Simulator builds. This verifies the native shell without requiring Apple signing credentials.
