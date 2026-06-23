"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

export default function BirthDayPage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()

  const month = Number(formData.dobMonth)
  const year = Number(formData.dobYear)

  // Guard: need month + year first.
  useEffect(() => {
    if (!month || !year) router.replace("/dental/date-of-birth")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Real number of days in the selected month/year (handles leap years).
  const daysInMonth = month && year ? new Date(year, month, 0).getDate() : 31
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const existingDay = formData.dateOfBirth ? Number(formData.dateOfBirth.split("/")[1]) : 0

  const handleSelect = (d: number) => {
    const dob = `${String(month).padStart(2, "0")}/${String(d).padStart(2, "0")}/${year}`
    updateFormData("dateOfBirth", dob)
    router.push("/dental/preference")
  }

  return (
    <StepWrapper step={7}>
      <DentalProgress currentStep={7} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">And the day?</h1>
        <p className="text-center text-muted-foreground mb-6">Almost there — pick your birth day</p>

        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => handleSelect(d)}
              className={`py-3 rounded-lg border-2 text-sm font-semibold transition-[color,background-color,border-color,transform] active:scale-95 ${
                existingDay === d
                  ? "border-[#4ade80] bg-[#4ade80] text-white shadow-md"
                  : "border-gray-200 bg-white text-foreground hover:border-[#4ade80]/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </StepWrapper>
  )
}
