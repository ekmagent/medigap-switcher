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
  // Check URL param first (fresh click)
  const params = new URLSearchParams(window.location.search)
  const fbclid = params.get("fbclid")
  if (fbclid) {
    return `fb.1.${Date.now()}.${fbclid}`
  }
  // Fall back to cookie (returning visitor)
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/)
    return match?.[1] || undefined
  }
  return undefined
}
