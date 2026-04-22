import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
  if (!profile) redirect('/auth/login')
  if (profile.role === 'admin') redirect('/admin')
  return <AppShell profile={profile}>{children}</AppShell>
}
