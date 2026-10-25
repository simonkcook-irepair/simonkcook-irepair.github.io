# Battery Diagnostics — Expanded Analytics Insights (Review v3)

**Date:** 25 October 2026  
**Status:** User review required; not accepted/locked.

## User-reported result and request
After uploading an actual iPhone analytics file, the customer-facing app showed:
- Model: Not identified
- Maximum capacity: Not available
- Cycle count: **129**
- Result banner: “Battery information found”

User wants **more useful diagnostic information with no customer data-entry burden** and asks how this will be achieved.

## Technical assessment
The existing parser recognised only six-ish cycle-count/max-capacity field aliases and an explicit model-code allowlist. Many genuine analytics files omit maximum capacity, report `null`, or include extra battery telemetry under raw names such as `last_value_AppleRawMaxCapacity`, `last_value_NominalChargeCapacity`, `last_value_MaximumFCC`, `last_value_MaximumQmax`, `last_value_AverageTemperature`, etc. We **cannot** infer genuine battery health % or fault state from 129 cycle count alone. We must not convert unlabeled raw capacity telemetry into a fabricated percentage.

## Changes implemented — simple customer-first design preserved
1. If the selected log contains cycle count but no health percentage, the clear result banner now says **“Partial battery information”**, rather than implying full diagnostics, with a concise explanation that 129 cycles alone cannot establish health.
2. The existing first screen, one-tap **Upload Analytics File** pathway, no-file fallback, model auto-detection and core copyable report remain. The approved premium glass design, illustrated phone and animations are unchanged.
3. An **optional collapsed technical details** section shows only recognised technical fields when present, including raw maximum capacity, nominal capacity, maximum FCC/Qmax, operating-time counter and historical temperature counters. Every value explicitly says **raw**, not as verified mAh / current / real-time temperature / genuine part / battery-health percentage.
4. Additional telemetry field names are discovered with a conservative battery-related key filter; excluded strings include serial, device ID, account, location, IMEI, tokens, personal names.
5. **Copy battery field summary** produces only recognised numeric fields plus a sanitised list of other *key names*, with **no raw file text**. User can paste this summary into ChatGPT to help identify unsupported keys without uploading the entire analytics file to chat.
6. Raw telemetry is always labelled non-calibrated and never used automatically to trigger a hardware FAIL.
7. Safe padding added at the bottom of the results page to keep copy controls clear of iPhone Safari UI.

## Live review and rollback
- **Updated customer review:** https://irepair-battery-simple-review-simon-cook.vercel.app/
- **Vercel deployment:** `dpl_7nVkx7k8J9fsY7jQrLjYTjcBHdJ4`
- **Source branch:** `toolbox/battery-expanded-insights-2026-10-25`
- **HTML change commit:** `cfe08f5cc5efd3b710246df0523d7abbbe57de2d`
- **Parser change commit:** `4b10baf113cef1dfbf957e55fec60560fbd776c6`
- Previous Safari upload-fix deployment `dpl_FVp1Q8mc7zSqxozJ6EPZN36x8LoZ` retained for rollback.
- Completed Screen Diagnostics unchanged and verified via public HTTP 200 and original build marker.

## Verification
Public deployed HTML and JavaScript returned HTTP 200 and matched tested source byte for byte.
Automated 390×844 mobile Chromium tests on **actual public review URL**:
- 129 cycles plus no maximum-capacity percentage → PARTIAL status; transparent customer explanation; PASS.
- CoreAnalytics-like record with additional raw capacity, FCC, Qmax and temperature telemetry → collapsed technician details; PASS.
- Sanitised field summary contains recognised battery readings and key names but excludes arbitrary device ID, personal identifier values and serial fields; PASS.
- Report includes raw evidence with explicit non-calibration, without falsely calculating health; PASS.
- Recognised health percentage + iPhone model code still works; PASS.
- File with null battery fields → UNABLE TO TEST; PASS.
- One-question guided fallback remains and hides technician sections; PASS.
- No POST request carrying log contents; PASS.

## Remaining essential work
**The actual file was NOT attached to this conversation.** It is essential to inspect the **field summary of the user's real 129-cycle file**, since results cannot prove whether the missing percentage is genuinely absent or under an unsupported key. Ask user to open updated review app, import **same file**, expand **View additional battery details**, press **Copy battery field summary**, paste the sanitised text into chat. Alternatively they may voluntarily attach the actual .ips file (it can contain device analytics identifiers), but the field-summary approach is preferred for privacy.

Do not claim this browser checks real battery health, charging current or temperature automatically; native public `UIDevice` APIs expose battery level and battery state but do not automatically grant maximum capacity and cycle count.

## Sources for raw field presence and user guidance
- Apple official battery support: https://support.apple.com/en-gb/106348
- Apple privacy: https://www.apple.com/uk/legal/privacy/data/en/device-analytics/
- Example CoreAnalytics battery fields: https://gist.github.com/extratone/779152d7038e6e10db3146566a3cb341
- Source evidence of direct metrics and deliberately cautious fallback: https://github.com/Panaikran/ios-analytics-file-parser

## Change control
Only the unapproved Battery Diagnostics review was updated. Do not modify locked Screen Diagnostics, original Battery Diagnostics source, separate enhanced comparison versions or any iRepair Core functionality. Keep visuals and simplicity protected.
