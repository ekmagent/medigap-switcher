"use client"

import { useEffect } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { track } from "@vercel/analytics"
import { useDentalForm } from "@/contexts/dental-form-context"
import { getFbc, getFbp } from "@/lib/fb-pixel"
import { DENTAL_PIXEL_ID } from "@/lib/dental-pixel"
import { CheckCircle2, Shield, Lock, Clock, ArrowRight, Star } from "lucide-react"

const COVERAGE = [
  { label: "Routine visits", detail: "Checkups & cleanings", pct: "100%", note: "$0 out of pocket" },
  { label: "Everyday work", detail: "Fillings & basic services", pct: "80%", note: "Lower bills" },
  { label: "Bigger procedures", detail: "Major dental work", pct: "up to 50%", note: "Builds in year one" },
]

const CARRIERS = [
  { name: "Mutual of Omaha", logo: "/images/moo-ms.jpg" },
  { name: "Cigna", logo: "/images/cignams.gif" },
  { name: "Aetna", logo: "/images/aetnaahic.jpeg" },
]

export default function DentalLandingPage() {
  const router = useRouter()
  const { updateFormData } = useDentalForm()

  useEffect(() => {
    updateFormData("fbc", getFbc() || "")
    updateFormData("fbp", getFbp() || "")
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const gclid = params.get("gclid")
      if (gclid) updateFormData("gclid", gclid)
      updateFormData("utmSource", params.get("utm_source") || "")
      updateFormData("utmMedium", params.get("utm_medium") || "")
      updateFormData("utmCampaign", params.get("utm_campaign") || "")
      updateFormData("utmContent", params.get("utm_content") || "")
      updateFormData("utmTerm", params.get("utm_term") || "")
      updateFormData("referrerUrl", document.referrer || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = (location: string) => {
    track("dental_cta_clicked", { location })
    router.push("/dental/zipcode")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Meta Pixel — landing page only. PageView only; no dental/insurance params. */}
      <Script id="dental-fb-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${DENTAL_PIXEL_ID}');
        fbq('track', 'PageView');`}
      </Script>
      {/* Hero */}
      <section className="bg-white px-4 pt-3 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0d4d4d] rounded-[2rem] overflow-hidden relative">
            <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Left */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                    <Star className="w-3.5 h-3.5 text-[#4ade80]" />
                    Same price whether you're 18 or 70
                  </div>

                  <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5">
                    Dental Coverage That{" "}
                    <span className="text-[#4ade80]">Doesn't Cost More</span>{" "}
                    As You Age
                  </h1>

                  <p className="text-white/70 text-lg mb-8 max-w-md">
                    Routine visits fully covered, lower bills on everything else, and a price that never goes up
                    with age. See your real rates from a well-known carrier in under a minute.
                  </p>

                  <button
                    onClick={() => start("hero")}
                    className="inline-flex items-center gap-2 bg-[rgba(116,255,11,1)] hover:bg-[#3fcf74] text-[#0d4d4d] px-12 py-4 rounded-full text-lg transition-all hover:scale-[1.02] active:scale-[0.98] mb-6 font-extrabold"
                  >
                    SEE MY OPTIONS <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/60 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#4ade80]" /> Under 60 seconds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4ade80]" /> No obligation
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#4ade80]" /> Same price at any age
                    </span>
                  </div>
                </div>

                {/* Right - sample plan card */}
                <div className="flex justify-center items-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/10 to-transparent rounded-full blur-3xl" />
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 relative z-10">
                    <div className="bg-gradient-to-r from-[#0d4d4d] to-[#0d6060] px-5 py-4">
                      <p className="text-white/70 text-xs uppercase tracking-wide">Sample dental plan</p>
                      <p className="text-white font-bold text-base">Your dentist, covered</p>
                    </div>

                    <div className="px-5 py-4 space-y-3">
                      {COVERAGE.map((c) => (
                        <div key={c.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 text-sm font-semibold">{c.label}</p>
                            <p className="text-gray-400 text-xs">{c.detail}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#0d4d4d] font-black text-base leading-none">{c.pct}</p>
                            <p className="text-[#4ade80] text-[11px] font-semibold">{c.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#4ade80] px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-[#0d4d4d] text-xs font-semibold uppercase tracking-wide">Starting around</p>
                        <p className="text-[#0d4d4d] text-2xl font-black leading-none">
                          $30<span className="text-sm font-bold">/mo</span>
                        </p>
                      </div>
                      <p className="text-[#0d4d4d]/70 text-xs font-semibold text-right max-w-[9rem]">
                        Three plans to choose from
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrier logos */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-7">Coverage offered through carriers you know</p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
            {CARRIERS.map((carrier) => (
              <div
                key={carrier.name}
                className="h-12 w-28 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
              >
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    if (e.currentTarget.parentElement) {
                      const span = document.createElement("span")
                      span.className = "text-gray-400 text-xs font-medium"
                      span.textContent = carrier.name
                      e.currentTarget.parentElement.appendChild(span)
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage breakdown band */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">
            How much your plan covers
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10 max-w-md mx-auto">
            Lower, more predictable out-of-pocket costs on the dental care you actually use.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {COVERAGE.map((c) => (
              <div
                key={c.label}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center"
              >
                <p className="text-[#0d4d4d] text-4xl font-black mb-2">{c.pct}</p>
                <p className="font-semibold text-gray-900 mb-1">{c.label}</p>
                <p className="text-gray-500 text-sm mb-3">{c.detail}</p>
                <span className="inline-block bg-[#4ade80]/15 text-[#0d7a4d] text-xs font-bold px-3 py-1 rounded-full">
                  {c.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why different */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">
            Why people choose this plan
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-[#4ade80]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Age doesn't change your price</h3>
              <p className="text-gray-600 text-sm">The same monthly rate whether you're 18 or 70.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-[#4ade80]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">A well-known carrier</h3>
              <p className="text-gray-600 text-sm">Coverage you can trust, not a no-name discount card.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-[#4ade80]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">One predictable rate</h3>
              <p className="text-gray-600 text-sm">A simple flat monthly cost you can budget around — no surprises.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => start("why_different")}
              className="inline-flex items-center gap-2 bg-[rgba(116,255,11,1)] hover:bg-[#3fcf74] text-[#0d4d4d] px-10 py-4 rounded-full text-base font-extrabold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              See My Options <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-400 text-xs mt-3">Takes under a minute · No obligation</p>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#0d4d4d]" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">256-bit Encryption</p>
                <p className="text-gray-500 text-xs">Your information is protected.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#0d4d4d]" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Never Sold</p>
                <p className="text-gray-500 text-xs">We don't sell your data to third parties.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance footer */}
      <footer className="bg-[#0a3a3a] py-8 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">
            easyKind Health LLC is a licensed insurance brokerage and financial services provider (NAIC 524210 —
            Insurance Agents and Brokers). We are not a dental provider, clinic, or health and wellness company.
            Dental plans are insurance products offered through licensed carriers. Coverage details, percentages,
            and pricing shown are illustrative; your actual plan terms will be confirmed by a licensed agent.
          </p>
        </div>
      </footer>
    </div>
  )
}
