import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireRole(['admin'])
  if (error) return error
  const { data, error: e } = await supabaseAdmin()
    .from('profiles')
    .select('id,full_name,phone,role,created_at')
    .order('created_at')
  if (e) return dbError(e.message)
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { user, error } = await requireRole(['admin'])
  if (error) return error
  const body = await req.json()
  const phone = String(body.phone || '').trim()

  if (!body.email || !body.password || String(body.password).length < 6)
    return NextResponse.json({ error: 'Email and password (min 6 chars) required' }, { status: 400 })
  if (!/^[0-9]{10}$/.test(phone))
    return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 })
  if (!['admin', 'staff', 'customer'].includes(body.role))
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const db = supabaseAdmin()

  const { data: existing } = await db.from('profiles').select('id').eq('phone', phone).maybeSingle()
  if (existing)
    return NextResponse.json({ error: 'Mobile number already registered' }, { status: 409 })

  const { data, error: e } = await db.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { full_name: body.full_name || '' },
  })
  if (e) return NextResponse.json({ error: e.message }, { status: 400 })

  const { error: pe } = await db.from('profiles').upsert({
    id: data.user.id,
    role: body.role,
    full_name: body.full_name || null,
    phone,
  })
  if (pe) return dbError(pe.message)

  await audit(user!.id, 'USER_CREATE', 'profiles', data.user.id, { role: body.role })
  return NextResponse.json({ id: data.user.id }, { status: 201 })
}