 'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell from '@/components/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) return setError(error.message)
    setSent(true)
  }

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <h2 className="font-display text-3xl font-extrabold">Forgot password</h2>
        <p className="text-[#5d6f64] mt-1">Enter your email and we will send you a reset link.</p>

        {sent ? (
          <p className="mt-6 bg-[#e3f1e8] text-[#14653a] rounded-lg p-4 text-sm">
            If an account exists for <b>{email}</b>, a password reset link has been sent. Check your inbox and spam folder.
          </p>
        ) : (
          <>
            <div className="mt-6">
              <label htmlFor="email" className="block text-sm font-semibold text-[#5d6f64] mb-1.5">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mandi.in" className="w-full px-3 py-2.5" />
            </div>
            <p className="text-sm text-[#b3261e] min-h-5 mt-3" role="alert">{error}</p>
            <button disabled={loading}
              className="w-full mt-2 bg-[#197a45] hover:bg-[#14653a] text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </>
        )}
        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-[#197a45] font-semibold hover:underline">← Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
