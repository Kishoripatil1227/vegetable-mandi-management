 import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const body = await req.json()
  const name = String(body.full_name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const wanted = body.role === 'staff' ? 'staff' : 'customer'

  if (!name) return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
  if (!/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const db = supabaseAdmin()
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })
  if (error) {
    const dup = /already|registered|exists/i.test(error.message)
    return NextResponse.json(
      { error: dup ? 'An account with this email already exists' : error.message },
      { status: dup ? 409 : 400 }
    )
  }

  const { error: pe } = await db.from('profiles').upsert({
    id: data.user.id,
    full_name: name,
    role: 'customer',
    requested_role: wanted === 'staff' ? 'staff' : null,
  })
  if (pe) return NextResponse.json({ error: pe.message }, { status: 500 })

  return NextResponse.json({ ok: true, pending: wanted === 'staff' }, { status: 201 })
}
