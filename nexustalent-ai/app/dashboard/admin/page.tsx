import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import AdminDashboardShell from './dashboard-shell'

export const metadata: Metadata = {
  title: 'Admin Dashboard — NexusTalent AI',
  description: 'Monitor MRR, user growth, churn, and platform health metrics.',
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard/user')
  }

  return <AdminDashboardShell profile={profile} />
}
