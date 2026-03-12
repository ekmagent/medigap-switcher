import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/neon-client"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 per minute
  })

  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await req.json()
    const {
      leadId,
      firstName,
      lastName,
      email,
      phone,
      selectedCarrier,
      selectedPlan,
      selectedPremium,
      currentPremium,
      currentPlan,
      zipCode,
      state,
    } = body

    // Require a verified lead — prevents fake call request spam
    if (!leadId) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    const sql = getNeonClient()
    const leadResult = await sql`
      SELECT id FROM leads WHERE id = ${leadId} AND phone_verified = true LIMIT 1
    `
    if (leadResult.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }

    // Send to Make.com webhook if configured
    const webhookUrl = process.env.MAKE_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "call_request",
          source: "plan-switcher",
          firstName,
          lastName,
          email,
          phone,
          selectedCarrier,
          selectedPlan,
          selectedPremium,
          currentPremium,
          currentPlan,
          zipCode,
          state,
          requestedAt: new Date().toISOString(),
        }),
      })
    }

    console.log("[switcher] Call request accepted for verified lead:", leadId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] Call request error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
