import { type NextRequest, NextResponse } from "next/server"
import { getNeonClient } from "@/lib/neon-client"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const sql = getNeonClient()
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get("applicationId")

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID required" }, { status: 400 })
    }

    // This prevents IDOR - users can only load their own application data
    const cookieStore = await cookies()
    const sessionAppId = cookieStore.get("enrollment_session")?.value

    // Allow access if:
    // 1. Session cookie matches the requested applicationId (resumed session)
    // 2. No session cookie but request has valid leadId (initial enrollment flow)
    const leadId = searchParams.get("leadId")

    if (sessionAppId && sessionAppId !== applicationId) {
      console.error("[v0] Session mismatch - session:", sessionAppId, "requested:", applicationId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    console.log("[v0] Loading application data for:", applicationId)

    let applications
    if (leadId) {
      applications = await sql`
        SELECT 
          a.*,
          l.first_name,
          l.last_name,
          l.email,
          l.phone,
          l.date_of_birth,
          l.gender,
          l.city,
          l.state,
          l.zip_code
        FROM applications a
        LEFT JOIN leads l ON a.lead_id = l.id
        WHERE a.id = ${applicationId} AND a.lead_id = ${leadId}
        LIMIT 1
      `
    } else {
      applications = await sql`
        SELECT 
          a.*,
          l.first_name,
          l.last_name,
          l.email,
          l.phone,
          l.date_of_birth,
          l.gender,
          l.city,
          l.state,
          l.zip_code
        FROM applications a
        LEFT JOIN leads l ON a.lead_id = l.id
        WHERE a.id = ${applicationId}
        LIMIT 1
      `
    }

    if (applications.length === 0) {
      console.error("[v0] Application not found:", applicationId)
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const app = applications[0]
    const metadata = app.metadata || {}
    const healthAnswers = app.health_answers || {}

    const enrollmentData = {
      // Personal info - prefer metadata (most recent), fallback to leads table
      firstName: metadata.firstName || app.first_name || "",
      lastName: metadata.lastName || app.last_name || "",
      email: metadata.email || app.email || "",
      phone: metadata.phone || app.phone || "",
      dateOfBirth: metadata.dateOfBirth || app.date_of_birth || "",
      gender: metadata.gender || app.gender || "",

      // Address
      addressLine1: metadata.addressLine1 || "",
      addressLine2: metadata.addressLine2 || "",
      city: metadata.city || app.city || "",
      state: metadata.state || app.state || "",
      zipCode: metadata.zipCode || app.zip_code || "",
      county: metadata.county || "",

      // Mailing address
      mailingAddressDifferent: metadata.mailingAddressDifferent || "",
      mailingAddressLine1: metadata.mailingAddressLine1 || "",
      mailingAddressLine2: metadata.mailingAddressLine2 || "",
      mailingCity: metadata.mailingCity || "",
      mailingState: metadata.mailingState || "",
      mailingZipCode: metadata.mailingZipCode || "",

      // Plan selection
      selectedCarrier: app.carrier_name || metadata.selectedCarrier || "",
      selectedPlan: app.plan_selection || metadata.selectedPlan || "",
      monthlyPremium: metadata.monthlyPremium || "",
      quoteKey: metadata.quoteKey || "",
      quoteId: metadata.quoteId || app.quote_id || "",

      // Medicare dates
      partAEffectiveDate: metadata.partAEffectiveDate || "",
      partBEffectiveDate: metadata.partBEffectiveDate || "",

      // Underwriting & health questions
      underwritingType: healthAnswers.underwritingType || "",
      hasSSDisability: healthAnswers.hasSSDisability || "",
      ssDisabilityMonth: healthAnswers.ssDisabilityMonth || "",
      ssDisabilityDay: healthAnswers.ssDisabilityDay || "",
      ssDisabilityYear: healthAnswers.ssDisabilityYear || "",

      // Medicaid
      hasMedicaid: healthAnswers.hasMedicaid || "",
      medicaidPaysPremiums: healthAnswers.medicaidPaysPremiums || "",
      medicaidOtherBenefits: healthAnswers.medicaidOtherBenefits || "",

      // Replacement
      hasExistingPolicy: healthAnswers.hasExistingPolicy || "",
      intendToReplace: healthAnswers.intendToReplace || metadata.replacementInfo?.intendToReplace || "",
      terminationMonth: healthAnswers.terminationMonth || "",
      terminationDay: healthAnswers.terminationDay || "",
      terminationYear: healthAnswers.terminationYear || "",
      replacementCompany: healthAnswers.replacementCompany || metadata.replacementInfo?.replacementCompany || "",
      replacementPlan: healthAnswers.replacementPlan || metadata.replacementInfo?.replacementPlan || "",

      // Prior coverage
      hasPriorMedicareCoverage: healthAnswers.hasPriorMedicareCoverage || "",
      stillCoveredUnderPlan: healthAnswers.stillCoveredUnderPlan || "",
      priorPlanStartMonth: healthAnswers.priorPlanStartMonth || "",
      priorPlanStartDay: healthAnswers.priorPlanStartDay || "",
      priorPlanStartYear: healthAnswers.priorPlanStartYear || "",
      firstTimeInPlanType: healthAnswers.firstTimeInPlanType || "",
      droppedSupplementForPlan: healthAnswers.droppedSupplementForPlan || "",
      formerSupplementStillAvailable: healthAnswers.formerSupplementStillAvailable || "",
      terminationReason: healthAnswers.terminationReason || "",

      // Other insurance
      hasOtherHealthInsurance: healthAnswers.hasOtherHealthInsurance || "",
      stillCoveredUnderOtherPlan: healthAnswers.stillCoveredUnderOtherPlan || "",
      otherPlanStartMonth: healthAnswers.otherPlanStartMonth || "",
      otherPlanStartDay: healthAnswers.otherPlanStartDay || "",
      otherPlanStartYear: healthAnswers.otherPlanStartYear || "",
      disenrolledVoluntarily: healthAnswers.disenrolledVoluntarily || "",
      disenrollmentReason: healthAnswers.disenrollmentReason || "",
      otherInsuranceCompany: healthAnswers.otherInsuranceCompany || "",
      otherInsurancePolicyType: healthAnswers.otherInsurancePolicyType || "",

      // Payment info (non-sensitive)
      paymentMethod: metadata.paymentMethod || "",
      accountType: metadata.accountType || "",
      financialInstitution: metadata.financialInstitution || "",
      accountHolderIsInsured: metadata.accountHolderIsInsured || "",
      acknowledgedPaymentTerms: metadata.acknowledgedPaymentTerms || "",

      // Medicare card status
      medicareCardStatus: metadata.medicareCardStatus || "",

      // Application tracking
      applicationId: app.id,
      leadId: app.lead_id,
      status: app.status,

      hasSavedSSN: !!app.encrypted_ssn,
      hasSavedMBI: !!app.encrypted_medicare_number,
      hasSavedAccountNumber: !!app.encrypted_account_number,
      hasSavedRoutingNumber: !!app.encrypted_routing_number,

      // Clear sensitive values
      ssn: "",
      mbi: "",
      accountNumber: "",
      routingNumber: "",
    }

    console.log("[v0] Returning enrollment data for:", applicationId)
    return NextResponse.json({ enrollmentData })
  } catch (error) {
    console.error("[v0] Error loading application:", error)
    return NextResponse.json({ error: "Failed to load application" }, { status: 500 })
  }
}
