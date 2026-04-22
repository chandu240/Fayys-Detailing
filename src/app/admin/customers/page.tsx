import { createServerClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function AdminCustomersPage() {
  const supabase = createServerClient()
  const { data: customers } = await supabase
    .from('profiles')
    .select('*, vehicles(label), memberships(plan, status)')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-base font-semibold">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{customers?.length || 0} total customers</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Vehicles</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Membership</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(customers || []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">No customers yet</td></tr>
            )}
            {(customers || []).map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-medium text-brand-600">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <span>{c.first_name} {c.last_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {c.vehicles?.length ? c.vehicles.map((v: any) => v.label).join(', ') : '—'}
                </td>
                <td className="px-4 py-3">
                  {c.memberships?.length ? (
                    <span className="badge badge-approved capitalize">{c.memberships[0].plan}</span>
                  ) : (
                    <span className="text-gray-400 text-xs">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(c.created_at), 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
