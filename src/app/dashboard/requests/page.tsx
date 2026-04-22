'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/types'
import { format } from 'date-fns'

export default function RequestsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('bookings')
      .select('*, vehicles(label)')
      .eq('customer_id', user.id)
      .order('slot_date', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const statusClass: Record<string, string> = {
    pending:   'badge-pending',
    approved:  'badge-approved',
    declined:  'badge-declined',
    completed: 'badge-completed',
    cancelled: 'bg-gray-100 text-gray-500',
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-base font-semibold">My requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track all your booking requests</p>
      </div>
      {bookings.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-400">No bookings yet</p>
          <a href="/dashboard" className="text-brand-600 text-sm mt-2 inline-block">Book an appointment →</a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="card flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{b.service}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {format(new Date(b.slot_date), 'MMM d, yyyy')} · {formatTime(b.slot_time)}
                  {b.vehicles?.label && ` · ${b.vehicles.label}`}
                </div>
                {b.notes && <div className="text-xs text-gray-400 mt-0.5 italic">"{b.notes}"</div>}
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`badge ${statusClass[b.status]}`}>
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </span>
                {b.status === 'approved' && !b.email_verified && (
                  <span className="text-xs text-amber-600">Check email to verify</span>
                )}
                {b.amount_cents && (
                  <span className="text-xs text-gray-400">${(b.amount_cents / 100).toFixed(0)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
