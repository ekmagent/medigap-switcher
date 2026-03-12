import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 3 per 5 minutes
  })

  if (!rateLimitResult.success) {
    return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { firstName, lastName, phone, email, zipCode, reason } = body

    // Basic validation
    if (!firstName || !phone || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 })
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ineligible_switcher",
          source: "plan-switcher",
          firstName,
          lastName,
          phone,
          email,
          zipCode,
          reason,
          requestedAt: new Date().toISOString(),
        }),
      })
    }

    console.log("[switcher] Ineligible contact submitted")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] Ineligible contact error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
