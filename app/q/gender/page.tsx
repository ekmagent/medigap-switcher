"use client"

import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"

export default function GenderPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  const handleSelect = (gender: string) => {
    updateFormData("gender", gender)
    router.push("/q/tobacco")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={5} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            What is your gender?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Rates may differ by gender
          </p>

          <div className="space-y-3">
            {[
              { value: "Male", emoji: "M" },
              { value: "Female", emoji: "F" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all text-lg font-medium ${
                  formData.gender === option.value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white hover:border-primary/50"
                }`}
              >
                {option.value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
