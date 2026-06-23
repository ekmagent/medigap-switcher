/**
 * Drive the /dental funnel at iPhone viewport and screenshot the quote page,
 * to verify the three plans sit above the fold. Saves /tmp/dental-results-iphone.png.
 *
 * Usage: node scripts/shot-dental-results.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core"

const BASE = process.argv[2] || "http://localhost:3001"
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const OUT = "/tmp/dental-results-iphone.png"

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
// iPhone 14-ish: 390 CSS px wide, ~740 visible height in Safari, retina.
await page.setViewport({ width: 390, height: 740, deviceScaleFactor: 2, isMobile: true })

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
  await page.waitForFunction(() => /\$\d/.test(document.body.innerText), { timeout: 12000 })
  // Let the StepWrapper check-flash overlay clear so it doesn't hide content.
  await page.waitForFunction(() => !document.querySelector(".animate-step-check"), { timeout: 5000 })
  await new Promise((r) => setTimeout(r, 500))
  await page.screenshot({ path: OUT }) // viewport -> above the fold (Gold hero)
  await page.screenshot({ path: OUT.replace(".png", "-full.png"), fullPage: true })
  console.log("saved", OUT, "and full page")
} catch (e) {
  console.error("shot failed:", e.message)
} finally {
  await browser.close()
}
