import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import UserDashboardShell from './dashboard-shell'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Upload your CV, get an AI-powered ATS score, and improve your resume with smart suggestions.',
}

export default async function UserDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard/user')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  return <UserDashboardShell profile={profile} />
}
