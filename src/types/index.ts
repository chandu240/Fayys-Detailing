export type Role = 'customer' | 'admin'
export type BookingStatus = 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type MembershipPlan = 'basic' | 'pro' | 'elite'

export interface Profile {
  id: string
  first_name: string
  last_name: string
  gender?: string
  phone?: string
  role: Role
  stripe_customer_id?: string
  created_at: string
}

export interface Vehicle {
  id: string
  user_id: string
  label: string
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  vehicle_id?: string
  slot_date: string
  slot_time: string
  service: string
  notes?: string
  status: BookingStatus
  email_verified: boolean
  payment_status: PaymentStatus
  amount_cents?: number
  created_at: string
  profiles?: Profile
  vehicles?: Vehicle
}

export interface Membership {
  id: string
  customer_id: string
  plan: MembershipPlan
  status: 'active' | 'cancelled' | 'past_due'
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
  details_used_this_period: number
  created_at: string
}

export const SERVICES = [
  { label: 'Basic Wash & Vacuum',     price: 45,  key: 'basic_wash' },
  { label: 'Full Interior Detail',    price: 120, key: 'interior' },
  { label: 'Full Exterior Detail',    price: 140, key: 'exterior' },
  { label: 'Complete Detail Package', price: 240, key: 'complete' },
]

export const MEMBERSHIP_PLANS = {
  basic: { label: 'Basic', price: 299, details: 1, perMonth: 25 },
  pro:   { label: 'Pro',   price: 549, details: 2, perMonth: 46 },
  elite: { label: 'Elite', price: 899, details: 99, perMonth: 75 },
}

export const TIME_SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00']

export function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2,'0')} ${ampm}`
}
