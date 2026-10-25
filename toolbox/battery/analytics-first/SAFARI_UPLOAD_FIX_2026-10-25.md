# Battery Diagnostics — iPhone Safari file picker fix and model identification

**Date:** 25 October 2026  
**Status:** UPDATED REVIEW VERSION — physically unverified on the user's iPhone.

## User-reported defect
- User liked the new clean, simplified Battery Diagnostics appearance.
- User expected the iPhone model to be identified from analytics where possible, without a model-choice form.
- Clicking **Upload Analytics File** opened Files, but after choosing an analytics file nothing visibly happened.

## Diagnosis: plausible causes, not yet confirmed on physical Safari
1. The previously deployed file input was an effectively clipped **1 × 1 px** element behind a label. Desktop Chromium accepted it, but it is a brittle native iOS Files-picker interaction.
2. The browser file dialog declared an `accept` list and the JavaScript rejected filenames unless they ended in `.ips`, `.txt`, `.json` or `.log`. Apple analytics filenames can instead end in `.ips.ca.synced`; these files were excluded or rejected.
3. The UI did not display a status as soon as Files was opened, making a failure appear silent.
4. Selecting the same filename on consecutive attempts might not dispatch another `change` event unless the input was cleared.

## Scoped fix
- Reuse the **identical approved visual design** and premium illustrated handset, unchanged landing-page markup. Only file-input interaction and small upload-help text were modified.
- The file input now covers the entire large glowing upload button as a native transparent interactive element.
- Removed restrictive `accept` list; recognise compatible text by contents, not a narrow extension whitelist. Obvious PDFs/images/media are rejected with a helpful error. `.ips.ca.synced` supported.
- Read the selected file with `FileReader.readAsText` (with `file.text()` fallback where available), update visible status immediately on opening/selection, and display specific errors for cancelled selection, invalid, empty, unreadable or oversized files (40 MiB max).
- Clear the picker before each tap so the same file can be reselected. Respond to both `input` and `change` events without duplicate analysis. Catch picker `cancel` and explain what happened.
- Versioned script URL `engine.js?v=safari-file-fix-2` to avoid stale Safari JavaScript caches.
- Added **automatic device identification** from explicit recognised `productType`, `product_type`, `_productModel`, `deviceModel`, `device_model`, `modelIdentifier` etc. values such as `iPhone18,2`. Mapped only verified iPhone identifiers. Unknown codes remain raw; if the log lacks a model identifier or contains several conflicting identifiers, no model is fabricated.
- Device identification appears on the results screen and in the copyable report. The raw analytics file is processed locally and not transmitted.

## Published revision
- **Live Safari review:** https://irepair-battery-simple-review-simon-cook.vercel.app/
- **New deployment:** `dpl_FVp1Q8mc7zSqxozJ6EPZN36x8LoZ`
- **Previous review deployment:** `dpl_9LjhSiyLzjxgQX48iMGJQGWT2bfr` retained for rollback.
- **Source branch:** `toolbox/battery-safari-file-fix-2026-10-25`
- **HTML commit:** `f414501624dd1d1368f3314a71cd2b92a14717ac`
- **JavaScript commit:** `8b161a3c0c89f198845668195f9b80b387286119`
- Source files: `toolbox/battery/analytics-first/index.html`, `toolbox/battery/analytics-first/engine.js`.

## Verification
- `node --check`: PASS.
- Desktop Chromium configured at iPhone dimensions: tapping the real upload surface triggers the native file picker event (PASS).
- Chosen sample `Analytics-2026-10-25.ips.ca.synced`, even with generic octet-stream MIME: automatically recognises `iPhone18,2` as **iPhone 17 Pro Max** and extracts 86–88% capacity / 427–433 cycles (PASS).
- Repeating an upload using **the same filename** but different data triggers new analysis (PASS).
- Unrecognised model code is displayed as raw technical identifier without inventing an exact device name (PASS).
- Missing and conflicting identifiers show honest statuses (PASS).
- Non-analytics document selection and file picker cancellation both yield visible feedback (PASS).
- One-question no-file fallback remains intact (PASS).
- No POST uploads of raw selected file data detected (PASS).
- The published HTML and JS each returned HTTP 200 and matched the tested source byte for byte. All cases repeated against the **public deployed review URL**: PASS.
- Completed Screen Diagnostics and older battery versions: unchanged.

## Outstanding real-device gate
iOS Safari's Files picker could not be exercised on a physical iPhone from this environment. A Linux attempt to install Playwright WebKit returned "Playwright does not support webkit on ubuntu26.04-x64." User must try an actual analytics file on iPhone Safari before calling this fixed or final.

## Sources
- Apple iPhone analytics privacy: https://www.apple.com/uk/legal/privacy/data/en/device-analytics/
- iPhone model identifier mappings: https://theapplewiki.com/wiki/Models/iPhone
- Example iOS analytics files can contain `last_value_CycleCount` and `last_value_MaximumCapacityPercent`, and are not guaranteed to include all fields.

## Change-control
**Do not touch:** completed Screen Diagnostics, original Battery Diagnostics, earlier redesigned Battery Diagnostics, or the overcomplicated enhanced battery experiment. Keep this preview isolated until actual iPhone sign-off.
