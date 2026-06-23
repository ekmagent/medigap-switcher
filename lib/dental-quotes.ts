/**
 * Dental quote source — Mutual of Omaha public retail rates, keyed by ZIP.
 *
 * Ported from the user-provided "dental quote kit": a static rate sheet
 * (moo-dental-rates.json) plus a pure lookup. No API, no auth, no network — the
 * sheet is MoO's public retail pricing, refreshed periodically. Prices are flat
 * across age but vary by state/zone.
 *
 * We surface three curated tiers from MoO's two individual products:
 *   Platinum = Mutual Dental Preferred,  $5,000 max (DNT2I) — 100/80/50, $50 ded
 *   Gold     = Mutual Dental Preferred,  $3,000 max (DNT2E) — 100/80/50, $50 ded  [recommended]
 *   Bronze   = Mutual Dental Protection, $1,500 max (DNT5B) — 100/50/50, $100 ded [value]
 */

import rates from "./moo-dental-rates.json"

export interface DentalPlanCoverage {
  preventive: number // % covered on cleanings & exams
  basic: number // % covered on fillings / basic
  major: number // % covered on crowns, dentures, implants
}

export interface DentalPlan {
  id: "platinum" | "gold" | "bronze"
  tier: string
  tagline: string
  monthlyPremium: number
  annualMax: number
  deductible: number
  recommended: boolean
  coverage: DentalPlanCoverage
  visionHearing: boolean // bundled vision & hearing rider (Platinum only)
  savingsAudit: boolean // exclusive Medicare Savings Audit perk (Platinum + Gold, not Bronze)
}

const PREFERRED: DentalPlanCoverage = { preventive: 100, basic: 80, major: 50 }
const PROTECTION: DentalPlanCoverage = { preventive: 100, basic: 50, major: 50 }

// Vision & hearing rider added on top of Platinum's dental premium, to bundle it
// as the premium tier and widen the gap so Gold (dental-only) reads as the
// no-brainer middle. Flat $8.28/mo in every state (user-confirmed).
const VISION_HEARING_ADDON = 8.28

// Which MoO form backs each displayed tier, plus the static benefit/marketing copy.
const TIER_MAP: {
  id: DentalPlan["id"]
  form: string
  tier: string
  tagline: string
  annualMax: number
  deductible: number
  recommended: boolean
  coverage: DentalPlanCoverage
  visionHearing: boolean
  savingsAudit: boolean
  addon: number
}[] = [
  {
    id: "platinum",
    form: "DNT2I", // Preferred, $5,000 max + bundled vision & hearing
    tier: "Platinum",
    tagline: "Dental + vision & hearing",
    annualMax: 5000,
    deductible: 50,
    recommended: false,
    coverage: PREFERRED,
    visionHearing: true,
    savingsAudit: true,
    addon: VISION_HEARING_ADDON,
  },
  {
    id: "gold",
    form: "DNT2E", // Preferred, $3,000 max
    tier: "Gold",
    tagline: "Most coverage for the money",
    annualMax: 3000,
    deductible: 50,
    recommended: true,
    coverage: PREFERRED,
    visionHearing: false,
    savingsAudit: true,
    addon: 0,
  },
  {
    id: "bronze",
    form: "DNT5B", // Protection, $1,500 max (value plan)
    tier: "Bronze",
    tagline: "Just the basics",
    annualMax: 1500,
    deductible: 100,
    recommended: false,
    coverage: PROTECTION,
    visionHearing: false,
    savingsAudit: false,
    addon: 0,
  },
]

function normalizeZip(zip: string): string | null {
  const z = String(zip ?? "").trim()
  return /^\d{5}$/.test(z) ? z : null
}

function stateForZip(z: string): string | null {
  const z3s = (rates as any).z3s as Record<string, string> | undefined
  return z3s?.[z.slice(0, 3)] || null
}

function zoneForZip(state: string, z: string): string | null {
  const sm = (rates as any).sm as Record<string, string> | undefined
  const z3 = z.slice(0, 3)
  return sm?.[`${state}-${z3}`] || sm?.[state] || null
}

export async function getDentalQuotes(params: { zip: string; state?: string }): Promise<DentalPlan[]> {
  const z = normalizeZip(params.zip)
  if (!z) return []

  const state = stateForZip(z)
  if (!state) return []
  if (((rates as any).unavailable || []).includes(state)) return [] // not sold (e.g. MA, NY)

  const zone = zoneForZip(state, z)
  const cents = zone && (rates as any).r?.[zone]
  if (!cents) return []

  const plans: DentalPlan[] = []
  for (const t of TIER_MAP) {
    const c = cents[t.form]
    if (c == null) continue
    plans.push({
      id: t.id,
      tier: t.tier,
      tagline: t.tagline,
      monthlyPremium: +(c / 100 + t.addon).toFixed(2),
      annualMax: t.annualMax,
      deductible: t.deductible,
      recommended: t.recommended,
      coverage: t.coverage,
      visionHearing: t.visionHearing,
      savingsAudit: t.savingsAudit,
    })
  }
  return plans
}
