import { createServerClient } from '@/lib/supabase/server'
import { MEMBERSHIP_PLANS } from '@/types'
import { format } from 'date-fns'

export default async function AdminMembershipsPage() {
  const supabase = createServerClient()
  const { data: memberships } = await supabase
    .from('memberships')
    .select('*, profiles(first_name, last_name, phone)')
    .order('created_at', { ascending: false })

  const statusClass: Record<string, string> = {
    active: 'badge-approved', cancelled: 'badge-declined', past_due: 'badge-pending',
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-base font-semibold">Memberships</h1>
        <p className="text-sm text-gray-500 mt-0.5">{memberships?.length || 0} total members</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Details used</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Since</th>
            </tr>
          </thead>
          <tbody>
            {(memberships || []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No members yet</td></tr>
            )}
            {(memberships || []).map((m: any) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600">
                      {m.profiles?.first_name?.[0]}{m.profiles?.last_name?.[0]}
                    </div>
                    <span>{m.profiles?.first_name} {m.profiles?.last_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">
                  {MEMBERSHIP_PLANS[m.plan as keyof typeof MEMBERSHIP_PLANS]?.label} —
                  ${MEMBERSHIP_PLANS[m.plan as keyof typeof MEMBERSHIP_PLANS]?.price}/yr
                </td>
                <td className="px-4 py-3"><span className={`badge ${statusClass[m.status]}`}>{m.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{m.details_used_this_period}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(m.created_at), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
