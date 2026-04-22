'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ booking, onSuccess }: { booking: any, onSuccess: (method: string) => void }) {
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
    if (res.ok) onSuccess('cash')
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
    const { clientSecret } = await res.json()
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
      onSuccess('card')
    }
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
        <div><span className="text-gray-500">Date:</span> <span className="font-medium">{booking.slot_date}</span></div>
        <div><span className="text-gray-500">Time:</span> <span className="font-medium">{booking.slot_time}</span></div>
        <div><span className="text-gray-500">Service:</span> <span className="font-medium">{booking.service}</span></div>
        {booking.vehicles?.label && <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{booking.vehicles.label}</span></div>}
        <div><span className="text-gray-500">Amount:</span> <span className="font-medium text-brand-600">${(booking.amount_cents / 100).toFixed(0)}</span></div>
      </div>

      {hasCard ? (
        <div className="space-y-3">
          <button onClick={handleCardPayment} disabled={loading}
            className="btn btn-primary w-full">
            {loading ? 'Processing…' : `Pay $${(booking.amount_cents / 100).toFixed(0)} with saved card`}
          </button>
          <button onClick={handleCash} disabled={loading} className="btn w-full">
            Pay at the wash (cash)
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 mb-3">
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
              <button onClick={handleCardPayment} disabled={loading || !stripe}
                className="btn btn-primary w-full">
                {loading ? 'Processing…' : `Pay $${(booking.amount_cents / 100).toFixed(0)}`}
              </button>
            </div>
          )}
          {method === 'cash' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">You'll pay at the wash. Your
cat > src/app/verify/page.tsx << 'EOF'
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ booking, onSuccess }: { booking: any, onSuccess: (method: string) => void }) {
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
    if (res.ok) onSuccess('cash')
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
    const { clientSecret } = await res.json()
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
      onSuccess('card')
    }
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
        <div><span className="text-gray-500">Date:</span> <span className="font-medium">{booking.slot_date}</span></div>
        <div><span className="text-gray-500">Time:</span> <span className="font-medium">{booking.slot_time}</span></div>
        <div><span className="text-gray-500">Service:</span> <span className="font-medium">{booking.service}</span></div>
        {booking.vehicles?.label && <div><span className="text-gray-500">Vehicle:</span> <span className="font-medium">{booking.vehicles.label}</span></div>}
        <div><span className="text-gray-500">Amount:</span> <span className="font-medium text-brand-600">${(booking.amount_cents / 100).toFixed(0)}</span></div>
      </div>

      {hasCard ? (
        <div className="space-y-3">
          <button onClick={handleCardPayment} disabled={loading}
            className="btn btn-primary w-full">
            {loading ? 'Processing…' : `Pay $${(booking.amount_cents / 100).toFixed(0)} with saved card`}
          </button>
          <button onClick={handleCash} disabled={loading} className="btn w-full">
            Pay at the wash (cash)
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 mb-3">
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
              <button onClick={handleCardPayment} disabled={loading || !stripe}
                className="btn btn-primary w-full">
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
  )
}

export default function VerifyPage() {
  const params = useSearchParams()
  const bookingId = params.get('bookingId')
  const supabase = createClient()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [method, setMethod] = useState('')

  useEffect(() => {
    if (bookingId) fetchBooking()
  }, [bookingId])

  async function fetchBooking() {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles(first_name, stripe_customer_id), vehicles(label)')
      .eq('id', bookingId!)
      .single()
    setBooking(data)
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Booking not found.</p>
    </div>
  )

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm text-center shadow-sm">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">You're all set!</h2>
        <p className="text-sm text-gray-500">
          {method === 'cash'
            ? 'Your appointment is confirmed. See you at the wash — bring cash!'
            : 'Payment confirmed. Your appointment is locked in!'}
        </p>
        <a href="/dashboard" className="btn btn-primary w-full mt-6 inline-flex">Go to my bookings</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Confirm your appointment</h1>
          <p className="text-sm text-gray-500 mt-1">Hi {booking.profiles?.first_name} — your detail is approved!</p>
        </div>
        <Elements stripe={stripePromise}>
          <PaymentForm booking={booking} onSuccess={(m) => { setMethod(m); setDone(true) }} />
        </Elements>
      </div>
    </div>
  )
}
