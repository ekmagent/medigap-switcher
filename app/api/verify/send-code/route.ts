import { type NextRequest, NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/twilio"
import { normalizePhoneNumber } from "@/lib/phone-utils"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { phone, leadId } = body

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 })
    }

    const normalized = normalizePhoneNumber(phone)
    if (!normalized || normalized.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 })
    }

    // Per-phone rate limit: max 3 codes per 10 minutes per phone number
    const phoneRateLimit = checkRateLimit(`verify:${normalized}`, {
      maxRequests: 3,
      windowMs: 10 * 60 * 1000,
    })
    if (!phoneRateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts for this number. Please try again later." },
        { status: 429 },
      )
    }

    const result = await sendVerificationCode(normalized)

    if (!result.success) {
      console.error("Verify send-code failed:", result.error)
      return NextResponse.json(
        { success: false, error: "Failed to send verification code. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      maskedPhone: normalized.replace(/(\d{3})\d{3}(\d{4})/, "($1) ***-$2"),
    })
  } catch (error: any) {
    console.error("Verify send-code error:", error?.message)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
