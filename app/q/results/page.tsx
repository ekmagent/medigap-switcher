"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { getCarrierDisplayInfo, getCarrierLogoFallback } from "@/lib/carrier-mapping"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Lock,
  Unlock,
  TrendingDown,
  Shield,
  Phone,
  CheckCircle2,
  Star,
} from "lucide-react"
import { generateEventId, getFbp, getFbc } from "@/lib/fb-pixel"
import { track } from "@vercel/analytics"

function useCountUp(target: number, duration = 1200, delay = 400) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || target <= 0) return
    started.current = true

    const timeout = setTimeout(() => {
      const startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)

    return () => clearTimeout(timeout)
  }, [target, duration, delay])

  return value
}

function CarrierLogo({ carrierName, naic }: { carrierName: string; naic?: string | number | null }) {
  const displayInfo = getCarrierDisplayInfo(carrierName, naic)
  const fallback = getCarrierLogoFallback(displayInfo.displayName)

  if (displayInfo.logoUrl) {
    return (
      <img
        src={displayInfo.logoUrl}
        alt={displayInfo.displayName}
        className="h-10 w-auto max-w-[80px] object-contain"
      />
    )
  }

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
      style={{ backgroundColor: fallback.bgColor }}
    >
      {fallback.initial}
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const { formData, quotes, selectedQuote: ctxSelectedQuote, updateFormData } = useSwitcherForm()
  const [isUnlocked, setIsUnlocked] = useState(formData.isUnlocked || false)
  const [showUnlockPanel, setShowUnlockPanel] = useState(false)
  const [unlockStep, setUnlockStep] = useState<"info" | "verify">("info")

  // Unlock form state
  const [firstName, setFirstName] = useState(formData.firstName || "")
  const [lastName, setLastName] = useState(formData.lastName || "")
  const [email, setEmail] = useState(formData.email || "")
  const [phone, setPhone] = useState(formData.phone || "")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [leadId, setLeadId] = useState("")

  const currentPremium = parseFloat(formData.currentPremium) || 0

  // Track results viewed once on mount
  const trackedView = useRef(false)
  useEffect(() => {
    if (trackedView.current || !quotes.length) return
    trackedView.current = true
    const savings = (currentPremium - (quotes[0]?.monthlyPremium || 0)) * 12
    track("results_viewed", {
      has_savings: savings > 0,
      annual_savings: Math.max(0, Math.round(savings)),
      quotes_count: quotes.length,
      plan: formData.currentPlan || "unknown",
    })
  }, [quotes])

  // Use API-selected quote, fallback to cheapest from quotes array
  const bestQuote = ctxSelectedQuote || quotes[0]

  const bestSavings = currentPremium - (bestQuote?.monthlyPremium || 0)
  const bestAnnualSavings = bestSavings * 12
  const hasBigSavings = bestAnnualSavings > 250
  const hasHugeSavings = bestAnnualSavings > 600

  // Animated counters
  const animatedAnnual = useCountUp(bestSavings > 0 ? Math.round(bestAnnualSavings) : 0)
  const animatedMonthly = useCountUp(bestSavings > 0 ? Math.round(bestSavings) : 0)

  // Savings percent vs current premium
  const savingsPercent = currentPremium > 0 ? Math.round((bestSavings / currentPremium) * 100) : 0

  // Carrier display info
  const carrierDisplay = bestQuote ? getCarrierDisplayInfo(bestQuote.carrierName) : null

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handleSendCode = async () => {
    if (!firstName || !lastName || !email || phone.replace(/\D/g, "").length < 10) {
      setError("Please fill in all fields")
      return
    }

    setError("")

    track("verification_code_sent")
    // Show code input immediately (optimistic) so user is ready when SMS arrives
    setUnlockStep("verify")

    try {
      const rawPhone = phone.replace(/\D/g, "")
      const response = await fetch("/api/verify/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to send verification code")
      }
    } catch (err: any) {
      setError(err.message)
      setUnlockStep("info")
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 4 && code.length !== 6) {
      setError("Please enter your verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const rawPhone = phone.replace(/\D/g, "")
      const response = await fetch("/api/verify/check-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone, code }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Invalid verification code")
      }

      await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: rawPhone,
          zipCode: formData.zipCode,
          county: formData.county,
          state: formData.state,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          tobacco: formData.tobacco,
          source: "plan-switcher",
        }),
      })

      // Fire-and-forget GHL sync via Make.com
      const monthlySavings = currentPremium - (bestQuote?.monthlyPremium || 0)
      fetch("/api/ghl/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: rawPhone,
          zipCode: formData.zipCode,
          county: formData.county,
          state: formData.state,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          tobacco: formData.tobacco,
          currentPlan: formData.currentPlan,
          currentPremium: formData.currentPremium,
          household: formData.household,
          bestQuoteCarrier: bestQuote?.carrierName,
          bestQuotePlan: bestQuote?.planName,
          bestQuotePremium: bestQuote?.monthlyPremium,
          bestQuoteStableScore: bestQuote?.stableScore,
          monthlySavings: Math.max(0, Math.round(monthlySavings * 100) / 100),
          annualSavings: Math.max(0, Math.round(monthlySavings * 12 * 100) / 100),
          fbp: getFbp(),
          fbc: getFbc(),
        }),
      }).catch(() => {})

      // Fire-and-forget CAPI Lead event
      fetch("/api/tracking/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: generateEventId(),
          firstName,
          lastName,
          email,
          phone: rawPhone,
          zipCode: formData.zipCode,
          state: formData.state,
          fbp: getFbp(),
          fbc: getFbc(),
        }),
      }).catch(() => {})

      updateFormData("firstName", firstName)
      updateFormData("lastName", lastName)
      updateFormData("email", email)
      updateFormData("phone", rawPhone)
      track("phone_verified", { annual_savings: Math.max(0, Math.round(bestAnnualSavings)) })
      updateFormData("isUnlocked", true)
      setIsUnlocked(true)
      setShowUnlockPanel(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fireAddToCart = (quote: typeof bestQuote) => {
    if (!quote) return
    fetch("/api/tracking/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: generateEventId(),
        firstName,
        lastName,
        email,
        phone: phone.replace(/\D/g, ""),
        zipCode: formData.zipCode,
        state: formData.state,
        fbp: getFbp(),
        fbc: getFbc(),
        carrierName: quote.carrierName,
        planName: quote.planName,
        monthlyPremium: quote.monthlyPremium,
      }),
    }).catch(() => {})
  }

  const handleCallMe = async (quote: typeof bestQuote) => {
    fireAddToCart(quote)
    try {
      await fetch("/api/call-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone.replace(/\D/g, ""),
          selectedCarrier: quote?.carrierName,
          selectedPlan: quote?.planName,
          selectedPremium: quote?.monthlyPremium,
          currentPremium: formData.currentPremium,
          currentPlan: formData.currentPlan,
          zipCode: formData.zipCode,
          state: formData.state,
        }),
      })
      router.push("/call-requested")
    } catch {
      router.push("/call-requested")
    }
  }

  if (!quotes.length || !bestQuote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">No quotes found</h2>
          <p className="text-muted-foreground mb-6">We couldn&apos;t find any rates for your area. Try adjusting your information.</p>
          <Button onClick={() => router.push("/q/current-plan")}>Start Over</Button>
        </div>
      </div>
    )
  }

  const planLabel = formData.currentPlan && formData.currentPlan !== "other"
    ? `Plan ${formData.currentPlan}`
    : "Medicare Supplement"

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto">

          {/* Savings headline — animated */}
          {currentPremium > 0 && bestSavings > 0 && (
            <div className="text-center mb-6">
              {/* Checkmark + tagline */}
              <div className="animate-fade-up inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                We found savings on your {planLabel}
              </div>

              {/* Big animated savings number */}
              <div className="animate-count-pop">
                <h1 className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
                  ${animatedAnnual.toLocaleString()}
                </h1>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  saved per year
                </p>
              </div>

              {/* Overpaying messaging — only for significant savings */}
              {hasBigSavings && (
                <div className="animate-fade-up-delay-2 mt-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm">
                    {hasHugeSavings ? (
                      <p className="text-amber-800">
                        <span className="font-bold">You&apos;re paying {savingsPercent}% more than you need to.</span>{" "}
                        Savings this large are uncommon — most people we help save under $300/year.
                      </p>
                    ) : (
                      <p className="text-amber-800">
                        <span className="font-bold">Your current rate is well above average.</span>{" "}
                        Switching now locks in these savings before your next rate increase.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!hasBigSavings && (
                <p className="animate-fade-up-delay-1 text-muted-foreground mt-2 text-sm">
                  on the same {planLabel} coverage you have today
                </p>
              )}
            </div>
          )}

          {currentPremium > 0 && bestSavings <= 0 && (
            <div className="text-center mb-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                You&apos;re already at a competitive rate
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Your Best Rate
              </h1>
              <p className="text-muted-foreground mt-1">
                for {planLabel} in {formData.state}
              </p>
              <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
                Good news — you&apos;re not overpaying. Here&apos;s the best available rate from our carriers. A licensed agent can confirm you&apos;re locked in at the right price.
              </p>
            </div>
          )}

          {currentPremium === 0 && (
            <div className="text-center mb-6 animate-fade-up">
              <h1 className="text-3xl font-bold text-foreground">
                Your Best Rate
              </h1>
              <p className="text-muted-foreground mt-1">
                {quotes.length} carriers compared in {formData.state} {formData.zipCode}
              </p>
            </div>
          )}

          {/* Featured Quote Card */}
          <div className="relative animate-fade-up-delay-1">
            {/* Best Value badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Best Value
              </span>
            </div>

            <div className={`bg-white rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden pt-5 ${hasBigSavings ? "animate-savings-glow" : ""}`}>
              {/* Carrier info */}
              <div className="px-6 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Carrier logo or placeholder */}
                    {isUnlocked ? (
                      <CarrierLogo carrierName={bestQuote.carrierName} naic={bestQuote.companyNaic} />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      {isUnlocked ? (
                        <h3 className="font-bold text-xl text-foreground">{carrierDisplay?.displayName || bestQuote.carrierName}</h3>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-xl select-none text-foreground" style={{ filter: "blur(7px)" }}>
                            Top Rated Carrier
                          </div>
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-sm text-muted-foreground">{bestQuote.planName}</span>
                        {bestQuote.amBestRating && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            AM Best: {bestQuote.amBestRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quality score badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-2 animate-scale-in ${
                    bestQuote.stableScore >= 75
                      ? "bg-gradient-to-br from-green-400 to-emerald-600 ring-green-300"
                      : bestQuote.stableScore >= 50
                        ? "bg-gradient-to-br from-blue-400 to-blue-600 ring-blue-300"
                        : "bg-gradient-to-br from-yellow-400 to-yellow-600 ring-yellow-300"
                  }`}>
                    <span className="text-lg font-black text-white">{Math.round(bestQuote.stableScore)}</span>
                  </div>
                </div>
              </div>

              {/* Price section */}
              <div className="px-6 py-5 bg-gray-50/50">
                <div className="text-center">
                  {currentPremium > 0 && bestSavings > 0 && (
                    <p className="text-2xl font-bold text-muted-foreground/60 line-through mb-1 animate-fade-up">
                      ${currentPremium.toFixed(2)}/mo
                    </p>
                  )}
                  <p className="text-5xl sm:text-6xl font-black text-foreground tracking-tight animate-count-pop">
                    ${bestQuote.monthlyPremium.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground font-medium mt-1">/month</p>

                  {currentPremium > 0 && bestSavings > 0 && (
                    <div className="animate-fade-up-delay-2 mt-3 inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                      <TrendingDown className="w-4 h-4" />
                      Save ${animatedMonthly}/mo (${animatedAnnual.toLocaleString()}/yr)
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Section */}
              <div className="px-6 py-5 animate-fade-up-delay-3">
                {isUnlocked ? (
                  <div className="space-y-3">
                    <a
                      href="tel:+18565224759"
                      onClick={() => { track("call_cta_clicked", { annual_savings: Math.max(0, Math.round(bestAnnualSavings)) }); fireAddToCart(bestQuote) }}
                      className="flex flex-col items-center justify-center gap-1 w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold shadow-lg hover:shadow-xl transition-[color,background-color,border-color,box-shadow,transform] hover:scale-[1.02] active:scale-[0.98] py-4 rounded-xl"
                    >
                      <span className="flex items-center gap-2 text-xl">
                        <Phone className="w-6 h-6" />
                        {currentPremium > 0 && bestSavings > 0
                          ? `Call to Lock In $${Math.round(bestAnnualSavings).toLocaleString()}/Year`
                          : "Call to Get Started"
                        }
                      </span>
                      <span className="hidden sm:block text-sm font-medium text-white/80">(856) 522-4759</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => { track("unlock_panel_opened"); setShowUnlockPanel(true) }}
                      className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-[color,background-color,border-color,box-shadow,transform] hover:scale-[1.02] active:scale-[0.98] h-14 rounded-xl"
                      size="lg"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Unlock This Rate
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Verify your phone number to see the carrier name and rate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground animate-fade-up-delay-3">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Licensed agents
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              No obligation
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {quotes.length} carriers compared
            </span>
          </div>

          {/* Unlock Panel (modal) */}
          {showUnlockPanel && !isUnlocked && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0d4d4d] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-7 h-7 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                      <Unlock className="w-3.5 h-3.5 text-[#4ade80]" />
                    </div>
                    <h3 className="font-bold text-lg text-white">See Your Rate</h3>
                  </div>
                  <p className="text-sm text-white/60">
                    Quick verification — we&apos;ll text you a code.
                  </p>
                </div>

                <div className="px-6 py-5">
                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm p-3 rounded-xl mb-4">
                      {error}
                    </div>
                  )}

                  {unlockStep === "info" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName" className="text-white/80 text-sm font-semibold mb-2 block">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Jane"
                            autoFocus
                            className="bg-white border-transparent text-gray-900 placeholder:text-gray-400 text-base h-12 focus:border-[#4ade80] focus:ring-[#4ade80]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-white/80 text-sm font-semibold mb-2 block">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Smith"
                            className="bg-white border-transparent text-gray-900 placeholder:text-gray-400 text-base h-12 focus:border-[#4ade80] focus:ring-[#4ade80]"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white/80 text-sm font-semibold mb-2 block">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="bg-white border-transparent text-gray-900 placeholder:text-gray-400 text-base h-12 focus:border-[#4ade80] focus:ring-[#4ade80]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white/80 text-sm font-semibold mb-2 block">Mobile Number <span className="font-normal text-white/50">(for verification code)</span></Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          placeholder="(555) 555-5555"
                          className="bg-white border-transparent text-gray-900 placeholder:text-gray-400 text-base h-12 focus:border-[#4ade80] focus:ring-[#4ade80]"
                        />
                      </div>
                      <Button
                        onClick={handleSendCode}
                        disabled={loading}
                        className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#0d4d4d] font-bold h-13 text-base rounded-xl"
                        size="lg"
                      >
                        {loading ? "Sending Code..." : "Send Verification Code →"}
                      </Button>
                      <p className="text-[11px] leading-snug text-white/40">
                        By continuing, you consent to receive calls, texts (including autodialed), and emails from HealthPlans.now and licensed agents. Consent is not required to purchase. Msg &amp; data rates may apply.{" "}
                        <a href="/privacy" className="underline hover:text-white/60">Privacy Policy</a>.
                      </p>
                      <button
                        onClick={() => setShowUnlockPanel(false)}
                        className="w-full text-sm text-white/40 hover:text-white/70 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-white/70">
                        We texted a 6-digit code to <span className="text-white font-semibold">{formatPhone(phone)}</span>
                      </p>
                      <div>
                        <Label htmlFor="code" className="text-white/80 text-sm font-semibold mb-2 block">Enter Verification Code</Label>
                        <Input
                          id="code"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="text-center text-3xl tracking-[0.5em] font-bold bg-white border-transparent text-gray-900 placeholder:text-gray-300 h-16 focus:border-[#4ade80] focus:ring-[#4ade80]"
                          autoFocus
                        />
                      </div>
                      <Button
                        onClick={handleVerifyCode}
                        disabled={loading || (code.length !== 4 && code.length !== 6)}
                        className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#0d4d4d] font-bold h-13 text-base rounded-xl"
                        size="lg"
                      >
                        {loading ? "Verifying..." : "Verify & See My Rate →"}
                      </Button>
                      <button
                        onClick={() => {
                          setUnlockStep("info")
                          setCode("")
                          setError("")
                        }}
                        className="w-full text-sm text-white/40 hover:text-white/70 transition-colors"
                      >
                        Use a different number
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
