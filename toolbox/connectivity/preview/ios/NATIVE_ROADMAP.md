# Native connectivity implementation guide
Preserve the approved premium glass UI and customer-first two-panel pattern.

1. **NWPathMonitor (network path).** Show the genuinely active interface types
(Wi-Fi, cellular) and path status, not hidden system IDs. Test reachable app
endpoint in a controlled NSURLSession/NWConnection request with a timeout and
safe tiny payload. "Response received" is not antenna certification. Where
path is captive or unsatisfied, explain without declaring radio hardware bad.
2. **CoreBluetooth.** Request permission when used, show CBCentralManager
state, try BLE discovery with a specific test peripheral (if present). This
cannot broadly establish Classic Bluetooth audio, Wi-Fi or AirDrop health.
3. **CoreLocation.** Request when-in-use permission on deliberate customer
action, handle reduced accuracy and timeouts, then discard precise coordinates
after computing the immediate result. Avoid server logs containing coordinates.
4. **Manual guided AirDrop.** Apple does not offer public arbitrary AirDrop
interoperability/diagnostic readout: use customer confirmation.
5. **Mobile data and Wi-Fi.** Use actual NWPathMonitor classification and
reachability, but don't claim baseband electrical status or low-level RSSI.
6. **Reporting.** Keep a precise split between measured browser/native outcomes
and user observations, and preserve Pass / Fail / Unable.

Native source is not compiled here. iPhone real-device validation and App Store
signing/Apple Developer membership needed.
