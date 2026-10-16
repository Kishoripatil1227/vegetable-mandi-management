'use client'
import { useCallback, useEffect, useState } from 'react'
import StatusBadge from '@/components/StatusBadge'

type Field = { key: string; label: string; required?: boolean }
type Row = Record<string, string | null>

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
      setRows(json.data)
      setTotal(json.total)
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
      setMsg({ type: 'err', text: json.error })
    }
  }

  const pages = Math.max(1, Math.ceil(total / 10))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <h1>{title}s</h1>
        <span className="bg-[#e3f1e8] text-[#197a45] font-semibold text-sm px-3 py-1 rounded-full">
          {total} total
        </span>
      </div>

      <form onSubmit={save} className="bg-white p-5 rounded">
        <h2 className="font-display text-lg mb-4">Add new {title.toLowerCase()}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key} className="block text-sm mb-1.5">
                {f.label}{f.required && <span className="text-red-600"> *</span>}
              </label>
              <input
                id={f.key}
                required={f.required}
                value={form[f.key] || ''}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <button className="bg-green-700 text-white px-6 py-2.5 mt-5">+ Add {title}</button>
      </form>

      {msg && <p className={msg.type === 'ok' ? 'text-green-700' : 'text-red-600'}>{msg.text}</p>}

      <div className="bg-white rounded p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="font-display text-lg">All {title.toLowerCase()}s</h2>
          <input
            placeholder={`Search ${title.toLowerCase()}s...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr className="text-left">
                {fields.map((f) => (
                  <th key={f.key}>{f.label.replace(/ \(.*\)/, '')}</th>
                ))}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {fields.map((f, idx) => (
                    <td key={f.key}>
                      {idx === 0 ? (
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#e3f1e8] text-[#197a45] grid place-items-center font-bold text-sm">
                            {(r[f.key] || '?')[0].toUpperCase()}
                          </span>
                          <span className="font-semibold">{r[f.key]}</span>
                        </div>
                      ) : (
                        r[f.key] || <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                  <td><StatusBadge s={r.status} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1}>
                    <div className="py-10 text-center text-gray-500">
                      <div className="text-4xl mb-2">🥬</div>
                      <p className="font-semibold text-gray-700">No {title.toLowerCase()}s yet</p>
                      <p className="text-sm">Add the first one using the form above.</p>
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