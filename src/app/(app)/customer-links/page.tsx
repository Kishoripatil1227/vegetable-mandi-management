'use client'
import { useCallback, useEffect, useState } from 'react'

export default function CustomerLinksPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [buyers, setBuyers] = useState<any[]>([])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    const j = await fetch('/api/customer-links').then((r) => r.json())
    setCustomers(j.customers || [])
    setBuyers(j.buyers || [])
  }, [])
  useEffect(() => { load() }, [load])

  async function link(customerId: string, buyerId: string) {
    const current = buyers.find((b) => b.user_id === customerId)
    const call = (id: string, user_id: string | null) =>
      fetch(`/api/buyers/${id}/link`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      })
    if (current) await call(current.id, null)
    if (buyerId) {
      const r = await call(buyerId, customerId)
      const j = await r.json()
      setMsg(r.ok ? { ok: true, text: 'Customer linked' } : { ok: false, text: j.error })
    } else setMsg({ ok: true, text: 'Link removed' })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Customer ↔ Buyer Link</h1>
      <p className="text-sm text-gray-600">
        Customer login la tyacha buyer profile select kara. Tyala fakt tya buyer che purchases distil.
      </p>
      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-100 text-left">
            <tr><th className="p-2">Customer</th><th className="p-2">Linked buyer</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const current = buyers.find((b) => b.user_id === c.id)
              return (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.full_name || c.id.slice(0, 8)}</td>
                  <td className="p-2">
                    <select aria-label="Buyer" value={current?.id || ''}
                      onChange={(e) => link(c.id, e.target.value)}
                      className="border rounded px-2 py-1">
                      <option value="">-- Not linked --</option>
                      {buyers
                        .filter((b) => !b.user_id || b.user_id === c.id)
                        .map((b) => (
                          <option key={b.id} value={b.id}>{b.name} ({b.phone})</option>
                        ))}
                    </select>
                  </td>
                </tr>
              )
            })}
            {customers.length === 0 && (
              <tr><td colSpan={2} className="p-4 text-center text-gray-500">No customer users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}