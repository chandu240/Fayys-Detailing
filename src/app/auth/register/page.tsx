'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type RegData = {
  firstName: string; lastName: string; gender: string
  email: string; phone: string; password: string; confirm: string
  car1: string; car2: string; car3: string
  cardName: string; cardNumber: string; cardExpiry: string; cardCvv: string
}
const INIT: RegData = { firstName:'',lastName:'',gender:'',email:'',phone:'',password:'',confirm:'',car1:'',car2:'',car3:'',cardName:'',cardNumber:'',cardExpiry:'',cardCvv:'' }
const STEPS = ['Account','Garage','Payment']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<RegData>(INIT)
  const [loading, setLoading] = useState(false)
  const set = (k: keyof RegData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setData(d => ({ ...d, [k]: e.target.value }))

  function step1Next() {
    if (!data.firstName || !data.email || !data.password) { toast.error('Fill in required fields'); return }
    if (data.password !== data.confirm) { toast.error('Passwords do not match'); return }
    if (data.password.length < 6) { toast.error('Password must be 6+ characters'); return }
    setStep(2)
  }
  function step2Next() {
    if (!data.car1) { toast.error('Add at least one vehicle'); return }
    setStep(3)
  }
  async function finish(withCard: boolean) {
    setLoading(true)
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { first_name: data.firstName, last_name: data.lastName, gender: data.gender, phone: data.phone, role: 'customer' } }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    const userId = authData.user?.id
    if (userId) {
      const cars = [data.car1, data.car2, data.car3].filter(Boolean)
      if (cars.length) await supabase.from('vehicles').insert(cars.map(label => ({ user_id: userId, label })))
    }
    toast.success('Account created! Please check your email to verify.')
    router.push('/auth/login')
  }

  const card = (content: React.ReactNode) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#0A0A0A', padding: '32px 20px' }}>
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderTop: '2px solid #C9A84C', borderRadius: '2px', padding: '40px', width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: '#F0EDE8', letterSpacing: '0.05em' }}>Fayy's Detailing</div>
          <div style={{ fontSize: '10px', color: '#8A7A5A', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>{STEPS[step-1]}</div>
          <div style={{ width: '24px', height: '1px', background: '#C9A84C', margin: '10px auto 20px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
          {STEPS.map((s, i) => {
            const n = i + 1
            const active = step === n, done = step > n
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {i > 0 && <div style={{ width: '20px', height: '1px', background: '#222' }}></div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: active ? '#C9A84C' : done ? '#666' : '#333' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1px solid ${active ? '#C9A84C' : done ? '#444' : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', background: active ? '#C9A84C' : 'transparent', color: active ? '#0E0E0E' : 'currentColor' }}>
                    {done ? '✓' : n}
                  </div>
                  <span>{s}</span>
                </div>
              </div>
            )
          })}
        </div>
        {content}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#444', marginTop: '20px' }}>
          Have an account? <Link href="/auth/login" style={{ color: '#C9A84C', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )

  if (step === 1) return card(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div><label className="label">First name *</label><input className="input" value={data.firstName} onChange={set('firstName')} placeholder="Alex" /></div>
        <div><label className="label">Last name</label><input className="input" value={data.lastName} onChange={set('lastName')} placeholder="Johnson" /></div>
      </div>
      <div><label className="label">Gender</label><select className="input" value={data.gender} onChange={set('gender')}><option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option></select></div>
      <div><label className="label">Email *</label><input className="input" type="email" value={data.email} onChange={set('email')} placeholder="you@email.com" /></div>
      <div><label className="label">Phone</label><input className="input" type="tel" value={data.phone} onChange={set('phone')} placeholder="(555) 000-0000" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div><label className="label">Password *</label><input className="input" type="password" value={data.password} onChange={set('password')} placeholder="••••••••" /></div>
        <div><label className="label">Confirm *</label><input className="input" type="password" value={data.confirm} onChange={set('confirm')} placeholder="••••••••" /></div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }} onClick={step1Next}>Continue →</button>
    </div>
  )

  if (step === 2) return card(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.6, marginBottom: '2px' }}>Add the vehicles you'd like detailed. You can add more from your profile at any time.</p>
      <div><label className="label">Vehicle 1 *</label><input className="input" value={data.car1} onChange={set('car1')} placeholder="2023 Lamborghini Urus" /></div>
      <div><label className="label">Vehicle 2 <span style={{ color: '#333' }}>(optional)</span></label><input className="input" value={data.car2} onChange={set('car2')} placeholder="2022 Porsche 911" /></div>
      <div><label className="label">Vehicle 3 <span style={{ color: '#333' }}>(optional)</span></label><input className="input" value={data.car3} onChange={set('car3')} placeholder="2021 Ferrari Roma" /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Back</button>
        <button className="btn btn-primary btn-sm" onClick={step2Next}>Continue →</button>
      </div>
    </div>
  )

  return card(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ background: '#C9A84C0D', border: '1px solid #C9A84C22', borderRadius: '2px', padding: '10px 14px', fontSize: '11px', color: '#8A7A5A', lineHeight: 1.6 }}>
        <span style={{ color: '#C9A84C' }}>Optional.</span> Stored securely via Stripe. Only charged for approved appointments and membership renewals.
      </div>
      <div><label className="label">Name on card</label><input className="input" value={data.cardName} onChange={set('cardName')} placeholder="Alex Johnson" /></div>
      <div><label className="label">Card number</label><input className="input" value={data.cardNumber} onChange={set('cardNumber')} placeholder="•••• •••• •••• ••••" maxLength={19} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div><label className="label">Expiry</label><input className="input" value={data.cardExpiry} onChange={set('cardExpiry')} placeholder="MM / YY" maxLength={7} /></div>
        <div><label className="label">CVV</label><input className="input" value={data.cardCvv} onChange={set('cardCvv')} placeholder="•••" maxLength={4} /></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>← Back</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={() => finish(false)} disabled={loading}>Skip</button>
          <button className="btn btn-primary btn-sm" onClick={() => finish(true)} disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        </div>
      </div>
    </div>
  )
}
