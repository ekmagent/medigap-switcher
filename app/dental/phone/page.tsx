"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { DentalProgress } from "@/components/dental-progress"
import { StepWrapper } from "@/components/step-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export default function PhonePage() {
  const router = useRouter()
  const { formData, updateFormData, quotes } = useDentalForm()
  const [phone, setPhone] = useState(formData.phone || "")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isValid = phone.replace(/\D/g, "").length === 10

  const handleContinue = async () => {
    if (!isValid) {
      setError("Please enter a valid 10-digit phone number")
      return
    }
    setSubmitting(true)
    setError("")
    updateFormData("phone", phone)

    const platinum = quotes.find((q) => q.id === "platinum")
    const gold = quotes.find((q) => q.id === "gold")
    const bronze = quotes.find((q) => q.id === "bronze")

    try {
      const res = await fetch("/api/dental/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone,
          dateOfBirth: formData.dateOfBirth,
          zipCode: formData.zipCode,
          county: formData.county,
          state: formData.state,
          hasDentalNow: formData.hasDentalNow,
          coverageFocus: formData.coverageFocus,
          onMedicare: formData.onMedicare,
          medicareType: formData.medicareType,
          preference: formData.preference,
          quotedPlatinumPremium: platinum?.monthlyPremium ?? null,
          quotedGoldPremium: gold?.monthlyPremium ?? null,
          quotedBronzePremium: bronze?.monthlyPremium ?? null,
          fbp: formData.fbp,
          fbc: formData.fbc,
          gclid: formData.gclid,
          utmSource: formData.utmSource,
          utmMedium: formData.utmMedium,
          utmCampaign: formData.utmCampaign,
          utmContent: formData.utmContent,
          utmTerm: formData.utmTerm,
          referrerUrl: formData.referrerUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        setError(data?.error || "Something went wrong. Please try again.")
        setSubmitting(false)
        return
      }
      updateFormData("submitted", true)
      // Session-scoped marker: proves this person came through the funnel (and gave
      // TCPA consent) this session. results/enroll gate their CAPI events + access on it
      // so a direct page load can't fire conversions off stale localStorage.
      try {
        sessionStorage.setItem("dental_funnel", "1")
      } catch {}
      router.push("/dental/results")
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <StepWrapper step={11}>
      <DentalProgress currentStep={11} />

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Last thing — the best number to reach you</h1>
        <p className="text-center text-muted-foreground mb-8">
          We'll give you a quick call to go over your options.
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhone(e.target.value))
              setError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            placeholder="(555) 123-4567"
            autoFocus
            className="mt-1.5 text-lg"
          />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!isValid || submitting}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-md hover:shadow-lg transition-[color,background-color,border-color,box-shadow,transform] hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          {submitting ? "Getting your options…" : "See my options"}
        </Button>

        <p className="text-center text-[11px] leading-snug text-muted-foreground mt-4">
          By continuing, you consent to receive calls and texts (including by autodialer or a
          prerecorded/artificial voice) and emails from easyKind Health LLC and its agents at the number
          provided regarding dental coverage. Consent is not required to purchase. Message frequency varies;
          msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. See our{" "}
          <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a> and{" "}
          <a href="/terms" className="underline hover:text-foreground">Terms</a>.
        </p>
      </div>
    </StepWrapper>
  )
}
