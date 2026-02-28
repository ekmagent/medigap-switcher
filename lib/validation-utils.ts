// Validation utility functions for enrollment forms

// ── Name Validation ──────────────────────────────────────────────────────────

// Common fake / test names people type to get past forms
const BLOCKED_NAMES = new Set([
  "test", "testing", "fake", "asdf", "qwerty", "none", "na", "n/a",
  "xxx", "zzz", "aaa", "bbb", "abc", "xyz", "null", "undefined",
  "admin", "user", "guest", "unknown", "anonymous", "sample",
  "hello", "hi", "hey", "no", "yes", "nope",
])

/**
 * Validates a person's name (first or last).
 * Light-touch: catches obvious fakes without blocking legitimate names.
 * Returns { isValid, warning? } — a warning is a soft hint, not a hard block.
 */
export function validateName(name: string): { isValid: boolean; warning?: string } {
  const trimmed = name.trim()

  // Must be at least 2 characters
  if (trimmed.length < 2) {
    return { isValid: false, warning: "Name must be at least 2 characters" }
  }

  // Must not exceed 50 characters
  if (trimmed.length > 50) {
    return { isValid: false, warning: "Name seems too long" }
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, warning: "Name must contain letters" }
  }

  // Only allow letters, hyphens, apostrophes, spaces, periods (covers O'Brien, Mary-Jane, Jr., etc.)
  if (!/^[a-zA-Z][a-zA-Z' .\-]*$/.test(trimmed)) {
    return { isValid: false, warning: "Name contains invalid characters" }
  }

  // Check for repeating single character (e.g., "HH", "AA", "bb")
  const lower = trimmed.toLowerCase().replace(/[^a-z]/g, "")
  if (lower.length >= 2 && new Set(lower.split("")).size === 1) {
    return { isValid: false, warning: "Please enter your real name" }
  }

  // Check against blocked list
  if (BLOCKED_NAMES.has(lower)) {
    return { isValid: false, warning: "Please enter your real name" }
  }

  // Check for keyboard mashing patterns (e.g., "asdfgh", "qwerty", "zxcvbn")
  const keyboardPatterns = ["asdf", "qwer", "zxcv", "jkl;", "uiop", "fghj", "bnm,"]
  if (keyboardPatterns.some((p) => lower.includes(p))) {
    return { isValid: false, warning: "Please enter your real name" }
  }

  return { isValid: true }
}

// ── Phone Validation ─────────────────────────────────────────────────────────

/**
 * Validates a US phone number at a high level.
 * Checks format, area code validity, and common fake patterns.
 * Not overly strict — won't reject real numbers.
 */
export function validatePhone(phone: string): { isValid: boolean; warning?: string } {
  // Strip to digits
  let digits = phone.replace(/\D/g, "")

  // Handle +1 country code
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1)
  }

  // Must be exactly 10 digits
  if (digits.length !== 10) {
    return { isValid: false, warning: "Please enter a valid 10-digit phone number" }
  }

  const areaCode = digits.slice(0, 3)
  const exchange = digits.slice(3, 6)

  // Area code can't start with 0 or 1 (NANP rules)
  if (areaCode.startsWith("0") || areaCode.startsWith("1")) {
    return { isValid: false, warning: "That doesn't look like a valid area code" }
  }

  // Exchange can't start with 0 or 1
  if (exchange.startsWith("0") || exchange.startsWith("1")) {
    return { isValid: false, warning: "That doesn't look like a valid phone number" }
  }

  // Block 555-01xx range (reserved fictional numbers)
  if (exchange === "555" && digits.slice(6, 8) === "01") {
    return { isValid: false, warning: "Please enter a real phone number" }
  }

  // Block obviously fake repeated patterns
  if (/^(\d)\1{9}$/.test(digits)) {
    // 1111111111, 2222222222, etc.
    return { isValid: false, warning: "Please enter a real phone number" }
  }

  // Block sequential numbers (1234567890, 0987654321)
  if (digits === "1234567890" || digits === "0987654321" || digits === "9876543210") {
    return { isValid: false, warning: "Please enter a real phone number" }
  }

  // Block common test numbers
  const fakeNumbers = ["5555555555", "0000000000", "1234567890", "9999999999", "1111111111"]
  if (fakeNumbers.includes(digits)) {
    return { isValid: false, warning: "Please enter a real phone number" }
  }

  return { isValid: true }
}

/**
 * Basic email format check — not strict, just catches obvious garbage.
 */
export function validateEmail(email: string): { isValid: boolean; warning?: string } {
  const trimmed = email.trim().toLowerCase()

  // Basic format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { isValid: false, warning: "Please enter a valid email address" }
  }

  // Block obviously fake domains
  const fakeDomains = ["test.com", "fake.com", "none.com", "asdf.com", "example.com", "noemail.com", "na.com"]
  const domain = trimmed.split("@")[1]
  if (fakeDomains.includes(domain)) {
    return { isValid: false, warning: "Please enter a real email address" }
  }

  // Block local part that's clearly fake
  const localPart = trimmed.split("@")[0]
  if (BLOCKED_NAMES.has(localPart)) {
    return { isValid: false, warning: "Please enter a real email address" }
  }

  return { isValid: true }
}

/**
 * Validates Medicare Beneficiary Identifier (MBI)
 * Format: 1EG4-TE5-MK72 (11 characters: letter, digit, letter/digit pattern)
 * Rules:
 * - Position 1: Numeric 1-9
 * - Position 2: Alpha A-Z (excludes S, L, O, I, B, Z)
 * - Position 3: Alpha-numeric (excludes S, L, O, I, B, Z)
 * - Position 4: Numeric 0-9
 * - Position 5: Alpha A-Z (excludes S, L, O, I, B, Z)
 * - Position 6: Alpha-numeric (excludes S, L, O, I, B, Z)
 * - Position 7: Numeric 0-9
 * - Position 8: Alpha A-Z (excludes S, L, O, I, B, Z)
 * - Position 9: Alpha A-Z (excludes S, L, O, I, B, Z)
 * - Position 10: Numeric 0-9
 * - Position 11: Numeric 0-9
 */
export function validateMBI(mbi: string): { isValid: boolean; error?: string } {
  // Remove dashes for validation
  const cleaned = mbi.replace(/-/g, "").toUpperCase()

  if (cleaned.length !== 11) {
    return { isValid: false, error: "MBI must be 11 characters" }
  }

  const excludedChars = /[SLOIBZ]/

  // Position 1: Must be numeric 1-9
  if (!/^[1-9]/.test(cleaned[0])) {
    return { isValid: false, error: "First character must be a number 1-9" }
  }

  // Position 2: Must be alpha (not S, L, O, I, B, Z)
  if (!/[A-Z]/.test(cleaned[1]) || excludedChars.test(cleaned[1])) {
    return { isValid: false, error: "Invalid character at position 2" }
  }

  // Position 3: Must be alpha-numeric (not S, L, O, I, B, Z)
  if (!/[A-Z0-9]/.test(cleaned[2]) || excludedChars.test(cleaned[2])) {
    return { isValid: false, error: "Invalid character at position 3" }
  }

  // Position 4: Must be numeric
  if (!/[0-9]/.test(cleaned[3])) {
    return { isValid: false, error: "Position 4 must be a number" }
  }

  // Position 5: Must be alpha (not S, L, O, I, B, Z)
  if (!/[A-Z]/.test(cleaned[4]) || excludedChars.test(cleaned[4])) {
    return { isValid: false, error: "Invalid character at position 5" }
  }

  // Position 6: Must be alpha-numeric (not S, L, O, I, B, Z)
  if (!/[A-Z0-9]/.test(cleaned[5]) || excludedChars.test(cleaned[5])) {
    return { isValid: false, error: "Invalid character at position 6" }
  }

  // Position 7: Must be numeric
  if (!/[0-9]/.test(cleaned[6])) {
    return { isValid: false, error: "Position 7 must be a number" }
  }

  // Position 8: Must be alpha (not S, L, O, I, B, Z)
  if (!/[A-Z]/.test(cleaned[7]) || excludedChars.test(cleaned[7])) {
    return { isValid: false, error: "Invalid character at position 8" }
  }

  // Position 9: Must be alpha (not S, L, O, I, B, Z)
  if (!/[A-Z]/.test(cleaned[8]) || excludedChars.test(cleaned[8])) {
    return { isValid: false, error: "Invalid character at position 9" }
  }

  // Position 10: Must be numeric
  if (!/[0-9]/.test(cleaned[9])) {
    return { isValid: false, error: "Position 10 must be a number" }
  }

  // Position 11: Must be numeric
  if (!/[0-9]/.test(cleaned[10])) {
    return { isValid: false, error: "Position 11 must be a number" }
  }

  return { isValid: true }
}

/**
 * Formats MBI with dashes: 1EG4TE5MK72 → 1EG4-TE5-MK72
 */
export function formatMBI(value: string): string {
  const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase()
  const limited = cleaned.slice(0, 11)

  if (limited.length <= 4) {
    return limited
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 4)}-${limited.slice(4)}`
  } else {
    return `${limited.slice(0, 4)}-${limited.slice(4, 7)}-${limited.slice(7)}`
  }
}

/**
 * Validates Social Security Number
 * Must be exactly 9 digits
 */
export function validateSSN(ssn: string): { isValid: boolean; error?: string } {
  const cleaned = ssn.replace(/\D/g, "")

  if (cleaned.length !== 9) {
    return { isValid: false, error: "SSN must be 9 digits" }
  }

  // Check for invalid patterns
  if (cleaned === "000000000" || cleaned === "111111111" || cleaned === "123456789") {
    return { isValid: false, error: "Invalid SSN pattern" }
  }

  // First three digits cannot be 000, 666, or 900-999
  const firstThree = Number.parseInt(cleaned.slice(0, 3))
  if (firstThree === 0 || firstThree === 666 || firstThree >= 900) {
    return { isValid: false, error: "Invalid SSN area number" }
  }

  // Middle two digits cannot be 00
  if (cleaned.slice(3, 5) === "00") {
    return { isValid: false, error: "Invalid SSN group number" }
  }

  // Last four digits cannot be 0000
  if (cleaned.slice(5, 9) === "0000") {
    return { isValid: false, error: "Invalid SSN serial number" }
  }

  return { isValid: true }
}

/**
 * Formats SSN with dashes: 123456789 → 123-45-6789
 */
export function formatSSN(value: string): string {
  const digits = value.replace(/\D/g, "")
  const limited = digits.slice(0, 9)

  if (limited.length <= 3) {
    return limited
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`
  }
}

/**
 * Masks SSN to show only last 4 digits: 123456789 → ***-**-6789
 */
export function maskSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, "")
  if (cleaned.length !== 9) return ssn

  return `***-**-${cleaned.slice(-4)}`
}
