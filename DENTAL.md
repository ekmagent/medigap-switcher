# Dental Insurance Funnel (`/dental` → smile.healthplans.now)

A self-contained dental lead/enrollment funnel inside the `medigap-switcher` Next.js app.
Lives under `app/dental/*` + `app/api/dental/*` + `lib/dental-*` and shares utilities with the
Medigap funnel (rate-limit, phone-utils, fb-pixel, neon-client). Deployed on the **same Vercel
project**; `smile.healthplans.now/` serves it via a root rewrite (Medigap stays on
`switch.healthplans.now`).

Business: easyKind's dental product — **Mutual of Omaha** dental, **age-independent flat pricing**
(same rate at 18 or 70; varies by state/zone).

## Funnel flow (one step per screen)
`landing` → `zipcode` → `coverage-now` → `coverage-focus` → `medicare` (→ `medicare-type` if on
Medicare) → **birthday** (`date-of-birth` month → `birth-year` decade+year → `birth-day`) →
`preference` (Basic vs More comprehensive — **no prices**) → `name` → `email` → `phone`
(**submits the LEAD**) → `results` (**3-plan quote page**) → `enroll` → confirmation.

- Contact (name/email/phone/DOB) is captured **before** prices are shown.
- `results` = the only place prices appear, ordered most-expensive-first for anchoring.
- `enroll` = effective date (today / +7d), residential address (Places autocomplete), gender,
  a low-friction POA question. No payment collected — the applicant enters payment themselves
  during MOO's e-signature step.

## The 3 plans (`lib/dental-quotes.ts`)
| Tier | MOO product | Annual max | Notes |
|---|---|---|---|
| **Platinum** | Preferred (DNT2I) + vision/hearing rider | $5,000 | `+$8.28/mo` flat rider |
| **Gold** ⭐ | Preferred (DNT2E) | $3,000 | recommended / "no-brainer" middle |
| **Bronze** | Protection (DNT5B) | $1,500 | value; 50% basic, $100 deductible |

- Real prices from `lib/moo-dental-rates.json` (ported "dental quote kit"): ZIP → state (`z3s`) →
  zone (`sm`) → cents per form (`r`). **NY/MA unavailable.**
- Vision/hearing rider = flat **$8.28** constant (`VISION_HEARING_ADDON`) — *confirm correct per state.*
- "Medicare Savings Audit" perk shown on Platinum + Gold only (not Bronze). Plan/premium specifics
  are kept out of the official policy fields until signup.

## Integrations

### GoHighLevel — `lib/ghl-dental.ts` (direct LeadConnector v2 API, PIT auth)
- Location `RYdiuK2fcLvTHN6tH8j3`. Pipeline **"EKM - FB Dental"** `19tNvaLSI6LbMoEUTR4C`
  (stages: New Lead → Contacted → Proposal Sent → Closed).
- **Lead** → upsert contact (name/email/phone/DOB/zip + custom fields: county, gender, fbc, fbp,
  lead_source) + tag `dental-lead` + opportunity at **New Lead** + note (readable + JSON block).
- **Enroll** → upsert same contact (+ address, gender) + tags `dental-enrolled` / `plan-<tier>` +
  opportunity **moved to Proposal Sent** (find-or-create, no dupes) + enrollment note.
- DVH/policy custom fields are intentionally left for official signup; the dental specifics ride in
  the contact **note's JSON** (pull-in/out). Custom-field IDs are hard-coded in the lib.

### Meta — `lib/dental-pixel.ts` + `app/api/dental/capi/route.ts` (pixel `1405157201420637`)
- **Browser pixel: landing page ONLY** (PageView). All conversions go via **CAPI (server-side)**.
- Events: **CompleteRegistration** (reaches 3-options page) → **AddToCart** (selects a plan) →
  **InitiateCheckout** (enroll step) → **Purchase** (handled externally). Deduped by `event_id`.
- 🚫 **CRITICAL: never send dental/insurance descriptors to Meta** (its AI mis-flags healthcare).
  CAPI allowlists `custom_data` to `value`/`currency` only; `event_source_url` is the **origin
  only** (no `/dental` path); no `content_name`/`content_category`. User data (email/name/phone/
  fbc/fbp/external_id) is hashed server-side.
- `DENTAL_META_TEST_EVENT_CODE` routes events to Events Manager → Test Events. **Must be UNSET in
  production**, or real conversions never reach production.

### Google Places — `components/places-address-input.tsx`
- Address autocomplete on `enroll`. Uses the **new** Places API (`AutocompleteSuggestion`) — the
  legacy `Autocomplete` widget is disabled for newer Google accounts. CSP must allow
  `places.googleapis.com` (data) and `maps.googleapis.com` (script). Key is referrer-restricted.

## Environment variables (`.env.local` locally; Vercel project for prod)
```
GHL_PIT_TOKEN, GHL_LOCATION_ID
GHL_DENTAL_PIPELINE_ID, GHL_DENTAL_STAGE_NEW, GHL_DENTAL_STAGE_ENROLLED
DENTAL_META_PIXEL_ID (defaults to 1405157201420637), DENTAL_META_CAPI_TOKEN
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
DENTAL_META_TEST_EVENT_CODE   # TEST ONLY — never set in production
```

## Deployment
- `smile.healthplans.now` → `medigap-switcher` Vercel project. Root rewrite in `next.config.mjs`
  uses **`beforeFiles`** + a `host` condition to serve `/dental` at `smile/` (a plain/afterFiles
  rewrite won't override the existing `/` page). **Same project ⇒ pushing redeploys Medigap too.**

## QA / tooling
- `scripts/qa-dental.mjs` drives the whole funnel in headless system Chrome (puppeteer-core),
  asserting: no console errors, the 3 real prices + anchoring order, pixel landing-only +
  CAPI conversions, **no dental descriptors sent to Meta**, GHL writes, etc.
- `scripts/shot-dental-*.mjs` = screenshot helpers (landing / results / enroll).
- The lead/enroll routes write to GHL → QA creates a test contact (`test@example.com`); delete it
  after (GHL search has a few seconds of indexing lag).

## Gotchas
- Rewrite must be `beforeFiles`. Places needs the **new** API + `places.googleapis.com` in CSP.
- GHL PIT is per-location + scoped (needs contacts + customFields + opportunities); tokens can't be
  re-viewed after creation, and there's a 5-token limit — reuse a live one.
- `lib/rate-limit.ts` is keyed per-IP and shared across routes (5/min) — rapid test runs 429.
- StepWrapper had a React-StrictMode bug (stranded timer → stuck overlay); fixed by dropping the
  `hasAnimated` ref guard.

## Open items
- Site-wide JSON-LD (root `app/layout.tsx`) still says "Medicare Supplement" on dental pages (low
  risk — frames the org as an insurance agency, not a provider).
- Confirm MOO **waiting periods** (the "day one" coverage copy was removed to avoid over-claiming).
- Confirm the **$8.28 vision/hearing rider** is correct across states.
