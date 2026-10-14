import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { user, error } = await requireRole(['customer'])
  if (error) return error
  const db = supabaseAdmin()

  const { data: buyer } = await db
    .from('buyers').select('id,name').eq('user_id', user!.id).maybeSingle()
  if (!buyer) return NextResponse.json({ linked: false, data: [], summary: null })

  const { data, error: e } = await db
    .from('auctions')
    .select(`id, rate_per_kg, total_amount, auction_date,
      produce_lots(lot_no, vegetables(name), weighments(net_weight))`)
    .eq('buyer_id', buyer.id)
    .order('auction_date', { ascending: false })
    .limit(100)
  if (e) return dbError(e.message)

  const spent = (data || []).reduce((a, r) => a + Number(r.total_amount), 0)
  return NextResponse.json({
    linked: true,
    buyer: buyer.name,
    data,
    summary: { purchases: data?.length || 0, total_spent: Math.round(spent * 100) / 100 },
  })
}