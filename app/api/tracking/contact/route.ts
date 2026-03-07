import { type NextRequest, NextResponse } from "next/server"
import { sendCAPIEvent } from "@/lib/fb-capi"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined
    const userAgent = req.headers.get("user-agent") || undefined

    await sendCAPIEvent({
      eventName: "Contact",
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
        content_name: "click_to_call",
        content_category: "results_page",
      },
      leadId: body.leadId,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[switcher] Tracking contact error:", error)
    return NextResponse.json({ success: true })
  }
}
