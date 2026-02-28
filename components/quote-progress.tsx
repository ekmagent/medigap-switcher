"use client"

import { Progress } from "@/components/ui/progress"

const STEPS = [
  "Current Plan",
  "Premium",
  "Zip Code",
  "Date of Birth",
  "Gender",
  "Tobacco",
  "Household",
  "Health",
  "Loading",
  "Results",
]

export function QuoteProgress({ currentStep }: { currentStep: number }) {
  const progress = Math.round((currentStep / STEPS.length) * 100)

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm font-medium text-primary">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
