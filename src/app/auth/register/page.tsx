'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'

type RegData = {
  firstName: string; lastName: string; gender: string
  email: string; phone: string; password: string; confirm: string
  car1: string; car2: string; car3: string
  cardName: string; cardNumber: string; cardExpiry: string; cardCvv: string
}

const INIT: RegData = {
  firstName:'',lastName:'',gender:'',email:'',phone:'',password:'',confirm:'',
  car1:'',car2:'',car3:'',cardName:'',cardNumber:'',cardExpiry:'',cardCvv:''
}

const STEPS = ['Account','Vehicles','Payment']

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = step > n
        const active = step === n
        return (
          <div key={n} className="flex items-center gap-1">
            {i > 0 && <div className="w-7 h-px bg-gray-200" />}
            <div className={`flex items-center gap-1.5 ${active ? 'text-brand-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium border
                ${active ? 'bg-brand-600 border-brand-600 text-white' : done ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200'}`}>
                {done ? <Check className="w-3 h-3" /> : n}
              </div>
              <span className="text-xs">{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<RegData>(INIT)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof RegData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setData(d => ({ ...d, [k]: e.target.value }))

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
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          gender: data.gender,
          phone: data.phone,
          role: 'customer',
        }
      }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    const userId = authData.user?.id
    if (userId) {
      const cars = [data.car1, data.car2, data.car3].filter(Boolean)
      if (cars.length) {
        await supabase.from('vehicles').insert(cars.map(label => ({ user_id: userId, label })))
      }
    }
    toast.success('Account created! Check your email to verify.')
    router.push('/auth/login')
  }

  const titles = ['Create your account', 'Your garage', 'Card on file']

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 p-4 pt-10">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold">{titles[step - 1]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fayy's Detailing</p>
        </div>
        <StepIndicator step={step} />
        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First name *</label><input className="input" value={data.firstName} onChange={set('firstName')} placeholder="Alex" /></div>
              <div><label className="label">Last name</label><input className="input" value={data.lastName} onChange={set('lastName')} placeholder="Johnson" /></div>
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={data.gender} onChange={set('gender')}>
                <option value="">Prefer not to say</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Email address *</label><input className="input" type="email" value={data.email} onChange={set('email')} placeholder="you@email.com" /></div>
            <div><label className="label">Phone number</label><input className="input" type="tel" value={data.phone} onChange={set('phone')} placeholder="(555) 000-0000" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Password *</label><input className="input" type="password" value={data.password} onChange={set('password')} placeholder="••••••••" /></div>
              <div><label className="label">Confirm *</label><input className="input" type="password" value={data.confirm} onChange={set('confirm')} placeholder="••••••••" /></div>
            </div>
            <button className="btn btn-primary w-full mt-1" onClick={step1Next}>Next →</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-1">Add the vehicles you'd like detailed. You can add more later.</p>
            <div><label className="label">Vehicle 1 *</label><input className="input" value={data.car1} onChange={set('car1')} placeholder="e.g. 2021 Toyota Camry" /></div>
            <div><label className="label">Vehicle 2 <span className="text-gray-400 font-normal">(optional)</span></label><input className="input" value={data.car2} onChange={set('car2')} placeholder="e.g. 2019 Ford F-150" /></div>
            <div><label className="label">Vehicle 3 <span className="text-gray-400 font-normal">(optional)</span></label><input className="input" value={data.car3} onChange={set('car3')} placeholder="e.g. 2023 Honda CR-V" /></div>
            <div className="flex justify-between pt-1">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={step2Next}>Next →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-brand-50 rounded-lg p-3 text-xs text-brand-800 leading-relaxed mb-1">
              <span className="font-medium">Optional — skip if you prefer.</span> Your card is stored
              securely via Stripe and used only for approved appointment charges and membership renewals.
              You can add or update it anytime in your profile.
            </div>
            <div><label className="label">Name on card</label><input className="input" value={data.cardName} onChange={set('cardName')} placeholder="Alex Johnson" /></div>
            <div><label className="label">Card number</label><input className="input" value={data.cardNumber} onChange={set('cardNumber')} placeholder="•••• •••• •••• ••••" maxLength={19} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Expiry</label><input className="input" value={data.cardExpiry} onChange={set('cardExpiry')} placeholder="MM / YY" maxLength={7} /></div>
              <div><label className="label">CVV</label><input className="input" value={data.cardCvv} onChange={set('cardCvv')} placeholder="•••" maxLength={4} /></div>
            </div>
            <div className="flex justify-between pt-1">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <div className="flex gap-2">
                <button className="btn" onClick={() => finish(false)} disabled={loading}>Skip for now</button>
                <button className="btn btn-primary" onClick={() => finish(true)} disabled={loading}>
                  {loading ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </div>
          </div>
        )}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
