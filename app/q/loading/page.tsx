"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { Shield, Search, TrendingDown, CheckCircle2 } from "lucide-react"

const STAGES = [
  { icon: Search, label: "Scanning carriers in your area", duration: 1800 },
  { icon: Shield, label: "Checking carrier stability ratings", duration: 1800 },
  { icon: TrendingDown, label: "Calculating your savings", duration: 1800 },
  { icon: CheckCircle2, label: "Found your best rates!", duration: 800 },
]

export default function LoadingPage() {
  const router = useRouter()
  const { formData, setQuotes, setIsLoadingQuotes, setQuotesError } = useSwitcherForm()
  const [stageIndex, setStageIndex] = useState(0)
  const [carrierCount, setCarrierCount] = useState(0)
  const [error, setError] = useState("")
  const quotesReady = useRef(false)

  // Animated carrier counter (counts up to ~32)
  useEffect(() => {
    let count = 0
    const interval = setInterval(() => {
      count += 1
      if (count <= 32) {
        setCarrierCount(count)
      } else {
        clearInterval(interval)
      }
    }, 140)
    return () => clearInterval(interval)
  }, [])

  // Stage progression
  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) return
    const timer = setTimeout(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1))
    }, STAGES[stageIndex].duration)
    return () => clearTimeout(timer)
  }, [stageIndex])

  // Fetch quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoadingQuotes(true)
      setQuotesError(null)

      try {
        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zipCode: formData.zipCode,
            age: formData.quotingAge,
            gender: formData.gender,
            tobacco: formData.tobacco === "yes",
            effectiveDate: formData.effectiveDate,
            planType: formData.currentPlan !== "other" ? formData.currentPlan : undefined,
            hasHouseholdMember: formData.household || undefined,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch quotes")
        }

        const data = await response.json()

        if (!data.success || !data.data?.quotes?.length) {
          throw new Error("No quotes available for your area")
        }

        setQuotes(data.data.quotes)
        quotesReady.current = true
      } catch (err: any) {
        console.error("Quote fetch error:", err)
        setError(err.message || "Failed to fetch quotes")
        setQuotesError(err.message)
        setIsLoadingQuotes(false)
      }
    }

    if (formData.zipCode && formData.quotingAge && formData.gender) {
      fetchQuotes()
    } else {
      router.push("/q/current-plan")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate when both stages complete AND quotes are ready
  useEffect(() => {
    if (stageIndex === STAGES.length - 1) {
      const checkAndNavigate = () => {
        if (quotesReady.current) {
          router.push("/q/results")
        } else {
          setTimeout(checkAndNavigate, 200)
        }
      }
      setTimeout(checkAndNavigate, 600)
    }
  }, [stageIndex, router])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/q/zipcode")}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const progress = Math.round(((stageIndex + 1) / STAGES.length) * 100)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center px-6">
        {/* Carrier count */}
        <div className="animate-fade-up mb-6">
          <span className="text-5xl font-black text-foreground tabular-nums">
            {carrierCount}
          </span>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            carriers checked
          </p>
        </div>

        {/* Stage progress */}
        <div className="space-y-3 mb-8">
          {STAGES.map((stage, i) => {
            const StageIcon = stage.icon
            const isActive = i === stageIndex
            const isDone = i < stageIndex

            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-[#4ade80]/10 border border-[#4ade80]/30"
                    : isDone
                      ? "bg-gray-50"
                      : "opacity-40"
                }`}
              >
                <div className={`flex-shrink-0 transition-colors duration-300 ${
                  isDone ? "text-[#4ade80]" : isActive ? "text-[#4ade80] animate-pulse" : "text-gray-300"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StageIcon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}>
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Mini progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
          <div
            className="h-full rounded-full progress-shimmer transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
