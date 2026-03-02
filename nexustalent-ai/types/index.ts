export type UserRole = 'jobseeker' | 'hr_manager' | 'admin'

export type SubscriptionPlan =
  | 'trial'
  | 'starter'
  | 'growth'
  | 'scale'
  | 'enterprise'

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled'

export type ResumeStatus = 'processing' | 'scored' | 'failed'

export type ContactStatus = 'new' | 'in_progress' | 'resolved'

export type JobStatus = 'active' | 'closed'

export type BillingInterval = 'monthly' | 'annual'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  org_name: string | null
  is_active: boolean
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trial_ends_at: string | null
  current_period_starts_at: string
  current_period_ends_at: string | null
  billing_interval: BillingInterval
  amount_usd: number
  payhere_order_id: string | null
  jd_quota: number
  cv_per_jd_quota: number
  created_at: string
  updated_at: string
}

export interface SubscriptionEvent {
  id: string
  subscription_id: string
  user_id: string
  event_type:
    | 'trial_started'
    | 'upgraded'
    | 'renewed'
    | 'cancelled'
    | 'expired'
    | 'reactivated'
  from_plan: SubscriptionPlan | null
  to_plan: SubscriptionPlan | null
  amount_usd: number | null
  created_at: string
}

export interface Job {
  id: string
  user_id: string
  title: string
  description: string
  required_skills: string[]
  experience_years: number | null
  location: string | null
  employment_type: string | null
  status: JobStatus
  created_at: string
  updated_at: string
}

export interface ParsedResumeData {
  skills: string[]
  experience: Array<{
    company: string
    title: string
    duration: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
  summary: string | null
}

export interface AISuggestion {
  category: 'formatting' | 'content' | 'keywords' | 'impact'
  priority: 'high' | 'medium' | 'low'
  text: string
}

export interface Resume {
  id: string
  owner_id: string
  job_id: string | null
  storage_path: string
  candidate_name: string | null
  candidate_email: string | null
  ats_score: number | null
  match_score: number | null
  ai_suggestions: AISuggestion[] | null
  parsed_data: ParsedResumeData | null
  draft_content: ParsedResumeData | null
  status: ResumeStatus
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  user_id: string | null
  full_name: string
  email: string
  company: string | null
  subject: string
  message: string
  status: ContactStatus
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface AdminMetrics {
  mrr_usd: number
  arr_usd: number
  mrr_by_plan: Array<{
    plan: SubscriptionPlan
    customer_count: number
    plan_mrr: number
  }>
  mrr_growth_percent: number
  total_users: number
  total_b2c_users: number
  total_b2b_users: number
  new_signups_30d: number
  new_signups_7d: number
  new_signups_today: number
  active_b2c_30d: number
  active_b2b_30d: number
  churn_rate_percent: number
  churned_this_month: number
  active_start_of_month: number
}

export interface PricingTier {
  id: SubscriptionPlan
  name: string
  monthly_price: number | null
  annual_price: number | null
  jd_quota: number | string
  cv_per_jd_quota: number | string
  features: string[]
  is_popular: boolean
  cta_label: string
}