# iRepair Toolbox — Battery Diagnostics native-ready candidate

**Prepared:** 25 October 2026  
**Status:** Browser prototype candidate for customer sign-off; **NOT** a compiled native iOS app or an App Store submission.

## Product requirement and accepted design
- Preserve the fully approved **Screen Diagnostics** glass design and opening handset animation. This candidate literally copies the established styling and landing-page HTML; no edits to Screen Diagnostics or earlier Battery previews.
- Customer must do as little as possible. At most **two Battery Health inputs**: Apple's **Maximum Capacity (%)**, if available, and **Service Recommended / No Warning / Unable to Check**.
- File import remains a prominent optional step. No model selection, cycle typing, numerical charge-drain tests or dense technician forms.
- Readings from imported analytics are labelled **unverified historical log readings**, distinct from Settings input and future native public API measurements. Missing values do not imply hardware failure.
- Future **Battery Usage graphs** should be evaluated as phase 2, not part of the current simple flow.

## Files
- `index.html`: approved Toolbox design, Upload → Settings → Report journey, A4 browser Print / Save PDF styling.
- `core.js`: deterministic, DOM-free battery parser, evaluation rules, provenance and reports. No user data stored or networked.
- `engine.js`: accessible controls, native-bridge adapter, local file picker and analytics processing, customer flows, report copy/share and print.
- `core-tests.js`: repeatable JavaScript assessment regression tests. Run `node core-tests.js`.
- `ios/BatteryDeviceBridge.swift`: draft public-API-only `WKScriptMessageHandlerWithReply` bridge, returns hardware code, iOS version, current charge and charge state.
- `ios/BatteryToolboxView.swift`: draft SwiftUI `WKWebView` integration using bundled local HTML/JS.

## Consumer workflow
1. First page retains the premium blue iPhone artwork.
2. Next page: **Upload Analytics File** (optional) or **Continue without a file**.
3. If analytics imported: parse cycle count, supported max-capacity percent, model identifier and known raw counters *locally*. When a percentage is present, prefill it **labelled unverified**, allowing customer correction. When absent, leave blank.
4. One Settings screen asks (a) maximum capacity (optional) and (b) whether the iPhone says service is recommended; select Unable to Check if needed.
5. Result has clear status, device model where identifiable, provenance-labelled capacity/cycles, native charge and charging status only when actually provided by a native host, recommendations, copy/share and print layout. Technician raw fields are under a collapsed accordion.

## Native bridge contract
JavaScript in `engine.js` calls:
```js
window.webkit.messageHandlers.iRepairDevice.postMessage({action:"getSnapshot",schema:1})
```
using the promise reply from `WKScriptMessageHandlerWithReply`. The Swift bridge returns:
```json
{"source":"ios-native","modelIdentifier":"iPhone18,2","iosVersion":"27.0","chargePercent":65,"chargingState":"charging"}
```
These are **shape examples only**. The web app never simulates real device measurements. Model-name mappings must be maintained and validated on actual release hardware.

### Public API limits
UIKit `UIDevice` permits reading current **charge percentage and state** after enabling battery monitoring. The hardware identifier can be obtained via public Darwin `uname`. There is **no generally available public third-party API** for Apple's Battery Health maximum-capacity % or cycle count. No private APIs, battery voltage/current/temperature claims or Device Management entitlements should be used to imply more.

Primary Apple references:
- https://developer.apple.com/documentation/uikit/uidevice/batterylevel
- https://developer.apple.com/documentation/uikit/uidevice/batterystate-swift.property
- https://developer.apple.com/documentation/uikit/uidevice/isbatterymonitoringenabled
- https://support.apple.com/guide/iphone/understand-iphone-battery-usage-health-iphd453d043a/27/ios/27
- https://developer.apple.com/app-store/review/guidelines/

## Handover when Apple Developer Programme / Xcode is available
1. Create a **standalone native iPhone project**, with Bundle ID owned by iRepair & Rescue Ltd. Build a truly native SwiftUI shell and diagnostic screens for robust App Store acceptance; the `WKWebView` wrapper supplied here is a **temporary integration harness**, not proof of minimum App Store functionality.
2. Put `index.html`, `core.js`, `engine.js` inside an app resource folder `BatteryWeb` if using the existing harness; register and retain `BatteryDeviceBridge` before loading.
3. Verify native iPhone model code and charging readings on multiple physical devices, iOS releases and power states (charging/full/unplugged/unknown).
4. Use `UIDocumentPickerViewController` or fileImporter/Share Extension with user consent for `.ips` and `.ips.ca.synced`. Handle security-scoped URLs, multiple-file versions, partial analytics and privacy protections.
5. Optional **on-device Vision text recognition** can extract Battery Health from customer-selected Settings screenshots; do not silently capture Settings or ask for photo access unnecessarily. **Not implemented here.**
6. Implement genuine native share/export (UIActivityViewController/PDFKit), test A4 print and screenshot layout. Current web `window.print()` uses the browser/system print UI and is **not** a verified native PDF exporter.
7. Test VoiceOver, Dynamic Type, colours/contrast, reduced motion, offline use, file privacy, error paths and all App Store policy requirements.
8. Test charging states; do not infer battery drain rate/current from infrequent battery notifications. No indefinite background monitoring.
9. Maintain separate iRepair Core integration and prevent unrelated app modifications.
10. Only designate final after the customer signs off the browser presentation and physical native testing is completed. The user wants to **pause further development until the developer programme**, but that stage has not started.

## QA and acceptance
- Unit: `node core-tests.js` — 17 cases verifying the prior 129-cycle / raw-value report, no fabricated health, Settings overrides, service priority, conflict handling, native snapshot validation and confidential-field exclusion.
- Browser mobile Chromium: full upload with 129 cycles/7 raw readings → two fields → combined report, unverified analytics % prefill, service priority, invalid % / unable check, accessible view transitions, no analytics POST — PASS.
- Simulated WKWebView bridge returns iPhone model, charge and charging state; result / provenance / A4 print CSS — PASS. Simulation is **not an actual iOS runtime test**.
- **Outstanding:** actual user review in iPhone Safari, Xcode compile, supported iPhone native bridge test, real document picker and genuine PDF export.

## Freeze and rollback policy
The completed Screen Diagnostics app and all old Battery Diagnostics URLs/deployments remain untouched. This candidate is isolated; no code or deployment should be promoted into an accepted app without explicit approval.
