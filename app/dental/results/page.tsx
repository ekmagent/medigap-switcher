"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDentalForm } from "@/contexts/dental-form-context"
import { trackDental } from "@/lib/dental-pixel"
import type { DentalPlan } from "@/lib/dental-quotes"
import { StepWrapper } from "@/components/step-wrapper"
import { Check } from "lucide-react"

function price(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-base leading-snug text-gray-800">
      <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#0d7a4d]" strokeWidth={3} />
      <span>{children}</span>
    </li>
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

  // CompleteRegistration fires once they reach the options page (after the
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

  const byId = (id: string) => quotes.find((q) => q.id === id) as DentalPlan | undefined
  const gold = byId("gold")
  const platinum = byId("platinum")
  const bronze = byId("bronze")

  const area = formData.county ? `${formData.county}, ${formData.state}` : "your area"

  // Point them to the middle (Gold) plan, justified by what they told us earlier.
  let recReason = "Gold is our most-picked plan — full coverage at the smart price."
  if (formData.preference === "comprehensive" || formData.coverageFocus === "major") {
    recReason = "You wanted protection for bigger work — Gold covers it without Platinum's higher price."
  } else if (formData.preference === "basic" || formData.coverageFocus === "preventative") {
    recReason = "You wanted preventive covered — Gold does that, plus 80% on fillings."
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

  return (
    <StepWrapper step={12}>
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-center text-2xl font-bold">
          Your plans{formData.firstName ? `, ${formData.firstName}` : ""}
        </h1>
        <p className="mb-5 px-2 text-center text-sm text-muted-foreground">
          We compared the dental plans available in <span className="font-semibold text-foreground">{area}</span> —{" "}
          <span className="font-semibold text-[#0d4d4d]">Mutual of Omaha</span> is the best fit.
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
            {/* Platinum — the price anchor. First number their eyes hit: the ceiling. */}
            {platinum && (
              <button
                onClick={() => handlePick("platinum")}
                className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-[#0d4d4d] px-5 py-4 text-left shadow-lg transition-transform active:scale-[0.99]"
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[#fbbf24]">Platinum Protection</p>
                  <p className="mt-0.5 text-sm text-white/70">
                    Max ${platinum.annualMax.toLocaleString()}/yr · + vision &amp; hearing
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-black leading-none text-white">
                    {price(platinum.monthlyPremium)}
                    <span className="text-sm font-bold text-white/70">/mo</span>
                  </p>
                  <p className="text-xs font-semibold text-[#fbbf24]">Choose →</p>
                </div>
              </button>
            )}

            {/* Gold — the hero / target offer. After $88, this $72 reads as the deal. */}
            <div className="relative mb-4 rounded-2xl border-2 border-[#4ade80] bg-white px-5 pb-5 pt-7 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="whitespace-nowrap rounded-full bg-[#4ade80] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#0d4d4d] shadow">
                  ★ Most Popular
                </span>
              </div>

              <p className="text-center text-base font-bold uppercase tracking-wide text-[#0d4d4d]">Gold Protection</p>
              <p className="mt-1 text-center font-black leading-none text-[#0d4d4d]">
                <span className="text-5xl">{price(gold.monthlyPremium)}</span>
                <span className="text-xl font-bold">/mo</span>
              </p>
              <p className="mb-5 mt-2 text-center text-base font-semibold text-[#0d7a4d]">
                ${gold.annualMax.toLocaleString()} in benefits every year
              </p>

              <ul className="mb-6 space-y-3">
                <Feature>
                  <b>{gold.coverage.preventive}%</b> on cleanings, exams &amp; X-rays
                </Feature>
                <Feature>
                  <b>$0 deductible</b> on preventive care
                </Feature>
                <Feature>
                  <b>{gold.coverage.basic}%</b> on fillings &amp; basic care
                </Feature>
                <Feature>
                  <b>{gold.coverage.major}%</b> on crowns, dentures &amp; implants
                </Feature>
                <Feature>
                  Low <b>${gold.deductible} annual deductible</b>
                </Feature>
                {gold.savingsAudit && (
                  <Feature>
                    Free <b>Medicare Savings Audit</b> included
                  </Feature>
                )}
              </ul>

              <button
                onClick={() => handlePick("gold")}
                className="w-full rounded-xl bg-[#4ade80] py-4 text-xl font-extrabold text-[#0d4d4d] transition-transform hover:bg-[#22c55e] active:scale-95"
              >
                Choose Gold Protection →
              </button>
              <p className="mt-3 px-1 text-center text-sm text-[#0d4d4d]">
                <span className="font-bold">Our pick.</span> {recReason}
              </p>
            </div>

            {/* Bronze — the muted downsell / safety net at the bottom. */}
            {bronze && (
              <button
                onClick={() => handlePick("bronze")}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
              >
                <div>
                  <p className="text-base font-semibold text-gray-600">
                    Basic Protection — <span className="uppercase">Bronze</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    ${bronze.annualMax.toLocaleString()}/yr · ${bronze.deductible} deductible · {bronze.coverage.major}% major
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold leading-none text-gray-600">
                    {price(bronze.monthlyPremium)}
                    <span className="text-xs font-bold">/mo</span>
                  </p>
                  <p className="text-xs font-medium text-gray-400">Choose →</p>
                </div>
              </button>
            )}

            <p className="mt-5 px-2 text-center text-sm text-muted-foreground">
              Tap a plan to lock in your rate. We'll call to confirm — nothing is charged today.
            </p>
          </>
        )}
      </div>
    </StepWrapper>
  )
}
