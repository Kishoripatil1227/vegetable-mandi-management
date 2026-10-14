 import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const sp = new URL(req.url).searchParams
  const status = sp.get('status') || ''
  const page = Number(sp.get('page') || 1)
  const size = 10

  let q = supabaseAdmin()
    .from('settlements')
    .select('*, farmers(name,phone), produce_lots(lot_no, vegetables(name))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * size, page * size - 1)
  if (status) q = q.eq('payment_status', status)

  const { data, count, error: e } = await q
  if (e) return dbError(e.message)
  return NextResponse.json({ data, total: count, page, size })
}

// Settlement create (pending) auction nantar
export async function POST(req: Request) {
  const { user, error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const body = await req.json()
  const db = supabaseAdmin()
  if (!body.lot_id) return NextResponse.json({ error: 'Lot is required' }, { status: 400 })

  const { data: lot } = await db.from('produce_lots').select('status,farmer_id').eq('id', body.lot_id).single()
  if (!lot) return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
  if (lot.status !== 'auctioned')
    return NextResponse.json({ error: `Lot must be auctioned first (current: ${lot.status})` }, { status: 409 })

  const { data: a } = await db.from('auctions')
    .select('id,total_amount, commissions(commission_amount)')
    .eq('lot_id', body.lot_id).single()
  if (!a) return NextResponse.json({ error: 'Auction not found' }, { status: 404 })

  const commissionRow = Array.isArray(a.commissions) ? a.commissions[0] : a.commissions
  const commission = Number(commissionRow?.commission_amount || 0)
  const gross = Number(a.total_amount)

  const { data, error: e } = await db.from('settlements')
    .insert({
      lot_id: body.lot_id,
      farmer_id: lot.farmer_id,
      gross_amount: gross,
      commission_amount: commission,
      net_payable: Math.round((gross - commission) * 100) / 100,
    })
    .select()
    .single()
  if (e) return dbError(e.message)

  await audit(user!.id, 'SETTLEMENT_CREATE', 'settlements', data.id, { net: data.net_payable })
  return NextResponse.json(data, { status: 201 })
}
