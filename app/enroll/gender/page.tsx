"use client"

import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"

export default function EnrollGenderPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()

  const handleSelect = (gender: string) => {
    updateEnrollmentData("gender", gender)
    router.push("/enroll/coverage-id")
  }

  return (
    <>
      <EnrollmentProgress currentStep={5} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Gender</h1>
        <p className="text-center text-muted-foreground mb-8">Confirm your gender</p>

        <div className="space-y-3">
          {["Male", "Female"].map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all text-lg font-medium ${
                enrollmentData.gender === option
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-primary/50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
