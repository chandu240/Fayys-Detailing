'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const customerNav = [
  { href: '/dashboard',             label: 'Calendar' },
  { href: '/dashboard/requests',    label: 'My requests' },
  { href: '/dashboard/memberships', label: 'Memberships' },
  { href: '/dashboard/profile',     label: 'My profile' },
]

const adminNav = [
  { href: '/admin',             label: 'Overview' },
  { href: '/admin/calendar',    label: 'Calendar' },
  { href: '/admin/requests',    label: 'Requests' },
  { href: '/admin/customers',   label: 'Customers' },
  { href: '/admin/memberships', label: 'Memberships' },
]

export default function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isAdmin = profile.role === 'admin'
  const nav = isAdmin ? adminNav : customerNav

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = `${profile.first_name[0] || ''}${profile.last_name[0] || ''}`.toUpperCase() || '?'
  const name = `${profile.first_name} ${profile.last_name}`.trim()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium leading-tight">Fayy's Detailing</div>
            <div className="text-xs text-gray-400">{isAdmin ? 'Business' : 'Customer'}</div>
          </div>
        </div>
        <nav className="flex-1 py-2">
          {nav.map(({ href, label }) => {
            const active = pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href))
            return (
              <a key={href} href={href}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2
                  ${active ? 'text-brand-600 bg-brand-50 border-brand-600 font-medium' : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'}`}>
                {label}
              </a>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{name}</div>
              <div className="text-xs text-gray-400 capitalize">{profile.role}</div>
            </div>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-600 text-xs" title="Sign out">✕</button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
