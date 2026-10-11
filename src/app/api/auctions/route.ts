 import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const page = Number(new URL(req.url).searchParams.get('page') || 1)
  const size = 10

  const { data, count, error: e } = await supabaseAdmin()
    .from('auctions')
    .select(
      '*, buyers(name), commissions(percent,commission_amount), produce_lots(lot_no, farmers(name), vegetables(name))',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * size, page * size - 1)

  if (e) return dbError(e.message)
  return NextResponse.json({ data, total: count, page, size })
}

export async function POST(req: Request) {
  const { user, error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const body = await req.json()
  const rate = Number(body.rate_per_kg)
  const db = supabaseAdmin()

  if (!body.lot_id) return NextResponse.json({ error: 'Lot is required' }, { status: 400 })
  if (!body.buyer_id) return NextResponse.json({ error: 'Buyer is required' }, { status: 400 })
  if (!rate || rate <= 0)
    return NextResponse.json({ error: 'Rate must be greater than 0' }, { status: 400 })

  // commission percent: user input, nahitar default setting
  let percent = body.commission_percent === '' || body.commission_percent == null
    ? NaN : Number(body.commission_percent)
  if (isNaN(percent)) {
    const { data: s } = await db.from('app_settings').select('value').eq('key', 'default_commission_percent').single()
    percent = Number(s?.value ?? 6)
  }
  if (percent < 0 || percent > 100)
    return NextResponse.json({ error: 'Commission must be between 0 and 100' }, { status: 400 })

  const { data: lot } = await db.from('produce_lots').select('status').eq('id', body.lot_id).single()
  if (!lot) return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
  if (lot.status !== 'weighed')
    return NextResponse.json({ error: `Lot must be weighed first (current: ${lot.status})` }, { status: 409 })

  const { data: w } = await db.from('weighments').select('net_weight').eq('lot_id', body.lot_id).single()
  if (!w) return NextResponse.json({ error: 'Weighment not found' }, { status: 404 })

  const total = Math.round(Number(w.net_weight) * rate * 100) / 100
  const commission = Math.round(total * percent) / 100

  const { data: auction, error: e1 } = await db
    .from('auctions')
    .insert({ lot_id: body.lot_id, buyer_id: body.buyer_id, rate_per_kg: rate, total_amount: total, created_by: user!.id })
    .select()
    .single()
  if (e1) return dbError(e1.message)

  const { error: e2 } = await db
    .from('commissions')
    .insert({ auction_id: auction.id, percent, commission_amount: commission })
  if (e2) {
    await db.from('auctions').delete().eq('id', auction.id) // rollback
    return dbError(e2.message)
  }

  await db.from('produce_lots')
    .update({ status: 'auctioned', updated_at: new Date().toISOString() })
    .eq('id', body.lot_id)

  await audit(user!.id, 'AUCTION', 'auctions', auction.id, { total, percent, commission })
  return NextResponse.json({ ...auction, commission_amount: commission, percent, net_weight: w.net_weight }, { status: 201 })
}
