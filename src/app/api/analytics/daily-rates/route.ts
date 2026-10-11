 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error

  const veg = new URL(req.url).searchParams.get('vegetable_id')
  let q = supabaseAdmin()
    .from('price_history')
    .select('rate_date,avg_rate,source,vegetables(name)')
    .order('rate_date')
  if (veg) q = q.eq('vegetable_id', veg)

  const { data, error: e } = await q
  if (e) return dbError(e.message)
  return NextResponse.json(data)
}
