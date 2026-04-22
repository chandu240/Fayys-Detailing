import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: "Fayy's Detailing",
  description: 'Schedule your next detail',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster position="bottom-right" toastOptions={{ style: { fontSize: '13px' } }} />
      </body>
    </html>
  )
}
