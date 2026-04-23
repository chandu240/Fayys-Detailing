'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const customerNav = [
  { href: '/dashboard',             label: 'Calendar' },
  { href: '/dashboard/requests',    label: 'My requests' },
  { href: '/dashboard/memberships', label: 'Memberships' },
  { href: '/dashboard/profile',     label: 'Profile' },
]

const adminNav = [
  { href: '/admin',             label: 'Overview' },
  { href: '/admin/calendar',    label: 'Calendar' },
  { href: '/admin/requests',    label: 'Requests' },
  { href: '/admin/customers',   label: 'Clients' },
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0E0E0E' }}>
      <aside style={{ width: '220px', background: '#111', borderRight: '1px solid #1E1E1E', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1A1A1A' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: '#F0EDE8', letterSpacing: '0.04em' }}>Fayy's</div>
          <div style={{ fontSize: '10px', color: '#8A7A5A', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '3px' }}>Premier Detailing</div>
          <div style={{ width: '28px', height: '1px', background: '#C9A84C', marginTop: '10px' }}></div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {nav.map(({ href, label }) => {
            const active = pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href))
            return (
              <a key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 20px', fontSize: '11px', letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none',
                borderLeft: `2px solid ${active ? '#C9A84C' : 'transparent'}`,
                color: active ? '#C9A84C' : '#555',
                background: active ? '#161616' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }}></div>
                {label}
              </a>
            )
          })}
        </nav>

        <div style={{ padding: '14px 20px', borderTop: '1px solid #1A1A1A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1A1A1A', border: '1px solid #C9A84C33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500, color: '#C9A84C', fontFamily: "'Cormorant Garamond', serif", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#AAA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1px' }}>{isAdmin ? 'Business' : 'Client'}</div>
            </div>
            <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: '14px', padding: '2px' }} title="Sign out">→</button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', background: '#0E0E0E' }}>{children}</main>
    </div>
  )
}
