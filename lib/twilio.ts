const SID   = process.env.TWILIO_ACCOUNT_SID!
const TOKEN = process.env.TWILIO_AUTH_TOKEN!
const FROM  = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!SID || !TOKEN) return
  // normalize: accept +56912345678 or whatsapp:+56912345678
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  try {
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: toFormatted, From: FROM, Body: body }).toString(),
    })
  } catch { /* non-blocking — no rompe el flujo principal */ }
}
