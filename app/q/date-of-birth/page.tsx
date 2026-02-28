"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getMedigapRateAge } from "@/lib/medigap-age"

export default function DateOfBirthPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()
  const [dob, setDob] = useState(formData.dateOfBirth || "")
  const [error, setError] = useState("")

  const formatDob = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDob(e.target.value)
    setDob(formatted)
    setError("")
  }

  const handleContinue = () => {
    const parts = dob.split("/")
    if (parts.length !== 3) {
      setError("Please enter a valid date (MM/DD/YYYY)")
      return
    }

    const [month, day, year] = parts.map(Number)
    if (!month || !day || !year || month > 12 || day > 31 || year < 1900 || year > 2010) {
      setError("Please enter a valid date of birth")
      return
    }

    const birthDate = new Date(year, month - 1, day)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    if (age < 50 || age > 120) {
      setError("You must be at least 50 years old for Medicare Supplement coverage")
      return
    }

    // Effective date: 1st of next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const effectiveYear = nextMonth.getFullYear()
    const effectiveMonth = nextMonth.getMonth() + 1
    const effectiveDate = `${effectiveYear}-${String(effectiveMonth).padStart(2, "0")}-01`

    // Calculate quoting age using StableScore logic
    const quotingAge = getMedigapRateAge(year, month, day, effectiveYear, effectiveMonth)

    updateFormData("dateOfBirth", dob)
    updateFormData("quotingAge", quotingAge)
    updateFormData("effectiveDate", effectiveDate)
    router.push("/q/gender")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={4} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            What's your date of birth?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            This helps us find accurate rates for your age
          </p>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <Label htmlFor="dob">Date of Birth</Label>
            <input
              id="dob"
              type="text"
              inputMode="numeric"
              value={dob}
              onChange={handleChange}
              placeholder="MM/DD/YYYY"
              maxLength={10}
              autoFocus
              className="w-full mt-2 px-4 py-4 text-xl text-center border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors tracking-wider"
            />
            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </div>

          <Button
            onClick={handleContinue}
            disabled={dob.length < 10}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
