"use client"

import { Progress } from "@/components/ui/progress"

const STEPS = [
  "Date of Birth",
  "Address",
  "Mailing Address",
  "Contact",
  "Gender",
  "Medicare ID",
  "Review",
]

export function EnrollmentProgress({ currentStep }: { currentStep: number }) {
  const progress = Math.round((currentStep / STEPS.length) * 100)

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          {STEPS[currentStep - 1]}
        </span>
        <span className="text-sm font-medium text-primary">
          Step {currentStep} of {STEPS.length}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
