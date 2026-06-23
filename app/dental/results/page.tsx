"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { trackDental } from "@/lib/dental-pixel"
import type { DentalPlan } from "@/lib/dental-quotes"
import { StepWrapper } from "@/components/step-wrapper"

function price(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-1 text-[10px] leading-tight">
      <span className="text-gray-400">{label}</span>
      <span className={good ? "font-bold text-[#0d7a4d]" : "font-bold text-gray-800"}>{value}</span>
    </div>
  )
}

function PlanCard({ plan, onSelect }: { plan: DentalPlan; onSelect: (id: string) => void }) {
  const hl = plan.recommended
  return (
    <div
      className={`relative rounded-xl border-2 bg-white px-2 text-center ${
        hl ? "border-[#4ade80] shadow-xl pt-5 pb-3 -mt-2 z-10" : "border-gray-200 shadow-sm pt-3 pb-3"
      }`}
    >
      {hl && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="bg-[#4ade80] text-[#0d4d4d] text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full shadow">
            Most Popular
          </span>
        </div>
      )}

      <p className="text-[11px] font-bold uppercase tracking-wide text-[#0d4d4d]">{plan.tier}</p>
      <p className={`font-black text-[#0d4d4d] leading-none ${hl ? "text-2xl" : "text-xl"}`}>
        {price(plan.monthlyPremium)}
        <span className="text-[10px] font-bold">/mo</span>
      </p>
      <p className="text-[9px] font-semibold text-[#4ade80] mb-2">${plan.annualMax.toLocaleString()}/yr max</p>

      <div className="space-y-1 border-t border-gray-100 pt-2 mb-3 text-left">
        <Row label="Cleanings" value={`${plan.coverage.preventive}%`} />
        <Row label="Fillings" value={`${plan.coverage.basic}%`} />
        <Row label="Major work" value={`${plan.coverage.major}%`} />
        <Row label="Deductible" value={`$${plan.deductible}`} />
        <Row label="Vision + hearing" value={plan.visionHearing ? "Yes" : "—"} good={plan.visionHearing} />
        <Row label="Medicare Savings Audit" value={plan.savingsAudit ? "Yes" : "—"} good={plan.savingsAudit} />
      </div>

      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full font-extrabold rounded-lg py-2 text-[11px] whitespace-nowrap transition-[color,background-color,transform] active:scale-95 ${
          hl ? "bg-[#4ade80] hover:bg-[#22c55e] text-[#0d4d4d]" : "bg-[#0d4d4d] hover:bg-[#0a3a3a] text-white"
        }`}
      >
        Choose {plan.tier}
      </button>
    </div>
  )
}

export default function QuotePickingPage() {
  const router = useRouter()
  const { formData, updateFormData, quotes, setQuotes, isLoadingQuotes, setIsLoadingQuotes } = useDentalForm()

  const eventUser = {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
  }

  // CompleteRegistration fires once they reach the three-options page (after the
  // contact data is hydrated so the CAPI event carries customer params).
  const firedReg = useRef(false)
  useEffect(() => {
    if (!firedReg.current && (formData.email || formData.firstName)) {
      firedReg.current = true
      trackDental("CompleteRegistration", { user: eventUser })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, formData.firstName])

  useEffect(() => {
    if (quotes.length === 0 && formData.zipCode && !isLoadingQuotes) {
      setIsLoadingQuotes(true)
      fetch("/api/dental/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip: formData.zipCode, state: formData.state }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.success && Array.isArray(d.quotes)) setQuotes(d.quotes)
        })
        .catch(() => {})
        .finally(() => setIsLoadingQuotes(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Most expensive first for anchoring: Platinum -> Gold -> Bronze.
  const order = ["platinum", "gold", "bronze"]
  const plans = order.map((id) => quotes.find((q) => q.id === id)).filter(Boolean) as DentalPlan[]

  const area = formData.county ? `${formData.county}, ${formData.state}` : "your area"

  // Point them to the middle (Gold) plan, justified by what they told us earlier.
  let recReason = "Gold is our most-picked plan — full coverage at the smart price."
  if (formData.preference === "comprehensive" || formData.coverageFocus === "major") {
    recReason = "You wanted protection for bigger work — Gold covers it without Platinum's higher price."
  } else if (formData.preference === "basic" || formData.coverageFocus === "preventative") {
    recReason = "You wanted preventive covered — Gold does that, plus 80% on fillings."
  }

  const handlePick = (id: string) => {
    const plan = plans.find((p) => p.id === id)
    updateFormData("preference", id)
    // AddToCart = selected one of the three options, then into enrollment.
    // No content_name/category — we don't send dental/insurance descriptors to Meta.
    trackDental("AddToCart", {
      custom: { value: plan?.monthlyPremium, currency: "USD" },
      user: eventUser,
    })
    router.push("/dental/enroll")
  }

  return (
    <StepWrapper step={12}>
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-center mb-1">
          Your plans{formData.firstName ? `, ${formData.firstName}` : ""}
        </h1>
        <p className="text-center text-xs text-muted-foreground mb-3 px-2">
          We compared the dental plans available in <span className="font-semibold text-foreground">{area}</span> —{" "}
          <span className="font-semibold text-[#0d4d4d]">Mutual of Omaha</span> is the best fit.
        </p>

        {isLoadingQuotes && plans.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Pulling your rates…</div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="font-semibold text-gray-900 mb-1">We've got your details</p>
            <p className="text-sm text-muted-foreground">
              These plans aren't offered in your state just yet — but someone from our team will reach out
              shortly to go over the options that are available to you.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-center text-[#0d4d4d] font-medium mb-3 px-2">
              <span className="font-bold">Our pick: Gold.</span> {recReason}
            </p>
            <div className="grid grid-cols-[1fr_1.18fr_1fr] gap-1.5 items-start">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onSelect={handlePick} />
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-3">
              Tap a plan to lock in your rate. We'll call to confirm — nothing is charged today.
            </p>
          </>
        )}
      </div>
    </StepWrapper>
  )
}
