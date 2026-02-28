// Utility to map legal carrier names to simplified display names and logos

interface CarrierMapping {
  displayName: string
  logoUrl?: string
}

// Comprehensive carrier name mappings
const carrierMappings: Record<string, CarrierMapping> = {
  // AARP / UnitedHealthcare
  "AARP Medicare Supplement Insurance Plans, insured by United Healthcare Insurance Company of America": {
    displayName: "AARP/UnitedHealthcare",
    logoUrl: "/images/aarp-uhc-logo.png",
  },
  "UnitedHealthcare Ins Co": {
    displayName: "AARP/UnitedHealthcare",
    logoUrl: "/images/aarp-uhc-logo.png",
  },

  // Cigna
  Cigna: {
    displayName: "Cigna",
    logoUrl: "/images/cignams.gif",
  },
  "Cigna National Health Ins Co": {
    displayName: "Cigna",
    logoUrl: "/images/cignams.gif",
  },
  "Cigna Hlth Ins Co": {
    displayName: "Cigna",
    logoUrl: "/images/cignams.gif",
  },

  // Humana
  "Humana Insurance Company": {
    displayName: "Humana",
    logoUrl: "/images/humanamedicare.png",
  },
  "Humana Ins Co": {
    displayName: "Humana",
    logoUrl: "/images/humanamedicare.png",
  },

  // Mutual of Omaha
  "United World Life Ins Co": {
    displayName: "Mutual of Omaha",
    logoUrl: "/images/moo-ms.jpg",
  },

  // Ace/Chubb
  "Insurance Co of N Amer": {
    displayName: "Ace/Chubb",
    logoUrl: "/images/ace.svg",
  },
  "Insurance Company of North America": {
    displayName: "Ace/Chubb",
    logoUrl: "/images/ace.svg",
  },
  ICNA: {
    displayName: "Ace/Chubb",
    logoUrl: "/images/ace.svg",
  },
  ACE: {
    displayName: "Ace/Chubb",
    logoUrl: "/images/ace.svg",
  },
  Chubb: {
    displayName: "Ace/Chubb",
    logoUrl: "/images/ace.svg",
  },

  // Aetna
  "Aetna Hlth Ins Co": {
    displayName: "Aetna",
    logoUrl: "/images/aetnaahic.jpeg",
  },
  "Aetna Health Insurance Co": {
    displayName: "Aetna",
    logoUrl: "/images/aetnaahic.jpeg",
  },
  "Aetna Health and Life Insurance Company": {
    displayName: "Aetna",
    logoUrl: "/images/aetnaahlic.jpeg",
  },
  "American Continental Insurance Company": {
    displayName: "Aetna",
    logoUrl: "/images/aetnaaci.jpeg",
  },
  "Continental Life Insurance Company of Brentwood Tennessee": {
    displayName: "Aetna",
    logoUrl: "/images/aetnacli.jpeg",
  },

  // Bankers Fidelity
  "Bankers Fidelity Life Insurance Company": {
    displayName: "Bankers Fidelity",
    logoUrl: "/images/bankers-fidelity.png",
  },
  "Bankers Fidelity Assur Co": {
    displayName: "Bankers Fidelity",
    logoUrl: "/images/bankers-fidelity.png",
  },
  "Atlantic Capital Life Ins Co": {
    displayName: "Bankers Fidelity",
    logoUrl: "/images/bankers-fidelity.png",
  },
  "Atlantic Capital Life Insurance Company": {
    displayName: "Bankers Fidelity",
    logoUrl: "/images/bankers-fidelity.png",
  },
  "Atlantic Capital Life Assur Co": {
    displayName: "Bankers Fidelity",
    logoUrl: "/images/bankers-fidelity.png",
  },
  "Atlantic Capital Life Assur Co (N)": {
    displayName: "Bankers Fidelity",
    logoUrl: "/images/bankers-fidelity.png",
  },

  // Washington National
  "Washington Natl Ins Co": {
    displayName: "Washington National",
  },
  "Washington National Insurance Company": {
    displayName: "Washington National",
  },

  // Horizon
  "Horizon Hlthcare Serv Inc": {
    displayName: "Horizon Healthcare",
  },
  "Horizon Healthcare Services Inc": {
    displayName: "Horizon Healthcare",
  },

  // Transamerica
  "Transamerica Life Ins Co": {
    displayName: "Transamerica",
  },

  // United American
  "United Amer Ins Co": {
    displayName: "United American",
  },

  // Manhattan Life
  "ManhattanLife Insurance and Annuity Company": {
    displayName: "Manhattan Life",
    logoUrl: "/images/manhattanlife.jpg",
  },

  // Allstate
  "Allstate Benefits": {
    displayName: "Allstate Benefits",
    logoUrl: "/images/allstatebenefits.gif",
  },

  // American Benefit Life
  "American Benefit Life Ins Co": {
    displayName: "American Benefit Life",
  },

  // Medico
  "Medico Ins Co": {
    displayName: "Medico",
  },
  "Medico Life and Health Ins Co": {
    displayName: "Wellabe",
  },
  "Medico Life and Health Insurance Company": {
    displayName: "Wellabe",
  },

  // WoodmenLife
  WoodmenLife: {
    displayName: "WoodmenLife",
  },
}

// Common suffixes to remove
const suffixesToRemove = [
  /\s+Insurance Company of America$/i,
  /\s+Insurance Company$/i,
  /\s+Ins Co$/i,
  /\s+Life Insurance Company$/i,
  /\s+Life Ins Co$/i,
  /\s+Health and Life Insurance Company$/i,
  /\s+Hlthcare Serv Inc$/i,
  /\s+Healthcare Services Inc$/i,
  /\s+Amer Ins Co$/i,
  /\s+Insurance and Annuity Company$/i,
]

// Common abbreviations to expand
const abbreviationsToExpand: Record<string, string> = {
  Hlth: "Health",
  Hlthcare: "Healthcare",
  Natl: "National",
  Amer: "American",
  Ins: "Insurance",
  Co: "Company",
  Assur: "Assurance",
  BCBS: "Blue Cross Blue Shield",
}

/**
 * Normalizes carrier names by removing common legal suffixes and expanding abbreviations
 */
function normalizeCarrierName(name: string): string {
  let normalized = name

  // Remove common suffixes
  for (const suffix of suffixesToRemove) {
    normalized = normalized.replace(suffix, "")
  }

  // Expand common abbreviations (for display purposes)
  for (const [abbr, full] of Object.entries(abbreviationsToExpand)) {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi")
    normalized = normalized.replace(regex, full)
  }

  // Clean up extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim()

  return normalized
}

/**
 * Maps a legal carrier name to a simplified display name and logo URL
 */
export function getCarrierDisplayInfo(legalName: string): CarrierMapping {
  // Check for exact match first (most accurate)
  if (carrierMappings[legalName]) {
    return carrierMappings[legalName]
  }

  const lowerLegalName = legalName.toLowerCase()

  // Handle BCBS variations
  if (lowerLegalName.includes("bcbs") || lowerLegalName.includes("blue cross blue shield")) {
    return {
      displayName: "Blue Cross Blue Shield",
    }
  }

  // Handle Tier One as Aflac
  if (lowerLegalName.includes("tier one") || lowerLegalName.includes("tierone")) {
    return {
      displayName: "Aflac",
    }
  }

  // Check for partial matches using lowercase comparison
  for (const [key, value] of Object.entries(carrierMappings)) {
    if (lowerLegalName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerLegalName)) {
      return value
    }
  }

  // Fallback: Normalize the name automatically
  const normalized = normalizeCarrierName(legalName)

  return {
    displayName: normalized || legalName,
  }
}
