 import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const page = Number(new URL(req.url).searchParams.get('page') || 1)
  const size = 10

  const { data, count, error: e } = await supabaseAdmin()
    .from('weighments')
    .select('*, produce_lots(lot_no, farmers(name), vegetables(name))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * size, page * size - 1)

  if (e) return dbError(e.message)
  return NextResponse.json({ data, total: count, page, size })
}

export async function POST(req: Request) {
  const { user, error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const body = await req.json()
  const gross = Number(body.gross_weight)
  const tare = Number(body.tare_weight || 0)

  if (!body.lot_id) return NextResponse.json({ error: 'Lot is required' }, { status: 400 })
  if (!gross || gross <= 0)
    return NextResponse.json({ error: 'Gross weight must be greater than 0' }, { status: 400 })
  if (tare < 0) return NextResponse.json({ error: 'Tare cannot be negative' }, { status: 400 })
  if (gross <= tare)
    return NextResponse.json({ error: 'Gross weight must be greater than tare' }, { status: 400 })

  const db = supabaseAdmin()

  const { data: lot } = await db.from('produce_lots').select('status').eq('id', body.lot_id).single()
  if (!lot) return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
  if (lot.status !== 'received')
    return NextResponse.json({ error: `Lot already ${lot.status}` }, { status: 409 })

  const { data, error: e } = await db
    .from('weighments')
    .insert({ lot_id: body.lot_id, gross_weight: gross, tare_weight: tare, weighed_by: user!.id })
    .select()
    .single()

  if (e) return dbError(e.message)

  await db.from('produce_lots')
    .update({ status: 'weighed', updated_at: new Date().toISOString() })
    .eq('id', body.lot_id)

  await audit(user!.id, 'WEIGH', 'weighments', data.id, { lot_id: body.lot_id, net: data.net_weight })
  return NextResponse.json(data, { status: 201 })
}
