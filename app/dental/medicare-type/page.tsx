"use client"

import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

const OPTIONS = [
  {
    value: "advantage",
    label: "Medicare Advantage",
    description: "An all-in-one plan (Part C), often through a private carrier",
  },
  {
    value: "supplement",
    label: "Medicare Supplement",
    description: "A Medigap plan that works alongside Original Medicare",
  },
  { value: "not-sure", label: "I'm not sure", description: "That's okay — we can help you figure it out" },
]

export default function MedicareTypePage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const handleSelect = (value: string) => {
    updateFormData("medicareType", value)
    router.push("/dental/date-of-birth")
  }

  return (
    <StepWrapper step={4}>
      <DentalProgress currentStep={4} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Which type of Medicare do you have?</h1>
        <p className="text-center text-muted-foreground mb-8">Medicare Advantage or Medicare Supplement?</p>

        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-[color,background-color,border-color,transform] hover:scale-[1.01] ${
                formData.medicareType === opt.value
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
