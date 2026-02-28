"use client"

import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-[#0d4d4d]">
              HealthPlans<span className="font-light">.now</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}
