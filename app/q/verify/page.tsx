"use client"

import { useRouter } from "next/navigation"
import { QuoteProgress } from "@/components/quote-progress"
import { track } from "@vercel/analytics"

export default function VerifyPage1() {
  const router = useRouter()

  const handleAnswer = (yes: boolean) => {
    track("eligibility_q1_answered", { answer: yes ? "yes" : "no" })
    if (yes) {
      router.push("/q/verify/review")
    } else {
      router.push("/q/verify/2")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={8} />

        <div className="max-w-md mx-auto">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Step 1 of 4
          </p>
          <h1 className="text-xl font-bold text-center mb-6">
            Current Care & Mobility
          </h1>

          <p className="text-center text-[15px] text-muted-foreground mb-5">
            Are any of these true for you <span className="font-semibold text-foreground">right now</span>?
          </p>

          <div className="bg-white rounded-xl px-5 py-4 shadow-sm mb-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Hospitalized, in a nursing facility, or receiving home health care</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Require a wheelchair or motorized mobility aid</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Require supplemental oxygen or a nebulizer machine</span>
              </li>
              <li className="flex items-start gap-2.5 text-[15px]">
                <span className="text-muted-foreground/60 mt-px">&#x2022;</span>
                <span>Currently utilizing a pain management clinic or taking heavy prescription opioids</span>
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
