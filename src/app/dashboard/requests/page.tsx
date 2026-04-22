'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/types'
import { format } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentModal({ booking, onClose, onSuccess }: { booking: any, onClose: () => void, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'card' | 'cash'>('card')
  const hasCard = !!booking.profiles?.stripe_customer_id

  async function handleCash() {
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentMethod: 'cash' })
    })
    if (res.ok) { toast.success('Confirmed! See you at the wash.'); onSuccess() }
    else toast.error('Something went wrong')
    setLoading(false)
  }

  async function handleCardPayment() {
    if (!stripe || !elements) return
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentMethod: 'card' })
    })
    const { clientSecret, error: apiError } = await res.json()
    if (apiError) { toast.error(apiError); setLoading(false); return }
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! }
    })
    if (result.error) {
      toast.error(result.error.message || 'Payment failed')
      setLoading(false)
    } else {
      const supabase = createClient()
      await supabase.from('bookings').update({
        email_verified: true,
        payment_status: 'paid',
        stripe_payment_intent: result.paymentIntent.id,
      }).eq('id', booking.id)
      toast.success('Payment confirmed! Your appointment is locked in.')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-100 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Confirm your appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
          <div><span className="text-gray-500">Date:</span> <span className="font-medium">{format(new Date(booking.slot_date), 'MMM d, yyyy')}</span></div>
          <div><span className="text-gray-500">Time:</span> <span className="font-medium">{formatTime(booking.slot_time)}</span></div>
          <div><span className="text-gray-500">Service:</span> <span classN
cat > src/app/dashboard/requests/page.tsx << 'EOF'
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/types'
import { format } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentModal({ booking, onClose, onSuccess }: { booking: any, onClose: () => void, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'card' | 'cash'>('card')
  const hasCard = !!booking.profiles?.stripe_customer_id

  async function handleCash() {
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentMethod: 'cash' })
    })
    if (res.ok) { toast.success('Confirmed! See you at the wash.'); onSuccess() }
    else toast.error('Something went wrong')
    setLoading(false)
  }

  async function handleCardPayment() {
    if (!stripe || !elements) return
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id, paymentMethod: 'card' })
    })
    const { clientSecret, error: apiError } = await res.json()
    if (apiError) { toast.error(apiError); setLoading(false); return }
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! }
    })
    if (result.error) {
      toast.error(result.error.message || 'Payment failed')
      setLoading(false)
    } else {
      const supabase = createClient()
      await supabase.from('bookings').update({
        email_verified: true,
        payment_status: 'paid',
        stripe_payment_intent: result.paymentIntent.id,
      }).eq('id', booking.id)
      toast.success('Payment confirmed! Your appointment is locked in.')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-100 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Confirm your appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
          <div><span className="text-gray-500">Date:</span> <span className="font-medium">{format(new Date(booking.slot_date), 'MMM d, yyyy')}</span></div>
          <div><span className="text-gray-500">Time:</span> <span className="font-medium">{formatTime(booking.slot_time)}</span></div>
          <div><span className="text-gray-500">Service:</span> <span className="font-medium">{booking.service}</span></div>
          {booking.vehicles?.label && <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{booking.vehicles.label}</span></div>}
          <div><span className="text-gray-500">Amount:</span> <span className="font-medium text-brand-600">${(booking.amount_cents / 100).toFixed(0)}</span></div>
        </div>

        {hasCard ? (
          <div className="space-y-3">
            <button onClick={handleCardPayment} disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Processing…' : `Pay $${(booking.amount_cents / 100).toFixed(0)} with saved card`}
            </button>
            <button onClick={handleCash} disabled={loading} className="btn w-full">
              Pay at the wash (cash)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 mb-1">
              <button onClick={() => setMethod('card')}
                className={`btn btn-sm flex-1 ${method === 'card' ? 'btn-primary' : ''}`}>
                Pay by card
              </button>
              <button onClick={() => setMethod('cash')}
                className={`btn btn-sm flex-1 ${method === 'cash' ? 'btn-primary' : ''}`}>
                Pay at wash
              </button>
            </div>
            {method === 'card' && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <CardElement options={{ style: { base: { fontSize: '14px' } } }} />
                </div>
                <button onClick={handleCardPayment} disabled={loading || !stripe} className="btn btn-primary w-full">
                  {loading ? 'Processing…' : `Pay $${(booking.amount_cents / 100).toFixed(0)}`}
                </button>
              </div>
            )}
            {method === 'cash' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">You'll pay at the wash. Your spot is confirmed once you click below.</p>
                <button onClick={handleCash} disabled={loading} className="btn btn-primary w-full">
                  {loading ? 'Confirming…' : 'Confirm — pay at wash'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RequestsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('bookings')
      .select('*, vehicles(label), profiles(first_name, stripe_customer_id)')
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
            <div key={b.id} className="card">
              <div className="flex items-start gap-3">
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
                  {b.notes && !b.notes.includes('CASH') && (
                    <div className="text-xs text-gray-400 mt-0.5 italic">"{b.notes}"</div>
                  )}
                  {b.status === 'approved' && b.email_verified && (
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      {b.payment_status === 'paid' ? 'Paid by card' : 'Confirmed — paying at wash'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`badge ${statusClass[b.status]}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                  {b.status === 'approved' && !b.email_verified && (
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="btn btn-primary btn-sm">
                      Confirm & Pay
                    </button>
                  )}
                  {b.amount_cents && (
                    <span className="text-xs text-gray-400">${(b.amount_cents / 100).toFixed(0)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <Elements stripe={stripePromise}>
          <PaymentModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onSuccess={() => { setSelectedBooking(null); fetchBookings() }}
          />
        </Elements>
      )}
    </div>
  )
}
