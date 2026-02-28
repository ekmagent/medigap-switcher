import { type NextRequest, NextResponse } from "next/server"
import { fetchCSGQuotes, processCSGQuotes } from "@/lib/csg-api"
import { calculateStableScore } from "@/lib/stable-score-v2"
import { calculatePersonalizationBoost } from "@/lib/stable-score"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const maxDuration = 30

/**
 * POST /api/quotes
 * Fetch Medigap quotes from CSG API with StableScore calculation
 *
 * Request body:
 * {
 *   zipCode: string,
 *   age: number,
 *   gender: 'Male' | 'Female',
 *   tobacco: boolean,
 *   planType?: string,  // Optional filter
 *   userPreferences?: {
 *     planPreference?: string,
 *     specificCompany?: string,
 *     companyPreference?: string
 *   },
 *   hasHouseholdMember?: string // Added household discount eligibility
 * }
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
  })

  if (!rateLimitResult.success) {
    console.log(`[v0] Rate limit exceeded for IP: ${clientIp}`)
    return NextResponse.json(
      {
        error: "Too many requests. Please try again in a few minutes.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      },
    )
  }

  try {
    console.log("[v0] API: Received quote request")
    const body = await req.json()

    const {
      zipCode,
      age,
      gender,
      tobacco,
      planType,
      userPreferences = {},
      hasHouseholdMember,
      sameCompanyInsurance,
      effectiveDate,
    } = body

    console.log("[v0] API: Request parameters:", {
      zipCode,
      age,
      gender,
      tobacco,
      planType,
      userPreferences,
      hasHouseholdMember,
      sameCompanyInsurance,
      effectiveDate,
    })

    // Validate required fields
    if (!zipCode || !age || !gender) {
      console.error("[v0] API: Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: zipCode, age, and gender are required" },
        { status: 400 },
      )
    }

    // Validate age is reasonable for Medicare (65+)
    if (age < 50 || age > 120) {
      console.error("[v0] API: Invalid age:", age)
      return NextResponse.json({ error: "Age must be between 50 and 120" }, { status: 400 })
    }

    const genderCode = gender.toLowerCase() === "male" || gender === "M" ? "M" : "F"

    console.log("[v0] API: Calling CSG API...")
    const csgFetchStart = Date.now()

    const {
      quotes: rawQuotes,
      loggingKey,
      state,
    } = await fetchCSGQuotes({
      zip: zipCode,
      age: Number.parseInt(age),
      gender: genderCode,
      plan: planType,
      tobacco: tobacco === true || tobacco === "true",
      effectiveDate: effectiveDate,
    })

    const csgFetchTime = Date.now() - csgFetchStart
    console.log(`[v0] API: CSG fetch completed in ${csgFetchTime}ms`)
    console.log(`[v0] API: Quote state: ${state}`)
    console.log(`[v0] API: Logging key for e-app:`, loggingKey ? "Captured" : "Missing")

    const processStart = Date.now()
    const processedQuotes = processCSGQuotes(rawQuotes, loggingKey)
    const processTime = Date.now() - processStart
    console.log(`[v0] API: Processed ${processedQuotes.length} quotes in ${processTime}ms`)

    let eligibleQuotes = processedQuotes.filter((quote) => {
      const viewType = quote.viewType || []
      if (viewType.includes("with_hhd")) return false
      return true
    })

    // Apply manual discounts ONLY when HHD is enabled
    if (hasHouseholdMember === "yes") {
      eligibleQuotes = eligibleQuotes.map((quote) => {
        if (quote.discounts && quote.discounts.length > 0) {
          let totalDiscountAmountCents = 0
          const baseRateCents = quote.rate?.monthCents || 0
          let appliedDiscountName = null

          for (const discount of quote.discounts) {
            const category = (discount.category || quote.discountCategory || "").toLowerCase()
            const isRoommateDiscount = category.includes("roommate")
            const isMultiOrHouseholdDiscount = category.includes("multi") || category.includes("household")

            if (isMultiOrHouseholdDiscount && !isRoommateDiscount) {
              if (sameCompanyInsurance !== "yes") {
                console.log(
                  `[v0] Skipping ${category} discount for ${quote.company_base?.name} (Requires same company insurance)`,
                )
                continue
              }
            }

            if (discount.type === "percent") {
              let multiplier = discount.value
              if (multiplier > 1) {
                multiplier = multiplier / 100
              }
              const amount = baseRateCents * multiplier
              totalDiscountAmountCents += amount
              if (!appliedDiscountName) appliedDiscountName = discount.category || quote.discountCategory
            } else if (discount.type === "dollar" || discount.type === "fixed") {
              totalDiscountAmountCents += discount.value * 100
              if (!appliedDiscountName) appliedDiscountName = discount.category || quote.discountCategory
            }
          }

          const discountedRateCents = Math.max(0, baseRateCents - totalDiscountAmountCents)
          const discountedRate = discountedRateCents / 100
          const baseRate = baseRateCents / 100
          const totalDiscountAmount = totalDiscountAmountCents / 100

          if (totalDiscountAmountCents > 0) {
            console.log(
              `[v0] Applied manual discount for ${quote.company_base?.name}: Base $${baseRate} - Discount $${totalDiscountAmount.toFixed(2)} = Final $${discountedRate.toFixed(2)} (Category: ${appliedDiscountName || quote.discountCategory || "Unknown"})`,
            )

            return {
              ...quote,
              rate: {
                ...quote.rate,
                month: discountedRate,
              },
              discountApplied: true,
              originalRate: baseRate,
              discountCategory: appliedDiscountName || quote.discountCategory,
            }
          }
        }

        return quote
      })
    }

    console.log(`[v0] API: After view_type/discount processing: ${eligibleQuotes.length} eligible quotes`)

    // Deduplicate: Group by carrier and plan, keep the cheapest one
    const quotesByCarrier = new Map<string, typeof eligibleQuotes>()

    for (const quote of eligibleQuotes) {
      const key = `${quote.companyNaic}-${quote.plan}`
      if (!quotesByCarrier.has(key)) {
        quotesByCarrier.set(key, [])
      }
      quotesByCarrier.get(key)!.push(quote)
    }

    eligibleQuotes = []
    for (const [key, quotes] of quotesByCarrier.entries()) {
      const cheapest = quotes.sort((a, b) => (a.rate?.month || 0) - (b.rate?.month || 0))[0]
      eligibleQuotes.push(cheapest)
    }

    console.log(`[v0] API: After deduplication: ${eligibleQuotes.length} eligible quotes`)

    const establishedCarriers = eligibleQuotes
      .filter((quote) => {
        const rateHistory = quote.rate_increases || []
        return rateHistory.length >= 3
      })
      .sort((a, b) => (a.rate?.month || 0) - (b.rate?.month || 0))

    const cheapestEstablishedPrice = establishedCarriers.length > 0 ? establishedCarriers[0].rate?.month : undefined

    console.log("[v0] API: Cheapest established carrier price:", cheapestEstablishedPrice || "None found")

    const enrichedQuotes = eligibleQuotes.map((quote) => {
      const latestMarketData = quote.company_base?.med_supp_market_data?.[0]
      const nationalData = latestMarketData?.med_supp_national_market_data
      const stateData = quote.company_base?.med_supp_state_market_data?.[0]

      const carrierName = quote.company_base?.name || "Unknown"
      const monthlyPremium = quote.rate?.month || 0
      const rating = quote.company_base?.ambest_rating || "NR"

      // Calculate StableScore V2
      const stableScoreResult = calculateStableScore({
        rateIncreases: quote.rate_increases || [],
        premiums: stateData?.premiums,
        claims: stateData?.claims,
        rating: rating,
        monthlyPremium: monthlyPremium,
        cheapestEstablishedPrice: cheapestEstablishedPrice,
      })

      console.log(`[v0] ${carrierName} (${quote.plan}):`, {
        premium: monthlyPremium,
        model: stableScoreResult.model,
        score: stableScoreResult.score,
        components: stableScoreResult.components,
        details: stableScoreResult.details,
      })

      const personalizationBoost = calculatePersonalizationBoost(
        {
          carrierName: carrierName,
          planName: quote.plan || "",
          stableScore: stableScoreResult.score,
          monthlyPremium: monthlyPremium,
        },
        userPreferences,
        eligibleQuotes.map((q) => ({ monthlyPremium: q.rate?.month || 0 })),
      )

      const csgRawData = {
        // Rate history for charts
        rateIncreases: quote.rate_increases || [],

        // National market data
        nationalMarketData: nationalData
          ? {
              premiums: nationalData.premiums,
              claims: nationalData.claims,
              lossRatio:
                nationalData.claims && nationalData.premiums
                  ? ((nationalData.claims / nationalData.premiums) * 100).toFixed(1)
                  : null,
              year: latestMarketData?.year || null,
            }
          : null,

        // State market data
        stateMarketData: stateData || null,

        // Company details
        companyDetails: {
          name: carrierName,
          naic: quote.company_base?.naic || null,
          amBestRating: rating,
          amBestRatingDate: quote.company_base?.ambest_rating_date || null,
        },

        // Plan details
        planDetails: {
          plan: quote.plan,
          effectiveDate: effectiveDate,
          quoteKey: quote.quoteKey,
          loggingKey: quote.loggingKey,
          hasEapp: quote.hasEapp,
        },

        // Discount info
        discountInfo: {
          discounts: quote.discounts || [],
          discountCategory: quote.discountCategory || null,
          discountApplied: quote.discountApplied || false,
          originalRate: quote.originalRate || null,
        },

        // Fees
        fees: quote.fees || [],
      }

      return {
        carrierName: carrierName,
        planName: quote.plan || "",
        monthlyPremium: monthlyPremium,
        stableScore: stableScoreResult.score,
        finalScore: stableScoreResult.score + personalizationBoost,
        personalizationBoost: personalizationBoost,
        model: stableScoreResult.model,
        // V2 components
        rateVolatility: stableScoreResult.components.rateVolatility,
        lossRatioGap: stableScoreResult.components.lossRatioGap,
        financialStrength: stableScoreResult.components.financialBuffer,
        pricingAggression: stableScoreResult.components.pricingAggression,
        // Details for transparency
        rateHistoryYears: stableScoreResult.details.rateHistoryYears,
        avgRateIncrease: stableScoreResult.details.avgRateIncrease,
        lossRatioPercent: stableScoreResult.details.lossRatioPercent,
        isTeaserRate: stableScoreResult.details.isTeaserRate,
        amBestRating: rating,
        // Original data
        rateIncreases: quote.rate_increases || [],
        quoteKey: quote.quoteKey,
        loggingKey: quote.loggingKey,
        hasEapp: quote.hasEapp,
        companyNaic: quote.companyNaic,
        discounts: quote.discounts || [],
        discountCategory: quote.discountCategory || null,
        discountApplied: quote.discountApplied,
        originalRate: quote.originalRate,
        csgRawData: csgRawData,
      }
    })

    // Sort by final score
    const sortedQuotes = enrichedQuotes.sort((a, b) => b.finalScore - a.finalScore)

    console.log(
      "[v0] API: Top 5 quotes:",
      sortedQuotes.slice(0, 5).map((q) => ({
        carrier: q.carrierName,
        plan: q.planName,
        premium: q.monthlyPremium,
        model: q.model,
        stableScore: q.stableScore,
        boost: q.personalizationBoost,
        finalScore: q.finalScore,
      })),
    )

    return NextResponse.json({
      success: true,
      quotingAge: age,
      state: state,
      loggingKey: loggingKey,
      data: {
        quotes: sortedQuotes,
      },
    })
  } catch (error: any) {
    console.error("[v0] API: Error occurred:", error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch quotes",
      },
      { status: 500 },
    )
  }
}
