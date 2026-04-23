'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyRedirect() {
  const params = useSearchParams()
  const bookingId = params.get('bookingId')

  useEffect(() => {
    window.location.href = '/dashboard/requests'
  }, [bookingId])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Redirecting...</p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>}>
      <VerifyRedirect />
    </Suspense>
  )
}
