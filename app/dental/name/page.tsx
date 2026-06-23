"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NamePage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()
  const [firstName, setFirstName] = useState(formData.firstName || "")
  const [lastName, setLastName] = useState(formData.lastName || "")

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0

  const handleContinue = () => {
    if (!isValid) return
    updateFormData("firstName", firstName.trim())
    updateFormData("lastName", lastName.trim())
    router.push("/dental/email")
  }

  return (
    <StepWrapper step={9}>
      <DentalProgress currentStep={9} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Your options are ready</h1>
        <p className="text-center text-muted-foreground mb-8">Let's get them to you — who are they for?</p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("lastName")?.focus()}
              autoFocus
              className="mt-1.5 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              className="mt-1.5 text-lg"
            />
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-md hover:shadow-lg transition-[color,background-color,border-color,box-shadow,transform] hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </StepWrapper>
  )
}
