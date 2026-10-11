 'use client'
import { useCallback, useEffect, useState } from 'react'

type Opt = { id: string; name: string }
type LotOpt = {
  id: string; lot_no: string
  farmers: { name: string } | null; vegetables: { name: string } | null
  weighments: { net_weight: number }[] | { net_weight: number } | null
}
type A = {
  id: string; rate_per_kg: number; total_amount: number; auction_date: string
  buyers: { name: string } | null
  commissions: { percent: number; commission_amount: number }[] | { percent: number; commission_amount: number } | null
  produce_lots: { lot_no: string; farmers: { name: string } | null; vegetables: { name: string } | null } | null
}

const first = <T,>(v: T[] | T | null) => (Array.isArray(v) ? v[0] : v)

export default function AuctionPage() {
  const [lots, setLots] = useState<LotOpt[]>([])
  const [buyers, setBuyers] = useState<Opt[]>([])
  const [rows, setRows] = useState<A[]>([])
  const [form, setForm] = useState({ lot_id: '', buyer_id: '', rate_per_kg: '', commission_percent: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      fetch('/api/lookups?type=lots_weighed').then((r) => r.json()),
      fetch('/api/lookups?type=buyers').then((r) => r.json()),
      fetch('/api/auctions').then((r) => r.json()),
    ])
    setLots(a); setBuyers(b); setRows(c.data || [])
  }, [])
  useEffect(() => { load() }, [load])

  const selected = lots.find((l) => l.id === form.lot_id)
  const net = Number(first(selected?.weighments ?? null)?.net_weight || 0)
  const pct = form.commission_percent === '' ? 6 : Number(form.commission_percent)
  const total = net * Number(form.rate_per_kg || 0)
  const commission = (total * pct) / 100

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/auctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    if (r.ok) {
      setMsg({ ok: true, text: `Auction saved. Total ₹${j.total_amount}, Commission ₹${j.commission_amount}` })
      setForm({ lot_id: '', buyer_id: '', rate_per_kg: '', commission_percent: '' })
      load()
    } else setMsg({ ok: false, text: j.error })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Auction / Price & Commission</h1>

      <form onSubmit={save} className="bg-white p-4 rounded shadow grid md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label htmlFor="lot" className="block text-sm mb-1">Lot (weighed)</label>
          <select id="lot" required value={form.lot_id}
            onChange={(e) => setForm({ ...form, lot_id: e.target.value })}
            className="w-full border rounded px-3 py-2">
            <option value="">Select lot</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.lot_no} - {l.farmers?.name} - {l.vegetables?.name} ({first(l.weighments)?.net_weight} kg)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="buyer" className="block text-sm mb-1">Buyer</label>
          <select id="buyer" required value={form.buyer_id}
            onChange={(e) => setForm({ ...form, buyer_id: e.target.value })}
            className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rate" className="block text-sm mb-1">Rate (₹/kg)</label>
          <input id="rate" type="number" step="0.01" min="0" required value={form.rate_per_kg}
            onChange={(e) => setForm({ ...form, rate_per_kg: e.target.value })}
            className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="comm" className="block text-sm mb-1">Commission % (default 6)</label>
          <input id="comm" type="number" step="0.01" min="0" max="100" value={form.commission_percent}
            onChange={(e) => setForm({ ...form, commission_percent: e.target.value })}
            className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2 text-sm">
          <p>Net weight: <b>{net.toFixed(2)} kg</b></p>
          <p>Total: <b>₹{total.toFixed(2)}</b> | Commission: <b>₹{commission.toFixed(2)}</b> | Farmer payable: <b className="text-green-800">₹{(total - commission).toFixed(2)}</b></p>
        </div>
        <button className="bg-green-700 text-white py-2 rounded font-semibold">Save Auction</button>
      </form>

      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-100 text-left">
            <tr><th className="p-2">Lot</th><th className="p-2">Farmer</th><th className="p-2">Vegetable</th>
              <th className="p-2">Buyer</th><th className="p-2">Rate</th><th className="p-2">Total</th>
              <th className="p-2">Comm %</th><th className="p-2">Commission</th></tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const c = first(a.commissions)
              return (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.produce_lots?.lot_no}</td>
                  <td className="p-2">{a.produce_lots?.farmers?.name}</td>
                  <td className="p-2">{a.produce_lots?.vegetables?.name}</td>
                  <td className="p-2">{a.buyers?.name}</td>
                  <td className="p-2">₹{a.rate_per_kg}</td>
                  <td className="p-2">₹{a.total_amount}</td>
                  <td className="p-2">{c?.percent}%</td>
                  <td className="p-2">₹{c?.commission_amount}</td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">No auctions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
