"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Lock,
  Unlock,
  TrendingDown,
  Shield,
  Phone,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronDown,
} from "lucide-react"

export default function ResultsPage() {
  const router = useRouter()
  const { formData, quotes, updateFormData } = useSwitcherForm()
  const [isUnlocked, setIsUnlocked] = useState(formData.isUnlocked || false)
  const [showUnlockPanel, setShowUnlockPanel] = useState(false)
  const [showMoreQuotes, setShowMoreQuotes] = useState(false)
  const [unlockStep, setUnlockStep] = useState<"info" | "verify">("info")

  // Unlock form state
  const [firstName, setFirstName] = useState(formData.firstName || "")
  const [lastName, setLastName] = useState(formData.lastName || "")
  const [email, setEmail] = useState(formData.email || "")
  const [phone, setPhone] = useState(formData.phone || "")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentPremium = parseFloat(formData.currentPremium) || 0

  // Find the best quote: cheapest that also has a good StableScore
  const sortedQuotes = [...quotes].sort((a, b) => {
    // Primary: cheapest price
    // Tiebreaker: highest StableScore
    const priceDiff = a.monthlyPremium - b.monthlyPremium
    if (Math.abs(priceDiff) < 1) return b.stableScore - a.stableScore
    return priceDiff
  })

  const bestQuote = sortedQuotes[0]
  const otherQuotes = sortedQuotes.slice(1, 4) // Show up to 3 more

  const bestSavings = currentPremium - (bestQuote?.monthlyPremium || 0)
  const bestAnnualSavings = bestSavings * 12

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

    setLoading(true)
    setError("")

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

      setUnlockStep("verify")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("Please enter the 6-digit code")
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

      // Create lead
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

      // Update form context
      updateFormData("firstName", firstName)
      updateFormData("lastName", lastName)
      updateFormData("email", email)
      updateFormData("phone", rawPhone)
      updateFormData("isUnlocked", true)
      setIsUnlocked(true)
      setShowUnlockPanel(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollOnline = (quote: typeof bestQuote) => {
    if (quote) {
      localStorage.setItem(
        "medigap-switcher-selected-quote",
        JSON.stringify({
          carrierName: quote.carrierName,
          planName: quote.planName,
          monthlyPremium: quote.monthlyPremium,
          quoteKey: quote.quoteKey,
          loggingKey: quote.loggingKey,
          companyNaic: quote.companyNaic,
        })
      )
      router.push("/enroll/replacement")
    }
  }

  const handleCallMe = async (quote: typeof bestQuote) => {
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
          <p className="text-muted-foreground mb-6">We couldn't find any rates for your area. Try adjusting your information.</p>
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

          {/* Savings headline */}
          {currentPremium > 0 && bestSavings > 0 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <TrendingDown className="w-4 h-4" />
                We found savings on your {planLabel}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground">
                Save ${Math.round(bestAnnualSavings)}/year
              </h1>
              <p className="text-muted-foreground mt-1">
                on the same coverage you have today
              </p>
            </div>
          )}

          {currentPremium > 0 && bestSavings <= 0 && (
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                Your Best Rate
              </h1>
              <p className="text-muted-foreground mt-1">
                for {planLabel} in {formData.state}
              </p>
            </div>
          )}

          {currentPremium === 0 && (
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                Your Best Rate
              </h1>
              <p className="text-muted-foreground mt-1">
                {quotes.length} carriers compared in {formData.state} {formData.zipCode}
              </p>
            </div>
          )}

          {/* Featured Quote Card */}
          <div className="relative">
            {/* Best Value badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Best Value
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden pt-5">
              {/* Carrier info */}
              <div className="px-6 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    {isUnlocked ? (
                      <h3 className="font-bold text-xl text-foreground">{bestQuote.carrierName}</h3>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-xl select-none text-foreground" style={{ filter: "blur(7px)" }}>
                          Top Rated Carrier
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">{bestQuote.planName}</span>
                      {bestQuote.amBestRating && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3" />
                          AM Best: {bestQuote.amBestRating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* StableScore badge */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-2 ${
                    bestQuote.stableScore >= 75
                      ? "bg-gradient-to-br from-green-400 to-emerald-600 ring-green-300"
                      : bestQuote.stableScore >= 50
                        ? "bg-gradient-to-br from-blue-400 to-blue-600 ring-blue-300"
                        : "bg-gradient-to-br from-yellow-400 to-yellow-600 ring-yellow-300"
                  }`}>
                    <div className="text-center">
                      <span className="text-xl font-black text-white">{Math.round(bestQuote.stableScore)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price section */}
              <div className="px-6 py-5 bg-gray-50/50">
                <div className="text-center">
                  {currentPremium > 0 && bestSavings > 0 && (
                    <p className="text-2xl font-bold text-muted-foreground line-through mb-1">
                      ${currentPremium.toFixed(2)}/mo
                    </p>
                  )}
                  <p className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
                    ${bestQuote.monthlyPremium.toFixed(2)}
                  </p>
                  <p className="text-muted-foreground font-medium mt-1">/month</p>

                  {currentPremium > 0 && bestSavings > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                      <TrendingDown className="w-4 h-4" />
                      Save ${Math.round(bestSavings)}/mo (${Math.round(bestAnnualSavings)}/yr)
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Section */}
              <div className="px-6 py-5">
                {isUnlocked ? (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleEnrollOnline(bestQuote)}
                      className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] h-14 rounded-xl"
                      size="lg"
                    >
                      {currentPremium > 0 && bestSavings > 0
                        ? `Enroll Now to Save $${Math.round(bestAnnualSavings)}/Year`
                        : "Enroll Now"
                      }
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCallMe(bestQuote)}
                      className="w-full bg-transparent font-medium h-12 rounded-xl"
                      size="lg"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Have an Agent Call Me Instead
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowUnlockPanel(true)}
                      className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] h-14 rounded-xl"
                      size="lg"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Unlock This Rate
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Verify your phone number to see the carrier name and enroll
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
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

          {/* Other quotes — collapsed by default */}
          {otherQuotes.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowMoreQuotes(!showMoreQuotes)}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-3"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showMoreQuotes ? "rotate-180" : ""}`} />
                {showMoreQuotes ? "Hide" : "See"} {otherQuotes.length} more {otherQuotes.length === 1 ? "option" : "options"}
              </button>

              {showMoreQuotes && (
                <div className="space-y-3 mt-2">
                  {otherQuotes.map((quote, index) => {
                    const savings = currentPremium - quote.monthlyPremium
                    const isCheaper = savings > 0

                    return (
                      <div
                        key={`${quote.carrierName}-${quote.planName}-${index}`}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {isUnlocked ? (
                              <h4 className="font-semibold text-sm">{quote.carrierName}</h4>
                            ) : (
                              <div className="font-semibold text-sm select-none" style={{ filter: "blur(5px)" }}>
                                Carrier Name
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">{quote.planName}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-bold">${quote.monthlyPremium.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                            {currentPremium > 0 && isCheaper && (
                              <p className="text-xs text-green-600 font-medium">Save ${Math.round(savings)}/mo</p>
                            )}
                          </div>

                          <div className={`ml-3 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            quote.stableScore >= 75
                              ? "bg-green-500"
                              : quote.stableScore >= 50
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}>
                            {Math.round(quote.stableScore)}
                          </div>
                        </div>

                        {isUnlocked && (
                          <div className="flex gap-2 mt-3 pt-3 border-t">
                            <Button
                              onClick={() => handleEnrollOnline(quote)}
                              className="flex-1 bg-[#4ade80] hover:bg-[#22c55e] text-white font-semibold"
                              size="sm"
                            >
                              Enroll
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCallMe(quote)}
                              className="flex-1 bg-transparent"
                              size="sm"
                            >
                              <Phone className="w-3.5 h-3.5 mr-1" />
                              Call Me
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Unlock Panel (inline) */}
          {showUnlockPanel && !isUnlocked && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Unlock Your Rate</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Verify your identity to see carrier names and enroll.
                </p>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {unlockStep === "info" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          autoFocus
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Smith"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="(555) 555-5555"
                      />
                    </div>
                    <Button
                      onClick={handleSendCode}
                      disabled={loading}
                      className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold"
                      size="lg"
                    >
                      {loading ? "Sending Code..." : "Send Verification Code"}
                    </Button>
                    <button
                      onClick={() => setShowUnlockPanel(false)}
                      className="w-full text-sm text-muted-foreground hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We sent a 6-digit code to {formatPhone(phone)}
                    </p>
                    <div>
                      <Label htmlFor="code">Verification Code</Label>
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest"
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={handleVerifyCode}
                      disabled={loading || code.length !== 6}
                      className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold"
                      size="lg"
                    >
                      {loading ? "Verifying..." : "Verify & Unlock"}
                    </Button>
                    <button
                      onClick={() => {
                        setUnlockStep("info")
                        setCode("")
                        setError("")
                      }}
                      className="w-full text-sm text-muted-foreground hover:underline"
                    >
                      Use a different phone number
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
