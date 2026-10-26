# iRepair Toolbox — Audio Diagnostics Glass Review

**Created:** 26 October 2026  
**Status:** WORKING REVIEW PREVIEW, pending explicit user approval and physical iPhone Safari check. Not marked final.

## Context
User explicitly marked **Battery Diagnostics completed** on 26 October 2026 and asked to revamp and complete the next Toolbox application. The next existing app selected for visual modernisation is **Audio Diagnostics**, whose older working source is `toolbox/audio/index.html` and `toolbox/audio/models.js` on `main`.

**LOCKED other tools:** Completed Screen Diagnostics and Battery Diagnostics are untouched. The old Audio Diagnostics source in `main` is untouched.

## Live Safari review
- https://irepair-audio-glass-review-simon-cook.vercel.app/
- Separate Vercel project: `prj_vS8qdduTV3mHBvn7iPDmYBRL8p4b`
- Deployment: `dpl_5QNmwZA7uYDymtr243qfM6NaNCYM`
- Previous review deployment retained: `dpl_9gZ1pVKGTehYDqNFKzACUUWck4pT`
- Isolated GitHub branch: `toolbox/audio-glass-revamp-2026-10-26`
- Isolated source: `toolbox/audio/glass-review/` with `index.html`, `visual.css`, `models.js`, `engine.js`, `ios/AudioDeviceBridge.swift`.

## Visual / customer flow
- Same icy-blue glass, icon logo, premium handset with animated diagonal shine, blue glow and glass buttons as the approved Screen and Battery apps. Original model-aware component SVGs retained for actual test steps.
- Compact step-by-step **five-test** flow: receiver/upper speaker, lower speaker, lower microphone, front microphone, rear microphone.
- Original premium sound options preserved, including Sonic Horizon and Spatial Current variants. No regression to simplistic chimes.
- Large Pass, Fail and Cannot Test controls; optional **three-second mic recording and local playback** is hidden behind a collapsible panel, rather than cluttering the flow.
- Live browser-input dBFS meter; measurements are not SPL dB or proof of individual microphone identity. Audio is processed locally and recordings are discarded upon leaving each step.
- Results include individual answers, microphone-input measurement evidence, tally, clipboard copy and Share; print-oriented A4 browser CSS for Save/Print PDF. Actual iPhone Safari PDF export not physically verified.
- Speaker Recovery remains optional: upper/lower illustration focus, controlled short sweep or 165 Hz water eject, Start/Stop safeguards and explicit no guaranteed repair/water removal. Browser cannot force individual physical speaker output.

## Platform honesty and native handover
- Safari cannot reliably identify exact model on its own, isolate receiver/loudspeaker, or select individual physical microphones. Customer chooses the model so illustrations are accurate. A model link can pre-select it.
- A simulated WKWebView native identifier handoff selects model automatically only when a native message handler supplies an explicit validated device code.
- Swift scaffold `ios/AudioDeviceBridge.swift` uses public Darwin `uname` hardware identity and `WKScriptMessageHandlerWithReply` only. AVAudioSession-specific input/output routing must be implemented and proven on real devices; no native audio routing feature is claimed built.
- Client always labels mic capture as Safari's available microphone input and the report explicitly warns that all three UI mic steps may use the same input.
- The browser's stereo channel assignment is **not** guaranteed to route to different physical speakers.
- Native App Store release remains outside scope until developer setup, Xcode compilation, permission review and device test matrix.

## QA verification
Automated Chromium configured at 390×844 mobile with fake microphone hardware and permission:
- Premium landing and model-picker requirements: PASS.
- iPhone 15 Pro Max model SVG shown after selection: PASS.
- Upper/lower speaker stages, original premium sound selector, sound playback: PASS.
- Three microphone stages with measured dBFS meter and 3-second MediaRecorder playback: PASS.
- PASS / FAIL / CANNOT TEST results (2/2/1 test scenario), microphone evidence, clipboard report: PASS.
- Recovery selection, water eject forces lower target, Start, Stop, safe return and rerun: PASS.
- Print stylesheet: PASS.
- Native bridge simulation with supported model code `iPhone18,2`: automatic model detection PASS.
- Unsupported native model code does not guess: PASS.
- Incoming explicit model link not overwritten: PASS.
- Untrusted bridge source rejected: PASS.
- **Public published website** tested again with full workflow + bridge simulation: PASS.
- Four deployed assets index/style/model catalogue/engine returned HTTP 200 and byte-matched tested source.
- Prior Screen and Battery live URLs remain online and unchanged.
- Physical iPhone Safari speaker routing and mic permissions / playback / actual iOS sound levels: **NOT YET VERIFIED**.

## Freeze gate
Do not call Audio Diagnostics completed until user approves the Safari preview. Preserve the Audio engine and the already approved family styling; change only user-requested issues. Once approved, freeze Audio with the same rules as Screen and Battery.

## Targeted landing illustration alignment — 26 October 2026

**User-authorised change ONLY:** The user compared the Screen, Battery and Audio landing screenshots and approved Screen + Battery as final. Audio's handset did not visually match the other two. They explicitly authorised fixing the **Audio landing handset only**, preserving all other Audio controls, copy, layouts, model selection, sound tests and recovery functionality.

**Implemented on branch** `toolbox/audio-landing-handset-match-2026-10-26` and deployed to the existing separate Audio comparison site:
https://irepair-audio-glass-review-simon-cook.vercel.app/

- Matches the approved Screen/Battery handset's **original 258px geometry** (shape, bezel, native Dynamic Island, side buttons, screen gradient and animated diagonal glass reflection). Scales the **entire phone uniformly** to fit the existing Audio illustration panel, rather than changing individual proportions.
- Replaces the oversized/re-styled visual treatment with a subtle audio symbol.
- Removes the **“Select a model” bubble overlay from the handset image**. The external iPhone selector remains untouched.
- Front handset remains the premium illustration **before and after model selection**; the existing **View rear of handset** control still shows the original model-specific rear SVG when requested. Five test-step SVG diagrams remain unchanged.
- Asset version markers in HTML updated to `handset-match-2` for Safari cache freshness; no page content/text or control alterations.
- Older Audio deployment `dpl_5QNmwZA7uYDymtr243qfM6NaNCYM` is retained as rollback. New deployment: `dpl_DmG1P2iTt1Y6Rj6dSHY4mRLZiSRi`.

**Verified:** Live public site: HTTP 200 and byte-for-byte match to tested source for index, CSS, models and engine. Playwright mobile browser tests at 390×844, 375×667 and 430×932: correct phone ratio/centering, no extra scroll-width, bubble absent, correct selector behavior, front does not change after model selection, rear flip works in both directions, model-specific diagnostic screen still works. HTML markup and models catalogue match the original Audio review except invisible cache-busting asset versions; previous CSS is preserved as an identical prefix, and engine change is strictly limited to the rear-view class state. Completed Screen + Battery URLs verified HTTP 200 and untouched.

**Status:** Audio revised preview **awaits user visual approval**, not locked as final. Do not edit the accepted Screen or Battery apps.
