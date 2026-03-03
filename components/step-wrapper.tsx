"use client"

import { useEffect, useState } from "react"

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
  const [show, setShow] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const encouragement = ENCOURAGEMENTS[step] || ""

  useEffect(() => {
    // Brief green check flash, then fade in page content
    if (step > 1) {
      setShowCheck(true)
      const checkTimer = setTimeout(() => {
        setShowCheck(false)
        setShow(true)
      }, 500)
      return () => clearTimeout(checkTimer)
    } else {
      setShow(true)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-background">
      {/* Check flash overlay */}
      {showCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
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

      {/* Page content with fade-in */}
      <div
        className={`transition-all duration-300 ease-out ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Encouragement badge */}
          {encouragement && show && (
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
