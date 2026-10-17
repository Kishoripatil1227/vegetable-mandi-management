'use client'
import { Fragment, useCallback, useEffect, useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
const one = (v: any) => (Array.isArray(v) ? v[0] : v)

export default function HistoryPage() {
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [f, setF] = useState({ search: '', status: '', from: '', to: '' })
  const [open, setOpen] = useState<string | null>(null)
  const [denied, setDenied] = useState(false)

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ ...f, page: String(page) })
    const r = await fetch(`/api/history?${qs}`)
    if (!r.ok) { setDenied(true); return }
    const j = await r.json()
    setRows(j.data); setTotal(j.total)
  }, [f, page])
  useEffect(() => { load() }, [load])

  if (denied) return <p>Ya screen sathi access nahi (customer view: lavkarach).</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Search & History</h1>
      <div className="bg-white p-4 rounded shadow grid md:grid-cols-4 gap-3">
        <input placeholder="Lot no..." value={f.search}
          onChange={(e) => { setF({ ...f, search: e.target.value }); setPage(1) }}
          className="border rounded px-3 py-2" />
        <select value={f.status} onChange={(e) => { setF({ ...f, status: e.target.value }); setPage(1) }}
          className="border rounded px-3 py-2">
          <option value="">All status</option>
          {['received', 'weighed', 'auctioned', 'settled'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" aria-label="From date" value={f.from}
          onChange={(e) => { setF({ ...f, from: e.target.value }); setPage(1) }} className="border rounded px-3 py-2" />
        <input type="date" aria-label="To date" value={f.to}
          onChange={(e) => { setF({ ...f, to: e.target.value }); setPage(1) }} className="border rounded px-3 py-2" />
      </div>

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-100 text-left">
            <tr><th className="p-2">Lot</th><th className="p-2">Farmer</th><th className="p-2">Vegetable</th>
              <th className="p-2">Date</th><th className="p-2">Status</th><th className="p-2">Details</th></tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const w = one(l.weighments), a = one(l.auctions), s = one(l.settlements)
              return (
                <Fragment key={l.id}>
                  <tr className="border-t">
                    <td className="p-2">{l.lot_no}</td>
                    <td className="p-2">{one(l.farmers)?.name}</td>
                    <td className="p-2">{one(l.vegetables)?.name}</td>
                    <td className="p-2">{l.lot_date}</td>
                    <td className="p-2"><StatusBadge s={l.status} /></td>
                    <td className="p-2">
                      <button className="text-green-700 underline" onClick={() => setOpen(open === l.id ? null : l.id)}>
                        {open === l.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {open === l.id && (
                    <tr className="bg-green-50">
                      <td colSpan={6} className="p-3">
                        <ol className="list-decimal ml-5 space-y-1">
                          <li>Lot received: {l.quantity} kg</li>
                          <li>Weighment: {w ? `Net ${w.net_weight} kg` : 'Pending'}</li>
                          <li>Auction: {a ? `${one(a.buyers)?.name} @ ₹${a.rate_per_kg}/kg = ₹${a.total_amount}` : 'Pending'}</li>
                          <li>Commission: {a && one(a.commissions) ? `₹${one(a.commissions).commission_amount}` : 'Pending'}</li>
                          <li>Settlement: {s ? `₹${s.net_payable} (${s.payment_status}${s.paid_date ? ' on ' + s.paid_date : ''})` : 'Pending'}</li>
                        </ol>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No records</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center gap-3 mt-3">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <span>Page {page} of {Math.max(1, Math.ceil(total / 10))}</span>
          <button disabled={page * 10 >= total} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  )
}