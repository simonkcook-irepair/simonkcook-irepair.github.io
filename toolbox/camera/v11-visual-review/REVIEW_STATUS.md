# Camera Diagnostics v11 — Approved visual implementation

**Visual design status:** APPROVED / LOCKED by project owner on **29 October 2026** after reviewing the updated Camera Diagnostics application on an iPhone.

**Approved reviewed deployment:** https://irepair-camera-glass-review-k662sn4lm-simon-cook.vercel.app/
**Vercel deployment ID:** `dpl_6ip8AVus8vaucazVk9H9qvv7E2qh` (READY, preview only)
**Approved application source commit:** `f8c0fe0ca0e0e15e2aba2616ecd463b49226710c`
**Development branch:** `toolbox/camera-approved-labelled-hero-2026-10-29`

**Camera production review preserved:** https://irepair-camera-glass-review-simon-cook.vercel.app/
**Charging v11 preserved:** https://irepair-charging-review-simon-cook.vercel.app/?v=11-whole-phone

## Locked visual decisions

- Retain the existing premium icy-blue glass, iRepair Toolbox header, wording, typography, navigation and illuminated Begin Camera Check button.
- Landing hero: the approved labelled three-quarter rear view of the iPhone 18 Pro Max with Ultra Wide, Main, Telephoto, Flash and LiDAR annotations; display as an illustrative reference rather than a dimensionally certified engineering diagram.
- Retain the full Camera Diagnostics engine, shared 40-model iPhone catalogue, permission handling, guided results and reporting.
- **Final approved setup adjustment:** remove the redundant box containing an angled/leaning iPhone image and the instruction “Look at the iPhone in your hand.” The introduction now flows directly into the optional iPhone model selector.
- Do not reintroduce the removed setup illustration or redesign the approved application without new authorisation.

## Verification record

- Earlier source-level camera core regression suite: **35 passing**; model-specific camera lens-position regression checks: **7 passing**.
- Earlier full browser review of the labelled landing hero and a nine-step 18 Pro Max journey: **39 passing**, 0 failing (after correcting a case-sensitive *test assertion* for the report header).
- For the final approved setup adjustment, independently verified the deployed application at **320px, 390px and 430px** browser viewport widths: each loaded HTTP 200, the labelled landing hero loaded, the redundant setup box/image/text were absent, all **40 model options** remained available, no horizontal overflow or JavaScript errors were observed, and Start Guided Camera Tests still opened the test workflow.
- Existing diagnostic source files `app.js`, `core.js` and `models.js` were not modified for the final setup adjustment.
- Verified in a mobile-sized Chromium browser. The user's iPhone visual approval is not a native hardware or per-lens electronic test.

## Release / hardware accuracy boundary

**Visual approval is complete. This is not a blanket native-iOS technical or App Store release sign-off.**

- The committed hero is a low-resolution **360 × 310 WebP** with baked-in labels. The image is illustrative; it is not certified against a CAD model, measured chassis geometry or individual physical lens placement.
- Before claiming engineering-grade hardware accuracy, independently verify the separate optical sensor, flash and LiDAR positions and published lens specifications against authoritative model-specific sources or a physical device.
- Physical iPhone camera routing, individual lens isolation, LiDAR/TrueDepth capabilities, camera permissions and device behaviour require native/physical-device validation; Safari-guided checks must not be represented as independent hardware measurements.
- **Do not promote this preview over an existing Camera alias or publish to the App Store without a separate release decision.**

## Approval record

On 29 October 2026 the project owner confirmed: “Yes, I’m happy with that. Let’s approve it.” This specifically signs off the reviewed Camera Diagnostics v11 **visual experience**, including the removal of the unnecessary setup illustration and instruction panel.
