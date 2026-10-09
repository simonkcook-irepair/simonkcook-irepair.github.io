# iRepair Audio Diagnostics — Native iOS economic triage

Status: architecture specification only, not yet implemented in Swift. The customer flow stays simple: a highlighted handset, sound or live meter, then Pass / Fail / Cannot test.

## Business aim

Use clear user observations plus native audio evidence to help distinguish likely high-efficiency service jobs (grille inspection/cleaning, loudspeaker/receiver replacement, microphone or charging-port flex assessment) from cases that warrant specialist board-level investigation. Never present an audio IC or mainboard diagnosis without independent technician confirmation.

## Native observations through public Apple APIs

1. Automatically identify the device by a supported hardware identifier mapped into a versioned, verified model catalogue. Never infer an exact iPhone model from the generic UIDevice.model value alone.
2. Preflight microphone permission, AVAudioSession configuration, isInputAvailable, availableInputs, currentRoute and accessories. Report actual routes; do not assume the built-in route is active when Bluetooth/USB/AirPlay is connected.
3. Enumerate built-in microphone data sources and their optional location/orientation properties. Request available front/rear/lower data sources through Apple audio-session methods, read back the selected source and confirm it is active. Some modes/devices combine sources or provide no source selection; do not claim capsule-level isolation without evidence.
4. Measure audio-input dBFS through AVAudioEngine.inputNode, check for nonzero sample rate and channel count, and record whether capture starts, dropouts, clipping and signal response. dBFS is digital level, not calibrated sound-pressure dB.
5. Test receiver and loudspeaker playback with appropriate AVAudioSession categories/routes, record the actual output route, and request user confirmation. Stereo panning is not reliable evidence of separate transducer selection.
6. Observe audio-session errors, route changes, interruptions, and Media Services lost/reset notifications. These are useful error signals, not audio-chip-failure diagnostics.
7. Optionally compare a built-in audio route with an external accessory route, if available. This must not be mandatory in the public five-step flow.

Apple technical references:
- https://developer.apple.com/documentation/avfaudio/avaudiosession/availableinputs
- https://developer.apple.com/documentation/avfaudio/avaudiosessionportdescription/datasources
- https://developer.apple.com/documentation/avfaudio/avaudiosessiondatasourcedescription
- https://developer.apple.com/documentation/avfaudio/avaudioengine/inputnode
- https://developer.apple.com/documentation/avfaudio/avaudiosession/currentroute
- https://developer.apple.com/documentation/avfaudio/avaudiosession/mediaserviceswereresetnotification

## Cautious technician outcomes

- Tested OK: corroborated functional checks; does not rule out every intermittent problem.
- Inspect / clean grille: a particular output is weak or distorted, but no independent evidence yet of a damaged component. Cleaning must still be physically confirmed.
- Assess speaker / receiver assembly: a localised output is repeatedly user-rated faulty after route checks.
- Assess microphone / charging-port flex: lower-oriented source is repeatedly abnormal while other confirmed sources work; check device-specific assembly mapping.
- Wider audio-path problem — specialist assessment: repeated widespread failures across independent inputs/outputs, plus session or capture errors, after permissions and route issues are ruled out. This is NOT a definite Audio IC or logic-board failure.
- Insufficient evidence: missing hardware support, unreliable routes, denied permissions, skipped tests or ambiguous data.

Liquid damage is not software-detectable merely from audio failures. Require customer history or visible/technician evidence; never infer corrosion or quote repairs purely from sound tests.

## Architecture

DeviceCatalogue (verified models and component positions); AudioCapabilityProbe (hardware source/route checks); SpeakerCheck; MicrophoneCheck; AudioFailureSignals; AudioTriageEngine (versioned conservative business rules); DiagnosticReport; CustomerFlow; optional TechnicianInsights; optional permissioned iRepairCoreBridge.

All components use typed results with requested-vs-observed route separation. Reports contain model, OS, permission state, actual selected sources, objective dBFS summary, user Pass/Fail/Unable responses, session errors, a provisional service pathway, confidence/limitations and a timestamp. Raw recordings stay local unless the customer expressly shares them.

## Release safeguards

Validate on physical iPhone SE 2020, notched and Dynamic Island devices; verify each data source's actual runtime behaviour and handle no-source-selection devices gracefully. Test external audio routing, denied permissions, real damage/blocked grille examples, and interrupted sessions. Use public App Store APIs only. A normal third-party app cannot directly read audio-IC registers, internal Apple Diagnostics, or arbitrary system Analytics / kernel logs. Do not label any result as a confirmed Audio IC fault.
