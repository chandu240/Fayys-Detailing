'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.session) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single()
      window.location.href = profile?.role === 'admin' ? '/admin' : '/dashboard'
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', padding: '28px' }}>
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderTop: '2px solid #C9A84C', borderRadius: '2px', padding: '44px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#F0EDE8', letterSpacing: '0.05em' }}>Fayy's Detailing</div>
          <div style={{ fontSize: '10px', color: '#8A7A5A', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '6px' }}>Premier Automotive Care</div>
          <div style={{ width: '32px', height: '1px', background: '#C9A84C', margin: '12px auto 0' }}></div>
        </div>

        <div style={{ background: '#C9A84C0D', border: '1px solid #C9A84C22', borderRadius: '2px', padding: '10px 14px', fontSize: '11px', color: '#8A7A5A', lineHeight: 1.6, marginBottom: '20px' }}>
          <span style={{ color: '#C9A84C' }}>Payment on file</span> — We use a saved card to automate billing and appointment charges. Optional at signup.
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label className="label">Email address</label>
            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#444', marginTop: '20px' }}>
          No account?{' '}
          <Link href="/auth/register" style={{ color: '#C9A84C', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
