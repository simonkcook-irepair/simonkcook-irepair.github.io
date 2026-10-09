# iRepair Audio Diagnostics — Native iOS transition

This directory contains the initial Swift native diagnostic engine. It is **source code only**, not yet an Xcode project or an installed/tested iOS application.

## Scope
- Preserve the existing browser UI as a visual and workflow reference.
- Native engine uses public AVAudioSession APIs to enumerate built-in microphone data sources, request a selected source, and check the resulting active route.
- Do **not** assume that a data source corresponds to a particular microphone simply because of its index, name, or orientation. A verified per-device mapping is required before labeling a physical component.
- A selected source is not proof that iOS electrically isolates one microphone; audio processing and multi-microphone beamforming can affect capture.
- No browser code can substitute for this native routing capability.
- Speaker receiver/loudspeaker routing must be separately developed and validated on physical hardware. Output route selection does not independently certify a particular physical transducer.
- Recording is temporary and removed when the capture ends. No audio upload.
- Current Swift engine deliberately returns UNABLE TO TEST until the app can confirm stimulus, capture integrity, and acoustic criteria. A non-silent input alone is not an automatic PASS.

## Before release
1. Create standalone Xcode iOS app target, add microphone permission string, privacy manifest as applicable, signing and provisioning.
2. Implement customer-guided stimulus, route revalidation after interruptions, audio recording/playback, acoustic signal validation and a deterministic verdict policy.
3. Build a model-specific microphone data-source mapping verified with real iPhone hardware, beginning with iPhone SE (2020).
4. Validate speaker/receiver test paths and handle Bluetooth/headset connections.
5. Add test coverage for permission denied, unavailable source, interruptions, route changes, silence, clipping, background noise, and repeated tests.
6. Produce a minimal customer report (PASS / FAIL / UNABLE TO TEST), plus technician-only evidence when needed.
7. Compile and physically test on iPhones; review App Store privacy and audio permission requirements.

## Repair interpretation
A FAIL means a tested path failed criteria; it does not independently establish that a flex, charging-port assembly, speaker or IC is the defective part. Technician guidance should use verified model-specific component topology and appropriate differential diagnosis.
