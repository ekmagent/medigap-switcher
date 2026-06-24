/**
 * Capture every page of the dental funnel at iPhone width for training docs.
 * Stubs /api/dental/lead, /enroll, /capi so it creates NO GHL contacts, Slack
 * pings, or Meta events. Saves /tmp/dental-training/NN-name.png (full page).
 *
 * Usage: node scripts/shot-dental-all.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core"
import { mkdir } from "node:fs/promises"

const BASE = process.argv[2] || "http://localhost:3001"
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const OUT = "/tmp/dental-training"
await mkdir(OUT, { recursive: true })

async function clickByText(page, text) {
  await page.waitForFunction(
    (t) => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").includes(t)),
    { timeout: 10000 },
    text,
  )
  await page.evaluate((t) => {
    ;[...document.querySelectorAll("button")].find((b) => (b.textContent || "").includes(t)).click()
  }, text)
}
const waitPath = (page, p) => page.waitForFunction((x) => location.pathname === x, { timeout: 12000 }, p)

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true })

// Stub the write endpoints so nothing leaves the machine.
await page.setRequestInterception(true)
page.on("request", (req) => {
  const u = req.url()
  if (req.method() === "POST" && /\/api\/dental\/(lead|enroll|capi)\b/.test(u)) {
    return req.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, ok: true }) })
  }
  req.continue()
})

let n = 0
async function shot(name) {
  // Force step fade-in animations to complete instantly + hide the dev badge so
  // content renders at full opacity, not mid-transition.
  await page.evaluate(() => {
    if (!document.getElementById("__shotcss")) {
      const s = document.createElement("style")
      s.id = "__shotcss"
      s.textContent =
        "*{animation-duration:.001s!important;animation-delay:0s!important;transition-duration:.001s!important;}" +
        "nextjs-portal,[data-nextjs-dev-tools-button]{display:none!important}"
      document.head.appendChild(s)
    }
  })
  await page.waitForFunction(() => !document.querySelector(".animate-step-check"), { timeout: 4000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, 500))
  const file = `${OUT}/${String(++n).padStart(2, "0")}-${name}.png`
  await page.screenshot({ path: file, fullPage: true })
  console.log("saved", file)
}

try {
  await page.goto(`${BASE}/dental`, { waitUntil: "networkidle2" })
  await page.waitForSelector("#zip")
  await shot("landing")

  await page.type("#zip", "08003")
  await clickByText(page, "See my plans")
  await waitPath(page, "/dental/coverage-now")
  await shot("coverage-now")

  await clickByText(page, "Yes, I have dental coverage now")
  await waitPath(page, "/dental/coverage-focus")
  await shot("coverage-focus")

  await clickByText(page, "Protection when major work is needed")
  await waitPath(page, "/dental/medicare")
  await shot("on-medicare")

  await clickByText(page, "Yes, I'm on Medicare")
  await waitPath(page, "/dental/medicare-type")
  await shot("medicare-type")

  await clickByText(page, "Medicare Advantage")
  await waitPath(page, "/dental/date-of-birth")
  await shot("birth-month")

  await clickByText(page, "Jan")
  await waitPath(page, "/dental/birth-year")
  await shot("birth-year")

  await clickByText(page, "1950s")
  await clickByText(page, "1955")
  await waitPath(page, "/dental/birth-day")
  await shot("birth-day")

  await clickByText(page, "15")
  await waitPath(page, "/dental/preference")
  await shot("preference")

  await clickByText(page, "More comprehensive")
  await waitPath(page, "/dental/name")
  await shot("name")

  await page.type("#firstName", "Pat")
  await page.type("#lastName", "Sample")
  await clickByText(page, "Continue")
  await waitPath(page, "/dental/email")
  await shot("email")

  await page.type("#email", "training@example.com")
  await clickByText(page, "Continue")
  await waitPath(page, "/dental/phone")
  await shot("phone")

  await page.type("#phone", "8565551234")
  await clickByText(page, "See my options")
  await waitPath(page, "/dental/results")
  await page.waitForFunction(() => /\$\d/.test(document.body.innerText), { timeout: 12000 })
  await page.waitForFunction(() => !document.querySelector(".animate-step-check"), { timeout: 5000 }).catch(() => {})
  await shot("results")

  // Expand the Platinum anchor to capture the coverage/waiting-period detail.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /see what's included/i.test(x.textContent || ""))
    b && b.click()
  })
  await shot("results-expanded")

  await clickByText(page, "Choose Gold Protection")
  await waitPath(page, "/dental/enroll")
  await page.waitForFunction(() => !document.querySelector(".animate-step-check"), { timeout: 5000 }).catch(() => {})
  await page.waitForSelector("#street")
  await shot("enroll")

  // Fill the minimum to submit, then capture the confirmation.
  await page.type("#street", "123 Main St")
  await clickByText(page, "Male")
  await new Promise((r) => setTimeout(r, 300))
  await clickByText(page, "Submit my enrollment")
  await page.waitForFunction(() => /Almost done/i.test(document.body.innerText), { timeout: 8000 })
  await shot("confirmation")

  console.log(`\nDone — ${n} screens in ${OUT}`)
} catch (e) {
  console.error("capture failed:", e.message)
} finally {
  await browser.close()
}
