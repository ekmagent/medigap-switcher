import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
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

    console.log("[switcher] Call request:", { firstName, lastName, phone, selectedCarrier, selectedPlan })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] Call request error:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
