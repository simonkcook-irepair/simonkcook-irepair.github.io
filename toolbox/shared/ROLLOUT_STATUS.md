# Canonical device catalogue — rollout record

**Date:** 29 October 2026  
**Master source:** `toolbox/shared/iphone-models.json` — 40 Apple-confirmed iPhone model families  
**Reference branch:** `toolbox/shared-device-catalogue-2026-10-29`

## Verified and deployed

- **Camera Diagnostics:** production `irepair-camera-glass-review-simon-cook.vercel.app`; Duo no longer incorrectly shows a Face ID step. Duo's two separate front cameras are explicitly not independently covered by the single guided front test. Camera source rows generated from the master catalogue; verified at 320px and 390px; Duo six stages, iPhone 17 Pro nine stages, no browser errors or overflow. Production deployment `dpl_AECEsCceK6aBVnTnDqBzoBeEnyx9`.
- **Audio Diagnostics:** production `irepair-audio-glass-review-simon-cook.vercel.app`; iPhone Duo model label is current, without "coming soon". All Step 1 restored stylesheets and the no-horizontal-overflow correction retained from the verified seven-file snapshot. Report, restart and recovery smoke checks passed at 320px and 390px. Production deployment `dpl_CTNraciwqMgSamhJ9sqeYomZXodD`.
- **Shared model validation:** `node toolbox/shared/validate-models.cjs` passes all feature requirement groups; `node toolbox/shared/sync-legacy-models.cjs --check` confirms source-renderer projections for Audio and Camera. Camera's independent deterministic regression suite passes.

- **Panic Diagnostics:** production `irepair-panic-glass-review-simon-cook.vercel.app`, deployment `dpl_Cnht3jvKvCgyXn8cTUxmNKCYBGTL`. Its 40-model selector and drawing rows are now generated from `toolbox/shared/iphone-models.json` via `sync-legacy-models.cjs`. Its existing panic parser, offline rules, reviewed-reference loader and report engine are unchanged. Node tests: 17 core, 15 reference checks, 8 new catalogue checks; master generation check passed. Full browser file-import, manual override, privacy and no-panic evidence tests passed at 320px and 390px on staged **and production** aliases.\n- **Motion & Haptics:** production `irepair-motion-haptics-review-simon-cook.vercel.app`; deployment `dpl_AnNNYdoBi6QrMBHLeycDHaF2HUVA`. Its 40 iPhone model and illustration rows now come from `toolbox/shared/iphone-models.json` via `sync-legacy-models.cjs`. The approved v3 visual, accelerometer/gyroscope/orientation feed, customer-observed compass/haptics/proximity stages, reports and buttons are unchanged. 49 existing Motion unit checks and 8 new model/evidence checks passed. End-to-end browser QA passed at 320px and 390px on both staged and production aliases. A *synthetic event stream* separately exercised accelerometer, rotation and orientation to verify actual event-driven UI thresholds, without pretending to test an iPhone's physical hardware. No scrolling overflow or JS errors. These six checks are supported as user-observed or browser-driven sessions; no biometric or independent physical-button test has been added.

- **Connectivity Diagnostics:** production `irepair-connectivity-review-simon-cook.vercel.app`; deployment `dpl_FH1ufAVpAZ5VJknwLUVHwLBWHKsv`. Its 40 iPhone identity and illustration rows now project from `toolbox/shared/iphone-models.json` through `sync-legacy-models.cjs`. All other live files match the approved v2 baseline, including the protected same-origin `probe.txt`; no network engine, design or reporting changes. 40 existing core checks and 9 new model/evidence checks passed; shared catalogue validation and projection checks passed. Complete live browser journeys at 320px and 390px passed against both staged and production URLs, including actual test-resource reachability, user route acknowledgement/reset, a mocked geolocation success, Bluetooth failure flow, AirDrop Unable, reports and restart. Browser location was simulated for QA, **not a physical iPhone GPS test**. No JS errors, sideways scroll or failed assets.

## Still not migrated

- **Charging v11** still deploys its own model catalogue. Its currently deployed model identity rows matched the reference during the earlier audit, but the signed-off app has not yet been migrated to the shared build-time model source.
- Battery Diagnostics and Screen Diagnostics have their own model-identification and eligibility logic to reconcile.
- Future native iOS apps require a shared identifier-to-model mapping and on-device capability discovery; this browser metadata is not itself a physical hardware test.

## Protection rules

Charging v11 is **signed off** and must not be redesigned as a side effect of shared data adoption. Keep every site's source package independent until staged and regression-tested. Do not change iRepair Core default-branch functionality. Device diagrams and mic location coordinates remain illustrative unless independently verified. Do not treat optical-quality crop as proof of a separate telephoto lens. Preserve customer-guided versus native-measured evidence labels.

## Next controlled task

Migrate the remaining standalone apps one at a time to the master catalogue using exact stable deployment snapshots and separate smoke tests, starting with a narrowly scoped, protected Charging v11 model-data migration. Reconcile Battery and Screen after source inspection. Never claim "all tools unified" before the migration tests actually complete.
