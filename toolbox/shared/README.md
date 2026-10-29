# iRepair Toolbox — Canonical iPhone device catalogue

**Status:** Audited master model-capability data, 29 October 2026.
**Source:** `iphone-models.json` (40 supported iPhone families).

This is **the single editable source** for the common model names, illustration metadata, connectors, biometric types, cameras, controls and battery/display configurations. Never update a stand-alone app's model rows directly. Use `sync-legacy-models.cjs --write` to create copies of the drawing rows for independent preview bundles and `--check` in CI.

The generator currently covers Audio, Camera, Panic, Motion & Haptics and Connectivity model-illustration source folders. These five independent preview bundles were deployed only after regression checks. The signed-off Charging v11 remains protected and requires a narrowly scoped staged migration; Battery and Screen need separate model-identification reconciliation. Existing deployed sites are **not automatically synchronised** merely because this JSON file was written. Do not present this as automatic remote updates.

### Verification sources

- Apple identify-your-iPhone guide: https://support.apple.com/en-gb/108044
- iPhone Duo specs: https://www.apple.com/uk/iphone-duo/specs/
- iPhone 18 Pro specs: https://www.apple.com/uk/iphone-18-pro/specs/
- iPhone 17e specs: https://www.apple.com/uk/iphone-17e/specs/
- iPhone 16e: https://support.apple.com/en-gb/122208
- Controls by family: https://support.apple.com/en-gb/105103

### Important exceptions and limits

- **iPhone Duo has Touch ID**, not Face ID. Its two front cameras, two displays and two built-in battery packs must be represented separately where applicable.
- iPhone 16e has Qi charging but **not MagSafe**; iPhone 17e supports MagSafe. The iPhone 17e has an Action button but not Camera Control.
- Phones which have a 2x sensor crop are **not necessarily fitted with a separate telephoto camera**. Camera tests must use physical lens discovery in native iOS where possible.
- A model having a microphone at an approximate area never establishes that `getUserMedia` can independently capture that physical microphone. Use AVAudioSession capabilities and customer observations, not fabricated routing.
- Illustration housing dimensions are for proportional diagrams. Component locations require separately verified exact position data. Do not claim independent hardware pass solely because a feature is listed in this JSON.
- Device identification in Safari remains customer selected; native apps can supply verified local model identifiers when supported.

Run validation with `node toolbox/shared/validate-models.cjs`, then run the synchroniser's `--check` command.
