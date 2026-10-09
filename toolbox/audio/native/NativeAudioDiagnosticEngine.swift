import AVFoundation
import Foundation

/// Native audio input routing and evidence capture.
/// A physical microphone is never claimed verified unless the route and data source match.
@MainActor
final class NativeAudioDiagnosticEngine: NSObject, ObservableObject {
    enum Target: String, CaseIterable, Codable {
        case lowerMicrophone, frontMicrophone, rearMicrophone
    }

    enum Verdict: String, Codable {
        case pass = "PASS"
        case fail = "FAIL"
        case unable = "UNABLE TO TEST"
    }

    struct RouteEvidence: Codable {
        let requestedTarget: Target
        let portType: String
        let portName: String
        let dataSourceID: Int?
        let dataSourceName: String?
        let orientation: String?
        let verifiedRoute: Bool
        let peakDBFS: Float?
        let durationSeconds: Double
        let verdict: Verdict
        let reason: String
    }

    @Published private(set) var availableSources: [AVAudioSessionDataSourceDescription] = []
    @Published private(set) var currentLevelDBFS: Float = -90
    @Published private(set) var isRecording = false

    private var recorder: AVAudioRecorder?
    private var sampleTimer: Timer?
    private var observedPeak: Float = -90
    private var observedFrames = 0
    private var startedAt: Date?
    private var selectedPort: AVAudioSessionPortDescription?
    private var selectedSource: AVAudioSessionDataSourceDescription?
    private var requestedTarget: Target?
    private var routeVerified = false
    private let session = AVAudioSession.sharedInstance()

    func prepare() throws {
        try session.setCategory(.playAndRecord, mode: .measurement, options: [.defaultToSpeaker])
        try session.setActive(true)
        refreshSources()
    }

    func refreshSources() {
        availableSources = session.availableInputs?
            .filter { $0.portType == .builtInMic }
            .flatMap { $0.dataSources ?? [] } ?? []
    }

    /// The caller must supply a model-verified source ID mapping. Never infer
    /// front/rear/lower from array ordering or display names alone.
    func select(target: Target, verifiedDataSourceID: NSNumber?) throws -> Bool {
        requestedTarget = target
        routeVerified = false
        selectedSource = nil
        selectedPort = nil

        guard let id = verifiedDataSourceID,
              let port = session.availableInputs?.first(where: { $0.portType == .builtInMic }),
              let source = port.dataSources?.first(where: { $0.dataSourceID == id })
        else { return false }

        try session.setPreferredInput(port)
        try port.setPreferredDataSource(source)
        try session.setActive(true)

        let actualPort = session.currentRoute.inputs.first(where: { $0.portType == .builtInMic })
        let actualSource = actualPort?.selectedDataSource
        let matched = actualPort?.uid == port.uid && actualSource?.dataSourceID == id
        selectedPort = actualPort
        selectedSource = actualSource
        routeVerified = matched
        return matched
    }

    func startCapture() throws {
        guard routeVerified else {
            throw NSError(domain: "iRepair.Audio", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "Physical microphone route unverified"])
        }
        stopCapture()
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".caf")
        recorder = try AVAudioRecorder(url: url, settings: [
            AVFormatIDKey: Int(kAudioFormatLinearPCM),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVLinearPCMBitDepthKey: 16,
            AVLinearPCMIsFloatKey: false
        ])
        recorder?.isMeteringEnabled = true
        guard recorder?.record() == true else {
            throw NSError(domain: "iRepair.Audio", code: 2,
                          userInfo: [NSLocalizedDescriptionKey: "Microphone capture failed"])
        }
        startedAt = Date()
        observedPeak = -90
        observedFrames = 0
        isRecording = true
        sampleTimer = Timer.scheduledTimer(withTimeInterval: 0.10, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, let recorder = self.recorder, recorder.isRecording else { return }
                recorder.updateMeters()
                let level = recorder.averagePower(forChannel: 0)
                self.currentLevelDBFS = level
                self.observedPeak = max(self.observedPeak, recorder.peakPower(forChannel: 0))
                self.observedFrames += 1
            }
        }
    }

    func finishCapture() -> RouteEvidence {
        let duration = startedAt.map { Date().timeIntervalSince($0) } ?? 0
        let wasRecording = isRecording
        let target = requestedTarget ?? .lowerMicrophone
        let port = selectedPort
        let source = selectedSource
        let verified = routeVerified && wasRecording
        let verdict: Verdict
        let reason: String

        if !verified || duration < 2 || observedFrames < 10 {
            verdict = .unable
            reason = "Route not verified or recording duration insufficient"
        } else if observedPeak < -48 {
            // Silence alone does not prove failure: ambient noise and customer
            // speech must be validated by a guided stimulus or playback check.
            verdict = .unable
            reason = "Low input level; controlled speech stimulus not verified"
        } else {
            verdict = .unable
            reason = "Audio captured; acoustic quality requires playback or signal validation"
        }

        let result = RouteEvidence(
            requestedTarget: target,
            portType: port?.portType.rawValue ?? "unknown",
            portName: port?.portName ?? "unknown",
            dataSourceID: source?.dataSourceID.intValue,
            dataSourceName: source?.dataSourceName,
            orientation: source?.orientation?.rawValue,
            verifiedRoute: verified,
            peakDBFS: observedFrames > 0 ? observedPeak : nil,
            durationSeconds: duration,
            verdict: verdict,
            reason: reason
        )
        stopCapture()
        return result
    }

    func stopCapture() {
        sampleTimer?.invalidate()
        sampleTimer = nil
        recorder?.stop()
        if let url = recorder?.url { try? FileManager.default.removeItem(at: url) }
        recorder = nil
        isRecording = false
        startedAt = nil
    }
}
