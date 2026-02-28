// Twilio Verify API via raw fetch (no SDK -- avoids runtime compatibility issues)

const TWILIO_API_BASE = "https://verify.twilio.com/v2"

function getCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID

  if (!accountSid || !authToken || !serviceSid) {
    return null
  }

  return { accountSid, authToken, serviceSid }
}

function formatPhoneForTwilio(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "")

  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }
  if (phoneNumber.startsWith("+")) {
    return phoneNumber
  }
  return `+1${digits}`
}

export async function sendVerificationCode(
  phoneNumber: string
): Promise<{ success: boolean; error?: string }> {
  const creds = getCredentials()
  if (!creds) {
    return { success: false, error: "Twilio not configured" }
  }

  const formattedPhone = formatPhoneForTwilio(phoneNumber)

  try {
    const url = `${TWILIO_API_BASE}/Services/${creds.serviceSid}/Verifications`
    const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64")

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        Channel: "sms",
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("Twilio API error:", data.message || data.code)
      return { success: false, error: data.message || "Failed to send verification" }
    }

    return { success: data.status === "pending" }
  } catch (error: any) {
    console.error("Twilio send error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function verifyCode(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const creds = getCredentials()
  if (!creds) {
    return { success: false, error: "Twilio not configured" }
  }

  const formattedPhone = formatPhoneForTwilio(phoneNumber)

  try {
    const url = `${TWILIO_API_BASE}/Services/${creds.serviceSid}/VerificationCheck`
    const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64")

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        Code: code,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("Twilio verify API error:", data.message || data.code)
      return { success: false, error: data.message || "Verification failed" }
    }

    return { success: data.status === "approved" }
  } catch (error: any) {
    console.error("Twilio verify error:", error.message)
    return { success: false, error: error.message }
  }
}
