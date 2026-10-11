 'use client'
import { useEffect, useState } from 'react'

const one = (v: any) => (Array.isArray(v) ? v[0] : v)

export default function ReportsPage() {
  const [range, setRange] = useState({ from: '', to: '' })
  const [rep, setRep] = useState<any>(null)
  const [vegs, setVegs] = useState<{ id: string; name: string }[]>([])
  const [vegId, setVegId] = useState('')
  const [rates, setRates] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/lookups?type=vegetables').then((r) => r.json()).then((v) => {
      setVegs(v); if (v[0]) setVegId(v[0].id)
    })
  }, [])

  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(range).filter(([, v]) => v))
    fetch(`/api/reports?${qs}`).then((r) => r.json()).then(setRep)
  }, [range])

  useEffect(() => {
    if (!vegId) return
    fetch(`/api/analytics/daily-rates?vegetable_id=${vegId}`).then((r) => r.json()).then(setRates)
  }, [vegId])

  const max = Math.max(1, ...rates.map((r) => Number(r.avg_rate)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-green-900">Reports</h1>
        <button onClick={() => window.print()} className="bg-green-700 text-white px-4 py-2 rounded print:hidden">
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow flex gap-3 flex-wrap items-end print:hidden">
        <div><label className="block text-sm">From</label>
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="border rounded px-3 py-2" /></div>
        <div><label className="block text-sm">To</label>
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="border rounded px-3 py-2" /></div>
      </div>

      {rep && !rep.error && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded shadow p-4"><p className="text-sm">Auctions</p><p className="text-xl font-bold">{rep.totals.count}</p></div>
            <div className="bg-white rounded shadow p-4"><p className="text-sm">Total Sales</p><p className="text-xl font-bold">₹{rep.totals.sales.toFixed(2)}</p></div>
            <div className="bg-white rounded shadow p-4"><p className="text-sm">Total Commission</p><p className="text-xl font-bold">₹{rep.totals.commission.toFixed(2)}</p></div>
          </div>

          <div className="bg-white rounded shadow p-4 overflow-x-auto">
            <h2 className="font-semibold mb-2">Daily report ({rep.from} to {rep.to})</h2>
            <table className="w-full text-sm">
              <thead className="bg-green-100 text-left"><tr><th className="p-2">Date</th><th className="p-2">Auctions</th><th className="p-2">Sales</th><th className="p-2">Commission</th></tr></thead>
              <tbody>
                {Object.entries<any>(rep.daily).map(([d, v]) => (
                  <tr key={d} className="border-t"><td className="p-2">{d}</td><td className="p-2">{v.count}</td><td className="p-2">₹{v.sales.toFixed(2)}</td><td className="p-2">₹{v.commission.toFixed(2)}</td></tr>
                ))}
                {Object.keys(rep.daily).length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No data</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Sales by vegetable</h2>
            {Object.entries<number>(rep.by_vegetable).map(([n, v]) => (
              <p key={n}>{n}: <b>₹{v.toFixed(2)}</b></p>
            ))}
          </div>
        </>
      )}

      <div className="bg-white rounded shadow p-4">
        <div className="flex justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-semibold">Daily Mandi-Rate Analytics <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded">Prototype / Simulated data</span></h2>
          <select value={vegId} onChange={(e) => setVegId(e.target.value)} className="border rounded px-3 py-1 print:hidden">
            {vegs.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-1 h-48">
          {rates.map((r) => (
            <div key={r.rate_date} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px]">{r.avg_rate}</span>
              <div className="w-full bg-green-600 rounded-t" style={{ height: `${(Number(r.avg_rate) / max) * 80}%` }} />
              <span className="text-[10px] mt-1">{r.rate_date.slice(5)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">₹/kg, last 14 days. Real market API nasalyamule simulated data vaparla ahe.</p>
      </div>
    </div>
  )
}
