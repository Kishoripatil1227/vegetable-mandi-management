 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const sp = new URL(req.url).searchParams
  const search = sp.get('search') || ''
  const status = sp.get('status') || ''
  const from = sp.get('from') || ''
  const to = sp.get('to') || ''
  const page = Number(sp.get('page') || 1)
  const size = 10

  let q = supabaseAdmin()
    .from('produce_lots')
    .select(
      `id, lot_no, quantity, lot_date, status,
       farmers(name,phone), vegetables(name),
       weighments(net_weight),
       auctions(rate_per_kg,total_amount, buyers(name), commissions(commission_amount)),
       settlements(net_payable,payment_status,paid_date)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * size, page * size - 1)

  if (search) q = q.ilike('lot_no', `%${search}%`)
  if (status) q = q.eq('status', status)
  if (from) q = q.gte('lot_date', from)
  if (to) q = q.lte('lot_date', to)

  const { data, count, error: e } = await q
  if (e) return dbError(e.message)
  return NextResponse.json({ data, total: count, page, size })
}
