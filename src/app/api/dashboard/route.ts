 import { NextResponse } from 'next/server'
import { requireRole, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { error } = await requireRole(['admin', 'staff'])
  if (error) return error
  const db = supabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const [lotsToday, farmers, pending, auctions, comms, statuses] = await Promise.all([
    db.from('produce_lots').select('id', { count: 'exact', head: true }).eq('lot_date', today),
    db.from('farmers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('settlements').select('net_payable').eq('payment_status', 'pending'),
    db.from('auctions').select('total_amount'),
    db.from('commissions').select('commission_amount'),
    db.from('produce_lots').select('status'),
  ])

  const err = [lotsToday, farmers, pending, auctions, comms, statuses].find((r) => r.error)
  if (err?.error) return dbError(err.error.message)

  const sum = (rows: any[] | null, k: string) =>
    Math.round((rows || []).reduce((a, r) => a + Number(r[k]), 0) * 100) / 100

  const byStatus: Record<string, number> = {}
  statuses.data?.forEach((l) => { byStatus[l.status] = (byStatus[l.status] || 0) + 1 })

  return NextResponse.json({
    lots_today: lotsToday.count || 0,
    active_farmers: farmers.count || 0,
    pending_count: pending.data?.length || 0,
    pending_amount: sum(pending.data, 'net_payable'),
    total_sales: sum(auctions.data, 'total_amount'),
    total_commission: sum(comms.data, 'commission_amount'),
    by_status: byStatus,
  })
}
