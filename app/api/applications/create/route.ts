import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/neon-client"

export async function POST(req: NextRequest) {
  try {
    const sql = getNeonClient()
    const body = await req.json()

    const { leadId, quoteId, selectedCarrier, selectedPlan, monthlyPremium, quoteKey, phone, copyFromApplicationId } =
      body

    console.log("[v0] Creating application for lead:", leadId, "quote:", quoteId, "copyFrom:", copyFromApplicationId)

    if (!leadId) {
      return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 })
    }

    const leadResult = await sql`
      SELECT * FROM leads WHERE id = ${leadId} LIMIT 1
    `
    const leadData = leadResult[0]
    if (!leadData) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 })
    }

    let copiedMetadata = {}
    let copiedHealthAnswers = {}
    let copiedEncryptedData = {
      ssn: null,
      mbi: null,
      routing: null,
      account: null,
    }

    if (copyFromApplicationId) {
      console.log("[v0] Copying data from application:", copyFromApplicationId)

      // Verify the source application belongs to the same lead (SECURITY CHECK)
      const sourceApp = await sql`
        SELECT 
          lead_id,
          metadata,
          health_answers,
          encrypted_ssn,
          encrypted_medicare_number,
          encrypted_routing_number,
          encrypted_account_number
        FROM applications 
        WHERE id = ${copyFromApplicationId} 
        AND lead_id = ${leadId}
        LIMIT 1
      `

      if (sourceApp.length > 0) {
        const source = sourceApp[0]
        const sourceMetadata = source.metadata || {}

        // Copy personal data but NOT plan-specific data
        copiedMetadata = {
          // Personal info
          firstName: sourceMetadata.firstName,
          lastName: sourceMetadata.lastName,
          email: sourceMetadata.email,
          phone: sourceMetadata.phone,
          gender: sourceMetadata.gender,
          dateOfBirth: sourceMetadata.dateOfBirth,
          // Address
          addressLine1: sourceMetadata.addressLine1,
          addressLine2: sourceMetadata.addressLine2,
          city: sourceMetadata.city,
          state: sourceMetadata.state,
          zipCode: sourceMetadata.zipCode,
          // Mailing address
          mailingAddressDifferent: sourceMetadata.mailingAddressDifferent,
          mailingAddressLine1: sourceMetadata.mailingAddressLine1,
          mailingAddressLine2: sourceMetadata.mailingAddressLine2,
          mailingCity: sourceMetadata.mailingCity,
          mailingState: sourceMetadata.mailingState,
          mailingZipCode: sourceMetadata.mailingZipCode,
          // Medicare dates
          partAEffectiveDate: sourceMetadata.partAEffectiveDate,
          partBEffectiveDate: sourceMetadata.partBEffectiveDate,
          // Payment info (non-sensitive)
          paymentMethod: sourceMetadata.paymentMethod,
          accountType: sourceMetadata.accountType,
          financialInstitution: sourceMetadata.financialInstitution,
          accountHolderName: sourceMetadata.accountHolderName,
        }

        // Copy health answers (these don't change between plans)
        copiedHealthAnswers = source.health_answers || {}

        // Copy encrypted sensitive data (already encrypted, safe to copy)
        copiedEncryptedData = {
          ssn: source.encrypted_ssn,
          mbi: source.encrypted_medicare_number,
          routing: source.encrypted_routing_number,
          account: source.encrypted_account_number,
        }

        console.log("[v0] Copied personal data from previous application")

        // Mark the old application as superseded
        await sql`
          UPDATE applications 
          SET status = 'superseded', updated_at = NOW()
          WHERE id = ${copyFromApplicationId}
        `
        console.log("[v0] Marked previous application as superseded")
      } else {
        console.warn("[v0] Source application not found or doesn't belong to this lead - skipping copy")
      }
    }

    const tokenArray = new Uint8Array(32)
    globalThis.crypto.getRandomValues(tokenArray)
    const token = Array.from(tokenArray, (byte) => byte.toString(16).padStart(2, "0")).join("")

    const finalMetadata = {
      ...copiedMetadata,
      // New plan-specific data (overrides any copied plan data)
      selectedCarrier,
      selectedPlan,
      monthlyPremium,
      quoteKey,
      createdAt: new Date().toISOString(),
      copiedFromApplicationId: copyFromApplicationId || null,
    }

    const result = await sql`
      INSERT INTO applications (
        lead_id,
        quote_id,
        status,
        carrier_name,
        plan_selection,
        metadata,
        health_answers,
        encrypted_ssn,
        encrypted_medicare_number,
        encrypted_routing_number,
        encrypted_account_number,
        last_activity_at
      )
      VALUES (
        ${leadId},
        ${quoteId || null},
        'draft',
        ${selectedCarrier || null},
        ${selectedPlan || null},
        ${JSON.stringify(finalMetadata)},
        ${JSON.stringify(copiedHealthAnswers)},
        ${copiedEncryptedData.ssn},
        ${copiedEncryptedData.mbi},
        ${copiedEncryptedData.routing},
        ${copiedEncryptedData.account},
        NOW()
      )
      RETURNING id
    `

    const applicationId = result[0].id
    console.log("[v0] Application created successfully:", applicationId)

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Get phone number from lead if not provided
    const phoneNumber = phone || leadData.phone

    if (phoneNumber) {
      await sql`
        INSERT INTO resume_tokens (
          token,
          lead_id,
          application_id,
          phone_number,
          expires_at
        )
        VALUES (
          ${token},
          ${leadId},
          ${applicationId},
          ${phoneNumber},
          ${expiresAt.toISOString()}
        )
      `
      console.log("[v0] Resume token created for application:", applicationId)
    }

    await sql`
      INSERT INTO form_sessions (
        lead_id,
        session_key,
        current_step,
        answers,
        last_activity_at
      )
      VALUES (
        ${leadId},
        ${applicationId},
        'medicare-dates',
        ${JSON.stringify({})},
        NOW()
      )
    `
    console.log("[v0] Form session created for application:", applicationId)

    return NextResponse.json({
      success: true,
      applicationId: applicationId,
      resumeToken: token,
      copiedData: !!copyFromApplicationId,
    })
  } catch (error: any) {
    console.error("[v0] Error creating application:", error)
    return NextResponse.json({ success: false, error: "Failed to create application" }, { status: 500 })
  }
}
