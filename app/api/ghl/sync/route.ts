import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const webhookUrl = process.env.GHL_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verified_lead",
          source: "plan-switcher",
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          zipCode: body.zipCode,
          county: body.county,
          state: body.state,
          dateOfBirth: body.dateOfBirth,
          gender: body.gender,
          tobacco: body.tobacco,
          currentPlan: body.currentPlan,
          currentPremium: body.currentPremium,
          household: body.household,
          bestQuoteCarrier: body.bestQuoteCarrier,
          bestQuotePlan: body.bestQuotePlan,
          bestQuotePremium: body.bestQuotePremium,
          bestQuoteStableScore: body.bestQuoteStableScore,
          monthlySavings: body.monthlySavings,
          annualSavings: body.annualSavings,
          verifiedAt: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.error("[switcher] GHL webhook error:", err.message)
      })
    }

    console.log("[switcher] GHL sync:", { firstName: body.firstName, lastName: body.lastName, phone: body.phone })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] GHL sync error:", error)
    return NextResponse.json({ success: true })
  }
}
