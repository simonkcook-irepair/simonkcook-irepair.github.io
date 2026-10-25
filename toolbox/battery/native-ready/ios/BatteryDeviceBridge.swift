//
// BatteryDeviceBridge.swift — Native adapter scaffold for iRepair Toolbox.
// Intended for an Xcode iPhone app project. Not compiled/tested on Xcode yet.
// Only public Apple UIKit, WebKit and Darwin APIs; no private battery methods.
//
import UIKit
import WebKit
import Darwin

/// Returns *only* device information exposed by public iOS APIs.
/// This cannot return Apple's Battery Health maximum capacity or cycle count.
final class BatteryDeviceBridge: NSObject, WKScriptMessageHandlerWithReply {
    private let previousMonitoring: Bool

    override init() {
        previousMonitoring = UIDevice.current.isBatteryMonitoringEnabled
        super.init()
        UIDevice.current.isBatteryMonitoringEnabled = true
    }

    deinit {
        // The owning app can decide whether to keep monitoring enabled.
        // Deliberately do not toggle UIKit global state in deinit.
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage,
        replyHandler: @escaping (Any?, String?) -> Void
    ) {
        guard message.name == "iRepairDevice",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String,
              action == "getSnapshot" else {
            replyHandler(nil, "Unsupported native request")
            return
        }

        let device = UIDevice.current
        device.isBatteryMonitoringEnabled = true
        let level = device.batteryLevel
        let percentage: Any = level >= 0.0 && level <= 1.0
            ? Int((level * 100).rounded())
            : NSNull()

        let chargingState: String
        switch device.batteryState {
        case .charging: chargingState = "charging"
        case .full: chargingState = "full"
        case .unplugged: chargingState = "unplugged"
        default: chargingState = "unknown"
        }

        let snapshot: [String: Any] = [
            "source": "ios-native",
            "modelIdentifier": Self.hardwareIdentifier(),
            "iosVersion": device.systemVersion,
            "chargePercent": percentage,
            "chargingState": chargingState
        ]
        replyHandler(snapshot, nil)
    }

    private static func hardwareIdentifier() -> String {
        var value = utsname()
        uname(&value)
        let length = MemoryLayout.size(ofValue: value.machine)
        return withUnsafePointer(to: &value.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: length) {
                String(cString: $0)
            }
        }
    }

    /// Install before WKWebView content loads. Retain this bridge as long as
    /// the web view is alive. A message reply creates a JavaScript Promise.
    func register(on controller: WKUserContentController) {
        controller.addScriptMessageHandler(self, contentWorld: .page, name: "iRepairDevice")
    }
}
