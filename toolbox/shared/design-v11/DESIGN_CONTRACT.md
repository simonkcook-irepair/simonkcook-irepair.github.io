# iRepair Toolbox — Charging v11 visual language (working design contract)

Reference: approved Charging Diagnostics v11, https://irepair-charging-review-simon-cook.vercel.app/?v=11-whole-phone
Initial consumer: Camera Diagnostics separate review, not the locked Camera or Charging production previews.

## Visual invariants
- Icy-blue frosted glass with white inner edge, rich navy type, electric-blue actions and mint/cyan accents.
- Complete handset photography, precise component-specific illustration, grounded shadows and generous negative space.
- Animation must communicate physical interaction, never fabricate hardware evidence. Respect reduced-motion preferences.
- Accessible 44px+ touch targets; no horizontal overflow at 320px, 390px or 430px.
- Keep guided outcomes expressly customer-observed. Safari is not an independent physical-lens, LiDAR, TrueDepth or optical-calibration tester.

## Shared implementation
- toolbox/shared/design-v11/toolbox-glass.css: reusable .ir-v11 opt-in shell, glass, controls, layout, typography and stage tokens.
- toolbox/camera/v11-visual-review/camera-v11.css: Camera-only photographic landing, component stage, highlighted lens location, step treatments.
- toolbox/camera/v11-visual-review/camera-v11.js: UI-only animation coordination; never mutates sensor state, tests or diagnostic reports.
- Camera retains byte-for-byte original planning, camera stream, result and model renderer scripts.

## Change control
- The original Camera application stays at toolbox/camera/glass-review and its existing production link.
- The Charging v11 original app and assets are never altered. A copy of its signed-off phone photograph is reused in this visual review.
- Deploy visual changes to an unpromoted Vercel preview. Review on iPhone before promoting.

## Follow-on after Camera approval
Audio, Motion & Haptics, Screen, Connectivity, Panic, Battery. Retain the special functionality of each tool and carry design components forward individually.
