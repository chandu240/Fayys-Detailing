'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminRequestsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchBookings() }, [filter])

  async function fetchBookings() {
    let query = supabase
      .from('bookings')
      .select('*, profiles(first_name, last_name, phone), vehicles(label)')
      .order('slot_date').order('slot_time')
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setBookings(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) { toast.error(error.message); return }
    if (status === 'approved') {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id })
      })
      if (res.ok) toast.success('Approved! Verification email sent.')
      else toast.success('Approved! (Email sending failed — check Resend config)')
    } else {
      toast.success('Request declined.')
    }
    fetchBookings()
  }

  const statusClass: Record<string, string> = {
    pending: 'badge-pending', approved: 'badge-approved',
    declined: 'badge-declined', completed: 'badge-completed',
  }

  const paymentLabel: Record<string, string> = {
    unpaid: 'Unpaid',
    paid: 'Paid by card',
    refunded: 'Refunded',
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-semibold">Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage booking requests</p>
        </div>
        <div className="flex gap-2">
          {['pending','approved','declined','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`btn btn-sm capitalize ${filter === f ? 'btn-primary' : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-400">No {filter} requests</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {bookings.map(b => (
            <div key={b.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-sm font-medium text-brand-600 flex-shrink-0">
                  {b.profiles?.first_name?.[0]}{b.profiles?.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{b.profiles?.first_name} {b.profiles?.last_name}</span>
                    <span className={`badge ${statusClass[b.status]}`}>{b.status}</span>
                    {b.status === 'approved' && (
                      <span className={`badge ${b.email_verified ? 'badge-approved' : 'badge-pending'}`}>
                        {b.email_verified ? 'Verified' : 'Awaiting verification'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(b.slot_date), 'MMM d, yyyy')} · {formatTime(b.slot_time)} · {b.service}
                    {b.vehicles?.label && ` · ${b.vehicles.label}`}
                  </div>
                  {b.profiles?.phone && <div className="text-xs text-gray-400 mt-0.5">{b.profiles.phone}</div>}
                  {b.notes && <div className="text-xs text-gray-400 mt-0.5 italic">"{b.notes}"</div>}
                  <div className="flex items-center gap-3 mt-1.5">
                    {b.amount_cents && <span className="text-xs text-gray-500">${(b.amount_cents/100).toFixed(0)}</span>}
                    {b.status === 'approved' && (
                      <span className={`text-xs font-medium ${
                        b.payment_status === 'paid' ? 'text-green-600' :
                        b.notes?.includes('CASH') ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {b.notes?.includes('CASH') ? 'Paying by cash' : paymentLabel[b.payment_status] || 'Unpaid'}
                      </span>
                    )}
                  </div>
                </div>
                {b.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => updateStatus(b.id, 'approved')} className="btn btn-primary btn-sm">Approve</button>
                    <button onClick={() => updateStatus(b.id, 'declined')} className="btn btn-sm text-red-500 border-red-200">Decline</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
