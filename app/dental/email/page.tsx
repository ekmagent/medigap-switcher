"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmailPage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()
  const [email, setEmail] = useState(formData.email || "")
  const [error, setError] = useState("")

  const isValid = /^\S+@\S+\.\S+$/.test(email.trim())

  const handleContinue = () => {
    if (!isValid) {
      setError("Please enter a valid email address")
      return
    }
    updateFormData("email", email.trim())
    router.push("/dental/phone")
  }

  return (
    <StepWrapper step={10}>
      <DentalProgress currentStep={10} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Where should we send them?</h1>
        <p className="text-center text-muted-foreground mb-8">We'll email your options so you have them in writing</p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            placeholder="you@example.com"
            autoFocus
            className="mt-1.5 text-lg"
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
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
