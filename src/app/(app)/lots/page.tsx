 'use client'
import { useCallback, useEffect, useState } from 'react'

type Opt = { id: string; name: string }
type Lot = {
  id: string; lot_no: string; quantity: number; lot_date: string; status: string
  farmers: { name: string } | null; vegetables: { name: string } | null
}

export default function LotsPage() {
  const [farmers, setFarmers] = useState<Opt[]>([])
  const [vegs, setVegs] = useState<Opt[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ farmer_id: '', vegetable_id: '', quantity: '' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    const r = await fetch(`/api/lots?page=${page}&status=${status}&search=${encodeURIComponent(search)}`)
    const j = await r.json()
    if (r.ok) { setLots(j.data); setTotal(j.total) }
  }, [page, status, search])

  useEffect(() => {
    fetch('/api/lookups?type=farmers').then((r) => r.json()).then(setFarmers)
    fetch('/api/lookups?type=vegetables').then((r) => r.json()).then(setVegs)
  }, [])
  useEffect(() => { load() }, [load])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/lots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    if (r.ok) {
      setMsg({ ok: true, text: `Lot ${j.lot_no} created successfully` })
      setForm({ farmer_id: '', vegetable_id: '', quantity: '' })
      load()
    } else setMsg({ ok: false, text: j.error })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Produce Lot Intake</h1>

      <form onSubmit={save} className="bg-white p-4 rounded shadow grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label htmlFor="farmer" className="block text-sm mb-1">Farmer</label>
          <select id="farmer" required value={form.farmer_id}
            onChange={(e) => setForm({ ...form, farmer_id: e.target.value })}
            className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            {farmers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="veg" className="block text-sm mb-1">Vegetable</label>
          <select id="veg" required value={form.vegetable_id}
            onChange={(e) => setForm({ ...form, vegetable_id: e.target.value })}
            className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            {vegs.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="qty" className="block text-sm mb-1">Quantity (kg)</label>
          <input id="qty" type="number" step="0.01" min="0" required value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full border rounded px-3 py-2" />
        </div>
        <button className="bg-green-700 text-white py-2 rounded font-semibold">Create Lot</button>
      </form>

      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded shadow p-4">
        <div className="flex gap-3 mb-3 flex-wrap">
          <input placeholder="Search lot no..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="border rounded px-3 py-2" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="border rounded px-3 py-2">
            <option value="">All status</option>
            {['received', 'weighed', 'auctioned', 'settled'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 text-left">
              <tr><th className="p-2">Lot No</th><th className="p-2">Farmer</th><th className="p-2">Vegetable</th>
                <th className="p-2">Qty</th><th className="p-2">Date</th><th className="p-2">Status</th></tr>
            </thead>
            <tbody>
              {lots.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.lot_no}</td>
                  <td className="p-2">{l.farmers?.name}</td>
                  <td className="p-2">{l.vegetables?.name}</td>
                  <td className="p-2">{l.quantity}</td>
                  <td className="p-2">{l.lot_date}</td>
                  <td className="p-2 capitalize">{l.status}</td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No lots</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <span>Page {page} of {Math.max(1, Math.ceil(total / 10))}</span>
          <button disabled={page * 10 >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}
