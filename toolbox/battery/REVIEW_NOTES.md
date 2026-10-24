# Battery Diagnostics — Visual Continuity Review

**Date:** 24 October 2026

## Objective
Build Battery Diagnostics next in the iRepair Toolbox family, preserving the completed Screen Diagnostics appearance and avoiding changes to any approved app.

## Comparison preview
- **New public browser review URL:** https://irepair-battery-toolbox-review-simon-cook.vercel.app/
- **Separate Vercel project:** `prj_HjZOXcZ6NaDzhJwln4ZtushVfdGj`
- **Preview deployment:** `dpl_9mmzRAAgq5vwLhgkVEnK78cbm3zw`
- **Source GitHub branch:** `toolbox/battery-diagnostics-2026-10-24`
- **Source:** `toolbox/battery/index.html`
- **Extracted shared visual master:** `toolbox/shared/irepair-toolbox-visual-master.css`

## Important preservation
An **older Battery & Charging Diagnostics Vercel project** already exists:
- `irepair-battery-diagnostics-preview`, project ID `prj_XJw08PmA6gZ49AF5tGly198tA4w3`
- Latest existing deployment `dpl_4NQBTGXALKLKtYDjf3DAXXWUaSfs`, **not modified**.
- Its existing deployment is protected by Vercel authentication, so full feature parity and source could not be inspected without changing access permissions. Do not assume this new comparison app replaces its earlier functionality.
- Current completed Screen Diagnostics project/deployment likewise untouched.

## Features implemented in the new comparison
1. Reused exact approved customer glass design, header, brand logo, full iPhone illustration proportions and animated diagonal shine, large lit buttons, and report style.
2. Model family/manual exact model entry with per-model Settings directions.
3. User-entered Apple Maximum Capacity, health warning, optional cycle count (iPhone 15+). Older-model cycle input hidden.
4. Optional user-entered current charge percent (clearly separate from Maximum Capacity).
5. Guided Pass/Fail/Unable charging-indicator observation plus shutdown and swollen/hot/damaged battery safety questions.
6. Contextual cautious conclusions: explicit service notice, unsafe symptoms, capacity at/below 80%, monitoring, or incomplete information. Not marketed as electronic hardware testing.
7. Copyable report with source labels, timestamps, measurements vs observations and browser limitations. No remote data submission.
8. No unsupported live battery health/cycle count inference from iOS Safari.

## Verification completed
- Source JavaScript syntax: PASS.
- New review URL HTTP 200; tested and published HTML match byte-for-byte.
- iPhone-size browser at 390 × 844, 440 × 956, 375 × 667 and 390 × 640: home visible without page scrolling.
- iPhone 15 series: Battery Health instructions, cycle count visible: PASS.
- iPhone 14 series: Battery Health & Charging instructions, cycle input hidden: PASS (corrected earlier CSS hidden-state issue).
- Example 84% max capacity / 782 cycles: monitoring assessment and report copied with newlines: PASS.
- Safety heat/swelling warning and its priority over capacity status: PASS.
- Automated full journey against public deployed URL: PASS.
- Older original Battery project not overwritten; completed Screen Diagnostics remains unchanged.
- Physical Safari visual and real-world interaction review by user: PENDING.

## Acceptance gate
Only the design master is formally locked. **Do not mark this Battery app complete, promote it over any existing working app, or delete prior Battery Vercel deployments without explicit user acceptance.**