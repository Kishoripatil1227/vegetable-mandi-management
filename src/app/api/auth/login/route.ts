import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim()
  const password = String(body.password || '')
  const role = String(body.role || '')

  if (!email || !password)
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  const { data: profile } = await supabaseAdmin()
    .from('profiles')
    .select('role,requested_role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.json(
      { error: 'Your account has no profile yet. Please contact the admin.' },
      { status: 403 }
    )
  }

  if (profile.role !== role) {
    await supabase.auth.signOut()
    const msg =
      role === 'staff' && profile.requested_role === 'staff'
        ? 'Your Staff request is waiting for admin approval. Please try again later or sign in as Customer.'
        : `This account is not registered as ${role}. Please select the correct role.`
    return NextResponse.json({ error: msg }, { status: 403 })
  }

  return NextResponse.json({ ok: true, role: profile.role })
}