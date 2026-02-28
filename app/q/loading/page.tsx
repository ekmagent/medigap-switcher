"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { Loader2 } from "lucide-react"

const LOADING_MESSAGES = [
  "Searching 30+ carriers in your area...",
  "Comparing rates for your plan type...",
  "Calculating potential savings...",
  "Finding the most stable carriers...",
  "Almost there...",
]

export default function LoadingPage() {
  const router = useRouter()
  const { formData, setQuotes, setIsLoadingQuotes, setQuotesError } = useSwitcherForm()
  const [messageIndex, setMessageIndex] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

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
        router.push("/q/results")
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-2">Finding Your Best Rates</h2>
        <p className="text-muted-foreground animate-pulse">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  )
}
