"use client"

import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

const OPTIONS = [
  { value: "yes", label: "Yes, I have dental coverage now", description: "Through an employer, a plan, or on my own" },
  { value: "no", label: "No, I don't have dental coverage", description: "I'm currently paying out of pocket" },
]

export default function CoverageNowPage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const handleSelect = (value: string) => {
    updateFormData("hasDentalNow", value)
    router.push("/dental/coverage-focus")
  }

  return (
    <StepWrapper step={2}>
      <DentalProgress currentStep={2} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Do you currently have dental coverage?</h1>
        <p className="text-center text-muted-foreground mb-8">Just a couple quick questions</p>

        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-[color,background-color,border-color,transform] hover:scale-[1.01] ${
                formData.hasDentalNow === opt.value
                  ? "border-[#4ade80] bg-[#4ade80]/10"
                  : "border-gray-200 bg-white hover:border-[#4ade80]/50"
              }`}
            >
              <div className="font-semibold text-lg">{opt.label}</div>
              <div className="text-sm text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>
    </StepWrapper>
  )
}
