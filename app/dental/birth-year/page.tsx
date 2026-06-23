"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"

const MIN_YEAR = 1930
const MAX_YEAR = 2008 // ~18+ in 2026
const DECADES = [2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930]

export default function BirthYearPage() {
  const router = useRouter()
  const { formData, updateFormData } = useDentalForm()
  const [decade, setDecade] = useState(0)

  // Guard: if someone deep-links here without picking a month, send them back.
  useEffect(() => {
    if (!formData.dobMonth) router.replace("/dental/date-of-birth")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectYear = (y: number) => {
    updateFormData("dobYear", String(y))
    router.push("/dental/birth-day")
  }

  const yearsInDecade = DECADES.includes(decade)
    ? Array.from({ length: 10 }, (_, i) => decade + i).filter((y) => y >= MIN_YEAR && y <= MAX_YEAR)
    : []

  return (
    <StepWrapper step={6}>
      <DentalProgress currentStep={6} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">What year?</h1>
        <p className="text-center text-muted-foreground mb-6">Pick the decade, then the year</p>

        <div className="mb-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Decade</p>
          <div className="grid grid-cols-4 gap-2">
            {DECADES.map((d) => (
              <button
                key={d}
                onClick={() => setDecade(d)}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-[color,background-color,border-color,transform] active:scale-95 ${
                  decade === d
                    ? "border-[#4ade80] bg-[#4ade80] text-white shadow-md"
                    : "border-gray-200 bg-white text-foreground hover:border-[#4ade80]/50"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {decade > 0 && (
          <div className="animate-fade-up">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Year</p>
            <div className="grid grid-cols-5 gap-2">
              {yearsInDecade.map((y) => (
                <button
                  key={y}
                  onClick={() => handleSelectYear(y)}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition-[color,background-color,border-color,transform] active:scale-95 ${
                    Number(formData.dobYear) === y
                      ? "border-[#4ade80] bg-[#4ade80] text-white shadow-md"
                      : "border-gray-200 bg-white text-foreground hover:border-[#4ade80]/50"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StepWrapper>
  )
}
