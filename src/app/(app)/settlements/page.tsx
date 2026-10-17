 'use client'
import { useCallback, useEffect, useState } from 'react'
import StatusBadge from '@/components/StatusBadge'

type LotOpt = { id: string; lot_no: string; farmers: { name: string } | null; vegetables: { name: string } | null }
type S = {
  id: string; gross_amount: number; commission_amount: number; net_payable: number
  payment_status: string; paid_date: string | null
  farmers: { name: string } | null
  produce_lots: { lot_no: string; vegetables: { name: string } | null } | null
}

export default function SettlementPage() {
  const [lots, setLots] = useState<LotOpt[]>([])
  const [rows, setRows] = useState<S[]>([])
  const [lotId, setLotId] = useState('')
  const [status, setStatus] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch('/api/lookups?type=lots_auctioned').then((r) => r.json()),
      fetch(`/api/settlements?status=${status}`).then((r) => r.json()),
    ])
    setLots(a); setRows(b.data || [])
  }, [status])
  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lot_id: lotId }),
    })
    const j = await r.json()
    if (r.ok) { setMsg({ ok: true, text: `Settlement created. Net payable ₹${j.net_payable}` }); setLotId(''); load() }
    else setMsg({ ok: false, text: j.error })
  }

  async function finalize(id: string) {
    if (!confirm('Mark as PAID? He parat badlta yenar nahi.')) return
    const r = await fetch(`/api/settlements/${id}/finalize`, { method: 'PATCH' })
    const j = await r.json()
    setMsg(r.ok ? { ok: true, text: 'Payment marked as paid' } : { ok: false, text: j.error })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Farmer Settlement / Payment</h1>

      <form onSubmit={create} className="bg-white p-4 rounded shadow flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-60">
          <label htmlFor="lot" className="block text-sm mb-1">Lot (auctioned)</label>
          <select id="lot" required value={lotId} onChange={(e) => setLotId(e.target.value)}
            className="w-full border rounded px-3 py-2">
            <option value="">Select lot</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>{l.lot_no} - {l.farmers?.name} - {l.vegetables?.name}</option>
            ))}
          </select>
        </div>
        <button className="bg-green-700 text-white px-5 py-2 rounded font-semibold">Create Settlement</button>
      </form>

      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded shadow p-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2 mb-3">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 text-left">
              <tr><th className="p-2">Lot</th><th className="p-2">Farmer</th><th className="p-2">Gross</th>
                <th className="p-2">Commission</th><th className="p-2">Net Payable</th>
                <th className="p-2">Status</th><th className="p-2">Action</th></tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.produce_lots?.lot_no}</td>
                  <td className="p-2">{s.farmers?.name}</td>
                  <td className="p-2">₹{s.gross_amount}</td>
                  <td className="p-2">₹{s.commission_amount}</td>
                  <td className="p-2 font-semibold">₹{s.net_payable}</td>
                  <td className="p-2"><StatusBadge s={s.payment_status} />{s.paid_date && <span className="ml-2 text-xs text-gray-500">{s.paid_date}</span>}</td>
                  <td className="p-2">
                    {s.payment_status === 'pending' && (
                      <button onClick={() => finalize(s.id)} className="bg-green-700 text-white px-3 py-1 rounded text-xs">
                        Mark Paid (Admin)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-gray-500">No settlements</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
