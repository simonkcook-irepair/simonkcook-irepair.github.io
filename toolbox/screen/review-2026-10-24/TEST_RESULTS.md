# Screen Diagnostics — Controlled Review, 24 October 2026

## Authorisation and scope
Simon explicitly approved the 12-point narrated-video change specification, then confirmed point 11 requires the *same landing-page phone illustration* on the perimeter test, without diagonal shine. No redesign or changes outside approved scope authorised.

## Protected production baseline
- Public URL: https://irepair-screen-diagnostics-preview.vercel.app/
- Source snapshot: `toolbox/screen/review-2026-10-24/baseline/index.html` on this review branch.
- Recorded Vercel production deployment: `dpl_2g2HFkPbAV6iRSnAT9UoZnUaHusi`
- Confirmed still unchanged by direct HTTP GET: **200, 29,994 bytes**, build marker `locked-visual-touch-engine-2`.

## Isolated review build
- Public review (separate Vercel project): https://irepair-screen-diagnostics-review-simon-cook.vercel.app/
- Review project ID: `prj_3C5nsal8n7tIcbTdJEdoouyFhGEe`
- Verified review deployment `dpl_J44C1onAHpx5g53mq2M592qrxG2m`, **READY**.
- Direct HTTP GET: **200, 36,204 bytes**; build marker `approved-screen-review-2026-10-24`.
- Reviewed source path: `toolbox/screen/review-2026-10-24/revised/index.html` on branch `toolbox/screen-approved-2026-10-24`.
- Unlike the original review URL protected by Vercel authentication, this separate review deployment is publicly accessible without login; the original project's protection was NOT altered.

## Approved changes implemented
1. Landing-page phone illustration made smaller to fit portrait view. Original approved typography, blue glass style, shine animation and handset styling retained; nearby spacing adapted only to allow portrait fitting.
2. Display introduction remains unchanged.
3–4. White, black and RGB display tests now show central consistent instructional boxes without changing the respective colour backgrounds.
5. Display assessment panel more compact; original decision controls retained.
6. Touch introduction remains unchanged.
7. Centred 3×3 touch grid enlarged and instructions clearly boxed.
8–9. Separate, clearly worded incomplete-touch exit; no automatic advance until nine unique touches are registered or customer deliberately chooses incomplete.
10. Edge introduction remains unchanged.
11. Perimeter uses the same premium landing phone shell, blue-screen background, side buttons and Dynamic Island styling without moving shine. Phone larger, instructions inside, logo more prominent, runner layered above island.
12. Perimeter pointer-event input and completed-loop handling corrected; final logo becomes tappable after the return-light animation. Timeout safeguard for throttled animation frames.

## Automated QA (Chromium headless, mobile-size viewport, 24 Oct)
| Test | Result |
|---|---|
| New review page publicly accessible | PASS |
| Original production URL still unchanged (marker + bytes) | PASS |
| Home fits portrait 390×844 | PASS |
| Home fits portrait 440×956 | PASS |
| Home fits portrait 375×667 | PASS |
| White / black / RGB centred instructions + progression | PASS |
| Nine-point touch test doesn't advance after first two taps | PASS |
| Nine distinct taps produce full completion and edge introduction | PASS |
| Perimeter illustration shares landing shell styling, instruction inside phone | PASS |
| Runner SVG front-layer priority over Dynamic Island | PASS |
| Browser-simulated perimeter trace progresses to 100% | PASS |
| Return-to-core animation and core activation (~1.2–1.9 s after completion) | PASS |
| Completed route result: display PASS, touch PASS, edge PASS | PASS |
| Incomplete route result: touch FAIL when 2/9 registered, edge UNABLE TO TEST when untouched | PASS |
| Run Again returns to start | PASS |
| JavaScript runtime errors in tested flows | None |

## Open verification gates
- **Not yet verified on physical iPhone:** gesture responsiveness and visual look in iOS Safari. The recorded browser verification uses simulated mouse/pointer input and Chromium; actual finger testing is mandatory before customer acceptance.
- 320×568 ultra-small portrait view still requires vertical scrolling; 375×667 and larger measured sizes fit.
- Browser-guided tests do not independently prove LCD/OLED hardware condition. Reports correctly describe the limits of browser pointer and visual assessments.
- **Do not promote changes into existing production URL until Simon personally tests the review link and explicitly approves it.**

## Next action
Send public review URL to Simon for a fresh narrated screen recording. Any further feedback must be transcribed with Descript and cross-referenced to timestamps before altering this protected review state.
