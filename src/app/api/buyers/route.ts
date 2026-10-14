import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || 1)
  const size = 10

  let q = supabaseAdmin()
    .from('buyers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * size, page * size - 1)

  if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)

  const { data, count, error: e } = await q
  if (e) return dbError(e.message)
  return NextResponse.json({ data, total: count, page, size })
}

export async function POST(req: Request) {
  const { user, error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const body = await req.json()
  const name = String(body.name || '').trim()
  const phone = String(body.phone || '').trim()

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!/^[0-9]{10}$/.test(phone))
    return NextResponse.json({ error: 'Phone must be 10 digits' }, { status: 400 })

  const { data, error: e } = await supabaseAdmin()
    .from('buyers')
    .insert({ name, phone })
    .select()
    .single()

  if (e) return dbError(e.message)
  await audit(user!.id, 'CREATE', 'buyers', data.id, { name })
  return NextResponse.json(data, { status: 201 })
}