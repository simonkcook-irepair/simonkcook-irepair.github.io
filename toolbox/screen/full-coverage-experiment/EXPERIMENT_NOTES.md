# Screen Diagnostics — Full Coverage Lab (EXPERIMENTAL)

Created 24 October 2026, explicitly separate from the user-approved and LOCKED Screen Diagnostics final version.

## Links
- **Experimental iPhone Safari preview:** https://irepair-screen-coverage-lab-simon-cook.vercel.app/
- **Locked accepted final version:** https://irepair-screen-diagnostics-review-simon-cook.vercel.app/
- Experimental Vercel project: `prj_CxRKfxlo01exboOY74xY5IPB8r7W`
- Experiment deployment: `dpl_HbQREdFe3h4KJMSCTLegF3x3fxcd`
- Experiment source: `toolbox/screen/full-coverage-experiment/index.html` on branch `toolbox/screen-full-coverage-experiment-2026-10-24`
- Last source commit at this stage: `fc3a884e09b11a83bf92b0332a104b377c1cd238`
- Locked final source is on a **different branch** and is never to be overwritten.

## User request and acceptance status
User: "That's absolutely perfect. Consider this the locked in final version. Now I'd just like to have a try at making this more a true screen test app, so let's keep everything pretty but keep the actual tests fundamental to testing."

The original application is locked and accepted. **The coverage lab is not accepted yet and is not a replacement.** Further changes require the user's actual iPhone feedback.

## Test changes (only in this experiment)
1. The original polished landing page is byte-for-byte preserved in HTML markup.
2. Eight visual test patterns: white, black, red, green, blue, RGB bands, narrow vertical RGB stripes, and narrow horizontal RGB stripes.
3. Instructions initially remain in the approved glass panel design, but the user can temporarily hide **all test overlays** and inspect the entire *available webpage viewport* free from obstruction; touch to restore controls.
4. The previously approved nine-point touch test and its verified-position fail-safe are kept.
5. A **new touch-coverage scan** follows the nine-point test: a viewport-filling 12 × 22 contact map (264 regions), with visually illuminated registered areas, four-corner checking, and a percentage of cells visited.
6. Swipe coordinates interpolate between successive pointer events within the active continuous gesture. This is an interaction map of browser events, not proof of every physical pixel.
7. The "FINISH HERE" button follows the last successful touch. At screen corners it is kept visually on-screen while its *rectangular interactive hit area* includes the last registered exact position, even through its decorative rounded shape.
8. The existing premium handset/COB perimeter test is copied **unchanged** and runs after the new scan.
9. Reports include separate nine-point, coverage, visual, and perimeter statuses, measured 264-cell percentage, and 4/4 corners tested.
10. If <92% visited or any corners are unvisited, coverage is **INCOMPLETE**, not automatically FAIL. No inaccessible/missed cell is unilaterally called a confirmed hardware defect.

## Verification
- Experiment publicly served with HTTP 200, updated source and separate Vercel domain.
- Locked final served with HTTP 200 and unchanged 38,751-byte protected build.
- Before final corner styling change, automated Chromium mobile test PASS: eight full-background modes, original 9 targets, 264/264 simulated contact sweep, separate coverage results, preserved perimeter, copyable report.
- Automated incomplete test PASS: 3/264 coverage -> INCOMPLETE rather than FAIL; report contains real newline characters.
- After corner-position correction, targeted test PASS: tapping exact bottom-left last successful contact activates the fully visible Finish control even at physical corner.
- **Pending:** Actual iPhone Safari visual and finger testing, including Safari browser chrome, OS reserved edge gestures, touch responsiveness and real-world user acceptance.

## Platform limitation
Browser Web APIs only test the webpage's **available viewport**, not the complete physically addressable OLED/LCD area, status-bar region, browser chrome, or system-reserved areas. Visual colour quality is judged by the user; a full-sweep percentage is coverage of CSS grid cells receiving pointer events, not a calibrated digitiser or subpixel diagnostic.

## Guardrail
Do NOT alter either existing locked final app or its URL. Keep this feature branch and Vercel project isolated. Only after explicit user approval can a new release be considered.
