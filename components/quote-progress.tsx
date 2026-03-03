"use client"

import { useEffect, useState } from "react"

const TOTAL_STEPS = 10

export function QuoteProgress({ currentStep }: { currentStep: number }) {
  const progress = Math.round((currentStep / TOTAL_STEPS) * 100)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Trigger pulse on each step change
    setAnimated(false)
    const t = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(t)
  }, [currentStep])

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {currentStep} of {TOTAL_STEPS}
        </span>
        <span className="text-xs font-bold text-[#4ade80]">{progress}%</span>
      </div>

      {/* Custom progress bar with shimmer */}
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            animated ? "animate-progress-pulse" : ""
          } progress-shimmer`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
