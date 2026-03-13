import { getNeonClient } from "@/lib/neon-client"

const SAFE_EVENT_SOURCE_URL = "https://switcher.healthplans.now"

function getEventSourceUrl(): string {
  return SAFE_EVENT_SOURCE_URL
}

/**
 * Shadow event mapping: generic funnel step names sent alongside standard events.
 * If Meta restricts standard events, use Custom Conversions in Events Manager
 * mapped to these step names for ad optimization.
 */
const SHADOW_EVENT_MAP: Record<string, string> = {
  Lead: "step_1_complete",
  AddToCart: "step_2_complete",
  InitiateCheckout: "step_3_complete",
  Purchase: "step_4_complete",
}

/**
 * Logs Facebook CAPI event to database for audit trail.
 */
async function logFacebookEvent(
  sentPayload: { data: Array<Record<string, any>> },
  result: {
    success: boolean
    responseStatus?: number
    responseBody?: any
    errorMessage?: string
    leadId?: string
    applicationId?: string
  },
) {
  try {
    const sql = getNeonClient()
    const event = sentPayload.data[0]
    const ud = event.user_data || {}
    const cd = event.custom_data || {}

    await sql`
      INSERT INTO facebook_events (
        event_name,
        event_id,
        event_time,
        event_source_url,
        action_source,
        user_email_hash,
        user_phone_hash,
        user_fbp,
        user_fbc,
        user_ip,
        user_agent,
        event_value,
        event_currency,
        content_name,
        content_category,
        custom_data,
        full_payload,
        fb_response_status,
        fb_response_body,
        success,
        error_message,
        lead_id,
        application_id
      ) VALUES (
        ${event.event_name},
        ${event.event_id},
        ${event.event_time},
        ${event.event_source_url || null},
        ${event.action_source || "website"},
        ${ud.em?.[0] || null},
        ${ud.ph?.[0] || null},
        ${ud.fbp || null},
        ${ud.fbc || null},
        ${ud.client_ip_address || null},
        ${ud.client_user_agent || null},
        ${cd.value || null},
        ${cd.currency || null},
        ${cd.content_name || null},
        ${cd.content_category || null},
        ${JSON.stringify(cd)},
        ${JSON.stringify(sentPayload)},
        ${result.responseStatus || null},
        ${result.responseBody ? JSON.stringify(result.responseBody) : null},
        ${result.success},
        ${result.errorMessage || null},
        ${result.leadId || null},
        ${result.applicationId || null}
      )
    `
    console.log(`[switcher] FB CAPI: Event logged to database (${event.event_name})`)
  } catch (error) {
    console.error("[switcher] FB CAPI: Failed to log event to database:", error)
  }
}

/**
 * Hashes data using SHA-256 for Facebook CAPI
 */
export async function hashData(data: string | undefined | null): Promise<string | null> {
  if (!data) return null
  const cleanData = data.trim().toLowerCase()
  const msgBuffer = new TextEncoder().encode(cleanData)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Sends an event to Facebook Conversions API (server-side only, no pixel)
 */
export async function sendCAPIEvent(params: {
  eventName: string
  eventId?: string
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    zipCode?: string
    city?: string
    state?: string
    fbp?: string
    fbc?: string
    clientIpAddress?: string
    clientUserAgent?: string
    externalId?: string
  }
  customData?: Record<string, any>
  requireUserData?: boolean
  leadId?: string
  applicationId?: string
}) {
  const {
    eventName,
    eventId,
    userData = {},
    customData = {},
    requireUserData = false,
    leadId,
    applicationId,
  } = params

  const PIXEL_ID = process.env.META_PIXEL_ID
  const ACCESS_TOKEN = process.env.META_CAPI_TOKEN

  console.log(`[switcher] FB CAPI: Attempting to send ${eventName} event`)

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error("[switcher] FB CAPI: Missing META_PIXEL_ID or META_CAPI_TOKEN")
    return null
  }

  const hasMinimumUserData =
    userData.email ||
    userData.phone ||
    userData.externalId ||
    (userData.fbp && userData.clientIpAddress && userData.clientUserAgent) ||
    (userData.fbc && userData.clientIpAddress && userData.clientUserAgent)

  if (requireUserData && !hasMinimumUserData) {
    console.warn(`[switcher] FB CAPI: Skipping ${eventName} - insufficient user data`)
    return null
  }

  if (!hasMinimumUserData && !userData.clientIpAddress && !userData.clientUserAgent) {
    console.warn(`[switcher] FB CAPI: Skipping ${eventName} - no user data available`)
    return null
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const uniqueEventId = eventId || crypto.randomUUID()

  const [emailHash, phoneHash, fnHash, lnHash, zipHash, cityHash, stateHash, externalIdHash] =
    await Promise.all([
      hashData(userData.email),
      hashData(userData.phone),
      hashData(userData.firstName),
      hashData(userData.lastName),
      hashData(userData.zipCode),
      hashData(userData.city),
      hashData(userData.state),
      hashData(userData.externalId),
    ])

  const validIp =
    userData.clientIpAddress &&
    userData.clientIpAddress !== "unknown" &&
    /^[\d.]+$|^[\da-fA-F:]+$/.test(userData.clientIpAddress)
      ? userData.clientIpAddress
      : undefined

  const userDataPayload: Record<string, any> = {}

  if (emailHash) userDataPayload.em = [emailHash]
  if (phoneHash) userDataPayload.ph = [phoneHash]
  if (fnHash) userDataPayload.fn = [fnHash]
  if (lnHash) userDataPayload.ln = [lnHash]
  if (zipHash) userDataPayload.zp = [zipHash]
  if (cityHash) userDataPayload.ct = [cityHash]
  if (stateHash) userDataPayload.st = [stateHash]
  if (userData.fbp) userDataPayload.fbp = userData.fbp
  if (userData.fbc) userDataPayload.fbc = userData.fbc
  userDataPayload.client_ip_address = validIp || "254.254.254.254"
  userDataPayload.client_user_agent =
    userData.clientUserAgent ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  if (externalIdHash) userDataPayload.external_id = [externalIdHash]

  const cleanCustomData: Record<string, any> = {}
  for (const [key, value] of Object.entries(customData)) {
    if (value !== undefined && value !== null) {
      cleanCustomData[key] = value
    }
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: timestamp,
        event_id: uniqueEventId,
        event_source_url: getEventSourceUrl(),
        action_source: "website",
        user_data: userDataPayload,
        custom_data: Object.keys(cleanCustomData).length > 0 ? cleanCustomData : undefined,
      },
    ],
  }

  try {
    console.log(`[switcher] FB CAPI: Sending ${eventName} event (ID: ${uniqueEventId})`)

    const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (result.error) {
      console.error("[switcher] FB CAPI Error:", JSON.stringify(result.error, null, 2))
      await logFacebookEvent(payload, {
        success: false,
        responseStatus: response.status,
        responseBody: result,
        errorMessage: result.error.message || JSON.stringify(result.error),
        leadId,
        applicationId,
      })
      return null
    } else {
      console.log(`[switcher] FB CAPI SUCCESS: ${eventName} (ID: ${uniqueEventId})`)
      await logFacebookEvent(payload, {
        success: true,
        responseStatus: response.status,
        responseBody: result,
        leadId,
        applicationId,
      })
    }

    // Shadow event: fire same data under a generic funnel step name
    const shadowName = SHADOW_EVENT_MAP[eventName]
    if (shadowName) {
      try {
        const shadowPayload = {
          data: [
            {
              ...payload.data[0],
              event_name: shadowName,
              event_id: `${uniqueEventId}-s`,
            },
          ],
        }

        const shadowResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify(shadowPayload),
        })
        const shadowResult = await shadowResponse.json()

        await logFacebookEvent(shadowPayload, {
          success: !shadowResult.error,
          responseStatus: shadowResponse.status,
          responseBody: shadowResult,
          errorMessage: shadowResult.error?.message || undefined,
          leadId,
          applicationId,
        })

        if (shadowResult.error) {
          console.error(`[switcher] FB CAPI: Shadow ${shadowName} error:`, shadowResult.error)
        } else {
          console.log(`[switcher] FB CAPI: Shadow ${shadowName} sent`)
        }
      } catch (shadowError) {
        console.error(`[switcher] FB CAPI: Shadow ${shadowName} exception:`, shadowError)
      }
    }

    return { ...result, event_id: uniqueEventId }
  } catch (error) {
    console.error("[switcher] FB CAPI Exception:", error)
    await logFacebookEvent(payload, {
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
      leadId,
      applicationId,
    })
    return null
  }
}
