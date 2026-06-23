import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { normalizePhoneNumber } from "@/lib/phone-utils"
import { ghlEnabled, upsertDentalContact, addDentalNote, upsertDentalOpportunity, buildDentalNote } from "@/lib/ghl-dental"

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, { maxRequests: 5, windowMs: 60 * 1000 })
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() } },
    )
  }

  try {
    const body = await req.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      street,
      unit,
      city,
      state,
      zipCode,
      effectiveDate,
      canMakeDecisions,
      plan,
      planId,
      monthlyPremium,
    } = body

    // Validation — applicant + residential address. No SSN/payment ever collected.
    if (!firstName || typeof firstName !== "string") {
      return NextResponse.json({ success: false, error: "Invalid first name" }, { status: 400 })
    }
    if (!street || typeof street !== "string" || street.trim().length < 2) {
      return NextResponse.json({ success: false, error: "Invalid street address" }, { status: 400 })
    }
    if (!city || !state) {
      return NextResponse.json({ success: false, error: "City and state required" }, { status: 400 })
    }
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json({ success: false, error: "Invalid zip code" }, { status: 400 })
    }
    const normalizedPhone = normalizePhoneNumber(phone)

    const enrollment = {
      type: "dental_enrollment",
      source: "dental",
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: normalizedPhone || phone || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      street: street.trim(),
      unit: unit || null,
      city: city.trim(),
      state,
      zipCode,
      effectiveDate: effectiveDate || null,
      canMakeDecisions: canMakeDecisions || null,
      plan: plan || null,
      planId: planId || null,
      monthlyPremium: monthlyPremium ?? null,
      submittedAt: new Date().toISOString(),
    }

    if (ghlEnabled()) {
      try {
        const contactId = await upsertDentalContact({
          firstName,
          lastName,
          email,
          phone: normalizedPhone || phone,
          dateOfBirth,
          street,
          city,
          state,
          zipCode,
          gender,
          tags: ["dental-enrolled", plan ? `plan-${String(plan).toLowerCase()}` : ""].filter(Boolean),
        })
        await addDentalNote(
          contactId,
          buildDentalNote("Enrollment", {
            plan,
            monthlyPremium,
            effectiveDate,
            canMakeDecisions,
            gender,
            address: `${street}${unit ? ` ${unit}` : ""}, ${city}, ${state} ${zipCode}`,
          }),
        )
        await upsertDentalOpportunity(contactId, {
          name: `Dental — ${firstName} ${lastName || ""} — ${plan || ""}`.trim(),
          monetaryValue: typeof monthlyPremium === "number" ? monthlyPremium : null,
          stageId: process.env.GHL_DENTAL_STAGE_ENROLLED,
        })
        console.log("[dental] GHL enrollment synced:", contactId)
      } catch (err: any) {
        console.error("[dental] GHL enrollment sync error:", err?.message)
      }
    } else {
      const webhookUrl = process.env.GHL_DENTAL_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrollment),
        }).catch((err) => console.error("[dental] enroll webhook error:", err.message))
      } else {
        console.log("[dental] No GHL configured; enrollment not forwarded:", { firstName, plan })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[dental] Enroll error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
