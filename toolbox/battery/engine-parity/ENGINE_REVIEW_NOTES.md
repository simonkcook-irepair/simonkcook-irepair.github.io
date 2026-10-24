# iRepair Toolbox — Battery Diagnostics engine parity review
**Date:** 24 October 2026  
**Status:** EXPERIMENTAL REVIEW; NOT USER-APPROVED / NOT FINAL.

## User's instruction and protection
User: “I've loved what you did with the look and feel for the new one, but it needs to be much more closer to the engine of the old app.”

**LOCK / PRESERVE:** The newer Battery Diagnostics app's Screen Diagnostics-based icy-blue glass styling, handset illustration and diagonal shine, logo/header, glowing controls, and results aesthetics. Also protect the completed Screen Diagnostics app.

## Source versions / links
- Earlier full Battery & Charging Diagnostics: `https://irepair-battery-diagnostics-preview.vercel.app/` (original project ID `prj_XJw08PmA6gZ49AF5tGly198tA4w3`, deployment `dpl_4NQBTGXALKLKtYDjf3DAXXWUaSfs`) — unchanged; project is protected by Vercel SSO.
- New approved-*appearance* but simpler prototype: `https://irepair-battery-toolbox-review-simon-cook.vercel.app/` (project `prj_HjZOXcZ6NaDzhJwln4ZtushVfdGj`, deployment `dpl_G1Lq1igT9hEuwiUX2bvNWeZoDvpk`) — unchanged.
- **NEW engine-enhanced candidate:** https://irepair-battery-engine-review-simon-cook.vercel.app/ (isolated project `prj_4eo70uHf5uvD1m8ohJC66830RbK2`, deployment `dpl_GKtN8B39ixE3tydug7EeEYFBhdYd`).
- New code branch: `toolbox/battery-engine-parity-review-2026-10-24`
  - `toolbox/battery/engine-parity/index.html`: same approved CSS visual base and landing illustration, expanded test screens; source commit `e55adda2f2136988518c4e2b56ca398f473dd8ff`
  - `toolbox/battery/engine-parity/engine.js`: independent diagnostic calculation, import and reporting; source commit `3b9eacfaacb92669c26e4f3385b695d0c57161bc`
- Completed Screen Diagnostics final: `https://irepair-screen-diagnostics-review-simon-cook.vercel.app/` — unchanged.

## Investigation limitations
The exact earlier Battery & Charging Diagnostics deployed HTML engine was not fully recoverable: the source deployment is SSO protected, its full source is not in the main GitHub repository, and the Vercel file-content connector truncates the returned source. **DO NOT falsely claim this is an exact copy or that all original old engine functions have been ported.** Functionality in this candidate is reconstructed from earlier documented Battery Diagnostics requirements, with explicit platform capability limits.

## Engine-enhanced candidate
1. **Device and model-aware guidance:** iPhone series, exact model optional, historical Apple design-context cycle benchmarks. Does not pretend Safari can identify exact model.
2. **Settings-reported health:** maximum capacity, cycle count, service message, explicit source attribution. iPhone Duo has separate fields for both batteries, and incomplete two-battery coverage is flagged.
3. **Charging state:** Pass / Fail / Unable to Test for charging-indicator observation and charging stability.
4. **Observed charging change over time:** manual start/end percentage, duration, optional wall-clock timer, reported percentage-point difference and percentage-points/hour. Not electrical current, charge capacity or verified charging performance. Durations shorter than a minute do not become fabricated 1-minute readings.
5. **Charge display:** illuminated meter reflects customer-typed iOS percentage, **clearly labelled manual**, no fake sensor readings.
6. **Automatic monitoring:** uses browser Battery Status API only where exposed; iPhone Safari cannot use it. No claims of iOS temperature/current/health access.
7. **Thermal and shutdown triage:** heat/damage/swelling warning stops a charging observation, prompts professional inspection; unexpected shutdown/charging-fail statuses trigger further assessment.
8. **Optional local iPhone analytics file reader:** accepts .ips/.log/.txt/.json ≤8MB, processes only locally, conservatively recognises specifically named cycle/maximum-capacity-percent fields, ignores ambiguous unrelated fields, disallows automatically applying conflicting readings, labels imported values unverified, strips analytics/raw identifiers from the final report.
9. **Provenance:** explicit log/manual sources, editing imported values corrects its data-source label, selecting another log clears previous imported readings.
10. **Detailed results:** safety-first diagnostic interpretation, original reported data, trend evidence, limitations, clipboard report.

## Verification — independent automated mobile-browser checks
- JavaScript syntax check: PASS.
- Preserve landing artwork, dynamic island, original diagonal shine and 390×844 no-scroll opening: PASS.
- Four-stage navigation, field validation, health/settings input: PASS.
- Charging percentage trend: +6 percentage points over 10 minutes calculated; rate +36.0 pp/hour explicitly marked observed/not electrical: PASS.
- Timer cannot misrepresent under-one-minute observation as a full minute: PASS.
- iOS .ips test file containing explicit CycleCount 543 and MaximumCapacityPercent 89 recognised, unsupported NominalChargeCapacity 2800 ignored: PASS.
- Log data imported only after deliberate action; report explicitly marks unverified import: PASS.
- Manual edit after import clears imported-value provenance: PASS.
- Conflicting log values cannot be applied; unrelated values not mistaken for health: PASS.
- Duo single-battery review -> incomplete: PASS.
- Older iPhone series cycle field appropriately hidden: PASS.
- Safety warning for swelling/heat and timer disabled: PASS.
- Report copied with proper line breaks: PASS.
- Real published site HTTP 200, independent `engine.js` HTTP 200. Full public-URL browser test PASS.
- Simplified new preview and completed Screen Diagnostics live and unchanged: verified HTTP 200 and original build markers.

## Acceptance gate and iOS limitations
**Not yet tested on the user's physical iPhone / not accepted.** Further compare with original Battery & Charging Diagnostics features and collect explicit user sign-off before calling complete or replacing either existing battery app. Native iOS battery health, cycle count, charging current and temperature remain outside Safari's access; no unsupported hardware claims.

Apple references:
- https://support.apple.com/en-gb/106348
- https://support.apple.com/guide/iphone/understand-iphone-battery-usage-health-iphd453d043a/27/ios/27
- https://caniuse.com/mdn-api_navigator_getbattery
