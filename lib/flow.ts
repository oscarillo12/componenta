import crypto from 'crypto'

const API_KEY    = process.env.FLOW_API_KEY    ?? ''
const SECRET_KEY = process.env.FLOW_SECRET_KEY ?? ''
const SANDBOX    = process.env.FLOW_SANDBOX !== 'false'
const BASE_URL   = SANDBOX
  ? 'https://sandbox.flow.cl/api'
  : 'https://www.flow.cl/api'

function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort()
  const msg = sorted.map(k => k + params[k]).join('')
  return crypto.createHmac('sha256', SECRET_KEY).update(msg).digest('hex')
}

function buildForm(params: Record<string, string>): URLSearchParams {
  const all: Record<string, string> = { ...params, apiKey: API_KEY }
  all.s = sign(all)
  return new URLSearchParams(all)
}

export interface FlowPaymentResult {
  url: string
  token: string
  flowOrder: number
}

export async function createFlowPayment(opts: {
  commerceOrder: string
  subject: string
  amount: number
  email: string
  urlConfirmation: string
  urlReturn: string
}): Promise<FlowPaymentResult> {
  const params: Record<string, string> = {
    commerceOrder: opts.commerceOrder,
    subject:       opts.subject,
    currency:      'CLP',
    amount:        String(Math.round(opts.amount)),
    email:         opts.email,
    urlConfirmation: opts.urlConfirmation,
    urlReturn:       opts.urlReturn,
  }
  const body = buildForm(params)
  const res = await fetch(`${BASE_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const data = await res.json()
  if (!data.url || !data.token) throw new Error(data.message ?? 'Flow error')
  return { url: `${data.url}?token=${data.token}`, token: data.token, flowOrder: data.flowOrder }
}

export async function getFlowPaymentStatus(token: string): Promise<{
  status: number  // 1=pendiente 2=pagado 3=rechazado 4=anulado
  amount: number
  commerceOrder: string
}> {
  const params: Record<string, string> = { token }
  const all: Record<string, string> = { ...params, apiKey: API_KEY }
  all.s = sign(all)
  const qs = new URLSearchParams(all).toString()
  const res = await fetch(`${BASE_URL}/payment/getStatus?${qs}`)
  const data = await res.json()
  return { status: data.status, amount: data.amount, commerceOrder: data.commerceOrder }
}
