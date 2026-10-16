 'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/AuthShell'

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (session) setStatus('ready')
    })
    sb.auth.getSession().then(async ({ data }) => {
      if (data.session) return setStatus('ready')
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code)
        if (!error) setStatus('ready')
      }
    })
    const t = setTimeout(() => setStatus((s) => (s === 'checking' ? 'invalid' : s)), 3000)
    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(t)
    }
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    await sb.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <h2 className="font-display text-3xl font-extrabold">Set a new password</h2>

        {status === 'checking' && <p className="mt-4 text-[#5d6f64]">Verifying your link...</p>}

        {status === 'invalid' && (
          <>
            <p className="mt-4 bg-red-50 text-[#b3261e] rounded-lg p-4 text-sm">
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password" className="inline-block mt-4 text-[#197a45] font-semibold hover:underline">
              Request a new link
            </Link>
          </>
        )}

        {status === 'ready' && (
          <form onSubmit={onSubmit}>
            <p className="text-[#5d6f64] mt-1">Choose a strong password for your account.</p>
            <div className="mt-5">
              <label htmlFor="p" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">New password</label>
              <input id="p" type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5" />
            </div>
            <div className="mt-3">
              <label htmlFor="c" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Confirm password</label>
              <input id="c" type="password" required minLength={6} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2.5" />
            </div>
            <p className="text-sm text-[#b3261e] min-h-5 mt-3" role="alert">{error}</p>
            <button disabled={loading}
              className="w-full mt-2 bg-[#197a45] hover:bg-[#14653a] text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  )
}
