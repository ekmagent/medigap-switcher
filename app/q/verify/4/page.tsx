"use client"

import { useRouter } from "next/navigation"
import { QuoteProgress } from "@/components/quote-progress"

export default function VerifyPage4() {
  const router = useRouter()

  const handleAnswer = (yes: boolean) => {
    if (yes) {
      router.push("/q/verify/review")
    } else {
      router.push("/q/loading")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={8} />

        <div className="max-w-md mx-auto">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Last one
          </p>
          <h1 className="text-xl font-bold text-center mb-6">
            Pending Tests or Treatments
          </h1>

          <p className="text-center text-[15px] text-muted-foreground mb-5">
            Has a doctor advised you to have any of the following that <span className="font-semibold text-foreground">haven't been completed yet</span>?
          </p>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm mb-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Diagnostic tests (biopsy, MRI, etc.)</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Surgery or medical procedures</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Treatments with unknown or pending results</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(false)}
              className="w-full text-center p-4 rounded-xl border-2 border-[#4ade80] bg-[#4ade80] text-white hover:bg-[#22c55e] transition-all text-lg font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              No, nothing pending
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="w-full text-center p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-destructive/50 transition-all text-base font-medium"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
