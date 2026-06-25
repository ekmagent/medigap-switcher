/**
 * Shared formatting for the dental funnel — used by the GHL note and the Slack
 * notification so the dialer-facing copy stays consistent in one place.
 */

// Static per-tier plan details. Prices are dynamic (passed in from the quote).
const TIERS = [
  { id: "gold", name: "Gold", max: 3000, coverage: "100/80/50", deductible: 50, extra: "", recommended: true },
  { id: "platinum", name: "Platinum", max: 5000, coverage: "100/80/50", deductible: 50, extra: " · +vision", recommended: false },
  { id: "bronze", name: "Bronze", max: 1500, coverage: "100/50/50", deductible: 100, extra: "", recommended: false },
] as const

function money(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

/** The 3-plan comparison, Gold (recommended) first. Each: price · max · coverage · deductible. */
export function quoteLines(p: { platinum?: number | null; gold?: number | null; bronze?: number | null }): string[] {
  return TIERS.map((t) => {
    const price = p[t.id]
    if (price == null) return null
    const star = t.recommended ? "★ " : "  "
    return `${star}${t.name} ${money(price)}/mo · $${t.max.toLocaleString()}/yr · ${t.coverage} · $${t.deductible} ded${t.extra}${
      t.recommended ? " (recommended)" : ""
    }`
  }).filter((x): x is string => Boolean(x))
}

export function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null
  const m = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const mm = +m[1]
  const dd = +m[2]
  const yyyy = +m[3]
  const now = new Date()
  let age = now.getFullYear() - yyyy
  if (now.getMonth() + 1 < mm || (now.getMonth() + 1 === mm && now.getDate() < dd)) age--
  return age
}

/** Direct link to the contact record in GHL (their "profile"). */
export function ghlContactUrl(contactId: string): string {
  const base = process.env.GHL_APP_BASE_URL || "https://app.gohighlevel.com"
  const loc = process.env.GHL_LOCATION_ID
  return `${base}/v2/location/${loc}/contacts/detail/${contactId}`
}

export function yesNo(v?: string) {
  return v === "yes" ? "Yes" : v === "no" ? "No" : v || "—"
}
export function coverageFocusLabel(v?: string) {
  return v === "major" ? "Bigger procedures / major work" : v === "preventative" ? "Preventive care" : v || "—"
}
export function preferenceLabel(v?: string) {
  return v === "comprehensive" ? "More comprehensive" : v === "basic" ? "Basic" : v || "—"
}
export function medicareLabel(onMedicare?: string, type?: string) {
  if (onMedicare !== "yes") return "No"
  const t =
    type === "advantage"
      ? "Medicare Advantage"
      : type === "supplement"
        ? "Medicare Supplement"
        : type === "not-sure"
          ? "not sure"
          : type
  return `Yes${t ? ` — ${t}` : ""}`
}
