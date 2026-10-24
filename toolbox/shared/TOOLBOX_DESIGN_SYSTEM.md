# iRepair Toolbox — Visual and interaction continuity standard

**Established:** 24 October 2026  
**Status:** Approved family design contract. The completed Screen Diagnostics build is the reference, not a file to modify.

## Canonical visual reference
- Completed Screen Diagnostics (final, user approved): https://irepair-screen-diagnostics-review-simon-cook.vercel.app/
- Protected Screen Diagnostics release commit: `8f6412fcbf6b82c65e8a9114cc070b9274f1c601`
- Protected Screen Diagnostics Vercel deployment: `dpl_34goSLEui35ifes2b6r7qxTDMpVh`
- Source: branch `toolbox/screen-coverage-final-approved-2026-10-24`, path `toolbox/screen/full-coverage-experiment/index.html`
- Literal extracted visual CSS reference on this branch: `toolbox/shared/irepair-toolbox-visual-master.css`.

## Non-negotiable continuity
1. Use the **same** icy blue / glass colour palette, soft glow, white outlines, page spacing logic and typography. Avoid approximating from scratch.
2. Use the **same** iRepair Toolbox header/logo treatment, visual hierarchy, pill labels, illuminated blue buttons, Pass/Fail/Unable styling and large accessible tap targets.
3. Reuse the same illustrated premium iPhone frame, Dynamic Island, side-button details, animated diagonal shine and proportions where appropriate. Any different test-specific imagery must remain visually compatible; don't mutate the approved Screen Diagnostics artwork.
4. Guide the user through one clearly stated action at a time, then provide obvious completion/retest controls.
5. Use the same polished results treatment: concise results, clear warnings/limits, copyable technician/customer report.
6. All app-specific CSS must be **scoped to the new application** and layered after a frozen visual baseline. Do not change shared styling upstream as a backdoor way to redesign approved apps.
7. Responsive layout must be reviewed on actual iPhone Safari, not only headless desktop browser. Respect reduced-motion accessibility where relevant.
8. Screens and behaviours explicitly praised or confirmed by the user become protected. Changes require precise authorisation and isolated preview QA.

## Engineering and ethics
- Standalone apps with their own Vercel projects and future independent App Store bundles. Optional iRepair Core integration only where requested.
- Do not imply Safari can access hardware data that iOS or the browser do not expose. Distinguish **iOS-reported/user-entered** values, simulated previews, user observations, and **independently measured** hardware readings.
- Verify model-specific guidance with primary sources, and mark unknown specs as unknown.
- Keep the screen test's completed release untouched. Existing Audio Diagnostics and older Battery Diagnostics previews are also not overwritten without authorisation.
- Maintain a live-preview URL for straightforward iPhone feedback.
- No new app is "final/locked" until the user explicitly signs it off.

## Current next app — Battery Diagnostics (review only)
- Public separate preview: https://irepair-battery-toolbox-review-simon-cook.vercel.app/
- New Vercel project: `prj_HjZOXcZ6NaDzhJwln4ZtushVfdGj`
- Review deployment: `dpl_G1Lq1igT9hEuwiUX2bvNWeZoDvpk`
- Source: `toolbox/battery/index.html` on `toolbox/battery-diagnostics-2026-10-24`.
- Guided health and battery/charging observation report based on iOS Settings. Safari cannot access maximum capacity, cycle count or charging current directly.
- Separate pre-existing Battery Diagnostics project `irepair-battery-diagnostics-preview` was found, **not altered**.

## Source references for battery model guidance
- Apple battery performance and 500/1,000 cycle design: https://support.apple.com/en-gb/106348
- Apple battery health settings in iOS: https://support.apple.com/guide/iphone/understand-iphone-battery-usage-health-iphd453d043a/27/ios/27
- Apple UK currently sold model lineup: https://www.apple.com/uk/shop/buy-iphone

**Owner acceptance gate:** New design or feature changes remain under review until the user explicitly approves them.
