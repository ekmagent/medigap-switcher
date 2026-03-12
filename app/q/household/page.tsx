"use client"

import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { track } from "@vercel/analytics"

export default function HouseholdPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  const handleSelect = (value: string) => {
    track("quiz_household_answered", { household: value })
    updateFormData("household", value)
    router.push("/q/verify")
  }

  return (
    <StepWrapper step={7}>
        <QuoteProgress currentStep={7} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            Household Discount
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Does a spouse or partner in your household also have a Medicare Supplement plan?
          </p>

          <div className="space-y-3">
            {[
              { value: "yes", label: "Yes", description: "We live together and both have Medigap" },
              { value: "no", label: "No", description: "Just me" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-[color,background-color,border-color,transform] hover:scale-[1.01] ${
                  formData.household === option.value
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                <span className="text-lg font-medium">{option.label}</span>
                <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Many carriers offer a discount when multiple people in the same household are insured.
          </p>
        </div>
    </StepWrapper>
  )
}
