"use client"

import { DentalFormProvider } from "@/contexts/dental-form-context"
import { SiteHeader } from "@/components/site-header"

export function DentalShell({ children }: { children: React.ReactNode }) {
  return (
    <DentalFormProvider>
      <SiteHeader />
      {children}
    </DentalFormProvider>
  )
}
