"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddressPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()
  const [line1, setLine1] = useState(enrollmentData.addressLine1 || "")
  const [line2, setLine2] = useState(enrollmentData.addressLine2 || "")
  const [city, setCity] = useState(enrollmentData.city || "")
  const [state, setState] = useState(enrollmentData.state || "")
  const [zip, setZip] = useState(enrollmentData.zipCode || "")

  const handleContinue = () => {
    updateEnrollmentData("addressLine1", line1)
    updateEnrollmentData("addressLine2", line2)
    updateEnrollmentData("city", city)
    updateEnrollmentData("state", state)
    updateEnrollmentData("zipCode", zip)
    router.push("/enroll/mailing-address")
  }

  return (
    <>
      <EnrollmentProgress currentStep={3} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Residential Address</h1>
        <p className="text-center text-muted-foreground mb-8">Where do you live?</p>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">
          <div>
            <Label htmlFor="line1">Street Address</Label>
            <Input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="123 Main St" autoFocus />
          </div>
          <div>
            <Label htmlFor="line2">Apt, Suite, Unit (optional)</Label>
            <Input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apt 4B" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Anytown" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} placeholder="FL" maxLength={2} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="zip">Zip Code</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="12345" maxLength={5} />
            </div>
          </div>
        </div>

        <Button onClick={handleContinue} disabled={!line1 || !city || !state || !zip} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    </>
  )
}
