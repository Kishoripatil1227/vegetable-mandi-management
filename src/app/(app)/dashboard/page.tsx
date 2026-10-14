'use client'
import { useEffect, useState } from 'react'

const one = (v: any) => (Array.isArray(v) ? v[0] : v)

type D = {
  lots_today: number; active_farmers: number; pending_count: number; pending_amount: number
  total_sales: number; total_commission: number; by_status: Record<string, number>
}

const badge: Record<string, string> = {
  received: 'bg-yellow-100 text-yellow-800',
  weighed: 'bg-blue-100 text-blue-800',
  auctioned: 'bg-purple-100 text-purple-800',
  settled: 'bg-green-100 text-green-800',
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })

function Stat({ icon, label, value, tone }: { icon: string; label: string; value: string | number; tone: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${tone}`}>{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function CustomerView() {
  const [r, setR] = useState<any>(null)
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((x) => x.json()).then(setMe)
    fetch('/api/my').then((x) => x.json()).then(setR)
  }, [])

  if (!r) return <p className="text-gray-500">Loading...</p>

  const rows: any[] = r.data || []
  const kg = (a: any) => Number(one(one(a.produce_lots)?.weighments)?.net_weight || 0)
  const totalKg = rows.reduce((s, a) => s + kg(a), 0)
  const spent = Number(r.summary?.total_spent || 0)
  const avg = totalKg > 0 ? spent / totalKg : 0

  const byVeg: Record<string, { amt: number; kg: number }> = {}
  rows.forEach((a) => {
    const n = one(one(a.produce_lots)?.vegetables)?.name || 'Other'
    byVeg[n] ||= { amt: 0, kg: 0 }
    byVeg[n].amt += Number(a.total_amount)
    byVeg[n].kg += kg(a)
  })
  const vegList = Object.entries(byVeg).sort((a, b) => b[1].amt - a[1].amt)
  const maxVeg = Math.max(1, ...vegList.map(([, v]) => v.amt))

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-green-700 to-emerald-500 text-white p-6 shadow">
        <p className="text-sm text-green-100">Customer Dashboard</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Namaskar, {me?.name || 'Customer'} 👋</h1>
        {r.linked && (
          <p className="mt-2 text-green-50">
            Buyer profile: <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">{r.buyer}</span>
          </p>
        )}
      </div>

      {!r.linked ? (
        <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-3">🔗</div>
          <h2 className="text-lg font-semibold text-gray-800">Account link pending</h2>
          <p className="text-gray-500 mt-1">Mandi Admin tumcha account buyer profile shi jodel, mag purchases ithe distil.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-3">🥬</div>
          <h2 className="text-lg font-semibold text-gray-800">Ajun purchases nahit</h2>
          <p className="text-gray-500 mt-1">Tumchya navavar auction zalyavar ithe sagla hisab disel.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon="🧾" label="Purchases" value={r.summary.purchases} tone="bg-green-100" />
            <Stat icon="⚖️" label="Total quantity" value={`${totalKg.toFixed(1)} kg`} tone="bg-blue-100" />
            <Stat icon="💰" label="Total amount" value={inr(spent)} tone="bg-yellow-100" />
            <Stat icon="📈" label="Average rate" value={`${inr(avg)}/kg`} tone="bg-purple-100" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="font-semibold text-green-900 mb-4">Spend by vegetable</h2>
              {vegList.map(([name, v]) => (
                <div key={name} className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{name} <span className="text-gray-400">({v.kg.toFixed(1)} kg)</span></span>
                    <span className="font-semibold">{inr(v.amt)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-2.5 bg-green-600 rounded-full" style={{ width: `${(v.amt / maxVeg) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5 lg:col-span-2 overflow-x-auto">
              <h2 className="font-semibold text-green-900 mb-4">My Purchases</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-3">Lot</th><th className="pr-3">Vegetable</th>
                    <th className="pr-3 text-right">Net kg</th><th className="pr-3 text-right">Rate</th>
                    <th className="pr-3 text-right">Amount</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const lot = one(a.produce_lots)
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-green-50">
                        <td className="py-2 pr-3 font-medium">{lot?.lot_no}</td>
                        <td className="pr-3">{one(lot?.vegetables)?.name}</td>
                        <td className="pr-3 text-right">{one(lot?.weighments)?.net_weight}</td>
                        <td className="pr-3 text-right">{inr(Number(a.rate_per_kg))}</td>
                        <td className="pr-3 text-right font-semibold">{inr(Number(a.total_amount))}</td>
                        <td className="text-gray-500">{a.auction_date}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-green-50">
                    <td className="py-2 pr-3" colSpan={2}>Total</td>
                    <td className="pr-3 text-right">{totalKg.toFixed(1)}</td>
                    <td></td>
                    <td className="pr-3 text-right">{inr(spent)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
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

  if (denied) return <CustomerView />
  if (!d) return <p className="text-gray-500">Loading...</p>

  const cards = [
    { icon: '📦', label: "Today's lots", value: d.lots_today, tone: 'bg-green-100' },
    { icon: '🧑‍🌾', label: 'Active farmers', value: d.active_farmers, tone: 'bg-blue-100' },
    { icon: '⏳', label: 'Pending payments', value: `${d.pending_count} (${inr(d.pending_amount)})`, tone: 'bg-yellow-100' },
    { icon: '💰', label: 'Total sales', value: inr(d.total_sales), tone: 'bg-purple-100' },
    { icon: '🏷️', label: 'Total commission', value: inr(d.total_commission), tone: 'bg-pink-100' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => <Stat key={c.label} {...c} />)}
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold mb-3">Lots by status</h2>
        <div className="flex gap-3 flex-wrap">
          {['received', 'weighed', 'auctioned', 'settled'].map((s) => (
            <span key={s} className={`px-3 py-1 rounded-full capitalize ${badge[s]}`}>
              {s}: {d.by_status[s] || 0}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}