import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { normalizePhoneNumber } from "@/lib/phone-utils"
import { ghlEnabled, upsertDentalContact, addDentalNote, upsertDentalOpportunity, buildDentalNote } from "@/lib/ghl-dental"
import { notifyDentalLead } from "@/lib/dental-slack"

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      },
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
      zipCode,
      county,
      state,
      hasDentalNow,
      coverageFocus,
      onMedicare,
      medicareType,
      preference,
      quotedPlatinumPremium,
      quotedGoldPremium,
      quotedBronzePremium,
      fbp,
      fbc,
      gclid,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      referrerUrl,
    } = body

    // Input validation
    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 1) {
      return NextResponse.json({ success: false, error: "Invalid first name" }, { status: 400 })
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 })
    }
    if (zipCode && !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json({ success: false, error: "Invalid zip code" }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    if (!normalizedPhone || normalizedPhone.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 })
    }

    // Only forward the fields we expect to the CRM webhook.
    const lead = {
      type: "dental_lead",
      source: "dental",
      firstName,
      lastName: lastName || null,
      email,
      phone: normalizedPhone,
      dateOfBirth: dateOfBirth || null,
      zipCode: zipCode || null,
      county: county || null,
      state: state || null,
      hasDentalNow: hasDentalNow || null,
      coverageFocus: coverageFocus || null,
      onMedicare: onMedicare || null,
      medicareType: medicareType || null,
      preference: preference || null,
      quotedPlatinumPremium: quotedPlatinumPremium ?? null,
      quotedGoldPremium: quotedGoldPremium ?? null,
      quotedBronzePremium: quotedBronzePremium ?? null,
      fbp: fbp || null,
      fbc: fbc || null,
      gclid: gclid || null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmContent: utmContent || null,
      utmTerm: utmTerm || null,
      referrerUrl: referrerUrl || null,
      submittedAt: new Date().toISOString(),
    }

    // Push to GoHighLevel (direct API). Best-effort: never break the user response.
    let ghlContactId: string | undefined
    if (ghlEnabled()) {
      try {
        ghlContactId = await upsertDentalContact({
          firstName,
          lastName,
          email,
          phone: normalizedPhone,
          dateOfBirth,
          zipCode,
          county,
          state,
          fbc,
          fbp,
          leadSource: utmSource || "Dental Funnel",
          tags: ["dental-lead"],
        })
        await addDentalNote(
          ghlContactId,
          buildDentalNote("Lead", {
            firstName,
            lastName,
            email,
            phone: normalizedPhone,
            dateOfBirth,
            hasDentalNow,
            coverageFocus,
            onMedicare,
            medicareType,
            preference,
            quotedPlatinumPremium,
            quotedGoldPremium,
            quotedBronzePremium,
            zipCode,
            county,
            state,
            gclid,
            utmSource,
            utmMedium,
            utmCampaign,
            referrerUrl,
          }),
        )
        await upsertDentalOpportunity(ghlContactId, {
          name: `Dental — ${firstName} ${lastName || ""}`.trim(),
          monetaryValue: typeof quotedGoldPremium === "number" ? quotedGoldPremium : null,
          stageId: process.env.GHL_DENTAL_STAGE_NEW,
        })
        console.log("[dental] GHL lead synced:", ghlContactId)
      } catch (err: any) {
        console.error("[dental] GHL lead sync error:", err?.message)
      }
    } else {
      const webhookUrl = process.env.GHL_DENTAL_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lead),
        }).catch((err) => console.error("[dental] GHL webhook error:", err.message))
      } else {
        console.log("[dental] No GHL configured; lead not forwarded:", { firstName, phone: normalizedPhone })
      }
    }

    // Real-time Slack chime so the team can pursue the lead fast (best-effort).
    await notifyDentalLead({
      contactId: ghlContactId,
      firstName,
      lastName,
      email,
      phone: normalizedPhone,
      dateOfBirth,
      county,
      state,
      zipCode,
      hasDentalNow,
      coverageFocus,
      onMedicare,
      medicareType,
      preference,
      quotedPlatinumPremium,
      quotedGoldPremium,
      quotedBronzePremium,
      utmSource,
      utmMedium,
      utmCampaign,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[dental] Lead error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
