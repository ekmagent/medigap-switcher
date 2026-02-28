import Link from "next/link"
import { ArrowRight, Shield, TrendingDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Paying Too Much for Your Medicare Supplement?
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Compare rates from 30+ carriers in under 2 minutes. No contact info
            required to see your savings.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/q/current-plan">
              See My Savings <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Value props */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Save $300-$800/yr</h3>
            <p className="text-slate-600 text-sm">
              Most people overpay for the exact same coverage. Same Plan G, same
              benefits — lower price.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">2 Minutes</h3>
            <p className="text-slate-600 text-sm">
              Answer a few quick questions and see real quotes. No phone calls,
              no spam.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">StableScore Rated</h3>
            <p className="text-slate-600 text-sm">
              Our proprietary rating shows which carriers keep rates stable year
              after year.
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            Trusted by thousands of Medicare beneficiaries across all 50 states
          </p>
        </div>
      </div>
    </div>
  )
}
