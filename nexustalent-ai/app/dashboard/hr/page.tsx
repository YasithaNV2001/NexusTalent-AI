import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import HRDashboardShell from './dashboard-shell'

export const metadata: Metadata = {
  title: 'HR Dashboard — NexusTalent AI',
  description: 'Post job descriptions, upload candidate CVs in bulk, and rank them with AI.',
}

export default async function HRDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/hr')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  return <HRDashboardShell profile={profile} />
}
