 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const sp = new URL(req.url).searchParams
  const from = sp.get('from') || new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  const to = sp.get('to') || new Date().toISOString().slice(0, 10)

  const { data, error: e } = await supabaseAdmin()
    .from('auctions')
    .select('auction_date,total_amount, commissions(commission_amount), produce_lots(vegetables(name), farmers(name))')
    .gte('auction_date', from)
    .lte('auction_date', to)
    .order('auction_date')
  if (e) return dbError(e.message)

  const one = (v: any) => (Array.isArray(v) ? v[0] : v)
  const daily: Record<string, { sales: number; commission: number; count: number }> = {}
  const veg: Record<string, number> = {}

  data.forEach((a: any) => {
    const c = Number(one(a.commissions)?.commission_amount || 0)
    const t = Number(a.total_amount)
    daily[a.auction_date] ||= { sales: 0, commission: 0, count: 0 }
    daily[a.auction_date].sales += t
    daily[a.auction_date].commission += c
    daily[a.auction_date].count += 1
    const vn = one(one(a.produce_lots)?.vegetables)?.name || 'Unknown'
    veg[vn] = (veg[vn] || 0) + t
  })

  const totals = Object.values(daily).reduce(
    (a, d) => ({ sales: a.sales + d.sales, commission: a.commission + d.commission, count: a.count + d.count }),
    { sales: 0, commission: 0, count: 0 }
  )

  return NextResponse.json({ from, to, daily, by_vegetable: veg, totals })
}
