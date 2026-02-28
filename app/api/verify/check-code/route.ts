import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/neon-client"
import { verifyCode } from "@/lib/twilio"
import { normalizePhoneNumber } from "@/lib/phone-utils"

export async function POST(request: NextRequest) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { phone, code, leadId } = body

    if (!phone || !code) {
      return NextResponse.json({ success: false, error: "Phone and code required" }, { status: 400 })
    }

    const normalized = normalizePhoneNumber(phone)
    if (!normalized || normalized.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 })
    }

    const cleanCode = code.toString().replace(/\D/g, "")
    if (cleanCode.length < 4 || cleanCode.length > 8) {
      return NextResponse.json({ success: false, error: "Invalid code format" }, { status: 400 })
    }

    const verifyResult = await verifyCode(normalized, cleanCode)

    if (!verifyResult.success) {
      return NextResponse.json(
        { success: false, error: "Incorrect code. Please check and try again." },
        { status: 401 },
      )
    }

    // Mark lead as phone-verified in the database
    if (leadId) {
      try {
        const sql = getNeonClient()
        await sql`
          UPDATE leads 
          SET phone_verified = true, updated_at = NOW()
          WHERE id = ${leadId}
        `
      } catch (dbError) {
        console.error("Failed to update phone_verified status")
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Verify check-code error:", error?.message)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
