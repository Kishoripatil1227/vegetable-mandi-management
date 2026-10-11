 import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(['admin'])
  if (error) return error
  const { id } = await params
  const db = supabaseAdmin()

  const { data: s } = await db.from('settlements').select('*').eq('id', id).single()
  if (!s) return NextResponse.json({ error: 'Settlement not found' }, { status: 404 })
  if (s.payment_status !== 'pending')
    return NextResponse.json({ error: `Already ${s.payment_status}` }, { status: 409 })

  const { data, error: e } = await db.from('settlements')
    .update({
      payment_status: 'paid',
      paid_date: new Date().toISOString().slice(0, 10),
      finalized_by: user!.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (e) return dbError(e.message)

  await db.from('produce_lots')
    .update({ status: 'settled', updated_at: new Date().toISOString() })
    .eq('id', s.lot_id)

  await audit(user!.id, 'SETTLEMENT_FINALIZE', 'settlements', id, { net: s.net_payable })
  return NextResponse.json(data)
}
