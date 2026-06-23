/**
 * Drive to the enrollment step and trigger Google Places autocomplete, then
 * screenshot. Saves /tmp/dental-enroll.png.  Usage: node scripts/shot-dental-enroll.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core"

const BASE = process.argv[2] || "http://localhost:3001"
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

async function clickByText(page, text) {
  await page.waitForFunction(
    (t) => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes(t)),
    { timeout: 10000 },
    text,
  )
  await page.evaluate((t) => {
    [...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes(t)).click()
  }, text)
}
const waitPath = (page, p) => page.waitForFunction((x) => location.pathname === x, { timeout: 12000 }, p)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 800, deviceScaleFactor: 2, isMobile: true })
page.on("console", (m) => {
  const t = m.text()
  if (/google|maps|api|referer|referrer|billing/i.test(t)) console.log("CONSOLE:", t)
})
page.on("pageerror", (e) => {
  if (/google|maps/i.test(e.message)) console.log("PAGEERROR:", e.message)
})

try {
  await page.goto(`${BASE}/dental`, { waitUntil: "networkidle2" })
  await page.waitForSelector("#zip")
  await page.type("#zip", "08003")
  await clickByText(page, "See my plans")
  await waitPath(page, "/dental/coverage-now")
  await clickByText(page, "Yes, I have dental coverage now")
  await waitPath(page, "/dental/coverage-focus")
  await clickByText(page, "Protection when major work is needed")
  await waitPath(page, "/dental/medicare")
  await clickByText(page, "Yes, I'm on Medicare")
  await waitPath(page, "/dental/medicare-type")
  await clickByText(page, "Medicare Advantage")
  await waitPath(page, "/dental/date-of-birth")
  await clickByText(page, "Jan")
  await waitPath(page, "/dental/birth-year")
  await clickByText(page, "1950s")
  await clickByText(page, "1955")
  await waitPath(page, "/dental/birth-day")
  await clickByText(page, "15")
  await waitPath(page, "/dental/preference")
  await clickByText(page, "More comprehensive")
  await waitPath(page, "/dental/name")
  await page.type("#firstName", "Pat")
  await page.type("#lastName", "Sample")
  await clickByText(page, "Continue")
  await waitPath(page, "/dental/email")
  await page.type("#email", "test@example.com")
  await clickByText(page, "Continue")
  await waitPath(page, "/dental/phone")
  await page.type("#phone", "8565551234")
  await clickByText(page, "See my options")
  await waitPath(page, "/dental/results")
  await clickByText(page, "Choose Gold")
  await waitPath(page, "/dental/enroll")
  await page.waitForFunction(() => !document.querySelector(".animate-step-check"), { timeout: 5000 })
  await page.waitForSelector("#street")
  await new Promise((r) => setTimeout(r, 2500)) // let Maps JS load
  // Direct probe of the new Places API to see if the key/project is set up.
  const probe = await page.evaluate(async () => {
    const places = window.google?.maps?.places
    if (!places?.AutocompleteSuggestion) return "no AutocompleteSuggestion (Maps JS not loaded)"
    try {
      const token = new places.AutocompleteSessionToken()
      const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: "1600 Pennsylvania Ave",
        includedRegionCodes: ["us"],
        sessionToken: token,
      })
      return `OK: ${suggestions.length} suggestions; first = "${suggestions[0]?.placePrediction?.text?.text || ""}"`
    } catch (e) {
      return "ERROR: " + (e?.message || e)
    }
  })
  console.log("PROBE:", probe)
  await page.click("#street")
  await page.type("#street", "1600 Pennsylvania Ave", { delay: 120 })
  try {
    await page.waitForSelector("ul.absolute button", { timeout: 8000, visible: true })
    console.log("custom dropdown rendered ✓")
  } catch {
    console.log("custom dropdown did NOT render")
  }
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: "/tmp/dental-enroll.png" })
  console.log("saved /tmp/dental-enroll.png")
} catch (e) {
  console.error("shot failed:", e.message)
} finally {
  await browser.close()
}
