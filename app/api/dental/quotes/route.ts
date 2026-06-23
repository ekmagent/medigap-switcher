import { type NextRequest, NextResponse } from "next/server"
import { getDentalQuotes } from "@/lib/dental-quotes"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req)
  const rateLimitResult = checkRateLimit(clientIp, {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      },
    )
  }

  try {
    const body = await req.json()
    const { zip, state } = body

    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json({ success: false, error: "Invalid zip code" }, { status: 400 })
    }

    const quotes = await getDentalQuotes({ zip, state: typeof state === "string" ? state : undefined })

    return NextResponse.json({ success: true, quotes })
  } catch (error: any) {
    console.error("[dental] Quote error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dental quotes" }, { status: 500 })
  }
}
