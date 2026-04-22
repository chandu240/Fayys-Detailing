import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { bookingId } = await request.json()
  const supabase = createServerClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, profiles(first_name, last_name), vehicles(label)')
    .eq('id', bookingId)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { data: user } = await supabase.auth.admin.getUserById(booking.customer_id)
  const email = user?.user?.email
  if (!email) return NextResponse.json({ error: 'No email found' }, { status: 404 })

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?bookingId=${bookingId}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Your detail is approved — confirm your appointment",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #185FA5;">Your appointment is approved!</h2>
        <p>Hi ${booking.profiles?.first_name},</p>
        <p>Your detail appointment has been approved. Please confirm and complete payment to lock in your spot.</p>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin:0"><strong>Date:</strong> ${booking.slot_date}</p>
          <p style="margin:8px 0 0"><strong>Time:</strong> ${booking.slot_time}</p>
          <p style="margin:8px 0 0"><strong>Service:</strong> ${booking.service}</p>
          ${booking.vehicles?.label ? `<p style="margin:8px 0 0"><strong>Vehicle:</strong> ${booking.vehicles.label}</p>` : ''}
          <p style="margin:8px 0 0"><strong>Amount:</strong> $${(booking.amount_cents / 100).toFixed(0)}</p>
        </div>
        <a href="${verifyUrl}" style="display:inline-block;background:#185FA5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;">
          Confirm & Pay
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">Fayy's Detailing · Fort Worth, TX</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}
