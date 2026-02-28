"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

export default function CurrentPremiumPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()
  const [value, setValue] = useState(formData.currentPremium || "")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "")
    // Allow only one decimal point and max 2 decimal places
    const parts = raw.split(".")
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return
    setValue(raw)
  }

  const handleContinue = () => {
    if (!value || parseFloat(value) <= 0) return
    updateFormData("currentPremium", value)
    router.push("/q/zipcode")
  }

  const numValue = parseFloat(value) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={2} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            How much do you pay for your Medicare Supplement?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            If you don't know the exact amount, put around what you think.
          </p>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Monthly Premium
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={handleChange}
                placeholder="0.00"
                autoFocus
                className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Per month</p>
          </div>

          <Button
            onClick={handleContinue}
            disabled={numValue <= 0}
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
