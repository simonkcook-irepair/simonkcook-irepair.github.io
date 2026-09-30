# Exact-model catalogue · Build 31

The existing customer app is preserved. Build 31 replaces the Build 30 catalogue
patch; it still uses the Build 24 multi-repair queue, Build 25 progressive flow,
Build 28r4 artwork and Build 29 glass styling. The technician app, shared data
adapter, Repair Relay, referrals and Supabase functions are unchanged.

## Reviewed data

`data/device-catalogue.json` is the source of truth. It contains 112 exact model
identities: all 47 named iPhones already in the app, 27 explicitly listed Samsung
models and 38 Pixel models from Google's current and earlier hardware tables.
Research was performed on 30 September 2026. Each important attribute points to
source IDs; the source registry records URLs, publishers, access dates and content
hashes where downloaded. The separate research register lists every model.

Verified plastic rears (including Galaxy S21) do not show a glass repair. Unknown rear materials are labelled as rear / cosmetic assessment, including the guided route and technician repair description.

Original display specifications, manufacturer finishes and repair parts sold by
iRepair are different facts. An original OLED display does not automatically
create an OLED replacement offer. Sold screen options require an exact-model
website service or an existing exact-model offer. Original LCD models cannot
acquire an OLED offer through a price entry. ProMotion / LTPO facts never promise
those features on an aftermarket part.

Manufacturer colours identify the device's original finish; they do not promise
matching replacement stock. Apple finishes come from its exact-model identification
list. Samsung records include verified launch, later and online-exclusive finishes
where found; regional and special-edition coverage is explicitly limited.
An unlisted finish can be recorded as “Not sure” and checked before parts ordering.
Google's colour-region notes are preserved. Google's earlier page lists overlapping
Pixel 4 / 4 XL identifiers; those records flag the source conflict.

Apple's repair manuals confirm detachable back panels for particular models.
The absence of a back-glass procedure is not proof that specialist glass-only
repair is impossible. Those methods remain subject to assessment.

The iPhone Duo is an announced model, with manufacturer specifications but no
verified service parts or A-number. It remains assessment-only and office-only.

## Unknowns and pricing

Null / “unknown” values are intentional. Regional part compatibility, unverified
repair methods, sold Samsung / Pixel replacement parts and unconfirmed identifiers
must be checked before a part is selected. Unlisted devices only get assessment.
No LCD/OLED, rear colour, connector replacement or part SKU is inferred from a brand
or family. Folded displays require an inner / outer selection.

Amounts stay in the existing `CATALOGUE`. This change imports no website prices.
All prior model prices and review / office flags are covered by a frozen pre-change
fixture. The existing conditional £40 microscope cleaning service is retained;
replacement and cleaning remain alternatives. Unknown prices stay null.

## Integration and verification

`device-catalogue.js` shares the capability and validation rules between customer
selection and tests. `build30.js` installs Build 31 on the existing app. The
manufacturer comes first. A single valid repair option is preselected; multiple
evidenced offers remain choices. Rear finishes are exact-model dropdowns.
The existing multi-repair queue is reset on device / model changes and pinned to
the device it started with. Final submission revalidates every item before any
Core create request.

The existing Core API already accepts manufacturer. Rear finish and folded-panel
selection are included in the repair description, so the technician receives them.
No schema migration or backend data overwrite is required.

Module loading hides the legacy interface until the catalogue is ready. A failed
module load displays a reload message instead of exposing generic legacy options.

Run checks with Node 24:

```sh
npm ci --prefix tests
npm test --prefix tests
```

The tests run the actual existing customer module chain in a DOM and stub network
calls. They cover manufacturer selection, LCD-only screen selection, exact finishes,
multiple queued repairs, guided diagnosis, regional identifiers, multiple devices,
folding panels, secondary contacts, Relay, submission metadata, preserved pricing
and rejection of invalid options before Core submission. Live browser checks are
required before a release is reported complete.

## Editing the catalogue

1. Verify the exact model and relevant market using manufacturer specifications
   and service documentation.
2. Add provenance for each changed field. Keep uncertain fields unknown.
3. Confirm a sold part independently of the original display technology.
4. Preserve price amounts unless a separate pricing change is authorised.
5. Rebuild the browser bundle and run the checks:

```sh
node scripts/build-catalogue.cjs
npm test --prefix tests
```

Keep the JSON and generated bundle in the same commit. GitHub's catalogue workflow
checks that the bundle regenerates without a diff. Do not add generic fallbacks
for missing fields.
