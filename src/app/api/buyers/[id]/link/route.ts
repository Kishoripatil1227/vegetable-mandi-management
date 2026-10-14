import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(['admin'])
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const db = supabaseAdmin()

  if (body.user_id) {
    const { data: p } = await db.from('profiles').select('role').eq('id', body.user_id).single()
    if (!p || p.role !== 'customer')
      return NextResponse.json({ error: 'Selected user is not a customer' }, { status: 400 })
  }

  const { error: e } = await db.from('buyers')
    .update({ user_id: body.user_id || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (e) return dbError(e.message)

  await audit(user!.id, 'BUYER_LINK', 'buyers', id, { user_id: body.user_id })
  return NextResponse.json({ ok: true })
}