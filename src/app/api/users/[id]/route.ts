import { NextResponse } from 'next/server'
import { requireRole, audit, dbError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(['admin'])
  if (error) return error
  const { id } = await params
  const body = await req.json()

  if (!['admin', 'staff', 'customer'].includes(body.role))
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  if (id === user!.id)
    return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })

  const { error: e } = await supabaseAdmin()
    .from('profiles')
    .update({ role: body.role, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (e) return dbError(e.message)

  await audit(user!.id, 'ROLE_CHANGE', 'profiles', id, { role: body.role })
  return NextResponse.json({ ok: true })
}