"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { trackDental } from "@/lib/dental-pixel"
import { StepWrapper } from "@/components/step-wrapper"
import { PlacesAddressInput, type ParsedAddress } from "@/components/places-address-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Phone, CalendarCheck, ShieldCheck } from "lucide-react"

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"]

function fmtShort(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
function fmtIso(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

export default function EnrollPage() {
  const router = useRouter()
  const { formData, updateFormData, quotes } = useDentalForm()

  const plan = quotes.find((q) => q.id === formData.preference)
  const price = plan ? `$${Math.round(plan.monthlyPremium)}` : ""

  const eventUser = {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
  }

  // InitiateCheckout fires once when they start the enrollment (after data hydrates).
  const firedCheckout = useRef(false)
  useEffect(() => {
    if (!firedCheckout.current && (formData.email || formData.firstName)) {
      firedCheckout.current = true
      trackDental("InitiateCheckout", {
        custom: { value: plan?.monthlyPremium, currency: "USD" },
        user: eventUser,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, formData.firstName])

  const today = new Date()
  const plus7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [effectiveOption, setEffectiveOption] = useState(formData.effectiveOption || "today")
  const [canDecide, setCanDecide] = useState(formData.canMakeDecisions || "yes")
  const [gender, setGender] = useState(formData.gender || "")
  const [street, setStreet] = useState(formData.street || "")
  const [unit, setUnit] = useState(formData.unit || "")
  const [city, setCity] = useState(formData.city || formData.county || "")
  const [state, setState] = useState(formData.state || "")
  const [zip, setZip] = useState(formData.zipCode || "")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const isValid = street.trim() && city.trim() && state && /^\d{5}$/.test(zip) && gender && canDecide

  const applyPlaces = (a: ParsedAddress) => {
    if (a.street) setStreet(a.street)
    if (a.city) setCity(a.city)
    if (a.state) setState(a.state)
    if (a.zip) setZip(a.zip)
  }

  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please complete your address, gender, and the decision question.")
      return
    }
    setSubmitting(true)
    setError("")
    const effectiveDate = effectiveOption === "in7days" ? fmtIso(plus7) : fmtIso(today)

    updateFormData("effectiveOption", effectiveOption)
    updateFormData("canMakeDecisions", canDecide)
    updateFormData("gender", gender)
    updateFormData("street", street.trim())
    updateFormData("unit", unit.trim())
    updateFormData("city", city.trim())

    try {
      const res = await fetch("/api/dental/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender,
          street: street.trim(),
          unit: unit.trim(),
          city: city.trim(),
          state,
          zipCode: zip,
          effectiveDate,
          canMakeDecisions: canDecide,
          plan: plan?.tier,
          planId: plan?.id,
          monthlyPremium: plan?.monthlyPremium ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        setError(data?.error || "Something went wrong. Please try again.")
        setSubmitting(false)
        return
      }
      updateFormData("enrollSubmitted", true)
      setDone(true)
      if (typeof window !== "undefined") window.scrollTo({ top: 0 })
    } catch {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <StepWrapper step={13}>
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[#4ade80]/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-[#4ade80]" />
          </div>
          <h1 className="text-2xl font-bold mb-3">
            Almost done{formData.firstName ? `, ${formData.firstName}` : ""}!
          </h1>
          <p className="text-muted-foreground mb-6">
            A specialist will call shortly to confirm your {plan?.tier} plan. Then Mutual of Omaha emails you a
            secure link with an authorization code — you log in with your name and birthday to review and e-sign,
            and enter your payment details directly with the carrier (we never see them). We'll email your
            temporary ID card once you're enrolled, so you can see a dentist as soon as tomorrow.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            Keep your phone handy — we'll be in touch soon.
          </div>
        </div>
      </StepWrapper>
    )
  }

  return (
    <StepWrapper step={13}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-1">Let's get you enrolled</h1>
        {plan && (
          <p className="text-center text-muted-foreground mb-5">
            {plan.tier} plan · <span className="font-semibold text-foreground">{price}/mo</span>
          </p>
        )}

        {/* Effective date */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Label className="flex items-center gap-1.5 mb-1">
            <CalendarCheck className="w-4 h-4 text-[#4ade80]" /> When should coverage start?
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            We'll email a temporary ID card once you're enrolled — you can see a dentist as soon as tomorrow.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "today", label: "Start today", sub: fmtShort(today) },
              { v: "in7days", label: "Start in 7 days", sub: fmtShort(plus7) },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setEffectiveOption(o.v)}
                className={`p-3 rounded-xl border-2 text-center transition-colors ${
                  effectiveOption === o.v ? "border-[#4ade80] bg-[#4ade80]/10" : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                <div className="font-semibold text-sm">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4 space-y-3">
          <Label>Home address</Label>
          <PlacesAddressInput value={street} onChange={setStreet} onAddress={applyPlaces} />
          <Input
            name="address-line2"
            autoComplete="address-line2"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Apt / Unit (optional)"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="address-level2"
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
            <select
              name="address-level1"
              autoComplete="address-level1"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">State</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <Input
            name="postal-code"
            autoComplete="postal-code"
            inputMode="numeric"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="ZIP"
            maxLength={5}
          />
        </div>

        {/* Gender */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Label className="mb-2 block">Gender</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Male", "Female"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  gender === g ? "border-[#4ade80] bg-[#4ade80]/10" : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* POA / decision question */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <Label className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#4ade80]" /> Are you able to make your own health and insurance decisions?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "yes", label: "Yes" },
              { v: "no", label: "No — a POA is involved" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setCanDecide(o.v)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  canDecide === o.v ? "border-[#4ade80] bg-[#4ade80]/10" : "border-gray-200 bg-white hover:border-[#4ade80]/50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-destructive text-sm text-center mb-3">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-md hover:shadow-lg transition-[color,background-color,border-color,box-shadow,transform] hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          {submitting ? "Submitting…" : "Submit my enrollment"}
        </Button>
        <p className="text-center text-[11px] leading-snug text-muted-foreground mt-3">
          No payment is collected here. You enter your own payment details when you e-sign directly with Mutual of
          Omaha — we never see or handle them.
        </p>
      </div>
    </StepWrapper>
  )
}
