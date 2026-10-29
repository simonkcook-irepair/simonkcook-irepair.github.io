//
// ChargingDeviceMonitor.swift
// iRepair Toolbox — Native Charging Diagnostics (prototype)
// Genuine public iOS charging recognition and battery-level observations.
// Does NOT measure charging amperage, voltage, USB PD wattage, or port integrity.
//
import Foundation
import UIKit
import Combine

@MainActor
final class ChargingDeviceMonitor: ObservableObject {
    @Published private(set) var batteryPercent: Int?
    @Published private(set) var startingPercent: Int?
    @Published private(set) var connection: UIDevice.BatteryState = .unknown
    @Published private(set) var recognitionConfirmed = false
    @Published private(set) var progressConfirmed = false
    @Published private(set) var interruptions = 0
    @Published private(set) var sampleCount = 0

    private var active = false
    private var originalMonitoringEnabled = false
    private var observers: [NSObjectProtocol] = []
    private var connectionBaselinePercent: Int?
    private var wasPowerConnected = false

    var hasExternalPower: Bool {
        connection == .charging || connection == .full
    }

    // Used by iRepair Core global test orchestrator. A recognised connection
    // need not wait for +1%. Progress independently changes to PASS later.
    var recognitionStatus: String {
        recognitionConfirmed ? "PASS" : "NOT CONFIRMED"
    }

    var progressStatus: String {
        if progressConfirmed { return "PASS" }
        if connection == .full && batteryPercent == 100 { return "NOT APPLICABLE — FULL" }
        return "PENDING"
    }

    func start() {
        guard !active else { return }
        active = true

        let device = UIDevice.current
        originalMonitoringEnabled = device.isBatteryMonitoringEnabled
        device.isBatteryMonitoringEnabled = true

        for name in [
            UIDevice.batteryStateDidChangeNotification,
            UIDevice.batteryLevelDidChangeNotification
        ] {
            observers.append(
                NotificationCenter.default.addObserver(
                    forName: name,
                    object: nil,
                    queue: .main
                ) { [weak self] _ in
                    Task { @MainActor [weak self] in
                        self?.capture()
                    }
                }
            )
        }
        capture()
    }

    func stop() {
        guard active else { return }
        active = false
        observers.forEach { NotificationCenter.default.removeObserver($0) }
        observers.removeAll()

        // Do not switch off monitoring if another owner had enabled it.
        if !originalMonitoringEnabled {
            UIDevice.current.isBatteryMonitoringEnabled = false
        }
    }

    func resetSession() {
        startingPercent = nil
        connectionBaselinePercent = nil
        recognitionConfirmed = false
        progressConfirmed = false
        interruptions = 0
        sampleCount = 0
        wasPowerConnected = false
        if active { capture() }
    }

    private func capture() {
        guard active else { return }
        let device = UIDevice.current
        let state = device.batteryState
        let level = device.batteryLevel

        let percent: Int? = (0...1).contains(level)
            ? Int((Double(level) * 100).rounded())
            : nil
        if startingPercent == nil { startingPercent = percent }

        let connected = state == .charging || state == .full
        if wasPowerConnected && !connected {
            interruptions += 1
        }
        if connected {
            recognitionConfirmed = true
            if !wasPowerConnected {
                connectionBaselinePercent = percent
            }
        }
        connection = state
        batteryPercent = percent

        // A numeric rise while a real charging state is reported is enough
        // for the charging PROGRESS result. Do not require a fixed timer.
        if state == .charging,
           let now = percent,
           let baseline = connectionBaselinePercent,
           now > baseline {
            progressConfirmed = true
        }
        wasPowerConnected = connected
        sampleCount += 1
    }
}
