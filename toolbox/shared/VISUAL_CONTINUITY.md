# iRepair Toolbox — Locked Cross-App Visual Design

**Visual master:** User-approved, completed iRepair Screen Diagnostics web app, 24 October 2026.
**Master live reference:** https://irepair-screen-diagnostics-review-simon-cook.vercel.app/
**Master approved source:** `toolbox/screen/full-coverage-experiment/index.html` on `toolbox/screen-coverage-final-approved-2026-10-24`.
**Reusable CSS extracted without modifying master:** `toolbox/shared/irepair-toolbox-visual-master.css` on this branch.

## Non-negotiable appearance standards
- Same compact header with iRepair icon, **iRepair Toolbox** name and distinctive app-specific subtitle.
- Same icy-blue glass surfaces, pale blue background illumination, white borders, soft blue shadows and inset glass gloss.
- Same font family, rounded large tap targets, blue gradient primary button with luminous cyan outer glow, neutral secondary and green/red status semantics.
- Same premium proportionate illustrated iPhone shell, side controls, Dynamic Island and diagonal moving light on the landing page. **Never resize only the width and leave its fixed-pixel handset details unscaled.**
- Same clear customer-first explanatory copy, large instructions, staged guided test flows and copyable result reports.
- Each app retains its own app-specific testing content; do not duplicate unsupported Screen test hardware claims into Battery or other tools.

## Implementation rules
- Reuse the immutable master stylesheet unchanged wherever feasible; add new app-specific CSS in a separate, scoped section.
- Keep initial apps as independent browser-preview/web bundles, with future standalone native iOS releases separately validated.
- Changes to a sibling app do not authorise changes to completed Screen Diagnostics.
- Every praised/approved element is locked; only explicitly requested changes can reopen it.
- New previews use separate branches/projects and retain rollback pointers to prior working versions.

## Browser vs native battery limits
- A Safari webpage cannot independently access current battery status/level via the Battery Status Web API on iPhone.
- Native public iOS `UIDevice` can access current battery level and charging state when monitoring is enabled.
- Apple does not expose battery Maximum Capacity or Cycle Count to a normal standalone third-party app through those public `UIDevice` properties; guide users to Settings for those readings.
- Model-specific guidance: iPhone 15+ shows Battery Health and typically cycle count; iPhone 14 and earlier Battery Health & Charging, depending on model/iOS.
- Never treat an estimate or customer-entered battery health, cycle count or charging indication as an independent hardware measurement.

**Status:** Design system approved via Screen Diagnostics; battery-specific layout is pending user feedback.