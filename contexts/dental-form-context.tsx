"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { DentalPlan } from "@/lib/dental-quotes"

export interface DentalFormData {
  // Location
  zipCode: string
  county: string
  state: string

  // Qualifying questions
  hasDentalNow: string // "yes" | "no"
  coverageFocus: string // "preventative" | "major"
  onMedicare: string // "yes" | "no"
  medicareType: string // "advantage" | "supplement" | ""
  preference: string // "basic" | "comprehensive"

  // Contact
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string // MM/DD/YYYY (assembled on the birth-day step)
  dobMonth: string // 1-12, accumulator across the 3 DOB steps
  dobYear: string // YYYY, accumulator across the 3 DOB steps

  // Enrollment ("Add to Cart") step
  effectiveOption: string // "today" | "in7days"
  canMakeDecisions: string // "yes" | "no" (power-of-attorney check)
  gender: string // "Male" | "Female"
  street: string
  unit: string
  city: string
  enrollSubmitted: boolean

  // Tracking
  fbp?: string
  fbc?: string
  gclid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referrerUrl?: string

  // Submission
  leadId?: string
  submitted?: boolean
}

interface DentalFormContextType {
  formData: DentalFormData
  updateFormData: (field: keyof DentalFormData, value: any) => void
  resetFormData: () => void
  quotes: DentalPlan[]
  setQuotes: (quotes: DentalPlan[]) => void
  isLoadingQuotes: boolean
  setIsLoadingQuotes: (loading: boolean) => void
  quotesError: string | null
  setQuotesError: (error: string | null) => void
}

const defaultFormData: DentalFormData = {
  zipCode: "",
  county: "",
  state: "",
  hasDentalNow: "",
  coverageFocus: "",
  onMedicare: "",
  medicareType: "",
  preference: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  dobMonth: "",
  dobYear: "",
  effectiveOption: "today",
  canMakeDecisions: "",
  gender: "",
  street: "",
  unit: "",
  city: "",
  enrollSubmitted: false,
  fbp: "",
  fbc: "",
  gclid: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  referrerUrl: "",
  leadId: undefined,
  submitted: false,
}

const STORAGE_KEY = "dental-lead-form-data"

const DentalFormContext = createContext<DentalFormContextType | undefined>(undefined)

export function DentalFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<DentalFormData>(defaultFormData)
  const [isLoaded, setIsLoaded] = useState(false)
  const [quotes, setQuotes] = useState<DentalPlan[]>([])
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
        console.error("Error loading dental form data:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, quotes }))
    }
  }, [formData, quotes, isLoaded])

  const updateFormData = (field: keyof DentalFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetFormData = () => {
    setFormData(defaultFormData)
    setQuotes([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <DentalFormContext.Provider
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
    </DentalFormContext.Provider>
  )
}

export function useDentalForm() {
  const context = useContext(DentalFormContext)
  if (context === undefined) {
    throw new Error("useDentalForm must be used within a DentalFormProvider")
  }
  return context
}
