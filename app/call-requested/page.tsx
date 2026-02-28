"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Phone } from "lucide-react"

export default function CallRequestedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold mb-4">We'll Call You Shortly!</h1>

            <p className="text-muted-foreground mb-6">
              A licensed agent will reach out to help you switch plans and start saving.
              Expect a call within 1 business day.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Can't wait?</strong> Call us directly and we'll help you right away.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <a href="tel:+18001234567">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/q/results">Back to Results</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
