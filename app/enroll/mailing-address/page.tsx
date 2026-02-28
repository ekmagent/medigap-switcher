"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function MailingAddressPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()
  const [isDifferent, setIsDifferent] = useState(enrollmentData.mailingAddressDifferent === "yes")
  const [line1, setLine1] = useState(enrollmentData.mailingAddressLine1 || "")
  const [line2, setLine2] = useState(enrollmentData.mailingAddressLine2 || "")
  const [city, setCity] = useState(enrollmentData.mailingCity || "")
  const [state, setState] = useState(enrollmentData.mailingState || "")
  const [zip, setZip] = useState(enrollmentData.mailingZipCode || "")

  const handleContinue = () => {
    updateEnrollmentData("mailingAddressDifferent", isDifferent ? "yes" : "no")
    if (isDifferent) {
      updateEnrollmentData("mailingAddressLine1", line1)
      updateEnrollmentData("mailingAddressLine2", line2)
      updateEnrollmentData("mailingCity", city)
      updateEnrollmentData("mailingState", state)
      updateEnrollmentData("mailingZipCode", zip)
    }
    router.push("/enroll/contact")
  }

  return (
    <>
      <EnrollmentProgress currentStep={4} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Mailing Address</h1>
        <p className="text-center text-muted-foreground mb-8">
          Is your mailing address different from your residential address?
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => { setIsDifferent(false); handleContinue() }}
            className="w-full text-left p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-primary/50 transition-all text-lg font-medium"
          >
            No, same address
          </button>
          <button
            onClick={() => setIsDifferent(true)}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all text-lg font-medium ${
              isDifferent ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-primary/50"
            }`}
          >
            Yes, different mailing address
          </button>
        </div>

        {isDifferent && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">
            <div>
              <Label htmlFor="mLine1">Street Address</Label>
              <Input id="mLine1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="PO Box 123" autoFocus />
            </div>
            <div>
              <Label htmlFor="mLine2">Apt, Suite, Unit (optional)</Label>
              <Input id="mLine2" value={line2} onChange={(e) => setLine2(e.target.value)} />
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <Label htmlFor="mCity">City</Label>
                <Input id="mCity" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mState">State</Label>
                <Input id="mState" value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="mZip">Zip</Label>
                <Input id="mZip" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} maxLength={5} />
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!line1 || !city || !state || !zip}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
