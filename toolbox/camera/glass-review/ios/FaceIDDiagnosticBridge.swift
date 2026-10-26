//
// FaceIDDiagnosticBridge.swift — future native-only iRepair Camera Diagnostics.
// This scaffold has not been compiled or validated on a physical iPhone.
// No Face ID image, biometric template, depth map or passcode is accessible.
//
import Foundation
import LocalAuthentication
import WebKit

final class FaceIDDiagnosticBridge: NSObject, WKScriptMessageHandlerWithReply {
    // Invoke exclusively on an explicit customer "Check Face ID" tap, not
    // automatically at launch or when entering a camera test screen.
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage,
        replyHandler: @escaping (Any?, String?) -> Void
    ) {
        guard message.name == "iRepairFaceID",
              let request = message.body as? [String: Any],
              request["action"] as? String == "authenticateFaceID" else {
            replyHandler(nil, "Unsupported biometric request")
            return
        }

        let context = LAContext()
        var availabilityError: NSError?
        let available = context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &availabilityError
        )
        // The type is determined only after canEvaluatePolicy has been called.
        guard context.biometryType == .faceID else {
            replyHandler([
                "source": "ios-native",
                "status": "unsupported",
                "reason": "Face ID is not available on this device"
            ], nil)
            return
        }
        guard available else {
            replyHandler([
                "source": "ios-native",
                "status": "unavailable",
                "errorCode": availabilityError?.code ?? 0
            ], nil)
            return
        }

        context.localizedCancelTitle = "Cancel check"
        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Confirm Face ID recognition for iRepair Camera Diagnostics"
        ) { success, error in
            DispatchQueue.main.async {
                // A failed/cancelled/locked-out attempt is NOT independently
                // diagnostic of a defective dot projector or TrueDepth camera.
                replyHandler([
                    "source": "ios-native",
                    "status": success ? "authenticated" : "notConfirmed",
                    "errorCode": (error as NSError?)?.code ?? 0
                ], nil)
            }
        }
    }

    func install(on controller: WKUserContentController) {
        controller.addScriptMessageHandler(
            self, contentWorld: .page, name: "iRepairFaceID"
        )
    }
}

/*
 Native implementation/acceptance gate:
 - Add NSFaceIDUsageDescription to Info.plist:
   "Allow Face ID to confirm that biometric authentication works during
    your optional iRepair Camera Diagnostics check."
 - Call via an explicit in-app gesture, not on page load.
 - Use .deviceOwnerAuthenticationWithBiometrics, not a policy allowing a
   passcode fallback that could be mislabelled as a Face ID success.
 - 'authenticated' proves only that iOS accepted biometric authentication;
   it DOES NOT separately prove infrared camera, flood illuminator,
   dot-projector, selfie camera, or individual TrueDepth component health.
 - Distinguish not enrolled, biometric lockout, consent cancellation,
   unsupported hardware and an authentication refusal from hardware faults.
 - Do not solicit, record or transmit passcodes, IR images or templates.
 - Test iPhone X and subsequent Face ID-equipped iPhone families and
   confirm no Face ID flow appears on iPhone SE/Touch ID models.
 - Require real iPhone, iOS/Xcode, entitlement/privacy and App Store tests.
*/
