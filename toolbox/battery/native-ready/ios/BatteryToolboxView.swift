//
// BatteryToolboxView.swift — offline WKWebView integration example.
// Drop bundled index.html, core.js, engine.js into the Xcode "BatteryWeb"
// resource folder. This is a native adapter scaffold, not an App Store release.
//
import SwiftUI
import WebKit

struct BatteryToolboxView: UIViewRepresentable {
    final class Coordinator: NSObject {
        let batteryBridge = BatteryDeviceBridge()
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        context.coordinator.batteryBridge.register(on: controller)

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.allowsInlineMediaPlayback = true

        let view = WKWebView(frame: .zero, configuration: config)
        view.isOpaque = false
        view.backgroundColor = UIColor(
            red: 232.0 / 255.0,
            green: 245.0 / 255.0,
            blue: 255.0 / 255.0,
            alpha: 1.0
        )
        view.scrollView.contentInsetAdjustmentBehavior = .never

        if let entry = Bundle.main.url(
            forResource: "index", withExtension: "html", subdirectory: "BatteryWeb"
        ) {
            view.loadFileURL(entry, allowingReadAccessTo: entry.deletingLastPathComponent())
        } else {
            assertionFailure("BatteryWeb/index.html is not bundled with this app.")
        }
        return view
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // The embedded web UI handles its own guided state transitions.
    }
}
