"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import { track } from "@vercel/analytics"

export default function UnderwritingReviewPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    track("underwriting_ineligible")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/ineligible-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, zipCode, reason }),
      })

      if (!res.ok) throw new Error("Submission failed")
      track("ineligible_form_submitted")
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-3">We'll Be in Touch</h1>
          <p className="text-muted-foreground">
            Thanks for reaching out. A licensed agent will contact you shortly to discuss your options.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-md mx-auto">

          {/* Main message */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <h1 className="text-xl font-bold text-amber-900 mb-3">
              Switching carriers may not be an option right now
            </h1>
            <p className="text-amber-800 text-[15px] leading-relaxed mb-3">
              Based on your underwriting review, most Medicare Supplement carriers will likely decline a new application. <span className="font-semibold">We recommend staying with your current plan</span> — your existing coverage cannot be taken away due to health conditions.
            </p>
            <p className="text-amber-700 text-[14px] leading-relaxed">
              If your current premium has become unaffordable, or if you're interested in adding dental coverage, we may still be able to help. Fill out the form below and a licensed agent will reach out to explore what options are available to you.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold mb-1">Let us look into your options</h2>
            <p className="text-muted-foreground text-sm mb-5">No obligation. We'll reach out within one business day.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4d4d]/30"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4d4d]/30"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4d4d]/30"
                  placeholder="(555) 555-5555"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4d4d]/30"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP code</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4d4d]/30"
                  placeholder="12345"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What's most important to you? <span className="text-gray-400 font-normal">(optional)</span></label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d4d4d]/30 bg-white"
                >
                  <option value="">Select one...</option>
                  <option value="unaffordable">My current premium is becoming unaffordable</option>
                  <option value="dental">I'm interested in dental coverage</option>
                  <option value="both">Both — cost and dental</option>
                  <option value="other">Just want to know my options</option>
                </select>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0d4d4d] hover:bg-[#0a3a3a] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? "Sending..." : "Request a Call Back"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By submitting, you agree to be contacted by a licensed insurance agent. No spam, no obligation.
          </p>

        </div>
      </div>
    </div>
  )
}
