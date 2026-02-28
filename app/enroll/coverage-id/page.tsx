"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CoverageIdPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()
  const [mbi, setMbi] = useState(enrollmentData.mbi || "")

  const handleContinue = () => {
    updateEnrollmentData("mbi", mbi)
    router.push("/enroll/review")
  }

  const handleSkip = () => {
    router.push("/enroll/review")
  }

  return (
    <>
      <EnrollmentProgress currentStep={7} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Medicare Beneficiary Identifier</h1>
        <p className="text-center text-muted-foreground mb-8">
          Your MBI is on your red, white, and blue Medicare card
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Label htmlFor="mbi">Medicare Number (MBI)</Label>
          <Input
            id="mbi"
            value={mbi}
            onChange={(e) => setMbi(e.target.value.toUpperCase())}
            placeholder="1EG4-TE5-MK73"
            maxLength={15}
            autoFocus
            className="mt-2 text-lg tracking-wider"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Format: 1ABC-DEF-GH12 (11 characters)
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleContinue} disabled={!mbi} className="w-full" size="lg">
            Continue
          </Button>
          <Button onClick={handleSkip} variant="outline" className="w-full bg-transparent" size="lg">
            Don't have your card handy? Skip for now
          </Button>
        </div>
      </div>
    </>
  )
}
