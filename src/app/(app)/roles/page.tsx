 
'use client'
import { useCallback, useEffect, useState } from 'react'

const empty = { full_name: '', email: '', phone: '', password: '', role: 'staff' }

export default function RolesPage() {
  const [users, setUsers] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    const [u, a] = await Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/audit').then((r) => r.json()),
    ])
    setUsers(Array.isArray(u) ? u : [])
    setLogs(Array.isArray(a) ? a : [])
  }, [])
  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    setMsg(r.ok ? { ok: true, text: 'User created' } : { ok: false, text: j.error })
    if (r.ok) { setForm(empty); load() }
  }

      async function changeRole(id: string, role: string) {
    const r = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    const j = await r.json().catch(() => ({}))
    setMsg(
      r.ok
        ? { ok: true, text: 'Role updated' }
        : { ok: false, text: j.error || `Request failed (${r.status})` }
    )
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">Role Management</h1>

      <form onSubmit={create} className="bg-white p-4 rounded shadow grid md:grid-cols-6 gap-3 items-end">
        <input placeholder="Full name" value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="border rounded px-3 py-2" />
        <input type="email" required placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded px-3 py-2" />
        <input required placeholder="Mobile (10 digits)" inputMode="numeric" maxLength={10}
          pattern="[0-9]{10}" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
          className="border rounded px-3 py-2" />
        <input type="password" required minLength={6} placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border rounded px-3 py-2" />
        <select aria-label="Role" value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border rounded px-3 py-2">
          <option value="admin">admin</option>
          <option value="staff">staff</option>
          <option value="customer">customer</option>
        </select>
        <button className="bg-green-700 text-white py-2 rounded font-semibold">Create User</button>
      </form>

      {msg && <p className={msg.ok ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <h2 className="font-semibold mb-2">Users</h2>
        <table className="w-full text-sm">
          <thead className="bg-green-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Role</th>
              <th className="p-2">Change role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.full_name || u.id.slice(0, 8)}</td>
                <td className="p-2">{u.phone || '-'}</td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2">
                  <select aria-label="Change role" value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="border rounded px-2 py-1">
                    <option value="admin">admin</option>
                    <option value="staff">staff</option>
                    <option value="customer">customer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <h2 className="font-semibold mb-2">Audit log (last 50)</h2>
        <table className="w-full text-sm">
          <thead className="bg-green-100 text-left">
            <tr><th className="p-2">Time</th><th className="p-2">User</th><th className="p-2">Action</th><th className="p-2">Table</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-2">{(Array.isArray(l.profiles) ? l.profiles[0] : l.profiles)?.full_name || '-'}</td>
                <td className="p-2">{l.action}</td>
                <td className="p-2">{l.table_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}