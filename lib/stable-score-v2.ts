/**
 * STABLESCORE™ ALGORITHM
 *
 * Two Models:
 * 1. ESTABLISHED CARRIER - Scored on track record (loss ratio, rate stability, financials)
 * 2. NEW ENTRANT - Scored on pricing aggression and financials
 */

export interface StableScoreResult {
  score: number
  model: "established" | "new-entrant"
  components: {
    lossRatioGap?: number
    rateVolatility?: number
    riskPoolStability?: number
    financialBuffer: number
    pricingAggression?: number
  }
  details: {
    rateHistoryYears: number
    rating: string
    avgRateIncrease?: number
    lossRatioPercent?: string
    isTeaserRate?: boolean
    ewmaVolatility?: number
  }
}

interface ScoreInput {
  // Rate history
  rateIncreases: Array<{ increase?: number; date?: string; rate_increase?: number }>

  // Financials
  premiums?: number
  claims?: number

  // Ratings
  rating: string

  // For new entrants
  monthlyPremium?: number
  cheapestEstablishedPrice?: number
  allQuotes?: Array<{ monthly_premium: number; rateIncreases: Array<{ increase?: number }> }>
}

interface RateIncrease {
  increase?: number
  date?: string
  rate_increase?: number
}

export function calculateStableScore(input: ScoreInput): StableScoreResult {
  const rateHistoryYears = input.rateIncreases?.length || 0
  const isNewEntrant = rateHistoryYears < 2

  if (isNewEntrant) {
    return scoreNewEntrant(input, rateHistoryYears)
  } else {
    return scoreEstablishedCarrier(input, rateHistoryYears)
  }
}

/**
 * ESTABLISHED CARRIER MODEL
 * Components:
 * - Loss Ratio Gap (40%)
 * - Rate Volatility (25%)
 * - Risk Pool Stability (20%) - placeholder
 * - Financial Buffer (15%)
 */
function scoreEstablishedCarrier(input: ScoreInput, years: number): StableScoreResult {
  const lossRatioGap = scoreLossRatioGap(input.premiums, input.claims)
  const rateVolatility = scoreRateVolatility(input.rateIncreases)
  const riskPoolStability = 50 // Placeholder - not yet implemented
  const financialBuffer = ratingToScore(input.rating)

  // Calculate total available weight
  const components = [
    { score: lossRatioGap, weight: 0.4, available: lossRatioGap !== null },
    { score: rateVolatility, weight: 0.25, available: rateVolatility !== null },
    { score: riskPoolStability, weight: 0.2, available: false }, // Not implemented
    { score: financialBuffer, weight: 0.15, available: true },
  ]

  const totalAvailableWeight = components.filter((c) => c.available).reduce((sum, c) => sum + c.weight, 0)

  // Dynamic re-weighting
  let finalScore = 0
  components.forEach((c) => {
    if (c.available && c.score !== null) {
      const adjustedWeight = c.weight / totalAvailableWeight
      finalScore += c.score * adjustedWeight
    }
  })

  const avgIncrease = calculateAverageIncrease(input.rateIncreases)
  const ewmaVolatility = calculateEWMAVolatility(input.rateIncreases)

  return {
    score: Math.round(finalScore),
    model: "established",
    components: {
      lossRatioGap: lossRatioGap || undefined,
      rateVolatility: rateVolatility || undefined,
      financialBuffer,
    },
    details: {
      rateHistoryYears: years,
      rating: input.rating,
      avgRateIncrease: avgIncrease,
      ewmaVolatility: ewmaVolatility,
      lossRatioPercent:
        input.premiums && input.claims ? `${((input.claims / input.premiums) * 100).toFixed(1)}%` : "N/A",
    },
  }
}

/**
 * NEW ENTRANT MODEL
 * Components:
 * - Pricing Aggression (60%)
 * - Financial Buffer (40%)
 */
function scoreNewEntrant(input: ScoreInput, years: number): StableScoreResult {
  const pricingAggression = scorePricingAggression(input.monthlyPremium, input.allQuotes)
  const financialBuffer = ratingToScore(input.rating)

  const finalScore = Math.round(pricingAggression * 0.9 + financialBuffer * 0.1)
  const isTeaserRate = pricingAggression < 50

  return {
    score: finalScore,
    model: "new-entrant",
    components: {
      pricingAggression,
      financialBuffer,
    },
    details: {
      rateHistoryYears: years,
      rating: input.rating,
      isTeaserRate,
    },
  }
}

/**
 * LOSS RATIO GAP SCORING
 * Target: ≤75% loss ratio (sustainable pricing with good profit margin)
 * Higher ratios = carrier paying out more in claims = unsustainable pricing
 *
 * Scoring Philosophy:
 * - Up to 75%: Amazing (100) - sustainable with good margins
 * - 75-80%: Excellent (95) - slightly tighter margins but still very good
 * - 81-86%: Good (85) - acceptable margins, minor rate increases possible
 * - 86-90%: Concerning (75) - margins too thin, rate increases likely
 * - 91-95%: Warning (55) - losing money, major rate increases imminent
 * - 95%+: Critical (20) - STEER AWAY - unsustainable, massive increases coming
 */
function scoreLossRatioGap(premiums?: number, claims?: number): number | null {
  if (!premiums || !claims || premiums === 0) return null

  const lossRatio = claims / premiums

  // Amazing: Up to 75% - sustainable pricing with healthy profit margins
  if (lossRatio <= 0.75) return 100

  // Excellent: 75-80% - slightly tighter margins but still very good
  if (lossRatio <= 0.8) return 95

  // Good: 81-86% - acceptable margins, minor rate increases possible
  if (lossRatio <= 0.86) return 85

  // Concerning: 86-90% - margins too thin, rate increases likely
  if (lossRatio <= 0.9) return 75

  // Warning: 91-95% - losing money, major rate increases imminent
  if (lossRatio <= 0.95) return 55

  // Critical: 95%+ - STEER AWAY - carrier is hemorrhaging money, massive rate increases coming
  return 20
}

/**
 * RATE VOLATILITY SCORING (Established Carriers)
 * Uses EWMA (Exponentially Weighted Moving Average) with α=0.3
 * Recent increases weighted more heavily (30% new, 70% previous)
 * Last 5 years only - recent history is most predictive
 *
 * Why EWMA vs Standard Deviation:
 * - EWMA penalizes high increases even if consistent (25% every year = bad score)
 * - Std Dev would give perfect score to consistent 25% increases (bad)
 * - EWMA captures both level AND trend
 */
function scoreRateVolatility(rateIncreases?: RateIncrease[]): number | null {
  if (!rateIncreases || rateIncreases.length < 2) return null

  const recentIncreases = rateIncreases.slice(-5)

  console.log("[v0] Rate Volatility - Input increases:", recentIncreases)

  // Normalize to decimal format (handle both 0.06 and 6 as 6%)
  const increases = recentIncreases
    .map((r) => {
      const val = r.increase || r.rate_increase || 0
      // If value is > 1, assume it's in percentage form (6 = 6%), convert to decimal
      return val > 1 ? val / 100 : val
    })
    .filter((i) => i >= 0) // Keep zeros, they're valid data points
    .reverse() // Most recent first for EWMA

  if (increases.length < 2) return null

  console.log("[v0] Rate Volatility - Normalized increases (most recent first):", increases)

  let ewma = increases[0] // Start with most recent
  for (let i = 1; i < increases.length; i++) {
    ewma = 0.3 * increases[i] + 0.7 * ewma
  }

  console.log("[v0] Rate Volatility - EWMA:", ewma)

  // Score based on EWMA (lower = better)
  // This penalizes high increases even if consistent
  let score: number
  if (ewma <= 0.03)
    score = 100 // ≤3% excellent
  else if (ewma <= 0.05)
    score = 80 // ≤5% good
  else if (ewma <= 0.08)
    score = 60 // ≤8% acceptable
  else if (ewma <= 0.12)
    score = 40 // ≤12% concerning
  else if (ewma <= 0.15)
    score = 20 // ≤15% problematic
  else score = 0 // >15% very bad

  console.log("[v0] Rate Volatility - Score:", score)

  return score
}

/**
 * PRICING AGGRESSION CHECK
 * Penalizes "teaser rates" priced significantly below market average
 * Uses bottom 50% to filter outliers:
 * - Removes top 50% (closed books, outlier pricing, standard rates)
 * - Averages bottom 50% for true "market rate"
 * Lose 5 points for every 1% below market average
 */
function scorePricingAggression(
  newEntrantPrice?: number,
  allQuotes?: Array<{ monthly_premium: number; rateIncreases: Array<{ increase?: number }> }>,
): number {
  if (!newEntrantPrice || !allQuotes || allQuotes.length === 0) return 100

  const establishedQuotes = allQuotes.filter((q) => (q.rateIncreases?.length || 0) >= 2)

  if (establishedQuotes.length === 0) return 100 // No comparison available

  // Sort prices ascending
  const sortedPrices = establishedQuotes.map((q) => q.monthly_premium).sort((a, b) => a - b)

  console.log("[v0] Pricing Aggression - All established prices (sorted):", sortedPrices)

  if (sortedPrices.length < 2) {
    // If only 1 carrier, just use that price
    const marketAverage = sortedPrices[0]
    console.log("[v0] Pricing Aggression - Market average (single carrier):", marketAverage)

    const percentBelowMarket = (marketAverage - newEntrantPrice) / marketAverage
    const penalty = percentBelowMarket * 500
    return Math.max(0, Math.min(100, 100 - penalty))
  }

  // Take bottom 50% (cheaper half of established carriers)
  const bottomHalfCount = Math.ceil(sortedPrices.length / 2)
  const bottomHalfPrices = sortedPrices.slice(0, bottomHalfCount)

  console.log("[v0] Pricing Aggression - Bottom 50% prices:", bottomHalfPrices)

  // Calculate average of bottom 50%
  const marketAverage = bottomHalfPrices.reduce((sum, p) => sum + p, 0) / bottomHalfPrices.length

  console.log("[v0] Pricing Aggression - Market average (bottom 50%):", marketAverage)
  console.log("[v0] Pricing Aggression - New entrant price:", newEntrantPrice)

  // Calculate how far below market this new entrant is priced
  const percentBelowMarket = (marketAverage - newEntrantPrice) / marketAverage
  console.log("[v0] Pricing Aggression - Percent below market:", percentBelowMarket)

  // Penalty: 5 points for every 1% below market
  const penalty = percentBelowMarket * 500
  const score = Math.max(0, Math.min(100, 100 - penalty))

  console.log("[v0] Pricing Aggression - Penalty:", penalty, "Final Score:", score)

  return score
}

/**
 * FINANCIAL BUFFER (AM Best Rating)
 * Flattened scoring: All A-tier ratings are treated equally (only matters if B+ or below)
 */
function ratingToScore(rating: string): number {
  const r = rating.toUpperCase().replace(/[^A-Z+-]/g, "")

  if (r.startsWith("A")) return 90

  if (r.startsWith("B++")) return 75
  if (r.startsWith("B+")) return 70
  if (r.startsWith("B")) return 60
  return 40
}

/**
 * HELPER: Calculate simple average rate increase
 */
function calculateAverageIncrease(rateIncreases?: RateIncrease[]): number {
  if (!rateIncreases || rateIncreases.length === 0) return 0

  const recentIncreases = rateIncreases.slice(-5)

  const increases = recentIncreases.map((r) => {
    const val = r.increase || r.rate_increase || 0
    return val > 1 ? val / 100 : val
  })

  if (increases.length === 0) return 0

  const sum = increases.reduce((acc, i) => acc + i, 0)
  return (sum / increases.length) * 100 // Return as percentage
}

function calculateEWMAVolatility(rateIncreases?: RateIncrease[]): number {
  if (!rateIncreases || rateIncreases.length < 2) return 0

  const recentIncreases = rateIncreases.slice(-5)

  const increases = recentIncreases
    .map((r) => {
      const val = r.increase || r.rate_increase || 0
      return val > 1 ? val / 100 : val
    })
    .filter((i) => i >= 0)
    .reverse() // Most recent first

  if (increases.length < 2) return 0

  // EWMA with alpha = 0.3 (30% weight on new, 70% on previous)
  let ewma = increases[0] // Start with most recent
  for (let i = 1; i < increases.length; i++) {
    ewma = 0.3 * increases[i] + 0.7 * ewma
  }

  return ewma * 100 // Return as percentage
}
