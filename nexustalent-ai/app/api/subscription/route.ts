import { NextRequest, NextResponse } from 'next/server'
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from '@/lib/supabase-server'

// ── Plan configuration (same as payhere route) ────────────────────────────────
const PLAN_CONFIG: Record<
  string,
  { jd_quota: number; cv_per_jd_quota: number; monthly: number; annual: number }
> = {
  starter: { jd_quota: 10, cv_per_jd_quota: 50, monthly: 19, annual: 180 },
  growth: { jd_quota: 50, cv_per_jd_quota: 200, monthly: 49, annual: 468 },
  scale: { jd_quota: 9999, cv_per_jd_quota: 500, monthly: 99, annual: 948 },
}

// ── GET: Fetch current user's subscription ───────────────────────────────────
export async function GET() {
  try {
    const serverClient = await createSupabaseServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: subscription, error } = await serverClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'No subscription found.' },
        { status: 404 }
      )
    }

    // Check if trial expired
    if (
      subscription.plan === 'trial' &&
      subscription.trial_ends_at &&
      new Date(subscription.trial_ends_at) < new Date()
    ) {
      subscription.status = 'expired'
    }

    return NextResponse.json({ subscription }, { status: 200 })
  } catch (err) {
    console.error('Subscription GET error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

// ── POST: Subscription actions ───────────────────────────────────────────────
// body.action: 'cancel' | 'simulate_upgrade'
export async function POST(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const adminClient = createSupabaseAdminClient()

    // Get current subscription
    const { data: currentSub } = await adminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!currentSub) {
      return NextResponse.json(
        { error: 'No subscription found.' },
        { status: 404 }
      )
    }

    // ── Cancel ─────────────────────────────────────────────────────────
    if (action === 'cancel') {
      const { error: updateError } = await adminClient
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', currentSub.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to cancel subscription.' },
          { status: 500 }
        )
      }

      await adminClient.from('subscription_events').insert({
        subscription_id: currentSub.id,
        user_id: user.id,
        event_type: 'cancelled',
        from_plan: currentSub.plan,
        to_plan: null,
        amount_usd: null,
      })

      return NextResponse.json(
        { success: true, message: 'Subscription cancelled.' },
        { status: 200 }
      )
    }

    // ── Simulate Upgrade (for development/demo) ────────────────────────
    if (action === 'simulate_upgrade') {
      const { plan, billingInterval } = body as {
        plan: string
        billingInterval: 'monthly' | 'annual'
      }

      const planConfig = PLAN_CONFIG[plan]
      if (!planConfig) {
        return NextResponse.json(
          { error: `Invalid plan: ${plan}` },
          { status: 400 }
        )
      }

      const fromPlan = currentSub.plan
      const isAnnual = billingInterval === 'annual'
      const amountUsd = isAnnual ? planConfig.annual : planConfig.monthly
      const periodEnd = isAnnual
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const { error: updateError } = await adminClient
        .from('subscriptions')
        .update({
          plan,
          status: 'active',
          billing_interval: billingInterval,
          amount_usd: amountUsd,
          jd_quota: planConfig.jd_quota,
          cv_per_jd_quota: planConfig.cv_per_jd_quota,
          current_period_starts_at: new Date().toISOString(),
          current_period_ends_at: periodEnd.toISOString(),
          trial_ends_at: null,
          payhere_order_id: `SIM-${Date.now()}`,
        })
        .eq('id', currentSub.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to upgrade subscription.' },
          { status: 500 }
        )
      }

      await adminClient.from('subscription_events').insert({
        subscription_id: currentSub.id,
        user_id: user.id,
        event_type: 'upgraded',
        from_plan: fromPlan,
        to_plan: plan,
        amount_usd: amountUsd,
      })

      return NextResponse.json(
        { success: true, message: `Upgraded to ${plan} (${billingInterval}).` },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: cancel, simulate_upgrade.' },
      { status: 400 }
    )
  } catch (err) {
    console.error('Subscription POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
