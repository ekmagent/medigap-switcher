"use client"

import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

const MONTHS = [
  { value: 1, short: "Jan" },
  { value: 2, short: "Feb" },
  { value: 3, short: "Mar" },
  { value: 4, short: "Apr" },
  { value: 5, short: "May" },
  { value: 6, short: "Jun" },
  { value: 7, short: "Jul" },
  { value: 8, short: "Aug" },
  { value: 9, short: "Sep" },
  { value: 10, short: "Oct" },
  { value: 11, short: "Nov" },
  { value: 12, short: "Dec" },
]

export default function DobMonthPage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const handleSelect = (m: number) => {
    updateFormData("dobMonth", String(m))
    router.push("/dental/birth-year")
  }

  return (
    <StepWrapper step={5}>
      <DentalProgress currentStep={5} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">When were you born?</h1>
        <p className="text-center text-muted-foreground mb-6">Start with the month</p>

        <div className="grid grid-cols-3 gap-3">
          {MONTHS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleSelect(m.value)}
              className={`py-4 rounded-xl border-2 text-base font-semibold transition-[color,background-color,border-color,transform] active:scale-95 ${
                Number(formData.dobMonth) === m.value
                  ? "border-[#4ade80] bg-[#4ade80] text-white shadow-md"
                  : "border-gray-200 bg-white text-foreground hover:border-[#4ade80]/50"
              }`}
            >
              {m.short}
            </button>
          ))}
        </div>
      </div>
    </StepWrapper>
  )
}
