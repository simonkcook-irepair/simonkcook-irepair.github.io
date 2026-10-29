# Connectivity Diagnostics — final browser-prototype sign-off QA

Date: 29 October 2026

**Approval status:** READY FOR OWNER VISUAL REVIEW — **NOT YET SIGNED OFF**.
Do not infer owner approval or lock this prototype until the user expressly approves the final app experience.

Current production review: https://irepair-connectivity-review-simon-cook.vercel.app/
Vercel deployment: `dpl_FH1ufAVpAZ5VJknwLUVHwLBWHKsv` (READY).
Checked source branch: `toolbox/connectivity-catalogue-integration-2026-10-29`.
Checked source commit: `1255b6fd91f0e9923b9d2be932ef9efdaec0d7c3`.

## Verified 29 October 2026

- Pure JS engine: **40 / 40 passing** (`tests/core-tests.js`).
- Catalogue and evidence assertions: **9 / 9 passing** (`tests/catalogue-tests.js`).
- Live browser automated QA: **50 / 50 passing** at 320, 390 and 430 CSS pixels.
- Separate negative/error-path browser QA: **8 / 8 passing**, covering failed same-origin probe, no false Pass on failed reachability, Unable to Test, exit, denied/unavailable geolocation and no false Pass without location evidence.
- Complete six-step journey: Internet, Wi-Fi, Mobile Data, Bluetooth, Location, AirDrop; successful browser network probe, customer-confirmed Wi-Fi and cellular routes, a consented mock geolocation response, one Bluetooth Fail with symptom selection, AirDrop Unable; results showed 4 Pass, 1 Fail, 1 Unable.
- Report generation and clipboard copying succeeded; synthetic test coordinates were not included in the report. Restart returned to setup.
- The 40-model selector was loaded with a blank option, and the selected iPhone 18 Pro Max was carried into the journey.
- Layout and visual structure passed for 320, 390 and 430 CSS-pixel mobile Chromium viewports: no horizontal overflow, landing artwork and controls present, no page exceptions.
- **Deployment integrity:** live `index.html`, `app.js`, `core.js`, `models.js`, `visual.css` and `probe.txt` SHA-256 matched the source on the branch; all requests succeeded.
- No application source changes or production promotions were made during these checks.

## Evidence limitations and user decision

- This is browser QA with mobile Chromium emulation, not a physical iPhone's Safari radio, Core Location, Bluetooth or AirDrop hardware test.
- Browser site reachability cannot determine the physical Wi-Fi or cellular transport; Wi-Fi and Mobile Data require customer route confirmation.
- Browser location permission is not GNSS-only hardware validation. Bluetooth and AirDrop are customer-guided.
- User should inspect the live iPhone interface and journey, then explicitly approve or request changes.
- Until explicit sign-off, keep Connectivity at **7/8 individually signed-off Toolbox browser prototypes**, not 8/8.
- Preserve existing iRepair Core and the seven signed-off prototypes. Do not redesign or promote without authorisation.
