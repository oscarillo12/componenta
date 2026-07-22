const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Componenta <hola@componenta.cl>'

export async function sendMatchEmail({
  buyerEmail,
  buyerName,
  pieza,
  marca,
  modelo,
  anio,
  sellerNombre,
  sellerTelefono,
}: {
  buyerEmail: string
  buyerName: string
  pieza: string
  marca?: string | null
  modelo?: string | null
  anio?: string | null
  sellerNombre: string
  sellerTelefono?: string | null
}): Promise<void> {
  if (!RESEND_API_KEY) return

  const auto = [marca, modelo, anio].filter(Boolean).join(' ')
  const waLink = sellerTelefono
    ? `https://wa.me/${sellerTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi en Componenta que tienes ${pieza}${auto ? ` para ${auto}` : ''}. ¿Sigue disponible?`)}`
    : null

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:32px 16px;background:#f5f6f7;font-family:'Inter',system-ui,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">

    <div style="background:#1d4ed8;padding:22px 28px;">
      <p style="color:#fff;font-size:19px;font-weight:800;margin:0;letter-spacing:-0.3px;">Componenta</p>
      <p style="color:rgba(255,255,255,0.65);font-size:12px;margin:3px 0 0;">Repuestos usados · La Araucanía</p>
    </div>

    <div style="padding:28px 28px 24px;">
      <h1 style="font-size:22px;font-weight:900;color:#111827;margin:0 0 10px;letter-spacing:-0.5px;">
        ¡Encontramos tu ${pieza}!
      </h1>
      <p style="font-size:14px;color:#6b7280;margin:0 0 22px;line-height:1.65;">
        Hola <strong style="color:#374151;">${buyerName}</strong>, un vendedor acaba de publicar la pieza que estabas buscando en Componenta.
      </p>

      <div style="background:#f0fdf4;border:1.5px solid #a7f3d0;border-radius:13px;padding:16px 20px;margin-bottom:22px;">
        <p style="font-size:17px;font-weight:800;color:#14532d;margin:0${auto ? ' 0 4px' : ''};">${pieza}</p>
        ${auto ? `<p style="font-size:13px;color:#15803d;font-weight:600;margin:0;">Para ${auto}</p>` : ''}
      </div>

      <p style="font-size:14px;color:#374151;margin:0 0 ${waLink ? '16px' : '24px'};">
        <strong>${sellerNombre}</strong> tiene esta pieza disponible.
      </p>

      ${waLink
        ? `<a href="${waLink}"
              style="display:inline-block;background:#25d366;color:#fff;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:24px;box-shadow:0 3px 10px rgba(37,211,102,0.3);">
             WhatsApp con el vendedor →
           </a>`
        : ''}

      <p style="font-size:13px;color:#9ca3af;margin:0 0 18px;">O busca más opciones en el marketplace:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://componenta.vercel.app'}"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;box-shadow:0 4px 14px rgba(29,78,216,0.25);">
        Ver en Componenta →
      </a>
    </div>

    <div style="padding:14px 28px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="font-size:11px;color:#b0b8c8;margin:0;line-height:1.6;">
        Recibiste este correo porque publicaste una solicitud en Componenta.<br/>
        Si ya encontraste tu pieza, no tienes que hacer nada.
      </p>
    </div>

  </div>
</body>
</html>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: buyerEmail,
        subject: `¡Encontramos tu ${pieza}! — Componenta`,
        html,
      }),
    })
  } catch { /* non-blocking */ }
}
