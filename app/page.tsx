"use client"

import Link from "next/link"
import { CheckCircle2, Shield, Lock, FileCheck, Zap, ArrowRight } from "lucide-react"

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
                  <h1 className="text-white text-4xl sm:text-5xl lg:text-[3.2rem] font-bold leading-[1.1] mb-4">
                    See If You Could Save on Your{" "}
                    <span className="text-[#4ade80]">Medicare Supplement</span>{" "}
                    in 2 Minutes
                  </h1>

                  <p className="text-white/70 text-base mb-8 max-w-md">
                    No phone number or email required to see your possible savings. Only continue if the savings are worth it.
                  </p>

                  <Link
                    href="/q/current-plan"
                    className="inline-block bg-[rgba(116,255,11,1)] hover:bg-[#3fcf74] text-[#0d4d4d] px-12 py-4 rounded-full text-lg transition-all hover:scale-[1.02] active:scale-[0.98] mb-8 font-extrabold"
                  >
                    CHECK MY SAVINGS

                  </Link>

                  {/* Comparison table */}
                  <div className="bg-white/10 rounded-2xl overflow-hidden backdrop-blur-sm max-w-lg">
                    <div className="px-5 py-3 border-b border-white/10">
                      <p className="text-white font-bold text-base">
                        Keep What You Like.{" "}
                        <span className="text-[#4ade80]">See What Could Cost Less.</span>
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left px-5 py-3 text-white/50 font-medium text-base">What matters to you</th>
                            <th className="text-center px-3 py-3 text-white/50 font-medium text-base">Current plan</th>
                            <th className="text-center px-3 py-3 text-[#4ade80] font-medium text-base">New Plan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            "Keep My Doctors",
                            "Keep Same Coverage",
                            "No Change to Drug Plan",
                          ].map((row, i) => (
                            <tr key={i} className="border-b border-white/5">
                              <td className="px-5 py-3 text-white/80 text-base">{row}</td>
                              <td className="text-center px-3 py-3 text-white/60 text-xl">✓</td>
                              <td className="text-center px-3 py-3 text-[#4ade80] text-xl">✓</td>
                            </tr>
                          ))}
                          <tr className="border-b border-white/5">
                            <td className="px-5 py-3 text-white/80 text-base">Costs Less Every Month</td>
                            <td className="text-center px-3 py-3 text-white/20 text-xl">—</td>
                            <td className="text-center px-3 py-3">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4ade80] text-[#0d4d4d] font-black text-base">✓</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-4 text-white/80 text-base font-medium">Monthly premium</td>
                            <td className="text-center px-3 py-4 text-white/60 text-base" style={{textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.3)", textDecorationThickness: "1px"}}>$198/mo</td>
                            <td className="text-center px-3 py-4 text-[#4ade80] text-lg font-bold">$142/mo</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right content - Sample savings card */}
                <div className="hidden lg:flex justify-center items-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/10 to-transparent rounded-full blur-3xl" />
                  <div className="bg-white rounded-2xl shadow-2xl w-[300px] overflow-hidden border border-gray-100 relative z-10">
                    {/* Card header */}
                    <div className="bg-gradient-to-r from-[#0d4d4d] to-[#0d6060] px-5 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white/70 text-xs uppercase tracking-wide">Your Plan G · NJ</p>
                        <span className="bg-[#4ade80]/20 text-[#4ade80] text-xs font-semibold px-2 py-0.5 rounded-full">A Rated</span>
                      </div>
                      <p className="text-white font-bold text-base">Mutual of Omaha</p>
                    </div>

                    {/* Savings highlight */}
                    <div className="bg-[#4ade80] px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-[#0d4d4d] text-xs font-semibold uppercase tracking-wide">Potential Annual Savings</p>
                        <p className="text-[#0d4d4d] text-2xl font-black">$1,032 / year</p>
                      </div>
                      <Zap className="w-8 h-8 text-[#0d4d4d]/40" />
                    </div>

                    {/* Premium comparison */}
                    <div className="px-5 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">What you pay now</span>
                        <span className="text-gray-400 text-sm line-through">$198/mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 text-sm font-semibold">New rate</span>
                        <span className="text-gray-900 text-xl font-bold">$112<span className="text-sm font-normal text-gray-500">/mo</span></span>
                      </div>
                    </div>

                    {/* Checkmarks */}
                    <div className="px-5 py-4 space-y-2 border-b border-gray-100">
                      {["Exact same Plan G coverage", "No coverage gap", "Any doctor that takes Medicare"].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* StableScore */}
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-gray-500 text-xs">StableScore™</p>
                        <p className="text-[#0d4d4d] text-xs font-semibold">Price Stability Rating</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-[92%] bg-gradient-to-r from-[#4ade80] to-[#0d4d4d] rounded-full" />
                        </div>
                        <span className="text-[#0d4d4d] font-black text-lg">92</span>
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">
            How it works
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10 max-w-md mx-auto">
            Under 2 minutes. No commitment. See your number — then decide.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Tell us your plan</h3>
              <p className="text-gray-600 text-sm mb-2">
                Your zip, plan letter, and what you pay now. Takes about 60 seconds.
              </p>
              <p className="text-[#0d4d4d] text-xs font-semibold">No contact info needed yet</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">See your savings</h3>
              <p className="text-gray-600 text-sm mb-2">
                Real rates from 30+ carriers, instantly. See the exact dollar amount you could keep.
              </p>
              <p className="text-[#0d4d4d] text-xs font-semibold">If the savings aren't there, walk away</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-[#0d4d4d] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Switch if it makes sense</h3>
              <p className="text-gray-600 text-sm mb-2">
                Call us or enroll online. Same coverage — just at a price that actually fits.
              </p>
              <p className="text-[#0d4d4d] text-xs font-semibold">No pressure, no phone tag</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/q/current-plan"
              className="inline-flex items-center gap-2 bg-[#0d4d4d] hover:bg-[#0d6060] text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              See My Savings Now <ArrowRight className="w-4 h-4" />
            </Link>
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
