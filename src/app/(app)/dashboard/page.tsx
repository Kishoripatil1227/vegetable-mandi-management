'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const one = (v: any) => (Array.isArray(v) ? v[0] : v)
const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })

type D = {
  lots_today: number; active_farmers: number; pending_count: number; pending_amount: number
  total_sales: number; total_commission: number; by_status: Record<string, number>
}

function Stat({ icon, label, value, sub, tone }: { icon: string; label: string; value: string | number; sub?: string; tone: string }) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
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
      <div className="rounded-2xl bg-[#0d3822] text-white p-6 md:p-8">
        <p className="text-sm text-[#9dbfaa]">Customer dashboard</p>
        <h1 className="!text-white !text-2xl md:!text-3xl mt-1">Welcome, {me?.name || 'Customer'}</h1>
        {r.linked && (
          <p className="mt-3 text-[#d6e9dc]">
            Buyer profile: <span className="font-semibold bg-white/15 px-2.5 py-0.5 rounded-lg">{r.buyer}</span>
          </p>
        )}
      </div>

      {!r.linked ? (
        <div className="bg-white rounded-xl p-10 text-center">
          <div className="text-5xl mb-3">🔗</div>
          <h2 className="text-lg font-semibold">Account link pending</h2>
          <p className="text-gray-500 mt-1">Your account has not been linked to a buyer profile yet. Please contact the mandi admin.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center">
          <div className="text-5xl mb-3">🥬</div>
          <h2 className="text-lg font-semibold">No purchases yet</h2>
          <p className="text-gray-500 mt-1">Your purchase summary will appear here once an auction is recorded.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon="🧾" label="Purchases" value={r.summary.purchases} tone="bg-green-100" />
            <Stat icon="⚖️" label="Total quantity" value={`${totalKg.toFixed(1)} kg`} tone="bg-blue-100" />
            <Stat icon="💰" label="Total amount" value={inr(spent)} tone="bg-amber-100" />
            <Stat icon="📈" label="Average rate" value={`${inr(avg)}/kg`} tone="bg-purple-100" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5">
              <h2 className="mb-4">Spend by vegetable</h2>
              {vegList.map(([name, v]) => (
                <div key={name} className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{name} <span className="text-gray-400">({v.kg.toFixed(1)} kg)</span></span>
                    <span className="font-semibold">{inr(v.amt)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full mt-1.5">
                    <div className="h-2.5 bg-[#197a45] rounded-full" style={{ width: `${(v.amt / maxVeg) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-5 lg:col-span-2 overflow-x-auto">
              <h2 className="mb-4">My purchases</h2>
              <table className="text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Lot</th><th>Vegetable</th>
                    <th className="text-right">Net kg</th><th className="text-right">Rate</th>
                    <th className="text-right">Amount</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const lot = one(a.produce_lots)
                    return (
                      <tr key={a.id}>
                        <td className="font-semibold">{lot?.lot_no}</td>
                        <td>{one(lot?.vegetables)?.name}</td>
                        <td className="text-right">{one(lot?.weighments)?.net_weight}</td>
                        <td className="text-right">{inr(Number(a.rate_per_kg))}</td>
                        <td className="text-right font-semibold">{inr(Number(a.total_amount))}</td>
                        <td className="text-gray-500">{a.auction_date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const stages = [
  { k: 'received', label: 'Received', c: 'bg-amber-400' },
  { k: 'weighed', label: 'Weighed', c: 'bg-blue-500' },
  { k: 'auctioned', label: 'Auctioned', c: 'bg-purple-500' },
  { k: 'settled', label: 'Settled', c: 'bg-green-600' },
]

const actions = [
  { href: '/lots', icon: '▦', t: 'New lot', d: 'Receive produce' },
  { href: '/weighments', icon: '⚖', t: 'Weigh a lot', d: 'Gross and tare' },
  { href: '/auctions', icon: '₹', t: 'Record auction', d: 'Price and buyer' },
  { href: '/settlements', icon: '✓', t: 'Settle payment', d: 'Pay the farmer' },
  { href: '/reports', icon: '▥', t: 'View reports', d: 'Sales and rates' },
]

export default function Dashboard() {
  const [d, setD] = useState<D | null>(null)
  const [denied, setDenied] = useState(false)
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((x) => x.json()).then(setMe)
    fetch('/api/dashboard').then(async (r) => {
      if (r.ok) setD(await r.json())
      else setDenied(true)
    })
  }, [])

  if (denied) return <CustomerView />
  if (!d) return <p className="text-gray-500">Loading...</p>

  const totalLots = Object.values(d.by_status).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#0d3822] text-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#9dbfaa]">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="!text-white !text-2xl md:!text-3xl mt-1">Welcome back, {me?.name || 'there'}</h1>
          <p className="mt-2 text-[#d6e9dc]">Here is what is happening in your mandi today.</p>
        </div>
        <Link href="/lots" className="bg-[#f0b429] hover:bg-[#e0a51f] text-[#0d3822] font-bold px-5 py-2.5 rounded-lg">
          + New lot
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon="📦" label="Today's lots" value={d.lots_today} tone="bg-green-100" />
        <Stat icon="🧑‍🌾" label="Active farmers" value={d.active_farmers} tone="bg-blue-100" />
        <Stat icon="⏳" label="Pending payments" value={inr(d.pending_amount)} sub={`${d.pending_count} settlements`} tone="bg-amber-100" />
        <Stat icon="💰" label="Total sales" value={inr(d.total_sales)} sub={`Commission ${inr(d.total_commission)}`} tone="bg-purple-100" />
      </div>

      <div className="bg-white rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2>Lot pipeline</h2>
          <span className="text-sm text-gray-500">{totalLots} lots in total</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {stages.map((s) => (
            <div key={s.k} className={s.c} style={{ width: `${totalLots ? ((d.by_status[s.k] || 0) / totalLots) * 100 : 0}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {stages.map((s) => (
            <div key={s.k} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${s.c}`} />
              <span className="text-sm text-gray-600">{s.label}</span>
              <span className="ml-auto font-bold">{d.by_status[s.k] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((a) => (
            <Link key={a.href} href={a.href}
              className="bg-white border border-[#dce3dc] rounded-xl p-4 hover:border-[#197a45] hover:shadow-md transition group">
              <span className="w-10 h-10 rounded-lg bg-[#e3f1e8] text-[#197a45] grid place-items-center text-lg font-bold group-hover:bg-[#197a45] group-hover:text-white transition">
                {a.icon}
              </span>
              <p className="font-semibold mt-3">{a.t}</p>
              <p className="text-xs text-gray-500">{a.d}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}