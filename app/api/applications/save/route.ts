import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/neon-client"
import { normalizePhoneNumber } from "@/lib/phone-utils"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sql = getNeonClient()

    const { applicationId, enrollmentData, leadId, lastPage } = body

    console.log("[v0] Saving application:", applicationId, "lastPage:", lastPage)

    if (!applicationId) {
      return NextResponse.json({ success: false, error: "Missing applicationId" }, { status: 400 })
    }

    // This prevents IDOR - users can only save their own application data
    const cookieStore = await cookies()
    const sessionAppId = cookieStore.get("enrollment_session")?.value

    if (sessionAppId && sessionAppId !== applicationId) {
      console.error("[v0] Session mismatch - session:", sessionAppId, "requested:", applicationId)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    let appCheck
    if (leadId) {
      appCheck = await sql`
        SELECT id, lead_id FROM applications 
        WHERE id = ${applicationId} AND lead_id = ${leadId}
        LIMIT 1
      `
    } else {
      appCheck = await sql`
        SELECT id, lead_id FROM applications 
        WHERE id = ${applicationId}
        LIMIT 1
      `
    }

    if (appCheck.length === 0) {
      console.error("[v0] Application not found or ownership mismatch:", applicationId)
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    const normalizedPhone = normalizePhoneNumber(enrollmentData.phone)

    // Store health answers
    const healthAnswers = {
      hasMedicaid: enrollmentData.hasMedicaid,
      medicaidPaysPremiums: enrollmentData.medicaidPaysPremiums,
      medicaidOtherBenefits: enrollmentData.medicaidOtherBenefits,
      hasExistingPolicy: enrollmentData.hasExistingPolicy,
      hasPriorMedicareCoverage: enrollmentData.hasPriorMedicareCoverage,
      hasOtherHealthInsurance: enrollmentData.hasOtherHealthInsurance,
      hasSSDisability: enrollmentData.hasSSDisability,
      underwritingType: enrollmentData.underwritingType,
    }

    // Store non-sensitive metadata
    const metadata = {
      selectedCarrier: enrollmentData.selectedCarrier,
      selectedPlan: enrollmentData.selectedPlan,
      monthlyPremium: enrollmentData.monthlyPremium,
      quoteKey: enrollmentData.quoteKey,
      firstName: enrollmentData.firstName,
      lastName: enrollmentData.lastName,
      email: enrollmentData.email,
      phone: normalizedPhone,
      gender: enrollmentData.gender,
      dateOfBirth: enrollmentData.dateOfBirth,
      partAEffectiveDate: enrollmentData.partAEffectiveDate,
      partBEffectiveDate: enrollmentData.partBEffectiveDate,
      addressLine1: enrollmentData.addressLine1,
      addressLine2: enrollmentData.addressLine2,
      city: enrollmentData.city,
      state: enrollmentData.state,
      zipCode: enrollmentData.zipCode,
      mailingAddressDifferent: enrollmentData.mailingAddressDifferent,
      mailingAddressLine1: enrollmentData.mailingAddressLine1,
      mailingAddressLine2: enrollmentData.mailingAddressLine2,
      mailingCity: enrollmentData.mailingCity,
      mailingState: enrollmentData.mailingState,
      mailingZipCode: enrollmentData.mailingZipCode,
      paymentMethod: enrollmentData.paymentMethod,
      accountType: enrollmentData.accountType,
      financialInstitution: enrollmentData.financialInstitution,
      accountHolderName: enrollmentData.accountHolderName,
      replacementInfo:
        enrollmentData.hasExistingPolicy === "yes"
          ? {
              intendToReplace: enrollmentData.intendToReplace,
              terminationDate: enrollmentData.terminationMonth
                ? `${enrollmentData.terminationYear}-${enrollmentData.terminationMonth}-${enrollmentData.terminationDay}`
                : null,
              replacementCompany: enrollmentData.replacementCompany,
              replacementPlan: enrollmentData.replacementPlan,
            }
          : null,
      otherInsurance:
        enrollmentData.hasOtherHealthInsurance === "yes"
          ? {
              companyName: enrollmentData.otherInsuranceCompanyName,
              policyType: enrollmentData.otherInsurancePolicyType,
              policyNumber: enrollmentData.otherInsurancePolicyNumber,
            }
          : null,
      lastSavedAt: new Date().toISOString(),
    }

    await sql`
      UPDATE applications 
      SET 
        encrypted_ssn = NULL,
        encrypted_medicare_number = NULL,
        encrypted_routing_number = NULL,
        encrypted_account_number = NULL,
        carrier_name = ${enrollmentData.selectedCarrier || null},
        plan_selection = ${enrollmentData.selectedPlan || null},
        health_answers = ${JSON.stringify(healthAnswers)},
        metadata = ${JSON.stringify(metadata)},
        status = CASE WHEN status = 'draft' THEN 'in_progress' ELSE status END,
        last_page_completed = COALESCE(${lastPage || null}, last_page_completed),
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE id = ${applicationId}
    `

    // This was causing the "Bob Yest" bug where stale enrollment data would overwrite
    // the lead's name. Lead names should ONLY be set during initial lead creation,
    // not updated from enrollment metadata.
    //
    // We still update phone and city if provided, as these are less critical
    // and may be corrections the user makes during enrollment.
    if (normalizedPhone) {
      const appResult = await sql`SELECT lead_id FROM applications WHERE id = ${applicationId}`
      if (appResult && appResult.length > 0 && appResult[0].lead_id) {
        await sql`
          UPDATE leads
          SET
            phone = COALESCE(${normalizedPhone}, phone),
            city = COALESCE(${enrollmentData.city || null}, city),
            updated_at = NOW()
          WHERE id = ${appResult[0].lead_id}
        `
        console.log("[v0] Updated lead phone/city (name intentionally not updated)")
      }
    }

    console.log("[v0] Application saved successfully")

    return NextResponse.json({
      success: true,
      message: "Application saved",
    })
  } catch (error: any) {
    console.error("[v0] Error saving application:", error)
    return NextResponse.json({ success: false, error: "Failed to save application" }, { status: 500 })
  }
}
