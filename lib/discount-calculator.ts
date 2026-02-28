/**
 * Utility to calculate if user qualifies for discounts based on household data
 */

export interface DiscountEligibility {
  roommateDiscount: boolean
  multiInsuredDiscount: boolean
  oldestHouseholdAge: number | null
}

export function calculateDiscountEligibility(formData: {
  hasHouseholdMember: string
  oldestHouseholdAge: string
  sameCompanyInsurance: string
}): DiscountEligibility {
  const hasHousehold = formData.hasHouseholdMember === 'yes'
  const age = formData.oldestHouseholdAge ? parseInt(formData.oldestHouseholdAge) : null
  const sameCompany = formData.sameCompanyInsurance === 'yes'

  return {
    roommateDiscount: hasHousehold && age !== null && age >= 50,
    multiInsuredDiscount: hasHousehold && sameCompany,
    oldestHouseholdAge: age
  }
}

export function applyDiscount(
  basePremium: number,
  discounts: Array<{ name: string; type: 'percent' | 'dollar'; value: number }>,
  discountCategory: string | undefined,
  eligibility: DiscountEligibility
): { discountedPremium: number; appliedDiscount: { name: string; amount: number } | null } {
  if (!discounts || discounts.length === 0 || !discountCategory) {
    return { discountedPremium: basePremium, appliedDiscount: null }
  }

  // Check if user qualifies for this discount type
  const categoryLower = discountCategory.toLowerCase()
  let qualifies = false

  if (categoryLower.includes('roommate') || categoryLower.includes('household')) {
    qualifies = eligibility.roommateDiscount
  } else if (categoryLower.includes('multi') || categoryLower.includes('insured')) {
    qualifies = eligibility.multiInsuredDiscount
  }

  if (!qualifies) {
    return { discountedPremium: basePremium, appliedDiscount: null }
  }

  // Apply first discount found
  const discount = discounts[0]
  let discountedPremium = basePremium
  let discountAmount = 0

  if (discount.type === 'percent') {
    discountAmount = basePremium * discount.value
    discountedPremium = basePremium - discountAmount
  } else if (discount.type === 'dollar') {
    discountAmount = discount.value
    discountedPremium = basePremium - discount.value
  }

  return {
    discountedPremium: Math.max(0, discountedPremium),
    appliedDiscount: {
      name: discount.name || discountCategory,
      amount: discountAmount
    }
  }
}
