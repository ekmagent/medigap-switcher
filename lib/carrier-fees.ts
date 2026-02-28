// Application fees charged by certain carriers (one-time fees)

interface CarrierFee {
  applicationFee?: number
  description?: string
}

// Map display names to their one-time application fees
const carrierFees: Record<string, CarrierFee> = {
  // Aetna charges $20 one-time application fee
  Aetna: {
    applicationFee: 20,
    description: "One-time application fee",
  },

  // Bankers Fidelity (includes Atlantic Capital) charges $25 one-time application fee
  "Bankers Fidelity": {
    applicationFee: 25,
    description: "One-time application fee",
  },
}

/**
 * Get the application fee for a carrier by display name
 * Returns undefined if no fee applies
 */
export function getCarrierApplicationFee(displayName: string): number | undefined {
  return carrierFees[displayName]?.applicationFee
}

/**
 * Get full fee info for a carrier
 */
export function getCarrierFeeInfo(displayName: string): CarrierFee | undefined {
  return carrierFees[displayName]
}

/**
 * Check if a carrier has an application fee
 */
export function hasApplicationFee(displayName: string): boolean {
  return carrierFees[displayName]?.applicationFee !== undefined
}
