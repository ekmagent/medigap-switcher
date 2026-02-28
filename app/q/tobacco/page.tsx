"use client"

import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"

export default function TobaccoPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()

  const handleSelect = (tobacco: string) => {
    updateFormData("tobacco", tobacco)
    router.push("/q/health")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={6} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            Have you used tobacco products in the last 12 months?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Includes cigarettes, cigars, e-cigarettes, vaping, and chewing tobacco
          </p>

          <div className="space-y-3">
            {[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all text-lg font-medium hover:scale-[1.01] ${
                  formData.tobacco === option.value
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
