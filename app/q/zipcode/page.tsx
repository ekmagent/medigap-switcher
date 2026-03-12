"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSwitcherForm } from "@/contexts/switcher-form-context"
import { QuoteProgress } from "@/components/quote-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import { StepWrapper } from "@/components/step-wrapper"

export default function ZipCodePage() {
  const router = useRouter()
  const { formData, updateFormData } = useSwitcherForm()
  const [zip, setZip] = useState(formData.zipCode || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5)
    setZip(value)
    setError("")
  }

  const handleLookup = async () => {
    if (zip.length !== 5) {
      setError("Please enter a 5-digit zip code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`)
      if (!response.ok) {
        setError("Invalid zip code. Please check and try again.")
        return
      }

      const data = await response.json()
      const places = data.places || []

      if (places.length === 0) {
        setError("No results found for this zip code.")
        return
      }

      const state = places[0]["state abbreviation"]
      const uniqueCounties = [...new Set(places.map((p: any) => p["place name"]))]
        .map((name) => ({ name: name as string, state }))

      updateFormData("zipCode", zip)
      updateFormData("county", uniqueCounties[0].name)
      updateFormData("state", state)
      router.push("/q/date-of-birth")
    } catch {
      setError("Failed to look up zip code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <StepWrapper step={3}>
        <QuoteProgress currentStep={3} />

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">
            What's your zip code?
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Rates vary by location
          </p>

          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <Label htmlFor="zip">Zip Code</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="zip"
                type="text"
                inputMode="numeric"
                value={zip}
                onChange={handleZipChange}
                placeholder="12345"
                maxLength={5}
                autoFocus
                className="pl-10 text-lg"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm mt-2">{error}</p>
            )}
          </div>

          <Button
              onClick={handleLookup}
              disabled={zip.length !== 5 || loading}
              className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-lg shadow-md hover:shadow-lg transition-[color,background-color,border-color,box-shadow,transform] hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
            >
              {loading ? "Looking up..." : "Continue"}
            </Button>
        </div>
    </StepWrapper>
  )
}
