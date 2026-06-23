/**
 * Meta tracking for the dental funnel — browser Pixel + server CAPI, deduplicated.
 *
 * The base pixel (id 1405157201420637) is loaded in app/dental/layout.tsx. For each
 * event we generate one event_id, fire the browser pixel with {eventID} AND post to
 * /api/dental/capi with the same event_id so Meta de-duplicates the two.
 *
 * Customer params sent (matching the Events Manager setup): email, first/last name,
 * phone, fbc, fbp, external_id, plus client IP + user agent (added server-side).
 */

import { getFbc, getFbp } from "./fb-pixel"

export const DENTAL_PIXEL_ID = "1405157201420637"

/** Stable per-browser id used as external_id (stand-in for a GHL contact id). */
export function getExternalId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = localStorage.getItem("dental_external_id")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("dental_external_id", id)
    }
    return id
  } catch {
    return ""
  }
}

export interface DentalEventUser {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export function trackDental(
  eventName: string,
  opts: { custom?: Record<string, unknown>; user?: DentalEventUser } = {},
) {
  if (typeof window === "undefined") return
  const eventId = crypto.randomUUID()
  const custom = opts.custom || {}

  // CAPI only (no browser pixel on funnel pages — the pixel lives on the landing
  // page). event_source_url is the origin only, so we don't send the /dental path.
  try {
    fetch("/api/dental/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.origin,
        custom_data: custom,
        user: {
          ...opts.user,
          fbc: getFbc(),
          fbp: getFbp(),
          external_id: getExternalId(),
        },
      }),
    }).catch(() => {})
  } catch {
    /* no-op */
  }
}
