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
} from "lucide-react"
import { formatPhoneForDisplay } from "@/lib/phone-utils"

export default function ResultsPage() {
  const router = useRouter()
  const { formData, quotes, updateFormData } = useSwitcherForm()
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

  const currentPremium = parseFloat(formData.currentPremium) || 0

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

  const handleEnrollOnline = (quoteIndex: number) => {
    // Store selected quote info and navigate to enrollment
    const quote = quotes[quoteIndex]
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

  const handleCallMe = async (quoteIndex: number) => {
    const quote = quotes[quoteIndex]
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

  if (!quotes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">No quotes found</h2>
          <Button onClick={() => router.push("/q/current-plan")}>Start Over</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pb-32">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Rate Comparison</h1>
            <p className="text-muted-foreground">
              {quotes.length} carriers found for {formData.state} {formData.zipCode}
            </p>
            {currentPremium > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Your current premium: <strong>${currentPremium.toFixed(2)}/mo</strong>
              </p>
            )}
          </div>

          {/* Quote Cards */}
          <div className="space-y-4">
            {quotes.map((quote, index) => {
              const savings = currentPremium - quote.monthlyPremium
              const annualSavings = savings * 12
              const isCheaper = savings > 0

              return (
                <div
                  key={`${quote.carrierName}-${quote.planName}-${index}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      {/* Carrier name — blurred or revealed */}
                      <div className="flex-1">
                        {isUnlocked ? (
                          <h3 className="font-bold text-lg">{quote.carrierName}</h3>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-lg select-none" style={{ filter: "blur(6px)" }}>
                              Carrier Name Here
                            </div>
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {quote.planName} {quote.amBestRating && `| AM Best: ${quote.amBestRating}`}
                        </p>
                      </div>

                      {/* StableScore badge */}
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          quote.stableScore >= 75
                            ? "bg-green-100 text-green-700"
                            : quote.stableScore >= 50
                              ? "bg-blue-100 text-blue-700"
                              : quote.stableScore >= 25
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                        {Math.round(quote.stableScore)}
                      </div>
                    </div>

                    {/* Price + Savings */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-3xl font-bold">
                          ${quote.monthlyPremium.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>

                      {currentPremium > 0 && (
                        <div>
                          {isCheaper ? (
                            <div className="text-right">
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                <TrendingDown className="w-3.5 h-3.5" />
                                Save ${savings.toFixed(0)}/mo
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                ${annualSavings.toFixed(0)}/year savings
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              ${Math.abs(savings).toFixed(0)}/mo more
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA buttons — only shown after unlock */}
                    {isUnlocked && (
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleEnrollOnline(index)}
                          className="flex-1"
                          size="sm"
                        >
                          Enroll Online Now
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCallMe(index)}
                          className="flex-1 bg-transparent"
                          size="sm"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call Me to Enroll
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Unlock Panel (inline) */}
          {showUnlockPanel && !isUnlocked && (
            <div className="mt-8 bg-white rounded-xl shadow-lg border-2 border-primary p-6">
              <div className="flex items-center gap-2 mb-4">
                <Unlock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Unlock Carrier Names</h3>
              </div>

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
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </Button>
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
                    className="w-full"
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
          )}
        </div>
      </div>

      {/* Sticky unlock CTA */}
      {!isUnlocked && !showUnlockPanel && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => setShowUnlockPanel(true)}
              size="lg"
              className="w-full text-lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              Unlock Carrier Names
            </Button>
          </div>
        </div>
      )}

      {/* Unlocked success indicator */}
      {isUnlocked && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t border-green-200 p-3">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Carrier names unlocked! Choose a plan to get started.</span>
          </div>
        </div>
      )}
    </div>
  )
}
