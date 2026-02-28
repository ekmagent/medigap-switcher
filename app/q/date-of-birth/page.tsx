"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getMedigapRateAge } from "@/lib/medigap-age"

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

// 1942 to 1961 covers ages ~65-84 in 2026
const YEARS: number[] = []
for (let y = 1961; y >= 1942; y--) {
  YEARS.push(y)
}

export default function DateOfBirthPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  const existingParts = formData.dateOfBirth ? formData.dateOfBirth.split("/") : []
  const [month, setMonth] = useState(existingParts[0] ? parseInt(existingParts[0]) : 0)
  const [year, setYear] = useState(existingParts[2] ? parseInt(existingParts[2]) : 0)
  const [showManual, setShowManual] = useState(false)
  const [manualDob, setManualDob] = useState(formData.dateOfBirth || "")
  const [error, setError] = useState("")

  const formatDob = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  const processAndContinue = (birthMonth: number, birthYear: number, fullDob: string) => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const effectiveYear = nextMonth.getFullYear()
    const effectiveMonth = nextMonth.getMonth() + 1
    const effectiveDate = `${effectiveYear}-${String(effectiveMonth).padStart(2, "0")}-01`

    const day = fullDob.includes("/") ? parseInt(fullDob.split("/")[1]) || 15 : 15
    const quotingAge = getMedigapRateAge(birthYear, birthMonth, day, effectiveYear, effectiveMonth)

    updateFormData("dateOfBirth", fullDob)
    updateFormData("quotingAge", quotingAge)
    updateFormData("effectiveDate", effectiveDate)
    router.push("/q/gender")
  }

  const handleSelectMonth = (m: number) => {
    setMonth(m)
    setError("")
  }

  const handleSelectYear = (y: number) => {
    setYear(y)
    setError("")
    // Auto-continue once both are selected
    const dob = `${String(month).padStart(2, "0")}/15/${y}`
    processAndContinue(month, y, dob)
  }

  const handleManualContinue = () => {
    const parts = manualDob.split("/")
    if (parts.length !== 3) {
      setError("Please enter a valid date (MM/DD/YYYY)")
      return
    }

    const [m, d, y] = parts.map(Number)
    if (!m || !d || !y || m > 12 || d > 31 || y < 1900 || y > 2010) {
      setError("Please enter a valid date of birth")
      return
    }

    const age = new Date().getFullYear() - y
    if (age < 50 || age > 120) {
      setError("You must be at least 50 years old for Medicare Supplement coverage")
      return
    }

    processAndContinue(m, y, manualDob)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={4} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            When were you born?
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            This helps us find accurate rates for your age
          </p>

          {!showManual ? (
            <>
              {/* Month grid */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Birth Month</p>
                <div className="grid grid-cols-4 gap-2">
                  {MONTHS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => handleSelectMonth(m.value)}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                        month === m.value
                          ? "border-[#4ade80] bg-[#4ade80] text-white shadow-md"
                          : "border-gray-200 bg-white text-foreground hover:border-[#4ade80]/50"
                      }`}
                    >
                      {m.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year grid — shows after month is selected */}
              {month > 0 && (
                <div className="mb-6 animate-fade-up">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Birth Year</p>
                  <div className="grid grid-cols-5 gap-2">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        onClick={() => handleSelectYear(y)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${
                          year === y
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

              {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}

              <button
                onClick={() => setShowManual(true)}
                className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                My birth year isn't listed
              </button>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <Label htmlFor="dob">Date of Birth</Label>
                <input
                  id="dob"
                  type="text"
                  inputMode="numeric"
                  value={manualDob}
                  onChange={(e) => { setManualDob(formatDob(e.target.value)); setError("") }}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  autoFocus
                  className="w-full mt-2 px-4 py-4 text-xl text-center border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors tracking-wider"
                />
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
              </div>

              <Button
                onClick={handleManualContinue}
                disabled={manualDob.length < 10}
                className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                Continue
              </Button>

              <button
                onClick={() => { setShowManual(false); setError("") }}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Back to grid
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
