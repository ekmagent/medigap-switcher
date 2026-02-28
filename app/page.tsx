"use client"

import Link from "next/link"
import { CheckCircle2, Shield, Lock, FileCheck } from "lucide-react"

const carriers = [
  { name: "Aetna", logo: "/images/aetnaahic.jpeg" },
  { name: "AARP/UHC", logo: "/images/aarp-uhc-logo.png" },
  { name: "Mutual of Omaha", logo: "/images/moo-ms.jpg" },
  { name: "Cigna", logo: "/images/cignams.gif" },
  { name: "Humana", logo: "/images/humanamedicare.png" },
  { name: "Bankers Fidelity", logo: "/images/bankers-fidelity.png" },
]

function SecurityBadge({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <div className="w-10 h-10 rounded-full bg-[#0d4d4d]/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-tight text-[#0d4d4d]">
                HealthPlans<span className="font-light">.now</span>
              </span>
            </Link>
            <Link
              href="/q/current-plan"
              className="bg-[rgba(116,255,11,1)] hover:bg-[#3fcf74] text-[#0d4d4d] px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] font-extrabold whitespace-nowrap"
            >
              Check My Savings
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white px-4 pt-3 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0d4d4d] rounded-[2rem] overflow-hidden relative">
            <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Left content */}
                <div className="relative z-10">
                  <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4">
                    Paying too much
                    <br />
                    for your <span className="text-[#4ade80]">Medigap</span> plan?
                  </h1>

                  <p className="text-white/90 text-sm tracking-widest uppercase mb-4">
                    Same coverage. Lower rate. It&apos;s that simple.
                  </p>
                  <p className="text-white/70 text-sm mb-8">
                    Compare rates from 30+ carriers in under 2 minutes. No contact info required to see your savings.
                  </p>

                  <Link
                    href="/q/current-plan"
                    className="inline-block bg-[rgba(116,255,11,1)] hover:bg-[#3fcf74] text-[#0d4d4d] px-12 py-4 rounded-full text-lg transition-all hover:scale-[1.02] active:scale-[0.98] mb-6 font-extrabold"
                  >
                    CHECK MY SAVINGS
                  </Link>

                  <div className="bg-white/10 rounded-xl px-5 py-4 backdrop-blur-sm max-w-md">
                    <p className="text-white/90 text-base font-semibold mb-3">
                      Why are you overpaying for the exact same coverage?
                    </p>
                    <ul className="text-white/80 text-base space-y-2 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-[#4ade80] mt-0.5">&#10003;</span>
                        <span>See your savings instantly — no phone call needed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#4ade80] mt-0.5">&#10003;</span>
                        <span>Same Plan F, G, or N — just a better price</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#4ade80] mt-0.5">&#10003;</span>
                        <span>Compare all carriers in one place</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#4ade80] mt-0.5">&#10003;</span>
                        <span>StableScore™ shows which carriers keep rates low</span>
                      </li>
                    </ul>
                    <p className="text-white/70 italic font-semibold text-base">
                      Fast like a website. Safe like an expert.
                    </p>
                  </div>
                </div>

                {/* Right content - Sample savings card */}
                <div className="hidden lg:flex justify-center items-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/10 to-transparent rounded-full blur-3xl" />
                  <div className="bg-white rounded-2xl shadow-xl p-5 w-[280px] border border-gray-100 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Your Current Plan G</p>
                        <p className="text-xs text-gray-500">vs. best available rate</p>
                      </div>
                      <div className="bg-[#4ade80]/10 px-2 py-1 rounded-full">
                        <span className="text-[#0d4d4d] text-xs font-semibold">A+ Rated</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-400 text-sm line-through">$198/mo</p>
                      <p className="text-3xl font-bold text-gray-900">
                        $142<span className="text-lg font-normal text-gray-500">/mo</span>
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-green-700 font-bold text-center">
                        Save $56/mo ($672/yr)
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                        <span>Exact same coverage</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                        <span>No coverage gap</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                        <span>Any doctor that takes Medicare</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#0d4d4d] to-[#0d6d6d] rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-xs">StableScore™</p>
                          <p className="text-white font-bold text-lg">94/100</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#4ade80] font-semibold text-sm">Excellent</p>
                          <p className="text-white/70 text-xs">Price Stability</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrier logos */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-6">A few of the 30+ carriers we compare</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {carriers.map((carrier) => (
              <div
                key={carrier.name}
                className="h-10 w-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
              >
                <img
                  src={carrier.logo}
                  alt={carrier.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML =
                        `<span class="text-gray-400 text-xs font-medium">${carrier.name}</span>`
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Tell us your plan</h3>
              <p className="text-gray-600 text-sm">
                Answer a few quick questions about your current Medigap coverage and zip code.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">See your savings</h3>
              <p className="text-gray-600 text-sm">
                Instantly compare rates from 30+ carriers. See exactly how much you could save.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Switch & save</h3>
              <p className="text-gray-600 text-sm">
                Enroll online or have a licensed agent call you. Same coverage, lower price.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Your information is protected</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              256-bit encryption protects your data. Your information is never sold to third parties.
            </p>
          </div>

          <div className="flex flex-wrap justify-center">
            <SecurityBadge
              icon={<Shield className="w-6 h-6" />}
              title="256-bit Encryption"
              description="Your data is protected with industry-standard encryption."
            />
            <SecurityBadge
              icon={<Lock className="w-6 h-6" />}
              title="Confidential"
              description="Your information is never shared with third parties."
            />
            <SecurityBadge
              icon={<FileCheck className="w-6 h-6" />}
              title="Accurate Quotes"
              description="Real rates from real carriers — no bait and switch."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a3a3a] py-8 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-white/50 text-xs leading-relaxed">
            We are an independent insurance brokerage. We are not a medical provider, clinic, or patient portal.
            We do not provide medical advice, diagnosis, or treatment. All plans are offered through licensed insurance carriers.
          </p>
        </div>
      </footer>
    </div>
  )
}
