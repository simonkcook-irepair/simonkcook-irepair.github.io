# iRepair Toolbox — Camera Diagnostics (new browser review)

**Created:** 26 October 2026.  
**Status:** Working review prototype — **NOT YET USER-APPROVED OR LOCKED**.  
**Safari preview:** https://irepair-camera-glass-review-simon-cook.vercel.app/  
**Vercel project:** `prj_HsDKyquDCwJOozz3tzQbKVUNAabo` (`irepair-camera-glass-review`).
**Latest live verified deployment:** `dpl_2mcoEPueGhBfZN6LbPJHwBofcAwc` (**READY**). Earlier review rollback: `dpl_Hg6tqXd2yJbS8iRQe3y1HEuQhtA4`.  
**GitHub branch:** `toolbox/camera-glass-preview-2026-10-26` (isolated from working iRepair Core and the four completed apps).  
**Source folder:** `toolbox/camera/glass-review/`.

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

## Freeze gate
Do not label Camera Diagnostics completed or final until the user visually compares the Safari preview with the four locked apps and evaluates it on a real iPhone. Preserve praised elements; make only requested changes on this isolated Camera branch. Keep the other four approved apps completely frozen.

## Final public review verification — 26 October 2026

All five production assets `index.html`, `visual.css`, `models.js`, `core.js` and `app.js` returned HTTP 200 at the public Safari review URL and **byte-matched the current GitHub branch**. Vercel reports the reviewed deployment READY.

Production mobile Chromium walkthrough at 390×844 used simulated video hardware and confirmed: brand-continuous landing, 2026→2017 year groups, six-step iPhone 17 Pro Max camera plan, real browser video permission, local sample still capture/discard, rear focus, model-specific ultra-wide/telephoto schematic **without falsely presenting a live isolated lens**, front camera stream switching, browser capability-gated torch control, 3 Pass / 1 Fail / 2 Unable report, copyable evidence, A4 print and no POST/uploads or uncaught JavaScript errors. Also tested four-step iPhone Air plan, rerun and exit.

Permission-denied environment completed all core stages as **Unable to Test**, without camera access, fake PASS or a blocked interface. Mobile 375×667 and 430×932 layouts had no horizontal overflow and preserved the approved iPhone illustration proportions. Print CSS was checked for the correct **Camera** title and limitation wording, with no inherited Panic or Battery disclaimer.

**Acceptance gate remains OPEN:** physical Safari microphone/camera/torch permissions and video routing need real iPhone confirmation, and the user must approve the revised Camera landing/test screens before the browser prototype can be labelled complete/locked. Xcode and device-specific AVFoundation tests remain for the native App Store phase. The previously locked Screen, Battery, Audio and Panic applications were verified HTTP 200 and remain unchanged.
