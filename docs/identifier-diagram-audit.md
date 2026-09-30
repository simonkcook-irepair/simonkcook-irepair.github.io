# Camera identification diagram audit — 30 September 2026

The live identification route uses `build12.js` cards and `ID12_MODELS`, rather than the older photographic `ID10_IMG` / `ID11_IMG` cards. Its text-based dot icons collapsed leading spaces and rendered the diagonal option vertically.

Fixed-position SVG diagrams now show the feature being compared. They are position diagrams, not photographs or exact scale drawings. Each diagram is keyed by the same layout value as its label and answer button; no model routes or pricing changed.

| Key | Label / diagram | Model family represented |
| --- | --- | --- |
| s | One corner lens | Standard single-camera iPhones |
| sp | One lens in a wide bar | iPhone Air |
| dh | Horizontal pair | iPhone 7 Plus / 8 Plus |
| ds | Vertical pair in a narrow housing | iPhone X / XS / XS Max |
| dv | Vertical pair in a square housing | iPhone 11 / 12 / 12 mini |
| dd | Top-left and bottom-right pair in a square housing | iPhone 13 / 13 mini / 14 / 14 Plus / 15 / 15 Plus |
| dn | Vertical pair in a slim pill | iPhone 16 / 16 Plus / 17 |
| ts | Three lenses in a triangle in a square housing | Pro families through iPhone 16 |
| tp | Three lenses in a triangle in a wide housing | Pro families with a wide camera plateau |

The foldable option retains its fold symbol; this change does not invent a camera-position reference for it. Other identification criteria retain their labelled symbols and the A-number fallback.

References checked:

- [Apple: Identify your iPhone model](https://support.apple.com/en-gb/108044): manufacturer model descriptions and accompanying rear images.
- [Apple: iPhone 13 and 13 mini introduction](https://images.apple.com/uk/newsroom/2021/09/apple-introduces-iphone-13-and-iphone-13-mini/): expressly describes the diagonal rear camera arrangement.

Verification checks inspect rendered lens geometry (including the two diagonal offsets, vertical alignment, horizontal alignment and non-collinear Pro lenses), distinct square/pill housings, and the actual diagonal/vertical answer routes into the model candidates. Existing customer, catalogue, Relay and technician checks run unchanged.
