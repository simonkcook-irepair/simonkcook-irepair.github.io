# iRepair native iOS workspace

This directory contains the native shells for iRepair Core.

## Targets

- `customer/` — public iRepair customer app for the Apple App Store.
- `technician/` — private/internal iRepair Technician app. This is not intended for public App Store discovery.

Both targets use the same iRepair Core/Supabase backend and the shared notification bridge already present in the web application.

## Proposed bundle identifiers

- Customer: `uk.co.irepairandrescue.app`
- Technician: `uk.co.irepairandrescue.tech`

These are source-code defaults only. Confirm availability in Apple Developer before creating the permanent App IDs.

## Toolchain

- Node.js 22+
- Capacitor 8
- Xcode 26+
- Swift Package Manager
- Apple Developer Program membership

## First local generation

From `native/`:

```bash
npm install
npm run stage:customer
npm --workspace customer run cap:add:ios
npm run stage:technician
npm --workspace technician run cap:add:ios
```

Then use:

```bash
npm run sync:customer
npm run sync:technician
npm --workspace customer run cap:open
npm --workspace technician run cap:open
```

## Required Xcode capabilities

For both targets:
- Push Notifications

Customer:
- Location When In Use

Technician:
- Location When In Use
- Background Modes / Location Updates will be added when the native background Satellite tracker is implemented.

## APNs

Each installed app receives its own APNs device token. The existing iRepair Notification Hub stores the token against the correct app variant and sends pushes using the target bundle ID.

The APNs provider credentials must remain server-side in Supabase secrets. Never commit a .p8 key or service-role credential to this repository.
