import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { Subscription } from '@/types'

export interface QuotaCheckResult {
  allowed: boolean
  status: number
  message: string
}

export async function checkSubscriptionValid(
  subscription: Subscription
): Promise<QuotaCheckResult> {
  if (
    subscription.plan === 'trial' &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date()
  ) {
    return {
      allowed: false,
      status: 403,
      message:
        'Your 7-day free trial has expired. Please upgrade to continue.',
    }
  }

  if (subscription.status !== 'active') {
    return {
      allowed: false,
      status: 403,
      message:
        'Your subscription is inactive. Please renew your plan to continue.',
    }
  }

  return { allowed: true, status: 200, message: 'OK' }
}

export async function checkJDQuota(
  userId: string,
  subscription: Subscription
): Promise<QuotaCheckResult> {
  const validCheck = await checkSubscriptionValid(subscription)
  if (!validCheck.allowed) return validCheck

  const supabase = createSupabaseAdminClient()

  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', subscription.current_period_starts_at)

  if (error) {
    return { allowed: false, status: 500, message: 'Failed to check quota.' }
  }

  const used = count ?? 0

  if (used >= subscription.jd_quota) {
    return {
      allowed: false,
      status: 403,
      message: `Job description limit reached for this billing cycle (${used}/${subscription.jd_quota} used). Upgrade your plan or wait for your next billing cycle.`,
    }
  }

  return { allowed: true, status: 200, message: 'OK' }
}

export async function checkCVQuota(
  userId: string,
  jobId: string,
  subscription: Subscription
): Promise<QuotaCheckResult> {
  const validCheck = await checkSubscriptionValid(subscription)
  if (!validCheck.allowed) return validCheck

  const supabase = createSupabaseAdminClient()

  const { count, error } = await supabase
    .from('resumes')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
    .eq('owner_id', userId)
    .gte('created_at', subscription.current_period_starts_at)

  if (error) {
    return { allowed: false, status: 500, message: 'Failed to check CV quota.' }
  }

  const used = count ?? 0

  if (used >= subscription.cv_per_jd_quota) {
    return {
      allowed: false,
      status: 403,
      message: `CV limit reached for this job (${used}/${subscription.cv_per_jd_quota} used). Upgrade your plan to process more candidates.`,
    }
  }

  return { allowed: true, status: 200, message: 'OK' }
}

export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as Subscription
}