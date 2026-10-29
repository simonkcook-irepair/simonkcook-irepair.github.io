# Camera Diagnostics — Approved labelled iPhone 18 Pro Max hero (review build)

**Status:** IMPLEMENTED AND STAGED — pending physical iPhone visual approval; no existing production app replaced.

**Current standalone review:** https://irepair-camera-glass-review-oqnpt0n2e-simon-cook.vercel.app/
**Production Camera preserved:** https://irepair-camera-glass-review-simon-cook.vercel.app/
**Charging v11 preserved:** https://irepair-charging-review-simon-cook.vercel.app/?v=11-whole-phone

## Scope of change
- Replace the landing-page front/charging-image collage with the exact user-approved labelled iPhone 18 Pro Max rear-camera ARTWORK crop.
- Labels in the approved illustrative image identify: upper-left Ultra Wide, lower-left Main, right-hand Telephoto, flash and LiDAR.
- Preserve the preexisting glass header, title, instructions, information box, CTA, navigation, all guided test views and reports.
- Correct the CSS cascade so the artwork displays without anamorphic X/Y stretching at mobile widths.
- The crop has an intrinsic 360 × 310-pixel aspect ratio; this is NOT the physical chassis aspect ratio. Model physical dimensions live in the shared catalogue. The generated perspective drawing itself is illustrative and has not been certified against CAD or a measured real handset.

## Verification
- Site staged at Vercel deployment dpl_36GwRCMgP7hkEyErtVMCQHTajLSR; target=preview, no promotion.
- Existing Camera core regression checks passed.
- Seven model-specific optical location tests passed (including iPhone 18 Pro and 18 Pro Max).
- Complete browser journeys at 320px, 390px, 430px passed for iPhone 18 Pro Max (9 guided steps) and iPhone Duo (6 steps).
- For all six scenarios: artwork loaded; stage ratio ~1.161 equals image ratio; no original front/charging photo or secondary phone; no horizontal overflow; assets 200; report copied; restart works; zero page errors.
- Real device camera operation, precision of generated perspective artwork and exact hardware dimensions still need a physical review before commercial/technical signoff.

## Release gate
Review the staged URL on an actual iPhone. Do not overwrite the existing production Camera alias until expressly signed off. For technical training-grade camera location illustrations, prefer verifiable photography or dimension-controlled 3D/CAD assets rather than treating AI composition as metrology.
