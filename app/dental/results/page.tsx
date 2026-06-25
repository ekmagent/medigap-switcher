"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { trackDental } from "@/lib/dental-pixel"
import type { DentalPlan } from "@/lib/dental-quotes"
import { StepWrapper } from "@/components/step-wrapper"
import { Check, ChevronDown } from "lucide-react"

function price(n: number) {
  // Whole-dollar display for legibility; exact rate still flows to tracking/GHL.
  return `$${Math.round(n)}`
}

/** Inline detail panel: coverage breakdown + an honest waiting-period note. */
function PlanDetails({ plan, extra }: { plan: DentalPlan; extra?: string }) {
  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <dl className="space-y-1.5 text-sm">
        <Line label="Cleanings, exams & X-rays" value={`${plan.coverage.preventive}%`} />
        <Line label="Fillings & basic care" value={`${plan.coverage.basic}%`} />
        <Line label="Crowns, dentures & implants" value={`${plan.coverage.major}%`} />
        <Line label="Benefit max each year" value={`$${plan.annualMax.toLocaleString()}`} />
        <Line label="Annual deductible" value={`$${plan.deductible}`} />
        {plan.visionHearing && <Line label="Vision" value="Included" />}
        {extra && <Line label={extra} value="Included" />}
      </dl>
      <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-sm leading-snug text-amber-900">
        <span className="font-bold">Good to know:</span> cleanings &amp; exams are covered right away. Fillings,
        crowns and other major work have a waiting period before coverage begins — your specialist confirms the
        exact timing. The same rate applies at any age.
      </div>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-600">{label}</dt>
      <dd className="font-bold text-gray-900">{value}</dd>
    </div>
  )
}

export default function QuotePickingPage() {
  const router = useRouter()
  const { formData, updateFormData, quotes, setQuotes, isLoadingQuotes, setIsLoadingQuotes } = useDentalForm()
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (id: string) => setOpen((cur) => (cur === id ? null : id))

  const eventUser = {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
  }

  // Block direct page loads: only funnel completers (sessionStorage flag set at the
  // phone step) may view results — otherwise stale localStorage could fire CAPI.
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("dental_funnel") !== "1") {
      router.replace("/dental")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // CompleteRegistration fires once they reach the options page (after the
  // contact data is hydrated so the CAPI event carries customer params).
  const firedReg = useRef(false)
  useEffect(() => {
    const fromFunnel = typeof window !== "undefined" && sessionStorage.getItem("dental_funnel") === "1"
    if (!firedReg.current && fromFunnel && (formData.email || formData.firstName)) {
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

  const byId = (id: string) => quotes.find((q) => q.id === id) as DentalPlan | undefined
  const gold = byId("gold")
  const platinum = byId("platinum")
  const bronze = byId("bronze")

  const area = formData.county ? `${formData.county}, ${formData.state}` : "your area"

  let recReason = "Full coverage at the smart price."
  if (formData.preference === "comprehensive" || formData.coverageFocus === "major") {
    recReason = "Covers the bigger work without Platinum's higher price."
  } else if (formData.preference === "basic" || formData.coverageFocus === "preventative") {
    recReason = "Preventive covered, plus 80% on fillings."
  }

  const handlePick = (id: string) => {
    const plan = quotes.find((p) => p.id === id)
    updateFormData("preference", id)
    // AddToCart = selected one of the three options, then into enrollment.
    // No content_name/category — we don't send dental/insurance descriptors to Meta.
    trackDental("AddToCart", {
      custom: { value: plan?.monthlyPremium, currency: "USD" },
      user: eventUser,
    })
    router.push("/dental/enroll")
  }

  // The "read more" toggle — expands details inline; never navigates.
  function MoreToggle({ id }: { id: string }) {
    return (
      <button
        onClick={() => toggle(id)}
        className="flex items-center gap-1 text-sm font-semibold text-[#0d7a4d]"
      >
        {open === id ? "Hide details" : "See what's included"}
        <ChevronDown className={`h-4 w-4 transition-transform ${open === id ? "rotate-180" : ""}`} />
      </button>
    )
  }

  return (
    <StepWrapper step={12}>
      <div className="mx-auto max-w-md">
        <h1 className="mb-0.5 text-center text-2xl font-bold">
          Your plans{formData.firstName ? `, ${formData.firstName}` : ""}
        </h1>
        <p className="mb-3 px-2 text-center text-sm text-muted-foreground">
          Available in <span className="font-semibold text-foreground">{area}</span> through{" "}
          <span className="font-semibold text-[#0d4d4d]">Mutual of Omaha</span>.
        </p>

        {isLoadingQuotes && quotes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Pulling your rates…</div>
        ) : !gold ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="mb-1 font-semibold text-gray-900">We've got your details</p>
            <p className="text-sm text-muted-foreground">
              These plans aren't offered in your state just yet — but someone from our team will reach out
              shortly to go over the options that are available to you.
            </p>
          </div>
        ) : (
          <>
            {/* Platinum — the white anchor card. Bold $88 = the ceiling. */}
            {platinum && (
              <div className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#0d4d4d]">Platinum Protection</p>
                    <p className="text-sm text-gray-500">Most coverage · adds vision</p>
                  </div>
                  <p className="shrink-0 text-3xl font-black leading-none text-[#0d4d4d]">
                    {price(platinum.monthlyPremium)}
                    <span className="text-sm font-bold">/mo</span>
                  </p>
                </div>
                {open === "platinum" && <PlanDetails plan={platinum} />}
                <div className="mt-3 flex items-center justify-between">
                  <MoreToggle id="platinum" />
                  <button
                    onClick={() => handlePick("platinum")}
                    className="rounded-lg border-2 border-[#0d4d4d] px-5 py-2 text-base font-extrabold text-[#0d4d4d] transition-transform active:scale-95"
                  >
                    Choose
                  </button>
                </div>
              </div>
            )}

            {/* Gold — the hero / target offer. After $88, this $72 reads as the deal. */}
            <div className="relative mb-3 rounded-2xl border-2 border-[#4ade80] bg-white px-4 pb-4 pt-5 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="whitespace-nowrap rounded-full bg-[#4ade80] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0d4d4d] shadow">
                  ★ Most Popular
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-[#0d4d4d]">Gold Protection</p>
                  <p className="text-sm font-semibold text-[#0d7a4d]">${gold.annualMax.toLocaleString()}/yr in benefits</p>
                </div>
                <p className="shrink-0 font-black leading-none text-[#0d4d4d]">
                  <span className="text-4xl">{price(gold.monthlyPremium)}</span>
                  <span className="text-base font-bold">/mo</span>
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                <Tick>100% cleanings &amp; exams</Tick>
                <Tick>$0 preventive deductible</Tick>
                <Tick>{gold.coverage.basic}% fillings &amp; basics</Tick>
                <Tick>{gold.coverage.major}% major work</Tick>
              </div>

              <button
                onClick={() => handlePick("gold")}
                className="mt-3 w-full rounded-xl bg-[#4ade80] py-4 text-xl font-extrabold text-[#0d4d4d] transition-transform hover:bg-[#22c55e] active:scale-95"
              >
                Choose Gold Protection →
              </button>
              <p className="mt-2 text-center text-sm text-[#0d4d4d]">
                <span className="font-bold">Our pick.</span> {recReason}
              </p>

              <div className="mt-2 flex justify-center">
                <MoreToggle id="gold" />
              </div>
              {open === "gold" && <PlanDetails plan={gold} extra={gold.savingsAudit ? "Free Medicare Savings Audit" : undefined} />}
            </div>

            {/* Bronze — the muted downsell / safety net. */}
            {bronze && (
              <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Basic Protection</p>
                    <p className="text-sm text-gray-400">Preventive focus · lower benefit max</p>
                  </div>
                  <p className="shrink-0 text-2xl font-black leading-none text-gray-600">
                    {price(bronze.monthlyPremium)}
                    <span className="text-sm font-bold">/mo</span>
                  </p>
                </div>
                {open === "bronze" && <PlanDetails plan={bronze} />}
                <div className="mt-3 flex items-center justify-between">
                  <MoreToggle id="bronze" />
                  <button
                    onClick={() => handlePick("bronze")}
                    className="rounded-lg border border-gray-300 px-5 py-2 text-base font-bold text-gray-600 transition-transform active:scale-95"
                  >
                    Choose
                  </button>
                </div>
              </div>
            )}

            <p className="px-2 text-center text-xs text-muted-foreground">
              Rates are illustrative and confirmed by your licensed agent. Some services have a waiting period.
              Nothing is charged today.
            </p>
          </>
        )}
      </div>
    </StepWrapper>
  )
}

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 text-sm leading-tight text-gray-800">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0d7a4d]" strokeWidth={3} />
      <span>{children}</span>
    </div>
  )
}
