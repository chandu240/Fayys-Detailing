'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const params = useSearchParams()
  const bookingId = params.get('bookingId')
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      supabase.from('bookings').select('id').eq('id', bookingId).single().then(() => {
        window.location.href = '/dashboard/requests'
        setLoading(false)
      })
    }
  }, [bookingId])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">{loading ? 'Redirecting...' : 'Done'}</p>
    </div>
  )
}
