"use client"

import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { track } from "@vercel/analytics"

export default function GenderPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  const handleSelect = (gender: string) => {
    track("quiz_gender_selected", { gender })
    updateFormData("gender", gender)
    router.push("/q/tobacco")
  }

  return (
    <StepWrapper step={5}>
        <QuoteProgress currentStep={5} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            What is your gender?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Rates may differ by gender
          </p>

          <div className="space-y-3">
            {[
              { value: "Male", emoji: "M" },
              { value: "Female", emoji: "F" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-[color,background-color,border-color,transform] text-lg font-medium hover:scale-[1.01] ${
                  formData.gender === option.value
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                {option.value}
              </button>
            ))}
          </div>
        </div>
    </StepWrapper>
  )
}
