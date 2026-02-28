"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function EnrollDOBPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()
  const [dob, setDob] = useState(enrollmentData.dateOfBirth || "")

  const formatDob = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  const handleContinue = () => {
    updateEnrollmentData("dateOfBirth", dob)
    router.push("/enroll/address")
  }

  return (
    <>
      <EnrollmentProgress currentStep={2} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Date of Birth</h1>
        <p className="text-center text-muted-foreground mb-8">Confirm your date of birth</p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Label htmlFor="dob">Date of Birth</Label>
          <input
            id="dob"
            type="text"
            inputMode="numeric"
            value={dob}
            onChange={(e) => setDob(formatDob(e.target.value))}
            placeholder="MM/DD/YYYY"
            maxLength={10}
            autoFocus
            className="w-full mt-2 px-4 py-4 text-xl text-center border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors tracking-wider"
          />
        </div>

        <Button onClick={handleContinue} disabled={dob.length < 10} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    </>
  )
}
