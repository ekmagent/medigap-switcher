import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Compare Medicare Supplement Rates | Save on Your Medigap Plan",
  description:
    "Already have a Medigap plan? Compare rates from 30+ carriers and see how much you could save by switching. Free, no obligation.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
