'use client'
import { useCallback, useEffect, useState } from 'react'
import StatusBadge from '@/components/StatusBadge'

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

  const pages = Math.max(1, Math.ceil(total / 10))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <h1>Produce Lots</h1>
        <span className="bg-[#e3f1e8] text-[#197a45] font-semibold text-sm px-3 py-1 rounded-full">
          {total} total
        </span>
      </div>

      <form onSubmit={save} className="bg-white p-5 rounded">
        <h2 className="font-display text-lg mb-4">Receive a new lot</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="farmer" className="block text-sm mb-1.5">Farmer <span className="text-red-600">*</span></label>
            <select id="farmer" required value={form.farmer_id}
              onChange={(e) => setForm({ ...form, farmer_id: e.target.value })} className="w-full">
              <option value="">Select farmer</option>
              {farmers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="veg" className="block text-sm mb-1.5">Vegetable <span className="text-red-600">*</span></label>
            <select id="veg" required value={form.vegetable_id}
              onChange={(e) => setForm({ ...form, vegetable_id: e.target.value })} className="w-full">
              <option value="">Select vegetable</option>
              {vegs.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="qty" className="block text-sm mb-1.5">Quantity (kg) <span className="text-red-600">*</span></label>
            <input id="qty" type="number" step="0.01" min="0" required value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full" />
          </div>
        </div>
        <button className="bg-green-700 text-white px-6 py-2.5 mt-5">+ Create lot</button>
      </form>

      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded p-5">
        <div className="flex gap-3 mb-4 flex-wrap items-center justify-between">
          <h2 className="font-display text-lg">All lots</h2>
          <div className="flex gap-3 flex-wrap">
            <input placeholder="Search lot number..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full sm:w-60" />
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All status</option>
              {['received', 'weighed', 'auctioned', 'settled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr className="text-left">
                <th>Lot no</th><th>Farmer</th><th>Vegetable</th><th>Qty (kg)</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l) => (
                <tr key={l.id}>
                  <td className="font-semibold">{l.lot_no}</td>
                  <td>{l.farmers?.name}</td>
                  <td>{l.vegetables?.name}</td>
                  <td>{l.quantity}</td>
                  <td className="text-gray-500">{l.lot_date}</td>
                  <td><StatusBadge s={l.status} /></td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="py-10 text-center text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="font-semibold text-gray-700">No lots yet</p>
                      <p className="text-sm">Create the first lot using the form above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="border px-4 py-1.5">← Prev</button>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="border px-4 py-1.5">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}