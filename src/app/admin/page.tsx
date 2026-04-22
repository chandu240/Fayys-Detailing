import { createServerClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function AdminOverviewPage() {
  const supabase = createServerClient()
  const now = new Date()
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-01`

  const [
    { count: totalBookings },
    { count: pendingCount },
    { data: revenueData },
    { count: memberCount },
    { data: upcoming },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('slot_date', startOfMonth),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('amount_cents').eq('payment_status', 'paid').gte('slot_date', startOfMonth),
    supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('bookings').select('*, profiles(first_name, last_name), vehicles(label)')
      .in('status', ['pending','approved'])
      .gte('slot_date', new Date().toISOString().split('T')[0])
      .order('slot_date').order('slot_time').limit(10),
  ])

  const revenue = (revenueData || []).reduce((sum, b) => sum + (b.amount_cents || 0), 0) / 100

  const statusClass: Record<string, string> = {
    pending: 'badge-pending', approved: 'badge-approved',
    declined: 'badge-declined', completed: 'badge-completed',
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-base font-semibold">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">{format(now, 'MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Appointments', value: totalBookings || 0, sub: 'this month' },
          { label: 'Pending', value: pendingCount || 0, sub: 'requests' },
          { label: 'Revenue', value: `$${revenue.toFixed(0)}`, sub: 'this month' },
          { label: 'Members', value: memberCount || 0, sub: 'active' },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold mb-3">Upcoming appointments</h2>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Date & time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Service</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Vehicle</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {(upcoming || []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No upcoming appointments</td></tr>
            )}
            {(upcoming || []).map((b: any) => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{b.profiles?.first_name} {b.profiles?.last_name}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(b.slot_date), 'MMM d')} · {b.slot_time}</td>
                <td className="px-4 py-3 text-gray-500">{b.service}</td>
                <td className="px-4 py-3 text-gray-500">{b.vehicles?.label || '—'}</td>
                <td className="px-4 py-3"><span className={`badge ${statusClass[b.status]}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
