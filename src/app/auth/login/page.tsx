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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-7">
          <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Fayy's Detailing</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule your next detail</p>
        </div>
        <div className="bg-brand-50 rounded-lg p-3 mb-5 text-xs text-brand-800 leading-relaxed">
          <span className="font-medium">Payment on file (optional)</span> — We use a saved card
          to automate membership billing and approved appointment charges. You can add one during
          signup or anytime in your profile.
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <input className="input" type="email" required value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-brand-600 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
