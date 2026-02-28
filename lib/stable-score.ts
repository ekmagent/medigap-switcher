/**
 * StableScore (MRSS - Market Rate Stability Score) Calculation Engine
 * 
 * A proprietary algorithm that predicts long-term Medicare Supplement plan stability
 * using two different models based on carrier maturity:
 * 
 * 1. New Entrant Model - For carriers with <3 years of rate history
 * 2. Established Carrier Model - For carriers with 3+ years of rate history
 */

export interface StableScoreComponents {
  lossRatioGap?: number // 0-100 (Component 1)
  rateVolatility?: number // 0-100 (Component 2)
  riskPoolStability?: number // 0-100 (Component 3)
  financialBuffer: number // 0-100 (Component 4)
  pricingAggression?: number // 0-100 (New Entrant only)
}

export interface StableScoreResult {
  score: number // Final StableScore (0-100)
  components: StableScoreComponents
  model: 'new-entrant' | 'established'
  weightsUsed: Record<string, number>
}

function isNewEntrant(quote: {
  rateIncreases?: any[]
}): boolean {
  const rateHistory = quote.rateIncreases || []
  
  // If they have less than 3 years of rate history, they can't be scored as established
  if (rateHistory.length < 3) {
    console.log(`[v0] Carrier has only ${rateHistory.length} years of rate history - treating as new entrant`)
    return true
  }
  
  return false
}

function calculatePricingAggression(
  carrierPremium: number,
  nextCheapestEstablished: number | null
): number {
  
  // If no established carriers exist, can't judge teaser pricing
  if (!nextCheapestEstablished || nextCheapestEstablished === 0) {
    return 100 // Neutral score when no comparison available
  }
  
  const percentDiff = ((carrierPremium - nextCheapestEstablished) / nextCheapestEstablished) * 100
  
  // At or above next cheapest established = 100 points (safe pricing)
  if (percentDiff >= 0) return 100
  
  // 0-20% below next cheapest = still reasonable, full points
  if (Math.abs(percentDiff) <= 20) return 100
  
  // More than 20% below next cheapest = likely teaser rate, penalize heavily
  // For every 1% beyond 20%, lose 10 points
  const excessDiscount = Math.abs(percentDiff) - 20
  const score = 100 - (excessDiscount * 10)
  return Math.max(0, score)
}

function calculateLossRatioGap(premiums: number, claims: number): number {
  if (premiums === 0) return 50

  const actualLR = (claims / premiums) * 100
  const targetLR = 75
  const lrGap = actualLR - targetLR
  
  // Stable Zone: lrGap ≤ 0% (actual ≤ 75%)
  if (lrGap <= 0) return 100
  
  // Warning Zone: 0-10% gap (75-85% actual)
  if (lrGap <= 10) return 100 - (lrGap * 5)
  
  // Danger Zone: 10-15% gap (85-90% actual) - penalized 2x
  if (lrGap <= 15) return 50 - ((lrGap - 10) * 10)
  
  // Fire Zone: >15% gap (>90% actual)
  return 0
}

function calculateRateVolatility(rateIncreases: any[]): number {
  if (!rateIncreases || rateIncreases.length === 0) {
    return 70 // Default for no history
  }

  // Extract rate increase percentages
  const increases = rateIncreases
    .map((inc: any) => {
      const rate = inc.rate_increase || inc.increase || 0
      return typeof rate === 'number' ? rate : parseFloat(rate) || 0
    })
    .filter((rate: number) => !isNaN(rate))

  if (increases.length === 0) return 70

  // Calculate EWMA (Exponentially Weighted Moving Average)
  // α = 0.3 gives 30% weight to most recent increase
  let ewma = increases[0]
  const alpha = 0.3
  
  for (let i = 1; i < increases.length; i++) {
    ewma = alpha * increases[i] + (1 - alpha) * ewma
  }
  
  // Convert EWMA to score
  // Lower EWMA (lower avg increases) = higher score
  const score = 100 - (ewma * 100 * 10)
  return Math.max(0, Math.min(100, score))
}

function calculateFinancialBuffer(rating?: string): number {
  const ratingMap: Record<string, number> = {
    'A++': 100,
    'A+': 100,
    'A': 90,
    'A-': 85,
    'B++': 75,
    'B+': 70,
    'B': 65,
    'B-': 60,
    'NR': 70, // Not rated - neutral
    '': 70
  }
  return ratingMap[rating || 'NR'] || 70
}

export function calculateStableScore(
  data: {
    premiums?: number
    claims?: number
    rateIncreases?: any[]
    amBestRating?: string
    spRating?: string
    monthlyPremium?: number
    nextCheapestEstablished?: number | null // Changed from marketAverage
  }
): StableScoreResult {
  const isNew = isNewEntrant({
    rateIncreases: data.rateIncreases
  })

  if (isNew) {
    // NEW ENTRANT MODEL
    const pricingAggression = calculatePricingAggression(
      data.monthlyPremium || 0,
      data.nextCheapestEstablished || null // Use next cheapest established
    )
    const financialBuffer = calculateFinancialBuffer(data.amBestRating)

    const score = Math.round(
      (pricingAggression * 0.60) + (financialBuffer * 0.40)
    )

    return {
      score: Math.max(0, Math.min(100, score)),
      components: {
        pricingAggression: Math.round(pricingAggression),
        financialBuffer: Math.round(financialBuffer)
      },
      model: 'new-entrant',
      weightsUsed: {
        pricingAggression: 0.60,
        financialBuffer: 0.40
      }
    }
  } else {
    // ESTABLISHED CARRIER MODEL with dynamic reweighting
    const components: StableScoreComponents = {
      financialBuffer: calculateFinancialBuffer(data.amBestRating)
    }
    
    const weights: Record<string, number> = {}
    let totalWeight = 0

    // Component 1: Loss Ratio Gap (40% base weight)
    const hasLossRatioData = data.premiums && data.premiums > 0 && 
                              data.claims && data.claims > 0
    if (hasLossRatioData) {
      components.lossRatioGap = calculateLossRatioGap(data.premiums!, data.claims!)
      weights.lossRatioGap = 0.40
      totalWeight += 0.40
    }

    // Component 2: Rate Volatility (25% base weight)
    if (data.rateIncreases && data.rateIncreases.length > 0) {
      components.rateVolatility = calculateRateVolatility(data.rateIncreases)
      weights.rateVolatility = 0.25
      totalWeight += 0.25
    }

    // Component 3: Risk Pool Stability (20% base weight)
    // NOT IMPLEMENTED - skip for now
    // weights.riskPoolStability = 0.20
    // totalWeight += 0.20

    // Component 4: Financial Buffer (15% base weight)
    weights.financialBuffer = 0.15
    totalWeight += 0.15

    // Dynamic reweighting - redistribute missing component weights proportionally
    const finalWeights: Record<string, number> = {}
    Object.keys(weights).forEach(key => {
      finalWeights[key] = weights[key] / totalWeight
    })

    // Calculate weighted score
    let score = 0
    if (components.lossRatioGap !== undefined) {
      score += components.lossRatioGap * finalWeights.lossRatioGap
    }
    if (components.rateVolatility !== undefined) {
      score += components.rateVolatility * finalWeights.rateVolatility
    }
    score += components.financialBuffer * finalWeights.financialBuffer

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      components: {
        lossRatioGap: components.lossRatioGap ? Math.round(components.lossRatioGap) : undefined,
        rateVolatility: components.rateVolatility ? Math.round(components.rateVolatility) : undefined,
        financialBuffer: Math.round(components.financialBuffer)
      },
      model: 'established',
      weightsUsed: finalWeights
    }
  }
}

export function calculatePersonalizationBoost(
  quote: {
    carrierName: string
    planName: string
    stableScore: number
    monthlyPremium: number
  },
  userPreferences?: {
    planPreference?: string // 'G' or 'N'
    specificCompany?: string
    companyPreference?: 'stability' | 'brand' | 'price'
  },
  allQuotes?: { monthlyPremium: number }[]
): number {
  if (!userPreferences) return 0

  let boost = 0

  // Plan Preference Match (+5 points)
  if (
    userPreferences.planPreference &&
    quote.planName?.toUpperCase().includes(userPreferences.planPreference.toUpperCase())
  ) {
    boost += 5
  }

  // Specific Company Match (+5 points)
  if (userPreferences.specificCompany) {
    const companyLower = quote.carrierName?.toLowerCase() || ''
    const prefLower = userPreferences.specificCompany.toLowerCase()
    
    if (companyLower.includes(prefLower)) {
      boost += 5
    }
  }

  // Company Preference Alignment (varies by type)
  if (userPreferences.companyPreference && !userPreferences.specificCompany) {
    switch (userPreferences.companyPreference) {
      case 'stability':
        if (quote.stableScore >= 85) {
          boost += 5
        }
        break

      case 'brand':
        const nationalBrands = [
          'aarp', 'united healthcare', 'aetna', 'mutual of omaha',
          'humana', 'cigna', 'anthem', 'blue cross'
        ]
        const carrierLower = quote.carrierName?.toLowerCase() || ''
        if (nationalBrands.some(brand => carrierLower.includes(brand))) {
          boost += 5
        }
        break

      case 'price':
        if (allQuotes && allQuotes.length > 0) {
          const avgPrice = allQuotes.reduce((sum, q) => sum + q.monthlyPremium, 0) / allQuotes.length
          if (quote.monthlyPremium < avgPrice * 0.9) {
            boost += 3
          }
        }
        break
    }
  }

  return Math.min(10, boost)
}
