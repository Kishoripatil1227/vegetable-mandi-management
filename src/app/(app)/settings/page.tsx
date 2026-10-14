 'use client'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [me, setMe] = useState<any>(null)
  const [pct, setPct] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setMe)
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => s && setPct(String(s.default_commission_percent)))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_commission_percent: pct }),
    })
    const j = await r.json()
    setMsg(r.ok ? { ok: true, text: 'Settings saved' } : { ok: false, text: j.error })
  }

  if (!me) return <p>Loading...</p>

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-green-900">Profile / Settings</h1>
      <div className="bg-white p-4 rounded shadow space-y-1">
        <p>Name: <b>{me.name || '-'}</b></p>
        <p>Email: <b>{me.email}</b></p>
        <p>Mobile: <b>{me.phone || '-'}</b></p>
        <p>Role: <b className="capitalize">{me.role}</b></p>
      </div>

      {me.role !== 'customer' && (
        <form onSubmit={save} className="bg-white p-4 rounded shadow space-y-3">
          <label htmlFor="pct" className="block text-sm">
            Default commission % {me.role !== 'admin' && '(fakt admin badlu shakto)'}
          </label>
          <input id="pct" type="number" step="0.01" min="0" max="100" value={pct}
            disabled={me.role !== 'admin'} onChange={(e) => setPct(e.target.value)}
            className="border rounded px-3 py-2 w-full disabled:bg-gray-100" />
          {me.role === 'admin' && (
            <button className="bg-green-700 text-white px-4 py-2 rounded">Save</button>
          )}
          {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}
        </form>
      )}
    </div>
  )
}
