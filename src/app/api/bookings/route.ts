import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { bookingId, paymentMethod } = await request.json()
  const supabase = createServerClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, profiles(stripe_customer_id)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  if (paymentMethod === 'cash') {
    await supabase.from('bookings').update({
      email_verified: true,
      payment_status: 'unpaid',
      notes: (booking.notes || '') + ' [CASH PAYMENT]'
    }).eq('id', bookingId)
    return NextResponse.json({ success: true, method: 'cash' })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.amount_cents,
    currency: 'usd',
    metadata: { bookingId },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
