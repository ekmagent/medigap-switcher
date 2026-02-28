"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface EnrollmentData {
  // Selected quote
  selectedCarrier: string
  selectedPlan: string
  monthlyPremium: string
  quoteKey: string
  loggingKey: string
  companyNaic: string

  // Replacement (always required for switchers)
  currentCarrier: string
  currentPlan: string
  terminationDate: string
  intendToReplace: string

  // Personal info (pre-filled from quote flow)
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string

  // Address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  mailingAddressDifferent: string
  mailingAddressLine1: string
  mailingAddressLine2: string
  mailingCity: string
  mailingState: string
  mailingZipCode: string

  // Medicare ID (optional)
  mbi: string

  // Application tracking
  applicationId: string
  leadId: string
}

interface EnrollmentContextType {
  enrollmentData: EnrollmentData
  updateEnrollmentData: (field: keyof EnrollmentData, value: string) => void
  resetEnrollmentData: () => void
}

const defaultEnrollmentData: EnrollmentData = {
  selectedCarrier: "",
  selectedPlan: "",
  monthlyPremium: "",
  quoteKey: "",
  loggingKey: "",
  companyNaic: "",
  currentCarrier: "",
  currentPlan: "",
  terminationDate: "",
  intendToReplace: "yes",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  mailingAddressDifferent: "no",
  mailingAddressLine1: "",
  mailingAddressLine2: "",
  mailingCity: "",
  mailingState: "",
  mailingZipCode: "",
  mbi: "",
  applicationId: "",
  leadId: "",
}

const STORAGE_KEY = "medigap-switcher-enrollment-data"

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined)

export function EnrollmentProvider({ children }: { children: React.ReactNode }) {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>(defaultEnrollmentData)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setEnrollmentData({ ...defaultEnrollmentData, ...JSON.parse(saved) })
      } catch {}
    }

    // Pre-fill from quote flow data
    const switcherData = localStorage.getItem("medigap-switcher-form-data")
    const selectedQuote = localStorage.getItem("medigap-switcher-selected-quote")

    if (switcherData) {
      try {
        const parsed = JSON.parse(switcherData)
        const fd = parsed.formData || parsed
        setEnrollmentData((prev) => ({
          ...prev,
          firstName: prev.firstName || fd.firstName || "",
          lastName: prev.lastName || fd.lastName || "",
          email: prev.email || fd.email || "",
          phone: prev.phone || fd.phone || "",
          dateOfBirth: prev.dateOfBirth || fd.dateOfBirth || "",
          gender: prev.gender || fd.gender || "",
          zipCode: prev.zipCode || fd.zipCode || "",
          state: prev.state || fd.state || "",
          currentPlan: prev.currentPlan || fd.currentPlan || "",
          leadId: prev.leadId || fd.leadId || "",
        }))
      } catch {}
    }

    if (selectedQuote) {
      try {
        const quote = JSON.parse(selectedQuote)
        setEnrollmentData((prev) => ({
          ...prev,
          selectedCarrier: prev.selectedCarrier || quote.carrierName || "",
          selectedPlan: prev.selectedPlan || quote.planName || "",
          monthlyPremium: prev.monthlyPremium || String(quote.monthlyPremium || ""),
          quoteKey: prev.quoteKey || quote.quoteKey || "",
          loggingKey: prev.loggingKey || quote.loggingKey || "",
          companyNaic: prev.companyNaic || quote.companyNaic || "",
        }))
      } catch {}
    }

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollmentData))
    }
  }, [enrollmentData, isLoaded])

  const updateEnrollmentData = (field: keyof EnrollmentData, value: string) => {
    setEnrollmentData((prev) => ({ ...prev, [field]: value }))
  }

  const resetEnrollmentData = () => {
    setEnrollmentData(defaultEnrollmentData)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem("medigap-switcher-selected-quote")
  }

  return (
    <EnrollmentContext.Provider
      value={{ enrollmentData, updateEnrollmentData, resetEnrollmentData }}
    >
      {children}
    </EnrollmentContext.Provider>
  )
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext)
  if (context === undefined) {
    throw new Error("useEnrollment must be used within an EnrollmentProvider")
  }
  return context
}
