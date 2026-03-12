import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, phone, email, zipCode, reason } = body

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

    console.log("[switcher] Ineligible contact:", { firstName, lastName, phone, email, zipCode, reason })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] Ineligible contact error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
