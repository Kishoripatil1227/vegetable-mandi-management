'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'

const OPTIONS = [
  { v: 'customer', t: 'Customer', d: 'View your own purchases and rates. Active immediately.' },
  { v: 'staff', t: 'Staff / Operator', d: 'Daily entries. Needs admin approval before access.' },
]

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', role: 'customer' })
  const [error, setError] = useState('')
  const [done, setDone] = useState<null | { pending: boolean }>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm({ ...form, [k]: v })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setLoading(true)
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const j = await r.json()
    setLoading(false)
    if (!r.ok) return setError(j.error)
    setDone({ pending: j.pending })
  }

  if (done)
    return (
      <AuthShell>
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[#e3f1e8] text-[#197a45] grid place-items-center text-2xl mx-auto">✓</div>
          <h2 className="font-display text-2xl font-extrabold mt-4">Account created</h2>
          <p className="text-[#5d6f64] mt-2">
            {done.pending
              ? 'Your Staff request has been sent. You can sign in as Customer now, and the admin will enable Staff access.'
              : 'You can now sign in with your email and password.'}
          </p>
          <Link href="/login" className="inline-block mt-6 bg-[#197a45] text-white px-6 py-2.5 rounded-lg font-semibold">
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    )

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <h2 className="font-display text-3xl font-extrabold">Create account</h2>
        <p className="text-[#5d6f64] mt-1">Select how you will use the system.</p>

        <div className="grid grid-cols-2 gap-2 mt-5">
          {OPTIONS.map((o) => (
            <button key={o.v} type="button" onClick={() => set('role', o.v)}
              className={`text-left rounded-xl border-2 p-3 ${
                form.role === o.v ? 'border-[#197a45] bg-[#e3f1e8]' : 'border-[#dce3dc] bg-white'
              }`}>
              <b className="block text-sm">{o.t}</b>
              <span className="block text-xs text-[#5d6f64] mt-0.5">{o.d}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label htmlFor="n" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Full name</label>
          <input id="n" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)}
            className="w-full px-3 py-2.5" />
        </div>
        <div className="mt-3">
          <label htmlFor="e" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Email</label>
          <input id="e" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)}
            placeholder="name@mandi.in" className="w-full px-3 py-2.5" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="p" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Password</label>
            <input id="p" type="password" required minLength={6} value={form.password}
              onChange={(e) => set('password', e.target.value)} className="w-full px-3 py-2.5" />
          </div>
          <div>
            <label htmlFor="c" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Confirm</label>
            <input id="c" type="password" required minLength={6} value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)} className="w-full px-3 py-2.5" />
          </div>
        </div>

        <p className="text-sm text-[#b3261e] min-h-5 mt-3" role="alert">{error}</p>

        <button disabled={loading}
          className="w-full mt-2 bg-[#197a45] hover:bg-[#14653a] text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-center text-sm mt-6 text-[#5d6f64]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#197a45] font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}