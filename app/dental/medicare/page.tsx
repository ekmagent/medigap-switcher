"use client"

import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

const OPTIONS = [
  { value: "yes", label: "Yes, I'm on Medicare", description: "" },
  { value: "no", label: "No, I'm not on Medicare", description: "" },
]

export default function MedicarePage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const handleSelect = (value: string) => {
    updateFormData("onMedicare", value)
    if (value === "yes") {
      router.push("/dental/medicare-type")
    } else {
      updateFormData("medicareType", "")
      router.push("/dental/date-of-birth")
    }
  }

  return (
    <StepWrapper step={4}>
      <DentalProgress currentStep={4} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Are you currently on Medicare?</h1>
        <p className="text-center text-muted-foreground mb-8">This helps us match the right plan</p>

        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-[color,background-color,border-color,transform] hover:scale-[1.01] ${
                formData.onMedicare === opt.value
                  ? "border-[#4ade80] bg-[#4ade80]/10"
                  : "border-gray-200 bg-white hover:border-[#4ade80]/50"
              }`}
            >
              <div className="font-semibold text-lg">{opt.label}</div>
              {opt.description && <div className="text-sm text-muted-foreground">{opt.description}</div>}
            </button>
          ))}
        </div>
      </div>
    </StepWrapper>
  )
}
