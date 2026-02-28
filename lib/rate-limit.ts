/**
 * Simple in-memory rate limiter for API routes
 * Tracks request counts per IP address
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries lazily (on each check) instead of setInterval
// which can cause issues in some runtimes
let lastCleanup = Date.now()
function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < 5 * 60 * 1000) return // Only clean every 5 minutes
  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Result with success status and metadata
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  cleanupExpiredEntries()
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment request count
  entry.count++

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const success = entry.count <= config.maxRequests

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetAt,
  }
}

/**
 * Get client IP address from Next.js request
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const headers = request.headers

  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback to 'unknown' for local development
  return "unknown"
}
