"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface SwitcherFormData {
  // Quote flow fields
  currentPlan: string // "F" | "G" | "N" | "C" | "other"
  currentPremium: string // Dollar amount as string
  zipCode: string
  county: string
  state: string
  dateOfBirth: string // MM/DD/YYYY
  gender: string // "Male" | "Female"
  tobacco: string // "yes" | "no"

  // Computed fields
  quotingAge?: number
  effectiveDate?: string

  // Tracking
  fbp?: string
  fbc?: string
  gclid?: string
  acquisitionChannel?: string
  landingPage?: string
  referrerUrl?: string
  deviceType?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string

  // Post-unlock fields (set after SMS verification)
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  leadId?: string
  isUnlocked?: boolean
}

interface Quote {
  stableScore: number
  carrierName: string
  planName: string
  monthlyPremium: number
  model?: "new-entrant" | "established"
  lossRatioGap?: number
  rateVolatility?: number
  financialStrength?: number
  pricingAggression?: number
  quoteKey?: string
  loggingKey?: string
  hasEapp?: boolean
  companyNaic?: string
  amBestRating?: string
  rateIncreases?: any[]
  discounts?: any[]
  discountCategory?: string
  discountApplied?: boolean
  originalRate?: number
  finalScore?: number
  personalizationBoost?: number
  csgRawData?: any
}

interface SwitcherFormContextType {
  formData: SwitcherFormData
  updateFormData: (field: keyof SwitcherFormData, value: any) => void
  resetFormData: () => void
  quotes: Quote[]
  setQuotes: (quotes: Quote[]) => void
  isLoadingQuotes: boolean
  setIsLoadingQuotes: (loading: boolean) => void
  quotesError: string | null
  setQuotesError: (error: string | null) => void
}

const defaultFormData: SwitcherFormData = {
  currentPlan: "",
  currentPremium: "",
  zipCode: "",
  county: "",
  state: "",
  dateOfBirth: "",
  gender: "",
  tobacco: "",
  quotingAge: undefined,
  effectiveDate: undefined,
  fbp: "",
  fbc: "",
  gclid: "",
  acquisitionChannel: "",
  landingPage: "",
  referrerUrl: "",
  deviceType: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  phone: undefined,
  leadId: undefined,
  isUnlocked: false,
}

const STORAGE_KEY = "medigap-switcher-form-data"

const SwitcherFormContext = createContext<SwitcherFormContextType | undefined>(undefined)

export function SwitcherFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<SwitcherFormData>(defaultFormData)
  const [isLoaded, setIsLoaded] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [quotesError, setQuotesError] = useState<string | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed.formData || parsed)
        setQuotes(parsed.quotes || [])
      } catch (error) {
        console.error("Error loading form data:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, quotes }))
    }
  }, [formData, quotes, isLoaded])

  const updateFormData = (field: keyof SwitcherFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetFormData = () => {
    setFormData(defaultFormData)
    setQuotes([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <SwitcherFormContext.Provider
      value={{
        formData,
        updateFormData,
        resetFormData,
        quotes,
        setQuotes,
        isLoadingQuotes,
        setIsLoadingQuotes,
        quotesError,
        setQuotesError,
      }}
    >
      {children}
    </SwitcherFormContext.Provider>
  )
}

export function useSwitcherForm() {
  const context = useContext(SwitcherFormContext)
  if (context === undefined) {
    throw new Error("useSwitcherForm must be used within a SwitcherFormProvider")
  }
  return context
}
