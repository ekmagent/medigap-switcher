"use client"

import { EnrollmentProvider } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"

export default function EnrollmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EnrollmentProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </EnrollmentProvider>
  )
}
