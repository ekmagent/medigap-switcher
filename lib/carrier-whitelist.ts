/**
 * Carrier Whitelist Configuration
 * Only quotes from these carriers will be displayed to users
 *
 * This list is based on preferred carrier relationships and product quality
 */

// Whitelist of allowed carrier names (matches against CSG API company_base.name)
export const ALLOWED_CARRIERS = [
  // ACE/INA/Chubb
  "Insurance Co of N Amer",
  "ICNA",
  "ACE",
  "Chubb",

  // AARP United Healthcare (all variants)
  "AARP Medicare Supplement Insurance Plans, insured by United Healthcare Insurance Company of America",
  "UnitedHealthcare Ins Co",
  "United Healthcare Insurance Company",
  "AARP",

  // Cigna/Healthspring
  "Cigna National Health Ins Co",
  "Cigna",
  "American Retirement Life Insurance",
  "CHLIC",
  "Healthspring",

  // Aetna (all variants)
  "Continental Life Insurance Company of Brentwood, Tennessee",
  "Continental Life Ins Co of Brentwood Tennessee",
  "Aetna Hlth Ins Co",
  "Aetna Health Insurance Co",
  "Aetna Health and Life Insurance Company",
  "Aetna Hlth and Life Ins Co",
  "American Continental Ins Co",

  // Medico/Wellabe
  "Medico Ins Co",
  "Medico Corp Life Ins Co",
  "Wellabe",

  // Humana (all variants)
  "Humana Insurance Company",
  "Humana Ins Co",
  "Humana",

  // Manhattan Life
  "ManhattanLife Insurance and Annuity Company",
  "Manhattan Life",

  // Aflac/Tier One
  "Tier One Ins Co",
  "Aflac",

  // Mutual of Omaha
  "United World Life Ins Co",
  "Mutual of Omaha",

  // Bankers Fidelity
  "Bankers Fidelity Assur Co",
  "Bankers Fidelity",
  "Capital Assurance",
  "Atlantic Capital Life Ins Co",
  "Atlantic Capital Life Assur Co",
  "Atlantic Capital Life Assur Co (N)", // Add variant with state suffix (e.g., "(N)" for state-specific filings)
  "Atlantic Assurance",

  // Allstate
  "National General",
  "Allstate Benefits",
  "Allstate",

  // Heartland National Life
  "Heartland National Life Ins Co",
  "Heartland National Life",
]

/**
 * Check if a carrier is allowed based on whitelist
 * Uses case-insensitive partial matching for flexibility
 */
export function isCarrierAllowed(carrierName: string): boolean {
  if (!carrierName) return false

  const normalizedCarrier = carrierName.toLowerCase().trim()

  // Check if carrier name contains any of the allowed patterns
  return ALLOWED_CARRIERS.some((allowed) => {
    const normalizedAllowed = allowed.toLowerCase().trim()
    return normalizedCarrier.includes(normalizedAllowed) || normalizedAllowed.includes(normalizedCarrier)
  })
}

/**
 * Get filtered quote count for logging/analytics
 * Returns detailed information about filtered carriers for review
 */
export function getFilterStats(quotes: any[]): {
  total: number
  allowed: number
  filtered: number
  filteredCarriers: Array<{
    name: string
    naic: string | null
    count: number
  }>
} {
  const total = quotes.length
  const allowed = quotes.filter((q) => isCarrierAllowed(q.company_base?.name || q.carrierName)).length

  const filteredQuotes = quotes.filter((q) => !isCarrierAllowed(q.company_base?.name || q.carrierName))

  const carrierMap = new Map<string, { name: string; naic: string | null; count: number }>()

  filteredQuotes.forEach((q) => {
    const name = q.company_base?.name || q.carrierName || "Unknown"
    const naic = q.company_base?.naic || null
    const key = `${name}|${naic}`

    if (carrierMap.has(key)) {
      carrierMap.get(key)!.count++
    } else {
      carrierMap.set(key, { name, naic, count: 1 })
    }
  })

  return {
    total,
    allowed,
    filtered: total - allowed,
    filteredCarriers: Array.from(carrierMap.values()),
  }
}
