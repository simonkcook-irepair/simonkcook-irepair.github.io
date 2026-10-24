# Screen Diagnostics — Full-Screen Coverage Experiment

**Created:** 24 October 2026
**Status:** TESTABLE EXPERIMENT — NOT approved to replace the locked final app.

## URLs
- Experimental app: https://irepair-screen-coverage-lab-simon-cook.vercel.app/
- Locked final reference: https://irepair-screen-diagnostics-review-simon-cook.vercel.app/
- Experimental Vercel project: `prj_CxRKfxlo01exboOY74xY5IPB8r7W`
- Verified deployment: `dpl_D4TjvL7TwuWEwHvCcrNkqZBFn6VF`
- Source: `toolbox/screen/full-coverage-experiment/index.html` on `toolbox/screen-full-coverage-experiment-2026-10-24`.

## Design scope
The locked landing page, original numbered nine-target touch test, perimeter phone illustration, COB light effect and results styling are preserved.
This independent experiment extends the diagnostic stages:
1. Eight visual patterns: white, black, red, green, blue, RGB bands, fine vertical lines, fine horizontal lines.
2. Each pattern has an **Inspect the full colour** mode, which hides the test controls and allows the available web viewport to show the uninterrupted pattern. Tap again to restore controls and advance.
3. After the original 3×3 touch test, a 12×22 region grid tracks 264 parts of the browser viewport reached by a pointer/finger path.
4. The touch scan remembers completed regions, including four corners, with percentage and sampled-cell counts.
5. A floating Finish Here control follows the last verified working area and is clamped to remain entirely onscreen even when the last contact was in a corner.
6. Coverage below 92% or with fewer than 4 corner cells registers **INCOMPLETE** — not a confirmed touch hardware failure. Display is customer-observed and a browser can only test the portion of the screen available within its viewport.
7. Results and copied report now include full-area region count, corner count and warnings about hardware-test limitations.

## Automated QA
- Page HTTP 200 and exact deployed HTML matches tested source: PASS.
- Original locked final URL HTTP 200 and retained its independent approved `approved-screen-review-2026-10-24` build marker: PASS.
- Opening page preserves original animated illustration: PASS.
- Eight display patterns shown sequentially with unobstructed inspection and return-to-controls mode: PASS.
- Original nine-target test still accepts all nine targets: PASS.
- Coverage scan across the available viewport marks all 264/264 cells in simulated sweeps: PASS.
- Corner safe control remains clickable; complete/partial scans safely advance: PASS.
- Perimeter animated phone test still completes with the original light and finish interaction: PASS.
- Complete result shows Display PASS, nine-point PASS, full-area PASS, edge PASS, corners 4/4: PASS.
- Incomplete test at 3/264 shows status INCOMPLETE rather than an unfounded hardware FAIL: PASS.
- Report clipboard content has actual newlines after correction: PASS.
- JavaScript exceptions during tested workflows: NONE.

## Mandatory hands-on gate
Still needs inspection on **physical iPhone Safari**: real finger movement, extreme edges/corners, iOS browser interface, UI visibility and reliable hold/drag; do not treat simulated pointer tests as sufficient proof of native touch hardware validation.

**Do not modify the locked final build, promote this experiment, or claim the experimental features are final without explicit user acceptance.**
