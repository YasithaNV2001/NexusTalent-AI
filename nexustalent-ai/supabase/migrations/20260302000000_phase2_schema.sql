-- ============================================================================
-- NexusTalent AI — Phase 2: Database Schema & Supabase Setup
-- ============================================================================
-- Run this entire script in the Supabase Dashboard SQL Editor as a single
-- transaction. It creates all tables, triggers, indexes, and RLS policies.
-- ============================================================================


-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- 1. PROFILES
-- ============================================================================
-- 1:1 with auth.users. Rows are created automatically via the
-- handle_new_user trigger (section 7).
-- ============================================================================
CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT        NOT NULL DEFAULT 'jobseeker'
                            CHECK (role IN ('jobseeker', 'hr_manager', 'admin')),
  org_name      TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  last_seen_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles
  IS 'User profiles, 1:1 with auth.users. Created automatically via trigger.';


-- ============================================================================
-- 2. SUBSCRIPTIONS
-- ============================================================================
-- One subscription per user. Tracks plan tier, quotas, billing, and trial.
-- ============================================================================
CREATE TABLE public.subscriptions (
  id                         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                    UUID          NOT NULL UNIQUE
                                           REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan                       TEXT          NOT NULL DEFAULT 'trial'
                                           CHECK (plan IN ('trial','starter','growth','scale','enterprise')),
  status                     TEXT          NOT NULL DEFAULT 'active'
                                           CHECK (status IN ('active','expired','cancelled')),
  trial_ends_at              TIMESTAMPTZ,
  current_period_starts_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  current_period_ends_at     TIMESTAMPTZ,
  billing_interval           TEXT          NOT NULL DEFAULT 'monthly'
                                           CHECK (billing_interval IN ('monthly','annual')),
  amount_usd                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  payhere_order_id           TEXT,
  jd_quota                   INTEGER       NOT NULL DEFAULT 2,
  cv_per_jd_quota            INTEGER       NOT NULL DEFAULT 10,
  created_at                 TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions
  IS 'One subscription per user. Tracks plan, quotas, and billing cycle.';


-- ============================================================================
-- 3. SUBSCRIPTION_EVENTS (immutable audit log)
-- ============================================================================
-- Immutable log of all subscription state changes. Used for churn tracking
-- and MRR history. No UPDATE/DELETE should ever be performed on this table.
-- ============================================================================
CREATE TABLE public.subscription_events (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id   UUID          NOT NULL
                                  REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id           UUID          NOT NULL
                                  REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type        TEXT          NOT NULL
                                  CHECK (event_type IN (
                                    'trial_started','upgraded','renewed',
                                    'cancelled','expired','reactivated'
                                  )),
  from_plan         TEXT          CHECK (from_plan IS NULL OR from_plan IN (
                                    'trial','starter','growth','scale','enterprise'
                                  )),
  to_plan           TEXT          CHECK (to_plan IS NULL OR to_plan IN (
                                    'trial','starter','growth','scale','enterprise'
                                  )),
  amount_usd        NUMERIC(10,2),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscription_events
  IS 'Immutable audit log of subscription changes for churn and MRR tracking.';


-- ============================================================================
-- 4. JOBS
-- ============================================================================
-- Job descriptions created by HR managers. Quota-scoped per billing cycle.
-- ============================================================================
CREATE TABLE public.jobs (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL
                                REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT        NOT NULL,
  required_skills   TEXT[]      NOT NULL DEFAULT '{}',
  experience_years  INTEGER,
  location          TEXT,
  employment_type   TEXT,
  status            TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active','closed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jobs
  IS 'Job descriptions created by HR managers.';


-- ============================================================================
-- 5. RESUMES
-- ============================================================================
-- Uploaded CVs with AI scoring data. job_id is NULL for B2C uploads,
-- non-NULL for B2B (linked to a specific job).
-- ============================================================================
CREATE TABLE public.resumes (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID        NOT NULL
                                REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id            UUID        REFERENCES public.jobs(id) ON DELETE SET NULL,
  storage_path      TEXT        NOT NULL,
  candidate_name    TEXT,
  candidate_email   TEXT,
  ats_score         INTEGER     CHECK (ats_score IS NULL OR (ats_score >= 0 AND ats_score <= 100)),
  match_score       INTEGER     CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 100)),
  ai_suggestions    JSONB,
  parsed_data       JSONB,
  draft_content     JSONB       DEFAULT NULL,
  status            TEXT        NOT NULL DEFAULT 'processing'
                                CHECK (status IN ('processing','scored','failed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resumes
  IS 'Uploaded CVs with AI scoring, parsed data, and editor draft state.';


-- ============================================================================
-- 6. CONTACT_SUBMISSIONS
-- ============================================================================
-- B2B support contact form submissions. Managed by admin via support queue.
-- ============================================================================
CREATE TABLE public.contact_submissions (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  company       TEXT,
  subject       TEXT        NOT NULL,
  message       TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'new'
                            CHECK (status IN ('new','in_progress','resolved')),
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contact_submissions
  IS 'Contact form submissions from landing page. Admin-managed support queue.';


-- ============================================================================
-- 7. TRIGGER FUNCTION: handle_new_user
-- ============================================================================
-- Fires AFTER INSERT on auth.users. Creates a profiles row with data
-- extracted from user metadata. Handles both email/password and Google OAuth
-- metadata shapes via COALESCE fallbacks.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NULL
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture',
      NULL
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 8. TRIGGER FUNCTION: handle_new_profile_subscription
-- ============================================================================
-- Fires AFTER INSERT on profiles. Auto-creates a trial subscription and
-- logs a 'trial_started' event. Ensures getUserSubscription() in quota.ts
-- never returns null for any user.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_profile_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_sub_id UUID;
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at, jd_quota, cv_per_jd_quota)
  VALUES (
    NEW.id,
    'trial',
    'active',
    now() + INTERVAL '7 days',
    2,
    10
  )
  RETURNING id INTO new_sub_id;

  INSERT INTO public.subscription_events (subscription_id, user_id, event_type, to_plan)
  VALUES (
    new_sub_id,
    NEW.id,
    'trial_started',
    'trial'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_subscription();


-- ============================================================================
-- 9. TRIGGER FUNCTION: handle_updated_at
-- ============================================================================
-- Generic BEFORE UPDATE trigger that sets updated_at = now().
-- Applied to all tables with an updated_at column EXCEPT
-- subscription_events (which is immutable).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 10. INDEXES
-- ============================================================================
-- Each index targets a specific query pattern in the existing codebase.
-- ============================================================================

-- JD quota check (quota.ts: checkJDQuota)
-- Query: .from('jobs').eq('user_id', userId).gte('created_at', period_start)
CREATE INDEX idx_jobs_user_id_created_at
  ON public.jobs (user_id, created_at DESC);

-- CV-per-JD quota check (quota.ts: checkCVQuota)
-- Query: .from('resumes').eq('job_id', jobId).eq('owner_id', userId).gte('created_at', period_start)
CREATE INDEX idx_resumes_job_owner_created
  ON public.resumes (job_id, owner_id, created_at DESC);

-- Active B2C user count (metrics.ts: getAdminMetrics)
-- Query: .from('resumes').is('job_id', null).gte('created_at', thirtyDaysAgo)
CREATE INDEX idx_resumes_owner_created
  ON public.resumes (owner_id, created_at DESC);

-- Signup count queries (metrics.ts: getAdminMetrics)
-- Query: .from('profiles').gte('created_at', ...)
CREATE INDEX idx_profiles_created_at
  ON public.profiles (created_at DESC);

-- MRR calculation (metrics.ts: getAdminMetrics)
-- Query: .from('subscriptions').eq('status', 'active').not('plan', 'in', ...)
CREATE INDEX idx_subscriptions_status_plan
  ON public.subscriptions (status, plan);

-- Churn rate (metrics.ts: getAdminMetrics)
-- Query: .from('subscription_events').in('event_type', [...]).gte('created_at', ...)
CREATE INDEX idx_sub_events_type_created
  ON public.subscription_events (event_type, created_at DESC);

-- Admin support queue filtering
CREATE INDEX idx_contact_status
  ON public.contact_submissions (status, created_at DESC);


-- ============================================================================
-- 11. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions   ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 12. RLS POLICIES: profiles
-- ============================================================================
-- Users can read and update their own profile.
-- INSERT is handled by handle_new_user trigger (SECURITY DEFINER).
-- DELETE goes through admin API routes (service role key).
-- ============================================================================

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ============================================================================
-- 13. RLS POLICIES: subscriptions
-- ============================================================================
-- Users can only read their own subscription.
-- All mutations (upgrades, cancellations) go through API routes using
-- the service role key. INSERT handled by trigger (SECURITY DEFINER).
-- ============================================================================

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================================
-- 14. RLS POLICIES: subscription_events
-- ============================================================================
-- Read-only for the owning user. This table is immutable — only written
-- to by server-side code using the service role key.
-- ============================================================================

CREATE POLICY "sub_events_select_own" ON public.subscription_events
  FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================================
-- 15. RLS POLICIES: jobs
-- ============================================================================
-- HR managers have full CRUD on their own job descriptions.
-- Role-gating is enforced at the middleware and API route level.
-- ============================================================================

CREATE POLICY "jobs_select_own" ON public.jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "jobs_insert_own" ON public.jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_update_own" ON public.jobs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_delete_own" ON public.jobs
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================================
-- 16. RLS POLICIES: resumes
-- ============================================================================
-- Users have full CRUD on their own resumes (B2C and B2B).
-- ============================================================================

CREATE POLICY "resumes_select_own" ON public.resumes
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "resumes_insert_own" ON public.resumes
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "resumes_update_own" ON public.resumes
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "resumes_delete_own" ON public.resumes
  FOR DELETE
  USING (auth.uid() = owner_id);


-- ============================================================================
-- 17. RLS POLICIES: contact_submissions
-- ============================================================================
-- Authenticated users can insert with their own user_id.
-- Anonymous users can insert with null user_id.
-- Authenticated users can read their own submissions.
-- Admin reads/updates go through service role key.
-- ============================================================================

CREATE POLICY "contact_insert_authenticated" ON public.contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contact_insert_anon" ON public.contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "contact_select_own" ON public.contact_submissions
  FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================================
-- DONE — Phase 2 migration complete.
-- ============================================================================
-- Verification checklist:
-- 1. All 6 tables visible in Supabase Table Editor
-- 2. RLS enabled (padlock icons closed) in Authentication > Policies
-- 3. All 7 triggers visible in Database > Triggers
-- 4. Test signup creates: profiles row + subscriptions row + subscription_events row
-- ============================================================================
