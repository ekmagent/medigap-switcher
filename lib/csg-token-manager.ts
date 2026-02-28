import { getNeonClient } from "@/lib/neon-client"

interface CSGToken {
  token: string
  expires_at: string
}

const CSG_BASE_URL = "https://api.csgactuarial.com/v1"
const TOKEN_REFRESH_BUFFER_MS = 10 * 60 * 1000 // 10 minutes before expiration

/**
 * Get a valid CSG token from database or create new one
 * This ensures token is shared across all lambda invocations
 */
export async function getValidCSGToken(): Promise<string> {
  try {
    const sql = getNeonClient()
    const result = await sql`
      SELECT token, expires_at
      FROM csg_tokens
      WHERE id = 1
    `
    const tokenRow = result[0] as CSGToken | undefined

    if (!tokenRow) {
      console.log("[v0] CSG Token: No token in database, creating first token")
      return await createAndStoreToken()
    }

    const expiresAt = new Date(tokenRow.expires_at).getTime()
    const now = Date.now()

    if (tokenRow.token && expiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
      const minutesRemaining = Math.floor((expiresAt - now) / (60 * 1000))
      console.log(`[v0] CSG Token: Using existing token (expires in ${minutesRemaining} minutes)`)
      return tokenRow.token
    }

    console.log("[v0] CSG Token: Token expired or expiring soon, creating new token")
    return await createAndStoreToken()
  } catch (error) {
    console.error("[v0] CSG Token: Error fetching token from database:", error)
    return await createAndStoreToken()
  }
}

/**
 * Create new CSG token and store in database
 */
async function createAndStoreToken(): Promise<string> {
  const apiKey = process.env.CSGAPI

  if (!apiKey) {
    throw new Error("CSGAPI environment variable is not set")
  }

  console.log("[v0] CSG Token: Authenticating with CSG API...")
  const authStartTime = Date.now()

  try {
    const response = await fetch(`${CSG_BASE_URL}/auth.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        portal_name: "csg_individual",
      }),
    })

    const authTime = Date.now() - authStartTime
    console.log(`[v0] CSG Token: Auth completed in ${authTime}ms with status ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] CSG Token: Authentication failed:", response.status, errorText)

      if (errorText.includes("Max Session Reached") || errorText.includes("maximum number of sessions")) {
        throw new Error(
          "CSG API: Maximum sessions reached (5). Please close old sessions at https://tools.csgactuarial.com/auth/manage-account/sessions",
        )
      }

      throw new Error(`CSG authentication failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const sessionKey = data.token || data.key

    if (!sessionKey) {
      console.error("[v0] CSG Token: Response missing token")
      throw new Error("CSG authentication response missing session token")
    }

    const expiresDate = data.expires_date ? new Date(data.expires_date) : new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now

    console.log("[v0] CSG Token: New token created, expires at", expiresDate.toISOString())

    const sql = getNeonClient()
    await sql`
      UPDATE csg_tokens
      SET 
        token = ${sessionKey},
        expires_at = ${expiresDate.toISOString()},
        updated_at = NOW()
      WHERE id = 1
    `

    console.log("[v0] CSG Token: Token stored in database successfully")

    return sessionKey
  } catch (error) {
    console.error("[v0] CSG Token: Error during token creation:", error)
    throw error
  }
}

/**
 * Force refresh the token (useful for testing or manual override)
 */
export async function forceRefreshCSGToken(): Promise<string> {
  console.log("[v0] CSG Token: Force refreshing token...")
  const sql = getNeonClient()
  await sql`
    UPDATE csg_tokens
    SET 
      token = '',
      expires_at = NOW(),
      updated_at = NOW()
    WHERE id = 1
  `
  return await createAndStoreToken()
}

/**
 * Clear token from database (useful for testing)
 */
export async function clearCSGToken(): Promise<void> {
  console.log("[v0] CSG Token: Clearing token from database...")
  const sql = getNeonClient()
  await sql`
    UPDATE csg_tokens
    SET 
      token = '',
      expires_at = NOW(),
      updated_at = NOW()
    WHERE id = 1
  `
  console.log("[v0] CSG Token: Token cleared")
}
