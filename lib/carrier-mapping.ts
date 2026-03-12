// Utility to map legal carrier names to simplified display names and logos

interface CarrierMapping {
  displayName: string
  logoUrl?: string
}

// NAIC number → CarrierMapping (from naic_whitelist.csv)
const naicMappings: Record<string, CarrierMapping> = {
  // Cigna / HealthSpring
  "65269": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "61727": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "67369": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "88366": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "65722": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "63762": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "62308": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "65498": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95500": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "22675": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "25348": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "12902": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "11524": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "12832": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "11210": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95201": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95104": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95123": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95202": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95125": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95127": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95126": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95128": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95129": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "95415": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "11525": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "14144": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },

  // Aetna
  "78700": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "72052": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "60054": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "63444": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "12321": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "68500": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "90328": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "81973": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "67660": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "16979": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "11531": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "76953": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "97101": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "63479": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "80624": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },

  // Bankers Fidelity
  "61239": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "71919": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "17393": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },

  // Humana
  "84603": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "95642": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "60219": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "73288": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "60052": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "70580": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "12634": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "88595": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "62189": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "95158": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "69671": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "60984": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "12282": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },

  // Mutual of Omaha
  "71412": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "69868": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "72850": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "13100": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "16537": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "62243": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "61751": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "34274": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },

  // Manhattan Life
  "61883": { displayName: "Manhattan Life" },
  "16755": { displayName: "Manhattan Life" },
  "65870": { displayName: "Manhattan Life" },
  "85189": { displayName: "Manhattan Life" },
  "63053": { displayName: "Manhattan Life" },
  "69132": { displayName: "Manhattan Life" },
  "67326": { displayName: "Manhattan Life" },

  // ACE/INA/Chubb
  "20699": { displayName: "Ace/Chubb" },
  "22713": { displayName: "Ace/Chubb" },
  "22667": { displayName: "Ace/Chubb" },
  "20702": { displayName: "Ace/Chubb" },
  "60348": { displayName: "Ace/Chubb" },
  "18279": { displayName: "Ace/Chubb" },
  "43575": { displayName: "Ace/Chubb" },
  "20281": { displayName: "Ace/Chubb" },
  "20303": { displayName: "Ace/Chubb" },
  "20346": { displayName: "Ace/Chubb" },
  "22748": { displayName: "Ace/Chubb" },
  "20397": { displayName: "Ace/Chubb" },
  "21121": { displayName: "Ace/Chubb" },

  // UnitedHealthcare / AARP
  "96016": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "60093": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "84549": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "79413": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "95784": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "62286": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "61832": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "97179": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "91529": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "60321": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "70785": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "71420": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "42765": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },

  // Aflac / Tier One
  "60380": { displayName: "Aflac" },
  "60542": { displayName: "Aflac" },
  "92908": { displayName: "Aflac" },
  "62065": { displayName: "Aflac" },
  "60518": { displayName: "Aflac" },
  "67814": { displayName: "Aflac" },

  // Medico / Wellabe
  "31119": { displayName: "Wellabe" },
  "79987": { displayName: "Wellabe" },
  "65641": { displayName: "Wellabe" },
  "60836": { displayName: "Wellabe" },
  "71480": { displayName: "Wellabe" },
  "70629": { displayName: "Wellabe" },
  "67679": { displayName: "Wellabe" },
}

// Legal company name → CarrierMapping
const carrierMappings: Record<string, CarrierMapping> = {
  // AARP / UnitedHealthcare
  "AARP Medicare Supplement Insurance Plans, insured by United Healthcare Insurance Company of America": {
    displayName: "AARP/UnitedHealthcare",
    logoUrl: "/images/aarp-uhc-logo.png",
  },
  "AARP Medicare Supplement Plans, insured by UnitedHealthcare": {
    displayName: "AARP/UnitedHealthcare",
    logoUrl: "/images/aarp-uhc-logo.png",
  },
  "UnitedHealthcare Ins Co": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "UnitedHealthcare Insurance Company": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "UnitedHealthcare Insurance Company of America": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "UnitedHealthcare Life Insurance Company": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "Golden Rule Insurance Company": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "Chesapeake Life Insurance Company": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },
  "Unimerica Insurance Company": { displayName: "AARP/UnitedHealthcare", logoUrl: "/images/aarp-uhc-logo.png" },

  // Cigna
  Cigna: { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Cigna National Health Ins Co": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Cigna Hlth Ins Co": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Cigna Health and Life Insurance Company": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "CIGNA HEALTH AND LIFE INSURANCE COMPANY": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Connecticut General Life Insurance Company": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Life Insurance Company of North America": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "American Retirement Life Insurance Company": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "AMERICAN RETIREMENT LIFE INSURANCE COMPANY (CIGNA)": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Loyal American Life Insurance Company": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "Medco Containment Life Insurance Company": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "HealthSpring Life & Health Insurance Company, Inc.": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  CHLIC: { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  Healthspring: { displayName: "Cigna", logoUrl: "/images/cignams.gif" },
  "American Retirement Life Insurance": { displayName: "Cigna", logoUrl: "/images/cignams.gif" },

  // Humana
  "Humana Insurance Company": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "Humana Ins Co": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  Humana: { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "Emphesys Insurance Company": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },
  "Wisconsin National Life Insurance Company": { displayName: "Humana", logoUrl: "/images/humanamedicare.png" },

  // Mutual of Omaha
  "United World Life Ins Co": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "United World Life Insurance Company": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "UNITED WORLD LIFE INSURANCE COMPANY": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "Mutual of Omaha Insurance Company": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "MUTUAL OF OMAHA INSURANCE COMPANY": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "United of Omaha Life Insurance Company": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "UNITED OF OMAHA LIFE INSURANCE COMPANY": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "Omaha Insurance Company": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "Omaha Supplemental Insurance Company": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "Companion Life Insurance Company": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "Central States Health & Life Co. of Omaha": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },
  "Central States Indemnity Co. of Omaha": { displayName: "Mutual of Omaha", logoUrl: "/images/moo-ms.jpg" },

  // Ace/Chubb
  "Insurance Co of N Amer": { displayName: "Ace/Chubb" },
  "Insurance Company of North America": { displayName: "Ace/Chubb" },
  "INSURANCE COMPANY OF NORTH AMERICA": { displayName: "Ace/Chubb" },
  ICNA: { displayName: "Ace/Chubb" },
  ACE: { displayName: "Ace/Chubb" },
  Chubb: { displayName: "Ace/Chubb" },
  "ACE American Insurance Company": { displayName: "Ace/Chubb" },
  "ACE Life Insurance Company": { displayName: "Ace/Chubb" },
  "Indemnity Insurance Company of North America": { displayName: "Ace/Chubb" },

  // Aetna
  "Aetna Hlth Ins Co": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Aetna Health Insurance Co": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Aetna Health and Life Insurance Company": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Aetna Hlth and Life Ins Co": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "AETNA HEALTH AND LIFE INSURANCE COMPANY": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "AETNA HEALTH INSURANCE COMPANY": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "AETNA LIFE INSURANCE COMPANY": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "American Continental Insurance Company": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "American Continental Ins Co": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Accendo Insurance Company": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Continental Life Insurance Company of Brentwood Tennessee": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Continental Life Insurance Company of Brentwood, Tennessee": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Continental Life Ins Co of Brentwood Tennessee": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Aetna Insurance Company of America": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "Coventry Health and Life Insurance Company": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },
  "First Health Life & Health Insurance Company": { displayName: "Aetna", logoUrl: "/images/aetnaahic.jpeg" },

  // Bankers Fidelity
  "Bankers Fidelity Life Insurance Company": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "BANKERS FIDELITY LIFE INSURANCE COMPANY": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Bankers Fidelity Assur Co": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Bankers Fidelity Assurance Company": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Atlantic Capital Life Ins Co": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Atlantic Capital Life Insurance Company": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Atlantic Capital Life Assur Co": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Atlantic Capital Life Assur Co (N)": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Atlantic Capital Life Assurance Company": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },
  "Atlantic Capital Life Assurance Company (N)": { displayName: "Bankers Fidelity", logoUrl: "/images/bankers-fidelity.png" },

  // Washington National
  "Washington Natl Ins Co": { displayName: "Washington National" },
  "Washington National Insurance Company": { displayName: "Washington National" },

  // Transamerica
  "Transamerica Life Ins Co": { displayName: "Transamerica" },
  "Transamerica Life Insurance Company": { displayName: "Transamerica" },

  // United American
  "United Amer Ins Co": { displayName: "United American" },
  "United American Insurance Company": { displayName: "United American" },

  // Manhattan Life
  "ManhattanLife Insurance and Annuity Company": { displayName: "Manhattan Life" },
  "ManhattanLife of America Insurance Company": { displayName: "Manhattan Life" },
  "The Manhattan Life Insurance Company": { displayName: "Manhattan Life" },
  "Western United Life Assurance Company": { displayName: "Manhattan Life" },
  "Family Life Insurance Company": { displayName: "Manhattan Life" },
  "State Mutual Insurance Company": { displayName: "Manhattan Life" },
  "Old Surety Life Insurance Company": { displayName: "Manhattan Life" },

  // Allstate / National General
  "Allstate Benefits": { displayName: "Allstate Benefits" },
  "National General": { displayName: "National General" },

  // Aflac / Tier One
  "Tier One Ins Co": { displayName: "Aflac" },
  "Tier One Insurance Company": { displayName: "Aflac" },
  Aflac: { displayName: "Aflac" },
  "American Family Life Assurance Company of Columbus": { displayName: "Aflac" },
  "Continental American Insurance Company": { displayName: "Aflac" },

  // Medico / Wellabe
  "Medico Ins Co": { displayName: "Wellabe" },
  "Medico Corp Life Ins Co": { displayName: "Wellabe" },
  "Medico Insurance Company": { displayName: "Wellabe" },
  "Medico Corp Life Insurance Company": { displayName: "Wellabe" },
  "Medico Life and Health Ins Co": { displayName: "Wellabe" },
  "Medico Life and Health Insurance Company": { displayName: "Wellabe" },
  Wellabe: { displayName: "Wellabe" },
  "American Republic Insurance Company": { displayName: "Wellabe" },
  "American Republic Corp Insurance Company": { displayName: "Wellabe" },
  "Great Western Insurance Company": { displayName: "Wellabe" },
  "World Insurance Company": { displayName: "Wellabe" },

  // WoodmenLife
  WoodmenLife: { displayName: "WoodmenLife" },

  // Heartland National
  "Heartland National Life Ins Co": { displayName: "Heartland National" },
  "Heartland National Life Insurance Company": { displayName: "Heartland National" },

  // American Benefit Life
  "American Benefit Life Ins Co": { displayName: "American Benefit Life" },
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

function normalizeCarrierName(name: string): string {
  let normalized = name
  for (const suffix of suffixesToRemove) {
    normalized = normalized.replace(suffix, "")
  }
  for (const [abbr, full] of Object.entries(abbreviationsToExpand)) {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi")
    normalized = normalized.replace(regex, full)
  }
  return normalized.replace(/\s+/g, " ").trim()
}

const FALLBACK_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#0891b2",
  "#4f46e5", "#0d9488", "#b45309", "#6366f1", "#059669",
]

export function getCarrierLogoFallback(displayName: string): { initial: string; bgColor: string } {
  const initial = displayName.charAt(0).toUpperCase()
  let hash = 0
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const bgColor = FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
  return { initial, bgColor }
}

/**
 * Look up carrier display info by NAIC number (most reliable when available)
 */
export function getCarrierDisplayInfoByNaic(naic: string | number | undefined | null): CarrierMapping | null {
  if (!naic) return null
  return naicMappings[String(naic)] || null
}

/**
 * Maps a legal carrier name (and optionally NAIC) to display name and logo URL.
 * NAIC takes priority when provided.
 */
export function getCarrierDisplayInfo(legalName: string, naic?: string | number | null): CarrierMapping {
  // NAIC lookup first (most accurate)
  if (naic) {
    const byNaic = naicMappings[String(naic)]
    if (byNaic) return byNaic
  }

  // Exact name match
  if (carrierMappings[legalName]) {
    return carrierMappings[legalName]
  }

  const lowerLegalName = legalName.toLowerCase()

  // BCBS variations
  if (lowerLegalName.includes("bcbs") || lowerLegalName.includes("blue cross blue shield")) {
    return { displayName: "Blue Cross Blue Shield" }
  }

  // Tier One → Aflac
  if (lowerLegalName.includes("tier one") || lowerLegalName.includes("tierone")) {
    return { displayName: "Aflac" }
  }

  // Partial name match
  for (const [key, value] of Object.entries(carrierMappings)) {
    if (lowerLegalName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerLegalName)) {
      return value
    }
  }

  // Normalize as fallback
  const normalized = normalizeCarrierName(legalName)
  return { displayName: normalized || legalName }
}
