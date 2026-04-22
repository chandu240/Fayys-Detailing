'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MEMBERSHIP_PLANS } from '@/types'
import toast from 'react-hot-toast'

export default function MembershipsPage() {
  const supabase = createClient()
  const [membership, setMembership] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => { fetchMembership() }, [])

  async function fetchMembership() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('memberships').select('*').eq('customer_id', user.id).single()
    setMembership(data)
    setLoading(false)
  }

  async function selectPlan(plan: string) {
    setSelecting(plan)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('memberships').upsert({
      customer_id: user.id,
      plan,
      status: 'active',
      details_used_this_period: 0,
    }, { onConflict: 'customer_id' })
    if (error) { toast.error(error.message); setSelecting(null); return }
    toast.success(`${MEMBERSHIP_PLANS[plan as keyof typeof MEMBERSHIP_PLANS].label} plan activated!`)
    fetchMembership()
    setSelecting(null)
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold">Memberships</h1>
        <p className="text-sm text-gray-500 mt-0.5">All plans are billed annually to your card on file</p>
      </div>
      {membership && (
        <div className="card mb-6 flex items-center gap-3 max-w-sm">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">Current plan: {MEMBERSHIP_PLANS[membership.plan as keyof typeof MEMBERSHIP_PLANS]?.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 capitalize">Status: {membership.status} · {membership.details_used_this_period} details used this period</div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
        {Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => {
          const isCurrent = membership?.plan === key
          return (
            <div key={key} className={`card flex flex-col ${key === 'pro' ? 'border-brand-400 border-2' : ''}`}>
              {key === 'pro' && (
                <div className="bg-brand-50 text-brand-600 text-xs font-medium px-2 py-1 rounded-md self-start mb-3">
                  Most popular
                </div>
              )}
              <div className="text-base font-semibold">{plan.label}</div>
              <div className="text-2xl font-semibold text-brand-600 mt-2">${plan.price}<span className="text-sm text-gray-400 font-normal">/yr</span></div>
              <div className="text-xs text-gray-400 mb-4">~${plan.perMonth}/mo</div>
              <div className="space-y-2 flex-1 mb-5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  {plan.details === 99 ? 'Unlimited' : plan.details} detail{plan.details !== 1 ? 's' : ''} per month
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>Priority scheduling
                </div>
                {key === 'pro' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600">✓</span>1 ceramic coat/year
                  </div>
                )}
                {key === 'elite' && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-600">✓</span>24hr booking window
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-600">✓</span>Ceramic coat included
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => !isCurrent && selectPlan(key)}
                disabled={isCurrent || selecting === key}
                className={`btn w-full ${isCurrent ? 'bg-gray-50 text-gray-400 cursor-default' : key === 'pro' ? 'btn-primary' : ''}`}>
                {isCurrent ? 'Current plan' : selecting === key ? 'Activating…' : 'Select plan'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
