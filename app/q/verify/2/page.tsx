"use client"

import { useRouter } from "next/navigation"
import { QuoteProgress } from "@/components/quote-progress"
import { track } from "@vercel/analytics"

export default function VerifyPage2() {
  const router = useRouter()

  const handleAnswer = (yes: boolean) => {
    track("eligibility_q2_answered", { answer: yes ? "yes" : "no" })
    if (yes) {
      router.push("/q/verify/review")
    } else {
      router.push("/q/verify/3")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={8} />

        <div className="max-w-md mx-auto">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Step 2 of 4
          </p>
          <h1 className="text-xl font-bold text-center mb-6">
            Chronic or Permanent Conditions
          </h1>

          <p className="text-center text-[15px] text-muted-foreground mb-5">
            Have you <span className="font-semibold text-foreground">ever</span> been diagnosed with or treated for:
          </p>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm mb-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Alzheimer's, dementia, or taking memory loss medications (like Aricept or Namenda)</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Bipolar disorder or schizophrenia</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Diabetes requiring insulin or three or more diabetes medications</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Parkinson's, ALS, or multiple sclerosis</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Congestive heart failure</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>End-stage renal disease or dialysis</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>HIV / AIDS</span>
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
