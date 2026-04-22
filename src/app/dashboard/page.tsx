'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { formatTime, TIME_SLOTS, SERVICES } from '@/types'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage() {
  const supabase = createClient()
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [bookings, setBookings] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState(SERVICES[0].key)
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchData() }, [month, year])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const start = `${year}-${String(month + 1).padStart(2,'0')}-01`
    const end = `${year}-${String(month + 1).padStart(2,'0')}-31`
    const [{ data: bk }, { data: vh }] = await Promise.all([
      supabase.from('bookings').select('*').gte('slot_date', start).lte('slot_date', end),
      supabase.from('vehicles').select('*').eq('user_id', user.id),
    ])
    setBookings(bk || [])
    setVehicles(vh || [])
    if (vh?.length) setSelectedVehicle(vh[0].id)
  }

  function getBookedSlots(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return bookings.filter(b => b.slot_date === dateStr).map(b => b.slot_time)
  }

  function getAvailableSlots(day: number) {
    return TIME_SLOTS.filter(t => !getBookedSlots(day).includes(t))
  }

  function isDayAvailable(day: number) {
    const date = new Date(year, month, day)
    const today = new Date(); today.setHours(0,0,0,0)
    if (date < today) return false
    if (date.getDay() === 0) return false
    return getAvailableSlots(day).length > 0
  }

  async function submitBooking() {
    if (!selectedTime) { toast.error('Please select a time'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
    const service = SERVICES.find(s => s.key === selectedService)
    const { error } = await supabase.from('bookings').insert({
      customer_id: user!.id,
      vehicle_id: selectedVehicle || null,
      slot_date: dateStr,
      slot_time: selectedTime,
      service: service!.label,
      notes,
      amount_cents: service!.price * 100,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Booking request sent!')
    setShowModal(false)
    setSelectedDay(null)
    setSelectedTime(null)
    setNotes('')
    fetchData()
    setLoading(false)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date(); today.setHours(0,0,0,0)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button className="btn btn-sm" onClick={() => { if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }}>‹</button>
          <span className="text-base font-medium w-36">{MONTHS[month]} {year}</span>
          <button className="btn btn-sm" onClick={() => { if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }}>›</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Book appointment</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => <div key={d} className="py-2.5 text-center text-xs font-medium text-gray-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({length: firstDay}).map((_,i) => (
            <div key={`e${i}`} className="min-h-20 bg-gray-50 border-r border-b border-gray-100" />
          ))}
          {Array.from({length: daysInMonth}).map((_,i) => {
            const day = i + 1
            const available = isDayAvailable(day)
            const slots = getAvailableSlots(day)
            const isToday = new Date(year,month,day).getTime() === today.getTime()
            const isPast = new Date(year,month,day) < today
            return (
              <div key={day}
                onClick={() => { if(available){ setSelectedDay(day); setShowModal(true) }}}
                className={`min-h-20 p-2 border-r border-b border-gray-100 transition-colors
                  ${available ? 'cursor-pointer hover:bg-brand-50' : 'bg-gray-50 cursor-default'}`}>
                <div className={`w-6 h-6 flex items-center justify-center text-sm font-medium rounded-full mb-1
                  ${isToday ? 'bg-brand-600 text-white' : isPast ? 'text-gray-300' : 'text-gray-700'}`}>
                  {day}
                </div>
                {available && (
                  <div className="text-xs bg-green-50 text-green-700 rounded px-1 py-0.5">{slots.length} open</div>
                )}
                {!available && !isPast && (
                  <div className="text-xs bg-red-50 text-red-400 rounded px-1 py-0.5">Full</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-100 border border-green-300 mr-1.5 align-middle" />Available</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-50 border border-red-200 mr-1.5 align-middle" />Full</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-200 mr-1.5 align-middle" />Unavailable</span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-100 shadow-lg">
            <h2 className="text-base font-semibold mb-4">
              {selectedDay ? `Book — ${MONTHS[month]} ${selectedDay}` : 'Select a date on the calendar'}
            </h2>
            {selectedDay && (
              <>
                <p className="text-xs text-gray-500 mb-2">Select a time</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {TIME_SLOTS.map(t => {
                    const unavail = getBookedSlots(selectedDay).includes(t)
                    return (
                      <button key={t}
                        onClick={() => !unavail && setSelectedTime(t)}
                        className={`py-2 rounded-lg text-xs border transition-colors
                          ${unavail ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-default line-through' :
                            selectedTime === t ? 'bg-brand-600 text-white border-brand-600' :
                            'border-gray-200 hover:border-brand-400 hover:text-brand-600'}`}>
                        {formatTime(t)}
                      </button>
                    )
                  })}
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="label">Service</label>
                    <select className="input" value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                      {SERVICES.map(s => <option key={s.key} value={s.key}>{s.label} — ${s.price}</option>)}
                    </select>
                  </div>
                  {vehicles.length > 0 && (
                    <div>
                      <label className="label">Vehicle</label>
                      <select className="input" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="label">Notes (optional)</label>
                    <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests..." />
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2 justify-end">
              <button className="btn btn-sm" onClick={() => { setShowModal(false); setSelectedDay(null); setSelectedTime(null) }}>Cancel</button>
              {selectedDay && (
                <button className="btn btn-primary btn-sm" onClick={submitBooking} disabled={loading}>
                  {loading ? 'Sending…' : 'Send request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
