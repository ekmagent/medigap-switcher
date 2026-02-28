import { neon } from "@neondatabase/serverless"

// Create configured Neon client with browser warning suppressed
export function getNeonClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined")
  }

  // Safe because this only runs in API routes (server-side)
  const sql = neon(process.env.DATABASE_URL)

  return sql
}
