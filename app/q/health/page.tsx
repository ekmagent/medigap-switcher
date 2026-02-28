"use client"

import { useRouter } from "next/navigation"
import { QuoteProgress } from "@/components/quote-progress"

// Page 1 of 3: Current Status + Last 6 Months
const CONDITIONS = [
  "Currently hospitalized, in a nursing facility, assisted living, or receiving home health care",
  "Require a walker, wheelchair, or motorized mobility aid",
  "Advised to have surgery, medical tests, or treatments not yet completed",
  "Require supplemental oxygen",
  "Have an implanted cardiac defibrillator",
  "Have angina (chest pain due to heart disease)",
  "Require more than 50 units of insulin per day",
]

export default function HealthPage1() {
  const router = useRouter()

  const handleAnswer = (yes: boolean) => {
    if (yes) {
      router.push("/q/health/disqualified")
    } else {
      router.push("/q/health/2")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={7} />

        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            A few quick health questions
          </h1>
          <p className="text-center text-muted-foreground mb-2">
            Step 1 of 3
          </p>
          <p className="text-center text-muted-foreground mb-8">
            Do any of the following currently apply to you?
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
              className="w-full text-left p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-primary/50 transition-all text-lg font-medium"
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
