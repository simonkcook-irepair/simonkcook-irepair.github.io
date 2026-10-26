//
// AudioDeviceBridge.swift — future iRepair Audio Diagnostics iOS integration.
// Public iOS APIs only; NOT compiled or tested against an iPhone yet.
// Device identification does NOT imply microphone/speaker isolation.
//
import UIKit
import WebKit
import Darwin

final class AudioDeviceBridge: NSObject, WKScriptMessageHandlerWithReply {

    func userContentController(
        _ controller: WKUserContentController,
        didReceive message: WKScriptMessage,
        replyHandler: @escaping (Any?, String?) -> Void
    ) {
        guard message.name == "iRepairAudioDevice",
              let payload = message.body as? [String: Any],
              let action = payload["action"] as? String,
              action == "identifyDevice" else {
            replyHandler(nil, "Unsupported native audio request")
            return
        }
        replyHandler([
            "source": "ios-native",
            "modelIdentifier": Self.hardwareIdentifier()
        ], nil)
    }

    private static func hardwareIdentifier() -> String {
        var value = utsname()
        uname(&value)
        let length = MemoryLayout.size(ofValue: value.machine)
        return withUnsafePointer(to: &value.machine) { pointer in
            pointer.withMemoryRebound(to: CChar.self, capacity: length) {
                String(cString: $0)
            }
        }
    }

    func install(on userContentController: WKUserContentController) {
        userContentController.addScriptMessageHandler(
            self, contentWorld: .page, name: "iRepairAudioDevice"
        )
    }
}

/*
 NATIVE DEVELOPMENT / TEST GATE:
 - AVAudioSession availableInputs/inputDataSources are hardware dependent.
 - Native may request preferred microphone data source where available and
   verify the selected input; not every iPhone exposes isolated sources.
 - Receiver/speaker routes must be physically tested and their effective
   audio route checked. Stereo channel selection is NOT proof of routing.
 - The browser's live dBFS meter reports its current mic input, not a
   calibrated sound-pressure level or proof of each physical mic.
 - Audio recovery sounds must remain user-controlled, brief, interruptible,
   with no assertion that they repair liquid/dirt damage.
 - Complete SwiftUI app, AVAudioSession routing, audio interruption handling,
   permission strings and on-device test matrix are still required.
*/
