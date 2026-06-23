"use client"

import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

const OPTIONS = [
  {
    value: "preventative",
    label: "My preventive care fully covered",
    description: "Cleanings and exams paid for — at no cost to me",
  },
  {
    value: "major",
    label: "Protection when major work is needed",
    description: "Covered for crowns, dentures, and implants",
  },
]

export default function CoverageFocusPage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const handleSelect = (value: string) => {
    updateFormData("coverageFocus", value)
    router.push("/dental/medicare")
  }

  return (
    <StepWrapper step={3}>
      <DentalProgress currentStep={3} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">What matters most to you?</h1>
        <p className="text-center text-muted-foreground mb-8">
          Are you mainly looking for preventive coverage, or are you more concerned about bigger work?
        </p>

        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-[color,background-color,border-color,transform] hover:scale-[1.01] ${
                formData.coverageFocus === opt.value
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
