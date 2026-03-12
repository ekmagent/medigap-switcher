import { type NextRequest, NextResponse } from "next/server"
import { sendCAPIEvent } from "@/lib/fb-capi"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined
    const userAgent = req.headers.get("user-agent") || undefined

    const annualValue = body.monthlyPremium ? Math.round(body.monthlyPremium * 12 * 100) / 100 : undefined

    await sendCAPIEvent({
      eventName: "AddToCart",
      eventId: body.eventId,
      userData: {
        email: body.email,
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        zipCode: body.zipCode,
        state: body.state,
        fbp: body.fbp,
        fbc: body.fbc,
        clientIpAddress: ipAddress,
        clientUserAgent: userAgent,
        externalId: body.leadId,
      },
      customData: {
        value: annualValue,
        currency: "USD",
        content_name: "supplemental_insurance_plan",
        content_category: "insurance",
      },
      leadId: body.leadId,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] Tracking add-to-cart error:", error)
    return NextResponse.json({ success: true })
  }
}
