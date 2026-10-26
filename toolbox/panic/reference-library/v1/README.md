# iRepair Toolbox — Curated Panic Reference Library

**Independent public read-only endpoint:** https://irepair-panic-reference-library-simon-cook.vercel.app/latest.json  
**Hosting:** Vercel project `irepair-panic-reference-library`, ID `prj_4VecPn1eMmCWuJHOxFBYEc9i97pL`.  
**Initial deployment:** `dpl_2Fbd3RguZAdw1SpmW6DtdjZEoisk`.  
**Version:** `2026.10.26.1` — **last human-reviewed 26 October 2026**.

This endpoint is a **curated publication of verified references**, *not* a crawler querying every repair site on each app launch. At launch, Panic Diagnostics requests this JSON using a cache-bypassing GET, validates the schema, displays actual review date/version, and applies only additional conservative matched guidance. If offline or invalid, it reports that fact and continues with the app's original local signatures.

## Source review and publication policy
1. Monitor reputable and legally reusable references for additional codes and changes: iFixit `iPhone Kernel Panics`, Repair Wiki, Check Panic Full (respect terms/licensing) and Apple official sources.
2. Record each **candidate** with date discovered, complete source URL, affected iPhone model(s), iOS version if relevant, example **sanitised** panic string and competing explanations.
3. Require explicit human approval of evidence and phrasing. Do not infer a confirmed faulty part solely from one panic report. Do not copy proprietary tables into this feed without licence.
4. Add vetted data to `latest.json`, increment `version`, set `reviewedDate` to the actual review date and keep the previous feed deployment for rollback.
5. Run `node toolbox/panic/glass-review/tests/reference-tests.js` from the repository root. Run mobile browser integration, including remote fetch/retry/offline, with public Safari review URL before publishing.
6. Redeploy **only the separate reference-library Vercel project** with `latest.json` and `vercel.json`. The already installed browser/native iRepair Diagnostics app does **not** need a code update for supported new rules.
7. Verify the endpoint returns HTTP 200, CORS allows direct app GET, the new version and review date are truthful and the app shows new guidance on launch. Roll back data if an interpretation proves misleading.

## Format and safeguards
- `schema` 1, `library` exact identifier, version `YYYY.MM.DD.N`, real `reviewedDate`.
- `sources[]` must link to approved HTTPS reference sites; future domains require a reviewed code change.
- `rules[]`: stable ID, literal `match` token (not server-supplied regex), cautious `title`, `summary`, `action`, `grade` and `sourceId`.
- No customer-supplied panic logs, device identifiers or model history are ever included in GET requests. The read-only feed cannot collect an original file.
- Only extracted panic strings—not unrelated analytics metadata—are matched. Remote guidance is **supplementary** and cannot replace or elevate the local panic classifier's hardware determination.
- A human-reviewed, dated catalogue is not a guarantee that every new Internet discovery is already covered. For old (>60 days) review dates, the app explicitly labels it an older review.

## App-source relationship
- Locked original Panic prototype: branch `toolbox/panic-glass-review-2026-10-26` (original approved deployment `dpl_77yxJ2GUiBxmrJ8oo1f7MMp8Nzh5`).
- Explicitly authorised live-reference patch: `toolbox/panic-live-references-2026-10-26`.
- Feed consumer: `toolbox/panic/glass-review/reference.js` + scoped status UI in index/app. Legacy core parser unchanged except exporting `extractPanic` for additional evidence.
- Other approved Screen/Battery/Audio apps are never altered.

## Source
- https://www.ifixit.com/Wiki/iPhone_Kernel_Panics (checked 26 October 2026)
- https://developer.apple.com/documentation/metrickit (app-specific reports, **not** device-wide silent panic log access).

**Native limitation:** iOS third-party App Store apps cannot presume unrestricted background access to Settings Analytics Data. Continue with user-initiated log import or native Share extension until Apple provides a documented public capability.
