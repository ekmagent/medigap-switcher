/**
 * Normalize phone number to digits only (10 digits for US)
 * Handles formats like: (856) 888-9080, 856-888-9080, 8568889080, +1-856-888-9080
 */
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // Handle US numbers with country code
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1)
  }

  // Return 10 digit number or null if invalid
  return digits.length === 10 ? digits : null
}

/**
 * Format phone for display: (856) 888-9080
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) return phone || ""

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`
}

/**
 * Mask phone for security: (856) ***-9080
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  const normalized = normalizePhoneNumber(phone)
  if (!normalized) return "***-***-****"

  return `(${normalized.slice(0, 3)}) ***-${normalized.slice(6)}`
}
