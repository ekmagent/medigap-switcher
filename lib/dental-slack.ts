/**
 * Slack new-lead / enrollment notifications for the dental funnel.
 * Posts to a channel via an incoming webhook (SLACK_DENTAL_WEBHOOK_URL) so the
 * team gets a real-time chime with the quote + a one-click link into GHL.
 * Server-side only, best-effort (never throws to the caller).
 */

import {
  quoteLines,
  ageFromDob,
  ghlContactUrl,
  yesNo,
  coverageFocusLabel,
  preferenceLabel,
  medicareLabel,
} from "./dental-format"

function premium(n: any) {
  if (n == null) return ""
  return (Number.isInteger(n) ? `$${n}` : `$${Number(n).toFixed(2)}`) + "/mo"
}

async function postSlack(text: string, blocks: unknown[]) {
  const url = process.env.SLACK_DENTAL_WEBHOOK_URL
  if (!url) {
    console.log("[dental] no SLACK_DENTAL_WEBHOOK_URL; skipping Slack notify")
    return
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error(`[dental] Slack webhook ${res.status}: ${detail.slice(0, 200)}`)
    }
  } catch (e: any) {
    console.error("[dental] Slack notify error:", e?.message)
  }
}

function ghlButton(contactId?: string) {
  if (!contactId) return []
  return [
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Open in GHL ↗", emoji: true },
          url: ghlContactUrl(contactId),
          style: "primary",
        },
      ],
    },
  ]
}

export async function notifyDentalLead(d: Record<string, any>) {
  const name = [d.firstName, d.lastName].filter(Boolean).join(" ") || "New lead"
  const age = ageFromDob(d.dateOfBirth)
  const loc = `${[d.county, d.state].filter(Boolean).join(", ")}${d.zipCode ? ` ${d.zipCode}` : ""}`.trim()
  const quotes = quoteLines({
    platinum: d.quotedPlatinumPremium,
    gold: d.quotedGoldPremium,
    bronze: d.quotedBronzePremium,
  }).join("\n")
  const src = [d.utmSource, d.utmMedium, d.utmCampaign].filter(Boolean).join(" / ") || "—"

  const blocks = [
    { type: "header", text: { type: "plain_text", text: `🦷 New Dental Lead — ${name}`, emoji: true } },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📞 ${d.phone || "—"}   ✉️ ${d.email || "—"}\nDOB ${d.dateOfBirth || "—"}${
          age != null ? ` (age ${age})` : ""
        }   📍 ${loc || "—"}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*What they told us*\nHas dental now: *${yesNo(d.hasDentalNow)}*  ·  Wants: *${coverageFocusLabel(
          d.coverageFocus,
        )}*\nOn Medicare: *${medicareLabel(d.onMedicare, d.medicareType)}*  ·  Leaning: *${preferenceLabel(
          d.preference,
        )}*`,
      },
    },
    { type: "section", text: { type: "mrkdwn", text: `*Their 3 quotes — Mutual of Omaha*\n\`\`\`${quotes}\`\`\`` } },
    ...ghlButton(d.contactId),
    { type: "context", elements: [{ type: "mrkdwn", text: `Source: ${src}  ·  Pipeline: *EKM - FB Dental → New Lead*` }] },
  ]

  await postSlack(`New dental lead: ${name}`, blocks)
}

export async function notifyDentalEnrollment(d: Record<string, any>) {
  const name = [d.firstName, d.lastName].filter(Boolean).join(" ") || "Lead"
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `🔥 Dental Enrollment — ${name}`, emoji: true } },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Selected: ${d.plan || "—"} ${premium(d.monthlyPremium)}*\nEffective: *${
          d.effectiveDate || "—"
        }*\n📍 ${d.address || "—"}\n📞 ${d.phone || "—"}   ✉️ ${d.email || "—"}`,
      },
    },
    ...ghlButton(d.contactId),
    { type: "context", elements: [{ type: "mrkdwn", text: `Pipeline: *EKM - FB Dental → Proposal Sent*` }] },
  ]
  await postSlack(`Dental enrollment: ${name} — ${d.plan || ""}`, blocks)
}
