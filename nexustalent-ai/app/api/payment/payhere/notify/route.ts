import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

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
    annual: 15 * 12,
    jd_quota: 10,
    cv_per_jd_quota: 50,
  },
  growth: {
    name: 'Growth',
    monthly: 49,
    annual: 39 * 12,
    jd_quota: 50,
    cv_per_jd_quota: 200,
  },
  scale: {
    name: 'Scale',
    monthly: 99,
    annual: 79 * 12,
    jd_quota: 9999,
    cv_per_jd_quota: 500,
  },
}

// ── POST: Payhere Notify Webhook ──────────────────────────────────────────────
// PayHere sends a POST with application/x-www-form-urlencoded data to notify_url
// after payment completion. Verifies MD5 hash, then upgrades the subscription.
// Docs: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout#notify
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const merchantId = formData.get('merchant_id') as string
    const orderId = formData.get('order_id') as string
    const payhereAmount = formData.get('payhere_amount') as string
    const payhereCurrency = formData.get('payhere_currency') as string
    const statusCode = formData.get('status_code') as string
    const md5sig = formData.get('md5sig') as string
    const userId = formData.get('custom_1') as string
    const plan = formData.get('custom_2') as string
    const billingInterval = formData.get('custom_3') as string

    // ── Verify signature (production) ──────────────────────────────────
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
    if (merchantSecret) {
      const hashedSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase()
      const expectedSig = crypto
        .createHash('md5')
        .update(
          merchantId +
            orderId +
            payhereAmount +
            payhereCurrency +
            statusCode +
            hashedSecret
        )
        .digest('hex')
        .toUpperCase()

      if (md5sig !== expectedSig) {
        console.error('Payhere webhook: invalid signature')
        return NextResponse.json(
          { error: 'Invalid signature.' },
          { status: 403 }
        )
      }
    }

    // status_code 2 = success
    if (statusCode !== '2') {
      console.log(`Payhere webhook: non-success status ${statusCode} for order ${orderId}`)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (!userId || !plan) {
      console.error('Payhere webhook: missing custom fields')
      return NextResponse.json(
        { error: 'Missing user/plan data.' },
        { status: 400 }
      )
    }

    const planConfig = PLAN_CONFIG[plan]
    if (!planConfig) {
      console.error(`Payhere webhook: unknown plan ${plan}`)
      return NextResponse.json(
        { error: 'Unknown plan.' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // ── Get current subscription ───────────────────────────────────────
    const { data: currentSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!currentSub) {
      console.error(`Payhere webhook: no subscription for user ${userId}`)
      return NextResponse.json(
        { error: 'Subscription not found.' },
        { status: 404 }
      )
    }

    const fromPlan = currentSub.plan
    const isAnnual = billingInterval === 'annual'
    const amountUsd = isAnnual ? planConfig.annual : planConfig.monthly
    const periodEnd = isAnnual
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // ── Upgrade subscription ───────────────────────────────────────────
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan,
        status: 'active',
        billing_interval: billingInterval,
        amount_usd: amountUsd,
        payhere_order_id: orderId,
        jd_quota: planConfig.jd_quota,
        cv_per_jd_quota: planConfig.cv_per_jd_quota,
        current_period_starts_at: new Date().toISOString(),
        current_period_ends_at: periodEnd.toISOString(),
        trial_ends_at: null,
      })
      .eq('id', currentSub.id)

    if (updateError) {
      console.error('Payhere webhook: subscription update failed', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription.' },
        { status: 500 }
      )
    }

    // ── Log event ──────────────────────────────────────────────────────
    await supabase.from('subscription_events').insert({
      subscription_id: currentSub.id,
      user_id: userId,
      event_type: 'upgraded',
      from_plan: fromPlan,
      to_plan: plan,
      amount_usd: amountUsd,
    })

    console.log(
      `Payhere webhook: upgraded ${userId} from ${fromPlan} → ${plan} ($${amountUsd})`
    )

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Payhere webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
