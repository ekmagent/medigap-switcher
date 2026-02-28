"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ReplacementPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()
  const [carrier, setCarrier] = useState(enrollmentData.currentCarrier || "")
  const [plan, setPlan] = useState(enrollmentData.currentPlan || "")
  const [termDate, setTermDate] = useState(enrollmentData.terminationDate || "")

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  const handleContinue = () => {
    updateEnrollmentData("currentCarrier", carrier)
    updateEnrollmentData("currentPlan", plan)
    updateEnrollmentData("terminationDate", termDate)
    updateEnrollmentData("intendToReplace", "yes")
    router.push("/enroll/date-of-birth")
  }

  return (
    <>
      <EnrollmentProgress currentStep={1} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Your Current Policy</h1>
        <p className="text-center text-muted-foreground mb-8">
          Tell us about the plan you're replacing
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">
          <div>
            <Label htmlFor="carrier">Current Insurance Company</Label>
            <Input
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. AARP/UnitedHealthcare"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="plan">Current Plan Type</Label>
            <Input
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="e.g. Plan G"
            />
          </div>
          <div>
            <Label htmlFor="termDate">When do you want to terminate your current policy?</Label>
            <Input
              id="termDate"
              value={termDate}
              onChange={(e) => setTermDate(formatDate(e.target.value))}
              placeholder="MM/DD/YYYY"
              maxLength={10}
            />
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!carrier}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </>
  )
}
