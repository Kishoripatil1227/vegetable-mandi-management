 import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const sp = new URL(req.url).searchParams
  const status = sp.get('status') || ''
  const search = sp.get('search') || ''
  const page = Number(sp.get('page') || 1)
  const size = 10

  let q = supabaseAdmin()
    .from('produce_lots')
    .select('*, farmers(name,phone), vegetables(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * size, page * size - 1)

  if (status) q = q.eq('status', status)
  if (search) q = q.ilike('lot_no', `%${search}%`)

  const { data, count, error: e } = await q
  if (e) return dbError(e.message)
  return NextResponse.json({ data, total: count, page, size })
}

export async function POST(req: Request) {
  const { user, error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const body = await req.json()
  const quantity = Number(body.quantity)

  if (!body.farmer_id) return NextResponse.json({ error: 'Farmer is required' }, { status: 400 })
  if (!body.vegetable_id) return NextResponse.json({ error: 'Vegetable is required' }, { status: 400 })
  if (!quantity || quantity <= 0)
    return NextResponse.json({ error: 'Quantity must be greater than 0' }, { status: 400 })

  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const lot_no = `LOT-${d}-${Math.floor(1000 + Math.random() * 9000)}`

  const { data, error: e } = await supabaseAdmin()
    .from('produce_lots')
    .insert({
      lot_no,
      farmer_id: body.farmer_id,
      vegetable_id: body.vegetable_id,
      quantity,
      created_by: user!.id,
    })
    .select()
    .single()

  if (e) return dbError(e.message)
  await audit(user!.id, 'CREATE', 'produce_lots', data.id, { lot_no })
  return NextResponse.json(data, { status: 201 })
}