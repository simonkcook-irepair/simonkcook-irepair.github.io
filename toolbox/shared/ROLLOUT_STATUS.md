# Canonical device catalogue — rollout record

**Date:** 29 October 2026  
**Master source:** `toolbox/shared/iphone-models.json` — 40 Apple-confirmed iPhone model families  
**Reference branch:** `toolbox/shared-device-catalogue-2026-10-29`

## Verified and deployed

- **Camera Diagnostics:** production `irepair-camera-glass-review-simon-cook.vercel.app`; Duo no longer incorrectly shows a Face ID step. Duo's two separate front cameras are explicitly not independently covered by the single guided front test. Camera source rows generated from the master catalogue; verified at 320px and 390px; Duo six stages, iPhone 17 Pro nine stages, no browser errors or overflow. Production deployment `dpl_AECEsCceK6aBVnTnDqBzoBeEnyx9`.
- **Audio Diagnostics:** production `irepair-audio-glass-review-simon-cook.vercel.app`; iPhone Duo model label is current, without "coming soon". All Step 1 restored stylesheets and the no-horizontal-overflow correction retained from the verified seven-file snapshot. Report, restart and recovery smoke checks passed at 320px and 390px. Production deployment `dpl_CTNraciwqMgSamhJ9sqeYomZXodD`.
- **Shared model validation:** `node toolbox/shared/validate-models.cjs` passes all feature requirement groups; `node toolbox/shared/sync-legacy-models.cjs --check` confirms source-renderer projections for Audio and Camera. Camera's independent deterministic regression suite passes.

- **Panic Diagnostics:** production `irepair-panic-glass-review-simon-cook.vercel.app`, deployment `dpl_Cnht3jvKvCgyXn8cTUxmNKCYBGTL`. Its 40-model selector and drawing rows are now generated from `toolbox/shared/iphone-models.json` via `sync-legacy-models.cjs`. Its existing panic parser, offline rules, reviewed-reference loader and report engine are unchanged. Node tests: 17 core, 15 reference checks, 8 new catalogue checks; master generation check passed. Full browser file-import, manual override, privacy and no-panic evidence tests passed at 320px and 390px on staged **and production** aliases.\n\n## Still not migrated

- Motion & Haptics, Connectivity and Charging still deploy their own model catalogue copies. Their current 40-model *identity rows* matched the Camera reference during the audit, but they do not yet consume this master source at build time.
- Battery Diagnostics and Screen Diagnostics have their own model-identification and eligibility logic to reconcile.
- Future native iOS apps require a shared identifier-to-model mapping and on-device capability discovery; this browser metadata is not itself a physical hardware test.

## Protection rules

Charging v11 is **signed off** and must not be redesigned as a side effect of shared data adoption. Keep every site's source package independent until staged and regression-tested. Do not change iRepair Core default-branch functionality. Device diagrams and mic location coordinates remain illustrative unless independently verified. Do not treat optical-quality crop as proof of a separate telephoto lens. Preserve customer-guided versus native-measured evidence labels.

## Next controlled task

Migrate the remaining standalone apps one at a time to the master catalogue using exact stable deployment snapshots and separate smoke tests, starting with Motion & Haptics, then Connectivity and (last, protected) Charging v11. Reconcile Battery and Screen after source inspection. Never claim "all tools unified" before the migration tests actually complete.
