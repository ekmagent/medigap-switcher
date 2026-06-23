import { type NextRequest, NextResponse } from "next/server"

const PIXEL_ID = process.env.DENTAL_META_PIXEL_ID || "1405157201420637"

/** SHA-256 hex of a normalized string, per Meta CAPI. Returns null for empty. */
async function hashData(data: string | undefined | null): Promise<string | null> {
  if (!data) return null
  const clean = data.trim().toLowerCase()
  if (!clean) return null
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clean))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** US phone -> E.164 digits (country code, no symbols). */
function normalizePhone(phone: unknown): string | null {
  if (!phone) return null
  const d = String(phone).replace(/\D/g, "")
  if (!d) return null
  return d.length === 10 ? `1${d}` : d
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.DENTAL_META_CAPI_TOKEN
    const body = await req.json()
    const { event_name, event_id, event_source_url, custom_data, user = {} } = body || {}

    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json({ ok: false, error: "missing event_name" }, { status: 400 })
    }

    // Works before the token is configured — just no-op so the funnel isn't blocked.
    if (!token) {
      console.log(`[dental] CAPI: no DENTAL_META_CAPI_TOKEN set; skipping ${event_name}`)
      return NextResponse.json({ ok: true, skipped: "no_token" })
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined
    const ua = req.headers.get("user-agent") || undefined

    const [em, fn, ln, ph, ext] = await Promise.all([
      hashData(user.email),
      hashData(user.firstName),
      hashData(user.lastName),
      hashData(normalizePhone(user.phone)),
      hashData(user.external_id),
    ])

    const user_data: Record<string, unknown> = {}
    if (em) user_data.em = [em]
    if (fn) user_data.fn = [fn]
    if (ln) user_data.ln = [ln]
    if (ph) user_data.ph = [ph]
    if (ext) user_data.external_id = [ext]
    if (user.fbc) user_data.fbc = user.fbc
    if (user.fbp) user_data.fbp = user.fbp
    if (ip) user_data.client_ip_address = ip
    if (ua) user_data.client_user_agent = ua

    // Allowlist: never forward dental/insurance descriptors to Meta (Meta's AI can
    // mis-flag the account as a healthcare provider). Only generic value/currency.
    const ALLOWED = new Set(["value", "currency"])
    const cleanCustom: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(custom_data || {})) {
      if (ALLOWED.has(k) && v !== undefined && v !== null) cleanCustom[k] = v
    }

    // Optional: route to Events Manager "Test Events" instead of production.
    const testCode = process.env.DENTAL_META_TEST_EVENT_CODE
    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          event_source_url: event_source_url || undefined,
          action_source: "website",
          user_data,
          custom_data: Object.keys(cleanCustom).length ? cleanCustom : undefined,
        },
      ],
      ...(testCode ? { test_event_code: testCode } : {}),
    }

    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    const result = await res.json()

    if (result.error) {
      console.error(`[dental] CAPI error (${event_name}):`, result.error?.message)
      return NextResponse.json({ ok: false, error: result.error?.message })
    }
    console.log(`[dental] CAPI sent ${event_name} (id ${payload.data[0].event_id})`)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[dental] CAPI exception:", e?.message)
    return NextResponse.json({ ok: false })
  }
}
