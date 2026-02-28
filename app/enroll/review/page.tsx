"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function ReviewPage() {
  const router = useRouter()
  const { enrollmentData } = useEnrollment()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // Create application
      const createRes = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: enrollmentData.leadId,
          carrierName: enrollmentData.selectedCarrier,
          planSelection: enrollmentData.selectedPlan,
          monthlyPremium: enrollmentData.monthlyPremium,
          quoteKey: enrollmentData.quoteKey,
        }),
      })

      const createData = await createRes.json()
      const applicationId = createData.applicationId

      if (applicationId) {
        // Save application data
        await fetch("/api/applications/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId,
            leadId: enrollmentData.leadId,
            lastPage: "review",
            enrollmentData: {
              firstName: enrollmentData.firstName,
              lastName: enrollmentData.lastName,
              email: enrollmentData.email,
              phone: enrollmentData.phone,
              dateOfBirth: enrollmentData.dateOfBirth,
              gender: enrollmentData.gender,
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
              mbi: enrollmentData.mbi,
              selectedCarrier: enrollmentData.selectedCarrier,
              selectedPlan: enrollmentData.selectedPlan,
              monthlyPremium: enrollmentData.monthlyPremium,
              quoteKey: enrollmentData.quoteKey,
              hasExistingPolicy: "yes",
              intendToReplace: "yes",
              replacementCompany: enrollmentData.currentCarrier,
              replacementPlan: enrollmentData.currentPlan,
            },
          }),
        })
      }

      router.push("/enroll/success")
    } catch (err: any) {
      setError(err.message || "Failed to submit application")
      setLoading(false)
    }
  }

  const sections = [
    {
      title: "New Plan",
      items: [
        { label: "Carrier", value: enrollmentData.selectedCarrier },
        { label: "Plan", value: enrollmentData.selectedPlan },
        { label: "Monthly Premium", value: enrollmentData.monthlyPremium ? `$${enrollmentData.monthlyPremium}` : "" },
      ],
    },
    {
      title: "Current Policy (Replacing)",
      items: [
        { label: "Current Carrier", value: enrollmentData.currentCarrier },
        { label: "Current Plan", value: enrollmentData.currentPlan },
        { label: "Termination Date", value: enrollmentData.terminationDate },
      ],
    },
    {
      title: "Personal Information",
      items: [
        { label: "Name", value: `${enrollmentData.firstName} ${enrollmentData.lastName}` },
        { label: "Date of Birth", value: enrollmentData.dateOfBirth },
        { label: "Gender", value: enrollmentData.gender },
        { label: "Email", value: enrollmentData.email },
        { label: "Phone", value: enrollmentData.phone },
      ],
    },
    {
      title: "Address",
      items: [
        { label: "Street", value: enrollmentData.addressLine1 },
        { label: "City/State/Zip", value: `${enrollmentData.city}, ${enrollmentData.state} ${enrollmentData.zipCode}` },
        ...(enrollmentData.mailingAddressDifferent === "yes"
          ? [{ label: "Mailing", value: `${enrollmentData.mailingAddressLine1}, ${enrollmentData.mailingCity}, ${enrollmentData.mailingState} ${enrollmentData.mailingZipCode}` }]
          : []),
      ],
    },
    ...(enrollmentData.mbi
      ? [{
          title: "Medicare",
          items: [{ label: "MBI", value: enrollmentData.mbi }],
        }]
      : []),
  ]

  return (
    <>
      <EnrollmentProgress currentStep={8} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Review Your Application</h1>
        <p className="text-center text-muted-foreground mb-8">
          Please confirm everything looks correct
        </p>

        <div className="space-y-4 mb-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </>
  )
}
