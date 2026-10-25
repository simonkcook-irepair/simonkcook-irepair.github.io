# iRepair Battery Diagnostics — Simple customer-first review

**Date:** 25 October 2026  
**Status:** Experimental preview for user feedback. NOT the final accepted app.

## User's feedback (higher-priority than earlier engineering assumptions)
> “I really don’t like it. There’s too many complications. There’s a lot of on-screen data, and there’s no option to upload the analytics file. The whole purpose of the toolbox, it’s supposed to be a nice simplistic flow for the customer to give them information, not somewhere where they have to feed a lot of it in.”

## Protected
- Completed Screen Diagnostics: https://irepair-screen-diagnostics-review-simon-cook.vercel.app/ — *no changes permitted*.
- Prior Battery Diagnostics visual treatment is APPROVED: icy-blue glass design, logo, illustrative iPhone, glow/shine, large buttons and results styling. Reuse exactly, do not redesign without user approval.
- Earlier original Battery Diagnostics: https://irepair-battery-diagnostics-preview.vercel.app/ — unchanged, protected.
- First matched-design Battery prototype: https://irepair-battery-toolbox-review-simon-cook.vercel.app/ — unchanged.
- Over-complex battery engine candidate: https://irepair-battery-engine-review-simon-cook.vercel.app/ — preserved as comparison only.

## New simple analytics-first preview
**Live:** https://irepair-battery-simple-review-simon-cook.vercel.app/  
**Vercel project:** `prj_Xm45QHS9YWPsbirvHfwCXHjQ6xbZ`  
**Deployment:** `dpl_9LjhSiyLzjxgQX48iMGJQGWT2bfr`  
**GitHub branch:** `toolbox/battery-simple-analytics-2026-10-25`  
**Source:** `toolbox/battery/analytics-first/index.html` and `toolbox/battery/analytics-first/engine.js`

## Customer flow contract
1. Original approved-glass landing, unchanged phone illustration and animation.
2. **Prominent Upload Analytics File** in the FIRST diagnostic view, not buried after several forms. Clicking it launches the file chooser; read up to 20MB local .ips/.txt/.json/.log files, extract supported battery fields automatically.
3. Display a concise, friendly result (iOS analytics maximum-capacity percentage and cycle count where recognised). Distinguish data extraction from a verified battery-health or hardware test.
4. When none/ambiguous: show Unable to Test / Inconclusive and practical next steps, **not** automatically FAIL.
5. Simple optional expandable directions explain how to find the recent Analytics- file in Settings. Secondary text paste option is inside that expansion, not on the primary screen.
6. **No-file fallback:** one question (normal Battery Health, service recommended, or unavailable), then results. NO manual health/cycles/charging-duration fields and no multi-page technician forms.
7. One-tap Copy Report; no analytics upload or external POST. Raw text and personal identifiers excluded from report. App uses user-selected locally read text; native iOS hardware readings are not claimed.
8. Any further functionality must fit this simple customer flow. Advanced calculations, if justified, should operate behind the scenes; do not revive a busy data-entry form.

## Verification completed
- Direct public HTTP 200 for both deployed HTML and JS; previous battery and screen links returned original build markers and were unchanged.
- Headless mobile Chromium: tap on main uploader opens an actual file chooser (PASS).
- Upload supported analytics text → auto-extract 86% maximum capacity and 427 cycles; unrelated mAh field excluded; successful result and copyable sourced report (PASS).
- Two conflicting cycle readings → INCONCLUSIVE rather than choosing an arbitrary result (PASS).
- Unrecognised metrics → UNABLE TO TEST, not a hardware failure (PASS).
- Invalid file extension → friendly error on upload screen (PASS).
- No-file path → just one guided question and results, no manual number fields (PASS).
- Text pasted from Analytics → automated result (PASS).
- No outbound POST requests when processing test analytics (PASS).
- Scaled browser viewports 390×844, 375×667, and 440×956: complete upload page fits without vertical scrolling, primary and fallback controls on-screen (PASS).
- Entire live website tested after Vercel deployment: same functional tests PASS.

## iPhone test and acceptance
Still requires user to select a REAL analytics file on physical iPhone Safari and evaluate results and flow. Format availability varies across iOS versions and individual files; a valid file with no supported key does not mean the battery is faulty. Do not mark complete or replace old apps until user explicitly approves.

## User-centric design lesson
The Toolbox should **give the customer useful information** through a beautiful guided experience, NOT demand they supply numerous technical measurements. Treat this principle as a permanent app-family requirement.
