'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [membership, setMembership] = useState<any>(null)
  const [newVehicle, setNewVehicle] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: p }, { data: v }, { data: m }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('vehicles').select('*').eq('user_id', user.id),
      supabase.from('memberships').select('*').eq('customer_id', user.id).single(),
    ])
    setProfile(p)
    setVehicles(v || [])
    setMembership(m)
    setLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      gender: profile.gender,
    }).eq('id', user!.id)
    if (error) toast.error(error.message)
    else toast.success('Profile updated!')
    setSaving(false)
  }

  async function addVehicle() {
    if (!newVehicle.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('vehicles').insert({ user_id: user!.id, label: newVehicle.trim() })
    if (error) toast.error(error.message)
    else { toast.success('Vehicle added!'); setNewVehicle(''); fetchData() }
  }

  async function removeVehicle(id: string) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Vehicle removed'); fetchData() }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>
  if (!profile) return null

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="p-6 max-w-lg space-y-4">
      <div className="card">
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-lg font-semibold text-brand-600">
            {initials}
          </div>
          <div>
            <div className="font-medium">{profile.first_name} {profile.last_name}</div>
            <div className="text-sm text-gray-400 capitalize">{profile.role}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input className="input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} />
            </div>
            <div>
              <label className="label">Last name</label>
              <input className="input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="(555) 000-0000" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})}>
              <option value="">Prefer not to say</option>
              <option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
      <div className="card">
        <h2 className="text-sm font-semibold mb-3">Vehicles in garage</h2>
        <div className="space-y-2 mb-3">
          {vehicles.map(v => (
            <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm">{v.label}</span>
              <button onClick={() => removeVehicle(v.id)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" value={newVehicle} onChange={e => setNewVehicle(e.target.value)}
            placeholder="e.g. 2022 Honda Civic" onKeyDown={e => e.key === 'Enter' && addVehicle()} />
          <button className="btn btn-sm btn-primary flex-shrink-0" onClick={addVehicle}>Add</button>
        </div>
      </div>
      {membership && (
        <div className="card">
          <h2 className="text-sm font-semibold mb-2">Membership</h2>
          <div className="flex items-center justify-between">
            <span className="badge badge-approved capitalize">{membership.plan} plan</span>
            <span className="text-xs text-gray-400 capitalize">{membership.status}</span>
          </div>
        </div>
      )}
      <div className="card">
        <h2 className="text-sm font-semibold mb-2">Card on file</h2>
        <p className="text-xs text-gray-500 mb-3">Card management is handled securely via Stripe. Coming soon.</p>
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400">•••• •••• •••• ——</div>
      </div>
    </div>
  )
}
