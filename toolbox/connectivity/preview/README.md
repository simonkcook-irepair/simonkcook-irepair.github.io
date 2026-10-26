# iRepair Toolbox — Connectivity Diagnostics
**Status:** New browser review prototype. NOT APPROVED / NOT LOCKED. Created 26 October 2026.
**Dedicated branch:** `toolbox/connectivity-glass-preview-2026-10-26`
**Directory:** `toolbox/connectivity/preview/`
**Dedicated Vercel project:** `irepair-connectivity-review` (`prj_JPORwNrei3EB6KpjjGHBgprMSetF`).
**Source of glass design:** Copied independently from the locked Motion & Haptics visual system. No modifications to any of the six locked browser prototypes or iRepair Core.

## Product principle
"For Dummies" simplicity; technical integrity underneath. One obvious task at a time,
with large controls, illustrative imagery distinct from real proof, separate DO THIS
and YOUR IPHONE · LIVE / WHAT TO LOOK FOR panels. Never claim iOS hardware access
that Safari or public native APIs do not provide.

## Six stages and true capability
1. Internet: fetch a tiny **same-origin** `probe.txt` from the same Vercel deployment
and verify a fixed token. This checks current site reachability, not modem/wireless
health, full internet reachability or speed.
2. Wi-Fi: guide the user to Settings → Wi-Fi; require explicit manual confirmation of
network selection plus successful same-origin probe. Safari does **not** prove
which interface carried the request.
3. Mobile data: guide customer to turn off Wi-Fi and enable Mobile Data; require
explicit manual confirmation plus successful same-origin probe. Use a tiny payload
to avoid material data costs. Browser cannot prove mobile/cellular route.
4. Bluetooth: customer-guided Settings pairing with a **known** accessory.
No Web Bluetooth scanning or native Bluetooth hardware measurement in this browser.
5. Location: navigator.geolocation.getCurrentPosition only after an explicit tap,
with a 12-second timeout. Retain **accuracy estimate only**, never coordinates.
Geolocation may be derived from GNSS, Wi-Fi or cellular; NOT proof of GPS-only hardware.
6. AirDrop: guided customer confirmation with a second Apple device. Requires
appropriate discoverability, Bluetooth and Wi-Fi. No direct browser AirDrop test.

All have Pass, Fail, Unable and optional symptom tags. Measured stages gate
Pass on actual evidence, manual-probe stages additionally require customer
interface confirmation. Guided Bluetooth and AirDrop are explicitly manual.
Customer observes everything; missing permission is not hardware failure.
Reports include evidence provenance and technician cautious triage.

## Privacy
No network performance analytics, GPS coordinate upload or storage is implemented.
Network probe is an ordinary small first-party web request; server-side access
logs may still exist. No third-party map or location requests.
No identifiers are placed in user reports. Each geolocation request needs
user permission and is only started by a tap.

## Native iOS roadmap — subject to real-device validation
- Apple's Network framework `NWPathMonitor` / `NWPath.usesInterfaceType(.wifi)`
and `.cellular` can report the actual path(s) available/used by the app.
Use controlled NWConnection probe and route/path checks rather than claiming
a full radio self-test. A network path can be satisfied while the broader
internet is temporarily unavailable.
- CoreBluetooth `CBCentralManager` can report BLE state and scan supported
advertising peripherals with Bluetooth consent. Device pairing/Classic Bluetooth
and AirDrop internals are not universally exposed; do not imply direct
testing of every accessory or Apple proprietary protocol.
- CoreLocation gives location updates and accuracy level with authorisation,
but cannot always attribute a fix specifically to the satellite GNSS chip.
Use `accuracyAuthorization` and limited collection; no report coordinates.
- Wi-Fi SSID/BSSID access is restricted by Apple entitlement/authorisation
rules, and low-level baseband, cellular signal/modem diagnostics are not
publicly available as unrestricted hardware APIs.

Apple public API references:
https://developer.apple.com/documentation/network/nwpathmonitor
https://developer.apple.com/documentation/corebluetooth/cbcentralmanager
https://developer.apple.com/documentation/corelocation/cllocationmanager/accuracyauthorization
https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services

**Validation:** Unit smoke/regression tests and live deployment checks are required.
Real iPhone Safari and actual native-device testing remain outstanding.
Keep all six previously approved Toolbox apps frozen.
