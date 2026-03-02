import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { getUserSubscription, checkJDQuota } from '@/lib/quota'

// ── GET: Fetch jobs for the logged-in HR manager ─────────────────────────────
export async function GET() {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: jobs, error } = await serverClient
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch jobs error:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs.' }, { status: 500 })
    }

    return NextResponse.json({ jobs }, { status: 200 })
  } catch (err) {
    console.error('Jobs GET error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── POST: Create a new job description ───────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, required_skills, experience_years, location, employment_type } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
    }

    // ── Quota check ──────────────────────────────────────────────────────
    const subscription = await getUserSubscription(user.id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found.' }, { status: 403 })
    }

    const quotaCheck = await checkJDQuota(user.id, subscription)
    if (!quotaCheck.allowed) {
      return NextResponse.json({ error: quotaCheck.message }, { status: quotaCheck.status })
    }

    // ── Insert job ───────────────────────────────────────────────────────
    const adminClient = createSupabaseAdminClient()

    const { data: job, error } = await adminClient
      .from('jobs')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        required_skills: required_skills || [],
        experience_years: experience_years || null,
        location: location?.trim() || null,
        employment_type: employment_type?.trim() || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert job error:', error)
      return NextResponse.json({ error: 'Failed to create job.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, job }, { status: 201 })
  } catch (err) {
    console.error('Jobs POST error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── PATCH: Update a job description ──────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId, ...updates } = body

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId.' }, { status: 400 })
    }

    const adminClient = createSupabaseAdminClient()

    const { data, error } = await adminClient
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update job error:', error)
      return NextResponse.json({ error: 'Failed to update job.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, job: data }, { status: 200 })
  } catch (err) {
    console.error('Jobs PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
