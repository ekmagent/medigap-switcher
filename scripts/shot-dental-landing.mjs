/**
 * Full-page iPhone-width screenshot of the /dental landing page.
 * Saves /tmp/dental-landing.png.  Usage: node scripts/shot-dental-landing.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core"

const BASE = process.argv[2] || "http://localhost:3001"
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" })
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 740, deviceScaleFactor: 2, isMobile: true })
try {
  await page.goto(`${BASE}/dental`, { waitUntil: "networkidle2" })
  await new Promise((r) => setTimeout(r, 600))
  await page.screenshot({ path: "/tmp/dental-landing.png" }) // viewport = above the fold
  console.log("saved /tmp/dental-landing.png")
} catch (e) {
  console.error("shot failed:", e.message)
} finally {
  await browser.close()
}
