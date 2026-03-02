import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { AdminMetrics } from '@/types'

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createSupabaseAdminClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [
    subsResult,
    profilesResult,
    b2cActiveResult,
    b2bActiveResult,
    signups30dResult,
    signups7dResult,
    signupsTodayResult,
    churnedResult,
    activeStartMonthResult,
    lastMonthMRRResult,
  ] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan, status, amount_usd, billing_interval')
      .eq('status', 'active')
      .not('plan', 'in', '("trial","enterprise")'),

    supabase.from('profiles').select('role', { count: 'exact' }),

    supabase
      .from('resumes')
      .select('owner_id')
      .is('job_id', null)
      .gte('created_at', thirtyDaysAgo),

    supabase
      .from('jobs')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo),

    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo),

    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', sevenDaysAgo),

    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfToday),

    supabase
      .from('subscription_events')
      .select('id', { count: 'exact' })
      .in('event_type', ['cancelled', 'expired'])
      .gte('created_at', startOfMonth),

    supabase
      .from('subscriptions')
      .select('id', { count: 'exact' })
      .lt('created_at', startOfMonth)
      .eq('status', 'active'),

    supabase
      .from('subscriptions')
      .select('amount_usd, billing_interval')
      .eq('status', 'active')
      .not('plan', 'in', '("trial","enterprise")')
      .lt('created_at', startOfMonth),
  ])

  const activeSubs = subsResult.data ?? []

  const mrr_usd = activeSubs.reduce((sum, s) => {
    const monthly = s.billing_interval === 'annual' ? s.amount_usd / 12 : s.amount_usd
    return sum + monthly
  }, 0)

  const planMap: Record<string, { count: number; mrr: number }> = {}
  for (const s of activeSubs) {
    if (!planMap[s.plan]) planMap[s.plan] = { count: 0, mrr: 0 }
    planMap[s.plan].count++
    planMap[s.plan].mrr +=
      s.billing_interval === 'annual' ? s.amount_usd / 12 : s.amount_usd
  }

  const mrr_by_plan = Object.entries(planMap).map(([plan, v]) => ({
    plan: plan as any,
    customer_count: v.count,
    plan_mrr: Math.round(v.mrr * 100) / 100,
  }))

  const lastMonthMRR = (lastMonthMRRResult.data ?? []).reduce((sum, s) => {
    return sum + (s.billing_interval === 'annual' ? s.amount_usd / 12 : s.amount_usd)
  }, 0)

  const mrr_growth_percent =
    lastMonthMRR > 0
      ? Math.round(((mrr_usd - lastMonthMRR) / lastMonthMRR) * 1000) / 10
      : 0

  const allProfiles = profilesResult.data ?? []
  const total_users = allProfiles.length
  const total_b2c_users = allProfiles.filter((p: any) => p.role === 'jobseeker').length
  const total_b2b_users = allProfiles.filter((p: any) => p.role === 'hr_manager').length

  // Distinct active users (not row counts)
  const active_b2c_30d = new Set((b2cActiveResult.data ?? []).map((r: { owner_id: string }) => r.owner_id)).size
  const active_b2b_30d = new Set((b2bActiveResult.data ?? []).map((r: { user_id: string }) => r.user_id)).size

  const churned_this_month = churnedResult.count ?? 0
  const active_start_of_month = activeStartMonthResult.count ?? 1
  const churn_rate_percent =
    Math.round((churned_this_month / active_start_of_month) * 1000) / 10

  return {
    mrr_usd: Math.round(mrr_usd * 100) / 100,
    arr_usd: Math.round(mrr_usd * 12 * 100) / 100,
    mrr_by_plan,
    mrr_growth_percent,
    total_users,
    total_b2c_users,
    total_b2b_users,
    new_signups_30d: signups30dResult.count ?? 0,
    new_signups_7d: signups7dResult.count ?? 0,
    new_signups_today: signupsTodayResult.count ?? 0,
    active_b2c_30d,
    active_b2b_30d,
    churn_rate_percent,
    churned_this_month,
    active_start_of_month,
  }
}