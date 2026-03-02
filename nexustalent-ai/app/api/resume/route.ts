import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

// ── GET: Fetch resumes for the logged-in user ────────────────────────────────
// Query params: ?jobId=xxx (B2B — filter by job) | no param (B2C — job_id IS NULL)
export async function GET(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const jobId = request.nextUrl.searchParams.get('jobId')

    let query = serverClient
      .from('resumes')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (jobId) {
      query = query.eq('job_id', jobId)
    } else {
      query = query.is('job_id', null)
    }

    const { data: resumes, error } = await query

    if (error) {
      console.error('Fetch resumes error:', error)
      return NextResponse.json({ error: 'Failed to fetch resumes.' }, { status: 500 })
    }

    return NextResponse.json({ resumes }, { status: 200 })
  } catch (err) {
    console.error('Resume GET error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── PATCH: Update resume draft content (B2C editor auto-save) ────────────────
export async function PATCH(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { resumeId, draft_content } = body

    if (!resumeId || !draft_content) {
      return NextResponse.json({ error: 'Missing resumeId or draft_content.' }, { status: 400 })
    }

    const adminClient = createSupabaseAdminClient()

    const { data, error } = await adminClient
      .from('resumes')
      .update({ draft_content })
      .eq('id', resumeId)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update draft error:', error)
      return NextResponse.json({ error: 'Failed to save draft.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: data }, { status: 200 })
  } catch (err) {
    console.error('Resume PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ── DELETE: Remove a resume ──────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { resumeId } = await request.json()

    if (!resumeId) {
      return NextResponse.json({ error: 'Missing resumeId.' }, { status: 400 })
    }

    const adminClient = createSupabaseAdminClient()

    // Fetch resume to get storage path
    const { data: resume } = await adminClient
      .from('resumes')
      .select('storage_path')
      .eq('id', resumeId)
      .eq('owner_id', user.id)
      .single()

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found.' }, { status: 404 })
    }

    // Delete from storage
    await adminClient.storage.from('resumes').remove([resume.storage_path])

    // Delete DB record
    const { error } = await adminClient
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('owner_id', user.id)

    if (error) {
      console.error('Delete resume error:', error)
      return NextResponse.json({ error: 'Failed to delete resume.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Resume DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
