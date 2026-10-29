# Camera Diagnostics — Charging v11 visual pilot

**Status:** STAGED REVIEW — NOT APPROVED / NOT PROMOTED

Preview: https://irepair-camera-glass-review-2kp28zlxs-simon-cook.vercel.app/
Approved Camera untouched: https://irepair-camera-glass-review-simon-cook.vercel.app/
Protected Charging v11 unchanged: https://irepair-charging-review-simon-cook.vercel.app/?v=11-whole-phone

## Visual pilot changes
- New opt-in shared icy-blue v11 glass stylesheet and camera-specific extension, layered after legacy styles.
- Photoreal whole iPhone asset copied byte-for-byte from Charging v11; a new camera-focused on-screen panel covers charging-screen imagery without editing the reference photograph.
- Subtle model-independent rear-lens concept on the welcome panel, labelled illustrative.
- Enlarged illuminated model-specific lens guide and meaningful step-change animation in the guided test.
- Higher-contrast accessible controls and polished test progress/reporting presentation.

## Unmodified diagnostic code
- Camera app.js, core.js, models.js and original visual.css: copied byte-for-byte from the approved Camera release.
- Existing browser camera live preview and permission lifecycle, model physical camera support, native-only boundaries, report and symptom logic preserved.
- UI-only camera-v11.js reads the guide title and applies visual data attributes. It never writes to test state.

## Verification
- Existing Camera core regression suite passed.
- Browser end-to-end tests passed at 320px, 390px, 430px for iPhone Duo (6 stages) and iPhone 17 Pro (9 stages).
- Camera sample permission/preview, stage-specific guide, results, copy report, restart, absence of JavaScript errors, horizontal overflow and missing CSS/image/script assets checked.
- All staged image and script resources returned HTTP 200.
- This is UI/browser verification, NOT physical camera lens, TrueDepth, LiDAR or optical component verification.

## Review gate
Keep preview separate until reviewed on a physical iPhone. Do not promote or redesign existing approved tools automatically. After approval, propagate shared components to other tools one at a time.
