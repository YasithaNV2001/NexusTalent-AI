import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getAdminMetrics } from '@/lib/metrics'

export async function GET() {
  try {
    const serverClient = await createSupabaseServerClient()
    const { data: { user } } = await serverClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await serverClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 })
    }

    const metrics = await getAdminMetrics()
    return NextResponse.json({ metrics }, { status: 200 })
  } catch (err) {
    console.error('Admin metrics error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
