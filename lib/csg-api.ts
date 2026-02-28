/**
 * CSG API Integration
 * Handles authentication and quote fetching from CSG API
 */

import { getValidCSGToken, forceRefreshCSGToken } from "./csg-token-manager"
import { isCarrierAllowed, getFilterStats } from "./carrier-whitelist"

const CSG_BASE_URL = "https://api.csgactuarial.com/v1"

/**
 * Fetch quotes from CSG API
 * Uses database-backed token management to avoid hitting session limits
 */
export async function fetchCSGQuotes(params: {
  zip: string
  age: number
  gender: "M" | "F"
  plan?: string
  tobacco: boolean
  effectiveDate?: string
}): Promise<{ quotes: any[]; loggingKey: string | null; state: string | null }> {
  console.log("[v0] CSG: Fetching quotes with params:", params)

  let token = await getValidCSGToken()

  const queryParams = new URLSearchParams({
    zip5: params.zip,
    age: params.age.toString(),
    gender: params.gender,
    tobacco: params.tobacco.toString(),
    apply_discounts: "0",
  })

  if (params.plan) {
    queryParams.append("plan", params.plan)
  }

  if (params.effectiveDate) {
    queryParams.append("effective_date", params.effectiveDate)
    console.log("[v0] CSG: Including effective_date:", params.effectiveDate)
  }

  const url = `${CSG_BASE_URL}/med_supp/quotes.json?${queryParams.toString()}`

  console.log("[v0] CSG: Fetching quotes")

  const fetchStartTime = Date.now()
  let response = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-token": token,
      "Content-Type": "application/json",
    },
  })

  const fetchTime = Date.now() - fetchStartTime
  console.log(`[v0] CSG: Quote request completed in ${fetchTime}ms with status ${response.status}`)

  if (response.status === 401 || response.status === 403) {
    const errorText = await response.text()
    console.log("[v0] CSG: Auth failed:", response.status)
    console.log("[v0] CSG: Error message:", errorText.substring(0, 500))

    if (errorText.includes("Max Session Reached") || errorText.includes("maximum number of sessions")) {
      throw new Error(
        "CSG API: Maximum sessions reached (5). Please close old sessions at https://tools.csgactuarial.com/auth/manage-account/sessions",
      )
    }

    console.log("[v0] CSG: Token expired by CSG server (Session Expired), forcing refresh...")
    try {
      token = await forceRefreshCSGToken()
      console.log("[v0] CSG: New token obtained, retrying quote request...")
    } catch (refreshError) {
      console.error("[v0] CSG: Token refresh failed:", refreshError)
      throw new Error(`CSG API: Failed to refresh expired session. ${refreshError instanceof Error ? refreshError.message : String(refreshError)}`)
    }

    const retryStartTime = Date.now()
    response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
    })
    const retryTime = Date.now() - retryStartTime
    console.log(`[v0] CSG: Retry completed in ${retryTime}ms with status ${response.status}`)

    if (response.status === 401 || response.status === 403) {
      const retryErrorText = await response.text()
      console.error("[v0] CSG: Retry also failed with auth error:", retryErrorText.substring(0, 500))
      throw new Error("CSG API: Session expired and retry failed. The API may be temporarily unavailable.")
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] CSG: Quote fetch failed:", response.status)
    console.error("[v0] CSG: Error details:", errorText.substring(0, 500))
    throw new Error(`CSG quotes API failed: ${response.status} - ${errorText}`)
  }

  const loggingKey = response.headers.get("csg-log-key") || response.headers.get("csg-log-uuid")
  console.log("[v0] CSG: Logging key from headers:", loggingKey ? "Found" : "Not found")

  const data = await response.json()

  console.log(`[v0] CSG: Successfully fetched ${data?.length || 0} quotes`)

  const state = data && data.length > 0 ? data[0].state : null
  console.log("[v0] CSG: Quote state:", state)

  if (data && data.length > 0) {
    console.log(`[v0] CSG: First quote carrier: ${data[0].company_base?.name}, plan: ${data[0].plan}`)
  }

  return {
    quotes: data,
    loggingKey: loggingKey,
    state: state,
  }
}

/**
 * Convert CSG quote data format
 * - Convert rate.month from cents to dollars
 * - Retain raw data for StableScore calculation
 * - Preserve quote_key and e-app metadata for enrollment application creation
 * - Filter to only allowed carriers based on whitelist
 */
export function processCSGQuotes(rawQuotes: any[], loggingKey: string | null): any[] {
  if (!Array.isArray(rawQuotes)) {
    return []
  }

  const filterStats = getFilterStats(rawQuotes)

  console.log("[v0] ========================================")
  console.log("[v0] CSG CARRIER FILTER REPORT")
  console.log("[v0] ========================================")
  console.log("[v0] Total quotes received:", filterStats.total)
  console.log("[v0] Allowed quotes:", filterStats.allowed)
  console.log("[v0] Filtered out:", filterStats.filtered)

  if (filterStats.filteredCarriers.length > 0) {
    console.log("[v0]")
    console.log("[v0] ⚠️  FILTERED CARRIERS - Review and add to whitelist if needed:")
    console.log("[v0] ========================================")
    filterStats.filteredCarriers.forEach((carrier) => {
      console.log(`[v0] 📋 ${carrier.name}`)
      console.log(`[v0]    NAIC: ${carrier.naic || "N/A"}`)
      console.log(`[v0]    Quotes: ${carrier.count}`)
      console.log("[v0]    ---")
    })
    console.log("[v0] ========================================")
  }

  const allowedQuotes = rawQuotes.filter((quote) => {
    const carrierName = quote.company_base?.name
    return isCarrierAllowed(carrierName)
  })

  console.log("[v0] Processing", allowedQuotes.length, "allowed quotes")

  const processedQuotes = allowedQuotes.map((quote: any) => {
    const monthlyPremium = quote.rate?.month ? quote.rate.month / 100 : 0

    return {
      ...quote,
      rate: {
        ...quote.rate,
        month: monthlyPremium,
        monthCents: quote.rate?.month || 0,
      },
      quoteKey: quote.key || null,
      loggingKey: loggingKey,
      hasEapp: quote.contextual_data?.has_eapp || false,
      companyNaic: quote.company_base?.naic || null,
      discounts: quote.discounts || [],
      discountCategory: quote.discount_category || null,
      fees: quote.fees || [],
      // Retain raw data for StableScore calculation
      rate_increases: quote.rate_increases || [],
      med_supp_state_market_data: quote.company_base?.med_supp_state_market_data || [],
      viewType: quote.view_type || [], // Added view_type to processed quotes
    }
  })

  return processedQuotes
}
