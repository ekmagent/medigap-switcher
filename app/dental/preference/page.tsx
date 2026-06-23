"use client"

import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { Check } from "lucide-react"

const OPTIONS = [
  {
    value: "basic",
    label: "Basic coverage",
    description: "Preventive care fully covered — cleanings and exams at no cost to you",
  },
  {
    value: "comprehensive",
    label: "More comprehensive",
    description: "Adds bigger protection — fillings plus crowns, dentures, and implants",
    badge: true,
  },
]

export default function PreferencePage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const handleSelect = (value: string) => {
    updateFormData("preference", value)
    router.push("/dental/name")
  }

  return (
    <StepWrapper step={8}>
      <DentalProgress currentStep={8} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Which sounds like a better fit?</h1>
        <p className="text-center text-muted-foreground mb-8">Either way, your preventive care is fully covered.</p>

        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-[color,background-color,border-color,transform] hover:scale-[1.01] ${
                formData.preference === opt.value
                  ? "border-[#4ade80] bg-[#4ade80]/10"
                  : "border-gray-200 bg-white hover:border-[#4ade80]/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{opt.label}</span>
                {opt.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#4ade80]">
                    <Check className="w-3 h-3" /> Most confidence
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>
    </StepWrapper>
  )
}
