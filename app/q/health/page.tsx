"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface HealthQuestion {
  id: string
  text: string
  isCheckAll?: boolean
  options?: string[]
}

// Health screening questions — client-side only, NEVER sent to server (HIPAA-safe)
const HEALTH_GROUPS: { title: string; questions: HealthQuestion[] }[] = [
  {
    title: "Current Status",
    questions: [
      {
        id: "hospitalized",
        text: "Are you currently hospitalized, in a nursing facility, assisted living, or receiving home health care?",
      },
      {
        id: "mobilityAid",
        text: "Do you currently require a walker, wheelchair, or motorized mobility aid?",
      },
      {
        id: "pendingSurgery",
        text: "Have you been advised to have any surgery, medical tests, or treatments that haven't been completed yet?",
      },
    ],
  },
  {
    title: "Last 6 Months",
    questions: [
      {
        id: "oxygen",
        text: "Do you require supplemental oxygen for any condition?",
      },
      {
        id: "defibrillator",
        text: "Do you have an implanted cardiac defibrillator?",
      },
      {
        id: "angina",
        text: "Do you have angina (chest pain due to heart disease)?",
      },
      {
        id: "insulin50",
        text: "Do you require more than 50 units of insulin per day?",
      },
    ],
  },
  {
    title: "Last 2 Years",
    questions: [
      {
        id: "heartAttack",
        text: "Have you had a heart attack, stroke, or TIA (mini-stroke)?",
      },
      {
        id: "heartSurgery",
        text: "Have you had surgery for any heart or circulatory disease?",
      },
      {
        id: "cancer",
        text: "Have you been diagnosed with or treated for cancer? (excluding non-melanoma skin cancer)",
      },
      {
        id: "afib",
        text: "Have you been diagnosed with or treated for atrial fibrillation?",
      },
    ],
  },
  {
    title: "Chronic / Lifetime Conditions",
    questions: [
      {
        id: "chronicConditions",
        text: "Have you ever been diagnosed with any of the following?",
        isCheckAll: true,
        options: [
          "COPD, emphysema, or chronic respiratory disease (excluding asthma)",
          "Congestive heart failure or cardiomyopathy",
          "Chronic kidney disease, kidney failure, or dialysis",
          "Organ transplant (excluding corneal)",
          "Alzheimer's, dementia, or organic brain syndrome",
          "Multiple sclerosis, ALS, Parkinson's, or muscular dystrophy",
          "Systemic lupus, rheumatoid arthritis, or myasthenia gravis",
          "HIV/AIDS",
          "Cirrhosis, liver fibrosis, or chronic hepatitis B",
          "Leukemia, lymphoma, myeloma, or metastatic cancer",
        ],
      },
    ],
  },
]

export default function HealthScreeningPage() {
  const router = useRouter()
  // Health answers are held in local component state ONLY — never persisted
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [checkedConditions, setCheckedConditions] = useState<string[]>([])

  const hasAnyYes = Object.values(answers).some((v) => v) || checkedConditions.length > 0

  const allAnswered = HEALTH_GROUPS.every((group) =>
    group.questions.every((q) => {
      if (q.isCheckAll) return true // checkbox group doesn't require "no" answer
      return answers[q.id] !== undefined
    })
  )

  const handleAnswer = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleConditionToggle = (condition: string) => {
    setCheckedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    )
  }

  const handleContinue = () => {
    if (hasAnyYes) {
      router.push("/q/health/disqualified")
    } else {
      router.push("/q/loading")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <QuoteProgress currentStep={7} />

        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            A few quick health questions
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            This helps us make sure you qualify for new coverage
          </p>

          <div className="space-y-6">
            {HEALTH_GROUPS.map((group) => (
              <div key={group.title} className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                  {group.title}
                </h3>

                <div className="space-y-4">
                  {group.questions.map((q) => {
                    if (q.isCheckAll && q.options) {
                      return (
                        <div key={q.id}>
                          <p className="text-sm font-medium mb-3">{q.text}</p>
                          <div className="space-y-2 pl-1">
                            {q.options.map((option) => (
                              <label
                                key={option}
                                className="flex items-start gap-3 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checkedConditions.includes(option)}
                                  onChange={() => handleConditionToggle(option)}
                                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={q.id} className="flex items-start justify-between gap-4">
                        <p className="text-sm flex-1">{q.text}</p>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleAnswer(q.id, false)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              answers[q.id] === false
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-gray-300 hover:border-primary"
                            }`}
                          >
                            No
                          </button>
                          <button
                            onClick={() => handleAnswer(q.id, true)}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              answers[q.id] === true
                                ? "bg-destructive text-white border-destructive"
                                : "border-gray-300 hover:border-destructive"
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {hasAnyYes && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Based on your answers, you may need assistance from a licensed agent.
                You can still continue to see available options.
              </p>
            </div>
          )}

          <Button
            onClick={handleContinue}
            disabled={!allAnswered}
            className="w-full mt-6"
            size="lg"
          >
            {hasAnyYes ? "Continue Anyway" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
