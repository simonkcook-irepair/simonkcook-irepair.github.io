# Camera Diagnostics — Approved camera hero (implementation gate)

Status: APPROVED CREATIVE REFERENCE. **Not yet an approved metrically verified hardware drawing or deployed hero.**

## Scope
- Preserve Camera Diagnostics landing layout, icy-blue glass, logo, exact title/instructions, info panel and Begin Camera Check CTA.
- Replace **only** the existing landing hero image with the latest user-approved, labelled, three-quarter rear view of the iPhone 18 Pro Max.
- Preserve Camera diagnostics engine, camera permission handling, all test and report logic, and live approved Camera alias.
- Do not place the app in an external phone frame (no phone inside a phone); no charging-port cues.

## Illustrated labels
- Ultra Wide (upper left): 48MP, 0.5x, 13mm.
- Main (lower left): 48MP, 1x, 24mm; variable aperture.
- Telephoto (right): 48MP, 4x, 100mm.
- Flash: separate LED.
- LiDAR scanner: separate depth sensor.
- Labels describe **component location**, not a completed test. Prefer legible HTML/SVG leaders over baked-in text; other iPhone models require their own verified mappings.

## Geometry and evidence
- iPhone 18 Pro Max official height: **163.4 mm**; width: **78.0 mm**; thickness: **8.75 mm**.
- Orthographic H/W = **2.0948718**, W/H = **0.4773562**. Perspective projection must be geometrically consistent and not independently stretched X/Y.
- Apple's public rear camera schematic labels the group, not all three individually: do not use it as the sole proof of lens positions.
- Source and confirm individually against trusted model-specific photography, repair documentation or physical hardware.
- References: https://www.apple.com/uk/iphone-18-pro/specs/ and https://support.apple.com/guide/iphone/iphone-18-pro-max-iphbr22k8rnysnm/ios
- Generative art is illustrative until a geometry-checked reference makes exact dimensions independently defensible.

## Staged development checklist
- [ ] Add only approved hero image and scoped CSS; retain existing visual shell and controls.
- [ ] Ensure rear Pro Max illustration shows more of the phone and enough space for five labels.
- [ ] Verify lens-specific anchors, flash, LiDAR, dimensions and correct accessible names.
- [ ] Preserve 40-iPhone model source, existing camera stream, guided steps, three-way choices and reports unchanged.
- [ ] Responsive tests at 320, 390 and 430 CSS pixels; no overflow or clipping; readable labels.
- [ ] Camera regression checks and browser tests: permission/fallback, model selector, Pass/Fail/Unable, report copy, restart.
- [ ] Publish only an unpromoted HTTPS review URL; do not overwrite current Camera app or Charging v11.
- [ ] Obtain physical iPhone visual review and explicit final user signoff before promotion.

## Approval note
The exact creative reference is the most recent user-approved light icy-blue labelled Camera Diagnostics mock-up. Do not substitute a new interface redesign. The reference photograph is NOT a verified orthographic CAD asset.
