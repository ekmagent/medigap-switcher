"use client"

import { SwitcherFormProvider } from "@/contexts/switcher-form-context"

export default function QuoteFlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SwitcherFormProvider>{children}</SwitcherFormProvider>
}
