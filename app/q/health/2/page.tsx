"use client"

import { useRouter } from "next/navigation"
import { QuoteProgress } from "@/components/quote-progress"

// Page 2 of 3: Last 2 Years
const CONDITIONS = [
  "Heart attack, stroke, or TIA (mini-stroke)",
  "Surgery for any heart or circulatory disease",
  "Diagnosed with or treated for cancer (excluding non-melanoma skin cancer)",
  "Diagnosed with or treated for atrial fibrillation",
]

export default function HealthPage2() {
  const router = useRouter()

  const handleAnswer = (yes: boolean) => {
    if (yes) {
      router.push("/q/health/disqualified")
    } else {
      router.push("/q/health/3")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={8} />

        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            Health questions continued
          </h1>
          <p className="text-center text-muted-foreground mb-2">
            Step 2 of 3
          </p>
          <p className="text-center text-muted-foreground mb-8">
            In the last 2 years, have you experienced any of the following?
          </p>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <ul className="space-y-3">
              {CONDITIONS.map((condition) => (
                <li key={condition} className="flex items-start gap-3 text-sm">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center font-semibold mb-4">
            Do any of the above apply to you?
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(false)}
              className="w-full text-center p-5 rounded-xl border-2 border-[#4ade80] bg-[#4ade80] text-white hover:bg-[#22c55e] transition-all text-lg font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              No, none of these apply
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="w-full text-left p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-destructive/50 transition-all text-lg font-medium"
            >
              Yes, one or more applies
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
