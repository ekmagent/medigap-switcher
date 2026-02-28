"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { ChevronDown } from "lucide-react"

const PRIMARY_PLANS = [
  { value: "G", label: "Plan G", description: "Most popular — you pay only the Part B deductible" },
  { value: "N", label: "Plan N", description: "Lower premium — small copays for some visits" },
  { value: "F", label: "Plan F", description: "Most comprehensive — covers all gaps" },
]

const OTHER_PLANS = [
  { value: "C", label: "Plan C", description: "Similar to Plan F with some differences" },
  { value: "other", label: "Other / Not Sure", description: "I have a different plan or I'm not sure" },
]

export default function CurrentPlanPage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()
  const [showOther, setShowOther] = useState(false)

  const handleSelect = (plan: string) => {
    updateFormData("currentPlan", plan)
    router.push("/q/current-premium")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={1} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            What Medigap plan do you currently have?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Select your current Medicare Supplement plan type
          </p>

          <div className="space-y-3">
            {PRIMARY_PLANS.map((plan) => (
              <button
                key={plan.value}
                onClick={() => handleSelect(plan.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${
                  formData.currentPlan === plan.value
                    ? "border-[#4ade80] bg-[#4ade80]/10"
                    : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                <div className="font-semibold text-lg">{plan.label}</div>
                <div className="text-sm text-muted-foreground">{plan.description}</div>
              </button>
            ))}

            {/* Other toggle */}
            {!showOther ? (
              <button
                onClick={() => setShowOther(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-gray-300 transition-all text-muted-foreground"
              >
                <span className="font-medium">I have a different plan</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              OTHER_PLANS.map((plan) => (
                <button
                  key={plan.value}
                  onClick={() => handleSelect(plan.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${
                    formData.currentPlan === plan.value
                      ? "border-[#4ade80] bg-[#4ade80]/10"
                      : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                  }`}
                >
                  <div className="font-semibold text-lg">{plan.label}</div>
                  <div className="text-sm text-muted-foreground">{plan.description}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
