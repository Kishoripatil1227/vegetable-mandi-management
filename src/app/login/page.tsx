'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'

const ROLES = ['Admin', 'Staff', 'Customer'] as const
const DESC: Record<string, string> = {
  Admin: 'Admin / Owner: full access, finalizes payments.',
  Staff: 'Staff / Operator: daily entries, cannot finalize payments.',
  Customer: 'Customer: view your own purchases and rates.',
}

export default function LoginPage() {
  const [role, setRole] = useState<(typeof ROLES)[number]>('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: role.toLowerCase() }),
        signal: ctrl.signal,
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || `Login failed (${r.status})`)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(
        err?.name === 'AbortError'
          ? 'The server is taking too long. Please try again.'
          : err?.message || 'Something went wrong. Please try again.'
      )
      setLoading(false)
    } finally {
      clearTimeout(timer)
    }
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <h2 className="font-display text-3xl font-extrabold">Sign in</h2>
        <p className="text-[#5d6f64] mt-1">Choose your role to see the right tools.</p>

        <div className="grid grid-cols-3 bg-[#e3f1e8] p-1 rounded-xl mt-5" role="tablist" aria-label="Sign in as">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => {
                setRole(r)
                setError('')
              }}
              className={`py-2 rounded-lg text-sm font-semibold ${
                role === r ? 'bg-white text-[#197a45] shadow' : 'text-[#5d6f64]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#5d6f64] mt-2">{DESC[role]}</p>

        <div className="mt-5">
          <label htmlFor="email" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mandi.in"
            className="w-full px-3 py-2.5"
          />
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-[#5d6f64]">Password</label>
            <Link href="/forgot-password" className="text-sm font-semibold text-[#197a45] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2.5 pr-16"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#197a45] px-2"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <p className="text-sm text-[#b3261e] min-h-5 mt-3" role="alert">{error}</p>

        <button
          disabled={loading}
          className="w-full mt-2 bg-[#197a45] hover:bg-[#14653a] text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'Signing in...' : `Sign in as ${role}`}
        </button>

        <div className="mt-6 pt-5 border-t border-[#dce3dc] text-center text-sm text-[#5d6f64]">
          New here?{' '}
          <Link href="/signup" className="text-[#197a45] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
        <p className="text-center text-sm mt-3">
          <Link href="/" className="text-[#197a45] font-semibold hover:underline">← Back to home</Link>
        </p>
      </form>
    </AuthShell>
  )
}