/**
 * Client-side helpers for Facebook CAPI tracking.
 * No pixel script is loaded — these just read browser identifiers
 * to pass along to server-side CAPI routes for better matching.
 */

export function generateEventId(): string {
  return crypto.randomUUID()
}

export function getFbp(): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/)
  return match?.[1] || undefined
}

export function getFbc(): string | undefined {
  if (typeof window === "undefined") return undefined
  // Check URL param first (fresh click) and persist it
  const params = new URLSearchParams(window.location.search)
  const fbclid = params.get("fbclid")
  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`
    try { sessionStorage.setItem("_fbc", fbc) } catch {}
    return fbc
  }
  // Check sessionStorage (persisted from landing page)
  try {
    const stored = sessionStorage.getItem("_fbc")
    if (stored) return stored
  } catch {}
  // Fall back to cookie (returning visitor with pixel)
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/)
    return match?.[1] || undefined
  }
  return undefined
}
