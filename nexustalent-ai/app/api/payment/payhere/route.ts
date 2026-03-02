import { NextRequest, NextResponse } from 'next/server'

// ── Plan configuration (mirrors pricing page) ─────────────────────────────────
const PLAN_CONFIG: Record<
  string,
  {
    name: string
    monthly: number
    annual: number
    jd_quota: number
    cv_per_jd_quota: number
  }
> = {
  starter: {
    name: 'Starter',
    monthly: 19,
    annual: 15 * 12, // 180/yr
    jd_quota: 10,
    cv_per_jd_quota: 50,
  },
  growth: {
    name: 'Growth',
    monthly: 49,
    annual: 39 * 12, // 468/yr
    jd_quota: 50,
    cv_per_jd_quota: 200,
  },
  scale: {
    name: 'Scale',
    monthly: 99,
    annual: 79 * 12, // 948/yr
    jd_quota: 9999, // effectively unlimited
    cv_per_jd_quota: 500,
  },
}

// ── POST: Create a Payhere checkout session (mock) ────────────────────────────
// In production, this generates a real Payhere payment hash and form params.
// For MVP, it simulates the flow and returns mock checkout data.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan, billingInterval } = body as {
      userId: string
      plan: string
      billingInterval: 'monthly' | 'annual'
    }

    if (!userId || !plan || !billingInterval) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, plan, billingInterval.' },
        { status: 400 }
      )
    }

    const planConfig = PLAN_CONFIG[plan]
    if (!planConfig) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}. Choose starter, growth, or scale.` },
        { status: 400 }
      )
    }

    const amount =
      billingInterval === 'annual' ? planConfig.annual : planConfig.monthly
    const currency = 'USD'
    const orderId = `NT-${plan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // ── In production, compute Payhere hash ─────────────────────────────
    // const merchantId = process.env.PAYHERE_MERCHANT_ID!
    // const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
    // const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    // const amountFormatted = parseFloat(amount.toString()).toLocaleString('en-us', { minimumFractionDigits: 2 })
    // const hash = crypto.createHash('md5')
    //   .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
    //   .digest('hex').toUpperCase()

    // For MVP: simulate checkout data that frontned would submit to Payhere
    const checkoutData = {
      merchant_id: process.env.PAYHERE_MERCHANT_ID || 'MOCK_MERCHANT',
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/hr?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/hr?payment=cancelled`,
      notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/payhere/notify`,
      order_id: orderId,
      items: `NexusTalent AI ${planConfig.name} Plan (${billingInterval})`,
      currency,
      amount: amount.toFixed(2),
      first_name: '', // filled by frontend
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Sri Lanka',
      // hash: hash, // production only
      custom_1: userId,
      custom_2: plan,
      custom_3: billingInterval,
    }

    return NextResponse.json(
      { success: true, checkoutData, orderId },
      { status: 200 }
    )
  } catch (err) {
    console.error('Payhere checkout error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
