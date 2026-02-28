"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEnrollment } from "@/contexts/enrollment-context"
import { EnrollmentProgress } from "@/components/enrollment-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const router = useRouter()
  const { enrollmentData, updateEnrollmentData } = useEnrollment()
  const [firstName, setFirstName] = useState(enrollmentData.firstName || "")
  const [lastName, setLastName] = useState(enrollmentData.lastName || "")
  const [email, setEmail] = useState(enrollmentData.email || "")
  const [phone, setPhone] = useState(enrollmentData.phone || "")

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handleContinue = () => {
    updateEnrollmentData("firstName", firstName)
    updateEnrollmentData("lastName", lastName)
    updateEnrollmentData("email", email)
    updateEnrollmentData("phone", phone.replace(/\D/g, ""))
    router.push("/enroll/gender")
  }

  return (
    <>
      <EnrollmentProgress currentStep={5} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">Contact Information</h1>
        <p className="text-center text-muted-foreground mb-8">Confirm your contact details</p>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
          </div>
        </div>

        <Button onClick={handleContinue} disabled={!firstName || !lastName || !email || phone.replace(/\D/g, "").length < 10} className="w-full" size="lg">
          Continue
        </Button>
      </div>
    </>
  )
}
