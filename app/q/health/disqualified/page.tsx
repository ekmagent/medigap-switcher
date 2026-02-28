"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, ArrowRight } from "lucide-react"

export default function HealthDisqualifiedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-amber-600" />
            </div>

            <h1 className="text-2xl font-bold mb-4">
              Let Us Help You Find the Right Coverage
            </h1>

            <p className="text-muted-foreground mb-6">
              Based on your answers, you may need help from a licensed agent to find the
              right coverage. Some carriers are more flexible than others — our team
              specializes in finding options for people with health conditions.
            </p>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full text-lg">
                <a href="tel:+18001234567">
                  <Phone className="w-5 h-5 mr-2" />
                  Talk to a Licensed Agent
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full bg-transparent"
                onClick={() => router.push("/q/loading")}
              >
                I'd like to continue anyway
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Calls are free and there's no obligation. Our agents can help find carriers
              that may accept your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
