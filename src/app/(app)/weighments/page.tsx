 'use client'
import { useCallback, useEffect, useState } from 'react'

type LotOpt = { id: string; lot_no: string; quantity: number; farmers: { name: string } | null; vegetables: { name: string } | null }
type W = {
  id: string; gross_weight: number; tare_weight: number; net_weight: number; created_at: string
  produce_lots: { lot_no: string; farmers: { name: string } | null; vegetables: { name: string } | null } | null
}

export default function WeighmentPage() {
  const [lots, setLots] = useState<LotOpt[]>([])
  const [rows, setRows] = useState<W[]>([])
  const [form, setForm] = useState({ lot_id: '', gross_weight: '', tare_weight: '0' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const net = Number(form.gross_weight || 0) - Number(form.tare_weight || 0)

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch('/api/lookups?type=lots_received').then((r) => r.json()),
      fetch('/api/weighments').then((r) => r.json()),
    ])
    setLots(a)
    setRows(b.data || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/weighments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    if (r.ok) {
      setMsg({ ok: true, text: `Weighment saved. Net weight: ${j.net_weight} kg` })
      setForm({ lot_id: '', gross_weight: '', tare_weight: '0' })
      load()
    } else setMsg({ ok: false, text: j.error })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Weighment</h1>

      <form onSubmit={save} className="bg-white p-4 rounded shadow grid md:grid-cols-5 gap-3 items-end">
        <div className="md:col-span-2">
          <label htmlFor="lot" className="block text-sm mb-1">Lot (received)</label>
          <select id="lot" required value={form.lot_id}
            onChange={(e) => setForm({ ...form, lot_id: e.target.value })}
            className="w-full border rounded px-3 py-2">
            <option value="">Select lot</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.lot_no} - {l.farmers?.name} - {l.vegetables?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gross" className="block text-sm mb-1">Gross (kg)</label>
          <input id="gross" type="number" step="0.01" required value={form.gross_weight}
            onChange={(e) => setForm({ ...form, gross_weight: e.target.value })}
            className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label htmlFor="tare" className="block text-sm mb-1">Tare (kg)</label>
          <input id="tare" type="number" step="0.01" value={form.tare_weight}
            onChange={(e) => setForm({ ...form, tare_weight: e.target.value })}
            className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <p className="text-sm mb-1">Net weight</p>
          <p className="font-bold text-green-800 py-2">{net > 0 ? net.toFixed(2) : '0.00'} kg</p>
        </div>
        <button className="bg-green-700 text-white py-2 rounded font-semibold md:col-span-5">Save Weighment</button>
      </form>

      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-100 text-left">
            <tr><th className="p-2">Lot</th><th className="p-2">Farmer</th><th className="p-2">Vegetable</th>
              <th className="p-2">Gross</th><th className="p-2">Tare</th><th className="p-2">Net</th></tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-2">{w.produce_lots?.lot_no}</td>
                <td className="p-2">{w.produce_lots?.farmers?.name}</td>
                <td className="p-2">{w.produce_lots?.vegetables?.name}</td>
                <td className="p-2">{w.gross_weight}</td>
                <td className="p-2">{w.tare_weight}</td>
                <td className="p-2 font-semibold">{w.net_weight}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No weighments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
