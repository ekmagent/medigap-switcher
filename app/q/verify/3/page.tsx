"use client"

import { useRouter } from "next/navigation"
import { QuoteProgress } from "@/components/quote-progress"

export default function VerifyPage3() {
  const router = useRouter()

  const handleAnswer = (yes: boolean) => {
    if (yes) {
      router.push("/q/verify/review")
    } else {
      router.push("/q/verify/4")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={8} />

        <div className="max-w-md mx-auto">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Step 3 of 4
          </p>
          <h1 className="text-xl font-bold text-center mb-6">
            Recent Major Events
          </h1>

          <p className="text-center text-[15px] text-muted-foreground mb-5">
            In the <span className="font-semibold text-foreground">last 2 years</span>, have you been diagnosed with or treated for:
          </p>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm mb-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Any form of internal cancer</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Heart attack, stroke, or TIA (mini-stroke)</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Heart or vascular surgery</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(false)}
              className="w-full text-center p-4 rounded-xl border-2 border-[#4ade80] bg-[#4ade80] text-white hover:bg-[#22c55e] transition-[color,background-color,border-color,box-shadow,transform] text-lg font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              No, none of these
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="w-full text-center p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-destructive/50 transition-colors text-base font-medium"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
