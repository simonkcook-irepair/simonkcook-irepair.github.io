# iRepair Toolbox — Panic Diagnostics premium glass review

**Prepared:** 26 October 2026  
**Status:** Live browser **review candidate**. Not yet user-approved or final, and not a native iOS application.

## Existing prototype and scope

The existing `toolbox/panic/index.html` and `toolbox/panic/panic.js` on `main` were preserved as the original baseline. This new **isolated implementation** preserves its key panic categories (thermal monitoring, missing sensors, MIC1/2/3, PRS0, TG0B, TG0V, SMC, AOP, watchdog), user-selected `.ips` file/pasted-text support, optional handset context, local processing and technician report. It modernises parsing and UX without treating a signature as proof of a specific component.

## Live Safari preview

**https://irepair-panic-glass-review-simon-cook.vercel.app/**

- Vercel project: `prj_KITMmrd0sZHxGnnTFZ3bq3LMS8qf`.
- Current reviewed deployment: `dpl_77yxJ2GUiBxmrJ8oo1f7MMp8Nzh5`.
- Earlier review deployment (rollback): `dpl_A8nfMq723EWBA8TBzP3J8TGuzURp`.
- Previous review deployment for rollback: `dpl_9HgtpwLuMqh9PVp4DmYJ1bdVyMTm`.
- Source branch: `toolbox/panic-glass-review-2026-10-26`.
- Source folder: `toolbox/panic/glass-review/`.

## Files

- `index.html` — user-approved iRepair glass style and full-size animated handset, adapted for panic review; short local-import flow; results, technician details and print-friendly styling.
- `models.js` — isolated copy of the Audio Diagnostics model catalogue. Same **user-locked year-grouped newest-to-oldest model selector** using native `optgroup`; the new copy uses Apple-confirmed current 2026 release naming. The locked Audio catalogue itself is not changed.
- `core.js` — pure structured panic/NDJSON/text parser, model-code metadata recognition and *preliminary* interpretation; no network/storage access; sanitised excerpt and privacy-conscious report generator.
- `app.js` — Safari `FileReader` import, autoflow, optional user model, clipboard/share/print and reset.
- `tests/core-tests.js` — 17 deterministic regression cases.
- `tests/browser-qa.js` — iPhone-viewport interactive end-to-end tests, run with Playwright and Chromium.

## User journey

1. Consistent Toolbox landing matching the **completed and locked** Screen, Battery and Audio app appearance: logo, icy-blue glass, front-facing handset, animated diagonal shine, information card and glossy blue CTA.
2. **Choose panic-full log** from Files; reads locally and starts analysis immediately. Files with `.ips.ca.synced`, `.ips`, `.json` or plain text can be inspected. *No restrictive input `accept` list prevents iOS Files selection*. Obvious unrelated PDF/images/media are rejected clearly; 30 MB input ceiling.
3. If no file, a collapsed **paste panic text** alternative is available.
4. Handset model is extracted from explicit `productType` / similar metadata only when found; otherwise the customer can expand the familiar **year-grouped iPhone model dropdown**. No required model selection and no arbitrary model guessing.
5. Report shows classification, recognised token clues, a concrete *investigation* next step and an explicit limitations statement. Detailed sanitised snippet is optional and collapsed.
6. One-tap Copy technician report, optional Share, browser Save/Print PDF layout, clear state for another log.

## Safety / interpretation boundaries

- This is **log interpretation, not hardware-level testing**. For example, `MIC1` does **not** automatically prove a faulty physical microphone/flex, charging port or logic-board IC; exact mappings vary across model/revision and require a verified case knowledge base.
- A single log is not evidence of recurring faults. It does not establish recurrence or causal certainty.
- Missing panic-full records or unsupported signatures return insufficient/unclassified states—not a hardware PASS, FAIL or fabricated diagnosis.
- The raw imported text is processed in browser memory only, is not POSTed/uploaded, and is cleared from the paste field after use. A diagnostic report contains safe recognised labels and recommendation, **not the original file text**. Optional on-screen excerpt is sanitised by redaction rules, but any user-supplied diagnostics should still be treated as potentially sensitive.
- Browser Safari cannot access protected Analytics Data itself. Customers must choose/share an existing panic-full record. The future native app should also request explicit user permission using the document picker or Share extension.
- If someone uploads a log from a different phone, **do not use the technician's native handset identifier as a substitute** for the device represented by that file. Prefer metadata from the imported log and user-confirmed model.
- Native iOS and App Store implementation are **not complete**; no private system-log access or undocumented APIs should be used.

## Test verification (26 October 2026)

Verified in Chromium at 390×844 and 375×667, and repeated **against the public deployed URL**:
- Landing appearance/viewport horizontal overflow: PASS.
- Exactly the approved model selector chronology `2026,2025,2024,2023,2022,2021,2020,2019,2018,2017`: PASS.
- Real browser file-picker flow with `.ips.ca.synced` and combined JSON+NDJSON model/panicString: PASS.
- Automated sensor-clue interpretation, `MIC1` + `TG0B` recognised without hardware claims: PASS.
- Model name imported from `iPhone18,2`, explicit customer model override and pasted log: PASS.
- Wrong file / non-panic log: helpful, non-misleading response: PASS.
- Clipboard report excludes injected private identifiers, optional redacted snippet: PASS.
- A4 results-only print CSS: PASS (not physically tested with iPhone PDF creation).
- App generated no analytics POST requests in the browser test: PASS.
- 17 pure core regression tests: PASS.
- Live published HTML, JS and model catalogue: HTTP 200, source byte-for-byte matching inspected files.
- All three completed Screen, Battery and Audio websites returned HTTP 200; no code or deployment changes to them.

## Native and production roadmap

- Maintain and validate a **model-by-model panic-signature mapping and evidence database** using verified real repair outcomes and Apple public information where possible. The present heuristics are *cautious preliminary triage* rather than a professional definitive component mapping.
- Add native `UIDocumentPickerViewController` or SwiftUI `fileImporter`, optional Share extension, without requesting protected system-log access. Source: https://developer.apple.com/documentation/uikit/uidocumentpickerviewcontroller
- Preserve on-device privacy, explicit permissions and honest evidence provenance.
- Verify on physical iPhone Safari, test real model-specific logs and confirm result wording before calling Panic Diagnostics completed.
- Native standalone iOS app, Xcode compilation, signing, PDF export and App Store acceptance remain later milestones after the Apple Developer Programme.

## Freeze policy

- Completed Screen Diagnostics **LOCKED**.
- Completed Battery Diagnostics **LOCKED**.
- Completed Audio Diagnostics **LOCKED**.
- Their model selector design is **LOCKED** as the standard for future apps.
- **Panic Diagnostics is only a comparison review**; no promotion/finalisation until explicit user approval. Prior original Panic source is preserved, and the new Vercel project is separate.

Reference for current release-year names: https://support.apple.com/en-gb/108044 .

## October 26 final review QA and product-code enhancement

**Corrected public Safari preview:** https://irepair-panic-glass-review-simon-cook.vercel.app/  
**Verified deployment:** `dpl_77yxJ2GUiBxmrJ8oo1f7MMp8Nzh5`.

The parser now recognises `product: "iPhone18,2"`, a common model identifier in actual two-section Apple `panic-full` files, in addition to the older `productType`, `deviceModel`, etc. This gives reliable identification where a verified catalogue mapping exists without introducing another customer form. Unverified codes are displayed without invented model names.

A short **Choose your iPhone model** correction action appears on the results only when the model is unavailable or conflicting. This opens the existing user-approved newest-first, year-grouped iPhone selector; selecting the handset returns to the same parsed report without re-uploading the file. **Check another log** clears any previous manual model selection, preventing a wrong handset being silently attributed to another customer's log.

**Current live browser QA:**
- GitHub branch index, model catalogue, pure parser and app engine match deployed assets byte-for-byte: PASS.
- The source already includes 17 repeatable pure-code regression tests at `tests/core-tests.js`, all PASS; additional `product` and model-correction cases tested interactively.
- Simulated iPhone Safari 390×844: premium handset/design; native Files file chooser; .ips.ca.synced upload; automatic sensor extraction and model mapping; privacy-safe optional technician signature; copyable report; A4 report-only print CSS: PASS.
- Year groupings in required descending 2026 → 2017 order: PASS.
- Re-selecting the same file, rejecting a PDF, pasted-log fallback and clearing pasted data: PASS.
- Correcting missing model from results, returning directly to the report, clearing stale model when analysing a different log, and extracting `product` from an Apple-style split JSON panic log: PASS on the **published** site.
- Simulated viewport widths 375, 390 and 430 pixels: no horizontal overflow, PASS.
- User data is parsed locally; no analytics POST request was made, PASS.
- The completed and locked Screen, Battery and Audio sites each remain accessible (HTTP 200), with no changes to their sources or deployments.

**Remaining acceptance gate:** The user must personally inspect the actual Safari app on an iPhone, compare its appearance with the locked tools and try a real panic-full file. This working review is **not** marked complete or locked until the user explicitly approves it.

**Important native distinction:** Native applications should not equate the host phone's hardware identifier with the log's source-device identity because technicians may import a panic log from a different iPhone. Use explicit log metadata or a customer-confirmed model for the report.

**Sources for panic report structure and conservative interpretation:** Apple device analytics https://www.apple.com/uk/legal/privacy/data/en/device-analytics/ and iFixit kernel panic overview https://www.ifixit.com/Wiki/iPhone_Kernel_Panics .
