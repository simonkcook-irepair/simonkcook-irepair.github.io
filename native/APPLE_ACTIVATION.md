# Apple activation checklist

The iRepair Core Notification Hub is ready for APNs, but physical delivery requires Apple Developer configuration.

## Customer app
1. Create/confirm App ID for `uk.co.irepairandrescue.app`.
2. Enable Push Notifications.
3. Create the App Store Connect app record.
4. Add notification and location usage descriptions in Xcode.
5. Sign the generated Customer target with the iRepair & Rescue Apple Developer team.

## Technician app
1. Create/confirm App ID for `uk.co.irepairandrescue.tech`.
2. Enable Push Notifications.
3. Keep distribution private/internal for the current iRepair & Rescue deployment.
4. Add location usage descriptions.
5. Add background location capability only when the native Satellite tracker is implemented and justified by the technician workflow.

## APNs provider authentication
Create an Apple APNs authentication key (.p8) and record:
- Key ID
- Team ID
- Customer/Technician bundle IDs

Store the key and identifiers as Supabase project secrets for the notification worker. Do not put them in JavaScript, GitHub Pages, GitHub commits, or the customer app bundle.

## Test path
1. Build Customer target to a physical iPhone through Xcode/TestFlight.
2. Accept notification permission.
3. Confirm APNs token registration appears in iRepair Core.
4. Send a technician message.
5. Confirm lock-screen banner, sound, badge and deep link.
6. Repeat from Relay/customer reply to Technician.
7. Test On My Way, Arrived and Repair Complete notifications.
8. Test Nearby/Satellite opt-in separately.
