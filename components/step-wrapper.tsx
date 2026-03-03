"use client"

import { useEffect, useState, useRef } from "react"

const ENCOURAGEMENTS: Record<number, string> = {
  1: "",
  2: "Great choice!",
  3: "Nice — almost halfway there",
  4: "You're cruising through this",
  5: "This is the easy part",
  6: "Almost done with the basics",
  7: "One more quick one",
  8: "Last stretch — you're so close",
  9: "Hang tight...",
  10: "",
}

export function StepWrapper({
  step,
  children,
}: {
  step: number
  children: React.ReactNode
}) {
  // Start visible so server-rendered HTML is never blank on slow connections
  const [showCheck, setShowCheck] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const hasAnimated = useRef(false)
  const encouragement = ENCOURAGEMENTS[step] || ""

  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    if (step > 1) {
      setShowCheck(true)
      const checkTimer = setTimeout(() => {
        setShowCheck(false)
        setAnimateIn(true)
      }, 450)
      return () => clearTimeout(checkTimer)
    } else {
      setAnimateIn(true)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-background">
      {/* Check flash overlay — pointer-events-none so taps pass through */}
      {showCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 pointer-events-none">
          <div className="animate-step-check">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-[#4ade80]">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" className="animate-circle-draw" />
              <polyline
                points="7 12.5 10.5 16 17 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-check-draw"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content — always visible (no opacity-0 default), animation is enhancement only */}
      <div className={animateIn ? "animate-fade-up" : ""}>
        <div className="container mx-auto px-4 py-8">
          {/* Encouragement badge */}
          {encouragement && animateIn && (
            <div className="text-center mb-1 animate-fade-up">
              <span className="inline-block text-xs font-semibold text-[#4ade80] tracking-wide">
                {encouragement}
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
