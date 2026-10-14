'use client'
import { useCallback, useEffect, useState } from 'react'

type Field = { key: string; label: string; required?: boolean }
type Row = Record<string, any> // backend dynamic objects sathi safe data row type mapping

export default function MasterPage({
  title,
  endpoint,
  fields,
}: {
  title: string
  endpoint: string
  fields: Field[]
}) {
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`${endpoint}?search=${encodeURIComponent(search)}&page=${page}`)
    const json = await res.json()
    if (res.ok) {
      // API madhun direct object array yet asel kiwa paginated structure handling block
      if (json.data) {
        setRows(Array.isArray(json.data) ? json.data : [])
        setTotal(json.meta?.total || 0)
      } else {
        setRows(Array.isArray(json) ? json : [])
        setTotal(Array.isArray(json) ? json.length : 0)
      }
    }
  }, [endpoint, search, page])

  useEffect(() => {
    load()
  }, [load])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (res.ok) {
      setMsg({ type: 'ok', text: `${title} saved successfully` })
      setForm({})
      load()
    } else {
      setMsg({ type: 'err', text: json.error || 'Failed to safe create log' })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-green-900">{title} Management</h1>

      <form onSubmit={save} className="bg-white p-4 rounded shadow grid md:grid-cols-4 gap-3 items-end">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="block text-sm mb-1">{f.label}</label>
            <input
              id={f.key}
              required={f.required}
              value={form[f.key] || ''}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}
        <button className="bg-green-700 text-white py-2 rounded font-semibold">Add {title}</button>
      </form>

      {msg && (
        <p className={msg.type === 'ok' ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>
      )}

      <div className="bg-white rounded shadow p-4">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="border rounded px-3 py-2 mb-3 w-full md:w-72"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 text-left">
              <tr>
                {fields.map((f) => (
                  <th key={f.key} className="p-2">{f.label}</th>
                ))}
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  {fields.map((f) => (
                    <td key={f.key} className="p-2">{r[f.key]}</td>
                  ))}
                  <td className="p-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      r.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {r.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={fields.length + 1} className="p-4 text-center text-gray-500">No records</td></tr>
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