//
// CameraDeviceBridge.swift — future iRepair Camera Diagnostics iOS integration.
// Public AVFoundation discovery only. NOT compiled or tested on physical iPhone.
// This scaffold never claims that camera hardware has passed any optical test.
//
import UIKit
import AVFoundation
import WebKit
import Darwin

final class CameraDeviceBridge: NSObject, WKScriptMessageHandlerWithReply {
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage,
        replyHandler: @escaping (Any?, String?) -> Void
    ) {
        guard message.name == "iRepairCameraDevice",
              let request = message.body as? [String: Any],
              request["action"] as? String == "inventory" else {
            replyHandler(nil, "Unsupported camera request")
            return
        }

        let types: [AVCaptureDevice.DeviceType] = [
            .builtInWideAngleCamera,
            .builtInUltraWideCamera,
            .builtInTelephotoCamera,
            .builtInTrueDepthCamera
        ]

        let found = AVCaptureDevice.DiscoverySession(
            deviceTypes: types,
            mediaType: .video,
            position: .unspecified
        ).devices

        let inventory: [[String: String]] = found.map { device in
            let facing: String
            switch device.position {
            case .front: facing = "front"
            case .back: facing = "back"
            default: facing = "unknown"
            }
            return [
                "deviceType": device.deviceType.rawValue,
                "position": facing,
                "localizedName": device.localizedName
            ]
        }

        let permission: String
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: permission = "authorized"
        case .denied: permission = "denied"
        case .restricted: permission = "restricted"
        case .notDetermined: permission = "notDetermined"
        @unknown default: permission = "unknown"
        }

        replyHandler([
            "source": "ios-native",
            "schema": 1,
            "modelIdentifier": Self.hardwareIdentifier(),
            "cameraAccess": permission,
            "discoveredDevices": inventory
        ], nil)
    }

    func install(on controller: WKUserContentController) {
        controller.addScriptMessageHandler(self, contentWorld: .page, name: "iRepairCameraDevice")
    }

    private static func hardwareIdentifier() -> String {
        var info = utsname()
        uname(&info)
        let capacity = MemoryLayout.size(ofValue: info.machine)
        return withUnsafePointer(to: &info.machine) { ptr in
            ptr.withMemoryRebound(to: CChar.self, capacity: capacity) {
                String(cString: $0)
            }
        }
    }
}

/*
 Next native milestones, outside the completed Safari app:
 1. Build a signed standalone iOS SwiftUI camera UI and AVCaptureSession.
 2. Request NSCameraUsageDescription permission explicitly before capture.
 3. Select *physical* wide/ultra-wide/telephoto camera sources using
    AVCaptureDevice.DiscoverySession where the current iPhone supports them.
    Do not assume every device type is available on every model.
 4. Confirm the actual active AVCaptureDevice for each step. Virtual dual
    and triple devices can switch constituent optics automatically.
 5. Guide/check autofocus, exposure, flash and captured-image visual
    observations. Avoid claiming objective physical hardware PASS/FAIL
    without a verified and reproducible measurement method.
 6. Treat TrueDepth/Face ID biometric validation as a separate domain:
    a functioning front camera is not proof of working Face ID.
 7. Validate captured-device evidence against model identity and
    hardware capability data on real iPhones before shipping.
 8. No images uploaded without explicit, informed user authorisation.
*/
