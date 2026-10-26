# iRepair Toolbox — Camera Diagnostics (approved, locked browser prototype)

**Created:** 26 October 2026.  
**Status:** **APPROVED AND LOCKED** — user confirmed final Camera Diagnostics Safari prototype on 26 October 2026. Native iOS development remains a separate, untested phase.  
**Safari preview:** https://irepair-camera-glass-review-simon-cook.vercel.app/  
**Vercel project:** `prj_HsDKyquDCwJOozz3tzQbKVUNAabo` (`irepair-camera-glass-review`).
**Approved live deployment:** `dpl_5JrkD3yTqa1s6dAspuiwNejiftJB` (**READY**, five public files HTTP 200 and byte-identical to source). Original approved application-code commit: `3eb29520b2ac7234e8557c62b1e2c58d5953c1df`.  
**Review source branch:** `toolbox/camera-glass-preview-2026-10-26` (historical). **Approved snapshot branch:** `toolbox/camera-glass-locked-2026-10-26`.  
**Source folder:** `toolbox/camera/glass-review/`.

## APPROVAL & FREEZE RECORD — 26 October 2026
The user reviewed the design, model-aware camera-lens illumination, focus/stability and flash fault triage, Face ID guidance and the final LiDAR / depth-distance stage, then explicitly said **"Yes, this is perfect. Lock this down as the completed prototype."**

**LOCKED SCOPE:** `index.html`, `visual.css`, `models.js`, `core.js`, `app.js` and associated Camera tests/graphics in `toolbox/camera/glass-review/`. Preserve the current hosted Safari review link and approved visual language. Do **not** edit, rebuild, redeploy or replace this accepted browser prototype without fresh explicit authorisation. The existing Screen, Battery, Audio and Panic Diagnostics remain independently locked.

**Native development is NOT part of this approval.** Use a different development branch/project for the eventual iOS application and validate actual iPhone hardware access, ARKit depth data, AVFoundation TrueDepth depth streaming and LocalAuthentication on a physical device. Do not claim that browser tests prove LiDAR/TrueDepth physical hardware operation or individual dot-projector/IR component condition.

**Verification at approval:** 48 named automated assertions and two expected-exception tests passed; all five live public source assets matched the GitHub code and Vercel returned READY. Live physical-device testing of native implementations remains outstanding.

## Product goal
A standalone consumer-friendly **guided iPhone camera assessment**, using exactly the premium icy-blue glass branding, handset shape, animated diagonal shine, glowing large controls and typography approved for Screen, Battery, Audio and Panic Diagnostics. Keep the user journey short, accessible and strictly honest about iOS/Browser limitations. Never say a camera, flash, TrueDepth array or physical lens was electronically tested when only the customer visually inspected a picture.

## Implemented browser journey
1. **Premium landing** with front-facing iPhone, illuminated camera symbol, three short benefit descriptions and **Begin Camera Check**.
2. **Short setup**: the approved chronological release-year grouped iPhone selector (newest year first) is *optional*. Customer may continue without selecting the model. No false automatic model detection on the web.
3. **Guided diagnostics** with prominent full-width Pass, Fail and **Unable to Test** buttons:
   - Rear-facing camera live image / colour.
   - Near/far visual focus response using a physical subject.
   - Ultra-wide lens where the selected model has one, observed in the native Camera app. **Safari stream is not falsely presented as isolated 0.5× optics.**
   - Telephoto lens where model has one, with explicit warnings that digitally cropped zoom does not establish a selected physical lens.
   - Front-facing live camera preview.
   - Rear flash/torch: user-initiated short torch pulse only if browser `getCapabilities().torch` supports it; otherwise guided native Camera-app observation.
4. **Optional 100% local sample capture** from the active video stream, stored only in an in-memory data URL and deleted when the user discards it, changes steps, leaves or closes the page. No image transfer or persistent storage.
5. **Cautious report** with precise per-step Pass/Fail/Unable outcomes, model/source information, evidence provenance, clipboard copy, native share where supported and print-to-PDF A4 styling.

All camera streams are requested *only after a customer gesture*, released when the page is left, hidden or tests are completed, and must be explicitly retried if interrupted. A camera permission failure never blocks the user from recording **Unable to Test**. The interface notes if a browser returns a different camera-facing stream than was requested.

## Model specificity
- Reuse unchanged `models.js` from the user-approved year-grouped iPhone selector standard (2017–2026 Apple models, newest first); source: https://support.apple.com/en-gb/108044 .
- Hardware-plan engine `core.js` derives lens availability only from verified model-family camera layout `rear`; singles get core 4 tests, dual ultra-wide / dual telephoto get an additional relevant check, triple lenses get 6 steps. Unknown models use a safe 4-step base instead of inventing hardware.
- Model-specific rear hardware drawings reuse the existing verified-family SVG catalogue; illustrations are schematic rather than microscopic component coordinates.
- Camera-specific options are customer-guided on Safari, not an instrument-grade test.

## Real device limitations
- Browser `navigator.mediaDevices.getUserMedia` supports requesting a front/rear facing stream via `facingMode`, but the browser may ignore this preference or combine camera lenses. Video alone cannot reliably prove which physical camera element or optical focal length is in use.
- Do not claim browser focus results calibrate autofocus, front TrueDepth/Face ID, OIS, LiDAR, night mode or camera control hardware.
- A physical flash / torch can be requested only where the video track advertises a supported torch capability; flash readiness is not proof of still-photo flash timing.
- iOS native AVFoundation's `AVCaptureDevice.DiscoverySession` can discover physical built-in wide, ultra-wide, telephoto and TrueDepth devices where available, but **actual device selection/routing and active-camera verification require Xcode and physical iPhone tests**. Compound virtual devices can change the active constituent lens automatically.
- Native platform does **not** allow bypassing iOS camera permission; always ask for `NSCameraUsageDescription` authorization explicitly.
- The native bridge in `ios/CameraDeviceBridge.swift` is scaffolding, **not** compiled, deployed or tested.

Apple primary sources:
- https://developer.apple.com/documentation/avfoundation/choosing-a-capture-device
- https://developer.apple.com/documentation/avfoundation/avcapturedevice/discoverysession
- https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct/builtinultrawidecamera
- https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct/builtindualwidecamera

Web capture reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

## Project structure
- `index.html`: approved glass-family screens + accessible controls and privacy wording.
- `visual.css`: source-equivalent approved design-system CSS with a scoped Camera layout, lens icon and report print overrides.
- `models.js`: unchanged approved iPhone year groups and handset rear schematic renderer.
- `core.js`: deterministic, model-aware guided test plan, result integrity and conservative report generator.
- `app.js`: browser permissions and video streams, optional in-memory still capture, guarded LED torch pulse, Camera-app external observations, results/clipboard/share/print.
- `tests/core-tests.js`: reproducible native Node.js plan and report assertions.
- `ios/CameraDeviceBridge.swift`: future public iOS-only AVFoundation device inventory handoff.

## Verification performed (26 October 2026)
- 21 deterministic model/plan/report assertions: PASS.
- Automated Chromium mobile session **on the real deployed HTTPS Safari-review URL**, 390×844 with fake camera input and permission:
  - Approved glass landing, newest-first year-grouped selector 2026→2017, iPhone 17 Pro Max 6-stage plan: PASS.
  - Rear camera preview, user-invoked local frame capture/discard, guided focus, external ultra-wide+telephoto steps with no false live isolated view, front/rear switching, conditional torch control, Pass/Fail/Unable sequence, report counts 3/1/2: PASS.
  - Copyable report, A4 print, no POST of photos, no JavaScript runtime errors, rerun and leave: PASS.
  - Denied camera permission: clear message and Retry, all 4 steps can complete as Unable; no fabricated PASS: PASS.
  - Mobile screen widths 375, 390 and 430 px: no horizontal overflow, handset aspect ratio preserved: PASS.
- Browser testing used simulated camera input; **real iPhone Safari camera-permission behaviour, flash device control, manual Camera-app lens visual observation and native Xcode build are NOT yet physically verified**.
- The approved Screen, Battery, Audio and Panic apps are unchanged. This is a separately hosted and branched review candidate.

## Freeze gate — APPROVED AND CLOSED
Visual review and approval were explicitly completed on 26 October 2026. Freeze all Camera browser prototype files and the published review URL. Future native implementation must develop separately. Keep the other four approved apps completely frozen.

## Final public review verification — 26 October 2026

All five production assets `index.html`, `visual.css`, `models.js`, `core.js` and `app.js` returned HTTP 200 at the public Safari review URL and **byte-matched the current GitHub branch**. Vercel reports the reviewed deployment READY.

Production mobile Chromium walkthrough at 390×844 used simulated video hardware and confirmed: brand-continuous landing, 2026→2017 year groups, six-step iPhone 17 Pro Max camera plan, real browser video permission, local sample still capture/discard, rear focus, model-specific ultra-wide/telephoto schematic **without falsely presenting a live isolated lens**, front camera stream switching, browser capability-gated torch control, 3 Pass / 1 Fail / 2 Unable report, copyable evidence, A4 print and no POST/uploads or uncaught JavaScript errors. Also tested four-step iPhone Air plan, rerun and exit.

Permission-denied environment completed all core stages as **Unable to Test**, without camera access, fake PASS or a blocked interface. Mobile 375×667 and 430×932 layouts had no horizontal overflow and preserved the approved iPhone illustration proportions. Print CSS was checked for the correct **Camera** title and limitation wording, with no inherited Panic or Battery disclaimer.

**Historical note (earlier 26 October build):** the acceptance gate was then open. The user subsequently approved and locked the final camera/browser prototype after the LiDAR addition. Physical native iPhone hardware-validation remains a separate development requirement. Xcode and device-specific AVFoundation tests remain for the native App Store phase. The previously locked Screen, Battery, Audio and Panic applications were verified HTTP 200 and remain unchanged.

## Technician observations integration — 26 October 2026 (review revision)
- Preserved approved glass layout, phone illustration, chronological selector, existing video/optics/torch, capture, clipboard and print routes; none of the four locked applications were changed.
- Preserved and refined rear camera + flash correlation, focus/stability clues and separate Face ID stage already present in the branch. If a customer marks an applicable step **Fail**, an optional high-visibility symptom selection appears before proceeding. Specific observations are kept distinct from suspected causes in results and copied report.
- Face ID remains guided and observational in Safari. Native `ios/CameraDeviceBridge.swift` now contains an uncompiled customer-initiated LocalAuthentication `deviceOwnerAuthenticationWithBiometrics` path with a narrow outcome taxonomy, Face ID gating by actual `biometryType`, no passcode fallback and no access to biometric templates. Requires `NSFaceIDUsageDescription`; requires native Xcode/iPhone verification before App Store release. Successful authentication only verifies that the system authenticated this attempt, not each TrueDepth part.
- Updated deterministic test expectations for the current 5/6/8-step plans, Home-button exceptions, rear/flash combinations, symptom provenance, Face ID limitations and safe reporting.
- **Historical development note:** this gate was open at the time of these edits; closed by explicit user approval on 26 October 2026.

## Lens illumination review adjustment (26 October 2026)
- Added a compact, animated icy-blue camera-location guide beneath live rear/front previews.
  Existing full-size schematic also highlights the relevant lens/cluster for the
  native Camera app-guided ultra-wide and telephoto stages; no changes to landing or tests.
- Individual lens-position circles are permitted only for iPhone 13 Pro/Pro Max and
  iPhone 17 Pro/Pro Max, where published labelled lens imagery was cross-checked.
  For other multi-camera iPhones the whole camera cluster glows and the UI explicitly
  says individual physical-lens placement is **not verified**; single lenses and
  flash emitters receive their own highlight.
  - iPhone 13 Pro family labelled lenses: https://www.dpreview.com/files/p/articles/6780391159/iPhone13Pro-3CameraModules.jpeg
  - iPhone 17 Pro family labelled lenses: https://petapixel.com/2025/09/09/redesigned-iphone-17-pro-has-three-48mp-rear-cameras-and-is-aimed-at-content-creators/
  - Apple's model-specific camera/system locations: https://support.apple.com/en-gb/guide/iphone/iph1eb828b25/27/ios/27
- All diagrams are **schematic visual teaching aids**. Browser camera streams are not
  independently routed to, or proven to originate from, the glowing physical lens;
  native AVFoundation verification remains a future device-tested activity.
- All five completed Toolbox browser prototypes are now approved and frozen (Camera approval followed these earlier review edits).

## LiDAR proposal incorporated into Camera review — 26 October 2026
The user approved the existing visual experience, then raised adding the rear
distance scanner before final lock. A **model-gated LiDAR / distance sensing**
stage is now included for documented Pro iPhone families (12–18), placed after
rear optical lens checks and before the selfie/Face ID stages. The glowing
LiDAR housing schematic reuses the existing rings without redesigning the
approved handset illustration. The stage is deliberately limited to a guided
observation in Apple's Measure app; that app also uses camera/motion-based AR
tracking, so it does NOT independently establish that LiDAR hardware works.
A native ARKit check will use
`ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth)`,
`ARFrame.sceneDepth` and `ARDepthData.depthMap` with confidence values on
physical iPhones. An unsupported device or missing scene-depth data is not
automatically a proved faulty sensor. Stage supports Pass / Fail / Unable,
symptom tags, report provenance and technician cautious triage.

**TrueDepth native roadmap:** Apple's AVFoundation public
`builtInTrueDepthCamera` and `AVCaptureDepthDataOutput` can deliver a
per-pixel depth stream. This may provide useful evidence that the front depth
sensing path operates, but does NOT directly test the secure Face ID hardware,
dot projector / flood illuminator individually or biometric identity. Use a
separate LocalAuthentication system check. No direct IR biometric template
readout, emitter-only verdict or fabricated physical hardware result.
References:
- https://developer.apple.com/documentation/arkit/arframe/scenedepth
- https://developer.apple.com/documentation/arkit/ardepthdata
- https://developer.apple.com/documentation/avfoundation/streaming-depth-data-from-the-truedepth-camera
- https://developer.apple.com/documentation/avfoundation/capturing-photos-with-depth
- https://support.apple.com/en-gb/108044
- https://www.apple.com/uk/iphone-18-pro/specs/

This browser code does not access ARKit or TrueDepth depth APIs. User approval of the **browser prototype** was granted on 26 October 2026; native iPhone validation is still required before claims about those hardware measurements.
