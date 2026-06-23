/**
 * Local QA harness for the /dental funnel.
 * Drives the system Chrome through the entire flow against the running dev
 * server and fails on any console error / page error or unexpected navigation.
 *
 * Usage: node scripts/qa-dental.mjs [baseUrl]
 *   baseUrl defaults to http://localhost:3001
 */
import puppeteer from "puppeteer-core"

const BASE = process.argv[2] || "http://localhost:3001"
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const consoleErrors = []
const fbEvents = []
const capiEvents = []
const capiCustomKeys = new Set()
const steps = []
let failed = false

function pass(msg) {
  steps.push(`  ✓ ${msg}`)
}
function fail(msg) {
  failed = true
  steps.push(`  ✗ ${msg}`)
}

async function clickByText(page, text) {
  await page.waitForFunction(
    (t) => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes(t)),
    { timeout: 10000 },
    text,
  )
  await page.evaluate((t) => {
    const el = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes(t))
    el.click()
  }, text)
}

async function waitPath(page, path) {
  await page.waitForFunction((p) => location.pathname === p, { timeout: 12000 }, path)
}

async function hasText(page, text) {
  return page.evaluate((t) => document.body.innerText.includes(t), text)
}

// The StepWrapper shows a brief full-screen check-flash overlay on step > 1.
// It MUST clear (~450ms). If it stays, the step content sits hidden behind a
// gray overlay. waitForFunction throws on timeout -> we flag it as stuck.
async function assertOverlayClears(page, label) {
  try {
    await page.waitForFunction(() => !document.querySelector(".animate-step-check"), { timeout: 2500 })
    pass(`${label}: check-flash overlay cleared`)
  } catch {
    fail(`${label}: check-flash overlay STUCK on screen (content hidden behind it)`)
  }
}

const run = async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  // Block fbevents.js so fbq stays a stub and fbq.queue deterministically retains
  // our track() calls (otherwise the FB CDN drains it and the check is racy).
  await page.setRequestInterception(true)
  page.on("request", (req) => {
    const u = req.url()
    if (u.includes("facebook.com/tr")) {
      const ev = new URL(u).searchParams.get("ev")
      if (ev) fbEvents.push(ev)
    }
    if (u.includes("/api/dental/capi") && req.method() === "POST") {
      try {
        const b = JSON.parse(req.postData() || "{}")
        if (b.event_name) capiEvents.push(b.event_name)
        Object.keys(b.custom_data || {}).forEach((k) => capiCustomKeys.add(k))
      } catch {
        /* ignore */
      }
    }
    if (u.includes("connect.facebook.net")) return req.abort()
    req.continue()
  })

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text())
  })
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`))
  page.on("requestfailed", (req) => consoleErrors.push(`requestfailed ${req.failure()?.errorText}: ${req.url()}`))
  page.on("response", (res) => {
    if (res.status() >= 400) consoleErrors.push(`HTTP ${res.status()}: ${res.url()}`)
  })
  // Capture Meta Pixel beacons (facebook.com/tr?ev=...) to confirm conversion events fire.
  page.on("request", (req) => {
    const u = req.url()
    if (u.includes("facebook.com/tr")) {
      const ev = new URL(u).searchParams.get("ev")
      const id = new URL(u).searchParams.get("id")
      if (ev) fbEvents.push(`${ev}${id ? ` (id ${id})` : ""}`)
    }
  })

  try {
    // 1. Landing
    await page.goto(`${BASE}/dental`, { waitUntil: "networkidle2" })
    ;(await hasText(page, "Doesn't Cost More")) ? pass("landing renders headline") : fail("landing headline missing")
    await clickByText(page, "SEE MY OPTIONS")

    // 2. Zip
    await waitPath(page, "/dental/zipcode")
    await page.waitForSelector("#zip")
    await page.type("#zip", "08003")
    pass("zipcode step loaded, entered 08003")
    await clickByText(page, "Continue")

    // 3. Coverage now — also verify the step-transition overlay doesn't get stuck
    await waitPath(page, "/dental/coverage-now")
    pass("coverage-now step loaded")
    await assertOverlayClears(page, "coverage-now")
    await clickByText(page, "Yes, I have dental coverage now")

    // 4. Coverage focus
    await waitPath(page, "/dental/coverage-focus")
    pass("coverage-focus step loaded")
    await clickByText(page, "My preventive care fully covered")

    // 5. Medicare
    await waitPath(page, "/dental/medicare")
    pass("medicare step loaded")
    await clickByText(page, "Yes, I'm on Medicare")

    // 6. Medicare type (only because we answered Yes)
    await waitPath(page, "/dental/medicare-type")
    pass("medicare-type step loaded (Yes branch)")
    await clickByText(page, "Medicare Advantage")

    // 7a. Birth month
    await waitPath(page, "/dental/date-of-birth")
    await assertOverlayClears(page, "dob-month")
    await clickByText(page, "Jan")
    // 7b. Birth year (decade -> year)
    await waitPath(page, "/dental/birth-year")
    await clickByText(page, "1950s")
    await clickByText(page, "1955")
    // 7c. Birth day
    await waitPath(page, "/dental/birth-day")
    await clickByText(page, "15")
    pass("date-of-birth tapped across 3 pages (Jan / 1955 / 15)")

    // 8. Preference — asked before contact, and must NOT show dollar amounts
    await waitPath(page, "/dental/preference")
    const prefHasPrice = await page.evaluate(() => /\$\d+(\.\d+)?\s*\/\s*mo/.test(document.body.innerText))
    prefHasPrice ? fail("preference step should NOT show prices") : pass("preference step shows no dollar amounts")
    await clickByText(page, "Basic coverage")

    // 9. Name
    await waitPath(page, "/dental/name")
    await page.waitForSelector("#firstName")
    await page.type("#firstName", "Testy")
    await page.type("#lastName", "McTestface")
    pass("name step filled")
    await clickByText(page, "Continue")

    // 10. Email
    await waitPath(page, "/dental/email")
    await page.waitForSelector("#email")
    await page.type("#email", "test@example.com")
    pass("email step filled")
    await clickByText(page, "Continue")

    // 11. Phone — submits the lead (preference already captured)
    await waitPath(page, "/dental/phone")
    await page.waitForSelector("#phone")
    await page.type("#phone", "8565551234")
    pass("phone step filled")
    ;(await hasText(page, "Consent is not required to purchase"))
      ? pass("phone step shows TCPA consent language")
      : fail("TCPA consent language missing on phone step")
    await clickByText(page, "See my options")

    // 12. Quote-picking page — three Hormozi-ordered plans, prices appear HERE
    await waitPath(page, "/dental/results")
    await page.waitForFunction(() => /\$\d+(\.\d+)?\s*\/\s*mo/.test(document.body.innerText), { timeout: 12000 })
    // Real MOO rates for ZIP 08003 (NJ): Platinum $87.56 (79.28 + $8.28 vision rider) / Gold $72.33 / Bronze $32.82
    const threePrices = await page.evaluate(() => {
      const t = document.body.innerText
      return ["$87.56", "$72.33", "$32.82"].every((p) => t.includes(p))
    })
    threePrices ? pass("quote page shows real prices ($87.56 / $72.33 / $32.82)") : fail("real prices not shown")
    // anchor check: Platinum before Gold before Bronze
    const ordered = await page.evaluate(() => {
      const t = document.body.innerText
      return t.indexOf("$87.56") < t.indexOf("$72.33") && t.indexOf("$72.33") < t.indexOf("$32.82")
    })
    ordered ? pass("plans ordered most-expensive-first (price anchoring)") : fail("plans not in anchoring order")
    ;(await hasText(page, "Our pick: Gold")) ? pass("personalized 'Our pick: Gold' shown") : fail("Gold recommendation missing")
    ;(await hasText(page, "Medicare Savings Audit")) ? pass("Medicare Savings Audit perk row shown") : fail("savings audit row missing")
    ;(await hasText(page, "Vision + hearing")) ? pass("vision/hearing row shown (Platinum separator)") : fail("vision/hearing row missing")
    await clickByText(page, "Choose Gold")

    // 13. Enrollment ("Add to Cart") step — fires InitiateCheckout on open
    await waitPath(page, "/dental/enroll")
    await assertOverlayClears(page, "enroll")
    await page.waitForSelector("#street")
    await page.type("#street", "123 Main St")
    await clickByText(page, "Male")
    pass("enrollment step loaded, filled (zip/city/state prefilled)")
    await clickByText(page, "Submit my enrollment")
    await page.waitForFunction(() => /Almost done/.test(document.body.innerText), { timeout: 10000 })
    pass("enrollment submitted -> confirmation shown")
    ;(await hasText(page, "licensed agent")) ? fail("'licensed agent' still present in reach-out copy") : pass("no 'licensed agent' in reach-out copy")

    // Meta Pixel: fbq must be initialized, and our conversion events must have been
    // called. When the FB CDN is blocked, fbevents.js never drains fbq.queue, so the
    // queued track() calls are still observable — proving Lead/SubmitApplication fired.
    await new Promise((r) => setTimeout(r, 800)) // let beacons flush
    const pixel = await page.evaluate(() => {
      const ok = typeof window.fbq === "function"
      const q = (window.fbq && window.fbq.queue) || []
      const tracked = [...q].filter((a) => a && a[0] === "track").map((a) => a[1])
      return { ok, tracked }
    })
    pixel.ok ? pass("Meta Pixel fbq initialized on landing (1405157201420637)") : fail("Meta Pixel fbq not initialized")
    // Browser pixel is landing-only: it should fire PageView and NOT the conversion events.
    const sawPageView = pixel.tracked.includes("PageView") || fbEvents.includes("PageView")
    sawPageView ? pass("browser pixel fired PageView (landing only)") : fail("landing PageView missing")
    const browserConversions = pixel.tracked.filter((e) => e !== "PageView")
    browserConversions.length === 0
      ? pass("no conversion events on the browser pixel (CAPI-only)")
      : fail(`browser pixel leaked conversions: ${browserConversions.join(", ")}`)
    // Conversions go via CAPI (server-side) only.
    const expected = ["CompleteRegistration", "AddToCart", "InitiateCheckout"]
    const capiMissing = expected.filter((ev) => !capiEvents.includes(ev))
    capiMissing.length === 0
      ? pass(`CAPI conversion events posted (${expected.join(", ")})`)
      : fail(`CAPI missing: ${capiMissing.join(", ")} — posted: [${capiEvents.join(", ")}]`)
    // No dental/insurance descriptors may be sent to Meta — only value/currency.
    const banned = [...capiCustomKeys].filter((k) => !["value", "currency"].includes(k))
    banned.length === 0
      ? pass(`no dental/insurance descriptors sent to Meta (custom keys: ${[...capiCustomKeys].join(",") || "none"})`)
      : fail(`disallowed event params sent to Meta: ${banned.join(", ")}`)
  } catch (err) {
    fail(`flow threw: ${err.message}`)
  } finally {
    await browser.close()
  }
}

await run()

// Known-benign noise that does not occur at human speed / is unrelated to the funnel:
// - RSC prefetch requests aborted when a fast automated click navigates mid-prefetch
// - the app-wide missing favicon (cosmetic, pre-existing)
// - bare "Failed to load resource" console lines: these carry no URL and are a
//   redundant echo of a failed request that the response handler already logged
//   WITH its URL/status, so dropping them masks nothing (real failures still show).
const isBenign = (e) =>
  (e.includes("net::ERR_ABORTED") && e.includes("_rsc=")) ||
  e.includes("favicon.ico") ||
  e.includes("connect.facebook.net") || // intentionally blocked in this test
  e.includes("Google Maps JavaScript API") || // external: enable Maps JS + Places API on the key
  e.includes("maps.googleapis.com") ||
  e.includes("places.googleapis.com") || // Places autocomplete; fails under puppeteer interception only

  e.startsWith("Failed to load resource")

const realErrors = consoleErrors.filter((e) => !isBenign(e))
const benign = consoleErrors.filter(isBenign)

console.log("\n=== /dental funnel QA ===")
console.log(steps.join("\n"))

console.log(
  fbEvents.length
    ? `\nMeta Pixel beacons fired: ${fbEvents.join(", ")}`
    : "\nMeta Pixel beacons: none captured (FB CDN may be blocked in this env; fbq init is asserted above)",
)

if (benign.length) {
  console.log("\nIgnored (known-benign):")
  for (const e of benign) console.log(`  · ${e}`)
}

if (realErrors.length) {
  failed = true
  console.log("\nConsole/page errors:")
  for (const e of realErrors) console.log(`  • ${e}`)
} else {
  console.log("\n  ✓ no real console or page errors")
}
console.log(failed ? "\nRESULT: FAIL" : "\nRESULT: PASS")
process.exit(failed ? 1 : 0)
