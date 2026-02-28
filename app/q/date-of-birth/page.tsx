"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getMedigapRateAge } from "@/lib/medigap-age"

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

// 1942 to 1961 covers ages ~65-84 in 2026
const YEARS: number[] = []
for (let y = 1961; y >= 1942; y--) {
  YEARS.push(y)
}

export default function DateOfBirthPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  // Parse existing DOB if set
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

    // Use 15th as default day for dropdown selection
    const day = fullDob.includes("/") ? parseInt(fullDob.split("/")[1]) || 15 : 15
    const quotingAge = getMedigapRateAge(birthYear, birthMonth, day, effectiveYear, effectiveMonth)

    updateFormData("dateOfBirth", fullDob)
    updateFormData("quotingAge", quotingAge)
    updateFormData("effectiveDate", effectiveDate)
    router.push("/q/gender")
  }

  const handleDropdownContinue = () => {
    if (!month || !year) {
      setError("Please select both month and year")
      return
    }
    const dob = `${String(month).padStart(2, "0")}/15/${year}`
    processAndContinue(month, year, dob)
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

  const isDropdownReady = month > 0 && year > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={4} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            When were you born?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            This helps us find accurate rates for your age
          </p>

          {!showManual ? (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <select
                    id="month"
                    value={month || ""}
                    onChange={(e) => { setMonth(Number(e.target.value)); setError("") }}
                    className="w-full mt-2 px-4 py-3.5 text-lg border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white appearance-none"
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <select
                    id="year"
                    value={year || ""}
                    onChange={(e) => { setYear(Number(e.target.value)); setError("") }}
                    className="w-full mt-2 px-4 py-3.5 text-lg border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white appearance-none"
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <Button
                onClick={handleDropdownContinue}
                disabled={!isDropdownReady}
                className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                Continue
              </Button>

              <button
                onClick={() => setShowManual(true)}
                className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
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
                Back to dropdown
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
