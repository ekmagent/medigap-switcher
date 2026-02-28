"use client"

import { SwitcherFormProvider } from "@/contexts/switcher-form-context"
import { SiteHeader } from "@/components/site-header"

export default function QuoteFlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SwitcherFormProvider>
      <SiteHeader />
      {children}
    </SwitcherFormProvider>
  )
}
