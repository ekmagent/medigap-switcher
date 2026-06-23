/**
 * GoHighLevel (LeadConnector v2) integration for the dental funnel.
 *
 * Server-side only. Auth = Private Integration Token (GHL_PIT_TOKEN) for location
 * GHL_LOCATION_ID. We upsert the contact with a lean set of standard + custom
 * fields, attach a note (human-readable summary + a JSON block for pull-in/out),
 * and — gated on the opportunities scope + a configured pipeline — create a Dental
 * opportunity. DVH/policy custom fields are intentionally left for official signup.
 */

import {
  quoteLines,
  ageFromDob,
  yesNo,
  coverageFocusLabel,
  preferenceLabel,
  medicareLabel,
} from "./dental-format"

const BASE = "https://services.leadconnectorhq.com"
const VERSION = "2021-07-28"

// Existing GHL custom field IDs we write to (verified in the location).
const CF = {
  county: "gLLpwCszzTXFBqvwJt9j",
  gender: "5eldsbBxu1ZkKCWvtNRq", // options: Male / Female
  fbc: "wQaJsT4yKc5Lq1seltEv", // "Click ID (fbc)"
  fbp: "GzPemigRrJAPt3rL1FWL", // "Browser ID (fbp)"
  leadSource: "jCwwlvKaGe7b8McN2MmD", // "Lead Source"
}

function cfg() {
  return { token: process.env.GHL_PIT_TOKEN, locationId: process.env.GHL_LOCATION_ID }
}

export function ghlEnabled() {
  const { token, locationId } = cfg()
  return Boolean(token && locationId)
}

async function ghl(path: string, method: string, body?: unknown) {
  const { token } = cfg()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`GHL ${method} ${path} -> ${res.status} ${(data as any)?.message || ""}`)
  }
  return data as any
}

function phoneE164(phone?: string | null) {
  if (!phone) return undefined
  const d = String(phone).replace(/\D/g, "")
  if (!d) return undefined
  return d.length === 10 ? `+1${d}` : `+${d}`
}

function dobIso(dob?: string | null) {
  // MM/DD/YYYY -> YYYY-MM-DD
  if (!dob) return undefined
  const m = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return undefined
  const [, mm, dd, yyyy] = m
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`
}

export interface DentalContactInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  county?: string
  gender?: string
  fbc?: string
  fbp?: string
  leadSource?: string
  tags?: string[]
}

/** Upsert the contact (dedup by email/phone). Returns the contact id. */
export async function upsertDentalContact(input: DentalContactInput): Promise<string> {
  const { locationId } = cfg()
  const customFields: { id: string; value: string }[] = []
  const cf = (id: string, v?: string) => {
    if (v != null && String(v).trim() !== "") customFields.push({ id, value: String(v) })
  }
  cf(CF.county, input.county)
  cf(CF.gender, input.gender)
  cf(CF.fbc, input.fbc)
  cf(CF.fbp, input.fbp)
  cf(CF.leadSource, input.leadSource || "Dental Funnel")

  const payload: Record<string, unknown> = {
    locationId,
    firstName: input.firstName,
    lastName: input.lastName || undefined,
    email: input.email || undefined,
    phone: phoneE164(input.phone),
    address1: input.street || undefined,
    city: input.city || undefined,
    state: input.state || undefined,
    postalCode: input.zipCode || undefined,
    dateOfBirth: dobIso(input.dateOfBirth),
    source: "Dental Funnel",
    tags: input.tags && input.tags.length ? input.tags : undefined,
    customFields: customFields.length ? customFields : undefined,
  }
  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k]

  const data = await ghl("/contacts/upsert", "POST", payload)
  const id = data?.contact?.id || data?.id
  if (!id) throw new Error("GHL upsert returned no contact id")
  return id
}

export async function addDentalNote(contactId: string, body: string) {
  await ghl(`/contacts/${contactId}/notes`, "POST", { body })
}

/**
 * Find the contact's existing Dental-pipeline opportunity and move it to `stageId`,
 * or create one if none exists. Gated on a configured pipeline (and the
 * opportunities scope). Best-effort — never throws to the caller's flow.
 */
export async function upsertDentalOpportunity(
  contactId: string,
  opts: { name: string; monetaryValue?: number | null; stageId?: string },
) {
  const { locationId } = cfg()
  const pipelineId = process.env.GHL_DENTAL_PIPELINE_ID
  const stageId = opts.stageId || process.env.GHL_DENTAL_STAGE_NEW
  if (!pipelineId || !stageId) {
    console.log("[dental] GHL: no pipeline configured; skipping opportunity")
    return
  }

  // Look for an existing open opportunity for this contact in the dental pipeline.
  let existingId: string | undefined
  try {
    const found = await ghl(
      `/opportunities/search?location_id=${locationId}&contact_id=${contactId}`,
      "GET",
    )
    existingId = (found?.opportunities || []).find((o: any) => o.pipelineId === pipelineId)?.id
  } catch {
    /* search optional */
  }

  if (existingId) {
    await ghl(`/opportunities/${existingId}`, "PUT", {
      pipelineId,
      pipelineStageId: stageId,
      name: opts.name,
      monetaryValue: opts.monetaryValue ?? undefined,
    })
    return existingId
  }

  const created = await ghl("/opportunities/", "POST", {
    locationId,
    pipelineId,
    pipelineStageId: stageId,
    name: opts.name,
    status: "open",
    contactId,
    monetaryValue: opts.monetaryValue ?? undefined,
  })
  return created?.opportunity?.id || created?.id
}

/** Dialer-ready note: contact summary, their answers, the 3 quotes + a JSON block. */
export function buildDentalNote(kind: "Lead" | "Enrollment", d: Record<string, any>): string {
  const lines: string[] = []
  const age = ageFromDob(d.dateOfBirth)
  const name = [d.firstName, d.lastName].filter(Boolean).join(" ")
  const loc = `${[d.county, d.state].filter(Boolean).join(", ")}${d.zipCode ? ` ${d.zipCode}` : ""}`.trim()
  const prem = (n: any) =>
    n == null ? "" : (Number.isInteger(n) ? `$${n}` : `$${Number(n).toFixed(2)}`) + "/mo"

  if (kind === "Lead") {
    lines.push(`🦷 DENTAL LEAD${name ? ` — ${name}` : ""}`, "")
    lines.push("CONTACT")
    lines.push(`  ${d.phone || "—"} · ${d.email || "—"}`)
    lines.push(`  DOB ${d.dateOfBirth || "—"}${age != null ? ` (age ${age})` : ""} · ${loc || "—"}`)
    lines.push("", "WHAT THEY TOLD US")
    lines.push(`  Has dental now: ${yesNo(d.hasDentalNow)}   |   Wants: ${coverageFocusLabel(d.coverageFocus)}`)
    lines.push(`  On Medicare: ${medicareLabel(d.onMedicare, d.medicareType)}   |   Leaning: ${preferenceLabel(d.preference)}`)
    lines.push("", "THEIR 3 QUOTES — Mutual of Omaha (same price at any age)")
    for (const q of quoteLines({
      platinum: d.quotedPlatinumPremium,
      gold: d.quotedGoldPremium,
      bronze: d.quotedBronzePremium,
    })) {
      lines.push(`  ${q}`)
    }
    const src = [d.utmSource, d.utmMedium, d.utmCampaign].filter(Boolean).join(" / ")
    lines.push("", `SOURCE  ${src || "—"}`)
  } else {
    lines.push(`🦷 DENTAL ENROLLMENT${name ? ` — ${name}` : ""}`, "")
    lines.push(`SELECTED: ${d.plan || "—"} ${prem(d.monthlyPremium)}`.trim())
    lines.push(`  Effective: ${d.effectiveDate || "—"}`)
    lines.push(`  Mailing: ${d.address || "—"}`)
    lines.push(`  Gender: ${d.gender || "—"}   |   Makes own decisions: ${yesNo(d.canMakeDecisions)}`)
    lines.push(`  ${d.phone || "—"} · ${d.email || "—"} · DOB ${d.dateOfBirth || "—"}`)
  }

  lines.push("", "```json", JSON.stringify({ kind, ...d }, null, 2), "```")
  return lines.join("\n")
}
