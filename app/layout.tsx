import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Medicare Supplement Insurance Quotes | easyKind Health LLC — Licensed Insurance Brokerage",
  description:
    "easyKind Health LLC is a licensed insurance brokerage. Compare Medicare Supplement insurance rates from 30+ carriers. Financial services — not a medical provider.",
  openGraph: {
    title: "easyKind Health LLC — Licensed Insurance Brokerage",
    description: "Licensed insurance agency. Medicare Supplement plan comparison. Financial services.",
    type: "website",
    url: "https://switch.healthplans.now",
    images: [
      {
        url: "https://switch.healthplans.now/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "easyKind Health LLC — Licensed Insurance Brokerage",
      },
    ],
  },
}

const insuranceAgencySchema = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  "name": "easyKind Health LLC",
  "alternateName": "easyKind Medicare",
  "description": "Licensed insurance brokerage specializing in Medicare Supplement plans. Not a medical provider.",
  "url": "https://switch.healthplans.now",
  "telephone": "(856) 888-9080",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1309 Rte 70 W",
    "addressLocality": "Cherry Hill",
    "addressRegion": "NJ",
    "postalCode": "08002"
  },
  "sameAs": [],
  "knowsAbout": ["Medicare Supplement Insurance", "Medigap Plans", "Insurance Comparison"],
  "areaServed": "US",
  "priceRange": "$$"
}

const agentSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Anthony Orner",
  "jobTitle": "Licensed Insurance Producer",
  "affiliation": {
    "@type": "InsuranceAgency",
    "name": "easyKind Health LLC"
  },
  "knowsAbout": ["Insurance", "Medicare Supplement", "Financial Services"]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta property="og:image" content="https://switch.healthplans.now/images/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="easyKind Health LLC — Licensed Insurance Brokerage" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(insuranceAgencySchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema) }}
        />
      </body>
    </html>
  )
}
