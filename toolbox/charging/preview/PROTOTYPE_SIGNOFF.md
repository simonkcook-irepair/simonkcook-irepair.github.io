# iRepair Toolbox — Charging Diagnostics

## Prototype sign-off

**Status:** APPROVED — PROTOTYPE COMPLETE  
**Approved:** 28 October 2026  
**Approved preview:** https://irepair-charging-review-simon-cook.vercel.app/?v=11-whole-phone  
**Version:** v11 — complete handset / single landing  
**Development branch:** `toolbox/charging-glass-preview-2026-10-27`  
**Approved application source commit:** `003fbb981ab0690dc20e9bf8f937cf0ef79c19fa`  
**Independent regression suite:** 179 checks passed  
**Mobile preview:** tested at 320px, 390px and 430px; no layout overflow, matching handset geometry and centred charging equipment; charging tests and reporting verified.

### Locked visual benchmark

The user explicitly approved v11 as **prototype complete** and the visual/interaction benchmark for other iRepair Toolbox tools. Preserve all approved features, without reworking them when implementing native APIs.

- Premium icy-blue glass styling, iRepair Toolbox branding, realistic device artwork and balanced, symmetrical layout.
- Identical complete iPhone images for the wired and wireless illustrations.
- White charging connector with a longer visible cable, moving into the lower port.
- Cordless wireless pad perfectly centred beneath the iPhone; a single slow, smooth downward landing, holding in place without bounce.
- Existing approved landing-screen shine, green battery percentage, red-to-green COB charging strip, ongoing energy handover pulses and disconnection reversal.
- Separate wired/wireless sessions, explicit Skip Wireless Charging status as Not Tested / Skipped, and detailed copyable reports.
- Model-specific customer guidance including Lightning or USB-C where appropriate.
- Accessibility and reduced-motion support.

The **browser preview is simulated**: no actual battery percentage, charging-state or wattage readings are read from Safari.

### Native iOS implementation — next phase, not yet complete

Use App Store-compliant public APIs on a physical iPhone. `UIDevice.isBatteryMonitoringEnabled`, `batteryLevel`, and `batteryState` provide battery level and the OS charging/unplugged/full state (where available). Use public state-change notifications to update meters and start/stop energy animations. A later observed percentage increase may corroborate charge progress; the percentage is coarse and change is not guaranteed during a short test.

The public battery APIs do **not** provide reliable charging current (mA), charger watts, port resistance, actual charge protocol, or a dependable wired-vs-wireless distinction. Keep charging method explicitly **customer-selected**, never hardware-verified without a supported source. Never portray decorative animation as measured current. Battery Health maximum-capacity and cycle-count fields are not generally exposed to ordinary third-party apps by this public UIKit API; retain guided/manual entry as appropriate.

Maintain the approved visual design as the native presentation layer, while progressively replacing simulated browser inputs with honest system-provided battery level and charging state. Native behaviour requires real-iPhone verification and App Store review. This sign-off covers the **browser prototype only**, not production native diagnostic accuracy.

### Change control

Prototype complete: **no further redesign required or authorised by this sign-off**. Future improvements should be additive and narrowly scoped. Do not modify the iRepair Core website or unrelated Toolbox tools. Preserve v11 as the reference baseline.
