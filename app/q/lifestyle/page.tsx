"use client"

import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { track } from "@vercel/analytics"

export default function LifestylePage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  const handleSelect = (tobacco: string) => {
    track("quiz_lifestyle_selected", { tobacco })
    updateFormData("tobacco", tobacco)
    router.push("/q/household")
  }

  return (
    <StepWrapper step={6}>
        <QuoteProgress currentStep={6} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            Have you used tobacco products in the last 12 months?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            This is an insurance rating factor that may affect your quoted premiums
          </p>

          <div className="space-y-3">
            {[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-[color,background-color,border-color,transform] text-lg font-medium hover:scale-[1.01] ${
                  formData.tobacco === option.value
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
    </StepWrapper>
  )
}
