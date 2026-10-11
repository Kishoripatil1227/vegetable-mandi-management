 'use client'
import { useEffect, useState } from 'react'

type D = {
  lots_today: number; active_farmers: number; pending_count: number; pending_amount: number
  total_sales: number; total_commission: number; by_status: Record<string, number>
}

export default function Dashboard() {
  const [d, setD] = useState<D | null>(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard').then(async (r) => {
      if (r.ok) setD(await r.json())
      else setDenied(true)
    })
  }, [])

  if (denied)
    return <p className="text-gray-700">Welcome! Tumchya records baghnyasathi <b>Search & History</b> vapra.</p>
  if (!d) return <p>Loading...</p>

  const cards = [
    { label: "Today's Lots", value: d.lots_today },
    { label: 'Active Farmers', value: d.active_farmers },
    { label: 'Pending Payments', value: `${d.pending_count} (₹${d.pending_amount})` },
    { label: 'Total Sales', value: `₹${d.total_sales}` },
    { label: 'Total Commission', value: `₹${d.total_commission}` },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
      <div className="grid md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-600">{c.label}</p>
            <p className="text-xl font-bold text-green-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Lots by status</h2>
        <div className="flex gap-3 flex-wrap">
          {['received', 'weighed', 'auctioned', 'settled'].map((s) => (
            <span key={s} className="bg-green-100 text-green-900 px-3 py-1 rounded capitalize">
              {s}: {d.by_status[s] || 0}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
