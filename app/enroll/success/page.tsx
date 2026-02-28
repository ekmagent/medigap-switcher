"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Phone } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Application Submitted!</h1>

        <p className="text-muted-foreground mb-6">
          Your application has been submitted. A licensed agent will review it and
          reach out to you with next steps. This usually takes 1-2 business days.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> Do not cancel your current policy until your
            new coverage is confirmed and in effect.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full">
            <a href="tel:+18001234567">
              <Phone className="w-5 h-5 mr-2" />
              Questions? Call Us
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
