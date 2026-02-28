"use client"

import { EnrollmentProvider } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { SiteHeader } from "@/components/site-header"

export default function EnrollmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EnrollmentProvider>
      <SiteHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </EnrollmentProvider>
  )
}
