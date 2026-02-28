import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/neon-client"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { normalizePhoneNumber } from "@/lib/phone-utils"

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  })

  if (!rateLimitResult.success) {
    console.log(`[v0] Rate limit exceeded for IP: ${clientIp}`)
    return NextResponse.json(
      {
        error: "Too many submissions. Please try again in a moment.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      },
    )
  }

  try {
    if (!process.env.DATABASE_URL) {
      console.error("[v0] Error: DATABASE_URL is not defined")
      return NextResponse.json({ success: false, error: "Database configuration missing" }, { status: 500 })
    }

    const body = await req.json()
    const sql = getNeonClient()

    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      zipCode,
      county,
      state,
      tobaccoUser,
      medicareEffectiveDate,
      planPreference,
      budgetPreference,
      companyPreference,
      specificCompany,
      fbp,
      fbc,
      fbClickId,
      gclid,
      userAgent,
      ipAddress,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      referrer,
      formPath,
      acquisitionChannel,
      landingPage,
      deviceType,
      referrerUrl,
    } = body

    const normalizedPhone = normalizePhoneNumber(phone)

    console.log("[v0] Creating lead")

    // This prevents overwriting names when someone reuses an email
    const existingLead = await sql`
      SELECT l.id, l.first_name, l.last_name, a.id as application_id, a.status as application_status
      FROM leads l
      LEFT JOIN applications a ON a.lead_id = l.id
      WHERE l.email = ${email}
      LIMIT 1
    `

    let lead
    let isExistingWithApplication = false

    if (existingLead && existingLead.length > 0 && existingLead[0].application_id) {
      // Lead exists with an application - don't overwrite their name
      isExistingWithApplication = true
      console.log("[v0] Lead already exists with application, preserving existing name")

      // Just update non-identifying fields and return existing lead
      const updateResult = await sql`
        UPDATE leads SET
          phone = COALESCE(${normalizedPhone}, phone),
          updated_at = CURRENT_TIMESTAMP
        WHERE email = ${email}
        RETURNING *
      `
      lead = updateResult[0]
    } else {
      // No existing application - safe to upsert with new data
      const result = await sql`
        INSERT INTO leads (
          first_name, last_name, email, phone,
          date_of_birth, gender, zip_code, county, state,
          tobacco_user, medicare_effective_date,
          plan_preference, budget_preference, company_preference, specific_company,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          referrer, form_path, completed, consented,
          acquisition_channel, landing_page, device_type, referrer_url,
          stage, fbp, fbc, fb_click_id, gclid,
          ip_address, user_agent
        )
        VALUES (
          ${firstName}, ${lastName || null}, ${email}, ${normalizedPhone},
          ${dateOfBirth}, ${gender}, ${zipCode}, ${county || null}, ${state || null},
          ${tobaccoUser === "Yes" || tobaccoUser === true}, ${medicareEffectiveDate || dateOfBirth},
          ${planPreference || null}, ${budgetPreference || null}, ${companyPreference || null}, ${specificCompany || null},
          ${utmSource || null}, ${utmMedium || null}, ${utmCampaign || null}, ${utmContent || null}, ${utmTerm || null},
          ${referrer || null}, ${formPath || "/q/guided"}, false, true,
          ${acquisitionChannel || null}, ${landingPage || null}, ${deviceType || null}, ${referrerUrl || null},
          'new', ${fbp || null}, ${fbc || null}, ${fbClickId || null}, ${gclid || null},
          ${ipAddress || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null},
          ${userAgent || req.headers.get("user-agent") || null}
        )
        ON CONFLICT (email) 
        DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          phone = EXCLUDED.phone,
          date_of_birth = EXCLUDED.date_of_birth,
          gender = EXCLUDED.gender,
          zip_code = EXCLUDED.zip_code,
          county = EXCLUDED.county,
          state = EXCLUDED.state,
          tobacco_user = EXCLUDED.tobacco_user,
          medicare_effective_date = EXCLUDED.medicare_effective_date,
          plan_preference = EXCLUDED.plan_preference,
          budget_preference = EXCLUDED.budget_preference,
          company_preference = EXCLUDED.company_preference,
          specific_company = EXCLUDED.specific_company,
          utm_source = COALESCE(EXCLUDED.utm_source, leads.utm_source),
          utm_medium = COALESCE(EXCLUDED.utm_medium, leads.utm_medium),
          utm_campaign = COALESCE(EXCLUDED.utm_campaign, leads.utm_campaign),
          utm_content = COALESCE(EXCLUDED.utm_content, leads.utm_content),
          utm_term = COALESCE(EXCLUDED.utm_term, leads.utm_term),
          referrer = COALESCE(EXCLUDED.referrer, leads.referrer),
          acquisition_channel = COALESCE(EXCLUDED.acquisition_channel, leads.acquisition_channel),
          landing_page = COALESCE(EXCLUDED.landing_page, leads.landing_page),
          device_type = COALESCE(EXCLUDED.device_type, leads.device_type),
          referrer_url = COALESCE(EXCLUDED.referrer_url, leads.referrer_url),
          fbp = COALESCE(EXCLUDED.fbp, leads.fbp),
          fbc = COALESCE(EXCLUDED.fbc, leads.fbc),
          fb_click_id = COALESCE(EXCLUDED.fb_click_id, leads.fb_click_id),
          gclid = COALESCE(EXCLUDED.gclid, leads.gclid),
          ip_address = COALESCE(EXCLUDED.ip_address, leads.ip_address),
          user_agent = COALESCE(EXCLUDED.user_agent, leads.user_agent),
          stage = 'new',
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `

      if (!result || !Array.isArray(result) || result.length === 0) {
        console.error("[v0] No lead data returned from query")
        return NextResponse.json({ success: false, error: "Failed to create/update lead" }, { status: 500 })
      }

      lead = result[0]
    }

    if (!lead || !lead.id) {
      console.error("[v0] Lead object missing id", { lead })
      return NextResponse.json({ success: false, error: "Failed to create/update lead" }, { status: 500 })
    }

    const leadId = lead.id
    console.log(
      "[v0] Lead saved successfully:",
      leadId,
      isExistingWithApplication ? "(existing with app, name preserved)" : "",
    )

    return NextResponse.json({
      success: true,
      leadId: leadId,
      existingLead: isExistingWithApplication,
    })
  } catch (error: any) {
    console.error("[v0] Error creating lead:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
