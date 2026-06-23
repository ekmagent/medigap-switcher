import type { Metadata } from "next"
import { DentalShell } from "./dental-shell"

// Dental funnel metadata — overrides the root site's "Medicare Supplement Insurance"
// title/OG so the dental pages read as a savings/financial product, not a medical one.
export const metadata: Metadata = {
  title: "Dental Plans — Same Price at Any Age | easyKind",
  description:
    "Compare dental plans that don't cost more as you age — the same price at 18 or 70, preventive care covered, no long waits. easyKind Health LLC is a licensed insurance brokerage, not a dental or healthcare provider.",
  alternates: { canonical: "https://smile.healthplans.now" },
  openGraph: {
    title: "Dental Plans — Same Price at Any Age",
    description:
      "Dental coverage that costs the same whether you're 18 or 70 — preventive care covered, no long waits.",
    url: "https://smile.healthplans.now",
    type: "website",
  },
}

export default function DentalFlowLayout({ children }: { children: React.ReactNode }) {
  return <DentalShell>{children}</DentalShell>
}
